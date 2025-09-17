describe('Deployment Endpoint Testing', () => {
  beforeEach(() => {
    cy.visit('/deployments')
    cy.get('[data-cy="active-deployment"]').first().click()
  })

  it('should test deployment endpoints', () => {
    cy.get('[data-cy="test-endpoint"]').click()
    cy.get('[data-cy="endpoint-tester"]').should('be.visible')

    cy.get('[data-cy="sample-input"]').type('{"age": 30, "salary": 65000, "department": "Engineering"}')
    cy.get('[data-cy="send-request"]').click()

    cy.get('[data-cy="response-output"]').should('be.visible')
    cy.get('[data-cy="response-time"]').should('be.visible')
    cy.get('[data-cy="status-code"]').should('contain', '200')
  })

  it('should validate endpoint response format', () => {
    cy.get('[data-cy="test-endpoint"]').click()
    cy.get('[data-cy="validate-response"]').check()
    cy.get('[data-cy="send-request"]').click()

    cy.get('[data-cy="validation-results"]').should('be.visible')
    cy.get('[data-cy="schema-validation"]').should('contain', 'Valid')
  })

  it('should perform load testing', () => {
    cy.get('[data-cy="load-testing"]').click()
    cy.get('[data-cy="concurrent-requests"]').type('10')
    cy.get('[data-cy="test-duration"]').type('60')
    cy.get('[data-cy="start-load-test"]').click()

    cy.get('[data-cy="load-test-progress"]').should('be.visible')
    cy.get('[data-cy="requests-per-second"]').should('be.visible')
  })

  it('should monitor endpoint health', () => {
    cy.get('[data-cy="endpoint-health"]').should('be.visible')
    cy.get('[data-cy="health-check-status"]').should('be.visible')
    cy.get('[data-cy="last-health-check"]').should('be.visible')

    cy.get('[data-cy="run-health-check"]').click()
    cy.get('[data-cy="health-check-running"]').should('be.visible')
  })

  it('should configure endpoint security', () => {
    cy.get('[data-cy="security-settings"]').click()
    cy.get('[data-cy="enable-authentication"]').check()
    cy.get('[data-cy="api-key-required"]').check()
    cy.get('[data-cy="rate-limiting"]').check()
    cy.get('[data-cy="max-requests-per-minute"]').type('100')
    cy.get('[data-cy="save-security-settings"]').click()
  })
})