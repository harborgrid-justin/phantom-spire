import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      const webpackPreprocessor = require('@cypress/webpack-preprocessor')
      const webpackOptions = require('./cypress/webpack.config.js')
      on('file:preprocessor', webpackPreprocessor({ webpackOptions }))
      return config
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
})

