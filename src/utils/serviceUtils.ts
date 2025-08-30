/**
 * Common Service Utilities - DRY (Don't Repeat Yourself) Implementation
 * Eliminates duplicative code across threat intelligence services
 */

import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Standard error handling utility
 * Provides consistent error handling patterns across all services
 */
export class ErrorHandler {
  /**
   * Execute operation with standardized error handling
   */
  public static async executeWithHandling<T>(
    operation: () => Promise<T>,
    context: {
      operationName: string;
      entityId?: string;
      entityType?: string;
      additionalData?: Record<string, unknown>;
    },
    options: {
      retryable?: boolean;
      logLevel?: 'debug' | 'info' | 'warn' | 'error';
      suppressError?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    result?: T;
    error?: Error;
    executionTime: number;
  }> {
    const startTime = Date.now();
    const correlationId = uuidv4();

    logger.debug(`Starting operation: ${context.operationName}`, {
      correlationId,
      entityId: context.entityId,
      entityType: context.entityType,
      ...context.additionalData,
    });

    try {
      const result = await operation();
      const executionTime = Date.now() - startTime;

      const logLevel = options.logLevel || 'info';
      logger[logLevel](`Operation completed: ${context.operationName}`, {
        correlationId,
        success: true,
        executionTime,
        entityId: context.entityId,
        entityType: context.entityType,
        ...context.additionalData,
      });

      return {
        success: true,
        result,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorObj = error instanceof Error ? error : new Error(String(error));

      if (!options.suppressError) {
        logger.error(`Operation failed: ${context.operationName}`, {
          correlationId,
          success: false,
          executionTime,
          entityId: context.entityId,
          entityType: context.entityType,
          error: errorObj.message,
          stack: errorObj.stack,
          retryable: options.retryable || false,
          ...context.additionalData,
        });
      }

      return {
        success: false,
        error: errorObj,
        executionTime,
      };
    }
  }

  /**
   * Execute batch operation with error handling
   */
  public static async executeBatchWithHandling<T, R>(
    items: T[],
    operation: (item: T, index: number) => Promise<R>,
    context: {
      operationName: string;
      batchId?: string;
    },
    options: {
      concurrency?: number;
      continueOnError?: boolean;
      logProgress?: boolean;
    } = {}
  ): Promise<{
    successful: R[];
    failed: Array<{ item: T; index: number; error: Error }>;
    totalProcessingTime: number;
  }> {
    const startTime = Date.now();
    const batchId = context.batchId || uuidv4();
    const concurrency = options.concurrency || 5;
    const successful: R[] = [];
    const failed: Array<{ item: T; index: number; error: Error }> = [];

    logger.info(`Starting batch operation: ${context.operationName}`, {
      batchId,
      totalItems: items.length,
      concurrency,
    });

    // Process items in batches
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      const batchPromises = batch.map(async (item, batchIndex) => {
        const itemIndex = i + batchIndex;
        try {
          const result = await operation(item, itemIndex);
          successful.push(result);
          
          if (options.logProgress && itemIndex % 10 === 0) {
            logger.debug(`Batch progress: ${context.operationName}`, {
              batchId,
              processed: itemIndex + 1,
              total: items.length,
              successCount: successful.length,
              failCount: failed.length,
            });
          }
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          failed.push({ item, index: itemIndex, error: errorObj });
          
          if (!options.continueOnError) {
            throw errorObj;
          }
        }
      });

      await Promise.all(batchPromises);
    }

    const totalProcessingTime = Date.now() - startTime;

    logger.info(`Batch operation completed: ${context.operationName}`, {
      batchId,
      totalItems: items.length,
      successful: successful.length,
      failed: failed.length,
      totalProcessingTime,
    });

    return {
      successful,
      failed,
      totalProcessingTime,
    };
  }
}

/**
 * Performance monitoring utility
 * Provides consistent performance tracking across services
 */
export class PerformanceMonitor {
  private static readonly measurements = new Map<string, IMeasurement[]>();

  /**
   * Start performance measurement
   */
  public static startMeasurement(operation: string, metadata?: Record<string, unknown>): IPerformanceMeasurement {
    const id = uuidv4();
    const startTime = Date.now();

    return {
      id,
      operation,
      startTime,
      ...(metadata && { metadata }),
      end: (additionalMetadata?: Record<string, unknown>) => {
        this.endMeasurement(id, operation, startTime, {
          ...metadata,
          ...additionalMetadata,
        });
      },
    };
  }

  /**
   * End performance measurement
   */
  private static endMeasurement(
    id: string,
    operation: string,
    startTime: number,
    metadata?: Record<string, unknown>
  ): void {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const measurement: IMeasurement = {
      id,
      operation,
      startTime,
      endTime,
      duration,
      ...(metadata && { metadata }),
    };

    // Store measurement
    if (!this.measurements.has(operation)) {
      this.measurements.set(operation, []);
    }
    
    const operationMeasurements = this.measurements.get(operation)!;
    operationMeasurements.push(measurement);

    // Keep only the last 1000 measurements per operation
    if (operationMeasurements.length > 1000) {
      operationMeasurements.splice(0, operationMeasurements.length - 1000);
    }

    logger.debug(`Performance measurement: ${operation}`, {
      id,
      duration,
      metadata,
    });
  }

  /**
   * Get performance statistics for an operation
   */
  public static getStatistics(operation: string): IPerformanceStatistics | null {
    const measurements = this.measurements.get(operation);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const durations = measurements.map(m => m.duration);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = totalDuration / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    // Calculate percentiles
    const sortedDurations = [...durations].sort((a, b) => a - b);
    const p50 = sortedDurations[Math.floor(sortedDurations.length * 0.5)] || 0;
    const p95 = sortedDurations[Math.floor(sortedDurations.length * 0.95)] || 0;
    const p99 = sortedDurations[Math.floor(sortedDurations.length * 0.99)] || 0;
    const lastMeasurement = measurements[measurements.length - 1];
    
    if (!lastMeasurement) {
      return null;
    }

    return {
      operation,
      totalMeasurements: measurements.length,
      totalDuration,
      averageDuration,
      minDuration,
      maxDuration,
      p50Duration: p50,
      p95Duration: p95,
      p99Duration: p99,
      lastMeasurement,
    };
  }

  /**
   * Get all performance statistics
   */
  public static getAllStatistics(): Record<string, IPerformanceStatistics> {
    const stats: Record<string, IPerformanceStatistics> = {};
    
    for (const operation of this.measurements.keys()) {
      const operationStats = this.getStatistics(operation);
      if (operationStats) {
        stats[operation] = operationStats;
      }
    }

    return stats;
  }

  /**
   * Clear measurements for an operation
   */
  public static clearMeasurements(operation?: string): void {
    if (operation) {
      this.measurements.delete(operation);
    } else {
      this.measurements.clear();
    }
  }
}

interface IMeasurement {
  id: string;
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  metadata?: Record<string, unknown>;
}

interface IPerformanceMeasurement {
  id: string;
  operation: string;
  startTime: number;
  metadata?: Record<string, unknown>;
  end: (additionalMetadata?: Record<string, unknown>) => void;
}

interface IPerformanceStatistics {
  operation: string;
  totalMeasurements: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  p50Duration: number;
  p95Duration: number;
  p99Duration: number;
  lastMeasurement: IMeasurement;
}

/**
 * Configuration validation utility
 * Provides consistent configuration validation across services
 */
export class ConfigurationValidator {
  /**
   * Validate required configuration properties
   */
  public static validateRequired<T extends Record<string, unknown>>(
    config: T,
    requiredProps: Array<keyof T>,
    context: string
  ): void {
    const missing: string[] = [];

    for (const prop of requiredProps) {
      if (config[prop] === undefined || config[prop] === null) {
        missing.push(String(prop));
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Missing required configuration properties for ${context}: ${missing.join(', ')}`
      );
    }
  }

  /**
   * Validate configuration with custom validators
   */
  public static validate<T extends Record<string, unknown>>(
    config: T,
    validators: Record<keyof T, (value: unknown) => boolean | string>,
    context: string
  ): void {
    const errors: string[] = [];

    for (const [prop, validator] of Object.entries(validators)) {
      const value = config[prop as keyof T];
      const result = validator(value);

      if (result === false) {
        errors.push(`Invalid value for ${prop}`);
      } else if (typeof result === 'string') {
        errors.push(`${prop}: ${result}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `Configuration validation failed for ${context}: ${errors.join(', ')}`
      );
    }
  }
}

/**
 * Data transformation utility
 * Provides consistent data transformation patterns
 */
export class DataTransformer {
  /**
   * Transform and validate data with error handling
   */
  public static async transformWithValidation<TInput, TOutput>(
    data: TInput[],
    transformer: (item: TInput, index: number) => Promise<TOutput> | TOutput,
    validator?: (item: TOutput, index: number) => boolean | string,
    options: {
      continueOnError?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<{
    successful: TOutput[];
    failed: Array<{ item: TInput; index: number; error: Error }>;
  }> {
    const { continueOnError = true, batchSize = 100 } = options;
    const successful: TOutput[] = [];
    const failed: Array<{ item: TInput; index: number; error: Error }> = [];

    // Process in batches to avoid memory issues
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      for (let j = 0; j < batch.length; j++) {
        const item = batch[j];
        const index = i + j;

        try {
          // Transform
          const transformed = await transformer(item, index);

          // Validate if validator provided
          if (validator) {
            const validationResult = validator(transformed, index);
            if (validationResult === false) {
              throw new Error('Validation failed');
            } else if (typeof validationResult === 'string') {
              throw new Error(validationResult);
            }
          }

          successful.push(transformed);
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          failed.push({ item, index, error: errorObj });

          if (!continueOnError) {
            throw errorObj;
          }
        }
      }
    }

    return { successful, failed };
  }

  /**
   * Deep merge objects
   */
  public static deepMerge<T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T {
    if (!sources.length) return target;
    
    const source = sources.shift();
    if (!source) return target;

    const result = { ...target };

    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (this.isObject(sourceValue) && this.isObject(targetValue)) {
        result[key] = this.deepMerge(targetValue, sourceValue);
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue;
      }
    }

    return this.deepMerge(result, ...sources);
  }

  /**
   * Check if value is an object
   */
  private static isObject(item: unknown): item is Record<string, unknown> {
    return item !== null && typeof item === 'object' && !Array.isArray(item);
  }
}

/**
 * Retry utility with exponential backoff
 * Provides consistent retry patterns across services
 */
export class RetryUtil {
  /**
   * Execute operation with retry and exponential backoff
   */
  public static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      initialDelay?: number;
      maxDelay?: number;
      backoffMultiplier?: number;
      retryCondition?: (error: Error) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      maxDelay = 30000,
      backoffMultiplier = 2,
      retryCondition = () => true,
    } = options;

    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries || !retryCondition(lastError)) {
          throw lastError;
        }

        const delay = Math.min(initialDelay * Math.pow(backoffMultiplier, attempt), maxDelay);
        
        logger.warn(`Operation failed, retrying in ${delay}ms`, {
          attempt: attempt + 1,
          maxRetries,
          error: lastError.message,
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}