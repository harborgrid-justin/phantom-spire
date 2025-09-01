/**
 * Service Mesh Usage Example
 * Demonstrates how to use the enterprise service mesh in a Node.js application
 */

import {
  ServiceMesh,
  ServiceMeshFactory,
  createServiceInstance,
  IObservabilityMetrics,
  ITrafficPolicy,
  ISecurityPolicy
} from '../index';

async function main() {
  console.log('🚀 Enterprise Service Mesh Example');
  console.log('==================================\n');

  // 1. Create a service mesh using factory
  console.log('1. Creating service mesh...');
  const serviceMesh = ServiceMeshFactory.createDevelopment();

  // 2. Start the service mesh
  console.log('2. Starting service mesh...');
  await serviceMesh.start();
  console.log('✅ Service mesh started\n');

  // 3. Register multiple service instances
  console.log('3. Registering service instances...');
  
  const apiGateway1 = createServiceInstance({
    name: 'api-gateway',
    serviceId: 'api-gateway',
    host: 'localhost',
    port: 3001,
    version: '1.0.0',
    metadata: { region: 'us-east-1', priority: 1 }
  });

  const apiGateway2 = createServiceInstance({
    name: 'api-gateway',
    serviceId: 'api-gateway', 
    host: 'localhost',
    port: 3002,
    version: '1.0.0',
    metadata: { region: 'us-east-1', priority: 2 }
  });

  const userService1 = createServiceInstance({
    name: 'user-service',
    serviceId: 'user-service',
    host: 'localhost',
    port: 4001,
    version: '2.1.0',
    metadata: { region: 'us-east-1' }
  });

  const registry = serviceMesh.getServiceRegistry();
  await registry.registerInstance(apiGateway1);
  await registry.registerInstance(apiGateway2);
  await registry.registerInstance(userService1);
  
  console.log('✅ Service instances registered\n');

  // 4. Test load balancing
  console.log('4. Testing load balancing...');
  const loadBalancer = serviceMesh.getLoadBalancer();
  
  for (let i = 0; i < 5; i++) {
    const instance = await loadBalancer.selectInstance('api-gateway', 'round-robin');
    console.log(`   Request ${i + 1}: ${instance?.name}:${instance?.port}`);
  }
  console.log('');

  // 5. Test circuit breaker
  console.log('5. Testing circuit breaker...');
  const circuitBreaker = serviceMesh.getCircuitBreaker('user-service');
  
  try {
    const result = await circuitBreaker.execute(async () => {
      // Simulate a successful operation
      await new Promise(resolve => setTimeout(resolve, 100));
      return { status: 'success', data: 'User data' };
    });
    console.log('   Circuit breaker result:', result);
  } catch (error) {
    console.error('   Circuit breaker error:', error);
  }
  console.log('');

  // 6. Add traffic policy
  console.log('6. Adding traffic policy...');
  const trafficPolicy: ITrafficPolicy = {
    id: 'rate-limit-policy',
    name: 'API Gateway Rate Limiting',
    serviceId: 'api-gateway',
    priority: 1,
    enabled: true,
    rules: [
      {
        id: 'rate-limit-rule',
        type: 'rate-limit',
        condition: 'true',
        configuration: {
          requestsPerSecond: 1000,
          burstSize: 2000
        }
      }
    ]
  };
  
  await serviceMesh.addTrafficPolicy(trafficPolicy);
  console.log('✅ Traffic policy added\n');

  // 7. Add security policy
  console.log('7. Adding security policy...');
  const securityPolicy: ISecurityPolicy = {
    id: 'jwt-policy',
    name: 'JWT Authentication Policy',
    serviceId: 'user-service',
    authentication: {
      enabled: true,
      methods: ['jwt'],
      providers: {
        jwt: {
          secret: 'demo-secret',
          algorithm: 'HS256'
        }
      }
    },
    authorization: {
      enabled: true,
      rules: [
        {
          id: 'user-access',
          resource: '/users/*',
          action: 'read',
          principal: 'role:user'
        }
      ]
    },
    encryption: {
      tlsVersion: '1.3',
      cipherSuites: ['TLS_AES_256_GCM_SHA384'],
      certificateValidation: true,
      mutualTLS: false
    },
    rateLimiting: {
      enabled: true,
      requestsPerSecond: 100,
      burstSize: 150,
      keyExtractor: 'user_id'
    }
  };

  await serviceMesh.addSecurityPolicy(securityPolicy);
  console.log('✅ Security policy added\n');

  // 8. Collect metrics
  console.log('8. Collecting metrics...');
  const metrics: IObservabilityMetrics = {
    serviceId: 'api-gateway',
    instanceId: apiGateway1.id,
    timestamp: new Date(),
    requestCount: 1250,
    responseTime: 85,
    errorCount: 5,
    activeConnections: 45,
    throughput: 950,
    cpuUsage: 72,
    memoryUsage: 68,
    customMetrics: {
      'cache_hit_rate': 0.92,
      'db_pool_size': 25,
      'queue_depth': 12
    }
  };

  await serviceMesh.collectMetrics(metrics);
  console.log('✅ Metrics collected\n');

  // 9. Service discovery
  console.log('9. Service discovery...');
  const discoveredServices = await serviceMesh.discoverServices();
  console.log(`   Discovered ${discoveredServices.length} service instances:`);
  discoveredServices.forEach(service => {
    console.log(`   - ${service.name} (${service.serviceId}) @ ${service.host}:${service.port}`);
  });
  console.log('');

  // 10. Health monitoring
  console.log('10. Health monitoring...');
  const isHealthy = await serviceMesh.isHealthy();
  console.log(`   Service mesh health status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
  
  // Perform health check on specific instance
  try {
    const health = await serviceMesh.performHealthCheck(userService1.id);
    console.log(`   User service health: ${health.status} (${health.responseTime}ms response time)`);
  } catch (error) {
    console.error('   Health check failed:', error);
  }
  console.log('');

  // 11. Event handling demonstration
  console.log('11. Setting up event handlers...');
  
  serviceMesh.on('instance:registered', (instance) => {
    console.log(`   📡 Instance registered: ${instance.name}`);
  });
  
  serviceMesh.on('metrics:collected', (metrics) => {
    console.log(`   📊 Metrics collected for: ${metrics.serviceId}`);
  });

  // Register another instance to trigger events
  const paymentService = createServiceInstance({
    name: 'payment-service',
    serviceId: 'payment-service',
    host: 'localhost',
    port: 5001,
    version: '1.5.0'
  });
  
  await registry.registerInstance(paymentService);
  console.log('');

  // 12. Watch service changes
  console.log('12. Setting up service watcher...');
  serviceMesh.watchService('payment-service', (instances) => {
    console.log(`   👀 Payment service instances updated: ${instances.length} instances`);
  });

  // Wait a moment to see events
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 13. Cleanup
  console.log('13. Stopping service mesh...');
  await serviceMesh.stop();
  console.log('✅ Service mesh stopped\n');

  console.log('🎉 Example completed successfully!');
}

// Run the example
main().catch(error => {
  console.error('Example failed:', error);
  process.exit(1);
});