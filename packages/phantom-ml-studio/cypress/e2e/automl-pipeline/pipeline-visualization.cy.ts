describe('AutoML Pipeline Visualization', () => {
  beforeEach(() => {
    cy.visit('/automl-pipeline-visualizer')
    cy.get('[data-cy="existing-pipeline"]').first().click()
    cy.get('[data-cy="view-pipeline"]').click()
  })

  it('should display pipeline workflow diagram', () => {
    cy.get('[data-cy="pipeline-diagram"]').should('be.visible')
    cy.get('[data-cy="workflow-canvas"]').should('be.visible')
    cy.get('[data-cy="pipeline-nodes"]').should('exist')
    cy.get('[data-cy="pipeline-edges"]').should('exist')
  })

  it('should show data preprocessing steps', () => {
    cy.get('[data-cy="preprocessing-section"]').should('be.visible')
    cy.get('[data-cy="data-ingestion-node"]').should('be.visible')
    cy.get('[data-cy="data-cleaning-node"]').should('be.visible')
    cy.get('[data-cy="feature-engineering-node"]').should('be.visible')
  })

  it('should display model selection and training stages', () => {
    cy.get('[data-cy="model-selection-section"]').should('be.visible')
    cy.get('[data-cy="algorithm-selection-node"]').should('be.visible')
    cy.get('[data-cy="hyperparameter-tuning-node"]').should('be.visible')
    cy.get('[data-cy="model-training-node"]').should('be.visible')
  })

  it('should show evaluation and validation steps', () => {
    cy.get('[data-cy="evaluation-section"]').should('be.visible')
    cy.get('[data-cy="cross-validation-node"]').should('be.visible')
    cy.get('[data-cy="performance-evaluation-node"]').should('be.visible')
    cy.get('[data-cy="model-selection-node"]').should('be.visible')
  })

  it('should allow zooming and panning of diagram', () => {
    cy.get('[data-cy="zoom-controls"]').should('be.visible')
    cy.get('[data-cy="zoom-in"]').click()
    cy.get('[data-cy="zoom-level"]').should('contain', '110%')

    cy.get('[data-cy="zoom-out"]').click()
    cy.get('[data-cy="zoom-level"]').should('contain', '100%')

    cy.get('[data-cy="zoom-fit"]').click()
    cy.get('[data-cy="diagram-fitted"]').should('be.visible')
  })

  it('should show node details on click', () => {
    cy.get('[data-cy="data-cleaning-node"]').click()
    cy.get('[data-cy="node-details-panel"]').should('be.visible')
    cy.get('[data-cy="node-title"]').should('contain', 'Data Cleaning')
    cy.get('[data-cy="node-description"]').should('be.visible')
    cy.get('[data-cy="node-parameters"]').should('be.visible')
  })

  it('should display execution status for each node', () => {
    cy.get('[data-cy="pipeline-nodes"] [data-cy="node-status"]').each($node => {
      cy.wrap($node).should('have.class', /status-(pending|running|completed|failed)/)
    })
  })

  it('should show data flow between nodes', () => {
    cy.get('[data-cy="data-flow-edges"]').should('be.visible')
    cy.get('[data-cy="edge-arrow"]').should('exist')
    cy.get('[data-cy="data-size-indicator"]').should('be.visible')
  })

  it('should allow switching between different view modes', () => {
    cy.get('[data-cy="view-mode-selector"]').should('be.visible')

    cy.get('[data-cy="view-detailed"]').click()
    cy.get('[data-cy="detailed-view"]').should('be.visible')

    cy.get('[data-cy="view-simplified"]').click()
    cy.get('[data-cy="simplified-view"]').should('be.visible')

    cy.get('[data-cy="view-compact"]').click()
    cy.get('[data-cy="compact-view"]').should('be.visible')
  })

  it('should show pipeline execution timeline', () => {
    cy.get('[data-cy="timeline-view"]').click()
    cy.get('[data-cy="execution-timeline"]').should('be.visible')
    cy.get('[data-cy="timeline-events"]').should('be.visible')
    cy.get('[data-cy="duration-bars"]').should('exist')
  })

  it('should display resource utilization visualization', () => {
    cy.get('[data-cy="resource-view"]').click()
    cy.get('[data-cy="resource-utilization"]').should('be.visible')

    cy.waitForChart('[data-cy="cpu-usage-chart"]')
    cy.waitForChart('[data-cy="memory-usage-chart"]')
    cy.get('[data-cy="resource-timeline"]').should('be.visible')
  })

  it('should export pipeline diagram', () => {
    cy.get('[data-cy="export-diagram"]').click()
    cy.get('[data-cy="export-options"]').should('be.visible')

    cy.get('[data-cy="export-png"]').click()
    cy.get('[data-cy="export-success"]').should('be.visible')
  })

  it('should show pipeline configuration summary', () => {
    cy.get('[data-cy="configuration-panel"]').click()
    cy.get('[data-cy="pipeline-config"]').should('be.visible')
    cy.get('[data-cy="data-config"]').should('be.visible')
    cy.get('[data-cy="algorithm-config"]').should('be.visible')
    cy.get('[data-cy="constraint-config"]').should('be.visible')
  })
})