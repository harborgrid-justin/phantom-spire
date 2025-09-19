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

      /**
       * Tests authentication flows for different user types
       * @param userType - Type of user: 'admin', 'user', 'guest'
       */
      testAuthenticationFlow(userType?: 'admin' | 'user' | 'guest'): Chainable<void>;

      /**
       * Tests cross-browser compatibility for specific features
       * @param features - Array of features to test
       */
      testCrossBrowserCompatibility(features: string[]): Chainable<void>;

      /**
       * Tests Next.js specific features like App Router, hydration, etc.
       */
      testNextJSFeatures(): Chainable<void>;

      /**
       * Uses advanced Cypress tasks for testing
       */
      useAdvancedTasks(): Chainable<void>;

      /**
       * Navigation commands
       */
      navigateToPage(pagePath: string): Chainable<void>;
      navigateViaSidebar(menuItem: string): Chainable<void>;

      /**
       * Model management commands
       */
      createModel(modelName: string, algorithm?: string): Chainable<void>;
      trainModel(modelId: string): Chainable<void>;
      deployModel(modelId: string, environment?: string): Chainable<void>;

      /**
       * Chart and visualization commands
       */
      waitForChart(chartSelector?: string, timeout?: number): Chainable<void>;
      validateChartData(expectedDataPoints: unknown[]): Chainable<void>;

      /**
       * Form validation commands
       */
      fillForm(formData: Record<string, unknown>): Chainable<void>;
      validateFormErrors(expectedErrors: string[]): Chainable<void>;
      submitFormAndVerify(expectedResult: string): Chainable<void>;

      /**
       * Accessibility commands
       */
      checkA11y(context?: string, options?: { rules?: Record<string, { enabled: boolean }> }): Chainable<void>;
      checkColorContrast(): Chainable<void>;

      /**
       * Performance commands
       */
      measurePageLoad(): Chainable<void>;
      checkResponsiveDesign(breakpoints: string[]): Chainable<void>;

      /**
       * Data table commands
       */
      sortDataTable(column: string, direction: 'asc' | 'desc'): Chainable<void>;
      filterDataTable(column: string, value: string): Chainable<void>;
      exportTableData(format: string): Chainable<void>;

      /**
       * Modal and dialog commands
       */
      openModal(modalType: string): Chainable<void>;
      closeModal(): Chainable<void>;
      confirmDialog(action: 'accept' | 'cancel'): Chainable<void>;

      /**
       * Keyboard navigation commands
       */
      tab(): Chainable<Element>;
      pressKey(key: string): Chainable<Element>;
    }
  }
}

export {};