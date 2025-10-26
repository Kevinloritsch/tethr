/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'tethr-purple': '#A597FF',
        'tethr-gray': '#3F3F3F80',
      },
    },
  },
  plugins: [],
};
