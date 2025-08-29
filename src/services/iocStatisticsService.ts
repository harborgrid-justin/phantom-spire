import { IOC } from '../models/IOC';
import { logger } from '../utils/logger';

export interface IOCStatistics {
  overview: {
    total: number;
    active: number;
    inactive: number;
    lastUpdated: Date;
  };
  distribution: {
    byType: Array<{ type: string; count: number; percentage: number }>;
    bySeverity: Array<{ severity: string; count: number; percentage: number }>;
    byConfidence: Array<{ range: string; count: number; percentage: number }>;
    bySource: Array<{ source: string; count: number; percentage: number }>;
  };
  temporal: {
    creationTrend: Array<{ date: string; count: number }>;
    activityTrend: Array<{ date: string; active: number; inactive: number }>;
    ageDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
  };
  quality: {
    averageConfidence: number;
    highConfidenceCount: number;
    lowConfidenceCount: number;
    missingDescriptions: number;
    emptyTags: number;
  };
  risk: {
    criticalCount: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    riskTrend: Array<{
      date: string;
      critical: number;
      high: number;
      medium: number;
      low: number;
    }>;
  };
  tags: {
    mostUsedTags: Array<{ tag: string; count: number; percentage: number }>;
    tagDistribution: Array<{ tagCount: number; iocCount: number }>;
  };
  performance: {
    processingTime: number;
    cacheHitRate?: number;
    dataFreshness: Date;
  };
}

export interface IOCTrendAnalysis {
  period: string;
  data: Array<{
    date: string;
    newIOCs: number;
    updatedIOCs: number;
    deactivatedIOCs: number;
    totalActive: number;
  }>;
  insights: string[];
  predictions?: {
    nextPeriodForecast: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
  };
}

export interface IOCQualityReport {
  overallScore: number;
  issues: Array<{
    type: 'warning' | 'error' | 'info';
    description: string;
    count: number;
    affectedIOCs: string[];
    recommendation: string;
  }>;
  improvements: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: string;
  }>;
}

/**
 * IOC Statistics and Analytics Service - Business intelligence for IOC data
 */
export class IOCStatisticsService {
  private static cache: Map<string, { data: any; expiry: Date }> = new Map();
  private static readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Generate comprehensive IOC statistics
   */
  static async generateStatistics(
    dateRange?: { start: Date; end: Date },
    useCache: boolean = true
  ): Promise<IOCStatistics> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey('stats', dateRange);

    // Check cache first
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (cached.expiry > new Date()) {
        logger.info('Returning cached IOC statistics');
        return cached.data;
      }
    }

    try {
      const filter = this.buildDateFilter(dateRange);

      // Run all statistics queries in parallel
      const [
        overview,
        typeDistribution,
        severityDistribution,
        confidenceDistribution,
        sourceDistribution,
        creationTrend,
        activityTrend,
        ageDistribution,
        qualityMetrics,
        tagAnalysis,
      ] = await Promise.all([
        this.getOverviewStats(filter),
        this.getTypeDistribution(filter),
        this.getSeverityDistribution(filter),
        this.getConfidenceDistribution(filter),
        this.getSourceDistribution(filter),
        this.getCreationTrend(filter),
        this.getActivityTrend(filter),
        this.getAgeDistribution(filter),
        this.getQualityMetrics(filter),
        this.getTagAnalysis(filter),
      ]);

      // Calculate risk distribution
      const riskDistribution = await this.getRiskDistribution(filter);
      const riskTrend = await this.getRiskTrend(filter);

      const statistics: IOCStatistics = {
        overview,
        distribution: {
          byType: typeDistribution,
          bySeverity: severityDistribution,
          byConfidence: confidenceDistribution,
          bySource: sourceDistribution,
        },
        temporal: {
          creationTrend,
          activityTrend,
          ageDistribution,
        },
        quality: qualityMetrics,
        risk: {
          ...riskDistribution,
          riskTrend,
        },
        tags: tagAnalysis,
        performance: {
          processingTime: Date.now() - startTime,
          dataFreshness: new Date(),
        },
      };

      // Cache the results
      if (useCache) {
        this.cache.set(cacheKey, {
          data: statistics,
          expiry: new Date(Date.now() + this.CACHE_TTL),
        });
      }

      logger.info('IOC statistics generated', {
        processingTime: statistics.performance.processingTime,
        totalIOCs: statistics.overview.total,
      });

      return statistics;
    } catch (error) {
      logger.error('Error generating IOC statistics', error);
      throw error;
    }
  }

  /**
   * Generate trend analysis for IOCs over time
   */
  static async generateTrendAnalysis(
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    days: number = 30
  ): Promise<IOCTrendAnalysis> {
    try {
      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - days * 24 * 60 * 60 * 1000
      );

      // Determine grouping format based on period
      let dateFormat: string;
      switch (period) {
        case 'monthly':
          dateFormat = '%Y-%m';
          break;
        case 'weekly':
          dateFormat = '%Y-%U';
          break;
        default:
          dateFormat = '%Y-%m-%d';
          break;
      }

      // Aggregate data by period
      const trendData = await IOC.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: dateFormat, date: '$createdAt' },
              },
            },
            newIOCs: { $sum: 1 },
            totalActive: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
            },
          },
        },
        { $sort: { '_id.date': 1 } },
      ]);

      // Calculate insights
      const insights = this.generateTrendInsights(trendData);

      // Generate predictions
      const predictions = this.generateTrendPredictions(trendData);

      const analysis: IOCTrendAnalysis = {
        period,
        data: trendData.map(item => ({
          date: item._id.date,
          newIOCs: item.newIOCs,
          updatedIOCs: 0, // Would need to track updates separately
          deactivatedIOCs: 0, // Would need to track deactivations
          totalActive: item.totalActive,
        })),
        insights,
        predictions,
      };

      logger.info(`Trend analysis generated for ${period} period`, {
        dataPoints: analysis.data.length,
        insightCount: insights.length,
      });

      return analysis;
    } catch (error) {
      logger.error('Error generating trend analysis', error);
      throw error;
    }
  }

  /**
   * Generate IOC quality report
   */
  static async generateQualityReport(): Promise<IOCQualityReport> {
    try {
      const issues: IOCQualityReport['issues'] = [];
      const improvements: IOCQualityReport['improvements'] = [];

      // Check for IOCs with low confidence
      const lowConfidenceIOCs = await IOC.find(
        { confidence: { $lt: 50 } },
        { _id: 1, value: 1, confidence: 1 }
      ).limit(100);

      if (lowConfidenceIOCs.length > 0) {
        issues.push({
          type: 'warning',
          description: 'IOCs with low confidence scores',
          count: lowConfidenceIOCs.length,
          affectedIOCs: lowConfidenceIOCs.map(ioc => ioc.value),
          recommendation:
            'Review and validate these IOCs or update confidence scores',
        });
      }

      // Check for IOCs without descriptions
      const noDescriptionCount = await IOC.countDocuments({
        $or: [{ description: { $exists: false } }, { description: '' }],
      });

      if (noDescriptionCount > 0) {
        issues.push({
          type: 'info',
          description: 'IOCs without descriptions',
          count: noDescriptionCount,
          affectedIOCs: [],
          recommendation: 'Add descriptions to provide context for analysts',
        });
      }

      // Check for IOCs without tags
      const noTagsCount = await IOC.countDocuments({
        $or: [{ tags: { $exists: false } }, { tags: { $size: 0 } }],
      });

      if (noTagsCount > 0) {
        issues.push({
          type: 'info',
          description: 'IOCs without tags',
          count: noTagsCount,
          affectedIOCs: [],
          recommendation:
            'Add relevant tags for better categorization and searching',
        });
      }

      // Check for very old active IOCs
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const oldActiveIOCs = await IOC.find(
        {
          isActive: true,
          lastSeen: { $lt: oneYearAgo },
        },
        { _id: 1, value: 1, lastSeen: 1 }
      ).limit(50);

      if (oldActiveIOCs.length > 0) {
        issues.push({
          type: 'warning',
          description: 'Active IOCs not seen in over a year',
          count: oldActiveIOCs.length,
          affectedIOCs: oldActiveIOCs.map(ioc => ioc.value),
          recommendation:
            'Review these IOCs and consider deactivating outdated ones',
        });
      }

      // Check for duplicate IOCs
      const duplicates = await IOC.aggregate([
        {
          $group: {
            _id: { value: '$value', type: '$type' },
            count: { $sum: 1 },
            ids: { $push: '$_id' },
          },
        },
        { $match: { count: { $gt: 1 } } },
        { $limit: 50 },
      ]);

      if (duplicates.length > 0) {
        issues.push({
          type: 'error',
          description: 'Duplicate IOCs detected',
          count: duplicates.length,
          affectedIOCs: duplicates.map(dup => dup._id.value),
          recommendation:
            'Merge or remove duplicate IOCs to maintain data integrity',
        });
      }

      // Generate improvement recommendations
      improvements.push({
        action:
          'Implement automated confidence scoring based on source reliability',
        priority: 'high',
        estimatedImpact: 'Improved accuracy and reduced false positives',
      });

      improvements.push({
        action: 'Set up automated tagging based on IOC characteristics',
        priority: 'medium',
        estimatedImpact: 'Better categorization and faster searching',
      });

      improvements.push({
        action: 'Implement IOC aging and automatic deactivation',
        priority: 'medium',
        estimatedImpact: 'Reduced database size and improved relevance',
      });

      // Calculate overall quality score
      const totalIOCs = await IOC.countDocuments();
      const qualityScore = this.calculateQualityScore(issues, totalIOCs);

      const report: IOCQualityReport = {
        overallScore: qualityScore,
        issues,
        improvements,
      };

      logger.info('IOC quality report generated', {
        overallScore: qualityScore,
        issueCount: issues.length,
        improvementCount: improvements.length,
      });

      return report;
    } catch (error) {
      logger.error('Error generating quality report', error);
      throw error;
    }
  }

  /**
   * Get IOC statistics for dashboard
   */
  static async getDashboardStats(): Promise<any> {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalCount,
        activeCount,
        todayCount,
        weekCount,
        severityCounts,
        topSources,
      ] = await Promise.all([
        IOC.countDocuments(),
        IOC.countDocuments({ isActive: true }),
        IOC.countDocuments({ createdAt: { $gte: last24Hours } }),
        IOC.countDocuments({ createdAt: { $gte: last7Days } }),
        IOC.aggregate([
          { $group: { _id: '$severity', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        IOC.aggregate([
          { $group: { _id: '$source', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
      ]);

      return {
        overview: {
          total: totalCount,
          active: activeCount,
          inactive: totalCount - activeCount,
          newToday: todayCount,
          newThisWeek: weekCount,
        },
        severity: severityCounts,
        topSources,
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error('Error getting dashboard stats', error);
      throw error;
    }
  }

  // Private helper methods

  private static buildDateFilter(dateRange?: { start: Date; end: Date }): any {
    if (!dateRange) return {};
    return {
      createdAt: {
        $gte: dateRange.start,
        $lte: dateRange.end,
      },
    };
  }

  private static getCacheKey(
    prefix: string,
    dateRange?: { start: Date; end: Date }
  ): string {
    const rangeKey = dateRange
      ? `${dateRange.start.getTime()}-${dateRange.end.getTime()}`
      : 'all';
    return `${prefix}-${rangeKey}`;
  }

  private static async getOverviewStats(filter: any) {
    const [total, active] = await Promise.all([
      IOC.countDocuments(filter),
      IOC.countDocuments({ ...filter, isActive: true }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      lastUpdated: new Date(),
    };
  }

  private static async getTypeDistribution(filter: any) {
    const distribution = await IOC.aggregate([
      { $match: filter },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const total = distribution.reduce((sum, item) => sum + item.count, 0);

    return distribution.map(item => ({
      type: item._id,
      count: item.count,
      percentage: Math.round((item.count / total) * 100),
    }));
  }

  private static async getSeverityDistribution(filter: any) {
    const distribution = await IOC.aggregate([
      { $match: filter },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const total = distribution.reduce((sum, item) => sum + item.count, 0);

    return distribution.map(item => ({
      severity: item._id,
      count: item.count,
      percentage: Math.round((item.count / total) * 100),
    }));
  }

  private static async getConfidenceDistribution(filter: any) {
    const distribution = await IOC.aggregate([
      { $match: filter },
      {
        $bucket: {
          groupBy: '$confidence',
          boundaries: [0, 25, 50, 75, 100],
          default: 'other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    const ranges = ['0-24', '25-49', '50-74', '75-100'];

    return distribution.map((item, index) => ({
      range: ranges[index] || 'other',
      count: item.count,
      percentage: Math.round((item.count / total) * 100),
    }));
  }

  private static async getSourceDistribution(filter: any) {
    const distribution = await IOC.aggregate([
      { $match: filter },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const total = await IOC.countDocuments(filter);

    return distribution.map(item => ({
      source: item._id,
      count: item.count,
      percentage: Math.round((item.count / total) * 100),
    }));
  }

  private static async getCreationTrend(filter: any) {
    const trend = await IOC.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    return trend.map(item => ({
      date: item._id,
      count: item.count,
    }));
  }

  private static async getActivityTrend(filter: any) {
    const trend = await IOC.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastSeen' } },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    return trend.map(item => ({
      date: item._id,
      active: item.active,
      inactive: item.inactive,
    }));
  }

  private static async getAgeDistribution(filter: any) {
    const now = new Date();
    const ranges = [
      { name: '0-7 days', min: 0, max: 7 },
      { name: '8-30 days', min: 8, max: 30 },
      { name: '31-90 days', min: 31, max: 90 },
      { name: '91-365 days', min: 91, max: 365 },
      { name: '365+ days', min: 365, max: Infinity },
    ];

    const distribution = [];
    let total = 0;

    for (const range of ranges) {
      const minDate = new Date(now.getTime() - range.max * 24 * 60 * 60 * 1000);
      const maxDate =
        range.min === 0
          ? now
          : new Date(now.getTime() - range.min * 24 * 60 * 60 * 1000);

      const query = { ...filter };
      if (range.max === Infinity) {
        query.createdAt = { $lt: maxDate };
      } else {
        query.createdAt = { $gte: minDate, $lt: maxDate };
      }

      const count = await IOC.countDocuments(query);
      distribution.push({ range: range.name, count });
      total += count;
    }

    return distribution.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
    }));
  }

  private static async getQualityMetrics(filter: any) {
    const [
      avgConfidence,
      highConfidence,
      lowConfidence,
      missingDescriptions,
      emptyTags,
    ] = await Promise.all([
      IOC.aggregate([
        { $match: filter },
        { $group: { _id: null, avg: { $avg: '$confidence' } } },
      ]),
      IOC.countDocuments({ ...filter, confidence: { $gte: 80 } }),
      IOC.countDocuments({ ...filter, confidence: { $lt: 50 } }),
      IOC.countDocuments({
        ...filter,
        $or: [{ description: { $exists: false } }, { description: '' }],
      }),
      IOC.countDocuments({
        ...filter,
        $or: [{ tags: { $exists: false } }, { tags: { $size: 0 } }],
      }),
    ]);

    return {
      averageConfidence: Math.round(avgConfidence[0]?.avg || 0),
      highConfidenceCount: highConfidence,
      lowConfidenceCount: lowConfidence,
      missingDescriptions,
      emptyTags,
    };
  }

  private static async getRiskDistribution(filter: any) {
    const distribution = await IOC.aggregate([
      { $match: filter },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    const counts = {
      criticalCount: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
    };

    distribution.forEach(item => {
      switch (item._id) {
        case 'critical':
          counts.criticalCount = item.count;
          break;
        case 'high':
          counts.highRiskCount = item.count;
          break;
        case 'medium':
          counts.mediumRiskCount = item.count;
          break;
        case 'low':
          counts.lowRiskCount = item.count;
          break;
      }
    });

    return counts;
  }

  private static async getRiskTrend(filter: any) {
    const trend = await IOC.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            severity: '$severity',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
      { $limit: 100 },
    ]);

    // Group by date
    const dateMap = new Map();
    trend.forEach(item => {
      const date = item._id.date;
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, critical: 0, high: 0, medium: 0, low: 0 });
      }
      const entry = dateMap.get(date);
      entry[item._id.severity] = item.count;
    });

    return Array.from(dateMap.values());
  }

  private static async getTagAnalysis(filter: any) {
    const [mostUsedTags, tagDistribution] = await Promise.all([
      IOC.aggregate([
        { $match: filter },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),

      IOC.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { $size: { $ifNull: ['$tags', []] } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalIOCs = await IOC.countDocuments(filter);

    return {
      mostUsedTags: mostUsedTags.map(item => ({
        tag: item._id,
        count: item.count,
        percentage: Math.round((item.count / totalIOCs) * 100),
      })),
      tagDistribution: tagDistribution.map(item => ({
        tagCount: item._id,
        iocCount: item.count,
      })),
    };
  }

  private static generateTrendInsights(trendData: any[]): string[] {
    const insights: string[] = [];

    if (trendData.length === 0) {
      insights.push('No data available for the selected period');
      return insights;
    }

    // Calculate growth rate
    const firstPeriod = trendData[0];
    const lastPeriod = trendData[trendData.length - 1];

    if (lastPeriod.newIOCs > firstPeriod.newIOCs * 1.5) {
      insights.push('Significant increase in new IOCs detected');
    } else if (lastPeriod.newIOCs < firstPeriod.newIOCs * 0.5) {
      insights.push('Significant decrease in new IOCs detected');
    }

    // Check for spikes
    const avgNewIOCs =
      trendData.reduce((sum, item) => sum + item.newIOCs, 0) / trendData.length;
    const hasSpike = trendData.some(item => item.newIOCs > avgNewIOCs * 2);

    if (hasSpike) {
      insights.push(
        'Unusual spikes in IOC creation detected - investigate potential incidents'
      );
    }

    return insights;
  }

  private static generateTrendPredictions(trendData: any[]): any {
    if (trendData.length < 3) {
      return null;
    }

    // Simple linear trend calculation
    const values = trendData.map(item => item.newIOCs);
    const n = values.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, idx) => sum + val * (idx + 1), 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextPeriodForecast = Math.round(intercept + slope * (n + 1));
    const trend =
      slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable';

    return {
      nextPeriodForecast: Math.max(0, nextPeriodForecast),
      trend,
      confidence: Math.min(90, Math.max(30, 90 - Math.abs(slope) * 10)),
    };
  }

  private static calculateQualityScore(
    issues: any[],
    totalIOCs: number
  ): number {
    let score = 100;

    issues.forEach(issue => {
      const percentage = (issue.count / totalIOCs) * 100;
      switch (issue.type) {
        case 'error':
          score -= percentage * 2; // Errors have double impact
          break;
        case 'warning':
          score -= percentage * 1.5;
          break;
        case 'info':
          score -= percentage * 0.5;
          break;
      }
    });

    return Math.max(0, Math.round(score));
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
    logger.info('IOC statistics cache cleared');
  }
}
