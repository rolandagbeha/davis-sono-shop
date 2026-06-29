/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-deep':    '#08091A',
        'bg-card':    '#0F1535',
        'bg-surface': '#141B3D',
        gold:         '#F5C518',
        'gold-dark':  '#D4A800',
        cyan:         '#00D4FF',
        muted:        '#6B7599',
        whatsapp:     '#25D366',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        btn:  '8px',
      },
      boxShadow: {
        card:  '0 8px 32px rgba(0,0,0,0.4)',
        gold:  '0 0 20px rgba(245,197,24,0.3)',
        cyan:  '0 0 20px rgba(0,212,255,0.3)',
        glow:  '0 4px 24px rgba(245,197,24,0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-mesh': 'radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(245,197,24,0.06) 0%, transparent 50%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
        'marquee':    'marquee 30s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight: { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 0 0 rgba(245,197,24,0.4)' }, '50%': { boxShadow: '0 0 0 12px rgba(245,197,24,0)' } },
        marquee:   { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
};

