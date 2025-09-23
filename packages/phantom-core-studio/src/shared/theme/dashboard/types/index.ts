/**
 * ENTERPRISE DASHBOARD TYPES
 * 
 * Comprehensive type definitions for enterprise dashboard components
 */

import { ReactNode, CSSProperties } from 'react';
import { BoxProps } from '@mui/material';

// Base Types
export type ResponsiveValue<T> = T | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', T>>;

// Color and Theme Types
export interface DashboardTheme {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  accentColors: string[];
  gridLines: string;
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

// Chart Data Types
export interface DataPoint {
  id?: string | number;
  x: number | string | Date;
  y: number;
  label?: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface Series {
  id: string;
  name: string;
  data: DataPoint[];
  color?: string;
  type?: ChartType;
  visible?: boolean;
  yAxisIndex?: number;
  stack?: string;
  area?: boolean;
  smooth?: boolean;
  metadata?: Record<string, any>;
}

export interface ChartData {
  series: Series[];
  categories?: string[];
  metadata?: Record<string, any>;
}

// Chart Configuration Types
export type ChartType = 
  | 'line' 
  | 'area' 
  | 'bar' 
  | 'column'
  | 'pie' 
  | 'donut'
  | 'scatter'
  | 'bubble'
  | 'heatmap'
  | 'treemap'
  | 'radar'
  | 'gauge'
  | 'sparkline'
  | 'candlestick'
  | 'sankey'
  | 'funnel'
  | 'combo';

export interface Axis {
  id?: string;
  title?: string;
  type?: 'linear' | 'logarithmic' | 'datetime' | 'category';
  min?: number;
  max?: number;
  tickCount?: number;
  format?: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
  gridLines?: boolean;
  labels?: {
    show?: boolean;
    rotate?: number;
    format?: string;
    color?: string;
    fontSize?: number;
  };
}

export interface Legend {
  show?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  orientation?: 'horizontal' | 'vertical';
  maxHeight?: number;
  itemGap?: number;
  textStyle?: {
    color?: string;
    fontSize?: number;
    fontWeight?: string;
  };
}

export interface Tooltip {
  show?: boolean;
  trigger?: 'item' | 'axis' | 'none';
  formatter?: string | ((params: any) => string);
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  textStyle?: {
    color?: string;
    fontSize?: number;
  };
  position?: string | ((point: [number, number], params: any, dom: HTMLElement, rect: any, size: any) => [number, number]);
}

export interface Animation {
  duration?: number;
  easing?: 'linear' | 'quadratic' | 'cubic' | 'quartic' | 'quintic' | 'sinusoidal' | 'exponential' | 'circular' | 'elastic' | 'back' | 'bounce';
  delay?: number;
  stagger?: number;
  loop?: boolean;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

export interface Interaction {
  zoom?: boolean;
  pan?: boolean;
  brush?: boolean;
  dataZoom?: boolean;
  crosshair?: boolean;
  hover?: boolean;
  click?: boolean;
  doubleClick?: boolean;
  contextMenu?: boolean;
}

export interface Export {
  enabled?: boolean;
  formats?: ('png' | 'jpg' | 'pdf' | 'svg' | 'csv' | 'xlsx')[];
  filename?: string;
  quality?: number;
  backgroundColor?: string;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  width?: number | string;
  height?: number | string;
  padding?: number | [number, number, number, number];
  backgroundColor?: string;
  theme?: 'light' | 'dark' | 'auto';
  title?: {
    text?: string;
    subtext?: string;
    left?: string | number;
    top?: string | number;
    textAlign?: 'auto' | 'left' | 'right' | 'center';
    textStyle?: {
      color?: string;
      fontSize?: number;
      fontWeight?: string;
    };
  };
  grid?: {
    left?: string | number;
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    containLabel?: boolean;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  xAxis?: Axis;
  yAxis?: Axis | Axis[];
  legend?: Legend;
  tooltip?: Tooltip;
  animation?: Animation;
  interaction?: Interaction;
  export?: Export;
  customization?: Record<string, any>;
}

// Component Props Types
export interface BaseProps extends Omit<BoxProps, 'children'> {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface DashboardProps extends BaseProps {
  layout?: 'grid' | 'flex' | 'masonry' | 'custom';
  columns?: ResponsiveValue<number>;
  gap?: ResponsiveValue<number>;
  theme?: DashboardTheme;
  fullscreen?: boolean;
  refreshInterval?: number;
  autoRefresh?: boolean;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onThemeChange?: (theme: DashboardTheme) => void;
  onLayoutChange?: (layout: any) => void;
}

export interface WidgetProps extends BaseProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode[];
  loading?: boolean;
  error?: string | null;
  minHeight?: number | string;
  maxHeight?: number | string;
  resizable?: boolean;
  draggable?: boolean;
  collapsible?: boolean;
  removable?: boolean;
  fullscreenable?: boolean;
  refreshable?: boolean;
  exportable?: boolean;
  colSpan?: ResponsiveValue<number>;
  rowSpan?: ResponsiveValue<number>;
  onResize?: (size: { width: number; height: number }) => void;
  onRemove?: () => void;
  onRefresh?: () => void;
  onExport?: (format: string) => void;
  onFullscreen?: (isFullscreen: boolean) => void;
}

export interface ChartProps extends Omit<BaseProps, 'onError'> {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  width?: number | string;
  height?: number | string;
  loading?: boolean;
  error?: string | null;
  theme?: 'light' | 'dark' | 'auto';
  responsive?: boolean;
  realTime?: boolean;
  updateInterval?: number;
  onDataPointClick?: (dataPoint: DataPoint, series: Series) => void;
  onDataPointHover?: (dataPoint: DataPoint, series: Series) => void;
  onZoom?: (range: { start: number; end: number }) => void;
  onBrush?: (selection: { x: [number, number]; y: [number, number] }) => void;
  onLegendClick?: (series: Series) => void;
  onReady?: (chart: any) => void;
  onChartError?: (error: Error) => void;
}

// KPI and Metric Types
export interface KPIData {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  format?: string;
  previousValue?: number;
  target?: number;
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  color?: string;
  icon?: ReactNode;
  metadata?: Record<string, any>;
}

export interface MetricCardProps extends BaseProps {
  title: string;
  value: number | string;
  unit?: string;
  format?: string;
  previousValue?: number;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  trend?: 'up' | 'down' | 'stable';
  color?: string;
  icon?: ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outlined' | 'filled';
  showSparkline?: boolean;
  sparklineData?: number[];
  loading?: boolean;
  onClick?: () => void;
}

// Filter Types
export interface FilterConfig {
  id: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'numberrange' | 'boolean';
  label: string;
  placeholder?: string;
  options?: { label: string; value: any }[];
  defaultValue?: any;
  required?: boolean;
  validation?: (value: any) => boolean | string;
  dependencies?: string[];
}

export interface FilterState {
  [filterId: string]: any;
}

export interface FilterPanelProps extends BaseProps {
  filters: FilterConfig[];
  values: FilterState;
  onChange: (values: FilterState) => void;
  onReset?: () => void;
  orientation?: 'horizontal' | 'vertical';
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  showResetButton?: boolean;
  showApplyButton?: boolean;
  loading?: boolean;
}

// Data Table Types
export interface TableColumn {
  id: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  sticky?: boolean;
  render?: (value: any, row: any, column: TableColumn) => ReactNode;
  format?: string | ((value: any) => string);
}

export interface TableRow {
  id: string | number;
  [key: string]: any;
}

export interface DataTableProps extends BaseProps {
  columns: TableColumn[];
  data: TableRow[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    enabled?: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    total?: number;
    current?: number;
    onChange?: (page: number, pageSize: number) => void;
  };
  sorting?: {
    enabled?: boolean;
    multiple?: boolean;
    defaultSort?: { field: string; direction: 'asc' | 'desc' }[];
    onChange?: (sort: { field: string; direction: 'asc' | 'desc' }[]) => void;
  };
  filtering?: {
    enabled?: boolean;
    global?: boolean;
    onChange?: (filters: Record<string, any>) => void;
  };
  selection?: {
    enabled?: boolean;
    multiple?: boolean;
    selectedRows?: (string | number)[];
    onChange?: (selectedRows: (string | number)[]) => void;
  };
  virtualization?: {
    enabled?: boolean;
    rowHeight?: number;
    overscan?: number;
  };
  export?: {
    enabled?: boolean;
    formats?: ('csv' | 'xlsx' | 'pdf')[];
    filename?: string;
  };
  onRowClick?: (row: TableRow) => void;
  onRowDoubleClick?: (row: TableRow) => void;
  onCellClick?: (value: any, row: TableRow, column: TableColumn) => void;
}

// Layout Types
export interface DashboardLayoutProps extends BaseProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  sidebarWidth?: number | string;
  sidebarCollapsed?: boolean;
  sidebarCollapsible?: boolean;
  headerHeight?: number | string;
  footerHeight?: number | string;
  onSidebarToggle?: (collapsed: boolean) => void;
}

// Real-time Data Types
export interface RealTimeConfig {
  enabled?: boolean;
  interval?: number;
  maxDataPoints?: number;
  bufferSize?: number;
  autoScroll?: boolean;
  pauseOnHover?: boolean;
  connectionStatus?: 'connected' | 'disconnected' | 'connecting' | 'error';
}

export interface RealTimeDataPoint extends DataPoint {
  timestamp: Date;
}

// Export Types
export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf' | 'svg' | 'csv' | 'xlsx';
  filename?: string;
  quality?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  includeData?: boolean;
  dateRange?: [Date, Date];
}

// Error and Loading Types
export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp?: Date;
}

export interface LoadingState {
  loading: boolean;
  progress?: number;
  message?: string;
}

// Event Types
export interface ChartEvent {
  type: 'click' | 'hover' | 'zoom' | 'brush' | 'legendClick';
  data: any;
  chart: any;
  originalEvent: Event;
}

export interface DashboardEvent {
  type: 'widgetAdd' | 'widgetRemove' | 'widgetResize' | 'widgetMove' | 'layoutChange' | 'themeChange' | 'refresh';
  data: any;
  timestamp: Date;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Merge<T, U> = Omit<T, keyof U> & U;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredProps<T, K extends keyof T> = T & Required<Pick<T, K>>;
