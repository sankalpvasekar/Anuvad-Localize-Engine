import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

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
  preview?: string;
  is_community?: boolean;
  date?: string;
  created_at?: string;
}

interface ProjectContextType {
  projects: Project[];
  communityProjects: Project[];
  loading: boolean;
  addProject: (project: Partial<Project>) => Promise<Project | null>;
  updateProject: (id: string | number, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string | number) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const API_BASE = 'http://localhost:8000/projects';

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [communityProjects, setCommunityProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Fetch user's active projects
      const res = await fetch(`${API_BASE}?user_id=guest`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
      
      // Fetch community discovery
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
  }, []);

  const addProject = async (projectData: Partial<Project>) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (res.ok) {
        const newProject = await res.json();
        setProjects(prev => [newProject, ...prev]);
        return newProject;
      }
    } catch (e) {
      console.error('Add failed', e);
    }
    return null;
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
