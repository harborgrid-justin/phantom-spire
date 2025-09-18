import { defineConfig } from 'cypress';
import webpackPreprocessor from '@cypress/webpack-preprocessor';
import type { Configuration } from 'webpack';
import { cpus } from 'os';
import path from 'path';

// Determine optimal parallel configuration
const numCPUs = cpus().length;
const optimalWorkers = Math.max(2, Math.floor(numCPUs * 0.75));

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,

    // Enhanced retry configuration for reliability
    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Test isolation for better parallelization
    testIsolation: true,

    // Performance optimizations
    numTestsKeptInMemory: 5, // Reduce memory usage during parallel runs
    experimentalMemoryManagement: true,

    // Parallel execution configuration
    env: {
      coverage: true,
      codeCoverage: {
        exclude: ['cypress/**/*.*'],
      },
      parallelWorkers: optimalWorkers,
      parallelMode: true,
      testDataCaching: true,
      performanceMetrics: true,
    },

    setupNodeEvents(on, config) {
      // TypeScript and webpack preprocessing with optimizations
      const webpackOptions: Configuration = {
        mode: process.env.NODE_ENV === 'test' ? 'production' : 'development',
        cache: {
          type: 'filesystem',
          cacheDirectory: path.resolve(config.projectRoot, '.cypress-cache'),
        },
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              use: [
                {
                  loader: 'ts-loader',
                  options: {
                    transpileOnly: true, // Speed up compilation
                    experimentalWatchApi: true,
                    compilerOptions: {
                      module: 'esnext',
                      target: 'es2020',
                    },
                  },
                },
              ],
              exclude: /node_modules/,
            },
            {
              test: /\.js$/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {
                    cacheDirectory: true,
                    cacheCompression: false,
                  },
                },
              ],
              exclude: /node_modules/,
            },
          ],
        },
        resolve: {
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
          alias: {
            '@': config.projectRoot + '/src',
          },
        },
        optimization: {
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
        },
      };

      on('file:preprocessor', webpackPreprocessor({
        webpackOptions,
        watchOptions: {
          poll: false,
        },
      }));

      // Enhanced task management for parallel execution
      on('task', {
        // Database operations with connection pooling
        async seedDatabase(data?: Record<string, unknown>) {
          // Implement thread-safe database seeding
          const { seed } = await import('./cypress/support/database');
          return seed(data);
        },

        async clearDatabase() {
          // Implement thread-safe database cleanup
          const { clear } = await import('./cypress/support/database');
          return clear();
        },

        // Test data generation with caching
        async generateTestData(type?: string) {
          const { generateData } = await import('./cypress/support/testData');
          return generateData(type);
        },

        // Performance metrics collection
        async collectMetrics(metrics: Record<string, unknown>) {
          const { saveMetrics } = await import('./cypress/support/metrics');
          return saveMetrics(metrics);
        },

        // Parallel execution coordination
        async getWorkerInfo() {
          return {
            workerId: process.env.CYPRESS_WORKER_ID || '0',
            totalWorkers: config.env.parallelWorkers,
            nodeVersion: process.version,
            platform: process.platform,
            memory: process.memoryUsage(),
          };
        },

        // Test result aggregation
        async aggregateResults(results: unknown[]) {
          const { aggregate } = await import('./cypress/support/results');
          return aggregate(results as import('./cypress/support/results').TestResult[]);
        },

        log(message: string) {
          const timestamp = new Date().toISOString();
          console.log(`[${timestamp}] ${message}`);
          return null;
        },
      });

      // Before run hooks for optimization
      on('before:run', async (details) => {
        console.log('Starting test run with config:', {
          parallel: config.env.parallelMode,
          workers: config.env.parallelWorkers,
          browser: details.browser?.name,
        });
      });

      // After run hooks for cleanup and reporting
      on('after:run', async (results) => {
        if (config.env.performanceMetrics) {
          const { generateReport } = await import('./cypress/support/reporting');
          await generateReport(results);
        }
      });

      return config;
    },

    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',

    // Exclude patterns for optimization
    excludeSpecPattern: [
      '*.hot-update.js',
      '**/__tests__/**',
      '**/*.test.*',
      '**/*.spec.*',
    ],
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
      webpackConfig: {
        cache: {
          type: 'filesystem',
          cacheDirectory: path.resolve(process.cwd(), '.cypress-cache'),
        },
      },
    },

    setupNodeEvents(on, config) {
      // Component testing specific setup
      on('task', {
        async componentMetrics(metrics: Record<string, unknown>) {
          const { saveComponentMetrics } = await import('./cypress/support/componentMetrics');
          // Type assertion for metrics object
          const typedMetrics = {
            testName: metrics.testName as string,
            renderTime: metrics.renderTime as number,
            interactionTime: metrics.interactionTime as number,
            memoryUsage: metrics.memoryUsage as number,
            timestamp: new Date(metrics.timestamp as string | number | Date),
          };
          return saveComponentMetrics(typedMetrics);
        },
      });

      return config;
    },

    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',

    // Component testing specific optimizations
    experimentalSingleTabRunMode: true,
  },

  // Global configuration for all test types
  watchForFileChanges: false, // Disable in CI/CD
  chromeWebSecurity: false, // For cross-origin testing
  modifyObstructiveCode: false, // Performance improvement

  // Reporting configuration
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'spec, json, html',
    specReporterOptions: {
      displayStacktrace: 'all',
      displaySuccessfulSpec: true,
      displayFailedSpec: true,
      displayPendingSpec: true,
      displaySkippedSpec: true,
      displaySuiteNumber: true,
      displaySpecDuration: true,
    },
    jsonReporterOptions: {
      output: 'cypress/results/results.json',
    },
    htmlReporterOptions: {
      charts: true,
      reportPageTitle: 'Phantom ML Studio Test Report',
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
      outputPath: 'cypress/results/index.html',
    },
  },
});