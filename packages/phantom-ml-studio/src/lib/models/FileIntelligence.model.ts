/**
 * FILE INTELLIGENCE SEQUELIZE MODEL
 * Represents file analysis and intelligence
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
  Index
} from 'sequelize-typescript';

@Table({
  tableName: 'file_intelligence',
  timestamps: true,
  underscored: true
})
export class FileIntelligence extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING(64))
  declare file_hash: string; // SHA256

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare file_name: string;

  @Default(0)
  @Column(DataType.BIGINT)
  declare file_size: number;

  @Column(DataType.STRING(50))
  declare file_type: string;

  @Default('unknown')
  @Column(DataType.STRING(20))
  declare threat_classification: string; // clean, suspicious, malicious, unknown

  @Default(50)
  @Column(DataType.INTEGER)
  declare reputation_score: number; // 0-100

  @Default('{}')
  @Column(DataType.JSONB)
  declare static_analysis: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare dynamic_analysis: Record<string, any>;

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare yara_matches: string[];

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare av_detections: string[];

  @Column(DataType.DATE)
  declare first_seen: Date;

  @Column(DataType.DATE)
  declare last_seen: Date;

  @Default('{}')
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Instance methods
  public isMalicious(): boolean {
    return this.threat_classification === 'malicious' || this.reputation_score <= 20;
  }

  public isSuspicious(): boolean {
    return this.threat_classification === 'suspicious' || 
           (this.reputation_score > 20 && this.reputation_score <= 50);
  }

  // Static methods
  static async findByHash(fileHash: string) {
    return this.findOne({ where: { file_hash: fileHash } });
  }

  static async findMalicious() {
    return this.findAll({
      where: { threat_classification: 'malicious' },
      order: [['reputation_score', 'ASC']]
    });
  }
}
