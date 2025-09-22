/**
 * XDR EVENT SEQUELIZE MODEL
 * Represents Extended Detection and Response events with comprehensive type safety
 */
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
  HasMany,
  ForeignKey,
  DataType,
  Index,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { User } from './User.model';
import { Alert } from './Alert.model';
import { IOC } from './IOC.model';
import { ThreatHunt } from './ThreatHunt.model';

// XDREvent Attributes Interface
export interface XDREventAttributes {
  /** Unique identifier for the XDR event */
  id: number;
  /** Unique event identifier from source system */
  event_id: string;
  /** Human-readable event name */
  event_name: string;
  /** Detailed description of the event */
  description?: string;
  /** Type of event (endpoint, network, email, cloud, identity) */
  event_type: 'endpoint' | 'network' | 'email' | 'cloud' | 'identity' | 'file' | 'process' | 'registry' | 'other';
  /** Severity level of the event */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Current status of the event */
  status: 'open' | 'investigating' | 'resolved' | 'false_positive' | 'suppressed';
  /** Source system that generated the event */
  source_system?: string;
  /** Hostname where the event occurred */
  hostname?: string;
  /** IP address associated with the event */
  ip_address?: string;
  /** Username associated with the event */
  user_name?: string;
  /** Process name associated with the event */
  process_name?: string;
  /** Command line used */
  command_line?: string;
  /** File path involved in the event */
  file_path?: string;
  /** Hash of the file involved */
  file_hash?: string;
  /** MITRE ATT&CK techniques associated */
  mitre_techniques: string[];
  /** Kill chain phases */
  kill_chain_phases: string[];
  /** ID of the analyst assigned to this event */
  analyst_id?: number;
  /** ID of the related alert */
  alert_id?: number;
  /** ID of the related threat hunt */
  threat_hunt_id?: number;
  /** When the original event occurred */
  event_time?: Date;
  /** When the event was detected by the system */
  detection_time?: Date;
  /** Original raw event data */
  raw_event: Record<string, any>;
  /** Normalized event data */
  normalized_event: Record<string, any>;
  /** Additional enrichment data */
  enrichment_data: Record<string, any>;
  /** Correlation data with other events */
  correlation_data: Record<string, any>;
  /** Classification tags */
  tags: string[];
  /** Risk score (0-100) */
  risk_score: number;
  /** Confidence score (0-100) */
  confidence_score: number;
  /** Whether this event is correlated with others */
  is_correlated: boolean;
  /** Number of similar events aggregated */
  event_count: number;
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// XDREvent Creation Attributes Interface
export interface XDREventCreationAttributes extends Optional<XDREventAttributes,
  'id' | 'description' | 'severity' | 'status' | 'source_system' | 'hostname' | 
  'ip_address' | 'user_name' | 'process_name' | 'command_line' | 'file_path' | 
  'file_hash' | 'mitre_techniques' | 'kill_chain_phases' | 'analyst_id' | 'alert_id' |
  'threat_hunt_id' | 'event_time' | 'detection_time' | 'raw_event' | 'normalized_event' |
  'enrichment_data' | 'correlation_data' | 'tags' | 'risk_score' | 'confidence_score' |
  'is_correlated' | 'event_count' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'xdr_events',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['event_id'], unique: true },
    { fields: ['event_type'] },
    { fields: ['severity'] },
    { fields: ['status'] },
    { fields: ['hostname'] },
    { fields: ['ip_address'] },
    { fields: ['user_name'] },
    { fields: ['analyst_id'] },
    { fields: ['alert_id'] },
    { fields: ['threat_hunt_id'] },
    { fields: ['event_time'] },
    { fields: ['detection_time'] },
    { fields: ['risk_score'] },
    { fields: ['is_correlated'] },
    { fields: ['created_at'] }
  ]
})
export class XDREvent extends Model<XDREventAttributes, XDREventCreationAttributes> implements XDREventAttributes {
  /** Unique identifier for the XDR event */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Unique event identifier from source system */
  @AllowNull(false)
  @Index({ unique: true })
  @Length({ min: 1, max: 100 })
  @Column(DataType.STRING(100))
  declare event_id: string;

  /** Human-readable event name */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare event_name: string;

  /** Detailed description of the event */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Type of event (endpoint, network, email, cloud, identity) */
  @AllowNull(false)
  @Default('other')
  @Index
  @Column(DataType.ENUM('endpoint', 'network', 'email', 'cloud', 'identity', 'file', 'process', 'registry', 'other'))
  declare event_type: 'endpoint' | 'network' | 'email' | 'cloud' | 'identity' | 'file' | 'process' | 'registry' | 'other';

  /** Severity level of the event */
  @AllowNull(false)
  @Default('medium')
  @Index
  @Column(DataType.ENUM('low', 'medium', 'high', 'critical'))
  declare severity: 'low' | 'medium' | 'high' | 'critical';

  /** Current status of the event */
  @AllowNull(false)
  @Default('open')
  @Index
  @Column(DataType.ENUM('open', 'investigating', 'resolved', 'false_positive', 'suppressed'))
  declare status: 'open' | 'investigating' | 'resolved' | 'false_positive' | 'suppressed';

  /** Source system that generated the event */
  @AllowNull(true)
  @Length({ max: 255 })
  @Column(DataType.STRING(255))
  declare source_system?: string;

  /** Hostname where the event occurred */
  @AllowNull(true)
  @Index
  @Length({ max: 255 })
  @Column(DataType.STRING(255))
  declare hostname?: string;

  /** IP address associated with the event */
  @AllowNull(true)
  @Index
  @Length({ max: 45 }) // IPv6 support
  @Column(DataType.STRING(45))
  declare ip_address?: string;

  /** Username associated with the event */
  @AllowNull(true)
  @Index
  @Length({ max: 255 })
  @Column(DataType.STRING(255))
  declare user_name?: string;

  /** Process name associated with the event */
  @AllowNull(true)
  @Length({ max: 500 })
  @Column(DataType.STRING(500))
  declare process_name?: string;

  /** Command line used */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare command_line?: string;

  /** File path involved in the event */
  @AllowNull(true)
  @Length({ max: 1000 })
  @Column(DataType.STRING(1000))
  declare file_path?: string;

  /** Hash of the file involved */
  @AllowNull(true)
  @Length({ max: 128 }) // Support for SHA-512
  @Column(DataType.STRING(128))
  declare file_hash?: string;

  /** MITRE ATT&CK techniques associated */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare mitre_techniques: string[];

  /** Kill chain phases */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare kill_chain_phases: string[];

  /** ID of the analyst assigned to this event */
  @ForeignKey(() => User)
  @AllowNull(true)
  @Index
  @Column(DataType.INTEGER)
  declare analyst_id?: number;

  /** ID of the related alert */
  @ForeignKey(() => Alert)
  @AllowNull(true)
  @Index
  @Column(DataType.INTEGER)
  declare alert_id?: number;

  /** ID of the related threat hunt */
  @ForeignKey(() => ThreatHunt)
  @AllowNull(true)
  @Index
  @Column(DataType.INTEGER)
  declare threat_hunt_id?: number;

  /** When the original event occurred */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare event_time?: Date;

  /** When the event was detected by the system */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare detection_time?: Date;

  /** Original raw event data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare raw_event: Record<string, any>;

  /** Normalized event data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare normalized_event: Record<string, any>;

  /** Additional enrichment data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare enrichment_data: Record<string, any>;

  /** Correlation data with other events */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare correlation_data: Record<string, any>;

  /** Classification tags */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Risk score (0-100) */
  @AllowNull(false)
  @Default(0)
  @Index
  @Column(DataType.INTEGER)
  declare risk_score: number;

  /** Confidence score (0-100) */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare confidence_score: number;

  /** Whether this event is correlated with others */
  @AllowNull(false)
  @Default(false)
  @Index
  @Column(DataType.BOOLEAN)
  declare is_correlated: boolean;

  /** Number of similar events aggregated */
  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare event_count: number;

  /** Additional metadata */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  /** Record creation timestamp */
  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  /** Record last update timestamp */
  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Associations
  /** Analyst assigned to this event */
  @BelongsTo(() => User, {
    foreignKey: 'analyst_id',
    as: 'analyst',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare analyst?: User;

  /** Related alert */
  @BelongsTo(() => Alert, {
    foreignKey: 'alert_id',
    as: 'alert',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare alert?: Alert;

  /** Related threat hunt */
  @BelongsTo(() => ThreatHunt, {
    foreignKey: 'threat_hunt_id',
    as: 'threat_hunt',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare threat_hunt?: ThreatHunt;

  /** Related IOCs */
  @HasMany(() => IOC, {
    foreignKey: 'xdr_event_id',
    as: 'related_iocs',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare related_iocs?: IOC[];

  // Instance methods
  /**
   * Check if this is a high-risk event
   * @returns True if severity is high/critical or risk score >= 80
   */
  public isHighRisk(): boolean {
    return this.severity === 'critical' || this.severity === 'high' || this.risk_score >= 80;
  }

  /**
   * Check if this is a critical event
   * @returns True if severity is critical or risk score >= 90
   */
  public isCritical(): boolean {
    return this.severity === 'critical' || this.risk_score >= 90;
  }

  /**
   * Check if the event is currently open
   * @returns True if status is open
   */
  public isOpen(): boolean {
    return this.status === 'open';
  }

  /**
   * Check if the event is being investigated
   * @returns True if status is investigating
   */
  public isInvestigating(): boolean {
    return this.status === 'investigating';
  }

  /**
   * Check if the event is resolved
   * @returns True if status is resolved
   */
  public isResolved(): boolean {
    return this.status === 'resolved';
  }

  /**
   * Check if the event is a false positive
   * @returns True if status is false_positive
   */
  public isFalsePositive(): boolean {
    return this.status === 'false_positive';
  }

  /**
   * Check if the event is suppressed
   * @returns True if status is suppressed
   */
  public isSuppressed(): boolean {
    return this.status === 'suppressed';
  }

  /**
   * Get time to detection in minutes
   * @returns Minutes from event to detection, or null if times unavailable
   */
  public getTimeToDetection(): number | null {
    if (!this.event_time || !this.detection_time) return null;
    return Math.round((this.detection_time.getTime() - this.event_time.getTime()) / (1000 * 60));
  }

  /**
   * Get age of event in hours
   * @returns Hours since event occurred, or hours since creation if no event time
   */
  public getEventAge(): number {
    const referenceTime = this.event_time || this.created_at;
    const diffTime = new Date().getTime() - referenceTime.getTime();
    return Math.round(diffTime / (1000 * 60 * 60));
  }

  /**
   * Get detection latency in minutes
   * @returns Minutes from creation to detection, or null if no detection time
   */
  public getDetectionLatency(): number | null {
    if (!this.detection_time) return null;
    const diffTime = this.detection_time.getTime() - this.created_at.getTime();
    return Math.round(diffTime / (1000 * 60));
  }

  /**
   * Check if event uses specific MITRE technique
   * @param techniqueId MITRE ATT&CK technique ID
   * @returns True if technique is associated with event
   */
  public usesTechnique(techniqueId: string): boolean {
    return this.mitre_techniques.includes(techniqueId);
  }

  /**
   * Check if event is in specific kill chain phase
   * @param phase Kill chain phase name
   * @returns True if event is in specified phase
   */
  public isInKillChainPhase(phase: string): boolean {
    return this.kill_chain_phases.includes(phase);
  }

  /**
   * Correlate this event with others
   * @param relatedEventIds Array of related event IDs
   * @returns Promise resolving to updated event
   */
  public async correlate(relatedEventIds: string[]): Promise<this> {
    this.is_correlated = true;
    this.correlation_data = {
      ...this.correlation_data,
      related_events: relatedEventIds,
      correlated_at: new Date(),
      correlation_count: relatedEventIds.length
    };
    return this.save();
  }

  /**
   * Escalate event severity
   * @returns Promise resolving to updated event
   */
  public async escalate(): Promise<this> {
    const severityOrder: XDREventAttributes['severity'][] = ['low', 'medium', 'high', 'critical'];
    const currentIndex = severityOrder.indexOf(this.severity);
    if (currentIndex < severityOrder.length - 1) {
      this.severity = severityOrder[currentIndex + 1] as XDREventAttributes['severity'];
      // Increase risk score proportionally
      this.risk_score = Math.min(100, this.risk_score + 25);
      return this.save();
    }
    return this;
  }

  /**
   * Assign analyst to event
   * @param analystId User ID of analyst
   * @returns Promise resolving to updated event
   */
  public async assignAnalyst(analystId: number): Promise<this> {
    this.analyst_id = analystId;
    if (this.status === 'open') {
      this.status = 'investigating';
    }
    return this.save();
  }

  /**
   * Resolve the event
   * @param resolution Resolution notes
   * @returns Promise resolving to updated event
   */
  public async resolve(resolution?: string): Promise<this> {
    this.status = 'resolved';
    if (resolution) {
      this.metadata = {
        ...this.metadata,
        resolution,
        resolved_at: new Date()
      };
    }
    return this.save();
  }

  /**
   * Mark event as false positive
   * @param reason Reason for false positive
   * @returns Promise resolving to updated event
   */
  public async markFalsePositive(reason?: string): Promise<this> {
    this.status = 'false_positive';
    if (reason) {
      this.metadata = {
        ...this.metadata,
        false_positive_reason: reason,
        marked_false_positive_at: new Date()
      };
    }
    return this.save();
  }

  /**
   * Suppress the event
   * @param reason Reason for suppression
   * @returns Promise resolving to updated event
   */
  public async suppress(reason?: string): Promise<this> {
    this.status = 'suppressed';
    if (reason) {
      this.metadata = {
        ...this.metadata,
        suppression_reason: reason,
        suppressed_at: new Date()
      };
    }
    return this.save();
  }

  /**
   * Update risk score
   * @param score New risk score (0-100)
   * @returns Promise resolving to updated event
   */
  public async updateRiskScore(score: number): Promise<this> {
    this.risk_score = Math.max(0, Math.min(100, score));
    return this.save();
  }

  /**
   * Add a tag to the event
   * @param tag Tag to add
   * @returns Promise resolving to updated event
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a tag from the event
   * @param tag Tag to remove
   * @returns Promise resolving to updated event
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  /**
   * Add enrichment data
   * @param data Enrichment data to add
   * @returns Promise resolving to updated event
   */
  public async addEnrichment(data: Record<string, any>): Promise<this> {
    this.enrichment_data = { ...this.enrichment_data, ...data };
    return this.save();
  }

  // Static methods
  /**
   * Find all open events
   * @returns Promise resolving to open events
   */
  static async findOpen(): Promise<XDREvent[]> {
    return this.findAll({
      where: { status: 'open' },
      order: [['severity', 'DESC'], ['risk_score', 'DESC'], ['created_at', 'DESC']]
    });
  }

  /**
   * Find events by type
   * @param eventType Event type to filter by
   * @returns Promise resolving to events of specified type
   */
  static async findByType(eventType: XDREventAttributes['event_type']): Promise<XDREvent[]> {
    return this.findAll({
      where: { event_type: eventType },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find events by severity
   * @param severity Severity level to filter by
   * @returns Promise resolving to events with specified severity
   */
  static async findBySeverity(severity: XDREventAttributes['severity']): Promise<XDREvent[]> {
    return this.findAll({
      where: { severity },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find events by status
   * @param status Status to filter by
   * @returns Promise resolving to events with specified status
   */
  static async findByStatus(status: XDREventAttributes['status']): Promise<XDREvent[]> {
    return this.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find events by hostname
   * @param hostname Hostname to search for
   * @returns Promise resolving to events from specified hostname
   */
  static async findByHostname(hostname: string): Promise<XDREvent[]> {
    return this.findAll({
      where: { hostname },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find events by user
   * @param userName Username to search for
   * @returns Promise resolving to events associated with specified user
   */
  static async findByUser(userName: string): Promise<XDREvent[]> {
    return this.findAll({
      where: { user_name: userName },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find events by IP address
   * @param ipAddress IP address to search for
   * @returns Promise resolving to events from specified IP
   */
  static async findByIP(ipAddress: string): Promise<XDREvent[]> {
    return this.findAll({
      where: { ip_address: ipAddress },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find events by analyst
   * @param analystId Analyst user ID
   * @returns Promise resolving to events assigned to specified analyst
   */
  static async findByAnalyst(analystId: number): Promise<XDREvent[]> {
    return this.findAll({
      where: { analyst_id: analystId },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find high-risk events
   * @param threshold Risk score threshold (default: 80)
   * @returns Promise resolving to high-risk events
   */
  static async findHighRisk(threshold: number = 80): Promise<XDREvent[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { severity: { [Op.in]: ['high', 'critical'] } },
          { risk_score: { [Op.gte]: threshold } }
        ]
      },
      order: [['risk_score', 'DESC'], ['created_at', 'DESC']]
    });
  }

  /**
   * Find correlated events
   * @returns Promise resolving to correlated events
   */
  static async findCorrelated(): Promise<XDREvent[]> {
    return this.findAll({
      where: { is_correlated: true },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find recent events
   * @param hours Number of hours to look back (default: 24)
   * @returns Promise resolving to recent events
   */
  static async findRecent(hours: number = 24): Promise<XDREvent[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    
    return this.findAll({
      where: {
        created_at: { [Op.gte]: cutoffDate }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find events by MITRE technique
   * @param techniqueId MITRE ATT&CK technique ID
   * @returns Promise resolving to events using specified technique
   */
  static async findByMitreTechnique(techniqueId: string): Promise<XDREvent[]> {
    return this.findAll({
      where: {
        mitre_techniques: { [Op.contains]: [techniqueId] }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find events by kill chain phase
   * @param phase Kill chain phase
   * @returns Promise resolving to events in specified phase
   */
  static async findByKillChainPhase(phase: string): Promise<XDREvent[]> {
    return this.findAll({
      where: {
        kill_chain_phases: { [Op.contains]: [phase] }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find unassigned events
   * @returns Promise resolving to unassigned events
   */
  static async findUnassigned(): Promise<XDREvent[]> {
    return this.findAll({
      where: {
        analyst_id: null,
        status: { [Op.in]: ['open', 'investigating'] }
      },
      order: [['severity', 'DESC'], ['risk_score', 'DESC']]
    });
  }

  /**
   * Search events by multiple criteria
   * @param query Search query (hostname, IP, user, process, etc.)
   * @returns Promise resolving to matching events
   */
  static async searchEvents(query: string): Promise<XDREvent[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { event_name: { [Op.iLike]: `%${query}%` } },
          { hostname: { [Op.iLike]: `%${query}%` } },
          { ip_address: { [Op.iLike]: `%${query}%` } },
          { user_name: { [Op.iLike]: `%${query}%` } },
          { process_name: { [Op.iLike]: `%${query}%` } },
          { file_path: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get event type distribution statistics
   * @returns Promise resolving to type statistics
   */
  static async getTypeStats(): Promise<Array<{ type: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'event_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['event_type'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      type: r.event_type,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get severity distribution statistics
   * @returns Promise resolving to severity statistics
   */
  static async getSeverityStats(): Promise<Array<{ severity: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'severity',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['severity']
    });
    
    return results.map(r => ({
      severity: r.severity,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get status distribution statistics
   * @returns Promise resolving to status statistics
   */
  static async getStatusStats(): Promise<Array<{ status: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'status',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['status']
    });
    
    return results.map(r => ({
      status: r.status,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get comprehensive detection statistics
   * @returns Promise resolving to detection statistics
   */
  static async getDetectionStats(): Promise<{
    total_events: number;
    open_events: number;
    investigating_events: number;
    resolved_events: number;
    high_risk_events: number;
    critical_events: number;
    correlated_events: number;
    false_positives: number;
    avg_risk_score: number;
    avg_time_to_detection: number;
  }> {
    const [
      totalEvents,
      openEvents,
      investigatingEvents,
      resolvedEvents,
      highRiskEvents,
      criticalEvents,
      correlatedEvents,
      falsePositives,
      avgRiskResult,
      timeToDetectionResult
    ] = await Promise.all([
      this.count(),
      this.count({ where: { status: 'open' } }),
      this.count({ where: { status: 'investigating' } }),
      this.count({ where: { status: 'resolved' } }),
      this.count({ where: { risk_score: { [Op.gte]: 80 } } }),
      this.count({ where: { severity: 'critical' } }),
      this.count({ where: { is_correlated: true } }),
      this.count({ where: { status: 'false_positive' } }),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('AVG', this.sequelize!.col('risk_score')), 'avg_risk']
        ]
      }).then(results => results[0]),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('AVG', 
            this.sequelize!.literal('EXTRACT(EPOCH FROM (detection_time - event_time))/60')
          ), 'avg_time_to_detection']
        ],
        where: this.sequelize!.literal('event_time IS NOT NULL AND detection_time IS NOT NULL')
      }).then(results => results[0])
    ]);

    return {
      total_events: totalEvents,
      open_events: openEvents,
      investigating_events: investigatingEvents,
      resolved_events: resolvedEvents,
      high_risk_events: highRiskEvents,
      critical_events: criticalEvents,
      correlated_events: correlatedEvents,
      false_positives: falsePositives,
      avg_risk_score: parseFloat((avgRiskResult as any).getDataValue('avg_risk')) || 0,
      avg_time_to_detection: parseFloat((timeToDetectionResult as any).getDataValue('avg_time_to_detection')) || 0
    };
  }

  /**
   * Create XDR event with validation
   * @param data Event data to create
   * @returns Promise resolving to created event
   */
  static async createEvent(data: XDREventCreationAttributes): Promise<XDREvent> {
    // Validate risk score
    if (data.risk_score !== undefined && (data.risk_score < 0 || data.risk_score > 100)) {
      throw new Error('Risk score must be between 0 and 100');
    }

    // Validate confidence score
    if (data.confidence_score !== undefined && (data.confidence_score < 0 || data.confidence_score > 100)) {
      throw new Error('Confidence score must be between 0 and 100');
    }

    // Set detection time if not provided
    if (!data.detection_time) {
      data.detection_time = new Date();
    }

    // Validate IP address format if provided
    if (data.ip_address) {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
      if (!ipRegex.test(data.ip_address)) {
        throw new Error('Invalid IP address format');
      }
    }

    return this.create(data);
  }
}

export default XDREvent;
