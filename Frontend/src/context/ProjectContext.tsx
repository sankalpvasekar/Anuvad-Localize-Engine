import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

export interface Project {
  id: string | number;
  user_id?: string;
  title: string;
  lang: string;
  type: string;
  size: string;
  status: string;
  progress: number;
  timeRemaining: string;
  stage: string;
  transcript?: string;
  preview?: string;
  audio_url?: string;
  video_url?: string;
  /** Mapping of language codes to audio URLs if stored separately */
  audio_tracks?: Record<string, string>;
  /** Mapping of language codes to localized deliverables (transcript + audio) */
  translations?: Record<string, { transcript: string; audio_path: string }>;
  detected_language?: string;
  domain?: string;
  is_community?: boolean;
  date?: string;
  created_at?: string;
}

interface ProjectContextType {
  projects: Project[];
  communityProjects: Project[];
  loading: boolean;
  addProject: (project: Partial<Project>, file?: File) => Promise<Project | null>;
  updateProject: (id: string | number, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string | number) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://127.0.0.1:8000' 
  : `http://${window.location.hostname}:8000`;

const API_BASE = `${BACKEND_URL}/projects`;
const TRANSCRIBE_URL = `${BACKEND_URL}/transcribe/`;
const POLL_INTERVAL_MS = 3000;

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [communityProjects, setCommunityProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  // Track active polling intervals keyed by project id
  const pollingRefs = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('DEBUG: Fetching projects for user: guest');
      const res = await fetch(`${API_BASE}?user_id=guest`);
      if (res.ok) {
        const data: Project[] = await res.json();
        console.log(`DEBUG: Loaded ${data.length} projects from MongoDB`);
        setProjects(data);
        
        // Auto-resume polling for any projects that are still processing
        data.forEach(p => {
          if (p.status === 'Processing' || p.status === 'Initializing') {
            console.log(`DEBUG: Resuming polling for active project: ${p.id}`);
            startPolling(String(p.id));
          }
        });
      }
      const comRes = await fetch(`${API_BASE}?is_community=true`);
      if (comRes.ok) {
        setCommunityProjects(await comRes.json());
      }
    } catch (e) {
      console.error('Failed to fetch projects', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    return () => {
      // Clear all polling on unmount
      pollingRefs.current.forEach(interval => clearInterval(interval));
    };
  }, []);

  /** Start polling a project by its MongoDB id until it's Completed or Failed */
  const startPolling = (projectId: string) => {
    if (pollingRefs.current.has(projectId)) return; // already polling

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/${projectId}`);
        if (!res.ok) return;
        const updated: Project = await res.json();

        setProjects(prev =>
          prev.map(p => (p.id === projectId ? { ...p, ...updated } : p))
        );

        if (updated.status === 'Completed' || updated.status === 'Failed') {
          clearInterval(interval);
          pollingRefs.current.delete(projectId);
        }
      } catch (e) {
        console.error('Polling error for', projectId, e);
      }
    }, POLL_INTERVAL_MS);

    pollingRefs.current.set(projectId, interval);
  };

  const addProject = async (projectData: Partial<Project>, file?: File): Promise<Project | null> => {
    if (!file) return null;

    // Optimistic local entry shown immediately
    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic: Project = {
      id: optimisticId,
      title: projectData.title || file.name,
      lang: 'Detecting...',
      type: projectData.type || 'AI Dubbing',
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      status: 'Processing',
      progress: 5,
      timeRemaining: 'Calculating...',
      stage: 'Audio Extraction',
      created_at: new Date().toISOString(),
    };
    setProjects(prev => [optimistic, ...prev]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      // Pass target languages as JSON array string for the backend
      if (projectData.target_languages && projectData.target_languages.length > 0) {
        formData.append('target_languages', JSON.stringify(projectData.target_languages));
      }

      const res = await fetch(TRANSCRIBE_URL, { method: 'POST', body: formData });
      if (!res.ok) {
        setProjects(prev => prev.map(p => p.id === optimisticId ? { ...p, status: 'Failed', stage: 'Upload Failed' } : p));
        return null;
      }

      const { project_id } = await res.json();

      // Replace the optimistic entry with the real project_id
      setProjects(prev =>
        prev.map(p => p.id === optimisticId ? { ...p, id: project_id } : p)
      );

      // Begin polling DB for live status updates
      startPolling(project_id);

      return { ...optimistic, id: project_id };
    } catch (e) {
      console.error('Processing failed', e);
      setProjects(prev => prev.map(p => p.id === optimisticId ? { ...p, status: 'Failed', stage: 'Connection Error' } : p));
      return null;
    }
  };

  const updateProject = async (id: string | number, updates: Partial<Project>) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      }
    } catch (e) {
      console.error('Update failed', e);
    }
  };

  const deleteProject = async (id: string | number) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        const idStr = String(id);
        if (pollingRefs.current.has(idStr)) {
          clearInterval(pollingRefs.current.get(idStr));
          pollingRefs.current.delete(idStr);
        }
      }
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      communityProjects,
      loading,
      addProject,
      updateProject,
      deleteProject,
      refreshProjects: fetchProjects
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
