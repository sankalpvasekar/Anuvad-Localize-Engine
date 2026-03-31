import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Play, Clock, TrendingUp, Zap, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useEffect, useRef } from 'react';

const fadeUp = {
  hidden: { opacity:0, y:20 },
  show:   { opacity:1, y:0, transition:{ duration:0.55, ease:[0.22,1,0.36,1] } },
};
const container = {
  hidden: {},
  show:   { transition:{ staggerChildren:0.10 } },
};

/* Animated counter */
const Counter = ({ value }: { value: number }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 1000;
    const step = Math.ceil(end / (duration / 30));
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      if (spanRef.current) spanRef.current.textContent = String(start);
      if (start >= end) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span ref={spanRef}>{value}</span>;
};

const statConfig = [
  {
    label: 'Total Projects',
    icon: TrendingUp,
    accent: '#7c3aed',
    blob: 'rgba(222,200,255,0.55)',
    badge: { bg:'rgba(124,58,237,0.10)', color:'#7c3aed', text:'This month' },
  },
  {
    label: 'Total Processing',
    icon: Zap,
    accent: '#d946ef',
    blob: 'rgba(224,195,252,0.55)',
    badge: { bg:'rgba(217,70,239,0.10)', color:'#d946ef', text:'Active now' },
  },
  {
    label: 'Languages Used',
    icon: Globe,
    accent: '#2b673a',
    blob: 'rgba(177,242,184,0.55)',
    badge: { bg:'rgba(43,103,58,0.10)', color:'#2b673a', text:'Tracked' },
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();

  const stats = [
    projects.length,
    projects.filter(p => p.status === 'Processing').length,
    new Set(projects.map(p => p.lang)).size,
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12">

      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity:0, y:-16 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
        className="flex items-center justify-between"
      >
        <div>
          {/* Greeting pill */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color:'#a855f7' }}>
              Live Workspace
            </span>
          </div>
          <h1
            className="text-4xl font-black tracking-tight"
            style={{ fontFamily:"'Space Grotesk',sans-serif", color:'#1a1a2e', letterSpacing:'-0.025em' }}
          >
            अभिवादन, स्वागतम् 👋
          </h1>
          <p className="text-[15px] font-medium mt-2" style={{ color:'#6b6977' }}>
            Ready to localize your stories with Anuvad?
          </p>
        </div>

        <motion.button
          whileHover={{ scale:1.04 }}
          whileTap={{ scale:0.97 }}
          onClick={() => navigate('/upload')}
          className="btn-primary text-[11px] px-8 py-4 gap-2.5 relative overflow-hidden"
        >
          <Plus size={17} />
          New Project
        </motion.button>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {statConfig.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              variants={fadeUp}
              className="relative rounded-[2rem] overflow-hidden group cursor-default"
              style={{
                background:'rgba(255,255,255,0.62)',
                backdropFilter:'blur(28px)',
                WebkitBackdropFilter:'blur(28px)',
                border:'1px solid rgba(174,172,182,0.18)',
                boxShadow:'0 8px 32px rgba(100,83,130,0.06), inset 0 1px 1px rgba(255,255,255,0.6)',
              }}
            >
              {/* Background colour blob */}
              <motion.div
                className="absolute pointer-events-none"
                animate={{ scale:[1,1.12,1], opacity:[0.45,0.65,0.45] }}
                transition={{ duration:6+i*2, repeat:Infinity, ease:'easeInOut' }}
                style={{
                  width:200, height:200,
                  top:-40, right:-40,
                  borderRadius:'50%',
                  background: s.blob,
                  filter:'blur(40px)',
                }}
              />

              {/* Inner top shimmer */}
              <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
                style={{ background:'linear-gradient(180deg,rgba(255,255,255,0.35) 0%,transparent 100%)' }} />

              <div className="relative z-10 p-8">
                <div className="flex items-start justify-between mb-5">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{ background:`linear-gradient(135deg,${s.accent}22 0%,${s.accent}10 100%)` }}
                  >
                    <div className="absolute inset-0" style={{ background:'linear-gradient(135deg,rgba(255,255,255,0.4) 0%,transparent 60%)' }} />
                    <Icon size={20} className="relative z-10" style={{ color:s.accent }} />
                  </div>
                  {/* Badge */}
                  <span
                    className="text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider"
                    style={{ background:s.badge.bg, color:s.badge.color }}
                  >
                    {s.badge.text}
                  </span>
                </div>

                <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-2" style={{ color:'#b0adb8' }}>
                  {s.label}
                </p>
                <div
                  className="text-5xl font-black"
                  style={{ fontFamily:"'Space Grotesk',sans-serif", color:'#1a1a2e', letterSpacing:'-0.03em', lineHeight:1 }}
                >
                  <Counter value={stats[i]} />
                </div>

                {/* Sparkline bar */}
                <div className="mt-5 flex gap-1 items-end h-8">
                  {[40,65,45,80,55,90,70,85,60,95].map((h,b) => (
                    <motion.div
                      key={b}
                      initial={{ scaleY:0 }}
                      animate={{ scaleY:1 }}
                      transition={{ delay:0.4+b*0.05, duration:0.5, ease:[0.22,1,0.36,1] }}
                      className="flex-1 rounded-sm origin-bottom"
                      style={{ height:`${h}%`, background:`${s.accent}${30+b*4}`, minWidth:3 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Projects Grid ───────────────────────────────────── */}
      <div className="space-y-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ duration:0.5, delay:0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2
              className="text-2xl font-black"
              style={{ fontFamily:"'Space Grotesk',sans-serif", color:'#1a1a2e', letterSpacing:'-0.02em' }}
            >
              Recent Projects
            </h2>
            <p className="text-[13px] font-medium mt-1" style={{ color:'#b0adb8' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                type="text"
                placeholder="Search projects…"
                className="rounded-2xl pl-11 pr-5 py-2.5 text-[13px] font-medium outline-none transition-all"
                style={{
                  background:'rgba(255,255,255,0.65)',
                  backdropFilter:'blur(16px)',
                  border:'1px solid rgba(174,172,182,0.18)',
                  width:220,
                  color:'#2f2e36',
                }}
                onFocus={e => { e.currentTarget.style.boxShadow='0 0 0 3px rgba(124,58,237,0.10)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.25)'; }}
                onBlur={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(174,172,182,0.18)'; }}
              />
            </div>
            {/* Filter */}
            <motion.button
              whileHover={{ scale:1.05 }}
              whileTap={{ scale:0.95 }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
              style={{
                background:'rgba(255,255,255,0.65)',
                backdropFilter:'blur(16px)',
                border:'1px solid rgba(174,172,182,0.18)',
                color:'#7c3aed',
              }}
            >
              <Filter size={16} />
            </motion.button>
          </div>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
        >
          {projects.map(proj => (
            <motion.div
              key={proj.id}
              variants={fadeUp}
              whileHover={{ y:-10, transition:{ duration:0.35, ease:[0.22,1,0.36,1] } }}
              className="relative rounded-[2rem] overflow-hidden cursor-pointer group"
              style={{
                background:'rgba(255,255,255,0.62)',
                backdropFilter:'blur(28px)',
                WebkitBackdropFilter:'blur(28px)',
                border:'1px solid rgba(174,172,182,0.15)',
                boxShadow:'0 8px 32px rgba(100,83,130,0.06)',
              }}
            >
              {/* Hover iridescent border */}
              <div
                className="absolute inset-0 rounded-[2rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:'linear-gradient(135deg,#dec8ff,#b1f2b8,#e0c3fc)',
                  backgroundSize:'300% 300%',
                  animation:'gradient-shift 4s ease infinite',
                  padding:'1px',
                  mask:'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMask:'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite:'exclude',
                  WebkitMaskComposite:'xor',
                }}
              />

              {/* Preview */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={proj.preview}
                  alt={proj.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale:0, opacity:0 }}
                    whileHover={{ scale:1, opacity:1 }}
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white"
                    style={{
                      background:'rgba(255,255,255,0.18)',
                      backdropFilter:'blur(16px)',
                      border:'1px solid rgba(255,255,255,0.35)',
                    }}
                  >
                    <Play size={20} fill="white" />
                  </motion.div>
                </div>

                {/* Language badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className="text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-wider text-white"
                    style={{ background:'linear-gradient(135deg,#7c3aed,#d946ef)', boxShadow:'0 4px 12px rgba(124,58,237,0.35)' }}
                  >
                    {proj.lang}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-7">
                <div className="flex items-start justify-between mb-4">
                  <h3
                    className="text-lg font-black line-clamp-1 flex-1"
                    style={{ fontFamily:"'Space Grotesk',sans-serif", color:'#1a1a2e', letterSpacing:'-0.01em' }}
                  >
                    {proj.title}
                  </h3>
                  <button className="text-gray-300 hover:text-gray-600 ml-3 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[12px] font-semibold">
                  <div className="flex items-center gap-1.5" style={{ color:'#b0adb8' }}>
                    <Clock size={13} />
                    <span>{proj.date}</span>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full font-black uppercase tracking-wider text-[10px]"
                    style={
                      proj.status === 'Completed'
                        ? { background:'rgba(43,103,58,0.10)', color:'#2b673a' }
                        : proj.status === 'Processing'
                        ? { background:'rgba(124,58,237,0.10)', color:'#7c3aed' }
                        : { background:'rgba(0,0,0,0.05)', color:'#9ca3af' }
                    }
                  >
                    {proj.status === 'Processing' && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                    )}
                    {proj.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add New Card */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y:-10, transition:{ duration:0.35, ease:[0.22,1,0.36,1] } }}
            onClick={() => navigate('/upload')}
            className="relative rounded-[2rem] flex flex-col items-center justify-center gap-5 cursor-pointer group overflow-hidden"
            style={{
              minHeight:320,
              border:'2px dashed rgba(174,172,182,0.30)',
              background:'rgba(255,255,255,0.28)',
              backdropFilter:'blur(16px)',
              transition:'all 0.35s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            {/* Hover fill */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
              style={{ background:'rgba(255,255,255,0.45)' }}
            />

            <motion.div
              whileHover={{ scale:1.12, rotate:5 }}
              transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center relative overflow-hidden z-10"
              style={{ background:'linear-gradient(135deg,rgba(222,200,255,0.60),rgba(177,242,184,0.50))' }}
            >
              <div className="absolute inset-0" style={{ background:'linear-gradient(135deg,rgba(255,255,255,0.30) 0%,transparent 60%)' }} />
              <Plus size={30} className="relative z-10" style={{ color:'#7c3aed' }} />
            </motion.div>

            <div className="text-center z-10">
              <p className="font-black text-lg" style={{ fontFamily:"'Space Grotesk',sans-serif", color:'#5c5a63' }}>
                Create New Project
              </p>
              <p className="text-[12px] font-medium mt-1" style={{ color:'#b0adb8' }}>
                Upload & start dubbing
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;