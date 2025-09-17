describe('Experiment Metrics and Logging', () => {
  beforeEach(() => {
    cy.visit('/experiments')
    cy.get('[data-cy="running-experiment"]').first().click()
  })

  it('should log custom metrics during experiment', () => {
    cy.get('[data-cy="custom-metrics"]').click()
    cy.get('[data-cy="add-metric"]').click()

    cy.get('[data-cy="metric-name"]').type('custom_accuracy')
    cy.get('[data-cy="metric-value"]').type('0.87')
    cy.get('[data-cy="log-metric"]').click()

    cy.get('[data-cy="metric-logged"]').should('be.visible')
    cy.get('[data-cy="metrics-list"]').should('contain', 'custom_accuracy')
  })

  it('should track hyperparameter changes', () => {
    cy.get('[data-cy="hyperparameter-tracking"]').click()
    cy.get('[data-cy="parameter-history"]').should('be.visible')

    cy.get('[data-cy="parameter-change"]').should('have.length.at.least', 1)
    cy.get('[data-cy="parameter-impact"]').should('be.visible')
  })

  it('should log training artifacts', () => {
    cy.get('[data-cy="artifacts"]').click()
    cy.get('[data-cy="upload-artifact"]').click()

    cy.get('[data-cy="artifact-type"]').select('model_weights')
    cy.get('[data-cy="artifact-file"]').selectFile('cypress/fixtures/test-data.csv', { force: true })
    cy.get('[data-cy="artifact-description"]').type('Model checkpoint at epoch 50')
    cy.get('[data-cy="save-artifact"]').click()

    cy.get('[data-cy="artifact-saved"]').should('be.visible')
  })

  it('should compare experiment runs', () => {
    cy.get('[data-cy="compare-runs"]').click()
    cy.get('[data-cy="run-comparison"]').should('be.visible')

    cy.get('[data-cy="select-run-1"]').select('run-001')
    cy.get('[data-cy="select-run-2"]').select('run-002')
    cy.get('[data-cy="generate-comparison"]').click()

    cy.get('[data-cy="run-comparison-chart"]').should('be.visible')
  })

  it('should export experiment logs', () => {
    cy.get('[data-cy="export-logs"]').click()
    cy.get('[data-cy="log-format"]').select('json')
    cy.get('[data-cy="include-metrics"]').check()
    cy.get('[data-cy="include-artifacts"]').check()
    cy.get('[data-cy="export-experiment-logs"]').click()

    cy.get('[data-cy="logs-exported"]').should('be.visible')
  })
})