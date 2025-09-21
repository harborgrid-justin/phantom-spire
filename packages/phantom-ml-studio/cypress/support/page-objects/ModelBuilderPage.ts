/// <reference types="cypress" />
import { BasePage } from './BasePage';

/**
 * Model Builder Page Object Model - Comprehensive ML model creation and training interface
 */
export class ModelBuilderPage extends BasePage {
  constructor() {
    super('/modelBuilder', '[data-cy="model-builder-content"]');
  }

  // Selectors
  private readonly selectors = {
    // Model Creation
    createModelButton: '[data-cy="create-model-button"]',
    modelNameInput: '[data-cy="model-name-input"]',
    modelDescriptionInput: '[data-cy="model-description-input"]',
    algorithmSelect: '[data-cy="algorithm-select"]',
    datasetSelect: '[data-cy="dataset-select"]',
    targetColumnSelect: '[data-cy="target-column-select"]',
    featureSelectionPanel: '[data-cy="feature-selection-panel"]',
    featureCheckbox: '[data-cy^="feature-checkbox-"]',
    selectAllFeaturesButton: '[data-cy="select-all-features"]',
    deselectAllFeaturesButton: '[data-cy="deselect-all-features"]',

    // Algorithm Configuration
    algorithmConfigPanel: '[data-cy="algorithm-config-panel"]',
    hyperparameterInputs: '[data-cy^="hyperparam-"]',
    crossValidationFolds: '[data-cy="cv-folds-input"]',
    testSplitRatio: '[data-cy="test-split-ratio"]',
    randomSeed: '[data-cy="random-seed-input"]',
    validationStrategy: '[data-cy="validation-strategy-select"]',

    // Model Training
    trainModelButton: '[data-cy="train-model-button"]',
    trainingProgress: '[data-cy="training-progress"]',
    trainingLogs: '[data-cy="training-logs"]',
    trainingMetrics: '[data-cy="training-metrics"]',
    earlyStoppingToggle: '[data-cy="early-stopping-toggle"]',
    maxEpochs: '[data-cy="max-epochs-input"]',
    learningRate: '[data-cy="learning-rate-input"]',

    // Model Evaluation
    evaluationPanel: '[data-cy="evaluation-panel"]',
    confusionMatrix: '[data-cy="confusion-matrix"]',
    rocCurve: '[data-cy="roc-curve"]',
    featureImportanceChart: '[data-cy="feature-importance-chart"]',
    classificationReport: '[data-cy="classification-report"]',
    accuracyMetric: '[data-cy="accuracy-metric"]',
    precisionMetric: '[data-cy="precision-metric"]',
    recallMetric: '[data-cy="recall-metric"]',
    f1ScoreMetric: '[data-cy="f1-score-metric"]',

    // Model Comparison
    compareModelsButton: '[data-cy="compare-models-button"]',
    comparisonTable: '[data-cy="comparison-table"]',
    modelVersions: '[data-cy="model-versions"]',
    baselineModel: '[data-cy="baseline-model"]',

    // Advanced Features
    autoMLToggle: '[data-cy="automl-toggle"]',
    autoMLProgress: '[data-cy="automl-progress"]',
    autoMLResults: '[data-cy="automl-results"]',
    hyperparameterTuning: '[data-cy="hyperparameter-tuning"]',
    gridSearchButton: '[data-cy="grid-search-button"]',
    randomSearchButton: '[data-cy="random-search-button"]',
    bayesianOptButton: '[data-cy="bayesian-opt-button"]',

    // Model Export/Save
    saveModelButton: '[data-cy="save-model-button"]',
    exportModelButton: '[data-cy="export-model-button"]',
    modelFormatSelect: '[data-cy="model-format-select"]',
    downloadModelButton: '[data-cy="download-model-button"]',

    // Validation & Testing
    validationResults: '[data-cy="validation-results"]',
    crossValidationResults: '[data-cy="cv-results"]',
    testDataResults: '[data-cy="test-data-results"]',
    predictionSamples: '[data-cy="prediction-samples"]',

    // Error Handling
    errorPanel: '[data-cy="error-panel"]',
    warningPanel: '[data-cy="warning-panel"]',
    dataQualityIssues: '[data-cy="data-quality-issues"]',
    missingValuesWarning: '[data-cy="missing-values-warning"]',

    // Performance Monitoring
    memoryUsage: '[data-cy="memory-usage"]',
    gpuUsage: '[data-cy="gpu-usage"]',
    trainingTime: '[data-cy="training-time"]',
    estimatedCompletion: '[data-cy="estimated-completion"]'
  };

  // Navigation and Setup
  createNewModel(modelName: string, algorithm: string = 'random-forest'): this {
    cy.get(this.selectors.createModelButton).click();
    cy.get(this.selectors.modelNameInput).type(modelName);
    cy.get(this.selectors.algorithmSelect).click();
    cy.contains('[role="option"]', algorithm).click();
    return this;
  }

  selectDataset(datasetName: string): this {
    cy.get(this.selectors.datasetSelect).click();
    cy.contains('[role="option"]', datasetName).click();
    cy.get('[data-cy="dataset-loading"]').should('not.exist');
    return this;
  }

  selectTargetColumn(columnName: string): this {
    cy.get(this.selectors.targetColumnSelect).click();
    cy.contains('[role="option"]', columnName).click();
    return this;
  }

  // Feature Selection
  selectFeatures(featureNames: string[]): this {
    featureNames.forEach(feature => {
      cy.get(`[data-cy="feature-checkbox-${feature}"]`).check();
    });
    return this;
  }

  selectAllFeatures(): this {
    cy.get(this.selectors.selectAllFeaturesButton).click();
    return this;
  }

  deselectAllFeatures(): this {
    cy.get(this.selectors.deselectAllFeaturesButton).click();
    return this;
  }

  verifyFeatureSelection(expectedCount: number): this {
    cy.get('[data-cy^="feature-checkbox-"]:checked').should('have.length', expectedCount);
    return this;
  }

  // Algorithm Configuration
  configureHyperparameters(parameters: Record<string, string | number>): this {
    Object.entries(parameters).forEach(([param, value]) => {
      cy.get(`[data-cy="hyperparam-${param}"]`).clear().type(String(value));
    });
    return this;
  }

  setValidationStrategy(strategy: 'train-test-split' | 'cross-validation' | 'holdout'): this {
    cy.get(this.selectors.validationStrategy).click();
    cy.contains('[role="option"]', strategy).click();
    return this;
  }

  setCrossValidationFolds(folds: number): this {
    cy.get(this.selectors.crossValidationFolds).clear().type(String(folds));
    return this;
  }

  setTestSplitRatio(ratio: number): this {
    cy.get(this.selectors.testSplitRatio).clear().type(String(ratio));
    return this;
  }

  // Model Training
  startTraining(): this {
    cy.get(this.selectors.trainModelButton).click();
    cy.get(this.selectors.trainingProgress).should('be.visible');
    return this;
  }

  waitForTrainingCompletion(timeout: number = 300000): this {
    cy.get(this.selectors.trainingProgress, { timeout }).should('not.exist');
    cy.get('[data-cy="training-complete"]').should('be.visible');
    return this;
  }

  monitorTrainingProgress(): this {
    cy.get(this.selectors.trainingProgress).should('be.visible');
    cy.get(this.selectors.trainingLogs).should('be.visible');
    cy.get(this.selectors.estimatedCompletion).should('contain.text', 'minutes');
    return this;
  }

  configureEarlyStopping(patience: number, minDelta: number): this {
    cy.get(this.selectors.earlyStoppingToggle).check();
    cy.get('[data-cy="early-stopping-patience"]').clear().type(String(patience));
    cy.get('[data-cy="early-stopping-min-delta"]').clear().type(String(minDelta));
    return this;
  }

  // AutoML Features
  enableAutoML(): this {
    cy.get(this.selectors.autoMLToggle).check();
    cy.get('[data-cy="automl-config-panel"]').should('be.visible');
    return this;
  }

  startAutoMLSearch(): this {
    this.enableAutoML();
    cy.get('[data-cy="start-automl-button"]').click();
    cy.get(this.selectors.autoMLProgress).should('be.visible');
    return this;
  }

  waitForAutoMLCompletion(timeout: number = 600000): this {
    cy.get(this.selectors.autoMLProgress, { timeout }).should('not.exist');
    cy.get(this.selectors.autoMLResults).should('be.visible');
    return this;
  }

  // Hyperparameter Tuning
  performGridSearch(searchSpace: Record<string, string[]>): this {
    cy.get(this.selectors.hyperparameterTuning).should('be.visible');

    Object.entries(searchSpace).forEach(([param, values]) => {
      cy.get(`[data-cy="grid-search-${param}"]`).click();
      values.forEach(value => {
        cy.get(`[data-cy="grid-value-${value}"]`).check();
      });
    });

    cy.get(this.selectors.gridSearchButton).click();
    return this;
  }

  performRandomSearch(nIterations: number): this {
    cy.get('[data-cy="random-search-iterations"]').clear().type(String(nIterations));
    cy.get(this.selectors.randomSearchButton).click();
    return this;
  }

  performBayesianOptimization(): this {
    cy.get(this.selectors.bayesianOptButton).click();
    cy.get('[data-cy="bayesian-opt-progress"]').should('be.visible');
    return this;
  }

  // Model Evaluation
  verifyEvaluationResults(): this {
    cy.get(this.selectors.evaluationPanel).should('be.visible');
    cy.get(this.selectors.accuracyMetric).should('contain.text', '%');
    cy.get(this.selectors.precisionMetric).should('contain.text', '%');
    cy.get(this.selectors.recallMetric).should('contain.text', '%');
    cy.get(this.selectors.f1ScoreMetric).should('contain.text', '%');
    return this;
  }

  verifyConfusionMatrix(): this {
    cy.get(this.selectors.confusionMatrix).should('be.visible');
    cy.get(this.selectors.confusionMatrix).within(() => {
      cy.get('[data-cy="cm-cell"]').should('have.length.at.least', 4);
      cy.get('[data-cy="cm-labels"]').should('be.visible');
    });
    return this;
  }

  verifyROCCurve(): this {
    cy.waitForChart(this.selectors.rocCurve);
    cy.get(this.selectors.rocCurve).within(() => {
      cy.get('svg').should('exist');
      cy.get('.recharts-line').should('be.visible');
    });
    return this;
  }

  verifyFeatureImportance(): this {
    cy.waitForChart(this.selectors.featureImportanceChart);
    cy.get(this.selectors.featureImportanceChart).within(() => {
      cy.get('svg').should('exist');
      cy.get('.recharts-bar').should('have.length.at.least', 1);
    });
    return this;
  }

  downloadClassificationReport(): this {
    cy.get('[data-cy="download-report-button"]').click();
    cy.get('[data-cy="report-format-select"]').click();
    cy.contains('[role="option"]', 'PDF').click();
    cy.get('[data-cy="download-confirm"]').click();
    return this;
  }

  // Model Comparison
  compareWithBaseline(): this {
    cy.get(this.selectors.compareModelsButton).click();
    cy.get(this.selectors.baselineModel).should('be.visible');
    cy.get(this.selectors.comparisonTable).should('be.visible');
    return this;
  }

  compareModelVersions(version1: string, version2: string): this {
    cy.get('[data-cy="compare-versions-button"]').click();
    cy.get('[data-cy="version-1-select"]').click();
    cy.contains('[role="option"]', version1).click();
    cy.get('[data-cy="version-2-select"]').click();
    cy.contains('[role="option"]', version2).click();
    cy.get('[data-cy="start-comparison"]').click();
    return this;
  }

  verifyComparisonResults(): this {
    cy.get(this.selectors.comparisonTable).should('be.visible');
    cy.get(this.selectors.comparisonTable).within(() => {
      cy.get('[data-cy="metric-comparison"]').should('have.length.at.least', 4);
      cy.get('[data-cy="winner-indicator"]').should('be.visible');
    });
    return this;
  }

  // Model Persistence
  saveModel(modelName: string, version: string): this {
    cy.get(this.selectors.saveModelButton).click();
    cy.get('[data-cy="save-model-name"]').clear().type(modelName);
    cy.get('[data-cy="save-model-version"]').clear().type(version);
    cy.get('[data-cy="save-model-confirm"]').click();
    cy.get('[data-cy="model-saved-notification"]').should('be.visible');
    return this;
  }

  exportModel(format: 'pickle' | 'onnx' | 'pmml' | 'joblib'): this {
    cy.get(this.selectors.exportModelButton).click();
    cy.get(this.selectors.modelFormatSelect).click();
    cy.contains('[role="option"]', format).click();
    cy.get(this.selectors.downloadModelButton).click();
    return this;
  }

  // Validation and Testing
  runCrossValidation(): this {
    cy.get('[data-cy="run-cv-button"]').click();
    cy.get(this.selectors.crossValidationResults).should('be.visible');
    return this;
  }

  testOnNewData(datasetName: string): this {
    cy.get('[data-cy="test-new-data-button"]').click();
    cy.get('[data-cy="test-dataset-select"]').click();
    cy.contains('[role="option"]', datasetName).click();
    cy.get('[data-cy="run-test-button"]').click();
    return this;
  }

  generatePredictionSamples(sampleCount: number): this {
    cy.get('[data-cy="generate-samples-button"]').click();
    cy.get('[data-cy="sample-count-input"]').clear().type(String(sampleCount));
    cy.get('[data-cy="generate-confirm"]').click();
    cy.get(this.selectors.predictionSamples).should('be.visible');
    return this;
  }

  // Error Handling and Data Quality
  verifyDataQualityChecks(): this {
    cy.get('[data-cy="data-quality-button"]').click();
    cy.get(this.selectors.dataQualityIssues).should('be.visible');
    return this;
  }

  handleMissingValues(strategy: 'drop' | 'mean' | 'median' | 'mode'): this {
    cy.get('[data-cy="missing-values-strategy"]').click();
    cy.contains('[role="option"]', strategy).click();
    cy.get('[data-cy="apply-strategy-button"]').click();
    return this;
  }

  verifyWarnings(): this {
    cy.get(this.selectors.warningPanel).then(($panel) => {
      if ($panel.length > 0) {
        cy.wrap($panel).should('be.visible');
        cy.get('[data-cy="warning-message"]').should('have.length.at.least', 1);
      }
    });
    return this;
  }

  // Performance Monitoring
  verifyResourceUsage(): this {
    cy.get(this.selectors.memoryUsage).should('be.visible');
    cy.get(this.selectors.memoryUsage).should('contain.text', 'MB');

    cy.get(this.selectors.gpuUsage).then(($gpu) => {
      if ($gpu.length > 0) {
        cy.wrap($gpu).should('contain.text', '%');
      }
    });
    return this;
  }

  verifyTrainingMetrics(): this {
    cy.get(this.selectors.trainingMetrics).should('be.visible');
    cy.get(this.selectors.trainingTime).should('contain.text', 'seconds');
    return this;
  }

  // Advanced Interactions
  testDragAndDropFeatures(): this {
    cy.get('[data-cy="available-features"] [data-cy="feature-item"]').first().as('sourceFeature');
    cy.get('[data-cy="selected-features-panel"]').as('targetPanel');

    cy.get('@sourceFeature').trigger('dragstart');
    cy.get('@targetPanel').trigger('drop');

    cy.get('[data-cy="selected-features-panel"] [data-cy="feature-item"]').should('have.length.at.least', 1);
    return this;
  }

  testKeyboardNavigation(): this {
    cy.get(this.selectors.modelNameInput).focus();
    cy.focused().tab();
    cy.focused().should('have.attr', 'data-cy', 'model-description-input');
    return this;
  }

  // Comprehensive Workflow Tests
  performCompleteModelBuildingWorkflow(
    modelName: string,
    datasetName: string,
    targetColumn: string,
    algorithm: string,
    features: string[]
  ): this {
    return this
      .waitForPageLoad()
      .createNewModel(modelName, algorithm)
      .selectDataset(datasetName)
      .selectTargetColumn(targetColumn)
      .selectFeatures(features)
      .setValidationStrategy('cross-validation')
      .setCrossValidationFolds(5)
      .startTraining()
      .waitForTrainingCompletion()
      .verifyEvaluationResults()
      .verifyConfusionMatrix()
      .verifyROCCurve()
      .verifyFeatureImportance()
      .saveModel(modelName, '1.0.0');
  }

  performAutoMLWorkflow(modelName: string, datasetName: string, targetColumn: string): this {
    return this
      .waitForPageLoad()
      .createNewModel(modelName)
      .selectDataset(datasetName)
      .selectTargetColumn(targetColumn)
      .startAutoMLSearch()
      .waitForAutoMLCompletion()
      .verifyEvaluationResults()
      .saveModel(modelName, '1.0.0-automl');
  }

  performHyperparameterOptimization(
    modelName: string,
    searchSpace: Record<string, string[]>
  ): this {
    return this
      .waitForPageLoad()
      .createNewModel(modelName)
      .performGridSearch(searchSpace)
      .waitForTrainingCompletion()
      .verifyEvaluationResults()
      .compareWithBaseline()
      .saveModel(modelName, '1.0.0-optimized');
  }
}