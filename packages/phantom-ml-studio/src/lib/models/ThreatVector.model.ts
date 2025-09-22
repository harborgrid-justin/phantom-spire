/**
 * THREAT VECTOR SEQUELIZE MODEL
 * Represents attack vectors and entry points
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
  tableName: 'threat_vectors',
  timestamps: true,
  underscored: true
})
export class ThreatVector extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare vector_name: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare vector_type: string; // email, web, network, physical, social

  @Default('medium')
  @Column(DataType.STRING(20))
  declare risk_level: string;

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare attack_techniques: string[];

  @Default('{}')
  @Column(DataType.JSONB)
  declare mitigation_controls: Record<string, any>;

  @Default(0)
  @Column(DataType.INTEGER)
  declare exploitation_count: number;

  @Default('{}')
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;
}
