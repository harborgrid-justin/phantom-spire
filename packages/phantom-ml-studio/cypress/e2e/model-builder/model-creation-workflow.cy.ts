describe('Model Creation Workflow', () => {
  beforeEach(() => {
    cy.visit('/model-builder')
    cy.get('[data-cy="page-loading"]').should('not.exist')
  })

  it('should display model creation interface', () => {
    cy.get('[data-cy="model-builder-title"]').should('be.visible')
    cy.get('[data-cy="create-new-model"]').should('be.visible')
    cy.get('[data-cy="model-templates"]').should('be.visible')
    cy.get('[data-cy="algorithm-categories"]').should('be.visible')
  })

  it('should start model creation workflow', () => {
    cy.get('[data-cy="create-new-model"]').click()
    cy.get('[data-cy="model-creation-wizard"]').should('be.visible')
    cy.get('[data-cy="step-indicator"]').should('be.visible')
    cy.get('[data-cy="current-step"]').should('contain', '1')
  })

  it('should select dataset for model training', () => {
    cy.get('[data-cy="create-new-model"]').click()
    cy.get('[data-cy="dataset-selector"]').should('be.visible')
    cy.get('[data-cy="available-datasets"]').should('be.visible')

    cy.get('[data-cy="dataset-item"]').first().click()
    cy.get('[data-cy="dataset-selected"]').should('be.visible')
    cy.get('[data-cy="next-step"]').click()
  })

  it('should configure target variable', () => {
    cy.get('[data-cy="create-new-model"]').click()
    cy.get('[data-cy="dataset-item"]').first().click()
    cy.get('[data-cy="next-step"]').click()

    cy.get('[data-cy="target-variable-selector"]').should('be.visible')
    cy.get('[data-cy="available-columns"]').should('be.visible')
    cy.get('[data-cy="column-performance_score"]').click()
    cy.get('[data-cy="target-selected"]').should('be.visible')
  })

  it('should select features for training', () => {
    cy.get('[data-cy="create-new-model"]').click()
    cy.get('[data-cy="dataset-item"]').first().click()
    cy.get('[data-cy="next-step"]').click()
    cy.get('[data-cy="column-performance_score"]').click()
    cy.get('[data-cy="next-step"]').click()

    cy.get('[data-cy="feature-selection"]').should('be.visible')
    cy.get('[data-cy="select-all-features"]').click()
    cy.get('[data-cy="selected-features"]').should('have.length.at.least', 3)
  })

  it('should provide model name and description', () => {
    cy.createModel('Performance Prediction Model', 'random-forest')

    cy.get('[data-cy="model-info-form"]').should('be.visible')
    cy.get('[data-cy="model-name-input"]').should('have.value', 'Performance Prediction Model')
    cy.get('[data-cy="model-description"]').type('Predicts employee performance based on demographics')
  })

  it('should validate required fields in model creation', () => {
    cy.get('[data-cy="create-new-model"]').click()
    cy.get('[data-cy="next-step"]').click() // Skip dataset selection

    cy.get('[data-cy="validation-error"]').should('be.visible')
    cy.get('[data-cy="error-message"]').should('contain', 'Dataset is required')
  })

  it('should show model creation progress', () => {
    cy.createModel('Test Model', 'linear-regression')
    cy.get('[data-cy="create-model-confirm"]').click()

    cy.get('[data-cy="model-creation-progress"]').should('be.visible')
    cy.get('[data-cy="progress-steps"]').should('be.visible')
    cy.get('[data-cy="current-progress"]').should('be.visible')
  })

  it('should handle model creation errors', () => {
    cy.intercept('POST', '**/api/models/create', { statusCode: 500 }).as('createModelError')

    cy.createModel('Test Model', 'svm')
    cy.get('[data-cy="create-model-confirm"]').click()

    cy.wait('@createModelError')
    cy.get('[data-cy="creation-error"]').should('be.visible')
    cy.get('[data-cy="error-details"]').should('be.visible')
  })

  it('should save model as draft', () => {
    cy.get('[data-cy="create-new-model"]').click()
    cy.get('[data-cy="dataset-item"]').first().click()
    cy.get('[data-cy="next-step"]').click()

    cy.get('[data-cy="save-as-draft"]').click()
    cy.get('[data-cy="draft-saved"]').should('be.visible')
    cy.get('[data-cy="draft-name-input"]').type('My Model Draft')
    cy.get('[data-cy="save-draft-confirm"]').click()
  })

  it('should load model from template', () => {
    cy.get('[data-cy="model-templates"]').should('be.visible')
    cy.get('[data-cy="template-classification"]').click()

    cy.get('[data-cy="template-details"]').should('be.visible')
    cy.get('[data-cy="use-template"]').click()

    cy.get('[data-cy="model-creation-wizard"]').should('be.visible')
    cy.get('[data-cy="pre-configured-settings"]').should('be.visible')
  })
})