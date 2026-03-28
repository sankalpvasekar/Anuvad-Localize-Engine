import { Play, Share2, Download, MessageSquare, Globe, Heart } from 'lucide-react';

const Player = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 py-10">
      {/* Video Main */}
      <div className="aspect-video bg-black rounded-[4rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 group-hover:bg-black/20 transition-all">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform border border-white/20">
            <Play size={40} fill="white" />
          </div>
        </div>
        
        {/* Language selector overlay */}
        <div className="absolute top-10 right-10 flex gap-3">
          <div className="bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-2xl text-white text-[13px] font-bold border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-black/80 transition-all">
            <Globe size={16} className="text-purple-400" /> English (Original)
          </div>
          <div className="bg-purple-600/80 backdrop-blur-md px-5 py-2.5 rounded-2xl text-white text-[13px] font-bold border border-purple-400/50 flex items-center gap-3 cursor-pointer hover:bg-purple-600 transition-all shadow-xl shadow-purple-500/20">
            <Globe size={16} /> हिन्दी Dubbed
          </div>
        </div>
      </div>

      {/* Info & Engagement */}
      <div className="flex items-start justify-between bg-white p-12 rounded-[3.5rem] border border-purple-50 shadow-sm">
        <div className="space-y-6 flex-1">
          <div className="flex items-center gap-3">
            <span className="bg-purple-100 text-[#7c3aed] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Education</span>
            <span className="text-gray-400 text-sm font-bold">• 1.2M Views • Posted 2 days ago</span>
          </div>
          <h1 className="text-4xl font-black text-[#2f2e36]">The Future of Bharat AI: Explained in Hindi</h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-3xl">
            In this deep-dive, we explore how localized AI is transforming rural India, providing access to healthcare and education in regional dialects. 
            Now available in 8 Indian languages via Anuvad Engine.
          </p>
        </div>

        <div className="flex flex-col gap-4 min-w-[200px]">
          <button className="flex items-center justify-between bg-purple-50 text-[#7c3aed] px-8 py-5 rounded-[2rem] font-bold hover:bg-purple-100 transition-all border border-purple-100">
            <Heart size={20} /> 124K Likes
          </button>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white border border-gray-100 p-5 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-gray-50 transition-all text-gray-500">
              <Share2 size={20} /> <span className="text-[10px] font-black uppercase">Share</span>
            </button>
            <button className="bg-white border border-gray-100 p-5 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-gray-50 transition-all text-gray-500">
              <Download size={20} /> <span className="text-[10px] font-black uppercase">Save</span>
            </button>
          </div>
          <button className="w-full bg-[#2f2e36] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg">
            <MessageSquare size={18} /> Community Discussion
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player;
