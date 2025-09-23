/// <reference types="cypress" />

/**
 * UX Test Suite: Responsive Design Patterns
 * Cross-device consistency, mobile-first design, and adaptive layouts
 */

describe('UX: Responsive Design Patterns', () => {
  beforeEach(() => {
    cy.setupTestEnvironment('ml-models');
  });

  describe('Cross-Device Parity', () => {
    const deviceSizes = [
      { width: 320, height: 568, name: 'iPhone SE', type: 'mobile' },
      { width: 375, height: 667, name: 'iPhone 8', type: 'mobile' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max', type: 'mobile' },
      { width: 768, height: 1024, name: 'iPad', type: 'tablet' },
      { width: 1024, height: 768, name: 'iPad Landscape', type: 'tablet' },
      { width: 1280, height: 720, name: 'Desktop Small', type: 'desktop' },
      { width: 1920, height: 1080, name: 'Desktop Large', type: 'desktop' },
      { width: 2560, height: 1440, name: 'Desktop XL', type: 'desktop' }
    ];

    it('should maintain feature parity across all device sizes', () => {
      deviceSizes.forEach(device => {
        cy.viewport(device.width, device.height);
        cy.visit('/dashboard');
        cy.log(`Testing ${device.name} (${device.width}x${device.height})`);

        // Verify core functionality exists
        cy.get('[data-cy="main-navigation"]').should('be.visible');
        cy.get('[data-cy="dashboard-metrics"]').should('be.visible');

        // Test navigation accessibility
        if (device.type === 'mobile') {
          cy.get('[data-cy="mobile-nav-toggle"]').should('be.visible');
          cy.get('[data-cy="mobile-nav-toggle"]').click();
          cy.get('[data-cy="nav-sidebar"]').should('be.visible');
        } else {
          cy.get('[data-cy="nav-sidebar"]').should('be.visible');
        }

        // Test data visualization responsiveness
        cy.waitForChart('[data-cy="performance-trends-chart"]');
        cy.get('[data-cy="performance-trends-chart"] .recharts-wrapper')
          .invoke('width')
          .should('be.greaterThan', 200);

        // Test interactive elements
        cy.get('[data-cy="metric-card-models"]').click();
        cy.get('[data-cy="metric-details"]').should('be.visible');

        // Close modal/overlay for next iteration
        cy.get('body').type('{esc}');
      });
    });

    it('should provide consistent user workflows across devices', () => {
      const workflow = [
        { action: 'navigate', target: '/modelBuilder' },
        { action: 'upload', target: 'cypress/fixtures/test-dataset.csv' },
        { action: 'select-target', target: 'performance_score' },
        { action: 'select-algorithm', target: 'random-forest' },
        { action: 'configure', target: 'hyperparameters' }
      ];

      deviceSizes.slice(0, 3).forEach(device => { // Test key devices
        cy.viewport(device.width, device.height);
        cy.log(`Testing workflow on ${device.name}`);

        // Navigate to model builder
        cy.visit('/modelBuilder');

        // Upload dataset
        cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
        cy.get('[data-cy="upload-success"]', { timeout: 5000 }).should('be.visible');

        // Select target column
        cy.muiStepperNavigate('next');
        cy.muiSelectOption('form-select-target-column', 'performance_score');

        // Select algorithm
        cy.muiStepperNavigate('next');
        if (device.type === 'mobile') {
          cy.get('[data-cy="mobile-algorithm-selector"]').click();
          cy.get('[data-cy="algorithm-option-random-forest"]').click();
        } else {
          cy.get('[data-cy="algorithm-card-random-forest"]').click();
        }

        // Configure parameters
        cy.muiStepperNavigate('next');
        if (device.type === 'mobile') {
          cy.get('[data-cy="mobile-param-editor"]').should('be.visible');
        } else {
          cy.get('[data-cy="hyperparameter-config"]').should('be.visible');
        }

        // Verify workflow completion possible
        cy.get('[data-cy="btn-start-training"]').should('be.visible').and('not.be.disabled');
      });
    });

    it('should adapt touch interactions for different screen sizes', () => {
      const touchDevices = deviceSizes.filter(d => d.type === 'mobile' || d.type === 'tablet');

      touchDevices.forEach(device => {
        cy.viewport(device.width, device.height);
        cy.visit('/dataExplorer');
        cy.log(`Testing touch interactions on ${device.name}`);

        cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
        cy.get('[data-cy="data-preview-table"]', { timeout: 5000 }).should('be.visible');

        // Test touch scrolling
        cy.get('[data-cy="data-preview-table"]')
          .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
          .trigger('touchmove', { touches: [{ clientX: 50, clientY: 100 }] })
          .trigger('touchend');

        // Test touch chart interactions
        cy.get('[data-cy="correlation-tab"]').click();
        cy.waitForChart('[data-cy="correlation-heatmap"]');

        cy.get('[data-cy="correlation-heatmap"]')
          .trigger('touchstart', { touches: [{ clientX: 150, clientY: 150 }] })
          .trigger('touchmove', { touches: [{ clientX: 200, clientY: 200 }] })
          .trigger('touchend');

        // Verify touch feedback
        cy.get('[data-cy="chart-tooltip"]').should('be.visible');

        // Test pinch-to-zoom gesture
        if (device.type === 'mobile') {
          cy.get('[data-cy="correlation-heatmap"]')
            .trigger('touchstart', {
              touches: [
                { clientX: 100, clientY: 100 },
                { clientX: 200, clientY: 200 }
              ]
            })
            .trigger('touchmove', {
              touches: [
                { clientX: 80, clientY: 80 },
                { clientX: 220, clientY: 220 }
              ]
            })
            .trigger('touchend');

          cy.get('[data-cy="chart-zoom-controls"]').should('be.visible');
        }
      });
    });
  });

  describe('Mobile-First Design Validation', () => {
    beforeEach(() => {
      cy.viewport(375, 667); // iPhone 8 size
    });

    it('should implement progressive enhancement from mobile base', () => {
      cy.visit('/dashboard');

      // Test mobile-first navigation
      cy.get('[data-cy="mobile-navigation"]').should('be.visible');
      cy.get('[data-cy="mobile-nav-toggle"]').should('be.visible');

      // Test mobile-optimized content layout
      cy.get('[data-cy="mobile-metric-cards"]').should('be.visible');
      cy.get('[data-cy="metric-card"]').should('have.length.greaterThan', 0);

      // Test mobile chart adaptations
      cy.get('[data-cy="mobile-chart-container"]').should('be.visible');
      cy.waitForChart('[data-cy="performance-trends-chart"]');

      // Progressive enhancement: add features for larger screens
      cy.viewport(768, 1024); // Tablet
      cy.get('[data-cy="tablet-enhanced-features"]').should('be.visible');

      cy.viewport(1280, 720); // Desktop
      cy.get('[data-cy="desktop-advanced-features"]').should('be.visible');
      cy.get('[data-cy="sidebar-always-visible"]').should('be.visible');
    });

    it('should optimize mobile form interactions', () => {
      cy.visit('/modelBuilder');

      // Test mobile form layout
      cy.get('[data-cy="mobile-form-container"]').should('be.visible');
      cy.get('[data-cy="mobile-wizard-steps"]').should('be.visible');

      // Test mobile file upload
      cy.get('[data-cy="mobile-upload-area"]').should('be.visible');
      cy.get('[data-cy="mobile-upload-area"]').should('have.css', 'min-height', '120px');

      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');

      // Test mobile input optimization
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="mobile-target-selector"]').should('be.visible');
      cy.get('[data-cy="form-select-target-column"]')
        .should('have.attr', 'data-mobile-optimized', 'true');

      // Test mobile parameter adjustment
      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-card-random-forest"]').click();
      cy.muiStepperNavigate('next');

      cy.get('[data-cy="mobile-param-cards"]').should('be.visible');
      cy.get('[data-cy="param-card-n_estimators"]').click();
      cy.get('[data-cy="mobile-slider-modal"]').should('be.visible');

      // Test touch-optimized controls
      cy.get('[data-cy="mobile-slider"]')
        .should('have.css', 'height')
        .and('match', /[4-9]\d+px/); // At least 40px height
    });

    it('should provide mobile-specific UI patterns', () => {
      cy.visit('/biasDetection');

      // Test mobile-first card layouts
      cy.get('[data-cy="mobile-feature-cards"]').should('be.visible');
      cy.get('[data-cy="feature-card"]').should('have.css', 'width', '100%');

      // Test mobile action sheets
      cy.muiClickButton('analyze-model');
      cy.get('[data-cy="mobile-action-sheet"]').should('be.visible');
      cy.get('[data-cy="mobile-action-sheet"]').should('have.css', 'position', 'fixed');

      // Test mobile-optimized modals
      cy.get('[data-cy="mobile-modal-container"]').should('be.visible');
      cy.get('[data-cy="mobile-modal-header"]').should('be.visible');

      // Test pull-to-refresh pattern
      cy.visit('/experiments');
      cy.get('[data-cy="experiments-list"]')
        .trigger('touchstart', { touches: [{ clientX: 100, clientY: 50 }] })
        .trigger('touchmove', { touches: [{ clientX: 100, clientY: 150 }] })
        .trigger('touchend');

      cy.get('[data-cy="pull-to-refresh-indicator"]').should('be.visible');

      // Test swipe gestures
      cy.get('[data-cy="experiment-card-0"]')
        .trigger('touchstart', { touches: [{ clientX: 200, clientY: 100 }] })
        .trigger('touchmove', { touches: [{ clientX: 50, clientY: 100 }] })
        .trigger('touchend');

      cy.get('[data-cy="experiment-actions"]').should('be.visible');
    });
  });

  describe('Adaptive Layout Systems', () => {
    it('should implement flexible grid systems', () => {
      const breakpoints = [
        { width: 576, name: 'sm' },
        { width: 768, name: 'md' },
        { width: 992, name: 'lg' },
        { width: 1200, name: 'xl' },
        { width: 1400, name: 'xxl' }
      ];

      cy.visit('/dashboard');

      breakpoints.forEach(bp => {
        cy.viewport(bp.width, 800);
        cy.log(`Testing layout at ${bp.name} breakpoint (${bp.width}px)`);

        // Test grid responsiveness
        cy.get('[data-cy="dashboard-grid"]').should('be.visible');

        if (bp.width < 768) {
          // Mobile: Single column
          cy.get('[data-cy="metric-card"]').should('have.css', 'width', '100%');
        } else if (bp.width < 992) {
          // Tablet: Two columns
          cy.get('[data-cy="dashboard-grid"]').should('have.css', 'grid-template-columns')
            .and('match', /repeat\(2,|1fr 1fr/);
        } else {
          // Desktop: Multi-column
          cy.get('[data-cy="dashboard-grid"]').should('have.css', 'grid-template-columns')
            .and('match', /repeat\([3-9],|1fr 1fr 1fr/);
        }

        // Test chart container responsiveness
        cy.get('[data-cy="chart-container"]')
          .invoke('width')
          .should('be.lessThan', bp.width);
      });
    });

    it('should adapt typography and spacing responsively', () => {
      cy.visit('/dashboard');

      // Test mobile typography
      cy.viewport(375, 667);
      cy.get('h1').should('have.css', 'font-size').then((fontSize) => {
        const mobileFontSize = parseFloat(fontSize as unknown as string);

        // Test tablet typography scaling
        cy.viewport(768, 1024);
        cy.get('h1').should('have.css', 'font-size').then((tabletFontSize) => {
          expect(parseFloat(tabletFontSize as unknown as string)).to.be.greaterThan(mobileFontSize);
        });
      });

      // Test desktop typography scaling
      cy.viewport(1280, 720);
      cy.get('h1').should('have.css', 'font-size').then((desktopFontSize) => {
        expect(parseFloat(desktopFontSize as unknown as string)).to.be.greaterThan(24); // Minimum desktop size
      });

      // Test responsive spacing
      cy.viewport(375, 667);
      cy.get('[data-cy="metric-card"]').should('have.css', 'padding').then((mobilePadding) => {
        cy.viewport(1280, 720);
        cy.get('[data-cy="metric-card"]').should('have.css', 'padding').then((desktopPadding) => {
          // Desktop should have more padding
          expect(parseFloat(desktopPadding as unknown as string)).to.be.greaterThan(parseFloat(mobilePadding as unknown as string));
        });
      });
    });

    it('should handle content reflow and text scaling', () => {
      cy.visit('/dataExplorer');
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');

      // Test text scaling at different zoom levels
      [1, 1.25, 1.5, 2].forEach(zoomLevel => {
        cy.get('body').invoke('css', 'zoom', zoomLevel.toString());
        cy.log(`Testing at ${zoomLevel * 100}% zoom`);

        // Verify content remains accessible
        cy.get('[data-cy="data-preview-table"]').should('be.visible');
        cy.get('[data-cy="table-header"]').should('be.visible');

        // Verify no horizontal overflow
        cy.get('body').should('not.have.css', 'overflow-x', 'scroll');

        // Test interaction remains functional
        cy.get('[data-cy="table-header-age"]').click();
        cy.get('[data-cy="sort-indicator"]').should('be.visible');
      });

      // Reset zoom
      cy.get('body').invoke('css', 'zoom', '1');

      // Test content reflow with text size changes
      ['12px', '16px', '20px', '24px'].forEach(fontSize => {
        cy.get('body').invoke('css', 'font-size', fontSize);
        cy.log(`Testing with ${fontSize} base font size`);

        // Verify layout adapts
        cy.get('[data-cy="data-preview-table"]').should('be.visible');
        cy.get('[data-cy="table-cell"]').should('have.css', 'overflow', 'hidden');
      });
    });
  });

  describe('Performance Across Devices', () => {
    it('should maintain performance standards on mobile devices', () => {
      cy.viewport(375, 667);

      // Simulate slower mobile connection
      cy.intercept('**', { throttleKbps: 1000 }); // 1Mbps

      const startTime = Date.now();
      cy.visit('/dashboard');

      // Measure initial load time
      cy.get('[data-cy="dashboard-content"]').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // Mobile should load within 5s
      });

      // Test chart rendering performance on mobile
      const chartStartTime = Date.now();
      cy.waitForChart('[data-cy="performance-trends-chart"]').then(() => {
        const chartLoadTime = Date.now() - chartStartTime;
        expect(chartLoadTime).to.be.lessThan(3000); // Charts within 3s
      });

      // Test smooth scrolling performance
      cy.get('[data-cy="dashboard-content"]').scrollTo('bottom', { duration: 1000 });
      cy.get('[data-cy="dashboard-footer"]').should('be.visible');

      // Test animation performance
      cy.get('[data-cy="mobile-nav-toggle"]').click();
      cy.get('[data-cy="nav-sidebar"]').should('have.css', 'transform');

      // Verify smooth animation (no jank)
      cy.wait(500);
      cy.get('[data-cy="nav-sidebar"]').should('be.visible');
    });

    it('should optimize resource loading for different network conditions', () => {
      // Test on slow 3G
      cy.viewport(375, 667);
      cy.intercept('**', { throttleKbps: 300 }); // Slow 3G

      cy.visit('/modelBuilder');

      // Should show loading states appropriately
      cy.get('[data-cy="page-loading"]').should('be.visible');
      cy.get('[data-cy="skeleton-loader"]').should('be.visible');

      // Progressive loading of features
      cy.get('[data-cy="core-features"]').should('be.visible');
      cy.get('[data-cy="advanced-features"]').should('not.exist');

      // Test image lazy loading
      cy.scrollTo('bottom');
      cy.get('[data-cy="lazy-loaded-content"]').should('be.visible');

      // Test on fast WiFi
      cy.intercept('**', { throttleKbps: 10000 }); // Fast connection
      cy.reload();

      // Should load additional features
      cy.get('[data-cy="advanced-features"]').should('be.visible');
      cy.get('[data-cy="high-res-images"]').should('be.visible');
    });

    it('should handle memory constraints on mobile devices', () => {
      cy.viewport(375, 667);
      cy.visit('/dataExplorer');

      // Test large dataset handling
      cy.intercept('GET', '/api/datasets/large-dataset', {
        body: {
          data: Array.from({ length: 10000 }, (_, i) => ({
            id: i,
            value: `Row ${i}`,
            score: Math.random() * 100
          }))
        }
      }).as('largeDataset');

      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/large-dataset.csv');
      cy.wait('@largeDataset');

      // Should use virtualization
      cy.get('[data-cy="virtualized-table"]').should('be.visible');
      cy.get('[data-cy="table-row"]').should('have.length.lessThan', 50);

      // Test memory-efficient chart rendering
      cy.get('[data-cy="correlation-tab"]').click();
      cy.waitForChart('[data-cy="correlation-heatmap"]');

      // Should downsample data for mobile
      cy.get('[data-cy="data-points-info"]').should('contain', 'sampled');

      // Test cleanup on navigation
      cy.visit('/dashboard');
      cy.window().then((win) => {
        const mockWin = win as Window & {
          performance: Performance & {
            memory?: {
              usedJSHeapSize: number;
            };
          };
        };
        // Verify previous page resources cleaned up
        if (mockWin.performance.memory) {
          expect(mockWin.performance.memory.usedJSHeapSize).to.be.lessThan(50000000); // < 50MB
        }
      });
    });
  });

  describe('Orientation and Viewport Changes', () => {
    it('should handle orientation changes gracefully', () => {
      // Test portrait to landscape transition
      cy.viewport(375, 667); // Portrait
      cy.visit('/dashboard');

      cy.get('[data-cy="portrait-layout"]').should('be.visible');

      // Rotate to landscape
      cy.viewport(667, 375); // Landscape
      cy.get('[data-cy="landscape-layout"]').should('be.visible');

      // Test chart adaptations
      cy.waitForChart('[data-cy="performance-trends-chart"]');
      cy.get('[data-cy="performance-trends-chart"]')
        .invoke('width')
        .should('be.greaterThan', 400);

      // Test navigation adaptations
      cy.get('[data-cy="landscape-navigation"]').should('be.visible');

      // Test tablet orientation changes
      cy.viewport(768, 1024); // Portrait tablet
      cy.get('[data-cy="tablet-portrait-layout"]').should('be.visible');

      cy.viewport(1024, 768); // Landscape tablet
      cy.get('[data-cy="tablet-landscape-layout"]').should('be.visible');
    });

    it('should maintain state during viewport changes', () => {
      cy.visit('/modelBuilder');
      cy.viewport(375, 667);

      // Setup form state
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.muiStepperNavigate('next');
      cy.muiSelectOption('form-select-target-column', 'performance_score');

      // Change to landscape
      cy.viewport(667, 375);

      // Verify state preserved
      cy.get('[data-cy="form-select-target-column"]').should('have.value', 'performance_score');
      cy.get('[data-cy="wizard-step-2"]').should('have.class', 'active');

      // Continue workflow in landscape
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-card-random-forest"]').click();

      // Rotate back to portrait
      cy.viewport(375, 667);

      // Verify continued state
      cy.get('[data-cy="algorithm-card-random-forest"]').should('have.class', 'selected');
    });

    it('should adapt UI components for different aspect ratios', () => {
      const aspectRatios = [
        { width: 375, height: 812, ratio: '19.5:9', name: 'iPhone X' },
        { width: 393, height: 851, ratio: '20:9', name: 'Pixel 6' },
        { width: 360, height: 640, ratio: '16:9', name: 'Standard' },
        { width: 320, height: 568, ratio: '16:9', name: 'iPhone SE' }
      ];

      aspectRatios.forEach(device => {
        cy.viewport(device.width, device.height);
        cy.visit('/dataExplorer');
        cy.log(`Testing ${device.name} (${device.ratio})`);

        // Test content adaptation
        cy.get('[data-cy="main-content"]').should('be.visible');
        cy.get('[data-cy="main-content"]').should('not.have.css', 'overflow', 'hidden');

        // Test safe area handling
        if (device.ratio === '19.5:9') {
          cy.get('[data-cy="safe-area-top"]').should('exist');
          cy.get('[data-cy="safe-area-bottom"]').should('exist');
        }

        // Test bottom navigation adaptation
        cy.get('[data-cy="bottom-navigation"]').should('be.visible');
        cy.get('[data-cy="bottom-navigation"]')
          .should('have.css', 'position', 'fixed')
          .and('have.css', 'bottom', '0px');
      });
    });
  });
});
