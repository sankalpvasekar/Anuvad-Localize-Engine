import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, User, ArrowRight, Zap, Globe, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

/* ── Stagger variants ───────────────────────────────────────── */
const container: any = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
};
const fadeUp: any = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Feature card data ──────────────────────────────────────── */
const features: Array<{ Icon: any, title: string, desc: string, accent: string, from: string, badge: string, dark?: boolean, isNew?: boolean }> = [
  {
    Icon:  Zap,
    title: 'AI Dubbing',
    desc:  'Translate videos into any language with real-like AI voices that preserve emotion and true meaning.',
    accent: '#d946ef',
    from: 'from-fuchsia-50',
    badge: 'rgba(217,70,239,0.10)',
  },
  {
    Icon:  Globe,
    title: 'AI Subtitles',
    desc:  'Auto-generate perfectly-synced, accurate subtitles in हिन्दी and 10+ Indian regional scripts.',
    accent: '#ec4899',
    from: 'from-pink-50',
    badge: 'rgba(236,72,153,0.10)',
  },
  {
    Icon:  Layers,
    title: 'Text To Speech',
    desc:  'Realistic AI voiceovers for your text in any style, tone, and emotion — in seconds.',
    accent: '#f472b6',
    from: 'from-pink-50',
    badge: 'rgba(244,114,182,0.10)',
  },
];

/* ── Objective card data ─────────────────────────────────────── */
const objectives = [
  {
    bg:      '#fefce8',
    text:    '#422006',
    waveFill:'#eab308',
    tags:    ['😲 Translation', '👩 Indian Languages', 'Accessibility'],
    tagColor:'yellow',
    seed:    'Felix',
    avatarBg:'fef08a',
    body:    'Enable multilingual translation of digital content into Indian languages to improve accessibility for non-technical users across diverse regions.',
  },
  {
    bg:      '#f0fdf4',
    text:    '#052e16',
    waveFill:'#22c55e',
    tags:    ['🎙️ OTT-Style', '👨 Single-upload', '🌐 Target'],
    tagColor:'green',
    seed:    'Jack',
    avatarBg:'bbf7d0',
    body:    'Develop an OTT-style content localization framework that supports single-upload processing with dynamic target language selection.',
  },
  {
    bg:      '#f5f3ff',
    text:    '#2e1065',
    waveFill:'#7c3aed',
    tags:    ['🎙️ Parallel', '⚡ Reusable', '🔄 Efficient'],
    tagColor:'purple',
    seed:    'Mia',
    avatarBg:'d8b4fe',
    body:    'Enhance localization efficiency by reducing redundant computation through parallel and reusable translation pipelines.',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const heroRef  = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const blobY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <div className="min-h-screen text-[#2f2e36] overflow-x-hidden" style={{ background: '#f9f5ff' }}>

      {/* ── Global background blobs ──────────────────────────── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div style={{ y: blobY }} className="absolute inset-0">
          {/* Top-right lavender blob */}
          <div style={{
            position:'absolute', top:'-12%', right:'-6%',
            width:900, height:900,
            borderRadius:'60% 40% 30% 70% / 60% 30% 70% 40%',
            background:'radial-gradient(ellipse, rgba(222,200,255,0.58) 0%, rgba(224,195,252,0.28) 60%, transparent 100%)',
            filter:'blur(90px)',
            animation:'morph 16s ease-in-out infinite, drift-1 11s ease-in-out infinite',
          }} />
          {/* Bottom-left mint blob */}
          <div style={{
            position:'absolute', bottom:'-10%', left:'-8%',
            width:800, height:800,
            borderRadius:'40% 60% 55% 45% / 45% 65% 35% 55%',
            background:'radial-gradient(ellipse, rgba(177,242,184,0.52) 0%, rgba(161,228,170,0.26) 60%, transparent 100%)',
            filter:'blur(80px)',
            animation:'morph 13s ease-in-out infinite reverse, drift-2 13s ease-in-out infinite',
          }} />
          {/* Centre soft purple */}
          <div style={{
            position:'absolute', top:'40%', left:'30%',
            width:600, height:600,
            borderRadius:'50%',
            background:'radial-gradient(ellipse, rgba(224,195,252,0.22) 0%, transparent 70%)',
            filter:'blur(80px)',
            animation:'breathe-slow 14s ease-in-out infinite',
          }} />
        </motion.div>

        {/* Noise texture */}
        <div className="noise-overlay" />

        {/* Floating star particles */}
        {Array.from({length:14}).map((_,i) => (
          <div
            key={i}
            className="star-particle"
            style={{
              width:  2 + (i % 4),
              height: 2 + (i % 4),
              top:  `${(i * 7.3) % 100}%`,
              left: `${(i * 13.4 + 5) % 100}%`,
              background: ['#dec8ff','#b1f2b8','#e0c3fc','#cfbaf0'][i%4],
              '--delay':    `${(i * 0.7) % 5}s`,
              '--duration': `${3 + (i % 4)}s`,
            } as React.CSSProperties}
          />
        ))}

        {/* Rotating ring – top right */}
        <div style={{ position:'absolute', top:'5%', right:'-80px', width:360, height:360 }}>
          <svg viewBox="0 0 360 360" style={{ animation:'spin-slow 22s linear infinite', opacity:0.12 }}>
            <circle cx="180" cy="180" r="170" fill="none" stroke="url(#hRing1)" strokeWidth="1" strokeDasharray="10 8" />
            <circle cx="180" cy="180" r="140" fill="none" stroke="url(#hRing2)" strokeWidth="0.6" strokeDasharray="5 12" />
            <defs>
              <linearGradient id="hRing1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#dec8ff" />
                <stop offset="100%" stopColor="#b1f2b8" />
              </linearGradient>
              <linearGradient id="hRing2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#e0c3fc" />
                <stop offset="100%" stopColor="#dec8ff" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Rotating ring – bottom left */}
        <div style={{ position:'absolute', bottom:'8%', left:'-60px', width:260, height:260 }}>
          <svg viewBox="0 0 260 260" style={{ animation:'spin-slow 30s linear infinite reverse', opacity:0.10 }}>
            <circle cx="130" cy="130" r="120" fill="none" stroke="url(#hRing3)" strokeWidth="1" strokeDasharray="6 14" />
            <defs>
              <linearGradient id="hRing3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#b1f2b8" />
                <stop offset="100%" stopColor="#e0c3fc" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <motion.nav
        initial={{ y:-20, opacity:0 }}
        animate={{ y:0,   opacity:1 }}
        transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
        className="sticky top-0 z-50"
        style={{
          background:'rgba(249,245,255,0.72)',
          backdropFilter:'blur(28px)',
          WebkitBackdropFilter:'blur(28px)',
          borderBottom:'1px solid rgba(174,172,182,0.15)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-8 py-5 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale:1.03 }}
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white relative overflow-hidden"
              style={{ background:'linear-gradient(135deg,#7c3aed,#d946ef)', boxShadow:'0 6px 20px rgba(124,58,237,0.30)' }}
            >
              <div className="absolute inset-0" style={{ background:'linear-gradient(135deg,rgba(255,255,255,0.22) 0%,transparent 55%)' }} />
              <span className="text-lg font-black italic relative z-10">A</span>
            </div>
            <span className="text-[22px] font-black tracking-tight text-[#2f2e36]">Anuvad</span>
          </motion.div>

          {/* Right actions */}
          <div className="flex items-center gap-5">
            <Search size={20} className="text-gray-400 cursor-pointer hover:text-[#7c3aed] transition-colors" />
            <User   size={20} className="text-gray-400 cursor-pointer hover:text-[#7c3aed] transition-colors" />
            <motion.button
              whileHover={{ scale:1.04 }}
              whileTap={{ scale:0.97 }}
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-[12px] px-7 py-3"
            >
              Try Now <ArrowRight size={14} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-32 pb-28 px-6 flex flex-col items-center overflow-hidden">

        {/* Decorative iridescent pill above headline */}
        <motion.div
          initial={{ opacity:0, scale:0.8 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ duration:0.6, delay:0.1, ease:[0.22,1,0.36,1] }}
          className="mb-8 px-5 py-2 rounded-full text-[12px] font-bold uppercase tracking-[0.18em] flex items-center gap-2"
          style={{
            background: 'rgba(222,200,255,0.35)',
            border:     '1px solid rgba(124,58,237,0.20)',
            color:      '#7c3aed',
            backdropFilter:'blur(12px)',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse inline-block" />
          AI-Powered · Indian Languages · Real-Time
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity:0, y:32 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.8, delay:0.15, ease:[0.22,1,0.36,1] }}
          className="text-center max-w-4xl"
          style={{ fontSize:'clamp(44px,7vw,78px)', fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, lineHeight:1.05, letterSpacing:'-0.025em', color:'#1a1a2e' }}
        >
          voices so real,{' '}
          <br />
          <span className="text-shimmer">you won't know it's AI</span>
        </motion.h1>

        {/* Sub-copy */}
        <motion.p
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.7, delay:0.28, ease:[0.22,1,0.36,1] }}
          className="mt-7 text-center text-lg max-w-2xl leading-relaxed"
          style={{ color:'#5c5a63' }}
        >
          Generate AI voiceovers in{' '}
          <span className="font-bold" style={{ color:'#7c3aed' }}>हिन्दी, தமிழ், বাংলা</span>{' '}
          & others. Create projects that feel real and relatable — not{' '}
          <em style={{ color:'#2f2e36', fontStyle:'normal', fontWeight:700 }}>cold and mechanical</em>.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.7, delay:0.40, ease:[0.22,1,0.36,1] }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale:1.05 }}
            whileTap={{ scale:0.96 }}
            onClick={() => navigate('/dashboard')}
            className="btn-primary text-[13px] px-10 py-5 flex items-center gap-2"
          >
            Get Started Free <ArrowRight size={16} />
          </motion.button>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ duration:0.8, delay:0.60 }}
          className="mt-16 flex items-center gap-10 flex-wrap justify-center"
        >
          {[
            { val:'10+', label:'Indian Languages' },
            { val:'50k+', label:'Videos Dubbed' },
            { val:'99%', label:'Accuracy Rate' },
            { val:'< 2min', label:'Processing Time' },
          ].map((s,i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black text-shimmer" style={{ letterSpacing:'-0.03em' }}>{s.val}</div>
              <div className="text-[12px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Feature Cards ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-8 pb-32">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once:true, margin:'-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((f, i) => {
            const Icon = f.Icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y:-10, transition:{ duration:0.35, ease:[0.22,1,0.36,1] } }}
                className="relative rounded-[2rem] overflow-hidden cursor-pointer group"
                style={{
                  background: f.dark ? '#1a1a2e' : 'rgba(255,255,255,0.65)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid',
                  borderColor: f.dark ? 'rgba(255,255,255,0.08)' : 'rgba(174,172,182,0.18)',
                  boxShadow: '0 8px 32px rgba(100,83,130,0.06)',
                  minHeight: 360,
                }}
              >
                {/* Card inner glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2rem]"
                  style={{ background: `radial-gradient(circle at 60% 20%, ${f.dark ? 'rgba(255,255,255,0.04)' : `${f.accent}10`} 0%, transparent 60%)` }}
                />

                {/* Subtle gradient bg */}
                {!f.dark && (
                  <div
                    className="absolute inset-0 opacity-60 pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${f.accent}08 0%, transparent 60%)` }}
                  />
                )}

                {/* NEW badge */}
                {f.isNew && (
                  <div className="absolute top-5 right-5 z-20">
                    <div
                      className="text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full text-white"
                      style={{ background:'linear-gradient(135deg,#7c3aed,#d946ef)', boxShadow:'0 4px 12px rgba(124,58,237,0.40)' }}
                    >
                      NEW
                    </div>
                  </div>
                )}

                {/* Hover iridescent border */}
                <div
                  className="absolute inset-0 rounded-[2rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, #dec8ff, #b1f2b8, #e0c3fc)',
                    backgroundSize: '300% 300%',
                    animation: 'gradient-shift 5s ease infinite',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor',
                    padding: '1px',
                  }}
                />

                <div className="relative z-10 p-9 flex flex-col h-full" style={{ minHeight:360 }}>
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 relative overflow-hidden"
                    style={{
                      background: f.dark
                        ? 'rgba(255,255,255,0.08)'
                        : `linear-gradient(135deg, ${f.accent}18 0%, ${f.accent}08 100%)`,
                      border: `1px solid ${f.dark ? 'rgba(255,255,255,0.10)' : f.accent + '25'}`,
                      boxShadow: `0 8px 20px ${f.accent}22`,
                    }}
                  >
                    <div className="absolute inset-0" style={{ background:'linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%)' }} />
                    <Icon size={22} style={{ color: f.dark ? '#fff' : f.accent }} className="relative z-10" />
                  </div>

                  <h3
                    className="text-xl font-black mb-3 tracking-tight"
                    style={{ fontFamily:"'Space Grotesk',sans-serif", color: f.dark ? '#fff' : '#1a1a2e', letterSpacing:'-0.02em' }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed flex-1" style={{ color: f.dark ? 'rgba(255,255,255,0.55)' : '#5c5a63' }}>
                    {f.desc}
                  </p>

                  <div
                    className="mt-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] cursor-pointer group/cta"
                    style={{ color: f.dark ? '#dec8ff' : f.accent }}
                    onClick={() => navigate(f.title === 'API' ? '/dashboard' : '/upload')}
                  >
                    <span>Try Now</span>
                    <ArrowRight size={12} className="group-hover/cta:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── Objectives ───────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-8 pb-40">
        {/* Section label */}
        <motion.div
          initial={{ opacity:0, y:16 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ background:'rgba(222,200,255,0.30)', color:'#7c3aed', border:'1px solid rgba(124,58,237,0.15)' }}>
            Core Mission
          </div>
          <h2 className="text-4xl font-black text-[#1a1a2e] mb-3" style={{ fontFamily:"'Space Grotesk',sans-serif", letterSpacing:'-0.025em' }}>
            Core <span className="text-gradient-iridescent">Objectives</span>
          </h2>
          <p className="text-gray-500 font-medium text-base max-w-xl mx-auto">
            Driving the future of digital content accessibility and localization.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once:true, margin:'-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {objectives.map((obj, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y:-6, transition:{ duration:0.35, ease:[0.22,1,0.36,1] } }}
              className="relative rounded-[2rem] overflow-hidden group cursor-pointer"
              style={{ background: obj.bg, minHeight:300, boxShadow:'0 8px 32px rgba(0,0,0,0.04)' }}
            >
              {/* hover shimmer overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background:`radial-gradient(circle at 30% 30%, ${obj.waveFill}14 0%, transparent 65%)` }} />

              {/* Animated waveform background */}
              <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 px-6 opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none">
                <svg viewBox="0 0 400 100" className="w-full h-24" preserveAspectRatio="none">
                  <path d={`M0,50 Q${40+i*5},${10+i*8} ${80+i*3},50 T${160+i*2},50 T${240},50 T${320},50 T400,50`}
                    fill="none" stroke={`url(#wg${i})`} strokeWidth="5" strokeLinecap="round"
                    style={{ animation:`breathe ${3+i}s ease-in-out infinite` }} />
                  <path d={`M0,50 Q${50+i*4},${85-i*6} ${100},50 T${200},50 T${300},50 T400,50`}
                    fill="none" stroke={`url(#wg${i})`} strokeWidth="3.5" strokeLinecap="round"
                    style={{ animation:`breathe ${2.5+i*0.5}s ease-in-out ${i*0.4}s infinite`, opacity:0.6 }} />
                  <defs>
                    <linearGradient id={`wg${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor={obj.waveFill} stopOpacity="0" />
                      <stop offset="50%"  stopColor={obj.waveFill} />
                      <stop offset="100%" stopColor={obj.waveFill} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="relative z-10 p-9 flex flex-col h-full" style={{ minHeight:300 }}>
                {/* Avatar row */}
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${obj.seed}&backgroundColor=${obj.avatarBg}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md"
                    style={{ background: obj.waveFill }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>

                <p className="font-semibold text-base leading-relaxed flex-1 mb-8" style={{ color: obj.text }}>
                  {obj.body}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {obj.tags.map((tag, t) => (
                    <span key={t} className="px-3 py-1 rounded-full text-[11px] font-bold shadow-sm"
                      style={{
                        background: 'rgba(255,255,255,0.75)',
                        color: obj.text,
                        border: `1px solid ${obj.waveFill}30`,
                        backdropFilter: 'blur(8px)',
                      }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
