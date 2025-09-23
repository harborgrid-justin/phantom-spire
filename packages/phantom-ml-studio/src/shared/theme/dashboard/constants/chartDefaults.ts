/**
 * CHART DEFAULTS
 * 
 * Default configurations and presets for enterprise charts
 */

import type { ChartOptions, Animation, Interaction, Export, Legend, Tooltip } from '../types';

// Default animations for different chart types
export const defaultAnimations: Record<string, Animation> = {
  line: {
    duration: 750,
    easing: 'cubic',
    delay: 0,
    stagger: 50,
  },
  bar: {
    duration: 600,
    easing: 'back',
    delay: 0,
    stagger: 100,
  },
  pie: {
    duration: 800,
    easing: 'elastic',
    delay: 0,
    stagger: 150,
  },
  area: {
    duration: 1000,
    easing: 'quadratic',
    delay: 0,
    stagger: 75,
  },
  scatter: {
    duration: 500,
    easing: 'circular',
    delay: 0,
    stagger: 25,
  },
  bubble: {
    duration: 900,
    easing: 'bounce',
    delay: 100,
    stagger: 50,
  },
  gauge: {
    duration: 1200,
    easing: 'elastic',
    delay: 0,
    stagger: 0,
  },
  sparkline: {
    duration: 300,
    easing: 'linear',
    delay: 0,
    stagger: 10,
  },
};

// Default interactions for different chart types
export const defaultInteractions: Record<string, Interaction> = {
  line: {
    zoom: true,
    pan: true,
    brush: true,
    dataZoom: true,
    crosshair: true,
    hover: true,
    click: true,
    doubleClick: false,
    contextMenu: true,
  },
  bar: {
    zoom: true,
    pan: false,
    brush: true,
    dataZoom: false,
    crosshair: false,
    hover: true,
    click: true,
    doubleClick: false,
    contextMenu: true,
  },
  pie: {
    zoom: false,
    pan: false,
    brush: false,
    dataZoom: false,
    crosshair: false,
    hover: true,
    click: true,
    doubleClick: false,
    contextMenu: true,
  },
  scatter: {
    zoom: true,
    pan: true,
    brush: true,
    dataZoom: true,
    crosshair: true,
    hover: true,
    click: true,
    doubleClick: false,
    contextMenu: true,
  },
  heatmap: {
    zoom: true,
    pan: true,
    brush: false,
    dataZoom: false,
    crosshair: false,
    hover: true,
    click: true,
    doubleClick: false,
    contextMenu: true,
  },
  gauge: {
    zoom: false,
    pan: false,
    brush: false,
    dataZoom: false,
    crosshair: false,
    hover: true,
    click: false,
    doubleClick: false,
    contextMenu: false,
  },
  sparkline: {
    zoom: false,
    pan: false,
    brush: false,
    dataZoom: false,
    crosshair: false,
    hover: false,
    click: false,
    doubleClick: false,
    contextMenu: false,
  },
};

// Default export settings
export const defaultExport: Export = {
  enabled: true,
  formats: ['png', 'jpg', 'pdf', 'svg', 'csv'],
  filename: 'chart',
  quality: 1,
  backgroundColor: '#ffffff',
};

// Default legend settings
export const defaultLegend: Legend = {
  show: true,
  position: 'bottom',
  align: 'center',
  orientation: 'horizontal',
  maxHeight: 100,
  itemGap: 10,
  textStyle: {
    fontSize: 12,
    fontWeight: 'normal',
  },
};

// Default tooltip settings
export const defaultTooltip: Tooltip = {
  show: true,
  trigger: 'item',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderColor: 'transparent',
  borderWidth: 0,
  textStyle: {
    color: '#ffffff',
    fontSize: 12,
  },
};

// Base chart options
export const baseChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  height: 400,
  padding: [20, 20, 20, 20],
  backgroundColor: 'transparent',
  theme: 'auto',
  title: {
    textAlign: 'left',
    left: 20,
    top: 10,
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  },
  grid: {
    left: 60,
    top: 60,
    right: 40,
    bottom: 60,
    containLabel: true,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  legend: defaultLegend,
  tooltip: defaultTooltip,
  export: defaultExport,
};

// Chart type specific defaults
export const chartTypeDefaults: Record<string, Partial<ChartOptions>> = {
  line: {
    ...baseChartOptions,
    animation: defaultAnimations['line'],
    interaction: defaultInteractions['line'],
    xAxis: {
      type: 'category',
      gridLines: true,
      labels: {
        show: true,
        rotate: 0,
      },
    },
    yAxis: {
      type: 'linear',
      gridLines: true,
      labels: {
        show: true,
      },
    },
  },
  area: {
    ...baseChartOptions,
    animation: defaultAnimations['area'],
    interaction: defaultInteractions['line'],
    xAxis: {
      type: 'category',
      gridLines: true,
      labels: {
        show: true,
        rotate: 0,
      },
    },
    yAxis: {
      type: 'linear',
      gridLines: true,
      labels: {
        show: true,
      },
    },
  },
  bar: {
    ...baseChartOptions,
    animation: defaultAnimations['bar'],
    interaction: defaultInteractions['bar'],
    xAxis: {
      type: 'linear',
      gridLines: true,
      labels: {
        show: true,
      },
    },
    yAxis: {
      type: 'category',
      gridLines: false,
      labels: {
        show: true,
      },
    },
  },
  column: {
    ...baseChartOptions,
    animation: defaultAnimations['bar'],
    interaction: defaultInteractions['bar'],
    xAxis: {
      type: 'category',
      gridLines: false,
      labels: {
        show: true,
        rotate: 0,
      },
    },
    yAxis: {
      type: 'linear',
      gridLines: true,
      labels: {
        show: true,
      },
    },
  },
  pie: {
    ...baseChartOptions,
    animation: defaultAnimations['pie'],
    interaction: defaultInteractions['pie'],
    legend: {
      ...defaultLegend,
      position: 'right',
      orientation: 'vertical',
    },
    grid: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      containLabel: false,
    },
  },
  donut: {
    ...baseChartOptions,
    animation: defaultAnimations['pie'],
    interaction: defaultInteractions['pie'],
    legend: {
      ...defaultLegend,
      position: 'right',
      orientation: 'vertical',
    },
    grid: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      containLabel: false,
    },
  },
  scatter: {
    ...baseChartOptions,
    animation: defaultAnimations['scatter'],
    interaction: defaultInteractions['scatter'],
    xAxis: {
      type: 'linear',
      gridLines: true,
      labels: {
        show: true,
      },
    },
    yAxis: {
      type: 'linear',
      gridLines: true,
      labels: {
        show: true,
      },
    },
  },
  bubble: {
    ...baseChartOptions,
    animation: defaultAnimations['bubble'],
    interaction: defaultInteractions['scatter'],
    xAxis: {
      type: 'linear',
      gridLines: true,
      labels: {
        show: true,
      },
    },
    yAxis: {
      type: 'linear',
      gridLines: true,
      labels: {
        show: true,
      },
    },
  },
  heatmap: {
    ...baseChartOptions,
    animation: defaultAnimations['area'],
    interaction: defaultInteractions['heatmap'],
    xAxis: {
      type: 'category',
      gridLines: false,
      labels: {
        show: true,
      },
    },
    yAxis: {
      type: 'category',
      gridLines: false,
      labels: {
        show: true,
      },
    },
  },
  radar: {
    ...baseChartOptions,
    animation: defaultAnimations['area'],
    interaction: defaultInteractions['pie'],
    grid: {
      left: 20,
      top: 20,
      right: 20,
      bottom: 20,
      containLabel: false,
    },
  },
  gauge: {
    ...baseChartOptions,
    animation: defaultAnimations['gauge'],
    interaction: defaultInteractions['gauge'],
    legend: {
      ...defaultLegend,
      show: false,
    },
    grid: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      containLabel: false,
    },
  },
  sparkline: {
    height: 60,
    padding: [5, 5, 5, 5],
    backgroundColor: 'transparent',
    ...(defaultAnimations['sparkline'] && { animation: defaultAnimations['sparkline'] }),
    ...(defaultInteractions['sparkline'] && { interaction: defaultInteractions['sparkline'] }),
    legend: {
      show: false,
    },
    tooltip: {
      show: false,
    },
    grid: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      containLabel: false,
    },
  },
};

// Responsive breakpoint adjustments
export const responsiveAdjustments = {
  mobile: {
    title: {
      textStyle: {
        fontSize: 14,
      },
    },
    legend: {
      textStyle: {
        fontSize: 10,
      },
      itemGap: 5,
    },
    grid: {
      left: 40,
      right: 20,
    },
  },
  tablet: {
    title: {
      textStyle: {
        fontSize: 15,
      },
    },
    legend: {
      textStyle: {
        fontSize: 11,
      },
      itemGap: 8,
    },
  },
  desktop: {
    // Use defaults
  },
};

// Performance optimization settings
export const performanceSettings = {
  // Number of data points before enabling sampling
  samplingThreshold: 10000,
  
  // Number of data points before enabling virtualization
  virtualizationThreshold: 50000,
  
  // Animation settings for large datasets
  largeDatasetAnimation: {
    duration: 300,
    easing: 'linear',
    stagger: 0,
  },
  
  // Throttle settings for real-time updates
  realTimeThrottle: {
    updateInterval: 100, // ms
    maxUpdatesPerSecond: 30,
  },
};

export const chartDefaults = {
  animations: defaultAnimations,
  interactions: defaultInteractions,
  export: defaultExport,
  legend: defaultLegend,
  tooltip: defaultTooltip,
  base: baseChartOptions,
  types: chartTypeDefaults,
  responsive: responsiveAdjustments,
  performance: performanceSettings,
};

export default chartDefaults;
