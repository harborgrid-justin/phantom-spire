/**
 * INCIDENT CVE JUNCTION SEQUELIZE MODEL
 * Links incidents to CVEs that were exploited in cybersecurity incidents
 * 
 * This model represents the many-to-many relationship between security incidents
 * and Common Vulnerabilities and Exposures (CVEs) that were exploited during those incidents.
 * It includes comprehensive tracking of exploitation details, impact assessment,
 * and remediation status for audit compliance and forensic analysis.
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
import { CVE } from './CVE.model';

// IncidentCVE Attributes Interface
export interface IncidentCVEAttributes {
  /** Unique identifier for the incident-CVE relationship */
  id: number;
  /** Associated incident ID */
  incident_id: number;
  /** Associated CVE ID */
  cve_id: number;
  /** How this CVE was exploited in the incident */
  exploitation_method?: string;
  /** Evidence of exploitation */
  exploitation_evidence?: string;
  /** Attack vector used to exploit this CVE */
  attack_vector?: string;
  /** Complexity of exploitation (low, medium, high) */
  exploitation_complexity: 'low' | 'medium' | 'high';
  /** Whether this CVE was the primary attack vector */
  is_primary_vector: boolean;
  /** Whether exploitation was successful */
  exploitation_successful: boolean;
  /** Impact level of this specific CVE exploitation */
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  /** CVSS score at time of exploitation */
  cvss_score?: number;
  /** CVSS vector string */
  cvss_vector?: string;
  /** Whether this CVE had available patches */
  patch_available: boolean;
  /** Patch availability date */
  patch_available_date?: Date;
  /** Whether the system was patched */
  was_patched: boolean;
  /** Date when patch was applied */
  patch_applied_date?: Date;
  /** Reason for not patching (if applicable) */
  patch_delay_reason?: string;
  /** Remediation status */
  remediation_status: 'pending' | 'in_progress' | 'completed' | 'not_applicable';
  /** Remediation actions taken */
  remediation_actions: string[];
  /** Date remediation was completed */
  remediation_completed_date?: Date;
  /** Time from discovery to remediation (hours) */
  time_to_remediation?: number;
  /** Detection method for this CVE exploitation */
  detection_method?: string;
  /** Detection timestamp */
  detection_timestamp?: Date;
  /** Whether this was a zero-day exploit */
  is_zero_day: boolean;
  /** Asset types affected by this CVE */
  affected_assets: string[];
  /** Business impact assessment */
  business_impact?: string;
  /** Technical impact details */
  technical_impact?: string;
  /** Mitigation factors that reduced impact */
  mitigation_factors: string[];
  /** Threat intelligence sources linking to this CVE */
  threat_intel_sources: string[];
  /** IOCs associated with this CVE exploitation */
  associated_iocs: string[];
  /** Attribution information */
  attribution?: string;
  /** Campaign or APT group associated */
  campaign_association?: string;
  /** Lessons learned from this exploitation */
  lessons_learned?: string;
  /** Risk rating before incident */
  pre_incident_risk: 'low' | 'medium' | 'high' | 'critical';
  /** Risk rating after incident */
  post_incident_risk: 'low' | 'medium' | 'high' | 'critical';
  /** Vulnerability scanner findings */
  scanner_findings: Record<string, any>;
  /** Penetration test results */
  pentest_results: Record<string, any>;
  /** Compliance impact assessment */
  compliance_impact: Record<string, any>;
  /** Regulatory reporting requirements */
  regulatory_reporting: string[];
  /** Evidence chain of custody */
  evidence_custody: Record<string, any>;
  /** Forensic analysis results */
  forensic_analysis: Record<string, any>;
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// IncidentCVE Creation Attributes Interface
export interface IncidentCVECreationAttributes extends Optional<IncidentCVEAttributes,
  'id' | 'exploitation_method' | 'exploitation_evidence' | 'attack_vector' | 'exploitation_complexity' |
  'is_primary_vector' | 'exploitation_successful' | 'impact_level' | 'cvss_score' | 'cvss_vector' |
  'patch_available' | 'patch_available_date' | 'was_patched' | 'patch_applied_date' | 
  'patch_delay_reason' | 'remediation_status' | 'remediation_actions' | 'remediation_completed_date' |
  'time_to_remediation' | 'detection_method' | 'detection_timestamp' | 'is_zero_day' |
  'affected_assets' | 'business_impact' | 'technical_impact' | 'mitigation_factors' |
  'threat_intel_sources' | 'associated_iocs' | 'attribution' | 'campaign_association' |
  'lessons_learned' | 'pre_incident_risk' | 'post_incident_risk' | 'scanner_findings' |
  'pentest_results' | 'compliance_impact' | 'regulatory_reporting' | 'evidence_custody' |
  'forensic_analysis' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'incident_cves',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['incident_id'] },
    { fields: ['cve_id'] },
    { fields: ['exploitation_complexity'] },
    { fields: ['is_primary_vector'] },
    { fields: ['exploitation_successful'] },
    { fields: ['impact_level'] },
    { fields: ['remediation_status'] },
    { fields: ['is_zero_day'] },
    { fields: ['pre_incident_risk'] },
    { fields: ['post_incident_risk'] },
    { fields: ['detection_timestamp'] },
    { fields: ['remediation_completed_date'] },
    { fields: ['created_at'] }
  ]
})
export class IncidentCVE extends Model<IncidentCVEAttributes, IncidentCVECreationAttributes> implements IncidentCVEAttributes {
  /** Unique identifier for the incident-CVE relationship */
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

  /** Associated CVE ID */
  @ForeignKey(() => CVE)
  @AllowNull(false)
  @Index
  @Column(DataType.INTEGER)
  declare cve_id: number;

  /** How this CVE was exploited in the incident */
  @AllowNull(true)
  @Length({ max: 500 })
  @Column(DataType.STRING(500))
  declare exploitation_method?: string;

  /** Evidence of exploitation */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare exploitation_evidence?: string;

  /** Attack vector used to exploit this CVE */
  @AllowNull(true)
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare attack_vector?: string;

  /** Complexity of exploitation (low, medium, high) */
  @AllowNull(false)
  @Default('medium')
  @Index
  @Column(DataType.ENUM('low', 'medium', 'high'))
  declare exploitation_complexity: 'low' | 'medium' | 'high';

  /** Whether this CVE was the primary attack vector */
  @AllowNull(false)
  @Default(false)
  @Index
  @Column(DataType.BOOLEAN)
  declare is_primary_vector: boolean;

  /** Whether exploitation was successful */
  @AllowNull(false)
  @Default(false)
  @Index
  @Column(DataType.BOOLEAN)
  declare exploitation_successful: boolean;

  /** Impact level of this specific CVE exploitation */
  @AllowNull(false)
  @Default('medium')
  @Index
  @Column(DataType.ENUM('low', 'medium', 'high', 'critical'))
  declare impact_level: 'low' | 'medium' | 'high' | 'critical';

  /** CVSS score at time of exploitation */
  @AllowNull(true)
  @Column(DataType.DECIMAL(3, 1))
  declare cvss_score?: number;

  /** CVSS vector string */
  @AllowNull(true)
  @Length({ max: 200 })
  @Column(DataType.STRING(200))
  declare cvss_vector?: string;

  /** Whether this CVE had available patches */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare patch_available: boolean;

  /** Patch availability date */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare patch_available_date?: Date;

  /** Whether the system was patched */
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare was_patched: boolean;

  /** Date when patch was applied */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare patch_applied_date?: Date;

  /** Reason for not patching (if applicable) */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare patch_delay_reason?: string;

  /** Remediation status */
  @AllowNull(false)
  @Default('pending')
  @Index
  @Column(DataType.ENUM('pending', 'in_progress', 'completed', 'not_applicable'))
  declare remediation_status: 'pending' | 'in_progress' | 'completed' | 'not_applicable';

  /** Remediation actions taken */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare remediation_actions: string[];

  /** Date remediation was completed */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare remediation_completed_date?: Date;

  /** Time from discovery to remediation (hours) */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare time_to_remediation?: number;

  /** Detection method for this CVE exploitation */
  @AllowNull(true)
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare detection_method?: string;

  /** Detection timestamp */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare detection_timestamp?: Date;

  /** Whether this was a zero-day exploit */
  @AllowNull(false)
  @Default(false)
  @Index
  @Column(DataType.BOOLEAN)
  declare is_zero_day: boolean;

  /** Asset types affected by this CVE */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare affected_assets: string[];

  /** Business impact assessment */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare business_impact?: string;

  /** Technical impact details */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare technical_impact?: string;

  /** Mitigation factors that reduced impact */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare mitigation_factors: string[];

  /** Threat intelligence sources linking to this CVE */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare threat_intel_sources: string[];

  /** IOCs associated with this CVE exploitation */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare associated_iocs: string[];

  /** Attribution information */
  @AllowNull(true)
  @Length({ max: 200 })
  @Column(DataType.STRING(200))
  declare attribution?: string;

  /** Campaign or APT group associated */
  @AllowNull(true)
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare campaign_association?: string;

  /** Lessons learned from this exploitation */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare lessons_learned?: string;

  /** Risk rating before incident */
  @AllowNull(false)
  @Default('medium')
  @Index
  @Column(DataType.ENUM('low', 'medium', 'high', 'critical'))
  declare pre_incident_risk: 'low' | 'medium' | 'high' | 'critical';

  /** Risk rating after incident */
  @AllowNull(false)
  @Default('medium')
  @Index
  @Column(DataType.ENUM('low', 'medium', 'high', 'critical'))
  declare post_incident_risk: 'low' | 'medium' | 'high' | 'critical';

  /** Vulnerability scanner findings */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare scanner_findings: Record<string, any>;

  /** Penetration test results */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare pentest_results: Record<string, any>;

  /** Compliance impact assessment */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare compliance_impact: Record<string, any>;

  /** Regulatory reporting requirements */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare regulatory_reporting: string[];

  /** Evidence chain of custody */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare evidence_custody: Record<string, any>;

  /** Forensic analysis results */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare forensic_analysis: Record<string, any>;

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

  /** Associated CVE */
  @BelongsTo(() => CVE, {
    foreignKey: 'cve_id',
    as: 'cve',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare cve?: CVE;

  // Instance methods
  /**
   * Check if this CVE exploitation was critical
   * @returns True if impact is critical or CVSS >= 9.0
   */
  public isCriticalExploitation(): boolean {
    return this.impact_level === 'critical' || (this.cvss_score && this.cvss_score >= 9.0) || false;
  }

  /**
   * Check if remediation is overdue
   * @param slaHours SLA hours for remediation (default: 72)
   * @returns True if remediation is past SLA
   */
  public isRemediationOverdue(slaHours: number = 72): boolean {
    if (this.remediation_status === 'completed' || this.remediation_status === 'not_applicable') {
      return false;
    }
    
    const slaDeadline = new Date(this.created_at.getTime() + (slaHours * 60 * 60 * 1000));
    return new Date() > slaDeadline;
  }

  /**
   * Calculate remediation time in hours
   * @returns Hours from creation to remediation completion
   */
  public getRemediationTime(): number | null {
    if (!this.remediation_completed_date) return null;
    
    const diffMs = this.remediation_completed_date.getTime() - this.created_at.getTime();
    return Math.round(diffMs / (1000 * 60 * 60));
  }

  /**
   * Calculate patch lag time in days
   * @returns Days between patch availability and application
   */
  public getPatchLagTime(): number | null {
    if (!this.patch_available_date || !this.patch_applied_date) return null;
    
    const diffMs = this.patch_applied_date.getTime() - this.patch_available_date.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Get exploit severity score
   * @returns Combined severity score (0-10)
   */
  public getSeverityScore(): number {
    let score = 0;
    
    // CVSS score contribution (40%)
    if (this.cvss_score) {
      score += (this.cvss_score / 10) * 4;
    }
    
    // Impact level contribution (30%)
    const impactScores = { low: 1, medium: 2, high: 3, critical: 4 };
    score += (impactScores[this.impact_level] / 4) * 3;
    
    // Exploitation success contribution (20%)
    if (this.exploitation_successful) {
      score += 2;
    }
    
    // Zero-day contribution (10%)
    if (this.is_zero_day) {
      score += 1;
    }
    
    return Math.min(10, score);
  }

  /**
   * Check if this exploitation indicates advanced threat
   * @returns True if sophisticated attack indicators present
   */
  public isAdvancedThreat(): boolean {
    return this.is_zero_day || 
           this.exploitation_complexity === 'high' || 
           this.attribution !== null ||
           this.campaign_association !== null ||
           this.associated_iocs.length > 5;
  }

  /**
   * Get compliance risk level
   * @returns Compliance risk assessment
   */
  public getComplianceRisk(): 'low' | 'medium' | 'high' | 'critical' {
    if (this.regulatory_reporting.length > 0) {
      return 'critical';
    }
    
    if (this.isCriticalExploitation() && this.exploitation_successful) {
      return 'high';
    }
    
    if (this.impact_level === 'high' || this.is_zero_day) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Mark remediation as completed
   * @returns Promise resolving to updated record
   */
  public async completeRemediation(): Promise<this> {
    this.remediation_status = 'completed';
    this.remediation_completed_date = new Date();
    const remediationTime = this.getRemediationTime();
    if (remediationTime !== null) {
      this.time_to_remediation = remediationTime;
    }
    return this.save();
  }

  /**
   * Add remediation action
   * @param action Action description
   * @returns Promise resolving to updated record
   */
  public async addRemediationAction(action: string): Promise<this> {
    if (!this.remediation_actions.includes(action)) {
      this.remediation_actions = [...this.remediation_actions, action];
      return this.save();
    }
    return this;
  }

  /**
   * Record patch application
   * @param date Date patch was applied
   * @returns Promise resolving to updated record
   */
  public async recordPatchApplication(date?: Date): Promise<this> {
    this.was_patched = true;
    this.patch_applied_date = date || new Date();
    return this.save();
  }

  // Static methods
  /**
   * Find all critical CVE exploitations
   * @returns Promise resolving to critical exploitations
   */
  static async findCritical(): Promise<IncidentCVE[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { impact_level: 'critical' },
          { cvss_score: { [Op.gte]: 9.0 } },
          { is_zero_day: true }
        ]
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find overdue remediations
   * @param slaHours SLA hours for remediation
   * @returns Promise resolving to overdue remediations
   */
  static async findOverdueRemediations(slaHours: number = 72): Promise<IncidentCVE[]> {
    const slaDeadline = new Date(Date.now() - (slaHours * 60 * 60 * 1000));
    
    return this.findAll({
      where: {
        remediation_status: { [Op.in]: ['pending', 'in_progress'] },
        created_at: { [Op.lt]: slaDeadline }
      },
      order: [['created_at', 'ASC']]
    });
  }

  /**
   * Find zero-day exploitations
   * @returns Promise resolving to zero-day exploits
   */
  static async findZeroDays(): Promise<IncidentCVE[]> {
    return this.findAll({
      where: { is_zero_day: true },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find by incident
   * @param incidentId Incident ID to filter by
   * @returns Promise resolving to incident CVEs
   */
  static async findByIncident(incidentId: number): Promise<IncidentCVE[]> {
    return this.findAll({
      where: { incident_id: incidentId },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find by CVE
   * @param cveId CVE ID to filter by
   * @returns Promise resolving to CVE incidents
   */
  static async findByCVE(cveId: number): Promise<IncidentCVE[]> {
    return this.findAll({
      where: { cve_id: cveId },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find successfully exploited
   * @returns Promise resolving to successful exploitations
   */
  static async findSuccessfulExploitations(): Promise<IncidentCVE[]> {
    return this.findAll({
      where: { exploitation_successful: true },
      order: [['impact_level', 'DESC'], ['created_at', 'DESC']]
    });
  }

  /**
   * Find unpatched systems
   * @returns Promise resolving to unpatched exploitations
   */
  static async findUnpatched(): Promise<IncidentCVE[]> {
    return this.findAll({
      where: {
        patch_available: true,
        was_patched: false
      },
      order: [['patch_available_date', 'ASC']]
    });
  }

  /**
   * Get remediation statistics
   * @returns Promise resolving to remediation stats
   */
  static async getRemediationStats(): Promise<{
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
    avg_remediation_time: number;
  }> {
    const [total, pending, inProgress, completed] = await Promise.all([
      this.count(),
      this.count({ where: { remediation_status: 'pending' } }),
      this.count({ where: { remediation_status: 'in_progress' } }),
      this.count({ where: { remediation_status: 'completed' } })
    ]);

    const overdue = await this.count({
      where: {
        remediation_status: { [Op.in]: ['pending', 'in_progress'] },
        created_at: { [Op.lt]: new Date(Date.now() - (72 * 60 * 60 * 1000)) }
      }
    });

    const avgTime = await this.findOne({
      attributes: [[this.sequelize!.fn('AVG', this.sequelize!.col('time_to_remediation')), 'avg_time']],
      where: { remediation_status: 'completed' },
      raw: true
    });

    return {
      total,
      pending,
      in_progress: inProgress,
      completed,
      overdue,
      avg_remediation_time: avgTime ? parseFloat((avgTime as any).avg_time) || 0 : 0
    };
  }

  /**
   * Get exploitation trends
   * @param days Number of days to analyze
   * @returns Promise resolving to trend data
   */
  static async getExploitationTrends(days: number = 30): Promise<Array<{
    date: string;
    total: number;
    successful: number;
    critical: number;
    zero_days: number;
  }>> {
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('DATE', this.sequelize!.col('created_at')), 'date'],
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'total'],
        [this.sequelize!.fn('SUM', this.sequelize!.literal("CASE WHEN exploitation_successful = true THEN 1 ELSE 0 END")), 'successful'],
        [this.sequelize!.fn('SUM', this.sequelize!.literal("CASE WHEN impact_level = 'critical' THEN 1 ELSE 0 END")), 'critical'],
        [this.sequelize!.fn('SUM', this.sequelize!.literal("CASE WHEN is_zero_day = true THEN 1 ELSE 0 END")), 'zero_days']
      ],
      where: {
        created_at: { [Op.gte]: cutoffDate }
      },
      group: [this.sequelize!.fn('DATE', this.sequelize!.col('created_at'))],
      order: [[this.sequelize!.fn('DATE', this.sequelize!.col('created_at')), 'ASC']],
      raw: true
    });

    return results.map((r: any) => ({
      date: r.date,
      total: parseInt(r.total),
      successful: parseInt(r.successful),
      critical: parseInt(r.critical),
      zero_days: parseInt(r.zero_days)
    }));
  }

  /**
   * Create incident CVE relationship with validation
   * @param data Creation data
   * @returns Promise resolving to created relationship
   */
  static async createIncidentCVE(data: IncidentCVECreationAttributes): Promise<IncidentCVE> {
    // Check for duplicate relationship
    const existing = await this.findOne({
      where: {
        incident_id: data.incident_id,
        cve_id: data.cve_id
      }
    });

    if (existing) {
      throw new Error('Incident-CVE relationship already exists');
    }

    // Set detection timestamp if not provided
    if (!data.detection_timestamp) {
      data.detection_timestamp = new Date();
    }

    return this.create(data);
  }
}

export default IncidentCVE;
