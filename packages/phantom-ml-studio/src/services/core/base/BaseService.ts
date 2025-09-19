/**
 * Base Service Class
 * Abstract base class following Google's service architecture patterns
 * Provides common functionality for all services including lifecycle management,
 * logging, metrics, and error handling
 */

import { EventEmitter } from 'events';
import {
  ServiceDefinition,
  ServiceHealth,
  ServicePerformanceMetrics,
  ServiceContext,
  ServiceLifecycle,
  ServiceStatus
} from '../types/service.types';
import { BusinessLogicError } from '../types/business-logic.types';

export abstract class BaseService extends EventEmitter implements ServiceLifecycle {
  protected readonly definition: ServiceDefinition;
  protected status: ServiceStatus = 'initializing';
  protected startTime?: Date;
  protected metrics: ServicePerformanceMetrics;
  protected healthChecks: Map<string, () => Promise<boolean>> = new Map();

  constructor(definition: ServiceDefinition) {
    super();
    this.definition = definition;
    this.metrics = this.initializeMetrics();
    
    // Set up default health checks
    this.setupDefaultHealthChecks();
    
    // Register error handlers
    this.setupErrorHandlers();
  }

  /**
   * Service identification
   */
  get id(): string {
    return this.definition.id;
  }

  get name(): string {
    return this.definition.name;
  }

  get version(): string {
    return this.definition.version;
  }

  get currentStatus(): ServiceStatus {
    return this.status;
  }

  /**
   * Lifecycle Management (Template Method Pattern)
   */
  async initialize(): Promise<void> {
    try {
      this.status = 'initializing';
      this.emit('initializing', { serviceId: this.id });
      
      await this.onInitialize();
      
      this.emit('initialized', { serviceId: this.id });
    } catch (error) {
      this.status = 'error';
      this.handleError(error as Error, 'initialize');
      throw error;
    }
  }

  async start(): Promise<void> {
    try {
      if (this.status !== 'initializing' && this.status !== 'ready') {
        await this.initialize();
      }

      this.emit('starting', { serviceId: this.id });
      
      await this.onStart();
      
      this.status = 'ready';
      this.startTime = new Date();
      
      this.emit('started', { serviceId: this.id });
    } catch (error) {
      this.status = 'error';
      this.handleError(error as Error, 'start');
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      this.emit('stopping', { serviceId: this.id });
      
      await this.onStop();
      
      this.status = 'shutdown';
      
      this.emit('stopped', { serviceId: this.id });
    } catch (error) {
      this.handleError(error as Error, 'stop');
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      if (this.status !== 'shutdown') {
        await this.stop();
      }

      this.emit('destroying', { serviceId: this.id });
      
      await this.onDestroy();
      
      this.removeAllListeners();
      
      this.emit('destroyed', { serviceId: this.id });
    } catch (error) {
      this.handleError(error as Error, 'destroy');
      throw error;
    }
  }

  /**
   * Health and Metrics
   */
  async getHealth(): Promise<ServiceHealth> {
    const checks = [];
    
    for (const [name, checkFn] of Array.from(this.healthChecks)) {
      const startTime = Date.now();
      try {
        const healthy = await checkFn();
        checks.push({
          name,
          status: healthy ? 'healthy' as const : 'unhealthy' as const,
          duration: Date.now() - startTime
        });
      } catch (error) {
        checks.push({
          name,
          status: 'unhealthy' as const,
          message: (error as Error).message,
          duration: Date.now() - startTime
        });
      }
    }

    const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
    
    return {
      serviceId: this.id,
      status: this.status,
      timestamp: new Date(),
      checks,
      dependencies: await this.getDependencyHealth(),
      uptime,
      version: this.version
    };
  }

  async getMetrics(): Promise<ServicePerformanceMetrics> {
    return {
      ...this.metrics,
      timestamp: new Date(),
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0
    };
  }

  /**
   * Context-aware execution wrapper
   */
  protected async executeWithContext<T>(
    context: ServiceContext,
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      this.emit('operation:start', { 
        serviceId: this.id, 
        operation, 
        context: context.requestId 
      });
      
      const result = await fn();
      
      this.updateMetrics(operation, Date.now() - startTime, true);
      
      this.emit('operation:success', { 
        serviceId: this.id, 
        operation, 
        duration: Date.now() - startTime,
        context: context.requestId
      });
      
      return result;
    } catch (error) {
      this.updateMetrics(operation, Date.now() - startTime, false);
      
      this.emit('operation:error', { 
        serviceId: this.id, 
        operation, 
        error: (error as Error).message,
        duration: Date.now() - startTime,
        context: context.requestId
      });
      
      throw this.enrichError(error as Error, operation, context);
    }
  }

  /**
   * Abstract methods to be implemented by concrete services
   */
  protected abstract onInitialize(): Promise<void>;
  protected abstract onStart(): Promise<void>;
  protected abstract onStop(): Promise<void>;
  protected abstract onDestroy(): Promise<void>;

  /**
   * Optional extension points
   */
  protected async getDependencyHealth(): Promise<Array<{ name: string; status: ServiceStatus; responseTime: number; lastChecked: Date; error?: string }>> {
    return [];
  }

  protected addHealthCheck(name: string, checkFn: () => Promise<boolean>): void {
    this.healthChecks.set(name, checkFn);
  }

  protected removeHealthCheck(name: string): void {
    this.healthChecks.delete(name);
  }

  /**
   * Private helper methods
   */
  private initializeMetrics(): ServicePerformanceMetrics {
    return {
      serviceId: this.id,
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      throughput: 0,
      errorRate: 0,
      uptime: 0,
      timestamp: new Date(),
      timeWindow: 60000 // 1 minute window
    };
  }

  private setupDefaultHealthChecks(): void {
    // Basic readiness check
    this.addHealthCheck('readiness', async () => {
      return this.status === 'ready';
    });

    // Memory usage check
    this.addHealthCheck('memory', async () => {
      const used = process.memoryUsage();
      const memoryThreshold = 1024 * 1024 * 1024; // 1GB threshold
      return used.heapUsed < memoryThreshold;
    });
  }

  private setupErrorHandlers(): void {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      this.handleError(
        new Error(`Unhandled promise rejection: ${reason}`),
        'unhandledRejection'
      );
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.handleError(error, 'uncaughtException');
    });
  }

  private updateMetrics(operation: string, duration: number, success: boolean): void {
    this.metrics.requestCount++;
    
    if (success) {
      this.metrics.successCount++;
    } else {
      this.metrics.errorCount++;
    }
    
    // Update response time metrics (simplified implementation)
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.requestCount - 1) + duration) / 
      this.metrics.requestCount;
    
    this.metrics.errorRate = this.metrics.errorCount / this.metrics.requestCount;
    
    // Calculate throughput (requests per second)
    if (this.startTime) {
      const uptimeSeconds = (Date.now() - this.startTime.getTime()) / 1000;
      this.metrics.throughput = this.metrics.requestCount / uptimeSeconds;
    }

    // Emit metrics update event
    this.emit('metrics:updated', {
      serviceId: this.id,
      operation,
      duration,
      success,
      currentMetrics: this.metrics
    });
  }

  private handleError(error: Error, context: string): void {
    const enrichedError = this.enrichError(error, context, undefined);
    
    this.emit('error', {
      serviceId: this.id,
      error: enrichedError,
      context,
      timestamp: new Date()
    });

    // Log error (would integrate with actual logging service)
    console.error(`[${this.id}] Error in ${context}:`, enrichedError);
  }

  private enrichError(error: Error, operation: string, context?: ServiceContext): BusinessLogicError {
    return {
      code: error.name || 'UNKNOWN_ERROR',
      message: error.message,
      type: 'system',
      severity: 'high',
      details: {
        serviceId: this.id,
        operation,
        contextId: context?.requestId,
        timestamp: new Date().toISOString(),
        stack: error.stack
      },
      stack: error.stack,
      retryable: this.isRetryableError(error)
    };
  }

  private isRetryableError(error: Error): boolean {
    // Define retryable error patterns
    const retryablePatterns = [
      /timeout/i,
      /connection/i,
      /network/i,
      /temporary/i,
      /transient/i
    ];
    
    return retryablePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  }
}
