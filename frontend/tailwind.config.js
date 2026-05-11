/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF9E6',
          100: '#FFF0BF',
          200: '#FFE699',
          300: '#FFD966',
          400: '#FFCC33',
          500: '#D4AF37',
          600: '#B8960F',
          700: '#8B7000',
          800: '#5E4B00',
          900: '#312700',
        },
        secondary: {
          50: '#FFF0F2',
          100: '#FFD6DC',
          200: '#FFBCC6',
          300: '#FF9DAD',
          400: '#E8899A',
          500: '#B76E79',
          600: '#9A5A64',
          700: '#7D464F',
          800: '#60333A',
          900: '#432025',
        },
        dark: {
          50: '#E6E6E6',
          100: '#CCCCCC',
          200: '#999999',
          300: '#666666',
          400: '#444444',
          500: '#333333',
          600: '#2A2A2A',
          700: '#1A1A1A',
          800: '#111111',
          900: '#0A0A0A',
        },
        accent: '#F5E6CC',
        gold: '#D4AF37',
        'rose-gold': '#B76E79',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
