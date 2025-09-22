/**
 * THREAT ACTOR TECHNIQUE SEQUELIZE MODEL
 * Junction model linking threat actors to MITRE ATT&CK techniques with comprehensive type safety
 * 
 * This model represents the many-to-many relationship between threat actors and the techniques
 * they employ, following MITRE ATT&CK framework standards. It includes metadata about
 * proficiency, frequency, campaigns, and other contextual information.
 * 
 * @author Phantom ML Studio
 * @version 1.0.0
 * @since 2024-01-01
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
  DeletedAt,
  BelongsTo,
  ForeignKey,
  DataType,
  Unique,
  Index,
  Length,
  Validate,
  BeforeCreate,
  BeforeUpdate,
  AfterCreate,
  AfterUpdate,
  AfterDestroy
} from 'sequelize-typescript';
import { Optional, Op, WhereOptions, FindOptions, Transaction } from 'sequelize';
import { ThreatActor } from './ThreatActor.model';
import { MitreTechnique } from './MitreTechnique.model';
import { Campaign } from './Campaign.model';

/**
 * Proficiency levels for technique usage
 * Represents the skill level of a threat actor with a specific technique
 */
export type ProficiencyLevel = 'novice' | 'intermediate' | 'advanced' | 'expert' | 'unknown';

/**
 * Frequency of technique usage
 * Indicates how often a threat actor employs a specific technique
 */
export type UsageFrequency = 'rare' | 'occasional' | 'frequent' | 'constant' | 'unknown';

/**
 * Confidence level in the attribution
 * Represents the analyst's confidence in the threat actor-technique association
 */
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very_high';

/**
 * Source types for intelligence attribution
 * Categories of sources that provide the threat actor-technique association
 */
export type SourceType = 'internal' | 'commercial' | 'open_source' | 'government' | 'partner' | 'unknown';

/**
 * Threat Actor Technique Attributes Interface
 * Defines all possible attributes for the junction model
 */
export interface ThreatActorTechniqueAttributes {
  /** Unique identifier for the association */
  id: number;
  
  /** Foreign key to threat actor */
  threat_actor_id: number;
  
  /** Foreign key to MITRE technique */
  technique_id: number;
  
  /** Foreign key to associated campaign (optional) */
  campaign_id?: number;
  
  /** Proficiency level of threat actor with this technique */
  proficiency_level: ProficiencyLevel;
  
  /** Frequency of technique usage */
  usage_frequency: UsageFrequency;
  
  /** Confidence level in this attribution */
  confidence_level: ConfidenceLevel;
  
  /** First observed date for this association */
  first_observed: Date;
  
  /** Last observed date for this association */
  last_observed?: Date;
  
  /** Source type of the intelligence */
  source_type: SourceType;
  
  /** Specific source identifier or name */
  source_name?: string;
  
  /** Source reliability score (1-5 scale) */
  source_reliability?: number;
  
  /** Is this association currently active */
  is_active: boolean;
  
  /** Is this a suspected (unconfirmed) association */
  is_suspected: boolean;
  
  /** Custom tags for categorization */
  tags: string[];
  
  /** TTPs (Tactics, Techniques, and Procedures) context */
  ttp_context?: Record<string, any>;
  
  /** Mitigation measures observed */
  mitigations_observed: string[];
  
  /** Detection methods that identified this technique */
  detection_methods: string[];
  
  /** Indicators of Compromise associated with this technique usage */
  iocs: string[];
  
  /** Tools used in conjunction with this technique */
  associated_tools: string[];
  
  /** Malware families used with this technique */
  associated_malware: string[];
  
  /** Geographic regions where this technique was observed */
  geographic_regions: string[];
  
  /** Industry sectors targeted using this technique */
  target_sectors: string[];
  
  /** Operating systems targeted */
  target_platforms: string[];
  
  /** Attack phases where this technique is employed */
  attack_phases: string[];
  
  /** NIST Cybersecurity Framework functions impacted */
  nist_functions: string[];
  
  /** MITRE D3FEND countermeasures */
  d3fend_countermeasures: string[];
  
  /** Financial impact assessment (if available) */
  financial_impact?: number;
  
  /** Operational impact assessment (1-5 scale) */
  operational_impact?: number;
  
  /** Reputational impact assessment (1-5 scale) */
  reputational_impact?: number;
  
  /** Success rate of this technique (percentage) */
  success_rate?: number;
  
  /** Detection rate by security controls (percentage) */
  detection_rate?: number;
  
  /** Number of observed incidents */
  incident_count?: number;
  
  /** Number of affected organizations */
  affected_organizations?: number;
  
  /** Average dwell time (in days) */
  average_dwell_time?: number;
  
  /** Analyst notes and observations */
  analyst_notes?: string;
  
  /** External references and URLs */
  external_references: string[];
  
  /** STIX identifier if applicable */
  stix_id?: string;
  
  /** Custom metadata for extensibility */
  metadata: Record<string, any>;
  
  /** Record creation timestamp */
  created_at: Date;
  
  /** Record last update timestamp */
  updated_at: Date;
  
  /** Soft delete timestamp */
  deleted_at?: Date;
}

/**
 * Threat Actor Technique Creation Attributes Interface
 * Defines required and optional attributes for creating new associations
 */
export interface ThreatActorTechniqueCreationAttributes extends Optional<ThreatActorTechniqueAttributes,
  'id' | 'campaign_id' | 'last_observed' | 'source_name' | 'source_reliability' | 
  'is_suspected' | 'ttp_context' | 'financial_impact' | 'operational_impact' |
  'reputational_impact' | 'success_rate' | 'detection_rate' | 'incident_count' |
  'affected_organizations' | 'average_dwell_time' | 'analyst_notes' | 'stix_id' |
  'created_at' | 'updated_at' | 'deleted_at'
> {}

/**
 * Statistical Summary Interface
 * Represents aggregated statistics for threat actor-technique associations
 */
export interface ThreatActorTechniqueStats {
  total_associations: number;
  active_associations: number;
  suspected_associations: number;
  proficiency_distribution: Record<ProficiencyLevel, number>;
  frequency_distribution: Record<UsageFrequency, number>;
  confidence_distribution: Record<ConfidenceLevel, number>;
  source_distribution: Record<SourceType, number>;
  average_confidence: number;
  most_common_tags: Array<{ tag: string; count: number }>;
  geographic_coverage: string[];
  sector_coverage: string[];
}

/**
 * Association Analysis Interface
 * Represents detailed analysis of a threat actor-technique association
 */
export interface AssociationAnalysis {
  association: ThreatActorTechnique;
  risk_score: number;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  related_associations: ThreatActorTechnique[];
  timeline_events: Array<{
    date: Date;
    event: string;
    source: string;
  }>;
}

/**
 * Threat Actor Technique Model Class
 * Comprehensive junction model with advanced functionality
 */
@Table({
  tableName: 'threat_actor_techniques',
  timestamps: true,
  underscored: true,
  paranoid: true,
  version: true,
  indexes: [
    { fields: ['threat_actor_id', 'technique_id'], unique: true },
    { fields: ['threat_actor_id'] },
    { fields: ['technique_id'] },
    { fields: ['campaign_id'] },
    { fields: ['proficiency_level'] },
    { fields: ['usage_frequency'] },
    { fields: ['confidence_level'] },
    { fields: ['first_observed'] },
    { fields: ['last_observed'] },
    { fields: ['source_type'] },
    { fields: ['is_active'] },
    { fields: ['is_suspected'] },
    { fields: ['tags'], using: 'gin' },
    { fields: ['geographic_regions'], using: 'gin' },
    { fields: ['target_sectors'], using: 'gin' },
    { fields: ['target_platforms'], using: 'gin' },
    { fields: ['created_at'] },
    { fields: ['updated_at'] }
  ]
})
export class ThreatActorTechnique extends Model<ThreatActorTechniqueAttributes, ThreatActorTechniqueCreationAttributes>
  implements ThreatActorTechniqueAttributes {

  /** Unique identifier for the association */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Foreign key to threat actor */
  @ForeignKey(() => ThreatActor)
  @AllowNull(false)
  @Index
  @Column(DataType.INTEGER)
  declare threat_actor_id: number;

  /** Foreign key to MITRE technique */
  @ForeignKey(() => MitreTechnique)
  @AllowNull(false)
  @Index
  @Column(DataType.INTEGER)
  declare technique_id: number;

  /** Foreign key to associated campaign (optional) */
  @ForeignKey(() => Campaign)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare campaign_id?: number;

  /** Proficiency level of threat actor with this technique */
  @AllowNull(false)
  @Default('unknown')
  @Column(DataType.ENUM('novice', 'intermediate', 'advanced', 'expert', 'unknown'))
  declare proficiency_level: ProficiencyLevel;

  /** Frequency of technique usage */
  @AllowNull(false)
  @Default('unknown')
  @Column(DataType.ENUM('rare', 'occasional', 'frequent', 'constant', 'unknown'))
  declare usage_frequency: UsageFrequency;

  /** Confidence level in this attribution */
  @AllowNull(false)
  @Default('medium')
  @Column(DataType.ENUM('low', 'medium', 'high', 'very_high'))
  declare confidence_level: ConfidenceLevel;

  /** First observed date for this association */
  @AllowNull(false)
  @Column(DataType.DATE)
  declare first_observed: Date;

  /** Last observed date for this association */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare last_observed?: Date;

  /** Source type of the intelligence */
  @AllowNull(false)
  @Default('unknown')
  @Column(DataType.ENUM('internal', 'commercial', 'open_source', 'government', 'partner', 'unknown'))
  declare source_type: SourceType;

  /** Specific source identifier or name */
  @AllowNull(true)
  @Length({ max: 255 })
  @Column(DataType.STRING(255))
  declare source_name?: string;

  /** Source reliability score (1-5 scale) */
  @AllowNull(true)
  @Validate({ min: 1, max: 5 })
  @Column(DataType.INTEGER)
  declare source_reliability?: number;

  /** Is this association currently active */
  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  /** Is this a suspected (unconfirmed) association */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_suspected: boolean;

  /** Custom tags for categorization */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** TTPs (Tactics, Techniques, and Procedures) context */
  @AllowNull(true)
  @Column(DataType.JSONB)
  declare ttp_context?: Record<string, any>;

  /** Mitigation measures observed */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare mitigations_observed: string[];

  /** Detection methods that identified this technique */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare detection_methods: string[];

  /** Indicators of Compromise associated with this technique usage */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare iocs: string[];

  /** Tools used in conjunction with this technique */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare associated_tools: string[];

  /** Malware families used with this technique */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare associated_malware: string[];

  /** Geographic regions where this technique was observed */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare geographic_regions: string[];

  /** Industry sectors targeted using this technique */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare target_sectors: string[];

  /** Operating systems targeted */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare target_platforms: string[];

  /** Attack phases where this technique is employed */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare attack_phases: string[];

  /** NIST Cybersecurity Framework functions impacted */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare nist_functions: string[];

  /** MITRE D3FEND countermeasures */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare d3fend_countermeasures: string[];

  /** Financial impact assessment (if available) */
  @AllowNull(true)
  @Validate({ min: 0 })
  @Column(DataType.DECIMAL(15, 2))
  declare financial_impact?: number;

  /** Operational impact assessment (1-5 scale) */
  @AllowNull(true)
  @Validate({ min: 1, max: 5 })
  @Column(DataType.INTEGER)
  declare operational_impact?: number;

  /** Reputational impact assessment (1-5 scale) */
  @AllowNull(true)
  @Validate({ min: 1, max: 5 })
  @Column(DataType.INTEGER)
  declare reputational_impact?: number;

  /** Success rate of this technique (percentage) */
  @AllowNull(true)
  @Validate({ min: 0, max: 100 })
  @Column(DataType.DECIMAL(5, 2))
  declare success_rate?: number;

  /** Detection rate by security controls (percentage) */
  @AllowNull(true)
  @Validate({ min: 0, max: 100 })
  @Column(DataType.DECIMAL(5, 2))
  declare detection_rate?: number;

  /** Number of observed incidents */
  @AllowNull(true)
  @Validate({ min: 0 })
  @Column(DataType.INTEGER)
  declare incident_count?: number;

  /** Number of affected organizations */
  @AllowNull(true)
  @Validate({ min: 0 })
  @Column(DataType.INTEGER)
  declare affected_organizations?: number;

  /** Average dwell time (in days) */
  @AllowNull(true)
  @Validate({ min: 0 })
  @Column(DataType.INTEGER)
  declare average_dwell_time?: number;

  /** Analyst notes and observations */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare analyst_notes?: string;

  /** External references and URLs */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare external_references: string[];

  /** STIX identifier if applicable */
  @AllowNull(true)
  @Unique
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare stix_id?: string;

  /** Custom metadata for extensibility */
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

  /** Soft delete timestamp */
  @DeletedAt
  @Column(DataType.DATE)
  declare deleted_at?: Date;

  // Association Definitions
  /** Associated threat actor */
  @BelongsTo(() => ThreatActor, {
    foreignKey: 'threat_actor_id',
    as: 'threat_actor',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare threat_actor?: ThreatActor;

  /** Associated MITRE technique */
  @BelongsTo(() => MitreTechnique, {
    foreignKey: 'technique_id',
    as: 'technique',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare technique?: MitreTechnique;

  /** Associated campaign */
  @BelongsTo(() => Campaign, {
    foreignKey: 'campaign_id',
    as: 'campaign',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare campaign?: Campaign;

  // Lifecycle Hooks
  @BeforeCreate
  static async validateBeforeCreate(instance: ThreatActorTechnique): Promise<void> {
    if (instance.last_observed && instance.last_observed < instance.first_observed) {
      throw new Error('Last observed date cannot be before first observed date');
    }
    
    if (instance.source_reliability && (instance.source_reliability < 1 || instance.source_reliability > 5)) {
      throw new Error('Source reliability must be between 1 and 5');
    }
  }

  @BeforeUpdate
  static async validateBeforeUpdate(instance: ThreatActorTechnique): Promise<void> {
    if (instance.last_observed && instance.last_observed < instance.first_observed) {
      throw new Error('Last observed date cannot be before first observed date');
    }
  }

  @AfterCreate
  static async logCreation(instance: ThreatActorTechnique): Promise<void> {
    console.log(`Created threat actor technique association: ${instance.id}`);
  }

  @AfterUpdate
  static async logUpdate(instance: ThreatActorTechnique): Promise<void> {
    console.log(`Updated threat actor technique association: ${instance.id}`);
  }

  @AfterDestroy
  static async logDestruction(instance: ThreatActorTechnique): Promise<void> {
    console.log(`Deleted threat actor technique association: ${instance.id}`);
  }

  // Instance Methods
  /**
   * Check if this association is currently active
   * @returns True if the association is active
   */
  public isActive(): boolean {
    return this.is_active && !this.deleted_at;
  }

  /**
   * Check if this is a suspected association
   * @returns True if the association is suspected/unconfirmed
   */
  public isSuspected(): boolean {
    return this.is_suspected;
  }

  /**
   * Check if this association is high confidence
   * @returns True if confidence level is high or very high
   */
  public isHighConfidence(): boolean {
    return ['high', 'very_high'].includes(this.confidence_level);
  }

  /**
   * Check if the threat actor is proficient with this technique
   * @returns True if proficiency is advanced or expert
   */
  public isProficient(): boolean {
    return ['advanced', 'expert'].includes(this.proficiency_level);
  }

  /**
   * Check if this technique is frequently used
   * @returns True if usage frequency is frequent or constant
   */
  public isFrequentlyUsed(): boolean {
    return ['frequent', 'constant'].includes(this.usage_frequency);
  }

  /**
   * Calculate the risk score for this association
   * @returns Risk score between 0 and 100
   */
  public calculateRiskScore(): number {
    let score = 0;
    
    // Proficiency level scoring
    const proficiencyScores = { novice: 10, intermediate: 25, advanced: 40, expert: 50, unknown: 20 };
    score += proficiencyScores[this.proficiency_level] || 20;
    
    // Usage frequency scoring
    const frequencyScores = { rare: 5, occasional: 15, frequent: 30, constant: 40, unknown: 15 };
    score += frequencyScores[this.usage_frequency] || 15;
    
    // Confidence level scoring
    const confidenceScores = { low: 5, medium: 10, high: 15, very_high: 20 };
    score += confidenceScores[this.confidence_level] || 10;
    
    // Active status bonus
    if (this.is_active) score += 10;
    
    // High-value target sectors bonus
    const highValueSectors = ['finance', 'healthcare', 'government', 'defense', 'energy'];
    if (this.target_sectors.some(sector => highValueSectors.includes(sector.toLowerCase()))) {
      score += 15;
    }
    
    // Recent activity bonus
    if (this.last_observed && this.getDaysSinceLastObserved() < 90) {
      score += 10;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get the threat level based on risk score
   * @returns Threat level classification
   */
  public getThreatLevel(): 'low' | 'medium' | 'high' | 'critical' {
    const riskScore = this.calculateRiskScore();
    
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  /**
   * Get days since first observed
   * @returns Number of days since first observation
   */
  public getDaysSinceFirstObserved(): number {
    const diffTime = new Date().getTime() - this.first_observed.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days since last observed
   * @returns Number of days since last observation, or null if never observed again
   */
  public getDaysSinceLastObserved(): number | null {
    if (!this.last_observed) return null;
    const diffTime = new Date().getTime() - this.last_observed.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if association has specific tag
   * @param tag Tag to check for
   * @returns True if tag exists
   */
  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Add a tag to the association
   * @param tag Tag to add
   * @returns Promise resolving to updated instance
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a tag from the association
   * @param tag Tag to remove
   * @returns Promise resolving to updated instance
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  /**
   * Update proficiency level
   * @param level New proficiency level
   * @returns Promise resolving to updated instance
   */
  public async updateProficiency(level: ProficiencyLevel): Promise<this> {
    this.proficiency_level = level;
    return this.save();
  }

  /**
   * Update usage frequency
   * @param frequency New usage frequency
   * @returns Promise resolving to updated instance
   */
  public async updateFrequency(frequency: UsageFrequency): Promise<this> {
    this.usage_frequency = frequency;
    return this.save();
  }

  /**
   * Update confidence level
   * @param confidence New confidence level
   * @returns Promise resolving to updated instance
   */
  public async updateConfidence(confidence: ConfidenceLevel): Promise<this> {
    this.confidence_level = confidence;
    return this.save();
  }

  /**
   * Mark as last observed
   * @param date Date of last observation (defaults to now)
   * @returns Promise resolving to updated instance
   */
  public async updateLastObserved(date: Date = new Date()): Promise<this> {
    this.last_observed = date;
    return this.save();
  }

  /**
   * Add IoC to the association
   * @param ioc Indicator of Compromise to add
   * @returns Promise resolving to updated instance
   */
  public async addIoC(ioc: string): Promise<this> {
    if (!this.iocs.includes(ioc)) {
      this.iocs = [...this.iocs, ioc];
      return this.save();
    }
    return this;
  }

  /**
   * Add multiple IoCs to the association
   * @param iocs Array of IoCs to add
   * @returns Promise resolving to updated instance
   */
  public async addIoCs(iocs: string[]): Promise<this> {
    const newIocs = iocs.filter(ioc => !this.iocs.includes(ioc));
    if (newIocs.length > 0) {
      this.iocs = [...this.iocs, ...newIocs];
      return this.save();
    }
    return this;
  }

  /**
   * Get formatted summary of the association
   * @returns Human-readable summary
   */
  public getSummary(): string {
    return `Threat Actor ${this.threat_actor_id} uses Technique ${this.technique_id} ` +
           `(Proficiency: ${this.proficiency_level}, Frequency: ${this.usage_frequency}, ` +
           `Confidence: ${this.confidence_level}, Risk Score: ${this.calculateRiskScore()})`;
  }

  // Static Methods and Query Helpers
  /**
   * Find associations by threat actor ID
   * @param threatActorId Threat actor identifier
   * @param options Additional query options
   * @returns Promise resolving to associations array
   */
  static async findByThreatActor(
    threatActorId: number,
    options: Omit<FindOptions<ThreatActorTechniqueAttributes>, 'where'> = {}
  ): Promise<ThreatActorTechnique[]> {
    return this.findAll({
      where: { threat_actor_id: threatActorId },
      order: [['confidence_level', 'DESC'], ['first_observed', 'DESC']],
      ...options
    });
  }

  /**
   * Find associations by technique ID
   * @param techniqueId Technique identifier
   * @param options Additional query options
   * @returns Promise resolving to associations array
   */
  static async findByTechnique(
    techniqueId: number,
    options: Omit<FindOptions<ThreatActorTechniqueAttributes>, 'where'> = {}
  ): Promise<ThreatActorTechnique[]> {
    return this.findAll({
      where: { technique_id: techniqueId },
      order: [['confidence_level', 'DESC'], ['first_observed', 'DESC']],
      ...options
    });
  }

  /**
   * Find associations by campaign ID
   * @param campaignId Campaign identifier
   * @param options Additional query options
   * @returns Promise resolving to associations array
   */
  static async findByCampaign(
    campaignId: number,
    options: Omit<FindOptions<ThreatActorTechniqueAttributes>, 'where'> = {}
  ): Promise<ThreatActorTechnique[]> {
    return this.findAll({
      where: { campaign_id: campaignId },
      order: [['first_observed', 'DESC']],
      ...options
    });
  }

  /**
   * Find associations by proficiency level
   * @param level Proficiency level to filter by
   * @returns Promise resolving to associations array
   */
  static async findByProficiency(level: ProficiencyLevel): Promise<ThreatActorTechnique[]> {
    return this.findAll({
      where: { proficiency_level: level },
      order: [['first_observed', 'DESC']]
    });
  }

  /**
   * Find associations by usage frequency
   * @param frequency Usage frequency to filter by
   * @returns Promise resolving to associations array
   */
  static async findByFrequency(frequency: UsageFrequency): Promise<ThreatActorTechnique[]> {
    return this.findAll({
      where: { usage_frequency: frequency },
      order: [['first_observed', 'DESC']]
    });
  }

  /**
   * Find associations by confidence level
   * @param confidence Confidence level to filter by
   * @returns Promise resolving to associations array
   */
  static async findByConfidence(confidence: ConfidenceLevel): Promise<ThreatActorTechnique[]> {
    return this.findAll({
      where: { confidence_level: confidence },
      order: [['first_observed', 'DESC']]
    });
  }

  /**
   * Find all active associations
   * @returns Promise resolving to active associations
   */
  static async findActive(): Promise<ThreatActorTechnique[]> {
    return this.findAll({
      where: { is_active: true },
      order: [['confidence_level', 'DESC'], ['first_observed', 'DESC']]
    });
  }

  /**
   * Find all suspected associations
   * @returns Promise resolving to suspected associations
   */
  static async findSuspected(): Promise<ThreatActorTechnique[]> {
    return this.findAll({
      where: { is_suspected: true },
      order: [['confidence_level', 'ASC'], ['first_observed', 'DESC']]
    });
  }

  /**
   * Find high-confidence associations
   * @returns Promise resolving to high-confidence associations
   */
  static async findHighConfidence(): Promise<ThreatActorTechnique[]> {
    return this.findAll({
      where: { confidence_level: { [Op.in]: ['high', 'very_high'] } },
      order: [['confidence_level', 'DESC'], ['first_observed', 'DESC']]
    });
  }

  /**
   * Find recently observed associations
   * @param days Number of days to look back
   * @returns Promise resolving to recent associations
   */
  static async findRecentlyObserved(days: number = 30): Promise<ThreatActorTechnique[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        [Op.or]: [
          { first_observed: { [Op.gte]: cutoffDate } },
          { last_observed: { [Op.gte]: cutoffDate } }
        ]
      },
      order: [['last_observed', 'DESC'], ['first_observed', 'DESC']]
    });
  }

  /**
   * Get statistical summary of all associations
   * @returns Promise resolving to statistics object
   */
  static async getStatistics(): Promise<ThreatActorTechniqueStats> {
    const totalCount = await this.count();
    const activeCount = await this.count({ where: { is_active: true } });
    const suspectedCount = await this.count({ where: { is_suspected: true } });

    // Get proficiency distribution
    const proficiencyResults = await this.findAll({
      attributes: [
        'proficiency_level',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['proficiency_level']
    });

    const proficiencyDistribution = proficiencyResults.reduce((acc, result) => {
      acc[result.proficiency_level] = parseInt((result as any).getDataValue('count'));
      return acc;
    }, {} as Record<ProficiencyLevel, number>);

    // Get frequency distribution
    const frequencyResults = await this.findAll({
      attributes: [
        'usage_frequency',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['usage_frequency']
    });

    const frequencyDistribution = frequencyResults.reduce((acc, result) => {
      acc[result.usage_frequency] = parseInt((result as any).getDataValue('count'));
      return acc;
    }, {} as Record<UsageFrequency, number>);

    // Get confidence distribution
    const confidenceResults = await this.findAll({
      attributes: [
        'confidence_level',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['confidence_level']
    });

    const confidenceDistribution = confidenceResults.reduce((acc, result) => {
      acc[result.confidence_level] = parseInt((result as any).getDataValue('count'));
      return acc;
    }, {} as Record<ConfidenceLevel, number>);

    // Get source distribution
    const sourceResults = await this.findAll({
      attributes: [
        'source_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['source_type']
    });

    const sourceDistribution = sourceResults.reduce((acc, result) => {
      acc[result.source_type] = parseInt((result as any).getDataValue('count'));
      return acc;
    }, {} as Record<SourceType, number>);

    // Calculate average confidence
    const confidenceScores = { low: 1, medium: 2, high: 3, very_high: 4 };
    const totalConfidenceScore = Object.entries(confidenceDistribution)
      .reduce((sum, [level, count]) => sum + (confidenceScores[level as ConfidenceLevel] * count), 0);
    const averageConfidence = totalCount > 0 ? totalConfidenceScore / totalCount : 0;

    // Get most common tags
    const tagResults = await this.findAll({
      attributes: [
        [this.sequelize!.fn('unnest', this.sequelize!.col('tags')), 'tag'],
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: [this.sequelize!.fn('unnest', this.sequelize!.col('tags'))],
      raw: true,
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']],
      limit: 10
    });

    const mostCommonTags = tagResults.map(result => ({
      tag: (result as any).getDataValue('tag'),
      count: parseInt((result as any).getDataValue('count'))
    })).filter(item => item.tag);

    // Get geographic coverage
    const geoResults = await this.findAll({
      attributes: [
        [this.sequelize!.fn('unnest', this.sequelize!.col('geographic_regions')), 'region']
      ],
      group: [this.sequelize!.fn('unnest', this.sequelize!.col('geographic_regions'))],
      order: [[this.sequelize!.fn('unnest', this.sequelize!.col('geographic_regions')), 'ASC']]
    });

    const geographicCoverage = geoResults.map(r => (r as any).getDataValue('region')).filter(Boolean);

    // Get sector coverage
    const sectorResults = await this.findAll({
      attributes: [
        [this.sequelize!.fn('unnest', this.sequelize!.col('target_sectors')), 'sector']
      ],
      group: [this.sequelize!.fn('unnest', this.sequelize!.col('target_sectors'))],
      order: [[this.sequelize!.fn('unnest', this.sequelize!.col('target_sectors')), 'ASC']]
    });

    const sectorCoverage = sectorResults.map(r => (r as any).getDataValue('sector')).filter(Boolean);

    return {
      total_associations: totalCount,
      active_associations: activeCount,
      suspected_associations: suspectedCount,
      proficiency_distribution: proficiencyDistribution,
      frequency_distribution: frequencyDistribution,
      confidence_distribution: confidenceDistribution,
      source_distribution: sourceDistribution,
      average_confidence: Math.round(averageConfidence * 100) / 100,
      most_common_tags: mostCommonTags,
      geographic_coverage: geographicCoverage,
      sector_coverage: sectorCoverage
    };
  }

  /**
   * Create association with validation
   * @param data Association data
   * @param transaction Optional database transaction
   * @returns Promise resolving to created association
   */
  static async createAssociation(
    data: ThreatActorTechniqueCreationAttributes,
    transaction?: Transaction | null
  ): Promise<ThreatActorTechnique> {
    // Check for existing association
    const existing = await this.findOne({
      where: {
        threat_actor_id: data.threat_actor_id,
        technique_id: data.technique_id
      },
      ...(transaction && { transaction })
    });

    if (existing) {
      throw new Error('Association between this threat actor and technique already exists');
    }

    return this.create(data, transaction ? { transaction } : undefined);
  }

  /**
   * Bulk import associations
   * @param associations Array of association data
   * @returns Promise resolving to import results
   */
  static async bulkImport(associations: ThreatActorTechniqueCreationAttributes[]): Promise<{
    created: number;
    updated: number;
    errors: string[];
  }> {
    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const assocData of associations) {
      try {
        const existing = await this.findOne({
          where: {
            threat_actor_id: assocData.threat_actor_id,
            technique_id: assocData.technique_id
          }
        });

        if (existing) {
          await existing.update(assocData);
          results.updated++;
        } else {
          await this.create(assocData);
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Failed to process association ${assocData.threat_actor_id}-${assocData.technique_id}: ${error}`);
      }
    }

    return results;
  }

  // Scoped Queries
  /**
   * Default scope excluding soft-deleted records
   */
  static readonly scopes = {
    active: {
      where: { is_active: true }
    },
    suspected: {
      where: { is_suspected: true }
    },
    confirmed: {
      where: { is_suspected: false }
    },
    highConfidence: {
      where: { confidence_level: { [Op.in]: ['high', 'very_high'] } }
    },
    recent: {
      where: {
        first_observed: {
          [Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
        }
      }
    },
    withRelations: {
      include: [
        { model: ThreatActor, as: 'threat_actor' },
        { model: MitreTechnique, as: 'technique' },
        { model: Campaign, as: 'campaign' }
      ]
    }
  };
}

export default ThreatActorTechnique;
