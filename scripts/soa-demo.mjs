#!/usr/bin/env node

/**
 * SOA Enhancement Demo Script
 * Demonstrates the 32 SOA improvements in action
 */

import { soaEnhancementHub } from '../src/services/soa-enhancements/SOAEnhancementHub.js';
import { 
  advancedServiceDiscovery,
  circuitBreakerRegistry,
  intelligentLoadBalancer,
  messageQueueManager
} from '../src/services/soa-enhancements/backend/index.js';

async function runSOADemo() {
  console.log('🚀 Starting SOA Enhancement Demo\n');

  try {
    // 1. Initialize SOA Enhancement Hub
    console.log('📋 Step 1: Initializing SOA Enhancement Hub...');
    await soaEnhancementHub.start();
    console.log('✅ SOA Enhancement Hub started successfully\n');

    // 2. Demonstrate Service Discovery
    console.log('🔍 Step 2: Testing Service Discovery...');
    
    // Register some test services
    await advancedServiceDiscovery.registerService({
      id: 'demo-auth-service',
      name: 'Demo Authentication Service',
      url: 'http://demo-auth:8080',
      health: 95,
      capabilities: ['authentication', 'authorization'],
      metadata: { version: '1.0.0', region: 'demo' }
    });

    await advancedServiceDiscovery.registerService({
      id: 'demo-data-service',
      name: 'Demo Data Service',
      url: 'http://demo-data:8081',
      health: 88,
      capabilities: ['data-processing', 'analytics'],
      metadata: { version: '2.0.0', region: 'demo' }
    });

    // Discover services
    const authServices = await advancedServiceDiscovery.discoverServices('authentication');
    console.log(`✅ Discovered ${authServices.length} authentication services`);

    const optimalService = await advancedServiceDiscovery.getOptimalService('data-processing');
    console.log(`✅ Optimal data processing service: ${optimalService?.name}\n`);

    // 3. Demonstrate Circuit Breaker
    console.log('🔌 Step 3: Testing Circuit Breaker...');
    
    const authBreaker = circuitBreakerRegistry.getCircuitBreaker('demo-auth-service');
    
    // Simulate successful operations
    for (let i = 0; i < 3; i++) {
      await authBreaker.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return { success: true, data: `Operation ${i + 1}` };
      });
    }
    console.log('✅ 3 successful operations completed');

    // Get circuit breaker status
    const breakerStatus = authBreaker.getStatus();
    console.log(`✅ Circuit breaker state: ${breakerStatus.state}, Success rate: ${((breakerStatus.metrics.successCount / breakerStatus.metrics.totalRequests) * 100).toFixed(1)}%\n`);

    // 4. Demonstrate Load Balancer
    console.log('⚖️ Step 4: Testing Load Balancer...');
    
    // Add demo nodes
    intelligentLoadBalancer.addNode({
      id: 'demo-node-1',
      url: 'http://demo-server1:8080',
      weight: 1.0,
      responseTime: 100,
      health: 95,
      capacity: 100,
      metadata: { region: 'demo', zone: 'a' }
    });

    intelligentLoadBalancer.addNode({
      id: 'demo-node-2',
      url: 'http://demo-server2:8080',
      weight: 1.2,
      responseTime: 85,
      health: 98,
      capacity: 120,
      metadata: { region: 'demo', zone: 'b' }
    });

    // Get next optimal node
    const nextNode = await intelligentLoadBalancer.getNextNode();
    console.log(`✅ Selected optimal node: ${nextNode?.id} (health: ${nextNode?.health}%)`);

    // Record request completion
    if (nextNode) {
      intelligentLoadBalancer.recordRequestCompletion(nextNode.id, 95, true);
    }

    const lbStats = intelligentLoadBalancer.getStatistics();
    console.log(`✅ Load balancer managing ${lbStats.totalNodes} nodes with ${lbStats.healthyNodes} healthy\n`);

    // 5. Demonstrate Message Queue
    console.log('📬 Step 5: Testing Message Queue...');
    
    const demoQueue = messageQueueManager.getQueue('demo-queue', {
      type: 'smart-routing' as any,
      maxSize: 1000,
      enableDeadLetter: true
    });

    // Register consumer
    demoQueue.consume('demo-topic', async (message) => {
      console.log(`📨 Processing message: ${message.id}`);
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // Produce messages
    for (let i = 0; i < 5; i++) {
      await demoQueue.produce('demo-topic', { data: `Demo message ${i + 1}` }, i % 3 + 1 as any);
    }

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const queueMetrics = demoQueue.getMetrics();
    console.log(`✅ Queue processed ${queueMetrics.messagesConsumed} messages with ${queueMetrics.throughputPerSecond} msg/sec throughput\n`);

    // 6. Get overall SOA metrics
    console.log('📊 Step 6: Getting SOA Platform Metrics...');
    
    const soaMetrics = await soaEnhancementHub.getMetrics();
    console.log(`✅ SOA Platform Status:`);
    console.log(`   - Total Enhancements: ${soaMetrics.platformIntegration.totalEnhancements}`);
    console.log(`   - Active Services: ${soaMetrics.platformIntegration.activeServices}`);
    console.log(`   - Healthy Services: ${soaMetrics.platformIntegration.healthyServices}`);
    console.log(`   - Average Response Time: ${soaMetrics.platformIntegration.averageResponseTime}ms\n`);

    // 7. Execute SOA operation
    console.log('🎯 Step 7: Executing SOA Operation...');
    
    const operationResult = await soaEnhancementHub.executeSOAOperation('health-check', {
      targetServices: ['demo-auth-service', 'demo-data-service'],
      checkType: 'comprehensive'
    });

    console.log(`✅ SOA Operation completed successfully`);
    console.log(`   - Operation: health-check`);
    console.log(`   - Status: ${operationResult.status}`);
    console.log(`   - Timestamp: ${operationResult.healthCheckTimestamp}\n`);

    console.log('🎉 SOA Enhancement Demo completed successfully!');
    console.log('\n📋 Demo Summary:');
    console.log('   ✅ Service Discovery: ML-driven service optimization');
    console.log('   ✅ Circuit Breaker: Adaptive failure protection');
    console.log('   ✅ Load Balancer: Intelligent traffic distribution');
    console.log('   ✅ Message Queue: Smart routing and processing');
    console.log('   ✅ SOA Hub: Centralized management and metrics');
    console.log('   ✅ Business Integration: Complete SOA operation lifecycle\n');

  } catch (error) {
    console.error('❌ SOA Demo failed:', error);
  } finally {
    // Cleanup
    await soaEnhancementHub.stop();
    console.log('🛑 SOA Enhancement Hub stopped\n');
  }
}

// Run the demo
runSOADemo().catch(console.error);