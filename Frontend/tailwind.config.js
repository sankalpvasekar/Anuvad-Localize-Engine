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
        secondary: '#2b673a',
        'secondary-container': '#b1f2b8',
        tertiary: '#695182',
        'tertiary-container': '#e0c3fc',
        error: '#b41340',
        'error-container': '#f74b6d',
        'on-surface': '#2f2e36',
        'on-surface-variant': '#5c5a63',
        'outline-variant': 'rgba(174, 172, 182, 0.15)',
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        'glass': '0 20px 40px rgba(100, 83, 130, 0.06)',
      }
    },
  },
  plugins: [],
}
