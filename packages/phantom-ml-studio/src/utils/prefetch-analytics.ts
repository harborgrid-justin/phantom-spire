'use client';

/**
 * P.45: Prefetch-enabled navigation metrics (timing, failed prefetch logs)
 * Monitors navigation with analytics for prefetch effectiveness
 */

interface PrefetchMetric {
  route: string;
  timestamp: number;
  prefetchTime?: number;
  navigationTime?: number;
  cacheHit: boolean;
  connectionType?: string;
  reason?: string;
  error?: string;
}

interface NavigationTiming {
  route: string;
  startTime: number;
  endTime: number;
  duration: number;
  wasPrefetched: boolean;
}

class PrefetchAnalytics {
  private static instance: PrefetchAnalytics;
  private metrics: PrefetchMetric[] = [];
  private navigationTimings: NavigationTiming[] = [];
  private maxMetrics = 100; // Keep last 100 metrics
  private perfObserver?: PerformanceObserver;

  static getInstance(): PrefetchAnalytics {
    if (!PrefetchAnalytics.instance) {
      PrefetchAnalytics.instance = new PrefetchAnalytics();
    }
    return PrefetchAnalytics.instance;
  }

  constructor() {
    this.initializePerformanceObserver();
    this.initializeNavigationListener();
  }

  private initializePerformanceObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      this.perfObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            this.recordNavigationTiming(entry as PerformanceNavigationTiming);
          }
        });
      });

      this.perfObserver.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.warn('[Prefetch Analytics] PerformanceObserver not supported:', error);
    }
  }

  private initializeNavigationListener() {
    if (typeof window === 'undefined') return;

    // Listen for route changes (Next.js specific)
    const handleRouteChange = (url: string) => {
      this.recordNavigation(url, true);
    };

    // Custom event for prefetch completion
    window.addEventListener('prefetch-complete', ((event: CustomEvent) => {
      const { route, success, duration, reason } = event.detail;
      this.recordPrefetch(route, success, duration, reason);
    }) as EventListener);

    // Store in window for Next.js integration
    (window as any).__prefetchAnalytics = this;
  }

  recordPrefetch(
    route: string,
    success: boolean,
    duration?: number,
    reason?: string,
    connectionType?: string
  ) {
    const metric: PrefetchMetric = {
      route,
      timestamp: Date.now(),
      prefetchTime: duration,
      cacheHit: false,
      connectionType,
      reason,
      error: success ? undefined : 'Prefetch failed',
    };

    this.addMetric(metric);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Prefetch Analytics] ${success ? '✅' : '❌'} ${route}`, {
        duration: duration ? `${duration}ms` : 'unknown',
        reason,
        connectionType,
      });
    }
  }

  recordNavigation(route: string, wasPrefetched: boolean, duration?: number) {
    const timing: NavigationTiming = {
      route,
      startTime: Date.now() - (duration || 0),
      endTime: Date.now(),
      duration: duration || 0,
      wasPrefetched,
    };

    this.navigationTimings.push(timing);

    // Keep only recent timings
    if (this.navigationTimings.length > this.maxMetrics) {
      this.navigationTimings = this.navigationTimings.slice(-this.maxMetrics);
    }

    // Update corresponding metric if exists
    const metric = this.metrics.find(m => m.route === route);
    if (metric) {
      metric.navigationTime = duration;
      metric.cacheHit = wasPrefetched;
    }

    // Log navigation performance
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Navigation Analytics] ${route}`, {
        duration: duration ? `${duration}ms` : 'unknown',
        prefetched: wasPrefetched ? '✅ (from cache)' : '❌ (fresh load)',
      });
    }
  }

  private recordNavigationTiming(entry: PerformanceNavigationTiming) {
    const route = entry.name;
    const duration = entry.loadEventEnd - entry.navigationStart;
    const wasPrefetched = entry.transferSize === 0; // Heuristic for cache hit

    this.recordNavigation(route, wasPrefetched, duration);
  }

  private addMetric(metric: PrefetchMetric) {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(): PrefetchMetric[] {
    return [...this.metrics];
  }

  getNavigationTimings(): NavigationTiming[] {
    return [...this.navigationTimings];
  }

  getAnalyticsSummary() {
    const totalPrefetches = this.metrics.length;
    const successfulPrefetches = this.metrics.filter(m => !m.error).length;
    const averagePrefetchTime = this.calculateAverage(
      this.metrics.map(m => m.prefetchTime).filter(Boolean) as number[]
    );

    const totalNavigations = this.navigationTimings.length;
    const prefetchedNavigations = this.navigationTimings.filter(n => n.wasPrefetched).length;
    const averageNavigationTime = this.calculateAverage(
      this.navigationTimings.map(n => n.duration)
    );

    const prefetchedAvgTime = this.calculateAverage(
      this.navigationTimings.filter(n => n.wasPrefetched).map(n => n.duration)
    );

    const nonPrefetchedAvgTime = this.calculateAverage(
      this.navigationTimings.filter(n => !n.wasPrefetched).map(n => n.duration)
    );

    return {
      prefetchMetrics: {
        total: totalPrefetches,
        successful: successfulPrefetches,
        successRate: totalPrefetches > 0 ? (successfulPrefetches / totalPrefetches) * 100 : 0,
        averagePrefetchTime: averagePrefetchTime,
      },
      navigationMetrics: {
        total: totalNavigations,
        prefetchedCount: prefetchedNavigations,
        prefetchHitRate: totalNavigations > 0 ? (prefetchedNavigations / totalNavigations) * 100 : 0,
        averageNavigationTime: averageNavigationTime,
        prefetchedAvgTime: prefetchedAvgTime,
        nonPrefetchedAvgTime: nonPrefetchedAvgTime,
        performanceGain: nonPrefetchedAvgTime > 0 && prefetchedAvgTime > 0
          ? ((nonPrefetchedAvgTime - prefetchedAvgTime) / nonPrefetchedAvgTime) * 100
          : 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  exportMetrics(): string {
    const summary = this.getAnalyticsSummary();
    const data = {
      summary,
      rawMetrics: this.metrics,
      rawTimings: this.navigationTimings,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  clearMetrics() {
    this.metrics = [];
    this.navigationTimings = [];
  }

  // P.45: Failed prefetch logging
  logFailedPrefetch(route: string, error: string, context?: any) {
    console.error(`[Prefetch Failed] ${route}:`, error, context);

    this.recordPrefetch(route, false, undefined, `Failed: ${error}`);

    // In production, you might want to send this to an analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to analytics service
      // analyticsService.track('prefetch_failed', { route, error, context });
    }
  }

  // P.45: Prefetch timing tracking
  trackPrefetchTiming(route: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordPrefetch(route, true, duration, 'Manual timing');
    };
  }
}

// Export singleton instance
export const prefetchAnalytics = PrefetchAnalytics.getInstance();

// Helper hook for React components
export function usePrefetchAnalytics() {
  return {
    recordPrefetch: prefetchAnalytics.recordPrefetch.bind(prefetchAnalytics),
    recordNavigation: prefetchAnalytics.recordNavigation.bind(prefetchAnalytics),
    getMetrics: prefetchAnalytics.getMetrics.bind(prefetchAnalytics),
    getSummary: prefetchAnalytics.getAnalyticsSummary.bind(prefetchAnalytics),
    exportMetrics: prefetchAnalytics.exportMetrics.bind(prefetchAnalytics),
    logFailedPrefetch: prefetchAnalytics.logFailedPrefetch.bind(prefetchAnalytics),
    trackTiming: prefetchAnalytics.trackPrefetchTiming.bind(prefetchAnalytics),
  };
}

// Utility to manually trigger prefetch analytics events
export function emitPrefetchEvent(route: string, success: boolean, duration?: number, reason?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('prefetch-complete', {
      detail: { route, success, duration, reason }
    }));
  }
}