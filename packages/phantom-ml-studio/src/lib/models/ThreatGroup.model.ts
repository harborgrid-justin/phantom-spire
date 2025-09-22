/**
 * THREAT GROUP SEQUELIZE MODEL
 * Represents threat actor groups and clusters
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
  HasMany,
  BelongsToMany,
  DataType
} from 'sequelize-typescript';
import { ThreatActor } from './ThreatActor.model';
import { Campaign } from './Campaign.model';

@Table({
  tableName: 'threat_groups',
  timestamps: true,
  underscored: true
})
export class ThreatGroup extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare group_name: string;

  @Column(DataType.TEXT)
  declare description: string;

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare aliases: string[];

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare associated_groups: string[];

  @Default('unknown')
  @Column(DataType.STRING(100))
  declare origin_country: string;

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare motivations: string[];

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare target_sectors: string[];

  @Default('intermediate')
  @Column(DataType.STRING(20))
  declare sophistication_level: string;

  @Default('{}')
  @Column(DataType.JSONB)
  declare group_profile: Record<string, any>;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Associations
  @HasMany(() => ThreatActor)
  declare threat_actors: ThreatActor[];

  @HasMany(() => Campaign)
  declare campaigns: Campaign[];
}
