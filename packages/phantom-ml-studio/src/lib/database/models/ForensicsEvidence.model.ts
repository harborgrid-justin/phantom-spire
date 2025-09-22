/**
 * FORENSICS EVIDENCE SEQUELIZE MODEL
 * Represents digital forensics evidence from phantom-forensics-core
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
  Index
} from 'sequelize-typescript';
import { User } from './User.model';
import { Incident } from './Incident.model';

@Table({
  tableName: 'forensics_evidence',
  timestamps: true,
  underscored: true
})
export class ForensicsEvidence extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare evidence_name: string;

  @Column(DataType.TEXT)
  declare description: string;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING(50))
  declare evidence_type: string; // file, memory, network, registry, log

  @Column(DataType.STRING(500))
  declare file_path: string;

  @Column(DataType.STRING(64))
  declare file_hash: string;

  @Column(DataType.BIGINT)
  declare file_size: number;

  @Column(DataType.STRING(100))
  declare mime_type: string;

  @ForeignKey(() => Incident)
  @Column(DataType.INTEGER)
  declare incident_id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare collected_by: number;

  @Column(DataType.DATE)
  declare collected_at: Date;

  @AllowNull(false)
  @Default('collected')
  @Column(DataType.STRING(20))
  declare status: string; // collected, analyzed, preserved, archived

  @Default('{}')
  @Column(DataType.JSONB)
  declare chain_of_custody: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare analysis_results: Record<string, any>;

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
  @BelongsTo(() => Incident)
  declare incident: Incident;

  @BelongsTo(() => User)
  declare collector: User;

  // Instance methods
  public async preserve() {
    this.status = 'preserved';
    return this.save();
  }

  public async analyze() {
    this.status = 'analyzed';
    return this.save();
  }

  // Static methods
  static async findByType(evidenceType: string) {
    return this.findAll({
      where: { evidence_type: evidenceType },
      order: [['collected_at', 'DESC']]
    });
  }

  static async findByIncident(incidentId: number) {
    return this.findAll({
      where: { incident_id: incidentId },
      order: [['collected_at', 'ASC']]
    });
  }
}
