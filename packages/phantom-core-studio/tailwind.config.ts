
import type { Config } from 'tailwindcss';
import theme from './src/theme/theme';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: theme.palette.primary.main,
        secondary: theme.palette.secondary.main,
        error: theme.palette.error.main,
        warning: theme.palette.warning.main,
        info: theme.palette.info.main,
        success: theme.palette.success.main,
        background: theme.palette.background.default,
        'background-paper': theme.palette.background.paper,
        'text-primary': theme.palette.text.primary,
        'text-secondary': theme.palette.text.secondary,
      },
      fontFamily: {
        sans: theme.typography.fontFamily,
      },
      backgroundImage: {
        'phantom-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'security-gradient': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'ml-gradient': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
