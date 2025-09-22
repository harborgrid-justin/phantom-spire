/**
 * THREAT TREND SEQUELIZE MODEL
 * Represents threat trends and analytics with comprehensive type safety
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
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';

// ThreatTrend Attributes Interface
export interface ThreatTrendAttributes {
  /** Unique identifier for the threat trend */
  id: number;
  /** Name of the trend */
  trend_name: string;
  /** Type of threat this trend represents */
  threat_type: string;
  /** Current status of the trend */
  status: string;
  /** When the trend started */
  trend_start: Date;
  /** When the trend ended (if applicable) */
  trend_end: Date | null;
  /** Number of incidents associated with this trend */
  incident_count: number;
  /** Trend analysis data */
  trend_data: Record<string, any>;
  /** Predictive analytics data */
  predictions: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// ThreatTrend Creation Attributes Interface
export interface ThreatTrendCreationAttributes extends Optional<ThreatTrendAttributes,
  'id' | 'status' | 'trend_end' | 'incident_count' | 'trend_data' | 
  'predictions' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'threat_trends',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['trend_name'] },
    { fields: ['threat_type'] },
    { fields: ['status'] },
    { fields: ['trend_start'] },
    { fields: ['trend_end'] },
    { fields: ['incident_count'] },
    { fields: ['created_at'] }
  ]
})
export class ThreatTrend extends Model<ThreatTrendAttributes, ThreatTrendCreationAttributes> implements ThreatTrendAttributes {
  /** Unique identifier for the threat trend */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Name of the trend */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare trend_name: string;

  /** Type of threat this trend represents */
  @AllowNull(false)
  @Length({ min: 1, max: 50 })
  @Column(DataType.STRING(50))
  declare threat_type: string;

  /** Current status of the trend */
  @AllowNull(false)
  @Default('active')
  @Column(DataType.ENUM('active', 'inactive', 'emerging', 'declining', 'ended'))
  declare status: string;

  /** When the trend started */
  @AllowNull(false)
  @Column(DataType.DATE)
  declare trend_start: Date;

  /** When the trend ended (if applicable) */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare trend_end: Date | null;

  /** Number of incidents associated with this trend */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare incident_count: number;

  /** Trend analysis data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare trend_data: Record<string, any>;

  /** Predictive analytics data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare predictions: Record<string, any>;

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
   * Check if trend is currently active
   * @returns True if status is active
   */
  public isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Check if trend is emerging
   * @returns True if status is emerging
   */
  public isEmerging(): boolean {
    return this.status === 'emerging';
  }

  /**
   * Check if trend is declining
   * @returns True if status is declining
   */
  public isDeclining(): boolean {
    return this.status === 'declining';
  }

  /**
   * Check if trend has ended
   * @returns True if status is ended or has end date
   */
  public hasEnded(): boolean {
    return this.status === 'ended' || (this.trend_end !== null && this.trend_end <= new Date());
  }

  /**
   * Get trend duration in days
   * @returns Number of days the trend has been active
   */
  public getTrendDurationDays(): number {
    const endDate = this.trend_end || new Date();
    const diffTime = endDate.getTime() - this.trend_start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get trend intensity (incidents per day)
   * @returns Average incidents per day
   */
  public getTrendIntensity(): number {
    const durationDays = this.getTrendDurationDays();
    return durationDays > 0 ? this.incident_count / durationDays : 0;
  }

  /**
   * Check if trend is high volume (above threshold)
   * @param threshold Minimum incidents to be considered high volume
   * @returns True if above threshold
   */
  public isHighVolume(threshold: number = 100): boolean {
    return this.incident_count >= threshold;
  }

  /**
   * Check if trend is long-running (above duration threshold)
   * @param thresholdDays Minimum days to be considered long-running
   * @returns True if above threshold
   */
  public isLongRunning(thresholdDays: number = 30): boolean {
    return this.getTrendDurationDays() >= thresholdDays;
  }

  /**
   * Get trend severity level based on intensity and volume
   * @returns Severity level (low, medium, high, critical)
   */
  public getSeverityLevel(): 'low' | 'medium' | 'high' | 'critical' {
    const intensity = this.getTrendIntensity();
    const volume = this.incident_count;
    
    if (intensity >= 50 || volume >= 1000) return 'critical';
    if (intensity >= 20 || volume >= 500) return 'high';
    if (intensity >= 5 || volume >= 100) return 'medium';
    return 'low';
  }

  /**
   * Get trend growth rate (if trend data contains historical points)
   * @returns Growth rate percentage or null if insufficient data
   */
  public getGrowthRate(): number | null {
    if (!this.trend_data['historical_points'] || !Array.isArray(this.trend_data['historical_points'])) {
      return null;
    }
    
    const points = this.trend_data['historical_points'];
    if (points.length < 2) return null;
    
    const firstValue = points[0].value || 0;
    const lastValue = points[points.length - 1].value || 0;
    
    if (firstValue === 0) return null;
    
    return ((lastValue - firstValue) / firstValue) * 100;
  }

  /**
   * Check if trend is accelerating
   * @returns True if growth rate is positive and above 10%
   */
  public isAccelerating(): boolean {
    const growthRate = this.getGrowthRate();
    return growthRate !== null && growthRate > 10;
  }

  /**
   * Get predicted future incidents based on trend data
   * @param days Number of days to predict ahead
   * @returns Predicted incident count or null if no prediction data
   */
  public getPredictedIncidents(days: number = 7): number | null {
    if (!this.predictions['daily_prediction'] || !this.predictions['confidence']) {
      return null;
    }
    
    const dailyRate = this.predictions['daily_prediction'];
    const confidence = this.predictions['confidence'];
    
    // Only return predictions if confidence is above 60%
    if (confidence < 0.6) return null;
    
    return Math.round(dailyRate * days);
  }

  /**
   * Get trend confidence score
   * @returns Confidence score (0-100) or null if no data
   */
  public getConfidenceScore(): number | null {
    if (!this.predictions['confidence']) return null;
    return Math.round(this.predictions['confidence'] * 100);
  }

  /**
   * Increment incident count for this trend
   * @param count Number of incidents to add (default: 1)
   * @returns Promise resolving to updated trend
   */
  public async incrementIncidentCount(count: number = 1): Promise<this> {
    this.incident_count += count;
    return this.save();
  }

  /**
   * Update trend status
   * @param newStatus New status for the trend
   * @returns Promise resolving to updated trend
   */
  public async updateStatus(newStatus: ThreatTrendAttributes['status']): Promise<this> {
    this.status = newStatus;
    
    // Set end date if status is ended
    if (newStatus === 'ended' && !this.trend_end) {
      this.trend_end = new Date();
    }
    
    return this.save();
  }

  /**
   * End the trend
   * @param endDate Optional end date (defaults to now)
   * @returns Promise resolving to updated trend
   */
  public async endTrend(endDate?: Date): Promise<this> {
    this.status = 'ended';
    this.trend_end = endDate || new Date();
    return this.save();
  }

  /**
   * Update trend analysis data
   * @param newData Data to merge with existing trend data
   * @returns Promise resolving to updated trend
   */
  public async updateTrendData(newData: Record<string, any>): Promise<this> {
    this.trend_data = { ...this.trend_data, ...newData };
    return this.save();
  }

  /**
   * Update predictions data
   * @param newPredictions Predictions data to merge
   * @returns Promise resolving to updated trend
   */
  public async updatePredictions(newPredictions: Record<string, any>): Promise<this> {
    this.predictions = { ...this.predictions, ...newPredictions };
    return this.save();
  }

  /**
   * Add historical data point
   * @param timestamp Data point timestamp
   * @param value Data point value
   * @param metadata Additional metadata for the data point
   * @returns Promise resolving to updated trend
   */
  public async addHistoricalPoint(timestamp: Date, value: number, metadata?: Record<string, any>): Promise<this> {
    if (!this.trend_data['historical_points']) {
      this.trend_data['historical_points'] = [];
    }
    
    this.trend_data['historical_points'].push({
      timestamp,
      value,
      metadata: metadata || {}
    });
    
    // Sort by timestamp
    this.trend_data['historical_points'].sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return this.save();
  }

  /**
   * Get related threat types based on trend data
   * @returns Array of related threat types or empty array
   */
  public getRelatedThreatTypes(): string[] {
    if (!this.trend_data['related_types'] || !Array.isArray(this.trend_data['related_types'])) {
      return [];
    }
    return this.trend_data['related_types'];
  }

  /**
   * Add related threat type
   * @param threatType Threat type to add as related
   * @returns Promise resolving to updated trend
   */
  public async addRelatedThreatType(threatType: string): Promise<this> {
    const relatedTypes = this.getRelatedThreatTypes();
    if (!relatedTypes.includes(threatType)) {
      this.trend_data = {
        ...this.trend_data,
        related_types: [...relatedTypes, threatType]
      };
      return this.save();
    }
    return this;
  }

  /**
   * Get trend summary for reporting
   * @returns Comprehensive trend summary
   */
  public getTrendSummary(): {
    id: number;
    name: string;
    type: string;
    status: string;
    duration_days: number;
    incident_count: number;
    intensity: number;
    severity: string;
    growth_rate: number | null;
    confidence: number | null;
    is_active: boolean;
    is_accelerating: boolean;
    is_high_volume: boolean;
    is_long_running: boolean;
  } {
    return {
      id: this.id,
      name: this.trend_name,
      type: this.threat_type,
      status: this.status,
      duration_days: this.getTrendDurationDays(),
      incident_count: this.incident_count,
      intensity: this.getTrendIntensity(),
      severity: this.getSeverityLevel(),
      growth_rate: this.getGrowthRate(),
      confidence: this.getConfidenceScore(),
      is_active: this.isActive(),
      is_accelerating: this.isAccelerating(),
      is_high_volume: this.isHighVolume(),
      is_long_running: this.isLongRunning()
    };
  }

  // Static methods
  /**
   * Find trends by type
   * @param threatType Type to filter by
   * @returns Promise resolving to trends array
   */
  static async findByType(threatType: string): Promise<ThreatTrend[]> {
    return this.findAll({
      where: { threat_type: threatType },
      order: [['incident_count', 'DESC']]
    });
  }

  /**
   * Find active trends
   * @returns Promise resolving to active trends
   */
  static async findActive(): Promise<ThreatTrend[]> {
    return this.findAll({
      where: { status: 'active' },
      order: [['trend_start', 'DESC']]
    });
  }

  /**
   * Find trends by status
   * @param status Status to filter by
   * @returns Promise resolving to trends array
   */
  static async findByStatus(status: ThreatTrendAttributes['status']): Promise<ThreatTrend[]> {
    return this.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find emerging trends
   * @returns Promise resolving to emerging trends
   */
  static async findEmerging(): Promise<ThreatTrend[]> {
    return this.findAll({
      where: { status: 'emerging' },
      order: [['trend_start', 'DESC']]
    });
  }

  /**
   * Find declining trends
   * @returns Promise resolving to declining trends
   */
  static async findDeclining(): Promise<ThreatTrend[]> {
    return this.findAll({
      where: { status: 'declining' },
      order: [['incident_count', 'DESC']]
    });
  }

  /**
   * Find high-volume trends
   * @param threshold Minimum incident count threshold
   * @returns Promise resolving to high-volume trends
   */
  static async findHighVolume(threshold: number = 100): Promise<ThreatTrend[]> {
    return this.findAll({
      where: {
        incident_count: {
          [Op.gte]: threshold
        }
      },
      order: [['incident_count', 'DESC']]
    });
  }

  /**
   * Find long-running trends
   * @param thresholdDays Minimum duration in days
   * @returns Promise resolving to long-running trends
   */
  static async findLongRunning(thresholdDays: number = 30): Promise<ThreatTrend[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);
    
    return this.findAll({
      where: {
        trend_start: {
          [Op.lte]: cutoffDate
        },
        [Op.or]: [
          { trend_end: null },
          { trend_end: { [Op.gt]: new Date() } }
        ]
      },
      order: [['trend_start', 'ASC']]
    });
  }

  /**
   * Find recent trends
   * @param days Number of days to look back
   * @returns Promise resolving to recent trends
   */
  static async findRecent(days: number = 30): Promise<ThreatTrend[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        trend_start: {
          [Op.gte]: cutoffDate
        }
      },
      order: [['trend_start', 'DESC']]
    });
  }

  /**
   * Find trends by date range
   * @param startDate Start of date range
   * @param endDate End of date range
   * @returns Promise resolving to trends in range
   */
  static async findByDateRange(startDate: Date, endDate: Date): Promise<ThreatTrend[]> {
    return this.findAll({
      where: {
        trend_start: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['trend_start', 'ASC']]
    });
  }

  /**
   * Find trends with high confidence predictions
   * @param minConfidence Minimum confidence threshold (0-1)
   * @returns Promise resolving to high-confidence trends
   */
  static async findHighConfidence(minConfidence: number = 0.8): Promise<ThreatTrend[]> {
    return this.findAll({
      where: this.sequelize!.literal(`predictions->>'confidence' IS NOT NULL AND CAST(predictions->>'confidence' AS FLOAT) >= ${minConfidence}`),
      order: [['incident_count', 'DESC']]
    });
  }

  /**
   * Get top trends by incident count
   * @param limit Maximum number of trends to return
   * @returns Promise resolving to top trends
   */
  static async getTopTrends(limit: number = 10): Promise<ThreatTrend[]> {
    return this.findAll({
      order: [['incident_count', 'DESC']],
      limit
    });
  }

  /**
   * Get trends statistics by status
   * @returns Promise resolving to status statistics
   */
  static async getStatusStats(): Promise<Array<{ status: string; count: number; total_incidents: number }>> {
    const results = await this.findAll({
      attributes: [
        'status',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('incident_count')), 'total_incidents']
      ],
      group: ['status']
    });
    
    return results.map(r => ({
      status: r.status,
      count: parseInt((r as any).getDataValue('count')),
      total_incidents: parseInt((r as any).getDataValue('total_incidents')) || 0
    }));
  }

  /**
   * Get trends statistics by type
   * @returns Promise resolving to type statistics
   */
  static async getTypeStats(): Promise<Array<{ 
    threat_type: string; 
    count: number; 
    total_incidents: number;
    avg_duration: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'threat_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('incident_count')), 'total_incidents'],
        [this.sequelize!.fn('AVG', 
          this.sequelize!.literal(`EXTRACT(DAY FROM (COALESCE(trend_end, NOW()) - trend_start))`)), 'avg_duration']
      ],
      group: ['threat_type']
    });
    
    return results.map(r => ({
      threat_type: r.threat_type,
      count: parseInt((r as any).getDataValue('count')),
      total_incidents: parseInt((r as any).getDataValue('total_incidents')) || 0,
      avg_duration: parseFloat((r as any).getDataValue('avg_duration')) || 0
    }));
  }

  /**
   * Get overall trends summary
   * @returns Promise resolving to comprehensive summary
   */
  static async getOverallSummary(): Promise<{
    total_trends: number;
    active_trends: number;
    emerging_trends: number;
    declining_trends: number;
    ended_trends: number;
    total_incidents: number;
    avg_trend_duration: number;
    high_volume_trends: number;
    long_running_trends: number;
    trends_this_month: number;
  }> {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [
      totalTrends,
      activeTrends,
      emergingTrends,
      decliningTrends,
      endedTrends,
      highVolumeTrends,
      longRunningTrends,
      trendsThisMonth
    ] = await Promise.all([
      this.count(),
      this.count({ where: { status: 'active' } }),
      this.count({ where: { status: 'emerging' } }),
      this.count({ where: { status: 'declining' } }),
      this.count({ where: { status: 'ended' } }),
      this.count({ where: { incident_count: { [Op.gte]: 100 } } }),
      this.count({ 
        where: { 
          trend_start: { [Op.lte]: thirtyDaysAgo },
          [Op.or]: [
            { trend_end: null },
            { trend_end: { [Op.gt]: new Date() } }
          ]
        }
      }),
      this.count({ where: { created_at: { [Op.gte]: thisMonth } } })
    ]);

    // Get total incidents and average duration
    const aggregateResults = await this.findAll({
      attributes: [
        [this.sequelize!.fn('SUM', this.sequelize!.col('incident_count')), 'total_incidents'],
        [this.sequelize!.fn('AVG', 
          this.sequelize!.literal(`EXTRACT(DAY FROM (COALESCE(trend_end, NOW()) - trend_start))`)), 'avg_duration']
      ]
    });

    const result = aggregateResults[0];
    
    return {
      total_trends: totalTrends,
      active_trends: activeTrends,
      emerging_trends: emergingTrends,
      declining_trends: decliningTrends,
      ended_trends: endedTrends,
      total_incidents: result ? parseInt((result as any).getDataValue('total_incidents')) || 0 : 0,
      avg_trend_duration: result ? parseFloat((result as any).getDataValue('avg_duration')) || 0 : 0,
      high_volume_trends: highVolumeTrends,
      long_running_trends: longRunningTrends,
      trends_this_month: trendsThisMonth
    };
  }

  /**
   * Get trends with predictions
   * @returns Promise resolving to trends that have prediction data
   */
  static async getTrendsWithPredictions(): Promise<ThreatTrend[]> {
    return this.findAll({
      where: this.sequelize!.literal(`predictions IS NOT NULL AND predictions != '{}'`),
      order: [['incident_count', 'DESC']]
    });
  }

  /**
   * Get accelerating trends (with positive growth rate)
   * @returns Promise resolving to accelerating trends
   */
  static async getAcceleratingTrends(): Promise<ThreatTrend[]> {
    const trends = await this.getTrendsWithPredictions();
    return trends.filter(trend => trend.isAccelerating());
  }

  /**
   * Get trends by severity level
   * @param severity Severity level to filter by
   * @returns Promise resolving to trends with specified severity
   */
  static async getTrendsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): Promise<ThreatTrend[]> {
    const allTrends = await this.findAll({
      order: [['incident_count', 'DESC']]
    });
    
    return allTrends.filter(trend => trend.getSeverityLevel() === severity);
  }

  /**
   * Search trends by name or type
   * @param searchTerm Search term to match against name or type
   * @returns Promise resolving to matching trends
   */
  static async searchTrends(searchTerm: string): Promise<ThreatTrend[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { trend_name: { [Op.iLike]: `%${searchTerm}%` } },
          { threat_type: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      order: [['incident_count', 'DESC']]
    });
  }

  /**
   * Get correlation between trends
   * @param trendId1 First trend ID
   * @param trendId2 Second trend ID
   * @returns Promise resolving to correlation data or null
   */
  static async getTrendCorrelation(trendId1: number, trendId2: number): Promise<{
    correlation_score: number;
    temporal_overlap: boolean;
    related_indicators: string[];
  } | null> {
    const [trend1, trend2] = await Promise.all([
      this.findByPk(trendId1),
      this.findByPk(trendId2)
    ]);

    if (!trend1 || !trend2) return null;

    // Simple temporal overlap check
    const trend1End = trend1.trend_end || new Date();
    const trend2End = trend2.trend_end || new Date();
    
    const temporalOverlap = (
      trend1.trend_start <= trend2End && trend2.trend_start <= trend1End
    );

    // Basic correlation based on incident patterns
    const incidentRatio = Math.min(trend1.incident_count, trend2.incident_count) / 
                         Math.max(trend1.incident_count, trend2.incident_count);
    
    return {
      correlation_score: incidentRatio,
      temporal_overlap: temporalOverlap,
      related_indicators: [
        ...(trend1.getRelatedThreatTypes()),
        ...(trend2.getRelatedThreatTypes())
      ].filter((type, index, arr) => arr.indexOf(type) !== index) // Find duplicates
    };
  }

  /**
   * Create threat trend with validation
   * @param data Trend data to create
   * @returns Promise resolving to created trend
   */
  static async createTrend(data: ThreatTrendCreationAttributes): Promise<ThreatTrend> {
    // Validate required fields
    if (!data.trend_name || !data.threat_type || !data.trend_start) {
      throw new Error('Trend name, threat type, and start date are required');
    }

    // Validate status
    const validStatuses = ['active', 'inactive', 'emerging', 'declining', 'ended'];
    if (data.status && !validStatuses.includes(data.status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate date logic
    if (data.trend_end && data.trend_start && data.trend_end <= data.trend_start) {
      throw new Error('Trend end date must be after start date');
    }

    // Validate incident count
    if (data.incident_count && data.incident_count < 0) {
      throw new Error('Incident count cannot be negative');
    }

    return this.create(data);
  }

  /**
   * Bulk update trend statuses based on criteria
   * @param criteria Update criteria
   * @returns Promise resolving to number of updated trends
   */
  static async bulkUpdateStatus(criteria: {
    from_status?: string;
    to_status: string;
    older_than_days?: number;
    incident_threshold?: number;
  }): Promise<number> {
    const whereClause: any = {};
    
    if (criteria.from_status) {
      whereClause.status = criteria.from_status;
    }
    
    if (criteria.older_than_days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - criteria.older_than_days);
      whereClause.trend_start = { [Op.lte]: cutoffDate };
    }
    
    if (criteria.incident_threshold) {
      whereClause.incident_count = { [Op.lte]: criteria.incident_threshold };
    }

    const [updatedCount] = await this.update(
      { 
        status: criteria.to_status,
        trend_end: criteria.to_status === 'ended' ? new Date() : null
      },
      { where: whereClause }
    );

    return updatedCount;
  }
}

export default ThreatTrend;
