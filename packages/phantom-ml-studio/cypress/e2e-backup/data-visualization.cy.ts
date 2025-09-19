describe('Data Visualization', () => {
  beforeEach(() => {
    cy.visit('/data-explorer')
    cy.uploadFile('cypress/fixtures/test-data.csv', '[data-cy="file-upload-input"]')
    cy.get('[data-cy="data-table"]').should('be.visible')
  })

  it('should display visualization options', () => {
    cy.get('[data-cy="visualization-tab"]').click()
    cy.get('[data-cy="chart-type-selector"]').should('be.visible')
    cy.get('[data-cy="chart-type-histogram"]').should('be.visible')
    cy.get('[data-cy="chart-type-scatter"]').should('be.visible')
    cy.get('[data-cy="chart-type-box"]').should('be.visible')
  })

  it('should create histogram visualization', () => {
    cy.get('[data-cy="visualization-tab"]').click()
    cy.get('[data-cy="chart-type-histogram"]').click()
    cy.get('[data-cy="x-axis-selector"]').select('Age')
    cy.get('[data-cy="generate-chart"]').click()

    cy.waitForChart('[data-cy="histogram-chart"]')
    cy.get('[data-cy="histogram-bars"]').should('exist')
    cy.get('[data-cy="chart-title"]').should('contain', 'Age Distribution')
  })

  it('should create scatter plot visualization', () => {
    cy.get('[data-cy="visualization-tab"]').click()
    cy.get('[data-cy="chart-type-scatter"]').click()
    cy.get('[data-cy="x-axis-selector"]').select('Age')
    cy.get('[data-cy="y-axis-selector"]').select('Salary')
    cy.get('[data-cy="generate-chart"]').click()

    cy.waitForChart('[data-cy="scatter-plot"]')
    cy.get('[data-cy="scatter-points"]').should('exist')
  })

  it('should create box plot for numerical columns', () => {
    cy.get('[data-cy="visualization-tab"]').click()
    cy.get('[data-cy="chart-type-box"]').click()
    cy.get('[data-cy="column-selector"]').select('Salary')
    cy.get('[data-cy="generate-chart"]').click()

    cy.waitForChart('[data-cy="box-plot"]')
    cy.get('[data-cy="box-plot-elements"]').should('exist')
  })

  it('should display correlation matrix', () => {
    cy.get('[data-cy="visualization-tab"]').click()
    cy.get('[data-cy="correlation-matrix"]').click()

    cy.waitForChart('[data-cy="correlation-heatmap"]')
    cy.get('[data-cy="correlation-values"]').should('be.visible')
    cy.get('[data-cy="heatmap-cells"]').should('exist')
  })

  it('should create pivot table visualization', () => {
    cy.get('[data-cy="visualization-tab"]').click()
    cy.get('[data-cy="pivot-table"]').click()
    cy.get('[data-cy="pivot-rows"]').select('Department')
    cy.get('[data-cy="pivot-values"]').select('Salary')
    cy.get('[data-cy="pivot-aggregation"]').select('average')
    cy.get('[data-cy="generate-pivot"]').click()

    cy.get('[data-cy="pivot-table-result"]').should('be.visible')
    cy.get('[data-cy="pivot-row"]').should('have.length.at.least', 3)
  })

  it('should customize chart appearance', () => {
    cy.get('[data-cy="visualization-tab"]').click()
    cy.get('[data-cy="chart-type-histogram"]').click()
    cy.get('[data-cy="x-axis-selector"]').select('Age')
    cy.get('[data-cy="generate-chart"]').click()

    cy.get('[data-cy="customize-chart"]').click()
    cy.get('[data-cy="chart-title-input"]').clear().type('Employee Age Distribution')
    cy.get('[data-cy="chart-color"]').click()
    cy.get('[data-cy="color-blue"]').click()
    cy.get('[data-cy="apply-customization"]').click()

    cy.get('[data-cy="chart-title"]').should('contain', 'Employee Age Distribution')
  })

  it('should export visualizations', () => {
    cy.get('[data-cy="visualization-tab"]').click()
    cy.get('[data-cy="chart-type-scatter"]').click()
    cy.get('[data-cy="x-axis-selector"]').select('Age')
    cy.get('[data-cy="y-axis-selector"]').select('Salary')
    cy.get('[data-cy="generate-chart"]').click()

    cy.get('[data-cy="export-chart"]').click()
    cy.get('[data-cy="export-png"]').click()
    cy.get('[data-cy="export-success"]').should('be.visible')
  })

  it('should show statistical summary charts', () => {
    cy.get('[data-cy="visualization-tab"]').click()
    cy.get('[data-cy="statistical-summary"]').click()

    cy.get('[data-cy="summary-charts"]').should('be.visible')
    cy.get('[data-cy="mean-chart"]').should('be.visible')
    cy.get('[data-cy="distribution-chart"]').should('be.visible')
  })

  it('should handle interactive chart features', () => {
    cy.get('[data-cy="visualization-tab"]').click()
    cy.get('[data-cy="chart-type-scatter"]').click()
    cy.get('[data-cy="x-axis-selector"]').select('Age')
    cy.get('[data-cy="y-axis-selector"]').select('Salary')
    cy.get('[data-cy="generate-chart"]').click()

    cy.waitForChart('[data-cy="scatter-plot"]')
    cy.interactWithChart('[data-cy="visualization-chart"]', 'hover')
    cy.get('[data-cy="chart-tooltip"]').should('be.visible')

    cy.get('[data-cy="enable-zoom"]').click()
    cy.get('[data-cy="scatter-plot"]').trigger('wheel', { deltaY: -100 })
    cy.get('[data-cy="zoom-indicator"]').should('be.visible')
  })
})