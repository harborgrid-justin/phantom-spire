/**
 * Enterprise Performance Monitoring and Optimization System
 * Comprehensive performance monitoring, alerting, optimization, and observability
 * Provides real-time metrics, automated optimization, and intelligent recommendations
 *
 * This service integrates multiple monitoring components:
 * - MetricCollector: Collects and stores performance metrics
 * - AlertManager: Manages alert rules and notifications
 * - PerformanceOptimizer: Analyzes performance and generates recommendations
 * - HealthMonitor: Monitors overall system health
 */

import { EventEmitter } from 'events';

// Import all types from the centralized types module
import type {
  MonitoringConfiguration,
  PerformanceMetric,
  Alert,
  AlertRule,
  AlertCondition,
  OptimizationRecommendation,
  OptimizationFilter,
  PerformanceBaseline,
  SystemHealth,
  ComponentHealth,
  HealthIssue,
  ComponentName,
  TimeRange,
  AlertSeverity
} from './monitoring.types';

// Import the modular components
import { MetricCollector } from './metric-collector';
import { AlertManager } from './alert-manager';
import { PerformanceOptimizer } from './performance-optimizer';
import { HealthMonitor } from './health-monitor';

// Re-export all types for backward compatibility
export type {
  MonitoringConfiguration,
  PerformanceMetric,
  Alert,
  AlertRule,
  AlertCondition,
  OptimizationRecommendation,
  OptimizationFilter,
  PerformanceBaseline,
  SystemHealth,
  ComponentHealth,
  HealthIssue,
  ComponentName,
  TimeRange,
  AlertSeverity
} from './monitoring.types';

// Re-export the component classes for direct access if needed
export { MetricCollector } from './metric-collector';
export { AlertManager } from './alert-manager';
export { PerformanceOptimizer } from './performance-optimizer';
export { HealthMonitor } from './health-monitor';

/**
 * Main Performance Monitoring Service
 * Orchestrates all monitoring components and provides a unified API
 */
export class PerformanceMonitoringService extends EventEmitter {
  private metricCollector: MetricCollector;
  private alertManager: AlertManager;
  private performanceOptimizer: PerformanceOptimizer;
  private healthMonitor: HealthMonitor;
  private config: MonitoringConfiguration;
  private isInitialized = false;

  constructor(config?: Partial<MonitoringConfiguration>) {
    super();

    // Set default configuration with enterprise-grade settings
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
      ...config // Override with provided config
    };

    // Initialize all monitoring components
    this.metricCollector = new MetricCollector(this.config);
    this.alertManager = new AlertManager(this.config);
    this.performanceOptimizer = new PerformanceOptimizer(this.config);
    this.healthMonitor = new HealthMonitor();

    // Set up event forwarding between components
    this.setupEventForwarding();
  }

  // ==================== INITIALIZATION ====================

  /**
   * Set up event forwarding between monitoring components
   */
  private setupEventForwarding(): void {
    // Forward metric collection events
    this.metricCollector.on('metrics_collected', (event) => {
      // Send metrics to alert manager for evaluation
      this.alertManager.evaluateMetrics(event.metrics);

      // Send metrics to optimizer for analysis
      this.performanceOptimizer.analyzePerformance(event.metrics);

      // Forward event to external consumers
      this.emit('metrics_collected', event);
    });

    // Forward collection events
    this.metricCollector.on('collection_started', (event) => {
      this.emit('collection_started', event);
    });

    this.metricCollector.on('collection_stopped', (event) => {
      this.emit('collection_stopped', event);
    });

    this.metricCollector.on('collection_error', (event) => {
      this.emit('collection_error', event);
    });

    // Forward alert events
    this.alertManager.on('alert_triggered', (alert) => {
      this.emit('alert_triggered', alert);
    });

    this.alertManager.on('alert_resolved', (alert) => {
      this.emit('alert_resolved', alert);
    });

    this.alertManager.on('alert_suppressed', (event) => {
      this.emit('alert_suppressed', event);
    });

    this.alertManager.on('rule_added', (event) => {
      this.emit('alert_rule_added', event);
    });

    this.alertManager.on('rule_removed', (event) => {
      this.emit('alert_rule_removed', event);
    });

    // Forward optimization events
    this.performanceOptimizer.on('recommendations_generated', (event) => {
      this.emit('optimization_recommendations', event);
    });

    this.performanceOptimizer.on('optimization_started', (event) => {
      this.emit('optimization_started', event);
    });

    this.performanceOptimizer.on('optimization_completed', (event) => {
      this.emit('optimization_completed', event);
    });

    this.performanceOptimizer.on('optimization_failed', (event) => {
      this.emit('optimization_failed', event);
    });

    this.performanceOptimizer.on('optimization_rolled_back', (event) => {
      this.emit('optimization_rolled_back', event);
    });

    // Forward health monitoring events
    this.healthMonitor.on('health_updated', (event) => {
      this.emit('health_updated', event);
    });

    this.healthMonitor.on('health_issue_detected', (event) => {
      this.emit('health_issue_detected', event);
    });

    this.healthMonitor.on('issue_acknowledged', (event) => {
      this.emit('health_issue_acknowledged', event);
    });

    this.healthMonitor.on('monitoring_started', (event) => {
      this.emit('health_monitoring_started', event);
    });

    this.healthMonitor.on('monitoring_stopped', (event) => {
      this.emit('health_monitoring_stopped', event);
    });
  }

  /**
   * Initialize the performance monitoring service
   */
  async initialize(): Promise<void> {
    try {
      // Start all monitoring components
      this.metricCollector.start();
      this.healthMonitor.start();

      this.isInitialized = true;
      this.emit('initialized', { timestamp: new Date() });
      console.log('✅ Performance Monitoring Service initialized');

    } catch (error) {
      console.error('❌ Failed to initialize performance monitoring service:', error);
      this.emit('initialization_failed', { error, timestamp: new Date() });
      throw error;
    }
  }

  // ==================== METRICS API ====================

  /**
   * Get performance metrics with optional filtering
   */
  getMetrics(metricName?: string, timeRange?: TimeRange): PerformanceMetric[] {
    if (metricName) {
      return this.metricCollector.getMetricHistory(metricName, timeRange);
    }

    const allMetrics: PerformanceMetric[] = [];
    this.metricCollector.getMetricNames().forEach(name => {
      allMetrics.push(...this.metricCollector.getMetricHistory(name, timeRange));
    });

    return allMetrics;
  }

  /**
   * Get current values for all metrics
   */
  getCurrentMetrics(): Record<string, PerformanceMetric> {
    return this.metricCollector.getCurrentValues();
  }

  /**
   * Get all available metric names
   */
  getMetricNames(): string[] {
    return this.metricCollector.getMetricNames();
  }

  /**
   * Get current value for a specific metric
   */
  getCurrentMetricValue(metricName: string): PerformanceMetric | undefined {
    return this.metricCollector.getCurrentValue(metricName);
  }

  /**
   * Manually add a metric (for external integration)
   */
  addMetric(metric: PerformanceMetric): void {
    this.metricCollector.addMetric(metric);
  }

  /**
   * Get metric collection statistics
   */
  getCollectionStatistics(): ReturnType<MetricCollector['getCollectionStats']> {
    return this.metricCollector.getCollectionStats();
  }

  // ==================== ALERTS API ====================

  /**
   * Get alerts with optional filtering
   */
  getAlerts(activeOnly = false): Alert[] {
    return activeOnly ? this.alertManager.getActiveAlerts() : this.alertManager.getAllAlerts();
  }

  /**
   * Get specific alert by ID
   */
  getAlert(alertId: string): Alert | undefined {
    return this.alertManager.getAlert(alertId);
  }

  /**
   * Get alerts by severity level
   */
  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return this.alertManager.getAlertsBySeverity(severity);
  }

  /**
   * Add a new alert rule
   */
  addAlertRule(ruleId: string, rule: AlertRule): void {
    this.alertManager.addAlertRule(ruleId, rule);
  }

  /**
   * Remove an alert rule
   */
  removeAlertRule(ruleId: string): boolean {
    return this.alertManager.removeAlertRule(ruleId);
  }

  /**
   * Update an existing alert rule
   */
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    return this.alertManager.updateAlertRule(ruleId, updates);
  }

  /**
   * Get all alert rules
   */
  getAlertRules(): Map<string, AlertRule> {
    return this.alertManager.getAlertRules();
  }

  /**
   * Suppress an alert for a specified duration
   */
  suppressAlert(alertId: string, duration: number): boolean {
    return this.alertManager.suppressAlert(alertId, duration);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    return this.alertManager.acknowledgeAlert(alertId);
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(): ReturnType<AlertManager['getAlertStatistics']> {
    return this.alertManager.getAlertStatistics();
  }

  // ==================== OPTIMIZATION API ====================

  /**
   * Get optimization recommendations with optional filtering
   */
  getOptimizationRecommendations(filter?: OptimizationFilter): OptimizationRecommendation[] {
    return this.performanceOptimizer.getRecommendations(filter);
  }

  /**
   * Apply an optimization recommendation
   */
  async applyOptimization(recommendationId: string): Promise<boolean> {
    return this.performanceOptimizer.applyOptimization(recommendationId);
  }

  /**
   * Get optimization history
   */
  getOptimizationHistory(): ReturnType<PerformanceOptimizer['getOptimizationHistory']> {
    return this.performanceOptimizer.getOptimizationHistory();
  }

  /**
   * Get performance baselines
   */
  getPerformanceBaselines(): PerformanceBaseline[] {
    return this.performanceOptimizer.getBaselines();
  }

  /**
   * Get specific performance baseline
   */
  getPerformanceBaseline(metricName: string): PerformanceBaseline | undefined {
    return this.performanceOptimizer.getBaseline(metricName);
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStatistics(): ReturnType<PerformanceOptimizer['getOptimizationStatistics']> {
    return this.performanceOptimizer.getOptimizationStatistics();
  }

  // ==================== HEALTH API ====================

  /**
   * Get overall system health
   */
  getSystemHealth(): SystemHealth {
    return this.healthMonitor.getSystemHealth();
  }

  /**
   * Get specific component health
   */
  getComponentHealth(componentName: ComponentName): ComponentHealth {
    return this.healthMonitor.getComponentHealth(componentName);
  }

  /**
   * Get health issues with optional severity filtering
   */
  getHealthIssues(severity?: HealthIssue['severity']): HealthIssue[] {
    return this.healthMonitor.getHealthIssues(severity);
  }

  /**
   * Acknowledge a health issue
   */
  acknowledgeHealthIssue(issueId: string): boolean {
    return this.healthMonitor.acknowledgeIssue(issueId);
  }

  /**
   * Get health statistics
   */
  getHealthStatistics(): ReturnType<HealthMonitor['getHealthStatistics']> {
    return this.healthMonitor.getHealthStatistics();
  }

  /**
   * Force a health check
   */
  async forceHealthCheck(): Promise<SystemHealth> {
    return this.healthMonitor.forceHealthCheck();
  }

  /**
   * Set custom component metrics
   */
  setComponentMetrics(componentName: ComponentName, metrics: Partial<ComponentHealth>): void {
    this.healthMonitor.setComponentMetrics(componentName, metrics);
  }

  // ==================== CONFIGURATION API ====================

  /**
   * Update monitoring configuration
   */
  updateConfiguration(updates: Partial<MonitoringConfiguration>): void {
    Object.assign(this.config, updates);

    // Update configuration in all components
    this.metricCollector.updateConfiguration(this.config);

    this.emit('configuration_updated', { config: this.config, timestamp: new Date() });
  }

  /**
   * Get current configuration
   */
  getConfiguration(): MonitoringConfiguration {
    return { ...this.config };
  }

  // ==================== UTILITIES ====================

  /**
   * Generate comprehensive performance report
   */
  async generatePerformanceReport(): Promise<{
    summary: {
      healthScore: number;
      activeAlerts: number;
      optimizationOpportunities: number;
      uptime: number;
      totalMetrics: number;
    };
    metrics: Record<string, PerformanceMetric>;
    alerts: Alert[];
    recommendations: OptimizationRecommendation[];
    health: SystemHealth;
    statistics: {
      collection: ReturnType<MetricCollector['getCollectionStats']>;
      alerts: ReturnType<AlertManager['getAlertStatistics']>;
      optimization: ReturnType<PerformanceOptimizer['getOptimizationStatistics']>;
      health: ReturnType<HealthMonitor['getHealthStatistics']>;
    };
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
        uptime: health.components.compute.availability,
        totalMetrics: Object.keys(metrics).length
      },
      metrics,
      alerts,
      recommendations,
      health,
      statistics: {
        collection: this.getCollectionStatistics(),
        alerts: this.getAlertStatistics(),
        optimization: this.getOptimizationStatistics(),
        health: this.getHealthStatistics()
      }
    };
  }

  /**
   * Check if the service is properly initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get service status
   */
  getServiceStatus(): {
    initialized: boolean;
    collecting: boolean;
    monitoring: boolean;
    components: {
      metricCollector: boolean;
      alertManager: boolean;
      performanceOptimizer: boolean;
      healthMonitor: boolean;
    };
  } {
    const collectionStats = this.metricCollector.getCollectionStats();

    return {
      initialized: this.isInitialized,
      collecting: collectionStats.isCollecting,
      monitoring: true, // Health monitor doesn't expose this directly
      components: {
        metricCollector: true,
        alertManager: true,
        performanceOptimizer: true,
        healthMonitor: true
      }
    };
  }

  /**
   * Cleanup resources and stop monitoring
   */
  async cleanup(): Promise<void> {
    try {
      // Stop all monitoring components
      this.metricCollector.stop();
      this.healthMonitor.stop();

      // Clean up old data
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

      this.metricCollector.clearOldMetrics(cutoffDate);
      this.alertManager.cleanupOldAlerts(cutoffDate);
      this.performanceOptimizer.cleanup(cutoffDate);
      this.healthMonitor.cleanupOldIssues(cutoffDate);

      this.isInitialized = false;
      this.emit('cleanup', { timestamp: new Date() });

      console.log('✅ Performance Monitoring Service cleaned up');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      this.emit('cleanup_error', { error, timestamp: new Date() });
      throw error;
    }
  }
}

// ==================== SINGLETON INSTANCE ====================

/**
 * Singleton instance of the Performance Monitoring Service
 * Ready to use with default enterprise configuration
 */
export const performanceMonitoringService = new PerformanceMonitoringService();

/**
 * Default export for convenience
 */
export default performanceMonitoringService;