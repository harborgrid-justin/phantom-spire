describe('Anomaly Detection and Analysis', () => {
  beforeEach(() => {
    cy.visit('/monitoring')
    cy.get('[data-cy="anomaly-detection"]').click()
  })

  it('should configure anomaly detection', () => {
    cy.get('[data-cy="configure-anomaly-detection"]').click()
    cy.get('[data-cy="detection-method"]').select('isolation-forest')
    cy.get('[data-cy="sensitivity-level"]').type('0.1')
    cy.get('[data-cy="enable-detection"]').check()
    cy.get('[data-cy="save-config"]').click()

    cy.get('[data-cy="detection-enabled"]').should('be.visible')
  })

  it('should detect real-time anomalies', () => {
    cy.get('[data-cy="anomaly-stream"]').should('be.visible')
    cy.waitForChart('[data-cy="anomaly-timeline"]')
    cy.get('[data-cy="anomaly-alerts"]').should('be.visible')
  })

  it('should classify anomaly types', () => {
    cy.get('[data-cy="anomaly-classification"]').click()
    cy.get('[data-cy="anomaly-types"]').should('be.visible')

    cy.get('[data-cy="performance-anomalies"]').should('be.visible')
    cy.get('[data-cy="data-drift-anomalies"]').should('be.visible')
    cy.get('[data-cy="system-anomalies"]').should('be.visible')
  })

  it('should investigate anomaly details', () => {
    cy.get('[data-cy="anomaly-item"]').first().click()
    cy.get('[data-cy="anomaly-details"]').should('be.visible')

    cy.get('[data-cy="anomaly-score"]').should('be.visible')
    cy.get('[data-cy="affected-metrics"]').should('be.visible')
    cy.get('[data-cy="root-cause-analysis"]').should('be.visible')
  })

  it('should set anomaly thresholds', () => {
    cy.get('[data-cy="threshold-settings"]').click()
    cy.get('[data-cy="metric-thresholds"]').should('be.visible')

    cy.get('[data-cy="accuracy-threshold"]').type('0.05')
    cy.get('[data-cy="latency-threshold"]').type('100')
    cy.get('[data-cy="error-rate-threshold"]').type('0.02')
    cy.get('[data-cy="save-thresholds"]').click()
  })

  it('should generate anomaly reports', () => {
    cy.get('[data-cy="generate-anomaly-report"]').click()
    cy.get('[data-cy="report-timeframe"]').select('last-7-days')
    cy.get('[data-cy="include-charts"]').check()
    cy.get('[data-cy="include-analysis"]').check()
    cy.get('[data-cy="generate-report"]').click()

    cy.get('[data-cy="report-generated"]').should('be.visible')
  })

  it('should correlate anomalies with events', () => {
    cy.get('[data-cy="anomaly-correlation"]').click()
    cy.get('[data-cy="event-timeline"]').should('be.visible')
    cy.waitForChart('[data-cy="correlation-chart"]')
    cy.get('[data-cy="correlation-score"]').should('be.visible')
  })
})