import { EventEmitter } from 'events';
import { IWorkflowEngineConfig } from './core/WorkflowEngine';
import { IWorkflowDefinition, IWorkflowInstance, ILogger } from './interfaces/IWorkflowEngine';
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
export declare class WorkflowBPMOrchestrator extends EventEmitter {
    private config;
    private workflowEngine;
    private repository;
    private integrations;
    private logger;
    private performanceMetrics;
    private executionHistory;
    constructor(config?: IWorkflowBPMConfig);
    private initialize;
    private setupIntegrations;
    private setupMessageQueueIntegration;
    private setupTaskManagerIntegration;
    private setupEvidenceManagerIntegration;
    private setupIssueManagerIntegration;
    private setupEventHandlers;
    registerWorkflowDefinition(definition: IWorkflowDefinition): Promise<void>;
    startWorkflow(workflowId: string, parameters?: Record<string, any>, initiatedBy?: string): Promise<IWorkflowInstance>;
    pauseWorkflow(instanceId: string): Promise<void>;
    resumeWorkflow(instanceId: string): Promise<void>;
    cancelWorkflow(instanceId: string, reason?: string): Promise<void>;
    getWorkflowInstance(instanceId: string): Promise<IWorkflowInstance>;
    getWorkflowDefinitions(): Promise<IWorkflowDefinition[]>;
    private handleWorkflowTriggerEvent;
    private handleWorkflowControlEvent;
    private handleTaskCompletionEvent;
    private handleEvidenceCollectionEvent;
    private handleIssueCreationEvent;
    private handleIssueEscalationEvent;
    private evaluateTriggerConditions;
    private evaluateCondition;
    private updateSuccessRate;
    private updateAverageExecutionTime;
    private addToExecutionHistory;
    private startPerformanceMonitoring;
    private updateResourceUtilization;
    getPerformanceMetrics(): any;
    getSystemHealth(): Promise<any>;
}
export default WorkflowBPMOrchestrator;
//# sourceMappingURL=WorkflowBPMOrchestrator.d.ts.map