/**
 * ENTERPRISE DASHBOARD COMPONENTS
 * 
 * Production-ready dashboard components designed to compete with top-tier enterprise solutions.
 * Features advanced charts, real-time data visualization, and responsive design.
 */

// Core Dashboard Components
export { Dashboard } from './components/Dashboard';
export { DashboardLayout } from './components/DashboardLayout';
export { DashboardGrid } from './components/DashboardGrid';
export { Widget } from './components/Widget';
export { WidgetHeader } from './components/WidgetHeader';
export { WidgetContent } from './components/WidgetContent';
export { WidgetActions } from './components/WidgetActions';

// Chart Components
export { Chart } from './components/Chart';
export { LineChart } from './components/LineChart';
export { AreaChart } from './components/AreaChart';
export { BarChart } from './components/BarChart';
export { PieChart } from './components/PieChart';
export { DonutChart } from './components/DonutChart';
export { ScatterChart } from './components/ScatterChart';
export { HeatmapChart } from './components/HeatmapChart';
export { TreemapChart } from './components/TreemapChart';
export { RadarChart } from './components/RadarChart';
export { GaugeChart } from './components/GaugeChart';
export { SparklineChart } from './components/SparklineChart';
export { CandlestickChart } from './components/CandlestickChart';
export { BubbleChart } from './components/BubbleChart';
export { SankeyChart } from './components/SankeyChart';
export { FunnelChart } from './components/FunnelChart';

// Advanced Visualization Components
export { RealTimeChart } from './components/RealTimeChart';
export { InteractiveChart } from './components/InteractiveChart';
export { DrilldownChart } from './components/DrilldownChart';
export { ComboChart } from './components/ComboChart';
export { AnimatedChart } from './components/AnimatedChart';

// Data Display Components
export { DataTable } from './components/DataTable';
export { TreeTable } from './components/TreeTable';
export { PivotTable } from './components/PivotTable';
export { DataGrid } from './components/DataGrid';
export { VirtualizedTable } from './components/VirtualizedTable';

// KPI and Metric Components
export { KPICard } from './components/KPICard';
export { MetricCard } from './components/MetricCard';
export { StatCard } from './components/StatCard';
export { TrendCard } from './components/TrendCard';
export { ComparisonCard } from './components/ComparisonCard';
export { ProgressCard } from './components/ProgressCard';
export { ScoreCard } from './components/ScoreCard';

// Filter and Control Components
export { FilterPanel } from './components/FilterPanel';
export { DateRangePicker } from './components/DateRangePicker';
export { TimeframePicker } from './components/TimeframePicker';
export { DashboardFilters } from './components/DashboardFilters';
export { SearchBox } from './components/SearchBox';
export { ExportControls } from './components/ExportControls';

// Layout and Navigation Components
export { DashboardSidebar } from './components/DashboardSidebar';
export { DashboardHeader } from './components/DashboardHeader';
export { BreadcrumbNavigation } from './components/BreadcrumbNavigation';
export { TabContainer } from './components/TabContainer';
export { AccordionContainer } from './components/AccordionContainer';

// Utility Components
export { LoadingSpinner } from './components/LoadingSpinner';
export { ErrorBoundary } from './components/ErrorBoundary';
export { NoDataState } from './components/NoDataState';
export { RefreshButton } from './components/RefreshButton';
export { FullscreenToggle } from './components/FullscreenToggle';
export { ThemeToggle } from './components/ThemeToggle';

// Hooks
export { useDashboard } from './hooks/useDashboard';
export { useChart } from './hooks/useChart';
export { useRealTimeData } from './hooks/useRealTimeData';
export { useDataFiltering } from './hooks/useDataFiltering';
export { useDataExport } from './hooks/useDataExport';
export { useChartInteraction } from './hooks/useChartInteraction';
export { useDashboardLayout } from './hooks/useDashboardLayout';
export { useKPICalculations } from './hooks/useKPICalculations';
export { useDataTransformation } from './hooks/useDataTransformation';
export { useChartAnimations } from './hooks/useChartAnimations';

// Types
export type {
  DashboardProps,
  WidgetProps,
  ChartProps,
  ChartData,
  ChartOptions,
  KPIData,
  FilterConfig,
  DashboardTheme,
  ChartType,
  DataPoint,
  Series,
  Axis,
  Legend,
  Tooltip,
  Animation,
  Interaction,
  Export,
} from './types';

// Utilities
export { chartUtils } from './utils/chartUtils';
export { dataUtils } from './utils/dataUtils';
export { colorUtils } from './utils/colorUtils';
export { formatUtils } from './utils/formatUtils';
export { exportUtils } from './utils/exportUtils';
export { animationUtils } from './utils/animationUtils';

// Constants
export { chartDefaults } from './constants/chartDefaults';
export { dashboardThemes } from './constants/dashboardThemes';
export { chartColors } from './constants/chartColors';
export { animationPresets } from './constants/animationPresets';
export { formatPatterns } from './constants/formatPatterns';
