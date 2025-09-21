/**
 * Advanced Intelligent Rate Limiting Enhancement
 * Extends the existing rate limiter with AI-powered adaptive features
 */

import { EnterpriseRateLimiter, RateLimitResult } from './rate-limiter';
import type { LoggerService } from '../services/core/LoggerService';
import type { ICache } from '../utils/enterprise-cache';

export interface AdaptiveRateLimitConfig {
  enableAdaptiveThrottling: boolean;
  enableIntelligentBlocking: boolean;
  enablePerformanceBasedScaling: boolean;
  enableBehaviorAnalysis: boolean;
  mlModelEndpoint?: string;
  adaptationSensitivity: number; // 0.1 to 1.0
  performanceThresholds: {
    responseTimeMs: number;
    errorRatePercent: number;
    cpuUsagePercent: number;
    memoryUsagePercent: number;
  };
}

export interface ThreatIntelligence {
  suspiciousIPs: Set<string>;
  knownBots: Set<string>;
  trustedIPs: Set<string>;
  geoLocationThreats: Map<string, number>; // country -> risk score
}

export interface BehaviorPattern {
  requestFrequency: number[];
  endpointPattern: string[];
  userAgentPattern: string;
  timingPattern: number[];
  isBot: boolean;
  riskScore: number;
}

/**
 * Intelligent Rate Limiter with AI-powered adaptive capabilities
 * Extends the base EnterpriseRateLimiter with advanced features
 */
export class IntelligentRateLimiter {
  private baseRateLimiter: EnterpriseRateLimiter;
  private config: AdaptiveRateLimitConfig;
  private cache: ICache;
  private logger?: LoggerService;
  
  // AI and Intelligence features
  private threatIntel: ThreatIntelligence;
  private behaviorPatterns: Map<string, BehaviorPattern> = new Map();
  private performanceMetrics: Map<string, number[]> = new Map();
  private adaptiveMultipliers: Map<string, number> = new Map();
  
  // Performance tracking
  private requestLatencies: number[] = [];
  private errorCounts: Map<string, number> = new Map();
  private systemLoad: { cpu: number; memory: number } = { cpu: 0, memory: 0 };

  constructor(
    baseRateLimiter: EnterpriseRateLimiter,
    cache: ICache,
    config: AdaptiveRateLimitConfig,
    logger?: LoggerService
  ) {
    this.baseRateLimiter = baseRateLimiter;
    this.config = config;
    this.cache = cache;
    this.logger = logger;
    
    this.threatIntel = {
      suspiciousIPs: new Set(),
      knownBots: new Set(),
      trustedIPs: new Set(),
      geoLocationThreats: new Map()
    };
    
    this.startIntelligenceGathering();
    this.startPerformanceMonitoring();
  }

  /**
   * Enhanced rate limit check with AI-powered intelligence
   */
  async intelligentRateLimit(
    key: string,
    tierName: string,
    endpoint?: string,
    requestContext?: {
      ip: string;
      userAgent?: string;
      geoLocation?: string;
      timestamp: Date;
    }
  ): Promise<RateLimitResult & { threatLevel: 'low' | 'medium' | 'high' | 'critical' }> {
    // Start performance tracking
    const startTime = Date.now();
    
    try {
      // 1. Threat intelligence check
      const threatLevel = await this.assessThreatLevel(key, requestContext);
      
      // 2. Behavior analysis
      if (this.config.enableBehaviorAnalysis) {
        await this.analyzeBehavior(key, endpoint, requestContext);
      }
      
      // 3. Adaptive threshold calculation
      const adaptiveMultiplier = await this.calculateAdaptiveMultiplier(key, endpoint, threatLevel);
      
      // 4. Get base rate limit result
      const baseResult = await this.baseRateLimiter.checkRateLimit(key, tierName, endpoint);
      
      // 5. Apply intelligent modifications
      const enhancedResult = await this.enhanceRateLimit(baseResult, key, threatLevel, adaptiveMultiplier);
      
      // 6. Record performance metrics
      this.recordPerformance(key, Date.now() - startTime, enhancedResult.allowed);
      
      return {
        ...enhancedResult,
        threatLevel
      };
      
    } catch (error) {
      this.logger?.error('Intelligent rate limiter error', error);
      
      // Fallback to base rate limiter
      const baseResult = await this.baseRateLimiter.checkRateLimit(key, tierName, endpoint);
      return {
        ...baseResult,
        threatLevel: 'low'
      };
    }
  }

  /**
   * Assess threat level based on multiple intelligence sources
   */
  private async assessThreatLevel(
    key: string,
    requestContext?: {
      ip: string;
      userAgent?: string;
      geoLocation?: string;
    }
  ): Promise<'low' | 'medium' | 'high' | 'critical'> {
    let riskScore = 0;
    
    if (!requestContext) {
      return 'low';
    }
    
    // IP-based threat assessment
    if (this.threatIntel.suspiciousIPs.has(requestContext.ip)) {
      riskScore += 30;
    }
    
    if (this.threatIntel.knownBots.has(requestContext.ip)) {
      riskScore += 20;
    }
    
    if (this.threatIntel.trustedIPs.has(requestContext.ip)) {
      riskScore -= 20;
    }
    
    // Geo-location risk
    if (requestContext.geoLocation) {
      const geoRisk = this.threatIntel.geoLocationThreats.get(requestContext.geoLocation) || 0;
      riskScore += geoRisk;
    }
    
    // User-Agent analysis
    if (requestContext.userAgent) {
      if (this.isKnownBot(requestContext.userAgent)) {
        riskScore += 15;
      }
      
      if (this.isSuspiciousUserAgent(requestContext.userAgent)) {
        riskScore += 25;
      }
    }
    
    // Behavior pattern analysis
    const pattern = this.behaviorPatterns.get(key);
    if (pattern) {
      riskScore += pattern.riskScore;
    }
    
    // Convert score to threat level
    if (riskScore >= 70) return 'critical';
    if (riskScore >= 50) return 'high';
    if (riskScore >= 30) return 'medium';
    return 'low';
  }

  /**
   * Analyze and learn from request patterns
   */
  private async analyzeBehavior(
    key: string,
    endpoint?: string,
    requestContext?: {
      ip: string;
      userAgent?: string;
      timestamp: Date;
    }
  ): Promise<void> {
    if (!requestContext) return;
    
    let pattern = this.behaviorPatterns.get(key);
    if (!pattern) {
      pattern = {
        requestFrequency: [],
        endpointPattern: [],
        userAgentPattern: requestContext.userAgent || '',
        timingPattern: [],
        isBot: false,
        riskScore: 0
      };
      this.behaviorPatterns.set(key, pattern);
    }
    
    // Update timing pattern
    pattern.timingPattern.push(requestContext.timestamp.getTime());
    if (pattern.timingPattern.length > 100) {
      pattern.timingPattern = pattern.timingPattern.slice(-100);
    }
    
    // Update endpoint pattern
    if (endpoint) {
      pattern.endpointPattern.push(endpoint);
      if (pattern.endpointPattern.length > 50) {
        pattern.endpointPattern = pattern.endpointPattern.slice(-50);
      }
    }
    
    // Calculate request frequency
    if (pattern.timingPattern.length >= 2) {
      const recent = pattern.timingPattern.slice(-10);
      const intervals = recent.slice(1).map((time, i) => time - recent[i]);
      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      pattern.requestFrequency.push(1000 / avgInterval); // requests per second
      
      if (pattern.requestFrequency.length > 20) {
        pattern.requestFrequency = pattern.requestFrequency.slice(-20);
      }
    }
    
    // Bot detection
    pattern.isBot = this.detectBotBehavior(pattern);
    
    // Risk score calculation
    pattern.riskScore = this.calculateBehaviorRiskScore(pattern);
  }

  /**
   * Calculate adaptive multiplier based on current conditions
   */
  private async calculateAdaptiveMultiplier(
    key: string,
    endpoint?: string,
    threatLevel?: string
  ): Promise<number> {
    if (!this.config.enableAdaptiveThrottling) {
      return 1.0;
    }
    
    let multiplier = 1.0;
    const cacheKey = `adaptive_multiplier:${key}:${endpoint}`;
    
    // Get cached multiplier
    const cached = await this.cache.get<number>(cacheKey);
    if (cached) {
      multiplier = cached;
    }
    
    // Performance-based adjustment
    if (this.config.enablePerformanceBasedScaling) {
      const avgLatency = this.getAverageLatency(key);
      const errorRate = this.getErrorRate(key);
      
      if (avgLatency > this.config.performanceThresholds.responseTimeMs) {
        multiplier *= 0.8; // Reduce limits by 20%
      }
      
      if (errorRate > this.config.performanceThresholds.errorRatePercent) {
        multiplier *= 0.7; // Reduce limits by 30%
      }
      
      if (this.systemLoad.cpu > this.config.performanceThresholds.cpuUsagePercent) {
        multiplier *= 0.6; // Aggressive reduction for high CPU
      }
      
      if (this.systemLoad.memory > this.config.performanceThresholds.memoryUsagePercent) {
        multiplier *= 0.6; // Aggressive reduction for high memory
      }
    }
    
    // Threat-based adjustment
    if (threatLevel) {
      switch (threatLevel) {
        case 'critical':
          multiplier *= 0.1; // Severe reduction
          break;
        case 'high':
          multiplier *= 0.3;
          break;
        case 'medium':
          multiplier *= 0.6;
          break;
        default:
          // No change for low threat
          break;
      }
    }
    
    // Cache the calculated multiplier
    await this.cache.set(cacheKey, multiplier, { ttl: 60000 }); // 1 minute TTL
    
    return Math.max(0.1, Math.min(2.0, multiplier)); // Clamp between 0.1 and 2.0
  }

  /**
   * Enhance rate limit result with intelligent modifications
   */
  private async enhanceRateLimit(
    baseResult: RateLimitResult,
    key: string,
    threatLevel: string,
    adaptiveMultiplier: number
  ): Promise<RateLimitResult> {
    if (!baseResult.allowed) {
      return baseResult; // Already blocked by base limiter
    }
    
    // Apply adaptive multiplier to remaining requests
    const adjustedRemaining = Math.floor(baseResult.remaining * adaptiveMultiplier);
    
    // Check if we should block due to intelligent analysis
    let shouldBlock = false;
    
    if (threatLevel === 'critical') {
      shouldBlock = true;
    } else if (threatLevel === 'high' && adaptiveMultiplier < 0.5) {
      shouldBlock = true;
    }
    
    if (shouldBlock) {
      return {
        ...baseResult,
        allowed: false,
        remaining: 0,
        retryAfter: Math.max(baseResult.retryAfter || 60, 300), // At least 5 minutes
        headers: {
          ...baseResult.headers,
          'X-RateLimit-Reason': 'Intelligent blocking due to suspicious activity',
          'X-RateLimit-ThreatLevel': threatLevel
        }
      };
    }
    
    return {
      ...baseResult,
      remaining: adjustedRemaining,
      headers: {
        ...baseResult.headers,
        'X-RateLimit-Adaptive': adaptiveMultiplier.toFixed(2),
        'X-RateLimit-ThreatLevel': threatLevel
      }
    };
  }

  /**
   * Bot detection based on behavior patterns
   */
  private detectBotBehavior(pattern: BehaviorPattern): boolean {
    // Very regular timing intervals (less than 100ms variation)
    if (pattern.timingPattern.length >= 5) {
      const recent = pattern.timingPattern.slice(-5);
      const intervals = recent.slice(1).map((time, i) => time - recent[i]);
      const variance = this.calculateVariance(intervals);
      
      if (variance < 10000) { // Less than 100ms variance
        return true;
      }
    }
    
    // High request frequency
    if (pattern.requestFrequency.length > 0) {
      const avgFrequency = pattern.requestFrequency.reduce((sum, freq) => sum + freq, 0) / pattern.requestFrequency.length;
      if (avgFrequency > 10) { // More than 10 requests per second
        return true;
      }
    }
    
    // Repetitive endpoint patterns
    if (pattern.endpointPattern.length >= 10) {
      const uniqueEndpoints = new Set(pattern.endpointPattern).size;
      const repetitiveness = uniqueEndpoints / pattern.endpointPattern.length;
      if (repetitiveness < 0.3) { // Less than 30% unique endpoints
        return true;
      }
    }
    
    return false;
  }

  /**
   * Calculate behavior risk score
   */
  private calculateBehaviorRiskScore(pattern: BehaviorPattern): number {
    let score = 0;
    
    if (pattern.isBot) {
      score += 40;
    }
    
    // High frequency penalty
    if (pattern.requestFrequency.length > 0) {
      const maxFreq = Math.max(...pattern.requestFrequency);
      if (maxFreq > 5) score += Math.min(30, maxFreq * 2);
    }
    
    // Endpoint diversity penalty
    if (pattern.endpointPattern.length >= 5) {
      const unique = new Set(pattern.endpointPattern).size;
      const diversity = unique / pattern.endpointPattern.length;
      if (diversity < 0.5) score += 20;
    }
    
    return Math.min(100, score);
  }

  /**
   * Check if User-Agent indicates a known bot
   */
  private isKnownBot(userAgent: string): boolean {
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /php/i,
      /automated/i, /headless/i
    ];
    
    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Check if User-Agent is suspicious
   */
  private isSuspiciousUserAgent(userAgent: string): boolean {
    // Too short or too long
    if (userAgent.length < 10 || userAgent.length > 500) {
      return true;
    }
    
    // Missing common browser indicators
    if (!/(Mozilla|Chrome|Safari|Firefox|Edge)/i.test(userAgent)) {
      return true;
    }
    
    // Suspicious patterns
    const suspiciousPatterns = [
      /test/i, /hack/i, /exploit/i, /penetration/i,
      /scan/i, /probe/i, /attack/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Start intelligence gathering background processes
   */
  private startIntelligenceGathering(): void {
    // Update threat intelligence every 5 minutes
    setInterval(async () => {
      try {
        await this.updateThreatIntelligence();
      } catch (error) {
        this.logger?.error('Error updating threat intelligence', error);
      }
    }, 5 * 60 * 1000);
    
    // Clean up old behavior patterns every hour
    setInterval(() => {
      this.cleanupOldPatterns();
    }, 60 * 60 * 1000);
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.updateSystemLoad();
    }, 10 * 1000); // Every 10 seconds
  }

  /**
   * Update threat intelligence from external sources
   */
  private async updateThreatIntelligence(): Promise<void> {
    try {
      // This would integrate with external threat intelligence APIs
      // For now, we'll use basic heuristics
      
      // Update suspicious IPs based on violation patterns
      const stats = await this.baseRateLimiter.getRateLimitStats();
      for (const violator of stats.topViolators) {
        if (violator.count > 100) { // Frequent violator
          if (violator.key.startsWith('ip:')) {
            const ip = violator.key.substring(3);
            this.threatIntel.suspiciousIPs.add(ip);
          }
        }
      }
      
      this.logger?.info('Threat intelligence updated', {
        suspiciousIPs: this.threatIntel.suspiciousIPs.size,
        knownBots: this.threatIntel.knownBots.size,
        trustedIPs: this.threatIntel.trustedIPs.size
      });
    } catch (error) {
      this.logger?.error('Failed to update threat intelligence', error);
    }
  }

  /**
   * Clean up old behavior patterns to prevent memory leaks
   */
  private cleanupOldPatterns(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [key, pattern] of this.behaviorPatterns.entries()) {
      if (pattern.timingPattern.length > 0) {
        const lastActivity = Math.max(...pattern.timingPattern);
        if (lastActivity < cutoffTime) {
          this.behaviorPatterns.delete(key);
        }
      }
    }
    
    this.logger?.info('Cleaned up old behavior patterns', {
      remainingPatterns: this.behaviorPatterns.size
    });
  }

  /**
   * Update system load metrics
   */
  private updateSystemLoad(): void {
    const memoryUsage = process.memoryUsage();
    this.systemLoad.memory = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    // Simplified CPU calculation based on event loop lag
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
      this.systemLoad.cpu = Math.min(100, lag / 10); // Rough approximation
    });
  }

  /**
   * Record performance metrics for a key
   */
  private recordPerformance(key: string, latency: number, success: boolean): void {
    // Record latency
    this.requestLatencies.push(latency);
    if (this.requestLatencies.length > 1000) {
      this.requestLatencies = this.requestLatencies.slice(-1000);
    }
    
    // Record errors
    if (!success) {
      const currentErrors = this.errorCounts.get(key) || 0;
      this.errorCounts.set(key, currentErrors + 1);
    }
  }

  /**
   * Get average latency for a key
   */
  private getAverageLatency(key: string): number {
    if (this.requestLatencies.length === 0) return 0;
    
    const sum = this.requestLatencies.reduce((total, latency) => total + latency, 0);
    return sum / this.requestLatencies.length;
  }

  /**
   * Get error rate for a key
   */
  private getErrorRate(key: string): number {
    const errors = this.errorCounts.get(key) || 0;
    const total = Math.max(1, (this.performanceMetrics.get(key) || []).length);
    return (errors / total) * 100;
  }

  /**
   * Calculate variance of an array of numbers
   */
  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  /**
   * Add IP to trusted list
   */
  public addTrustedIP(ip: string): void {
    this.threatIntel.trustedIPs.add(ip);
    this.threatIntel.suspiciousIPs.delete(ip);
    this.logger?.info('IP added to trusted list', { ip });
  }

  /**
   * Add IP to suspicious list
   */
  public addSuspiciousIP(ip: string): void {
    this.threatIntel.suspiciousIPs.add(ip);
    this.threatIntel.trustedIPs.delete(ip);
    this.logger?.info('IP added to suspicious list', { ip });
  }

  /**
   * Get comprehensive analytics
   */
  public async getIntelligenceAnalytics(): Promise<{
    threatIntelligence: {
      suspiciousIPs: number;
      knownBots: number;
      trustedIPs: number;
      geoThreats: number;
    };
    behaviorAnalysis: {
      totalPatterns: number;
      botsDetected: number;
      averageRiskScore: number;
    };
    performance: {
      averageLatency: number;
      systemLoad: { cpu: number; memory: number };
      adaptiveMultipliers: number;
    };
  }> {
    const botsDetected = Array.from(this.behaviorPatterns.values())
      .filter(pattern => pattern.isBot).length;
    
    const riskScores = Array.from(this.behaviorPatterns.values())
      .map(pattern => pattern.riskScore);
    const averageRiskScore = riskScores.length > 0
      ? riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length
      : 0;
    
    return {
      threatIntelligence: {
        suspiciousIPs: this.threatIntel.suspiciousIPs.size,
        knownBots: this.threatIntel.knownBots.size,
        trustedIPs: this.threatIntel.trustedIPs.size,
        geoThreats: this.threatIntel.geoLocationThreats.size,
      },
      behaviorAnalysis: {
        totalPatterns: this.behaviorPatterns.size,
        botsDetected,
        averageRiskScore,
      },
      performance: {
        averageLatency: this.getAverageLatency('global'),
        systemLoad: this.systemLoad,
        adaptiveMultipliers: this.adaptiveMultipliers.size,
      },
    };
  }
}

/**
 * Factory function to create intelligent rate limiter
 */
export function createIntelligentRateLimiter(
  baseRateLimiter: EnterpriseRateLimiter,
  cache: ICache,
  config: Partial<AdaptiveRateLimitConfig> = {},
  logger?: LoggerService
): IntelligentRateLimiter {
  const defaultConfig: AdaptiveRateLimitConfig = {
    enableAdaptiveThrottling: true,
    enableIntelligentBlocking: true,
    enablePerformanceBasedScaling: true,
    enableBehaviorAnalysis: true,
    adaptationSensitivity: 0.7,
    performanceThresholds: {
      responseTimeMs: 1000,
      errorRatePercent: 5,
      cpuUsagePercent: 80,
      memoryUsagePercent: 85,
    },
    ...config,
  };
  
  return new IntelligentRateLimiter(baseRateLimiter, cache, defaultConfig, logger);
}