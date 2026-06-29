/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#a0522d',
          600: '#8b4513',
          700: '#cd853f',
          800: '#800000',
          900: '#4a0404',
        },
        // yaopulife 新中式治愈品牌色板(规范源 src/styles/tokens.css)
        yaopu: {
          paper: '#F7F1E8',
          'warm-paper': '#EFE6D8',
          mist: '#D8CEC0',
          'ink-light': '#8C8377',
          ink: '#2F2A26',
          'deep-ink': '#1D1A17',
          cinnabar: '#B6432A',
          'vermilion-light': '#C95A3C',
          jade: '#6F8F85',
          'bamboo-green': '#829B6E',
          'moon-gold': '#C9A96B',
          success: '#6E8B74',
          warning: '#C58B39',
          error: '#B04A3A',
          info: '#688AA3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
