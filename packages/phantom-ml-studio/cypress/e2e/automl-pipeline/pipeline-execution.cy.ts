describe('AutoML Pipeline Execution', () => {
  beforeEach(() => {
    cy.visit('/automl-pipeline-visualizer')
    cy.get('[data-cy="page-loading"]').should('not.exist')
    // Click on a pipeline row to select it
    cy.get('tbody tr').first().click()
  })

  it('should start pipeline execution', () => {
    cy.get('[data-cy="execute-pipeline"]').click()
    cy.get('[data-cy="execution-confirmation"]').should('be.visible')
    cy.get('[data-cy="confirm-execution"]').click()

    cy.get('[data-cy="pipeline-executing"]').should('be.visible')
    cy.get('[data-cy="execution-progress"]').should('be.visible')
  })

  it('should show real-time execution progress', () => {
    cy.get('[data-cy="execute-pipeline"]').click()
    cy.get('[data-cy="confirm-execution"]').click()

    cy.get('[data-cy="progress-bar"]').should('be.visible')
    cy.get('[data-cy="current-step"]').should('be.visible')
    cy.get('[data-cy="estimated-time-remaining"]').should('be.visible')
    cy.get('[data-cy="execution-log"]').should('be.visible')
  })

  it('should display step-by-step execution status', () => {
    cy.get('[data-cy="execute-pipeline"]').click()
    cy.get('[data-cy="confirm-execution"]').click()

    cy.get('[data-cy="step-status-list"]').should('be.visible')
    cy.get('[data-cy="step-data-preprocessing"]').should('have.class', 'executing')
    cy.get('[data-cy="step-model-training"]').should('have.class', 'pending')
  })

  it('should show live performance metrics during execution', () => {
    cy.get('[data-cy="execute-pipeline"]').click()
    cy.get('[data-cy="confirm-execution"]').click()

    cy.get('[data-cy="live-metrics"]').should('be.visible')
    cy.waitForChart('[data-cy="accuracy-evolution-chart"]')
    cy.get('[data-cy="best-model-indicator"]').should('be.visible')
  })

  it('should allow pausing pipeline execution', () => {
    cy.get('[data-cy="execute-pipeline"]').click()
    cy.get('[data-cy="confirm-execution"]').click()

    cy.get('[data-cy="pause-execution"]').click()
    cy.get('[data-cy="execution-paused"]').should('be.visible')
    cy.get('[data-cy="pause-reason"]').should('be.visible')
  })

  it('should allow resuming paused execution', () => {
    cy.get('[data-cy="execute-pipeline"]').click()
    cy.get('[data-cy="confirm-execution"]').click()
    cy.get('[data-cy="pause-execution"]').click()

    cy.get('[data-cy="resume-execution"]').click()
    cy.get('[data-cy="execution-resumed"]').should('be.visible')
    cy.get('[data-cy="pipeline-executing"]').should('be.visible')
  })

  it('should handle execution errors gracefully', () => {
    cy.intercept('POST', '**/api/automl/execute', { statusCode: 500 }).as('executionError')

    cy.get('[data-cy="execute-pipeline"]').click()
    cy.get('[data-cy="confirm-execution"]').click()

    cy.wait('@executionError')
    cy.get('[data-cy="execution-error"]').should('be.visible')
    cy.get('[data-cy="error-details"]').should('be.visible')
    cy.get('[data-cy="retry-execution"]').should('be.visible')
  })

  it('should show resource consumption during execution', () => {
    cy.get('[data-cy="execute-pipeline"]').click()
    cy.get('[data-cy="confirm-execution"]').click()

    cy.get('[data-cy="resource-monitor"]').should('be.visible')
    cy.waitForChart('[data-cy="cpu-usage-chart"]')
    cy.waitForChart('[data-cy="memory-usage-chart"]')
    cy.get('[data-cy="execution-cost"]').should('be.visible')
  })

  it('should display intermediate results', () => {
    cy.get('[data-cy="execute-pipeline"]').click()
    cy.get('[data-cy="confirm-execution"]').click()

    cy.get('[data-cy="intermediate-results"]').should('be.visible')
    cy.get('[data-cy="preprocessing-results"]').should('be.visible')
    cy.get('[data-cy="feature-selection-results"]').should('be.visible')
  })

  it('should cancel pipeline execution', () => {
    cy.get('[data-cy="execute-pipeline"]').click()
    cy.get('[data-cy="confirm-execution"]').click()

    cy.get('[data-cy="cancel-execution"]').click()
    cy.get('[data-cy="cancel-confirmation"]').should('be.visible')
    cy.get('[data-cy="confirm-cancel"]').click()
    cy.get('[data-cy="execution-cancelled"]').should('be.visible')
  })

  it('should complete execution and show final results', () => {
    cy.intercept('GET', '**/api/automl/status/**', {
      status: 'completed',
      best_model: 'RandomForest',
      accuracy: 0.92
    }).as('executionComplete')

    cy.get('[data-cy="execute-pipeline"]').click()
    cy.get('[data-cy="confirm-execution"]').click()

    cy.wait('@executionComplete')
    cy.get('[data-cy="execution-complete"]').should('be.visible')
    cy.get('[data-cy="best-model-results"]').should('be.visible')
    cy.get('[data-cy="final-accuracy"]').should('contain', '92%')
  })

  it('should save execution results', () => {
    cy.intercept('GET', '**/api/automl/status/**', { status: 'completed' }).as('complete')

    cy.get('[data-cy="execute-pipeline"]').click()
    cy.get('[data-cy="confirm-execution"]').click()
    cy.wait('@complete')

    cy.get('[data-cy="save-results"]').click()
    cy.get('[data-cy="results-name"]').type('AutoML Results - Employee Performance')
    cy.get('[data-cy="save-results-confirm"]').click()
    cy.get('[data-cy="results-saved"]').should('be.visible')
  })
})