import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'neon-pulse': 'neon-pulse 6s infinite',
        'border-rainbow': 'border-rainbow 6s infinite',
        'pulse-subtle': 'pulse-subtle 3s infinite',
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(244,114,182,0.6), 0 0 30px rgba(168,85,247,0.4), 0 0 45px rgba(59,130,246,0.3)',
            borderColor: 'rgb(244,114,182)',
          },
          '33%': {
            boxShadow: '0 0 20px rgba(168,85,247,0.6), 0 0 40px rgba(59,130,246,0.4), 0 0 60px rgba(34,197,94,0.3)',
            borderColor: 'rgb(168,85,247)',
          },
          '66%': {
            boxShadow: '0 0 25px rgba(59,130,246,0.6), 0 0 50px rgba(34,197,94,0.4), 0 0 75px rgba(244,114,182,0.3)',
            borderColor: 'rgb(59,130,246)',
          },
        },
        'border-rainbow': {
          '0%, 100%': { borderColor: 'rgb(244,114,182)' },
          '33%': { borderColor: 'rgb(168,85,247)' },
          '66%': { borderColor: 'rgb(59,130,246)' },
        },
        'pulse-subtle': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.9',
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
