import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Key, Globe, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const SignIn = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: '#f9f5ff' }}
    >
      {/* ── Animated background orbs ───────────────────────────── */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Top-right lavender */}
        <div style={{
          position:'absolute', top:'-15%', right:'-8%',
          width:800, height:800,
          background:'radial-gradient(ellipse, rgba(222,200,255,0.65) 0%, rgba(224,195,252,0.32) 55%, transparent 100%)',
          filter:'blur(90px)',
          animation:'morph 16s ease-in-out infinite, drift-1 11s ease-in-out infinite',
        }} />
        {/* Bottom-left mint */}
        <div style={{
          position:'absolute', bottom:'-12%', left:'-8%',
          width:700, height:700,
          background:'radial-gradient(ellipse, rgba(177,242,184,0.55) 0%, rgba(161,228,170,0.28) 55%, transparent 100%)',
          filter:'blur(80px)',
          animation:'morph 13s ease-in-out infinite reverse, drift-2 14s ease-in-out infinite',
        }} />
        {/* Centre tertiary */}
        <div style={{
          position:'absolute', top:'30%', left:'20%',
          width:500, height:500,
          background:'radial-gradient(ellipse, rgba(224,195,252,0.22) 0%, transparent 70%)',
          filter:'blur(70px)',
          animation:'breathe-slow 14s ease-in-out infinite',
        }} />

        {/* Noise overlay */}
        <div className="noise-overlay" />

        {/* Rotating decorative ring */}
        <div style={{ position:'absolute', top:'8%', right:'8%', width:320, height:320 }}>
          <svg viewBox="0 0 320 320" style={{ animation:'spin-slow 25s linear infinite', opacity:0.12 }}>
            <circle cx="160" cy="160" r="150" fill="none" stroke="url(#sRing1)" strokeWidth="1" strokeDasharray="10 8" />
            <circle cx="160" cy="160" r="120" fill="none" stroke="url(#sRing2)" strokeWidth="0.5" strokeDasharray="5 14" />
            <defs>
              <linearGradient id="sRing1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#dec8ff" />
                <stop offset="100%" stopColor="#b1f2b8" />
              </linearGradient>
              <linearGradient id="sRing2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#e0c3fc" />
                <stop offset="100%" stopColor="#dec8ff" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Second ring bottom left */}
        <div style={{ position:'absolute', bottom:'10%', left:'5%', width:220, height:220 }}>
          <svg viewBox="0 0 220 220" style={{ animation:'spin-slow 35s linear infinite reverse', opacity:0.09 }}>
            <circle cx="110" cy="110" r="100" fill="none" stroke="url(#sRing3)" strokeWidth="1" strokeDasharray="8 14" />
            <defs>
              <linearGradient id="sRing3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#b1f2b8" />
                <stop offset="100%" stopColor="#e0c3fc" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Floating star particles */}
        {Array.from({length:10}).map((_,i) => (
          <div key={i} className="star-particle" style={{
            width:  2+(i%3), height: 2+(i%3),
            top:  `${(i*11+5)%100}%`, left: `${(i*13+8)%100}%`,
            background: ['#dec8ff','#b1f2b8','#e0c3fc','#cfbaf0'][i%4],
            '--delay':    `${(i*0.8)%5}s`,
            '--duration': `${3+(i%3)}s`,
          } as React.CSSProperties} />
        ))}
      </div>

      {/* ── Sign-In Card ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity:0, y:28, scale:0.97 }}
        animate={{ opacity:1, y:0,  scale:1 }}
        transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}
        className="w-full max-w-lg relative"
      >
        {/* Iridescent animated border */}
        <div className="absolute inset-0 rounded-[3rem] p-px pointer-events-none"
          style={{
            background:'linear-gradient(135deg,rgba(222,200,255,0.6),rgba(177,242,184,0.4),rgba(224,195,252,0.6))',
            backgroundSize:'300% 300%',
            animation:'gradient-shift 5s ease infinite',
          }}>
          <div className="w-full h-full rounded-[calc(3rem-1px)] bg-transparent" />
        </div>

        {/* Card body */}
        <div
          className="relative rounded-[3rem] overflow-hidden"
          style={{
            background:'rgba(255,255,255,0.78)',
            backdropFilter:'blur(40px)',
            WebkitBackdropFilter:'blur(40px)',
            boxShadow:'0 32px 80px rgba(100,83,130,0.14), inset 0 1px 1px rgba(255,255,255,0.8)',
          }}
        >
          {/* Card inner top glow */}
          <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
            style={{ background:'linear-gradient(180deg,rgba(222,200,255,0.20) 0%,transparent 100%)' }} />

          <div className="relative z-10 px-12 py-14">
            {/* Logo & heading */}
            <div className="flex flex-col items-center gap-5 mb-11">
              <motion.div
                animate={{ rotate:[0,4,-4,0] }}
                transition={{ duration:6, repeat:Infinity, ease:'easeInOut' }}
                className="relative"
              >
                <div
                  className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-white relative overflow-hidden shadow-2xl shadow-purple-500/20 border border-purple-100"
                >
                  <img 
                    src="/logo.png" 
                    alt="Anuvad Logo" 
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                {/* Pulse ring */}
                <div
                  className="absolute inset-0 rounded-[1.5rem]"
                  style={{
                    border:'2px solid rgba(124,58,237,0.40)',
                    animation:'ring-pulse 2.5s cubic-bezier(0.22,1,0.36,1) infinite',
                    pointerEvents:'none',
                  }}
                />
              </motion.div>

              <div className="text-center">
                <h1
                  className="text-4xl font-black tracking-tight"
                  style={{ fontFamily:"'Space Grotesk',sans-serif", color:'#1a1a2e', letterSpacing:'-0.025em' }}
                >
                  Welcome Back
                </h1>
                <p className="text-[15px] font-medium mt-2" style={{ color:'#5c5a63' }}>
                  Log in to your Anuvad account to continue.
                </p>
              </div>
            </div>

            {/* Form */}
            <form
              className="space-y-5"
              onSubmit={e => { e.preventDefault(); navigate('/dashboard'); }}
            >
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.18em] ml-2" style={{ color:'#9ca3af' }}>
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-purple-500"
                    size={18} style={{ color:'#c4b5fd' }}
                  />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full rounded-2xl py-4 pl-14 pr-5 text-[15px] font-medium outline-none transition-all duration-250"
                    style={{
                      background:'rgba(243,239,251,0.80)',
                      border:'2px solid transparent',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.border = '2px solid rgba(124,58,237,0.28)';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.08)';
                      e.currentTarget.style.background = '#fff';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.border = '2px solid transparent';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = 'rgba(243,239,251,0.80)';
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color:'#9ca3af' }}>
                    Password
                  </label>
                  <button type="button" className="text-[10px] font-black uppercase tracking-[0.12em] transition-colors" style={{ color:'#7c3aed' }}>
                    Forgot?
                  </button>
                </div>
                <div className="relative group">
                  <Lock
                    className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-purple-500"
                    size={18} style={{ color:'#c4b5fd' }}
                  />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full rounded-2xl py-4 pl-14 pr-12 text-[15px] font-medium outline-none transition-all duration-250"
                    style={{ background:'rgba(243,239,251,0.80)', border:'2px solid transparent' }}
                    onFocus={e => {
                      e.currentTarget.style.border = '2px solid rgba(124,58,237,0.28)';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.08)';
                      e.currentTarget.style.background = '#fff';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.border = '2px solid transparent';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = 'rgba(243,239,251,0.80)';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color:'#c4b5fd' }}
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale:1.02 }}
                whileTap={{ scale:0.97 }}
                className="btn-primary w-full justify-center py-5 text-[13px] mt-2"
              >
                Sign In <ArrowRight size={16} />
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center my-8">
              <div className="flex-1" style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(174,172,182,0.25),transparent)' }} />
              <span className="mx-5 text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color:'#b0adb8' }}>Or continue with</span>
              <div className="flex-1" style={{ height:1, background:'linear-gradient(90deg,rgba(174,172,182,0.25),transparent)' }} />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { Icon:Globe, label:'Google' },
                { Icon:Key, label:'Enterprise SSO' },
              ].map(({ Icon, label }) => (
                <motion.button
                  key={label}
                  whileHover={{ y:-2, boxShadow:'0 8px 24px rgba(100,83,130,0.10)' }}
                  whileTap={{ scale:0.97 }}
                  className="flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[13px] font-bold transition-all duration-200"
                  style={{
                    background:'rgba(255,255,255,0.70)',
                    border:'1px solid rgba(174,172,182,0.18)',
                    backdropFilter:'blur(12px)',
                    color:'#5c5a63',
                  }}
                >
                  <Icon size={18} /> {label}
                </motion.button>
              ))}
            </div>

            <p className="text-center mt-8 text-[14px] font-medium" style={{ color:'#9ca3af' }}>
              New to Anuvad?{' '}
              <button className="font-bold transition-colors" style={{ color:'#7c3aed' }}>
                Create an account
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
