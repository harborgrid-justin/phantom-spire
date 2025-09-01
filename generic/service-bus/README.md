# Generic Service Bus

A reusable, plug-and-play service bus for Node.js applications that provides comprehensive service integration, routing, and orchestration capabilities.

## Features

- **Service Registry**: Centralized catalog of all services
- **Message Routing**: Intelligent message routing with configurable rules
- **Protocol Bridging**: Support for HTTP, WebSocket, Message Queue, and gRPC protocols
- **Message Transformation**: Configurable data transformation between service formats
- **Circuit Breaker**: Automatic circuit breaker pattern for failed services
- **Health Monitoring**: Continuous health checks and monitoring
- **Metrics Collection**: Built-in metrics and performance monitoring
- **Async Processing**: Non-blocking message processing with event-driven architecture
- **Load Balancing**: Multiple load balancing strategies
- **Plugin Architecture**: Extensible with custom plugins
- **TypeScript Support**: Full TypeScript definitions and type safety

## Installation

```bash
npm install @generic/service-bus
```

## Quick Start

### Basic Usage

```typescript
import { ServiceBus, IServiceDefinition } from '@generic/service-bus';

// Create service bus instance
const serviceBus = new ServiceBus();

// Define a service
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
  capabilities: ['user-management', 'authentication'],
  dependencies: ['auth-service', 'database'],
  metadata: {
    author: 'development-team',
    description: 'Manages user accounts and profiles'
  }
};

async function main() {
  // Start the service bus
  await serviceBus.start();
  
  // Register a service
  await serviceBus.registerService(userService);
  
  // Process a request
  const request = {
    id: 'req-123',
    serviceId: 'user-service',
    endpoint: 'getUser',
    method: 'GET',
    headers: { 'Authorization': 'Bearer token123' },
    payload: { userId: '456' },
    context: {
      correlationId: 'corr-789',
      traceId: 'trace-abc',
      spanId: 'span-def',
      timestamp: new Date(),
      source: 'web-app',
      priority: 'normal' as const
    },
    timeout: 5000,
    retries: 3
  };
  
  const response = await serviceBus.processRequest(request);
  console.log('Response:', response);
}

main().catch(console.error);
```

### With Message Queue Integration

```typescript
import { ServiceBus, IMessageQueue } from '@generic/service-bus';

// Custom message queue implementation
class CustomMessageQueue implements IMessageQueue {
  async subscribe(topic: string, handler: (message: any) => Promise<void>): Promise<void> {
    // Implement subscription logic
  }
  
  async publish(topic: string, message: any): Promise<void> {
    // Implement publish logic
  }
  
  async start(): Promise<void> {
    // Initialize message queue
  }
  
  async stop(): Promise<void> {
    // Cleanup message queue
  }
}

const messageQueue = new CustomMessageQueue();
const serviceBus = new ServiceBus(messageQueue);

await serviceBus.start();
```

### Custom Logger Integration

```typescript
import { ServiceBus, ILogger } from '@generic/service-bus';

class CustomLogger implements ILogger {
  error(message: string, meta?: any): void {
    // Custom error logging
    console.error(`[ERROR] ${message}`, meta);
  }
  
  warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${message}`, meta);
  }
  
  info(message: string, meta?: any): void {
    console.info(`[INFO] ${message}`, meta);
  }
  
  debug(message: string, meta?: any): void {
    console.debug(`[DEBUG] ${message}`, meta);
  }
}

const logger = new CustomLogger();
const serviceBus = new ServiceBus(undefined, {}, logger);
```

## Configuration

```typescript
const config = {
  healthCheckInterval: 30000,     // Health check interval in ms
  metricsInterval: 10000,         // Metrics collection interval in ms
  circuitBreakerThreshold: 5,     // Failures before circuit breaker opens
  defaultTimeout: 30000,          // Default request timeout in ms
  enableMetrics: true,            // Enable metrics collection
  enableHealthChecks: true        // Enable health checks
};

const serviceBus = new ServiceBus(messageQueue, config, logger);
```

## Routing Rules

```typescript
// Add routing rule
await serviceBus.addRoutingRule({
  id: 'route-heavy-requests',
  name: 'Route Heavy Requests',
  condition: 'payload.size > 1000',
  sourceService: 'api-gateway',
  targetServices: ['heavy-processor-1', 'heavy-processor-2'],
  loadBalancing: 'round-robin',
  failover: true,
  priority: 10
});
```

## Message Transformations

```typescript
// Add message transformation
await serviceBus.addTransformation({
  id: 'user-format-transform',
  name: 'User Format Transformation',
  sourceFormat: 'legacy-user',
  targetFormat: 'modern-user',
  transformRules: [{
    sourceField: 'user_name',
    targetField: 'username',
    operation: 'copy'
  }, {
    sourceField: 'full_name',
    targetField: 'displayName',
    operation: 'copy'
  }]
});
```

## Monitoring and Metrics

```typescript
// Get service bus metrics
const metrics = await serviceBus.getMetrics();
console.log('Metrics:', {
  messagesProcessed: metrics.messagesProcessed,
  averageLatency: metrics.averageLatency,
  errorRate: metrics.errorRate,
  throughput: metrics.throughput
});

// Get service health
const health = await serviceBus.getServiceHealth('user-service');
console.log('Service Health:', {
  status: health.status,
  responseTime: health.responseTime,
  uptime: health.uptime,
  issues: health.issues
});

// Listen for events
serviceBus.on('service:registered', (service) => {
  console.log('Service registered:', service.name);
});

serviceBus.on('request:processed', ({ request, response, processingTime }) => {
  console.log(`Request processed in ${processingTime}ms`);
});

serviceBus.on('request:failed', ({ request, error }) => {
  console.error('Request failed:', error.message);
});
```

## Plugin System

```typescript
import { IServiceBusPlugin, IServiceBus } from '@generic/service-bus';

class MetricsPlugin implements IServiceBusPlugin {
  name = 'metrics-plugin';
  version = '1.0.0';
  
  async initialize(serviceBus: IServiceBus, config?: any): Promise<void> {
    serviceBus.on('request:processed', (data) => {
      // Custom metrics processing
      console.log('Custom metrics:', data);
    });
  }
  
  async shutdown(): Promise<void> {
    // Cleanup plugin
  }
}

// Use plugin
const plugin = new MetricsPlugin();
await plugin.initialize(serviceBus);
```

## Events

The service bus emits the following events:

- `service:registered`: When a service is registered
- `service:unregistered`: When a service is unregistered
- `request:processed`: When a request is successfully processed
- `request:failed`: When a request fails
- `async:failed`: When async message processing fails
- `routing:rule:added`: When a routing rule is added
- `routing:rule:removed`: When a routing rule is removed
- `transformation:added`: When a transformation is added
- `transformation:removed`: When a transformation is removed
- `metrics:updated`: Periodic metrics updates
- `bus:started`: When the service bus starts
- `bus:stopped`: When the service bus stops

## API Reference

### ServiceBus Class

```typescript
class ServiceBus extends EventEmitter implements IServiceBus {
  constructor(
    messageQueue?: IMessageQueue,
    config?: Partial<IServiceBusConfig>,
    logger?: ILogger
  );
  
  // Service Management
  async registerService(definition: IServiceDefinition): Promise<void>;
  async unregisterService(serviceId: string): Promise<void>;
  async getService(serviceId: string): Promise<IServiceDefinition | null>;
  async listServices(): Promise<IServiceDefinition[]>;
  
  // Message Processing
  async processRequest(request: IServiceRequest): Promise<IServiceResponse>;
  async processAsyncMessage(serviceId: string, message: unknown, context: IRequestContext): Promise<void>;
  
  // Routing and Transformation
  async addRoutingRule(rule: IRoutingRule): Promise<void>;
  async removeRoutingRule(ruleId: string): Promise<void>;
  async addTransformation(transformation: IMessageTransformation): Promise<void>;
  async removeTransformation(transformationId: string): Promise<void>;
  
  // Monitoring and Metrics
  async getMetrics(): Promise<IServiceBusMetrics>;
  async getServiceHealth(serviceId: string): Promise<IServiceHealth>;
  
  // Lifecycle Management
  async start(): Promise<void>;
  async stop(): Promise<void>;
  async isHealthy(): Promise<boolean>;
}
```

## Architecture

The Generic Service Bus follows a modular architecture:

### Core Components

1. **ServiceBus**: Main orchestrator that manages services and message processing
2. **Service Registry**: Maintains catalog of registered services
3. **Message Router**: Routes messages based on configurable rules
4. **Circuit Breaker**: Prevents cascading failures
5. **Health Monitor**: Continuously monitors service health
6. **Metrics Collector**: Gathers performance metrics

### Integration Points

- **Message Queues**: Async message processing
- **Custom Loggers**: Pluggable logging
- **Monitoring Systems**: Metrics and health data export
- **Service Discovery**: Dynamic service registration
- **Load Balancers**: Multiple load balancing strategies

## Best Practices

1. **Service Definition**: Always provide comprehensive service definitions with proper metadata
2. **Error Handling**: Implement proper error handling in service endpoints
3. **Health Checks**: Implement meaningful health checks for your services
4. **Circuit Breakers**: Use circuit breakers for external service calls
5. **Monitoring**: Monitor metrics and set up alerting for critical issues
6. **Routing**: Use routing rules to implement advanced traffic management
7. **Transformations**: Use transformations to decouple service formats
8. **Timeouts**: Set appropriate timeouts for different service types

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues, questions, or contributions, please use the GitHub repository issue tracker.