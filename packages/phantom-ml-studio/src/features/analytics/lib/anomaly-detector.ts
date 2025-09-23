/**
 * Anomaly Detection Module
 * Handles statistical anomaly detection in time series data
 */

import { AnalyticsMetric, AnomalyDetection, AnalyticsConfig } from './types';

export class AnomalyDetector {
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  /**
   * Detect anomalies in metric data
   */
  async detectAnomalies(metricId: string, metrics: AnalyticsMetric[]): Promise<AnomalyDetection[]> {
    if (!this.config.enableAnomalyDetection) {
      return [];
    }

    if (metrics.length < 10) {
      return []; // Need sufficient data for anomaly detection
    }

    const sortedMetrics = metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const values = sortedMetrics.map(m => m.value);
    
    const anomalies: AnomalyDetection[] = [];
    const { mean, standardDeviation } = this.calculateStatistics(values);

    for (let i = 0; i < sortedMetrics.length; i++) {
      const metric = sortedMetrics[i];
      if (!metric) continue;
      
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
          context: metric.metadata || undefined
        };

        anomalies.push(anomaly);
      }
    }

    return anomalies;
  }

  /**
   * Detect real-time anomaly for a single metric point
   */
  async detectRealTimeAnomaly(
    metricId: string,
    currentMetric: AnalyticsMetric,
    historicalMetrics: AnalyticsMetric[]
  ): Promise<AnomalyDetection | null> {
    if (!this.config.enableAnomalyDetection || historicalMetrics.length < 10) {
      return null;
    }

    const values = historicalMetrics.map(m => m.value);
    const { mean, standardDeviation } = this.calculateStatistics(values);

    const zScore = Math.abs((currentMetric.value - mean) / standardDeviation);

    if (zScore > this.config.anomalyThreshold) {
      return {
        metricId,
        timestamp: currentMetric.timestamp,
        value: currentMetric.value,
        expectedValue: mean,
        deviation: zScore,
        severity: this.calculateAnomalySeverity(zScore),
        probability: Math.min(zScore / this.config.anomalyThreshold, 1),
        context: currentMetric.metadata
      };
    }

    return null;
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
