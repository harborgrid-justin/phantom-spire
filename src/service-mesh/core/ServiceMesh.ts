/**
 * Service Mesh Core Implementation
 * Fortune 100-Grade Service Infrastructure and Communication Layer
 */

import { EventEmitter } from 'events';
import {
  IServiceMesh,
  IServiceRegistry,
  IServiceInstance,
  ILoadBalancer,
  ICircuitBreaker,
  ITrafficPolicy,
  ISecurityPolicy,
  IObservabilityMetrics,
  IInstanceHealth,
  IRequestContext,
  ILoadBalancingStrategy,
  LoadBalancingStrategy,
  CircuitBreakerState,
  ITimeRange,
  IServiceMeshConfiguration,
} from '../interfaces/IServiceMesh.js';

/**
 * Enterprise Service Mesh Implementation
 */
export class ServiceMesh extends EventEmitter implements IServiceMesh {
  private serviceRegistry: ServiceRegistry;
  private loadBalancer: LoadBalancer;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private trafficPolicies: Map<string, ITrafficPolicy> = new Map();
  private securityPolicies: Map<string, ISecurityPolicy> = new Map();
  private metricsStore: Map<string, IObservabilityMetrics[]> = new Map();
  private started: boolean = false;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(
    private config: IServiceMeshConfiguration = DEFAULT_SERVICE_MESH_CONFIG
  ) {
    super();
    this.serviceRegistry = new ServiceRegistry(this.config.registry);
    this.loadBalancer = new LoadBalancer(
      this.serviceRegistry,
      this.config.loadBalancer
    );
    this.setupEventHandlers();
  }

  /**
   * Service Registry
   */
  getServiceRegistry(): IServiceRegistry {
    return this.serviceRegistry;
  }

  /**
   * Load Balancing
   */
  getLoadBalancer(): ILoadBalancer {
    return this.loadBalancer;
  }

  /**
   * Circuit Breaking
   */
  getCircuitBreaker(serviceId: string): ICircuitBreaker {
    if (!this.circuitBreakers.has(serviceId)) {
      const circuitBreaker = new CircuitBreaker(
        serviceId,
        this.config.circuitBreaker
      );
      this.circuitBreakers.set(serviceId, circuitBreaker);
    }
    return this.circuitBreakers.get(serviceId)!;
  }

  /**
   * Traffic Management
   */
  async addTrafficPolicy(policy: ITrafficPolicy): Promise<void> {
    this.validateTrafficPolicy(policy);
    this.trafficPolicies.set(policy.id, policy);
    this.emit('traffic-policy:added', policy);
    console.log(
      `✅ Traffic policy added: ${policy.name} for service ${policy.serviceId}`
    );
  }

  async removeTrafficPolicy(policyId: string): Promise<void> {
    const policy = this.trafficPolicies.get(policyId);
    if (!policy) {
      throw new Error(`Traffic policy ${policyId} not found`);
    }

    this.trafficPolicies.delete(policyId);
    this.emit('traffic-policy:removed', policy);
    console.log(`✅ Traffic policy removed: ${policy.name}`);
  }

  async getTrafficPolicies(serviceId: string): Promise<ITrafficPolicy[]> {
    return Array.from(this.trafficPolicies.values())
      .filter(policy => policy.serviceId === serviceId)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Security
   */
  async addSecurityPolicy(policy: ISecurityPolicy): Promise<void> {
    this.validateSecurityPolicy(policy);
    this.securityPolicies.set(policy.serviceId, policy);
    this.emit('security-policy:added', policy);
    console.log(`✅ Security policy added for service ${policy.serviceId}`);
  }

  async removeSecurityPolicy(policyId: string): Promise<void> {
    const policy = this.securityPolicies.get(policyId);
    if (!policy) {
      throw new Error(`Security policy ${policyId} not found`);
    }

    this.securityPolicies.delete(policyId);
    this.emit('security-policy:removed', policy);
    console.log(`✅ Security policy removed for service ${policyId}`);
  }

  async getSecurityPolicy(serviceId: string): Promise<ISecurityPolicy | null> {
    return this.securityPolicies.get(serviceId) || null;
  }

  /**
   * Observability
   */
  async collectMetrics(metrics: IObservabilityMetrics): Promise<void> {
    const serviceMetrics = this.metricsStore.get(metrics.serviceId) || [];
    serviceMetrics.push(metrics);

    // Keep only recent metrics (based on retention period)
    const retentionTime =
      Date.now() - this.config.observability.retentionPeriod;
    const filteredMetrics = serviceMetrics.filter(
      m => m.timestamp.getTime() > retentionTime
    );

    this.metricsStore.set(metrics.serviceId, filteredMetrics);
    this.emit('metrics:collected', metrics);
  }

  async getMetrics(
    serviceId: string,
    timeRange?: ITimeRange
  ): Promise<IObservabilityMetrics[]> {
    const metrics = this.metricsStore.get(serviceId) || [];

    if (!timeRange) {
      return metrics;
    }

    return metrics.filter(
      m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  /**
   * Health Checks
   */
  async performHealthCheck(instanceId: string): Promise<IInstanceHealth> {
    const instances = await this.serviceRegistry.getAllInstances();
    const instance = instances.find(i => i.id === instanceId);

    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    const startTime = Date.now();

    try {
      // Perform health check - simplified implementation
      const isHealthy = await this.checkInstanceHealth(instance);
      const responseTime = Date.now() - startTime;

      const health: IInstanceHealth = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        uptime: Date.now() - instance.registeredAt.getTime(),
        responseTime,
        cpuUsage: Math.random() * 100, // Mock data
        memoryUsage: Math.random() * 100, // Mock data
        errorRate: Math.random() * 0.1,
        requestRate: Math.random() * 1000,
        lastHealthCheck: new Date(),
        issues: isHealthy ? [] : ['Health check failed'],
      };

      await this.serviceRegistry.updateInstanceHealth(instanceId, health);
      return health;
    } catch (error) {
      const health: IInstanceHealth = {
        status: 'unhealthy',
        uptime: 0,
        responseTime: Date.now() - startTime,
        cpuUsage: 0,
        memoryUsage: 0,
        errorRate: 1.0,
        requestRate: 0,
        lastHealthCheck: new Date(),
        issues: [`Health check error: ${error}`],
      };

      await this.serviceRegistry.updateInstanceHealth(instanceId, health);
      return health;
    }
  }

  setHealthCheckInterval(interval: number): void {
    this.config.registry.heartbeatInterval = interval;

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.started) {
      this.startHealthChecks();
    }
  }

  /**
   * Service Discovery
   */
  async discoverServices(): Promise<IServiceInstance[]> {
    return this.serviceRegistry.getAllInstances();
  }

  watchService(
    serviceId: string,
    callback: (instances: IServiceInstance[]) => void
  ): void {
    this.serviceRegistry.on(`service:${serviceId}:updated`, callback);
  }

  /**
   * Lifecycle Management
   */
  async start(): Promise<void> {
    if (this.started) {
      return;
    }

    try {
      this.startHealthChecks();
      this.startMetricsCollection();
      this.startServiceCleanup();

      this.started = true;
      this.emit('service-mesh:started');
      console.log('✅ Service Mesh started successfully');
    } catch (error) {
      console.error('❌ Failed to start Service Mesh:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.started) {
      return;
    }

    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      this.started = false;
      this.emit('service-mesh:stopped');
      console.log('✅ Service Mesh stopped successfully');
    } catch (error) {
      console.error('❌ Failed to stop Service Mesh:', error);
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    if (!this.started) {
      return false;
    }

    const instances = await this.serviceRegistry.getAllInstances();
    const healthyInstances = instances.filter(
      i => i.health.status === 'healthy'
    );

    return healthyInstances.length > 0;
  }

  /**
   * Private Helper Methods
   */
  private validateTrafficPolicy(policy: ITrafficPolicy): void {
    if (!policy.id || !policy.name || !policy.serviceId) {
      throw new Error('Traffic policy must have id, name, and serviceId');
    }
  }

  private validateSecurityPolicy(policy: ISecurityPolicy): void {
    if (!policy.id || !policy.name || !policy.serviceId) {
      throw new Error('Security policy must have id, name, and serviceId');
    }
  }

  private async checkInstanceHealth(
    _instance: IServiceInstance
  ): Promise<boolean> {
    // Simple health check - in production, implement proper HTTP/gRPC health checks
    return Math.random() > 0.1; // 90% success rate for mock
  }

  private setupEventHandlers(): void {
    this.serviceRegistry.on(
      'instance:registered',
      (instance: IServiceInstance) => {
        this.emit('instance:registered', instance);
        console.log(
          `🔗 Service instance registered: ${instance.name} (${instance.id})`
        );
      }
    );

    this.serviceRegistry.on(
      'instance:unregistered',
      (instance: IServiceInstance) => {
        this.emit('instance:unregistered', instance);
        console.log(
          `🔌 Service instance unregistered: ${instance.name} (${instance.id})`
        );
      }
    );
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const instances = await this.serviceRegistry.getAllInstances();

        for (const instance of instances) {
          await this.performHealthCheck(instance.id);
        }
      } catch (error) {
        console.error('❌ Health check error:', error);
      }
    }, this.config.registry.heartbeatInterval);
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.emit('metrics:collection-cycle');
    }, this.config.observability.metricsInterval);
  }

  private startServiceCleanup(): void {
    setInterval(async () => {
      try {
        const instances = await this.serviceRegistry.getAllInstances();
        const expiredThreshold =
          Date.now() - this.config.registry.instanceTimeout;

        for (const instance of instances) {
          if (instance.lastHeartbeat.getTime() < expiredThreshold) {
            await this.serviceRegistry.unregisterInstance(instance.id);
            console.log(
              `🧹 Cleaned up expired instance: ${instance.name} (${instance.id})`
            );
          }
        }
      } catch (error) {
        console.error('❌ Service cleanup error:', error);
      }
    }, this.config.registry.cleanupInterval);
  }
}

/**
 * Service Registry Implementation
 */
class ServiceRegistry extends EventEmitter implements IServiceRegistry {
  private instances: Map<string, IServiceInstance> = new Map();

  constructor(_config: any) {
    super();
  }

  async registerInstance(instance: IServiceInstance): Promise<void> {
    this.instances.set(instance.id, instance);
    this.emit('instance:registered', instance);
    this.emit(
      `service:${instance.serviceId}:updated`,
      await this.getInstances(instance.serviceId)
    );
  }

  async unregisterInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (instance) {
      this.instances.delete(instanceId);
      this.emit('instance:unregistered', instance);
      this.emit(
        `service:${instance.serviceId}:updated`,
        await this.getInstances(instance.serviceId)
      );
    }
  }

  async getInstances(serviceId: string): Promise<IServiceInstance[]> {
    return Array.from(this.instances.values()).filter(
      i => i.serviceId === serviceId
    );
  }

  async getAllInstances(): Promise<IServiceInstance[]> {
    return Array.from(this.instances.values());
  }

  async findHealthyInstances(serviceId: string): Promise<IServiceInstance[]> {
    const instances = await this.getInstances(serviceId);
    return instances.filter(i => i.health.status === 'healthy');
  }

  async updateInstanceHealth(
    instanceId: string,
    health: Partial<IInstanceHealth>
  ): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.health = { ...instance.health, ...health };
      instance.lastHeartbeat = new Date();
      this.instances.set(instanceId, instance);
    }
  }
}

/**
 * Load Balancer Implementation
 */
class LoadBalancer implements ILoadBalancer {
  private strategies: Map<string, ILoadBalancingStrategy> = new Map();
  private roundRobinCounters: Map<string, number> = new Map();

  constructor(
    private serviceRegistry: IServiceRegistry,
    private config: any
  ) {
    this.initializeStrategies();
  }

  async selectInstance(
    serviceId: string,
    strategy: LoadBalancingStrategy = this.config.defaultStrategy
  ): Promise<IServiceInstance | null> {
    const instances = this.config.healthCheckRequired
      ? await this.serviceRegistry.findHealthyInstances(serviceId)
      : await this.serviceRegistry.getInstances(serviceId);

    if (instances.length === 0) {
      return null;
    }

    const strategyImpl = this.strategies.get(strategy);
    if (!strategyImpl) {
      throw new Error(`Load balancing strategy '${strategy}' not found`);
    }

    return strategyImpl.select(instances);
  }

  addStrategy(name: string, strategy: ILoadBalancingStrategy): void {
    this.strategies.set(name, strategy);
  }

  removeStrategy(name: string): void {
    this.strategies.delete(name);
  }

  private initializeStrategies(): void {
    // Round Robin Strategy
    this.strategies.set('round-robin', {
      name: 'round-robin',
      select: (
        instances: IServiceInstance[],
        _context?: IRequestContext
      ): IServiceInstance | null => {
        const serviceId = instances[0]?.serviceId;
        if (!serviceId || instances.length === 0) return null;

        const counter = this.roundRobinCounters.get(serviceId) || 0;
        const selectedInstance = instances[counter % instances.length];
        this.roundRobinCounters.set(serviceId, counter + 1);

        return selectedInstance || null;
      },
    });

    // Random Strategy
    this.strategies.set('random', {
      name: 'random',
      select: (
        instances: IServiceInstance[],
        _context?: IRequestContext
      ): IServiceInstance | null => {
        if (instances.length === 0) return null;
        return instances[Math.floor(Math.random() * instances.length)] || null;
      },
    });

    // Least Connections Strategy (simplified)
    this.strategies.set('least-connections', {
      name: 'least-connections',
      select: (
        instances: IServiceInstance[],
        _context?: IRequestContext
      ): IServiceInstance | null => {
        if (instances.length === 0) return null;
        // In a real implementation, track active connections per instance
        const selected = instances.reduce((prev, current) =>
          current.health.requestRate < prev.health.requestRate ? current : prev
        );
        return selected || null;
      },
    });
  }
}

/**
 * Circuit Breaker Implementation
 */
class CircuitBreaker implements ICircuitBreaker {
  public state: CircuitBreakerState = 'closed';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: Date | null = null;

  constructor(
    private serviceId: string,
    private config: {
      failureThreshold: number;
      recoveryTimeout: number;
      successThreshold: number;
    }
  ) {}

  get failureThreshold(): number {
    return this.config.failureThreshold;
  }

  get recoveryTimeout(): number {
    return this.config.recoveryTimeout;
  }

  get successThreshold(): number {
    return this.config.successThreshold;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open';
        this.successCount = 0;
      } else {
        throw new Error(
          `Circuit breaker is OPEN for service ${this.serviceId}`
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }

  forceOpen(): void {
    this.state = 'open';
    this.lastFailureTime = new Date();
  }

  forceClose(): void {
    this.state = 'closed';
    this.failureCount = 0;
  }

  private onSuccess(): void {
    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'closed';
        this.failureCount = 0;
      }
    } else if (this.state === 'closed') {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) {
      return true;
    }

    return Date.now() - this.lastFailureTime.getTime() >= this.recoveryTimeout;
  }
}

const DEFAULT_SERVICE_MESH_CONFIG: IServiceMeshConfiguration = {
  registry: {
    heartbeatInterval: 30000, // 30 seconds
    instanceTimeout: 90000, // 90 seconds
    cleanupInterval: 60000, // 60 seconds
  },
  loadBalancer: {
    defaultStrategy: 'round-robin',
    healthCheckRequired: true,
  },
  circuitBreaker: {
    failureThreshold: 5,
    recoveryTimeout: 60000, // 60 seconds
    successThreshold: 3,
  },
  observability: {
    metricsInterval: 10000, // 10 seconds
    tracesSampling: 0.1, // 10% sampling
    retentionPeriod: 3600000, // 1 hour
  },
  security: {
    defaultEncryption: true,
    certificateValidation: true,
    rateLimitingEnabled: true,
  },
};

export {
  ServiceMesh as Mesh,
  ServiceRegistry,
  LoadBalancer,
  CircuitBreaker,
  DEFAULT_SERVICE_MESH_CONFIG,
};
