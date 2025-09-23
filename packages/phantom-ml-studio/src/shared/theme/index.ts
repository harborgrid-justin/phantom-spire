/**
 * THEME MODULE INDEX
 * 
 * Central export point for all theme-related constants and utilities.
 * This provides a clean API for importing theme values throughout the application.
 */

// Import constants for internal use
import { colors } from './colors';
import { spacing, breakpoints } from './spacing';

// Main theme export
export { theme } from './theme';
export { default as ThemeRegistry } from './ThemeRegistry';

// Theme constants
export { colors, cssVariables } from './colors';
export { typography, fontStyles } from './typography';
export { spacing, layout, borderRadius, shadows, zIndex, breakpoints } from './spacing';

// Re-export commonly used theme types
export type { Theme } from '@mui/material/styles';

// Layout library exports
export * from './layouts';

/**
 * THEME UTILITIES
 * 
 * Utility functions for working with theme values
 */
export const getColor = (colorPath: string) => {
  const paths = colorPath.split('.');
  let current: any = colors;
  
  for (const path of paths) {
    current = current[path];
    if (current === undefined) {
      console.warn(`Color path "${colorPath}" not found`);
      return colors.gray[500]; // fallback
    }
  }
  
  return current;
};

export const getSpacing = (multiplier: number) => {
  return spacing.unit * multiplier;
};

export const getBreakpoint = (size: keyof typeof breakpoints) => {
  return `${breakpoints[size]}px`;
};

/**
 * THEME HOOKS AND UTILITIES
 * 
 * Common theme-related utilities that can be imported alongside constants
 */
export const mediaQueries = {
  up: (breakpoint: keyof typeof breakpoints) => `@media (min-width: ${breakpoints[breakpoint]}px)`,
  down: (breakpoint: keyof typeof breakpoints) => `@media (max-width: ${breakpoints[breakpoint] - 1}px)`,
  between: (min: keyof typeof breakpoints, max: keyof typeof breakpoints) => 
    `@media (min-width: ${breakpoints[min]}px) and (max-width: ${breakpoints[max] - 1}px)`,
} as const;
