describe('Data Integration and Sources', () => {
  beforeEach(() => {
    cy.visit('/data-explorer')
  })

  it('should connect to external databases', () => {
    cy.get('[data-cy="connect-database"]').click()
    cy.get('[data-cy="database-type"]').select('postgresql')
    cy.get('[data-cy="connection-string"]').type('postgresql://user:pass@localhost:5432/mldata')
    cy.get('[data-cy="test-connection"]').click()

    cy.get('[data-cy="connection-success"]').should('be.visible')
  })

  it('should import data from APIs', () => {
    cy.get('[data-cy="api-import"]').click()
    cy.get('[data-cy="api-endpoint"]').type('https://api.example.com/data')
    cy.get('[data-cy="auth-method"]').select('bearer-token')
    cy.get('[data-cy="api-token"]').type('test-token')
    cy.get('[data-cy="import-data"]').click()

    cy.get('[data-cy="import-progress"]').should('be.visible')
  })

  it('should sync with cloud storage', () => {
    cy.get('[data-cy="cloud-storage"]').click()
    cy.get('[data-cy="storage-provider"]').select('aws-s3')
    cy.get('[data-cy="bucket-name"]').type('ml-data-bucket')
    cy.get('[data-cy="access-key"]').type('AKIAIOSFODNN7EXAMPLE')
    cy.get('[data-cy="sync-data"]').click()

    cy.get('[data-cy="sync-started"]').should('be.visible')
  })

  it('should validate data integrity', () => {
    cy.uploadFile('cypress/fixtures/test-data.csv', '[data-cy="file-upload-input"]')
    cy.get('[data-cy="validate-data"]').click()

    cy.get('[data-cy="data-validation-results"]').should('be.visible')
    cy.get('[data-cy="validation-score"]').should('be.visible')
    cy.get('[data-cy="data-quality-issues"]').should('be.visible')
  })

  it('should handle data versioning', () => {
    cy.uploadFile('cypress/fixtures/test-data.csv', '[data-cy="file-upload-input"]')
    cy.get('[data-cy="version-data"]').click()

    cy.get('[data-cy="version-name"]').type('v1.0')
    cy.get('[data-cy="version-description"]').type('Initial dataset version')
    cy.get('[data-cy="create-version"]').click()

    cy.get('[data-cy="version-created"]').should('be.visible')
  })
})