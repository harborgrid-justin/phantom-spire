describe('Header Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the homepage successfully', () => {
    cy.url().should('eq', 'http://localhost:3008/')
    cy.get('body').should('be.visible')
  })

  it('should navigate to dashboard page', () => {
    cy.navigateToPage('/dashboard')
    cy.url().should('include', '/dashboard')
  })

  it('should navigate to data explorer page', () => {
    cy.navigateToPage('/dataExplorer')
    cy.url().should('include', '/dataExplorer')
  })

  it('should navigate to model builder page', () => {
    cy.navigateToPage('/modelBuilder')
    cy.url().should('include', '/modelBuilder')
  })

  it('should navigate to automl pipeline visualizer page', () => {
    cy.navigateToPage('/automlPipeline')
    cy.url().should('include', '/automlPipeline')
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
    cy.navigateToPage('/biasDetection')
    cy.url().should('include', '/biasDetection')
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