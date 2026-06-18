/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#1a365d',
          teal: '#0d9488',
          light: '#38bdf8',
          success: '#10b981',
          bg: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}
