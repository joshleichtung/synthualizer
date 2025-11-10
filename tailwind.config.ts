import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          pink: '#FF6B9D',
          light: '#FFB3D1',
          dark: '#E5548B',
        },
        purple: {
          soft: '#C687F0',
          lavender: '#E5D4FF',
          deep: '#9B5EC8',
        },
        sunshine: {
          DEFAULT: '#FFD93D',
          light: '#FFF4C4',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Nunito', 'Quicksand', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-coral': '0 0 24px rgba(255, 107, 157, 0.4)',
        'glow-purple': '0 0 24px rgba(198, 135, 240, 0.4)',
        'glow-yellow': '0 0 24px rgba(255, 217, 61, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
