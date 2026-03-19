/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // --- Font Families ---
      // font-manrope: headlines, brand-defining UI moments
      // font-inter:   body, interface text (also the body default)
      fontFamily: {
        'manrope': ['Manrope', 'system-ui', 'sans-serif'],
        'inter':   ['Inter',   'system-ui', 'sans-serif'],
      },

      // --- Vektrus Shadow Tokens ---
      // Use these instead of ad-hoc inline shadows.
      // shadow-subtle   → 0 1px 3px  — thin borders, tight elements
      // shadow-card     → 0 4px 18px — standard cards
      // shadow-elevated → 0 8px 32px — raised panels, popovers
      // shadow-modal    → 0 16px 48px — modals, sheets
      boxShadow: {
        'subtle':   '0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.03)',
        'card':     '0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)',
        'elevated': '0 1px 3px rgba(0, 0, 0, 0.05), 0 8px 28px rgba(0, 0, 0, 0.09)',
        'modal':    '0 2px 4px rgba(0, 0, 0, 0.05), 0 16px 48px rgba(0, 0, 0, 0.14)',
      },

      // --- Vektrus Radius Tokens ---
      // Named vk-* to avoid collision with Tailwind defaults.
      // vk-sm → 8px  (inputs, small chips)
      // vk-md → 12px (standard cards)
      // vk-lg → 16px (large cards, modals)
      // vk-xl → 20px (feature cards, hero elements)
      borderRadius: {
        'vk-sm': '12px',
        'vk-md': '16px',
        'vk-lg': '20px',
        'vk-xl': '24px',
        // Override Tailwind defaults to prevent angular corners
        'sm': '8px',
        'DEFAULT': '12px',
        'md': '12px',
        'lg': '14px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },

      keyframes: {
        'in': {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        'in':    'in 0.3s ease-out',
        shimmer: 'shimmer 1.8s infinite',
      },
    },
  },
  plugins: [],
};
