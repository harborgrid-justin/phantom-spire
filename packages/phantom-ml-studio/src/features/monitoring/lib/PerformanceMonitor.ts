/**
 * Enterprise Performance Monitoring Service
 * Comprehensive performance monitoring, metrics collection, and alerting
 */

import { BaseService, Injectable } from '..\..\..\lib\core\ServiceRegistry';

// Performance metric types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface WebVital {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back_forward' | 'prerender';
}

export interface APIPerformance {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  size: number;
  timestamp: number;
  error?: string;
}

// Performance thresholds
export interface PerformanceThresholds {
  webVitals: {
    lcp: { good: number; needs_improvement: number }; // Largest Contentful Paint
    fid: { good: number; needs_improvement: number }; // First Input Delay
    cls: { good: number; needs_improvement: number }; // Cumulative Layout Shift
    fcp: { good: number; needs_improvement: number }; // First Contentful Paint
    ttfb: { good: number; needs_improvement: number }; // Time to First Byte
    inp: { good: number; needs_improvement: number }; // Interaction to Next Paint
  };
  api: {
    response_time: { good: number; needs_improvement: number };
    error_rate: { good: number; needs_improvement: number };
  };
  resources: {
    memory_usage: { good: number; needs_improvement: number };
    cpu_usage: { good: number; needs_improvement: number };
  };
}

// Default performance thresholds based on web.dev recommendations
export const defaultThresholds: PerformanceThresholds = {
  webVitals: {
    lcp: { good: 2500, needs_improvement: 4000 },
    fid: { good: 100, needs_improvement: 300 },
    cls: { good: 0.1, needs_improvement: 0.25 },
    fcp: { good: 1800, needs_improvement: 3000 },
    ttfb: { good: 800, needs_improvement: 1800 },
    inp: { good: 200, needs_improvement: 500 }
  },
  api: {
    response_time: { good: 200, needs_improvement: 1000 },
    error_rate: { good: 1, needs_improvement: 5 }
  },
  resources: {
    memory_usage: { good: 70, needs_improvement: 85 },
    cpu_usage: { good: 70, needs_improvement: 85 }
  }
};

// Performance alert
export interface PerformanceAlert {
  id: string;
  type: 'web_vital' | 'api_performance' | 'resource_usage' | 'error_rate';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  metric: PerformanceMetric;
  threshold: number;
  timestamp: number;
  resolved: boolean;
}

@Injectable('PerformanceMonitor')
export class PerformanceMonitor extends BaseService {
  public readonly serviceName = 'PerformanceMonitor';
  
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private webVitals: WebVital[] = [];
  private apiMetrics: APIPerformance[] = [];
  private alerts: PerformanceAlert[] = [];
  private thresholds: PerformanceThresholds = defaultThresholds;
  
  private metricsRetentionMs = 24 * 60 * 60 * 1000; // 24 hours
  private cleanupInterval?: NodeJS.Timeout;
  private memoryMonitorInterval?: NodeJS.Timeout;

  protected async onInitialize(): Promise<void> {
    // Initialize web vitals monitoring if in browser
    if (typeof window !== 'undefined') {
      this.initializeWebVitalsMonitoring();
      this.initializeMemoryMonitoring();
    }

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldMetrics();
    }, 60 * 60 * 1000); // Every hour

    console.log('Performance monitor initialized');
  }

  protected async onDestroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
    }
    
    this.metrics.clear();
    this.webVitals = [];
    this.apiMetrics = [];
    this.alerts = [];
  }

  protected async performHealthCheck(): Promise<boolean> {
    return true;
  }

  // Initialize Web Vitals monitoring
  private initializeWebVitalsMonitoring(): void {
    // Manual LCP measurement
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          this.recordWebVital({
            name: 'LCP',
            value: lastEntry.startTime,
            delta: lastEntry.startTime,
            id: `lcp-${Date.now()}`,
            navigationType: 'navigate'
          });
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('Performance Observer not supported');
      }
    }

    // Manual TTFB measurement
    window.addEventListener('load', () => {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        this.recordWebVital({
          name: 'TTFB',
          value: navigationTiming.responseStart - navigationTiming.fetchStart,
          delta: navigationTiming.responseStart - navigationTiming.fetchStart,
          id: `ttfb-${Date.now()}`,
          navigationType: 'navigate'
        });
      }
    });
  }

  // Initialize Memory monitoring
  private initializeMemoryMonitoring(): void {
    this.memoryMonitorInterval = setInterval(() => {
      this.recordMemoryUsage();
    }, 30000); // Every 30 seconds
  }

  // Record web vital
  recordWebVital(vital: WebVital): void {
    this.webVitals.push(vital);
    
    // Create performance metric
    const metric: PerformanceMetric = {
      name: `web_vital_${vital.name.toLowerCase()}`,
      value: vital.value,
      unit: vital.name === 'CLS' ? 'ratio' : 'ms',
      timestamp: Date.now(),
      tags: {
        metric_type: 'web_vital',
        navigation_type: vital.navigationType
      },
      metadata: {
        id: vital.id,
        delta: vital.delta
      }
    };

    this.addMetric(metric);
    this.checkThresholds(metric);
  }

  // Record API performance
  recordAPIPerformance(api: APIPerformance): void {
    this.apiMetrics.push(api);
    
    const metric: PerformanceMetric = {
      name: 'api_response_time',
      value: api.duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: {
        endpoint: api.endpoint,
        method: api.method,
        status_code: api.statusCode.toString()
      },
      metadata: {
        size: api.size,
        error: api.error
      }
    };

    this.addMetric(metric);
    this.checkThresholds(metric);
  }

  // Record memory usage
  private recordMemoryUsage(): void {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      
      const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

      const metric: PerformanceMetric = {
        name: 'memory_usage_percent',
        value: usedPercent,
        unit: 'percent',
        timestamp: Date.now(),
        tags: {
          metric_type: 'memory'
        },
        metadata: {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          available: memory.jsHeapSizeLimit
        }
      };

      this.addMetric(metric);
      this.checkThresholds(metric);
    }
  }

  // Add metric to storage
  private addMetric(metric: PerformanceMetric): void {
    const key = metric.name;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const metrics = this.metrics.get(key)!;
    metrics.push(metric);
    
    // Keep only recent metrics (memory management)
    const cutoff = Date.now() - this.metricsRetentionMs;
    const recentMetrics = metrics.filter(m => m.timestamp > cutoff);
    this.metrics.set(key, recentMetrics);
  }

  // Check performance thresholds and create alerts
  private checkThresholds(metric: PerformanceMetric): void {
    let threshold: number | undefined;
    let severity: 'info' | 'warning' | 'critical' = 'info';

    // Check web vitals thresholds
    if (metric.name.startsWith('web_vital_')) {
      const vitalName = metric.name.replace('web_vital_', '') as keyof typeof this.thresholds.webVitals;
      const vitalThreshold = this.thresholds.webVitals[vitalName];
      
      if (vitalThreshold) {
        if (metric.value > vitalThreshold.needs_improvement) {
          threshold = vitalThreshold.needs_improvement;
          severity = 'critical';
        } else if (metric.value > vitalThreshold.good) {
          threshold = vitalThreshold.good;
          severity = 'warning';
        }
      }
    }

    // Check API performance thresholds
    if (metric.name === 'api_response_time') {
      const apiThreshold = this.thresholds.api.response_time;
      if (metric.value > apiThreshold.needs_improvement) {
        threshold = apiThreshold.needs_improvement;
        severity = 'critical';
      } else if (metric.value > apiThreshold.good) {
        threshold = apiThreshold.good;
        severity = 'warning';
      }
    }

    // Check memory usage thresholds
    if (metric.name === 'memory_usage_percent') {
      const memoryThreshold = this.thresholds.resources.memory_usage;
      if (metric.value > memoryThreshold.needs_improvement) {
        threshold = memoryThreshold.needs_improvement;
        severity = 'critical';
      } else if (metric.value > memoryThreshold.good) {
        threshold = memoryThreshold.good;
        severity = 'warning';
      }
    }

    // Create alert if threshold exceeded
    if (threshold && severity !== 'info') {
      this.createAlert(metric, threshold, severity);
    }
  }

  // Create performance alert
  private createAlert(metric: PerformanceMetric, threshold: number, severity: 'warning' | 'critical'): void {
    const alert: PerformanceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: metric.name.startsWith('web_vital_') ? 'web_vital' : 
            metric.name.startsWith('api_') ? 'api_performance' : 'resource_usage',
      severity,
      message: `${metric.name} exceeded threshold: ${metric.value}${metric.unit} > ${threshold}${metric.unit}`,
      metric,
      threshold,
      timestamp: Date.now(),
      resolved: false
    };

    this.alerts.push(alert);
    
    // Emit alert event (could be sent to logging service, Slack, etc.)
    console.warn(`Performance Alert [${severity.toUpperCase()}]:`, alert.message);
  }

  // Get performance summary
  getPerformanceSummary(): {
    webVitals: Record<string, { value: number; rating: 'good' | 'needs-improvement' | 'poor' }>;
    apiPerformance: { averageResponseTime: number; errorRate: number };
    resourceUsage: { memoryUsage: number; cpuUsage?: number };
    alerts: { total: number; critical: number; warnings: number };
  } {
    // Summarize web vitals
    const webVitalsSummary: Record<string, { value: number; rating: 'good' | 'needs-improvement' | 'poor' }> = {};
    
    for (const vital of this.webVitals.slice(-10)) { // Last 10 measurements
      const thresholdKey = vital.name.toLowerCase() as keyof typeof this.thresholds.webVitals;
      const threshold = this.thresholds.webVitals[thresholdKey];
      
      let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
      if (threshold) {
        if (vital.value > threshold.needs_improvement) {
          rating = 'poor';
        } else if (vital.value > threshold.good) {
          rating = 'needs-improvement';
        }
      }
      
      webVitalsSummary[vital.name] = { value: vital.value, rating };
    }

    // Summarize API performance
    const recentAPIMetrics = this.apiMetrics.slice(-100); // Last 100 API calls
    const averageResponseTime = recentAPIMetrics.length > 0 
      ? recentAPIMetrics.reduce((sum, api) => sum + api.duration, 0) / recentAPIMetrics.length 
      : 0;
    const errorRate = recentAPIMetrics.length > 0 
      ? (recentAPIMetrics.filter(api => api.statusCode >= 400).length / recentAPIMetrics.length) * 100
      : 0;

    // Summarize resource usage
    const memoryMetrics = this.metrics.get('memory_usage_percent') || [];
    const latestMemory = memoryMetrics.length > 0 ? memoryMetrics[memoryMetrics.length - 1].value : 0;

    // Summarize alerts
    const activeAlerts = this.alerts.filter(alert => !alert.resolved);
    const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical').length;
    const warningAlerts = activeAlerts.filter(alert => alert.severity === 'warning').length;

    return {
      webVitals: webVitalsSummary,
      apiPerformance: { averageResponseTime, errorRate },
      resourceUsage: { memoryUsage: latestMemory },
      alerts: { total: activeAlerts.length, critical: criticalAlerts, warnings: warningAlerts }
    };
  }

  // Get metrics by name
  getMetrics(name: string, timeRange?: { start: number; end: number }): PerformanceMetric[] {
    const metrics = this.metrics.get(name) || [];
    
    if (timeRange) {
      return metrics.filter(m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end);
    }
    
    return metrics;
  }

  // Get all web vitals
  getWebVitals(): WebVital[] {
    return [...this.webVitals];
  }

  // Get API performance metrics
  getAPIMetrics(): APIPerformance[] {
    return [...this.apiMetrics];
  }

  // Get active alerts
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Resolve alert
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  // Update thresholds
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  // Clean up old metrics
  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - this.metricsRetentionMs;
    
    // Clean metrics
    for (const [key, metrics] of this.metrics.entries()) {
      const recentMetrics = metrics.filter(m => m.timestamp > cutoff);
      this.metrics.set(key, recentMetrics);
    }

    // Clean web vitals
    this.webVitals = this.webVitals.filter(v => Date.now() - 5 * 60 * 1000 < cutoff); // Keep for 5 minutes

    // Clean API metrics
    this.apiMetrics = this.apiMetrics.filter(a => a.timestamp > cutoff);

    // Clean resolved alerts older than 1 hour
    const alertCutoff = Date.now() - 60 * 60 * 1000;
    this.alerts = this.alerts.filter(a => !a.resolved || a.timestamp > alertCutoff);
  }

  // Export metrics for external monitoring systems
  exportMetrics(): {
    metrics: Record<string, PerformanceMetric[]>;
    webVitals: WebVital[];
    apiMetrics: APIPerformance[];
    alerts: PerformanceAlert[];
    summary: ReturnType<typeof this.getPerformanceSummary>;
  } {
    return {
      metrics: Object.fromEntries(this.metrics),
      webVitals: this.webVitals,
      apiMetrics: this.apiMetrics,
      alerts: this.alerts,
      summary: this.getPerformanceSummary()
    };
  }
}

// Performance monitoring utilities
export class PerformanceUtils {
  static measureAsync<T>(fn: () => Promise<T>, name: string, monitor: PerformanceMonitor): Promise<T> {
    const start = Date.now();
    return fn().then(
      result => {
        const duration = Date.now() - start;
        monitor.recordAPIPerformance({
          endpoint: name,
          method: 'ASYNC',
          statusCode: 200,
          duration,
          size: 0,
          timestamp: start
        });
        return result;
      },
      error => {
        const duration = Date.now() - start;
        monitor.recordAPIPerformance({
          endpoint: name,
          method: 'ASYNC',
          statusCode: 500,
          duration,
          size: 0,
          timestamp: start,
          error: error.message
        });
        throw error;
      }
    );
  }

  static createAPIMiddleware(monitor: PerformanceMonitor) {
    return (req: any, res: any, next: any) => {
      const start = Date.now();
      const originalSend = res.send;

      res.send = function(data: any) {
        const duration = Date.now() - start;
        const size = typeof data === 'string' ? data.length : JSON.stringify(data).length;
        
        monitor.recordAPIPerformance({
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          duration,
          size,
          timestamp: start
        });

        return originalSend.call(this, data);
      };

      next();
    };
  }
}

export { defaultThresholds };