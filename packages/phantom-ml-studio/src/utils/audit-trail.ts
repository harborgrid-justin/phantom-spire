/**
 * Enterprise Audit Trail System
 * Comprehensive audit logging for compliance and security monitoring
 */

import type { LoggerService } from '../services/core/LoggerService';

// Audit event types
export enum AuditEventType {
  // Authentication & Authorization
  LOGIN = 'auth.login',
  LOGOUT = 'auth.logout',
  LOGIN_FAILED = 'auth.login_failed',
  PASSWORD_CHANGED = 'auth.password_changed',
  TOKEN_CREATED = 'auth.token_created',
  TOKEN_REVOKED = 'auth.token_revoked',
  
  // User Management
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_ACTIVATED = 'user.activated',
  USER_DEACTIVATED = 'user.deactivated',
  ROLE_ASSIGNED = 'user.role_assigned',
  ROLE_REVOKED = 'user.role_revoked',
  
  // Model Operations
  MODEL_CREATED = 'model.created',
  MODEL_UPDATED = 'model.updated',
  MODEL_DELETED = 'model.deleted',
  MODEL_TRAINED = 'model.trained',
  MODEL_DEPLOYED = 'model.deployed',
  MODEL_UNDEPLOYED = 'model.undeployed',
  MODEL_PREDICTION = 'model.prediction',
  MODEL_EXPORTED = 'model.exported',
  MODEL_IMPORTED = 'model.imported',
  
  // Dataset Operations
  DATASET_CREATED = 'dataset.created',
  DATASET_UPDATED = 'dataset.updated',
  DATASET_DELETED = 'dataset.deleted',
  DATASET_UPLOADED = 'dataset.uploaded',
  DATASET_PROCESSED = 'dataset.processed',
  DATASET_EXPORTED = 'dataset.exported',
  
  // Experiment Operations
  EXPERIMENT_CREATED = 'experiment.created',
  EXPERIMENT_UPDATED = 'experiment.updated',
  EXPERIMENT_DELETED = 'experiment.deleted',
  EXPERIMENT_STARTED = 'experiment.started',
  EXPERIMENT_STOPPED = 'experiment.stopped',
  EXPERIMENT_COMPLETED = 'experiment.completed',
  
  // System Events
  SYSTEM_STARTUP = 'system.startup',
  SYSTEM_SHUTDOWN = 'system.shutdown',
  CONFIGURATION_CHANGED = 'system.config_changed',
  BACKUP_CREATED = 'system.backup_created',
  BACKUP_RESTORED = 'system.backup_restored',
  
  // Security Events
  ACCESS_DENIED = 'security.access_denied',
  PERMISSION_VIOLATION = 'security.permission_violation',
  SUSPICIOUS_ACTIVITY = 'security.suspicious_activity',
  DATA_BREACH_ATTEMPT = 'security.data_breach_attempt',
  RATE_LIMIT_EXCEEDED = 'security.rate_limit_exceeded',
  
  // Compliance Events
  DATA_EXPORT = 'compliance.data_export',
  DATA_RETENTION = 'compliance.data_retention',
  DATA_DELETION = 'compliance.data_deletion',
  CONSENT_GRANTED = 'compliance.consent_granted',
  CONSENT_REVOKED = 'compliance.consent_revoked',
  AUDIT_REQUESTED = 'compliance.audit_requested',
  
  // API Events
  API_CALL = 'api.call',
  API_ERROR = 'api.error',
  API_RATE_LIMITED = 'api.rate_limited',
  API_DEPRECATED = 'api.deprecated',
  
  // Custom Events
  CUSTOM = 'custom',
}

// Audit event severity levels
export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Audit event outcome
export enum AuditOutcome {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled',
  UNKNOWN = 'unknown',
}

// Audit event interface
export interface AuditEvent {
  // Core identification
  id: string;
  eventType: AuditEventType;
  timestamp: Date;
  
  // User context
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  sessionId?: string;
  
  // Request context
  requestId?: string;
  correlationId?: string;
  clientIp?: string;
  userAgent?: string;
  
  // Resource information
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  
  // Event details
  action: string;
  description: string;
  severity: AuditSeverity;
  outcome: AuditOutcome;
  
  // Additional data
  metadata?: Record<string, unknown>;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  
  // Technical details
  duration?: number;
  errorCode?: string;
  errorMessage?: string;
  stackTrace?: string;
  
  // Compliance fields
  complianceFramework?: string;
  dataClassification?: string;
  retentionPeriod?: number;
  
  // Geographic information
  country?: string;
  region?: string;
  
  // Source information
  service: string;
  component?: string;
  version?: string;
}

// Audit configuration
export interface AuditConfig {
  enableAuditTrail: boolean;
  enableRealTimeAlerts: boolean;
  enableComplianceReporting: boolean;
  retentionDays: number;
  encryptSensitiveData: boolean;
  alertThresholds: {
    failedLogins: number;
    suspiciousActivity: number;
    dataExports: number;
  };
  complianceFrameworks: string[];
  excludeEvents: AuditEventType[];
  sensitiveFields: string[];
}

// Default audit configuration
const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  enableAuditTrail: true,
  enableRealTimeAlerts: true,
  enableComplianceReporting: true,
  retentionDays: 2555, // 7 years for compliance
  encryptSensitiveData: true,
  alertThresholds: {
    failedLogins: 5,
    suspiciousActivity: 3,
    dataExports: 10,
  },
  complianceFrameworks: ['SOX', 'GDPR', 'HIPAA', 'PCI-DSS'],
  excludeEvents: [],
  sensitiveFields: ['password', 'token', 'secret', 'key', 'credential'],
};

// Audit storage interface
export interface IAuditStorage {
  store(event: AuditEvent): Promise<void>;
  query(filter: AuditQueryFilter): Promise<AuditEvent[]>;
  count(filter: AuditQueryFilter): Promise<number>;
  cleanup(retentionDays: number): Promise<number>;
}

// Audit query filter
export interface AuditQueryFilter {
  eventTypes?: AuditEventType[];
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  severity?: AuditSeverity[];
  outcome?: AuditOutcome[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// In-memory audit storage (for development/testing)
export class InMemoryAuditStorage implements IAuditStorage {
  private events: AuditEvent[] = [];

  async store(event: AuditEvent): Promise<void> {
    this.events.push({ ...event });
  }

  async query(filter: AuditQueryFilter): Promise<AuditEvent[]> {
    let filtered = this.events;

    // Apply filters
    if (filter.eventTypes?.length) {
      filtered = filtered.filter(e => filter.eventTypes!.includes(e.eventType));
    }

    if (filter.userId) {
      filtered = filtered.filter(e => e.userId === filter.userId);
    }

    if (filter.resourceType) {
      filtered = filtered.filter(e => e.resourceType === filter.resourceType);
    }

    if (filter.resourceId) {
      filtered = filtered.filter(e => e.resourceId === filter.resourceId);
    }

    if (filter.severity?.length) {
      filtered = filtered.filter(e => filter.severity!.includes(e.severity));
    }

    if (filter.outcome?.length) {
      filtered = filtered.filter(e => filter.outcome!.includes(e.outcome));
    }

    if (filter.startDate) {
      filtered = filtered.filter(e => e.timestamp >= filter.startDate!);
    }

    if (filter.endDate) {
      filtered = filtered.filter(e => e.timestamp <= filter.endDate!);
    }

    // Sort
    const sortBy = filter.sortBy || 'timestamp';
    const sortOrder = filter.sortOrder || 'desc';
    
    filtered.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const offset = filter.offset || 0;
    const limit = filter.limit || 100;
    
    return filtered.slice(offset, offset + limit);
  }

  async count(filter: AuditQueryFilter): Promise<number> {
    const results = await this.query({ ...filter, limit: undefined, offset: undefined });
    return results.length;
  }

  async cleanup(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const beforeCount = this.events.length;
    this.events = this.events.filter(e => e.timestamp > cutoffDate);
    
    return beforeCount - this.events.length;
  }
}

// Main audit trail service
export class AuditTrailService {
  private static instance: AuditTrailService;
  private readonly config: AuditConfig;
  private readonly storage: IAuditStorage;
  private readonly logger?: LoggerService;
  private alertCounters = new Map<string, { count: number; resetTime: Date }>();
  private cleanupTimer?: NodeJS.Timeout;

  constructor(
    config: Partial<AuditConfig> = {},
    storage?: IAuditStorage,
    logger?: LoggerService
  ) {
    this.config = { ...DEFAULT_AUDIT_CONFIG, ...config };
    this.storage = storage || new InMemoryAuditStorage();
    this.logger = logger;
    
    // Start periodic cleanup
    this.startCleanup();
  }

  static getInstance(
    config?: Partial<AuditConfig>,
    storage?: IAuditStorage,
    logger?: LoggerService
  ): AuditTrailService {
    if (!AuditTrailService.instance) {
      AuditTrailService.instance = new AuditTrailService(config, storage, logger);
    }
    return AuditTrailService.instance;
  }

  // Log an audit event
  async audit(event: Partial<AuditEvent>): Promise<void> {
    if (!this.config.enableAuditTrail) {
      return;
    }

    // Skip excluded events
    if (event.eventType && this.config.excludeEvents.includes(event.eventType)) {
      return;
    }

    const auditEvent: AuditEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      service: 'phantom-ml-studio',
      severity: AuditSeverity.MEDIUM,
      outcome: AuditOutcome.SUCCESS,
      action: 'unknown',
      description: 'Audit event',
      ...event,
    } as AuditEvent;

    // Sanitize sensitive data
    if (this.config.encryptSensitiveData) {
      auditEvent.metadata = this.sanitizeSensitiveData(auditEvent.metadata);
    }

    try {
      // Store the event
      await this.storage.store(auditEvent);
      
      // Log to application logger
      this.logger?.info('Audit event recorded', {
        eventId: auditEvent.id,
        eventType: auditEvent.eventType,
        userId: auditEvent.userId,
        action: auditEvent.action,
        outcome: auditEvent.outcome,
        severity: auditEvent.severity,
      });

      // Check for real-time alerts
      if (this.config.enableRealTimeAlerts) {
        await this.checkAlerts(auditEvent);
      }

    } catch (error) {
      this.logger?.error('Failed to store audit event', error, {
        eventType: auditEvent.eventType,
        eventId: auditEvent.id,
      });
    }
  }

  // Convenience methods for common audit events

  async auditLogin(userId: string, userEmail: string, success: boolean, metadata?: Record<string, unknown>): Promise<void> {
    await this.audit({
      eventType: success ? AuditEventType.LOGIN : AuditEventType.LOGIN_FAILED,
      userId,
      userEmail,
      action: success ? 'user_login' : 'user_login_failed',
      description: success ? 'User logged in successfully' : 'User login failed',
      severity: success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
      outcome: success ? AuditOutcome.SUCCESS : AuditOutcome.FAILURE,
      metadata,
    });
  }

  async auditDataAccess(userId: string, resourceType: string, resourceId: string, action: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.audit({
      eventType: AuditEventType.API_CALL,
      userId,
      resourceType,
      resourceId,
      action,
      description: `Data access: ${action} on ${resourceType}`,
      severity: AuditSeverity.LOW,
      outcome: AuditOutcome.SUCCESS,
      metadata,
    });
  }

  async auditModelOperation(userId: string, modelId: string, action: string, outcome: AuditOutcome, metadata?: Record<string, unknown>): Promise<void> {
    const eventTypeMap: Record<string, AuditEventType> = {
      'create': AuditEventType.MODEL_CREATED,
      'update': AuditEventType.MODEL_UPDATED,
      'delete': AuditEventType.MODEL_DELETED,
      'train': AuditEventType.MODEL_TRAINED,
      'deploy': AuditEventType.MODEL_DEPLOYED,
      'predict': AuditEventType.MODEL_PREDICTION,
    };

    await this.audit({
      eventType: eventTypeMap[action] || AuditEventType.CUSTOM,
      userId,
      resourceType: 'model',
      resourceId: modelId,
      action,
      description: `Model operation: ${action}`,
      severity: AuditSeverity.MEDIUM,
      outcome,
      metadata,
    });
  }

  async auditSecurityEvent(eventType: AuditEventType, description: string, severity: AuditSeverity, metadata?: Record<string, unknown>): Promise<void> {
    await this.audit({
      eventType,
      action: 'security_event',
      description,
      severity,
      outcome: AuditOutcome.FAILURE,
      metadata,
    });
  }

  // Query audit events
  async queryEvents(filter: AuditQueryFilter): Promise<AuditEvent[]> {
    return await this.storage.query(filter);
  }

  // Count audit events
  async countEvents(filter: AuditQueryFilter): Promise<number> {
    return await this.storage.count(filter);
  }

  // Generate compliance report
  async generateComplianceReport(
    framework: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    framework: string;
    period: { start: Date; end: Date };
    summary: {
      totalEvents: number;
      criticalEvents: number;
      securityEvents: number;
      failedEvents: number;
    };
    events: AuditEvent[];
    recommendations: string[];
  }> {
    if (!this.config.enableComplianceReporting) {
      throw new Error('Compliance reporting is disabled');
    }

    const filter: AuditQueryFilter = {
      startDate,
      endDate,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    };

    const events = await this.queryEvents(filter);
    const totalEvents = events.length;
    const criticalEvents = events.filter(e => e.severity === AuditSeverity.CRITICAL).length;
    const securityEvents = events.filter(e => e.eventType.startsWith('security.')).length;
    const failedEvents = events.filter(e => e.outcome === AuditOutcome.FAILURE).length;

    // Generate recommendations based on findings
    const recommendations: string[] = [];
    
    if (failedEvents > totalEvents * 0.1) {
      recommendations.push('High failure rate detected. Review system health and user training.');
    }
    
    if (criticalEvents > 0) {
      recommendations.push('Critical security events detected. Immediate review required.');
    }
    
    if (securityEvents > totalEvents * 0.05) {
      recommendations.push('Elevated security event rate. Consider strengthening security controls.');
    }

    return {
      framework,
      period: { start: startDate, end: endDate },
      summary: {
        totalEvents,
        criticalEvents,
        securityEvents,
        failedEvents,
      },
      events: events.slice(0, 1000), // Limit to first 1000 for performance
      recommendations,
    };
  }

  // Export audit data
  async exportAuditData(
    filter: AuditQueryFilter,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const events = await this.queryEvents(filter);

    if (format === 'csv') {
      return this.convertToCSV(events);
    }

    return JSON.stringify(events, null, 2);
  }

  // Get audit statistics
  async getStatistics(timeRange: { start: Date; end: Date }): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    eventsByOutcome: Record<string, number>;
    topUsers: Array<{ userId: string; count: number }>;
    topResources: Array<{ resourceType: string; resourceId: string; count: number }>;
    trends: Array<{ date: string; count: number }>;
  }> {
    const filter: AuditQueryFilter = {
      startDate: timeRange.start,
      endDate: timeRange.end,
      limit: 10000, // Large limit for statistics
    };

    const events = await this.queryEvents(filter);
    const totalEvents = events.length;

    // Count by type
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const eventsByOutcome: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    const resourceCounts: Record<string, number> = {};

    for (const event of events) {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      eventsByOutcome[event.outcome] = (eventsByOutcome[event.outcome] || 0) + 1;

      if (event.userId) {
        userCounts[event.userId] = (userCounts[event.userId] || 0) + 1;
      }

      if (event.resourceType && event.resourceId) {
        const key = `${event.resourceType}:${event.resourceId}`;
        resourceCounts[key] = (resourceCounts[key] || 0) + 1;
      }
    }

    // Top users
    const topUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }));

    // Top resources
    const topResources = Object.entries(resourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key, count]) => {
        const [resourceType, resourceId] = key.split(':');
        return { resourceType, resourceId, count };
      });

    // Daily trends (last 30 days)
    const trends = this.calculateDailyTrends(events, 30);

    return {
      totalEvents,
      eventsByType,
      eventsBySeverity,
      eventsByOutcome,
      topUsers,
      topResources,
      trends,
    };
  }

  // Cleanup old audit records
  async cleanup(): Promise<number> {
    return await this.storage.cleanup(this.config.retentionDays);
  }

  // Destroy and cleanup resources
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  // Private methods

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeSensitiveData(data: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
    if (!data) return data;

    const sanitized = { ...data };

    for (const field of this.config.sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private async checkAlerts(event: AuditEvent): Promise<void> {
    const alertKey = `${event.eventType}:${event.userId || 'anonymous'}`;
    const now = new Date();
    
    // Get or create counter for this alert type
    let counter = this.alertCounters.get(alertKey);
    if (!counter || now.getTime() - counter.resetTime.getTime() > 3600000) { // 1 hour
      counter = { count: 0, resetTime: now };
      this.alertCounters.set(alertKey, counter);
    }

    counter.count++;

    // Check thresholds
    const shouldAlert = 
      (event.eventType === AuditEventType.LOGIN_FAILED && counter.count >= this.config.alertThresholds.failedLogins) ||
      (event.eventType.startsWith('security.') && counter.count >= this.config.alertThresholds.suspiciousActivity) ||
      (event.eventType === AuditEventType.DATA_EXPORT && counter.count >= this.config.alertThresholds.dataExports);

    if (shouldAlert) {
      await this.sendAlert(event, counter.count);
      counter.count = 0; // Reset counter after alert
    }
  }

  private async sendAlert(event: AuditEvent, count: number): Promise<void> {
    const alert = {
      type: 'AUDIT_ALERT',
      severity: event.severity,
      message: `Alert: ${count} occurrences of ${event.eventType}`,
      event,
      timestamp: new Date(),
    };

    this.logger?.warn('Audit alert triggered', alert);

    // In a real implementation, you would send alerts via email, Slack, etc.
  }

  private convertToCSV(events: AuditEvent[]): string {
    if (events.length === 0) return '';

    const headers = [
      'id', 'eventType', 'timestamp', 'userId', 'userEmail', 'action', 
      'description', 'severity', 'outcome', 'resourceType', 'resourceId',
      'clientIp', 'userAgent', 'duration', 'errorMessage'
    ];

    const csvRows = [
      headers.join(','),
      ...events.map(event => headers.map(header => {
        const value = (event as any)[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(','))
    ];

    return csvRows.join('\n');
  }

  private calculateDailyTrends(events: AuditEvent[], days: number): Array<{ date: string; count: number }> {
    const trends: Array<{ date: string; count: number }> = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const count = events.filter(event => {
        const eventDate = event.timestamp.toISOString().split('T')[0];
        return eventDate === dateStr;
      }).length;

      trends.push({ date: dateStr, count });
    }

    return trends;
  }

  private startCleanup(): void {
    // Run cleanup daily
    this.cleanupTimer = setInterval(async () => {
      try {
        const cleaned = await this.cleanup();
        if (cleaned > 0) {
          this.logger?.info(`Audit cleanup completed: ${cleaned} records removed`);
        }
      } catch (error) {
        this.logger?.error('Audit cleanup failed', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
  }
}

// Export singleton instance
export const auditTrail = AuditTrailService.getInstance();

// Convenience functions
export const AuditUtils = {
  // Create context from request
  createRequestContext(req: any): Partial<AuditEvent> {
    return {
      requestId: req.headers['x-request-id'] || req.id,
      correlationId: req.headers['x-correlation-id'],
      clientIp: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
      userEmail: req.user?.email,
      userName: req.user?.name,
      userRole: req.user?.role,
      sessionId: req.session?.id || req.sessionID,
    };
  },

  // Create middleware for automatic API auditing
  createAuditMiddleware(options: {
    includeRequestBody?: boolean;
    includeResponseBody?: boolean;
    excludePaths?: string[];
  } = {}) {
    return async (req: any, res: any, next: any) => {
      const startTime = Date.now();
      const { includeRequestBody = false, includeResponseBody = false, excludePaths = [] } = options;

      // Skip excluded paths
      if (excludePaths.some(path => req.path.includes(path))) {
        return next();
      }

      // Capture original methods
      const originalSend = res.json;
      let responseBody: any;

      res.json = function (data: any) {
        responseBody = data;
        return originalSend.call(this, data);
      };

      res.on('finish', async () => {
        const duration = Date.now() - startTime;
        const context = AuditUtils.createRequestContext(req);

        await auditTrail.audit({
          ...context,
          eventType: AuditEventType.API_CALL,
          action: `${req.method} ${req.path}`,
          description: `API call: ${req.method} ${req.path}`,
          severity: AuditSeverity.LOW,
          outcome: res.statusCode < 400 ? AuditOutcome.SUCCESS : AuditOutcome.FAILURE,
          duration,
          errorCode: res.statusCode >= 400 ? String(res.statusCode) : undefined,
          metadata: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            requestBody: includeRequestBody ? req.body : undefined,
            responseBody: includeResponseBody ? responseBody : undefined,
            query: req.query,
            params: req.params,
          },
        });
      });

      next();
    };
  },
};

// Export all types and enums
export {
  AuditEventType,
  AuditSeverity,
  AuditOutcome,
  type AuditEvent,
  type AuditConfig,
  type AuditQueryFilter,
  type IAuditStorage,
};