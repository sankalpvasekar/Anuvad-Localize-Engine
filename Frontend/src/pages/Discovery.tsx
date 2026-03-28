import { motion } from 'framer-motion';
import { Search, Play, Heart, MessageSquare } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

const Discovery = () => {
  const { communityProjects } = useProjects();
  const categories = ['All', 'Education', 'Entertainment', 'Tech', 'News', 'Marathi', 'Tamil'];
  
  return (
    <div className="max-w-7xl mx-auto space-y-10 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#2f2e36]">Discover Local Content 🌍</h1>
          <p className="text-gray-500 font-medium mt-1">Explore what the Anuvad community is localizing.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search community..." 
            className="bg-white border-none rounded-2xl pl-12 pr-6 py-3 text-sm w-80 outline-none focus:ring-2 focus:ring-purple-200 shadow-sm"
          />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat, i) => (
          <button 
            key={cat}
            className={`px-8 py-3 rounded-2xl font-bold text-[13px] whitespace-nowrap transition-all ${
              i === 0 ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-200' : 'bg-white text-gray-500 hover:bg-purple-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(communityProjects.length > 0 ? communityProjects : Array.from({length: 6}, (_, i) => ({
          id: i,
          title: 'Physics Concepts Explained for CBSE in Hindi',
          lang: 'Hindi',
          preview: `https://images.unsplash.com/photo-1620712943543-bcc4545a9457?w=600&h=400&fit=crop&q=${i}`
        }))).map((project, i) => (
          <motion.div 
            key={project.id}
            whileHover={{ y: -10 }}
            className="bg-white rounded-[3rem] overflow-hidden border border-purple-50 shadow-sm hover:shadow-2xl transition-all group"
          >
            <div className="relative aspect-video">
              <img src={project.preview || `https://images.unsplash.com/photo-1620712943543-bcc4545a9457?w=600&h=400&fit=crop&q=${i}`} className="w-full h-full object-cover" alt="preview" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                  <Play size={24} fill="white" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">04:15</span>
                <span className="bg-purple-600/80 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">{project.lang} Dubbed</span>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <h3 className="text-xl font-bold text-[#2f2e36] line-clamp-2 leading-tight">{project.title}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">A</div>
                  <span className="text-sm font-bold text-gray-400">Anuvad Edu</span>
                </div>
                <div className="flex items-center gap-6 text-gray-400">
                  <span className="flex items-center gap-1 text-[12px]"><Heart size={14} /> 1.2k</span>
                  <span className="flex items-center gap-1 text-[12px]"><MessageSquare size={14} /> 45</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Discovery;
