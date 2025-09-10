/**
 * Redis Data Source - In-memory cache and session store with pub/sub capabilities
 */

import { createClient, RedisClientType } from 'redis';
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
  public readonly type = 'cache';
  public readonly capabilities = [
    'select',
    'search',
    'stream',
  ];

  private client?: RedisClientType;

  constructor(
    config: { 
      url: string;
      password?: string;
      database?: number;
      retryDelayOnFailover?: number;
      maxRetriesPerRequest?: number;
    } = {
      url: 'redis://localhost:6379',
      database: 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    }
  ) {
    super(config);
  }

  protected async performConnect(): Promise<void> {
    this.client = createClient({
      url: this.connectionConfig.url,
      password: this.connectionConfig.password,
      database: this.connectionConfig.database || 0,
    });

    this.client.on('error', (error) => {
      logger.error('Redis client error:', error);
    });

    this.client.on('connect', () => {
      logger.debug('Redis client connected');
    });

    this.client.on('ready', () => {
      logger.debug('Redis client ready');
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
    switch (query.type) {
      case 'select':
        return this.executeSelectQuery(query, context);
      case 'search':
        return this.executeSearchQuery(query, context);
      default:
        throw new Error(`Unsupported query type: ${query.type}`);
    }
  }

  protected async *performStream(
    query: IQuery,
    context: IQueryContext
  ): AsyncIterable<IDataRecord> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const pattern = this.buildKeyPattern(query, context);
    const keys = await this.client.keys(pattern);

    for (const key of keys) {
      const value = await this.client.get(key);
      if (value) {
        try {
          const data = JSON.parse(value as string);
          yield this.transformToDataRecord(data, this.name);
        } catch (error) {
          // Skip invalid JSON
          logger.warn(`Invalid JSON in Redis key ${key}:`, error);
        }
      }
    }
  }

  protected async performHealthCheck(): Promise<IHealthStatus> {
    if (!this.client) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: 0,
        message: 'Not connected to Redis',
      };
    }

    try {
      const startTime = Date.now();
      
      // Test basic connectivity
      const pong = await this.client.ping();
      if (pong !== 'PONG') {
        throw new Error('Redis ping failed');
      }

      // Get Redis info
      const info = await this.client.info();
      const responseTime = Date.now() - startTime;

      // Parse info for useful metrics
      const metrics = this.parseRedisInfo(info);

      return {
        status: 'healthy',
        lastCheck: new Date(),
        responseTime,
        metrics,
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
   * Execute a select query (get keys by pattern)
   */
  private async executeSelectQuery(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const pattern = this.buildKeyPattern(query, context);
    const keys = await this.client.keys(pattern);

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    const paginatedKeys = keys.slice(offset, offset + limit);

    // Get values for keys
    const data: IDataRecord[] = [];
    for (const key of paginatedKeys) {
      const value = await this.client.get(key);
      if (value) {
        try {
          const parsedValue = JSON.parse(value as string);
          data.push(this.transformToDataRecord(parsedValue, this.name, key));
        } catch (error) {
          logger.warn(`Invalid JSON in Redis key ${key}:`, error);
        }
      }
    }

    return {
      data,
      metadata: {
        total: keys.length,
        hasMore: offset + paginatedKeys.length < keys.length,
        executionTime: 0, // Will be set by base class
        source: this.name,
      },
    };
  }

  /**
   * Execute a full-text search query using Redis SCAN
   */
  private async executeSearchQuery(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult> {
    if (!query.searchTerm) {
      throw new Error('Search query requires search term');
    }

    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const searchPattern = `*${query.searchTerm}*`;
    const keys = await this.client.keys(searchPattern);

    // Get values and filter by content
    const data: IDataRecord[] = [];
    const searchTerm = query.searchTerm.toLowerCase();

    for (const key of keys) {
      const value = await this.client.get(key);
      if (value) {
        try {
          const parsedValue = JSON.parse(value as string);
          const recordData = this.transformToDataRecord(parsedValue, this.name, key);
          
          // Check if search term matches in the data
          const dataString = JSON.stringify(recordData.data).toLowerCase();
          if (dataString.includes(searchTerm) || key.toLowerCase().includes(searchTerm)) {
            data.push(recordData);
          }
        } catch (error) {
          logger.warn(`Invalid JSON in Redis key ${key}:`, error);
        }
      }
    }

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    const paginatedData = data.slice(offset, offset + limit);

    return {
      data: paginatedData,
      metadata: {
        total: data.length,
        hasMore: offset + paginatedData.length < data.length,
        executionTime: 0,
        source: this.name,
      },
    };
  }

  /**
   * Build Redis key pattern from query
   */
  private buildKeyPattern(query: IQuery, context: IQueryContext): string {
    const entity = query.entity || 'incident';
    let pattern = `${entity}:*`;

    // Apply filters to pattern if possible
    if (query.filters) {
      if (query.filters.id) {
        pattern = `${entity}:${query.filters.id}`;
      } else if (query.filters.type) {
        pattern = `${entity}:${query.filters.type}:*`;
      }
    }

    return pattern;
  }

  /**
   * Transform Redis value to data record
   */
  protected transformToDataRecord(value: any, source: string, key?: string): IDataRecord {
    return {
      id: value.id || key || this.generateId(),
      type: value.type || 'cached_data',
      source: source,
      timestamp: value.timestamp ? new Date(value.timestamp) : new Date(),
      data: value,
      metadata: value.metadata || { redisKey: key },
      relationships: value.relationships || [],
      provenance: {
        sourceSystem: this.name,
        collectedAt: new Date(),
        transformations: [],
        quality: {
          completeness: 1.0,
          accuracy: 1.0,
          consistency: 1.0,
          timeliness: value.timestamp ? this.calculateTimeliness(new Date(value.timestamp)) : 0.5,
        },
      },
    };
  }

  /**
   * Calculate data timeliness score based on age
   */
  private calculateTimeliness(timestamp: Date): number {
    const now = new Date();
    const ageInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    // Score decreases with age: 1.0 for fresh data, 0.0 for data older than 24 hours
    if (ageInHours <= 1) return 1.0;
    if (ageInHours >= 24) return 0.0;
    return Math.max(0, 1 - (ageInHours / 24));
  }

  /**
   * Parse Redis INFO command output for metrics
   */
  private parseRedisInfo(info: string): Record<string, number> {
    const metrics: Record<string, number> = {};
    const lines = info.split('\r\n');

    for (const line of lines) {
      if (line.includes(':') && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          metrics[key] = numValue;
        }
      }
    }

    return {
      connectedClients: metrics.connected_clients || 0,
      usedMemory: metrics.used_memory || 0,
      usedMemoryPeak: metrics.used_memory_peak || 0,
      totalConnectionsReceived: metrics.total_connections_received || 0,
      totalCommandsProcessed: metrics.total_commands_processed || 0,
      keyspaceHits: metrics.keyspace_hits || 0,
      keyspaceMisses: metrics.keyspace_misses || 0,
      evictedKeys: metrics.evicted_keys || 0,
      expiredKeys: metrics.expired_keys || 0,
    };
  }

  /**
   * Redis-specific utility methods for incident response data
   */

  /**
   * Store incident data with TTL
   */
  async storeIncidentData(
    incidentId: string, 
    data: any, 
    ttlSeconds: number = 3600
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const key = `incident:${incidentId}`;
    const value = JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
      ttl: ttlSeconds,
    });

    await this.client.setEx(key, ttlSeconds, value);
  }

  /**
   * Store session data
   */
  async storeSessionData(
    sessionId: string, 
    data: any, 
    ttlSeconds: number = 1800
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const key = `session:${sessionId}`;
    const value = JSON.stringify(data);

    await this.client.setEx(key, ttlSeconds, value);
  }

  /**
   * Get cached data
   */
  async getCachedData(key: string): Promise<any | null> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const value = await this.client.get(key);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value as string);
    } catch (error) {
      logger.warn(`Invalid JSON in Redis key ${key}:`, error);
      return null;
    }
  }

  /**
   * Store cache data with TTL
   */
  async setCachedData(
    key: string, 
    data: any, 
    ttlSeconds: number = 3600
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const value = JSON.stringify(data);
    await this.client.setEx(key, ttlSeconds, value);
  }

  /**
   * Publish message to channel (for real-time notifications)
   */
  async publishMessage(channel: string, message: any): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    await this.client.publish(channel, messageStr);
  }

  /**
   * Subscribe to channel for real-time updates
   */
  async subscribeToChannel(
    channel: string, 
    callback: (message: string) => void
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    // Create a separate client for subscriptions
    const subscriber = this.client.duplicate();
    await subscriber.connect();

    await subscriber.subscribe(channel, callback);
  }

  /**
   * Store real-time incident updates
   */
  async storeIncidentUpdate(
    incidentId: string, 
    update: any
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const key = `incident:${incidentId}:updates`;
    const updateData = JSON.stringify({
      ...update,
      timestamp: new Date().toISOString(),
    });

    // Store as list for timeline
    await this.client.lPush(key, updateData);
    
    // Keep only last 100 updates
    await this.client.lTrim(key, 0, 99);

    // Also publish to real-time channel
    await this.publishMessage(`incident:${incidentId}:live`, update);
  }

  /**
   * Get incident updates timeline
   */
  async getIncidentUpdates(incidentId: string, limit: number = 50): Promise<any[]> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    const key = `incident:${incidentId}:updates`;
    const updates = await this.client.lRange(key, 0, limit - 1);

    return updates.map(update => {
      try {
        return JSON.parse(update);
      } catch (error) {
        logger.warn(`Invalid JSON in incident update:`, error);
        return null;
      }
    }).filter(update => update !== null);
  }
}