/**
 * Enterprise Service Bus and Service Mesh Integration Demo
 * Fortune 100-Grade Platform Integration Example
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  EnterprisePlatformIntegration,
  EnterpriseServiceBus,
  ServiceMesh,
  IServiceDefinition,
  IServiceInstance,
  ITrafficPolicy,
  ISecurityPolicy
} from '../enterprise-integration';

/**
 * Comprehensive demonstration of Enterprise Platform Integration
 */
async function runEnterpriseIntegrationDemo(): Promise<void> {
  console.log('🚀 Starting Fortune 100-Grade Enterprise Integration Demo');
  console.log('===========================================================\n');

  try {
    // Initialize the enterprise platform integration
    const enterpriseIntegration = new EnterprisePlatformIntegration();
    
    // Start the integrated platform
    await enterpriseIntegration.start();
    
    // Get individual components
    const esb = enterpriseIntegration.getServiceBus();
    const serviceMesh = enterpriseIntegration.getServiceMesh();
    
    // Demonstrate service registration and management
    await demonstrateServiceManagement(esb, serviceMesh);
    
    // Demonstrate enterprise request processing
    await demonstrateEnterpriseRequestProcessing(enterpriseIntegration);
    
    // Demonstrate traffic management
    await demonstrateTrafficManagement(serviceMesh);
    
    // Demonstrate security policies
    await demonstrateSecurityPolicies(serviceMesh);
    
    // Demonstrate monitoring and observability
    await demonstrateMonitoringAndObservability(enterpriseIntegration, serviceMesh);
    
    // Demonstrate fault tolerance
    await demonstrateFaultTolerance(enterpriseIntegration, serviceMesh);
    
    // Show platform health and metrics
    await showPlatformStatus(enterpriseIntegration);
    
    console.log('\n✅ Enterprise Integration Demo completed successfully');
    
    // Cleanup
    await enterpriseIntegration.stop();
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  }
}

/**
 * Demonstrate service registration and management
 */
async function demonstrateServiceManagement(
  esb: EnterpriseServiceBus,
  serviceMesh: ServiceMesh
): Promise<void> {
  console.log('📋 Demonstrating Service Management');
  console.log('-----------------------------------');

  // Register a custom CTI service
  const threatIntelService: IServiceDefinition = {
    id: 'advanced-threat-intel',
    name: 'Advanced Threat Intelligence Service',
    version: '3.0.0',
    type: 'async',
    endpoints: [
      {
        name: 'analyze-threat',
        protocol: 'http',
        method: 'POST',
        path: '/api/v3/threats/analyze',
        timeout: 45000,
        retries: 2,
        circuitBreaker: true,
        authentication: {
          required: true,
          type: 'jwt',
          roles: ['threat-analyst', 'security-admin'],
          permissions: ['threat:analyze', 'threat:read']
        },
        rateLimiting: {
          enabled: true,
          requests: 50,
          windowMs: 60000,
          skipSuccessfulRequests: false
        }
      },
      {
        name: 'correlate-indicators',
        protocol: 'http',
        method: 'POST',
        path: '/api/v3/indicators/correlate',
        timeout: 30000,
        retries: 3,
        circuitBreaker: true,
        authentication: {
          required: true,
          type: 'jwt',
          roles: ['threat-analyst'],
          permissions: ['indicators:correlate']
        },
        rateLimiting: {
          enabled: true,
          requests: 100,
          windowMs: 60000,
          skipSuccessfulRequests: true
        }
      }
    ],
    capabilities: [
      'threat-analysis',
      'indicator-correlation',
      'behavioral-detection',
      'ml-classification'
    ],
    dependencies: ['ioc-processing', 'evidence-management'],
    metadata: {
      category: 'threat-intelligence',
      description: 'Advanced threat intelligence analysis and correlation',
      tags: ['ai', 'ml', 'correlation', 'enterprise'],
      maintainer: 'CTI Team',
      documentation: 'https://docs.phantom-spire.com/threat-intel'
    }
  };

  // Register the service
  await esb.registerService(threatIntelService);
  console.log('✅ Registered threat intelligence service');

  // Register multiple service instances for high availability
  const instances: IServiceInstance[] = [
    {
      id: `threat-intel-primary-${uuidv4()}`,
      serviceId: 'advanced-threat-intel',
      name: 'Threat Intel Primary Instance',
      version: '3.0.0',
      host: '10.0.1.100',
      port: 8080,
      protocol: 'https',
      metadata: {
        region: 'us-west-2',
        datacenter: 'primary',
        weight: 100,
        capabilities: ['gpu-acceleration', 'high-memory']
      },
      health: {
        status: 'healthy',
        uptime: 0,
        responseTime: 15,
        cpuUsage: 25,
        memoryUsage: 40,
        errorRate: 0,
        requestRate: 150,
        lastHealthCheck: new Date(),
        issues: []
      },
      registeredAt: new Date(),
      lastHeartbeat: new Date()
    },
    {
      id: `threat-intel-secondary-${uuidv4()}`,
      serviceId: 'advanced-threat-intel',
      name: 'Threat Intel Secondary Instance',
      version: '3.0.0',
      host: '10.0.1.101',
      port: 8080,
      protocol: 'https',
      metadata: {
        region: 'us-west-2',
        datacenter: 'secondary',
        weight: 80,
        capabilities: ['standard-compute']
      },
      health: {
        status: 'healthy',
        uptime: 0,
        responseTime: 22,
        cpuUsage: 35,
        memoryUsage: 30,
        errorRate: 0.01,
        requestRate: 120,
        lastHealthCheck: new Date(),
        issues: []
      },
      registeredAt: new Date(),
      lastHeartbeat: new Date()
    }
  ];

  const serviceRegistry = serviceMesh.getServiceRegistry();
  for (const instance of instances) {
    await serviceRegistry.registerInstance(instance);
    console.log(`✅ Registered instance: ${instance.name}`);
  }

  // List all registered services
  const services = await esb.listServices();
  console.log(`📊 Total registered services: ${services.length}`);
  
  // Discover service instances
  const discoveredInstances = await serviceMesh.discoverServices();
  console.log(`🔍 Total discovered instances: ${discoveredInstances.length}`);
  
  console.log('');
}

/**
 * Demonstrate enterprise request processing
 */
async function demonstrateEnterpriseRequestProcessing(
  enterpriseIntegration: EnterprisePlatformIntegration
): Promise<void> {
  console.log('🔄 Demonstrating Enterprise Request Processing');
  console.log('----------------------------------------------');

  // Process IOC enrichment request
  console.log('Processing IOC enrichment request...');
  const iocResponse = await enterpriseIntegration.processEnterpriseRequest(
    'ioc-processing',
    {
      ioc: 'malicious-domain-2024.com',
      type: 'domain',
      action: 'enrich',
      sources: ['virustotal', 'shodan', 'urlvoid']
    },
    {
      userId: 'analyst-001',
      organizationId: 'org-phantom-spire',
      correlationId: uuidv4(),
      source: 'threat-hunting-platform',
      priority: 'high',
      loadBalancingStrategy: 'least-connections'
    }
  );
  console.log('📊 IOC Processing Result:', {
    status: iocResponse.status,
    processingTime: `${iocResponse.processingTime}ms`,
    instanceId: iocResponse.instanceId
  });

  // Process evidence collection request
  console.log('Processing evidence collection request...');
  const evidenceResponse = await enterpriseIntegration.processEnterpriseRequest(
    'evidence-management',
    {
      incidentId: 'INC-2024-001',
      evidenceType: 'network-traffic',
      timeRange: {
        start: new Date(Date.now() - 3600000), // 1 hour ago
        end: new Date()
      },
      preserveChainOfCustody: true
    },
    {
      userId: 'forensics-analyst-002',
      organizationId: 'org-phantom-spire',
      correlationId: uuidv4(),
      source: 'incident-response-system',
      priority: 'critical',
      loadBalancingStrategy: 'round-robin'
    }
  );
  console.log('📊 Evidence Collection Result:', {
    status: evidenceResponse.status,
    processingTime: `${evidenceResponse.processingTime}ms`,
    instanceId: evidenceResponse.instanceId
  });

  // Process task creation request
  console.log('Processing task creation request...');
  const taskResponse = await enterpriseIntegration.processEnterpriseRequest(
    'task-management',
    {
      type: 'THREAT_INVESTIGATION',
      title: 'Investigate Suspicious Domain Activity',
      description: 'Analyze recently discovered malicious domain for TTPs',
      priority: 'high',
      assignee: 'analyst-001',
      tags: ['domain-analysis', 'threat-hunting', 'investigation'],
      dueDate: new Date(Date.now() + 86400000) // 24 hours from now
    },
    {
      userId: 'team-lead-003',
      organizationId: 'org-phantom-spire',
      correlationId: uuidv4(),
      source: 'workflow-automation',
      priority: 'normal',
      loadBalancingStrategy: 'weighted'
    }
  );
  console.log('📊 Task Creation Result:', {
    status: taskResponse.status,
    processingTime: `${taskResponse.processingTime}ms`,
    instanceId: taskResponse.instanceId
  });

  console.log('');
}

/**
 * Demonstrate traffic management capabilities
 */
async function demonstrateTrafficManagement(serviceMesh: ServiceMesh): Promise<void> {
  console.log('🚦 Demonstrating Traffic Management');
  console.log('-----------------------------------');

  // Add traffic policy for rate limiting
  const rateLimitPolicy: ITrafficPolicy = {
    id: `rate-limit-policy-${uuidv4()}`,
    name: 'IOC Processing Rate Limit',
    serviceId: 'ioc-processing',
    rules: [
      {
        id: 'rate-limit-rule',
        type: 'rate-limit',
        condition: 'always',
        configuration: {
          requestsPerSecond: 100,
          burstSize: 200,
          keyExtractor: 'client-ip'
        }
      }
    ],
    priority: 100,
    enabled: true
  };

  await serviceMesh.addTrafficPolicy(rateLimitPolicy);
  console.log('✅ Added rate limiting traffic policy');

  // Add circuit breaker policy
  const circuitBreakerPolicy: ITrafficPolicy = {
    id: `circuit-breaker-policy-${uuidv4()}`,
    name: 'Evidence Management Circuit Breaker',
    serviceId: 'evidence-management',
    rules: [
      {
        id: 'circuit-breaker-rule',
        type: 'circuit-breaker',
        condition: 'error-rate > 0.1',
        configuration: {
          failureThreshold: 5,
          recoveryTimeout: 30000,
          successThreshold: 3
        }
      }
    ],
    priority: 200,
    enabled: true
  };

  await serviceMesh.addTrafficPolicy(circuitBreakerPolicy);
  console.log('✅ Added circuit breaker traffic policy');

  // Add timeout policy
  const timeoutPolicy: ITrafficPolicy = {
    id: `timeout-policy-${uuidv4()}`,
    name: 'Task Management Timeout',
    serviceId: 'task-management',
    rules: [
      {
        id: 'timeout-rule',
        type: 'timeout',
        condition: 'always',
        configuration: {
          requestTimeout: 30000,
          keepAlive: true
        }
      }
    ],
    priority: 50,
    enabled: true
  };

  await serviceMesh.addTrafficPolicy(timeoutPolicy);
  console.log('✅ Added timeout traffic policy');

  // Test different load balancing strategies
  const loadBalancer = serviceMesh.getLoadBalancer();
  
  console.log('Testing load balancing strategies:');
  const strategies = ['round-robin', 'random', 'least-connections'];
  
  for (const strategy of strategies) {
    const instance = await loadBalancer.selectInstance(
      'ioc-processing',
      strategy as any
    );
    if (instance) {
      console.log(`  ${strategy}: Selected instance ${instance.name} (${instance.host}:${instance.port})`);
    }
  }

  console.log('');
}

/**
 * Demonstrate security policies
 */
async function demonstrateSecurityPolicies(serviceMesh: ServiceMesh): Promise<void> {
  console.log('🔐 Demonstrating Security Policies');
  console.log('----------------------------------');

  // Add comprehensive security policy
  const securityPolicy: ISecurityPolicy = {
    id: `security-policy-${uuidv4()}`,
    name: 'Enterprise Security Policy',
    serviceId: 'advanced-threat-intel',
    authentication: {
      enabled: true,
      methods: ['jwt', 'mtls'],
      providers: {
        jwt: {
          issuer: 'https://auth.phantom-spire.com',
          audience: 'phantom-spire-platform',
          algorithms: ['RS256', 'ES256']
        },
        mtls: {
          requireClientCerts: true,
          validateCertChain: true
        }
      }
    },
    authorization: {
      enabled: true,
      rules: [
        {
          id: 'admin-full-access',
          resource: '*',
          action: '*',
          principal: 'role:security-admin'
        },
        {
          id: 'analyst-read-access',
          resource: '/api/v3/threats/*',
          action: 'read',
          principal: 'role:threat-analyst',
          condition: 'user.organization == resource.organization'
        },
        {
          id: 'analyst-write-access',
          resource: '/api/v3/threats/analyze',
          action: 'write',
          principal: 'role:threat-analyst',
          condition: 'user.clearanceLevel >= 3'
        }
      ]
    },
    encryption: {
      tlsVersion: '1.3',
      cipherSuites: [
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_AES_128_GCM_SHA256'
      ],
      certificateValidation: true,
      mutualTLS: true
    },
    rateLimiting: {
      enabled: true,
      requestsPerSecond: 50,
      burstSize: 100,
      keyExtractor: 'user.id'
    }
  };

  await serviceMesh.addSecurityPolicy(securityPolicy);
  console.log('✅ Added comprehensive security policy');

  // Verify security policy
  const retrievedPolicy = await serviceMesh.getSecurityPolicy('advanced-threat-intel');
  if (retrievedPolicy) {
    console.log('📋 Security policy configured with:');
    console.log(`  - Authentication methods: ${retrievedPolicy.authentication.methods.join(', ')}`);
    console.log(`  - Authorization rules: ${retrievedPolicy.authorization.rules.length}`);
    console.log(`  - TLS version: ${retrievedPolicy.encryption.tlsVersion}`);
    console.log(`  - Mutual TLS: ${retrievedPolicy.encryption.mutualTLS ? 'Enabled' : 'Disabled'}`);
    console.log(`  - Rate limiting: ${retrievedPolicy.rateLimiting.requestsPerSecond} req/sec`);
  }

  console.log('');
}

/**
 * Demonstrate monitoring and observability
 */
async function demonstrateMonitoringAndObservability(
  enterpriseIntegration: EnterprisePlatformIntegration,
  serviceMesh: ServiceMesh
): Promise<void> {
  console.log('📊 Demonstrating Monitoring and Observability');
  console.log('----------------------------------------------');

  // Collect custom metrics
  await serviceMesh.collectMetrics({
    serviceId: 'ioc-processing',
    instanceId: 'ioc-proc-01',
    timestamp: new Date(),
    requestCount: 150,
    responseTime: 85,
    errorCount: 2,
    activeConnections: 25,
    throughput: 12.5,
    cpuUsage: 45,
    memoryUsage: 62,
    customMetrics: {
      iocEnrichmentRate: 95.5,
      threatDetectionAccuracy: 98.2,
      falsePositiveRate: 1.8,
      dataSourceLatency: 125
    }
  });
  console.log('✅ Collected custom metrics');

  // Get platform metrics
  const platformMetrics = await enterpriseIntegration.getPlatformMetrics();
  console.log('📈 Platform Metrics:');
  console.log(`  - Total requests: ${platformMetrics.platform.totalRequests}`);
  console.log(`  - Average response time: ${platformMetrics.platform.averageResponseTime}ms`);
  console.log(`  - Error rate: ${(platformMetrics.platform.errorRate * 100).toFixed(2)}%`);
  console.log(`  - Registered services: ${platformMetrics.serviceMesh.registeredServices}`);
  console.log(`  - Active instances: ${platformMetrics.serviceMesh.activeInstances}`);
  console.log(`  - Healthy instances: ${platformMetrics.serviceMesh.healthyInstances}`);

  // Get service metrics for a specific time range
  const timeRange = {
    start: new Date(Date.now() - 3600000), // 1 hour ago
    end: new Date()
  };
  
  const serviceMetrics = await serviceMesh.getMetrics('ioc-processing', timeRange);
  console.log(`📊 IOC Processing metrics (last hour): ${serviceMetrics.length} data points`);

  console.log('');
}

/**
 * Demonstrate fault tolerance capabilities
 */
async function demonstrateFaultTolerance(
  enterpriseIntegration: EnterprisePlatformIntegration,
  serviceMesh: ServiceMesh
): Promise<void> {
  console.log('🛡️ Demonstrating Fault Tolerance');
  console.log('---------------------------------');

  // Get circuit breaker for a service
  const circuitBreaker = serviceMesh.getCircuitBreaker('evidence-management');
  console.log(`🔌 Circuit breaker state: ${circuitBreaker.getState()}`);

  // Simulate service failure and recovery
  console.log('Simulating service failure scenarios...');
  
  try {
    // This will demonstrate circuit breaker opening on failures
    await circuitBreaker.execute(async () => {
      throw new Error('Simulated service failure');
    });
  } catch (error) {
    console.log('⚠️ Expected failure caught by circuit breaker');
  }

  // Force circuit breaker to open for demonstration
  circuitBreaker.forceOpen();
  console.log(`🔌 Circuit breaker state after force open: ${circuitBreaker.getState()}`);

  try {
    await circuitBreaker.execute(async () => {
      return 'This should not execute';
    });
  } catch (error) {
    console.log('🚫 Request blocked by open circuit breaker');
  }

  // Reset circuit breaker
  circuitBreaker.reset();
  console.log(`🔌 Circuit breaker state after reset: ${circuitBreaker.getState()}`);

  // Demonstrate health checks
  const instances = await serviceMesh.discoverServices();
  if (instances.length > 0) {
    const healthCheck = await serviceMesh.performHealthCheck(instances[0].id);
    console.log('🏥 Health check result:', {
      status: healthCheck.status,
      responseTime: `${healthCheck.responseTime}ms`,
      cpuUsage: `${healthCheck.cpuUsage.toFixed(1)}%`,
      memoryUsage: `${healthCheck.memoryUsage.toFixed(1)}%`
    });
  }

  console.log('');
}

/**
 * Show overall platform status
 */
async function showPlatformStatus(
  enterpriseIntegration: EnterprisePlatformIntegration
): Promise<void> {
  console.log('📈 Platform Status Summary');
  console.log('==========================');

  const healthStatus = await enterpriseIntegration.getHealthStatus();
  console.log('🏥 Health Status:');
  console.log(`  - Overall: ${healthStatus.overall}`);
  console.log(`  - Service Bus: ${healthStatus.components.serviceBus}`);
  console.log(`  - Service Mesh: ${healthStatus.components.serviceMesh}`);
  console.log(`  - Total Services: ${healthStatus.services}`);
  console.log(`  - Total Instances: ${healthStatus.instances}`);

  const platformMetrics = await enterpriseIntegration.getPlatformMetrics();
  console.log('\n📊 Performance Metrics:');
  console.log(`  - Platform Uptime: ${Math.floor(platformMetrics.platform.uptime / 1000)}s`);
  console.log(`  - Messages Processed: ${platformMetrics.esb.messagesProcessed}`);
  console.log(`  - Average Latency: ${platformMetrics.esb.averageLatency}ms`);
  console.log(`  - Throughput: ${platformMetrics.esb.throughput} msg/min`);
  console.log(`  - Error Rate: ${(platformMetrics.esb.errorRate * 100).toFixed(2)}%`);

  console.log('\n🎯 Fortune 100-Grade Enterprise Integration Platform is operational!');
}

// Export the demo function
export { runEnterpriseIntegrationDemo };

// Run demo if this file is executed directly
if (require.main === module) {
  runEnterpriseIntegrationDemo()
    .then(() => {
      console.log('\n🎉 Demo completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Demo failed:', error);
      process.exit(1);
    });
}