/**
 * THREAT ACTOR TACTIC JUNCTION MODEL
 * Links threat actors to MITRE tactics they use
 */
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  CreatedAt,
  BelongsTo,
  ForeignKey,
  DataType
} from 'sequelize-typescript';
import { ThreatActor } from './ThreatActor.model';
import { MitreTactic } from './MitreTactic.model';

@Table({
  tableName: 'threat_actor_tactics',
  timestamps: true,
  underscored: true
})
export class ThreatActorTactic extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => ThreatActor)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare threat_actor_id: number;

  @ForeignKey(() => MitreTactic)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare tactic_id: number;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  // Associations
  @BelongsTo(() => ThreatActor)
  declare threat_actor: ThreatActor;

  @BelongsTo(() => MitreTactic)
  declare tactic: MitreTactic;
}
