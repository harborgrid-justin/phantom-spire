/**
 * MongoDB Data Source Implementation
 * Concrete implementation of IDataSource for MongoDB with connection pooling and transactions
 */

import {
  type IDataSource,
  type ConnectionConfig,
  type TransactionContext,
  DatabaseProvider,
  IsolationLevel,
  QueryOperation,
  type QueryFilter,
  type QueryOptions,
} from './data-access-layer';
import type { LoggerService } from '..\services\core\LoggerService';

// MongoDB-specific query interface
interface MongoQuery {
  operation: QueryOperation;
  collection: string;
  filter?: Record<string, unknown>;
  data?: unknown;
  pipeline?: unknown[];
  options?: {
    sort?: Record<string, 1 | -1>;
    limit?: number;
    skip?: number;
    projection?: Record<string, 1 | 0>;
  };
}

// Mock MongoDB connection (replace with actual MongoDB driver)
interface MockMongoConnection {
  isConnected: boolean;
  database: string;
  collections: Map<string, unknown[]>;
  activeTransactions: number;
  queriesExecuted: number;
  totalQueryTime: number;
  connectionErrors: number;
}

// MongoDB Data Source implementation
export class MongoDataSource implements IDataSource {
  public readonly provider = DatabaseProvider.MONGODB;
  
  private connection?: MockMongoConnection;
  private config?: ConnectionConfig;
  private logger?: LoggerService;
  private connectionPool: MockMongoConnection[] = [];
  private metrics = {
    queriesExecuted: 0,
    totalQueryTime: 0,
    slowQueries: 0,
    connectionErrors: 0,
    activeTransactions: 0,
  };

  constructor(logger?: LoggerService) {
    this.logger = logger;
  }

  async connect(config: ConnectionConfig): Promise<void> {
    try {
      this.config = config;
      
      // Mock connection initialization
      this.connection = {
        isConnected: true,
        database: config.database,
        collections: new Map(),
        activeTransactions: 0,
        queriesExecuted: 0,
        totalQueryTime: 0,
        connectionErrors: 0,
      };

      // Initialize connection pool
      for (let i = 0; i < (config.poolSize || 10); i++) {
        this.connectionPool.push({ ...this.connection });
      }

      this.logger?.info('MongoDB connection established', {
        host: config.host,
        port: config.port,
        database: config.database,
        poolSize: config.poolSize || 10,
      });

    } catch (error) {
      this.metrics.connectionErrors++;
      this.logger?.error('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      this.connection.isConnected = false;
      this.connection = undefined;
      this.connectionPool = [];
      this.logger?.info('MongoDB connection closed');
    }
  }

  isConnected(): boolean {
    return this.connection?.isConnected || false;
  }

  async execute<T = unknown>(query: MongoQuery): Promise<T[]> {
    if (!this.isConnected()) {
      throw new Error('MongoDB connection not established');
    }

    const startTime = Date.now();
    this.metrics.queriesExecuted++;

    try {
      const result = await this.executeQuery<T>(query);
      
      const executionTime = Date.now() - startTime;
      this.metrics.totalQueryTime += executionTime;
      
      // Track slow queries (>1 second)
      if (executionTime > 1000) {
        this.metrics.slowQueries++;
        this.logger?.warn('Slow MongoDB query detected', {
          operation: query.operation,
          collection: query.collection,
          executionTime,
        });
      }

      this.logger?.debug('MongoDB query executed', {
        operation: query.operation,
        collection: query.collection,
        executionTime,
        resultCount: Array.isArray(result) ? result.length : 1,
      });

      return Array.isArray(result) ? result : [result];

    } catch (error) {
      this.logger?.error('MongoDB query failed', error, {
        operation: query.operation,
        collection: query.collection,
      });
      throw error;
    }
  }

  async beginTransaction(isolationLevel?: IsolationLevel): Promise<TransactionContext> {
    if (!this.isConnected()) {
      throw new Error('MongoDB connection not established');
    }

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.metrics.activeTransactions++;
    this.connection!.activeTransactions++;

    const context: TransactionContext = {
      id: transactionId,
      isolationLevel: isolationLevel || IsolationLevel.READ_COMMITTED,
      startedAt: new Date(),
      readOnly: false,
      timeout: 30000, // 30 seconds
    };

    this.logger?.debug('MongoDB transaction started', {
      transactionId,
      isolationLevel,
    });

    return context;
  }

  async commitTransaction(context: TransactionContext): Promise<void> {
    this.metrics.activeTransactions--;
    if (this.connection) {
      this.connection.activeTransactions--;
    }

    this.logger?.debug('MongoDB transaction committed', {
      transactionId: context.id,
      duration: Date.now() - context.startedAt.getTime(),
    });
  }

  async rollbackTransaction(context: TransactionContext): Promise<void> {
    this.metrics.activeTransactions--;
    if (this.connection) {
      this.connection.activeTransactions--;
    }

    this.logger?.debug('MongoDB transaction rolled back', {
      transactionId: context.id,
      duration: Date.now() - context.startedAt.getTime(),
    });
  }

  async getHealth(): Promise<{
    connected: boolean;
    responseTime: number;
    activeConnections: number;
    poolSize: number;
  }> {
    const startTime = Date.now();
    
    try {
      // Perform a simple ping operation
      await this.execute({
        operation: QueryOperation.COUNT,
        collection: 'healthcheck',
        filter: {},
      });

      const responseTime = Date.now() - startTime;

      return {
        connected: this.isConnected(),
        responseTime,
        activeConnections: this.connectionPool.length,
        poolSize: this.config?.poolSize || 10,
      };

    } catch (error) {
      return {
        connected: false,
        responseTime: Date.now() - startTime,
        activeConnections: 0,
        poolSize: this.config?.poolSize || 10,
      };
    }
  }

  async getMetrics(): Promise<{
    queriesExecuted: number;
    averageQueryTime: number;
    slowQueries: number;
    connectionErrors: number;
    activeTransactions: number;
  }> {
    return {
      queriesExecuted: this.metrics.queriesExecuted,
      averageQueryTime: this.metrics.queriesExecuted > 0 
        ? this.metrics.totalQueryTime / this.metrics.queriesExecuted 
        : 0,
      slowQueries: this.metrics.slowQueries,
      connectionErrors: this.metrics.connectionErrors,
      activeTransactions: this.metrics.activeTransactions,
    };
  }

  // Helper method to build MongoDB queries from generic query options
  buildQuery(
    operation: QueryOperation,
    collection: string,
    options: {
      filters?: QueryFilter[];
      data?: unknown;
      pipeline?: unknown[];
      sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
      limit?: number;
      skip?: number;
      projection?: string[];
    }
  ): MongoQuery {
    const query: MongoQuery = {
      operation,
      collection,
    };

    // Convert filters to MongoDB filter format
    if (options.filters) {
      query.filter = this.convertFiltersToMongo(options.filters);
    }

    // Set data for insert/update operations
    if (options.data) {
      query.data = options.data;
    }

    // Set pipeline for aggregate operations
    if (options.pipeline) {
      query.pipeline = options.pipeline;
    }

    // Set query options
    query.options = {};

    if (options.sort) {
      query.options.sort = options.sort.reduce((acc, sort) => {
        acc[sort.field] = sort.direction === 'asc' ? 1 : -1;
        return acc;
      }, {} as Record<string, 1 | -1>);
    }

    if (options.limit) {
      query.options.limit = options.limit;
    }

    if (options.skip) {
      query.options.skip = options.skip;
    }

    if (options.projection) {
      query.options.projection = options.projection.reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {} as Record<string, 1 | 0>);
    }

    return query;
  }

  // Private methods

  private async executeQuery<T>(query: MongoQuery): Promise<T[]> {
    const collection = this.getCollection(query.collection);

    switch (query.operation) {
      case QueryOperation.SELECT:
        return this.executeSelect<T>(collection, query);

      case QueryOperation.INSERT:
        return this.executeInsert<T>(collection, query);

      case QueryOperation.UPDATE:
        return this.executeUpdate<T>(collection, query);

      case QueryOperation.DELETE:
        return this.executeDelete<T>(collection, query);

      case QueryOperation.COUNT:
        return this.executeCount<T>(collection, query);

      case QueryOperation.AGGREGATE:
        return this.executeAggregate<T>(collection, query);

      default:
        throw new Error(`Unsupported MongoDB operation: ${query.operation}`);
    }
  }

  private getCollection(name: string): unknown[] {
    if (!this.connection) {
      throw new Error('No MongoDB connection');
    }

    if (!this.connection.collections.has(name)) {
      this.connection.collections.set(name, []);
    }

    return this.connection.collections.get(name)!;
  }

  private async executeSelect<T>(collection: unknown[], query: MongoQuery): Promise<T[]> {
    let results = [...collection] as T[];

    // Apply filters
    if (query.filter) {
      results = results.filter(item => this.matchesFilter(item, query.filter!));
    }

    // Apply sorting
    if (query.options?.sort) {
      results.sort((a, b) => {
        for (const [field, direction] of Object.entries(query.options!.sort!)) {
          const aVal = (a as any)[field];
          const bVal = (b as any)[field];
          
          if (aVal < bVal) return direction === 1 ? -1 : 1;
          if (aVal > bVal) return direction === 1 ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply pagination
    if (query.options?.skip) {
      results = results.slice(query.options.skip);
    }
    
    if (query.options?.limit) {
      results = results.slice(0, query.options.limit);
    }

    // Apply projection
    if (query.options?.projection) {
      results = results.map(item => {
        const projected: any = {};
        for (const [field, include] of Object.entries(query.options!.projection!)) {
          if (include === 1) {
            projected[field] = (item as any)[field];
          }
        }
        return projected;
      });
    }

    return results;
  }

  private async executeInsert<T>(collection: unknown[], query: MongoQuery): Promise<T[]> {
    const data = query.data as T | T[];
    const itemsToInsert = Array.isArray(data) ? data : [data];

    // Add MongoDB-style _id if not present
    const insertedItems = itemsToInsert.map(item => ({
      _id: this.generateObjectId(),
      ...item,
    }));

    collection.push(...insertedItems);
    
    return insertedItems;
  }

  private async executeUpdate<T>(collection: unknown[], query: MongoQuery): Promise<T[]> {
    const updates: T[] = [];

    for (let i = 0; i < collection.length; i++) {
      const item = collection[i];
      
      if (!query.filter || this.matchesFilter(item, query.filter)) {
        // Update the item
        const updated = { ...item, ...query.data };
        collection[i] = updated;
        updates.push(updated as T);
      }
    }

    return updates;
  }

  private async executeDelete<T>(collection: unknown[], query: MongoQuery): Promise<T[]> {
    const deleted: T[] = [];

    for (let i = collection.length - 1; i >= 0; i--) {
      const item = collection[i];
      
      if (!query.filter || this.matchesFilter(item, query.filter)) {
        const deletedItem = collection.splice(i, 1)[0];
        deleted.push(deletedItem as T);
      }
    }

    return deleted.reverse();
  }

  private async executeCount<T>(collection: unknown[], query: MongoQuery): Promise<T[]> {
    let count = collection.length;

    if (query.filter) {
      count = collection.filter(item => this.matchesFilter(item, query.filter!)).length;
    }

    return [{ count } as T];
  }

  private async executeAggregate<T>(collection: unknown[], query: MongoQuery): Promise<T[]> {
    // Simple aggregation implementation
    // In a real implementation, this would handle MongoDB aggregation pipeline
    let results = [...collection];

    if (query.pipeline) {
      for (const stage of query.pipeline as any[]) {
        if (stage.$match) {
          results = results.filter(item => this.matchesFilter(item, stage.$match));
        }
        
        if (stage.$group) {
          // Simple grouping implementation
          const groups = new Map();
          
          for (const item of results) {
            const key = JSON.stringify((item as any)[stage.$group._id]);
            if (!groups.has(key)) {
              groups.set(key, []);
            }
            groups.get(key).push(item);
          }
          
          results = Array.from(groups.values()).map(group => ({
            _id: group[0][(stage.$group._id as string).substring(1)],
            count: group.length,
            ...stage.$group,
          }));
        }
      }
    }

    return results as T[];
  }

  private convertFiltersToMongo(filters: QueryFilter[]): Record<string, unknown> {
    const mongoFilter: Record<string, unknown> = {};

    for (const filter of filters) {
      switch (filter.operator) {
        case 'eq':
          mongoFilter[filter.field] = filter.value;
          break;
        case 'ne':
          mongoFilter[filter.field] = { $ne: filter.value };
          break;
        case 'gt':
          mongoFilter[filter.field] = { $gt: filter.value };
          break;
        case 'gte':
          mongoFilter[filter.field] = { $gte: filter.value };
          break;
        case 'lt':
          mongoFilter[filter.field] = { $lt: filter.value };
          break;
        case 'lte':
          mongoFilter[filter.field] = { $lte: filter.value };
          break;
        case 'in':
          mongoFilter[filter.field] = { $in: filter.value };
          break;
        case 'nin':
          mongoFilter[filter.field] = { $nin: filter.value };
          break;
        case 'regex':
          mongoFilter[filter.field] = { $regex: filter.value };
          break;
        case 'exists':
          mongoFilter[filter.field] = { $exists: filter.value };
          break;
        default:
          mongoFilter[filter.field] = filter.value;
      }
    }

    return mongoFilter;
  }

  private matchesFilter(item: unknown, filter: Record<string, unknown>): boolean {
    for (const [field, condition] of Object.entries(filter)) {
      const value = (item as any)[field];

      if (typeof condition === 'object' && condition !== null) {
        const condObj = condition as Record<string, unknown>;
        
        if ('$ne' in condObj && value === condObj.$ne) return false;
        if ('$gt' in condObj && !(value > condObj.$gt)) return false;
        if ('$gte' in condObj && !(value >= condObj.$gte)) return false;
        if ('$lt' in condObj && !(value < condObj.$lt)) return false;
        if ('$lte' in condObj && !(value <= condObj.$lte)) return false;
        if ('$in' in condObj && !Array.isArray(condObj.$in)) return false;
        if ('$in' in condObj && !(condObj.$in as unknown[]).includes(value)) return false;
        if ('$nin' in condObj && (condObj.$nin as unknown[]).includes(value)) return false;
        if ('$exists' in condObj && (value !== undefined) !== condObj.$exists) return false;
        if ('$regex' in condObj && !new RegExp(condObj.$regex as string).test(String(value))) return false;
        
      } else {
        if (value !== condition) return false;
      }
    }

    return true;
  }

  private generateObjectId(): string {
    return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Example MongoDB Repository implementation
export class MongoBaseRepository<T = unknown> {
  protected dataSource: MongoDataSource;
  protected collectionName: string;

  constructor(dataSource: MongoDataSource, collectionName: string) {
    this.dataSource = dataSource;
    this.collectionName = collectionName;
  }

  async find(filters: QueryFilter[] = [], options: QueryOptions = {}): Promise<T[]> {
    const query = this.dataSource.buildQuery(
      QueryOperation.SELECT,
      this.collectionName,
      {
        filters,
        sort: options.sort,
        limit: options.pagination?.limit,
        skip: options.pagination ? 
          (options.pagination.page - 1) * options.pagination.limit : 
          undefined,
        projection: options.projection,
      }
    );

    const results = await this.dataSource.execute<T>(query);
    return results;
  }

  async findById(id: string): Promise<T | null> {
    const results = await this.find([{ field: '_id', operator: 'eq', value: id }]);
    return results.length > 0 ? results[0] : null;
  }

  async create(data: Partial<T>): Promise<T> {
    const query = this.dataSource.buildQuery(
      QueryOperation.INSERT,
      this.collectionName,
      { data }
    );

    const results = await this.dataSource.execute<T>(query);
    return results[0];
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const query = this.dataSource.buildQuery(
      QueryOperation.UPDATE,
      this.collectionName,
      {
        filters: [{ field: '_id', operator: 'eq', value: id }],
        data,
      }
    );

    const results = await this.dataSource.execute<T>(query);
    return results.length > 0 ? results[0] : null;
  }

  async delete(id: string): Promise<boolean> {
    const query = this.dataSource.buildQuery(
      QueryOperation.DELETE,
      this.collectionName,
      {
        filters: [{ field: '_id', operator: 'eq', value: id }],
      }
    );

    const results = await this.dataSource.execute(query);
    return results.length > 0;
  }

  async count(filters: QueryFilter[] = []): Promise<number> {
    const query = this.dataSource.buildQuery(
      QueryOperation.COUNT,
      this.collectionName,
      { filters }
    );

    const results = await this.dataSource.execute<{ count: number }>(query);
    return results[0]?.count || 0;
  }
}