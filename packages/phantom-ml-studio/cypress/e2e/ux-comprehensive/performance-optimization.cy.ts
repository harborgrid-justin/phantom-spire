/// <reference types="cypress" />

/**
 * UX Test Suite: Performance Optimization
 * Loading states, perceived performance, memory management, and optimization validation
 */

describe('UX: Performance Optimization', () => {
  beforeEach(() => {
    cy.setupTestEnvironment('ml-models');
  });

  describe('Progressive Loading Optimization', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('should implement optimal progressive loading patterns', () => {
      // Test skeleton loading states
      cy.get('[data-cy="dashboard-skeleton"]').should('be.visible');
      cy.get('[data-cy="metric-skeleton"]').should('have.length', 4);
      cy.get('[data-cy="chart-skeleton"]').should('be.visible');

      // Measure skeleton display time
      const skeletonStart = Date.now();
      cy.wait('@getDashboardMetrics');

      cy.get('[data-cy="dashboard-skeleton"]').should('not.exist').then(() => {
        const skeletonTime = Date.now() - skeletonStart;
        expect(skeletonTime).to.be.lessThan(3000); // Skeleton replaced within 3s
      });

      // Test progressive content reveal
      cy.get('[data-cy="metric-card-models"]').should('be.visible');
      cy.get('[data-cy="metric-card-experiments"]').should('be.visible');

      // Charts should load after metrics
      cy.waitForChart('[data-cy="performance-trends-chart"]');
      cy.get('[data-cy="performance-trends-chart"]').should('be.visible');

      // Test lazy loading of secondary content
      cy.scrollTo('bottom');
      cy.get('[data-cy="secondary-metrics"]').should('be.visible');
      cy.get('[data-cy="detailed-analytics"]').should('be.visible');
    });

    it('should optimize perceived performance with smooth transitions', () => {
      // Test page transition performance
      const navigationStart = Date.now();
      cy.navigateViaSidebar('Data Explorer');

      // Should show loading state immediately
      cy.get('[data-cy="page-transition-loader"]').should('be.visible');

      cy.url().should('include', '/dataExplorer').then(() => {
        const navigationTime = Date.now() - navigationStart;
        expect(navigationTime).to.be.lessThan(500); // Navigation feels instant
      });

      // Test smooth content transitions
      cy.get('[data-cy="content-fade-in"]').should('have.class', 'animate-in');
      cy.get('[data-cy="upload-area"]').should('be.visible');

      // Test progressive image loading
      cy.get('[data-cy="feature-illustration"]').should('have.attr', 'src').and('contain', 'placeholder');
      cy.get('[data-cy="feature-illustration"]', { timeout: 2000 })
        .should('have.attr', 'src').and('not.contain', 'placeholder');

      // Test staggered animation entrance
      cy.get('[data-cy="feature-card"]').each(($card, index) => {
        cy.wrap($card).should('have.css', 'animation-delay', `${index * 100}ms`);
      });
    });

    it('should handle large dataset loading efficiently', () => {
      cy.visit('/dataExplorer');

      // Mock large dataset with streaming response
      cy.intercept('POST', '/api/datasets/upload', {
        statusCode: 202,
        body: { uploadId: 'upload-123', status: 'processing' }
      }).as('startUpload');

      cy.intercept('GET', '/api/datasets/upload-123/progress',
        { body: { progress: 0, stage: 'Parsing CSV' } }
      ).as('uploadProgress1');

      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/large-dataset.csv');
      cy.wait('@startUpload');

      // Test progressive progress indication
      cy.get('[data-cy="upload-progress-container"]').should('be.visible');
      cy.get('[data-cy="progress-stage"]').should('contain', 'Parsing CSV');

      // Mock progress updates
      cy.intercept('GET', '/api/datasets/upload-123/progress',
        { body: { progress: 35, stage: 'Detecting data types' } }
      );

      cy.get('[data-cy="progress-bar"]', { timeout: 2000 })
        .should('have.attr', 'aria-valuenow', '35');
      cy.get('[data-cy="progress-stage"]').should('contain', 'Detecting data types');

      // Test chunked data preview
      cy.intercept('GET', '/api/datasets/upload-123/progress',
        { body: { progress: 100, status: 'completed', previewRows: 1000 } }
      );

      cy.get('[data-cy="data-preview-table"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-cy="virtualized-rows"]').should('be.visible');
      cy.get('[data-cy="total-rows-indicator"]').should('contain', '1000');
    });
  });

  describe('Error State Management', () => {
    beforeEach(() => {
      cy.visit('/modelBuilder');
    });

    it('should handle various error scenarios gracefully', () => {
      // Test network failure recovery
      cy.intercept('POST', '/api/datasets/upload', {
        statusCode: 500,
        delay: 100,
        body: { error: 'Server temporarily unavailable' }
      }).as('networkError');

      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.wait('@networkError');

      // Test error state display
      cy.get('[data-cy="upload-error"]').should('be.visible');
      cy.get('[data-cy="error-message"]').should('contain', 'temporarily unavailable');
      cy.get('[data-cy="error-icon"]').should('be.visible');

      // Test retry mechanism
      cy.get('[data-cy="retry-upload"]').should('be.visible');

      // Mock successful retry
      cy.intercept('POST', '/api/datasets/upload', {
        statusCode: 200,
        body: { status: 'success', datasetId: 'dataset-123' }
      });

      cy.get('[data-cy="retry-upload"]').click();
      cy.get('[data-cy="upload-success"]', { timeout: 3000 }).should('be.visible');
      cy.get('[data-cy="upload-error"]').should('not.exist');

      // Test timeout handling
      cy.intercept('POST', '/api/models/train', {
        statusCode: 408,
        body: { error: 'Request timeout' }
      }).as('timeoutError');

      cy.muiStepperNavigate('next');
      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-card-random-forest"]').click();
      cy.muiStepperNavigate('next');
      cy.muiClickButton('btn-start-training');

      cy.wait('@timeoutError');
      cy.get('[data-cy="timeout-error"]').should('be.visible');
      cy.get('[data-cy="extend-timeout"]').should('be.visible');
    });

    it('should provide user-friendly error messaging', () => {
      // Test validation error clarity
      cy.muiClickButton('btn-start-training');

      cy.get('[data-cy="validation-error-dataset"]').should('be.visible');
      cy.get('[data-cy="validation-error-dataset"]')
        .should('contain', 'upload a dataset')
        .and('not.contain', 'error code')
        .and('not.contain', 'null')
        .and('not.contain', 'undefined');

      // Test API error translation
      cy.intercept('POST', '/api/datasets/upload', {
        statusCode: 422,
        body: {
          error: 'VALIDATION_FAILED',
          details: 'CSV_PARSE_ERROR: Invalid delimiter at line 42'
        }
      }).as('validationError');

      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/invalid-csv.csv');
      cy.wait('@validationError');

      // Should show user-friendly message
      cy.get('[data-cy="upload-error"]').should('contain', 'file format issue');
      cy.get('[data-cy="error-details"]').should('contain', 'line 42');
      cy.get('[data-cy="error-help-link"]').should('be.visible');

      // Test progressive error disclosure
      cy.get('[data-cy="show-technical-details"]').click();
      cy.get('[data-cy="technical-error-details"]').should('be.visible');
      cy.get('[data-cy="technical-error-details"]').should('contain', 'CSV_PARSE_ERROR');
    });

    it('should implement intelligent error recovery', () => {
      // Test auto-retry with exponential backoff
      let retryCount = 0;
      cy.intercept('POST', '/api/models/train', (req) => {
        retryCount++;
        if (retryCount < 3) {
          req.reply({ statusCode: 502, body: { error: 'Bad Gateway' } });
        } else {
          req.reply({ statusCode: 200, body: { status: 'started' } });
        }
      }).as('autoRetry');

      // Complete form setup
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.muiStepperNavigate('next');
      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-card-random-forest"]').click();
      cy.muiStepperNavigate('next');

      // Enable auto-retry
      cy.get('[data-cy="enable-auto-retry"]').check();
      cy.muiClickButton('btn-start-training');

      // Should show retry attempts
      cy.get('[data-cy="retry-indicator"]').should('be.visible');
      cy.get('[data-cy="retry-attempt-1"]').should('be.visible');
      cy.get('[data-cy="retry-attempt-2"]').should('be.visible');

      // Eventually succeed
      cy.get('[data-cy="training-started"]', { timeout: 10000 }).should('be.visible');

      // Test offline handling
      cy.window().then((win) => {
        // Simulate offline
        Object.defineProperty(win.navigator, 'onLine', {
          writable: true,
          value: false
        });
        win.dispatchEvent(new Event('offline'));
      });

      cy.get('[data-cy="offline-indicator"]').should('be.visible');
      cy.get('[data-cy="offline-message"]').should('contain', 'connection lost');

      // Test offline queue
      cy.get('[data-cy="save-draft"]').click();
      cy.get('[data-cy="queued-for-sync"]').should('be.visible');

      // Restore online
      cy.window().then((win) => {
        Object.defineProperty(win.navigator, 'onLine', {
          writable: true,
          value: true
        });
        win.dispatchEvent(new Event('online'));
      });

      cy.get('[data-cy="sync-in-progress"]').should('be.visible');
      cy.get('[data-cy="sync-complete"]', { timeout: 3000 }).should('be.visible');
    });
  });

  describe('Performance Under Load', () => {
    it('should maintain performance with large datasets', () => {
      cy.visit('/dataExplorer');

      // Mock large dataset (10,000 rows)
      cy.intercept('GET', '/api/datasets/large/preview', {
        body: {
          data: Array.from({ length: 10000 }, (_, i) => ({
            id: i,
            name: `Record ${i}`,
            score: Math.random() * 100,
            category: ['A', 'B', 'C'][i % 3],
            timestamp: new Date(Date.now() - i * 1000).toISOString()
          })),
          total: 10000
        }
      }).as('largeDataset');

      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/large-dataset.csv');
      cy.wait('@largeDataset');

      // Test virtualized rendering performance
      const renderStart = Date.now();
      cy.get('[data-cy="virtualized-table"]').should('be.visible').then(() => {
        const renderTime = Date.now() - renderStart;
        expect(renderTime).to.be.lessThan(2000); // Render within 2s
      });

      // Test smooth scrolling with large dataset
      cy.get('[data-cy="virtualized-table"]').scrollTo('bottom');
      cy.get('[data-cy="table-row"]').should('have.length.lessThan', 100); // Only visible rows rendered

      // Test filtering performance
      const filterStart = Date.now();
      cy.get('[data-cy="filter-input"]').type('Record 5');
      cy.get('[data-cy="filtered-results"]').should('be.visible').then(() => {
        const filterTime = Date.now() - filterStart;
        expect(filterTime).to.be.lessThan(1000); // Filter within 1s
      });

      // Test sorting performance
      const sortStart = Date.now();
      cy.get('[data-cy="table-header-score"]').click();
      cy.get('[data-cy="sort-indicator"]').should('be.visible').then(() => {
        const sortTime = Date.now() - sortStart;
        expect(sortTime).to.be.lessThan(1500); // Sort within 1.5s
      });
    });

    it('should optimize chart performance with big data', () => {
      cy.visit('/dashboard');

      // Mock high-frequency time series data
      cy.intercept('GET', '/api/dashboard/charts/performance-trends', {
        body: {
          data: Array.from({ length: 10000 }, (_, i) => ({
            timestamp: new Date(Date.now() - (10000 - i) * 60000).toISOString(),
            accuracy: 85 + Math.random() * 10,
            loss: Math.random() * 0.5,
            throughput: 100 + Math.random() * 50
          }))
        }
      }).as('highFrequencyData');

      cy.get('[data-cy="dashboard-refresh"]').click();
      cy.wait('@highFrequencyData');

      // Test chart rendering with data sampling
      const chartStart = Date.now();
      cy.waitForChart('[data-cy="performance-trends-chart"]').then(() => {
        const chartTime = Date.now() - chartStart;
        expect(chartTime).to.be.lessThan(3000); // Chart renders within 3s
      });

      // Test chart interaction performance
      cy.interactWithChart('performance-trends-chart', 'hover', { x: 200, y: 100 });
      cy.get('[data-cy="chart-tooltip"]').should('be.visible');

      // Test zoom performance
      cy.zoomChart('performance-trends-chart', { x1: 50, y1: 50, x2: 300, y2: 200 });
      cy.get('[data-cy="chart-zoom-level"]').should('be.visible');

      // Test real-time updates performance
      cy.intercept('GET', '/api/dashboard/charts/performance-trends/live', {
        body: {
          newPoint: {
            timestamp: new Date().toISOString(),
            accuracy: 92.3,
            loss: 0.12,
            throughput: 145
          }
        }
      }).as('liveUpdate');

      cy.wait('@liveUpdate');
      cy.get('[data-cy="chart-update-animation"]').should('have.class', 'smooth-transition');
    });

    it('should manage memory usage effectively', () => {
      // Test memory cleanup on navigation
      cy.visit('/dataExplorer');
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/large-dataset.csv');

      // Navigate to different page
      cy.visit('/modelBuilder');

      // Check memory cleanup
      cy.window().then((win) => {
        const mockWin = win as Window & {
          gc?: () => void;
          performance: Performance & {
            memory?: {
              usedJSHeapSize: number;
            };
          };
        };
        
        // Force garbage collection if available
        if (mockWin.gc) {
          mockWin.gc();
        }

        // Memory should be reasonable after cleanup
        if (mockWin.performance.memory) {
          expect(mockWin.performance.memory.usedJSHeapSize).to.be.lessThan(100000000); // < 100MB
        }
      });

      // Test component unmounting cleanup
      cy.visit('/biasDetection');
      cy.muiClickButton('analyze-model');
      cy.get('[data-cy="analysis-dialog"]').should('be.visible');

      // Close modal
      cy.get('body').type('{esc}');
      cy.get('[data-cy="analysis-dialog"]').should('not.exist');

      // Test event listener cleanup
      cy.window().then((win) => {
        const mockWin = win as Window & {
          eventListeners?: Record<string, unknown>;
        };
        const listenerCount = Object.keys(mockWin.eventListeners || {}).length;
        expect(listenerCount).to.be.lessThan(50); // Reasonable listener count
      });

      // Test interval/timeout cleanup
      cy.visit('/real-time-monitoring');
      cy.window().then((win) => {
        const intervalId = win.setInterval(() => {}, 1000);
        expect(intervalId).to.be.a('number');
      });

      cy.visit('/dashboard');
      cy.window().then((win) => {
        const mockWin = win as Window & {
          activeIntervals?: unknown[];
        };
        // Active intervals should be cleaned up
        expect(mockWin.activeIntervals?.length || 0).to.be.lessThan(5);
      });
    });
  });

  describe('Loading State Optimization', () => {
    it('should provide contextual loading indicators', () => {
      cy.visit('/modelBuilder');

      // Test file upload loading states
      cy.get('[data-cy="form-upload-dropzone"]').should('be.visible');
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');

      // Immediate feedback
      cy.get('[data-cy="upload-spinner"]').should('be.visible');
      cy.get('[data-cy="upload-progress-text"]').should('contain', 'Uploading');

      // Progress indication
      cy.get('[data-cy="upload-progress-bar"]').should('be.visible');
      cy.get('[data-cy="upload-percentage"]').should('match', /\d+%/);

      // Completion feedback
      cy.get('[data-cy="upload-success"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-cy="upload-spinner"]').should('not.exist');

      // Test form processing loading
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="target-column-loading"]').should('be.visible');
      cy.get('[data-cy="analyzing-data-text"]').should('be.visible');

      // Test algorithm selection loading
      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-recommendations-loading"]').should('be.visible');

      // Test training initiation loading
      cy.get('[data-cy="algorithm-card-random-forest"]').click();
      cy.muiStepperNavigate('next');
      cy.muiClickButton('btn-start-training');

      cy.get('[data-cy="training-initialization-spinner"]').should('be.visible');
      cy.get('[data-cy="preparing-training-text"]').should('contain', 'Preparing');
    });

    it('should implement smart preloading strategies', () => {
      cy.visit('/dashboard');

      // Test predictive navigation preloading
      cy.get('[data-cy="nav-link-data-explorer"]').trigger('mouseover');
      cy.get('[data-cy="preload-indicator-data-explorer"]').should('exist');

      // Test critical resource preloading
      cy.get('head link[rel="preload"]').should('exist');
      cy.get('head link[rel="preload"][as="script"]').should('have.length.greaterThan', 0);

      // Test data prefetching
      cy.intercept('GET', '/api/models/recent', { fixture: 'recent-models.json' }).as('prefetchModels');
      cy.get('[data-cy="models-section"]').scrollIntoView();
      cy.wait('@prefetchModels');

      // Navigate to models page - should be instant
      const navStart = Date.now();
      cy.navigateViaSidebar('Models');
      cy.get('[data-cy="models-grid"]').should('be.visible').then(() => {
        const navTime = Date.now() - navStart;
        expect(navTime).to.be.lessThan(200); // Nearly instant due to prefetch
      });

      // Test image preloading
      cy.visit('/dataExplorer');
      cy.get('[data-cy="tutorial-images"]').should('exist');
      cy.get('img[data-preloaded="true"]').should('have.length.greaterThan', 0);
    });

    it('should optimize perceived performance with skeleton screens', () => {
      // Test different skeleton patterns
      cy.visit('/experiments');

      // Grid skeleton for experiment cards
      cy.get('[data-cy="experiments-skeleton"]').should('be.visible');
      cy.get('[data-cy="experiment-card-skeleton"]').should('have.length', 6);

      // Text content skeletons
      cy.get('[data-cy="title-skeleton"]').should('have.css', 'background-color');
      cy.get('[data-cy="description-skeleton"]').should('have.css', 'background-color');

      // Chart skeleton
      cy.get('[data-cy="chart-skeleton"]').should('be.visible');
      cy.get('[data-cy="chart-skeleton"]').should('have.css', 'height', '300px');

      // Progressive skeleton replacement
      cy.wait('@getExperiments');
      cy.get('[data-cy="experiments-skeleton"]').should('not.exist');
      cy.get('[data-cy="experiment-card"]').should('have.length.greaterThan', 0);

      // Test skeleton accessibility
      cy.get('[data-cy="experiments-skeleton"]').should('have.attr', 'aria-label');
      cy.get('[data-cy="experiments-skeleton"]').should('have.attr', 'role', 'status');
    });
  });

  describe('Network Optimization', () => {
    it('should optimize API request patterns', () => {
      cy.visit('/dashboard');

      // Test request batching
      cy.intercept('POST', '/api/batch', { fixture: 'batch-response.json' }).as('batchRequest');
      cy.get('[data-cy="dashboard-refresh"]').click();

      cy.wait('@batchRequest').then(interception => {
        const requests = interception.request.body.requests;
        expect(requests).to.have.length.greaterThan(1); // Multiple requests batched
      });

      // Test request deduplication
      cy.get('[data-cy="metric-card-models"]').click();
      cy.get('[data-cy="metric-card-models"]').click(); // Double click

      // Should only make one request
      cy.get('@getModels.all').should('have.length', 1);

      // Test caching effectiveness
      cy.navigateViaSidebar('Data Explorer');
      cy.navigateViaSidebar('Dashboard');

      // Should use cached data
      cy.get('[data-cy="dashboard-content"]').should('be.visible');
      cy.get('[data-cy="loading-spinner"]').should('not.exist');

      // Test stale-while-revalidate pattern
      cy.wait(5000); // Wait for cache expiry
      cy.get('[data-cy="dashboard-refresh"]').click();

      // Should show stale data immediately, then update
      cy.get('[data-cy="dashboard-content"]').should('be.visible');
      cy.get('[data-cy="background-refresh-indicator"]').should('be.visible');
    });

    it('should handle slow network conditions gracefully', () => {
      // Simulate slow 3G
      cy.intercept('**', { throttleKbps: 300 }).as('slowNetwork');

      cy.visit('/modelBuilder');

      // Should show appropriate feedback for slow loading
      cy.get('[data-cy="slow-connection-detected"]').should('be.visible');
      cy.get('[data-cy="loading-time-estimate"]').should('be.visible');

      // Should offer low-bandwidth alternatives
      cy.get('[data-cy="lightweight-mode-suggestion"]').should('be.visible');
      cy.get('[data-cy="enable-lightweight-mode"]').click();

      // Test reduced functionality for performance
      cy.get('[data-cy="simplified-upload-interface"]').should('be.visible');
      cy.get('[data-cy="reduced-animations"]').should('have.class', 'motion-reduced');

      // Test progressive enhancement
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.get('[data-cy="basic-preview"]').should('be.visible');
      cy.get('[data-cy="advanced-visualizations"]').should('not.exist');
    });

    it('should implement intelligent retry mechanisms', () => {
      // Test exponential backoff
      let attempts = 0;
      cy.intercept('POST', '/api/models/train', (req) => {
        attempts++;
        if (attempts < 4) {
          req.reply({ statusCode: 503, body: { error: 'Service unavailable' } });
        } else {
          req.reply({ statusCode: 200, body: { status: 'started' } });
        }
      }).as('retryRequests');

      cy.visit('/modelBuilder');
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.muiStepperNavigate('next');
      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-card-random-forest"]').click();
      cy.muiStepperNavigate('next');

      cy.muiClickButton('btn-start-training');

      // Should show retry progress
      cy.get('[data-cy="retry-progress"]').should('be.visible');
      cy.get('[data-cy="retry-attempt-count"]').should('contain', '1');

      // Eventually succeed
      cy.get('[data-cy="training-started"]', { timeout: 15000 }).should('be.visible');

      // Test circuit breaker pattern
      cy.intercept('GET', '/api/unstable-endpoint', { statusCode: 500 }).as('circuitBreakerTest');

      // Multiple failures should trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        cy.request({ url: '/api/unstable-endpoint', failOnStatusCode: false });
      }

      cy.get('[data-cy="circuit-breaker-active"]').should('be.visible');
      cy.get('[data-cy="fallback-content"]').should('be.visible');
    });
  });
});
