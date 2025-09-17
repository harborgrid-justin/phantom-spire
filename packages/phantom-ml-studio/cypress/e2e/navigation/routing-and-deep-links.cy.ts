describe('Routing and Deep Links', () => {
  const routes = [
    { path: '/dashboard', title: 'Dashboard' },
    { path: '/data-explorer', title: 'Data Explorer' },
    { path: '/model-builder', title: 'Model Builder' },
    { path: '/experiments', title: 'Experiments' },
    { path: '/deployments', title: 'Deployments' },
    { path: '/automl-pipeline-visualizer', title: 'AutoML Pipeline Visualizer' },
    { path: '/bias-detection-engine', title: 'Bias Detection Engine' },
    { path: '/explainable-ai-visualizer', title: 'Explainable AI Visualizer' },
    { path: '/interactive-feature-engineering', title: 'Interactive Feature Engineering' },
    { path: '/multi-model-ab-testing', title: 'Multi-Model A/B Testing' },
    { path: '/real-time-monitoring', title: 'Real-time Monitoring' },
    { path: '/threat-intelligence-marketplace', title: 'Threat Intelligence Marketplace' },
    { path: '/settings', title: 'Settings' }
  ]

  it('should handle direct navigation to all main routes', () => {
    routes.forEach(route => {
      cy.visit(route.path)
      cy.url().should('include', route.path)
      cy.get('[data-cy="page-loading"]').should('not.exist')
      cy.get('h1, h2, [data-cy*="title"]').should('be.visible')
    })
  })

  it('should handle deep links with parameters', () => {
    const deepLinks = [
      '/experiments/exp-123',
      '/models/model-456',
      '/deployments/deploy-789',
      '/data-explorer?dataset=test-data'
    ]

    deepLinks.forEach(link => {
      cy.visit(link)
      cy.url().should('include', link.split('?')[0])
      cy.get('[data-cy="page-loading"]').should('not.exist')
    })
  })

  it('should preserve query parameters in URLs', () => {
    cy.visit('/data-explorer?filter=csv&sort=name')
    cy.url().should('include', 'filter=csv')
    cy.url().should('include', 'sort=name')

    cy.navigateViaSidebar('dashboard')
    cy.navigateViaSidebar('data-explorer')
    cy.url().should('include', '/data-explorer')
  })

  it('should handle browser back and forward navigation', () => {
    cy.visit('/dashboard')
    cy.navigateToPage('/experiments')
    cy.navigateToPage('/models')

    cy.go('back')
    cy.url().should('include', '/experiments')

    cy.go('back')
    cy.url().should('include', '/dashboard')

    cy.go('forward')
    cy.url().should('include', '/experiments')
  })

  it('should redirect root path to dashboard', () => {
    cy.visit('/')
    cy.url().should('include', '/dashboard')
  })

  it('should handle 404 for invalid routes', () => {
    cy.visit('/invalid-route', { failOnStatusCode: false })
    cy.get('[data-cy="404-page"]').should('be.visible')
    cy.get('[data-cy="404-home-link"]').click()
    cy.url().should('include', '/dashboard')
  })

  it('should maintain active state in navigation for current route', () => {
    routes.slice(0, 5).forEach(route => {
      cy.visit(route.path)
      const menuItem = route.path.replace('/', '').replace('-', '-')
      cy.get(`[data-cy="sidebar-menu-${menuItem}"]`).should('have.class', 'active')
    })
  })
})