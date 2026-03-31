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
          <motion.div
            whileHover={{ scale:1.03 }}
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white relative overflow-hidden shadow-lg shadow-purple-500/10 border border-purple-100"
            >
              <img 
                src="/logo.png" 
                alt="Anuvad Logo" 
                className="w-full h-full object-contain p-1"
              />
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
      <section ref={heroRef} className="relative pt-24 pb-28 px-6 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-16">

          {/* ── Left: Text + CTAs ── */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start"
          >
            {/* Pill badge */}
            <motion.div
              variants={fadeUp}
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
              variants={fadeUp}
              className="max-w-xl"
              style={{ fontSize:'clamp(38px,5.5vw,72px)', fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, lineHeight:1.06, letterSpacing:'-0.025em', color:'#1a1a2e' }}
            >
              voices so real,{' '}
              <br />
              <span className="text-shimmer">you won't know it's AI</span>
            </motion.h1>

            {/* Sub-copy */}
            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg leading-relaxed max-w-lg"
              style={{ color:'#5c5a63' }}
            >
              Generate AI voiceovers in{' '}
              <span className="font-bold" style={{ color:'#7c3aed' }}>हिन्दी, தமிழ், বাংলা</span>{' '}
              & 10+ Indian languages. Upload once, localize everywhere — fast, accurate, human.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <motion.button
                whileHover={{ scale:1.05 }}
                whileTap={{ scale:0.96 }}
                onClick={() => navigate('/dashboard')}
                className="btn-primary text-[13px] px-10 py-5 flex items-center gap-2"
              >
                Get Started Free <ArrowRight size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale:1.03 }}
                whileTap={{ scale:0.97 }}
                onClick={() => navigate('/upload')}
                className="text-[13px] px-10 py-5 flex items-center gap-2 rounded-full font-black tracking-wide"
                style={{ background:'rgba(124,58,237,0.07)', color:'#7c3aed', border:'1px solid rgba(124,58,237,0.18)' }}
              >
                Try Demo
              </motion.button>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              variants={fadeUp}
              className="mt-14 flex items-center gap-8 flex-wrap"
            >
              {[
                { val:'10+',   label:'Indian Languages' },
                { val:'50k+',  label:'Videos Dubbed' },
                { val:'99%',   label:'Accuracy Rate' },
                { val:'< 2min',label:'Processing Time' },
              ].map((s,i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-black text-shimmer" style={{ letterSpacing:'-0.03em' }}>{s.val}</div>
                  <div className="text-[11px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Glassmorphism Logo Showcase ── */}
          <motion.div
            initial={{ opacity:0, x:40, scale:0.95 }}
            animate={{ opacity:1, x:0,  scale:1   }}
            transition={{ duration:0.9, delay:0.25, ease:[0.22,1,0.36,1] }}
            className="relative flex items-center justify-center"
          >
            {/* Outer glow ring */}
            <div
              className="absolute"
              style={{
                width:460, height:460,
                borderRadius:'50%',
                background:'radial-gradient(ellipse, rgba(167,139,250,0.28) 0%, rgba(196,181,253,0.12) 50%, transparent 70%)',
                filter:'blur(40px)',
                animation:'breathe-slow 6s ease-in-out infinite',
              }}
            />

            {/* Animated dashed ring */}
            <div className="absolute" style={{ width:420, height:420 }}>
              <svg viewBox="0 0 420 420" style={{ animation:'spin-slow 24s linear infinite', opacity:0.18 }}>
                <circle cx="210" cy="210" r="200" fill="none" stroke="url(#heroRing)" strokeWidth="1.5" strokeDasharray="12 10" />
                <defs>
                  <linearGradient id="heroRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Glassmorphism card */}
            <motion.div
              whileHover={{ scale:1.03, rotate:-1 }}
              transition={{ type:'spring', stiffness:260, damping:22 }}
              className="relative z-10 flex flex-col items-center justify-center"
              style={{
                width:360, height:360,
                borderRadius:'3rem',
                background:'rgba(255,255,255,0.25)',
                backdropFilter:'blur(32px)',
                WebkitBackdropFilter:'blur(32px)',
                border:'1.5px solid rgba(255,255,255,0.55)',
                boxShadow:'0 24px 64px rgba(124,58,237,0.14), 0 2px 0 rgba(255,255,255,0.8) inset, 0 -1px 0 rgba(124,58,237,0.08) inset',
              }}
            >
              {/* Inner subtle gradient overlay */}
              <div
                className="absolute inset-0 rounded-[3rem] pointer-events-none"
                style={{
                  background:'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(222,200,255,0.15) 50%, rgba(177,242,184,0.10) 100%)',
                }}
              />

              {/* Logo image */}
              <motion.img
                src="/logo.png"
                alt="Anuvad Logo"
                animate={{ y:[0,-8,0] }}
                transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
                style={{ width:220, height:220, objectFit:'contain', position:'relative', zIndex:10, filter:'drop-shadow(0 16px 32px rgba(124,58,237,0.28))' }}
              />

              {/* Brand name below logo */}
              <p
                className="relative z-10 mt-1 font-black tracking-[0.12em] uppercase"
                style={{ fontSize:22, color:'#4c1d95', letterSpacing:'0.18em', textShadow:'0 1px 8px rgba(124,58,237,0.18)' }}
              >
                Anuvad
              </p>
            </motion.div>

            {/* Floating tag chips around card */}
            {[
              { label:'हिन्दी', top:'8%',  left:'-2%',  delay:0    },
              { label:'தமிழ்', top:'12%', right:'-4%', delay:0.4  },
              { label:'বাংলা', bottom:'18%', left:'-6%', delay:0.8 },
              { label:'తెలుగు', bottom:'10%', right:'-2%', delay:1.2 },
            ].map((chip,i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, scale:0.7 }}
                animate={{ opacity:1, scale:1   }}
                transition={{ duration:0.5, delay:0.6 + chip.delay, ease:[0.22,1,0.36,1] }}
                style={{
                  position:'absolute',
                  top:chip.top, left:(chip as any).left, right:(chip as any).right, bottom:(chip as any).bottom,
                  background:'rgba(255,255,255,0.72)',
                  backdropFilter:'blur(16px)',
                  WebkitBackdropFilter:'blur(16px)',
                  border:'1px solid rgba(124,58,237,0.20)',
                  borderRadius:999,
                  padding:'6px 18px',
                  fontSize:13,
                  fontWeight:700,
                  color:'#4c1d95',
                  boxShadow:'0 4px 16px rgba(124,58,237,0.10)',
                  whiteSpace:'nowrap',
                  animation:`breathe ${3.5 + i*0.4}s ease-in-out ${i*0.3}s infinite`,
                }}
              >
                {chip.label}
              </motion.div>
            ))}
          </motion.div>
        </div>
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
