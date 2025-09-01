/**
 * Enterprise Cache Manager
 * Fortune 100-grade multi-layer cache management system
 */

import { EventEmitter } from 'events';
import { 
  ICacheManager, 
  ICacheOptions, 
  ICacheMetrics, 
  ICacheConfiguration,
  CacheLayer,
  CacheStrategy
} from '../interfaces/ICacheManager.js';
import { MemoryCacheProvider } from '../providers/MemoryCacheProvider.js';
import { RedisCacheProvider } from '../providers/RedisCacheProvider.js';
import { logger } from '../../../utils/logger.js';
import { config } from '../../../config/config.js';

export class EnterpriseCacheManager extends EventEmitter implements ICacheManager {
  private memoryProvider: MemoryCacheProvider;
  private redisProvider: RedisCacheProvider;
  private configuration: ICacheConfiguration;
  private isStarted: boolean = false;
  private metricsInterval: NodeJS.Timeout | null = null;

  constructor(customConfig?: Partial<ICacheConfiguration>) {
    super();
    
    // Default configuration
    this.configuration = {
      maxSize: 10000,
      defaultTTL: 300000, // 5 minutes
      strategy: CacheStrategy.LRU,
      compression: {
        enabled: false,
        threshold: 1024 // 1KB
      },
      encryption: {
        enabled: false,
        algorithm: 'aes-256-gcm'
      },
      layers: {
        memory: {
          enabled: true,
          maxSize: 1000,
          ttl: 60000 // 1 minute
        },
        redis: {
          enabled: true,
          ttl: 900000, // 15 minutes
          keyPrefix: 'phantomspire:cache:'
        },
        persistent: {
          enabled: false,
          ttl: 3600000, // 1 hour
          collection: 'cache_entries'
        }
      },
      monitoring: {
        enabled: true,
        metricsInterval: 30000, // 30 seconds
        alertThresholds: {
          hitRateBelow: 0.7,
          memoryUsageAbove: 0.9
        }
      },
      ...customConfig
    };

    // Initialize providers
    this.memoryProvider = new MemoryCacheProvider(
      this.configuration.layers.memory.maxSize,
      this.configuration.layers.memory.ttl
    );

    this.redisProvider = new RedisCacheProvider(
      config.REDIS_URL,
      this.configuration.layers.redis.keyPrefix
    );

    this.setupEventHandlers();
  }

  async start(): Promise<void> {
    if (this.isStarted) return;

    try {
      // Connect Redis provider if enabled
      if (this.configuration.layers.redis.enabled) {
        await this.redisProvider.connect();
      }

      // Start monitoring if enabled
      if (this.configuration.monitoring.enabled) {
        this.startMetricsCollection();
      }

      this.isStarted = true;
      logger.info('Enterprise Cache Manager started successfully');
      this.emit('started');
    } catch (error) {
      logger.error('Failed to start Enterprise Cache Manager:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isStarted) return;

    try {
      // Stop metrics collection
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
        this.metricsInterval = null;
      }

      // Disconnect Redis provider
      if (this.configuration.layers.redis.enabled) {
        await this.redisProvider.disconnect();
      }

      this.isStarted = false;
      logger.info('Enterprise Cache Manager stopped successfully');
      this.emit('stopped');
    } catch (error) {
      logger.error('Error stopping Enterprise Cache Manager:', error);
      throw error;
    }
  }

  async get<T>(key: string, options?: ICacheOptions): Promise<T | null> {
    const namespace = options?.namespace || 'default';
    const namespacedKey = `${namespace}:${key}`;

    try {
      // Try memory cache first
      if (this.configuration.layers.memory.enabled) {
        const memoryResult = await this.memoryProvider.get<T>(namespacedKey);
        if (memoryResult !== null) {
          this.emit('hit', { key, layer: CacheLayer.MEMORY });
          return memoryResult;
        }
      }

      // Try Redis cache
      if (this.configuration.layers.redis.enabled) {
        const redisResult = await this.redisProvider.get<T>(namespacedKey);
        if (redisResult !== null) {
          // Backfill memory cache
          if (this.configuration.layers.memory.enabled) {
            await this.memoryProvider.set(namespacedKey, redisResult, this.configuration.layers.memory.ttl);
          }
          
          this.emit('hit', { key, layer: CacheLayer.REDIS });
          return redisResult;
        }
      }

      this.emit('miss', { key });
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      this.emit('error', { operation: 'get', key, error });
      throw error;
    }
  }

  async set<T>(key: string, value: T, options?: ICacheOptions): Promise<void> {
    const namespace = options?.namespace || 'default';
    const namespacedKey = `${namespace}:${key}`;
    const ttl = options?.ttl || this.configuration.defaultTTL;

    try {
      const promises: Promise<void>[] = [];

      // Set in memory cache
      if (this.configuration.layers.memory.enabled) {
        promises.push(this.memoryProvider.set(namespacedKey, value, Math.min(ttl, this.configuration.layers.memory.ttl)));
      }

      // Set in Redis cache
      if (this.configuration.layers.redis.enabled) {
        promises.push(this.redisProvider.set(namespacedKey, value, Math.min(ttl, this.configuration.layers.redis.ttl)));
      }

      await Promise.all(promises);
      this.emit('set', { key, value, ttl });
    } catch (error) {
      logger.error('Cache set error:', error);
      this.emit('error', { operation: 'set', key, error });
      throw error;
    }
  }

  async delete(key: string, options?: ICacheOptions): Promise<boolean> {
    const namespace = options?.namespace || 'default';
    const namespacedKey = `${namespace}:${key}`;

    try {
      const promises: Promise<boolean>[] = [];

      // Delete from memory cache
      if (this.configuration.layers.memory.enabled) {
        promises.push(this.memoryProvider.delete(namespacedKey));
      }

      // Delete from Redis cache
      if (this.configuration.layers.redis.enabled) {
        promises.push(this.redisProvider.delete(namespacedKey));
      }

      const results = await Promise.all(promises);
      const deleted = results.some(result => result);

      if (deleted) {
        this.emit('delete', { key });
      }

      return deleted;
    } catch (error) {
      logger.error('Cache delete error:', error);
      this.emit('error', { operation: 'delete', key, error });
      throw error;
    }
  }

  async exists(key: string, options?: ICacheOptions): Promise<boolean> {
    const namespace = options?.namespace || 'default';
    const namespacedKey = `${namespace}:${key}`;

    try {
      // Check memory cache first
      if (this.configuration.layers.memory.enabled) {
        const memoryExists = await this.memoryProvider.exists(namespacedKey);
        if (memoryExists) return true;
      }

      // Check Redis cache
      if (this.configuration.layers.redis.enabled) {
        return await this.redisProvider.exists(namespacedKey);
      }

      return false;
    } catch (error) {
      logger.error('Cache exists error:', error);
      this.emit('error', { operation: 'exists', key, error });
      throw error;
    }
  }

  async getMultiple<T>(keys: string[], options?: ICacheOptions): Promise<Map<string, T>> {
    const namespace = options?.namespace || 'default';
    const namespacedKeys = keys.map(key => `${namespace}:${key}`);
    const result = new Map<string, T>();

    try {
      // Try memory cache first
      if (this.configuration.layers.memory.enabled) {
        for (let i = 0; i < namespacedKeys.length && i < keys.length; i++) {
          const namespacedKey = namespacedKeys[i];
          const key = keys[i];
          if (namespacedKey && key) {
            const value = await this.memoryProvider.get<T>(namespacedKey);
            if (value !== null) {
              result.set(key, value);
            }
          }
        }
      }

      // Get remaining keys from Redis
      const remainingKeys = keys.filter(key => !result.has(key));
      if (remainingKeys.length > 0 && this.configuration.layers.redis.enabled) {
        const remainingNamespacedKeys = remainingKeys.map(key => `${namespace}:${key}`);
        const redisResults = await this.redisProvider.getMultiple<T>(remainingNamespacedKeys);

        // Process Redis results
        let index = 0;
        for (const [namespacedKey, value] of redisResults) {
          const originalKey = namespacedKey.replace(`${namespace}:`, '');
          if (originalKey && value !== undefined) {
            result.set(originalKey, value);

            // Backfill memory cache
            if (this.configuration.layers.memory.enabled) {
              await this.memoryProvider.set(namespacedKey, value, this.configuration.layers.memory.ttl);
            }
          }
          index++;
        }
      }

      this.emit('getMultiple', { requested: keys.length, found: result.size });
      return result;
    } catch (error) {
      logger.error('Cache getMultiple error:', error);
      this.emit('error', { operation: 'getMultiple', keys, error });
      throw error;
    }
  }

  async setMultiple<T>(entries: Map<string, T>, options?: ICacheOptions): Promise<void> {
    const namespace = options?.namespace || 'default';
    const ttl = options?.ttl || this.configuration.defaultTTL;

    try {
      const promises: Promise<void>[] = [];

      // Set in memory cache
      if (this.configuration.layers.memory.enabled) {
        for (const [key, value] of entries) {
          const namespacedKey = `${namespace}:${key}`;
          promises.push(this.memoryProvider.set(namespacedKey, value, Math.min(ttl, this.configuration.layers.memory.ttl)));
        }
      }

      // Set in Redis cache
      if (this.configuration.layers.redis.enabled) {
        const namespacedEntries = new Map<string, T>();
        for (const [key, value] of entries) {
          namespacedEntries.set(`${namespace}:${key}`, value);
        }
        promises.push(this.redisProvider.setMultiple(namespacedEntries, Math.min(ttl, this.configuration.layers.redis.ttl)));
      }

      await Promise.all(promises);
      this.emit('setMultiple', { count: entries.size, ttl });
    } catch (error) {
      logger.error('Cache setMultiple error:', error);
      this.emit('error', { operation: 'setMultiple', error });
      throw error;
    }
  }

  async deleteMultiple(keys: string[], options?: ICacheOptions): Promise<number> {
    let deletedCount = 0;

    try {
      for (const key of keys) {
        const deleted = await this.delete(key, options);
        if (deleted) deletedCount++;
      }

      this.emit('deleteMultiple', { requested: keys.length, deleted: deletedCount });
      return deletedCount;
    } catch (error) {
      logger.error('Cache deleteMultiple error:', error);
      this.emit('error', { operation: 'deleteMultiple', keys, error });
      throw error;
    }
  }

  async getByPattern<T>(pattern: string, options?: ICacheOptions): Promise<Map<string, T>> {
    const namespace = options?.namespace || 'default';
    const namespacedPattern = `${namespace}:${pattern}`;
    const result = new Map<string, T>();

    try {
      // Get keys matching pattern from all layers
      const memoryKeys = this.configuration.layers.memory.enabled ? 
        await this.memoryProvider.getKeys(namespacedPattern) : [];
      const redisKeys = this.configuration.layers.redis.enabled ? 
        await this.redisProvider.getKeys(namespacedPattern) : [];

      const allKeys = Array.from(new Set([...memoryKeys, ...redisKeys]));

      // Get values for matching keys
      for (const namespacedKey of allKeys) {
        const originalKey = namespacedKey.replace(`${namespace}:`, '');
        if (originalKey) {
          const value = await this.get<T>(originalKey, options);
          if (value !== null) {
            result.set(originalKey, value);
          }
        }
      }

      return result;
    } catch (error) {
      logger.error('Cache getByPattern error:', error);
      this.emit('error', { operation: 'getByPattern', pattern, error });
      throw error;
    }
  }

  async deleteByPattern(pattern: string, options?: ICacheOptions): Promise<number> {
    const entries = await this.getByPattern(pattern, options);
    return await this.deleteMultiple(Array.from(entries.keys()), options);
  }

  // Tag-based operations (simplified implementation)
  async getByTags<T>(tags: string[], options?: ICacheOptions): Promise<Map<string, T>> {
    // For now, implement as pattern matching on tag namespace
    const tagPattern = `tags:${tags.join('|')}:*`;
    return await this.getByPattern<T>(tagPattern, options);
  }

  async deleteByTags(tags: string[], options?: ICacheOptions): Promise<number> {
    const entries = await this.getByTags(tags, options);
    return await this.deleteMultiple(Array.from(entries.keys()), options);
  }

  async clearNamespace(namespace: string): Promise<number> {
    return await this.deleteByPattern('*', { namespace });
  }

  async getNamespaceSize(namespace: string): Promise<number> {
    const entries = await this.getByPattern('*', { namespace });
    return entries.size;
  }

  async getMetrics(layer?: CacheLayer): Promise<ICacheMetrics> {
    try {
      if (layer === CacheLayer.MEMORY) {
        return await this.memoryProvider.getMetrics();
      } else if (layer === CacheLayer.REDIS) {
        return await this.redisProvider.getMetrics();
      } else {
        // Return combined metrics
        const memoryMetrics = await this.memoryProvider.getMetrics();
        const redisMetrics = await this.redisProvider.getMetrics();

        return {
          hitCount: memoryMetrics.hitCount + redisMetrics.hitCount,
          missCount: memoryMetrics.missCount + redisMetrics.missCount,
          hitRate: (memoryMetrics.hitRate + redisMetrics.hitRate) / 2,
          size: memoryMetrics.size + redisMetrics.size,
          memoryUsage: memoryMetrics.memoryUsage + redisMetrics.memoryUsage,
          lastUpdated: new Date()
        };
      }
    } catch (error) {
      logger.error('Error getting cache metrics:', error);
      throw error;
    }
  }

  async getHitRate(_timeWindow?: number): Promise<number> {
    const metrics = await this.getMetrics();
    return metrics.hitRate;
  }

  async getTopKeys(limit: number = 10): Promise<Array<{ key: string; accessCount: number }>> {
    // Get top keys from memory cache (most detailed access tracking)
    return this.memoryProvider.getTopKeys(limit);
  }

  async warm(keys: string[], loader: (key: string) => Promise<any>): Promise<void> {
    try {
      const promises = keys.map(async (key) => {
        try {
          const value = await loader(key);
          if (value !== null && value !== undefined) {
            await this.set(key, value);
          }
        } catch (error) {
          logger.warn(`Failed to warm cache key ${key}:`, error);
        }
      });

      await Promise.all(promises);
      this.emit('warmed', { count: keys.length });
    } catch (error) {
      logger.error('Cache warming error:', error);
      throw error;
    }
  }

  async invalidate(pattern?: string, tags?: string[]): Promise<number> {
    let invalidatedCount = 0;

    try {
      if (pattern) {
        invalidatedCount += await this.deleteByPattern(pattern);
      }

      if (tags && tags.length > 0) {
        invalidatedCount += await this.deleteByTags(tags);
      }

      this.emit('invalidated', { count: invalidatedCount, pattern, tags });
      return invalidatedCount;
    } catch (error) {
      logger.error('Cache invalidation error:', error);
      throw error;
    }
  }

  async clear(layer?: CacheLayer): Promise<void> {
    try {
      if (!layer || layer === CacheLayer.MEMORY) {
        await this.memoryProvider.clear();
      }

      if (!layer || layer === CacheLayer.REDIS) {
        await this.redisProvider.clear();
      }

      this.emit('cleared', { layer });
    } catch (error) {
      logger.error('Cache clear error:', error);
      throw error;
    }
  }

  async updateConfiguration(config: Partial<ICacheConfiguration>): Promise<void> {
    this.configuration = { ...this.configuration, ...config };
    this.emit('configUpdated', { config });
  }

  getConfiguration(): ICacheConfiguration {
    return { ...this.configuration };
  }

  private setupEventHandlers(): void {
    // Memory provider events
    this.memoryProvider.on('hit', (data) => this.emit('hit', { ...data, layer: CacheLayer.MEMORY }));
    this.memoryProvider.on('miss', (data) => this.emit('miss', { ...data, layer: CacheLayer.MEMORY }));
    this.memoryProvider.on('set', (data) => this.emit('set', { ...data, layer: CacheLayer.MEMORY }));
    this.memoryProvider.on('delete', (data) => this.emit('delete', { ...data, layer: CacheLayer.MEMORY }));
    this.memoryProvider.on('evict', (data) => this.emit('evicted', { ...data, layer: CacheLayer.MEMORY }));

    // Redis provider events
    this.redisProvider.on('hit', (data) => this.emit('hit', { ...data, layer: CacheLayer.REDIS }));
    this.redisProvider.on('miss', (data) => this.emit('miss', { ...data, layer: CacheLayer.REDIS }));
    this.redisProvider.on('set', (data) => this.emit('set', { ...data, layer: CacheLayer.REDIS }));
    this.redisProvider.on('delete', (data) => this.emit('delete', { ...data, layer: CacheLayer.REDIS }));
    this.redisProvider.on('error', (error) => this.emit('error', { ...error, layer: CacheLayer.REDIS }));
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.getMetrics();
        
        // Check alert thresholds
        if (metrics.hitRate < this.configuration.monitoring.alertThresholds.hitRateBelow) {
          this.emit('alert', { 
            type: 'low_hit_rate', 
            value: metrics.hitRate, 
            threshold: this.configuration.monitoring.alertThresholds.hitRateBelow 
          });
        }

        this.emit('metrics', metrics);
      } catch (error) {
        logger.error('Error collecting cache metrics:', error);
      }
    }, this.configuration.monitoring.metricsInterval);
  }
}

// Export singleton instance
export const cacheManager = new EnterpriseCacheManager();