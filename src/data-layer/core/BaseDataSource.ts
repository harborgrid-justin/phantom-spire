/**
 * Abstract Base Data Source - Foundation for all data sources
 */

import { logger } from '../../utils/logger.js';
import {
  IDataSource,
  IDataRecord,
  IQuery,
  IQueryContext,
  IQueryResult,
  IHealthStatus,
} from '../interfaces/IDataSource.js';

export abstract class BaseDataSource implements IDataSource {
  public abstract readonly name: string;
  public abstract readonly type: string;
  public abstract readonly capabilities: string[];

  protected connected: boolean = false;
  protected lastHealthCheck?: IHealthStatus;
  protected connectionConfig: Record<string, any> = {};

  constructor(config: Record<string, any> = {}) {
    this.connectionConfig = config;
  }

  /**
   * Initialize and connect to the data source
   */
  public async connect(): Promise<void> {
    try {
      await this.performConnect();
      this.connected = true;
      logger.info(`Connected to data source: ${this.name}`);
    } catch (error) {
      logger.error(`Failed to connect to data source: ${this.name}`, error);
      throw error;
    }
  }

  /**
   * Disconnect from the data source
   */
  public async disconnect(): Promise<void> {
    try {
      await this.performDisconnect();
      this.connected = false;
      logger.info(`Disconnected from data source: ${this.name}`);
    } catch (error) {
      logger.error(
        `Failed to disconnect from data source: ${this.name}`,
        error
      );
      throw error;
    }
  }

  /**
   * Execute a query against the data source
   */
  public async query(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult> {
    if (!this.connected) {
      throw new Error(`Data source ${this.name} is not connected`);
    }

    const startTime = Date.now();

    try {
      // Validate query
      this.validateQuery(query);

      // Apply security filters based on context
      const secureQuery = this.applySecurityFilters(query, context);

      // Execute the query
      const result = await this.performQuery(secureQuery, context);

      // Add execution metadata
      result.metadata.executionTime = Date.now() - startTime;
      result.metadata.source = this.name;

      logger.debug(`Query executed on ${this.name}`, {
        executionTime: result.metadata.executionTime,
        resultCount: result.data.length,
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(`Query failed on ${this.name}`, {
        error: (error as Error).message,
        executionTime,
        query: JSON.stringify(query),
      });
      throw error;
    }
  }

  /**
   * Stream data from the data source
   */
  public async *stream(
    query: IQuery,
    context: IQueryContext
  ): AsyncIterable<IDataRecord> {
    if (!this.connected) {
      throw new Error(`Data source ${this.name} is not connected`);
    }

    // Validate query
    this.validateQuery(query);

    // Apply security filters
    const secureQuery = this.applySecurityFilters(query, context);

    // Start streaming
    yield* this.performStream(secureQuery, context);
  }

  /**
   * Check the health status of the data source
   */
  public async healthCheck(): Promise<IHealthStatus> {
    const startTime = Date.now();

    try {
      const status = await this.performHealthCheck();
      status.lastCheck = new Date();
      status.responseTime = Date.now() - startTime;

      this.lastHealthCheck = status;
      return status;
    } catch (error) {
      const status: IHealthStatus = {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        message: (error as Error).message,
      };

      this.lastHealthCheck = status;
      return status;
    }
  }

  /**
   * Get the last known health status
   */
  public getLastHealthStatus(): IHealthStatus | undefined {
    return this.lastHealthCheck;
  }

  /**
   * Check if the data source is connected
   */
  public isConnected(): boolean {
    return this.connected;
  }

  // Abstract methods to be implemented by concrete classes
  protected abstract performConnect(): Promise<void>;
  protected abstract performDisconnect(): Promise<void>;
  protected abstract performQuery(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult>;
  protected abstract performStream(
    query: IQuery,
    context: IQueryContext
  ): AsyncIterable<IDataRecord>;
  protected abstract performHealthCheck(): Promise<IHealthStatus>;

  /**
   * Validate query structure and parameters
   */
  protected validateQuery(query: IQuery): void {
    if (!query.type) {
      throw new Error('Query type is required');
    }

    if (!['select', 'aggregate', 'graph', 'search'].includes(query.type)) {
      throw new Error(`Invalid query type: ${query.type}`);
    }

    if (query.limit && (query.limit < 1 || query.limit > 10000)) {
      throw new Error('Query limit must be between 1 and 10000');
    }

    if (query.offset && query.offset < 0) {
      throw new Error('Query offset must be non-negative');
    }
  }

  /**
   * Apply security filters based on user context
   */
  protected applySecurityFilters(
    query: IQuery,
    context: IQueryContext
  ): IQuery {
    const secureQuery = { ...query };

    // Add user-based filters
    if (!secureQuery.filters) {
      secureQuery.filters = {};
    }

    // Apply time-based restrictions if specified
    if (context.timeRange) {
      secureQuery.filters.timestamp = {
        $gte: context.timeRange.start,
        $lte: context.timeRange.end,
      };
    }

    // Apply permission-based filters
    if (context.filters) {
      secureQuery.filters = { ...secureQuery.filters, ...context.filters };
    }

    return secureQuery;
  }

  /**
   * Transform raw data into standardized format
   */
  protected transformToDataRecord(rawData: any, source: string): IDataRecord {
    return {
      id: rawData.id || rawData._id?.toString() || this.generateId(),
      type: rawData.type || 'unknown',
      source: source,
      timestamp: rawData.timestamp || rawData.createdAt || new Date(),
      data: rawData,
      metadata: rawData.metadata || {},
      relationships: rawData.relationships || [],
      provenance: {
        sourceSystem: this.name,
        collectedAt: new Date(),
        transformations: [],
        quality: {
          completeness: 1.0,
          accuracy: 1.0,
          consistency: 1.0,
          timeliness: 1.0,
        },
      },
    };
  }

  /**
   * Generate a unique ID for records without one
   */
  protected generateId(): string {
    return `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
