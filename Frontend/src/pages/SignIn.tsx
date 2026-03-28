import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Share2, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f9f5ff] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-200/40 rounded-full blur-[150px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-100/30 rounded-full blur-[120px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white/80 backdrop-blur-2xl rounded-[4rem] p-16 shadow-2xl border border-white/50"
      >
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7c3aed] to-[#d946ef] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-200">
            <span className="text-3xl font-black italic">A</span>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#2f2e36] tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 font-medium mt-2">Log in to your Anuvad account to continue.</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input 
                type="email" 
                placeholder="name@company.com" 
                className="w-full bg-white border-2 border-purple-50 rounded-3xl py-5 pl-16 pr-6 outline-none focus:border-purple-200 focus:ring-4 focus:ring-purple-50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Password</label>
              <button className="text-[11px] font-black uppercase tracking-widest text-purple-600 hover:text-purple-700">Forgot?</button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-white border-2 border-purple-50 rounded-3xl py-5 pl-16 pr-6 outline-none focus:border-purple-200 focus:ring-4 focus:ring-purple-50 transition-all font-medium"
              />
            </div>
          </div>

          <button className="w-full bg-[#2f2e36] text-white py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all">
            Sign In <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-12 space-y-8">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-purple-50"></div></div>
            <span className="relative bg-white px-6 text-[11px] font-bold text-gray-300 uppercase tracking-widest">Or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 bg-white border border-purple-50 py-4 rounded-3xl font-bold text-gray-500 hover:bg-gray-50 transition-all">
              <Globe size={20} /> Google
            </button>
            <button className="flex items-center justify-center gap-3 bg-white border border-purple-50 py-4 rounded-3xl font-bold text-gray-500 hover:bg-gray-50 transition-all">
              <Share2 size={20} /> Github
            </button>
          </div>
        </div>

        <p className="text-center mt-12 text-sm font-medium text-gray-400">
          New to Anuvad? <button className="text-purple-600 font-bold hover:underline">Create an account</button>
        </p>
      </motion.div>
    </div>
  );
};

export default SignIn;
