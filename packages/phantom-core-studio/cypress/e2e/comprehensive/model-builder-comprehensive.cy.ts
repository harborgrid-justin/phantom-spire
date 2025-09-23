/// <reference types="cypress" />

import { ModelBuilderPage } from '../../support/page-objects/ModelBuilderPage';

describe('Model Builder - Comprehensive Test Suite', () => {
  let modelBuilderPage: ModelBuilderPage;

  beforeEach(() => {
    modelBuilderPage = new ModelBuilderPage();
    cy.setupTestEnvironment('ml-models');

    // Mock model training API
    cy.intercept('POST', '/api/models/train', {
      statusCode: 202,
      body: { jobId: 'training_job_001', status: 'started' }
    }).as('startTraining');

    cy.intercept('GET', '/api/models/training_job_001/status', {
      statusCode: 200,
      body: { status: 'completed', progress: 100 }
    }).as('trainingStatus');

    // Mock algorithm configurations
    cy.intercept('GET', '/api/algorithms/*/config', {
      fixture: 'algorithm-configs.json'
    }).as('getAlgorithmConfig');
  });

  describe('Core Model Building Workflow', () => {
    it('should complete full model building process', () => {
      cy.logTestStep('Testing complete model building workflow');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .performCompleteModelBuildingWorkflow(
          'Customer Churn Predictor v2',
          'customer_dataset_001',
          'churn_probability',
          'random-forest',
          ['age', 'tenure', 'monthly_charges', 'total_charges', 'contract_type']
        );

      // Verify model was created successfully
      cy.get('[data-cy="model-created-notification"]').should('be.visible');
      cy.get('[data-cy="model-id"]').should('exist');
    });

    it('should handle different algorithm types correctly', () => {
      cy.logTestStep('Testing multiple algorithm types');

      const algorithms = [
        { name: 'random-forest', features: 10 },
        { name: 'neural-network', features: 15 },
        { name: 'linear-regression', features: 5 },
        { name: 'svm', features: 8 }
      ];

      algorithms.forEach((algo, index) => {
        modelBuilderPage
          .visit()
          .waitForPageLoad()
          .createNewModel(`Model_${index + 1}`, algo.name);

        // Verify algorithm-specific configuration panel
        cy.get(`[data-cy="${algo.name}-config-panel"]`).should('be.visible');

        // Test algorithm-specific hyperparameters
        if (algo.name === 'random-forest') {
          cy.get('[data-cy="hyperparam-n_estimators"]').should('be.visible');
          cy.get('[data-cy="hyperparam-max_depth"]').should('be.visible');
        } else if (algo.name === 'neural-network') {
          cy.get('[data-cy="hyperparam-hidden_layers"]').should('be.visible');
          cy.get('[data-cy="hyperparam-learning_rate"]').should('be.visible');
        }
      });
    });

    it('should validate required fields', () => {
      cy.logTestStep('Testing form validation');

      modelBuilderPage
        .visit()
        .waitForPageLoad();

      // Test required field validation
      cy.muiClickButton('create-model-button');
      cy.muiClickButton('save-model-button');

      cy.validateMuiFormField('model-name', 'invalid', 'Model name is required');

      // Test invalid model name
      cy.muiTypeInTextField('model-name', 'a'); // Too short
      cy.validateMuiFormField('model-name', 'invalid', 'Model name must be at least 3 characters');

      // Test valid model name
      cy.muiTypeInTextField('model-name', 'Valid Model Name');
      cy.validateMuiFormField('model-name', 'valid');
    });
  });

  describe('Advanced Feature Engineering', () => {
    it('should handle feature selection and engineering', () => {
      cy.logTestStep('Testing feature engineering capabilities');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Feature Engineering Test')
        .selectDataset('comprehensive_dataset');

      // Test feature selection
      const features = ['feature_1', 'feature_2', 'feature_3', 'feature_4', 'feature_5'];
      modelBuilderPage.selectFeatures(features);
      modelBuilderPage.verifyFeatureSelection(features.length);

      // Test feature transformation
      cy.get('[data-cy="feature-engineering-panel"]').should('be.visible');
      cy.get('[data-cy="add-feature-transformation"]').click();

      cy.muiSelectOption('transformation-type', 'normalize');
      cy.muiSelectOption('transformation-target', 'feature_1');
      cy.muiClickButton('apply-transformation');

      // Verify transformation was applied
      cy.get('[data-cy="applied-transformations"]').should('contain.text', 'normalize(feature_1)');

      // Test feature importance preview
      cy.get('[data-cy="preview-feature-importance"]').click();
      cy.waitForChart('[data-cy="feature-importance-preview"]');
    });

    it('should handle missing data strategies', () => {
      cy.logTestStep('Testing missing data handling');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Missing Data Test')
        .selectDataset('dataset_with_missing_values');

      // Verify missing data warning appears
      cy.get('[data-cy="missing-values-warning"]').should('be.visible');
      cy.get('[data-cy="missing-data-summary"]').should('contain.text', '15% missing values');

      // Test different missing data strategies
      modelBuilderPage.handleMissingValues('mean');
      cy.get('[data-cy="missing-values-resolved"]').should('be.visible');

      // Test custom imputation
      cy.get('[data-cy="custom-imputation"]').click();
      cy.muiSelectOption('imputation-method', 'knn');
      cy.muiTypeInTextField('knn-neighbors', '5');
      cy.muiClickButton('apply-imputation');
    });

    it('should support automated feature engineering', () => {
      cy.logTestStep('Testing automated feature engineering');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Auto Feature Engineering Test')
        .selectDataset('raw_dataset');

      // Enable automated feature engineering
      cy.get('[data-cy="auto-feature-engineering"]').check();
      cy.get('[data-cy="auto-fe-config-panel"]').should('be.visible');

      // Configure auto FE settings
      cy.muiSelectOption('auto-fe-strategy', 'comprehensive');
      cy.muiTypeInTextField('max-features', '50');
      cy.muiToggleSwitch('polynomial-features', true);
      cy.muiToggleSwitch('interaction-features', true);

      cy.muiClickButton('generate-features');
      cy.get('[data-cy="feature-generation-progress"]').should('be.visible');

      // Verify generated features
      cy.get('[data-cy="generated-features-count"]').should('contain.text', 'features generated');
      cy.get('[data-cy="feature-quality-score"]').should('be.visible');
    });
  });

  describe('Hyperparameter Optimization', () => {
    it('should perform grid search optimization', () => {
      cy.logTestStep('Testing grid search hyperparameter optimization');

      const searchSpace = {
        'n_estimators': ['50', '100', '200'],
        'max_depth': ['5', '10', '15'],
        'min_samples_split': ['2', '5', '10']
      };

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Grid Search Test', 'random-forest')
        .selectDataset('optimization_dataset')
        .performGridSearch(searchSpace);

      // Monitor optimization progress
      cy.get('[data-cy="grid-search-progress"]').should('be.visible');
      cy.get('[data-cy="combinations-tested"]').should('contain.text', '0 / 27');

      // Mock progressive updates
      cy.intercept('GET', '/api/hyperparameter-optimization/*/status', {
        statusCode: 200,
        body: {
          status: 'running',
          progress: 50,
          bestScore: 0.92,
          combinationsTested: 14,
          totalCombinations: 27
        }
      }).as('optimizationProgress');

      // Verify progress updates
      cy.get('[data-cy="best-score"]').should('contain.text', '0.92');
      cy.get('[data-cy="progress-bar"]').should('have.attr', 'aria-valuenow', '50');
    });

    it('should perform bayesian optimization', () => {
      cy.logTestStep('Testing bayesian optimization');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Bayesian Opt Test', 'neural-network')
        .selectDataset('neural_network_dataset')
        .performBayesianOptimization();

      // Verify bayesian optimization interface
      cy.get('[data-cy="bayesian-opt-panel"]').should('be.visible');
      cy.get('[data-cy="acquisition-function"]').should('contain.text', 'Expected Improvement');
      cy.get('[data-cy="optimization-history"]').should('be.visible');

      // Test optimization visualization
      cy.waitForChart('[data-cy="optimization-history-chart"]');
      cy.get('[data-cy="convergence-plot"]').should('be.visible');
    });

    it('should handle optimization failures gracefully', () => {
      cy.logTestStep('Testing optimization failure handling');

      // Mock optimization failure
      cy.intercept('POST', '/api/hyperparameter-optimization/start', {
        statusCode: 400,
        body: { error: 'Insufficient data for optimization' }
      }).as('optimizationError');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Optimization Failure Test')
        .selectDataset('small_dataset');

      cy.get('[data-cy="grid-search-button"]').click();

      // Verify error handling
      cy.get('[data-cy="optimization-error"]').should('be.visible');
      cy.get('[data-cy="error-details"]').should('contain.text', 'Insufficient data');
      cy.get('[data-cy="optimization-suggestions"]').should('be.visible');
    });
  });

  describe('AutoML Integration', () => {
    it('should complete AutoML workflow', () => {
      cy.logTestStep('Testing AutoML complete workflow');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .performAutoMLWorkflow(
          'AutoML Churn Model',
          'automl_dataset',
          'target_variable'
        );

      // Verify AutoML results
      cy.get('[data-cy="automl-leaderboard"]').should('be.visible');
      cy.get('[data-cy="best-model-card"]').should('be.visible');
      cy.get('[data-cy="model-comparison-chart"]').should('be.visible');

      // Test model selection from AutoML results
      cy.get('[data-cy="select-best-model"]').click();
      cy.get('[data-cy="model-selected-notification"]').should('be.visible');
    });

    it('should customize AutoML search space', () => {
      cy.logTestStep('Testing AutoML customization');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Custom AutoML Test')
        .enableAutoML();

      // Customize AutoML settings
      cy.get('[data-cy="automl-algorithms"]').within(() => {
        cy.get('[data-cy="algo-random-forest"]').check();
        cy.get('[data-cy="algo-neural-network"]').check();
        cy.get('[data-cy="algo-svm"]').uncheck();
      });

      cy.muiTypeInTextField('automl-time-budget', '30');
      cy.muiSelectOption('automl-metric', 'f1_score');
      cy.muiToggleSwitch('automl-ensemble', true);

      cy.get('[data-cy="start-automl"]').click();

      // Verify customized search
      cy.get('[data-cy="automl-config-summary"]').should('contain.text', '2 algorithms');
      cy.get('[data-cy="automl-config-summary"]').should('contain.text', '30 minutes');
    });
  });

  describe('Model Evaluation and Validation', () => {
    it('should generate comprehensive evaluation metrics', () => {
      cy.logTestStep('Testing comprehensive model evaluation');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Evaluation Test')
        .selectDataset('evaluation_dataset')
        .selectTargetColumn('target')
        .startTraining()
        .waitForTrainingCompletion()
        .verifyEvaluationResults();

      // Test detailed evaluation views
      modelBuilderPage
        .verifyConfusionMatrix()
        .verifyROCCurve()
        .verifyFeatureImportance();

      // Test cross-validation
      modelBuilderPage.runCrossValidation();
      cy.get('[data-cy="cv-scores"]').should('be.visible');
      cy.get('[data-cy="cv-mean-score"]').should('contain.text', '±');

      // Test prediction samples
      modelBuilderPage.generatePredictionSamples(10);
      cy.get('[data-cy="prediction-sample"]').should('have.length', 10);
    });

    it('should validate model on new data', () => {
      cy.logTestStep('Testing model validation on new data');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Validation Test')
        .selectDataset('training_dataset')
        .startTraining()
        .waitForTrainingCompletion()
        .testOnNewData('validation_dataset');

      // Verify validation results
      cy.get('[data-cy="validation-metrics"]').should('be.visible');
      cy.get('[data-cy="performance-comparison"]').should('be.visible');
      cy.get('[data-cy="distribution-shift-warning"]').then(($warning) => {
        if ($warning.length > 0) {
          cy.wrap($warning).should('contain.text', 'distribution shift detected');
        }
      });
    });

    it('should detect and handle overfitting', () => {
      cy.logTestStep('Testing overfitting detection');

      // Mock training with overfitting indicators
      cy.intercept('GET', '/api/models/*/training-history', {
        statusCode: 200,
        body: {
          epochs: Array.from({ length: 50 }, (_, i) => ({
            epoch: i + 1,
            train_loss: 0.8 - (i * 0.01), // Decreasing
            val_loss: 0.7 - (i * 0.005) + (i > 30 ? (i - 30) * 0.01 : 0), // Starts increasing after epoch 30
            train_accuracy: 0.7 + (i * 0.006),
            val_accuracy: 0.72 + (i * 0.003) - (i > 30 ? (i - 30) * 0.002 : 0)
          }))
        }
      }).as('trainingHistory');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Overfitting Test', 'neural-network')
        .selectDataset('overfitting_dataset')
        .configureEarlyStopping(10, 0.001)
        .startTraining();

      // Verify overfitting detection
      cy.get('[data-cy="overfitting-warning"]').should('be.visible');
      cy.get('[data-cy="learning-curve"]').should('be.visible');
      cy.get('[data-cy="early-stopping-triggered"]').should('contain.text', 'Early stopping at epoch');
    });
  });

  describe('Model Deployment and Versioning', () => {
    it('should save and version models correctly', () => {
      cy.logTestStep('Testing model versioning');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Versioning Test')
        .selectDataset('versioning_dataset')
        .startTraining()
        .waitForTrainingCompletion()
        .saveModel('Versioning Test', '1.0.0');

      // Create new version with different parameters
      cy.get('[data-cy="create-new-version"]').click();
      modelBuilderPage
        .configureHyperparameters({ 'n_estimators': 200 })
        .startTraining()
        .waitForTrainingCompletion()
        .saveModel('Versioning Test', '1.1.0');

      // Compare versions
      modelBuilderPage.compareModelVersions('1.0.0', '1.1.0');
      cy.get('[data-cy="version-comparison"]').should('be.visible');
      cy.get('[data-cy="performance-delta"]').should('be.visible');
    });

    it('should export models in different formats', () => {
      cy.logTestStep('Testing model export');

      const formats = ['pickle', 'onnx', 'pmml', 'joblib'];

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Export Test')
        .selectDataset('export_dataset')
        .startTraining()
        .waitForTrainingCompletion();

      formats.forEach(format => {
        modelBuilderPage.exportModel(format as any);
        cy.verifyDownload(`model.${format}`, 15000);
      });
    });
  });

  describe('Performance and Stress Testing', () => {
    it('should handle large datasets efficiently', () => {
      cy.logTestStep('Testing large dataset handling');

      // Mock large dataset
      cy.intercept('GET', '/api/datasets/large_dataset/info', {
        statusCode: 200,
        body: {
          name: 'Large Dataset',
          rows: 1000000,
          columns: 500,
          size: '2.5GB',
          memoryUsage: '12GB'
        }
      }).as('largeDatasetInfo');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Large Dataset Test')
        .selectDataset('large_dataset');

      // Verify performance warnings
      cy.get('[data-cy="large-dataset-warning"]').should('be.visible');
      cy.get('[data-cy="memory-usage-warning"]').should('contain.text', '12GB');

      // Test dataset sampling option
      cy.get('[data-cy="enable-sampling"]').check();
      cy.muiTypeInTextField('sample-size', '100000');
      cy.get('[data-cy="sampling-strategy"]').select('stratified');
    });

    it('should monitor resource usage during training', () => {
      cy.logTestStep('Testing resource monitoring');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Resource Monitor Test')
        .selectDataset('resource_test_dataset')
        .startTraining();

      // Verify resource monitoring
      modelBuilderPage.verifyResourceUsage();
      cy.get('[data-cy="cpu-usage-chart"]').should('be.visible');
      cy.get('[data-cy="memory-timeline"]').should('be.visible');

      // Test resource alerts
      cy.get('[data-cy="resource-alert"]').then(($alert) => {
        if ($alert.length > 0) {
          cy.wrap($alert).should('contain.text', 'High resource usage detected');
        }
      });
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should handle training interruptions', () => {
      cy.logTestStep('Testing training interruption handling');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Interruption Test')
        .selectDataset('interruption_dataset')
        .startTraining();

      // Simulate training interruption
      cy.intercept('GET', '/api/models/*/training-status', {
        statusCode: 500,
        body: { error: 'Training process interrupted' }
      }).as('trainingInterruption');

      cy.get('[data-cy="training-interrupted"]').should('be.visible');
      cy.get('[data-cy="resume-training"]').should('be.visible');
      cy.get('[data-cy="training-checkpoint"]').should('contain.text', 'checkpoint');

      // Test resume functionality
      cy.intercept('POST', '/api/models/*/resume-training', {
        statusCode: 200,
        body: { status: 'resumed' }
      }).as('resumeTraining');

      cy.get('[data-cy="resume-training"]').click();
      cy.get('[data-cy="training-resumed"]').should('be.visible');
    });

    it('should handle invalid dataset formats', () => {
      cy.logTestStep('Testing invalid dataset handling');

      // Mock invalid dataset
      cy.intercept('GET', '/api/datasets/invalid_dataset/validate', {
        statusCode: 400,
        body: {
          valid: false,
          errors: [
            'Missing required columns: target',
            'Invalid data types in column: age',
            'Duplicate column names detected'
          ]
        }
      }).as('invalidDataset');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Invalid Dataset Test')
        .selectDataset('invalid_dataset');

      // Verify error handling
      cy.get('[data-cy="dataset-validation-errors"]').should('be.visible');
      cy.get('[data-cy="validation-error"]').should('have.length', 3);
      cy.get('[data-cy="dataset-fix-suggestions"]').should('be.visible');

      // Test auto-fix suggestions
      cy.get('[data-cy="auto-fix-suggestion"]').first().click();
      cy.get('[data-cy="fix-applied"]').should('be.visible');
    });

    it('should validate model configuration conflicts', () => {
      cy.logTestStep('Testing configuration conflict detection');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Conflict Test', 'neural-network')
        .selectDataset('small_dataset');

      // Create conflicting configuration
      cy.muiTypeInTextField('hyperparam-batch_size', '1000'); // Too large for dataset
      cy.muiTypeInTextField('hyperparam-hidden_layers', '50'); // Too many layers

      cy.get('[data-cy="configuration-conflicts"]').should('be.visible');
      cy.get('[data-cy="conflict-warning"]').should('contain.text', 'Batch size exceeds dataset size');
      cy.get('[data-cy="auto-adjust-config"]').click();

      // Verify auto-adjustment
      cy.get('[data-cy="config-adjusted"]').should('be.visible');
      cy.get('[data-cy="hyperparam-batch_size"]').should('have.value', '100');
    });
  });
});