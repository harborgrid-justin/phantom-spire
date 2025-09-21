/**
 * Enterprise Monitoring and Metrics System
 * Comprehensive application monitoring with Prometheus-compatible metrics, alerting, and APM
 */

import type { LoggerService } from '../services/core/LoggerService';

// Metric types
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
}

// Metric labels
export interface MetricLabels {
  [key: string]: string | number;
}

// Metric data point
export interface MetricDataPoint {
  value: number;
  timestamp: Date;
  labels?: MetricLabels;
}

// Metric configuration
export interface MetricConfig {
  name: string;
  type: MetricType;
  description: string;
  unit?: string;
  labels?: string[];
  buckets?: number[]; // For histograms
  quantiles?: number[]; // For summaries
}

// Metric interface
export interface IMetric {
  readonly name: string;
  readonly type: MetricType;
  readonly description: string;
  
  increment(value?: number, labels?: MetricLabels): void;
  decrement(value?: number, labels?: MetricLabels): void;
  set(value: number, labels?: MetricLabels): void;
  observe(value: number, labels?: MetricLabels): void;
  
  getValue(labels?: MetricLabels): number;
  getAll(): MetricDataPoint[];
  reset(): void;
}

// Base metric class
abstract class BaseMetric implements IMetric {
  public readonly name: string;
  public readonly type: MetricType;
  public readonly description: string;
  public readonly unit?: string;
  public readonly labels: string[];

  protected dataPoints = new Map<string, MetricDataPoint>();

  constructor(config: MetricConfig) {
    this.name = config.name;
    this.type = config.type;
    this.description = config.description;
    this.unit = config.unit;
    this.labels = config.labels || [];
  }

  abstract increment(value?: number, labels?: MetricLabels): void;
  abstract decrement(value?: number, labels?: MetricLabels): void;
  abstract set(value: number, labels?: MetricLabels): void;
  abstract observe(value: number, labels?: MetricLabels): void;

  getValue(labels?: MetricLabels): number {
    const key = this.getLabelKey(labels);
    return this.dataPoints.get(key)?.value || 0;
  }

  getAll(): MetricDataPoint[] {
    return Array.from(this.dataPoints.values());
  }

  reset(): void {
    this.dataPoints.clear();
  }

  protected getLabelKey(labels?: MetricLabels): string {
    if (!labels || Object.keys(labels).length === 0) {
      return '';
    }
    
    const sortedLabels = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');
    
    return sortedLabels;
  }

  protected updateDataPoint(value: number, labels?: MetricLabels): void {
    const key = this.getLabelKey(labels);
    this.dataPoints.set(key, {
      value,
      timestamp: new Date(),
      labels,
    });
  }
}

// Counter metric implementation
export class Counter extends BaseMetric {
  constructor(config: MetricConfig) {
    super({ ...config, type: MetricType.COUNTER });
  }

  increment(value = 1, labels?: MetricLabels): void {
    if (value < 0) {
      throw new Error('Counter increment value must be non-negative');
    }
    
    const currentValue = this.getValue(labels);
    this.updateDataPoint(currentValue + value, labels);
  }

  decrement(_value?: number, _labels?: MetricLabels): void {
    throw new Error('Counter cannot be decremented');
  }

  set(value: number, labels?: MetricLabels): void {
    if (value < this.getValue(labels)) {
      throw new Error('Counter value can only increase');
    }
    
    this.updateDataPoint(value, labels);
  }

  observe(_value: number, _labels?: MetricLabels): void {
    throw new Error('Counter does not support observe operation');
  }
}

// Gauge metric implementation
export class Gauge extends BaseMetric {
  constructor(config: MetricConfig) {
    super({ ...config, type: MetricType.GAUGE });
  }

  increment(value = 1, labels?: MetricLabels): void {
    const currentValue = this.getValue(labels);
    this.updateDataPoint(currentValue + value, labels);
  }

  decrement(value = 1, labels?: MetricLabels): void {
    const currentValue = this.getValue(labels);
    this.updateDataPoint(currentValue - value, labels);
  }

  set(value: number, labels?: MetricLabels): void {
    this.updateDataPoint(value, labels);
  }

  observe(_value: number, _labels?: MetricLabels): void {
    throw new Error('Gauge does not support observe operation');
  }
}

// Histogram metric implementation
export class Histogram extends BaseMetric {
  private readonly buckets: number[];
  private readonly bucketCounts = new Map<string, number[]>();
  private readonly sums = new Map<string, number>();
  private readonly counts = new Map<string, number>();

  constructor(config: MetricConfig) {
    super({ ...config, type: MetricType.HISTOGRAM });
    this.buckets = config.buckets || [0.1, 0.5, 1, 2.5, 5, 10];
  }

  increment(_value?: number, _labels?: MetricLabels): void {
    throw new Error('Histogram does not support increment operation');
  }

  decrement(_value?: number, _labels?: MetricLabels): void {
    throw new Error('Histogram does not support decrement operation');
  }

  set(_value: number, _labels?: MetricLabels): void {
    throw new Error('Histogram does not support set operation');
  }

  observe(value: number, labels?: MetricLabels): void {
    const key = this.getLabelKey(labels);
    
    // Update bucket counts
    if (!this.bucketCounts.has(key)) {
      this.bucketCounts.set(key, new Array(this.buckets.length + 1).fill(0));
    }
    
    const bucketCounts = this.bucketCounts.get(key)!;
    
    // Find the appropriate bucket
    for (let i = 0; i < this.buckets.length; i++) {
      if (value <= this.buckets[i]) {
        bucketCounts[i]++;
        break;
      }
    }
    // +Inf bucket
    bucketCounts[bucketCounts.length - 1]++;
    
    // Update sum and count
    this.sums.set(key, (this.sums.get(key) || 0) + value);
    this.counts.set(key, (this.counts.get(key) || 0) + 1);
    
    this.updateDataPoint(value, labels);
  }

  getValue(labels?: MetricLabels): number {
    const key = this.getLabelKey(labels);
    const sum = this.sums.get(key) || 0;
    const count = this.counts.get(key) || 0;
    return count > 0 ? sum / count : 0; // Return average
  }

  getBucketCounts(labels?: MetricLabels): { bucket: string; count: number }[] {
    const key = this.getLabelKey(labels);
    const counts = this.bucketCounts.get(key) || [];
    
    return this.buckets.map((bucket, i) => ({
      bucket: bucket.toString(),
      count: counts[i] || 0,
    })).concat([{
      bucket: '+Inf',
      count: counts[counts.length - 1] || 0,
    }]);
  }

  getSum(labels?: MetricLabels): number {
    const key = this.getLabelKey(labels);
    return this.sums.get(key) || 0;
  }

  getCount(labels?: MetricLabels): number {
    const key = this.getLabelKey(labels);
    return this.counts.get(key) || 0;
  }
}

// Summary metric implementation
export class Summary extends BaseMetric {
  private readonly quantiles: number[];
  private readonly observations = new Map<string, number[]>();
  private readonly sums = new Map<string, number>();
  private readonly counts = new Map<string, number>();

  constructor(config: MetricConfig) {
    super({ ...config, type: MetricType.SUMMARY });
    this.quantiles = config.quantiles || [0.5, 0.9, 0.95, 0.99];
  }

  increment(_value?: number, _labels?: MetricLabels): void {
    throw new Error('Summary does not support increment operation');
  }

  decrement(_value?: number, _labels?: MetricLabels): void {
    throw new Error('Summary does not support decrement operation');
  }

  set(_value: number, _labels?: MetricLabels): void {
    throw new Error('Summary does not support set operation');
  }

  observe(value: number, labels?: MetricLabels): void {
    const key = this.getLabelKey(labels);
    
    // Store observation
    if (!this.observations.has(key)) {
      this.observations.set(key, []);
    }
    
    this.observations.get(key)!.push(value);
    
    // Update sum and count
    this.sums.set(key, (this.sums.get(key) || 0) + value);
    this.counts.set(key, (this.counts.get(key) || 0) + 1);
    
    this.updateDataPoint(value, labels);
  }

  getValue(labels?: MetricLabels): number {
    const key = this.getLabelKey(labels);
    const sum = this.sums.get(key) || 0;
    const count = this.counts.get(key) || 0;
    return count > 0 ? sum / count : 0; // Return average
  }

  getQuantiles(labels?: MetricLabels): { quantile: number; value: number }[] {
    const key = this.getLabelKey(labels);
    const observations = this.observations.get(key) || [];
    
    if (observations.length === 0) {
      return this.quantiles.map(q => ({ quantile: q, value: 0 }));
    }
    
    const sorted = [...observations].sort((a, b) => a - b);
    
    return this.quantiles.map(quantile => ({
      quantile,
      value: this.calculateQuantile(sorted, quantile),
    }));
  }

  getSum(labels?: MetricLabels): number {
    const key = this.getLabelKey(labels);
    return this.sums.get(key) || 0;
  }

  getCount(labels?: MetricLabels): number {
    const key = this.getLabelKey(labels);
    return this.counts.get(key) || 0;
  }

  private calculateQuantile(sortedValues: number[], quantile: number): number {
    if (quantile < 0 || quantile > 1) {
      throw new Error('Quantile must be between 0 and 1');
    }
    
    if (sortedValues.length === 0) return 0;
    if (quantile === 0) return sortedValues[0];
    if (quantile === 1) return sortedValues[sortedValues.length - 1];
    
    const index = quantile * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sortedValues[lower];
    }
    
    const weight = index - lower;
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }
}

// Alert rule configuration
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metricName: string;
  condition: {
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
    threshold: number;
    duration?: number; // milliseconds
  };
  labels?: MetricLabels;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  channels?: string[]; // Notification channels
}

// Alert instance
export interface AlertInstance {
  id: string;
  ruleId: string;
  ruleName: string;
  metricName: string;
  currentValue: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  state: 'pending' | 'firing' | 'resolved';
  firedAt?: Date;
  resolvedAt?: Date;
  labels?: MetricLabels;
  annotations?: Record<string, string>;
}

// Metrics registry and monitoring system
export class MetricsRegistry {
  private static instance: MetricsRegistry;
  
  private metrics = new Map<string, IMetric>();
  private alertRules = new Map<string, AlertRule>();
  private activeAlerts = new Map<string, AlertInstance>();
  private logger?: LoggerService;
  
  // Built-in system metrics
  private systemMetrics = {
    httpRequests: new Counter({
      name: 'http_requests_total',
      type: MetricType.COUNTER,
      description: 'Total number of HTTP requests',
      labels: ['method', 'path', 'status'],
    }),
    httpDuration: new Histogram({
      name: 'http_request_duration_seconds',
      type: MetricType.HISTOGRAM,
      description: 'HTTP request duration in seconds',
      labels: ['method', 'path', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    }),
    memoryUsage: new Gauge({
      name: 'memory_usage_bytes',
      type: MetricType.GAUGE,
      description: 'Memory usage in bytes',
      labels: ['type'],
    }),
    cpuUsage: new Gauge({
      name: 'cpu_usage_percent',
      type: MetricType.GAUGE,
      description: 'CPU usage percentage',
    }),
    activeConnections: new Gauge({
      name: 'active_connections',
      type: MetricType.GAUGE,
      description: 'Number of active connections',
      labels: ['type'],
    }),
    errorRate: new Gauge({
      name: 'error_rate',
      type: MetricType.GAUGE,
      description: 'Error rate percentage',
      labels: ['service', 'endpoint'],
    }),
  };

  private monitoringInterval?: NodeJS.Timeout;
  private alertInterval?: NodeJS.Timeout;

  private constructor(logger?: LoggerService) {
    this.logger = logger;
    
    // Register built-in metrics
    Object.values(this.systemMetrics).forEach(metric => {
      this.metrics.set(metric.name, metric);
    });
    
    this.startSystemMonitoring();
    this.startAlertMonitoring();
  }

  static getInstance(logger?: LoggerService): MetricsRegistry {
    if (!MetricsRegistry.instance) {
      MetricsRegistry.instance = new MetricsRegistry(logger);
    }
    return MetricsRegistry.instance;
  }

  // Register custom metric
  registerMetric(config: MetricConfig): IMetric {
    let metric: IMetric;

    switch (config.type) {
      case MetricType.COUNTER:
        metric = new Counter(config);
        break;
      case MetricType.GAUGE:
        metric = new Gauge(config);
        break;
      case MetricType.HISTOGRAM:
        metric = new Histogram(config);
        break;
      case MetricType.SUMMARY:
        metric = new Summary(config);
        break;
      default:
        throw new Error(`Unsupported metric type: ${config.type}`);
    }

    this.metrics.set(config.name, metric);
    this.logger?.info(`Metric registered: ${config.name} (${config.type})`);
    
    return metric;
  }

  // Get metric by name
  getMetric(name: string): IMetric | undefined {
    return this.metrics.get(name);
  }

  // Get all metrics
  getAllMetrics(): Map<string, IMetric> {
    return new Map(this.metrics);
  }

  // Register alert rule
  registerAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    this.logger?.info(`Alert rule registered: ${rule.name}`);
  }

  // Remove alert rule
  removeAlertRule(ruleId: string): boolean {
    const removed = this.alertRules.delete(ruleId);
    if (removed) {
      // Resolve any active alerts for this rule
      for (const [alertId, alert] of this.activeAlerts) {
        if (alert.ruleId === ruleId) {
          this.resolveAlert(alertId);
        }
      }
      this.logger?.info(`Alert rule removed: ${ruleId}`);
    }
    return removed;
  }

  // Get active alerts
  getActiveAlerts(): AlertInstance[] {
    return Array.from(this.activeAlerts.values());
  }

  // Get all alert rules
  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  // Record HTTP request metrics
  recordHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number
  ): void {
    const labels = {
      method,
      path,
      status: Math.floor(statusCode / 100) + 'xx',
    };

    this.systemMetrics.httpRequests.increment(1, labels);
    this.systemMetrics.httpDuration.observe(duration / 1000, labels);

    // Update error rate
    if (statusCode >= 400) {
      const errorLabels = { service: 'api', endpoint: path };
      this.systemMetrics.errorRate.increment(1, errorLabels);
    }
  }

  // Export metrics in Prometheus format
  exportPrometheusMetrics(): string {
    let output = '';

    for (const metric of this.metrics.values()) {
      // Add help and type comments
      output += `# HELP ${metric.name} ${metric.description}\n`;
      output += `# TYPE ${metric.name} ${metric.type}\n`;

      // Export metric data
      if (metric instanceof Histogram) {
        // Export histogram buckets and sum/count
        for (const dataPoint of metric.getAll()) {
          const labelStr = this.formatLabels(dataPoint.labels);
          const buckets = metric.getBucketCounts(dataPoint.labels);
          
          for (const bucket of buckets) {
            const bucketLabels = { ...dataPoint.labels, le: bucket.bucket };
            output += `${metric.name}_bucket${this.formatLabels(bucketLabels)} ${bucket.count}\n`;
          }
          
          output += `${metric.name}_sum${labelStr} ${metric.getSum(dataPoint.labels)}\n`;
          output += `${metric.name}_count${labelStr} ${metric.getCount(dataPoint.labels)}\n`;
        }
      } else if (metric instanceof Summary) {
        // Export summary quantiles and sum/count
        for (const dataPoint of metric.getAll()) {
          const labelStr = this.formatLabels(dataPoint.labels);
          const quantiles = metric.getQuantiles(dataPoint.labels);
          
          for (const quantile of quantiles) {
            const quantileLabels = { ...dataPoint.labels, quantile: quantile.quantile };
            output += `${metric.name}${this.formatLabels(quantileLabels)} ${quantile.value}\n`;
          }
          
          output += `${metric.name}_sum${labelStr} ${metric.getSum(dataPoint.labels)}\n`;
          output += `${metric.name}_count${labelStr} ${metric.getCount(dataPoint.labels)}\n`;
        }
      } else {
        // Export simple metrics
        for (const dataPoint of metric.getAll()) {
          const labelStr = this.formatLabels(dataPoint.labels);
          output += `${metric.name}${labelStr} ${dataPoint.value}\n`;
        }
      }

      output += '\n';
    }

    return output;
  }

  // Export metrics as JSON
  exportJsonMetrics(): Record<string, unknown> {
    const metrics: Record<string, unknown> = {};

    for (const [name, metric] of this.metrics) {
      const dataPoints = metric.getAll();
      
      if (metric instanceof Histogram) {
        metrics[name] = {
          type: metric.type,
          description: metric.description,
          data: dataPoints.map(dp => ({
            labels: dp.labels,
            buckets: (metric as Histogram).getBucketCounts(dp.labels),
            sum: (metric as Histogram).getSum(dp.labels),
            count: (metric as Histogram).getCount(dp.labels),
            timestamp: dp.timestamp,
          })),
        };
      } else if (metric instanceof Summary) {
        metrics[name] = {
          type: metric.type,
          description: metric.description,
          data: dataPoints.map(dp => ({
            labels: dp.labels,
            quantiles: (metric as Summary).getQuantiles(dp.labels),
            sum: (metric as Summary).getSum(dp.labels),
            count: (metric as Summary).getCount(dp.labels),
            timestamp: dp.timestamp,
          })),
        };
      } else {
        metrics[name] = {
          type: metric.type,
          description: metric.description,
          data: dataPoints,
        };
      }
    }

    return metrics;
  }

  // Get system health metrics
  getHealthMetrics(): {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    cpu: { usage: number };
    activeConnections: number;
    errorRate: number;
  } {
    const memory = process.memoryUsage();
    
    return {
      uptime: process.uptime(),
      memory,
      cpu: { usage: process.cpuUsage().user / 1000000 }, // Convert to seconds
      activeConnections: this.systemMetrics.activeConnections.getValue() || 0,
      errorRate: this.systemMetrics.errorRate.getValue() || 0,
    };
  }

  // Clean up resources
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
    }
  }

  // Private methods

  private startSystemMonitoring(): void {
    // Update system metrics every 10 seconds
    this.monitoringInterval = setInterval(() => {
      this.updateSystemMetrics();
    }, 10000);
  }

  private updateSystemMetrics(): void {
    const memory = process.memoryUsage();
    
    // Update memory metrics
    this.systemMetrics.memoryUsage.set(memory.heapUsed, { type: 'heap' });
    this.systemMetrics.memoryUsage.set(memory.heapTotal, { type: 'heap_total' });
    this.systemMetrics.memoryUsage.set(memory.rss, { type: 'rss' });
    this.systemMetrics.memoryUsage.set(memory.external, { type: 'external' });

    // Update CPU usage (simplified)
    const cpuUsage = process.cpuUsage();
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
    this.systemMetrics.cpuUsage.set(cpuPercent);
  }

  private startAlertMonitoring(): void {
    // Check alert rules every 30 seconds
    this.alertInterval = setInterval(() => {
      this.checkAlertRules();
    }, 30000);
  }

  private checkAlertRules(): void {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;

      const metric = this.getMetric(rule.metricName);
      if (!metric) continue;

      const currentValue = metric.getValue(rule.labels);
      const shouldFire = this.evaluateCondition(currentValue, rule.condition);

      const alertId = `${rule.id}_${this.formatLabels(rule.labels)}`;
      const existingAlert = this.activeAlerts.get(alertId);

      if (shouldFire && !existingAlert) {
        // Fire new alert
        this.fireAlert(rule, currentValue);
      } else if (!shouldFire && existingAlert && existingAlert.state === 'firing') {
        // Resolve alert
        this.resolveAlert(alertId);
      }
    }
  }

  private evaluateCondition(value: number, condition: AlertRule['condition']): boolean {
    switch (condition.operator) {
      case 'gt': return value > condition.threshold;
      case 'gte': return value >= condition.threshold;
      case 'lt': return value < condition.threshold;
      case 'lte': return value <= condition.threshold;
      case 'eq': return value === condition.threshold;
      case 'ne': return value !== condition.threshold;
      default: return false;
    }
  }

  private fireAlert(rule: AlertRule, currentValue: number): void {
    const alertId = `${rule.id}_${this.formatLabels(rule.labels)}`;
    
    const alert: AlertInstance = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      metricName: rule.metricName,
      currentValue,
      threshold: rule.condition.threshold,
      severity: rule.severity,
      state: 'firing',
      firedAt: new Date(),
      labels: rule.labels,
    };

    this.activeAlerts.set(alertId, alert);
    
    this.logger?.warn(`Alert fired: ${rule.name}`, {
      alertId,
      currentValue,
      threshold: rule.condition.threshold,
      severity: rule.severity,
    });

    // TODO: Send notifications to configured channels
  }

  private resolveAlert(alertId: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return;

    alert.state = 'resolved';
    alert.resolvedAt = new Date();

    this.activeAlerts.delete(alertId);
    
    this.logger?.info(`Alert resolved: ${alert.ruleName}`, {
      alertId,
      duration: alert.resolvedAt.getTime() - (alert.firedAt?.getTime() || 0),
    });

    // TODO: Send resolution notifications
  }

  private formatLabels(labels?: MetricLabels): string {
    if (!labels || Object.keys(labels).length === 0) {
      return '';
    }

    const labelPairs = Object.entries(labels)
      .map(([key, value]) => `${key}="${value}"`)
      .join(', ');
    
    return `{${labelPairs}}`;
  }
}

// Performance timer utility
export class PerformanceTimer {
  private startTime: number;
  private endTime?: number;

  constructor() {
    this.startTime = Date.now();
  }

  stop(): number {
    this.endTime = Date.now();
    return this.endTime - this.startTime;
  }

  getDuration(): number {
    return (this.endTime || Date.now()) - this.startTime;
  }
}

// Monitoring utilities
export const MonitoringUtils = {
  // Create a timer decorator for methods
  timed(metricName: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      const registry = MetricsRegistry.getInstance();
      
      // Register histogram metric if it doesn't exist
      let metric = registry.getMetric(metricName);
      if (!metric) {
        metric = registry.registerMetric({
          name: metricName,
          type: MetricType.HISTOGRAM,
          description: `Execution time for ${propertyName}`,
          buckets: [0.001, 0.01, 0.1, 0.5, 1, 5, 10],
        });
      }

      descriptor.value = async function (...args: any[]) {
        const timer = new PerformanceTimer();
        
        try {
          const result = await originalMethod.apply(this, args);
          const duration = timer.stop() / 1000; // Convert to seconds
          metric!.observe(duration);
          return result;
        } catch (error) {
          const duration = timer.stop() / 1000;
          metric!.observe(duration, { status: 'error' });
          throw error;
        }
      };
    };
  },

  // Create a counter decorator for methods
  counted(metricName: string, labels?: MetricLabels) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      const registry = MetricsRegistry.getInstance();
      
      // Register counter metric if it doesn't exist
      let metric = registry.getMetric(metricName);
      if (!metric) {
        metric = registry.registerMetric({
          name: metricName,
          type: MetricType.COUNTER,
          description: `Call count for ${propertyName}`,
        });
      }

      descriptor.value = async function (...args: any[]) {
        metric!.increment(1, labels);
        return await originalMethod.apply(this, args);
      };
    };
  },

  // Measure and record function execution time
  measureExecution<T>(
    fn: () => Promise<T> | T,
    metricName: string,
    labels?: MetricLabels
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const timer = new PerformanceTimer();
      const registry = MetricsRegistry.getInstance();
      
      // Get or create metric
      let metric = registry.getMetric(metricName);
      if (!metric) {
        metric = registry.registerMetric({
          name: metricName,
          type: MetricType.HISTOGRAM,
          description: `Execution time for ${metricName}`,
          buckets: [0.001, 0.01, 0.1, 0.5, 1, 5, 10],
        });
      }

      try {
        const result = await fn();
        const duration = timer.stop() / 1000;
        metric.observe(duration, labels);
        resolve(result);
      } catch (error) {
        const duration = timer.stop() / 1000;
        metric.observe(duration, { ...labels, status: 'error' });
        reject(error);
      }
    });
  },
};

// Export singleton instance
export const metricsRegistry = MetricsRegistry.getInstance();

// Export monitoring classes and utilities
export {
  MetricType,
  Counter,
  Gauge,
  Histogram,
  Summary,
  PerformanceTimer,
  type IMetric,
  type MetricConfig,
  type MetricLabels,
  type AlertRule,
  type AlertInstance,
};