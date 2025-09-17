describe('Breadcrumb Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display breadcrumbs on dashboard page', () => {
    cy.navigateToPage('/dashboard')
    cy.get('[data-cy="breadcrumbs"]').should('be.visible')
    cy.get('[data-cy="breadcrumb-item"]').should('have.length', 1)
    cy.get('[data-cy="breadcrumb-item"]').first().should('contain', 'Dashboard')
  })

  it('should display correct breadcrumbs on model builder page', () => {
    cy.navigateToPage('/model-builder')
    cy.get('[data-cy="breadcrumbs"]').should('be.visible')
    cy.get('[data-cy="breadcrumb-item"]').should('contain', 'Model Builder')
  })

  it('should display hierarchical breadcrumbs for nested pages', () => {
    cy.navigateToPage('/experiments/create')
    cy.get('[data-cy="breadcrumbs"]').should('be.visible')
    cy.get('[data-cy="breadcrumb-item"]').should('have.length.at.least', 2)
    cy.get('[data-cy="breadcrumb-item"]').eq(0).should('contain', 'Experiments')
    cy.get('[data-cy="breadcrumb-item"]').eq(1).should('contain', 'Create')
  })

  it('should navigate to parent page when breadcrumb is clicked', () => {
    cy.navigateToPage('/experiments/exp-123/results')
    cy.get('[data-cy="breadcrumb-item"]').contains('Experiments').click()
    cy.url().should('include', '/experiments')
  })

  it('should show home icon in breadcrumbs', () => {
    cy.navigateToPage('/data-explorer')
    cy.get('[data-cy="breadcrumb-home"]').should('be.visible')
    cy.get('[data-cy="breadcrumb-home"]').click()
    cy.url().should('include', '/dashboard')
  })
})