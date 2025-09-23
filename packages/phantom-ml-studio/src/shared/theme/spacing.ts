/**
 * SPACING AND LAYOUT CONSTANTS
 * 
 * Centralized spacing, layout, and component sizing definitions.
 * These values provide consistent spacing throughout the application.
 */

export const spacing = {
  // Base spacing unit (8px)
  unit: 8,
  
  // Spacing scale
  xs: 4,   // 0.5 * unit
  sm: 8,   // 1 * unit
  md: 16,  // 2 * unit
  lg: 24,  // 3 * unit
  xl: 32,  // 4 * unit
  '2xl': 48, // 6 * unit
  '3xl': 64, // 8 * unit
  '4xl': 96, // 12 * unit
} as const;

export const layout = {
  // Container widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Sidebar and navigation
  sidebar: {
    width: 240,
    collapsedWidth: 64,
  },
  
  // Header/AppBar
  header: {
    height: 64,
    mobileHeight: 56,
  },
  
  // Common component sizes
  button: {
    height: {
      small: 32,
      medium: 40,
      large: 48,
    },
    padding: {
      small: '6px 12px',
      medium: '8px 16px',
      large: '12px 24px',
    },
  },
  
  // Form elements
  input: {
    height: {
      small: 32,
      medium: 40,
      large: 48,
    },
  },
  
  // Cards and panels
  card: {
    padding: spacing.md,
    margin: spacing.sm,
    borderRadius: 8,
  },
  
  // Modal and dialog sizes
  modal: {
    small: {
      width: '400px',
      maxWidth: '90vw',
    },
    medium: {
      width: '600px',
      maxWidth: '90vw',
    },
    large: {
      width: '800px',
      maxWidth: '95vw',
    },
    fullWidth: {
      width: '1200px',
      maxWidth: '98vw',
    },
  },
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  lg: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  xl: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  '2xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  none: 'none',
} as const;

/**
 * Z-INDEX LAYERS
 * 
 * Consistent z-index values for layering components
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

/**
 * BREAKPOINTS
 * 
 * Responsive design breakpoints
 */
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;
