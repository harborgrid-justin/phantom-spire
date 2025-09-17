describe('Basic Navigation Test', () => {
  it('should visit the homepage', () => {
    cy.visit('/')
    cy.url().should('eq', 'http://localhost:3000/')
  })

  it('should navigate to dashboard', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/dashboard')
  })

  it('should navigate to data-explorer', () => {
    cy.visit('/data-explorer')
    cy.url().should('include', '/data-explorer')
  })

  it('should navigate to model-builder', () => {
    cy.visit('/model-builder')
    cy.url().should('include', '/model-builder')
  })

  it('should navigate to experiments', () => {
    cy.visit('/experiments')
    cy.url().should('include', '/experiments')
  })
})