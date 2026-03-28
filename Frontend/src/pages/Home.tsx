import { motion } from 'framer-motion';
import { Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/30 to-purple-50/40 text-[#2f2e36] font-body selection:bg-purple-100/50 overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-gray-100/50 sticky top-0 bg-white/70 backdrop-blur-xl z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-12">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-[#7c3aed] rounded-lg flex items-center justify-center text-white">
                <span className="font-bold text-lg italic transition-transform group-hover:scale-110">A</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#2f2e36]">Anuvad</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Search size={22} className="text-gray-500 cursor-pointer hover:text-[#7c3aed]" />
            <User size={22} className="text-gray-500 cursor-pointer hover:text-[#7c3aed]" />
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#2e1065] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1e0a45] transition-all uppercase text-[12px] tracking-wide shadow-sm"
            >
              Try Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-100/50 rounded-full blur-[150px] -z-10 opacity-70" />
        <div className="absolute top-40 left-0 w-[600px] h-[600px] bg-pink-100/40 rounded-full blur-[150px] -z-10 opacity-60" />
        
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[64px] font-black leading-[1.1] tracking-tight text-[#1a1a1a]"
          >
            voices so real,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9333ea] to-[#db2777]">
              you won't know it's AI
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Generate AI voiceovers in <span className="text-purple-600 font-bold underline decoration-purple-200">हिन्दी, தமிழ், বাংলা</span> & others.
            Create projects that feel real and relatable rather than 
            <span className="text-gray-900 font-bold"> cold and mechanical</span> with Anuvad in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-6 pt-4"
          >
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#d946ef] text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-[#c026d3] transition-all shadow-xl hover:shadow-2xl uppercase tracking-widest"
            >
              Get Started
            </button>
            <button className="text-[#2e1065] font-black border-b-2 border-[#2e1065] text-xs uppercase tracking-[0.2em] hover:text-[#7c3aed] hover:border-[#7c3aed] transition-colors pb-1">
              View All Features
            </button>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            {[
              { 
                title: "AI Dubbing", 
                desc: "Translate your videos into any language with real-like AI voices that maintain the true meaning and emotion of your original message.",
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#purpleGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="4" />
                    <path d="M10 8l5 4-5 4V8z" fill="url(#purpleGradient)" />
                    <path d="M18 10v4M20 8v8" strokeWidth="2" />
                  </svg>
                )
              },
              { 
                title: "AI Subtitles", 
                desc: "Auto-generate perfectly-synced, accurate subtitles in हिन्दी and 10+ Indian regional scripts to reach every viewer, on every platform.",
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#purpleGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                    <path d="M7 8h10M7 12h7" strokeWidth="2" />
                  </svg>
                )
              },
              { 
                title: "Text To Speech", 
                desc: "Get realistic AI voiceovers for your text in any style, tone, and emotion you need in seconds without the hassle of hiring voice artists.",
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#purpleGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 14l3 3m0-6l-3 3" stroke="url(#purpleGradient)" strokeWidth="2" />
                    <circle cx="16" cy="14" r="3" />
                  </svg>
                )
              },
              { 
                title: "API", 
                desc: "Get full control over voices and use them your way—for videos, customer interactions & more. Easily integrate our voices into your platform or workflow.",
                dark: true,
                isNew: true,
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="4" />
                    <path d="M8 10l-2 2 2 2M16 10l2 2-2 2M13 8l-2 8" />
                  </svg>
                )
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6, boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)" }}
                className={`p-10 rounded-[2.5rem] transition-all cursor-pointer flex flex-col min-h-[380px] relative overflow-hidden group ${feature.dark ? 'bg-[#151515] text-white shadow-2xl' : 'bg-[#fce7f3] border border-pink-200 shadow-sm hover:shadow-2xl'}`}
              >
                {/* SVG Gradient Definition */}
                <svg className="absolute w-0 h-0">
                  <defs>
                    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#db2777" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* 'Cardient' Background - Darker Pink (Static) */}
                {!feature.dark && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fce7f3] via-[#fce7f3] to-[#fae8ff] -z-0 pointer-events-none" />
                )}

                {/* Animated Border Line Overlay (Hover Only) */}
                {!feature.dark && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <rect 
                        x="0.5" y="0.5" width="99" height="99" 
                        rx="10" ry="10" 
                        fill="none" 
                        stroke="#db2777" 
                        strokeWidth="1.5" 
                        strokeDasharray="20 10" 
                        className="animate-border-draw"
                        style={{ vectorEffect: 'non-scaling-stroke' }}
                      />
                    </svg>
                  </div>
                )}
                
                {/* Diagonal Ribbon for 'new' */}
                {feature.isNew && (
                  <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden z-20">
                    <div className="absolute top-4 -right-8 w-32 bg-gradient-to-r from-[#7c3aed] to-[#d946ef] text-white text-[10px] font-black py-1.5 text-center rotate-45 uppercase tracking-widest shadow-lg">
                      new
                    </div>
                  </div>
                )}

                <div className="relative z-10 flex flex-col h-full">
                  <div className={`mb-10 p-4 rounded-2xl w-fit inline-flex items-center justify-center ${feature.dark ? 'bg-white/10' : 'bg-white shadow-md border border-pink-200'}`}>
                    {feature.icon}
                  </div>
                  <h3 className={`text-[22px] font-black mb-4 tracking-tight leading-none transition-colors ${feature.dark ? 'text-white' : 'text-[#2e1065] group-hover:text-pink-700'}`}>{feature.title}</h3>
                  <p className={`text-[14px] leading-relaxed font-semibold mb-10 flex-1 ${feature.dark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.desc}
                  </p>
                  <div 
                    onClick={() => navigate(feature.title === 'API' ? '/dashboard' : '/upload', { state: { type: feature.title } })}
                    className={`mt-auto flex items-center gap-2 group/btn cursor-pointer ${feature.dark ? 'text-white' : 'text-[#2e1065]'}`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] border-b-2 border-current pb-0.5 group-hover/btn:text-pink-700 group-hover/btn:border-pink-700 transition-all">TRY NOW</span>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </section>

      {/* Objectives Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 pb-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-pink-100/60 blur-[140px] rounded-full -z-10 pointer-events-none" />
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-[#1a1a1a] mb-4">Core <span className="text-[#7c3aed]">Objectives</span></h2>
          <p className="text-gray-500 font-medium text-lg">Driving the future of digital content accessibility and localization.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-[#fefce8] p-8 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-xl transition-all flex flex-col justify-between min-h-[300px]"
          >
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/50 flex items-center justify-center border border-yellow-200">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=fef08a" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white cursor-pointer hover:bg-yellow-500 transition-colors shadow-lg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            
            <div className="absolute top-1/2 left-0 w-full transform -translate-y-1/2 px-6 opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none">
              <svg viewBox="0 0 400 100" className="w-full h-24" preserveAspectRatio="none">
                <path d="M0,50 Q40,10 80,50 T160,50 T240,50 T320,50 T400,50" fill="none" stroke="url(#gradient-yellow)" strokeWidth="6" strokeLinecap="round" className="animate-[pulse_3s_ease-in-out_infinite]" />
                <path d="M0,50 Q40,90 80,50 T160,50 T240,50 T320,50 T400,50" fill="none" stroke="url(#gradient-yellow)" strokeWidth="4" strokeLinecap="round" className="animate-[pulse_4s_ease-in-out_infinite_animation-delay-1000]" opacity="0.6"/>
                <defs>
                  <linearGradient id="gradient-yellow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#eab308" stopOpacity="0"/>
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#eab308" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <p className="text-[#422006] font-semibold text-lg leading-relaxed relative z-10 mb-8">
              Enable multilingual translation of digital content into Indian languages to improve accessibility for non-technical users across diverse regions.
            </p>
            
            <div className="flex flex-wrap gap-2 mt-auto relative z-10">
              <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-yellow-800 shadow-sm backdrop-blur-sm border border-yellow-100 flex items-center gap-1">😲 Translation</span>
              <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-yellow-800 shadow-sm backdrop-blur-sm border border-yellow-100 flex items-center gap-1">👩 Indian Languages</span>
              <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-yellow-800 shadow-sm backdrop-blur-sm border border-yellow-100 flex items-center gap-1">Accessibility</span>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-[#f0fdf4] p-8 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-xl transition-all flex flex-col justify-between min-h-[300px]"
          >
             <div className="flex items-center gap-4 mb-6 relative z-10">
               <div className="w-10 h-10 rounded-full overflow-hidden bg-white/50 flex items-center justify-center border border-green-200">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=bbf7d0" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-white cursor-pointer hover:bg-green-500 transition-colors shadow-lg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            
            <div className="absolute top-1/2 left-0 w-full transform -translate-y-1/2 px-6 opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none">
              <svg viewBox="0 0 400 100" className="w-full h-24" preserveAspectRatio="none">
                <path d="M0,50 Q50,0 100,50 T200,50 T300,50 T400,50" fill="none" stroke="url(#gradient-green)" strokeWidth="6" strokeLinecap="round" className="animate-[pulse_3.5s_ease-in-out_infinite]" />
                <path d="M0,50 Q40,100 80,50 T160,50 T240,50 T320,50 T400,50" fill="none" stroke="url(#gradient-green)" strokeWidth="4" strokeLinecap="round" className="animate-[pulse_2.5s_ease-in-out_infinite]" opacity="0.6"/>
                <defs>
                  <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0"/>
                    <stop offset="50%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <p className="text-[#052e16] font-semibold text-lg leading-relaxed relative z-10 mb-8">
              Develop an OTT-style content localization framework that supports single-upload processing with dynamic target language selection.
            </p>
            
             <div className="flex flex-wrap gap-2 mt-auto relative z-10">
              <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-green-800 shadow-sm backdrop-blur-sm border border-green-100 flex items-center gap-1">🎙️ OTT-Style</span>
              <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-green-800 shadow-sm backdrop-blur-sm border border-green-100 flex items-center gap-1">👨 Single-upload</span>
              <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-green-800 shadow-sm backdrop-blur-sm border border-green-100 flex items-center gap-1">🇮🇪 Target</span>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-[#f5f3ff] p-8 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-xl transition-all flex flex-col justify-between min-h-[300px]"
          >
            <div className="flex items-center gap-4 mb-6 relative z-10">
               <div className="w-10 h-10 rounded-full overflow-hidden bg-white/50 flex items-center justify-center border border-purple-200">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=d8b4fe" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white cursor-pointer hover:bg-[#6d28d9] transition-colors shadow-lg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            
            <div className="absolute top-1/2 left-0 w-full transform -translate-y-1/2 px-6 opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none">
              <svg viewBox="0 0 400 100" className="w-full h-24" preserveAspectRatio="none">
                 <path d="M0,50 Q30,10 60,50 T120,50 T180,50 T240,50 T300,50 T360,50 T400,50" fill="none" stroke="url(#gradient-purple)" strokeWidth="6" strokeLinecap="round" className="animate-[pulse_2s_ease-in-out_infinite]" />
                 <path d="M0,50 Q60,80 120,50 T240,50 T360,50 T400,50" fill="none" stroke="url(#gradient-purple)" strokeWidth="4" strokeLinecap="round" className="animate-[pulse_3s_ease-in-out_infinite]" opacity="0.6"/>
                <defs>
                  <linearGradient id="gradient-purple" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0"/>
                    <stop offset="50%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <p className="text-[#2e1065] font-semibold text-lg leading-relaxed relative z-10 mb-8">
              Enhance localization efficiency by reducing redundant computation through parallel and reusable translation.
            </p>
            
            <div className="flex flex-wrap gap-2 mt-auto relative z-10">
              <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-purple-800 shadow-sm backdrop-blur-sm border border-purple-100 flex items-center gap-1">🎙️ Podcast</span>
              <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-purple-800 shadow-sm backdrop-blur-sm border border-purple-100 flex items-center gap-1">👩 Parallel</span>
              <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-purple-800 shadow-sm backdrop-blur-sm border border-purple-100 flex items-center gap-1">Reusable</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
