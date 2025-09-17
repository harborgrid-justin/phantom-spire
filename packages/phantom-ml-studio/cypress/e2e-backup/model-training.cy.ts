describe('Model Training', () => {
  beforeEach(() => {
    cy.visit('/model-builder')
    cy.createModel('Training Test Model', 'random-forest')
    cy.get('[data-cy="configure-parameters"]').click()
    cy.get('[data-cy="save-parameters"]').click()
    cy.get('[data-cy="next-step"]').click()
  })

  it('should display training configuration options', () => {
    cy.get('[data-cy="training-configuration"]').should('be.visible')
    cy.get('[data-cy="train-test-split"]').should('be.visible')
    cy.get('[data-cy="validation-method"]').should('be.visible')
    cy.get('[data-cy="training-options"]').should('be.visible')
  })

  it('should configure train-test split', () => {
    cy.get('[data-cy="train-split-slider"]').should('be.visible')
    cy.get('[data-cy="train-split-value"]').should('contain', '80%')

    cy.get('[data-cy="train-split-slider"]').click()
    cy.get('[data-cy="test-split-value"]').should('contain', '20%')
  })

  it('should start model training', () => {
    cy.mockModelTraining('test-model-123', 'training')
    cy.get('[data-cy="start-training"]').click()

    cy.get('[data-cy="training-started"]').should('be.visible')
    cy.get('[data-cy="training-progress"]').should('be.visible')
    cy.get('[data-cy="progress-bar"]').should('be.visible')
  })

  it('should display real-time training progress', () => {
    cy.mockModelTraining('test-model-123', 'training')
    cy.get('[data-cy="start-training"]').click()

    cy.get('[data-cy="current-epoch"]').should('be.visible')
    cy.get('[data-cy="training-loss"]').should('be.visible')
    cy.get('[data-cy="validation-accuracy"]').should('be.visible')
    cy.get('[data-cy="eta-remaining"]').should('be.visible')
  })

  it('should show training metrics in real-time', () => {
    cy.mockModelTraining('test-model-123', 'training')
    cy.get('[data-cy="start-training"]').click()

    cy.waitForChart('[data-cy="training-metrics-chart"]')
    cy.get('[data-cy="loss-curve"]').should('exist')
    cy.get('[data-cy="accuracy-curve"]').should('exist')
  })

  it('should allow pausing and resuming training', () => {
    cy.mockModelTraining('test-model-123', 'training')
    cy.get('[data-cy="start-training"]').click()

    cy.get('[data-cy="pause-training"]').click()
    cy.get('[data-cy="training-paused"]').should('be.visible')

    cy.get('[data-cy="resume-training"]').click()
    cy.get('[data-cy="training-resumed"]').should('be.visible')
  })

  it('should handle training completion', () => {
    cy.mockModelTraining('test-model-123', 'completed')
    cy.get('[data-cy="start-training"]').click()

    cy.get('[data-cy="training-complete"]').should('be.visible')
    cy.get('[data-cy="training-summary"]').should('be.visible')
    cy.get('[data-cy="final-accuracy"]').should('be.visible')
  })

  it('should display cross-validation results', () => {
    cy.get('[data-cy="enable-cross-validation"]').check()
    cy.get('[data-cy="cv-folds"]').type('5')
    cy.get('[data-cy="start-training"]').click()

    cy.get('[data-cy="cv-results"]').should('be.visible')
    cy.get('[data-cy="cv-scores"]').should('be.visible')
    cy.get('[data-cy="cv-mean-score"]').should('be.visible')
  })

  it('should handle training errors', () => {
    cy.intercept('POST', '**/api/models/train', { statusCode: 500 }).as('trainingError')
    cy.get('[data-cy="start-training"]').click()

    cy.wait('@trainingError')
    cy.get('[data-cy="training-error"]').should('be.visible')
    cy.get('[data-cy="error-details"]').should('be.visible')
    cy.get('[data-cy="retry-training"]').should('be.visible')
  })

  it('should save training logs', () => {
    cy.mockModelTraining('test-model-123', 'completed')
    cy.get('[data-cy="start-training"]').click()

    cy.get('[data-cy="training-complete"]').should('be.visible')
    cy.get('[data-cy="save-training-logs"]').click()
    cy.get('[data-cy="logs-saved"]').should('be.visible')
  })

  it('should configure early stopping', () => {
    cy.get('[data-cy="enable-early-stopping"]').check()
    cy.get('[data-cy="early-stopping-options"]').should('be.visible')

    cy.get('[data-cy="patience-input"]').type('10')
    cy.get('[data-cy="min-delta-input"]').type('0.01')
    cy.get('[data-cy="monitor-metric"]').select('val_loss')
  })

  it('should show resource usage during training', () => {
    cy.mockModelTraining('test-model-123', 'training')
    cy.get('[data-cy="start-training"]').click()

    cy.get('[data-cy="resource-monitor"]').should('be.visible')
    cy.get('[data-cy="cpu-usage"]').should('be.visible')
    cy.get('[data-cy="memory-usage"]').should('be.visible')
    cy.get('[data-cy="gpu-usage"]').should('be.visible')
  })

  it('should cancel training process', () => {
    cy.mockModelTraining('test-model-123', 'training')
    cy.get('[data-cy="start-training"]').click()

    cy.get('[data-cy="cancel-training"]').click()
    cy.get('[data-cy="confirm-cancel"]').click()
    cy.get('[data-cy="training-cancelled"]').should('be.visible')
  })
})