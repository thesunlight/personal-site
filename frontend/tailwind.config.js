/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
        serif: ['"Songti SC"', 'SimSun', 'Georgia', '"Times New Roman"', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#00a63e',
          50: '#eefcf3', 100: '#d6f5e2', 200: '#b0ebc8', 300: '#7ddba5',
          400: '#3fc878', 500: '#00a63e', 600: '#009138', 700: '#00772e', 800: '#036027', 900: '#054f23',
        },
        ink: {
          50: '#f6f6f7', 100: '#e4e4e7', 200: '#d4d4d8', 300: '#a1a1aa',
          400: '#71717a', 500: '#52525b', 600: '#3f3f46', 700: '#2b2b30',
          800: '#1d1d20', 900: '#151517', 950: '#0f0f10',
        },
      },
    },
  },
  plugins: [],
};
