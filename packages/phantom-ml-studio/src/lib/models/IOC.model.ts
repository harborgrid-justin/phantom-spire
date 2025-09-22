/**
 * IOC (INDICATORS OF COMPROMISE) SEQUELIZE MODEL
 * Represents indicators of compromise for threat detection with comprehensive type safety
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
import { ThreatActor } from './ThreatActor.model';
import { IncidentIOC } from './IncidentIOC.model';

// IOC Attributes Interface
export interface IOCAttributes {
  /** Unique identifier for the IOC */
  id: number;
  /** The actual IOC value (IP, domain, hash, etc.) */
  indicator: string;
  /** Type of IOC (IP, Domain, Hash, URL, Email, FileHash, etc.) */
  ioc_type: string;
  /** Detailed description of the IOC */
  description?: string;
  /** Associated threat actor ID */
  threat_actor_id?: number;
  /** Confidence level of this IOC */
  confidence: 'low' | 'medium' | 'high';
  /** Severity level of this IOC */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Current status of the IOC */
  status: 'active' | 'inactive' | 'false_positive' | 'expired';
  /** When this IOC was first observed */
  first_seen?: Date;
  /** When this IOC was last observed */
  last_seen?: Date;
  /** When this IOC expires */
  expires_at?: Date;
  /** Classification tags */
  tags: string[];
  /** Intelligence sources */
  sources: string[];
  /** MITRE ATT&CK kill chain phases */
  kill_chain_phases: string[];
  /** Additional context data */
  context: Record<string, any>;
  /** Number of false positive reports */
  false_positive_count: number;
  /** Number of times this IOC was detected */
  detection_count: number;
  /** Enrichment data (WHOIS, GeoIP, etc.) */
  enrichment_data: Record<string, any>;
  /** Reference URLs */
  references: string[];
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// IOC Creation Attributes Interface
export interface IOCCreationAttributes extends Optional<IOCAttributes,
  'id' | 'description' | 'threat_actor_id' | 'confidence' | 'severity' | 'status' |
  'first_seen' | 'last_seen' | 'expires_at' | 'tags' | 'sources' | 'kill_chain_phases' |
  'context' | 'false_positive_count' | 'detection_count' | 'enrichment_data' |
  'references' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'iocs',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['indicator'] },
    { fields: ['ioc_type'] },
    { fields: ['confidence'] },
    { fields: ['severity'] },
    { fields: ['status'] },
    { fields: ['threat_actor_id'] },
    { fields: ['first_seen'] },
    { fields: ['last_seen'] },
    { fields: ['expires_at'] },
    { fields: ['detection_count'] },
    { fields: ['false_positive_count'] }
  ]
})
export class IOC extends Model<IOCAttributes, IOCCreationAttributes> implements IOCAttributes {
  /** Unique identifier for the IOC */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** The actual IOC value (IP, domain, hash, etc.) */
  @AllowNull(false)
  @Length({ min: 1, max: 1000 })
  @Column(DataType.STRING(1000))
  declare indicator: string;

  /** Type of IOC (IP, Domain, Hash, URL, Email, FileHash, etc.) */
  @AllowNull(false)
  @Index
  @Length({ min: 1, max: 50 })
  @Column(DataType.STRING(50))
  declare ioc_type: string;

  /** Detailed description of the IOC */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Associated threat actor ID */
  @ForeignKey(() => ThreatActor)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare threat_actor_id?: number;

  /** Confidence level of this IOC */
  @AllowNull(false)
  @Default('medium')
  @Column(DataType.ENUM('low', 'medium', 'high'))
  declare confidence: 'low' | 'medium' | 'high';

  /** Severity level of this IOC */
  @AllowNull(false)
  @Default('medium')
  @Column(DataType.ENUM('low', 'medium', 'high', 'critical'))
  declare severity: 'low' | 'medium' | 'high' | 'critical';

  /** Current status of the IOC */
  @AllowNull(false)
  @Default('active')
  @Column(DataType.ENUM('active', 'inactive', 'false_positive', 'expired'))
  declare status: 'active' | 'inactive' | 'false_positive' | 'expired';

  /** When this IOC was first observed */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare first_seen?: Date;

  /** When this IOC was last observed */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare last_seen?: Date;

  /** When this IOC expires */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare expires_at?: Date;

  /** Classification tags */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Intelligence sources */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare sources: string[];

  /** MITRE ATT&CK kill chain phases */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare kill_chain_phases: string[];

  /** Additional context data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare context: Record<string, any>;

  /** Number of false positive reports */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare false_positive_count: number;

  /** Number of times this IOC was detected */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare detection_count: number;

  /** Enrichment data (WHOIS, GeoIP, etc.) */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare enrichment_data: Record<string, any>;

  /** Reference URLs */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare references: string[];

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
  /** Associated threat actor */
  @BelongsTo(() => ThreatActor, {
    foreignKey: 'threat_actor_id',
    as: 'threat_actor',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare threat_actor?: ThreatActor;

  /** Incident IOC relationships */
  @HasMany(() => IncidentIOC, {
    foreignKey: 'ioc_id',
    as: 'incident_iocs',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare incident_iocs?: IncidentIOC[];

  // Instance methods
  /**
   * Check if this IOC has expired
   * @returns True if the IOC has expired
   */
  public isExpired(): boolean {
    return this.expires_at ? new Date() > this.expires_at : false;
  }

  /**
   * Check if this IOC is stale (not seen recently)
   * @param days Number of days to consider stale (default: 30)
   * @returns True if the IOC is stale
   */
  public isStale(days: number = 30): boolean {
    if (!this.last_seen) return true;
    const staleDays = (new Date().getTime() - this.last_seen.getTime()) / (1000 * 60 * 60 * 24);
    return staleDays > days;
  }

  /**
   * Calculate threat score based on severity and confidence
   * @returns Threat score (0.1 to 4.0)
   */
  public getThreatScore(): number {
    const severityScores = { low: 1, medium: 2, high: 3, critical: 4 };
    const confidenceScores = { low: 0.3, medium: 0.6, high: 1.0 };
    
    const severityScore = severityScores[this.severity] || 1;
    const confidenceScore = confidenceScores[this.confidence] || 0.6;
    
    return Math.round(severityScore * confidenceScore * 10) / 10;
  }

  /**
   * Mark this IOC as a false positive
   * @returns Promise resolving to updated IOC
   */
  public async markFalsePositive(): Promise<this> {
    this.false_positive_count += 1;
    this.status = 'false_positive';
    return this.save();
  }

  /**
   * Record a detection of this IOC
   * @returns Promise resolving to updated IOC
   */
  public async recordDetection(): Promise<this> {
    this.detection_count += 1;
    this.last_seen = new Date();
    return this.save();
  }

  /**
   * Check if this IOC is high priority
   * @returns True if severity is critical/high or threat score >= 3.0
   */
  public isHighPriority(): boolean {
    return this.severity === 'critical' || this.severity === 'high' || this.getThreatScore() >= 3.0;
  }

  /**
   * Check if this IOC is currently active
   * @returns True if status is active and not expired
   */
  public isActive(): boolean {
    return this.status === 'active' && !this.isExpired();
  }

  /**
   * Get age of this IOC in days
   * @returns Age in days since first seen
   */
  public getAge(): number {
    if (!this.first_seen) return 0;
    const diffTime = new Date().getTime() - this.first_seen.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days since last seen
   * @returns Days since last seen, or null if never seen
   */
  public getDaysSinceLastSeen(): number | null {
    if (!this.last_seen) return null;
    const diffTime = new Date().getTime() - this.last_seen.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get detection rate (detections per day since first seen)
   * @returns Detection rate or 0 if no detections
   */
  public getDetectionRate(): number {
    const age = this.getAge();
    if (age === 0 || this.detection_count === 0) return 0;
    return this.detection_count / age;
  }

  /**
   * Add a tag to the IOC
   * @param tag Tag to add
   * @returns Promise resolving to updated IOC
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a tag from the IOC
   * @param tag Tag to remove
   * @returns Promise resolving to updated IOC
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  /**
   * Update the expiration date
   * @param days Number of days from now to expire
   * @returns Promise resolving to updated IOC
   */
  public async setExpiration(days: number): Promise<this> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    this.expires_at = expirationDate;
    return this.save();
  }

  // Static methods
  /**
   * Find IOC by indicator value
   * @param indicator Indicator value to search for
   * @returns Promise resolving to IOC or null
   */
  static async findByIndicator(indicator: string): Promise<IOC | null> {
    return this.findOne({ where: { indicator } });
  }

  /**
   * Find IOCs by type
   * @param iocType Type of IOC to filter by
   * @returns Promise resolving to IOCs array
   */
  static async findByType(iocType: string): Promise<IOC[]> {
    return this.findAll({
      where: { ioc_type: iocType },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find all active IOCs (not expired, not false positives)
   * @returns Promise resolving to active IOCs
   */
  static async findActive(): Promise<IOC[]> {
    return this.findAll({
      where: {
        status: 'active',
        [Op.or]: [
          this.sequelize!.literal('expires_at IS NULL'),
          { expires_at: { [Op.gt]: new Date() } }
        ]
      },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find high confidence IOCs
   * @returns Promise resolving to high confidence IOCs
   */
  static async findHighConfidence(): Promise<IOC[]> {
    return this.findAll({
      where: {
        confidence: 'high',
        status: 'active'
      },
      order: [['severity', 'DESC'], ['last_seen', 'DESC']]
    });
  }

  /**
   * Find IOCs by severity
   * @param severity Severity level to filter by
   * @returns Promise resolving to IOCs array
   */
  static async findBySeverity(severity: IOCAttributes['severity']): Promise<IOC[]> {
    return this.findAll({
      where: { severity },
      order: [['confidence', 'DESC'], ['last_seen', 'DESC']]
    });
  }

  /**
   * Find IOCs by status
   * @param status Status to filter by
   * @returns Promise resolving to IOCs array
   */
  static async findByStatus(status: IOCAttributes['status']): Promise<IOC[]> {
    return this.findAll({
      where: { status },
      order: [['updated_at', 'DESC']]
    });
  }

  /**
   * Find IOCs by threat actor
   * @param threatActorId Threat actor ID to filter by
   * @returns Promise resolving to IOCs array
   */
  static async findByThreatActor(threatActorId: number): Promise<IOC[]> {
    return this.findAll({
      where: { threat_actor_id: threatActorId },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find recent IOCs within specified time window
   * @param days Number of days to look back (default: 7)
   * @returns Promise resolving to recent IOCs
   */
  static async findRecent(days: number = 7): Promise<IOC[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        [Op.or]: [
          { first_seen: { [Op.gte]: cutoffDate } },
          { last_seen: { [Op.gte]: cutoffDate } }
        ]
      },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find IOCs expiring within specified days
   * @param days Number of days to look ahead (default: 7)
   * @returns Promise resolving to expiring IOCs
   */
  static async findExpiring(days: number = 7): Promise<IOC[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.findAll({
      where: {
        expires_at: {
          [Op.between]: [new Date(), futureDate]
        },
        status: 'active'
      },
      order: [['expires_at', 'ASC']]
    });
  }

  /**
   * Find stale IOCs (not seen for specified days)
   * @param days Number of days to consider stale (default: 30)
   * @returns Promise resolving to stale IOCs
   */
  static async findStale(days: number = 30): Promise<IOC[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { last_seen: { [Op.lt]: cutoffDate } },
              this.sequelize!.literal('last_seen IS NULL')
            ]
          },
          { status: 'active' }
        ]
      },
      order: [['last_seen', 'ASC']]
    });
  }

  /**
   * Search IOCs by text query
   * @param query Search query
   * @returns Promise resolving to matching IOCs
   */
  static async searchIndicators(query: string): Promise<IOC[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { indicator: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { tags: { [Op.contains]: [query] } }
        ]
      },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find IOCs by tag
   * @param tag Tag to search for
   * @returns Promise resolving to tagged IOCs
   */
  static async findByTag(tag: string): Promise<IOC[]> {
    return this.findAll({
      where: {
        tags: {
          [Op.contains]: [tag]
        }
      },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find high priority IOCs
   * @returns Promise resolving to high priority IOCs
   */
  static async findHighPriority(): Promise<IOC[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { severity: 'critical' },
          { severity: 'high' }
        ],
        status: 'active'
      },
      order: [['severity', 'DESC'], ['confidence', 'DESC']]
    });
  }

  /**
   * Find frequently detected IOCs
   * @param threshold Minimum detection count (default: 10)
   * @returns Promise resolving to frequently detected IOCs
   */
  static async findFrequentlyDetected(threshold: number = 10): Promise<IOC[]> {
    return this.findAll({
      where: {
        detection_count: { [Op.gte]: threshold }
      },
      order: [['detection_count', 'DESC']]
    });
  }

  /**
   * Get IOC type distribution statistics
   * @returns Promise resolving to type statistics
   */
  static async getTypeStats(): Promise<Array<{ type: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'ioc_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['ioc_type'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      type: r.ioc_type,
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
   * Get confidence distribution statistics
   * @returns Promise resolving to confidence statistics
   */
  static async getConfidenceStats(): Promise<Array<{ confidence: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'confidence',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['confidence']
    });
    
    return results.map(r => ({
      confidence: r.confidence,
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
   * Get detection statistics overview
   * @returns Promise resolving to detection statistics
   */
  static async getDetectionStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    false_positives: number;
    high_priority: number;
    stale: number;
  }> {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [total, active, expired, falsePositives, highPriority, stale] = await Promise.all([
      this.count(),
      this.count({ where: { status: 'active' } }),
      this.count({ where: { expires_at: { [Op.lt]: now } } }),
      this.count({ where: { status: 'false_positive' } }),
      this.count({
        where: {
          [Op.or]: [
            { severity: 'critical' },
            { severity: 'high' }
          ],
          status: 'active'
        }
      }),
      this.count({
        where: this.sequelize!.literal(`(last_seen < '${thirtyDaysAgo.toISOString()}' OR last_seen IS NULL) AND status = 'active'`)
      })
    ]);

    return {
      total,
      active,
      expired,
      false_positives: falsePositives,
      high_priority: highPriority,
      stale
    };
  }

  /**
   * Get IOC trend statistics over time
   * @param days Number of days to analyze (default: 30)
   * @returns Promise resolving to trend data
   */
  static async getTrendStats(days: number = 30): Promise<Array<{ date: string; count: number }>> {
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
   * Get top sources by IOC count
   * @param limit Maximum number of sources to return
   * @returns Promise resolving to top sources
   */
  static async getTopSources(limit: number = 10): Promise<Array<{ source: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('unnest', this.sequelize!.col('sources')), 'source'],
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: [this.sequelize!.fn('unnest', this.sequelize!.col('sources'))],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']],
      limit
    });
    
    return results.map(r => ({
      source: (r as any).getDataValue('source'),
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Create IOC with validation
   * @param data IOC data to create
   * @returns Promise resolving to created IOC
   */
  static async createIOC(data: IOCCreationAttributes): Promise<IOC> {
    // Set first_seen if not provided
    if (!data.first_seen) {
      data.first_seen = new Date();
    }

    // Validate indicator format based on type
    if (data.ioc_type === 'IP' && data.indicator) {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(data.indicator)) {
        throw new Error('Invalid IP address format');
      }
    }

    if (data.ioc_type === 'Domain' && data.indicator) {
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!domainRegex.test(data.indicator)) {
        throw new Error('Invalid domain format');
      }
    }

    return this.create(data);
  }
}

export default IOC;
