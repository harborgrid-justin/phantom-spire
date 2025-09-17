describe('Alerts and Notifications', () => {
  beforeEach(() => {
    cy.visit('/real-time-monitoring')
    cy.get('[data-cy="alerts-configuration"]').click()
  })

  it('should create new alert rule', () => {
    cy.get('[data-cy="create-alert-rule"]').click()
    cy.get('[data-cy="alert-form"]').should('be.visible')

    cy.get('[data-cy="alert-name"]').type('High Latency Alert')
    cy.get('[data-cy="metric-selector"]').select('response_time')
    cy.get('[data-cy="threshold-value"]').type('1000')
    cy.get('[data-cy="condition"]').select('greater_than')
    cy.get('[data-cy="notification-email"]').type('admin@company.com')
    cy.get('[data-cy="save-alert-rule"]').click()
  })

  it('should test alert notification', () => {
    cy.get('[data-cy="alert-rule"]').first().find('[data-cy="test-alert"]').click()
    cy.get('[data-cy="test-notification"]').should('be.visible')
    cy.get('[data-cy="notification-sent"]').should('be.visible')
  })

  it('should configure notification channels', () => {
    cy.get('[data-cy="notification-settings"]').click()
    cy.get('[data-cy="add-channel"]').click()

    cy.get('[data-cy="channel-type"]').select('slack')
    cy.get('[data-cy="webhook-url"]').type('https://hooks.slack.com/services/xxx')
    cy.get('[data-cy="channel-name"]').type('#ml-alerts')
    cy.get('[data-cy="save-channel"]').click()
  })

  it('should show alert history', () => {
    cy.get('[data-cy="alert-history"]').click()
    cy.get('[data-cy="historical-alerts"]').should('be.visible')
    cy.get('[data-cy="alert-timeline"]').should('be.visible')
    cy.get('[data-cy="resolution-status"]').should('be.visible')
  })

  it('should escalate critical alerts', () => {
    cy.get('[data-cy="escalation-rules"]').click()
    cy.get('[data-cy="add-escalation"]').click()

    cy.get('[data-cy="escalation-condition"]').select('critical')
    cy.get('[data-cy="escalation-delay"]').type('15')
    cy.get('[data-cy="escalation-contact"]').type('manager@company.com')
    cy.get('[data-cy="save-escalation"]').click()
  })
})