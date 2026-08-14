/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0b0f19',
          800: '#111827',
          700: '#1f293d',
          600: '#2d3b55'
        },
        critical: '#ef4444',
        high: '#f97316',
        medium: '#eab308',
        low: '#3b82f6',
        success: '#10b981'
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-spin': 'spin 6s linear infinite'
      }
    },
  },
  plugins: [],
}
