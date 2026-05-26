/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:    'var(--color-primary)',
        secondary:  'var(--color-secondary)',
        background: 'var(--color-background)',
        text:       'var(--color-text)',
        danger:     'var(--color-danger)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

