#!/usr/bin/env node

/**
 * Fortune 100 Service Center Demo Runner
 * Showcases the completed Fortune 100-grade centralized service center
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🏛️ Fortune 100 Centralized Service Center Demo');
console.log('=============================================');
console.log('');
console.log('This demo showcases the completed Fortune 100-grade centralized service center');
console.log('that orchestrates all platform modules with enterprise-grade capabilities.');
console.log('');

// Run the Fortune 100 demo
const demoPath = path.join(__dirname, 'src/examples/fortune100ServiceCenterCompleteDemo.ts');

console.log('Starting Fortune 100 demo...');
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