describe('Dashboard Filters and Controls', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
    cy.get('[data-cy="page-loading"]').should('not.exist')
  })

  it('should display dashboard filter controls', () => {
    cy.get('[data-cy="dashboard-filters"]').should('be.visible')
    cy.get('[data-cy="date-range-filter"]').should('be.visible')
    cy.get('[data-cy="model-type-filter"]').should('be.visible')
    cy.get('[data-cy="status-filter"]').should('be.visible')
  })

  it('should filter dashboard data by date range', () => {
    cy.get('[data-cy="date-range-filter"]').click()
    cy.get('[data-cy="date-range-last-7-days"]').click()
    cy.get('[data-cy="apply-filters"]').click()

    cy.get('[data-cy="filter-loading"]').should('be.visible')
    cy.get('[data-cy="filter-loading"]').should('not.exist')
    cy.get('[data-cy="active-filter-badge"]').should('contain', 'Last 7 days')
  })

  it('should filter by model type', () => {
    cy.get('[data-cy="model-type-filter"]').click()
    cy.get('[data-cy="filter-option-classification"]').click()
    cy.get('[data-cy="apply-filters"]').click()

    cy.get('[data-cy="filtered-results"]').should('be.visible')
    cy.get('[data-cy="active-filter-badge"]').should('contain', 'Classification')
  })

  it('should clear all applied filters', () => {
    // Apply multiple filters
    cy.get('[data-cy="model-type-filter"]').click()
    cy.get('[data-cy="filter-option-regression"]').click()
    cy.get('[data-cy="status-filter"]').click()
    cy.get('[data-cy="filter-option-active"]').click()
    cy.get('[data-cy="apply-filters"]').click()

    // Clear filters
    cy.get('[data-cy="clear-filters"]').click()
    cy.get('[data-cy="active-filter-badge"]').should('not.exist')
    cy.get('[data-cy="default-dashboard-view"]').should('be.visible')
  })

  it('should save and apply custom filter presets', () => {
    cy.get('[data-cy="model-type-filter"]').click()
    cy.get('[data-cy="filter-option-classification"]').click()
    cy.get('[data-cy="date-range-filter"]').click()
    cy.get('[data-cy="date-range-last-30-days"]').click()

    cy.get('[data-cy="save-filter-preset"]').click()
    cy.get('[data-cy="preset-name-input"]').type('My Custom Filter')
    cy.get('[data-cy="save-preset-confirm"]').click()

    cy.get('[data-cy="filter-preset-dropdown"]').click()
    cy.get('[data-cy="preset-my-custom-filter"]').should('be.visible')
  })

  it('should show filter results count', () => {
    cy.get('[data-cy="model-type-filter"]').click()
    cy.get('[data-cy="filter-option-regression"]').click()
    cy.get('[data-cy="apply-filters"]').click()

    cy.get('[data-cy="filter-results-count"]').should('be.visible')
    cy.get('[data-cy="filter-results-count"]').should('contain.match', /\d+ results/)
  })

  it('should handle advanced filter combinations', () => {
    cy.get('[data-cy="advanced-filters-toggle"]').click()
    cy.get('[data-cy="advanced-filters-panel"]').should('be.visible')

    cy.get('[data-cy="accuracy-range-filter"]').should('be.visible')
    cy.get('[data-cy="accuracy-min"]').type('0.8')
    cy.get('[data-cy="accuracy-max"]').type('0.95')

    cy.get('[data-cy="apply-advanced-filters"]').click()
    cy.get('[data-cy="advanced-filter-applied"]').should('be.visible')
  })

  it('should remember filter state on page reload', () => {
    cy.get('[data-cy="model-type-filter"]').click()
    cy.get('[data-cy="filter-option-classification"]').click()
    cy.get('[data-cy="apply-filters"]').click()

    cy.reload()
    cy.get('[data-cy="page-loading"]').should('not.exist')
    cy.get('[data-cy="active-filter-badge"]').should('contain', 'Classification')
  })
})