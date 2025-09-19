describe('Basic Navigation Flow', () => {
  beforeEach(() => {
    cy.log('Setting up test environment for navigation');
    cy.setupTestEnvironment('default');
    cy.visit('/');
  });

  it('should visit the homepage and verify content', () => {
    cy.log('Verifying homepage');
    cy.url().should('eq', 'http://localhost:3000/');
    cy.get('h1').should('be.visible');
  });

  it('should navigate to all main pages from the sidebar', () => {
    const pages = ['dashboard', 'data-explorer', 'model-builder', 'experiments'];

    pages.forEach(page => {
      cy.log(`Navigating to ${page}`);
      cy.navigateViaSidebar(page);
      cy.url().should('include', `/${page}`);
      cy.get('h1').should('be.visible').and('not.be.empty');
      cy.log(`${page} loaded successfully`);
    });
  });
});