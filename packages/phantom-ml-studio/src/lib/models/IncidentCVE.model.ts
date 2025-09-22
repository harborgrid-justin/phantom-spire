/**
 * INCIDENT CVE JUNCTION MODEL
 * Links incidents to CVEs that were exploited
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
import { Incident } from './Incident.model';
import { CVE } from './CVE.model';

@Table({
  tableName: 'incident_cves',
  timestamps: true,
  underscored: true
})
export class IncidentCVE extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Incident)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare incident_id: number;

  @ForeignKey(() => CVE)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare cve_id: number;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  // Associations
  @BelongsTo(() => Incident)
  declare incident: Incident;

  @BelongsTo(() => CVE)
  declare cve: CVE;
}
