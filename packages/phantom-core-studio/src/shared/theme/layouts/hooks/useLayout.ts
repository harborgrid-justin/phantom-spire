/**
 * LAYOUT HOOKS
 * 
 * Custom hooks for layout management and responsive utilities
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme, useMediaQuery as useMuiMediaQuery } from '@mui/material';
import { breakpoints } from '../constants/breakpoints';
import { layouts } from '../constants/layouts';
import type { BreakpointKey } from '../types';

// Main layout hook
export const useLayout = () => {
  const theme = useTheme();
  
  const getSpacing = useCallback((value: number | string) => {
    if (typeof value === 'number') {
      return theme.spacing(value);
    }
    return value;
  }, [theme]);

  const getBreakpointValue = useCallback((breakpoint: BreakpointKey) => {
    return layouts.breakpoints[breakpoint];
  }, []);

  const createResponsiveValue = useCallback(<T>(
    values: Partial<Record<BreakpointKey, T>>
  ) => {
    const breakpointKeys = Object.keys(layouts.breakpoints) as BreakpointKey[];
    let lastValue: T | undefined;
    
    return breakpointKeys.reduce((acc, key) => {
      if (values[key] !== undefined) {
        lastValue = values[key];
      }
      acc[key] = lastValue;
      return acc;
    }, {} as Record<BreakpointKey, T | undefined>);
  }, []);

  return {
    theme,
    getSpacing,
    getBreakpointValue,
    createResponsiveValue,
    breakpoints: layouts.breakpoints,
    spacing: layouts.spacing,
  };
};

// Breakpoint detection hook
export const useBreakpoint = () => {
  const theme = useTheme();
  
  const isXs = useMuiMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMuiMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMuiMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMuiMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMuiMediaQuery(theme.breakpoints.only('xl'));
  
  const isSmUp = useMuiMediaQuery(theme.breakpoints.up('sm'));
  const isMdUp = useMuiMediaQuery(theme.breakpoints.up('md'));
  const isLgUp = useMuiMediaQuery(theme.breakpoints.up('lg'));
  const isXlUp = useMuiMediaQuery(theme.breakpoints.up('xl'));
  
  const isSmDown = useMuiMediaQuery(theme.breakpoints.down('sm'));
  const isMdDown = useMuiMediaQuery(theme.breakpoints.down('md'));
  const isLgDown = useMuiMediaQuery(theme.breakpoints.down('lg'));
  const isXlDown = useMuiMediaQuery(theme.breakpoints.down('xl'));
  
  const isMobile = useMuiMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMuiMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMuiMediaQuery(theme.breakpoints.up('lg'));

  const getCurrentBreakpoint = (): BreakpointKey => {
    if (isXl) return 'xl';
    if (isLg) return 'lg';
    if (isMd) return 'md';
    if (isSm) return 'sm';
    return 'xs';
  };

  return {
    // Current breakpoint
    current: getCurrentBreakpoint(),
    
    // Exact breakpoints
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    
    // Up breakpoints
    isSmUp,
    isMdUp,
    isLgUp,
    isXlUp,
    
    // Down breakpoints
    isSmDown,
    isMdDown,
    isLgDown,
    isXlDown,
    
    // Device categories
    isMobile,
    isTablet,
    isDesktop,
    
    // Utilities
    getCurrentBreakpoint,
  };
};

// Responsive value hook
export const useResponsive = () => {
  const { current } = useBreakpoint();
  
  const getValue = useCallback(<T>(
    values: T | Partial<Record<BreakpointKey, T>>
  ): T => {
    if (typeof values !== 'object' || values === null) {
      return values as T;
    }
    
    const responsiveValues = values as Partial<Record<BreakpointKey, T>>;
    const breakpointKeys = Object.keys(layouts.breakpoints) as BreakpointKey[];
    const currentIndex = breakpointKeys.indexOf(current);
    
    // Look for exact match first
    if (responsiveValues[current] !== undefined) {
      return responsiveValues[current] as T;
    }
    
    // Fall back to nearest smaller breakpoint
    for (let i = currentIndex - 1; i >= 0; i--) {
      const key = breakpointKeys[i];
      if (responsiveValues[key] !== undefined) {
        return responsiveValues[key] as T;
      }
    }
    
    // Fall back to any available value
    const availableValues = Object.values(responsiveValues).filter(v => v !== undefined);
    if (availableValues.length > 0) {
      return availableValues[0] as T;
    }
    
    throw new Error('No responsive value found');
  }, [current]);

  return { getValue, current };
};

// Viewport dimensions hook
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { current: breakpoint } = useBreakpoint();

  return {
    width: viewport.width,
    height: viewport.height,
    breakpoint,
    isLandscape: viewport.width > viewport.height,
    isPortrait: viewport.width <= viewport.height,
  };
};

// Container queries hook (experimental)
export const useContainerQuery = (containerRef: React.RefObject<HTMLElement>) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  const getContainerBreakpoint = (): BreakpointKey => {
    const { width } = containerSize;
    if (width >= layouts.breakpoints.xl) return 'xl';
    if (width >= layouts.breakpoints.lg) return 'lg';
    if (width >= layouts.breakpoints.md) return 'md';
    if (width >= layouts.breakpoints.sm) return 'sm';
    return 'xs';
  };

  return {
    width: containerSize.width,
    height: containerSize.height,
    breakpoint: getContainerBreakpoint(),
  };
};

// Media query hook
export const useMediaQuery = (query: string): boolean => {
  return useMuiMediaQuery(query);
};

// Layout patterns hook
export const useLayoutPatterns = () => {
  const { theme } = useLayout();
  
  const createGridTemplate = (columns: number) => `repeat(${columns}, 1fr)`;
  
  const createResponsiveGrid = (breakpoints: Record<string, number>) => {
    return Object.entries(breakpoints).reduce((acc, [bp, cols]) => {
      acc[bp as keyof typeof acc] = createGridTemplate(cols);
      return acc;
    }, {} as any);
  };

  const patterns = {
    // Common layout patterns
    sidebar: {
      display: 'grid',
      gridTemplateColumns: '240px 1fr',
      gridTemplateAreas: '"sidebar main"',
      minHeight: '100vh',
    },
    
    header: {
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      gridTemplateAreas: '"header" "main"',
      minHeight: '100vh',
    },
    
    holyGrail: {
      display: 'grid',
      gridTemplateColumns: '200px 1fr 200px',
      gridTemplateRows: 'auto 1fr auto',
      gridTemplateAreas: `
        "header header header"
        "nav main aside"
        "footer footer footer"
      `,
      minHeight: '100vh',
    },
    
    dashboard: {
      display: 'grid',
      gridTemplateColumns: '240px 1fr',
      gridTemplateRows: '64px 1fr',
      gridTemplateAreas: `
        "sidebar header"
        "sidebar main"
      `,
      minHeight: '100vh',
    },
  };

  return {
    patterns,
    createGridTemplate,
    createResponsiveGrid,
  };
};

export default useLayout;
