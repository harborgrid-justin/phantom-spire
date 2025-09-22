/**
 * Enterprise TypeScript Type Definitions
 * Comprehensive type system for phantom-ml-studio
 * Strict typing for production-grade development
 */

// ================================================================================================
// CORE APPLICATION TYPES
// ================================================================================================

/**
 * Base response structure for all API endpoints
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T = unknown> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Service context for operations
 */
export interface ServiceContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  permissions: string[];
  startTime: Date;
  timeout?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Database entity base interface
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  version: number;
  isDeleted?: boolean;
}

// ================================================================================================
// USER MANAGEMENT TYPES
// ================================================================================================

export type UserRole = 'admin' | 'analyst' | 'viewer' | 'api_user';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User extends BaseEntity {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  permissions: string[];
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  settings: UserSettings;
  profile?: UserProfile;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    inApp: boolean;
    types: NotificationType[];
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
}

export interface UserProfile {
  avatar?: string;
  bio?: string;
  company?: string;
  department?: string;
  title?: string;
  location?: string;
  phone?: string;
  preferences: Record<string, unknown>;
}

export interface AuthenticationResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  scope: string[];
}

// ================================================================================================
// ML MODEL TYPES
// ================================================================================================

export type ModelType = 
  | 'classification'
  | 'regression' 
  | 'clustering'
  | 'dimensionality_reduction'
  | 'anomaly_detection'
  | 'time_series'
  | 'deep_learning'
  | 'ensemble'
  | 'custom';

export type ModelStatus = 
  | 'draft'
  | 'training'
  | 'trained'
  | 'validated'
  | 'deployed'
  | 'retired'
  | 'failed'
  | 'archived';

export type ModelFramework = 
  | 'scikit-learn'
  | 'tensorflow'
  | 'pytorch' 
  | 'xgboost'
  | 'lightgbm'
  | 'custom'
  | 'ensemble';

export interface MLModel extends BaseEntity {
  name: string;
  description?: string;
  type: ModelType;
  framework: ModelFramework;
  status: ModelStatus;
  version: string;
  tags: string[];
  
  // Model configuration
  algorithm: string;
  hyperparameters: Record<string, unknown>;
  features: ModelFeature[];
  
  // Training information
  trainingConfig?: TrainingConfiguration;
  trainingJob?: TrainingJob;
  
  // Performance metrics
  performance?: ModelPerformance;
  validation?: ValidationResult;
  
  // Deployment information
  deployment?: ModelDeployment;
  
  // Metadata
  metadata: {
    datasetId?: string;
    experimentId?: string;
    parentModelId?: string;
    checksum?: string;
    size?: number;
    framework_version?: string;
    python_version?: string;
    environment?: Record<string, string>;
  };
}

export interface ModelFeature {
  name: string;
  type: 'numerical' | 'categorical' | 'boolean' | 'text' | 'datetime' | 'image';
  description?: string;
  importance?: number;
  nullable: boolean;
  defaultValue?: unknown;
  constraints?: {
    min?: number;
    max?: number;
    enum?: string[];
    pattern?: string;
    required?: boolean;
  };
  preprocessing?: {
    scaler?: 'standard' | 'minmax' | 'robust' | 'none';
    encoding?: 'onehot' | 'label' | 'target' | 'none';
    imputation?: 'mean' | 'median' | 'mode' | 'constant' | 'none';
  };
}

export interface TrainingConfiguration {
  dataset: {
    trainingPath: string;
    validationPath?: string;
    testPath?: string;
    splitRatio?: [number, number, number]; // train, val, test
  };
  algorithm: {
    name: string;
    parameters: Record<string, unknown>;
  };
  features: {
    target: string;
    predictors: string[];
    exclude?: string[];
  };
  preprocessing: {
    scaleFeatures: boolean;
    handleMissingValues: 'drop' | 'impute' | 'flag';
    outlierDetection: boolean;
    featureEngineering?: string[];
  };
  validation: {
    method: 'holdout' | 'cross_validation' | 'time_series_split';
    folds?: number;
    stratify?: boolean;
    shuffle?: boolean;
  };
  optimization?: {
    metric: string;
    direction: 'maximize' | 'minimize';
    earlyStoppingRounds?: number;
    hyperparameterTuning?: {
      method: 'grid' | 'random' | 'bayesian';
      maxEvals: number;
      searchSpace: Record<string, unknown>;
    };
  };
  resources: {
    maxTrainingTime?: number; // minutes
    maxMemory?: number; // MB
    gpuEnabled?: boolean;
    parallelJobs?: number;
  };
}

export interface TrainingJob extends BaseEntity {
  modelId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // seconds
  
  logs: TrainingLog[];
  metrics: TrainingMetrics;
  
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  
  resources?: {
    cpuUsage: number[];
    memoryUsage: number[];
    gpuUsage?: number[];
    diskUsage?: number;
  };
}

export interface TrainingLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  epoch?: number;
  step?: number;
  metrics?: Record<string, number>;
}

export interface TrainingMetrics {
  epochs?: number;
  batchSize?: number;
  learningRate?: number;
  
  // Progress metrics per epoch/iteration
  history: {
    epoch: number;
    metrics: Record<string, number>; // loss, accuracy, etc.
    validationMetrics?: Record<string, number>;
    timestamp: Date;
  }[];
  
  // Final metrics
  finalMetrics: Record<string, number>;
  bestMetrics?: Record<string, number>;
  bestEpoch?: number;
}

export interface ModelPerformance {
  // Classification metrics
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  confusion_matrix?: number[][];
  classificationReport?: Record<string, {
    precision: number;
    recall: number;
    f1Score: number;
    support: number;
  }>;
  
  // Regression metrics
  mse?: number;
  mae?: number;
  rmse?: number;
  r2?: number;
  adjustedR2?: number;
  
  // Generic metrics
  crossValidationScore?: number[];
  cv_mean?: number;
  cv_std?: number;
  
  // Additional metrics
  customMetrics?: Record<string, number>;
  
  // Performance over time
  performanceHistory?: {
    timestamp: Date;
    metrics: Record<string, number>;
  }[];
}

export interface ValidationResult {
  method: 'holdout' | 'cross_validation' | 'bootstrap';
  folds?: number;
  
  scores: number[];
  mean: number;
  std: number;
  
  detailed?: {
    fold: number;
    trainScore: number;
    validationScore: number;
    metrics: Record<string, number>;
  }[];
  
  statistical_significance?: {
    pValue: number;
    significant: boolean;
    confidenceInterval: [number, number];
  };
}

export interface ModelDeployment extends BaseEntity {
  modelId: string;
  name: string;
  environment: 'staging' | 'production' | 'canary' | 'shadow';
  status: 'deploying' | 'active' | 'inactive' | 'failed' | 'terminated';
  
  endpoint?: {
    url: string;
    method: 'POST' | 'GET';
    authentication: 'api_key' | 'bearer' | 'none';
    rateLimit?: {
      requests: number;
      window: number; // seconds
    };
  };
  
  scaling?: {
    minReplicas: number;
    maxReplicas: number;
    targetCPU: number; // percentage
    targetMemory: number; // percentage
  };
  
  monitoring?: {
    healthCheck: boolean;
    metricsEnabled: boolean;
    loggingLevel: 'debug' | 'info' | 'warning' | 'error';
    alerting: {
      errorRate: number; // percentage threshold
      responseTime: number; // ms threshold
      availability: number; // percentage threshold
    };
  };
  
  rollout?: {
    strategy: 'rolling' | 'blue_green' | 'canary';
    trafficSplit?: number; // percentage for canary
    rollbackOnFailure: boolean;
  };
}

// ================================================================================================
// EXPERIMENT TRACKING TYPES
// ================================================================================================

export type ExperimentStatus = 'running' | 'completed' | 'failed' | 'cancelled';

export interface Experiment extends BaseEntity {
  name: string;
  description?: string;
  status: ExperimentStatus;
  tags: string[];
  
  // Configuration
  objective: {
    metric: string;
    direction: 'maximize' | 'minimize';
  };
  
  // Runs
  runs: ExperimentRun[];
  bestRun?: string; // runId
  
  // Metadata
  metadata: {
    framework?: string;
    dataset?: string;
    totalRuns: number;
    activeRuns: number;
    completedRuns: number;
    failedRuns: number;
  };
}

export interface ExperimentRun extends BaseEntity {
  experimentId: string;
  name?: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  
  // Configuration
  parameters: Record<string, unknown>;
  
  // Results
  metrics: Record<string, number>;
  artifacts: Artifact[];
  
  // Execution info
  startTime?: Date;
  endTime?: Date;
  duration?: number; // seconds
  
  // Resources
  computeResources?: {
    cpu: number;
    memory: number; // MB
    gpu?: number;
  };
  
  // Logs
  logs: string[];
  error?: string;
}

export interface Artifact {
  id: string;
  runId: string;
  name: string;
  type: 'model' | 'dataset' | 'plot' | 'log' | 'config' | 'other';
  path: string;
  size: number; // bytes
  checksum: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ================================================================================================
// DATASET TYPES
// ================================================================================================

export type DatasetType = 'structured' | 'unstructured' | 'image' | 'text' | 'time_series' | 'mixed';
export type DatasetStatus = 'uploading' | 'processing' | 'ready' | 'error' | 'archived';

export interface Dataset extends BaseEntity {
  name: string;
  description?: string;
  type: DatasetType;
  status: DatasetStatus;
  
  // File information
  files: DatasetFile[];
  totalSize: number; // bytes
  rowCount?: number;
  columnCount?: number;
  
  // Schema
  schema?: DatasetSchema;
  statistics?: DatasetStatistics;
  
  // Processing
  preprocessing?: PreprocessingPipeline;
  
  // Access control
  isPublic: boolean;
  permissions: DatasetPermission[];
  
  // Metadata
  tags: string[];
  source?: string;
  license?: string;
  citation?: string;
}

export interface DatasetFile {
  id: string;
  name: string;
  path: string;
  size: number;
  format: string;
  checksum: string;
  uploadedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface DatasetSchema {
  columns: DatasetColumn[];
  primaryKey?: string[];
  foreignKeys?: {
    column: string;
    references: {
      dataset: string;
      column: string;
    };
  }[];
}

export interface DatasetColumn {
  name: string;
  type: 'integer' | 'float' | 'string' | 'boolean' | 'datetime' | 'json';
  nullable: boolean;
  unique: boolean;
  description?: string;
  constraints?: {
    min?: number;
    max?: number;
    enum?: unknown[];
    pattern?: string;
  };
}

export interface DatasetStatistics {
  numerical: Record<string, {
    count: number;
    mean: number;
    std: number;
    min: number;
    max: number;
    percentiles: Record<string, number>; // 25%, 50%, 75%
    nullCount: number;
    uniqueCount: number;
  }>;
  
  categorical: Record<string, {
    count: number;
    uniqueCount: number;
    nullCount: number;
    topValues: { value: unknown; count: number }[];
    distribution: Record<string, number>;
  }>;
  
  overall: {
    rowCount: number;
    columnCount: number;
    missingValues: number;
    duplicateRows: number;
    memoryUsage: number; // bytes
  };
}

export interface PreprocessingPipeline {
  steps: PreprocessingStep[];
  version: string;
  appliedAt?: Date;
  appliedBy?: string;
}

export interface PreprocessingStep {
  name: string;
  type: 'filter' | 'transform' | 'clean' | 'feature_engineering' | 'custom';
  parameters: Record<string, unknown>;
  description?: string;
  order: number;
}

export interface DatasetPermission {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  grantedAt: Date;
  grantedBy: string;
}

// ================================================================================================
// NOTIFICATION TYPES
// ================================================================================================

export type NotificationType = 
  | 'training_completed'
  | 'deployment_status'
  | 'experiment_result'
  | 'system_alert'
  | 'security_alert'
  | 'user_activity'
  | 'maintenance'
  | 'quota_warning';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationStatus = 'unread' | 'read' | 'archived' | 'deleted';

export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  
  title: string;
  message: string;
  
  // Associated resources
  resourceType?: 'model' | 'experiment' | 'dataset' | 'deployment' | 'user';
  resourceId?: string;
  
  // Actions
  actions?: NotificationAction[];
  
  // Delivery
  channels: ('in_app' | 'email' | 'sms' | 'slack' | 'webhook')[];
  deliveryStatus?: Record<string, {
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    timestamp?: Date;
    error?: string;
  }>;
  
  // Scheduling
  scheduledFor?: Date;
  expiresAt?: Date;
  
  // Metadata
  metadata?: Record<string, unknown>;
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'button' | 'link' | 'form';
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: Record<string, unknown>;
  style?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

// ================================================================================================
// CONFIGURATION TYPES
// ================================================================================================

export interface SystemConfiguration {
  // Application settings
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    debug: boolean;
    logLevel: 'debug' | 'info' | 'warning' | 'error';
  };
  
  // Server configuration
  server: {
    port: number;
    host: string;
    cors: {
      enabled: boolean;
      origins: string[];
      credentials: boolean;
    };
    rateLimit: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
    compression: {
      enabled: boolean;
      level: number;
    };
    clustering: {
      enabled: boolean;
      workers?: number;
    };
  };
  
  // Database configuration
  database: {
    type: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
    pool: {
      min: number;
      max: number;
      idleTimeout: number;
      acquireTimeout: number;
    };
  };
  
  // Cache configuration
  cache: {
    type: 'memory' | 'redis' | 'memcached';
    url?: string;
    ttl: number; // seconds
    maxSize?: number; // MB for memory cache
  };
  
  // Storage configuration
  storage: {
    type: 'local' | 's3' | 'gcs' | 'azure';
    bucket?: string;
    region?: string;
    accessKey?: string;
    secretKey?: string;
    endpoint?: string;
  };
  
  // Security configuration
  security: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
    sessionSecret: string;
    sessionMaxAge: number;
    csrfEnabled: boolean;
    helmetEnabled: boolean;
  };
  
  // ML configuration
  ml: {
    defaultFramework: ModelFramework;
    maxTrainingTime: number; // minutes
    maxModelSize: number; // MB
    gpuEnabled: boolean;
    distributedTraining: boolean;
    autoML: {
      enabled: boolean;
      maxTrials: number;
      timeout: number; // minutes
    };
  };
  
  // Monitoring configuration
  monitoring: {
    enabled: boolean;
    metricsInterval: number; // seconds
    healthCheckInterval: number; // seconds
    alerting: {
      enabled: boolean;
      channels: string[];
      thresholds: {
        errorRate: number;
        responseTime: number;
        cpuUsage: number;
        memoryUsage: number;
      };
    };
  };
  
  // Feature flags
  features: {
    experimentTracking: boolean;
    modelRegistry: boolean;
    autoML: boolean;
    modelExplainability: boolean;
    modelMonitoring: boolean;
    dataValidation: boolean;
    pipelineOrchestration: boolean;
    realTimeInference: boolean;
  };
}

// ================================================================================================
// UTILITY TYPES
// ================================================================================================

/**
 * Make specified properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specified properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract keys of a specific type from an interface
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Create a type with only the specified keys
 */
export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;

/**
 * Create a deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : DeepPartial<T[P]>;
};

/**
 * Create a type that allows additional string keys
 */
export type Extensible<T> = T & Record<string, unknown>;

/**
 * Create a branded type for better type safety
 */
export type Brand<T, B> = T & { __brand: B };

// Common branded types
export type ModelId = Brand<string, 'ModelId'>;
export type UserId = Brand<string, 'UserId'>;
export type ExperimentId = Brand<string, 'ExperimentId'>;
export type DatasetId = Brand<string, 'DatasetId'>;

// ================================================================================================
// ERROR TYPES
// ================================================================================================

export interface ErrorDetails {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
  timestamp: Date;
  requestId?: string;
  userId?: string;
}

export type ValidationError = ErrorDetails & {
  field: string;
  value: unknown;
  constraint: string;
};

export type BusinessLogicError = ErrorDetails & {
  businessRule: string;
  context: Record<string, unknown>;
};

export type SystemError = ErrorDetails & {
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
};

// ================================================================================================
// TYPE GUARDS AND UTILITIES
// ================================================================================================

/**
 * Type guard to check if value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if string is not empty
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard to check if value is a valid UUID
 */
export function isUUID(value: unknown): value is string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof value === 'string' && uuidRegex.test(value);
}

/**
 * Type guard to check if object has specific properties
 */
export function hasProperty<T extends object, K extends keyof T>(
  obj: T,
  prop: K
): obj is T & Required<Pick<T, K>> {
  return prop in obj && obj[prop] !== undefined;
}

/**
 * Assertion function for non-null values
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value must be defined');
  }
}

/**
 * Create a type-safe pick function
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Create a type-safe omit function
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

// ================================================================================================
// MODULE AUGMENTATION
// ================================================================================================

declare global {
  namespace Express {
    interface Request {
      user?: User;
      context?: ServiceContext;
      startTime?: Date;
    }
  }
}

// Re-export commonly used types
export type {
  // Base types
  ApiResponse,
  PaginatedResponse,
  ServiceContext,
  BaseEntity,
  
  // User types
  User,
  UserRole,
  UserStatus,
  AuthenticationResult,
  
  // ML types
  MLModel,
  ModelType,
  ModelStatus,
  TrainingJob,
  ModelPerformance,
  
  // Experiment types
  Experiment,
  ExperimentRun,
  
  // Dataset types
  Dataset,
  DatasetType,
  DatasetSchema,
  
  // Notification types
  Notification,
  NotificationType,
  
  // Configuration types
  SystemConfiguration
};