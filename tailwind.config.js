/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        intervar: ['InterVar', 'sans-serif'],
        sfmono: ['SFMono', 'monospace'],
      },
    },
  },
  plugins: [],
}

