describe('Data Export Functionality', () => {
  beforeEach(() => {
    cy.visit('/data-explorer')
    cy.uploadFile('cypress/fixtures/test-data.csv', '[data-cy="file-upload-input"]')
    cy.get('[data-cy="data-table"]').should('be.visible')
  })

  it('should display export options', () => {
    cy.get('[data-cy="export-data"]').click()
    cy.get('[data-cy="export-options"]').should('be.visible')
    cy.get('[data-cy="export-csv"]').should('be.visible')
    cy.get('[data-cy="export-json"]').should('be.visible')
    cy.get('[data-cy="export-excel"]').should('be.visible')
  })

  it('should export data as CSV', () => {
    cy.get('[data-cy="export-data"]').click()
    cy.get('[data-cy="export-csv"]').click()

    cy.get('[data-cy="export-progress"]').should('be.visible')
    cy.get('[data-cy="export-complete"]').should('be.visible')
    cy.get('[data-cy="download-link"]').should('be.visible')
  })

  it('should export filtered data only', () => {
    cy.filterTable('Engineering')
    cy.get('[data-cy="export-data"]').click()
    cy.get('[data-cy="export-filtered-only"]').check()
    cy.get('[data-cy="export-csv"]').click()

    cy.get('[data-cy="export-summary"]').should('contain', '3 rows exported')
  })

  it('should export selected columns only', () => {
    cy.get('[data-cy="column-selector"]').click()
    cy.get('[data-cy="select-column-name"]').uncheck()
    cy.get('[data-cy="select-column-age"]').check()
    cy.get('[data-cy="select-column-salary"]').check()
    cy.get('[data-cy="apply-column-selection"]').click()

    cy.get('[data-cy="export-data"]').click()
    cy.get('[data-cy="export-csv"]').click()

    cy.get('[data-cy="export-summary"]').should('contain', '2 columns exported')
  })

  it('should export data as JSON with nested structure', () => {
    cy.get('[data-cy="export-data"]').click()
    cy.get('[data-cy="export-json"]').click()
    cy.get('[data-cy="json-structure-nested"]').check()
    cy.get('[data-cy="confirm-export"]').click()

    cy.get('[data-cy="export-complete"]').should('be.visible')
  })

  it('should export data with custom delimiter', () => {
    cy.get('[data-cy="export-data"]').click()
    cy.get('[data-cy="export-csv"]').click()
    cy.get('[data-cy="custom-delimiter"]').check()
    cy.get('[data-cy="delimiter-input"]').clear().type(';')
    cy.get('[data-cy="confirm-export"]').click()

    cy.get('[data-cy="export-settings-applied"]').should('be.visible')
  })

  it('should generate and download report', () => {
    cy.get('[data-cy="generate-report"]').click()
    cy.get('[data-cy="report-options"]').should('be.visible')

    cy.get('[data-cy="include-statistics"]').check()
    cy.get('[data-cy="include-visualizations"]').check()
    cy.get('[data-cy="report-format-pdf"]').click()
    cy.get('[data-cy="generate-report-confirm"]').click()

    cy.get('[data-cy="report-generation-progress"]').should('be.visible')
    cy.get('[data-cy="report-ready"]').should('be.visible', { timeout: 10000 })
  })

  it('should export data with metadata', () => {
    cy.get('[data-cy="export-data"]').click()
    cy.get('[data-cy="include-metadata"]').check()
    cy.get('[data-cy="export-json"]').click()

    cy.get('[data-cy="metadata-options"]').should('be.visible')
    cy.get('[data-cy="include-column-types"]').check()
    cy.get('[data-cy="include-statistics"]').check()
    cy.get('[data-cy="confirm-export"]').click()

    cy.get('[data-cy="export-with-metadata"]').should('be.visible')
  })

  it('should schedule recurring exports', () => {
    cy.get('[data-cy="schedule-export"]').click()
    cy.get('[data-cy="schedule-options"]').should('be.visible')

    cy.get('[data-cy="export-frequency"]').select('weekly')
    cy.get('[data-cy="export-format"]').select('csv')
    cy.get('[data-cy="email-recipient"]').type('test@example.com')
    cy.get('[data-cy="schedule-export-confirm"]').click()

    cy.get('[data-cy="export-scheduled"]').should('be.visible')
  })

  it('should handle large dataset export with chunking', () => {
    cy.intercept('POST', '**/api/data/export', {
      statusCode: 202,
      body: { jobId: 'export-123', status: 'processing' }
    }).as('largeExport')

    cy.get('[data-cy="export-data"]').click()
    cy.get('[data-cy="export-csv"]').click()

    cy.wait('@largeExport')
    cy.get('[data-cy="export-job-status"]').should('be.visible')
    cy.get('[data-cy="processing-indicator"]').should('be.visible')
  })
})