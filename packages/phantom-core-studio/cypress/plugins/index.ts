/**
 * Cypress Plugins Configuration
 * Advanced Node-side logic for enterprise testing scenarios
 * Addresses R.12 requirement for plugins usage
 */

import { defineConfig } from 'cypress';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

interface ApiRequestOptions {
  url: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

interface TestDataGenerator {
  type: string;
  count: number;
}

interface TestDataItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

// Using dynamic import to avoid require() for faker
async function getFaker(): Promise<Record<string, unknown> | null> {
  try {
    return await import('faker');
  } catch {
    return null;
  }
}

module.exports = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  // R.12: Custom cy.task implementations for advanced testing
  on('task', {
    // Database operations for integration testing
    seedDatabase(data: Record<string, unknown>) {
      console.log('Seeding test database with:', data);
      // In a real implementation, this would seed the database
      return Promise.resolve(data);
    },

    // File system operations
    writeTestFile({ path: filePath, content }: { path: string; content: string }) {
      const fullPath = path.resolve(filePath);
      fs.writeFileSync(fullPath, content);

      return Promise.resolve({ path: fullPath, size: content.length });
    },

    // Environment management
    setEnvironmentVariables(vars: Record<string, string>) {
      Object.entries(vars).forEach(([key, value]) => {
        process.env[key] = value;
      });
      return Promise.resolve(vars);
    },

    // Performance monitoring
    measureMemoryUsage() {
      const used = process.memoryUsage();
      return Promise.resolve({
        rss: used.rss,
        heapTotal: used.heapTotal,
        heapUsed: used.heapUsed,
        external: used.external
      });
    },

    // API testing utilities
    makeApiRequest(options: ApiRequestOptions) {
      return axios({
        url: options.url,
        method: options.method || 'GET',
        data: options.body,
        headers: options.headers || {}
      }).then((response) => ({
        status: response.status,
        data: response.data,
        headers: response.headers
      })).catch((error) => ({
        status: error.response?.status || 500,
        error: error.message
      }));
    },

    // Test data generation
    generateTestData({ type, count }: { type: string; count: number }) {
      const generators: Record<string, () => TestDataItem> = {
        user: () => ({
          id: `user-${Math.random().toString(36).substr(2, 9)}`,
          name: `Test User ${Math.floor(Math.random() * 1000)}`,
          email: `test${Math.floor(Math.random() * 1000)}@example.com`,
          createdAt: new Date().toISOString()
        }),
        model: () => ({
          id: `model-${Math.random().toString(36).substr(2, 9)}`,
          name: `Test Model ${Math.floor(Math.random() * 1000)}`,
          algorithm: ['random-forest', 'neural-network', 'svm'][Math.floor(Math.random() * 3)],
          accuracy: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
          createdAt: new Date().toISOString()
        }),
        dataset: () => ({
          id: `dataset-${Math.random().toString(36).substr(2, 9)}`,
          name: `Test Dataset ${Math.floor(Math.random() * 1000)}`,
          size: Math.floor(Math.random() * 999000) + 1000, // 1000 to 1000000
          format: ['csv', 'json', 'parquet'][Math.floor(Math.random() * 3)],
          createdAt: new Date().toISOString()
        })
      };

      const generator = generators[type];
      if (!generator) {
        throw new Error(`Unknown test data type: ${type}`);
      }

      return Promise.resolve(Array.from({ length: count }, generator));
    },

    // Cleanup operations
    cleanupTestArtifacts() {
      const artifactDirs = [
        'cypress/downloads',
        'cypress/screenshots',
        'cypress/videos'
      ];

      artifactDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          files.forEach((file: string) => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isFile()) {
              fs.unlinkSync(filePath);
            }
          });
        }
      });

      return Promise.resolve({ cleaned: artifactDirs });
    },

    // Log aggregation
    log(message: unknown) {
      console.log('[Cypress Task]', message);
      return null;
    },

    table(data: unknown) {
      console.table(data);
      return null;
    }
  });

  // R.33: Plugin preprocessing for advanced scenarios
  on('before:browser:launch', (browser, launchOptions) => {
    // Configure browser launch options for enterprise testing
    if (browser.name === 'chrome') {
      launchOptions.args.push('--disable-web-security');
      launchOptions.args.push('--disable-features=VizDisplayCompositor');
    }

    return launchOptions;
  });

  // Performance monitoring
  on('before:run', (details) => {
    console.log('Starting Cypress run with details:', details);
  });

  on('after:run', (results) => {
    console.log('Cypress run completed:', results);

    // Generate performance report for successful runs only
    if ('totalPassed' in results && 'totalFailed' in results) {
      const successRate = (results.totalPassed / (results.totalPassed + results.totalFailed)) * 100;
      console.log(`Test Success Rate: ${successRate.toFixed(2)}%`);
    }
  });

  // R.34: Organized plugin structure - no business logic here
  return config;
};
