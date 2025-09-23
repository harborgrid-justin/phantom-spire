/**
 * Components Index
 * Central export point for all Business Intelligence components
 */

export { KPICards } from './KPICards';
export {
  ROITrendChart,
  CostDistributionChart,
  RevenueVsCostsChart,
  ModelPerformanceChart,
  FinancialAnalysisTab,
  PerformanceMetricsTab
} from './Charts';
export {
  ResourceOptimizationTab,
  ForecastingTab
} from './TabContent';

// Re-export types for convenience
export type {
  BusinessMetric,
  ROIDataPoint,
  PerformanceDataPoint
} from '../_hooks/useBusinessIntelligenceState';
