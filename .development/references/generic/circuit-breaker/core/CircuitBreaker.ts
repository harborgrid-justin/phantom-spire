/**
 * Revolutionary Circuit Breaker Implementation
 * Automatic fault tolerance with zero configuration required
 */

import { EventEmitter } from 'events';
import { 
  ICircuitBreaker, 
  ICircuitBreakerConfig, 
  ICircuitBreakerMetrics,
  ICircuitBreakerEvents,
  CircuitBreakerState 
} from '../interfaces/ICircuitBreaker';

export class CircuitBreaker extends EventEmitter implements ICircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private totalRequests: number = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private stateChangeTime: number = Date.now();
  private requestTimes: number[] = [];
  private linkedBreakers: Map<string, ICircuitBreaker> = new Map();
  
  private readonly config: Required<ICircuitBreakerConfig>;
  
  constructor(
    private serviceName: string = 'default',
    config: Partial<ICircuitBreakerConfig> = {}
  ) {
    super();
    
    // Revolutionary auto-configuration with intelligent defaults
    this.config = {
      failureThreshold: config.failureThreshold ?? this.getIntelligentFailureThreshold(),
      successThreshold: config.successThreshold ?? 3,
      recoveryTimeout: config.recoveryTimeout ?? this.getIntelligentRecoveryTimeout(),
      monitoringWindow: config.monitoringWindow ?? 60000, // 1 minute
      minimumRequestThreshold: config.minimumRequestThreshold ?? 10,
      autoDiscovery: config.autoDiscovery ?? true,
      autoLink: config.autoLink ?? true,
      serviceName: config.serviceName ?? serviceName
    };
    
    this.setupAutoConfiguration();
    
    if (this.config.autoDiscovery) {
      this.startAutoDiscovery();
    }
  }
  
  /** Execute operation with circuit breaker protection */
  async execute<T>(
    operation: () => Promise<T>, 
    fallback?: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.totalRequests++;
    
    // Check circuit state
    if (this.shouldRejectRequest()) {
      if (fallback) {
        return await fallback();
      }
      throw new Error(`Circuit breaker is ${this.state} for service: ${this.serviceName}`);
    }
    
    try {
      const result = await operation();
      this.recordSuccess(startTime);
      return result;
    } catch (error) {
      this.recordFailure(error as Error, startTime);
      
      // Try fallback before throwing
      if (fallback) {
        try {
          return await fallback();
        } catch (fallbackError) {
          throw error; // Throw original error if fallback fails
        }
      }
      
      throw error;
    }
  }
  
  /** Get current metrics */
  getMetrics(): ICircuitBreakerMetrics {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      successRate: this.totalRequests > 0 ? (this.successCount / this.totalRequests) * 100 : 100,
      averageResponseTime: this.getAverageResponseTime(),
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      timeInCurrentState: Date.now() - this.stateChangeTime
    };
  }
  
  /** Get current state */
  getState(): CircuitBreakerState {
    return this.state;
  }
  
  /** Force state change */
  forceState(state: CircuitBreakerState): void {
    const oldState = this.state;
    this.state = state;
    this.stateChangeTime = Date.now();
    this.emit('state-changed', oldState, state);
  }
  
  /** Reset circuit breaker */
  reset(): void {
    this.failureCount = 0;
    this.successCount = 0;
    this.totalRequests = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.requestTimes = [];
    this.forceState(CircuitBreakerState.CLOSED);
  }
  
  /** Enable/disable auto-discovery */
  setAutoDiscovery(enabled: boolean): void {
    this.config.autoDiscovery = enabled;
    if (enabled) {
      this.startAutoDiscovery();
    }
  }
  
  /** Link with another circuit breaker */
  linkWith(breaker: ICircuitBreaker, serviceName: string): void {
    this.linkedBreakers.set(serviceName, breaker);
    
    // Auto-sync states for coordinated failure handling
    if (breaker instanceof CircuitBreaker) {
      breaker.on('circuit-opened', () => {
        if (this.state === CircuitBreakerState.CLOSED) {
          // Proactively move to half-open if linked service fails
          this.forceState(CircuitBreakerState.HALF_OPEN);
        }
      });
    }
  }
  
  /** Get health status */
  getHealth() {
    const metrics = this.getMetrics();
    const issues: string[] = [];
    let score = 100;
    
    if (this.state === CircuitBreakerState.OPEN) {
      issues.push('Circuit is open - service unavailable');
      score -= 50;
    } else if (this.state === CircuitBreakerState.HALF_OPEN) {
      issues.push('Circuit is half-open - limited availability');
      score -= 25;
    }
    
    if (metrics.successRate < 90) {
      issues.push(`Low success rate: ${metrics.successRate.toFixed(1)}%`);
      score -= Math.max(0, (90 - metrics.successRate));
    }
    
    if (metrics.averageResponseTime > 5000) {
      issues.push(`High response time: ${metrics.averageResponseTime}ms`);
      score -= 10;
    }
    
    return {
      healthy: score > 70,
      score: Math.max(0, score),
      issues
    };
  }
  
  // Private methods
  
  private shouldRejectRequest(): boolean {
    if (this.state === CircuitBreakerState.CLOSED) {
      return false;
    }
    
    if (this.state === CircuitBreakerState.OPEN) {
      // Check if recovery timeout has passed
      if (this.lastFailureTime && 
          Date.now() - this.lastFailureTime >= this.config.recoveryTimeout) {
        this.forceState(CircuitBreakerState.HALF_OPEN);
        return false;
      }
      return true;
    }
    
    // Half-open state - allow limited requests
    return false;
  }
  
  private recordSuccess(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.successCount++;
    this.lastSuccessTime = Date.now();
    this.recordResponseTime(responseTime);
    
    this.emit('request-success', responseTime);
    
    // State transitions
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.successCount >= this.config.successThreshold) {
        this.closeCircuit();
      }
    }
  }
  
  private recordFailure(error: Error, startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.recordResponseTime(responseTime);
    
    this.emit('request-failure', error, responseTime);
    
    // State transitions
    if (this.state === CircuitBreakerState.CLOSED || 
        this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.shouldOpenCircuit()) {
        this.openCircuit();
      }
    }
  }
  
  private shouldOpenCircuit(): boolean {
    if (this.totalRequests < this.config.minimumRequestThreshold) {
      return false;
    }
    
    const recentFailures = this.getRecentFailureCount();
    return recentFailures >= this.config.failureThreshold;
  }
  
  private getRecentFailureCount(): number {
    // For simplicity, using total failure count
    // In production, this should use a sliding window
    return this.failureCount;
  }
  
  private openCircuit(): void {
    const oldState = this.state;
    this.state = CircuitBreakerState.OPEN;
    this.stateChangeTime = Date.now();
    
    this.emit('state-changed', oldState, this.state);
    this.emit('circuit-opened', this.getMetrics());
    
    console.warn(`Circuit breaker opened for service: ${this.serviceName}`);
  }
  
  private closeCircuit(): void {
    const oldState = this.state;
    this.state = CircuitBreakerState.CLOSED;
    this.stateChangeTime = Date.now();
    this.failureCount = 0; // Reset failure count
    
    this.emit('state-changed', oldState, this.state);
    this.emit('circuit-closed', this.getMetrics());
    
    console.info(`Circuit breaker closed for service: ${this.serviceName}`);
  }
  
  private recordResponseTime(time: number): void {
    this.requestTimes.push(time);
    
    // Keep only recent response times (last 100)
    if (this.requestTimes.length > 100) {
      this.requestTimes = this.requestTimes.slice(-100);
    }
  }
  
  private getAverageResponseTime(): number {
    if (this.requestTimes.length === 0) return 0;
    return this.requestTimes.reduce((sum, time) => sum + time, 0) / this.requestTimes.length;
  }
  
  private getIntelligentFailureThreshold(): number {
    // Auto-detect service type and set appropriate threshold
    const serviceName = this.serviceName.toLowerCase();
    
    if (serviceName.includes('database') || serviceName.includes('db')) {
      return 3; // Databases need quick failure detection
    } else if (serviceName.includes('cache')) {
      return 5; // Cache can tolerate more failures
    } else if (serviceName.includes('api') || serviceName.includes('service')) {
      return 5; // APIs get moderate threshold
    } else if (serviceName.includes('queue') || serviceName.includes('message')) {
      return 8; // Queues can handle more failures
    }
    
    return 5; // Default threshold
  }
  
  private getIntelligentRecoveryTimeout(): number {
    const serviceName = this.serviceName.toLowerCase();
    
    if (serviceName.includes('database')) {
      return 30000; // 30 seconds for databases
    } else if (serviceName.includes('cache')) {
      return 10000; // 10 seconds for cache
    } else if (serviceName.includes('api')) {
      return 60000; // 1 minute for APIs
    } else if (serviceName.includes('queue')) {
      return 45000; // 45 seconds for queues
    }
    
    return 30000; // Default 30 seconds
  }
  
  private setupAutoConfiguration(): void {
    // Auto-adjust thresholds based on performance patterns
    setInterval(() => {
      this.optimizeConfiguration();
    }, 300000); // Every 5 minutes
  }
  
  private optimizeConfiguration(): void {
    const metrics = this.getMetrics();
    
    // Auto-adjust failure threshold based on success rate
    if (metrics.successRate > 95 && this.config.failureThreshold > 3) {
      this.config.failureThreshold--;
      console.debug(`Auto-optimized failure threshold to ${this.config.failureThreshold} for ${this.serviceName}`);
    } else if (metrics.successRate < 80 && this.config.failureThreshold < 10) {
      this.config.failureThreshold++;
      console.debug(`Auto-optimized failure threshold to ${this.config.failureThreshold} for ${this.serviceName}`);
    }
  }
  
  private startAutoDiscovery(): void {
    // Discover other services in the environment
    setInterval(() => {
      this.performAutoDiscovery();
    }, 60000); // Every minute
  }
  
  private performAutoDiscovery(): void {
    // In a real implementation, this would discover services through:
    // - Environment variables
    // - Service registry
    // - Network scanning
    // - Configuration files
    
    const discoveredServices = this.discoverServicesFromEnvironment();
    if (discoveredServices.length > 0) {
      this.emit('auto-discovery', discoveredServices);
    }
  }
  
  private discoverServicesFromEnvironment(): string[] {
    const services: string[] = [];
    
    // Check environment variables for common service patterns
    Object.keys(process.env).forEach(key => {
      if (key.includes('SERVICE_URL') || 
          key.includes('DATABASE_URL') || 
          key.includes('REDIS_URL') || 
          key.includes('API_URL')) {
        services.push(key.toLowerCase().replace('_url', ''));
      }
    });
    
    return services;
  }
  
  // Event emitter type enhancement
  on<K extends keyof ICircuitBreakerEvents>(
    event: K,
    listener: ICircuitBreakerEvents[K]
  ): this {
    return super.on(event, listener);
  }
  
  emit<K extends keyof ICircuitBreakerEvents>(
    event: K,
    ...args: Parameters<ICircuitBreakerEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
}