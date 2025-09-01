import { EventEmitter } from 'events';
export declare enum WorkflowStatus {
    PENDING = "pending",
    RUNNING = "running",
    PAUSED = "paused",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    SUSPENDED = "suspended"
}
export declare enum WorkflowPriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare enum StepType {
    TASK = "task",
    DECISION = "decision",
    PARALLEL = "parallel",
    SEQUENTIAL = "sequential",
    SUBPROCESS = "subprocess",
    TIMER = "timer",
    MESSAGE = "message",
    SCRIPT = "script",
    HUMAN = "human"
}
export declare enum TriggerType {
    EVENT = "event",
    SCHEDULE = "schedule",
    MANUAL = "manual",
    API = "api",
    MESSAGE = "message",
    TIMER = "timer"
}
export interface IWorkflowDefinition {
    id: string;
    name: string;
    version: string;
    description: string;
    category: string;
    tags: string[];
    metadata: {
        author: string;
        createdAt: Date;
        updatedAt: Date;
        approvedBy?: string;
        approvedAt?: Date;
    };
    triggers: ITrigger[];
    steps: IWorkflowStep[];
    variables: Record<string, IVariableDefinition>;
    parameters: Record<string, IParameterDefinition>;
    sla: ISLARequirements;
    security: ISecurityConfiguration;
    integrations: IIntegrationConfiguration;
    monitoring: IMonitoringConfiguration;
}
export interface ITrigger {
    id: string;
    type: TriggerType;
    name: string;
    description: string;
    enabled: boolean;
    configuration: Record<string, any>;
    conditions?: ICondition[];
    rateLimiting?: {
        maxExecutions: number;
        timeWindow: string;
    };
}
export interface IWorkflowStep {
    id: string;
    name: string;
    type: StepType;
    description: string;
    position: {
        x: number;
        y: number;
    };
    configuration: Record<string, any>;
    inputs: Record<string, string>;
    outputs: Record<string, string>;
    nextSteps: string[];
    errorHandling: IErrorHandling;
    conditions?: ICondition[];
    retry?: IRetryConfiguration;
    timeout?: string;
    humanTask?: IHumanTaskConfiguration;
}
export interface ICondition {
    expression: string;
    description: string;
}
export interface IErrorHandling {
    strategy: 'retry' | 'skip' | 'fail' | 'compensate';
    maxRetries?: number;
    retryDelay?: string;
    onError?: string[];
    compensationSteps?: string[];
}
export interface IRetryConfiguration {
    maxAttempts: number;
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
    initialDelay: string;
    maxDelay?: string;
    multiplier?: number;
}
export interface IHumanTaskConfiguration {
    assignee?: string;
    candidateGroups?: string[];
    candidateUsers?: string[];
    priority: WorkflowPriority;
    dueDate?: Date;
    form?: IFormConfiguration;
}
export interface IFormConfiguration {
    fields: IFormField[];
    validation: Record<string, any>;
}
export interface IFormField {
    id: string;
    name: string;
    type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect';
    label: string;
    required: boolean;
    options?: Array<{
        value: any;
        label: string;
    }>;
    validation?: Record<string, any>;
}
export interface IVariableDefinition {
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    defaultValue?: any;
    description: string;
    required: boolean;
}
export interface IParameterDefinition extends IVariableDefinition {
    displayName: string;
    category: string;
    order: number;
}
export interface ISLARequirements {
    responseTime?: string;
    resolutionTime?: string;
    maxExecutionTime?: string;
    availabilityTarget?: number;
    performanceTargets?: Record<string, any>;
}
export interface ISecurityConfiguration {
    classification: 'public' | 'internal' | 'confidential' | 'restricted';
    requiredRoles: string[];
    requiredPermissions: string[];
    dataEncryption: boolean;
    auditLevel: 'none' | 'basic' | 'detailed' | 'comprehensive';
}
export interface IIntegrationConfiguration {
    taskManagement: {
        enabled: boolean;
        createTasks: boolean;
        updateTaskStatus: boolean;
        taskPriority: WorkflowPriority;
    };
    messageQueue: {
        enabled: boolean;
        publishEvents: boolean;
        subscribeToEvents: boolean;
        deadLetterQueue: boolean;
    };
    evidence: {
        enabled: boolean;
        collectEvidence: boolean;
        preserveChainOfCustody: boolean;
        evidenceRetention: string;
    };
    issues: {
        enabled: boolean;
        createIssues: boolean;
        linkToIssues: boolean;
        escalationRules: any[];
    };
}
export interface IMonitoringConfiguration {
    enabled: boolean;
    collectMetrics: boolean;
    alerting: {
        enabled: boolean;
        channels: string[];
        conditions: any[];
    };
    logging: {
        level: 'error' | 'warn' | 'info' | 'debug';
        includeStepDetails: boolean;
        includeVariables: boolean;
    };
}
export interface IWorkflowInstance {
    id: string;
    workflowId: string;
    version: string;
    status: WorkflowStatus;
    priority: WorkflowPriority;
    variables: Record<string, any>;
    parameters: Record<string, any>;
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
    currentSteps: string[];
    completedSteps: string[];
    failedSteps: string[];
    initiatedBy: string;
    parentInstanceId?: string;
    error?: IWorkflowError;
    history: IWorkflowEvent[];
    metrics: IWorkflowMetrics;
}
export interface IWorkflowError {
    code: string;
    message: string;
    stepId: string;
    timestamp: Date;
    stack?: string;
    context?: Record<string, any>;
}
export interface IWorkflowEvent {
    id: string;
    timestamp: Date;
    type: 'step_started' | 'step_completed' | 'step_failed' | 'workflow_paused' | 'workflow_resumed' | 'variable_updated';
    stepId?: string;
    data?: Record<string, any>;
    userId?: string;
}
export interface IWorkflowMetrics {
    executionTime: number;
    stepExecutionTimes: Record<string, number>;
    resourceUsage: {
        cpu: number;
        memory: number;
        network: number;
    };
    performanceScore: number;
    slaCompliance: boolean;
}
export interface IWorkflowEngine extends EventEmitter {
    registerWorkflowDefinition(definition: IWorkflowDefinition): Promise<void>;
    unregisterWorkflowDefinition(workflowId: string): Promise<void>;
    getWorkflowDefinition(workflowId: string): Promise<IWorkflowDefinition>;
    listWorkflowDefinitions(): Promise<IWorkflowDefinition[]>;
    startWorkflow(workflowId: string, parameters?: Record<string, any>, initiatedBy?: string): Promise<IWorkflowInstance>;
    pauseWorkflow(instanceId: string): Promise<void>;
    resumeWorkflow(instanceId: string): Promise<void>;
    cancelWorkflow(instanceId: string, reason?: string): Promise<void>;
    retryFailedStep(instanceId: string, stepId: string): Promise<void>;
    getWorkflowInstance(instanceId: string): Promise<IWorkflowInstance>;
    listWorkflowInstances(filters?: IWorkflowInstanceFilter): Promise<IWorkflowInstance[]>;
    handleWorkflowEvent(event: any): Promise<void>;
    getWorkflowMetrics(instanceId: string): Promise<IWorkflowMetrics>;
    getEngineMetrics(): Promise<IEngineMetrics>;
}
export interface IWorkflowInstanceFilter {
    workflowId?: string;
    status?: WorkflowStatus[];
    priority?: WorkflowPriority[];
    initiatedBy?: string;
    startedAfter?: Date;
    startedBefore?: Date;
    limit?: number;
    offset?: number;
}
export interface IEngineMetrics {
    activeInstances: number;
    totalExecutions: number;
    averageExecutionTime: number;
    successRate: number;
    failureRate: number;
    resourceUtilization: {
        cpu: number;
        memory: number;
        disk: number;
        network: number;
    };
    performance: {
        throughput: number;
        latency: number;
        queueDepth: number;
    };
}
export interface IStepHandler {
    type: StepType;
    execute(step: IWorkflowStep, context: IStepContext): Promise<IStepResult>;
    validate?(step: IWorkflowStep): Promise<IValidationResult>;
}
export interface IStepContext {
    workflowInstance: IWorkflowInstance;
    workflowDefinition: IWorkflowDefinition;
    variables: Record<string, any>;
    parameters: Record<string, any>;
    stepInputs: Record<string, any>;
    services: {
        taskManager?: any;
        messageQueue?: any;
        evidenceManager?: any;
        issueManager?: any;
        logger: any;
    };
}
export interface IStepResult {
    success: boolean;
    outputs?: Record<string, any>;
    nextSteps?: string[];
    error?: Error;
    metadata?: Record<string, any>;
}
export interface IValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export interface IWorkflowRepository {
    saveDefinition(definition: IWorkflowDefinition): Promise<void>;
    getDefinition(id: string, version?: string): Promise<IWorkflowDefinition>;
    getDefinitions(filters?: any): Promise<IWorkflowDefinition[]>;
    deleteDefinition(id: string, version?: string): Promise<void>;
    saveInstance(instance: IWorkflowInstance): Promise<void>;
    getInstance(id: string): Promise<IWorkflowInstance>;
    getInstances(filters?: IWorkflowInstanceFilter): Promise<IWorkflowInstance[]>;
    updateInstance(id: string, updates: Partial<IWorkflowInstance>): Promise<void>;
}
export interface IProcessAnalytics {
    analyzeProcessPerformance(workflowId: string, timeRange?: {
        start: Date;
        end: Date;
    }): Promise<IProcessAnalysisResult>;
    identifyBottlenecks(workflowId: string): Promise<IBottleneckAnalysis>;
    getOptimizationRecommendations(workflowId: string): Promise<IOptimizationRecommendation[]>;
    generateProcessInsights(workflowId: string): Promise<IProcessInsights>;
}
export interface IProcessAnalysisResult {
    workflowId: string;
    analysisDate: Date;
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    stepPerformance: Record<string, {
        averageTime: number;
        successRate: number;
        errorRate: number;
    }>;
    performanceTrends: Array<{
        date: Date;
        executionTime: number;
        throughput: number;
    }>;
}
export interface IBottleneckAnalysis {
    bottlenecks: Array<{
        stepId: string;
        stepName: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        impact: number;
        recommendations: string[];
    }>;
    overallScore: number;
}
export interface IOptimizationRecommendation {
    type: 'performance' | 'reliability' | 'cost' | 'security';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImprovement: string;
    implementationComplexity: 'low' | 'medium' | 'high';
    estimatedCost: number;
}
export interface IProcessInsights {
    executionPatterns: Record<string, any>;
    resourceUtilization: Record<string, any>;
    failureAnalysis: Record<string, any>;
    userInteraction: Record<string, any>;
    businessImpact: Record<string, any>;
}
export interface ILogger {
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
}
//# sourceMappingURL=IWorkflowEngine.d.ts.map