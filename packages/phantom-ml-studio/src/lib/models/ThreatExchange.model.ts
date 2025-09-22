/**
 * THREAT EXCHANGE SEQUELIZE MODEL
 * Represents threat intelligence sharing and exchange
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
  tableName: 'threat_exchanges',
  timestamps: true,
  underscored: true
})
export class ThreatExchange extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare exchange_name: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare threat_type: string;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare shared_by: number;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  declare sharing_level: string; // internal, partner, community, public

  @Default('{}')
  @Column(DataType.JSONB)
  declare threat_data: Record<string, any>;

  @Default('active')
  @Column(DataType.STRING(20))
  declare status: string;

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare recipients: string[];

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Associations
  @BelongsTo(() => User)
  declare sharer: User;
}
