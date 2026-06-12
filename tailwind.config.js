const { palette } = require('./src/constants/palette');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: palette.brand,
        status: palette.status,
        badge: palette.badge,
      },
    },
  },
  plugins: [],
};
