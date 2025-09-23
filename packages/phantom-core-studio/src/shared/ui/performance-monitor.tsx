/**
 * Performance Monitoring System
 * Provides comprehensive performance tracking for the application
 */

import { performance, PerformanceObserver, PerformanceEntry } from 'perf_hooks';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'navigation' | 'resource' | 'measure' | 'paint' | 'custom';
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    totalLoadTime: number;
    ttfb: number; // Time to First Byte
    fcp: number; // First Contentful Paint
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    tti: number; // Time to Interactive
  };
  resources: {
    scripts: number;
    stylesheets: number;
    images: number;
    fonts: number;
    total: number;
  };
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  bundleSize?: {
    totalSize: number;
    cachedSize: number;
    networkSize: number;
  };
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver | null = null;
  private marks: Map<string, number> = new Map();
  private isClient: boolean = typeof window !== 'undefined';
  private reportCallback?: (report: PerformanceReport) => void;
  private metricsBuffer: PerformanceMetric[] = [];
  private bufferSize: number = 100;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (this.isClient) {
      this.initializeObserver();
      this.initializeWebVitals();
      this.startBufferFlush();
    }
  }

  /**
   * Initialize performance observer for browser metrics
   */
  private initializeObserver(): void {
    if (!this.isClient) return;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      // Observe different types of performance entries
      this.observer.observe({
        entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift']
      });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  /**
   * Process performance entries
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    const metric: PerformanceMetric = {
      name: entry.name,
      value: entry.duration || 0,
      unit: 'ms',
      timestamp: Date.now(),
      category: this.categorizeEntry(entry),
      metadata: {
        entryType: entry.entryType,
        startTime: entry.startTime,
      },
    };

    this.addMetric(metric);
  }

  /**
   * Categorize performance entry
   */
  private categorizeEntry(entry: PerformanceEntry): PerformanceMetric['category'] {
    const typeMap: Record<string, PerformanceMetric['category']> = {
      navigation: 'navigation',
      resource: 'resource',
      measure: 'measure',
      paint: 'paint',
      'largest-contentful-paint': 'paint',
      'first-input': 'measure',
      'layout-shift': 'measure',
    };

    return typeMap[entry.entryType] || 'custom';
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private initializeWebVitals(): void {
    if (!this.isClient) return;

    // Monitor Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.addMetric({
            name: 'LCP',
            value: lastEntry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'paint',
          });
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        // LCP observer not supported
      }
    }

    // Monitor First Input Delay
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            this.addMetric({
              name: 'FID',
              value: entry.processingStart - entry.startTime,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'measure',
            });
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        // FID observer not supported
      }
    }

    // Monitor Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.addMetric({
                name: 'CLS',
                value: clsValue,
                unit: 'score',
                timestamp: Date.now(),
                category: 'measure',
              });
            }
          });
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        // CLS observer not supported
      }
    }
  }

  /**
   * Start a performance mark
   */
  public mark(name: string): void {
    if (this.isClient && window.performance) {
      window.performance.mark(name);
      this.marks.set(name, performance.now());
    } else {
      this.marks.set(name, Date.now());
    }
  }

  /**
   * Measure between two marks
   */
  public measure(name: string, startMark: string, endMark?: string): void {
    if (!this.marks.has(startMark)) {
      console.warn(`Start mark '${startMark}' not found`);
      return;
    }

    const startTime = this.marks.get(startMark)!;
    const endTime = endMark ? this.marks.get(endMark) : performance.now();

    if (endMark && !this.marks.has(endMark)) {
      console.warn(`End mark '${endMark}' not found`);
      return;
    }

    const duration = (endTime || performance.now()) - startTime;

    if (this.isClient && window.performance) {
      try {
        window.performance.measure(name, startMark, endMark);
      } catch (e) {
        // Fallback if measure fails
      }
    }

    this.addMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'measure',
    });
  }

  /**
   * Add a custom metric
   */
  public addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.metricsBuffer.push(metric);

    // Flush buffer if it's full
    if (this.metricsBuffer.length >= this.bufferSize) {
      this.flushBuffer();
    }
  }

  /**
   * Track component render performance
   */
  public trackComponentRender(componentName: string, renderTime: number): void {
    this.addMetric({
      name: `Component:${componentName}`,
      value: renderTime,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'custom',
      metadata: {
        type: 'component-render',
        component: componentName,
      },
    });
  }

  /**
   * Track API call performance
   */
  public trackApiCall(endpoint: string, duration: number, status: number): void {
    this.addMetric({
      name: `API:${endpoint}`,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'resource',
      metadata: {
        type: 'api-call',
        endpoint,
        status,
        success: status >= 200 && status < 300,
      },
    });
  }

  /**
   * Track bundle loading performance
   */
  public trackBundleLoad(bundleName: string, loadTime: number, size: number): void {
    this.addMetric({
      name: `Bundle:${bundleName}`,
      value: loadTime,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'resource',
      metadata: {
        type: 'bundle-load',
        bundle: bundleName,
        size,
        sizeUnit: 'bytes',
      },
    });
  }

  /**
   * Get memory usage (Chrome only)
   */
  private getMemoryUsage(): PerformanceReport['memory'] | undefined {
    if (this.isClient && (window.performance as any).memory) {
      const memory = (window.performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return undefined;
  }

  /**
   * Generate performance report
   */
  public generateReport(): PerformanceReport {
    const navigationMetrics = this.metrics.filter(m => m.category === 'navigation');
    const paintMetrics = this.metrics.filter(m => m.category === 'paint');
    const resourceMetrics = this.metrics.filter(m => m.category === 'resource');

    // Calculate summary metrics
    const summary = {
      totalLoadTime: navigationMetrics.find(m => m.name === 'loadEventEnd')?.value || 0,
      ttfb: navigationMetrics.find(m => m.name === 'responseStart')?.value || 0,
      fcp: paintMetrics.find(m => m.name === 'first-contentful-paint')?.value || 0,
      lcp: paintMetrics.find(m => m.name === 'LCP')?.value || 0,
      fid: this.metrics.find(m => m.name === 'FID')?.value || 0,
      cls: this.metrics.find(m => m.name === 'CLS')?.value || 0,
      tti: navigationMetrics.find(m => m.name === 'interactive')?.value || 0,
    };

    // Calculate resource statistics
    const resources = {
      scripts: resourceMetrics.filter(m => m.name.includes('.js')).length,
      stylesheets: resourceMetrics.filter(m => m.name.includes('.css')).length,
      images: resourceMetrics.filter(m =>
        m.name.match(//.(jpg|jpeg|png|gif|svg|webp|avif)/)
      ).length,
      fonts: resourceMetrics.filter(m =>
        m.name.match(//.(woff|woff2|ttf|otf)/)
      ).length,
      total: resourceMetrics.length,
    };

    // Calculate bundle sizes
    const bundleMetrics = this.metrics.filter(m =>
      m.metadata?.type === 'bundle-load'
    );
    const bundleSize = bundleMetrics.length > 0 ? {
      totalSize: bundleMetrics.reduce((sum, m) =>
        sum + (m.metadata?.size || 0), 0
      ),
      cachedSize: bundleMetrics.filter(m =>
        m.metadata?.cached
      ).reduce((sum, m) => sum + (m.metadata?.size || 0), 0),
      networkSize: bundleMetrics.filter(m =>
        !m.metadata?.cached
      ).reduce((sum, m) => sum + (m.metadata?.size || 0), 0),
    } : undefined;

    return {
      metrics: this.metrics,
      summary,
      resources,
      memory: this.getMemoryUsage(),
      bundleSize,
    };
  }

  /**
   * Start buffer flush interval
   */
  private startBufferFlush(): void {
    this.flushInterval = setInterval(() => {
      if (this.metricsBuffer.length > 0) {
        this.flushBuffer();
      }
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Flush metrics buffer
   */
  private flushBuffer(): void {
    if (this.metricsBuffer.length === 0) return;

    if (this.reportCallback) {
      const report = this.generateReport();
      this.reportCallback(report);
    }

    // Send to analytics endpoint if configured
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      this.sendMetrics(this.metricsBuffer);
    }

    this.metricsBuffer = [];
  }

  /**
   * Send metrics to analytics endpoint
   */
  private async sendMetrics(metrics: PerformanceMetric[]): Promise<void> {
    try {
      await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          timestamp: Date.now(),
          userAgent: this.isClient ? navigator.userAgent : 'server',
          url: this.isClient ? window.location.href : 'server',
        }),
      });
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }
  }

  /**
   * Set report callback
   */
  public onReport(callback: (report: PerformanceReport) => void): void {
    this.reportCallback = callback;
  }

  /**
   * Clear all metrics
   */
  public clear(): void {
    this.metrics = [];
    this.metricsBuffer = [];
    this.marks.clear();
  }

  /**
   * Destroy the monitor
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export hook for React components
export function usePerformanceMonitor() {
  return performanceMonitor;
}

// Export HOC for component performance tracking
import React from 'react';

export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function WrappedComponent(props: P) {
    const startTime = performance.now();

    React.useEffect(() => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.trackComponentRender(componentName, renderTime);
    }, []);

    return <Component {...props} />;
  };
}