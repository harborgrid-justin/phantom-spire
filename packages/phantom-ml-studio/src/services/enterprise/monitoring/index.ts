/**
 * Enterprise Performance Monitoring Module
 * Centralized exports for all monitoring components
 */

// Export the main service (primary export)
export {
  PerformanceMonitoringService,
  performanceMonitoringService,
  performanceMonitoringService as default
} from './performance-monitoring.service';

// Export all component classes
export { MetricCollector } from './metric-collector';
export { AlertManager } from './alert-manager';
export { PerformanceOptimizer } from './performance-optimizer';
export { HealthMonitor } from './health-monitor';

// Export all types
export type {
  // Configuration types
  MonitoringConfiguration,

  // Metric types
  PerformanceMetric,
  MetricAggregation,
  PerformanceBaseline,

  // Alert types
  Alert,
  AlertRule,
  AlertCondition,
  NotificationHistory,
  AlertSeverity,

  // Optimization types
  OptimizationRecommendation,
  OptimizationHistory,
  PerformanceAnomaly,
  OptimizationFilter,

  // Health monitoring types
  SystemHealth,
  ComponentHealth,
  HealthIssue,
  ComponentName,

  // Event types
  MetricCollectionEvent,
  HealthUpdateEvent,
  OptimizationEvent,
  RecommendationGeneratedEvent,

  // Utility types
  TimeRange,
  MetricOperator,
  OptimizationType,
  OptimizationPriority,
  OptimizationStatus,
  HealthStatus,
  TrendDirection,
  SamplingStrategy
} from './monitoring.types';

// Export utility functions
export {
  // Statistical utilities
  calculatePercentile,
  calculateStandardDeviation,
  calculateZScore,
  calculateBasicStats,

  // Metric utilities
  groupMetricsByName,
  groupMetricsBySource,
  filterMetricsByTimeRange,
  filterMetricsByTags,
  getLatestMetricValue,

  // Sampling utilities
  applyUniformSampling,
  applyAdaptiveSampling,
  applyPrioritySampling,

  // Pattern matching utilities
  matchesPattern,
  containsKeywords,

  // Validation utilities
  validateMetric,
  validateTimeRange,

  // Formatting utilities
  formatMetricValue,
  formatDuration,
  formatTimestamp,

  // ID generation utilities
  generateId,
  generateMetricKey,

  // Compression utilities
  compressMetricData,
  decompressMetricData,

  // Retry utilities
  retryWithBackoff,

  // Threshold utilities
  checkThreshold,
  calculateDynamicThreshold
} from './monitoring.utils';