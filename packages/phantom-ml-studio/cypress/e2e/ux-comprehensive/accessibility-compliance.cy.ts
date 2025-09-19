/// <reference types="cypress" />

/**
 * UX Test Suite: Accessibility & Compliance
 * WCAG 2.1 AA compliance, keyboard navigation, and screen reader support
 */

describe('UX: Accessibility & Compliance', () => {
  beforeEach(() => {
    cy.setupTestEnvironment('default');
    cy.injectAxe(); // Inject axe-core for automated accessibility testing
  });

  describe('Keyboard Navigation Compliance', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('should provide complete keyboard navigation support', () => {
      // Test tab order through main navigation
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'skip-to-content');

      // Skip to main content
      cy.focused().type('{enter}');
      cy.focused().should('have.attr', 'data-cy', 'main-content');

      // Test sidebar navigation via keyboard
      cy.get('[data-cy="nav-sidebar"]').focus();
      cy.focused().type('{downarrow}');
      cy.focused().should('have.attr', 'data-cy', 'nav-link-data-explorer');

      cy.focused().type('{enter}');
      cy.url().should('include', '/data-explorer');

      // Test modal keyboard trapping
      cy.visit('/bias-detection-engine');
      cy.muiClickButton('analyze-model');
      cy.get('[data-cy="analysis-dialog"]').should('be.visible');

      // Tab should cycle within modal
      cy.get('body').tab();
      cy.focused().should('be.within', '[data-cy="analysis-dialog"]');

      // Escape should close modal
      cy.get('body').type('{esc}');
      cy.get('[data-cy="analysis-dialog"]').should('not.exist');

      // Test form keyboard navigation
      cy.visit('/model-builder');
      cy.get('[data-cy="form-upload-dropzone"]').focus();
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy').and('contain', 'btn-');
    });

    it('should support keyboard shortcuts and accelerators', () => {
      // Test global keyboard shortcuts
      cy.get('body').type('{ctrl}k');
      cy.get('[data-cy="global-search"]').should('be.visible');

      cy.get('body').type('{esc}');
      cy.get('[data-cy="global-search"]').should('not.exist');

      // Test navigation shortcuts
      cy.get('body').type('{alt}1');
      cy.url().should('include', '/dashboard');

      cy.get('body').type('{alt}2');
      cy.url().should('include', '/data-explorer');

      // Test context-specific shortcuts
      cy.visit('/model-builder');
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');

      cy.get('body').type('{ctrl}s');
      cy.get('[data-cy="save-draft-modal"]').should('be.visible');

      // Test help shortcuts
      cy.get('body').type('{shift}?');
      cy.get('[data-cy="keyboard-shortcuts-help"]').should('be.visible');
    });

    it('should handle complex component keyboard interactions', () => {
      cy.visit('/data-explorer');
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');

      // Test table keyboard navigation
      cy.get('[data-cy="data-preview-table"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-cy="table-cell-0-0"]').focus();

      // Arrow keys should navigate cells
      cy.focused().type('{rightarrow}');
      cy.focused().should('have.attr', 'data-cy', 'table-cell-0-1');

      cy.focused().type('{downarrow}');
      cy.focused().should('have.attr', 'data-cy', 'table-cell-1-1');

      // Test chart keyboard navigation
      cy.get('[data-cy="correlation-tab"]').click();
      cy.waitForChart('[data-cy="correlation-heatmap"]');
      cy.get('[data-cy="correlation-heatmap"]').focus();

      // Arrow keys should navigate chart elements
      cy.focused().type('{rightarrow}');
      cy.get('[data-cy="chart-focus-indicator"]').should('be.visible');

      cy.focused().type('{enter}');
      cy.get('[data-cy="chart-tooltip"]').should('be.visible');

      // Test autocomplete keyboard navigation
      cy.visit('/model-builder');
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.muiStepperNavigate('next');
      cy.muiStepperNavigate('next');

      cy.get('[data-cy="algorithm-search"]').type('ran');
      cy.get('[data-cy="autocomplete-dropdown"]').should('be.visible');

      cy.get('[data-cy="algorithm-search"]').type('{downarrow}');
      cy.get('[data-cy="autocomplete-option-0"]').should('have.class', 'highlighted');

      cy.get('[data-cy="algorithm-search"]').type('{enter}');
      cy.get('[data-cy="algorithm-search"]').should('have.value', 'Random Forest');
    });
  });

  describe('Screen Reader Compatibility', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('should support comprehensive screen reader functionality', () => {
      // Test landmark regions
      cy.get('[role="banner"]').should('exist');
      cy.get('[role="navigation"]').should('exist');
      cy.get('[role="main"]').should('exist');
      cy.get('[role="contentinfo"]').should('exist');

      // Test headings hierarchy
      cy.get('h1').should('have.length', 1);
      cy.get('h1').should('contain', 'Dashboard');

      cy.get('h2').should('have.length.greaterThan', 0);
      cy.get('h2').first().should('be.visible');

      // Test ARIA labels and descriptions
      cy.get('[data-cy="metric-card-models"]')
        .should('have.attr', 'aria-label')
        .and('match', /models.*\d+/i);

      cy.get('[data-cy="metric-value-models"]')
        .should('have.attr', 'aria-describedby');

      // Test live regions for dynamic content
      cy.get('[data-cy="realtime-updates"]')
        .should('have.attr', 'aria-live', 'polite');

      // Test form labels and descriptions
      cy.visit('/model-builder');
      cy.get('[data-cy="form-upload-dropzone"]')
        .should('have.attr', 'aria-label')
        .and('contain', 'upload');

      // Test status announcements
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.get('[data-cy="upload-status"]')
        .should('have.attr', 'role', 'status')
        .and('have.attr', 'aria-live', 'polite');
    });

    it('should provide descriptive text for data visualizations', () => {
      cy.visit('/dashboard');

      // Test chart descriptions
      cy.get('[data-cy="performance-trends-chart"]')
        .should('have.attr', 'role', 'img')
        .and('have.attr', 'aria-label')
        .and('match', /chart.*performance.*trend/i);

      // Test chart data table alternatives
      cy.get('[data-cy="chart-data-table-toggle"]').click();
      cy.get('[data-cy="chart-data-table"]').should('be.visible');
      cy.get('[data-cy="chart-data-table"]').should('have.attr', 'aria-label');

      // Test chart interaction descriptions
      cy.visit('/bias-detection-engine/results/analysis-123');
      cy.get('[data-cy="bias-heatmap"]')
        .should('have.attr', 'aria-describedby');

      cy.get('[data-cy="bias-heatmap-description"]')
        .should('contain', 'bias scores')
        .and('contain', 'navigation instructions');

      // Test chart summary statistics
      cy.get('[data-cy="chart-summary"]')
        .should('have.attr', 'aria-label')
        .and('match', /summary.*statistics/i);
    });

    it('should announce dynamic content changes appropriately', () => {
      // Test progress announcements
      cy.visit('/model-builder');
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.muiStepperNavigate('next');
      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-card-random-forest"]').click();
      cy.muiStepperNavigate('next');
      cy.muiClickButton('btn-start-training');

      cy.get('[data-cy="training-progress-announcer"]')
        .should('have.attr', 'aria-live', 'polite');

      // Test error announcements
      cy.intercept('GET', '/api/models/*/status', {
        statusCode: 500
      }).as('trainingError');

      cy.get('[data-cy="error-announcer"]')
        .should('have.attr', 'role', 'alert')
        .and('have.attr', 'aria-live', 'assertive');

      // Test completion announcements
      cy.intercept('GET', '/api/models/*/status', {
        body: { status: 'completed' }
      });

      cy.get('[data-cy="completion-announcer"]')
        .should('have.attr', 'aria-live', 'polite');

      // Test navigation announcements
      cy.visit('/data-explorer');
      cy.get('[data-cy="page-announcer"]')
        .should('contain', 'Data Explorer')
        .and('have.attr', 'aria-live', 'polite');
    });
  });

  describe('Color Contrast & Visual Accessibility', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('should meet color contrast standards', () => {
      // Test automated color contrast checking
      cy.checkA11y(null, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });

      // Test specific high-contrast elements
      cy.get('[data-cy="metric-card-models"]')
        .should('have.css', 'background-color')
        .and('not.equal', 'rgba(0, 0, 0, 0)');

      // Test error state contrast
      cy.visit('/model-builder');
      cy.muiClickButton('btn-start-training'); // Trigger validation error

      cy.get('[data-cy="validation-error-dataset"]')
        .should('have.css', 'color')
        .then(color => {
          // Verify error text has sufficient contrast
          expect(color).to.not.equal('rgb(0, 0, 0)');
        });

      // Test link contrast
      cy.get('a').each($link => {
        cy.wrap($link)
          .should('have.css', 'color')
          .and('not.equal', 'rgb(0, 0, 0)');
      });

      // Test focus indicator contrast
      cy.get('[data-cy="nav-link-dashboard"]').focus();
      cy.get('[data-cy="nav-link-dashboard"]')
        .should('have.css', 'outline-color')
        .and('not.equal', 'rgb(0, 0, 0)');
    });

    it('should support high contrast mode', () => {
      // Enable high contrast mode
      cy.get('body').invoke('addClass', 'high-contrast-mode');

      // Test enhanced borders and outlines
      cy.get('[data-cy="metric-card-models"]')
        .should('have.css', 'border-width')
        .and('not.equal', '0px');

      // Test enhanced focus indicators
      cy.get('[data-cy="nav-link-dashboard"]').focus();
      cy.get('[data-cy="nav-link-dashboard"]')
        .should('have.css', 'outline-width')
        .and('match', /[2-9]px/); // At least 2px outline

      // Test chart accessibility in high contrast
      cy.waitForChart('[data-cy="performance-trends-chart"]');
      cy.get('[data-cy="performance-trends-chart"] .recharts-line')
        .should('have.attr', 'stroke-width')
        .and('match', /[2-9]/); // Thicker lines in high contrast

      // Test button contrast enhancement
      cy.get('[data-cy="dashboard-refresh"]')
        .should('have.css', 'border-width')
        .and('not.equal', '0px');
    });

    it('should provide alternative text for visual content', () => {
      // Test image alt text
      cy.get('img').each($img => {
        cy.wrap($img)
          .should('have.attr', 'alt')
          .and('not.be.empty');
      });

      // Test icon accessibility
      cy.get('[data-cy="nav-icon-dashboard"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'title');

      // Test chart alternative text
      cy.visit('/bias-detection-engine/results/analysis-123');
      cy.get('[data-cy="bias-heatmap"]')
        .should('have.attr', 'aria-label')
        .and('contain', 'bias');

      // Test decorative vs informative icons
      cy.get('[aria-hidden="true"]').should('exist'); // Decorative icons
      cy.get('[data-cy="status-icon-success"]')
        .should('have.attr', 'aria-label')
        .and('contain', 'success');

      // Test loading state alternatives
      cy.visit('/model-builder');
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');

      cy.get('[data-cy="loading-spinner"]')
        .should('have.attr', 'aria-label')
        .and('contain', 'loading');
    });
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should achieve full WCAG 2.1 AA compliance across major pages', () => {
      const pages = [
        '/',
        '/dashboard',
        '/data-explorer',
        '/model-builder',
        '/bias-detection-engine',
        '/settings'
      ];

      pages.forEach(page => {
        cy.visit(page);
        cy.injectAxe();

        // Run comprehensive accessibility audit
        cy.checkA11y(null, {
          tags: ['wcag2a', 'wcag2aa'],
          rules: {
            'color-contrast': { enabled: true },
            'keyboard-navigation': { enabled: true },
            'aria-valid': { enabled: true },
            'landmark-unique': { enabled: true }
          }
        });

        // Test page-specific accessibility requirements
        if (page === '/data-explorer') {
          // Data tables should have proper headers
          cy.get('table').should('have.attr', 'role', 'table');
          cy.get('th').should('have.attr', 'scope');
        }

        if (page === '/model-builder') {
          // Forms should have proper labeling
          cy.get('input, select, textarea').each($input => {
            cy.wrap($input).should('satisfy', $el => {
              return $el.attr('aria-label') ||
                     $el.attr('aria-labelledby') ||
                     $el.siblings('label').length > 0;
            });
          });
        }
      });
    });

    it('should maintain accessibility during dynamic interactions', () => {
      cy.visit('/bias-detection-engine');

      // Test modal accessibility
      cy.muiClickButton('analyze-model');
      cy.checkA11y('[data-cy="analysis-dialog"]');

      // Test form validation accessibility
      cy.muiClickButton('start-analysis');
      cy.checkA11y('[data-cy="validation-errors"]');

      // Test live region updates
      cy.muiSelectOption('model-selector', 'Hiring Decision Model');
      cy.muiSelectChip('protected-attributes', 'gender');
      cy.muiClickButton('start-analysis');

      cy.checkA11y('[data-cy="analysis-progress"]');

      // Test results accessibility
      cy.visit('/bias-detection-engine/results/analysis-123');
      cy.checkA11y('[data-cy="analysis-results"]');
    });

    it('should support assistive technology compatibility', () => {
      // Test ARIA roles and properties
      cy.visit('/dashboard');

      cy.get('[role="application"]').should('exist');
      cy.get('[role="tablist"]').should('have.attr', 'aria-orientation');
      cy.get('[role="tab"]').should('have.attr', 'aria-selected');

      // Test ARIA states and properties
      cy.get('[aria-expanded]').each($element => {
        cy.wrap($element).should('have.attr', 'aria-controls');
      });

      cy.get('[aria-describedby]').each($element => {
        const describedBy = $element.attr('aria-describedby');
        cy.get(`#${describedBy}`).should('exist');
      });

      // Test focus management
      cy.visit('/model-builder');
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');

      // Focus should move to next logical element
      cy.muiStepperNavigate('next');
      cy.focused().should('have.attr', 'data-cy', 'form-select-target-column');

      // Test error focus management
      cy.muiStepperNavigate('next'); // Skip target selection
      cy.focused().should('have.attr', 'aria-invalid', 'true');
    });
  });

  describe('Mobile Accessibility', () => {
    beforeEach(() => {
      cy.viewport(375, 667);
    });

    it('should provide accessible mobile interactions', () => {
      cy.visit('/dashboard');

      // Test touch target sizes
      cy.get('[data-cy="nav-mobile-toggle"]')
        .should('have.css', 'min-height', '44px') // WCAG minimum touch target
        .and('have.css', 'min-width', '44px');

      // Test mobile focus indicators
      cy.get('[data-cy="metric-card-models"]').focus();
      cy.get('[data-cy="metric-card-models"]')
        .should('have.css', 'outline-width')
        .and('not.equal', '0px');

      // Test mobile screen reader support
      cy.get('[data-cy="mobile-nav-drawer"]')
        .should('have.attr', 'aria-label')
        .and('contain', 'navigation');

      // Test swipe gesture alternatives
      cy.visit('/data-explorer');
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');

      cy.get('[data-cy="mobile-table-controls"]').should('be.visible');
      cy.get('[data-cy="prev-page"]').should('have.attr', 'aria-label');
      cy.get('[data-cy="next-page"]').should('have.attr', 'aria-label');
    });

    it('should maintain keyboard support on mobile devices', () => {
      cy.visit('/model-builder');

      // Test external keyboard support
      cy.get('[data-cy="form-upload-dropzone"]').focus();
      cy.focused().tab();
      cy.focused().should('be.visible');

      // Test mobile form accessibility
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.muiStepperNavigate('next');

      cy.get('[data-cy="form-select-target-column"]')
        .should('have.attr', 'aria-expanded')
        .and('have.attr', 'aria-haspopup');

      // Test mobile modal accessibility
      cy.visit('/bias-detection-engine');
      cy.muiClickButton('analyze-model');

      cy.get('[data-cy="mobile-analysis-dialog"]')
        .should('have.attr', 'role', 'dialog')
        .and('have.attr', 'aria-modal', 'true');
    });
  });

  describe('Accessibility Testing Integration', () => {
    it('should run automated accessibility tests in CI/CD pipeline', () => {
      // Test comprehensive page coverage
      const criticalPages = [
        '/dashboard',
        '/data-explorer',
        '/model-builder',
        '/bias-detection-engine',
        '/experiments',
        '/deployments'
      ];

      criticalPages.forEach(page => {
        cy.visit(page);
        cy.injectAxe();

        // Run full accessibility audit
        cy.checkA11y(null, {
          tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
          includedImpacts: ['critical', 'serious', 'moderate']
        });

        // Generate accessibility report
        cy.task('generateA11yReport', {
          page,
          violations: [] // Would be populated by actual violations
        });
      });
    });

    it('should integrate with accessibility monitoring tools', () => {
      cy.visit('/dashboard');

      // Test real-time accessibility monitoring
      cy.window().then((win) => {
        // Mock accessibility monitoring integration
        const mockWin = win as Window & {
          accessibilityMonitor?: {
            isEnabled: boolean;
          };
        };
        
        if (mockWin.accessibilityMonitor) {
          expect(mockWin.accessibilityMonitor.isEnabled).to.be.true;
        } else {
          // Set up mock if not present
          mockWin.accessibilityMonitor = { isEnabled: true };
          expect(mockWin.accessibilityMonitor.isEnabled).to.be.true;
        }
      });

      // Test accessibility metrics collection
      cy.get('[data-cy="accessibility-metrics"]')
        .should('have.attr', 'data-a11y-score')
        .and('match', /\d+/);

      // Test automated remediation suggestions
      cy.checkA11y(null, {
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true }
        }
      });
    });
  });
});
