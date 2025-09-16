/**
 * Enterprise Performance Monitoring and Optimization System
 * Comprehensive performance monitoring, alerting, optimization, and observability
 * Provides real-time metrics, automated optimization, and intelligent recommendations
 */

import { EventEmitter } from 'events';
import { enterpriseStateManager } from '../state/enterprise-state-manager.service';
import { persistenceService } from '../persistence/enterprise-persistence.service';
import { realTimeProcessingService } from '../streaming/real-time-processing.service';

// ==================== MONITORING TYPES ====================

export interface MonitoringConfiguration {
  collection: {
    interval: number; // milliseconds
    batchSize: number;
    compression: boolean;
    sampling: {
      enabled: boolean;
      rate: number; // 0.0 - 1.0
      strategy: 'uniform' | 'adaptive' | 'priority';
    };
  };
  retention: {
    raw: number; // hours
    aggregated: number; // days
    longTerm: number; // months
  };
  alerting: {
    enabled: boolean;
    escalation: boolean;
    channels: string[];
    suppressionWindow: number; // milliseconds
  };
  optimization: {
    autoOptimization: boolean;
    optimizationWindow: number; // milliseconds
    safetyMargin: number; // percentage
    rollbackEnabled: boolean;
  };
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  source: string;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface MetricAggregation {
  metric: string;
  timeWindow: string;
  aggregationType: 'avg' | 'sum' | 'min' | 'max' | 'count' | 'p50' | 'p95' | 'p99';
  value: number;
  dataPoints: number;
  timestamp: Date;
}

export interface Alert {
  id: string;
  name: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  metric: string;
  condition: AlertCondition;
  status: 'active' | 'resolved' | 'suppressed';
  triggeredAt: Date;
  resolvedAt?: Date;
  description: string;
  impact: string;
  recommendations: string[];
  notifications: NotificationHistory[];
}

export interface AlertCondition {
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
  threshold: number;
  timeWindow: number; // milliseconds
  consecutiveViolations: number;
  recovery: {
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
    threshold: number;
    timeWindow: number;
  };
}

export interface NotificationHistory {
  timestamp: Date;
  channel: string;
  status: 'sent' | 'failed' | 'pending';
  recipient: string;
  message: string;
}

export interface PerformanceBaseline {
  metric: string;
  period: 'hour' | 'day' | 'week' | 'month';
  values: {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
    stdDev: number;
  };
  confidence: number;
  createdAt: Date;
  validUntil: Date;
}

export interface OptimizationRecommendation {
  id: string;
  type: 'scaling' | 'configuration' | 'resource' | 'algorithm';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    performance: string;
    cost: string;
    risk: string;
  };
  implementation: {
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    steps: string[];
    rollback: string[];
  };
  metrics: {
    current: Record<string, number>;
    projected: Record<string, number>;
    confidence: number;
  };
  createdAt: Date;
  status: 'pending' | 'approved' | 'implementing' | 'completed' | 'rejected';
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical' | 'down';
  components: {
    compute: ComponentHealth;
    memory: ComponentHealth;
    storage: ComponentHealth;
    network: ComponentHealth;
    models: ComponentHealth;
    database: ComponentHealth;
  };
  score: number; // 0-100
  issues: HealthIssue[];
  lastUpdate: Date;
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'critical' | 'down';
  utilization: number;
  availability: number;
  performance: number;
  errors: number;
  warnings: number;
  trends: {
    utilization: 'improving' | 'stable' | 'degrading';
    performance: 'improving' | 'stable' | 'degrading';
    errors: 'improving' | 'stable' | 'degrading';
  };
}

export interface HealthIssue {
  id: string;
  component: string;
  severity: 'warning' | 'error' | 'critical';
  description: string;
  impact: string;
  recommendation: string;
  firstSeen: Date;
  lastSeen: Date;
  occurrences: number;
}

// ==================== METRIC COLLECTOR ====================

export class MetricCollector extends EventEmitter {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private config: MonitoringConfiguration;
  private collectionInterval?: NodeJS.Timeout;
  private isCollecting = false;

  constructor(config: MonitoringConfiguration) {
    super();
    this.config = config;
  }

  start(): void {
    if (this.isCollecting) {
      return;
    }

    this.isCollecting = true;
    this.collectionInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.collection.interval);

    this.emit('collection_started', { timestamp: new Date() });
  }

  stop(): void {
    if (!this.isCollecting) {
      return;
    }

    this.isCollecting = false;
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = undefined;
    }

    this.emit('collection_stopped', { timestamp: new Date() });
  }

  private async collectMetrics(): Promise<void> {
    try {
      const timestamp = new Date();

      // Collect system metrics
      const systemMetrics = await this.collectSystemMetrics(timestamp);

      // Collect model metrics
      const modelMetrics = await this.collectModelMetrics(timestamp);

      // Collect business metrics
      const businessMetrics = await this.collectBusinessMetrics(timestamp);

      // Store all metrics
      const allMetrics = [...systemMetrics, ...modelMetrics, ...businessMetrics];
      this.storeMetrics(allMetrics);

      // Apply sampling if configured
      const sampledMetrics = this.applySampling(allMetrics);

      // Emit metrics for processing
      this.emit('metrics_collected', {
        count: sampledMetrics.length,
        timestamp,
        metrics: sampledMetrics
      });

      // Persist metrics in batches
      if (sampledMetrics.length >= this.config.collection.batchSize) {
        await this.persistMetrics(sampledMetrics);
      }

    } catch (error) {
      this.emit('collection_error', { error, timestamp: new Date() });
    }
  }

  private async collectSystemMetrics(timestamp: Date): Promise<PerformanceMetric[]> {
    const systemState = enterpriseStateManager.getSystemState();
    if (!systemState) {
      return [];
    }

    const metrics: PerformanceMetric[] = [];

    // CPU metrics
    metrics.push({
      name: 'system.cpu.utilization',
      value: systemState.resources.cpu.utilization,
      unit: 'percent',
      timestamp,
      source: 'system',
      tags: { component: 'cpu' }
    });

    // Memory metrics
    metrics.push({
      name: 'system.memory.utilization',
      value: systemState.resources.memory.utilization,
      unit: 'percent',
      timestamp,
      source: 'system',
      tags: { component: 'memory' }
    });

    metrics.push({
      name: 'system.memory.used',
      value: systemState.resources.memory.current,
      unit: 'mb',
      timestamp,
      source: 'system',
      tags: { component: 'memory' }
    });

    // Disk metrics
    metrics.push({
      name: 'system.disk.utilization',
      value: systemState.resources.disk.utilization,
      unit: 'percent',
      timestamp,
      source: 'system',
      tags: { component: 'disk' }
    });

    // Network metrics
    metrics.push({
      name: 'system.network.utilization',
      value: systemState.resources.network.utilization,
      unit: 'percent',
      timestamp,
      source: 'system',
      tags: { component: 'network' }
    });

    // Uptime
    metrics.push({
      name: 'system.uptime',
      value: systemState.uptime,
      unit: 'ms',
      timestamp,
      source: 'system',
      tags: { component: 'system' }
    });

    return metrics;
  }

  private async collectModelMetrics(timestamp: Date): Promise<PerformanceMetric[]> {
    const models = enterpriseStateManager.getAllModels();
    const metrics: PerformanceMetric[] = [];

    models.forEach(model => {
      // Model performance metrics
      metrics.push({
        name: 'model.accuracy',
        value: model.performance.accuracy,
        unit: 'ratio',
        timestamp,
        source: 'model',
        tags: { model_id: model.id, model_name: model.name }
      });

      metrics.push({
        name: 'model.inference_time',
        value: model.performance.inferenceTime,
        unit: 'ms',
        timestamp,
        source: 'model',
        tags: { model_id: model.id, model_name: model.name }
      });

      metrics.push({
        name: 'model.predictions_total',
        value: model.monitoring.predictions,
        unit: 'count',
        timestamp,
        source: 'model',
        tags: { model_id: model.id, model_name: model.name }
      });

      metrics.push({
        name: 'model.errors_total',
        value: model.monitoring.errors,
        unit: 'count',
        timestamp,
        source: 'model',
        tags: { model_id: model.id, model_name: model.name }
      });
    });

    return metrics;
  }

  private async collectBusinessMetrics(timestamp: Date): Promise<PerformanceMetric[]> {
    const statistics = enterpriseStateManager.getStatistics();
    const metrics: PerformanceMetric[] = [];

    // Business KPIs
    metrics.push({
      name: 'business.total_models',
      value: statistics.totalModels,
      unit: 'count',
      timestamp,
      source: 'business',
      tags: { type: 'kpi' }
    });

    metrics.push({
      name: 'business.active_experiments',
      value: statistics.activeExperiments,
      unit: 'count',
      timestamp,
      source: 'business',
      tags: { type: 'kpi' }
    });

    metrics.push({
      name: 'business.active_deployments',
      value: statistics.activeDeployments,
      unit: 'count',
      timestamp,
      source: 'business',
      tags: { type: 'kpi' }
    });

    return metrics;
  }

  private storeMetrics(metrics: PerformanceMetric[]): void {
    metrics.forEach(metric => {
      if (!this.metrics.has(metric.name)) {
        this.metrics.set(metric.name, []);
      }

      const metricHistory = this.metrics.get(metric.name)!;
      metricHistory.push(metric);

      // Keep only recent metrics in memory
      const cutoff = Date.now() - (this.config.retention.raw * 60 * 60 * 1000);
      this.metrics.set(
        metric.name,
        metricHistory.filter(m => m.timestamp.getTime() > cutoff)
      );
    });
  }

  private applySampling(metrics: PerformanceMetric[]): PerformanceMetric[] {
    if (!this.config.collection.sampling.enabled) {
      return metrics;
    }

    const sampleRate = this.config.collection.sampling.rate;
    const strategy = this.config.collection.sampling.strategy;

    switch (strategy) {
      case 'uniform':
        return metrics.filter(() => Math.random() < sampleRate);

      case 'adaptive':
        // Sample more frequently for error metrics
        return metrics.filter(metric => {
          const isErrorMetric = metric.name.includes('error') || metric.name.includes('failed');
          const rate = isErrorMetric ? Math.min(1.0, sampleRate * 2) : sampleRate;
          return Math.random() < rate;
        });

      case 'priority':
        // Sample based on metric importance
        return metrics.filter(metric => {
          const isHighPriority = ['accuracy', 'latency', 'errors', 'utilization'].some(key =>
            metric.name.includes(key)
          );
          const rate = isHighPriority ? Math.min(1.0, sampleRate * 1.5) : sampleRate * 0.5;
          return Math.random() < rate;
        });

      default:
        return metrics;
    }
  }

  private async persistMetrics(metrics: PerformanceMetric[]): Promise<void> {
    try {
      for (const metric of metrics) {
        await persistenceService.saveMetrics({
          id: `metric_${metric.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: metric.timestamp,
          type: 'system',
          metrics: { [metric.name]: metric.value },
          dimensions: {
            source: metric.source,
            unit: metric.unit,
            ...metric.tags
          },
          aggregationLevel: 'raw'
        });
      }
    } catch (error) {
      this.emit('persistence_error', { error, count: metrics.length });
    }
  }

  getMetricHistory(metricName: string, timeRange?: { start: Date; end: Date }): PerformanceMetric[] {
    const history = this.metrics.get(metricName) || [];

    if (!timeRange) {
      return [...history];
    }

    return history.filter(metric =>
      metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
    );
  }

  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  getCurrentValue(metricName: string): PerformanceMetric | undefined {
    const history = this.metrics.get(metricName);
    return history ? history[history.length - 1] : undefined;
  }
}

// ==================== ALERT MANAGER ====================

export class AlertManager extends EventEmitter {
  private alerts: Map<string, Alert> = new Map();
  private alertRules: Map<string, AlertCondition & { name: string; metric: string; severity: Alert['severity'] }> = new Map();
  private suppressionWindows: Map<string, Date> = new Map();
  private config: MonitoringConfiguration;

  constructor(config: MonitoringConfiguration) {
    super();
    this.config = config;
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // CPU utilization alert
    this.alertRules.set('high_cpu_utilization', {
      name: 'High CPU Utilization',
      metric: 'system.cpu.utilization',
      severity: 'warning',
      operator: 'gt',
      threshold: 80,
      timeWindow: 300000, // 5 minutes
      consecutiveViolations: 3,
      recovery: {
        operator: 'lt',
        threshold: 70,
        timeWindow: 120000 // 2 minutes
      }
    });

    // Memory utilization alert
    this.alertRules.set('high_memory_utilization', {
      name: 'High Memory Utilization',
      metric: 'system.memory.utilization',
      severity: 'error',
      operator: 'gt',
      threshold: 90,
      timeWindow: 180000, // 3 minutes
      consecutiveViolations: 2,
      recovery: {
        operator: 'lt',
        threshold: 80,
        timeWindow: 120000
      }
    });

    // Model accuracy degradation
    this.alertRules.set('model_accuracy_degradation', {
      name: 'Model Accuracy Degradation',
      metric: 'model.accuracy',
      severity: 'error',
      operator: 'lt',
      threshold: 0.85,
      timeWindow: 600000, // 10 minutes
      consecutiveViolations: 2,
      recovery: {
        operator: 'gt',
        threshold: 0.87,
        timeWindow: 300000
      }
    });

    // High error rate
    this.alertRules.set('high_error_rate', {
      name: 'High Error Rate',
      metric: 'model.errors_total',
      severity: 'critical',
      operator: 'gt',
      threshold: 100,
      timeWindow: 300000,
      consecutiveViolations: 1,
      recovery: {
        operator: 'lt',
        threshold: 50,
        timeWindow: 180000
      }
    });
  }

  evaluateMetrics(metrics: PerformanceMetric[]): void {
    metrics.forEach(metric => {
      this.alertRules.forEach((rule, ruleId) => {
        if (rule.metric === metric.name || this.matchesPattern(rule.metric, metric.name)) {
          this.evaluateRule(ruleId, rule, metric);
        }
      });
    });
  }

  private matchesPattern(pattern: string, metricName: string): boolean {
    // Support wildcard patterns like "model.*"
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(metricName);
    }
    return pattern === metricName;
  }

  private evaluateRule(ruleId: string, rule: AlertCondition & { name: string; severity: Alert['severity'] }, metric: PerformanceMetric): void {
    const isViolation = this.checkCondition(rule, metric.value);
    const existingAlert = this.getActiveAlert(ruleId, metric.tags);

    if (isViolation && !existingAlert) {
      // Check if we're in suppression window
      const suppressionKey = `${ruleId}_${JSON.stringify(metric.tags)}`;
      const suppressionEnd = this.suppressionWindows.get(suppressionKey);

      if (suppressionEnd && metric.timestamp < suppressionEnd) {
        return; // Still in suppression window
      }

      // Create new alert
      this.createAlert(ruleId, rule, metric);

    } else if (!isViolation && existingAlert) {
      // Check recovery condition
      if (this.checkCondition(rule.recovery, metric.value)) {
        this.resolveAlert(existingAlert.id, metric.timestamp);
      }
    }
  }

  private checkCondition(condition: { operator: string; threshold: number }, value: number): boolean {
    switch (condition.operator) {
      case 'gt': return value > condition.threshold;
      case 'lt': return value < condition.threshold;
      case 'eq': return value === condition.threshold;
      case 'ne': return value !== condition.threshold;
      case 'gte': return value >= condition.threshold;
      case 'lte': return value <= condition.threshold;
      default: return false;
    }
  }

  private getActiveAlert(ruleId: string, tags: Record<string, string>): Alert | undefined {
    return Array.from(this.alerts.values()).find(alert =>
      alert.name.includes(ruleId) &&
      alert.status === 'active' &&
      JSON.stringify(alert.metric) === JSON.stringify(tags)
    );
  }

  private createAlert(ruleId: string, rule: AlertCondition & { name: string; severity: Alert['severity'] }, metric: PerformanceMetric): void {
    const alertId = `alert_${ruleId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const alert: Alert = {
      id: alertId,
      name: rule.name,
      severity: rule.severity,
      metric: metric.name,
      condition: rule,
      status: 'active',
      triggeredAt: metric.timestamp,
      description: this.generateAlertDescription(rule, metric),
      impact: this.assessImpact(rule.severity, metric),
      recommendations: this.generateRecommendations(rule, metric),
      notifications: []
    };

    this.alerts.set(alertId, alert);

    // Send notifications
    this.sendNotifications(alert);

    // Set suppression window
    const suppressionKey = `${ruleId}_${JSON.stringify(metric.tags)}`;
    this.suppressionWindows.set(
      suppressionKey,
      new Date(Date.now() + this.config.alerting.suppressionWindow)
    );

    this.emit('alert_triggered', alert);
  }

  private resolveAlert(alertId: string, resolvedAt: Date): void {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return;
    }

    alert.status = 'resolved';
    alert.resolvedAt = resolvedAt;

    // Send resolution notification
    this.sendResolutionNotification(alert);

    this.emit('alert_resolved', alert);
  }

  private generateAlertDescription(rule: AlertCondition & { name: string }, metric: PerformanceMetric): string {
    return `${rule.name}: ${metric.name} is ${metric.value} ${metric.unit}, which ${rule.operator} ${rule.threshold}`;
  }

  private assessImpact(severity: Alert['severity'], metric: PerformanceMetric): string {
    const impacts = {
      info: 'Minimal impact on system performance',
      warning: 'Potential performance degradation',
      error: 'Significant impact on system operations',
      critical: 'Severe impact requiring immediate attention'
    };

    return impacts[severity];
  }

  private generateRecommendations(rule: AlertCondition & { name: string }, metric: PerformanceMetric): string[] {
    const recommendations: string[] = [];

    if (metric.name.includes('cpu')) {
      recommendations.push('Check for CPU-intensive processes');
      recommendations.push('Consider scaling up compute resources');
      recommendations.push('Review algorithm efficiency');
    }

    if (metric.name.includes('memory')) {
      recommendations.push('Investigate memory leaks');
      recommendations.push('Optimize data structures');
      recommendations.push('Consider increasing memory allocation');
    }

    if (metric.name.includes('accuracy')) {
      recommendations.push('Review model training data quality');
      recommendations.push('Consider model retraining');
      recommendations.push('Check for data drift');
    }

    if (metric.name.includes('error')) {
      recommendations.push('Review error logs for root cause');
      recommendations.push('Check input data validation');
      recommendations.push('Verify model deployment configuration');
    }

    return recommendations;
  }

  private async sendNotifications(alert: Alert): Promise<void> {
    if (!this.config.alerting.enabled) {
      return;
    }

    const channels = this.config.alerting.channels;
    const timestamp = new Date();

    for (const channel of channels) {
      try {
        await this.sendNotification(channel, alert);

        alert.notifications.push({
          timestamp,
          channel,
          status: 'sent',
          recipient: 'system', // Would be actual recipient
          message: `Alert: ${alert.name} - ${alert.description}`
        });

      } catch (error) {
        alert.notifications.push({
          timestamp,
          channel,
          status: 'failed',
          recipient: 'system',
          message: `Failed to send alert: ${error}`
        });
      }
    }
  }

  private async sendNotification(channel: string, alert: Alert): Promise<void> {
    // Simulate notification sending
    switch (channel) {
      case 'email':
        console.log(`📧 Email Alert: ${alert.name}`);
        break;
      case 'slack':
        console.log(`💬 Slack Alert: ${alert.name}`);
        break;
      case 'webhook':
        console.log(`🔗 Webhook Alert: ${alert.name}`);
        break;
      default:
        console.log(`📨 ${channel} Alert: ${alert.name}`);
    }
  }

  private async sendResolutionNotification(alert: Alert): Promise<void> {
    console.log(`✅ Alert Resolved: ${alert.name}`);
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.status === 'active');
  }

  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  getAlert(alertId: string): Alert | undefined {
    return this.alerts.get(alertId);
  }

  addAlertRule(ruleId: string, rule: AlertCondition & { name: string; metric: string; severity: Alert['severity'] }): void {
    this.alertRules.set(ruleId, rule);
    this.emit('rule_added', { ruleId, rule });
  }

  removeAlertRule(ruleId: string): boolean {
    const removed = this.alertRules.delete(ruleId);
    if (removed) {
      this.emit('rule_removed', { ruleId });
    }
    return removed;
  }

  suppressAlert(alertId: string, duration: number): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.status = 'suppressed';
    setTimeout(() => {
      if (alert.status === 'suppressed') {
        alert.status = 'active';
      }
    }, duration);

    this.emit('alert_suppressed', { alertId, duration });
    return true;
  }
}

// ==================== PERFORMANCE OPTIMIZER ====================

export class PerformanceOptimizer extends EventEmitter {
  private recommendations: Map<string, OptimizationRecommendation> = new Map();
  private baselines: Map<string, PerformanceBaseline> = new Map();
  private config: MonitoringConfiguration;
  private optimizationHistory: Array<{
    recommendation: OptimizationRecommendation;
    applied: Date;
    result: 'success' | 'failed' | 'rolled_back';
    impact: Record<string, number>;
  }> = [];

  constructor(config: MonitoringConfiguration) {
    super();
    this.config = config;
  }

  analyzePerformance(metrics: PerformanceMetric[]): void {
    // Update baselines
    this.updateBaselines(metrics);

    // Detect performance anomalies
    const anomalies = this.detectAnomalies(metrics);

    // Generate optimization recommendations
    const recommendations = this.generateOptimizationRecommendations(metrics, anomalies);

    // Store recommendations
    recommendations.forEach(rec => {
      this.recommendations.set(rec.id, rec);
    });

    if (recommendations.length > 0) {
      this.emit('recommendations_generated', {
        count: recommendations.length,
        recommendations,
        timestamp: new Date()
      });
    }

    // Auto-apply safe optimizations if enabled
    if (this.config.optimization.autoOptimization) {
      this.autoApplyOptimizations(recommendations);
    }
  }

  private updateBaselines(metrics: PerformanceMetric[]): void {
    const now = new Date();
    const groupedMetrics = this.groupMetricsByName(metrics);

    Object.entries(groupedMetrics).forEach(([metricName, metricList]) => {
      const values = metricList.map(m => m.value);
      if (values.length < 10) return; // Need sufficient data

      const baseline: PerformanceBaseline = {
        metric: metricName,
        period: 'hour',
        values: {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((sum, v) => sum + v, 0) / values.length,
          p50: this.calculatePercentile(values, 50),
          p95: this.calculatePercentile(values, 95),
          p99: this.calculatePercentile(values, 99),
          stdDev: this.calculateStandardDeviation(values)
        },
        confidence: Math.min(95, values.length * 2), // Confidence based on sample size
        createdAt: now,
        validUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours
      };

      this.baselines.set(metricName, baseline);
    });
  }

  private groupMetricsByName(metrics: PerformanceMetric[]): Record<string, PerformanceMetric[]> {
    return metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = [];
      }
      groups[metric.name].push(metric);
      return groups;
    }, {} as Record<string, PerformanceMetric[]>);
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private calculateStandardDeviation(values: number[]): number {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private detectAnomalies(metrics: PerformanceMetric[]): Array<{ metric: PerformanceMetric; anomalyType: string; severity: number }> {
    const anomalies: Array<{ metric: PerformanceMetric; anomalyType: string; severity: number }> = [];

    metrics.forEach(metric => {
      const baseline = this.baselines.get(metric.name);
      if (!baseline) return;

      // Detect outliers
      const zScore = Math.abs((metric.value - baseline.values.avg) / baseline.values.stdDev);
      if (zScore > 3) {
        anomalies.push({
          metric,
          anomalyType: 'outlier',
          severity: Math.min(100, zScore * 10)
        });
      }

      // Detect sudden spikes
      if (metric.value > baseline.values.p99 * 1.5) {
        anomalies.push({
          metric,
          anomalyType: 'spike',
          severity: ((metric.value - baseline.values.p99) / baseline.values.p99) * 100
        });
      }

      // Detect sudden drops (for metrics where lower is worse)
      if (metric.name.includes('accuracy') && metric.value < baseline.values.p50 * 0.8) {
        anomalies.push({
          metric,
          anomalyType: 'drop',
          severity: ((baseline.values.p50 - metric.value) / baseline.values.p50) * 100
        });
      }
    });

    return anomalies;
  }

  private generateOptimizationRecommendations(
    metrics: PerformanceMetric[],
    anomalies: Array<{ metric: PerformanceMetric; anomalyType: string; severity: number }>
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // CPU optimization recommendations
    const cpuMetrics = metrics.filter(m => m.name.includes('cpu'));
    if (cpuMetrics.some(m => m.value > 80)) {
      recommendations.push({
        id: `cpu_optimization_${Date.now()}`,
        type: 'scaling',
        priority: 'high',
        title: 'CPU Scaling Recommendation',
        description: 'High CPU utilization detected. Consider scaling up compute resources.',
        impact: {
          performance: 'Reduce CPU bottlenecks by 30-50%',
          cost: 'Increase infrastructure costs by $200-500/month',
          risk: 'Low risk - reversible scaling operation'
        },
        implementation: {
          effort: 'low',
          timeline: '15-30 minutes',
          steps: [
            'Increase CPU allocation by 50%',
            'Monitor performance for 1 hour',
            'Adjust allocation based on results'
          ],
          rollback: [
            'Reduce CPU allocation to original values',
            'Verify system stability'
          ]
        },
        metrics: {
          current: { cpu_utilization: cpuMetrics[0]?.value || 0 },
          projected: { cpu_utilization: Math.max(60, (cpuMetrics[0]?.value || 0) * 0.7) },
          confidence: 85
        },
        createdAt: new Date(),
        status: 'pending'
      });
    }

    // Memory optimization recommendations
    const memoryMetrics = metrics.filter(m => m.name.includes('memory'));
    if (memoryMetrics.some(m => m.value > 85)) {
      recommendations.push({
        id: `memory_optimization_${Date.now()}`,
        type: 'resource',
        priority: 'medium',
        title: 'Memory Optimization',
        description: 'High memory usage detected. Optimize memory allocation and usage patterns.',
        impact: {
          performance: 'Reduce memory pressure and improve responsiveness',
          cost: 'Minimal cost increase for memory optimization',
          risk: 'Medium risk - requires careful memory management'
        },
        implementation: {
          effort: 'medium',
          timeline: '1-2 hours',
          steps: [
            'Analyze memory usage patterns',
            'Implement memory pooling',
            'Optimize data structures',
            'Add memory monitoring'
          ],
          rollback: [
            'Restore original memory configuration',
            'Remove optimization changes'
          ]
        },
        metrics: {
          current: { memory_utilization: memoryMetrics[0]?.value || 0 },
          projected: { memory_utilization: Math.max(70, (memoryMetrics[0]?.value || 0) * 0.8) },
          confidence: 75
        },
        createdAt: new Date(),
        status: 'pending'
      });
    }

    // Model performance recommendations
    const accuracyMetrics = metrics.filter(m => m.name.includes('accuracy'));
    if (accuracyMetrics.some(m => m.value < 0.85)) {
      recommendations.push({
        id: `model_retraining_${Date.now()}`,
        type: 'algorithm',
        priority: 'high',
        title: 'Model Retraining Recommendation',
        description: 'Model accuracy has degraded. Consider retraining with fresh data.',
        impact: {
          performance: 'Improve model accuracy by 5-15%',
          cost: 'Training compute costs: $100-300',
          risk: 'Low risk - current model remains as fallback'
        },
        implementation: {
          effort: 'high',
          timeline: '4-8 hours',
          steps: [
            'Collect recent training data',
            'Validate data quality',
            'Retrain model with updated dataset',
            'A/B test new model against current',
            'Deploy if performance improves'
          ],
          rollback: [
            'Revert to previous model version',
            'Verify prediction quality'
          ]
        },
        metrics: {
          current: { accuracy: accuracyMetrics[0]?.value || 0 },
          projected: { accuracy: Math.min(0.95, (accuracyMetrics[0]?.value || 0) + 0.1) },
          confidence: 70
        },
        createdAt: new Date(),
        status: 'pending'
      });
    }

    // Add recommendations based on anomalies
    anomalies.forEach(anomaly => {
      if (anomaly.severity > 50) {
        recommendations.push({
          id: `anomaly_fix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'configuration',
          priority: anomaly.severity > 80 ? 'critical' : 'high',
          title: `Fix ${anomaly.anomalyType} in ${anomaly.metric.name}`,
          description: `Detected ${anomaly.anomalyType} anomaly in ${anomaly.metric.name}`,
          impact: {
            performance: 'Stabilize metric performance',
            cost: 'Minimal operational cost',
            risk: 'Low risk - configuration adjustment'
          },
          implementation: {
            effort: 'low',
            timeline: '30-60 minutes',
            steps: [
              'Investigate root cause of anomaly',
              'Apply targeted configuration fix',
              'Monitor metric stability'
            ],
            rollback: [
              'Revert configuration changes',
              'Verify system stability'
            ]
          },
          metrics: {
            current: { [anomaly.metric.name]: anomaly.metric.value },
            projected: { [anomaly.metric.name]: anomaly.metric.value * 0.9 },
            confidence: 60
          },
          createdAt: new Date(),
          status: 'pending'
        });
      }
    });

    return recommendations;
  }

  private autoApplyOptimizations(recommendations: OptimizationRecommendation[]): void {
    const safeRecommendations = recommendations.filter(rec =>
      rec.priority !== 'critical' &&
      rec.implementation.effort === 'low' &&
      rec.metrics.confidence > 80
    );

    safeRecommendations.forEach(rec => {
      if (this.shouldAutoApply(rec)) {
        this.applyOptimization(rec.id);
      }
    });
  }

  private shouldAutoApply(recommendation: OptimizationRecommendation): boolean {
    // Apply safety checks
    const safetyMargin = this.config.optimization.safetyMargin / 100;

    // Check if we've had recent failures
    const recentFailures = this.optimizationHistory.filter(h =>
      h.applied.getTime() > Date.now() - 3600000 && // Last hour
      h.result === 'failed'
    ).length;

    if (recentFailures > 2) {
      return false; // Too many recent failures
    }

    // Check confidence threshold
    if (recommendation.metrics.confidence < 80) {
      return false;
    }

    // Check if optimization window is appropriate
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.config.optimization.optimizationWindow);
    const recentOptimizations = this.optimizationHistory.filter(h =>
      h.applied > windowStart
    ).length;

    return recentOptimizations < 3; // Limit optimizations per window
  }

  async applyOptimization(recommendationId: string): Promise<boolean> {
    const recommendation = this.recommendations.get(recommendationId);
    if (!recommendation) {
      return false;
    }

    try {
      recommendation.status = 'implementing';
      this.emit('optimization_started', { recommendationId, timestamp: new Date() });

      // Simulate optimization implementation
      await this.executeOptimizationSteps(recommendation);

      recommendation.status = 'completed';

      // Record successful optimization
      this.optimizationHistory.push({
        recommendation,
        applied: new Date(),
        result: 'success',
        impact: recommendation.metrics.projected
      });

      this.emit('optimization_completed', {
        recommendationId,
        result: 'success',
        timestamp: new Date()
      });

      return true;

    } catch (error) {
      recommendation.status = 'rejected';

      // Record failed optimization
      this.optimizationHistory.push({
        recommendation,
        applied: new Date(),
        result: 'failed',
        impact: {}
      });

      this.emit('optimization_failed', {
        recommendationId,
        error,
        timestamp: new Date()
      });

      // Auto-rollback if enabled
      if (this.config.optimization.rollbackEnabled) {
        await this.rollbackOptimization(recommendation);
      }

      return false;
    }
  }

  private async executeOptimizationSteps(recommendation: OptimizationRecommendation): Promise<void> {
    for (const step of recommendation.implementation.steps) {
      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.emit('optimization_step_completed', {
        recommendationId: recommendation.id,
        step,
        timestamp: new Date()
      });
    }
  }

  private async rollbackOptimization(recommendation: OptimizationRecommendation): Promise<void> {
    try {
      for (const step of recommendation.implementation.rollback) {
        // Simulate rollback step
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Update history
      const historyEntry = this.optimizationHistory.find(h =>
        h.recommendation.id === recommendation.id &&
        h.result === 'failed'
      );

      if (historyEntry) {
        historyEntry.result = 'rolled_back';
      }

      this.emit('optimization_rolled_back', {
        recommendationId: recommendation.id,
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('rollback_failed', {
        recommendationId: recommendation.id,
        error,
        timestamp: new Date()
      });
    }
  }

  getRecommendations(filter?: {
    type?: OptimizationRecommendation['type'];
    priority?: OptimizationRecommendation['priority'];
    status?: OptimizationRecommendation['status'];
  }): OptimizationRecommendation[] {
    let recommendations = Array.from(this.recommendations.values());

    if (filter) {
      if (filter.type) {
        recommendations = recommendations.filter(rec => rec.type === filter.type);
      }
      if (filter.priority) {
        recommendations = recommendations.filter(rec => rec.priority === filter.priority);
      }
      if (filter.status) {
        recommendations = recommendations.filter(rec => rec.status === filter.status);
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  getOptimizationHistory(): Array<{
    recommendation: OptimizationRecommendation;
    applied: Date;
    result: string;
    impact: Record<string, number>;
  }> {
    return [...this.optimizationHistory].sort((a, b) => b.applied.getTime() - a.applied.getTime());
  }

  getBaselines(): PerformanceBaseline[] {
    return Array.from(this.baselines.values());
  }

  getBaseline(metricName: string): PerformanceBaseline | undefined {
    return this.baselines.get(metricName);
  }
}

// ==================== HEALTH MONITOR ====================

export class HealthMonitor extends EventEmitter {
  private systemHealth: SystemHealth;
  private healthCheckInterval?: NodeJS.Timeout;
  private isMonitoring = false;

  constructor() {
    super();
    this.systemHealth = this.initializeSystemHealth();
  }

  private initializeSystemHealth(): SystemHealth {
    return {
      overall: 'healthy',
      components: {
        compute: this.createComponentHealth(),
        memory: this.createComponentHealth(),
        storage: this.createComponentHealth(),
        network: this.createComponentHealth(),
        models: this.createComponentHealth(),
        database: this.createComponentHealth()
      },
      score: 100,
      issues: [],
      lastUpdate: new Date()
    };
  }

  private createComponentHealth(): ComponentHealth {
    return {
      status: 'healthy',
      utilization: 0,
      availability: 100,
      performance: 100,
      errors: 0,
      warnings: 0,
      trends: {
        utilization: 'stable',
        performance: 'stable',
        errors: 'stable'
      }
    };
  }

  start(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds

    this.emit('monitoring_started', { timestamp: new Date() });
  }

  stop(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    this.emit('monitoring_stopped', { timestamp: new Date() });
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const systemState = enterpriseStateManager.getSystemState();
      if (!systemState) {
        return;
      }

      // Update component health
      this.updateComponentHealth('compute', systemState.resources.cpu);
      this.updateComponentHealth('memory', systemState.resources.memory);
      this.updateComponentHealth('storage', systemState.resources.disk);
      this.updateComponentHealth('network', systemState.resources.network);

      // Check models health
      this.updateModelsHealth();

      // Check database health
      this.updateDatabaseHealth();

      // Update overall health
      this.updateOverallHealth();

      this.systemHealth.lastUpdate = new Date();

      this.emit('health_updated', {
        health: this.systemHealth,
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('health_check_error', { error, timestamp: new Date() });
    }
  }

  private updateComponentHealth(componentName: keyof SystemHealth['components'], resource: any): void {
    const component = this.systemHealth.components[componentName];

    // Update utilization
    const previousUtilization = component.utilization;
    component.utilization = resource.utilization;

    // Update status based on utilization
    if (resource.utilization > 95) {
      component.status = 'critical';
    } else if (resource.utilization > 85) {
      component.status = 'degraded';
    } else if (resource.utilization > 75) {
      component.status = 'healthy';
    } else {
      component.status = 'healthy';
    }

    // Update trends
    if (component.utilization > previousUtilization * 1.1) {
      component.trends.utilization = 'degrading';
    } else if (component.utilization < previousUtilization * 0.9) {
      component.trends.utilization = 'improving';
    } else {
      component.trends.utilization = 'stable';
    }

    // Update performance score
    component.performance = Math.max(0, 100 - resource.utilization);

    // Generate issues if needed
    this.checkComponentIssues(componentName, component);
  }

  private updateModelsHealth(): void {
    const models = enterpriseStateManager.getAllModels();
    const component = this.systemHealth.components.models;

    const healthyModels = models.filter(m => m.status === 'trained' || m.status === 'deployed').length;
    const totalModels = models.length;

    component.availability = totalModels > 0 ? (healthyModels / totalModels) * 100 : 100;

    if (component.availability < 50) {
      component.status = 'critical';
    } else if (component.availability < 80) {
      component.status = 'degraded';
    } else {
      component.status = 'healthy';
    }

    // Calculate average model performance
    const accuracies = models.map(m => m.performance.accuracy);
    component.performance = accuracies.length > 0 ?
      (accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length) * 100 : 100;

    // Count errors
    component.errors = models.reduce((sum, m) => sum + m.monitoring.errors, 0);
  }

  private updateDatabaseHealth(): void {
    const component = this.systemHealth.components.database;

    // Simulate database health check
    component.status = 'healthy';
    component.availability = 99.9;
    component.performance = 95;
    component.utilization = Math.random() * 60 + 20; // 20-80%
  }

  private updateOverallHealth(): void {
    const components = Object.values(this.systemHealth.components);

    // Calculate overall score
    const scores = components.map(comp => {
      const statusScore = {
        healthy: 100,
        degraded: 60,
        critical: 20,
        down: 0
      }[comp.status];

      return (statusScore + comp.performance + comp.availability) / 3;
    });

    this.systemHealth.score = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

    // Determine overall status
    const criticalComponents = components.filter(comp => comp.status === 'critical').length;
    const degradedComponents = components.filter(comp => comp.status === 'degraded').length;

    if (criticalComponents > 0) {
      this.systemHealth.overall = 'critical';
    } else if (degradedComponents > 1) {
      this.systemHealth.overall = 'degraded';
    } else if (degradedComponents > 0 || this.systemHealth.score < 90) {
      this.systemHealth.overall = 'degraded';
    } else {
      this.systemHealth.overall = 'healthy';
    }
  }

  private checkComponentIssues(componentName: string, component: ComponentHealth): void {
    const existingIssues = this.systemHealth.issues.filter(issue =>
      issue.component === componentName
    );

    // Clear resolved issues
    this.systemHealth.issues = this.systemHealth.issues.filter(issue =>
      issue.component !== componentName || component.status !== 'healthy'
    );

    // Add new issues
    if (component.status === 'critical') {
      const issueId = `${componentName}_critical_${Date.now()}`;
      if (!existingIssues.some(issue => issue.severity === 'critical')) {
        this.systemHealth.issues.push({
          id: issueId,
          component: componentName,
          severity: 'critical',
          description: `${componentName} component is in critical state`,
          impact: 'Severe performance degradation',
          recommendation: `Immediately investigate ${componentName} resource usage`,
          firstSeen: new Date(),
          lastSeen: new Date(),
          occurrences: 1
        });
      }
    } else if (component.status === 'degraded') {
      const issueId = `${componentName}_degraded_${Date.now()}`;
      if (!existingIssues.some(issue => issue.severity === 'warning')) {
        this.systemHealth.issues.push({
          id: issueId,
          component: componentName,
          severity: 'warning',
          description: `${componentName} component performance is degraded`,
          impact: 'Reduced system performance',
          recommendation: `Monitor ${componentName} and consider optimization`,
          firstSeen: new Date(),
          lastSeen: new Date(),
          occurrences: 1
        });
      }
    }
  }

  getSystemHealth(): SystemHealth {
    return { ...this.systemHealth };
  }

  getComponentHealth(componentName: keyof SystemHealth['components']): ComponentHealth {
    return { ...this.systemHealth.components[componentName] };
  }

  getHealthIssues(severity?: HealthIssue['severity']): HealthIssue[] {
    if (severity) {
      return this.systemHealth.issues.filter(issue => issue.severity === severity);
    }
    return [...this.systemHealth.issues];
  }

  acknowledgeIssue(issueId: string): boolean {
    const issueIndex = this.systemHealth.issues.findIndex(issue => issue.id === issueId);
    if (issueIndex === -1) {
      return false;
    }

    this.systemHealth.issues.splice(issueIndex, 1);
    this.emit('issue_acknowledged', { issueId, timestamp: new Date() });
    return true;
  }
}

// ==================== PERFORMANCE MONITORING SERVICE ====================

export class PerformanceMonitoringService extends EventEmitter {
  private metricCollector: MetricCollector;
  private alertManager: AlertManager;
  private performanceOptimizer: PerformanceOptimizer;
  private healthMonitor: HealthMonitor;
  private config: MonitoringConfiguration;
  private isInitialized = false;

  constructor(config?: Partial<MonitoringConfiguration>) {
    super();

    this.config = {
      collection: {
        interval: 30000, // 30 seconds
        batchSize: 100,
        compression: true,
        sampling: {
          enabled: false,
          rate: 1.0,
          strategy: 'uniform'
        }
      },
      retention: {
        raw: 24, // 24 hours
        aggregated: 30, // 30 days
        longTerm: 12 // 12 months
      },
      alerting: {
        enabled: true,
        escalation: true,
        channels: ['webhook'],
        suppressionWindow: 300000 // 5 minutes
      },
      optimization: {
        autoOptimization: false,
        optimizationWindow: 3600000, // 1 hour
        safetyMargin: 20, // 20%
        rollbackEnabled: true
      },
      ...config
    };

    this.metricCollector = new MetricCollector(this.config);
    this.alertManager = new AlertManager(this.config);
    this.performanceOptimizer = new PerformanceOptimizer(this.config);
    this.healthMonitor = new HealthMonitor();

    this.setupEventForwarding();
  }

  private setupEventForwarding(): void {
    // Forward metric collection events
    this.metricCollector.on('metrics_collected', (event) => {
      // Send metrics to alert manager
      this.alertManager.evaluateMetrics(event.metrics);

      // Send metrics to optimizer
      this.performanceOptimizer.analyzePerformance(event.metrics);

      // Forward event
      this.emit('metrics_collected', event);
    });

    // Forward alert events
    this.alertManager.on('alert_triggered', (alert) => {
      this.emit('alert_triggered', alert);
    });

    this.alertManager.on('alert_resolved', (alert) => {
      this.emit('alert_resolved', alert);
    });

    // Forward optimization events
    this.performanceOptimizer.on('recommendations_generated', (event) => {
      this.emit('optimization_recommendations', event);
    });

    this.performanceOptimizer.on('optimization_completed', (event) => {
      this.emit('optimization_completed', event);
    });

    // Forward health monitoring events
    this.healthMonitor.on('health_updated', (event) => {
      this.emit('health_updated', event);
    });
  }

  async initialize(): Promise<void> {
    try {
      // Start all monitoring components
      this.metricCollector.start();
      this.healthMonitor.start();

      this.isInitialized = true;
      this.emit('initialized');
      console.log('✅ Performance Monitoring Service initialized');

    } catch (error) {
      console.error('❌ Failed to initialize performance monitoring service:', error);
      throw error;
    }
  }

  // ==================== METRICS API ====================

  getMetrics(metricName?: string, timeRange?: { start: Date; end: Date }): PerformanceMetric[] {
    if (metricName) {
      return this.metricCollector.getMetricHistory(metricName, timeRange);
    }

    const allMetrics: PerformanceMetric[] = [];
    this.metricCollector.getMetricNames().forEach(name => {
      allMetrics.push(...this.metricCollector.getMetricHistory(name, timeRange));
    });

    return allMetrics;
  }

  getCurrentMetrics(): Record<string, PerformanceMetric> {
    const current: Record<string, PerformanceMetric> = {};
    this.metricCollector.getMetricNames().forEach(name => {
      const metric = this.metricCollector.getCurrentValue(name);
      if (metric) {
        current[name] = metric;
      }
    });
    return current;
  }

  getMetricNames(): string[] {
    return this.metricCollector.getMetricNames();
  }

  // ==================== ALERTS API ====================

  getAlerts(activeOnly = false): Alert[] {
    return activeOnly ? this.alertManager.getActiveAlerts() : this.alertManager.getAllAlerts();
  }

  getAlert(alertId: string): Alert | undefined {
    return this.alertManager.getAlert(alertId);
  }

  addAlertRule(ruleId: string, rule: AlertCondition & { name: string; metric: string; severity: Alert['severity'] }): void {
    this.alertManager.addAlertRule(ruleId, rule);
  }

  removeAlertRule(ruleId: string): boolean {
    return this.alertManager.removeAlertRule(ruleId);
  }

  suppressAlert(alertId: string, duration: number): boolean {
    return this.alertManager.suppressAlert(alertId, duration);
  }

  // ==================== OPTIMIZATION API ====================

  getOptimizationRecommendations(filter?: {
    type?: OptimizationRecommendation['type'];
    priority?: OptimizationRecommendation['priority'];
    status?: OptimizationRecommendation['status'];
  }): OptimizationRecommendation[] {
    return this.performanceOptimizer.getRecommendations(filter);
  }

  async applyOptimization(recommendationId: string): Promise<boolean> {
    return this.performanceOptimizer.applyOptimization(recommendationId);
  }

  getOptimizationHistory(): any[] {
    return this.performanceOptimizer.getOptimizationHistory();
  }

  getPerformanceBaselines(): PerformanceBaseline[] {
    return this.performanceOptimizer.getBaselines();
  }

  getPerformanceBaseline(metricName: string): PerformanceBaseline | undefined {
    return this.performanceOptimizer.getBaseline(metricName);
  }

  // ==================== HEALTH API ====================

  getSystemHealth(): SystemHealth {
    return this.healthMonitor.getSystemHealth();
  }

  getComponentHealth(componentName: keyof SystemHealth['components']): ComponentHealth {
    return this.healthMonitor.getComponentHealth(componentName);
  }

  getHealthIssues(severity?: HealthIssue['severity']): HealthIssue[] {
    return this.healthMonitor.getHealthIssues(severity);
  }

  acknowledgeHealthIssue(issueId: string): boolean {
    return this.healthMonitor.acknowledgeIssue(issueId);
  }

  // ==================== CONFIGURATION API ====================

  updateConfiguration(updates: Partial<MonitoringConfiguration>): void {
    Object.assign(this.config, updates);
    this.emit('configuration_updated', { config: this.config, timestamp: new Date() });
  }

  getConfiguration(): MonitoringConfiguration {
    return { ...this.config };
  }

  // ==================== UTILITIES ====================

  async generatePerformanceReport(): Promise<{
    summary: {
      healthScore: number;
      activeAlerts: number;
      optimizationOpportunities: number;
      uptime: number;
    };
    metrics: Record<string, PerformanceMetric>;
    alerts: Alert[];
    recommendations: OptimizationRecommendation[];
    health: SystemHealth;
  }> {
    const health = this.getSystemHealth();
    const alerts = this.getAlerts(true);
    const recommendations = this.getOptimizationRecommendations({ status: 'pending' });
    const metrics = this.getCurrentMetrics();

    return {
      summary: {
        healthScore: health.score,
        activeAlerts: alerts.length,
        optimizationOpportunities: recommendations.length,
        uptime: enterpriseStateManager.getSystemState()?.uptime || 0
      },
      metrics,
      alerts,
      recommendations,
      health
    };
  }

  async cleanup(): Promise<void> {
    this.metricCollector.stop();
    this.healthMonitor.stop();
    this.isInitialized = false;
    this.emit('cleanup');
  }
}

// Export singleton instance
export const performanceMonitoringService = new PerformanceMonitoringService();
export default performanceMonitoringService;