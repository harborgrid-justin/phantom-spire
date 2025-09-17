describe('Deployment Monitoring', () => {
  beforeEach(() => {
    cy.visit('/deployments')
    cy.get('[data-cy="active-deployment"]').first().click()
  })

  it('should display deployment health metrics', () => {
    cy.get('[data-cy="deployment-health"]').should('be.visible')
    cy.get('[data-cy="health-status"]').should('be.visible')
    cy.get('[data-cy="uptime"]').should('be.visible')
    cy.get('[data-cy="response-time"]').should('be.visible')
    cy.get('[data-cy="error-rate"]').should('be.visible')
  })

  it('should show real-time performance metrics', () => {
    cy.get('[data-cy="performance-metrics"]').should('be.visible')
    cy.waitForChart('[data-cy="latency-chart"]')
    cy.waitForChart('[data-cy="throughput-chart"]')
    cy.get('[data-cy="requests-per-second"]').should('be.visible')
  })

  it('should monitor resource utilization', () => {
    cy.get('[data-cy="resource-utilization"]').should('be.visible')
    cy.waitForChart('[data-cy="cpu-usage"]')
    cy.waitForChart('[data-cy="memory-usage"]')
    cy.get('[data-cy="disk-usage"]').should('be.visible')
  })

  it('should display prediction accuracy drift', () => {
    cy.get('[data-cy="model-performance"]').click()
    cy.get('[data-cy="accuracy-drift"]').should('be.visible')
    cy.waitForChart('[data-cy="drift-chart"]')
    cy.get('[data-cy="drift-threshold"]').should('be.visible')
  })

  it('should show deployment logs', () => {
    cy.get('[data-cy="deployment-logs"]').click()
    cy.get('[data-cy="log-viewer"]').should('be.visible')
    cy.get('[data-cy="log-entries"]').should('be.visible')
    cy.get('[data-cy="log-filter"]').should('be.visible')
  })

  it('should configure alerts', () => {
    cy.get('[data-cy="configure-alerts"]').click()
    cy.get('[data-cy="alert-rules"]').should('be.visible')

    cy.get('[data-cy="add-alert-rule"]').click()
    cy.get('[data-cy="alert-metric"]').select('response_time')
    cy.get('[data-cy="alert-threshold"]').type('1000')
    cy.get('[data-cy="alert-email"]').type('admin@example.com')
    cy.get('[data-cy="save-alert"]').click()
  })
})