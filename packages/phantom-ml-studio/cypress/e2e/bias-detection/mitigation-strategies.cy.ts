describe('Bias Mitigation Strategies', () => {
  beforeEach(() => {
    cy.visit('/biasDetection')
    cy.get('[data-cy="completed-analysis"]').first().click()
    cy.get('[data-cy="mitigation-tools"]').click()
  })

  it('should apply preprocessing mitigation', () => {
    cy.get('[data-cy="preprocessing-mitigation"]').click()
    cy.get('[data-cy="resampling-options"]').should('be.visible')

    cy.get('[data-cy="technique-smote"]').click()
    cy.get('[data-cy="apply-smote"]').click()
    cy.get('[data-cy="mitigation-progress"]').should('be.visible')
  })

  it('should apply in-processing mitigation', () => {
    cy.get('[data-cy="inprocessing-mitigation"]').click()
    cy.get('[data-cy="fairness-constraints"]').should('be.visible')

    cy.get('[data-cy="constraint-demographic-parity"]').check()
    cy.get('[data-cy="constraint-weight"]').type('0.5')
    cy.get('[data-cy="apply-constraints"]').click()
  })

  it('should apply post-processing mitigation', () => {
    cy.get('[data-cy="postprocessing-mitigation"]').click()
    cy.get('[data-cy="calibration-options"]').should('be.visible')

    cy.get('[data-cy="calibration-method"]').select('platt-scaling')
    cy.get('[data-cy="apply-calibration"]').click()
    cy.get('[data-cy="calibration-complete"]').should('be.visible')
  })

  it('should compare mitigation effectiveness', () => {
    cy.get('[data-cy="compare-mitigation"]').click()
    cy.get('[data-cy="before-after-metrics"]').should('be.visible')

    cy.waitForChart('[data-cy="fairness-improvement-chart"]')
    cy.get('[data-cy="bias-reduction-percentage"]').should('be.visible')
  })

  it('should generate mitigation report', () => {
    cy.get('[data-cy="generate-mitigation-report"]').click()
    cy.get('[data-cy="report-options"]').should('be.visible')

    cy.get('[data-cy="include-before-after"]').check()
    cy.get('[data-cy="include-recommendations"]').check()
    cy.get('[data-cy="generate-report"]').click()

    cy.get('[data-cy="report-generated"]').should('be.visible')
  })
})