describe('Bias Detection and Analysis', () => {
  beforeEach(() => {
    cy.visit('/bias-detection-engine')
    cy.get('[data-cy="page-loading"]').should('not.exist')
  })

  it('should display bias detection interface', () => {
    cy.get('[data-cy="bias-detection-title"]').should('be.visible')
    cy.get('[data-cy="analyze-model"]').should('be.visible')
    cy.get('[data-cy="bias-reports"]').should('be.visible')
    cy.get('[data-cy="fairness-metrics"]').should('be.visible')
  })

  it('should start bias analysis for a model', () => {
    cy.get('[data-cy="analyze-model"]').click()
    cy.get('[data-cy="model-selector"]').select('Performance Prediction Model')
    cy.get('[data-cy="protected-attributes"]').should('be.visible')

    cy.get('[data-cy="attribute-gender"]').check()
    cy.get('[data-cy="attribute-age"]').check()
    cy.get('[data-cy="start-analysis"]').click()

    cy.get('[data-cy="analysis-progress"]').should('be.visible')
  })

  it('should display bias metrics and visualizations', () => {
    cy.get('[data-cy="completed-analysis"]').first().click()

    cy.get('[data-cy="bias-metrics"]').should('be.visible')
    cy.get('[data-cy="demographic-parity"]').should('be.visible')
    cy.get('[data-cy="equal-opportunity"]').should('be.visible')
    cy.waitForChart('[data-cy="bias-visualization"]')
  })

  it('should show fairness recommendations', () => {
    cy.get('[data-cy="completed-analysis"]').first().click()
    cy.get('[data-cy="recommendations"]').click()

    cy.get('[data-cy="bias-mitigation-suggestions"]').should('be.visible')
    cy.get('[data-cy="fairness-improvements"]').should('be.visible')
    cy.get('[data-cy="action-items"]').should('be.visible')
  })

  it('should generate bias report', () => {
    cy.get('[data-cy="completed-analysis"]').first().click()
    cy.get('[data-cy="generate-report"]').click()

    cy.get('[data-cy="report-options"]').should('be.visible')
    cy.get('[data-cy="include-visualizations"]').check()
    cy.get('[data-cy="include-recommendations"]').check()
    cy.get('[data-cy="generate-bias-report"]').click()

    cy.get('[data-cy="report-generated"]').should('be.visible')
  })
})