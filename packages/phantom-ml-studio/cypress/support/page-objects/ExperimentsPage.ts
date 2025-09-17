/// <reference types="cypress" />
import { BasePage } from './BasePage';

/**
 * Experiments Page Object Model - ML experiment tracking and management
 */
export class ExperimentsPage extends BasePage {
  constructor() {
    super('/experiments', '[data-cy="experiments-content"]');
  }

  // Selectors
  private readonly selectors = {
    // Experiment Creation
    createExperimentButton: '[data-cy="create-experiment-button"]',
    experimentNameInput: '[data-cy="experiment-name-input"]',
    experimentDescriptionInput: '[data-cy="experiment-description-input"]',
    experimentTypeSelect: '[data-cy="experiment-type-select"]',
    tagsInput: '[data-cy="experiment-tags-input"]',
    projectSelect: '[data-cy="project-select"]',

    // Experiment Configuration
    modelsToComparePanel: '[data-cy="models-to-compare-panel"]',
    addModelButton: '[data-cy="add-model-button"]',
    modelSelectDropdown: '[data-cy="model-select-dropdown"]',
    removeModelButton: '[data-cy^="remove-model-"]',
    modelConfigPanel: '[data-cy^="model-config-"]',

    // A/B Testing Configuration
    abTestingPanel: '[data-cy="ab-testing-panel"]',
    trafficSplitSlider: '[data-cy="traffic-split-slider"]',
    testDurationInput: '[data-cy="test-duration-input"]',
    significanceLevel: '[data-cy="significance-level-input"]',
    minimumSampleSize: '[data-cy="minimum-sample-size-input"]',
    stratificationSelect: '[data-cy="stratification-select"]',

    // Metrics Configuration
    metricsConfigPanel: '[data-cy="metrics-config-panel"]',
    primaryMetricSelect: '[data-cy="primary-metric-select"]',
    secondaryMetricsPanel: '[data-cy="secondary-metrics-panel"]',
    metricCheckbox: '[data-cy^="metric-checkbox-"]',
    customMetricInput: '[data-cy="custom-metric-input"]',
    addCustomMetricButton: '[data-cy="add-custom-metric-button"]',

    // Experiment Execution
    startExperimentButton: '[data-cy="start-experiment-button"]',
    pauseExperimentButton: '[data-cy="pause-experiment-button"]',
    stopExperimentButton: '[data-cy="stop-experiment-button"]',
    experimentStatus: '[data-cy="experiment-status"]',
    experimentProgress: '[data-cy="experiment-progress"]',
    estimatedCompletion: '[data-cy="estimated-completion"]',

    // Results and Analytics
    resultsPanel: '[data-cy="results-panel"]',
    metricsComparisonTable: '[data-cy="metrics-comparison-table"]',
    statisticalSignificance: '[data-cy="statistical-significance"]',
    confidenceInterval: '[data-cy="confidence-interval"]',
    winnerDeclaration: '[data-cy="winner-declaration"]',
    detailedResults: '[data-cy="detailed-results"]',

    // Visualization
    experimentChart: '[data-cy="experiment-chart"]',
    metricsOverTimeChart: '[data-cy="metrics-over-time-chart"]',
    distributionChart: '[data-cy="distribution-chart"]',
    cohortAnalysisChart: '[data-cy="cohort-analysis-chart"]',
    heatmapChart: '[data-cy="heatmap-chart"]',

    // Experiment List and Management
    experimentsTable: '[data-cy="experiments-table"]',
    experimentRow: '[data-cy^="experiment-row-"]',
    filterPanel: '[data-cy="filter-panel"]',
    statusFilter: '[data-cy="status-filter"]',
    typeFilter: '[data-cy="type-filter"]',
    dateRangeFilter: '[data-cy="date-range-filter"]',
    searchInput: '[data-cy="experiment-search-input"]',
    sortDropdown: '[data-cy="sort-dropdown"]',

    // Experiment Details
    experimentDetailsPanel: '[data-cy="experiment-details-panel"]',
    experimentTabs: '[data-cy="experiment-tabs"]',
    overviewTab: '[data-cy="overview-tab"]',
    configurationTab: '[data-cy="configuration-tab"]',
    resultsTab: '[data-cy="results-tab"]',
    logsTab: '[data-cy="logs-tab"]',

    // Collaboration Features
    shareExperimentButton: '[data-cy="share-experiment-button"]',
    commentSection: '[data-cy="comment-section"]',
    addCommentInput: '[data-cy="add-comment-input"]',
    commentSubmitButton: '[data-cy="comment-submit-button"]',
    collaboratorsPanel: '[data-cy="collaborators-panel"]',
    addCollaboratorButton: '[data-cy="add-collaborator-button"]',

    // Export and Reporting
    exportResultsButton: '[data-cy="export-results-button"]',
    generateReportButton: '[data-cy="generate-report-button"]',
    reportFormatSelect: '[data-cy="report-format-select"]',
    scheduleReportButton: '[data-cy="schedule-report-button"]',

    // Advanced Features
    bayesianAnalysisToggle: '[data-cy="bayesian-analysis-toggle"]',
    sequentialTestingToggle: '[data-cy="sequential-testing-toggle"]',
    multivariateTesting: '[data-cy="multivariate-testing"]',
    featureFlags: '[data-cy="feature-flags"]',
    rollbackButton: '[data-cy="rollback-button"]',

    // Monitoring and Alerts
    alertsPanel: '[data-cy="alerts-panel"]',
    createAlertButton: '[data-cy="create-alert-button"]',
    alertConditionSelect: '[data-cy="alert-condition-select"]',
    alertThresholdInput: '[data-cy="alert-threshold-input"]',
    notificationChannels: '[data-cy="notification-channels"]'
  };

  // Experiment Creation
  createNewExperiment(name: string, type: string = 'a-b-test'): this {
    cy.get(this.selectors.createExperimentButton).click();
    cy.get(this.selectors.experimentNameInput).type(name);
    cy.get(this.selectors.experimentTypeSelect).click();
    cy.contains('[role="option"]', type).click();
    return this;
  }

  setExperimentDescription(description: string): this {
    cy.get(this.selectors.experimentDescriptionInput).type(description);
    return this;
  }

  addExperimentTags(tags: string[]): this {
    tags.forEach(tag => {
      cy.get(this.selectors.tagsInput).type(`${tag}{enter}`);
    });
    return this;
  }

  selectProject(projectName: string): this {
    cy.get(this.selectors.projectSelect).click();
    cy.contains('[role="option"]', projectName).click();
    return this;
  }

  // Model Configuration
  addModelToExperiment(modelName: string, alias?: string): this {
    cy.get(this.selectors.addModelButton).click();
    cy.get(this.selectors.modelSelectDropdown).click();
    cy.contains('[role="option"]', modelName).click();

    if (alias) {
      cy.get('[data-cy="model-alias-input"]').type(alias);
    }

    cy.get('[data-cy="confirm-add-model"]').click();
    return this;
  }

  removeModelFromExperiment(modelId: string): this {
    cy.get(`[data-cy="remove-model-${modelId}"]`).click();
    cy.get('[data-cy="confirm-remove-model"]').click();
    return this;
  }

  configureModelParameters(modelId: string, parameters: Record<string, any>): this {
    cy.get(`[data-cy="model-config-${modelId}"]`).click();

    Object.entries(parameters).forEach(([param, value]) => {
      cy.get(`[data-cy="param-${param}"]`).clear().type(String(value));
    });

    cy.get('[data-cy="save-model-config"]').click();
    return this;
  }

  // A/B Testing Configuration
  configureABTest(
    trafficSplit: number,
    duration: number,
    significanceLevel: number = 0.05
  ): this {
    cy.get(this.selectors.abTestingPanel).should('be.visible');

    // Set traffic split
    cy.get(this.selectors.trafficSplitSlider).invoke('val', trafficSplit).trigger('input');

    // Set test duration
    cy.get(this.selectors.testDurationInput).clear().type(String(duration));

    // Set significance level
    cy.get(this.selectors.significanceLevel).clear().type(String(significanceLevel));

    return this;
  }

  setMinimumSampleSize(sampleSize: number): this {
    cy.get(this.selectors.minimumSampleSize).clear().type(String(sampleSize));
    return this;
  }

  configureStratification(stratifyBy: string): this {
    cy.get(this.selectors.stratificationSelect).click();
    cy.contains('[role="option"]', stratifyBy).click();
    return this;
  }

  // Metrics Configuration
  setPrimaryMetric(metricName: string): this {
    cy.get(this.selectors.primaryMetricSelect).click();
    cy.contains('[role="option"]', metricName).click();
    return this;
  }

  selectSecondaryMetrics(metrics: string[]): this {
    metrics.forEach(metric => {
      cy.get(`[data-cy="metric-checkbox-${metric}"]`).check();
    });
    return this;
  }

  addCustomMetric(metricName: string, formula: string): this {
    cy.get(this.selectors.addCustomMetricButton).click();
    cy.get('[data-cy="custom-metric-name"]').type(metricName);
    cy.get('[data-cy="custom-metric-formula"]').type(formula);
    cy.get('[data-cy="save-custom-metric"]').click();
    return this;
  }

  // Experiment Execution
  startExperiment(): this {
    cy.get(this.selectors.startExperimentButton).click();
    cy.get('[data-cy="confirm-start-experiment"]').click();
    cy.get(this.selectors.experimentStatus).should('contain.text', 'Running');
    return this;
  }

  pauseExperiment(): this {
    cy.get(this.selectors.pauseExperimentButton).click();
    cy.get('[data-cy="confirm-pause-experiment"]').click();
    cy.get(this.selectors.experimentStatus).should('contain.text', 'Paused');
    return this;
  }

  stopExperiment(): this {
    cy.get(this.selectors.stopExperimentButton).click();
    cy.get('[data-cy="confirm-stop-experiment"]').click();
    cy.get(this.selectors.experimentStatus).should('contain.text', 'Stopped');
    return this;
  }

  waitForExperimentCompletion(timeout: number = 300000): this {
    cy.get(this.selectors.experimentStatus, { timeout }).should('contain.text', 'Completed');
    return this;
  }

  monitorExperimentProgress(): this {
    cy.get(this.selectors.experimentProgress).should('be.visible');
    cy.get(this.selectors.estimatedCompletion).should('contain.text', 'minutes');
    return this;
  }

  // Results Analysis
  verifyExperimentResults(): this {
    cy.get(this.selectors.resultsPanel).should('be.visible');
    cy.get(this.selectors.metricsComparisonTable).should('be.visible');
    cy.get(this.selectors.statisticalSignificance).should('be.visible');
    return this;
  }

  checkStatisticalSignificance(): this {
    cy.get(this.selectors.statisticalSignificance).should('contain.text', 'p-value');
    cy.get(this.selectors.confidenceInterval).should('be.visible');
    return this;
  }

  verifyWinnerDeclaration(): this {
    cy.get(this.selectors.winnerDeclaration).should('be.visible');
    cy.get('[data-cy="winner-model"]').should('exist');
    cy.get('[data-cy="improvement-percentage"]').should('contain.text', '%');
    return this;
  }

  viewDetailedResults(): this {
    cy.get('[data-cy="view-detailed-results"]').click();
    cy.get(this.selectors.detailedResults).should('be.visible');
    return this;
  }

  // Data Visualization
  verifyExperimentCharts(): this {
    cy.waitForChart(this.selectors.experimentChart);
    cy.waitForChart(this.selectors.metricsOverTimeChart);
    cy.waitForChart(this.selectors.distributionChart);
    return this;
  }

  interactWithMetricsChart(): this {
    cy.get(this.selectors.metricsOverTimeChart).within(() => {
      cy.get('.recharts-line-dot').first().trigger('mouseover');
      cy.get('[data-cy="chart-tooltip"]').should('be.visible');
    });
    return this;
  }

  viewCohortAnalysis(): this {
    cy.get('[data-cy="cohort-analysis-tab"]').click();
    cy.waitForChart(this.selectors.cohortAnalysisChart);
    return this;
  }

  viewHeatmapAnalysis(): this {
    cy.get('[data-cy="heatmap-tab"]').click();
    cy.waitForChart(this.selectors.heatmapChart);
    return this;
  }

  // Experiment Management
  filterExperiments(filterType: string, filterValue: string): this {
    cy.get(this.selectors.filterPanel).should('be.visible');

    switch (filterType) {
      case 'status':
        cy.get(this.selectors.statusFilter).click();
        cy.contains('[role="option"]', filterValue).click();
        break;
      case 'type':
        cy.get(this.selectors.typeFilter).click();
        cy.contains('[role="option"]', filterValue).click();
        break;
      default:
        cy.get(this.selectors.searchInput).type(filterValue);
    }

    return this;
  }

  sortExperiments(sortBy: string): this {
    cy.get(this.selectors.sortDropdown).click();
    cy.contains('[role="option"]', sortBy).click();
    return this;
  }

  searchExperiments(searchTerm: string): this {
    cy.get(this.selectors.searchInput).type(searchTerm);
    cy.get('[data-cy="search-results"]').should('be.visible');
    return this;
  }

  selectExperiment(experimentName: string): this {
    cy.contains(this.selectors.experimentRow, experimentName).click();
    cy.get(this.selectors.experimentDetailsPanel).should('be.visible');
    return this;
  }

  // Experiment Details Navigation
  viewExperimentOverview(): this {
    cy.get(this.selectors.overviewTab).click();
    cy.get('[data-cy="overview-content"]').should('be.visible');
    return this;
  }

  viewExperimentConfiguration(): this {
    cy.get(this.selectors.configurationTab).click();
    cy.get('[data-cy="configuration-content"]').should('be.visible');
    return this;
  }

  viewExperimentResults(): this {
    cy.get(this.selectors.resultsTab).click();
    cy.get(this.selectors.resultsPanel).should('be.visible');
    return this;
  }

  viewExperimentLogs(): this {
    cy.get(this.selectors.logsTab).click();
    cy.get('[data-cy="logs-content"]').should('be.visible');
    return this;
  }

  // Collaboration Features
  shareExperiment(emailAddresses: string[]): this {
    cy.get(this.selectors.shareExperimentButton).click();

    emailAddresses.forEach(email => {
      cy.get('[data-cy="share-email-input"]').type(`${email}{enter}`);
    });

    cy.get('[data-cy="send-share-invitation"]').click();
    return this;
  }

  addComment(comment: string): this {
    cy.get(this.selectors.addCommentInput).type(comment);
    cy.get(this.selectors.commentSubmitButton).click();
    cy.get('[data-cy="comment-added-notification"]').should('be.visible');
    return this;
  }

  addCollaborator(userName: string, role: string = 'viewer'): this {
    cy.get(this.selectors.addCollaboratorButton).click();
    cy.get('[data-cy="collaborator-search"]').type(userName);
    cy.get(`[data-cy="user-suggestion-${userName}"]`).click();
    cy.get('[data-cy="collaborator-role-select"]').click();
    cy.contains('[role="option"]', role).click();
    cy.get('[data-cy="add-collaborator-confirm"]').click();
    return this;
  }

  // Export and Reporting
  exportResults(format: 'csv' | 'json' | 'pdf'): this {
    cy.get(this.selectors.exportResultsButton).click();
    cy.get('[data-cy="export-format-select"]').click();
    cy.contains('[role="option"]', format).click();
    cy.get('[data-cy="export-confirm"]').click();
    return this;
  }

  generateReport(templateName: string): this {
    cy.get(this.selectors.generateReportButton).click();
    cy.get('[data-cy="report-template-select"]').click();
    cy.contains('[role="option"]', templateName).click();
    cy.get('[data-cy="generate-report-confirm"]').click();
    return this;
  }

  scheduleReport(frequency: string, recipients: string[]): this {
    cy.get(this.selectors.scheduleReportButton).click();
    cy.get('[data-cy="report-frequency-select"]').click();
    cy.contains('[role="option"]', frequency).click();

    recipients.forEach(email => {
      cy.get('[data-cy="report-recipients-input"]').type(`${email}{enter}`);
    });

    cy.get('[data-cy="schedule-report-confirm"]').click();
    return this;
  }

  // Advanced Features
  enableBayesianAnalysis(): this {
    cy.get(this.selectors.bayesianAnalysisToggle).check();
    cy.get('[data-cy="bayesian-config-panel"]').should('be.visible');
    return this;
  }

  enableSequentialTesting(): this {
    cy.get(this.selectors.sequentialTestingToggle).check();
    cy.get('[data-cy="sequential-testing-config"]').should('be.visible');
    return this;
  }

  configureMultivariateTest(factors: Array<{name: string, levels: string[]}>): this {
    cy.get(this.selectors.multivariateTesting).should('be.visible');

    factors.forEach((factor, index) => {
      cy.get(`[data-cy="factor-${index}-name"]`).type(factor.name);
      factor.levels.forEach((level, levelIndex) => {
        cy.get(`[data-cy="factor-${index}-level-${levelIndex}"]`).type(level);
      });
    });

    return this;
  }

  rollbackExperiment(rollbackReason: string): this {
    cy.get(this.selectors.rollbackButton).click();
    cy.get('[data-cy="rollback-reason"]').type(rollbackReason);
    cy.get('[data-cy="confirm-rollback"]').click();
    return this;
  }

  // Monitoring and Alerts
  createAlert(condition: string, threshold: number, channels: string[]): this {
    cy.get(this.selectors.createAlertButton).click();
    cy.get(this.selectors.alertConditionSelect).click();
    cy.contains('[role="option"]', condition).click();
    cy.get(this.selectors.alertThresholdInput).type(String(threshold));

    channels.forEach(channel => {
      cy.get(`[data-cy="notification-channel-${channel}"]`).check();
    });

    cy.get('[data-cy="create-alert-confirm"]').click();
    return this;
  }

  verifyAlerts(): this {
    cy.get(this.selectors.alertsPanel).should('be.visible');
    cy.get('[data-cy="active-alerts"]').should('exist');
    return this;
  }

  // Comprehensive Workflow Tests
  performCompleteABTest(
    experimentName: string,
    modelA: string,
    modelB: string,
    primaryMetric: string,
    trafficSplit: number = 50
  ): this {
    return this
      .waitForPageLoad()
      .createNewExperiment(experimentName, 'a-b-test')
      .addModelToExperiment(modelA, 'Control')
      .addModelToExperiment(modelB, 'Treatment')
      .configureABTest(trafficSplit, 7, 0.05)
      .setPrimaryMetric(primaryMetric)
      .startExperiment()
      .monitorExperimentProgress();
  }

  performMultivariantTest(
    experimentName: string,
    models: string[],
    factors: Array<{name: string, levels: string[]}>
  ): this {
    this.createNewExperiment(experimentName, 'multivariate-test');

    models.forEach(model => {
      this.addModelToExperiment(model);
    });

    return this
      .configureMultivariateTest(factors)
      .startExperiment()
      .monitorExperimentProgress();
  }

  performBayesianExperiment(
    experimentName: string,
    modelA: string,
    modelB: string
  ): this {
    return this
      .createNewExperiment(experimentName, 'bayesian-test')
      .addModelToExperiment(modelA)
      .addModelToExperiment(modelB)
      .enableBayesianAnalysis()
      .startExperiment()
      .waitForExperimentCompletion()
      .verifyExperimentResults();
  }
}