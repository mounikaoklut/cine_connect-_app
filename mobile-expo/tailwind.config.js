/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
        },
        indigo: {
          500: '#6366f1',
          600: '#4f46e5',
          400: '#818cf8',
        },
        violet: {
          500: '#8b5cf6',
          600: '#7c3aed',
          400: '#a78bfa',
        },
      },
    },
  },
  plugins: [],
};
