/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lendly: {
          blue: '#0057FF',
          teal: '#00E6D0',
          dark: '#0036A3',
          light: '#E6F0FF',
          white: '#FFFFFF',
        },
        drivecash: {
          primary: '#1A237E', // deep blue
          accent: '#1976D2', // button blue
          teal: '#00BFAE',
          green: '#4CAF50', // replaced yellow with green
          white: '#FFFFFF',
          light: '#F5F5F5',
          dark: '#263238',
        },
      },
    },
  },
  plugins: [],
};
