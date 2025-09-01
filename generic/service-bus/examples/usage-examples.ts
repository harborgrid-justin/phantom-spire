/**
 * Generic Service Bus Usage Examples
 * Demonstrates how to use the service bus in various scenarios
 */

import { ServiceBus, IServiceDefinition, IMessageQueue, ILogger } from '../index';

// Example 1: Basic Service Registration and Usage
async function basicExample() {
  console.log('\n=== Basic Service Bus Example ===');
  
  const serviceBus = new ServiceBus();
  
  // Define a user service
  const userService: IServiceDefinition = {
    id: 'user-service',
    name: 'User Management Service',
    version: '1.0.0',
    type: 'sync',
    endpoints: [{
      name: 'getUser',
      protocol: 'http',
      method: 'GET',
      path: '/users/:id',
      timeout: 5000,
      retries: 3,
      circuitBreaker: true,
      authentication: {
        required: true,
        type: 'jwt',
        roles: ['user'],
        permissions: ['read:user']
      },
      rateLimiting: {
        enabled: true,
        requests: 100,
        windowMs: 60000,
        skipSuccessfulRequests: false
      }
    }],
    capabilities: ['user-management'],
    dependencies: ['auth-service'],
    metadata: {
      author: 'dev-team',
      description: 'Manages user accounts'
    }
  };
  
  try {
    await serviceBus.start();
    console.log('Service bus started');
    
    await serviceBus.registerService(userService);
    console.log('User service registered');
    
    // Process a request
    const response = await serviceBus.processRequest({
      id: 'req-001',
      serviceId: 'user-service',
      endpoint: 'getUser',
      method: 'GET',
      headers: { 'Authorization': 'Bearer token123' },
      payload: { userId: '123' },
      context: {
        correlationId: 'corr-001',
        traceId: 'trace-001',
        spanId: 'span-001',
        timestamp: new Date(),
        source: 'web-app',
        priority: 'normal'
      },
      timeout: 5000,
      retries: 3
    });
    
    console.log('Response:', response);
    
    await serviceBus.stop();
    console.log('Service bus stopped');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 2: Custom Logger Integration
class CustomLogger implements ILogger {
  private logLevel: string;
  
  constructor(logLevel = 'info') {
    this.logLevel = logLevel;
  }
  
  error(message: string, meta?: any): void {
    console.error(`🔴 [ERROR] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }
  
  warn(message: string, meta?: any): void {
    if (['debug', 'info', 'warn'].includes(this.logLevel)) {
      console.warn(`🟡 [WARN] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  }
  
  info(message: string, meta?: any): void {
    if (['debug', 'info'].includes(this.logLevel)) {
      console.info(`🟢 [INFO] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  }
  
  debug(message: string, meta?: any): void {
    if (this.logLevel === 'debug') {
      console.debug(`🔵 [DEBUG] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  }
}

async function customLoggerExample() {
  console.log('\n=== Custom Logger Example ===');
  
  const logger = new CustomLogger('info');
  const serviceBus = new ServiceBus(undefined, {}, logger);
  
  const service: IServiceDefinition = {
    id: 'notification-service',
    name: 'Notification Service',
    version: '1.0.0',
    type: 'async',
    endpoints: [],
    capabilities: ['notifications'],
    dependencies: [],
    metadata: {}
  };
  
  try {
    await serviceBus.start();
    await serviceBus.registerService(service);
    
    // The custom logger will format the log messages
    console.log('Check the formatted log messages above');
    
    await serviceBus.stop();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 3: Message Queue Integration
class MockMessageQueue implements IMessageQueue {
  private subscriptions: Map<string, (message: any) => Promise<void>> = new Map();
  private started = false;
  
  async subscribe(topic: string, handler: (message: any) => Promise<void>): Promise<void> {
    console.log(`📥 Subscribing to topic: ${topic}`);
    this.subscriptions.set(topic, handler);
  }
  
  async publish(topic: string, message: any): Promise<void> {
    console.log(`📤 Publishing to topic: ${topic}`, message);
    
    // Simulate message delivery
    const handler = this.subscriptions.get(topic);
    if (handler) {
      setTimeout(() => handler(message), 100);
    }
  }
  
  async start(): Promise<void> {
    console.log('📡 Message queue started');
    this.started = true;
  }
  
  async stop(): Promise<void> {
    console.log('📡 Message queue stopped');
    this.started = false;
  }
  
  // Helper method to simulate incoming messages
  async simulateMessage(topic: string, message: any): Promise<void> {
    const handler = this.subscriptions.get(topic);
    if (handler && this.started) {
      await handler(message);
    }
  }
}

async function messageQueueExample() {
  console.log('\n=== Message Queue Integration Example ===');
  
  const messageQueue = new MockMessageQueue();
  const serviceBus = new ServiceBus(messageQueue);
  
  const emailService: IServiceDefinition = {
    id: 'email-service',
    name: 'Email Service',
    version: '1.0.0',
    type: 'async',
    endpoints: [],
    capabilities: ['email'],
    dependencies: [],
    metadata: {}
  };
  
  try {
    await serviceBus.start();
    await serviceBus.registerService(emailService);
    
    // Subscribe to service bus events
    serviceBus.on('async:failed', ({ serviceId, error }) => {
      console.log(`❌ Async processing failed for ${serviceId}:`, error.message);
    });
    
    // Process async message
    await serviceBus.processAsyncMessage('email-service', {
      to: 'user@example.com',
      subject: 'Welcome',
      body: 'Welcome to our service!'
    }, {
      correlationId: 'email-001',
      traceId: 'trace-002',
      spanId: 'span-002',
      timestamp: new Date(),
      source: 'registration-service',
      priority: 'normal'
    });
    
    console.log('Async message sent');
    
    await new Promise(resolve => setTimeout(resolve, 200)); // Wait for async processing
    
    await serviceBus.stop();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 4: Routing Rules and Transformations
async function routingAndTransformationsExample() {
  console.log('\n=== Routing Rules and Transformations Example ===');
  
  const serviceBus = new ServiceBus();
  
  // Register multiple services
  const services: IServiceDefinition[] = [{
    id: 'api-gateway',
    name: 'API Gateway',
    version: '1.0.0',
    type: 'sync',
    endpoints: [],
    capabilities: ['routing'],
    dependencies: [],
    metadata: {}
  }, {
    id: 'processor-1',
    name: 'Light Processor',
    version: '1.0.0',
    type: 'sync',
    endpoints: [],
    capabilities: ['processing'],
    dependencies: [],
    metadata: {}
  }, {
    id: 'processor-2',
    name: 'Heavy Processor',
    version: '1.0.0',
    type: 'sync',
    endpoints: [],
    capabilities: ['heavy-processing'],
    dependencies: [],
    metadata: {}
  }];
  
  try {
    await serviceBus.start();
    
    for (const service of services) {
      await serviceBus.registerService(service);
    }
    
    // Add routing rule
    await serviceBus.addRoutingRule({
      id: 'heavy-processing-route',
      name: 'Route Heavy Requests',
      condition: 'always', // In real implementation, this would be a complex condition
      sourceService: 'api-gateway',
      targetServices: ['processor-2'],
      loadBalancing: 'round-robin',
      failover: true,
      priority: 10
    });
    
    // Add message transformation
    await serviceBus.addTransformation({
      id: 'legacy-transform',
      name: 'Legacy Format Transform',
      sourceFormat: 'legacy',
      targetFormat: 'modern',
      transformRules: [{
        sourceField: 'user_name',
        targetField: 'username',
        operation: 'copy'
      }, {
        sourceField: 'email_addr',
        targetField: 'email',
        operation: 'copy'
      }]
    });
    
    console.log('Routing rules and transformations configured');
    
    await serviceBus.stop();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 5: Monitoring and Metrics
async function monitoringExample() {
  console.log('\n=== Monitoring and Metrics Example ===');
  
  const serviceBus = new ServiceBus(undefined, {
    enableMetrics: true,
    enableHealthChecks: true,
    metricsInterval: 2000
  });
  
  const service: IServiceDefinition = {
    id: 'monitoring-test',
    name: 'Monitoring Test Service',
    version: '1.0.0',
    type: 'sync',
    endpoints: [],
    capabilities: [],
    dependencies: [],
    metadata: {}
  };
  
  // Set up event listeners
  serviceBus.on('metrics:updated', (metrics) => {
    console.log('📊 Metrics updated:', {
      messagesProcessed: metrics.messagesProcessed,
      averageLatency: metrics.averageLatency.toFixed(2),
      throughput: metrics.throughput.toFixed(2)
    });
  });
  
  serviceBus.on('request:processed', ({ processingTime }) => {
    console.log(`⚡ Request processed in ${processingTime.toFixed(2)}ms`);
  });
  
  try {
    await serviceBus.start();
    await serviceBus.registerService(service);
    
    // Simulate some requests
    for (let i = 0; i < 5; i++) {
      await serviceBus.processRequest({
        id: `req-${i}`,
        serviceId: 'monitoring-test',
        endpoint: 'test',
        method: 'GET',
        headers: {},
        payload: { test: true },
        context: {
          correlationId: `corr-${i}`,
          traceId: `trace-${i}`,
          spanId: `span-${i}`,
          timestamp: new Date(),
          source: 'test-client',
          priority: 'normal'
        },
        timeout: 5000,
        retries: 3
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Get metrics
    const metrics = await serviceBus.getMetrics();
    console.log('📈 Final metrics:', metrics);
    
    // Get service health
    const health = await serviceBus.getServiceHealth('monitoring-test');
    console.log('💚 Service health:', health);
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for metrics updates
    
    await serviceBus.stop();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run all examples
async function runAllExamples() {
  console.log('🚀 Running Generic Service Bus Examples\n');
  
  try {
    await basicExample();
    await customLoggerExample();
    await messageQueueExample();
    await routingAndTransformationsExample();
    await monitoringExample();
    
    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
  }
}

// Export for use in other files
export {
  basicExample,
  customLoggerExample,
  messageQueueExample,
  routingAndTransformationsExample,
  monitoringExample,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}