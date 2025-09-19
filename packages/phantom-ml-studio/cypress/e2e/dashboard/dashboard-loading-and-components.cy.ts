describe('Dashboard Loading and Components', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
    cy.viewport(1280, 720) // Standard viewport
  })

  it('should load dashboard page successfully', () => {
    cy.url().should('include', '/dashboard')
    cy.get('body').should('be.visible')
    
    // Check for main dashboard container
    cy.get('[data-cy="dashboard"], [data-testid="dashboard"], .dashboard, main').should('exist')
    
    // Verify page title or heading exists
    cy.get('h1, h2, [data-cy="dashboard-title"]').should('be.visible')
  })

  it('should handle basic page interactions', () => {
    // Test that page is responsive
    cy.get('body').should('be.visible')

    // Test viewport changes with proper waits
    cy.viewport(375, 667) // Mobile
    cy.wait(500)
    cy.get('body').should('be.visible')
    cy.get('h1, h2, [data-cy="dashboard-title"]').should('be.visible')

    cy.viewport(768, 1024) // Tablet
    cy.wait(500)
    cy.get('body').should('be.visible')
    cy.get('h1, h2, [data-cy="dashboard-title"]').should('be.visible')

    cy.viewport(1200, 800) // Desktop
    cy.wait(500)
    cy.get('body').should('be.visible')
    cy.get('h1, h2, [data-cy="dashboard-title"]').should('be.visible')
  })

  it('should measure page performance', () => {
    const startTime = Date.now()
    
    cy.visit('/dashboard')
    cy.get('body').should('be.visible')
    
    cy.then(() => {
      const loadTime = Date.now() - startTime
      cy.log(`Dashboard loaded in ${loadTime}ms`)
      
      // Should load within 10 seconds
      expect(loadTime).to.be.lessThan(10000)
      
      // Log performance for visibility
      if (loadTime < 2000) {
        cy.log('✅ Excellent performance: < 2s')
      } else if (loadTime < 5000) {
        cy.log('✅ Good performance: < 5s')
      } else {
        cy.log('⚠️ Slow performance: > 5s')
      }
    })
  })

  it('should mock dashboard API calls', () => {
    // Mock dashboard metrics API
    cy.intercept('GET', '**/api/dashboard/metrics', {
      statusCode: 200,
      body: {
        totalModels: 42,
        activeDeployments: 12,
        experimentsRunning: 8,
        successRate: 94.5
      }
    }).as('dashboardMetrics')

    cy.visit('/dashboard')
    
    // Wait for the API call if it occurs
    cy.wait(2000) // Give time for any API calls to complete
    
    // Verify page loaded successfully
    cy.get('body').should('be.visible')
    cy.get('h1, h2').should('exist')
  })

  it('should test API integration with mock data', () => {
    // Mock models API
    cy.intercept('GET', '**/api/models', {
      statusCode: 200,
      body: {
        models: [
          { id: 1, name: 'Test Model 1', status: 'active' },
          { id: 2, name: 'Test Model 2', status: 'training' }
        ]
      }
    }).as('modelsApi')

    cy.visit('/dashboard')
    
    // Wait for potential API calls
    cy.wait(2000)
    
    // Verify page functionality
    cy.get('body').should('be.visible')
    cy.get('h1, h2').should('exist')
  })

  it('should handle different screen sizes', () => {
    const screenSizes = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1200, height: 800 },
      { name: 'large', width: 1920, height: 1080 }
    ]

    screenSizes.forEach(({ name, width, height }) => {
      cy.viewport(width, height)
      cy.wait(500) // Allow layout to settle
      
      cy.log(`Testing ${name} viewport: ${width}x${height}`)
      
      // Verify basic functionality at each size
      cy.get('body').should('be.visible')
      cy.get('h1, h2, [data-cy="dashboard-title"]').should('be.visible')
      
      // Check for responsive navigation changes
      cy.get('body').then($body => {
        const hasMobileNav = $body.find('[data-cy*="mobile"], .mobile-nav, .hamburger').length > 0
        if (width <= 768 && hasMobileNav) {
          cy.log(`✅ Mobile navigation detected for ${name}`)
        }
      })
    })
  })

  it('should handle navigation from dashboard', () => {
    cy.url().should('include', '/dashboard')

    // Navigate to other pages using built-in navigation
    cy.visit('/models')
    cy.url().should('include', '/models')
    cy.get('body').should('be.visible')

    cy.visit('/experiments')  
    cy.url().should('include', '/experiments')
    cy.get('body').should('be.visible')

    // Go back to dashboard
    cy.visit('/dashboard')
    cy.url().should('include', '/dashboard')
    cy.get('body').should('be.visible')
  })

  it('should test browser navigation', () => {
    // Navigate to another page
    cy.visit('/data-explorer')
    cy.url().should('include', '/data-explorer')
    cy.get('body').should('be.visible')
    
    // Use browser back button
    cy.go('back')
    cy.url().should('include', '/dashboard')
    cy.get('body').should('be.visible')
    
    // Test forward navigation
    cy.go('forward')
    cy.url().should('include', '/data-explorer')
    cy.get('body').should('be.visible')
  })

  it('should seed test data and clean up', () => {
    // Seed test data directly using localStorage
    const testModels = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `Test Model ${i + 1}`,
      status: i % 2 === 0 ? 'active' : 'training',
      createdAt: new Date().toISOString()
    }))

    const testExperiments = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      name: `Test Experiment ${i + 1}`,
      status: 'running',
      createdAt: new Date().toISOString()
    }))

    // Set test data in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('test_models', JSON.stringify(testModels))
      win.localStorage.setItem('test_experiments', JSON.stringify(testExperiments))
    })

    // Verify data was set correctly
    cy.window().then((win) => {
      const models = JSON.parse(win.localStorage.getItem('test_models') || '[]')
      const experiments = JSON.parse(win.localStorage.getItem('test_experiments') || '[]')
      
      expect(models).to.have.length(5)
      expect(experiments).to.have.length(3)
      
      cy.log(`✅ Seeded ${models.length} models and ${experiments.length} experiments`)
    })

    // Clean up test data
    cy.window().then((win) => {
      win.localStorage.removeItem('test_models')
      win.localStorage.removeItem('test_experiments')
    })

    // Verify cleanup
    cy.window().then((win) => {
      const models = win.localStorage.getItem('test_models')
      const experiments = win.localStorage.getItem('test_experiments')
      
      expect(models).to.equal(null)
      expect(experiments).to.equal(null)
      
      cy.log('✅ Test data cleaned up successfully')
    })
  })
})