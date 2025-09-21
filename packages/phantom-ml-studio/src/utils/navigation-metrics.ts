'use client';

/**
 * Navigation Metrics Monitoring
 * Addresses Control N.31: Navigation metrics (TTFB, CLS, FCP) monitoring
 */

interface NavigationMetric {
  route: string;
  timestamp: number;
  ttfb?: number; // Time to First Byte
  fcp?: number;  // First Contentful Paint
  lcp?: number;  // Largest Contentful Paint
  cls?: number;  // Cumulative Layout Shift
  fid?: number;  // First Input Delay
  duration: number;
  navigationStart: number;
  loadComplete: number;
  routeType: 'static' | 'dynamic' | 'api';
  prefetched: boolean;
}

interface PerformanceThresholds {
  ttfb: { good: number; poor: number };
  fcp: { good: number; poor: number };
  lcp: { good: number; poor: number };
  cls: { good: number; poor: number };
  fid: { good: number; poor: number };
}

// Extend PerformanceEntry for better typing
interface PerformanceEventTimingExtended extends PerformanceEventTiming {
  processingStart?: number;
}

interface PerformanceLayoutShiftEntry extends PerformanceEntry {
  hadRecentInput?: boolean;
  value?: number;
}

class NavigationMetricsCollector {
  private static instance: NavigationMetricsCollector;
  private metrics: NavigationMetric[] = [];
  private maxMetrics = 50;
  private observer?: PerformanceObserver;

  // Core Web Vitals thresholds
  private thresholds: PerformanceThresholds = {
    ttfb: { good: 800, poor: 1800 },
    fcp: { good: 1800, poor: 3000 },
    lcp: { good: 2500, poor: 4000 },
    cls: { good: 0.1, poor: 0.25 },
    fid: { good: 100, poor: 300 },
  };

  static getInstance(): NavigationMetricsCollector {
    if (!NavigationMetricsCollector.instance) {
      NavigationMetricsCollector.instance = new NavigationMetricsCollector();
    }
    return NavigationMetricsCollector.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
      this.setupRouteChangeTracking();
    }
  }

  private initializeObservers() {
    if ('PerformanceObserver' in window) {
      // Navigation timing observer
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.processNavigationEntry(entry as PerformanceNavigationTiming);
          } else if (entry.entryType === 'paint') {
            this.processPaintEntry(entry);
          } else if (entry.entryType === 'largest-contentful-paint') {
            this.processLCPEntry(entry);
          } else if (entry.entryType === 'first-input') {
            this.processFIDEntry(entry);
          } else if (entry.entryType === 'layout-shift') {
            this.processLayoutShiftEntry(entry);
          }
        });
      });

      // Observe multiple performance entry types
      try {
        this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        // Fallback for older browsers
        this.observer.observe({ entryTypes: ['navigation'] });
      }
    }

    // Web Vitals polyfill for older browsers
    this.setupWebVitalsPolyfill();
  }

  private processNavigationEntry(entry: PerformanceNavigationTiming) {
    const route = window.location.pathname;
    const routeType = this.determineRouteType(route);
    const prefetched = this.wasPrefetched(entry);

    const metric: NavigationMetric = {
      route,
      timestamp: Date.now(),
      ttfb: entry.responseStart - entry.requestStart,
      duration: entry.loadEventEnd - entry.navigationStart,
      navigationStart: entry.navigationStart,
      loadComplete: entry.loadEventEnd,
      routeType,
      prefetched,
    };

    this.addMetric(metric);
    this.logMetricIfPoor(metric);
  }

  private processPaintEntry(entry: PerformanceEntry) {
    if (entry.name === 'first-contentful-paint') {
      const latestMetric = this.metrics[this.metrics.length - 1];
      if (latestMetric && !latestMetric.fcp) {
        latestMetric.fcp = entry.startTime;
      }
    }
  }

  private processLCPEntry(entry: PerformanceEntry) {
    const latestMetric = this.metrics[this.metrics.length - 1];
    if (latestMetric) {
      latestMetric.lcp = entry.startTime;
    }
  }

  private processFIDEntry(entry: PerformanceEventTimingExtended) {
    const latestMetric = this.metrics[this.metrics.length - 1];
    if (latestMetric) {
      latestMetric.fid = (entry.processingStart || 0) - entry.startTime;
    }
  }

  private processLayoutShiftEntry(entry: PerformanceLayoutShiftEntry) {
    if (!entry.hadRecentInput) {
      const latestMetric = this.metrics[this.metrics.length - 1];
      if (latestMetric) {
        latestMetric.cls = (latestMetric.cls || 0) + (entry.value || 0);
      }
    }
  }

  private determineRouteType(route: string): 'static' | 'dynamic' | 'api' {
    if (route.startsWith('/api/')) return 'api';
    if (route.includes('[') || route.match(/\/\d+/)) return 'dynamic';
    return 'static';
  }

  private wasPrefetched(entry: PerformanceNavigationTiming): boolean {
    // Heuristic: if transfer size is 0, it was likely from cache (prefetched)
    return entry.transferSize === 0;
  }

  private setupRouteChangeTracking() {
    // Track Next.js route changes
    let currentRoute = window.location.pathname;

    const trackRouteChange = () => {
      const newRoute = window.location.pathname;
      if (newRoute !== currentRoute) {
        currentRoute = newRoute;
        this.recordClientSideNavigation(newRoute);
      }
    };

    // Listen for pushstate/popstate events
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(trackRouteChange, 0);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(trackRouteChange, 0);
    };

    window.addEventListener('popstate', trackRouteChange);
  }

  private recordClientSideNavigation(route: string) {
    const navigationStart = performance.now();
    const routeType = this.determineRouteType(route);

    // Use requestIdleCallback to measure when route is fully loaded
    const measureComplete = () => {
      const loadComplete = performance.now();
      const duration = loadComplete - navigationStart;

      const metric: NavigationMetric = {
        route,
        timestamp: Date.now(),
        duration,
        navigationStart,
        loadComplete,
        routeType,
        prefetched: true, // Client-side navigation assumes prefetching
      };

      this.addMetric(metric);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(measureComplete);
    } else {
      setTimeout(measureComplete, 100);
    }
  }

  private setupWebVitalsPolyfill() {
    // Simplified Web Vitals measurement for better browser support
    if (!('PerformanceObserver' in window)) {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.processNavigationEntry(navigation);
        }
      }, 1000);
    }
  }

  private addMetric(metric: NavigationMetric) {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Dispatch custom event for external monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('navigation-metric', {
        detail: metric
      }));
    }
  }

  private logMetricIfPoor(metric: NavigationMetric) {
    const poorPerformance: string[] = [];

    if (metric.ttfb && metric.ttfb > this.thresholds.ttfb.poor) {
      poorPerformance.push(`TTFB: ${metric.ttfb}ms`);
    }
    if (metric.fcp && metric.fcp > this.thresholds.fcp.poor) {
      poorPerformance.push(`FCP: ${metric.fcp}ms`);
    }
    if (metric.lcp && metric.lcp > this.thresholds.lcp.poor) {
      poorPerformance.push(`LCP: ${metric.lcp}ms`);
    }
    if (metric.cls && metric.cls > this.thresholds.cls.poor) {
      poorPerformance.push(`CLS: ${metric.cls}`);
    }
    if (metric.fid && metric.fid > this.thresholds.fid.poor) {
      poorPerformance.push(`FID: ${metric.fid}ms`);
    }

    if (poorPerformance.length > 0) {
      console.warn(`[Navigation Metrics] Poor performance on ${metric.route}:`, poorPerformance);
    }
  }

  getMetrics(): NavigationMetric[] {
    return [...this.metrics];
  }

  getMetricsSummary() {
    if (this.metrics.length === 0) {
      return null;
    }

    const calculateStats = (values: number[]) => {
      const sorted = values.sort((a, b) => a - b);
      return {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        median: sorted[Math.floor(sorted.length / 2)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        average: values.reduce((sum, v) => sum + v, 0) / values.length,
      };
    };

    const ttfbValues = this.metrics.map(m => m.ttfb).filter(Boolean) as number[];
    const fcpValues = this.metrics.map(m => m.fcp).filter(Boolean) as number[];
    const lcpValues = this.metrics.map(m => m.lcp).filter(Boolean) as number[];
    const clsValues = this.metrics.map(m => m.cls).filter(Boolean) as number[];
    const fidValues = this.metrics.map(m => m.fid).filter(Boolean) as number[];
    const durationValues = this.metrics.map(m => m.duration);

    return {
      totalNavigations: this.metrics.length,
      prefetchedRate: this.metrics.filter(m => m.prefetched).length / this.metrics.length,
      routeTypes: {
        static: this.metrics.filter(m => m.routeType === 'static').length,
        dynamic: this.metrics.filter(m => m.routeType === 'dynamic').length,
        api: this.metrics.filter(m => m.routeType === 'api').length,
      },
      ttfb: ttfbValues.length > 0 ? calculateStats(ttfbValues) : null,
      fcp: fcpValues.length > 0 ? calculateStats(fcpValues) : null,
      lcp: lcpValues.length > 0 ? calculateStats(lcpValues) : null,
      cls: clsValues.length > 0 ? calculateStats(clsValues) : null,
      fid: fidValues.length > 0 ? calculateStats(fidValues) : null,
      duration: calculateStats(durationValues),
      timestamp: new Date().toISOString(),
    };
  }

  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      summary: this.getMetricsSummary(),
      thresholds: this.thresholds,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  clearMetrics() {
    this.metrics = [];
  }

  // Get Core Web Vitals score
  getCoreWebVitalsScore() {
    const summary = this.getMetricsSummary();
    if (!summary) return null;

    const scores = {
      ttfb: this.getScoreForMetric(summary.ttfb?.median, this.thresholds.ttfb),
      fcp: this.getScoreForMetric(summary.fcp?.median, this.thresholds.fcp),
      lcp: this.getScoreForMetric(summary.lcp?.median, this.thresholds.lcp),
      cls: this.getScoreForMetric(summary.cls?.median, this.thresholds.cls),
      fid: this.getScoreForMetric(summary.fid?.median, this.thresholds.fid),
    };

    const validScores = Object.values(scores).filter(s => s !== null) as number[];
    const overallScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;

    return {
      overall: Math.round(overallScore),
      breakdown: scores,
      grade: overallScore >= 90 ? 'A' : overallScore >= 75 ? 'B' : overallScore >= 60 ? 'C' : 'D',
    };
  }

  private getScoreForMetric(value: number | undefined, threshold: { good: number; poor: number }): number | null {
    if (value === undefined) return null;

    if (value <= threshold.good) return 100;
    if (value >= threshold.poor) return 0;

    // Linear interpolation between good and poor
    const ratio = (threshold.poor - value) / (threshold.poor - threshold.good);
    return Math.round(ratio * 100);
  }
}

// Export singleton instance
export const navigationMetrics = NavigationMetricsCollector.getInstance();

// React hook for components
export function useNavigationMetrics() {
  return {
    getMetrics: navigationMetrics.getMetrics.bind(navigationMetrics),
    getSummary: navigationMetrics.getMetricsSummary.bind(navigationMetrics),
    exportMetrics: navigationMetrics.exportMetrics.bind(navigationMetrics),
    getCoreWebVitalsScore: navigationMetrics.getCoreWebVitalsScore.bind(navigationMetrics),
    clearMetrics: navigationMetrics.clearMetrics.bind(navigationMetrics),
  };
}

// Manual navigation tracking for custom scenarios
export function trackCustomNavigation(route: string, startTime: number) {
  const endTime = performance.now();
  const duration = endTime - startTime;

  const metric: NavigationMetric = {
    route,
    timestamp: Date.now(),
    duration,
    navigationStart: startTime,
    loadComplete: endTime,
    routeType: navigationMetrics['determineRouteType'](route),
    prefetched: false,
  };

  navigationMetrics['addMetric'](metric);
}