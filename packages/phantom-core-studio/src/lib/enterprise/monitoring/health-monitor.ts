/**
 * Enterprise Health Monitor
 * Provides comprehensive system health monitoring and issue tracking
 */

import { EventEmitter } from 'events';
import {
  SystemHealth,
  ComponentHealth,
  HealthIssue,
  ComponentName,
  HealthUpdateEvent,
  HealthStatus,
  TrendDirection
} from './monitoring.types';
import { enterpriseStateManager } from '../state/enterprise-state-manager.service';
import { generateId } from './monitoring.utils';

export class HealthMonitor extends EventEmitter {
  private systemHealth: SystemHealth;
  private healthCheckInterval?: NodeJS.Timeout;
  private isMonitoring = false;
  private previousMetrics: Map<ComponentName, ComponentHealth> = new Map();

  constructor() {
    super();
    this.systemHealth = this.initializeSystemHealth();
  }

  // ==================== INITIALIZATION ====================

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

  // ==================== LIFECYCLE METHODS ====================

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

  // ==================== HEALTH CHECK METHODS ====================

  private async performHealthCheck(): Promise<void> {
    try {
      const systemState = enterpriseStateManager.getSystemState();
      if (!systemState) {
        return;
      }

      // Store previous metrics for trend analysis
      this.storePreviousMetrics();

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
      } as HealthUpdateEvent);

    } catch (error) {
      this.emit('health_check_error', { error, timestamp: new Date() });
    }
  }

  private storePreviousMetrics(): void {
    Object.entries(this.systemHealth.components).forEach(([name, component]) => {
      this.previousMetrics.set(name as ComponentName, { ...component });
    });
  }

  private updateComponentHealth(componentName: ComponentName, resource: any): void {
    const component = this.systemHealth.components[componentName];
    const previous = this.previousMetrics.get(componentName);

    // Update utilization
    component.utilization = resource.utilization;

    // Update status based on utilization
    component.status = this.determineHealthStatus(resource.utilization);

    // Update trends if we have previous data
    if (previous) {
      component.trends = this.calculateTrends(component, previous);
    }

    // Update performance score
    component.performance = this.calculatePerformanceScore(component);

    // Update availability (simulate based on status)
    component.availability = this.calculateAvailability(component.status);

    // Generate issues if needed
    this.checkComponentIssues(componentName, component);
  }

  private determineHealthStatus(utilization: number): HealthStatus {
    if (utilization > 95) {
      return 'critical';
    } else if (utilization > 85) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  private calculateTrends(current: ComponentHealth, previous: ComponentHealth): ComponentHealth['trends'] {
    return {
      utilization: this.calculateTrendDirection(current.utilization, previous.utilization),
      performance: this.calculateTrendDirection(current.performance, previous.performance),
      errors: this.calculateTrendDirection(current.errors, previous.errors, true) // true = lower is better
    };
  }

  private calculateTrendDirection(current: number, previous: number, lowerIsBetter = false): TrendDirection {
    const threshold = 0.1; // 10% change threshold
    const change = (current - previous) / previous;

    if (Math.abs(change) < threshold) {
      return 'stable';
    }

    if (lowerIsBetter) {
      return change > 0 ? 'degrading' : 'improving';
    } else {
      return change > 0 ? 'improving' : 'degrading';
    }
  }

  private calculatePerformanceScore(component: ComponentHealth): number {
    // Performance score decreases with higher utilization and more errors
    const utilizationScore = Math.max(0, 100 - component.utilization);
    const errorPenalty = Math.min(50, component.errors * 2); // Max 50 point penalty
    return Math.max(0, utilizationScore - errorPenalty);
  }

  private calculateAvailability(status: HealthStatus): number {
    const availabilityMap: Record<HealthStatus, number> = {
      healthy: 99.9,
      degraded: 95.0,
      critical: 80.0,
      down: 0.0
    };
    return availabilityMap[status];
  }

  private updateModelsHealth(): void {
    const models = enterpriseStateManager.getAllModels();
    const component = this.systemHealth.components.models;

    const healthyModels = models.filter(m => m.status === 'trained' || m.status === 'deployed').length;
    const totalModels = models.length;

    component.availability = totalModels > 0 ? (healthyModels / totalModels) * 100 : 100;

    // Determine status based on availability
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

    // Count errors and warnings
    component.errors = models.reduce((sum, m) => sum + m.monitoring.errors, 0);
    component.warnings = models.reduce((sum, m) => sum + (m.monitoring.warnings || 0), 0);

    // Update utilization based on active models
    const activeModels = models.filter(m => m.status === 'deployed').length;
    component.utilization = totalModels > 0 ? (activeModels / totalModels) * 100 : 0;

    this.checkComponentIssues('models', component);
  }

  private updateDatabaseHealth(): void {
    const component = this.systemHealth.components.database;

    // Simulate database health check - in real implementation, perform actual health checks
    try {
      // Simulate connection test, query performance, etc.
      component.status = 'healthy';
      component.availability = 99.9;
      component.performance = 95;
      component.utilization = Math.random() * 60 + 20; // 20-80%
      component.errors = 0;
      component.warnings = 0;

      // Simulate occasional issues
      if (Math.random() < 0.05) { // 5% chance of degraded performance
        component.status = 'degraded';
        component.performance = 70;
        component.warnings = 1;
      }

    } catch (error) {
      component.status = 'critical';
      component.availability = 0;
      component.performance = 0;
      component.errors++;
    }

    this.checkComponentIssues('database', component);
  }

  private updateOverallHealth(): void {
    const components = Object.values(this.systemHealth.components);

    // Calculate overall score
    const scores = components.map(comp => {
      const statusScore = this.getStatusScore(comp.status);
      return (statusScore + comp.performance + comp.availability) / 3;
    });

    this.systemHealth.score = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

    // Determine overall status
    const criticalComponents = components.filter(comp => comp.status === 'critical').length;
    const degradedComponents = components.filter(comp => comp.status === 'degraded').length;

    if (criticalComponents > 0) {
      this.systemHealth.overall = 'critical';
    } else if (criticalComponents === 0 && degradedComponents > 1) {
      this.systemHealth.overall = 'degraded';
    } else if (degradedComponents > 0 || this.systemHealth.score < 90) {
      this.systemHealth.overall = 'degraded';
    } else {
      this.systemHealth.overall = 'healthy';
    }
  }

  private getStatusScore(status: HealthStatus): number {
    const statusScores: Record<HealthStatus, number> = {
      healthy: 100,
      degraded: 60,
      critical: 20,
      down: 0
    };
    return statusScores[status];
  }

  // ==================== ISSUE MANAGEMENT ====================

  private checkComponentIssues(componentName: ComponentName, component: ComponentHealth): void {
    // Clear resolved issues for this component if status is healthy
    if (component.status === 'healthy') {
      this.systemHealth.issues = this.systemHealth.issues.filter(issue =>
        issue.component !== componentName
      );
      return;
    }

    // Check if we already have an issue for this component and severity
    const existingIssue = this.systemHealth.issues.find(issue =>
      issue.component === componentName &&
      this.getSeverityFromStatus(component.status) === issue.severity
    );

    if (existingIssue) {
      // Update existing issue
      existingIssue.lastSeen = new Date();
      existingIssue.occurrences++;
      existingIssue.description = this.generateIssueDescription(componentName, component);
    } else {
      // Create new issue
      const newIssue = this.createHealthIssue(componentName, component);
      this.systemHealth.issues.push(newIssue);
      this.emit('health_issue_detected', { issue: newIssue, timestamp: new Date() });
    }
  }

  private createHealthIssue(componentName: ComponentName, component: ComponentHealth): HealthIssue {
    const severity = this.getSeverityFromStatus(component.status);
    const issueId = generateId('health_issue', componentName);

    return {
      id: issueId,
      component: componentName,
      severity,
      description: this.generateIssueDescription(componentName, component),
      impact: this.generateIssueImpact(componentName, component),
      recommendation: this.generateIssueRecommendation(componentName, component),
      firstSeen: new Date(),
      lastSeen: new Date(),
      occurrences: 1
    };
  }

  private getSeverityFromStatus(status: HealthStatus): HealthIssue['severity'] {
    const severityMap: Record<HealthStatus, HealthIssue['severity']> = {
      healthy: 'warning', // This shouldn't happen for healthy status
      degraded: 'warning',
      critical: 'critical',
      down: 'critical'
    };
    return severityMap[status];
  }

  private generateIssueDescription(componentName: ComponentName, component: ComponentHealth): string {
    const statusText = component.status.charAt(0).toUpperCase() + component.status.slice(1);
    return `${statusText} ${componentName} component: ${component.utilization.toFixed(1)}% utilization, ${component.performance.toFixed(1)}% performance`;
  }

  private generateIssueImpact(componentName: ComponentName, component: ComponentHealth): string {
    const impactMap: Record<ComponentName, Record<HealthStatus, string>> = {
      compute: {
        healthy: 'No impact',
        degraded: 'Reduced processing speed and potential delays',
        critical: 'Severe processing bottlenecks affecting all operations',
        down: 'Complete system failure'
      },
      memory: {
        healthy: 'No impact',
        degraded: 'Potential out-of-memory errors and performance degradation',
        critical: 'High risk of system crashes and data loss',
        down: 'System unavailable due to memory exhaustion'
      },
      storage: {
        healthy: 'No impact',
        degraded: 'Slower I/O operations and potential space issues',
        critical: 'Risk of data loss and application failures',
        down: 'No storage available for operations'
      },
      network: {
        healthy: 'No impact',
        degraded: 'Increased latency and potential connectivity issues',
        critical: 'Severe network disruptions affecting communication',
        down: 'Complete network failure'
      },
      models: {
        healthy: 'No impact',
        degraded: 'Reduced model accuracy and availability',
        critical: 'Multiple model failures affecting business operations',
        down: 'All ML models unavailable'
      },
      database: {
        healthy: 'No impact',
        degraded: 'Slower queries and potential data inconsistencies',
        critical: 'Risk of data corruption and application failures',
        down: 'Complete data unavailability'
      }
    };

    return impactMap[componentName][component.status];
  }

  private generateIssueRecommendation(componentName: ComponentName, component: ComponentHealth): string {
    const recommendationMap: Record<ComponentName, Record<HealthStatus, string>> = {
      compute: {
        healthy: 'No action needed',
        degraded: 'Monitor CPU usage and consider scaling up resources',
        critical: 'Immediately scale up CPU resources or optimize workloads',
        down: 'Emergency system restart and resource allocation'
      },
      memory: {
        healthy: 'No action needed',
        degraded: 'Investigate memory leaks and optimize usage',
        critical: 'Immediately increase memory allocation and restart services',
        down: 'Emergency memory expansion and system recovery'
      },
      storage: {
        healthy: 'No action needed',
        degraded: 'Clean up disk space and implement log rotation',
        critical: 'Immediately expand storage and archive old data',
        down: 'Emergency storage expansion and data recovery'
      },
      network: {
        healthy: 'No action needed',
        degraded: 'Check network configuration and optimize traffic',
        critical: 'Investigate network issues and implement load balancing',
        down: 'Emergency network troubleshooting and failover'
      },
      models: {
        healthy: 'No action needed',
        degraded: 'Review model performance and retrain if necessary',
        critical: 'Immediately investigate model failures and deploy backups',
        down: 'Emergency model recovery and deployment'
      },
      database: {
        healthy: 'No action needed',
        degraded: 'Optimize database queries and check for locks',
        critical: 'Immediately investigate database issues and scale resources',
        down: 'Emergency database recovery and failover'
      }
    };

    return recommendationMap[componentName][component.status];
  }

  // ==================== PUBLIC API METHODS ====================

  /**
   * Get current system health
   */
  getSystemHealth(): SystemHealth {
    return { ...this.systemHealth };
  }

  /**
   * Get specific component health
   */
  getComponentHealth(componentName: ComponentName): ComponentHealth {
    return { ...this.systemHealth.components[componentName] };
  }

  /**
   * Get health issues with optional severity filter
   */
  getHealthIssues(severity?: HealthIssue['severity']): HealthIssue[] {
    if (severity) {
      return this.systemHealth.issues.filter(issue => issue.severity === severity);
    }
    return [...this.systemHealth.issues];
  }

  /**
   * Acknowledge a health issue (remove it from the list)
   */
  acknowledgeIssue(issueId: string): boolean {
    const issueIndex = this.systemHealth.issues.findIndex(issue => issue.id === issueId);
    if (issueIndex === -1) {
      return false;
    }

    const acknowledgedIssue = this.systemHealth.issues[issueIndex];
    this.systemHealth.issues.splice(issueIndex, 1);

    this.emit('issue_acknowledged', {
      issueId,
      issue: acknowledgedIssue,
      timestamp: new Date()
    });

    return true;
  }

  /**
   * Get health statistics
   */
  getHealthStatistics(): {
    overallScore: number;
    overallStatus: SystemHealth['overall'];
    totalIssues: number;
    criticalIssues: number;
    warningIssues: number;
    componentStatuses: Record<ComponentName, HealthStatus>;
    uptimePercentage: number;
  } {
    const criticalIssues = this.systemHealth.issues.filter(i => i.severity === 'critical').length;
    const warningIssues = this.systemHealth.issues.filter(i => i.severity === 'warning').length;

    const componentStatuses: Record<ComponentName, HealthStatus> = {} as Record<ComponentName, HealthStatus>;
    Object.entries(this.systemHealth.components).forEach(([name, component]) => {
      componentStatuses[name as ComponentName] = component.status;
    });

    // Calculate uptime percentage based on availability of all components
    const avgAvailability = Object.values(this.systemHealth.components)
      .reduce((sum, comp) => sum + comp.availability, 0) / Object.keys(this.systemHealth.components).length;

    return {
      overallScore: this.systemHealth.score,
      overallStatus: this.systemHealth.overall,
      totalIssues: this.systemHealth.issues.length,
      criticalIssues,
      warningIssues,
      componentStatuses,
      uptimePercentage: avgAvailability
    };
  }

  /**
   * Force a health check
   */
  async forceHealthCheck(): Promise<SystemHealth> {
    await this.performHealthCheck();
    return this.getSystemHealth();
  }

  /**
   * Reset component health (for testing or recovery)
   */
  resetComponentHealth(componentName: ComponentName): void {
    this.systemHealth.components[componentName] = this.createComponentHealth();

    // Remove issues for this component
    this.systemHealth.issues = this.systemHealth.issues.filter(issue =>
      issue.component !== componentName
    );

    this.emit('component_health_reset', {
      componentName,
      timestamp: new Date()
    });
  }

  /**
   * Set custom component metrics (for external monitoring integration)
   */
  setComponentMetrics(componentName: ComponentName, metrics: Partial<ComponentHealth>): void {
    const component = this.systemHealth.components[componentName];
    Object.assign(component, metrics);

    // Recalculate status if utilization changed
    if (metrics.utilization !== undefined) {
      component.status = this.determineHealthStatus(metrics.utilization);
    }

    this.checkComponentIssues(componentName, component);
    this.updateOverallHealth();

    this.emit('component_metrics_updated', {
      componentName,
      metrics,
      timestamp: new Date()
    });
  }

  /**
   * Clean up old issues
   */
  cleanupOldIssues(olderThan: Date): number {
    const initialCount = this.systemHealth.issues.length;

    this.systemHealth.issues = this.systemHealth.issues.filter(issue =>
      issue.lastSeen >= olderThan
    );

    const cleaned = initialCount - this.systemHealth.issues.length;

    if (cleaned > 0) {
      this.emit('issues_cleaned', { count: cleaned, timestamp: new Date() });
    }

    return cleaned;
  }
}