import {
  UploadCloud as UploadIcon, ArrowRight,
  CheckCircle2, Mic, Type, FileAudio, Sparkles, RefreshCw, X, Check
} from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import ErrorToast from '../components/ErrorToast';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

interface Language {
  code: string;
  label: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'hi', label: 'Hindi',    flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi',  flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil',    flag: '🇮🇳' },
  { code: 'te', label: 'Telugu',   flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada',  flag: '🇮🇳' },
];

const TYPES = [
  { id: 'AI Dubbing',      icon: <Mic size={18} /> },
  { id: 'AI Subtitles',   icon: <Type size={18} /> },
  { id: 'Text To Speech', icon: <FileAudio size={18} /> },
];

const Upload = () => {
  const navigate = useNavigate();
  const { addProject } = useProjects();

  const [selectedType, setSelectedType] = useState('AI Dubbing');
  // Multi-select: set of language codes
  const [targetLangs, setTargetLangs] = useState<Set<string>>(new Set(['hi']));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Language toggle helpers ─────────────────────────────────────── */
  const toggleLang = (code: string) => {
    setTargetLangs(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        // Don't allow deselecting the last one
        if (next.size === 1) return prev;
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (targetLangs.size === LANGUAGES.length) {
      // Deselect all except first
      setTargetLangs(new Set([LANGUAGES[0].code]));
    } else {
      setTargetLangs(new Set(LANGUAGES.map(l => l.code)));
    }
  };

  const clearAll = () => setTargetLangs(new Set([LANGUAGES[0].code]));

  const allSelected = targetLangs.size === LANGUAGES.length;

  /* ── File handling ───────────────────────────────────────────────── */
  const handleFileSelect = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const validExts = ['mp4', 'mkv', 'mov', 'avi', 'webm', 'flv', 'wmv', '3gp', 'm4v'];
    if (file.type.startsWith('video/') || validExts.includes(ext)) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a valid video file (MP4, MKV, MOV, etc.)');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  /* ── Submit ──────────────────────────────────────────────────────── */
  const handleStart = async () => {
    if (!selectedFile) { setError('Please select a video file first.'); return; }
    if (targetLangs.size === 0) { setError('Please select at least one target language.'); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      await addProject(
        {
          title: selectedFile.name,
          lang: [...targetLangs].join(', '),
          type: selectedType,
          target_languages: [...targetLangs],
        },
        selectedFile,
      );
      navigate('/processing');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Selected language labels for summary badge ──────────────────── */
  const selectedLabels = LANGUAGES
    .filter(l => targetLangs.has(l.code))
    .map(l => `${l.flag} ${l.label}`);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-14 py-10 px-6"
    >
      <ErrorToast message={error} onClose={() => setError(null)} onRetry={handleStart} />

      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full text-purple-600 font-bold text-xs uppercase tracking-widest border border-purple-100">
          <Sparkles size={14} /> AI-Powered Localization
        </div>
        <h1 className="text-6xl font-black tracking-tight text-[#1a1a2e]">Start Localizing 🚀</h1>
        <p className="text-gray-400 text-xl font-medium max-w-xl mx-auto">
          Upload your video and pick one or more target languages.
        </p>
      </motion.div>

      {/* Type Selector */}
      <motion.div variants={itemVariants} className="flex bg-white/40 backdrop-blur-xl p-2 rounded-[2rem] w-fit mx-auto shadow border border-white/50">
        {TYPES.map((type) => {
          const isActive = selectedType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`relative flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all z-10 ${isActive ? 'text-purple-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {type.icon} {type.id}
              {isActive && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-2xl shadow border border-purple-100 -z-10" />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Upload Zone */}
      <motion.div variants={itemVariants}>
        <motion.div
          whileHover={!isSubmitting ? { scale: 1.01, y: -4 } : {}}
          onDragOver={(e) => { e.preventDefault(); !isSubmitting && setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => !isSubmitting && fileInputRef.current?.click()}
          className={`relative rounded-[4rem] border-[3px] border-dashed transition-all duration-500 flex flex-col items-center justify-center py-20 px-12 cursor-pointer overflow-hidden group
            ${dragActive || selectedFile
              ? 'border-purple-500 bg-purple-500/5 shadow-[0_32px_64px_-16px_rgba(124,58,237,0.1)]'
              : 'border-purple-200 bg-white/30 hover:bg-white/50 hover:border-purple-300'}
            ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <input type="file" ref={fileInputRef} className="hidden" accept="video/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />

          {selectedFile && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute top-8 right-8 w-14 h-14 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center shadow-lg">
              <CheckCircle2 size={28} />
            </motion.div>
          )}

          <div className="w-28 h-28 bg-purple-100 rounded-[3rem] flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform duration-500">
            <UploadIcon size={44} />
          </div>
          <h3 className="text-3xl font-black mb-2 text-[#1a1a2e]">
            {selectedFile ? 'Ready to Process!' : 'Upload Your Video'}
          </h3>
          <p className="text-gray-400 font-bold text-center text-sm">
            {selectedFile
              ? <span className="text-purple-600 font-black">{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
              : <>Drag &amp; drop or click to browse<br /><span className="text-xs">MP4, MKV, MOV — up to 2 GB</span></>
            }
          </p>
        </motion.div>
      </motion.div>

      {/* ── Target Language Multi-Select ──────────────────────────────── */}
      <motion.div variants={itemVariants} className="space-y-5">
        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-xl font-black text-[#1a1a2e] tracking-tight">
              Target Languages
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Select one or more languages to localize into
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Selected count badge */}
            <AnimatePresence mode="wait">
              <motion.span
                key={targetLangs.size}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="text-[11px] bg-purple-600 text-white px-3 py-1.5 rounded-full font-black shadow-md shadow-purple-300/40"
              >
                {targetLangs.size} selected
              </motion.span>
            </AnimatePresence>

            {/* Select All / Deselect All */}
            <button
              onClick={toggleAll}
              className={`text-[11px] px-3 py-1.5 rounded-full font-black border transition-all uppercase tracking-widest
                ${allSelected
                  ? 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
                  : 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100'}`}
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>

            {/* Clear (only show when more than 1 selected) */}
            {targetLangs.size > 1 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={clearAll}
                className="text-[11px] px-3 py-1.5 rounded-full font-black border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-all flex items-center gap-1"
              >
                <X size={10} /> Clear
              </motion.button>
            )}
          </div>
        </div>

        {/* Language chip grid */}
        <div className="flex flex-wrap gap-3">
          {LANGUAGES.map((lang) => {
            const isSelected = targetLangs.has(lang.code);
            return (
              <motion.button
                key={lang.code}
                onClick={() => toggleLang(lang.code)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-[1.5rem] font-bold text-sm transition-all border-2 select-none
                  ${isSelected
                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/40 border-purple-100 text-gray-500 hover:border-purple-300 hover:text-gray-700 hover:bg-white/70'}`}
              >
                <span className="text-base leading-none">{lang.flag}</span>
                {lang.label}
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="ml-1 w-4 h-4 bg-white/25 rounded-full flex items-center justify-center"
                    >
                      <Check size={10} strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Selected language summary pill row */}
        <AnimatePresence>
          {targetLangs.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest self-center">
                  Will localize to:
                </span>
                {selectedLabels.map(label => (
                  <span
                    key={label}
                    className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full font-bold"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Start Button */}
      <motion.div variants={itemVariants}>
        <motion.button
          onClick={handleStart}
          disabled={!selectedFile || isSubmitting}
          whileHover={!isSubmitting && selectedFile ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting && selectedFile ? { scale: 0.98 } : {}}
          className="w-full py-7 bg-gradient-to-r from-purple-700 to-purple-950 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-purple-900/40 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <><RefreshCw size={20} className="animate-spin" /> Uploading &amp; Starting Pipeline...</>
          ) : (
            <>
              <ArrowRight size={20} />
              Start Processing
              {targetLangs.size > 1 && (
                <span className="ml-1 bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-black">
                  {targetLangs.size} languages
                </span>
              )}
            </>
          )}
        </motion.button>
        {!selectedFile && (
          <p className="text-center text-gray-400 text-xs font-bold mt-3 uppercase tracking-widest">
            Select a video file above to continue
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Upload;
