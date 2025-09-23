/// <reference types="cypress" />

import { DashboardPage } from '../../support/page-objects/DashboardPage';
import { ModelBuilderPage } from '../../support/page-objects/ModelBuilderPage';
import { ExperimentsPage } from '../../support/page-objects/ExperimentsPage';
import { BiasDetectionPage } from '../../support/page-objects/BiasDetectionPage';

describe('Visual Regression Testing - Charts and Dashboards', () => {
  beforeEach(() => {
    // Set up consistent viewport for visual testing
    cy.viewport(1920, 1080);

    // Set up test data for consistent chart rendering
    cy.setupTestEnvironment('default');

    // Mock chart data with deterministic values for consistent visuals
    cy.intercept('GET', '/api/dashboard/metrics', {
      fixture: 'dashboard-metrics.json'
    }).as('dashboardMetrics');

    cy.intercept('GET', '/api/models/*/evaluation', {
      fixture: 'model-evaluation.json'
    }).as('modelEvaluation');

    cy.intercept('GET', '/api/experiments/*/results', {
      fixture: 'experiment-results.json'
    }).as('experimentResults');

    cy.intercept('GET', '/api/bias-detection/*/analysis', {
      fixture: 'bias-analysis.json'
    }).as('biasAnalysis');
  });

  describe('Dashboard Charts Visual Testing', () => {
    it('should maintain consistent visual appearance of dashboard charts', () => {
      cy.logTestStep('Testing dashboard charts visual consistency');

      const dashboardPage = new DashboardPage();

      dashboardPage
        .visit()
        .waitForPageLoad();

      // Wait for all charts to render
      cy.waitForChart('[data-cy="performance-chart"]');
      cy.waitForChart('[data-cy="trends-chart"]');
      cy.waitForChart('[data-cy="resource-usage-chart"]');

      // Capture full dashboard
      cy.captureChartScreenshot('dashboard-content', 'dashboard-full-view');

      // Test individual chart components
      cy.captureChartScreenshot('performance-chart', 'dashboard-performance-chart');
      cy.captureChartScreenshot('trends-chart', 'dashboard-trends-chart');
      cy.captureChartScreenshot('resource-usage-chart', 'dashboard-resource-chart');

      // Test chart interactions
      cy.interactWithChart('performance-chart', 'hover', { x: 100, y: 100 });
      cy.captureChartScreenshot('performance-chart', 'dashboard-performance-chart-hover');

      // Test different time ranges
      dashboardPage.applyFilter('dateRange', 'last-week');
      cy.waitForApiResponse('dashboardMetrics');
      cy.waitForChart('[data-cy="performance-chart"]');
      cy.captureChartScreenshot('performance-chart', 'dashboard-performance-chart-weekly');

      dashboardPage.applyFilter('dateRange', 'last-month');
      cy.waitForApiResponse('dashboardMetrics');
      cy.waitForChart('[data-cy="performance-chart"]');
      cy.captureChartScreenshot('performance-chart', 'dashboard-performance-chart-monthly');
    });

    it('should handle different screen sizes consistently', () => {
      cy.logTestStep('Testing dashboard responsiveness visual consistency');

      const dashboardPage = new DashboardPage();

      // Desktop view
      cy.viewport(1920, 1080);
      dashboardPage.visit().waitForPageLoad();
      cy.waitForChart('[data-cy="performance-chart"]');
      cy.captureChartScreenshot('dashboard-content', 'dashboard-desktop-1920');

      // Laptop view
      cy.viewport(1366, 768);
      cy.waitForChart('[data-cy="performance-chart"]');
      cy.captureChartScreenshot('dashboard-content', 'dashboard-laptop-1366');

      // Tablet view
      cy.viewport(1024, 768);
      cy.waitForChart('[data-cy="performance-chart"]');
      cy.captureChartScreenshot('dashboard-content', 'dashboard-tablet-1024');

      // Large mobile view
      cy.viewport(414, 896);
      cy.waitForChart('[data-cy="performance-chart"]');
      cy.captureChartScreenshot('dashboard-content', 'dashboard-mobile-414');
    });

    it('should maintain theme consistency across charts', () => {
      cy.logTestStep('Testing theme consistency in charts');

      const dashboardPage = new DashboardPage();

      // Light theme
      dashboardPage.visit().waitForPageLoad();
      cy.waitForChart('[data-cy="performance-chart"]');
      cy.captureChartScreenshot('dashboard-content', 'dashboard-light-theme');

      // Dark theme
      dashboardPage.toggleTheme();
      cy.wait(1000); // Allow theme transition
      cy.captureChartScreenshot('dashboard-content', 'dashboard-dark-theme');

      // Test individual charts in dark theme
      cy.captureChartScreenshot('performance-chart', 'performance-chart-dark-theme');
      cy.captureChartScreenshot('trends-chart', 'trends-chart-dark-theme');
    });
  });

  describe('Model Evaluation Charts Visual Testing', () => {
    it('should maintain consistent model evaluation visualizations', () => {
      cy.logTestStep('Testing model evaluation charts visual consistency');

      const modelBuilderPage = new ModelBuilderPage();

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Visual Test Model')
        .selectDataset('test_dataset')
        .startTraining()
        .waitForTrainingCompletion();

      // Test evaluation charts
      cy.waitForChart('[data-cy="confusion-matrix"]');
      cy.captureChartScreenshot('confusion-matrix', 'model-confusion-matrix');

      cy.waitForChart('[data-cy="roc-curve"]');
      cy.captureChartScreenshot('roc-curve', 'model-roc-curve');

      cy.waitForChart('[data-cy="feature-importance-chart"]');
      cy.captureChartScreenshot('feature-importance-chart', 'model-feature-importance');

      // Test learning curves
      cy.get('[data-cy="learning-curves-tab"]').click();
      cy.waitForChart('[data-cy="learning-curves"]');
      cy.captureChartScreenshot('learning-curves', 'model-learning-curves');

      // Test residual plots
      cy.get('[data-cy="residuals-tab"]').click();
      cy.waitForChart('[data-cy="residuals-plot"]');
      cy.captureChartScreenshot('residuals-plot', 'model-residuals-plot');
    });

    it('should handle different model types consistently', () => {
      cy.logTestStep('Testing different model type visualizations');

      const modelBuilderPage = new ModelBuilderPage();

      // Classification model visualizations
      cy.intercept('GET', '/api/models/classification/evaluation', {
        fixture: 'classification-evaluation.json'
      }).as('classificationEval');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Classification Model', 'random-forest')
        .selectDataset('classification_dataset')
        .selectTargetColumn('class')
        .startTraining()
        .waitForTrainingCompletion();

      cy.captureChartScreenshot('confusion-matrix', 'classification-confusion-matrix');
      cy.captureChartScreenshot('roc-curve', 'classification-roc-curve');
      cy.captureChartScreenshot('precision-recall-curve', 'classification-pr-curve');

      // Regression model visualizations
      cy.intercept('GET', '/api/models/regression/evaluation', {
        fixture: 'regression-evaluation.json'
      }).as('regressionEval');

      modelBuilderPage
        .createNewModel('Regression Model', 'linear-regression')
        .selectDataset('regression_dataset')
        .selectTargetColumn('target_value')
        .startTraining()
        .waitForTrainingCompletion();

      cy.captureChartScreenshot('residuals-plot', 'regression-residuals-plot');
      cy.captureChartScreenshot('prediction-vs-actual', 'regression-prediction-actual');
      cy.captureChartScreenshot('qq-plot', 'regression-qq-plot');
    });

    it('should maintain chart consistency with different data sizes', () => {
      cy.logTestStep('Testing chart rendering with different data sizes');

      const modelBuilderPage = new ModelBuilderPage();

      // Small dataset
      const smallData = Array.from({ length: 10 }, (_, i) => ({
        x: i, y: Math.random() * 100, predicted: Math.random() * 100
      }));

      cy.intercept('GET', '/api/models/*/evaluation-data', {
        body: { data: smallData }
      }).as('smallDataset');

      modelBuilderPage
        .visit()
        .waitForPageLoad()
        .createNewModel('Small Dataset Model')
        .selectDataset('small_dataset')
        .startTraining()
        .waitForTrainingCompletion();

      cy.captureChartScreenshot('prediction-vs-actual', 'chart-small-dataset');

      // Large dataset
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        x: i, y: Math.random() * 100, predicted: Math.random() * 100
      }));

      cy.intercept('GET', '/api/models/*/evaluation-data', {
        body: { data: largeData }
      }).as('largeDataset');

      modelBuilderPage
        .createNewModel('Large Dataset Model')
        .selectDataset('large_dataset')
        .startTraining()
        .waitForTrainingCompletion();

      cy.captureChartScreenshot('prediction-vs-actual', 'chart-large-dataset');
    });
  });

  describe('Experiment Results Visual Testing', () => {
    it('should maintain consistent experiment visualization', () => {
      cy.logTestStep('Testing experiment results visual consistency');

      const experimentsPage = new ExperimentsPage();

      experimentsPage
        .visit()
        .waitForPageLoad()
        .selectExperiment('Model Performance A/B Test')
        .viewExperimentResults();

      // Test experiment comparison charts
      cy.waitForChart('[data-cy="experiment-chart"]');
      cy.captureChartScreenshot('experiment-chart', 'experiment-comparison-chart');

      cy.waitForChart('[data-cy="metrics-over-time-chart"]');
      cy.captureChartScreenshot('metrics-over-time-chart', 'experiment-metrics-timeline');

      cy.waitForChart('[data-cy="distribution-chart"]');
      cy.captureChartScreenshot('distribution-chart', 'experiment-distribution-chart');

      // Test statistical significance visualization
      cy.get('[data-cy="statistical-results-tab"]').click();
      cy.waitForChart('[data-cy="significance-chart"]');
      cy.captureChartScreenshot('significance-chart', 'experiment-significance-chart');

      // Test cohort analysis
      experimentsPage.viewCohortAnalysis();
      cy.captureChartScreenshot('cohort-analysis-chart', 'experiment-cohort-analysis');
    });

    it('should handle different experiment types visually', () => {
      cy.logTestStep('Testing different experiment type visualizations');

      const experimentsPage = new ExperimentsPage();

      // A/B Test visualization
      experimentsPage
        .visit()
        .waitForPageLoad()
        .filterExperiments('type', 'a-b-test')
        .selectExperiment('A/B Test Example')
        .viewExperimentResults();

      cy.captureChartScreenshot('experiment-chart', 'ab-test-results-chart');

      // Multivariate test visualization
      experimentsPage
        .filterExperiments('type', 'multivariate-test')
        .selectExperiment('Multivariate Test Example')
        .viewExperimentResults();

      cy.captureChartScreenshot('experiment-chart', 'multivariate-test-results-chart');

      // Feature analysis visualization
      experimentsPage
        .filterExperiments('type', 'feature-analysis')
        .selectExperiment('Feature Analysis Example')
        .viewExperimentResults();

      cy.captureChartScreenshot('feature-analysis-chart', 'feature-analysis-results-chart');
    });
  });

  describe('Bias Detection Visual Testing', () => {
    it('should maintain consistent bias detection visualizations', () => {
      cy.logTestStep('Testing bias detection charts visual consistency');

      const biasDetectionPage = new BiasDetectionPage();

      biasDetectionPage
        .visit()
        .waitForPageLoad()
        .selectDataset('bias_test_dataset')
        .selectSensitiveAttributes(['gender', 'age_group'])
        .selectTargetVariable('loan_approved')
        .runBiasAnalysis()
        .waitForAnalysisCompletion();

      // Test bias visualization charts
      cy.waitForChart('[data-cy="disparity-chart"]');
      cy.captureChartScreenshot('disparity-chart', 'bias-disparity-chart');

      cy.waitForChart('[data-cy="distribution-chart"]');
      cy.captureChartScreenshot('distribution-chart', 'bias-distribution-chart');

      biasDetectionPage.verifyROCCurves();
      cy.captureChartScreenshot('roc-curve-chart', 'bias-roc-curves');

      biasDetectionPage.verifyCalibrationPlot();
      cy.captureChartScreenshot('calibration-chart', 'bias-calibration-plot');

      // Test intersectional analysis
      biasDetectionPage.runIntersectionalAnalysis();
      cy.captureChartScreenshot('intersectional-analysis-chart', 'bias-intersectional-analysis');
    });

    it('should visualize bias mitigation results consistently', () => {
      cy.logTestStep('Testing bias mitigation visualization');

      const biasDetectionPage = new BiasDetectionPage();

      biasDetectionPage
        .visit()
        .waitForPageLoad()
        .selectDataset('bias_mitigation_dataset')
        .selectSensitiveAttributes(['race'])
        .runBiasAnalysis()
        .waitForAnalysisCompletion()
        .applyPreprocessingMitigation()
        .waitForAnalysisCompletion();

      // Test before/after comparison
      cy.waitForChart('[data-cy="before-after-comparison"]');
      cy.captureChartScreenshot('before-after-comparison', 'bias-mitigation-comparison');

      // Test mitigation effectiveness
      cy.waitForChart('[data-cy="mitigation-effectiveness-chart"]');
      cy.captureChartScreenshot('mitigation-effectiveness-chart', 'bias-mitigation-effectiveness');
    });
  });

  describe('Interactive Chart Behaviors', () => {
    it('should maintain consistent tooltip appearances', () => {
      cy.logTestStep('Testing chart tooltip visual consistency');

      const dashboardPage = new DashboardPage();

      dashboardPage.visit().waitForPageLoad();

      // Test tooltips on different chart types
      cy.interactWithChart('performance-chart', 'hover', { x: 200, y: 100 });
      cy.get('[data-cy="chart-tooltip"]').should('be.visible');
      cy.captureChartScreenshot('performance-chart', 'chart-tooltip-line-chart');

      cy.interactWithChart('algorithm-distribution-chart', 'hover', { x: 150, y: 150 });
      cy.get('[data-cy="chart-tooltip"]').should('be.visible');
      cy.captureChartScreenshot('algorithm-distribution-chart', 'chart-tooltip-pie-chart');

      cy.interactWithChart('resource-usage-chart', 'hover', { x: 100, y: 200 });
      cy.get('[data-cy="chart-tooltip"]').should('be.visible');
      cy.captureChartScreenshot('resource-usage-chart', 'chart-tooltip-bar-chart');
    });

    it('should maintain consistent legend appearances', () => {
      cy.logTestStep('Testing chart legend visual consistency');

      const dashboardPage = new DashboardPage();

      dashboardPage.visit().waitForPageLoad();

      // Test different legend positions and styles
      cy.captureChartScreenshot('performance-chart', 'chart-legend-bottom');
      cy.captureChartScreenshot('trends-chart', 'chart-legend-right');
      cy.captureChartScreenshot('algorithm-distribution-chart', 'chart-legend-pie');

      // Test legend interactions
      cy.get('[data-cy="performance-chart"] .recharts-legend-item').first().click();
      cy.captureChartScreenshot('performance-chart', 'chart-legend-series-hidden');
    });

    it('should handle chart loading states visually', () => {
      cy.logTestStep('Testing chart loading state visuals');

      // Intercept with delay to capture loading state
      cy.intercept('GET', '/api/dashboard/metrics', {
        delay: 2000,
        fixture: 'dashboard-metrics.json'
      }).as('delayedMetrics');

      const dashboardPage = new DashboardPage();
      dashboardPage.visit();

      // Capture loading state
      cy.get('[data-cy="chart-loading-skeleton"]').should('be.visible');
      cy.captureChartScreenshot('dashboard-content', 'charts-loading-state');

      // Wait for charts to load and capture final state
      cy.waitForApiResponse('delayedMetrics');
      cy.waitForChart('[data-cy="performance-chart"]');
      cy.captureChartScreenshot('dashboard-content', 'charts-loaded-state');
    });
  });

  describe('Chart Error States Visual Testing', () => {
    it('should display consistent error states', () => {
      cy.logTestStep('Testing chart error state visuals');

      // Mock API error
      cy.intercept('GET', '/api/dashboard/metrics', {
        statusCode: 500,
        body: { error: 'Data unavailable' }
      }).as('chartError');

      const dashboardPage = new DashboardPage();
      dashboardPage.visit().waitForPageLoad();

      // Capture error state
      cy.get('[data-cy="chart-error-state"]').should('be.visible');
      cy.captureChartScreenshot('dashboard-content', 'charts-error-state');

      // Test retry functionality visual
      cy.get('[data-cy="retry-chart-data"]').click();
      cy.captureChartScreenshot('dashboard-content', 'charts-retry-loading');
    });

    it('should handle empty data states visually', () => {
      cy.logTestStep('Testing chart empty state visuals');

      // Mock empty data response
      cy.intercept('GET', '/api/dashboard/metrics', {
        body: {
          overview: { totalModels: 0, activeExperiments: 0 },
          charts: { accuracyTrend: [], algorithmDistribution: [] }
        }
      }).as('emptyData');

      const dashboardPage = new DashboardPage();
      dashboardPage.visit().waitForPageLoad();

      // Capture empty state
      cy.get('[data-cy="chart-empty-state"]').should('be.visible');
      cy.captureChartScreenshot('dashboard-content', 'charts-empty-state');
    });
  });

  describe('Chart Accessibility Visual Testing', () => {
    it('should maintain accessible color schemes', () => {
      cy.logTestStep('Testing chart accessibility colors');

      const dashboardPage = new DashboardPage();

      // Test high contrast mode
      cy.window().then((win) => {
        win.document.body.classList.add('high-contrast');
      });

      dashboardPage.visit().waitForPageLoad();
      cy.waitForChart('[data-cy="performance-chart"]');
      cy.captureChartScreenshot('performance-chart', 'chart-high-contrast');

      // Test colorblind-friendly palette
      cy.window().then((win) => {
        win.document.body.classList.remove('high-contrast');
        win.document.body.classList.add('colorblind-friendly');
      });

      cy.captureChartScreenshot('performance-chart', 'chart-colorblind-friendly');
    });

    it('should display focus indicators properly', () => {
      cy.logTestStep('Testing chart focus indicators');

      const dashboardPage = new DashboardPage();
      dashboardPage.visit().waitForPageLoad();

      // Test keyboard navigation focus
      cy.get('[data-cy="performance-chart"]').focus();
      cy.captureChartScreenshot('performance-chart', 'chart-focused');

      // Test interactive element focus
      cy.get('[data-cy="performance-chart"] .recharts-line-dot').first().focus();
      cy.captureChartScreenshot('performance-chart', 'chart-data-point-focused');
    });
  });
});