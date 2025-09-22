/**
 * COMPLIANCE CHECK SEQUELIZE MODEL
 * Represents compliance checks from phantom-compliance-core with comprehensive type safety
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

// ComplianceCheck Attributes Interface
export interface ComplianceCheckAttributes {
  /** Unique identifier for the compliance check */
  id: number;
  /** Name of the compliance check */
  check_name: string;
  /** Detailed description of the check */
  description?: string;
  /** Compliance framework (SOX, HIPAA, PCI-DSS, ISO27001, NIST, etc.) */
  framework: string;
  /** Framework-specific control ID */
  control_id: string;
  /** Type of compliance check */
  check_type: 'manual' | 'automated' | 'hybrid' | 'continuous';
  /** Current status of the check */
  status: 'pending' | 'passed' | 'failed' | 'not_applicable' | 'in_progress' | 'exempted';
  /** Severity level of the compliance requirement */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** When the check was last performed */
  last_checked?: Date;
  /** When the next check is due */
  next_check_due?: Date;
  /** ID of user assigned to this check */
  assigned_to?: number;
  /** Criteria that must be met for compliance */
  check_criteria: Record<string, any>;
  /** Evidence collected for the check */
  evidence: Record<string, any>;
  /** Steps to remediate any issues */
  remediation_steps: Record<string, any>;
  /** Additional notes */
  notes?: string;
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// ComplianceCheck Creation Attributes Interface
export interface ComplianceCheckCreationAttributes extends Optional<ComplianceCheckAttributes,
  'id' | 'description' | 'check_type' | 'status' | 'severity' | 'last_checked' | 
  'next_check_due' | 'assigned_to' | 'check_criteria' | 'evidence' | 'remediation_steps' |
  'notes' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'compliance_checks',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['framework'] },
    { fields: ['control_id'] },
    { fields: ['check_type'] },
    { fields: ['status'] },
    { fields: ['severity'] },
    { fields: ['last_checked'] },
    { fields: ['next_check_due'] },
    { fields: ['assigned_to'] },
    { fields: ['created_at'] }
  ]
})
export class ComplianceCheck extends Model<ComplianceCheckAttributes, ComplianceCheckCreationAttributes> implements ComplianceCheckAttributes {
  /** Unique identifier for the compliance check */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Name of the compliance check */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare check_name: string;

  /** Detailed description of the check */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Compliance framework (SOX, HIPAA, PCI-DSS, ISO27001, NIST, etc.) */
  @AllowNull(false)
  @Index
  @Length({ min: 1, max: 50 })
  @Column(DataType.STRING(50))
  declare framework: string;

  /** Framework-specific control ID */
  @AllowNull(false)
  @Length({ min: 1, max: 100 })
  @Column(DataType.STRING(100))
  declare control_id: string;

  /** Type of compliance check */
  @AllowNull(false)
  @Default('manual')
  @Index
  @Column(DataType.ENUM('manual', 'automated', 'hybrid', 'continuous'))
  declare check_type: 'manual' | 'automated' | 'hybrid' | 'continuous';

  /** Current status of the check */
  @AllowNull(false)
  @Default('pending')
  @Index
  @Column(DataType.ENUM('pending', 'passed', 'failed', 'not_applicable', 'in_progress', 'exempted'))
  declare status: 'pending' | 'passed' | 'failed' | 'not_applicable' | 'in_progress' | 'exempted';

  /** Severity level of the compliance requirement */
  @AllowNull(false)
  @Default('medium')
  @Index
  @Column(DataType.ENUM('low', 'medium', 'high', 'critical'))
  declare severity: 'low' | 'medium' | 'high' | 'critical';

  /** When the check was last performed */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare last_checked?: Date;

  /** When the next check is due */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare next_check_due?: Date;

  /** ID of user assigned to this check */
  @ForeignKey(() => User)
  @AllowNull(true)
  @Index
  @Column(DataType.INTEGER)
  declare assigned_to?: number;

  /** Criteria that must be met for compliance */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare check_criteria: Record<string, any>;

  /** Evidence collected for the check */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare evidence: Record<string, any>;

  /** Steps to remediate any issues */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare remediation_steps: Record<string, any>;

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
  /** User assigned to this compliance check */
  @BelongsTo(() => User, {
    foreignKey: 'assigned_to',
    as: 'assignee',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare assignee?: User;

  // Instance methods
  /**
   * Check if the compliance check has passed
   * @returns True if status is passed
   */
  public isPassed(): boolean {
    return this.status === 'passed';
  }

  /**
   * Check if the compliance check has failed
   * @returns True if status is failed
   */
  public isFailed(): boolean {
    return this.status === 'failed';
  }

  /**
   * Check if the compliance check is pending
   * @returns True if status is pending
   */
  public isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * Check if the compliance check is in progress
   * @returns True if status is in_progress
   */
  public isInProgress(): boolean {
    return this.status === 'in_progress';
  }

  /**
   * Check if the compliance check is not applicable
   * @returns True if status is not_applicable
   */
  public isNotApplicable(): boolean {
    return this.status === 'not_applicable';
  }

  /**
   * Check if the compliance check is exempted
   * @returns True if status is exempted
   */
  public isExempted(): boolean {
    return this.status === 'exempted';
  }

  /**
   * Check if the compliance check is overdue
   * @returns True if next check due date has passed
   */
  public isOverdue(): boolean {
    return this.next_check_due ? new Date() > this.next_check_due : false;
  }

  /**
   * Check if the compliance check is critical severity
   * @returns True if severity is critical
   */
  public isCritical(): boolean {
    return this.severity === 'critical';
  }

  /**
   * Check if the compliance check is high severity
   * @returns True if severity is high
   */
  public isHighSeverity(): boolean {
    return this.severity === 'high';
  }

  /**
   * Check if this is an automated check
   * @returns True if check type is automated
   */
  public isAutomated(): boolean {
    return this.check_type === 'automated';
  }

  /**
   * Check if this is a manual check
   * @returns True if check type is manual
   */
  public isManual(): boolean {
    return this.check_type === 'manual';
  }

  /**
   * Check if this is a continuous monitoring check
   * @returns True if check type is continuous
   */
  public isContinuous(): boolean {
    return this.check_type === 'continuous';
  }

  /**
   * Get the number of days until the next check is due
   * @returns Days until next check, null if no due date, negative if overdue
   */
  public getDaysUntilDue(): number | null {
    if (!this.next_check_due) return null;
    const diffTime = this.next_check_due.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get the number of days since last check
   * @returns Days since last check, null if never checked
   */
  public getDaysSinceLastCheck(): number | null {
    if (!this.last_checked) return null;
    const diffTime = new Date().getTime() - this.last_checked.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get the age of the compliance check in days
   * @returns Age in days since creation
   */
  public getAge(): number {
    const diffTime = new Date().getTime() - this.created_at.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if the check is due soon
   * @param days Number of days to consider "soon" (default: 7)
   * @returns True if check is due within the specified days
   */
  public isDueSoon(days: number = 7): boolean {
    const daysUntilDue = this.getDaysUntilDue();
    return daysUntilDue !== null && daysUntilDue <= days && daysUntilDue >= 0;
  }

  /**
   * Check if evidence has been collected
   * @returns True if evidence object has any keys
   */
  public hasEvidence(): boolean {
    return Object.keys(this.evidence).length > 0;
  }

  /**
   * Get evidence count
   * @returns Number of evidence items
   */
  public getEvidenceCount(): number {
    return Object.keys(this.evidence).length;
  }

  /**
   * Get remediation steps count
   * @returns Number of remediation steps
   */
  public getRemediationStepsCount(): number {
    return Object.keys(this.remediation_steps).length;
  }

  /**
   * Mark the compliance check as passed
   * @param evidence Optional evidence to record
   * @param notes Optional notes
   * @returns Promise resolving to updated check
   */
  public async markAsPassed(evidence?: Record<string, any>, notes?: string): Promise<this> {
    this.status = 'passed';
    this.last_checked = new Date();
    
    if (evidence) {
      this.evidence = { ...this.evidence, ...evidence };
    }
    
    if (notes) {
      this.notes = notes;
    }
    
    // Set next check due date (could be configurable based on framework requirements)
    if (this.check_type === 'continuous') {
      // Continuous checks don't have fixed schedules
    } else {
      const nextDue = new Date();
      nextDue.setMonth(nextDue.getMonth() + 12); // Default: annual review
      this.next_check_due = nextDue;
    }
    
    return this.save();
  }

  /**
   * Mark the compliance check as failed
   * @param evidence Optional evidence to record
   * @param remediationSteps Optional remediation steps
   * @param notes Optional notes
   * @returns Promise resolving to updated check
   */
  public async markAsFailed(evidence?: Record<string, any>, remediationSteps?: Record<string, any>, notes?: string): Promise<this> {
    this.status = 'failed';
    this.last_checked = new Date();
    
    if (evidence) {
      this.evidence = { ...this.evidence, ...evidence };
    }
    
    if (remediationSteps) {
      this.remediation_steps = { ...this.remediation_steps, ...remediationSteps };
    }
    
    if (notes) {
      this.notes = notes;
    }
    
    // Failed checks typically need more frequent review
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + 30); // Default: 30 days for failed checks
    this.next_check_due = nextDue;
    
    return this.save();
  }

  /**
   * Mark the compliance check as in progress
   * @param notes Optional notes
   * @returns Promise resolving to updated check
   */
  public async markInProgress(notes?: string): Promise<this> {
    this.status = 'in_progress';
    
    if (notes) {
      this.notes = notes;
    }
    
    this.metadata = {
      ...this.metadata,
      started_at: new Date()
    };
    
    return this.save();
  }

  /**
   * Mark the compliance check as not applicable
   * @param reason Reason for not being applicable
   * @returns Promise resolving to updated check
   */
  public async markNotApplicable(reason?: string): Promise<this> {
    this.status = 'not_applicable';
    
    if (reason) {
      this.notes = reason;
      this.metadata = {
        ...this.metadata,
        not_applicable_reason: reason,
        marked_not_applicable_at: new Date()
      };
    }
    
    return this.save();
  }

  /**
   * Grant exemption for the compliance check
   * @param reason Reason for exemption
   * @param exemptionExpiry Optional expiry date for exemption
   * @returns Promise resolving to updated check
   */
  public async grantExemption(reason: string, exemptionExpiry?: Date): Promise<this> {
    this.status = 'exempted';
    this.metadata = {
      ...this.metadata,
      exemption_reason: reason,
      exemption_granted_at: new Date(),
      exemption_expires_at: exemptionExpiry
    };
    
    if (exemptionExpiry) {
      this.next_check_due = exemptionExpiry;
    }
    
    return this.save();
  }

  /**
   * Assign the check to a user
   * @param userId User ID to assign to
   * @returns Promise resolving to updated check
   */
  public async assignTo(userId: number): Promise<this> {
    this.assigned_to = userId;
    this.metadata = {
      ...this.metadata,
      assigned_at: new Date()
    };
    return this.save();
  }

  /**
   * Update the next check due date
   * @param dueDate New due date
   * @returns Promise resolving to updated check
   */
  public async updateDueDate(dueDate: Date): Promise<this> {
    this.next_check_due = dueDate;
    return this.save();
  }

  /**
   * Add evidence to the check
   * @param key Evidence key
   * @param value Evidence value
   * @returns Promise resolving to updated check
   */
  public async addEvidence(key: string, value: any): Promise<this> {
    this.evidence = {
      ...this.evidence,
      [key]: value
    };
    return this.save();
  }

  /**
   * Add remediation step
   * @param step Step description
   * @param status Optional step status
   * @returns Promise resolving to updated check
   */
  public async addRemediationStep(step: string, status: string = 'pending'): Promise<this> {
    const stepId = `step_${Date.now()}`;
    this.remediation_steps = {
      ...this.remediation_steps,
      [stepId]: {
        description: step,
        status,
        added_at: new Date()
      }
    };
    return this.save();
  }

  // Static methods
  /**
   * Find compliance checks by framework
   * @param framework Framework to search for
   * @returns Promise resolving to checks for the framework
   */
  static async findByFramework(framework: string): Promise<ComplianceCheck[]> {
    return this.findAll({
      where: { framework },
      order: [['control_id', 'ASC']],
      include: [{ model: User, as: 'assignee' }]
    });
  }

  /**
   * Find compliance checks by status
   * @param status Status to filter by
   * @returns Promise resolving to checks with specified status
   */
  static async findByStatus(status: ComplianceCheckAttributes['status']): Promise<ComplianceCheck[]> {
    return this.findAll({
      where: { status },
      order: [['severity', 'DESC'], ['last_checked', 'DESC']]
    });
  }

  /**
   * Find failed compliance checks
   * @returns Promise resolving to failed checks
   */
  static async findFailed(): Promise<ComplianceCheck[]> {
    return this.findAll({
      where: { status: 'failed' },
      order: [['severity', 'DESC'], ['last_checked', 'DESC']],
      include: [{ model: User, as: 'assignee' }]
    });
  }

  /**
   * Find overdue compliance checks
   * @returns Promise resolving to overdue checks
   */
  static async findOverdue(): Promise<ComplianceCheck[]> {
    return this.findAll({
      where: {
        next_check_due: { [Op.lt]: new Date() },
        status: { [Op.notIn]: ['exempted', 'not_applicable'] }
      },
      order: [['next_check_due', 'ASC']],
      include: [{ model: User, as: 'assignee' }]
    });
  }

  /**
   * Find checks due within specified days
   * @param days Number of days to look ahead (default: 7)
   * @returns Promise resolving to checks due soon
   */
  static async findDueSoon(days: number = 7): Promise<ComplianceCheck[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.findAll({
      where: {
        next_check_due: {
          [Op.between]: [new Date(), futureDate]
        },
        status: { [Op.notIn]: ['exempted', 'not_applicable'] }
      },
      order: [['next_check_due', 'ASC']]
    });
  }

  /**
   * Find critical compliance checks
   * @returns Promise resolving to critical severity checks
   */
  static async findCritical(): Promise<ComplianceCheck[]> {
    return this.findAll({
      where: { severity: 'critical' },
      order: [['status', 'ASC'], ['next_check_due', 'ASC']]
    });
  }

  /**
   * Find checks assigned to a user
   * @param userId User ID
   * @returns Promise resolving to assigned checks
   */
  static async findByAssignee(userId: number): Promise<ComplianceCheck[]> {
    return this.findAll({
      where: { assigned_to: userId },
      order: [['next_check_due', 'ASC']]
    });
  }

  /**
   * Find unassigned compliance checks
   * @returns Promise resolving to unassigned checks
   */
  static async findUnassigned(): Promise<ComplianceCheck[]> {
    return this.findAll({
      where: { assigned_to: { [Op.is]: null } },
      order: [['severity', 'DESC'], ['next_check_due', 'ASC']]
    });
  }

  /**
   * Find automated compliance checks
   * @returns Promise resolving to automated checks
   */
  static async findAutomated(): Promise<ComplianceCheck[]> {
    return this.findAll({
      where: { check_type: 'automated' },
      order: [['framework', 'ASC'], ['control_id', 'ASC']]
    });
  }

  /**
   * Find continuous monitoring checks
   * @returns Promise resolving to continuous checks
   */
  static async findContinuous(): Promise<ComplianceCheck[]> {
    return this.findAll({
      where: { check_type: 'continuous' },
      order: [['framework', 'ASC'], ['control_id', 'ASC']]
    });
  }

  /**
   * Get compliance statistics by framework
   * @returns Promise resolving to compliance statistics
   */
  static async getComplianceStats(): Promise<Array<{
    framework: string;
    status: string;
    count: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'framework',
        'status',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['framework', 'status'],
      order: [['framework', 'ASC'], ['status', 'ASC']]
    });
    
    return results.map(r => ({
      framework: r.framework,
      status: r.status,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get overall compliance statistics
   * @returns Promise resolving to overall statistics
   */
  static async getOverallStats(): Promise<{
    total_checks: number;
    passed_checks: number;
    failed_checks: number;
    pending_checks: number;
    overdue_checks: number;
    critical_checks: number;
    compliance_rate: number;
  }> {
    const [
      totalChecks,
      passedChecks,
      failedChecks,
      pendingChecks,
      overdueChecks,
      criticalChecks
    ] = await Promise.all([
      this.count(),
      this.count({ where: { status: 'passed' } }),
      this.count({ where: { status: 'failed' } }),
      this.count({ where: { status: 'pending' } }),
      this.count({
        where: {
          next_check_due: { [Op.lt]: new Date() },
          status: { [Op.notIn]: ['exempted', 'not_applicable'] }
        }
      }),
      this.count({ where: { severity: 'critical' } })
    ]);

    const complianceRate = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

    return {
      total_checks: totalChecks,
      passed_checks: passedChecks,
      failed_checks: failedChecks,
      pending_checks: pendingChecks,
      overdue_checks: overdueChecks,
      critical_checks: criticalChecks,
      compliance_rate: Math.round(complianceRate * 100) / 100
    };
  }

  /**
   * Create compliance check with validation
   * @param data Compliance check data to create
   * @returns Promise resolving to created check
   */
  static async createCheck(data: ComplianceCheckCreationAttributes): Promise<ComplianceCheck> {
    // Validate required fields
    if (!data.framework || !data.control_id) {
      throw new Error('Framework and control ID are required');
    }

    // Set default next check due if not provided
    if (!data.next_check_due && data.check_type !== 'continuous') {
      const nextDue = new Date();
      if (data.severity === 'critical') {
        nextDue.setMonth(nextDue.getMonth() + 3); // Quarterly for critical
      } else if (data.severity === 'high') {
        nextDue.setMonth(nextDue.getMonth() + 6); // Semi-annual for high
      } else {
        nextDue.setMonth(nextDue.getMonth() + 12); // Annual for medium/low
      }
      data.next_check_due = nextDue;
    }

    return this.create(data);
  }
}

export default ComplianceCheck;
