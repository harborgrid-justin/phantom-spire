describe('A/B Test Statistical Analysis', () => {
  beforeEach(() => {
    cy.visit('/multi-model-ab-testing')
    cy.get('[data-cy="completed-test"]').first().click()
  })

  it('should display comprehensive statistical analysis', () => {
    cy.get('[data-cy="statistical-analysis"]').should('be.visible')
    cy.get('[data-cy="hypothesis-test"]').should('be.visible')
    cy.get('[data-cy="p-value"]').should('be.visible')
    cy.get('[data-cy="effect-size"]').should('be.visible')
    cy.get('[data-cy="power-analysis"]').should('be.visible')
  })

  it('should show confidence intervals', () => {
    cy.get('[data-cy="confidence-intervals"]').click()
    cy.waitForChart('[data-cy="confidence-chart"]')
    cy.get('[data-cy="ci-lower-bound"]').should('be.visible')
    cy.get('[data-cy="ci-upper-bound"]').should('be.visible')
    cy.get('[data-cy="margin-of-error"]').should('be.visible')
  })

  it('should perform bayesian analysis', () => {
    cy.get('[data-cy="bayesian-analysis"]').click()
    cy.get('[data-cy="probability-distribution"]').should('be.visible')
    cy.waitForChart('[data-cy="posterior-distribution"]')
    cy.get('[data-cy="credible-interval"]').should('be.visible')
  })

  it('should show sample size recommendations', () => {
    cy.get('[data-cy="sample-size-analysis"]').click()
    cy.get('[data-cy="power-calculation"]').should('be.visible')
    cy.get('[data-cy="minimum-sample-size"]').should('be.visible')
    cy.get('[data-cy="detection-rate"]').should('be.visible')
  })

  it('should validate test assumptions', () => {
    cy.get('[data-cy="assumption-validation"]').click()
    cy.get('[data-cy="normality-test"]').should('be.visible')
    cy.get('[data-cy="variance-equality"]').should('be.visible')
    cy.get('[data-cy="independence-check"]').should('be.visible')
  })
})