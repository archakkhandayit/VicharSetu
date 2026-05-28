/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#1A1814',
          soft: '#3D3A35',
          muted: '#7A7570',
          faint: '#B8B4AF',
        },
        paper: {
          DEFAULT: '#F5F2ED',
          warm: '#EDE9E2',
          border: '#DDD9D3',
        },
        amber: {
          DEFAULT: '#C4621A',
          light: '#F5E8DC',
          hover: '#A85216',
          faint: '#FBF3EC',
        },
        surface: '#FFFFFF',
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        xs: ['12px', '16px'],
        sm: ['13px', '18px'],
        base: ['14px', '22px'],
        md: ['15px', '22px'],
        lg: ['16px', '24px'],
        xl: ['18px', '26px'],
        '2xl': ['22px', '30px'],
        '3xl': ['28px', '36px'],
        '4xl': ['36px', '42px'],
        '5xl': ['48px', '54px'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(26,24,20,0.06), 0 0 0 0.5px rgba(26,24,20,0.08)',
        'card-hover': '0 4px 12px rgba(26,24,20,0.10), 0 0 0 0.5px rgba(26,24,20,0.10)',
        focus: '0 0 0 3px rgba(196,98,26,0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.35s ease forwards',
        'scale-in': 'scaleIn 0.2s ease forwards',
        'bar-fill': 'barFill 0.6s ease forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        barFill: { from: { width: '0%' }, to: { width: 'var(--bar-width)' } },
      },
    },
  },
  plugins: [],
}