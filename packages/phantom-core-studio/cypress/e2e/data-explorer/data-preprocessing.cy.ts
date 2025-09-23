describe('Data Preprocessing Features', () => {
  beforeEach(() => {
    cy.visit('/dataExplorer')
    // Wait for page to load and make sure file upload input exists
    cy.get('[data-cy="file-upload-input"]', { timeout: 10000 }).should('exist')
    cy.uploadFile('[data-cy="file-upload-input"]', 'cypress/fixtures/test-data.csv')
    // Wait for file to be processed
    cy.get('[data-cy="data-loaded"]', { timeout: 15000 }).should('be.visible')
  })

  it('should handle missing value imputation', () => {
    cy.get('[data-cy="preprocessing-tools"]').click()
    cy.get('[data-cy="handle-missing-values"]').click()

    cy.get('[data-cy="imputation-strategy"]').select('mean')
    cy.get('[data-cy="apply-imputation"]').click()
    cy.get('[data-cy="imputation-complete"]').should('be.visible')
  })

  it('should perform data normalization', () => {
    cy.get('[data-cy="preprocessing-tools"]').click()
    cy.get('[data-cy="normalize-data"]').click()

    cy.get('[data-cy="normalization-method"]').select('standard')
    cy.get('[data-cy="apply-normalization"]').click()
    cy.get('[data-cy="normalization-preview"]').should('be.visible')
  })

  it('should encode categorical variables', () => {
    cy.get('[data-cy="preprocessing-tools"]').click()
    cy.get('[data-cy="encode-categorical"]').click()

    cy.get('[data-cy="encoding-method"]').select('one-hot')
    cy.get('[data-cy="select-categorical-columns"]').click()
    cy.get('[data-cy="column-department"]').check()
    cy.get('[data-cy="apply-encoding"]').click()
  })

  it('should detect and remove outliers', () => {
    cy.get('[data-cy="preprocessing-tools"]').click()
    cy.get('[data-cy="outlier-detection"]').click()

    cy.get('[data-cy="outlier-method"]').select('iqr')
    cy.get('[data-cy="detect-outliers"]').click()
    cy.get('[data-cy="outlier-visualization"]').should('be.visible')
    cy.get('[data-cy="remove-outliers"]').click()
  })

  it('should create feature engineering transformations', () => {
    cy.get('[data-cy="feature-engineering"]').click()
    cy.get('[data-cy="create-feature"]').click()

    cy.get('[data-cy="feature-name"]').type('salary_per_year')
    cy.get('[data-cy="feature-expression"]').type('salary / experience')
    cy.get('[data-cy="create-feature-confirm"]').click()
    cy.get('[data-cy="feature-created"]').should('be.visible')
  })
})