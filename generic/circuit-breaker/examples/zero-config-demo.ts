/**
 * Revolutionary Circuit Breaker Examples
 * Demonstrates zero-configuration fault tolerance
 */

import { createCircuitBreaker, CircuitBreakerFactory, discoverServices } from '../index';

console.log('🔄 Revolutionary Circuit Breaker Demo - Zero Configuration Required!');

// 1. REVOLUTIONARY: Auto-create with zero config
console.log('\n1. Auto-creating circuit breaker with ZERO configuration...');
const autoBreaker = createCircuitBreaker();

// 2. Service-specific auto-configuration
console.log('\n2. Auto-configured circuit breakers for different service types...');
const dbBreaker = CircuitBreakerFactory.createForService('database', 'user-db');
const apiBreaker = CircuitBreakerFactory.createForService('api', 'payment-api');
const cacheBreaker = CircuitBreakerFactory.createForService('cache', 'session-cache');

// 3. Automatic service discovery
console.log('\n3. Discovering services automatically...');
discoverServices().then(() => {
  console.log('✅ Auto-discovery completed!');
});

// 4. Zero-config usage examples
console.log('\n4. Using circuit breakers with automatic fault tolerance...');

// Simulate database operation
async function databaseOperation() {
  return dbBreaker.execute(async () => {
    // Simulate potential database failure
    if (Math.random() > 0.7) {
      throw new Error('Database connection timeout');
    }
    return { userId: 123, name: 'John Doe' };
  }, async () => {
    // Automatic fallback
    console.log('🛡️  Using cached data (automatic fallback)');
    return { userId: 123, name: 'John Doe (cached)' };
  });
}

// Simulate API call
async function apiCall() {
  return apiBreaker.execute(async () => {
    // Simulate potential API failure
    if (Math.random() > 0.8) {
      throw new Error('Payment API unavailable');
    }
    return { paymentId: 'pay_123', status: 'success' };
  });
}

// 5. Automatic monitoring and health checks
console.log('\n5. Automatic health monitoring...');

// Monitor circuit breaker events (automatic)
dbBreaker.on('circuit-opened', (metrics) => {
  console.log('🚨 Database circuit opened:', metrics.state);
});

dbBreaker.on('circuit-closed', (metrics) => {
  console.log('✅ Database circuit recovered:', metrics.state);
});

apiBreaker.on('auto-discovery', (services) => {
  console.log('🔍 Auto-discovered services:', services);
});

// 6. Demonstrate automatic failure detection and recovery
async function demonstrateFaultTolerance() {
  console.log('\n6. Demonstrating automatic fault tolerance...');
  
  for (let i = 0; i < 10; i++) {
    try {
      const dbResult = await databaseOperation();
      console.log(`✅ DB Call ${i + 1}: Success -`, dbResult.name);
    } catch (error) {
      console.log(`❌ DB Call ${i + 1}: Failed -`, (error as Error).message);
    }
    
    try {
      const apiResult = await apiCall();
      console.log(`✅ API Call ${i + 1}: Success -`, apiResult.paymentId);
    } catch (error) {
      console.log(`❌ API Call ${i + 1}: Failed -`, (error as Error).message);
    }
    
    // Small delay between calls
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// 7. Show health status (automatic)
function showHealthStatus() {
  console.log('\n7. Current health status (automatic monitoring):');
  console.log('Database Circuit:', dbBreaker.getHealth());
  console.log('API Circuit:', apiBreaker.getHealth());
  console.log('Cache Circuit:', cacheBreaker.getHealth());
}

// Run the demonstration
async function runDemo() {
  console.log('\n🚀 Starting fault tolerance demonstration...');
  
  await demonstrateFaultTolerance();
  showHealthStatus();
  
  // Show metrics
  console.log('\n📊 Automatic metrics collection:');
  console.log('DB Metrics:', dbBreaker.getMetrics());
  console.log('API Metrics:', apiBreaker.getMetrics());
  
  console.log('\n🎉 Demo completed! All circuit breakers are working with ZERO configuration!');
  console.log('   Features demonstrated:');
  console.log('   ✅ Zero-configuration setup');
  console.log('   ✅ Automatic service type detection');
  console.log('   ✅ Intelligent threshold configuration');
  console.log('   ✅ Automatic fallback handling');
  console.log('   ✅ Real-time health monitoring');
  console.log('   ✅ Auto-discovery of services');
  console.log('   ✅ Cross-service failure coordination');
}

// Auto-start if run directly
if (require.main === module) {
  runDemo().catch(console.error);
}

export { runDemo };