describe('Model Comparison and Selection', () => {
  beforeEach(() => {
    cy.visit('/model-builder')
  })

  it('should compare multiple algorithms', () => {
    cy.get('[data-cy="model-comparison"]').click()
    cy.get('[data-cy="add-algorithm"]').click()

    cy.get('[data-cy="select-algorithm-1"]').select('random-forest')
    cy.get('[data-cy="add-algorithm"]').click()
    cy.get('[data-cy="select-algorithm-2"]').select('svm')
    cy.get('[data-cy="add-algorithm"]').click()
    cy.get('[data-cy="select-algorithm-3"]').select('logistic-regression')

    cy.get('[data-cy="run-comparison"]').click()
    cy.get('[data-cy="comparison-results"]').should('be.visible')
  })

  it('should display performance metrics comparison', () => {
    cy.get('[data-cy="completed-comparison"]').first().click()

    cy.get('[data-cy="comparison-table"]').should('be.visible')
    cy.get('[data-cy="accuracy-comparison"]').should('be.visible')
    cy.get('[data-cy="precision-comparison"]').should('be.visible')
    cy.get('[data-cy="recall-comparison"]').should('be.visible')
    cy.get('[data-cy="f1-comparison"]').should('be.visible')
  })

  it('should visualize algorithm performance', () => {
    cy.get('[data-cy="completed-comparison"]').first().click()
    cy.get('[data-cy="visualization"]').click()

    cy.waitForChart('[data-cy="performance-radar-chart"]')
    cy.waitForChart('[data-cy="roc-comparison"]')
    cy.get('[data-cy="algorithm-ranking"]').should('be.visible')
  })

  it('should recommend best algorithm', () => {
    cy.get('[data-cy="completed-comparison"]').first().click()
    cy.get('[data-cy="get-recommendation"]').click()

    cy.get('[data-cy="recommended-algorithm"]').should('be.visible')
    cy.get('[data-cy="recommendation-reasoning"]').should('be.visible')
    cy.get('[data-cy="confidence-score"]').should('be.visible')
  })

  it('should export comparison results', () => {
    cy.get('[data-cy="completed-comparison"]').first().click()
    cy.get('[data-cy="export-comparison"]').click()

    cy.get('[data-cy="export-format"]').select('pdf')
    cy.get('[data-cy="include-visualizations"]').check()
    cy.get('[data-cy="include-recommendations"]').check()
    cy.get('[data-cy="export-results"]').click()

    cy.get('[data-cy="export-success"]').should('be.visible')
  })
})