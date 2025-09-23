/**
 * Trend Analysis Module
 * Handles trend analysis calculations and forecasting
 */

import { AnalyticsMetric, TrendAnalysis, PredictiveModel, AnalyticsConfig } from './types';

export class TrendAnalyzer {
  private config: AnalyticsConfig;
  private predictiveModels = new Map<string, PredictiveModel>();

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.initializePredictiveModels();
  }

  /**
   * Perform trend analysis on metric
   */
  async analyzeTrend(
    metricId: string,
    metrics: AnalyticsMetric[],
    timeframe: TrendAnalysis['timeframe'] = 'daily',
    enableForecast = false
  ): Promise<TrendAnalysis> {
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

    let forecast: Array<{ timestamp: Date; predictedValue: number; confidence: number }> | undefined = undefined;
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

    return trendAnalysis;
  }

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
}
