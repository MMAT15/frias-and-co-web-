import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{ts,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['InterVariable', 'sans-serif']
      },
      colors: {
        primary: {
          DEFAULT: '#111827',
          light: '#374151',
          dark: '#000000'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
} satisfies Config;
