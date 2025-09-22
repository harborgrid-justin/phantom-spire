/**
 * Enterprise Dependency Injection Container
 * Advanced IoC container with lifecycle management, interceptors, and scoped services
 */

import { LoggerService } from './LoggerService';

// Enhanced service lifecycle states
export enum ServiceLifecycle {
  REGISTERED = 'registered',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error',
  DESTROYED = 'destroyed',
}

// Service scope types
export enum ServiceScope {
  SINGLETON = 'singleton',
  TRANSIENT = 'transient',
  SCOPED = 'scoped',
  REQUEST = 'request',
}

// Enhanced service metadata
export interface ServiceMetadata {
  name: string;
  scope: ServiceScope;
  lifecycle: ServiceLifecycle;
  dependencies: string[];
  optionalDependencies: string[];
  tags: string[];
  factory?: () => Promise<unknown> | unknown;
  instance?: unknown;
  createdAt: Date;
  lastAccessed?: Date;
  accessCount: number;
  initializationTime?: number;
  version?: string;
  description?: string;
  healthCheck?: () => Promise<boolean>;
  metrics?: () => Promise<Record<string, unknown>>;
  retryCount: number;
  maxRetries: number;
}

// Service registration options
export interface ServiceRegistrationOptions {
  scope?: ServiceScope;
  dependencies?: string[];
  optionalDependencies?: string[];
  tags?: string[];
  version?: string;
  description?: string;
  healthCheck?: () => Promise<boolean>;
  metrics?: () => Promise<Record<string, unknown>>;
  maxRetries?: number;
  singleton?: boolean; // Legacy support
}

// Service interceptor interface
export interface IServiceInterceptor {
  name: string;
  priority?: number;
  beforeInitialize?(serviceName: string, service: unknown): Promise<void>;
  afterInitialize?(serviceName: string, service: unknown): Promise<void>;
  beforeDestroy?(serviceName: string, service: unknown): Promise<void>;
  afterDestroy?(serviceName: string, service: unknown): Promise<void>;
  onError?(serviceName: string, error: Error): Promise<void>;
  onAccessDenied?(serviceName: string, context: unknown): Promise<void>;
}

// Service context for scoped services
export interface ServiceContext {
  id: string;
  type: 'request' | 'transaction' | 'user' | 'custom';
  data?: Record<string, unknown>;
  createdAt: Date;
  parent?: ServiceContext;
}

// Enhanced Enterprise Dependency Injection Container
export class EnterpriseServiceContainer {
  private static instance: EnterpriseServiceContainer;
  
  // Core service storage
  private services = new Map<string, ServiceMetadata>();
  private instances = new Map<string, unknown>();
  private singletons = new Map<string, unknown>();
  private factories = new Map<string, () => unknown>();
  
  // Dependency management
  private dependencies = new Map<string, Set<string>>();
  private dependents = new Map<string, Set<string>>();
  private circularDependencyDetection = new Set<string>();
  
  // Context management for scoped services
  private scopedInstances = new Map<string, Map<string, unknown>>();
  private currentContext?: ServiceContext;
  
  // Interceptors and lifecycle
  private interceptors: IServiceInterceptor[] = [];
  private isShuttingDown = false;
  private initializationOrder: string[] = [];
  
  // Health monitoring
  private healthCheckTimer?: NodeJS.Timeout;
  private metricsTimer?: NodeJS.Timeout;
  private logger?: LoggerService;
  
  // Configuration
  private readonly config = {
    enableHealthChecks: true,
    healthCheckInterval: 30000,
    enableMetrics: true,
    metricsInterval: 60000,
    maxRetries: 3,
    retryDelay: 1000,
    shutdownTimeout: 30000,
    enableCircularDependencyDetection: true,
    enableAccessLogging: true,
  };

  private constructor() {}

  static getInstance(): EnterpriseServiceContainer {
    if (!EnterpriseServiceContainer.instance) {
      EnterpriseServiceContainer.instance = new EnterpriseServiceContainer();
    }
    return EnterpriseServiceContainer.instance;
  }

  // Set logger for the container
  setLogger(logger: LoggerService): void {
    this.logger = logger;
    this.logger.info('Enterprise Service Container logger configured');
  }

  // Register a service with enhanced options
  register<T>(
    serviceName: string,
    serviceOrFactory: T | (() => T | Promise<T>),
    options: ServiceRegistrationOptions = {}
  ): void {
    // Handle legacy singleton option
    if (options.singleton !== undefined) {
      options.scope = options.singleton ? ServiceScope.SINGLETON : ServiceScope.TRANSIENT;
    }

    const metadata: ServiceMetadata = {
      name: serviceName,
      scope: options.scope || ServiceScope.SINGLETON,
      lifecycle: ServiceLifecycle.REGISTERED,
      dependencies: options.dependencies || [],
      optionalDependencies: options.optionalDependencies || [],
      tags: options.tags || [],
      createdAt: new Date(),
      accessCount: 0,
      version: options.version,
      description: options.description,
      healthCheck: options.healthCheck,
      metrics: options.metrics,
      retryCount: 0,
      maxRetries: options.maxRetries || this.config.maxRetries,
    };

    // Store service or factory
    if (typeof serviceOrFactory === 'function') {
      metadata.factory = serviceOrFactory as () => T | Promise<T>;
      this.factories.set(serviceName, serviceOrFactory as () => T);
    } else {
      metadata.instance = serviceOrFactory;
      this.instances.set(serviceName, serviceOrFactory);
    }

    this.services.set(serviceName, metadata);

    // Build dependency graphs
    this.buildDependencyGraphs(serviceName, metadata.dependencies);

    this.logger?.info(`Service '${serviceName}' registered`, {
      scope: metadata.scope,
      dependencies: metadata.dependencies,
      tags: metadata.tags,
    });
  }

  // Legacy compatibility methods
  registerService<T>(service: T & { serviceName: string }): void {
    this.register(service.serviceName, service);
  }

  registerSingleton<T>(token: string, factory: () => T): void {
    this.register(token, factory, { scope: ServiceScope.SINGLETON });
  }

  // Get service with enhanced error handling and context
  async get<T>(serviceName: string, context?: ServiceContext): Promise<T> {
    if (this.isShuttingDown) {
      throw new Error('Service container is shutting down');
    }

    const metadata = this.services.get(serviceName);
    if (!metadata) {
      throw new Error(`Service '${serviceName}' not found in container`);
    }

    // Set context if provided
    const previousContext = this.currentContext;
    if (context) {
      this.currentContext = context;
    }

    try {
      // Update access tracking
      metadata.accessCount++;
      metadata.lastAccessed = new Date();

      if (this.config.enableAccessLogging) {
        this.logger?.debug(`Accessing service '${serviceName}'`, {
          accessCount: metadata.accessCount,
          scope: metadata.scope,
          context: context?.type,
        });
      }

      // Handle different scopes
      let instance: T;
      switch (metadata.scope) {
        case ServiceScope.SINGLETON:
          instance = await this.getSingleton<T>(serviceName);
          break;
        case ServiceScope.TRANSIENT:
          instance = await this.createTransient<T>(serviceName);
          break;
        case ServiceScope.SCOPED:
        case ServiceScope.REQUEST:
          instance = await this.getScoped<T>(serviceName, context);
          break;
        default:
          throw new Error(`Unsupported service scope: ${metadata.scope}`);
      }

      // Ensure the service is initialized
      if (metadata.lifecycle === ServiceLifecycle.REGISTERED) {
        await this.initializeService(serviceName);
      }

      return instance;

    } catch (error) {
      // Run error interceptors
      for (const interceptor of this.interceptors) {
        if (interceptor.onError) {
          await interceptor.onError(serviceName, error as Error);
        }
      }
      throw error;
    } finally {
      // Restore previous context
      this.currentContext = previousContext;
    }
  }

  // Synchronous get for already resolved services
  getSync<T>(serviceName: string): T {
    const instance = this.instances.get(serviceName) || this.singletons.get(serviceName);
    if (!instance) {
      throw new Error(`Service '${serviceName}' not found or not initialized`);
    }

    const metadata = this.services.get(serviceName);
    if (metadata) {
      metadata.accessCount++;
      metadata.lastAccessed = new Date();
    }

    return instance as T;
  }

  // Check if service exists
  has(serviceName: string): boolean {
    return this.services.has(serviceName);
  }

  // Get all service names
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  // Get services by tag
  getServicesByTag(tag: string): string[] {
    return Array.from(this.services.entries())
      .filter(([, metadata]) => metadata.tags.includes(tag))
      .map(([name]) => name);
  }

  // Add service interceptor
  addInterceptor(interceptor: IServiceInterceptor): void {
    this.interceptors.push(interceptor);
    this.interceptors.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    this.logger?.info(`Interceptor '${interceptor.name}' added`);
  }

  // Remove interceptor
  removeInterceptor(interceptorName: string): void {
    const index = this.interceptors.findIndex(i => i.name === interceptorName);
    if (index !== -1) {
      this.interceptors.splice(index, 1);
      this.logger?.info(`Interceptor '${interceptorName}' removed`);
    }
  }

  // Initialize all services in dependency order
  async initializeAll(): Promise<void> {
    this.logger?.info('Starting enterprise service initialization');

    try {
      // Calculate initialization order
      this.initializationOrder = this.calculateInitializationOrder();
      
      // Initialize services in order
      for (const serviceName of this.initializationOrder) {
        await this.initializeService(serviceName);
      }

      // Start background tasks
      this.startBackgroundTasks();

      this.logger?.info('All services initialized successfully', {
        count: this.initializationOrder.length,
        order: this.initializationOrder,
      });

    } catch (error) {
      this.logger?.error('Service initialization failed', error);
      throw error;
    }
  }

  // Enhanced health check for all services
  async healthCheck(): Promise<Record<string, {
    healthy: boolean;
    lifecycle: ServiceLifecycle;
    lastCheck: Date;
    error?: string;
    customHealth?: Record<string, unknown>;
  }>> {
    const healthStatus: Record<string, any> = {};

    for (const [serviceName, metadata] of this.services) {
      const status = {
        healthy: false,
        lifecycle: metadata.lifecycle,
        lastCheck: new Date(),
      };

      try {
        if (metadata.lifecycle === ServiceLifecycle.RUNNING) {
          // Use custom health check if available
          if (metadata.healthCheck) {
            status.healthy = await metadata.healthCheck();
          } else {
            // Default health check for services with isHealthy method
            const instance = this.instances.get(serviceName) || this.singletons.get(serviceName);
            if (instance && typeof (instance as any).isHealthy === 'function') {
              status.healthy = await (instance as any).isHealthy();
            } else {
              status.healthy = true; // Service is running
            }
          }
        }
      } catch (error) {
        status.healthy = false;
        status.error = error instanceof Error ? error.message : String(error);
      }

      healthStatus[serviceName] = status;
    }

    return healthStatus;
  }

  // Get comprehensive metrics
  async getMetrics(): Promise<Record<string, unknown>> {
    const metrics: Record<string, unknown> = {
      container: {
        totalServices: this.services.size,
        runningServices: Array.from(this.services.values()).filter(
          s => s.lifecycle === ServiceLifecycle.RUNNING
        ).length,
        totalInterceptors: this.interceptors.length,
        isShuttingDown: this.isShuttingDown,
      },
      services: {},
    };

    for (const [serviceName, metadata] of this.services) {
      const serviceMetrics: Record<string, unknown> = {
        lifecycle: metadata.lifecycle,
        scope: metadata.scope,
        accessCount: metadata.accessCount,
        lastAccessed: metadata.lastAccessed,
        createdAt: metadata.createdAt,
        initializationTime: metadata.initializationTime,
        dependencies: metadata.dependencies,
        retryCount: metadata.retryCount,
        maxRetries: metadata.maxRetries,
      };

      // Get custom metrics if available
      if (metadata.metrics) {
        try {
          serviceMetrics.custom = await metadata.metrics();
        } catch (error) {
          serviceMetrics.metricsError = error instanceof Error ? error.message : String(error);
        }
      }

      (metrics.services as Record<string, unknown>)[serviceName] = serviceMetrics;
    }

    return metrics;
  }

  // Graceful shutdown with timeout
  async shutdown(): Promise<void> {
    this.logger?.info('Starting graceful shutdown');
    this.isShuttingDown = true;

    // Stop background tasks
    this.stopBackgroundTasks();

    // Shutdown services in reverse order
    const shutdownOrder = [...this.initializationOrder].reverse();

    const shutdownPromises = shutdownOrder.map(async serviceName => {
      try {
        await this.destroyService(serviceName);
      } catch (error) {
        this.logger?.error(`Failed to destroy service '${serviceName}'`, error);
      }
    });

    // Wait for shutdown with timeout
    try {
      await Promise.race([
        Promise.all(shutdownPromises),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Shutdown timeout')), this.config.shutdownTimeout)
        ),
      ]);
      this.logger?.info('Graceful shutdown completed');
    } catch (error) {
      this.logger?.error('Shutdown timeout exceeded, forcing termination');
      throw error;
    }
  }

  // Create service context
  createContext(type: ServiceContext['type'], data?: Record<string, unknown>): ServiceContext {
    return {
      id: `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      createdAt: new Date(),
      parent: this.currentContext,
    };
  }

  // Private methods

  private async getSingleton<T>(serviceName: string): Promise<T> {
    let instance = this.singletons.get(serviceName);
    
    if (!instance) {
      instance = await this.createInstance<T>(serviceName);
      this.singletons.set(serviceName, instance);
    }

    return instance as T;
  }

  private async createTransient<T>(serviceName: string): Promise<T> {
    return await this.createInstance<T>(serviceName);
  }

  private async getScoped<T>(serviceName: string, context?: ServiceContext): Promise<T> {
    const contextId = context?.id || 'default';
    
    if (!this.scopedInstances.has(contextId)) {
      this.scopedInstances.set(contextId, new Map());
    }

    const contextInstances = this.scopedInstances.get(contextId)!;
    let instance = contextInstances.get(serviceName);

    if (!instance) {
      instance = await this.createInstance<T>(serviceName);
      contextInstances.set(serviceName, instance);
    }

    return instance as T;
  }

  private async createInstance<T>(serviceName: string): Promise<T> {
    const metadata = this.services.get(serviceName);
    if (!metadata) {
      throw new Error(`Service '${serviceName}' not found`);
    }

    // Resolve dependencies first
    await this.resolveDependencies(serviceName);

    if (metadata.factory) {
      const result = metadata.factory();
      return result instanceof Promise ? await result : result as T;
    } else if (metadata.instance) {
      return metadata.instance as T;
    } else if (this.factories.has(serviceName)) {
      const factory = this.factories.get(serviceName)!;
      return factory() as T;
    } else {
      throw new Error(`No factory or instance found for service '${serviceName}'`);
    }
  }

  private async resolveDependencies(serviceName: string): Promise<void> {
    const metadata = this.services.get(serviceName);
    if (!metadata) return;

    // Resolve required dependencies
    const dependencyPromises = metadata.dependencies.map(async depName => {
      if (!this.has(depName)) {
        throw new Error(`Required dependency '${depName}' not found for service '${serviceName}'`);
      }
      await this.initializeService(depName);
    });

    // Resolve optional dependencies (don't fail if missing)
    const optionalDependencyPromises = metadata.optionalDependencies.map(async depName => {
      if (this.has(depName)) {
        try {
          await this.initializeService(depName);
        } catch (error) {
          this.logger?.warn(`Optional dependency '${depName}' failed to initialize for '${serviceName}'`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    });

    await Promise.all([...dependencyPromises, ...optionalDependencyPromises]);
  }

  private async initializeService(serviceName: string): Promise<void> {
    const metadata = this.services.get(serviceName);
    if (!metadata) {
      throw new Error(`Service '${serviceName}' not found`);
    }

    // Skip if already running
    if (metadata.lifecycle === ServiceLifecycle.RUNNING) {
      return;
    }

    // Skip if initializing (circular dependency protection)
    if (metadata.lifecycle === ServiceLifecycle.INITIALIZING) {
      if (this.config.enableCircularDependencyDetection) {
        throw new Error(`Circular dependency detected for service '${serviceName}'`);
      }
      return;
    }

    const startTime = Date.now();

    try {
      metadata.lifecycle = ServiceLifecycle.INITIALIZING;

      // Run before interceptors
      for (const interceptor of this.interceptors) {
        if (interceptor.beforeInitialize) {
          await interceptor.beforeInitialize(serviceName, metadata.instance);
        }
      }

      // Get instance (this will resolve dependencies)
      const instance = await this.get(serviceName);

      // Initialize the service if it has an initialize method
      if (instance && typeof (instance as any).initialize === 'function') {
        await (instance as any).initialize();
      }

      metadata.lifecycle = ServiceLifecycle.RUNNING;
      metadata.initializationTime = Date.now() - startTime;
      metadata.retryCount = 0; // Reset retry count on success

      // Run after interceptors
      for (const interceptor of this.interceptors) {
        if (interceptor.afterInitialize) {
          await interceptor.afterInitialize(serviceName, instance);
        }
      }

      this.logger?.info(`Service '${serviceName}' initialized successfully`, {
        initializationTime: metadata.initializationTime,
        lifecycle: metadata.lifecycle,
      });

    } catch (error) {
      metadata.lifecycle = ServiceLifecycle.ERROR;
      metadata.retryCount++;

      this.logger?.error(`Failed to initialize service '${serviceName}' (attempt ${metadata.retryCount}/${metadata.maxRetries})`, error);

      // Retry logic
      if (metadata.retryCount < metadata.maxRetries) {
        this.logger?.info(`Retrying initialization of service '${serviceName}' in ${this.config.retryDelay}ms`);
        
        setTimeout(async () => {
          try {
            await this.initializeService(serviceName);
          } catch (retryError) {
            this.logger?.error(`Retry failed for service '${serviceName}'`, retryError);
          }
        }, this.config.retryDelay * metadata.retryCount); // Exponential backoff
      }

      throw error;
    }
  }

  private async destroyService(serviceName: string): Promise<void> {
    const metadata = this.services.get(serviceName);
    if (!metadata || metadata.lifecycle === ServiceLifecycle.DESTROYED) {
      return;
    }

    try {
      metadata.lifecycle = ServiceLifecycle.STOPPING;

      const instance = this.instances.get(serviceName) || 
                       this.singletons.get(serviceName);

      if (instance) {
        // Run before destroy interceptors
        for (const interceptor of this.interceptors) {
          if (interceptor.beforeDestroy) {
            await interceptor.beforeDestroy(serviceName, instance);
          }
        }

        // Destroy the service if it has a destroy method
        if (typeof (instance as any).destroy === 'function') {
          await (instance as any).destroy();
        }

        // Run after destroy interceptors
        for (const interceptor of this.interceptors) {
          if (interceptor.afterDestroy) {
            await interceptor.afterDestroy(serviceName, instance);
          }
        }
      }

      metadata.lifecycle = ServiceLifecycle.DESTROYED;
      this.instances.delete(serviceName);
      this.singletons.delete(serviceName);

      this.logger?.info(`Service '${serviceName}' destroyed successfully`);

    } catch (error) {
      this.logger?.error(`Failed to destroy service '${serviceName}'`, error);
      throw error;
    }
  }

  private buildDependencyGraphs(serviceName: string, dependencies: string[]): void {
    this.dependencies.set(serviceName, new Set(dependencies));

    dependencies.forEach(dep => {
      if (!this.dependents.has(dep)) {
        this.dependents.set(dep, new Set());
      }
      this.dependents.get(dep)!.add(serviceName);
    });
  }

  private calculateInitializationOrder(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (serviceName: string): void => {
      if (visited.has(serviceName)) {
        return;
      }

      if (visiting.has(serviceName)) {
        throw new Error(`Circular dependency detected involving service '${serviceName}'`);
      }

      visiting.add(serviceName);

      const dependencies = this.dependencies.get(serviceName);
      if (dependencies) {
        for (const dep of dependencies) {
          if (this.has(dep)) { // Only visit existing services
            visit(dep);
          }
        }
      }

      visiting.delete(serviceName);
      visited.add(serviceName);
      order.push(serviceName);
    };

    for (const serviceName of this.services.keys()) {
      visit(serviceName);
    }

    return order;
  }

  private startBackgroundTasks(): void {
    if (this.config.enableHealthChecks) {
      this.healthCheckTimer = setInterval(async () => {
        try {
          const healthStatus = await this.healthCheck();
          const unhealthyServices = Object.entries(healthStatus)
            .filter(([, status]) => !status.healthy)
            .map(([name]) => name);

          if (unhealthyServices.length > 0) {
            this.logger?.warn(`Unhealthy services detected: ${unhealthyServices.join(', ')}`);
          }
        } catch (error) {
          this.logger?.error('Health check failed', error);
        }
      }, this.config.healthCheckInterval);
    }

    if (this.config.enableMetrics) {
      this.metricsTimer = setInterval(async () => {
        try {
          const metrics = await this.getMetrics();
          this.logger?.debug('Service metrics collected', { metrics });
        } catch (error) {
          this.logger?.error('Metrics collection failed', error);
        }
      }, this.config.metricsInterval);
    }
  }

  private stopBackgroundTasks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }
  }
}

// Export singleton instance with legacy compatibility
export const serviceRegistry = {
  ...EnterpriseServiceContainer.getInstance(),
  // Legacy method compatibility
  registerService<T extends { serviceName: string }>(service: T): void {
    EnterpriseServiceContainer.getInstance().register(service.serviceName, service);
  },
  registerSingleton<T>(token: string, factory: () => T): void {
    EnterpriseServiceContainer.getInstance().register(token, factory, { scope: ServiceScope.SINGLETON });
  },
  async initializeAll(): Promise<void> {
    return EnterpriseServiceContainer.getInstance().initializeAll();
  },
  async destroyAll(): Promise<void> {
    return EnterpriseServiceContainer.getInstance().shutdown();
  },
};

// Export the enhanced container
export const enterpriseContainer = EnterpriseServiceContainer.getInstance();

// Legacy exports for compatibility
export const ServiceRegistry = EnterpriseServiceContainer;
export { ServiceScope as ServiceType };

// Enhanced service factory
export class EnterpriseServiceFactory {
  static createContainer(): EnterpriseServiceContainer {
    return EnterpriseServiceContainer.getInstance();
  }

  static async initializeDefaultServices(logger?: LoggerService): Promise<void> {
    const container = EnterpriseServiceContainer.getInstance();
    
    if (logger) {
      container.setLogger(logger);
    }

    await container.initializeAll();
  }
}