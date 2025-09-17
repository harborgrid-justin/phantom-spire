describe('Dashboard Performance Tests', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
  })

  it('should load dashboard within acceptable time', () => {
    cy.measurePageLoad()
  })

  it('should handle large datasets efficiently', () => {
    cy.intercept('GET', '**/api/dashboard/metrics', {
      fixture: 'large-dataset.json',
      delay: 100
    }).as('largeData')

    cy.visit('/dashboard')
    cy.wait('@largeData')
    cy.get('[data-cy="metrics-overview"]').should('be.visible')
    cy.get('[data-cy="performance-indicator"]').should('not.have.class', 'slow')
  })

  it('should optimize chart rendering', () => {
    cy.visit('/dashboard')
    cy.get('[data-cy="model-performance-chart"]').should('be.visible')

    cy.window().then(win => {
      const renderTime = win.performance.getEntriesByType('measure')
        .find(entry => entry.name.includes('chart-render'))

      expect(renderTime?.duration).to.be.lessThan(1000)
    })
  })

  it('should lazy load dashboard widgets', () => {
    cy.visit('/dashboard')
    cy.get('[data-cy="above-fold-widget"]').should('be.visible')

    cy.scrollTo('bottom')
    cy.get('[data-cy="below-fold-widget"]').should('be.visible')
  })

  it('should cache dashboard data', () => {
    cy.visit('/dashboard')
    cy.get('[data-cy="metrics-overview"]').should('be.visible')

    cy.reload()
    cy.get('[data-cy="cached-data-indicator"]').should('be.visible')
  })
})