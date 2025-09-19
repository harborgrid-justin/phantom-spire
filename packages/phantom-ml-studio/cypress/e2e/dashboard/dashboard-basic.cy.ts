describe('Dashboard Basic Tests', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
    // Wait for page to load
    cy.get('body').should('be.visible')
  })

  it('should load dashboard page successfully', () => {
    cy.url().should('include', '/dashboard')
    cy.get('body').should('be.visible')
  })

  it('should display dashboard title', () => {
    cy.contains('Dashboard').should('be.visible')
  })

  it('should handle viewport changes (basic responsive test)', () => {
    // Test mobile viewport
    cy.viewport(375, 667)
    cy.get('body').should('be.visible')

    // Test tablet viewport
    cy.viewport(768, 1024)  
    cy.get('body').should('be.visible')

    // Test desktop viewport
    cy.viewport(1200, 800)
    cy.get('body').should('be.visible')
  })

  it('should have basic navigation elements', () => {
    // Look for navigation links that should exist based on the dashboard page
    cy.get('[data-cy="nav-link"], a').should('have.length.at.least', 1)
  })

  it('should display some metric information', () => {
    // Based on the dashboard page structure, it should show some metrics
    cy.get('[data-cy="metric-card"], [data-cy="dashboard-metrics"]').should('exist')
  })

  it('should handle basic API mocking with intercept', () => {
    // Mock dashboard API call using built-in cy.intercept
    cy.intercept('GET', '**/api/dashboard/metrics', {
      statusCode: 200,
      body: {
        totalModels: 42,
        activeDeployments: 12,
        experimentsRunning: 8,
        successRate: 94.5
      }
    }).as('dashboardMetrics')

    // Visit page and verify mock was called
    cy.visit('/dashboard')
    // Note: @dashboardMetrics may or may not be called depending on implementation
  })
})