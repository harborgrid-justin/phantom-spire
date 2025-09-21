describe('Fairness Metrics and Mitigation', () => {
  beforeEach(() => {
    cy.visit('/biasDetection')
    cy.get('[data-cy="completed-analysis"]').first().click()
  })

  it('should display comprehensive fairness metrics', () => {
    cy.get('[data-cy="fairness-dashboard"]').should('be.visible')
    cy.get('[data-cy="statistical-parity"]').should('be.visible')
    cy.get('[data-cy="equalized-odds"]').should('be.visible')
    cy.get('[data-cy="calibration"]').should('be.visible')
    cy.get('[data-cy="individual-fairness"]').should('be.visible')
  })

  it('should show group fairness analysis', () => {
    cy.get('[data-cy="group-fairness"]').click()
    cy.waitForChart('[data-cy="group-comparison-chart"]')
    cy.get('[data-cy="fairness-scores"]').should('be.visible')
    cy.get('[data-cy="group-statistics"]').should('be.visible')
  })

  it('should apply bias mitigation techniques', () => {
    cy.get('[data-cy="mitigation-tools"]').click()
    cy.get('[data-cy="preprocessing-mitigation"]').should('be.visible')

    cy.get('[data-cy="resampling-technique"]').select('SMOTE')
    cy.get('[data-cy="apply-mitigation"]').click()
    cy.get('[data-cy="mitigation-applied"]').should('be.visible')
  })

  it('should compare before and after mitigation', () => {
    cy.get('[data-cy="before-after-comparison"]').click()
    cy.get('[data-cy="comparison-metrics"]').should('be.visible')
    cy.waitForChart('[data-cy="improvement-chart"]')
    cy.get('[data-cy="bias-reduction-summary"]').should('be.visible')
  })

  it('should export fairness assessment', () => {
    cy.get('[data-cy="export-assessment"]').click()
    cy.get('[data-cy="export-format"]').select('json')
    cy.get('[data-cy="include-raw-data"]').check()
    cy.get('[data-cy="export-fairness-data"]').click()

    cy.get('[data-cy="export-complete"]').should('be.visible')
  })
})