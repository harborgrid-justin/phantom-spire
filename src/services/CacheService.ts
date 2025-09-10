/**
 * Cache Service
 * Production-ready caching service with Redis backend and memory fallback
 */

import { Redis } from 'redis';
import { LoggingService } from './LoggingService';

export class CacheService {
  private static instance: CacheService;
  private redisClient: Redis | null = null;
  private memoryCache: Map<string, { data: any; expiry: number }> = new Map();
  private logger = LoggingService.getInstance();

  private constructor() {
    this.initializeRedis();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private async initializeRedis(): Promise<void> {
    if (process.env.REDIS_URL) {
      try {
        this.redisClient = new Redis(process.env.REDIS_URL);
        await this.redisClient.ping();
        this.logger.info('Redis cache initialized successfully');
      } catch (error) {
        this.logger.error('Redis initialization failed, using memory cache:', error);
        this.redisClient = null;
      }
    } else {
      this.logger.info('No Redis URL provided, using memory cache');
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (this.redisClient) {
        await this.redisClient.setex(key, ttl, serializedValue);
      } else {
        // Fallback to memory cache
        const expiry = Date.now() + (ttl * 1000);
        this.memoryCache.set(key, { data: value, expiry });
        
        // Clean up expired entries periodically
        this.cleanupMemoryCache();
      }
      
      this.logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error('Cache set failed:', error);
      // Don't throw, cache failures shouldn't break the application
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      if (this.redisClient) {
        const value = await this.redisClient.get(key);
        if (value) {
          this.logger.debug(`Cache hit: ${key}`);
          return JSON.parse(value);
        }
      } else {
        // Fallback to memory cache
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          this.logger.debug(`Memory cache hit: ${key}`);
          return cached.data;
        } else if (cached) {
          // Remove expired entry
          this.memoryCache.delete(key);
        }
      }
      
      this.logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      this.logger.error('Cache get failed:', error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.del(key);
      } else {
        this.memoryCache.delete(key);
      }
      
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error('Cache delete failed:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.redisClient) {
        const exists = await this.redisClient.exists(key);
        return exists === 1;
      } else {
        const cached = this.memoryCache.get(key);
        return cached !== undefined && cached.expiry > Date.now();
      }
    } catch (error) {
      this.logger.error('Cache exists check failed:', error);
      return false;
    }
  }

  async flush(): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.flushdb();
      } else {
        this.memoryCache.clear();
      }
      
      this.logger.info('Cache flushed');
    } catch (error) {
      this.logger.error('Cache flush failed:', error);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      if (this.redisClient) {
        return await this.redisClient.keys(pattern);
      } else {
        // Simple pattern matching for memory cache
        const keys = Array.from(this.memoryCache.keys());
        if (pattern === '*') {
          return keys;
        }
        // Basic wildcard support
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return keys.filter(key => regex.test(key));
      }
    } catch (error) {
      this.logger.error('Cache keys operation failed:', error);
      return [];
    }
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      if (this.redisClient) {
        return await this.redisClient.incrby(key, amount);
      } else {
        const cached = this.memoryCache.get(key);
        const currentValue = cached ? (typeof cached.data === 'number' ? cached.data : 0) : 0;
        const newValue = currentValue + amount;
        this.memoryCache.set(key, { data: newValue, expiry: Date.now() + 3600000 }); // 1 hour default
        return newValue;
      }
    } catch (error) {
      this.logger.error('Cache increment failed:', error);
      return 0;
    }
  }

  async setWithTags(key: string, value: any, ttl: number = 3600, tags: string[] = []): Promise<void> {
    await this.set(key, value, ttl);
    
    // Store tags for cache invalidation
    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      const taggedKeys = await this.get(tagKey) || [];
      if (!taggedKeys.includes(key)) {
        taggedKeys.push(key);
        await this.set(tagKey, taggedKeys, ttl * 2); // Tags live longer
      }
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      const tagKey = `tag:${tag}`;
      const taggedKeys = await this.get(tagKey) || [];
      
      for (const key of taggedKeys) {
        await this.del(key);
      }
      
      await this.del(tagKey);
      this.logger.info(`Cache invalidated by tag: ${tag} (${taggedKeys.length} keys)`);
    } catch (error) {
      this.logger.error('Cache tag invalidation failed:', error);
    }
  }

  private cleanupMemoryCache(): void {
    // Clean up expired entries every 5 minutes
    setTimeout(() => {
      const now = Date.now();
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.expiry <= now) {
          this.memoryCache.delete(key);
        }
      }
      this.cleanupMemoryCache();
    }, 5 * 60 * 1000);
  }

  async getStats(): Promise<any> {
    const stats = {
      backend: this.redisClient ? 'redis' : 'memory',
      timestamp: new Date().toISOString()
    };

    try {
      if (this.redisClient) {
        const info = await this.redisClient.info('memory');
        return {
          ...stats,
          redis_info: info
        };
      } else {
        return {
          ...stats,
          memory_cache_size: this.memoryCache.size,
          memory_cache_keys: Array.from(this.memoryCache.keys()).slice(0, 10) // First 10 keys for debug
        };
      }
    } catch (error) {
      this.logger.error('Cache stats failed:', error);
      return stats;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.quit();
      }
      this.memoryCache.clear();
      this.logger.info('Cache service closed');
    } catch (error) {
      this.logger.error('Error closing cache service:', error);
    }
  }
}