/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'peak-gold': 'var(--peak-gold)',
        'peak-blue': 'var(--peak-blue)',
        'peak-blue-hover': 'var(--peak-blue-hover)',
      },
    },
  },
  plugins: [],
};