describe('Experiment Creation and Management', () => {
  beforeEach(() => {
    cy.visit('/experiments')
    cy.get('[data-cy="page-loading"]').should('not.exist')
  })

  it('should display experiments dashboard', () => {
    cy.get('[data-cy="experiments-title"]').should('be.visible')
    cy.get('[data-cy="create-experiment"]').should('be.visible')
    cy.get('[data-cy="experiments-list"]').should('be.visible')
    cy.get('[data-cy="experiment-filters"]').should('be.visible')
  })

  it('should create new experiment', () => {
    cy.get('[data-cy="create-experiment"]').click()
    cy.get('[data-cy="experiment-form"]').should('be.visible')

    cy.get('[data-cy="experiment-name"]').type('Employee Performance Prediction Experiment')
    cy.get('[data-cy="experiment-description"]').type('Comparing different algorithms for employee performance prediction')
    cy.get('[data-cy="experiment-tags"]').type('performance, prediction, classification')
    cy.get('[data-cy="create-experiment-confirm"]').click()

    cy.get('[data-cy="experiment-created"]').should('be.visible')
  })

  it('should add models to experiment', () => {
    cy.get('[data-cy="experiment-item"]').first().click()
    cy.get('[data-cy="add-models"]').click()

    cy.get('[data-cy="available-models"]').should('be.visible')
    cy.get('[data-cy="model-checkbox"]').first().check()
    cy.get('[data-cy="model-checkbox"]').eq(1).check()
    cy.get('[data-cy="add-selected-models"]').click()

    cy.get('[data-cy="models-added"]').should('be.visible')
  })

  it('should configure experiment parameters', () => {
    cy.get('[data-cy="experiment-item"]').first().click()
    cy.get('[data-cy="configure-experiment"]').click()

    cy.get('[data-cy="evaluation-metrics"]').should('be.visible')
    cy.get('[data-cy="metric-accuracy"]').check()
    cy.get('[data-cy="metric-precision"]').check()
    cy.get('[data-cy="metric-recall"]').check()

    cy.get('[data-cy="cross-validation"]').check()
    cy.get('[data-cy="cv-folds"]').type('5')
    cy.get('[data-cy="save-configuration"]').click()
  })

  it('should run experiment', () => {
    cy.get('[data-cy="experiment-item"]').first().click()
    cy.get('[data-cy="run-experiment"]').click()

    cy.get('[data-cy="experiment-running"]').should('be.visible')
    cy.get('[data-cy="progress-indicator"]').should('be.visible')
    cy.get('[data-cy="running-models"]').should('be.visible')
  })
})