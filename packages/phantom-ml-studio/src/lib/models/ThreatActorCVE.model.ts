/**
 * THREAT ACTOR CVE JUNCTION MODEL
 * Links threat actors to CVEs they exploit
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
import { CVE } from './CVE.model';

@Table({
  tableName: 'threat_actor_cves',
  timestamps: true,
  underscored: true
})
export class ThreatActorCVE extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => ThreatActor)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare threat_actor_id: number;

  @ForeignKey(() => CVE)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare cve_id: number;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  // Associations
  @BelongsTo(() => ThreatActor)
  declare threat_actor: ThreatActor;

  @BelongsTo(() => CVE)
  declare cve: CVE;
}
