describe('Algorithm Selection', () => {
  beforeEach(() => {
    cy.visit('/model-builder')
    cy.get('[data-cy="create-new-model"]').click()
    cy.get('[data-cy="dataset-item"]').first().click()
    cy.get('[data-cy="next-step"]').click()
    cy.get('[data-cy="column-performance_score"]').click()
    cy.get('[data-cy="next-step"]').click()
    cy.get('[data-cy="select-all-features"]').click()
    cy.get('[data-cy="next-step"]').click()
  })

  it('should display available algorithm categories', () => {
    cy.get('[data-cy="algorithm-selection"]').should('be.visible')
    cy.get('[data-cy="category-classification"]').should('be.visible')
    cy.get('[data-cy="category-regression"]').should('be.visible')
    cy.get('[data-cy="category-clustering"]').should('be.visible')
    cy.get('[data-cy="category-neural-networks"]').should('be.visible')
  })

  it('should show algorithms for classification', () => {
    cy.get('[data-cy="category-classification"]').click()
    cy.get('[data-cy="algorithm-list"]').should('be.visible')

    cy.get('[data-cy="algorithm-random-forest"]').should('be.visible')
    cy.get('[data-cy="algorithm-svm"]').should('be.visible')
    cy.get('[data-cy="algorithm-logistic-regression"]').should('be.visible')
    cy.get('[data-cy="algorithm-naive-bayes"]').should('be.visible')
  })

  it('should show algorithms for regression', () => {
    cy.get('[data-cy="category-regression"]').click()
    cy.get('[data-cy="algorithm-list"]').should('be.visible')

    cy.get('[data-cy="algorithm-linear-regression"]').should('be.visible')
    cy.get('[data-cy="algorithm-ridge-regression"]').should('be.visible')
    cy.get('[data-cy="algorithm-lasso-regression"]').should('be.visible')
    cy.get('[data-cy="algorithm-polynomial-regression"]').should('be.visible')
  })

  it('should display algorithm information on selection', () => {
    cy.get('[data-cy="category-classification"]').click()
    cy.get('[data-cy="algorithm-random-forest"]').click()

    cy.get('[data-cy="algorithm-info"]').should('be.visible')
    cy.get('[data-cy="algorithm-description"]').should('contain', 'Random Forest')
    cy.get('[data-cy="algorithm-pros"]').should('be.visible')
    cy.get('[data-cy="algorithm-cons"]').should('be.visible')
    cy.get('[data-cy="complexity-level"]').should('be.visible')
  })

  it('should recommend algorithms based on data', () => {
    cy.get('[data-cy="auto-recommend"]').click()
    cy.get('[data-cy="recommendation-results"]').should('be.visible')

    cy.get('[data-cy="recommended-algorithm"]').should('be.visible')
    cy.get('[data-cy="recommendation-reason"]').should('be.visible')
    cy.get('[data-cy="confidence-score"]').should('be.visible')
  })

  it('should compare multiple algorithms', () => {
    cy.get('[data-cy="category-classification"]').click()
    cy.get('[data-cy="algorithm-random-forest"] [data-cy="compare-checkbox"]').check()
    cy.get('[data-cy="algorithm-svm"] [data-cy="compare-checkbox"]').check()

    cy.get('[data-cy="compare-algorithms"]').click()
    cy.get('[data-cy="comparison-table"]').should('be.visible')
    cy.get('[data-cy="performance-comparison"]').should('be.visible')
  })

  it('should filter algorithms by complexity', () => {
    cy.get('[data-cy="complexity-filter"]').select('beginner')
    cy.get('[data-cy="algorithm-list"] [data-cy="algorithm-item"]').each($item => {
      cy.wrap($item).find('[data-cy="complexity-level"]').should('contain', 'Beginner')
    })
  })

  it('should show algorithm performance estimates', () => {
    cy.get('[data-cy="category-regression"]').click()
    cy.get('[data-cy="algorithm-linear-regression"]').click()

    cy.get('[data-cy="performance-estimate"]').should('be.visible')
    cy.get('[data-cy="estimated-accuracy"]').should('be.visible')
    cy.get('[data-cy="training-time"]').should('be.visible')
    cy.get('[data-cy="inference-speed"]').should('be.visible')
  })

  it('should handle algorithm selection validation', () => {
    cy.get('[data-cy="next-step"]').click()
    cy.get('[data-cy="validation-error"]').should('be.visible')
    cy.get('[data-cy="error-message"]').should('contain', 'Please select an algorithm')
  })

  it('should show Hugging Face model integration', () => {
    cy.get('[data-cy="category-neural-networks"]').click()
    cy.get('[data-cy="huggingface-models"]').should('be.visible')

    cy.get('[data-cy="browse-huggingface"]').click()
    cy.get('[data-cy="huggingface-browser"]').should('be.visible')
    cy.get('[data-cy="model-search"]').should('be.visible')
  })

  it('should allow custom algorithm configuration', () => {
    cy.get('[data-cy="category-classification"]').click()
    cy.get('[data-cy="algorithm-random-forest"]').click()
    cy.get('[data-cy="configure-algorithm"]').click()

    cy.get('[data-cy="algorithm-parameters"]').should('be.visible')
    cy.get('[data-cy="parameter-n_estimators"]').should('be.visible')
    cy.get('[data-cy="parameter-max_depth"]').should('be.visible')
  })
})