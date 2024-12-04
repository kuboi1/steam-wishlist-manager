import { transform } from 'typescript';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      animation: {
        'fade-in-enlarge': 'fade-in-enlarge 1s ease-out forwards'
      },
      keyframes: {
        'fade-in-enlarge': {
          '0%': {
            transform: 'scale(.7) translateY(20px)',
            opacity: 0
          },
          '99%': {
            transform: 'scale(1) translateY(0)',
            opacity: 1,
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 1,
          },
        }
      },
    },
  },
  plugins: [],
}

