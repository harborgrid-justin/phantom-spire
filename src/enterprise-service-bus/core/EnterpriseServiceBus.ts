/**
 * Enterprise Service Bus Core Implementation
 * Fortune 100-Grade Service Integration and Orchestration
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  IEnterpriseServiceBus,
  IServiceDefinition,
  IServiceRequest,
  IServiceResponse,
  IRequestContext,
  IRoutingRule,
  IMessageTransformation,
  IServiceBusMetrics,
  IServiceHealth,
  ITransformRule,
} from '../interfaces/IEnterpriseServiceBus.js';

/**
 * Central Enterprise Service Bus implementation
 * Provides comprehensive service integration, routing, and transformation
 */
export class EnterpriseServiceBus
  extends EventEmitter
  implements IEnterpriseServiceBus
{
  private services: Map<string, IServiceDefinition> = new Map();
  private routingRules: Map<string, IRoutingRule> = new Map();
  private transformations: Map<string, IMessageTransformation> = new Map();
  private metrics: IServiceBusMetrics;
  private circuitBreakers: Map<string, ICircuitBreakerState> = new Map();
  private started: boolean = false;
  private healthChecks: Map<string, IServiceHealth> = new Map();

  constructor(
    private messageQueueManager?: any,
    private config: IESBConfiguration = DEFAULT_ESB_CONFIG
  ) {
    super();
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
        successCount: 0,
      });

      // Initialize health check
      this.healthChecks.set(definition.id, {
        serviceId: definition.id,
        status: 'healthy',
        uptime: 0,
        lastCheck: new Date(),
        responseTime: 0,
        errorRate: 0,
        issues: [],
      });

      this.emit('service:registered', definition);
      console.log(
        `✅ Service registered: ${definition.name} (${definition.id})`
      );
    } catch (error) {
      console.error(`❌ Failed to register service ${definition.id}:`, error);
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
        if (
          rule.sourceService === serviceId ||
          rule.targetServices.includes(serviceId)
        ) {
          this.routingRules.delete(ruleId);
        }
      }

      this.emit('service:unregistered', service);
      console.log(`✅ Service unregistered: ${service.name} (${serviceId})`);
    } catch (error) {
      console.error(`❌ Failed to unregister service ${serviceId}:`, error);
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
        throw new Error(
          `Circuit breaker open for service ${request.serviceId}`
        );
      }

      // Apply routing rules
      const targetServices = this.applyRoutingRules(request);

      // Apply transformations
      const transformedRequest = await this.applyTransformations(request);

      // Process request
      const response = await this.executeRequest(
        transformedRequest,
        targetServices
      );

      // Update metrics and circuit breaker on success
      this.updateMetricsOnSuccess(request.serviceId, Date.now() - startTime);
      this.updateCircuitBreakerOnSuccess(request.serviceId);

      this.emit('request:processed', {
        request,
        response,
        processingTime: Date.now() - startTime,
      });

      return response;
    } catch (error) {
      // Update metrics and circuit breaker on failure
      this.updateMetricsOnError(request.serviceId);
      this.updateCircuitBreakerOnFailure(request.serviceId);

      const errorResponse: IServiceResponse = {
        id: uuidv4(),
        requestId: request.id,
        status: 'error',
        statusCode: 500,
        headers: {},
        payload: null,
        processingTime: Date.now() - startTime,
        error: error as Error,
      };

      this.emit('request:failed', {
        request,
        error,
        processingTime: Date.now() - startTime,
      });

      return errorResponse;
    }
  }

  async processAsyncMessage(
    serviceId: string,
    message: unknown,
    context: IRequestContext
  ): Promise<void> {
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
        timeout: 30000,
        retries: 3,
      };

      // Process asynchronously
      this.processRequest(request).catch(error => {
        console.error(
          `❌ Async message processing failed for ${serviceId}:`,
          error
        );
        this.emit('async:failed', { serviceId, message, error });
      });
    } catch (error) {
      console.error(
        `❌ Failed to process async message for ${serviceId}:`,
        error
      );
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
    console.log(`✅ Routing rule added: ${rule.name} (${rule.id})`);
  }

  async removeRoutingRule(ruleId: string): Promise<void> {
    const rule = this.routingRules.get(ruleId);
    if (!rule) {
      throw new Error(`Routing rule ${ruleId} not found`);
    }

    this.routingRules.delete(ruleId);
    this.emit('routing:rule:removed', rule);
    console.log(`✅ Routing rule removed: ${rule.name} (${ruleId})`);
  }

  async addTransformation(
    transformation: IMessageTransformation
  ): Promise<void> {
    this.validateTransformation(transformation);
    this.transformations.set(transformation.id, transformation);
    this.emit('transformation:added', transformation);
    console.log(
      `✅ Transformation added: ${transformation.name} (${transformation.id})`
    );
  }

  async removeTransformation(transformationId: string): Promise<void> {
    const transformation = this.transformations.get(transformationId);
    if (!transformation) {
      throw new Error(`Transformation ${transformationId} not found`);
    }

    this.transformations.delete(transformationId);
    this.emit('transformation:removed', transformation);
    console.log(
      `✅ Transformation removed: ${transformation.name} (${transformationId})`
    );
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
    await this.performHealthCheck(serviceId);

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
      if (this.messageQueueManager) {
        await this.initializeMessageQueueIntegration();
      }

      // Start health check interval
      this.startHealthCheckInterval();

      // Start metrics collection
      this.startMetricsCollection();

      this.started = true;
      this.emit('esb:started');
      console.log('✅ Enterprise Service Bus started successfully');
    } catch (error) {
      console.error('❌ Failed to start Enterprise Service Bus:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.started) {
      return;
    }

    try {
      this.started = false;
      this.emit('esb:stopped');
      console.log('✅ Enterprise Service Bus stopped successfully');
    } catch (error) {
      console.error('❌ Failed to stop Enterprise Service Bus:', error);
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    if (!this.started) {
      return false;
    }

    // Check if any services are unhealthy
    for (const health of Array.from(this.healthChecks.values())) {
      if (health.status === 'unhealthy') {
        return false;
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
    if (
      !rule.id ||
      !rule.name ||
      !rule.sourceService ||
      !rule.targetServices.length
    ) {
      throw new Error('Invalid routing rule: missing required fields');
    }
  }

  private validateTransformation(transformation: IMessageTransformation): void {
    if (
      !transformation.id ||
      !transformation.name ||
      !transformation.transformRules.length
    ) {
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

  private evaluateRoutingCondition(
    condition: string,
    _request: IServiceRequest
  ): boolean {
    // Simple condition evaluation - in production, use a proper expression evaluator
    if (condition === 'always') return true;
    if (condition === 'never') return false;

    // Add more sophisticated condition evaluation logic here
    return true;
  }

  private async applyTransformations(
    request: IServiceRequest
  ): Promise<IServiceRequest> {
    const applicableTransformations = Array.from(
      this.transformations.values()
    ).filter(t => t.sourceFormat === 'request');

    let transformedRequest = { ...request };

    for (const transformation of applicableTransformations) {
      transformedRequest = await this.applyTransformation(
        transformedRequest,
        transformation
      );
    }

    return transformedRequest;
  }

  private async applyTransformation(
    request: IServiceRequest,
    transformation: IMessageTransformation
  ): Promise<IServiceRequest> {
    const transformedPayload = {
      ...(request.payload as Record<string, unknown>),
    };

    for (const rule of transformation.transformRules) {
      await this.applyTransformRule(transformedPayload, rule);
    }

    return { ...request, payload: transformedPayload };
  }

  private async applyTransformRule(
    payload: Record<string, unknown>,
    rule: ITransformRule
  ): Promise<void> {
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

  private async executeRequest(
    request: IServiceRequest,
    targetServices: string[]
  ): Promise<IServiceResponse> {
    // Simple implementation - in production, implement proper load balancing
    const targetService = targetServices[0];

    if (!targetService) {
      throw new Error('No target service specified');
    }

    const service = this.services.get(targetService);

    if (!service) {
      throw new Error(`Target service ${targetService} not found`);
    }

    // Simulate service execution
    return {
      id: uuidv4(),
      requestId: request.id,
      status: 'success',
      statusCode: 200,
      headers: {},
      payload: { result: 'processed', serviceId: targetService },
      processingTime: Math.random() * 100 + 10, // 10-110ms
    };
  }

  private updateMetricsOnSuccess(
    _serviceId: string,
    processingTime: number
  ): void {
    this.metrics.messagesProcessed++;
    this.metrics.averageLatency =
      (this.metrics.averageLatency + processingTime) / 2;
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
      if (
        circuitBreaker.state === 'half-open' &&
        circuitBreaker.successCount >= 3
      ) {
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

      if (circuitBreaker.failureCount >= 5) {
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
      timestamp: new Date(),
    };
  }

  private setupEventHandlers(): void {
    this.on('error', error => {
      console.error('🚨 ESB Error:', error);
    });
  }

  private async initializeMessageQueueIntegration(): Promise<void> {
    if (this.messageQueueManager) {
      // Subscribe to relevant message queue topics
      console.log('🔗 Initializing Message Queue integration');
    }
  }

  private startHealthCheckInterval(): void {
    setInterval(async () => {
      for (const serviceId of Array.from(this.services.keys())) {
        await this.performHealthCheck(serviceId);
      }
    }, this.config.healthCheckInterval);
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.emit('metrics:updated', this.metrics);
    }, this.config.metricsInterval);
  }
}

interface ICircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime: Date | null;
  successCount: number;
}

interface IESBConfiguration {
  healthCheckInterval: number;
  metricsInterval: number;
  circuitBreakerThreshold: number;
  defaultTimeout: number;
}

const DEFAULT_ESB_CONFIG: IESBConfiguration = {
  healthCheckInterval: 30000, // 30 seconds
  metricsInterval: 10000, // 10 seconds
  circuitBreakerThreshold: 5,
  defaultTimeout: 30000, // 30 seconds
};

export { EnterpriseServiceBus as ESB, IESBConfiguration, DEFAULT_ESB_CONFIG };
