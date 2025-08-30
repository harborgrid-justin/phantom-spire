#!/usr/bin/env node

/**
 * Enterprise IOC Engine Demo Runner
 * Showcases Phantom Spire's Palantir-competitive capabilities
 */

require('ts-node/register');
require('dotenv').config();

const { EnterpriseIOCDemo } = require('../src/examples/enterpriseIOCDemo');

console.log('🔥 PHANTOM SPIRE ENTERPRISE IOC ENGINE DEMO');
console.log('==================================================');
console.log('Demonstrating Palantir-competitive capabilities\n');

const demo = new EnterpriseIOCDemo();
demo.runDemo().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Demo failed:', error);
  process.exit(1);
});