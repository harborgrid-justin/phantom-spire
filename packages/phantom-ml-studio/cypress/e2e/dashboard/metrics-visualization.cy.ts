describe('Dashboard Metrics Visualization', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
    cy.get('[data-cy="page-loading"]').should('not.exist')
  })

  it('should display model performance metrics chart', () => {
    cy.waitForChart('[data-cy="model-performance-chart"]')
    cy.get('[data-cy="model-performance-chart"] .recharts-line').should('exist')
    cy.get('[data-cy="chart-legend"]').should('be.visible')
  })

  it('should show training progress visualization', () => {
    cy.waitForChart('[data-cy="training-progress-chart"]')
    cy.get('[data-cy="training-progress-chart"] .recharts-bar').should('exist')
    cy.get('[data-cy="progress-percentage"]').should('be.visible')
  })

  it('should display deployment health metrics', () => {
    cy.get('[data-cy="deployment-health-chart"]').should('be.visible')
    cy.waitForChart('[data-cy="deployment-health-chart"]')
    cy.get('[data-cy="health-status-indicators"]').should('be.visible')
  })

  it('should interact with chart tooltips on hover', () => {
    cy.waitForChart('[data-cy="model-performance-chart"]')
    cy.interactWithChart('[data-cy="performance-chart"]', 'hover', { x: 100, y: 100 })
    cy.get('[data-cy="chart-tooltip"]').should('be.visible')
    cy.get('[data-cy="tooltip-value"]').should('contain.match', /\d+\.?\d*/)
  })

  it('should allow chart time range selection', () => {
    cy.get('[data-cy="time-range-selector"]').should('be.visible')
    cy.get('[data-cy="time-range-7d"]').click()
    cy.get('[data-cy="chart-loading"]').should('be.visible')
    cy.get('[data-cy="chart-loading"]').should('not.exist')
    cy.waitForChart('[data-cy="model-performance-chart"]')
  })

  it('should show experiment success rate pie chart', () => {
    cy.waitForChart('[data-cy="experiment-success-chart"]')
    cy.get('[data-cy="experiment-success-chart"] .recharts-pie-sector').should('exist')
    cy.get('[data-cy="success-rate-legend"]').should('be.visible')
  })

  it('should display real-time metrics updates', () => {
    cy.get('[data-cy="real-time-indicator"]').should('be.visible')
    cy.get('[data-cy="last-updated-timestamp"]').should('be.visible')

    // Mock real-time updates
    cy.intercept('GET', '**/api/dashboard/realtime', {
      accuracy: 0.95,
      timestamp: new Date().toISOString()
    }).as('realtimeUpdate')

    cy.wait('@realtimeUpdate')
    cy.get('[data-cy="accuracy-metric"]').should('contain', '95%')
  })

  it('should handle chart data export functionality', () => {
    cy.get('[data-cy="chart-export-button"]').click()
    cy.get('[data-cy="export-options"]').should('be.visible')
    cy.get('[data-cy="export-csv"]').click()
    cy.get('[data-cy="export-success-notification"]').should('be.visible')
  })

  it('should display threshold indicators on charts', () => {
    cy.waitForChart('[data-cy="model-performance-chart"]')
    cy.get('[data-cy="performance-threshold-line"]').should('exist')
    cy.get('[data-cy="threshold-label"]').should('be.visible')
  })
})