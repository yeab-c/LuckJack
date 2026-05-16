/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'casino-bg': '#0a1f0a',
        'casino-gold': '#C9A84C',
        'casino-crimson': '#8B1A1A',
        'card-white': '#FAFAFA',
      },
      screens: {
        'tablet': '640px',
        'desktop': '1024px',
      },
    },
  },
  plugins: [],
}
