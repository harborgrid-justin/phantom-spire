describe('Data Parsing and Display', () => {
  beforeEach(() => {
    cy.visit('/dataExplorer')
    cy.uploadFile('[data-cy="file-upload-input"]', 'cypress/fixtures/test-data.csv')
    cy.get('[data-cy="upload-success-message"]').should('be.visible')
  })

  it('should parse CSV data correctly', () => {
    cy.get('[data-cy="data-table"]').should('be.visible')
    cy.get('[data-cy="table-header"]').should('contain', 'Name')
    cy.get('[data-cy="table-header"]').should('contain', 'Age')
    cy.get('[data-cy="table-header"]').should('contain', 'Salary')
    cy.get('[data-cy="table-row"]').should('have.length', 10)
  })

  it('should detect data types automatically', () => {
    cy.get('[data-cy="column-info"]').click()
    cy.get('[data-cy="column-info-panel"]').should('be.visible')

    cy.get('[data-cy="column-name"]').should('contain', 'Text')
    cy.get('[data-cy="column-age"]').should('contain', 'Number')
    cy.get('[data-cy="column-salary"]').should('contain', 'Number')
  })

  it('should display data statistics', () => {
    cy.get('[data-cy="data-statistics"]').should('be.visible')
    cy.get('[data-cy="total-rows"]').should('contain', '10')
    cy.get('[data-cy="total-columns"]').should('contain', '6')
    cy.get('[data-cy="missing-values"]').should('be.visible')
  })

  it('should show column statistics on click', () => {
    cy.get('[data-cy="table-header"]').contains('Age').click()
    cy.get('[data-cy="column-stats-modal"]').should('be.visible')
    cy.get('[data-cy="column-mean"]').should('be.visible')
    cy.get('[data-cy="column-median"]').should('be.visible')
    cy.get('[data-cy="column-std"]').should('be.visible')
  })

  it('should handle missing and null values', () => {
    cy.get('[data-cy="missing-values-indicator"]').should('be.visible')
    cy.get('[data-cy="null-value-cell"]').should('have.class', 'null-value')
    cy.get('[data-cy="missing-value-count"]').should('be.visible')
  })

  it('should allow manual data type correction', () => {
    cy.get('[data-cy="column-header-age"]').rightclick()
    cy.get('[data-cy="column-context-menu"]').should('be.visible')
    cy.get('[data-cy="change-data-type"]').click()

    cy.get('[data-cy="data-type-selector"]').should('be.visible')
    cy.get('[data-cy="data-type-text"]').click()
    cy.get('[data-cy="apply-data-type"]').click()

    cy.get('[data-cy="data-type-changed"]').should('be.visible')
  })

  it('should display data quality indicators', () => {
    cy.get('[data-cy="data-quality-panel"]').should('be.visible')
    cy.get('[data-cy="quality-score"]').should('be.visible')
    cy.get('[data-cy="completeness-indicator"]').should('be.visible')
    cy.get('[data-cy="consistency-indicator"]').should('be.visible')
  })

  it('should show data preview with pagination', () => {
    cy.get('[data-cy="pagination-controls"]').should('be.visible')
    cy.get('[data-cy="rows-per-page"]').should('be.visible')
    cy.get('[data-cy="current-page"]').should('contain', '1')

    cy.get('[data-cy="rows-per-page"]').select('5')
    cy.get('[data-cy="table-row"]').should('have.length', 5)
  })

  it('should handle different CSV delimiters', () => {
    cy.get('[data-cy="parsing-settings"]').click()
    cy.get('[data-cy="delimiter-semicolon"]').click()
    cy.get('[data-cy="reparse-data"]').click()

    cy.get('[data-cy="parsing-complete"]').should('be.visible')
  })

  it('should detect and display duplicate rows', () => {
    cy.get('[data-cy="duplicate-detection"]').click()
    cy.get('[data-cy="duplicate-analysis"]').should('be.visible')
    cy.get('[data-cy="duplicate-count"]').should('be.visible')
    cy.get('[data-cy="duplicate-rows"]').should('be.visible')
  })
})
