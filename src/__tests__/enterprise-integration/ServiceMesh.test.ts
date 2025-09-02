/**
 * Service Mesh Tests
 * Fortune 100-Grade Service Infrastructure Layer Tests
 */

import {
  ServiceMesh,
  CircuitBreaker,
} from '../../service-mesh/core/ServiceMesh.js';
import {
  IServiceInstance,
  ITrafficPolicy,
  ISecurityPolicy,
  IObservabilityMetrics,
  IInstanceHealth,
} from '../../service-mesh/interfaces/IServiceMesh.js';

describe('ServiceMesh', () => {
  let serviceMesh: ServiceMesh;
  let mockInstance: IServiceInstance;

  beforeEach(() => {
    serviceMesh = new ServiceMesh();

    mockInstance = {
      id: 'test-instance-01',
      serviceId: 'test-service',
      name: 'Test Service Instance',
      version: '1.0.0',
      host: 'localhost',
      port: 8080,
      protocol: 'http',
      metadata: {
        region: 'us-west-1',
        datacenter: 'primary',
      },
      health: {
        status: 'healthy',
        uptime: 1000,
        responseTime: 50,
        cpuUsage: 25,
        memoryUsage: 40,
        errorRate: 0,
        requestRate: 100,
        lastHealthCheck: new Date(),
        issues: [],
      },
      registeredAt: new Date(),
      lastHeartbeat: new Date(),
    };
  });

  afterEach(async () => {
    if (serviceMesh) {
      await serviceMesh.stop();
    }
  });

  describe('Service Registry', () => {
    test('should register service instance successfully', async () => {
      const registry = serviceMesh.getServiceRegistry();

      await expect(
        registry.registerInstance(mockInstance)
      ).resolves.toBeUndefined();

      const instances = await registry.getInstances('test-service');
      expect(instances).toHaveLength(1);
      expect(instances[0]).toEqual(mockInstance);
    });

    test('should unregister service instance successfully', async () => {
      const registry = serviceMesh.getServiceRegistry();

      await registry.registerInstance(mockInstance);
      await expect(
        registry.unregisterInstance('test-instance-01')
      ).resolves.toBeUndefined();

      const instances = await registry.getInstances('test-service');
      expect(instances).toHaveLength(0);
    });

    test('should get all instances', async () => {
      const registry = serviceMesh.getServiceRegistry();

      await registry.registerInstance(mockInstance);

      const allInstances = await registry.getAllInstances();
      expect(allInstances).toHaveLength(1);
      expect(allInstances[0]).toEqual(mockInstance);
    });

    test('should find healthy instances only', async () => {
      const registry = serviceMesh.getServiceRegistry();

      // Healthy instance
      await registry.registerInstance(mockInstance);

      // Unhealthy instance
      const unhealthyInstance = {
        ...mockInstance,
        id: 'test-instance-02',
        health: { ...mockInstance.health, status: 'unhealthy' as const },
      };
      await registry.registerInstance(unhealthyInstance);

      const healthyInstances =
        await registry.findHealthyInstances('test-service');
      expect(healthyInstances).toHaveLength(1);
      expect(healthyInstances[0]!.id).toBe('test-instance-01');
    });

    test('should update instance health', async () => {
      const registry = serviceMesh.getServiceRegistry();

      await registry.registerInstance(mockInstance);

      const healthUpdate: Partial<IInstanceHealth> = {
        status: 'unhealthy',
        responseTime: 1000,
        issues: ['High response time'],
      };

      await registry.updateInstanceHealth('test-instance-01', healthUpdate);

      const instances = await registry.getInstances('test-service');
      expect(instances[0]!.health.status).toBe('unhealthy');
      expect(instances[0]!.health.responseTime).toBe(1000);
      expect(instances[0]!.health.issues).toEqual(['High response time']);
    });
  });

  describe('Load Balancer', () => {
    beforeEach(async () => {
      const registry = serviceMesh.getServiceRegistry();
      await registry.registerInstance(mockInstance);

      // Add a second instance for load balancing tests
      const secondInstance = {
        ...mockInstance,
        id: 'test-instance-02',
        name: 'Test Service Instance 2',
        host: 'localhost',
        port: 8081,
      };
      await registry.registerInstance(secondInstance);
    });

    test('should select instance with round-robin strategy', async () => {
      const loadBalancer = serviceMesh.getLoadBalancer();

      const instance1 = await loadBalancer.selectInstance(
        'test-service',
        'round-robin'
      );
      const instance2 = await loadBalancer.selectInstance(
        'test-service',
        'round-robin'
      );

      expect(instance1).toBeDefined();
      expect(instance2).toBeDefined();
      // Should select different instances in round-robin fashion
      expect(instance1!.id).not.toBe(instance2!.id);
    });

    test('should select instance with random strategy', async () => {
      const loadBalancer = serviceMesh.getLoadBalancer();

      const instance = await loadBalancer.selectInstance(
        'test-service',
        'random'
      );

      expect(instance).toBeDefined();
      expect(['test-instance-01', 'test-instance-02']).toContain(instance!.id);
    });

    test('should return null for service with no instances', async () => {
      const loadBalancer = serviceMesh.getLoadBalancer();

      const instance = await loadBalancer.selectInstance(
        'non-existent-service',
        'round-robin'
      );

      expect(instance).toBeNull();
    });

    test('should add custom load balancing strategy', async () => {
      const loadBalancer = serviceMesh.getLoadBalancer();

      const customStrategy = {
        name: 'first-available',
        select: (instances: IServiceInstance[]) => instances[0] || null,
      };

      loadBalancer.addStrategy('first-available', customStrategy);

      const instance = await loadBalancer.selectInstance(
        'test-service',
        'first-available' as any
      );
      expect(instance).toBeDefined();
      expect(instance!.id).toBe('test-instance-01');
    });
  });

  describe('Circuit Breaker', () => {
    test('should create circuit breaker for service', () => {
      const circuitBreaker = serviceMesh.getCircuitBreaker('test-service');

      expect(circuitBreaker).toBeDefined();
      expect(circuitBreaker.getState()).toBe('closed');
    });

    test('should execute operation through circuit breaker', async () => {
      const circuitBreaker = serviceMesh.getCircuitBreaker('test-service');

      const result = await circuitBreaker.execute(async () => {
        return 'success';
      });

      expect(result).toBe('success');
      expect(circuitBreaker.getState()).toBe('closed');
    });

    test('should open circuit breaker on failures', async () => {
      const circuitBreaker = serviceMesh.getCircuitBreaker('test-service');

      // Force multiple failures to open the circuit breaker
      for (let i = 0; i < 6; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Test failure');
          });
        } catch (error) {
          // Expected failures
        }
      }

      expect(circuitBreaker.getState()).toBe('open');
    });

    test('should reset circuit breaker', async () => {
      const circuitBreaker = serviceMesh.getCircuitBreaker('test-service');

      circuitBreaker.forceOpen();
      expect(circuitBreaker.getState()).toBe('open');

      circuitBreaker.reset();
      expect(circuitBreaker.getState()).toBe('closed');
    });
  });

  describe('Traffic Management', () => {
    test('should add traffic policy successfully', async () => {
      const policy: ITrafficPolicy = {
        id: 'test-policy',
        name: 'Test Traffic Policy',
        serviceId: 'test-service',
        rules: [
          {
            id: 'rate-limit-rule',
            type: 'rate-limit',
            condition: 'always',
            configuration: {
              requestsPerSecond: 100,
              burstSize: 200,
            },
          },
        ],
        priority: 100,
        enabled: true,
      };

      await expect(
        serviceMesh.addTrafficPolicy(policy)
      ).resolves.toBeUndefined();
    });

    test('should remove traffic policy successfully', async () => {
      const policy: ITrafficPolicy = {
        id: 'test-policy',
        name: 'Test Traffic Policy',
        serviceId: 'test-service',
        rules: [],
        priority: 100,
        enabled: true,
      };

      await serviceMesh.addTrafficPolicy(policy);
      await expect(
        serviceMesh.removeTrafficPolicy('test-policy')
      ).resolves.toBeUndefined();
    });

    test('should get traffic policies for service', async () => {
      const policy: ITrafficPolicy = {
        id: 'test-policy',
        name: 'Test Traffic Policy',
        serviceId: 'test-service',
        rules: [],
        priority: 100,
        enabled: true,
      };

      await serviceMesh.addTrafficPolicy(policy);

      const policies = await serviceMesh.getTrafficPolicies('test-service');
      expect(policies).toHaveLength(1);
      expect(policies[0]).toEqual(policy);
    });
  });

  describe('Security Policies', () => {
    test('should add security policy successfully', async () => {
      const policy: ISecurityPolicy = {
        id: 'test-security-policy',
        name: 'Test Security Policy',
        serviceId: 'test-service',
        authentication: {
          enabled: true,
          methods: ['jwt'],
          providers: {},
        },
        authorization: {
          enabled: true,
          rules: [],
        },
        encryption: {
          tlsVersion: '1.3',
          cipherSuites: ['TLS_AES_256_GCM_SHA384'],
          certificateValidation: true,
          mutualTLS: true,
        },
        rateLimiting: {
          enabled: true,
          requestsPerSecond: 100,
          burstSize: 200,
          keyExtractor: 'client-ip',
        },
      };

      await expect(
        serviceMesh.addSecurityPolicy(policy)
      ).resolves.toBeUndefined();
    });

    test('should get security policy for service', async () => {
      const policy: ISecurityPolicy = {
        id: 'test-security-policy',
        name: 'Test Security Policy',
        serviceId: 'test-service',
        authentication: {
          enabled: true,
          methods: ['jwt'],
          providers: {},
        },
        authorization: {
          enabled: true,
          rules: [],
        },
        encryption: {
          tlsVersion: '1.3',
          cipherSuites: ['TLS_AES_256_GCM_SHA384'],
          certificateValidation: true,
          mutualTLS: true,
        },
        rateLimiting: {
          enabled: true,
          requestsPerSecond: 100,
          burstSize: 200,
          keyExtractor: 'client-ip',
        },
      };

      await serviceMesh.addSecurityPolicy(policy);

      const retrievedPolicy =
        await serviceMesh.getSecurityPolicy('test-service');
      expect(retrievedPolicy).toEqual(policy);
    });

    test('should return null for non-existent security policy', async () => {
      const policy = await serviceMesh.getSecurityPolicy('non-existent');
      expect(policy).toBeNull();
    });
  });

  describe('Observability', () => {
    test('should collect metrics successfully', async () => {
      const metrics: IObservabilityMetrics = {
        serviceId: 'test-service',
        instanceId: 'test-instance-01',
        timestamp: new Date(),
        requestCount: 100,
        responseTime: 50,
        errorCount: 2,
        activeConnections: 10,
        throughput: 20,
        cpuUsage: 30,
        memoryUsage: 40,
        customMetrics: {
          customMetric1: 123,
          customMetric2: 456,
        },
      };

      await expect(
        serviceMesh.collectMetrics(metrics)
      ).resolves.toBeUndefined();
    });

    test('should get metrics for service', async () => {
      const metrics: IObservabilityMetrics = {
        serviceId: 'test-service',
        instanceId: 'test-instance-01',
        timestamp: new Date(),
        requestCount: 100,
        responseTime: 50,
        errorCount: 2,
        activeConnections: 10,
        throughput: 20,
        cpuUsage: 30,
        memoryUsage: 40,
        customMetrics: {},
      };

      await serviceMesh.collectMetrics(metrics);

      const retrievedMetrics = await serviceMesh.getMetrics('test-service');
      expect(retrievedMetrics).toHaveLength(1);
      expect(retrievedMetrics[0]).toEqual(metrics);
    });

    test('should filter metrics by time range', async () => {
      const now = new Date();
      const anHourAgo = new Date(now.getTime() - 3600000);

      const metrics: IObservabilityMetrics = {
        serviceId: 'test-service',
        instanceId: 'test-instance-01',
        timestamp: anHourAgo,
        requestCount: 100,
        responseTime: 50,
        errorCount: 2,
        activeConnections: 10,
        throughput: 20,
        cpuUsage: 30,
        memoryUsage: 40,
        customMetrics: {},
      };

      await serviceMesh.collectMetrics(metrics);

      // Query for recent metrics (should exclude the hour-old metric)
      const timeRange = {
        start: new Date(now.getTime() - 1800000), // 30 minutes ago
        end: now,
      };

      const filteredMetrics = await serviceMesh.getMetrics(
        'test-service',
        timeRange
      );
      expect(filteredMetrics).toHaveLength(0);
    });
  });

  describe('Health Checks', () => {
    beforeEach(async () => {
      const registry = serviceMesh.getServiceRegistry();
      await registry.registerInstance(mockInstance);
    });

    test('should perform health check on instance', async () => {
      const health = await serviceMesh.performHealthCheck('test-instance-01');

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('uptime');
      expect(health).toHaveProperty('responseTime');
      expect(health).toHaveProperty('lastHealthCheck');
    });

    test('should throw error for non-existent instance health check', async () => {
      await expect(
        serviceMesh.performHealthCheck('non-existent')
      ).rejects.toThrow('Instance non-existent not found');
    });

    test('should set health check interval', () => {
      expect(() => serviceMesh.setHealthCheckInterval(10000)).not.toThrow();
    });
  });

  describe('Service Discovery', () => {
    beforeEach(async () => {
      const registry = serviceMesh.getServiceRegistry();
      await registry.registerInstance(mockInstance);
    });

    test('should discover all services', async () => {
      const services = await serviceMesh.discoverServices();

      expect(services).toHaveLength(1);
      expect(services[0]).toEqual(mockInstance);
    });

    test('should watch service changes', () => {
      const callback = jest.fn();

      expect(() =>
        serviceMesh.watchService('test-service', callback)
      ).not.toThrow();
    });
  });

  describe('Lifecycle Management', () => {
    test('should start successfully', async () => {
      await expect(serviceMesh.start()).resolves.toBeUndefined();
    });

    test('should stop successfully', async () => {
      await serviceMesh.start();
      await expect(serviceMesh.stop()).resolves.toBeUndefined();
    });

    test('should report health status', async () => {
      await serviceMesh.start();

      const isHealthy = await serviceMesh.isHealthy();
      expect(typeof isHealthy).toBe('boolean');
    });
  });
});

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker('test-service', {
      failureThreshold: 3,
      recoveryTimeout: 1000,
      successThreshold: 2,
    });
  });

  test('should start in closed state', () => {
    expect(circuitBreaker.getState()).toBe('closed');
  });

  test('should execute successful operations', async () => {
    const result = await circuitBreaker.execute(async () => 'success');
    expect(result).toBe('success');
    expect(circuitBreaker.getState()).toBe('closed');
  });

  test('should open after threshold failures', async () => {
    // Cause failures to exceed threshold
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('Test failure');
        });
      } catch (error) {
        // Expected failures
      }
    }

    expect(circuitBreaker.getState()).toBe('open');
  });

  test('should reject requests when open', async () => {
    circuitBreaker.forceOpen();

    await expect(circuitBreaker.execute(async () => 'success')).rejects.toThrow(
      'Circuit breaker is OPEN for service test-service'
    );
  });

  test('should reset to closed state', () => {
    circuitBreaker.forceOpen();
    expect(circuitBreaker.getState()).toBe('open');

    circuitBreaker.reset();
    expect(circuitBreaker.getState()).toBe('closed');
  });

  test('should force close', () => {
    circuitBreaker.forceOpen();
    expect(circuitBreaker.getState()).toBe('open');

    circuitBreaker.forceClose();
    expect(circuitBreaker.getState()).toBe('closed');
  });
});
