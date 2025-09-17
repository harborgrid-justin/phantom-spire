describe('AutoML Pipeline Creation', () => {
  beforeEach(() => {
    cy.visit('/automl-pipeline-visualizer')
    cy.get('[data-cy="page-loading"]').should('not.exist')
  })

  it('should display AutoML pipeline interface', () => {
    cy.get('[data-cy="automl-title"]').should('be.visible')
    cy.get('[data-cy="create-pipeline"]').should('be.visible')
    cy.get('[data-cy="pipeline-templates"]').should('be.visible')
    cy.get('[data-cy="recent-pipelines"]').should('be.visible')
  })

  it('should start new pipeline creation', () => {
    cy.get('[data-cy="create-pipeline"]').click()
    cy.get('[data-cy="pipeline-wizard"]').should('be.visible')
    cy.get('[data-cy="step-1-data"]').should('be.visible')
    cy.get('[data-cy="wizard-progress"]').should('be.visible')
  })

  it('should configure data source for pipeline', () => {
    cy.get('[data-cy="create-pipeline"]').click()
    cy.get('[data-cy="data-source-selector"]').should('be.visible')

    cy.get('[data-cy="upload-dataset"]').click()
    cy.uploadFile('cypress/fixtures/test-data.csv', '[data-cy="dataset-upload"]')
    cy.get('[data-cy="dataset-preview"]').should('be.visible')
    cy.get('[data-cy="next-step"]').click()
  })

  it('should set pipeline objectives', () => {
    cy.get('[data-cy="create-pipeline"]').click()
    cy.get('[data-cy="dataset-item"]').first().click()
    cy.get('[data-cy="next-step"]').click()

    cy.get('[data-cy="objective-selection"]').should('be.visible')
    cy.get('[data-cy="objective-classification"]').click()
    cy.get('[data-cy="target-column"]').select('Performance_Score')
    cy.get('[data-cy="optimization-metric"]').select('accuracy')
  })

  it('should configure pipeline constraints', () => {
    cy.get('[data-cy="create-pipeline"]').click()
    cy.get('[data-cy="skip-to-constraints"]').click()

    cy.get('[data-cy="time-constraint"]').type('60')
    cy.get('[data-cy="memory-constraint"]').type('8')
    cy.get('[data-cy="model-complexity"]').select('medium')
    cy.get('[data-cy="interpretability-level"]').select('high')
  })

  it('should select algorithm families', () => {
    cy.get('[data-cy="create-pipeline"]').click()
    cy.get('[data-cy="skip-to-algorithms"]').click()

    cy.get('[data-cy="algorithm-families"]').should('be.visible')
    cy.get('[data-cy="family-tree-based"]').check()
    cy.get('[data-cy="family-linear"]').check()
    cy.get('[data-cy="family-ensemble"]').check()
    cy.get('[data-cy="exclude-neural-networks"]').check()
  })

  it('should configure preprocessing steps', () => {
    cy.get('[data-cy="create-pipeline"]').click()
    cy.get('[data-cy="skip-to-preprocessing"]').click()

    cy.get('[data-cy="preprocessing-options"]').should('be.visible')
    cy.get('[data-cy="enable-scaling"]').check()
    cy.get('[data-cy="enable-encoding"]').check()
    cy.get('[data-cy="handle-missing-values"]').select('impute')
    cy.get('[data-cy="feature-selection"]').check()
  })

  it('should validate pipeline configuration', () => {
    cy.get('[data-cy="create-pipeline"]').click()
    cy.get('[data-cy="skip-to-review"]').click()

    cy.get('[data-cy="pipeline-summary"]').should('be.visible')
    cy.get('[data-cy="data-source-info"]').should('be.visible')
    cy.get('[data-cy="objective-info"]').should('be.visible')
    cy.get('[data-cy="constraints-info"]').should('be.visible')
  })

  it('should create pipeline from template', () => {
    cy.get('[data-cy="pipeline-templates"]').should('be.visible')
    cy.get('[data-cy="template-classification"]').click()

    cy.get('[data-cy="template-details"]').should('be.visible')
    cy.get('[data-cy="use-template"]').click()
    cy.get('[data-cy="template-applied"]').should('be.visible')
  })

  it('should save pipeline as draft', () => {
    cy.get('[data-cy="create-pipeline"]').click()
    cy.get('[data-cy="dataset-item"]').first().click()
    cy.get('[data-cy="next-step"]').click()
    cy.get('[data-cy="objective-classification"]').click()

    cy.get('[data-cy="save-draft"]').click()
    cy.get('[data-cy="draft-name"]').type('My AutoML Draft')
    cy.get('[data-cy="save-draft-confirm"]').click()
    cy.get('[data-cy="draft-saved"]').should('be.visible')
  })

  it('should estimate pipeline execution time', () => {
    cy.get('[data-cy="create-pipeline"]').click()
    cy.get('[data-cy="complete-basic-config"]').click() // Helper to complete basic config

    cy.get('[data-cy="estimate-execution-time"]').click()
    cy.get('[data-cy="time-estimation"]').should('be.visible')
    cy.get('[data-cy="estimated-duration"]').should('be.visible')
    cy.get('[data-cy="resource-requirements"]').should('be.visible')
  })

  it('should handle pipeline creation errors', () => {
    cy.intercept('POST', '**/api/automl/pipelines', { statusCode: 500 }).as('pipelineError')

    cy.get('[data-cy="create-pipeline"]').click()
    cy.get('[data-cy="complete-basic-config"]').click()
    cy.get('[data-cy="create-pipeline-confirm"]').click()

    cy.wait('@pipelineError')
    cy.get('[data-cy="creation-error"]').should('be.visible')
    cy.get('[data-cy="error-message"]').should('be.visible')
  })

  it('should clone existing pipeline', () => {
    cy.get('[data-cy="recent-pipelines"]').should('be.visible')
    cy.get('[data-cy="pipeline-item"]').first().find('[data-cy="clone-pipeline"]').click()

    cy.get('[data-cy="clone-confirmation"]').should('be.visible')
    cy.get('[data-cy="new-pipeline-name"]').type('Cloned Pipeline')
    cy.get('[data-cy="confirm-clone"]').click()
    cy.get('[data-cy="pipeline-cloned"]').should('be.visible')
  })
})