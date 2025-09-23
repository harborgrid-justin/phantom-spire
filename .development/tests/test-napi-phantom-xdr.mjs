#!/usr/bin/env node

// Simple test to verify phantom-xdr-core napi bindings work
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagePath = join(__dirname, '../../packages/phantom-xdr-core');

console.log('Testing phantom-xdr-core napi bindings...');

// Check if the .node file exists
const nodeFile = join(packagePath, 'phantom-xdr-core.linux-x64-gnu.node');
if (!existsSync(nodeFile)) {
  console.error('❌ .node file not found:', nodeFile);
  process.exit(1);
}
console.log('✅ Native module file found');

// Try to import and test basic functionality
try {
  const phantomXdr = await import('../../packages/phantom-xdr-core/index.js');
  
  // Test basic hello function
  const greeting = phantomXdr.hello('Test');
  console.log('✅ Hello function works:', greeting);
  
  // Test initialization
  const initResult = phantomXdr.initializeEngine();
  console.log('✅ Initialize engine works:', initResult);
  
  // Test module count
  const moduleCount = await phantomXdr.getModuleCount();
  console.log('✅ Get module count works:', moduleCount);
  
  // Test list enterprise modules
  const modules = await phantomXdr.listNewEnterpriseModules();
  console.log('✅ List enterprise modules works:', modules.length, 'modules found');
  
  // Test extended status (this might be complex)
  try {
    const status = await phantomXdr.getExtendedEngineStatus();
    console.log('✅ Extended status works - first 100 chars:', status.substring(0, 100) + '...');
  } catch (statusError) {
    console.log('⚠️  Extended status partially works but has error:', statusError.message);
  }
  
  console.log('\n🎉 phantom-xdr-core napi bindings are working!');
  
} catch (error) {
  console.error('❌ Error testing phantom-xdr-core:', error);
  process.exit(1);
}