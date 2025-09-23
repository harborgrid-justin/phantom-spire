/**
 * COLOR CONSTANTS AND THEME VARIABLES
 * 
 * Centralized color definitions for consistent theming across the application.
 * These colors match the MUI theme configuration and provide additional utility colors.
 */

export const colors = {
  // Primary colors
  primary: {
    main: '#6366f1', // Indigo
    light: '#818cf8',
    dark: '#4338ca',
    contrastText: '#ffffff',
  },
  
  // Secondary colors
  secondary: {
    main: '#14b8a6', // Teal
    light: '#5eead4',
    dark: '#0f766e',
    contrastText: '#ffffff',
  },
  
  // Status colors
  success: {
    main: '#10b981',
    light: '#6ee7b7',
    dark: '#047857',
  },
  
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
  },
  
  // Background colors
  background: {
    default: '#f9fafb',
    paper: '#ffffff',
    dark: '#0a0a0a',
  },
  
  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    dark: '#ededed',
  },
  
  // Additional utility colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

/**
 * CSS CUSTOM PROPERTIES
 * 
 * CSS variables for dynamic theming and dark mode support
 */
export const cssVariables = {
  light: {
    '--background': colors.background.default,
    '--foreground': colors.text.primary,
    '--primary': colors.primary.main,
    '--secondary': colors.secondary.main,
  },
  dark: {
    '--background': colors.background.dark,
    '--foreground': colors.text.dark,
    '--primary': colors.primary.light,
    '--secondary': colors.secondary.light,
  },
} as const;
