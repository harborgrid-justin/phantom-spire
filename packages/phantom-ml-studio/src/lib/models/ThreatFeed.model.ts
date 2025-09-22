/**
 * THREAT FEED SEQUELIZE MODEL
 * Represents external threat intelligence feeds like Anomali's feed management
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
  HasMany,
  Unique,
  DataType
} from 'sequelize-typescript';
import { ThreatIntelligence } from './ThreatIntelligence.model';
import { IOC } from './IOC.model';
import { Op } from 'sequelize';

@Table({
  tableName: 'threat_feeds',
  timestamps: true,
  underscored: true
})
export class ThreatFeed extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(255))
  declare name: string;

  @Column(DataType.TEXT)
  declare description: string;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  declare url: string;

  @AllowNull(false)
  @Default('commercial')
  @Column(DataType.STRING(50))
  declare feed_type: string; // commercial, open_source, government, internal

  @AllowNull(false)
  @Default('json')
  @Column(DataType.STRING(20))
  declare format: string; // json, xml, csv, stix, taxii

  @AllowNull(false)
  @Default('pull')
  @Column(DataType.STRING(20))
  declare delivery_method: string; // pull, push, api, email

  @AllowNull(false)
  @Default('active')
  @Column(DataType.STRING(20))
  declare status: string; // active, inactive, error, suspended

  @AllowNull(false)
  @Default(3600)
  @Column(DataType.INTEGER)
  declare update_frequency: number; // seconds between updates

  @Column(DataType.DATE)
  declare last_update: Date;

  @Column(DataType.DATE)
  declare last_successful_update: Date;

  @Column(DataType.DATE)
  declare next_update: Date;

  @Default(0)
  @Column(DataType.INTEGER)
  declare total_indicators: number;

  @Default(0)
  @Column(DataType.INTEGER)
  declare active_indicators: number;

  @Default(0)
  @Column(DataType.INTEGER)
  declare failed_updates: number;

  @Column(DataType.STRING(255))
  declare vendor: string;

  @Column(DataType.STRING(100))
  declare license_type: string;

  @Column(DataType.DATE)
  declare license_expires: Date;

  @Default('{}')
  @Column(DataType.JSONB)
  declare authentication: Record<string, any>; // API keys, credentials

  @Default('{}')
  @Column(DataType.JSONB)
  declare configuration: Record<string, any>; // Feed-specific settings

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare supported_indicators: string[]; // IP, Domain, Hash, etc.

  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  @Default('medium')
  @Column(DataType.STRING(20))
  declare default_confidence: string;

  @Default('medium')
  @Column(DataType.STRING(20))
  declare default_severity: string;

  @Default('{}')
  @Column(DataType.JSONB)
  declare quality_metrics: Record<string, any>;

  @Default('{}')
  @Column(DataType.JSONB)
  declare error_log: Record<string, any>;

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
  @HasMany(() => ThreatIntelligence)
  declare intelligence_reports: ThreatIntelligence[];

  @HasMany(() => IOC)
  declare indicators: IOC[];

  // Instance methods
  public isActive(): boolean {
    return this.status === 'active';
  }

  public isOverdue(): boolean {
    if (!this.next_update) return false;
    return new Date() > this.next_update;
  }

  public getUpdateHealth(): string {
    if (this.failed_updates === 0) return 'excellent';
    if (this.failed_updates <= 3) return 'good';
    if (this.failed_updates <= 10) return 'fair';
    return 'poor';
  }

  public getQualityScore(): number {
    const metrics = this.quality_metrics;
    if (!metrics || !metrics.accuracy) return 0;
    
    const accuracy = metrics.accuracy || 0;
    const freshness = metrics.freshness || 0;
    const coverage = metrics.coverage || 0;
    
    return Math.round((accuracy + freshness + coverage) / 3);
  }

  public async recordUpdate(success: boolean, indicatorCount?: number) {
    this.last_update = new Date();
    
    if (success) {
      this.last_successful_update = new Date();
      this.failed_updates = 0;
      if (indicatorCount !== undefined) {
        this.total_indicators = indicatorCount;
      }
    } else {
      this.failed_updates += 1;
    }
    
    // Calculate next update
    this.next_update = new Date(Date.now() + this.update_frequency * 1000);
    
    return this.save();
  }

  public async suspend(reason?: string) {
    this.status = 'suspended';
    if (reason && this.error_log) {
      this.error_log.suspension_reason = reason;
      this.error_log.suspended_at = new Date();
    }
    return this.save();
  }

  public async activate() {
    this.status = 'active';
    this.failed_updates = 0;
    return this.save();
  }

  // Static methods
  static async findActive() {
    return this.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']]
    });
  }

  static async findOverdue() {
    return this.findAll({
      where: {
        status: 'active',
        next_update: { [Op.lt]: new Date() }
      },
      order: [['next_update', 'ASC']]
    });
  }

  static async findByType(feedType: string) {
    return this.findAll({
      where: { feed_type: feedType },
      order: [['name', 'ASC']]
    });
  }

  static async findByVendor(vendor: string) {
    return this.findAll({
      where: { vendor },
      order: [['name', 'ASC']]
    });
  }

  static async findHighQuality(threshold: number = 80) {
    const feeds = await this.findAll({
      where: { status: 'active' }
    });
    
    return feeds.filter(feed => feed.getQualityScore() >= threshold);
  }

  static async findProblematic() {
    return this.findAll({
      where: {
        [Op.or]: [
          { failed_updates: { [Op.gte]: 5 } },
          { status: { [Op.in]: ['error', 'suspended'] } }
        ]
      },
      order: [['failed_updates', 'DESC']]
    });
  }

  static async getTypeStats() {
    const results = await this.findAll({
      attributes: [
        'feed_type',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['feed_type']
    });
    
    return results.map(r => ({
      type: r.feed_type,
      count: (r as any).getDataValue('count')
    }));
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

  static async getVendorStats() {
    const results = await this.findAll({
      attributes: [
        'vendor',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['vendor'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      vendor: r.vendor,
      count: (r as any).getDataValue('count')
    }));
  }

  static async getPerformanceStats() {
    const [totalFeeds, activeFeeds, overdueFeeds, problematicFeeds] = await Promise.all([
      this.count(),
      this.count({ where: { status: 'active' } }),
      this.count({ 
        where: { 
          status: 'active',
          next_update: { [Op.lt]: new Date() }
        }
      }),
      this.count({ where: { failed_updates: { [Op.gte]: 5 } } })
    ]);

    const totalIndicators = await this.sum('total_indicators');
    const activeIndicators = await this.sum('active_indicators');

    return {
      total_feeds: totalFeeds,
      active_feeds: activeFeeds,
      overdue_feeds: overdueFeeds,
      problematic_feeds: problematicFeeds,
      total_indicators: totalIndicators || 0,
      active_indicators: activeIndicators || 0
    };
  }
}
