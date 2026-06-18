/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        dark:       'rgb(var(--color-dark) / <alpha-value>)',
        mid:        'rgb(var(--color-mid) / <alpha-value>)',
        light:      'rgb(var(--color-light) / <alpha-value>)',
        surface:    'rgb(var(--color-surface) / <alpha-value>)',
      },
      borderRadius: {
        xl:  '16px',
        '2xl': '20px',
      }
    },
  },
  plugins: [],
}
