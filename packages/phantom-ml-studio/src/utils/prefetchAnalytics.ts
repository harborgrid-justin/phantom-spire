'use client';

interface PrefetchEvent {
  url: string;
  timestamp: number;
  eventType: 'prefetch_start' | 'prefetch_success' | 'prefetch_error' | 'navigation_hit' | 'navigation_miss';
  payloadSize?: number;
  connectionType?: string;
  reason?: string;
  duration?: number;
}

interface PrefetchMetrics {
  totalPrefetches: number;
  successfulPrefetches: number;
  failedPrefetches: number;
  cacheHits: number;
  cacheMisses: number;
  totalPayloadSize: number;
  averagePayloadSize: number;
  connectionTypes: Record<string, number>;
  topPrefetchedRoutes: Array<{ url: string; count: number }>;
}

class PrefetchAnalytics {
  private events: PrefetchEvent[] = [];
  private isEnabled: boolean;
  private maxEvents = 1000; // Limit memory usage

  constructor() {
    // Only enable in development or when explicitly enabled
    this.isEnabled = process.env.NODE_ENV === 'development' ||
                    localStorage.getItem('prefetch-analytics') === 'true';

    if (this.isEnabled) {
      this.setupNetworkMonitoring();
      this.setupNavigationMonitoring();
    }
  }

  private setupNetworkMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor resource loading for prefetch detection
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
          this.handleResourceEntry(entry);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    } catch (error) {
      console.warn('Performance Observer not supported for prefetch analytics:', error);
    }
  }

  private setupNavigationMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor page navigation to detect cache hits/misses
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      this.handleNavigation(args[2] as string);
      return originalPushState.apply(history, args);
    };

    history.replaceState = (...args) => {
      this.handleNavigation(args[2] as string);
      return originalReplaceState.apply(history, args);
    };

    window.addEventListener('popstate', (event) => {
      this.handleNavigation(window.location.href);
    });
  }

  private handleResourceEntry(entry: PerformanceEntry) {
    const resourceEntry = entry as PerformanceResourceTiming;

    // Detect potential prefetch resources
    if (this.isPrefetchResource(resourceEntry)) {
      this.recordEvent({
        url: resourceEntry.name,
        timestamp: Date.now(),
        eventType: resourceEntry.transferSize > 0 ? 'prefetch_success' : 'prefetch_error',
        payloadSize: resourceEntry.transferSize,
        duration: resourceEntry.responseEnd - resourceEntry.requestStart,
        connectionType: this.getConnectionType(),
      });
    }
  }

  private isPrefetchResource(entry: PerformanceResourceTiming): boolean {
    // Heuristics to detect prefetch requests
    const name = entry.name.toLowerCase();

    // Check for Next.js prefetch patterns
    if (name.includes('_next/static/') || name.includes('/_next/data/')) {
      return true;
    }

    // Check for very quick resource loads (likely cached/prefetched)
    const loadTime = entry.responseEnd - entry.requestStart;
    if (loadTime < 50 && entry.transferSize > 0) {
      return true;
    }

    return false;
  }

  private handleNavigation(url: string) {
    const normalizedUrl = this.normalizeUrl(url);

    // Check if this navigation was prefetched
    const recentPrefetch = this.events
      .filter(e => e.eventType === 'prefetch_success')
      .find(e => this.normalizeUrl(e.url) === normalizedUrl);

    this.recordEvent({
      url: normalizedUrl,
      timestamp: Date.now(),
      eventType: recentPrefetch ? 'navigation_hit' : 'navigation_miss',
      connectionType: this.getConnectionType(),
    });
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname;
    } catch {
      return url;
    }
  }

  private getConnectionType(): string {
    if ('connection' in navigator) {
      const connection = (navigator as Record<string, unknown>).connection;
      return connection?.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  public recordEvent(event: PrefetchEvent) {
    if (!this.isEnabled) return;

    this.events.push(event);

    // Limit memory usage
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Prefetch Analytics:', event);
    }
  }

  public recordPrefetchDecision(url: string, enabled: boolean, reason: string) {
    this.recordEvent({
      url,
      timestamp: Date.now(),
      eventType: enabled ? 'prefetch_start' : 'prefetch_error',
      reason,
      connectionType: this.getConnectionType(),
    });
  }

  public getMetrics(): PrefetchMetrics {
    const events = this.events;

    const prefetchEvents = events.filter(e =>
      e.eventType === 'prefetch_start' || e.eventType === 'prefetch_success'
    );
    const successfulPrefetches = events.filter(e => e.eventType === 'prefetch_success');
    const failedPrefetches = events.filter(e => e.eventType === 'prefetch_error');
    const cacheHits = events.filter(e => e.eventType === 'navigation_hit');
    const cacheMisses = events.filter(e => e.eventType === 'navigation_miss');

    const payloadSizes = successfulPrefetches
      .map(e => e.payloadSize || 0)
      .filter(size => size > 0);

    const totalPayloadSize = payloadSizes.reduce((sum, size) => sum + size, 0);
    const averagePayloadSize = payloadSizes.length > 0 ? totalPayloadSize / payloadSizes.length : 0;

    // Count connection types
    const connectionTypes: Record<string, number> = {};
    events.forEach(event => {
      if (event.connectionType) {
        connectionTypes[event.connectionType] = (connectionTypes[event.connectionType] || 0) + 1;
      }
    });

    // Top prefetched routes
    const routeCounts: Record<string, number> = {};
    prefetchEvents.forEach(event => {
      routeCounts[event.url] = (routeCounts[event.url] || 0) + 1;
    });

    const topPrefetchedRoutes = Object.entries(routeCounts)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalPrefetches: prefetchEvents.length,
      successfulPrefetches: successfulPrefetches.length,
      failedPrefetches: failedPrefetches.length,
      cacheHits: cacheHits.length,
      cacheMisses: cacheMisses.length,
      totalPayloadSize,
      averagePayloadSize: Math.round(averagePayloadSize),
      connectionTypes,
      topPrefetchedRoutes,
    };
  }

  public exportData(): string {
    return JSON.stringify({
      events: this.events,
      metrics: this.getMetrics(),
      timestamp: Date.now(),
    }, null, 2);
  }

  public clearData() {
    this.events = [];
  }

  public enable() {
    this.isEnabled = true;
    localStorage.setItem('prefetch-analytics', 'true');
  }

  public disable() {
    this.isEnabled = false;
    localStorage.removeItem('prefetch-analytics');
  }
}

// Global instance
const prefetchAnalytics = new PrefetchAnalytics();

// Export for use in components
export { prefetchAnalytics, type PrefetchMetrics, type PrefetchEvent };

// Development helper functions
if (process.env.NODE_ENV === 'development') {
  // Make analytics available in browser console
  (window as Record<string, unknown>).prefetchAnalytics = prefetchAnalytics;
}