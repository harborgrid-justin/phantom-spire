/**
 * Advanced Analytics Components Index
 * Exports all advanced analytics frontend components
 */

export { default as PerformanceAnalyticsDashboardComponent } from './PerformanceAnalyticsDashboardComponent';
export { default as PredictiveModelingReportsComponent } from './PredictiveModelingReportsComponent';
export { default as DataVisualizationEngineComponent } from './DataVisualizationEngineComponent';
export { default as StatisticalAnalysisSuiteComponent } from './StatisticalAnalysisSuiteComponent';
export { default as MachineLearningInsightsComponent } from './MachineLearningInsightsComponent';
export { default as BehavioralAnalyticsPlatformComponent } from './BehavioralAnalyticsPlatformComponent';
export { default as TrendAnalysisDashboardComponent } from './TrendAnalysisDashboardComponent';
export { default as CorrelationAnalysisEngineComponent } from './CorrelationAnalysisEngineComponent';
export { default as AnomalyDetectionReportsComponent } from './AnomalyDetectionReportsComponent';
export { default as RealTimeAnalyticsHubComponent } from './RealTimeAnalyticsHubComponent';

// Component registry for dynamic loading
export const AdvancedAnalyticsComponents = {
  PerformanceAnalyticsDashboard: 'PerformanceAnalyticsDashboardComponent',
  PredictiveModelingReports: 'PredictiveModelingReportsComponent',
  DataVisualizationEngine: 'DataVisualizationEngineComponent',
  StatisticalAnalysisSuite: 'StatisticalAnalysisSuiteComponent',
  MachineLearningInsights: 'MachineLearningInsightsComponent',
  BehavioralAnalyticsPlatform: 'BehavioralAnalyticsPlatformComponent',
  TrendAnalysisDashboard: 'TrendAnalysisDashboardComponent',
  CorrelationAnalysisEngine: 'CorrelationAnalysisEngineComponent',
  AnomalyDetectionReports: 'AnomalyDetectionReportsComponent',
  RealTimeAnalyticsHub: 'RealTimeAnalyticsHubComponent'
};

// Category metadata
export const AdvancedAnalyticsMetadata = {
  category: 'advanced-analytics',
  displayName: 'Advanced Analytics',
  description: 'AI/ML-driven insights and predictive analytics',
  icon: 'Analytics',
  componentCount: 10
};