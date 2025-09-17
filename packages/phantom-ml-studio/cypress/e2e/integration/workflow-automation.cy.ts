describe('Workflow Automation', () => {
  beforeEach(() => {
    cy.visit('/settings')
    cy.get('[data-cy="automation-settings"]').click()
  })

  it('should create automated training workflow', () => {
    cy.get('[data-cy="create-workflow"]').click()
    cy.get('[data-cy="workflow-type"]').select('auto-training')

    cy.get('[data-cy="workflow-name"]').type('Daily Model Retraining')
    cy.get('[data-cy="trigger-schedule"]').select('daily')
    cy.get('[data-cy="data-source"]').select('production-data')
    cy.get('[data-cy="model-template"]').select('performance-prediction')
    cy.get('[data-cy="create-workflow"]').click()

    cy.get('[data-cy="workflow-created"]').should('be.visible')
  })

  it('should configure workflow triggers', () => {
    cy.get('[data-cy="workflow-item"]').first().click()
    cy.get('[data-cy="edit-triggers"]').click()

    cy.get('[data-cy="add-trigger"]').click()
    cy.get('[data-cy="trigger-type"]').select('data-drift')
    cy.get('[data-cy="drift-threshold"]').type('0.1')
    cy.get('[data-cy="save-trigger"]').click()
  })

  it('should monitor workflow execution', () => {
    cy.get('[data-cy="workflow-monitoring"]').click()
    cy.get('[data-cy="workflow-runs"]').should('be.visible')

    cy.get('[data-cy="workflow-run"]').first().click()
    cy.get('[data-cy="run-details"]').should('be.visible')
    cy.get('[data-cy="execution-log"]').should('be.visible')
  })

  it('should handle workflow failures', () => {
    cy.get('[data-cy="failed-workflow"]').first().click()
    cy.get('[data-cy="failure-analysis"]').should('be.visible')
    cy.get('[data-cy="error-message"]').should('be.visible')
    cy.get('[data-cy="retry-workflow"]').click()

    cy.get('[data-cy="workflow-restarted"]').should('be.visible')
  })

  it('should export workflow configurations', () => {
    cy.get('[data-cy="export-workflows"]').click()
    cy.get('[data-cy="export-format"]').select('yaml')
    cy.get('[data-cy="include-schedules"]').check()
    cy.get('[data-cy="export-config"]').click()

    cy.get('[data-cy="export-complete"]').should('be.visible')
  })
})