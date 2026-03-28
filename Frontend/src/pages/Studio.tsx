import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Layers, 
  Type, 
  Mic2, 
  Settings2,
  Save,
  Share2
} from 'lucide-react';

const Studio = () => {
  return (
    <div className="h-[calc(100vh-80px)] flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-purple-50">
            <Layers className="text-purple-600" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#2f2e36]">Editing: AI Ethics in Bharat</h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Hindi Dubbing Project • V2.4</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white text-gray-500 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 border border-purple-50 hover:bg-purple-50 transition-all">
            <Save size={18} /> Auto-saved
          </button>
          <button className="bg-gradient-to-r from-[#7c3aed] to-[#d946ef] text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
            <Share2 size={18} /> Export
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Video Player */}
        <div className="flex-[1.5] bg-[#1a1a2e] rounded-[3.5rem] overflow-hidden relative shadow-2xl flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <Play size={80} className="text-white/20" />
            <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-white text-[11px] font-black uppercase tracking-widest border border-white/10">
              00:04:12 / 12:45
            </div>
          </div>
          {/* Player controls */}
          <div className="bg-black/20 backdrop-blur-xl p-8 flex items-center justify-between">
            <div className="flex items-center gap-6 text-white">
              <SkipBack size={24} className="cursor-pointer hover:text-purple-400 transition-colors" />
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all">
                <Pause size={28} />
              </div>
              <SkipForward size={24} className="cursor-pointer hover:text-purple-400 transition-colors" />
            </div>
            <div className="flex-1 mx-10 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-purple-500 to-pink-500" />
            </div>
            <div className="flex items-center gap-4 text-white">
              <Volume2 size={24} />
              <Settings2 size={24} />
            </div>
          </div>
        </div>

        {/* Right: Tools & Transcript */}
        <div className="flex-1 bg-white rounded-[3.5rem] border border-purple-50 shadow-sm flex flex-col overflow-hidden">
          <div className="p-8 border-b border-purple-50 flex items-center gap-6">
            <button className="text-purple-600 font-bold border-b-2 border-purple-600 pb-2 flex items-center gap-2">
              <Type size={18} /> Transcript
            </button>
            <button className="text-gray-400 font-bold pb-2 flex items-center gap-2">
              <Mic2 size={18} /> Voices
            </button>
          </div>
          <div className="flex-1 overflow-auto p-8 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`p-6 rounded-3xl border transition-all ${i === 1 ? 'border-purple-200 bg-purple-50/30 ring-2 ring-purple-100' : 'border-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">00:04:{10 + i}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Speaker {i}</span>
                </div>
                <p className="text-[#2f2e36] font-medium leading-relaxed">
                  यह एआई के भविष्य और भारत पर इसके प्रभाव के बारे में एक महत्वपूर्ण क्षण है।
                </p>
                <p className="text-gray-400 text-sm mt-3 border-t border-purple-50 pt-3 italic">
                  "This is a critical moment for the future of AI and its impact on India."
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;
