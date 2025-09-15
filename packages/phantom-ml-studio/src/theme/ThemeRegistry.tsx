// src/theme/ThemeRegistry.tsx
'use client';

import React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstarts an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
