/**
 * CHART COLORS
 * 
 * Professional color palettes for enterprise charts and data visualization
 */

// Primary color palette - Modern and professional
export const primaryPalette = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

// Sequential color palettes for data progression
export const sequentialPalettes = {
  blue: [
    '#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA',
    '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'
  ],
  green: [
    '#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80',
    '#22C55E', '#16A34A', '#15803D', '#166534', '#14532D'
  ],
  orange: [
    '#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74', '#FB923C',
    '#F97316', '#EA580C', '#DC2626', '#C2410C', '#9A3412'
  ],
  purple: [
    '#FAF5FF', '#F3E8FF', '#E9D5FF', '#D8B4FE', '#C084FC',
    '#A855F7', '#9333EA', '#7C3AED', '#6D28D9', '#5B21B6'
  ],
  red: [
    '#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171',
    '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'
  ],
};

// Diverging color palettes for showing contrast
export const divergingPalettes = {
  redBlue: [
    '#B91C1C', '#DC2626', '#EF4444', '#F87171', '#FCA5A5',
    '#F3F4F6',
    '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'
  ],
  orangeBlue: [
    '#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FED7AA',
    '#F8FAFC',
    '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB'
  ],
  purpleGreen: [
    '#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE',
    '#F9FAFB',
    '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A'
  ],
};

// Categorical palettes for different data categories
export const categoricalPalettes = {
  // Bright and distinct colors
  vibrant: [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1'
  ],
  
  // Muted professional colors
  professional: [
    '#475569', '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0',
    '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB'
  ],
  
  // Pastel colors for soft visualizations
  pastel: [
    '#DBEAFE', '#FEE2E2', '#D1FAE5', '#FEF3C7', '#E9D5FF',
    '#FCE7F3', '#CFFAFE', '#FED7AA', '#ECFCCB', '#E0E7FF'
  ],
  
  // High contrast for accessibility
  accessible: [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#800000', '#008000'
  ],
  
  // Corporate colors
  corporate: [
    '#1E40AF', '#DC2626', '#059669', '#D97706', '#7C2D12',
    '#4C1D95', '#BE185D', '#0369A1', '#065F46', '#92400E'
  ],
};

// Semantic colors for specific data meanings
export const semanticColors = {
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  neutral: '#6B7280',
  positive: '#22C55E',
  negative: '#DC2626',
  trend: {
    up: '#10B981',
    down: '#EF4444',
    stable: '#6B7280',
  },
  status: {
    active: '#10B981',
    inactive: '#6B7280',
    pending: '#F59E0B',
    error: '#EF4444',
  },
  priority: {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#10B981',
  },
};

// Heatmap colors
export const heatmapColors = {
  // Blue to red gradient
  blueRed: [
    '#1E3A8A', '#1E40AF', '#1D4ED8', '#2563EB', '#3B82F6',
    '#60A5FA', '#93C5FD', '#FECACA', '#F87171', '#EF4444',
    '#DC2626', '#B91C1C'
  ],
  
  // Green to red gradient (traditional)
  greenRed: [
    '#14532D', '#166534', '#15803D', '#16A34A', '#22C55E',
    '#4ADE80', '#86EFAC', '#FCA5A5', '#F87171', '#EF4444',
    '#DC2626', '#B91C1C'
  ],
  
  // Monochrome blue
  monoBlue: [
    '#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8',
    '#64748B', '#475569', '#334155', '#1E293B', '#0F172A'
  ],
  
  // Purple gradient
  purple: [
    '#FAF5FF', '#F3E8FF', '#E9D5FF', '#D8B4FE', '#C084FC',
    '#A855F7', '#9333EA', '#7C3AED', '#6D28D9', '#5B21B6'
  ],
};

// Color utility functions
export const colorUtils = {
  // Convert hex to rgba
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },
  
  // Generate gradient
  generateGradient: (colors: string[], steps: number = 10): string[] => {
    if (colors.length < 2) return colors;
    
    const gradient: string[] = [];
    const segments = colors.length - 1;
    const stepsPerSegment = Math.floor(steps / segments);
    
    for (let i = 0; i < segments; i++) {
      const startColor = colors[i];
      const endColor = colors[i + 1];
      
      for (let j = 0; j < stepsPerSegment; j++) {
        const ratio = j / stepsPerSegment;
        const interpolated = interpolateColor(startColor, endColor, ratio);
        gradient.push(interpolated);
      }
    }
    
    gradient.push(colors[colors.length - 1]);
    return gradient;
  },
  
  // Get contrasting text color
  getContrastColor: (backgroundColor: string): string => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  },
  
  // Lighten color
  lighten: (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + amount);
    const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  },
  
  // Darken color
  darken: (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  },
  
  // Create color scale
  createScale: (domain: [number, number], range: string[]): ((value: number) => string) => {
    return (value: number) => {
      const [min, max] = domain;
      const normalized = (value - min) / (max - min);
      const index = Math.floor(normalized * (range.length - 1));
      const clampedIndex = Math.max(0, Math.min(range.length - 1, index));
      return range[clampedIndex] || range[0];
    };
  },
};

// Helper function for color interpolation
function interpolateColor(color1: string, color2: string, ratio: number): string {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Color scheme presets
export const colorSchemes = {
  default: primaryPalette,
  business: categoricalPalettes.corporate,
  modern: categoricalPalettes.vibrant,
  minimal: categoricalPalettes.professional,
  accessible: categoricalPalettes.accessible,
  pastel: categoricalPalettes.pastel,
};

// Dark theme colors
export const darkThemeColors = {
  primary: primaryPalette.map(color => colorUtils.lighten(color, 20)),
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F8FAFC',
  border: '#334155',
  grid: '#475569',
};

// Light theme colors
export const lightThemeColors = {
  primary: primaryPalette,
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#0F172A',
  border: '#E2E8F0',
  grid: '#F1F5F9',
};

export const chartColors = {
  primary: primaryPalette,
  sequential: sequentialPalettes,
  diverging: divergingPalettes,
  categorical: categoricalPalettes,
  semantic: semanticColors,
  heatmap: heatmapColors,
  schemes: colorSchemes,
  dark: darkThemeColors,
  light: lightThemeColors,
  utils: colorUtils,
};

export default chartColors;
