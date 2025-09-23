/**
 * TYPOGRAPHY CONSTANTS
 * 
 * Centralized typography definitions for consistent text styling across the application.
 * These definitions match the MUI theme typography configuration.
 */

export const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  
  // Font weights
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  
  // Font sizes
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    '4xl': '2.5rem',  // 40px
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  // Heading styles
  headings: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
  },
  
  // Body text styles
  body: {
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
  },
} as const;

/**
 * CSS FONT STYLES
 * 
 * Utility classes for consistent font styling
 */
export const fontStyles = {
  heading: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeights.semiBold,
    lineHeight: typography.lineHeights.tight,
  },
  body: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeights.regular,
    lineHeight: typography.lineHeights.relaxed,
  },
  caption: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeights.regular,
    lineHeight: typography.lineHeights.normal,
    fontSize: typography.fontSizes.xs,
  },
  code: {
    fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
    fontWeight: typography.fontWeights.regular,
  },
} as const;
