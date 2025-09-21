/// <reference types="cypress" />

/**
 * UX Test Suite: Model Builder & Training Workflow
 * Model creation, algorithm selection, training process, and results analysis
 */

describe('UX: Model Builder & Training Workflow', () => {
  beforeEach(() => {
    cy.setupTestEnvironment('ml-models');
    cy.visit('/modelBuilder');
  });

  describe('Model Creation Wizard', () => {
    it('should guide users through complete model creation', () => {
      // Test initial wizard state
      cy.get('[data-cy="model-wizard"]').should('be.visible');
      cy.get('[data-cy="wizard-step-1"]').should('have.class', 'active');
      cy.get('[data-cy="step-indicator"]').should('contain', 'Step 1 of 4');

      // Step 1: Data Upload
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.get('[data-cy="upload-success"]', { timeout: 5000 }).should('be.visible');

      // Test data preview
      cy.get('[data-cy="data-preview"]').should('be.visible');
      cy.get('[data-cy="dataset-summary"]').should('contain', 'rows');
      cy.get('[data-cy="dataset-summary"]').should('contain', 'columns');

      cy.muiStepperNavigate('next');

      // Step 2: Target Selection
      cy.get('[data-cy="wizard-step-2"]').should('have.class', 'active');
      cy.get('[data-cy="target-column-selector"]').should('be.visible');

      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.get('[data-cy="target-preview"]').should('be.visible');
      cy.get('[data-cy="problem-type"]').should('contain', 'Regression');

      cy.muiStepperNavigate('next');

      // Step 3: Algorithm Selection
      cy.get('[data-cy="wizard-step-3"]').should('have.class', 'active');
      cy.get('[data-cy="algorithm-grid"]').should('be.visible');

      cy.get('[data-cy="algorithm-card-random-forest"]').click();
      cy.get('[data-cy="algorithm-card-random-forest"]').should('have.class', 'selected');

      // Test algorithm details
      cy.get('[data-cy="algorithm-description"]').should('be.visible');
      cy.get('[data-cy="algorithm-pros-cons"]').should('be.visible');

      cy.muiStepperNavigate('next');

      // Step 4: Configuration
      cy.get('[data-cy="wizard-step-4"]').should('have.class', 'active');
      cy.get('[data-cy="hyperparameter-config"]').should('be.visible');

      // Test parameter adjustment
      cy.muiInteractWithSlider('n_estimators', 150);
      cy.get('[data-cy="param-value-n_estimators"]').should('contain', '150');

      cy.muiSelectOption('max_depth', '15');
      cy.muiToggleSwitch('use-cross-validation', true);

      // Test training initiation
      cy.muiClickButton('btn-start-training');
      cy.get('[data-cy="training-started"]').should('be.visible');
    });

    it('should handle wizard navigation and validation', () => {
      // Test back navigation
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.muiStepperNavigate('next');
      cy.muiStepperNavigate('back');

      cy.get('[data-cy="wizard-step-1"]').should('have.class', 'active');

      // Test step validation
      cy.muiStepperNavigate('step', 2);
      cy.muiStepperNavigate('next');

      cy.get('[data-cy="validation-error"]').should('be.visible');
      cy.get('[data-cy="error-target-required"]').should('contain', 'target column');

      // Test wizard state persistence
      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.reload();

      cy.get('[data-cy="wizard-step-2"]').should('have.class', 'active');
      cy.get('[data-cy="form-select-target-column"]').should('have.value', 'performance_score');
    });

    it('should provide intelligent algorithm recommendations', () => {
      // Complete data upload and target selection
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.muiStepperNavigate('next');
      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.muiStepperNavigate('next');

      // Test algorithm recommendations
      cy.get('[data-cy="recommended-algorithms"]').should('be.visible');
      cy.get('[data-cy="recommendation-badge"]').should('have.length.greaterThan', 0);

      // Test recommendation reasoning
      cy.get('[data-cy="algorithm-card-random-forest"] [data-cy="why-recommended"]').click();
      cy.get('[data-cy="recommendation-explanation"]').should('be.visible');
      cy.get('[data-cy="recommendation-reason"]').should('contain', 'dataset size');

      // Test algorithm comparison
      cy.get('[data-cy="compare-algorithms"]').click();
      cy.get('[data-cy="algorithm-comparison-table"]').should('be.visible');
      cy.get('[data-cy="comparison-metric-accuracy"]').should('be.visible');
      cy.get('[data-cy="comparison-metric-speed"]').should('be.visible');
    });
  });

  describe('Advanced Configuration Interface', () => {
    beforeEach(() => {
      // Setup wizard to configuration step
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.muiStepperNavigate('next');
      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-card-random-forest"]').click();
      cy.muiStepperNavigate('next');
    });

    it('should enable comprehensive hyperparameter tuning', () => {
      // Test basic parameter adjustment
      cy.get('[data-cy="hyperparameter-config"]').should('be.visible');

      // Test slider parameters
      cy.muiInteractWithSlider('n_estimators', 200);
      cy.get('[data-cy="param-value-n_estimators"]').should('contain', '200');

      cy.muiInteractWithSlider('max_depth', 12);
      cy.get('[data-cy="param-value-max_depth"]').should('contain', '12');

      // Test dropdown parameters
      cy.muiSelectOption('criterion', 'entropy');
      cy.muiSelectOption('min_samples_split', '5');

      // Test advanced options
      cy.get('[data-cy="advanced-options-toggle"]').click();
      cy.get('[data-cy="advanced-params"]').should('be.visible');

      cy.muiToggleSwitch('bootstrap', false);
      cy.muiSelectOption('random_state', '42');

      // Test parameter validation
      cy.get('[data-cy="param-input-max_features"]').clear().type('-1');
      cy.get('[data-cy="param-error-max_features"]').should('be.visible');
      cy.get('[data-cy="param-error-max_features"]').should('contain', 'must be positive');
    });

    it('should provide automated hyperparameter optimization', () => {
      // Enable auto-tuning
      cy.get('[data-cy="enable-auto-tuning"]').click();
      cy.get('[data-cy="auto-tuning-config"]').should('be.visible');

      // Configure optimization strategy
      cy.muiSelectOption('optimization-strategy', 'Bayesian');
      cy.muiInteractWithSlider('optimization-iterations', 50);
      cy.muiSelectOption('optimization-metric', 'accuracy');

      // Test parameter ranges
      cy.get('[data-cy="param-range-n_estimators"]').should('be.visible');
      cy.get('[data-cy="range-min-n_estimators"]').clear().type('50');
      cy.get('[data-cy="range-max-n_estimators"]').clear().type('500');

      cy.get('[data-cy="param-range-max_depth"]').should('be.visible');
      cy.get('[data-cy="range-min-max_depth"]').clear().type('3');
      cy.get('[data-cy="range-max-max_depth"]').clear().type('20');

      // Test optimization preview
      cy.get('[data-cy="optimization-preview"]').should('be.visible');
      cy.get('[data-cy="estimated-runtime"]').should('match', /\d+\s*minutes/);
      cy.get('[data-cy="search-space-size"]').should('match', /\d+\s*combinations/);
    });

    it('should manage feature engineering and selection', () => {
      // Open feature engineering panel
      cy.get('[data-cy="feature-engineering-tab"]').click();
      cy.get('[data-cy="feature-list"]').should('be.visible');

      // Test feature selection
      cy.get('[data-cy="feature-age"]').should('have.class', 'selected');
      cy.get('[data-cy="feature-age"]').click();
      cy.get('[data-cy="feature-age"]').should('not.have.class', 'selected');

      // Test automatic feature selection
      cy.get('[data-cy="auto-feature-selection"]').click();
      cy.muiSelectOption('selection-method', 'Recursive Feature Elimination');
      cy.muiInteractWithSlider('num-features', 5);
      cy.muiClickButton('apply-selection');

      cy.get('[data-cy="selected-features-count"]').should('contain', '5');

      // Test feature importance preview
      cy.get('[data-cy="feature-importance-preview"]').should('be.visible');
      cy.waitForChart('[data-cy="importance-chart"]');

      // Test feature transformation
      cy.get('[data-cy="feature-transformations"]').should('be.visible');
      cy.get('[data-cy="transform-age"]').click();
      cy.muiSelectOption('transformation-type', 'Log Transform');
      cy.muiClickButton('apply-transformation');

      cy.get('[data-cy="transformation-indicator-age"]').should('be.visible');
    });
  });

  describe('Training Process Management', () => {
    beforeEach(() => {
      // Complete wizard setup
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.muiStepperNavigate('next');
      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-card-random-forest"]').click();
      cy.muiStepperNavigate('next');
    });

    it('should manage model training lifecycle effectively', () => {
      // Start training
      cy.muiClickButton('btn-start-training');

      // Test training initiation
      cy.get('[data-cy="training-started"]').should('be.visible');
      cy.get('[data-cy="training-progress-container"]').should('be.visible');

      // Test progress monitoring
      cy.get('[data-cy="progress-bar"]').should('be.visible');
      cy.get('[data-cy="progress-percentage"]').should('match', /\d+%/);
      cy.get('[data-cy="current-status"]').should('not.be.empty');

      // Test real-time updates
      cy.get('[data-cy="training-metrics"]').should('be.visible');
      cy.get('[data-cy="current-epoch"]').should('match', /Epoch \d+/);
      cy.get('[data-cy="current-loss"]').should('match', /Loss: \d+\.\d+/);

      // Test training logs
      cy.get('[data-cy="training-logs-toggle"]').click();
      cy.get('[data-cy="training-logs"]').should('be.visible');
      cy.get('[data-cy="log-entry"]').should('have.length.greaterThan', 0);

      // Test cancel training
      cy.get('[data-cy="cancel-training"]').should('be.visible');
      cy.get('[data-cy="pause-training"]').should('be.visible');
    });

    it('should display real-time training metrics and visualization', () => {
      cy.muiClickButton('btn-start-training');

      // Test metrics dashboard during training
      cy.get('[data-cy="training-metrics-dashboard"]').should('be.visible');

      // Test loss visualization
      cy.waitForChart('[data-cy="loss-chart"]');
      cy.get('[data-cy="loss-chart"] .recharts-line').should('exist');

      // Test accuracy evolution
      cy.waitForChart('[data-cy="accuracy-chart"]');
      cy.interactWithChart('accuracy-chart', 'hover', { x: 100, y: 50 });
      cy.verifyChartTooltip('Accuracy:');

      // Test validation metrics
      cy.get('[data-cy="validation-metrics"]').should('be.visible');
      cy.get('[data-cy="val-accuracy"]').should('match', /\d+\.\d+%/);
      cy.get('[data-cy="val-loss"]').should('match', /\d+\.\d+/);

      // Test overfitting detection
      cy.get('[data-cy="overfitting-indicator"]').should('be.visible');
      cy.get('[data-cy="early-stopping-info"]').should('be.visible');

      // Test resource utilization
      cy.get('[data-cy="resource-usage"]').should('be.visible');
      cy.get('[data-cy="cpu-usage"]').should('match', /\d+%/);
      cy.get('[data-cy="memory-usage"]').should('match', /\d+(\.\d+)?\s*(MB|GB)/);
    });

    it('should handle training completion and results', () => {
      // Mock training completion
      cy.intercept('GET', '/api/models/*/training-status', {
        body: {
          status: 'completed',
          progress: 100,
          results: {
            accuracy: 0.924,
            precision: 0.889,
            recall: 0.945,
            f1Score: 0.916
          }
        }
      });

      cy.muiClickButton('btn-start-training');

      // Wait for completion
      cy.get('[data-cy="training-complete"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="completion-animation"]').should('be.visible');

      // Test results summary
      cy.get('[data-cy="training-results"]').should('be.visible');
      cy.get('[data-cy="final-accuracy"]').should('contain', '92.4%');
      cy.get('[data-cy="final-precision"]').should('contain', '88.9%');

      // Test model save options
      cy.get('[data-cy="save-model-section"]').should('be.visible');
      cy.muiTypeInTextField('model-name', 'Test Model v1');
      cy.muiTypeInTextField('model-description', 'Test model for validation');
      cy.muiClickButton('save-model');

      cy.get('[data-cy="model-saved"]').should('be.visible');
      cy.get('[data-cy="model-id"]').should('not.be.empty');
    });
  });

  describe('Model Evaluation and Comparison', () => {
    beforeEach(() => {
      // Setup with completed training
      cy.intercept('GET', '/api/models/training-status', {
        body: { status: 'completed', progress: 100 }
      });
      cy.visit('/model-builder/results/123');
    });

    it('should enable effective model performance comparison', () => {
      // Test model metrics dashboard
      cy.get('[data-cy="model-metrics"]').should('be.visible');
      cy.get('[data-cy="metric-accuracy"]').should('be.visible');
      cy.get('[data-cy="metric-precision"]').should('be.visible');
      cy.get('[data-cy="metric-recall"]').should('be.visible');
      cy.get('[data-cy="metric-f1"]').should('be.visible');

      // Test confusion matrix
      cy.waitForChart('[data-cy="confusion-matrix"]');
      cy.get('[data-cy="confusion-matrix"] rect').should('have.length.greaterThan', 0);
      cy.interactWithChart('confusion-matrix', 'hover', { x: 50, y: 50 });
      cy.verifyChartTooltip('Predicted:');

      // Test ROC curve
      cy.get('[data-cy="evaluation-tabs"] [data-cy="roc-tab"]').click();
      cy.waitForChart('[data-cy="roc-curve"]');
      cy.get('[data-cy="auc-score"]').should('match', /AUC: \d+\.\d+/);

      // Test feature importance
      cy.get('[data-cy="evaluation-tabs"] [data-cy="feature-importance-tab"]').click();
      cy.waitForChart('[data-cy="feature-importance-chart"]');
      cy.get('[data-cy="feature-importance-table"]').should('be.visible');

      // Test model comparison
      cy.get('[data-cy="compare-models"]').click();
      cy.get('[data-cy="model-comparison-table"]').should('be.visible');
      cy.get('[data-cy="comparison-chart"]').should('be.visible');
    });

    it('should provide comprehensive error analysis', () => {
      // Test prediction analysis
      cy.get('[data-cy="evaluation-tabs"] [data-cy="predictions-tab"]').click();
      cy.get('[data-cy="predictions-table"]').should('be.visible');

      // Test error distribution
      cy.get('[data-cy="error-analysis-section"]').should('be.visible');
      cy.waitForChart('[data-cy="error-distribution"]');
      cy.waitForChart('[data-cy="residuals-plot"]');

      // Test misclassification analysis
      cy.get('[data-cy="misclassifications"]').should('be.visible');
      cy.get('[data-cy="error-patterns"]').should('be.visible');

      // Test sample inspection
      cy.get('[data-cy="sample-row-0"] [data-cy="inspect-sample"]').click();
      cy.get('[data-cy="sample-details-modal"]').should('be.visible');
      cy.get('[data-cy="prediction-explanation"]').should('be.visible');
    });

    it('should enable model validation and cross-validation analysis', () => {
      // Test cross-validation results
      cy.get('[data-cy="evaluation-tabs"] [data-cy="cv-tab"]').click();
      cy.get('[data-cy="cv-results"]').should('be.visible');

      // Test fold-by-fold analysis
      cy.waitForChart('[data-cy="cv-scores-chart"]');
      cy.get('[data-cy="cv-mean-score"]').should('match', /Mean: \d+\.\d+/);
      cy.get('[data-cy="cv-std-score"]').should('match', /Std: \d+\.\d+/);

      // Test validation curves
      cy.get('[data-cy="validation-curves"]').should('be.visible');
      cy.waitForChart('[data-cy="learning-curve"]');
      cy.waitForChart('[data-cy="validation-curve"]');

      // Test bias-variance analysis
      cy.get('[data-cy="bias-variance-section"]').should('be.visible');
      cy.get('[data-cy="bias-score"]').should('be.visible');
      cy.get('[data-cy="variance-score"]').should('be.visible');
    });
  });

  describe('Model Deployment Workflow', () => {
    beforeEach(() => {
      cy.visit('/model-builder/deploy/123');
    });

    it('should facilitate seamless model deployment', () => {
      // Test deployment configuration
      cy.get('[data-cy="deployment-config"]').should('be.visible');

      // Test environment selection
      cy.muiSelectOption('deployment-environment', 'Production');
      cy.get('[data-cy="env-requirements"]').should('be.visible');

      // Test scaling configuration
      cy.muiInteractWithSlider('min-replicas', 2);
      cy.muiInteractWithSlider('max-replicas', 10);
      cy.muiSelectOption('instance-type', 'Standard');

      // Test API configuration
      cy.get('[data-cy="api-config-section"]').should('be.visible');
      cy.muiTypeInTextField('api-endpoint', '/predict/model-123');
      cy.muiSelectOption('authentication', 'API Key');

      // Test monitoring setup
      cy.get('[data-cy="monitoring-config"]').should('be.visible');
      cy.muiToggleSwitch('enable-logging', true);
      cy.muiToggleSwitch('enable-metrics', true);
      cy.muiToggleSwitch('enable-alerts', true);

      // Test deployment initiation
      cy.muiClickButton('deploy-model');
      cy.get('[data-cy="deployment-started"]').should('be.visible');
    });

    it('should monitor deployment progress and health', () => {
      // Mock deployment in progress
      cy.intercept('GET', '/api/deployments/123/status', {
        body: {
          status: 'deploying',
          progress: 65,
          stage: 'Configuring load balancer'
        }
      });

      cy.get('[data-cy="deployment-progress"]').should('be.visible');
      cy.get('[data-cy="deployment-stage"]').should('contain', 'load balancer');

      // Test deployment logs
      cy.get('[data-cy="deployment-logs"]').should('be.visible');
      cy.get('[data-cy="log-entry"]').should('have.length.greaterThan', 0);

      // Mock deployment completion
      cy.intercept('GET', '/api/deployments/123/status', {
        body: {
          status: 'active',
          progress: 100,
          endpoint: 'https://api.example.com/predict/model-123',
          health: 'healthy'
        }
      });

      // Test completion state
      cy.get('[data-cy="deployment-complete"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="deployment-endpoint"]').should('contain', 'api.example.com');
      cy.get('[data-cy="health-status"]').should('contain', 'healthy');

      // Test API testing interface
      cy.get('[data-cy="test-api-section"]').should('be.visible');
      cy.get('[data-cy="sample-request"]').should('be.visible');
      cy.muiClickButton('test-endpoint');
      cy.get('[data-cy="api-response"]').should('be.visible');
    });

    it('should handle deployment errors and rollback', () => {
      // Mock deployment failure
      cy.intercept('GET', '/api/deployments/123/status', {
        body: {
          status: 'failed',
          progress: 45,
          error: 'Resource allocation failed',
          stage: 'Provisioning resources'
        }
      });

      cy.get('[data-cy="deployment-error"]').should('be.visible');
      cy.get('[data-cy="error-message"]').should('contain', 'Resource allocation failed');

      // Test retry deployment
      cy.get('[data-cy="retry-deployment"]').should('be.visible');
      cy.get('[data-cy="retry-deployment"]').click();

      // Test rollback option
      cy.get('[data-cy="rollback-section"]').should('be.visible');
      cy.muiSelectOption('rollback-version', 'v1.2.1');
      cy.muiClickButton('initiate-rollback');

      cy.get('[data-cy="rollback-confirmation"]').should('be.visible');
      cy.muiClickButton('confirm-rollback');
    });
  });

  describe('Responsive Model Builder', () => {
    it('should provide optimal mobile model building experience', () => {
      cy.viewport(375, 667);

      // Test mobile wizard interface
      cy.get('[data-cy="mobile-wizard"]').should('be.visible');
      cy.get('[data-cy="mobile-step-indicator"]').should('be.visible');

      // Test mobile file upload
      cy.get('[data-cy="mobile-upload-area"]').should('be.visible');
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');

      // Test mobile parameter adjustment
      cy.muiStepperNavigate('step', 4);
      cy.get('[data-cy="mobile-param-cards"]').should('be.visible');
      cy.get('[data-cy="param-card-n_estimators"]').click();
      cy.get('[data-cy="mobile-slider"]').should('be.visible');

      // Test mobile training monitoring
      cy.muiClickButton('btn-start-training');
      cy.get('[data-cy="mobile-training-dashboard"]').should('be.visible');
      cy.get('[data-cy="mobile-metrics-carousel"]').should('be.visible');

      // Test swipe navigation
      cy.get('[data-cy="metrics-card-accuracy"]').trigger('swipeleft');
      cy.get('[data-cy="metrics-card-precision"]').should('be.visible');
    });

    it('should adapt charts and visualizations for tablet', () => {
      cy.viewport(768, 1024);

      // Complete model training setup
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');
      cy.muiStepperNavigate('next');
      cy.muiSelectOption('form-select-target-column', 'performance_score');
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-card-random-forest"]').click();
      cy.muiStepperNavigate('next');
      cy.muiClickButton('btn-start-training');

      // Test tablet training interface
      cy.get('[data-cy="tablet-training-layout"]').should('be.visible');
      cy.get('[data-cy="training-charts-grid"]').should('be.visible');

      // Test touch interactions on charts
      cy.waitForChart('[data-cy="loss-chart"]');
      cy.get('[data-cy="loss-chart"]')
        .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
        .trigger('touchmove', { touches: [{ clientX: 150, clientY: 100 }] });

      cy.get('[data-cy="chart-tooltip"]').should('be.visible');
    });
  });
});