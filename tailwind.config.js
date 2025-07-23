// tailwind.config.js
/** @type {import('tailwindcss').Config} */
// Use ES Module syntax for Vite compatibility
export default {
  // 'content' replaces 'purge' in Tailwind CSS v3
  content: [
    "./index.html", // Your main HTML file in the root
    "./src/**/*.{vue,js,ts,jsx,tsx}", // All your Vue components and JS/TS files in src/
  ],
  theme: {
    extend: {
      cursor: {
        help: 'help',
      },
      zIndex: {
        '-10': '-10',
      },
      colors: {
        'plain-gray': {
          light: '#252728',
          DEFAULT: '#1e2021',
          dark: '#171819',
        }
      }
    },
  },
  darkMode: 'class',
  // 'variants' property is deprecated in Tailwind CSS v3 and generally not needed
  // due to JIT mode. Remove it.
  plugins: [],
};