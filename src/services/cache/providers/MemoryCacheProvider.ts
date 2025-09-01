/**
 * Memory Cache Provider
 * High-performance in-memory cache with LRU eviction
 */

import { EventEmitter } from 'events';
import { ICacheProvider, ICacheMetrics } from '../interfaces/ICacheManager.js';

interface MemoryCacheEntry<T = any> {
  value: T;
  expiresAt?: number;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
}

export class MemoryCacheProvider extends EventEmitter implements ICacheProvider {
  private cache: Map<string, MemoryCacheEntry> = new Map();
  private maxSize: number;
  private defaultTTL: number;
  private metrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0
  };

  constructor(maxSize: number = 1000, defaultTTL: number = 300000) { // 5 minutes default
    super();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    
    // Cleanup expired entries every 30 seconds
    setInterval(() => this.cleanup(), 30000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      this.emit('miss', { key });
      return null;
    }

    // Check if expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.metrics.misses++;
      this.emit('miss', { key, reason: 'expired' });
      return null;
    }

    // Update access information
    entry.lastAccessed = Date.now();
    entry.accessCount++;

    this.metrics.hits++;
    this.emit('hit', { key });
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const effectiveTTL = ttl || this.defaultTTL;
    const entry: MemoryCacheEntry<T> = {
      value,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0
    };

    if (effectiveTTL > 0) {
      entry.expiresAt = Date.now() + effectiveTTL;
    }

    this.cache.set(key, entry);
    this.metrics.sets++;
    this.emit('set', { key, value, ttl: effectiveTTL });
  }

  async delete(key: string): Promise<boolean> {
    const existed = this.cache.delete(key);
    if (existed) {
      this.metrics.deletes++;
      this.emit('delete', { key });
    }
    return existed;
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.emit('clear', { clearedCount: size });
  }

  async getMetrics(): Promise<ICacheMetrics> {
    const now = Date.now();
    const total = this.metrics.hits + this.metrics.misses;
    
    return {
      hitCount: this.metrics.hits,
      missCount: this.metrics.misses,
      hitRate: total > 0 ? this.metrics.hits / total : 0,
      size: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
      lastUpdated: new Date(now)
    };
  }

  async getKeys(pattern?: string): Promise<string[]> {
    const keys = Array.from(this.cache.keys());
    
    if (!pattern) return keys;
    
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(key => regex.test(key));
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestAccess = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.metrics.evictions++;
      this.emit('evict', { key: oldestKey, reason: 'lru' });
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this.emit('cleanup', { expiredCount });
    }
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in bytes
    let usage = 0;
    for (const [key, entry] of this.cache.entries()) {
      usage += key.length * 2; // UTF-16 encoding
      usage += JSON.stringify(entry.value).length * 2;
      usage += 64; // Overhead for entry metadata
    }
    return usage;
  }

  // Additional utility methods for debugging and monitoring
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ...this.metrics,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  getTopKeys(limit: number = 10): Array<{ key: string; accessCount: number; lastAccessed: Date }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        accessCount: entry.accessCount,
        lastAccessed: new Date(entry.lastAccessed)
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);

    return entries;
  }
}