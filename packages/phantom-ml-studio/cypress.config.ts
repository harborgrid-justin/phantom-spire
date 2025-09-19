import { defineConfig } from 'cypress'
import webpackPreprocessor from '@cypress/webpack-preprocessor'
import webpackOptions from './cypress/webpack.config.js'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      on('file:preprocessor', webpackPreprocessor({ webpackOptions }))

      // Add task for cy.task() usage
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        table(message) {
          console.table(message)
          return null
        }
      })

      return config
    },
    // Test retries for unstable scenarios
    retries: {
      runMode: 2,
      openMode: 0
    },
    // Watch for file changes during development
    watchForFileChanges: true,
    // Default command timeout
    defaultCommandTimeout: 10000,
    // Request timeout
    requestTimeout: 10000,
    // Response timeout
    responseTimeout: 10000,
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    // Video recording settings
    video: true,
    videoCompression: 32,
    // Screenshot settings
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    // Downloads folder
    downloadsFolder: 'cypress/downloads',
    // Videos folder
    videosFolder: 'cypress/videos',
    // Reporter configuration for comprehensive test reporting
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      configFile: 'cypress/reporter-config.json',
    },
    // Environment variables
    env: {
      API_URL: 'http://localhost:3000/api',
      TEST_ENV: 'development',
      // R.20: Documented test configuration
      ENABLE_SSR_TESTING: true,
      ENABLE_API_TESTING: true,
      ENABLE_PERFORMANCE_TESTING: true
    },
    // R.47: Browser compatibility testing configuration
    browsers: ['chrome', 'firefox', 'edge']
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    // Component test specific settings
    retries: {
      runMode: 1,
      openMode: 0
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    screenshotOnRunFailure: true,
    video: false
  },
  // Global settings
  chromeWebSecurity: false,
  experimentalStudio: true,
  experimentalWebKitSupport: true,
  experimentalModifyObstructiveThirdPartyCode: true
})

