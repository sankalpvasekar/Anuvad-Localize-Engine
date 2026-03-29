import React from 'react';
import Sidebar from './Sidebar';

/* Particle config */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size:   2 + Math.random() * 4,
  top:    `${Math.random() * 100}%`,
  left:   `${Math.random() * 100}%`,
  delay:  `${Math.random() * 6}s`,
  duration: `${3 + Math.random() * 4}s`,
  color:  ['#dec8ff', '#b1f2b8', '#e0c3fc', '#cfbaf0'][Math.floor(Math.random() * 4)],
}));

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full relative overflow-hidden" style={{ background: '#f9f5ff' }}>

      {/* ── Animated Background Canvas ─────────────────────── */}
      <div className="bg-canvas" aria-hidden="true">
        {/* Primary orb – top right */}
        <div
          className="bg-blob bg-blob-1"
          style={{ animation: 'morph 16s ease-in-out infinite, drift-1 11s ease-in-out infinite' }}
        />
        {/* Secondary orb – bottom left */}
        <div
          className="bg-blob bg-blob-2"
          style={{ animation: 'morph 13s ease-in-out infinite reverse, drift-2 13s ease-in-out infinite' }}
        />
        {/* Tertiary centre glow */}
        <div
          className="bg-blob bg-blob-3"
          style={{ animation: 'morph 18s ease-in-out infinite, breathe-slow 14s ease-in-out infinite' }}
        />
        {/* Extra accent bloom – top left */}
        <div
          className="absolute"
          style={{
            width: 500, height: 500,
            top: '-8%', left: '-6%',
            borderRadius: '60% 40% 50% 30% / 40% 60% 50% 70%',
            background: 'radial-gradient(ellipse, rgba(222,200,255,0.32) 0%, transparent 70%)',
            filter: 'blur(70px)',
            animation: 'morph 20s ease-in-out infinite reverse, drift-2 15s ease-in-out infinite',
          }}
        />
        {/* Bottom-right accent */}
        <div
          className="absolute"
          style={{
            width: 450, height: 450,
            bottom: '0%', right: '-4%',
            borderRadius: '40% 60% 70% 30% / 50% 40% 60% 50%',
            background: 'radial-gradient(ellipse, rgba(177,242,184,0.30) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'morph 14s ease-in-out infinite, drift-1 12s ease-in-out infinite',
          }}
        />
      </div>

      {/* Noise Texture Overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* ── Floating Star Particles ──────────────────────────── */}
      <div className="fixed inset-0 z-[-5] pointer-events-none overflow-hidden" aria-hidden="true">
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="star-particle"
            style={{
              width:  p.size,
              height: p.size,
              top:    p.top,
              left:   p.left,
              background: p.color,
              '--delay':    p.delay,
              '--duration': p.duration,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Rotating Decorative Ring ─────────────────────────── */}
      <div
        aria-hidden="true"
        className="fixed pointer-events-none z-[-3]"
        style={{ top: '60%', right: '-180px', width: 420, height: 420 }}
      >
        <svg viewBox="0 0 420 420" style={{ animation: 'spin-slow 22s linear infinite', opacity: 0.12 }}>
          <circle cx="210" cy="210" r="200" fill="none" stroke="url(#ringGrad1)" strokeWidth="1" strokeDasharray="12 8" />
          <circle cx="210" cy="210" r="170" fill="none" stroke="url(#ringGrad2)" strokeWidth="0.5" strokeDasharray="6 12" />
          <defs>
            <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#dec8ff" />
              <stop offset="100%" stopColor="#b1f2b8" />
            </linearGradient>
            <linearGradient id="ringGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#e0c3fc" />
              <stop offset="100%" stopColor="#dec8ff" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Second Rotating Ring ─────────────────────────────── */}
      <div
        aria-hidden="true"
        className="fixed pointer-events-none z-[-3]"
        style={{ bottom: '10%', left: '-120px', width: 300, height: 300 }}
      >
        <svg viewBox="0 0 300 300" style={{ animation: 'spin-slow 30s linear infinite reverse', opacity: 0.10 }}>
          <circle cx="150" cy="150" r="140" fill="none" stroke="url(#ringGrad3)" strokeWidth="1" strokeDasharray="8 14" />
          <defs>
            <linearGradient id="ringGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#b1f2b8" />
              <stop offset="100%" stopColor="#e0c3fc" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Sidebar + Main ───────────────────────────────────── */}
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto p-10 z-0 relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;
