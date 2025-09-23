describe('A/B Testing Creation and Management', () => {
  beforeEach(() => {
    cy.visit('/multi-model-ab-testing')
    cy.get('[data-cy="page-loading"]').should('not.exist')
  })

  it('should display A/B testing dashboard', () => {
    cy.get('[data-cy="ab-testing-title"]').should('be.visible')
    cy.get('[data-cy="create-ab-test"]').should('be.visible')
    cy.get('[data-cy="active-tests"]').should('be.visible')
    cy.get('[data-cy="test-results"]').should('be.visible')
  })

  it('should create new A/B test', () => {
    cy.get('[data-cy="create-ab-test"]').click()
    cy.get('[data-cy="test-setup"]').should('be.visible')

    cy.get('[data-cy="test-name"]').type('Performance Model Comparison')
    cy.get('[data-cy="test-description"]').type('Comparing RandomForest vs SVM for employee performance prediction')
    cy.get('[data-cy="model-a"]').select('RandomForest Model')
    cy.get('[data-cy="model-b"]').select('SVM Model')
  })

  it('should configure test parameters', () => {
    cy.get('[data-cy="create-ab-test"]').click()
    cy.get('[data-cy="configure-basic-test"]').click()

    cy.get('[data-cy="traffic-split"]').type('50')
    cy.get('[data-cy="test-duration"]').type('14')
    cy.get('[data-cy="success-metric"]').select('accuracy')
    cy.get('[data-cy="significance-level"]').type('0.05')
    cy.get('[data-cy="start-test"]').click()
  })

  it('should monitor running A/B test', () => {
    cy.get('[data-cy="active-test"]').first().click()

    cy.get('[data-cy="test-progress"]').should('be.visible')
    cy.get('[data-cy="model-a-performance"]').should('be.visible')
    cy.get('[data-cy="model-b-performance"]').should('be.visible')
    cy.waitForChart('[data-cy="performance-comparison"]')
  })

  it('should analyze A/B test results', () => {
    cy.get('[data-cy="completed-test"]').first().click()

    cy.get('[data-cy="test-results"]').should('be.visible')
    cy.get('[data-cy="statistical-significance"]').should('be.visible')
    cy.get('[data-cy="confidence-interval"]').should('be.visible')
    cy.get('[data-cy="winner-declaration"]').should('be.visible')
  })

  it('should export A/B test report', () => {
    cy.get('[data-cy="completed-test"]').first().click()
    cy.get('[data-cy="export-results"]').click()

    cy.get('[data-cy="report-format"]').select('pdf')
    cy.get('[data-cy="include-charts"]').check()
    cy.get('[data-cy="include-statistical-analysis"]').check()
    cy.get('[data-cy="generate-report"]').click()

    cy.get('[data-cy="report-generated"]').should('be.visible')
  })
})