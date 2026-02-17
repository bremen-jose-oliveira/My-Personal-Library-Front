/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./App/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          dark: '#E85D24',
          light: '#FF8C61',
        },
        secondary: {
          DEFAULT: '#4A4A4A',
          light: '#F7F9FC',
        },
        accent: {
          DEFAULT: '#6C63FF',
          light: '#9B93FF',
        },
        background: {
          DEFAULT: '#F7F9FC',
          dark: '#E8ECF1',
        },
        surface: '#FFFFFF',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
