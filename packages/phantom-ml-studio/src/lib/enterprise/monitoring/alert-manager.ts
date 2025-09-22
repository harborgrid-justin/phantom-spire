/**
 * Enterprise Alert Manager
 * Handles alert rule evaluation, notification management, and escalation
 */

import { EventEmitter } from 'events';
import {
  MonitoringConfiguration,
  PerformanceMetric,
  Alert,
  AlertRule,
  AlertCondition,
  NotificationHistory,
  AlertSeverity
} from './monitoring.types';
import {
  matchesPattern,
  checkThreshold,
  generateId
} from './monitoring.utils';

export class AlertManager extends EventEmitter {
  private alerts: Map<string, Alert> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private suppressionWindows: Map<string, Date> = new Map();
  private config: MonitoringConfiguration;

  constructor(config: MonitoringConfiguration) {
    super();
    this.config = config;
    this.initializeDefaultRules();
  }

  // ==================== INITIALIZATION ====================

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

    // Disk space alert
    this.alertRules.set('high_disk_utilization', {
      name: 'High Disk Utilization',
      metric: 'system.disk.utilization',
      severity: 'warning',
      operator: 'gt',
      threshold: 85,
      timeWindow: 300000,
      consecutiveViolations: 3,
      recovery: {
        operator: 'lt',
        threshold: 75,
        timeWindow: 120000
      }
    });

    // Network utilization alert
    this.alertRules.set('high_network_utilization', {
      name: 'High Network Utilization',
      metric: 'system.network.utilization',
      severity: 'warning',
      operator: 'gt',
      threshold: 90,
      timeWindow: 180000,
      consecutiveViolations: 2,
      recovery: {
        operator: 'lt',
        threshold: 80,
        timeWindow: 120000
      }
    });
  }

  // ==================== EVALUATION METHODS ====================

  /**
   * Evaluate metrics against all alert rules
   */
  evaluateMetrics(metrics: PerformanceMetric[]): void {
    metrics.forEach(metric => {
      this.alertRules.forEach((rule, ruleId) => {
        if (rule.metric === metric.name || matchesPattern(rule.metric, metric.name)) {
          this.evaluateRule(ruleId, rule, metric);
        }
      });
    });
  }

  private evaluateRule(ruleId: string, rule: AlertRule, metric: PerformanceMetric): void {
    const isViolation = checkThreshold(metric.value, rule.threshold, rule.operator);
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
      if (checkThreshold(metric.value, rule.recovery.threshold, rule.recovery.operator)) {
        this.resolveAlert(existingAlert.id, metric.timestamp);
      }
    }
  }

  private getActiveAlert(ruleId: string, tags: Record<string, string>): Alert | undefined {
    return Array.from(this.alerts.values()).find(alert =>
      alert.name.includes(ruleId) &&
      alert.status === 'active' &&
      this.tagsMatch(alert.metric, tags)
    );
  }

  private tagsMatch(alertMetric: string, metricTags: Record<string, string>): boolean {
    // For simplicity, we'll match on metric name
    // In a real implementation, you might want more sophisticated tag matching
    return true;
  }

  // ==================== ALERT CREATION AND MANAGEMENT ====================

  private createAlert(ruleId: string, rule: AlertRule, metric: PerformanceMetric): void {
    const alertId = generateId('alert', ruleId);

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

  // ==================== NOTIFICATION METHODS ====================

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
          recipient: 'system', // Would be actual recipient in real implementation
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
    // Simulate notification sending - in real implementation, integrate with actual services
    const notificationData = {
      alertId: alert.id,
      severity: alert.severity,
      title: alert.name,
      description: alert.description,
      timestamp: alert.triggeredAt,
      recommendations: alert.recommendations
    };

    switch (channel) {
      case 'email':
        console.log(`📧 Email Alert: ${alert.name}`, notificationData);
        break;
      case 'slack':
        console.log(`💬 Slack Alert: ${alert.name}`, notificationData);
        break;
      case 'webhook':
        console.log(`🔗 Webhook Alert: ${alert.name}`, notificationData);
        break;
      case 'teams':
        console.log(`👥 Teams Alert: ${alert.name}`, notificationData);
        break;
      case 'pagerduty':
        console.log(`📟 PagerDuty Alert: ${alert.name}`, notificationData);
        break;
      default:
        console.log(`📨 ${channel} Alert: ${alert.name}`, notificationData);
    }

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async sendResolutionNotification(alert: Alert): Promise<void> {
    if (!this.config.alerting.enabled) {
      return;
    }

    console.log(`✅ Alert Resolved: ${alert.name} (Duration: ${this.getAlertDuration(alert)})`);

    // Send resolution to all channels that received the original alert
    const successfulChannels = alert.notifications
      .filter(n => n.status === 'sent')
      .map(n => n.channel);

    for (const channel of [...new Set(successfulChannels)]) {
      try {
        await this.sendResolutionToChannel(channel, alert);
      } catch (error) {
        console.error(`Failed to send resolution notification to ${channel}:`, error);
      }
    }
  }

  private async sendResolutionToChannel(channel: string, alert: Alert): Promise<void> {
    const resolutionData = {
      alertId: alert.id,
      title: alert.name,
      resolvedAt: alert.resolvedAt,
      duration: this.getAlertDuration(alert)
    };

    console.log(`✅ ${channel} Resolution: ${alert.name}`, resolutionData);
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // ==================== ALERT CONTENT GENERATION ====================

  private generateAlertDescription(rule: AlertRule, metric: PerformanceMetric): string {
    const operatorText = this.getOperatorText(rule.operator);
    return `${rule.name}: ${metric.name} is ${metric.value} ${metric.unit}, which is ${operatorText} ${rule.threshold} ${metric.unit}`;
  }

  private getOperatorText(operator: string): string {
    const operatorMap: Record<string, string> = {
      'gt': 'greater than',
      'lt': 'less than',
      'eq': 'equal to',
      'ne': 'not equal to',
      'gte': 'greater than or equal to',
      'lte': 'less than or equal to'
    };
    return operatorMap[operator] || operator;
  }

  private assessImpact(severity: AlertSeverity, metric: PerformanceMetric): string {
    const impacts: Record<AlertSeverity, string> = {
      info: 'Minimal impact on system performance',
      warning: 'Potential performance degradation',
      error: 'Significant impact on system operations',
      critical: 'Severe impact requiring immediate attention'
    };

    return impacts[severity];
  }

  private generateRecommendations(rule: AlertRule, metric: PerformanceMetric): string[] {
    const recommendations: string[] = [];

    if (metric.name.includes('cpu')) {
      recommendations.push('Check for CPU-intensive processes');
      recommendations.push('Consider scaling up compute resources');
      recommendations.push('Review algorithm efficiency');
      recommendations.push('Optimize code for better CPU utilization');
    }

    if (metric.name.includes('memory')) {
      recommendations.push('Investigate memory leaks');
      recommendations.push('Optimize data structures');
      recommendations.push('Consider increasing memory allocation');
      recommendations.push('Review caching strategies');
    }

    if (metric.name.includes('disk')) {
      recommendations.push('Clean up temporary files');
      recommendations.push('Archive old log files');
      recommendations.push('Consider adding more storage');
      recommendations.push('Implement log rotation');
    }

    if (metric.name.includes('network')) {
      recommendations.push('Check network connectivity');
      recommendations.push('Optimize data transfer protocols');
      recommendations.push('Consider load balancing');
      recommendations.push('Review bandwidth requirements');
    }

    if (metric.name.includes('accuracy')) {
      recommendations.push('Review model training data quality');
      recommendations.push('Consider model retraining');
      recommendations.push('Check for data drift');
      recommendations.push('Validate input data preprocessing');
    }

    if (metric.name.includes('error')) {
      recommendations.push('Review error logs for root cause');
      recommendations.push('Check input data validation');
      recommendations.push('Verify model deployment configuration');
      recommendations.push('Monitor system dependencies');
    }

    return recommendations;
  }

  // ==================== PUBLIC API METHODS ====================

  /**
   * Get all active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.status === 'active');
  }

  /**
   * Get all alerts (active and resolved)
   */
  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Get specific alert by ID
   */
  getAlert(alertId: string): Alert | undefined {
    return this.alerts.get(alertId);
  }

  /**
   * Add a new alert rule
   */
  addAlertRule(ruleId: string, rule: AlertRule): void {
    this.alertRules.set(ruleId, rule);
    this.emit('rule_added', { ruleId, rule });
  }

  /**
   * Remove an alert rule
   */
  removeAlertRule(ruleId: string): boolean {
    const removed = this.alertRules.delete(ruleId);
    if (removed) {
      this.emit('rule_removed', { ruleId });
    }
    return removed;
  }

  /**
   * Get all alert rules
   */
  getAlertRules(): Map<string, AlertRule> {
    return new Map(this.alertRules);
  }

  /**
   * Update an existing alert rule
   */
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const existingRule = this.alertRules.get(ruleId);
    if (!existingRule) {
      return false;
    }

    const updatedRule = { ...existingRule, ...updates };
    this.alertRules.set(ruleId, updatedRule);
    this.emit('rule_updated', { ruleId, rule: updatedRule });
    return true;
  }

  /**
   * Suppress an alert for a specified duration
   */
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

  /**
   * Acknowledge an alert (mark as resolved manually)
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.status !== 'active') {
      return false;
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();

    this.emit('alert_acknowledged', { alertId });
    return true;
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.severity === severity);
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(): {
    total: number;
    active: number;
    resolved: number;
    suppressed: number;
    bySeverity: Record<AlertSeverity, number>;
    averageResolutionTime: number;
  } {
    const alerts = Array.from(this.alerts.values());
    const active = alerts.filter(a => a.status === 'active').length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;
    const suppressed = alerts.filter(a => a.status === 'suppressed').length;

    const bySeverity: Record<AlertSeverity, number> = {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0
    };

    alerts.forEach(alert => {
      bySeverity[alert.severity]++;
    });

    // Calculate average resolution time for resolved alerts
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved' && a.resolvedAt);
    const avgResolutionTime = resolvedAlerts.length > 0
      ? resolvedAlerts.reduce((sum, alert) => sum + this.getAlertDurationMs(alert), 0) / resolvedAlerts.length
      : 0;

    return {
      total: alerts.length,
      active,
      resolved,
      suppressed,
      bySeverity,
      averageResolutionTime: avgResolutionTime
    };
  }

  // ==================== UTILITY METHODS ====================

  private getAlertDuration(alert: Alert): string {
    if (!alert.resolvedAt) {
      const duration = Date.now() - alert.triggeredAt.getTime();
      return this.formatDuration(duration);
    }

    const duration = alert.resolvedAt.getTime() - alert.triggeredAt.getTime();
    return this.formatDuration(duration);
  }

  private getAlertDurationMs(alert: Alert): number {
    if (!alert.resolvedAt) {
      return Date.now() - alert.triggeredAt.getTime();
    }
    return alert.resolvedAt.getTime() - alert.triggeredAt.getTime();
  }

  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Clean up old resolved alerts
   */
  cleanupOldAlerts(olderThan: Date): number {
    const initialSize = this.alerts.size;

    for (const [alertId, alert] of this.alerts.entries()) {
      if (alert.status === 'resolved' && alert.resolvedAt && alert.resolvedAt < olderThan) {
        this.alerts.delete(alertId);
      }
    }

    const cleaned = initialSize - this.alerts.size;
    if (cleaned > 0) {
      this.emit('alerts_cleaned', { count: cleaned, timestamp: new Date() });
    }

    return cleaned;
  }
}