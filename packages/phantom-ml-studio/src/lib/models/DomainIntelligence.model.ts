/**
 * DOMAIN INTELLIGENCE SEQUELIZE MODEL
 * Represents domain analysis and threat intelligence with comprehensive type safety
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
  DataType,
  Index,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';

// DomainIntelligence Attributes Interface
export interface DomainIntelligenceAttributes {
  /** Unique identifier for the domain intelligence */
  id: number;
  /** Domain name being analyzed */
  domain_name: string;
  /** Classification of the domain */
  classification: 'clean' | 'suspicious' | 'malicious' | 'unknown' | 'parked' | 'sinkholed';
  /** Reputation score (0-100, higher is better) */
  reputation_score: number;
  /** IP addresses associated with this domain */
  associated_ips: string[];
  /** WHOIS registration data */
  whois_data: Record<string, any>;
  /** DNS record information */
  dns_records: Record<string, any>;
  /** Domain registration date */
  registration_date?: Date;
  /** Domain expiration date */
  expiration_date?: Date;
  /** Threat categories associated with the domain */
  threat_categories: string[];
  /** Analysis results from various security feeds */
  analysis_results: Record<string, any>;
  /** SSL certificate information */
  ssl_info: Record<string, any>;
  /** Subdomain information */
  subdomain_info: Record<string, any>;
  /** Geographic location data */
  geo_location: Record<string, any>;
  /** Domain age in days */
  domain_age?: number;
  /** First seen date */
  first_seen?: Date;
  /** Last seen date */
  last_seen?: Date;
  /** Status of domain analysis */
  status: 'active' | 'inactive' | 'monitoring' | 'blocked' | 'whitelisted';
  /** Classification tags */
  tags: string[];
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// DomainIntelligence Creation Attributes Interface
export interface DomainIntelligenceCreationAttributes extends Optional<DomainIntelligenceAttributes,
  'id' | 'classification' | 'reputation_score' | 'associated_ips' | 'whois_data' | 'dns_records' |
  'registration_date' | 'expiration_date' | 'threat_categories' | 'analysis_results' | 'ssl_info' |
  'subdomain_info' | 'geo_location' | 'domain_age' | 'first_seen' | 'last_seen' | 'status' |
  'tags' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'domain_intelligence',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['domain_name'], unique: true },
    { fields: ['classification'] },
    { fields: ['reputation_score'] },
    { fields: ['registration_date'] },
    { fields: ['expiration_date'] },
    { fields: ['first_seen'] },
    { fields: ['last_seen'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
})
export class DomainIntelligence extends Model<DomainIntelligenceAttributes, DomainIntelligenceCreationAttributes> implements DomainIntelligenceAttributes {
  /** Unique identifier for the domain intelligence */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Domain name being analyzed */
  @AllowNull(false)
  @Index({ unique: true })
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare domain_name: string;

  /** Classification of the domain */
  @AllowNull(false)
  @Default('unknown')
  @Index
  @Column(DataType.ENUM('clean', 'suspicious', 'malicious', 'unknown', 'parked', 'sinkholed'))
  declare classification: 'clean' | 'suspicious' | 'malicious' | 'unknown' | 'parked' | 'sinkholed';

  /** Reputation score (0-100, higher is better) */
  @AllowNull(false)
  @Default(50)
  @Index
  @Column(DataType.INTEGER)
  declare reputation_score: number;

  /** IP addresses associated with this domain */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare associated_ips: string[];

  /** WHOIS registration data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare whois_data: Record<string, any>;

  /** DNS record information */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare dns_records: Record<string, any>;

  /** Domain registration date */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare registration_date?: Date;

  /** Domain expiration date */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare expiration_date?: Date;

  /** Threat categories associated with the domain */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare threat_categories: string[];

  /** Analysis results from various security feeds */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare analysis_results: Record<string, any>;

  /** SSL certificate information */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare ssl_info: Record<string, any>;

  /** Subdomain information */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare subdomain_info: Record<string, any>;

  /** Geographic location data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare geo_location: Record<string, any>;

  /** Domain age in days */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare domain_age?: number;

  /** First seen date */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare first_seen?: Date;

  /** Last seen date */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare last_seen?: Date;

  /** Status of domain analysis */
  @AllowNull(false)
  @Default('active')
  @Index
  @Column(DataType.ENUM('active', 'inactive', 'monitoring', 'blocked', 'whitelisted'))
  declare status: 'active' | 'inactive' | 'monitoring' | 'blocked' | 'whitelisted';

  /** Classification tags */
  @AllowNull(false)
  @Default('[]')
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

  // Instance methods
  /**
   * Check if domain is malicious
   * @returns True if classified as malicious or has very low reputation
   */
  public isMalicious(): boolean {
    return this.classification === 'malicious' || this.reputation_score <= 20;
  }

  /**
   * Check if domain is suspicious
   * @returns True if classified as suspicious or has moderate reputation
   */
  public isSuspicious(): boolean {
    return this.classification === 'suspicious' || (this.reputation_score > 20 && this.reputation_score <= 50);
  }

  /**
   * Check if domain is clean
   * @returns True if classified as clean and has good reputation
   */
  public isClean(): boolean {
    return this.classification === 'clean' && this.reputation_score >= 80;
  }

  /**
   * Check if domain is parked
   * @returns True if domain is parked
   */
  public isParked(): boolean {
    return this.classification === 'parked';
  }

  /**
   * Check if domain is sinkholed
   * @returns True if domain is sinkholed
   */
  public isSinkholed(): boolean {
    return this.classification === 'sinkholed';
  }

  /**
   * Check if domain is active
   * @returns True if status is active
   */
  public isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Check if domain is blocked
   * @returns True if status is blocked
   */
  public isBlocked(): boolean {
    return this.status === 'blocked';
  }

  /**
   * Check if domain is whitelisted
   * @returns True if status is whitelisted
   */
  public isWhitelisted(): boolean {
    return this.status === 'whitelisted';
  }

  /**
   * Check if domain is being monitored
   * @returns True if status is monitoring
   */
  public isMonitoring(): boolean {
    return this.status === 'monitoring';
  }

  /**
   * Get domain age in days
   * @returns Age in days since registration, null if no registration date
   */
  public getAge(): number | null {
    if (!this.registration_date) return this.domain_age || null;
    const diffTime = new Date().getTime() - this.registration_date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days until domain expires
   * @returns Days until expiration, null if no expiration date, negative if expired
   */
  public getDaysUntilExpiration(): number | null {
    if (!this.expiration_date) return null;
    const diffTime = this.expiration_date.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if domain is expiring soon
   * @param days Number of days to consider "soon" (default: 30)
   * @returns True if domain expires within specified days
   */
  public isExpiringSoon(days: number = 30): boolean {
    const daysUntil = this.getDaysUntilExpiration();
    return daysUntil !== null && daysUntil <= days && daysUntil >= 0;
  }

  /**
   * Check if domain has expired
   * @returns True if expiration date has passed
   */
  public hasExpired(): boolean {
    const daysUntil = this.getDaysUntilExpiration();
    return daysUntil !== null && daysUntil < 0;
  }

  /**
   * Get number of associated IPs
   * @returns Count of associated IP addresses
   */
  public getIpCount(): number {
    return this.associated_ips.length;
  }

  /**
   * Check if specific IP is associated
   * @param ip IP address to check
   * @returns True if IP is associated with domain
   */
  public hasIp(ip: string): boolean {
    return this.associated_ips.includes(ip);
  }

  /**
   * Check if domain has specific threat category
   * @param category Threat category to check
   * @returns True if threat category exists
   */
  public hasThreatCategory(category: string): boolean {
    return this.threat_categories.includes(category);
  }

  /**
   * Check if domain has specific tag
   * @param tag Tag to check for
   * @returns True if tag exists
   */
  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Get reputation level as string
   * @returns String representation of reputation level
   */
  public getReputationLevel(): 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor' {
    if (this.reputation_score >= 90) return 'excellent';
    if (this.reputation_score >= 70) return 'good';
    if (this.reputation_score >= 50) return 'fair';
    if (this.reputation_score >= 30) return 'poor';
    return 'very_poor';
  }

  /**
   * Get classification color for UI display
   * @returns Color hex code for classification
   */
  public getClassificationColor(): string {
    const colorMap = {
      clean: '#28A745',
      suspicious: '#FFC107',
      malicious: '#DC3545',
      unknown: '#6C757D',
      parked: '#17A2B8',
      sinkholed: '#6F42C1'
    };
    return colorMap[this.classification];
  }

  /**
   * Calculate risk score based on multiple factors
   * @returns Risk score (0-100, higher is riskier)
   */
  public getRiskScore(): number {
    let riskScore = 100 - this.reputation_score; // Invert reputation score

    // Adjust based on classification
    switch (this.classification) {
      case 'malicious':
        riskScore = Math.max(riskScore, 90);
        break;
      case 'suspicious':
        riskScore = Math.max(riskScore, 60);
        break;
      case 'clean':
        riskScore = Math.min(riskScore, 20);
        break;
    }

    // Increase risk for new domains (< 30 days old)
    const age = this.getAge();
    if (age && age < 30) {
      riskScore += 20;
    }

    // Increase risk for expiring domains
    if (this.isExpiringSoon(7)) {
      riskScore += 10;
    }

    return Math.max(0, Math.min(100, riskScore));
  }

  /**
   * Update domain classification
   * @param classification New classification
   * @param reason Optional reason for change
   * @returns Promise resolving to updated domain
   */
  public async updateClassification(classification: DomainIntelligenceAttributes['classification'], reason?: string): Promise<this> {
    const oldClassification = this.classification;
    this.classification = classification;
    
    if (reason) {
      this.metadata = {
        ...this.metadata,
        classification_history: [
          ...(this.metadata['classification_history'] || []),
          {
            from: oldClassification,
            to: classification,
            reason,
            timestamp: new Date()
          }
        ]
      };
    }
    
    return this.save();
  }

  /**
   * Update reputation score
   * @param score New reputation score (0-100)
   * @returns Promise resolving to updated domain
   */
  public async updateReputation(score: number): Promise<this> {
    this.reputation_score = Math.max(0, Math.min(100, score));
    return this.save();
  }

  /**
   * Add associated IP address
   * @param ip IP address to add
   * @returns Promise resolving to updated domain
   */
  public async addIp(ip: string): Promise<this> {
    if (!this.associated_ips.includes(ip)) {
      this.associated_ips = [...this.associated_ips, ip];
      return this.save();
    }
    return this;
  }

  /**
   * Remove associated IP address
   * @param ip IP address to remove
   * @returns Promise resolving to updated domain
   */
  public async removeIp(ip: string): Promise<this> {
    this.associated_ips = this.associated_ips.filter(i => i !== ip);
    return this.save();
  }

  /**
   * Add threat category
   * @param category Threat category to add
   * @returns Promise resolving to updated domain
   */
  public async addThreatCategory(category: string): Promise<this> {
    if (!this.threat_categories.includes(category)) {
      this.threat_categories = [...this.threat_categories, category];
      return this.save();
    }
    return this;
  }

  /**
   * Remove threat category
   * @param category Threat category to remove
   * @returns Promise resolving to updated domain
   */
  public async removeThreatCategory(category: string): Promise<this> {
    this.threat_categories = this.threat_categories.filter(c => c !== category);
    return this.save();
  }

  /**
   * Add tag
   * @param tag Tag to add
   * @returns Promise resolving to updated domain
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Remove tag
   * @param tag Tag to remove
   * @returns Promise resolving to updated domain
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  /**
   * Block the domain
   * @param reason Optional reason for blocking
   * @returns Promise resolving to updated domain
   */
  public async block(reason?: string): Promise<this> {
    this.status = 'blocked';
    if (reason) {
      this.metadata = {
        ...this.metadata,
        block_reason: reason,
        blocked_at: new Date()
      };
    }
    return this.save();
  }

  /**
   * Whitelist the domain
   * @param reason Optional reason for whitelisting
   * @returns Promise resolving to updated domain
   */
  public async whitelist(reason?: string): Promise<this> {
    this.status = 'whitelisted';
    if (reason) {
      this.metadata = {
        ...this.metadata,
        whitelist_reason: reason,
        whitelisted_at: new Date()
      };
    }
    return this.save();
  }

  /**
   * Start monitoring the domain
   * @param monitoringConfig Optional monitoring configuration
   * @returns Promise resolving to updated domain
   */
  public async startMonitoring(monitoringConfig?: Record<string, any>): Promise<this> {
    this.status = 'monitoring';
    if (monitoringConfig) {
      this.metadata = {
        ...this.metadata,
        monitoring_config: monitoringConfig,
        monitoring_started_at: new Date()
      };
    }
    return this.save();
  }

  // Static methods
  /**
   * Find domain by name
   * @param domainName Domain name to search for
   * @returns Promise resolving to domain or null
   */
  static async findByDomain(domainName: string): Promise<DomainIntelligence | null> {
    return this.findOne({ where: { domain_name: domainName } });
  }

  /**
   * Find domains by classification
   * @param classification Classification to filter by
   * @returns Promise resolving to domains with specified classification
   */
  static async findByClassification(classification: DomainIntelligenceAttributes['classification']): Promise<DomainIntelligence[]> {
    return this.findAll({
      where: { classification },
      order: [['reputation_score', 'ASC']]
    });
  }

  /**
   * Find malicious domains
   * @returns Promise resolving to malicious domains
   */
  static async findMalicious(): Promise<DomainIntelligence[]> {
    return this.findAll({
      where: { 
        classification: 'malicious'
      },
      order: [['reputation_score', 'ASC']]
    });
  }

  /**
   * Find suspicious domains
   * @returns Promise resolving to suspicious domains
   */
  static async findSuspicious(): Promise<DomainIntelligence[]> {
    return this.findAll({
      where: { 
        classification: 'suspicious'
      },
      order: [['reputation_score', 'ASC']]
    });
  }

  /**
   * Find domains by reputation score range
   * @param minScore Minimum reputation score
   * @param maxScore Maximum reputation score
   * @returns Promise resolving to domains within reputation range
   */
  static async findByReputationRange(minScore: number, maxScore: number): Promise<DomainIntelligence[]> {
    return this.findAll({
      where: {
        reputation_score: {
          [Op.between]: [minScore, maxScore]
        }
      },
      order: [['reputation_score', 'DESC']]
    });
  }

  /**
   * Find recently registered domains
   * @param days Number of days to look back (default: 30)
   * @returns Promise resolving to recently registered domains
   */
  static async findRecentlyRegistered(days: number = 30): Promise<DomainIntelligence[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        registration_date: { [Op.gte]: cutoffDate }
      },
      order: [['registration_date', 'DESC']]
    });
  }

  /**
   * Find expiring domains
   * @param days Number of days to look ahead (default: 30)
   * @returns Promise resolving to domains expiring soon
   */
  static async findExpiring(days: number = 30): Promise<DomainIntelligence[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.findAll({
      where: {
        expiration_date: {
          [Op.between]: [new Date(), futureDate]
        }
      },
      order: [['expiration_date', 'ASC']]
    });
  }

  /**
   * Find domains by IP address
   * @param ipAddress IP address to search for
   * @returns Promise resolving to domains associated with the IP
   */
  static async findByIp(ipAddress: string): Promise<DomainIntelligence[]> {
    return this.findAll({
      where: {
        associated_ips: { [Op.contains]: [ipAddress] }
      },
      order: [['reputation_score', 'ASC']]
    });
  }

  /**
   * Find domains by threat category
   * @param category Threat category to search for
   * @returns Promise resolving to domains with specified threat category
   */
  static async findByThreatCategory(category: string): Promise<DomainIntelligence[]> {
    return this.findAll({
      where: {
        threat_categories: { [Op.contains]: [category] }
      },
      order: [['reputation_score', 'ASC']]
    });
  }

  /**
   * Find domains by status
   * @param status Status to filter by
   * @returns Promise resolving to domains with specified status
   */
  static async findByStatus(status: DomainIntelligenceAttributes['status']): Promise<DomainIntelligence[]> {
    return this.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find blocked domains
   * @returns Promise resolving to blocked domains
   */
  static async findBlocked(): Promise<DomainIntelligence[]> {
    return this.findAll({
      where: { status: 'blocked' },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find whitelisted domains
   * @returns Promise resolving to whitelisted domains
   */
  static async findWhitelisted(): Promise<DomainIntelligence[]> {
    return this.findAll({
      where: { status: 'whitelisted' },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get classification distribution statistics
   * @returns Promise resolving to classification stats
   */
  static async getClassificationStats(): Promise<Array<{
    classification: string;
    count: number;
    avg_reputation: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'classification',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('reputation_score')), 'avg_reputation']
      ],
      group: ['classification'],
      order: [['classification', 'ASC']]
    });
    
    return results.map(r => ({
      classification: r.classification,
      count: parseInt((r as any).getDataValue('count')),
      avg_reputation: parseFloat((r as any).getDataValue('avg_reputation')) || 0
    }));
  }

  /**
   * Get overall domain statistics
   * @returns Promise resolving to comprehensive stats
   */
  static async getOverallStats(): Promise<{
    total_domains: number;
    malicious_domains: number;
    suspicious_domains: number;
    clean_domains: number;
    blocked_domains: number;
    avg_reputation_score: number;
    recently_registered: number;
  }> {
    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - 30);
    
    const [
      totalDomains,
      maliciousDomains,
      suspiciousDomains,
      cleanDomains,
      blockedDomains,
      recentlyRegistered,
      avgReputationResult
    ] = await Promise.all([
      this.count(),
      this.count({ where: { classification: 'malicious' } }),
      this.count({ where: { classification: 'suspicious' } }),
      this.count({ where: { classification: 'clean' } }),
      this.count({ where: { status: 'blocked' } }),
      this.count({ where: { registration_date: { [Op.gte]: recentCutoff } } }),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('AVG', this.sequelize!.col('reputation_score')), 'avg_reputation']
        ]
      }).then(results => results[0])
    ]);

    return {
      total_domains: totalDomains,
      malicious_domains: maliciousDomains,
      suspicious_domains: suspiciousDomains,
      clean_domains: cleanDomains,
      blocked_domains: blockedDomains,
      avg_reputation_score: parseFloat((avgReputationResult as any).getDataValue('avg_reputation')) || 0,
      recently_registered: recentlyRegistered
    };
  }

  /**
   * Create domain intelligence with validation
   * @param data Domain data to create
   * @returns Promise resolving to created domain
   */
  static async createDomain(data: DomainIntelligenceCreationAttributes): Promise<DomainIntelligence> {
    // Validate domain name format
    if (!data.domain_name || !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.domain_name)) {
      throw new Error('Invalid domain name format');
    }

    // Validate reputation score
    if (data.reputation_score !== undefined && (data.reputation_score < 0 || data.reputation_score > 100)) {
      throw new Error('Reputation score must be between 0 and 100');
    }

    // Check for duplicate domain
    const existingDomain = await this.findByDomain(data.domain_name);
    if (existingDomain) {
      throw new Error('Domain already exists');
    }

    // Set first seen if not provided
    if (!data.first_seen) {
      data.first_seen = new Date();
    }

    return this.create(data);
  }
}

export default DomainIntelligence;
