/**
 * CAMPAIGN SEQUELIZE MODEL
 * Represents threat actor campaigns and operations with comprehensive type safety
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
import { User } from './User.model';
import { ThreatIntelligence } from './ThreatIntelligence.model';
import { IOC } from './IOC.model'
import { ThreatGroup } from './ThreatGroup.model';;

// Campaign Attributes Interface
export interface CampaignAttributes {
  /** Unique identifier for the campaign */
  id: number;
  /** Name of the campaign */
  name: string;
  /** Detailed description of the campaign */
  description?: string;
  /** Associated threat actor ID */
  threat_actor_id?: number;
  /** Analyst who created/manages this campaign */
  analyst_id: number;
  /** Current status of the campaign */
  status: 'active' | 'inactive' | 'concluded' | 'suspected';
  /** When the campaign was first observed */
  first_seen?: Date;
  /** When the campaign was last observed */
  last_seen?: Date;
  /** Countries targeted by this campaign */
  target_countries: string[];
  /** Industries targeted by this campaign */
  target_industries: string[];
  /** Specific organizations targeted */
  target_organizations: string[];
  /** Campaign objectives */
  objectives: string[];
  /** Attack vectors used in the campaign */
  attack_vectors: string[];
  /** MITRE ATT&CK technique IDs used */
  techniques_used: string[];
  /** Malware families associated with campaign */
  malware_families: string[];
  /** Tools used in the campaign */
  tools_used: string[];
  /** Infrastructure details */
  infrastructure: Record<string, any>;
  /** Campaign timeline information */
  timeline: Record<string, any>;
  /** Impact assessment data */
  impact_assessment: Record<string, any>;
  /** Confidence level in campaign attribution */
  confidence: 'low' | 'medium' | 'high';
  /** Sophistication level of the campaign */
  sophistication: 'minimal' | 'intermediate' | 'advanced' | 'expert';
  /** Classification tags */
  tags: string[];
  /** Reference URLs and sources */
  references: string[];
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
    /** Associated threatgroup ID */
  threatgroup_id?: number;
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// Campaign Creation Attributes Interface
export interface CampaignCreationAttributes extends Optional<CampaignAttributes,
  'id' | 'description' | 'threat_actor_id' | 'status' | 'first_seen' | 'last_seen' |
  'target_countries' | 'target_industries' | 'target_organizations' | 'objectives' |
  'attack_vectors' | 'techniques_used' | 'malware_families' | 'tools_used' |
  'infrastructure' | 'timeline' | 'impact_assessment' | 'confidence' | 'sophistication' |
  'tags' | 'references' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'campaigns',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['name'] },
    { fields: ['threat_actor_id'] },
    { fields: ['analyst_id'] },
    { fields: ['status'] },
    { fields: ['first_seen'] },
    { fields: ['last_seen'] },
    { fields: ['confidence'] },
    { fields: ['sophistication'] },
    { fields: ['created_at'] }
  ]
})
export class Campaign extends Model<CampaignAttributes, CampaignCreationAttributes> implements CampaignAttributes {
  /** Unique identifier for the campaign */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Associated threatgroup ID */
  @ForeignKey(() => ThreatGroup)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare threatgroup_id?: number;

  /** Name of the campaign */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare name: string;

  /** Detailed description of the campaign */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Associated threat actor ID */
  @ForeignKey(() => ThreatActor)
  @AllowNull(true)
  @Index
  @Column(DataType.INTEGER)
  declare threat_actor_id?: number;

  /** Analyst who created/manages this campaign */
  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.INTEGER)
  declare analyst_id: number;

  /** Current status of the campaign */
  @AllowNull(false)
  @Default('active')
  @Index
  @Column(DataType.ENUM('active', 'inactive', 'concluded', 'suspected'))
  declare status: 'active' | 'inactive' | 'concluded' | 'suspected';

  /** When the campaign was first observed */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare first_seen?: Date;

  /** When the campaign was last observed */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare last_seen?: Date;

  /** Countries targeted by this campaign */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare target_countries: string[];

  /** Industries targeted by this campaign */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare target_industries: string[];

  /** Specific organizations targeted */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare target_organizations: string[];

  /** Campaign objectives */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare objectives: string[];

  /** Attack vectors used in the campaign */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare attack_vectors: string[];

  /** MITRE ATT&CK technique IDs used */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare techniques_used: string[];

  /** Malware families associated with campaign */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare malware_families: string[];

  /** Tools used in the campaign */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tools_used: string[];

  /** Infrastructure details */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare infrastructure: Record<string, any>;

  /** Campaign timeline information */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare timeline: Record<string, any>;

  /** Impact assessment data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare impact_assessment: Record<string, any>;

  /** Confidence level in campaign attribution */
  @AllowNull(false)
  @Default('medium')
  @Column(DataType.ENUM('low', 'medium', 'high'))
  declare confidence: 'low' | 'medium' | 'high';

  /** Sophistication level of the campaign */
  @AllowNull(false)
  @Default('intermediate')
  @Index
  @Column(DataType.ENUM('minimal', 'intermediate', 'advanced', 'expert'))
  declare sophistication: 'minimal' | 'intermediate' | 'advanced' | 'expert';

  /** Classification tags */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Reference URLs and sources */
  @AllowNull(false)
  @Default([])
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

  /** Analyst managing this campaign */
  @BelongsTo(() => User, {
    foreignKey: 'analyst_id',
    as: 'analyst',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  })
  declare analyst?: User;

  /** Associated intelligence reports */
  @HasMany(() => ThreatIntelligence, {
    foreignKey: 'campaign_id',
    as: 'intelligence_reports',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare intelligence_reports?: ThreatIntelligence[];

  /** Associated indicators of compromise */
  @HasMany(() => IOC, {
    foreignKey: 'campaign_id',
    as: 'indicators',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare indicators?: IOC[];

 
  /** Associated threatgroup */
  @BelongsTo(() => ThreatGroup, {
    foreignKey: 'threatgroup_id',
    as: 'threatgroup',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare threatgroup?: ThreatGroup;
 // Instance methods
  /**
   * Check if the campaign is currently active
   * @returns True if status is active
   */
  public isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Check if the campaign is concluded
   * @returns True if status is concluded
   */
  public isConcluded(): boolean {
    return this.status === 'concluded';
  }

  /**
   * Check if the campaign is suspected (low confidence)
   * @returns True if status is suspected
   */
  public isSuspected(): boolean {
    return this.status === 'suspected';
  }

  /**
   * Get the duration of the campaign in days
   * @returns Duration in days, or null if dates unavailable
   */
  public getDuration(): number | null {
    if (!this.first_seen || !this.last_seen) return null;
    const diffTime = this.last_seen.getTime() - this.first_seen.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if the campaign is ongoing (active within last 30 days)
   * @returns True if campaign activity is recent
   */
  public isOngoing(): boolean {
    if (!this.last_seen || this.status !== 'active') return false;
    const daysSinceLastSeen = (new Date().getTime() - this.last_seen.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastSeen <= 30;
  }

  /**
   * Get numeric sophistication score
   * @returns Sophistication score (1-4)
   */
  public getSophisticationScore(): number {
    const scores: Record<string, number> = {
      'minimal': 1,
      'intermediate': 2,
      'advanced': 3,
      'expert': 4
    };
    return scores[this.sophistication] || 2;
  }

  /**
   * Get confidence level as numeric score
   * @returns Confidence score (1-3)
   */
  public getConfidenceScore(): number {
    const scores: Record<string, number> = {
      'low': 1,
      'medium': 2,
      'high': 3
    };
    return scores[this.confidence] || 2;
  }

  /**
   * Calculate campaign threat score
   * @returns Combined threat score based on sophistication and scope
   */
  public getThreatScore(): number {
    const sophisticationScore = this.getSophisticationScore();
    const targetScope = this.target_countries.length + this.target_industries.length;
    const techniqueCount = this.techniques_used.length;
    
    return Math.round(
      (sophisticationScore * 2.5) + 
      (Math.min(targetScope, 10) * 0.3) + 
      (Math.min(techniqueCount, 20) * 0.2)
    );
  }

  /**
   * Check if campaign targets a specific country
   * @param country Country to check
   * @returns True if country is targeted
   */
  public targetsCountry(country: string): boolean {
    return this.target_countries.includes(country);
  }

  /**
   * Check if campaign targets a specific industry
   * @param industry Industry to check
   * @returns True if industry is targeted
   */
  public targetsIndustry(industry: string): boolean {
    return this.target_industries.includes(industry);
  }

  /**
   * Check if campaign uses specific technique
   * @param techniqueId MITRE technique ID
   * @returns True if technique is used
   */
  public usesTechnique(techniqueId: string): boolean {
    return this.techniques_used.includes(techniqueId);
  }

  /**
   * Get age of campaign in days
   * @returns Age in days since creation
   */
  public getAge(): number {
    const diffTime = new Date().getTime() - this.created_at.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days since last activity
   * @returns Days since last seen, or null if not available
   */
  public getDaysSinceLastActivity(): number | null {
    if (!this.last_seen) return null;
    const diffTime = new Date().getTime() - this.last_seen.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Mark campaign as concluded
   * @returns Promise resolving to updated campaign
   */
  public async conclude(): Promise<this> {
    this.status = 'concluded';
    if (!this.last_seen) {
      this.last_seen = new Date();
    }
    return this.save();
  }

  /**
   * Update last seen timestamp
   * @returns Promise resolving to updated campaign
   */
  public async updateLastSeen(): Promise<this> {
    this.last_seen = new Date();
    return this.save();
  }

  /**
   * Add a tag to the campaign
   * @param tag Tag to add
   * @returns Promise resolving to updated campaign
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a tag from the campaign
   * @param tag Tag to remove
   * @returns Promise resolving to updated campaign
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  /**
   * Add a target country
   * @param country Country to add
   * @returns Promise resolving to updated campaign
   */
  public async addTargetCountry(country: string): Promise<this> {
    if (!this.target_countries.includes(country)) {
      this.target_countries = [...this.target_countries, country];
      return this.save();
    }
    return this;
  }

  /**
   * Add a target industry
   * @param industry Industry to add
   * @returns Promise resolving to updated campaign
   */
  public async addTargetIndustry(industry: string): Promise<this> {
    if (!this.target_industries.includes(industry)) {
      this.target_industries = [...this.target_industries, industry];
      return this.save();
    }
    return this;
  }

  /**
   * Add a MITRE technique
   * @param techniqueId MITRE technique ID
   * @returns Promise resolving to updated campaign
   */
  public async addTechnique(techniqueId: string): Promise<this> {
    if (!this.techniques_used.includes(techniqueId)) {
      this.techniques_used = [...this.techniques_used, techniqueId];
      return this.save();
    }
    return this;
  }

  // Static methods
  /**
   * Find all active campaigns
   * @returns Promise resolving to active campaigns
   */
  static async findActive(): Promise<Campaign[]> {
    return this.findAll({
      where: { status: 'active' },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find campaigns by threat actor
   * @param threatActorId Threat actor ID
   * @returns Promise resolving to campaigns by threat actor
   */
  static async findByThreatActor(threatActorId: number): Promise<Campaign[]> {
    return this.findAll({
      where: { threat_actor_id: threatActorId },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find campaigns by analyst
   * @param analystId Analyst user ID
   * @returns Promise resolving to campaigns by analyst
   */
  static async findByAnalyst(analystId: number): Promise<Campaign[]> {
    return this.findAll({
      where: { analyst_id: analystId },
      order: [['updated_at', 'DESC']]
    });
  }

  /**
   * Find campaigns targeting a specific country
   * @param country Country to search for
   * @returns Promise resolving to campaigns targeting country
   */
  static async findByCountry(country: string): Promise<Campaign[]> {
    return this.findAll({
      where: {
        target_countries: { [Op.contains]: [country] }
      },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find campaigns targeting a specific industry
   * @param industry Industry to search for
   * @returns Promise resolving to campaigns targeting industry
   */
  static async findByIndustry(industry: string): Promise<Campaign[]> {
    return this.findAll({
      where: {
        target_industries: { [Op.contains]: [industry] }
      },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find campaigns by objective
   * @param objective Campaign objective
   * @returns Promise resolving to campaigns with objective
   */
  static async findByObjective(objective: string): Promise<Campaign[]> {
    return this.findAll({
      where: {
        objectives: { [Op.contains]: [objective] }
      },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find ongoing campaigns (active within last 30 days)
   * @returns Promise resolving to ongoing campaigns
   */
  static async findOngoing(): Promise<Campaign[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    return this.findAll({
      where: {
        status: 'active',
        last_seen: { [Op.gte]: cutoffDate }
      },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find recent campaigns within specified days
   * @param days Number of days to look back (default: 30)
   * @returns Promise resolving to recent campaigns
   */
  static async findRecent(days: number = 30): Promise<Campaign[]> {
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
   * Find high sophistication campaigns
   * @returns Promise resolving to advanced/expert campaigns
   */
  static async findHighSophistication(): Promise<Campaign[]> {
    return this.findAll({
      where: {
        sophistication: { [Op.in]: ['advanced', 'expert'] }
      },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find campaigns by confidence level
   * @param confidence Confidence level to filter by
   * @returns Promise resolving to campaigns with specified confidence
   */
  static async findByConfidence(confidence: CampaignAttributes['confidence']): Promise<Campaign[]> {
    return this.findAll({
      where: { confidence },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find campaigns using specific technique
   * @param techniqueId MITRE technique ID
   * @returns Promise resolving to campaigns using technique
   */
  static async findByTechnique(techniqueId: string): Promise<Campaign[]> {
    return this.findAll({
      where: {
        techniques_used: { [Op.contains]: [techniqueId] }
      },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Search campaigns by name or description
   * @param query Search query
   * @returns Promise resolving to matching campaigns
   */
  static async searchCampaigns(query: string): Promise<Campaign[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Get campaign status distribution statistics
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
   * Get objective distribution statistics
   * @returns Promise resolving to objective statistics
   */
  static async getObjectiveStats(): Promise<Array<{ objective: string; count: number }>> {
    const campaigns = await this.findAll({
      attributes: ['objectives']
    });
    
    const objectiveCounts: Record<string, number> = {};
    campaigns.forEach(campaign => {
      campaign.objectives.forEach(objective => {
        objectiveCounts[objective] = (objectiveCounts[objective] || 0) + 1;
      });
    });
    
    return Object.entries(objectiveCounts)
      .map(([objective, count]) => ({ objective, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get industry targeting statistics
   * @returns Promise resolving to industry statistics
   */
  static async getIndustryStats(): Promise<Array<{ industry: string; count: number }>> {
    const campaigns = await this.findAll({
      attributes: ['target_industries']
    });
    
    const industryCounts: Record<string, number> = {};
    campaigns.forEach(campaign => {
      campaign.target_industries.forEach(industry => {
        industryCounts[industry] = (industryCounts[industry] || 0) + 1;
      });
    });
    
    return Object.entries(industryCounts)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get sophistication distribution statistics
   * @returns Promise resolving to sophistication statistics
   */
  static async getSophisticationStats(): Promise<Array<{ sophistication: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'sophistication',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['sophistication']
    });
    
    return results.map(r => ({
      sophistication: r.sophistication,
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
   * Get top targeted countries
   * @param limit Maximum number of countries to return
   * @returns Promise resolving to top targeted countries
   */
  static async getTopTargetedCountries(limit: number = 10): Promise<Array<{ country: string; count: number }>> {
    const campaigns = await this.findAll({
      attributes: ['target_countries']
    });
    
    const countryCounts: Record<string, number> = {};
    campaigns.forEach(campaign => {
      campaign.target_countries.forEach(country => {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      });
    });
    
    return Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get campaign trend data over time
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
   * Create campaign with validation
   * @param data Campaign data to create
   * @returns Promise resolving to created campaign
   */
  static async createCampaign(data: CampaignCreationAttributes): Promise<Campaign> {
    // Validate name is not empty
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Campaign name cannot be empty');
    }

    // Set first_seen if not provided and status is active
    if (!data.first_seen && data.status === 'active') {
      data.first_seen = new Date();
    }

    // Set last_seen if not provided and status is active
    if (!data.last_seen && data.status === 'active') {
      data.last_seen = new Date();
    }

    return this.create(data);
  }
}

export default Campaign;
