import { logger } from '../../../utils/logger.js';
import { DatabaseService } from '../../../data-layer/DatabaseService.js';
import { ValidationError, NotFoundError, ConflictError } from '../../../utils/errors.js';

export interface MobileForensicsWorkbenchData {
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

export interface MobileForensicsWorkbenchCreateInput {
  name: string;
  status?: 'active' | 'pending' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  tags?: string[];
  owner?: string;
}

export interface MobileForensicsWorkbenchUpdateInput {
  name?: string;
  status?: 'active' | 'pending' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  tags?: string[];
  owner?: string;
}

export interface MobileForensicsWorkbenchFilterOptions {
  status?: string[];
  priority?: string[];
  tags?: string[];
  owner?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  searchTerm?: string;
}

export interface MobileForensicsWorkbenchSortOptions {
  field: 'name' | 'status' | 'priority' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface MobileForensicsWorkbenchPaginationOptions {
  page: number;
  limit: number;
}

export interface MobileForensicsWorkbenchListResult {
  items: MobileForensicsWorkbenchData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class MobileForensicsWorkbenchBusinessLogic {
  private db: DatabaseService;
  private collectionName = 'digital_forensics_mobileforensicsworkbench';

  constructor() {
    this.db = DatabaseService.getInstance();
    logger.info(`Initialized ${this.constructor.name} with collection: ${this.collectionName}`);
  }

  /**
   * Create a new digital forensics item
   */
  async create(
    input: MobileForensicsWorkbenchCreateInput,
    userId: string
  ): Promise<MobileForensicsWorkbenchData> {
    try {
      logger.info(`Creating new digital forensics item: ${input.name}`, { userId, input });

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
        throw new ConflictError(`digital forensics item with name '${input.name}' already exists`);
      }

      // Prepare data
      const now = new Date();
      const itemData: MobileForensicsWorkbenchData = {
        id: this.generateId(),
        name: input.name.trim(),
        status: input.status || 'pending',
        priority: input.priority || 'medium',
        category: 'digital-forensics',
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

      logger.info(`Successfully created digital forensics item: ${itemData.id}`, { itemId: itemData.id });
      return itemData;

    } catch (error) {
      logger.error(`Failed to create digital forensics item`, { error: error.message, input, userId });
      throw error;
    }
  }

  /**
   * Get digital forensics item by ID
   */
  async getById(id: string): Promise<MobileForensicsWorkbenchData | null> {
    try {
      logger.debug(`Fetching digital forensics item by ID: ${id}`);

      const item = await this.db.findOne(this.collectionName, { id });
      
      if (!item) {
        logger.warn(`digital forensics item not found: ${id}`);
        return null;
      }

      return item as MobileForensicsWorkbenchData;

    } catch (error) {
      logger.error(`Failed to fetch digital forensics item by ID`, { error: error.message, id });
      throw error;
    }
  }

  /**
   * Update digital forensics item
   */
  async update(
    id: string,
    input: MobileForensicsWorkbenchUpdateInput,
    userId: string
  ): Promise<MobileForensicsWorkbenchData> {
    try {
      logger.info(`Updating digital forensics item: ${id}`, { userId, input });

      // Get existing item
      const existingItem = await this.getById(id);
      if (!existingItem) {
        throw new NotFoundError(`digital forensics item not found: ${id}`);
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
          throw new ConflictError(`digital forensics item with name '${input.name}' already exists`);
        }
      }

      // Prepare update data
      const updateData: Partial<MobileForensicsWorkbenchData> = {
        ...input,
        updatedAt: new Date(),
        updatedBy: userId
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof MobileForensicsWorkbenchData] === undefined) {
          delete updateData[key as keyof MobileForensicsWorkbenchData];
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

      logger.info(`Successfully updated digital forensics item: ${id}`);
      return updatedItem;

    } catch (error) {
      logger.error(`Failed to update digital forensics item`, { error: error.message, id, input, userId });
      throw error;
    }
  }

  /**
   * Delete digital forensics item
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      logger.info(`Deleting digital forensics item: ${id}`, { userId });

      // Check if item exists
      const existingItem = await this.getById(id);
      if (!existingItem) {
        throw new NotFoundError(`digital forensics item not found: ${id}`);
      }

      // Delete from database
      await this.db.deleteOne(this.collectionName, { id });

      // Log metrics
      await this.recordMetrics('delete', existingItem);

      logger.info(`Successfully deleted digital forensics item: ${id}`);

    } catch (error) {
      logger.error(`Failed to delete digital forensics item`, { error: error.message, id, userId });
      throw error;
    }
  }

  /**
   * List digital forensics items with filtering, sorting, and pagination
   */
  async list(
    filters?: MobileForensicsWorkbenchFilterOptions,
    sort?: MobileForensicsWorkbenchSortOptions,
    pagination?: MobileForensicsWorkbenchPaginationOptions
  ): Promise<MobileForensicsWorkbenchListResult> {
    try {
      logger.debug('Listing digital forensics items', { filters, sort, pagination });

      // Build query
      const query: any = { category: 'digital-forensics' };

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

      const result: MobileForensicsWorkbenchListResult = {
        items: items as MobileForensicsWorkbenchData[],
        total,
        page,
        limit,
        totalPages
      };

      logger.debug(`Retrieved ${items.length} digital forensics items`, { total, page, totalPages });
      return result;

    } catch (error) {
      logger.error('Failed to list digital forensics items', { error: error.message, filters, sort, pagination });
      throw error;
    }
  }

  /**
   * Get analytics and metrics
   */
  async getAnalytics(): Promise<any> {
    try {
      logger.debug('Getting digital forensics analytics');

      const [
        totalCount,
        statusCounts,
        priorityCounts,
        recentActivity
      ] = await Promise.all([
        this.db.count(this.collectionName, { category: 'digital-forensics' }),
        this.db.aggregate(this.collectionName, [
          { $match: { category: 'digital-forensics' } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        this.db.aggregate(this.collectionName, [
          { $match: { category: 'digital-forensics' } },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]),
        this.db.find(this.collectionName, 
          { category: 'digital-forensics' }, 
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
      logger.error('Failed to get digital forensics analytics', { error: error.message });
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdate(
    ids: string[],
    update: Partial<MobileForensicsWorkbenchUpdateInput>,
    userId: string
  ): Promise<number> {
    try {
      logger.info(`Bulk updating ${ids.length} digital forensics items`, { userId, update });

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

      logger.info(`Successfully bulk updated ${result.modifiedCount} digital forensics items`);
      return result.modifiedCount;

    } catch (error) {
      logger.error('Failed to bulk update digital forensics items', { error: error.message, ids, update, userId });
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
  private async recordMetrics(operation: string, data: MobileForensicsWorkbenchData): Promise<void> {
    try {
      const metrics = {
        operation,
        category: 'digital-forensics',
        component: 'MobileForensicsWorkbench',
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

export default MobileForensicsWorkbenchBusinessLogic;
