/**
 * CVE SEQUELIZE MODEL
 * Represents Common Vulnerabilities and Exposures with comprehensive type safety
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
  Index,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { ThreatActorCVE } from './ThreatActorCVE.model';
// import { IncidentCVE } from './IncidentCVE.model'; // Optional - may not exist

// CVE Attributes Interface
export interface CVEAttributes {
  /** Unique identifier for the CVE record */
  id: number;
  /** CVE identifier (e.g., "CVE-2023-1234") */
  cve_id: string;
  /** Detailed description of the vulnerability */
  description: string;
  /** CVSS base score */
  cvss_score?: number;
  /** CVSS severity rating */
  cvss_severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  /** CVSS version used for scoring */
  cvss_version?: '2.0' | '3.0' | '3.1';
  /** CVSS vector string and components */
  cvss_vector: Record<string, any>;
  /** When the CVE was published */
  published_date?: Date;
  /** When the CVE was last modified */
  modified_date?: Date;
  /** Associated Common Weakness Enumeration IDs */
  cwe_ids: string[];
  /** Products affected by this vulnerability */
  affected_products: string[];
  /** Vendor names associated with affected products */
  vendor_names: string[];
  /** Reference URLs and sources */
  references: string[];
  /** Current status of the CVE */
  status: 'PUBLISHED' | 'MODIFIED' | 'REJECTED' | 'DISPUTED';
  /** Classification tags */
  tags: string[];
  /** Whether vulnerability is exploited in the wild */
  exploited_in_wild: boolean;
  /** Whether public exploits are available */
  has_exploit: boolean;
  /** Threat intelligence data */
  threat_intelligence: Record<string, any>;
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// CVE Creation Attributes Interface
export interface CVECreationAttributes extends Optional<CVEAttributes,
  'id' | 'cvss_score' | 'cvss_severity' | 'cvss_version' | 'cvss_vector' | 
  'published_date' | 'modified_date' | 'cwe_ids' | 'affected_products' | 
  'vendor_names' | 'references' | 'status' | 'tags' | 'exploited_in_wild' | 
  'has_exploit' | 'threat_intelligence' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'cves',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['cve_id'], unique: true },
    { fields: ['cvss_score'] },
    { fields: ['cvss_severity'] },
    { fields: ['published_date'] },
    { fields: ['modified_date'] },
    { fields: ['status'] },
    { fields: ['exploited_in_wild'] },
    { fields: ['has_exploit'] },
    { fields: ['created_at'] }
  ]
})
export class CVE extends Model<CVEAttributes, CVECreationAttributes> implements CVEAttributes {
  /** Unique identifier for the CVE record */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** CVE identifier (e.g., "CVE-2023-1234") */
  @AllowNull(false)
  @Unique
  @Length({ min: 13, max: 20 })
  @Column(DataType.STRING(20))
  declare cve_id: string;

  /** Detailed description of the vulnerability */
  @AllowNull(false)
  @Length({ min: 1 })
  @Column(DataType.TEXT)
  declare description: string;

  /** CVSS base score */
  @AllowNull(true)
  @Index
  @Column(DataType.DECIMAL(3, 1))
  declare cvss_score?: number;

  /** CVSS severity rating */
  @AllowNull(true)
  @Index
  @Column(DataType.ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE'))
  declare cvss_severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

  /** CVSS version used for scoring */
  @AllowNull(true)
  @Column(DataType.ENUM('2.0', '3.0', '3.1'))
  declare cvss_version?: '2.0' | '3.0' | '3.1';

  /** CVSS vector string and components */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare cvss_vector: Record<string, any>;

  /** When the CVE was published */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare published_date?: Date;

  /** When the CVE was last modified */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare modified_date?: Date;

  /** Associated Common Weakness Enumeration IDs */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare cwe_ids: string[];

  /** Products affected by this vulnerability */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare affected_products: string[];

  /** Vendor names associated with affected products */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare vendor_names: string[];

  /** Reference URLs and sources */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare references: string[];

  /** Current status of the CVE */
  @AllowNull(false)
  @Default('PUBLISHED')
  @Index
  @Column(DataType.ENUM('PUBLISHED', 'MODIFIED', 'REJECTED', 'DISPUTED'))
  declare status: 'PUBLISHED' | 'MODIFIED' | 'REJECTED' | 'DISPUTED';

  /** Classification tags */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Whether vulnerability is exploited in the wild */
  @AllowNull(false)
  @Default(false)
  @Index
  @Column(DataType.BOOLEAN)
  declare exploited_in_wild: boolean;

  /** Whether public exploits are available */
  @AllowNull(false)
  @Default(false)
  @Index
  @Column(DataType.BOOLEAN)
  declare has_exploit: boolean;

  /** Threat intelligence data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare threat_intelligence: Record<string, any>;

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
  /** Associated threat actor CVE relationships */
  @HasMany(() => ThreatActorCVE, {
    foreignKey: 'cve_id',
    as: 'threat_actor_cves',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare threat_actor_cves?: ThreatActorCVE[];

  /** Associated incident CVE relationships */
  // @HasMany(() => IncidentCVE, {
  //   foreignKey: 'cve_id',
  //   as: 'incident_cves',
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE'
  // })
  // declare incident_cves?: IncidentCVE[];

  // Instance methods
  /**
   * Get severity level color for UI display
   * @returns Hex color code for severity
   */
  public getSeverityColor(): string {
    switch (this.cvss_severity) {
      case 'CRITICAL': return '#d32f2f';
      case 'HIGH': return '#f57c00';
      case 'MEDIUM': return '#fbc02d';
      case 'LOW': return '#388e3c';
      case 'NONE': return '#9e9e9e';
      default: return '#757575';
    }
  }

  /**
   * Check if this CVE is high priority
   * @returns True if critical/high severity, exploited, or has exploits
   */
  public isHighPriority(): boolean {
    return (this.cvss_score !== undefined && this.cvss_score >= 7.0) || 
           this.exploited_in_wild || 
           this.has_exploit;
  }

  /**
   * Check if this CVE is critical severity
   * @returns True if severity is CRITICAL
   */
  public isCritical(): boolean {
    return this.cvss_severity === 'CRITICAL';
  }

  /**
   * Check if this CVE is actively exploited
   * @returns True if exploited in wild
   */
  public isExploitedInWild(): boolean {
    return this.exploited_in_wild;
  }

  /**
   * Check if this CVE has public exploits
   * @returns True if exploits are available
   */
  public hasPublicExploit(): boolean {
    return this.has_exploit;
  }

  /**
   * Get numeric severity score
   * @returns Numeric score (0-4) based on severity
   */
  public getSeverityScore(): number {
    const scores: Record<string, number> = {
      'CRITICAL': 4,
      'HIGH': 3,
      'MEDIUM': 2,
      'LOW': 1,
      'NONE': 0
    };
    return scores[this.cvss_severity || 'NONE'] || 0;
  }

  /**
   * Get threat score combining multiple risk factors
   * @returns Combined threat score (0-10)
   */
  public getThreatScore(): number {
    let score = this.cvss_score || 0;
    
    // Add bonus for exploitation
    if (this.exploited_in_wild) score += 2;
    if (this.has_exploit) score += 1;
    
    // Cap at 10
    return Math.min(score, 10);
  }

  /**
   * Get age of CVE in days
   * @returns Age in days since publication
   */
  public getAge(): number {
    if (!this.published_date) return 0;
    const diffTime = new Date().getTime() - this.published_date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days since last modification
   * @returns Days since last modification, or null if never modified
   */
  public getDaysSinceModified(): number | null {
    if (!this.modified_date) return null;
    const diffTime = new Date().getTime() - this.modified_date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if CVE affects a specific vendor
   * @param vendor Vendor name to check
   * @returns True if vendor is affected
   */
  public affectsVendor(vendor: string): boolean {
    return this.vendor_names.some(v => 
      v.toLowerCase().includes(vendor.toLowerCase())
    );
  }

  /**
   * Check if CVE affects a specific product
   * @param product Product name to check
   * @returns True if product is affected
   */
  public affectsProduct(product: string): boolean {
    return this.affected_products.some(p => 
      p.toLowerCase().includes(product.toLowerCase())
    );
  }

  /**
   * Get CVE year from ID
   * @returns Year from CVE ID
   */
  public getCveYear(): number {
    const match = this.cve_id.match(/CVE-(\d{4})-/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Check if CVE is recent (within last 30 days)
   * @returns True if published recently
   */
  public isRecent(): boolean {
    return this.getAge() <= 30;
  }

  /**
   * Mark as exploited in wild
   * @returns Promise resolving to updated CVE
   */
  public async markExploitedInWild(): Promise<this> {
    this.exploited_in_wild = true;
    return this.save();
  }

  /**
   * Mark as having public exploit
   * @returns Promise resolving to updated CVE
   */
  public async markHasExploit(): Promise<this> {
    this.has_exploit = true;
    return this.save();
  }

  /**
   * Update CVSS score and severity
   * @param score CVSS score (0-10)
   * @param version CVSS version
   * @returns Promise resolving to updated CVE
   */
  public async updateCVSS(score: number, version: CVEAttributes['cvss_version']): Promise<this> {
    this.cvss_score = score;
    this.cvss_version = version;
    
    // Auto-determine severity based on score
    if (score >= 9.0) this.cvss_severity = 'CRITICAL';
    else if (score >= 7.0) this.cvss_severity = 'HIGH';
    else if (score >= 4.0) this.cvss_severity = 'MEDIUM';
    else if (score > 0.0) this.cvss_severity = 'LOW';
    else this.cvss_severity = 'NONE';
    
    this.modified_date = new Date();
    return this.save();
  }

  /**
   * Add a tag to the CVE
   * @param tag Tag to add
   * @returns Promise resolving to updated CVE
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a tag from the CVE
   * @param tag Tag to remove
   * @returns Promise resolving to updated CVE
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  // Static methods
  /**
   * Find CVE by CVE ID
   * @param cveId CVE identifier (e.g., "CVE-2023-1234")
   * @returns Promise resolving to CVE or null
   */
  static async findByCveId(cveId: string): Promise<CVE | null> {
    return this.findOne({ where: { cve_id: cveId } });
  }

  /**
   * Find CVEs by severity level
   * @param severity Severity level to filter by
   * @returns Promise resolving to CVEs with specified severity
   */
  static async findBySeverity(severity: CVEAttributes['cvss_severity']): Promise<CVE[]> {
    return this.findAll({
      where: { cvss_severity: severity },
      order: [['cvss_score', 'DESC']]
    });
  }

  /**
   * Find CVEs within CVSS score range
   * @param minScore Minimum CVSS score
   * @param maxScore Maximum CVSS score
   * @returns Promise resolving to CVEs in score range
   */
  static async findByScoreRange(minScore: number, maxScore: number): Promise<CVE[]> {
    return this.findAll({
      where: {
        cvss_score: {
          [Op.between]: [minScore, maxScore]
        }
      },
      order: [['cvss_score', 'DESC']]
    });
  }

  /**
   * Find CVEs exploited in the wild
   * @returns Promise resolving to exploited CVEs
   */
  static async findExploitedInWild(): Promise<CVE[]> {
    return this.findAll({
      where: { exploited_in_wild: true },
      order: [['published_date', 'DESC']]
    });
  }

  /**
   * Find CVEs with public exploits
   * @returns Promise resolving to CVEs with exploits
   */
  static async findWithExploits(): Promise<CVE[]> {
    return this.findAll({
      where: { has_exploit: true },
      order: [['cvss_score', 'DESC']]
    });
  }

  /**
   * Find high-priority CVEs
   * @returns Promise resolving to high-priority CVEs
   */
  static async findHighPriority(): Promise<CVE[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { cvss_score: { [Op.gte]: 7.0 } },
          { exploited_in_wild: true },
          { has_exploit: true }
        ]
      },
      order: [['cvss_score', 'DESC']]
    });
  }

  /**
   * Find CVEs by vendor
   * @param vendor Vendor name to search for
   * @returns Promise resolving to CVEs affecting vendor
   */
  static async findByVendor(vendor: string): Promise<CVE[]> {
    return this.findAll({
      where: {
        vendor_names: {
          [Op.contains]: [vendor]
        }
      },
      order: [['published_date', 'DESC']]
    });
  }

  /**
   * Find CVEs by affected product
   * @param product Product name to search for
   * @returns Promise resolving to CVEs affecting product
   */
  static async findByProduct(product: string): Promise<CVE[]> {
    return this.findAll({
      where: {
        affected_products: {
          [Op.contains]: [product]
        }
      },
      order: [['published_date', 'DESC']]
    });
  }

  /**
   * Find recent CVEs within specified days
   * @param days Number of days to look back (default: 30)
   * @returns Promise resolving to recent CVEs
   */
  static async findRecent(days: number = 30): Promise<CVE[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        published_date: {
          [Op.gte]: cutoffDate
        }
      },
      order: [['published_date', 'DESC']]
    });
  }

  /**
   * Find CVEs by status
   * @param status CVE status to filter by
   * @returns Promise resolving to CVEs with specified status
   */
  static async findByStatus(status: CVEAttributes['status']): Promise<CVE[]> {
    return this.findAll({
      where: { status },
      order: [['published_date', 'DESC']]
    });
  }

  /**
   * Find CVEs by CWE ID
   * @param cweId Common Weakness Enumeration ID
   * @returns Promise resolving to CVEs with specified CWE
   */
  static async findByCWE(cweId: string): Promise<CVE[]> {
    return this.findAll({
      where: {
        cwe_ids: {
          [Op.contains]: [cweId]
        }
      },
      order: [['cvss_score', 'DESC']]
    });
  }

  /**
   * Find CVEs by publication year
   * @param year Year to filter by
   * @returns Promise resolving to CVEs from specified year
   */
  static async findByYear(year: number): Promise<CVE[]> {
    return this.findAll({
      where: {
        cve_id: {
          [Op.like]: `CVE-${year}-%`
        }
      },
      order: [['published_date', 'DESC']]
    });
  }

  /**
   * Search CVEs by text query
   * @param query Search query
   * @returns Promise resolving to matching CVEs
   */
  static async searchCVEs(query: string): Promise<CVE[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { cve_id: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['cvss_score', 'DESC']]
    });
  }

  /**
   * Get severity distribution statistics
   * @returns Promise resolving to severity statistics
   */
  static async getSeverityStats(): Promise<Array<{ severity: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'cvss_severity',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['cvss_severity']
    });
    
    return results.map(r => ({
      severity: r.cvss_severity || 'UNKNOWN',
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get vendor distribution statistics
   * @param limit Maximum number of vendors to return
   * @returns Promise resolving to vendor statistics
   */
  static async getVendorStats(limit: number = 10): Promise<Array<{ vendor: string; count: number }>> {
    const cves = await this.findAll({
      attributes: ['vendor_names']
    });
    
    const vendorCounts: Record<string, number> = {};
    cves.forEach(cve => {
      cve.vendor_names.forEach(vendor => {
        vendorCounts[vendor] = (vendorCounts[vendor] || 0) + 1;
      });
    });
    
    return Object.entries(vendorCounts)
      .map(([vendor, count]) => ({ vendor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get threat statistics summary
   * @returns Promise resolving to threat statistics
   */
  static async getThreatStats(): Promise<{
    total: number;
    exploited_in_wild: number;
    with_exploits: number;
    high_severity: number;
    critical_severity: number;
    recent: number;
  }> {
    const [
      totalCount,
      exploitedCount,
      withExploitsCount,
      highSeverityCount,
      criticalSeverityCount,
      recentCount
    ] = await Promise.all([
      this.count(),
      this.count({ where: { exploited_in_wild: true } }),
      this.count({ where: { has_exploit: true } }),
      this.count({ where: { cvss_score: { [Op.gte]: 7.0 } } }),
      this.count({ where: { cvss_severity: 'CRITICAL' } }),
      this.count({ 
        where: { 
          published_date: { 
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          } 
        } 
      })
    ]);

    return {
      total: totalCount,
      exploited_in_wild: exploitedCount,
      with_exploits: withExploitsCount,
      high_severity: highSeverityCount,
      critical_severity: criticalSeverityCount,
      recent: recentCount
    };
  }

  /**
   * Get CVE trend data over time
   * @param days Number of days to analyze (default: 30)
   * @returns Promise resolving to trend data
   */
  static async getTrendStats(days: number = 30): Promise<Array<{ date: string; count: number }>> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('DATE', this.sequelize!.col('published_date')), 'date'],
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      where: {
        published_date: { [Op.gte]: cutoffDate }
      },
      group: [this.sequelize!.fn('DATE', this.sequelize!.col('published_date'))],
      order: [[this.sequelize!.fn('DATE', this.sequelize!.col('published_date')), 'ASC']]
    });
    
    return results.map(r => ({
      date: (r as any).getDataValue('date'),
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get top CWE categories
   * @param limit Maximum number of CWEs to return
   * @returns Promise resolving to top CWE statistics
   */
  static async getTopCWEs(limit: number = 10): Promise<Array<{ cwe_id: string; count: number }>> {
    const cves = await this.findAll({
      attributes: ['cwe_ids']
    });
    
    const cweCounts: Record<string, number> = {};
    cves.forEach(cve => {
      cve.cwe_ids.forEach(cweId => {
        cweCounts[cweId] = (cweCounts[cweId] || 0) + 1;
      });
    });
    
    return Object.entries(cweCounts)
      .map(([cwe_id, count]) => ({ cwe_id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Create CVE with validation
   * @param data CVE data to create
   * @returns Promise resolving to created CVE
   */
  static async createCVE(data: CVECreationAttributes): Promise<CVE> {
    // Validate CVE ID format
    if (!/^CVE-\d{4}-\d{4,}$/.test(data.cve_id)) {
      throw new Error('CVE ID must follow format CVE-YYYY-NNNN');
    }

    // Check for duplicate CVE ID
    const existing = await this.findOne({ where: { cve_id: data.cve_id } });
    if (existing) {
      throw new Error(`CVE with ID ${data.cve_id} already exists`);
    }

    // Set published date if not provided
    if (!data.published_date) {
      data.published_date = new Date();
    }

    return this.create(data);
  }

  /**
   * Bulk import CVEs with validation
   * @param cveData Array of CVE data
   * @returns Promise resolving to import results
   */
  static async bulkImportCVEs(cveData: CVECreationAttributes[]): Promise<{
    created: number;
    updated: number;
    errors: string[];
  }> {
    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const data of cveData) {
      try {
        // Validate CVE ID format
        if (!/^CVE-\d{4}-\d{4,}$/.test(data.cve_id)) {
          results.errors.push(`Invalid CVE ID format: ${data.cve_id}`);
          continue;
        }

        const existing = await this.findOne({ where: { cve_id: data.cve_id } });
        
        if (existing) {
          await existing.update(data);
          results.updated++;
        } else {
          await this.create(data);
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Failed to process ${data.cve_id}: ${error}`);
      }
    }

    return results;
  }
}

export default CVE;
