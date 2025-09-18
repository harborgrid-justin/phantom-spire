/**
 * Enterprise Performance Monitoring Types
 * Core type definitions for the performance monitoring system
 */

// ==================== CONFIGURATION TYPES ====================

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

// ==================== METRIC TYPES ====================

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

// ==================== ALERT TYPES ====================

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

export interface AlertRule extends AlertCondition {
  name: string;
  metric: string;
  severity: Alert['severity'];
}

export interface NotificationHistory {
  timestamp: Date;
  channel: string;
  status: 'sent' | 'failed' | 'pending';
  recipient: string;
  message: string;
}

// ==================== OPTIMIZATION TYPES ====================

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

export interface OptimizationHistory {
  recommendation: OptimizationRecommendation;
  applied: Date;
  result: 'success' | 'failed' | 'rolled_back';
  impact: Record<string, number>;
}

export interface PerformanceAnomaly {
  metric: PerformanceMetric;
  anomalyType: string;
  severity: number;
}

// ==================== HEALTH MONITORING TYPES ====================

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

// ==================== EVENT TYPES ====================

export interface MetricCollectionEvent {
  count: number;
  timestamp: Date;
  metrics: PerformanceMetric[];
}

export interface HealthUpdateEvent {
  health: SystemHealth;
  timestamp: Date;
}

export interface OptimizationEvent {
  recommendationId: string;
  timestamp: Date;
  result?: 'success' | 'failed';
  error?: any;
}

export interface RecommendationGeneratedEvent {
  count: number;
  recommendations: OptimizationRecommendation[];
  timestamp: Date;
}

// ==================== FILTER TYPES ====================

export interface OptimizationFilter {
  type?: OptimizationRecommendation['type'];
  priority?: OptimizationRecommendation['priority'];
  status?: OptimizationRecommendation['status'];
}

export interface TimeRange {
  start: Date;
  end: Date;
}

// ==================== UTILITY TYPES ====================

export type ComponentName = keyof SystemHealth['components'];

export type MetricOperator = AlertCondition['operator'];

export type AlertSeverity = Alert['severity'];

export type OptimizationType = OptimizationRecommendation['type'];

export type OptimizationPriority = OptimizationRecommendation['priority'];

export type OptimizationStatus = OptimizationRecommendation['status'];

export type HealthStatus = ComponentHealth['status'];

export type TrendDirection = ComponentHealth['trends']['utilization'];

export type SamplingStrategy = MonitoringConfiguration['collection']['sampling']['strategy'];