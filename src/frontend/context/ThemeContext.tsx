/**
 * Theme Context Provider
 * Manages application theming and UI preferences
 */

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'default' | 'security' | 'military' | 'corporate';
export type DensityLevel = 'compact' | 'comfortable' | 'spacious';

export interface ThemeSettings {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  density: DensityLevel;
  fontSize: number;
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  borderRadius: number;
  compactSidebar: boolean;
}

interface ThemeState extends ThemeSettings {
  systemDarkMode: boolean;
  actualMode: 'light' | 'dark';
}

type ThemeAction =
  | { type: 'SET_MODE'; payload: ThemeMode }
  | { type: 'SET_COLOR_SCHEME'; payload: ColorScheme }
  | { type: 'SET_DENSITY'; payload: DensityLevel }
  | { type: 'SET_FONT_SIZE'; payload: number }
  | { type: 'TOGGLE_ANIMATIONS' }
  | { type: 'TOGGLE_REDUCED_MOTION' }
  | { type: 'TOGGLE_HIGH_CONTRAST' }
  | { type: 'SET_BORDER_RADIUS'; payload: number }
  | { type: 'TOGGLE_COMPACT_SIDEBAR' }
  | { type: 'SET_SYSTEM_DARK_MODE'; payload: boolean }
  | { type: 'RESET_TO_DEFAULTS' };

interface ThemeContextType {
  state: ThemeState;
  setThemeMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setDensity: (density: DensityLevel) => void;
  setFontSize: (size: number) => void;
  toggleAnimations: () => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;
  setBorderRadius: (radius: number) => void;
  toggleCompactSidebar: () => void;
  resetToDefaults: () => void;
  getThemeVariables: () => Record<string, string>;
  exportTheme: () => string;
  importTheme: (theme: string) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultThemeSettings: ThemeSettings = {
  mode: 'auto',
  colorScheme: 'security',
  density: 'comfortable',
  fontSize: 14,
  animations: true,
  reducedMotion: false,
  highContrast: false,
  borderRadius: 8,
  compactSidebar: false
};

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  let newState = { ...state };

  switch (action.type) {
    case 'SET_MODE':
      newState.mode = action.payload;
      break;
    case 'SET_COLOR_SCHEME':
      newState.colorScheme = action.payload;
      break;
    case 'SET_DENSITY':
      newState.density = action.payload;
      break;
    case 'SET_FONT_SIZE':
      newState.fontSize = Math.max(10, Math.min(24, action.payload));
      break;
    case 'TOGGLE_ANIMATIONS':
      newState.animations = !state.animations;
      break;
    case 'TOGGLE_REDUCED_MOTION':
      newState.reducedMotion = !state.reducedMotion;
      break;
    case 'TOGGLE_HIGH_CONTRAST':
      newState.highContrast = !state.highContrast;
      break;
    case 'SET_BORDER_RADIUS':
      newState.borderRadius = Math.max(0, Math.min(20, action.payload));
      break;
    case 'TOGGLE_COMPACT_SIDEBAR':
      newState.compactSidebar = !state.compactSidebar;
      break;
    case 'SET_SYSTEM_DARK_MODE':
      newState.systemDarkMode = action.payload;
      break;
    case 'RESET_TO_DEFAULTS':
      newState = { ...defaultThemeSettings, systemDarkMode: state.systemDarkMode, actualMode: state.actualMode };
      break;
  }

  // Update actual mode based on mode and system preference
  newState.actualMode = newState.mode === 'auto' 
    ? (newState.systemDarkMode ? 'dark' : 'light')
    : newState.mode as 'light' | 'dark';

  return newState;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load theme settings from localStorage
  const loadThemeSettings = (): ThemeSettings => {
    try {
      const saved = localStorage.getItem('phantom-spire-theme');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultThemeSettings, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load theme settings:', error);
    }
    return defaultThemeSettings;
  };

  const [state, dispatch] = useReducer(themeReducer, {
    ...loadThemeSettings(),
    systemDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    actualMode: 'light'
  });

  // Save theme settings to localStorage
  useEffect(() => {
    const themeSettings: ThemeSettings = {
      mode: state.mode,
      colorScheme: state.colorScheme,
      density: state.density,
      fontSize: state.fontSize,
      animations: state.animations,
      reducedMotion: state.reducedMotion,
      highContrast: state.highContrast,
      borderRadius: state.borderRadius,
      compactSidebar: state.compactSidebar
    };

    localStorage.setItem('phantom-spire-theme', JSON.stringify(themeSettings));
  }, [state]);

  // Listen for system dark mode changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      dispatch({ type: 'SET_SYSTEM_DARK_MODE', payload: e.matches });
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for system reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        dispatch({ type: 'TOGGLE_REDUCED_MOTION' });
      }
    };

    // Set initial state
    if (mediaQuery.matches) {
      dispatch({ type: 'TOGGLE_REDUCED_MOTION' });
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const variables = getThemeVariables();

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Set data attributes for CSS selectors
    root.setAttribute('data-theme', state.actualMode);
    root.setAttribute('data-color-scheme', state.colorScheme);
    root.setAttribute('data-density', state.density);
    root.setAttribute('data-high-contrast', state.highContrast.toString());
    root.setAttribute('data-reduced-motion', state.reducedMotion.toString());
  }, [state]);

  const setThemeMode = (mode: ThemeMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  };

  const setColorScheme = (scheme: ColorScheme) => {
    dispatch({ type: 'SET_COLOR_SCHEME', payload: scheme });
  };

  const setDensity = (density: DensityLevel) => {
    dispatch({ type: 'SET_DENSITY', payload: density });
  };

  const setFontSize = (size: number) => {
    dispatch({ type: 'SET_FONT_SIZE', payload: size });
  };

  const toggleAnimations = () => {
    dispatch({ type: 'TOGGLE_ANIMATIONS' });
  };

  const toggleReducedMotion = () => {
    dispatch({ type: 'TOGGLE_REDUCED_MOTION' });
  };

  const toggleHighContrast = () => {
    dispatch({ type: 'TOGGLE_HIGH_CONTRAST' });
  };

  const setBorderRadius = (radius: number) => {
    dispatch({ type: 'SET_BORDER_RADIUS', payload: radius });
  };

  const toggleCompactSidebar = () => {
    dispatch({ type: 'TOGGLE_COMPACT_SIDEBAR' });
  };

  const resetToDefaults = () => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
  };

  const getThemeVariables = (): Record<string, string> => {
    const isDark = state.actualMode === 'dark';
    const baseSpacing = state.density === 'compact' ? 4 : state.density === 'spacious' ? 12 : 8;

    // Color schemes
    const colorSchemes = {
      default: {
        primary: isDark ? '#90caf9' : '#1976d2',
        secondary: isDark ? '#f48fb1' : '#dc004e',
        accent: isDark ? '#a5d6a7' : '#388e3c',
        background: isDark ? '#121212' : '#fafafa',
        surface: isDark ? '#1e1e1e' : '#ffffff',
        error: isDark ? '#f44336' : '#d32f2f'
      },
      security: {
        primary: isDark ? '#4fc3f7' : '#0277bd',
        secondary: isDark ? '#ff7043' : '#d84315',
        accent: isDark ? '#81c784' : '#388e3c',
        background: isDark ? '#0a0e27' : '#f5f5f5',
        surface: isDark ? '#1a1a2e' : '#ffffff',
        error: isDark ? '#ef5350' : '#c62828'
      },
      military: {
        primary: isDark ? '#66bb6a' : '#2e7d32',
        secondary: isDark ? '#ffa726' : '#f57c00',
        accent: isDark ? '#42a5f5' : '#1976d2',
        background: isDark ? '#0d1b0d' : '#f1f8e9',
        surface: isDark ? '#1a2e1a' : '#ffffff',
        error: isDark ? '#e57373' : '#c62828'
      },
      corporate: {
        primary: isDark ? '#64b5f6' : '#1565c0',
        secondary: isDark ? '#ba68c8' : '#7b1fa2',
        accent: isDark ? '#4db6ac' : '#00695c',
        background: isDark ? '#111827' : '#f9fafb',
        surface: isDark ? '#1f2937' : '#ffffff',
        error: isDark ? '#f87171' : '#dc2626'
      }
    };

    const colors = colorSchemes[state.colorScheme];

    return {
      // Colors
      '--ps-color-primary': colors.primary,
      '--ps-color-secondary': colors.secondary,
      '--ps-color-accent': colors.accent,
      '--ps-color-background': colors.background,
      '--ps-color-surface': colors.surface,
      '--ps-color-error': colors.error,
      
      // Spacing
      '--ps-spacing-xs': `${baseSpacing / 2}px`,
      '--ps-spacing-sm': `${baseSpacing}px`,
      '--ps-spacing-md': `${baseSpacing * 2}px`,
      '--ps-spacing-lg': `${baseSpacing * 3}px`,
      '--ps-spacing-xl': `${baseSpacing * 4}px`,
      
      // Typography
      '--ps-font-size-base': `${state.fontSize}px`,
      '--ps-font-size-sm': `${state.fontSize * 0.875}px`,
      '--ps-font-size-lg': `${state.fontSize * 1.125}px`,
      '--ps-font-size-xl': `${state.fontSize * 1.25}px`,
      
      // Border radius
      '--ps-border-radius': `${state.borderRadius}px`,
      '--ps-border-radius-sm': `${state.borderRadius / 2}px`,
      '--ps-border-radius-lg': `${state.borderRadius * 1.5}px`,
      
      // Animations
      '--ps-animation-duration': state.animations && !state.reducedMotion ? '200ms' : '0ms',
      '--ps-transition': state.animations && !state.reducedMotion ? 'all 200ms ease-in-out' : 'none',
      
      // Shadows
      '--ps-shadow-sm': isDark 
        ? '0 1px 2px 0 rgba(0, 0, 0, 0.5)' 
        : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '--ps-shadow-md': isDark 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      '--ps-shadow-lg': isDark 
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      
      // High contrast adjustments
      '--ps-contrast-multiplier': state.highContrast ? '1.5' : '1'
    };
  };

  const exportTheme = (): string => {
    const themeData = {
      version: '1.0',
      settings: {
        mode: state.mode,
        colorScheme: state.colorScheme,
        density: state.density,
        fontSize: state.fontSize,
        animations: state.animations,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        borderRadius: state.borderRadius,
        compactSidebar: state.compactSidebar
      }
    };
    
    return JSON.stringify(themeData, null, 2);
  };

  const importTheme = (themeData: string): boolean => {
    try {
      const parsed = JSON.parse(themeData);
      
      if (parsed.version && parsed.settings) {
        const settings = parsed.settings;
        
        // Validate and apply settings
        if (settings.mode) setThemeMode(settings.mode);
        if (settings.colorScheme) setColorScheme(settings.colorScheme);
        if (settings.density) setDensity(settings.density);
        if (typeof settings.fontSize === 'number') setFontSize(settings.fontSize);
        if (typeof settings.borderRadius === 'number') setBorderRadius(settings.borderRadius);
        
        return true;
      }
    } catch (error) {
      console.error('Failed to import theme:', error);
    }
    
    return false;
  };

  const contextValue: ThemeContextType = {
    state,
    setThemeMode,
    setColorScheme,
    setDensity,
    setFontSize,
    toggleAnimations,
    toggleReducedMotion,
    toggleHighContrast,
    setBorderRadius,
    toggleCompactSidebar,
    resetToDefaults,
    getThemeVariables,
    exportTheme,
    importTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};