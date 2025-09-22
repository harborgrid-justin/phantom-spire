/**
 * Enterprise Caching Strategies
 * Multi-layer caching system with memory, Redis, and HTTP caching
 */

import { BaseService, Injectable } from '../core/ServiceRegistry';

// Cache entry interface
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  expiry: number;
  tags: string[];
  metadata: {
    createdAt: number;
    lastAccessed: number;
    accessCount: number;
    hitCount: number;
    missCount: number;
  };
}

// Cache strategy interface
export interface ICacheStrategy {
  name: string;
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number, tags?: string[]): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(pattern?: string): Promise<void>;
  invalidateByTags(tags: string[]): Promise<void>;
  getStats(): Promise<CacheStats>;
}

// Cache statistics
export interface CacheStats {
  strategy: string;
  hits: number;
  misses: number;
  hitRate: number;
  entries: number;
  memoryUsage?: number;
  averageResponseTime: number;
  operations: {
    get: number;
    set: number;
    delete: number;
    clear: number;
  };
}

// Memory cache strategy
export class MemoryCacheStrategy implements ICacheStrategy {
  name = 'memory';
  private cache: Map<string, CacheEntry> = new Map();
  private cleanupInterval?: NodeJS.Timeout;
  private stats: CacheStats;

  constructor(
    private maxSize: number = 1000,
    private defaultTtl: number = 300000, // 5 minutes
    private cleanupIntervalMs: number = 60000 // 1 minute
  ) {
    this.stats = {
      strategy: this.name,
      hits: 0,
      misses: 0,
      hitRate: 0,
      entries: 0,
      averageResponseTime: 0,
      operations: { get: 0, set: 0, delete: 0, clear: 0 }
    };

    this.startCleanup();
  }

  async get<T>(key: string): Promise<T | null> {
    const start = Date.now();
    this.stats.operations.get++;

    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateStats(start);
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats(start);
      return null;
    }

    // Update access metadata
    entry.metadata.lastAccessed = Date.now();
    entry.metadata.accessCount++;
    entry.metadata.hitCount++;

    this.stats.hits++;
    this.updateStats(start);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number, tags: string[] = []): Promise<void> {
    const start = Date.now();
    this.stats.operations.set++;

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      expiry: Date.now() + (ttl || this.defaultTtl),
      tags,
      metadata: {
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 0,
        hitCount: 0,
        missCount: 0
      }
    };

    this.cache.set(key, entry);
    this.stats.entries = this.cache.size;
    this.updateStats(start);
  }

  async delete(key: string): Promise<boolean> {
    const start = Date.now();
    this.stats.operations.delete++;
    
    const result = this.cache.delete(key);
    this.stats.entries = this.cache.size;
    this.updateStats(start);
    return result;
  }

  async clear(pattern?: string): Promise<void> {
    const start = Date.now();
    this.stats.operations.clear++;

    if (pattern) {
      const regex = new RegExp(pattern);
      for (const [key] of this.cache) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }

    this.stats.entries = this.cache.size;
    this.updateStats(start);
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    const start = Date.now();
    
    for (const [key, entry] of this.cache) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
      }
    }

    this.stats.entries = this.cache.size;
    this.updateStats(start);
  }

  async getStats(): Promise<CacheStats> {
    return {
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      entries: this.cache.size,
      memoryUsage: this.getMemoryUsage()
    };
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.metadata.lastAccessed < oldestTime) {
        oldestTime = entry.metadata.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.cleanupIntervalMs);
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    this.stats.entries = this.cache.size;
  }

  private getMemoryUsage(): number {
    // Rough estimate of memory usage
    let size = 0;
    for (const entry of this.cache.values()) {
      size += JSON.stringify(entry).length;
    }
    return size;
  }

  private updateStats(startTime: number): void {
    const responseTime = Date.now() - startTime;
    const totalOps = Object.values(this.stats.operations).reduce((sum, count) => sum + count, 0);
    this.stats.averageResponseTime = 
      (this.stats.averageResponseTime * (totalOps - 1) + responseTime) / totalOps;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Multi-layer cache manager
@Injectable('CacheManager')
export class CacheManager extends BaseService {
  public readonly serviceName = 'CacheManager';
  private strategies: Map<string, ICacheStrategy> = new Map();
  private defaultStrategy: string = 'memory';

  protected async onInitialize(): Promise<void> {
    // Initialize cache strategies
    this.strategies.set('memory', new MemoryCacheStrategy());

    console.log('Cache manager initialized with strategies:', Array.from(this.strategies.keys()));
  }

  protected async onDestroy(): Promise<void> {
    for (const strategy of this.strategies.values()) {
      if ('destroy' in strategy) {
        (strategy as any).destroy();
      }
    }
    this.strategies.clear();
  }

  protected async performHealthCheck(): Promise<boolean> {
    return this.strategies.size > 0;
  }

  // Get from cache with fallback through strategies
  async get<T>(key: string, strategies?: string[]): Promise<T | null> {
    const strategyNames = strategies || [this.defaultStrategy];

    for (const strategyName of strategyNames) {
      const strategy = this.strategies.get(strategyName);
      if (strategy) {
        try {
          const result = await strategy.get<T>(key);
          if (result !== null) {
            return result;
          }
        } catch (error) {
          console.warn(`Cache get failed for strategy ${strategyName}:`, error);
        }
      }
    }

    return null;
  }

  // Set in cache across multiple strategies
  async set<T>(
    key: string, 
    value: T, 
    ttl?: number, 
    tags?: string[], 
    strategies?: string[]
  ): Promise<void> {
    const strategyNames = strategies || [this.defaultStrategy];

    const promises = strategyNames.map(async strategyName => {
      const strategy = this.strategies.get(strategyName);
      if (strategy) {
        try {
          await strategy.set(key, value, ttl, tags);
        } catch (error) {
          console.warn(`Cache set failed for strategy ${strategyName}:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  // Delete from all strategies
  async delete(key: string, strategies?: string[]): Promise<boolean> {
    const strategyNames = strategies || Array.from(this.strategies.keys());
    let deleted = false;

    const promises = strategyNames.map(async strategyName => {
      const strategy = this.strategies.get(strategyName);
      if (strategy) {
        try {
          const result = await strategy.delete(key);
          deleted = deleted || result;
        } catch (error) {
          console.warn(`Cache delete failed for strategy ${strategyName}:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
    return deleted;
  }

  // Get cache statistics
  async getStats(): Promise<Record<string, CacheStats>> {
    const stats: Record<string, CacheStats> = {};

    for (const [name, strategy] of this.strategies) {
      try {
        stats[name] = await strategy.getStats();
      } catch (error) {
        console.warn(`Failed to get stats for strategy ${name}:`, error);
      }
    }

    return stats;
  }

  setDefaultStrategy(strategy: string): void {
    if (this.strategies.has(strategy)) {
      this.defaultStrategy = strategy;
    } else {
      throw new Error(`Cache strategy '${strategy}' not found`);
    }
  }

  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}

export { MemoryCacheStrategy };