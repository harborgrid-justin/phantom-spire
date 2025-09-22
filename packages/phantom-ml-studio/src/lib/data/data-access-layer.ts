/**
 * Enterprise Data Access Layer
 * Unified abstraction for multi-database operations with transactions, caching, and monitoring
 */

import type { LoggerService } from '..\services\core\LoggerService';
import type { ICache } from '../utils/enterprise-cache';

// Database providers
export enum DatabaseProvider {
  MONGODB = 'mongodb',
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  REDIS = 'redis',
  ELASTICSEARCH = 'elasticsearch',
  SQLITE = 'sqlite',
}

// Query operation types
export enum QueryOperation {
  SELECT = 'select',
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
  AGGREGATE = 'aggregate',
  SEARCH = 'search',
  COUNT = 'count',
}

// Transaction isolation levels
export enum IsolationLevel {
  READ_UNCOMMITTED = 'read_uncommitted',
  READ_COMMITTED = 'read_committed',
  REPEATABLE_READ = 'repeatable_read',
  SERIALIZABLE = 'serializable',
}

// Query filters
export interface QueryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex' | 'exists' | 'like';
  value: unknown;
  logical?: 'and' | 'or';
}

// Sort options
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// Pagination options
export interface PaginationOptions {
  page: number;
  limit: number;
  offset?: number;
}

// Query options
export interface QueryOptions {
  filters?: QueryFilter[];
  sort?: SortOption[];
  pagination?: PaginationOptions;
  projection?: string[];
  joins?: JoinOption[];
  groupBy?: string[];
  having?: QueryFilter[];
  cache?: {
    enabled: boolean;
    ttl?: number;
    key?: string;
  };
  explain?: boolean;
}

// Join options
export interface JoinOption {
  table: string;
  type: 'inner' | 'left' | 'right' | 'full';
  on: {
    local: string;
    foreign: string;
  };
  alias?: string;
}

// Query result
export interface QueryResult<T = unknown> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  executionTime: number;
  fromCache: boolean;
  affectedRows?: number;
  insertedId?: string | number;
  metadata?: Record<string, unknown>;
}

// Transaction context
export interface TransactionContext {
  id: string;
  isolationLevel: IsolationLevel;
  startedAt: Date;
  readOnly: boolean;
  timeout: number;
  metadata?: Record<string, unknown>;
}

// Database connection configuration
export interface ConnectionConfig {
  provider: DatabaseProvider;
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  poolSize?: number;
  connectionTimeout?: number;
  queryTimeout?: number;
  retryAttempts?: number;
  options?: Record<string, unknown>;
}

// Repository interface
export interface IRepository<T = unknown> {
  readonly tableName: string;
  readonly provider: DatabaseProvider;
  
  // Basic CRUD operations
  findById(id: string | number, options?: QueryOptions): Promise<T | null>;
  findOne(filters: QueryFilter[], options?: QueryOptions): Promise<T | null>;
  findMany(filters?: QueryFilter[], options?: QueryOptions): Promise<QueryResult<T>>;
  create(data: Partial<T>, options?: QueryOptions): Promise<T>;
  update(id: string | number, data: Partial<T>, options?: QueryOptions): Promise<T>;
  delete(id: string | number, options?: QueryOptions): Promise<boolean>;
  
  // Bulk operations
  bulkCreate(data: Partial<T>[], options?: QueryOptions): Promise<T[]>;
  bulkUpdate(filters: QueryFilter[], data: Partial<T>, options?: QueryOptions): Promise<number>;
  bulkDelete(filters: QueryFilter[], options?: QueryOptions): Promise<number>;
  
  // Aggregation
  count(filters?: QueryFilter[], options?: QueryOptions): Promise<number>;
  aggregate(pipeline: unknown[], options?: QueryOptions): Promise<unknown[]>;
  
  // Utility methods
  exists(id: string | number): Promise<boolean>;
  validate(data: Partial<T>): Promise<ValidationResult>;
  getSchema(): Promise<SchemaInfo>;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// Schema information
export interface SchemaInfo {
  tableName: string;
  fields: Array<{
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
    unique: boolean;
    index: boolean;
    defaultValue?: unknown;
  }>;
  indexes: Array<{
    name: string;
    fields: string[];
    unique: boolean;
    type: string;
  }>;
  constraints: Array<{
    name: string;
    type: string;
    fields: string[];
    reference?: {
      table: string;
      fields: string[];
    };
  }>;
}

// Abstract repository base class
export abstract class BaseRepository<T = unknown> implements IRepository<T> {
  public abstract readonly tableName: string;
  public abstract readonly provider: DatabaseProvider;
  
  protected readonly dataSource: IDataSource;
  protected readonly cache?: ICache;
  protected readonly logger?: LoggerService;

  constructor(
    dataSource: IDataSource,
    cache?: ICache,
    logger?: LoggerService
  ) {
    this.dataSource = dataSource;
    this.cache = cache;
    this.logger = logger;
  }

  async findById(id: string | number, options: QueryOptions = {}): Promise<T | null> {
    const cacheKey = this.getCacheKey('findById', { id });
    
    // Check cache first
    if (options.cache?.enabled !== false && this.cache) {
      const cached = await this.cache.get<T>(cacheKey);
      if (cached) {
        this.logger?.debug(`Cache hit for findById: ${id}`);
        return cached;
      }
    }

    const filters: QueryFilter[] = [{ field: 'id', operator: 'eq', value: id }];
    const result = await this.findOne(filters, { ...options, cache: { enabled: false } });

    // Cache the result
    if (result && this.cache && options.cache?.enabled !== false) {
      await this.cache.set(cacheKey, result, { 
        ttl: options.cache?.ttl || 300000 // 5 minutes
      });
    }

    return result;
  }

  async findOne(filters: QueryFilter[], options: QueryOptions = {}): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      const query = this.buildQuery(QueryOperation.SELECT, {
        filters,
        ...options,
        pagination: { page: 1, limit: 1 }
      });

      const results = await this.dataSource.execute<T>(query);
      const executionTime = Date.now() - startTime;

      this.logger?.debug(`Query executed: findOne`, {
        table: this.tableName,
        executionTime,
        filters,
      });

      return results.length > 0 ? results[0] : null;

    } catch (error) {
      this.logger?.error(`Error in findOne`, error, {
        table: this.tableName,
        filters,
      });
      throw error;
    }
  }

  async findMany(filters: QueryFilter[] = [], options: QueryOptions = {}): Promise<QueryResult<T>> {
    const startTime = Date.now();
    
    // Generate cache key
    const cacheKey = this.getCacheKey('findMany', { filters, options });
    
    // Check cache
    if (options.cache?.enabled !== false && this.cache) {
      const cached = await this.cache.get<QueryResult<T>>(cacheKey);
      if (cached) {
        this.logger?.debug(`Cache hit for findMany`);
        return { ...cached, fromCache: true };
      }
    }

    try {
      const query = this.buildQuery(QueryOperation.SELECT, { filters, ...options });
      const data = await this.dataSource.execute<T>(query);
      
      // Get total count if needed
      let total: number | undefined;
      if (options.pagination) {
        const countQuery = this.buildQuery(QueryOperation.COUNT, { filters });
        const countResult = await this.dataSource.execute<{ count: number }>(countQuery);
        total = countResult[0]?.count || 0;
      }

      const executionTime = Date.now() - startTime;
      const result: QueryResult<T> = {
        data,
        total,
        page: options.pagination?.page,
        limit: options.pagination?.limit,
        hasNext: options.pagination ? (data.length === options.pagination.limit) : false,
        hasPrev: options.pagination ? (options.pagination.page > 1) : false,
        executionTime,
        fromCache: false,
      };

      // Cache result
      if (this.cache && options.cache?.enabled !== false) {
        await this.cache.set(cacheKey, result, {
          ttl: options.cache?.ttl || 300000,
        });
      }

      this.logger?.debug(`Query executed: findMany`, {
        table: this.tableName,
        executionTime,
        resultCount: data.length,
      });

      return result;

    } catch (error) {
      this.logger?.error(`Error in findMany`, error, {
        table: this.tableName,
        filters,
      });
      throw error;
    }
  }

  async create(data: Partial<T>, options: QueryOptions = {}): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Validate data
      const validation = await this.validate(data);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      const query = this.buildQuery(QueryOperation.INSERT, { data });
      const results = await this.dataSource.execute<T>(query);
      
      const executionTime = Date.now() - startTime;
      const created = results[0];

      // Invalidate related cache entries
      if (this.cache) {
        await this.invalidateCache('create');
      }

      this.logger?.info(`Record created`, {
        table: this.tableName,
        executionTime,
        id: (created as any)?.id,
      });

      return created;

    } catch (error) {
      this.logger?.error(`Error in create`, error, {
        table: this.tableName,
      });
      throw error;
    }
  }

  async update(id: string | number, data: Partial<T>, options: QueryOptions = {}): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Check if record exists
      const existing = await this.findById(id, { cache: { enabled: false } });
      if (!existing) {
        throw new Error(`Record with id ${id} not found`);
      }

      // Validate data
      const validation = await this.validate(data);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      const filters: QueryFilter[] = [{ field: 'id', operator: 'eq', value: id }];
      const query = this.buildQuery(QueryOperation.UPDATE, { filters, data });
      await this.dataSource.execute(query);

      // Get updated record
      const updated = await this.findById(id, { cache: { enabled: false } });
      const executionTime = Date.now() - startTime;

      // Invalidate cache
      if (this.cache) {
        await this.invalidateCache('update', id);
      }

      this.logger?.info(`Record updated`, {
        table: this.tableName,
        executionTime,
        id,
      });

      return updated!;

    } catch (error) {
      this.logger?.error(`Error in update`, error, {
        table: this.tableName,
        id,
      });
      throw error;
    }
  }

  async delete(id: string | number, options: QueryOptions = {}): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // Check if record exists
      const existing = await this.findById(id, { cache: { enabled: false } });
      if (!existing) {
        return false;
      }

      const filters: QueryFilter[] = [{ field: 'id', operator: 'eq', value: id }];
      const query = this.buildQuery(QueryOperation.DELETE, { filters });
      await this.dataSource.execute(query);

      const executionTime = Date.now() - startTime;

      // Invalidate cache
      if (this.cache) {
        await this.invalidateCache('delete', id);
      }

      this.logger?.info(`Record deleted`, {
        table: this.tableName,
        executionTime,
        id,
      });

      return true;

    } catch (error) {
      this.logger?.error(`Error in delete`, error, {
        table: this.tableName,
        id,
      });
      throw error;
    }
  }

  async bulkCreate(data: Partial<T>[], options: QueryOptions = {}): Promise<T[]> {
    const startTime = Date.now();
    
    try {
      // Validate all records
      for (const item of data) {
        const validation = await this.validate(item);
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }
      }

      const query = this.buildQuery(QueryOperation.INSERT, { data });
      const results = await this.dataSource.execute<T>(query);
      
      const executionTime = Date.now() - startTime;

      // Invalidate cache
      if (this.cache) {
        await this.invalidateCache('bulkCreate');
      }

      this.logger?.info(`Bulk create completed`, {
        table: this.tableName,
        executionTime,
        count: results.length,
      });

      return results;

    } catch (error) {
      this.logger?.error(`Error in bulkCreate`, error, {
        table: this.tableName,
        count: data.length,
      });
      throw error;
    }
  }

  async bulkUpdate(filters: QueryFilter[], data: Partial<T>, options: QueryOptions = {}): Promise<number> {
    const startTime = Date.now();
    
    try {
      const query = this.buildQuery(QueryOperation.UPDATE, { filters, data });
      const result = await this.dataSource.execute(query);
      
      const executionTime = Date.now() - startTime;
      const affectedRows = (result as any)?.affectedRows || 0;

      // Invalidate cache
      if (this.cache) {
        await this.invalidateCache('bulkUpdate');
      }

      this.logger?.info(`Bulk update completed`, {
        table: this.tableName,
        executionTime,
        affectedRows,
      });

      return affectedRows;

    } catch (error) {
      this.logger?.error(`Error in bulkUpdate`, error, {
        table: this.tableName,
        filters,
      });
      throw error;
    }
  }

  async bulkDelete(filters: QueryFilter[], options: QueryOptions = {}): Promise<number> {
    const startTime = Date.now();
    
    try {
      const query = this.buildQuery(QueryOperation.DELETE, { filters });
      const result = await this.dataSource.execute(query);
      
      const executionTime = Date.now() - startTime;
      const affectedRows = (result as any)?.affectedRows || 0;

      // Invalidate cache
      if (this.cache) {
        await this.invalidateCache('bulkDelete');
      }

      this.logger?.info(`Bulk delete completed`, {
        table: this.tableName,
        executionTime,
        affectedRows,
      });

      return affectedRows;

    } catch (error) {
      this.logger?.error(`Error in bulkDelete`, error, {
        table: this.tableName,
        filters,
      });
      throw error;
    }
  }

  async count(filters: QueryFilter[] = [], options: QueryOptions = {}): Promise<number> {
    const startTime = Date.now();
    
    try {
      const query = this.buildQuery(QueryOperation.COUNT, { filters });
      const result = await this.dataSource.execute<{ count: number }>(query);
      
      const executionTime = Date.now() - startTime;
      const count = result[0]?.count || 0;

      this.logger?.debug(`Count query executed`, {
        table: this.tableName,
        executionTime,
        count,
      });

      return count;

    } catch (error) {
      this.logger?.error(`Error in count`, error, {
        table: this.tableName,
        filters,
      });
      throw error;
    }
  }

  async aggregate(pipeline: unknown[], options: QueryOptions = {}): Promise<unknown[]> {
    const startTime = Date.now();
    
    try {
      const query = this.buildQuery(QueryOperation.AGGREGATE, { pipeline });
      const results = await this.dataSource.execute(query);
      
      const executionTime = Date.now() - startTime;

      this.logger?.debug(`Aggregate query executed`, {
        table: this.tableName,
        executionTime,
        resultCount: results.length,
      });

      return results;

    } catch (error) {
      this.logger?.error(`Error in aggregate`, error, {
        table: this.tableName,
      });
      throw error;
    }
  }

  async exists(id: string | number): Promise<boolean> {
    const count = await this.count([{ field: 'id', operator: 'eq', value: id }]);
    return count > 0;
  }

  async validate(data: Partial<T>): Promise<ValidationResult> {
    // Basic validation - override in subclasses for specific validation
    const errors: ValidationResult['errors'] = [];
    
    // Check required fields based on schema
    const schema = await this.getSchema();
    
    for (const field of schema.fields) {
      if (!field.nullable && !(field.name in data)) {
        errors.push({
          field: field.name,
          message: `Field '${field.name}' is required`,
          code: 'REQUIRED_FIELD_MISSING',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async getSchema(): Promise<SchemaInfo> {
    // Default implementation - override in subclasses
    return {
      tableName: this.tableName,
      fields: [],
      indexes: [],
      constraints: [],
    };
  }

  // Protected helper methods

  protected buildQuery(operation: QueryOperation, options: any): any {
    // This should be implemented by provider-specific repositories
    throw new Error('buildQuery must be implemented by subclass');
  }

  protected getCacheKey(operation: string, params: Record<string, unknown>): string {
    const paramStr = JSON.stringify(params);
    return `${this.tableName}:${operation}:${Buffer.from(paramStr).toString('base64')}`;
  }

  protected async invalidateCache(operation: string, id?: string | number): Promise<void> {
    if (!this.cache) return;

    // Invalidate specific patterns based on operation
    const patterns = [
      `${this.tableName}:findMany:*`,
      `${this.tableName}:count:*`,
    ];

    if (id) {
      patterns.push(`${this.tableName}:findById:*${id}*`);
    }

    for (const pattern of patterns) {
      await this.cache.clear(pattern);
    }
  }
}

// Data source interface
export interface IDataSource {
  readonly provider: DatabaseProvider;
  
  connect(config: ConnectionConfig): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  execute<T = unknown>(query: any): Promise<T[]>;
  beginTransaction(isolationLevel?: IsolationLevel): Promise<TransactionContext>;
  commitTransaction(context: TransactionContext): Promise<void>;
  rollbackTransaction(context: TransactionContext): Promise<void>;
  
  getHealth(): Promise<{
    connected: boolean;
    responseTime: number;
    activeConnections: number;
    poolSize: number;
  }>;
  
  getMetrics(): Promise<{
    queriesExecuted: number;
    averageQueryTime: number;
    slowQueries: number;
    connectionErrors: number;
    activeTransactions: number;
  }>;
}

// Unit of Work pattern for transaction management
export class UnitOfWork {
  private repositories = new Map<string, BaseRepository>();
  private transactionContext?: TransactionContext;
  private operations: Array<{
    repository: BaseRepository;
    operation: string;
    args: any[];
  }> = [];

  constructor(private readonly dataSource: IDataSource) {}

  // Register repository
  registerRepository<T>(repository: BaseRepository<T>): void {
    this.repositories.set(repository.tableName, repository);
  }

  // Get repository
  getRepository<T>(tableName: string): BaseRepository<T> | undefined {
    return this.repositories.get(tableName) as BaseRepository<T>;
  }

  // Begin transaction
  async begin(isolationLevel: IsolationLevel = IsolationLevel.READ_COMMITTED): Promise<void> {
    if (this.transactionContext) {
      throw new Error('Transaction already active');
    }
    
    this.transactionContext = await this.dataSource.beginTransaction(isolationLevel);
    this.operations = [];
  }

  // Add operation to transaction
  addOperation(repository: BaseRepository, operation: string, args: any[]): void {
    if (!this.transactionContext) {
      throw new Error('No active transaction');
    }

    this.operations.push({ repository, operation, args });
  }

  // Commit transaction
  async commit(): Promise<void> {
    if (!this.transactionContext) {
      throw new Error('No active transaction');
    }

    try {
      // Execute all operations
      for (const { repository, operation, args } of this.operations) {
        await (repository as any)[operation](...args);
      }

      // Commit transaction
      await this.dataSource.commitTransaction(this.transactionContext);
      
    } catch (error) {
      // Rollback on error
      await this.rollback();
      throw error;
      
    } finally {
      this.transactionContext = undefined;
      this.operations = [];
    }
  }

  // Rollback transaction
  async rollback(): Promise<void> {
    if (!this.transactionContext) {
      throw new Error('No active transaction');
    }

    try {
      await this.dataSource.rollbackTransaction(this.transactionContext);
    } finally {
      this.transactionContext = undefined;
      this.operations = [];
    }
  }

  // Execute with transaction
  async executeInTransaction<T>(
    fn: (uow: UnitOfWork) => Promise<T>,
    isolationLevel: IsolationLevel = IsolationLevel.READ_COMMITTED
  ): Promise<T> {
    await this.begin(isolationLevel);
    
    try {
      const result = await fn(this);
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }
}

// Data Access Layer Manager
export class DataAccessManager {
  private static instance: DataAccessManager;
  private dataSources = new Map<string, IDataSource>();
  private repositories = new Map<string, BaseRepository>();
  private logger?: LoggerService;

  private constructor(logger?: LoggerService) {
    this.logger = logger;
  }

  static getInstance(logger?: LoggerService): DataAccessManager {
    if (!DataAccessManager.instance) {
      DataAccessManager.instance = new DataAccessManager(logger);
    }
    return DataAccessManager.instance;
  }

  // Register data source
  registerDataSource(name: string, dataSource: IDataSource): void {
    this.dataSources.set(name, dataSource);
    this.logger?.info(`Data source registered: ${name} (${dataSource.provider})`);
  }

  // Get data source
  getDataSource(name: string): IDataSource | undefined {
    return this.dataSources.get(name);
  }

  // Register repository
  registerRepository<T>(repository: BaseRepository<T>): void {
    this.repositories.set(repository.tableName, repository);
    this.logger?.info(`Repository registered: ${repository.tableName} (${repository.provider})`);
  }

  // Get repository
  getRepository<T>(tableName: string): BaseRepository<T> | undefined {
    return this.repositories.get(tableName) as BaseRepository<T>;
  }

  // Create unit of work
  createUnitOfWork(dataSourceName: string): UnitOfWork {
    const dataSource = this.getDataSource(dataSourceName);
    if (!dataSource) {
      throw new Error(`Data source '${dataSourceName}' not found`);
    }

    const uow = new UnitOfWork(dataSource);
    
    // Register all repositories that use this data source
    for (const repository of this.repositories.values()) {
      if (repository.provider === dataSource.provider) {
        uow.registerRepository(repository);
      }
    }

    return uow;
  }

  // Health check for all data sources
  async getHealth(): Promise<Record<string, any>> {
    const health: Record<string, any> = {};

    for (const [name, dataSource] of this.dataSources) {
      try {
        health[name] = await dataSource.getHealth();
      } catch (error) {
        health[name] = {
          connected: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    return health;
  }

  // Get metrics for all data sources
  async getMetrics(): Promise<Record<string, any>> {
    const metrics: Record<string, any> = {};

    for (const [name, dataSource] of this.dataSources) {
      try {
        metrics[name] = await dataSource.getMetrics();
      } catch (error) {
        metrics[name] = {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    return metrics;
  }

  // Disconnect all data sources
  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.dataSources.values()).map(ds => ds.disconnect());
    await Promise.allSettled(disconnectPromises);
    this.logger?.info('All data sources disconnected');
  }
}

// Export singleton instance
export const dataAccessManager = DataAccessManager.getInstance();

// Export types and classes
export {
  DatabaseProvider,
  QueryOperation,
  IsolationLevel,
  type IRepository,
  type IDataSource,
  type QueryFilter,
  type QueryOptions,
  type QueryResult,
  type TransactionContext,
  BaseRepository,
  UnitOfWork,
};