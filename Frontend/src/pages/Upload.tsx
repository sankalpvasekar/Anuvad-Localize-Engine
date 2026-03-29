import { UploadCloud as UploadIcon, Link as LinkIcon, Globe, ArrowRight, CheckCircle2, Mic, Type, FileAudio } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';

const Upload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addProject } = useProjects();
  const [selectedType, setSelectedType] = useState<string>(location.state?.type || 'AI Dubbing');
  const [dragActive, setDragActive] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['Hindi']);
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const localizationTypes = [
    { id: 'AI Dubbing', icon: <Mic size={18} /> },
    { id: 'AI Subtitles', icon: <Type size={18} /> },
    { id: 'Text To Speech', icon: <FileAudio size={18} /> },
  ];

  const toggleLang = (lang: string) => {
    setSelectedLangs(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang) 
        : [...prev, lang]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tight text-[#2f2e36]">Start Localizing 🚀</h1>
        <p className="text-gray-500 text-lg font-medium">Upload your video or paste a link to begin the Anuvad magic.</p>
      </div>

      {/* Type Selection */}
      <div className="flex bg-white/40 backdrop-blur-xl p-1.5 rounded-2xl w-fit mx-auto shadow-[0_8px_32px_rgba(100,83,130,0.04)] border border-white/50 relative">
        {localizationTypes.map((type) => {
          const isActive = selectedType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all z-10 ${
                isActive ? 'text-[#7c3aed]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {type.icon} {type.id}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-purple-100 -z-10"
                  style={{ top: 6, bottom: 6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Box */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          className={`aspect-square rounded-[3.5rem] border-[3px] border-dashed transition-all duration-300 flex flex-col items-center justify-center p-10 cursor-pointer backdrop-blur-md ${
            dragActive ? 'border-[#7c3aed] bg-[#7c3aed]/10' : 'border-purple-300/60 bg-purple-900/5 hover:bg-purple-900/10 hover:border-purple-400/60 hover:shadow-[0_20px_40px_rgba(100,83,130,0.06)]'
          }`}
        >
          <div className="w-24 h-24 bg-purple-100 rounded-[2rem] flex items-center justify-center mb-6 text-[#7c3aed]">
            <UploadIcon size={40} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Drop your video here</h3>
          <p className="text-gray-400 font-medium text-center">MP4, MKV, MOV (Max 2GB)<br />or click to browse</p>
        </div>

        {/* Link Box */}
        <div className="aspect-square bg-purple-900/5 backdrop-blur-2xl rounded-[3.5rem] border border-purple-200 p-10 flex flex-col justify-between shadow-[0_8px_32px_rgba(100,83,130,0.08)]">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-purple-50 rounded-[2rem] flex items-center justify-center text-[#7c3aed]">
              <LinkIcon size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Import from URL</h3>
              <p className="text-gray-400 font-medium">Paste a YouTube or Vimeo link.</p>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500">
                <Globe size={20} />
              </div>
              <input 
                type="text" 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..." 
                className="w-full bg-white/60 border border-purple-100 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:ring-2 focus:ring-purple-300 transition-all font-semibold"
              />
            </div>
          </div>
          <button 
            disabled={isSubmitting || (!videoUrl && !dragActive)}
            onClick={async () => {
              setIsSubmitting(true);
              for (const lang of selectedLangs) {
                await addProject({
                  title: videoUrl ? `URL Upload: ${videoUrl.substring(0, 20)}...` : 'New Video Upload',
                  lang,
                  type: selectedType,
                  size: 'Pending',
                  status: 'Processing',
                  progress: 0,
                  timeRemaining: 'Calculating...',
                  stage: 'Initializing',
                  is_community: false
                });
              }
              navigate('/processing');
            }}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-white/20">
            {isSubmitting ? 'Starting...' : 'Fetch Video'} <ArrowRight size={20} />
          </button>
        </div>
      </div>


      {/* Language Selection Preview */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-[3.5rem] p-10 border border-white/50 shadow-[0_8px_32px_rgba(100,83,130,0.04)] space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <Globe className="text-purple-500" /> Target Indian Languages
          </h3>
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider">
            {selectedLangs.length} Selected
          </span>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {['Hindi', 'Tamil', 'Bengali', 'Marathi', 'Telugu', 'Gujarati', 'Kannada', 'Malayalam'].map((lang) => {
            const isSelected = selectedLangs.includes(lang);
            return (
              <motion.div
                key={lang}
                onClick={() => toggleLang(lang)}
                initial={false}
                animate={{
                  backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
                  borderColor: isSelected ? '#7c3aed' : '#f3e8ff',
                  scale: isSelected ? 1.02 : 1
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-2xl border font-bold text-[15px] cursor-pointer flex items-center gap-3 transition-colors duration-200 ${
                  isSelected ? 'text-[#7c3aed]' : 'text-gray-700'
                }`}
              >
                {lang}
                <div className="relative w-5 h-5">
                  <AnimatePresence>
                    {isSelected ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                        className="absolute inset-0 text-purple-600"
                      >
                        <CheckCircle2 size={20} fill="#7c3aed" className="text-white" />
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 border-2 border-gray-100 rounded-full" />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Upload;
