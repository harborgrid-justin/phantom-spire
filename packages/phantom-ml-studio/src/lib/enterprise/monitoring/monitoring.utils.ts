/**
 * Enterprise Performance Monitoring Utilities
 * Shared utility functions for performance monitoring
 */

import { PerformanceMetric } from './monitoring.types';

// ==================== STATISTICAL UTILITIES ====================

/**
 * Calculate percentile from an array of values
 */
export function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Calculate standard deviation from an array of values
 */
export function calculateStandardDeviation(values: number[]): number {
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate Z-score for anomaly detection
 */
export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return Math.abs((value - mean) / stdDev);
}

/**
 * Calculate basic statistics for a set of values
 */
export function calculateBasicStats(values: number[]) {
  if (values.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      stdDev: 0
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const p50 = calculatePercentile(values, 50);
  const p95 = calculatePercentile(values, 95);
  const p99 = calculatePercentile(values, 99);
  const stdDev = calculateStandardDeviation(values);

  return {
    min,
    max,
    avg,
    p50,
    p95,
    p99,
    stdDev
  };
}

// ==================== METRIC UTILITIES ====================

/**
 * Group metrics by name
 */
export function groupMetricsByName(metrics: PerformanceMetric[]): Record<string, PerformanceMetric[]> {
  return metrics.reduce((groups, metric) => {
    if (!groups[metric.name]) {
      groups[metric.name] = [];
    }
    groups[metric.name].push(metric);
    return groups;
  }, {} as Record<string, PerformanceMetric[]>);
}

/**
 * Group metrics by source
 */
export function groupMetricsBySource(metrics: PerformanceMetric[]): Record<string, PerformanceMetric[]> {
  return metrics.reduce((groups, metric) => {
    if (!groups[metric.source]) {
      groups[metric.source] = [];
    }
    groups[metric.source].push(metric);
    return groups;
  }, {} as Record<string, PerformanceMetric[]>);
}

/**
 * Filter metrics by time range
 */
export function filterMetricsByTimeRange(
  metrics: PerformanceMetric[],
  timeRange: { start: Date; end: Date }
): PerformanceMetric[] {
  return metrics.filter(metric =>
    metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
  );
}

/**
 * Filter metrics by tags
 */
export function filterMetricsByTags(
  metrics: PerformanceMetric[],
  tags: Record<string, string>
): PerformanceMetric[] {
  return metrics.filter(metric =>
    Object.entries(tags).every(([key, value]) => metric.tags[key] === value)
  );
}

/**
 * Get latest metric value by name
 */
export function getLatestMetricValue(
  metrics: PerformanceMetric[],
  metricName: string
): PerformanceMetric | undefined {
  const filtered = metrics.filter(m => m.name === metricName);
  if (filtered.length === 0) return undefined;

  return filtered.reduce((latest, current) =>
    current.timestamp > latest.timestamp ? current : latest
  );
}

// ==================== SAMPLING UTILITIES ====================

/**
 * Apply uniform sampling to metrics
 */
export function applyUniformSampling(
  metrics: PerformanceMetric[],
  sampleRate: number
): PerformanceMetric[] {
  return metrics.filter(() => Math.random() < sampleRate);
}

/**
 * Apply adaptive sampling based on metric type
 */
export function applyAdaptiveSampling(
  metrics: PerformanceMetric[],
  baseSampleRate: number
): PerformanceMetric[] {
  return metrics.filter(metric => {
    const isErrorMetric = metric.name.includes('error') || metric.name.includes('failed');
    const rate = isErrorMetric ? Math.min(1.0, baseSampleRate * 2) : baseSampleRate;
    return Math.random() < rate;
  });
}

/**
 * Apply priority-based sampling
 */
export function applyPrioritySampling(
  metrics: PerformanceMetric[],
  baseSampleRate: number
): PerformanceMetric[] {
  const highPriorityKeywords = ['accuracy', 'latency', 'errors', 'utilization'];

  return metrics.filter(metric => {
    const isHighPriority = highPriorityKeywords.some(key =>
      metric.name.includes(key)
    );
    const rate = isHighPriority ? Math.min(1.0, baseSampleRate * 1.5) : baseSampleRate * 0.5;
    return Math.random() < rate;
  });
}

// ==================== PATTERN MATCHING UTILITIES ====================

/**
 * Check if a metric name matches a pattern (supports wildcards)
 */
export function matchesPattern(pattern: string, metricName: string): boolean {
  if (pattern.includes('*')) {
    const regex = new RegExp(pattern.replace(//*/g, '.*'));
    return regex.test(metricName);
  }
  return pattern === metricName;
}

/**
 * Check if metric name contains any of the specified keywords
 */
export function containsKeywords(metricName: string, keywords: string[]): boolean {
  return keywords.some(keyword => metricName.toLowerCase().includes(keyword.toLowerCase()));
}

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate metric data structure
 */
export function validateMetric(metric: any): metric is PerformanceMetric {
  return (
    typeof metric === 'object' &&
    typeof metric.name === 'string' &&
    typeof metric.value === 'number' &&
    typeof metric.unit === 'string' &&
    metric.timestamp instanceof Date &&
    typeof metric.source === 'string' &&
    typeof metric.tags === 'object' &&
    !isNaN(metric.value) &&
    isFinite(metric.value)
  );
}

/**
 * Validate time range
 */
export function validateTimeRange(timeRange: { start: Date; end: Date }): boolean {
  return (
    timeRange.start instanceof Date &&
    timeRange.end instanceof Date &&
    timeRange.start <= timeRange.end
  );
}

// ==================== FORMATTING UTILITIES ====================

/**
 * Format metric value with appropriate unit
 */
export function formatMetricValue(value: number, unit: string, precision = 2): string {
  const formatted = value.toFixed(precision);

  switch (unit) {
    case 'percent':
    case '%':
      return `${formatted}%`;
    case 'ms':
      return `${formatted}ms`;
    case 'mb':
      return `${formatted}MB`;
    case 'gb':
      return `${formatted}GB`;
    case 'count':
      return Math.round(value).toString();
    case 'ratio':
      return (value * 100).toFixed(precision) + '%';
    default:
      return `${formatted} ${unit}`;
  }
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format timestamp to ISO string with timezone
 */
export function formatTimestamp(date: Date): string {
  return date.toISOString();
}

// ==================== ID GENERATION UTILITIES ====================

/**
 * Generate unique ID for alerts, recommendations, etc.
 */
export function generateId(prefix: string = '', suffix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${random}${suffix ? '_' : ''}${suffix}`;
}

/**
 * Generate metric storage key
 */
export function generateMetricKey(metric: PerformanceMetric): string {
  return `metric_${metric.name}_${metric.timestamp.getTime()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== COMPRESSION UTILITIES ====================

/**
 * Simple compression for metric data (basic implementation)
 */
export function compressMetricData(metrics: PerformanceMetric[]): string {
  // In a real implementation, you might use a compression library
  // This is a simplified example
  try {
    return JSON.stringify(metrics);
  } catch (error) {
    throw new Error(`Failed to compress metric data: ${error}`);
  }
}

/**
 * Decompress metric data
 */
export function decompressMetricData(compressedData: string): PerformanceMetric[] {
  try {
    const data = JSON.parse(compressedData);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(`Failed to decompress metric data: ${error}`);
  }
}

// ==================== RETRY UTILITIES ====================

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// ==================== THRESHOLD UTILITIES ====================

/**
 * Check if value exceeds threshold based on operator
 */
export function checkThreshold(
  value: number,
  threshold: number,
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte'
): boolean {
  switch (operator) {
    case 'gt': return value > threshold;
    case 'lt': return value < threshold;
    case 'eq': return value === threshold;
    case 'ne': return value !== threshold;
    case 'gte': return value >= threshold;
    case 'lte': return value <= threshold;
    default: return false;
  }
}

/**
 * Calculate threshold based on baseline and percentage
 */
export function calculateDynamicThreshold(
  baselineValue: number,
  percentageChange: number,
  direction: 'increase' | 'decrease' = 'increase'
): number {
  const multiplier = direction === 'increase' ? (1 + percentageChange / 100) : (1 - percentageChange / 100);
  return baselineValue * multiplier;
}