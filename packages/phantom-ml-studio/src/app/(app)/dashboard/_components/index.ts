/**
 * Components Index
 * Central export point for all Dashboard components
 */

export { DashboardErrorBoundary } from './DashboardErrorBoundary';
export { MetricsCards } from './MetricsCards';
export { DashboardCharts } from './DashboardCharts';

// Re-export types for convenience
export type {
  DashboardData
} from '@/features/dashboard/types/dashboard.types';
