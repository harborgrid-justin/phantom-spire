/**
 * THREAT HUNT SEQUELIZE MODEL
 * Represents threat hunting operations and hypotheses with comprehensive type safety
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
import { ThreatActor } from './ThreatActor.model';
import { IOC } from './IOC.model';
import { XDREvent } from './XDREvent.model';

// ThreatHunt Attributes Interface
export interface ThreatHuntAttributes {
  /** Unique identifier for the threat hunt */
  id: number;
  /** Name of the threat hunt operation */
  hunt_name: string;
  /** Detailed description of the hunt */
  description?: string;
  /** Hunt hypothesis to be tested */
  hypothesis: string;
  /** Current status of the hunt */
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'draft';
  /** Priority level of the hunt */
  priority: 'low' | 'medium' | 'high' | 'critical';
  /** ID of the hunter/analyst conducting the hunt */
  hunter_id: number;
  /** Target threat actor being hunted (optional) */
  target_threat_actor_id?: number;
  /** When the hunt started */
  start_date?: Date;
  /** When the hunt ended */
  end_date?: Date;
  /** MITRE ATT&CK techniques being hunted */
  hunt_techniques: string[];
  /** Data sources being analyzed */
  data_sources: string[];
  /** Search queries and detection logic */
  search_queries: string[];
  /** Analytics and ML models used */
  hunt_analytics: Record<string, any>;
  /** Number of events analyzed during hunt */
  events_analyzed: number;
  /** Number of alerts generated */
  alerts_generated: number;
  /** Number of IOCs discovered */
  iocs_discovered: number;
  /** Threat actors potentially discovered */
  threat_actors_discovered: number;
  /** Hunt findings and results */
  findings: Record<string, any>;
  /** Recommendations based on hunt results */
  recommendations: Record<string, any>;
  /** Lessons learned from the hunt */
  lessons_learned?: string;
  /** Classification tags */
  tags: string[];
  /** Hunt confidence level (0-100) */
  confidence_level: number;
  /** Hunt coverage percentage */
  coverage_percentage: number;
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// ThreatHunt Creation Attributes Interface
export interface ThreatHuntCreationAttributes extends Optional<ThreatHuntAttributes,
  'id' | 'description' | 'status' | 'priority' | 'target_threat_actor_id' | 'start_date' |
  'end_date' | 'hunt_techniques' | 'data_sources' | 'search_queries' | 'hunt_analytics' |
  'events_analyzed' | 'alerts_generated' | 'iocs_discovered' | 'threat_actors_discovered' |
  'findings' | 'recommendations' | 'lessons_learned' | 'tags' | 'confidence_level' |
  'coverage_percentage' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'threat_hunts',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['hunt_name'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['hunter_id'] },
    { fields: ['target_threat_actor_id'] },
    { fields: ['start_date'] },
    { fields: ['end_date'] },
    { fields: ['confidence_level'] },
    { fields: ['created_at'] }
  ]
})
export class ThreatHunt extends Model<ThreatHuntAttributes, ThreatHuntCreationAttributes> implements ThreatHuntAttributes {
  /** Unique identifier for the threat hunt */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Name of the threat hunt operation */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare hunt_name: string;

  /** Detailed description of the hunt */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Hunt hypothesis to be tested */
  @AllowNull(false)
  @Column(DataType.TEXT)
  declare hypothesis: string;

  /** Current status of the hunt */
  @AllowNull(false)
  @Default('draft')
  @Index
  @Column(DataType.ENUM('active', 'paused', 'completed', 'cancelled', 'draft'))
  declare status: 'active' | 'paused' | 'completed' | 'cancelled' | 'draft';

  /** Priority level of the hunt */
  @AllowNull(false)
  @Default('medium')
  @Index
  @Column(DataType.ENUM('low', 'medium', 'high', 'critical'))
  declare priority: 'low' | 'medium' | 'high' | 'critical';

  /** ID of the hunter/analyst conducting the hunt */
  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.INTEGER)
  declare hunter_id: number;

  /** Target threat actor being hunted (optional) */
  @ForeignKey(() => ThreatActor)
  @AllowNull(true)
  @Index
  @Column(DataType.INTEGER)
  declare target_threat_actor_id?: number;

  /** When the hunt started */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare start_date?: Date;

  /** When the hunt ended */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare end_date?: Date;

  /** MITRE ATT&CK techniques being hunted */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare hunt_techniques: string[];

  /** Data sources being analyzed */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare data_sources: string[];

  /** Search queries and detection logic */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare search_queries: string[];

  /** Analytics and ML models used */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare hunt_analytics: Record<string, any>;

  /** Number of events analyzed during hunt */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.BIGINT)
  declare events_analyzed: number;

  /** Number of alerts generated */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare alerts_generated: number;

  /** Number of IOCs discovered */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare iocs_discovered: number;

  /** Threat actors potentially discovered */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare threat_actors_discovered: number;

  /** Hunt findings and results */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare findings: Record<string, any>;

  /** Recommendations based on hunt results */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare recommendations: Record<string, any>;

  /** Lessons learned from the hunt */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare lessons_learned?: string;

  /** Classification tags */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Hunt confidence level (0-100) */
  @AllowNull(false)
  @Default(50)
  @Index
  @Column(DataType.INTEGER)
  declare confidence_level: number;

  /** Hunt coverage percentage */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare coverage_percentage: number;

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
  /** Hunter/analyst conducting this hunt */
  @BelongsTo(() => User, {
    foreignKey: 'hunter_id',
    as: 'hunter',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  })
  declare hunter?: User;

  /** Target threat actor being hunted */
  @BelongsTo(() => ThreatActor, {
    foreignKey: 'target_threat_actor_id',
    as: 'target_threat_actor',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare target_threat_actor?: ThreatActor;

  /** IOCs discovered during this hunt */
  @HasMany(() => IOC, {
    foreignKey: 'threat_hunt_id',
    as: 'discovered_iocs',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare discovered_iocs?: IOC[];

  /** XDR events related to this hunt */
  @HasMany(() => XDREvent, {
    foreignKey: 'threat_hunt_id',
    as: 'related_events',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare related_events?: XDREvent[];

  // Instance methods
  /**
   * Check if the hunt is currently active
   * @returns True if hunt status is active
   */
  public isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Check if the hunt is completed
   * @returns True if hunt status is completed
   */
  public isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * Check if the hunt is paused
   * @returns True if hunt status is paused
   */
  public isPaused(): boolean {
    return this.status === 'paused';
  }

  /**
   * Check if the hunt is cancelled
   * @returns True if hunt status is cancelled
   */
  public isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  /**
   * Check if the hunt is in draft status
   * @returns True if hunt status is draft
   */
  public isDraft(): boolean {
    return this.status === 'draft';
  }

  /**
   * Check if the hunt is high priority
   * @returns True if priority is high or critical
   */
  public isHighPriority(): boolean {
    return this.priority === 'high' || this.priority === 'critical';
  }

  /**
   * Get hunt duration in days
   * @returns Duration in days, or null if dates unavailable
   */
  public getDuration(): number | null {
    if (!this.start_date || !this.end_date) return null;
    return Math.round((this.end_date.getTime() - this.start_date.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Get hunt effectiveness (alerts per analyzed events)
   * @returns Effectiveness percentage
   */
  public getEffectiveness(): number {
    if (this.events_analyzed === 0) return 0;
    return Math.round((this.alerts_generated / this.events_analyzed) * 100 * 100) / 100;
  }

  /**
   * Get hunt productivity (IOCs per day)
   * @returns IOCs discovered per day, or null if duration unavailable
   */
  public getProductivity(): number | null {
    const duration = this.getDuration();
    if (!duration || duration === 0) return null;
    return Math.round((this.iocs_discovered / duration) * 100) / 100;
  }

  /**
   * Get hunt success rate based on findings
   * @returns Success score (0-100)
   */
  public getSuccessRate(): number {
    let score = 0;
    
    // Base score on IOCs discovered
    if (this.iocs_discovered > 0) score += 30;
    if (this.iocs_discovered > 5) score += 20;
    if (this.iocs_discovered > 10) score += 20;
    
    // Add score for threat actors discovered
    if (this.threat_actors_discovered > 0) score += 20;
    
    // Add score for high confidence
    if (this.confidence_level >= 80) score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Get age of hunt in days
   * @returns Age in days since creation
   */
  public getAge(): number {
    const diffTime = new Date().getTime() - this.created_at.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if hunt uses specific MITRE technique
   * @param techniqueId MITRE ATT&CK technique ID
   * @returns True if technique is being hunted
   */
  public huntsTechnique(techniqueId: string): boolean {
    return this.hunt_techniques.includes(techniqueId);
  }

  /**
   * Check if hunt uses specific data source
   * @param dataSource Data source name
   * @returns True if data source is used
   */
  public usesDataSource(dataSource: string): boolean {
    return this.data_sources.includes(dataSource);
  }

  /**
   * Complete the hunt
   * @returns Promise resolving to updated hunt
   */
  public async complete(): Promise<this> {
    this.status = 'completed';
    this.end_date = new Date();
    return this.save();
  }

  /**
   * Pause the hunt
   * @returns Promise resolving to updated hunt
   */
  public async pause(): Promise<this> {
    this.status = 'paused';
    return this.save();
  }

  /**
   * Resume the hunt
   * @returns Promise resolving to updated hunt
   */
  public async resume(): Promise<this> {
    this.status = 'active';
    return this.save();
  }

  /**
   * Cancel the hunt
   * @returns Promise resolving to updated hunt
   */
  public async cancel(): Promise<this> {
    this.status = 'cancelled';
    this.end_date = new Date();
    return this.save();
  }

  /**
   * Start the hunt
   * @returns Promise resolving to updated hunt
   */
  public async start(): Promise<this> {
    this.status = 'active';
    this.start_date = new Date();
    return this.save();
  }

  /**
   * Update hunt statistics
   * @param events Number of events analyzed
   * @param alerts Number of alerts generated
   * @param iocs Number of IOCs discovered
   * @returns Promise resolving to updated hunt
   */
  public async updateStatistics(events: number, alerts: number, iocs: number): Promise<this> {
    this.events_analyzed += events;
    this.alerts_generated += alerts;
    this.iocs_discovered += iocs;
    return this.save();
  }

  /**
   * Update confidence level
   * @param confidence New confidence level (0-100)
   * @returns Promise resolving to updated hunt
   */
  public async updateConfidence(confidence: number): Promise<this> {
    this.confidence_level = Math.max(0, Math.min(100, confidence));
    return this.save();
  }

  /**
   * Add a hunt technique
   * @param technique MITRE ATT&CK technique to add
   * @returns Promise resolving to updated hunt
   */
  public async addTechnique(technique: string): Promise<this> {
    if (!this.hunt_techniques.includes(technique)) {
      this.hunt_techniques = [...this.hunt_techniques, technique];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a hunt technique
   * @param technique MITRE ATT&CK technique to remove
   * @returns Promise resolving to updated hunt
   */
  public async removeTechnique(technique: string): Promise<this> {
    this.hunt_techniques = this.hunt_techniques.filter(t => t !== technique);
    return this.save();
  }

  /**
   * Add a data source
   * @param dataSource Data source to add
   * @returns Promise resolving to updated hunt
   */
  public async addDataSource(dataSource: string): Promise<this> {
    if (!this.data_sources.includes(dataSource)) {
      this.data_sources = [...this.data_sources, dataSource];
      return this.save();
    }
    return this;
  }

  /**
   * Add a tag
   * @param tag Tag to add
   * @returns Promise resolving to updated hunt
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a tag
   * @param tag Tag to remove
   * @returns Promise resolving to updated hunt
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  // Static methods
  /**
   * Find all active hunts
   * @returns Promise resolving to active hunts
   */
  static async findActive(): Promise<ThreatHunt[]> {
    return this.findAll({
      where: { status: 'active' },
      order: [['priority', 'DESC'], ['created_at', 'DESC']]
    });
  }

  /**
   * Find hunts by hunter
   * @param hunterId Hunter user ID
   * @returns Promise resolving to hunts by specified hunter
   */
  static async findByHunter(hunterId: number): Promise<ThreatHunt[]> {
    return this.findAll({
      where: { hunter_id: hunterId },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find hunts by status
   * @param status Hunt status to filter by
   * @returns Promise resolving to hunts with specified status
   */
  static async findByStatus(status: ThreatHuntAttributes['status']): Promise<ThreatHunt[]> {
    return this.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find hunts by priority
   * @param priority Priority level to filter by
   * @returns Promise resolving to hunts with specified priority
   */
  static async findByPriority(priority: ThreatHuntAttributes['priority']): Promise<ThreatHunt[]> {
    return this.findAll({
      where: { priority },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find hunts by threat actor
   * @param threatActorId Threat actor ID
   * @returns Promise resolving to hunts targeting specified actor
   */
  static async findByThreatActor(threatActorId: number): Promise<ThreatHunt[]> {
    return this.findAll({
      where: { target_threat_actor_id: threatActorId },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find hunts by MITRE technique
   * @param techniqueId MITRE ATT&CK technique ID
   * @returns Promise resolving to hunts using specified technique
   */
  static async findByTechnique(techniqueId: string): Promise<ThreatHunt[]> {
    return this.findAll({
      where: {
        hunt_techniques: { [Op.contains]: [techniqueId] }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find high-priority hunts
   * @returns Promise resolving to high-priority active hunts
   */
  static async findHighPriority(): Promise<ThreatHunt[]> {
    return this.findAll({
      where: { 
        priority: { [Op.in]: ['high', 'critical'] },
        status: 'active'
      },
      order: [['priority', 'DESC'], ['created_at', 'DESC']]
    });
  }

  /**
   * Find successful hunts (with discoveries)
   * @returns Promise resolving to hunts with IOC discoveries
   */
  static async findSuccessful(): Promise<ThreatHunt[]> {
    return this.findAll({
      where: {
        iocs_discovered: { [Op.gt]: 0 }
      },
      order: [['iocs_discovered', 'DESC']]
    });
  }

  /**
   * Find recent hunts
   * @param days Number of days to look back (default: 30)
   * @returns Promise resolving to recent hunts
   */
  static async findRecent(days: number = 30): Promise<ThreatHunt[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        created_at: { [Op.gte]: cutoffDate }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Search hunts by name or hypothesis
   * @param query Search query
   * @returns Promise resolving to matching hunts
   */
  static async searchHunts(query: string): Promise<ThreatHunt[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { hunt_name: { [Op.iLike]: `%${query}%` } },
          { hypothesis: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['created_at', 'DESC']]
    });
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
   * Get priority distribution statistics
   * @returns Promise resolving to priority statistics
   */
  static async getPriorityStats(): Promise<Array<{ priority: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'priority',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['priority']
    });
    
    return results.map(r => ({
      priority: r.priority,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get effectiveness statistics for completed hunts
   * @returns Promise resolving to effectiveness statistics
   */
  static async getEffectivenessStats(): Promise<{
    avg_events: number;
    avg_alerts: number;
    avg_iocs: number;
    avg_effectiveness: number;
  } | null> {
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('AVG', this.sequelize!.col('events_analyzed')), 'avg_events'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('alerts_generated')), 'avg_alerts'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('iocs_discovered')), 'avg_iocs']
      ],
      where: { status: 'completed' }
    });
    
    if (results.length === 0) return null;
    
    const avgEvents = parseFloat((results[0] as any).getDataValue('avg_events')) || 0;
    const avgAlerts = parseFloat((results[0] as any).getDataValue('avg_alerts')) || 0;
    const avgEffectiveness = avgEvents > 0 ? (avgAlerts / avgEvents) * 100 : 0;
    
    return {
      avg_events: avgEvents,
      avg_alerts: avgAlerts,
      avg_iocs: parseFloat((results[0] as any).getDataValue('avg_iocs')) || 0,
      avg_effectiveness: Math.round(avgEffectiveness * 100) / 100
    };
  }

  /**
   * Get comprehensive hunt statistics
   * @returns Promise resolving to hunt statistics
   */
  static async getHuntStats(): Promise<{
    total_hunts: number;
    active_hunts: number;
    completed_hunts: number;
    successful_hunts: number;
    high_priority_hunts: number;
    avg_confidence: number;
    total_iocs_discovered: number;
  }> {
    const [
      totalHunts,
      activeHunts,
      completedHunts,
      successfulHunts,
      highPriorityHunts,
      avgConfidenceResult,
      totalIOCsResult
    ] = await Promise.all([
      this.count(),
      this.count({ where: { status: 'active' } }),
      this.count({ where: { status: 'completed' } }),
      this.count({ where: { iocs_discovered: { [Op.gt]: 0 } } }),
      this.count({ where: { priority: { [Op.in]: ['high', 'critical'] } } }),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('AVG', this.sequelize!.col('confidence_level')), 'avg_confidence']
        ]
      }).then(results => results[0]),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('SUM', this.sequelize!.col('iocs_discovered')), 'total_iocs']
        ]
      }).then(results => results[0])
    ]);

    return {
      total_hunts: totalHunts,
      active_hunts: activeHunts,
      completed_hunts: completedHunts,
      successful_hunts: successfulHunts,
      high_priority_hunts: highPriorityHunts,
      avg_confidence: parseFloat((avgConfidenceResult as any).getDataValue('avg_confidence')) || 0,
      total_iocs_discovered: parseInt((totalIOCsResult as any).getDataValue('total_iocs')) || 0
    };
  }

  /**
   * Create threat hunt with validation
   * @param data Hunt data to create
   * @returns Promise resolving to created hunt
   */
  static async createHunt(data: ThreatHuntCreationAttributes): Promise<ThreatHunt> {
    // Validate confidence level
    if (data.confidence_level !== undefined && (data.confidence_level < 0 || data.confidence_level > 100)) {
      throw new Error('Confidence level must be between 0 and 100');
    }

    // Validate coverage percentage
    if (data.coverage_percentage !== undefined && (data.coverage_percentage < 0 || data.coverage_percentage > 100)) {
      throw new Error('Coverage percentage must be between 0 and 100');
    }

    // Set start date for active hunts
    if (data.status === 'active' && !data.start_date) {
      data.start_date = new Date();
    }

    return this.create(data);
  }
}

export default ThreatHunt;
