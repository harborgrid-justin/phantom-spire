import { BusinessLogic, BusinessLogicConfig, EnvironmentConfig } from '../types/business-logic.types';

export abstract class BaseBusinessLogic implements BusinessLogic {
  protected config: BusinessLogicConfig;
  protected environment: EnvironmentConfig;
  private idCounters: Map<string, number> = new Map();

  constructor(config: BusinessLogicConfig, environment: EnvironmentConfig) {
    this.config = config;
    this.environment = environment;
  }

  protected generateId(prefix: string): string {
    const counter = this.idCounters.get(prefix) || 0;
    this.idCounters.set(prefix, counter + 1);

    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const count = counter.toString(36).padStart(2, '0');

    return `${prefix}_${timestamp}_${random}_${count}`;
  }

  protected async validateInput<T>(input: T, schema?: Record<string, unknown>): Promise<{ isValid: boolean; errors: string[] }> {
    // Basic validation - in a real implementation, this would use a schema validation library
    const errors: string[] = [];

    if (input === null || input === undefined) {
      errors.push('Input cannot be null or undefined');
      return { isValid: false, errors };
    }

    if (typeof input === 'object' && Object.keys(input).length === 0) {
      errors.push('Input object cannot be empty');
      return { isValid: false, errors };
    }

    return { isValid: errors.length === 0, errors };
  }

  protected async logActivity(
    action: string,
    resourceType: string,
    resourceId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      resourceType,
      resourceId,
      metadata: metadata || {},
      environment: this.environment.name,
      service: this.constructor.name
    };

    // In a real implementation, this would send to a logging service
    if (this.config.enableLogging) {
      console.log(`[AUDIT] ${JSON.stringify(logEntry)}`);
    }
  }

  protected async handleError(
    error: Error,
    context: {
      operation: string;
      resourceType?: string;
      resourceId?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      environment: this.environment.name,
      service: this.constructor.name
    };

    // Log the error
    console.error(`[ERROR] ${JSON.stringify(errorEntry)}`);

    // In a real implementation, this might:
    // - Send to error tracking service (e.g., Sentry)
    // - Trigger alerts for critical errors
    // - Update metrics/monitoring systems
  }

  protected async checkRateLimit(
    identifier: string,
    operation: string,
    limit: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    // Simplified rate limiting - in practice, use Redis or similar
    const key = `${identifier}:${operation}`;
    const now = Date.now();
    const window = Math.floor(now / windowMs);

    // This would be stored in a cache in a real implementation
    const requests = 0; // Placeholder
    const remaining = Math.max(0, limit - requests - 1);
    const resetTime = new Date((window + 1) * windowMs);

    return {
      allowed: requests < limit,
      remaining,
      resetTime
    };
  }

  protected async withRetry<T>(operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      backoffMultiplier?: number;
      retryCondition?: (error: Error) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffMultiplier = 2,
      retryCondition = () => true
    } = options;

    let lastError: Error;
    let delay = baseDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries || !retryCondition(lastError)) {
          throw lastError;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }

    throw lastError!;
  }

  protected async validatePermissions(
    userId: string,
    resourceType: string,
    resourceId: string,
    permission: string
  ): Promise<boolean> {
    // Simplified permission check - in practice, integrate with AuthZ service
    await this.logActivity('permission_check', resourceType, resourceId, {
      userId,
      permission,
      granted: true // Placeholder
    });

    return true; // Placeholder - always allow for demo
  }

  protected async measurePerformance<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<{ result: T; duration: number; metadata: Record<string, unknown> }> {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();

    try {
      const result = await operation();
      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage();

      const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
      const memoryDelta = {
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        external: endMemory.external - startMemory.external
      };

      const metadata = {
        operationName,
        memoryDelta,
        timestamp: new Date().toISOString()
      };

      // Log performance metrics
      if (this.config.enableMetrics) {
        console.log(`[PERF] ${operationName}: ${duration.toFixed(2)}ms`, metadata);
      }

      return { result, duration, metadata };
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000;

      await this.handleError(error as Error, {
        operation: operationName,
        metadata: { duration }
      });

      throw error;
    }
  }

  protected async cacheGet<T>(key: string): Promise<T | null> {
    // Simplified caching - in practice, use Redis or similar
    return null;
  }

  protected async cacheSet<T>(
    key: string,
    value: T,
    ttlSeconds?: number
  ): Promise<void> {
    // Simplified caching - in practice, use Redis or similar
    console.log(`[CACHE] Setting ${key} with TTL ${ttlSeconds || 'infinite'}`);
  }

  protected async cacheDel(key: string): Promise<void> {
    // Simplified caching - in practice, use Redis or similar
    console.log(`[CACHE] Deleting ${key}`);
  }

  protected async publishEvent(
    eventType: string,
    payload: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const event = {
      id: this.generateId('event'),
      type: eventType,
      payload,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      source: this.constructor.name,
      environment: this.environment.name
    };

    // In a real implementation, this would publish to an event bus
    if (this.config.enableEvents) {
      console.log(`[EVENT] ${eventType}:`, event);
    }
  }

  protected async scheduleTask(
    taskName: string,
    payload: Record<string, unknown>,
    executeAt: Date
  ): Promise<string> {
    const taskId = this.generateId('task');

    const task = {
      id: taskId,
      name: taskName,
      payload,
      executeAt: executeAt.toISOString(),
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    };

    // In a real implementation, this would use a task queue
    console.log(`[TASK] Scheduled ${taskName} for ${executeAt.toISOString()}:`, task);

    return taskId;
  }

  protected async executeHealthCheck(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      duration: number;
      message?: string;
    }>;
  }> {
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      duration: number;
      message?: string;
    }> = [];

    // Database connectivity check
    const dbCheck = await this.measurePerformance('db_health_check', async () => {
      // Simulate database check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
      return Math.random() > 0.1; // 90% success rate
    });

    checks.push({
      name: 'database',
      status: dbCheck.result ? 'pass' : 'fail',
      duration: dbCheck.duration,
      message: dbCheck.result ? undefined : 'Database connection failed'
    });

    // Cache connectivity check
    const cacheCheck = await this.measurePerformance('cache_health_check', async () => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
      return Math.random() > 0.05; // 95% success rate
    });

    checks.push({
      name: 'cache',
      status: cacheCheck.result ? 'pass' : 'fail',
      duration: cacheCheck.duration,
      message: cacheCheck.result ? undefined : 'Cache connection failed'
    });

    // Memory usage check
    const memory = process.memoryUsage();
    const memoryUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;

    checks.push({
      name: 'memory',
      status: memoryUsagePercent < 80 ? 'pass' : memoryUsagePercent < 90 ? 'warn' : 'fail',
      duration: 0,
      message: `Memory usage: ${memoryUsagePercent.toFixed(1)}%`
    });

    // Determine overall status
    const failedChecks = checks.filter(c => c.status === 'fail').length;
    const warnChecks = checks.filter(c => c.status === 'warn').length;

    let status: 'healthy' | 'unhealthy' | 'degraded';
    if (failedChecks > 0) {
      status = 'unhealthy';
    } else if (warnChecks > 0) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return { status, checks };
  }

  protected sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;//]/g, '') // Remove potential injection characters
      .trim();
  }

  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^/s@]+@[^/s@]+/.[^/s@]+$/;
    return emailRegex.test(email);
  }

  protected validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  protected async encryptSensitiveData(data: string): Promise<string> {
    // Simplified encryption - in practice, use proper crypto library
    return Buffer.from(data).toString('base64');
  }

  protected async decryptSensitiveData(encryptedData: string): Promise<string> {
    // Simplified decryption - in practice, use proper crypto library
    return Buffer.from(encryptedData, 'base64').toString('utf-8');
  }

  protected async executeWithContext<T>(
    context: Record<string, unknown> & { requestId?: string },
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // Execute operation with proper context, logging, and error handling
    const startTime = Date.now();

    try {
      await this.logActivity('operation_start', operationName, context.requestId || 'unknown', context);

      const result = await this.withRetry(operation, {
        maxRetries: this.config.retryAttempts || 3,
        baseDelay: 1000
      });

      const duration = Date.now() - startTime;
      await this.logActivity('operation_success', operationName, context.requestId || 'unknown', {
        ...context,
        duration
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.handleError(error as Error, {
        operation: operationName,
        resourceType: 'ml_operation',
        resourceId: context.requestId,
        metadata: { ...context, duration }
      });
      throw error;
    }
  }
}
