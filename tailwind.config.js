/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        doggo: '#85522D',
        'yellow': '#F1D04B'
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'serif'], 
      },
    },
  },
  plugins: [],
}