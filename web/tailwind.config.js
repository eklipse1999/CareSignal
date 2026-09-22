/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#102a43',
        ocean: '#0f766e',
        mist: '#f3f8f8',
        coral: '#f97360'
      },
      boxShadow: {
        soft: '0 18px 50px rgba(16, 42, 67, 0.08)'
      }
    }
  },
  plugins: []
};
