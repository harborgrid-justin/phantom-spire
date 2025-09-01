/**
 * Generic Workflow BPM Orchestrator
 * Main orchestrator integrating workflow engine with external services
 */

import { EventEmitter } from 'events';
import { WorkflowEngineCore, IWorkflowEngineConfig } from './core/WorkflowEngine';
import { InMemoryWorkflowRepository } from './repository/InMemoryWorkflowRepository';
import { 
  IWorkflowEngine, 
  IWorkflowDefinition, 
  IWorkflowInstance,
  WorkflowStatus,
  ILogger
} from './interfaces/IWorkflowEngine';

// Default console logger
const defaultLogger: ILogger = {
  error: (message: string, meta?: any) => console.error(message, meta),
  warn: (message: string, meta?: any) => console.warn(message, meta),
  info: (message: string, meta?: any) => console.info(message, meta),
  debug: (message: string, meta?: any) => console.debug(message, meta)
};

export interface IWorkflowBPMConfig {
  database?: {
    connectionString?: string;
  };
  engine?: IWorkflowEngineConfig;
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
  logger?: ILogger;
}

export class WorkflowBPMOrchestrator extends EventEmitter {
  private workflowEngine!: IWorkflowEngine;
  private repository!: InMemoryWorkflowRepository;
  private integrations: any = {};
  private logger: ILogger;
  
  // Performance and monitoring
  private performanceMetrics = {
    totalWorkflowsExecuted: 0,
    averageExecutionTime: 0,
    successRate: 0,
    activeWorkflows: 0,
    peakActiveWorkflows: 0,
    totalErrors: 0,
    resourceUtilization: {
      cpu: 0,
      memory: 0,
      disk: 0
    }
  };

  private executionHistory: Array<{ timestamp: Date; duration: number; success: boolean }> = [];

  constructor(private config: IWorkflowBPMConfig = {}) {
    super();
    
    this.logger = this.config.logger || defaultLogger;
    
    this.logger.info('Initializing Generic Workflow BPM Orchestrator', {
      component: 'WorkflowBPMOrchestrator',
      config: this.config
    });

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize repository
      this.repository = new InMemoryWorkflowRepository(this.logger);
      
      // Initialize workflow engine
      const engineConfig: IWorkflowEngineConfig = {
        ...this.config.engine,
        logger: this.logger
      };
      
      this.workflowEngine = new WorkflowEngineCore(this.repository, engineConfig);
      
      // Setup integrations
      this.setupIntegrations();
      
      // Setup event handlers
      this.setupEventHandlers();
      
      // Start monitoring
      this.startPerformanceMonitoring();
      
      this.logger.info('Workflow BPM Orchestrator initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Workflow BPM Orchestrator', { 
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

    this.logger.info('Workflow BPM integrations configured', {
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
        this.logger.error('Failed to handle workflow trigger event', {
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
        this.logger.error('Failed to handle workflow control event', {
          message,
          error: (error as Error).message
        });
      }
    });

    this.logger.info('Message queue integration configured for workflows');
  }

  private setupTaskManagerIntegration(): void {
    const taskManager = this.integrations.taskManager;
    
    // Listen for task completion events that might trigger workflows
    taskManager.on('task-completed', async (task: any) => {
      try {
        await this.handleTaskCompletionEvent(task);
      } catch (error) {
        this.logger.error('Failed to handle task completion event', {
          taskId: task.id,
          error: (error as Error).message
        });
      }
    });

    this.logger.info('Task manager integration configured for workflows');
  }

  private setupEvidenceManagerIntegration(): void {
    const evidenceManager = this.integrations.evidenceManager;
    
    // Listen for evidence collection events
    evidenceManager.on('evidence-collected', async (evidence: any) => {
      try {
        await this.handleEvidenceCollectionEvent(evidence);
      } catch (error) {
        this.logger.error('Failed to handle evidence collection event', {
          evidenceId: evidence.id,
          error: (error as Error).message
        });
      }
    });

    this.logger.info('Evidence manager integration configured for workflows');
  }

  private setupIssueManagerIntegration(): void {
    const issueManager = this.integrations.issueManager;
    
    // Listen for issue events that might trigger workflows
    issueManager.on('issue-created', async (issue: any) => {
      try {
        await this.handleIssueCreationEvent(issue);
      } catch (error) {
        this.logger.error('Failed to handle issue creation event', {
          issueId: issue.id,
          error: (error as Error).message
        });
      }
    });

    issueManager.on('issue-escalated', async (issue: any) => {
      try {
        await this.handleIssueEscalationEvent(issue);
      } catch (error) {
        this.logger.error('Failed to handle issue escalation event', {
          issueId: issue.id,
          error: (error as Error).message
        });
      }
    });

    this.logger.info('Issue manager integration configured for workflows');
  }

  private setupEventHandlers(): void {
    // Workflow engine events
    this.workflowEngine.on('workflowStarted', (data: any) => {
      this.performanceMetrics.activeWorkflows++;
      this.performanceMetrics.peakActiveWorkflows = Math.max(
        this.performanceMetrics.peakActiveWorkflows,
        this.performanceMetrics.activeWorkflows
      );
      this.emit('workflow-started', data.instance);
      this.logger.info('Workflow started', { instanceId: data.instance.id, workflowId: data.instance.workflowId });
    });

    this.workflowEngine.on('workflowCompleted', (data: any) => {
      this.performanceMetrics.activeWorkflows--;
      this.performanceMetrics.totalWorkflowsExecuted++;
      this.updateSuccessRate(true);
      this.updateAverageExecutionTime(data.instance.duration || 0);
      this.addToExecutionHistory(data.instance.duration || 0, true);
      this.emit('workflow-completed', data.instance);
      this.logger.info('Workflow completed', { instanceId: data.instance.id, duration: data.instance.duration });
    });

    this.workflowEngine.on('workflowFailed', (data: any) => {
      this.performanceMetrics.activeWorkflows--;
      this.performanceMetrics.totalWorkflowsExecuted++;
      this.performanceMetrics.totalErrors++;
      this.updateSuccessRate(false);
      this.addToExecutionHistory(data.instance.duration || 0, false);
      this.emit('workflow-failed', data.instance, data.error);
      this.logger.error('Workflow failed', { instanceId: data.instance.id, error: data.error.message });
    });

    this.workflowEngine.on('workflowPaused', (data: any) => {
      this.emit('workflow-paused', data.instanceId);
      this.logger.info('Workflow paused', { instanceId: data.instanceId });
    });

    this.workflowEngine.on('workflowResumed', (data: any) => {
      this.emit('workflow-resumed', data.instanceId);
      this.logger.info('Workflow resumed', { instanceId: data.instanceId });
    });

    this.workflowEngine.on('workflowCancelled', (data: any) => {
      this.performanceMetrics.activeWorkflows--;
      this.emit('workflow-cancelled', data.instanceId);
      this.logger.info('Workflow cancelled', { instanceId: data.instanceId });
    });
  }

  // Public API methods
  public async registerWorkflowDefinition(definition: IWorkflowDefinition): Promise<void> {
    try {
      await this.workflowEngine.registerWorkflowDefinition(definition);
      this.logger.info('Workflow definition registered', { 
        id: definition.id, 
        name: definition.name 
      });
    } catch (error) {
      this.logger.error('Failed to register workflow definition', {
        id: definition.id,
        error: (error as Error).message
      });
      throw error;
    }
  }

  public async startWorkflow(
    workflowId: string, 
    parameters: Record<string, any> = {}, 
    initiatedBy: string = 'system'
  ): Promise<IWorkflowInstance> {
    try {
      this.logger.info('Starting workflow', { workflowId, parameters, initiatedBy });
      return await this.workflowEngine.startWorkflow(workflowId, parameters, initiatedBy);
    } catch (error) {
      this.logger.error('Failed to start workflow', { 
        workflowId, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  public async pauseWorkflow(instanceId: string): Promise<void> {
    try {
      await this.workflowEngine.pauseWorkflow(instanceId);
      this.logger.info('Workflow paused', { instanceId });
    } catch (error) {
      this.logger.error('Failed to pause workflow', { 
        instanceId, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  public async resumeWorkflow(instanceId: string): Promise<void> {
    try {
      await this.workflowEngine.resumeWorkflow(instanceId);
      this.logger.info('Workflow resumed', { instanceId });
    } catch (error) {
      this.logger.error('Failed to resume workflow', { 
        instanceId, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  public async cancelWorkflow(instanceId: string, reason?: string): Promise<void> {
    try {
      await this.workflowEngine.cancelWorkflow(instanceId, reason);
      this.logger.info('Workflow cancelled', { instanceId, reason });
    } catch (error) {
      this.logger.error('Failed to cancel workflow', { 
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
      this.logger.error('Failed to get workflow instance', { 
        instanceId, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  public async getWorkflowDefinitions(): Promise<IWorkflowDefinition[]> {
    try {
      return await this.workflowEngine.listWorkflowDefinitions();
    } catch (error) {
      this.logger.error('Failed to get workflow definitions', { 
        error: (error as Error).message 
      });
      throw error;
    }
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
      this.logger.error('Failed to handle workflow trigger event', {
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
          this.logger.warn('Unknown workflow control action', { action, instanceId });
      }
    } catch (error) {
      this.logger.error('Failed to handle workflow control event', {
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
    // This is a generic handler that can be overridden by users
    if (evidence.workflowTriggers) {
      for (const trigger of evidence.workflowTriggers) {
        await this.startWorkflow(trigger.workflowId, {
          evidence,
          ...trigger.parameters
        }, 'evidence-collection');
      }
    }
  }

  private async handleIssueCreationEvent(issue: any): Promise<void> {
    // Issue creation might trigger response workflows
    // This is a generic handler that can be overridden by users
    if (issue.workflowTriggers) {
      for (const trigger of issue.workflowTriggers) {
        await this.startWorkflow(trigger.workflowId, {
          issue,
          ...trigger.parameters
        }, 'issue-creation');
      }
    }
  }

  private async handleIssueEscalationEvent(issue: any): Promise<void> {
    // Issue escalation might trigger additional workflows
    // This is a generic handler that can be overridden by users
    if (issue.escalationWorkflowTriggers) {
      for (const trigger of issue.escalationWorkflowTriggers) {
        await this.startWorkflow(trigger.workflowId, {
          issue,
          escalationLevel: issue.escalationLevel,
          ...trigger.parameters
        }, 'issue-escalation');
      }
    }
  }

  // Helper methods
  private async evaluateTriggerConditions(workflowId: string, triggerData: any): Promise<boolean> {
    try {
      const definition = await this.workflowEngine.getWorkflowDefinition(workflowId);
      
      // Find matching trigger
      const trigger = definition.triggers.find(t => t.enabled);
      if (!trigger || !trigger.conditions) {
        return true; // No conditions means always trigger
      }

      // Evaluate conditions (simplified implementation)
      for (const condition of trigger.conditions) {
        try {
          const result = this.evaluateCondition(condition.expression, triggerData);
          if (!result) {
            return false;
          }
        } catch (error) {
          this.logger.warn('Failed to evaluate trigger condition', {
            workflowId,
            condition: condition.expression,
            error
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error('Failed to evaluate trigger conditions', {
        workflowId,
        error: (error as Error).message
      });
      return false;
    }
  }

  private evaluateCondition(expression: string, context: any): boolean {
    // WARNING: This is a simplified implementation
    // In production, use a secure sandboxed expression evaluator
    try {
      const func = new Function('context', `with(context) { return ${expression} }`);
      return !!func(context);
    } catch (error) {
      this.logger.warn('Expression evaluation failed', { expression, error });
      return false;
    }
  }

  // Performance monitoring
  private updateSuccessRate(success: boolean): void {
    if (this.performanceMetrics.totalWorkflowsExecuted === 0) {
      this.performanceMetrics.successRate = success ? 100 : 0;
    } else {
      const successCount = Math.round(this.performanceMetrics.successRate * (this.performanceMetrics.totalWorkflowsExecuted - 1) / 100);
      const newSuccessCount = successCount + (success ? 1 : 0);
      this.performanceMetrics.successRate = (newSuccessCount / this.performanceMetrics.totalWorkflowsExecuted) * 100;
    }
  }

  private updateAverageExecutionTime(duration: number): void {
    if (this.performanceMetrics.totalWorkflowsExecuted === 1) {
      this.performanceMetrics.averageExecutionTime = duration;
    } else {
      const totalTime = this.performanceMetrics.averageExecutionTime * (this.performanceMetrics.totalWorkflowsExecuted - 1);
      this.performanceMetrics.averageExecutionTime = (totalTime + duration) / this.performanceMetrics.totalWorkflowsExecuted;
    }
  }

  private addToExecutionHistory(duration: number, success: boolean): void {
    this.executionHistory.push({
      timestamp: new Date(),
      duration,
      success
    });

    // Keep only last 1000 executions
    if (this.executionHistory.length > 1000) {
      this.executionHistory.shift();
    }
  }

  private startPerformanceMonitoring(): void {
    // Start periodic performance monitoring
    setInterval(() => {
      this.updateResourceUtilization();
      this.emit('performance-metrics', this.getPerformanceMetrics());
    }, 30000); // Every 30 seconds
  }

  private updateResourceUtilization(): void {
    // This would be implemented with actual resource monitoring
    // For now, just mock values
    this.performanceMetrics.resourceUtilization = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100
    };
  }

  // Public getters for monitoring
  public getPerformanceMetrics(): any {
    return {
      ...this.performanceMetrics,
      executionHistory: this.executionHistory.slice(-10) // Last 10 executions
    };
  }

  public async getSystemHealth(): Promise<any> {
    const engineMetrics = await this.workflowEngine.getEngineMetrics();
    const repoStats = await this.repository.getStats();
    
    return {
      status: this.performanceMetrics.activeWorkflows > 0 ? 'active' : 'idle',
      performance: this.performanceMetrics,
      engine: engineMetrics,
      repository: repoStats,
      integrations: {
        taskManager: !!this.integrations.taskManager,
        messageQueue: !!this.integrations.messageQueue,
        evidenceManager: !!this.integrations.evidenceManager,
        issueManager: !!this.integrations.issueManager
      }
    };
  }
}

export default WorkflowBPMOrchestrator;