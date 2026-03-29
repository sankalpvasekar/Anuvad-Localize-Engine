/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f9f5ff',
        surface: '#fdfbff',
        'surface-container-low': '#f3effb',
        'surface-container': '#eae6f3',
        'surface-container-high': '#e4e1ee',
        'surface-container-highest': '#dedbe9',
        'surface-container-lowest': '#ffffff',
        primary: '#645382',
        'primary-container': '#dec8ff',
        'primary-dim': '#584775',
        secondary: '#2b673a',
        'secondary-container': '#b1f2b8',
        tertiary: '#695182',
        'tertiary-container': '#e0c3fc',
        error: '#b41340',
        'error-container': '#f74b6d',
        'on-surface': '#2f2e36',
        'on-surface-variant': '#5c5a63',
        'on-primary': '#f9efff',
        'outline-variant': 'rgba(174, 172, 182, 0.15)',
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        'glass':     '0 20px 40px rgba(100, 83, 130, 0.06)',
        'glass-lg':  '0 32px 64px rgba(100, 83, 130, 0.12)',
        'glow-primary':   '0 0 40px rgba(100, 83, 130, 0.28)',
        'glow-secondary': '0 0 40px rgba(43, 103, 58, 0.22)',
        'glow-tertiary':  '0 0 40px rgba(105, 81, 130, 0.22)',
        'card-hover': '0 40px 80px rgba(100, 83, 130, 0.14)',
        'inner-glow': 'inset 0 1px 1px rgba(255,255,255,0.6)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':       { transform: 'translateY(-24px) rotate(1deg)' },
          '66%':       { transform: 'translateY(-12px) rotate(-1deg)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':       { transform: 'translateY(20px) rotate(-1deg)' },
          '66%':       { transform: 'translateY(8px) rotate(1deg)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)',    opacity: '0.50' },
          '50%':       { transform: 'scale(1.08)', opacity: '0.70' },
        },
        'breathe-slow': {
          '0%, 100%': { transform: 'scale(1) translate(0,0)',           opacity: '0.35' },
          '30%':       { transform: 'scale(1.06) translate(15px,-10px)', opacity: '0.55' },
          '60%':       { transform: 'scale(0.97) translate(-10px,8px)',  opacity: '0.45' },
        },
        morph: {
          '0%,100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '25%':      { borderRadius: '40% 60% 55% 45% / 45% 65% 35% 55%' },
          '50%':      { borderRadius: '30% 60% 70% 40% / 50% 40% 60% 50%' },
          '75%':      { borderRadius: '55% 45% 40% 60% / 30% 60% 40% 70%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'gradient-shift': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        'slide-up-fade': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%':      { opacity: '1',   transform: 'scale(1.2)' },
        },
        'ring-pulse': {
          '0%':   { transform: 'scale(1)',   opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'border-draw': {
          '0%':   { strokeDashoffset: '400' },
          '100%': { strokeDashoffset: '0' },
        },
        'drift-1': {
          '0%,100%': { transform: 'translate(0,0)' },
          '50%':      { transform: 'translate(30px,-20px)' },
        },
        'drift-2': {
          '0%,100%': { transform: 'translate(0,0)' },
          '50%':      { transform: 'translate(-25px,18px)' },
        },
        'drift-3': {
          '0%,100%': { transform: 'translate(0,0)' },
          '50%':      { transform: 'translate(18px,25px)' },
        },
        countUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'float':          'float 8s ease-in-out infinite',
        'float-slow':     'float 13s ease-in-out infinite',
        'float-reverse':  'float-reverse 10s ease-in-out infinite',
        'breathe':        'breathe 6s ease-in-out infinite',
        'breathe-slow':   'breathe-slow 14s ease-in-out infinite',
        'morph':          'morph 10s ease-in-out infinite',
        'morph-slow':     'morph 16s ease-in-out infinite',
        'shimmer':        'shimmer 3s linear infinite',
        'spin-slow':      'spin-slow 22s linear infinite',
        'gradient-shift': 'gradient-shift 7s ease infinite',
        'slide-up-fade':  'slide-up-fade 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in':       'scale-in 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'twinkle':        'twinkle 3s ease-in-out infinite',
        'ring-pulse':     'ring-pulse 2s cubic-bezier(0.22,1,0.36,1) infinite',
        'border-draw':    'border-draw 1.5s ease forwards',
        'drift-1':        'drift-1 9s ease-in-out infinite',
        'drift-2':        'drift-2 11s ease-in-out infinite',
        'drift-3':        'drift-3 13s ease-in-out infinite',
        'count-up':       'countUp 0.6s cubic-bezier(0.22,1,0.36,1) both',
      },
      backdropBlur: {
        '4xl': '80px',
      },
    },
  },
  plugins: [],
}
