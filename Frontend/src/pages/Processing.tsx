import { motion } from 'framer-motion';
import { RefreshCw, Clock, Languages, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

const Processing = () => {
  const { projects } = useProjects();
  const tasks = projects.filter(p => p.status === 'Processing' || p.status === 'done');

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#2f2e36]">Processing Jobs ⚙️</h1>
          <p className="text-gray-500 font-medium mt-1">Track your active localizations in real-time.</p>
        </div>
        <div className="bg-purple-100/50 px-6 py-3 rounded-2xl flex items-center gap-3 text-[#7c3aed] font-bold">
          <RefreshCw size={20} className="animate-spin" />
          Auto-updating
        </div>
      </div>

      <div className="space-y-6">
        {tasks.map((task) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-white p-8 rounded-[2.5rem] border border-purple-50 shadow-sm flex items-center gap-8 ${task.status === 'done' ? 'opacity-70' : ''}`}
          >
            {/* Status Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              task.status === 'done' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
            }`}>
              {task.status === 'done' ? <CheckCircle2 size={32} /> : <RefreshCw size={32} className="animate-spin-slow" />}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#2f2e36]">{task.title}</h3>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{task.stage}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-4 bg-purple-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  className={`h-full transition-all duration-1000 ${
                    task.status === 'done' ? 'bg-green-500' : 'bg-gradient-to-r from-[#7c3aed] to-[#d946ef]'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold text-gray-400">
                  {task.progress}% • Estimated {task.timeRemaining} left
                </p>
                <div className="flex items-center gap-4 text-purple-600 text-[13px] font-bold">
                  <span className="flex items-center gap-1"><Clock size={14} /> Syncing</span>
                  <span className="flex items-center gap-1"><Languages size={14} /> Multi-track</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <button className={`${
              task.status === 'done' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'
            } px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all`}>
              {task.status === 'done' ? 'View Results' : 'Prioritize'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Tip Card */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-10 rounded-[3rem] text-white flex items-center justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-orange-400 font-bold uppercase tracking-[0.2em] text-[11px]">
            <AlertCircle size={16} /> Pro Tip
          </div>
          <h3 className="text-3xl font-black">Faster processing for Indian Languages.</h3>
          <p className="text-gray-400 max-w-xl font-medium">Use our dedicated Anuvad nodes for 2x faster Hindi and Tamil dubbing sync during peak hours.</p>
        </div>
        <button className="bg-white text-black px-12 py-5 rounded-full font-black uppercase text-xs tracking-widest hover:bg-gray-100">
          Upgrade Plan
        </button>
      </div>
    </div>
  );
};

export default Processing;
