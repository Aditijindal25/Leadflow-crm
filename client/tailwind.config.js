/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          500: '#0f766e',
          600: '#115e59',
        },
      },
    },
  },
  plugins: [],
};
