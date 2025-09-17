describe('Model Validation', () => {
  beforeEach(() => {
    cy.visit('/model-builder')
    cy.createModel('Validation Test Model', 'random-forest')
    cy.mockModelTraining('test-model-123', 'completed')
    cy.get('[data-cy="start-training"]').click()
    cy.get('[data-cy="training-complete"]').should('be.visible')
    cy.get('[data-cy="validate-model"]').click()
  })

  it('should display model validation interface', () => {
    cy.get('[data-cy="model-validation"]').should('be.visible')
    cy.get('[data-cy="validation-tabs"]').should('be.visible')
    cy.get('[data-cy="performance-metrics"]').should('be.visible')
    cy.get('[data-cy="confusion-matrix"]').should('be.visible')
  })

  it('should show performance metrics', () => {
    cy.get('[data-cy="performance-metrics"]').click()

    cy.get('[data-cy="accuracy-score"]').should('be.visible')
    cy.get('[data-cy="precision-score"]').should('be.visible')
    cy.get('[data-cy="recall-score"]').should('be.visible')
    cy.get('[data-cy="f1-score"]').should('be.visible')
  })

  it('should display confusion matrix', () => {
    cy.get('[data-cy="confusion-matrix"]').click()

    cy.waitForChart('[data-cy="confusion-matrix-chart"]')
    cy.get('[data-cy="matrix-cell"]').should('exist')
    cy.get('[data-cy="true-positive"]').should('be.visible')
    cy.get('[data-cy="false-positive"]').should('be.visible')
  })

  it('should show ROC curve for classification models', () => {
    cy.get('[data-cy="roc-curve"]').click()

    cy.waitForChart('[data-cy="roc-curve-chart"]')
    cy.get('[data-cy="roc-line"]').should('exist')
    cy.get('[data-cy="auc-score"]').should('be.visible')
  })

  it('should display feature importance', () => {
    cy.get('[data-cy="feature-importance"]').click()

    cy.waitForChart('[data-cy="feature-importance-chart"]')
    cy.get('[data-cy="importance-bar"]').should('exist')
    cy.get('[data-cy="feature-ranking"]').should('be.visible')
  })

  it('should show prediction examples', () => {
    cy.get('[data-cy="prediction-examples"]').click()

    cy.get('[data-cy="example-predictions"]').should('be.visible')
    cy.get('[data-cy="actual-vs-predicted"]').should('be.visible')
    cy.get('[data-cy="prediction-accuracy"]').should('be.visible')
  })

  it('should run cross-validation', () => {
    cy.get('[data-cy="cross-validation"]').click()
    cy.get('[data-cy="cv-folds-input"]').type('5')
    cy.get('[data-cy="run-cross-validation"]').click()

    cy.get('[data-cy="cv-progress"]').should('be.visible')
    cy.get('[data-cy="cv-results"]').should('be.visible')
    cy.get('[data-cy="cv-mean-score"]').should('be.visible')
  })

  it('should validate with test dataset', () => {
    cy.get('[data-cy="test-dataset-validation"]').click()
    cy.get('[data-cy="upload-test-data"]').click()

    cy.uploadFile('cypress/fixtures/test-data.csv', '[data-cy="test-file-input"]')
    cy.get('[data-cy="validate-with-test-data"]').click()

    cy.get('[data-cy="test-validation-results"]').should('be.visible')
  })

  it('should show residual plots for regression models', () => {
    // Switch to regression model scenario
    cy.visit('/model-builder')
    cy.createModel('Regression Test Model', 'linear-regression')
    cy.get('[data-cy="validate-model"]').click()

    cy.get('[data-cy="residual-plots"]').click()
    cy.waitForChart('[data-cy="residual-plot"]')
    cy.get('[data-cy="residual-line"]').should('exist')
  })

  it('should generate validation report', () => {
    cy.get('[data-cy="generate-validation-report"]').click()
    cy.get('[data-cy="report-options"]').should('be.visible')

    cy.get('[data-cy="include-charts"]').check()
    cy.get('[data-cy="include-metrics"]').check()
    cy.get('[data-cy="report-format"]').select('pdf')
    cy.get('[data-cy="generate-report"]').click()

    cy.get('[data-cy="report-generated"]').should('be.visible')
  })

  it('should compare with baseline model', () => {
    cy.get('[data-cy="baseline-comparison"]').click()
    cy.get('[data-cy="select-baseline"]').select('dummy-classifier')
    cy.get('[data-cy="run-comparison"]').click()

    cy.get('[data-cy="comparison-results"]').should('be.visible')
    cy.get('[data-cy="improvement-metrics"]').should('be.visible')
  })

  it('should validate model fairness', () => {
    cy.get('[data-cy="fairness-validation"]').click()
    cy.get('[data-cy="protected-attribute"]').select('department')
    cy.get('[data-cy="fairness-metric"]').select('demographic-parity')
    cy.get('[data-cy="run-fairness-check"]').click()

    cy.get('[data-cy="fairness-results"]').should('be.visible')
    cy.get('[data-cy="bias-indicators"]').should('be.visible')
  })

  it('should save validation results', () => {
    cy.get('[data-cy="save-validation-results"]').click()
    cy.get('[data-cy="results-name"]').type('Model Validation Results')
    cy.get('[data-cy="save-results"]').click()

    cy.get('[data-cy="results-saved"]').should('be.visible')
  })
})