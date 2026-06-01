/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          1: '#0f1117',
          2: '#161923',
          3: '#1e2330',
          4: '#252b3b',
        },
        ink: {
          1: '#e8ecf4',
          2: '#7e8899',
          3: '#4a5468',
        },
      },
      fontFamily: {
        sans: ["'Be Vietnam Pro'", 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)',
        modal: '0 25px 80px rgba(0,0,0,0.8)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease',
        'slide-up': 'slideUp 0.25s ease',
        'slide-in-left': 'slideInLeft 0.25s ease',
        'toast-in': 'toastIn 0.3s ease',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
