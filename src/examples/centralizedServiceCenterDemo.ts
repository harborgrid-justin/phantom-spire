/**
 * Centralized System Service Center Demo
 * Demonstrates Fortune 100-Grade Platform Orchestration
 */

import { centralizedServiceCenter } from '../src/centralized-service-center';
import { v4 as uuidv4 } from 'uuid';

async function runCentralizedServiceCenterDemo(): Promise<void> {
  console.log('🏛️ ===================================');
  console.log('🏛️ Fortune 100 Centralized System Service Center Demo');
  console.log('🏛️ ===================================\n');

  try {
    // Start the centralized service center
    console.log('🚀 Starting Centralized System Service Center...');
    await centralizedServiceCenter.start();
    console.log('✅ Service Center started successfully\n');

    // Demonstrate service discovery
    await demonstrateServiceDiscovery();
    
    // Demonstrate unified API access
    await demonstrateUnifiedAPIAccess();
    
    // Demonstrate cross-module integration
    await demonstrateCrossModuleIntegration();
    
    // Demonstrate platform monitoring
    await demonstratePlatformMonitoring();
    
    // Demonstrate service orchestration
    await demonstrateServiceOrchestration();

    console.log('\n🎉 Demo completed successfully!');
    console.log('🏛️ Centralized System Service Center is operational');
    console.log('🔗 All platform modules are linked and accessible through unified interface');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    // Cleanup
    try {
      await centralizedServiceCenter.stop();
      console.log('✅ Service Center stopped gracefully');
    } catch (error) {
      console.error('Error stopping service center:', error);
    }
  }
}

/**
 * Demonstrate service discovery capabilities
 */
async function demonstrateServiceDiscovery(): Promise<void> {
  console.log('🔍 Demonstrating Service Discovery');
  console.log('----------------------------------');

  // Get all available services
  const services = await centralizedServiceCenter.getServices();
  console.log(`📋 Found ${services.length} registered services:`);
  
  for (const service of services) {
    console.log(`  - ${service.name} (${service.id})`);
    console.log(`    Category: ${service.category}`);
    console.log(`    Status: ${service.status}`);
    console.log(`    Capabilities: ${service.capabilities.join(', ')}`);
    console.log(`    Endpoints: ${service.endpoints.length}`);
    console.log('');
  }

  // Find services by capability
  console.log('🔍 Finding services by capability:');
  const intelligenceServices = await centralizedServiceCenter.findServicesByCapability('threat-analysis');
  console.log(`  - Threat analysis services: ${intelligenceServices.length}`);
  
  const analyticsServices = await centralizedServiceCenter.findServicesByCapability('analytics');
  console.log(`  - Analytics services: ${analyticsServices.length}`);
  
  const workflowServices = await centralizedServiceCenter.findServicesByCapability('workflow-orchestration');
  console.log(`  - Workflow services: ${workflowServices.length}`);
  
  console.log('');
}

/**
 * Demonstrate unified API access to all modules
 */
async function demonstrateUnifiedAPIAccess(): Promise<void> {
  console.log('🌐 Demonstrating Unified API Access');
  console.log('-----------------------------------');

  const context = {
    requestId: uuidv4(),
    userId: 'demo-user',
    organizationId: 'demo-org',
    sessionId: uuidv4(),
    correlationId: uuidv4(),
    traceId: uuidv4(),
    timestamp: new Date(),
    source: 'demo',
    priority: 'normal' as const
  };

  // Execute operations on different services through unified interface
  const operations = [
    {
      serviceId: 'ioc-analysis',
      operation: 'analyzeIOC',
      parameters: { ioc: 'malicious-domain.com', context: { type: 'domain' } }
    },
    {
      serviceId: 'ioc-enrichment',
      operation: 'enrichIOC',
      parameters: { ioc: '192.168.1.100' }
    },
    {
      serviceId: 'workflow-orchestration',
      operation: 'createWorkflow',
      parameters: { 
        definition: { 
          name: 'Threat Analysis Workflow',
          steps: ['collect', 'analyze', 'report']
        }
      }
    },
    {
      serviceId: 'data-federation',
      operation: 'federatedQuery',
      parameters: { 
        query: { 
          select: ['*'],
          from: 'threat_intelligence',
          where: { severity: 'high' }
        }
      }
    },
    {
      serviceId: 'cache-management',
      operation: 'getCacheStats',
      parameters: {}
    }
  ];

  for (const operation of operations) {
    console.log(`🔄 Executing ${operation.operation} on ${operation.serviceId}...`);
    
    const result = await centralizedServiceCenter.executeOperation({
      ...operation,
      context
    });

    if (result.success) {
      console.log(`  ✅ Success - Processing time: ${result.metadata.processingTime}ms`);
      console.log(`  📊 Result: ${JSON.stringify(result.data, null, 2).substring(0, 100)}...`);
    } else {
      console.log(`  ❌ Failed: ${result.error?.message}`);
    }
    console.log('');
  }
}

/**
 * Demonstrate cross-module integration
 */
async function demonstrateCrossModuleIntegration(): Promise<void> {
  console.log('🔗 Demonstrating Cross-Module Integration');
  console.log('-----------------------------------------');

  // Simulate a complex workflow that uses multiple modules
  console.log('🏃‍♂️ Executing multi-module threat intelligence workflow...');

  const context = {
    requestId: uuidv4(),
    userId: 'analyst-001',
    organizationId: 'security-org',
    sessionId: uuidv4(),
    correlationId: uuidv4(),
    traceId: uuidv4(),
    timestamp: new Date(),
    source: 'threat-analysis-workflow',
    priority: 'high' as const
  };

  // Step 1: Analyze IOC
  console.log('  📊 Step 1: Analyzing IOC...');
  const analysisResult = await centralizedServiceCenter.executeOperation({
    serviceId: 'ioc-analysis',
    operation: 'analyzeIOC',
    parameters: { ioc: 'suspicious-hash.exe', context: { type: 'file' } },
    context
  });

  // Step 2: Enrich with additional intelligence
  console.log('  🔍 Step 2: Enriching with threat intelligence...');
  const enrichmentResult = await centralizedServiceCenter.executeOperation({
    serviceId: 'ioc-enrichment',
    operation: 'enrichIOC',
    parameters: { ioc: 'suspicious-hash.exe' },
    context
  });

  // Step 3: Create evidence record
  console.log('  📋 Step 3: Creating evidence record...');
  const evidenceResult = await centralizedServiceCenter.executeOperation({
    serviceId: 'evidence-management',
    operation: 'createEvidence',
    parameters: { 
      evidence: {
        type: 'malware-sample',
        description: 'Suspicious executable file',
        source: 'threat-analysis',
        severity: 'high'
      }
    },
    context
  });

  // Step 4: Create tracking issue
  console.log('  🎫 Step 4: Creating tracking issue...');
  const issueResult = await centralizedServiceCenter.executeOperation({
    serviceId: 'issue-tracking',
    operation: 'createIssue',
    parameters: {
      issue: {
        title: 'High-Risk IOC Detected',
        description: 'Malicious executable detected in network traffic',
        priority: 'high',
        category: 'security-incident'
      }
    },
    context
  });

  // Step 5: Create automated response workflow
  console.log('  🔄 Step 5: Creating response workflow...');
  const workflowResult = await centralizedServiceCenter.executeOperation({
    serviceId: 'workflow-orchestration',
    operation: 'createWorkflow',
    parameters: {
      definition: {
        name: 'Incident Response Workflow',
        trigger: 'high-risk-ioc-detected',
        steps: [
          'isolate-affected-systems',
          'collect-forensic-evidence',
          'notify-security-team',
          'update-threat-intelligence'
        ]
      }
    },
    context
  });

  console.log('✅ Multi-module workflow completed successfully!');
  console.log(`  🆔 Analysis ID: ${analysisResult.metadata.requestId}`);
  console.log(`  🔍 Enrichment ID: ${enrichmentResult.metadata.requestId}`);
  console.log(`  📋 Evidence ID: ${evidenceResult.metadata.requestId}`);
  console.log(`  🎫 Issue ID: ${issueResult.metadata.requestId}`);
  console.log(`  🔄 Workflow ID: ${workflowResult.metadata.requestId}`);
  console.log('');
}

/**
 * Demonstrate platform monitoring capabilities
 */
async function demonstratePlatformMonitoring(): Promise<void> {
  console.log('📊 Demonstrating Platform Monitoring');
  console.log('------------------------------------');

  // Get platform status
  const status = await centralizedServiceCenter.getPlatformStatus();
  console.log(`🏥 Platform Status: ${status.overall}`);
  console.log(`📈 Services: ${Object.keys(status.services).length} registered`);
  
  let healthyCount = 0;
  let unhealthyCount = 0;
  
  for (const [serviceId, health] of Object.entries(status.services)) {
    if (health.status === 'healthy') {
      healthyCount++;
    } else {
      unhealthyCount++;
      console.log(`  ⚠️  ${serviceId}: ${health.status} - ${health.issues.join(', ')}`);
    }
  }
  
  console.log(`  ✅ Healthy services: ${healthyCount}`);
  console.log(`  ❌ Unhealthy services: ${unhealthyCount}`);

  // Get platform metrics
  const metrics = await centralizedServiceCenter.getPlatformMetrics();
  console.log('\n📊 Platform Metrics:');
  console.log(`  - Total services: ${metrics.totalServices}`);
  console.log(`  - Active services: ${metrics.activeServices}`);
  console.log(`  - Total requests: ${metrics.totalRequests}`);
  console.log(`  - Average response time: ${metrics.averageResponseTime.toFixed(2)}ms`);
  console.log(`  - Error rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
  console.log(`  - Throughput: ${metrics.throughput.toFixed(2)} req/sec`);
  console.log(`  - Uptime: ${Math.floor(metrics.uptime / 1000)}s`);
  console.log('');
}

/**
 * Demonstrate service orchestration
 */
async function demonstrateServiceOrchestration(): Promise<void> {
  console.log('🎼 Demonstrating Service Orchestration');
  console.log('--------------------------------------');

  const context = {
    requestId: uuidv4(),
    userId: 'orchestrator-demo',
    organizationId: 'demo-org',
    sessionId: uuidv4(),
    correlationId: uuidv4(),
    traceId: uuidv4(),
    timestamp: new Date(),
    source: 'orchestration-demo',
    priority: 'normal' as const
  };

  // Demonstrate service chaining and orchestration
  console.log('🔗 Orchestrating complex threat intelligence pipeline...');

  const orchestrationSteps = [
    { service: 'data-ingestion', operation: 'ingestData', description: 'Ingest threat data' },
    { service: 'ioc-validation', operation: 'validateIOC', description: 'Validate IOC quality' },
    { service: 'ioc-analysis', operation: 'analyzeIOC', description: 'Analyze threat indicators' },
    { service: 'ioc-enrichment', operation: 'enrichIOC', description: 'Enrich with intelligence' },
    { service: 'evidence-management', operation: 'createEvidence', description: 'Preserve evidence' },
    { service: 'issue-tracking', operation: 'createIssue', description: 'Create tracking issue' }
  ];

  for (let i = 0; i < orchestrationSteps.length; i++) {
    const step = orchestrationSteps[i];
    console.log(`  ${i + 1}. ${step.description} (${step.service})...`);

    const result = await centralizedServiceCenter.executeOperation({
      serviceId: step.service,
      operation: step.operation,
      parameters: { 
        data: `Step ${i + 1} data`,
        correlationId: context.correlationId 
      },
      context
    });

    if (result.success) {
      console.log(`     ✅ Completed in ${result.metadata.processingTime}ms`);
    } else {
      console.log(`     ❌ Failed: ${result.error?.message}`);
    }
  }

  console.log('✅ Service orchestration pipeline completed');
  console.log('');
}

/**
 * Demonstrate API documentation generation
 */
async function demonstrateAPIDocumentation(): Promise<void> {
  console.log('📚 Demonstrating API Documentation');
  console.log('----------------------------------');

  const docs = await centralizedServiceCenter.getApiDocumentation();
  console.log(`📋 Generated unified API documentation with ${Object.keys(docs.paths).length} endpoints`);
  
  // Show sample endpoints
  console.log('📄 Sample API endpoints:');
  const paths = Object.keys(docs.paths).slice(0, 5);
  for (const path of paths) {
    const methods = Object.keys(docs.paths[path]);
    console.log(`  ${methods.join(', ').toUpperCase()} ${path}`);
  }
  
  console.log('');
}

/**
 * Main demo execution
 */
async function main(): Promise<void> {
  try {
    await runCentralizedServiceCenterDemo();
    await demonstrateAPIDocumentation();
  } catch (error) {
    console.error('Demo execution failed:', error);
    process.exit(1);
  }
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}

export { runCentralizedServiceCenterDemo };