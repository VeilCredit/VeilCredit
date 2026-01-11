/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          light: '#FF8E53',
          dark: '#E55A2B',
        },
        secondary: {
          DEFAULT: '#FFB347',
          light: '#FFC97A',
          dark: '#FF9E6D',
        },
        accent: {
          DEFAULT: '#FFD166',
          light: '#FFDE8A',
          dark: '#FFC441',
        }
      },
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeInUp 1s ease-out forwards',
        'slide-left': 'slideInFromLeft 1s ease-out forwards',
        'slide-right': 'slideInFromRight 1s ease-out forwards',
        'gradient-shift': 'gradientShift 5s ease infinite',
      },
    },
  },
  plugins: [],
}