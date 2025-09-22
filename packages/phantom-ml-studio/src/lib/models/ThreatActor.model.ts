/**
 * THREAT ACTOR SEQUELIZE MODEL
 * Represents threat actors and APT groups with comprehensive type safety
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
  HasMany,
  Unique,
  DataType,
  Length,
  Index
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { ThreatActorTactic } from './ThreatActorTactic.model';
import { ThreatActorTechnique } from './ThreatActorTechnique.model';
import { ThreatActorCVE } from './ThreatActorCVE.model';
import { Campaign } from './Campaign.model'
import { ThreatGroup } from './ThreatGroup.model';;

// ThreatActor Attributes Interface
export interface ThreatActorAttributes {
  /** Unique identifier for the threat actor */
  id: number;
  /** Name of the threat actor or APT group */
  name: string;
  /** Array of aliases and alternative names */
  aliases: string[];
  /** Detailed description of the threat actor */
  description?: string;
  /** Type of threat actor (APT, Criminal, etc.) */
  actor_type: 'APT' | 'Criminal' | 'Hacktivist' | 'State-sponsored' | 'Insider' | 'Script-kiddie' | 'Unknown';
  /** Countries attributed to this actor */
  attributed_countries: string[];
  /** Countries typically targeted by this actor */
  target_countries: string[];
  /** Industries typically targeted */
  target_industries: string[];
  /** Primary motivations */
  motivations: string[];
  /** Sophistication level indicators */
  sophistication_level: 'minimal' | 'intermediate' | 'advanced' | 'expert';
  /** First observed activity date */
  first_seen?: Date;
  /** Last observed activity date */
  last_seen?: Date;
  /** Current status of the threat actor */
  status: 'active' | 'inactive' | 'dormant' | 'unknown' | 'neutralized';
  /** Tools commonly used by this actor */
  tools_used: string[];
  /** Malware families associated with this actor */
  malware_families: string[];
  /** Infrastructure information */
  infrastructure: Record<string, any>;
  /** Attribution confidence metrics */
  attribution_confidence: Record<string, any>;
  /** External references and sources */
  references: string[];
  /** Threat score (0-100) */
  threat_score: number;
  /** Activity level (0-100) */
  activity_level: number;
  /** Known victims */
  known_victims: string[];
  /** Attack patterns */
  attack_patterns: string[];
  /** Geographic regions of operation */
  operating_regions: string[];
  /** Resource level assessment */
  resource_level: 'low' | 'medium' | 'high' | 'state-level';
  /** Classification tags */
  tags: string[];
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
    /** Associated threatgroup ID */
  threatgroup_id?: number;
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// ThreatActor Creation Attributes Interface
export interface ThreatActorCreationAttributes extends Optional<ThreatActorAttributes,
  'id' | 'aliases' | 'description' | 'actor_type' | 'attributed_countries' | 
  'target_countries' | 'target_industries' | 'motivations' | 'sophistication_level' |
  'first_seen' | 'last_seen' | 'status' | 'tools_used' | 'malware_families' |
  'infrastructure' | 'attribution_confidence' | 'references' | 'threat_score' |
  'activity_level' | 'known_victims' | 'attack_patterns' | 'operating_regions' |
  'resource_level' | 'tags' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'threat_actors',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { unique: true, fields: ['name'] },
    { fields: ['actor_type'] },
    { fields: ['status'] },
    { fields: ['sophistication_level'] },
    { fields: ['resource_level'] },
    { fields: ['threat_score'] },
    { fields: ['activity_level'] },
    { fields: ['first_seen'] },
    { fields: ['last_seen'] },
    { fields: ['created_at'] }
  ]
})
export class ThreatActor extends Model<ThreatActorAttributes, ThreatActorCreationAttributes> implements ThreatActorAttributes {
  /** Unique identifier for the threat actor */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Associated threatgroup ID */
  @ForeignKey(() => ThreatGroup)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare threatgroup_id?: number;

  /** Name of the threat actor or APT group */
  @AllowNull(false)
  @Unique
  @Length({ min: 1, max: 100 })
  @Column(DataType.STRING(100))
  declare name: string;

  /** Array of aliases and alternative names */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare aliases: string[];

  /** Detailed description of the threat actor */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Type of threat actor (APT, Criminal, etc.) */
  @AllowNull(false)
  @Default('APT')
  @Index
  @Column(DataType.ENUM('APT', 'Criminal', 'Hacktivist', 'State-sponsored', 'Insider', 'Script-kiddie', 'Unknown'))
  declare actor_type: 'APT' | 'Criminal' | 'Hacktivist' | 'State-sponsored' | 'Insider' | 'Script-kiddie' | 'Unknown';

  /** Countries attributed to this actor */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare attributed_countries: string[];

  /** Countries typically targeted by this actor */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare target_countries: string[];

  /** Industries typically targeted */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare target_industries: string[];

  /** Primary motivations */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare motivations: string[];

  /** Sophistication level indicators */
  @AllowNull(false)
  @Default('intermediate')
  @Index
  @Column(DataType.ENUM('minimal', 'intermediate', 'advanced', 'expert'))
  declare sophistication_level: 'minimal' | 'intermediate' | 'advanced' | 'expert';

  /** First observed activity date */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare first_seen?: Date;

  /** Last observed activity date */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare last_seen?: Date;

  /** Current status of the threat actor */
  @AllowNull(false)
  @Default('active')
  @Index
  @Column(DataType.ENUM('active', 'inactive', 'dormant', 'unknown', 'neutralized'))
  declare status: 'active' | 'inactive' | 'dormant' | 'unknown' | 'neutralized';

  /** Tools commonly used by this actor */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tools_used: string[];

  /** Malware families associated with this actor */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare malware_families: string[];

  /** Infrastructure information */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare infrastructure: Record<string, any>;

  /** Attribution confidence metrics */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare attribution_confidence: Record<string, any>;

  /** External references and sources */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare references: string[];

  /** Threat score (0-100) */
  @AllowNull(false)
  @Default(50)
  @Index
  @Column(DataType.INTEGER)
  declare threat_score: number;

  /** Activity level (0-100) */
  @AllowNull(false)
  @Default(50)
  @Index
  @Column(DataType.INTEGER)
  declare activity_level: number;

  /** Known victims */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare known_victims: string[];

  /** Attack patterns */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare attack_patterns: string[];

  /** Geographic regions of operation */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare operating_regions: string[];

  /** Resource level assessment */
  @AllowNull(false)
  @Default('medium')
  @Index
  @Column(DataType.ENUM('low', 'medium', 'high', 'state-level'))
  declare resource_level: 'low' | 'medium' | 'high' | 'state-level';

  /** Classification tags */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

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
  /** MITRE tactics associated with this threat actor */
  @HasMany(() => ThreatActorTactic, {
    foreignKey: 'threat_actor_id',
    as: 'threat_actor_tactics',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare threat_actor_tactics?: ThreatActorTactic[];

  /** MITRE techniques associated with this threat actor */
  @HasMany(() => ThreatActorTechnique, {
    foreignKey: 'threat_actor_id',
    as: 'threat_actor_techniques',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare threat_actor_techniques?: ThreatActorTechnique[];

  /** CVEs associated with this threat actor */
  @HasMany(() => ThreatActorCVE, {
    foreignKey: 'threat_actor_id',
    as: 'threat_actor_cves',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare threat_actor_cves?: ThreatActorCVE[];

  /** Campaigns attributed to this threat actor */
  @HasMany(() => Campaign, {
    foreignKey: 'threat_actor_id',
    as: 'campaigns',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare campaigns?: Campaign[];

 
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
   * Check if the threat actor is currently active
   * @returns True if status is active
   */
  public isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Check if the threat actor is dormant
   * @returns True if status is dormant
   */
  public isDormant(): boolean {
    return this.status === 'dormant';
  }

  /**
   * Check if the threat actor has been neutralized
   * @returns True if status is neutralized
   */
  public isNeutralized(): boolean {
    return this.status === 'neutralized';
  }

  /**
   * Check if threat actor is recently active
   * @param days Number of days to consider recent (default: 365)
   * @returns True if last seen within specified days
   */
  public isRecentlyActive(days: number = 365): boolean {
    if (!this.last_seen) return false;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return this.last_seen > cutoffDate;
  }

  /**
   * Check if threat actor is high threat
   * @param threshold Threat score threshold (default: 80)
   * @returns True if threat score exceeds threshold
   */
  public isHighThreat(threshold: number = 80): boolean {
    return this.threat_score >= threshold;
  }

  /**
   * Check if threat actor is highly sophisticated
   * @returns True if sophistication is advanced or expert
   */
  public isHighlySophisticated(): boolean {
    return this.sophistication_level === 'advanced' || this.sophistication_level === 'expert';
  }

  /**
   * Check if threat actor has state-level resources
   * @returns True if resource level is state-level
   */
  public hasStateLevelResources(): boolean {
    return this.resource_level === 'state-level';
  }

  /**
   * Get age of threat actor tracking in days
   * @returns Age in days since first seen
   */
  public getAge(): number | null {
    if (!this.first_seen) return null;
    const diffTime = new Date().getTime() - this.first_seen.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days since last activity
   * @returns Days since last seen, null if never seen
   */
  public getDaysSinceLastActivity(): number | null {
    if (!this.last_seen) return null;
    const diffTime = new Date().getTime() - this.last_seen.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate sophistication score based on sophistication level
   * @returns Numeric score representing sophistication (1-4)
   */
  public getSophisticationScore(): number {
    const sophisticationScores = {
      minimal: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4
    };
    return sophisticationScores[this.sophistication_level];
  }

  /**
   * Calculate resource score based on resource level
   * @returns Numeric score representing resources (1-4)
   */
  public getResourceScore(): number {
    const resourceScores = {
      low: 1,
      medium: 2,
      high: 3,
      'state-level': 4
    };
    return resourceScores[this.resource_level];
  }

  /**
   * Get combined risk score
   * @returns Combined score based on threat, sophistication, and resources
   */
  public getRiskScore(): number {
    const threatWeight = this.threat_score * 0.4;
    const sophisticationWeight = (this.getSophisticationScore() / 4) * 100 * 0.3;
    const resourceWeight = (this.getResourceScore() / 4) * 100 * 0.2;
    const activityWeight = this.activity_level * 0.1;
    
    return Math.round(threatWeight + sophisticationWeight + resourceWeight + activityWeight);
  }

  /**
   * Get number of aliases
   * @returns Count of aliases
   */
  public getAliasCount(): number {
    return this.aliases.length;
  }

  /**
   * Get number of target countries
   * @returns Count of target countries
   */
  public getTargetCountryCount(): number {
    return this.target_countries.length;
  }

  /**
   * Get number of target industries
   * @returns Count of target industries
   */
  public getTargetIndustryCount(): number {
    return this.target_industries.length;
  }

  /**
   * Get number of known victims
   * @returns Count of known victims
   */
  public getKnownVictimCount(): number {
    return this.known_victims.length;
  }

  /**
   * Check if actor has specific alias
   * @param alias Alias to check for
   * @returns True if alias exists
   */
  public hasAlias(alias: string): boolean {
    return this.aliases.includes(alias);
  }

  /**
   * Check if actor targets specific country
   * @param country Country to check
   * @returns True if country is targeted
   */
  public targetsCountry(country: string): boolean {
    return this.target_countries.includes(country);
  }

  /**
   * Check if actor targets specific industry
   * @param industry Industry to check
   * @returns True if industry is targeted
   */
  public targetsIndustry(industry: string): boolean {
    return this.target_industries.includes(industry);
  }

  /**
   * Check if actor uses specific tool
   * @param tool Tool to check for
   * @returns True if tool is used
   */
  public usesTool(tool: string): boolean {
    return this.tools_used.includes(tool);
  }

  /**
   * Check if actor uses specific malware family
   * @param malware Malware family to check
   * @returns True if malware is used
   */
  public usesMalware(malware: string): boolean {
    return this.malware_families.includes(malware);
  }

  /**
   * Check if actor has specific motivation
   * @param motivation Motivation to check
   * @returns True if motivation exists
   */
  public hasMotivation(motivation: string): boolean {
    return this.motivations.includes(motivation);
  }

  /**
   * Check if actor has specific tag
   * @param tag Tag to check for
   * @returns True if tag exists
   */
  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Get actor type color for UI display
   * @returns Color hex code for actor type
   */
  public getActorTypeColor(): string {
    const colorMap = {
      'APT': '#DC3545',
      'Criminal': '#FD7E14',
      'Hacktivist': '#6F42C1',
      'State-sponsored': '#E83E8C',
      'Insider': '#20C997',
      'Script-kiddie': '#6C757D',
      'Unknown': '#ADB5BD'
    };
    return colorMap[this.actor_type];
  }

  /**
   * Update threat score
   * @param score New threat score (0-100)
   * @returns Promise resolving to updated actor
   */
  public async updateThreatScore(score: number): Promise<this> {
    this.threat_score = Math.max(0, Math.min(100, score));
    return this.save();
  }

  /**
   * Update activity level
   * @param level New activity level (0-100)
   * @returns Promise resolving to updated actor
   */
  public async updateActivityLevel(level: number): Promise<this> {
    this.activity_level = Math.max(0, Math.min(100, level));
    return this.save();
  }

  /**
   * Add alias
   * @param alias Alias to add
   * @returns Promise resolving to updated actor
   */
  public async addAlias(alias: string): Promise<this> {
    if (!this.aliases.includes(alias)) {
      this.aliases = [...this.aliases, alias];
      return this.save();
    }
    return this;
  }

  /**
   * Add target country
   * @param country Country to add to targets
   * @returns Promise resolving to updated actor
   */
  public async addTargetCountry(country: string): Promise<this> {
    if (!this.target_countries.includes(country)) {
      this.target_countries = [...this.target_countries, country];
      return this.save();
    }
    return this;
  }

  /**
   * Add target industry
   * @param industry Industry to add to targets
   * @returns Promise resolving to updated actor
   */
  public async addTargetIndustry(industry: string): Promise<this> {
    if (!this.target_industries.includes(industry)) {
      this.target_industries = [...this.target_industries, industry];
      return this.save();
    }
    return this;
  }

  /**
   * Add tool used
   * @param tool Tool to add
   * @returns Promise resolving to updated actor
   */
  public async addTool(tool: string): Promise<this> {
    if (!this.tools_used.includes(tool)) {
      this.tools_used = [...this.tools_used, tool];
      return this.save();
    }
    return this;
  }

  /**
   * Add malware family
   * @param malware Malware family to add
   * @returns Promise resolving to updated actor
   */
  public async addMalwareFamily(malware: string): Promise<this> {
    if (!this.malware_families.includes(malware)) {
      this.malware_families = [...this.malware_families, malware];
      return this.save();
    }
    return this;
  }

  /**
   * Add known victim
   * @param victim Victim to add
   * @returns Promise resolving to updated actor
   */
  public async addKnownVictim(victim: string): Promise<this> {
    if (!this.known_victims.includes(victim)) {
      this.known_victims = [...this.known_victims, victim];
      return this.save();
    }
    return this;
  }

  /**
   * Add tag
   * @param tag Tag to add
   * @returns Promise resolving to updated actor
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Mark actor as seen
   * @param timestamp Optional timestamp (defaults to now)
   * @returns Promise resolving to updated actor
   */
  public async markSeen(timestamp?: Date): Promise<this> {
    const now = timestamp || new Date();
    if (!this.first_seen) {
      this.first_seen = now;
    }
    this.last_seen = now;
    return this.save();
  }

  /**
   * Neutralize the threat actor
   * @param reason Reason for neutralization
   * @returns Promise resolving to updated actor
   */
  public async neutralize(reason?: string): Promise<this> {
    this.status = 'neutralized';
    if (reason) {
      this.metadata = {
        ...this.metadata,
        neutralization_reason: reason,
        neutralized_at: new Date()
      };
    }
    return this.save();
  }

  // Static methods
  /**
   * Find threat actor by name or alias
   * @param name Name or alias to search for
   * @returns Promise resolving to threat actor or null
   */
  static async findByName(name: string): Promise<ThreatActor | null> {
    return this.findOne({ 
      where: { 
        [Op.or]: [
          { name: { [Op.iLike]: `%${name}%` } },
          { aliases: { [Op.contains]: [name] } }
        ]
      }
    });
  }

  /**
   * Find threat actors by type
   * @param actorType Type to filter by
   * @returns Promise resolving to actors of specified type
   */
  static async findByType(actorType: ThreatActorAttributes['actor_type']): Promise<ThreatActor[]> {
    return this.findAll({
      where: { actor_type: actorType },
      order: [['threat_score', 'DESC']]
    });
  }

  /**
   * Find threat actors by status
   * @param status Status to filter by
   * @returns Promise resolving to actors with specified status
   */
  static async findByStatus(status: ThreatActorAttributes['status']): Promise<ThreatActor[]> {
    return this.findAll({
      where: { status },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find active threat actors
   * @returns Promise resolving to active threat actors
   */
  static async findActive(): Promise<ThreatActor[]> {
    return this.findAll({
      where: { status: 'active' },
      order: [['threat_score', 'DESC']]
    });
  }

  /**
   * Find high-threat actors
   * @param threshold Threat score threshold (default: 80)
   * @returns Promise resolving to high-threat actors
   */
  static async findHighThreat(threshold: number = 80): Promise<ThreatActor[]> {
    return this.findAll({
      where: { threat_score: { [Op.gte]: threshold } },
      order: [['threat_score', 'DESC']]
    });
  }

  /**
   * Find threat actors attributed to a specific country
   * @param country Country to filter by
   * @returns Promise resolving to array of threat actors
   */
  static async findByCountry(country: string): Promise<ThreatActor[]> {
    return this.findAll({
      where: {
        attributed_countries: { [Op.contains]: [country] }
      },
      order: [['threat_score', 'DESC']]
    });
  }

  /**
   * Find threat actors targeting a specific industry
   * @param industry Industry to filter by
   * @returns Promise resolving to array of threat actors
   */
  static async findByTargetIndustry(industry: string): Promise<ThreatActor[]> {
    return this.findAll({
      where: {
        target_industries: { [Op.contains]: [industry] }
      },
      order: [['threat_score', 'DESC']]
    });
  }

  /**
   * Find threat actors by sophistication level
   * @param level Sophistication level to filter by
   * @returns Promise resolving to actors with specified sophistication
   */
  static async findBySophistication(level: ThreatActorAttributes['sophistication_level']): Promise<ThreatActor[]> {
    return this.findAll({
      where: { sophistication_level: level },
      order: [['threat_score', 'DESC']]
    });
  }

  /**
   * Find recently active threat actors
   * @param days Number of days to look back (default: 365)
   * @returns Promise resolving to recently active actors
   */
  static async findRecentlyActive(days: number = 365): Promise<ThreatActor[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        last_seen: { [Op.gte]: cutoffDate }
      },
      order: [['last_seen', 'DESC']]
    });
  }

  /**
   * Find threat actors using specific tool
   * @param tool Tool to search for
   * @returns Promise resolving to actors using the tool
   */
  static async findByTool(tool: string): Promise<ThreatActor[]> {
    return this.findAll({
      where: {
        tools_used: { [Op.contains]: [tool] }
      },
      order: [['threat_score', 'DESC']]
    });
  }

  /**
   * Find threat actors using specific malware
   * @param malware Malware family to search for
   * @returns Promise resolving to actors using the malware
   */
  static async findByMalware(malware: string): Promise<ThreatActor[]> {
    return this.findAll({
      where: {
        malware_families: { [Op.contains]: [malware] }
      },
      order: [['threat_score', 'DESC']]
    });
  }

  /**
   * Get threat actor type distribution statistics
   * @returns Promise resolving to type statistics
   */
  static async getTypeStats(): Promise<Array<{
    actor_type: string;
    count: number;
    avg_threat_score: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'actor_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('threat_score')), 'avg_threat_score']
      ],
      group: ['actor_type'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      actor_type: r.actor_type,
      count: parseInt((r as any).getDataValue('count')),
      avg_threat_score: parseFloat((r as any).getDataValue('avg_threat_score')) || 0
    }));
  }

  /**
   * Get sophistication level distribution statistics
   * @returns Promise resolving to sophistication stats
   */
  static async getSophisticationStats(): Promise<Array<{
    sophistication_level: string;
    count: number;
    avg_threat_score: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'sophistication_level',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('threat_score')), 'avg_threat_score']
      ],
      group: ['sophistication_level'],
      order: [['sophistication_level', 'ASC']]
    });
    
    return results.map(r => ({
      sophistication_level: r.sophistication_level,
      count: parseInt((r as any).getDataValue('count')),
      avg_threat_score: parseFloat((r as any).getDataValue('avg_threat_score')) || 0
    }));
  }

  /**
   * Get overall threat actor statistics
   * @returns Promise resolving to comprehensive stats
   */
  static async getOverallStats(): Promise<{
    total_actors: number;
    active_actors: number;
    high_threat_actors: number;
    state_sponsored_actors: number;
    expert_level_actors: number;
    avg_threat_score: number;
    actors_seen_this_year: number;
  }> {
    const thisYear = new Date();
    thisYear.setMonth(0, 1);
    thisYear.setHours(0, 0, 0, 0);
    
    const [
      totalActors,
      activeActors,
      highThreatActors,
      stateSponsoredActors,
      expertLevelActors,
      actorsSeenThisYear,
      avgThreatResult
    ] = await Promise.all([
      this.count(),
      this.count({ where: { status: 'active' } }),
      this.count({ where: { threat_score: { [Op.gte]: 80 } } }),
      this.count({ where: { actor_type: 'State-sponsored' } }),
      this.count({ where: { sophistication_level: 'expert' } }),
      this.count({ where: { last_seen: { [Op.gte]: thisYear } } }),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('AVG', this.sequelize!.col('threat_score')), 'avg_threat']
        ]
      }).then(results => results[0])
    ]);

    return {
      total_actors: totalActors,
      active_actors: activeActors,
      high_threat_actors: highThreatActors,
      state_sponsored_actors: stateSponsoredActors,
      expert_level_actors: expertLevelActors,
      avg_threat_score: parseFloat((avgThreatResult as any).getDataValue('avg_threat')) || 0,
      actors_seen_this_year: actorsSeenThisYear
    };
  }

  /**
   * Create threat actor with validation
   * @param data Actor data to create
   * @returns Promise resolving to created actor
   */
  static async createActor(data: ThreatActorCreationAttributes): Promise<ThreatActor> {
    // Validate required fields
    if (!data.name) {
      throw new Error('Actor name is required');
    }

    // Validate scores
    if (data.threat_score !== undefined && (data.threat_score < 0 || data.threat_score > 100)) {
      throw new Error('Threat score must be between 0 and 100');
    }
    if (data.activity_level !== undefined && (data.activity_level < 0 || data.activity_level > 100)) {
      throw new Error('Activity level must be between 0 and 100');
    }

    // Check for duplicate names
    const existingActor = await this.findOne({
      where: {
        [Op.or]: [
          { name: data.name },
          { aliases: { [Op.contains]: [data.name] } }
        ]
      }
    });
    if (existingActor) {
      throw new Error('Threat actor with this name already exists');
    }

    return this.create(data);
  }
}

export default ThreatActor;
