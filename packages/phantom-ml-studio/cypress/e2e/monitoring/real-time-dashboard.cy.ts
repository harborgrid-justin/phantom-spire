describe('Real-time Monitoring Dashboard', () => {
  beforeEach(() => {
    cy.visit('/real-time-monitoring')
    cy.get('[data-cy="page-loading"]').should('not.exist')
  })

  it('should display real-time monitoring interface', () => {
    cy.get('[data-cy="monitoring-title"]').should('be.visible')
    cy.get('[data-cy="live-metrics"]').should('be.visible')
    cy.get('[data-cy="alert-panel"]').should('be.visible')
    cy.get('[data-cy="system-health"]').should('be.visible')
  })

  it('should show live model performance metrics', () => {
    cy.get('[data-cy="model-performance"]').should('be.visible')
    cy.waitForChart('[data-cy="accuracy-trend"]')
    cy.waitForChart('[data-cy="latency-chart"]')
    cy.get('[data-cy="throughput-meter"]').should('be.visible')
  })

  it('should display system health indicators', () => {
    cy.get('[data-cy="system-health"]').should('be.visible')
    cy.get('[data-cy="cpu-usage"]').should('be.visible')
    cy.get('[data-cy="memory-usage"]').should('be.visible')
    cy.get('[data-cy="disk-usage"]').should('be.visible')
    cy.get('[data-cy="network-io"]').should('be.visible')
  })

  it('should show active alerts', () => {
    cy.get('[data-cy="alert-panel"]').should('be.visible')
    cy.get('[data-cy="critical-alerts"]').should('be.visible')
    cy.get('[data-cy="warning-alerts"]').should('be.visible')
    cy.get('[data-cy="alert-history"]').should('be.visible')
  })

  it('should configure monitoring thresholds', () => {
    cy.get('[data-cy="configure-monitoring"]').click()
    cy.get('[data-cy="threshold-settings"]').should('be.visible')

    cy.get('[data-cy="accuracy-threshold"]').clear().type('0.85')
    cy.get('[data-cy="latency-threshold"]').clear().type('500')
    cy.get('[data-cy="error-rate-threshold"]').clear().type('0.05')
    cy.get('[data-cy="save-thresholds"]').click()
  })

  it('should handle alert acknowledgment', () => {
    cy.get('[data-cy="active-alert"]').first().click()
    cy.get('[data-cy="alert-details"]').should('be.visible')
    cy.get('[data-cy="acknowledge-alert"]').click()
    cy.get('[data-cy="alert-acknowledged"]').should('be.visible')
  })

  it('should export monitoring data', () => {
    cy.get('[data-cy="export-monitoring-data"]').click()
    cy.get('[data-cy="export-timeframe"]').select('last-24-hours')
    cy.get('[data-cy="export-format"]').select('csv')
    cy.get('[data-cy="export-metrics"]').click()

    cy.get('[data-cy="export-complete"]').should('be.visible')
  })

  it('should show anomaly detection results', () => {
    cy.get('[data-cy="anomaly-detection"]').click()
    cy.get('[data-cy="anomaly-timeline"]').should('be.visible')
    cy.waitForChart('[data-cy="anomaly-chart"]')
    cy.get('[data-cy="anomaly-score"]').should('be.visible')
  })
})