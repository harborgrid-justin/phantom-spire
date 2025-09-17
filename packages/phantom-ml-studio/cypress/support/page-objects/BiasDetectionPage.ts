/// <reference types="cypress" />
import { BasePage } from './BasePage';

/**
 * Bias Detection Engine Page Object Model - ML fairness and bias analysis
 */
export class BiasDetectionPage extends BasePage {
  constructor() {
    super('/bias-detection-engine', '[data-cy="bias-detection-content"]');
  }

  // Selectors
  private readonly selectors = {
    // Dataset Selection
    datasetSelect: '[data-cy="dataset-select"]',
    uploadDatasetButton: '[data-cy="upload-dataset-button"]',
    datasetPreview: '[data-cy="dataset-preview"]',
    sensitiveAttributesPanel: '[data-cy="sensitive-attributes-panel"]',
    sensitiveAttributeCheckbox: '[data-cy^="sensitive-attr-"]',
    targetVariableSelect: '[data-cy="target-variable-select"]',

    // Bias Analysis Configuration
    analysisConfigPanel: '[data-cy="analysis-config-panel"]',
    biasMetricsPanel: '[data-cy="bias-metrics-panel"]',
    disparateImpactToggle: '[data-cy="disparate-impact-toggle"]',
    equalizationToggle: '[data-cy="equalization-toggle"]',
    calibrationToggle: '[data-cy="calibration-toggle"]',
    demographicParityToggle: '[data-cy="demographic-parity-toggle"]',
    equalOpportunityToggle: '[data-cy="equal-opportunity-toggle"]',

    // Model Selection
    modelSelectionPanel: '[data-cy="model-selection-panel"]',
    modelSelect: '[data-cy="model-select"]',
    multipleModelsToggle: '[data-cy="multiple-models-toggle"]',
    compareModelsButton: '[data-cy="compare-models-button"]',

    // Analysis Execution
    runAnalysisButton: '[data-cy="run-analysis-button"]',
    analysisProgress: '[data-cy="analysis-progress"]',
    analysisStatus: '[data-cy="analysis-status"]',

    // Results and Visualizations
    resultsPanel: '[data-cy="results-panel"]',
    biasScoreCard: '[data-cy="bias-score-card"]',
    overallBiasScore: '[data-cy="overall-bias-score"]',
    fairnessMetricsTable: '[data-cy="fairness-metrics-table"]',

    // Charts and Visualizations
    disparityChart: '[data-cy="disparity-chart"]',
    distributionChart: '[data-cy="distribution-chart"]',
    confusionMatrixChart: '[data-cy="confusion-matrix-chart"]',
    rocCurveChart: '[data-cy="roc-curve-chart"]',
    calibrationChart: '[data-cy="calibration-chart"]',
    featureImportanceChart: '[data-cy="feature-importance-chart"]',

    // Bias Mitigation
    mitigationPanel: '[data-cy="mitigation-panel"]',
    mitigationStrategies: '[data-cy="mitigation-strategies"]',
    preprocessingToggle: '[data-cy="preprocessing-toggle"]',
    inprocessingToggle: '[data-cy="inprocessing-toggle"]',
    postprocessingToggle: '[data-cy="postprocessing-toggle"]',
    reweightingButton: '[data-cy="reweighting-button"]',
    thresholdOptimizationButton: '[data-cy="threshold-optimization-button"]',

    // Reporting and Export
    generateReportButton: '[data-cy="generate-report-button"]',
    reportTemplateSelect: '[data-cy="report-template-select"]',
    exportResultsButton: '[data-cy="export-results-button"]',
    shareAnalysisButton: '[data-cy="share-analysis-button"]',

    // Compliance and Regulation
    compliancePanel: '[data-cy="compliance-panel"]',
    gdprComplianceCheck: '[data-cy="gdpr-compliance-check"]',
    equalCreditOpportunityCheck: '[data-cy="ecoa-compliance-check"]',
    fairHousingCheck: '[data-cy="fair-housing-check"]',
    regulatoryFrameworkSelect: '[data-cy="regulatory-framework-select"]',

    // Historical Analysis
    historicalAnalysisPanel: '[data-cy="historical-analysis-panel"]',
    timeSeriesChart: '[data-cy="time-series-chart"]',
    trendAnalysisButton: '[data-cy="trend-analysis-button"]',
    baselineComparisonButton: '[data-cy="baseline-comparison-button"]',

    // Alerts and Monitoring
    alertsConfigPanel: '[data-cy="alerts-config-panel"]',
    biasThresholdInput: '[data-cy="bias-threshold-input"]',
    alertChannelSelect: '[data-cy="alert-channel-select"]',
    enableAlertsToggle: '[data-cy="enable-alerts-toggle"]'
  };

  // Dataset and Configuration
  selectDataset(datasetName: string): this {
    cy.get(this.selectors.datasetSelect).click();
    cy.contains('[role="option"]', datasetName).click();
    cy.get(this.selectors.datasetPreview).should('be.visible');
    return this;
  }

  selectSensitiveAttributes(attributes: string[]): this {
    attributes.forEach(attr => {
      cy.get(`[data-cy="sensitive-attr-${attr}"]`).check();
    });
    return this;
  }

  selectTargetVariable(variable: string): this {
    cy.get(this.selectors.targetVariableSelect).click();
    cy.contains('[role="option"]', variable).click();
    return this;
  }

  // Bias Metrics Configuration
  configureBiasMetrics(metrics: {
    disparateImpact?: boolean;
    equalization?: boolean;
    calibration?: boolean;
    demographicParity?: boolean;
    equalOpportunity?: boolean;
  }): this {
    if (metrics.disparateImpact) {
      cy.get(this.selectors.disparateImpactToggle).check();
    }
    if (metrics.equalization) {
      cy.get(this.selectors.equalizationToggle).check();
    }
    if (metrics.calibration) {
      cy.get(this.selectors.calibrationToggle).check();
    }
    if (metrics.demographicParity) {
      cy.get(this.selectors.demographicParityToggle).check();
    }
    if (metrics.equalOpportunity) {
      cy.get(this.selectors.equalOpportunityToggle).check();
    }
    return this;
  }

  // Model Selection
  selectModel(modelName: string): this {
    cy.get(this.selectors.modelSelect).click();
    cy.contains('[role="option"]', modelName).click();
    return this;
  }

  enableMultiModelComparison(): this {
    cy.get(this.selectors.multipleModelsToggle).check();
    cy.get('[data-cy="model-comparison-panel"]').should('be.visible');
    return this;
  }

  addModelForComparison(modelName: string): this {
    cy.get('[data-cy="add-comparison-model"]').click();
    cy.get('[data-cy="comparison-model-select"]').click();
    cy.contains('[role="option"]', modelName).click();
    cy.get('[data-cy="confirm-add-model"]').click();
    return this;
  }

  // Analysis Execution
  runBiasAnalysis(): this {
    cy.get(this.selectors.runAnalysisButton).click();
    cy.get(this.selectors.analysisProgress).should('be.visible');
    return this;
  }

  waitForAnalysisCompletion(timeout: number = 120000): this {
    cy.get(this.selectors.analysisStatus, { timeout }).should('contain.text', 'Completed');
    cy.get(this.selectors.resultsPanel).should('be.visible');
    return this;
  }

  // Results Analysis
  verifyBiasScoreCard(): this {
    cy.get(this.selectors.biasScoreCard).should('be.visible');
    cy.get(this.selectors.overallBiasScore).should('contain.text', '%');
    return this;
  }

  verifyFairnessMetrics(): this {
    cy.get(this.selectors.fairnessMetricsTable).should('be.visible');
    cy.get(this.selectors.fairnessMetricsTable).within(() => {
      cy.get('[data-cy="metric-row"]').should('have.length.at.least', 1);
      cy.get('[data-cy="metric-value"]').should('be.visible');
    });
    return this;
  }

  checkBiasLevel(expectedLevel: 'low' | 'medium' | 'high'): this {
    cy.get('[data-cy="bias-level-indicator"]').should('have.attr', 'data-level', expectedLevel);
    return this;
  }

  // Visualizations
  verifyDisparityChart(): this {
    cy.waitForChart(this.selectors.disparityChart);
    cy.get(this.selectors.disparityChart).within(() => {
      cy.get('svg').should('exist');
      cy.get('.recharts-bar').should('have.length.at.least', 1);
    });
    return this;
  }

  verifyDistributionChart(): this {
    cy.waitForChart(this.selectors.distributionChart);
    cy.get(this.selectors.distributionChart).within(() => {
      cy.get('svg').should('exist');
    });
    return this;
  }

  verifyConfusionMatrix(): this {
    cy.get(this.selectors.confusionMatrixChart).should('be.visible');
    cy.get(this.selectors.confusionMatrixChart).within(() => {
      cy.get('[data-cy="cm-cell"]').should('have.length.at.least', 4);
    });
    return this;
  }

  verifyROCCurves(): this {
    cy.waitForChart(this.selectors.rocCurveChart);
    cy.get(this.selectors.rocCurveChart).within(() => {
      cy.get('.recharts-line').should('have.length.at.least', 1);
    });
    return this;
  }

  verifyCalibrationPlot(): this {
    cy.waitForChart(this.selectors.calibrationChart);
    cy.get(this.selectors.calibrationChart).within(() => {
      cy.get('svg').should('exist');
      cy.get('.recharts-line').should('be.visible');
    });
    return this;
  }

  // Interactive Chart Analysis
  interactWithDisparityChart(): this {
    cy.get(this.selectors.disparityChart).within(() => {
      cy.get('.recharts-bar').first().trigger('mouseover');
      cy.get('[data-cy="chart-tooltip"]').should('be.visible');
    });
    return this;
  }

  drillDownIntoMetric(metricName: string): this {
    cy.get(`[data-cy="metric-${metricName}"]`).click();
    cy.get('[data-cy="metric-detail-panel"]').should('be.visible');
    return this;
  }

  // Bias Mitigation
  viewMitigationStrategies(): this {
    cy.get(this.selectors.mitigationPanel).should('be.visible');
    cy.get(this.selectors.mitigationStrategies).should('be.visible');
    return this;
  }

  applyPreprocessingMitigation(): this {
    cy.get(this.selectors.preprocessingToggle).check();
    cy.get(this.selectors.reweightingButton).click();
    cy.get('[data-cy="reweighting-progress"]').should('be.visible');
    return this;
  }

  applyInprocessingMitigation(): this {
    cy.get(this.selectors.inprocessingToggle).check();
    cy.get('[data-cy="fairness-constraint-select"]').click();
    cy.contains('[role="option"]', 'demographic-parity').click();
    cy.get('[data-cy="apply-inprocessing"]').click();
    return this;
  }

  applyPostprocessingMitigation(): this {
    cy.get(this.selectors.postprocessingToggle).check();
    cy.get(this.selectors.thresholdOptimizationButton).click();
    cy.get('[data-cy="threshold-optimization-progress"]').should('be.visible');
    return this;
  }

  compareBeforeAfterMitigation(): this {
    cy.get('[data-cy="before-after-comparison"]').should('be.visible');
    cy.get('[data-cy="mitigation-effectiveness"]').should('contain.text', '%');
    return this;
  }

  // Compliance and Regulation
  checkComplianceFramework(framework: 'gdpr' | 'ecoa' | 'fair-housing'): this {
    cy.get(this.selectors.compliancePanel).should('be.visible');

    switch (framework) {
      case 'gdpr':
        cy.get(this.selectors.gdprComplianceCheck).click();
        break;
      case 'ecoa':
        cy.get(this.selectors.equalCreditOpportunityCheck).click();
        break;
      case 'fair-housing':
        cy.get(this.selectors.fairHousingCheck).click();
        break;
    }

    cy.get('[data-cy="compliance-results"]').should('be.visible');
    return this;
  }

  selectRegulatoryFramework(framework: string): this {
    cy.get(this.selectors.regulatoryFrameworkSelect).click();
    cy.contains('[role="option"]', framework).click();
    return this;
  }

  // Historical Analysis
  viewHistoricalTrends(): this {
    cy.get(this.selectors.historicalAnalysisPanel).should('be.visible');
    cy.get(this.selectors.trendAnalysisButton).click();
    cy.waitForChart(this.selectors.timeSeriesChart);
    return this;
  }

  compareWithBaseline(): this {
    cy.get(this.selectors.baselineComparisonButton).click();
    cy.get('[data-cy="baseline-comparison-chart"]').should('be.visible');
    return this;
  }

  analyzeTemporalBias(): this {
    cy.get('[data-cy="temporal-bias-analysis"]').click();
    cy.get('[data-cy="temporal-patterns"]').should('be.visible');
    return this;
  }

  // Reporting and Export
  generateBiasReport(templateType: 'executive' | 'technical' | 'regulatory'): this {
    cy.get(this.selectors.generateReportButton).click();
    cy.get(this.selectors.reportTemplateSelect).click();
    cy.contains('[role="option"]', templateType).click();
    cy.get('[data-cy="generate-report-confirm"]').click();
    cy.get('[data-cy="report-generation-progress"]').should('be.visible');
    return this;
  }

  exportResults(format: 'json' | 'csv' | 'pdf'): this {
    cy.get(this.selectors.exportResultsButton).click();
    cy.get('[data-cy="export-format-select"]').click();
    cy.contains('[role="option"]', format).click();
    cy.get('[data-cy="export-confirm"]').click();
    return this;
  }

  shareAnalysis(recipients: string[]): this {
    cy.get(this.selectors.shareAnalysisButton).click();
    recipients.forEach(email => {
      cy.get('[data-cy="recipient-email-input"]').type(`${email}{enter}`);
    });
    cy.get('[data-cy="send-share"]').click();
    return this;
  }

  // Monitoring and Alerts
  configureAlerts(threshold: number, channels: string[]): this {
    cy.get(this.selectors.alertsConfigPanel).should('be.visible');
    cy.get(this.selectors.enableAlertsToggle).check();
    cy.get(this.selectors.biasThresholdInput).clear().type(String(threshold));

    channels.forEach(channel => {
      cy.get(this.selectors.alertChannelSelect).click();
      cy.contains('[role="option"]', channel).click();
    });

    cy.get('[data-cy="save-alert-config"]').click();
    return this;
  }

  // Advanced Features
  runIntersectionalAnalysis(): this {
    cy.get('[data-cy="intersectional-analysis"]').click();
    cy.get('[data-cy="intersectional-combinations"]').should('be.visible');
    return this;
  }

  performCausalAnalysis(): this {
    cy.get('[data-cy="causal-analysis"]').click();
    cy.get('[data-cy="causal-graph"]').should('be.visible');
    return this;
  }

  generateCounterfactualExamples(): this {
    cy.get('[data-cy="counterfactual-generation"]').click();
    cy.get('[data-cy="counterfactual-examples"]').should('be.visible');
    return this;
  }

  // Comprehensive Workflows
  performCompleteBiasAnalysis(
    datasetName: string,
    sensitiveAttrs: string[],
    targetVariable: string,
    modelName: string
  ): this {
    return this
      .waitForPageLoad()
      .selectDataset(datasetName)
      .selectSensitiveAttributes(sensitiveAttrs)
      .selectTargetVariable(targetVariable)
      .selectModel(modelName)
      .configureBiasMetrics({
        disparateImpact: true,
        demographicParity: true,
        equalOpportunity: true
      })
      .runBiasAnalysis()
      .waitForAnalysisCompletion()
      .verifyBiasScoreCard()
      .verifyFairnessMetrics()
      .verifyDisparityChart()
      .verifyDistributionChart();
  }

  performBiasMitigationWorkflow(
    datasetName: string,
    sensitiveAttrs: string[],
    modelName: string
  ): this {
    return this
      .performCompleteBiasAnalysis(datasetName, sensitiveAttrs, 'target', modelName)
      .viewMitigationStrategies()
      .applyPreprocessingMitigation()
      .waitForAnalysisCompletion()
      .compareBeforeAfterMitigation()
      .generateBiasReport('technical');
  }

  performComplianceCheck(
    datasetName: string,
    framework: 'gdpr' | 'ecoa' | 'fair-housing'
  ): this {
    return this
      .selectDataset(datasetName)
      .checkComplianceFramework(framework)
      .generateBiasReport('regulatory')
      .exportResults('pdf');
  }
}