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
      className="max-w-[1200px] mx-auto space-y-6 py-6 px-6"
    >
      <ErrorToast message={error} onClose={() => setError(null)} onRetry={handleStart} />

      {/* Header */}
      <motion.div variants={itemVariants} className="text-left space-y-2">
        <div className="inline-flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full text-purple-600 font-bold text-[10px] uppercase tracking-widest border border-purple-100">
          <Sparkles size={12} /> AI-Powered Localization
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#1a1a2e]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Start Localizing 🚀</h1>
        <p className="text-gray-400 text-base font-medium">
          Upload your video and pick your target languages.
        </p>
      </motion.div>

      <div className="lg:grid lg:grid-cols-[1fr_1.2fr] lg:gap-10 items-start">
        {/* Left Column: Upload Zone */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <motion.div
              whileHover={!isSubmitting ? { scale: 1.01, y: -4 } : {}}
              onDragOver={(e) => { e.preventDefault(); !isSubmitting && setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              onClick={() => !isSubmitting && fileInputRef.current?.click()}
              className={`relative rounded-[2.5rem] border-[3px] border-dashed transition-all duration-500 flex flex-col items-center justify-center py-12 px-8 cursor-pointer overflow-hidden group
                ${dragActive || selectedFile
                  ? 'border-purple-500 bg-purple-500/5 shadow-[0_32px_64px_-16px_rgba(124,58,237,0.1)]'
                  : 'border-purple-200 bg-white/30 hover:bg-white/50 hover:border-purple-300'}
                ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="video/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />

              {selectedFile && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-6 right-6 w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 size={24} />
                </motion.div>
              )}

              <div className="w-20 h-20 bg-purple-100 rounded-[2rem] flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform duration-500">
                <UploadIcon size={34} />
              </div>
              <h3 className="text-2xl font-black mb-2 text-[#1a1a2e]">
                {selectedFile ? 'Ready to Process!' : 'Upload Video'}
              </h3>
              <p className="text-gray-400 font-bold text-center text-xs">
                {selectedFile
                  ? <span className="text-purple-600 font-black">{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                  : <>Drag &amp; drop or click to browse<br /><span>MP4, MKV, MOV — up to 2 GB</span></>
                }
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-6 mt-8 lg:mt-0">
          {/* Type Selector */}
          <motion.div variants={itemVariants} className="flex bg-white/40 backdrop-blur-xl p-1.5 rounded-[1.5rem] w-full shadow border border-white/50">
            {TYPES.map((type) => {
              const isActive = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-[12px] transition-all z-10 ${isActive ? 'text-purple-700' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {type.icon} {type.id}
                  {isActive && (
                    <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-xl shadow border border-purple-100 -z-10" />
                  )}
                </button>
              );
            })}
          </motion.div>

          {/* Target Language Multi-Select */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-black text-[#1a1a2e] tracking-tight">Target Languages</h3>
                <p className="text-[10px] text-gray-400 font-medium">Localization targets</p>
              </div>

              <div className="flex items-center gap-1.5">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={targetLangs.size}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[10px] bg-purple-600 text-white px-2.5 py-1 rounded-full font-black shadow-md shadow-purple-300/40"
                  >
                    {targetLangs.size}
                  </motion.span>
                </AnimatePresence>
                <button
                  onClick={toggleAll}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-black border transition-all uppercase tracking-widest
                    ${allSelected ? 'bg-gray-100 border-gray-200 text-gray-500' : 'bg-purple-50 border-purple-200 text-purple-600'}`}
                >
                  {allSelected ? 'None' : 'All'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => {
                const isSelected = targetLangs.has(lang.code);
                return (
                  <motion.button
                    key={lang.code}
                    onClick={() => toggleLang(lang.code)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-[11px] transition-all border select-none
                      ${isSelected
                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/40 border-purple-100 text-gray-500 hover:border-purple-300 hover:text-gray-700'}`}
                  >
                    <span className="text-xs leading-none">{lang.flag}</span>
                    <span className="truncate">{lang.label}</span>
                    {isSelected && <Check size={8} strokeWidth={4} className="ml-auto" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div variants={itemVariants} className="pt-2">
            <motion.button
              onClick={handleStart}
              disabled={!selectedFile || isSubmitting}
              whileHover={!isSubmitting && selectedFile ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting && selectedFile ? { scale: 0.98 } : {}}
              className="w-full py-5 bg-gradient-to-r from-purple-700 to-purple-950 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-purple-900/40 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <><RefreshCw size={16} className="animate-spin" /> Starting...</>
              ) : (
                <>
                  <ArrowRight size={16} />
                  Start Processing
                </>
              )}
            </motion.button>
            {!selectedFile && (
              <p className="text-center text-gray-400 text-[10px] font-bold mt-2 uppercase tracking-widest">
                Upload a video to begin
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Upload;
