/**
 * Enterprise Service Interfaces and Abstract Base Classes
 * Standardized service contracts for consistent architecture
 */

import type { LoggerService } from '../../lib/core/LoggerService';
import type { ICache } from '../../utils/enterprise-cache';
import type { AuditTrailService } from '../../utils/audit-trail';
import type { MetricsRegistry } from '../../monitoring/metrics-system';
import type { CircuitBreaker } from '../../utils/circuit-breaker';

// Service lifecycle states
export enum ServiceState {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing',
  RUNNING = 'running',
  PAUSING = 'pausing',
  PAUSED = 'paused',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error',
}

// Service health status
export interface ServiceHealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    responseTime: number;
    details?: Record<string, unknown>;
  }>;
  dependencies: Array<{
    service: string;
    status: 'available' | 'unavailable' | 'degraded';
    responseTime?: number;
  }>;
  metrics: {
    requestCount: number;
    errorCount: number;
    averageResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

// Service configuration interface
export interface IServiceConfig {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  healthCheckInterval?: number;
  shutdownTimeout?: number;
  retryPolicy?: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
  };
  circuitBreaker?: {
    enabled: boolean;
    failureThreshold: number;
    resetTimeout: number;
  };
  caching?: {
    enabled: boolean;
    defaultTTL: number;
  };
  monitoring?: {
    enabled: boolean;
    metricsPrefix?: string;
  };
}

// Base service interface
export interface IService {
  readonly serviceName: string;
  readonly version: string;
  readonly state: ServiceState;
  readonly dependencies: string[];
  
  // Lifecycle methods
  initialize(): Promise<void>;
  start(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  
  // Health and monitoring
  getHealth(): Promise<ServiceHealthStatus>;
  isHealthy(): Promise<boolean>;
  getMetrics(): Promise<Record<string, unknown>>;
  
  // Configuration and management
  configure(config: Partial<IServiceConfig>): Promise<void>;
  getConfiguration(): IServiceConfig;
  validateDependencies(): Promise<boolean>;
}

// CRUD service interface
export interface ICRUDService<T, CreateRequest, UpdateRequest> extends IService {
  // Basic operations
  create(request: CreateRequest, userId?: string): Promise<T>;
  getById(id: string, userId?: string): Promise<T | null>;
  update(id: string, request: UpdateRequest, userId?: string): Promise<T | null>;
  delete(id: string, userId?: string): Promise<boolean>;
  
  // List operations
  list(options?: ListOptions): Promise<ListResult<T>>;
  count(filters?: Record<string, unknown>): Promise<number>;
  
  // Batch operations
  createBatch(requests: CreateRequest[], userId?: string): Promise<T[]>;
  updateBatch(updates: Array<{ id: string; request: UpdateRequest }>, userId?: string): Promise<T[]>;
  deleteBatch(ids: string[], userId?: string): Promise<number>;
  
  // Search and filtering
  search(query: string, options?: SearchOptions): Promise<SearchResult<T>>;
  filter(filters: Record<string, unknown>, options?: ListOptions): Promise<ListResult<T>>;
}

// List options interface
export interface ListOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
  include?: string[];
  exclude?: string[];
}

// List result interface
export interface ListResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Search options interface
export interface SearchOptions extends ListOptions {
  fuzzy?: boolean;
  highlights?: boolean;
  facets?: string[];
}

// Search result interface
export interface SearchResult<T> extends ListResult<T> {
  query: string;
  executionTime: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
  highlights?: Record<string, string[]>;
}

// Event-driven service interface
export interface IEventDrivenService extends IService {
  // Event handling
  on(event: string, handler: (...args: any[]) => void | Promise<void>): void;
  off(event: string, handler: (...args: any[]) => void | Promise<void>): void;
  emit(event: string, ...args: any[]): Promise<void>;
  
  // Event subscription management
  subscribe(eventPattern: string): Promise<void>;
  unsubscribe(eventPattern: string): Promise<void>;
  getSubscriptions(): string[];
}

// Processing service interface
export interface IProcessingService<InputType, OutputType> extends IService {
  // Processing operations
  process(input: InputType, options?: ProcessingOptions): Promise<OutputType>;
  processBatch(inputs: InputType[], options?: BatchProcessingOptions): Promise<BatchProcessingResult<OutputType>>;
  
  // Job management
  startJob(input: InputType, options?: ProcessingOptions): Promise<ProcessingJob>;
  getJobStatus(jobId: string): Promise<ProcessingJobStatus | null>;
  cancelJob(jobId: string): Promise<boolean>;
  listJobs(options?: ListOptions): Promise<ListResult<ProcessingJob>>;
}

// Processing options
export interface ProcessingOptions {
  priority?: 'low' | 'normal' | 'high';
  timeout?: number;
  retries?: number;
  metadata?: Record<string, unknown>;
}

// Batch processing options
export interface BatchProcessingOptions extends ProcessingOptions {
  concurrency?: number;
  continueOnError?: boolean;
}

// Processing job
export interface ProcessingJob {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  input: unknown;
  output?: unknown;
  error?: string;
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  estimatedCompletion?: Date;
  metadata?: Record<string, unknown>;
}

// Processing job status
export interface ProcessingJobStatus extends ProcessingJob {
  logs: Array<{
    timestamp: Date;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
  }>;
  metrics: {
    itemsProcessed: number;
    itemsTotal: number;
    throughput: number;
    averageProcessingTime: number;
  };
}

// Batch processing result
export interface BatchProcessingResult<T> {
  successful: Array<{ index: number; result: T }>;
  failed: Array<{ index: number; error: string }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    executionTime: number;
  };
}

// Abstract base service implementation
export abstract class AbstractService implements IService {
  protected state: ServiceState = ServiceState.UNINITIALIZED;
  protected config: IServiceConfig;
  protected logger?: LoggerService;
  protected cache?: ICache;
  protected auditTrail?: AuditTrailService;
  protected metricsRegistry?: MetricsRegistry;
  protected circuitBreaker?: CircuitBreaker;
  
  private startTime?: Date;
  private healthCheckInterval?: NodeJS.Timeout;
  private lastHealthCheck?: ServiceHealthStatus;

  constructor(
    config: IServiceConfig,
    dependencies: {
      logger?: LoggerService;
      cache?: ICache;
      auditTrail?: AuditTrailService;
      metricsRegistry?: MetricsRegistry;
      circuitBreaker?: CircuitBreaker;
    } = {}
  ) {
    this.config = config;
    this.logger = dependencies.logger;
    this.cache = dependencies.cache;
    this.auditTrail = dependencies.auditTrail;
    this.metricsRegistry = dependencies.metricsRegistry;
    this.circuitBreaker = dependencies.circuitBreaker;
  }

  // Abstract methods that must be implemented
  abstract readonly serviceName: string;
  abstract readonly version: string;
  protected abstract onInitialize(): Promise<void>;
  protected abstract onStart(): Promise<void>;
  protected abstract onStop(): Promise<void>;
  protected abstract performHealthChecks(): Promise<Array<{ name: string; status: 'pass' | 'fail' | 'warn'; responseTime: number; details?: Record<string, unknown> }>>;

  // Getters
  get dependencies(): string[] {
    return this.config.dependencies || [];
  }

  getState(): ServiceState {
    return this.state;
  }

  get state(): ServiceState {
    return this.getState();
  }

  // Configuration management
  async configure(config: Partial<IServiceConfig>): Promise<void> {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...config };
    
    try {
      await this.onConfigurationChanged(oldConfig, this.config);
      this.logger?.info(`Service ${this.serviceName} reconfigured`, {
        oldConfig,
        newConfig: this.config,
      });
    } catch (error) {
      // Rollback configuration on error
      this.config = oldConfig;
      this.logger?.error(`Failed to reconfigure service ${this.serviceName}`, error);
      throw error;
    }
  }

  getConfiguration(): IServiceConfig {
    return { ...this.config };
  }

  // Lifecycle implementation
  async initialize(): Promise<void> {
    if (this.state !== ServiceState.UNINITIALIZED) {
      throw new Error(`Cannot initialize service ${this.serviceName} from state ${this.state}`);
    }

    this.state = ServiceState.INITIALIZING;

    try {
      // Validate dependencies
      await this.validateDependencies();
      
      // Initialize service-specific logic
      await this.onInitialize();
      
      // Register metrics if enabled
      if (this.config.monitoring?.enabled && this.metricsRegistry) {
        await this.registerMetrics();
      }
      
      this.state = ServiceState.STOPPED;
      this.logger?.info(`Service ${this.serviceName} initialized`);
      
    } catch (error) {
      this.state = ServiceState.ERROR;
      this.logger?.error(`Failed to initialize service ${this.serviceName}`, error);
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this.state !== ServiceState.STOPPED) {
      throw new Error(`Cannot start service ${this.serviceName} from state ${this.state}`);
    }

    try {
      await this.onStart();
      
      this.state = ServiceState.RUNNING;
      this.startTime = new Date();
      
      // Start health checks if configured
      if (this.config.healthCheckInterval && this.config.healthCheckInterval > 0) {
        this.startHealthChecks();
      }
      
      this.logger?.info(`Service ${this.serviceName} started`);
      
    } catch (error) {
      this.state = ServiceState.ERROR;
      this.logger?.error(`Failed to start service ${this.serviceName}`, error);
      throw error;
    }
  }

  async pause(): Promise<void> {
    if (this.state !== ServiceState.RUNNING) {
      throw new Error(`Cannot pause service ${this.serviceName} from state ${this.state}`);
    }

    this.state = ServiceState.PAUSING;

    try {
      await this.onPause();
      this.state = ServiceState.PAUSED;
      this.logger?.info(`Service ${this.serviceName} paused`);
      
    } catch (error) {
      this.state = ServiceState.ERROR;
      this.logger?.error(`Failed to pause service ${this.serviceName}`, error);
      throw error;
    }
  }

  async resume(): Promise<void> {
    if (this.state !== ServiceState.PAUSED) {
      throw new Error(`Cannot resume service ${this.serviceName} from state ${this.state}`);
    }

    try {
      await this.onResume();
      this.state = ServiceState.RUNNING;
      this.logger?.info(`Service ${this.serviceName} resumed`);
      
    } catch (error) {
      this.state = ServiceState.ERROR;
      this.logger?.error(`Failed to resume service ${this.serviceName}`, error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state === ServiceState.STOPPED || this.state === ServiceState.UNINITIALIZED) {
      return;
    }

    this.state = ServiceState.STOPPING;

    try {
      // Stop health checks
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = undefined;
      }
      
      // Stop service-specific logic
      await this.onStop();
      
      this.state = ServiceState.STOPPED;
      this.logger?.info(`Service ${this.serviceName} stopped`);
      
    } catch (error) {
      this.state = ServiceState.ERROR;
      this.logger?.error(`Failed to stop service ${this.serviceName}`, error);
      throw error;
    }
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  // Health and monitoring
  async getHealth(): Promise<ServiceHealthStatus> {
    const now = new Date();
    const uptime = this.startTime ? now.getTime() - this.startTime.getTime() : 0;

    // Perform health checks
    const checks = await this.performHealthChecks();
    
    // Check dependencies
    const dependencies = await this.checkDependencies();
    
    // Determine overall status
    const hasFailedChecks = checks.some(check => check.status === 'fail');
    const hasUnavailableDependencies = dependencies.some(dep => dep.status === 'unavailable');
    const hasWarnings = checks.some(check => check.status === 'warn') || dependencies.some(dep => dep.status === 'degraded');
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (hasFailedChecks || hasUnavailableDependencies) {
      status = 'unhealthy';
    } else if (hasWarnings) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    // Get metrics
    const metrics = await this.getServiceMetrics();

    const healthStatus: ServiceHealthStatus = {
      service: this.serviceName,
      status,
      timestamp: now,
      uptime,
      checks,
      dependencies,
      metrics,
    };

    this.lastHealthCheck = healthStatus;
    return healthStatus;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.getHealth();
      return health.status === 'healthy';
    } catch (error) {
      this.logger?.error(`Health check failed for service ${this.serviceName}`, error);
      return false;
    }
  }

  async getMetrics(): Promise<Record<string, unknown>> {
    const baseMetrics = {
      serviceName: this.serviceName,
      version: this.version,
      state: this.state,
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      lastHealthCheck: this.lastHealthCheck?.timestamp,
      healthStatus: this.lastHealthCheck?.status,
    };

    try {
      const serviceMetrics = await this.getServiceSpecificMetrics();
      return { ...baseMetrics, ...serviceMetrics };
    } catch (error) {
      this.logger?.error(`Failed to get metrics for service ${this.serviceName}`, error);
      return baseMetrics;
    }
  }

  // Dependency validation
  async validateDependencies(): Promise<boolean> {
    if (!this.dependencies.length) {
      return true;
    }

    const validationResults = await Promise.allSettled(
      this.dependencies.map(dep => this.validateSingleDependency(dep))
    );

    const failures = validationResults
      .map((result, index) => ({ result, dependency: this.dependencies[index] }))
      .filter(({ result }) => result.status === 'rejected');

    if (failures.length > 0) {
      const failureMessages = failures.map(({ dependency, result }) => 
        `${dependency}: ${result.status === 'rejected' ? result.reason : 'unknown error'}`
      );
      
      throw new Error(`Dependency validation failed: ${failureMessages.join(', ')}`);
    }

    return true;
  }

  // Protected methods for subclasses
  protected async onPause(): Promise<void> {
    // Default implementation - override if needed
  }

  protected async onResume(): Promise<void> {
    // Default implementation - override if needed
  }

  protected async onConfigurationChanged(oldConfig: IServiceConfig, newConfig: IServiceConfig): Promise<void> {
    // Default implementation - override if needed
  }

  protected async getServiceSpecificMetrics(): Promise<Record<string, unknown>> {
    // Default implementation - override in subclasses
    return {};
  }

  // Private methods
  private async registerMetrics(): Promise<void> {
    if (!this.metricsRegistry) return;

    const metricsPrefix = this.config.monitoring?.metricsPrefix || this.serviceName.toLowerCase();

    // Register standard service metrics
    this.metricsRegistry.registerMetric({
      name: `${metricsPrefix}_requests_total`,
      type: 'counter' as any,
      description: `Total requests processed by ${this.serviceName}`,
      labels: ['operation', 'status'],
    });

    this.metricsRegistry.registerMetric({
      name: `${metricsPrefix}_request_duration_seconds`,
      type: 'histogram' as any,
      description: `Request duration for ${this.serviceName}`,
      labels: ['operation'],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 2.5, 5, 10],
    });

    this.metricsRegistry.registerMetric({
      name: `${metricsPrefix}_health_status`,
      type: 'gauge' as any,
      description: `Health status of ${this.serviceName} (1=healthy, 0.5=degraded, 0=unhealthy)`,
    });
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getHealth();
        
        // Update health metric
        if (this.metricsRegistry) {
          const healthGauge = this.metricsRegistry.getMetric(`${this.serviceName.toLowerCase()}_health_status`);
          if (healthGauge) {
            const value = health.status === 'healthy' ? 1 : health.status === 'degraded' ? 0.5 : 0;
            healthGauge.set(value);
          }
        }
        
        // Log health issues
        if (health.status === 'unhealthy') {
          this.logger?.error(`Service ${this.serviceName} is unhealthy`, { health });
        } else if (health.status === 'degraded') {
          this.logger?.warn(`Service ${this.serviceName} is degraded`, { health });
        }
        
      } catch (error) {
        this.logger?.error(`Health check failed for service ${this.serviceName}`, error);
      }
    }, this.config.healthCheckInterval);
  }

  private async checkDependencies(): Promise<Array<{ service: string; status: 'available' | 'unavailable' | 'degraded'; responseTime?: number }>> {
    const dependencyChecks = await Promise.allSettled(
      this.dependencies.map(async (dep) => {
        const startTime = Date.now();
        
        try {
          const isAvailable = await this.validateSingleDependency(dep);
          const responseTime = Date.now() - startTime;
          
          return {
            service: dep,
            status: isAvailable ? 'available' as const : 'degraded' as const,
            responseTime,
          };
        } catch (error) {
          const responseTime = Date.now() - startTime;
          
          return {
            service: dep,
            status: 'unavailable' as const,
            responseTime,
          };
        }
      })
    );

    return dependencyChecks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          service: this.dependencies[index],
          status: 'unavailable' as const,
        };
      }
    });
  }

  private async validateSingleDependency(dependency: string): Promise<boolean> {
    // Basic implementation - override in subclasses for specific validation logic
    if (dependency === 'cache' && this.cache) {
      try {
        await this.cache.get('dependency-check');
        return true;
      } catch {
        return false;
      }
    }

    // For other dependencies, assume they are available
    // In a real implementation, you would check service registries, databases, etc.
    return true;
  }

  private async getServiceMetrics(): Promise<{
    requestCount: number;
    errorCount: number;
    averageResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  }> {
    // Get metrics from metrics registry if available
    if (this.metricsRegistry) {
      const requestsCounter = this.metricsRegistry.getMetric(`${this.serviceName.toLowerCase()}_requests_total`);
      const durationHistogram = this.metricsRegistry.getMetric(`${this.serviceName.toLowerCase()}_request_duration_seconds`);
      
      // In a real implementation, you would extract actual values from the metrics
      // For now, return simulated values
    }

    // Basic system metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      requestCount: 0, // Would get from actual metrics
      errorCount: 0,   // Would get from actual metrics
      averageResponseTime: 0, // Would calculate from histogram
      memoryUsage: memoryUsage.heapUsed,
      cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
    };
  }
}

// Abstract CRUD service implementation
export abstract class AbstractCRUDService<T, CreateRequest, UpdateRequest> 
  extends AbstractService 
  implements ICRUDService<T, CreateRequest, UpdateRequest> {

  // Abstract methods for CRUD operations
  abstract create(request: CreateRequest, userId?: string): Promise<T>;
  abstract getById(id: string, userId?: string): Promise<T | null>;
  abstract update(id: string, request: UpdateRequest, userId?: string): Promise<T | null>;
  abstract delete(id: string, userId?: string): Promise<boolean>;
  abstract list(options?: ListOptions): Promise<ListResult<T>>;

  // Default implementations that can be overridden
  async count(filters?: Record<string, unknown>): Promise<number> {
    const result = await this.list({ filters, limit: 0 });
    return result.total;
  }

  async createBatch(requests: CreateRequest[], userId?: string): Promise<T[]> {
    const results: T[] = [];
    
    for (const request of requests) {
      try {
        const result = await this.create(request, userId);
        results.push(result);
      } catch (error) {
        // Continue with other items - log error but don't fail entire batch
        this.logger?.error('Batch create item failed', error, { request });
      }
    }
    
    return results;
  }

  async updateBatch(updates: Array<{ id: string; request: UpdateRequest }>, userId?: string): Promise<T[]> {
    const results: T[] = [];
    
    for (const update of updates) {
      try {
        const result = await this.update(update.id, update.request, userId);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        this.logger?.error('Batch update item failed', error, { update });
      }
    }
    
    return results;
  }

  async deleteBatch(ids: string[], userId?: string): Promise<number> {
    let deletedCount = 0;
    
    for (const id of ids) {
      try {
        const deleted = await this.delete(id, userId);
        if (deleted) {
          deletedCount++;
        }
      } catch (error) {
        this.logger?.error('Batch delete item failed', error, { id });
      }
    }
    
    return deletedCount;
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult<T>> {
    // Default implementation using list with filters
    // Override in subclasses for better search functionality
    const listResult = await this.list({
      ...options,
      filters: { ...options?.filters, search: query },
    });

    return {
      ...listResult,
      query,
      executionTime: 0, // Would measure actual execution time
      facets: options?.facets ? {} : undefined,
      highlights: options?.highlights ? {} : undefined,
    };
  }

  async filter(filters: Record<string, unknown>, options?: ListOptions): Promise<ListResult<T>> {
    return await this.list({
      ...options,
      filters: { ...options?.filters, ...filters },
    });
  }
}

// Export interfaces and base classes
export {
  ServiceState,
  type IService,
  type ICRUDService,
  type IEventDrivenService,
  type IProcessingService,
  type IServiceConfig,
  type ServiceHealthStatus,
  type ListOptions,
  type ListResult,
  type SearchOptions,
  type SearchResult,
  type ProcessingOptions,
  type ProcessingJob,
  type ProcessingJobStatus,
  AbstractService,
  AbstractCRUDService,
};