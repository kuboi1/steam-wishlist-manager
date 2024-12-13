import { transform } from 'typescript';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      screens: {
        '3xl': '1800px',
        '4xl': '2000px'
      },
      animation: {
        'fade-in-enlarge': 'fade-in-enlarge 1s ease-out forwards',
        'text-gradient': 'textGradient 1.5s ease-in-out infinite'
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
        },
        textGradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      }
    },
  },
  plugins: [],
}

