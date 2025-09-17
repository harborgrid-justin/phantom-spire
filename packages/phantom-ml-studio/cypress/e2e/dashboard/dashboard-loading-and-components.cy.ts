describe('Dashboard Loading and Components', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
  })

  it('should load dashboard page successfully', () => {
    cy.url().should('include', '/dashboard')
    cy.get('body').should('be.visible')
  })

  it('should handle basic page interactions', () => {
    // Test that page is responsive
    cy.get('body').should('be.visible')

    // Test viewport changes
    cy.viewport(375, 667) // Mobile
    cy.get('body').should('be.visible')

    cy.viewport(768, 1024) // Tablet
    cy.get('body').should('be.visible')

    cy.viewport(1200, 800) // Desktop
    cy.get('body').should('be.visible')
  })

  it('should measure page performance', () => {
    cy.measurePageLoad()
  })

  it('should mock dashboard API calls', () => {
    cy.mockApiResponse('**/api/dashboard/metrics', {
      totalModels: 42,
      activeDeployments: 12,
      experimentsRunning: 8,
      successRate: 94.5
    })

    cy.visit('/dashboard')
    cy.wait('@mockedAPI')
  })

  it('should test API integration with mock data', () => {
    cy.mockApiResponse('**/api/models', {
      models: [
        { id: 1, name: 'Test Model 1', status: 'active' },
        { id: 2, name: 'Test Model 2', status: 'training' }
      ]
    })

    cy.visit('/dashboard')
    cy.wait('@mockedAPI')
  })

  it('should handle different screen sizes', () => {
    cy.checkResponsiveDesign(['mobile', 'tablet', 'desktop'])
  })

  it('should handle navigation from dashboard', () => {
    cy.url().should('include', '/dashboard')

    // Navigate to other pages
    cy.navigateToPage('/models')
    cy.url().should('include', '/models')

    cy.navigateToPage('/experiments')
    cy.url().should('include', '/experiments')

    // Go back to dashboard
    cy.navigateToPage('/dashboard')
    cy.url().should('include', '/dashboard')
  })

  it('should test browser navigation', () => {
    cy.navigateToPage('/data-explorer')
    cy.go('back')
    cy.url().should('include', '/dashboard')
  })

  it('should seed test data and clean up', () => {
    cy.seedTestData('models', 5)
    cy.seedTestData('experiments', 3)

    cy.window().then((win) => {
      const models = JSON.parse(win.localStorage.getItem('test_models') || '[]')
      expect(models).to.have.length(5)
    })

    cy.cleanupTestData()

    cy.window().then((win) => {
      const models = win.localStorage.getItem('test_models')
      expect(models).to.be.null
    })
  })
})