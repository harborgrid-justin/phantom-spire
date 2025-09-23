/**
 * Enterprise Analytics Engine
 * Advanced analytics and insights for ML operations with predictive capabilities
 * Provides anomaly detection, trend analysis, and business intelligence
 */

import { EventEmitter } from 'events';
import { EnterprisePerformanceMonitor } from '@/features/monitoring/lib/performance-monitor';
import { EnterpriseCacheSystem } from '@/lib/caching/enterprise-cache';
import { EnterpriseAuditLogger } from '@/lib/security/audit-logger';

// Import our separated modules
import { 
  AnalyticsMetric, 
  TrendAnalysis, 
  AnomalyDetection, 
  BusinessInsight, 
  AnalyticsConfig,
  AnalyticsReport,
  AnalyticsReportSection
} from './types';
import { TrendAnalyzer } from './trend-analyzer';
import { AnomalyDetector } from './anomaly-detector';
import { InsightsGenerator } from './insights-generator';

/**
 * Enterprise Analytics Engine
 * Provides comprehensive analytics, anomaly detection, and business insights
 */
export class AnalyticsEngine extends EventEmitter {
  private config: AnalyticsConfig;
  private performanceMonitor: EnterprisePerformanceMonitor;
  private cache: EnterpriseCacheSystem;
  private auditLogger: EnterpriseAuditLogger;

  // Specialized analyzers
  private trendAnalyzer: TrendAnalyzer;
  private anomalyDetector: AnomalyDetector;
  private insightsGenerator: InsightsGenerator;

  // In-memory storage - replace with time-series database in production
  private metrics = new Map<string, AnalyticsMetric[]>();
  private trends = new Map<string, TrendAnalysis>();
  private anomalies = new Map<string, AnomalyDetection[]>();
  private insights = new Map<string, BusinessInsight>();
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

    this.performanceMonitor = new EnterprisePerformanceMonitor();
    this.cache = new EnterpriseCacheSystem();
    this.auditLogger = new EnterpriseAuditLogger();

    // Initialize specialized analyzers
    this.trendAnalyzer = new TrendAnalyzer(this.config);
    this.anomalyDetector = new AnomalyDetector(this.config);
    this.insightsGenerator = new InsightsGenerator();

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
    const trendAnalysis = await this.trendAnalyzer.analyzeTrend(
      metricId, 
      metrics, 
      timeframe, 
      enableForecast
    );

    // Cache result
    await this.cache.set(cacheKey, trendAnalysis, { ttl: 3600 }); // 1 hour
    this.trends.set(metricId, trendAnalysis);
    
    await this.auditLogger.logEvent({
      type: 'system',
      action: 'trend_analysis_completed',
      data: {
        metricId,
        timeframe,
        trend: trendAnalysis.trend,
        changePercentage: trendAnalysis.changePercentage
      }
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
    // Log error but continue with other metrics
    console.warn(`Trend analysis error for ${metricId}:`, (error as Error).message);
      }
    }

    return trends;
  }

  // ================== ANOMALY DETECTION ==================

  /**
   * Detect anomalies in metric data
   */
  async detectAnomalies(metricId: string): Promise<AnomalyDetection[]> {
    const metrics = this.metrics.get(metricId) || [];
    const anomalies = await this.anomalyDetector.detectAnomalies(metricId, metrics);

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

    // Log anomaly detection completion
    console.log(`Anomaly detection completed for ${metricId}: ${anomalies.length} anomalies found, ${criticalAnomalies.length} critical`);

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
    // Analyze trends for insights
    const trends = await this.analyzeTrends(metricIds);
    
    // Get anomalies for insights
    const anomalies: Record<string, AnomalyDetection[]> = {};
    for (const metricId of metricIds) {
      anomalies[metricId] = await this.detectAnomalies(metricId);
    }

    const insights = await this.insightsGenerator.generateInsights(trends, anomalies);

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

  // ================== REPORTING ==================

  /**
   * Generate comprehensive analytics report
   */
  async generateReport(
    title: string,
    metricIds: string[],
    reportType: AnalyticsReport['reportType'] = 'operational',
    timeframe: { start: Date; end: Date }
  ): Promise<AnalyticsReport> {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get data for report
    const metricsData = await this.getMetrics(metricIds, timeframe);
    const trends = await this.analyzeTrends(metricIds);
    const insights = await this.generateInsights(metricIds);

    // Calculate key metrics
    const keyMetrics: Record<string, number> = {};
    for (const [metricId, metrics] of Object.entries(metricsData)) {
      if (metrics.length > 0) {
        const values = metrics.map(m => m.value);
        keyMetrics[`${metricId}_avg`] = values.reduce((a, b) => a + b, 0) / values.length;
        keyMetrics[`${metricId}_max`] = Math.max(...values);
        keyMetrics[`${metricId}_min`] = Math.min(...values);
      }
    }

    // Get anomalies for the timeframe
    const allAnomalies: AnomalyDetection[] = [];
    for (const metricId of metricIds) {
      const anomalies = await this.getAnomalies(metricId, timeframe);
      allAnomalies.push(...anomalies);
    }

    const report: AnalyticsReport = {
      id: reportId,
      title,
      reportType,
      timeframe,
      generatedAt: new Date(),
      summary: {
        keyMetrics,
        trends: Object.values(trends),
        anomalies: allAnomalies,
        insights
      },
      sections: this.generateReportSections(metricsData, trends, insights)
    };

    this.reports.set(reportId, report);
    
    // Log report generation
    console.log(`Analytics report generated: ${title} (${reportType}) with ${metricIds.length} metrics`);

    return report;
  }

  // ================== PRIVATE HELPER METHODS ==================

  private startBatchProcessing(): void {
    setInterval(async () => {
      if (this.isProcessing) return;

      this.isProcessing = true;
      try {
        await this.runBatchAnalytics();
        this.lastProcessingTime = new Date();
      } catch (error) {
        // Log batch processing error
        console.error('Batch processing error:', (error as Error).message);
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
      const historicalMetrics = this.metrics.get(metric.id) || [];
      const anomaly = await this.anomalyDetector.detectRealTimeAnomaly(
        metric.id,
        metric,
        historicalMetrics.slice(0, -1) // Exclude the current metric
      );
      
      if (anomaly) {
        this.emit('realTimeAnomalyDetected', {
          metricId: metric.id,
          anomaly
        });
      }
    }
  }

  private generateReportSections(
    metricsData: Record<string, AnalyticsMetric[]>,
    trends: Record<string, TrendAnalysis>,
    insights: BusinessInsight[]
  ): AnalyticsReportSection[] {
    const sections: AnalyticsReportSection[] = [];

    // Executive Summary
    sections.push({
      title: 'Executive Summary',
      type: 'text',
      content: {
        summary: `Analysis of ${Object.keys(metricsData).length} metrics reveals ${insights.length} actionable insights.`,
        keyFindings: insights.slice(0, 3).map(i => i.title)
      }
    });

    // Metrics Overview
    sections.push({
      title: 'Metrics Overview',
      type: 'table',
      content: {
        headers: ['Metric', 'Trend', 'Change %', 'Data Points'],
        rows: Object.entries(trends).map(([metricId, trend]) => [
          metricId,
          trend.trend,
          `${trend.changePercentage.toFixed(1)}%`,
          trend.dataPoints.length.toString()
        ])
      }
    });

    // Critical Insights
    const criticalInsights = insights.filter(i => i.priority === 'critical' || i.priority === 'high');
    if (criticalInsights.length > 0) {
      sections.push({
        title: 'Critical Insights',
        type: 'text',
        content: {
          insights: criticalInsights.map(i => ({
            title: i.title,
            description: i.description,
            recommendations: i.recommendations
          }))
        }
      });
    }

    return sections;
  }

  // ================== PUBLIC API ==================

  /**
   * Get processing status
   */
  getStatus(): {
    isProcessing: boolean;
    lastProcessingTime?: Date;
    metricsCount: number;
    trendsCount: number;
    anomaliesCount: number;
    insightsCount: number;
  } {
    const status: {
      isProcessing: boolean;
      lastProcessingTime?: Date;
      metricsCount: number;
      trendsCount: number;
      anomaliesCount: number;
      insightsCount: number;
    } = {
      isProcessing: this.isProcessing,
      metricsCount: this.metrics.size,
      trendsCount: this.trends.size,
      anomaliesCount: Array.from(this.anomalies.values()).flat().length,
      insightsCount: this.insights.size
    };

    if (this.lastProcessingTime !== undefined) {
      status.lastProcessingTime = this.lastProcessingTime;
    }

    return status;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update analyzer configurations
    this.trendAnalyzer = new TrendAnalyzer(this.config);
    this.anomalyDetector = new AnomalyDetector(this.config);
  }

  /**
   * Clear all data (useful for testing)
   */
  clearAllData(): void {
    this.metrics.clear();
    this.trends.clear();
    this.anomalies.clear();
    this.insights.clear();
    this.reports.clear();
  }
}

export default AnalyticsEngine;

// Re-export types for convenience
export * from './types';
export { TrendAnalyzer } from './trend-analyzer';
export { AnomalyDetector } from './anomaly-detector';
export { InsightsGenerator } from './insights-generator';
