import { motion } from 'framer-motion';
import { Settings, Users, CreditCard, Shield, Bell, Zap, ChevronRight, HardDrive } from 'lucide-react';

const Admin = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#2f2e36]">Platform Admin 🛡️</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your team, billing, and API keys.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-purple-50 flex items-center gap-3">
          <Zap className="text-orange-400" size={20} />
          <span className="font-bold text-[13px] text-gray-700">Pro Plan Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <Users />, label: 'Team Members', value: '12', sub: '2 pending' },
          { icon: <Zap />, label: 'API Usage', value: '85%', sub: '45k requests' },
          { icon: <HardDrive />, label: 'Storage', value: '1.2 TB', sub: 'of 2.0 TB' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-purple-50 shadow-sm space-y-4 group hover:border-purple-200 transition-all">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-[#2f2e36] tracking-tight">{stat.value}</p>
              <p className="text-[12px] font-bold text-purple-400">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {[
          { icon: <Shield />, label: 'Security & Permissions', desc: 'Manage role-based access control.' },
          { icon: <CreditCard />, label: 'Billing & Subscriptions', desc: 'Update payment methods and download invoices.' },
          { icon: <Bell />, label: 'Notification Settings', desc: 'Configure email and platform alerts.' },
          { icon: <Settings />, label: 'API & Webhooks', desc: 'Generate API keys and integrate services.' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ x: 10 }}
            className="bg-white p-8 rounded-[2.5rem] border border-purple-50 shadow-sm flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-all">
                {item.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2f2e36]">{item.label}</h3>
                <p className="text-gray-400 font-medium">{item.desc}</p>
              </div>
            </div>
            <ChevronRight className="text-gray-200 group-hover:text-purple-400" size={24} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
