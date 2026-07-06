/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          darkest: '#020617', // slate-950
          dark: '#0f172a',    // slate-900
          card: 'rgba(15, 23, 42, 0.55)', // glass card background
          blue: {
            DEFAULT: '#2563eb', // blue-600
            light: '#3b82f6',   // blue-500
            glow: '#60a5fa',    // blue-400
          },
          indigo: {
            DEFAULT: '#4f46e5', // indigo-600
            light: '#6366f1',   // indigo-500
            glow: '#818cf8',    // indigo-400
          },
          cyan: {
            DEFAULT: '#0891b2', // cyan-600
            light: '#06b6d4',   // cyan-500
            glow: '#22d3ee',    // cyan-400
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow-pulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.2), 0 0 10px rgba(59, 130, 246, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(6, 182, 212, 0.6), 0 0 25px rgba(99, 102, 241, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}
