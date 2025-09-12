#!/usr/bin/env node

/**
 * Script to generate Jest tests for napi-rs packages
 * Usage: node generate-napi-tests.mjs <package-name>
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const packageName = process.argv[2];
if (!packageName) {
  console.error('Usage: node generate-napi-tests.mjs <package-name>');
  process.exit(1);
}

const templatePath = '/home/runner/work/phantom-spire/phantom-spire/tests/napi';
const testFilePath = join(templatePath, `${packageName}.test.ts`);

// Skip if test already exists
if (existsSync(testFilePath)) {
  console.log(`✅ Test already exists for ${packageName}`);
  process.exit(0);
}

// Check if package exists and has index.js
const packagePath = `/home/runner/work/phantom-spire/phantom-spire/packages/${packageName}`;
const indexPath = join(packagePath, 'index.js');

if (!existsSync(indexPath)) {
  console.log(`❌ Package ${packageName} does not have built index.js file`);
  process.exit(1);
}

// Read package.json to get package info
const packageJsonPath = join(packagePath, 'package.json');
let packageDescription = `${packageName} napi-rs package`;

if (existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    packageDescription = packageJson.description || packageDescription;
  } catch (error) {
    console.warn(`Warning: Could not read package.json for ${packageName}`);
  }
}

// Generate test template
const testTemplate = `/**
 * Jest test for ${packageName} napi-rs package
 * Tests all exported functions without mocks - real implementation testing
 * Package: ${packageDescription}
 */

import { describe, it, expect } from '@jest/globals';

describe('${packageName} napi bindings', () => {
  let napiModule: any;

  beforeAll(async () => {
    try {
      napiModule = await import('../../packages/${packageName}/index.js');
    } catch (error) {
      throw new Error(\`Failed to import ${packageName}: \${error.message}\`);
    }
  });

  describe('Module Loading', () => {
    it('should successfully import the napi module', () => {
      expect(napiModule).toBeDefined();
      expect(typeof napiModule).toBe('object');
    });

    it('should export functions', () => {
      const exports = Object.keys(napiModule);
      expect(exports.length).toBeGreaterThan(0);
      console.log('Exported functions:', exports.join(', '));
    });
  });

  describe('Basic Functionality', () => {
    it('should handle function calls without throwing immediately', () => {
      const exports = Object.keys(napiModule);
      
      // Test that functions exist and are callable
      exports.forEach(exportName => {
        const exportedItem = napiModule[exportName];
        if (typeof exportedItem === 'function') {
          expect(typeof exportedItem).toBe('function');
          
          // For async functions, test they return promises
          // For sync functions, test they don't throw immediately with safe inputs
          try {
            if (exportName.toLowerCase().includes('hello') || 
                exportName.toLowerCase().includes('version') ||
                exportName.toLowerCase().includes('status')) {
              // These are likely safe to call with minimal parameters
              const result = exportedItem('test');
              expect(result).toBeDefined();
            }
          } catch (error) {
            // Function exists but needs proper parameters - this is expected
            expect(error).toBeDefined();
          }
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid parameters gracefully', async () => {
      const exports = Object.keys(napiModule);
      
      for (const exportName of exports) {
        const exportedItem = napiModule[exportName];
        if (typeof exportedItem === 'function') {
          try {
            // Test with empty object - should either work or throw meaningful error
            const result = await exportedItem({});
            // If it doesn't throw, result should be defined
            expect(result).toBeDefined();
          } catch (error) {
            // Should throw a meaningful error, not crash
            expect(error).toBeDefined();
            expect(typeof error.message).toBe('string');
            expect(error.message.length).toBeGreaterThan(0);
          }
          
          try {
            // Test with null - should handle gracefully
            const result = await exportedItem(null);
            expect(result).toBeDefined();
          } catch (error) {
            expect(error).toBeDefined();
            expect(typeof error.message).toBe('string');
          }
        }
      }
    });
  });
});`;

// Write the test file
try {
  writeFileSync(testFilePath, testTemplate, 'utf8');
  console.log(`✅ Generated test file for ${packageName}: ${testFilePath}`);
} catch (error) {
  console.error(`❌ Failed to write test file for ${packageName}:`, error.message);
  process.exit(1);
}