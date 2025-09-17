describe('Dashboard Real-time Updates', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
    cy.get('[data-cy="page-loading"]').should('not.exist')
  })

  it('should display real-time connection status', () => {
    cy.get('[data-cy="realtime-status"]').should('be.visible')
    cy.get('[data-cy="connection-indicator"]').should('have.class', 'connected')
    cy.get('[data-cy="last-update-time"]').should('be.visible')
  })

  it('should update metrics in real-time', () => {
    cy.intercept('GET', '**/api/dashboard/realtime', {
      models_count: 25,
      active_deployments: 8,
      timestamp: new Date().toISOString()
    }).as('realtimeMetrics')

    cy.wait('@realtimeMetrics')
    cy.get('[data-cy="kpi-total-models"]').should('contain', '25')
    cy.get('[data-cy="kpi-active-deployments"]').should('contain', '8')
  })

  it('should show real-time chart updates', () => {
    cy.waitForChart('[data-cy="real-time-performance-chart"]')

    // Mock new data point
    cy.intercept('GET', '**/api/dashboard/performance-stream', {
      timestamp: new Date().toISOString(),
      accuracy: 0.92,
      latency: 45
    }).as('performanceStream')

    cy.wait('@performanceStream')
    cy.get('[data-cy="real-time-performance-chart"]').should('be.visible')
  })

  it('should handle connection loss gracefully', () => {
    cy.intercept('GET', '**/api/dashboard/realtime', { forceNetworkError: true }).as('connectionError')

    cy.wait('@connectionError')
    cy.get('[data-cy="connection-indicator"]').should('have.class', 'disconnected')
    cy.get('[data-cy="connection-error-message"]').should('be.visible')
  })

  it('should reconnect automatically after connection loss', () => {
    // Simulate disconnection
    cy.intercept('GET', '**/api/dashboard/realtime', { forceNetworkError: true }).as('disconnect')
    cy.wait('@disconnect')

    // Simulate reconnection
    cy.intercept('GET', '**/api/dashboard/realtime', {
      status: 'connected',
      timestamp: new Date().toISOString()
    }).as('reconnect')

    cy.wait('@reconnect')
    cy.get('[data-cy="connection-indicator"]').should('have.class', 'connected')
    cy.get('[data-cy="reconnection-notification"]').should('be.visible')
  })

  it('should show real-time alerts and notifications', () => {
    cy.intercept('GET', '**/api/dashboard/alerts', {
      alerts: [{
        id: 'alert-1',
        type: 'warning',
        message: 'Model accuracy dropped below threshold',
        timestamp: new Date().toISOString()
      }]
    }).as('alertsStream')

    cy.wait('@alertsStream')
    cy.get('[data-cy="real-time-alert"]').should('be.visible')
    cy.get('[data-cy="alert-message"]').should('contain', 'Model accuracy dropped')
  })

  it('should update training progress in real-time', () => {
    cy.intercept('GET', '**/api/training/progress', {
      model_id: 'model-123',
      progress: 75,
      status: 'training',
      eta_minutes: 5
    }).as('trainingProgress')

    cy.wait('@trainingProgress')
    cy.get('[data-cy="training-progress-bar"]').should('be.visible')
    cy.get('[data-cy="progress-percentage"]').should('contain', '75%')
    cy.get('[data-cy="eta-display"]').should('contain', '5 minutes')
  })

  it('should allow pausing real-time updates', () => {
    cy.get('[data-cy="pause-realtime-updates"]').click()
    cy.get('[data-cy="realtime-paused-indicator"]').should('be.visible')
    cy.get('[data-cy="connection-indicator"]').should('have.class', 'paused')

    cy.get('[data-cy="resume-realtime-updates"]').click()
    cy.get('[data-cy="realtime-paused-indicator"]').should('not.exist')
    cy.get('[data-cy="connection-indicator"]').should('have.class', 'connected')
  })
})