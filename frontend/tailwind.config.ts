import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A1A2E',
        secondary: '#2C3E7A',
        accent: {
          DEFAULT: '#6C63FF',
          light: '#8B83FF',
          dark: '#5046E4',
        },
        available: {
          DEFAULT: '#22C55E',
          light: '#DCFCE7',
        },
        blocked: {
          DEFAULT: '#9CA3AF',
          light: '#F3F4F6',
        },
        booked: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          alt: '#F1F5F9',
        },
        card: {
          DEFAULT: '#FFFFFF',
          hover: '#FAFBFF',
        },
        text: {
          DEFAULT: '#111827',
          secondary: '#4B5563',
        },
        muted: {
          DEFAULT: '#6B7280',
          light: '#9CA3AF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F3F4F6',
          accent: 'rgba(108, 99, 255, 0.2)',
        },
      },
      fontFamily: {
        heading: ['var(--font-outfit)'],
        body: ['var(--font-inter)'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(108, 99, 255, 0.15)',
        card: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 40px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
export default config
