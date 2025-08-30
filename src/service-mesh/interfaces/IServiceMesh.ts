/**
 * Service Mesh Interfaces
 * Fortune 100-Grade Service Infrastructure Layer
 */

export interface IServiceInstance {
  id: string;
  serviceId: string;
  name: string;
  version: string;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'grpc' | 'tcp';
  metadata: Record<string, unknown>;
  health: IInstanceHealth;
  registeredAt: Date;
  lastHeartbeat: Date;
}

export interface IInstanceHealth {
  status: 'healthy' | 'unhealthy' | 'starting' | 'stopping';
  uptime: number;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  errorRate: number;
  requestRate: number;
  lastHealthCheck: Date;
  issues: string[];
}

export interface IServiceRegistry {
  registerInstance(instance: IServiceInstance): Promise<void>;
  unregisterInstance(instanceId: string): Promise<void>;
  getInstances(serviceId: string): Promise<IServiceInstance[]>;
  getAllInstances(): Promise<IServiceInstance[]>;
  findHealthyInstances(serviceId: string): Promise<IServiceInstance[]>;
  updateInstanceHealth(instanceId: string, health: Partial<IInstanceHealth>): Promise<void>;
}

export interface ILoadBalancer {
  selectInstance(serviceId: string, strategy: LoadBalancingStrategy): Promise<IServiceInstance | null>;
  addStrategy(name: string, strategy: ILoadBalancingStrategy): void;
  removeStrategy(name: string): void;
}

export type LoadBalancingStrategy = 'round-robin' | 'least-connections' | 'weighted' | 'random' | 'hash';

export interface ILoadBalancingStrategy {
  name: string;
  select(instances: IServiceInstance[], context?: IRequestContext): IServiceInstance | null;
}

export interface IRequestContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  clientIP?: string;
  headers: Record<string, string>;
  timestamp: Date;
}

export interface ICircuitBreaker {
  state: CircuitBreakerState;
  failureThreshold: number;
  recoveryTimeout: number;
  successThreshold: number;
  
  execute<T>(operation: () => Promise<T>): Promise<T>;
  getState(): CircuitBreakerState;
  reset(): void;
  forceOpen(): void;
  forceClose(): void;
}

export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface ITrafficPolicy {
  id: string;
  name: string;
  serviceId: string;
  rules: ITrafficRule[];
  priority: number;
  enabled: boolean;
}

export interface ITrafficRule {
  id: string;
  type: 'rate-limit' | 'timeout' | 'retry' | 'circuit-breaker' | 'load-balancer';
  condition: string;
  configuration: Record<string, unknown>;
}

export interface IObservabilityMetrics {
  serviceId: string;
  instanceId: string;
  timestamp: Date;
  requestCount: number;
  responseTime: number;
  errorCount: number;
  activeConnections: number;
  throughput: number;
  cpuUsage: number;
  memoryUsage: number;
  customMetrics: Record<string, number>;
}

export interface ISecurityPolicy {
  id: string;
  name: string;
  serviceId: string;
  authentication: IAuthenticationPolicy;
  authorization: IAuthorizationPolicy;
  encryption: IEncryptionPolicy;
  rateLimiting: IRateLimitingPolicy;
}

export interface IAuthenticationPolicy {
  enabled: boolean;
  methods: ('jwt' | 'oauth' | 'mtls' | 'apikey')[];
  providers: Record<string, unknown>;
}

export interface IAuthorizationPolicy {
  enabled: boolean;
  rules: IAuthorizationRule[];
}

export interface IAuthorizationRule {
  id: string;
  resource: string;
  action: string;
  principal: string;
  condition?: string;
}

export interface IEncryptionPolicy {
  tlsVersion: string;
  cipherSuites: string[];
  certificateValidation: boolean;
  mutualTLS: boolean;
}

export interface IRateLimitingPolicy {
  enabled: boolean;
  requestsPerSecond: number;
  burstSize: number;
  keyExtractor: string;
}

/**
 * Main Service Mesh Interface
 */
export interface IServiceMesh {
  // Service Registry
  getServiceRegistry(): IServiceRegistry;
  
  // Load Balancing
  getLoadBalancer(): ILoadBalancer;
  
  // Circuit Breaking
  getCircuitBreaker(serviceId: string): ICircuitBreaker;
  
  // Traffic Management
  addTrafficPolicy(policy: ITrafficPolicy): Promise<void>;
  removeTrafficPolicy(policyId: string): Promise<void>;
  getTrafficPolicies(serviceId: string): Promise<ITrafficPolicy[]>;
  
  // Security
  addSecurityPolicy(policy: ISecurityPolicy): Promise<void>;
  removeSecurityPolicy(policyId: string): Promise<void>;
  getSecurityPolicy(serviceId: string): Promise<ISecurityPolicy | null>;
  
  // Observability
  collectMetrics(metrics: IObservabilityMetrics): Promise<void>;
  getMetrics(serviceId: string, timeRange?: ITimeRange): Promise<IObservabilityMetrics[]>;
  
  // Health Checks
  performHealthCheck(instanceId: string): Promise<IInstanceHealth>;
  setHealthCheckInterval(interval: number): void;
  
  // Service Discovery
  discoverServices(): Promise<IServiceInstance[]>;
  watchService(serviceId: string, callback: (instances: IServiceInstance[]) => void): void;
  
  // Lifecycle
  start(): Promise<void>;
  stop(): Promise<void>;
  isHealthy(): Promise<boolean>;
}

export interface ITimeRange {
  start: Date;
  end: Date;
}

export interface IServiceMeshConfiguration {
  registry: {
    heartbeatInterval: number;
    instanceTimeout: number;
    cleanupInterval: number;
  };
  loadBalancer: {
    defaultStrategy: LoadBalancingStrategy;
    healthCheckRequired: boolean;
  };
  circuitBreaker: {
    failureThreshold: number;
    recoveryTimeout: number;
    successThreshold: number;
  };
  observability: {
    metricsInterval: number;
    tracesSampling: number;
    retentionPeriod: number;
  };
  security: {
    defaultEncryption: boolean;
    certificateValidation: boolean;
    rateLimitingEnabled: boolean;
  };
}