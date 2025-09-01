# Generic Service Mesh Integration Guide

This guide shows how to integrate and use the generic service-mesh in your Node.js projects.

## Installation Options

### Option 1: Copy the Generic Module

Copy the entire `generic/service-mesh` directory into your project:

```bash
cp -r generic/service-mesh ./node_modules/@phantom-spire/service-mesh
# or
cp -r generic/service-mesh ./lib/service-mesh
```

### Option 2: Build and Link Locally

1. Build the generic service mesh:
```bash
cd generic/service-mesh
npm install
npm run build
```

2. Link it locally in your project:
```bash
# In your project root
npm link ./generic/service-mesh
```

### Option 3: Private NPM Registry (Recommended)

Publish to your private npm registry and install normally:

```bash
npm publish generic/service-mesh
npm install @phantom-spire/service-mesh
```

## Usage Examples

### Basic CommonJS Usage

```javascript
const { ServiceMesh, createServiceInstance } = require('@phantom-spire/service-mesh');

async function main() {
  const mesh = new ServiceMesh();
  await mesh.start();
  
  const service = createServiceInstance({
    name: 'my-api',
    serviceId: 'my-api',
    host: 'localhost',
    port: 3000
  });
  
  await mesh.getServiceRegistry().registerInstance(service);
  console.log('Service registered!');
}

main().catch(console.error);
```

### ES6 Modules Usage

```javascript
import { ServiceMesh, ServiceMeshFactory, createServiceInstance } from '@phantom-spire/service-mesh';

const mesh = ServiceMeshFactory.createHighPerformance();
await mesh.start();

const service = createServiceInstance({
  name: 'user-service',
  serviceId: 'user-service', 
  host: 'localhost',
  port: 4000,
  metadata: { version: '2.0.0', region: 'us-east-1' }
});

await mesh.getServiceRegistry().registerInstance(service);
```

### TypeScript Usage

```typescript
import {
  ServiceMesh,
  ServiceMeshFactory,
  createServiceInstance,
  IServiceInstance,
  ITrafficPolicy,
  LoadBalancingStrategy
} from '@phantom-spire/service-mesh';

const mesh: ServiceMesh = ServiceMeshFactory.createSecure();
await mesh.start();

const service: IServiceInstance = createServiceInstance({
  name: 'payment-service',
  serviceId: 'payment-service',
  host: '10.0.1.5',
  port: 5000
});

await mesh.getServiceRegistry().registerInstance(service);

// Use load balancer
const strategy: LoadBalancingStrategy = 'least-connections';
const instance = await mesh.getLoadBalancer().selectInstance('payment-service', strategy);

// Add traffic policy
const policy: ITrafficPolicy = {
  id: 'rate-limit',
  name: 'Payment Rate Limiting',
  serviceId: 'payment-service',
  priority: 1,
  enabled: true,
  rules: [
    {
      id: 'limit-rule',
      type: 'rate-limit',
      condition: 'true',
      configuration: { requestsPerSecond: 100 }
    }
  ]
};

await mesh.addTrafficPolicy(policy);
```

## Integration Patterns

### Express.js Integration

```javascript
const express = require('express');
const { ServiceMeshFactory, createServiceInstance } = require('@phantom-spire/service-mesh');

const app = express();
const mesh = ServiceMeshFactory.createHighPerformance();

// Middleware to select service instance
app.use('/api/users/*', async (req, res, next) => {
  const instance = await mesh.getLoadBalancer().selectInstance('user-service', 'round-robin');
  if (!instance) {
    return res.status(503).json({ error: 'User service unavailable' });
  }
  req.serviceInstance = instance;
  next();
});

// Start server and register with mesh
app.listen(3000, async () => {
  await mesh.start();
  
  const service = createServiceInstance({
    name: 'api-gateway',
    serviceId: 'api-gateway',
    host: 'localhost',
    port: 3000
  });
  
  await mesh.getServiceRegistry().registerInstance(service);
  console.log('API Gateway registered with service mesh');
});
```

### Microservice Registration

```javascript
const { ServiceMeshFactory, createServiceInstance } = require('@phantom-spire/service-mesh');

class MicroserviceManager {
  constructor() {
    this.mesh = ServiceMeshFactory.createHighPerformance();
    this.services = new Map();
  }

  async start() {
    await this.mesh.start();
    
    // Listen for health checks
    this.mesh.on('instance:registered', (instance) => {
      console.log(`Service registered: ${instance.name}`);
    });
  }

  async registerService(name, port, metadata = {}) {
    const service = createServiceInstance({
      name,
      serviceId: name,
      host: process.env.HOST || 'localhost',
      port,
      metadata: {
        ...metadata,
        pid: process.pid,
        startTime: new Date().toISOString()
      }
    });

    await this.mesh.getServiceRegistry().registerInstance(service);
    this.services.set(name, service);
    return service;
  }

  async discoverService(serviceName, strategy = 'round-robin') {
    return await this.mesh.getLoadBalancer().selectInstance(serviceName, strategy);
  }

  async getCircuitBreaker(serviceName) {
    return this.mesh.getCircuitBreaker(serviceName);
  }
}

module.exports = MicroserviceManager;
```

### Docker Integration

```dockerfile
# Dockerfile for service using the mesh
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy the generic service mesh if not using npm registry
COPY generic/service-mesh ./node_modules/@phantom-spire/service-mesh

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```javascript
// Service startup with Docker
const { ServiceMeshFactory, createServiceInstance } = require('@phantom-spire/service-mesh');

const mesh = ServiceMeshFactory.createHighPerformance();

async function startService() {
  await mesh.start();
  
  const service = createServiceInstance({
    name: process.env.SERVICE_NAME || 'my-service',
    serviceId: process.env.SERVICE_ID || 'my-service',
    host: process.env.HOSTNAME || 'localhost',
    port: parseInt(process.env.PORT) || 3000,
    metadata: {
      container: process.env.HOSTNAME,
      image: process.env.IMAGE_NAME,
      version: process.env.SERVICE_VERSION
    }
  });

  await mesh.getServiceRegistry().registerInstance(service);
}

startService().catch(console.error);
```

### Kubernetes Integration

```yaml
# kubernetes-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
  labels:
    app: my-service
spec:
  selector:
    app: my-service
  ports:
  - port: 3000
    targetPort: 3000

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-service
  template:
    metadata:
      labels:
        app: my-service
    spec:
      containers:
      - name: my-service
        image: my-service:latest
        env:
        - name: SERVICE_NAME
          value: "my-service"
        - name: HOSTNAME
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        ports:
        - containerPort: 3000
```

```javascript
// Kubernetes-aware service registration
const os = require('os');
const { ServiceMeshFactory, createServiceInstance } = require('@phantom-spire/service-mesh');

const mesh = ServiceMeshFactory.createHighPerformance();

async function registerWithK8s() {
  await mesh.start();
  
  const service = createServiceInstance({
    name: process.env.SERVICE_NAME,
    serviceId: process.env.SERVICE_NAME,
    host: process.env.HOSTNAME || os.hostname(),
    port: parseInt(process.env.PORT) || 3000,
    metadata: {
      podName: os.hostname(),
      namespace: process.env.NAMESPACE || 'default',
      nodeId: process.env.NODE_NAME,
      zone: process.env.ZONE
    }
  });

  await mesh.getServiceRegistry().registerInstance(service);
  
  // Graceful shutdown on SIGTERM
  process.on('SIGTERM', async () => {
    await mesh.getServiceRegistry().unregisterInstance(service.id);
    await mesh.stop();
    process.exit(0);
  });
}
```

## Configuration Examples

### Production Configuration

```javascript
const config = {
  registry: {
    heartbeatInterval: 15000,    // 15 seconds
    instanceTimeout: 45000,      // 45 seconds
    cleanupInterval: 30000       // 30 seconds
  },
  loadBalancer: {
    defaultStrategy: 'least-connections',
    healthCheckRequired: true
  },
  circuitBreaker: {
    failureThreshold: 3,         // Open after 3 failures
    recoveryTimeout: 30000,      // Try recovery after 30 seconds
    successThreshold: 2          // Close after 2 successes
  },
  observability: {
    metricsInterval: 5000,       // Collect metrics every 5 seconds
    tracesSampling: 0.2,         // 20% sampling
    retentionPeriod: 7200000     // 2 hours retention
  },
  security: {
    defaultEncryption: true,
    certificateValidation: true,
    rateLimitingEnabled: true
  }
};

const mesh = new ServiceMesh(config);
```

### Development Configuration

```javascript
const devConfig = {
  registry: {
    heartbeatInterval: 60000,    // 1 minute (less frequent)
    instanceTimeout: 180000,     // 3 minutes (more lenient)
    cleanupInterval: 120000      // 2 minutes
  },
  loadBalancer: {
    defaultStrategy: 'round-robin',
    healthCheckRequired: false   // More lenient for dev
  },
  circuitBreaker: {
    failureThreshold: 10,        // Higher threshold
    recoveryTimeout: 120000,     // 2 minutes
    successThreshold: 5
  }
};

const devMesh = new ServiceMesh(devConfig);
```

## Best Practices for Integration

1. **Start the mesh early**: Initialize and start the service mesh before registering services
2. **Handle graceful shutdown**: Always unregister services and stop the mesh on process termination
3. **Use environment-specific configs**: Different configurations for dev, staging, and production
4. **Monitor health status**: Set up alerts for circuit breaker state changes
5. **Use semantic versioning**: Include version information in service metadata
6. **Implement proper logging**: Log service registration, discovery, and health events
7. **Handle network partitions**: Plan for scenarios where services become temporarily unavailable

## Troubleshooting

### Common Issues

1. **Services not discovered**: Ensure the service mesh is started before registering services
2. **Load balancer returns null**: Check that services are registered and healthy
3. **Circuit breaker always open**: Review failure threshold and recovery timeout settings
4. **High memory usage**: Adjust metrics retention period and cleanup intervals
5. **TypeScript errors**: Ensure @types/node is installed in your project

### Debug Mode

```javascript
const mesh = new ServiceMesh({
  // ... your config
});

// Enable debug logging
mesh.on('instance:registered', (instance) => {
  console.log('DEBUG: Service registered:', instance);
});

mesh.on('instance:unregistered', (instance) => {
  console.log('DEBUG: Service unregistered:', instance);
});

mesh.on('metrics:collected', (metrics) => {
  console.log('DEBUG: Metrics collected:', metrics);
});
```

This generic service mesh is now ready to be integrated into any Node.js project and provides enterprise-grade service infrastructure capabilities.