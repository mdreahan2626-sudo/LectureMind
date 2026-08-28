/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FBF6EC',    // warm cream base
          deep: '#F5EDDD',       // secondary surface / inset panels
        },
        rule: '#E7D8BC',         // faint ruled-line / divider
        card: {
          DEFAULT: '#FFFFFF',
          border: '#ECE1CB',
        },
        charcoal: {
          DEFAULT: '#2B2432',    // primary text
          soft: '#665F72',       // secondary text
          muted: '#9E9AA7',
        },
        // 4 Core Inks
        violet: {
          DEFAULT: '#6C5CE0',    // Ink 1 — primary AI
          hover: '#5B4BC9',
          soft: '#EDE9FB',
        },
        coral: {
          DEFAULT: '#F0603E',    // Ink 2 — action / CTA
          hover: '#DD4E2C',
          soft: '#FDE7E0',
        },
        teal: {
          DEFAULT: '#0F8F86',    // Ink 3 — success / grounded
          hover: '#0C7971',
          soft: '#DEF3EF',
        },
        gold: {
          DEFAULT: '#E3A62F',    // Ink 4 — streak / highlight
          hover: '#CD9223',
          soft: '#FBF0D9',
        },
        // Semantic mappings
        bg: {
          base: '#FBF6EC',
          subtle: '#F5EDDD',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          tint: '#F5EDDD',
        },
        accent: {
          primary: '#6C5CE0',
          hover: '#F0603E',
          mint: '#0F8F86',
          yellow: '#E3A62F',
        },
        text: {
          primary: '#2B2432',
          secondary: '#665F72',
          muted: '#9E9AA7',
        },
        border: {
          subtle: '#ECE1CB',
          focus: '#6C5CE0',
        },
        danger: {
          DEFAULT: '#F0603E',
          subtle: '#FDE7E0',
        },
        success: {
          DEFAULT: '#0F8F86',
          subtle: '#DEF3EF',
        },
      },
      borderRadius: {
        'sm': '10px',
        'md': '18px',
        'lg': '28px',
        'xl': '32px',
      },
      boxShadow: {
        'soft': '0 2px 4px rgba(43,36,50,0.05), 0 10px 24px rgba(43,36,50,0.06)',
        'lift': '0 8px 20px rgba(43,36,50,0.10)',
        'hover': '0 8px 24px rgba(43,36,50,0.09)',
        'panel': '0 12px 32px rgba(43,36,50,0.08)',
        'modal': '0 20px 48px rgba(43,36,50,0.14)',
        'sticky': '0 4px 12px rgba(43,36,50,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        serif: ['Fraunces', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        handwriting: ['Caveat', 'cursive'],
      },
      animation: {
        'drift-slow': 'drift 6s ease-in-out infinite alternate',
        'drift-delayed': 'drift 7s ease-in-out 1.5s infinite alternate',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        drift: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
