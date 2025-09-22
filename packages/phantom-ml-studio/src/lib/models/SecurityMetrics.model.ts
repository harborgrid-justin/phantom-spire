/**
 * SECURITY METRICS SEQUELIZE MODEL
 * Represents security KPIs and metrics tracking with comprehensive type safety
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
  DataType,
  Index,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';

// SecurityMetrics Attributes Interface
export interface SecurityMetricsAttributes {
  /** Unique identifier for the security metric */
  id: number;
  /** Name of the security metric */
  metric_name: string;
  /** Category of the metric */
  metric_category: 'performance' | 'risk' | 'compliance' | 'operational' | 'financial';
  /** Current value of the metric */
  metric_value: number;
  /** Target value to achieve */
  target_value?: number;
  /** Threshold value for alerting */
  threshold_value?: number;
  /** Unit of measurement */
  metric_unit: 'percentage' | 'count' | 'ratio' | 'time' | 'currency' | 'score';
  /** When this metric was measured */
  measurement_date: Date;
  /** Additional metric details and context */
  metric_details: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// SecurityMetrics Creation Attributes Interface
export interface SecurityMetricsCreationAttributes extends Optional<SecurityMetricsAttributes,
  'id' | 'target_value' | 'threshold_value' | 'metric_details' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'security_metrics',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['metric_name'] },
    { fields: ['metric_category'] },
    { fields: ['measurement_date'] },
    { fields: ['metric_value'] },
    { fields: ['created_at'] }
  ]
})
export class SecurityMetrics extends Model<SecurityMetricsAttributes, SecurityMetricsCreationAttributes> implements SecurityMetricsAttributes {
  /** Unique identifier for the security metric */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Name of the security metric */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare metric_name: string;

  /** Category of the metric */
  @AllowNull(false)
  @Index
  @Column(DataType.ENUM('performance', 'risk', 'compliance', 'operational', 'financial'))
  declare metric_category: 'performance' | 'risk' | 'compliance' | 'operational' | 'financial';

  /** Current value of the metric */
  @AllowNull(false)
  @Column(DataType.DECIMAL(15, 4))
  declare metric_value: number;

  /** Target value to achieve */
  @AllowNull(true)
  @Column(DataType.DECIMAL(15, 4))
  declare target_value?: number;

  /** Threshold value for alerting */
  @AllowNull(true)
  @Column(DataType.DECIMAL(15, 4))
  declare threshold_value?: number;

  /** Unit of measurement */
  @AllowNull(false)
  @Column(DataType.ENUM('percentage', 'count', 'ratio', 'time', 'currency', 'score'))
  declare metric_unit: 'percentage' | 'count' | 'ratio' | 'time' | 'currency' | 'score';

  /** When this metric was measured */
  @AllowNull(false)
  @Index
  @Column(DataType.DATE)
  declare measurement_date: Date;

  /** Additional metric details and context */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare metric_details: Record<string, any>;

  /** Record creation timestamp */
  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  /** Record last update timestamp */
  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Instance methods
  /**
   * Check if metric value is above target
   * @returns True if metric value meets or exceeds target
   */
  public isAboveTarget(): boolean {
    return this.target_value ? this.metric_value >= this.target_value : false;
  }

  /**
   * Check if metric value is above threshold
   * @returns True if metric value meets or exceeds threshold
   */
  public isAboveThreshold(): boolean {
    return this.threshold_value ? this.metric_value >= this.threshold_value : false;
  }

  /**
   * Check if metric value is below threshold (alert condition)
   * @returns True if metric value is below threshold
   */
  public isBelowThreshold(): boolean {
    return this.threshold_value ? this.metric_value < this.threshold_value : false;
  }

  /**
   * Calculate performance percentage against target
   * @returns Performance percentage (0-100+)
   */
  public getPerformancePercent(): number {
    if (!this.target_value || this.target_value === 0) return 0;
    return Math.round((this.metric_value / this.target_value) * 100);
  }

  /**
   * Get variance from target value
   * @returns Difference between metric value and target
   */
  public getVarianceFromTarget(): number | null {
    return this.target_value ? this.metric_value - this.target_value : null;
  }

  /**
   * Get variance percentage from target
   * @returns Percentage variance from target
   */
  public getVariancePercentFromTarget(): number | null {
    if (!this.target_value || this.target_value === 0) return null;
    return Math.round(((this.metric_value - this.target_value) / this.target_value) * 100);
  }

  /**
   * Check if this is a positive metric (higher is better)
   * @returns True if higher values are better based on metric category
   */
  public isPositiveMetric(): boolean {
    const positiveCategories = ['performance', 'compliance'];
    return positiveCategories.includes(this.metric_category);
  }

  /**
   * Get metric status based on target and threshold
   * @returns Status string
   */
  public getStatus(): 'excellent' | 'good' | 'warning' | 'critical' | 'unknown' {
    if (!this.target_value && !this.threshold_value) return 'unknown';
    
    const isPositive = this.isPositiveMetric();
    
    if (this.target_value) {
      if (isPositive) {
        if (this.metric_value >= this.target_value * 1.1) return 'excellent';
        if (this.metric_value >= this.target_value) return 'good';
        if (this.metric_value >= this.target_value * 0.8) return 'warning';
        return 'critical';
      } else {
        if (this.metric_value <= this.target_value * 0.9) return 'excellent';
        if (this.metric_value <= this.target_value) return 'good';
        if (this.metric_value <= this.target_value * 1.2) return 'warning';
        return 'critical';
      }
    }
    
    if (this.threshold_value) {
      return this.isAboveThreshold() ? 'good' : 'critical';
    }
    
    return 'unknown';
  }

  /**
   * Get age of this metric measurement in days
   * @returns Age in days
   */
  public getAge(): number {
    const diffTime = new Date().getTime() - this.measurement_date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if metric data is stale
   * @param days Number of days to consider stale (default: 7)
   * @returns True if metric is older than specified days
   */
  public isStale(days: number = 7): boolean {
    return this.getAge() > days;
  }

  /**
   * Format metric value with appropriate unit
   * @returns Formatted metric value string
   */
  public getFormattedValue(): string {
    const value = this.metric_value;
    
    switch (this.metric_unit) {
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'count':
        return value.toLocaleString();
      case 'ratio':
        return value.toFixed(3);
      case 'time':
        return `${value.toFixed(2)} ms`;
      case 'currency':
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      case 'score':
        return value.toFixed(1);
      default:
        return value.toString();
    }
  }

  // Static methods
  /**
   * Find metrics by category
   * @param category Category to filter by
   * @returns Promise resolving to metrics array
   */
  static async findByCategory(category: SecurityMetricsAttributes['metric_category']): Promise<SecurityMetrics[]> {
    return this.findAll({
      where: { metric_category: category },
      order: [['measurement_date', 'DESC']]
    });
  }

  /**
   * Find metrics by name
   * @param metricName Metric name to search for
   * @returns Promise resolving to metrics array
   */
  static async findByName(metricName: string): Promise<SecurityMetrics[]> {
    return this.findAll({
      where: { metric_name: metricName },
      order: [['measurement_date', 'DESC']]
    });
  }

  /**
   * Find recent metrics within specified days
   * @param days Number of days to look back (default: 30)
   * @returns Promise resolving to recent metrics
   */
  static async findRecent(days: number = 30): Promise<SecurityMetrics[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        measurement_date: { [Op.gte]: cutoffDate }
      },
      order: [['measurement_date', 'DESC']]
    });
  }

  /**
   * Find metrics that are below threshold
   * @returns Promise resolving to underperforming metrics
   */
  static async findBelowThreshold(): Promise<SecurityMetrics[]> {
    return this.findAll({
      where: this.sequelize!.literal('metric_value < threshold_value AND threshold_value IS NOT NULL'),
      order: [['measurement_date', 'DESC']]
    });
  }

  /**
   * Find metrics that are above target
   * @returns Promise resolving to overperforming metrics
   */
  static async findAboveTarget(): Promise<SecurityMetrics[]> {
    return this.findAll({
      where: this.sequelize!.literal('metric_value >= target_value AND target_value IS NOT NULL'),
      order: [['measurement_date', 'DESC']]
    });
  }

  /**
   * Find metrics by date range
   * @param startDate Start date for range
   * @param endDate End date for range
   * @returns Promise resolving to metrics in date range
   */
  static async findByDateRange(startDate: Date, endDate: Date): Promise<SecurityMetrics[]> {
    return this.findAll({
      where: {
        measurement_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['measurement_date', 'ASC']]
    });
  }

  /**
   * Find stale metrics (measurements older than specified days)
   * @param days Number of days to consider stale (default: 7)
   * @returns Promise resolving to stale metrics
   */
  static async findStale(days: number = 7): Promise<SecurityMetrics[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        measurement_date: { [Op.lt]: cutoffDate }
      },
      order: [['measurement_date', 'ASC']]
    });
  }

  /**
   * Get latest metrics for each unique metric name
   * @returns Promise resolving to latest metrics by name
   */
  static async getLatestByName(): Promise<SecurityMetrics[]> {
    const results = await this.findAll({
      attributes: [
        '*',
        [this.sequelize!.fn('ROW_NUMBER'), 'row_num']
      ],
      order: [['metric_name', 'ASC'], ['measurement_date', 'DESC']]
    });
    
    // Filter to keep only the latest metric for each name
    const latestMetrics = new Map();
    results.forEach(metric => {
      if (!latestMetrics.has(metric.metric_name)) {
        latestMetrics.set(metric.metric_name, metric);
      }
    });
    
    return Array.from(latestMetrics.values());
  }

  /**
   * Get category distribution statistics
   * @returns Promise resolving to category statistics
   */
  static async getCategoryStats(): Promise<Array<{ category: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'metric_category',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['metric_category']
    });
    
    return results.map(r => ({
      category: r.metric_category,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get unit distribution statistics
   * @returns Promise resolving to unit statistics
   */
  static async getUnitStats(): Promise<Array<{ unit: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'metric_unit',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['metric_unit']
    });
    
    return results.map(r => ({
      unit: r.metric_unit,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get metric trend data over time
   * @param metricName Name of the metric to analyze
   * @param days Number of days to analyze (default: 30)
   * @returns Promise resolving to trend data
   */
  static async getMetricTrend(metricName: string, days: number = 30): Promise<Array<{
    date: string;
    value: number;
  }>> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('DATE', this.sequelize!.col('measurement_date')), 'date'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('metric_value')), 'avg_value']
      ],
      where: {
        metric_name: metricName,
        measurement_date: { [Op.gte]: cutoffDate }
      },
      group: [this.sequelize!.fn('DATE', this.sequelize!.col('measurement_date'))],
      order: [[this.sequelize!.fn('DATE', this.sequelize!.col('measurement_date')), 'ASC']]
    });
    
    return results.map(r => ({
      date: (r as any).getDataValue('date'),
      value: parseFloat((r as any).getDataValue('avg_value'))
    }));
  }

  /**
   * Get performance summary by category
   * @returns Promise resolving to performance summary
   */
  static async getPerformanceSummary(): Promise<Array<{
    category: string;
    total_metrics: number;
    above_target: number;
    below_threshold: number;
    avg_performance: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'metric_category',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'total_metrics'],
        [this.sequelize!.fn('SUM', 
          this.sequelize!.literal('CASE WHEN metric_value >= target_value THEN 1 ELSE 0 END')
        ), 'above_target'],
        [this.sequelize!.fn('SUM', 
          this.sequelize!.literal('CASE WHEN metric_value < threshold_value THEN 1 ELSE 0 END')
        ), 'below_threshold'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('metric_value')), 'avg_performance']
      ],
      group: ['metric_category']
    });
    
    return results.map(r => ({
      category: r.metric_category,
      total_metrics: parseInt((r as any).getDataValue('total_metrics')),
      above_target: parseInt((r as any).getDataValue('above_target')) || 0,
      below_threshold: parseInt((r as any).getDataValue('below_threshold')) || 0,
      avg_performance: parseFloat((r as any).getDataValue('avg_performance')) || 0
    }));
  }

  /**
   * Create security metric with validation
   * @param data Metric data to create
   * @returns Promise resolving to created metric
   */
  static async createMetric(data: SecurityMetricsCreationAttributes): Promise<SecurityMetrics> {
    // Validate metric value based on unit
    if (data.metric_unit === 'percentage' && (data.metric_value < 0 || data.metric_value > 100)) {
      throw new Error('Percentage values must be between 0 and 100');
    }

    if (data.metric_unit === 'count' && data.metric_value < 0) {
      throw new Error('Count values cannot be negative');
    }

    // Set measurement date if not provided
    if (!data.measurement_date) {
      data.measurement_date = new Date();
    }

    return this.create(data);
  }

  /**
   * Bulk create metrics for dashboard updates
   * @param metricsData Array of metric data
   * @returns Promise resolving to created metrics
   */
  static async bulkCreateMetrics(metricsData: SecurityMetricsCreationAttributes[]): Promise<SecurityMetrics[]> {
    // Validate all metrics before creating
    for (const data of metricsData) {
      if (data.metric_unit === 'percentage' && (data.metric_value < 0 || data.metric_value > 100)) {
        throw new Error(`Invalid percentage value for ${data.metric_name}: ${data.metric_value}`);
      }
    }

    return this.bulkCreate(metricsData);
  }
}

export default SecurityMetrics;
