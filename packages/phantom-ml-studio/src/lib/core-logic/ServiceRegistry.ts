/**
 * Enterprise Service Layer with Dependency Injection
 * Provides standardized service architecture with IoC container
 */

// Base service interface
export interface IBaseService {
  readonly serviceName: string;
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  isHealthy(): Promise<boolean>;
}

// Service registry for dependency injection
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, IBaseService> = new Map();
  private singletons: Map<string, any> = new Map();
  private factories: Map<string, () => any> = new Map();
  private initializedServices: Set<string> = new Set();

  private constructor() {}

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  // Register a singleton service
  registerSingleton<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory);
  }

  // Register a service instance
  registerService<T extends IBaseService>(service: T): void {
    this.services.set(service.serviceName, service);
  }

  // Get service instance
  get<T>(token: string): T {
    // Check if it's a registered service
    if (this.services.has(token)) {
      return this.services.get(token) as T;
    }

    // Check if it's a singleton
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    // Create singleton if factory exists
    if (this.factories.has(token)) {
      const factory = this.factories.get(token)!;
      const instance = factory();
      this.singletons.set(token, instance);
      return instance;
    }

    throw new Error(`Service '${token}' is not registered`);
  }

  // Initialize all services
  async initializeAll(): Promise<void> {
    const initPromises = Array.from(this.services.values())
      .filter(service => !this.initializedServices.has(service.serviceName))
      .map(async service => {
        try {
          await service.initialize();
          this.initializedServices.add(service.serviceName);
        } catch (error) {
          console.error(`Failed to initialize service ${service.serviceName}:`, error);
        }
      });

    await Promise.all(initPromises);
  }

  // Health check for all services
  async healthCheck(): Promise<Record<string, boolean>> {
    const healthChecks: Record<string, boolean> = {};
    
    for (const service of this.services.values()) {
      try {
        healthChecks[service.serviceName] = await service.isHealthy();
      } catch (error) {
        healthChecks[service.serviceName] = false;
      }
    }

    return healthChecks;
  }

  // Destroy all services
  async destroyAll(): Promise<void> {
    const destroyPromises = Array.from(this.services.values()).map(async service => {
      try {
        await service.destroy();
        this.initializedServices.delete(service.serviceName);
      } catch (error) {
        console.error(`Failed to destroy service ${service.serviceName}:`, error);
      }
    });

    await Promise.all(destroyPromises);
  }
}

// Base service implementation
export abstract class BaseService implements IBaseService {
  public abstract readonly serviceName: string;
  protected isInitialized: boolean = false;
  protected registry: ServiceRegistry;

  constructor() {
    this.registry = ServiceRegistry.getInstance();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await this.onInitialize();
    this.isInitialized = true;
  }

  async destroy(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    await this.onDestroy();
    this.isInitialized = false;
  }

  async isHealthy(): Promise<boolean> {
    return this.isInitialized && await this.performHealthCheck();
  }

  protected abstract onInitialize(): Promise<void>;
  protected abstract onDestroy(): Promise<void>;
  protected abstract performHealthCheck(): Promise<boolean>;

  protected getDependency<T>(token: string): T {
    return this.registry.get<T>(token);
  }
}

// Service decorators for dependency injection
export function Injectable(serviceName: string) {
  return function <T extends new (...args: any[]) => IBaseService>(constructor: T) {
    return class extends constructor {
      serviceName = serviceName;
    };
  };
}

export function Inject(token: string) {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get: function () {
        const registry = ServiceRegistry.getInstance();
        return registry.get(token);
      }
    });
  };
}

// Configuration service
@Injectable('ConfigurationService')
export class ConfigurationService extends BaseService {
  public readonly serviceName = 'ConfigurationService';
  private config: Record<string, any> = {};

  protected async onInitialize(): Promise<void> {
    // Load configuration from environment, files, etc.
    this.config = {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      environment: process.env.NODE_ENV || 'development',
      enableLogging: process.env.ENABLE_LOGGING === 'true',
      logLevel: process.env.LOG_LEVEL || 'info',
      cacheTimeout: parseInt(process.env.CACHE_TIMEOUT || '300000'),
      enableMetrics: process.env.ENABLE_METRICS === 'true'
    };
  }

  protected async onDestroy(): Promise<void> {
    this.config = {};
  }

  protected async performHealthCheck(): Promise<boolean> {
    return Object.keys(this.config).length > 0;
  }

  get<T>(key: string, defaultValue?: T): T {
    return this.config[key] ?? defaultValue;
  }

  set(key: string, value: any): void {
    this.config[key] = value;
  }
}

// HTTP client service
@Injectable('HttpClientService')
export class HttpClientService extends BaseService {
  public readonly serviceName = 'HttpClientService';
  private baseURL: string = '';
  
  @Inject('ConfigurationService')
  private configService!: ConfigurationService;

  protected async onInitialize(): Promise<void> {
    this.baseURL = this.configService.get<string>('apiUrl');
  }

  protected async onDestroy(): Promise<void> {
    // Cleanup any pending requests
  }

  protected async performHealthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  async get(endpoint: string, options?: RequestInit): Promise<Response> {
    return this.request('GET', endpoint, options);
  }

  async post(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    return this.request('POST', endpoint, {
      ...options,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
  }

  async put(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    return this.request('PUT', endpoint, {
      ...options,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
  }

  async delete(endpoint: string, options?: RequestInit): Promise<Response> {
    return this.request('DELETE', endpoint, options);
  }

  private async request(method: string, endpoint: string, options?: RequestInit): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Accept': 'application/json',
        ...options?.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }
}

// Cache service
@Injectable('CacheService')
export class CacheService extends BaseService {
  public readonly serviceName = 'CacheService';
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  private cleanupInterval?: NodeJS.Timeout;

  @Inject('ConfigurationService')
  private configService!: ConfigurationService;

  protected async onInitialize(): Promise<void> {
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  protected async onDestroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }

  protected async performHealthCheck(): Promise<boolean> {
    return this.cache instanceof Map;
  }

  set(key: string, value: any, ttl?: number): void {
    const defaultTtl = this.configService.get<number>('cacheTimeout', 300000);
    const expiry = Date.now() + (ttl || defaultTtl);
    this.cache.set(key, { value, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Metrics service
@Injectable('MetricsService')
export class MetricsService extends BaseService {
  public readonly serviceName = 'MetricsService';
  private metrics: Map<string, number> = new Map();
  private counters: Map<string, number> = new Map();

  @Inject('ConfigurationService')
  private configService!: ConfigurationService;

  protected async onInitialize(): Promise<void> {
    // Initialize metrics collection
  }

  protected async onDestroy(): Promise<void> {
    this.metrics.clear();
    this.counters.clear();
  }

  protected async performHealthCheck(): Promise<boolean> {
    return this.configService.get<boolean>('enableMetrics', false);
  }

  increment(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  gauge(name: string, value: number): void {
    this.metrics.set(name, value);
  }

  timing(name: string, duration: number): void {
    this.gauge(name, duration);
  }

  getMetrics(): Record<string, number> {
    return {
      ...Object.fromEntries(this.metrics),
      ...Object.fromEntries(this.counters)
    };
  }
}

// Service factory for easy setup
export class ServiceFactory {
  static createDefaultServices(): ServiceRegistry {
    const registry = ServiceRegistry.getInstance();

    // Register core services
    registry.registerService(new ConfigurationService());
    registry.registerService(new HttpClientService());
    registry.registerService(new CacheService());
    registry.registerService(new MetricsService());

    return registry;
  }

  static async initializeServices(): Promise<void> {
    const registry = ServiceFactory.createDefaultServices();
    await registry.initializeAll();
  }
}

// Export service registry instance
export const serviceRegistry = ServiceRegistry.getInstance();