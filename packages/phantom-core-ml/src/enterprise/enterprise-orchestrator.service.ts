/**
 * Enterprise Orchestrator Service
 * Master orchestrator coordinating all enterprise services
 * Provides unified interface and workflow management
 */

import { EnterpriseCoreService } from './enterprise-core.service';
import { EnterprisePersistenceService } from './persistence/enterprise-persistence.service';
import { RealTimeProcessingService } from './streaming/real-time-processing.service';
import { EnterpriseStateManager } from './state/enterprise-state-manager.service';
import { BusinessIntelligenceService } from './analytics/business-intelligence.service';
import { ComplianceSecurityService } from './security/compliance-security.service';
import { PerformanceMonitoringService } from './monitoring/performance-monitoring.service';
import { FrontendIntegrationService } from './integration/frontend-integration.service';
import {
  EnterpriseConfig,
  MLModel,
  TrainingData,
  TrainingConfig,
  PredictionResult,
  AuditTrail,
  ModelType,
  AuditOutcome
} from './types';

export interface OrchestrationWorkflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  service: string;
  method: string;
  parameters: Record<string, any>;
  dependencies: string[];
  status: StepStatus;
  result?: any;
  error?: string;
  executedAt?: Date;
  duration?: number;
}

export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export enum StepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

export interface ServiceHealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  metrics: Record<string, any>;
  errors: string[];
}

export class EnterpriseOrchestratorService {
  private coreService: EnterpriseCoreService;
  private persistenceService: EnterprisePersistenceService;
  private realTimeService: RealTimeProcessingService;
  private stateManager: EnterpriseStateManager;
  private biService: BusinessIntelligenceService;
  private securityService: ComplianceSecurityService;
  private monitoringService: PerformanceMonitoringService;
  private frontendService: FrontendIntegrationService;

  private workflows: Map<string, OrchestrationWorkflow> = new Map();
  private serviceHealth: Map<string, ServiceHealthStatus> = new Map();
  private isInitialized = false;

  constructor(private config: EnterpriseConfig) {
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize all enterprise services
      this.coreService = new EnterpriseCoreService(this.config);
      this.persistenceService = new EnterprisePersistenceService(this.config);
      this.realTimeService = new RealTimeProcessingService(this.config);
      this.stateManager = new EnterpriseStateManager(this.config);
      this.biService = new BusinessIntelligenceService(this.config);
      this.securityService = new ComplianceSecurityService(this.config);
      this.monitoringService = new PerformanceMonitoringService(this.config);
      this.frontendService = new FrontendIntegrationService(this.config);

      // Wait for all services to initialize
      await Promise.all([
        this.persistenceService.waitForInitialization(),
        this.realTimeService.waitForInitialization(),
        this.stateManager.waitForInitialization(),
        this.biService.waitForInitialization(),
        this.securityService.waitForInitialization(),
        this.monitoringService.waitForInitialization(),
        this.frontendService.waitForInitialization()
      ]);

      // Start health monitoring
      this.startHealthMonitoring();

      this.isInitialized = true;
      console.log('Enterprise Orchestrator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Enterprise Orchestrator:', error);
      throw error;
    }
  }

  // =============================================================================
  // WORKFLOW ORCHESTRATION METHODS
  // =============================================================================

  async createWorkflow(name: string, steps: Omit<WorkflowStep, 'id' | 'status'>[]): Promise<OrchestrationWorkflow> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const workflow: OrchestrationWorkflow = {
      id: workflowId,
      name,
      steps: steps.map((step, index) => ({
        ...step,
        id: `step_${index + 1}`,
        status: StepStatus.PENDING
      })),
      status: WorkflowStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {}
    };

    this.workflows.set(workflowId, workflow);
    await this.persistenceService.storeWorkflow(workflow);

    return workflow;
  }

  async executeWorkflow(workflowId: string): Promise<OrchestrationWorkflow> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = WorkflowStatus.RUNNING;
    workflow.updatedAt = new Date();

    try {
      // Execute steps in dependency order
      const executionOrder = this.calculateExecutionOrder(workflow.steps);

      for (const stepId of executionOrder) {
        const step = workflow.steps.find(s => s.id === stepId);
        if (!step) continue;

        await this.executeWorkflowStep(workflow, step);

        if (step.status === StepStatus.FAILED) {
          workflow.status = WorkflowStatus.FAILED;
          break;
        }
      }

      if (workflow.status === WorkflowStatus.RUNNING) {
        workflow.status = WorkflowStatus.COMPLETED;
      }
    } catch (error) {
      workflow.status = WorkflowStatus.FAILED;
      workflow.metadata.error = error.message;
    }

    workflow.updatedAt = new Date();
    await this.persistenceService.updateWorkflow(workflow);

    return workflow;
  }

  private async executeWorkflowStep(workflow: OrchestrationWorkflow, step: WorkflowStep): Promise<void> {
    step.status = StepStatus.RUNNING;
    step.executedAt = new Date();

    const startTime = Date.now();

    try {
      // Get the appropriate service
      const service = this.getService(step.service);
      if (!service) {
        throw new Error(`Service ${step.service} not found`);
      }

      // Execute the method
      const method = service[step.method];
      if (typeof method !== 'function') {
        throw new Error(`Method ${step.method} not found on service ${step.service}`);
      }

      // Prepare parameters with context injection
      const parameters = this.injectContextIntoParameters(step.parameters, workflow);

      // Execute the method
      step.result = await method.apply(service, Object.values(parameters));
      step.status = StepStatus.COMPLETED;

      // Store result in state manager for use by subsequent steps
      await this.stateManager.setWorkflowStepResult(workflow.id, step.id, step.result);

    } catch (error) {
      step.status = StepStatus.FAILED;
      step.error = error.message;
    }

    step.duration = Date.now() - startTime;
  }

  private calculateExecutionOrder(steps: WorkflowStep[]): string[] {
    const order: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (stepId: string) => {
      if (visiting.has(stepId)) {
        throw new Error(`Circular dependency detected involving step ${stepId}`);
      }
      if (visited.has(stepId)) {
        return;
      }

      visiting.add(stepId);

      const step = steps.find(s => s.id === stepId);
      if (step) {
        for (const dependency of step.dependencies) {
          visit(dependency);
        }
      }

      visiting.delete(stepId);
      visited.add(stepId);
      order.push(stepId);
    };

    for (const step of steps) {
      if (!visited.has(step.id)) {
        visit(step.id);
      }
    }

    return order;
  }

  private getService(serviceName: string): any {
    const services = {
      'core': this.coreService,
      'persistence': this.persistenceService,
      'realtime': this.realTimeService,
      'state': this.stateManager,
      'bi': this.biService,
      'security': this.securityService,
      'monitoring': this.monitoringService,
      'frontend': this.frontendService
    };

    return services[serviceName];
  }

  private injectContextIntoParameters(parameters: Record<string, any>, workflow: OrchestrationWorkflow): Record<string, any> {
    const injectedParams = { ...parameters };

    // Replace placeholders with actual values from workflow context
    for (const [key, value] of Object.entries(injectedParams)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const placeholder = value.slice(2, -1);
        injectedParams[key] = this.resolveWorkflowVariable(placeholder, workflow);
      }
    }

    return injectedParams;
  }

  private resolveWorkflowVariable(variable: string, workflow: OrchestrationWorkflow): any {
    // Handle step result references
    if (variable.startsWith('step.')) {
      const [, stepId, ...path] = variable.split('.');
      const step = workflow.steps.find(s => s.id === stepId);
      if (step && step.result) {
        return path.length > 0 ? this.getNestedValue(step.result, path) : step.result;
      }
    }

    // Handle workflow metadata
    if (variable.startsWith('workflow.')) {
      const path = variable.split('.').slice(1);
      return this.getNestedValue(workflow, path);
    }

    // Handle configuration values
    if (variable.startsWith('config.')) {
      const path = variable.split('.').slice(1);
      return this.getNestedValue(this.config, path);
    }

    return variable; // Return as-is if no replacement found
  }

  private getNestedValue(obj: any, path: string[]): any {
    return path.reduce((current, key) => current?.[key], obj);
  }

  // =============================================================================
  // HIGH-LEVEL ORCHESTRATED OPERATIONS
  // =============================================================================

  async trainAndDeployModel(name: string, data: TrainingData, config: TrainingConfig): Promise<{
    model: MLModel;
    deploymentId: string;
    monitoring: any;
  }> {
    const workflow = await this.createWorkflow('train_and_deploy_model', [
      {
        name: 'Data Quality Assessment',
        service: 'core',
        method: 'dataQualityAssessment',
        parameters: { data: data.features },
        dependencies: []
      },
      {
        name: 'Train Model',
        service: 'core',
        method: 'trainModel',
        parameters: { data, config },
        dependencies: ['step_1']
      },
      {
        name: 'Validate Model',
        service: 'core',
        method: 'validateModel',
        parameters: { model: '${step.step_2}', testData: data.features.slice(-100) },
        dependencies: ['step_2']
      },
      {
        name: 'Store Model',
        service: 'persistence',
        method: 'storeModel',
        parameters: { model: '${step.step_2}' },
        dependencies: ['step_3']
      },
      {
        name: 'Deploy Model',
        service: 'core',
        method: 'deployModel',
        parameters: { model: '${step.step_2}', environment: 'production' },
        dependencies: ['step_4']
      },
      {
        name: 'Setup Monitoring',
        service: 'monitoring',
        method: 'setupModelMonitoring',
        parameters: { modelId: '${step.step_2.id}' },
        dependencies: ['step_5']
      }
    ]);

    const result = await this.executeWorkflow(workflow.id);

    if (result.status === WorkflowStatus.FAILED) {
      throw new Error(`Model training and deployment failed: ${result.metadata.error}`);
    }

    const model = result.steps.find(s => s.name === 'Train Model')?.result;
    const deploymentId = result.steps.find(s => s.name === 'Deploy Model')?.result;
    const monitoring = result.steps.find(s => s.name === 'Setup Monitoring')?.result;

    return { model, deploymentId, monitoring };
  }

  async performFullAnalysis(modelId: string, data: any[]): Promise<{
    trends: any;
    correlations: any;
    statistics: any;
    quality: any;
    businessImpact: any;
    roi: any;
  }> {
    const workflow = await this.createWorkflow('full_analysis', [
      {
        name: 'Trend Analysis',
        service: 'core',
        method: 'trendAnalysis',
        parameters: { data: data.map((_, i) => Math.random() * 100), timeframe: 'monthly' },
        dependencies: []
      },
      {
        name: 'Correlation Analysis',
        service: 'core',
        method: 'correlationAnalysis',
        parameters: {
          variables: ['feature1', 'feature2', 'feature3'],
          data: [data.slice(0, 100), data.slice(100, 200), data.slice(200, 300)]
        },
        dependencies: []
      },
      {
        name: 'Statistical Summary',
        service: 'core',
        method: 'statisticalSummary',
        parameters: { data: data.map((_, i) => Math.random() * 100), variable: 'performance' },
        dependencies: []
      },
      {
        name: 'Data Quality Assessment',
        service: 'core',
        method: 'dataQualityAssessment',
        parameters: { data },
        dependencies: []
      },
      {
        name: 'Business Impact Analysis',
        service: 'core',
        method: 'businessImpactAnalysis',
        parameters: { modelId, businessContext: { baseline_value: 100000, improvement_rate: 0.15 } },
        dependencies: []
      },
      {
        name: 'ROI Calculation',
        service: 'core',
        method: 'roiCalculator',
        parameters: { modelId, investment: 50000, timeframe: 12 },
        dependencies: ['step_5']
      }
    ]);

    const result = await this.executeWorkflow(workflow.id);

    if (result.status === WorkflowStatus.FAILED) {
      throw new Error(`Full analysis failed: ${result.metadata.error}`);
    }

    return {
      trends: result.steps.find(s => s.name === 'Trend Analysis')?.result,
      correlations: result.steps.find(s => s.name === 'Correlation Analysis')?.result,
      statistics: result.steps.find(s => s.name === 'Statistical Summary')?.result,
      quality: result.steps.find(s => s.name === 'Data Quality Assessment')?.result,
      businessImpact: result.steps.find(s => s.name === 'Business Impact Analysis')?.result,
      roi: result.steps.find(s => s.name === 'ROI Calculation')?.result
    };
  }

  async setupProductionEnvironment(modelId: string): Promise<{
    deployment: string;
    monitoring: any;
    alerts: any;
    compliance: any;
  }> {
    const workflow = await this.createWorkflow('setup_production', [
      {
        name: 'Security Scan',
        service: 'security',
        method: 'performSecurityScan',
        parameters: { modelId, scanType: 'vulnerability' },
        dependencies: []
      },
      {
        name: 'Compliance Check',
        service: 'security',
        method: 'validateCompliance',
        parameters: { modelId, framework: this.config.compliance.framework },
        dependencies: []
      },
      {
        name: 'Deploy Model',
        service: 'core',
        method: 'deployModel',
        parameters: { modelId, environment: 'production' },
        dependencies: ['step_1', 'step_2']
      },
      {
        name: 'Setup Monitoring',
        service: 'monitoring',
        method: 'setupModelMonitoring',
        parameters: { modelId },
        dependencies: ['step_3']
      },
      {
        name: 'Configure Alerts',
        service: 'monitoring',
        method: 'configureAlerts',
        parameters: {
          modelId,
          alerts: [
            { name: 'High Error Rate', condition: 'error_rate > 0.05', threshold: 0.05, severity: 'critical' },
            { name: 'High Latency', condition: 'latency > 500', threshold: 500, severity: 'warning' }
          ]
        },
        dependencies: ['step_4']
      },
      {
        name: 'Enable Audit Logging',
        service: 'security',
        method: 'enableAuditLogging',
        parameters: { modelId },
        dependencies: ['step_3']
      }
    ]);

    const result = await this.executeWorkflow(workflow.id);

    if (result.status === WorkflowStatus.FAILED) {
      throw new Error(`Production setup failed: ${result.metadata.error}`);
    }

    return {
      deployment: result.steps.find(s => s.name === 'Deploy Model')?.result,
      monitoring: result.steps.find(s => s.name === 'Setup Monitoring')?.result,
      alerts: result.steps.find(s => s.name === 'Configure Alerts')?.result,
      compliance: result.steps.find(s => s.name === 'Compliance Check')?.result
    };
  }

  // =============================================================================
  // SERVICE HEALTH AND MONITORING
  // =============================================================================

  private startHealthMonitoring(): void {
    // Check service health every 30 seconds
    setInterval(async () => {
      await this.checkAllServicesHealth();
    }, 30000);

    // Initial health check
    this.checkAllServicesHealth();
  }

  private async checkAllServicesHealth(): Promise<void> {
    const services = [
      { name: 'core', service: this.coreService },
      { name: 'persistence', service: this.persistenceService },
      { name: 'realtime', service: this.realTimeService },
      { name: 'state', service: this.stateManager },
      { name: 'bi', service: this.biService },
      { name: 'security', service: this.securityService },
      { name: 'monitoring', service: this.monitoringService },
      { name: 'frontend', service: this.frontendService }
    ];

    for (const { name, service } of services) {
      try {
        const health = await this.checkServiceHealth(name, service);
        this.serviceHealth.set(name, health);
      } catch (error) {
        this.serviceHealth.set(name, {
          service: name,
          status: 'unhealthy',
          lastCheck: new Date(),
          metrics: {},
          errors: [error.message]
        });
      }
    }
  }

  private async checkServiceHealth(serviceName: string, service: any): Promise<ServiceHealthStatus> {
    const startTime = Date.now();

    try {
      // Check if service has a health check method
      let healthResult = { status: 'healthy', metrics: {} };

      if (typeof service.getHealthStatus === 'function') {
        healthResult = await service.getHealthStatus();
      }

      const responseTime = Date.now() - startTime;

      return {
        service: serviceName,
        status: responseTime > 5000 ? 'degraded' : 'healthy',
        lastCheck: new Date(),
        metrics: {
          responseTime,
          ...healthResult.metrics
        },
        errors: []
      };
    } catch (error) {
      return {
        service: serviceName,
        status: 'unhealthy',
        lastCheck: new Date(),
        metrics: {
          responseTime: Date.now() - startTime
        },
        errors: [error.message]
      };
    }
  }

  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: ServiceHealthStatus[];
    lastUpdated: Date;
  }> {
    const services = Array.from(this.serviceHealth.values());

    const healthyCount = services.filter(s => s.status === 'healthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;
    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyCount > 0) {
      overall = 'unhealthy';
    } else if (degradedCount > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    return {
      overall,
      services,
      lastUpdated: new Date()
    };
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  async getWorkflow(workflowId: string): Promise<OrchestrationWorkflow | null> {
    return this.workflows.get(workflowId) || null;
  }

  async listWorkflows(status?: WorkflowStatus): Promise<OrchestrationWorkflow[]> {
    const workflows = Array.from(this.workflows.values());
    return status ? workflows.filter(w => w.status === status) : workflows;
  }

  async pauseWorkflow(workflowId: string): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (workflow && workflow.status === WorkflowStatus.RUNNING) {
      workflow.status = WorkflowStatus.PAUSED;
      workflow.updatedAt = new Date();
      await this.persistenceService.updateWorkflow(workflow);
      return true;
    }
    return false;
  }

  async resumeWorkflow(workflowId: string): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (workflow && workflow.status === WorkflowStatus.PAUSED) {
      workflow.status = WorkflowStatus.RUNNING;
      workflow.updatedAt = new Date();
      // Continue execution from where it left off
      await this.executeWorkflow(workflowId);
      return true;
    }
    return false;
  }

  async cancelWorkflow(workflowId: string): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (workflow && [WorkflowStatus.PENDING, WorkflowStatus.RUNNING, WorkflowStatus.PAUSED].includes(workflow.status)) {
      workflow.status = WorkflowStatus.CANCELLED;
      workflow.updatedAt = new Date();
      await this.persistenceService.updateWorkflow(workflow);
      return true;
    }
    return false;
  }

  // Service accessors for direct access when needed
  get core(): EnterpriseCoreService { return this.coreService; }
  get persistence(): EnterprisePersistenceService { return this.persistenceService; }
  get realTime(): RealTimeProcessingService { return this.realTimeService; }
  get state(): EnterpriseStateManager { return this.stateManager; }
  get businessIntelligence(): BusinessIntelligenceService { return this.biService; }
  get security(): ComplianceSecurityService { return this.securityService; }
  get monitoring(): PerformanceMonitoringService { return this.monitoringService; }
  get frontend(): FrontendIntegrationService { return this.frontendService; }

  async shutdown(): Promise<void> {
    // Gracefully shutdown all services
    const shutdownPromises = [
      this.persistenceService.shutdown(),
      this.realTimeService.shutdown(),
      this.stateManager.shutdown(),
      this.biService.shutdown(),
      this.securityService.shutdown(),
      this.monitoringService.shutdown(),
      this.frontendService.shutdown()
    ];

    await Promise.all(shutdownPromises);
    console.log('Enterprise Orchestrator shutdown complete');
  }
}