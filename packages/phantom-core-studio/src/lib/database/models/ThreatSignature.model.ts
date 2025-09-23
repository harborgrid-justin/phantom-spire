/**
 * THREAT SIGNATURE SEQUELIZE MODEL
 * Represents threat detection signatures and rules
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

@Table({
  tableName: 'threat_signatures',
  timestamps: true,
  underscored: true
})
export class ThreatSignature extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare signature_name: string;

  @Column(DataType.TEXT)
  declare description: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare signature_type: string; // yara, snort, suricata, sigma

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare signature_content: string;

  @Default('active')
  @Column(DataType.STRING(20))
  declare status: string;

  @Default('medium')
  @Column(DataType.STRING(20))
  declare severity: string;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare created_by: number;

  @Default(0)
  @Column(DataType.INTEGER)
  declare match_count: number;

  @Default(0)
  @Column(DataType.INTEGER)
  declare false_positive_count: number;

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
  declare creator: User;

  // Instance methods
  public getAccuracy(): number {
    if (this.match_count === 0) return 0;
    return Math.round(((this.match_count - this.false_positive_count) / this.match_count) * 100);
  }

  // Static methods
  static async findByType(signatureType: string) {
    return this.findAll({
      where: { signature_type: signatureType },
      order: [['match_count', 'DESC']]
    });
  }

  static async findActive() {
    return this.findAll({
      where: { status: 'active' },
      order: [['created_at', 'DESC']]
    });
  }
}
