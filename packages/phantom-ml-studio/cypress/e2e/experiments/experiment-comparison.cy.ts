describe('Experiment Comparison and Analysis', () => {
  beforeEach(() => {
    cy.visit('/experiments')
    cy.get('[data-cy="completed-experiments"]').should('be.visible')
  })

  it('should select multiple experiments for comparison', () => {
    cy.get('[data-cy="experiment-checkbox"]').first().check()
    cy.get('[data-cy="experiment-checkbox"]').eq(1).check()
    cy.get('[data-cy="compare-selected"]').click()

    cy.get('[data-cy="comparison-view"]').should('be.visible')
  })

  it('should display side-by-side experiment results', () => {
    cy.get('[data-cy="experiment-checkbox"]').first().check()
    cy.get('[data-cy="experiment-checkbox"]').eq(1).check()
    cy.get('[data-cy="compare-selected"]').click()

    cy.get('[data-cy="side-by-side-comparison"]').should('be.visible')
    cy.get('[data-cy="experiment-summary"]').should('have.length', 2)
    cy.get('[data-cy="metrics-comparison"]').should('be.visible')
  })

  it('should compare model performance across experiments', () => {
    cy.get('[data-cy="compare-models"]').click()
    cy.get('[data-cy="model-performance-comparison"]').should('be.visible')
    cy.waitForChart('[data-cy="performance-chart"]')
    cy.get('[data-cy="statistical-significance"]').should('be.visible')
  })

  it('should analyze parameter impact across experiments', () => {
    cy.get('[data-cy="parameter-analysis"]').click()
    cy.get('[data-cy="parameter-impact"]').should('be.visible')
    cy.waitForChart('[data-cy="parameter-correlation"]')
    cy.get('[data-cy="sensitivity-analysis"]').should('be.visible')
  })

  it('should export comparison results', () => {
    cy.get('[data-cy="experiment-checkbox"]').first().check()
    cy.get('[data-cy="experiment-checkbox"]').eq(1).check()
    cy.get('[data-cy="compare-selected"]').click()

    cy.get('[data-cy="export-comparison"]').click()
    cy.get('[data-cy="export-format"]').select('pdf')
    cy.get('[data-cy="include-charts"]').check()
    cy.get('[data-cy="generate-report"]').click()

    cy.get('[data-cy="report-generated"]').should('be.visible')
  })

  it('should create experiment from best configuration', () => {
    cy.get('[data-cy="experiment-item"]').first().click()
    cy.get('[data-cy="clone-experiment"]').click()

    cy.get('[data-cy="clone-options"]').should('be.visible')
    cy.get('[data-cy="new-experiment-name"]').type('Optimized Performance Prediction')
    cy.get('[data-cy="modify-parameters"]').check()
    cy.get('[data-cy="create-clone"]').click()

    cy.get('[data-cy="experiment-cloned"]').should('be.visible')
  })
})