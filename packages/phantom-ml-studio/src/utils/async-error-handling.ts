/**
 * Enterprise Async Error Handling and Retry System
 * Comprehensive error handling with retry mechanisms, circuit breakers, and async utilities
 */

import type { LoggerService } from '../services/core/LoggerService';

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  DATABASE = 'database',
  VALIDATION = 'validation',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  RESOURCE = 'resource',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  UNKNOWN = 'unknown',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Retry strategy types
export enum RetryStrategy {
  FIXED_DELAY = 'fixed_delay',
  EXPONENTIAL_BACKOFF = 'exponential_backoff',
  LINEAR_BACKOFF = 'linear_backoff',
  FIBONACCI_BACKOFF = 'fibonacci_backoff',
  CUSTOM = 'custom',
}

// Enhanced error interface
export interface EnterpriseError extends Error {
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  retryable: boolean;
  context?: Record<string, unknown>;
  originalError?: Error;
  timestamp: Date;
  requestId?: string;
  userId?: string;
  service?: string;
  operation?: string;
}

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  strategy: RetryStrategy;
  baseDelay: number;
  maxDelay: number;
  delayMultiplier: number;
  jitter: boolean;
  retryCondition?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number) => void | Promise<void>;
  abortSignal?: AbortSignal;
  timeout?: number;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
  baseDelay: 1000,
  maxDelay: 30000,
  delayMultiplier: 2,
  jitter: true,
  retryCondition: (error) => {
    // Retry on network errors, timeouts, and 5xx status codes
    return error.name === 'NetworkError' ||
           error.name === 'TimeoutError' ||
           (error as any).status >= 500 ||
           error.message.includes('ECONNRESET') ||
           error.message.includes('ETIMEDOUT');
  },
};

// Async operation result
export interface AsyncResult<T> {
  success: boolean;
  data?: T;
  error?: EnterpriseError;
  attempts: number;
  totalTime: number;
  metadata?: Record<string, unknown>;
}

// Batch operation result
export interface BatchResult<T, R> {
  successful: Array<{ item: T; result: R; index: number }>;
  failed: Array<{ item: T; error: EnterpriseError; index: number }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    totalTime: number;
    averageTime: number;
  };
}

// Error factory for creating standardized errors
export class ErrorFactory {
  static create(
    message: string,
    code: string,
    category: ErrorCategory,
    options: {
      severity?: ErrorSeverity;
      retryable?: boolean;
      context?: Record<string, unknown>;
      originalError?: Error;
      requestId?: string;
      userId?: string;
      service?: string;
      operation?: string;
    } = {}
  ): EnterpriseError {
    const error = new Error(message) as EnterpriseError;
    
    error.code = code;
    error.category = category;
    error.severity = options.severity || ErrorSeverity.MEDIUM;
    error.retryable = options.retryable ?? category === ErrorCategory.NETWORK;
    error.context = options.context;
    error.originalError = options.originalError;
    error.timestamp = new Date();
    error.requestId = options.requestId;
    error.userId = options.userId;
    error.service = options.service || 'phantom-ml-studio';
    error.operation = options.operation;
    
    return error;
  }

  static networkError(message: string, originalError?: Error): EnterpriseError {
    return this.create(message, 'NETWORK_ERROR', ErrorCategory.NETWORK, {
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      originalError,
    });
  }

  static timeoutError(operation: string, timeout: number): EnterpriseError {
    return this.create(
      `Operation '${operation}' timed out after ${timeout}ms`,
      'TIMEOUT_ERROR',
      ErrorCategory.TIMEOUT,
      {
        severity: ErrorSeverity.HIGH,
        retryable: true,
        operation,
        context: { timeout },
      }
    );
  }

  static validationError(message: string, field?: string, value?: unknown): EnterpriseError {
    return this.create(message, 'VALIDATION_ERROR', ErrorCategory.VALIDATION, {
      severity: ErrorSeverity.LOW,
      retryable: false,
      context: { field, value },
    });
  }

  static authorizationError(message: string, userId?: string, resource?: string): EnterpriseError {
    return this.create(message, 'AUTHORIZATION_ERROR', ErrorCategory.AUTHORIZATION, {
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      userId,
      context: { resource },
    });
  }

  static rateLimitError(limit: number, window: number): EnterpriseError {
    return this.create(
      `Rate limit exceeded: ${limit} requests per ${window}ms`,
      'RATE_LIMIT_ERROR',
      ErrorCategory.RATE_LIMIT,
      {
        severity: ErrorSeverity.MEDIUM,
        retryable: true,
        context: { limit, window },
      }
    );
  }

  static databaseError(message: string, operation?: string, originalError?: Error): EnterpriseError {
    return this.create(message, 'DATABASE_ERROR', ErrorCategory.DATABASE, {
      severity: ErrorSeverity.HIGH,
      retryable: true,
      operation,
      originalError,
    });
  }

  static externalServiceError(service: string, message: string, originalError?: Error): EnterpriseError {
    return this.create(
      `External service '${service}' error: ${message}`,
      'EXTERNAL_SERVICE_ERROR',
      ErrorCategory.EXTERNAL_SERVICE,
      {
        severity: ErrorSeverity.MEDIUM,
        retryable: true,
        service,
        originalError,
      }
    );
  }
}

// Enhanced retry utility with comprehensive error handling
export class AsyncRetryHandler {
  private logger?: LoggerService;

  constructor(logger?: LoggerService) {
    this.logger = logger;
  }

  // Execute operation with retry logic
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    const startTime = Date.now();
    let lastError: Error;
    let attempt = 0;

    while (attempt < finalConfig.maxAttempts) {
      attempt++;
      
      try {
        // Check for abort signal
        if (finalConfig.abortSignal?.aborted) {
          throw new Error('Operation aborted');
        }

        // Execute with timeout if specified
        const result = finalConfig.timeout
          ? await this.executeWithTimeout(operation, finalConfig.timeout)
          : await operation();

        // Success - log if not first attempt
        if (attempt > 1) {
          this.logger?.info('Operation succeeded after retries', {
            attempts: attempt,
            totalTime: Date.now() - startTime,
          });
        }

        return result;

      } catch (error) {
        lastError = error as Error;
        
        // Check if we should retry this error
        if (!finalConfig.retryCondition || !finalConfig.retryCondition(lastError, attempt)) {
          this.logger?.info('Error is not retryable, failing immediately', {
            error: lastError.message,
            attempt,
          });
          break;
        }

        // Check if we've reached max attempts
        if (attempt >= finalConfig.maxAttempts) {
          this.logger?.error('Max retry attempts reached', {
            error: lastError.message,
            attempts: attempt,
            totalTime: Date.now() - startTime,
          });
          break;
        }

        // Calculate delay
        const delay = this.calculateDelay(attempt, finalConfig);
        
        this.logger?.warn('Operation failed, retrying', {
          error: lastError.message,
          attempt,
          nextRetryIn: delay,
          maxAttempts: finalConfig.maxAttempts,
        });

        // Call retry callback if provided
        if (finalConfig.onRetry) {
          try {
            await finalConfig.onRetry(lastError, attempt);
          } catch (callbackError) {
            this.logger?.warn('Retry callback failed', {
              error: callbackError instanceof Error ? callbackError.message : String(callbackError),
            });
          }
        }

        // Wait before next retry
        await this.sleep(delay);
      }
    }

    // All retries failed, throw the last error
    throw lastError!;
  }

  // Execute operation with result wrapper
  async safeExecute<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<AsyncResult<T>> {
    const startTime = Date.now();
    let attempts = 0;

    try {
      const result = await this.executeWithRetry(async () => {
        attempts++;
        return await operation();
      }, config);

      return {
        success: true,
        data: result,
        attempts,
        totalTime: Date.now() - startTime,
      };

    } catch (error) {
      return {
        success: false,
        error: this.normalizeError(error as Error),
        attempts,
        totalTime: Date.now() - startTime,
      };
    }
  }

  // Execute batch operations with individual retry logic
  async executeBatch<T, R>(
    items: T[],
    operation: (item: T, index: number) => Promise<R>,
    config: {
      concurrency?: number;
      retryConfig?: Partial<RetryConfig>;
      continueOnError?: boolean;
      progressCallback?: (completed: number, total: number) => void;
    } = {}
  ): Promise<BatchResult<T, R>> {
    const {
      concurrency = 5,
      retryConfig = {},
      continueOnError = true,
      progressCallback,
    } = config;

    const successful: Array<{ item: T; result: R; index: number }> = [];
    const failed: Array<{ item: T; error: EnterpriseError; index: number }> = [];
    const startTime = Date.now();

    // Process items in batches
    const batches = this.createBatches(items, concurrency);
    let completed = 0;

    for (const batch of batches) {
      const batchPromises = batch.map(async ({ item, index }) => {
        try {
          const result = await this.executeWithRetry(
            () => operation(item, index),
            retryConfig
          );
          
          successful.push({ item, result, index });
          
        } catch (error) {
          const enterpriseError = this.normalizeError(error as Error);
          failed.push({ item, error: enterpriseError, index });

          if (!continueOnError) {
            throw enterpriseError;
          }
        } finally {
          completed++;
          progressCallback?.(completed, items.length);
        }
      });

      // Wait for current batch to complete
      await Promise.allSettled(batchPromises);
    }

    const totalTime = Date.now() - startTime;
    const total = items.length;

    return {
      successful,
      failed,
      summary: {
        total,
        successful: successful.length,
        failed: failed.length,
        totalTime,
        averageTime: total > 0 ? totalTime / total : 0,
      },
    };
  }

  // Execute with timeout
  async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(ErrorFactory.timeoutError('operation', timeoutMs));
      }, timeoutMs);

      operation()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  // Execute with circuit breaker pattern
  async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    circuitBreaker: {
      failureThreshold: number;
      resetTimeout: number;
      state: 'closed' | 'open' | 'half-open';
      failures: number;
      lastFailure?: Date;
    }
  ): Promise<T> {
    // Check circuit breaker state
    if (circuitBreaker.state === 'open') {
      const now = Date.now();
      const timeSinceLastFailure = circuitBreaker.lastFailure 
        ? now - circuitBreaker.lastFailure.getTime()
        : 0;

      if (timeSinceLastFailure < circuitBreaker.resetTimeout) {
        throw ErrorFactory.create(
          'Circuit breaker is open',
          'CIRCUIT_BREAKER_OPEN',
          ErrorCategory.RESOURCE,
          { severity: ErrorSeverity.HIGH, retryable: false }
        );
      } else {
        circuitBreaker.state = 'half-open';
      }
    }

    try {
      const result = await operation();
      
      // Success - reset circuit breaker
      if (circuitBreaker.state === 'half-open') {
        circuitBreaker.state = 'closed';
        circuitBreaker.failures = 0;
      }

      return result;

    } catch (error) {
      // Failure - update circuit breaker
      circuitBreaker.failures++;
      circuitBreaker.lastFailure = new Date();

      if (circuitBreaker.failures >= circuitBreaker.failureThreshold) {
        circuitBreaker.state = 'open';
      }

      throw error;
    }
  }

  // Parallel execution with limit
  async executeParallel<T>(
    operations: Array<() => Promise<T>>,
    concurrencyLimit = 10
  ): Promise<T[]> {
    const results: T[] = new Array(operations.length);
    const executing: Array<Promise<void>> = [];

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      
      // Create promise that resolves when operation completes
      const promise = operation().then(result => {
        results[i] = result;
      });

      executing.push(promise);

      // Wait if we've reached concurrency limit
      if (executing.length >= concurrencyLimit) {
        await Promise.race(executing);
        // Remove completed promises
        const completed = executing.filter(p => p !== promise);
        executing.length = 0;
        executing.push(...completed.filter((_, idx) => idx < concurrencyLimit - 1));
      }
    }

    // Wait for all remaining operations to complete
    await Promise.all(executing);
    return results;
  }

  // Private methods

  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay: number;

    switch (config.strategy) {
      case RetryStrategy.FIXED_DELAY:
        delay = config.baseDelay;
        break;

      case RetryStrategy.LINEAR_BACKOFF:
        delay = config.baseDelay * attempt;
        break;

      case RetryStrategy.EXPONENTIAL_BACKOFF:
        delay = config.baseDelay * Math.pow(config.delayMultiplier, attempt - 1);
        break;

      case RetryStrategy.FIBONACCI_BACKOFF:
        delay = config.baseDelay * this.fibonacci(attempt);
        break;

      default:
        delay = config.baseDelay;
    }

    // Apply max delay limit
    delay = Math.min(delay, config.maxDelay);

    // Apply jitter if enabled
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5); // 50-100% of calculated delay
    }

    return Math.floor(delay);
  }

  private fibonacci(n: number): number {
    if (n <= 1) return 1;
    if (n === 2) return 1;
    
    let prev = 1;
    let curr = 1;
    
    for (let i = 3; i <= n; i++) {
      const next = prev + curr;
      prev = curr;
      curr = next;
    }
    
    return curr;
  }

  private createBatches<T>(items: T[], batchSize: number): Array<Array<{ item: T; index: number }>> {
    const batches: Array<Array<{ item: T; index: number }>> = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items
        .slice(i, i + batchSize)
        .map((item, batchIndex) => ({ item, index: i + batchIndex }));
      batches.push(batch);
    }
    
    return batches;
  }

  private normalizeError(error: Error): EnterpriseError {
    if (error.hasOwnProperty('code') && error.hasOwnProperty('category')) {
      return error as EnterpriseError;
    }

    // Try to categorize the error based on its properties
    let category = ErrorCategory.UNKNOWN;
    let retryable = false;

    if (error.name === 'NetworkError' || error.message.includes('network')) {
      category = ErrorCategory.NETWORK;
      retryable = true;
    } else if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      category = ErrorCategory.TIMEOUT;
      retryable = true;
    } else if (error.name === 'ValidationError' || error.message.includes('validation')) {
      category = ErrorCategory.VALIDATION;
      retryable = false;
    } else if ((error as any).status >= 500) {
      category = ErrorCategory.EXTERNAL_SERVICE;
      retryable = true;
    }

    return ErrorFactory.create(
      error.message,
      error.name || 'UNKNOWN_ERROR',
      category,
      {
        retryable,
        originalError: error,
      }
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global utilities and decorators
export class AsyncUtils {
  // Create a promise that never resolves (useful for testing)
  static never<T>(): Promise<T> {
    return new Promise(() => {});
  }

  // Create a promise that resolves after a delay
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Create a promise that rejects after a delay
  static timeout<T>(ms: number, message = `Timeout after ${ms}ms`): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }

  // Race between a promise and a timeout
  static withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      AsyncUtils.timeout<T>(timeoutMs),
    ]);
  }

  // Wrap a callback-style function to return a promise
  static promisify<T>(
    fn: (...args: any[]) => void,
    context?: any
  ): (...args: any[]) => Promise<T> {
    return (...args: any[]) => {
      return new Promise<T>((resolve, reject) => {
        const callback = (error: Error | null, result?: T) => {
          if (error) {
            reject(error);
          } else {
            resolve(result!);
          }
        };
        
        fn.call(context, ...args, callback);
      });
    };
  }

  // Debounce async function
  static debounce<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    delay: number
  ): T {
    let timeoutId: NodeJS.Timeout | undefined;
    
    return ((...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise((resolve, reject) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(async () => {
          try {
            const result = await fn(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    }) as T;
  }

  // Throttle async function
  static throttle<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    interval: number
  ): T {
    let lastCall = 0;
    
    return ((...args: Parameters<T>): Promise<ReturnType<T>> => {
      const now = Date.now();
      
      if (now - lastCall >= interval) {
        lastCall = now;
        return fn(...args);
      } else {
        return Promise.resolve() as Promise<ReturnType<T>>;
      }
    }) as T;
  }

  // Memoize async function results
  static memoize<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string,
    ttl?: number
  ): T {
    const cache = new Map<string, { result: ReturnType<T>; timestamp: number }>();
    
    const defaultKeyGenerator = (...args: any[]) => JSON.stringify(args);
    const getKey = keyGenerator || defaultKeyGenerator;

    return ((...args: Parameters<T>): Promise<ReturnType<T>> => {
      const key = getKey(...args);
      const cached = cache.get(key);
      
      // Check if cached result is still valid
      if (cached) {
        if (!ttl || Date.now() - cached.timestamp < ttl) {
          return cached.result;
        } else {
          cache.delete(key);
        }
      }

      // Execute function and cache result
      const result = fn(...args);
      cache.set(key, { result, timestamp: Date.now() });
      
      return result;
    }) as T;
  }
}

// Export singleton instance
export const asyncRetryHandler = new AsyncRetryHandler();

// Decorator for automatic retry on methods
export function Retry(config: Partial<RetryConfig> = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return await asyncRetryHandler.executeWithRetry(
        () => method.apply(this, args),
        config
      );
    };
  };
}

// Decorator for timeout on methods
export function Timeout(timeoutMs: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return await asyncRetryHandler.executeWithTimeout(
        () => method.apply(this, args),
        timeoutMs
      );
    };
  };
}