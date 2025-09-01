/**
 * Generic Service Bus Core Implementation
 * Reusable service integration and orchestration for any Node.js project
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { 
  IServiceBus,
  IServiceDefinition,
  IServiceRequest,
  IServiceResponse,
  IRequestContext,
  IRoutingRule,
  IMessageTransformation,
  IServiceBusMetrics,
  IServiceHealth,
  ITransformRule,
  ICircuitBreakerState,
  IServiceBusConfig,
  ILogger,
  IMessageQueue
} from '../interfaces/IServiceBus';

// Default console logger
const defaultLogger: ILogger = {
  error: (message: string, meta?: any) => console.error(message, meta),
  warn: (message: string, meta?: any) => console.warn(message, meta),
  info: (message: string, meta?: any) => console.info(message, meta),
  debug: (message: string, meta?: any) => console.debug(message, meta)
};

const DEFAULT_CONFIG: IServiceBusConfig = {
  healthCheckInterval: 30000, // 30 seconds
  metricsInterval: 10000,     // 10 seconds
  circuitBreakerThreshold: 5,
  defaultTimeout: 30000,      // 30 seconds
  enableMetrics: true,
  enableHealthChecks: true
};

/**
 * Central Generic Service Bus implementation
 * Provides comprehensive service integration, routing, and transformation
 */
export class ServiceBus extends EventEmitter implements IServiceBus {
  private services: Map<string, IServiceDefinition> = new Map();
  private routingRules: Map<string, IRoutingRule> = new Map();
  private transformations: Map<string, IMessageTransformation> = new Map();
  private metrics: IServiceBusMetrics;
  private circuitBreakers: Map<string, ICircuitBreakerState> = new Map();
  private started: boolean = false;
  private healthChecks: Map<string, IServiceHealth> = new Map();
  private logger: ILogger;
  private config: IServiceBusConfig;
  private messageQueue?: IMessageQueue;
  private healthCheckInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;

  constructor(
    messageQueue?: IMessageQueue,
    config: Partial<IServiceBusConfig> = {},
    logger?: ILogger
  ) {
    super();
    this.messageQueue = messageQueue;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = logger || defaultLogger;
    this.metrics = this.initializeMetrics();
    this.setupEventHandlers();
  }

  /**
   * Service Management
   */
  async registerService(definition: IServiceDefinition): Promise<void> {
    try {
      // Validate service definition
      this.validateServiceDefinition(definition);
      
      // Register service
      this.services.set(definition.id, definition);
      
      // Initialize circuit breaker
      this.circuitBreakers.set(definition.id, {
        state: 'closed',
        failureCount: 0,
        lastFailureTime: null,
        successCount: 0
      });
      
      // Initialize health check
      if (this.config.enableHealthChecks) {
        this.healthChecks.set(definition.id, {
          serviceId: definition.id,
          status: 'healthy',
          uptime: 0,
          lastCheck: new Date(),
          responseTime: 0,
          errorRate: 0,
          issues: []
        });
      }

      this.emit('service:registered', definition);
      this.logger.info(`Service registered: ${definition.name} (${definition.id})`);
      
    } catch (error) {
      this.logger.error(`Failed to register service ${definition.id}`, { error });
      throw error;
    }
  }

  async unregisterService(serviceId: string): Promise<void> {
    try {
      const service = this.services.get(serviceId);
      if (!service) {
        throw new Error(`Service ${serviceId} not found`);
      }

      this.services.delete(serviceId);
      this.circuitBreakers.delete(serviceId);
      this.healthChecks.delete(serviceId);
      
      // Remove related routing rules
      for (const [ruleId, rule] of Array.from(this.routingRules.entries())) {
        if (rule.sourceService === serviceId || rule.targetServices.includes(serviceId)) {
          this.routingRules.delete(ruleId);
        }
      }

      this.emit('service:unregistered', service);
      this.logger.info(`Service unregistered: ${service.name} (${serviceId})`);
      
    } catch (error) {
      this.logger.error(`Failed to unregister service ${serviceId}`, { error });
      throw error;
    }
  }

  async getService(serviceId: string): Promise<IServiceDefinition | null> {
    return this.services.get(serviceId) || null;
  }

  async listServices(): Promise<IServiceDefinition[]> {
    return Array.from(this.services.values());
  }

  /**
   * Message Processing
   */
  async processRequest(request: IServiceRequest): Promise<IServiceResponse> {
    const startTime = Date.now();
    
    try {
      // Validate request
      this.validateRequest(request);
      
      // Check circuit breaker
      const circuitBreakerState = this.circuitBreakers.get(request.serviceId);
      if (circuitBreakerState?.state === 'open') {
        throw new Error(`Circuit breaker open for service ${request.serviceId}`);
      }
      
      // Apply routing rules
      const targetServices = this.applyRoutingRules(request);
      
      // Apply transformations
      const transformedRequest = await this.applyTransformations(request);
      
      // Process request
      const response = await this.executeRequest(transformedRequest, targetServices);
      
      // Update metrics and circuit breaker on success
      if (this.config.enableMetrics) {
        this.updateMetricsOnSuccess(request.serviceId, Date.now() - startTime);
      }
      this.updateCircuitBreakerOnSuccess(request.serviceId);
      
      this.emit('request:processed', { request, response, processingTime: Date.now() - startTime });
      
      return response;
      
    } catch (error) {
      // Update metrics and circuit breaker on failure
      if (this.config.enableMetrics) {
        this.updateMetricsOnError(request.serviceId);
      }
      this.updateCircuitBreakerOnFailure(request.serviceId);
      
      const errorResponse: IServiceResponse = {
        id: uuidv4(),
        requestId: request.id,
        status: 'error',
        statusCode: 500,
        headers: {},
        payload: null,
        processingTime: Date.now() - startTime,
        error: error as Error
      };
      
      this.emit('request:failed', { request, error, processingTime: Date.now() - startTime });
      
      return errorResponse;
    }
  }

  async processAsyncMessage(serviceId: string, message: unknown, context: IRequestContext): Promise<void> {
    try {
      const service = this.services.get(serviceId);
      if (!service) {
        throw new Error(`Service ${serviceId} not found`);
      }

      // Create async request
      const request: IServiceRequest = {
        id: uuidv4(),
        serviceId,
        endpoint: 'async',
        method: 'POST',
        headers: {},
        payload: message,
        context,
        timeout: this.config.defaultTimeout,
        retries: 3
      };

      // Process asynchronously
      this.processRequest(request).catch(error => {
        this.logger.error(`Async message processing failed for ${serviceId}`, { error });
        this.emit('async:failed', { serviceId, message, error });
      });
      
    } catch (error) {
      this.logger.error(`Failed to process async message for ${serviceId}`, { error });
      throw error;
    }
  }

  /**
   * Routing and Transformation
   */
  async addRoutingRule(rule: IRoutingRule): Promise<void> {
    this.validateRoutingRule(rule);
    this.routingRules.set(rule.id, rule);
    this.emit('routing:rule:added', rule);
    this.logger.info(`Routing rule added: ${rule.name} (${rule.id})`);
  }

  async removeRoutingRule(ruleId: string): Promise<void> {
    const rule = this.routingRules.get(ruleId);
    if (!rule) {
      throw new Error(`Routing rule ${ruleId} not found`);
    }
    
    this.routingRules.delete(ruleId);
    this.emit('routing:rule:removed', rule);
    this.logger.info(`Routing rule removed: ${rule.name} (${ruleId})`);
  }

  async addTransformation(transformation: IMessageTransformation): Promise<void> {
    this.validateTransformation(transformation);
    this.transformations.set(transformation.id, transformation);
    this.emit('transformation:added', transformation);
    this.logger.info(`Transformation added: ${transformation.name} (${transformation.id})`);
  }

  async removeTransformation(transformationId: string): Promise<void> {
    const transformation = this.transformations.get(transformationId);
    if (!transformation) {
      throw new Error(`Transformation ${transformationId} not found`);
    }
    
    this.transformations.delete(transformationId);
    this.emit('transformation:removed', transformation);
    this.logger.info(`Transformation removed: ${transformation.name} (${transformationId})`);
  }

  /**
   * Monitoring and Metrics
   */
  async getMetrics(): Promise<IServiceBusMetrics> {
    return { ...this.metrics, timestamp: new Date() };
  }

  async getServiceHealth(serviceId: string): Promise<IServiceHealth> {
    const health = this.healthChecks.get(serviceId);
    if (!health) {
      throw new Error(`Service ${serviceId} not found`);
    }
    
    // Perform live health check
    if (this.config.enableHealthChecks) {
      await this.performHealthCheck(serviceId);
    }
    
    return this.healthChecks.get(serviceId)!;
  }

  /**
   * Lifecycle Management
   */
  async start(): Promise<void> {
    if (this.started) {
      return;
    }

    try {
      // Initialize message queue integration if available
      if (this.messageQueue) {
        await this.initializeMessageQueueIntegration();
      }
      
      // Start health check interval
      if (this.config.enableHealthChecks) {
        this.startHealthCheckInterval();
      }
      
      // Start metrics collection
      if (this.config.enableMetrics) {
        this.startMetricsCollection();
      }
      
      this.started = true;
      this.emit('bus:started');
      this.logger.info('Service Bus started successfully');
      
    } catch (error) {
      this.logger.error('Failed to start Service Bus', { error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.started) {
      return;
    }

    try {
      // Clear intervals
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
      }

      // Stop message queue if available
      if (this.messageQueue) {
        await this.messageQueue.stop();
      }
      
      this.started = false;
      this.emit('bus:stopped');
      this.logger.info('Service Bus stopped successfully');
      
    } catch (error) {
      this.logger.error('Failed to stop Service Bus', { error });
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    if (!this.started) {
      return false;
    }
    
    // Check if any services are unhealthy
    if (this.config.enableHealthChecks) {
      for (const health of Array.from(this.healthChecks.values())) {
        if (health.status === 'unhealthy') {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Private Helper Methods
   */
  private validateServiceDefinition(definition: IServiceDefinition): void {
    if (!definition.id || !definition.name || !definition.version) {
      throw new Error('Service definition must have id, name, and version');
    }
    
    if (this.services.has(definition.id)) {
      throw new Error(`Service ${definition.id} already registered`);
    }
  }

  private validateRequest(request: IServiceRequest): void {
    if (!request.id || !request.serviceId || !request.context) {
      throw new Error('Invalid request: missing required fields');
    }
    
    if (!this.services.has(request.serviceId)) {
      throw new Error(`Service ${request.serviceId} not registered`);
    }
  }

  private validateRoutingRule(rule: IRoutingRule): void {
    if (!rule.id || !rule.name || !rule.sourceService || !rule.targetServices.length) {
      throw new Error('Invalid routing rule: missing required fields');
    }
  }

  private validateTransformation(transformation: IMessageTransformation): void {
    if (!transformation.id || !transformation.name || !transformation.transformRules.length) {
      throw new Error('Invalid transformation: missing required fields');
    }
  }

  private applyRoutingRules(request: IServiceRequest): string[] {
    const applicableRules = Array.from(this.routingRules.values())
      .filter(rule => rule.sourceService === request.serviceId)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of applicableRules) {
      if (this.evaluateRoutingCondition(rule.condition, request)) {
        return rule.targetServices;
      }
    }
    
    return [request.serviceId]; // Default to original service
  }

  private evaluateRoutingCondition(condition: string, _request: IServiceRequest): boolean {
    // Simple condition evaluation - in production, use a proper expression evaluator
    if (condition === 'always') return true;
    if (condition === 'never') return false;
    
    // Add more sophisticated condition evaluation logic here
    return true;
  }

  private async applyTransformations(request: IServiceRequest): Promise<IServiceRequest> {
    const applicableTransformations = Array.from(this.transformations.values())
      .filter(t => t.sourceFormat === 'request');

    let transformedRequest = { ...request };

    for (const transformation of applicableTransformations) {
      transformedRequest = await this.applyTransformation(transformedRequest, transformation);
    }

    return transformedRequest;
  }

  private async applyTransformation(
    request: IServiceRequest, 
    transformation: IMessageTransformation
  ): Promise<IServiceRequest> {
    const transformedPayload = { ...request.payload as Record<string, unknown> };

    for (const rule of transformation.transformRules) {
      await this.applyTransformRule(transformedPayload, rule);
    }

    return { ...request, payload: transformedPayload };
  }

  private async applyTransformRule(payload: Record<string, unknown>, rule: ITransformRule): Promise<void> {
    switch (rule.operation) {
      case 'copy':
        if (payload[rule.sourceField] !== undefined) {
          payload[rule.targetField] = payload[rule.sourceField];
        } else if (rule.defaultValue !== undefined) {
          payload[rule.targetField] = rule.defaultValue;
        }
        break;
      case 'map':
        // Implement mapping logic
        break;
      case 'compute':
        // Implement computation logic using rule.expression
        break;
      case 'aggregate':
        // Implement aggregation logic
        break;
    }
  }

  private async executeRequest(request: IServiceRequest, targetServices: string[]): Promise<IServiceResponse> {
    // Simple implementation - in production, implement proper load balancing
    const targetService = targetServices[0];
    
    if (!targetService) {
      throw new Error('No target service specified');
    }
    
    const service = this.services.get(targetService);
    
    if (!service) {
      throw new Error(`Target service ${targetService} not found`);
    }

    // Simulate service execution - in real implementation, this would make actual service calls
    return {
      id: uuidv4(),
      requestId: request.id,
      status: 'success',
      statusCode: 200,
      headers: {},
      payload: { result: 'processed', serviceId: targetService },
      processingTime: Math.random() * 100 + 10 // 10-110ms
    };
  }

  private updateMetricsOnSuccess(_serviceId: string, processingTime: number): void {
    this.metrics.messagesProcessed++;
    this.metrics.averageLatency = (this.metrics.averageLatency + processingTime) / 2;
    this.updateThroughput();
  }

  private updateMetricsOnError(_serviceId: string): void {
    this.metrics.messagesProcessed++;
    this.metrics.errorRate = Math.min(this.metrics.errorRate + 0.01, 1.0);
  }

  private updateThroughput(): void {
    // Simple throughput calculation - in production, use more sophisticated metrics
    this.metrics.throughput = this.metrics.messagesProcessed / 60; // messages per minute
  }

  private updateCircuitBreakerOnSuccess(serviceId: string): void {
    const circuitBreaker = this.circuitBreakers.get(serviceId);
    if (circuitBreaker) {
      circuitBreaker.successCount++;
      if (circuitBreaker.state === 'half-open' && circuitBreaker.successCount >= 3) {
        circuitBreaker.state = 'closed';
        circuitBreaker.failureCount = 0;
      }
    }
  }

  private updateCircuitBreakerOnFailure(serviceId: string): void {
    const circuitBreaker = this.circuitBreakers.get(serviceId);
    if (circuitBreaker) {
      circuitBreaker.failureCount++;
      circuitBreaker.lastFailureTime = new Date();
      
      if (circuitBreaker.failureCount >= this.config.circuitBreakerThreshold) {
        circuitBreaker.state = 'open';
      }
    }
  }

  private async performHealthCheck(serviceId: string): Promise<void> {
    const health = this.healthChecks.get(serviceId);
    if (!health) return;

    const startTime = Date.now();
    
    try {
      // Perform actual health check - simplified implementation
      const isHealthy = true; // In production, perform real health check
      const responseTime = Date.now() - startTime;
      
      health.status = isHealthy ? 'healthy' : 'unhealthy';
      health.lastCheck = new Date();
      health.responseTime = responseTime;
      health.issues = isHealthy ? [] : ['Health check failed'];
      
    } catch (error) {
      health.status = 'unhealthy';
      health.lastCheck = new Date();
      health.responseTime = Date.now() - startTime;
      health.issues = [`Health check error: ${error}`];
    }
  }

  private initializeMetrics(): IServiceBusMetrics {
    return {
      messagesProcessed: 0,
      averageLatency: 0,
      errorRate: 0,
      throughput: 0,
      activeConnections: 0,
      queueDepth: 0,
      timestamp: new Date()
    };
  }

  private setupEventHandlers(): void {
    this.on('error', (error) => {
      this.logger.error('Service Bus Error', { error });
    });
  }

  private async initializeMessageQueueIntegration(): Promise<void> {
    if (this.messageQueue) {
      // Subscribe to relevant message queue topics
      await this.messageQueue.start();
      this.logger.info('Message Queue integration initialized');
    }
  }

  private startHealthCheckInterval(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const serviceId of Array.from(this.services.keys())) {
        await this.performHealthCheck(serviceId);
      }
    }, this.config.healthCheckInterval);
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.emit('metrics:updated', this.metrics);
    }, this.config.metricsInterval);
  }
}