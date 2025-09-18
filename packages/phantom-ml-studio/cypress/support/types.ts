/// <reference types="cypress" />

// Type declarations for custom Cypress commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Sets up test environment with mocked APIs and test data
       * @param environment - Environment type: 'default', 'ml-models', 'dashboard'
       */
      setupTestEnvironment(environment?: string): Chainable<void>;
      
      /**
       * Uploads a file to a file input element
       * @param filePath - Path to the file to upload
       * @param inputSelector - Selector for the file input element
       */
      uploadFile(filePath: string, inputSelector: string): Chainable<void>;
    }
  }
}

export {};