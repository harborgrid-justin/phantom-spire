# NAPI-RS Modules Troubleshooting Guide

## 🎯 Overview

This comprehensive troubleshooting guide helps you diagnose and resolve common issues with Phantom Spire NAPI-RS modules. Includes step-by-step solutions, diagnostic tools, and prevention strategies.

## 🚨 Quick Issue Resolution

### Instant Health Check
Run this diagnostic script first:

```javascript
// diagnose.js
const diagnostics = {
  system: {},
  modules: {},
  performance: {},
  recommendations: []
};

async function runDiagnostics() {
  console.log('🔍 NAPI Module Diagnostics');
  console.log('='.repeat(40));
  
  // System diagnostics
  await checkSystemHealth();
  
  // Module diagnostics
  await checkModuleHealth();
  
  // Performance diagnostics
  await checkPerformance();
  
  // Generate report
  generateDiagnosticReport();
}

async function checkSystemHealth() {
  console.log('\n📊 System Health Check');
  
  // Node.js version
  diagnostics.system.nodeVersion = process.version;
  diagnostics.system.nodeVersionOk = process.version >= 'v16.0.0';
  
  // Memory usage
  const memUsage = process.memoryUsage();
  diagnostics.system.memoryUsage = {
    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
  };
  diagnostics.system.memoryOk = memUsage.heapUsed < 512 * 1024 * 1024; // Under 512MB
  
  // Platform info
  diagnostics.system.platform = process.platform;
  diagnostics.system.arch = process.arch;
  diagnostics.system.platformSupported = ['linux', 'darwin', 'win32'].includes(process.platform);
  
  console.log(`  Node.js: ${diagnostics.system.nodeVersion} ${diagnostics.system.nodeVersionOk ? '✅' : '❌'}`);
  console.log(`  Memory: ${diagnostics.system.memoryUsage.heapUsed} ${diagnostics.system.memoryOk ? '✅' : '⚠️'}`);
  console.log(`  Platform: ${diagnostics.system.platform}/${diagnostics.system.arch} ${diagnostics.system.platformSupported ? '✅' : '❌'}`);
}

async function checkModuleHealth() {
  console.log('\n🔧 Module Health Check');
  
  const modules = [
    'phantom-cve-core',
    'phantom-intel-core',
    'phantom-xdr-core',
    'phantom-crypto-core',
    'phantom-mitre-core'
  ];
  
  for (const moduleName of modules) {
    try {
      const module = require(moduleName);
      const className = Object.keys(module)[0];
      const instance = new module[className]();
      
      // Basic functionality test
      let healthStatus = 'unknown';
      if (typeof instance.getHealthStatus === 'function') {
        const health = JSON.parse(instance.getHealthStatus());
        healthStatus = health.status;
      }
      
      diagnostics.modules[moduleName] = {
        loaded: true,
        instantiated: true,
        health: healthStatus,
        class: className
      };
      
      console.log(`  ${moduleName}: ${healthStatus} ✅`);
      
    } catch (error) {
      diagnostics.modules[moduleName] = {
        loaded: false,
        error: error.message,
        code: error.code
      };
      
      console.log(`  ${moduleName}: ${error.message} ❌`);
    }
  }
}

async function checkPerformance() {
  console.log('\n⚡ Performance Check');
  
  // Simple performance test
  const iterations = 100;
  const startTime = process.hrtime.bigint();
  
  // CPU-intensive task
  for (let i = 0; i < iterations; i++) {
    JSON.stringify({ test: 'data', iteration: i });
  }
  
  const endTime = process.hrtime.bigint();
  const duration = Number(endTime - startTime) / 1000000; // ms
  
  diagnostics.performance = {
    iterations,
    duration: Math.round(duration * 100) / 100,
    opsPerSecond: Math.round((iterations / duration) * 1000)
  };
  
  const performanceOk = duration < 100; // Should complete in under 100ms
  console.log(`  ${iterations} operations: ${diagnostics.performance.duration}ms ${performanceOk ? '✅' : '⚠️'}`);
  console.log(`  Performance: ${diagnostics.performance.opsPerSecond} ops/sec`);
}

function generateDiagnosticReport() {
  console.log('\n📋 Diagnostic Summary');
  console.log('='.repeat(40));
  
  // Overall health
  const systemOk = diagnostics.system.nodeVersionOk && 
                  diagnostics.system.memoryOk && 
                  diagnostics.system.platformSupported;
  
  const modulesOk = Object.values(diagnostics.modules)
    .every(m => m.loaded && (m.health === 'healthy' || m.health === 'unknown'));
  
  console.log(`System Health: ${systemOk ? '✅ Good' : '❌ Issues Detected'}`);
  console.log(`Module Health: ${modulesOk ? '✅ Good' : '❌ Issues Detected'}`);
  
  // Recommendations
  if (!diagnostics.system.nodeVersionOk) {
    diagnostics.recommendations.push('Upgrade Node.js to version 16 or higher');
  }
  
  if (!diagnostics.system.memoryOk) {
    diagnostics.recommendations.push('Monitor memory usage - consider increasing available memory');
  }
  
  if (!diagnostics.system.platformSupported) {
    diagnostics.recommendations.push('Platform may not be fully supported - check module compatibility');
  }
  
  const failedModules = Object.entries(diagnostics.modules)
    .filter(([name, info]) => !info.loaded)
    .map(([name]) => name);
  
  if (failedModules.length > 0) {
    diagnostics.recommendations.push(`Install missing modules: npm install ${failedModules.join(' ')}`);
  }
  
  if (diagnostics.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    diagnostics.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  } else {
    console.log('\n🎉 All systems operational!');
  }
  
  // Save detailed report
  require('fs').writeFileSync('napi-diagnostics.json', JSON.stringify(diagnostics, null, 2));
  console.log('\n📄 Detailed report saved to: napi-diagnostics.json');
}

runDiagnostics().catch(console.error);
```

Run the diagnostic:
```bash
node diagnose.js
```

## 🔍 Common Issues & Solutions

### 1. Module Installation Issues

#### Issue: "Module not found" Error
```
Error: Cannot find module 'phantom-cve-core'
```

**Diagnosis:**
```bash
# Check if module is installed
npm list phantom-cve-core

# Check installation location
npm root -g
npm root
```

**Solutions:**
```bash
# Solution 1: Install missing module
npm install phantom-cve-core

# Solution 2: Reinstall with force flag
npm install phantom-cve-core --force

# Solution 3: Clear cache and reinstall
npm cache clean --force
npm install phantom-cve-core

# Solution 4: Check for global vs local installation
npm install -g phantom-cve-core  # Global
npm install phantom-cve-core     # Local
```

#### Issue: Native Build Failures
```
Error: Failed to build native addon
```

**Diagnosis:**
```bash
# Check system requirements
node --version  # Should be 16+
npm --version   # Should be 8+

# Check build tools (Linux/macOS)
gcc --version
make --version

# Check build tools (Windows)
npm config get msvs_version
```

**Solutions:**

**Linux:**
```bash
# Install build essentials
sudo apt update
sudo apt install build-essential python3-dev

# For CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install python3-devel
```

**macOS:**
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Update Xcode if needed
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

**Windows:**
```powershell
# Install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools

# Or use chocolatey
choco install visualstudio2019buildtools --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools"

# Configure npm to use correct VS version
npm config set msvs_version 2019
```

### 2. Runtime Errors

#### Issue: Module Instantiation Fails
```javascript
const { CveCoreNapi } = require('phantom-cve-core');
const cveCore = new CveCoreNapi(); // Error: Module not properly initialized
```

**Diagnosis Script:**
```javascript
// diagnose-instantiation.js
function diagnoseInstantiation(moduleName) {
  try {
    console.log(`Diagnosing ${moduleName}...`);
    
    // Step 1: Module loading
    console.log('1. Loading module...');
    const module = require(moduleName);
    console.log('✅ Module loaded successfully');
    
    // Step 2: Check available exports
    console.log('2. Available exports:', Object.keys(module));
    
    // Step 3: Find main class
    const mainClass = Object.values(module)[0];
    if (typeof mainClass !== 'function') {
      throw new Error('Main export is not a constructor function');
    }
    console.log('✅ Main class found');
    
    // Step 4: Create instance
    console.log('3. Creating instance...');
    const instance = new mainClass();
    console.log('✅ Instance created successfully');
    
    // Step 5: Check methods
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
    console.log('4. Available methods:', methods.filter(m => m !== 'constructor'));
    
    return { success: true, instance, methods };
    
  } catch (error) {
    console.error(`❌ Instantiation failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test multiple modules
['phantom-cve-core', 'phantom-crypto-core', 'phantom-intel-core'].forEach(mod => {
  console.log('\n' + '='.repeat(50));
  diagnoseInstantiation(mod);
});
```

**Solutions:**
```javascript
// Solution 1: Proper error handling
function createModuleInstance(moduleName, className) {
  try {
    const module = require(moduleName);
    
    if (!module[className]) {
      // Try to find the correct class name
      const availableClasses = Object.keys(module);
      throw new Error(`Class ${className} not found. Available: ${availableClasses.join(', ')}`);
    }
    
    return new module[className]();
  } catch (error) {
    console.error(`Failed to create ${moduleName} instance:`, error.message);
    throw error;
  }
}

// Solution 2: Dynamic class detection
function createAnyInstance(moduleName) {
  const module = require(moduleName);
  const classes = Object.values(module).filter(exp => typeof exp === 'function');
  
  if (classes.length === 0) {
    throw new Error('No constructor functions found in module');
  }
  
  // Try to create instance with first available class
  return new classes[0]();
}

// Solution 3: Validation wrapper
class SafeModuleWrapper {
  constructor(moduleName, className) {
    this.moduleName = moduleName;
    this.className = className;
    this.instance = null;
    this.isHealthy = false;
    
    this.initialize();
  }
  
  initialize() {
    try {
      const module = require(this.moduleName);
      this.instance = new module[this.className]();
      
      // Validate health if possible
      if (typeof this.instance.getHealthStatus === 'function') {
        const health = JSON.parse(this.instance.getHealthStatus());
        this.isHealthy = health.status === 'healthy';
      } else {
        this.isHealthy = true; // Assume healthy if no health check
      }
      
      console.log(`✅ ${this.moduleName} initialized successfully`);
      
    } catch (error) {
      console.error(`❌ ${this.moduleName} initialization failed:`, error.message);
      throw error;
    }
  }
  
  call(methodName, ...args) {
    if (!this.instance) {
      throw new Error(`Module ${this.moduleName} not initialized`);
    }
    
    if (!this.isHealthy) {
      console.warn(`⚠️ Module ${this.moduleName} may not be healthy`);
    }
    
    if (typeof this.instance[methodName] !== 'function') {
      throw new Error(`Method ${methodName} not found in ${this.moduleName}`);
    }
    
    return this.instance[methodName](...args);
  }
}

// Usage
const cveWrapper = new SafeModuleWrapper('phantom-cve-core', 'CveCoreNapi');
const result = cveWrapper.call('processCve', JSON.stringify({cveId: 'test'}));
```

#### Issue: Method Call Failures
```javascript
const result = cveCore.processCve(invalidData); // Error: Invalid input format
```

**Diagnosis & Solutions:**
```javascript
// robust-method-calling.js
class RobustMethodCaller {
  constructor(instance, moduleName) {
    this.instance = instance;
    this.moduleName = moduleName;
  }
  
  async callMethod(methodName, data, options = {}) {
    const {
      validateInput = true,
      retries = 3,
      timeout = 30000,
      fallback = null
    } = options;
    
    // Input validation
    if (validateInput) {
      const validation = this.validateInput(data);
      if (!validation.valid) {
        throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
      }
    }
    
    // Method existence check
    if (typeof this.instance[methodName] !== 'function') {
      throw new Error(`Method ${methodName} not found in ${this.moduleName}`);
    }
    
    // Retry logic
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${retries}: ${this.moduleName}.${methodName}`);
        
        // Call with timeout
        const result = await this.withTimeout(
          () => this.instance[methodName](JSON.stringify(data)),
          timeout
        );
        
        // Validate result
        const parsed = JSON.parse(result);
        console.log(`✅ ${methodName} succeeded on attempt ${attempt}`);
        return parsed;
        
      } catch (error) {
        console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt === retries) {
          if (fallback) {
            console.log('Using fallback response');
            return fallback;
          }
          throw new Error(`${methodName} failed after ${retries} attempts: ${error.message}`);
        }
        
        // Wait before retry
        await this.delay(1000 * attempt);
      }
    }
  }
  
  validateInput(data) {
    const errors = [];
    
    if (data === null || data === undefined) {
      errors.push('Data cannot be null or undefined');
    }
    
    if (typeof data === 'string') {
      try {
        JSON.parse(data);
      } catch (e) {
        errors.push('String data must be valid JSON');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  async withTimeout(fn, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      
      try {
        const result = fn();
        clearTimeout(timer);
        resolve(result);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage example
const { CveCoreNapi } = require('phantom-cve-core');
const cveCore = new CveCoreNapi();
const caller = new RobustMethodCaller(cveCore, 'phantom-cve-core');

// Robust method call
try {
  const result = await caller.callMethod('processCve', {
    cveId: 'CVE-2023-12345',
    description: 'Test vulnerability'
  }, {
    retries: 3,
    timeout: 10000,
    fallback: { error: true, message: 'Processing unavailable' }
  });
  
  console.log('Result:', result);
} catch (error) {
  console.error('Method call failed:', error.message);
}
```

### 3. Performance Issues

#### Issue: Slow Module Performance
```javascript
// Performance monitoring wrapper
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      calls: 0,
      totalTime: 0,
      errors: 0,
      slowCalls: 0
    };
  }
  
  async monitorCall(fn, threshold = 1000) {
    const startTime = process.hrtime.bigint();
    this.metrics.calls++;
    
    try {
      const result = await fn();
      
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // ms
      
      this.metrics.totalTime += duration;
      
      if (duration > threshold) {
        this.metrics.slowCalls++;
        console.warn(`⚠️ Slow call detected: ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
      }
      
      return result;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }
  
  getStats() {
    return {
      ...this.metrics,
      averageTime: this.metrics.calls > 0 ? this.metrics.totalTime / this.metrics.calls : 0,
      errorRate: this.metrics.calls > 0 ? this.metrics.errors / this.metrics.calls : 0,
      slowCallRate: this.metrics.calls > 0 ? this.metrics.slowCalls / this.metrics.calls : 0
    };
  }
  
  resetStats() {
    this.metrics = { calls: 0, totalTime: 0, errors: 0, slowCalls: 0 };
  }
}

// Performance optimization example
class OptimizedCVEProcessor {
  constructor() {
    this.cveCore = new CveCoreNapi();
    this.cache = new Map();
    this.monitor = new PerformanceMonitor();
  }
  
  async processCveOptimized(cveData) {
    const cacheKey = this.getCacheKey(cveData);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('Cache hit');
      return this.cache.get(cacheKey);
    }
    
    // Process with monitoring
    const result = await this.monitor.monitorCall(async () => {
      return JSON.parse(this.cveCore.processCve(JSON.stringify(cveData)));
    }, 500); // 500ms threshold
    
    // Cache result
    this.cache.set(cacheKey, result);
    
    // Cleanup cache if too large
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    return result;
  }
  
  getCacheKey(cveData) {
    return `cve:${cveData.cveId || 'unknown'}`;
  }
  
  getPerformanceStats() {
    return this.monitor.getStats();
  }
}
```

#### Issue: Memory Leaks
```javascript
// Memory monitoring utility
class MemoryMonitor {
  constructor(alertThreshold = 500 * 1024 * 1024) { // 500MB
    this.alertThreshold = alertThreshold;
    this.samples = [];
    this.monitoring = false;
  }
  
  startMonitoring(intervalMs = 10000) {
    if (this.monitoring) return;
    
    this.monitoring = true;
    console.log('🔍 Starting memory monitoring...');
    
    this.interval = setInterval(() => {
      const usage = process.memoryUsage();
      this.samples.push({
        timestamp: new Date().toISOString(),
        ...usage
      });
      
      // Keep only last 100 samples
      if (this.samples.length > 100) {
        this.samples.shift();
      }
      
      // Check for memory alerts
      if (usage.heapUsed > this.alertThreshold) {
        console.warn(`🚨 Memory usage high: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
        this.checkForLeak();
      }
      
    }, intervalMs);
  }
  
  stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
      this.monitoring = false;
      console.log('Memory monitoring stopped');
    }
  }
  
  checkForLeak() {
    if (this.samples.length < 10) return;
    
    const recent = this.samples.slice(-10);
    const trend = this.calculateTrend(recent.map(s => s.heapUsed));
    
    if (trend > 0.1) { // 10% increase trend
      console.error('🚨 Potential memory leak detected!');
      this.suggestCleanup();
    }
  }
  
  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    return (last - first) / first;
  }
  
  suggestCleanup() {
    console.log('💡 Memory cleanup suggestions:');
    console.log('  1. Clear module caches');
    console.log('  2. Null out unused object references');
    console.log('  3. Force garbage collection: global.gc()');
    console.log('  4. Restart the application if memory continues to grow');
  }
  
  getMemoryReport() {
    const current = process.memoryUsage();
    const report = {
      current: {
        rss: Math.round(current.rss / 1024 / 1024) + 'MB',
        heapUsed: Math.round(current.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(current.heapTotal / 1024 / 1024) + 'MB',
        external: Math.round(current.external / 1024 / 1024) + 'MB'
      },
      samples: this.samples.length,
      monitoring: this.monitoring
    };
    
    if (this.samples.length > 0) {
      const first = this.samples[0];
      const last = this.samples[this.samples.length - 1];
      report.trend = {
        duration: new Date(last.timestamp) - new Date(first.timestamp),
        heapChange: Math.round((last.heapUsed - first.heapUsed) / 1024 / 1024) + 'MB'
      };
    }
    
    return report;
  }
}

// Usage
const memMonitor = new MemoryMonitor();
memMonitor.startMonitoring(5000); // Check every 5 seconds

// Later...
console.log(memMonitor.getMemoryReport());
```

### 4. Cross-Platform Issues

#### Issue: Platform-Specific Failures
```javascript
// platform-compatibility.js
class PlatformCompatibilityChecker {
  constructor() {
    this.platform = process.platform;
    this.arch = process.arch;
    this.nodeVersion = process.version;
  }
  
  checkCompatibility() {
    const report = {
      platform: this.platform,
      architecture: this.arch,
      nodeVersion: this.nodeVersion,
      compatible: true,
      issues: [],
      recommendations: []
    };
    
    // Check platform support
    const supportedPlatforms = ['linux', 'darwin', 'win32'];
    if (!supportedPlatforms.includes(this.platform)) {
      report.compatible = false;
      report.issues.push(`Unsupported platform: ${this.platform}`);
      report.recommendations.push('Use Linux, macOS, or Windows');
    }
    
    // Check architecture
    const supportedArchs = ['x64', 'arm64'];
    if (!supportedArchs.includes(this.arch)) {
      report.issues.push(`Architecture ${this.arch} may not be fully supported`);
      report.recommendations.push('Use x64 or ARM64 architecture');
    }
    
    // Check Node.js version
    const nodeVersionNum = parseInt(this.nodeVersion.slice(1));
    if (nodeVersionNum < 16) {
      report.compatible = false;
      report.issues.push(`Node.js version too old: ${this.nodeVersion}`);
      report.recommendations.push('Upgrade to Node.js 16 or later');
    }
    
    // Platform-specific checks
    if (this.platform === 'win32') {
      report.recommendations.push('Ensure Visual Studio Build Tools are installed');
      report.recommendations.push('Run PowerShell as Administrator for installations');
    } else if (this.platform === 'darwin') {
      report.recommendations.push('Ensure Xcode Command Line Tools are installed');
      if (this.arch === 'arm64') {
        report.recommendations.push('Use native ARM64 binaries when available');
      }
    } else if (this.platform === 'linux') {
      report.recommendations.push('Ensure build-essential package is installed');
      report.recommendations.push('Check for libc compatibility');
    }
    
    return report;
  }
  
  async testModuleLoading() {
    const modules = [
      'phantom-cve-core',
      'phantom-crypto-core',
      'phantom-intel-core'
    ];
    
    const results = {};
    
    for (const moduleName of modules) {
      try {
        const module = require(moduleName);
        const instance = new (Object.values(module)[0])();
        
        results[moduleName] = {
          loaded: true,
          instantiated: true,
          error: null
        };
        
      } catch (error) {
        results[moduleName] = {
          loaded: false,
          instantiated: false,
          error: error.message,
          code: error.code
        };
      }
    }
    
    return results;
  }
  
  generateCompatibilityReport() {
    const compatibility = this.checkCompatibility();
    
    console.log('🖥️  Platform Compatibility Report');
    console.log('='.repeat(40));
    console.log(`Platform: ${compatibility.platform}/${compatibility.architecture}`);
    console.log(`Node.js: ${compatibility.nodeVersion}`);
    console.log(`Compatible: ${compatibility.compatible ? '✅' : '❌'}`);
    
    if (compatibility.issues.length > 0) {
      console.log('\n⚠️  Issues:');
      compatibility.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (compatibility.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      compatibility.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    
    return compatibility;
  }
}

// Run compatibility check
const checker = new PlatformCompatibilityChecker();
const report = checker.generateCompatibilityReport();

// Test module loading
checker.testModuleLoading().then(results => {
  console.log('\n🔧 Module Loading Test:');
  Object.entries(results).forEach(([mod, result]) => {
    const status = result.loaded ? '✅' : '❌';
    console.log(`  ${status} ${mod}: ${result.error || 'OK'}`);
  });
}).catch(console.error);
```

## 🛠️ Advanced Troubleshooting Tools

### 1. Module Health Monitor
```javascript
// health-monitor.js
class ModuleHealthMonitor {
  constructor() {
    this.modules = new Map();
    this.healthHistory = new Map();
    this.alertCallbacks = new Set();
  }
  
  registerModule(name, instance) {
    this.modules.set(name, instance);
    this.healthHistory.set(name, []);
    console.log(`📋 Registered module: ${name}`);
  }
  
  async checkAllModules() {
    const results = new Map();
    
    for (const [name, instance] of this.modules) {
      const health = await this.checkModuleHealth(name, instance);
      results.set(name, health);
      
      // Store in history
      const history = this.healthHistory.get(name);
      history.push({
        timestamp: new Date().toISOString(),
        ...health
      });
      
      // Keep only last 100 entries
      if (history.length > 100) {
        history.shift();
      }
      
      // Trigger alerts if unhealthy
      if (!health.healthy) {
        this.triggerAlert(name, health);
      }
    }
    
    return results;
  }
  
  async checkModuleHealth(name, instance) {
    const health = {
      name,
      healthy: false,
      status: 'unknown',
      responseTime: 0,
      error: null,
      details: {}
    };
    
    try {
      const startTime = process.hrtime.bigint();
      
      // Check if health method exists
      if (typeof instance.getHealthStatus === 'function') {
        const healthResult = instance.getHealthStatus();
        const status = JSON.parse(healthResult);
        
        health.healthy = status.status === 'healthy';
        health.status = status.status;
        health.details = status;
      } else {
        // Fallback: try to call any method
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
        const testMethod = methods.find(m => 
          m !== 'constructor' && 
          typeof instance[m] === 'function'
        );
        
        if (testMethod) {
          // Try calling the method with minimal data
          try {
            instance[testMethod]('{}');
            health.healthy = true;
            health.status = 'responsive';
          } catch (error) {
            // Expected for many methods with test data
            health.healthy = true;
            health.status = 'callable';
          }
        }
      }
      
      const endTime = process.hrtime.bigint();
      health.responseTime = Number(endTime - startTime) / 1000000; // ms
      
    } catch (error) {
      health.error = error.message;
      health.status = 'error';
    }
    
    return health;
  }
  
  onAlert(callback) {
    this.alertCallbacks.add(callback);
  }
  
  triggerAlert(moduleName, health) {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(moduleName, health);
      } catch (error) {
        console.error('Alert callback failed:', error);
      }
    });
  }
  
  getHealthSummary() {
    const summary = {
      totalModules: this.modules.size,
      healthyModules: 0,
      unhealthyModules: 0,
      averageResponseTime: 0,
      modules: []
    };
    
    let totalResponseTime = 0;
    
    for (const [name, history] of this.healthHistory) {
      if (history.length === 0) continue;
      
      const latest = history[history.length - 1];
      totalResponseTime += latest.responseTime;
      
      if (latest.healthy) {
        summary.healthyModules++;
      } else {
        summary.unhealthyModules++;
      }
      
      summary.modules.push({
        name,
        healthy: latest.healthy,
        status: latest.status,
        responseTime: latest.responseTime,
        lastCheck: latest.timestamp
      });
    }
    
    summary.averageResponseTime = summary.totalModules > 0 
      ? totalResponseTime / summary.totalModules 
      : 0;
    
    return summary;
  }
  
  async startMonitoring(intervalMs = 30000) {
    console.log(`🔄 Starting health monitoring (${intervalMs}ms interval)`);
    
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkAllModules();
      } catch (error) {
        console.error('Health monitoring error:', error);
      }
    }, intervalMs);
  }
  
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      console.log('🛑 Health monitoring stopped');
    }
  }
}

// Usage example
const healthMonitor = new ModuleHealthMonitor();

// Register modules
try {
  const { CveCoreNapi } = require('phantom-cve-core');
  healthMonitor.registerModule('cve-core', new CveCoreNapi());
} catch (error) {
  console.log('CVE Core not available');
}

try {
  const { CryptoCoreNapi } = require('phantom-crypto-core');
  healthMonitor.registerModule('crypto-core', new CryptoCoreNapi());
} catch (error) {
  console.log('Crypto Core not available');
}

// Set up alerts
healthMonitor.onAlert((moduleName, health) => {
  console.error(`🚨 ALERT: ${moduleName} is unhealthy - ${health.error || health.status}`);
});

// Start monitoring
healthMonitor.startMonitoring(10000); // Check every 10 seconds

// Get summary after some time
setTimeout(() => {
  const summary = healthMonitor.getHealthSummary();
  console.log('\n📊 Health Summary:', summary);
}, 5000);
```

### 2. Error Analysis Tool
```javascript
// error-analyzer.js
class ErrorAnalyzer {
  constructor() {
    this.errorLog = [];
    this.patterns = new Map();
    this.solutions = new Map();
    
    this.initializeSolutionDatabase();
  }
  
  logError(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      code: error.code,
      context,
      id: this.generateErrorId()
    };
    
    this.errorLog.push(errorEntry);
    this.analyzePattern(errorEntry);
    
    console.error(`🚨 Error logged [${errorEntry.id}]: ${error.message}`);
    
    return errorEntry.id;
  }
  
  analyzePattern(errorEntry) {
    // Extract pattern from error message
    const pattern = this.extractPattern(errorEntry.message);
    
    if (!this.patterns.has(pattern)) {
      this.patterns.set(pattern, []);
    }
    
    this.patterns.get(pattern).push(errorEntry);
    
    // Check for recurring patterns
    const occurrences = this.patterns.get(pattern).length;
    if (occurrences > 1 && occurrences % 5 === 0) {
      console.warn(`⚠️ Recurring error pattern detected: "${pattern}" (${occurrences} times)`);
      this.suggestSolution(pattern);
    }
  }
  
  extractPattern(message) {
    // Remove specific details to find patterns
    return message
      .replace(/CVE-\d{4}-\d+/g, 'CVE-XXXX-XXXX')
      .replace(/\d+/g, 'NUM')
      .replace(/[a-f0-9]{8,}/g, 'HASH')
      .replace(/\w+\.js:\d+/g, 'FILE:LINE');
  }
  
  suggestSolution(pattern) {
    const solution = this.solutions.get(pattern);
    if (solution) {
      console.log('💡 Suggested solution:');
      console.log(`   ${solution}`);
    }
  }
  
  initializeSolutionDatabase() {
    this.solutions.set(
      'Cannot find module \'phantom-*-core\'',
      'Install missing module: npm install <module-name>'
    );
    
    this.solutions.set(
      'Module not properly initialized',
      'Check module installation and try: npm rebuild <module-name>'
    );
    
    this.solutions.set(
      'Failed to build native addon',
      'Install build tools for your platform and run: npm rebuild'
    );
    
    this.solutions.set(
      'Invalid input format',
      'Ensure input data is properly formatted JSON string'
    );
    
    this.solutions.set(
      'Operation timed out',
      'Increase timeout value or check system performance'
    );
    
    this.solutions.set(
      'Serialization failed',
      'Check input data for circular references or invalid types'
    );
  }
  
  getErrorReport() {
    const report = {
      totalErrors: this.errorLog.length,
      uniquePatterns: this.patterns.size,
      topPatterns: [],
      recentErrors: this.errorLog.slice(-10),
      timeRange: {
        oldest: this.errorLog.length > 0 ? this.errorLog[0].timestamp : null,
        newest: this.errorLog.length > 0 ? this.errorLog[this.errorLog.length - 1].timestamp : null
      }
    };
    
    // Get top error patterns
    const patternCounts = Array.from(this.patterns.entries())
      .map(([pattern, errors]) => ({ pattern, count: errors.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    report.topPatterns = patternCounts;
    
    return report;
  }
  
  generateErrorId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  clearOldErrors(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoff = new Date(Date.now() - maxAge);
    const initialCount = this.errorLog.length;
    
    this.errorLog = this.errorLog.filter(error => 
      new Date(error.timestamp) > cutoff
    );
    
    const removed = initialCount - this.errorLog.length;
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} old error entries`);
    }
  }
}

// Global error analyzer instance
const errorAnalyzer = new ErrorAnalyzer();

// Wrap module operations with error analysis
function withErrorAnalysis(fn, context = {}) {
  return async function(...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      const errorId = errorAnalyzer.logError(error, {
        ...context,
        function: fn.name,
        arguments: args.length
      });
      
      // Re-throw with error ID
      error.errorId = errorId;
      throw error;
    }
  };
}

// Example usage
const { CveCoreNapi } = require('phantom-cve-core');
const cveCore = new CveCoreNapi();

// Wrap methods with error analysis
const processCveWithAnalysis = withErrorAnalysis(
  (data) => cveCore.processCve(data),
  { module: 'phantom-cve-core', method: 'processCve' }
);

// Use the wrapped function
processCveWithAnalysis('invalid data').catch(error => {
  console.log(`Error with ID ${error.errorId} occurred`);
});

// Get error report
setTimeout(() => {
  const report = errorAnalyzer.getErrorReport();
  console.log('\n📊 Error Analysis Report:', report);
}, 5000);
```

## 📋 Troubleshooting Checklist

### Pre-Deployment Checklist
- [ ] **System Requirements**
  - [ ] Node.js 16+ installed
  - [ ] npm 8+ installed
  - [ ] Platform build tools available
  - [ ] Sufficient memory (4GB+ recommended)

- [ ] **Module Installation**
  - [ ] All required modules installed
  - [ ] No installation errors
  - [ ] Native compilation successful
  - [ ] Module loading verification passes

- [ ] **Basic Functionality**
  - [ ] Module instantiation works
  - [ ] Health checks pass
  - [ ] Core methods callable
  - [ ] Error handling functional

### Runtime Monitoring Checklist
- [ ] **Performance Monitoring**
  - [ ] Response times within acceptable limits
  - [ ] Memory usage stable
  - [ ] No memory leaks detected
  - [ ] CPU usage reasonable

- [ ] **Error Monitoring**
  - [ ] Error rates below threshold
  - [ ] No recurring error patterns
  - [ ] Proper error logging
  - [ ] Alert mechanisms working

- [ ] **Health Monitoring**
  - [ ] Regular health checks
  - [ ] Module status tracking
  - [ ] Automatic recovery mechanisms
  - [ ] Escalation procedures defined

### Production Troubleshooting Checklist
- [ ] **Immediate Response**
  - [ ] Identify affected modules
  - [ ] Check system resources
  - [ ] Review recent error logs
  - [ ] Implement temporary workarounds

- [ ] **Diagnosis**
  - [ ] Run diagnostic scripts
  - [ ] Analyze error patterns
  - [ ] Check platform compatibility
  - [ ] Review configuration changes

- [ ] **Resolution**
  - [ ] Apply appropriate fixes
  - [ ] Test fix in staging
  - [ ] Deploy to production
  - [ ] Monitor for improvements

- [ ] **Post-Resolution**
  - [ ] Document issue and solution
  - [ ] Update monitoring rules
  - [ ] Improve error handling
  - [ ] Schedule preventive measures

---

## 🆘 Getting Additional Help

### Documentation Resources
- [Installation Guide](./NAPI_INSTALLATION_GUIDE.md)
- [API Reference](./NAPI_API_REFERENCE.md)
- [Integration Patterns](./NAPI_INTEGRATION_PATTERNS.md)
- [Testing Guide](./NAPI_TESTING_GUIDE.md)

### Community Support
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share experiences
- **Stack Overflow**: Tag questions with `phantom-spire` and `napi-rs`

### Professional Support
- **Enterprise Support**: Available for production deployments
- **Custom Integration**: Professional services for complex integrations
- **Training**: On-site and remote training available

---

*Troubleshooting Guide Version: 1.0.0*
*Last Updated: {{ current_date }}*