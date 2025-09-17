describe('Experiment Tracking and Results', () => {
  beforeEach(() => {
    cy.visit('/experiments')
    cy.get('[data-cy="running-experiment"]').first().click()
  })

  it('should display real-time experiment progress', () => {
    cy.get('[data-cy="experiment-progress"]').should('be.visible')
    cy.get('[data-cy="models-progress"]').should('be.visible')
    cy.get('[data-cy="current-model"]').should('be.visible')
    cy.get('[data-cy="eta-completion"]').should('be.visible')
  })

  it('should track metrics during training', () => {
    cy.get('[data-cy="metrics-tracking"]').should('be.visible')
    cy.waitForChart('[data-cy="metrics-chart"]')
    cy.get('[data-cy="accuracy-trend"]').should('exist')
    cy.get('[data-cy="loss-trend"]').should('exist')
  })

  it('should log experiment parameters and hyperparameters', () => {
    cy.get('[data-cy="parameters-log"]').click()
    cy.get('[data-cy="logged-parameters"]').should('be.visible')
    cy.get('[data-cy="hyperparameter-values"]').should('be.visible')
    cy.get('[data-cy="parameter-history"]').should('be.visible')
  })

  it('should compare model performance in real-time', () => {
    cy.get('[data-cy="model-comparison"]').click()
    cy.get('[data-cy="comparison-table"]').should('be.visible')
    cy.get('[data-cy="performance-ranking"]').should('be.visible')
    cy.waitForChart('[data-cy="comparison-chart"]')
  })

  it('should save experiment artifacts', () => {
    cy.get('[data-cy="artifacts"]').click()
    cy.get('[data-cy="model-artifacts"]').should('be.visible')
    cy.get('[data-cy="training-plots"]').should('be.visible')
    cy.get('[data-cy="confusion-matrices"]').should('be.visible')
    cy.get('[data-cy="feature-importance"]').should('be.visible')
  })

  it('should handle experiment completion', () => {
    cy.intercept('GET', '**/api/experiments/*/status', { status: 'completed' }).as('completed')
    cy.wait('@completed')

    cy.get('[data-cy="experiment-completed"]').should('be.visible')
    cy.get('[data-cy="final-results"]').should('be.visible')
    cy.get('[data-cy="best-model"]').should('be.visible')
  })
})