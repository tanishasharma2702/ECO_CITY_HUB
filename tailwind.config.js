/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Specified Exact 10-Color Palette
        eco: {
          50: '#FBF5F2',
          100: '#EDC4B3',
          200: '#E6B8A2',
          300: '#DEAB90',
          400: '#D69F7E',
          500: '#CD9777',
          600: '#C38E70',
          700: '#B07D62',
          800: '#9D6B53',
          900: '#8A5A44',
          950: '#774936',
        },
        // Dark mode supporting palette extensions
        dark: {
          bg: '#181210',
          card: '#231B17',
          border: '#3D2F28',
          text: '#F5ECE7',
          muted: '#C4ACA1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
