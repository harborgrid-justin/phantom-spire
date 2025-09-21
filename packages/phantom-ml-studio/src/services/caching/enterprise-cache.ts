/**
 * Enterprise Caching System
 * Multi-layered caching with Redis, memory, and distributed capabilities
 * Advanced cache strategies with intelligent invalidation and warming
 */

import Redis from 'ioredis';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export interface CacheConfig {
  redis: {
    enabled: boolean;
    url?: string;
    cluster?: Array<{ host: string; port: number }>;
    options?: {
      maxRetriesPerRequest: number;
      retryDelayOnFailover: number;
      enableReadyCheck: boolean;
      lazyConnect: boolean;
    };
  };
  memory: {
    enabled: boolean;
    maxSize: number; // in MB
    maxItems: number;
    ttl: number; // default TTL in seconds
  };
  distributed: {
    enabled: boolean;
    consistentHashing: boolean;
    replicationFactor: number;
  };
  strategies: {
    writeThrough: boolean;
    writeBack: boolean;
    readThrough: boolean;
    refreshAhead: boolean;
  };
  compression: {
    enabled: boolean;
    algorithm: 'gzip' | 'lz4' | 'snappy';
    threshold: number; // compress if size > threshold bytes
  };
  encryption: {
    enabled: boolean;
    algorithm: 'aes-256-gcm';
    keyRotationInterval: number; // hours
  };
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  metadata: {
    createdAt: Date;
    expiresAt?: Date;
    accessCount: number;
    lastAccessAt: Date;
    size: number; // bytes
    compressed: boolean;
    encrypted: boolean;
    version: number;
    tags: string[];
  };
}

export interface CacheStatistics {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  evictions: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  redisStats?: {
    connected: boolean;
    memoryUsage: string;
    keyCount: number;
    operations: {
      gets: number;
      sets: number;
      deletes: number;
    };
  };
  performance: {
    averageGetTime: number;
    averageSetTime: number;
    slowQueries: Array<{
      key: string;
      operation: 'get' | 'set' | 'delete';
      duration: number;
      timestamp: Date;
    }>;
  };
}

export interface CacheOperationOptions {
  ttl?: number; // seconds
  tags?: string[];
  compress?: boolean;
  encrypt?: boolean;
  refreshAhead?: boolean;
  writeThrough?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Advanced enterprise caching system
 */
export class EnterpriseCacheSystem extends EventEmitter {
  private config: CacheConfig;
  private redis?: Redis;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private statistics: CacheStatistics;
  private encryptionKey?: Buffer;
  private compressionLib: any;

  constructor(config: Partial<CacheConfig> = {}) {
    super();
    
    this.config = {
      redis: {
        enabled: true,
        options: {
          maxRetriesPerRequest: 3,
          retryDelayOnFailover: 100,
          enableReadyCheck: true,
          lazyConnect: true
        }
      },
      memory: {
        enabled: true,
        maxSize: 100, // 100MB
        maxItems: 10000,
        ttl: 3600 // 1 hour
      },
      distributed: {
        enabled: false,
        consistentHashing: false,
        replicationFactor: 2
      },
      strategies: {
        writeThrough: true,
        writeBack: false,
        readThrough: true,
        refreshAhead: false
      },
      compression: {
        enabled: true,
        algorithm: 'gzip',
        threshold: 1024 // 1KB
      },
      encryption: {
        enabled: false,
        algorithm: 'aes-256-gcm',
        keyRotationInterval: 24
      },
      ...config
    };

    this.statistics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      evictions: 0,
      memoryUsage: { used: 0, total: 0, percentage: 0 },
      performance: {
        averageGetTime: 0,
        averageSetTime: 0,
        slowQueries: []
      }
    };

    this.initialize();
  }

  /**
   * Initialize cache systems
   */
  private async initialize(): Promise<void> {
    try {
      // Initialize Redis if enabled
      if (this.config.redis.enabled) {
        await this.initializeRedis();
      }

      // Initialize compression
      if (this.config.compression.enabled) {
        await this.initializeCompression();
      }

      // Initialize encryption
      if (this.config.encryption.enabled) {
        await this.initializeEncryption();
      }

      // Start background tasks
      this.startBackgroundTasks();

      this.emit('initialized');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    const redisConfig = this.config.redis;
    
    if (redisConfig.cluster && redisConfig.cluster.length > 0) {
      // Redis Cluster
      this.redis = new Redis.Cluster(redisConfig.cluster, {
        ...redisConfig.options
      });
    } else {
      // Single Redis instance
      this.redis = new Redis(redisConfig.url || process.env.REDIS_URL || 'redis://localhost:6379', {
        ...redisConfig.options
      });
    }

    this.redis.on('connect', () => {
      this.emit('redisConnected');
    });

    this.redis.on('error', (error) => {
      this.emit('redisError', error);
    });

    this.redis.on('ready', () => {
      this.emit('redisReady');
    });
  }

  /**
   * Initialize compression library
   */
  private async initializeCompression(): Promise<void> {
    try {
      switch (this.config.compression.algorithm) {
        case 'gzip':
          const zlib = await import('zlib');
          this.compressionLib = zlib;
          break;
        case 'lz4':
          // Would require lz4 package
          console.warn('LZ4 compression not implemented, falling back to gzip');
          const zlibFallback = await import('zlib');
          this.compressionLib = zlibFallback;
          break;
        case 'snappy':
          // Would require snappy package
          console.warn('Snappy compression not implemented, falling back to gzip');
          const zlibFallback2 = await import('zlib');
          this.compressionLib = zlibFallback2;
          break;
      }
    } catch (error) {
      console.error('Failed to initialize compression:', error);
      this.config.compression.enabled = false;
    }
  }

  /**
   * Initialize encryption
   */
  private async initializeEncryption(): Promise<void> {
    try {
      // Generate or load encryption key
      this.encryptionKey = crypto.randomBytes(32);
      
      // In production, this would be loaded from secure key management
      if (process.env.CACHE_ENCRYPTION_KEY) {
        this.encryptionKey = Buffer.from(process.env.CACHE_ENCRYPTION_KEY, 'hex');
      }
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      this.config.encryption.enabled = false;
    }
  }

  /**
   * Get value from cache with multi-layer strategy
   */
  async get<T = any>(key: string, options?: {
    refreshAhead?: boolean;
    skipMemory?: boolean;
    skipRedis?: boolean;
  }): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      this.statistics.totalRequests++;
      
      const cacheKey = this.normalizeKey(key);
      let entry: CacheEntry<T> | null = null;

      // Try memory cache first (if not skipping)
      if (this.config.memory.enabled && !options?.skipMemory) {
        entry = this.getFromMemory<T>(cacheKey);
        if (entry) {
          this.recordHit(startTime);
          this.emit('memoryHit', { key: cacheKey });
          return entry.value;
        }
      }

      // Try Redis cache (if not skipping)
      if (this.config.redis.enabled && this.redis && !options?.skipRedis) {
        entry = await this.getFromRedis<T>(cacheKey);
        if (entry) {
          // Store in memory cache for faster access
          if (this.config.memory.enabled) {
            this.setInMemory(cacheKey, entry);
          }
          
          this.recordHit(startTime);
          this.emit('redisHit', { key: cacheKey });
          return entry.value;
        }
      }

      this.recordMiss(startTime);
      this.emit('cacheMiss', { key: cacheKey });
      return null;

    } catch (error) {
      this.emit('error', { operation: 'get', key, error });
      return null;
    }
  }

  /**
   * Set value in cache with multi-layer strategy
   */
  async set<T = any>(
    key: string, 
    value: T, 
    options: CacheOperationOptions = {}
  ): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const cacheKey = this.normalizeKey(key);
      const ttl = options.ttl || this.config.memory.ttl;
      
      // Create cache entry
      const entry: CacheEntry<T> = {
        key: cacheKey,
        value,
        metadata: {
          createdAt: new Date(),
          expiresAt: ttl ? new Date(Date.now() + ttl * 1000) : undefined,
          accessCount: 0,
          lastAccessAt: new Date(),
          size: this.calculateSize(value),
          compressed: false,
          encrypted: false,
          version: 1,
          tags: options.tags || []
        }
      };

      // Apply compression if needed
      if (this.shouldCompress(entry, options)) {
        entry.value = await this.compress(entry.value);
        entry.metadata.compressed = true;
      }

      // Apply encryption if needed
      if (this.shouldEncrypt(options)) {
        entry.value = await this.encrypt(entry.value);
        entry.metadata.encrypted = true;
      }

      // Write to memory cache
      if (this.config.memory.enabled) {
        this.setInMemory(cacheKey, entry);
      }

      // Write to Redis cache
      if (this.config.redis.enabled && this.redis) {
        if (this.config.strategies.writeThrough || options.writeThrough) {
          await this.setInRedis(cacheKey, entry, ttl);
        }
      }

      this.recordSetOperation(startTime);
      this.emit('cacheSet', { key: cacheKey, size: entry.metadata.size });
      
      return true;

    } catch (error) {
      this.emit('error', { operation: 'set', key, error });
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const cacheKey = this.normalizeKey(key);
      let deleted = false;

      // Delete from memory cache
      if (this.config.memory.enabled && this.memoryCache.has(cacheKey)) {
        this.memoryCache.delete(cacheKey);
        deleted = true;
      }

      // Delete from Redis cache
      if (this.config.redis.enabled && this.redis) {
        const redisResult = await this.redis.del(cacheKey);
        if (redisResult > 0) {
          deleted = true;
        }
      }

      if (deleted) {
        this.emit('cacheDelete', { key: cacheKey });
      }

      return deleted;

    } catch (error) {
      this.emit('error', { operation: 'delete', key, error });
      return false;
    }
  }

  /**
   * Clear cache by tags
   */
  async clearByTags(tags: string[]): Promise<number> {
    let clearedCount = 0;

    try {
      // Clear from memory cache
      if (this.config.memory.enabled) {
        for (const [key, entry] of this.memoryCache.entries()) {
          if (entry.metadata.tags.some(tag => tags.includes(tag))) {
            this.memoryCache.delete(key);
            clearedCount++;
          }
        }
      }

      // Clear from Redis cache (would need tag indexing in production)
      if (this.config.redis.enabled && this.redis) {
        // This is simplified - in production you'd maintain tag indices
        const keys = await this.redis.keys('*');
        for (const key of keys) {
          const entryData = await this.redis.get(key);
          if (entryData) {
            try {
              const entry = JSON.parse(entryData);
              if (entry.metadata?.tags?.some((tag: string) => tags.includes(tag))) {
                await this.redis.del(key);
                clearedCount++;
              }
            } catch {
              // Skip invalid entries
            }
          }
        }
      }

      this.emit('cacheCleared', { tags, count: clearedCount });
      return clearedCount;

    } catch (error) {
      this.emit('error', { operation: 'clearByTags', tags, error });
      return clearedCount;
    }
  }

  /**
   * Get or set with callback (read-through pattern)
   */
  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T> | T,
    options: CacheOperationOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    let value = await this.get<T>(key);
    
    if (value !== null) {
      return value;
    }

    // Value not in cache, generate it
    try {
      value = await factory();
      
      // Store in cache
      await this.set(key, value, options);
      
      this.emit('cacheGenerated', { key });
      return value;

    } catch (error) {
      this.emit('error', { operation: 'getOrSet', key, error });
      throw error;
    }
  }

  /**
   * Warm cache with predefined data
   */
  async warmCache(entries: Array<{
    key: string;
    value: any;
    options?: CacheOperationOptions;
  }>): Promise<number> {
    let warmedCount = 0;
    
    try {
      for (const entry of entries) {
        const success = await this.set(entry.key, entry.value, entry.options);
        if (success) {
          warmedCount++;
        }
      }

      this.emit('cacheWarmed', { count: warmedCount });
      return warmedCount;

    } catch (error) {
      this.emit('error', { operation: 'warmCache', error });
      return warmedCount;
    }
  }

  /**
   * Get cache statistics
   */
  getStatistics(): CacheStatistics {
    // Update memory usage
    this.updateMemoryUsage();
    
    // Calculate hit rate
    this.statistics.hitRate = this.statistics.totalRequests > 0 
      ? (this.statistics.hits / this.statistics.totalRequests) * 100 
      : 0;

    return { ...this.statistics };
  }

  /**
   * Get detailed cache information
   */
  async getCacheInfo(): Promise<{
    config: CacheConfig;
    statistics: CacheStatistics;
    memoryKeys: string[];
    redisInfo?: any;
    health: {
      memory: 'healthy' | 'warning' | 'critical';
      redis: 'connected' | 'disconnected' | 'error';
      overall: 'healthy' | 'degraded' | 'unhealthy';
    };
  }> {
    const memoryKeys = Array.from(this.memoryCache.keys());
    const statistics = this.getStatistics();
    
    let redisInfo;
    let redisHealth: 'connected' | 'disconnected' | 'error' = 'disconnected';
    
    if (this.config.redis.enabled && this.redis) {
      try {
        redisInfo = await this.redis.info();
        redisHealth = 'connected';
      } catch (error) {
        redisHealth = 'error';
      }
    }

    // Determine health status
    const memoryHealth = statistics.memoryUsage.percentage > 90 ? 'critical' 
      : statistics.memoryUsage.percentage > 75 ? 'warning' : 'healthy';
    
    let overallHealth: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (memoryHealth === 'critical' || redisHealth === 'error') {
      overallHealth = 'unhealthy';
    } else if (memoryHealth === 'warning' || redisHealth === 'disconnected') {
      overallHealth = 'degraded';
    }

    return {
      config: this.config,
      statistics,
      memoryKeys,
      redisInfo,
      health: {
        memory: memoryHealth,
        redis: redisHealth,
        overall: overallHealth
      }
    };
  }

  /**
   * Private helper methods
   */
  private normalizeKey(key: string): string {
    // Create consistent cache key
    return `phantom:cache:${crypto.createHash('md5').update(key).digest('hex')}`;
  }

  private getFromMemory<T>(key: string): CacheEntry<T> | null {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check expiration
    if (entry.metadata.expiresAt && entry.metadata.expiresAt < new Date()) {
      this.memoryCache.delete(key);
      return null;
    }

    // Update access metadata
    entry.metadata.accessCount++;
    entry.metadata.lastAccessAt = new Date();

    return entry as CacheEntry<T>;
  }

  private async getFromRedis<T>(key: string): Promise<CacheEntry<T> | null> {
    if (!this.redis) return null;

    try {
      const data = await this.redis.get(key);
      if (!data) return null;

      const entry = JSON.parse(data) as CacheEntry<T>;
      
      // Restore dates
      entry.metadata.createdAt = new Date(entry.metadata.createdAt);
      if (entry.metadata.expiresAt) {
        entry.metadata.expiresAt = new Date(entry.metadata.expiresAt);
        
        // Check expiration
        if (entry.metadata.expiresAt < new Date()) {
          await this.redis.del(key);
          return null;
        }
      }
      
      entry.metadata.lastAccessAt = new Date();

      // Decrypt if needed
      if (entry.metadata.encrypted) {
        entry.value = await this.decrypt(entry.value);
        entry.metadata.encrypted = false;
      }

      // Decompress if needed
      if (entry.metadata.compressed) {
        entry.value = await this.decompress(entry.value);
        entry.metadata.compressed = false;
      }

      return entry;

    } catch (error) {
      return null;
    }
  }

  private setInMemory<T>(key: string, entry: CacheEntry<T>): void {
    // Check memory limits
    if (this.memoryCache.size >= this.config.memory.maxItems) {
      this.evictLRU();
    }

    this.memoryCache.set(key, entry);
  }

  private async setInRedis<T>(key: string, entry: CacheEntry<T>, ttl?: number): Promise<void> {
    if (!this.redis) return;

    try {
      const data = JSON.stringify(entry);
      
      if (ttl) {
        await this.redis.setex(key, ttl, data);
      } else {
        await this.redis.set(key, data);
      }
    } catch (error) {
      // Redis write failed, log but don't throw
      this.emit('redisWriteError', { key, error });
    }
  }

  private evictLRU(): void {
    // Find least recently used entry
    let oldestKey = '';
    let oldestTime = new Date();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.metadata.lastAccessAt < oldestTime) {
        oldestTime = entry.metadata.lastAccessAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      this.statistics.evictions++;
      this.emit('eviction', { key: oldestKey });
    }
  }

  private shouldCompress<T>(entry: CacheEntry<T>, options: CacheOperationOptions): boolean {
    if (!this.config.compression.enabled || options.compress === false) {
      return false;
    }

    return entry.metadata.size > this.config.compression.threshold;
  }

  private shouldEncrypt(options: CacheOperationOptions): boolean {
    return this.config.encryption.enabled && options.encrypt !== false;
  }

  private async compress(data: any): Promise<any> {
    if (!this.compressionLib) return data;

    try {
      const buffer = Buffer.from(JSON.stringify(data));
      return this.compressionLib.gzipSync(buffer).toString('base64');
    } catch (error) {
      return data; // Return original on compression failure
    }
  }

  private async decompress(data: any): Promise<any> {
    if (!this.compressionLib || typeof data !== 'string') return data;

    try {
      const buffer = Buffer.from(data, 'base64');
      const decompressed = this.compressionLib.gunzipSync(buffer);
      return JSON.parse(decompressed.toString());
    } catch (error) {
      return data; // Return original on decompression failure
    }
  }

  private async encrypt(data: any): Promise<any> {
    if (!this.encryptionKey) return data;

    try {
      const algorithm = 'aes-256-gcm';
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(algorithm, this.encryptionKey);
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        algorithm
      };
    } catch (error) {
      return data; // Return original on encryption failure
    }
  }

  private async decrypt(data: any): Promise<any> {
    if (!this.encryptionKey || !data.encrypted) return data;

    try {
      const decipher = crypto.createDecipher(data.algorithm, this.encryptionKey);
      
      let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      return data; // Return original on decryption failure
    }
  }

  private calculateSize(value: any): number {
    return Buffer.byteLength(JSON.stringify(value), 'utf8');
  }

  private recordHit(startTime: number): void {
    this.statistics.hits++;
    const duration = Date.now() - startTime;
    this.updateAverageGetTime(duration);
  }

  private recordMiss(startTime: number): void {
    this.statistics.misses++;
    const duration = Date.now() - startTime;
    this.updateAverageGetTime(duration);
  }

  private recordSetOperation(startTime: number): void {
    const duration = Date.now() - startTime;
    this.updateAverageSetTime(duration);
  }

  private updateAverageGetTime(duration: number): void {
    const totalOps = this.statistics.hits + this.statistics.misses;
    this.statistics.performance.averageGetTime = 
      ((this.statistics.performance.averageGetTime * (totalOps - 1)) + duration) / totalOps;
  }

  private updateAverageSetTime(duration: number): void {
    // Simplified calculation
    this.statistics.performance.averageSetTime = 
      (this.statistics.performance.averageSetTime + duration) / 2;
  }

  private updateMemoryUsage(): void {
    const maxSize = this.config.memory.maxSize * 1024 * 1024; // Convert MB to bytes
    let usedSize = 0;

    for (const entry of this.memoryCache.values()) {
      usedSize += entry.metadata.size;
    }

    this.statistics.memoryUsage = {
      used: usedSize,
      total: maxSize,
      percentage: (usedSize / maxSize) * 100
    };
  }

  private startBackgroundTasks(): void {
    // Cleanup expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);

    // Update statistics every minute
    setInterval(() => {
      this.updateStatistics();
    }, 60 * 1000);

    // Key rotation for encryption every configured interval
    if (this.config.encryption.enabled && this.config.encryption.keyRotationInterval > 0) {
      setInterval(() => {
        this.rotateEncryptionKey();
      }, this.config.encryption.keyRotationInterval * 60 * 60 * 1000);
    }
  }

  private cleanupExpiredEntries(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.metadata.expiresAt && entry.metadata.expiresAt < now) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.emit('cleanup', { cleaned: cleanedCount });
    }
  }

  private updateStatistics(): void {
    this.updateMemoryUsage();
    this.emit('statisticsUpdated', this.statistics);
  }

  private rotateEncryptionKey(): void {
    if (this.config.encryption.enabled) {
      this.encryptionKey = crypto.randomBytes(32);
      this.emit('keyRotation', { timestamp: new Date() });
    }
  }
}

/**
 * Cache-aside pattern wrapper
 */
export class CacheAsideWrapper<T = any> {
  constructor(
    private cache: EnterpriseCacheSystem,
    private keyPrefix: string = '',
    private defaultTTL: number = 3600
  ) {}

  async get(
    key: string,
    loader: () => Promise<T>,
    options?: CacheOperationOptions
  ): Promise<T> {
    const cacheKey = this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
    
    // Try cache first
    let value = await this.cache.get<T>(cacheKey);
    
    if (value !== null) {
      return value;
    }

    // Load from source
    value = await loader();
    
    // Store in cache
    await this.cache.set(cacheKey, value, {
      ttl: this.defaultTTL,
      ...options
    });
    
    return value;
  }

  async set(key: string, value: T, options?: CacheOperationOptions): Promise<void> {
    const cacheKey = this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
    await this.cache.set(cacheKey, value, {
      ttl: this.defaultTTL,
      ...options
    });
  }

  async delete(key: string): Promise<void> {
    const cacheKey = this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
    await this.cache.delete(cacheKey);
  }

  async clearAll(): Promise<void> {
    if (this.keyPrefix) {
      await this.cache.clearByTags([this.keyPrefix]);
    }
  }
}

/**
 * Factory functions
 */
export function createEnterpriseCache(config?: Partial<CacheConfig>): EnterpriseCacheSystem {
  return new EnterpriseCacheSystem(config);
}

export function createCacheWrapper<T = any>(
  cache: EnterpriseCacheSystem,
  keyPrefix?: string,
  defaultTTL?: number
): CacheAsideWrapper<T> {
  return new CacheAsideWrapper<T>(cache, keyPrefix, defaultTTL);
}

// Export singleton instance
export const enterpriseCache = createEnterpriseCache();