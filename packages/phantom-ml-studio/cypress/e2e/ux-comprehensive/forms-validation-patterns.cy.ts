/// <reference types="cypress" />

/**
 * UX Test Suite: Forms & Validation Patterns
 * Complex form interactions, validation feedback, and error recovery
 */

describe('UX: Forms & Validation Patterns', () => {
  beforeEach(() => {
    cy.setupTestEnvironment('ml-models');
  });

  describe('Complex Form Validation', () => {
    beforeEach(() => {
      cy.visit('/model-builder');
    });

    it('should provide comprehensive form validation feedback', () => {
      // Test initial form state
      cy.get('[data-cy="model-creation-form"]').should('be.visible');

      // Test required field validation
      cy.muiClickButton('btn-start-training');
      cy.get('[data-cy="validation-error-dataset"]').should('be.visible');
      cy.get('[data-cy="validation-error-dataset"]').should('contain', 'Dataset is required');

      // Test file upload validation
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

      cy.get('[data-cy="file-validation-error"]').should('be.visible');
      cy.get('[data-cy="file-validation-error"]').should('contain', 'Only CSV files are supported');

      // Test real-time validation
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.get('[data-cy="validation-success-dataset"]').should('be.visible');
      cy.get('[data-cy="validation-error-dataset"]').should('not.exist');

      // Test target column validation
      cy.muiStepperNavigate('next');
      cy.muiStepperNavigate('next'); // Skip to algorithm selection without target
      cy.get('[data-cy="validation-error-target"]').should('be.visible');

      cy.muiStepperNavigate('back');
      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.get('[data-cy="validation-success-target"]').should('be.visible');

      // Test algorithm selection validation
      cy.muiStepperNavigate('next');
      cy.muiStepperNavigate('next'); // Skip to config without algorithm
      cy.get('[data-cy="validation-error-algorithm"]').should('be.visible');

      cy.muiStepperNavigate('back');
      cy.get('[data-cy="algorithm-card-random-forest"]').click();
      cy.get('[data-cy="validation-success-algorithm"]').should('be.visible');
    });

    it('should handle cross-field validation rules', () => {
      // Setup form with data
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.muiStepperNavigate('next');
      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-card-random-forest"]').click();
      cy.muiStepperNavigate('next');

      // Test parameter interdependencies
      cy.muiInteractWithSlider('max_depth', 1);
      cy.muiInteractWithSlider('min_samples_split', 50);

      cy.get('[data-cy="cross-validation-warning"]').should('be.visible');
      cy.get('[data-cy="cross-validation-warning"]').should('contain', 'may cause overfitting');

      // Test training/validation split validation
      cy.muiInteractWithSlider('train_split', 0.95);
      cy.get('[data-cy="split-warning"]').should('be.visible');
      cy.get('[data-cy="split-warning"]').should('contain', 'validation set too small');

      // Test memory usage validation
      cy.muiInteractWithSlider('n_estimators', 1000);
      cy.muiInteractWithSlider('max_depth', 20);
      cy.get('[data-cy="resource-warning"]').should('be.visible');
      cy.get('[data-cy="estimated-memory"]').should('match', /\d+\s*(MB|GB)/);
    });

    it('should provide accessibility-compliant validation', () => {
      // Test ARIA attributes for validation
      cy.muiClickButton('btn-start-training');

      cy.get('[data-cy="form-upload-dropzone"]')
        .should('have.attr', 'aria-invalid', 'true')
        .and('have.attr', 'aria-describedby');

      // Test screen reader announcements
      cy.get('[data-cy="validation-error-dataset"]')
        .should('have.attr', 'role', 'alert')
        .and('have.attr', 'aria-live', 'polite');

      // Test keyboard navigation to validation errors
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'form-upload-dropzone');

      // Test validation message association
      const errorId = 'validation-error-dataset';
      cy.get('[data-cy="form-upload-dropzone"]')
        .invoke('attr', 'aria-describedby')
        .should('contain', errorId);

      // Test validation state color contrast
      cy.get('[data-cy="validation-error-dataset"]')
        .should('have.css', 'color')
        .and('not.equal', 'rgb(0, 0, 0)'); // Should have proper error color
    });
  });

  describe('Multi-step Form Navigation', () => {
    beforeEach(() => {
      cy.visit('/experiments/create');
    });

    it('should manage multi-step form state effectively', () => {
      // Test initial state
      cy.get('[data-cy="experiment-wizard"]').should('be.visible');
      cy.get('[data-cy="step-1-basic-info"]').should('have.class', 'active');

      // Step 1: Basic Information
      cy.muiTypeInTextField('experiment-name', 'Test Experiment');
      cy.muiTypeInTextField('experiment-description', 'Testing multi-step form');
      cy.muiSelectOption('experiment-type', 'A/B Testing');

      // Test step validation before proceeding
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="step-2-configuration"]').should('have.class', 'active');

      // Step 2: Configuration
      cy.muiSelectOption('baseline-model', 'Model A');
      cy.muiSelectOption('variant-model', 'Model B');
      cy.muiInteractWithSlider('traffic-split', 70);

      // Test data persistence across steps
      cy.muiStepperNavigate('back');
      cy.get('[data-cy="experiment-name"]').should('have.value', 'Test Experiment');

      cy.muiStepperNavigate('next');
      cy.get('[data-cy="baseline-model"]').should('have.value', 'Model A');

      // Step 3: Metrics Selection
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="step-3-metrics"]').should('have.class', 'active');

      cy.muiSelectChip('primary-metrics', 'accuracy');
      cy.muiSelectChip('secondary-metrics', 'precision');
      cy.muiSelectChip('secondary-metrics', 'recall');

      // Step 4: Review
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="step-4-review"]').should('have.class', 'active');

      // Test form summary display
      cy.get('[data-cy="review-experiment-name"]').should('contain', 'Test Experiment');
      cy.get('[data-cy="review-baseline-model"]').should('contain', 'Model A');
      cy.get('[data-cy="review-traffic-split"]').should('contain', '70%');
    });

    it('should handle form state persistence and recovery', () => {
      // Fill partial form
      cy.muiTypeInTextField('experiment-name', 'Persistent Experiment');
      cy.muiTypeInTextField('experiment-description', 'Testing persistence');
      cy.muiStepperNavigate('next');

      cy.muiSelectOption('baseline-model', 'Model A');

      // Test browser refresh persistence
      cy.reload();

      // Verify state restored
      cy.get('[data-cy="experiment-name"]').should('have.value', 'Persistent Experiment');
      cy.get('[data-cy="step-2-configuration"]').should('have.class', 'active');
      cy.get('[data-cy="baseline-model"]').should('have.value', 'Model A');

      // Test session timeout handling
      cy.intercept('POST', '/api/experiments/save-draft', {
        statusCode: 401,
        body: { error: 'Session expired' }
      }).as('sessionExpired');

      cy.muiTypeInTextField('experiment-description', 'Updated description');
      cy.wait('@sessionExpired');

      cy.get('[data-cy="session-expired-modal"]').should('be.visible');
      cy.get('[data-cy="restore-session"]').click();

      // Verify form state preserved after re-authentication
      cy.get('[data-cy="experiment-name"]').should('have.value', 'Persistent Experiment');
    });

    it('should provide intuitive navigation controls', () => {
      // Test step navigation
      cy.get('[data-cy="step-indicator-1"]').should('have.class', 'active');
      cy.get('[data-cy="step-indicator-2"]').should('have.class', 'disabled');

      // Fill current step to enable next
      cy.muiTypeInTextField('experiment-name', 'Navigation Test');
      cy.muiSelectOption('experiment-type', 'A/B Testing');

      // Test next button
      cy.get('[data-cy="btn-next"]').should('not.be.disabled');
      cy.muiStepperNavigate('next');

      // Test back button
      cy.get('[data-cy="btn-back"]').should('not.be.disabled');
      cy.muiStepperNavigate('back');

      // Test direct step navigation (when allowed)
      cy.muiStepperNavigate('step', 2);
      cy.get('[data-cy="step-2-configuration"]').should('have.class', 'active');

      // Test progress indicator
      cy.get('[data-cy="progress-bar"]').should('have.attr', 'aria-valuenow', '50');

      // Test breadcrumb navigation
      cy.get('[data-cy="breadcrumb-step-1"]').click();
      cy.get('[data-cy="step-1-basic-info"]').should('have.class', 'active');
    });
  });

  describe('Advanced Input Components', () => {
    beforeEach(() => {
      cy.visit('/settings/model-configuration');
    });

    it('should handle sophisticated input component interactions', () => {
      // Test autocomplete with large datasets
      cy.get('[data-cy="model-selector-autocomplete"]').click();
      cy.get('[data-cy="autocomplete-dropdown"]').should('be.visible');

      // Test search functionality
      cy.muiTypeInTextField('model-selector-autocomplete', 'Random');
      cy.get('[data-cy="autocomplete-option"]').should('contain', 'Random Forest');
      cy.get('[data-cy="autocomplete-option"]').should('have.length.lessThan', 10);

      // Test keyboard navigation in autocomplete
      cy.get('[data-cy="model-selector-autocomplete"]').type('{downarrow}');
      cy.get('[data-cy="autocomplete-option-0"]').should('have.class', 'highlighted');

      cy.get('[data-cy="model-selector-autocomplete"]').type('{enter}');
      cy.get('[data-cy="model-selector-autocomplete"]').should('have.value', 'Random Forest');

      // Test custom option creation
      cy.get('[data-cy="algorithm-autocomplete"]').click();
      cy.muiTypeInTextField('algorithm-autocomplete', 'Custom Algorithm');
      cy.get('[data-cy="create-option-custom-algorithm"]').click();
      cy.get('[data-cy="algorithm-autocomplete"]').should('have.value', 'Custom Algorithm');

      // Test date/time picker functionality
      cy.get('[data-cy="schedule-date-picker"]').click();
      cy.get('[data-cy="date-picker-calendar"]').should('be.visible');

      // Navigate to next month
      cy.get('[data-cy="date-picker-next-month"]').click();
      cy.get('[data-cy="date-picker-day-15"]').click();

      cy.get('[data-cy="schedule-time-picker"]').click();
      cy.get('[data-cy="time-picker-hours"]').clear().type('14');
      cy.get('[data-cy="time-picker-minutes"]').clear().type('30');

      // Test file upload with progress tracking
      cy.get('[data-cy="config-file-upload"]').should('be.visible');
      cy.fixture('model-config.json').then(fileContent => {
        cy.get('[data-cy="config-file-input"]').selectFile({
          contents: fileContent,
          fileName: 'model-config.json',
          mimeType: 'application/json'
        });
      });

      cy.get('[data-cy="upload-progress"]').should('be.visible');
      cy.get('[data-cy="upload-success"]', { timeout: 5000 }).should('be.visible');
    });

    it('should support advanced multi-select and tagging', () => {
      // Test multi-select with chips
      cy.get('[data-cy="feature-selector"]').should('be.visible');
      cy.get('[data-cy="feature-selector"]').click();

      cy.get('[data-cy="feature-option-age"]').click();
      cy.get('[data-cy="feature-option-score"]').click();
      cy.get('[data-cy="feature-option-category"]').click();

      // Verify chips created
      cy.get('[data-cy="selected-feature-age"]').should('be.visible');
      cy.get('[data-cy="selected-feature-score"]').should('be.visible');
      cy.get('[data-cy="selected-feature-category"]').should('be.visible');

      // Test chip removal
      cy.get('[data-cy="selected-feature-age"] [data-cy="remove-chip"]').click();
      cy.get('[data-cy="selected-feature-age"]').should('not.exist');

      // Test select all/none functionality
      cy.get('[data-cy="select-all-features"]').click();
      cy.get('[data-cy="selected-feature"]').should('have.length.greaterThan', 5);

      cy.get('[data-cy="clear-all-features"]').click();
      cy.get('[data-cy="selected-feature"]').should('have.length', 0);

      // Test custom tag creation
      cy.get('[data-cy="tags-input"]').type('custom-tag{enter}');
      cy.get('[data-cy="tag-custom-tag"]').should('be.visible');

      cy.get('[data-cy="tags-input"]').type('another-tag{enter}');
      cy.get('[data-cy="tag-another-tag"]').should('be.visible');
    });

    it('should handle complex slider and range inputs', () => {
      // Test single value slider
      cy.get('[data-cy="learning-rate-slider"]').should('be.visible');
      cy.muiInteractWithSlider('learning-rate-slider', 0.01);
      cy.get('[data-cy="learning-rate-value"]').should('contain', '0.01');

      // Test range slider
      cy.get('[data-cy="epoch-range-slider"]').should('be.visible');
      cy.get('[data-cy="epoch-range-slider"] .MuiSlider-thumb').first()
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup');

      cy.get('[data-cy="epoch-min-value"]').should('not.equal', '10'); // Should have changed

      // Test logarithmic scale slider
      cy.get('[data-cy="regularization-slider"]').should('be.visible');
      cy.muiInteractWithSlider('regularization-slider', 0.001);
      cy.get('[data-cy="regularization-value"]').should('contain', '0.001');

      // Test step constraints
      cy.get('[data-cy="batch-size-slider"]').should('be.visible');
      cy.muiInteractWithSlider('batch-size-slider', 33);
      cy.get('[data-cy="batch-size-value"]').should('contain', '32'); // Should snap to step

      // Test slider with custom marks
      cy.get('[data-cy="performance-threshold-slider"]').should('be.visible');
      cy.get('[data-cy="performance-threshold-slider"] .MuiSlider-mark').should('have.length.greaterThan', 0);
    });
  });

  describe('Form Performance Optimization', () => {
    beforeEach(() => {
      cy.visit('/data-explorer/advanced-preprocessing');
    });

    it('should maintain optimal performance in complex forms', () => {
      // Test large form rendering
      const startTime = Date.now();
      cy.get('[data-cy="preprocessing-form"]').should('be.visible');
      const renderTime = Date.now() - startTime;
      expect(renderTime).to.be.lessThan(1000); // < 1 second

      // Test input debouncing
      cy.get('[data-cy="search-columns"]').should('be.visible');
      cy.muiTypeInTextField('search-columns', 'test');

      // Verify no immediate API calls (debounced)
      cy.get('[data-cy="search-results"]').should('not.exist');

      // Wait for debounce and verify search
      cy.get('[data-cy="search-results"]', { timeout: 1000 }).should('be.visible');

      // Test virtual scrolling in large selects
      cy.get('[data-cy="column-selector"]').click();
      cy.get('[data-cy="virtual-list"]').should('be.visible');

      // Scroll through large list
      cy.get('[data-cy="virtual-list"]').scrollTo('bottom');
      cy.get('[data-cy="column-option"]').should('have.length.greaterThan', 10);

      // Test form field lazy loading
      cy.get('[data-cy="advanced-options-toggle"]').click();
      cy.get('[data-cy="advanced-fields"]').should('be.visible');

      // Verify advanced fields loaded on demand
      cy.get('[data-cy="advanced-field-1"]').should('be.visible');
      cy.get('[data-cy="advanced-field-10"]').should('be.visible');
    });

    it('should handle smooth scrolling in long forms', () => {
      // Test form sections navigation
      cy.get('[data-cy="form-section-data-cleaning"]').should('be.visible');
      cy.get('[data-cy="goto-feature-engineering"]').click();

      // Verify smooth scroll to section
      cy.get('[data-cy="form-section-feature-engineering"]').should('be.visible');
      cy.window().its('scrollY').should('be.greaterThan', 500);

      // Test sticky form navigation
      cy.get('[data-cy="form-progress-nav"]').should('have.class', 'sticky');
      cy.scrollTo('bottom');
      cy.get('[data-cy="form-progress-nav"]').should('be.visible');

      // Test section completion indicators
      cy.get('[data-cy="section-indicator-data-cleaning"]').should('have.class', 'completed');
      cy.get('[data-cy="section-indicator-feature-engineering"]').should('have.class', 'active');

      // Test keyboard navigation between sections
      cy.get('[data-cy="form-section-feature-engineering"] input').first().focus();
      cy.focused().tab();
      cy.focused().tab();
      cy.focused().should('be.visible'); // Should remain in viewport
    });

    it('should optimize memory usage with large datasets', () => {
      // Test pagination in large data forms
      cy.intercept('GET', '/api/datasets/large-dataset/preview', {
        body: {
          data: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `Row ${i}` })),
          total: 10000
        }
      }).as('largeDataset');

      cy.get('[data-cy="dataset-preview-paginated"]').should('be.visible');
      cy.wait('@largeDataset');

      // Verify pagination controls
      cy.get('[data-cy="pagination-controls"]').should('be.visible');
      cy.get('[data-cy="rows-per-page"]').should('contain', '100');

      // Test lazy loading on scroll
      cy.get('[data-cy="data-table"]').scrollTo('bottom');
      cy.get('[data-cy="loading-more-rows"]').should('be.visible');

      // Test data virtualization
      cy.get('[data-cy="virtualized-table"]').should('be.visible');
      cy.get('[data-cy="table-row"]').should('have.length.lessThan', 50); // Only visible rows rendered
    });
  });

  describe('Form Error Recovery', () => {
    beforeEach(() => {
      cy.visit('/models/create-custom');
    });

    it('should enable graceful recovery from form errors', () => {
      // Test network failure handling
      cy.intercept('POST', '/api/models/validate', {
        statusCode: 500,
        delay: 100
      }).as('validationError');

      cy.muiTypeInTextField('model-name', 'Test Model');
      cy.muiClickButton('validate-model-name');

      cy.wait('@validationError');
      cy.get('[data-cy="network-error-toast"]').should('be.visible');
      cy.get('[data-cy="retry-validation"]').should('be.visible');

      // Test automatic retry
      cy.intercept('POST', '/api/models/validate', {
        body: { valid: true }
      });

      cy.get('[data-cy="retry-validation"]').click();
      cy.get('[data-cy="validation-success"]').should('be.visible');

      // Test session timeout recovery
      cy.intercept('POST', '/api/models/save', {
        statusCode: 401,
        body: { error: 'Session expired' }
      }).as('sessionTimeout');

      cy.muiClickButton('save-model');
      cy.wait('@sessionTimeout');

      cy.get('[data-cy="session-timeout-modal"]').should('be.visible');
      cy.get('[data-cy="extend-session"]').click();

      // Verify form data preserved
      cy.get('[data-cy="model-name"]').should('have.value', 'Test Model');

      // Test data loss prevention
      cy.get('[data-cy="unsaved-changes-indicator"]').should('be.visible');

      // Try to navigate away
      cy.visit('/dashboard');
      cy.get('[data-cy="unsaved-changes-modal"]').should('be.visible');
      cy.get('[data-cy="save-and-continue"]').click();

      // Should save and then navigate
      cy.url().should('include', '/dashboard');
    });

    it('should handle validation errors with helpful guidance', () => {
      // Test field-level validation errors
      cy.muiTypeInTextField('model-name', '');
      cy.get('[data-cy="model-name"]').blur();

      cy.get('[data-cy="error-model-name"]').should('be.visible');
      cy.get('[data-cy="error-model-name"]').should('contain', 'required');

      // Test format validation
      cy.muiTypeInTextField('model-name', 'invalid name!@#');
      cy.get('[data-cy="error-model-name"]').should('contain', 'alphanumeric');

      // Test validation suggestions
      cy.get('[data-cy="suggestion-fix-name"]').should('be.visible');
      cy.get('[data-cy="suggestion-fix-name"]').click();

      cy.get('[data-cy="model-name"]').should('have.value', 'invalid_name');
      cy.get('[data-cy="error-model-name"]').should('not.exist');

      // Test bulk validation
      cy.muiClickButton('validate-all-fields');
      cy.get('[data-cy="validation-summary"]').should('be.visible');
      cy.get('[data-cy="errors-count"]').should('match', /\d+ errors?/);

      // Test guided error fixing
      cy.get('[data-cy="fix-errors-guided"]').click();
      cy.get('[data-cy="error-fixing-wizard"]').should('be.visible');

      cy.get('[data-cy="next-error"]').click();
      cy.focused().should('have.attr', 'data-cy').and('contain', 'error');
    });

    it('should provide comprehensive error state management', () => {
      // Test form-level error handling
      cy.intercept('POST', '/api/models/create', {
        statusCode: 422,
        body: {
          errors: {
            model_name: ['Name already exists'],
            parameters: ['Invalid parameter combination'],
            dataset: ['Dataset not found']
          }
        }
      }).as('formErrors');

      cy.muiTypeInTextField('model-name', 'Existing Model');
      cy.muiClickButton('create-model');

      cy.wait('@formErrors');

      // Verify error display
      cy.get('[data-cy="form-errors-summary"]').should('be.visible');
      cy.get('[data-cy="error-count"]').should('contain', '3');

      // Test error navigation
      cy.get('[data-cy="error-item-model-name"]').click();
      cy.focused().should('have.attr', 'data-cy', 'model-name');

      // Test bulk error resolution
      cy.get('[data-cy="resolve-all-errors"]').click();
      cy.get('[data-cy="error-resolution-wizard"]').should('be.visible');

      // Test error state persistence
      cy.reload();
      cy.get('[data-cy="form-errors-summary"]').should('be.visible');
      cy.get('[data-cy="restore-form-state"]').click();

      cy.get('[data-cy="model-name"]').should('have.value', 'Existing Model');
    });
  });

  describe('Responsive Form Design', () => {
    it('should provide optimal mobile form experience', () => {
      cy.viewport(375, 667);
      cy.visit('/experiments/create');

      // Test mobile form layout
      cy.get('[data-cy="mobile-form-container"]').should('be.visible');
      cy.get('[data-cy="mobile-step-indicator"]').should('be.visible');

      // Test mobile input optimization
      cy.get('[data-cy="experiment-name"]').should('have.attr', 'autocapitalize', 'words');
      cy.get('[data-cy="experiment-name"]').should('have.attr', 'inputmode', 'text');

      // Test mobile-specific controls
      cy.get('[data-cy="mobile-date-picker"]').click();
      cy.get('[data-cy="native-date-picker"]').should('be.visible');

      // Test touch-optimized interactions
      cy.get('[data-cy="mobile-slider"]').should('be.visible');
      cy.get('[data-cy="mobile-slider"] .MuiSlider-thumb')
        .trigger('touchstart', { touches: [{ clientX: 100, clientY: 50 }] })
        .trigger('touchmove', { touches: [{ clientX: 150, clientY: 50 }] })
        .trigger('touchend');

      // Test mobile keyboard optimization
      cy.get('[data-cy="numeric-input"]').should('have.attr', 'inputmode', 'decimal');
      cy.get('[data-cy="email-input"]').should('have.attr', 'inputmode', 'email');

      // Test swipe navigation
      cy.get('[data-cy="form-section"]').trigger('swipeleft');
      cy.get('[data-cy="next-section-hint"]').should('be.visible');
    });

    it('should adapt form layout for tablet devices', () => {
      cy.viewport(768, 1024);
      cy.visit('/model-builder');

      // Test tablet form layout
      cy.get('[data-cy="tablet-form-layout"]').should('be.visible');
      cy.get('[data-cy="two-column-layout"]').should('be.visible');

      // Test adaptive input sizing
      cy.get('[data-cy="form-field"]').should('have.css', 'width').and('match', /\d+px/);

      // Test tablet-specific navigation
      cy.get('[data-cy="tablet-stepper"]').should('be.visible');
      cy.get('[data-cy="step-navigation-sidebar"]').should('be.visible');

      // Test touch and mouse compatibility
      cy.get('[data-cy="algorithm-card-random-forest"]')
        .trigger('touchstart')
        .trigger('click');

      cy.get('[data-cy="algorithm-card-random-forest"]').should('have.class', 'selected');
    });
  });
});