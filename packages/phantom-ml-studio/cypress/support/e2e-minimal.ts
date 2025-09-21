// ***********************************************************
// Minimal e2e support file for debugging
// ***********************************************************

// Import custom commands
import './commands.ts'

// Basic imports only
import 'cypress-axe'

// Basic uncaught exception handling
Cypress.on('uncaught:exception', (err) => {
  // Prevent Cypress from failing on common React issues
  if (err.message.includes('React') || err.message.includes('useMemo') || err.message.includes('useContext')) {
    return false;
  }
  return true;
})

// Basic test cleanup
beforeEach(() => {
  cy.clearCookies();
});
