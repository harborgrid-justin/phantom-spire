/**
 * Generic Workflow and BPM Core Interfaces
 * Enterprise-level workflow orchestration for any Node.js project
 */

import { EventEmitter } from 'events';

export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

export enum WorkflowPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum StepType {
  TASK = 'task',
  DECISION = 'decision',
  PARALLEL = 'parallel',
  SEQUENTIAL = 'sequential',
  SUBPROCESS = 'subprocess',
  TIMER = 'timer',
  MESSAGE = 'message',
  SCRIPT = 'script',
  HUMAN = 'human'
}

export enum TriggerType {
  EVENT = 'event',
  SCHEDULE = 'schedule',
  MANUAL = 'manual',
  API = 'api',
  MESSAGE = 'message',
  TIMER = 'timer'
}

export interface IWorkflowDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  tags: string[];
  
  // Process metadata
  metadata: {
    author: string;
    createdAt: Date;
    updatedAt: Date;
    approvedBy?: string;
    approvedAt?: Date;
  };
  
  // Trigger configuration
  triggers: ITrigger[];
  
  // Workflow steps
  steps: IWorkflowStep[];
  
  // Global variables and parameters
  variables: Record<string, IVariableDefinition>;
  parameters: Record<string, IParameterDefinition>;
  
  // SLA and performance requirements
  sla: ISLARequirements;
  
  // Security and compliance
  security: ISecurityConfiguration;
  
  // Integration settings
  integrations: IIntegrationConfiguration;
  
  // Monitoring and analytics
  monitoring: IMonitoringConfiguration;
}

export interface ITrigger {
  id: string;
  type: TriggerType;
  name: string;
  description: string;
  enabled: boolean;
  
  // Trigger-specific configuration
  configuration: Record<string, any>;
  
  // Conditions for trigger activation
  conditions?: ICondition[];
  
  // Rate limiting
  rateLimiting?: {
    maxExecutions: number;
    timeWindow: string; // e.g., '1h', '1d'
  };
}

export interface IWorkflowStep {
  id: string;
  name: string;
  type: StepType;
  description: string;
  
  // Step positioning (for visual designer)
  position: { x: number; y: number };
  
  // Step configuration
  configuration: Record<string, any>;
  
  // Input and output mappings
  inputs: Record<string, string>;
  outputs: Record<string, string>;
  
  // Flow control
  nextSteps: string[];
  errorHandling: IErrorHandling;
  
  // Conditional execution
  conditions?: ICondition[];
  
  // Retry configuration
  retry?: IRetryConfiguration;
  
  // Timeout settings
  timeout?: string; // e.g., '30s', '5m', '1h'
  
  // Human task settings (if type is HUMAN)
  humanTask?: IHumanTaskConfiguration;
}

export interface ICondition {
  expression: string; // JavaScript expression
  description: string;
}

export interface IErrorHandling {
  strategy: 'retry' | 'skip' | 'fail' | 'compensate';
  maxRetries?: number;
  retryDelay?: string;
  onError?: string[]; // Next steps on error
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
  options?: Array<{ value: any; label: string }>;
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
  responseTime?: string; // e.g., '15m', '1h'
  resolutionTime?: string;
  maxExecutionTime?: string;
  availabilityTarget?: number; // percentage
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

// Workflow Instance Interfaces
export interface IWorkflowInstance {
  id: string;
  workflowId: string;
  version: string;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  
  // Execution context
  variables: Record<string, any>;
  parameters: Record<string, any>;
  
  // Timing information
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  
  // Current execution state
  currentSteps: string[];
  completedSteps: string[];
  failedSteps: string[];
  
  // Metadata
  initiatedBy: string;
  parentInstanceId?: string; // For sub-processes
  
  // Error information
  error?: IWorkflowError;
  
  // Execution history
  history: IWorkflowEvent[];
  
  // Performance metrics
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

// Workflow Engine Interfaces
export interface IWorkflowEngine extends EventEmitter {
  // Workflow definition management
  registerWorkflowDefinition(definition: IWorkflowDefinition): Promise<void>;
  unregisterWorkflowDefinition(workflowId: string): Promise<void>;
  getWorkflowDefinition(workflowId: string): Promise<IWorkflowDefinition>;
  listWorkflowDefinitions(): Promise<IWorkflowDefinition[]>;
  
  // Workflow execution
  startWorkflow(workflowId: string, parameters?: Record<string, any>, initiatedBy?: string): Promise<IWorkflowInstance>;
  pauseWorkflow(instanceId: string): Promise<void>;
  resumeWorkflow(instanceId: string): Promise<void>;
  cancelWorkflow(instanceId: string, reason?: string): Promise<void>;
  retryFailedStep(instanceId: string, stepId: string): Promise<void>;
  
  // Instance management
  getWorkflowInstance(instanceId: string): Promise<IWorkflowInstance>;
  listWorkflowInstances(filters?: IWorkflowInstanceFilter): Promise<IWorkflowInstance[]>;
  
  // Event handling
  handleWorkflowEvent(event: any): Promise<void>;
  
  // Monitoring and metrics
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
    throughput: number; // workflows per second
    latency: number; // average start latency
    queueDepth: number;
  };
}

// Step Handler Interface
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

// Workflow Repository Interface
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

// Process Analytics Interface
export interface IProcessAnalytics {
  analyzeProcessPerformance(workflowId: string, timeRange?: { start: Date; end: Date }): Promise<IProcessAnalysisResult>;
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
    impact: number; // percentage impact on overall performance
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

// Logger Interface for dependency injection
export interface ILogger {
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}