/**
 * INCIDENT IOC JUNCTION MODEL
 * Links incidents to IOCs that were involved
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
import { IOC } from './IOC.model';

@Table({
  tableName: 'incident_iocs',
  timestamps: true,
  underscored: true
})
export class IncidentIOC extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Incident)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare incident_id: number;

  @ForeignKey(() => IOC)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare ioc_id: number;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  // Associations
  @BelongsTo(() => Incident)
  declare incident: Incident;

  @BelongsTo(() => IOC)
  declare ioc: IOC;
}
