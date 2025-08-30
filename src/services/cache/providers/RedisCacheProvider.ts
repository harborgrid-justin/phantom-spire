/**
 * Redis Cache Provider
 * Distributed cache using Redis for high-performance caching
 */

import Redis from 'redis';
import { EventEmitter } from 'events';
import { ICacheProvider, ICacheMetrics } from '../interfaces/ICacheManager';
import { logger } from '../../../utils/logger';

export class RedisCacheProvider extends EventEmitter implements ICacheProvider {
  private client: Redis.RedisClientType;
  private isConnected: boolean = false;
  private keyPrefix: string;
  private metrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0
  };

  constructor(redisUrl: string, keyPrefix: string = 'phantomspire:cache:') {
    super();
    this.keyPrefix = keyPrefix;
    this.client = Redis.createClient({ url: redisUrl });
    
    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis cache provider connected');
      this.emit('connected');
    });

    this.client.on('error', (error) => {
      this.metrics.errors++;
      logger.error('Redis cache provider error:', error);
      this.emit('error', error);
    });

    this.client.on('disconnect', () => {
      this.isConnected = false;
      logger.warn('Redis cache provider disconnected');
      this.emit('disconnected');
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const value = await this.client.get(this.getKey(key));
      
      if (value === null) {
        this.metrics.misses++;
        this.emit('miss', { key });
        return null;
      }

      this.metrics.hits++;
      this.emit('hit', { key });
      
      try {
        return JSON.parse(value) as T;
      } catch {
        // If JSON parse fails, return as string
        return value as unknown as T;
      }
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis get error:', error);
      throw error;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      const redisKey = this.getKey(key);

      if (ttl && ttl > 0) {
        await this.client.setEx(redisKey, Math.floor(ttl / 1000), serializedValue);
      } else {
        await this.client.set(redisKey, serializedValue);
      }

      this.metrics.sets++;
      this.emit('set', { key, value, ttl });
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const result = await this.client.del(this.getKey(key));
      const deleted = result > 0;
      
      if (deleted) {
        this.metrics.deletes++;
        this.emit('delete', { key });
      }
      
      return deleted;
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis delete error:', error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const result = await this.client.exists(this.getKey(key));
      return result > 0;
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis exists error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const pattern = `${this.keyPrefix}*`;
      const keys = await this.client.keys(pattern);
      
      if (keys.length > 0) {
        await this.client.del(keys);
        this.emit('clear', { clearedCount: keys.length });
      }
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis clear error:', error);
      throw error;
    }
  }

  async getMetrics(): Promise<ICacheMetrics> {
    let size = 0;
    let memoryUsage = 0;

    if (this.isConnected) {
      try {
        const keys = await this.client.keys(`${this.keyPrefix}*`);
        size = keys.length;

        // Get approximate memory usage from Redis info
        const info = await this.client.info('memory');
        const memoryMatch = info.match(/used_memory:(\d+)/);
        if (memoryMatch) {
          memoryUsage = parseInt(memoryMatch[1], 10);
        }
      } catch (error) {
        logger.error('Error getting Redis metrics:', error);
      }
    }

    const total = this.metrics.hits + this.metrics.misses;

    return {
      hitCount: this.metrics.hits,
      missCount: this.metrics.misses,
      hitRate: total > 0 ? this.metrics.hits / total : 0,
      size,
      memoryUsage,
      lastUpdated: new Date()
    };
  }

  async getKeys(pattern?: string): Promise<string[]> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const searchPattern = pattern ? 
        `${this.keyPrefix}${pattern}` : 
        `${this.keyPrefix}*`;
      
      const keys = await this.client.keys(searchPattern);
      
      // Remove prefix from keys
      return keys.map(key => key.replace(this.keyPrefix, ''));
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis getKeys error:', error);
      throw error;
    }
  }

  // Additional Redis-specific methods
  async setMultiple(entries: Map<string, any>, ttl?: number): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const pipeline = this.client.multi();
      
      for (const [key, value] of entries) {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
        const redisKey = this.getKey(key);
        
        if (ttl && ttl > 0) {
          pipeline.setEx(redisKey, Math.floor(ttl / 1000), serializedValue);
        } else {
          pipeline.set(redisKey, serializedValue);
        }
      }

      await pipeline.exec();
      this.metrics.sets += entries.size;
      this.emit('setMultiple', { count: entries.size, ttl });
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis setMultiple error:', error);
      throw error;
    }
  }

  async getMultiple<T>(keys: string[]): Promise<Map<string, T>> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const redisKeys = keys.map(key => this.getKey(key));
      const values = await this.client.mGet(redisKeys);
      
      const result = new Map<string, T>();
      
      for (let i = 0; i < keys.length; i++) {
        const value = values[i];
        if (value !== null) {
          try {
            result.set(keys[i], JSON.parse(value) as T);
            this.metrics.hits++;
          } catch {
            result.set(keys[i], value as unknown as T);
            this.metrics.hits++;
          }
        } else {
          this.metrics.misses++;
        }
      }

      this.emit('getMultiple', { requested: keys.length, found: result.size });
      return result;
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis getMultiple error:', error);
      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const result = await this.client.expire(this.getKey(key), Math.floor(ttl / 1000));
      return result;
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis expire error:', error);
      throw error;
    }
  }

  async getTTL(key: string): Promise<number> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const ttl = await this.client.ttl(this.getKey(key));
      return ttl * 1000; // Convert to milliseconds
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis getTTL error:', error);
      throw error;
    }
  }
}