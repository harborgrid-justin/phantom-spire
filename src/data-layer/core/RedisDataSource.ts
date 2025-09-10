/**
 * Redis Data Source - High-performance key-value and search capabilities
 */

import Redis from 'redis';
import { BaseDataSource } from './BaseDataSource.js';
import {
  IDataRecord,
  IQuery,
  IQueryContext,
  IQueryResult,
  IHealthStatus,
} from '../interfaces/IDataSource.js';
import { logger } from '../../utils/logger.js';

export class RedisDataSource extends BaseDataSource {
  public readonly name = 'Redis';
  public readonly type = 'key-value';
  public readonly capabilities = [
    'select',
    'search',
    'stream',
    'cache',
    'pubsub',
  ];

  private client?: Redis.RedisClientType;

  constructor(
    config: { 
      url: string; 
      keyPrefix?: string;
      database?: number;
    } = {
      url: 'redis://localhost:6379',
      keyPrefix: 'phantom-spire:',
      database: 0,
    }
  ) {
    super(config);
  }

  protected async performConnect(): Promise<void> {
    this.client = Redis.createClient({ 
      url: this.connectionConfig.url,
      database: this.connectionConfig.database || 0,
    });

    await this.client.connect();
  }

  protected async performDisconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = undefined;
    }
  }

  protected async performQuery(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const keyPrefix = this.connectionConfig.keyPrefix || 'phantom-spire:';
    
    switch (query.type) {
      case 'select':
        return await this.handleSelectQuery(query, keyPrefix);
      case 'search':
        return await this.handleSearchQuery(query, keyPrefix);
      default:
        throw new Error(`Query type ${query.type} not supported by Redis data source`);
    }
  }

  private async handleSelectQuery(query: IQuery, keyPrefix: string): Promise<IQueryResult> {
    const data: IDataRecord[] = [];
    
    if (query.entity && query.filters?.id) {
      // Direct key lookup
      const key = `${keyPrefix}${query.entity}:${query.filters.id}`;
      const value = await this.client!.get(key);
      
      if (value) {
        const parsedData = JSON.parse(value);
        data.push(this.transformToDataRecord(parsedData, 'Redis'));
      }
    } else if (query.entity) {
      // Pattern-based search
      const pattern = `${keyPrefix}${query.entity}:*`;
      const keys = await this.client!.keys(pattern);
      
      const limit = query.limit || 100;
      const offset = query.offset || 0;
      const paginatedKeys = keys.slice(offset, offset + limit);
      
      for (const key of paginatedKeys) {
        const value = await this.client!.get(key);
        if (value) {
          const parsedData = JSON.parse(value);
          data.push(this.transformToDataRecord(parsedData, 'Redis'));
        }
      }
    }

    return {
      data,
      metadata: {
        total: data.length,
        hasMore: false,
        executionTime: 0,
        source: this.name,
      },
    };
  }

  private async handleSearchQuery(query: IQuery, keyPrefix: string): Promise<IQueryResult> {
    const data: IDataRecord[] = [];
    
    // Use Redis search capabilities if available, otherwise fall back to pattern matching
    if (query.searchTerm) {
      const pattern = `${keyPrefix}*${query.searchTerm}*`;
      const keys = await this.client!.keys(pattern);
      
      for (const key of keys) {
        const value = await this.client!.get(key);
        if (value) {
          const parsedData = JSON.parse(value);
          data.push(this.transformToDataRecord(parsedData, 'Redis'));
        }
      }
    }

    return {
      data,
      metadata: {
        total: data.length,
        hasMore: false,
        executionTime: 0,
        source: this.name,
      },
    };
  }

  protected async *performStream(
    query: IQuery,
    context: IQueryContext
  ): AsyncIterable<IDataRecord> {
    const result = await this.performQuery(query, context);
    for (const record of result.data) {
      yield record;
    }
  }

  protected async performHealthCheck(): Promise<IHealthStatus> {
    try {
      if (!this.client) {
        return {
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: 0,
          message: 'Redis client not connected',
        };
      }

      const startTime = Date.now();
      await this.client.ping();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        lastCheck: new Date(),
        responseTime,
        message: 'Redis connection successful',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: 0,
        message: (error as Error).message,
      };
    }
  }

  /**
   * Store data in Redis
   */
  public async store(entity: string, id: string, data: any, ttl?: number): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const keyPrefix = this.connectionConfig.keyPrefix || 'phantom-spire:';
    const key = `${keyPrefix}${entity}:${id}`;
    const value = JSON.stringify(data);

    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Delete data from Redis
   */
  public async delete(entity: string, id: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const keyPrefix = this.connectionConfig.keyPrefix || 'phantom-spire:';
    const key = `${keyPrefix}${entity}:${id}`;
    const result = await this.client.del(key);
    return result > 0;
  }
}