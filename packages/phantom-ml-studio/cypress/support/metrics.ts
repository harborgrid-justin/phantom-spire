/**
 * Performance metrics collection for Cypress tests
 */

interface TestMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  testName?: string;
  testFile?: string;
  browser?: string;
  viewport?: { width: number; height: number };
}

class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: TestMetric[] = [];
  private testStartTime: number = 0;

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  startTest(testName: string, testFile: string): void {
    this.testStartTime = Date.now();
    this.addMetric({
      name: 'test-start',
      value: 1,
      unit: 'count',
      timestamp: this.testStartTime,
      testName,
      testFile,
    });
  }

  endTest(testName: string, testFile: string, passed: boolean): void {
    const duration = Date.now() - this.testStartTime;
    this.addMetric({
      name: 'test-duration',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      testName,
      testFile,
      metadata: { passed },
    } as any);
  }

  addMetric(metric: TestMetric): void {
    // Add browser and viewport info
    if (typeof window !== 'undefined' && window.Cypress) {
      metric.browser = (Cypress as any).browser?.name;
      metric.viewport = {
        width: (Cypress as any).config('viewportWidth'),
        height: (Cypress as any).config('viewportHeight'),
      };
    }

    this.metrics.push(metric);
  }

  trackPageLoad(pageName: string, loadTime: number): void {
    this.addMetric({
      name: `page-load:${pageName}`,
      value: loadTime,
      unit: 'ms',
      timestamp: Date.now(),
    });
  }

  trackApiCall(endpoint: string, duration: number, status: number): void {
    this.addMetric({
      name: `api:${endpoint}`,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: { status },
    } as any);
  }

  trackCustom(name: string, value: number, unit: string = 'ms'): void {
    this.addMetric({
      name,
      value,
      unit,
      timestamp: Date.now(),
    });
  }

  getMetrics(): TestMetric[] {
    return this.metrics;
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  async saveToFile(filename: string): Promise<void> {
    const data = JSON.stringify(this.metrics, null, 2);
    // In a real implementation, this would save to file system
    console.log(`Saving metrics to ${filename}`, data);
  }
}

export const metricsCollector = MetricsCollector.getInstance();

/**
 * Save metrics to storage
 */
export async function saveMetrics(metrics: any): Promise<boolean> {
  try {
    metricsCollector.addMetric(metrics);
    await metricsCollector.saveToFile(`cypress/results/metrics-${Date.now()}.json`);
    return true;
  } catch (error) {
    console.error('Failed to save metrics:', error);
    return false;
  }
}

/**
 * Cypress command to track metrics
 */
if (typeof Cypress !== 'undefined') {
  Cypress.Commands.add('trackMetric', (name: string, value: number, unit?: string) => {
    metricsCollector.trackCustom(name, value, unit);
  });

  Cypress.Commands.add('trackPageLoad', (pageName: string) => {
    const startTime = performance.now();
    cy.window().then(() => {
      const loadTime = performance.now() - startTime;
      metricsCollector.trackPageLoad(pageName, loadTime);
    });
  });

  // Hook into test lifecycle
  beforeEach(function() {
    const testName = this.currentTest?.title || 'unknown';
    const testFile = this.currentTest?.file || 'unknown';
    metricsCollector.startTest(testName, testFile);
  });

  afterEach(function() {
    const testName = this.currentTest?.title || 'unknown';
    const testFile = this.currentTest?.file || 'unknown';
    const passed = this.currentTest?.state === 'passed';
    metricsCollector.endTest(testName, testFile, passed);
  });
}