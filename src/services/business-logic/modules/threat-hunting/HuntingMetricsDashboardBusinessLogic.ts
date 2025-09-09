import { logger } from '../../../utils/logger.js';
import { DatabaseService } from '../../../data-layer/DatabaseService.js';
import { ValidationError, NotFoundError, ConflictError } from '../../../utils/errors.js';

export interface HuntingMetricsDashboardData {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  metadata: Record<string, any>;
  tags: string[];
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface HuntingMetricsDashboardCreateInput {
  name: string;
  status?: 'active' | 'pending' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  tags?: string[];
  owner?: string;
}

export interface HuntingMetricsDashboardUpdateInput {
  name?: string;
  status?: 'active' | 'pending' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  tags?: string[];
  owner?: string;
}

export interface HuntingMetricsDashboardFilterOptions {
  status?: string[];
  priority?: string[];
  tags?: string[];
  owner?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  searchTerm?: string;
}

export interface HuntingMetricsDashboardSortOptions {
  field: 'name' | 'status' | 'priority' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface HuntingMetricsDashboardPaginationOptions {
  page: number;
  limit: number;
}

export interface HuntingMetricsDashboardListResult {
  items: HuntingMetricsDashboardData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class HuntingMetricsDashboardBusinessLogic {
  private db: DatabaseService;
  private collectionName = 'threat_hunting_huntingmetricsdashboard';

  constructor() {
    this.db = DatabaseService.getInstance();
    logger.info(`Initialized ${this.constructor.name} with collection: ${this.collectionName}`);
  }

  /**
   * Create a new threat hunting item
   */
  async create(
    input: HuntingMetricsDashboardCreateInput,
    userId: string
  ): Promise<HuntingMetricsDashboardData> {
    try {
      logger.info(`Creating new threat hunting item: ${input.name}`, { userId, input });

      // Validation
      if (!input.name || input.name.trim().length === 0) {
        throw new ValidationError('Name is required');
      }

      if (input.name.length > 255) {
        throw new ValidationError('Name must be less than 255 characters');
      }

      // Check for duplicate name
      const existingItem = await this.db.findOne(this.collectionName, { name: input.name });
      if (existingItem) {
        throw new ConflictError(`threat hunting item with name '${input.name}' already exists`);
      }

      // Prepare data
      const now = new Date();
      const itemData: HuntingMetricsDashboardData = {
        id: this.generateId(),
        name: input.name.trim(),
        status: input.status || 'pending',
        priority: input.priority || 'medium',
        category: 'threat-hunting',
        metadata: input.metadata || {},
        tags: input.tags || [],
        owner: input.owner || userId,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId
      };

      // Store in database
      await this.db.insertOne(this.collectionName, itemData);

      // Log metrics
      await this.recordMetrics('create', itemData);

      logger.info(`Successfully created threat hunting item: ${itemData.id}`, { itemId: itemData.id });
      return itemData;

    } catch (error) {
      logger.error(`Failed to create threat hunting item`, { error: error.message, input, userId });
      throw error;
    }
  }

  /**
   * Get threat hunting item by ID
   */
  async getById(id: string): Promise<HuntingMetricsDashboardData | null> {
    try {
      logger.debug(`Fetching threat hunting item by ID: ${id}`);

      const item = await this.db.findOne(this.collectionName, { id });
      
      if (!item) {
        logger.warn(`threat hunting item not found: ${id}`);
        return null;
      }

      return item as HuntingMetricsDashboardData;

    } catch (error) {
      logger.error(`Failed to fetch threat hunting item by ID`, { error: error.message, id });
      throw error;
    }
  }

  /**
   * Update threat hunting item
   */
  async update(
    id: string,
    input: HuntingMetricsDashboardUpdateInput,
    userId: string
  ): Promise<HuntingMetricsDashboardData> {
    try {
      logger.info(`Updating threat hunting item: ${id}`, { userId, input });

      // Get existing item
      const existingItem = await this.getById(id);
      if (!existingItem) {
        throw new NotFoundError(`threat hunting item not found: ${id}`);
      }

      // Validation
      if (input.name !== undefined) {
        if (!input.name || input.name.trim().length === 0) {
          throw new ValidationError('Name is required');
        }
        if (input.name.length > 255) {
          throw new ValidationError('Name must be less than 255 characters');
        }

        // Check for duplicate name (excluding current item)
        const duplicateItem = await this.db.findOne(this.collectionName, { 
          name: input.name,
          id: { $ne: id }
        });
        if (duplicateItem) {
          throw new ConflictError(`threat hunting item with name '${input.name}' already exists`);
        }
      }

      // Prepare update data
      const updateData: Partial<HuntingMetricsDashboardData> = {
        ...input,
        updatedAt: new Date(),
        updatedBy: userId
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof HuntingMetricsDashboardData] === undefined) {
          delete updateData[key as keyof HuntingMetricsDashboardData];
        }
      });

      // Update in database
      await this.db.updateOne(this.collectionName, { id }, { $set: updateData });

      // Get updated item
      const updatedItem = await this.getById(id);
      if (!updatedItem) {
        throw new Error('Failed to retrieve updated item');
      }

      // Log metrics
      await this.recordMetrics('update', updatedItem);

      logger.info(`Successfully updated threat hunting item: ${id}`);
      return updatedItem;

    } catch (error) {
      logger.error(`Failed to update threat hunting item`, { error: error.message, id, input, userId });
      throw error;
    }
  }

  /**
   * Delete threat hunting item
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      logger.info(`Deleting threat hunting item: ${id}`, { userId });

      // Check if item exists
      const existingItem = await this.getById(id);
      if (!existingItem) {
        throw new NotFoundError(`threat hunting item not found: ${id}`);
      }

      // Delete from database
      await this.db.deleteOne(this.collectionName, { id });

      // Log metrics
      await this.recordMetrics('delete', existingItem);

      logger.info(`Successfully deleted threat hunting item: ${id}`);

    } catch (error) {
      logger.error(`Failed to delete threat hunting item`, { error: error.message, id, userId });
      throw error;
    }
  }

  /**
   * List threat hunting items with filtering, sorting, and pagination
   */
  async list(
    filters?: HuntingMetricsDashboardFilterOptions,
    sort?: HuntingMetricsDashboardSortOptions,
    pagination?: HuntingMetricsDashboardPaginationOptions
  ): Promise<HuntingMetricsDashboardListResult> {
    try {
      logger.debug('Listing threat hunting items', { filters, sort, pagination });

      // Build query
      const query: any = { category: 'threat-hunting' };

      if (filters) {
        if (filters.status && filters.status.length > 0) {
          query.status = { $in: filters.status };
        }
        if (filters.priority && filters.priority.length > 0) {
          query.priority = { $in: filters.priority };
        }
        if (filters.tags && filters.tags.length > 0) {
          query.tags = { $in: filters.tags };
        }
        if (filters.owner) {
          query.owner = filters.owner;
        }
        if (filters.createdAfter || filters.createdBefore) {
          query.createdAt = {};
          if (filters.createdAfter) {
            query.createdAt.$gte = filters.createdAfter;
          }
          if (filters.createdBefore) {
            query.createdAt.$lte = filters.createdBefore;
          }
        }
        if (filters.searchTerm) {
          query.$or = [
            { name: { $regex: filters.searchTerm, $options: 'i' } },
            { 'metadata.description': { $regex: filters.searchTerm, $options: 'i' } }
          ];
        }
      }

      // Build sort
      const sortOptions: any = {};
      if (sort) {
        sortOptions[sort.field] = sort.direction === 'asc' ? 1 : -1;
      } else {
        sortOptions.createdAt = -1; // Default sort by created date desc
      }

      // Pagination
      const page = pagination?.page || 1;
      const limit = Math.min(pagination?.limit || 25, 100); // Max 100 items per page
      const skip = (page - 1) * limit;

      // Execute queries
      const [items, total] = await Promise.all([
        this.db.find(this.collectionName, query, { sort: sortOptions, skip, limit }),
        this.db.count(this.collectionName, query)
      ]);

      const totalPages = Math.ceil(total / limit);

      const result: HuntingMetricsDashboardListResult = {
        items: items as HuntingMetricsDashboardData[],
        total,
        page,
        limit,
        totalPages
      };

      logger.debug(`Retrieved ${items.length} threat hunting items`, { total, page, totalPages });
      return result;

    } catch (error) {
      logger.error('Failed to list threat hunting items', { error: error.message, filters, sort, pagination });
      throw error;
    }
  }

  /**
   * Get analytics and metrics
   */
  async getAnalytics(): Promise<any> {
    try {
      logger.debug('Getting threat hunting analytics');

      const [
        totalCount,
        statusCounts,
        priorityCounts,
        recentActivity
      ] = await Promise.all([
        this.db.count(this.collectionName, { category: 'threat-hunting' }),
        this.db.aggregate(this.collectionName, [
          { $match: { category: 'threat-hunting' } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        this.db.aggregate(this.collectionName, [
          { $match: { category: 'threat-hunting' } },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]),
        this.db.find(this.collectionName, 
          { category: 'threat-hunting' }, 
          { sort: { updatedAt: -1 }, limit: 10 }
        )
      ]);

      return {
        totalCount,
        statusCounts: statusCounts.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        priorityCounts: priorityCounts.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentActivity
      };

    } catch (error) {
      logger.error('Failed to get threat hunting analytics', { error: error.message });
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdate(
    ids: string[],
    update: Partial<HuntingMetricsDashboardUpdateInput>,
    userId: string
  ): Promise<number> {
    try {
      logger.info(`Bulk updating ${ids.length} threat hunting items`, { userId, update });

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

      logger.info(`Successfully bulk updated ${result.modifiedCount} threat hunting items`);
      return result.modifiedCount;

    } catch (error) {
      logger.error('Failed to bulk update threat hunting items', { error: error.message, ids, update, userId });
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
  private async recordMetrics(operation: string, data: HuntingMetricsDashboardData): Promise<void> {
    try {
      const metrics = {
        operation,
        category: 'threat-hunting',
        component: 'HuntingMetricsDashboard',
        itemId: data.id,
        status: data.status,
        priority: data.priority,
        timestamp: new Date(),
        metadata: {
          tags: data.tags,
          owner: data.owner
        }
      };

      await this.db.insertOne('system_metrics', metrics);
    } catch (error) {
      // Don't throw on metrics failure
      logger.warn('Failed to record metrics', { error: error.message, operation, itemId: data.id });
    }
  }
}

export default HuntingMetricsDashboardBusinessLogic;
