/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans SC"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        'neo-bg': '#FDFBF7', // 暖米色背景
        'neo-yellow': '#FFD600',
        'neo-purple': '#BEA7FF',
        'neo-green': '#4ADE80',
        'neo-blue': '#60A5FA',
        'neo-red': '#FF6B6B',
        'neo-orange': '#FB923C',
        'neo-black': '#18181b',
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #000000',
        'neo-hover': '1px 1px 0px 0px #000000',
        'neo-sm': '2px 2px 0px 0px #000000',
      }
    },
  },
  plugins: [],
}

