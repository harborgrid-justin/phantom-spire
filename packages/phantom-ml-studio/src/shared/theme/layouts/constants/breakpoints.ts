/**
 * BREAKPOINTS CONSTANTS
 * 
 * Responsive breakpoint system for enterprise applications
 */

// Base breakpoints (in pixels)
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Container max widths for each breakpoint
export const containerSizes = {
  xs: '100%',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
} as const;

// Grid system breakpoints
export const gridBreakpoints = {
  xs: { columns: 4, gutter: 16 },
  sm: { columns: 8, gutter: 16 },
  md: { columns: 8, gutter: 24 },
  lg: { columns: 12, gutter: 24 },
  xl: { columns: 12, gutter: 32 },
  '2xl': { columns: 16, gutter: 32 },
} as const;

// Media query helpers
export const media = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${breakpoints['2xl']}px)`,
  
  // Max width queries
  maxXs: `@media (max-width: ${breakpoints.sm - 1}px)`,
  maxSm: `@media (max-width: ${breakpoints.md - 1}px)`,
  maxMd: `@media (max-width: ${breakpoints.lg - 1}px)`,
  maxLg: `@media (max-width: ${breakpoints.xl - 1}px)`,
  maxXl: `@media (max-width: ${breakpoints['2xl'] - 1}px)`,
  
  // Range queries
  smToMd: `@media (min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`,
  mdToLg: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  lgToXl: `@media (min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`,
  xlTo2xl: `@media (min-width: ${breakpoints.xl}px) and (max-width: ${breakpoints['2xl'] - 1}px)`,
  
  // Device-specific queries
  mobile: `@media (max-width: ${breakpoints.md - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.lg}px)`,
  
  // Orientation queries
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
  
  // High DPI queries
  retina: '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  
  // Accessibility queries
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  darkMode: '@media (prefers-color-scheme: dark)',
  lightMode: '@media (prefers-color-scheme: light)',
  highContrast: '@media (prefers-contrast: high)',
} as const;

// Responsive utilities
export const responsiveUtils = {
  // Get breakpoint value
  getBreakpoint: (key: keyof typeof breakpoints) => breakpoints[key],
  
  // Get container size
  getContainerSize: (key: keyof typeof containerSizes) => containerSizes[key],
  
  // Get grid configuration
  getGridConfig: (key: keyof typeof gridBreakpoints) => gridBreakpoints[key],
  
  // Check if breakpoint is active
  isBreakpointActive: (key: keyof typeof breakpoints, width: number) => {
    const breakpointKeys = Object.keys(breakpoints) as Array<keyof typeof breakpoints>;
    const currentIndex = breakpointKeys.indexOf(key);
    const nextKey = breakpointKeys[currentIndex + 1];
    
    if (!nextKey) {
      return width >= breakpoints[key];
    }
    
    return width >= breakpoints[key] && width < breakpoints[nextKey];
  },
  
  // Get current breakpoint
  getCurrentBreakpoint: (width: number): keyof typeof breakpoints => {
    const breakpointKeys = Object.keys(breakpoints) as Array<keyof typeof breakpoints>;
    
    for (let i = breakpointKeys.length - 1; i >= 0; i--) {
      const key = breakpointKeys[i];
      if (width >= breakpoints[key]) {
        return key;
      }
    }
    
    return 'xs';
  },
  
  // Create responsive value object
  createResponsiveValue: <T>(
    values: Partial<Record<keyof typeof breakpoints, T>>
  ): Record<keyof typeof breakpoints, T | undefined> => {
    const result = {} as Record<keyof typeof breakpoints, T | undefined>;
    const breakpointKeys = Object.keys(breakpoints) as Array<keyof typeof breakpoints>;
    
    let lastValue: T | undefined;
    
    for (const key of breakpointKeys) {
      if (key in values && values[key] !== undefined) {
        lastValue = values[key];
      }
      result[key] = lastValue;
    }
    
    return result;
  },
} as const;

// CSS custom properties for breakpoints
export const breakpointCSSProperties = {
  '--breakpoint-xs': `${breakpoints.xs}px`,
  '--breakpoint-sm': `${breakpoints.sm}px`,
  '--breakpoint-md': `${breakpoints.md}px`,
  '--breakpoint-lg': `${breakpoints.lg}px`,
  '--breakpoint-xl': `${breakpoints.xl}px`,
  '--breakpoint-2xl': `${breakpoints['2xl']}px`,
} as const;

export type BreakpointKey = keyof typeof breakpoints;
export type MediaQueryKey = keyof typeof media;
export type ContainerSizeKey = keyof typeof containerSizes;
