/**
 * EMAIL THREAT SEQUELIZE MODEL
 * Represents email-based threats and phishing analysis with comprehensive type safety
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

// EmailThreat Attributes Interface
export interface EmailThreatAttributes {
  /** Unique identifier for the email threat */
  id: number;
  /** Sender email address */
  sender_email: string;
  /** Recipient email address */
  recipient_email: string;
  /** Email subject line */
  subject: string;
  /** Type of email threat */
  threat_type: 'phishing' | 'malware' | 'spam' | 'business_email_compromise' | 'spoofing' | 'whaling' | 'other';
  /** Severity level of the threat */
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  /** Risk score (0-100) */
  risk_score: number;
  /** Email body content */
  email_body?: string;
  /** List of email attachments */
  attachments: string[];
  /** URLs found in the email */
  urls: string[];
  /** Email headers information */
  email_headers: Record<string, any>;
  /** Analysis results from security tools */
  analysis_results: Record<string, any>;
  /** Current status of the threat */
  status: 'detected' | 'blocked' | 'delivered' | 'quarantined' | 'false_positive' | 'investigating';
  /** When the email was received */
  received_date: Date;
  /** Sender IP address */
  sender_ip?: string;
  /** Message ID from email headers */
  message_id?: string;
  /** Campaign ID if part of a campaign */
  campaign_id?: string;
  /** Confidence score (0-100) */
  confidence_score: number;
  /** List of indicators of compromise */
  iocs: string[];
  /** Classification tags */
  tags: string[];
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// EmailThreat Creation Attributes Interface
export interface EmailThreatCreationAttributes extends Optional<EmailThreatAttributes,
  'id' | 'threat_type' | 'severity' | 'risk_score' | 'email_body' | 'attachments' | 'urls' |
  'email_headers' | 'analysis_results' | 'status' | 'sender_ip' | 'message_id' | 'campaign_id' |
  'confidence_score' | 'iocs' | 'tags' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'email_threats',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['sender_email'] },
    { fields: ['recipient_email'] },
    { fields: ['threat_type'] },
    { fields: ['severity'] },
    { fields: ['status'] },
    { fields: ['received_date'] },
    { fields: ['risk_score'] },
    { fields: ['confidence_score'] },
    { fields: ['campaign_id'] },
    { fields: ['created_at'] }
  ]
})
export class EmailThreat extends Model<EmailThreatAttributes, EmailThreatCreationAttributes> implements EmailThreatAttributes {
  /** Unique identifier for the email threat */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Sender email address */
  @AllowNull(false)
  @Index
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare sender_email: string;

  /** Recipient email address */
  @AllowNull(false)
  @Index
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare recipient_email: string;

  /** Email subject line */
  @AllowNull(false)
  @Length({ min: 1, max: 500 })
  @Column(DataType.STRING(500))
  declare subject: string;

  /** Type of email threat */
  @AllowNull(false)
  @Default('phishing')
  @Index
  @Column(DataType.ENUM('phishing', 'malware', 'spam', 'business_email_compromise', 'spoofing', 'whaling', 'other'))
  declare threat_type: 'phishing' | 'malware' | 'spam' | 'business_email_compromise' | 'spoofing' | 'whaling' | 'other';

  /** Severity level of the threat */
  @AllowNull(false)
  @Default('medium')
  @Index
  @Column(DataType.ENUM('info', 'low', 'medium', 'high', 'critical'))
  declare severity: 'info' | 'low' | 'medium' | 'high' | 'critical';

  /** Risk score (0-100) */
  @AllowNull(false)
  @Default(50)
  @Index
  @Column(DataType.INTEGER)
  declare risk_score: number;

  /** Email body content */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare email_body?: string;

  /** List of email attachments */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare attachments: string[];

  /** URLs found in the email */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare urls: string[];

  /** Email headers information */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare email_headers: Record<string, any>;

  /** Analysis results from security tools */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare analysis_results: Record<string, any>;

  /** Current status of the threat */
  @AllowNull(false)
  @Default('detected')
  @Index
  @Column(DataType.ENUM('detected', 'blocked', 'delivered', 'quarantined', 'false_positive', 'investigating'))
  declare status: 'detected' | 'blocked' | 'delivered' | 'quarantined' | 'false_positive' | 'investigating';

  /** When the email was received */
  @AllowNull(false)
  @Index
  @Column(DataType.DATE)
  declare received_date: Date;

  /** Sender IP address */
  @AllowNull(true)
  @Column(DataType.INET)
  declare sender_ip?: string;

  /** Message ID from email headers */
  @AllowNull(true)
  @Length({ max: 255 })
  @Column(DataType.STRING(255))
  declare message_id?: string;

  /** Campaign ID if part of a campaign */
  @AllowNull(true)
  @Index
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare campaign_id?: string;

  /** Confidence score (0-100) */
  @AllowNull(false)
  @Default(50)
  @Index
  @Column(DataType.INTEGER)
  declare confidence_score: number;

  /** List of indicators of compromise */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare iocs: string[];

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
   * Check if this is a high-risk threat
   * @returns True if severity is high/critical or risk score >= 80
   */
  public isHighRisk(): boolean {
    return this.severity === 'critical' || this.severity === 'high' || this.risk_score >= 80;
  }

  /**
   * Check if this is a critical threat
   * @returns True if severity is critical
   */
  public isCritical(): boolean {
    return this.severity === 'critical';
  }

  /**
   * Check if email has attachments
   * @returns True if attachments exist
   */
  public hasAttachments(): boolean {
    return this.attachments && this.attachments.length > 0;
  }

  /**
   * Check if email has URLs
   * @returns True if URLs exist
   */
  public hasUrls(): boolean {
    return this.urls && this.urls.length > 0;
  }

  /**
   * Check if threat is blocked
   * @returns True if status is blocked
   */
  public isBlocked(): boolean {
    return this.status === 'blocked';
  }

  /**
   * Check if threat was delivered
   * @returns True if status is delivered
   */
  public wasDelivered(): boolean {
    return this.status === 'delivered';
  }

  /**
   * Check if threat is quarantined
   * @returns True if status is quarantined
   */
  public isQuarantined(): boolean {
    return this.status === 'quarantined';
  }

  /**
   * Check if threat is false positive
   * @returns True if status is false_positive
   */
  public isFalsePositive(): boolean {
    return this.status === 'false_positive';
  }

  /**
   * Check if threat is being investigated
   * @returns True if status is investigating
   */
  public isInvestigating(): boolean {
    return this.status === 'investigating';
  }

  /**
   * Check if email is phishing
   * @returns True if threat type is phishing or whaling
   */
  public isPhishing(): boolean {
    return this.threat_type === 'phishing' || this.threat_type === 'whaling';
  }

  /**
   * Check if email contains malware
   * @returns True if threat type is malware
   */
  public hasMalware(): boolean {
    return this.threat_type === 'malware';
  }

  /**
   * Check if email is spam
   * @returns True if threat type is spam
   */
  public isSpam(): boolean {
    return this.threat_type === 'spam';
  }

  /**
   * Check if email is business email compromise
   * @returns True if threat type is business_email_compromise
   */
  public isBEC(): boolean {
    return this.threat_type === 'business_email_compromise';
  }

  /**
   * Get age of the threat in hours
   * @returns Age in hours since received
   */
  public getAge(): number {
    const diffTime = new Date().getTime() - this.received_date.getTime();
    return diffTime / (1000 * 60 * 60);
  }

  /**
   * Get number of attachments
   * @returns Count of attachments
   */
  public getAttachmentCount(): number {
    return this.attachments.length;
  }

  /**
   * Get number of URLs
   * @returns Count of URLs
   */
  public getUrlCount(): number {
    return this.urls.length;
  }

  /**
   * Get number of IOCs
   * @returns Count of indicators of compromise
   */
  public getIocCount(): number {
    return this.iocs.length;
  }

  /**
   * Check if email has specific tag
   * @param tag Tag to check for
   * @returns True if tag exists
   */
  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Check if email has specific IOC
   * @param ioc IOC to check for
   * @returns True if IOC exists
   */
  public hasIoc(ioc: string): boolean {
    return this.iocs.includes(ioc);
  }

  /**
   * Get severity level as numeric value
   * @returns Numeric severity (1-5, higher is more severe)
   */
  public getSeverityLevel(): number {
    const severityMap = { info: 1, low: 2, medium: 3, high: 4, critical: 5 };
    return severityMap[this.severity];
  }

  /**
   * Get combined threat score
   * @returns Combined score based on risk score, confidence, and severity
   */
  public getThreatScore(): number {
    const severityWeight = this.getSeverityLevel() / 5;
    const riskWeight = this.risk_score / 100;
    const confidenceWeight = this.confidence_score / 100;
    
    return Math.round((severityWeight + riskWeight + confidenceWeight) * 100 / 3);
  }

  /**
   * Get severity color for UI display
   * @returns Color hex code for severity level
   */
  public getSeverityColor(): string {
    const colorMap = {
      info: '#17A2B8',
      low: '#28A745',
      medium: '#FFC107',
      high: '#FD7E14',
      critical: '#DC3545'
    };
    return colorMap[this.severity];
  }

  /**
   * Block the email threat
   * @param reason Optional reason for blocking
   * @returns Promise resolving to updated threat
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
   * Quarantine the email threat
   * @param reason Optional reason for quarantining
   * @returns Promise resolving to updated threat
   */
  public async quarantine(reason?: string): Promise<this> {
    this.status = 'quarantined';
    if (reason) {
      this.metadata = {
        ...this.metadata,
        quarantine_reason: reason,
        quarantined_at: new Date()
      };
    }
    return this.save();
  }

  /**
   * Mark as false positive
   * @param reason Reason for false positive classification
   * @returns Promise resolving to updated threat
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
   * Start investigation
   * @param investigatorNotes Optional investigation notes
   * @returns Promise resolving to updated threat
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
   * Update risk score
   * @param score New risk score (0-100)
   * @returns Promise resolving to updated threat
   */
  public async updateRiskScore(score: number): Promise<this> {
    this.risk_score = Math.max(0, Math.min(100, score));
    return this.save();
  }

  /**
   * Update confidence score
   * @param score New confidence score (0-100)
   * @returns Promise resolving to updated threat
   */
  public async updateConfidence(score: number): Promise<this> {
    this.confidence_score = Math.max(0, Math.min(100, score));
    return this.save();
  }

  /**
   * Add IOC to threat
   * @param ioc Indicator of compromise to add
   * @returns Promise resolving to updated threat
   */
  public async addIoc(ioc: string): Promise<this> {
    if (!this.iocs.includes(ioc)) {
      this.iocs = [...this.iocs, ioc];
      return this.save();
    }
    return this;
  }

  /**
   * Add tag to threat
   * @param tag Tag to add
   * @returns Promise resolving to updated threat
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Add URL to threat
   * @param url URL to add
   * @returns Promise resolving to updated threat
   */
  public async addUrl(url: string): Promise<this> {
    if (!this.urls.includes(url)) {
      this.urls = [...this.urls, url];
      return this.save();
    }
    return this;
  }

  // Static methods
  /**
   * Find threats by sender email
   * @param senderEmail Sender email address
   * @returns Promise resolving to threats from the sender
   */
  static async findBySender(senderEmail: string): Promise<EmailThreat[]> {
    return this.findAll({
      where: { sender_email: senderEmail },
      order: [['received_date', 'DESC']]
    });
  }

  /**
   * Find threats by recipient email
   * @param recipientEmail Recipient email address
   * @returns Promise resolving to threats sent to the recipient
   */
  static async findByRecipient(recipientEmail: string): Promise<EmailThreat[]> {
    return this.findAll({
      where: { recipient_email: recipientEmail },
      order: [['received_date', 'DESC']]
    });
  }

  /**
   * Find threats by type
   * @param threatType Type of threat to search for
   * @returns Promise resolving to threats of specified type
   */
  static async findByType(threatType: EmailThreatAttributes['threat_type']): Promise<EmailThreat[]> {
    return this.findAll({
      where: { threat_type: threatType },
      order: [['risk_score', 'DESC']]
    });
  }

  /**
   * Find threats by severity
   * @param severity Severity level to filter by
   * @returns Promise resolving to threats with specified severity
   */
  static async findBySeverity(severity: EmailThreatAttributes['severity']): Promise<EmailThreat[]> {
    return this.findAll({
      where: { severity },
      order: [['received_date', 'DESC']]
    });
  }

  /**
   * Find high-risk threats
   * @returns Promise resolving to high and critical threats
   */
  static async findHighRisk(): Promise<EmailThreat[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { severity: { [Op.in]: ['high', 'critical'] } },
          { risk_score: { [Op.gte]: 80 } }
        ]
      },
      order: [['risk_score', 'DESC']]
    });
  }

  /**
   * Find threats by status
   * @param status Status to filter by
   * @returns Promise resolving to threats with specified status
   */
  static async findByStatus(status: EmailThreatAttributes['status']): Promise<EmailThreat[]> {
    return this.findAll({
      where: { status },
      order: [['received_date', 'DESC']]
    });
  }

  /**
   * Find delivered threats
   * @returns Promise resolving to delivered threats
   */
  static async findDelivered(): Promise<EmailThreat[]> {
    return this.findAll({
      where: { status: 'delivered' },
      order: [['risk_score', 'DESC']]
    });
  }

  /**
   * Find blocked threats
   * @returns Promise resolving to blocked threats
   */
  static async findBlocked(): Promise<EmailThreat[]> {
    return this.findAll({
      where: { status: 'blocked' },
      order: [['received_date', 'DESC']]
    });
  }

  /**
   * Find quarantined threats
   * @returns Promise resolving to quarantined threats
   */
  static async findQuarantined(): Promise<EmailThreat[]> {
    return this.findAll({
      where: { status: 'quarantined' },
      order: [['received_date', 'DESC']]
    });
  }

  /**
   * Find threats by campaign
   * @param campaignId Campaign ID to search for
   * @returns Promise resolving to threats in the campaign
   */
  static async findByCampaign(campaignId: string): Promise<EmailThreat[]> {
    return this.findAll({
      where: { campaign_id: campaignId },
      order: [['received_date', 'DESC']]
    });
  }

  /**
   * Find recent threats
   * @param hours Number of hours to look back (default: 24)
   * @returns Promise resolving to recent threats
   */
  static async findRecent(hours: number = 24): Promise<EmailThreat[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    
    return this.findAll({
      where: {
        received_date: { [Op.gte]: cutoffDate }
      },
      order: [['received_date', 'DESC']]
    });
  }

  /**
   * Find threats with attachments
   * @returns Promise resolving to threats with attachments
   */
  static async findWithAttachments(): Promise<EmailThreat[]> {
    return this.findAll({
      where: {
        attachments: { [Op.not]: [] }
      },
      order: [['risk_score', 'DESC']]
    });
  }

  /**
   * Find threats with URLs
   * @returns Promise resolving to threats with URLs
   */
  static async findWithUrls(): Promise<EmailThreat[]> {
    return this.findAll({
      where: {
        urls: { [Op.not]: [] }
      },
      order: [['risk_score', 'DESC']]
    });
  }

  /**
   * Get threat type distribution statistics
   * @returns Promise resolving to threat type stats
   */
  static async getThreatTypeStats(): Promise<Array<{
    threat_type: string;
    count: number;
    avg_risk_score: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'threat_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('risk_score')), 'avg_risk_score']
      ],
      group: ['threat_type'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      threat_type: r.threat_type,
      count: parseInt((r as any).getDataValue('count')),
      avg_risk_score: parseFloat((r as any).getDataValue('avg_risk_score')) || 0
    }));
  }

  /**
   * Get overall email threat statistics
   * @returns Promise resolving to comprehensive stats
   */
  static async getOverallStats(): Promise<{
    total_threats: number;
    high_risk_threats: number;
    blocked_threats: number;
    delivered_threats: number;
    quarantined_threats: number;
    avg_risk_score: number;
    threats_with_attachments: number;
    threats_today: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalThreats,
      highRiskThreats,
      blockedThreats,
      deliveredThreats,
      quarantinedThreats,
      threatsWithAttachments,
      threatsToday,
      avgRiskResult
    ] = await Promise.all([
      this.count(),
      this.count({ where: { [Op.or]: [{ severity: { [Op.in]: ['high', 'critical'] } }, { risk_score: { [Op.gte]: 80 } }] } }),
      this.count({ where: { status: 'blocked' } }),
      this.count({ where: { status: 'delivered' } }),
      this.count({ where: { status: 'quarantined' } }),
      this.count({ where: { attachments: { [Op.not]: [] } } }),
      this.count({ where: { received_date: { [Op.gte]: today } } }),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('AVG', this.sequelize!.col('risk_score')), 'avg_risk']
        ]
      }).then(results => results[0])
    ]);

    return {
      total_threats: totalThreats,
      high_risk_threats: highRiskThreats,
      blocked_threats: blockedThreats,
      delivered_threats: deliveredThreats,
      quarantined_threats: quarantinedThreats,
      avg_risk_score: parseFloat((avgRiskResult as any).getDataValue('avg_risk')) || 0,
      threats_with_attachments: threatsWithAttachments,
      threats_today: threatsToday
    };
  }

  /**
   * Create email threat with validation
   * @param data Threat data to create
   * @returns Promise resolving to created threat
   */
  static async createThreat(data: EmailThreatCreationAttributes): Promise<EmailThreat> {
    // Validate required fields
    if (!data.sender_email || !data.recipient_email || !data.subject || !data.received_date) {
      throw new Error('Sender email, recipient email, subject, and received date are required');
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.sender_email)) {
      throw new Error('Invalid sender email format');
    }
    if (!emailRegex.test(data.recipient_email)) {
      throw new Error('Invalid recipient email format');
    }

    // Validate risk and confidence scores
    if (data.risk_score !== undefined && (data.risk_score < 0 || data.risk_score > 100)) {
      throw new Error('Risk score must be between 0 and 100');
    }
    if (data.confidence_score !== undefined && (data.confidence_score < 0 || data.confidence_score > 100)) {
      throw new Error('Confidence score must be between 0 and 100');
    }

    return this.create(data);
  }
}

export default EmailThreat;
