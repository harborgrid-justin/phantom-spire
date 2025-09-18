/**
 * Type definitions for Bias Detection Engine
 * Supports enterprise AI fairness and bias analysis
 */

export interface BiasMetric {
  metric: string;
  value: number;
  threshold: number;
  status: 'pass' | 'warning' | 'fail';
  description: string;
}

export interface BiasReport {
  id: string;
  modelId: string;
  modelName: string;
  timestamp: Date;
  overallScore: number;
  status: 'good' | 'moderate' | 'high_bias';
  metrics: BiasMetric[];
  protectedAttributes: string[];
  recommendations: string[];
}

export interface FairnessGroup {
  group: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  count: number;
}

export interface DisparityMetrics {
  demographicParity: number;
  equalizedOdds: number;
  equalOpportunity: number;
}

export interface FairnessAnalysis {
  attribute: string;
  groups: FairnessGroup[];
  disparityMetrics: DisparityMetrics;
}

export interface AnalysisConfig {
  modelId: string;
  protectedAttributes: string[];
  sensitivityLevel: 'low' | 'medium' | 'high';
}

// Component Props Interfaces

export interface BiasReportTableProps {
  reports: BiasReport[];
  selectedReport: BiasReport | null;
  onReportSelect: (report: BiasReport) => void;
  loading?: boolean;
}

export interface ReportDetailsProps {
  report: BiasReport | null;
}

export interface BiasMetricsProps {
  metrics: BiasMetric[];
}

export interface FairnessAnalysisProps {
  analysis: FairnessAnalysis[];
}

export interface MitigationRecommendationsProps {
  report: BiasReport | null;
}

export interface RunAnalysisDialogProps {
  open: boolean;
  config: AnalysisConfig;
  onClose: () => void;
  onConfigChange: (config: AnalysisConfig) => void;
  onRunAnalysis: () => void;
}

// Status and Color Types
export type BiasStatus = 'good' | 'moderate' | 'high_bias';
export type MetricStatus = 'pass' | 'warning' | 'fail';

// Color mappings
export const STATUS_COLORS = {
  good: 'success',
  moderate: 'warning', 
  high_bias: 'error'
} as const;

export const METRIC_STATUS_COLORS = {
  pass: 'success',
  warning: 'warning',
  fail: 'error'
} as const;

export type StatusColor = keyof typeof STATUS_COLORS;
export type MetricStatusColor = keyof typeof METRIC_STATUS_COLORS;