/**
 * AUDIT LOG SEQUELIZE MODEL
 * Represents audit logs for security tracking with comprehensive type safety
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
  BelongsTo,
  ForeignKey,
  DataType,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { User } from './User.model';

// AuditLog Attributes Interface
export interface AuditLogAttributes {
  /** Unique identifier for the audit log entry */
  id: number;
  /** Foreign key reference to the user who performed the action */
  user_id?: number;
  /** Action performed (e.g., 'login', 'create_model', 'delete_dataset') */
  action: string;
  /** Type of resource affected */
  resource_type: string;
  /** ID of the specific resource affected */
  resource_id?: number;
  /** IP address from which the action was performed */
  ip_address?: string;
  /** User agent string of the client */
  user_agent?: string;
  /** Additional details about the action */
  details: Record<string, any>;
  /** Severity level of the audit event */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** HTTP status code if applicable */
  status_code?: number;
  /** Duration of the action in milliseconds */
  duration_ms?: number;
  /** Session ID associated with the action */
  session_id?: string;
  /** Request ID for correlation */
  request_id?: string;
  /** Record creation timestamp */
  created_at: Date;
}

// AuditLog Creation Attributes Interface
export interface AuditLogCreationAttributes extends Optional<AuditLogAttributes,
  'id' | 'user_id' | 'resource_id' | 'ip_address' | 'user_agent' | 'details' | 
  'severity' | 'status_code' | 'duration_ms' | 'session_id' | 'request_id' | 
  'created_at'
> {}

@Table({
  tableName: 'audit_logs',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['action'] },
    { fields: ['resource_type'] },
    { fields: ['resource_id'] },
    { fields: ['severity'] },
    { fields: ['ip_address'] },
    { fields: ['session_id'] },
    { fields: ['created_at'] }
  ]
})
export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  /** Unique identifier for the audit log entry */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Foreign key reference to the user who performed the action */
  @ForeignKey(() => User)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare user_id?: number;

  /** Action performed (e.g., 'login', 'create_model', 'delete_dataset') */
  @AllowNull(false)
  @Length({ min: 1, max: 100 })
  @Column(DataType.STRING(100))
  declare action: string;

  /** Type of resource affected */
  @AllowNull(false)
  @Length({ min: 1, max: 100 })
  @Column(DataType.STRING(100))
  declare resource_type: string;

  /** ID of the specific resource affected */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare resource_id?: number;

  /** IP address from which the action was performed */
  @AllowNull(true)
  @Length({ max: 45 })
  @Column(DataType.STRING(45))
  declare ip_address?: string;

  /** User agent string of the client */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare user_agent?: string;

  /** Additional details about the action */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare details: Record<string, any>;

  /** Severity level of the audit event */
  @AllowNull(false)
  @Default('info')
  @Column(DataType.ENUM('info', 'warning', 'error', 'critical'))
  declare severity: 'info' | 'warning' | 'error' | 'critical';

  /** HTTP status code if applicable */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare status_code?: number;

  /** Duration of the action in milliseconds */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare duration_ms?: number;

  /** Session ID associated with the action */
  @AllowNull(true)
  @Length({ max: 255 })
  @Column(DataType.STRING(255))
  declare session_id?: string;

  /** Request ID for correlation */
  @AllowNull(true)
  @Length({ max: 255 })
  @Column(DataType.STRING(255))
  declare request_id?: string;

  /** Record creation timestamp */
  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  // Associations
  /** User who performed the action */
  @BelongsTo(() => User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare user?: User;

  // Instance methods
  /**
   * Check if this is a security-related event
   * @returns True if severity is warning, error, or critical
   */
  public isSecurityEvent(): boolean {
    return ['warning', 'error', 'critical'].includes(this.severity);
  }

  /**
   * Check if this action was successful
   * @returns True if status code indicates success (2xx)
   */
  public isSuccessful(): boolean {
    return this.status_code ? this.status_code >= 200 && this.status_code < 300 : true;
  }

  /**
   * Get formatted duration string
   * @returns Duration string with appropriate units
   */
  public getFormattedDuration(): string {
    if (!this.duration_ms) return 'N/A';
    
    if (this.duration_ms < 1000) return `${this.duration_ms}ms`;
    if (this.duration_ms < 60000) return `${(this.duration_ms / 1000).toFixed(1)}s`;
    return `${(this.duration_ms / 60000).toFixed(1)}m`;
  }

  /**
   * Get severity color for UI display
   * @returns Color code for the severity level
   */
  public getSeverityColor(): string {
    const colors = {
      info: '#007bff',      // Blue
      warning: '#ffc107',   // Yellow
      error: '#dc3545',     // Red
      critical: '#6f42c1'   // Purple
    };
    return colors[this.severity];
  }

  // Static methods
  /**
   * Find audit logs by user
   * @param userId User ID to filter by
   * @param limit Maximum number of logs to return
   * @returns Promise resolving to audit logs array
   */
  static async findByUser(userId: number, limit: number = 100): Promise<AuditLog[]> {
    return this.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      include: [User]
    });
  }

  /**
   * Find audit logs by action
   * @param action Action to filter by
   * @returns Promise resolving to audit logs array
   */
  static async findByAction(action: string): Promise<AuditLog[]> {
    return this.findAll({
      where: { action },
      order: [['created_at', 'DESC']],
      include: [User]
    });
  }

  /**
   * Find audit logs by resource
   * @param resourceType Resource type to filter by
   * @param resourceId Optional resource ID to filter by
   * @returns Promise resolving to audit logs array
   */
  static async findByResource(resourceType: string, resourceId?: number): Promise<AuditLog[]> {
    const whereClause: any = { resource_type: resourceType };
    if (resourceId) {
      whereClause.resource_id = resourceId;
    }

    return this.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      include: [User]
    });
  }

  /**
   * Find audit logs by date range
   * @param startDate Start date for the range
   * @param endDate End date for the range
   * @returns Promise resolving to audit logs array
   */
  static async findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return this.findAll({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['created_at', 'DESC']],
      include: [User]
    });
  }

  /**
   * Find security-related events
   * @returns Promise resolving to security event logs
   */
  static async findSecurityEvents(): Promise<AuditLog[]> {
    return this.findAll({
      where: {
        severity: {
          [Op.in]: ['warning', 'error', 'critical']
        }
      },
      order: [['created_at', 'DESC']],
      include: [User]
    });
  }

  /**
   * Find failed actions (non-2xx status codes)
   * @returns Promise resolving to failed action logs
   */
  static async findFailedActions(): Promise<AuditLog[]> {
    return this.findAll({
      where: {
        status_code: {
          [Op.or]: [
            { [Op.lt]: 200 },
            { [Op.gte]: 400 }
          ]
        }
      },
      order: [['created_at', 'DESC']],
      include: [User]
    });
  }

  /**
   * Find logs by IP address
   * @param ipAddress IP address to filter by
   * @returns Promise resolving to audit logs array
   */
  static async findByIpAddress(ipAddress: string): Promise<AuditLog[]> {
    return this.findAll({
      where: { ip_address: ipAddress },
      order: [['created_at', 'DESC']],
      include: [User]
    });
  }

  /**
   * Find logs by session ID
   * @param sessionId Session ID to filter by
   * @returns Promise resolving to audit logs array
   */
  static async findBySession(sessionId: string): Promise<AuditLog[]> {
    return this.findAll({
      where: { session_id: sessionId },
      order: [['created_at', 'ASC']],
      include: [User]
    });
  }

  /**
   * Get action statistics
   * @returns Promise resolving to action statistics
   */
  static async getActionStats(): Promise<Array<{ action: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'action',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['action'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      action: r.action,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get severity distribution statistics
   * @returns Promise resolving to severity statistics
   */
  static async getSeverityStats(): Promise<Array<{ severity: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'severity',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['severity']
    });
    
    return results.map(r => ({
      severity: r.severity,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get resource type statistics
   * @returns Promise resolving to resource type statistics
   */
  static async getResourceTypeStats(): Promise<Array<{ resource_type: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'resource_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['resource_type'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      resource_type: r.resource_type,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get hourly activity statistics for a date range
   * @param startDate Start date for analysis
   * @param endDate End date for analysis
   * @returns Promise resolving to hourly activity data
   */
  static async getHourlyActivity(startDate: Date, endDate: Date): Promise<Array<{ hour: number; count: number }>> {
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('EXTRACT', this.sequelize!.literal('HOUR FROM created_at')), 'hour'],
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: [this.sequelize!.fn('EXTRACT', this.sequelize!.literal('HOUR FROM created_at'))],
      order: [[this.sequelize!.fn('EXTRACT', this.sequelize!.literal('HOUR FROM created_at')), 'ASC']]
    });
    
    return results.map(r => ({
      hour: parseInt((r as any).getDataValue('hour')),
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get average response time statistics
   * @returns Promise resolving to performance statistics
   */
  static async getPerformanceStats(): Promise<{
    avg_duration: number;
    min_duration: number;
    max_duration: number;
  } | null> {
    const result = await this.findAll({
      attributes: [
        [this.sequelize!.fn('AVG', this.sequelize!.col('duration_ms')), 'avg_duration'],
        [this.sequelize!.fn('MIN', this.sequelize!.col('duration_ms')), 'min_duration'],
        [this.sequelize!.fn('MAX', this.sequelize!.col('duration_ms')), 'max_duration']
      ],
      where: {
        duration_ms: {
          [Op.gt]: 0
        }
      }
    });

    return result[0] ? {
      avg_duration: parseFloat((result[0] as any).getDataValue('avg_duration')) || 0,
      min_duration: parseFloat((result[0] as any).getDataValue('min_duration')) || 0,
      max_duration: parseFloat((result[0] as any).getDataValue('max_duration')) || 0
    } : null;
  }

  /**
   * Create a new audit log entry
   * @param logData Audit log data
   * @returns Promise resolving to created audit log
   */
  static async createAuditLog(logData: AuditLogCreationAttributes): Promise<AuditLog> {
    return this.create(logData);
  }

  /**
   * Get recent activity
   * @param limit Maximum number of entries to return
   * @returns Promise resolving to recent audit logs
   */
  static async getRecentActivity(limit: number = 50): Promise<AuditLog[]> {
    return this.findAll({
      order: [['created_at', 'DESC']],
      limit,
      include: [User]
    });
  }
}

export default AuditLog;
