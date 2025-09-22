/**
 * INCIDENT SEQUELIZE MODEL
 * Represents security incidents
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
  HasMany,
  ForeignKey,
  DataType
} from 'sequelize-typescript';
import { User } from './User.model';
import { IncidentIOC } from './IncidentIOC.model';
import { IncidentCVE } from './IncidentCVE.model';
import { Alert } from './Alert.model';
import { Op } from 'sequelize';

@Table({
  tableName: 'incidents',
  timestamps: true,
  underscored: true
})
export class Incident extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare title: string;

  @Column(DataType.TEXT)
  declare description: string;

  @AllowNull(false)
  @Default('open')
  @Column(DataType.STRING(20))
  declare status: string; // open, investigating, contained, resolved, closed

  @AllowNull(false)
  @Default('medium')
  @Column(DataType.STRING(20))
  declare severity: string; // low, medium, high, critical

  @AllowNull(false)
  @Default('medium')
  @Column(DataType.STRING(20))
  declare priority: string; // low, medium, high, critical

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare assigned_to: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare created_by: number;

  @Column(DataType.STRING(100))
  declare incident_type: string; // Malware, Phishing, Data Breach, etc.

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare affected_systems: string[];

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare affected_users: string[];

  @Column(DataType.DATE)
  declare detected_at: Date;

  @Column(DataType.DATE)
  declare occurred_at: Date;

  @Column(DataType.DATE)
  declare contained_at: Date;

  @Column(DataType.DATE)
  declare resolved_at: Date;

  @Default('{}')
  @Column(DataType.JSONB)
  declare impact_assessment: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare timeline: Record<string, any>;

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  @Default('{}')
  @Column(DataType.JSONB)
  declare evidence: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare response_actions: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare lessons_learned: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Associations
  @BelongsTo(() => User, { foreignKey: 'assigned_to' })
  declare assignee: User;

  @BelongsTo(() => User, { foreignKey: 'created_by' })
  declare creator: User;

  @HasMany(() => IncidentIOC)
  declare incident_iocs: IncidentIOC[];

  @HasMany(() => IncidentCVE)
  declare incident_cves: IncidentCVE[];

  @HasMany(() => Alert)
  declare alerts: Alert[];

  // Instance methods
  public isOpen(): boolean {
    return ['open', 'investigating', 'contained'].includes(this.status);
  }

  public isCritical(): boolean {
    return this.severity === 'critical' || this.priority === 'critical';
  }

  public getTimeToDetection(): number | null {
    if (!this.occurred_at || !this.detected_at) return null;
    return Math.round((this.detected_at.getTime() - this.occurred_at.getTime()) / (1000 * 60 * 60)); // hours
  }

  public getTimeToContainment(): number | null {
    if (!this.detected_at || !this.contained_at) return null;
    return Math.round((this.contained_at.getTime() - this.detected_at.getTime()) / (1000 * 60 * 60)); // hours
  }

  public getTimeToResolution(): number | null {
    if (!this.detected_at || !this.resolved_at) return null;
    return Math.round((this.resolved_at.getTime() - this.detected_at.getTime()) / (1000 * 60 * 60)); // hours
  }

  public async escalate() {
    const priorityOrder = ['low', 'medium', 'high', 'critical'];
    const currentIndex = priorityOrder.indexOf(this.priority);
    if (currentIndex < priorityOrder.length - 1) {
      this.priority = priorityOrder[currentIndex + 1];
      return this.save();
    }
    return this;
  }

  public async updateStatus(newStatus: string, userId?: number) {
    const oldStatus = this.status;
    this.status = newStatus;
    
    if (newStatus === 'contained' && !this.contained_at) {
      this.contained_at = new Date();
    }
    
    if (newStatus === 'resolved' && !this.resolved_at) {
      this.resolved_at = new Date();
    }
    
    // Update timeline
    const timeline = this.timeline || {};
    timeline[new Date().toISOString()] = {
      action: 'status_change',
      from: oldStatus,
      to: newStatus,
      user_id: userId
    };
    this.timeline = timeline;
    
    return this.save();
  }

  // Static methods
  static async findOpen() {
    return this.findAll({
      where: { 
        status: { [Op.in]: ['open', 'investigating', 'contained'] }
      },
      order: [['priority', 'DESC'], ['created_at', 'DESC']]
    });
  }

  static async findBySeverity(severity: string) {
    return this.findAll({
      where: { severity },
      order: [['created_at', 'DESC']]
    });
  }

  static async findByStatus(status: string) {
    return this.findAll({
      where: { status },
      order: [['updated_at', 'DESC']]
    });
  }

  static async findAssignedTo(userId: number) {
    return this.findAll({
      where: { assigned_to: userId },
      order: [['priority', 'DESC'], ['created_at', 'DESC']]
    });
  }

  static async findByType(incidentType: string) {
    return this.findAll({
      where: { incident_type: incidentType },
      order: [['created_at', 'DESC']]
    });
  }

  static async findRecent(days: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        created_at: { [Op.gte]: cutoffDate }
      },
      order: [['created_at', 'DESC']]
    });
  }

  static async findOverdue(hours: number = 24) {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    
    return this.findAll({
      where: {
        status: { [Op.in]: ['open', 'investigating'] },
        created_at: { [Op.lt]: cutoffDate }
      },
      order: [['priority', 'DESC'], ['created_at', 'ASC']]
    });
  }

  static async getStatusStats() {
    const results = await this.findAll({
      attributes: [
        'status',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['status']
    });
    
    return results.map(r => ({
      status: r.status,
      count: (r as any).getDataValue('count')
    }));
  }

  static async getSeverityStats() {
    const results = await this.findAll({
      attributes: [
        'severity',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['severity']
    });
    
    return results.map(r => ({
      severity: r.severity,
      count: (r as any).getDataValue('count')
    }));
  }

  static async getTypeStats() {
    const results = await this.findAll({
      attributes: [
        'incident_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['incident_type'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      type: r.incident_type,
      count: (r as any).getDataValue('count')
    }));
  }

  static async getResponseTimeStats() {
    const incidents = await this.findAll({
      where: {
        detected_at: { [Op.not]: null },
        contained_at: { [Op.not]: null }
      }
    });

    const responseTimes = incidents.map(incident => {
      const detection = incident.getTimeToDetection();
      const containment = incident.getTimeToContainment();
      const resolution = incident.getTimeToResolution();
      
      return { detection, containment, resolution };
    });

    const avgDetection = responseTimes
      .filter(rt => rt.detection !== null)
      .reduce((sum, rt) => sum + (rt.detection || 0), 0) / responseTimes.length;
      
    const avgContainment = responseTimes
      .filter(rt => rt.containment !== null)
      .reduce((sum, rt) => sum + (rt.containment || 0), 0) / responseTimes.length;
      
    const avgResolution = responseTimes
      .filter(rt => rt.resolution !== null)
      .reduce((sum, rt) => sum + (rt.resolution || 0), 0) / responseTimes.length;

    return {
      avg_detection_hours: Math.round(avgDetection * 100) / 100,
      avg_containment_hours: Math.round(avgContainment * 100) / 100,
      avg_resolution_hours: Math.round(avgResolution * 100) / 100
    };
  }
}
