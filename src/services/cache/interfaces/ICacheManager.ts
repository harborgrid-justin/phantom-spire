/**
 * Fortune 100-Grade Cache Management Interfaces
 * Enterprise-level caching system for Cyber Threat Intelligence Platform
 */

export enum CacheLayer {
  MEMORY = 'memory',
  REDIS = 'redis',
  PERSISTENT = 'persistent',
}

export enum CacheStrategy {
  LRU = 'lru',
  LFU = 'lfu',
  FIFO = 'fifo',
  TTL = 'ttl',
}

export interface ICacheOptions {
  ttl?: number; // Time to live in milliseconds
  layer?: CacheLayer;
  strategy?: CacheStrategy;
  compressed?: boolean;
  encrypted?: boolean;
  tags?: string[];
  namespace?: string;
}

export interface ICacheMetrics {
  hitCount: number;
  missCount: number;
  hitRate: number;
  size: number;
  memoryUsage: number;
  lastUpdated: Date;
}

export interface ICacheEntry<T = any> {
  key: string;
  value: T;
  ttl?: number;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  tags: string[];
  namespace: string;
  compressed: boolean;
  encrypted: boolean;
}

export interface ICacheConfiguration {
  maxSize: number;
  defaultTTL: number;
  strategy: CacheStrategy;
  compression: {
    enabled: boolean;
    threshold: number; // Bytes
  };
  encryption: {
    enabled: boolean;
    algorithm: string;
  };
  layers: {
    memory: {
      enabled: boolean;
      maxSize: number;
      ttl: number;
    };
    redis: {
      enabled: boolean;
      ttl: number;
      keyPrefix: string;
    };
    persistent: {
      enabled: boolean;
      ttl: number;
      collection: string;
    };
  };
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    alertThresholds: {
      hitRateBelow: number;
      memoryUsageAbove: number;
    };
  };
}

export interface ICacheManager {
  // Core operations
  get<T>(key: string, options?: ICacheOptions): Promise<T | null>;
  set<T>(key: string, value: T, options?: ICacheOptions): Promise<void>;
  delete(key: string, options?: ICacheOptions): Promise<boolean>;
  exists(key: string, options?: ICacheOptions): Promise<boolean>;

  // Bulk operations
  getMultiple<T>(
    keys: string[],
    options?: ICacheOptions
  ): Promise<Map<string, T>>;
  setMultiple<T>(
    entries: Map<string, T>,
    options?: ICacheOptions
  ): Promise<void>;
  deleteMultiple(keys: string[], options?: ICacheOptions): Promise<number>;

  // Pattern operations
  getByPattern<T>(
    pattern: string,
    options?: ICacheOptions
  ): Promise<Map<string, T>>;
  deleteByPattern(pattern: string, options?: ICacheOptions): Promise<number>;

  // Tag operations
  getByTags<T>(
    tags: string[],
    options?: ICacheOptions
  ): Promise<Map<string, T>>;
  deleteByTags(tags: string[], options?: ICacheOptions): Promise<number>;

  // Namespace operations
  clearNamespace(namespace: string): Promise<number>;
  getNamespaceSize(namespace: string): Promise<number>;

  // Analytics and monitoring
  getMetrics(layer?: CacheLayer): Promise<ICacheMetrics>;
  getHitRate(timeWindow?: number): Promise<number>;
  getTopKeys(
    limit?: number
  ): Promise<Array<{ key: string; accessCount: number }>>;

  // Cache warming and management
  warm(keys: string[], loader: (key: string) => Promise<any>): Promise<void>;
  invalidate(pattern?: string, tags?: string[]): Promise<number>;
  clear(layer?: CacheLayer): Promise<void>;

  // Configuration and lifecycle
  updateConfiguration(config: Partial<ICacheConfiguration>): Promise<void>;
  getConfiguration(): ICacheConfiguration;
  start(): Promise<void>;
  stop(): Promise<void>;

  // Events
  on(
    event: 'hit' | 'miss' | 'set' | 'delete' | 'error',
    callback: Function
  ): void;
  off(event: string, callback: Function): void;
}

export interface ICacheLoader<T> {
  load(key: string): Promise<T | null>;
  loadMultiple(keys: string[]): Promise<Map<string, T>>;
}

export interface ICacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getMetrics(): Promise<ICacheMetrics>;
  getKeys(pattern?: string): Promise<string[]>;
}
