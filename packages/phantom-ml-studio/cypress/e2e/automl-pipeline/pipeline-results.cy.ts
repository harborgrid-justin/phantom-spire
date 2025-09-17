describe('AutoML Pipeline Results', () => {
  beforeEach(() => {
    cy.visit('/automl-pipeline-visualizer')
    cy.get('[data-cy="completed-pipeline"]').first().click()
    cy.get('[data-cy="view-results"]').click()
  })

  it('should display pipeline execution summary', () => {
    cy.get('[data-cy="results-summary"]').should('be.visible')
    cy.get('[data-cy="execution-duration"]').should('be.visible')
    cy.get('[data-cy="models-evaluated"]').should('be.visible')
    cy.get('[data-cy="best-model-name"]').should('be.visible')
    cy.get('[data-cy="best-accuracy"]').should('be.visible')
  })

  it('should show model leaderboard', () => {
    cy.get('[data-cy="model-leaderboard"]').should('be.visible')
    cy.get('[data-cy="leaderboard-table"]').should('be.visible')
    cy.get('[data-cy="model-rank"]').should('be.visible')
    cy.get('[data-cy="model-score"]').should('be.visible')
    cy.get('[data-cy="model-details"]').should('be.visible')
  })

  it('should display best model details', () => {
    cy.get('[data-cy="best-model-section"]').should('be.visible')
    cy.get('[data-cy="model-architecture"]').should('be.visible')
    cy.get('[data-cy="hyperparameters"]').should('be.visible')
    cy.get('[data-cy="feature-importance"]').should('be.visible')
    cy.get('[data-cy="performance-metrics"]').should('be.visible')
  })

  it('should show feature importance visualization', () => {
    cy.get('[data-cy="feature-importance-tab"]').click()
    cy.waitForChart('[data-cy="feature-importance-chart"]')
    cy.get('[data-cy="importance-bars"]').should('exist')
    cy.get('[data-cy="feature-ranking"]').should('be.visible')
  })

  it('should display model performance charts', () => {
    cy.get('[data-cy="performance-charts"]').should('be.visible')
    cy.waitForChart('[data-cy="confusion-matrix"]')
    cy.waitForChart('[data-cy="roc-curve"]')
    cy.waitForChart('[data-cy="precision-recall-curve"]')
  })

  it('should allow model comparison', () => {
    cy.get('[data-cy="compare-models"]').click()
    cy.get('[data-cy="model-comparison"]').should('be.visible')

    cy.get('[data-cy="select-model-1"]').select('RandomForest')
    cy.get('[data-cy="select-model-2"]').select('SVM')
    cy.get('[data-cy="generate-comparison"]').click()

    cy.get('[data-cy="comparison-chart"]').should('be.visible')
    cy.get('[data-cy="performance-difference"]').should('be.visible')
  })

  it('should show preprocessing impact analysis', () => {
    cy.get('[data-cy="preprocessing-analysis"]').click()
    cy.get('[data-cy="preprocessing-impact"]').should('be.visible')
    cy.get('[data-cy="before-after-comparison"]').should('be.visible')
    cy.waitForChart('[data-cy="impact-chart"]')
  })

  it('should display hyperparameter optimization results', () => {
    cy.get('[data-cy="hyperparameter-results"]').click()
    cy.get('[data-cy="optimization-history"]').should('be.visible')
    cy.waitForChart('[data-cy="optimization-chart"]')
    cy.get('[data-cy="parameter-importance"]').should('be.visible')
  })

  it('should export pipeline results', () => {
    cy.get('[data-cy="export-results"]').click()
    cy.get('[data-cy="export-options"]').should('be.visible')

    cy.get('[data-cy="export-summary"]').check()
    cy.get('[data-cy="export-models"]').check()
    cy.get('[data-cy="export-charts"]').check()
    cy.get('[data-cy="export-format"]').select('pdf')
    cy.get('[data-cy="generate-export"]').click()

    cy.get('[data-cy="export-progress"]').should('be.visible')
    cy.get('[data-cy="export-complete"]').should('be.visible')
  })

  it('should deploy best model from results', () => {
    cy.get('[data-cy="deploy-best-model"]').click()
    cy.get('[data-cy="deployment-config"]').should('be.visible')

    cy.get('[data-cy="deployment-name"]').type('AutoML Employee Performance Model')
    cy.get('[data-cy="deployment-environment"]').select('staging')
    cy.get('[data-cy="confirm-deployment"]').click()

    cy.get('[data-cy="deployment-initiated"]').should('be.visible')
  })

  it('should show execution timeline and bottlenecks', () => {
    cy.get('[data-cy="execution-timeline"]').click()
    cy.get('[data-cy="timeline-view"]').should('be.visible')
    cy.waitForChart('[data-cy="timeline-chart"]')
    cy.get('[data-cy="bottleneck-analysis"]').should('be.visible')
    cy.get('[data-cy="optimization-suggestions"]').should('be.visible')
  })

  it('should create experiment from results', () => {
    cy.get('[data-cy="create-experiment"]').click()
    cy.get('[data-cy="experiment-creation"]').should('be.visible')

    cy.get('[data-cy="experiment-name"]').type('AutoML Pipeline Experiment')
    cy.get('[data-cy="include-all-models"]').check()
    cy.get('[data-cy="create-experiment-confirm"]').click()

    cy.get('[data-cy="experiment-created"]').should('be.visible')
  })
})