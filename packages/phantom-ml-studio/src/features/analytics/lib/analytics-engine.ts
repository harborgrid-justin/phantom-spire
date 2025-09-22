/**
 * Enterprise Analytics Engine
 * Advanced analytics and insights for ML operations with predictive capabilities
 * Provides anomaly detection, trend analysis, and business intelligence
 */

import { EventEmitter } from 'events';
import { PerformanceMonitor } from '..\..\..\lib\monitoring\performance-monitor';
import { EnterpriseCache } from '..\..\..\lib\caching\enterprise-cache';
import { AuditLogger } from '..\..\..\security\audit-logger';

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
  forecast?: Array<{ timestamp: Date; predictedValue: number; confidence: number }>;
}

export interface AnomalyDetection {
  metricId: string;
  timestamp: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1, probability that this is an anomaly
  context?: Record<string, any>;
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

/**
 * Enterprise Analytics Engine
 * Provides comprehensive analytics, anomaly detection, and business insights
 */
export class AnalyticsEngine extends EventEmitter {
  private config: AnalyticsConfig;
  private performanceMonitor: PerformanceMonitor;
  private cache: EnterpriseCache;
  private auditLogger: AuditLogger;

  // In-memory storage - replace with time-series database in production
  private metrics = new Map<string, AnalyticsMetric[]>();
  private trends = new Map<string, TrendAnalysis>();
  private anomalies = new Map<string, AnomalyDetection[]>();
  private insights = new Map<string, BusinessInsight>();
  private predictiveModels = new Map<string, PredictiveModel>();
  private reports = new Map<string, AnalyticsReport>();

  // Analytics state
  private isProcessing = false;
  private lastProcessingTime?: Date;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    super();
    
    this.config = {
      enableAnomalyDetection: true,
      anomalyThreshold: 2.5, // Standard deviations
      enableTrendAnalysis: true,
      enablePredictiveAnalytics: true,
      dataRetentionDays: 90,
      batchProcessingInterval: 15, // 15 minutes
      realTimeProcessing: true,
      ...config
    };

    this.performanceMonitor = new PerformanceMonitor();
    this.cache = new EnterpriseCache();
    this.auditLogger = new AuditLogger();

    this.initializePredictiveModels();
    this.startBatchProcessing();
  }

  // ================== METRICS INGESTION ==================

  /**
   * Ingest metric for analysis
   */
  async ingestMetric(metric: AnalyticsMetric): Promise<void> {
    const metricId = metric.id;
    
    if (!this.metrics.has(metricId)) {
      this.metrics.set(metricId, []);
    }

    const metricHistory = this.metrics.get(metricId)!;
    metricHistory.push(metric);

    // Keep only data within retention period
    const retentionCutoff = new Date(Date.now() - this.config.dataRetentionDays * 24 * 60 * 60 * 1000);
    const filteredHistory = metricHistory.filter(m => m.timestamp >= retentionCutoff);
    this.metrics.set(metricId, filteredHistory);

    // Real-time processing
    if (this.config.realTimeProcessing) {
      await this.processMetricRealTime(metric);
    }

    this.emit('metricIngested', metric);
  }

  /**
   * Get metrics for analysis
   */
  async getMetrics(
    metricIds: string[],
    timeframe?: { start: Date; end: Date }
  ): Promise<Record<string, AnalyticsMetric[]>> {
    const result: Record<string, AnalyticsMetric[]> = {};

    for (const metricId of metricIds) {
      let metrics = this.metrics.get(metricId) || [];
      
      if (timeframe) {
        metrics = metrics.filter(m => 
          m.timestamp >= timeframe.start && m.timestamp <= timeframe.end
        );
      }

      result[metricId] = metrics;
    }

    return result;
  }

  // ================== TREND ANALYSIS ==================

  /**
   * Perform trend analysis on metric
   */
  async analyzeTrend(
    metricId: string,
    timeframe: TrendAnalysis['timeframe'] = 'daily',
    enableForecast = false
  ): Promise<TrendAnalysis> {
    const cacheKey = `trend:${metricId}:${timeframe}`;
    
    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached && !enableForecast) {
      return cached;
    }

    const metrics = this.metrics.get(metricId) || [];
    if (metrics.length < 2) {
      throw new Error(`Insufficient data for trend analysis: ${metricId}`);
    }

    // Sort by timestamp
    const sortedMetrics = metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Aggregate data by timeframe
    const aggregatedData = this.aggregateDataByTimeframe(sortedMetrics, timeframe);
    
    if (aggregatedData.length < 2) {
      throw new Error(`Insufficient aggregated data for trend analysis: ${metricId}`);
    }

    // Calculate trend
    const trend = this.calculateTrend(aggregatedData);
    const trendStrength = this.calculateTrendStrength(aggregatedData);
    const changePercentage = this.calculateChangePercentage(aggregatedData);

    let forecast: Array<{ timestamp: Date; predictedValue: number; confidence: number }> | undefined;
    if (enableForecast && this.config.enablePredictiveAnalytics) {
      forecast = await this.generateForecast(metricId, aggregatedData);
    }

    const trendAnalysis: TrendAnalysis = {
      metricId,
      timeframe,
      trend,
      trendStrength,
      changePercentage,
      dataPoints: aggregatedData,
      forecast
    };

    // Cache result
    await this.cache.set(cacheKey, trendAnalysis, 3600); // 1 hour

    this.trends.set(metricId, trendAnalysis);
    
    await this.auditLogger.logSystemEvent('trend_analysis_completed', {
      metricId,
      timeframe,
      trend,
      changePercentage
    });

    return trendAnalysis;
  }

  /**
   * Get trend analysis for multiple metrics
   */
  async analyzeTrends(
    metricIds: string[],
    timeframe: TrendAnalysis['timeframe'] = 'daily'
  ): Promise<Record<string, TrendAnalysis>> {
    const trends: Record<string, TrendAnalysis> = {};

    for (const metricId of metricIds) {
      try {
        trends[metricId] = await this.analyzeTrend(metricId, timeframe);
      } catch (error) {
        // Log error but continue with other metrics
        await this.auditLogger.logSystemEvent('trend_analysis_error', {
          metricId,
          error: error.message
        });
      }
    }

    return trends;
  }

  // ================== ANOMALY DETECTION ==================

  /**
   * Detect anomalies in metric data
   */
  async detectAnomalies(metricId: string): Promise<AnomalyDetection[]> {
    if (!this.config.enableAnomalyDetection) {
      return [];
    }

    const metrics = this.metrics.get(metricId) || [];
    if (metrics.length < 10) {
      return []; // Need sufficient data for anomaly detection
    }

    const sortedMetrics = metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const values = sortedMetrics.map(m => m.value);
    
    const anomalies: AnomalyDetection[] = [];
    const { mean, standardDeviation } = this.calculateStatistics(values);

    for (let i = 0; i < sortedMetrics.length; i++) {
      const metric = sortedMetrics[i];
      const value = metric.value;
      
      const zScore = Math.abs((value - mean) / standardDeviation);
      
      if (zScore > this.config.anomalyThreshold) {
        const anomaly: AnomalyDetection = {
          metricId,
          timestamp: metric.timestamp,
          value,
          expectedValue: mean,
          deviation: zScore,
          severity: this.calculateAnomalySeverity(zScore),
          probability: Math.min(zScore / this.config.anomalyThreshold, 1),
          context: metric.metadata
        };

        anomalies.push(anomaly);
      }
    }

    // Store anomalies
    this.anomalies.set(metricId, anomalies);

    // Alert on high-severity anomalies
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    if (criticalAnomalies.length > 0) {
      this.emit('criticalAnomaliesDetected', {
        metricId,
        anomalies: criticalAnomalies
      });
    }

    await this.auditLogger.logSystemEvent('anomaly_detection_completed', {
      metricId,
      anomaliesFound: anomalies.length,
      criticalAnomalies: criticalAnomalies.length
    });

    return anomalies;
  }

  /**
   * Get anomalies for metric
   */
  async getAnomalies(
    metricId: string,
    timeframe?: { start: Date; end: Date }
  ): Promise<AnomalyDetection[]> {
    let anomalies = this.anomalies.get(metricId) || [];
    
    if (timeframe) {
      anomalies = anomalies.filter(a => 
        a.timestamp >= timeframe.start && a.timestamp <= timeframe.end
      );
    }

    return anomalies;
  }

  // ================== BUSINESS INSIGHTS ==================

  /**
   * Generate business insights from analytics data
   */
  async generateInsights(metricIds: string[]): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];

    // Analyze trends for insights
    const trends = await this.analyzeTrends(metricIds);
    
    for (const [metricId, trend] of Object.entries(trends)) {
      // Performance insights
      if (metricId.includes('response_time') || metricId.includes('latency')) {
        if (trend.trend === 'increasing' && trend.changePercentage > 20) {
          insights.push({
            id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'Increasing Response Time Detected',
            description: `Response time has increased by ${trend.changePercentage.toFixed(1)}% over the analyzed period`,
            category: 'performance',
            priority: trend.changePercentage > 50 ? 'critical' : 'high',
            confidence: trend.trendStrength,
            impact: 'negative',
            recommendations: [
              'Investigate system load and resource utilization',
              'Review recent deployments that might affect performance',
              'Consider scaling infrastructure resources'
            ],
            relatedMetrics: [metricId],
            generatedAt: new Date()
          });
        }
      }

      // Usage insights
      if (metricId.includes('usage') || metricId.includes('requests')) {
        if (trend.trend === 'increasing' && trend.changePercentage > 30) {
          insights.push({
            id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'Growing System Usage',
            description: `System usage has grown by ${trend.changePercentage.toFixed(1)}%, indicating increased adoption`,
            category: 'usage',
            priority: 'medium',
            confidence: trend.trendStrength,
            impact: 'positive',
            recommendations: [
              'Plan for capacity scaling to handle continued growth',
              'Monitor resource utilization to prevent bottlenecks',
              'Consider implementing caching strategies'
            ],
            relatedMetrics: [metricId],
            generatedAt: new Date()
          });
        }
      }
    }

    // Analyze anomalies for insights
    for (const metricId of metricIds) {
      const anomalies = await this.detectAnomalies(metricId);
      const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
      
      if (criticalAnomalies.length > 0) {
        insights.push({
          id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Critical Anomalies Detected',
          description: `${criticalAnomalies.length} critical anomalies detected in ${metricId}`,
          category: 'quality',
          priority: 'critical',
          confidence: 0.9,
          impact: 'negative',
          recommendations: [
            'Immediately investigate the root cause of anomalies',
            'Review system logs for error patterns',
            'Consider implementing automated remediation'
          ],
          relatedMetrics: [metricId],
          generatedAt: new Date(),
          metadata: { anomalies: criticalAnomalies.length }
        });
      }
    }

    // Store insights
    insights.forEach(insight => {
      this.insights.set(insight.id, insight);
    });

    return insights;
  }

  /**
   * Get business insights
   */
  async getInsights(filters?: {
    category?: BusinessInsight['category'];
    priority?: BusinessInsight['priority'];
    timeframe?: { start: Date; end: Date };
  }): Promise<BusinessInsight[]> {
    let insights = Array.from(this.insights.values());

    if (filters) {
      if (filters.category) {
        insights = insights.filter(i => i.category === filters.category);
      }
      if (filters.priority) {
        insights = insights.filter(i => i.priority === filters.priority);
      }
      if (filters.timeframe) {
        insights = insights.filter(i => 
          i.generatedAt >= filters.timeframe!.start && 
          i.generatedAt <= filters.timeframe!.end
        );
      }
    }

    return insights.sort((a, b) => {
      // Sort by priority and confidence
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return b.confidence - a.confidence;
    });
  }

  // ================== PREDICTIVE ANALYTICS ==================

  /**
   * Generate forecast for metric
   */
  private async generateForecast(
    metricId: string,
    historicalData: Array<{ timestamp: Date; value: number }>
  ): Promise<Array<{ timestamp: Date; predictedValue: number; confidence: number }>> {
    if (!this.config.enablePredictiveAnalytics) {
      return [];
    }

    // Simple linear regression forecast - in production, use more sophisticated models
    const n = historicalData.length;
    if (n < 3) return [];

    // Calculate linear regression
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    historicalData.forEach((point, index) => {
      const x = index;
      const y = point.value;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate forecasts for next 7 periods
    const forecasts: Array<{ timestamp: Date; predictedValue: number; confidence: number }> = [];
    const lastTimestamp = historicalData[historicalData.length - 1].timestamp;
    
    for (let i = 1; i <= 7; i++) {
      const nextTimestamp = new Date(lastTimestamp.getTime() + i * 24 * 60 * 60 * 1000);
      const predictedValue = slope * (n + i - 1) + intercept;
      const confidence = Math.max(0.1, 1 - (i * 0.1)); // Decreasing confidence over time
      
      forecasts.push({
        timestamp: nextTimestamp,
        predictedValue: Math.max(0, predictedValue), // Ensure non-negative
        confidence
      });
    }

    return forecasts;
  }

  // ================== PRIVATE HELPER METHODS ==================

  private initializePredictiveModels(): void {
    // Initialize basic predictive models
    const models: PredictiveModel[] = [
      {
        id: 'linear_trend',
        name: 'Linear Trend Model',
        type: 'linear_regression',
        targetMetric: 'any',
        features: ['time', 'historical_values'],
        accuracy: 0.75,
        lastTrainedAt: new Date(),
        parameters: { lookback_periods: 7 }
      }
    ];

    models.forEach(model => {
      this.predictiveModels.set(model.id, model);
    });
  }

  private startBatchProcessing(): void {
    setInterval(async () => {
      if (this.isProcessing) return;

      this.isProcessing = true;
      try {
        await this.runBatchAnalytics();
        this.lastProcessingTime = new Date();
      } catch (error) {
        await this.auditLogger.logSystemEvent('batch_processing_error', {
          error: error.message
        });
      } finally {
        this.isProcessing = false;
      }
    }, this.config.batchProcessingInterval * 60 * 1000);
  }

  private async runBatchAnalytics(): Promise<void> {
    const metricIds = Array.from(this.metrics.keys());
    
    // Run trend analysis for all metrics
    if (this.config.enableTrendAnalysis) {
      await this.analyzeTrends(metricIds);
    }

    // Run anomaly detection
    if (this.config.enableAnomalyDetection) {
      for (const metricId of metricIds) {
        await this.detectAnomalies(metricId);
      }
    }

    // Generate insights
    await this.generateInsights(metricIds);

    this.emit('batchProcessingCompleted', {
      processedMetrics: metricIds.length,
      completedAt: new Date()
    });
  }

  private async processMetricRealTime(metric: AnalyticsMetric): Promise<void> {
    // Real-time anomaly detection
    if (this.config.enableAnomalyDetection) {
      const anomalies = await this.detectAnomalies(metric.id);
      const newAnomalies = anomalies.filter(a => 
        Math.abs(a.timestamp.getTime() - metric.timestamp.getTime()) < 60000
      );
      
      if (newAnomalies.length > 0) {
        this.emit('realTimeAnomalyDetected', {
          metricId: metric.id,
          anomalies: newAnomalies
        });
      }
    }
  }

  private aggregateDataByTimeframe(
    metrics: AnalyticsMetric[],
    timeframe: TrendAnalysis['timeframe']
  ): Array<{ timestamp: Date; value: number }> {
    const buckets = new Map<string, { values: number[]; timestamp: Date }>();
    
    for (const metric of metrics) {
      const bucketKey = this.getBucketKey(metric.timestamp, timeframe);
      
      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, {
          values: [],
          timestamp: this.getBucketTimestamp(metric.timestamp, timeframe)
        });
      }
      
      buckets.get(bucketKey)!.values.push(metric.value);
    }

    return Array.from(buckets.values()).map(bucket => ({
      timestamp: bucket.timestamp,
      value: bucket.values.reduce((a, b) => a + b, 0) / bucket.values.length
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private getBucketKey(timestamp: Date, timeframe: TrendAnalysis['timeframe']): string {
    switch (timeframe) {
      case 'hourly':
        return `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}-${timestamp.getHours()}`;
      case 'daily':
        return `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}`;
      case 'weekly':
        const weekStart = new Date(timestamp);
        weekStart.setDate(timestamp.getDate() - timestamp.getDay());
        return `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
      case 'monthly':
        return `${timestamp.getFullYear()}-${timestamp.getMonth()}`;
    }
  }

  private getBucketTimestamp(timestamp: Date, timeframe: TrendAnalysis['timeframe']): Date {
    const date = new Date(timestamp);
    
    switch (timeframe) {
      case 'hourly':
        date.setMinutes(0, 0, 0);
        return date;
      case 'daily':
        date.setHours(0, 0, 0, 0);
        return date;
      case 'weekly':
        date.setDate(date.getDate() - date.getDay());
        date.setHours(0, 0, 0, 0);
        return date;
      case 'monthly':
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        return date;
    }
  }

  private calculateTrend(dataPoints: Array<{ timestamp: Date; value: number }>): TrendAnalysis['trend'] {
    if (dataPoints.length < 2) return 'stable';

    const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
    const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));

    const firstAvg = firstHalf.reduce((sum, point) => sum + point.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, point) => sum + point.value, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (Math.abs(change) < 5) return 'stable';
    if (change > 20) return 'volatile';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  private calculateTrendStrength(dataPoints: Array<{ timestamp: Date; value: number }>): number {
    if (dataPoints.length < 3) return 0;

    // Calculate coefficient of determination (R²)
    const n = dataPoints.length;
    const values = dataPoints.map(p => p.value);
    const mean = values.reduce((a, b) => a + b, 0) / n;

    let ssRes = 0; // Sum of squares of residuals
    let ssTot = 0; // Total sum of squares

    for (let i = 0; i < n; i++) {
      const predicted = this.getLinearRegressionValue(i, dataPoints);
      ssRes += Math.pow(values[i] - predicted, 2);
      ssTot += Math.pow(values[i] - mean, 2);
    }

    return ssTot === 0 ? 0 : Math.max(0, 1 - (ssRes / ssTot));
  }

  private calculateChangePercentage(dataPoints: Array<{ timestamp: Date; value: number }>): number {
    if (dataPoints.length < 2) return 0;

    const first = dataPoints[0].value;
    const last = dataPoints[dataPoints.length - 1].value;

    return first === 0 ? 0 : ((last - first) / first) * 100;
  }

  private getLinearRegressionValue(x: number, dataPoints: Array<{ timestamp: Date; value: number }>): number {
    const n = dataPoints.length;
    const values = dataPoints.map(p => p.value);
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return slope * x + intercept;
  }

  private calculateStatistics(values: number[]): { mean: number; standardDeviation: number } {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    return { mean, standardDeviation };
  }

  private calculateAnomalySeverity(zScore: number): AnomalyDetection['severity'] {
    if (zScore > 4) return 'critical';
    if (zScore > 3) return 'high';
    if (zScore > 2.5) return 'medium';
    return 'low';
  }
}

export default AnalyticsEngine;