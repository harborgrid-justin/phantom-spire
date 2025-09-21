/**
 * Enterprise Caching Layer
 * Multi-level caching with invalidation strategies, compression, and distributed support
 */

import type { LoggerService } from '../services/core/LoggerService';

// Cache levels
export enum CacheLevel {
  MEMORY = 'memory',
  REDIS = 'redis',
  DATABASE = 'database',
  CDN = 'cdn',
}

// Cache strategies
export enum CacheStrategy {
  LRU = 'lru',           // Least Recently Used
  LFU = 'lfu',           // Least Frequently Used
  FIFO = 'fifo',         // First In, First Out
  TTL = 'ttl',           // Time To Live
  WRITE_THROUGH = 'write_through',
  WRITE_BEHIND = 'write_behind',
  REFRESH_AHEAD = 'refresh_ahead',
}

// Cache invalidation strategies
export enum InvalidationStrategy {
  TTL = 'ttl',
  MANUAL = 'manual',
  EVENT_DRIVEN = 'event_driven',
  PATTERN_BASED = 'pattern_based',
  DEPENDENCY_BASED = 'dependency_based',
  VERSIONED = 'versioned',
}

// Cache entry metadata
export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  ttl: number;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  size: number;
  compressed: boolean;
  version?: string;
  dependencies?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Cache configuration
export interface CacheConfig {
  name: string;
  level: CacheLevel;
  strategy: CacheStrategy;
  invalidationStrategy: InvalidationStrategy;
  defaultTTL: number;
  maxSize: number; // in bytes
  maxEntries: number;
  compressionThreshold: number; // bytes
  enableCompression: boolean;
  enableMetrics: boolean;
  enableDistribution: boolean;
  keyPrefix?: string;
  serializer?: 'json' | 'msgpack' | 'protobuf';
  redis?: {
    url: string;
    keyspace?: string;
    clusterMode?: boolean;
  };
}

// Cache statistics
export interface CacheStats {
  name: string;
  level: CacheLevel;
  hits: number;
  misses: number;
  hitRate: number;
  entries: number;
  size: number;
  avgAccessTime: number;
  evictions: number;
  compressionRatio: number;
  lastResetTime: Date;
  uptime: number;
}

// Cache interface
export interface ICache {
  readonly name: string;
  readonly level: CacheLevel;
  
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheSetOptions): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  clear(pattern?: string): Promise<number>;
  keys(pattern?: string): Promise<string[]>;
  getStats(): Promise<CacheStats>;
  getMetadata(key: string): Promise<Partial<CacheEntry> | null>;
  invalidate(strategy: InvalidationStrategy, options?: any): Promise<number>;
  warmup(loader: CacheLoader): Promise<void>;
}

// Cache set options
export interface CacheSetOptions {
  ttl?: number;
  tags?: string[];
  dependencies?: string[];
  version?: string;
  compress?: boolean;
  metadata?: Record<string, unknown>;
}

// Cache loader interface
export interface CacheLoader {
  load<T>(key: string): Promise<T | null>;
  loadMultiple?<T>(keys: string[]): Promise<Map<string, T>>;
}

// In-memory cache implementation with LRU eviction
export class MemoryCache implements ICache {
  public readonly name: string;
  public readonly level = CacheLevel.MEMORY;
  
  private entries = new Map<string, CacheEntry>();
  private accessOrder: string[] = [];
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalAccessTime: 0,
    accessCount: 0,
    lastResetTime: new Date(),
  };
  
  private cleanupTimer?: NodeJS.Timeout;
  private logger?: LoggerService;

  constructor(
    private readonly config: CacheConfig,
    logger?: LoggerService
  ) {
    this.name = config.name;
    this.logger = logger;
    this.startCleanup();
  }

  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    const prefixedKey = this.getPrefixedKey(key);
    const entry = this.entries.get(prefixedKey);

    if (!entry) {
      this.stats.misses++;
      this.updateAccessStats(Date.now() - startTime);
      return null;
    }

    // Check TTL
    if (this.isExpired(entry)) {
      this.entries.delete(prefixedKey);
      this.removeFromAccessOrder(prefixedKey);
      this.stats.misses++;
      this.updateAccessStats(Date.now() - startTime);
      return null;
    }

    // Update access information
    entry.lastAccessed = new Date();
    entry.accessCount++;
    this.updateAccessOrder(prefixedKey);
    
    this.stats.hits++;
    this.updateAccessStats(Date.now() - startTime);

    // Decompress if needed
    const value = entry.compressed ? this.decompress(entry.value) : entry.value;
    return value as T;
  }

  async set<T>(key: string, value: T, options: CacheSetOptions = {}): Promise<void> {
    const prefixedKey = this.getPrefixedKey(key);
    const ttl = options.ttl || this.config.defaultTTL;
    const now = new Date();
    
    // Serialize and compress if needed
    let serializedValue = value;
    let compressed = false;
    let size = this.estimateSize(value);

    if (this.config.enableCompression && size > this.config.compressionThreshold) {
      serializedValue = this.compress(value);
      compressed = true;
      size = this.estimateSize(serializedValue);
    }

    // Create cache entry
    const entry: CacheEntry<T> = {
      key: prefixedKey,
      value: serializedValue,
      ttl,
      createdAt: now,
      lastAccessed: now,
      accessCount: 0,
      size,
      compressed,
      version: options.version,
      dependencies: options.dependencies,
      tags: options.tags,
      metadata: options.metadata,
    };

    // Check if we need to evict entries
    await this.evictIfNeeded(size);

    // Store entry
    this.entries.set(prefixedKey, entry);
    this.updateAccessOrder(prefixedKey);

    this.logger?.debug(`Cache set: ${prefixedKey}`, {
      size,
      compressed,
      ttl,
      tags: options.tags,
    });
  }

  async delete(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    const deleted = this.entries.delete(prefixedKey);
    
    if (deleted) {
      this.removeFromAccessOrder(prefixedKey);
      this.logger?.debug(`Cache delete: ${prefixedKey}`);
    }
    
    return deleted;
  }

  async exists(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    const entry = this.entries.get(prefixedKey);
    
    if (!entry || this.isExpired(entry)) {
      return false;
    }
    
    return true;
  }

  async clear(pattern?: string): Promise<number> {
    let cleared = 0;

    if (!pattern) {
      cleared = this.entries.size;
      this.entries.clear();
      this.accessOrder = [];
    } else {
      const regex = new RegExp(pattern);
      const keysToDelete: string[] = [];

      for (const key of this.entries.keys()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        this.entries.delete(key);
        this.removeFromAccessOrder(key);
        cleared++;
      }
    }

    this.logger?.info(`Cache cleared: ${cleared} entries`, { pattern });
    return cleared;
  }

  async keys(pattern?: string): Promise<string[]> {
    const keys = Array.from(this.entries.keys());
    
    if (!pattern) {
      return keys.map(k => this.removePrefix(k));
    }
    
    const regex = new RegExp(pattern);
    return keys
      .filter(key => regex.test(key))
      .map(k => this.removePrefix(k));
  }

  async getStats(): Promise<CacheStats> {
    const totalEntries = this.entries.size;
    const totalSize = Array.from(this.entries.values())
      .reduce((sum, entry) => sum + entry.size, 0);
    
    const totalCompressedSize = Array.from(this.entries.values())
      .filter(entry => entry.compressed)
      .reduce((sum, entry) => sum + entry.size, 0);
    
    const totalUncompressedSize = Array.from(this.entries.values())
      .filter(entry => entry.compressed)
      .reduce((sum, entry) => sum + this.estimateSize(entry.value), 0);

    const compressionRatio = totalUncompressedSize > 0 
      ? (totalUncompressedSize - totalCompressedSize) / totalUncompressedSize 
      : 0;

    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    const avgAccessTime = this.stats.accessCount > 0 
      ? this.stats.totalAccessTime / this.stats.accessCount 
      : 0;

    return {
      name: this.name,
      level: this.level,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      entries: totalEntries,
      size: totalSize,
      avgAccessTime,
      evictions: this.stats.evictions,
      compressionRatio,
      lastResetTime: this.stats.lastResetTime,
      uptime: Date.now() - this.stats.lastResetTime.getTime(),
    };
  }

  async getMetadata(key: string): Promise<Partial<CacheEntry> | null> {
    const prefixedKey = this.getPrefixedKey(key);
    const entry = this.entries.get(prefixedKey);
    
    if (!entry || this.isExpired(entry)) {
      return null;
    }

    return {
      key: entry.key,
      ttl: entry.ttl,
      createdAt: entry.createdAt,
      lastAccessed: entry.lastAccessed,
      accessCount: entry.accessCount,
      size: entry.size,
      compressed: entry.compressed,
      version: entry.version,
      dependencies: entry.dependencies,
      tags: entry.tags,
      metadata: entry.metadata,
    };
  }

  async invalidate(strategy: InvalidationStrategy, options?: any): Promise<number> {
    let invalidated = 0;

    switch (strategy) {
      case InvalidationStrategy.TTL:
        invalidated = await this.invalidateExpired();
        break;

      case InvalidationStrategy.PATTERN_BASED:
        if (options?.pattern) {
          invalidated = await this.clear(options.pattern);
        }
        break;

      case InvalidationStrategy.DEPENDENCY_BASED:
        if (options?.dependency) {
          invalidated = await this.invalidateByDependency(options.dependency);
        }
        break;

      case InvalidationStrategy.VERSIONED:
        if (options?.version) {
          invalidated = await this.invalidateByVersion(options.version);
        }
        break;

      case InvalidationStrategy.MANUAL:
        if (options?.keys) {
          for (const key of options.keys) {
            if (await this.delete(key)) {
              invalidated++;
            }
          }
        }
        break;
    }

    this.logger?.info(`Cache invalidation completed`, {
      strategy,
      invalidated,
      options,
    });

    return invalidated;
  }

  async warmup(loader: CacheLoader): Promise<void> {
    this.logger?.info(`Starting cache warmup for ${this.name}`);
    
    // Implementation would depend on the specific loader
    // This is a placeholder for custom warmup logic
    
    this.logger?.info(`Cache warmup completed for ${this.name}`);
  }

  // Private methods

  private getPrefixedKey(key: string): string {
    return this.config.keyPrefix ? `${this.config.keyPrefix}:${key}` : key;
  }

  private removePrefix(key: string): string {
    if (this.config.keyPrefix) {
      const prefix = `${this.config.keyPrefix}:`;
      return key.startsWith(prefix) ? key.substring(prefix.length) : key;
    }
    return key;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.createdAt.getTime() > entry.ttl;
  }

  private updateAccessOrder(key: string): void {
    // Remove from current position
    this.removeFromAccessOrder(key);
    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private async evictIfNeeded(newEntrySize: number): Promise<void> {
    // Check size limit
    const currentSize = Array.from(this.entries.values())
      .reduce((sum, entry) => sum + entry.size, 0);
    
    if (currentSize + newEntrySize > this.config.maxSize) {
      await this.evictLRU(currentSize + newEntrySize - this.config.maxSize);
    }

    // Check entry limit
    if (this.entries.size >= this.config.maxEntries) {
      await this.evictLRU(0, this.entries.size - this.config.maxEntries + 1);
    }
  }

  private async evictLRU(targetSize: number, targetCount = 0): Promise<void> {
    let evictedSize = 0;
    let evictedCount = 0;

    // Evict least recently used entries
    while (this.accessOrder.length > 0 && 
           (evictedSize < targetSize || evictedCount < targetCount)) {
      const keyToEvict = this.accessOrder.shift()!;
      const entry = this.entries.get(keyToEvict);
      
      if (entry) {
        evictedSize += entry.size;
        evictedCount++;
        this.entries.delete(keyToEvict);
        this.stats.evictions++;
        
        this.logger?.debug(`Cache eviction: ${keyToEvict}`, {
          size: entry.size,
          age: Date.now() - entry.createdAt.getTime(),
        });
      }
    }

    if (evictedCount > 0) {
      this.logger?.info(`Cache evicted ${evictedCount} entries (${evictedSize} bytes)`);
    }
  }

  private async invalidateExpired(): Promise<number> {
    let invalidated = 0;
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.entries) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.entries.delete(key);
      this.removeFromAccessOrder(key);
      invalidated++;
    }

    return invalidated;
  }

  private async invalidateByDependency(dependency: string): Promise<number> {
    let invalidated = 0;
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.entries) {
      if (entry.dependencies?.includes(dependency)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.entries.delete(key);
      this.removeFromAccessOrder(key);
      invalidated++;
    }

    return invalidated;
  }

  private async invalidateByVersion(maxVersion: string): Promise<number> {
    let invalidated = 0;
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.entries) {
      if (entry.version && entry.version < maxVersion) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.entries.delete(key);
      this.removeFromAccessOrder(key);
      invalidated++;
    }

    return invalidated;
  }

  private compress<T>(value: T): string {
    // Simple compression using JSON + gzip simulation
    // In a real implementation, use a proper compression library
    return JSON.stringify(value);
  }

  private decompress<T>(compressedValue: unknown): T {
    // Simple decompression
    if (typeof compressedValue === 'string') {
      return JSON.parse(compressedValue);
    }
    return compressedValue as T;
  }

  private estimateSize(value: unknown): number {
    // Rough estimation of memory usage
    if (value === null || value === undefined) return 0;
    if (typeof value === 'boolean') return 4;
    if (typeof value === 'number') return 8;
    if (typeof value === 'string') return value.length * 2;
    if (value instanceof Date) return 24;
    if (Array.isArray(value)) {
      return 24 + value.reduce((sum, item) => sum + this.estimateSize(item), 0);
    }
    if (typeof value === 'object') {
      return 24 + Object.entries(value).reduce(
        (sum, [key, val]) => sum + this.estimateSize(key) + this.estimateSize(val),
        0
      );
    }
    return 0;
  }

  private updateAccessStats(accessTime: number): void {
    this.stats.accessCount++;
    this.stats.totalAccessTime += accessTime;
  }

  private startCleanup(): void {
    // Run cleanup every minute
    this.cleanupTimer = setInterval(async () => {
      await this.invalidateExpired();
    }, 60000);
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

// Multi-level cache manager
export class CacheManager {
  private static instance: CacheManager;
  private caches = new Map<string, ICache>();
  private defaultConfigs = new Map<CacheLevel, Partial<CacheConfig>>();
  private logger?: LoggerService;

  private constructor(logger?: LoggerService) {
    this.logger = logger;
    this.initializeDefaultConfigs();
  }

  static getInstance(logger?: LoggerService): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(logger);
    }
    return CacheManager.instance;
  }

  // Create and register a cache
  createCache(config: CacheConfig): ICache {
    // Merge with default config
    const defaultConfig = this.defaultConfigs.get(config.level);
    const finalConfig = { ...defaultConfig, ...config };

    let cache: ICache;

    switch (config.level) {
      case CacheLevel.MEMORY:
        cache = new MemoryCache(finalConfig, this.logger);
        break;
      
      case CacheLevel.REDIS:
        // In a real implementation, create Redis cache
        throw new Error('Redis cache not implemented yet');
      
      default:
        throw new Error(`Unsupported cache level: ${config.level}`);
    }

    this.caches.set(config.name, cache);
    this.logger?.info(`Cache created: ${config.name}`, {
      level: config.level,
      strategy: config.strategy,
    });

    return cache;
  }

  // Get cache by name
  getCache(name: string): ICache | undefined {
    return this.caches.get(name);
  }

  // Get or create cache
  getOrCreateCache(name: string, config: Omit<CacheConfig, 'name'>): ICache {
    const existingCache = this.getCache(name);
    if (existingCache) {
      return existingCache;
    }

    return this.createCache({ ...config, name });
  }

  // Get all caches
  getAllCaches(): Map<string, ICache> {
    return new Map(this.caches);
  }

  // Get aggregated statistics
  async getGlobalStats(): Promise<{
    totalCaches: number;
    cacheStats: CacheStats[];
    globalHitRate: number;
    totalSize: number;
    totalEntries: number;
  }> {
    const cacheStats: CacheStats[] = [];
    let totalHits = 0;
    let totalRequests = 0;
    let totalSize = 0;
    let totalEntries = 0;

    for (const cache of this.caches.values()) {
      const stats = await cache.getStats();
      cacheStats.push(stats);
      
      totalHits += stats.hits;
      totalRequests += stats.hits + stats.misses;
      totalSize += stats.size;
      totalEntries += stats.entries;
    }

    const globalHitRate = totalRequests > 0 ? totalHits / totalRequests : 0;

    return {
      totalCaches: this.caches.size,
      cacheStats,
      globalHitRate,
      totalSize,
      totalEntries,
    };
  }

  // Clear all caches
  async clearAll(): Promise<number> {
    let totalCleared = 0;

    for (const cache of this.caches.values()) {
      totalCleared += await cache.clear();
    }

    this.logger?.info(`All caches cleared: ${totalCleared} entries`);
    return totalCleared;
  }

  // Invalidate across all caches
  async invalidateAll(strategy: InvalidationStrategy, options?: any): Promise<number> {
    let totalInvalidated = 0;

    for (const cache of this.caches.values()) {
      totalInvalidated += await cache.invalidate(strategy, options);
    }

    this.logger?.info(`Global invalidation completed: ${totalInvalidated} entries`, {
      strategy,
      options,
    });

    return totalInvalidated;
  }

  // Warmup all caches
  async warmupAll(loaders: Map<string, CacheLoader>): Promise<void> {
    const warmupPromises: Promise<void>[] = [];

    for (const [cacheName, cache] of this.caches) {
      const loader = loaders.get(cacheName);
      if (loader) {
        warmupPromises.push(cache.warmup(loader));
      }
    }

    await Promise.allSettled(warmupPromises);
    this.logger?.info(`Cache warmup completed for ${warmupPromises.length} caches`);
  }

  // Remove and destroy cache
  destroyCache(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache && 'destroy' in cache) {
      (cache as any).destroy();
    }
    
    const removed = this.caches.delete(name);
    if (removed) {
      this.logger?.info(`Cache destroyed: ${name}`);
    }
    
    return removed;
  }

  private initializeDefaultConfigs(): void {
    this.defaultConfigs.set(CacheLevel.MEMORY, {
      strategy: CacheStrategy.LRU,
      invalidationStrategy: InvalidationStrategy.TTL,
      defaultTTL: 300000, // 5 minutes
      maxSize: 100 * 1024 * 1024, // 100MB
      maxEntries: 10000,
      compressionThreshold: 1024, // 1KB
      enableCompression: true,
      enableMetrics: true,
      enableDistribution: false,
    });

    this.defaultConfigs.set(CacheLevel.REDIS, {
      strategy: CacheStrategy.TTL,
      invalidationStrategy: InvalidationStrategy.TTL,
      defaultTTL: 3600000, // 1 hour
      maxSize: 1024 * 1024 * 1024, // 1GB
      maxEntries: 100000,
      compressionThreshold: 1024,
      enableCompression: true,
      enableMetrics: true,
      enableDistribution: true,
    });
  }
}

// Utility functions for common cache patterns
export const CacheUtils = {
  // Create a cache key from components
  createKey(...components: (string | number)[]): string {
    return components.map(c => String(c)).join(':');
  },

  // Cache decorator for methods
  cached(
    cacheName: string,
    options: {
      keyGenerator?: (...args: any[]) => string;
      ttl?: number;
      tags?: string[];
    } = {}
  ) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      const cache = CacheManager.getInstance().getCache(cacheName);

      if (!cache) {
        console.warn(`Cache '${cacheName}' not found, method will not be cached`);
        return;
      }

      descriptor.value = async function (...args: any[]) {
        const key = options.keyGenerator 
          ? options.keyGenerator(...args)
          : `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;

        // Try to get from cache
        const cached = await cache.get(key);
        if (cached !== null) {
          return cached;
        }

        // Execute original method and cache result
        const result = await originalMethod.apply(this, args);
        await cache.set(key, result, {
          ttl: options.ttl,
          tags: options.tags,
        });

        return result;
      };
    };
  },

  // Memoize function with cache
  memoize<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    cache: ICache,
    options: {
      keyGenerator?: (...args: Parameters<T>) => string;
      ttl?: number;
    } = {}
  ): T {
    return (async (...args: Parameters<T>) => {
      const key = options.keyGenerator 
        ? options.keyGenerator(...args)
        : `memoized:${fn.name}:${JSON.stringify(args)}`;

      const cached = await cache.get(key);
      if (cached !== null) {
        return cached;
      }

      const result = await fn(...args);
      await cache.set(key, result, { ttl: options.ttl });
      
      return result;
    }) as T;
  },
};

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Export types and utilities
export {
  CacheLevel,
  CacheStrategy,
  InvalidationStrategy,
  type ICache,
  type CacheConfig,
  type CacheEntry,
  type CacheStats,
  type CacheLoader,
};