import { DatabaseConnection } from '../../data-layer/DatabaseConnection';
import { Logger } from '../../utils/Logger';
import { TTPData, TTPCreateInput, TTPUpdateInput, TTPQueryOptions } from '../../../types/ttp.types';

const logger = new Logger('ProcedureEvolutionTrackerBusinessLogic');

interface ProcedureEvolutionTrackerAnalytics {
  totalCount: number;
  statusCounts: Record<string, number>;
  severityCounts: Record<string, number>;
  coverageStats: {
    avgDetectionCoverage: number;
    avgConfidence: number;
    topTactics: string[];
    topTechniques: string[];
  };
  recentActivity: any[];
}

export class ProcedureEvolutionTrackerBusinessLogic {
  private db: DatabaseConnection;
  private collectionName = 'procedures_intelligence_ttp';

  constructor() {
    this.db = new DatabaseConnection();
  }

  /**
   * Get all TTP items with filtering and pagination
   */
  async getAll(options: TTPQueryOptions = {}): Promise<{ items: TTPData[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 25,
        status,
        severity,
        tactics,
        techniques,
        actors,
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = options;

      logger.debug('Getting all procedures intelligence TTP items', { options });

      // Build filter query
      const filter: any = { category: 'procedures-intelligence' };
      
      if (status?.length) {
        filter.status = { $in: status };
      }
      
      if (severity?.length) {
        filter.severity = { $in: severity };
      }
      
      if (tactics?.length) {
        filter.tactics = { $in: tactics };
      }
      
      if (techniques?.length) {
        filter.techniques = { $in: techniques };
      }
      
      if (actors?.length) {
        filter.actors = { $in: actors };
      }

      const [items, total] = await Promise.all([
        this.db.find(
          this.collectionName,
          filter,
          {
            sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
            skip: (page - 1) * limit,
            limit
          }
        ),
        this.db.count(this.collectionName, filter)
      ]);

      logger.info(`Retrieved ${items.length} procedures intelligence TTP items`);
      return { items, total };

    } catch (error) {
      logger.error('Failed to get procedures intelligence TTP items', { error: error.message, options });
      throw error;
    }
  }

  /**
   * Get single TTP item by ID
   */
  async getById(id: string): Promise<TTPData | null> {
    try {
      logger.debug('Getting procedures intelligence TTP item by ID', { id });

      const item = await this.db.findOne(this.collectionName, { id });
      
      if (!item) {
        logger.warn('procedures intelligence TTP item not found', { id });
        return null;
      }

      logger.info('Retrieved procedures intelligence TTP item', { id, name: item.name });
      return item;

    } catch (error) {
      logger.error('Failed to get procedures intelligence TTP item', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Create new TTP item
   */
  async create(input: TTPCreateInput, userId: string): Promise<TTPData> {
    try {
      logger.info('Creating new procedures intelligence TTP item', { input, userId });

      const now = new Date();
      const ttpData: TTPData = {
        id: this.generateId(),
        ...input,
        category: 'procedures-intelligence',
        status: input.status || 'active',
        severity: input.severity || 'medium',
        confidence: input.confidence || 0,
        detectionCoverage: input.detectionCoverage || 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: userId,
        updatedBy: userId
      };

      await this.db.insertOne(this.collectionName, ttpData);
      await this.recordMetrics('create', ttpData);

      logger.info('Successfully created procedures intelligence TTP item', { id: ttpData.id, name: ttpData.name });
      return ttpData;

    } catch (error) {
      logger.error('Failed to create procedures intelligence TTP item', { error: error.message, input, userId });
      throw error;
    }
  }

  /**
   * Update existing TTP item
   */
  async update(id: string, input: TTPUpdateInput, userId: string): Promise<TTPData | null> {
    try {
      logger.info('Updating procedures intelligence TTP item', { id, input, userId });

      const updateData = {
        ...input,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      };

      const result = await this.db.updateOne(
        this.collectionName,
        { id },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        logger.warn('procedures intelligence TTP item not found for update', { id });
        return null;
      }

      const updatedItem = await this.getById(id);
      if (updatedItem) {
        await this.recordMetrics('update', updatedItem);
      }

      logger.info('Successfully updated procedures intelligence TTP item', { id });
      return updatedItem;

    } catch (error) {
      logger.error('Failed to update procedures intelligence TTP item', { error: error.message, id, input, userId });
      throw error;
    }
  }

  /**
   * Delete TTP item
   */
  async delete(id: string, userId: string): Promise<boolean> {
    try {
      logger.info('Deleting procedures intelligence TTP item', { id, userId });

      const item = await this.getById(id);
      if (!item) {
        logger.warn('procedures intelligence TTP item not found for deletion', { id });
        return false;
      }

      const result = await this.db.deleteOne(this.collectionName, { id });
      
      if (result.deletedCount > 0) {
        await this.recordMetrics('delete', item);
        logger.info('Successfully deleted procedures intelligence TTP item', { id });
        return true;
      }

      return false;

    } catch (error) {
      logger.error('Failed to delete procedures intelligence TTP item', { error: error.message, id, userId });
      throw error;
    }
  }

  /**
   * Get analytics for the category
   */
  async getAnalytics(): Promise<ProcedureEvolutionTrackerAnalytics> {
    try {
      logger.debug('Getting procedures intelligence TTP analytics');

      const [
        totalCount,
        statusCounts,
        severityCounts,
        coverageStats,
        recentActivity
      ] = await Promise.all([
        this.db.count(this.collectionName, { category: 'procedures-intelligence' }),
        this.db.aggregate(this.collectionName, [
          { $match: { category: 'procedures-intelligence' } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        this.db.aggregate(this.collectionName, [
          { $match: { category: 'procedures-intelligence' } },
          { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]),
        this.db.aggregate(this.collectionName, [
          { $match: { category: 'procedures-intelligence' } },
          {
            $group: {
              _id: null,
              avgDetectionCoverage: { $avg: '$detectionCoverage' },
              avgConfidence: { $avg: '$confidence' },
              allTactics: { $push: '$tactics' },
              allTechniques: { $push: '$techniques' }
            }
          }
        ]),
        this.db.find(this.collectionName, 
          { category: 'procedures-intelligence' }, 
          { sort: { updatedAt: -1 }, limit: 10 }
        )
      ]);

      // Process coverage stats
      const processedCoverageStats = coverageStats[0] || {
        avgDetectionCoverage: 0,
        avgConfidence: 0,
        allTactics: [],
        allTechniques: []
      };

      // Get top tactics and techniques
      const flatTactics = processedCoverageStats.allTactics.flat();
      const flatTechniques = processedCoverageStats.allTechniques.flat();
      
      const tacticCounts = flatTactics.reduce((acc, tactic) => {
        acc[tactic] = (acc[tactic] || 0) + 1;
        return acc;
      }, {});
      
      const techniqueCounts = flatTechniques.reduce((acc, technique) => {
        acc[technique] = (acc[technique] || 0) + 1;
        return acc;
      }, {});

      const topTactics = Object.entries(tacticCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([tactic]) => tactic);

      const topTechniques = Object.entries(techniqueCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([technique]) => technique);

      return {
        totalCount,
        statusCounts: statusCounts.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        severityCounts: severityCounts.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        coverageStats: {
          avgDetectionCoverage: Math.round(processedCoverageStats.avgDetectionCoverage || 0),
          avgConfidence: Math.round(processedCoverageStats.avgConfidence || 0),
          topTactics,
          topTechniques
        },
        recentActivity
      };

    } catch (error) {
      logger.error('Failed to get procedures intelligence TTP analytics', { error: error.message });
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdate(
    ids: string[],
    update: Partial<TTPUpdateInput>,
    userId: string
  ): Promise<number> {
    try {
      logger.info(`Bulk updating ${ids.length} procedures intelligence TTP items`, { userId, update });

      const updateData = {
        ...update,
        updatedAt: new Date(),
        updatedBy: userId
      };

      const result = await this.db.updateMany(
        this.collectionName,
        { id: { $in: ids } },
        { $set: updateData }
      );

      logger.info(`Successfully bulk updated ${result.modifiedCount} procedures intelligence TTP items`);
      return result.modifiedCount;

    } catch (error) {
      logger.error('Failed to bulk update procedures intelligence TTP items', { error: error.message, ids, update, userId });
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${this.collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Record metrics for monitoring
   */
  private async recordMetrics(operation: string, data: TTPData): Promise<void> {
    try {
      const metrics = {
        operation,
        category: 'procedures-intelligence',
        component: 'ProcedureEvolutionTracker',
        itemId: data.id,
        status: data.status,
        severity: data.severity,
        confidence: data.confidence,
        timestamp: new Date(),
        metadata: {
          tactics: data.tactics,
          techniques: data.techniques,
          actors: data.actors,
          mitreId: data.mitreId
        }
      };

      await this.db.insertOne('system_metrics', metrics);
    } catch (error) {
      logger.warn('Failed to record metrics', { error: error.message, operation, itemId: data.id });
    }
  }
}