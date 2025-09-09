/**
 * Base Service Pattern
 * Standardized service implementation for business logic
 */

import { logger } from '../utils/logger.js';

/**
 * Service Operation Result Interface
 */
export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Pagination Options Interface
 */
export interface PaginationOptions {
  offset: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Filter Options Interface
 */
export interface FilterOptions {
  search?: string;
  status?: string;
  priority?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  [key: string]: any;
}

/**
 * Paginated Result Interface
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

/**
 * Base Service Class
 * Provides standardized business logic patterns
 */
export abstract class BaseService {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Create success result
   */
  protected createSuccessResult<T>(data: T, message?: string): ServiceResult<T> {
    return {
      success: true,
      data
    };
  }

  /**
   * Create error result
   */
  protected createErrorResult(error: string | Error, code?: string): ServiceResult {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorCode = code || (error instanceof Error ? error.name : 'SERVICE_ERROR');

    logger.error(`${this.serviceName} service error:`, {
      error: errorMessage,
      code: errorCode,
      stack: error instanceof Error ? error.stack : undefined
    });

    return {
      success: false,
      error: errorMessage,
      code: errorCode
    };
  }

  /**
   * Execute operation with error handling
   */
  protected async executeOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<ServiceResult<T>> {
    try {
      logger.info(`${this.serviceName}: Starting ${operationName}`);
      const result = await operation();
      logger.info(`${this.serviceName}: Completed ${operationName}`);
      return this.createSuccessResult(result);
    } catch (error) {
      logger.error(`${this.serviceName}: Failed ${operationName}`, { error });
      return this.createErrorResult(error as Error);
    }
  }

  /**
   * Validate entity data
   */
  protected validateEntity(
    data: any,
    requiredFields: string[]
  ): string[] {
    const missingFields: string[] = [];
    
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0 && data[field] !== false) {
        missingFields.push(field);
      }
    }
    
    return missingFields;
  }

  /**
   * Apply filters to query
   */
  protected applyFilters(
    query: any,
    filters: FilterOptions
  ): any {
    const filteredQuery = { ...query };

    if (filters.search) {
      // Add search logic based on your ORM/database
      filteredQuery.where = {
        ...filteredQuery.where,
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ]
      };
    }

    if (filters.status) {
      filteredQuery.where = {
        ...filteredQuery.where,
        status: filters.status
      };
    }

    if (filters.priority) {
      filteredQuery.where = {
        ...filteredQuery.where,
        priority: filters.priority
      };
    }

    if (filters.dateFrom || filters.dateTo) {
      filteredQuery.where = {
        ...filteredQuery.where,
        createdAt: {
          ...(filters.dateFrom && { gte: filters.dateFrom }),
          ...(filters.dateTo && { lte: filters.dateTo })
        }
      };
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredQuery.where = {
        ...filteredQuery.where,
        tags: {
          hasSome: filters.tags
        }
      };
    }

    return filteredQuery;
  }

  /**
   * Apply pagination to query
   */
  protected applyPagination(
    query: any,
    pagination: PaginationOptions
  ): any {
    const paginatedQuery = { ...query };

    paginatedQuery.skip = pagination.offset;
    paginatedQuery.take = pagination.limit;

    if (pagination.orderBy) {
      paginatedQuery.orderBy = {
        [pagination.orderBy]: pagination.orderDirection || 'asc'
      };
    }

    return paginatedQuery;
  }

  /**
   * Create paginated result
   */
  protected createPaginatedResult<T>(
    items: T[],
    total: number,
    limit: number
  ): PaginatedResult<T> {
    return {
      items,
      total,
      hasMore: items.length === limit
    };
  }

  /**
   * Cache operation result
   */
  protected async cacheResult<T>(
    key: string,
    data: T,
    ttl: number = 300
  ): Promise<void> {
    try {
      // Implement caching based on your cache provider
      // await this.cacheService.set(key, data, ttl);
      logger.debug(`Cached result for key: ${key}`);
    } catch (error) {
      logger.warn(`Failed to cache result for key: ${key}`, { error });
    }
  }

  /**
   * Get cached result
   */
  protected async getCachedResult<T>(key: string): Promise<T | null> {
    try {
      // Implement cache retrieval based on your cache provider
      // return await this.cacheService.get(key);
      return null;
    } catch (error) {
      logger.warn(`Failed to get cached result for key: ${key}`, { error });
      return null;
    }
  }

  /**
   * Invalidate cache
   */
  protected async invalidateCache(pattern: string): Promise<void> {
    try {
      // Implement cache invalidation based on your cache provider
      // await this.cacheService.invalidate(pattern);
      logger.debug(`Invalidated cache for pattern: ${pattern}`);
    } catch (error) {
      logger.warn(`Failed to invalidate cache for pattern: ${pattern}`, { error });
    }
  }

  /**
   * Emit domain event
   */
  protected async emitEvent(
    eventType: string,
    payload: any
  ): Promise<void> {
    try {
      // Implement event emission based on your event bus
      // await this.eventBus.emit(eventType, payload);
      logger.info(`Emitted event: ${eventType}`, { payload });
    } catch (error) {
      logger.error(`Failed to emit event: ${eventType}`, { error, payload });
    }
  }
}

/**
 * Example implementation of standardized service
 */
export class ExampleService extends BaseService {
  constructor() {
    super('ExampleService');
  }

  async getItems(
    filters: FilterOptions = {},
    pagination: PaginationOptions
  ): Promise<ServiceResult<PaginatedResult<any>>> {
    return this.executeOperation(async () => {
      // Check cache first
      const cacheKey = `items:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
      const cached = await this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }

      // Build query
      let query = {};
      query = this.applyFilters(query, filters);
      query = this.applyPagination(query, pagination);

      // Execute query (mock implementation)
      const items = [
        { id: '1', name: 'Example Item', status: 'active' }
      ];
      const total = 1;

      const result = this.createPaginatedResult(items, total, pagination.limit);

      // Cache result
      await this.cacheResult(cacheKey, result);

      return result;
    }, 'getItems');
  }

  async createItem(data: any): Promise<ServiceResult<any>> {
    return this.executeOperation(async () => {
      // Validate data
      const requiredFields = ['name', 'status'];
      const missingFields = this.validateEntity(data, requiredFields);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Create item (mock implementation)
      const item = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Emit event
      await this.emitEvent('item.created', { item });

      // Invalidate cache
      await this.invalidateCache('items:*');

      return item;
    }, 'createItem');
  }

  async updateItem(id: string, data: any): Promise<ServiceResult<any>> {
    return this.executeOperation(async () => {
      if (!id) {
        throw new Error('Item ID is required');
      }

      // Update item (mock implementation)
      const item = {
        id,
        ...data,
        updatedAt: new Date()
      };

      // Emit event
      await this.emitEvent('item.updated', { item, previousData: data });

      // Invalidate cache
      await this.invalidateCache('items:*');

      return item;
    }, 'updateItem');
  }

  async deleteItem(id: string): Promise<ServiceResult<void>> {
    return this.executeOperation(async () => {
      if (!id) {
        throw new Error('Item ID is required');
      }

      // Delete item (mock implementation)
      // await this.repository.delete(id);

      // Emit event
      await this.emitEvent('item.deleted', { id });

      // Invalidate cache
      await this.invalidateCache('items:*');
    }, 'deleteItem');
  }
}