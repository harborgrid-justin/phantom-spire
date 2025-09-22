/**
 * THREAT LANDSCAPE SEQUELIZE MODEL
 * Represents comprehensive threat landscape analysis
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
  tableName: 'threat_landscapes',
  timestamps: true,
  underscored: true
})
export class ThreatLandscape extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare landscape_name: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare industry_sector: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare geographic_region: string;

  @Column(DataType.DATE)
  declare analysis_period_start: Date;

  @Column(DataType.DATE)
  declare analysis_period_end: Date;

  @Default('{}')
  @Column(DataType.JSONB)
  declare threat_trends: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare actor_analysis: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare technique_analysis: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare vulnerability_trends: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare recommendations: Record<string, any>;

  @Default('active')
  @Column(DataType.STRING(20))
  declare status: string;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;
}
