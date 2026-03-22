/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#1a6fb5',
          600: '#155fa0',
          700: '#0f4b80',
          900: '#0a1628',
        },
      },
    },
  },
  plugins: [],
};
