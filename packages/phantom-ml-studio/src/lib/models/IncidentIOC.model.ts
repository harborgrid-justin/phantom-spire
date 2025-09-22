/**
 * INCIDENT IOC JUNCTION SEQUELIZE MODEL
 * Links incidents to IOCs (Indicators of Compromise) that were involved
 * 
 * This model represents the many-to-many relationship between security incidents
 * and Indicators of Compromise (IOCs) that were detected, analyzed, or involved
 * during those incidents. It includes comprehensive tracking of IOC context,
 * analysis results, and forensic details for audit compliance and threat hunting.
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
  Length,
  Unique
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { Incident } from './Incident.model';
import { IOC } from './IOC.model';

// IncidentIOC Attributes Interface
export interface IncidentIOCAttributes {
  /** Unique identifier for the incident-IOC relationship */
  id: number;
  /** Associated incident ID */
  incident_id: number;
  /** Associated IOC ID */
  ioc_id: number;
  /** Context of how this IOC was discovered */
  discovery_context?: string;
  /** Method used to discover this IOC */
  discovery_method?: string;
  /** Source system or tool that detected this IOC */
  discovery_source?: string;
  /** Timestamp when IOC was first observed in incident */
  first_observed?: Date;
  /** Timestamp when IOC was last observed in incident */
  last_observed?: Date;
  /** Number of times this IOC was observed */
  observation_count: number;
  /** Role of this IOC in the incident */
  ioc_role: 'initial_vector' | 'lateral_movement' | 'persistence' | 'exfiltration' | 'c2' | 'evidence' | 'other';
  /** Confidence level in this IOC's involvement */
  confidence_level: 'low' | 'medium' | 'high' | 'confirmed';
  /** Whether this IOC was confirmed malicious */
  is_confirmed_malicious: boolean;
  /** Whether this IOC was a false positive */
  is_false_positive: boolean;
  /** Analysis status of this IOC */
  analysis_status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'ignored';
  /** Analysis priority level */
  analysis_priority: 'low' | 'medium' | 'high' | 'critical';
  /** Analyst assigned to analyze this IOC */
  assigned_analyst?: string;
  /** Analysis start timestamp */
  analysis_started_at?: Date;
  /** Analysis completion timestamp */
  analysis_completed_at?: Date;
  /** Time spent analyzing this IOC (minutes) */
  analysis_duration?: number;
  /** Analysis findings and results */
  analysis_findings?: string;
  /** Actions taken for this IOC */
  actions_taken: string[];
  /** Containment status */
  containment_status: 'not_required' | 'pending' | 'in_progress' | 'completed' | 'failed';
  /** Containment actions performed */
  containment_actions: string[];
  /** Timestamp when containment was completed */
  containment_completed_at?: Date;
  /** Threat hunting activities related to this IOC */
  threat_hunting_activities: string[];
  /** Related IOCs discovered during analysis */
  related_iocs: string[];
  /** MITRE ATT&CK techniques associated */
  mitre_techniques: string[];
  /** Kill chain phase this IOC represents */
  kill_chain_phase?: string;
  /** Geographic information if applicable */
  geolocation_data: Record<string, any>;
  /** Enrichment data from threat intelligence */
  enrichment_data: Record<string, any>;
  /** Reputation scores from various sources */
  reputation_scores: Record<string, any>;
  /** Sandbox analysis results */
  sandbox_results: Record<string, any>;
  /** Network forensics data */
  network_forensics: Record<string, any>;
  /** Host forensics data */
  host_forensics: Record<string, any>;
  /** Timeline of events for this IOC */
  event_timeline: Array<Record<string, any>>;
  /** Attribution information */
  attribution_data: Record<string, any>;
  /** Campaign or threat group associations */
  campaign_associations: string[];
  /** TTPs (Tactics, Techniques, Procedures) observed */
  observed_ttps: string[];
  /** Impact assessment for this specific IOC */
  impact_assessment?: string;
  /** Business context and relevance */
  business_impact?: string;
  /** Risk score calculation */
  risk_score?: number;
  /** Risk factors contributing to score */
  risk_factors: string[];
  /** Mitigation recommendations */
  mitigation_recommendations: string[];
  /** Lessons learned from this IOC */
  lessons_learned?: string;
  /** Quality assurance status */
  qa_status: 'not_required' | 'pending' | 'passed' | 'failed' | 'reviewed';
  /** QA reviewer */
  qa_reviewer?: string;
  /** QA comments */
  qa_comments?: string;
  /** QA timestamp */
  qa_reviewed_at?: Date;
  /** Compliance requirements */
  compliance_requirements: string[];
  /** Regulatory reporting needed */
  regulatory_reporting: boolean;
  /** Evidence preservation status */
  evidence_preserved: boolean;
  /** Chain of custody information */
  chain_of_custody: Record<string, any>;
  /** External sharing permissions */
  sharing_permissions: Record<string, any>;
  /** Tags for categorization */
  tags: string[];
  /** Additional notes */
  notes?: string;
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// IncidentIOC Creation Attributes Interface
export interface IncidentIOCCreationAttributes extends Optional<IncidentIOCAttributes,
  'id' | 'discovery_context' | 'discovery_method' | 'discovery_source' | 'first_observed' |
  'last_observed' | 'observation_count' | 'ioc_role' | 'confidence_level' | 'is_confirmed_malicious' |
  'is_false_positive' | 'analysis_status' | 'analysis_priority' | 'assigned_analyst' |
  'analysis_started_at' | 'analysis_completed_at' | 'analysis_duration' | 'analysis_findings' |
  'actions_taken' | 'containment_status' | 'containment_actions' | 'containment_completed_at' |
  'threat_hunting_activities' | 'related_iocs' | 'mitre_techniques' | 'kill_chain_phase' |
  'geolocation_data' | 'enrichment_data' | 'reputation_scores' | 'sandbox_results' |
  'network_forensics' | 'host_forensics' | 'event_timeline' | 'attribution_data' |
  'campaign_associations' | 'observed_ttps' | 'impact_assessment' | 'business_impact' |
  'risk_score' | 'risk_factors' | 'mitigation_recommendations' | 'lessons_learned' |
  'qa_status' | 'qa_reviewer' | 'qa_comments' | 'qa_reviewed_at' | 'compliance_requirements' |
  'regulatory_reporting' | 'evidence_preserved' | 'chain_of_custody' | 'sharing_permissions' |
  'tags' | 'notes' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'incident_iocs',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['incident_id'] },
    { fields: ['ioc_id'] },
    { fields: ['ioc_role'] },
    { fields: ['confidence_level'] },
    { fields: ['is_confirmed_malicious'] },
    { fields: ['is_false_positive'] },
    { fields: ['analysis_status'] },
    { fields: ['analysis_priority'] },
    { fields: ['containment_status'] },
    { fields: ['qa_status'] },
    { fields: ['first_observed'] },
    { fields: ['last_observed'] },
    { fields: ['created_at'] }
  ]
})
export class IncidentIOC extends Model<IncidentIOCAttributes, IncidentIOCCreationAttributes> implements IncidentIOCAttributes {
  /** Unique identifier for the incident-IOC relationship */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Associated incident ID */
  @ForeignKey(() => Incident)
  @AllowNull(false)
  @Index
  @Column(DataType.INTEGER)
  declare incident_id: number;

  /** Associated IOC ID */
  @ForeignKey(() => IOC)
  @AllowNull(false)
  @Index
  @Column(DataType.INTEGER)
  declare ioc_id: number;

  /** Context of how this IOC was discovered */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare discovery_context?: string;

  /** Method used to discover this IOC */
  @AllowNull(true)
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare discovery_method?: string;

  /** Source system or tool that detected this IOC */
  @AllowNull(true)
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare discovery_source?: string;

  /** Timestamp when IOC was first observed in incident */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare first_observed?: Date;

  /** Timestamp when IOC was last observed in incident */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare last_observed?: Date;

  /** Number of times this IOC was observed */
  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare observation_count: number;

  /** Role of this IOC in the incident */
  @AllowNull(false)
  @Default('evidence')
  @Index
  @Column(DataType.ENUM('initial_vector', 'lateral_movement', 'persistence', 'exfiltration', 'c2', 'evidence', 'other'))
  declare ioc_role: 'initial_vector' | 'lateral_movement' | 'persistence' | 'exfiltration' | 'c2' | 'evidence' | 'other';

  /** Confidence level in this IOC's involvement */
  @AllowNull(false)
  @Default('medium')
  @Index
  @Column(DataType.ENUM('low', 'medium', 'high', 'confirmed'))
  declare confidence_level: 'low' | 'medium' | 'high' | 'confirmed';

  /** Whether this IOC was confirmed malicious */
  @AllowNull(false)
  @Default(false)
  @Index
  @Column(DataType.BOOLEAN)
  declare is_confirmed_malicious: boolean;

  /** Whether this IOC was a false positive */
  @AllowNull(false)
  @Default(false)
  @Index
  @Column(DataType.BOOLEAN)
  declare is_false_positive: boolean;

  /** Analysis status of this IOC */
  @AllowNull(false)
  @Default('pending')
  @Index
  @Column(DataType.ENUM('pending', 'in_progress', 'completed', 'blocked', 'ignored'))
  declare analysis_status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'ignored';

  /** Analysis priority level */
  @AllowNull(false)
  @Default('medium')
  @Index
  @Column(DataType.ENUM('low', 'medium', 'high', 'critical'))
  declare analysis_priority: 'low' | 'medium' | 'high' | 'critical';

  /** Analyst assigned to analyze this IOC */
  @AllowNull(true)
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare assigned_analyst?: string;

  /** Analysis start timestamp */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare analysis_started_at?: Date;

  /** Analysis completion timestamp */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare analysis_completed_at?: Date;

  /** Time spent analyzing this IOC (minutes) */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare analysis_duration?: number;

  /** Analysis findings and results */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare analysis_findings?: string;

  /** Actions taken for this IOC */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare actions_taken: string[];

  /** Containment status */
  @AllowNull(false)
  @Default('not_required')
  @Index
  @Column(DataType.ENUM('not_required', 'pending', 'in_progress', 'completed', 'failed'))
  declare containment_status: 'not_required' | 'pending' | 'in_progress' | 'completed' | 'failed';

  /** Containment actions performed */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare containment_actions: string[];

  /** Timestamp when containment was completed */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare containment_completed_at?: Date;

  /** Threat hunting activities related to this IOC */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare threat_hunting_activities: string[];

  /** Related IOCs discovered during analysis */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare related_iocs: string[];

  /** MITRE ATT&CK techniques associated */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare mitre_techniques: string[];

  /** Kill chain phase this IOC represents */
  @AllowNull(true)
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare kill_chain_phase?: string;

  /** Geographic information if applicable */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare geolocation_data: Record<string, any>;

  /** Enrichment data from threat intelligence */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare enrichment_data: Record<string, any>;

  /** Reputation scores from various sources */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare reputation_scores: Record<string, any>;

  /** Sandbox analysis results */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare sandbox_results: Record<string, any>;

  /** Network forensics data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare network_forensics: Record<string, any>;

  /** Host forensics data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare host_forensics: Record<string, any>;

  /** Timeline of events for this IOC */
  @AllowNull(false)
  @Default([])
  @Column(DataType.JSONB)
  declare event_timeline: Array<Record<string, any>>;

  /** Attribution information */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare attribution_data: Record<string, any>;

  /** Campaign or threat group associations */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare campaign_associations: string[];

  /** TTPs (Tactics, Techniques, Procedures) observed */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare observed_ttps: string[];

  /** Impact assessment for this specific IOC */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare impact_assessment?: string;

  /** Business context and relevance */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare business_impact?: string;

  /** Risk score calculation */
  @AllowNull(true)
  @Column(DataType.DECIMAL(3, 1))
  declare risk_score?: number;

  /** Risk factors contributing to score */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare risk_factors: string[];

  /** Mitigation recommendations */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare mitigation_recommendations: string[];

  /** Lessons learned from this IOC */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare lessons_learned?: string;

  /** Quality assurance status */
  @AllowNull(false)
  @Default('not_required')
  @Index
  @Column(DataType.ENUM('not_required', 'pending', 'passed', 'failed', 'reviewed'))
  declare qa_status: 'not_required' | 'pending' | 'passed' | 'failed' | 'reviewed';

  /** QA reviewer */
  @AllowNull(true)
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare qa_reviewer?: string;

  /** QA comments */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare qa_comments?: string;

  /** QA timestamp */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare qa_reviewed_at?: Date;

  /** Compliance requirements */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare compliance_requirements: string[];

  /** Regulatory reporting needed */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare regulatory_reporting: boolean;

  /** Evidence preservation status */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare evidence_preserved: boolean;

  /** Chain of custody information */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare chain_of_custody: Record<string, any>;

  /** External sharing permissions */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare sharing_permissions: Record<string, any>;

  /** Tags for categorization */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Additional notes */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare notes?: string;

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
  /** Associated incident */
  @BelongsTo(() => Incident, {
    foreignKey: 'incident_id',
    as: 'incident',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare incident?: Incident;

  /** Associated IOC */
  @BelongsTo(() => IOC, {
    foreignKey: 'ioc_id',
    as: 'ioc',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare ioc?: IOC;

  // Instance methods
  /**
   * Check if this IOC is high priority for analysis
   * @returns True if priority is high/critical or confirmed malicious
   */
  public isHighPriority(): boolean {
    return this.analysis_priority === 'high' || 
           this.analysis_priority === 'critical' || 
           this.is_confirmed_malicious;
  }

  /**
   * Check if analysis is overdue
   * @param slaHours SLA hours for analysis (default: 24)
   * @returns True if analysis is past SLA
   */
  public isAnalysisOverdue(slaHours: number = 24): boolean {
    if (this.analysis_status === 'completed' || this.analysis_status === 'ignored') {
      return false;
    }
    
    const slaDeadline = new Date(this.created_at.getTime() + (slaHours * 60 * 60 * 1000));
    return new Date() > slaDeadline;
  }

  /**
   * Calculate analysis time in minutes
   * @returns Minutes from start to completion of analysis
   */
  public getAnalysisTime(): number | null {
    if (!this.analysis_started_at || !this.analysis_completed_at) return null;
    
    const diffMs = this.analysis_completed_at.getTime() - this.analysis_started_at.getTime();
    return Math.round(diffMs / (1000 * 60));
  }

  /**
   * Calculate observation duration
   * @returns Hours between first and last observation
   */
  public getObservationDuration(): number | null {
    if (!this.first_observed || !this.last_observed) return null;
    
    const diffMs = this.last_observed.getTime() - this.first_observed.getTime();
    return Math.round(diffMs / (1000 * 60 * 60));
  }

  /**
   * Get threat score based on multiple factors
   * @returns Calculated threat score (0-10)
   */
  public getThreatScore(): number {
    let score = 0;
    
    // Base score from analysis priority
    const priorityScores = { low: 1, medium: 3, high: 6, critical: 8 };
    score += priorityScores[this.analysis_priority];
    
    // Confirmed malicious bonus
    if (this.is_confirmed_malicious) {
      score += 2;
    }
    
    // IOC role impact
    const roleScores = {
      initial_vector: 2, lateral_movement: 1, persistence: 1.5,
      exfiltration: 2, c2: 1.5, evidence: 0, other: 0.5
    };
    score += roleScores[this.ioc_role] || 0;
    
    // Observation frequency
    if (this.observation_count > 10) {
      score += 0.5;
    }
    
    return Math.min(10, Math.round(score * 10) / 10);
  }

  /**
   * Check if IOC requires immediate attention
   * @returns True if critical priority or confirmed malicious with active role
   */
  public requiresImmediateAttention(): boolean {
    return this.analysis_priority === 'critical' ||
           (this.is_confirmed_malicious && 
            ['initial_vector', 'c2', 'exfiltration'].includes(this.ioc_role));
  }

  /**
   * Mark IOC as confirmed malicious
   * @returns Promise resolving to updated record
   */
  public async confirmMalicious(): Promise<this> {
    this.is_confirmed_malicious = true;
    this.is_false_positive = false;
    this.confidence_level = 'confirmed';
    return this.save();
  }

  /**
   * Mark IOC as false positive
   * @returns Promise resolving to updated record
   */
  public async markFalsePositive(): Promise<this> {
    this.is_false_positive = true;
    this.is_confirmed_malicious = false;
    this.analysis_status = 'completed';
    return this.save();
  }

  /**
   * Start analysis process
   * @param analyst Analyst name
   * @returns Promise resolving to updated record
   */
  public async startAnalysis(analyst: string): Promise<this> {
    this.analysis_status = 'in_progress';
    this.assigned_analyst = analyst;
    this.analysis_started_at = new Date();
    return this.save();
  }

  /**
   * Complete analysis process
   * @param findings Analysis findings
   * @returns Promise resolving to updated record
   */
  public async completeAnalysis(findings?: string): Promise<this> {
    this.analysis_status = 'completed';
    this.analysis_completed_at = new Date();
    if (findings) {
      this.analysis_findings = findings;
    }
    
    const duration = this.getAnalysisTime();
    if (duration !== null) {
      this.analysis_duration = duration;
    }
    
    return this.save();
  }

  /**
   * Add action taken
   * @param action Action description
   * @returns Promise resolving to updated record
   */
  public async addAction(action: string): Promise<this> {
    if (!this.actions_taken.includes(action)) {
      this.actions_taken = [...this.actions_taken, action];
      return this.save();
    }
    return this;
  }

  /**
   * Add related IOC
   * @param relatedIoc Related IOC identifier
   * @returns Promise resolving to updated record
   */
  public async addRelatedIOC(relatedIoc: string): Promise<this> {
    if (!this.related_iocs.includes(relatedIoc)) {
      this.related_iocs = [...this.related_iocs, relatedIoc];
      return this.save();
    }
    return this;
  }

  /**
   * Record observation
   * @param timestamp Observation timestamp
   * @returns Promise resolving to updated record
   */
  public async recordObservation(timestamp?: Date): Promise<this> {
    const observationTime = timestamp || new Date();
    
    if (!this.first_observed) {
      this.first_observed = observationTime;
    }
    
    this.last_observed = observationTime;
    this.observation_count += 1;
    
    return this.save();
  }

  // Static methods
  /**
   * Find all confirmed malicious IOCs
   * @returns Promise resolving to confirmed malicious IOCs
   */
  static async findConfirmedMalicious(): Promise<IncidentIOC[]> {
    return this.findAll({
      where: { is_confirmed_malicious: true },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find high priority IOCs needing analysis
   * @returns Promise resolving to high priority IOCs
   */
  static async findHighPriority(): Promise<IncidentIOC[]> {
    return this.findAll({
      where: {
        analysis_priority: { [Op.in]: ['high', 'critical'] },
        analysis_status: { [Op.in]: ['pending', 'in_progress'] }
      },
      order: [['analysis_priority', 'DESC'], ['created_at', 'ASC']]
    });
  }

  /**
   * Find overdue analysis
   * @param slaHours SLA hours for analysis
   * @returns Promise resolving to overdue IOCs
   */
  static async findOverdueAnalysis(slaHours: number = 24): Promise<IncidentIOC[]> {
    const slaDeadline = new Date(Date.now() - (slaHours * 60 * 60 * 1000));
    
    return this.findAll({
      where: {
        analysis_status: { [Op.in]: ['pending', 'in_progress'] },
        created_at: { [Op.lt]: slaDeadline }
      },
      order: [['created_at', 'ASC']]
    });
  }

  /**
   * Find by IOC role
   * @param role IOC role to filter by
   * @returns Promise resolving to IOCs with specified role
   */
  static async findByRole(role: IncidentIOCAttributes['ioc_role']): Promise<IncidentIOC[]> {
    return this.findAll({
      where: { ioc_role: role },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find by analyst
   * @param analyst Analyst name
   * @returns Promise resolving to IOCs assigned to analyst
   */
  static async findByAnalyst(analyst: string): Promise<IncidentIOC[]> {
    return this.findAll({
      where: { assigned_analyst: analyst },
      order: [['analysis_priority', 'DESC'], ['created_at', 'ASC']]
    });
  }

  /**
   * Find requiring containment
   * @returns Promise resolving to IOCs needing containment
   */
  static async findRequiringContainment(): Promise<IncidentIOC[]> {
    return this.findAll({
      where: {
        is_confirmed_malicious: true,
        containment_status: { [Op.in]: ['pending', 'in_progress'] }
      },
      order: [['analysis_priority', 'DESC']]
    });
  }

  /**
   * Get analysis statistics
   * @returns Promise resolving to analysis stats
   */
  static async getAnalysisStats(): Promise<{
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
    confirmed_malicious: number;
    false_positives: number;
    avg_analysis_time: number;
  }> {
    const [total, pending, inProgress, completed, confirmedMalicious, falsePositives] = await Promise.all([
      this.count(),
      this.count({ where: { analysis_status: 'pending' } }),
      this.count({ where: { analysis_status: 'in_progress' } }),
      this.count({ where: { analysis_status: 'completed' } }),
      this.count({ where: { is_confirmed_malicious: true } }),
      this.count({ where: { is_false_positive: true } })
    ]);

    const overdue = await this.count({
      where: {
        analysis_status: { [Op.in]: ['pending', 'in_progress'] },
        created_at: { [Op.lt]: new Date(Date.now() - (24 * 60 * 60 * 1000)) }
      }
    });

    const avgTime = await this.findOne({
      attributes: [[this.sequelize!.fn('AVG', this.sequelize!.col('analysis_duration')), 'avg_time']],
      where: { analysis_status: 'completed' },
      raw: true
    });

    return {
      total,
      pending,
      in_progress: inProgress,
      completed,
      overdue,
      confirmed_malicious: confirmedMalicious,
      false_positives: falsePositives,
      avg_analysis_time: avgTime ? parseFloat((avgTime as any).avg_time) || 0 : 0
    };
  }

  /**
   * Get IOC role distribution
   * @returns Promise resolving to role statistics
   */
  static async getRoleDistribution(): Promise<Array<{ role: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'ioc_role',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['ioc_role'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      role: r.ioc_role,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Create incident IOC relationship with validation
   * @param data Creation data
   * @returns Promise resolving to created relationship
   */
  static async createIncidentIOC(data: IncidentIOCCreationAttributes): Promise<IncidentIOC> {
    // Check for duplicate relationship
    const existing = await this.findOne({
      where: {
        incident_id: data.incident_id,
        ioc_id: data.ioc_id
      }
    });

    if (existing) {
      // Update observation count instead of creating duplicate
      return existing.recordObservation();
    }

    // Set first observation if not provided
    if (!data.first_observed) {
      data.first_observed = new Date();
    }

    return this.create(data);
  }
}

export default IncidentIOC;
