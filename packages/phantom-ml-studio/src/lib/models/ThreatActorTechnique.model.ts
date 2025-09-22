/**
 * THREAT ACTOR TECHNIQUE JUNCTION MODEL
 * Links threat actors to MITRE techniques they use
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
import { MitreTechnique } from './MitreTechnique.model';

@Table({
  tableName: 'threat_actor_techniques',
  timestamps: true,
  underscored: true
})
export class ThreatActorTechnique extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Associated mitretechnique ID */
  @ForeignKey(() => MitreTechnique)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare mitretechnique_id?: number;

  @ForeignKey(() => ThreatActor)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare threat_actor_id: number;

  @ForeignKey(() => MitreTechnique)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare technique_id: number;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  // Associations
  @BelongsTo(() => ThreatActor)
  declare threat_actor: ThreatActor;

  @BelongsTo(() => MitreTechnique)
  declare technique: MitreTechnique;
}
  /** Associated mitretechnique */
  @BelongsTo(() => MitreTechnique, {
    foreignKey: 'mitretechnique_id',
    as: 'mitretechnique',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare mitretechnique?: MitreTechnique;

