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
        dark: {
          bg: '#0B0F19',
          card: '#111827',
          surface: '#1F2937',
          border: '#374151',
          accent: '#3B82F6',
          muted: '#9CA3AF'
        }
      }
    },
  },
  plugins: [],
}
