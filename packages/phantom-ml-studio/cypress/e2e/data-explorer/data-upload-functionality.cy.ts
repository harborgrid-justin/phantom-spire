describe('Data Upload Functionality', () => {
  beforeEach(() => {
    cy.visit('/dataExplorer')
    cy.get('[data-cy="page-loading"]').should('not.exist')
  })

  it('should display data upload interface', () => {
    cy.get('[data-cy="data-upload-section"]').should('be.visible')
    cy.get('[data-cy="file-upload-area"]').should('be.visible')
    cy.get('[data-cy="upload-instructions"]').should('be.visible')
    cy.get('[data-cy="supported-formats"]').should('contain', 'CSV')
  })

  it('should upload CSV file successfully', () => {
    cy.uploadFile('cypress/fixtures/test-data.csv', '[data-cy="file-upload-input"]')
    cy.get('[data-cy="upload-success-message"]').should('be.visible')
    cy.get('[data-cy="uploaded-file-name"]').should('contain', 'test-data.csv')
  })

  it('should validate file format during upload', () => {
    cy.get('[data-cy="file-upload-input"]').selectFile('cypress/fixtures/model-configs.json', { force: true })
    cy.get('[data-cy="upload-error"]').should('be.visible')
    cy.get('[data-cy="error-message"]').should('contain', 'Unsupported file format')
  })

  it('should show upload progress for large files', () => {
    cy.intercept('POST', '**/api/data/upload', { delay: 3000 }).as('uploadAPI')

    cy.uploadFile('cypress/fixtures/test-data.csv', '[data-cy="file-upload-input"]')
    cy.get('[data-cy="upload-progress-bar"]').should('be.visible')
    cy.get('[data-cy="progress-percentage"]').should('be.visible')

    cy.wait('@uploadAPI')
    cy.get('[data-cy="upload-progress-bar"]').should('not.exist')
  })

  it('should handle drag and drop file upload', () => {
    cy.get('[data-cy="file-upload-area"]')
      .selectFile('cypress/fixtures/test-data.csv', { action: 'drag-drop' })

    cy.get('[data-cy="drop-zone-active"]').should('have.class', 'active')
    cy.get('[data-cy="upload-success-message"]').should('be.visible')
  })

  it('should allow multiple file upload', () => {
    cy.get('[data-cy="enable-multiple-upload"]').click()
    cy.get('[data-cy="file-upload-input"]').selectFile([
      'cypress/fixtures/test-data.csv'
    ], { force: true })

    cy.get('[data-cy="uploaded-files-list"]').should('be.visible')
    cy.get('[data-cy="file-item"]').should('have.length', 1)
  })

  it('should preview uploaded data', () => {
    cy.uploadFile('cypress/fixtures/test-data.csv', '[data-cy="file-upload-input"]')
    cy.get('[data-cy="preview-data"]').click()

    cy.get('[data-cy="data-preview-table"]').should('be.visible')
    cy.get('[data-cy="preview-row"]').should('have.length.at.least', 5)
    cy.get('[data-cy="preview-column"]').should('contain', 'Name')
  })

  it('should configure data parsing options', () => {
    cy.uploadFile('cypress/fixtures/test-data.csv', '[data-cy="file-upload-input"]')
    cy.get('[data-cy="configure-parsing"]').click()

    cy.get('[data-cy="parsing-options"]').should('be.visible')
    cy.get('[data-cy="delimiter-select"]').select(',')
    cy.get('[data-cy="header-row-checkbox"]').check()
    cy.get('[data-cy="apply-parsing"]').click()

    cy.get('[data-cy="parsing-applied"]').should('be.visible')
  })

  it('should handle upload errors gracefully', () => {
    cy.intercept('POST', '**/api/data/upload', { statusCode: 500 }).as('uploadError')

    cy.uploadFile('cypress/fixtures/test-data.csv', '[data-cy="file-upload-input"]')
    cy.wait('@uploadError')

    cy.get('[data-cy="upload-error"]').should('be.visible')
    cy.get('[data-cy="retry-upload"]').should('be.visible')
  })

  it('should save uploaded dataset with metadata', () => {
    cy.uploadFile('cypress/fixtures/test-data.csv', '[data-cy="file-upload-input"]')
    cy.get('[data-cy="save-dataset"]').click()

    cy.get('[data-cy="dataset-name-input"]').type('Employee Performance Data')
    cy.get('[data-cy="dataset-description"]').type('Sample employee performance dataset')
    cy.get('[data-cy="save-dataset-confirm"]').click()

    cy.get('[data-cy="dataset-saved-notification"]').should('be.visible')
  })
})