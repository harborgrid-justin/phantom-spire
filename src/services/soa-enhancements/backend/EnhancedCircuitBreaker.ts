/**
 * Enhanced Circuit Breaker Pattern
 * SOA Improvement #2: Advanced circuit breaker with adaptive thresholds
 */

import { EventEmitter } from 'events';

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open'
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  successThreshold: number;
  adaptiveThresholds: boolean;
  monitoringWindow: number;
}

export interface CircuitMetrics {
  successCount: number;
  failureCount: number;
  totalRequests: number;
  averageResponseTime: number;
  lastFailure?: Date;
  lastSuccess?: Date;
}

export class EnhancedCircuitBreaker extends EventEmitter {
  private state: CircuitState = CircuitState.CLOSED;
  private config: CircuitBreakerConfig;
  private metrics: CircuitMetrics;
  private recoveryTimer?: NodeJS.Timeout;
  private recentRequests: Array<{ success: boolean; timestamp: Date; responseTime: number }> = [];

  constructor(private serviceName: string, config: Partial<CircuitBreakerConfig> = {}) {
    super();
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 60000,
      successThreshold: 3,
      adaptiveThresholds: true,
      monitoringWindow: 300000, // 5 minutes
      ...config
    };

    this.metrics = {
      successCount: 0,
      failureCount: 0,
      totalRequests: 0,
      averageResponseTime: 0
    };
  }

  /**
   * Execute a request through the circuit breaker
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      throw new Error(`Circuit breaker is OPEN for service: ${this.serviceName}`);
    }

    const startTime = Date.now();
    
    try {
      const result = await operation();
      const responseTime = Date.now() - startTime;
      
      this.recordSuccess(responseTime);
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordFailure(responseTime);
      throw error;
    }
  }

  /**
   * Record successful operation
   */
  private recordSuccess(responseTime: number): void {
    this.metrics.successCount++;
    this.metrics.totalRequests++;
    this.metrics.lastSuccess = new Date();
    
    this.updateRecentRequests(true, responseTime);
    this.updateAverageResponseTime(responseTime);

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.metrics.successCount >= this.config.successThreshold) {
        this.setState(CircuitState.CLOSED);
      }
    }

    this.emit('success', { serviceName: this.serviceName, responseTime });
  }

  /**
   * Record failed operation
   */
  private recordFailure(responseTime: number): void {
    this.metrics.failureCount++;
    this.metrics.totalRequests++;
    this.metrics.lastFailure = new Date();
    
    this.updateRecentRequests(false, responseTime);

    // Adaptive threshold calculation
    const currentThreshold = this.config.adaptiveThresholds 
      ? this.calculateAdaptiveThreshold() 
      : this.config.failureThreshold;

    if (this.metrics.failureCount >= currentThreshold) {
      this.setState(CircuitState.OPEN);
    }

    this.emit('failure', { serviceName: this.serviceName, responseTime });
  }

  /**
   * Calculate adaptive failure threshold based on recent performance
   */
  private calculateAdaptiveThreshold(): number {
    const baseThreshold = this.config.failureThreshold;
    const recentFailures = this.getRecentFailureRate();
    
    // Increase sensitivity if recent failure rate is high
    if (recentFailures > 0.2) {
      return Math.max(2, Math.floor(baseThreshold * 0.6));
    }
    
    // Decrease sensitivity if recent failure rate is low
    if (recentFailures < 0.05) {
      return Math.floor(baseThreshold * 1.5);
    }
    
    return baseThreshold;
  }

  /**
   * Get recent failure rate within monitoring window
   */
  private getRecentFailureRate(): number {
    const cutoff = new Date(Date.now() - this.config.monitoringWindow);
    const recentRequests = this.recentRequests.filter(r => r.timestamp >= cutoff);
    
    if (recentRequests.length === 0) return 0;
    
    const failures = recentRequests.filter(r => !r.success).length;
    return failures / recentRequests.length;
  }

  /**
   * Update recent requests history
   */
  private updateRecentRequests(success: boolean, responseTime: number): void {
    this.recentRequests.push({
      success,
      timestamp: new Date(),
      responseTime
    });

    // Keep only recent requests within monitoring window
    const cutoff = new Date(Date.now() - this.config.monitoringWindow);
    this.recentRequests = this.recentRequests.filter(r => r.timestamp >= cutoff);
  }

  /**
   * Update average response time
   */
  private updateAverageResponseTime(responseTime: number): void {
    const total = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime;
    this.metrics.averageResponseTime = total / this.metrics.totalRequests;
  }

  /**
   * Set circuit breaker state
   */
  private setState(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    console.log(`🔌 Circuit Breaker ${this.serviceName}: ${oldState} → ${newState}`);

    if (newState === CircuitState.OPEN) {
      this.startRecoveryTimer();
      this.emit('circuit-opened', { serviceName: this.serviceName, metrics: this.metrics });
    } else if (newState === CircuitState.CLOSED) {
      this.resetMetrics();
      this.emit('circuit-closed', { serviceName: this.serviceName });
    } else if (newState === CircuitState.HALF_OPEN) {
      this.emit('circuit-half-open', { serviceName: this.serviceName });
    }
  }

  /**
   * Start recovery timer to transition from OPEN to HALF_OPEN
   */
  private startRecoveryTimer(): void {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }

    this.recoveryTimer = setTimeout(() => {
      this.setState(CircuitState.HALF_OPEN);
      this.resetMetrics();
    }, this.config.recoveryTimeout);
  }

  /**
   * Reset metrics counters
   */
  private resetMetrics(): void {
    this.metrics.successCount = 0;
    this.metrics.failureCount = 0;
  }

  /**
   * Get current circuit breaker status
   */
  getStatus() {
    return {
      serviceName: this.serviceName,
      state: this.state,
      metrics: { ...this.metrics },
      config: { ...this.config },
      recentFailureRate: this.getRecentFailureRate()
    };
  }

  /**
   * Reset circuit breaker to CLOSED state
   */
  reset(): void {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
      this.recoveryTimer = undefined;
    }
    
    this.setState(CircuitState.CLOSED);
    this.recentRequests = [];
  }
}

/**
 * Circuit Breaker Registry for managing multiple circuit breakers
 */
export class CircuitBreakerRegistry {
  private circuitBreakers: Map<string, EnhancedCircuitBreaker> = new Map();

  /**
   * Get or create circuit breaker for service
   */
  getCircuitBreaker(serviceName: string, config?: Partial<CircuitBreakerConfig>): EnhancedCircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      const circuitBreaker = new EnhancedCircuitBreaker(serviceName, config);
      this.circuitBreakers.set(serviceName, circuitBreaker);
    }
    
    return this.circuitBreakers.get(serviceName)!;
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async executeWithCircuitBreaker<T>(
    serviceName: string, 
    operation: () => Promise<T>,
    config?: Partial<CircuitBreakerConfig>
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(serviceName, config);
    return circuitBreaker.execute(operation);
  }

  /**
   * Get status of all circuit breakers
   */
  getAllStatus() {
    const status: Record<string, any> = {};
    this.circuitBreakers.forEach((breaker, name) => {
      status[name] = breaker.getStatus();
    });
    return status;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.circuitBreakers.values()) {
      breaker.reset();
    }
  }
}

// Export singleton registry
export const circuitBreakerRegistry = new CircuitBreakerRegistry();