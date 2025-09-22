/**
 * THREAT GROUP SEQUELIZE MODEL
 * Comprehensive model for threat actor groups, clusters, and organized cybercriminal entities
 * 
 * This model represents sophisticated threat actor groups, nation-state APTs, cybercriminal
 * organizations, and other organized threat entities. It provides detailed tracking of group
 * characteristics, relationships, capabilities, and activities with full type safety and
 * comprehensive analysis capabilities.
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
  HasMany,
  BelongsToMany,
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
  AfterDestroy,
  BeforeDestroy
} from 'sequelize-typescript';
import { Optional, Op, WhereOptions, FindOptions, Transaction } from 'sequelize';
import { ThreatActor } from './ThreatActor.model';
import { Campaign } from './Campaign.model';
import { MitreTechnique } from './MitreTechnique.model';
import { ThreatActorTechnique } from './ThreatActorTechnique.model';

/**
 * Sophistication levels for threat groups
 * Indicates the technical and operational sophistication of the group
 */
export type SophisticationLevel = 'minimal' | 'intermediate' | 'advanced' | 'expert' | 'nation_state';

/**
 * Group types categorizing different threat actor organizations
 * Classification of threat groups by organizational structure and purpose
 */
export type GroupType = 
  | 'apt' 
  | 'cybercriminal' 
  | 'hacktivist' 
  | 'insider' 
  | 'nation_state' 
  | 'terrorist' 
  | 'unknown';

/**
 * Activity levels indicating current operational status
 * Tracks the current activity and operational tempo of threat groups
 */
export type ActivityLevel = 'dormant' | 'low' | 'moderate' | 'high' | 'very_high' | 'unknown';

/**
 * Resource levels indicating group capabilities and funding
 * Assessment of available resources and operational capacity
 */
export type ResourceLevel = 'limited' | 'moderate' | 'substantial' | 'extensive' | 'state_sponsored';

/**
 * Threat Group Attributes Interface
 * Defines all possible attributes for threat group entities
 */
export interface ThreatGroupAttributes {
  /** Unique identifier for the threat group */
  id: number;
  
  /** Primary name of the threat group */
  group_name: string;
  
  /** Detailed description of the group */
  description?: string;
  
  /** Alternative names and aliases */
  aliases: string[];
  
  /** Other groups associated or linked to this group */
  associated_groups: string[];
  
  /** Country or region of origin */
  origin_country?: string;
  
  /** List of countries where the group operates */
  operating_countries: string[];
  
  /** Primary motivations driving the group */
  motivations: string[];
  
  /** Industries and sectors targeted by the group */
  target_sectors: string[];
  
  /** Geographic regions targeted */
  target_regions: string[];
  
  /** Types of victims typically targeted */
  victim_types: string[];
  
  /** Technical sophistication level of the group */
  sophistication_level: SophisticationLevel;
  
  /** Type/category of the threat group */
  group_type: GroupType;
  
  /** Current activity level assessment */
  activity_level: ActivityLevel;
  
  /** Resource level assessment */
  resource_level: ResourceLevel;
  
  /** Languages used by the group */
  languages: string[];
  
  /** Time zones where the group primarily operates */
  operational_timezones: string[];
  
  /** Estimated number of active members */
  estimated_size?: number;
  
  /** Year the group was first observed */
  first_observed_year?: number;
  
  /** Date of first observed activity */
  first_observed?: Date;
  
  /** Date of most recent observed activity */
  last_observed?: Date;
  
  /** Whether the group is currently active */
  is_active: boolean;
  
  /** Whether this is a confirmed group or suspected */
  is_suspected: boolean;
  
  /** Whether the group is state-sponsored */
  is_state_sponsored: boolean;
  
  /** Whether the group operates as a service provider */
  is_service_provider: boolean;
  
  /** Attack vectors commonly used by the group */
  attack_vectors: string[];
  
  /** Primary tools and malware used */
  primary_tools: string[];
  
  /** Malware families associated with the group */
  malware_families: string[];
  
  /** Infrastructure indicators associated with the group */
  infrastructure_indicators: string[];
  
  /** Communication methods used by the group */
  communication_methods: string[];
  
  /** Recruitment methods employed */
  recruitment_methods: string[];
  
  /** Financial model and monetization strategies */
  financial_model: string[];
  
  /** Operational patterns and tactics */
  operational_patterns: string[];
  
  /** Attribution confidence level (1-5) */
  attribution_confidence: number;
  
  /** Threat score assessment (1-100) */
  threat_score?: number;
  
  /** Impact assessment score (1-100) */
  impact_score?: number;
  
  /** Number of confirmed campaigns attributed */
  campaign_count: number;
  
  /** Number of confirmed victims */
  victim_count?: number;
  
  /** Estimated financial damage caused */
  estimated_damage?: number;
  
  /** MITRE ATT&CK group identifier */
  mitre_id?: string;
  
  /** STIX identifier if applicable */
  stix_id?: string;
  
  /** External identifiers from other systems */
  external_ids: Record<string, string>;
  
  /** Detailed group profile and characteristics */
  group_profile: Record<string, any>;
  
  /** Intelligence sources for this group */
  intelligence_sources: string[];
  
  /** External references and documentation */
  external_references: string[];
  
  /** Custom tags for categorization */
  tags: string[];
  
  /** Relationships with other groups */
  group_relationships: Record<string, any>;
  
  /** Historical timeline of major events */
  timeline_events: Array<{
    date: Date;
    event: string;
    description: string;
    source: string;
  }>;
  
  /** Assessment notes from analysts */
  analyst_notes?: string;
  
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
 * Threat Group Creation Attributes Interface
 * Defines required and optional attributes for creating new threat groups
 */
export interface ThreatGroupCreationAttributes extends Optional<ThreatGroupAttributes,
  'id' | 'description' | 'origin_country' | 'estimated_size' | 'first_observed_year' |
  'first_observed' | 'last_observed' | 'threat_score' | 'impact_score' | 'victim_count' |
  'estimated_damage' | 'mitre_id' | 'stix_id' | 'analyst_notes' | 'created_at' | 
  'updated_at' | 'deleted_at'
> {}

/**
 * Group Statistics Interface
 * Aggregated statistics for threat group analysis
 */
export interface ThreatGroupStats {
  total_groups: number;
  active_groups: number;
  suspected_groups: number;
  state_sponsored_groups: number;
  sophistication_distribution: Record<SophisticationLevel, number>;
  type_distribution: Record<GroupType, number>;
  activity_distribution: Record<ActivityLevel, number>;
  resource_distribution: Record<ResourceLevel, number>;
  top_origin_countries: Array<{ country: string; count: number }>;
  top_target_sectors: Array<{ sector: string; count: number }>;
  average_threat_score: number;
  average_attribution_confidence: number;
  recent_activity_trends: Array<{ period: string; active_groups: number }>;
}

/**
 * Group Analysis Interface
 * Comprehensive analysis results for threat groups
 */
export interface GroupAnalysis {
  group: ThreatGroup;
  threat_assessment: {
    overall_threat: 'low' | 'medium' | 'high' | 'critical';
    capability_score: number;
    activity_score: number;
    impact_potential: number;
  };
  attribution_analysis: {
    confidence_level: number;
    supporting_evidence: string[];
    contradictory_evidence: string[];
    attribution_timeline: Array<{
      date: Date;
      confidence: number;
      reason: string;
    }>;
  };
  relationship_analysis: {
    affiliated_groups: ThreatGroup[];
    competing_groups: ThreatGroup[];
    shared_infrastructure: string[];
    shared_tools: string[];
  };
  activity_analysis: {
    campaign_timeline: Array<{
      date: Date;
      campaign: string;
      targets: string[];
    }>;
    geographic_activity: Record<string, number>;
    sector_targeting: Record<string, number>;
  };
  recommendations: {
    defensive_measures: string[];
    monitoring_priorities: string[];
    intelligence_gaps: string[];
  };
}

/**
 * Group Comparison Interface
 * Structure for comparing multiple threat groups
 */
export interface GroupComparison {
  groups: ThreatGroup[];
  similarities: {
    shared_techniques: string[];
    similar_targets: string[];
    overlapping_infrastructure: string[];
    common_tools: string[];
  };
  differences: {
    unique_techniques: Record<string, string[]>;
    different_motivations: Record<string, string[]>;
    distinct_capabilities: Record<string, string[]>;
  };
  relationship_score: number;
  potential_connections: string[];
}

/**
 * Threat Group Model Class
 * Comprehensive model for threat actor groups and organizations
 */
@Table({
  tableName: 'threat_groups',
  timestamps: true,
  underscored: true,
  paranoid: true,
  version: true,
  indexes: [
    { fields: ['group_name'] },
    { fields: ['group_type'] },
    { fields: ['sophistication_level'] },
    { fields: ['activity_level'] },
    { fields: ['origin_country'] },
    { fields: ['is_active'] },
    { fields: ['is_suspected'] },
    { fields: ['is_state_sponsored'] },
    { fields: ['attribution_confidence'] },
    { fields: ['threat_score'] },
    { fields: ['aliases'], using: 'gin' },
    { fields: ['motivations'], using: 'gin' },
    { fields: ['target_sectors'], using: 'gin' },
    { fields: ['target_regions'], using: 'gin' },
    { fields: ['operating_countries'], using: 'gin' },
    { fields: ['tags'], using: 'gin' },
    { fields: ['first_observed'] },
    { fields: ['last_observed'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
    { fields: ['mitre_id'], unique: true, where: { mitre_id: { [Op.ne]: null } } },
    { fields: ['stix_id'], unique: true, where: { stix_id: { [Op.ne]: null } } }
  ]
})
export class ThreatGroup extends Model<ThreatGroupAttributes, ThreatGroupCreationAttributes>
  implements ThreatGroupAttributes {

  /** Unique identifier for the threat group */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Primary name of the threat group */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare group_name: string;

  /** Detailed description of the group */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Alternative names and aliases */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare aliases: string[];

  /** Other groups associated or linked to this group */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare associated_groups: string[];

  /** Country or region of origin */
  @AllowNull(true)
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare origin_country?: string;

  /** List of countries where the group operates */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare operating_countries: string[];

  /** Primary motivations driving the group */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare motivations: string[];

  /** Industries and sectors targeted by the group */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare target_sectors: string[];

  /** Geographic regions targeted */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare target_regions: string[];

  /** Types of victims typically targeted */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare victim_types: string[];

  /** Technical sophistication level of the group */
  @AllowNull(false)
  @Default('intermediate')
  @Column(DataType.ENUM('minimal', 'intermediate', 'advanced', 'expert', 'nation_state'))
  declare sophistication_level: SophisticationLevel;

  /** Type/category of the threat group */
  @AllowNull(false)
  @Default('unknown')
  @Column(DataType.ENUM('apt', 'cybercriminal', 'hacktivist', 'insider', 'nation_state', 'terrorist', 'unknown'))
  declare group_type: GroupType;

  /** Current activity level assessment */
  @AllowNull(false)
  @Default('unknown')
  @Column(DataType.ENUM('dormant', 'low', 'moderate', 'high', 'very_high', 'unknown'))
  declare activity_level: ActivityLevel;

  /** Resource level assessment */
  @AllowNull(false)
  @Default('moderate')
  @Column(DataType.ENUM('limited', 'moderate', 'substantial', 'extensive', 'state_sponsored'))
  declare resource_level: ResourceLevel;

  /** Languages used by the group */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare languages: string[];

  /** Time zones where the group primarily operates */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare operational_timezones: string[];

  /** Estimated number of active members */
  @AllowNull(true)
  @Validate({ min: 1 })
  @Column(DataType.INTEGER)
  declare estimated_size?: number;

  /** Year the group was first observed */
  @AllowNull(true)
  @Validate({ min: 1980, max: new Date().getFullYear() })
  @Column(DataType.INTEGER)
  declare first_observed_year?: number;

  /** Date of first observed activity */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare first_observed?: Date;

  /** Date of most recent observed activity */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare last_observed?: Date;

  /** Whether the group is currently active */
  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  /** Whether this is a confirmed group or suspected */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_suspected: boolean;

  /** Whether the group is state-sponsored */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_state_sponsored: boolean;

  /** Whether the group operates as a service provider */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_service_provider: boolean;

  /** Attack vectors commonly used by the group */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare attack_vectors: string[];

  /** Primary tools and malware used */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare primary_tools: string[];

  /** Malware families associated with the group */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare malware_families: string[];

  /** Infrastructure indicators associated with the group */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare infrastructure_indicators: string[];

  /** Communication methods used by the group */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare communication_methods: string[];

  /** Recruitment methods employed */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare recruitment_methods: string[];

  /** Financial model and monetization strategies */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare financial_model: string[];

  /** Operational patterns and tactics */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare operational_patterns: string[];

  /** Attribution confidence level (1-5) */
  @AllowNull(false)
  @Default(3)
  @Validate({ min: 1, max: 5 })
  @Column(DataType.INTEGER)
  declare attribution_confidence: number;

  /** Threat score assessment (1-100) */
  @AllowNull(true)
  @Validate({ min: 1, max: 100 })
  @Column(DataType.INTEGER)
  declare threat_score?: number;

  /** Impact assessment score (1-100) */
  @AllowNull(true)
  @Validate({ min: 1, max: 100 })
  @Column(DataType.INTEGER)
  declare impact_score?: number;

  /** Number of confirmed campaigns attributed */
  @AllowNull(false)
  @Default(0)
  @Validate({ min: 0 })
  @Column(DataType.INTEGER)
  declare campaign_count: number;

  /** Number of confirmed victims */
  @AllowNull(true)
  @Validate({ min: 0 })
  @Column(DataType.INTEGER)
  declare victim_count?: number;

  /** Estimated financial damage caused */
  @AllowNull(true)
  @Validate({ min: 0 })
  @Column(DataType.DECIMAL(15, 2))
  declare estimated_damage?: number;

  /** MITRE ATT&CK group identifier */
  @AllowNull(true)
  @Unique
  @Length({ max: 50 })
  @Column(DataType.STRING(50))
  declare mitre_id?: string;

  /** STIX identifier if applicable */
  @AllowNull(true)
  @Unique
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare stix_id?: string;

  /** External identifiers from other systems */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare external_ids: Record<string, string>;

  /** Detailed group profile and characteristics */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare group_profile: Record<string, any>;

  /** Intelligence sources for this group */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare intelligence_sources: string[];

  /** External references and documentation */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare external_references: string[];

  /** Custom tags for categorization */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Relationships with other groups */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare group_relationships: Record<string, any>;

  /** Historical timeline of major events */
  @AllowNull(false)
  @Default([])
  @Column(DataType.JSONB)
  declare timeline_events: Array<{
    date: Date;
    event: string;
    description: string;
    source: string;
  }>;

  /** Assessment notes from analysts */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare analyst_notes?: string;

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
  /** Threat actors belonging to this group */
  @HasMany(() => ThreatActor, {
    foreignKey: 'group_id',
    as: 'threat_actors',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare threat_actors?: ThreatActor[];

  /** Campaigns attributed to this group */
  @HasMany(() => Campaign, {
    foreignKey: 'group_id',
    as: 'campaigns',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare campaigns?: Campaign[];

  /** Techniques used by this group via threat actors */
  @BelongsToMany(() => MitreTechnique, () => ThreatActorTechnique, 'group_id', 'technique_id')
  declare techniques?: MitreTechnique[];

  // Lifecycle Hooks
  @BeforeCreate
  static async validateBeforeCreate(instance: ThreatGroup): Promise<void> {
    // Validate observation dates
    if (instance.first_observed && instance.last_observed && 
        instance.last_observed < instance.first_observed) {
      throw new Error('Last observed date cannot be before first observed date');
    }

    // Validate first observed year matches date
    if (instance.first_observed && instance.first_observed_year &&
        instance.first_observed.getFullYear() !== instance.first_observed_year) {
      throw new Error('First observed year must match first observed date');
    }

    // Auto-calculate threat score if not provided
    if (!instance.threat_score) {
      instance.threat_score = instance.calculateThreatScore();
    }
  }

  @BeforeUpdate
  static async validateBeforeUpdate(instance: ThreatGroup): Promise<void> {
    // Validate observation dates
    if (instance.first_observed && instance.last_observed && 
        instance.last_observed < instance.first_observed) {
      throw new Error('Last observed date cannot be before first observed date');
    }

    // Update activity status based on last observed date
    if (instance.last_observed) {
      const daysSinceActivity = instance.getDaysSinceLastActivity();
      if (daysSinceActivity !== null && daysSinceActivity > 365) {
        instance.activity_level = 'dormant';
      }
    }
  }

  @BeforeDestroy
  static async handleDependencies(instance: ThreatGroup): Promise<void> {
    // Log the archival for audit purposes
    console.log(`Archiving threat group: ${instance.id} - ${instance.group_name}`);
    
    // Update related entities to remove group association
    // Note: This assumes ThreatActor has a group_id field - adjust based on actual schema
    console.log(`Updating related threat actors for group ${instance.id}`);
  }

  @AfterCreate
  static async logCreation(instance: ThreatGroup): Promise<void> {
    console.log(`Created threat group: ${instance.id} - ${instance.group_name}`);
  }

  @AfterUpdate
  static async logUpdate(instance: ThreatGroup): Promise<void> {
    console.log(`Updated threat group: ${instance.id} - ${instance.group_name}`);
  }

  @AfterDestroy
  static async logDestruction(instance: ThreatGroup): Promise<void> {
    console.log(`Deleted threat group: ${instance.id} - ${instance.group_name}`);
  }

  // Instance Methods
  /**
   * Check if this group is currently active
   * @returns True if the group is active and not archived
   */
  public isCurrentlyActive(): boolean {
    return this.is_active && !this.deleted_at;
  }

  /**
   * Check if this is a suspected group (unconfirmed)
   * @returns True if the group is suspected/unconfirmed
   */
  public isSuspected(): boolean {
    return this.is_suspected;
  }

  /**
   * Check if this group is state-sponsored
   * @returns True if confirmed or likely state-sponsored
   */
  public isStateSponsored(): boolean {
    return this.is_state_sponsored || this.group_type === 'nation_state';
  }

  /**
   * Check if attribution confidence is high
   * @returns True if attribution confidence is 4 or 5
   */
  public isHighConfidence(): boolean {
    return this.attribution_confidence >= 4;
  }

  /**
   * Check if the group is highly sophisticated
   * @returns True if sophistication is advanced, expert, or nation_state
   */
  public isHighlySophisticated(): boolean {
    return ['advanced', 'expert', 'nation_state'].includes(this.sophistication_level);
  }

  /**
   * Calculate threat score based on various factors
   * @returns Calculated threat score (1-100)
   */
  public calculateThreatScore(): number {
    let score = 0;

    // Sophistication level contribution (30%)
    const sophisticationScores = {
      minimal: 10, intermediate: 25, advanced: 40, expert: 55, nation_state: 70
    };
    score += sophisticationScores[this.sophistication_level] || 25;

    // Activity level contribution (20%)
    const activityScores = {
      dormant: 0, low: 5, moderate: 10, high: 15, very_high: 20, unknown: 8
    };
    score += activityScores[this.activity_level] || 8;

    // Resource level contribution (15%)
    const resourceScores = {
      limited: 3, moderate: 6, substantial: 9, extensive: 12, state_sponsored: 15
    };
    score += resourceScores[this.resource_level] || 6;

    // Group type contribution (15%)
    const typeScores = {
      apt: 12, nation_state: 15, cybercriminal: 10, hacktivist: 8, 
      insider: 7, terrorist: 9, unknown: 5
    };
    score += typeScores[this.group_type] || 5;

    // Attribution confidence bonus (10%)
    score += this.attribution_confidence * 2;

    // Campaign count contribution (5%)
    score += Math.min(this.campaign_count, 5);

    // State sponsorship bonus (5%)
    if (this.is_state_sponsored) score += 5;

    return Math.min(100, Math.max(1, Math.round(score)));
  }

  /**
   * Get threat level classification
   * @returns Threat level based on calculated score
   */
  public getThreatLevel(): 'low' | 'medium' | 'high' | 'critical' {
    const score = this.threat_score || this.calculateThreatScore();
    
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  /**
   * Get days since last activity
   * @returns Number of days since last observed activity, null if never observed
   */
  public getDaysSinceLastActivity(): number | null {
    if (!this.last_observed) return null;
    const diffTime = new Date().getTime() - this.last_observed.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get operational lifespan in years
   * @returns Number of years the group has been operational
   */
  public getOperationalLifespan(): number | null {
    if (!this.first_observed) return null;
    const endDate = this.last_observed || new Date();
    const diffTime = endDate.getTime() - this.first_observed.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
  }

  /**
   * Check if group has specific alias
   * @param alias Alias to check for
   * @returns True if alias exists
   */
  public hasAlias(alias: string): boolean {
    return this.aliases.some(a => a.toLowerCase() === alias.toLowerCase());
  }

  /**
   * Add alias to the group
   * @param alias Alias to add
   * @returns Promise resolving to updated instance
   */
  public async addAlias(alias: string): Promise<this> {
    if (!this.hasAlias(alias)) {
      this.aliases = [...this.aliases, alias];
      return this.save();
    }
    return this;
  }

  /**
   * Remove alias from the group
   * @param alias Alias to remove
   * @returns Promise resolving to updated instance
   */
  public async removeAlias(alias: string): Promise<this> {
    this.aliases = this.aliases.filter(a => a.toLowerCase() !== alias.toLowerCase());
    return this.save();
  }

  /**
   * Check if group has specific tag
   * @param tag Tag to check for
   * @returns True if tag exists
   */
  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Add tag to the group
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
   * Remove tag from the group
   * @param tag Tag to remove
   * @returns Promise resolving to updated instance
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  /**
   * Update activity level
   * @param level New activity level
   * @returns Promise resolving to updated instance
   */
  public async updateActivityLevel(level: ActivityLevel): Promise<this> {
    this.activity_level = level;
    this.last_observed = new Date();
    return this.save();
  }

  /**
   * Update sophistication level
   * @param level New sophistication level
   * @returns Promise resolving to updated instance
   */
  public async updateSophisticationLevel(level: SophisticationLevel): Promise<this> {
    this.sophistication_level = level;
    // Recalculate threat score
    this.threat_score = this.calculateThreatScore();
    return this.save();
  }

  /**
   * Mark as confirmed (remove suspected status)
   * @returns Promise resolving to updated instance
   */
  public async markAsConfirmed(): Promise<this> {
    this.is_suspected = false;
    this.attribution_confidence = Math.max(this.attribution_confidence, 4);
    return this.save();
  }

  /**
   * Add timeline event
   * @param event Event details
   * @returns Promise resolving to updated instance
   */
  public async addTimelineEvent(event: {
    date: Date;
    event: string;
    description: string;
    source: string;
  }): Promise<this> {
    this.timeline_events = [...this.timeline_events, event];
    return this.save();
  }

  /**
   * Get formatted summary
   * @returns Human-readable summary
   */
  public getSummary(): string {
    const aliases = this.aliases.length > 0 ? ` (${this.aliases.join(', ')})` : '';
    return `${this.group_name}${aliases} - ${this.group_type.toUpperCase()} ` +
           `(${this.sophistication_level}, Activity: ${this.activity_level}, ` +
           `Threat Score: ${this.threat_score || this.calculateThreatScore()})`;
  }

  // Static Methods and Query Helpers
  /**
   * Find groups by type
   * @param groupType Type of group to filter by
   * @returns Promise resolving to groups array
   */
  static async findByType(groupType: GroupType): Promise<ThreatGroup[]> {
    return this.findAll({
      where: { group_type: groupType },
      order: [['threat_score', 'DESC'], ['group_name', 'ASC']]
    });
  }

  /**
   * Find groups by sophistication level
   * @param level Sophistication level to filter by
   * @returns Promise resolving to groups array
   */
  static async findBySophistication(level: SophisticationLevel): Promise<ThreatGroup[]> {
    return this.findAll({
      where: { sophistication_level: level },
      order: [['activity_level', 'DESC'], ['group_name', 'ASC']]
    });
  }

  /**
   * Find active groups
   * @returns Promise resolving to active groups
   */
  static async findActive(): Promise<ThreatGroup[]> {
    return this.findAll({
      where: { is_active: true },
      order: [['last_observed', 'DESC'], ['threat_score', 'DESC']]
    });
  }

  /**
   * Find state-sponsored groups
   * @returns Promise resolving to state-sponsored groups
   */
  static async findStateSponsored(): Promise<ThreatGroup[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { is_state_sponsored: true },
          { group_type: 'nation_state' }
        ]
      },
      order: [['threat_score', 'DESC'], ['group_name', 'ASC']]
    });
  }

  /**
   * Find high-threat groups
   * @param minThreatScore Minimum threat score (default: 70)
   * @returns Promise resolving to high-threat groups
   */
  static async findHighThreat(minThreatScore: number = 70): Promise<ThreatGroup[]> {
    return this.findAll({
      where: { 
        threat_score: { [Op.gte]: minThreatScore },
        is_active: true
      },
      order: [['threat_score', 'DESC']]
    });
  }

  /**
   * Find recently active groups
   * @param days Number of days to look back (default: 90)
   * @returns Promise resolving to recently active groups
   */
  static async findRecentlyActive(days: number = 90): Promise<ThreatGroup[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.findAll({
      where: {
        last_observed: { [Op.gte]: cutoffDate },
        is_active: true
      },
      order: [['last_observed', 'DESC']]
    });
  }

  /**
   * Search groups by origin country
   * @param country Country to search for
   * @returns Promise resolving to groups from that country
   */
  static async findByOriginCountry(country: string): Promise<ThreatGroup[]> {
    return this.findAll({
      where: { origin_country: { [Op.iLike]: `%${country}%` } },
      order: [['threat_score', 'DESC'], ['group_name', 'ASC']]
    });
  }

  /**
   * Search groups by target sector
   * @param sector Sector to search for
   * @returns Promise resolving to groups targeting that sector
   */
  static async findByTargetSector(sector: string): Promise<ThreatGroup[]> {
    return this.findAll({
      where: { target_sectors: { [Op.contains]: [sector] } },
      order: [['threat_score', 'DESC'], ['activity_level', 'DESC']]
    });
  }

  /**
   * Get statistical summary
   * @returns Promise resolving to statistics object
   */
  static async getStatistics(): Promise<ThreatGroupStats> {
    const totalCount = await this.count();
    const activeCount = await this.count({ where: { is_active: true } });
    const suspectedCount = await this.count({ where: { is_suspected: true } });
    const stateSponsoredCount = await this.count({ 
      where: { 
        [Op.or]: [
          { is_state_sponsored: true },
          { group_type: 'nation_state' }
        ]
      }
    });

    // Get sophistication distribution
    const sophisticationResults = await this.findAll({
      attributes: [
        'sophistication_level',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['sophistication_level']
    });

    const sophisticationDistribution = sophisticationResults.reduce((acc, result) => {
      acc[result.sophistication_level] = parseInt((result as any).getDataValue('count'));
      return acc;
    }, {} as Record<SophisticationLevel, number>);

    // Get type distribution
    const typeResults = await this.findAll({
      attributes: [
        'group_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['group_type']
    });

    const typeDistribution = typeResults.reduce((acc, result) => {
      acc[result.group_type] = parseInt((result as any).getDataValue('count'));
      return acc;
    }, {} as Record<GroupType, number>);

    // Get average threat score
    const avgThreatScore = await this.findAll({
      attributes: [
        [this.sequelize!.fn('AVG', this.sequelize!.col('threat_score')), 'avg_threat']
      ]
    });

    const averageThreatScore = parseFloat((avgThreatScore[0] as any).getDataValue('avg_threat')) || 0;

    // Get average attribution confidence
    const avgConfidence = await this.findAll({
      attributes: [
        [this.sequelize!.fn('AVG', this.sequelize!.col('attribution_confidence')), 'avg_confidence']
      ]
    });

    const averageConfidence = parseFloat((avgConfidence[0] as any).getDataValue('avg_confidence')) || 0;

    return {
      total_groups: totalCount,
      active_groups: activeCount,
      suspected_groups: suspectedCount,
      state_sponsored_groups: stateSponsoredCount,
      sophistication_distribution: sophisticationDistribution,
      type_distribution: typeDistribution,
      activity_distribution: {} as Record<ActivityLevel, number>,
      resource_distribution: {} as Record<ResourceLevel, number>,
      top_origin_countries: [],
      top_target_sectors: [],
      average_threat_score: Math.round(averageThreatScore * 100) / 100,
      average_attribution_confidence: Math.round(averageConfidence * 100) / 100,
      recent_activity_trends: []
    };
  }

  /**
   * Bulk update threat scores
   * @param groupIds Array of group IDs to update
   * @returns Promise resolving to update results
   */
  static async bulkUpdateThreatScores(groupIds?: number[]): Promise<{
    updated: number;
    failed: number;
    errors: string[];
  }> {
    const results = { updated: 0, failed: 0, errors: [] as string[] };
    const whereClause = groupIds ? { id: { [Op.in]: groupIds } } : {};
    
    const groups = await this.findAll({ where: whereClause });

    for (const group of groups) {
      try {
        const newScore = group.calculateThreatScore();
        await group.update({ threat_score: newScore });
        results.updated++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to update threat score for group ${group.id}: ${error}`);
      }
    }

    return results;
  }

  // Scoped Queries
  static readonly scopes = {
    active: {
      where: { is_active: true }
    },
    confirmed: {
      where: { is_suspected: false }
    },
    suspected: {
      where: { is_suspected: true }
    },
    stateSponsored: {
      where: {
        [Op.or]: [
          { is_state_sponsored: true },
          { group_type: 'nation_state' }
        ]
      }
    },
    highThreat: {
      where: { threat_score: { [Op.gte]: 70 } }
    },
    highSophistication: {
      where: { sophistication_level: { [Op.in]: ['advanced', 'expert', 'nation_state'] } }
    },
    recent: {
      where: {
        last_observed: { [Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
      }
    },
    withRelations: {
      include: [
        { model: ThreatActor, as: 'threat_actors' },
        { model: Campaign, as: 'campaigns' }
      ]
    }
  };
}

export default ThreatGroup;
