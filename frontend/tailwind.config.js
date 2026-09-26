/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: {
          DEFAULT: 'var(--surface)',
          secondary: 'var(--surface-secondary)',
          hover: 'var(--surface-hover)',
        },
        border: 'var(--border)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)',
          border: 'var(--primary-border)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
          secondary: 'var(--card-secondary)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(7, 17, 31, 0.04), 0 1px 3px -1px rgba(7, 17, 31, 0.02)',
        'soft-lg': '0 8px 24px -4px rgba(7, 17, 31, 0.06), 0 4px 8px -2px rgba(7, 17, 31, 0.02)',
        'elevated': '0 16px 36px -8px rgba(7, 17, 31, 0.1), 0 4px 12px -2px rgba(7, 17, 31, 0.03)',
      },
    },
  },
  plugins: [],
};
