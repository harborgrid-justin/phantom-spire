import { logger } from '../../../utils/logger.js';
import { DatabaseService } from '../../../data-layer/DatabaseService.js';
import { ValidationError, NotFoundError, ConflictError } from '../../../utils/errors.js';

export interface EscalationManagementSystemData {
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

export interface EscalationManagementSystemCreateInput {
  name: string;
  status?: 'active' | 'pending' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  tags?: string[];
  owner?: string;
}

export interface EscalationManagementSystemUpdateInput {
  name?: string;
  status?: 'active' | 'pending' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  tags?: string[];
  owner?: string;
}

export interface EscalationManagementSystemFilterOptions {
  status?: string[];
  priority?: string[];
  tags?: string[];
  owner?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  searchTerm?: string;
}

export interface EscalationManagementSystemSortOptions {
  field: 'name' | 'status' | 'priority' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface EscalationManagementSystemPaginationOptions {
  page: number;
  limit: number;
}

export interface EscalationManagementSystemListResult {
  items: EscalationManagementSystemData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class EscalationManagementSystemBusinessLogic {
  private db: DatabaseService;
  private collectionName = 'incident_response_escalationmanagementsystem';

  constructor() {
    this.db = DatabaseService.getInstance();
    logger.info(`Initialized ${this.constructor.name} with collection: ${this.collectionName}`);
  }

  /**
   * Create a new incident response item
   */
  async create(
    input: EscalationManagementSystemCreateInput,
    userId: string
  ): Promise<EscalationManagementSystemData> {
    try {
      logger.info(`Creating new incident response item: ${input.name}`, { userId, input });

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
        throw new ConflictError(`incident response item with name '${input.name}' already exists`);
      }

      // Prepare data
      const now = new Date();
      const itemData: EscalationManagementSystemData = {
        id: this.generateId(),
        name: input.name.trim(),
        status: input.status || 'pending',
        priority: input.priority || 'medium',
        category: 'incident-response',
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

      logger.info(`Successfully created incident response item: ${itemData.id}`, { itemId: itemData.id });
      return itemData;

    } catch (error) {
      logger.error(`Failed to create incident response item`, { error: error.message, input, userId });
      throw error;
    }
  }

  /**
   * Get incident response item by ID
   */
  async getById(id: string): Promise<EscalationManagementSystemData | null> {
    try {
      logger.debug(`Fetching incident response item by ID: ${id}`);

      const item = await this.db.findOne(this.collectionName, { id });
      
      if (!item) {
        logger.warn(`incident response item not found: ${id}`);
        return null;
      }

      return item as EscalationManagementSystemData;

    } catch (error) {
      logger.error(`Failed to fetch incident response item by ID`, { error: error.message, id });
      throw error;
    }
  }

  /**
   * Update incident response item
   */
  async update(
    id: string,
    input: EscalationManagementSystemUpdateInput,
    userId: string
  ): Promise<EscalationManagementSystemData> {
    try {
      logger.info(`Updating incident response item: ${id}`, { userId, input });

      // Get existing item
      const existingItem = await this.getById(id);
      if (!existingItem) {
        throw new NotFoundError(`incident response item not found: ${id}`);
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
          throw new ConflictError(`incident response item with name '${input.name}' already exists`);
        }
      }

      // Prepare update data
      const updateData: Partial<EscalationManagementSystemData> = {
        ...input,
        updatedAt: new Date(),
        updatedBy: userId
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof EscalationManagementSystemData] === undefined) {
          delete updateData[key as keyof EscalationManagementSystemData];
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

      logger.info(`Successfully updated incident response item: ${id}`);
      return updatedItem;

    } catch (error) {
      logger.error(`Failed to update incident response item`, { error: error.message, id, input, userId });
      throw error;
    }
  }

  /**
   * Delete incident response item
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      logger.info(`Deleting incident response item: ${id}`, { userId });

      // Check if item exists
      const existingItem = await this.getById(id);
      if (!existingItem) {
        throw new NotFoundError(`incident response item not found: ${id}`);
      }

      // Delete from database
      await this.db.deleteOne(this.collectionName, { id });

      // Log metrics
      await this.recordMetrics('delete', existingItem);

      logger.info(`Successfully deleted incident response item: ${id}`);

    } catch (error) {
      logger.error(`Failed to delete incident response item`, { error: error.message, id, userId });
      throw error;
    }
  }

  /**
   * List incident response items with filtering, sorting, and pagination
   */
  async list(
    filters?: EscalationManagementSystemFilterOptions,
    sort?: EscalationManagementSystemSortOptions,
    pagination?: EscalationManagementSystemPaginationOptions
  ): Promise<EscalationManagementSystemListResult> {
    try {
      logger.debug('Listing incident response items', { filters, sort, pagination });

      // Build query
      const query: any = { category: 'incident-response' };

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

      const result: EscalationManagementSystemListResult = {
        items: items as EscalationManagementSystemData[],
        total,
        page,
        limit,
        totalPages
      };

      logger.debug(`Retrieved ${items.length} incident response items`, { total, page, totalPages });
      return result;

    } catch (error) {
      logger.error('Failed to list incident response items', { error: error.message, filters, sort, pagination });
      throw error;
    }
  }

  /**
   * Get analytics and metrics
   */
  async getAnalytics(): Promise<any> {
    try {
      logger.debug('Getting incident response analytics');

      const [
        totalCount,
        statusCounts,
        priorityCounts,
        recentActivity
      ] = await Promise.all([
        this.db.count(this.collectionName, { category: 'incident-response' }),
        this.db.aggregate(this.collectionName, [
          { $match: { category: 'incident-response' } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        this.db.aggregate(this.collectionName, [
          { $match: { category: 'incident-response' } },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]),
        this.db.find(this.collectionName, 
          { category: 'incident-response' }, 
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
      logger.error('Failed to get incident response analytics', { error: error.message });
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdate(
    ids: string[],
    update: Partial<EscalationManagementSystemUpdateInput>,
    userId: string
  ): Promise<number> {
    try {
      logger.info(`Bulk updating ${ids.length} incident response items`, { userId, update });

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

      logger.info(`Successfully bulk updated ${result.modifiedCount} incident response items`);
      return result.modifiedCount;

    } catch (error) {
      logger.error('Failed to bulk update incident response items', { error: error.message, ids, update, userId });
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
  private async recordMetrics(operation: string, data: EscalationManagementSystemData): Promise<void> {
    try {
      const metrics = {
        operation,
        category: 'incident-response',
        component: 'EscalationManagementSystem',
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

export default EscalationManagementSystemBusinessLogic;
