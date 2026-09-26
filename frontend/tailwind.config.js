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
        background: '#F9FAFB',
        foreground: '#111827',
        odoo: {
          purple: '#714B67',
          'purple-hover': '#5D3D55',
          teal: '#017E84',
          'teal-hover': '#016469',
          bg: '#F9FAFB',
          surface: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F3F4F6',
          hover: '#E5E7EB',
        },
        border: '#E5E7EB',
        muted: {
          DEFAULT: '#F3F4F6',
          foreground: '#6B7280',
        },
        primary: {
          DEFAULT: '#714B67',
          foreground: '#FFFFFF',
          hover: '#5D3D55',
          teal: '#017E84',
          'teal-hover': '#016469',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827',
          secondary: '#F9FAFB',
        },
        status: {
          'red-bg': '#FEE2E2',
          'red-text': '#991B1B',
          'green-bg': '#DCFCE7',
          'green-text': '#166534',
          'yellow-bg': '#FEF9C3',
          'yellow-text': '#854D0E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        accent: ['Caveat', 'Kalam', 'cursive'],
        handwritten: ['Caveat', 'Kalam', 'cursive'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'odoo': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'odoo-hover': '0 10px 40px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

