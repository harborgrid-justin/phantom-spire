/**
 * Service Type Definitions
 * Service layer interfaces following Facebook's service architecture patterns
 */

// Service Registry Types
export interface ServiceDefinition {
  id: string;
  name: string;
  version: string;
  category: ServiceCategory;
  description?: string;
  dependencies: string[];
  config: ServiceConfiguration;
  status: ServiceStatus;
  metadata: ServiceMetadata;
}

export type ServiceCategory = 
  | 'business-logic'
  | 'analytics' 
  | 'integration'
  | 'infrastructure'
  | 'security'
  | 'monitoring';

export type ServiceStatus = 
  | 'initializing'
  | 'ready'
  | 'degraded'
  | 'error'
  | 'shutdown';

export interface ServiceConfiguration {
  enabled: boolean;
  autoStart: boolean;
  retryPolicy: RetryPolicy;
  timeouts: ServiceTimeouts;
  caching: CacheConfiguration;
  monitoring: MonitoringConfiguration;
  security?: SecurityConfiguration;
}

export interface ServiceMetadata {
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  documentation?: string;
  supportContact?: string;
}

// Retry and Timeout Configuration
export interface RetryPolicy {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
  jitter: boolean;
  retryableErrors: string[];
}

export interface ServiceTimeouts {
  request: number;
  connection: number;
  idle: number;
}

// Cache Configuration
export interface CacheConfiguration {
  enabled: boolean;
  provider: CacheProvider;
  ttl: number;
  maxSize: number;
  compressionEnabled: boolean;
  keyPrefix?: string;
  tags?: string[];
}

export type CacheProvider = 'memory' | 'redis' | 'hybrid';

// Monitoring Configuration
export interface MonitoringConfiguration {
  metricsEnabled: boolean;
  tracingEnabled: boolean;
  healthCheckEnabled: boolean;
  alerting: AlertingConfiguration;
  sampling: SamplingConfiguration;
}

export interface AlertingConfiguration {
  enabled: boolean;
  errorRate: AlertThreshold;
  responseTime: AlertThreshold;
  throughput: AlertThreshold;
  availability: AlertThreshold;
}

export interface AlertThreshold {
  warning: number;
  critical: number;
  evaluationWindow: number;
}

export interface SamplingConfiguration {
  rate: number;
  maxTracesPerSecond: number;
  slowRequestThreshold: number;
}

// Security Configuration
export interface SecurityConfiguration {
  authenticationRequired: boolean;
  authorizationRequired: boolean;
  rateLimiting: RateLimitConfiguration;
  inputValidation: ValidationConfiguration;
  outputSanitization: SanitizationConfiguration;
}

export interface RateLimitConfiguration {
  enabled: boolean;
  requestsPerSecond: number;
  burstSize: number;
  keyGenerator: 'ip' | 'user' | 'session' | 'custom';
}

export interface ValidationConfiguration {
  enabled: boolean;
  strictMode: boolean;
  customRules: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date';
  required: boolean;
  constraints?: ValidationConstraints;
}

export interface ValidationConstraints {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: string[];
  min?: number;
  max?: number;
  format?: string;
}

export interface SanitizationConfiguration {
  enabled: boolean;
  htmlEncoding: boolean;
  sqlInjectionProtection: boolean;
  xssProtection: boolean;
  customFilters: SanitizationFilter[];
}

export interface SanitizationFilter {
  field: string;
  type: 'html' | 'sql' | 'xss' | 'custom';
  config: Record<string, unknown>;
}

// Service Health Types
export interface ServiceHealth {
  serviceId: string;
  status: ServiceStatus;
  timestamp: Date;
  checks: HealthCheck[];
  dependencies: DependencyHealth[];
  uptime: number;
  version: string;
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'warning';
  message?: string;
  duration: number;
  metadata?: Record<string, unknown>;
}

export interface DependencyHealth {
  name: string;
  status: ServiceStatus;
  responseTime: number;
  lastChecked: Date;
  error?: string;
}

// Event Bus Types
export interface ServiceEvent<T = Record<string, unknown>> {
  id: string;
  type: string;
  source: string;
  target?: string;
  data: T;
  metadata: EventMetadata;
  timestamp: Date;
}

export interface EventMetadata {
  version: string;
  correlationId?: string;
  causationId?: string;
  userId?: string;
  sessionId?: string;
  priority: EventPriority;
  tags?: string[];
}

export type EventPriority = 'low' | 'normal' | 'high' | 'critical';

export interface EventHandler<T = Record<string, unknown>> {
  id: string;
  eventType: string;
  handler: (_event: ServiceEvent<T>) => Promise<void>;
  options: EventHandlerOptions;
}

export interface EventHandlerOptions {
  async: boolean;
  retryPolicy?: RetryPolicy;
  deadLetterQueue?: boolean;
  ordering?: 'fifo' | 'none';
  batchSize?: number;
}

// Service Execution Context
export interface ServiceContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  tenantId?: string;
  permissions: string[];
  startTime: Date;
  timeout: number;
  metadata: Record<string, unknown>;
  trace: TraceContext;
}

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  baggage: Record<string, string>;
  sampled: boolean;
}

// Service Performance Types
export interface ServicePerformanceMetrics {
  serviceId: string;
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
  timestamp: Date;
  timeWindow: number;
}

export interface ServiceResourceMetrics {
  serviceId: string;
  cpuUsage: number;
  memoryUsage: number;
  memoryLimit: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  activeConnections: number;
  queueDepth: number;
  timestamp: Date;
}

// Service Lifecycle Types
export interface ServiceLifecycle {
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
  getHealth(): Promise<ServiceHealth>;
  getMetrics(): Promise<ServicePerformanceMetrics>;
}