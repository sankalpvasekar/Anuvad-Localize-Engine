import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, CheckCircle2, Loader2, Download, Mic2, Globe2, FileText, UploadCloud, Trash2,
  Sparkles, ChevronRight, Zap, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import type { Project } from '../context/ProjectContext';
import { TaskSkeleton } from '../components/SkeletonLoader';

// ── Language code → display name map ───────────────────────────────────────
const LANG_NAMES: Record<string, string> = {
  hi: 'Hindi', mr: 'Marathi', gu: 'Gujarati', ta: 'Tamil',
  te: 'Telugu', kn: 'Kannada', en: 'English', unknown: 'Unknown'
};

const langLabel = (code: string | undefined) => {
  if (!code) return null;
  return LANG_NAMES[code] ?? code.toUpperCase();
};

// ── Individual pipeline stage definition ────────────────────────────────────
const STAGES = [
  { id: 'extraction', label: 'Audio Extraction', icon: Mic2, milestone: [0, 30], color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-200' },
  { id: 'detection', label: 'Language Detection', icon: Globe2, milestone: [30, 65], color: 'from-indigo-500 to-purple-400', shadow: 'shadow-indigo-200' },
  { id: 'transcription', label: 'Transcription', icon: FileText, milestone: [65, 100], color: 'from-fuchsia-500 to-pink-500', shadow: 'shadow-fuchsia-200' },
];

// ── Stage Row Component ─────────────────────────────────────────────────────
const StageRow = ({ stage, globalProgress, isDone, isFailed }: { stage: typeof STAGES[0], globalProgress: number, isDone: boolean, isFailed: boolean }) => {
  const [start, end] = stage.milestone;
  
  // Calculate local progress (0 - 100)
  const localProgressRaw = ((globalProgress - start) / (end - start)) * 100;
  const localProgress = Math.min(100, Math.max(0, localProgressRaw));
  
  const isActive = globalProgress > start && globalProgress < end && !isDone && !isFailed;
  const isCompleted = globalProgress >= end || isDone;
  
  const Icon = stage.icon;

  return (
    <div className="relative group/row">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-all duration-500 ${isCompleted ? 'bg-emerald-100 text-emerald-600' : isActive ? 'bg-purple-100 text-purple-600 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
            <Icon size={16} />
          </div>
          <div>
            <p className={`text-[11px] font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-700' : isActive ? 'text-purple-700' : 'text-gray-400'}`}>
              {stage.label}
            </p>
            {isActive && (
              <motion.span 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[9px] font-bold text-purple-400 flex items-center gap-1"
              >
                <Zap size={10} className="fill-current" /> Processing step...
              </motion.span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs font-black tabular-nums transition-colors duration-500 ${isCompleted ? 'text-emerald-500' : isActive ? 'text-purple-600' : 'text-gray-300'}`}>
            {Math.round(localProgress)}%
          </span>
        </div>
      </div>

      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${localProgress}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 60 }}
          className={`h-full bg-gradient-to-r ${stage.color} rounded-full relative`}
        >
          {isActive && (
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute inset-0 bg-white/30 skew-x-12"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

// ── Single Task Card ─────────────────────────────────────────────────────────
const TaskCard = ({ task, onDelete }: { task: Project, onDelete: (id: string | number) => void }) => {
  const isDone = task.status === 'Completed' || task.status === 'done';
  const isFailed = task.status === 'Failed';
  const isProcessing = task.status === 'Processing' || task.status === 'Initializing';
  const detectedLang = langLabel(task.detected_language);

  // ── Smooth "Creeping" Progress Logic ──────────────────────────────────────
  const [smoothProgress, setSmoothProgress] = React.useState(task.progress);

  React.useEffect(() => {
    if (task.progress > smoothProgress) {
      const diff = task.progress - smoothProgress;
      const step = Math.max(0.2, diff / 25);
      const timer = setInterval(() => {
        setSmoothProgress(prev => {
          const next = prev + step;
          if (next >= task.progress) {
            clearInterval(timer);
            return task.progress;
          }
          return next;
        });
      }, 30);
      return () => clearInterval(timer);
    }

    if (isProcessing && smoothProgress < 99) {
      const creepTimer = setInterval(() => {
        setSmoothProgress(prev => {
          // Slow down creep if we're near milestones to avoid jumping
          const isNearMilestone = STAGES.some(s => Math.abs(prev - s.milestone[1]) < 0.5);
          if (!isNearMilestone) return prev + 0.05;
          return prev;
        });
      }, 800);
      return () => clearInterval(creepTimer);
    }
  }, [task.progress, isProcessing]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      className={`group relative rounded-[3.5rem] p-1 border-2 transition-all duration-700
        ${isDone ? 'border-emerald-100 hover:border-emerald-300' 
          : isFailed ? 'border-red-100 hover:border-red-300' 
          : 'border-white/40 hover:border-purple-200'}
        shadow-[0_20px_60px_-15px_rgba(100,83,130,0.1)] hover:shadow-[0_40px_100px_-15px_rgba(100,83,130,0.2)]
        bg-white/80 backdrop-blur-3xl overflow-hidden`}
    >
      <div className="p-8 sm:p-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-purple-200">
                <Sparkles size={18} />
              </div>
              <h3 className="text-2xl font-black text-[#1a1a2e] truncate group-hover:text-purple-700 transition-colors">
                {task.title}
              </h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-sm
                ${isDone ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : isFailed ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
                {isDone ? '✨ Completed' : isFailed ? '❌ Failed' : `🔄 ${task.status}`}
              </span>
              <span className="px-4 py-1.5 rounded-full text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100">
                {task.type}
              </span>
              {detectedLang && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="px-4 py-1.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1.5"
                >
                  <Globe2 size={12} /> {detectedLang}
                </motion.span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90">
                <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-gray-100" />
                <motion.circle 
                  cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="226.2"
                  initial={{ strokeDashoffset: 226.2 }}
                  animate={{ strokeDashoffset: 226.2 - (226.2 * smoothProgress) / 100 }}
                  className={`${isDone ? 'text-emerald-500' : isFailed ? 'text-red-500' : 'text-purple-600'}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-xl font-black text-[#1a1a2e]">{Math.round(smoothProgress)}%</span>
                <span className="text-[8px] font-black uppercase text-gray-400 tracking-tighter">Overall</span>
              </div>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
              title="Delete Project"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Granular Pipeline Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative p-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100">
          {STAGES.map((stage) => (
            <StageRow 
              key={stage.id} 
              stage={stage} 
              globalProgress={smoothProgress} 
              isDone={isDone} 
              isFailed={isFailed}
            />
          ))}
        </div>

        {/* Contextual Action Areas */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-3xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Loader2 size={16} className="text-indigo-600 animate-spin" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700">
                      System Engine: <span className="text-indigo-400">{task.stage}</span>
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div 
                        key={i} animate={{ opacity: [0.3, 1, 0.3] }} 
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        className="w-1.5 h-1.5 rounded-full bg-indigo-500" 
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isDone && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {task.audio_url && (
                <motion.a
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href={`http://localhost:8000${task.audio_url}`}
                  download
                  className="flex items-center justify-center gap-3 py-4 rounded-2xl
                    bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-100"
                >
                  <Download size={16} /> Get Extracted Audio
                </motion.a>
              )}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-3 py-4 rounded-2xl
                  bg-[#1a1a2e] text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-gray-200"
              >
                <Target size={16} /> Open in Studio
              </motion.button>
            </div>
          )}

          {isFailed && (
            <div className="p-5 rounded-3xl bg-red-50 border border-red-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-red-500 flex items-center justify-center text-white shrink-0">
                <Trash2 size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-red-700">Processing Failed</p>
                <p className="text-xs font-bold text-red-500 leading-tight">The engine encountered an error while analyzing your content. Please try re-uploading.</p>
              </div>
            </div>
          )}
        </div>

        {/* Transcript Preview */}
        <AnimatePresence>
          {task.transcript && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-2 border-gray-100 rounded-[2rem] p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <FileText size={14} className="text-purple-500" /> Neural Transcript
                </p>
                <span className="text-[9px] font-black bg-purple-100 text-purple-600 px-3 py-1 rounded-full uppercase">High Confidence</span>
              </div>
              <div className="relative">
                <p className="text-sm text-gray-700 leading-relaxed font-medium line-clamp-4">
                  {task.transcript}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ── Main Processing Page ─────────────────────────────────────────────────────
const Processing = () => {
  const { projects, loading, deleteProject } = useProjects();
  const navigate = useNavigate();

  const active = projects
    .filter(p =>
      p.status === 'Processing' || p.status === 'Initializing' ||
      p.status === 'Completed' || p.status === 'done' || p.status === 'Failed'
    )
    .sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da; // Recent first
    });

  const processingCount = active.filter(p => p.status === 'Processing' || p.status === 'Initializing' ).length;

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbff] py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-gray-100 pb-12"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Zap size={12} className="fill-current" /> Live Statistics
            </div>
            <h1 className="text-5xl font-black tracking-tight text-[#1a1a2e]">Processing Pipeline</h1>
            <p className="text-gray-400 font-bold text-lg">Real-time neural analysis and localization.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {processingCount > 0 && (
              <div className="bg-white border-2 border-purple-100 px-6 py-3 rounded-2xl flex items-center gap-3 text-purple-700 font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-50">
                <Loader2 size={16} className="animate-spin text-purple-500" />
                {processingCount} Active Engine{processingCount > 1 ? 's' : ''}
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/upload')}
              className="group flex items-center gap-3 bg-[#1a1a2e] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-gray-300"
            >
              <UploadCloud size={18} className="text-purple-400" /> New Upload
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>

        {/* Task List */}
        <div className="space-y-10 min-h-[500px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {loading ? (
              <React.Fragment key="loading">
                <TaskSkeleton key="s1" />
                <TaskSkeleton key="s2" />
              </React.Fragment>
            ) : active.length > 0 ? (
              active.map(task => <TaskCard key={task.id} task={task} onDelete={handleDelete} />)
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="py-32 text-center space-y-8 bg-white rounded-[4rem] border-2 border-dashed border-gray-100"
              >
                <div className="w-32 h-32 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-purple-200">
                  <RefreshCw size={64} strokeWidth={1.5} className="animate-spin-slow" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-[#1a1a2e]">Pipeline Idle</h3>
                  <p className="text-gray-400 font-bold text-lg">Your workspace is empty. Start a new localization to see the magic.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/upload')}
                  className="inline-flex items-center gap-3 bg-purple-600 text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-purple-200"
                >
                  <UploadCloud size={20} /> Initialize First Project
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Educational Footer Banner */}
        <motion.div
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1b4e] p-12 rounded-[4rem] border border-white/10 shadow-2xl text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[100px] -z-10" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 blur-[80px] -z-10" />
          
          <div className="space-y-6 relative z-10 flex-1">
            <div className="inline-flex items-center gap-2 bg-white/10 px-6 py-2 rounded-full font-black uppercase tracking-widest text-[11px] text-purple-300 border border-white/10">
              <Sparkles size={14} className="text-yellow-400" /> Neural Pipeline Architecture
            </div>
            <h3 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">State Monitoring. <br/>Precision Tracking.</h3>
            <p className="text-purple-100/60 font-bold max-w-xl text-lg leading-relaxed">
              Every request goes through our proprietary 3-stage neural pipeline: optimized WAV extraction, multi-lingual detection, and high-fidelity transcription.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 shrink-0 relative z-10 w-full lg:w-auto">
            {STAGES.map((s, i) => (
              <div key={s.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-lg">
                  {i + 1}
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-white/80">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Processing;
