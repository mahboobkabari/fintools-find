/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          active: '#1D4ED8',
          soft: '#EFF6FF',
          disabled: '#93C5FD',
        },
        accent: {
          DEFAULT: '#0EA5E9',
          sky: '#0EA5E9',
          amber: '#F59E0B',
        },
        semantic: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          up: '#10B981',
          down: '#EF4444',
        },
        canvas: '#FFFFFF',
        background: '#F8FAFC',
        surface: {
          soft: '#F8FAFC',
          strong: '#F1F5F9',
          card: '#FFFFFF',
          dark: '#0F172A',
          'dark-elevated': '#1E293B',
        },
        hairline: {
          DEFAULT: '#E2E8F0',
          soft: '#F1F5F9',
        },
        ink: '#0F172A',
        body: '#334155',
        muted: '#64748B',
        'on-primary': '#FFFFFF',
        'on-dark': '#FFFFFF',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xl: '24px',
        '2xl': '32px',
        pill: '100px',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        hover: '0 12px 30px -4px rgba(15, 23, 42, 0.08)',
        glass: '0 8px 32px 0 rgba(37, 99, 235, 0.08)',
      },
    },
  },
  plugins: [],
};
