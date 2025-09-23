/// <reference types="cypress" />

/**
 * UX Test Suite: Dashboard & Data Visualization
 * Dashboard loading, metric display, and interactive chart testing
 */

describe('UX: Dashboard & Data Visualization', () => {
  beforeEach(() => {
    cy.setupTestEnvironment('dashboard');
    cy.visit('/dashboard');
  });

  describe('Dashboard Loading & Performance', () => {
    it('should load dashboard with optimal performance metrics', () => {
      // Measure initial load time
      cy.window().then((win) => {
        const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
        expect(loadTime).to.be.lessThan(3000); // < 3 seconds
      });

      // Verify progressive loading states
      cy.get('[data-cy="dashboard-skeleton"]').should('be.visible');
      cy.wait('@getDashboardMetrics');
      cy.get('[data-cy="dashboard-skeleton"]').should('not.exist');

      // Check all dashboard widgets loaded
      cy.get('[data-cy="metric-card-models"]').should('be.visible');
      cy.get('[data-cy="metric-card-experiments"]').should('be.visible');
      cy.get('[data-cy="metric-card-deployments"]').should('be.visible');
      cy.get('[data-cy="metric-card-accuracy"]').should('be.visible');

      // Verify chart rendering performance
      cy.waitForChart('[data-cy="dashboard-metrics-chart"]');
      cy.get('[data-cy="dashboard-metrics-chart"] svg').should('exist');
    });

    it('should display metrics with proper formatting and animations', () => {
      // Test metric card animations
      cy.get('[data-cy="metric-card-models"]').should('have.css', 'opacity', '1');
      cy.get('[data-cy="metric-value-models"]').should('be.visible');

      // Verify number formatting
      cy.get('[data-cy="metric-value-models"]').should('match', /^\d{1,3}(,\d{3})*$/);
      cy.get('[data-cy="metric-trend-models"]').should('be.visible');

      // Test trend indicators
      cy.get('[data-cy="metric-trend-models"]').should('contain.oneOf', ['↑', '↓', '→']);
    });

    it('should handle real-time metric updates gracefully', () => {
      // Mock real-time updates
      cy.intercept('GET', '/api/dashboard/metrics', {
        body: {
          models: { value: 45, trend: 'up', change: '+3' },
          experiments: { value: 128, trend: 'up', change: '+5' },
          deployments: { value: 12, trend: 'stable', change: '0' },
          accuracy: { value: 94.2, trend: 'up', change: '+0.3%' }
        }
      }).as('updatedMetrics');

      // Trigger refresh
      cy.get('[data-cy="dashboard-refresh"]').click();
      cy.wait('@updatedMetrics');

      // Verify smooth updates
      cy.get('[data-cy="metric-value-models"]').should('contain', '45');
      cy.get('[data-cy="metric-change-models"]').should('contain', '+3');
      cy.get('[data-cy="metric-trend-models"]').should('contain', '↑');
    });
  });

  describe('Interactive Chart Behaviors', () => {
    it('should provide rich chart interaction experiences', () => {
      cy.waitForRechart('performance-trends-chart');

      // Test hover interactions
      cy.interactWithChart('performance-trends-chart', 'hover', { x: 100, y: 200 });
      cy.verifyChartTooltip('Accuracy:');
      cy.get('[data-cy="chart-tooltip"]').should('contain', '%');

      // Test legend interactions
      cy.get('[data-cy="chart-legend-accuracy"]').click();
      cy.get('[data-cy="performance-trends-chart"] .recharts-line[data-key="accuracy"]')
        .should('have.css', 'opacity', '0.3');

      // Re-enable series
      cy.get('[data-cy="chart-legend-accuracy"]').click();
      cy.get('[data-cy="performance-trends-chart"] .recharts-line[data-key="accuracy"]')
        .should('have.css', 'opacity', '1');

      // Test zoom functionality
      cy.zoomChart('performance-trends-chart', { x1: 50, y1: 50, x2: 200, y2: 150 });
      cy.get('[data-cy="chart-zoom-reset"]').should('be.visible');

      cy.resetChartZoom('performance-trends-chart');
      cy.get('[data-cy="chart-zoom-reset"]').should('not.exist');
    });

    it('should render complex charts with large datasets efficiently', () => {
      // Mock large dataset
      cy.intercept('GET', '/api/dashboard/charts/performance-trends', {
        body: {
          data: Array.from({ length: 1000 }, (_, i) => ({
            date: new Date(Date.now() - (1000 - i) * 24 * 60 * 60 * 1000).toISOString(),
            accuracy: 85 + Math.random() * 10,
            precision: 80 + Math.random() * 15,
            recall: 75 + Math.random() * 20
          }))
        }
      }).as('largeDataset');

      cy.get('[data-cy="dashboard-refresh"]').click();
      cy.wait('@largeDataset');

      // Measure chart rendering time
      const start = Date.now();
      cy.waitForChart('[data-cy="performance-trends-chart"]').then(() => {
        const renderTime = Date.now() - start;
        expect(renderTime).to.be.lessThan(2000); // < 2 seconds
      });

      // Verify chart is interactive with large dataset
      cy.interactWithChart('performance-trends-chart', 'hover', { x: 300, y: 100 });
      cy.verifyChartTooltip('Accuracy:');
    });

    it('should adapt charts optimally across screen sizes', () => {
      const testSizes = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1280, height: 720, name: 'Desktop' }
      ];

      testSizes.forEach(size => {
        cy.viewport(size.width, size.height);
        cy.log(`Testing charts on ${size.name}`);

        cy.waitForRechart('performance-trends-chart');

        // Verify chart responsiveness
        cy.get('[data-cy="performance-trends-chart"] .recharts-wrapper')
          .should('have.css', 'width')
          .and('not.equal', '0px');

        // Test mobile-specific chart features
        if (size.width < 768) {
          cy.get('[data-cy="chart-mobile-controls"]').should('be.visible');
          cy.get('[data-cy="chart-fullscreen-toggle"]').should('be.visible');
        }

        // Verify chart interactions work on touch devices
        if (size.width < 768) {
          cy.get('[data-cy="performance-trends-chart"]')
            .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] });
          cy.get('[data-cy="chart-tooltip"]').should('be.visible');
        }
      });
    });
  });

  describe('Dashboard Customization', () => {
    it('should allow dashboard widget customization', () => {
      // Test widget reordering
      cy.get('[data-cy="widget-models"]')
        .trigger('mousedown', { which: 1 })
        .trigger('dragstart');

      cy.get('[data-cy="widget-experiments"]')
        .trigger('dragover')
        .trigger('drop');

      // Verify new order
      cy.get('[data-cy="dashboard-widgets"] > div:first-child')
        .should('have.attr', 'data-cy', 'widget-experiments');

      // Test widget resize
      cy.get('[data-cy="widget-performance-chart"]')
        .find('[data-cy="resize-handle"]')
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 100, clientY: 50 })
        .trigger('mouseup');

      // Verify widget preferences persist
      cy.reload();
      cy.get('[data-cy="dashboard-widgets"] > div:first-child')
        .should('have.attr', 'data-cy', 'widget-experiments');
    });

    it('should enable widget configuration and settings', () => {
      // Open widget settings
      cy.get('[data-cy="widget-models"] [data-cy="widget-settings"]').click();
      cy.get('[data-cy="widget-config-modal"]').should('be.visible');

      // Test configuration options
      cy.muiSelectOption('widget-time-range', '7 days');
      cy.muiSelectOption('widget-metric-type', 'Active Models');
      cy.muiToggleSwitch('widget-show-trend', true);

      // Save configuration
      cy.muiClickButton('save-widget-config');
      cy.get('[data-cy="widget-config-modal"]').should('not.exist');

      // Verify changes applied
      cy.get('[data-cy="widget-models"] [data-cy="metric-timerange"]')
        .should('contain', '7 days');
    });

    it('should handle widget addition and removal', () => {
      // Add new widget
      cy.get('[data-cy="dashboard-add-widget"]').click();
      cy.get('[data-cy="widget-selector-modal"]').should('be.visible');

      cy.get('[data-cy="widget-option-model-accuracy"]').click();
      cy.muiClickButton('add-widget');

      // Verify widget added
      cy.get('[data-cy="widget-model-accuracy"]').should('be.visible');

      // Remove widget
      cy.get('[data-cy="widget-model-accuracy"] [data-cy="widget-remove"]').click();
      cy.get('[data-cy="confirm-remove-widget"]').click();

      cy.get('[data-cy="widget-model-accuracy"]').should('not.exist');
    });
  });

  describe('Real-time Data Updates', () => {
    it('should handle live monitoring data streams', () => {
      // Mock WebSocket connection for real-time updates
      cy.window().then((win) => {
        const mockSocket = {
          onmessage: null as ((event: MessageEvent) => void) | null,
          send: cy.stub(),
          close: cy.stub()
        };

        // Simulate real-time metric updates
        setTimeout(() => {
          if (mockSocket.onmessage) {
            mockSocket.onmessage({
              data: JSON.stringify({
                type: 'metric_update',
                data: {
                  models: { value: 47, trend: 'up' },
                  deployments: { value: 13, trend: 'up' }
                }
              })
            } as MessageEvent);
          }
        }, 1000);

        (win as unknown as Window & { mockWebSocket: typeof mockSocket }).mockWebSocket = mockSocket;
      });

      // Verify real-time updates
      cy.get('[data-cy="metric-value-models"]', { timeout: 2000 })
        .should('contain', '47');
      cy.get('[data-cy="metric-value-deployments"]')
        .should('contain', '13');

      // Test connection status indicator
      cy.get('[data-cy="realtime-status"]').should('contain', 'Connected');
      cy.get('[data-cy="realtime-indicator"]').should('have.class', 'connected');
    });

    it('should gracefully handle connection interruptions', () => {
      // Simulate connection loss
      cy.window().then((win) => {
        const mockWin = win as Window & { 
          mockWebSocket?: { 
            close: () => void; 
          }; 
        };
        if (mockWin.mockWebSocket) {
          mockWin.mockWebSocket.close();
        }
      });

      // Verify disconnection handling
      cy.get('[data-cy="realtime-status"]').should('contain', 'Disconnected');
      cy.get('[data-cy="realtime-indicator"]').should('have.class', 'disconnected');
      cy.get('[data-cy="reconnect-button"]').should('be.visible');

      // Test manual reconnection
      cy.get('[data-cy="reconnect-button"]').click();
      cy.get('[data-cy="realtime-status"]').should('contain', 'Connecting...');
    });
  });

  describe('Dashboard Error Recovery', () => {
    it('should gracefully handle data loading failures', () => {
      // Simulate API failure
      cy.intercept('GET', '/api/dashboard/metrics', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('dashboardError');

      cy.get('[data-cy="dashboard-refresh"]').click();
      cy.wait('@dashboardError');

      // Verify error state
      cy.get('[data-cy="dashboard-error"]').should('be.visible');
      cy.get('[data-cy="error-message"]').should('contain', 'Failed to load dashboard');
      cy.get('[data-cy="error-retry"]').should('be.visible');

      // Test retry mechanism
      cy.intercept('GET', '/api/dashboard/metrics', { fixture: 'dashboard-metrics.json' });
      cy.get('[data-cy="error-retry"]').click();

      cy.get('[data-cy="dashboard-error"]').should('not.exist');
      cy.get('[data-cy="dashboard-content"]').should('be.visible');
    });

    it('should handle partial failures with isolation', () => {
      // Simulate partial failure - some widgets load, others fail
      cy.intercept('GET', '/api/dashboard/metrics', { fixture: 'dashboard-metrics.json' });
      cy.intercept('GET', '/api/dashboard/charts/performance-trends', {
        statusCode: 404
      }).as('chartError');

      cy.reload();

      // Verify successful widgets still work
      cy.get('[data-cy="metric-card-models"]').should('be.visible');
      cy.get('[data-cy="metric-value-models"]').should('not.be.empty');

      // Verify failed widget shows error state
      cy.get('[data-cy="chart-error-performance-trends"]').should('be.visible');
      cy.get('[data-cy="chart-retry-performance-trends"]').should('be.visible');

      // Test individual widget retry
      cy.intercept('GET', '/api/dashboard/charts/performance-trends', {
        fixture: 'api-responses.json'
      });
      cy.get('[data-cy="chart-retry-performance-trends"]').click();

      cy.get('[data-cy="chart-error-performance-trends"]').should('not.exist');
      cy.waitForChart('[data-cy="performance-trends-chart"]');
    });
  });

  describe('Accessibility & Keyboard Navigation', () => {
    it('should meet accessibility standards for dashboard interactions', () => {
      // Test keyboard navigation through widgets
      cy.get('[data-cy="metric-card-models"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'metric-card-models');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'metric-card-experiments');

      // Test screen reader announcements
      cy.get('[data-cy="metric-value-models"]')
        .should('have.attr', 'aria-label')
        .and('match', /models.*count/i);

      // Test chart accessibility
      cy.get('[data-cy="performance-trends-chart"]')
        .should('have.attr', 'role', 'img')
        .and('have.attr', 'aria-label');

      // Test high contrast support
      cy.get('body').invoke('addClass', 'high-contrast');
      cy.get('[data-cy="metric-card-models"]')
        .should('have.css', 'border-width')
        .and('not.equal', '0px');
    });

    it('should support keyboard chart interactions', () => {
      cy.get('[data-cy="performance-trends-chart"]').focus();

      // Test arrow key navigation
      cy.focused().type('{rightarrow}');
      cy.get('[data-cy="chart-focus-indicator"]').should('be.visible');

      cy.focused().type('{enter}');
      cy.get('[data-cy="chart-tooltip"]').should('be.visible');

      // Test escape to close tooltip
      cy.focused().type('{esc}');
      cy.get('[data-cy="chart-tooltip"]').should('not.exist');
    });
  });
});
