export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#f7f0b1',
        black: '#351903',
        slate: {
          50: '#f7f0b1',
          100: '#f4eca4',
          200: '#ede383',
          300: '#d2c873',
          400: '#9d8b58',
          500: '#74603d',
          600: '#5e4628',
          700: '#4b3016',
          800: '#402208',
          900: '#351903',
          950: '#2a1302'
        },
        emerald: {
          50: '#f2eeb3',
          100: '#e4e7a0',
          200: '#c9d477',
          300: '#a9bc4a',
          400: '#8da432',
          500: '#78921e',
          600: '#607a11',
          700: '#4d6909',
          800: '#365004',
          900: '#2b3f03'
        },
        amber: {
          50: '#f7edc0',
          100: '#ede383',
          200: '#d9c86b',
          300: '#c0a84a',
          400: '#aa8424',
          500: '#925e06',
          600: '#805005',
          700: '#6f4304',
          800: '#583203',
          900: '#351903'
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Manrope', 'sans-serif']
      },
      borderRadius: {
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem'
      },
      boxShadow: {
        sm: '0 8px 24px rgba(53, 25, 3, 0.06)',
        md: '0 14px 36px rgba(53, 25, 3, 0.10)'
      }
    }
  },
  plugins: []
};
