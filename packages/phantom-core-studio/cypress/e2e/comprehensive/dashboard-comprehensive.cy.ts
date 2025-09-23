/// <reference types="cypress" />

import { DashboardPage } from '../../support/page-objects/DashboardPage';

describe('Dashboard - Comprehensive Test Suite', () => {
  let dashboardPage: DashboardPage;

  beforeEach(() => {
    dashboardPage = new DashboardPage();
    cy.setupTestEnvironment('dashboard');

    // Mock real-time data updates
    cy.intercept('GET', '/api/dashboard/realtime', {
      fixture: 'dashboard-metrics.json'
    }).as('realtimeMetrics');

    // Mock WebSocket connection for real-time updates
    cy.window().then((win) => {
      // Mock WebSocket for real-time features
      const MockWebSocket = class implements WebSocket {
        static readonly CONNECTING = 0;
        static readonly OPEN = 1;
        static readonly CLOSING = 2;
        static readonly CLOSED = 3;
        
        readonly CONNECTING = 0;
        readonly OPEN = 1;
        readonly CLOSING = 2;
        readonly CLOSED = 3;
        
        readyState = 1; // OPEN
        url = '';
        protocol = '';
        extensions = '';
        binaryType: BinaryType = 'blob';
        bufferedAmount = 0;
        
        constructor(url: string | URL) {
          this.url = typeof url === 'string' ? url : url.toString();
          setTimeout(() => {
            this.onopen && this.onopen(new Event('open'));
          }, 100);
        }
        
        onopen: ((this: WebSocket, ev: Event) => void) | null = null;
        onmessage: ((this: WebSocket, ev: MessageEvent) => void) | null = null;
        onerror: ((this: WebSocket, ev: Event) => void) | null = null;
        onclose: ((this: WebSocket, ev: CloseEvent) => void) | null = null;
        
        send = cy.stub();
        close = cy.stub();
        
        addEventListener = cy.stub();
        removeEventListener = cy.stub();
        dispatchEvent = cy.stub().returns(true);
      };
      
      (win as Window & { WebSocket: typeof WebSocket }).WebSocket = MockWebSocket as unknown as typeof WebSocket;
    });
  });

  describe('Core Functionality', () => {
    it('should load dashboard with all components', () => {
      cy.logTestStep('Testing complete dashboard load');

      dashboardPage
        .visit()
        .performComprehensiveValidation()
        .verifyRealTimeUpdates();
    });

    it('should handle metric interactions', () => {
      cy.logTestStep('Testing metric card interactions');

      dashboardPage
        .visit()
        .waitForPageLoad();

      // Test metric card clicks
      cy.get('[data-cy="models-metric"]').click();
      cy.url().should('include', '/models');

      cy.go('back');
      dashboardPage.waitForPageLoad();

      cy.get('[data-cy="experiments-metric"]').click();
      cy.url().should('include', '/experiments');
    });

    it('should display and interact with charts', () => {
      cy.logTestStep('Testing chart interactions');

      dashboardPage
        .visit()
        .waitForPageLoad()
        .interactWithPerformanceChart()
        .verifyChartDisplay();

      // Test chart interactions
      cy.interactWithChart('performance-chart', 'hover');
      cy.verifyChartTooltip('accuracy');

      // Test chart controls
      cy.get('[data-cy="chart-timeframe-select"]').click();
      cy.contains('[role="option"]', 'Last 7 days').click();
      cy.waitForApiResponse('getDashboardMetrics');
    });
  });

  describe('Real-time Features', () => {
    it('should update metrics in real-time', () => {
      cy.logTestStep('Testing real-time metric updates');

      dashboardPage
        .visit()
        .waitForPageLoad();

      // Capture initial metric values
      cy.get('[data-cy="models-metric"]').invoke('text').as('initialModelsCount');
      cy.get('[data-cy="experiments-metric"]').invoke('text').as('initialExperimentsCount');

      // Simulate real-time update
      cy.intercept('GET', '/api/dashboard/realtime', {
        body: {
          overview: {
            totalModels: 25, // Updated value
            activeExperiments: 8, // Updated value
            deployedModels: 13,
            totalDatasets: 157
          }
        }
      }).as('updatedMetrics');

      // Trigger update
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('dashboard-update'));
      });

      // Verify updates
      cy.get('[data-cy="models-metric"]').should('contain.text', '25');
      cy.get('[data-cy="experiments-metric"]').should('contain.text', '8');
    });

    it('should handle connection status changes', () => {
      cy.logTestStep('Testing connection status handling');

      dashboardPage
        .visit()
        .waitForPageLoad();

      // Verify initial connection
      cy.get('[data-cy="connection-status"]').should('contain.text', 'Connected');

      // Simulate connection loss
      cy.window().then((win) => {
        Object.defineProperty(win.navigator, 'onLine', {
          writable: true,
          value: false
        });
        win.dispatchEvent(new Event('offline'));
      });

      cy.get('[data-cy="connection-status"]').should('contain.text', 'Disconnected');
      cy.get('[data-cy="offline-indicator"]').should('be.visible');

      // Simulate reconnection
      cy.window().then((win) => {
        Object.defineProperty(win.navigator, 'onLine', {
          writable: true,
          value: true
        });
        win.dispatchEvent(new Event('online'));
      });

      cy.get('[data-cy="connection-status"]').should('contain.text', 'Connected');
      cy.get('[data-cy="offline-indicator"]').should('not.exist');
    });
  });

  describe('Error Handling', () => {
    it('should handle API failures gracefully', () => {
      cy.logTestStep('Testing API failure handling');

      // Mock API failure
      cy.intercept('GET', '/api/dashboard/metrics', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('metricsError');

      dashboardPage
        .visit()
        .waitForPageLoad();

      // Verify error handling
      cy.get('[data-cy="error-message"]').should('be.visible');
      cy.get('[data-cy="retry-button"]').should('be.visible');

      // Test retry functionality
      cy.intercept('GET', '/api/dashboard/metrics', {
        fixture: 'dashboard-metrics.json'
      }).as('metricsRetry');

      cy.get('[data-cy="retry-button"]').click();
      cy.waitForApiResponse('metricsRetry');
      cy.get('[data-cy="error-message"]').should('not.exist');
    });

    it('should handle partial data gracefully', () => {
      cy.logTestStep('Testing partial data handling');

      // Mock partial response
      cy.intercept('GET', '/api/dashboard/metrics', {
        body: {
          overview: {
            totalModels: 24,
            activeExperiments: null, // Missing data
            deployedModels: 12
          },
          performance: null // Missing performance data
        }
      }).as('partialMetrics');

      dashboardPage
        .visit()
        .waitForPageLoad();

      // Verify graceful degradation
      cy.get('[data-cy="models-metric"]').should('contain.text', '24');
      cy.get('[data-cy="experiments-metric"]').should('contain.text', '--');
      cy.get('[data-cy="performance-chart"]').should('not.exist');
      cy.get('[data-cy="no-performance-data"]').should('be.visible');
    });
  });

  describe('Performance Testing', () => {
    it('should meet performance benchmarks', () => {
      cy.logTestStep('Testing dashboard performance');

      const startTime = Date.now();

      dashboardPage
        .visit()
        .waitForPageLoad();

      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(3000); // 3 second load time

      // Test chart rendering performance
      cy.measureChartRender('[data-cy="performance-chart"]');
      cy.measureChartRender('[data-cy="trends-chart"]');

      // Test interaction responsiveness
      const interactionStart = Date.now();
      cy.get('[data-cy="refresh-dashboard"]').click();
      cy.get('[data-cy="loading-spinner"]').should('be.visible');
      cy.get('[data-cy="loading-spinner"]').should('not.exist');

      const interactionTime = Date.now() - interactionStart;
      expect(interactionTime).to.be.lessThan(2000); // 2 second interaction response
    });

    it('should handle large datasets efficiently', () => {
      cy.logTestStep('Testing large dataset handling');

      // Mock large dataset response
      const largeMetrics = {
        overview: { totalModels: 1000, activeExperiments: 250 },
        charts: {
          accuracyTrend: Array.from({ length: 365 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            accuracy: 0.85 + Math.random() * 0.1,
            models: Math.floor(Math.random() * 100)
          }))
        }
      };

      cy.intercept('GET', '/api/dashboard/metrics', { body: largeMetrics }).as('largeMetrics');

      dashboardPage
        .visit()
        .waitForPageLoad();

      // Verify charts render with large datasets
      cy.waitForChart('[data-cy="trends-chart"]', 15000);
      cy.get('[data-cy="trends-chart"] .recharts-line-dot').should('have.length.at.least', 100);
    });
  });

  describe('Accessibility', () => {
    it('should meet accessibility standards', () => {
      cy.logTestStep('Testing dashboard accessibility');

      dashboardPage
        .visit()
        .waitForPageLoad()
        .checkAccessibility();

      // Test keyboard navigation
      cy.get('body').tab();
      cy.focused().should('be.visible');

      // Test ARIA labels
      dashboardPage.verifyAriaLabels([
        { selector: '[data-cy="models-metric"]', expectedRole: 'button' },
        { selector: '[data-cy="performance-chart"]', expectedRole: 'img' },
        { selector: '[data-cy="refresh-dashboard"]', expectedLabel: 'Refresh dashboard' }
      ]);

      // Test color contrast (charts might have lower contrast)
      cy.checkColorContrast(3.0); // WCAG AA standard
    });

    it('should support screen readers', () => {
      cy.logTestStep('Testing screen reader support');

      dashboardPage
        .visit()
        .waitForPageLoad();

      // Verify live regions for dynamic content
      cy.get('[data-cy="live-region"]').should('have.attr', 'aria-live', 'polite');

      // Test metric announcements
      cy.get('[data-cy="models-metric"]').should('have.attr', 'aria-describedby');

      // Verify chart accessibility
      cy.get('[data-cy="performance-chart"]').within(() => {
        cy.get('[role="img"]').should('have.attr', 'aria-label');
        cy.get('[data-cy="chart-data-table"]').should('exist'); // Fallback data table
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to different screen sizes', () => {
      cy.logTestStep('Testing responsive dashboard design');

      dashboardPage
        .visit()
        .waitForPageLoad();

      // Test mobile view
      cy.viewport('iphone-6');
      cy.get('[data-cy="metrics-container"]').should('be.visible');
      cy.get('[data-cy="metric-card"]').should('have.css', 'width').and('match', /100%/);

      // Test tablet view
      cy.viewport('ipad-2');
      cy.get('[data-cy="performance-chart"]').should('be.visible');

      // Test desktop view
      cy.viewport(1920, 1080);
      cy.get('[data-cy="dashboard-grid"]').should('have.css', 'grid-template-columns');

      // Test ultra-wide view
      cy.viewport(2560, 1440);
      cy.get('[data-cy="dashboard-content"]').should('have.css', 'max-width');
    });

    it('should handle orientation changes', () => {
      cy.logTestStep('Testing orientation changes');

      dashboardPage
        .visit()
        .waitForPageLoad();

      // Portrait mode
      cy.viewport(768, 1024);
      cy.get('[data-cy="sidebar"]').should('not.be.visible');
      cy.get('[data-cy="sidebar-toggle"]').should('be.visible');

      // Landscape mode
      cy.viewport(1024, 768);
      cy.get('[data-cy="sidebar"]').should('be.visible');
    });
  });

  describe('Data Filtering and Search', () => {
    it('should filter dashboard data correctly', () => {
      cy.logTestStep('Testing dashboard filtering');

      dashboardPage
        .visit()
        .waitForPageLoad()
        .applyFilter('dateRange', 'last-week');

      cy.waitForApiResponse('getDashboardMetrics');
      cy.get('[data-cy="filter-applied-indicator"]').should('be.visible');

      // Test multiple filters
      dashboardPage.applyFilter('modelType', 'neural-network');
      cy.get('[data-cy="active-filters"]').should('contain.text', '2 filters');

      // Clear filters
      cy.get('[data-cy="clear-filters"]').click();
      cy.get('[data-cy="active-filters"]').should('not.exist');
    });

    it('should search dashboard content', () => {
      cy.logTestStep('Testing dashboard search');

      dashboardPage
        .visit()
        .waitForPageLoad()
        .searchDashboard('churn');

      cy.get('[data-cy="search-results"]').should('be.visible');
      cy.get('[data-cy="search-highlight"]').should('contain.text', 'churn');

      dashboardPage.clearSearch();
      cy.get('[data-cy="search-results"]').should('not.exist');
    });
  });

  describe('Customization and Personalization', () => {
    it('should save user preferences', () => {
      cy.logTestStep('Testing user preference persistence');

      dashboardPage
        .visit()
        .waitForPageLoad();

      // Customize dashboard layout
      cy.get('[data-cy="customize-dashboard"]').click();
      cy.get('[data-cy="widget-performance-chart"]').uncheck();
      cy.get('[data-cy="save-customization"]').click();

      // Reload and verify persistence
      cy.reload();
      dashboardPage.waitForPageLoad();
      cy.get('[data-cy="performance-chart"]').should('not.exist');

      // Reset to default
      cy.get('[data-cy="customize-dashboard"]').click();
      cy.get('[data-cy="reset-to-default"]').click();
      cy.get('[data-cy="save-customization"]').click();
    });

    it('should support theme switching', () => {
      cy.logTestStep('Testing theme switching');

      dashboardPage
        .visit()
        .waitForPageLoad()
        .toggleTheme();

      cy.get('body').should('have.attr', 'data-theme', 'dark');
      cy.get('[data-cy="dashboard-content"]').should('have.css', 'background-color');

      dashboardPage.toggleTheme();
      cy.get('body').should('have.attr', 'data-theme', 'light');
    });
  });

  describe('Edge Cases and Stress Testing', () => {
    it('should handle rapid user interactions', () => {
      cy.logTestStep('Testing rapid interactions');

      dashboardPage
        .visit()
        .waitForPageLoad();

      // Rapid clicking test
      for (let i = 0; i < 10; i++) {
        cy.get('[data-cy="refresh-dashboard"]').click();
        cy.wait(100);
      }

      // Ensure system remains stable
      cy.get('[data-cy="dashboard-content"]').should('be.visible');
      cy.get('[data-cy="error-message"]').should('not.exist');
    });

    it('should handle network interruptions', () => {
      cy.logTestStep('Testing network interruption handling');

      dashboardPage
        .visit()
        .waitForPageLoad();

      // Simulate network failure during operation
      cy.intercept('GET', '/api/dashboard/metrics', { forceNetworkError: true }).as('networkError');

      cy.get('[data-cy="refresh-dashboard"]').click();
      cy.get('[data-cy="network-error-message"]').should('be.visible');

      // Simulate network recovery
      cy.intercept('GET', '/api/dashboard/metrics', { fixture: 'dashboard-metrics.json' }).as('networkRecovery');

      cy.get('[data-cy="retry-button"]').click();
      cy.waitForApiResponse('networkRecovery');
      cy.get('[data-cy="network-error-message"]').should('not.exist');
    });

    it('should handle browser tab visibility changes', () => {
      cy.logTestStep('Testing tab visibility handling');

      dashboardPage
        .visit()
        .waitForPageLoad();

      // Simulate tab becoming hidden
      cy.window().then((win) => {
        Object.defineProperty(win.document, 'visibilityState', {
          value: 'hidden',
          writable: true
        });
        win.document.dispatchEvent(new Event('visibilitychange'));
      });

      // Verify real-time updates are paused
      cy.get('[data-cy="updates-paused-indicator"]').should('be.visible');

      // Simulate tab becoming visible again
      cy.window().then((win) => {
        Object.defineProperty(win.document, 'visibilityState', {
          value: 'visible',
          writable: true
        });
        win.document.dispatchEvent(new Event('visibilitychange'));
      });

      // Verify updates resume
      cy.get('[data-cy="updates-paused-indicator"]').should('not.exist');
    });
  });
});
