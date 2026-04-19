/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./components/**/*.{js,vue,ts}', './layouts/**/*.vue', './pages/**/*.vue', './plugins/**/*.{js,ts}', './app.vue', './error.vue'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#f4efe7',
          deep: '#ebe4d6'
        },
        ink: {
          DEFAULT: '#1a1a1a',
          mid: '#4a4a4a',
          soft: '#8c8478',
          deep: '#141418',
          raised: '#1f1f24',
          soft2: '#24242a'
        },
        accent: {
          DEFAULT: '#c8372d'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', '"Noto Serif SC"', '"Songti SC"', '"STSong"', 'georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'menlo', 'consolas', 'monospace']
      },
      boxShadow: {
        brutal: '14px 14px 0 0 #1a1a1a',
        'brutal-sm': '10px 10px 0 0 #1a1a1a'
      },
      backgroundImage: {
        'paper-grain':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
        'grid-lines': 'linear-gradient(to right, rgb(26 26 26 / 4%) 1px, transparent 1px), linear-gradient(to bottom, rgb(26 26 26 / 4%) 1px, transparent 1px)'
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(48px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        'slide-up': 'slide-up 1s cubic-bezier(0.2, 0.85, 0.2, 1) forwards',
        'fade-up': 'fade-up 0.7s ease-out forwards',
        'fade-in': 'fade-in 0.6s ease-out'
      }
    }
  },
  plugins: []
};
