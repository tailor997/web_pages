/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#121212',
        'dark-surface': '#1e1e1e',
        'dark-primary': '#bb86fc',
        'dark-secondary': '#03dac6',
        'dark-on-surface': '#ffffff',
      },
      fontFamily: {
        'pixel': ['Courier New', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
}