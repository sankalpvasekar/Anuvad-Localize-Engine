import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, CheckCircle2, Loader2, Download, Mic2, Globe2, FileText, UploadCloud, Trash2,
  Sparkles, ChevronRight, Zap, Target, Play, Pause, Volume2, VolumeX, Archive
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
  { id: 'extraction', label: 'Audio Extraction', icon: Mic2, milestone: [0, 12.5], color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-200' },
  { id: 'detection', label: 'Language Detection', icon: Globe2, milestone: [12.5, 25], color: 'from-cyan-500 to-teal-400', shadow: 'shadow-cyan-200' },
  { id: 'domain', label: 'Domain Detection', icon: Target, milestone: [25, 37.5], color: 'from-emerald-500 to-green-400', shadow: 'shadow-emerald-200' },
  { id: 'transcription', label: 'Transcription Generation', icon: FileText, milestone: [37.5, 50], color: 'from-yellow-500 to-orange-400', shadow: 'shadow-yellow-200' },
  { id: 'translation', label: 'Parallel Translating', icon: RefreshCw, milestone: [50, 62.5], color: 'from-orange-500 to-red-400', shadow: 'shadow-orange-200' },
  { id: 'refinement', label: 'Transcript Refinement', icon: Sparkles, milestone: [62.5, 75], color: 'from-pink-500 to-fuchsia-400', shadow: 'shadow-pink-200' },
  { id: 'audio_gen', label: 'Audio Generation', icon: Zap, milestone: [75, 87.5], color: 'from-purple-500 to-indigo-400', shadow: 'shadow-purple-200' },
  { id: 'muxing', label: 'Mux with Video', icon: CheckCircle2, milestone: [87.5, 100], color: 'from-indigo-500 to-blue-400', shadow: 'shadow-indigo-200' },
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
            {isCompleted && (
               <div className="flex flex-wrap gap-1 mt-1">
                  {stage.id === 'detection' && (
                    <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md uppercase">Detected</span>
                  )}
                  {stage.id === 'domain' && (
                    <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md uppercase">Identified</span>
                  )}
               </div>
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

// ── Watch Mode (Integrated OTT Player) ──────────────────────────────────────
const WatchMode = ({ task }: { task: Project }) => {
  const [selectedLang, setSelectedLang] = React.useState('original');
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [volume, setVolume] = React.useState(1);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Sync Logic
  React.useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    const sync = () => {
      setProgress((video.currentTime / video.duration) * 100);
      if (selectedLang !== 'original' && audio) {
        if (Math.abs(audio.currentTime - video.currentTime) > 0.15) {
          audio.currentTime = video.currentTime;
        }
      }
    };

    video.addEventListener('timeupdate', sync);
    return () => video.removeEventListener('timeupdate', sync);
  }, [selectedLang]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        audioRef.current?.pause();
      } else {
        videoRef.current.play();
        if (selectedLang !== 'original') audioRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!video) return;

    const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://127.0.0.1:8000' 
      : `http://${window.location.hostname}:8000`;

    if (lang === 'original') {
      video.muted = false;
      video.volume = volume;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    } else {
      video.muted = true; // Hard mute original to prevent mixing
      video.volume = 0;
      if (audio) {
        const audioPath = task.translations?.[lang]?.audio_path || task.audio_tracks?.[lang];
        audio.src = `${backendUrl}${audioPath}`;
        audio.currentTime = video.currentTime;
        audio.volume = volume;
        if (isPlaying) audio.play();
      }
    }
  };

  const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://127.0.0.1:8000' 
    : `http://${window.location.hostname}:8000`;

  return (
    <div className="space-y-6">
      <div className="aspect-video bg-[#1a1a2e] rounded-[2.5rem] overflow-hidden relative group border border-white/5 shadow-2xl">
        <video 
          ref={videoRef}
          src={`${backendUrl}${task.video_url}`}
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <audio ref={audioRef} className="hidden" />

        {/* Player Controls */}
        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity space-y-4">
          <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
             <div className="h-full bg-purple-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 border border-white/10">
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
            </button>
            <div className="flex items-center gap-2">
               <Volume2 size={16} className="text-white/60" />
               <input 
                  type="range" min="0" max="1" step="0.1" value={volume} 
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (selectedLang === 'original' && videoRef.current) videoRef.current.volume = v;
                    if (selectedLang !== 'original' && audioRef.current) audioRef.current.volume = v;
                  }}
                  className="w-20 accent-purple-500"
                />
            </div>
          </div>
        </div>

        {/* OTT Switcher Overlay */}
        <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
           <div className="bg-black/40 backdrop-blur-xl p-1 rounded-2xl border border-white/10 flex flex-col gap-1">
              <button 
                onClick={() => handleLanguageChange('original')}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-2 transition-all
                ${selectedLang === 'original' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                <Globe2 size={12} /> Original (EN)
              </button>
              {task.target_languages?.map(lang => (
                <button 
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-2 transition-all
                  ${selectedLang === lang ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  <RefreshCw size={12} /> {LANG_NAMES[lang] || lang} Dub
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4">
         <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
               {['en', ...(task.target_languages || [])].map(l => (
                 <div key={l} title={LANG_NAMES[l]} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] uppercase font-black text-gray-500">
                    {l}
                 </div>
               ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
               {task.target_languages?.length || 0} Tracks Optimized
            </span>
         </div>
         <a 
          href={`${backendUrl}${task.video_url}`} download
          className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all"
         >
           <Download size={14} /> Download Final Multi-track
         </a>
      </div>
    </div>
  );
};

// ── Asset Studio (Diagnostic Raw Access) ────────────────────────────────────
const AssetStudio = ({ task }: { task: Project }) => {
  const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://127.0.0.1:8000' 
    : `http://${window.location.hostname}:8000`;
  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Source Assets */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-4">AI Extraction Deliverables</h4>
          <div className="p-8 rounded-[3rem] bg-gray-50/50 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Mic2 size={16} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase">Source Audio</p>
                    <p className="text-[9px] text-gray-400 font-bold">Extracted RAW WAV</p>
                  </div>
               </div>
               {task.audio_url && (
                 <a href={`${backendUrl}${task.audio_url}`} download className="p-2 hover:bg-gray-50 rounded-lg text-blue-600 transition-all"><Download size={18} /></a>
               )}
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FileText size={16} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase">Source Script</p>
                    <p className="text-[9px] text-gray-400 font-bold">Refined Neural Text</p>
                  </div>
               </div>
               {task.transcript && (
                 <button onClick={() => downloadTextFile(task.transcript || "", `Original_Script_${task.id}.txt`)} className="p-2 hover:bg-gray-50 rounded-lg text-emerald-600 transition-all"><Download size={18} /></button>
               )}
            </div>
          </div>
        </div>

        {/* Localized Assets */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 px-4">Neural Synthesis Deliverables</h4>
          <div className="p-8 rounded-[3rem] bg-purple-50/20 border border-purple-100 space-y-6">
            {task.translations && Object.keys(task.translations).length > 0 ? (
              Object.entries(task.translations).map(([lang, data]) => (
                <div key={lang} className="space-y-3">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-purple-600 text-white rounded-md shadow-sm">{LANG_NAMES[lang] || lang} track</span>
                     <div className="h-px flex-1 bg-purple-100" />
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <a 
                        href={`${backendUrl}${data.audio_path}`} 
                        download 
                        className="flex items-center justify-center gap-2 py-3 bg-white border border-purple-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-purple-600 hover:bg-purple-50 transition-all"
                      >
                         <Mic2 size={12} /> High-Fidelity Dub
                      </a>
                      <button 
                        onClick={() => downloadTextFile(data.transcript || "", `${lang.toUpperCase()}_Script_${task.id}.txt`)}
                        className="flex items-center justify-center gap-2 py-3 bg-white border border-purple-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-purple-600 hover:bg-purple-50 transition-all"
                      >
                         <FileText size={12} /> Localized Text
                      </button>
                   </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center opacity-30">
                 <Archive size={32} className="mx-auto mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest">No target tracks generated</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-8 rounded-[3rem] bg-[#1a1a2e] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <Archive size={20} />
            </div>
            <div>
               <h3 className="text-sm font-black uppercase tracking-[0.2em]">Package Inspector</h3>
               <p className="text-[10px] text-white/40 font-bold uppercase">Multi-track OTT Container Deliverable</p>
            </div>
         </div>
         <a 
          href={`http://localhost:8000${task.video_url}`} 
          download 
          className="flex items-center gap-3 px-10 py-4 bg-white text-[#1a1a2e] rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all"
         >
            <Download size={16} /> Finalize Full Download
         </a>
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

  // ── Tab & Smooth Progress Logic ──────────────────────────────────────
  const [activeTab, setActiveTab] = React.useState<'pipeline' | 'watch' | 'assets'>(isDone ? 'watch' : 'pipeline');
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

              {task.detected_language && (
                <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-[0.15em] shadow-sm">
                  🌐 Source: {langLabel(task.detected_language)}
                </span>
              )}
              {isFailed && (
                <span className="px-4 py-1.5 rounded-full text-[10px] font-bold text-red-500 bg-red-50 border border-red-200">
                  {task.stage}
                </span>
              )}
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
              {task.domain && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="px-4 py-1.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5"
                >
                  <Target size={12} /> {task.domain.toUpperCase()}
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


        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1.5 bg-gray-100/50 rounded-2xl w-max mx-auto border border-gray-200/50">
          {[
            { id: 'pipeline', label: 'Engine Status', icon: Zap },
            { id: 'watch', label: 'OTT Watch', icon: Play, disabled: !isDone },
            { id: 'assets', label: 'Asset Studio', icon: Archive, disabled: !isDone }
          ].map((tab) => (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
                ${activeTab === tab.id 
                  ? 'bg-white text-purple-600 shadow-sm border border-purple-100' 
                  : (tab.disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600')}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Granular Pipeline Section */}
        {activeTab === 'pipeline' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative p-8 bg-gray-50/50 rounded-[3rem] border border-gray-100">
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
        )}

        {/* Contextual Action Areas */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-4"
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

                {/* ── Neural Intelligence Hub ── */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 rounded-[3.5rem] bg-white border border-purple-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] space-y-8"
                >
                  <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-200">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#1a1a2e] uppercase tracking-[0.2em]">Neural Intelligence Hub</h4>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                          Context: <span className="text-purple-600">{langLabel(task.detected_language)}</span> → <span className="text-purple-600">{task.target_languages?.map(l => langLabel(l)).join(', ')}</span>
                        </p>
                      </div>
                    </div>
                    
                    {task.domain && (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl"
                      >
                        <Target size={12} className="text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{task.domain}</span>
                      </motion.div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Original Transcript */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Neural Transcript (Original)</span>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-gray-50/50 border border-gray-100 min-h-[120px] max-h-[250px] overflow-y-auto custom-scrollbar">
                        <p className="text-xs text-[#1a1a2e] leading-relaxed font-bold italic opacity-80">
                          {task.transcript || "Awaiting neural synthesis..."}
                        </p>
                      </div>
                    </div>

                    {/* Target Transcripts */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Track Pipeline (Localized)</span>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-purple-50/30 border border-purple-100 min-h-[120px] max-h-[250px] overflow-y-auto custom-scrollbar space-y-6">
                        {task.translations && Object.keys(task.translations).length > 0 ? (
                          Object.entries(task.translations).map(([lang, text]) => (
                            <div key={lang} className="space-y-2 group/trans">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black px-2 py-0.5 bg-purple-600 text-white rounded-md uppercase shadow-sm">
                                  {LANG_NAMES[lang] || lang}
                                </span>
                                <div className="h-px flex-1 bg-purple-100 scale-x-0 group-hover/trans:scale-x-100 transition-transform origin-left" />
                              </div>
                              <p className="text-xs text-purple-900 leading-relaxed font-bold italic opacity-90">
                                {text}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 opacity-30">
                            <RefreshCw size={24} className="animate-spin mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Translating...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
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
                onClick={() => {
                  if (task.video_url) {
                    const link = document.createElement('a');
                    link.href = `http://localhost:8000${task.video_url}`;
                    link.download = `${task.title}_Localized.mp4`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    alert('Video not yet ready for download.');
                  }
                }}
                className="flex items-center justify-center gap-3 py-4 rounded-2xl
                  bg-[#1a1a2e] text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-gray-200"
              >
                <Download size={16} /> Download Video
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

        {/* Tab Content: OTT Watch */}
        {activeTab === 'watch' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
             <WatchMode task={task} />
          </motion.div>
        )}

        {/* Tab Content: Asset Studio */}
        {activeTab === 'assets' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AssetStudio task={task} />
          </motion.div>
        )}
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
