/**
 * Enterprise Service Bus (ESB) Interfaces
 * Fortune 100-Grade Service Integration Layer
 */

export interface IServiceDefinition {
  id: string;
  name: string;
  version: string;
  type: 'sync' | 'async' | 'event' | 'stream';
  endpoints: IServiceEndpoint[];
  capabilities: string[];
  dependencies: string[];
  metadata: Record<string, unknown>;
}

export interface IServiceEndpoint {
  name: string;
  protocol: 'http' | 'websocket' | 'messagequeue' | 'grpc';
  method: string;
  path: string;
  timeout: number;
  retries: number;
  circuitBreaker: boolean;
  authentication: IAuthenticationConfig;
  rateLimiting: IRateLimitConfig;
}

export interface IAuthenticationConfig {
  required: boolean;
  type: 'jwt' | 'apikey' | 'oauth' | 'mtls';
  roles: string[];
  permissions: string[];
}

export interface IRateLimitConfig {
  enabled: boolean;
  requests: number;
  windowMs: number;
  skipSuccessfulRequests: boolean;
}

export interface IMessageTransformation {
  id: string;
  name: string;
  sourceFormat: string;
  targetFormat: string;
  transformRules: ITransformRule[];
}

export interface ITransformRule {
  sourceField: string;
  targetField: string;
  operation: 'copy' | 'map' | 'compute' | 'aggregate';
  expression?: string;
  defaultValue?: unknown;
}

export interface IRoutingRule {
  id: string;
  name: string;
  condition: string;
  sourceService: string;
  targetServices: string[];
  loadBalancing: 'round-robin' | 'least-connections' | 'weighted' | 'hash';
  failover: boolean;
  priority: number;
}

export interface IServiceBusMetrics {
  messagesProcessed: number;
  averageLatency: number;
  errorRate: number;
  throughput: number;
  activeConnections: number;
  queueDepth: number;
  timestamp: Date;
}

export interface IServiceRequest {
  id: string;
  serviceId: string;
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  payload: unknown;
  context: IRequestContext;
  timeout: number;
  retries: number;
}

export interface IServiceResponse {
  id: string;
  requestId: string;
  status: 'success' | 'error' | 'timeout';
  statusCode: number;
  headers: Record<string, string>;
  payload: unknown;
  processingTime: number;
  error?: Error;
}

export interface IRequestContext {
  userId?: string;
  organizationId?: string;
  correlationId: string;
  traceId: string;
  spanId: string;
  timestamp: Date;
  source: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

/**
 * Main Enterprise Service Bus Interface
 */
export interface IEnterpriseServiceBus {
  /**
   * Service Management
   */
  registerService(definition: IServiceDefinition): Promise<void>;
  unregisterService(serviceId: string): Promise<void>;
  getService(serviceId: string): Promise<IServiceDefinition | null>;
  listServices(): Promise<IServiceDefinition[]>;
  
  /**
   * Message Processing
   */
  processRequest(request: IServiceRequest): Promise<IServiceResponse>;
  processAsyncMessage(serviceId: string, message: unknown, context: IRequestContext): Promise<void>;
  
  /**
   * Routing and Transformation
   */
  addRoutingRule(rule: IRoutingRule): Promise<void>;
  removeRoutingRule(ruleId: string): Promise<void>;
  addTransformation(transformation: IMessageTransformation): Promise<void>;
  removeTransformation(transformationId: string): Promise<void>;
  
  /**
   * Monitoring and Metrics
   */
  getMetrics(): Promise<IServiceBusMetrics>;
  getServiceHealth(serviceId: string): Promise<IServiceHealth>;
  
  /**
   * Lifecycle Management
   */
  start(): Promise<void>;
  stop(): Promise<void>;
  isHealthy(): Promise<boolean>;
}

export interface IServiceHealth {
  serviceId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  issues: string[];
}