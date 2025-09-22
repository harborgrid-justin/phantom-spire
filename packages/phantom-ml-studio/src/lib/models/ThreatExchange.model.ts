/**
 * THREAT EXCHANGE SEQUELIZE MODEL
 * Comprehensive model for threat intelligence sharing and exchange with full type safety
 * 
 * This model represents a sophisticated threat intelligence sharing platform that enables
 * organizations to share, consume, and collaborate on threat data. It supports multiple
 * sharing levels, trust frameworks, and intelligence formats including STIX, OpenIOC,
 * and custom formats.
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
  HasMany,
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
import { User } from './User.model';
import { ThreatActor } from './ThreatActor.model';
import { Campaign } from './Campaign.model';

/**
 * Threat intelligence types supported by the exchange
 * Categorizes different types of threat intelligence data
 */
export type ThreatIntelligenceType = 
  | 'indicator' 
  | 'malware' 
  | 'attack_pattern' 
  | 'tool' 
  | 'vulnerability' 
  | 'campaign' 
  | 'threat_actor' 
  | 'infrastructure' 
  | 'report' 
  | 'composite';

/**
 * Sharing levels for threat intelligence
 * Controls access and distribution of shared intelligence
 */
export type SharingLevel = 'internal' | 'partner' | 'community' | 'public' | 'restricted';

/**
 * Trust levels for threat intelligence sources
 * Indicates reliability and credibility of the intelligence
 */
export type TrustLevel = 'unknown' | 'low' | 'medium' | 'high' | 'verified';

/**
 * Intelligence formats supported
 * Different standardized formats for threat intelligence
 */
export type IntelligenceFormat = 'stix' | 'openioc' | 'misp' | 'yara' | 'snort' | 'custom' | 'json';

/**
 * Exchange status values
 * Lifecycle states of threat intelligence exchanges
 */
export type ExchangeStatus = 'draft' | 'active' | 'archived' | 'expired' | 'revoked' | 'under_review';

/**
 * Threat Exchange Attributes Interface
 * Defines all possible attributes for threat intelligence exchanges
 */
export interface ThreatExchangeAttributes {
  /** Unique identifier for the threat exchange */
  id: number;
  
  /** Name or title of the threat exchange */
  exchange_name: string;
  
  /** Type of threat intelligence being shared */
  threat_type: ThreatIntelligenceType;
  
  /** User ID who shared this intelligence */
  shared_by: number;
  
  /** Organization or entity sharing the intelligence */
  sharing_organization?: string;
  
  /** Sharing level determining access control */
  sharing_level: SharingLevel;
  
  /** Trust level of this intelligence */
  trust_level: TrustLevel;
  
  /** Format of the threat intelligence data */
  intelligence_format: IntelligenceFormat;
  
  /** Main threat intelligence data payload */
  threat_data: Record<string, any>;
  
  /** Additional metadata about the threat */
  metadata: Record<string, any>;
  
  /** Current status of the exchange */
  status: ExchangeStatus;
  
  /** List of recipient organizations or users */
  recipients: string[];
  
  /** Tags for categorization and filtering */
  tags: string[];
  
  /** Traffic Light Protocol (TLP) marking */
  tlp_marking: 'white' | 'green' | 'amber' | 'red';
  
  /** Confidence level in the intelligence (0-100) */
  confidence_level: number;
  
  /** Severity or priority level (1-5) */
  severity_level: number;
  
  /** Source of the original intelligence */
  intelligence_source?: string;
  
  /** Collection method used to gather intelligence */
  collection_method?: string;
  
  /** Geographic regions this intelligence applies to */
  geographic_scope: string[];
  
  /** Industry sectors affected */
  affected_sectors: string[];
  
  /** Associated threat actors */
  associated_actors: string[];
  
  /** Associated campaigns */
  associated_campaigns: string[];
  
  /** Indicators of Compromise included */
  iocs: string[];
  
  /** MITRE ATT&CK techniques referenced */
  attack_techniques: string[];
  
  /** Vulnerabilities referenced (CVE IDs) */
  vulnerabilities: string[];
  
  /** File hashes included in the intelligence */
  file_hashes: Record<string, string[]>;
  
  /** Network indicators (IPs, domains, URLs) */
  network_indicators: Record<string, string[]>;
  
  /** Yara rules included */
  yara_rules: string[];
  
  /** Sigma rules included */
  sigma_rules: string[];
  
  /** Detection rules and signatures */
  detection_rules: string[];
  
  /** Mitigation recommendations */
  mitigations: string[];
  
  /** Expiration date for the intelligence */
  expires_at?: Date;
  
  /** Date when intelligence was first observed */
  first_observed?: Date;
  
  /** Date when intelligence was last observed */
  last_observed?: Date;
  
  /** Number of times this intelligence has been accessed */
  access_count: number;
  
  /** Number of times this intelligence has been downloaded */
  download_count: number;
  
  /** User feedback and ratings */
  feedback_score?: number;
  
  /** Number of feedback entries */
  feedback_count: number;
  
  /** Comments and notes about the intelligence */
  analyst_notes?: string;
  
  /** External references and sources */
  external_references: string[];
  
  /** STIX identifier if applicable */
  stix_id?: string;
  
  /** UUID for external system correlation */
  external_uuid?: string;
  
  /** Checksum for data integrity verification */
  data_checksum?: string;
  
  /** Size of the intelligence data in bytes */
  data_size?: number;
  
  /** Encryption status of sensitive data */
  is_encrypted: boolean;
  
  /** Whether this intelligence has been validated */
  is_validated: boolean;
  
  /** Whether this is marked as false positive */
  is_false_positive: boolean;
  
  /** Whether sharing is restricted to specific recipients */
  is_restricted: boolean;
  
  /** Whether this intelligence is publicly available */
  is_public: boolean;
  
  /** API key for accessing restricted intelligence */
  api_key?: string;
  
  /** Digital signature for authenticity */
  digital_signature?: string;
  
  /** Record creation timestamp */
  created_at: Date;
  
  /** Record last update timestamp */
  updated_at: Date;
  
  /** Soft delete timestamp */
  deleted_at?: Date;
}

/**
 * Threat Exchange Creation Attributes Interface
 * Defines required and optional attributes for creating new exchanges
 */
export interface ThreatExchangeCreationAttributes extends Optional<ThreatExchangeAttributes,
  'id' | 'sharing_organization' | 'metadata' | 'intelligence_source' | 'collection_method' |
  'expires_at' | 'first_observed' | 'last_observed' | 'feedback_score' | 'analyst_notes' |
  'stix_id' | 'external_uuid' | 'data_checksum' | 'data_size' | 'api_key' | 'digital_signature' |
  'created_at' | 'updated_at' | 'deleted_at'
> {}

/**
 * Threat Exchange Statistics Interface
 * Aggregated statistics for threat intelligence exchanges
 */
export interface ThreatExchangeStats {
  total_exchanges: number;
  active_exchanges: number;
  expired_exchanges: number;
  sharing_level_distribution: Record<SharingLevel, number>;
  threat_type_distribution: Record<ThreatIntelligenceType, number>;
  trust_level_distribution: Record<TrustLevel, number>;
  format_distribution: Record<IntelligenceFormat, number>;
  average_confidence: number;
  average_severity: number;
  top_sharing_organizations: Array<{ organization: string; count: number }>;
  recent_activity: Array<{ date: Date; count: number }>;
  geographic_coverage: string[];
  sector_coverage: string[];
}

/**
 * Exchange Analysis Interface
 * Detailed analysis results for threat intelligence
 */
export interface ExchangeAnalysis {
  exchange: ThreatExchange;
  risk_assessment: {
    overall_risk: 'low' | 'medium' | 'high' | 'critical';
    confidence_score: number;
    severity_score: number;
    freshness_score: number;
  };
  correlation_results: {
    related_exchanges: ThreatExchange[];
    similar_iocs: string[];
    campaign_associations: string[];
    actor_associations: string[];
  };
  enrichment_data: {
    additional_context: Record<string, any>;
    external_lookups: Record<string, any>;
    reputation_scores: Record<string, number>;
  };
  recommendations: {
    actions: string[];
    priority_level: number;
    timeline: string;
  };
}

/**
 * Sharing Request Interface
 * Structure for intelligence sharing requests
 */
export interface SharingRequest {
  requester_id: number;
  exchange_id: number;
  justification: string;
  requested_access_level: SharingLevel;
  requested_at: Date;
  status: 'pending' | 'approved' | 'denied';
  reviewed_by?: number;
  reviewed_at?: Date;
  review_notes?: string;
}

/**
 * Threat Exchange Model Class
 * Comprehensive model for threat intelligence sharing
 */
@Table({
  tableName: 'threat_exchanges',
  timestamps: true,
  underscored: true,
  paranoid: true,
  version: true,
  indexes: [
    { fields: ['shared_by'] },
    { fields: ['threat_type'] },
    { fields: ['sharing_level'] },
    { fields: ['trust_level'] },
    { fields: ['status'] },
    { fields: ['tlp_marking'] },
    { fields: ['confidence_level'] },
    { fields: ['severity_level'] },
    { fields: ['sharing_organization'] },
    { fields: ['tags'], using: 'gin' },
    { fields: ['geographic_scope'], using: 'gin' },
    { fields: ['affected_sectors'], using: 'gin' },
    { fields: ['iocs'], using: 'gin' },
    { fields: ['attack_techniques'], using: 'gin' },
    { fields: ['expires_at'] },
    { fields: ['first_observed'] },
    { fields: ['last_observed'] },
    { fields: ['is_public'] },
    { fields: ['is_validated'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
    { fields: ['stix_id'], unique: true, where: { stix_id: { [Op.ne]: null } } },
    { fields: ['external_uuid'], unique: true, where: { external_uuid: { [Op.ne]: null } } }
  ]
})
export class ThreatExchange extends Model<ThreatExchangeAttributes, ThreatExchangeCreationAttributes>
  implements ThreatExchangeAttributes {

  /** Unique identifier for the threat exchange */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Name or title of the threat exchange */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare exchange_name: string;

  /** Type of threat intelligence being shared */
  @AllowNull(false)
  @Column(DataType.ENUM('indicator', 'malware', 'attack_pattern', 'tool', 'vulnerability', 'campaign', 'threat_actor', 'infrastructure', 'report', 'composite'))
  declare threat_type: ThreatIntelligenceType;

  /** User ID who shared this intelligence */
  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.INTEGER)
  declare shared_by: number;

  /** Organization or entity sharing the intelligence */
  @AllowNull(true)
  @Length({ max: 255 })
  @Column(DataType.STRING(255))
  declare sharing_organization?: string;

  /** Sharing level determining access control */
  @AllowNull(false)
  @Default('internal')
  @Column(DataType.ENUM('internal', 'partner', 'community', 'public', 'restricted'))
  declare sharing_level: SharingLevel;

  /** Trust level of this intelligence */
  @AllowNull(false)
  @Default('unknown')
  @Column(DataType.ENUM('unknown', 'low', 'medium', 'high', 'verified'))
  declare trust_level: TrustLevel;

  /** Format of the threat intelligence data */
  @AllowNull(false)
  @Default('json')
  @Column(DataType.ENUM('stix', 'openioc', 'misp', 'yara', 'snort', 'custom', 'json'))
  declare intelligence_format: IntelligenceFormat;

  /** Main threat intelligence data payload */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare threat_data: Record<string, any>;

  /** Additional metadata about the threat */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  /** Current status of the exchange */
  @AllowNull(false)
  @Default('active')
  @Column(DataType.ENUM('draft', 'active', 'archived', 'expired', 'revoked', 'under_review'))
  declare status: ExchangeStatus;

  /** List of recipient organizations or users */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare recipients: string[];

  /** Tags for categorization and filtering */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Traffic Light Protocol (TLP) marking */
  @AllowNull(false)
  @Default('white')
  @Column(DataType.ENUM('white', 'green', 'amber', 'red'))
  declare tlp_marking: 'white' | 'green' | 'amber' | 'red';

  /** Confidence level in the intelligence (0-100) */
  @AllowNull(false)
  @Default(50)
  @Validate({ min: 0, max: 100 })
  @Column(DataType.INTEGER)
  declare confidence_level: number;

  /** Severity or priority level (1-5) */
  @AllowNull(false)
  @Default(3)
  @Validate({ min: 1, max: 5 })
  @Column(DataType.INTEGER)
  declare severity_level: number;

  /** Source of the original intelligence */
  @AllowNull(true)
  @Length({ max: 255 })
  @Column(DataType.STRING(255))
  declare intelligence_source?: string;

  /** Collection method used to gather intelligence */
  @AllowNull(true)
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare collection_method?: string;

  /** Geographic regions this intelligence applies to */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare geographic_scope: string[];

  /** Industry sectors affected */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare affected_sectors: string[];

  /** Associated threat actors */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare associated_actors: string[];

  /** Associated campaigns */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare associated_campaigns: string[];

  /** Indicators of Compromise included */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare iocs: string[];

  /** MITRE ATT&CK techniques referenced */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare attack_techniques: string[];

  /** Vulnerabilities referenced (CVE IDs) */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare vulnerabilities: string[];

  /** File hashes included in the intelligence */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare file_hashes: Record<string, string[]>;

  /** Network indicators (IPs, domains, URLs) */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare network_indicators: Record<string, string[]>;

  /** Yara rules included */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  declare yara_rules: string[];

  /** Sigma rules included */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  declare sigma_rules: string[];

  /** Detection rules and signatures */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  declare detection_rules: string[];

  /** Mitigation recommendations */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  declare mitigations: string[];

  /** Expiration date for the intelligence */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare expires_at?: Date;

  /** Date when intelligence was first observed */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare first_observed?: Date;

  /** Date when intelligence was last observed */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare last_observed?: Date;

  /** Number of times this intelligence has been accessed */
  @AllowNull(false)
  @Default(0)
  @Validate({ min: 0 })
  @Column(DataType.INTEGER)
  declare access_count: number;

  /** Number of times this intelligence has been downloaded */
  @AllowNull(false)
  @Default(0)
  @Validate({ min: 0 })
  @Column(DataType.INTEGER)
  declare download_count: number;

  /** User feedback and ratings */
  @AllowNull(true)
  @Validate({ min: 1, max: 5 })
  @Column(DataType.DECIMAL(3, 2))
  declare feedback_score?: number;

  /** Number of feedback entries */
  @AllowNull(false)
  @Default(0)
  @Validate({ min: 0 })
  @Column(DataType.INTEGER)
  declare feedback_count: number;

  /** Comments and notes about the intelligence */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare analyst_notes?: string;

  /** External references and sources */
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

  /** UUID for external system correlation */
  @AllowNull(true)
  @Unique
  @Length({ max: 36 })
  @Column(DataType.STRING(36))
  declare external_uuid?: string;

  /** Checksum for data integrity verification */
  @AllowNull(true)
  @Length({ max: 128 })
  @Column(DataType.STRING(128))
  declare data_checksum?: string;

  /** Size of the intelligence data in bytes */
  @AllowNull(true)
  @Validate({ min: 0 })
  @Column(DataType.BIGINT)
  declare data_size?: number;

  /** Encryption status of sensitive data */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_encrypted: boolean;

  /** Whether this intelligence has been validated */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_validated: boolean;

  /** Whether this is marked as false positive */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_false_positive: boolean;

  /** Whether sharing is restricted to specific recipients */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_restricted: boolean;

  /** Whether this intelligence is publicly available */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_public: boolean;

  /** API key for accessing restricted intelligence */
  @AllowNull(true)
  @Length({ max: 64 })
  @Column(DataType.STRING(64))
  declare api_key?: string;

  /** Digital signature for authenticity */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare digital_signature?: string;

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
  /** User who shared this intelligence */
  @BelongsTo(() => User, {
    foreignKey: 'shared_by',
    as: 'sharer',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  })
  declare sharer?: User;

  // Lifecycle Hooks
  @BeforeCreate
  static async validateBeforeCreate(instance: ThreatExchange): Promise<void> {
    // Validate expiration date
    if (instance.expires_at && instance.expires_at <= new Date()) {
      throw new Error('Expiration date must be in the future');
    }

    // Validate observation dates
    if (instance.first_observed && instance.last_observed && 
        instance.last_observed < instance.first_observed) {
      throw new Error('Last observed date cannot be before first observed date');
    }

    // Generate UUID if not provided
    if (!instance.external_uuid) {
      instance.external_uuid = require('crypto').randomUUID();
    }

    // Generate API key for restricted intelligence
    if (instance.is_restricted === true && !instance.api_key) {
      instance.api_key = require('crypto').randomBytes(32).toString('hex');
    }
  }

  @BeforeUpdate
  static async validateBeforeUpdate(instance: ThreatExchange): Promise<void> {
    // Validate expiration date
    if (instance.expires_at && instance.expires_at <= new Date()) {
      throw new Error('Expiration date must be in the future');
    }

    // Validate observation dates
    if (instance.first_observed && instance.last_observed && 
        instance.last_observed < instance.first_observed) {
      throw new Error('Last observed date cannot be before first observed date');
    }

    // Auto-expire if past expiration date
    if (instance.expires_at && instance.expires_at <= new Date() && 
        instance.status === 'active') {
      instance.status = 'expired';
    }
  }

  @BeforeDestroy
  static async handleSoftDelete(instance: ThreatExchange): Promise<void> {
    // Log the deletion for audit purposes
    console.log(`Archiving threat exchange: ${instance.id} - ${instance.exchange_name}`);
    
    // Update status to archived before soft delete
    await instance.update({ status: 'archived' });
  }

  @AfterCreate
  static async logCreation(instance: ThreatExchange): Promise<void> {
    console.log(`Created threat exchange: ${instance.id} - ${instance.exchange_name}`);
  }

  @AfterUpdate
  static async logUpdate(instance: ThreatExchange): Promise<void> {
    console.log(`Updated threat exchange: ${instance.id} - ${instance.exchange_name}`);
  }

  @AfterDestroy
  static async logDestruction(instance: ThreatExchange): Promise<void> {
    console.log(`Deleted threat exchange: ${instance.id} - ${instance.exchange_name}`);
  }

  // Instance Methods
  /**
   * Check if this exchange is currently active
   * @returns True if status is active and not expired
   */
  public isActive(): boolean {
    return this.status === 'active' && !this.isExpired() && !this.deleted_at;
  }

  /**
   * Check if this exchange has expired
   * @returns True if past expiration date
   */
  public isExpired(): boolean {
    return this.expires_at ? this.expires_at <= new Date() : false;
  }

  /**
   * Check if this exchange is publicly accessible
   * @returns True if sharing level is public and not restricted
   */
  public isPubliclyAccessible(): boolean {
    return this.is_public && this.sharing_level === 'public' && !this.is_restricted;
  }

  /**
   * Check if user has access to this exchange
   * @param userId User ID to check access for
   * @param userOrganization User's organization
   * @returns True if user has access
   */
  public hasAccess(userId: number, userOrganization?: string): boolean {
    // Owner always has access
    if (this.shared_by === userId) return true;

    // Public intelligence is accessible to all
    if (this.isPubliclyAccessible()) return true;

    // Check organization-based access
    if (userOrganization && this.sharing_organization === userOrganization) return true;

    // Check if user is in recipients list
    return this.recipients.includes(userId.toString()) || 
           (userOrganization && this.recipients.includes(userOrganization));
  }

  /**
   * Calculate risk score based on various factors
   * @returns Risk score between 0 and 100
   */
  public calculateRiskScore(): number {
    let score = 0;

    // Base score from severity level
    score += this.severity_level * 15;

    // Confidence level contribution
    score += (this.confidence_level / 100) * 25;

    // Trust level contribution
    const trustScores = { unknown: 0, low: 5, medium: 10, high: 15, verified: 20 };
    score += trustScores[this.trust_level] || 0;

    // IoC count contribution (more indicators = higher risk)
    score += Math.min(this.iocs.length * 2, 20);

    // Freshness bonus (recent intelligence is more relevant)
    if (this.last_observed) {
      const daysSinceObserved = this.getDaysSinceLastObserved();
      if (daysSinceObserved !== null && daysSinceObserved < 30) {
        score += 15;
      }
    }

    // Validation bonus
    if (this.is_validated) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get threat level classification
   * @returns Threat level based on risk score
   */
  public getThreatLevel(): 'low' | 'medium' | 'high' | 'critical' {
    const riskScore = this.calculateRiskScore();
    
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  /**
   * Get days until expiration
   * @returns Number of days until expiration, null if no expiration
   */
  public getDaysUntilExpiration(): number | null {
    if (!this.expires_at) return null;
    const diffTime = this.expires_at.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days since last observed
   * @returns Number of days since last observation, null if never observed
   */
  public getDaysSinceLastObserved(): number | null {
    if (!this.last_observed) return null;
    const diffTime = new Date().getTime() - this.last_observed.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if exchange has specific tag
   * @param tag Tag to check for
   * @returns True if tag exists
   */
  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Add tag to the exchange
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
   * Remove tag from the exchange
   * @param tag Tag to remove
   * @returns Promise resolving to updated instance
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  /**
   * Add IoC to the exchange
   * @param ioc Indicator to add
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
   * Add multiple IoCs to the exchange
   * @param iocs Array of indicators to add
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
   * Increment access count
   * @returns Promise resolving to updated instance
   */
  public async incrementAccessCount(): Promise<this> {
    this.access_count += 1;
    return this.save();
  }

  /**
   * Increment download count
   * @returns Promise resolving to updated instance
   */
  public async incrementDownloadCount(): Promise<this> {
    this.download_count += 1;
    return this.save();
  }

  /**
   * Add feedback rating
   * @param rating Rating from 1-5
   * @returns Promise resolving to updated instance
   */
  public async addFeedback(rating: number): Promise<this> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const currentTotal = (this.feedback_score || 0) * this.feedback_count;
    this.feedback_count += 1;
    this.feedback_score = (currentTotal + rating) / this.feedback_count;
    
    return this.save();
  }

  /**
   * Update status
   * @param newStatus New status to set
   * @returns Promise resolving to updated instance
   */
  public async updateStatus(newStatus: ExchangeStatus): Promise<this> {
    this.status = newStatus;
    return this.save();
  }

  /**
   * Mark as validated
   * @returns Promise resolving to updated instance
   */
  public async markAsValidated(): Promise<this> {
    this.is_validated = true;
    return this.save();
  }

  /**
   * Mark as false positive
   * @returns Promise resolving to updated instance
   */
  public async markAsFalsePositive(): Promise<this> {
    this.is_false_positive = true;
    this.status = 'archived';
    return this.save();
  }

  /**
   * Get formatted summary
   * @returns Human-readable summary
   */
  public getSummary(): string {
    return `${this.exchange_name} (${this.threat_type}) - ` +
           `Trust: ${this.trust_level}, Confidence: ${this.confidence_level}%, ` +
           `Severity: ${this.severity_level}/5, Risk: ${this.calculateRiskScore()}`;
  }

  // Static Methods and Query Helpers
  /**
   * Find exchanges by sharing user
   * @param userId User ID
   * @param options Additional query options
   * @returns Promise resolving to exchanges array
   */
  static async findBySharer(
    userId: number,
    options: Omit<FindOptions<ThreatExchangeAttributes>, 'where'> = {}
  ): Promise<ThreatExchange[]> {
    return this.findAll({
      where: { shared_by: userId },
      order: [['created_at', 'DESC']],
      ...options
    });
  }

  /**
   * Find exchanges by threat type
   * @param threatType Type of threat intelligence
   * @returns Promise resolving to exchanges array
   */
  static async findByThreatType(threatType: ThreatIntelligenceType): Promise<ThreatExchange[]> {
    return this.findAll({
      where: { threat_type: threatType, status: 'active' },
      order: [['confidence_level', 'DESC'], ['created_at', 'DESC']]
    });
  }

  /**
   * Find exchanges by sharing level
   * @param sharingLevel Sharing level to filter by
   * @returns Promise resolving to exchanges array
   */
  static async findBySharingLevel(sharingLevel: SharingLevel): Promise<ThreatExchange[]> {
    return this.findAll({
      where: { sharing_level: sharingLevel, status: 'active' },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find public exchanges
   * @param limit Maximum number of results
   * @returns Promise resolving to public exchanges
   */
  static async findPublic(limit?: number): Promise<ThreatExchange[]> {
    const options: FindOptions<ThreatExchangeAttributes> = {
      where: { 
        is_public: true, 
        sharing_level: 'public', 
        status: 'active',
        is_restricted: false
      },
      order: [['confidence_level', 'DESC'], ['created_at', 'DESC']]
    };

    if (limit) options.limit = limit;

    return this.findAll(options);
  }

  /**
   * Find high-confidence exchanges
   * @param minConfidence Minimum confidence level (default: 80)
   * @returns Promise resolving to high-confidence exchanges
   */
  static async findHighConfidence(minConfidence: number = 80): Promise<ThreatExchange[]> {
    return this.findAll({
      where: { 
        confidence_level: { [Op.gte]: minConfidence },
        status: 'active'
      },
      order: [['confidence_level', 'DESC']]
    });
  }

  /**
   * Find exchanges expiring soon
   * @param days Number of days to look ahead (default: 7)
   * @returns Promise resolving to expiring exchanges
   */
  static async findExpiringSoon(days: number = 7): Promise<ThreatExchange[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return this.findAll({
      where: {
        expires_at: { [Op.lte]: cutoffDate },
        status: 'active'
      },
      order: [['expires_at', 'ASC']]
    });
  }

  /**
   * Search exchanges by IoC
   * @param ioc Indicator of Compromise to search for
   * @returns Promise resolving to matching exchanges
   */
  static async searchByIoC(ioc: string): Promise<ThreatExchange[]> {
    return this.findAll({
      where: {
        iocs: { [Op.contains]: [ioc] },
        status: 'active'
      },
      order: [['confidence_level', 'DESC']]
    });
  }

  /**
   * Get statistical summary
   * @returns Promise resolving to statistics object
   */
  static async getStatistics(): Promise<ThreatExchangeStats> {
    const totalCount = await this.count();
    const activeCount = await this.count({ where: { status: 'active' } });
    const expiredCount = await this.count({ where: { status: 'expired' } });

    // Get sharing level distribution
    const sharingResults = await this.findAll({
      attributes: [
        'sharing_level',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['sharing_level']
    });

    const sharingLevelDistribution = sharingResults.reduce((acc, result) => {
      acc[result.sharing_level] = parseInt((result as any).getDataValue('count'));
      return acc;
    }, {} as Record<SharingLevel, number>);

    // Get threat type distribution
    const threatResults = await this.findAll({
      attributes: [
        'threat_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['threat_type']
    });

    const threatTypeDistribution = threatResults.reduce((acc, result) => {
      acc[result.threat_type] = parseInt((result as any).getDataValue('count'));
      return acc;
    }, {} as Record<ThreatIntelligenceType, number>);

    // Get average confidence and severity
    const avgResults = await this.findAll({
      attributes: [
        [this.sequelize!.fn('AVG', this.sequelize!.col('confidence_level')), 'avg_confidence'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('severity_level')), 'avg_severity']
      ]
    });

    const averageConfidence = parseFloat((avgResults[0] as any).getDataValue('avg_confidence')) || 0;
    const averageSeverity = parseFloat((avgResults[0] as any).getDataValue('avg_severity')) || 0;

    return {
      total_exchanges: totalCount,
      active_exchanges: activeCount,
      expired_exchanges: expiredCount,
      sharing_level_distribution: sharingLevelDistribution,
      threat_type_distribution: threatTypeDistribution,
      trust_level_distribution: {} as Record<TrustLevel, number>,
      format_distribution: {} as Record<IntelligenceFormat, number>,
      average_confidence: Math.round(averageConfidence * 100) / 100,
      average_severity: Math.round(averageSeverity * 100) / 100,
      top_sharing_organizations: [],
      recent_activity: [],
      geographic_coverage: [],
      sector_coverage: []
    };
  }

  /**
   * Bulk validate exchanges
   * @param exchangeIds Array of exchange IDs to validate
   * @returns Promise resolving to validation results
   */
  static async bulkValidate(exchangeIds: number[]): Promise<{
    validated: number;
    failed: number;
    errors: string[];
  }> {
    const results = { validated: 0, failed: 0, errors: [] as string[] };

    for (const id of exchangeIds) {
      try {
        const exchange = await this.findByPk(id);
        if (exchange) {
          await exchange.markAsValidated();
          results.validated++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to validate exchange ${id}: ${error}`);
      }
    }

    return results;
  }

  // Scoped Queries
  static readonly scopes = {
    active: {
      where: { status: 'active' }
    },
    public: {
      where: { is_public: true, sharing_level: 'public', is_restricted: false }
    },
    validated: {
      where: { is_validated: true }
    },
    highConfidence: {
      where: { confidence_level: { [Op.gte]: 80 } }
    },
    recent: {
      where: {
        created_at: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    },
    withSharer: {
      include: [{ model: User, as: 'sharer' }]
    }
  };
}

export default ThreatExchange;
