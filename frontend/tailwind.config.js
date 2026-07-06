/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-primary)', 'sans-serif'],
      },
      colors: {
        bg: 'var(--color-bg)',
        fg: 'var(--color-fg)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        accentFg: 'var(--color-accent-fg)',
        muted: 'var(--color-muted)',
        mutedFg: 'var(--color-muted-fg)',
      },
      backgroundImage: {
        'grid-pattern': 'var(--bg-grid)',
      }
    },
  },
  plugins: [],
}
