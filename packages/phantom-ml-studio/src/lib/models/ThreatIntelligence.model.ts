/**
 * THREAT INTELLIGENCE SEQUELIZE MODEL
 * Represents threat intelligence reports and analysis with comprehensive type safety
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

// ThreatIntelligence Attributes Interface
export interface ThreatIntelligenceAttributes {
  /** Unique identifier for the threat intelligence report */
  id: number;
  /** Title of the threat intelligence report */
  title: string;
  /** Detailed description of the threat */
  description?: string;
  /** Type of intelligence (Strategic, Tactical, Operational, Technical) */
  intelligence_type: 'strategic' | 'tactical' | 'operational' | 'technical';
  /** Confidence level in the intelligence */
  confidence: 'low' | 'medium' | 'high';
  /** Reliability rating (NATO standard A-F) */
  reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  /** Associated threat actor ID */
  threat_actor_id?: number;
  /** Analyst who created this report */
  analyst_id: number;
  /** Source of the intelligence */
  source: string;
  /** Specific source identity or feed name */
  source_identity?: string;
  /** Industries targeted by this threat */
  target_industries: string[];
  /** Countries targeted by this threat */
  target_countries: string[];
  /** Products affected by this threat */
  affected_products: string[];
  /** Attack vectors used by this threat */
  attack_vectors: string[];
  /** MITRE ATT&CK tactic IDs */
  mitre_tactics: string[];
  /** MITRE ATT&CK technique IDs */
  mitre_techniques: string[];
  /** Classification tags */
  tags: string[];
  /** Current status of the report */
  status: 'draft' | 'review' | 'published' | 'archived';
  /** Sharing level for this intelligence */
  sharing_level: 'internal' | 'partner' | 'community' | 'public';
  /** When this intelligence becomes valid */
  valid_from?: Date;
  /** When this intelligence expires */
  valid_until?: Date;
  /** When this report was published */
  published_at?: Date;
  /** STIX/TAXII format structured data */
  stix_data: Record<string, any>;
  /** Diamond Model analysis data */
  diamond_model: Record<string, any>;
  /** Kill chain analysis mapping */
  kill_chain_analysis: Record<string, any>;
  /** Additional enrichment data */
  enrichment_data: Record<string, any>;
  /** Reference URLs and sources */
  references: string[];
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// ThreatIntelligence Creation Attributes Interface
export interface ThreatIntelligenceCreationAttributes extends Optional<ThreatIntelligenceAttributes,
  'id' | 'description' | 'threat_actor_id' | 'source_identity' | 'target_industries' | 
  'target_countries' | 'affected_products' | 'attack_vectors' | 'mitre_tactics' | 
  'mitre_techniques' | 'tags' | 'status' | 'sharing_level' | 'valid_from' | 'valid_until' | 
  'published_at' | 'stix_data' | 'diamond_model' | 'kill_chain_analysis' | 'enrichment_data' | 
  'references' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'threat_intelligence',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['title'] },
    { fields: ['intelligence_type'] },
    { fields: ['confidence'] },
    { fields: ['reliability'] },
    { fields: ['threat_actor_id'] },
    { fields: ['analyst_id'] },
    { fields: ['source'] },
    { fields: ['status'] },
    { fields: ['sharing_level'] },
    { fields: ['published_at'] },
    { fields: ['valid_from'] },
    { fields: ['valid_until'] }
  ]
})
export class ThreatIntelligence extends Model<ThreatIntelligenceAttributes, ThreatIntelligenceCreationAttributes> implements ThreatIntelligenceAttributes {
  /** Unique identifier for the threat intelligence report */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Title of the threat intelligence report */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare title: string;

  /** Detailed description of the threat */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Type of intelligence (Strategic, Tactical, Operational, Technical) */
  @AllowNull(false)
  @Index
  @Column(DataType.ENUM('strategic', 'tactical', 'operational', 'technical'))
  declare intelligence_type: 'strategic' | 'tactical' | 'operational' | 'technical';

  /** Confidence level in the intelligence */
  @AllowNull(false)
  @Default('medium')
  @Column(DataType.ENUM('low', 'medium', 'high'))
  declare confidence: 'low' | 'medium' | 'high';

  /** Reliability rating (NATO standard A-F) */
  @AllowNull(false)
  @Default('C')
  @Column(DataType.ENUM('A', 'B', 'C', 'D', 'E', 'F'))
  declare reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

  /** Associated threat actor ID */
  @ForeignKey(() => ThreatActor)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare threat_actor_id?: number;

  /** Analyst who created this report */
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare analyst_id: number;

  /** Source of the intelligence */
  @AllowNull(false)
  @Length({ min: 1, max: 100 })
  @Column(DataType.STRING(100))
  declare source: string;

  /** Specific source identity or feed name */
  @AllowNull(true)
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare source_identity?: string;

  /** Industries targeted by this threat */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare target_industries: string[];

  /** Countries targeted by this threat */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare target_countries: string[];

  /** Products affected by this threat */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare affected_products: string[];

  /** Attack vectors used by this threat */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare attack_vectors: string[];

  /** MITRE ATT&CK tactic IDs */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare mitre_tactics: string[];

  /** MITRE ATT&CK technique IDs */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare mitre_techniques: string[];

  /** Classification tags */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Current status of the report */
  @AllowNull(false)
  @Default('draft')
  @Column(DataType.ENUM('draft', 'review', 'published', 'archived'))
  declare status: 'draft' | 'review' | 'published' | 'archived';

  /** Sharing level for this intelligence */
  @AllowNull(false)
  @Default('internal')
  @Column(DataType.ENUM('internal', 'partner', 'community', 'public'))
  declare sharing_level: 'internal' | 'partner' | 'community' | 'public';

  /** When this intelligence becomes valid */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare valid_from?: Date;

  /** When this intelligence expires */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare valid_until?: Date;

  /** When this report was published */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare published_at?: Date;

  /** STIX/TAXII format structured data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare stix_data: Record<string, any>;

  /** Diamond Model analysis data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare diamond_model: Record<string, any>;

  /** Kill chain analysis mapping */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare kill_chain_analysis: Record<string, any>;

  /** Additional enrichment data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare enrichment_data: Record<string, any>;

  /** Reference URLs and sources */
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

  /** Analyst who created this report */
  @BelongsTo(() => User, {
    foreignKey: 'analyst_id',
    as: 'analyst',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  })
  declare analyst?: User;

  // Instance methods
  /**
   * Check if this intelligence is currently valid
   * @returns True if within valid date range
   */
  public isValid(): boolean {
    const now = new Date();
    if (this.valid_from && now < this.valid_from) return false;
    if (this.valid_until && now > this.valid_until) return false;
    return true;
  }

  /**
   * Check if this intelligence has expired
   * @returns True if past expiration date
   */
  public isExpired(): boolean {
    return this.valid_until ? new Date() > this.valid_until : false;
  }

  /**
   * Check if this intelligence is published
   * @returns True if status is published
   */
  public isPublished(): boolean {
    return this.status === 'published';
  }

  /**
   * Check if this intelligence is archived
   * @returns True if status is archived
   */
  public isArchived(): boolean {
    return this.status === 'archived';
  }

  /**
   * Check if this intelligence is in draft status
   * @returns True if status is draft
   */
  public isDraft(): boolean {
    return this.status === 'draft';
  }

  /**
   * Get reliability score based on NATO standard
   * @returns Numeric reliability score (1-6)
   */
  public getReliabilityScore(): number {
    const scores: Record<string, number> = {
      'A': 6, 'B': 5, 'C': 4, 'D': 3, 'E': 2, 'F': 1
    };
    return scores[this.reliability] || 3;
  }

  /**
   * Get confidence score as numeric value
   * @returns Numeric confidence score (1-3)
   */
  public getConfidenceScore(): number {
    const scores: Record<string, number> = {
      'low': 1, 'medium': 2, 'high': 3
    };
    return scores[this.confidence] || 2;
  }

  /**
   * Calculate overall threat score
   * @returns Combined threat score (0.5-9.0)
   */
  public getThreatScore(): number {
    const reliabilityScore = this.getReliabilityScore();
    const confidenceScore = this.getConfidenceScore();
    return Math.round((reliabilityScore * confidenceScore) / 2 * 10) / 10;
  }

  /**
   * Check if this is high-value intelligence
   * @returns True if high confidence and reliability
   */
  public isHighValue(): boolean {
    return this.confidence === 'high' && ['A', 'B', 'C'].includes(this.reliability);
  }

  /**
   * Get age of this intelligence in days
   * @returns Age in days since creation
   */
  public getAge(): number {
    const diffTime = new Date().getTime() - this.created_at.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days until expiration
   * @returns Days until expiration, or null if no expiration
   */
  public getDaysUntilExpiration(): number | null {
    if (!this.valid_until) return null;
    const diffTime = this.valid_until.getTime() - new Date().getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if intelligence targets a specific industry
   * @param industry Industry to check for
   * @returns True if industry is targeted
   */
  public targetsIndustry(industry: string): boolean {
    return this.target_industries.includes(industry);
  }

  /**
   * Check if intelligence targets a specific country
   * @param country Country to check for
   * @returns True if country is targeted
   */
  public targetsCountry(country: string): boolean {
    return this.target_countries.includes(country);
  }

  /**
   * Publish this intelligence report
   * @returns Promise resolving to updated report
   */
  public async publish(): Promise<this> {
    this.status = 'published';
    this.published_at = new Date();
    if (!this.valid_from) {
      this.valid_from = new Date();
    }
    return this.save();
  }

  /**
   * Archive this intelligence report
   * @returns Promise resolving to updated report
   */
  public async archive(): Promise<this> {
    this.status = 'archived';
    return this.save();
  }

  /**
   * Move report to review status
   * @returns Promise resolving to updated report
   */
  public async submitForReview(): Promise<this> {
    this.status = 'review';
    return this.save();
  }

  /**
   * Add a tag to the intelligence report
   * @param tag Tag to add
   * @returns Promise resolving to updated report
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a tag from the intelligence report
   * @param tag Tag to remove
   * @returns Promise resolving to updated report
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  /**
   * Set expiration date
   * @param days Number of days from now to expire
   * @returns Promise resolving to updated report
   */
  public async setExpiration(days: number): Promise<this> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    this.valid_until = expirationDate;
    return this.save();
  }

  // Static methods
  /**
   * Find all published intelligence reports
   * @returns Promise resolving to published reports
   */
  static async findPublished(): Promise<ThreatIntelligence[]> {
    return this.findAll({
      where: { 
        status: 'published',
        [Op.or]: [
          this.sequelize!.literal('valid_until IS NULL'),
          { valid_until: { [Op.gt]: new Date() } }
        ]
      },
      order: [['published_at', 'DESC']]
    });
  }

  /**
   * Find intelligence reports by type
   * @param intelligenceType Type of intelligence to filter by
   * @returns Promise resolving to matching reports
   */
  static async findByType(intelligenceType: ThreatIntelligenceAttributes['intelligence_type']): Promise<ThreatIntelligence[]> {
    return this.findAll({
      where: { intelligence_type: intelligenceType },
      order: [['published_at', 'DESC']]
    });
  }

  /**
   * Find intelligence reports by threat actor
   * @param threatActorId Threat actor ID to filter by
   * @returns Promise resolving to matching reports
   */
  static async findByThreatActor(threatActorId: number): Promise<ThreatIntelligence[]> {
    return this.findAll({
      where: { threat_actor_id: threatActorId },
      order: [['published_at', 'DESC']]
    });
  }

  /**
   * Find intelligence reports by analyst
   * @param analystId Analyst ID to filter by
   * @returns Promise resolving to analyst's reports
   */
  static async findByAnalyst(analystId: number): Promise<ThreatIntelligence[]> {
    return this.findAll({
      where: { analyst_id: analystId },
      order: [['updated_at', 'DESC']]
    });
  }

  /**
   * Find intelligence reports targeting a specific industry
   * @param industry Industry to search for
   * @returns Promise resolving to matching reports
   */
  static async findByIndustry(industry: string): Promise<ThreatIntelligence[]> {
    return this.findAll({
      where: {
        target_industries: { [Op.contains]: [industry] }
      },
      order: [['published_at', 'DESC']]
    });
  }

  /**
   * Find intelligence reports targeting a specific country
   * @param country Country to search for
   * @returns Promise resolving to matching reports
   */
  static async findByCountry(country: string): Promise<ThreatIntelligence[]> {
    return this.findAll({
      where: {
        target_countries: { [Op.contains]: [country] }
      },
      order: [['published_at', 'DESC']]
    });
  }

  /**
   * Find recent intelligence reports
   * @param days Number of days to look back (default: 30)
   * @returns Promise resolving to recent reports
   */
  static async findRecent(days: number = 30): Promise<ThreatIntelligence[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        published_at: { [Op.gte]: cutoffDate },
        status: 'published'
      },
      order: [['published_at', 'DESC']]
    });
  }

  /**
   * Find high-confidence intelligence reports
   * @returns Promise resolving to high-confidence reports
   */
  static async findHighConfidence(): Promise<ThreatIntelligence[]> {
    return this.findAll({
      where: { 
        confidence: 'high',
        reliability: { [Op.in]: ['A', 'B', 'C'] },
        status: 'published'
      },
      order: [['published_at', 'DESC']]
    });
  }

  /**
   * Find intelligence reports expiring soon
   * @param days Number of days to look ahead (default: 7)
   * @returns Promise resolving to expiring reports
   */
  static async findExpiring(days: number = 7): Promise<ThreatIntelligence[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.findAll({
      where: {
        valid_until: {
          [Op.between]: [new Date(), futureDate]
        },
        status: 'published'
      },
      order: [['valid_until', 'ASC']]
    });
  }

  /**
   * Find intelligence reports by tag
   * @param tag Tag to search for
   * @returns Promise resolving to tagged reports
   */
  static async findByTag(tag: string): Promise<ThreatIntelligence[]> {
    return this.findAll({
      where: {
        tags: {
          [Op.contains]: [tag]
        }
      },
      order: [['published_at', 'DESC']]
    });
  }

  /**
   * Search intelligence reports by text query
   * @param query Search query
   * @returns Promise resolving to matching reports
   */
  static async searchReports(query: string): Promise<ThreatIntelligence[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { tags: { [Op.contains]: [query] } }
        ]
      },
      order: [['published_at', 'DESC']]
    });
  }

  /**
   * Find reports by status
   * @param status Status to filter by
   * @returns Promise resolving to reports with specified status
   */
  static async findByStatus(status: ThreatIntelligenceAttributes['status']): Promise<ThreatIntelligence[]> {
    return this.findAll({
      where: { status },
      order: [['updated_at', 'DESC']]
    });
  }

  /**
   * Get intelligence type distribution statistics
   * @returns Promise resolving to type statistics
   */
  static async getTypeStats(): Promise<Array<{ type: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'intelligence_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['intelligence_type']
    });
    
    return results.map(r => ({
      type: r.intelligence_type,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get source distribution statistics
   * @returns Promise resolving to source statistics
   */
  static async getSourceStats(): Promise<Array<{ source: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'source',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['source'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      source: r.source,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get confidence and reliability distribution matrix
   * @returns Promise resolving to confidence/reliability statistics
   */
  static async getConfidenceReliabilityMatrix(): Promise<Array<{
    confidence: string;
    reliability: string;
    count: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'confidence',
        'reliability',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['confidence', 'reliability'],
      where: { status: 'published' }
    });
    
    return results.map(r => ({
      confidence: r.confidence,
      reliability: r.reliability,
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
   * Get sharing level distribution statistics
   * @returns Promise resolving to sharing level statistics
   */
  static async getSharingLevelStats(): Promise<Array<{ sharing_level: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'sharing_level',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['sharing_level']
    });
    
    return results.map(r => ({
      sharing_level: r.sharing_level,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get intelligence trend statistics over time
   * @param days Number of days to analyze (default: 30)
   * @returns Promise resolving to trend data
   */
  static async getTrendStats(days: number = 30): Promise<Array<{ date: string; count: number }>> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('DATE', this.sequelize!.col('published_at')), 'date'],
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      where: {
        published_at: { [Op.gte]: cutoffDate },
        status: 'published'
      },
      group: [this.sequelize!.fn('DATE', this.sequelize!.col('published_at'))],
      order: [[this.sequelize!.fn('DATE', this.sequelize!.col('published_at')), 'ASC']]
    });
    
    return results.map(r => ({
      date: (r as any).getDataValue('date'),
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Create intelligence report with validation
   * @param data Report data to create
   * @returns Promise resolving to created report
   */
  static async createReport(data: ThreatIntelligenceCreationAttributes): Promise<ThreatIntelligence> {
    // Set valid_from if not provided
    if (!data.valid_from && data.status === 'published') {
      data.valid_from = new Date();
    }

    // Set published_at if publishing
    if (data.status === 'published' && !data.published_at) {
      data.published_at = new Date();
    }

    return this.create(data);
  }
}

export default ThreatIntelligence;
