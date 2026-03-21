/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
          sans: ['Inter', 'sans-serif'],
      },
      colors: {
          zinc: {
              950: '#09090b',
          }
      }
    }
  },
  plugins: [],
}
