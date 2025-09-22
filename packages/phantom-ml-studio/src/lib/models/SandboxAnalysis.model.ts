/**
 * SANDBOX ANALYSIS SEQUELIZE MODEL
 * Represents dynamic malware analysis results
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
import { MalwareSample } from './MalwareSample.model';
import { User } from './User.model';
import { Op } from 'sequelize';

@Table({
  tableName: 'sandbox_analyses',
  timestamps: true,
  underscored: true
})
export class SandboxAnalysis extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => MalwareSample)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare sample_id: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare analyst_id: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare sandbox_name: string; // Cuckoo, Joe Sandbox, etc.

  @AllowNull(false)
  @Default('queued')
  @Column(DataType.STRING(20))
  declare status: string; // queued, running, completed, failed

  @Column(DataType.DATE)
  declare analysis_start: Date;

  @Column(DataType.DATE)
  declare analysis_end: Date;

  @Default(300)
  @Column(DataType.INTEGER)
  declare execution_time: number; // seconds

  @Default('{}')
  @Column(DataType.JSONB)
  declare environment_config: Record<string, any>; // OS, VM settings

  @Default('{}')
  @Column(DataType.JSONB)
  declare behavioral_analysis: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare network_analysis: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare file_system_changes: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare registry_changes: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare process_analysis: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare api_calls: Record<string, any>;

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare dropped_files: string[];

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare network_connections: string[];

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare dns_queries: string[];

  @Default('{}')
  @Column(DataType.JSONB)
  declare screenshots: Record<string, any>;

  @Default(0)
  @Column(DataType.INTEGER)
  declare maliciousness_score: number; // 0-100

  @Default('{}')
  @Column(DataType.JSONB)
  declare yara_matches: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare signatures_triggered: Record<string, any>;

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
  @BelongsTo(() => MalwareSample)
  declare sample: MalwareSample;

  @BelongsTo(() => User)
  declare analyst: User;

  // Instance methods
  public isCompleted(): boolean {
    return this.status === 'completed';
  }

  public isMalicious(): boolean {
    return this.maliciousness_score >= 70;
  }

  public getDuration(): number | null {
    if (!this.analysis_start || !this.analysis_end) return null;
    return Math.round((this.analysis_end.getTime() - this.analysis_start.getTime()) / 1000);
  }

  public async complete() {
    this.status = 'completed';
    this.analysis_end = new Date();
    return this.save();
  }

  // Static methods
  static async findBySample(sampleId: number) {
    return this.findAll({
      where: { sample_id: sampleId },
      order: [['created_at', 'DESC']]
    });
  }

  static async findBySandbox(sandboxName: string) {
    return this.findAll({
      where: { sandbox_name: sandboxName },
      order: [['created_at', 'DESC']]
    });
  }

  static async findMalicious() {
    return this.findAll({
      where: { maliciousness_score: { [Op.gte]: 70 } },
      order: [['maliciousness_score', 'DESC']]
    });
  }
}
