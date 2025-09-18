/// <reference types="cypress" />

/**
 * UX Test Suite: Bias Detection & Analysis Engine
 * Bias analysis workflow, fairness metrics, and mitigation recommendations
 */

describe('UX: Bias Detection & Analysis Engine', () => {
  beforeEach(() => {
    cy.setupTestEnvironment('ml-models');
    cy.visit('/bias-detection-engine');
  });

  describe('Bias Analysis Workflow', () => {
    it('should execute comprehensive bias detection analysis', () => {
      // Test initial bias detection interface
      cy.get('[data-cy="bias-analysis-dashboard"]').should('be.visible');
      cy.get('[data-cy="analyze-model"]').should('be.visible');
      cy.get('[data-cy="bias-intro-text"]').should('contain', 'fairness');

      // Start bias analysis
      cy.muiClickButton('analyze-model');
      cy.get('[data-cy="analysis-dialog"]').should('be.visible');

      // Test model selection
      cy.get('[data-cy="model-selector"]').should('be.visible');
      cy.muiSelectOption('model-selector', 'Hiring Decision Model');
      cy.get('[data-cy="model-preview"]').should('be.visible');
      cy.get('[data-cy="model-metrics-preview"]').should('contain', 'Accuracy');

      // Test protected attributes configuration
      cy.get('[data-cy="protected-attributes"]').should('be.visible');
      cy.muiSelectChip('protected-attributes', 'gender');
      cy.muiSelectChip('protected-attributes', 'age');
      cy.muiSelectChip('protected-attributes', 'race');

      // Verify selection feedback
      cy.get('[data-cy="selected-attributes-count"]').should('contain', '3');
      cy.get('[data-cy="attribute-preview"]').should('be.visible');

      // Test sensitivity level configuration
      cy.get('[data-cy="sensitivity-section"]').should('be.visible');
      cy.muiSelectOption('sensitivity-level', 'high');
      cy.get('[data-cy="sensitivity-explanation"]').should('be.visible');

      // Configure analysis options
      cy.get('[data-cy="analysis-options"]').should('be.visible');
      cy.muiToggleSwitch('include-intersectional', true);
      cy.muiToggleSwitch('generate-report', true);
      cy.muiSelectOption('report-format', 'comprehensive');

      // Start analysis
      cy.muiClickButton('start-analysis');
      cy.get('[data-cy="analysis-started"]').should('be.visible');
      cy.get('[data-cy="analysis-dialog"]').should('not.exist');
    });

    it('should monitor bias analysis progress effectively', () => {
      // Mock analysis in progress
      cy.intercept('POST', '/api/bias-analysis/start', {
        statusCode: 202,
        body: { analysisId: 'analysis-123' }
      }).as('startAnalysis');

      cy.intercept('GET', '/api/bias-analysis/analysis-123/status', {
        body: {
          status: 'running',
          progress: 35,
          stage: 'Calculating fairness metrics',
          metrics: {
            demographic_parity: 0.73,
            equal_opportunity: 0.81
          }
        }
      }).as('analysisProgress');

      // Start analysis
      cy.muiClickButton('analyze-model');
      cy.muiSelectOption('model-selector', 'Hiring Decision Model');
      cy.muiSelectChip('protected-attributes', 'gender');
      cy.muiClickButton('start-analysis');

      cy.wait('@startAnalysis');

      // Test progress monitoring
      cy.get('[data-cy="analysis-progress"]').should('be.visible');
      cy.get('[data-cy="progress-bar"]').should('have.attr', 'aria-valuenow', '35');
      cy.get('[data-cy="current-stage"]').should('contain', 'fairness metrics');

      // Test intermediate results display
      cy.wait('@analysisProgress');
      cy.get('[data-cy="intermediate-metrics"]').should('be.visible');
      cy.get('[data-cy="metric-demographic-parity"]').should('contain', '0.73');
      cy.get('[data-cy="metric-equal-opportunity"]').should('contain', '0.81');

      // Test analysis cancellation
      cy.get('[data-cy="cancel-analysis"]').should('be.visible');
      cy.get('[data-cy="pause-analysis"]').should('be.visible');
    });

    it('should display comprehensive bias analysis results', () => {
      // Mock completed analysis
      cy.intercept('GET', '/api/bias-analysis/analysis-123/results', {
        fixture: 'bias-analysis-results.json'
      }).as('analysisResults');

      cy.visit('/bias-detection-engine/results/analysis-123');
      cy.wait('@analysisResults');

      // Test results overview
      cy.get('[data-cy="analysis-complete"]').should('be.visible');
      cy.get('[data-cy="overall-bias-score"]').should('be.visible');
      cy.get('[data-cy="bias-score-gauge"]').should('be.visible');

      // Test fairness metrics dashboard
      cy.get('[data-cy="fairness-metrics"]').should('be.visible');
      cy.get('[data-cy="metric-card-demographic-parity"]').should('be.visible');
      cy.get('[data-cy="metric-card-equal-opportunity"]').should('be.visible');
      cy.get('[data-cy="metric-card-equalized-odds"]').should('be.visible');

      // Test bias visualization
      cy.waitForChart('[data-cy="bias-visualization"]');
      cy.get('[data-cy="bias-heatmap"]').should('be.visible');
      cy.interactWithChart('bias-heatmap', 'hover', { x: 100, y: 100 });
      cy.verifyChartTooltip('Bias Score:');

      // Test group comparison
      cy.get('[data-cy="group-comparison"]').should('be.visible');
      cy.waitForChart('[data-cy="group-comparison-chart"]');
      cy.get('[data-cy="comparison-table"]').should('be.visible');
    });
  });

  describe('Fairness Metrics Analysis', () => {
    beforeEach(() => {
      cy.visit('/bias-detection-engine/results/analysis-123');
      cy.intercept('GET', '/api/bias-analysis/analysis-123/results', {
        fixture: 'bias-analysis-results.json'
      });
    });

    it('should provide detailed fairness metric explanations', () => {
      // Test demographic parity analysis
      cy.get('[data-cy="metric-card-demographic-parity"]').click();
      cy.get('[data-cy="metric-detail-modal"]').should('be.visible');

      cy.get('[data-cy="metric-definition"]').should('be.visible');
      cy.get('[data-cy="metric-formula"]').should('be.visible');
      cy.get('[data-cy="metric-interpretation"]').should('be.visible');

      // Test metric visualization
      cy.waitForChart('[data-cy="metric-breakdown-chart"]');
      cy.get('[data-cy="threshold-visualization"]').should('be.visible');

      // Test group-specific analysis
      cy.get('[data-cy="group-analysis"]').should('be.visible');
      cy.get('[data-cy="group-gender-male"]').should('be.visible');
      cy.get('[data-cy="group-gender-female"]').should('be.visible');

      cy.muiCloseDialog();

      // Test equal opportunity analysis
      cy.get('[data-cy="metric-card-equal-opportunity"]').click();
      cy.get('[data-cy="metric-detail-modal"]').should('be.visible');
      cy.get('[data-cy="true-positive-rates"]').should('be.visible');
      cy.waitForChart('[data-cy="tpr-comparison"]');
    });

    it('should enable interactive bias exploration', () => {
      // Test attribute filtering
      cy.get('[data-cy="attribute-filter"]').should('be.visible');
      cy.muiSelectOption('filter-attribute', 'age');
      cy.get('[data-cy="age-groups"]').should('be.visible');

      // Test intersectional analysis
      cy.get('[data-cy="intersectional-tab"]').click();
      cy.get('[data-cy="intersection-selector"]').should('be.visible');
      cy.muiSelectOption('intersection-primary', 'gender');
      cy.muiSelectOption('intersection-secondary', 'race');

      cy.waitForChart('[data-cy="intersectional-heatmap"]');
      cy.get('[data-cy="intersection-metrics"]').should('be.visible');

      // Test threshold adjustment
      cy.get('[data-cy="threshold-controls"]').should('be.visible');
      cy.muiInteractWithSlider('bias-threshold', 0.1);
      cy.get('[data-cy="threshold-impact"]').should('be.visible');

      // Test what-if analysis
      cy.get('[data-cy="what-if-section"]').should('be.visible');
      cy.muiInteractWithSlider('decision-threshold', 0.7);
      cy.get('[data-cy="threshold-preview"]').should('be.visible');
      cy.waitForChart('[data-cy="threshold-impact-chart"]');
    });

    it('should compare multiple fairness metrics simultaneously', () => {
      // Test metrics comparison view
      cy.get('[data-cy="compare-metrics"]').click();
      cy.get('[data-cy="metrics-comparison-table"]').should('be.visible');

      // Test radar chart comparison
      cy.waitForChart('[data-cy="metrics-radar-chart"]');
      cy.get('[data-cy="radar-legend"]').should('be.visible');

      // Test metric correlations
      cy.get('[data-cy="correlation-analysis"]').should('be.visible');
      cy.waitForChart('[data-cy="metric-correlation-heatmap"]');

      // Test trade-off analysis
      cy.get('[data-cy="trade-off-section"]').should('be.visible');
      cy.waitForChart('[data-cy="pareto-frontier"]');
      cy.get('[data-cy="trade-off-explanation"]').should('be.visible');

      // Test benchmark comparison
      cy.get('[data-cy="benchmark-comparison"]').should('be.visible');
      cy.get('[data-cy="industry-standards"]').should('be.visible');
      cy.get('[data-cy="compliance-status"]').should('be.visible');
    });
  });

  describe('Mitigation Recommendations', () => {
    beforeEach(() => {
      cy.visit('/bias-detection-engine/mitigation/analysis-123');
    });

    it('should provide actionable bias mitigation guidance', () => {
      // Test recommendations overview
      cy.get('[data-cy="mitigation-recommendations"]').should('be.visible');
      cy.get('[data-cy="recommendations-summary"]').should('be.visible');

      // Test priority-based recommendations
      cy.get('[data-cy="high-priority-recommendations"]').should('be.visible');
      cy.get('[data-cy="recommendation-card"]').should('have.length.greaterThan', 0);

      // Test recommendation details
      cy.get('[data-cy="recommendation-card-0"]').click();
      cy.get('[data-cy="recommendation-detail"]').should('be.visible');
      cy.get('[data-cy="implementation-steps"]').should('be.visible');
      cy.get('[data-cy="expected-impact"]').should('be.visible');
      cy.get('[data-cy="implementation-complexity"]').should('be.visible');

      // Test implementation guidance
      cy.get('[data-cy="implementation-tab"]').click();
      cy.get('[data-cy="code-examples"]').should('be.visible');
      cy.get('[data-cy="step-by-step-guide"]').should('be.visible');

      // Test impact prediction
      cy.get('[data-cy="impact-prediction"]').should('be.visible');
      cy.waitForChart('[data-cy="predicted-improvement"]');
      cy.get('[data-cy="confidence-interval"]').should('be.visible');
    });

    it('should enable mitigation strategy simulation', () => {
      // Test strategy selection
      cy.get('[data-cy="mitigation-strategies"]').should('be.visible');
      cy.get('[data-cy="strategy-preprocessing"]').click();
      cy.get('[data-cy="strategy-inprocessing"]').click();

      // Test preprocessing options
      cy.get('[data-cy="preprocessing-options"]').should('be.visible');
      cy.muiSelectOption('resampling-method', 'SMOTE');
      cy.muiToggleSwitch('feature-selection', true);

      // Test in-processing options
      cy.get('[data-cy="inprocessing-options"]').should('be.visible');
      cy.muiSelectOption('fairness-constraint', 'Demographic Parity');
      cy.muiInteractWithSlider('fairness-weight', 0.3);

      // Test simulation
      cy.muiClickButton('simulate-mitigation');
      cy.get('[data-cy="simulation-progress"]').should('be.visible');

      // Test simulation results
      cy.get('[data-cy="simulation-results"]', { timeout: 10000 }).should('be.visible');
      cy.waitForChart('[data-cy="before-after-comparison"]');
      cy.get('[data-cy="improvement-metrics"]').should('be.visible');

      // Test performance trade-offs
      cy.get('[data-cy="performance-trade-offs"]').should('be.visible');
      cy.waitForChart('[data-cy="accuracy-fairness-trade-off"]');
    });

    it('should track mitigation implementation progress', () => {
      // Test implementation checklist
      cy.get('[data-cy="implementation-checklist"]').should('be.visible');
      cy.get('[data-cy="checklist-item"]').should('have.length.greaterThan', 0);

      // Test progress tracking
      cy.get('[data-cy="checklist-item-0"] input[type="checkbox"]').check();
      cy.get('[data-cy="progress-bar"]').should('have.attr', 'aria-valuenow');
      cy.get('[data-cy="completion-percentage"]').should('match', /\d+%/);

      // Test validation testing
      cy.get('[data-cy="validation-section"]').should('be.visible');
      cy.muiClickButton('run-validation-tests');
      cy.get('[data-cy="validation-progress"]').should('be.visible');

      // Test results verification
      cy.get('[data-cy="validation-results"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="bias-reduction-verified"]').should('be.visible');
      cy.waitForChart('[data-cy="validation-metrics"]');

      // Test compliance reporting
      cy.get('[data-cy="compliance-report"]').should('be.visible');
      cy.muiClickButton('generate-compliance-report');
      cy.get('[data-cy="report-generation"]').should('be.visible');
    });
  });

  describe('Bias Report Generation', () => {
    beforeEach(() => {
      cy.visit('/bias-detection-engine/report/analysis-123');
    });

    it('should generate comprehensive bias analysis reports', () => {
      // Test report customization
      cy.get('[data-cy="report-customization"]').should('be.visible');
      cy.muiSelectOption('report-template', 'Executive Summary');
      cy.muiSelectOption('detail-level', 'Comprehensive');
      cy.muiToggleSwitch('include-visualizations', true);
      cy.muiToggleSwitch('include-recommendations', true);

      // Test section selection
      cy.get('[data-cy="report-sections"]').should('be.visible');
      cy.get('[data-cy="section-overview"]').should('be.checked');
      cy.get('[data-cy="section-methodology"]').should('be.checked');
      cy.get('[data-cy="section-findings"]').should('be.checked');

      // Test stakeholder customization
      cy.get('[data-cy="stakeholder-options"]').should('be.visible');
      cy.muiSelectOption('target-audience', 'Technical Team');
      cy.muiSelectOption('compliance-framework', 'GDPR');

      // Generate report
      cy.muiClickButton('generate-report');
      cy.get('[data-cy="report-generation-progress"]').should('be.visible');
    });

    it('should provide multiple report formats and delivery options', () => {
      // Test format selection
      cy.get('[data-cy="output-formats"]').should('be.visible');
      cy.get('[data-cy="format-pdf"]').click();
      cy.get('[data-cy="format-html"]').click();
      cy.get('[data-cy="format-docx"]').click();

      // Test delivery options
      cy.get('[data-cy="delivery-options"]').should('be.visible');
      cy.muiTypeInTextField('email-recipients', 'team@company.com');
      cy.muiToggleSwitch('schedule-delivery', true);
      cy.muiSelectDatePicker('delivery-date', '2024-12-31');

      // Test report preview
      cy.muiClickButton('preview-report');
      cy.get('[data-cy="report-preview"]').should('be.visible');
      cy.get('[data-cy="preview-content"]').should('be.visible');

      // Test report sharing
      cy.get('[data-cy="share-options"]').should('be.visible');
      cy.muiClickButton('generate-share-link');
      cy.get('[data-cy="share-link"]').should('be.visible');
      cy.get('[data-cy="copy-link"]').click();
      cy.get('[data-cy="link-copied"]').should('be.visible');
    });

    it('should enable compliance documentation generation', () => {
      // Test compliance template selection
      cy.get('[data-cy="compliance-templates"]').should('be.visible');
      cy.muiSelectOption('compliance-standard', 'EU AI Act');
      cy.get('[data-cy="template-requirements"]').should('be.visible');

      // Test automated compliance checking
      cy.muiClickButton('check-compliance');
      cy.get('[data-cy="compliance-check-progress"]').should('be.visible');

      // Test compliance results
      cy.get('[data-cy="compliance-results"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="compliance-score"]').should('be.visible');
      cy.get('[data-cy="compliance-gaps"]').should('be.visible');

      // Test audit trail generation
      cy.get('[data-cy="audit-trail-section"]').should('be.visible');
      cy.muiClickButton('generate-audit-trail');
      cy.get('[data-cy="audit-events"]').should('be.visible');
      cy.get('[data-cy="audit-timeline"]').should('be.visible');

      // Test certification support
      cy.get('[data-cy="certification-support"]').should('be.visible');
      cy.muiClickButton('prepare-certification-package');
      cy.get('[data-cy="certification-checklist"]').should('be.visible');
    });
  });

  describe('Responsive Bias Detection Interface', () => {
    it('should provide optimal mobile bias analysis experience', () => {
      cy.viewport(375, 667);

      // Test mobile dashboard
      cy.get('[data-cy="mobile-bias-dashboard"]').should('be.visible');
      cy.get('[data-cy="mobile-analyze-button"]').should('be.visible');

      // Test mobile analysis configuration
      cy.muiClickButton('analyze-model');
      cy.get('[data-cy="mobile-analysis-stepper"]').should('be.visible');

      // Test mobile model selection
      cy.get('[data-cy="mobile-model-selector"]').should('be.visible');
      cy.muiSelectOption('model-selector', 'Hiring Decision Model');

      // Test mobile attribute selection
      cy.get('[data-cy="mobile-attributes-grid"]').should('be.visible');
      cy.get('[data-cy="attribute-chip-gender"]').click();
      cy.get('[data-cy="attribute-chip-age"]').click();

      // Test mobile results view
      cy.visit('/bias-detection-engine/results/analysis-123');
      cy.get('[data-cy="mobile-results-tabs"]').should('be.visible');
      cy.get('[data-cy="mobile-metric-cards"]').should('be.visible');

      // Test swipe navigation
      cy.get('[data-cy="metric-card-0"]').trigger('swipeleft');
      cy.get('[data-cy="metric-card-1"]').should('be.visible');
    });

    it('should adapt bias visualizations for tablet devices', () => {
      cy.viewport(768, 1024);

      cy.visit('/bias-detection-engine/results/analysis-123');

      // Test tablet layout
      cy.get('[data-cy="tablet-bias-layout"]').should('be.visible');
      cy.get('[data-cy="bias-visualization-grid"]').should('be.visible');

      // Test tablet chart interactions
      cy.waitForChart('[data-cy="bias-heatmap"]');
      cy.get('[data-cy="bias-heatmap"]')
        .trigger('touchstart', { touches: [{ clientX: 200, clientY: 200 }] })
        .trigger('touchmove', { touches: [{ clientX: 250, clientY: 250 }] });

      cy.get('[data-cy="chart-tooltip"]').should('be.visible');

      // Test tablet recommendations interface
      cy.get('[data-cy="mitigation-tab"]').click();
      cy.get('[data-cy="tablet-recommendations"]').should('be.visible');
      cy.get('[data-cy="recommendation-carousel"]').should('be.visible');
    });
  });
});