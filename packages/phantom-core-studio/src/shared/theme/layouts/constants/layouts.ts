/**
 * LAYOUT CONSTANTS
 * 
 * Predefined layout configurations for consistent enterprise applications
 */

import { LayoutConfig } from '../types';

// Base layout constants
export const LAYOUT_CONSTANTS = {
  // Header heights
  HEADER_HEIGHT: 64,
  HEADER_HEIGHT_MOBILE: 56,
  
  // Sidebar widths
  SIDEBAR_WIDTH_SM: 200,
  SIDEBAR_WIDTH_MD: 240,
  SIDEBAR_WIDTH_LG: 280,
  SIDEBAR_WIDTH_XL: 320,
  SIDEBAR_WIDTH_COLLAPSED: 64,
  
  // Container max widths
  CONTAINER_XS: 480,
  CONTAINER_SM: 640,
  CONTAINER_MD: 768,
  CONTAINER_LG: 1024,
  CONTAINER_XL: 1280,
  CONTAINER_2XL: 1536,
  
  // Content spacing
  CONTENT_PADDING: 24,
  CONTENT_PADDING_MOBILE: 16,
  
  // Z-index layers
  Z_INDEX: {
    BASE: 0,
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },
  
  // Animation durations (ms)
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350,
    SLOWER: 500,
  },
  
  // Common grid columns
  GRID_COLUMNS: {
    MOBILE: 4,
    TABLET: 8,
    DESKTOP: 12,
    WIDE: 16,
  },
} as const;

// Predefined layout configurations
export const layouts: LayoutConfig = {
  breakpoints: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  
  spacing: {
    '0': '0',
    '1': '0.25rem',   // 4px
    '2': '0.5rem',    // 8px
    '3': '0.75rem',   // 12px
    '4': '1rem',      // 16px
    '5': '1.25rem',   // 20px
    '6': '1.5rem',    // 24px
    '8': '2rem',      // 32px
    '10': '2.5rem',   // 40px
    '12': '3rem',     // 48px
    '16': '4rem',     // 64px
    '20': '5rem',     // 80px
    '24': '6rem',     // 96px
    '32': '8rem',     // 128px
    '40': '10rem',    // 160px
    '48': '12rem',    // 192px
    '56': '14rem',    // 224px
    '64': '16rem',    // 256px
  },
  
  sizes: {
    'xs': '20rem',    // 320px
    'sm': '24rem',    // 384px
    'md': '28rem',    // 448px
    'lg': '32rem',    // 512px
    'xl': '36rem',    // 576px
    '2xl': '42rem',   // 672px
    '3xl': '48rem',   // 768px
    '4xl': '56rem',   // 896px
    '5xl': '64rem',   // 1024px
    '6xl': '72rem',   // 1152px
    '7xl': '80rem',   // 1280px
    'full': '100%',
    'screen': '100vh',
    'fit': 'fit-content',
    'max': 'max-content',
    'min': 'min-content',
  },
  
  colors: {
    transparent: 'transparent',
    current: 'currentColor',
    inherit: 'inherit',
    primary: 'var(--color-primary, #6366f1)',
    secondary: 'var(--color-secondary, #14b8a6)',
    accent: 'var(--color-accent, #f59e0b)',
    neutral: 'var(--color-neutral, #6b7280)',
    success: 'var(--color-success, #10b981)',
    warning: 'var(--color-warning, #f59e0b)',
    error: 'var(--color-error, #ef4444)',
    info: 'var(--color-info, #3b82f6)',
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    lg: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    xl: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '2xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  radii: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  animations: {
    fadeIn: {
      duration: 250,
      easing: 'ease-out',
      fillMode: 'forwards',
    },
    fadeOut: {
      duration: 200,
      easing: 'ease-in',
      fillMode: 'forwards',
    },
    slideIn: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fillMode: 'forwards',
    },
    slideOut: {
      duration: 250,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fillMode: 'forwards',
    },
    scaleIn: {
      duration: 200,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      fillMode: 'forwards',
    },
    scaleOut: {
      duration: 150,
      easing: 'ease-in',
      fillMode: 'forwards',
    },
  },
};

// Common layout patterns
export const LAYOUT_PATTERNS = {
  // App shell layouts
  CLASSIC_SIDEBAR: {
    type: 'sidebar',
    sidebarWidth: LAYOUT_CONSTANTS.SIDEBAR_WIDTH_MD,
    headerHeight: LAYOUT_CONSTANTS.HEADER_HEIGHT,
    contentPadding: LAYOUT_CONSTANTS.CONTENT_PADDING,
  },
  
  MINIMAL_HEADER: {
    type: 'header-only',
    headerHeight: LAYOUT_CONSTANTS.HEADER_HEIGHT,
    contentPadding: LAYOUT_CONSTANTS.CONTENT_PADDING,
  },
  
  DASHBOARD: {
    type: 'dashboard',
    sidebarWidth: LAYOUT_CONSTANTS.SIDEBAR_WIDTH_SM,
    headerHeight: LAYOUT_CONSTANTS.HEADER_HEIGHT,
    contentPadding: LAYOUT_CONSTANTS.CONTENT_PADDING,
    gridColumns: LAYOUT_CONSTANTS.GRID_COLUMNS.DESKTOP,
  },
  
  // Content layouts
  SINGLE_COLUMN: {
    type: 'single-column',
    maxWidth: LAYOUT_CONSTANTS.CONTAINER_MD,
    padding: LAYOUT_CONSTANTS.CONTENT_PADDING,
  },
  
  TWO_COLUMN: {
    type: 'two-column',
    mainWidth: '2fr',
    sideWidth: '1fr',
    gap: LAYOUT_CONSTANTS.CONTENT_PADDING,
  },
  
  THREE_COLUMN: {
    type: 'three-column',
    leftWidth: '1fr',
    mainWidth: '2fr',
    rightWidth: '1fr',
    gap: LAYOUT_CONSTANTS.CONTENT_PADDING,
  },
  
  // Form layouts
  STACKED_FORM: {
    type: 'stacked-form',
    spacing: 16,
    maxWidth: LAYOUT_CONSTANTS.CONTAINER_SM,
  },
  
  HORIZONTAL_FORM: {
    type: 'horizontal-form',
    labelWidth: '200px',
    spacing: 12,
    maxWidth: LAYOUT_CONSTANTS.CONTAINER_LG,
  },
  
  // Modal sizes
  MODAL_SIZES: {
    xs: { width: '320px', maxWidth: '90vw' },
    sm: { width: '400px', maxWidth: '90vw' },
    md: { width: '500px', maxWidth: '90vw' },
    lg: { width: '800px', maxWidth: '95vw' },
    xl: { width: '1200px', maxWidth: '98vw' },
    full: { width: '100vw', height: '100vh' },
  },
} as const;

// Responsive utilities
export const RESPONSIVE_UTILS = {
  // Media queries
  mediaQueries: {
    up: (breakpoint: keyof typeof layouts.breakpoints) => 
      `@media (min-width: ${layouts.breakpoints[breakpoint]}px)`,
    down: (breakpoint: keyof typeof layouts.breakpoints) => 
      `@media (max-width: ${layouts.breakpoints[breakpoint] - 1}px)`,
    between: (min: keyof typeof layouts.breakpoints, max: keyof typeof layouts.breakpoints) => 
      `@media (min-width: ${layouts.breakpoints[min]}px) and (max-width: ${layouts.breakpoints[max] - 1}px)`,
    only: (breakpoint: keyof typeof layouts.breakpoints) => {
      const breakpointKeys = Object.keys(layouts.breakpoints) as Array<keyof typeof layouts.breakpoints>;
      const currentIndex = breakpointKeys.indexOf(breakpoint);
      const nextBreakpoint = breakpointKeys[currentIndex + 1];
      
      if (!nextBreakpoint) {
        return `@media (min-width: ${layouts.breakpoints[breakpoint]}px)`;
      }
      
      return `@media (min-width: ${layouts.breakpoints[breakpoint]}px) and (max-width: ${layouts.breakpoints[nextBreakpoint] - 1}px)`;
    },
  },
  
  // Container queries
  containerQueries: {
    sm: '@container (min-width: 320px)',
    md: '@container (min-width: 768px)',
    lg: '@container (min-width: 1024px)',
    xl: '@container (min-width: 1280px)',
  },
  
  // Responsive values helpers
  responsive: {
    value: <T>(values: Partial<Record<keyof typeof layouts.breakpoints, T>>) => values,
    spacing: (values: Partial<Record<keyof typeof layouts.breakpoints, keyof typeof layouts.spacing>>) => 
      Object.entries(values).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: layouts.spacing[value as keyof typeof layouts.spacing],
      }), {}),
  },
} as const;

export type LayoutPattern = keyof typeof LAYOUT_PATTERNS;
export type ResponsiveUtilsType = typeof RESPONSIVE_UTILS;
