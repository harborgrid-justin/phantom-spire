// Performance monitoring utilities
interface PerformanceMetrics {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface UserInteraction {
  type: 'click' | 'navigation' | 'error' | 'performance';
  element?: string;
  duration?: number;
  path?: string;
  error?: string;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private interactions: UserInteraction[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';
    
    if (this.isEnabled) {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring() {
    // Monitor Web Vitals
    this.observeWebVitals();
    
    // Monitor resource loading
    this.observeResourceTiming();
    
    // Monitor user interactions
    this.observeUserInteractions();
    
    // Monitor route changes
    this.observeRouteChanges();
    
    // Send metrics periodically
    this.startMetricsReporting();
  }

  private observeWebVitals() {
    // First Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          name: 'FCP',
          value: entry.startTime,
          timestamp: Date.now(),
        });
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric({
        name: 'LCP',
        value: lastEntry.startTime,
        timestamp: Date.now(),
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const firstInputEntry = entry as any; // PerformanceEventTiming not fully typed
        this.recordMetric({
          name: 'FID',
          value: firstInputEntry.processingStart - firstInputEntry.startTime,
          timestamp: Date.now(),
        });
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as any; // PerformanceLayoutShift not fully typed
        if (!layoutShiftEntry.hadRecentInput) {
          this.recordMetric({
            name: 'CLS',
            value: layoutShiftEntry.value,
            timestamp: Date.now(),
          });
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private observeResourceTiming() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        this.recordMetric({
          name: 'resource-load',
          value: resource.duration,
          timestamp: Date.now(),
          metadata: {
            name: resource.name,
            type: resource.initiatorType,
            size: resource.transferSize,
          },
        });
      }
    }).observe({ entryTypes: ['resource'] });
  }

  private observeUserInteractions() {
    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.recordInteraction({
        type: 'click',
        element: this.getElementSelector(target),
        timestamp: Date.now(),
      });
    });

    // Error tracking
    window.addEventListener('error', (event) => {
      this.recordInteraction({
        type: 'error',
        error: event.error?.message || event.message,
        timestamp: Date.now(),
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordInteraction({
        type: 'error',
        error: event.reason?.message || 'Unhandled promise rejection',
        timestamp: Date.now(),
      });
    });
  }

  private observeRouteChanges() {
    let currentPath = window.location.pathname;
    
    const trackRouteChange = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        this.recordInteraction({
          type: 'navigation',
          path: newPath,
          timestamp: Date.now(),
        });
        currentPath = newPath;
      }
    };

    // Listen for history changes
    window.addEventListener('popstate', trackRouteChange);
    
    // Override pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      trackRouteChange();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      trackRouteChange();
    };
  }

  private startMetricsReporting() {
    // Send metrics every 30 seconds
    setInterval(() => {
      this.sendMetrics();
    }, 30000);

    // Send metrics on page unload
    window.addEventListener('beforeunload', () => {
      this.sendMetrics(true);
    });
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  public recordMetric(metric: PerformanceMetrics) {
    if (!this.isEnabled) return;
    
    this.metrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  public recordInteraction(interaction: UserInteraction) {
    if (!this.isEnabled) return;
    
    this.interactions.push(interaction);
    
    // Keep only last 50 interactions
    if (this.interactions.length > 50) {
      this.interactions = this.interactions.slice(-50);
    }
  }

  public measureComponentRender<T>(
    componentName: string,
    renderFn: () => T
  ): T {
    if (!this.isEnabled) return renderFn();
    
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    
    this.recordMetric({
      name: 'component-render',
      value: endTime - startTime,
      timestamp: Date.now(),
      metadata: { component: componentName },
    });
    
    return result;
  }

  public measureApiCall<T>(
    apiName: string,
    apiFn: () => Promise<T>
  ): Promise<T> {
    if (!this.isEnabled) return apiFn();
    
    const startTime = performance.now();
    
    return apiFn()
      .then((result) => {
        const endTime = performance.now();
        this.recordMetric({
          name: 'api-call',
          value: endTime - startTime,
          timestamp: Date.now(),
          metadata: { api: apiName, status: 'success' },
        });
        return result;
      })
      .catch((error) => {
        const endTime = performance.now();
        this.recordMetric({
          name: 'api-call',
          value: endTime - startTime,
          timestamp: Date.now(),
          metadata: { api: apiName, status: 'error', error: error.message },
        });
        throw error;
      });
  }

  private async sendMetrics(isBeaconSend = false) {
    if (!this.metrics.length && !this.interactions.length) return;

    const payload = {
      metrics: [...this.metrics],
      interactions: [...this.interactions],
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
    };

    try {
      if (isBeaconSend && navigator.sendBeacon) {
        // Use sendBeacon for reliable delivery during page unload
        navigator.sendBeacon(
          import.meta.env.VITE_ANALYTICS_ENDPOINT || '/api/analytics',
          JSON.stringify(payload)
        );
      } else {
        await fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT || '/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }
      
      // Clear sent metrics
      this.metrics = [];
      this.interactions = [];
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('performanceSessionId');
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36);
      sessionStorage.setItem('performanceSessionId', sessionId);
    }
    return sessionId;
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public getInteractions(): UserInteraction[] {
    return [...this.interactions];
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
export type { PerformanceMetrics, UserInteraction };