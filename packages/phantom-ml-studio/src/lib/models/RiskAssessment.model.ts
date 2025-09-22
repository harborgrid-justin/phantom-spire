/**
 * RISK ASSESSMENT SEQUELIZE MODEL
 * Represents cybersecurity risk assessments with comprehensive type safety
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
  HasMany,
  ForeignKey,
  DataType,
  Index,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { User } from './User.model';

// RiskAssessment Attributes Interface
export interface RiskAssessmentAttributes {
  /** Unique identifier for the risk assessment */
  id: number;
  /** Name of the assessment */
  assessment_name: string;
  /** Name of the asset being assessed */
  asset_name: string;
  /** Asset category classification */
  asset_category: 'system' | 'network' | 'application' | 'data' | 'facility' | 'personnel' | 'other';
  /** ID of the user who created the assessment */
  assessor_id?: number;
  /** Current status of the assessment */
  status: 'draft' | 'in_progress' | 'review' | 'completed' | 'archived';
  /** Likelihood score (1-5) */
  likelihood_score: number;
  /** Impact score (1-5) */
  impact_score: number;
  /** Calculated risk score */
  risk_score: number;
  /** Risk level classification */
  risk_level: 'very_low' | 'low' | 'medium' | 'high' | 'critical';
  /** List of identified threats */
  threats_identified: string[];
  /** List of identified vulnerabilities */
  vulnerabilities_identified: string[];
  /** Risk factors and their weightings */
  risk_factors: Record<string, any>;
  /** Existing security controls */
  existing_controls: string[];
  /** Recommended mitigation strategies */
  mitigation_strategies: Record<string, any>;
  /** Action items and remediation steps */
  action_items: Record<string, any>;
  /** Assessment methodology used */
  methodology: string;
  /** Compliance frameworks considered */
  compliance_frameworks: string[];
  /** When the assessment was conducted */
  assessment_date?: Date;
  /** When findings expire and reassessment is due */
  expiration_date?: Date;
  /** Priority level for remediation */
  priority: 'low' | 'medium' | 'high' | 'urgent';
  /** Business unit or department */
  business_unit?: string;
  /** Assessment notes and comments */
  notes?: string;
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// RiskAssessment Creation Attributes Interface
export interface RiskAssessmentCreationAttributes extends Optional<RiskAssessmentAttributes,
  'id' | 'asset_category' | 'assessor_id' | 'status' | 'likelihood_score' | 
  'impact_score' | 'risk_score' | 'risk_level' | 'threats_identified' | 
  'vulnerabilities_identified' | 'risk_factors' | 'existing_controls' | 
  'mitigation_strategies' | 'action_items' | 'methodology' | 'compliance_frameworks' |
  'assessment_date' | 'expiration_date' | 'priority' | 'business_unit' | 'notes' |
  'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'risk_assessments',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['assessment_name'] },
    { fields: ['asset_name'] },
    { fields: ['asset_category'] },
    { fields: ['assessor_id'] },
    { fields: ['status'] },
    { fields: ['risk_level'] },
    { fields: ['priority'] },
    { fields: ['business_unit'] },
    { fields: ['assessment_date'] },
    { fields: ['expiration_date'] },
    { fields: ['created_at'] }
  ]
})
export class RiskAssessment extends Model<RiskAssessmentAttributes, RiskAssessmentCreationAttributes> implements RiskAssessmentAttributes {
  /** Unique identifier for the risk assessment */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Name of the assessment */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare assessment_name: string;

  /** Name of the asset being assessed */
  @AllowNull(false)
  @Index
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare asset_name: string;

  /** Asset category classification */
  @AllowNull(false)
  @Default('other')
  @Index
  @Column(DataType.ENUM('system', 'network', 'application', 'data', 'facility', 'personnel', 'other'))
  declare asset_category: 'system' | 'network' | 'application' | 'data' | 'facility' | 'personnel' | 'other';

  /** ID of the user who created the assessment */
  @ForeignKey(() => User)
  @AllowNull(true)
  @Index
  @Column(DataType.INTEGER)
  declare assessor_id?: number;

  /** Current status of the assessment */
  @AllowNull(false)
  @Default('draft')
  @Index
  @Column(DataType.ENUM('draft', 'in_progress', 'review', 'completed', 'archived'))
  declare status: 'draft' | 'in_progress' | 'review' | 'completed' | 'archived';

  /** Likelihood score (1-5) */
  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare likelihood_score: number;

  /** Impact score (1-5) */
  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare impact_score: number;

  /** Calculated risk score */
  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare risk_score: number;

  /** Risk level classification */
  @AllowNull(false)
  @Default('low')
  @Index
  @Column(DataType.ENUM('very_low', 'low', 'medium', 'high', 'critical'))
  declare risk_level: 'very_low' | 'low' | 'medium' | 'high' | 'critical';

  /** List of identified threats */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare threats_identified: string[];

  /** List of identified vulnerabilities */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare vulnerabilities_identified: string[];

  /** Risk factors and their weightings */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare risk_factors: Record<string, any>;

  /** Existing security controls */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare existing_controls: string[];

  /** Recommended mitigation strategies */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare mitigation_strategies: Record<string, any>;

  /** Action items and remediation steps */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare action_items: Record<string, any>;

  /** Assessment methodology used */
  @AllowNull(false)
  @Default('qualitative')
  @Column(DataType.STRING(100))
  declare methodology: string;

  /** Compliance frameworks considered */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare compliance_frameworks: string[];

  /** When the assessment was conducted */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare assessment_date?: Date;

  /** When findings expire and reassessment is due */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare expiration_date?: Date;

  /** Priority level for remediation */
  @AllowNull(false)
  @Default('medium')
  @Index
  @Column(DataType.ENUM('low', 'medium', 'high', 'urgent'))
  declare priority: 'low' | 'medium' | 'high' | 'urgent';

  /** Business unit or department */
  @AllowNull(true)
  @Index
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare business_unit?: string;

  /** Assessment notes and comments */
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
  /** Assessor who created this assessment */
  @BelongsTo(() => User, {
    foreignKey: 'assessor_id',
    as: 'assessor',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare assessor?: User;

  // Instance methods
  /**
   * Calculate risk score based on likelihood and impact
   * @returns Calculated risk score (1-25)
   */
  public calculateRiskScore(): number {
    return this.likelihood_score * this.impact_score;
  }

  /**
   * Determine risk level based on risk score
   * @returns Risk level classification
   */
  public determineRiskLevel(): RiskAssessmentAttributes['risk_level'] {
    const score = this.calculateRiskScore();
    if (score >= 20) return 'critical';
    if (score >= 15) return 'high';
    if (score >= 9) return 'medium';
    if (score >= 4) return 'low';
    return 'very_low';
  }

  /**
   * Check if this is a high-risk assessment
   * @returns True if risk level is high or critical
   */
  public isHighRisk(): boolean {
    return this.risk_level === 'high' || this.risk_level === 'critical';
  }

  /**
   * Check if this is a critical risk assessment
   * @returns True if risk level is critical
   */
  public isCriticalRisk(): boolean {
    return this.risk_level === 'critical';
  }

  /**
   * Check if assessment is completed
   * @returns True if status is completed
   */
  public isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * Check if assessment is in progress
   * @returns True if status is in_progress or review
   */
  public isInProgress(): boolean {
    return this.status === 'in_progress' || this.status === 'review';
  }

  /**
   * Check if assessment is overdue for update
   * @returns True if past expiration date
   */
  public isOverdue(): boolean {
    if (!this.expiration_date) return false;
    return new Date() > this.expiration_date;
  }

  /**
   * Get days until assessment expires
   * @returns Days until expiration, or null if no expiration date
   */
  public getDaysUntilExpiration(): number | null {
    if (!this.expiration_date) return null;
    const diffTime = this.expiration_date.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get age of assessment in days
   * @returns Age in days since creation
   */
  public getAge(): number {
    const diffTime = new Date().getTime() - this.created_at.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get assessment freshness (days since assessment date)
   * @returns Days since assessment, or null if no assessment date
   */
  public getFreshness(): number | null {
    if (!this.assessment_date) return null;
    const diffTime = new Date().getTime() - this.assessment_date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get risk score as percentage (0-100)
   * @returns Risk score as percentage
   */
  public getRiskPercentage(): number {
    return Math.round((this.risk_score / 25) * 100);
  }

  /**
   * Get number of threats identified
   * @returns Count of identified threats
   */
  public getThreatCount(): number {
    return this.threats_identified.length;
  }

  /**
   * Get number of vulnerabilities identified
   * @returns Count of identified vulnerabilities
   */
  public getVulnerabilityCount(): number {
    return this.vulnerabilities_identified.length;
  }

  /**
   * Get number of existing controls
   * @returns Count of existing controls
   */
  public getControlCount(): number {
    return this.existing_controls.length;
  }

  /**
   * Check if assessment addresses specific compliance framework
   * @param framework Framework name to check
   * @returns True if framework is included
   */
  public addressesFramework(framework: string): boolean {
    return this.compliance_frameworks.includes(framework);
  }

  /**
   * Update risk scores and recalculate risk level
   * @param likelihood New likelihood score (1-5)
   * @param impact New impact score (1-5)
   * @returns Promise resolving to updated assessment
   */
  public async updateRiskScores(likelihood: number, impact: number): Promise<this> {
    this.likelihood_score = Math.max(1, Math.min(5, likelihood));
    this.impact_score = Math.max(1, Math.min(5, impact));
    this.risk_score = this.calculateRiskScore();
    this.risk_level = this.determineRiskLevel();
    return this.save();
  }

  /**
   * Add a threat to the identified threats list
   * @param threat Threat to add
   * @returns Promise resolving to updated assessment
   */
  public async addThreat(threat: string): Promise<this> {
    if (!this.threats_identified.includes(threat)) {
      this.threats_identified = [...this.threats_identified, threat];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a threat from the identified threats list
   * @param threat Threat to remove
   * @returns Promise resolving to updated assessment
   */
  public async removeThreat(threat: string): Promise<this> {
    this.threats_identified = this.threats_identified.filter(t => t !== threat);
    return this.save();
  }

  /**
   * Add a vulnerability to the identified vulnerabilities list
   * @param vulnerability Vulnerability to add
   * @returns Promise resolving to updated assessment
   */
  public async addVulnerability(vulnerability: string): Promise<this> {
    if (!this.vulnerabilities_identified.includes(vulnerability)) {
      this.vulnerabilities_identified = [...this.vulnerabilities_identified, vulnerability];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a vulnerability from the identified vulnerabilities list
   * @param vulnerability Vulnerability to remove
   * @returns Promise resolving to updated assessment
   */
  public async removeVulnerability(vulnerability: string): Promise<this> {
    this.vulnerabilities_identified = this.vulnerabilities_identified.filter(v => v !== vulnerability);
    return this.save();
  }

  /**
   * Add an existing control to the controls list
   * @param control Control to add
   * @returns Promise resolving to updated assessment
   */
  public async addControl(control: string): Promise<this> {
    if (!this.existing_controls.includes(control)) {
      this.existing_controls = [...this.existing_controls, control];
      return this.save();
    }
    return this;
  }

  /**
   * Mark assessment as completed
   * @returns Promise resolving to updated assessment
   */
  public async markCompleted(): Promise<this> {
    this.status = 'completed';
    if (!this.assessment_date) {
      this.assessment_date = new Date();
    }
    return this.save();
  }

  /**
   * Set expiration date based on assessment date
   * @param months Number of months until expiration
   * @returns Promise resolving to updated assessment
   */
  public async setExpirationFromAssessment(months: number = 12): Promise<this> {
    if (this.assessment_date) {
      const expiration = new Date(this.assessment_date);
      expiration.setMonth(expiration.getMonth() + months);
      this.expiration_date = expiration;
      return this.save();
    }
    return this;
  }

  // Static methods
  /**
   * Find assessments by risk level
   * @param riskLevel Risk level to filter by
   * @returns Promise resolving to assessments with specified risk level
   */
  static async findByRiskLevel(riskLevel: RiskAssessmentAttributes['risk_level']): Promise<RiskAssessment[]> {
    return this.findAll({
      where: { risk_level: riskLevel },
      order: [['risk_score', 'DESC']]
    });
  }

  /**
   * Find high-risk assessments (high or critical)
   * @returns Promise resolving to high-risk assessments
   */
  static async findHighRisk(): Promise<RiskAssessment[]> {
    return this.findAll({
      where: {
        risk_level: { [Op.in]: ['high', 'critical'] }
      },
      order: [['risk_score', 'DESC']]
    });
  }

  /**
   * Find assessments by status
   * @param status Status to filter by
   * @returns Promise resolving to assessments with specified status
   */
  static async findByStatus(status: RiskAssessmentAttributes['status']): Promise<RiskAssessment[]> {
    return this.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find assessments by asset category
   * @param category Asset category to filter by
   * @returns Promise resolving to assessments for specified category
   */
  static async findByAssetCategory(category: RiskAssessmentAttributes['asset_category']): Promise<RiskAssessment[]> {
    return this.findAll({
      where: { asset_category: category },
      order: [['risk_score', 'DESC']]
    });
  }

  /**
   * Find assessments by business unit
   * @param businessUnit Business unit to filter by
   * @returns Promise resolving to assessments for specified unit
   */
  static async findByBusinessUnit(businessUnit: string): Promise<RiskAssessment[]> {
    return this.findAll({
      where: { business_unit: businessUnit },
      order: [['risk_score', 'DESC']]
    });
  }

  /**
   * Find assessments by assessor
   * @param assessorId Assessor user ID
   * @returns Promise resolving to assessments by specified assessor
   */
  static async findByAssessor(assessorId: number): Promise<RiskAssessment[]> {
    return this.findAll({
      where: { assessor_id: assessorId },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find overdue assessments
   * @returns Promise resolving to overdue assessments
   */
  static async findOverdue(): Promise<RiskAssessment[]> {
    return this.findAll({
      where: {
        expiration_date: { [Op.lt]: new Date() }
      },
      order: [['expiration_date', 'ASC']]
    });
  }

  /**
   * Find assessments expiring soon
   * @param days Number of days to look ahead (default: 30)
   * @returns Promise resolving to assessments expiring soon
   */
  static async findExpiringSoon(days: number = 30): Promise<RiskAssessment[]> {
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
   * Find recent assessments
   * @param days Number of days to look back (default: 30)
   * @returns Promise resolving to recent assessments
   */
  static async findRecent(days: number = 30): Promise<RiskAssessment[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        created_at: { [Op.gte]: cutoffDate }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Search assessments by name or asset
   * @param query Search query
   * @returns Promise resolving to matching assessments
   */
  static async searchAssessments(query: string): Promise<RiskAssessment[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { assessment_name: { [Op.iLike]: `%${query}%` } },
          { asset_name: { [Op.iLike]: `%${query}%` } },
          { business_unit: { [Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get risk level distribution statistics
   * @returns Promise resolving to risk level statistics
   */
  static async getRiskLevelStats(): Promise<Array<{ risk_level: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'risk_level',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['risk_level']
    });
    
    return results.map(r => ({
      risk_level: r.risk_level,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get asset category distribution statistics
   * @returns Promise resolving to asset category statistics
   */
  static async getAssetCategoryStats(): Promise<Array<{ asset_category: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'asset_category',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['asset_category'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      asset_category: r.asset_category,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get comprehensive assessment statistics
   * @returns Promise resolving to assessment statistics
   */
  static async getAssessmentStats(): Promise<{
    total_assessments: number;
    completed_assessments: number;
    in_progress_assessments: number;
    high_risk_assessments: number;
    critical_risk_assessments: number;
    overdue_assessments: number;
    avg_risk_score: number;
  }> {
    const [
      totalAssessments,
      completedAssessments,
      inProgressAssessments,
      highRiskAssessments,
      criticalRiskAssessments,
      overdueAssessments,
      avgRiskResult
    ] = await Promise.all([
      this.count(),
      this.count({ where: { status: 'completed' } }),
      this.count({ where: { status: { [Op.in]: ['in_progress', 'review'] } } }),
      this.count({ where: { risk_level: { [Op.in]: ['high', 'critical'] } } }),
      this.count({ where: { risk_level: 'critical' } }),
      this.count({ where: { expiration_date: { [Op.lt]: new Date() } } }),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('AVG', this.sequelize!.col('risk_score')), 'avg_score']
        ]
      }).then(results => results[0])
    ]);

    return {
      total_assessments: totalAssessments,
      completed_assessments: completedAssessments,
      in_progress_assessments: inProgressAssessments,
      high_risk_assessments: highRiskAssessments,
      critical_risk_assessments: criticalRiskAssessments,
      overdue_assessments: overdueAssessments,
      avg_risk_score: parseFloat((avgRiskResult as any).getDataValue('avg_score')) || 0
    };
  }

  /**
   * Create risk assessment with validation
   * @param data Assessment data to create
   * @returns Promise resolving to created assessment
   */
  static async createAssessment(data: RiskAssessmentCreationAttributes): Promise<RiskAssessment> {
    // Validate likelihood score
    if (data.likelihood_score && (data.likelihood_score < 1 || data.likelihood_score > 5)) {
      throw new Error('Likelihood score must be between 1 and 5');
    }

    // Validate impact score
    if (data.impact_score && (data.impact_score < 1 || data.impact_score > 5)) {
      throw new Error('Impact score must be between 1 and 5');
    }

    // Set assessment date if not provided
    if (!data.assessment_date) {
      data.assessment_date = new Date();
    }

    const assessment = await this.create(data);
    
    // Update calculated fields
    if (data.likelihood_score && data.impact_score) {
      assessment.risk_score = assessment.calculateRiskScore();
      assessment.risk_level = assessment.determineRiskLevel();
      await assessment.save();
    }

    return assessment;
  }
}

export default RiskAssessment;
