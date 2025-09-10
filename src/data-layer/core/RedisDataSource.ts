/**
 * Redis Data Source for Phantom CVE Core Plugin
 * High-performance caching and real-time data storage for business SaaS readiness
 */

import { createClient, RedisClientType } from 'redis';
import { logger } from '../../utils/logger.js';
import { BaseDataSource } from './BaseDataSource.js';
import {
  IDataRecord,
  IQuery,
  IQueryContext,
  IQueryResult,
  IHealthStatus,
} from '../interfaces/IDataSource.js';

export interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  database?: number;
  keyPrefix?: string;
  ttl?: number; // Default TTL in seconds
}

/**
 * Redis Data Source for CVE data caching and real-time operations
 */
export class RedisDataSource extends BaseDataSource {
  public readonly name = 'redis-cve-cache';
  public readonly type = 'nosql-cache';
  public readonly capabilities = [
    'cache',
    'real-time',
    'pub-sub',
    'key-value',
    'expiration',
    'atomic-operations',
  ];

  private client: RedisClientType;
  private config: RedisConfig;
  private defaultTTL: number;
  private keyPrefix: string;

  constructor(config: RedisConfig = {}) {
    super(config);
    this.config = {
      host: 'localhost',
      port: 6379,
      database: 0,
      keyPrefix: 'phantom:cve:',
      ttl: 3600, // 1 hour default
      ...config,
    };
    
    this.defaultTTL = this.config.ttl!;
    this.keyPrefix = this.config.keyPrefix!;

    // Create Redis client
    const clientConfig: any = {};
    
    if (this.config.url) {
      clientConfig.url = this.config.url;
    } else {
      clientConfig.socket = {
        host: this.config.host,
        port: this.config.port,
      };
    }
    
    if (this.config.password) {
      clientConfig.password = this.config.password;
    }
    
    if (this.config.database) {
      clientConfig.database = this.config.database;
    }

    this.client = createClient(clientConfig);

    // Setup error handling
    this.client.on('error', (error) => {
      logger.error('Redis client error', { error: error.message });
    });

    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.client.on('disconnect', () => {
      logger.warn('Redis client disconnected');
    });
  }

  /**
   * Connect to Redis
   */
  protected async performConnect(): Promise<void> {
    try {
      await this.client.connect();
      logger.info(`Connected to Redis: ${this.config.host}:${this.config.port}`);
    } catch (error) {
      logger.error('Failed to connect to Redis', error);
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  protected async performDisconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      logger.info('Disconnected from Redis');
    } catch (error) {
      logger.error('Failed to disconnect from Redis', error);
      throw error;
    }
  }

  /**
   * Execute query against Redis
   */
  protected async performQuery(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult> {
    const startTime = Date.now();

    try {
      let data: IDataRecord[] = [];
      const metadata: any = {
        source: this.name,
        queryType: query.type,
        executionTime: 0,
      };

      switch (query.type) {
        case 'select':
          data = await this.handleSelectQuery(query, context);
          break;
        case 'search':
          data = await this.handleSearchQuery(query, context);
          break;
        case 'aggregate':
          data = await this.handleAggregateQuery(query, context);
          break;
        default:
          throw new Error(`Unsupported query type: ${query.type}`);
      }

      // Apply pagination if specified
      if (query.limit || query.offset) {
        const offset = query.offset || 0;
        const limit = query.limit || data.length;
        data = data.slice(offset, offset + limit);
      }

      metadata.executionTime = Date.now() - startTime;
      metadata.resultCount = data.length;

      return {
        data,
        metadata,
        relationships: [],
      };
    } catch (error) {
      logger.error('Redis query execution failed', {
        error: (error as Error).message,
        query: JSON.stringify(query),
      });
      throw error;
    }
  }

  /**
   * Stream data from Redis (limited streaming support)
   */
  protected async *performStream(
    query: IQuery,
    context: IQueryContext
  ): AsyncIterable<IDataRecord> {
    // For key-value stores like Redis, streaming is typically scan-based
    if (query.type === 'scan') {
      const pattern = query.filters?.pattern || `${this.keyPrefix}*`;
      const scanIterator = this.client.scanIterator({
        MATCH: pattern,
        COUNT: query.limit || 100,
      });

      for await (const key of scanIterator) {
        try {
          const data = await this.client.get(key);
          if (data) {
            const parsed = JSON.parse(data);
            yield this.transformToDataRecord(parsed, key);
          }
        } catch (error) {
          logger.warn(`Failed to retrieve data for key: ${key}`, error);
        }
      }
    } else {
      // For other query types, fall back to regular query and yield results
      const result = await this.performQuery(query, context);
      for (const record of result.data) {
        yield record;
      }
    }
  }

  /**
   * Perform health check
   */
  protected async performHealthCheck(): Promise<IHealthStatus> {
    try {
      const pingResult = await this.client.ping();
      
      if (pingResult === 'PONG') {
        const info = await this.client.info('memory');
        const memoryUsage = this.parseMemoryInfo(info);
        
        return {
          status: 'healthy',
          lastCheck: new Date(),
          responseTime: 0, // Will be set by base class
          details: {
            ping: pingResult,
            memoryUsage,
            keyCount: await this.getKeyCount(),
          },
        };
      } else {
        return {
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: 0,
          message: 'Ping failed',
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: 0,
        message: (error as Error).message,
      };
    }
  }

  // CVE-specific Redis operations

  /**
   * Store CVE data in Redis with TTL
   */
  public async storeCVE(cve: any, ttl?: number): Promise<void> {
    const key = this.buildCVEKey(cve.id || cve.cveId);
    const data = JSON.stringify(cve);
    const expiration = ttl || this.defaultTTL;

    await this.client.setEx(key, expiration, data);
    
    // Store in CVE index for searching
    await this.indexCVE(cve);
    
    logger.debug(`Stored CVE in Redis: ${key}`, { ttl: expiration });
  }

  /**
   * Retrieve CVE by ID
   */
  public async getCVE(cveId: string): Promise<any | null> {
    const key = this.buildCVEKey(cveId);
    const data = await this.client.get(key);
    
    if (data) {
      return JSON.parse(data);
    }
    
    return null;
  }

  /**
   * Delete CVE from Redis
   */
  public async deleteCVE(cveId: string): Promise<boolean> {
    const key = this.buildCVEKey(cveId);
    const result = await this.client.del(key);
    
    // Remove from indexes
    await this.removeFromIndexes(cveId);
    
    return result > 0;
  }

  /**
   * Search CVEs by various criteria
   */
  public async searchCVEs(criteria: any): Promise<any[]> {
    const results: any[] = [];
    
    if (criteria.severity) {
      const severityKey = `${this.keyPrefix}idx:severity:${criteria.severity}`;
      const cveIds = await this.client.sMembers(severityKey);
      
      for (const cveId of cveIds) {
        const cve = await this.getCVE(cveId);
        if (cve) {
          results.push(cve);
        }
      }
    } else {
      // Fallback to scanning all CVE keys
      const pattern = `${this.keyPrefix}cve:*`;
      const scanIterator = this.client.scanIterator({ MATCH: pattern });
      
      for await (const key of scanIterator) {
        const data = await this.client.get(key);
        if (data) {
          const cve = JSON.parse(data);
          if (this.matchesCriteria(cve, criteria)) {
            results.push(cve);
          }
        }
      }
    }
    
    return results;
  }

  /**
   * Cache CVE statistics
   */
  public async cacheCVEStats(stats: any, ttl?: number): Promise<void> {
    const key = `${this.keyPrefix}stats:global`;
    const data = JSON.stringify({
      ...stats,
      lastUpdated: new Date().toISOString(),
    });
    
    await this.client.setEx(key, ttl || 300, data); // 5 minutes default for stats
  }

  /**
   * Get cached CVE statistics
   */
  public async getCachedCVEStats(): Promise<any | null> {
    const key = `${this.keyPrefix}stats:global`;
    const data = await this.client.get(key);
    
    return data ? JSON.parse(data) : null;
  }

  /**
   * Publish CVE update notification
   */
  public async publishCVEUpdate(cveId: string, updateType: string, data: any): Promise<void> {
    const channel = `${this.keyPrefix}updates`;
    const message = JSON.stringify({
      cveId,
      updateType,
      data,
      timestamp: new Date().toISOString(),
    });
    
    await this.client.publish(channel, message);
  }

  /**
   * Subscribe to CVE updates
   */
  public async subscribeToCVEUpdates(callback: (message: any) => void): Promise<void> {
    const subscriber = this.client.duplicate();
    await subscriber.connect();
    
    await subscriber.subscribe(`${this.keyPrefix}updates`, (message) => {
      try {
        const parsed = JSON.parse(message);
        callback(parsed);
      } catch (error) {
        logger.error('Failed to parse CVE update message', error);
      }
    });
  }

  // Private helper methods

  private async handleSelectQuery(query: IQuery, context: IQueryContext): Promise<IDataRecord[]> {
    const data: IDataRecord[] = [];
    
    if (query.filters?.id) {
      const cve = await this.getCVE(query.filters.id);
      if (cve) {
        data.push(this.transformToDataRecord(cve, cve.id));
      }
    } else if (query.filters?.ids) {
      for (const id of query.filters.ids) {
        const cve = await this.getCVE(id);
        if (cve) {
          data.push(this.transformToDataRecord(cve, cve.id));
        }
      }
    } else {
      // Scan all CVEs
      const pattern = `${this.keyPrefix}cve:*`;
      const scanIterator = this.client.scanIterator({
        MATCH: pattern,
        COUNT: query.limit || 100,
      });
      
      for await (const key of scanIterator) {
        const cveData = await this.client.get(key);
        if (cveData) {
          const cve = JSON.parse(cveData);
          data.push(this.transformToDataRecord(cve, cve.id));
        }
      }
    }
    
    return data;
  }

  private async handleSearchQuery(query: IQuery, context: IQueryContext): Promise<IDataRecord[]> {
    const searchCriteria = query.filters || {};
    const cves = await this.searchCVEs(searchCriteria);
    
    return cves.map(cve => this.transformToDataRecord(cve, cve.id));
  }

  private async handleAggregateQuery(query: IQuery, context: IQueryContext): Promise<IDataRecord[]> {
    // Simple aggregation support - could be extended
    const stats = await this.getCachedCVEStats();
    
    if (stats) {
      return [this.transformToDataRecord(stats, 'cve-stats')];
    }
    
    return [];
  }

  private buildCVEKey(cveId: string): string {
    return `${this.keyPrefix}cve:${cveId}`;
  }

  private async indexCVE(cve: any): Promise<void> {
    // Index by severity
    if (cve.scoring?.severity) {
      const severityKey = `${this.keyPrefix}idx:severity:${cve.scoring.severity}`;
      await this.client.sAdd(severityKey, cve.id || cve.cveId);
    }
    
    // Index by status
    if (cve.workflow?.status) {
      const statusKey = `${this.keyPrefix}idx:status:${cve.workflow.status}`;
      await this.client.sAdd(statusKey, cve.id || cve.cveId);
    }
    
    // Index by tags
    if (cve.tags && Array.isArray(cve.tags)) {
      for (const tag of cve.tags) {
        const tagKey = `${this.keyPrefix}idx:tag:${tag}`;
        await this.client.sAdd(tagKey, cve.id || cve.cveId);
      }
    }
  }

  private async removeFromIndexes(cveId: string): Promise<void> {
    // Remove from all severity indexes
    const severityKeys = await this.client.keys(`${this.keyPrefix}idx:severity:*`);
    for (const key of severityKeys) {
      await this.client.sRem(key, cveId);
    }
    
    // Remove from all status indexes
    const statusKeys = await this.client.keys(`${this.keyPrefix}idx:status:*`);
    for (const key of statusKeys) {
      await this.client.sRem(key, cveId);
    }
    
    // Remove from all tag indexes
    const tagKeys = await this.client.keys(`${this.keyPrefix}idx:tag:*`);
    for (const key of tagKeys) {
      await this.client.sRem(key, cveId);
    }
  }

  private matchesCriteria(cve: any, criteria: any): boolean {
    // Simple criteria matching - could be enhanced
    for (const [key, value] of Object.entries(criteria)) {
      switch (key) {
        case 'severity':
          if (cve.scoring?.severity !== value) return false;
          break;
        case 'status':
          if (cve.workflow?.status !== value) return false;
          break;
        case 'exploitAvailable':
          if (cve.exploitInfo?.exploitAvailable !== value) return false;
          break;
        default:
          if (cve[key] !== value) return false;
      }
    }
    return true;
  }

  private parseMemoryInfo(info: string): any {
    const lines = info.split('\r\n');
    const memory: any = {};
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        if (key.includes('memory')) {
          memory[key] = value;
        }
      }
    }
    
    return memory;
  }

  private async getKeyCount(): Promise<number> {
    try {
      const info = await this.client.info('keyspace');
      const lines = info.split('\r\n');
      
      for (const line of lines) {
        if (line.startsWith(`db${this.config.database}:`)) {
          const match = line.match(/keys=(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }
      }
      
      return 0;
    } catch (error) {
      logger.warn('Failed to get key count', error);
      return 0;
    }
  }

  protected transformToDataRecord(rawData: any, source: string): IDataRecord {
    return {
      id: rawData.id || rawData.cveId || source,
      type: rawData.type || 'cve',
      source: this.name,
      timestamp: rawData.timestamp || rawData.createdAt || rawData.publishedDate || new Date(),
      data: rawData,
      metadata: {
        cached: true,
        ttl: this.defaultTTL,
        keyPrefix: this.keyPrefix,
        ...(rawData.metadata || {}),
      },
      relationships: rawData.relationships || [],
      provenance: {
        sourceSystem: this.name,
        collectedAt: new Date(),
        transformations: ['redis-cache'],
        quality: {
          completeness: 1.0,
          accuracy: 1.0,
          consistency: 1.0,
          timeliness: 1.0,
        },
      },
    };
  }
}