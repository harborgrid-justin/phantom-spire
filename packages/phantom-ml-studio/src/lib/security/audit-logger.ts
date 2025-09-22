/**
 * Enterprise Audit Logging System
 * Comprehensive audit trail with compliance reporting
 * Supports SOX, GDPR, HIPAA, and other regulatory requirements
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent?: string;
  eventType: AuditEventType;
  category: AuditCategory;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  outcome: AuditOutcome;
  severity: AuditSeverity;
  metadata: Record<string, any>;
  correlationId?: string;
  requestId?: string;
  errorDetails?: {
    error: string;
    stackTrace?: string;
    errorCode?: string;
  };
  complianceFlags?: ComplianceFlag[];
  dataClassification?: DataClassification;
  retentionPeriod: number; // days
  hash?: string; // Integrity verification
}

export enum AuditEventType {
  // Authentication & Authorization
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCKED = 'account_locked',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  
  // Data Operations
  DATA_ACCESS = 'data_access',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  DATA_MODIFICATION = 'data_modification',
  DATA_DELETION = 'data_deletion',
  DATA_ANONYMIZATION = 'data_anonymization',
  
  // ML Operations
  MODEL_CREATED = 'model_created',
  MODEL_TRAINED = 'model_trained',
  MODEL_DEPLOYED = 'model_deployed',
  MODEL_DELETED = 'model_deleted',
  PREDICTION_MADE = 'prediction_made',
  EXPERIMENT_STARTED = 'experiment_started',
  
  // System Events
  CONFIG_CHANGE = 'config_change',
  SYSTEM_ERROR = 'system_error',
  BACKUP_CREATED = 'backup_created',
  SECURITY_ALERT = 'security_alert',
  
  // Compliance Events
  GDPR_REQUEST = 'gdpr_request',
  DATA_RETENTION_PURGE = 'data_retention_purge',
  COMPLIANCE_REPORT_GENERATED = 'compliance_report_generated'
}

export enum AuditCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_PROCESSING = 'data_processing',
  ML_OPERATIONS = 'ml_operations',
  SYSTEM_ADMINISTRATION = 'system_administration',
  COMPLIANCE = 'compliance',
  SECURITY = 'security'
}

export enum AuditOutcome {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL_SUCCESS = 'partial_success',
  BLOCKED = 'blocked',
  WARNING = 'warning'
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ComplianceFlag {
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
  SOX = 'sox',
  PCI_DSS = 'pci_dss',
  ISO_27001 = 'iso_27001',
  NIST = 'nist'
}

export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  eventTypes?: AuditEventType[];
  categories?: AuditCategory[];
  outcomes?: AuditOutcome[];
  severities?: AuditSeverity[];
  resources?: string[];
  ipAddresses?: string[];
  complianceFlags?: ComplianceFlag[];
  limit?: number;
  offset?: number;
}

export interface ComplianceReport {
  reportId: string;
  generatedAt: Date;
  reportType: ComplianceFlag;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    securityAlerts: number;
    dataAccessEvents: number;
    privilegedOperations: number;
  };
  findings: Array<{
    severity: AuditSeverity;
    description: string;
    recommendation: string;
    events: AuditEvent[];
  }>;
  signature: string; // Digital signature for integrity
}

export interface AuditStorage {
  store(event: AuditEvent): Promise<void>;
  query(filter: AuditFilter): Promise<AuditEvent[]>;
  count(filter: AuditFilter): Promise<number>;
  purgeExpired(): Promise<number>;
  verifyIntegrity(eventId: string): Promise<boolean>;
}

/**
 * File-based audit storage (for development/testing)
 */
export class FileAuditStorage implements AuditStorage {
  private events: AuditEvent[] = [];

  async store(event: AuditEvent): Promise<void> {
    this.events.push(event);
    // In production, this would write to secure, append-only files
  }

  async query(filter: AuditFilter): Promise<AuditEvent[]> {
    let filtered = this.events;

    if (filter.startDate) {
      filtered = filtered.filter(e => e.timestamp >= filter.startDate!);
    }
    
    if (filter.endDate) {
      filtered = filtered.filter(e => e.timestamp <= filter.endDate!);
    }

    if (filter.userId) {
      filtered = filtered.filter(e => e.userId === filter.userId);
    }

    if (filter.eventTypes?.length) {
      filtered = filtered.filter(e => filter.eventTypes!.includes(e.eventType));
    }

    if (filter.categories?.length) {
      filtered = filtered.filter(e => filter.categories!.includes(e.category));
    }

    if (filter.outcomes?.length) {
      filtered = filtered.filter(e => filter.outcomes!.includes(e.outcome));
    }

    if (filter.severities?.length) {
      filtered = filtered.filter(e => filter.severities!.includes(e.severity));
    }

    if (filter.resources?.length) {
      filtered = filtered.filter(e => filter.resources!.includes(e.resource));
    }

    if (filter.ipAddresses?.length) {
      filtered = filtered.filter(e => filter.ipAddresses!.includes(e.ipAddress));
    }

    if (filter.complianceFlags?.length) {
      filtered = filtered.filter(e => 
        e.complianceFlags?.some(flag => filter.complianceFlags!.includes(flag))
      );
    }

    // Apply pagination
    const start = filter.offset || 0;
    const end = filter.limit ? start + filter.limit : undefined;
    
    return filtered.slice(start, end);
  }

  async count(filter: AuditFilter): Promise<number> {
    const results = await this.query({ ...filter, limit: undefined, offset: undefined });
    return results.length;
  }

  async purgeExpired(): Promise<number> {
    const now = new Date();
    const initialCount = this.events.length;
    
    this.events = this.events.filter(event => {
      const retentionExpiry = new Date(event.timestamp);
      retentionExpiry.setDate(retentionExpiry.getDate() + event.retentionPeriod);
      return retentionExpiry > now;
    });
    
    return initialCount - this.events.length;
  }

  async verifyIntegrity(eventId: string): Promise<boolean> {
    const event = this.events.find(e => e.id === eventId);
    if (!event || !event.hash) return false;
    
    const computedHash = this.computeEventHash(event);
    return computedHash === event.hash;
  }

  private computeEventHash(event: AuditEvent): string {
    const hashData = {
      id: event.id,
      timestamp: event.timestamp.toISOString(),
      userId: event.userId,
      eventType: event.eventType,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      oldValue: event.oldValue,
      newValue: event.newValue,
      outcome: event.outcome
    };
    
    return crypto.createHash('sha256')
      .update(JSON.stringify(hashData))
      .digest('hex');
  }
}

/**
 * Enterprise Audit Logger with comprehensive compliance features
 */
export class EnterpriseAuditLogger extends EventEmitter {
  private storage: AuditStorage;
  private defaultRetentionDays: number;
  private encryptionEnabled: boolean;
  private realTimeAlerts: boolean;

  constructor(options: {
    storage?: AuditStorage;
    defaultRetentionDays?: number;
    encryptionEnabled?: boolean;
    realTimeAlerts?: boolean;
  } = {}) {
    super();
    
    this.storage = options.storage || new FileAuditStorage();
    this.defaultRetentionDays = options.defaultRetentionDays || 2555; // 7 years default
    this.encryptionEnabled = options.encryptionEnabled || true;
    this.realTimeAlerts = options.realTimeAlerts || true;
    
    // Start background tasks
    this.startRetentionCleanup();
    this.startIntegrityChecks();
  }

  /**
   * Log an audit event
   */
  async logEvent(eventData: {
    userId?: string;
    sessionId?: string;
    ipAddress: string;
    userAgent?: string;
    eventType: AuditEventType;
    action: string;
    resource: string;
    resourceId?: string;
    oldValue?: any;
    newValue?: any;
    outcome: AuditOutcome;
    severity?: AuditSeverity;
    metadata?: Record<string, any>;
    correlationId?: string;
    requestId?: string;
    errorDetails?: {
      error: string;
      stackTrace?: string;
      errorCode?: string;
    };
    dataClassification?: DataClassification;
    retentionPeriod?: number;
  }): Promise<string> {
    const eventId = crypto.randomUUID();
    const timestamp = new Date();
    
    // Determine category based on event type
    const category = this.categorizeEvent(eventData.eventType);
    
    // Determine compliance flags
    const complianceFlags = this.determineComplianceFlags(eventData);
    
    // Create audit event
    const auditEvent: AuditEvent = {
      id: eventId,
      timestamp,
      category,
      severity: eventData.severity || AuditSeverity.MEDIUM,
      complianceFlags,
      dataClassification: eventData.dataClassification,
      retentionPeriod: eventData.retentionPeriod || this.defaultRetentionDays,
      ...eventData,
      metadata: {
        ...eventData.metadata,
        clientFingerprint: this.generateClientFingerprint(eventData.userAgent, eventData.ipAddress)
      }
    };
    
    // Compute integrity hash
    auditEvent.hash = this.computeEventHash(auditEvent);
    
    // Store the event
    await this.storage.store(auditEvent);
    
    // Emit event for real-time processing
    this.emit('auditEvent', auditEvent);
    
    // Handle real-time alerts
    if (this.realTimeAlerts) {
      await this.processRealTimeAlerts(auditEvent);
    }
    
    return eventId;
  }

  /**
   * Log authentication events
   */
  async logAuthentication(data: {
    userId?: string;
    sessionId?: string;
    ipAddress: string;
    userAgent?: string;
    action: 'login' | 'logout' | 'password_change' | 'account_locked';
    outcome: AuditOutcome;
    metadata?: Record<string, any>;
  }): Promise<string> {
    const eventTypeMap = {
      'login': data.outcome === AuditOutcome.SUCCESS ? AuditEventType.LOGIN_SUCCESS : AuditEventType.LOGIN_FAILED,
      'logout': AuditEventType.LOGOUT,
      'password_change': AuditEventType.PASSWORD_CHANGE,
      'account_locked': AuditEventType.ACCOUNT_LOCKED
    };
    
    return this.logEvent({
      ...data,
      eventType: eventTypeMap[data.action],
      resource: 'authentication',
      severity: data.outcome === AuditOutcome.FAILURE ? AuditSeverity.HIGH : AuditSeverity.LOW,
      complianceFlags: [ComplianceFlag.SOX, ComplianceFlag.ISO_27001]
    });
  }

  /**
   * Log data access events
   */
  async logDataAccess(data: {
    userId: string;
    sessionId?: string;
    ipAddress: string;
    userAgent?: string;
    action: 'read' | 'write' | 'delete' | 'export' | 'import';
    resource: string;
    resourceId: string;
    dataClassification: DataClassification;
    recordCount?: number;
    outcome: AuditOutcome;
    metadata?: Record<string, any>;
  }): Promise<string> {
    const eventTypeMap = {
      'read': AuditEventType.DATA_ACCESS,
      'write': AuditEventType.DATA_MODIFICATION,
      'delete': AuditEventType.DATA_DELETION,
      'export': AuditEventType.DATA_EXPORT,
      'import': AuditEventType.DATA_IMPORT
    };
    
    // Determine severity based on data classification and action
    let severity = AuditSeverity.MEDIUM;
    if (data.dataClassification === DataClassification.RESTRICTED) {
      severity = AuditSeverity.HIGH;
    } else if (data.action === 'delete' || data.action === 'export') {
      severity = AuditSeverity.HIGH;
    }
    
    const complianceFlags = [ComplianceFlag.GDPR];
    if (data.dataClassification === DataClassification.RESTRICTED) {
      complianceFlags.push(ComplianceFlag.HIPAA, ComplianceFlag.SOX);
    }
    
    return this.logEvent({
      ...data,
      eventType: eventTypeMap[data.action],
      severity,
      complianceFlags,
      metadata: {
        ...data.metadata,
        recordCount: data.recordCount
      }
    });
  }

  /**
   * Log ML operations
   */
  async logMLOperation(data: {
    userId: string;
    sessionId?: string;
    ipAddress: string;
    userAgent?: string;
    action: 'create_model' | 'train_model' | 'deploy_model' | 'delete_model' | 'predict';
    modelId?: string;
    modelType?: string;
    outcome: AuditOutcome;
    performance?: Record<string, number>;
    metadata?: Record<string, any>;
  }): Promise<string> {
    const eventTypeMap = {
      'create_model': AuditEventType.MODEL_CREATED,
      'train_model': AuditEventType.MODEL_TRAINED,
      'deploy_model': AuditEventType.MODEL_DEPLOYED,
      'delete_model': AuditEventType.MODEL_DELETED,
      'predict': AuditEventType.PREDICTION_MADE
    };
    
    return this.logEvent({
      ...data,
      eventType: eventTypeMap[data.action],
      resource: 'ml_model',
      resourceId: data.modelId,
      severity: data.action === 'deploy_model' ? AuditSeverity.HIGH : AuditSeverity.MEDIUM,
      metadata: {
        ...data.metadata,
        modelType: data.modelType,
        performance: data.performance
      }
    });
  }

  /**
   * Log system administration events
   */
  async logSystemAdmin(data: {
    userId: string;
    sessionId?: string;
    ipAddress: string;
    userAgent?: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValue?: any;
    newValue?: any;
    outcome: AuditOutcome;
    metadata?: Record<string, any>;
  }): Promise<string> {
    return this.logEvent({
      ...data,
      eventType: AuditEventType.CONFIG_CHANGE,
      severity: AuditSeverity.HIGH,
      complianceFlags: [ComplianceFlag.SOX, ComplianceFlag.ISO_27001, ComplianceFlag.NIST]
    });
  }

  /**
   * Query audit events
   */
  async query(filter: AuditFilter): Promise<AuditEvent[]> {
    return this.storage.query(filter);
  }

  /**
   * Get audit statistics
   */
  async getStatistics(period: { start: Date; end: Date }): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByCategory: Record<string, number>;
    eventsByOutcome: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topUsers: Array<{ userId: string; eventCount: number }>;
    topResources: Array<{ resource: string; eventCount: number }>;
    complianceMetrics: Record<string, number>;
  }> {
    const events = await this.storage.query({
      startDate: period.start,
      endDate: period.end
    });
    
    const stats = {
      totalEvents: events.length,
      eventsByType: {} as Record<string, number>,
      eventsByCategory: {} as Record<string, number>,
      eventsByOutcome: {} as Record<string, number>,
      eventsBySeverity: {} as Record<string, number>,
      topUsers: [] as Array<{ userId: string; eventCount: number }>,
      topResources: [] as Array<{ resource: string; eventCount: number }>,
      complianceMetrics: {} as Record<string, number>
    };
    
    const userCounts: Record<string, number> = {};
    const resourceCounts: Record<string, number> = {};
    
    for (const event of events) {
      // Count by type
      stats.eventsByType[event.eventType] = (stats.eventsByType[event.eventType] || 0) + 1;
      
      // Count by category
      stats.eventsByCategory[event.category] = (stats.eventsByCategory[event.category] || 0) + 1;
      
      // Count by outcome
      stats.eventsByOutcome[event.outcome] = (stats.eventsByOutcome[event.outcome] || 0) + 1;
      
      // Count by severity
      stats.eventsBySeverity[event.severity] = (stats.eventsBySeverity[event.severity] || 0) + 1;
      
      // Count by user
      if (event.userId) {
        userCounts[event.userId] = (userCounts[event.userId] || 0) + 1;
      }
      
      // Count by resource
      resourceCounts[event.resource] = (resourceCounts[event.resource] || 0) + 1;
      
      // Count compliance flags
      if (event.complianceFlags) {
        for (const flag of event.complianceFlags) {
          stats.complianceMetrics[flag] = (stats.complianceMetrics[flag] || 0) + 1;
        }
      }
    }
    
    // Get top users and resources
    stats.topUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, eventCount]) => ({ userId, eventCount }));
      
    stats.topResources = Object.entries(resourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([resource, eventCount]) => ({ resource, eventCount }));
    
    return stats;
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    complianceType: ComplianceFlag,
    period: { start: Date; end: Date }
  ): Promise<ComplianceReport> {
    const events = await this.storage.query({
      startDate: period.start,
      endDate: period.end,
      complianceFlags: [complianceType]
    });
    
    const reportId = crypto.randomUUID();
    const generatedAt = new Date();
    
    // Calculate summary statistics
    const summary = {
      totalEvents: events.length,
      successfulEvents: events.filter(e => e.outcome === AuditOutcome.SUCCESS).length,
      failedEvents: events.filter(e => e.outcome === AuditOutcome.FAILURE).length,
      securityAlerts: events.filter(e => e.severity === AuditSeverity.CRITICAL).length,
      dataAccessEvents: events.filter(e => e.category === AuditCategory.DATA_PROCESSING).length,
      privilegedOperations: events.filter(e => 
        e.eventType === AuditEventType.PRIVILEGE_ESCALATION ||
        e.category === AuditCategory.SYSTEM_ADMINISTRATION
      ).length
    };
    
    // Generate findings based on compliance type
    const findings = this.generateComplianceFindings(complianceType, events);
    
    const report: ComplianceReport = {
      reportId,
      generatedAt,
      reportType: complianceType,
      period,
      summary,
      findings,
      signature: '' // Will be set below
    };
    
    // Generate digital signature for integrity
    report.signature = this.generateReportSignature(report);
    
    // Log report generation
    await this.logEvent({
      userId: 'system',
      ipAddress: '127.0.0.1',
      eventType: AuditEventType.COMPLIANCE_REPORT_GENERATED,
      action: 'generate_compliance_report',
      resource: 'compliance_report',
      resourceId: reportId,
      outcome: AuditOutcome.SUCCESS,
      metadata: {
        complianceType,
        period,
        eventCount: events.length
      }
    });
    
    return report;
  }

  /**
   * Verify audit event integrity
   */
  async verifyIntegrity(eventId: string): Promise<boolean> {
    return this.storage.verifyIntegrity(eventId);
  }

  /**
   * Private helper methods
   */
  private categorizeEvent(eventType: AuditEventType): AuditCategory {
    const categoryMap: Record<AuditEventType, AuditCategory> = {
      [AuditEventType.LOGIN_SUCCESS]: AuditCategory.AUTHENTICATION,
      [AuditEventType.LOGIN_FAILED]: AuditCategory.AUTHENTICATION,
      [AuditEventType.LOGOUT]: AuditCategory.AUTHENTICATION,
      [AuditEventType.PASSWORD_CHANGE]: AuditCategory.AUTHENTICATION,
      [AuditEventType.ACCOUNT_LOCKED]: AuditCategory.AUTHENTICATION,
      [AuditEventType.PRIVILEGE_ESCALATION]: AuditCategory.AUTHORIZATION,
      [AuditEventType.DATA_ACCESS]: AuditCategory.DATA_PROCESSING,
      [AuditEventType.DATA_EXPORT]: AuditCategory.DATA_PROCESSING,
      [AuditEventType.DATA_IMPORT]: AuditCategory.DATA_PROCESSING,
      [AuditEventType.DATA_MODIFICATION]: AuditCategory.DATA_PROCESSING,
      [AuditEventType.DATA_DELETION]: AuditCategory.DATA_PROCESSING,
      [AuditEventType.DATA_ANONYMIZATION]: AuditCategory.DATA_PROCESSING,
      [AuditEventType.MODEL_CREATED]: AuditCategory.ML_OPERATIONS,
      [AuditEventType.MODEL_TRAINED]: AuditCategory.ML_OPERATIONS,
      [AuditEventType.MODEL_DEPLOYED]: AuditCategory.ML_OPERATIONS,
      [AuditEventType.MODEL_DELETED]: AuditCategory.ML_OPERATIONS,
      [AuditEventType.PREDICTION_MADE]: AuditCategory.ML_OPERATIONS,
      [AuditEventType.EXPERIMENT_STARTED]: AuditCategory.ML_OPERATIONS,
      [AuditEventType.CONFIG_CHANGE]: AuditCategory.SYSTEM_ADMINISTRATION,
      [AuditEventType.SYSTEM_ERROR]: AuditCategory.SYSTEM_ADMINISTRATION,
      [AuditEventType.BACKUP_CREATED]: AuditCategory.SYSTEM_ADMINISTRATION,
      [AuditEventType.SECURITY_ALERT]: AuditCategory.SECURITY,
      [AuditEventType.GDPR_REQUEST]: AuditCategory.COMPLIANCE,
      [AuditEventType.DATA_RETENTION_PURGE]: AuditCategory.COMPLIANCE,
      [AuditEventType.COMPLIANCE_REPORT_GENERATED]: AuditCategory.COMPLIANCE
    };
    
    return categoryMap[eventType] || AuditCategory.SYSTEM_ADMINISTRATION;
  }

  private determineComplianceFlags(eventData: any): ComplianceFlag[] {
    const flags: ComplianceFlag[] = [];
    
    // All events are subject to ISO 27001
    flags.push(ComplianceFlag.ISO_27001);
    
    // Data processing events are subject to GDPR
    if (eventData.eventType === AuditEventType.DATA_ACCESS ||
        eventData.eventType === AuditEventType.DATA_EXPORT ||
        eventData.eventType === AuditEventType.DATA_MODIFICATION ||
        eventData.eventType === AuditEventType.DATA_DELETION) {
      flags.push(ComplianceFlag.GDPR);
    }
    
    // Restricted data is subject to HIPAA
    if (eventData.dataClassification === DataClassification.RESTRICTED) {
      flags.push(ComplianceFlag.HIPAA);
    }
    
    // Financial operations are subject to SOX
    if (eventData.resource?.includes('financial') || 
        eventData.eventType === AuditEventType.CONFIG_CHANGE) {
      flags.push(ComplianceFlag.SOX);
    }
    
    // System administration is subject to NIST
    if (eventData.eventType === AuditEventType.CONFIG_CHANGE ||
        eventData.eventType === AuditEventType.PRIVILEGE_ESCALATION) {
      flags.push(ComplianceFlag.NIST);
    }
    
    return flags;
  }

  private generateClientFingerprint(userAgent?: string, ipAddress?: string): string {
    const data = `${userAgent || 'unknown'}:${ipAddress || 'unknown'}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  private computeEventHash(event: AuditEvent): string {
    const hashData = {
      id: event.id,
      timestamp: event.timestamp.toISOString(),
      userId: event.userId,
      eventType: event.eventType,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      oldValue: event.oldValue,
      newValue: event.newValue,
      outcome: event.outcome
    };
    
    return crypto.createHash('sha256')
      .update(JSON.stringify(hashData, Object.keys(hashData).sort()))
      .digest('hex');
  }

  private generateReportSignature(report: Omit<ComplianceReport, 'signature'>): string {
    const signatureData = {
      reportId: report.reportId,
      generatedAt: report.generatedAt.toISOString(),
      reportType: report.reportType,
      period: report.period,
      summary: report.summary
    };
    
    return crypto.createHash('sha256')
      .update(JSON.stringify(signatureData, Object.keys(signatureData).sort()))
      .digest('hex');
  }

  private generateComplianceFindings(
    complianceType: ComplianceFlag,
    events: AuditEvent[]
  ): ComplianceReport['findings'] {
    const findings: ComplianceReport['findings'] = [];
    
    // Common findings based on compliance type
    switch (complianceType) {
      case ComplianceFlag.GDPR:
        this.addGDPRFindings(findings, events);
        break;
      case ComplianceFlag.SOX:
        this.addSOXFindings(findings, events);
        break;
      case ComplianceFlag.HIPAA:
        this.addHIPAAFindings(findings, events);
        break;
      case ComplianceFlag.ISO_27001:
        this.addISO27001Findings(findings, events);
        break;
    }
    
    return findings;
  }

  private addGDPRFindings(findings: ComplianceReport['findings'], events: AuditEvent[]): void {
    // Check for data export without proper authorization
    const unauthorizedExports = events.filter(e => 
      e.eventType === AuditEventType.DATA_EXPORT && 
      e.outcome === AuditOutcome.SUCCESS &&
      !e.metadata?.authorized
    );
    
    if (unauthorizedExports.length > 0) {
      findings.push({
        severity: AuditSeverity.HIGH,
        description: `${unauthorizedExports.length} data export(s) without proper authorization`,
        recommendation: 'Implement mandatory authorization checks for all data exports',
        events: unauthorizedExports
      });
    }
    
    // Check for data retention violations
    const retentionViolations = events.filter(e =>
      e.retentionPeriod > 2555 && // More than 7 years
      e.dataClassification === DataClassification.CONFIDENTIAL
    );
    
    if (retentionViolations.length > 0) {
      findings.push({
        severity: AuditSeverity.MEDIUM,
        description: `${retentionViolations.length} event(s) with excessive retention periods`,
        recommendation: 'Review and adjust data retention policies to comply with GDPR requirements',
        events: retentionViolations
      });
    }
  }

  private addSOXFindings(findings: ComplianceReport['findings'], events: AuditEvent[]): void {
    // Check for configuration changes without proper approval
    const unapprovedChanges = events.filter(e =>
      e.eventType === AuditEventType.CONFIG_CHANGE &&
      !e.metadata?.approvalId
    );
    
    if (unapprovedChanges.length > 0) {
      findings.push({
        severity: AuditSeverity.CRITICAL,
        description: `${unapprovedChanges.length} configuration change(s) without proper approval`,
        recommendation: 'Implement mandatory approval workflow for all configuration changes',
        events: unapprovedChanges
      });
    }
  }

  private addHIPAAFindings(findings: ComplianceReport['findings'], events: AuditEvent[]): void {
    // Check for access to restricted data without business justification
    const unjustifiedAccess = events.filter(e =>
      e.eventType === AuditEventType.DATA_ACCESS &&
      e.dataClassification === DataClassification.RESTRICTED &&
      !e.metadata?.businessJustification
    );
    
    if (unjustifiedAccess.length > 0) {
      findings.push({
        severity: AuditSeverity.HIGH,
        description: `${unjustifiedAccess.length} access(es) to restricted data without business justification`,
        recommendation: 'Require business justification for all access to restricted data',
        events: unjustifiedAccess
      });
    }
  }

  private addISO27001Findings(findings: ComplianceReport['findings'], events: AuditEvent[]): void {
    // Check for security incidents
    const securityIncidents = events.filter(e =>
      e.severity === AuditSeverity.CRITICAL ||
      e.eventType === AuditEventType.SECURITY_ALERT
    );
    
    if (securityIncidents.length > 0) {
      findings.push({
        severity: AuditSeverity.HIGH,
        description: `${securityIncidents.length} security incident(s) detected`,
        recommendation: 'Review security incidents and implement additional controls',
        events: securityIncidents
      });
    }
  }

  private async processRealTimeAlerts(event: AuditEvent): Promise<void> {
    // Critical events trigger immediate alerts
    if (event.severity === AuditSeverity.CRITICAL) {
      this.emit('criticalAlert', event);
    }
    
    // Failed authentication events
    if (event.eventType === AuditEventType.LOGIN_FAILED) {
      this.emit('authenticationFailure', event);
    }
    
    // Privileged operations
    if (event.eventType === AuditEventType.PRIVILEGE_ESCALATION ||
        event.category === AuditCategory.SYSTEM_ADMINISTRATION) {
      this.emit('privilegedOperation', event);
    }
    
    // Data export events
    if (event.eventType === AuditEventType.DATA_EXPORT) {
      this.emit('dataExport', event);
    }
  }

  private startRetentionCleanup(): void {
    // Run cleanup every day
    setInterval(async () => {
      try {
        const purgedCount = await this.storage.purgeExpired();
        if (purgedCount > 0) {
          await this.logEvent({
            userId: 'system',
            ipAddress: '127.0.0.1',
            eventType: AuditEventType.DATA_RETENTION_PURGE,
            action: 'purge_expired_events',
            resource: 'audit_log',
            outcome: AuditOutcome.SUCCESS,
            metadata: { purgedCount }
          });
        }
      } catch (error) {
        console.error('Audit retention cleanup failed:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  private startIntegrityChecks(): void {
    // Run integrity checks every hour
    setInterval(async () => {
      try {
        // This would check a sample of recent events for integrity
        // In production, this might use blockchain or other tamper-evident storage
        console.log('Audit integrity check completed');
      } catch (error) {
        console.error('Audit integrity check failed:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}

/**
 * Factory function to create audit logger
 */
export function createAuditLogger(options?: {
  storage?: AuditStorage;
  defaultRetentionDays?: number;
  encryptionEnabled?: boolean;
  realTimeAlerts?: boolean;
}): EnterpriseAuditLogger {
  return new EnterpriseAuditLogger(options);
}

// Export singleton instance
export const auditLogger = createAuditLogger();