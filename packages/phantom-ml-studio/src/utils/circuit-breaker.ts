/**
 * Enterprise Circuit Breaker and Health Check System
 * Implements circuit breaker pattern with health monitoring for all services
 */

import type { LoggerService } from '../services/core/LoggerService';

// Circuit breaker states
export enum CircuitBreakerState {
  CLOSED = 'closed',       // Normal operation
  OPEN = 'open',           // Circuit is open, requests are failing
  HALF_OPEN = 'half-open', // Testing if service is back
}

// Health status types
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
}

// Circuit breaker configuration
export interface CircuitBreakerConfig {
  failureThreshold: number;        // Number of failures before opening
  successThreshold: number;        // Number of successes to close from half-open
  timeout: number;                 // Timeout for requests (ms)
  resetTimeout: number;            // Time before attempting to close circuit (ms)
  monitoringPeriod: number;        // Health check interval (ms)
  maxRetries: number;              // Maximum retry attempts
  backoffMultiplier: number;       // Exponential backoff multiplier
  enableHealthChecks: boolean;     // Whether to perform health checks
  degradedThreshold: number;       // Response time threshold for degraded status (ms)
}

// Default circuit breaker configuration
const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 10000,
  resetTimeout: 60000,
  monitoringPeriod: 30000,
  maxRetries: 3,
  backoffMultiplier: 2,
  enableHealthChecks: true,
  degradedThreshold: 5000,
};

// Circuit breaker metrics
export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  totalRequests: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  averageResponseTime: number;
  errorRate: number;
  uptime: number;
  downtimeTotal: number;
  lastStateChange: Date;
}

// Health check result
export interface HealthCheckResult {
  status: HealthStatus;
  responseTime: number;
  timestamp: Date;
  details?: Record<string, unknown>;
  error?: string;
  checks: Record<string, {
    status: HealthStatus;
    responseTime?: number;
    error?: string;
    details?: Record<string, unknown>;
  }>;
}

// Circuit breaker implementation
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private totalRequests = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private responseTimeSum = 0;
  private resetTimer?: NodeJS.Timeout;
  private healthCheckTimer?: NodeJS.Timeout;
  private downtimeStart?: Date;
  private downtimeTotal = 0;
  private lastStateChange = new Date();
  private logger?: LoggerService;

  constructor(
    private readonly serviceName: string,
    private readonly config: CircuitBreakerConfig = DEFAULT_CIRCUIT_BREAKER_CONFIG,
    logger?: LoggerService
  ) {
    this.logger = logger;
    this.startHealthChecks();
  }

  // Execute operation with circuit breaker protection
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    if (this.state === CircuitBreakerState.OPEN) {
      const error = new Error(`Circuit breaker is OPEN for service: ${this.serviceName}`);
      this.logger?.warn(`Circuit breaker prevented request to ${this.serviceName}`, {
        state: this.state,
        failureCount: this.failureCount,
        lastFailureTime: this.lastFailureTime,
      });
      throw error;
    }

    const startTime = Date.now();

    try {
      // Set timeout for the operation
      const result = await Promise.race([
        operation(),
        this.createTimeoutPromise<T>(),
      ]);

      const responseTime = Date.now() - startTime;
      this.onSuccess(responseTime);
      
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.onFailure(error as Error, responseTime);
      throw error;
    }
  }

  // Execute with retry logic
  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    let attempt = 0;

    while (attempt < this.config.maxRetries) {
      try {
        return await this.execute(operation);
      } catch (error) {
        lastError = error as Error;
        attempt++;
        
        if (attempt >= this.config.maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = Math.min(
          1000 * Math.pow(this.config.backoffMultiplier, attempt - 1),
          30000 // Max 30 seconds
        );

        this.logger?.info(`Retrying ${this.serviceName} operation (attempt ${attempt}/${this.config.maxRetries}) after ${delay}ms`, {
          error: lastError.message,
          attempt,
          delay,
        });

        await this.sleep(delay);
      }
    }

    this.logger?.error(`All retry attempts failed for ${this.serviceName}`, {
      attempts: this.config.maxRetries,
      lastError: lastError!.message,
    });

    throw lastError!;
  }

  // Get current circuit breaker metrics
  getMetrics(): CircuitBreakerMetrics {
    const now = Date.now();
    const uptime = now - this.lastStateChange.getTime();
    const totalDowntime = this.downtimeTotal + (
      this.state === CircuitBreakerState.OPEN && this.downtimeStart 
        ? now - this.downtimeStart.getTime() 
        : 0
    );

    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      averageResponseTime: this.totalRequests > 0 ? this.responseTimeSum / this.totalRequests : 0,
      errorRate: this.totalRequests > 0 ? this.failureCount / this.totalRequests : 0,
      uptime,
      downtimeTotal: totalDowntime,
      lastStateChange: this.lastStateChange,
    };
  }

  // Get current circuit breaker state
  getState(): CircuitBreakerState {
    return this.state;
  }

  // Force state change (for testing or manual intervention)
  setState(newState: CircuitBreakerState): void {
    const oldState = this.state;
    this.state = newState;
    this.lastStateChange = new Date();

    this.logger?.info(`Circuit breaker state changed for ${this.serviceName}`, {
      from: oldState,
      to: newState,
      timestamp: this.lastStateChange,
    });

    if (newState === CircuitBreakerState.OPEN) {
      this.downtimeStart = new Date();
      this.scheduleReset();
    } else if (oldState === CircuitBreakerState.OPEN && this.downtimeStart) {
      this.downtimeTotal += Date.now() - this.downtimeStart.getTime();
      this.downtimeStart = undefined;
    }
  }

  // Reset circuit breaker statistics
  reset(): void {
    this.failureCount = 0;
    this.successCount = 0;
    this.totalRequests = 0;
    this.responseTimeSum = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.downtimeTotal = 0;
    this.downtimeStart = undefined;
    this.setState(CircuitBreakerState.CLOSED);

    this.logger?.info(`Circuit breaker reset for ${this.serviceName}`);
  }

  // Clean up resources
  destroy(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }

  // Private methods

  private onSuccess(responseTime: number): void {
    this.failureCount = 0;
    this.successCount++;
    this.lastSuccessTime = new Date();
    this.responseTimeSum += responseTime;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.successCount >= this.config.successThreshold) {
        this.setState(CircuitBreakerState.CLOSED);
      }
    }
  }

  private onFailure(error: Error, responseTime: number): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    this.responseTimeSum += responseTime;

    this.logger?.error(`Circuit breaker recorded failure for ${this.serviceName}`, {
      error: error.message,
      failureCount: this.failureCount,
      responseTime,
      currentState: this.state,
    });

    if (this.state === CircuitBreakerState.CLOSED) {
      if (this.failureCount >= this.config.failureThreshold) {
        this.setState(CircuitBreakerState.OPEN);
      }
    } else if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.setState(CircuitBreakerState.OPEN);
    }
  }

  private scheduleReset(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    this.resetTimer = setTimeout(() => {
      if (this.state === CircuitBreakerState.OPEN) {
        this.setState(CircuitBreakerState.HALF_OPEN);
        this.successCount = 0;
      }
    }, this.config.resetTimeout);
  }

  private createTimeoutPromise<T>(): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private startHealthChecks(): void {
    if (!this.config.enableHealthChecks) {
      return;
    }

    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.monitoringPeriod);
  }

  private performHealthCheck(): void {
    // This is a basic health check - in a real implementation,
    // this would ping the actual service or check specific health endpoints
    const metrics = this.getMetrics();
    
    this.logger?.debug(`Health check for ${this.serviceName}`, {
      state: metrics.state,
      errorRate: metrics.errorRate,
      averageResponseTime: metrics.averageResponseTime,
      uptime: metrics.uptime,
    });
  }
}

// Health checker for services
export class HealthChecker {
  private readonly checks = new Map<string, () => Promise<HealthCheckResult>>();
  private readonly circuitBreakers = new Map<string, CircuitBreaker>();
  private logger?: LoggerService;

  constructor(logger?: LoggerService) {
    this.logger = logger;
  }

  // Register a health check for a service
  registerCheck(
    serviceName: string,
    healthCheck: () => Promise<HealthCheckResult>,
    circuitBreakerConfig?: Partial<CircuitBreakerConfig>
  ): void {
    this.checks.set(serviceName, healthCheck);
    
    // Create circuit breaker for the service
    const config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...circuitBreakerConfig };
    const circuitBreaker = new CircuitBreaker(serviceName, config, this.logger);
    this.circuitBreakers.set(serviceName, circuitBreaker);

    this.logger?.info(`Health check registered for service: ${serviceName}`);
  }

  // Remove a health check
  unregisterCheck(serviceName: string): void {
    this.checks.delete(serviceName);
    
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (circuitBreaker) {
      circuitBreaker.destroy();
      this.circuitBreakers.delete(serviceName);
    }

    this.logger?.info(`Health check unregistered for service: ${serviceName}`);
  }

  // Get circuit breaker for a service
  getCircuitBreaker(serviceName: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(serviceName);
  }

  // Perform health check for a specific service
  async checkHealth(serviceName: string): Promise<HealthCheckResult> {
    const healthCheck = this.checks.get(serviceName);
    if (!healthCheck) {
      throw new Error(`No health check registered for service: ${serviceName}`);
    }

    const startTime = Date.now();
    
    try {
      const result = await healthCheck();
      const responseTime = Date.now() - startTime;
      
      return {
        ...result,
        responseTime,
        timestamp: new Date(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: HealthStatus.UNHEALTHY,
        responseTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error),
        checks: {},
      };
    }
  }

  // Perform health checks for all registered services
  async checkAllHealth(): Promise<Record<string, HealthCheckResult>> {
    const results: Record<string, HealthCheckResult> = {};
    
    const checkPromises = Array.from(this.checks.keys()).map(async (serviceName) => {
      try {
        results[serviceName] = await this.checkHealth(serviceName);
      } catch (error) {
        results[serviceName] = {
          status: HealthStatus.UNHEALTHY,
          responseTime: 0,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : String(error),
          checks: {},
        };
      }
    });

    await Promise.allSettled(checkPromises);
    return results;
  }

  // Get overall system health
  async getSystemHealth(): Promise<{
    status: HealthStatus;
    services: Record<string, HealthCheckResult>;
    summary: {
      total: number;
      healthy: number;
      degraded: number;
      unhealthy: number;
      unknown: number;
    };
    circuitBreakers: Record<string, CircuitBreakerMetrics>;
  }> {
    const services = await this.checkAllHealth();
    
    const summary = {
      total: Object.keys(services).length,
      healthy: 0,
      degraded: 0,
      unhealthy: 0,
      unknown: 0,
    };

    // Count service statuses
    Object.values(services).forEach((result) => {
      switch (result.status) {
        case HealthStatus.HEALTHY:
          summary.healthy++;
          break;
        case HealthStatus.DEGRADED:
          summary.degraded++;
          break;
        case HealthStatus.UNHEALTHY:
          summary.unhealthy++;
          break;
        default:
          summary.unknown++;
      }
    });

    // Determine overall system status
    let systemStatus: HealthStatus;
    if (summary.unhealthy > 0) {
      systemStatus = HealthStatus.UNHEALTHY;
    } else if (summary.degraded > 0 || summary.unknown > 0) {
      systemStatus = HealthStatus.DEGRADED;
    } else {
      systemStatus = HealthStatus.HEALTHY;
    }

    // Get circuit breaker metrics
    const circuitBreakers: Record<string, CircuitBreakerMetrics> = {};
    for (const [serviceName, cb] of this.circuitBreakers) {
      circuitBreakers[serviceName] = cb.getMetrics();
    }

    return {
      status: systemStatus,
      services,
      summary,
      circuitBreakers,
    };
  }

  // Cleanup all resources
  destroy(): void {
    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.destroy();
    }
    this.circuitBreakers.clear();
    this.checks.clear();
  }
}

// Utility functions for common health checks
export const HealthCheckUtils = {
  // Create a simple HTTP health check
  createHttpHealthCheck(url: string, expectedStatus = 200, timeout = 5000): () => Promise<HealthCheckResult> {
    return async (): Promise<HealthCheckResult> => {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'phantom-ml-studio-health-checker/1.0.0',
          },
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        const status = response.status === expectedStatus ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY;

        return {
          status,
          responseTime,
          timestamp: new Date(),
          details: {
            url,
            statusCode: response.status,
            expectedStatus,
            headers: Object.fromEntries(response.headers.entries()),
          },
          checks: {
            http_status: {
              status,
              responseTime,
              details: {
                actual: response.status,
                expected: expectedStatus,
              },
            },
          },
        };

      } catch (error) {
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        return {
          status: HealthStatus.UNHEALTHY,
          responseTime,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : String(error),
          details: { url },
          checks: {
            http_connection: {
              status: HealthStatus.UNHEALTHY,
              responseTime,
              error: error instanceof Error ? error.message : String(error),
            },
          },
        };
      }
    };
  },

  // Create a database health check
  createDatabaseHealthCheck(
    connectionCheck: () => Promise<boolean>,
    performQuery?: () => Promise<unknown>
  ): () => Promise<HealthCheckResult> {
    return async (): Promise<HealthCheckResult> => {
      const startTime = Date.now();
      const checks: HealthCheckResult['checks'] = {};

      try {
        // Test connection
        const connectionStartTime = Date.now();
        const connected = await connectionCheck();
        const connectionTime = Date.now() - connectionStartTime;

        checks.connection = {
          status: connected ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
          responseTime: connectionTime,
        };

        // Test query if provided
        if (performQuery) {
          const queryStartTime = Date.now();
          try {
            await performQuery();
            const queryTime = Date.now() - queryStartTime;
            checks.query = {
              status: HealthStatus.HEALTHY,
              responseTime: queryTime,
            };
          } catch (error) {
            const queryTime = Date.now() - queryStartTime;
            checks.query = {
              status: HealthStatus.UNHEALTHY,
              responseTime: queryTime,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }

        const responseTime = Date.now() - startTime;
        const allChecksHealthy = Object.values(checks).every(check => check.status === HealthStatus.HEALTHY);

        return {
          status: allChecksHealthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
          responseTime,
          timestamp: new Date(),
          checks,
        };

      } catch (error) {
        const responseTime = Date.now() - startTime;

        return {
          status: HealthStatus.UNHEALTHY,
          responseTime,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : String(error),
          checks,
        };
      }
    };
  },

  // Create a memory health check
  createMemoryHealthCheck(maxMemoryMB = 1024): () => Promise<HealthCheckResult> {
    return async (): Promise<HealthCheckResult> => {
      const startTime = Date.now();

      try {
        const memoryUsage = process.memoryUsage();
        const memoryMB = memoryUsage.heapUsed / 1024 / 1024;
        const responseTime = Date.now() - startTime;

        const status = memoryMB < maxMemoryMB ? HealthStatus.HEALTHY : HealthStatus.DEGRADED;

        return {
          status,
          responseTime,
          timestamp: new Date(),
          details: {
            memoryUsageMB: memoryMB,
            maxMemoryMB,
            memoryUsage,
          },
          checks: {
            memory_usage: {
              status,
              details: {
                current: memoryMB,
                limit: maxMemoryMB,
              },
            },
          },
        };

      } catch (error) {
        const responseTime = Date.now() - startTime;

        return {
          status: HealthStatus.UNHEALTHY,
          responseTime,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : String(error),
          checks: {},
        };
      }
    };
  },
};

// Export singleton instances
export const systemHealthChecker = new HealthChecker();
export { CircuitBreakerState, HealthStatus };