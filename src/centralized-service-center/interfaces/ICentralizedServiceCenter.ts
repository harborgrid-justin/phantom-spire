/**
 * Centralized System Service Center Interfaces
 * Fortune 100-Grade Unified Platform Service Interface
 */

import { EventEmitter } from 'events';

/**
 * Core service center configuration
 */
export interface ICentralizedServiceCenterConfig {
  // Service Discovery and Registry
  serviceRegistry: {
    enabled: boolean;
    autoDiscovery: boolean;
    healthCheckInterval: number;
    serviceTimeout: number;
  };

  // Unified API Gateway
  apiGateway: {
    enabled: boolean;
    port: number;
    enableAuthentication: boolean;
    enableRateLimit: boolean;
    enableLogging: boolean;
  };

  // Cross-Module Integration
  integration: {
    enabled: boolean;
    enableCrossModuleRouting: boolean;
    enableEventBridge: boolean;
    enableUnifiedMetrics: boolean;
  };

  // Enterprise Management
  management: {
    enableUnifiedConfig: boolean;
    enableCentralizedLogging: boolean;
    enableHealthDashboard: boolean;
    enablePerformanceMonitoring: boolean;
  };
}

/**
 * Unified service interface for all platform modules
 */
export interface IUnifiedPlatformService {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'core' | 'analytics' | 'intelligence' | 'workflow' | 'integration' | 'security';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  capabilities: string[];
  endpoints: IServiceEndpoint[];
  dependencies: string[];
  configuration: Record<string, any>;
  metrics: IServiceMetrics;
  health: IServiceHealth;
}

/**
 * Service endpoint definition
 */
export interface IServiceEndpoint {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: IEndpointParameter[];
  responseType: string;
  requiresAuth: boolean;
}

/**
 * Endpoint parameter definition
 */
export interface IEndpointParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: any;
}

/**
 * Service metrics
 */
export interface IServiceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  currentThroughput: number;
  errorRate: number;
  lastRequestTime: Date;
  uptime: number;
}

/**
 * Service health status
 */
export interface IServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  lastCheck: Date;
  responseTime: number;
  errorCount: number;
  issues: string[];
  dependencies: Record<string, 'healthy' | 'unhealthy' | 'unknown'>;
}

/**
 * Unified request context
 */
export interface IUnifiedRequestContext {
  requestId: string;
  userId?: string;
  organizationId?: string;
  sessionId?: string;
  correlationId?: string;
  traceId?: string;
  timestamp: Date;
  source: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

/**
 * Unified response format
 */
export interface IUnifiedResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    requestId: string;
    timestamp: Date;
    processingTime: number;
    serviceId: string;
    traceId?: string;
  };
}

/**
 * Platform-wide status
 */
export interface IPlatformStatus {
  overall: 'healthy' | 'degraded' | 'critical' | 'maintenance';
  services: Record<string, IServiceHealth>;
  metrics: IPlatformMetrics;
  lastUpdate: Date;
}

/**
 * Platform-wide metrics
 */
export interface IPlatformMetrics {
  totalServices: number;
  activeServices: number;
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  uptime: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

/**
 * Service operation request
 */
export interface IServiceOperationRequest {
  serviceId: string;
  operation: string;
  parameters: Record<string, any>;
  context: IUnifiedRequestContext;
  options?: {
    timeout?: number;
    retries?: number;
    priority?: 'low' | 'normal' | 'high' | 'critical';
  };
}

/**
 * Main centralized service center interface
 */
export interface ICentralizedServiceCenter extends EventEmitter {
  /**
   * Initialize and start the service center
   */
  start(): Promise<void>;

  /**
   * Stop the service center
   */
  stop(): Promise<void>;

  /**
   * Register a platform service
   */
  registerService(service: IUnifiedPlatformService): Promise<void>;

  /**
   * Unregister a platform service
   */
  unregisterService(serviceId: string): Promise<void>;

  /**
   * Get all registered services
   */
  getServices(): Promise<IUnifiedPlatformService[]>;

  /**
   * Get a specific service
   */
  getService(serviceId: string): Promise<IUnifiedPlatformService | null>;

  /**
   * Execute operation on any service
   */
  executeOperation(request: IServiceOperationRequest): Promise<IUnifiedResponse>;

  /**
   * Get platform-wide status
   */
  getPlatformStatus(): Promise<IPlatformStatus>;

  /**
   * Get platform-wide metrics
   */
  getPlatformMetrics(): Promise<IPlatformMetrics>;

  /**
   * Get platform configuration
   */
  getConfiguration(): Promise<Record<string, any>>;

  /**
   * Update platform configuration
   */
  updateConfiguration(config: Partial<Record<string, any>>): Promise<void>;

  /**
   * Search services by capability
   */
  findServicesByCapability(capability: string): Promise<IUnifiedPlatformService[]>;

  /**
   * Get service dependencies
   */
  getServiceDependencies(serviceId: string): Promise<string[]>;

  /**
   * Get unified API documentation
   */
  getApiDocumentation(): Promise<Record<string, any>>;

  /**
   * Get Fortune 100-grade compliance status across all services
   */
  getFortune100ComplianceStatus(): Promise<Record<string, any>>;

  /**
   * Get Fortune 100-grade platform capabilities summary
   */
  getFortune100Capabilities(): Promise<Record<string, any>>;
}