/// <reference types="cypress" />
import { BasePage } from './BasePage';

/**
 * Data Explorer Page Object Model
 */
export class DataExplorerPage extends BasePage {
  constructor() {
    super('/dataExplorer', '[data-cy="data-explorer-content"]');
  }

  // Selectors
  private readonly selectors = {
    uploadArea: '[data-cy="file-upload-area"]',
    fileInput: '[data-cy="file-input"]',
    uploadButton: '[data-cy="upload-button"]',
    uploadProgress: '[data-cy="upload-progress"]',
    dataTable: '[data-cy="data-table"]',
    tableHeaders: '[data-cy="table-header"]',
    tableRows: '[data-cy="table-row"]',
    tableCells: '[data-cy="table-cell"]',
    searchInput: '[data-cy="table-search"]',
    filterPanel: '[data-cy="filter-panel"]',
    sortDropdown: '[data-cy="sort-dropdown"]',
    paginationControls: '[data-cy="pagination"]',
    rowsPerPageSelect: '[data-cy="rows-per-page"]',
    columnToggle: '[data-cy="column-toggle"]',
    exportButton: '[data-cy="export-button"]',
    dataPreview: '[data-cy="data-preview"]',
    statisticsPanel: '[data-cy="statistics-panel"]',
    missingValueIndicator: '[data-cy="missing-value"]',
    dataTypeIndicator: '[data-cy="data-type"]',
    chartVisualization: '[data-cy="data-visualization"]',
    preprocessingPanel: '[data-cy="preprocessing-panel"]',
    transformationOptions: '[data-cy="transformation-options"]',
    correlationMatrix: '[data-cy="correlation-matrix"]',
    distributionChart: '[data-cy="distribution-chart"]',
    outlierDetection: '[data-cy="outlier-detection"]',
    dataQualityScore: '[data-cy="data-quality-score"]',
    schemaViewer: '[data-cy="schema-viewer"]',
    sampleData: '[data-cy="sample-data"]',
    downloadTemplate: '[data-cy="download-template"]',
    refreshData: '[data-cy="refresh-data"]',
    saveDataset: '[data-cy="save-dataset"]',
    loadDataset: '[data-cy="load-dataset"]',
    bulkActions: '[data-cy="bulk-actions"]',
    selectedRowsCount: '[data-cy="selected-rows-count"]',
    dataSourceSelector: '[data-cy="data-source-selector"]',
    connectionStatus: '[data-cy="connection-status"]',
    queryBuilder: '[data-cy="query-builder"]',
    sqlEditor: '[data-cy="sql-editor"]',
    executeQuery: '[data-cy="execute-query"]'
  };

  /**
   * Upload a file for data exploration
   */
  uploadFile(filePath: string): this {
    cy.get(this.selectors.fileInput).selectFile(filePath, { force: true });
    cy.get(this.selectors.uploadProgress).should('be.visible');
    cy.get(this.selectors.uploadProgress).should('not.exist', { timeout: 30000 });
    cy.get('[data-cy="upload-success"]').should('be.visible');
    return this;
  }

  /**
   * Upload via drag and drop
   */
  uploadViaDragDrop(filePath: string): this {
    cy.get(this.selectors.uploadArea).selectFile(filePath, { action: 'drag-drop' });
    cy.get(this.selectors.uploadProgress).should('be.visible');
    this.waitForDataToLoad();
    return this;
  }

  /**
   * Wait for data to load and display
   */
  waitForDataToLoad(): this {
    cy.get(this.selectors.dataTable).should('be.visible');
    cy.get('[data-cy="loading-data"]').should('not.exist');
    return this;
  }

  /**
   * Verify data table is displayed with expected structure
   */
  verifyDataTableStructure(): this {
    cy.get(this.selectors.dataTable).should('be.visible');
    cy.get(this.selectors.tableHeaders).should('have.length.at.least', 1);
    cy.get(this.selectors.tableRows).should('have.length.at.least', 1);
    return this;
  }

  /**
   * Get column count
   */
  getColumnCount(): Cypress.Chainable<number> {
    return cy.get(this.selectors.tableHeaders).then($headers => $headers.length);
  }

  /**
   * Get row count
   */
  getRowCount(): Cypress.Chainable<number> {
    return cy.get(this.selectors.tableRows).then($rows => $rows.length);
  }

  /**
   * Search data in table
   */
  searchData(query: string): this {
    cy.get(this.selectors.searchInput).clear().type(query);
    cy.get('[data-cy="search-results"]').should('be.visible');
    return this;
  }

  /**
   * Clear search
   */
  clearSearch(): this {
    cy.get(this.selectors.searchInput).clear();
    this.waitForDataToLoad();
    return this;
  }

  /**
   * Sort data by column
   */
  sortByColumn(columnName: string, direction: 'asc' | 'desc' = 'asc'): this {
    cy.get(`[data-cy="column-${columnName}"] [data-cy="sort-button"]`).click();
    if (direction === 'desc') {
      cy.get(`[data-cy="column-${columnName}"] [data-cy="sort-button"]`).click();
    }
    this.waitForDataToLoad();
    return this;
  }

  /**
   * Apply column filter
   */
  applyColumnFilter(columnName: string, filterType: string, value: string): this {
    cy.get(this.selectors.filterPanel).should('be.visible');
    cy.get(`[data-cy="filter-column-${columnName}"]`).click();
    cy.get(`[data-cy="filter-type-${filterType}"]`).click();
    cy.get(`[data-cy="filter-value-input"]`).type(value);
    cy.get('[data-cy="apply-filter"]').click();
    this.waitForDataToLoad();
    return this;
  }

  /**
   * Clear all filters
   */
  clearAllFilters(): this {
    cy.get('[data-cy="clear-filters"]').click();
    this.waitForDataToLoad();
    return this;
  }

  /**
   * Toggle column visibility
   */
  toggleColumn(columnName: string): this {
    cy.get(this.selectors.columnToggle).click();
    cy.get(`[data-cy="column-toggle-${columnName}"]`).click();
    return this;
  }

  /**
   * Export data
   */
  exportData(format: 'csv' | 'json' | 'excel'): this {
    cy.get(this.selectors.exportButton).click();
    cy.get(`[data-cy="export-format-${format}"]`).click();
    cy.get('[data-cy="export-confirm"]').click();
    return this;
  }

  /**
   * View data statistics
   */
  viewStatistics(): this {
    cy.get(this.selectors.statisticsPanel).should('be.visible');
    cy.get('[data-cy="stat-mean"]').should('be.visible');
    cy.get('[data-cy="stat-median"]').should('be.visible');
    cy.get('[data-cy="stat-std"]').should('be.visible');
    return this;
  }

  /**
   * Check for missing values
   */
  checkMissingValues(): this {
    cy.get(this.selectors.missingValueIndicator).then($indicators => {
      if ($indicators.length > 0) {
        cy.log(`Found ${$indicators.length} missing values`);
      }
    });
    return this;
  }

  /**
   * Verify data types
   */
  verifyDataTypes(): this {
    cy.get(this.selectors.dataTypeIndicator).each($indicator => {
      cy.wrap($indicator).should('have.attr', 'data-type').and('match', /string|number|date|boolean/);
    });
    return this;
  }

  /**
   * Generate data visualization
   */
  generateVisualization(chartType: 'histogram' | 'scatter' | 'line' | 'bar'): this {
    cy.get('[data-cy="create-visualization"]').click();
    cy.get(`[data-cy="chart-type-${chartType}"]`).click();
    cy.get('[data-cy="generate-chart"]').click();
    cy.get(this.selectors.chartVisualization).should('be.visible');
    cy.waitForChart(this.selectors.chartVisualization);
    return this;
  }

  /**
   * Apply data transformations
   */
  applyTransformation(transformationType: string, parameters?: Record<string, any>): this {
    cy.get(this.selectors.preprocessingPanel).should('be.visible');
    cy.get(`[data-cy="transformation-${transformationType}"]`).click();

    if (parameters) {
      Object.entries(parameters).forEach(([key, value]) => {
        cy.get(`[data-cy="param-${key}"]`).clear().type(String(value));
      });
    }

    cy.get('[data-cy="apply-transformation"]').click();
    this.waitForDataToLoad();
    return this;
  }

  /**
   * View correlation matrix
   */
  viewCorrelationMatrix(): this {
    cy.get('[data-cy="show-correlation"]').click();
    cy.get(this.selectors.correlationMatrix).should('be.visible');
    cy.waitForChart(this.selectors.correlationMatrix);
    return this;
  }

  /**
   * Detect outliers
   */
  detectOutliers(method: 'iqr' | 'zscore' | 'isolation'): this {
    cy.get('[data-cy="outlier-detection-button"]').click();
    cy.get(`[data-cy="outlier-method-${method}"]`).click();
    cy.get('[data-cy="detect-outliers"]').click();
    cy.get(this.selectors.outlierDetection).should('be.visible');
    return this;
  }

  /**
   * Check data quality score
   */
  checkDataQuality(): this {
    cy.get(this.selectors.dataQualityScore).should('be.visible');
    cy.get(this.selectors.dataQualityScore).invoke('text').then(score => {
      const numericScore = parseFloat(score);
      expect(numericScore).to.be.within(0, 100);
    });
    return this;
  }

  /**
   * Select multiple rows
   */
  selectRows(indices: number[]): this {
    indices.forEach(index => {
      cy.get(`[data-cy="row-checkbox-${index}"]`).check();
    });
    cy.get(this.selectors.selectedRowsCount).should('contain.text', indices.length.toString());
    return this;
  }

  /**
   * Select all rows
   */
  selectAllRows(): this {
    cy.get('[data-cy="select-all-checkbox"]').check();
    return this;
  }

  /**
   * Apply bulk action
   */
  applyBulkAction(action: 'delete' | 'export' | 'transform'): this {
    cy.get(this.selectors.bulkActions).click();
    cy.get(`[data-cy="bulk-action-${action}"]`).click();
    cy.get('[data-cy="confirm-bulk-action"]').click();
    return this;
  }

  /**
   * Change data source
   */
  changeDataSource(source: 'file' | 'database' | 'api'): this {
    cy.get(this.selectors.dataSourceSelector).click();
    cy.get(`[data-cy="data-source-${source}"]`).click();
    return this;
  }

  /**
   * Execute SQL query (for database sources)
   */
  executeQuery(query: string): this {
    cy.get(this.selectors.sqlEditor).clear().type(query);
    cy.get(this.selectors.executeQuery).click();
    this.waitForDataToLoad();
    return this;
  }

  /**
   * Use query builder
   */
  buildQuery(table: string, columns: string[], conditions?: string[]): this {
    cy.get(this.selectors.queryBuilder).should('be.visible');
    cy.get(`[data-cy="select-table-${table}"]`).click();

    columns.forEach(column => {
      cy.get(`[data-cy="select-column-${column}"]`).check();
    });

    if (conditions) {
      conditions.forEach((condition, index) => {
        cy.get('[data-cy="add-condition"]').click();
        cy.get(`[data-cy="condition-${index}"]`).type(condition);
      });
    }

    cy.get('[data-cy="build-query"]').click();
    return this;
  }

  /**
   * Save current dataset
   */
  saveDataset(name: string): this {
    cy.get(this.selectors.saveDataset).click();
    cy.get('[data-cy="dataset-name-input"]').type(name);
    cy.get('[data-cy="save-confirm"]').click();
    cy.get('[data-cy="save-success"]').should('be.visible');
    return this;
  }

  /**
   * Load existing dataset
   */
  loadDataset(name: string): this {
    cy.get(this.selectors.loadDataset).click();
    cy.get(`[data-cy="dataset-option-${name}"]`).click();
    cy.get('[data-cy="load-confirm"]').click();
    this.waitForDataToLoad();
    return this;
  }

  /**
   * Test pagination
   */
  testPagination(): this {
    cy.get(this.selectors.paginationControls).should('be.visible');

    // Test next page
    cy.get('[data-cy="pagination-next"]').click();
    this.waitForDataToLoad();

    // Test previous page
    cy.get('[data-cy="pagination-prev"]').click();
    this.waitForDataToLoad();

    // Test page size change
    cy.get(this.selectors.rowsPerPageSelect).select('50');
    this.waitForDataToLoad();

    return this;
  }

  /**
   * Test real-time data updates
   */
  testRealTimeUpdates(): this {
    cy.get(this.selectors.connectionStatus).should('contain.text', 'Connected');

    // Mock real-time update
    cy.window().then((win) => {
      win.dispatchEvent(new CustomEvent('dataUpdate', {
        detail: { type: 'new_row', data: { id: 999, name: 'Test Row' } }
      }));
    });

    cy.get('[data-cy="real-time-indicator"]').should('be.visible');
    return this;
  }

  /**
   * Test error scenarios
   */
  testErrorScenarios(): this {
    // Test invalid file upload
    cy.get(this.selectors.fileInput).selectFile('cypress/fixtures/invalid-file.txt', { force: true });
    cy.get('[data-cy="upload-error"]').should('be.visible');

    // Test network error
    cy.intercept('POST', '/api/data/upload', { statusCode: 500 }).as('uploadError');
    cy.get(this.selectors.uploadButton).click();
    cy.get('[data-cy="network-error"]').should('be.visible');

    return this;
  }

  /**
   * Verify memory usage during large dataset handling
   */
  testPerformanceWithLargeDataset(): this {
    cy.window().then((win) => {
      const memoryBefore = (win.performance as any).memory?.usedJSHeapSize || 0;

      // Load large dataset or simulate
      this.uploadFile('cypress/fixtures/large-dataset.csv');

      cy.wait(2000).then(() => {
        const memoryAfter = (win.performance as any).memory?.usedJSHeapSize || 0;
        const memoryIncrease = memoryAfter - memoryBefore;
        expect(memoryIncrease).to.be.lessThan(50 * 1024 * 1024); // Less than 50MB increase
      });
    });

    return this;
  }

  /**
   * Comprehensive data explorer validation
   */
  performComprehensiveValidation(): this {
    return this
      .waitForPageLoad()
      .verifyTitle('Data Explorer')
      .verifyUrl()
      .verifyDataTableStructure()
      .checkDataQuality()
      .viewStatistics()
      .checkMissingValues()
      .verifyDataTypes()
      .testPagination()
      .checkAccessibility()
      .verifyPerformance();
  }
}