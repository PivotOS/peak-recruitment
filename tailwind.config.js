/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        'peak-gold': '#F5A623',
        'peak-blue': '#1877F2',
        'gold-500': '#F5A623',
      },
      borderRadius: {
        'xl': '1.25rem',      // 20px (Tailwind default, leave for compatibility)
        '2xl': '2rem',        // 32px (custom for extra large card rounding)
        '3xl': '2.5rem',      // 40px (for ultra-rounded corners)
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};