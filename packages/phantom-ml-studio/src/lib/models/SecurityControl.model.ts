/**
 * SECURITY CONTROL SEQUELIZE MODEL
 * Represents security controls and compliance framework
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
  DataType
} from 'sequelize-typescript';
import { User } from './User.model';
import { Op } from 'sequelize';

@Table({
  tableName: 'security_controls',
  timestamps: true,
  underscored: true
})
export class SecurityControl extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare control_name: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare control_id: string; // NIST, ISO, CIS identifier

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare framework: string; // NIST, ISO27001, CIS, SOC2

  @Column(DataType.TEXT)
  declare description: string;

  @Default('implemented')
  @Column(DataType.STRING(20))
  declare implementation_status: string; // not_implemented, partial, implemented, monitored

  @Default('medium')
  @Column(DataType.STRING(20))
  declare criticality: string; // low, medium, high, critical

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare owner_id: number;

  @Column(DataType.DATE)
  declare last_assessment: Date;

  @Column(DataType.DATE)
  declare next_assessment: Date;

  @Default('{}')
  @Column(DataType.JSONB)
  declare assessment_results: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare remediation_plan: Record<string, any>;

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare related_threats: string[];

  @Default('{}')
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Associations
  @BelongsTo(() => User)
  declare owner: User;

  // Instance methods
  public isFullyImplemented(): boolean {
    return this.implementation_status === 'implemented' || this.implementation_status === 'monitored';
  }

  public needsAssessment(): boolean {
    if (!this.next_assessment) return true;
    return new Date() >= this.next_assessment;
  }

  // Static methods
  static async findByFramework(framework: string) {
    return this.findAll({
      where: { framework },
      order: [['criticality', 'DESC'], ['control_id', 'ASC']]
    });
  }

  static async findNotImplemented() {
    return this.findAll({
      where: { implementation_status: 'not_implemented' },
      order: [['criticality', 'DESC']]
    });
  }

  static async findNeedingAssessment() {
    const now = new Date();
    return this.findAll({
      where: {
        [Op.or]: [
          { next_assessment: null },
          { next_assessment: { [Op.lte]: now } }
        ]
      },
      order: [['criticality', 'DESC']]
    });
  }
}
