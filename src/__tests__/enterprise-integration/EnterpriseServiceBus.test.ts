/**
 * Enterprise Service Bus Tests
 * Fortune 100-Grade Service Integration Layer Tests
 */

import { v4 as uuidv4 } from 'uuid';
import { EnterpriseServiceBus } from '../../enterprise-service-bus/core/EnterpriseServiceBus.js';
import { 
  IServiceDefinition, 
  IServiceRequest, 
  IRequestContext,
  IRoutingRule,
  IMessageTransformation
} from '../../enterprise-service-bus/interfaces/IEnterpriseServiceBus.js';

describe('EnterpriseServiceBus', () => {
  let esb: EnterpriseServiceBus;
  let mockService: IServiceDefinition;

  beforeEach(() => {
    esb = new EnterpriseServiceBus();
    
    mockService = {
      id: 'test-service',
      name: 'Test Service',
      version: '1.0.0',
      type: 'sync',
      endpoints: [
        {
          name: 'test-endpoint',
          protocol: 'http',
          method: 'POST',
          path: '/api/test',
          timeout: 30000,
          retries: 3,
          circuitBreaker: true,
          authentication: {
            required: true,
            type: 'jwt',
            roles: ['user'],
            permissions: ['test:read']
          },
          rateLimiting: {
            enabled: true,
            requests: 100,
            windowMs: 60000,
            skipSuccessfulRequests: false
          }
        }
      ],
      capabilities: ['processing'],
      dependencies: [],
      metadata: { category: 'test' }
    };
  });

  afterEach(async () => {
    if (esb) {
      await esb.stop();
    }
  });

  describe('Service Management', () => {
    test('should register a service successfully', async () => {
      await expect(esb.registerService(mockService)).resolves.toBeUndefined();
      
      const retrievedService = await esb.getService('test-service');
      expect(retrievedService).toEqual(mockService);
    });

    test('should throw error when registering duplicate service', async () => {
      await esb.registerService(mockService);
      
      await expect(esb.registerService(mockService)).rejects.toThrow('Service test-service already registered');
    });

    test('should unregister a service successfully', async () => {
      await esb.registerService(mockService);
      await expect(esb.unregisterService('test-service')).resolves.toBeUndefined();
      
      const retrievedService = await esb.getService('test-service');
      expect(retrievedService).toBeNull();
    });

    test('should throw error when unregistering non-existent service', async () => {
      await expect(esb.unregisterService('non-existent')).rejects.toThrow('Service non-existent not found');
    });

    test('should list all registered services', async () => {
      await esb.registerService(mockService);
      
      const services = await esb.listServices();
      expect(services).toHaveLength(1);
      expect(services[0]).toEqual(mockService);
    });

    test('should validate service definition', async () => {
      const invalidService = { ...mockService, id: '' };
      
      await expect(esb.registerService(invalidService as IServiceDefinition))
        .rejects.toThrow('Service definition must have id, name, and version');
    });
  });

  describe('Message Processing', () => {
    beforeEach(async () => {
      await esb.start();
      await esb.registerService(mockService);
    });

    test('should process a valid request', async () => {
      const request: IServiceRequest = {
        id: uuidv4(),
        serviceId: 'test-service',
        endpoint: 'test-endpoint',
        method: 'POST',
        headers: {},
        payload: { data: 'test' },
        context: createMockContext(),
        timeout: 30000,
        retries: 3
      };

      const response = await esb.processRequest(request);
      
      expect(response.requestId).toBe(request.id);
      expect(response.status).toBe('success');
      expect(response.statusCode).toBe(200);
    });

    test('should reject request for non-existent service', async () => {
      const request: IServiceRequest = {
        id: uuidv4(),
        serviceId: 'non-existent',
        endpoint: 'test-endpoint',
        method: 'POST',
        headers: {},
        payload: { data: 'test' },
        context: createMockContext(),
        timeout: 30000,
        retries: 3
      };

      const response = await esb.processRequest(request);
      
      expect(response.status).toBe('error');
      expect(response.error).toBeDefined();
    });

    test('should validate request format', async () => {
      const invalidRequest = {
        // Missing required fields
        serviceId: 'test-service'
      };

      const response = await esb.processRequest(invalidRequest as IServiceRequest);
      expect(response.status).toBe('error');
    });

    test('should process async message', async () => {
      const mockMessage = { type: 'test', data: 'async-test' };
      const context = createMockContext();

      await expect(esb.processAsyncMessage('test-service', mockMessage, context))
        .resolves.toBeUndefined();
    });
  });

  describe('Routing Rules', () => {
    beforeEach(async () => {
      await esb.start();
      await esb.registerService(mockService);
    });

    test('should add routing rule successfully', async () => {
      const rule: IRoutingRule = {
        id: 'test-rule',
        name: 'Test Routing Rule',
        condition: 'always',
        sourceService: 'test-service',
        targetServices: ['test-service'],
        loadBalancing: 'round-robin',
        failover: true,
        priority: 100
      };

      await expect(esb.addRoutingRule(rule)).resolves.toBeUndefined();
    });

    test('should remove routing rule successfully', async () => {
      const rule: IRoutingRule = {
        id: 'test-rule',
        name: 'Test Routing Rule',
        condition: 'always',
        sourceService: 'test-service',
        targetServices: ['test-service'],
        loadBalancing: 'round-robin',
        failover: true,
        priority: 100
      };

      await esb.addRoutingRule(rule);
      await expect(esb.removeRoutingRule('test-rule')).resolves.toBeUndefined();
    });

    test('should throw error when removing non-existent rule', async () => {
      await expect(esb.removeRoutingRule('non-existent'))
        .rejects.toThrow('Routing rule non-existent not found');
    });
  });

  describe('Message Transformations', () => {
    beforeEach(async () => {
      await esb.start();
      await esb.registerService(mockService);
    });

    test('should add transformation successfully', async () => {
      const transformation: IMessageTransformation = {
        id: 'test-transform',
        name: 'Test Transformation',
        sourceFormat: 'json',
        targetFormat: 'xml',
        transformRules: [
          {
            sourceField: 'data',
            targetField: 'payload',
            operation: 'copy'
          }
        ]
      };

      await expect(esb.addTransformation(transformation)).resolves.toBeUndefined();
    });

    test('should remove transformation successfully', async () => {
      const transformation: IMessageTransformation = {
        id: 'test-transform',
        name: 'Test Transformation',
        sourceFormat: 'json',
        targetFormat: 'xml',
        transformRules: [
          {
            sourceField: 'data',
            targetField: 'payload',
            operation: 'copy'
          }
        ]
      };

      await esb.addTransformation(transformation);
      await expect(esb.removeTransformation('test-transform')).resolves.toBeUndefined();
    });
  });

  describe('Monitoring and Metrics', () => {
    beforeEach(async () => {
      await esb.start();
      await esb.registerService(mockService);
    });

    test('should return metrics', async () => {
      const metrics = await esb.getMetrics();
      
      expect(metrics).toHaveProperty('messagesProcessed');
      expect(metrics).toHaveProperty('averageLatency');
      expect(metrics).toHaveProperty('errorRate');
      expect(metrics).toHaveProperty('throughput');
      expect(metrics).toHaveProperty('timestamp');
    });

    test('should return service health', async () => {
      const health = await esb.getServiceHealth('test-service');
      
      expect(health).toHaveProperty('serviceId', 'test-service');
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('uptime');
      expect(health).toHaveProperty('lastCheck');
    });

    test('should throw error for non-existent service health', async () => {
      await expect(esb.getServiceHealth('non-existent'))
        .rejects.toThrow('Service non-existent not found');
    });
  });

  describe('Lifecycle Management', () => {
    test('should start successfully', async () => {
      await expect(esb.start()).resolves.toBeUndefined();
      expect(await esb.isHealthy()).toBe(true);
    });

    test('should stop successfully', async () => {
      await esb.start();
      await expect(esb.stop()).resolves.toBeUndefined();
      expect(await esb.isHealthy()).toBe(false);
    });

    test('should be unhealthy when not started', async () => {
      expect(await esb.isHealthy()).toBe(false);
    });
  });

  describe('Circuit Breaker Integration', () => {
    beforeEach(async () => {
      await esb.start();
      await esb.registerService(mockService);
    });

    test('should handle circuit breaker states', async () => {
      // This test would require more complex setup to simulate actual failures
      // For now, we'll just verify the integration points exist
      const request: IServiceRequest = {
        id: uuidv4(),
        serviceId: 'test-service',
        endpoint: 'test-endpoint',
        method: 'POST',
        headers: {},
        payload: { data: 'test' },
        context: createMockContext(),
        timeout: 30000,
        retries: 3
      };

      const response = await esb.processRequest(request);
      expect(response).toHaveProperty('status');
    });
  });
});

/**
 * Helper function to create mock request context
 */
function createMockContext(): IRequestContext {
  return {
    userId: 'test-user',
    organizationId: 'test-org',
    correlationId: uuidv4(),
    traceId: uuidv4(),
    spanId: uuidv4(),
    timestamp: new Date(),
    source: 'test',
    priority: 'normal'
  };
}