describe('Sidebar Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should navigate between different pages using URL navigation', () => {
    // Test basic page navigation without relying on sidebar elements
    cy.navigateToPage('/dashboard')
    cy.url().should('include', '/dashboard')

    cy.navigateToPage('/data-explorer')
    cy.url().should('include', '/data-explorer')

    cy.navigateToPage('/model-builder')
    cy.url().should('include', '/model-builder')

    cy.navigateToPage('/experiments')
    cy.url().should('include', '/experiments')

    cy.navigateToPage('/deployments')
    cy.url().should('include', '/deployments')
  })

  it('should test additional ML Studio pages', () => {
    cy.navigateToPage('/automl-pipeline-visualizer')
    cy.url().should('include', '/automl-pipeline-visualizer')

    cy.navigateToPage('/bias-detection-engine')
    cy.url().should('include', '/bias-detection-engine')

    cy.navigateToPage('/explainable-ai-visualizer')
    cy.url().should('include', '/explainable-ai-visualizer')

    cy.navigateToPage('/interactive-feature-engineering')
    cy.url().should('include', '/interactive-feature-engineering')
  })

  it('should test monitoring and testing pages', () => {
    cy.navigateToPage('/multi-model-ab-testing')
    cy.url().should('include', '/multi-model-ab-testing')

    cy.navigateToPage('/real-time-monitoring')
    cy.url().should('include', '/real-time-monitoring')

    cy.navigateToPage('/threat-intelligence-marketplace')
    cy.url().should('include', '/threat-intelligence-marketplace')
  })

  it('should navigate to configuration pages', () => {
    cy.navigateToPage('/settings')
    cy.url().should('include', '/settings')

    cy.navigateToPage('/training-orchestrator')
    cy.url().should('include', '/training-orchestrator')
  })

  it('should handle navigation to models page', () => {
    cy.navigateToPage('/models')
    cy.url().should('include', '/models')
  })

  it('should check responsive behavior on different screen sizes', () => {
    cy.checkResponsiveDesign(['mobile', 'tablet', 'desktop'])
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