/// <reference types="cypress" />

describe('Chart Components - Component Testing', () => {
  beforeEach(() => {
    // Mount components in isolation for component testing
    cy.visit('/component-test-page'); // Assuming a component test page exists
  });

  describe('Performance Chart Component', () => {
    it('should render with different data sets', () => {
      cy.logTestStep('Testing performance chart with various data sets');

      const testDataSets = [
        // Small dataset
        {
          name: 'small-dataset',
          data: Array.from({ length: 5 }, (_, i) => ({
            date: `2025-01-${10 + i}`,
            accuracy: 0.8 + (i * 0.02),
            precision: 0.75 + (i * 0.03)
          }))
        },
        // Large dataset
        {
          name: 'large-dataset',
          data: Array.from({ length: 100 }, (_, i) => ({
            date: `2025-01-${i + 1}`,
            accuracy: 0.8 + Math.sin(i * 0.1) * 0.1,
            precision: 0.75 + Math.cos(i * 0.1) * 0.15
          }))
        },
        // Edge case: single data point
        {
          name: 'single-point',
          data: [{ date: '2025-01-01', accuracy: 0.95, precision: 0.92 }]
        }
      ];

      testDataSets.forEach(dataset => {
        cy.get('[data-cy="chart-data-selector"]').select(dataset.name);
        cy.waitForChart('[data-cy="performance-chart"]');

        // Verify chart renders correctly
        cy.get('[data-cy="performance-chart"] svg').should('exist');
        cy.get('[data-cy="performance-chart"] .recharts-line').should('have.length', 2);

        // Test data point count
        if (dataset.data.length > 1) {
          cy.get('[data-cy="performance-chart"] .recharts-line-dot')
            .should('have.length.at.least', dataset.data.length);
        }
      });
    });

    it('should handle interactive features correctly', () => {
      cy.logTestStep('Testing chart interactive features');

      cy.get('[data-cy="performance-chart"]').within(() => {
        // Test hover interactions
        cy.get('.recharts-line-dot').first().trigger('mouseover');
        cy.get('.recharts-tooltip-wrapper').should('be.visible');

        // Test click interactions
        cy.get('.recharts-line-dot').first().click();
        cy.get('[data-cy="data-point-details"]').should('be.visible');

        // Test zoom functionality
        cy.get('.recharts-surface').trigger('wheel', { deltaY: -100 });
        cy.get('[data-cy="zoom-level"]').should('not.contain.text', '100%');

        // Reset zoom
        cy.get('[data-cy="reset-zoom"]').click();
        cy.get('[data-cy="zoom-level"]').should('contain.text', '100%');
      });
    });

    it('should support different chart types', () => {
      cy.logTestStep('Testing chart type switching');

      const chartTypes = ['line', 'bar', 'area', 'scatter'];

      chartTypes.forEach(type => {
        cy.get('[data-cy="chart-type-selector"]').select(type);
        cy.waitForChart('[data-cy="performance-chart"]');

        switch (type) {
          case 'line':
            cy.get('.recharts-line').should('exist');
            break;
          case 'bar':
            cy.get('.recharts-bar').should('exist');
            break;
          case 'area':
            cy.get('.recharts-area').should('exist');
            break;
          case 'scatter':
            cy.get('.recharts-scatter').should('exist');
            break;
        }
      });
    });

    it('should handle real-time data updates', () => {
      cy.logTestStep('Testing real-time chart updates');

      // Start with initial data
      cy.waitForChart('[data-cy="performance-chart"]');
      cy.get('.recharts-line-dot').then($initialDots => {
        const initialCount = $initialDots.length;

        // Simulate real-time data update
        cy.window().then(win => {
          win.dispatchEvent(new CustomEvent('chart-data-update', {
            detail: {
              newDataPoint: {
                date: '2025-01-18',
                accuracy: 0.93,
                precision: 0.89
              }
            }
          }));
        });

        // Verify new data point appears
        cy.get('.recharts-line-dot').should('have.length', initialCount + 1);
      });
    });
  });

  describe('Confusion Matrix Component', () => {
    it('should render matrix with different class counts', () => {
      cy.logTestStep('Testing confusion matrix with different class counts');

      const matrixConfigs = [
        { classes: 2, name: 'binary' },
        { classes: 3, name: 'multiclass-3' },
        { classes: 5, name: 'multiclass-5' },
        { classes: 10, name: 'multiclass-10' }
      ];

      matrixConfigs.forEach(config => {
        cy.get('[data-cy="matrix-config-selector"]').select(config.name);
        cy.waitForChart('[data-cy="confusion-matrix"]');

        // Verify correct number of cells
        const expectedCells = config.classes * config.classes;
        cy.get('[data-cy="confusion-matrix"] .cm-cell')
          .should('have.length', expectedCells);

        // Verify labels
        cy.get('[data-cy="confusion-matrix"] .cm-label')
          .should('have.length', config.classes * 2); // x and y labels
      });
    });

    it('should display cell values and percentages correctly', () => {
      cy.logTestStep('Testing confusion matrix cell display modes');

      const displayModes = ['counts', 'percentages', 'both'];

      displayModes.forEach(mode => {
        cy.get('[data-cy="display-mode-selector"]').select(mode);

        cy.get('[data-cy="confusion-matrix"] .cm-cell').first().within(() => {
          switch (mode) {
            case 'counts':
              cy.get('.cell-count').should('be.visible');
              cy.get('.cell-percentage').should('not.exist');
              break;
            case 'percentages':
              cy.get('.cell-percentage').should('be.visible');
              cy.get('.cell-count').should('not.exist');
              break;
            case 'both':
              cy.get('.cell-count').should('be.visible');
              cy.get('.cell-percentage').should('be.visible');
              break;
          }
        });
      });
    });

    it('should highlight cells on hover', () => {
      cy.logTestStep('Testing confusion matrix hover interactions');

      cy.get('[data-cy="confusion-matrix"] .cm-cell').first().trigger('mouseover');

      // Verify hover effects
      cy.get('[data-cy="confusion-matrix"] .cm-cell.highlighted')
        .should('have.length.at.least', 3); // Cell + row + column

      cy.get('[data-cy="cell-tooltip"]').should('be.visible');
      cy.get('[data-cy="cell-tooltip"]').should('contain.text', 'True Positive');
    });
  });

  describe('Feature Importance Chart Component', () => {
    it('should render horizontal and vertical orientations', () => {
      cy.logTestStep('Testing feature importance chart orientations');

      // Test horizontal orientation
      cy.get('[data-cy="orientation-selector"]').select('horizontal');
      cy.waitForChart('[data-cy="feature-importance-chart"]');
      cy.get('[data-cy="feature-importance-chart"] .recharts-bar')
        .should('have.attr', 'width');

      // Test vertical orientation
      cy.get('[data-cy="orientation-selector"]').select('vertical');
      cy.waitForChart('[data-cy="feature-importance-chart"]');
      cy.get('[data-cy="feature-importance-chart"] .recharts-bar')
        .should('have.attr', 'height');
    });

    it('should sort features correctly', () => {
      cy.logTestStep('Testing feature importance sorting');

      const sortOptions = ['importance-desc', 'importance-asc', 'alphabetical'];

      sortOptions.forEach(sortBy => {
        cy.get('[data-cy="sort-selector"]').select(sortBy);
        cy.waitForChart('[data-cy="feature-importance-chart"]');

        if (sortBy === 'importance-desc') {
          // Verify descending order
          cy.get('[data-cy="feature-importance-chart"] .recharts-bar')
            .then($bars => {
              const heights = Array.from($bars).map(bar =>
                parseFloat(bar.getAttribute('height') || '0')
              );
              const isSorted = heights.every((height, i) =>
                i === 0 || heights[i - 1] >= height
              );
              expect(isSorted).to.be.true;
            });
        }
      });
    });

    it('should handle feature selection', () => {
      cy.logTestStep('Testing feature selection from chart');

      cy.get('[data-cy="feature-importance-chart"] .recharts-bar').first().click();
      cy.get('[data-cy="selected-feature-details"]').should('be.visible');

      // Test multiple selection
      cy.get('[data-cy="feature-importance-chart"] .recharts-bar').eq(1)
        .click({ ctrlKey: true });
      cy.get('[data-cy="selected-features-count"]').should('contain.text', '2');
    });
  });

  describe('ROC Curve Component', () => {
    it('should render multiple ROC curves correctly', () => {
      cy.logTestStep('Testing multiple ROC curves rendering');

      const modelConfigs = [
        { name: 'model-1', auc: 0.95 },
        { name: 'model-2', auc: 0.87 },
        { name: 'model-3', auc: 0.92 }
      ];

      modelConfigs.forEach(model => {
        cy.get('[data-cy="add-model-curve"]').click();
        cy.get('[data-cy="model-selector"]').select(model.name);
      });

      cy.waitForChart('[data-cy="roc-curve-chart"]');

      // Verify multiple curves
      cy.get('[data-cy="roc-curve-chart"] .recharts-line')
        .should('have.length', modelConfigs.length);

      // Verify AUC values in legend
      modelConfigs.forEach(model => {
        cy.get('[data-cy="legend"]').should('contain.text', model.auc.toString());
      });
    });

    it('should highlight optimal threshold point', () => {
      cy.logTestStep('Testing optimal threshold highlighting');

      cy.waitForChart('[data-cy="roc-curve-chart"]');

      // Enable threshold display
      cy.get('[data-cy="show-optimal-threshold"]').check();

      cy.get('[data-cy="roc-curve-chart"] .optimal-threshold-point')
        .should('be.visible');

      cy.get('[data-cy="roc-curve-chart"] .optimal-threshold-point')
        .trigger('mouseover');

      cy.get('[data-cy="threshold-tooltip"]').should('be.visible');
      cy.get('[data-cy="threshold-tooltip"]').should('contain.text', 'Threshold:');
    });

    it('should handle curve interpolation settings', () => {
      cy.logTestStep('Testing ROC curve interpolation');

      const interpolationTypes = ['linear', 'monotone', 'step'];

      interpolationTypes.forEach(type => {
        cy.get('[data-cy="interpolation-selector"]').select(type);
        cy.waitForChart('[data-cy="roc-curve-chart"]');

        cy.get('[data-cy="roc-curve-chart"] .recharts-line')
          .should('have.attr', 'data-interpolation', type);
      });
    });
  });

  describe('Distribution Plot Component', () => {
    it('should render different distribution types', () => {
      cy.logTestStep('Testing distribution plot types');

      const plotTypes = ['histogram', 'density', 'box', 'violin'];

      plotTypes.forEach(type => {
        cy.get('[data-cy="plot-type-selector"]').select(type);
        cy.waitForChart('[data-cy="distribution-plot"]');

        switch (type) {
          case 'histogram':
            cy.get('[data-cy="distribution-plot"] .recharts-bar').should('exist');
            break;
          case 'density':
            cy.get('[data-cy="distribution-plot"] .recharts-area').should('exist');
            break;
          case 'box':
            cy.get('[data-cy="distribution-plot"] .box-plot-element').should('exist');
            break;
          case 'violin':
            cy.get('[data-cy="distribution-plot"] .violin-plot-element').should('exist');
            break;
        }
      });
    });

    it('should handle grouped distributions', () => {
      cy.logTestStep('Testing grouped distribution plots');

      cy.get('[data-cy="enable-grouping"]').check();
      cy.get('[data-cy="group-by-selector"]').select('class');

      cy.waitForChart('[data-cy="distribution-plot"]');

      // Verify multiple distributions
      cy.get('[data-cy="distribution-plot"] .distribution-group')
        .should('have.length.at.least', 2);

      // Test group legend
      cy.get('[data-cy="group-legend"]').should('be.visible');
      cy.get('[data-cy="group-legend"] .legend-item')
        .should('have.length.at.least', 2);
    });

    it('should support statistical overlays', () => {
      cy.logTestStep('Testing statistical overlays');

      const overlays = ['mean', 'median', 'quartiles', 'normal-fit'];

      overlays.forEach(overlay => {
        cy.get(`[data-cy="overlay-${overlay}"]`).check();
      });

      cy.waitForChart('[data-cy="distribution-plot"]');

      // Verify overlays are rendered
      cy.get('[data-cy="distribution-plot"] .statistical-overlay')
        .should('have.length', overlays.length);
    });
  });

  describe('Time Series Chart Component', () => {
    it('should handle different time ranges', () => {
      cy.logTestStep('Testing time series with different ranges');

      const timeRanges = ['1h', '24h', '7d', '30d', '1y'];

      timeRanges.forEach(range => {
        cy.get('[data-cy="time-range-selector"]').select(range);
        cy.waitForChart('[data-cy="time-series-chart"]');

        // Verify appropriate time formatting
        cy.get('[data-cy="time-series-chart"] .recharts-cartesian-axis-tick')
          .should('exist');
      });
    });

    it('should support zoom and pan interactions', () => {
      cy.logTestStep('Testing time series zoom and pan');

      cy.waitForChart('[data-cy="time-series-chart"]');

      // Test zoom
      cy.get('[data-cy="time-series-chart"] .recharts-surface')
        .trigger('wheel', { deltaY: -100 });

      cy.get('[data-cy="zoom-controls"]').should('be.visible');

      // Test pan
      cy.get('[data-cy="time-series-chart"] .recharts-surface')
        .trigger('mousedown', { which: 1, clientX: 100, clientY: 100 })
        .trigger('mousemove', { clientX: 200, clientY: 100 })
        .trigger('mouseup');

      // Verify pan occurred
      cy.get('[data-cy="pan-indicator"]').should('be.visible');
    });

    it('should handle missing data points', () => {
      cy.logTestStep('Testing time series with missing data');

      // Load data with gaps
      cy.get('[data-cy="data-with-gaps"]').click();
      cy.waitForChart('[data-cy="time-series-chart"]');

      // Test gap handling options
      const gapHandlers = ['interpolate', 'show-gaps', 'connect'];

      gapHandlers.forEach(handler => {
        cy.get('[data-cy="gap-handler-selector"]').select(handler);
        cy.waitForChart('[data-cy="time-series-chart"]');

        if (handler === 'show-gaps') {
          cy.get('[data-cy="time-series-chart"] .data-gap-indicator')
            .should('exist');
        }
      });
    });
  });

  describe('Heatmap Component', () => {
    it('should render correlation heatmaps correctly', () => {
      cy.logTestStep('Testing correlation heatmap rendering');

      cy.get('[data-cy="heatmap-type-selector"]').select('correlation');
      cy.waitForChart('[data-cy="heatmap-chart"]');

      // Verify symmetric matrix
      cy.get('[data-cy="heatmap-chart"] .heatmap-cell').then($cells => {
        const size = Math.sqrt($cells.length);
        expect(size % 1).to.equal(0); // Should be perfect square
      });

      // Test color scale
      cy.get('[data-cy="color-scale-selector"]').select('diverging');
      cy.waitForChart('[data-cy="heatmap-chart"]');

      cy.get('[data-cy="heatmap-chart"] .heatmap-cell[data-value="1"]')
        .should('have.css', 'fill').and('not.equal', 'rgb(255, 255, 255)');
    });

    it('should support different clustering methods', () => {
      cy.logTestStep('Testing heatmap clustering');

      const clusteringMethods = ['none', 'hierarchical', 'k-means'];

      clusteringMethods.forEach(method => {
        cy.get('[data-cy="clustering-method-selector"]').select(method);
        cy.waitForChart('[data-cy="heatmap-chart"]');

        if (method !== 'none') {
          cy.get('[data-cy="dendrogram"]').should('be.visible');
        }
      });
    });

    it('should handle cell interactions', () => {
      cy.logTestStep('Testing heatmap cell interactions');

      cy.waitForChart('[data-cy="heatmap-chart"]');

      // Test cell hover
      cy.get('[data-cy="heatmap-chart"] .heatmap-cell').first()
        .trigger('mouseover');

      cy.get('[data-cy="cell-tooltip"]').should('be.visible');
      cy.get('[data-cy="cell-tooltip"]').should('contain.text', 'Row:');
      cy.get('[data-cy="cell-tooltip"]').should('contain.text', 'Column:');
      cy.get('[data-cy="cell-tooltip"]').should('contain.text', 'Value:');

      // Test cell selection
      cy.get('[data-cy="heatmap-chart"] .heatmap-cell').first().click();
      cy.get('[data-cy="selected-cell-details"]').should('be.visible');
    });
  });
});