import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '../src/theme/theme';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#FFFFFF',
        },
        {
          name: 'dark',
          value: '#1A1A1A',
        },
        {
          name: 'phantom',
          value: '#0F1419',
        },
      ],
    },
  },
};

// Decorator to wrap stories with MUI theme
export const decorators = [
  (Story: any) => React.createElement(
    ThemeProvider,
    { theme },
    React.createElement(CssBaseline),
    React.createElement(Story)
  ),
];

export default preview;