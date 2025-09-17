describe('Header Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the homepage successfully', () => {
    cy.url().should('eq', 'http://localhost:3003/')
    cy.get('body').should('be.visible')
  })

  it('should navigate to dashboard page', () => {
    cy.navigateToPage('/dashboard')
    cy.url().should('include', '/dashboard')
  })

  it('should navigate to data explorer page', () => {
    cy.navigateToPage('/data-explorer')
    cy.url().should('include', '/data-explorer')
  })

  it('should navigate to model builder page', () => {
    cy.navigateToPage('/model-builder')
    cy.url().should('include', '/model-builder')
  })

  it('should navigate to automl pipeline visualizer page', () => {
    cy.navigateToPage('/automl-pipeline-visualizer')
    cy.url().should('include', '/automl-pipeline-visualizer')
  })

  it('should navigate to experiments page', () => {
    cy.navigateToPage('/experiments')
    cy.url().should('include', '/experiments')
  })

  it('should navigate to deployments page', () => {
    cy.navigateToPage('/deployments')
    cy.url().should('include', '/deployments')
  })

  it('should navigate to bias detection engine page', () => {
    cy.navigateToPage('/bias-detection-engine')
    cy.url().should('include', '/bias-detection-engine')
  })

  it('should navigate to settings page', () => {
    cy.navigateToPage('/settings')
    cy.url().should('include', '/settings')
  })

  it('should handle page loads within reasonable time', () => {
    cy.visit('/dashboard')
    cy.measurePageLoad()
  })
})