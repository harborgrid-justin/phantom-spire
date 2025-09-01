import { EventEmitter } from 'events';
import { IWorkflowEngine, IWorkflowDefinition, IWorkflowInstance, IWorkflowInstanceFilter, IEngineMetrics, IWorkflowMetrics, IStepHandler, ILogger } from '../interfaces/IWorkflowEngine';
import { IWorkflowRepository } from '../interfaces/IWorkflowEngine';
export interface IWorkflowEngineConfig {
    maxConcurrentWorkflows?: number;
    memoryLimit?: string;
    executionTimeout?: number;
    checkpointInterval?: number;
    optimization?: {
        enabled: boolean;
        mlOptimization: boolean;
        dynamicScaling: boolean;
    };
    logger?: ILogger;
}
export declare class WorkflowEngineCore extends EventEmitter implements IWorkflowEngine {
    private repository;
    private config;
    private stepHandlers;
    private activeInstances;
    private runningExecutions;
    private logger;
    private metrics;
    private executionStats;
    constructor(repository: IWorkflowRepository, config?: IWorkflowEngineConfig);
    private initializeEngine;
    private registerDefaultStepHandlers;
    private evaluateExpression;
    private parseDuration;
    registerWorkflowDefinition(definition: IWorkflowDefinition): Promise<void>;
    unregisterWorkflowDefinition(workflowId: string): Promise<void>;
    getWorkflowDefinition(workflowId: string): Promise<IWorkflowDefinition>;
    listWorkflowDefinitions(): Promise<IWorkflowDefinition[]>;
    startWorkflow(workflowId: string, parameters?: Record<string, any>, initiatedBy?: string): Promise<IWorkflowInstance>;
    private executeWorkflow;
    private executeSteps;
    private resolveStepInputs;
    pauseWorkflow(instanceId: string): Promise<void>;
    resumeWorkflow(instanceId: string): Promise<void>;
    cancelWorkflow(instanceId: string, reason?: string): Promise<void>;
    retryFailedStep(instanceId: string, stepId: string): Promise<void>;
    getWorkflowInstance(instanceId: string): Promise<IWorkflowInstance>;
    listWorkflowInstances(filters?: IWorkflowInstanceFilter): Promise<IWorkflowInstance[]>;
    handleWorkflowEvent(event: any): Promise<void>;
    getWorkflowMetrics(instanceId: string): Promise<IWorkflowMetrics>;
    getEngineMetrics(): Promise<IEngineMetrics>;
    registerStepHandler(handler: IStepHandler): void;
    private updateExecutionStats;
    private createCheckpoints;
    private startMetricsCollection;
}
//# sourceMappingURL=WorkflowEngine.d.ts.map