#!/usr/bin/env node

/**
 * Quick Demo Runner for Enterprise Service Bus and Service Mesh
 * Run this script to see the Fortune 100-Grade integration in action
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Fortune 100-Grade Enterprise Service Bus and Service Mesh Demo');
console.log('================================================================');
console.log('');
console.log('This demo showcases the integrated Enterprise Service Bus and Service Mesh');
console.log('architecture implemented for the Phantom Spire CTI platform.');
console.log('');

// Run the demo
const demoPath = path.join(__dirname, 'src/examples/enterprise-integration/enterpriseIntegrationDemo.ts');

console.log('Starting demo...');
console.log('');

exec(`npx ts-node ${demoPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error('Demo execution error:', error);
    return;
  }
  
  if (stderr) {
    console.error('Demo stderr:', stderr);
  }
  
  console.log(stdout);
});