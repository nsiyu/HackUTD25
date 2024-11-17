/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'off-red': '#F40000',
        'red-700': '#CC0000',
        'night': '#0F110C',
        'white': '#FFFFFF',
        'saffron': '#E3B505',
        'paynes': '#4F6D7A',
        'dark': {
          'bg': '#121212',
          'surface': '#1E1E1E',
          'surface-2': '#2C2C2C',
          'text': '#E1E1E1',
          'text-secondary': '#A0A0A0',
        }
      },
      maxWidth: {
        '7xl': '80rem',
        'sm': '24rem',
      },
      fontFamily: {
        ubuntu: ['Ubuntu', 'sans-serif'],
      },
    },
  },
  plugins: [],
}