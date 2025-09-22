/**
 * THREAT TREND SEQUELIZE MODEL
 * Represents threat trends and analytics
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
  DataType
} from 'sequelize-typescript';

@Table({
  tableName: 'threat_trends',
  timestamps: true,
  underscored: true
})
export class ThreatTrend extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare trend_name: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare threat_type: string;

  @Default('active')
  @Column(DataType.STRING(20))
  declare status: string;

  @Column(DataType.DATE)
  declare trend_start: Date;

  @Column(DataType.DATE)
  declare trend_end: Date;

  @Default(0)
  @Column(DataType.INTEGER)
  declare incident_count: number;

  @Default('{}')
  @Column(DataType.JSONB)
  declare trend_data: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare predictions: Record<string, any>;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Static methods
  static async findByType(threatType: string) {
    return this.findAll({
      where: { threat_type: threatType },
      order: [['incident_count', 'DESC']]
    });
  }

  static async findActive() {
    return this.findAll({
      where: { status: 'active' },
      order: [['trend_start', 'DESC']]
    });
  }
}
