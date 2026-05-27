/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:    '#1B4FDE',
        accent:     '#00C48C',
        danger:     '#EF4444',
        warning:    '#F5A623',
        dark:       '#0F172A',
        mid:        '#334155',
        light:      '#94A3B8',
        surface:    '#FFFFFF',
      },
      borderRadius: {
        xl:  '16px',
        '2xl': '20px',
      }
    },
  },
  plugins: [],
}