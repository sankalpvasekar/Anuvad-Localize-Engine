import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, Clock, Languages, CheckCircle2, AlertCircle,
  Loader2, Download, Mic2, Globe2, FileText, UploadCloud
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
  { id: 'extraction',    label: 'Audio Extraction',    icon: Mic2,      range: [0, 30]  as [number,number] },
  { id: 'detection',     label: 'Language Detection',  icon: Globe2,    range: [30, 60] as [number,number] },
  { id: 'transcription', label: 'Transcript Generation', icon: FileText, range: [60, 100] as [number,number] },
];

// ── Single Task Card ─────────────────────────────────────────────────────────
const TaskCard = ({ task }: { task: Project }) => {
  const isDone   = task.status === 'Completed' || task.status === 'done';
  const isFailed = task.status === 'Failed';
  const detectedLang = langLabel(task.detected_language);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className={`group relative rounded-[3rem] border border-white/50 shadow-[0_16px_48px_rgba(100,83,130,0.06)]
        backdrop-blur-3xl overflow-hidden transition-shadow duration-500
        hover:shadow-[0_40px_80px_-16px_rgba(100,83,130,0.14)]
        ${isDone ? 'bg-white/70' : isFailed ? 'bg-red-50/60' : 'bg-white/60'}`}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${isDone ? 'bg-emerald-400' : isFailed ? 'bg-red-400' : 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500'}`} />

      <div className="p-8 space-y-7">
        {/* ── Header row ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="text-xl font-black text-[#1a1a2e] truncate group-hover:text-purple-700 transition-colors">
              {task.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {/* Status badge */}
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                ${isDone ? 'bg-emerald-100 text-emerald-700'
                  : isFailed ? 'bg-red-100 text-red-600'
                  : 'bg-purple-100 text-purple-700'}`}>
                {isDone ? 'Completed' : isFailed ? 'Failed' : task.status}
              </span>
              {/* Type badge */}
              <span className="px-3 py-1 rounded-full text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100">
                {task.type}
              </span>
              {/* Detected language badge — appears after stage 2 */}
              <AnimatePresence>
                {detectedLang && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <Globe2 size={10} /> Detected: {detectedLang}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Progress % */}
          <div className={`text-4xl font-black tracking-tighter tabular-nums
            ${isDone ? 'text-emerald-500' : isFailed ? 'text-red-500' : 'text-purple-600'}`}>
            {task.progress}%
          </div>
        </div>

        {/* ── Pipeline Stages ─────────────────────────────────────── */}
        <div className="space-y-3">
          {STAGES.map((s) => {
            const stageComplete = task.progress > s.range[1] || isDone;
            const stageActive   = task.progress >= s.range[0] && task.progress <= s.range[1] && !isDone;
            const Icon = s.icon;

            return (
              <motion.div
                key={s.id}
                layout
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300
                  ${stageComplete ? 'bg-emerald-50/60 border-emerald-100'
                    : stageActive ? 'bg-purple-50 border-purple-200 shadow-sm'
                    : 'bg-gray-50/60 border-gray-100'}`}
              >
                {/* Stage icon circle */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                  ${stageComplete ? 'bg-emerald-500 text-white shadow shadow-emerald-300'
                    : stageActive ? 'bg-purple-600 text-white shadow shadow-purple-300 animate-pulse'
                    : 'bg-gray-200 text-gray-400'}`}>
                  {stageComplete ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                </div>

                {/* Stage label + sub-info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-black uppercase tracking-widest
                    ${stageComplete ? 'text-emerald-700' : stageActive ? 'text-purple-700' : 'text-gray-400'}`}>
                    {s.label}
                  </p>

                  {/* Extra info per stage */}
                  {s.id === 'detection' && detectedLang && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-[11px] font-bold text-blue-600 mt-0.5">
                      🎯 Source language identified: <strong>{detectedLang}</strong>
                    </motion.p>
                  )}
                  {s.id === 'extraction' && task.audio_url && (
                    <motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      href={`http://localhost:8000${task.audio_url}`}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-800 mt-0.5 underline underline-offset-2"
                    >
                      <Download size={11} /> Download extracted audio
                    </motion.a>
                  )}
                  {s.id === 'transcription' && task.transcript && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-[11px] font-medium text-gray-500 mt-0.5 truncate">
                      "{task.transcript.substring(0, 80)}…"
                    </motion.p>
                  )}
                </div>

                {/* Spinner for active stage */}
                {stageActive && (
                  <RefreshCw size={14} className="text-purple-400 animate-spin flex-shrink-0" />
                )}
                {stageComplete && (
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── Progress Bar ─────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${task.progress}%` }}
              transition={{ duration: 1.2, ease: 'circOut' }}
              className={`h-full rounded-full relative overflow-hidden
                ${isDone ? 'bg-emerald-400' : isFailed ? 'bg-red-400' : 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600'}`}
            >
              {!isDone && !isFailed && (
                <motion.div
                  animate={{ x: ['100%', '-200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-white/30 skew-x-[-20deg] w-1/2"
                />
              )}
            </motion.div>
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><Clock size={10} /> {task.timeRemaining}</span>
              <span className="flex items-center gap-1"><Languages size={10} /> {task.lang}</span>
            </div>
            <span className="italic normal-case font-medium text-gray-500">{task.stage}</span>
          </div>
        </div>

        {/* ── Download Audio CTA (prominent, post-extraction) ──────── */}
        <AnimatePresence>
          {task.audio_url && (
            <motion.a
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              href={`http://localhost:8000${task.audio_url}`}
              download
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl
                bg-purple-50 border border-purple-200 text-purple-700 font-black text-xs
                uppercase tracking-widest hover:bg-purple-100 transition-colors"
            >
              <Download size={16} /> Download Extracted Audio (.wav)
            </motion.a>
          )}
        </AnimatePresence>

        {/* ── Transcript block (post-completion) ─────────────────── */}
        <AnimatePresence>
          {task.transcript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-50/80 border border-gray-200 rounded-2xl p-5 space-y-2"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <FileText size={12} /> Generated Transcript
              </p>
              <p className="text-sm text-gray-700 leading-relaxed font-medium line-clamp-6">
                {task.transcript}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ── Main Processing Page ─────────────────────────────────────────────────────
const Processing = () => {
  const { projects, loading } = useProjects();
  const navigate = useNavigate();

  const active = projects.filter(p =>
    p.status === 'Processing' || p.status === 'Initializing' ||
    p.status === 'Completed' || p.status === 'done' || p.status === 'Failed'
  );
  const processingCount = active.filter(p => p.status === 'Processing').length;

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-[#1a1a2e]">Processing Pipeline ⚙️</h1>
          <p className="text-gray-400 font-bold">Watch your AI-powered localizations in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          {processingCount > 0 && (
            <div className="bg-purple-50 border border-purple-200 px-5 py-2.5 rounded-2xl flex items-center gap-2 text-purple-700 font-black text-[10px] uppercase tracking-widest">
              <Loader2 size={14} className="animate-spin" />
              {processingCount} Active
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg"
          >
            <UploadCloud size={14} /> New Upload
          </motion.button>
        </div>
      </motion.div>

      {/* Task List */}
      <div className="space-y-6 min-h-[400px]">
        <AnimatePresence mode="popLayout" initial={false}>
          {loading ? (
            <>
              <TaskSkeleton key="s1" />
              <TaskSkeleton key="s2" />
            </>
          ) : active.length > 0 ? (
            active.map(task => <TaskCard key={task.id} task={task} />)
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-24 text-center space-y-6"
            >
              <div className="w-28 h-28 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-purple-200">
                <RefreshCw size={56} strokeWidth={1} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-600">No active jobs</h3>
                <p className="text-gray-400 font-bold">Upload a video to start processing.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/upload')}
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg mt-4"
              >
                <UploadCloud size={16} /> Upload Video
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-[#1a1a2e] to-[#2d1b4e] p-10 rounded-[3rem] border border-white/10 shadow-2xl text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 blur-[80px] -z-10" />
        <div className="space-y-4 relative z-10 flex-1">
          <div className="inline-flex items-center gap-2 bg-white/10 px-5 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] text-purple-200 border border-white/5">
            <AlertCircle size={12} className="text-orange-400" /> How It Works
          </div>
          <h3 className="text-3xl font-black tracking-tight leading-tight">3 Stages. Real-time Updates.</h3>
          <p className="text-purple-100/60 font-bold max-w-md leading-relaxed">
            Audio is extracted first, then language is detected automatically from the content,
            and finally a full transcript is generated in the detected language.
          </p>
        </div>
        <div className="space-y-3 flex-shrink-0 relative z-10">
          {STAGES.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 text-white/70 text-sm font-bold">
              <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-xs font-black text-purple-300">
                {i + 1}
              </div>
              {s.label}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Processing;
