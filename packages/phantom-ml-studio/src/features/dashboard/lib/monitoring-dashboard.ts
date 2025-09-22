/**
 * Enterprise Monitoring Dashboard
 * Real-time monitoring and analytics dashboard for ML operations
 * Provides comprehensive visibility into system health, model performance, and business metrics
 */

import { EventEmitter } from 'events';
import { PerformanceMonitor } from '../../../lib/monitoring/performance-monitor';
import { HealthMonitor } from '../../../lib/monitoring/health-monitor';
import { EnterpriseCache } from '../../../lib/caching/enterprise-cache';
import { AuditLogger } from '../../../security/audit-logger';

export interface DashboardMetric {
  id: string;
  name: string;
  description: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  alertLevel?: 'normal' | 'warning' | 'critical';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'status' | 'log' | 'custom';
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number; width: number; height: number };
  config: Record<string, any>;
  dataSource: string;
  refreshInterval: number; // seconds
  isVisible: boolean;
  permissions?: string[];
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  category: 'overview' | 'ml-operations' | 'security' | 'compliance' | 'custom';
  widgets: DashboardWidget[];
  layout: 'grid' | 'flexible';
  isDefault: boolean;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metricId: string;
  condition: 'gt' | 'lt' | 'eq' | 'ne' | 'contains';
  threshold: number | string;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  suppressionWindow: number; // minutes
  notificationChannels: string[];
  lastTriggered?: Date;
}

export interface DashboardConfig {
  updateInterval: number; // milliseconds
  maxDataPoints: number;
  enableRealTimeUpdates: boolean;
  cacheMetrics: boolean;
  alertingEnabled: boolean;
  defaultDashboards: string[];
  customDashboardsEnabled: boolean;
  maxCustomDashboards: number;
}

/**
 * Enterprise Monitoring Dashboard System
 * Provides comprehensive real-time monitoring and analytics capabilities
 */
export class MonitoringDashboard extends EventEmitter {
  private config: DashboardConfig;
  private performanceMonitor: PerformanceMonitor;
  private healthMonitor: HealthMonitor;
  private cache: EnterpriseCache;
  private auditLogger: AuditLogger;

  // In-memory storage - replace with database in production
  private dashboards = new Map<string, Dashboard>();
  private metrics = new Map<string, DashboardMetric[]>();
  private widgets = new Map<string, DashboardWidget>();
  private alertRules = new Map<string, AlertRule>();
  private activeAlerts = new Map<string, { rule: AlertRule; triggeredAt: Date; acknowledged: boolean }>();

  // WebSocket connections for real-time updates
  private wsConnections = new Set<any>();

  constructor(config: Partial<DashboardConfig> = {}) {
    super();
    
    this.config = {
      updateInterval: 5000, // 5 seconds
      maxDataPoints: 100,
      enableRealTimeUpdates: true,
      cacheMetrics: true,
      alertingEnabled: true,
      defaultDashboards: ['overview', 'ml-operations', 'security'],
      customDashboardsEnabled: true,
      maxCustomDashboards: 10,
      ...config
    };

    this.performanceMonitor = new PerformanceMonitor();
    this.healthMonitor = new HealthMonitor();
    this.cache = new EnterpriseCache();
    this.auditLogger = new AuditLogger();

    this.initializeDefaultDashboards();
    this.startMetricsCollection();
    this.startAlertingSystem();
  }

  // ================== DASHBOARD MANAGEMENT ==================

  /**
   * Create a new dashboard
   */
  async createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const dashboardId = `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullDashboard: Dashboard = {
      ...dashboard,
      id: dashboardId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dashboards.set(dashboardId, fullDashboard);

    await this.auditLogger.logSystemEvent('dashboard_created', {
      dashboardId,
      name: dashboard.name,
      category: dashboard.category,
      createdBy: dashboard.createdBy
    });

    this.emit('dashboardCreated', fullDashboard);
    return dashboardId;
  }

  /**
   * Update existing dashboard
   */
  async updateDashboard(
    dashboardId: string, 
    updates: Partial<Dashboard>, 
    updatedBy: string
  ): Promise<void> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard ${dashboardId} not found`);
    }

    const updatedDashboard = {
      ...dashboard,
      ...updates,
      updatedAt: new Date()
    };

    this.dashboards.set(dashboardId, updatedDashboard);

    await this.auditLogger.logSystemEvent('dashboard_updated', {
      dashboardId,
      updates: Object.keys(updates),
      updatedBy
    });

    this.emit('dashboardUpdated', updatedDashboard);
  }

  /**
   * Get dashboard by ID
   */
  async getDashboard(dashboardId: string): Promise<Dashboard | null> {
    return this.dashboards.get(dashboardId) || null;
  }

  /**
   * List dashboards with filtering
   */
  async listDashboards(filters?: {
    category?: string;
    createdBy?: string;
    isPublic?: boolean;
    tags?: string[];
  }): Promise<Dashboard[]> {
    let dashboards = Array.from(this.dashboards.values());

    if (filters) {
      if (filters.category) {
        dashboards = dashboards.filter(d => d.category === filters.category);
      }
      if (filters.createdBy) {
        dashboards = dashboards.filter(d => d.createdBy === filters.createdBy);
      }
      if (filters.isPublic !== undefined) {
        dashboards = dashboards.filter(d => d.isPublic === filters.isPublic);
      }
      if (filters.tags && filters.tags.length > 0) {
        dashboards = dashboards.filter(d => 
          filters.tags!.some(tag => d.tags.includes(tag))
        );
      }
    }

    return dashboards.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // ================== METRICS MANAGEMENT ==================

  /**
   * Add metric data point
   */
  async addMetric(metric: DashboardMetric): Promise<void> {
    const metricId = metric.id;
    
    if (!this.metrics.has(metricId)) {
      this.metrics.set(metricId, []);
    }

    const metricHistory = this.metrics.get(metricId)!;
    metricHistory.push(metric);

    // Keep only the last N data points
    if (metricHistory.length > this.config.maxDataPoints) {
      metricHistory.splice(0, metricHistory.length - this.config.maxDataPoints);
    }

    // Cache metric if enabled
    if (this.config.cacheMetrics) {
      await this.cache.set(`metric:${metricId}:latest`, metric, 300); // 5 minutes
    }

    // Check alert rules
    await this.checkAlertRules(metric);

    // Emit real-time update
    if (this.config.enableRealTimeUpdates) {
      this.emit('metricUpdated', metric);
      this.broadcastMetricUpdate(metric);
    }
  }

  /**
   * Get metric history
   */
  async getMetricHistory(
    metricId: string, 
    timeRange?: { start: Date; end: Date },
    limit?: number
  ): Promise<DashboardMetric[]> {
    let metrics = this.metrics.get(metricId) || [];

    if (timeRange) {
      metrics = metrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    if (limit) {
      metrics = metrics.slice(-limit);
    }

    return metrics;
  }

  /**
   * Get current metric values
   */
  async getCurrentMetrics(metricIds?: string[]): Promise<Record<string, DashboardMetric>> {
    const result: Record<string, DashboardMetric> = {};
    const targetMetrics = metricIds || Array.from(this.metrics.keys());

    for (const metricId of targetMetrics) {
      // Try cache first
      if (this.config.cacheMetrics) {
        const cached = await this.cache.get(`metric:${metricId}:latest`);
        if (cached) {
          result[metricId] = cached;
          continue;
        }
      }

      // Fallback to in-memory storage
      const history = this.metrics.get(metricId);
      if (history && history.length > 0) {
        result[metricId] = history[history.length - 1];
      }
    }

    return result;
  }

  // ================== ALERTING SYSTEM ==================

  /**
   * Create alert rule
   */
  async createAlertRule(rule: Omit<AlertRule, 'id'>): Promise<string> {
    const ruleId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullRule: AlertRule = {
      ...rule,
      id: ruleId
    };

    this.alertRules.set(ruleId, fullRule);

    await this.auditLogger.logSystemEvent('alert_rule_created', {
      ruleId,
      name: rule.name,
      metricId: rule.metricId,
      severity: rule.severity
    });

    return ruleId;
  }

  /**
   * Check alert rules against metric
   */
  private async checkAlertRules(metric: DashboardMetric): Promise<void> {
    if (!this.config.alertingEnabled) return;

    for (const rule of this.alertRules.values()) {
      if (rule.metricId !== metric.id || !rule.enabled) continue;

      const isTriggered = this.evaluateAlertCondition(rule, metric);
      
      if (isTriggered) {
        // Check suppression window
        if (rule.lastTriggered) {
          const suppressionEnd = new Date(rule.lastTriggered.getTime() + rule.suppressionWindow * 60000);
          if (new Date() < suppressionEnd) {
            continue; // Still in suppression window
          }
        }

        await this.triggerAlert(rule, metric);
      }
    }
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(rule: AlertRule, metric: DashboardMetric): Promise<void> {
    const alertId = `${rule.id}_${Date.now()}`;
    
    this.activeAlerts.set(alertId, {
      rule,
      triggeredAt: new Date(),
      acknowledged: false
    });

    // Update rule's last triggered timestamp
    rule.lastTriggered = new Date();

    await this.auditLogger.logSystemEvent('alert_triggered', {
      alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      metricId: metric.id,
      metricValue: metric.value,
      threshold: rule.threshold,
      severity: rule.severity
    });

    // Send notifications
    await this.sendAlertNotifications(rule, metric, alertId);

    // Emit alert event
    this.emit('alertTriggered', {
      id: alertId,
      rule,
      metric,
      triggeredAt: new Date()
    });

    // Real-time update
    this.broadcastAlert({
      id: alertId,
      rule,
      metric,
      triggeredAt: new Date()
    });
  }

  /**
   * Evaluate alert condition
   */
  private evaluateAlertCondition(rule: AlertRule, metric: DashboardMetric): boolean {
    const metricValue = typeof metric.value === 'number' ? metric.value : parseFloat(metric.value.toString());
    const threshold = typeof rule.threshold === 'number' ? rule.threshold : parseFloat(rule.threshold.toString());

    switch (rule.condition) {
      case 'gt': return metricValue > threshold;
      case 'lt': return metricValue < threshold;
      case 'eq': return metricValue === threshold;
      case 'ne': return metricValue !== threshold;
      case 'contains': return metric.value.toString().includes(rule.threshold.toString());
      default: return false;
    }
  }

  // ================== REAL-TIME UPDATES ==================

  /**
   * Add WebSocket connection for real-time updates
   */
  addWebSocketConnection(ws: any): void {
    this.wsConnections.add(ws);
    
    ws.on('close', () => {
      this.wsConnections.delete(ws);
    });

    // Send current dashboard state
    ws.send(JSON.stringify({
      type: 'dashboard_state',
      data: {
        dashboards: Array.from(this.dashboards.values()),
        currentMetrics: {}
      }
    }));
  }

  /**
   * Broadcast metric update to all connected clients
   */
  private broadcastMetricUpdate(metric: DashboardMetric): void {
    const message = JSON.stringify({
      type: 'metric_update',
      data: metric
    });

    for (const ws of this.wsConnections) {
      try {
        ws.send(message);
      } catch (error) {
        // Remove failed connection
        this.wsConnections.delete(ws);
      }
    }
  }

  /**
   * Broadcast alert to all connected clients
   */
  private broadcastAlert(alert: any): void {
    const message = JSON.stringify({
      type: 'alert',
      data: alert
    });

    for (const ws of this.wsConnections) {
      try {
        ws.send(message);
      } catch (error) {
        this.wsConnections.delete(ws);
      }
    }
  }

  // ================== ANALYTICS AND INSIGHTS ==================

  /**
   * Generate dashboard analytics
   */
  async getDashboardAnalytics(dashboardId?: string): Promise<{
    totalMetrics: number;
    activeAlerts: number;
    averageResponseTime: number;
    topPerformingModels: Array<{ id: string; name: string; accuracy: number }>;
    systemHealth: 'healthy' | 'warning' | 'critical';
    trendsAndInsights: string[];
  }> {
    const currentMetrics = await this.getCurrentMetrics();
    const activeAlertsCount = Array.from(this.activeAlerts.values())
      .filter(alert => !alert.acknowledged).length;

    // Get system health from health monitor
    const healthStatus = await this.healthMonitor.getOverallHealth();
    
    // Calculate average response time from performance monitor
    const perfMetrics = await this.performanceMonitor.getSystemMetrics();
    const avgResponseTime = perfMetrics.network?.averageLatency || 0;

    // Mock top performing models - in production, get from ML service
    const topPerformingModels = [
      { id: 'model_1', name: 'Fraud Detection Model', accuracy: 0.97 },
      { id: 'model_2', name: 'Customer Segmentation', accuracy: 0.94 },
      { id: 'model_3', name: 'Demand Forecasting', accuracy: 0.91 }
    ];

    // Generate insights
    const trendsAndInsights = [
      'Model accuracy has improved 5% over the last month',
      'System load is trending upward, consider scaling',
      'Security events decreased by 15% this week'
    ];

    return {
      totalMetrics: Object.keys(currentMetrics).length,
      activeAlerts: activeAlertsCount,
      averageResponseTime: avgResponseTime,
      topPerformingModels,
      systemHealth: healthStatus.status as 'healthy' | 'warning' | 'critical',
      trendsAndInsights
    };
  }

  // ================== PRIVATE HELPER METHODS ==================

  /**
   * Initialize default dashboards
   */
  private initializeDefaultDashboards(): void {
    // Overview Dashboard
    const overviewDashboard: Dashboard = {
      id: 'overview',
      name: 'System Overview',
      description: 'High-level system overview with key metrics',
      category: 'overview',
      layout: 'grid',
      isDefault: true,
      isPublic: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['system', 'overview'],
      widgets: [
        {
          id: 'system-health',
          title: 'System Health',
          type: 'status',
          size: 'medium',
          position: { x: 0, y: 0, width: 6, height: 4 },
          config: { showDetails: true },
          dataSource: 'health-monitor',
          refreshInterval: 30,
          isVisible: true
        },
        {
          id: 'active-models',
          title: 'Active Models',
          type: 'metric',
          size: 'small',
          position: { x: 6, y: 0, width: 3, height: 2 },
          config: { format: 'number', showTrend: true },
          dataSource: 'ml-service',
          refreshInterval: 60,
          isVisible: true
        },
        {
          id: 'response-time',
          title: 'Average Response Time',
          type: 'chart',
          size: 'medium',
          position: { x: 0, y: 4, width: 6, height: 4 },
          config: { chartType: 'line', timeRange: '1h' },
          dataSource: 'performance-monitor',
          refreshInterval: 15,
          isVisible: true
        }
      ]
    };

    // ML Operations Dashboard
    const mlOpsDashboard: Dashboard = {
      id: 'ml-operations',
      name: 'ML Operations',
      description: 'Machine learning operations monitoring',
      category: 'ml-operations',
      layout: 'grid',
      isDefault: true,
      isPublic: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['ml', 'operations', 'models'],
      widgets: [
        {
          id: 'model-performance',
          title: 'Model Performance',
          type: 'table',
          size: 'large',
          position: { x: 0, y: 0, width: 8, height: 6 },
          config: { 
            columns: ['name', 'accuracy', 'latency', 'status'],
            sortBy: 'accuracy'
          },
          dataSource: 'ml-service',
          refreshInterval: 30,
          isVisible: true
        },
        {
          id: 'inference-rate',
          title: 'Inference Rate',
          type: 'metric',
          size: 'small',
          position: { x: 8, y: 0, width: 4, height: 3 },
          config: { format: 'rate', unit: '/sec' },
          dataSource: 'ml-service',
          refreshInterval: 10,
          isVisible: true
        }
      ]
    };

    // Security Dashboard
    const securityDashboard: Dashboard = {
      id: 'security',
      name: 'Security Overview',
      description: 'Security monitoring and alerts',
      category: 'security',
      layout: 'grid',
      isDefault: true,
      isPublic: false,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['security', 'monitoring'],
      widgets: [
        {
          id: 'security-events',
          title: 'Security Events',
          type: 'log',
          size: 'large',
          position: { x: 0, y: 0, width: 12, height: 6 },
          config: { 
            logLevel: 'warning',
            maxLines: 50,
            realTime: true
          },
          dataSource: 'security-monitor',
          refreshInterval: 5,
          isVisible: true,
          permissions: ['security:read']
        }
      ]
    };

    this.dashboards.set('overview', overviewDashboard);
    this.dashboards.set('ml-operations', mlOpsDashboard);
    this.dashboards.set('security', securityDashboard);
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    setInterval(async () => {
      try {
        // Collect system metrics
        await this.collectSystemMetrics();
        
        // Collect ML metrics
        await this.collectMLMetrics();
        
        // Collect security metrics
        await this.collectSecurityMetrics();
      } catch (error) {
        await this.auditLogger.logSystemEvent('metrics_collection_error', {
          error: error.message
        });
      }
    }, this.config.updateInterval);
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<void> {
    const perfMetrics = await this.performanceMonitor.getSystemMetrics();
    const healthStatus = await this.healthMonitor.getOverallHealth();

    // CPU usage
    await this.addMetric({
      id: 'system.cpu.usage',
      name: 'CPU Usage',
      description: 'Current CPU usage percentage',
      value: perfMetrics.cpu?.usage || 0,
      unit: '%',
      timestamp: new Date(),
      alertLevel: perfMetrics.cpu?.usage > 80 ? 'warning' : 'normal'
    });

    // Memory usage
    await this.addMetric({
      id: 'system.memory.usage',
      name: 'Memory Usage',
      description: 'Current memory usage percentage',
      value: perfMetrics.memory?.usage || 0,
      unit: '%',
      timestamp: new Date(),
      alertLevel: perfMetrics.memory?.usage > 90 ? 'critical' : 'normal'
    });

    // System health
    await this.addMetric({
      id: 'system.health.status',
      name: 'System Health',
      description: 'Overall system health status',
      value: healthStatus.status,
      timestamp: new Date(),
      alertLevel: healthStatus.status === 'healthy' ? 'normal' : 
                 healthStatus.status === 'degraded' ? 'warning' : 'critical'
    });
  }

  /**
   * Collect ML metrics
   */
  private async collectMLMetrics(): Promise<void> {
    // Mock ML metrics - in production, integrate with actual ML service
    await this.addMetric({
      id: 'ml.models.active',
      name: 'Active Models',
      description: 'Number of currently active models',
      value: Math.floor(Math.random() * 10) + 5,
      timestamp: new Date()
    });

    await this.addMetric({
      id: 'ml.inference.rate',
      name: 'Inference Rate',
      description: 'Number of inferences per second',
      value: Math.floor(Math.random() * 100) + 50,
      unit: '/sec',
      timestamp: new Date()
    });

    await this.addMetric({
      id: 'ml.models.accuracy',
      name: 'Average Model Accuracy',
      description: 'Average accuracy across all models',
      value: (Math.random() * 0.1 + 0.85).toFixed(3),
      timestamp: new Date()
    });
  }

  /**
   * Collect security metrics
   */
  private async collectSecurityMetrics(): Promise<void> {
    // Mock security metrics - in production, integrate with security services
    await this.addMetric({
      id: 'security.events.count',
      name: 'Security Events',
      description: 'Number of security events in the last hour',
      value: Math.floor(Math.random() * 5),
      timestamp: new Date(),
      alertLevel: Math.random() > 0.9 ? 'warning' : 'normal'
    });

    await this.addMetric({
      id: 'security.failed.logins',
      name: 'Failed Logins',
      description: 'Number of failed login attempts in the last hour',
      value: Math.floor(Math.random() * 3),
      timestamp: new Date(),
      alertLevel: Math.random() > 0.8 ? 'warning' : 'normal'
    });
  }

  /**
   * Start alerting system
   */
  private startAlertingSystem(): void {
    if (!this.config.alertingEnabled) return;

    // Create default alert rules
    this.createDefaultAlertRules();

    // Clean up acknowledged alerts periodically
    setInterval(() => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      for (const [alertId, alert] of this.activeAlerts.entries()) {
        if (alert.acknowledged && alert.triggeredAt < oneDayAgo) {
          this.activeAlerts.delete(alertId);
        }
      }
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Create default alert rules
   */
  private async createDefaultAlertRules(): Promise<void> {
    const defaultRules: Omit<AlertRule, 'id'>[] = [
      {
        name: 'High CPU Usage',
        description: 'Alert when CPU usage exceeds 80%',
        metricId: 'system.cpu.usage',
        condition: 'gt',
        threshold: 80,
        severity: 'warning',
        enabled: true,
        suppressionWindow: 15,
        notificationChannels: ['email', 'slack']
      },
      {
        name: 'Critical Memory Usage',
        description: 'Alert when memory usage exceeds 90%',
        metricId: 'system.memory.usage',
        condition: 'gt',
        threshold: 90,
        severity: 'critical',
        enabled: true,
        suppressionWindow: 10,
        notificationChannels: ['email', 'slack', 'pager']
      },
      {
        name: 'System Health Critical',
        description: 'Alert when system health is critical',
        metricId: 'system.health.status',
        condition: 'eq',
        threshold: 'critical',
        severity: 'critical',
        enabled: true,
        suppressionWindow: 5,
        notificationChannels: ['email', 'slack', 'pager']
      }
    ];

    for (const rule of defaultRules) {
      await this.createAlertRule(rule);
    }
  }

  /**
   * Send alert notifications
   */
  private async sendAlertNotifications(
    rule: AlertRule, 
    metric: DashboardMetric, 
    alertId: string
  ): Promise<void> {
    // Implementation for sending notifications through various channels
    // This would integrate with email, Slack, PagerDuty, etc.
    
    await this.auditLogger.logSystemEvent('alert_notification_sent', {
      alertId,
      ruleId: rule.id,
      channels: rule.notificationChannels,
      severity: rule.severity
    });
  }
}

export default MonitoringDashboard;