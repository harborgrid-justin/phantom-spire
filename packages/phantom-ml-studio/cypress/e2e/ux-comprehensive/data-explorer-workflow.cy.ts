/// <reference types="cypress" />

/**
 * UX Test Suite: Data Explorer & Analysis Workflow
 * Data upload, exploration, preprocessing, and export functionality
 */

describe('UX: Data Explorer & Analysis Workflow', () => {
  beforeEach(() => {
    cy.setupTestEnvironment('ml-models');
    cy.visit('/dataExplorer');
  });

  describe('Dataset Upload & Validation', () => {
    it('should handle complete dataset upload workflow', () => {
      // Test initial state
      cy.get('[data-cy="upload-area"]').should('be.visible');
      cy.get('[data-cy="upload-instructions"]').should('contain', 'drag and drop');

      // Test drag and drop upload
      cy.fixture('test-dataset.csv', 'base64').then(fileContent => {
        cy.get('[data-cy="form-upload-dropzone"]').trigger('drop', {
          dataTransfer: {
            files: [{
              name: 'test-dataset.csv',
              type: 'text/csv',
              content: fileContent
            }]
          }
        });
      });

      // Verify upload progress
      cy.get('[data-cy="upload-progress"]').should('be.visible');
      cy.get('[data-cy="upload-progress-bar"]').should('have.attr', 'aria-valuenow');

      // Wait for processing completion
      cy.get('[data-cy="upload-success"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="dataset-preview"]').should('be.visible');

      // Verify file information display
      cy.get('[data-cy="file-info-name"]').should('contain', 'test-dataset.csv');
      cy.get('[data-cy="file-info-size"]').should('match', /\d+\s*(KB|MB)/);
      cy.get('[data-cy="file-info-rows"]').should('match', /\d+\s*rows/);
      cy.get('[data-cy="file-info-columns"]').should('match', /\d+\s*columns/);
    });

    it('should validate CSV parsing and data type detection', () => {
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');

      // Wait for data preview to load
      cy.get('[data-cy="data-preview-table"]', { timeout: 5000 }).should('be.visible');

      // Verify column type detection
      cy.get('[data-cy="column-type-age"]').should('contain', 'Numeric');
      cy.get('[data-cy="column-type-name"]').should('contain', 'Text');
      cy.get('[data-cy="column-type-score"]').should('contain', 'Numeric');
      cy.get('[data-cy="column-type-category"]').should('contain', 'Categorical');

      // Test data type correction
      cy.get('[data-cy="column-type-age"] [data-cy="edit-type"]').click();
      cy.muiSelectOption('column-type-selector', 'Categorical');
      cy.muiClickButton('confirm-type-change');

      cy.get('[data-cy="column-type-age"]').should('contain', 'Categorical');

      // Verify statistical summary updates
      cy.get('[data-cy="column-stats-age"]').should('contain', 'Unique values:');
    });

    it('should handle file upload errors gracefully', () => {
      // Test unsupported file type
      cy.fixture('invalid-file.txt').then(fileContent => {
        cy.get('[data-cy="form-upload-dropzone"]').trigger('drop', {
          dataTransfer: {
            files: [{
              name: 'invalid-file.txt',
              type: 'text/plain',
              content: fileContent
            }]
          }
        });
      });

      cy.get('[data-cy="upload-error"]').should('be.visible');
      cy.get('[data-cy="error-message"]').should('contain', 'Unsupported file format');

      // Test file too large error
      cy.intercept('POST', '/api/datasets/upload', {
        statusCode: 413,
        body: { error: 'File too large' }
      }).as('uploadError');

      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/large-dataset.csv');
      cy.wait('@uploadError');

      cy.get('[data-cy="upload-error"]').should('contain', 'File too large');
      cy.get('[data-cy="error-retry"]').should('be.visible');
    });
  });

  describe('Data Exploration Interface', () => {
    beforeEach(() => {
      // Setup with pre-loaded dataset
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.get('[data-cy="data-preview-table"]', { timeout: 5000 }).should('be.visible');
    });

    it('should provide comprehensive data exploration tools', () => {
      // Test column sorting
      cy.get('[data-cy="table-header-age"]').click();
      cy.get('[data-cy="sort-indicator-age"]').should('contain', '↑');

      cy.get('[data-cy="table-header-age"]').click();
      cy.get('[data-cy="sort-indicator-age"]').should('contain', '↓');

      // Test filtering
      cy.get('[data-cy="filter-button-category"]').click();
      cy.get('[data-cy="filter-dropdown"]').should('be.visible');
      cy.get('[data-cy="filter-option-A"]').click();
      cy.get('[data-cy="filter-option-B"]').click();
      cy.muiClickButton('apply-filter');

      // Verify filtered results
      cy.get('[data-cy="table-row"]').should('have.length.lessThan', 100);
      cy.get('[data-cy="filter-indicator-category"]').should('be.visible');

      // Test filter clearing
      cy.get('[data-cy="clear-all-filters"]').click();
      cy.get('[data-cy="filter-indicator-category"]').should('not.exist');

      // Test search functionality
      cy.get('[data-cy="data-search"]').type('John');
      cy.get('[data-cy="table-row"]').should('contain', 'John');
      cy.get('[data-cy="search-results-count"]').should('be.visible');
    });

    it('should generate accurate statistical summaries', () => {
      // Test numeric column statistics
      cy.get('[data-cy="column-stats-age"]').should('be.visible');
      cy.get('[data-cy="stat-mean-age"]').should('match', /Mean:\s*\d+(\.\d+)?/);
      cy.get('[data-cy="stat-median-age"]').should('match', /Median:\s*\d+(\.\d+)?/);
      cy.get('[data-cy="stat-std-age"]').should('match', /Std Dev:\s*\d+(\.\d+)?/);

      // Test categorical column statistics
      cy.get('[data-cy="column-stats-category"]').should('be.visible');
      cy.get('[data-cy="stat-unique-category"]').should('match', /Unique:\s*\d+/);
      cy.get('[data-cy="stat-mode-category"]').should('contain', 'Most frequent:');

      // Test missing value detection
      cy.get('[data-cy="stat-missing-age"]').should('match', /Missing:\s*\d+/);
      cy.get('[data-cy="missing-value-indicator"]').should('be.visible');

      // Test distribution visualization
      cy.get('[data-cy="histogram-age"]').should('be.visible');
      cy.waitForChart('[data-cy="histogram-age"]');

      cy.get('[data-cy="pie-chart-category"]').should('be.visible');
      cy.waitForChart('[data-cy="pie-chart-category"]');
    });

    it('should enable effective data visualization and interaction', () => {
      // Test correlation matrix
      cy.get('[data-cy="correlation-tab"]').click();
      cy.waitForChart('[data-cy="correlation-heatmap"]');

      // Test correlation hover interactions
      cy.interactWithChart('correlation-heatmap', 'hover', { x: 100, y: 100 });
      cy.get('[data-cy="correlation-tooltip"]').should('be.visible');
      cy.get('[data-cy="correlation-tooltip"]').should('match', /r\s*=\s*-?\d+\.\d+/);

      // Test scatter plot analysis
      cy.get('[data-cy="scatter-plot-tab"]').click();
      cy.muiSelectOption('scatter-x-axis', 'age');
      cy.muiSelectOption('scatter-y-axis', 'score');
      cy.muiSelectOption('scatter-color', 'category');

      cy.waitForChart('[data-cy="scatter-plot"]');
      cy.interactWithChart('scatter-plot', 'click', { x: 150, y: 200 });
      cy.get('[data-cy="point-details"]').should('be.visible');

      // Test data distribution analysis
      cy.get('[data-cy="distribution-tab"]').click();
      cy.muiSelectOption('distribution-column', 'score');
      cy.waitForChart('[data-cy="distribution-histogram"]');

      // Test bin size adjustment
      cy.get('[data-cy="bin-size-slider"]').invoke('val', 20).trigger('input');
      cy.waitForChart('[data-cy="distribution-histogram"]');
    });
  });

  describe('Data Quality Assessment', () => {
    beforeEach(() => {
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/messy-dataset.csv');
      cy.get('[data-cy="data-preview-table"]', { timeout: 5000 }).should('be.visible');
    });

    it('should identify and report data quality issues', () => {
      // Test missing value detection
      cy.get('[data-cy="quality-tab"]').click();
      cy.get('[data-cy="quality-summary"]').should('be.visible');

      cy.get('[data-cy="missing-values-count"]').should('match', /\d+/);
      cy.get('[data-cy="missing-values-percentage"]').should('match', /\d+\.\d+%/);

      // Test duplicate detection
      cy.get('[data-cy="duplicate-rows-count"]').should('be.visible');
      cy.get('[data-cy="view-duplicates"]').click();
      cy.get('[data-cy="duplicates-table"]').should('be.visible');

      // Test outlier detection
      cy.get('[data-cy="outliers-tab"]').click();
      cy.waitForChart('[data-cy="outliers-boxplot"]');
      cy.get('[data-cy="outliers-count"]').should('match', /\d+\s*outliers?/);

      // Test data type inconsistencies
      cy.get('[data-cy="inconsistencies-tab"]').click();
      cy.get('[data-cy="type-conflicts"]').should('be.visible');
      cy.get('[data-cy="suggested-types"]').should('be.visible');
    });

    it('should provide data cleaning recommendations', () => {
      cy.get('[data-cy="recommendations-tab"]').click();

      // Test missing value handling suggestions
      cy.get('[data-cy="recommendation-missing-values"]').should('be.visible');
      cy.get('[data-cy="suggestion-impute-mean"]').should('contain', 'Fill with mean');
      cy.get('[data-cy="suggestion-drop-rows"]').should('contain', 'Remove rows');

      // Test duplicate handling
      cy.get('[data-cy="recommendation-duplicates"]').should('be.visible');
      cy.get('[data-cy="suggestion-remove-duplicates"]').click();

      // Verify action preview
      cy.get('[data-cy="action-preview"]').should('be.visible');
      cy.get('[data-cy="rows-affected"]').should('match', /\d+\s*rows?/);

      // Apply recommendation
      cy.muiClickButton('apply-recommendation');
      cy.get('[data-cy="action-success"]').should('be.visible');
    });

    it('should calculate and display quality scores', () => {
      cy.get('[data-cy="quality-score"]').should('be.visible');
      cy.get('[data-cy="overall-score"]').should('match', /\d+(\.\d+)?%/);

      // Test quality metrics breakdown
      cy.get('[data-cy="completeness-score"]').should('be.visible');
      cy.get('[data-cy="consistency-score"]').should('be.visible');
      cy.get('[data-cy="accuracy-score"]').should('be.visible');

      // Test quality improvement suggestions
      cy.get('[data-cy="improvement-suggestions"]').should('be.visible');
      cy.get('[data-cy="suggestion-item"]').should('have.length.greaterThan', 0);

      // Test quality trend over time
      cy.waitForChart('[data-cy="quality-trend-chart"]');
      cy.interactWithChart('quality-trend-chart', 'hover', { x: 100, y: 50 });
      cy.get('[data-cy="quality-tooltip"]').should('contain', 'Quality Score:');
    });
  });

  describe('Data Preprocessing Workflow', () => {
    beforeEach(() => {
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.get('[data-cy="data-preview-table"]', { timeout: 5000 }).should('be.visible');
    });

    it('should enable comprehensive data preprocessing', () => {
      cy.get('[data-cy="preprocessing-tab"]').click();

      // Test column transformation
      cy.get('[data-cy="transform-column-age"]').click();
      cy.get('[data-cy="transformation-options"]').should('be.visible');

      cy.get('[data-cy="transform-normalize"]').click();
      cy.muiSelectOption('normalization-method', 'Min-Max');
      cy.muiClickButton('apply-transformation');

      // Verify transformation applied
      cy.get('[data-cy="transformation-indicator-age"]').should('be.visible');
      cy.get('[data-cy="preview-transformed"]').should('be.visible');

      // Test feature engineering
      cy.get('[data-cy="create-feature"]').click();
      cy.muiTypeInTextField('feature-name', 'age_squared');
      cy.muiTypeInTextField('feature-formula', 'age * age');
      cy.muiClickButton('create-feature');

      cy.get('[data-cy="column-header-age_squared"]').should('be.visible');

      // Test encoding categorical variables
      cy.get('[data-cy="encode-column-category"]').click();
      cy.muiSelectOption('encoding-method', 'One-Hot');
      cy.muiClickButton('apply-encoding');

      cy.get('[data-cy="encoded-columns"]').should('be.visible');
      cy.get('[data-cy="column-header-category_A"]').should('be.visible');
      cy.get('[data-cy="column-header-category_B"]').should('be.visible');
    });

    it('should handle missing value imputation', () => {
      cy.get('[data-cy="preprocessing-tab"]').click();
      cy.get('[data-cy="missing-values-section"]').should('be.visible');

      // Test different imputation methods
      cy.get('[data-cy="impute-column-score"]').click();
      cy.muiSelectOption('imputation-method', 'Mean');
      cy.get('[data-cy="imputation-preview"]').should('be.visible');
      cy.muiClickButton('apply-imputation');

      // Verify imputation applied
      cy.get('[data-cy="missing-count-score"]').should('contain', '0');

      // Test forward fill imputation
      cy.get('[data-cy="impute-column-name"]').click();
      cy.muiSelectOption('imputation-method', 'Forward Fill');
      cy.muiClickButton('apply-imputation');

      // Test custom value imputation
      cy.get('[data-cy="impute-column-category"]').click();
      cy.muiSelectOption('imputation-method', 'Custom Value');
      cy.muiTypeInTextField('custom-value', 'Unknown');
      cy.muiClickButton('apply-imputation');
    });

    it('should provide preprocessing pipeline management', () => {
      // Create preprocessing steps
      cy.get('[data-cy="preprocessing-tab"]').click();

      // Step 1: Remove duplicates
      cy.get('[data-cy="add-preprocessing-step"]').click();
      cy.muiSelectOption('step-type', 'Remove Duplicates');
      cy.muiClickButton('add-step');

      // Step 2: Normalize columns
      cy.get('[data-cy="add-preprocessing-step"]').click();
      cy.muiSelectOption('step-type', 'Normalize');
      cy.muiSelectOption('normalize-columns', 'age');
      cy.muiClickButton('add-step');

      // Verify pipeline visualization
      cy.get('[data-cy="pipeline-visualization"]').should('be.visible');
      cy.get('[data-cy="pipeline-step"]').should('have.length', 2);

      // Test step reordering
      cy.get('[data-cy="pipeline-step-1"]').trigger('dragstart');
      cy.get('[data-cy="pipeline-step-0"]').trigger('drop');

      // Test pipeline execution
      cy.muiClickButton('execute-pipeline');
      cy.get('[data-cy="pipeline-progress"]').should('be.visible');
      cy.get('[data-cy="pipeline-complete"]', { timeout: 10000 }).should('be.visible');

      // Test pipeline saving
      cy.muiClickButton('save-pipeline');
      cy.muiTypeInTextField('pipeline-name', 'Standard Cleaning Pipeline');
      cy.muiClickButton('save');

      cy.get('[data-cy="pipeline-saved"]').should('be.visible');
    });
  });

  describe('Data Export Functionality', () => {
    beforeEach(() => {
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.get('[data-cy="data-preview-table"]', { timeout: 5000 }).should('be.visible');
    });

    it('should export processed data in multiple formats', () => {
      // Test CSV export
      cy.get('[data-cy="export-data"]').click();
      cy.get('[data-cy="export-options"]').should('be.visible');

      cy.muiSelectOption('export-format', 'CSV');
      cy.muiToggleSwitch('include-headers', true);
      cy.muiClickButton('download-export');

      // Verify download initiated
      cy.get('[data-cy="download-progress"]').should('be.visible');
      cy.get('[data-cy="download-complete"]', { timeout: 5000 }).should('be.visible');

      // Test JSON export
      cy.muiSelectOption('export-format', 'JSON');
      cy.muiToggleSwitch('pretty-format', true);
      cy.muiClickButton('download-export');

      // Test Excel export
      cy.muiSelectOption('export-format', 'Excel');
      cy.muiToggleSwitch('multiple-sheets', true);
      cy.muiClickButton('download-export');
    });

    it('should export filtered and processed data correctly', () => {
      // Apply filters
      cy.get('[data-cy="filter-button-category"]').click();
      cy.get('[data-cy="filter-option-A"]').click();
      cy.muiClickButton('apply-filter');

      // Apply preprocessing
      cy.get('[data-cy="preprocessing-tab"]').click();
      cy.get('[data-cy="transform-column-age"]').click();
      cy.get('[data-cy="transform-normalize"]').click();
      cy.muiClickButton('apply-transformation');

      // Export filtered and processed data
      cy.get('[data-cy="export-data"]').click();
      cy.muiToggleSwitch('export-filtered-only', true);
      cy.muiToggleSwitch('export-processed', true);
      cy.muiClickButton('download-export');

      // Verify export options reflected
      cy.get('[data-cy="export-summary"]').should('contain', 'Filtered rows');
      cy.get('[data-cy="export-summary"]').should('contain', 'Processed columns');
    });

    it('should handle large dataset exports efficiently', () => {
      // Mock large dataset
      cy.intercept('POST', '/api/datasets/export', {
        statusCode: 202,
        body: { exportId: 'export-123' }
      }).as('startExport');

      cy.intercept('GET', '/api/datasets/export/export-123/status', {
        body: { status: 'processing', progress: 45 }
      }).as('exportProgress');

      cy.get('[data-cy="export-data"]').click();
      cy.muiSelectOption('export-format', 'CSV');
      cy.muiClickButton('download-export');

      cy.wait('@startExport');

      // Test progress tracking
      cy.get('[data-cy="export-progress-bar"]').should('be.visible');
      cy.wait('@exportProgress');
      cy.get('[data-cy="export-progress-bar"]').should('have.attr', 'aria-valuenow', '45');

      // Mock completion
      cy.intercept('GET', '/api/datasets/export/export-123/status', {
        body: { status: 'completed', downloadUrl: '/downloads/export-123.csv' }
      });

      cy.get('[data-cy="download-ready"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="download-file"]').should('be.visible');
    });
  });

  describe('Responsive Data Explorer', () => {
    it('should provide optimal mobile data exploration experience', () => {
      cy.viewport(375, 667);
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');

      // Test mobile table view
      cy.get('[data-cy="mobile-table-toggle"]').should('be.visible');
      cy.get('[data-cy="mobile-card-view"]').click();

      cy.get('[data-cy="data-card"]').should('be.visible');
      cy.get('[data-cy="data-card"]').should('have.length.greaterThan', 0);

      // Test mobile filtering
      cy.get('[data-cy="mobile-filter-toggle"]').click();
      cy.get('[data-cy="mobile-filter-drawer"]').should('be.visible');

      // Test mobile statistics view
      cy.get('[data-cy="mobile-stats-toggle"]').click();
      cy.get('[data-cy="mobile-stats-sheet"]').should('be.visible');

      // Test swipe navigation
      cy.get('[data-cy="data-card-0"]').trigger('swiperight');
      cy.get('[data-cy="card-actions"]').should('be.visible');
    });

    it('should adapt charts and visualizations for mobile', () => {
      cy.viewport(375, 667);
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');

      cy.get('[data-cy="correlation-tab"]').click();

      // Test mobile chart controls
      cy.get('[data-cy="chart-mobile-controls"]').should('be.visible');
      cy.get('[data-cy="chart-fullscreen"]').click();
      cy.get('[data-cy="fullscreen-chart"]').should('be.visible');

      // Test touch interactions
      cy.get('[data-cy="correlation-heatmap"]')
        .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
        .trigger('touchmove', { touches: [{ clientX: 150, clientY: 150 }] })
        .trigger('touchend');

      cy.get('[data-cy="chart-tooltip"]').should('be.visible');
    });
  });
});