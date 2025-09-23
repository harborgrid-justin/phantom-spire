/**
 * Analytics Types and Interfaces
 * Type definitions for analytics system components
 */

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TrendAnalysis {
  metricId: string;
  timeframe: 'hourly' | 'daily' | 'weekly' | 'monthly';
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  trendStrength: number; // 0-1, higher means stronger trend
  changePercentage: number;
  dataPoints: Array<{ timestamp: Date; value: number }>;
  forecast?: Array<{ timestamp: Date; predictedValue: number; confidence: number }> | undefined;
}

export interface AnomalyDetection {
  metricId: string;
  timestamp: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1, probability that this is an anomaly
  context?: Record<string, any> | undefined;
}

export interface BusinessInsight {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'cost' | 'usage' | 'quality' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  impact: 'positive' | 'negative' | 'neutral';
  recommendations: string[];
  relatedMetrics: string[];
  generatedAt: Date;
  metadata?: Record<string, any>;
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'linear_regression' | 'time_series' | 'neural_network' | 'ensemble';
  targetMetric: string;
  features: string[];
  accuracy: number;
  lastTrainedAt: Date;
  parameters: Record<string, any>;
}

export interface AnalyticsReport {
  id: string;
  title: string;
  reportType: 'executive' | 'operational' | 'technical' | 'custom';
  timeframe: { start: Date; end: Date };
  generatedAt: Date;
  summary: {
    keyMetrics: Record<string, number>;
    trends: TrendAnalysis[];
    anomalies: AnomalyDetection[];
    insights: BusinessInsight[];
  };
  sections: AnalyticsReportSection[];
}

export interface AnalyticsReportSection {
  title: string;
  type: 'metrics' | 'chart' | 'table' | 'text';
  content: any;
  insights?: string[];
}

export interface AnalyticsConfig {
  enableAnomalyDetection: boolean;
  anomalyThreshold: number;
  enableTrendAnalysis: boolean;
  enablePredictiveAnalytics: boolean;
  dataRetentionDays: number;
  batchProcessingInterval: number; // minutes
  realTimeProcessing: boolean;
}
