/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06071A',
          900: '#09091F',
          800: '#0D0F27',
          700: '#121530',
          600: '#181C3A',
          500: '#1E2347',
        },
        primary: {
          DEFAULT: '#6366F1',
          light: '#818CF8',
          dark: '#4F46E5',
        },
        accent: '#F59E0B',
        success: '#10B981',
        danger: '#F43F5E',
        bg: {
          primary: '#06071A',
          card: '#0D0F27',
        },
        text: {
          primary: '#EEF0FF',
          body: '#8892B8',
          muted: '#4A5278',
        },
        border: '#1E2347',
        surface: {
          1: '#0D0F27',
          2: '#121530',
          3: '#181C3A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-success': 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        'gradient-danger': 'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)',
        'gradient-accent': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 24px rgba(99,102,241,0.45)',
        'glow-success': '0 0 20px rgba(16,185,129,0.35)',
        'glow-danger': '0 0 20px rgba(244,63,94,0.35)',
        'glow-accent': '0 0 20px rgba(245,158,11,0.35)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg': '0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.25s ease-out',
        'scale-in': 'scaleIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-up': 'slideUp 0.35s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s linear infinite',
        'count-up': 'countUp 0.5s ease-out',
        'check': 'checkmark 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.90)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(99,102,241,0.55)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        checkmark: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
    },
  },
  plugins: [],
}
