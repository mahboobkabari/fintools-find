/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0052ff',
          active: '#003ecc',
          disabled: '#a8b8cc',
        },
        accent: {
          amber: '#f4b000',
        },
        canvas: '#ffffff',
        surface: {
          soft: '#f7f7f7',
          strong: '#eef0f3',
          dark: '#0a0b0d',
          'dark-elevated': '#16181c',
        },
        hairline: {
          DEFAULT: '#dee1e6',
          soft: '#eef0f3',
        },
        ink: '#0a0b0d',
        body: '#5b616e',
        muted: '#7c828a',
        'on-primary': '#ffffff',
        'on-dark': '#ffffff',
        'on-dark-soft': '#a8acb3',
        semantic: {
          up: '#05b169',
          down: '#cf202f',
        },
      },
      fontFamily: {
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xl: '24px',
        pill: '100px',
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
