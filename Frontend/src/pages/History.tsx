import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, Play, Calendar, HardDrive, Download, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import React from 'react';

const History = () => {
  const navigate = useNavigate();
  const { projects, deleteProject } = useProjects();

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
    }
  };

  const handleDownload = (e: React.MouseEvent, url: string | undefined, title: string) => {
    e.stopPropagation();
    if (!url) return;
    // Create direct link to backend
    const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://127.0.0.1:8000' 
      : `http://${window.location.hostname}:8000`;
      
    const link = document.createElement('a');
    link.href = `${backendUrl}${url}`;
    link.setAttribute('download', `${title}.mp4`);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tight text-[#2f2e36]">Project History ⏳</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="bg-white/50 backdrop-blur-md border border-white/50 rounded-2xl pl-12 pr-6 py-3 text-sm w-80 outline-none focus:ring-2 focus:ring-purple-300 shadow-[0_8px_32px_rgba(100,83,130,0.04)]"
            />
          </div>
          <button className="bg-white/50 backdrop-blur-md p-3 rounded-2xl text-gray-500 hover:text-purple-600 shadow-[0_8px_32px_rgba(100,83,130,0.04)] border border-white/50">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-[0_8px_32px_rgba(100,83,130,0.04)] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/40 border-b border-white/50">
            <tr className="text-[11px] font-black uppercase tracking-widest text-gray-400">
              <th className="px-10 py-6">Project Name</th>
              <th className="px-6 py-6">Language</th>
              <th className="px-6 py-6">Type</th>
              <th className="px-6 py-6">Size</th>
              <th className="px-6 py-6">Last Modified</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {projects.map((proj) => (
              <motion.tr 
                key={proj.id}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
                onClick={() => navigate(`/player/${proj.id}`)}
                className="group cursor-pointer border-b border-white/20 last:border-none transition-colors duration-200"
              >
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                      <Play size={20} fill="currentColor" />
                    </div>
                    <span className="font-bold text-[#2f2e36]">{proj.title}</span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                    {proj.lang}
                  </span>
                </td>
                <td className="px-6 py-6 font-medium text-gray-500">{proj.type}</td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2 text-gray-400 font-medium">
                    <HardDrive size={14} /> {proj.size}
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2 text-gray-400 font-medium">
                    <Calendar size={14} /> {proj.created_at ? new Date(proj.created_at).toLocaleDateString() : 'Recent'}
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleDownload(e, proj.video_url, proj.title)} 
                      disabled={proj.status !== 'Completed'}
                      className={`p-2 rounded-lg transition-colors ${proj.video_url ? 'text-purple-600 hover:bg-purple-100' : 'text-gray-300 cursor-not-allowed'}`}
                    >
                      <Download size={18} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(proj.id); }} className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={18} /></button>
                    <div className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><MoreVertical size={18} /></div>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
