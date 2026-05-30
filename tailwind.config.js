/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070709',
          900: '#0a0a0d',
          800: '#0e1014',
          700: '#15171d',
          600: '#1c1f27',
          500: '#252932',
          400: '#363a45',
          300: '#4a4f5c',
          200: '#7a7f8c',
          100: '#b5b9c2',
          50: '#e7e9ee',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#7c7df3',
          subtle: 'rgba(99, 102, 241, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        panel:
          '0 1px 0 rgba(255,255,255,0.04) inset, 0 -1px 0 rgba(0,0,0,0.6) inset',
        glow: '0 0 24px rgba(99, 102, 241, 0.35)',
      },
    },
  },
  plugins: [],
}
