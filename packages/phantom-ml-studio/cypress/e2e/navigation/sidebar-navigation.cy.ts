describe('Sidebar Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should navigate between different pages using URL navigation', () => {
    // Test basic page navigation without relying on sidebar elements
    cy.navigateToPage('/dashboard')
    cy.url().should('include', '/dashboard')

    cy.navigateToPage('/dataExplorer')
    cy.url().should('include', '/dataExplorer')

    cy.navigateToPage('/modelBuilder')
    cy.url().should('include', '/modelBuilder')

    cy.navigateToPage('/experiments')
    cy.url().should('include', '/experiments')

    cy.navigateToPage('/deployments')
    cy.url().should('include', '/deployments')
  })

  it('should test additional ML Studio pages', () => {
    cy.navigateToPage('/automlPipeline')
    cy.url().should('include', '/automlPipeline')

    cy.navigateToPage('/biasDetection')
    cy.url().should('include', '/biasDetection')

    cy.navigateToPage('/explainableAi')
    cy.url().should('include', '/explainableAi')

    cy.navigateToPage('/featureEngineering')
    cy.url().should('include', '/featureEngineering')
  })

  it('should test monitoring and testing pages', () => {
    cy.navigateToPage('/abTesting')
    cy.url().should('include', '/abTesting')

    cy.navigateToPage('/monitoring')
    cy.url().should('include', '/monitoring')

    cy.navigateToPage('/threatIntelligence')
    cy.url().should('include', '/threatIntelligence')
  })

  it('should navigate to configuration pages', () => {
    cy.navigateToPage('/settings')
    cy.url().should('include', '/settings')

    cy.navigateToPage('/training')
    cy.url().should('include', '/training')

    cy.navigateToPage('/compliance')
    cy.url().should('include', '/compliance')
  })

  it('should handle navigation to models page', () => {
    cy.navigateToPage('/models')
    cy.url().should('include', '/models')
  })

  it('should test phantom cores integration pages', () => {
    cy.navigateToPage('/phantom-cores')
    cy.url().should('include', '/phantom-cores')

    cy.navigateToPage('/phantom-cores/xdr')
    cy.url().should('include', '/phantom-cores/xdr')

    cy.navigateToPage('/phantom-cores/compliance')
    cy.url().should('include', '/phantom-cores/compliance')

    cy.navigateToPage('/phantom-cores/verify')
    cy.url().should('include', '/phantom-cores/verify')
  })

  it('should check responsive behavior on different screen sizes', () => {
    cy.checkResponsiveDesign(['mobile', 'tablet', 'desktop'])
  })

  it('should test sidebar interactions', () => {
    // Test that sidebar exists
    cy.get('[data-cy="nav-sidebar"]').should('be.visible')

    // Test navigation sections
    cy.get('[data-cy="nav-section-core"]').should('be.visible')
    cy.get('[data-cy="nav-section-advanced"]').should('be.visible')
    cy.get('[data-cy="nav-section-security"]').should('be.visible')
    cy.get('[data-cy="nav-section-phantom-cores"]').should('be.visible')
    cy.get('[data-cy="nav-section-system"]').should('be.visible')

    // Test clicking navigation links
    cy.get('[data-cy="nav-link-data-explorer"]').click()
    cy.url().should('include', '/dataExplorer')

    cy.get('[data-cy="nav-link-automl-builder"]').click()
    cy.url().should('include', '/modelBuilder')
  })

  it('should handle browser back and forward navigation', () => {
    cy.navigateToPage('/dashboard')
    cy.navigateToPage('/experiments')

    cy.go('back')
    cy.url().should('include', '/dashboard')

    cy.go('forward')
    cy.url().should('include', '/experiments')
  })
})