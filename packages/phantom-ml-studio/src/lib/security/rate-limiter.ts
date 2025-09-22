/**
 * Enterprise Rate Limiting and Throttling System
 * Advanced rate limiting with Redis backend, multiple algorithms, and dynamic scaling
 */

import type { LoggerService } from '..\services\core\LoggerService';
import type { ICache } from '../utils/enterprise-cache';

// Rate limiting algorithms
export enum RateLimitAlgorithm {
  TOKEN_BUCKET = 'token_bucket',
  LEAKY_BUCKET = 'leaky_bucket',
  FIXED_WINDOW = 'fixed_window',
  SLIDING_WINDOW_LOG = 'sliding_window_log',
  SLIDING_WINDOW_COUNTER = 'sliding_window_counter',
}

// Rate limit strategy
export interface RateLimitStrategy {
  algorithm: RateLimitAlgorithm;
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  
  // Token bucket specific
  refillRate?: number;
  bucketCapacity?: number;
  
  // Leaky bucket specific
  leakRate?: number;
  
  // Sliding window specific
  segments?: number;
}

// Rate limit tier configuration
export interface RateLimitTier {
  name: string;
  description: string;
  limits: {
    [endpoint: string]: RateLimitStrategy;
  };
  globalLimit?: RateLimitStrategy;
  priority: number;
  
  // Dynamic scaling
  autoScale?: {
    enabled: boolean;
    scaleUpThreshold: number; // CPU/memory threshold to scale up limits
    scaleDownThreshold: number;
    scaleMultiplier: number;
    cooldownMs: number;
  };
}

// Rate limit result
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
  tier: string;
  algorithm: RateLimitAlgorithm;
  
  // Additional metadata
  currentWindow: {
    start: Date;
    end: Date;
    requestCount: number;
  };
  
  // Rate limit headers for HTTP responses
  headers: {
    'X-RateLimit-Limit': string;
    'X-RateLimit-Remaining': string;
    'X-RateLimit-Reset': string;
    'X-RateLimit-RetryAfter'?: string;
    'X-RateLimit-Policy': string;
  };
}

// Rate limit violation event
export interface RateLimitViolation {
  timestamp: Date;
  key: string;
  tier: string;
  endpoint: string;
  algorithm: RateLimitAlgorithm;
  requestCount: number;
  limit: number;
  clientInfo: {
    ip: string;
    userAgent?: string;
    userId?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Default rate limit tiers
const DEFAULT_RATE_LIMIT_TIERS: RateLimitTier[] = [
  {
    name: 'free',
    description: 'Free tier with basic limits',
    priority: 1,
    globalLimit: {
      algorithm: RateLimitAlgorithm.SLIDING_WINDOW_COUNTER,
      windowMs: 60000, // 1 minute
      maxRequests: 100,
      segments: 6, // 10-second segments
    },
    limits: {
      '/api/auth/login': {
        algorithm: RateLimitAlgorithm.FIXED_WINDOW,
        windowMs: 900000, // 15 minutes
        maxRequests: 5,
      },
      '/api/models': {
        algorithm: RateLimitAlgorithm.TOKEN_BUCKET,
        windowMs: 60000,
        maxRequests: 20,
        refillRate: 1, // 1 token per minute
        bucketCapacity: 20,
      },
      '/api/predictions': {
        algorithm: RateLimitAlgorithm.LEAKY_BUCKET,
        windowMs: 60000,
        maxRequests: 50,
        leakRate: 1, // 1 request per second
      },
    },
  },
  {
    name: 'premium',
    description: 'Premium tier with higher limits',
    priority: 2,
    globalLimit: {
      algorithm: RateLimitAlgorithm.SLIDING_WINDOW_COUNTER,
      windowMs: 60000,
      maxRequests: 1000,
      segments: 12, // 5-second segments
    },
    limits: {
      '/api/auth/login': {
        algorithm: RateLimitAlgorithm.FIXED_WINDOW,
        windowMs: 900000,
        maxRequests: 20,
      },
      '/api/models': {
        algorithm: RateLimitAlgorithm.TOKEN_BUCKET,
        windowMs: 60000,
        maxRequests: 200,
        refillRate: 5,
        bucketCapacity: 200,
      },
      '/api/predictions': {
        algorithm: RateLimitAlgorithm.SLIDING_WINDOW_LOG,
        windowMs: 60000,
        maxRequests: 500,
      },
    },
    autoScale: {
      enabled: true,
      scaleUpThreshold: 80, // 80% CPU/memory
      scaleDownThreshold: 30,
      scaleMultiplier: 1.5,
      cooldownMs: 300000, // 5 minutes
    },
  },
  {
    name: 'enterprise',
    description: 'Enterprise tier with custom limits',
    priority: 3,
    globalLimit: {
      algorithm: RateLimitAlgorithm.SLIDING_WINDOW_COUNTER,
      windowMs: 60000,
      maxRequests: 10000,
      segments: 60, // 1-second segments
    },
    limits: {
      '/api/auth/login': {
        algorithm: RateLimitAlgorithm.FIXED_WINDOW,
        windowMs: 900000,
        maxRequests: 100,
      },
      '/api/models': {
        algorithm: RateLimitAlgorithm.TOKEN_BUCKET,
        windowMs: 60000,
        maxRequests: 2000,
        refillRate: 50,
        bucketCapacity: 2000,
      },
      '/api/predictions': {
        algorithm: RateLimitAlgorithm.SLIDING_WINDOW_LOG,
        windowMs: 60000,
        maxRequests: 5000,
      },
    },
    autoScale: {
      enabled: true,
      scaleUpThreshold: 70,
      scaleDownThreshold: 20,
      scaleMultiplier: 2.0,
      cooldownMs: 180000, // 3 minutes
    },
  },
];

// Rate limit storage interface
interface IRateLimitStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttlMs?: number): Promise<void>;
  increment(key: string, ttlMs?: number): Promise<number>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
}

// Redis-compatible storage implementation
class CacheRateLimitStorage implements IRateLimitStorage {
  constructor(private cache: ICache) {}

  async get(key: string): Promise<any> {
    return await this.cache.get(key);
  }

  async set(key: string, value: any, ttlMs?: number): Promise<void> {
    await this.cache.set(key, value, { ttl: ttlMs });
  }

  async increment(key: string, ttlMs?: number): Promise<number> {
    const current = (await this.cache.get<number>(key)) || 0;
    const incremented = current + 1;
    await this.cache.set(key, incremented, { ttl: ttlMs });
    return incremented;
  }

  async delete(key: string): Promise<boolean> {
    return await this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return await this.cache.exists(key);
  }
}

// Rate limiter implementation
export class EnterpriseRateLimiter {
  private readonly tiers = new Map<string, RateLimitTier>();
  private readonly storage: IRateLimitStorage;
  private readonly logger?: LoggerService;
  private readonly violations: RateLimitViolation[] = [];
  
  // Auto-scaling state
  private readonly autoScaleState = new Map<string, {
    lastScaleTime: Date;
    currentMultiplier: number;
    isScaled: boolean;
  }>();

  constructor(
    storage: ICache | IRateLimitStorage,
    tiers: RateLimitTier[] = DEFAULT_RATE_LIMIT_TIERS,
    logger?: LoggerService
  ) {
    this.storage = storage instanceof Object && 'get' in storage 
      ? storage as IRateLimitStorage
      : new CacheRateLimitStorage(storage as ICache);
    this.logger = logger;
    
    // Register tiers
    for (const tier of tiers) {
      this.registerTier(tier);
    }
  }

  // Register a rate limit tier
  registerTier(tier: RateLimitTier): void {
    this.tiers.set(tier.name, tier);
    this.logger?.info(`Rate limit tier registered: ${tier.name}`, {
      globalLimit: tier.globalLimit?.maxRequests,
      endpointCount: Object.keys(tier.limits).length,
    });
  }

  // Get tier by name
  getTier(name: string): RateLimitTier | undefined {
    return this.tiers.get(name);
  }

  // Check rate limit
  async checkRateLimit(
    key: string,
    tierName: string,
    endpoint?: string
  ): Promise<RateLimitResult> {
    const tier = this.getTier(tierName);
    if (!tier) {
      throw new Error(`Rate limit tier '${tierName}' not found`);
    }

    // Determine which strategy to use
    let strategy: RateLimitStrategy;
    
    if (endpoint && tier.limits[endpoint]) {
      strategy = tier.limits[endpoint];
    } else if (tier.globalLimit) {
      strategy = tier.globalLimit;
    } else {
      throw new Error(`No rate limit strategy found for endpoint '${endpoint}' in tier '${tierName}'`);
    }

    // Apply auto-scaling if enabled
    const scaledStrategy = await this.applyAutoScaling(tier, strategy, endpoint);

    // Check rate limit based on algorithm
    const result = await this.checkAlgorithm(key, scaledStrategy, tierName, endpoint);

    // Record violation if rate limit exceeded
    if (!result.allowed) {
      await this.recordViolation(key, tier, endpoint || 'global', scaledStrategy, result);
    }

    return result;
  }

  // Create middleware for Express/Fastify
  createMiddleware(options: {
    tierResolver: (req: any) => string | Promise<string>;
    keyGenerator?: (req: any) => string;
    onLimitReached?: (req: any, res: any, result: RateLimitResult) => void;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  }) {
    return async (req: any, res: any, next: any) => {
      try {
        // Generate rate limit key
        const key = options.keyGenerator ? 
          options.keyGenerator(req) : 
          this.defaultKeyGenerator(req);

        // Resolve tier for this request
        const tier = await options.tierResolver(req);

        // Get endpoint path
        const endpoint = req.path || req.url;

        // Check rate limit
        const result = await this.checkRateLimit(key, tier, endpoint);

        // Set rate limit headers
        for (const [headerName, headerValue] of Object.entries(result.headers)) {
          res.set(headerName, headerValue);
        }

        if (!result.allowed) {
          // Rate limit exceeded
          if (options.onLimitReached) {
            options.onLimitReached(req, res, result);
          } else {
            res.status(429).json({
              error: 'Too Many Requests',
              message: 'Rate limit exceeded',
              retryAfter: result.retryAfter,
              limit: result.limit,
              remaining: result.remaining,
              resetTime: result.resetTime,
            });
          }
          return;
        }

        // Store result for potential cleanup logic
        res.locals.rateLimitResult = result;
        
        // Handle successful/failed request tracking
        const originalSend = res.send;
        res.send = function(data: any) {
          const statusCode = res.statusCode;
          const shouldSkip = 
            (options.skipSuccessfulRequests && statusCode < 400) ||
            (options.skipFailedRequests && statusCode >= 400);

          if (shouldSkip) {
            // TODO: Implement request cleanup logic
          }

          return originalSend.call(this, data);
        };

        next();
      } catch (error) {
        this.logger?.error('Rate limiter middleware error', error);
        next(); // Continue on error to not break the application
      }
    };
  }

  // Get rate limit statistics
  async getRateLimitStats(tierName?: string, endpoint?: string): Promise<{
    totalRequests: number;
    allowedRequests: number;
    blockedRequests: number;
    violationsByTier: Record<string, number>;
    violationsByEndpoint: Record<string, number>;
    topViolators: Array<{ key: string; count: number }>;
    recentViolations: RateLimitViolation[];
  }> {
    let filteredViolations = this.violations;

    if (tierName) {
      filteredViolations = filteredViolations.filter(v => v.tier === tierName);
    }

    if (endpoint) {
      filteredViolations = filteredViolations.filter(v => v.endpoint === endpoint);
    }

    const violationsByTier: Record<string, number> = {};
    const violationsByEndpoint: Record<string, number> = {};
    const violatorCounts: Record<string, number> = {};

    for (const violation of filteredViolations) {
      violationsByTier[violation.tier] = (violationsByTier[violation.tier] || 0) + 1;
      violationsByEndpoint[violation.endpoint] = (violationsByEndpoint[violation.endpoint] || 0) + 1;
      violatorCounts[violation.key] = (violatorCounts[violation.key] || 0) + 1;
    }

    const topViolators = Object.entries(violatorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key, count]) => ({ key, count }));

    const recentViolations = filteredViolations
      .slice(-100)
      .reverse();

    // TODO: Track allowed/total requests properly
    const blockedRequests = filteredViolations.length;

    return {
      totalRequests: blockedRequests * 10, // Rough estimate
      allowedRequests: blockedRequests * 9, // Rough estimate
      blockedRequests,
      violationsByTier,
      violationsByEndpoint,
      topViolators,
      recentViolations,
    };
  }

  // Clear rate limits for a key
  async clearRateLimit(key: string): Promise<void> {
    await this.storage.delete(key);
    this.logger?.info('Rate limit cleared', { key });
  }

  // Get current system load for auto-scaling
  private getSystemLoad(): { cpu: number; memory: number } {
    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    // Simplified CPU calculation
    const cpuUsage = process.cpuUsage();
    const cpuPercent = Math.min(100, (cpuUsage.user + cpuUsage.system) / 10000);

    return {
      cpu: cpuPercent,
      memory: memoryPercent,
    };
  }

  // Apply auto-scaling to rate limits
  private async applyAutoScaling(
    tier: RateLimitTier,
    strategy: RateLimitStrategy,
    endpoint?: string
  ): Promise<RateLimitStrategy> {
    if (!tier.autoScale?.enabled) {
      return strategy;
    }

    const scaleKey = `${tier.name}:${endpoint || 'global'}`;
    const scaleState = this.autoScaleState.get(scaleKey) || {
      lastScaleTime: new Date(0),
      currentMultiplier: 1,
      isScaled: false,
    };

    // Check cooldown period
    const now = new Date();
    const timeSinceLastScale = now.getTime() - scaleState.lastScaleTime.getTime();
    if (timeSinceLastScale < tier.autoScale.cooldownMs) {
      // Return current scaled strategy
      return {
        ...strategy,
        maxRequests: Math.floor(strategy.maxRequests * scaleState.currentMultiplier),
      };
    }

    const { cpu, memory } = this.getSystemLoad();
    const maxLoad = Math.max(cpu, memory);

    let newMultiplier = scaleState.currentMultiplier;
    let shouldUpdate = false;

    // Scale up if load is high
    if (maxLoad > tier.autoScale.scaleUpThreshold && !scaleState.isScaled) {
      newMultiplier = tier.autoScale.scaleMultiplier;
      shouldUpdate = true;
      scaleState.isScaled = true;
      
      this.logger?.info('Auto-scaling rate limits up', {
        tier: tier.name,
        endpoint,
        load: maxLoad,
        multiplier: newMultiplier,
      });
    }
    // Scale down if load is low
    else if (maxLoad < tier.autoScale.scaleDownThreshold && scaleState.isScaled) {
      newMultiplier = 1;
      shouldUpdate = true;
      scaleState.isScaled = false;
      
      this.logger?.info('Auto-scaling rate limits down', {
        tier: tier.name,
        endpoint,
        load: maxLoad,
        multiplier: newMultiplier,
      });
    }

    if (shouldUpdate) {
      scaleState.currentMultiplier = newMultiplier;
      scaleState.lastScaleTime = now;
      this.autoScaleState.set(scaleKey, scaleState);
    }

    return {
      ...strategy,
      maxRequests: Math.floor(strategy.maxRequests * scaleState.currentMultiplier),
    };
  }

  // Check rate limit using specific algorithm
  private async checkAlgorithm(
    key: string,
    strategy: RateLimitStrategy,
    tierName: string,
    endpoint?: string
  ): Promise<RateLimitResult> {
    switch (strategy.algorithm) {
      case RateLimitAlgorithm.FIXED_WINDOW:
        return await this.checkFixedWindow(key, strategy, tierName);

      case RateLimitAlgorithm.SLIDING_WINDOW_COUNTER:
        return await this.checkSlidingWindowCounter(key, strategy, tierName);

      case RateLimitAlgorithm.SLIDING_WINDOW_LOG:
        return await this.checkSlidingWindowLog(key, strategy, tierName);

      case RateLimitAlgorithm.TOKEN_BUCKET:
        return await this.checkTokenBucket(key, strategy, tierName);

      case RateLimitAlgorithm.LEAKY_BUCKET:
        return await this.checkLeakyBucket(key, strategy, tierName);

      default:
        throw new Error(`Unsupported rate limit algorithm: ${strategy.algorithm}`);
    }
  }

  // Fixed window algorithm
  private async checkFixedWindow(
    key: string,
    strategy: RateLimitStrategy,
    tierName: string
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = Math.floor(now / strategy.windowMs) * strategy.windowMs;
    const windowKey = `${key}:${windowStart}`;

    const count = await this.storage.increment(windowKey, strategy.windowMs);
    const allowed = count <= strategy.maxRequests;
    const remaining = Math.max(0, strategy.maxRequests - count);
    const resetTime = new Date(windowStart + strategy.windowMs);

    return {
      allowed,
      limit: strategy.maxRequests,
      remaining,
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil((resetTime.getTime() - now) / 1000),
      tier: tierName,
      algorithm: strategy.algorithm,
      currentWindow: {
        start: new Date(windowStart),
        end: resetTime,
        requestCount: count,
      },
      headers: this.buildHeaders(strategy.maxRequests, remaining, resetTime, tierName, strategy.algorithm),
    };
  }

  // Sliding window counter algorithm
  private async checkSlidingWindowCounter(
    key: string,
    strategy: RateLimitStrategy,
    tierName: string
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const segments = strategy.segments || 10;
    const segmentDuration = strategy.windowMs / segments;
    
    let totalCount = 0;
    const currentSegment = Math.floor(now / segmentDuration);
    
    // Count requests in sliding window
    for (let i = 0; i < segments; i++) {
      const segmentStart = currentSegment - i;
      const segmentKey = `${key}:segment:${segmentStart}`;
      const segmentCount = (await this.storage.get(segmentKey)) || 0;
      
      // Weight based on how much of the segment is in the current window
      const segmentAge = i * segmentDuration;
      const weight = Math.max(0, 1 - (segmentAge / strategy.windowMs));
      totalCount += segmentCount * weight;
    }

    // Increment current segment
    const currentSegmentKey = `${key}:segment:${currentSegment}`;
    await this.storage.increment(currentSegmentKey, strategy.windowMs);
    totalCount += 1; // Add current request

    const allowed = totalCount <= strategy.maxRequests;
    const remaining = Math.max(0, strategy.maxRequests - Math.floor(totalCount));
    const resetTime = new Date(now + strategy.windowMs);

    return {
      allowed,
      limit: strategy.maxRequests,
      remaining,
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil(strategy.windowMs / 1000),
      tier: tierName,
      algorithm: strategy.algorithm,
      currentWindow: {
        start: new Date(now - strategy.windowMs),
        end: resetTime,
        requestCount: Math.floor(totalCount),
      },
      headers: this.buildHeaders(strategy.maxRequests, remaining, resetTime, tierName, strategy.algorithm),
    };
  }

  // Sliding window log algorithm
  private async checkSlidingWindowLog(
    key: string,
    strategy: RateLimitStrategy,
    tierName: string
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - strategy.windowMs;
    
    // Get existing timestamps
    const existingLog = (await this.storage.get(key)) || [];
    const timestamps: number[] = Array.isArray(existingLog) ? existingLog : [];
    
    // Filter out expired timestamps
    const validTimestamps = timestamps.filter(ts => ts > windowStart);
    
    // Add current timestamp
    validTimestamps.push(now);
    
    const allowed = validTimestamps.length <= strategy.maxRequests;
    
    if (allowed) {
      // Store updated log
      await this.storage.set(key, validTimestamps, strategy.windowMs);
    }

    const remaining = Math.max(0, strategy.maxRequests - validTimestamps.length);
    const resetTime = new Date(now + strategy.windowMs);

    return {
      allowed,
      limit: strategy.maxRequests,
      remaining,
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil(strategy.windowMs / 1000),
      tier: tierName,
      algorithm: strategy.algorithm,
      currentWindow: {
        start: new Date(windowStart),
        end: resetTime,
        requestCount: validTimestamps.length,
      },
      headers: this.buildHeaders(strategy.maxRequests, remaining, resetTime, tierName, strategy.algorithm),
    };
  }

  // Token bucket algorithm
  private async checkTokenBucket(
    key: string,
    strategy: RateLimitStrategy,
    tierName: string
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const refillRate = strategy.refillRate || 1; // tokens per minute
    const capacity = strategy.bucketCapacity || strategy.maxRequests;
    
    // Get current bucket state
    const bucketKey = `${key}:bucket`;
    const bucketData = (await this.storage.get(bucketKey)) || {
      tokens: capacity,
      lastRefill: now,
    };

    // Calculate tokens to add based on elapsed time
    const timeSinceLastRefill = now - bucketData.lastRefill;
    const tokensToAdd = Math.floor((timeSinceLastRefill / 60000) * refillRate); // per minute
    
    // Update token count
    const currentTokens = Math.min(capacity, bucketData.tokens + tokensToAdd);
    const allowed = currentTokens > 0;
    
    const newTokens = allowed ? currentTokens - 1 : currentTokens;
    
    // Update bucket state
    await this.storage.set(bucketKey, {
      tokens: newTokens,
      lastRefill: now,
    }, strategy.windowMs);

    const remaining = newTokens;
    const resetTime = new Date(now + strategy.windowMs);

    return {
      allowed,
      limit: capacity,
      remaining,
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil(60 / refillRate), // seconds until next token
      tier: tierName,
      algorithm: strategy.algorithm,
      currentWindow: {
        start: new Date(bucketData.lastRefill),
        end: resetTime,
        requestCount: capacity - newTokens,
      },
      headers: this.buildHeaders(capacity, remaining, resetTime, tierName, strategy.algorithm),
    };
  }

  // Leaky bucket algorithm
  private async checkLeakyBucket(
    key: string,
    strategy: RateLimitStrategy,
    tierName: string
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const leakRate = strategy.leakRate || 1; // requests per second
    const capacity = strategy.maxRequests;
    
    // Get current bucket state
    const bucketKey = `${key}:leaky`;
    const bucketData = (await this.storage.get(bucketKey)) || {
      level: 0,
      lastLeak: now,
    };

    // Calculate how much has leaked since last access
    const timeSinceLastLeak = now - bucketData.lastLeak;
    const leaked = Math.floor((timeSinceLastLeak / 1000) * leakRate);
    
    // Update bucket level
    const currentLevel = Math.max(0, bucketData.level - leaked);
    const allowed = currentLevel < capacity;
    
    const newLevel = allowed ? currentLevel + 1 : currentLevel;
    
    // Update bucket state
    await this.storage.set(bucketKey, {
      level: newLevel,
      lastLeak: now,
    }, strategy.windowMs);

    const remaining = capacity - newLevel;
    const resetTime = new Date(now + strategy.windowMs);

    return {
      allowed,
      limit: capacity,
      remaining,
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil(1 / leakRate), // seconds until bucket can accept request
      tier: tierName,
      algorithm: strategy.algorithm,
      currentWindow: {
        start: new Date(bucketData.lastLeak),
        end: resetTime,
        requestCount: newLevel,
      },
      headers: this.buildHeaders(capacity, remaining, resetTime, tierName, strategy.algorithm),
    };
  }

  // Build HTTP headers for rate limit response
  private buildHeaders(
    limit: number,
    remaining: number,
    resetTime: Date,
    tier: string,
    algorithm: RateLimitAlgorithm
  ): RateLimitResult['headers'] {
    return {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(resetTime.getTime() / 1000).toString(),
      'X-RateLimit-Policy': `${tier};${algorithm}`,
    };
  }

  // Record rate limit violation
  private async recordViolation(
    key: string,
    tier: RateLimitTier,
    endpoint: string,
    strategy: RateLimitStrategy,
    result: RateLimitResult
  ): Promise<void> {
    // Parse client info from key (assuming format like "ip:1.2.3.4" or "user:123")
    const [keyType, keyValue] = key.split(':', 2);
    const clientInfo = {
      ip: keyType === 'ip' ? keyValue : 'unknown',
      userId: keyType === 'user' ? keyValue : undefined,
    };

    // Determine severity based on how much the limit was exceeded
    const excessRatio = result.currentWindow.requestCount / strategy.maxRequests;
    let severity: RateLimitViolation['severity'];
    
    if (excessRatio > 10) {
      severity = 'critical';
    } else if (excessRatio > 5) {
      severity = 'high';
    } else if (excessRatio > 2) {
      severity = 'medium';
    } else {
      severity = 'low';
    }

    const violation: RateLimitViolation = {
      timestamp: new Date(),
      key,
      tier: tier.name,
      endpoint,
      algorithm: strategy.algorithm,
      requestCount: result.currentWindow.requestCount,
      limit: strategy.maxRequests,
      clientInfo,
      severity,
    };

    this.violations.push(violation);

    // Keep only the last 10000 violations to prevent memory issues
    if (this.violations.length > 10000) {
      this.violations.splice(0, this.violations.length - 10000);
    }

    this.logger?.warn('Rate limit violation', {
      key,
      tier: tier.name,
      endpoint,
      requestCount: result.currentWindow.requestCount,
      limit: strategy.maxRequests,
      severity,
    });
  }

  // Default key generator
  private defaultKeyGenerator(req: any): string {
    // Try to get user ID first, then fall back to IP
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }
    
    const ip = req.ip || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress || 
               '0.0.0.0';
    
    return `ip:${ip}`;
  }
}

// Rate limiting utilities
export const RateLimitUtils = {
  // Create tier resolver based on API key
  createApiKeyTierResolver(apiKeyToTier: Map<string, string>, defaultTier = 'free') {
    return (req: any): string => {
      const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
      return apiKeyToTier.get(apiKey) || defaultTier;
    };
  },

  // Create tier resolver based on user properties
  createUserTierResolver(defaultTier = 'free') {
    return (req: any): string => {
      return req.user?.tier || req.user?.plan || defaultTier;
    };
  },

  // Create dynamic key generator
  createKeyGenerator(options: {
    includeUserId?: boolean;
    includeApiKey?: boolean;
    includeEndpoint?: boolean;
    includeMethod?: boolean;
  } = {}) {
    return (req: any): string => {
      const parts: string[] = [];

      if (options.includeUserId && req.user?.id) {
        parts.push(`user:${req.user.id}`);
      } else {
        const ip = req.ip || req.connection?.remoteAddress || '0.0.0.0';
        parts.push(`ip:${ip}`);
      }

      if (options.includeApiKey && req.headers['x-api-key']) {
        parts.push(`key:${req.headers['x-api-key']}`);
      }

      if (options.includeEndpoint) {
        parts.push(`endpoint:${req.path || req.url}`);
      }

      if (options.includeMethod) {
        parts.push(`method:${req.method}`);
      }

      return parts.join(':');
    };
  },

  // Calculate optimal window size based on traffic patterns
  calculateOptimalWindow(requestsPerSecond: number, burstTolerance = 2): number {
    // Start with 1 minute base window
    let windowMs = 60000;
    
    // Adjust based on traffic volume
    if (requestsPerSecond > 100) {
      windowMs = 30000; // 30 seconds for high traffic
    } else if (requestsPerSecond > 10) {
      windowMs = 60000; // 1 minute for medium traffic
    } else {
      windowMs = 300000; // 5 minutes for low traffic
    }

    // Consider burst tolerance
    windowMs = Math.max(windowMs, (burstTolerance * 1000) / requestsPerSecond);

    return windowMs;
  },
};

// Export default rate limiter factory
export function createRateLimiter(
  cache: ICache,
  tiers?: RateLimitTier[],
  logger?: LoggerService
): EnterpriseRateLimiter {
  return new EnterpriseRateLimiter(cache, tiers, logger);
}

// Export types and classes
export {
  RateLimitAlgorithm,
  type RateLimitStrategy,
  type RateLimitTier,
  type RateLimitResult,
  type RateLimitViolation,
  EnterpriseRateLimiter,
  DEFAULT_RATE_LIMIT_TIERS,
};