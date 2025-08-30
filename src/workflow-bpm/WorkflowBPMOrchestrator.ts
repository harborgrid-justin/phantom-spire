/**
 * Fortune 100-Grade Workflow BPM Orchestrator
 * Main orchestrator integrating workflow engine with all platform components
 */

import { EventEmitter } from 'events';
import { WorkflowEngineCore } from './core/WorkflowEngine';
import { InMemoryWorkflowRepository } from './repository/InMemoryWorkflowRepository';
import { CTI_WORKFLOW_TEMPLATES } from './templates/CTIWorkflowTemplates';
import { 
  IWorkflowEngine, 
  IWorkflowDefinition, 
  IWorkflowInstance,
  WorkflowStatus
} from './interfaces/IWorkflowEngine';
import { logger } from '../utils/logger';

export interface IWorkflowBPMConfig {
  database?: {
    connectionString?: string;
  };
  engine?: {
    maxConcurrentWorkflows?: number;
    memoryLimit?: string;
    executionTimeout?: number;
    checkpointInterval?: number;
  };
  integrations?: {
    taskManager?: any;
    messageQueue?: any;
    evidenceManager?: any;
    issueManager?: any;
  };
  performance?: {
    enableOptimization?: boolean;
    enableMLOptimization?: boolean;
    enableDynamicScaling?: boolean;
  };
}

export class WorkflowBPMOrchestrator extends EventEmitter {
  private workflowEngine!: IWorkflowEngine;
  private repository!: InMemoryWorkflowRepository;
  private integrations: any = {};
  
  // Performance and monitoring
  private performanceMetrics = {
    totalWorkflowsExecuted: 0,
    averageExecutionTime: 0,
    successRate: 0,
    activeWorkflows: 0
  };

  constructor(private config: IWorkflowBPMConfig = {}) {
    super();
    
    logger.info('Initializing Fortune 100-Grade Workflow BPM Orchestrator', {
      component: 'WorkflowBPMOrchestrator',
      config: this.config
    });

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize repository
      this.repository = new InMemoryWorkflowRepository();
      
      // Initialize workflow engine
      this.workflowEngine = new WorkflowEngineCore(
        this.repository,
        {
          maxConcurrentWorkflows: this.config.engine?.maxConcurrentWorkflows || 50000,
          memoryLimit: this.config.engine?.memoryLimit || '8GB',
          executionTimeout: this.config.engine?.executionTimeout || 24 * 60 * 60 * 1000,
          checkpointInterval: this.config.engine?.checkpointInterval || 5000,
          optimization: {
            enabled: this.config.performance?.enableOptimization ?? true,
            mlOptimization: this.config.performance?.enableMLOptimization ?? true,
            dynamicScaling: this.config.performance?.enableDynamicScaling ?? true
          }
        }
      );

      // Set up integrations
      this.setupIntegrations();

      // Register CTI workflow templates
      await this.registerCTIWorkflowTemplates();

      // Set up event handlers
      this.setupEventHandlers();

      // Start monitoring
      this.startMonitoring();

      logger.info('Workflow BPM Orchestrator initialized successfully');
      this.emit('orchestrator-ready');
    } catch (error) {
      logger.error('Failed to initialize Workflow BPM Orchestrator', { 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  private setupIntegrations(): void {
    // Store integration services
    this.integrations = {
      taskManager: this.config.integrations?.taskManager,
      messageQueue: this.config.integrations?.messageQueue,
      evidenceManager: this.config.integrations?.evidenceManager,
      issueManager: this.config.integrations?.issueManager
    };

    // Set up integration event handlers
    if (this.integrations.messageQueue) {
      this.setupMessageQueueIntegration();
    }

    if (this.integrations.taskManager) {
      this.setupTaskManagerIntegration();
    }

    if (this.integrations.evidenceManager) {
      this.setupEvidenceManagerIntegration();
    }

    if (this.integrations.issueManager) {
      this.setupIssueManagerIntegration();
    }

    logger.info('Workflow BPM integrations configured', {
      integrations: Object.keys(this.integrations).filter(key => this.integrations[key])
    });
  }

  private setupMessageQueueIntegration(): void {
    const messageQueue = this.integrations.messageQueue;
    
    // Subscribe to workflow trigger events
    messageQueue.subscribe('workflow.triggers.*', async (message: any) => {
      try {
        await this.handleWorkflowTriggerEvent(message);
      } catch (error) {
        logger.error('Failed to handle workflow trigger event', {
          message,
          error: (error as Error).message
        });
      }
    });

    // Subscribe to workflow control events
    messageQueue.subscribe('workflow.control.*', async (message: any) => {
      try {
        await this.handleWorkflowControlEvent(message);
      } catch (error) {
        logger.error('Failed to handle workflow control event', {
          message,
          error: (error as Error).message
        });
      }
    });

    logger.info('Message queue integration configured for workflows');
  }

  private setupTaskManagerIntegration(): void {
    const taskManager = this.integrations.taskManager;
    
    // Listen for task completion events that might trigger workflows
    taskManager.on('task-completed', async (task: any) => {
      try {
        await this.handleTaskCompletionEvent(task);
      } catch (error) {
        logger.error('Failed to handle task completion event', {
          taskId: task.id,
          error: (error as Error).message
        });
      }
    });

    logger.info('Task manager integration configured for workflows');
  }

  private setupEvidenceManagerIntegration(): void {
    const evidenceManager = this.integrations.evidenceManager;
    
    // Listen for evidence collection events
    evidenceManager.on('evidence-collected', async (evidence: any) => {
      try {
        await this.handleEvidenceCollectionEvent(evidence);
      } catch (error) {
        logger.error('Failed to handle evidence collection event', {
          evidenceId: evidence.id,
          error: (error as Error).message
        });
      }
    });

    logger.info('Evidence manager integration configured for workflows');
  }

  private setupIssueManagerIntegration(): void {
    const issueManager = this.integrations.issueManager;
    
    // Listen for issue events that might trigger workflows
    issueManager.on('issue-created', async (issue: any) => {
      try {
        await this.handleIssueCreationEvent(issue);
      } catch (error) {
        logger.error('Failed to handle issue creation event', {
          issueId: issue.id,
          error: (error as Error).message
        });
      }
    });

    issueManager.on('issue-escalated', async (issue: any) => {
      try {
        await this.handleIssueEscalationEvent(issue);
      } catch (error) {
        logger.error('Failed to handle issue escalation event', {
          issueId: issue.id,
          error: (error as Error).message
        });
      }
    });

    logger.info('Issue manager integration configured for workflows');
  }

  private async registerCTIWorkflowTemplates(): Promise<void> {
    try {
      for (const [templateId, template] of Object.entries(CTI_WORKFLOW_TEMPLATES)) {
        await this.workflowEngine.registerWorkflowDefinition(template);
        logger.info('CTI workflow template registered', { templateId, name: template.name });
      }
      
      logger.info('All CTI workflow templates registered successfully');
    } catch (error) {
      logger.error('Failed to register CTI workflow templates', {
        error: (error as Error).message
      });
      throw error;
    }
  }

  private setupEventHandlers(): void {
    // Workflow engine events
    this.workflowEngine.on('workflow-started', (instance: IWorkflowInstance) => {
      this.performanceMetrics.activeWorkflows++;
      this.emit('workflow-started', instance);
      logger.info('Workflow started', { instanceId: instance.id, workflowId: instance.workflowId });
    });

    this.workflowEngine.on('workflow-completed', (instance: IWorkflowInstance) => {
      this.performanceMetrics.activeWorkflows--;
      this.performanceMetrics.totalWorkflowsExecuted++;
      this.updateSuccessRate(true);
      this.updateAverageExecutionTime(instance.duration || 0);
      this.emit('workflow-completed', instance);
      logger.info('Workflow completed', { instanceId: instance.id, duration: instance.duration });
    });

    this.workflowEngine.on('workflow-failed', (instance: IWorkflowInstance, error: Error) => {
      this.performanceMetrics.activeWorkflows--;
      this.performanceMetrics.totalWorkflowsExecuted++;
      this.updateSuccessRate(false);
      this.emit('workflow-failed', instance, error);
      logger.error('Workflow failed', { instanceId: instance.id, error: error.message });
    });

    this.workflowEngine.on('workflow-paused', (instance: IWorkflowInstance) => {
      this.emit('workflow-paused', instance);
      logger.info('Workflow paused', { instanceId: instance.id });
    });

    this.workflowEngine.on('workflow-resumed', (instance: IWorkflowInstance) => {
      this.emit('workflow-resumed', instance);
      logger.info('Workflow resumed', { instanceId: instance.id });
    });

    this.workflowEngine.on('workflow-cancelled', (instance: IWorkflowInstance) => {
      this.performanceMetrics.activeWorkflows--;
      this.emit('workflow-cancelled', instance);
      logger.info('Workflow cancelled', { instanceId: instance.id });
    });
  }

  // Public API methods
  public async startWorkflow(
    workflowId: string, 
    parameters: Record<string, any> = {}, 
    initiatedBy: string = 'system'
  ): Promise<IWorkflowInstance> {
    try {
      logger.info('Starting workflow', { workflowId, parameters, initiatedBy });
      return await this.workflowEngine.startWorkflow(workflowId, parameters, initiatedBy);
    } catch (error) {
      logger.error('Failed to start workflow', {
        workflowId,
        error: (error as Error).message
      });
      throw error;
    }
  }

  public async pauseWorkflow(instanceId: string): Promise<void> {
    try {
      await this.workflowEngine.pauseWorkflow(instanceId);
      logger.info('Workflow paused', { instanceId });
    } catch (error) {
      logger.error('Failed to pause workflow', {
        instanceId,
        error: (error as Error).message
      });
      throw error;
    }
  }

  public async resumeWorkflow(instanceId: string): Promise<void> {
    try {
      await this.workflowEngine.resumeWorkflow(instanceId);
      logger.info('Workflow resumed', { instanceId });
    } catch (error) {
      logger.error('Failed to resume workflow', {
        instanceId,
        error: (error as Error).message
      });
      throw error;
    }
  }

  public async cancelWorkflow(instanceId: string, reason?: string): Promise<void> {
    try {
      await this.workflowEngine.cancelWorkflow(instanceId, reason);
      logger.info('Workflow cancelled', { instanceId, reason });
    } catch (error) {
      logger.error('Failed to cancel workflow', {
        instanceId,
        error: (error as Error).message
      });
      throw error;
    }
  }

  public async getWorkflowInstance(instanceId: string): Promise<IWorkflowInstance> {
    try {
      return await this.workflowEngine.getWorkflowInstance(instanceId);
    } catch (error) {
      logger.error('Failed to get workflow instance', {
        instanceId,
        error: (error as Error).message
      });
      throw error;
    }
  }

  public async listWorkflowInstances(filters?: any): Promise<IWorkflowInstance[]> {
    try {
      return await this.workflowEngine.listWorkflowInstances(filters);
    } catch (error) {
      logger.error('Failed to list workflow instances', {
        filters,
        error: (error as Error).message
      });
      throw error;
    }
  }

  public async registerWorkflowDefinition(definition: IWorkflowDefinition): Promise<void> {
    try {
      await this.workflowEngine.registerWorkflowDefinition(definition);
      logger.info('Workflow definition registered', { id: definition.id, version: definition.version });
    } catch (error) {
      logger.error('Failed to register workflow definition', {
        id: definition.id,
        error: (error as Error).message
      });
      throw error;
    }
  }

  public async getWorkflowDefinitions(): Promise<IWorkflowDefinition[]> {
    try {
      return await this.workflowEngine.listWorkflowDefinitions();
    } catch (error) {
      logger.error('Failed to get workflow definitions', {
        error: (error as Error).message
      });
      throw error;
    }
  }

  // CTI-specific convenience methods
  public async startAPTResponseWorkflow(indicators: any[], event: any, initiatedBy: string = 'system'): Promise<IWorkflowInstance> {
    return await this.startWorkflow('apt-response-workflow', { indicators, event }, initiatedBy);
  }

  public async startMalwareAnalysisWorkflow(sample: any, initiatedBy: string = 'system'): Promise<IWorkflowInstance> {
    return await this.startWorkflow('malware-analysis-workflow', { sample }, initiatedBy);
  }

  public async startIncidentResponseWorkflow(
    incidentData: any, 
    severity: 'critical' | 'high' | 'medium' | 'low' = 'medium',
    initiatedBy: string = 'system'
  ): Promise<IWorkflowInstance> {
    // This would trigger a general incident response workflow
    return await this.startWorkflow('incident-response-workflow', { 
      incident: incidentData, 
      severity 
    }, initiatedBy);
  }

  // Event handling methods
  private async handleWorkflowTriggerEvent(message: any): Promise<void> {
    const { workflowId, parameters, triggerType, triggerData } = message;
    
    try {
      // Check if workflow should be triggered based on conditions
      const shouldTrigger = await this.evaluateTriggerConditions(workflowId, triggerData);
      
      if (shouldTrigger) {
        await this.startWorkflow(workflowId, parameters, 'event-trigger');
        
        // Publish workflow started event
        if (this.integrations.messageQueue) {
          await this.integrations.messageQueue.publish('workflow.started', {
            workflowId,
            parameters,
            triggerType,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      logger.error('Failed to handle workflow trigger event', {
        workflowId,
        error: (error as Error).message
      });
    }
  }

  private async handleWorkflowControlEvent(message: any): Promise<void> {
    const { action, instanceId, reason } = message;
    
    try {
      switch (action) {
        case 'pause':
          await this.pauseWorkflow(instanceId);
          break;
        case 'resume':
          await this.resumeWorkflow(instanceId);
          break;
        case 'cancel':
          await this.cancelWorkflow(instanceId, reason);
          break;
        default:
          logger.warn('Unknown workflow control action', { action, instanceId });
      }
    } catch (error) {
      logger.error('Failed to handle workflow control event', {
        action,
        instanceId,
        error: (error as Error).message
      });
    }
  }

  private async handleTaskCompletionEvent(task: any): Promise<void> {
    // Check if task completion should trigger any workflows
    if (task.workflowTriggers) {
      for (const trigger of task.workflowTriggers) {
        await this.startWorkflow(trigger.workflowId, {
          completedTask: task,
          ...trigger.parameters
        }, 'task-completion');
      }
    }
  }

  private async handleEvidenceCollectionEvent(evidence: any): Promise<void> {
    // Evidence collection might trigger analysis workflows
    if (evidence.type === 'malware-sample') {
      await this.startMalwareAnalysisWorkflow(evidence.data, 'evidence-collection');
    }
  }

  private async handleIssueCreationEvent(issue: any): Promise<void> {
    // High priority security issues might trigger incident response workflows
    if (issue.issueType === 'incident' && issue.priority === 'critical') {
      await this.startIncidentResponseWorkflow(issue, 'critical', 'issue-creation');
    }
  }

  private async handleIssueEscalationEvent(issue: any): Promise<void> {
    // Issue escalation might trigger additional workflows
    if (issue.threatLevel === 'critical') {
      await this.startAPTResponseWorkflow(issue.relatedIOCs || [], {
        escalatedIssue: issue
      }, 'issue-escalation');
    }
  }

  private async evaluateTriggerConditions(workflowId: string, triggerData: any): Promise<boolean> {
    try {
      const definition = await this.workflowEngine.getWorkflowDefinition(workflowId);
      
      // Check all trigger conditions
      for (const trigger of definition.triggers) {
        if (trigger.enabled && trigger.conditions) {
          for (const condition of trigger.conditions) {
            // Simplified condition evaluation (would use secure sandbox in production)
            try {
              const func = new Function('data', `return ${condition.expression}`);
              if (!func(triggerData)) {
                return false;
              }
            } catch {
              logger.warn('Failed to evaluate trigger condition', {
                workflowId,
                condition: condition.expression
              });
              return false;
            }
          }
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Failed to evaluate trigger conditions', {
        workflowId,
        error: (error as Error).message
      });
      return false;
    }
  }

  // Performance monitoring
  private startMonitoring(): void {
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 60000); // Collect metrics every minute

    setInterval(() => {
      this.logPerformanceMetrics();
    }, 300000); // Log metrics every 5 minutes
  }

  private async collectPerformanceMetrics(): Promise<void> {
    try {
      const engineMetrics = await this.workflowEngine.getEngineMetrics();
      
      this.performanceMetrics.activeWorkflows = engineMetrics.activeInstances;
      
      // Update performance metrics
      this.emit('performance-metrics', {
        ...this.performanceMetrics,
        engineMetrics
      });
    } catch (error) {
      logger.error('Failed to collect performance metrics', {
        error: (error as Error).message
      });
    }
  }

  private logPerformanceMetrics(): void {
    logger.info('Workflow BPM Performance Metrics', {
      metrics: this.performanceMetrics
    });
  }

  private updateSuccessRate(success: boolean): void {
    if (this.performanceMetrics.totalWorkflowsExecuted === 0) {
      this.performanceMetrics.successRate = success ? 100 : 0;
      return;
    }

    const currentSuccessful = (this.performanceMetrics.successRate / 100) * (this.performanceMetrics.totalWorkflowsExecuted - 1);
    const newSuccessful = success ? currentSuccessful + 1 : currentSuccessful;
    this.performanceMetrics.successRate = (newSuccessful / this.performanceMetrics.totalWorkflowsExecuted) * 100;
  }

  private updateAverageExecutionTime(executionTime: number): void {
    if (this.performanceMetrics.totalWorkflowsExecuted === 1) {
      this.performanceMetrics.averageExecutionTime = executionTime;
      return;
    }

    const currentTotal = this.performanceMetrics.averageExecutionTime * (this.performanceMetrics.totalWorkflowsExecuted - 1);
    this.performanceMetrics.averageExecutionTime = (currentTotal + executionTime) / this.performanceMetrics.totalWorkflowsExecuted;
  }

  // Utility methods
  public getPerformanceMetrics(): any {
    return { ...this.performanceMetrics };
  }

  public async getEngineMetrics(): Promise<any> {
    return await this.workflowEngine.getEngineMetrics();
  }

  public async shutdown(): Promise<void> {
    logger.info('Shutting down Workflow BPM Orchestrator');
    
    // Cancel all active workflows
    const activeInstances = await this.listWorkflowInstances({ status: [WorkflowStatus.RUNNING] });
    for (const instance of activeInstances) {
      try {
        await this.cancelWorkflow(instance.id, 'System shutdown');
      } catch (error) {
        logger.error('Failed to cancel workflow during shutdown', {
          instanceId: instance.id,
          error: (error as Error).message
        });
      }
    }

    this.emit('orchestrator-shutdown');
    logger.info('Workflow BPM Orchestrator shut down complete');
  }
}

export default WorkflowBPMOrchestrator;