/// <reference types="cypress" />

/**
 * UX Test Suite: System Integration & End-to-End Workflows
 * Complete user journeys, cross-feature integration, and enterprise scenarios
 */

describe('UX: System Integration & End-to-End Workflows', () => {
  beforeEach(() => {
    cy.setupTestEnvironment('ml-models');
  });

  describe('Complete ML Model Lifecycle', () => {
    it('should support end-to-end model development workflow', () => {
      // Phase 1: Data Exploration
      cy.visit('/dataExplorer');
      cy.get('[data-cy="workflow-step-data"]').should('have.class', 'active');

      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/enterprise-dataset.csv');
      cy.get('[data-cy="data-preview-table"]', { timeout: 5000 }).should('be.visible');

      // Analyze data quality
      cy.get('[data-cy="quality-tab"]').click();
      cy.get('[data-cy="quality-score"]').should('be.visible');
      cy.get('[data-cy="data-issues"]').should('be.visible');

      // Apply preprocessing
      cy.get('[data-cy="preprocessing-tab"]').click();
      cy.get('[data-cy="apply-recommended-cleaning"]').click();
      cy.get('[data-cy="preprocessing-complete"]', { timeout: 10000 }).should('be.visible');

      // Export processed data for model building
      cy.get('[data-cy="proceed-to-modeling"]').click();

      // Phase 2: Model Building
      cy.url().should('include', '/modelBuilder');
      cy.get('[data-cy="workflow-step-modeling"]').should('have.class', 'active');

      // Data should be pre-loaded from previous step
      cy.get('[data-cy="data-preview"]').should('be.visible');
      cy.get('[data-cy="data-source"]').should('contain', 'enterprise-dataset');

      // Select target and features
      cy.muiStepperNavigate('next');
      cy.muiSelectOption('form-select-target-column', 'risk_score');
      cy.get('[data-cy="problem-type"]').should('contain', 'Classification');

      // Feature selection with statistical analysis
      cy.get('[data-cy="feature-analysis"]').should('be.visible');
      cy.get('[data-cy="auto-select-features"]').click();
      cy.get('[data-cy="selected-features-count"]').should('match', /\d+ features selected/);

      // Algorithm selection with recommendations
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="recommended-algorithms"]').should('be.visible');
      cy.get('[data-cy="algorithm-card-xgboost"]').click(); // Best for this dataset type

      // Hyperparameter optimization
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="enable-auto-tuning"]').click();
      cy.muiSelectOption('optimization-strategy', 'Bayesian');

      // Start training
      cy.muiClickButton('btn-start-training');
      cy.get('[data-cy="training-started"]').should('be.visible');

      // Monitor training progress
      cy.get('[data-cy="training-progress"]').should('be.visible');
      cy.waitForChart('[data-cy="training-metrics-chart"]');

      // Mock training completion
      cy.intercept('GET', '/api/models/*/status', {
        body: {
          status: 'completed',
          results: {
            accuracy: 0.924,
            precision: 0.889,
            recall: 0.945,
            f1Score: 0.916,
            modelId: 'model-enterprise-123'
          }
        }
      });

      cy.get('[data-cy="training-complete"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="model-performance"]').should('be.visible');

      // Phase 3: Model Evaluation
      cy.get('[data-cy="evaluate-model"]').click();
      cy.url().should('include', '/model-evaluation');

      // Comprehensive evaluation
      cy.get('[data-cy="evaluation-dashboard"]').should('be.visible');
      cy.waitForChart('[data-cy="confusion-matrix"]');
      cy.waitForChart('[data-cy="roc-curve"]');
      cy.waitForChart('[data-cy="feature-importance"]');

      // Bias detection analysis
      cy.get('[data-cy="run-bias-analysis"]').click();
      cy.get('[data-cy="bias-analysis-results"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="fairness-score"]').should('be.visible');

      // Phase 4: Model Deployment
      cy.get('[data-cy="deploy-model"]').click();
      cy.url().should('include', '/deployments');

      cy.get('[data-cy="deployment-wizard"]').should('be.visible');
      cy.muiSelectOption('deployment-environment', 'Production');
      cy.muiSelectOption('deployment-type', 'REST API');

      // Configure monitoring
      cy.get('[data-cy="enable-monitoring"]').check();
      cy.get('[data-cy="monitoring-config"]').should('be.visible');

      cy.muiClickButton('deploy-model');
      cy.get('[data-cy="deployment-started"]').should('be.visible');

      // Phase 5: Production Monitoring
      cy.get('[data-cy="view-monitoring"]').click();
      cy.url().should('include', '/real-time-monitoring');

      cy.get('[data-cy="production-model-dashboard"]').should('be.visible');
      cy.get('[data-cy="model-health-status"]').should('contain', 'Healthy');
      cy.get('[data-cy="live-metrics"]').should('be.visible');

      // Verify complete workflow tracking
      cy.get('[data-cy="workflow-progress"]').should('be.visible');
      cy.get('[data-cy="workflow-step-data"]').should('have.class', 'completed');
      cy.get('[data-cy="workflow-step-modeling"]').should('have.class', 'completed');
      cy.get('[data-cy="workflow-step-evaluation"]').should('have.class', 'completed');
      cy.get('[data-cy="workflow-step-deployment"]').should('have.class', 'completed');
      cy.get('[data-cy="workflow-step-monitoring"]').should('have.class', 'active');
    });

    it('should handle complex multi-model comparison workflow', () => {
      // Create multiple models for comparison
      const algorithms = ['random-forest', 'xgboost', 'neural-network'];
      const modelIds = [];

      algorithms.forEach((algorithm, index) => {
        cy.visit('/modelBuilder');
        cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/test-dataset.csv');

        // Quick setup for comparison testing
        cy.muiStepperNavigate('next');
        cy.muiSelectOption('form-select-target-column', 'performance_score');
        cy.muiStepperNavigate('next');
        cy.get(`[data-cy="algorithm-card-${algorithm}"]`).click();
        cy.muiStepperNavigate('next');

        // Save model configuration
        cy.muiTypeInTextField('model-name', `Comparison Model ${index + 1} (${algorithm})`);
        cy.muiClickButton('save-for-comparison');

        cy.get('[data-cy="model-saved-for-comparison"]').should('be.visible');
        cy.get('[data-cy="comparison-model-id"]').invoke('text').then(id => {
          modelIds.push(id);
        });
      });

      // Navigate to comparison interface
      cy.visit('/experiments/model-comparison');
      cy.get('[data-cy="model-comparison-dashboard"]').should('be.visible');

      // Select models for comparison
      modelIds.forEach(modelId => {
        cy.get('[data-cy="add-model-to-comparison"]').click();
        cy.muiSelectOption('model-selector', modelId);
        cy.muiClickButton('add-model');
      });

      cy.get('[data-cy="comparison-models"]').should('have.length', 3);

      // Run comparison analysis
      cy.muiClickButton('run-comparison');
      cy.get('[data-cy="comparison-progress"]').should('be.visible');

      // View comparison results
      cy.get('[data-cy="comparison-results"]', { timeout: 15000 }).should('be.visible');
      cy.waitForChart('[data-cy="model-performance-comparison"]');
      cy.waitForChart('[data-cy="metric-radar-chart"]');

      // Statistical significance testing
      cy.get('[data-cy="statistical-tests"]').should('be.visible');
      cy.get('[data-cy="significance-test-results"]').should('be.visible');

      // Select best model
      cy.get('[data-cy="model-recommendation"]').should('be.visible');
      cy.get('[data-cy="select-best-model"]').click();
      cy.get('[data-cy="model-selected-for-deployment"]').should('be.visible');
    });

    it('should support collaborative experiment workflow', () => {
      // Create shared experiment
      cy.visit('/experiments/create');
      cy.muiTypeInTextField('experiment-name', 'Team Collaboration Experiment');
      cy.muiSelectOption('experiment-type', 'Collaborative Model Development');
      cy.muiToggleSwitch('enable-collaboration', true);

      // Invite team members
      cy.get('[data-cy="invite-collaborators"]').click();
      cy.muiTypeInTextField('collaborator-emails', 'jane@company.com, bob@company.com');
      cy.muiClickButton('send-invitations');

      cy.get('[data-cy="invitations-sent"]').should('be.visible');

      // Setup experiment parameters
      cy.muiStepperNavigate('next');
      cy.dragAndDropFile('[data-cy="experiment-dataset"]', 'cypress/fixtures/team-dataset.csv');

      cy.muiStepperNavigate('next');
      cy.muiSelectOption('experiment-objective', 'Maximize Accuracy');
      cy.muiSelectChip('allowed-algorithms', 'random-forest');
      cy.muiSelectChip('allowed-algorithms', 'xgboost');
      cy.muiSelectChip('allowed-algorithms', 'neural-network');

      cy.muiClickButton('start-experiment');

      // Simulate collaborative work
      cy.get('[data-cy="collaboration-workspace"]').should('be.visible');
      cy.get('[data-cy="team-activity-feed"]').should('be.visible');

      // Mock team member activities
      cy.window().then((win) => {
        const mockWin = win as Window & {
          mockWebSocket?: {
            onmessage?: (event: MessageEvent) => void;
          };
        };
        if (mockWin.mockWebSocket?.onmessage) {
          mockWin.mockWebSocket.onmessage({
            data: JSON.stringify({
              type: 'collaborator_action',
              user: 'Jane Doe',
              action: 'started_model_training',
              algorithm: 'random-forest',
              timestamp: new Date().toISOString()
            })
          } as MessageEvent);
        }
      });

      cy.get('[data-cy="activity-jane-training"]').should('be.visible');

      // Contribute to experiment
      cy.get('[data-cy="my-contribution-section"]').should('be.visible');
      cy.get('[data-cy="start-my-model"]').click();
      cy.muiSelectOption('my-algorithm', 'xgboost');
      cy.muiClickButton('begin-training');

      // Monitor team progress
      cy.get('[data-cy="team-progress-dashboard"]').should('be.visible');
      cy.get('[data-cy="team-leaderboard"]').should('be.visible');
      cy.waitForChart('[data-cy="team-progress-chart"]');

      // Experiment completion and review
      cy.get('[data-cy="experiment-results"]', { timeout: 20000 }).should('be.visible');
      cy.get('[data-cy="team-best-model"]').should('be.visible');
      cy.get('[data-cy="contribution-summary"]').should('be.visible');
    });
  });

  describe('Cross-Feature Integration', () => {
    it('should integrate bias detection with model deployment pipeline', () => {
      // Start with model ready for deployment
      cy.visit('/models/model-123/deploy');
      cy.get('[data-cy="deployment-wizard"]').should('be.visible');

      // Mandatory bias check before deployment
      cy.get('[data-cy="bias-check-required"]').should('be.visible');
      cy.get('[data-cy="run-bias-analysis"]').click();

      // Bias analysis integration
      cy.get('[data-cy="bias-analysis-dialog"]').should('be.visible');
      cy.muiSelectChip('protected-attributes', 'gender');
      cy.muiSelectChip('protected-attributes', 'age');
      cy.muiSelectOption('fairness-threshold', 'strict');

      cy.muiClickButton('run-analysis');
      cy.get('[data-cy="bias-analysis-progress"]').should('be.visible');

      // Handle bias detection results
      cy.get('[data-cy="bias-results"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="bias-score"]').should('be.visible');

      // If bias detected, show mitigation options
      cy.get('[data-cy="bias-mitigation-required"]').should('be.visible');
      cy.get('[data-cy="apply-mitigation"]').click();
      cy.get('[data-cy="mitigation-strategy"]').should('be.visible');

      // After mitigation, continue deployment
      cy.get('[data-cy="mitigation-applied"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="deployment-approved"]').should('be.visible');

      cy.muiClickButton('proceed-with-deployment');
      cy.get('[data-cy="deployment-started"]').should('be.visible');

      // Verify bias monitoring in production
      cy.get('[data-cy="enable-bias-monitoring"]').should('be.checked');
      cy.get('[data-cy="bias-monitoring-config"]').should('be.visible');
    });

    it('should integrate data explorer findings with model builder', () => {
      // Data exploration phase
      cy.visit('/dataExplorer');
      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/complex-dataset.csv');

      // Discover data insights
      cy.get('[data-cy="insights-tab"]').click();
      cy.get('[data-cy="auto-insights"]').should('be.visible');
      cy.get('[data-cy="feature-correlations"]').should('be.visible');
      cy.get('[data-cy="outlier-detection"]').should('be.visible');

      // Save insights for model building
      cy.get('[data-cy="save-insights"]').click();
      cy.muiTypeInTextField('insights-name', 'Complex Dataset Analysis');
      cy.muiClickButton('save-insights');

      // Feature engineering recommendations
      cy.get('[data-cy="feature-engineering-tab"]').click();
      cy.get('[data-cy="recommended-transformations"]').should('be.visible');
      cy.get('[data-cy="apply-recommended-engineering"]').click();

      // Transfer to model builder with context
      cy.get('[data-cy="build-model-with-insights"]').click();
      cy.url().should('include', '/modelBuilder');

      // Verify insights integration
      cy.get('[data-cy="applied-insights"]').should('be.visible');
      cy.get('[data-cy="insights-summary"]').should('contain', 'Complex Dataset Analysis');

      // Pre-configured based on insights
      cy.get('[data-cy="recommended-target"]').should('be.visible');
      cy.get('[data-cy="pre-selected-features"]').should('be.visible');
      cy.get('[data-cy="suggested-algorithms"]').should('be.visible');

      // Model training with enhanced features
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="target-insights"]').should('be.visible');
      cy.muiSelectOption('form-select-target-column', 'recommended_target');

      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-insights"]').should('be.visible');
      cy.get('[data-cy="algorithm-card-recommended"]').should('have.class', 'recommended');
    });

    it('should integrate monitoring alerts with experiment tracking', () => {
      // Setup production model monitoring
      cy.visit('/real-time-monitoring/model-prod-456');
      cy.get('[data-cy="monitoring-dashboard"]').should('be.visible');

      // Configure performance degradation alert
      cy.get('[data-cy="alert-configuration"]').click();
      cy.muiSelectOption('alert-type', 'Performance Degradation');
      cy.muiInteractWithSlider('accuracy-threshold', 85);
      cy.muiToggleSwitch('auto-experiment-trigger', true);
      cy.muiClickButton('save-alert');

      // Simulate performance degradation
      cy.window().then((win) => {
        const mockWin = win as Window & {
          mockWebSocket?: {
            onmessage?: (event: MessageEvent) => void;
          };
        };
        if (mockWin.mockWebSocket?.onmessage) {
          mockWin.mockWebSocket.onmessage({
            data: JSON.stringify({
              type: 'performance_alert',
              modelId: 'model-prod-456',
              alert: 'accuracy_degradation',
              currentAccuracy: 82.3,
              threshold: 85,
              severity: 'high'
            })
          } as MessageEvent);
        }
      });

      // Alert triggered
      cy.get('[data-cy="performance-alert"]').should('be.visible');
      cy.get('[data-cy="alert-accuracy-drop"]').should('be.visible');

      // Auto-experiment creation
      cy.get('[data-cy="auto-experiment-triggered"]').should('be.visible');
      cy.get('[data-cy="experiment-creation-notification"]').should('be.visible');

      // Navigate to created experiment
      cy.get('[data-cy="view-triggered-experiment"]').click();
      cy.url().should('include', '/experiments/auto-');

      // Verify experiment setup
      cy.get('[data-cy="auto-experiment-dashboard"]').should('be.visible');
      cy.get('[data-cy="trigger-cause"]').should('contain', 'Performance Degradation');
      cy.get('[data-cy="baseline-model"]').should('contain', 'model-prod-456');

      // A/B testing setup
      cy.get('[data-cy="ab-test-config"]').should('be.visible');
      cy.get('[data-cy="challenger-models"]').should('be.visible');
      cy.get('[data-cy="traffic-allocation"]').should('be.visible');

      // Monitor experiment results
      cy.muiClickButton('start-ab-test');
      cy.get('[data-cy="ab-test-monitoring"]').should('be.visible');
      cy.waitForChart('[data-cy="ab-test-metrics"]');

      // Integration with model lifecycle
      cy.get('[data-cy="model-lifecycle-tracking"]').should('be.visible');
      cy.get('[data-cy="lifecycle-events"]').should('contain', 'Alert Triggered');
      cy.get('[data-cy="lifecycle-events"]').should('contain', 'Experiment Created');
    });
  });

  describe('Enterprise Security Integration', () => {
    it('should enforce security policies throughout ML workflow', () => {
      // Navigate to login (simplified for no-auth setup)
      cy.visit('/dashboard');

      // Data upload with security scanning
      cy.visit('/dataExplorer');
      cy.get('[data-cy="security-notice"]').should('be.visible');

      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/sensitive-dataset.csv');

      // Security scan triggered
      cy.get('[data-cy="security-scan-progress"]').should('be.visible');
      cy.get('[data-cy="pii-detection"]').should('be.visible');

      // PII detected - require approval
      cy.get('[data-cy="pii-detected-warning"]').should('be.visible');
      cy.get('[data-cy="data-governance-approval"]').should('be.visible');

      // Mock security approval
      cy.intercept('POST', '/api/security/approve-dataset', {
        body: { approved: true, conditions: ['mask_pii', 'audit_access'] }
      });

      cy.get('[data-cy="request-approval"]').click();
      cy.get('[data-cy="approval-pending"]').should('be.visible');

      // Approval granted with conditions
      cy.get('[data-cy="approval-granted"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-cy="security-conditions"]').should('be.visible');
      cy.get('[data-cy="condition-mask-pii"]').should('be.visible');

      // Model training with security constraints
      cy.get('[data-cy="proceed-with-conditions"]').click();
      cy.url().should('include', '/modelBuilder');

      cy.get('[data-cy="security-constraints"]').should('be.visible');
      cy.get('[data-cy="pii-masking-applied"]').should('be.visible');

      // Audit trail tracking
      cy.get('[data-cy="audit-trail"]').should('be.visible');
      cy.get('[data-cy="access-logged"]').should('be.visible');

      // Model deployment with security review
      cy.muiStepperNavigate('next');
      cy.muiSelectOption('form-select-target-column', 'risk_category');
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-card-random-forest"]').click();
      cy.muiStepperNavigate('next');
      cy.muiClickButton('btn-start-training');

      cy.get('[data-cy="training-complete"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="deploy-model"]').click();

      // Security review required for deployment
      cy.get('[data-cy="security-review-required"]').should('be.visible');
      cy.get('[data-cy="model-security-scan"]').should('be.visible');

      // Security compliance check
      cy.get('[data-cy="compliance-verification"]').should('be.visible');
      cy.get('[data-cy="gdpr-compliance"]').should('be.checked');
      cy.get('[data-cy="sox-compliance"]').should('be.checked');

      cy.muiClickButton('submit-for-security-review');
      cy.get('[data-cy="security-review-submitted"]').should('be.visible');
    });

    it('should handle role-based access control across features', () => {
      // Navigate as data scientist (simplified for no-auth setup)
      cy.visit('/dashboard');

      // Access allowed features
      cy.visit('/dataExplorer');
      cy.get('[data-cy="data-explorer-content"]').should('be.visible');

      cy.visit('/modelBuilder');
      cy.get('[data-cy="model-builder-content"]').should('be.visible');

      // Restricted access to sensitive features
      cy.visit('/admin/user-management');
      cy.get('[data-cy="access-denied"]').should('be.visible');
      cy.get('[data-cy="insufficient-permissions"]').should('be.visible');

      // Feature-level restrictions
      cy.visit('/modelBuilder');
      cy.get('[data-cy="production-deployment"]').should('not.exist');
      cy.get('[data-cy="staging-deployment-only"]').should('be.visible');

      // Navigate as ML engineer (simplified for no-auth setup)
      cy.visit('/dashboard');

      // Access to deployment features
      cy.visit('/deployments');
      cy.get('[data-cy="deployment-dashboard"]').should('be.visible');
      cy.get('[data-cy="production-controls"]').should('be.visible');

      // Navigate as admin (simplified for no-auth setup)
      cy.visit('/dashboard');

      // Full access to all features
      cy.visit('/admin/user-management');
      cy.get('[data-cy="user-management-dashboard"]').should('be.visible');

      cy.visit('/admin/system-settings');
      cy.get('[data-cy="system-configuration"]').should('be.visible');

      // Role-based UI customization
      cy.visit('/dashboard');
      cy.get('[data-cy="admin-widgets"]').should('be.visible');
      cy.get('[data-cy="system-health-widget"]').should('be.visible');
      cy.get('[data-cy="user-activity-widget"]').should('be.visible');
    });
  });

  describe('Performance at Scale Integration', () => {
    it('should handle enterprise-scale data processing workflows', () => {
      // Large dataset processing
      cy.visit('/dataExplorer');

      // Mock enterprise dataset (1M+ rows)
      cy.intercept('POST', '/api/datasets/upload-large', {
        statusCode: 202,
        body: { uploadId: 'enterprise-upload-123', estimatedTime: '15 minutes' }
      });

      cy.dragAndDropFile('[data-cy="form-upload-dropzone"]', 'cypress/fixtures/enterprise-large-dataset.csv');

      // Distributed processing notification
      cy.get('[data-cy="distributed-processing"]').should('be.visible');
      cy.get('[data-cy="cluster-allocation"]').should('be.visible');
      cy.get('[data-cy="processing-nodes"]').should('contain', '8 nodes');

      // Progress monitoring for large dataset
      cy.get('[data-cy="large-dataset-progress"]').should('be.visible');
      cy.get('[data-cy="estimated-completion"]').should('contain', '15 minutes');

      // Chunk-based preview loading
      cy.get('[data-cy="preview-chunk-1"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="total-chunks"]').should('be.visible');

      // Model training at scale
      cy.get('[data-cy="scale-to-modeling"]').click();
      cy.url().should('include', '/modelBuilder');

      // Auto-scaling configuration
      cy.get('[data-cy="auto-scaling-options"]').should('be.visible');
      cy.muiSelectOption('compute-tier', 'Enterprise');
      cy.muiInteractWithSlider('max-nodes', 16);

      // Distributed training setup
      cy.muiStepperNavigate('next');
      cy.muiSelectOption('form-select-target-column', 'outcome');
      cy.muiStepperNavigate('next');
      cy.get('[data-cy="algorithm-card-distributed-xgboost"]').click();
      cy.muiStepperNavigate('next');

      cy.get('[data-cy="distributed-training-config"]').should('be.visible');
      cy.muiToggleSwitch('enable-distributed-training', true);
      cy.muiSelectOption('parallelization-strategy', 'Data Parallel');

      cy.muiClickButton('btn-start-distributed-training');

      // Monitor distributed training
      cy.get('[data-cy="distributed-training-dashboard"]').should('be.visible');
      cy.get('[data-cy="node-status-grid"]').should('be.visible');
      cy.waitForChart('[data-cy="cluster-utilization"]');
      cy.waitForChart('[data-cy="training-efficiency"]');

      // Performance optimization suggestions
      cy.get('[data-cy="optimization-suggestions"]').should('be.visible');
      cy.get('[data-cy="resource-recommendations"]').should('be.visible');
    });

    it('should support multi-tenant isolation and resource management', () => {
      // Navigate as tenant A user (simplified for no-auth setup)
      cy.visit('/dashboard');

      // Tenant-specific dashboard
      cy.visit('/dashboard');
      cy.get('[data-cy="tenant-context"]').should('contain', 'Tenant A');
      cy.get('[data-cy="tenant-resources"]').should('be.visible');
      cy.get('[data-cy="resource-quota"]').should('be.visible');

      // Tenant-isolated data
      cy.visit('/dataExplorer');
      cy.get('[data-cy="tenant-datasets"]').should('be.visible');
      cy.get('[data-cy="dataset-isolation-indicator"]').should('be.visible');

      // Resource consumption monitoring
      cy.get('[data-cy="tenant-usage-metrics"]').should('be.visible');
      cy.get('[data-cy="compute-usage"]').should('be.visible');
      cy.get('[data-cy="storage-usage"]').should('be.visible');

      // Cross-tenant isolation verification
      cy.intercept('GET', '/api/datasets', {
        body: { datasets: [], message: 'No cross-tenant access' }
      });

      // Attempt to access tenant B data should fail
      cy.request({
        url: '/api/tenants/tenant-b/datasets',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.equal(403);
      });

      // Switch to tenant B context (simplified for no-auth setup)
      cy.visit('/dashboard');

      cy.visit('/dashboard');
      cy.get('[data-cy="tenant-context"]').should('contain', 'Tenant B');

      // Different resource allocations
      cy.get('[data-cy="tenant-plan"]').should('contain', 'Enterprise');
      cy.get('[data-cy="resource-limits"]').should('be.visible');

      // Tenant-specific customizations
      cy.get('[data-cy="tenant-branding"]').should('be.visible');
      cy.get('[data-cy="custom-workflows"]').should('be.visible');
    });
  });
});
