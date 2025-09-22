/**
 * DARK WEB INTELLIGENCE SEQUELIZE MODEL
 * Represents dark web monitoring and intelligence with comprehensive type safety
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

// DarkWebIntel Attributes Interface
export interface DarkWebIntelAttributes {
  /** Unique identifier for the dark web intelligence */
  id: number;
  /** Source URL where the intelligence was found */
  source_url: string;
  /** Type of content found on the dark web */
  content_type: 'marketplace' | 'forum' | 'leak' | 'ransomware' | 'botnet' | 'exploit' | 'phishing' | 'other';
  /** Summary of the content */
  content_summary: string;
  /** Threat level assessment */
  threat_level: 'info' | 'low' | 'medium' | 'high' | 'critical';
  /** Keywords that were matched during monitoring */
  keywords_matched: string[];
  /** Entities mentioned in the content */
  entities_mentioned: string[];
  /** When the intelligence was discovered */
  discovered_date: Date;
  /** Analysis results from automated processing */
  analysis_results: Record<string, any>;
  /** Current status of the intelligence */
  status: 'active' | 'verified' | 'false_positive' | 'archived' | 'investigating';
  /** Confidence score (0-100) */
  confidence_score: number;
  /** Relevance score (0-100) */
  relevance_score: number;
  /** Geographic indicators */
  geographic_indicators: string[];
  /** Associated threat actors */
  associated_actors: string[];
  /** Classification tags */
  tags: string[];
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// DarkWebIntel Creation Attributes Interface
export interface DarkWebIntelCreationAttributes extends Optional<DarkWebIntelAttributes,
  'id' | 'content_type' | 'threat_level' | 'keywords_matched' | 'entities_mentioned' |
  'analysis_results' | 'status' | 'confidence_score' | 'relevance_score' | 'geographic_indicators' |
  'associated_actors' | 'tags' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'dark_web_intel',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['source_url'] },
    { fields: ['content_type'] },
    { fields: ['threat_level'] },
    { fields: ['status'] },
    { fields: ['discovered_date'] },
    { fields: ['confidence_score'] },
    { fields: ['relevance_score'] },
    { fields: ['created_at'] }
  ]
})
export class DarkWebIntel extends Model<DarkWebIntelAttributes, DarkWebIntelCreationAttributes> implements DarkWebIntelAttributes {
  /** Unique identifier for the dark web intelligence */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Source URL where the intelligence was found */
  @AllowNull(false)
  @Index
  @Length({ min: 1, max: 500 })
  @Column(DataType.STRING(500))
  declare source_url: string;

  /** Type of content found on the dark web */
  @AllowNull(false)
  @Default('other')
  @Index
  @Column(DataType.ENUM('marketplace', 'forum', 'leak', 'ransomware', 'botnet', 'exploit', 'phishing', 'other'))
  declare content_type: 'marketplace' | 'forum' | 'leak' | 'ransomware' | 'botnet' | 'exploit' | 'phishing' | 'other';

  /** Summary of the content */
  @AllowNull(false)
  @Column(DataType.TEXT)
  declare content_summary: string;

  /** Threat level assessment */
  @AllowNull(false)
  @Default('medium')
  @Index
  @Column(DataType.ENUM('info', 'low', 'medium', 'high', 'critical'))
  declare threat_level: 'info' | 'low' | 'medium' | 'high' | 'critical';

  /** Keywords that were matched during monitoring */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare keywords_matched: string[];

  /** Entities mentioned in the content */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare entities_mentioned: string[];

  /** When the intelligence was discovered */
  @AllowNull(false)
  @Index
  @Column(DataType.DATE)
  declare discovered_date: Date;

  /** Analysis results from automated processing */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare analysis_results: Record<string, any>;

  /** Current status of the intelligence */
  @AllowNull(false)
  @Default('active')
  @Index
  @Column(DataType.ENUM('active', 'verified', 'false_positive', 'archived', 'investigating'))
  declare status: 'active' | 'verified' | 'false_positive' | 'archived' | 'investigating';

  /** Confidence score (0-100) */
  @AllowNull(false)
  @Default(50)
  @Index
  @Column(DataType.INTEGER)
  declare confidence_score: number;

  /** Relevance score (0-100) */
  @AllowNull(false)
  @Default(50)
  @Index
  @Column(DataType.INTEGER)
  declare relevance_score: number;

  /** Geographic indicators */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare geographic_indicators: string[];

  /** Associated threat actors */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare associated_actors: string[];

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

  // Instance methods
  /**
   * Check if this is high threat intelligence
   * @returns True if threat level is high or critical
   */
  public isHighThreat(): boolean {
    return this.threat_level === 'high' || this.threat_level === 'critical';
  }

  /**
   * Check if this is critical threat intelligence
   * @returns True if threat level is critical
   */
  public isCriticalThreat(): boolean {
    return this.threat_level === 'critical';
  }

  /**
   * Check if this is medium threat intelligence
   * @returns True if threat level is medium
   */
  public isMediumThreat(): boolean {
    return this.threat_level === 'medium';
  }

  /**
   * Check if this is low threat intelligence
   * @returns True if threat level is low
   */
  public isLowThreat(): boolean {
    return this.threat_level === 'low';
  }

  /**
   * Check if intelligence is active
   * @returns True if status is active
   */
  public isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Check if intelligence is verified
   * @returns True if status is verified
   */
  public isVerified(): boolean {
    return this.status === 'verified';
  }

  /**
   * Check if intelligence is false positive
   * @returns True if status is false_positive
   */
  public isFalsePositive(): boolean {
    return this.status === 'false_positive';
  }

  /**
   * Check if intelligence is archived
   * @returns True if status is archived
   */
  public isArchived(): boolean {
    return this.status === 'archived';
  }

  /**
   * Check if intelligence is being investigated
   * @returns True if status is investigating
   */
  public isInvestigating(): boolean {
    return this.status === 'investigating';
  }

  /**
   * Check if intelligence has high confidence
   * @param threshold Confidence threshold (default: 80)
   * @returns True if confidence score >= threshold
   */
  public hasHighConfidence(threshold: number = 80): boolean {
    return this.confidence_score >= threshold;
  }

  /**
   * Check if intelligence is highly relevant
   * @param threshold Relevance threshold (default: 80)
   * @returns True if relevance score >= threshold
   */
  public isHighlyRelevant(threshold: number = 80): boolean {
    return this.relevance_score >= threshold;
  }

  /**
   * Get the age of the intelligence in days
   * @returns Age in days since discovered
   */
  public getAge(): number {
    const diffTime = new Date().getTime() - this.discovered_date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get number of keywords matched
   * @returns Count of matched keywords
   */
  public getKeywordMatchCount(): number {
    return this.keywords_matched.length;
  }

  /**
   * Get number of entities mentioned
   * @returns Count of mentioned entities
   */
  public getEntityCount(): number {
    return this.entities_mentioned.length;
  }

  /**
   * Check if specific keyword was matched
   * @param keyword Keyword to check
   * @returns True if keyword is in matched list
   */
  public hasKeyword(keyword: string): boolean {
    return this.keywords_matched.includes(keyword);
  }

  /**
   * Check if specific entity is mentioned
   * @param entity Entity to check
   * @returns True if entity is mentioned
   */
  public hasEntity(entity: string): boolean {
    return this.entities_mentioned.includes(entity);
  }

  /**
   * Check if intelligence has specific tag
   * @param tag Tag to check for
   * @returns True if tag exists
   */
  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Check if specific threat actor is associated
   * @param actor Threat actor to check
   * @returns True if actor is associated
   */
  public hasAssociatedActor(actor: string): boolean {
    return this.associated_actors.includes(actor);
  }

  /**
   * Get threat level as numeric value
   * @returns Numeric threat level (1-5, higher is more severe)
   */
  public getThreatLevelNumeric(): number {
    const threatMap = { info: 1, low: 2, medium: 3, high: 4, critical: 5 };
    return threatMap[this.threat_level];
  }

  /**
   * Get combined risk score (confidence * relevance * threat_level)
   * @returns Combined risk score (0-2500)
   */
  public getCombinedRiskScore(): number {
    return (this.confidence_score * this.relevance_score * this.getThreatLevelNumeric()) / 100;
  }

  /**
   * Get threat level color for UI display
   * @returns Color hex code for threat level
   */
  public getThreatColor(): string {
    const colorMap = {
      info: '#17A2B8',
      low: '#28A745',
      medium: '#FFC107',
      high: '#FD7E14',
      critical: '#DC3545'
    };
    return colorMap[this.threat_level];
  }

  /**
   * Verify the intelligence
   * @param verificationNotes Optional verification notes
   * @returns Promise resolving to updated intelligence
   */
  public async verify(verificationNotes?: string): Promise<this> {
    this.status = 'verified';
    if (verificationNotes) {
      this.metadata = {
        ...this.metadata,
        verification_notes: verificationNotes,
        verified_at: new Date()
      };
    }
    return this.save();
  }

  /**
   * Mark as false positive
   * @param reason Reason for false positive classification
   * @returns Promise resolving to updated intelligence
   */
  public async markFalsePositive(reason?: string): Promise<this> {
    this.status = 'false_positive';
    if (reason) {
      this.metadata = {
        ...this.metadata,
        false_positive_reason: reason,
        marked_false_positive_at: new Date()
      };
    }
    return this.save();
  }

  /**
   * Archive the intelligence
   * @param reason Optional reason for archiving
   * @returns Promise resolving to updated intelligence
   */
  public async archive(reason?: string): Promise<this> {
    this.status = 'archived';
    if (reason) {
      this.metadata = {
        ...this.metadata,
        archive_reason: reason,
        archived_at: new Date()
      };
    }
    return this.save();
  }

  /**
   * Start investigation
   * @param investigatorNotes Optional investigation notes
   * @returns Promise resolving to updated intelligence
   */
  public async startInvestigation(investigatorNotes?: string): Promise<this> {
    this.status = 'investigating';
    if (investigatorNotes) {
      this.metadata = {
        ...this.metadata,
        investigation_notes: investigatorNotes,
        investigation_started_at: new Date()
      };
    }
    return this.save();
  }

  /**
   * Update confidence score
   * @param score New confidence score (0-100)
   * @returns Promise resolving to updated intelligence
   */
  public async updateConfidence(score: number): Promise<this> {
    this.confidence_score = Math.max(0, Math.min(100, score));
    return this.save();
  }

  /**
   * Update relevance score
   * @param score New relevance score (0-100)
   * @returns Promise resolving to updated intelligence
   */
  public async updateRelevance(score: number): Promise<this> {
    this.relevance_score = Math.max(0, Math.min(100, score));
    return this.save();
  }

  /**
   * Add keyword match
   * @param keyword Keyword to add
   * @returns Promise resolving to updated intelligence
   */
  public async addKeyword(keyword: string): Promise<this> {
    if (!this.keywords_matched.includes(keyword)) {
      this.keywords_matched = [...this.keywords_matched, keyword];
      return this.save();
    }
    return this;
  }

  /**
   * Add entity mention
   * @param entity Entity to add
   * @returns Promise resolving to updated intelligence
   */
  public async addEntity(entity: string): Promise<this> {
    if (!this.entities_mentioned.includes(entity)) {
      this.entities_mentioned = [...this.entities_mentioned, entity];
      return this.save();
    }
    return this;
  }

  /**
   * Add tag
   * @param tag Tag to add
   * @returns Promise resolving to updated intelligence
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Add associated threat actor
   * @param actor Threat actor to associate
   * @returns Promise resolving to updated intelligence
   */
  public async addAssociatedActor(actor: string): Promise<this> {
    if (!this.associated_actors.includes(actor)) {
      this.associated_actors = [...this.associated_actors, actor];
      return this.save();
    }
    return this;
  }

  // Static methods
  /**
   * Find intelligence by content type
   * @param contentType Content type to search for
   * @returns Promise resolving to intelligence of specified type
   */
  static async findByType(contentType: DarkWebIntelAttributes['content_type']): Promise<DarkWebIntel[]> {
    return this.findAll({
      where: { content_type: contentType },
      order: [['discovered_date', 'DESC']]
    });
  }

  /**
   * Find intelligence by threat level
   * @param threatLevel Threat level to filter by
   * @returns Promise resolving to intelligence with specified threat level
   */
  static async findByThreatLevel(threatLevel: DarkWebIntelAttributes['threat_level']): Promise<DarkWebIntel[]> {
    return this.findAll({
      where: { threat_level: threatLevel },
      order: [['discovered_date', 'DESC']]
    });
  }

  /**
   * Find high threat intelligence
   * @returns Promise resolving to high and critical threat intelligence
   */
  static async findHighThreat(): Promise<DarkWebIntel[]> {
    return this.findAll({
      where: {
        threat_level: { [Op.in]: ['high', 'critical'] }
      },
      order: [['threat_level', 'DESC'], ['discovered_date', 'DESC']]
    });
  }

  /**
   * Find intelligence by status
   * @param status Status to filter by
   * @returns Promise resolving to intelligence with specified status
   */
  static async findByStatus(status: DarkWebIntelAttributes['status']): Promise<DarkWebIntel[]> {
    return this.findAll({
      where: { status },
      order: [['discovered_date', 'DESC']]
    });
  }

  /**
   * Find active intelligence
   * @returns Promise resolving to active intelligence
   */
  static async findActive(): Promise<DarkWebIntel[]> {
    return this.findAll({
      where: { status: 'active' },
      order: [['threat_level', 'DESC'], ['discovered_date', 'DESC']]
    });
  }

  /**
   * Find verified intelligence
   * @returns Promise resolving to verified intelligence
   */
  static async findVerified(): Promise<DarkWebIntel[]> {
    return this.findAll({
      where: { status: 'verified' },
      order: [['discovered_date', 'DESC']]
    });
  }

  /**
   * Find intelligence by keyword
   * @param keyword Keyword to search for
   * @returns Promise resolving to intelligence containing the keyword
   */
  static async findByKeyword(keyword: string): Promise<DarkWebIntel[]> {
    return this.findAll({
      where: {
        keywords_matched: { [Op.contains]: [keyword] }
      },
      order: [['discovered_date', 'DESC']]
    });
  }

  /**
   * Find intelligence by entity
   * @param entity Entity to search for
   * @returns Promise resolving to intelligence mentioning the entity
   */
  static async findByEntity(entity: string): Promise<DarkWebIntel[]> {
    return this.findAll({
      where: {
        entities_mentioned: { [Op.contains]: [entity] }
      },
      order: [['discovered_date', 'DESC']]
    });
  }

  /**
   * Find recent intelligence
   * @param days Number of days to look back (default: 30)
   * @returns Promise resolving to recent intelligence
   */
  static async findRecent(days: number = 30): Promise<DarkWebIntel[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        discovered_date: { [Op.gte]: cutoffDate }
      },
      order: [['discovered_date', 'DESC']]
    });
  }

  /**
   * Find high confidence intelligence
   * @param threshold Confidence threshold (default: 80)
   * @returns Promise resolving to high confidence intelligence
   */
  static async findHighConfidence(threshold: number = 80): Promise<DarkWebIntel[]> {
    return this.findAll({
      where: {
        confidence_score: { [Op.gte]: threshold }
      },
      order: [['confidence_score', 'DESC']]
    });
  }

  /**
   * Find highly relevant intelligence
   * @param threshold Relevance threshold (default: 80)
   * @returns Promise resolving to highly relevant intelligence
   */
  static async findHighlyRelevant(threshold: number = 80): Promise<DarkWebIntel[]> {
    return this.findAll({
      where: {
        relevance_score: { [Op.gte]: threshold }
      },
      order: [['relevance_score', 'DESC']]
    });
  }

  /**
   * Find intelligence by tag
   * @param tag Tag to search for
   * @returns Promise resolving to intelligence with the tag
   */
  static async findByTag(tag: string): Promise<DarkWebIntel[]> {
    return this.findAll({
      where: {
        tags: { [Op.contains]: [tag] }
      },
      order: [['discovered_date', 'DESC']]
    });
  }

  /**
   * Get content type distribution statistics
   * @returns Promise resolving to content type stats
   */
  static async getContentTypeStats(): Promise<Array<{
    content_type: string;
    count: number;
    avg_threat_level: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'content_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('AVG', this.sequelize!.literal(`CASE 
          WHEN threat_level = 'info' THEN 1
          WHEN threat_level = 'low' THEN 2
          WHEN threat_level = 'medium' THEN 3
          WHEN threat_level = 'high' THEN 4
          WHEN threat_level = 'critical' THEN 5
          ELSE 0 END`)), 'avg_threat_level']
      ],
      group: ['content_type'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      content_type: r.content_type,
      count: parseInt((r as any).getDataValue('count')),
      avg_threat_level: parseFloat((r as any).getDataValue('avg_threat_level')) || 0
    }));
  }

  /**
   * Get threat level distribution statistics
   * @returns Promise resolving to threat level stats
   */
  static async getThreatLevelStats(): Promise<Array<{
    threat_level: string;
    count: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'threat_level',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['threat_level'],
      order: [['threat_level', 'ASC']]
    });
    
    return results.map(r => ({
      threat_level: r.threat_level,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get overall intelligence statistics
   * @returns Promise resolving to comprehensive stats
   */
  static async getOverallStats(): Promise<{
    total_intelligence: number;
    active_intelligence: number;
    high_threat_intelligence: number;
    verified_intelligence: number;
    avg_confidence_score: number;
    avg_relevance_score: number;
    intelligence_this_week: number;
  }> {
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const [
      totalIntelligence,
      activeIntelligence,
      highThreatIntelligence,
      verifiedIntelligence,
      intelligenceThisWeek,
      avgConfidenceResult,
      avgRelevanceResult
    ] = await Promise.all([
      this.count(),
      this.count({ where: { status: 'active' } }),
      this.count({ where: { threat_level: { [Op.in]: ['high', 'critical'] } } }),
      this.count({ where: { status: 'verified' } }),
      this.count({ where: { discovered_date: { [Op.gte]: thisWeek } } }),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('AVG', this.sequelize!.col('confidence_score')), 'avg_confidence']
        ]
      }).then(results => results[0]),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('AVG', this.sequelize!.col('relevance_score')), 'avg_relevance']
        ]
      }).then(results => results[0])
    ]);

    return {
      total_intelligence: totalIntelligence,
      active_intelligence: activeIntelligence,
      high_threat_intelligence: highThreatIntelligence,
      verified_intelligence: verifiedIntelligence,
      avg_confidence_score: parseFloat((avgConfidenceResult as any).getDataValue('avg_confidence')) || 0,
      avg_relevance_score: parseFloat((avgRelevanceResult as any).getDataValue('avg_relevance')) || 0,
      intelligence_this_week: intelligenceThisWeek
    };
  }

  /**
   * Create dark web intelligence with validation
   * @param data Intelligence data to create
   * @returns Promise resolving to created intelligence
   */
  static async createIntelligence(data: DarkWebIntelCreationAttributes): Promise<DarkWebIntel> {
    // Validate required fields
    if (!data.source_url || !data.content_summary || !data.discovered_date) {
      throw new Error('Source URL, content summary, and discovered date are required');
    }

    // Validate confidence and relevance scores
    if (data.confidence_score !== undefined && (data.confidence_score < 0 || data.confidence_score > 100)) {
      throw new Error('Confidence score must be between 0 and 100');
    }

    if (data.relevance_score !== undefined && (data.relevance_score < 0 || data.relevance_score > 100)) {
      throw new Error('Relevance score must be between 0 and 100');
    }

    return this.create(data);
  }
}

export default DarkWebIntel;
