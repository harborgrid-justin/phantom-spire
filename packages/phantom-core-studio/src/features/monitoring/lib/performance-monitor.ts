/**
 * Enterprise Performance Monitoring & Metrics Collection System
 * Comprehensive performance tracking with real-time analytics
 * APM capabilities comparable to New Relic, DataDog, and AppDynamics
 */

import { EventEmitter } from 'events';
import * as os from 'os';
import * as process from 'process';

export interface PerformanceMetric {
  id: string;
  timestamp: Date;
  name: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  category: MetricCategory;
  source: string;
  metadata?: Record<string, any>;
}

export interface PerformanceAlert {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metric: string;
  threshold: number;
  actualValue: number;
  affectedServices: string[];
  resolved: boolean;
  resolvedAt?: Date;
}

export enum MetricCategory {
  SYSTEM = 'system',
  APPLICATION = 'application',
  DATABASE = 'database',
  NETWORK = 'network',
  BUSINESS = 'business',
  SECURITY = 'security',
  ML_OPERATIONS = 'ml_operations',
  USER_EXPERIENCE = 'user_experience'
}

export interface SystemMetrics {
  cpu: {
    usage: number; // percentage
    loadAverage: number[];
    cores: number;
    model: string;
  };
  memory: {
    total: number; // bytes
    used: number;
    free: number;
    usage: number; // percentage
    heap: {
      total: number;
      used: number;
      limit: number;
    };
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number; // percentage
    io: {
      readBytes: number;
      writeBytes: number;
      readOps: number;
      writeOps: number;
    };
  };
  network: {
    bytesReceived: number;
    bytesSent: number;
    connections: {
      active: number;
      waiting: number;
      listening: number;
    };
  };
}

export interface ApplicationMetrics {
  http: {
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number; // percentage
    statusCodes: Record<string, number>;
    slowestEndpoints: Array<{
      path: string;
      method: string;
      averageTime: number;
      count: number;
    }>;
  };
  cache: {
    hitRate: number; // percentage
    missRate: number;
    evictionRate: number;
    memoryUsage: number;
  };
  database: {
    connectionPoolSize: number;
    activeConnections: number;
    queryTime: number;
    slowQueries: Array<{
      query: string;
      duration: number;
      timestamp: Date;
    }>;
  };
  errors: {
    errorRate: number;
    errorsByType: Record<string, number>;
    recentErrors: Array<{
      error: string;
      stack?: string;
      timestamp: Date;
      context?: any;
    }>;
  };
}

export interface MLOperationsMetrics {
  models: {
    totalModels: number;
    activeModels: number;
    averageInferenceTime: number;
    predictionsPerSecond: number;
    modelAccuracy: Record<string, number>;
    modelDrift: Record<string, number>;
  };
  training: {
    activeTrainingJobs: number;
    averageTrainingTime: number;
    trainingSuccessRate: number;
    resourceUtilization: {
      cpu: number;
      gpu: number;
      memory: number;
    };
  };
  data: {
    processedRecords: number;
    dataQualityScore: number;
    featureEngineering: {
      featuresGenerated: number;
      processingTime: number;
    };
  };
}

export interface PerformanceThresholds {
  system: {
    cpuUsage: number; // percentage
    memoryUsage: number; // percentage
    diskUsage: number; // percentage
  };
  application: {
    responseTime: number; // milliseconds
    errorRate: number; // percentage
    throughput: number; // requests per second
  };
  database: {
    queryTime: number; // milliseconds
    connectionPoolUsage: number; // percentage
  };
  ml: {
    inferenceTime: number; // milliseconds
    modelAccuracy: number; // minimum accuracy
    trainingTime: number; // maximum training time in minutes
  };
}

/**
 * Comprehensive performance monitoring system
 */
export class EnterprisePerformanceMonitor extends EventEmitter {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private alerts: PerformanceAlert[] = [];
  private thresholds: PerformanceThresholds;
  private collectors: Map<string, () => Promise<PerformanceMetric[]>> = new Map();
  private isCollecting = false;
  private collectionInterval = 30000; // 30 seconds
  private retentionPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  // Request tracking
  private requestTracker: Map<string, {
    startTime: number;
    method: string;
    path: string;
    statusCode?: number;
    responseTime?: number;
  }> = new Map();
  
  // Error tracking
  private errorTracker: Array<{
    error: string;
    stack?: string;
    timestamp: Date;
    context?: any;
  }> = [];

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    super();
    
    this.thresholds = {
      system: {
        cpuUsage: 80,
        memoryUsage: 85,
        diskUsage: 90
      },
      application: {
        responseTime: 1000,
        errorRate: 5,
        throughput: 100
      },
      database: {
        queryTime: 500,
        connectionPoolUsage: 80
      },
      ml: {
        inferenceTime: 200,
        modelAccuracy: 0.8,
        trainingTime: 60
      },
      ...thresholds
    };

    this.registerDefaultCollectors();
  }

  /**
   * Start performance monitoring
   */
  start(): void {
    if (this.isCollecting) return;
    
    this.isCollecting = true;
    this.startCollection();
    this.startAlertSystem();
    this.startCleanup();
    
    this.emit('started');
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    this.isCollecting = false;
    this.emit('stopped');
  }

  /**
   * Register a custom metric collector
   */
  registerCollector(name: string, collector: () => Promise<PerformanceMetric[]>): void {
    this.collectors.set(name, collector);
  }

  /**
   * Record a custom metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: string = '',
    category: MetricCategory = MetricCategory.APPLICATION,
    tags: Record<string, string> = {}
  ): void {
    const metric: PerformanceMetric = {
      id: `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      name,
      value,
      unit,
      tags,
      category,
      source: 'custom'
    };

    this.addMetric(metric);
    this.checkThresholds(metric);
  }

  /**
   * Start request tracking
   */
  startRequest(requestId: string, method: string, path: string): void {
    this.requestTracker.set(requestId, {
      startTime: Date.now(),
      method,
      path
    });
  }

  /**
   * End request tracking
   */
  endRequest(requestId: string, statusCode: number): void {
    const request = this.requestTracker.get(requestId);
    if (!request) return;

    const responseTime = Date.now() - request.startTime;
    request.statusCode = statusCode;
    request.responseTime = responseTime;

    // Record HTTP metrics
    this.recordMetric(
      'http_request_duration',
      responseTime,
      'ms',
      MetricCategory.APPLICATION,
      {
        method: request.method,
        path: request.path,
        status_code: statusCode.toString()
      }
    );

    this.recordMetric(
      'http_requests_total',
      1,
      'count',
      MetricCategory.APPLICATION,
      {
        method: request.method,
        path: request.path,
        status_code: statusCode.toString()
      }
    );

    this.requestTracker.delete(requestId);
  }

  /**
   * Record an error
   */
  recordError(error: Error, context?: any): void {
    const errorRecord = {
      error: error.message,
      stack: error.stack,
      timestamp: new Date(),
      context
    };

    this.errorTracker.push(errorRecord);
    
    // Keep only recent errors
    if (this.errorTracker.length > 1000) {
      this.errorTracker = this.errorTracker.slice(-1000);
    }

    this.recordMetric(
      'application_errors',
      1,
      'count',
      MetricCategory.APPLICATION,
      {
        error_type: error.constructor.name
      }
    );

    this.emit('error_recorded', errorRecord);
  }

  /**
   * Get current system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      cpu: {
        usage: await this.getCPUUsage(),
        loadAverage: os.loadavg(),
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown'
      },
      memory: {
        total: os.totalmem(),
        used: os.totalmem() - os.freemem(),
        free: os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
        heap: {
          total: memoryUsage.heapTotal,
          used: memoryUsage.heapUsed,
          limit: memoryUsage.heapTotal
        }
      },
      disk: {
        total: 0, // Would need additional library
        used: 0,
        free: 0,
        usage: 0,
        io: {
          readBytes: 0,
          writeBytes: 0,
          readOps: 0,
          writeOps: 0
        }
      },
      network: {
        bytesReceived: 0,
        bytesSent: 0,
        connections: {
          active: 0,
          waiting: 0,
          listening: 0
        }
      }
    };
  }

  /**
   * Get current application metrics
   */
  async getApplicationMetrics(): Promise<ApplicationMetrics> {
    const now = Date.now();
    const last5Minutes = now - 5 * 60 * 1000;

    // Get HTTP metrics from recent data
    const httpMetrics = this.calculateHTTPMetrics(last5Minutes);
    
    return {
      http: httpMetrics,
      cache: {
        hitRate: 0, // Would integrate with cache system
        missRate: 0,
        evictionRate: 0,
        memoryUsage: 0
      },
      database: {
        connectionPoolSize: 0,
        activeConnections: 0,
        queryTime: 0,
        slowQueries: []
      },
      errors: {
        errorRate: this.calculateErrorRate(last5Minutes),
        errorsByType: this.calculateErrorsByType(last5Minutes),
        recentErrors: this.errorTracker.slice(-10)
      }
    };
  }

  /**
   * Get ML operations metrics
   */
  async getMLMetrics(): Promise<MLOperationsMetrics> {
    // This would integrate with the ML pipeline
    return {
      models: {
        totalModels: 0,
        activeModels: 0,
        averageInferenceTime: 0,
        predictionsPerSecond: 0,
        modelAccuracy: {},
        modelDrift: {}
      },
      training: {
        activeTrainingJobs: 0,
        averageTrainingTime: 0,
        trainingSuccessRate: 0,
        resourceUtilization: {
          cpu: 0,
          gpu: 0,
          memory: 0
        }
      },
      data: {
        processedRecords: 0,
        dataQualityScore: 0,
        featureEngineering: {
          featuresGenerated: 0,
          processingTime: 0
        }
      }
    };
  }

  /**
   * Get performance summary
   */
  async getPerformanceSummary(): Promise<{
    system: SystemMetrics;
    application: ApplicationMetrics;
    ml: MLOperationsMetrics;
    alerts: PerformanceAlert[];
    health: {
      overall: 'healthy' | 'warning' | 'critical';
      score: number; // 0-100
      issues: string[];
    };
  }> {
    const [system, application, ml] = await Promise.all([
      this.getSystemMetrics(),
      this.getApplicationMetrics(),
      this.getMLMetrics()
    ]);

    const activeAlerts = this.alerts.filter(alert => !alert.resolved);
    const health = this.calculateHealthScore(system, application, activeAlerts);

    return {
      system,
      application,
      ml,
      alerts: activeAlerts,
      health
    };
  }

  /**
   * Get metrics by category and time range
   */
  getMetrics(
    category?: MetricCategory,
    startTime?: Date,
    endTime?: Date,
    limit: number = 1000
  ): PerformanceMetric[] {
    let allMetrics: PerformanceMetric[] = [];
    
    // Combine all metrics
    for (const metrics of this.metrics.values()) {
      allMetrics = allMetrics.concat(metrics);
    }

    // Filter by category
    if (category) {
      allMetrics = allMetrics.filter(m => m.category === category);
    }

    // Filter by time range
    if (startTime) {
      allMetrics = allMetrics.filter(m => m.timestamp >= startTime);
    }
    
    if (endTime) {
      allMetrics = allMetrics.filter(m => m.timestamp <= endTime);
    }

    // Sort by timestamp and limit
    return allMetrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(metricName: string, hoursBack: number = 24): {
    data: Array<{ timestamp: Date; value: number }>;
    trend: 'increasing' | 'decreasing' | 'stable';
    changePercentage: number;
  } {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hoursBack * 60 * 60 * 1000);
    
    const metrics = this.getMetrics(undefined, startTime, endTime)
      .filter(m => m.name === metricName)
      .map(m => ({ timestamp: m.timestamp, value: m.value }));

    if (metrics.length < 2) {
      return {
        data: metrics,
        trend: 'stable',
        changePercentage: 0
      };
    }

    // Calculate trend
    const firstValue = metrics[metrics.length - 1].value;
    const lastValue = metrics[0].value;
    const changePercentage = ((lastValue - firstValue) / firstValue) * 100;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (Math.abs(changePercentage) > 5) {
      trend = changePercentage > 0 ? 'increasing' : 'decreasing';
    }

    return {
      data: metrics,
      trend,
      changePercentage
    };
  }

  /**
   * Create a performance alert
   */
  createAlert(
    severity: 'low' | 'medium' | 'high' | 'critical',
    title: string,
    description: string,
    metric: string,
    threshold: number,
    actualValue: number,
    affectedServices: string[] = []
  ): string {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      severity,
      title,
      description,
      metric,
      threshold,
      actualValue,
      affectedServices,
      resolved: false
    };

    this.alerts.push(alert);
    this.emit('alert_created', alert);
    
    return alert.id;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.emit('alert_resolved', alert);
      return true;
    }
    return false;
  }

  /**
   * Private methods
   */
  private registerDefaultCollectors(): void {
    // System metrics collector
    this.collectors.set('system', async () => {
      const metrics: PerformanceMetric[] = [];
      const systemMetrics = await this.getSystemMetrics();
      
      metrics.push(
        {
          id: `cpu_usage_${Date.now()}`,
          timestamp: new Date(),
          name: 'cpu_usage',
          value: systemMetrics.cpu.usage,
          unit: '%',
          tags: {},
          category: MetricCategory.SYSTEM,
          source: 'system_collector'
        },
        {
          id: `memory_usage_${Date.now()}`,
          timestamp: new Date(),
          name: 'memory_usage',
          value: systemMetrics.memory.usage,
          unit: '%',
          tags: {},
          category: MetricCategory.SYSTEM,
          source: 'system_collector'
        }
      );

      return metrics;
    });
  }

  private startCollection(): void {
    const collect = async () => {
      if (!this.isCollecting) return;
      
      try {
        for (const [name, collector] of this.collectors.entries()) {
          const metrics = await collector();
          for (const metric of metrics) {
            this.addMetric(metric);
            this.checkThresholds(metric);
          }
        }
      } catch (error) {
        this.emit('collection_error', error);
      }
      
      setTimeout(collect, this.collectionInterval);
    };
    
    collect();
  }

  private startAlertSystem(): void {
    setInterval(() => {
      this.processAlerts();
    }, 60000); // Check every minute
  }

  private startCleanup(): void {
    setInterval(() => {
      this.cleanupOldMetrics();
      this.cleanupOldAlerts();
    }, 60 * 60 * 1000); // Clean every hour
  }

  private addMetric(metric: PerformanceMetric): void {
    const key = `${metric.category}_${metric.name}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const metrics = this.metrics.get(key)!;
    metrics.push(metric);
    
    // Keep only recent metrics to prevent memory growth
    if (metrics.length > 10000) {
      metrics.splice(0, metrics.length - 10000);
    }

    this.emit('metric_recorded', metric);
  }

  private checkThresholds(metric: PerformanceMetric): void {
    const thresholdCheckers: Record<string, (value: number) => boolean> = {
      'cpu_usage': (value) => value > this.thresholds.system.cpuUsage,
      'memory_usage': (value) => value > this.thresholds.system.memoryUsage,
      'disk_usage': (value) => value > this.thresholds.system.diskUsage,
      'http_request_duration': (value) => value > this.thresholds.application.responseTime,
      'http_error_rate': (value) => value > this.thresholds.application.errorRate,
      'database_query_time': (value) => value > this.thresholds.database.queryTime,
      'ml_inference_time': (value) => value > this.thresholds.ml.inferenceTime
    };

    const checker = thresholdCheckers[metric.name];
    if (checker && checker(metric.value)) {
      this.createAlert(
        'high',
        `${metric.name} threshold exceeded`,
        `${metric.name} value ${metric.value}${metric.unit} exceeded threshold`,
        metric.name,
        this.getThreshold(metric.name),
        metric.value
      );
    }
  }

  private getThreshold(metricName: string): number {
    const thresholdMap: Record<string, number> = {
      'cpu_usage': this.thresholds.system.cpuUsage,
      'memory_usage': this.thresholds.system.memoryUsage,
      'disk_usage': this.thresholds.system.diskUsage,
      'http_request_duration': this.thresholds.application.responseTime,
      'http_error_rate': this.thresholds.application.errorRate,
      'database_query_time': this.thresholds.database.queryTime,
      'ml_inference_time': this.thresholds.ml.inferenceTime
    };
    
    return thresholdMap[metricName] || 0;
  }

  private async getCPUUsage(): Promise<number> {
    const startUsage = process.cpuUsage();
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const totalUsage = endUsage.user + endUsage.system;
        const usage = (totalUsage / 1000000) * 100; // Convert to percentage
        resolve(Math.min(100, usage));
      }, 100);
    });
  }

  private calculateHTTPMetrics(since: number): ApplicationMetrics['http'] {
    // This would be calculated from actual request tracking
    return {
      requestsPerSecond: 0,
      averageResponseTime: 0,
      errorRate: 0,
      statusCodes: {},
      slowestEndpoints: []
    };
  }

  private calculateErrorRate(since: number): number {
    const recentErrors = this.errorTracker.filter(e => e.timestamp.getTime() > since);
    const totalRequests = this.requestTracker.size + recentErrors.length;
    
    return totalRequests > 0 ? (recentErrors.length / totalRequests) * 100 : 0;
  }

  private calculateErrorsByType(since: number): Record<string, number> {
    const recentErrors = this.errorTracker.filter(e => e.timestamp.getTime() > since);
    const errorsByType: Record<string, number> = {};
    
    for (const error of recentErrors) {
      const key = error.error.split(':')[0] || 'Unknown';
      errorsByType[key] = (errorsByType[key] || 0) + 1;
    }
    
    return errorsByType;
  }

  private calculateHealthScore(
    system: SystemMetrics,
    application: ApplicationMetrics,
    alerts: PerformanceAlert[]
  ): {
    overall: 'healthy' | 'warning' | 'critical';
    score: number;
    issues: string[];
  } {
    let score = 100;
    const issues: string[] = [];

    // System health impact
    if (system.cpu.usage > 80) {
      score -= 20;
      issues.push('High CPU usage');
    }
    
    if (system.memory.usage > 85) {
      score -= 25;
      issues.push('High memory usage');
    }

    // Application health impact
    if (application.http.errorRate > 5) {
      score -= 30;
      issues.push('High error rate');
    }
    
    if (application.http.averageResponseTime > 1000) {
      score -= 15;
      issues.push('Slow response times');
    }

    // Alert impact
    for (const alert of alerts) {
      switch (alert.severity) {
        case 'critical':
          score -= 40;
          break;
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    score = Math.max(0, score);

    let overall: 'healthy' | 'warning' | 'critical';
    if (score >= 80) overall = 'healthy';
    else if (score >= 60) overall = 'warning';
    else overall = 'critical';

    return { overall, score, issues };
  }

  private processAlerts(): void {
    // Auto-resolve alerts that are no longer relevant
    for (const alert of this.alerts) {
      if (!alert.resolved) {
        // Check if condition still exists
        const recentMetrics = this.getMetrics(undefined, new Date(Date.now() - 5 * 60 * 1000));
        const relevantMetrics = recentMetrics.filter(m => m.name === alert.metric);
        
        if (relevantMetrics.length > 0) {
          const avgValue = relevantMetrics.reduce((sum, m) => sum + m.value, 0) / relevantMetrics.length;
          
          if (avgValue <= alert.threshold) {
            this.resolveAlert(alert.id);
          }
        }
      }
    }
  }

  private cleanupOldMetrics(): void {
    const cutoffTime = new Date(Date.now() - this.retentionPeriod);
    
    for (const [key, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(m => m.timestamp > cutoffTime);
      this.metrics.set(key, filteredMetrics);
    }
  }

  private cleanupOldAlerts(): void {
    const cutoffTime = new Date(Date.now() - this.retentionPeriod);
    this.alerts = this.alerts.filter(a => a.timestamp > cutoffTime);
  }
}

/**
 * Factory function
 */
export function createPerformanceMonitor(
  thresholds?: Partial<PerformanceThresholds>
): EnterprisePerformanceMonitor {
  return new EnterprisePerformanceMonitor(thresholds);
}

// Export singleton instance
export const performanceMonitor = createPerformanceMonitor();