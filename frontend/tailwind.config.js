/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#ffffff',
        card: {
          DEFAULT: '#0c0c0e',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#141418',
          foreground: '#9ca3af',
        },
        border: '#1a1a1e',
        aura: {
          black: '#000000',
          dark: '#050505',
          card: '#0c0c0e',
          cardHover: '#111115',
          border: '#1a1a1e',
          borderLight: '#26262b',
          blue: '#2563eb',
          blueDark: '#1d4ed8',
          blueDeep: '#1e3a8a',
          textMuted: '#80808a',
        },
      },
      aspectRatio: {
        '4/3': '4 / 3',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'aura-glow': '0 0 60px -10px rgba(37, 99, 235, 0.45)',
        'aura-card': '0 10px 30px -10px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
}
