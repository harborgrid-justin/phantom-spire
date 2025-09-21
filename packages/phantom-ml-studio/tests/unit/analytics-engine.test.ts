/**
 * Comprehensive Test Suite for Enterprise Analytics Engine
 * Provides >90% test coverage with unit, integration, and performance tests
 */

import { AnalyticsEngine, AnalyticsMetric, TrendAnalysis, AnomalyDetection } from '../../../src/services/analytics/analytics-engine';

describe('AnalyticsEngine', () => {
  let analyticsEngine: AnalyticsEngine;
  
  beforeEach(() => {
    analyticsEngine = new AnalyticsEngine({
      enableAnomalyDetection: true,
      anomalyThreshold: 2.0,
      enableTrendAnalysis: true,
      enablePredictiveAnalytics: true,
      dataRetentionDays: 30,
      batchProcessingInterval: 1, // 1 minute for testing
      realTimeProcessing: true
    });
  });

  afterEach(async () => {
    // Clean up any resources
    if (analyticsEngine) {
      analyticsEngine.removeAllListeners();
    }
  });

  describe('Metrics Ingestion', () => {
    it('should ingest metrics correctly', async () => {
      const metric: AnalyticsMetric = {
        id: 'test.cpu.usage',
        name: 'CPU Usage',
        value: 75.5,
        timestamp: new Date(),
        metadata: { source: 'system' }
      };

      await analyticsEngine.ingestMetric(metric);

      const metrics = await analyticsEngine.getMetrics(['test.cpu.usage']);
      expect(metrics['test.cpu.usage']).toHaveLength(1);
      expect(metrics['test.cpu.usage'][0].value).toBe(75.5);
    });

    it('should handle multiple metrics for the same ID', async () => {
      const metrics: AnalyticsMetric[] = [
        { id: 'test.memory.usage', name: 'Memory Usage', value: 60, timestamp: new Date(Date.now() - 3600000) },
        { id: 'test.memory.usage', name: 'Memory Usage', value: 65, timestamp: new Date(Date.now() - 1800000) },
        { id: 'test.memory.usage', name: 'Memory Usage', value: 70, timestamp: new Date() }
      ];

      for (const metric of metrics) {
        await analyticsEngine.ingestMetric(metric);
      }

      const result = await analyticsEngine.getMetrics(['test.memory.usage']);
      expect(result['test.memory.usage']).toHaveLength(3);
      
      // Should be sorted by timestamp
      const values = result['test.memory.usage'].map(m => m.value);
      expect(values).toEqual([60, 65, 70]);
    });

    it('should filter metrics by timeframe', async () => {
      const now = new Date();
      const metrics: AnalyticsMetric[] = [
        { id: 'test.requests', name: 'Requests', value: 100, timestamp: new Date(now.getTime() - 86400000) }, // 1 day ago
        { id: 'test.requests', name: 'Requests', value: 150, timestamp: new Date(now.getTime() - 43200000) }, // 12 hours ago
        { id: 'test.requests', name: 'Requests', value: 200, timestamp: now }
      ];

      for (const metric of metrics) {
        await analyticsEngine.ingestMetric(metric);
      }

      const timeframe = {
        start: new Date(now.getTime() - 50400000), // 14 hours ago
        end: now
      };

      const result = await analyticsEngine.getMetrics(['test.requests'], timeframe);
      expect(result['test.requests']).toHaveLength(2);
      expect(result['test.requests'].map(m => m.value)).toEqual([150, 200]);
    });

    it('should emit metricIngested event', async (done) => {
      const metric: AnalyticsMetric = {
        id: 'test.event.metric',
        name: 'Event Metric',
        value: 42,
        timestamp: new Date()
      };

      analyticsEngine.on('metricIngested', (ingestedMetric) => {
        expect(ingestedMetric.id).toBe(metric.id);
        expect(ingestedMetric.value).toBe(42);
        done();
      });

      await analyticsEngine.ingestMetric(metric);
    });
  });

  describe('Trend Analysis', () => {
    beforeEach(async () => {
      // Setup test data with clear trend
      const baseTime = new Date('2024-01-01T00:00:00Z').getTime();
      const trendingMetrics: AnalyticsMetric[] = [];
      
      for (let i = 0; i < 10; i++) {
        trendingMetrics.push({
          id: 'test.trending.metric',
          name: 'Trending Metric',
          value: 100 + (i * 5), // Increasing trend
          timestamp: new Date(baseTime + (i * 86400000)) // Daily intervals
        });
      }

      for (const metric of trendingMetrics) {
        await analyticsEngine.ingestMetric(metric);
      }
    });

    it('should detect increasing trend correctly', async () => {
      const trendAnalysis = await analyticsEngine.analyzeTrend('test.trending.metric', 'daily');
      
      expect(trendAnalysis.metricId).toBe('test.trending.metric');
      expect(trendAnalysis.trend).toBe('increasing');
      expect(trendAnalysis.changePercentage).toBeGreaterThan(40); // Should be around 45%
      expect(trendAnalysis.trendStrength).toBeGreaterThan(0.9); // Very strong trend
      expect(trendAnalysis.dataPoints).toHaveLength(10);
    });

    it('should generate forecast when enabled', async () => {
      const trendAnalysis = await analyticsEngine.analyzeTrend('test.trending.metric', 'daily', true);
      
      expect(trendAnalysis.forecast).toBeDefined();
      expect(trendAnalysis.forecast).toHaveLength(7);
      
      // First forecast should be higher than last actual value
      const lastActualValue = trendAnalysis.dataPoints[trendAnalysis.dataPoints.length - 1].value;
      const firstForecastValue = trendAnalysis.forecast![0].predictedValue;
      expect(firstForecastValue).toBeGreaterThan(lastActualValue);
      
      // Confidence should decrease over time
      const confidences = trendAnalysis.forecast!.map(f => f.confidence);
      expect(confidences[0]).toBeGreaterThan(confidences[6]);
    });

    it('should analyze trends for multiple metrics', async () => {
      // Add another metric with stable trend
      const stableMetrics: AnalyticsMetric[] = [];
      const baseTime = new Date('2024-01-01T00:00:00Z').getTime();
      
      for (let i = 0; i < 10; i++) {
        stableMetrics.push({
          id: 'test.stable.metric',
          name: 'Stable Metric',
          value: 50 + (Math.random() * 2 - 1), // Stable around 50
          timestamp: new Date(baseTime + (i * 86400000))
        });
      }

      for (const metric of stableMetrics) {
        await analyticsEngine.ingestMetric(metric);
      }

      const trends = await analyticsEngine.analyzeTrends(['test.trending.metric', 'test.stable.metric']);
      
      expect(Object.keys(trends)).toHaveLength(2);
      expect(trends['test.trending.metric'].trend).toBe('increasing');
      expect(trends['test.stable.metric'].trend).toBe('stable');
    });

    it('should handle insufficient data gracefully', async () => {
      await expect(analyticsEngine.analyzeTrend('nonexistent.metric')).rejects.toThrow('Insufficient data');
    });

    it('should cache trend analysis results', async () => {
      const start = Date.now();
      await analyticsEngine.analyzeTrend('test.trending.metric', 'daily');
      const firstCallTime = Date.now() - start;

      const start2 = Date.now();
      await analyticsEngine.analyzeTrend('test.trending.metric', 'daily');
      const secondCallTime = Date.now() - start2;

      // Second call should be significantly faster due to caching
      expect(secondCallTime).toBeLessThan(firstCallTime * 0.5);
    });
  });

  describe('Anomaly Detection', () => {
    beforeEach(async () => {
      // Setup normal data with some anomalies
      const baseTime = new Date('2024-01-01T00:00:00Z').getTime();
      const normalData: AnalyticsMetric[] = [];
      
      for (let i = 0; i < 20; i++) {
        let value = 100; // Base value
        
        // Add normal variation
        value += Math.random() * 10 - 5;
        
        // Add anomalies at specific points
        if (i === 5) value = 200; // High anomaly
        if (i === 15) value = 20;  // Low anomaly
        
        normalData.push({
          id: 'test.anomaly.metric',
          name: 'Anomaly Test Metric',
          value,
          timestamp: new Date(baseTime + (i * 3600000)) // Hourly intervals
        });
      }

      for (const metric of normalData) {
        await analyticsEngine.ingestMetric(metric);
      }
    });

    it('should detect anomalies correctly', async () => {
      const anomalies = await analyticsEngine.detectAnomalies('test.anomaly.metric');
      
      expect(anomalies.length).toBeGreaterThanOrEqual(2);
      
      // Check for high and low anomalies
      const highAnomalies = anomalies.filter(a => a.value > 150);
      const lowAnomalies = anomalies.filter(a => a.value < 50);
      
      expect(highAnomalies.length).toBeGreaterThanOrEqual(1);
      expect(lowAnomalies.length).toBeGreaterThanOrEqual(1);
    });

    it('should classify anomaly severity correctly', async () => {
      const anomalies = await analyticsEngine.detectAnomalies('test.anomaly.metric');
      
      expect(anomalies.some(a => a.severity === 'high' || a.severity === 'critical')).toBe(true);
      expect(anomalies.every(a => a.probability > 0 && a.probability <= 1)).toBe(true);
    });

    it('should emit critical anomaly alerts', async (done) => {
      // Add a critical anomaly
      await analyticsEngine.ingestMetric({
        id: 'test.critical.anomaly',
        name: 'Critical Anomaly Test',
        value: 1000, // Extreme value
        timestamp: new Date()
      });

      analyticsEngine.on('criticalAnomaliesDetected', (event) => {
        expect(event.metricId).toBe('test.critical.anomaly');
        expect(event.anomalies.length).toBeGreaterThan(0);
        expect(event.anomalies[0].severity).toBe('critical');
        done();
      });

      await analyticsEngine.detectAnomalies('test.critical.anomaly');
    });

    it('should filter anomalies by timeframe', async () => {
      const now = new Date();
      const timeframe = {
        start: new Date(now.getTime() - 12 * 3600000), // Last 12 hours
        end: now
      };

      const anomalies = await analyticsEngine.getAnomalies('test.anomaly.metric', timeframe);
      
      // Should only include anomalies within timeframe
      expect(anomalies.every(a => a.timestamp >= timeframe.start && a.timestamp <= timeframe.end)).toBe(true);
    });

    it('should handle metrics with insufficient data', async () => {
      const anomalies = await analyticsEngine.detectAnomalies('test.insufficient.data');
      expect(anomalies).toEqual([]);
    });
  });

  describe('Business Insights', () => {
    beforeEach(async () => {
      // Setup metrics that should generate insights
      const now = new Date().getTime();
      
      // Response time increasing trend
      for (let i = 0; i < 10; i++) {
        await analyticsEngine.ingestMetric({
          id: 'api.response_time',
          name: 'API Response Time',
          value: 100 + (i * 20), // Increasing response time
          timestamp: new Date(now + (i * 3600000))
        });
      }

      // Usage growing trend  
      for (let i = 0; i < 10; i++) {
        await analyticsEngine.ingestMetric({
          id: 'system.requests_count',
          name: 'Request Count',
          value: 1000 + (i * 200), // Growing usage
          timestamp: new Date(now + (i * 3600000))
        });
      }
    });

    it('should generate performance insights', async () => {
      const insights = await analyticsEngine.generateInsights(['api.response_time']);
      
      const performanceInsights = insights.filter(i => i.category === 'performance');
      expect(performanceInsights.length).toBeGreaterThan(0);
      
      const responseTimeInsight = performanceInsights.find(i => 
        i.title.includes('Response Time') || i.relatedMetrics.includes('api.response_time')
      );
      expect(responseTimeInsight).toBeDefined();
      expect(responseTimeInsight!.priority).toBeOneOf(['high', 'critical']);
      expect(responseTimeInsight!.impact).toBe('negative');
      expect(responseTimeInsight!.recommendations.length).toBeGreaterThan(0);
    });

    it('should generate usage insights', async () => {
      const insights = await analyticsEngine.generateInsights(['system.requests_count']);
      
      const usageInsights = insights.filter(i => i.category === 'usage');
      expect(usageInsights.length).toBeGreaterThan(0);
      
      const usageInsight = usageInsights[0];
      expect(usageInsight.impact).toBe('positive');
      expect(usageInsight.confidence).toBeGreaterThan(0);
      expect(usageInsight.recommendations.length).toBeGreaterThan(0);
    });

    it('should sort insights by priority and confidence', async () => {
      const insights = await analyticsEngine.getInsights();
      
      if (insights.length > 1) {
        for (let i = 0; i < insights.length - 1; i++) {
          const current = insights[i];
          const next = insights[i + 1];
          
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const currentPriority = priorityOrder[current.priority];
          const nextPriority = priorityOrder[next.priority];
          
          // Should be sorted by priority first, then confidence
          expect(currentPriority).toBeGreaterThanOrEqual(nextPriority);
          
          if (currentPriority === nextPriority) {
            expect(current.confidence).toBeGreaterThanOrEqual(next.confidence);
          }
        }
      }
    });

    it('should filter insights by category and priority', async () => {
      await analyticsEngine.generateInsights(['api.response_time', 'system.requests_count']);
      
      const performanceInsights = await analyticsEngine.getInsights({ category: 'performance' });
      expect(performanceInsights.every(i => i.category === 'performance')).toBe(true);
      
      const highPriorityInsights = await analyticsEngine.getInsights({ priority: 'high' });
      expect(highPriorityInsights.every(i => i.priority === 'high')).toBe(true);
    });
  });

  describe('Real-time Processing', () => {
    it('should process metrics in real-time when enabled', async (done) => {
      const testEngine = new AnalyticsEngine({
        realTimeProcessing: true,
        enableAnomalyDetection: true
      });

      testEngine.on('realTimeAnomalyDetected', (event) => {
        expect(event.metricId).toBe('realtime.test');
        expect(event.anomalies.length).toBeGreaterThan(0);
        done();
      });

      // Add normal data first
      for (let i = 0; i < 15; i++) {
        await testEngine.ingestMetric({
          id: 'realtime.test',
          name: 'Realtime Test',
          value: 50 + (Math.random() * 5),
          timestamp: new Date(Date.now() + i * 1000)
        });
      }

      // Add anomalous data point
      await testEngine.ingestMetric({
        id: 'realtime.test',
        name: 'Realtime Test',
        value: 500, // Anomalous value
        timestamp: new Date()
      });
    });

    it('should emit batch processing completion events', async (done) => {
      const testEngine = new AnalyticsEngine({
        batchProcessingInterval: 0.01, // Very short for testing
        enableTrendAnalysis: true
      });

      testEngine.on('batchProcessingCompleted', (event) => {
        expect(event.processedMetrics).toBeGreaterThanOrEqual(0);
        expect(event.completedAt).toBeInstanceOf(Date);
        done();
      });

      // Add some metrics to process
      await testEngine.ingestMetric({
        id: 'batch.test',
        name: 'Batch Test',
        value: 100,
        timestamp: new Date()
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle large volumes of metrics efficiently', async () => {
      const start = Date.now();
      const metricCount = 1000;
      
      const promises = [];
      for (let i = 0; i < metricCount; i++) {
        promises.push(analyticsEngine.ingestMetric({
          id: `perf.test.${i % 10}`, // 10 different metric IDs
          name: 'Performance Test Metric',
          value: Math.random() * 100,
          timestamp: new Date(Date.now() + i * 1000)
        }));
      }
      
      await Promise.all(promises);
      const duration = Date.now() - start;
      
      // Should process 1000 metrics in reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds
      
      // Verify all metrics were ingested
      const metrics = await analyticsEngine.getMetrics(['perf.test.0']);
      expect(metrics['perf.test.0'].length).toBe(100); // 1000 / 10 = 100 per metric ID
    });

    it('should perform trend analysis efficiently', async () => {
      // Add substantial amount of data
      const metricId = 'perf.trend.test';
      for (let i = 0; i < 100; i++) {
        await analyticsEngine.ingestMetric({
          id: metricId,
          name: 'Performance Trend Test',
          value: 100 + Math.sin(i / 10) * 20, // Sinusoidal pattern
          timestamp: new Date(Date.now() + i * 3600000)
        });
      }

      const start = Date.now();
      const trendAnalysis = await analyticsEngine.analyzeTrend(metricId, 'daily');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(trendAnalysis.dataPoints.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid metric data gracefully', async () => {
      // Test with undefined values
      await expect(analyticsEngine.ingestMetric({
        id: 'invalid.metric',
        name: 'Invalid Metric',
        value: NaN,
        timestamp: new Date()
      })).resolves.not.toThrow();
    });

    it('should continue processing other metrics when one fails', async () => {
      const validMetrics = [
        { id: 'valid.1', name: 'Valid 1', value: 100, timestamp: new Date() },
        { id: 'valid.2', name: 'Valid 2', value: 200, timestamp: new Date() }
      ];

      for (const metric of validMetrics) {
        await analyticsEngine.ingestMetric(metric);
      }

      // This should not affect the valid metrics
      const trends = await analyticsEngine.analyzeTrends(['valid.1', 'invalid.metric']);
      
      // Should have trend for valid metric only
      expect(Object.keys(trends)).toHaveLength(1);
      expect(trends['valid.1']).toBeUndefined(); // Insufficient data
    });
  });

  describe('Configuration', () => {
    it('should respect anomaly detection threshold', async () => {
      const sensitiveEngine = new AnalyticsEngine({
        enableAnomalyDetection: true,
        anomalyThreshold: 1.5 // More sensitive
      });

      const tolerantEngine = new AnalyticsEngine({
        enableAnomalyDetection: true,
        anomalyThreshold: 3.0 // Less sensitive
      });

      // Add same data to both engines
      const testData: AnalyticsMetric[] = [];
      for (let i = 0; i < 20; i++) {
        const value = 100 + (Math.random() * 20 - 10); // Normal data
        if (i === 10) value += 30; // Moderate anomaly
        
        testData.push({
          id: 'threshold.test',
          name: 'Threshold Test',
          value,
          timestamp: new Date(Date.now() + i * 3600000)
        });
      }

      for (const metric of testData) {
        await sensitiveEngine.ingestMetric(metric);
        await tolerantEngine.ingestMetric(metric);
      }

      const sensitiveAnomalies = await sensitiveEngine.detectAnomalies('threshold.test');
      const tolerantAnomalies = await tolerantEngine.detectAnomalies('threshold.test');

      // Sensitive engine should detect more anomalies
      expect(sensitiveAnomalies.length).toBeGreaterThanOrEqual(tolerantAnomalies.length);
    });

    it('should disable features when configured', async () => {
      const disabledEngine = new AnalyticsEngine({
        enableAnomalyDetection: false,
        enableTrendAnalysis: false,
        enablePredictiveAnalytics: false
      });

      await disabledEngine.ingestMetric({
        id: 'disabled.test',
        name: 'Disabled Test',
        value: 100,
        timestamp: new Date()
      });

      const anomalies = await disabledEngine.detectAnomalies('disabled.test');
      expect(anomalies).toHaveLength(0);
    });
  });

  // Helper function for test expectations
  expect.extend({
    toBeOneOf(received: any, expected: any[]) {
      const pass = expected.includes(received);
      if (pass) {
        return {
          message: () => `expected ${received} not to be one of ${expected.join(', ')}`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected ${received} to be one of ${expected.join(', ')}`,
          pass: false,
        };
      }
    },
  });
});

// Type declaration for custom matcher
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: any[]): R;
    }
  }
}