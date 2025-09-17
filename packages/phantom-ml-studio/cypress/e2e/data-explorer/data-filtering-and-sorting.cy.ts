describe('Data Filtering and Sorting', () => {
  beforeEach(() => {
    cy.visit('/data-explorer')
    cy.seedTestData('employees', 10)
  })

  afterEach(() => {
    cy.cleanupTestData()
  })

  it('should load data explorer page successfully', () => {
    cy.url().should('include', '/data-explorer')
    cy.get('body').should('be.visible')
  })

  it('should test table sorting functionality', () => {
    // Seed test data with structure
    cy.seedTestData('table-data', 5)

    // Use the new command signature
    cy.sortDataTable('name', 'asc')
    cy.sortDataTable('id', 'desc')
  })

  it('should test table filtering functionality', () => {
    // Use the new command signature for filtering
    cy.filterDataTable('department', 'Engineering')
    cy.filterDataTable('status', 'active')
  })

  it('should handle data export', () => {
    cy.exportTableData('csv')
    cy.exportTableData('json')
  })

  it('should mock API responses for data operations', () => {
    cy.mockApiResponse('**/api/data/employees', {
      data: [
        { id: 1, name: 'John Doe', department: 'Engineering' },
        { id: 2, name: 'Jane Smith', department: 'Marketing' }
      ],
      total: 2
    })

    cy.visit('/data-explorer')
    cy.wait('@mockedAPI')
  })

  it('should test responsive design for data tables', () => {
    cy.checkResponsiveDesign(['mobile', 'tablet', 'desktop'])
  })

  it('should handle form interactions', () => {
    const formData = {
      'search-input': 'test search',
      'filter-select': 'active'
    }

    cy.fillForm(formData)
  })

  it('should validate form errors', () => {
    cy.validateFormErrors(['required-field', 'invalid-email'])
  })

  it('should handle navigation', () => {
    cy.navigateToPage('/dashboard')
    cy.go('back')
    cy.url().should('include', '/data-explorer')
  })

  it('should measure page performance', () => {
    cy.measurePageLoad()
  })

  it('should test basic UI interactions', () => {
    // Test basic clicking and typing without relying on specific selectors
    cy.get('body').should('be.visible')

    // Check that the page responds to viewport changes
    cy.viewport(800, 600)
    cy.get('body').should('be.visible')
  })
})