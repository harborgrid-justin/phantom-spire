/**
 * Page Performance Monitor
 * Real-time performance monitoring for GUI pages
 */

import { PerformanceMonitor } from '../../../utils/serviceUtils';

export interface IPageLoadMetrics {
  pageId: string;
  loadTime: number;
  domContentLoadTime: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
  resourceLoadTime: number;
  networkLatency: number;
  renderTime: number;
  timestamp: Date;
  url: string;
  userAgent: string;
}

export interface IFeatureAvailabilityReport {
  pageId: string;
  expectedFeatures: string[];
  availableFeatures: string[];
  missingFeatures: string[];
  availabilityScore: number;
  timestamp: Date;
  details: Record<string, boolean>;
}

export class PagePerformanceMonitor {
  private static instance: PagePerformanceMonitor;
  private performanceData: Map<string, IPageLoadMetrics[]> = new Map();
  private featureReports: Map<string, IFeatureAvailabilityReport[]> = new Map();

  static getInstance(): PagePerformanceMonitor {
    if (!PagePerformanceMonitor.instance) {
      PagePerformanceMonitor.instance = new PagePerformanceMonitor();
    }
    return PagePerformanceMonitor.instance;
  }

  /**
   * Monitor page load performance
   */
  async monitorPageLoad(pageId: string): Promise<IPageLoadMetrics> {
    const measurement = PerformanceMonitor.startMeasurement(
      `page-load-${pageId}`
    );

    const metrics: IPageLoadMetrics = {
      pageId,
      loadTime: this.measurePageLoadTime(),
      domContentLoadTime: this.measureDOMContentLoadTime(),
      firstContentfulPaint: this.measureFirstContentfulPaint(),
      timeToInteractive: this.measureTimeToInteractive(),
      resourceLoadTime: this.measureResourceLoadTime(),
      networkLatency: this.measureNetworkLatency(),
      renderTime: this.measureRenderTime(),
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    };

    // Store metrics
    if (!this.performanceData.has(pageId)) {
      this.performanceData.set(pageId, []);
    }
    this.performanceData.get(pageId)!.push(metrics);

    measurement.end();
    return metrics;
  }

  /**
   * Check feature availability for a page
   */
  async checkFeatureAvailability(
    pageId: string,
    element?: HTMLElement
  ): Promise<IFeatureAvailabilityReport> {
    const expectedFeatures = this.getExpectedFeatures(pageId);
    const availableFeatures = await this.scanAvailableFeatures(
      element || document.body
    );
    const missingFeatures = expectedFeatures.filter(
      feature => !availableFeatures.includes(feature)
    );

    const availabilityScore =
      expectedFeatures.length > 0
        ? ((expectedFeatures.length - missingFeatures.length) /
            expectedFeatures.length) *
          100
        : 100;

    const details: Record<string, boolean> = {};
    expectedFeatures.forEach(feature => {
      details[feature] = availableFeatures.includes(feature);
    });

    const report: IFeatureAvailabilityReport = {
      pageId,
      expectedFeatures,
      availableFeatures,
      missingFeatures,
      availabilityScore,
      timestamp: new Date(),
      details,
    };

    // Store report
    if (!this.featureReports.has(pageId)) {
      this.featureReports.set(pageId, []);
    }
    this.featureReports.get(pageId)!.push(report);

    return report;
  }

  /**
   * Get performance statistics for a page
   */
  getPerformanceStats(pageId: string): {
    averageLoadTime: number;
    averageFCP: number;
    averageTTI: number;
    measurements: number;
    trend: 'improving' | 'degrading' | 'stable';
  } {
    const data = this.performanceData.get(pageId) || [];
    if (data.length === 0) {
      return {
        averageLoadTime: 0,
        averageFCP: 0,
        averageTTI: 0,
        measurements: 0,
        trend: 'stable',
      };
    }

    const averageLoadTime =
      data.reduce((sum, d) => sum + d.loadTime, 0) / data.length;
    const averageFCP =
      data.reduce((sum, d) => sum + d.firstContentfulPaint, 0) / data.length;
    const averageTTI =
      data.reduce((sum, d) => sum + d.timeToInteractive, 0) / data.length;

    // Calculate trend based on recent measurements
    let trend: 'improving' | 'degrading' | 'stable' = 'stable';
    if (data.length >= 3) {
      const recent = data.slice(-3);
      const older = data.slice(-6, -3);
      if (older.length > 0) {
        const recentAvg =
          recent.reduce((sum, d) => sum + d.loadTime, 0) / recent.length;
        const olderAvg =
          older.reduce((sum, d) => sum + d.loadTime, 0) / older.length;
        const improvement = ((olderAvg - recentAvg) / olderAvg) * 100;

        if (improvement > 5) trend = 'improving';
        else if (improvement < -5) trend = 'degrading';
      }
    }

    return {
      averageLoadTime,
      averageFCP,
      averageTTI,
      measurements: data.length,
      trend,
    };
  }

  /**
   * Get latest feature availability report for a page
   */
  getLatestFeatureReport(pageId: string): IFeatureAvailabilityReport | null {
    const reports = this.featureReports.get(pageId) || [];
    return reports.length > 0 ? reports[reports.length - 1] : null;
  }

  /**
   * Get comprehensive page report
   */
  getPageReport(pageId: string) {
    const performanceStats = this.getPerformanceStats(pageId);
    const featureReport = this.getLatestFeatureReport(pageId);
    const recentMetrics =
      this.performanceData.get(pageId)?.slice(-1)[0] || null;

    return {
      pageId,
      timestamp: new Date(),
      performance: {
        ...performanceStats,
        latest: recentMetrics,
      },
      features: featureReport,
      overallHealth: this.calculateOverallHealth(
        performanceStats,
        featureReport
      ),
    };
  }

  /**
   * Clear old data to prevent memory leaks
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoffTime = Date.now() - maxAge;

    for (const [pageId, data] of this.performanceData.entries()) {
      const filtered = data.filter(d => d.timestamp.getTime() > cutoffTime);
      if (filtered.length === 0) {
        this.performanceData.delete(pageId);
      } else {
        this.performanceData.set(pageId, filtered);
      }
    }

    for (const [pageId, reports] of this.featureReports.entries()) {
      const filtered = reports.filter(r => r.timestamp.getTime() > cutoffTime);
      if (filtered.length === 0) {
        this.featureReports.delete(pageId);
      } else {
        this.featureReports.set(pageId, filtered);
      }
    }
  }

  // Private measurement methods
  private measurePageLoadTime(): number {
    if (typeof window === 'undefined' || !window.performance?.timing) {
      return 2000;
    }

    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    return loadTime > 0 ? loadTime : 2000;
  }

  private measureDOMContentLoadTime(): number {
    if (typeof window === 'undefined' || !window.performance?.timing) {
      return 1500;
    }

    const timing = window.performance.timing;
    const domLoadTime =
      timing.domContentLoadedEventEnd - timing.navigationStart;
    return domLoadTime > 0 ? domLoadTime : 1500;
  }

  private measureFirstContentfulPaint(): number {
    if (typeof window === 'undefined' || !window.performance) {
      return 1200;
    }

    try {
      const paintEntries = window.performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(
        entry => entry.name === 'first-contentful-paint'
      );
      return fcpEntry ? fcpEntry.startTime : 1200;
    } catch (error) {
      return 1200;
    }
  }

  private measureTimeToInteractive(): number {
    if (typeof window === 'undefined' || !window.performance) {
      return 2500;
    }

    // Estimate TTI as load time + buffer
    const loadTime = this.measurePageLoadTime();
    return Math.max(loadTime * 1.3, 2000);
  }

  private measureResourceLoadTime(): number {
    if (typeof window === 'undefined' || !window.performance) {
      return 3000;
    }

    try {
      const resources = window.performance.getEntriesByType('resource');
      if (resources.length === 0) return 3000;

      const totalResourceTime = resources.reduce((total, resource) => {
        const resourceEntry = resource as PerformanceResourceTiming;
        return total + (resourceEntry.responseEnd - resourceEntry.startTime);
      }, 0);

      return totalResourceTime / resources.length;
    } catch (error) {
      return 3000;
    }
  }

  private measureNetworkLatency(): number {
    if (typeof window === 'undefined' || !window.performance?.timing) {
      return 100;
    }

    const timing = window.performance.timing;
    const latency = timing.responseStart - timing.requestStart;
    return latency > 0 ? latency : 100;
  }

  private measureRenderTime(): number {
    if (typeof window === 'undefined' || !window.performance?.timing) {
      return 800;
    }

    const timing = window.performance.timing;
    const renderTime = timing.domComplete - timing.domLoading;
    return renderTime > 0 ? renderTime : 800;
  }

  private getExpectedFeatures(pageId: string): string[] {
    const featureSets: Record<string, string[]> = {
      dashboard: [
        'data-visualization',
        'filters',
        'search',
        'export',
        'refresh',
        'notifications',
        'user-menu',
        'settings',
        'help',
        'navigation',
      ],
      analytics: [
        'charts',
        'reports',
        'data-grid',
        'filters',
        'export',
        'scheduling',
        'customization',
        'sharing',
        'drill-down',
        'time-range',
      ],
      admin: [
        'user-management',
        'settings',
        'system-health',
        'monitoring',
        'configurations',
        'backup',
        'security',
        'audit-logs',
      ],
      workflow: [
        'drag-drop',
        'canvas',
        'toolbar',
        'properties-panel',
        'save',
        'validation',
        'export',
        'templates',
        'collaboration',
      ],
      incident: [
        'incident-list',
        'create-incident',
        'timeline',
        'assignments',
        'status-updates',
        'communications',
        'escalation',
        'reporting',
      ],
      'threat-intelligence': [
        'threat-feed',
        'indicators',
        'analysis',
        'correlation',
        'timeline',
        'attribution',
        'sharing',
        'validation',
      ],
    };

    // Try to match pageId with known patterns
    for (const [pattern, features] of Object.entries(featureSets)) {
      if (pageId.toLowerCase().includes(pattern)) {
        return features;
      }
    }

    // Default expected features
    return [
      'navigation',
      'search',
      'filters',
      'export',
      'help',
      'settings',
      'loading-indicators',
      'error-handling',
    ];
  }

  private async scanAvailableFeatures(element: HTMLElement): Promise<string[]> {
    const features: string[] = [];

    const selectors = {
      'data-visualization': 'canvas, svg, .chart, .graph, .visualization',
      'data-grid': 'table, .data-grid, .grid, [role="grid"]',
      filters: '.filter, .filters, select, [role="combobox"]',
      search: 'input[type="search"], .search, [placeholder*="search" i]',
      export: 'button[title*="export" i], .export, [aria-label*="export" i]',
      refresh:
        'button[title*="refresh" i], .refresh, [aria-label*="refresh" i]',
      notifications: '.notification, .alert, .toast, [role="alert"]',
      'user-menu': '.user-menu, .profile, .avatar',
      settings:
        'button[title*="setting" i], .settings, [aria-label*="setting" i]',
      help: 'button[title*="help" i], .help, [aria-label*="help" i]',
      navigation: 'nav, .navigation, .nav, [role="navigation"]',
      charts: 'canvas, svg, .chart, .recharts',
      reports: '.report, .reports, .report-template',
      scheduling: '.schedule, .scheduler, [title*="schedule" i]',
      customization: '.customize, .config, .preferences',
      sharing: 'button[title*="share" i], .share, [aria-label*="share" i]',
      'drill-down': '[title*="drill" i], .drill-down, .expand',
      'time-range': '.time-range, .date-picker, input[type="date"]',
      'user-management': '.user-management, .users, .user-list',
      'system-health': '.health, .status, .monitoring',
      monitoring: '.monitor, .metrics, .dashboard',
      configurations: '.config, .configuration, .settings',
      backup: 'button[title*="backup" i], .backup',
      security: '.security, .permissions, .access',
      'audit-logs': '.audit, .logs, .history',
      'drag-drop': '[draggable="true"], .draggable, .droppable',
      canvas: 'canvas, .canvas, .workspace',
      toolbar: '.toolbar, .tools, .action-bar',
      'properties-panel': '.properties, .panel, .inspector',
      save: 'button[title*="save" i], .save, [aria-label*="save" i]',
      validation: '.error, .warning, .validation, [aria-invalid]',
      templates: '.template, .templates, .preset',
      collaboration: '.collaborate, .share, .team',
      'incident-list': '.incident-list, .incidents, .cases',
      'create-incident': 'button[title*="create" i], .create, .new',
      timeline: '.timeline, .history, .sequence',
      assignments: '.assign, .assignment, .owner',
      'status-updates': '.status, .update, .progress',
      communications: '.comment, .message, .communication',
      escalation: '.escalate, .priority, .urgent',
      reporting: '.report, .reports, .analytics',
      'threat-feed': '.feed, .threats, .intelligence',
      indicators: '.indicator, .ioc, .observable',
      analysis: '.analysis, .analyze, .investigation',
      correlation: '.correlation, .relate, .connection',
      attribution: '.attribution, .actor, .campaign',
      'loading-indicators': '.loading, .spinner, .progress',
      'error-handling': '.error, .warning, .alert',
    };

    for (const [feature, selector] of Object.entries(selectors)) {
      try {
        const elements = element.querySelectorAll(selector);
        if (elements.length > 0) {
          features.push(feature);
        }
      } catch (error) {
        continue;
      }
    }

    return features;
  }

  private calculateOverallHealth(
    performanceStats: ReturnType<PagePerformanceMonitor['getPerformanceStats']>,
    featureReport: IFeatureAvailabilityReport | null
  ): {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // Performance scoring
    if (performanceStats.averageLoadTime > 3000) {
      score -= 20;
      issues.push('Slow page load time');
    } else if (performanceStats.averageLoadTime > 2000) {
      score -= 10;
    }

    if (performanceStats.averageFCP > 1800) {
      score -= 15;
      issues.push('Slow First Contentful Paint');
    }

    if (performanceStats.trend === 'degrading') {
      score -= 10;
      issues.push('Performance trending downward');
    }

    // Feature availability scoring
    if (featureReport) {
      if (featureReport.availabilityScore < 80) {
        score -= 20;
        issues.push(
          `Missing features: ${featureReport.missingFeatures.join(', ')}`
        );
      } else if (featureReport.availabilityScore < 90) {
        score -= 10;
      }
    }

    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 90) status = 'excellent';
    else if (score >= 75) status = 'good';
    else if (score >= 60) status = 'fair';
    else status = 'poor';

    return { score, status, issues };
  }
}

export default PagePerformanceMonitor;
