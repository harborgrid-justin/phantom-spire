/**
 * Fortune 100-Grade Task Management Interface Definitions
 * Provides enterprise-level task orchestration capabilities
 */

export interface ITask {
  id: string;
  name: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;

  // Task Definition
  definition: ITaskDefinition;

  // Execution Context
  context: ITaskExecutionContext;

  // Dependencies
  dependencies: string[];
  dependents: string[];

  // Scheduling
  schedule?: ITaskSchedule;

  // Lifecycle timestamps
  createdAt: Date;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;

  // Execution Details
  executionHistory: ITaskExecution[];
  currentExecution?: ITaskExecution;

  // Metadata
  metadata: Record<string, any>;
  tags: string[];

  // Ownership & Security
  createdBy: string;
  assignedTo?: string;
  permissions: string[];
}

export enum TaskType {
  DATA_INGESTION = 'data_ingestion',
  THREAT_ANALYSIS = 'threat_analysis',
  IOC_PROCESSING = 'ioc_processing',
  EVIDENCE_COLLECTION = 'evidence_collection',
  REPORT_GENERATION = 'report_generation',
  ALERTING = 'alerting',
  DATA_ENRICHMENT = 'data_enrichment',
  CORRELATION_ANALYSIS = 'correlation_analysis',
  CUSTOM = 'custom',
}

export enum TaskStatus {
  CREATED = 'created',
  QUEUED = 'queued',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
  RETRY = 'retry',
}

export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
}

export interface ITaskDefinition {
  handler: string; // Handler class/function reference
  parameters: Record<string, any>;
  timeout: number; // milliseconds
  retryPolicy: IRetryPolicy;
  resources: IResourceRequirements;
  validation: ITaskValidation;
}

export interface IRetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  multiplier?: number;
  retryConditions: string[]; // Error types that should trigger retry
}

export interface IResourceRequirements {
  memory: number; // MB
  cpu: number; // CPU units (0.1 = 10% of 1 CPU core)
  disk?: number; // MB
  networkBandwidth?: number; // Mbps
  exclusiveResources?: string[]; // Resource locks needed
}

export interface ITaskValidation {
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
  preconditions?: string[]; // Condition expressions that must be true
  postconditions?: string[]; // Condition expressions that must be true after execution
}

export interface ITaskExecutionContext {
  executionId: string;
  parentTaskId?: string;
  workflowId?: string;
  environment: 'production' | 'staging' | 'development' | 'test';
  region?: string;
  datacenter?: string;

  // Security Context
  userId: string;
  permissions: string[];
  securityLevel:
    | 'public'
    | 'internal'
    | 'confidential'
    | 'restricted'
    | 'top_secret';

  // Execution Configuration
  debug: boolean;
  tracing: boolean;
  profiling: boolean;
}

export interface ITaskSchedule {
  type: 'once' | 'recurring' | 'event_driven';

  // One-time execution
  executeAt?: Date;

  // Recurring execution
  cronExpression?: string;
  interval?: number; // milliseconds

  // Event-driven execution
  triggers?: ITaskTrigger[];

  // Schedule constraints
  timezone?: string;
  startDate?: Date;
  endDate?: Date;
  maxExecutions?: number;
}

export interface ITaskTrigger {
  type: 'data_change' | 'time_based' | 'external_event' | 'task_completion';
  source: string;
  conditions: Record<string, any>;
  enabled: boolean;
}

export interface ITaskExecution {
  id: string;
  taskId: string;
  attempt: number;
  status: TaskStatus;

  // Execution Timeline
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;

  // Execution Results
  result?: ITaskResult;
  error?: ITaskError;

  // Performance Metrics
  metrics: ITaskMetrics;

  // Resource Usage
  resourceUsage: IResourceUsage;

  // Logging & Debugging
  logs: ITaskLog[];
  traces?: ITaskTrace[];

  // Checkpoint Data (for long-running tasks)
  checkpoints: ITaskCheckpoint[];
}

export interface ITaskResult {
  success: boolean;
  data?: any;
  summary: string;

  // Output artifacts
  artifacts: ITaskArtifact[];

  // Validation Results
  validationResults?: ITaskValidationResult[];
}

export interface ITaskError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stackTrace?: string;
  timestamp: Date;
  recoverable: boolean;
  retryable: boolean;
}

export interface ITaskMetrics {
  executionTime: number; // milliseconds
  queueTime: number; // milliseconds
  processingTime: number; // milliseconds

  // Throughput metrics
  recordsProcessed?: number;
  bytesProcessed?: number;

  // Quality metrics
  successRate: number; // 0-1
  errorRate: number; // 0-1

  // Performance indicators
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;

  // Custom metrics
  custom: Record<string, number>;
}

export interface IResourceUsage {
  memory: {
    peak: number; // MB
    average: number; // MB
  };
  cpu: {
    peak: number; // percentage
    average: number; // percentage
    totalTime: number; // milliseconds
  };
  disk?: {
    read: number; // MB
    write: number; // MB
    space: number; // MB used
  };
  network?: {
    inbound: number; // MB
    outbound: number; // MB
  };
}

export interface ITaskLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  context?: Record<string, any>;
  source: string;
}

export interface ITaskTrace {
  timestamp: Date;
  operation: string;
  duration: number; // milliseconds
  status: 'success' | 'error';
  metadata?: Record<string, any>;
}

export interface ITaskCheckpoint {
  id: string;
  timestamp: Date;
  progress: number; // 0-1
  state: Record<string, any>;
  recoverable: boolean;
}

export interface ITaskArtifact {
  id: string;
  name: string;
  type: string;
  size: number; // bytes
  location: string; // URI/path
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface ITaskValidationResult {
  rule: string;
  passed: boolean;
  message?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface ITaskQuery {
  ids?: string[];
  types?: TaskType[];
  statuses?: TaskStatus[];
  priorities?: TaskPriority[];

  // Time-based filters
  createdAfter?: Date;
  createdBefore?: Date;
  scheduledAfter?: Date;
  scheduledBefore?: Date;

  // Ownership filters
  createdBy?: string;
  assignedTo?: string;

  // Tag and metadata filters
  tags?: string[];
  metadata?: Record<string, any>;

  // Relationship filters
  parentTaskId?: string;
  workflowId?: string;

  // Pagination
  limit?: number;
  offset?: number;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
}

export interface ITaskQueryResult {
  tasks: ITask[];
  total: number;
  hasMore: boolean;
  executionTime: number;
}

/**
 * Core Task Manager Interface
 */
export interface ITaskManager {
  // Initialization
  initialize(): Promise<void>;

  // Task Lifecycle Management
  createTask(definition: Partial<ITask>): Promise<ITask>;
  getTask(taskId: string): Promise<ITask | null>;
  updateTask(taskId: string, updates: Partial<ITask>): Promise<ITask>;
  deleteTask(taskId: string): Promise<boolean>;

  // Task Execution Control
  executeTask(
    taskId: string,
    context?: Partial<ITaskExecutionContext>
  ): Promise<ITaskExecution>;
  pauseTask(taskId: string): Promise<boolean>;
  resumeTask(taskId: string): Promise<boolean>;
  cancelTask(taskId: string): Promise<boolean>;
  retryTask(taskId: string): Promise<ITaskExecution>;

  // Task Querying and Search
  queryTasks(query: ITaskQuery): Promise<ITaskQueryResult>;
  searchTasks(
    searchTerm: string,
    options?: { fields?: string[]; limit?: number }
  ): Promise<ITaskQueryResult>;

  // Task Dependencies
  addDependency(taskId: string, dependencyId: string): Promise<boolean>;
  removeDependency(taskId: string, dependencyId: string): Promise<boolean>;
  getDependencies(taskId: string): Promise<ITask[]>;
  getDependents(taskId: string): Promise<ITask[]>;

  // Task Scheduling
  scheduleTask(taskId: string, schedule: ITaskSchedule): Promise<boolean>;
  unscheduleTask(taskId: string): Promise<boolean>;
  getScheduledTasks(timeRange?: { start: Date; end: Date }): Promise<ITask[]>;

  // Task Monitoring
  getTaskStatus(taskId: string): Promise<TaskStatus>;
  getTaskMetrics(taskId: string): Promise<ITaskMetrics>;
  getExecutionHistory(taskId: string): Promise<ITaskExecution[]>;
  getTaskLogs(taskId: string, executionId?: string): Promise<ITaskLog[]>;

  // Bulk Operations
  executeTasks(taskIds: string[]): Promise<ITaskExecution[]>;
  cancelTasks(taskIds: string[]): Promise<boolean[]>;
  updateTasks(
    updates: Array<{ id: string; changes: Partial<ITask> }>
  ): Promise<ITask[]>;

  // Resource Management
  getResourceUsage(): Promise<IResourceUsage>;
  getAvailableResources(): Promise<IResourceRequirements>;

  // Health and Diagnostics
  healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }>;
  getSystemMetrics(): Promise<Record<string, any>>;
}

/**
 * Task Handler Interface - Implement this to create custom task handlers
 */
export interface ITaskHandler {
  readonly name: string;
  readonly version: string;
  readonly supportedTypes: TaskType[];

  // Lifecycle methods
  initialize(): Promise<void>;
  shutdown(): Promise<void>;

  // Task execution
  execute(task: ITask, context: ITaskExecutionContext): Promise<ITaskResult>;

  // Optional lifecycle hooks
  beforeExecute?(task: ITask, context: ITaskExecutionContext): Promise<void>;
  afterExecute?(
    task: ITask,
    result: ITaskResult,
    context: ITaskExecutionContext
  ): Promise<void>;
  onError?(
    task: ITask,
    error: ITaskError,
    context: ITaskExecutionContext
  ): Promise<boolean>; // return true to retry

  // Progress reporting (for long-running tasks)
  reportProgress?(progress: number, message?: string): Promise<void>;
  createCheckpoint?(state: Record<string, any>): Promise<string>;
  restoreFromCheckpoint?(checkpointId: string): Promise<Record<string, any>>;

  // Validation
  validateInput?(input: any): Promise<ITaskValidationResult[]>;
  validateOutput?(output: any): Promise<ITaskValidationResult[]>;

  // Resource estimation
  estimateResources?(
    parameters: Record<string, any>
  ): Promise<IResourceRequirements>;
}

/**
 * Task Workflow Interface - For managing complex multi-task workflows
 */
export interface ITaskWorkflow {
  id: string;
  name: string;
  description?: string;

  // Workflow definition
  tasks: ITask[];
  dependencies: Array<{ from: string; to: string; condition?: string }>;

  // Execution control
  status:
    | 'created'
    | 'running'
    | 'paused'
    | 'completed'
    | 'failed'
    | 'cancelled';

  // Metadata
  createdAt: Date;
  createdBy: string;
  tags: string[];

  // Configuration
  maxParallelTasks?: number;
  failurePolicy: 'stop_on_first_failure' | 'continue_on_failure' | 'custom';
  timeout?: number; // milliseconds
}

export interface ITaskWorkflowManager {
  createWorkflow(definition: Partial<ITaskWorkflow>): Promise<ITaskWorkflow>;
  executeWorkflow(workflowId: string): Promise<ITaskExecution[]>;
  getWorkflow(workflowId: string): Promise<ITaskWorkflow | null>;
  cancelWorkflow(workflowId: string): Promise<boolean>;
  getWorkflowStatus(
    workflowId: string
  ): Promise<{ status: string; completedTasks: number; totalTasks: number }>;
}
