import { logger } from '../../../utils/logger.js';
import { DatabaseService } from '../../../data-layer/DatabaseService.js';
import { ValidationError, NotFoundError, ConflictError } from '../../../utils/errors.js';

export interface SIEMIntegrationHubData {
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

export interface SIEMIntegrationHubCreateInput {
  name: string;
  status?: 'active' | 'pending' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  tags?: string[];
  owner?: string;
}

export interface SIEMIntegrationHubUpdateInput {
  name?: string;
  status?: 'active' | 'pending' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  tags?: string[];
  owner?: string;
}

export interface SIEMIntegrationHubFilterOptions {
  status?: string[];
  priority?: string[];
  tags?: string[];
  owner?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  searchTerm?: string;
}

export interface SIEMIntegrationHubSortOptions {
  field: 'name' | 'status' | 'priority' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface SIEMIntegrationHubPaginationOptions {
  page: number;
  limit: number;
}

export interface SIEMIntegrationHubListResult {
  items: SIEMIntegrationHubData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class SIEMIntegrationHubBusinessLogic {
  private db: DatabaseService;
  private collectionName = 'security_monitoring_siemintegrationhub';

  constructor() {
    this.db = DatabaseService.getInstance();
    logger.info(`Initialized ${this.constructor.name} with collection: ${this.collectionName}`);
  }

  /**
   * Create a new security monitoring item
   */
  async create(
    input: SIEMIntegrationHubCreateInput,
    userId: string
  ): Promise<SIEMIntegrationHubData> {
    try {
      logger.info(`Creating new security monitoring item: ${input.name}`, { userId, input });

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
        throw new ConflictError(`security monitoring item with name '${input.name}' already exists`);
      }

      // Prepare data
      const now = new Date();
      const itemData: SIEMIntegrationHubData = {
        id: this.generateId(),
        name: input.name.trim(),
        status: input.status || 'pending',
        priority: input.priority || 'medium',
        category: 'security-monitoring',
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

      logger.info(`Successfully created security monitoring item: ${itemData.id}`, { itemId: itemData.id });
      return itemData;

    } catch (error) {
      logger.error(`Failed to create security monitoring item`, { error: error.message, input, userId });
      throw error;
    }
  }

  /**
   * Get security monitoring item by ID
   */
  async getById(id: string): Promise<SIEMIntegrationHubData | null> {
    try {
      logger.debug(`Fetching security monitoring item by ID: ${id}`);

      const item = await this.db.findOne(this.collectionName, { id });
      
      if (!item) {
        logger.warn(`security monitoring item not found: ${id}`);
        return null;
      }

      return item as SIEMIntegrationHubData;

    } catch (error) {
      logger.error(`Failed to fetch security monitoring item by ID`, { error: error.message, id });
      throw error;
    }
  }

  /**
   * Update security monitoring item
   */
  async update(
    id: string,
    input: SIEMIntegrationHubUpdateInput,
    userId: string
  ): Promise<SIEMIntegrationHubData> {
    try {
      logger.info(`Updating security monitoring item: ${id}`, { userId, input });

      // Get existing item
      const existingItem = await this.getById(id);
      if (!existingItem) {
        throw new NotFoundError(`security monitoring item not found: ${id}`);
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
          throw new ConflictError(`security monitoring item with name '${input.name}' already exists`);
        }
      }

      // Prepare update data
      const updateData: Partial<SIEMIntegrationHubData> = {
        ...input,
        updatedAt: new Date(),
        updatedBy: userId
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof SIEMIntegrationHubData] === undefined) {
          delete updateData[key as keyof SIEMIntegrationHubData];
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

      logger.info(`Successfully updated security monitoring item: ${id}`);
      return updatedItem;

    } catch (error) {
      logger.error(`Failed to update security monitoring item`, { error: error.message, id, input, userId });
      throw error;
    }
  }

  /**
   * Delete security monitoring item
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      logger.info(`Deleting security monitoring item: ${id}`, { userId });

      // Check if item exists
      const existingItem = await this.getById(id);
      if (!existingItem) {
        throw new NotFoundError(`security monitoring item not found: ${id}`);
      }

      // Delete from database
      await this.db.deleteOne(this.collectionName, { id });

      // Log metrics
      await this.recordMetrics('delete', existingItem);

      logger.info(`Successfully deleted security monitoring item: ${id}`);

    } catch (error) {
      logger.error(`Failed to delete security monitoring item`, { error: error.message, id, userId });
      throw error;
    }
  }

  /**
   * List security monitoring items with filtering, sorting, and pagination
   */
  async list(
    filters?: SIEMIntegrationHubFilterOptions,
    sort?: SIEMIntegrationHubSortOptions,
    pagination?: SIEMIntegrationHubPaginationOptions
  ): Promise<SIEMIntegrationHubListResult> {
    try {
      logger.debug('Listing security monitoring items', { filters, sort, pagination });

      // Build query
      const query: any = { category: 'security-monitoring' };

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

      const result: SIEMIntegrationHubListResult = {
        items: items as SIEMIntegrationHubData[],
        total,
        page,
        limit,
        totalPages
      };

      logger.debug(`Retrieved ${items.length} security monitoring items`, { total, page, totalPages });
      return result;

    } catch (error) {
      logger.error('Failed to list security monitoring items', { error: error.message, filters, sort, pagination });
      throw error;
    }
  }

  /**
   * Get analytics and metrics
   */
  async getAnalytics(): Promise<any> {
    try {
      logger.debug('Getting security monitoring analytics');

      const [
        totalCount,
        statusCounts,
        priorityCounts,
        recentActivity
      ] = await Promise.all([
        this.db.count(this.collectionName, { category: 'security-monitoring' }),
        this.db.aggregate(this.collectionName, [
          { $match: { category: 'security-monitoring' } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        this.db.aggregate(this.collectionName, [
          { $match: { category: 'security-monitoring' } },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]),
        this.db.find(this.collectionName, 
          { category: 'security-monitoring' }, 
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
      logger.error('Failed to get security monitoring analytics', { error: error.message });
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdate(
    ids: string[],
    update: Partial<SIEMIntegrationHubUpdateInput>,
    userId: string
  ): Promise<number> {
    try {
      logger.info(`Bulk updating ${ids.length} security monitoring items`, { userId, update });

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

      logger.info(`Successfully bulk updated ${result.modifiedCount} security monitoring items`);
      return result.modifiedCount;

    } catch (error) {
      logger.error('Failed to bulk update security monitoring items', { error: error.message, ids, update, userId });
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
  private async recordMetrics(operation: string, data: SIEMIntegrationHubData): Promise<void> {
    try {
      const metrics = {
        operation,
        category: 'security-monitoring',
        component: 'SIEMIntegrationHub',
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

export default SIEMIntegrationHubBusinessLogic;
