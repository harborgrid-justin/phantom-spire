/**
 * Cypress Plugins Configuration
 * Advanced Node-side logic for enterprise testing scenarios
 * Addresses R.12 requirement for plugins usage
 */

import { defineConfig } from 'cypress';

module.exports = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  // R.12: Custom cy.task implementations for advanced testing
  on('task', {
    // Database operations for integration testing
    seedDatabase(data: any) {
      console.log('Seeding test database with:', data);
      // In a real implementation, this would seed the database
      return Promise.resolve(data);
    },

    // File system operations
    writeTestFile({ path, content }: { path: string; content: string }) {
      const fs = require('fs');
      const pathModule = require('path');

      const fullPath = pathModule.resolve(path);
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
    makeApiRequest({ url, method, body, headers }: any) {
      const axios = require('axios');

      return axios({
        url,
        method: method || 'GET',
        data: body,
        headers: headers || {}
      }).then((response: any) => ({
        status: response.status,
        data: response.data,
        headers: response.headers
      })).catch((error: any) => ({
        status: error.response?.status || 500,
        error: error.message
      }));
    },

    // Test data generation
    generateTestData({ type, count }: { type: string; count: number }) {
      const faker = require('faker');

      const generators: Record<string, () => any> = {
        user: () => ({
          id: faker.datatype.uuid(),
          name: faker.name.findName(),
          email: faker.internet.email(),
          createdAt: faker.date.recent()
        }),
        model: () => ({
          id: faker.datatype.uuid(),
          name: faker.hacker.noun(),
          algorithm: faker.random.arrayElement(['random-forest', 'neural-network', 'svm']),
          accuracy: faker.datatype.float({ min: 0.7, max: 0.99, precision: 0.01 }),
          createdAt: faker.date.recent()
        }),
        dataset: () => ({
          id: faker.datatype.uuid(),
          name: faker.company.companyName() + ' Dataset',
          size: faker.datatype.number({ min: 1000, max: 1000000 }),
          format: faker.random.arrayElement(['csv', 'json', 'parquet']),
          createdAt: faker.date.recent()
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
      const fs = require('fs');
      const path = require('path');

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
    log(message: any) {
      console.log('[Cypress Task]', message);
      return null;
    },

    table(data: any) {
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

    // Generate performance report
    if (results.totalPassed && results.totalFailed !== undefined) {
      const successRate = (results.totalPassed / (results.totalPassed + results.totalFailed)) * 100;
      console.log(`Test Success Rate: ${successRate.toFixed(2)}%`);
    }
  });

  // R.34: Organized plugin structure - no business logic here
  return config;
};