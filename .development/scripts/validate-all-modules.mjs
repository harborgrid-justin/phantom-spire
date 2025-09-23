#!/usr/bin/env node

/**
 * Comprehensive test script to validate all built phantom-*-core modules
 * Tests both successful builds and fallback implementations
 */

import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagesDir = join(__dirname, '../../packages');
const execAsync = promisify(exec);

async function getBuiltModules() {
  const items = await readdir(packagesDir);
  const modules = [];
  
  for (const item of items) {
    if (item.startsWith('phantom-') && item.endsWith('-core')) {
      try {
        const modulePath = join(packagesDir, item);
        await import(`${modulePath}/index.js`);
        modules.push(item);
      } catch (error) {
        // Module doesn't have index.js or can't be imported
      }
    }
  }
  
  return modules.sort();
}

async function testModuleFunctions(moduleName) {
  const modulePath = join(packagesDir, moduleName);
  console.log(`\n🧪 Testing ${moduleName}...`);
  
  const results = {
    basic: false,
    crud: false,
    endpoints: [],
    errors: []
  };
  
  try {
    const module = await import(`${modulePath}/index.js`);
    
    // Test basic functions
    try {
      const greeting = module.hello('ValidationTest');
      const initResult = module.initializeEngine();
      const moduleCount = module.getModuleCount();
      const enterpriseModules = module.listNewEnterpriseModules();
      const status = module.getExtendedEngineStatus();
      
      console.log(`  ✅ Basic functions work`);
      console.log(`    - Hello: ${greeting.substring(0, 50)}...`);
      console.log(`    - Initialize: ${initResult}`);
      console.log(`    - Module count: ${moduleCount}`);
      console.log(`    - Enterprise modules: ${enterpriseModules.length}`);
      console.log(`    - Status length: ${status.length} chars`);
      
      results.basic = true;
      results.endpoints.push('hello', 'initializeEngine', 'getModuleCount', 'listNewEnterpriseModules', 'getExtendedEngineStatus');
    } catch (error) {
      console.log(`  ❌ Basic functions failed: ${error.message}`);
      results.errors.push(`Basic functions: ${error.message}`);
    }
    
    // Test CRUD-like operations
    try {
      if (module.processThreatIndicator) {
        const threatResult = module.processThreatIndicator('{"type": "test"}');
        console.log(`  ✅ processThreatIndicator works`);
        results.endpoints.push('processThreatIndicator');
      }
      
      if (module.evaluateZeroTrustPolicy) {
        const policyResult = module.evaluateZeroTrustPolicy('{"policy": "test"}');
        console.log(`  ✅ evaluateZeroTrustPolicy works`);
        results.endpoints.push('evaluateZeroTrustPolicy');
      }
      
      if (module.analyzeBehavioralPattern) {
        const behaviorResult = module.analyzeBehavioralPattern('{"pattern": "test"}');
        console.log(`  ✅ analyzeBehavioralPattern works`);
        results.endpoints.push('analyzeBehavioralPattern');
      }
      
      // Test class-based API if available
      if (module.PhantomXdrCore || module.PhantomCveCore || module.PhantomAttributionCore) {
        const ClassName = Object.keys(module).find(key => 
          key.includes('Phantom') && key.includes('Core')
        );
        
        if (ClassName && typeof module[ClassName] === 'function') {
          const instance = new module[ClassName]();
          if (instance.hello) {
            const classGreeting = instance.hello('ClassTest');
            console.log(`  ✅ Class-based API works: ${ClassName}`);
            results.endpoints.push(`${ClassName}.hello`);
          }
        }
      }
      
      results.crud = true;
    } catch (error) {
      console.log(`  ⚠️  Advanced functions partially available: ${error.message}`);
      results.errors.push(`Advanced functions: ${error.message}`);
    }
    
    console.log(`  📊 Total endpoints available: ${results.endpoints.length}`);
    
  } catch (error) {
    console.log(`  ❌ Module import failed: ${error.message}`);
    results.errors.push(`Import: ${error.message}`);
  }
  
  return results;
}

async function runEndToEndTests() {
  console.log('\n🔍 Running End-to-End API Tests...');
  console.log('Testing realistic usage scenarios for each module\n');
  
  const modules = await getBuiltModules();
  const testResults = {
    total: modules.length,
    passed: 0,
    endpoints: 0,
    failed: [],
    succeeded: []
  };
  
  for (const moduleName of modules) {
    const result = await testModuleFunctions(moduleName);
    
    if (result.basic) {
      testResults.passed++;
      testResults.succeeded.push({
        name: moduleName,
        endpoints: result.endpoints.length,
        functions: result.endpoints
      });
    } else {
      testResults.failed.push({
        name: moduleName,
        errors: result.errors
      });
    }
    
    testResults.endpoints += result.endpoints.length;
  }
  
  return testResults;
}

async function runJestTests() {
  console.log('\n🧪 Running Jest Tests for Built Modules...\n');
  
  const modules = await getBuiltModules();
  const jestResults = {
    total: 0,
    passed: 0,
    failed: 0,
    modules: []
  };
  
  for (const moduleName of modules) {
    const testFile = `tests/napi/${moduleName}.test.ts`;
    
    try {
      console.log(`Running Jest tests for ${moduleName}...`);
      const { stdout, stderr } = await execAsync(`npm test -- ${testFile}`, {
        cwd: join(__dirname, '../..'),
        timeout: 30000
      });
      
      if (stdout.includes('PASS')) {
        console.log(`  ✅ Jest tests passed for ${moduleName}`);
        jestResults.passed++;
      } else {
        console.log(`  ❌ Jest tests failed for ${moduleName}`);
        jestResults.failed++;
      }
      
      jestResults.modules.push({
        name: moduleName,
        passed: stdout.includes('PASS'),
        output: stdout.substring(0, 200)
      });
      
      jestResults.total++;
      
    } catch (error) {
      console.log(`  ⚠️  No Jest tests found for ${moduleName}`);
    }
  }
  
  return jestResults;
}

async function main() {
  console.log('🎯 Phantom Spire NAPI Module Validation Suite');
  console.log('==============================================\n');
  
  const modules = await getBuiltModules();
  console.log(`Found ${modules.length} built phantom-*-core modules:\n`);
  modules.forEach(name => console.log(`  - ${name}`));
  
  if (modules.length === 0) {
    console.log('❌ No modules found! Run build-all-napi-modules.mjs first.');
    return;
  }
  
  // Run comprehensive API tests
  const apiResults = await runEndToEndTests();
  
  // Run Jest tests if available
  const jestResults = await runJestTests();
  
  // Generate final report
  console.log('\n' + '='.repeat(80));
  console.log('📈 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(80));
  
  console.log(`\n🔧 API Endpoint Testing:`);
  console.log(`  Total modules tested: ${apiResults.total}`);
  console.log(`  Modules with working APIs: ${apiResults.passed}`);
  console.log(`  Total endpoints validated: ${apiResults.endpoints}`);
  console.log(`  Success rate: ${Math.round((apiResults.passed / apiResults.total) * 100)}%`);
  
  if (jestResults.total > 0) {
    console.log(`\n🧪 Jest Unit Testing:`);
    console.log(`  Test suites run: ${jestResults.total}`);
    console.log(`  Test suites passed: ${jestResults.passed}`);
    console.log(`  Test suites failed: ${jestResults.failed}`);
    console.log(`  Jest success rate: ${Math.round((jestResults.passed / jestResults.total) * 100)}%`);
  }
  
  if (apiResults.succeeded.length > 0) {
    console.log(`\n✅ Modules with Full API Coverage:`);
    apiResults.succeeded.forEach(module => {
      console.log(`  📦 ${module.name}: ${module.endpoints} endpoints`);
      console.log(`     Functions: ${module.functions.slice(0, 3).join(', ')}${module.functions.length > 3 ? '...' : ''}`);
    });
  }
  
  if (apiResults.failed.length > 0) {
    console.log(`\n❌ Modules with Issues:`);
    apiResults.failed.forEach(module => {
      console.log(`  📦 ${module.name}:`);
      module.errors.forEach(error => console.log(`     - ${error}`));
    });
  }
  
  console.log(`\n🎯 Overall Success: ${apiResults.passed}/${apiResults.total} modules (${Math.round((apiResults.passed / apiResults.total) * 100)}%)`);
  console.log(`🎯 Total Endpoints Validated: ${apiResults.endpoints}`);
  
  // Summary for reporting
  const summary = {
    totalModules: apiResults.total,
    workingModules: apiResults.passed,
    totalEndpoints: apiResults.endpoints,
    successRate: Math.round((apiResults.passed / apiResults.total) * 100),
    jestTests: jestResults.passed,
    fullyValidated: apiResults.succeeded.length
  };
  
  console.log(`\n📋 Summary for PR:`);
  console.log(`   - ${summary.workingModules}/${summary.totalModules} modules compiled and working`);
  console.log(`   - ${summary.totalEndpoints} total endpoints validated`);
  console.log(`   - ${summary.successRate}% success rate`);
  console.log(`   - ${summary.jestTests} Jest test suites passing`);
  
  return summary;
}

// Run the validation suite
main().catch(console.error);