/**
 * ALERT SEQUELIZE MODEL
 * Represents security alerts from detection systems with comprehensive type safety
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
  ForeignKey,
  DataType,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { User } from './User.model';
import { Incident } from './Incident.model';
import { IOC } from './IOC.model';

// Alert Attributes Interface
export interface AlertAttributes {
  /** Unique identifier for the alert */
  id: number;
  /** Alert title */
  title: string;
  /** Detailed description of the alert */
  description?: string;
  /** Current alert status */
  status: 'open' | 'investigating' | 'resolved' | 'false_positive' | 'suppressed';
  /** Alert severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Type of alert (IDS, SIEM, Endpoint, Network, etc.) */
  alert_type: string;
  /** Name of the detection system that generated this alert */
  source_system: string;
  /** User ID assigned to handle this alert */
  assigned_to?: number;
  /** Associated incident ID */
  incident_id?: number;
  /** IOC that triggered this alert */
  triggering_ioc_id?: number;
  /** Source IP address involved in the alert */
  source_ip?: string;
  /** Destination IP address involved in the alert */
  destination_ip?: string;
  /** Source port number */
  source_port?: number;
  /** Destination port number */
  destination_port?: number;
  /** Network protocol involved */
  protocol?: string;
  /** Raw data from the detection system */
  raw_data: Record<string, any>;
  /** Normalized and processed alert data */
  normalized_data: Record<string, any>;
  /** Alert classification tags */
  tags: string[];
  /** Confidence score (0-100) */
  confidence_score: number;
  /** Risk assessment score (0-100) */
  risk_score: number;
  /** When this alert type was first observed */
  first_seen?: Date;
  /** When this alert type was last observed */
  last_seen?: Date;
  /** Number of similar events aggregated in this alert */
  event_count: number;
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// Alert Creation Attributes Interface
export interface AlertCreationAttributes extends Optional<AlertAttributes,
  'id' | 'description' | 'status' | 'severity' | 'assigned_to' | 'incident_id' | 
  'triggering_ioc_id' | 'source_ip' | 'destination_ip' | 'source_port' | 
  'destination_port' | 'protocol' | 'raw_data' | 'normalized_data' | 'tags' | 
  'confidence_score' | 'risk_score' | 'first_seen' | 'last_seen' | 'event_count' | 
  'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'alerts',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['title'] },
    { fields: ['status'] },
    { fields: ['severity'] },
    { fields: ['alert_type'] },
    { fields: ['source_system'] },
    { fields: ['assigned_to'] },
    { fields: ['incident_id'] },
    { fields: ['source_ip'] },
    { fields: ['destination_ip'] },
    { fields: ['risk_score'] },
    { fields: ['confidence_score'] },
    { fields: ['created_at'] },
    { fields: ['first_seen'] },
    { fields: ['last_seen'] }
  ]
})
export class Alert extends Model<AlertAttributes, AlertCreationAttributes> implements AlertAttributes {
  /** Unique identifier for the alert */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Alert title */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare title: string;

  /** Detailed description of the alert */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Current alert status */
  @AllowNull(false)
  @Default('open')
  @Column(DataType.ENUM('open', 'investigating', 'resolved', 'false_positive', 'suppressed'))
  declare status: 'open' | 'investigating' | 'resolved' | 'false_positive' | 'suppressed';

  /** Alert severity level */
  @AllowNull(false)
  @Default('medium')
  @Column(DataType.ENUM('low', 'medium', 'high', 'critical'))
  declare severity: 'low' | 'medium' | 'high' | 'critical';

  /** Type of alert (IDS, SIEM, Endpoint, Network, etc.) */
  @AllowNull(false)
  @Length({ min: 1, max: 100 })
  @Column(DataType.STRING(100))
  declare alert_type: string;

  /** Name of the detection system that generated this alert */
  @AllowNull(false)
  @Length({ min: 1, max: 100 })
  @Column(DataType.STRING(100))
  declare source_system: string;

  /** User ID assigned to handle this alert */
  @ForeignKey(() => User)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare assigned_to?: number;

  /** Associated incident ID */
  @ForeignKey(() => Incident)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare incident_id?: number;

  /** IOC that triggered this alert */
  @ForeignKey(() => IOC)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare triggering_ioc_id?: number;

  /** Source IP address involved in the alert */
  @AllowNull(true)
  @Length({ max: 45 })
  @Column(DataType.STRING(45))
  declare source_ip?: string;

  /** Destination IP address involved in the alert */
  @AllowNull(true)
  @Length({ max: 45 })
  @Column(DataType.STRING(45))
  declare destination_ip?: string;

  /** Source port number */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare source_port?: number;

  /** Destination port number */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare destination_port?: number;

  /** Network protocol involved */
  @AllowNull(true)
  @Length({ max: 20 })
  @Column(DataType.STRING(20))
  declare protocol?: string;

  /** Raw data from the detection system */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare raw_data: Record<string, any>;

  /** Normalized and processed alert data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare normalized_data: Record<string, any>;

  /** Alert classification tags */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Confidence score (0-100) */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare confidence_score: number;

  /** Risk assessment score (0-100) */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare risk_score: number;

  /** When this alert type was first observed */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare first_seen?: Date;

  /** When this alert type was last observed */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare last_seen?: Date;

  /** Number of similar events aggregated in this alert */
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
  /** User assigned to handle this alert */
  @BelongsTo(() => User, {
    foreignKey: 'assigned_to',
    as: 'assignee',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare assignee?: User;

  /** Associated incident */
  @BelongsTo(() => Incident, {
    foreignKey: 'incident_id',
    as: 'incident',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare incident?: Incident;

  /** IOC that triggered this alert */
  @BelongsTo(() => IOC, {
    foreignKey: 'triggering_ioc_id',
    as: 'triggering_ioc',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare triggering_ioc?: IOC;

  // Instance methods
  /**
   * Check if this alert is high priority
   * @returns True if severity is critical/high or risk score >= 80
   */
  public isHighPriority(): boolean {
    return this.severity === 'critical' || this.severity === 'high' || this.risk_score >= 80;
  }

  /**
   * Check if this alert is currently open
   * @returns True if status is open
   */
  public isOpen(): boolean {
    return this.status === 'open';
  }

  /**
   * Check if this alert is resolved
   * @returns True if status is resolved
   */
  public isResolved(): boolean {
    return this.status === 'resolved';
  }

  /**
   * Check if this alert is a false positive
   * @returns True if status is false_positive
   */
  public isFalsePositive(): boolean {
    return this.status === 'false_positive';
  }

  /**
   * Escalate the alert severity to the next level
   * @returns Promise resolving to updated alert
   */
  public async escalate(): Promise<this> {
    const severityOrder: AlertAttributes['severity'][] = ['low', 'medium', 'high', 'critical'];
    const currentIndex = severityOrder.indexOf(this.severity);
    if (currentIndex < severityOrder.length - 1) {
      this.severity = severityOrder[currentIndex + 1]!;
      return this.save();
    }
    return this;
  }

  /**
   * Mark alert as false positive
   * @param userId Optional user ID to assign
   * @returns Promise resolving to updated alert
   */
  public async markFalsePositive(userId?: number): Promise<this> {
    this.status = 'false_positive';
    if (userId) {
      this.assigned_to = userId;
    }
    return this.save();
  }

  /**
   * Mark alert as resolved
   * @param userId Optional user ID to assign
   * @returns Promise resolving to updated alert
   */
  public async markResolved(userId?: number): Promise<this> {
    this.status = 'resolved';
    if (userId) {
      this.assigned_to = userId;
    }
    return this.save();
  }

  /**
   * Assign alert to a user
   * @param userId User ID to assign to
   * @returns Promise resolving to updated alert
   */
  public async assignTo(userId: number): Promise<this> {
    this.assigned_to = userId;
    return this.save();
  }

  /**
   * Increment the event count and update last seen
   * @returns Promise resolving to updated alert
   */
  public async incrementEventCount(): Promise<this> {
    this.event_count += 1;
    this.last_seen = new Date();
    return this.save();
  }

  /**
   * Add a tag to the alert
   * @param tag Tag to add
   * @returns Promise resolving to updated alert
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a tag from the alert
   * @param tag Tag to remove
   * @returns Promise resolving to updated alert
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  /**
   * Get the age of this alert in hours
   * @returns Age in hours
   */
  public getAgeInHours(): number {
    const now = new Date();
    const diffMs = now.getTime() - this.created_at.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  }

  /**
   * Get severity level as a numeric value for sorting
   * @returns Numeric severity (1=low, 4=critical)
   */
  public getSeverityLevel(): number {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[this.severity];
  }

  // Static methods
  /**
   * Find all open alerts
   * @returns Promise resolving to open alerts
   */
  static async findOpen(): Promise<Alert[]> {
    return this.findAll({
      where: { status: 'open' },
      order: [['severity', 'DESC'], ['risk_score', 'DESC'], ['created_at', 'DESC']]
    });
  }

  /**
   * Find alerts by severity
   * @param severity Severity level to filter by
   * @returns Promise resolving to alerts
   */
  static async findBySeverity(severity: AlertAttributes['severity']): Promise<Alert[]> {
    return this.findAll({
      where: { severity },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find alerts by status
   * @param status Status to filter by
   * @returns Promise resolving to alerts
   */
  static async findByStatus(status: AlertAttributes['status']): Promise<Alert[]> {
    return this.findAll({
      where: { status },
      order: [['updated_at', 'DESC']]
    });
  }

  /**
   * Find alerts by type
   * @param alertType Alert type to filter by
   * @returns Promise resolving to alerts
   */
  static async findByType(alertType: string): Promise<Alert[]> {
    return this.findAll({
      where: { alert_type: alertType },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find alerts by source system
   * @param sourceSystem Source system to filter by
   * @returns Promise resolving to alerts
   */
  static async findBySourceSystem(sourceSystem: string): Promise<Alert[]> {
    return this.findAll({
      where: { source_system: sourceSystem },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find alerts assigned to a user
   * @param userId User ID to filter by
   * @returns Promise resolving to assigned alerts
   */
  static async findAssignedTo(userId: number): Promise<Alert[]> {
    return this.findAll({
      where: { assigned_to: userId },
      order: [['severity', 'DESC'], ['created_at', 'DESC']]
    });
  }

  /**
   * Find high risk alerts
   * @param threshold Risk score threshold (default: 80)
   * @returns Promise resolving to high risk alerts
   */
  static async findHighRisk(threshold: number = 80): Promise<Alert[]> {
    return this.findAll({
      where: { 
        risk_score: { [Op.gte]: threshold },
        status: 'open'
      },
      order: [['risk_score', 'DESC']]
    });
  }

  /**
   * Find recent alerts within specified time window
   * @param hours Number of hours to look back (default: 24)
   * @returns Promise resolving to recent alerts
   */
  static async findRecent(hours: number = 24): Promise<Alert[]> {
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
   * Find alerts involving a specific IP address
   * @param ip IP address to search for
   * @returns Promise resolving to alerts involving the IP
   */
  static async findByIP(ip: string): Promise<Alert[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { source_ip: ip },
          { destination_ip: ip }
        ]
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find alerts by tag
   * @param tag Tag to search for
   * @returns Promise resolving to tagged alerts
   */
  static async findByTag(tag: string): Promise<Alert[]> {
    return this.findAll({
      where: {
        tags: {
          [Op.contains]: [tag]
        }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find unassigned alerts
   * @returns Promise resolving to unassigned alerts
   */
  static async findUnassigned(): Promise<Alert[]> {
    return this.findAll({
      where: {
        assigned_to: null,
        status: 'open'
      },
      order: [['severity', 'DESC'], ['risk_score', 'DESC']]
    });
  }

  /**
   * Get severity distribution statistics
   * @returns Promise resolving to severity stats
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
   * @returns Promise resolving to status stats
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
   * Get alert type distribution statistics
   * @returns Promise resolving to type stats
   */
  static async getTypeStats(): Promise<Array<{ type: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'alert_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['alert_type'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      type: r.alert_type,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get source system distribution statistics
   * @returns Promise resolving to source system stats
   */
  static async getSourceSystemStats(): Promise<Array<{ system: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'source_system',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['source_system'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      system: r.source_system,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get alert trend statistics over time
   * @param days Number of days to analyze (default: 7)
   * @returns Promise resolving to trend data
   */
  static async getTrendStats(days: number = 7): Promise<Array<{ date: string; count: number }>> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('DATE', this.sequelize!.col('created_at')), 'date'],
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: cutoffDate }
      },
      group: [this.sequelize!.fn('DATE', this.sequelize!.col('created_at'))],
      order: [[this.sequelize!.fn('DATE', this.sequelize!.col('created_at')), 'ASC']]
    });
    
    return results.map(r => ({
      date: (r as any).getDataValue('date'),
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get average resolution time for closed alerts
   * @returns Promise resolving to average resolution time in hours
   */
  static async getAverageResolutionTime(): Promise<number> {
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('AVG', 
          this.sequelize!.fn('EXTRACT', 
            this.sequelize!.literal('EPOCH FROM (updated_at - created_at)')
          )
        ), 'avg_seconds']
      ],
      where: {
        status: {
          [Op.in]: ['resolved', 'false_positive']
        }
      }
    });

    const avgSeconds = results[0] ? parseFloat((results[0] as any).getDataValue('avg_seconds')) : 0;
    return avgSeconds / 3600; // Convert to hours
  }

  /**
   * Get top IP addresses by alert count
   * @param limit Maximum number of IPs to return
   * @returns Promise resolving to top IPs
   */
  static async getTopIPs(limit: number = 10): Promise<Array<{ ip: string; count: number }>> {
    const sourceResults = await this.findAll({
      attributes: [
        'source_ip',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      where: this.sequelize!.literal('source_ip IS NOT NULL'),
      group: ['source_ip'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']],
      limit
    });

    const destResults = await this.findAll({
      attributes: [
        'destination_ip',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      where: this.sequelize!.literal('destination_ip IS NOT NULL'),
      group: ['destination_ip'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']],
      limit
    });

    const combinedResults: { [key: string]: number } = {};
    
    sourceResults.forEach(r => {
      const ip = r.source_ip!;
      const count = parseInt((r as any).getDataValue('count'));
      combinedResults[ip] = (combinedResults[ip] || 0) + count;
    });
    
    destResults.forEach(r => {
      const ip = r.destination_ip!;
      const count = parseInt((r as any).getDataValue('count'));
      combinedResults[ip] = (combinedResults[ip] || 0) + count;
    });

    return Object.entries(combinedResults)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([ip, count]) => ({ ip, count }));
  }

  /**
   * Create alert with validation
   * @param data Alert data to create
   * @returns Promise resolving to created alert
   */
  static async createAlert(data: AlertCreationAttributes): Promise<Alert> {
    // Validate scores
    if (data.confidence_score && (data.confidence_score < 0 || data.confidence_score > 100)) {
      throw new Error('Confidence score must be between 0 and 100');
    }
    if (data.risk_score && (data.risk_score < 0 || data.risk_score > 100)) {
      throw new Error('Risk score must be between 0 and 100');
    }

    // Set first_seen if not provided
    if (!data.first_seen) {
      data.first_seen = new Date();
    }

    return this.create(data);
  }
}

export default Alert;
