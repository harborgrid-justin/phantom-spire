describe('Basic Navigation Flow', () => {
  beforeEach(() => {
    cy.log('Setting up test environment for navigation');
    cy.setupTestEnvironment('default');
    cy.visit('/');
  });

  it('should visit the homepage and verify content', () => {
    cy.log('Verifying homepage');
    cy.url().should('eq', 'http://localhost:3000/');
    cy.get('[data-cy="nav-title"]').should('be.visible').and('contain', 'Phantom ML');
  });

  it('should navigate to all main pages via direct URL', () => {
    const pages = [
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/dataExplorer', name: 'Data Explorer' },
      { path: '/modelBuilder', name: 'AutoML Builder' },
      { path: '/experiments', name: 'Experiments' },
      { path: '/models', name: 'Models' },
      { path: '/deployments', name: 'Deployments' }
    ];

    pages.forEach(page => {
      cy.log(`Navigating to ${page.name}`);
      cy.visit(page.path);
      cy.url().should('include', page.path);
      // Wait for any loading states to complete
      cy.get('[data-cy="page-loading"]').should('not.exist');
      cy.log(`${page.name} loaded successfully`);
    });
  });

  it('should navigate via sidebar navigation', () => {
    // Test sidebar navigation exists and is functional
    cy.get('[data-cy="nav-sidebar"]').should('be.visible');
    cy.get('[data-cy="nav-link-dashboard"]').should('be.visible');

    // Click on a navigation item
    cy.get('[data-cy="nav-link-dashboard"]').click();
    cy.url().should('include', '/');

    // Navigate to data explorer
    cy.get('[data-cy="nav-link-data-explorer"]').click();
    cy.url().should('include', '/dataExplorer');
  });
});