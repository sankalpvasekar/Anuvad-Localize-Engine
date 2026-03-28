import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Upload, 
  RefreshCw, 
  Library, 
  LogOut
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Upload size={20} />, label: 'Upload', path: '/upload' },
    { icon: <RefreshCw size={20} />, label: 'Processing', path: '/processing' },
    { icon: <Library size={20} />, label: 'Library', path: '/library' },
  ];

  return (
    <div className="w-72 h-screen bg-white/30 backdrop-blur-2xl border-r border-white/40 flex flex-col p-6 sticky top-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-9 h-9 bg-[#7c3aed] rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
          <span className="font-bold text-xl italic italic">A</span>
        </div>
        <span className="text-2xl font-black tracking-tight text-[#2f2e36]">Anuvad</span>
      </div>

      {/* Nav Items */}
      <div className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              whileHover={{ x: 4 }}
              onClick={() => navigate(item.path)}
              className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                isActive 
                  ? 'bg-white/60 backdrop-blur-md text-[#7c3aed] shadow-sm shadow-purple-100/50 font-bold border border-white/50' 
                  : 'text-gray-500 hover:bg-white/40 hover:text-[#7c3aed]'
              }`}
            >
              <div className="flex items-center gap-4">
                {item.icon}
                <span className="text-[15px]">{item.label}</span>
              </div>
              {isActive && <motion.div layoutId="active" className="w-1.5 h-1.5 bg-[#7c3aed] rounded-full" />}
            </motion.div>
          );
        })}
      </div>

      {/* Footer / User */}
      <div className="pt-6 border-t border-white/40">
        <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/50 backdrop-blur-md cursor-pointer transition-all text-gray-500 group border border-transparent hover:border-white/40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-[#7c3aed] font-bold">JD</div>
            <div>
              <p className="text-sm font-bold text-[#2f2e36]">John Doe</p>
              <p className="text-[11px] opacity-70">Pro Account</p>
            </div>
          </div>
          <LogOut size={18} className="group-hover:text-red-400" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
