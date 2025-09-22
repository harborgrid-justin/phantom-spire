/**
 * CYBER INCIDENT SEQUELIZE MODEL
 * Advanced incident tracking with ML integration and comprehensive type safety
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
  ForeignKey,
  DataType,
  Index,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { User } from './User.model';
import { ThreatActor } from './ThreatActor.model';

// CyberIncident Attributes Interface
export interface CyberIncidentAttributes {
  /** Unique identifier for the cyber incident */
  id: number;
  /** Title of the incident */
  incident_title: string;
  /** Detailed description of the incident */
  description?: string;
  /** Current status of the incident */
  status: 'open' | 'investigating' | 'contained' | 'eradicated' | 'recovery' | 'closed' | 'false_positive';
  /** Severity level of the incident */
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  /** Type of cyber incident */
  incident_type: 'malware' | 'phishing' | 'ddos' | 'data_breach' | 'insider_threat' | 'ransomware' | 'apt' | 'other';
  /** ID of the assigned analyst */
  assigned_analyst?: number;
  /** ID of the attributed threat actor */
  attributed_actor?: number;
  /** When the incident occurred */
  incident_date: Date;
  /** When the incident was detected */
  detection_date?: Date;
  /** When the incident was reported */
  reported_date?: Date;
  /** Detailed incident information */
  incident_details: Record<string, any>;
  /** ML analysis results */
  ml_analysis: Record<string, any>;
  /** List of affected systems */
  affected_systems: string[];
  /** Impact assessment data */
  impact_assessment: Record<string, any>;
  /** Response actions taken */
  response_actions: Record<string, any>;
  /** Evidence collected */
  evidence: Record<string, any>;
  /** Classification tags */
  tags: string[];
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// CyberIncident Creation Attributes Interface
export interface CyberIncidentCreationAttributes extends Optional<CyberIncidentAttributes,
  'id' | 'description' | 'status' | 'severity' | 'incident_type' | 'assigned_analyst' | 
  'attributed_actor' | 'detection_date' | 'reported_date' | 'incident_details' | 'ml_analysis' |
  'affected_systems' | 'impact_assessment' | 'response_actions' | 'evidence' | 'tags' |
  'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'cyber_incidents',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['status'] },
    { fields: ['severity'] },
    { fields: ['incident_type'] },
    { fields: ['assigned_analyst'] },
    { fields: ['attributed_actor'] },
    { fields: ['incident_date'] },
    { fields: ['detection_date'] },
    { fields: ['reported_date'] },
    { fields: ['created_at'] }
  ]
})
export class CyberIncident extends Model<CyberIncidentAttributes, CyberIncidentCreationAttributes> implements CyberIncidentAttributes {
  /** Unique identifier for the cyber incident */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Title of the incident */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare incident_title: string;

  /** Detailed description of the incident */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Current status of the incident */
  @AllowNull(false)
  @Default('open')
  @Index
  @Column(DataType.ENUM('open', 'investigating', 'contained', 'eradicated', 'recovery', 'closed', 'false_positive'))
  declare status: 'open' | 'investigating' | 'contained' | 'eradicated' | 'recovery' | 'closed' | 'false_positive';

  /** Severity level of the incident */
  @AllowNull(false)
  @Default('medium')
  @Index
  @Column(DataType.ENUM('info', 'low', 'medium', 'high', 'critical'))
  declare severity: 'info' | 'low' | 'medium' | 'high' | 'critical';

  /** Type of cyber incident */
  @AllowNull(false)
  @Default('other')
  @Index
  @Column(DataType.ENUM('malware', 'phishing', 'ddos', 'data_breach', 'insider_threat', 'ransomware', 'apt', 'other'))
  declare incident_type: 'malware' | 'phishing' | 'ddos' | 'data_breach' | 'insider_threat' | 'ransomware' | 'apt' | 'other';

  /** ID of the assigned analyst */
  @ForeignKey(() => User)
  @AllowNull(true)
  @Index
  @Column(DataType.INTEGER)
  declare assigned_analyst?: number;

  /** ID of the attributed threat actor */
  @ForeignKey(() => ThreatActor)
  @AllowNull(true)
  @Index
  @Column(DataType.INTEGER)
  declare attributed_actor?: number;

  /** When the incident occurred */
  @AllowNull(false)
  @Index
  @Column(DataType.DATE)
  declare incident_date: Date;

  /** When the incident was detected */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare detection_date?: Date;

  /** When the incident was reported */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare reported_date?: Date;

  /** Detailed incident information */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare incident_details: Record<string, any>;

  /** ML analysis results */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare ml_analysis: Record<string, any>;

  /** List of affected systems */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare affected_systems: string[];

  /** Impact assessment data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare impact_assessment: Record<string, any>;

  /** Response actions taken */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare response_actions: Record<string, any>;

  /** Evidence collected */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare evidence: Record<string, any>;

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
  /** Assigned analyst */
  @BelongsTo(() => User, {
    foreignKey: 'assigned_analyst',
    as: 'analyst',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare analyst?: User;

  /** Attributed threat actor */
  @BelongsTo(() => ThreatActor, {
    foreignKey: 'attributed_actor',
    as: 'threat_actor',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare threat_actor?: ThreatActor;

  // Instance methods
  /**
   * Check if the incident is open
   * @returns True if status is open
   */
  public isOpen(): boolean {
    return this.status === 'open';
  }

  /**
   * Check if the incident is being investigated
   * @returns True if status is investigating
   */
  public isInvestigating(): boolean {
    return this.status === 'investigating';
  }

  /**
   * Check if the incident is contained
   * @returns True if status is contained
   */
  public isContained(): boolean {
    return this.status === 'contained';
  }

  /**
   * Check if the incident is eradicated
   * @returns True if status is eradicated
   */
  public isEradicated(): boolean {
    return this.status === 'eradicated';
  }

  /**
   * Check if the incident is in recovery phase
   * @returns True if status is recovery
   */
  public isInRecovery(): boolean {
    return this.status === 'recovery';
  }

  /**
   * Check if the incident is closed
   * @returns True if status is closed
   */
  public isClosed(): boolean {
    return this.status === 'closed';
  }

  /**
   * Check if the incident is a false positive
   * @returns True if status is false_positive
   */
  public isFalsePositive(): boolean {
    return this.status === 'false_positive';
  }

  /**
   * Check if the incident is critical severity
   * @returns True if severity is critical
   */
  public isCritical(): boolean {
    return this.severity === 'critical';
  }

  /**
   * Check if the incident is high severity
   * @returns True if severity is high
   */
  public isHighSeverity(): boolean {
    return this.severity === 'high';
  }

  /**
   * Check if the incident is medium severity
   * @returns True if severity is medium
   */
  public isMediumSeverity(): boolean {
    return this.severity === 'medium';
  }

  /**
   * Check if the incident is low severity
   * @returns True if severity is low
   */
  public isLowSeverity(): boolean {
    return this.severity === 'low';
  }

  /**
   * Check if the incident is active (not closed or false positive)
   * @returns True if incident is active
   */
  public isActive(): boolean {
    return !['closed', 'false_positive'].includes(this.status);
  }

  /**
   * Get the age of the incident in days
   * @returns Age in days since incident occurred
   */
  public getAge(): number {
    const diffTime = new Date().getTime() - this.incident_date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days since detection
   * @returns Days since detection, null if not detected yet
   */
  public getDaysSinceDetection(): number | null {
    if (!this.detection_date) return null;
    const diffTime = new Date().getTime() - this.detection_date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get mean time to detection (MTTD) in hours
   * @returns Hours between incident and detection, null if not detected
   */
  public getMeanTimeToDetection(): number | null {
    if (!this.detection_date) return null;
    const diffTime = this.detection_date.getTime() - this.incident_date.getTime();
    return Math.max(0, diffTime / (1000 * 60 * 60));
  }

  /**
   * Get mean time to response (MTTR) in hours
   * @returns Hours between detection and first response, null if not applicable
   */
  public getMeanTimeToResponse(): number | null {
    if (!this.detection_date || !this.reported_date) return null;
    const diffTime = this.reported_date.getTime() - this.detection_date.getTime();
    return Math.max(0, diffTime / (1000 * 60 * 60));
  }

  /**
   * Get number of affected systems
   * @returns Count of affected systems
   */
  public getAffectedSystemsCount(): number {
    return this.affected_systems.length;
  }

  /**
   * Check if a specific system is affected
   * @param system System name to check
   * @returns True if system is affected
   */
  public isSystemAffected(system: string): boolean {
    return this.affected_systems.includes(system);
  }

  /**
   * Check if incident has specific tag
   * @param tag Tag to check for
   * @returns True if tag exists
   */
  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Get severity level as numeric value for comparison
   * @returns Numeric severity (1-5, higher is more severe)
   */
  public getSeverityLevel(): number {
    const severityMap = { info: 1, low: 2, medium: 3, high: 4, critical: 5 };
    return severityMap[this.severity];
  }

  /**
   * Get status progress as percentage
   * @returns Progress percentage (0-100)
   */
  public getStatusProgress(): number {
    const statusMap = {
      open: 0,
      investigating: 20,
      contained: 40,
      eradicated: 60,
      recovery: 80,
      closed: 100,
      false_positive: 100
    };
    return statusMap[this.status];
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
   * Update incident status
   * @param newStatus New status to set
   * @param notes Optional notes about the status change
   * @returns Promise resolving to updated incident
   */
  public async updateStatus(newStatus: CyberIncidentAttributes['status'], notes?: string): Promise<this> {
    const oldStatus = this.status;
    this.status = newStatus;
    
    // Track status change in metadata
    this.metadata = {
      ...this.metadata,
      status_history: [
        ...(this.metadata['status_history'] || []),
        {
          from: oldStatus,
          to: newStatus,
          timestamp: new Date(),
          notes
        }
      ]
    };
    
    return this.save();
  }

  /**
   * Update severity level
   * @param newSeverity New severity level
   * @param reason Optional reason for severity change
   * @returns Promise resolving to updated incident
   */
  public async updateSeverity(newSeverity: CyberIncidentAttributes['severity'], reason?: string): Promise<this> {
    const oldSeverity = this.severity;
    this.severity = newSeverity;
    
    if (reason) {
      this.metadata = {
        ...this.metadata,
        severity_change_reason: reason,
        severity_changed_at: new Date(),
        previous_severity: oldSeverity
      };
    }
    
    return this.save();
  }

  /**
   * Assign incident to analyst
   * @param analystId User ID of the analyst
   * @returns Promise resolving to updated incident
   */
  public async assignToAnalyst(analystId: number): Promise<this> {
    this.assigned_analyst = analystId;
    this.metadata = {
      ...this.metadata,
      assigned_at: new Date()
    };
    return this.save();
  }

  /**
   * Add affected system
   * @param system System identifier to add
   * @returns Promise resolving to updated incident
   */
  public async addAffectedSystem(system: string): Promise<this> {
    if (!this.affected_systems.includes(system)) {
      this.affected_systems = [...this.affected_systems, system];
      return this.save();
    }
    return this;
  }

  /**
   * Remove affected system
   * @param system System identifier to remove
   * @returns Promise resolving to updated incident
   */
  public async removeAffectedSystem(system: string): Promise<this> {
    this.affected_systems = this.affected_systems.filter(s => s !== system);
    return this.save();
  }

  /**
   * Add evidence
   * @param key Evidence key
   * @param value Evidence data
   * @returns Promise resolving to updated incident
   */
  public async addEvidence(key: string, value: any): Promise<this> {
    this.evidence = {
      ...this.evidence,
      [key]: {
        ...value,
        added_at: new Date()
      }
    };
    return this.save();
  }

  /**
   * Add response action
   * @param action Action description
   * @param status Action status
   * @returns Promise resolving to updated incident
   */
  public async addResponseAction(action: string, status: string = 'pending'): Promise<this> {
    const actionId = `action_${Date.now()}`;
    this.response_actions = {
      ...this.response_actions,
      [actionId]: {
        description: action,
        status,
        added_at: new Date()
      }
    };
    return this.save();
  }

  /**
   * Update impact assessment
   * @param assessmentData Impact assessment data
   * @returns Promise resolving to updated incident
   */
  public async updateImpactAssessment(assessmentData: Record<string, any>): Promise<this> {
    this.impact_assessment = {
      ...this.impact_assessment,
      ...assessmentData,
      last_updated: new Date()
    };
    return this.save();
  }

  /**
   * Add tag to incident
   * @param tag Tag to add
   * @returns Promise resolving to updated incident
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Remove tag from incident
   * @param tag Tag to remove
   * @returns Promise resolving to updated incident
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  // Static methods
  /**
   * Find incidents by status
   * @param status Status to filter by
   * @returns Promise resolving to incidents with specified status
   */
  static async findByStatus(status: CyberIncidentAttributes['status']): Promise<CyberIncident[]> {
    return this.findAll({
      where: { status },
      order: [['incident_date', 'DESC']],
      include: [
        { model: User, as: 'analyst' },
        { model: ThreatActor, as: 'threat_actor' }
      ]
    });
  }

  /**
   * Find active incidents
   * @returns Promise resolving to active incidents
   */
  static async findActive(): Promise<CyberIncident[]> {
    return this.findAll({
      where: {
        status: { [Op.notIn]: ['closed', 'false_positive'] }
      },
      order: [['severity', 'DESC'], ['incident_date', 'DESC']],
      include: [{ model: User, as: 'analyst' }]
    });
  }

  /**
   * Find incidents by severity
   * @param severity Severity level to filter by
   * @returns Promise resolving to incidents with specified severity
   */
  static async findBySeverity(severity: CyberIncidentAttributes['severity']): Promise<CyberIncident[]> {
    return this.findAll({
      where: { severity },
      order: [['incident_date', 'DESC']]
    });
  }

  /**
   * Find critical incidents
   * @returns Promise resolving to critical severity incidents
   */
  static async findCritical(): Promise<CyberIncident[]> {
    return this.findAll({
      where: { 
        severity: 'critical',
        status: { [Op.notIn]: ['closed', 'false_positive'] }
      },
      order: [['incident_date', 'DESC']],
      include: [{ model: User, as: 'analyst' }]
    });
  }

  /**
   * Find incidents by type
   * @param incidentType Incident type to filter by
   * @returns Promise resolving to incidents of specified type
   */
  static async findByType(incidentType: CyberIncidentAttributes['incident_type']): Promise<CyberIncident[]> {
    return this.findAll({
      where: { incident_type: incidentType },
      order: [['incident_date', 'DESC']]
    });
  }

  /**
   * Find incidents assigned to analyst
   * @param analystId Analyst user ID
   * @returns Promise resolving to assigned incidents
   */
  static async findByAnalyst(analystId: number): Promise<CyberIncident[]> {
    return this.findAll({
      where: { assigned_analyst: analystId },
      order: [['incident_date', 'DESC']]
    });
  }

  /**
   * Find unassigned incidents
   * @returns Promise resolving to unassigned incidents
   */
  static async findUnassigned(): Promise<CyberIncident[]> {
    return this.findAll({
      where: { 
        assigned_analyst: { [Op.is]: null },
        status: { [Op.notIn]: ['closed', 'false_positive'] }
      },
      order: [['severity', 'DESC'], ['incident_date', 'DESC']]
    });
  }

  /**
   * Find recent incidents
   * @param days Number of days to look back (default: 30)
   * @returns Promise resolving to recent incidents
   */
  static async findRecent(days: number = 30): Promise<CyberIncident[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        incident_date: { [Op.gte]: cutoffDate }
      },
      order: [['incident_date', 'DESC']]
    });
  }

  /**
   * Find incidents by threat actor
   * @param actorId Threat actor ID
   * @returns Promise resolving to incidents attributed to the actor
   */
  static async findByThreatActor(actorId: number): Promise<CyberIncident[]> {
    return this.findAll({
      where: { attributed_actor: actorId },
      order: [['incident_date', 'DESC']],
      include: [{ model: User, as: 'analyst' }]
    });
  }

  /**
   * Get incident statistics by status
   * @returns Promise resolving to status distribution
   */
  static async getStatusStats(): Promise<Array<{
    status: string;
    count: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'status',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['status'],
      order: [['status', 'ASC']]
    });
    
    return results.map(r => ({
      status: r.status,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get incident statistics by severity
   * @returns Promise resolving to severity distribution
   */
  static async getSeverityStats(): Promise<Array<{
    severity: string;
    count: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'severity',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['severity'],
      order: [['severity', 'ASC']]
    });
    
    return results.map(r => ({
      severity: r.severity,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get overall incident statistics
   * @returns Promise resolving to comprehensive stats
   */
  static async getOverallStats(): Promise<{
    total_incidents: number;
    active_incidents: number;
    critical_incidents: number;
    unassigned_incidents: number;
    avg_resolution_time: number;
    incidents_this_month: number;
  }> {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const [
      totalIncidents,
      activeIncidents,
      criticalIncidents,
      unassignedIncidents,
      incidentsThisMonth,
      avgResolutionResult
    ] = await Promise.all([
      this.count(),
      this.count({ where: { status: { [Op.notIn]: ['closed', 'false_positive'] } } }),
      this.count({ where: { severity: 'critical', status: { [Op.notIn]: ['closed', 'false_positive'] } } }),
      this.count({ where: { assigned_analyst: { [Op.is]: null }, status: { [Op.notIn]: ['closed', 'false_positive'] } } }),
      this.count({ where: { incident_date: { [Op.gte]: thisMonth } } }),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('AVG', this.sequelize!.literal('EXTRACT(epoch FROM (updated_at - incident_date))/3600')), 'avg_hours']
        ],
        where: { status: 'closed' }
      }).then(results => results[0])
    ]);

    return {
      total_incidents: totalIncidents,
      active_incidents: activeIncidents,
      critical_incidents: criticalIncidents,
      unassigned_incidents: unassignedIncidents,
      avg_resolution_time: parseFloat((avgResolutionResult as any).getDataValue('avg_hours')) || 0,
      incidents_this_month: incidentsThisMonth
    };
  }

  /**
   * Create cyber incident with validation
   * @param data Incident data to create
   * @returns Promise resolving to created incident
   */
  static async createIncident(data: CyberIncidentCreationAttributes): Promise<CyberIncident> {
    // Validate required fields
    if (!data.incident_title || !data.incident_date) {
      throw new Error('Incident title and incident date are required');
    }

    // Set detection date if not provided (assuming immediate detection)
    if (!data.detection_date && data.incident_date) {
      data.detection_date = data.incident_date;
    }

    // Set reported date if not provided (assuming immediate reporting)
    if (!data.reported_date && data.detection_date) {
      data.reported_date = data.detection_date;
    }

    return this.create(data);
  }
}

export default CyberIncident;
