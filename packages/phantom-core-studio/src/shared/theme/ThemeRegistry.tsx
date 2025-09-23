/**
 * THEME REGISTRY - CLIENT COMPONENT
 *
 * This is a Next.js Client Component that provides:
 * - MUI theme context and provider setup
 * - CSS baseline normalization
 * - App Router cache provider for MUI
 *
 * IMPORTANT: This component runs on the client and provides theme context
 * to all child components. Marked with 'use client' directive.
 */
'use client';

import React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';

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
