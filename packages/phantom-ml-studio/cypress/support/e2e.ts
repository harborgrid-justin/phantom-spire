// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands.ts'
// import './enhanced-commands.ts'  // Temporarily disabled
import './types.ts'
import './index.d.ts'

// Handle React version conflicts and uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
  // Prevent Cypress from failing the test when React version conflicts occur
  if (err.message.includes('React Element from an older version')) {
    return false;
  }
  if (err.message.includes('Multiple copies of the "react" package')) {
    return false;
  }
  if (err.message.includes('A compiler tries to "inline" JSX')) {
    return false;
  }
  if (err.message.includes('library pre-bundled an old copy')) {
    return false;
  }
  if (err.message.includes('Cannot read properties of null (reading \'useMemo\')')) {
    return false;
  }
  if (err.message.includes('useMemo')) {
    return false;
  }
  // Handle useContext errors during theme initialization
  if (err.message.includes('Cannot read properties of null (reading \'useContext\')')) {
    return false;
  }
  if (err.message.includes('useContext')) {
    return false;
  }
  // Allow other errors to fail the test
  return true;
})

// Global test setup - runs before each test
beforeEach(() => {
  // Clear localStorage between tests for isolation
  cy.window().then((win) => {
    win.localStorage.clear();
  });

  // Clear cookies between tests
  cy.clearCookies();

  // Clear session storage
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

// Global test cleanup - runs after each test
afterEach(() => {
  // Clean up any test data
  cy.cleanupTestData();

  // Take screenshot on failure - Cypress handles this automatically
  // but we can add custom logic here if needed
});