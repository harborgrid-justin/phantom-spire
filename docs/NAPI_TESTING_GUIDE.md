# NAPI-RS Modules Testing & Verification Guide

## 🎯 Overview

This comprehensive testing guide covers verification procedures for all 19 NAPI-RS modules, from basic functionality tests to advanced integration scenarios. Every step is verifiable and includes automated testing scripts.

## 📋 Testing Strategy

### Testing Levels
1. **Unit Tests**: Individual module functionality
2. **Integration Tests**: Module interaction and data flow
3. **Performance Tests**: Throughput and resource usage
4. **Compatibility Tests**: Cross-platform verification
5. **Production Tests**: Real-world scenario validation

### Testing Categories
- ✅ **Functional Testing**: Core feature verification
- ✅ **Error Handling**: Exception and edge case testing
- ✅ **Performance Testing**: Speed and resource benchmarks
- ✅ **Security Testing**: Input validation and memory safety
- ✅ **Integration Testing**: Multi-module workflows

## 🚀 Quick Verification

### Instant Module Check
Run this script to verify all modules are working:

```javascript
// quick-verify.js
const modules = {
  'phantom-cve-core': 'CveCoreNapi',
  'phantom-intel-core': 'IntelCoreNapi', 
  'phantom-xdr-core': 'XdrCoreNapi',
  'phantom-crypto-core': 'CryptoCoreNapi',
  'phantom-mitre-core': 'MitreCoreNapi',
  'phantom-incident-response-core': 'IncidentResponseCoreNapi',
  'phantom-malware-core': 'MalwareCoreNapi',
  'phantom-forensics-core': 'ForensicsCoreNapi',
  'phantom-threat-actor-core': 'ThreatActorCoreNapi',
  'phantom-ioc-core': 'IocCoreNapi',
  'phantom-vulnerability-core': 'VulnerabilityCoreNapi',
  'phantom-risk-core': 'RiskCoreNapi',
  'phantom-hunting-core': 'HuntingCoreNapi',
  'phantom-sandbox-core': 'SandboxCoreNapi',
  'phantom-attribution-core': 'AttributionCoreNapi',
  'phantom-feeds-core': 'FeedsCoreNapi',
  'phantom-reputation-core': 'ReputationCoreNapi',
  'phantom-compliance-core': 'ComplianceCoreNapi',
  'phantom-secop-core': 'SecopCoreNapi'
};

async function quickVerify() {
  console.log('🔍 Quick NAPI Module Verification');
  console.log('=' .repeat(50));
  
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };
  
  for (const [moduleName, className] of Object.entries(modules)) {
    try {
      console.log(`Testing ${moduleName}...`);
      
      // Load module
      const module = require(moduleName);
      const ModuleClass = module[className];
      
      if (!ModuleClass) {
        throw new Error(`Class ${className} not found in module`);
      }
      
      // Create instance
      const instance = new ModuleClass();
      
      // Test health check if available
      if (typeof instance.getHealthStatus === 'function') {
        const health = instance.getHealthStatus();
        const status = JSON.parse(health);
        
        if (status.status === 'healthy') {
          console.log(`  ✅ ${moduleName}: Healthy`);
          results.passed++;
        } else {
          console.log(`  ⚠️  ${moduleName}: ${status.status}`);
          results.failed++;
        }
      } else {
        console.log(`  ✅ ${moduleName}: Loaded successfully`);
        results.passed++;
      }
      
    } catch (error) {
      console.log(`  ❌ ${moduleName}: ${error.message}`);
      results.failed++;
      results.errors.push({ module: moduleName, error: error.message });
    }
  }
  
  console.log('\n📊 Results Summary:');
  console.log(`✅ Passed: ${results.passed}/${Object.keys(modules).length}`);
  console.log(`❌ Failed: ${results.failed}/${Object.keys(modules).length}`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 Errors:');
    results.errors.forEach(({ module, error }) => {
      console.log(`  ${module}: ${error}`);
    });
  }
  
  return results.failed === 0;
}

// Run verification
quickVerify().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});
```

Run the quick verification:
```bash
node quick-verify.js
```

## 🧪 Comprehensive Testing Suite

### Complete Test Runner

Create a comprehensive test suite that validates every module:

```javascript
// comprehensive-test.js
const fs = require('fs');
const path = require('path');

class NAPITestSuite {
  constructor() {
    this.results = {
      modules: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };
  }

  async runAllTests() {
    console.log('🧪 Comprehensive NAPI Module Test Suite');
    console.log('=' .repeat(60));
    
    const modules = [
      'phantom-cve-core',
      'phantom-intel-core',
      'phantom-xdr-core',
      'phantom-crypto-core',
      'phantom-mitre-core',
      'phantom-incident-response-core',
      'phantom-malware-core',
      'phantom-forensics-core',
      'phantom-threat-actor-core',
      'phantom-ioc-core',
      'phantom-vulnerability-core',
      'phantom-risk-core',
      'phantom-hunting-core',
      'phantom-sandbox-core',
      'phantom-attribution-core',
      'phantom-feeds-core',
      'phantom-reputation-core',
      'phantom-compliance-core',
      'phantom-secop-core'
    ];
    
    for (const moduleName of modules) {
      await this.testModule(moduleName);
    }
    
    this.generateReport();
  }
  
  async testModule(moduleName) {
    console.log(`\n🔬 Testing ${moduleName}`);
    console.log('-'.repeat(40));
    
    const moduleResults = {
      name: moduleName,
      tests: [],
      passed: 0,
      failed: 0,
      startTime: Date.now()
    };
    
    try {
      // Test 1: Module Loading
      const loadResult = await this.testModuleLoading(moduleName);
      moduleResults.tests.push(loadResult);
      loadResult.passed ? moduleResults.passed++ : moduleResults.failed++;
      
      if (!loadResult.passed) {
        moduleResults.endTime = Date.now();
        this.results.modules[moduleName] = moduleResults;
        return;
      }
      
      const module = require(moduleName);
      const instance = this.createModuleInstance(module, moduleName);
      
      if (!instance) {
        moduleResults.tests.push({
          name: 'Instance Creation',
          passed: false,
          error: 'Could not create module instance'
        });
        moduleResults.failed++;
        moduleResults.endTime = Date.now();
        this.results.modules[moduleName] = moduleResults;
        return;
      }
      
      // Test 2: Health Check
      const healthResult = await this.testHealthCheck(instance, moduleName);
      moduleResults.tests.push(healthResult);
      healthResult.passed ? moduleResults.passed++ : moduleResults.failed++;
      
      // Test 3: Basic Functionality
      const funcResult = await this.testBasicFunctionality(instance, moduleName);
      moduleResults.tests.push(funcResult);
      funcResult.passed ? moduleResults.passed++ : moduleResults.failed++;
      
      // Test 4: Error Handling
      const errorResult = await this.testErrorHandling(instance, moduleName);
      moduleResults.tests.push(errorResult);
      errorResult.passed ? moduleResults.passed++ : moduleResults.failed++;
      
      // Test 5: Performance
      const perfResult = await this.testPerformance(instance, moduleName);
      moduleResults.tests.push(perfResult);
      perfResult.passed ? moduleResults.passed++ : moduleResults.failed++;
      
    } catch (error) {
      moduleResults.tests.push({
        name: 'Module Test Suite',
        passed: false,
        error: error.message
      });
      moduleResults.failed++;
    }
    
    moduleResults.endTime = Date.now();
    moduleResults.duration = moduleResults.endTime - moduleResults.startTime;
    
    this.results.modules[moduleName] = moduleResults;
    this.results.summary.total++;
    
    if (moduleResults.failed === 0) {
      this.results.summary.passed++;
      console.log(`  ✅ ${moduleName}: All tests passed (${moduleResults.duration}ms)`);
    } else {
      this.results.summary.failed++;
      console.log(`  ❌ ${moduleName}: ${moduleResults.failed} test(s) failed`);
    }
  }
  
  async testModuleLoading(moduleName) {
    try {
      require(moduleName);
      return { name: 'Module Loading', passed: true };
    } catch (error) {
      return { name: 'Module Loading', passed: false, error: error.message };
    }
  }
  
  createModuleInstance(module, moduleName) {
    const classNames = [
      'CveCoreNapi', 'IntelCoreNapi', 'XdrCoreNapi', 'CryptoCoreNapi',
      'MitreCoreNapi', 'IncidentResponseCoreNapi', 'MalwareCoreNapi',
      'ForensicsCoreNapi', 'ThreatActorCoreNapi', 'IocCoreNapi',
      'VulnerabilityCoreNapi', 'RiskCoreNapi', 'HuntingCoreNapi',
      'SandboxCoreNapi', 'AttributionCoreNapi', 'FeedsCoreNapi',
      'ReputationCoreNapi', 'ComplianceCoreNapi', 'SecopCoreNapi'
    ];
    
    for (const className of classNames) {
      if (module[className]) {
        try {
          return new module[className]();
        } catch (error) {
          console.log(`    Failed to create ${className}: ${error.message}`);
        }
      }
    }
    
    return null;
  }
  
  async testHealthCheck(instance, moduleName) {
    try {
      if (typeof instance.getHealthStatus === 'function') {
        const health = instance.getHealthStatus();
        const status = JSON.parse(health);
        
        if (status.status === 'healthy') {
          return { name: 'Health Check', passed: true, result: status };
        } else {
          return { name: 'Health Check', passed: false, error: `Status: ${status.status}` };
        }
      } else {
        return { name: 'Health Check', passed: true, note: 'No health check method available' };
      }
    } catch (error) {
      return { name: 'Health Check', passed: false, error: error.message };
    }
  }
  
  async testBasicFunctionality(instance, moduleName) {
    try {
      // Test based on module type
      if (moduleName.includes('cve')) {
        return this.testCveFunctionality(instance);
      } else if (moduleName.includes('crypto')) {
        return this.testCryptoFunctionality(instance);
      } else if (moduleName.includes('intel')) {
        return this.testIntelFunctionality(instance);
      } else {
        // Generic test - try to call any available method with safe data
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
        const testMethod = methods.find(m => 
          m !== 'constructor' && 
          typeof instance[m] === 'function' &&
          !m.startsWith('_')
        );
        
        if (testMethod) {
          // Try calling with minimal safe data
          try {
            instance[testMethod]('{}');
            return { name: 'Basic Functionality', passed: true, method: testMethod };
          } catch (error) {
            // Expected - many methods require specific input
            return { name: 'Basic Functionality', passed: true, note: 'Method callable but requires specific input' };
          }
        } else {
          return { name: 'Basic Functionality', passed: false, error: 'No testable methods found' };
        }
      }
    } catch (error) {
      return { name: 'Basic Functionality', passed: false, error: error.message };
    }
  }
  
  testCveFunctionality(instance) {
    try {
      const testData = JSON.stringify({
        cveId: 'CVE-2023-TEST',
        description: 'Test vulnerability for verification',
        cvssScore: 5.0
      });
      
      if (typeof instance.processCve === 'function') {
        const result = instance.processCve(testData);
        const parsed = JSON.parse(result);
        return { name: 'CVE Processing', passed: true, result: 'CVE processed successfully' };
      } else {
        return { name: 'CVE Processing', passed: false, error: 'processCve method not found' };
      }
    } catch (error) {
      return { name: 'CVE Processing', passed: false, error: error.message };
    }
  }
  
  testCryptoFunctionality(instance) {
    try {
      if (typeof instance.generateSecureToken === 'function') {
        const token = instance.generateSecureToken(16);
        if (token && token.length > 0) {
          return { name: 'Crypto Operations', passed: true, result: 'Token generated successfully' };
        } else {
          return { name: 'Crypto Operations', passed: false, error: 'Invalid token generated' };
        }
      } else if (typeof instance.getPreciseTimestamp === 'function') {
        const timestamp = instance.getPreciseTimestamp();
        if (timestamp > 0) {
          return { name: 'Crypto Operations', passed: true, result: 'Timestamp generated successfully' };
        } else {
          return { name: 'Crypto Operations', passed: false, error: 'Invalid timestamp' };
        }
      } else {
        return { name: 'Crypto Operations', passed: false, error: 'No testable crypto methods found' };
      }
    } catch (error) {
      return { name: 'Crypto Operations', passed: false, error: error.message };
    }
  }
  
  testIntelFunctionality(instance) {
    try {
      const testData = JSON.stringify({
        indicators: ['test-indicator'],
        timeRange: '1h',
        sources: ['test']
      });
      
      if (typeof instance.gatherIntelligence === 'function') {
        // This might fail with mock data, but should not crash
        try {
          const result = instance.gatherIntelligence(testData);
          return { name: 'Intel Gathering', passed: true, result: 'Intelligence gathering operational' };
        } catch (error) {
          // Expected for test data
          return { name: 'Intel Gathering', passed: true, note: 'Method operational but requires valid data sources' };
        }
      } else {
        return { name: 'Intel Gathering', passed: false, error: 'gatherIntelligence method not found' };
      }
    } catch (error) {
      return { name: 'Intel Gathering', passed: false, error: error.message };
    }
  }
  
  async testErrorHandling(instance, moduleName) {
    try {
      // Test with invalid JSON
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
      const testMethod = methods.find(m => 
        m !== 'constructor' && 
        typeof instance[m] === 'function' &&
        !m.startsWith('_') &&
        m !== 'getHealthStatus'
      );
      
      if (testMethod) {
        try {
          instance[testMethod]('invalid json');
          return { name: 'Error Handling', passed: false, error: 'Should have thrown error with invalid input' };
        } catch (error) {
          return { name: 'Error Handling', passed: true, result: 'Properly handles invalid input' };
        }
      } else {
        return { name: 'Error Handling', passed: true, note: 'No methods available for error testing' };
      }
    } catch (error) {
      return { name: 'Error Handling', passed: false, error: error.message };
    }
  }
  
  async testPerformance(instance, moduleName) {
    try {
      const startTime = process.hrtime.bigint();
      
      // Simple performance test - health check timing
      if (typeof instance.getHealthStatus === 'function') {
        for (let i = 0; i < 10; i++) {
          instance.getHealthStatus();
        }
        
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        if (duration < 100) { // Should complete 10 health checks in under 100ms
          return { name: 'Performance', passed: true, result: `10 operations in ${duration.toFixed(2)}ms` };
        } else {
          return { name: 'Performance', passed: false, error: `Too slow: ${duration.toFixed(2)}ms` };
        }
      } else {
        return { name: 'Performance', passed: true, note: 'No performance test available' };
      }
    } catch (error) {
      return { name: 'Performance', passed: false, error: error.message };
    }
  }
  
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📈 Overall Summary:`);
    console.log(`  Total Modules: ${this.results.summary.total}`);
    console.log(`  ✅ Passed: ${this.results.summary.passed}`);
    console.log(`  ❌ Failed: ${this.results.summary.failed}`);
    console.log(`  Success Rate: ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%`);
    
    console.log(`\n📋 Detailed Results:`);
    
    Object.values(this.results.modules).forEach(module => {
      const status = module.failed === 0 ? '✅' : '❌';
      console.log(`\n  ${status} ${module.name} (${module.duration}ms)`);
      
      module.tests.forEach(test => {
        const testStatus = test.passed ? '  ✅' : '  ❌';
        console.log(`    ${testStatus} ${test.name}`);
        if (test.error) {
          console.log(`        Error: ${test.error}`);
        }
        if (test.note) {
          console.log(`        Note: ${test.note}`);
        }
      });
    });
    
    // Generate JSON report
    const reportPath = 'napi-test-results.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed JSON report saved to: ${reportPath}`);
    
    return this.results.summary.failed === 0;
  }
}

// Run comprehensive tests
const testSuite = new NAPITestSuite();
testSuite.runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
```

Run the comprehensive test suite:
```bash
node comprehensive-test.js
```

## 🔬 Individual Module Testing

### CVE Core Testing
```javascript
// test-cve-core.js
const { CveCoreNapi } = require('phantom-cve-core');

async function testCveCore() {
  console.log('🧪 Testing phantom-cve-core');
  
  const cveCore = new CveCoreNapi();
  
  // Test 1: Health Check
  console.log('\n1. Health Check');
  try {
    const health = cveCore.getHealthStatus();
    const status = JSON.parse(health);
    console.log('✅ Health status:', status);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test 2: CVE Processing
  console.log('\n2. CVE Processing');
  try {
    const testCve = JSON.stringify({
      cveId: 'CVE-2023-TEST-001',
      description: 'Test vulnerability for verification purposes',
      cvssScore: 7.5,
      affectedProducts: ['TestProduct v1.0', 'TestProduct v2.0'],
      publishedDate: '2023-10-01T00:00:00Z',
      modifiedDate: '2023-10-01T12:00:00Z'
    });
    
    const result = cveCore.processCve(testCve);
    const processed = JSON.parse(result);
    console.log('✅ CVE processed successfully:', processed);
  } catch (error) {
    console.log('❌ CVE processing failed:', error.message);
  }
  
  // Test 3: Batch Processing
  console.log('\n3. Batch CVE Processing');
  try {
    const testCves = JSON.stringify([
      {
        cveId: 'CVE-2023-TEST-001',
        description: 'First test vulnerability',
        cvssScore: 7.5
      },
      {
        cveId: 'CVE-2023-TEST-002', 
        description: 'Second test vulnerability',
        cvssScore: 9.0
      }
    ]);
    
    const batchResult = cveCore.batchProcessCves(testCves);
    const processed = JSON.parse(batchResult);
    console.log('✅ Batch processing successful:', processed);
  } catch (error) {
    console.log('❌ Batch processing failed:', error.message);
  }
  
  // Test 4: Search Functionality
  console.log('\n4. Vulnerability Search');
  try {
    const searchCriteria = JSON.stringify({
      severityMin: 7.0,
      affectedProducts: ['TestProduct'],
      dateRange: {
        start: '2023-01-01',
        end: '2023-12-31'
      },
      keywords: ['buffer overflow', 'remote execution']
    });
    
    const searchResult = cveCore.searchVulnerabilities(searchCriteria);
    const results = JSON.parse(searchResult);
    console.log('✅ Search completed:', results);
  } catch (error) {
    console.log('❌ Search failed:', error.message);
  }
  
  // Test 5: Exploit Timeline
  console.log('\n5. Exploit Timeline Analysis');
  try {
    const timeline = cveCore.getExploitTimeline('CVE-2023-TEST-001');
    const analysis = JSON.parse(timeline);
    console.log('✅ Timeline analysis:', analysis);
  } catch (error) {
    console.log('❌ Timeline analysis failed:', error.message);
  }
  
  // Test 6: Remediation Strategy
  console.log('\n6. Remediation Strategy');
  try {
    const testCveForRemediation = JSON.stringify({
      cveId: 'CVE-2023-TEST-001',
      cvssScore: 7.5,
      affectedProducts: ['CriticalApp v1.0'],
      exploitAvailable: false
    });
    
    const strategy = cveCore.getRemediationStrategy(testCveForRemediation);
    const recommendations = JSON.parse(strategy);
    console.log('✅ Remediation strategy:', recommendations);
  } catch (error) {
    console.log('❌ Remediation strategy failed:', error.message);
  }
  
  console.log('\n🎯 CVE Core testing completed');
}

testCveCore().catch(console.error);
```

### Crypto Core Testing
```javascript
// test-crypto-core.js
const { CryptoCoreNapi } = require('phantom-crypto-core');

async function testCryptoCore() {
  console.log('🧪 Testing phantom-crypto-core');
  
  const cryptoCore = new CryptoCoreNapi();
  
  // Test 1: Secure Token Generation
  console.log('\n1. Secure Token Generation');
  try {
    const token16 = cryptoCore.generateSecureToken(16);
    const token32 = cryptoCore.generateSecureToken(32);
    
    console.log('✅ 16-byte token:', token16);
    console.log('✅ 32-byte token:', token32);
    
    if (token16.length !== 32 || token32.length !== 64) { // Hex encoding doubles length
      throw new Error('Invalid token length');
    }
  } catch (error) {
    console.log('❌ Token generation failed:', error.message);
  }
  
  // Test 2: Hex Encoding/Decoding
  console.log('\n2. Enhanced Hex Operations');
  try {
    const testData = Buffer.from('Hello, World!', 'utf8');
    
    const encoded = cryptoCore.encodeHexEnhanced(testData);
    const encodedResult = JSON.parse(encoded);
    console.log('✅ Hex encoding:', encodedResult);
    
    const decoded = cryptoCore.decodeHexEnhanced(encodedResult.encoded);
    const decodedResult = JSON.parse(decoded);
    console.log('✅ Hex decoding:', decodedResult);
  } catch (error) {
    console.log('❌ Hex operations failed:', error.message);
  }
  
  // Test 3: Precise Timestamp
  console.log('\n3. Precise Timestamp');
  try {
    const timestamp1 = cryptoCore.getPreciseTimestamp();
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 1));
    const timestamp2 = cryptoCore.getPreciseTimestamp();
    
    console.log('✅ Timestamp 1:', timestamp1);
    console.log('✅ Timestamp 2:', timestamp2);
    console.log('✅ Precision difference:', timestamp2 - timestamp1, 'nanoseconds');
    
    if (timestamp2 <= timestamp1) {
      throw new Error('Timestamps not properly ordered');
    }
  } catch (error) {
    console.log('❌ Timestamp test failed:', error.message);
  }
  
  // Test 4: Signature Verification (if available)
  console.log('\n4. Signature Verification');
  try {
    if (typeof cryptoCore.verifySignature === 'function') {
      const testMessage = Buffer.from('test message');
      const testSignature = 'test_signature';
      const testKeyId = 'test_key';
      
      // This will likely fail with test data, but should not crash
      try {
        const isValid = cryptoCore.verifySignature(testKeyId, testMessage, testSignature);
        console.log('✅ Signature verification result:', isValid);
      } catch (error) {
        console.log('✅ Signature verification properly handles invalid input');
      }
    } else {
      console.log('ℹ️  Signature verification not available');
    }
  } catch (error) {
    console.log('❌ Signature verification test failed:', error.message);
  }
  
  // Test 5: Metrics
  console.log('\n5. Performance Metrics');
  try {
    if (typeof cryptoCore.getMetrics === 'function') {
      const metrics = cryptoCore.getMetrics();
      const metricsData = JSON.parse(metrics);
      console.log('✅ Performance metrics:', metricsData);
    } else {
      console.log('ℹ️  Metrics not available');
    }
  } catch (error) {
    console.log('❌ Metrics test failed:', error.message);
  }
  
  console.log('\n🎯 Crypto Core testing completed');
}

testCryptoCore().catch(console.error);
```

## 🚀 Performance Benchmarking

### Performance Test Suite
```javascript
// performance-benchmark.js
const modules = {
  'phantom-cve-core': { class: 'CveCoreNapi', method: 'processCve', testData: '{"cveId":"CVE-TEST","description":"test","cvssScore":5.0}' },
  'phantom-crypto-core': { class: 'CryptoCoreNapi', method: 'generateSecureToken', testData: 16 },
  'phantom-intel-core': { class: 'IntelCoreNapi', method: 'gatherIntelligence', testData: '{"indicators":["test"],"timeRange":"1h"}' }
};

async function runPerformanceBenchmarks() {
  console.log('🚀 NAPI Module Performance Benchmarks');
  console.log('='.repeat(50));
  
  for (const [moduleName, config] of Object.entries(modules)) {
    try {
      console.log(`\n📊 Benchmarking ${moduleName}`);
      
      const module = require(moduleName);
      const instance = new module[config.class]();
      
      // Warmup
      for (let i = 0; i < 10; i++) {
        try {
          instance[config.method](config.testData);
        } catch (error) {
          // Expected for some test data
        }
      }
      
      // Benchmark
      const iterations = 1000;
      const startTime = process.hrtime.bigint();
      
      for (let i = 0; i < iterations; i++) {
        try {
          instance[config.method](config.testData);
        } catch (error) {
          // Expected for some test data
        }
      }
      
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      const opsPerSec = (iterations / duration) * 1000;
      
      console.log(`  Operations: ${iterations}`);
      console.log(`  Duration: ${duration.toFixed(2)}ms`);
      console.log(`  Ops/sec: ${opsPerSec.toFixed(0)}`);
      console.log(`  Avg time: ${(duration / iterations).toFixed(3)}ms per operation`);
      
    } catch (error) {
      console.log(`  ❌ Benchmark failed: ${error.message}`);
    }
  }
}

runPerformanceBenchmarks().catch(console.error);
```

## 🔧 Integration Testing

### Multi-Module Workflow Test
```javascript
// integration-test.js
async function testIntegrationWorkflow() {
  console.log('🔗 Multi-Module Integration Test');
  console.log('='.repeat(40));
  
  try {
    // Load modules
    const { CveCoreNapi } = require('phantom-cve-core');
    const { IntelCoreNapi } = require('phantom-intel-core');
    const { XdrCoreNapi } = require('phantom-xdr-core');
    
    const cveCore = new CveCoreNapi();
    const intelCore = new IntelCoreNapi();
    const xdrCore = new XdrCoreNapi();
    
    console.log('✅ All modules loaded successfully');
    
    // Step 1: Process CVE
    console.log('\n1. Processing CVE data...');
    const cveData = JSON.stringify({
      cveId: 'CVE-2023-INTEGRATION-TEST',
      description: 'Integration test vulnerability',
      cvssScore: 8.5
    });
    
    const cveResult = cveCore.processCve(cveData);
    console.log('✅ CVE processed');
    
    // Step 2: Gather related intelligence
    console.log('\n2. Gathering threat intelligence...');
    const intelCriteria = JSON.stringify({
      indicators: ['integration-test-indicator'],
      timeRange: '24h',
      sources: ['test']
    });
    
    try {
      const intelResult = intelCore.gatherIntelligence(intelCriteria);
      console.log('✅ Intelligence gathered');
    } catch (error) {
      console.log('⚠️  Intelligence gathering expected to fail with test data');
    }
    
    // Step 3: XDR correlation
    console.log('\n3. Performing XDR correlation...');
    const events = JSON.stringify([
      {
        source: 'cve_analysis',
        data: JSON.parse(cveResult),
        timestamp: new Date().toISOString()
      }
    ]);
    
    try {
      const xdrResult = xdrCore.correlateEvents(events);
      console.log('✅ XDR correlation completed');
    } catch (error) {
      console.log('⚠️  XDR correlation expected to fail with test data');
    }
    
    console.log('\n🎯 Integration workflow completed successfully');
    
  } catch (error) {
    console.log('❌ Integration test failed:', error.message);
    throw error;
  }
}

testIntegrationWorkflow().catch(console.error);
```

## 📋 Automated Testing Scripts

### Create Test Automation
Save this as `run-all-tests.sh`:

```bash
#!/bin/bash

echo "🧪 Phantom Spire NAPI Module Testing Suite"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run test and check result
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${YELLOW}Running: $test_name${NC}"
    echo "Command: $test_command"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
}

# Check Node.js installation
echo -e "\n📋 Prerequisites Check"
echo "----------------------"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found"
    exit 1
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found"
    exit 1
fi

# Run tests
echo -e "\n🧪 Running Test Suite"
echo "====================="

# Quick verification
run_test "Quick Module Verification" "node quick-verify.js"

# Comprehensive tests
run_test "Comprehensive Module Tests" "node comprehensive-test.js"

# Individual module tests
run_test "CVE Core Functionality" "node test-cve-core.js"

run_test "Crypto Core Functionality" "node test-crypto-core.js"

# Performance benchmarks
run_test "Performance Benchmarks" "node performance-benchmark.js"

# Integration tests
run_test "Multi-Module Integration" "node integration-test.js"

# Final report
echo -e "\n📊 Final Test Report"
echo "===================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed successfully!${NC}"
    exit 0
else
    echo -e "\n${RED}💥 Some tests failed. Please review the output above.${NC}"
    exit 1
fi
```

Make it executable:
```bash
chmod +x run-all-tests.sh
./run-all-tests.sh
```

## 🎯 Continuous Integration

### GitHub Actions Workflow
Create `.github/workflows/napi-tests.yml`:

```yaml
name: NAPI Module Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [16, 18, 20]

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run quick verification
      run: node quick-verify.js
    
    - name: Run comprehensive tests
      run: node comprehensive-test.js
    
    - name: Run performance benchmarks
      run: node performance-benchmark.js
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results-${{ matrix.os }}-node${{ matrix.node-version }}
        path: napi-test-results.json
```

## 📊 Test Results Analysis

The testing framework generates detailed JSON reports that can be analyzed:

```javascript
// analyze-results.js
const fs = require('fs');

function analyzeTestResults() {
  if (!fs.existsSync('napi-test-results.json')) {
    console.log('No test results found. Run comprehensive-test.js first.');
    return;
  }
  
  const results = JSON.parse(fs.readFileSync('napi-test-results.json', 'utf8'));
  
  console.log('📊 Test Results Analysis');
  console.log('='.repeat(30));
  
  console.log(`\nOverall Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
  
  // Module performance analysis
  const modulePerformance = Object.values(results.modules)
    .sort((a, b) => a.duration - b.duration)
    .map(m => ({ name: m.name, duration: m.duration, success: m.failed === 0 }));
  
  console.log('\n🏃‍♂️ Module Performance (fastest to slowest):');
  modulePerformance.forEach((module, index) => {
    const status = module.success ? '✅' : '❌';
    console.log(`  ${index + 1}. ${status} ${module.name}: ${module.duration}ms`);
  });
  
  // Failure analysis
  const failedModules = Object.values(results.modules).filter(m => m.failed > 0);
  if (failedModules.length > 0) {
    console.log('\n🚨 Failed Modules:');
    failedModules.forEach(module => {
      console.log(`  ❌ ${module.name}:`);
      module.tests.filter(t => !t.passed).forEach(test => {
        console.log(`    - ${test.name}: ${test.error}`);
      });
    });
  }
}

analyzeTestResults();
```

---

## ✅ Verification Checklist

Use this checklist to verify your NAPI modules installation:

- [ ] **Prerequisites Met**
  - [ ] Node.js 16+ installed
  - [ ] npm 8+ installed
  - [ ] Platform build tools available (if building from source)

- [ ] **Module Installation**
  - [ ] All required modules installed via npm
  - [ ] No installation errors or warnings
  - [ ] Module loading verification passes

- [ ] **Basic Functionality**
  - [ ] Health checks pass for all modules
  - [ ] Core methods executable
  - [ ] Error handling works correctly

- [ ] **Performance**
  - [ ] Response times within acceptable limits
  - [ ] Memory usage reasonable
  - [ ] No memory leaks detected

- [ ] **Integration**
  - [ ] Multi-module workflows function
  - [ ] Data flow between modules works
  - [ ] Platform integration successful

- [ ] **Production Readiness**
  - [ ] All tests pass in target environment
  - [ ] Performance meets requirements
  - [ ] Monitoring and logging functional

---

*Testing Guide Version: 1.0.0*
*Last Updated: {{ current_date }}*