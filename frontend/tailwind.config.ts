import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-muted': 'var(--surface-muted)',
        foreground: 'var(--foreground)',
        'foreground-secondary': 'var(--foreground-secondary)',
        'foreground-muted': 'var(--foreground-muted)',
        'border-default': 'var(--border-default)',
        'border-subtle': 'var(--border-subtle)',
        primary: {
          50: '#f3faf5',
          100: '#e1f3e7',
          200: '#c3e6d1',
          300: '#95d1ac',
          400: '#60b682',
          500: '#3a9a62',
          600: '#2b7a4b', // Brand Green
          700: '#22603b',
          800: '#1d4d31',
          900: '#183f29',
          950: '#0d2317',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        accent: {
          50: '#fdf7f1',
          100: '#faebd9',
          200: '#f5d3b1',
          300: '#f0b582',
          400: '#e76f51', // Harvest Orange
          500: '#e05837',
          600: '#d04323',
          700: '#ad3218',
          800: '#8c2a16',
          900: '#712515',
          950: '#3d1007',
        },
        earth: {
          50: '#faf9f7',
          100: '#f4f2ee',
          200: '#e7e3dc',
          300: '#d5cec4',
          400: '#b8afa1',
          500: '#9b9182',
          600: '#807769',
          700: '#676056',
          800: '#554f47',
          900: '#1c1917', // Main text
          950: '#2f2c28',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'Outfit', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        subtle: '0 4px 20px rgba(0, 0, 0, 0.03)',
        hover: '0 10px 40px rgba(0, 0, 0, 0.06)',
        card: '0 8px 30px rgba(0, 0, 0, 0.04)',
        focus: '0 0 0 2px rgba(43, 122, 75, 0.2)', // primary-600 focus ring
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'enter': 'enter 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        blob: "blob 7s infinite",
        shimmer: "shimmer 8s infinite linear",
        shine: "shine var(--duration) infinite linear",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        enter: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" }
        },
        shimmer: {
          "0%, 90%, 100%": {
            "background-position": "calc(-100% - var(--shimmer-width)) 0",
          },
          "30%, 60%": {
            "background-position": "calc(100% + var(--shimmer-width)) 0",
          },
        },
        shine: {
          "0%": {
            "background-position": "0% 0%",
          },
          "50%": {
            "background-position": "100% 100%",
          },
          to: {
            "background-position": "0% 0%",
          },
        },
      },
      borderRadius: {
        'xl': '0.75rem',  
        '2xl': '1rem',    
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};

export default config;