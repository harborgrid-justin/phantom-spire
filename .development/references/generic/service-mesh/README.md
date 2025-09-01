# Enterprise Service Mesh for Node.js

A Fortune 100-grade enterprise service mesh implementation providing comprehensive service infrastructure for microservice architectures. This package offers service discovery, advanced load balancing, circuit breaking, traffic management, security policies, and observability - all in a production-ready Node.js library.

## Features

### 🏗️ Core Service Mesh Capabilities
- **Service Discovery & Registry**: Automatic service registration and discovery with health monitoring
- **Advanced Load Balancing**: Multiple strategies (round-robin, least-connections, weighted, random, hash-based)
- **Circuit Breaker Pattern**: Fault tolerance and automatic failure recovery
- **Traffic Management**: Sophisticated routing and traffic policies
- **Security Policies**: Authentication, authorization, and encryption support
- **Observability**: Comprehensive metrics collection and distributed tracing

### 🚀 Enterprise-Grade Features
- **Fortune 100 Ready**: Designed for large-scale enterprise deployments
- **High Availability**: Built-in health checks and automatic failover
- **Scalable Architecture**: Handle thousands of service instances
- **Production Tested**: Battle-tested patterns and implementations
- **Event-Driven**: Full EventEmitter integration for reactive architectures
- **TypeScript Support**: Complete type definitions for better development experience

## Quick Start

### Installation

```bash
npm install @phantom-spire/service-mesh
```

### Basic Usage

```typescript
import { ServiceMesh, createServiceInstance } from '@phantom-spire/service-mesh';

// Create a service mesh
const serviceMesh = new ServiceMesh();

// Start the service mesh
await serviceMesh.start();

// Register a service instance
const serviceInstance = createServiceInstance({
  name: 'api-gateway',
  serviceId: 'api-gateway',
  host: 'localhost',
  port: 3000,
  version: '1.2.0'
});

await serviceMesh.getServiceRegistry().registerInstance(serviceInstance);

// Get a load-balanced instance
const loadBalancer = serviceMesh.getLoadBalancer();
const instance = await loadBalancer.selectInstance('api-gateway', 'round-robin');

console.log('Selected instance:', instance);
```

### Factory Methods

```typescript
import { ServiceMeshFactory } from '@phantom-spire/service-mesh';

// High-performance configuration for production
const prodMesh = ServiceMeshFactory.createHighPerformance();

// Development-friendly configuration
const devMesh = ServiceMeshFactory.createDevelopment();

// Security-focused configuration
const secureMesh = ServiceMeshFactory.createSecure();

// Custom load balancer strategy
const customMesh = ServiceMeshFactory.createWithLoadBalancer('least-connections');
```

## Advanced Usage

### Circuit Breaker

```typescript
const circuitBreaker = serviceMesh.getCircuitBreaker('payment-service');

try {
  const result = await circuitBreaker.execute(async () => {
    // Your service call here
    return await paymentService.processPayment(paymentData);
  });
  
  console.log('Payment processed:', result);
} catch (error) {
  console.error('Circuit breaker prevented call:', error.message);
}
```

### Traffic Policies

```typescript
import { ITrafficPolicy } from '@phantom-spire/service-mesh';

const trafficPolicy: ITrafficPolicy = {
  id: 'rate-limit-policy',
  name: 'Rate Limiting for API Gateway',
  serviceId: 'api-gateway',
  priority: 1,
  enabled: true,
  rules: [
    {
      id: 'rate-limit-rule',
      type: 'rate-limit',
      condition: 'path.startsWith("/api")',
      configuration: {
        requestsPerSecond: 1000,
        burstSize: 2000
      }
    }
  ]
};

await serviceMesh.addTrafficPolicy(trafficPolicy);
```

### Security Policies

```typescript
import { ISecurityPolicy } from '@phantom-spire/service-mesh';

const securityPolicy: ISecurityPolicy = {
  id: 'jwt-auth-policy',
  name: 'JWT Authentication',
  serviceId: 'user-service',
  authentication: {
    enabled: true,
    methods: ['jwt'],
    providers: {
      jwt: {
        secret: 'your-jwt-secret',
        algorithm: 'HS256'
      }
    }
  },
  authorization: {
    enabled: true,
    rules: [
      {
        id: 'admin-access',
        resource: '/admin/*',
        action: 'read,write',
        principal: 'role:admin'
      }
    ]
  },
  encryption: {
    tlsVersion: '1.3',
    cipherSuites: ['TLS_AES_256_GCM_SHA384'],
    certificateValidation: true,
    mutualTLS: true
  },
  rateLimiting: {
    enabled: true,
    requestsPerSecond: 100,
    burstSize: 200,
    keyExtractor: 'user_id'
  }
};

await serviceMesh.addSecurityPolicy(securityPolicy);
```

### Metrics and Observability

```typescript
import { IObservabilityMetrics } from '@phantom-spire/service-mesh';

// Collect custom metrics
const metrics: IObservabilityMetrics = {
  serviceId: 'api-gateway',
  instanceId: 'api-gateway-1',
  timestamp: new Date(),
  requestCount: 1500,
  responseTime: 45,
  errorCount: 12,
  activeConnections: 50,
  throughput: 1200,
  cpuUsage: 65,
  memoryUsage: 78,
  customMetrics: {
    'cache_hit_rate': 0.85,
    'db_connection_pool_size': 20
  }
};

await serviceMesh.collectMetrics(metrics);

// Retrieve metrics with time range
const timeRange = {
  start: new Date(Date.now() - 3600000), // 1 hour ago
  end: new Date()
};

const historicalMetrics = await serviceMesh.getMetrics('api-gateway', timeRange);
```

### Service Discovery and Watching

```typescript
// Discover all services
const services = await serviceMesh.discoverServices();
console.log('Discovered services:', services);

// Watch for service changes
serviceMesh.watchService('payment-service', (instances) => {
  console.log('Payment service instances updated:', instances);
});
```

### Event Handling

```typescript
// Listen to service mesh events
serviceMesh.on('service-mesh:started', () => {
  console.log('Service mesh started successfully');
});

serviceMesh.on('instance:registered', (instance) => {
  console.log('New service instance registered:', instance.name);
});

serviceMesh.on('instance:unregistered', (instance) => {
  console.log('Service instance unregistered:', instance.name);
});

serviceMesh.on('traffic-policy:added', (policy) => {
  console.log('Traffic policy added:', policy.name);
});

serviceMesh.on('metrics:collected', (metrics) => {
  console.log('Metrics collected for:', metrics.serviceId);
});
```

### Custom Load Balancing Strategy

```typescript
import { ILoadBalancingStrategy, IServiceInstance } from '@phantom-spire/service-mesh';

const customStrategy: ILoadBalancingStrategy = {
  name: 'priority-based',
  select: (instances: IServiceInstance[]): IServiceInstance | null => {
    if (instances.length === 0) return null;
    
    // Select instance with highest priority (from metadata)
    return instances.reduce((prev, current) => {
      const prevPriority = prev.metadata.priority as number || 0;
      const currentPriority = current.metadata.priority as number || 0;
      return currentPriority > prevPriority ? current : prev;
    });
  }
};

const loadBalancer = serviceMesh.getLoadBalancer();
loadBalancer.addStrategy('priority-based', customStrategy);

// Use the custom strategy
const instance = await loadBalancer.selectInstance('my-service', 'priority-based');
```

## Configuration

### Default Configuration

```typescript
import { IServiceMeshConfiguration } from '@phantom-spire/service-mesh';

const config: IServiceMeshConfiguration = {
  registry: {
    heartbeatInterval: 30000,    // 30 seconds
    instanceTimeout: 90000,      // 90 seconds  
    cleanupInterval: 60000       // 60 seconds
  },
  loadBalancer: {
    defaultStrategy: 'round-robin',
    healthCheckRequired: true
  },
  circuitBreaker: {
    failureThreshold: 5,
    recoveryTimeout: 60000,      // 60 seconds
    successThreshold: 3
  },
  observability: {
    metricsInterval: 10000,      // 10 seconds
    tracesSampling: 0.1,         // 10% sampling
    retentionPeriod: 3600000     // 1 hour
  },
  security: {
    defaultEncryption: true,
    certificateValidation: true,
    rateLimitingEnabled: true
  }
};
```

### Custom Configuration

```typescript
const customConfig: Partial<IServiceMeshConfiguration> = {
  registry: {
    heartbeatInterval: 15000,  // More frequent health checks
    instanceTimeout: 45000
  },
  loadBalancer: {
    defaultStrategy: 'least-connections',
    healthCheckRequired: true
  }
};

const serviceMesh = new ServiceMesh(customConfig);
```

## Production Deployment

### High Availability Setup

```typescript
import { ServiceMeshFactory } from '@phantom-spire/service-mesh';

// Create production-optimized service mesh
const serviceMesh = ServiceMeshFactory.createHighPerformance();

// Enable comprehensive logging
serviceMesh.on('instance:registered', (instance) => {
  console.log(`[PROD] Service registered: ${instance.name}@${instance.host}:${instance.port}`);
});

serviceMesh.on('circuit-breaker:opened', (serviceId) => {
  console.error(`[PROD] Circuit breaker OPENED for service: ${serviceId}`);
  // Send alert to monitoring system
});

// Start with graceful error handling
try {
  await serviceMesh.start();
  console.log('[PROD] Service Mesh started successfully');
} catch (error) {
  console.error('[PROD] Failed to start Service Mesh:', error);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[PROD] Shutting down Service Mesh...');
  await serviceMesh.stop();
  process.exit(0);
});
```

### Performance Monitoring

```typescript
// Set up performance monitoring
setInterval(async () => {
  const isHealthy = await serviceMesh.isHealthy();
  const instances = await serviceMesh.discoverServices();
  
  console.log(`Health Status: ${isHealthy ? '✅' : '❌'}`);
  console.log(`Total Instances: ${instances.length}`);
  console.log(`Healthy Instances: ${instances.filter(i => i.health.status === 'healthy').length}`);
}, 30000);
```

## API Reference

### Core Classes

- **ServiceMesh**: Main service mesh orchestrator
- **ServiceRegistry**: Service discovery and registration
- **LoadBalancer**: Request distribution and routing
- **CircuitBreaker**: Fault tolerance and failure recovery
- **ServiceMeshFactory**: Convenient factory methods

### Interfaces

- **IServiceMesh**: Main service mesh interface
- **IServiceInstance**: Service instance definition  
- **IServiceRegistry**: Service registry interface
- **ILoadBalancer**: Load balancer interface
- **ICircuitBreaker**: Circuit breaker interface
- **ITrafficPolicy**: Traffic management policy
- **ISecurityPolicy**: Security policy definition
- **IObservabilityMetrics**: Metrics data structure

## Best Practices

1. **Always start the service mesh** before registering services
2. **Use health checks** in production environments
3. **Configure appropriate timeouts** based on your service SLAs
4. **Implement custom load balancing strategies** for specific requirements
5. **Monitor circuit breaker states** and set up alerts
6. **Use security policies** for sensitive services
7. **Collect and analyze metrics** for performance optimization

## Requirements

- Node.js >= 18.0.0
- TypeScript support (recommended)

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please refer to the documentation or create an issue in the repository.