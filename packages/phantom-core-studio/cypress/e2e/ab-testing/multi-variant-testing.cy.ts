describe('Multi-Variant Testing', () => {
  beforeEach(() => {
    cy.visit('/multi-model-ab-testing')
  })

  it('should create multi-variant test', () => {
    cy.get('[data-cy="create-multivariant-test"]').click()
    cy.get('[data-cy="test-setup"]').should('be.visible')

    cy.get('[data-cy="test-name"]').type('Multi-Model Performance Test')
    cy.get('[data-cy="add-variant"]').click()
    cy.get('[data-cy="variant-a"]').select('RandomForest Model')
    cy.get('[data-cy="add-variant"]').click()
    cy.get('[data-cy="variant-b"]').select('SVM Model')
    cy.get('[data-cy="add-variant"]').click()
    cy.get('[data-cy="variant-c"]').select('Neural Network Model')
  })

  it('should configure traffic distribution', () => {
    cy.get('[data-cy="multivariant-test"]').first().click()
    cy.get('[data-cy="traffic-distribution"]').click()

    cy.get('[data-cy="variant-a-traffic"]').type('40')
    cy.get('[data-cy="variant-b-traffic"]').type('30')
    cy.get('[data-cy="variant-c-traffic"]').type('30')
    cy.get('[data-cy="save-distribution"]').click()
  })

  it('should monitor multi-variant performance', () => {
    cy.get('[data-cy="running-multivariant-test"]').first().click()

    cy.get('[data-cy="variant-performance"]').should('be.visible')
    cy.waitForChart('[data-cy="multi-variant-chart"]')
    cy.get('[data-cy="variant-ranking"]').should('be.visible')
  })

  it('should perform pairwise comparisons', () => {
    cy.get('[data-cy="completed-multivariant-test"]').first().click()
    cy.get('[data-cy="pairwise-analysis"]').click()

    cy.get('[data-cy="comparison-matrix"]').should('be.visible')
    cy.get('[data-cy="statistical-significance"]').should('be.visible')
    cy.get('[data-cy="effect-sizes"]').should('be.visible')
  })

  it('should identify winning variant', () => {
    cy.get('[data-cy="completed-multivariant-test"]').first().click()
    cy.get('[data-cy="winner-analysis"]').click()

    cy.get('[data-cy="winning-variant"]').should('be.visible')
    cy.get('[data-cy="confidence-level"]').should('be.visible')
    cy.get('[data-cy="performance-improvement"]').should('be.visible')
  })
})