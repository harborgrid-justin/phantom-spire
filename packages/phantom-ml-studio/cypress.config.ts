import { defineConfig } from 'cypress';
const webpackPreprocessor = require('@cypress/webpack-preprocessor');

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3004',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    env: {
      coverage: true,
      codeCoverage: {
        exclude: ['cypress/**/*.*'],
      },
    },
    setupNodeEvents(on, config) {
      // TypeScript and webpack preprocessing
      const webpackOptions = {
        mode: 'development',
        module: {
          rules: [
            {
              test: /\.js$/,
              use: 'babel-loader',
              exclude: /node_modules/,
            },
          ],
        },
        resolve: {
          extensions: ['.js'],
        },
      };
      on('file:preprocessor', webpackPreprocessor({ webpackOptions }));

      // Task for seeding test data
      on('task', {
        seedDatabase() {
          // Implement database seeding logic
          return null;
        },
        clearDatabase() {
          // Implement database cleanup logic
          return null;
        },
        generateTestData(options) {
          // Generate dynamic test data
          return { data: 'test-data' };
        },
        log(message) {
          console.log(message);
          return null;
        },
      });

      return config;
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    setupNodeEvents(on, config) {
      return config;
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
});
