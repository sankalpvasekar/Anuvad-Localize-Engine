import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Play, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();


  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#2f2e36]">अभिवादन, स्वागतम् 👋</h1>
          <p className="text-gray-500 font-medium mt-1">Ready to localize your stories with Anuvad?</p>
        </div>
        <button 
          onClick={() => navigate('/upload')}
          className="bg-gradient-to-r from-[#7c3aed] to-[#d946ef] text-white px-8 py-4 rounded-3xl font-black flex items-center gap-3 shadow-xl hover:scale-105 transition-all uppercase text-xs tracking-widest"
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      {/* Stats / Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Projects', value: projects.length.toString(), sub: 'This month', color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Processing', value: projects.filter(p => p.status === 'Processing').length.toString(), sub: 'Active now', color: 'bg-green-50 text-green-600' },
          { label: 'Languages Used', value: new Set(projects.map(p => p.lang)).size.toString(), sub: 'Tracked', color: 'bg-purple-50 text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_8px_32px_rgba(100,83,130,0.04)] border border-white/50 space-y-2 relative overflow-hidden">
            <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-black text-[#2f2e36]">{stat.value}</p>
              <span className={`text-[11px] px-2 py-1 rounded-full font-bold ${stat.color}`}>{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#2f2e36]">Recent Projects</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="bg-white border-none rounded-2xl pl-12 pr-6 py-2.5 text-[14px] w-64 focus:ring-2 focus:ring-purple-200 outline-none shadow-sm transition-all"
              />
            </div>
            <button className="bg-white p-2.5 rounded-2xl text-gray-400 hover:text-purple-600 shadow-sm border border-purple-50">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((proj) => (
            <motion.div 
              key={proj.id}
              whileHover={{ y: -8 }}
              className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden border border-white/50 shadow-[0_8px_24px_rgba(100,83,130,0.04)] hover:shadow-[0_20px_40px_rgba(100,83,130,0.08)] hover:bg-white/80 transition-all duration-300 group cursor-pointer relative"
            >
              {/* Preview */}
              <div className="relative aspect-video overflow-hidden">
                <img src={proj.preview} alt={proj.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-all">
                    <Play size={24} fill="white" />
                  </div>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-[#7c3aed] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    {proj.lang}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#2f2e36] line-clamp-1">{proj.title}</h3>
                  <button className="text-gray-300 hover:text-gray-600">
                    <MoreVertical size={20} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[13px] font-bold">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={14} />
                    <span>{proj.date}</span>
                  </div>
                  <span className={`
                    px-3 py-1 rounded-full uppercase tracking-widest text-[10px]
                    ${proj.status === 'Completed' ? 'bg-green-50 text-green-600' : 
                      proj.status === 'Processing' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}
                  `}>
                    {proj.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          {/* Add New Card */}
          <div 
            onClick={() => navigate('/upload')}
            className="border-2 border-dashed border-white/60 bg-white/30 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:bg-white/60 hover:border-white/80 hover:shadow-[0_20px_40px_rgba(100,83,130,0.06)] cursor-pointer text-gray-500 group h-full min-h-[380px]"
          >
            <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={32} className="text-purple-300 group-hover:text-purple-500" />
            </div>
            <p className="font-bold text-lg">Create New Video</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
