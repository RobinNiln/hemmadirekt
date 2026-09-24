/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Varm off-white bas
        sand: {
          50: '#FDFCFA',
          100: '#FAF8F4',
          200: '#F3EFE7',
          300: '#E8E2D6',
        },
        // Nästan svart text
        ink: {
          DEFAULT: '#16181A',
          soft: '#3D4247',
          muted: '#6B7177',
          faint: '#9AA0A5',
        },
        // Primär: mörk grön / petrol
        petrol: {
          50: '#EEF5F4',
          100: '#D6E8E5',
          200: '#A9CFCA',
          300: '#6FAEA7',
          500: '#1F6B66',
          600: '#155752',
          700: '#0F4744',
          800: '#0B3634',
          900: '#082826',
        },
        // Accent: ljus grön
        mint: {
          100: '#E6F4E9',
          200: '#CDEAD4',
          300: '#A8DBB4',
          400: '#7FC792',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,24,26,0.04), 0 4px 16px rgba(22,24,26,0.05)',
        lift: '0 2px 4px rgba(22,24,26,0.05), 0 12px 32px rgba(22,24,26,0.09)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
    },
  },
  plugins: [],
}
