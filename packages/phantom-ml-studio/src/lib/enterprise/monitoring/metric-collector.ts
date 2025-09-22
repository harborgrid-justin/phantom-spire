/**
 * Enterprise Metric Collector
 * Handles collection, sampling, and storage of performance metrics
 */

import { EventEmitter } from 'events';
import {
  MonitoringConfiguration,
  PerformanceMetric,
  MetricCollectionEvent,
  SamplingStrategy
} from './monitoring.types';
import {
  applyUniformSampling,
  applyAdaptiveSampling,
  applyPrioritySampling,
  validateMetric,
  generateMetricKey
} from './monitoring.utils';
import { enterpriseStateManager } from '../state/enterprise-state-manager.service';
import { persistenceService } from '../../persistence/enterprise-persistence.service';

export class MetricCollector extends EventEmitter {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private config: MonitoringConfiguration;
  private collectionInterval?: NodeJS.Timeout;
  private isCollecting = false;

  constructor(config: MonitoringConfiguration) {
    super();
    this.config = config;
  }

  // ==================== LIFECYCLE METHODS ====================

  start(): void {
    if (this.isCollecting) {
      return;
    }

    this.isCollecting = true;
    this.collectionInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.collection.interval);

    this.emit('collection_started', { timestamp: new Date() });
  }

  stop(): void {
    if (!this.isCollecting) {
      return;
    }

    this.isCollecting = false;
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = undefined;
    }

    this.emit('collection_stopped', { timestamp: new Date() });
  }

  // ==================== COLLECTION METHODS ====================

  private async collectMetrics(): Promise<void> {
    try {
      const timestamp = new Date();

      // Collect system metrics
      const systemMetrics = await this.collectSystemMetrics(timestamp);

      // Collect model metrics
      const modelMetrics = await this.collectModelMetrics(timestamp);

      // Collect business metrics
      const businessMetrics = await this.collectBusinessMetrics(timestamp);

      // Store all metrics
      const allMetrics = [...systemMetrics, ...modelMetrics, ...businessMetrics];
      this.storeMetrics(allMetrics);

      // Apply sampling if configured
      const sampledMetrics = this.applySampling(allMetrics);

      // Emit metrics for processing
      this.emit('metrics_collected', {
        count: sampledMetrics.length,
        timestamp,
        metrics: sampledMetrics
      } as MetricCollectionEvent);

      // Persist metrics in batches
      if (sampledMetrics.length >= this.config.collection.batchSize) {
        await this.persistMetrics(sampledMetrics);
      }

    } catch (error) {
      this.emit('collection_error', { error, timestamp: new Date() });
    }
  }

  private async collectSystemMetrics(timestamp: Date): Promise<PerformanceMetric[]> {
    const systemState = enterpriseStateManager.getSystemState();
    if (!systemState) {
      return [];
    }

    const metrics: PerformanceMetric[] = [];

    // CPU metrics
    metrics.push({
      name: 'system.cpu.utilization',
      value: systemState.resources.cpu.utilization,
      unit: 'percent',
      timestamp,
      source: 'system',
      tags: { component: 'cpu' }
    });

    // Memory metrics
    metrics.push({
      name: 'system.memory.utilization',
      value: systemState.resources.memory.utilization,
      unit: 'percent',
      timestamp,
      source: 'system',
      tags: { component: 'memory' }
    });

    metrics.push({
      name: 'system.memory.used',
      value: systemState.resources.memory.current,
      unit: 'mb',
      timestamp,
      source: 'system',
      tags: { component: 'memory' }
    });

    // Disk metrics
    metrics.push({
      name: 'system.disk.utilization',
      value: systemState.resources.disk.utilization,
      unit: 'percent',
      timestamp,
      source: 'system',
      tags: { component: 'disk' }
    });

    // Network metrics
    metrics.push({
      name: 'system.network.utilization',
      value: systemState.resources.network.utilization,
      unit: 'percent',
      timestamp,
      source: 'system',
      tags: { component: 'network' }
    });

    // Uptime
    metrics.push({
      name: 'system.uptime',
      value: systemState.uptime,
      unit: 'ms',
      timestamp,
      source: 'system',
      tags: { component: 'system' }
    });

    return metrics.filter(validateMetric);
  }

  private async collectModelMetrics(timestamp: Date): Promise<PerformanceMetric[]> {
    const models = enterpriseStateManager.getAllModels();
    const metrics: PerformanceMetric[] = [];

    models.forEach(model => {
      // Model performance metrics
      metrics.push({
        name: 'model.accuracy',
        value: model.performance.accuracy,
        unit: 'ratio',
        timestamp,
        source: 'model',
        tags: { model_id: model.id, model_name: model.name }
      });

      metrics.push({
        name: 'model.inference_time',
        value: model.performance.inferenceTime,
        unit: 'ms',
        timestamp,
        source: 'model',
        tags: { model_id: model.id, model_name: model.name }
      });

      metrics.push({
        name: 'model.predictions_total',
        value: model.monitoring.predictions,
        unit: 'count',
        timestamp,
        source: 'model',
        tags: { model_id: model.id, model_name: model.name }
      });

      metrics.push({
        name: 'model.errors_total',
        value: model.monitoring.errors,
        unit: 'count',
        timestamp,
        source: 'model',
        tags: { model_id: model.id, model_name: model.name }
      });
    });

    return metrics.filter(validateMetric);
  }

  private async collectBusinessMetrics(timestamp: Date): Promise<PerformanceMetric[]> {
    const statistics = enterpriseStateManager.getStatistics();
    const metrics: PerformanceMetric[] = [];

    // Business KPIs
    metrics.push({
      name: 'business.total_models',
      value: statistics.totalModels,
      unit: 'count',
      timestamp,
      source: 'business',
      tags: { type: 'kpi' }
    });

    metrics.push({
      name: 'business.active_experiments',
      value: statistics.activeExperiments,
      unit: 'count',
      timestamp,
      source: 'business',
      tags: { type: 'kpi' }
    });

    metrics.push({
      name: 'business.active_deployments',
      value: statistics.activeDeployments,
      unit: 'count',
      timestamp,
      source: 'business',
      tags: { type: 'kpi' }
    });

    return metrics.filter(validateMetric);
  }

  // ==================== STORAGE METHODS ====================

  private storeMetrics(metrics: PerformanceMetric[]): void {
    metrics.forEach(metric => {
      if (!this.metrics.has(metric.name)) {
        this.metrics.set(metric.name, []);
      }

      const metricHistory = this.metrics.get(metric.name)!;
      metricHistory.push(metric);

      // Keep only recent metrics in memory
      const cutoff = Date.now() - (this.config.retention.raw * 60 * 60 * 1000);
      this.metrics.set(
        metric.name,
        metricHistory.filter(m => m.timestamp.getTime() > cutoff)
      );
    });
  }

  private async persistMetrics(metrics: PerformanceMetric[]): Promise<void> {
    try {
      for (const metric of metrics) {
        await persistenceService.saveMetrics({
          id: generateMetricKey(metric),
          timestamp: metric.timestamp,
          type: 'system',
          metrics: { [metric.name]: metric.value },
          dimensions: {
            source: metric.source,
            unit: metric.unit,
            ...metric.tags
          },
          aggregationLevel: 'raw'
        });
      }
    } catch (error) {
      this.emit('persistence_error', { error, count: metrics.length });
    }
  }

  // ==================== SAMPLING METHODS ====================

  private applySampling(metrics: PerformanceMetric[]): PerformanceMetric[] {
    if (!this.config.collection.sampling.enabled) {
      return metrics;
    }

    const sampleRate = this.config.collection.sampling.rate;
    const strategy = this.config.collection.sampling.strategy;

    switch (strategy) {
      case 'uniform':
        return applyUniformSampling(metrics, sampleRate);

      case 'adaptive':
        return applyAdaptiveSampling(metrics, sampleRate);

      case 'priority':
        return applyPrioritySampling(metrics, sampleRate);

      default:
        return metrics;
    }
  }

  // ==================== PUBLIC API METHODS ====================

  /**
   * Get metric history for a specific metric
   */
  getMetricHistory(metricName: string, timeRange?: { start: Date; end: Date }): PerformanceMetric[] {
    const history = this.metrics.get(metricName) || [];

    if (!timeRange) {
      return [...history];
    }

    return history.filter(metric =>
      metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
    );
  }

  /**
   * Get all available metric names
   */
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Get current value for a specific metric
   */
  getCurrentValue(metricName: string): PerformanceMetric | undefined {
    const history = this.metrics.get(metricName);
    return history ? history[history.length - 1] : undefined;
  }

  /**
   * Get all current metric values
   */
  getCurrentValues(): Record<string, PerformanceMetric> {
    const current: Record<string, PerformanceMetric> = {};
    this.metrics.forEach((history, name) => {
      if (history.length > 0) {
        current[name] = history[history.length - 1];
      }
    });
    return current;
  }

  /**
   * Manually add a metric (for external metrics)
   */
  addMetric(metric: PerformanceMetric): void {
    if (!validateMetric(metric)) {
      throw new Error('Invalid metric data');
    }

    this.storeMetrics([metric]);
    this.emit('metric_added', { metric, timestamp: new Date() });
  }

  /**
   * Get collection statistics
   */
  getCollectionStats(): {
    isCollecting: boolean;
    totalMetricTypes: number;
    totalDataPoints: number;
    memoryUsage: number;
    oldestDataPoint?: Date;
    newestDataPoint?: Date;
  } {
    let totalDataPoints = 0;
    let oldestDataPoint: Date | undefined;
    let newestDataPoint: Date | undefined;

    this.metrics.forEach(history => {
      totalDataPoints += history.length;
      if (history.length > 0) {
        const oldest = history[0].timestamp;
        const newest = history[history.length - 1].timestamp;

        if (!oldestDataPoint || oldest < oldestDataPoint) {
          oldestDataPoint = oldest;
        }
        if (!newestDataPoint || newest > newestDataPoint) {
          newestDataPoint = newest;
        }
      }
    });

    return {
      isCollecting: this.isCollecting,
      totalMetricTypes: this.metrics.size,
      totalDataPoints,
      memoryUsage: this.estimateMemoryUsage(),
      oldestDataPoint,
      newestDataPoint
    };
  }

  /**
   * Clear old metrics from memory
   */
  clearOldMetrics(olderThan: Date): number {
    let cleared = 0;

    this.metrics.forEach((history, name) => {
      const filtered = history.filter(metric => metric.timestamp >= olderThan);
      cleared += history.length - filtered.length;
      this.metrics.set(name, filtered);
    });

    this.emit('metrics_cleared', { count: cleared, timestamp: new Date() });
    return cleared;
  }

  /**
   * Update collection configuration
   */
  updateConfiguration(config: Partial<MonitoringConfiguration>): void {
    Object.assign(this.config, config);
    this.emit('configuration_updated', { config: this.config });
  }

  // ==================== PRIVATE UTILITY METHODS ====================

  private estimateMemoryUsage(): number {
    let size = 0;
    this.metrics.forEach(history => {
      // Rough estimation: each metric ~200 bytes
      size += history.length * 200;
    });
    return size;
  }
}