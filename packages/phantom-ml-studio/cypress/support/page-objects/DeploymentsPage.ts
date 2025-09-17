/// <reference types="cypress" />
import { BasePage } from './BasePage';

/**
 * Deployments Page Object Model - Model deployment and management
 */
export class DeploymentsPage extends BasePage {
  constructor() {
    super('/deployments', '[data-cy="deployments-content"]');
  }

  // Selectors
  private readonly selectors = {
    // Deployment Creation
    deployModelButton: '[data-cy="deploy-model-button"]',
    modelSelectDropdown: '[data-cy="model-select-dropdown"]',
    deploymentNameInput: '[data-cy="deployment-name-input"]',
    deploymentDescriptionInput: '[data-cy="deployment-description-input"]',
    environmentSelect: '[data-cy="environment-select"]',
    versionSelect: '[data-cy="version-select"]',

    // Infrastructure Configuration
    infrastructurePanel: '[data-cy="infrastructure-panel"]',
    instanceTypeSelect: '[data-cy="instance-type-select"]',
    minInstancesInput: '[data-cy="min-instances-input"]',
    maxInstancesInput: '[data-cy="max-instances-input"]',
    autoScalingToggle: '[data-cy="auto-scaling-toggle"]',
    cpuThresholdInput: '[data-cy="cpu-threshold-input"]',
    memoryThresholdInput: '[data-cy="memory-threshold-input"]',
    loadBalancerToggle: '[data-cy="load-balancer-toggle"]',

    // Container Configuration
    containerPanel: '[data-cy="container-panel"]',
    dockerImageInput: '[data-cy="docker-image-input"]',
    resourceLimitsPanel: '[data-cy="resource-limits-panel"]',
    cpuLimitInput: '[data-cy="cpu-limit-input"]',
    memoryLimitInput: '[data-cy="memory-limit-input"]',
    environmentVariables: '[data-cy="environment-variables"]',
    addEnvVarButton: '[data-cy="add-env-var-button"]',

    // API Configuration
    apiConfigPanel: '[data-cy="api-config-panel"]',
    endpointNameInput: '[data-cy="endpoint-name-input"]',
    apiVersionInput: '[data-cy="api-version-input"]',
    authenticationToggle: '[data-cy="authentication-toggle"]',
    rateLimitingToggle: '[data-cy="rate-limiting-toggle"]',
    requestsPerMinuteInput: '[data-cy="requests-per-minute-input"]',
    timeoutInput: '[data-cy="timeout-input"]',

    // Security Configuration
    securityPanel: '[data-cy="security-panel"]',
    httpsOnlyToggle: '[data-cy="https-only-toggle"]',
    corsConfigToggle: '[data-cy="cors-config-toggle"]',
    allowedOriginsInput: '[data-cy="allowed-origins-input"]',
    accessControlPanel: '[data-cy="access-control-panel"]',
    apiKeyAuthToggle: '[data-cy="api-key-auth-toggle"]',
    jwtAuthToggle: '[data-cy="jwt-auth-toggle"]',

    // Deployment Execution
    deployButton: '[data-cy="deploy-button"]',
    deploymentProgress: '[data-cy="deployment-progress"]',
    deploymentLogs: '[data-cy="deployment-logs"]',
    deploymentStatus: '[data-cy="deployment-status"]',
    estimatedDeploymentTime: '[data-cy="estimated-deployment-time"]',

    // Deployments List
    deploymentsTable: '[data-cy="deployments-table"]',
    deploymentRow: '[data-cy^="deployment-row-"]',
    statusBadge: '[data-cy^="status-badge-"]',
    healthIndicator: '[data-cy^="health-indicator-"]',
    actionsMenu: '[data-cy^="actions-menu-"]',

    // Deployment Details
    deploymentDetailsPanel: '[data-cy="deployment-details-panel"]',
    overviewTab: '[data-cy="overview-tab"]',
    metricsTab: '[data-cy="metrics-tab"]',
    logsTab: '[data-cy="logs-tab"]',
    settingsTab: '[data-cy="settings-tab"]',

    // Monitoring and Metrics
    metricsPanel: '[data-cy="metrics-panel"]',
    requestVolumeChart: '[data-cy="request-volume-chart"]',
    responseTimeChart: '[data-cy="response-time-chart"]',
    errorRateChart: '[data-cy="error-rate-chart"]',
    throughputChart: '[data-cy="throughput-chart"]',
    cpuUsageChart: '[data-cy="cpu-usage-chart"]',
    memoryUsageChart: '[data-cy="memory-usage-chart"]',

    // Performance Metrics
    performanceMetrics: '[data-cy="performance-metrics"]',
    averageResponseTime: '[data-cy="average-response-time"]',
    requestsPerSecond: '[data-cy="requests-per-second"]',
    errorRate: '[data-cy="error-rate"]',
    uptime: '[data-cy="uptime"]',
    lastHealthCheck: '[data-cy="last-health-check"]',

    // Alerts and Notifications
    alertsPanel: '[data-cy="alerts-panel"]',
    createAlertButton: '[data-cy="create-alert-button"]',
    alertTypeSelect: '[data-cy="alert-type-select"]',
    alertThresholdInput: '[data-cy="alert-threshold-input"]',
    notificationChannelSelect: '[data-cy="notification-channel-select"]',

    // Scaling and Management
    scalingPanel: '[data-cy="scaling-panel"]',
    scaleUpButton: '[data-cy="scale-up-button"]',
    scaleDownButton: '[data-cy="scale-down-button"]',
    currentInstancesCount: '[data-cy="current-instances-count"]',
    targetInstancesInput: '[data-cy="target-instances-input"]',
    scaleButton: '[data-cy="scale-button"]',

    // Rollback and Versioning
    versioningPanel: '[data-cy="versioning-panel"]',
    versionHistory: '[data-cy="version-history"]',
    rollbackButton: '[data-cy="rollback-button"]',
    promoteButton: '[data-cy="promote-button"]',
    canaryDeploymentToggle: '[data-cy="canary-deployment-toggle"]',
    canaryPercentageInput: '[data-cy="canary-percentage-input"]',

    // Testing and Validation
    testingPanel: '[data-cy="testing-panel"]',
    testEndpointButton: '[data-cy="test-endpoint-button"]',
    sampleRequestInput: '[data-cy="sample-request-input"]',
    testResponsePanel: '[data-cy="test-response-panel"]',
    loadTestButton: '[data-cy="load-test-button"]',
    loadTestConfig: '[data-cy="load-test-config"]',

    // Maintenance and Control
    maintenancePanel: '[data-cy="maintenance-panel"]',
    stopDeploymentButton: '[data-cy="stop-deployment-button"]',
    startDeploymentButton: '[data-cy="start-deployment-button"]',
    restartDeploymentButton: '[data-cy="restart-deployment-button"]',
    deleteDeploymentButton: '[data-cy="delete-deployment-button"]',
    maintenanceModeToggle: '[data-cy="maintenance-mode-toggle"]'
  };

  // Deployment Creation
  startNewDeployment(modelName: string, deploymentName: string): this {
    cy.get(this.selectors.deployModelButton).click();
    cy.get(this.selectors.modelSelectDropdown).click();
    cy.contains('[role="option"]', modelName).click();
    cy.get(this.selectors.deploymentNameInput).type(deploymentName);
    return this;
  }

  setDeploymentDescription(description: string): this {
    cy.get(this.selectors.deploymentDescriptionInput).type(description);
    return this;
  }

  selectEnvironment(environment: 'development' | 'staging' | 'production'): this {
    cy.get(this.selectors.environmentSelect).click();
    cy.contains('[role="option"]', environment).click();
    return this;
  }

  selectModelVersion(version: string): this {
    cy.get(this.selectors.versionSelect).click();
    cy.contains('[role="option"]', version).click();
    return this;
  }

  // Infrastructure Configuration
  configureInfrastructure(config: {
    instanceType: string;
    minInstances: number;
    maxInstances: number;
    autoScaling: boolean;
    cpuThreshold?: number;
    memoryThreshold?: number;
  }): this {
    cy.get(this.selectors.infrastructurePanel).should('be.visible');

    // Instance type
    cy.get(this.selectors.instanceTypeSelect).click();
    cy.contains('[role="option"]', config.instanceType).click();

    // Instance scaling
    cy.get(this.selectors.minInstancesInput).clear().type(String(config.minInstances));
    cy.get(this.selectors.maxInstancesInput).clear().type(String(config.maxInstances));

    // Auto-scaling
    if (config.autoScaling) {
      cy.get(this.selectors.autoScalingToggle).check();
      if (config.cpuThreshold) {
        cy.get(this.selectors.cpuThresholdInput).clear().type(String(config.cpuThreshold));
      }
      if (config.memoryThreshold) {
        cy.get(this.selectors.memoryThresholdInput).clear().type(String(config.memoryThreshold));
      }
    }

    return this;
  }

  enableLoadBalancer(): this {
    cy.get(this.selectors.loadBalancerToggle).check();
    return this;
  }

  // Container Configuration
  configureContainer(config: {
    dockerImage?: string;
    cpuLimit: string;
    memoryLimit: string;
    environmentVars?: Record<string, string>;
  }): this {
    cy.get(this.selectors.containerPanel).should('be.visible');

    if (config.dockerImage) {
      cy.get(this.selectors.dockerImageInput).clear().type(config.dockerImage);
    }

    // Resource limits
    cy.get(this.selectors.cpuLimitInput).clear().type(config.cpuLimit);
    cy.get(this.selectors.memoryLimitInput).clear().type(config.memoryLimit);

    // Environment variables
    if (config.environmentVars) {
      Object.entries(config.environmentVars).forEach(([key, value]) => {
        this.addEnvironmentVariable(key, value);
      });
    }

    return this;
  }

  addEnvironmentVariable(key: string, value: string): this {
    cy.get(this.selectors.addEnvVarButton).click();
    cy.get('[data-cy="env-var-key-input"]').last().type(key);
    cy.get('[data-cy="env-var-value-input"]').last().type(value);
    return this;
  }

  // API Configuration
  configureAPI(config: {
    endpointName: string;
    apiVersion: string;
    authentication: boolean;
    rateLimiting: boolean;
    requestsPerMinute?: number;
    timeout: number;
  }): this {
    cy.get(this.selectors.apiConfigPanel).should('be.visible');

    cy.get(this.selectors.endpointNameInput).type(config.endpointName);
    cy.get(this.selectors.apiVersionInput).type(config.apiVersion);
    cy.get(this.selectors.timeoutInput).clear().type(String(config.timeout));

    if (config.authentication) {
      cy.get(this.selectors.authenticationToggle).check();
    }

    if (config.rateLimiting) {
      cy.get(this.selectors.rateLimitingToggle).check();
      if (config.requestsPerMinute) {
        cy.get(this.selectors.requestsPerMinuteInput).clear().type(String(config.requestsPerMinute));
      }
    }

    return this;
  }

  // Security Configuration
  configureSecurity(config: {
    httpsOnly: boolean;
    corsEnabled: boolean;
    allowedOrigins?: string[];
    apiKeyAuth: boolean;
    jwtAuth: boolean;
  }): this {
    cy.get(this.selectors.securityPanel).should('be.visible');

    if (config.httpsOnly) {
      cy.get(this.selectors.httpsOnlyToggle).check();
    }

    if (config.corsEnabled) {
      cy.get(this.selectors.corsConfigToggle).check();
      if (config.allowedOrigins) {
        config.allowedOrigins.forEach(origin => {
          cy.get(this.selectors.allowedOriginsInput).type(`${origin}{enter}`);
        });
      }
    }

    if (config.apiKeyAuth) {
      cy.get(this.selectors.apiKeyAuthToggle).check();
    }

    if (config.jwtAuth) {
      cy.get(this.selectors.jwtAuthToggle).check();
    }

    return this;
  }

  // Deployment Execution
  deploy(): this {
    cy.get(this.selectors.deployButton).click();
    cy.get('[data-cy="confirm-deployment"]').click();
    cy.get(this.selectors.deploymentProgress).should('be.visible');
    return this;
  }

  waitForDeploymentCompletion(timeout: number = 300000): this {
    cy.get(this.selectors.deploymentStatus, { timeout }).should('contain.text', 'Running');
    cy.get('[data-cy="deployment-success"]').should('be.visible');
    return this;
  }

  monitorDeploymentProgress(): this {
    cy.get(this.selectors.deploymentProgress).should('be.visible');
    cy.get(this.selectors.deploymentLogs).should('be.visible');
    cy.get(this.selectors.estimatedDeploymentTime).should('contain.text', 'minutes');
    return this;
  }

  // Deployment Management
  selectDeployment(deploymentName: string): this {
    cy.contains(this.selectors.deploymentRow, deploymentName).click();
    cy.get(this.selectors.deploymentDetailsPanel).should('be.visible');
    return this;
  }

  verifyDeploymentStatus(expectedStatus: string): this {
    cy.get(this.selectors.deploymentStatus).should('contain.text', expectedStatus);
    return this;
  }

  verifyHealthStatus(expectedHealth: 'healthy' | 'unhealthy' | 'warning'): this {
    cy.get(this.selectors.healthIndicator).should('have.attr', 'data-health', expectedHealth);
    return this;
  }

  // Monitoring and Metrics
  viewMetrics(): this {
    cy.get(this.selectors.metricsTab).click();
    cy.get(this.selectors.metricsPanel).should('be.visible');
    return this;
  }

  verifyMetricsCharts(): this {
    cy.waitForChart(this.selectors.requestVolumeChart);
    cy.waitForChart(this.selectors.responseTimeChart);
    cy.waitForChart(this.selectors.errorRateChart);
    cy.waitForChart(this.selectors.throughputChart);
    return this;
  }

  verifyPerformanceMetrics(): this {
    cy.get(this.selectors.averageResponseTime).should('contain.text', 'ms');
    cy.get(this.selectors.requestsPerSecond).should('contain.text', 'req/s');
    cy.get(this.selectors.errorRate).should('contain.text', '%');
    cy.get(this.selectors.uptime).should('contain.text', '%');
    return this;
  }

  checkResourceUsage(): this {
    cy.get(this.selectors.cpuUsageChart).should('be.visible');
    cy.get(this.selectors.memoryUsageChart).should('be.visible');
    return this;
  }

  // Scaling Operations
  scaleDeployment(targetInstances: number): this {
    cy.get(this.selectors.scalingPanel).should('be.visible');
    cy.get(this.selectors.targetInstancesInput).clear().type(String(targetInstances));
    cy.get(this.selectors.scaleButton).click();
    cy.get('[data-cy="scaling-initiated"]').should('be.visible');
    return this;
  }

  scaleUp(): this {
    cy.get(this.selectors.scaleUpButton).click();
    cy.get('[data-cy="scale-up-confirmation"]').click();
    return this;
  }

  scaleDown(): this {
    cy.get(this.selectors.scaleDownButton).click();
    cy.get('[data-cy="scale-down-confirmation"]').click();
    return this;
  }

  verifyCurrentInstances(expectedCount: number): this {
    cy.get(this.selectors.currentInstancesCount).should('contain.text', String(expectedCount));
    return this;
  }

  // Version Management
  rollbackToVersion(version: string): this {
    cy.get(this.selectors.versioningPanel).should('be.visible');
    cy.get(this.selectors.versionHistory).within(() => {
      cy.contains('[data-cy="version-item"]', version).within(() => {
        cy.get(this.selectors.rollbackButton).click();
      });
    });
    cy.get('[data-cy="confirm-rollback"]').click();
    return this;
  }

  promoteToProduction(): this {
    cy.get(this.selectors.promoteButton).click();
    cy.get('[data-cy="promotion-environment-select"]').click();
    cy.contains('[role="option"]', 'production').click();
    cy.get('[data-cy="confirm-promotion"]').click();
    return this;
  }

  configureCanaryDeployment(percentage: number): this {
    cy.get(this.selectors.canaryDeploymentToggle).check();
    cy.get(this.selectors.canaryPercentageInput).clear().type(String(percentage));
    return this;
  }

  // Testing and Validation
  testEndpoint(requestPayload: string): this {
    cy.get(this.selectors.testingPanel).should('be.visible');
    cy.get(this.selectors.sampleRequestInput).clear().type(requestPayload);
    cy.get(this.selectors.testEndpointButton).click();
    cy.get(this.selectors.testResponsePanel).should('be.visible');
    return this;
  }

  runLoadTest(config: {
    concurrentUsers: number;
    duration: number;
    requestsPerSecond: number;
  }): this {
    cy.get(this.selectors.loadTestButton).click();
    cy.get('[data-cy="concurrent-users-input"]').clear().type(String(config.concurrentUsers));
    cy.get('[data-cy="test-duration-input"]').clear().type(String(config.duration));
    cy.get('[data-cy="requests-per-second-input"]').clear().type(String(config.requestsPerSecond));
    cy.get('[data-cy="start-load-test"]').click();
    return this;
  }

  verifyTestResponse(expectedStatusCode: number): this {
    cy.get(this.selectors.testResponsePanel).within(() => {
      cy.get('[data-cy="response-status"]').should('contain.text', String(expectedStatusCode));
      cy.get('[data-cy="response-body"]').should('be.visible');
    });
    return this;
  }

  // Alerts and Monitoring
  createAlert(alertType: string, threshold: number, channel: string): this {
    cy.get(this.selectors.createAlertButton).click();
    cy.get(this.selectors.alertTypeSelect).click();
    cy.contains('[role="option"]', alertType).click();
    cy.get(this.selectors.alertThresholdInput).clear().type(String(threshold));
    cy.get(this.selectors.notificationChannelSelect).click();
    cy.contains('[role="option"]', channel).click();
    cy.get('[data-cy="create-alert-confirm"]').click();
    return this;
  }

  verifyActiveAlerts(): this {
    cy.get(this.selectors.alertsPanel).should('be.visible');
    cy.get('[data-cy="active-alerts-count"]').should('be.visible');
    return this;
  }

  // Maintenance Operations
  stopDeployment(): this {
    cy.get(this.selectors.stopDeploymentButton).click();
    cy.get('[data-cy="confirm-stop-deployment"]').click();
    cy.get(this.selectors.deploymentStatus).should('contain.text', 'Stopped');
    return this;
  }

  startDeployment(): this {
    cy.get(this.selectors.startDeploymentButton).click();
    cy.get('[data-cy="confirm-start-deployment"]').click();
    cy.get(this.selectors.deploymentStatus).should('contain.text', 'Starting');
    return this;
  }

  restartDeployment(): this {
    cy.get(this.selectors.restartDeploymentButton).click();
    cy.get('[data-cy="confirm-restart-deployment"]').click();
    cy.get(this.selectors.deploymentStatus).should('contain.text', 'Restarting');
    return this;
  }

  enableMaintenanceMode(): this {
    cy.get(this.selectors.maintenanceModeToggle).check();
    cy.get('[data-cy="maintenance-mode-active"]').should('be.visible');
    return this;
  }

  deleteDeployment(): this {
    cy.get(this.selectors.deleteDeploymentButton).click();
    cy.get('[data-cy="delete-confirmation-input"]').type('DELETE');
    cy.get('[data-cy="confirm-delete-deployment"]').click();
    return this;
  }

  // Logs and Debugging
  viewLogs(): this {
    cy.get(this.selectors.logsTab).click();
    cy.get(this.selectors.deploymentLogs).should('be.visible');
    return this;
  }

  filterLogs(logLevel: 'debug' | 'info' | 'warn' | 'error'): this {
    cy.get('[data-cy="log-level-filter"]').click();
    cy.contains('[role="option"]', logLevel).click();
    return this;
  }

  searchLogs(searchTerm: string): this {
    cy.get('[data-cy="log-search-input"]').type(searchTerm);
    cy.get('[data-cy="search-logs-button"]').click();
    return this;
  }

  downloadLogs(): this {
    cy.get('[data-cy="download-logs-button"]').click();
    cy.get('[data-cy="log-format-select"]').click();
    cy.contains('[role="option"]', 'json').click();
    cy.get('[data-cy="download-confirm"]').click();
    return this;
  }

  // Comprehensive Workflow Tests
  performCompleteDeployment(
    modelName: string,
    deploymentName: string,
    environment: 'development' | 'staging' | 'production'
  ): this {
    return this
      .waitForPageLoad()
      .startNewDeployment(modelName, deploymentName)
      .selectEnvironment(environment)
      .configureInfrastructure({
        instanceType: 't3.medium',
        minInstances: 1,
        maxInstances: 3,
        autoScaling: true,
        cpuThreshold: 70,
        memoryThreshold: 80
      })
      .configureAPI({
        endpointName: `${deploymentName}-api`,
        apiVersion: 'v1',
        authentication: true,
        rateLimiting: true,
        requestsPerMinute: 1000,
        timeout: 30
      })
      .configureSecurity({
        httpsOnly: true,
        corsEnabled: true,
        allowedOrigins: ['*'],
        apiKeyAuth: true,
        jwtAuth: false
      })
      .deploy()
      .waitForDeploymentCompletion();
  }

  performCanaryDeployment(
    modelName: string,
    deploymentName: string,
    canaryPercentage: number
  ): this {
    return this
      .startNewDeployment(modelName, deploymentName)
      .configureCanaryDeployment(canaryPercentage)
      .deploy()
      .waitForDeploymentCompletion()
      .verifyMetricsCharts()
      .verifyPerformanceMetrics();
  }

  performLoadTesting(loadTestConfig: {
    concurrentUsers: number;
    duration: number;
    requestsPerSecond: number;
  }): this {
    return this
      .runLoadTest(loadTestConfig)
      .verifyMetricsCharts()
      .verifyPerformanceMetrics()
      .checkResourceUsage();
  }
}