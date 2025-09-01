/**
 * Circuit Breaker Factory and Registry
 * Revolutionary zero-configuration service creation
 */

import { EventEmitter } from 'events';
import { 
  ICircuitBreaker, 
  ICircuitBreakerConfig, 
  ICircuitBreakerFactory,
  ICircuitBreakerRegistry
} from '../interfaces/ICircuitBreaker';
import { CircuitBreaker } from './CircuitBreaker';

/**
 * Global Circuit Breaker Registry
 * Auto-discovers and manages all circuit breakers in the system
 */
export class CircuitBreakerRegistry extends EventEmitter implements ICircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private breakers: Map<string, ICircuitBreaker> = new Map();
  
  private constructor() {
    super();
    this.startGlobalMonitoring();
  }
  
  static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }
  
  /** Register a circuit breaker */
  register(serviceName: string, breaker: ICircuitBreaker): void {
    this.breakers.set(serviceName, breaker);
    
    // Auto-link with existing breakers if enabled
    this.autoLinkBreaker(serviceName, breaker);
    
    this.emit('breaker-registered', serviceName, breaker);
    console.info(`Circuit breaker registered for service: ${serviceName}`);
  }
  
  /** Get circuit breaker by service name */
  get(serviceName: string): ICircuitBreaker | undefined {
    return this.breakers.get(serviceName);
  }
  
  /** Get all registered circuit breakers */
  getAll(): Map<string, ICircuitBreaker> {
    return new Map(this.breakers);
  }
  
  /** Auto-discover and register services */
  async autoDiscover(): Promise<void> {
    const discoveredServices = await this.discoverServices();
    
    for (const serviceName of discoveredServices) {
      if (!this.breakers.has(serviceName)) {
        const breaker = CircuitBreakerFactory.createForService('api', serviceName);
        this.register(serviceName, breaker);
      }
    }
  }
  
  /** Get overall health of all circuits */
  getOverallHealth() {
    const totalCircuits = this.breakers.size;
    let healthyCircuits = 0;
    let openCircuits = 0;
    let halfOpenCircuits = 0;
    
    this.breakers.forEach((breaker) => {
      const health = breaker.getHealth();
      const state = breaker.getState();
      
      if (health.healthy) healthyCircuits++;
      if (state === 'open') openCircuits++;
      if (state === 'half_open') halfOpenCircuits++;
    });
    
    return {
      healthy: healthyCircuits === totalCircuits && totalCircuits > 0,
      totalCircuits,
      healthyCircuits,
      openCircuits,
      halfOpenCircuits
    };
  }
  
  private autoLinkBreaker(serviceName: string, breaker: ICircuitBreaker): void {
    // Auto-link related services
    this.breakers.forEach((existingBreaker, existingServiceName) => {
      if (this.shouldAutoLink(serviceName, existingServiceName)) {
        breaker.linkWith(existingBreaker, existingServiceName);
        existingBreaker.linkWith(breaker, serviceName);
      }
    });
  }
  
  private shouldAutoLink(service1: string, service2: string): boolean {
    // Auto-link services that commonly depend on each other
    const linkPatterns = [
      ['api', 'database'],
      ['api', 'cache'],
      ['service', 'queue'],
      ['web', 'api']
    ];
    
    return linkPatterns.some(([pattern1, pattern2]) => 
      (service1.includes(pattern1) && service2.includes(pattern2)) ||
      (service1.includes(pattern2) && service2.includes(pattern1))
    );
  }
  
  private async discoverServices(): Promise<string[]> {
    const services: Set<string> = new Set();
    
    // Discover from environment variables
    Object.keys(process.env).forEach(key => {
      if (key.includes('SERVICE_') || key.includes('_URL')) {
        const serviceName = key.toLowerCase()
          .replace('_url', '')
          .replace('service_', '')
          .replace(/_/g, '-');
        services.add(serviceName);
      }
    });
    
    // Discover from package.json dependencies (if available)
    try {
      const pkg = require(process.cwd() + '/package.json');
      if (pkg.dependencies) {
        Object.keys(pkg.dependencies).forEach(dep => {
          if (dep.includes('client') || dep.includes('sdk')) {
            services.add(dep.replace('-client', '').replace('-sdk', ''));
          }
        });
      }
    } catch (e) {
      // Ignore if package.json not found
    }
    
    return Array.from(services);
  }
  
  private startGlobalMonitoring(): void {
    // Monitor all circuit breakers and provide global insights
    setInterval(() => {
      const health = this.getOverallHealth();
      
      if (!health.healthy && health.totalCircuits > 0) {
        console.warn('Circuit Breaker Health Alert:', health);
        this.emit('health-alert', health);
      }
      
      this.emit('global-health-check', health);
    }, 30000); // Every 30 seconds
  }
}

/**
 * Revolutionary Circuit Breaker Factory
 * Creates circuit breakers with zero configuration
 */
export class CircuitBreakerFactory implements ICircuitBreakerFactory {
  private static instances: Map<string, ICircuitBreaker> = new Map();
  private static registry = CircuitBreakerRegistry.getInstance();
  
  /** Create circuit breaker with auto-configuration */
  static create(
    serviceName: string = 'default', 
    config: Partial<ICircuitBreakerConfig> = {}
  ): ICircuitBreaker {
    const breaker = new CircuitBreaker(serviceName, {
      autoDiscovery: true,
      autoLink: true,
      ...config
    });
    
    this.registry.register(serviceName, breaker);
    return breaker;
  }
  
  /** Create with intelligent defaults based on service type */
  static createForService(
    serviceType: 'database' | 'api' | 'cache' | 'queue' | 'custom',
    serviceName: string = serviceType
  ): ICircuitBreaker {
    const serviceConfigs = {
      database: {
        failureThreshold: 3,
        successThreshold: 2,
        recoveryTimeout: 30000,
        minimumRequestThreshold: 5
      },
      api: {
        failureThreshold: 5,
        successThreshold: 3,
        recoveryTimeout: 60000,
        minimumRequestThreshold: 10
      },
      cache: {
        failureThreshold: 8,
        successThreshold: 5,
        recoveryTimeout: 10000,
        minimumRequestThreshold: 15
      },
      queue: {
        failureThreshold: 10,
        successThreshold: 3,
        recoveryTimeout: 45000,
        minimumRequestThreshold: 8
      },
      custom: {
        failureThreshold: 5,
        successThreshold: 3,
        recoveryTimeout: 30000,
        minimumRequestThreshold: 10
      }
    };
    
    return this.create(serviceName, serviceConfigs[serviceType]);
  }
  
  /** Get or create singleton instance */
  static getInstance(
    serviceName: string, 
    config: Partial<ICircuitBreakerConfig> = {}
  ): ICircuitBreaker {
    if (!this.instances.has(serviceName)) {
      const breaker = this.create(serviceName, config);
      this.instances.set(serviceName, breaker);
    }
    return this.instances.get(serviceName)!;
  }
  
  /** Revolutionary zero-config factory method */
  static autoCreate(serviceName?: string): ICircuitBreaker {
    const name = serviceName || this.autoDetectServiceName();
    const serviceType = this.autoDetectServiceType(name);
    
    console.info(`Auto-creating circuit breaker for ${serviceType} service: ${name}`);
    return this.createForService(serviceType, name);
  }
  
  private static autoDetectServiceName(): string {
    // Auto-detect service name from various sources
    return process.env.SERVICE_NAME || 
           process.env.npm_package_name || 
           'auto-service-' + Date.now();
  }
  
  private static autoDetectServiceType(serviceName: string): 'database' | 'api' | 'cache' | 'queue' | 'custom' {
    const name = serviceName.toLowerCase();
    
    if (name.includes('db') || name.includes('database') || name.includes('mongo') || name.includes('sql')) {
      return 'database';
    } else if (name.includes('cache') || name.includes('redis') || name.includes('memcache')) {
      return 'cache';
    } else if (name.includes('queue') || name.includes('mq') || name.includes('message')) {
      return 'queue';
    } else if (name.includes('api') || name.includes('service') || name.includes('server')) {
      return 'api';
    }
    
    return 'custom';
  }
  
  // Instance methods for compatibility
  create(serviceName?: string, config?: Partial<ICircuitBreakerConfig>): ICircuitBreaker {
    return CircuitBreakerFactory.create(serviceName, config);
  }
  
  createForService(
    serviceType: 'database' | 'api' | 'cache' | 'queue' | 'custom',
    serviceName?: string
  ): ICircuitBreaker {
    return CircuitBreakerFactory.createForService(serviceType, serviceName);
  }
  
  getInstance(serviceName: string, config?: Partial<ICircuitBreakerConfig>): ICircuitBreaker {
    return CircuitBreakerFactory.getInstance(serviceName, config);
  }
}

// Export singleton instances for convenience
export const circuitBreakerRegistry = CircuitBreakerRegistry.getInstance();
export const circuitBreakerFactory = new CircuitBreakerFactory();