import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause,
  Share2, 
  Download, 
  MessageSquare, 
  Globe, 
  Heart, 
  ChevronLeft,
  Volume2,
  VolumeX,
  Maximize,
  FileText,
  Clock,
  Layout
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { motion, AnimatePresence } from 'framer-motion';

const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [selectedLang, setSelectedLang] = useState('original');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Find the project data
  const project = projects.find(p => String(p.id) === id);

  useEffect(() => {
    if (!project) return;
    // Set default language to first target language if completed, otherwise original
    if (project.status === 'Completed' && project.target_languages?.length) {
      // Keep as original for now or auto-switch
    }
  }, [project]);

  // Sync Logic: Keep Audio in sync with Video
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
      if (selectedLang !== 'original' && audio) {
        audio.play().catch(e => console.error("Audio play blocked", e));
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (audio) audio.pause();
    };

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
      
      // Strict sync: if drifting more than 0.3s, re-sync
      if (selectedLang !== 'original' && audio) {
        if (Math.abs(audio.currentTime - video.currentTime) > 0.3) {
          audio.currentTime = video.currentTime;
        }
      }
    };

    const handleSeeking = () => {
        if (selectedLang !== 'original' && audio) {
            audio.currentTime = video.currentTime;
        }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('seeking', handleSeeking);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('seeking', handleSeeking);
    };
  }, [selectedLang]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
    const audio = audioRef.current;
    const video = videoRef.current;

    if (lang === 'original') {
      if (video) video.muted = isMuted;
      if (audio) {
          audio.pause();
          audio.currentTime = 0;
      }
    } else {
      if (video) video.muted = true; // Mute video to play dubbed track
      if (audio && video) {
        audio.src = `http://localhost:8000${project?.audio_tracks?.[lang]}`;
        audio.currentTime = video.currentTime;
        if (isPlaying) audio.play();
      }
    }
  };

  const handleDownload = () => {
    if (!project?.video_url) return;
    const link = document.createElement('a');
    link.href = `http://localhost:8000${project.video_url}`;
    link.download = `${project.title}_OTT.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <Globe size={48} className="mb-4 animate-pulse" />
        <h2 className="text-xl font-bold">Project not found or loading...</h2>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-purple-500 font-bold hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-10 px-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-[#7c3aed] transition-colors font-bold group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Workspace
      </button>

      {/* Video Main */}
      <div className="aspect-video bg-[#1a1a2e] rounded-[3rem] shadow-2xl relative overflow-hidden group border border-white/5">
        {/* Actual Video */}
        <video 
          ref={videoRef}
          className="w-full h-full object-contain"
          src={project.video_url ? `http://localhost:8000${project.video_url}` : undefined}
          onClick={togglePlay}
          muted={isMuted || selectedLang !== 'original'}
        />

        {/* Hidden Audio for Dubbing Sync */}
        <audio ref={audioRef} className="hidden" />

        {/* Custom Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-10 space-y-6">
          
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer relative">
            <div 
              className="absolute inset-y-0 left-0 bg-[#7c3aed] transition-all duration-100" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={togglePlay}
                className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
              >
                {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1" />}
              </button>
              
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="text-white/70 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>

              <div className="text-white/60 text-sm font-bold font-mono">
                {videoRef.current ? Math.floor(videoRef.current.currentTime / 60) : 0}:
                {videoRef.current ? String(Math.floor(videoRef.current.currentTime % 60)).padStart(2, '0') : '00'} / 
                {videoRef.current ? Math.floor(videoRef.current.duration / 60) : 0}:
                {videoRef.current ? String(Math.floor(videoRef.current.duration % 60)).padStart(2, '0') : '00'}
              </div>
            </div>

            <div className="flex items-center gap-4">
               <button className="text-white/70 hover:text-white transition-colors">
                  <Maximize size={20} />
               </button>
            </div>
          </div>
        </div>
        
        {/* Language selector overlay (OTT Style) */}
        <div className="absolute top-10 right-10 flex flex-col gap-3 items-end">
          <div className="bg-black/40 backdrop-blur-xl p-1.5 rounded-[1.5rem] border border-white/10 flex flex-col gap-1 shadow-2xl">
            <button 
                onClick={() => handleLanguageChange('original')}
                className={`px-5 py-2.5 rounded-2xl text-[12px] font-black tracking-wider transition-all flex items-center gap-3 ${selectedLang === 'original' ? 'bg-[#7c3aed] text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
                <Globe size={14} /> ENGLISH (ORIGINAL)
            </button>
            
            {project.target_languages?.map(lang => (
                <button 
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-5 py-2.5 rounded-2xl text-[12px] font-black tracking-wider transition-all flex items-center gap-3 ${selectedLang === lang ? 'bg-[#d946ef] text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                    <Globe size={14} /> {lang.toUpperCase()} DUBBED
                </button>
            ))}
          </div>
          
          <div className="bg-green-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/10">
             HD Available
          </div>
        </div>
      </div>

      {/* Dual Transcript Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[4rem] border border-gray-100 shadow-[0_8px_48px_rgba(100,83,130,0.08)] overflow-hidden"
      >
        <div className="p-10 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-purple-600">
               <FileText size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#1a1a2e] tracking-tight">Localization Script</h3>
              <p className="text-gray-400 text-sm font-bold flex items-center gap-2">
                <Layout size={14} /> Project: <span className="text-purple-600">{project.title}</span> • Order ID: <span className="text-gray-600 font-mono">#{id?.slice(-8).toUpperCase()}</span>
              </p>
            </div>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-inner">
            <button 
              onClick={() => setSelectedLang('original')}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${selectedLang === 'original' ? 'bg-[#1a1a2e] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Original (EN)
            </button>
            {project.target_languages?.map(lang => (
              <button 
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${selectedLang === lang ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {lang.toUpperCase()} Dub
              </button>
            ))}
          </div>
        </div>

        <div className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {/* Original Side */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Original English Pipeline</h4>
                    <span className="text-[10px] font-bold text-gray-300">Auto-synchronized</span>
                  </div>
                  <div className="prose prose-purple max-w-none">
                    <p className="text-gray-600 text-lg leading-relaxed font-medium bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-50 min-h-[200px]">
                      {project.transcript || "Transcription not available for this project."}
                    </p>
                  </div>
               </div>

               {/* Translated Side */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d946ef]">Neural {selectedLang.toUpperCase()} Translation</h4>
                    <span className="text-[10px] font-bold text-[#d946ef]/40 italic">VITS High-Fidelity</span>
                  </div>
                  <div className="prose prose-fuchsia max-w-none">
                    <p className="text-[#1a1a2e] text-lg leading-relaxed font-bold bg-[#fdf4ff] p-8 rounded-[2.5rem] border border-[#fae8ff] min-h-[200px]">
                      {(selectedLang === 'original' ? project.transcript : project.translations?.[selectedLang]) || "Selecting a target language will show the translated script here for review."}
                    </p>
                  </div>
               </div>
            </div>
            
            <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-100">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                     <Clock size={16} /> Total Sync: <span className="text-gray-600">100% Match</span>
                  </div>
               </div>
               <button className="text-purple-600 font-black text-[11px] uppercase tracking-widest hover:underline px-6 py-3 bg-purple-50 rounded-full">
                  Request Human Correction
               </button>
            </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4 min-w-[240px] ml-12">
          <button className="flex items-center justify-between bg-purple-50 text-[#7c3aed] px-8 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-wider hover:bg-purple-100 transition-all border border-purple-100 text-center cursor-default">
            <Heart size={20} className="fill-[#7c3aed]" /> 124K Interactions
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white border border-gray-100 p-6 rounded-[2.5rem] flex flex-col items-center gap-2 hover:bg-gray-50 transition-all text-gray-500 shadow-sm">
              <Share2 size={24} /> <span className="text-[10px] font-black uppercase">Share</span>
            </button>
            <button 
              onClick={handleDownload}
              disabled={project.status !== 'Completed'}
              className={`p-6 rounded-[2.5rem] flex flex-col items-center gap-2 transition-all shadow-sm border ${project.video_url ? 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50' : 'bg-gray-50 border-transparent text-gray-300 cursor-not-allowed'}`}
            >
              <Download size={24} /> <span className="text-[10px] font-black uppercase">Download</span>
            </button>
          </div>
          
          <button className="w-full bg-[#1a1a2e] text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] transition-all">
            <MessageSquare size={18} /> Community
          </button>
        </div>
      </div>
  );
};

export default Player;
