/**
 * METRICS DATA SEQUELIZE MODEL
 * Represents deployment metrics over time with comprehensive type safety
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
import { Deployment } from './Deployment.model';

// MetricsData Attributes Interface
export interface MetricsDataAttributes {
  /** Unique identifier for the metrics data record */
  id: number;
  /** Foreign key reference to the deployment */
  deployment_id: number;
  /** Time point for this metric (e.g., '10:30') */
  time: string;
  /** Number of requests during this time period */
  requests: number;
  /** Average response time in milliseconds */
  response_time: number;
  /** Number of errors during this time period */
  errors: number;
  /** CPU utilization percentage */
  cpu_usage?: number;
  /** Memory utilization percentage */
  memory_usage?: number;
  /** Disk I/O operations per second */
  disk_io?: number;
  /** Network throughput in bytes per second */
  network_throughput?: number;
  /** Custom metrics data */
  custom_metrics: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
}

// MetricsData Creation Attributes Interface
export interface MetricsDataCreationAttributes extends Optional<MetricsDataAttributes,
  'id' | 'requests' | 'response_time' | 'errors' | 'cpu_usage' | 'memory_usage' | 
  'disk_io' | 'network_throughput' | 'custom_metrics' | 'created_at'
> {}

@Table({
  tableName: 'metrics_data',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['deployment_id'] },
    { fields: ['time'] },
    { fields: ['created_at'] },
    { fields: ['deployment_id', 'created_at'] },
    { fields: ['requests'] },
    { fields: ['response_time'] },
    { fields: ['errors'] }
  ]
})
export class MetricsData extends Model<MetricsDataAttributes, MetricsDataCreationAttributes> implements MetricsDataAttributes {
  /** Unique identifier for the metrics data record */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Foreign key reference to the deployment */
  @ForeignKey(() => Deployment)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare deployment_id: number;

  /** Time point for this metric (e.g., '10:30') */
  @AllowNull(false)
  @Length({ min: 1, max: 10 })
  @Column(DataType.STRING(10))
  declare time: string;

  /** Number of requests during this time period */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare requests: number;

  /** Average response time in milliseconds */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare response_time: number;

  /** Number of errors during this time period */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare errors: number;

  /** CPU utilization percentage */
  @AllowNull(true)
  @Column(DataType.FLOAT)
  declare cpu_usage?: number;

  /** Memory utilization percentage */
  @AllowNull(true)
  @Column(DataType.FLOAT)
  declare memory_usage?: number;

  /** Disk I/O operations per second */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare disk_io?: number;

  /** Network throughput in bytes per second */
  @AllowNull(true)
  @Column(DataType.BIGINT)
  declare network_throughput?: number;

  /** Custom metrics data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare custom_metrics: Record<string, any>;

  /** Record creation timestamp */
  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  // Associations
  /** Deployment this metrics data belongs to */
  @BelongsTo(() => Deployment, {
    foreignKey: 'deployment_id',
    as: 'deployment',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare deployment?: Deployment;

  // Instance methods
  /**
   * Calculate error rate percentage
   * @returns Error rate as percentage (0-100)
   */
  public getErrorRate(): number {
    return this.requests > 0 ? (this.errors / this.requests) * 100 : 0;
  }

  /**
   * Calculate success rate percentage
   * @returns Success rate as percentage (0-100)
   */
  public getSuccessRate(): number {
    return this.requests > 0 ? ((this.requests - this.errors) / this.requests) * 100 : 0;
  }

  /**
   * Check if this is a high-error period
   * @param threshold Error rate threshold (default: 5%)
   * @returns True if error rate exceeds threshold
   */
  public isHighErrorPeriod(threshold: number = 5): boolean {
    return this.getErrorRate() > threshold;
  }

  /**
   * Check if response time is slow
   * @param threshold Response time threshold in ms (default: 1000ms)
   * @returns True if response time exceeds threshold
   */
  public isSlowResponse(threshold: number = 1000): boolean {
    return this.response_time > threshold;
  }

  /**
   * Get performance grade based on metrics
   * @returns Performance grade (A, B, C, D, F)
   */
  public getPerformanceGrade(): string {
    const errorRate = this.getErrorRate();
    const responseTime = this.response_time;
    
    let score = 100;
    
    // Deduct points for errors
    if (errorRate > 10) score -= 50;
    else if (errorRate > 5) score -= 30;
    else if (errorRate > 2) score -= 15;
    else if (errorRate > 0) score -= 5;
    
    // Deduct points for slow response
    if (responseTime > 5000) score -= 40;
    else if (responseTime > 2000) score -= 25;
    else if (responseTime > 1000) score -= 15;
    else if (responseTime > 500) score -= 5;
    
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Get throughput (requests per second equivalent)
   * @returns Estimated throughput
   */
  public getThroughput(): number {
    // Assuming time represents a minute interval
    return this.requests;
  }

  // Static methods
  /**
   * Find metrics data by deployment
   * @param deploymentId Deployment ID to filter by
   * @param limit Optional limit for results
   * @returns Promise resolving to metrics data array
   */
  static async findByDeployment(deploymentId: number, limit?: number): Promise<MetricsData[]> {
    const options: any = {
      where: { deployment_id: deploymentId },
      order: [['created_at', 'DESC']]
    };
    
    if (limit) {
      options.limit = limit;
    }
    
    return this.findAll(options);
  }

  /**
   * Find metrics data by time range
   * @param deploymentId Deployment ID to filter by
   * @param startTime Start of time range
   * @param endTime End of time range
   * @returns Promise resolving to metrics data array
   */
  static async findByTimeRange(deploymentId: number, startTime: Date, endTime: Date): Promise<MetricsData[]> {
    return this.findAll({
      where: {
        deployment_id: deploymentId,
        created_at: {
          [Op.between]: [startTime, endTime]
        }
      },
      order: [['created_at', 'ASC']]
    });
  }

  /**
   * Get latest metrics for deployment
   * @param deploymentId Deployment ID to get metrics for
   * @param limit Number of latest records to return
   * @returns Promise resolving to latest metrics data
   */
  static async getLatestForDeployment(deploymentId: number, limit: number = 10): Promise<MetricsData[]> {
    return this.findAll({
      where: { deployment_id: deploymentId },
      order: [['created_at', 'DESC']],
      limit
    });
  }

  /**
   * Get average metrics for a deployment
   * @param deploymentId Deployment ID to analyze
   * @param hoursBack Number of hours to look back
   * @returns Promise resolving to average metrics
   */
  static async getAverageMetrics(deploymentId: number, hoursBack: number = 24): Promise<{
    avg_requests: number;
    avg_response_time: number;
    avg_errors: number;
    total_requests: number;
    total_errors: number;
    error_rate: number;
  }> {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('AVG', this.sequelize!.col('requests')), 'avg_requests'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('response_time')), 'avg_response_time'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('errors')), 'avg_errors'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('requests')), 'total_requests'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('errors')), 'total_errors']
      ],
      where: {
        deployment_id: deploymentId,
        created_at: {
          [Op.gte]: cutoffTime
        }
      }
    });

    const result = results[0];
    if (result) {
      const totalRequests = parseInt((result as any).getDataValue('total_requests')) || 0;
      const totalErrors = parseInt((result as any).getDataValue('total_errors')) || 0;
      
      return {
        avg_requests: parseFloat((result as any).getDataValue('avg_requests')) || 0,
        avg_response_time: parseFloat((result as any).getDataValue('avg_response_time')) || 0,
        avg_errors: parseFloat((result as any).getDataValue('avg_errors')) || 0,
        total_requests: totalRequests,
        total_errors: totalErrors,
        error_rate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0
      };
    }

    return {
      avg_requests: 0,
      avg_response_time: 0,
      avg_errors: 0,
      total_requests: 0,
      total_errors: 0,
      error_rate: 0
    };
  }

  /**
   * Get metrics trend for a specific metric
   * @param deploymentId Deployment ID to analyze
   * @param metric Metric to get trend for
   * @param hoursBack Number of hours to look back
   * @returns Promise resolving to trend data
   */
  static async getMetricsTrend(
    deploymentId: number, 
    metric: 'requests' | 'response_time' | 'errors', 
    hoursBack: number = 24
  ): Promise<MetricsData[]> {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    return this.findAll({
      attributes: ['time', metric, 'created_at'],
      where: {
        deployment_id: deploymentId,
        created_at: {
          [Op.gte]: cutoffTime
        }
      },
      order: [['created_at', 'ASC']]
    });
  }

  /**
   * Get top deployments with highest error rates
   * @param limit Maximum number of deployments to return
   * @param hoursBack Number of hours to analyze
   * @returns Promise resolving to top error deployments
   */
  static async getTopErrorDeployments(limit: number = 10, hoursBack: number = 24): Promise<Array<{
    deployment_id: number;
    total_errors: number;
    total_requests: number;
    error_rate: number;
  }>> {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    const results = await this.findAll({
      attributes: [
        'deployment_id',
        [this.sequelize!.fn('SUM', this.sequelize!.col('errors')), 'total_errors'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('requests')), 'total_requests']
      ],
      where: {
        created_at: {
          [Op.gte]: cutoffTime
        }
      },
      group: ['deployment_id'],
      order: [[this.sequelize!.fn('SUM', this.sequelize!.col('errors')), 'DESC']],
      limit
    });

    return results.map(r => {
      const totalRequests = parseInt((r as any).getDataValue('total_requests')) || 0;
      const totalErrors = parseInt((r as any).getDataValue('total_errors')) || 0;
      
      return {
        deployment_id: r.deployment_id,
        total_errors: totalErrors,
        total_requests: totalRequests,
        error_rate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0
      };
    });
  }

  /**
   * Get slowest deployments by response time
   * @param limit Maximum number of deployments to return
   * @param hoursBack Number of hours to analyze
   * @returns Promise resolving to slow deployments
   */
  static async getSlowDeployments(limit: number = 10, hoursBack: number = 24): Promise<Array<{
    deployment_id: number;
    avg_response_time: number;
    data_points: number;
  }>> {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    const results = await this.findAll({
      attributes: [
        'deployment_id',
        [this.sequelize!.fn('AVG', this.sequelize!.col('response_time')), 'avg_response_time'],
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'data_points']
      ],
      where: {
        created_at: {
          [Op.gte]: cutoffTime
        }
      },
      group: ['deployment_id'],
      order: [[this.sequelize!.fn('AVG', this.sequelize!.col('response_time')), 'DESC']],
      limit
    });

    return results.map(r => ({
      deployment_id: r.deployment_id,
      avg_response_time: parseFloat((r as any).getDataValue('avg_response_time')) || 0,
      data_points: parseInt((r as any).getDataValue('data_points')) || 0
    }));
  }

  /**
   * Get system-wide metrics summary
   * @param hoursBack Number of hours to analyze
   * @returns Promise resolving to system metrics
   */
  static async getTotalSystemMetrics(hoursBack: number = 24): Promise<{
    total_requests: number;
    total_errors: number;
    avg_response_time: number;
    active_deployments: number;
    error_rate: number;
  }> {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('SUM', this.sequelize!.col('requests')), 'total_requests'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('errors')), 'total_errors'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('response_time')), 'avg_response_time'],
        [this.sequelize!.fn('COUNT', this.sequelize!.literal('DISTINCT deployment_id')), 'active_deployments']
      ],
      where: {
        created_at: {
          [Op.gte]: cutoffTime
        }
      }
    });

    const result = results[0];
    if (result) {
      const totalRequests = parseInt((result as any).getDataValue('total_requests')) || 0;
      const totalErrors = parseInt((result as any).getDataValue('total_errors')) || 0;
      
      return {
        total_requests: totalRequests,
        total_errors: totalErrors,
        avg_response_time: parseFloat((result as any).getDataValue('avg_response_time')) || 0,
        active_deployments: parseInt((result as any).getDataValue('active_deployments')) || 0,
        error_rate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0
      };
    }

    return {
      total_requests: 0,
      total_errors: 0,
      avg_response_time: 0,
      active_deployments: 0,
      error_rate: 0
    };
  }

  /**
   * Get performance summary for deployment
   * @param deploymentId Deployment ID to analyze
   * @param hoursBack Number of hours to analyze
   * @returns Promise resolving to performance summary
   */
  static async getPerformanceSummary(deploymentId: number, hoursBack: number = 24): Promise<{
    total_data_points: number;
    avg_grade: string;
    high_error_periods: number;
    slow_response_periods: number;
    uptime_percentage: number;
  }> {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    const metrics = await this.findAll({
      where: {
        deployment_id: deploymentId,
        created_at: {
          [Op.gte]: cutoffTime
        }
      },
      order: [['created_at', 'ASC']]
    });

    if (metrics.length === 0) {
      return {
        total_data_points: 0,
        avg_grade: 'N/A',
        high_error_periods: 0,
        slow_response_periods: 0,
        uptime_percentage: 0
      };
    }

    let totalScore = 0;
    let highErrorPeriods = 0;
    let slowResponsePeriods = 0;
    let totalRequests = 0;
    let totalErrors = 0;

    for (const metric of metrics) {
      const grade = metric.getPerformanceGrade();
      const gradeScore = { 'A': 95, 'B': 85, 'C': 75, 'D': 65, 'F': 30 }[grade] || 0;
      totalScore += gradeScore;

      if (metric.isHighErrorPeriod()) highErrorPeriods++;
      if (metric.isSlowResponse()) slowResponsePeriods++;
      
      totalRequests += metric.requests;
      totalErrors += metric.errors;
    }

    const avgScore = totalScore / metrics.length;
    let avgGrade = 'F';
    if (avgScore >= 90) avgGrade = 'A';
    else if (avgScore >= 80) avgGrade = 'B';
    else if (avgScore >= 70) avgGrade = 'C';
    else if (avgScore >= 60) avgGrade = 'D';

    const uptimePercentage = totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : 0;

    return {
      total_data_points: metrics.length,
      avg_grade: avgGrade,
      high_error_periods: highErrorPeriods,
      slow_response_periods: slowResponsePeriods,
      uptime_percentage: uptimePercentage
    };
  }

  /**
   * Create metrics data with validation
   * @param data Metrics data to create
   * @returns Promise resolving to created metrics data
   */
  static async createMetrics(data: MetricsDataCreationAttributes): Promise<MetricsData> {
    // Validate data ranges
    if (data.requests && data.requests < 0) {
      throw new Error('Requests cannot be negative');
    }
    if (data.response_time && data.response_time < 0) {
      throw new Error('Response time cannot be negative');
    }
    if (data.errors && data.errors < 0) {
      throw new Error('Errors cannot be negative');
    }
    if (data.errors && data.requests && data.errors > data.requests) {
      throw new Error('Errors cannot exceed total requests');
    }

    return this.create(data);
  }
}

export default MetricsData;
