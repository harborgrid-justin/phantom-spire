/**
 * Type definitions for ML Core integration
 * These types match the Rust NAPI structures from phantom-ml-core
 */

// ===========================
// CORE NATIVE EXTENSION TYPES
// ===========================

/**
 * Training configuration for model training
 */
export interface TrainingConfig {
  epochs: number
  batch_size: number
  validation_split: number
  cross_validation: boolean
  cross_validation_folds: number
}

/**
 * Feature configuration for data preprocessing
 */
export interface FeatureConfig {
  normalize: boolean
  scale: boolean
  handle_missing: string
  categorical_encoding: string
}

/**
 * Model configuration for training and deployment
 */
export interface ModelConfig {
  model_type: string
  algorithm: string
  hyperparameters: string // JSON string for NAPI compatibility
  feature_config: FeatureConfig
  training_config: TrainingConfig
}

/**
 * Enhanced model structure with comprehensive metadata
 */
export interface Model {
  id: string
  name: string
  model_type: string
  algorithm: string
  version: string
  status: string
  accuracy?: number
  precision?: number
  recall?: number
  f1_score?: number
  created_at: string
  last_trained?: string
  training_time_ms?: number
  dataset_id?: string
  feature_count: number
  model_size_mb: number
  inference_time_avg_ms: number
  tags: string[]
}

/**
 * Enhanced dataset structure
 */
export interface Dataset {
  id: string
  name: string
  description: string
  dataset_type: string
  format: string
  size_bytes: number
  size_human: string
  created_at: string
  last_modified: string
  status: string
  feature_count: number
  sample_count: number
  target_column?: string
  missing_values_percent: number
  data_quality_score: number
  tags: string[]
  source: string
}

/**
 * Training metrics for progress tracking
 */
export interface TrainingMetrics {
  train_loss: number[]
  val_loss: number[]
  train_accuracy: number[]
  val_accuracy: number[]
  learning_rate: number
  batch_size: number
  total_parameters: number
  training_samples: number
  validation_samples: number
}

/**
 * Training job for async operations
 */
export interface TrainingJob {
  job_id: string
  model_id: string
  status: string
  progress_percent: number
  current_epoch: number
  total_epochs: number
  current_loss?: number
  best_accuracy?: number
  started_at: string
  estimated_completion?: string
  error_message?: string
  metrics: TrainingMetrics
}

/**
 * Prediction result structure
 */
export interface PredictionResult {
  prediction: number
  confidence: number
  model_id: string
  features_used: string[]
}

/**
 * System performance statistics
 */
export interface PerformanceStats {
  total_operations: number
  average_inference_time_ms: number
  peak_memory_usage_mb: number
  active_models: number
  uptime_seconds: number
}

/**
 * System information
 */
export interface SystemInfo {
  platform: string
  arch: string
  version: string
  target: string
  features: string[]
}

// Legacy types for backward compatibility
export interface MLModelConfig {
  modelType: 'classification' | 'regression' | 'clustering' | 'anomaly_detection' | 'time_series'
  algorithm: string
  hyperparameters: Record<string, any>
  features?: string[]
  target?: string
  datasetId?: string
  description?: string
  tags?: string[]
}

/**
 * Training result structure
 */
export interface TrainingResult {
  model_id: string
  status: string
  accuracy: number
  metrics: string
  training_time_ms: number
}

/**
 * Legacy training job for backward compatibility
 * @deprecated Use TrainingJob from core types instead
 */
export interface LegacyTrainingJob {
  id: string
  modelConfig: MLModelConfig
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  startTime: string
  endTime?: string
  result?: TrainingResult
  error?: string
  logs: string[]
}

/**
 * Studio-specific training job with UI properties
 */
export interface StudioTrainingJob extends TrainingJob {
  logs: string[]
  result?: TrainingResult
}

/**
 * Model metadata for legacy compatibility
 */
export interface ModelMetadata {
  id: string
  name: string
  model_type: string
  version: string
  created_at: string
  accuracy?: number
  status: string
}

/**
 * Dataset metadata for legacy compatibility
 */
export interface DatasetMetadata {
  id: string
  name: string
  description: string
  dataset_type: string
  size: number
  created_at: string
  last_modified: string
  status: string
  feature_count: number
  sample_count: number
}

export interface ModelEvaluation {
  modelId: string
  metrics: {
    accuracy?: number
    precision?: number
    recall?: number
    f1Score?: number
    mse?: number
    rmse?: number
    mae?: number
    r2Score?: number
    silhouetteScore?: number
    confusionMatrix?: number[][]
  }
  validationSet: {
    size: number
    split: number
  }
  crossValidation?: {
    folds: number
    scores: number[]
    mean: number
    std: number
  }
}

export interface ModelDeployment {
  id: string
  modelId: string
  version: string
  status: 'deployed' | 'deploying' | 'failed' | 'stopped'
  endpoint?: string
  replicas: number
  resourceLimits: {
    cpu: string
    memory: string
  }
  createdAt: string
  updatedAt: string
}

/**
 * Legacy dataset interface - use Dataset from core types instead
 * @deprecated Use Dataset interface instead
 */
export interface LegacyDataset {
  id: string
  name: string
  description?: string
  type: 'csv' | 'json' | 'parquet' | 'stream'
  size: number
  rows: number
  columns: number
  features: DatasetFeature[]
  createdAt: string
  updatedAt: string
  tags: string[]
  source?: string
  preprocessing?: PreprocessingConfig
}

export interface DatasetFeature {
  name: string
  type: 'numeric' | 'categorical' | 'text' | 'datetime' | 'boolean'
  nullable: boolean
  unique: number
  missing: number
  statistics?: {
    min?: number
    max?: number
    mean?: number
    std?: number
    quartiles?: number[]
    categories?: string[]
    topValues?: Array<{ value: any; count: number }>
  }
}

export interface PreprocessingConfig {
  steps: PreprocessingStep[]
  validation: {
    enabled: boolean
    splitRatio: number
    randomSeed?: number
  }
}

export interface PreprocessingStep {
  id: string
  type: 'normalize' | 'scale' | 'encode' | 'impute' | 'transform' | 'filter'
  config: Record<string, any>
  targetColumns?: string[]
}

export interface ExperimentRun {
  id: string
  name: string
  description?: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startTime: string
  endTime?: string
  duration?: number
  modelConfig: MLModelConfig
  datasetId: string
  trainingJob: TrainingJob
  evaluation?: ModelEvaluation
  artifacts: {
    modelPath?: string
    metricsPath?: string
    logsPath?: string
    plotsPath?: string
  }
  tags: string[]
  notes?: string
}

export interface MLPipeline {
  id: string
  name: string
  description?: string
  stages: PipelineStage[]
  schedule?: {
    enabled: boolean
    cron: string
    timezone: string
  }
  triggers: PipelineTrigger[]
  status: 'active' | 'inactive' | 'running' | 'failed'
  lastRun?: {
    id: string
    startTime: string
    endTime?: string
    status: string
    logs: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface PipelineStage {
  id: string
  name: string
  type: 'data_ingestion' | 'preprocessing' | 'training' | 'evaluation' | 'deployment' | 'monitoring'
  config: Record<string, any>
  dependencies: string[]
  timeout: number
  retries: number
}

export interface PipelineTrigger {
  type: 'manual' | 'schedule' | 'data_change' | 'webhook'
  config: Record<string, any>
}

export interface AlertRule {
  id: string
  name: string
  description?: string
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'change_percentage'
  threshold: number
  duration: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  notifications: {
    email?: string[]
    webhook?: string
    slack?: string
  }
  createdAt: string
  updatedAt: string
}

export interface MonitoringMetric {
  name: string
  value: number
  timestamp: string
  labels: Record<string, string>
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  components: {
    mlCore: ComponentHealth
    database: ComponentHealth
    storage: ComponentHealth
    api: ComponentHealth
  }
  lastCheck: string
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime?: number
  errorRate?: number
  lastError?: string
  details?: Record<string, any>
}

export interface ModelMonitoring {
  modelId: string
  metrics: {
    predictions: {
      total: number
      successful: number
      failed: number
      avgLatency: number
      p95Latency: number
    }
    accuracy: {
      current: number
      historical: Array<{ timestamp: string; value: number }>
      threshold: number
      alerts: number
    }
    drift: {
      feature: number
      prediction: number
      threshold: number
      lastDetected?: string
    }
    performance: {
      cpu: number
      memory: number
      disk: number
    }
  }
  alerts: Alert[]
  lastUpdated: string
}

export interface Alert {
  id: string
  type: 'model_drift' | 'accuracy_drop' | 'high_latency' | 'resource_usage' | 'prediction_error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details: Record<string, any>
  createdAt: string
  acknowledgedAt?: string
  resolvedAt?: string
  assignee?: string
}

// ===========================
// API RESPONSE WRAPPER TYPES
// ===========================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

/**
 * API error response
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  uptime: number
  components: {
    native_extension: boolean
    database: boolean
    storage: boolean
  }
  timestamp: string
}

// ===========================
// UTILITY TYPES
// ===========================

/**
 * Configuration for ML Core integration
 */
export interface MLCoreConfig {
  environment: string
  features: string[]
  fallback_to_mock: boolean
  api_timeout_ms: number
}

/**
 * Status of ML Core initialization
 */
export interface MLCoreStatus {
  isInitialized: boolean
  isLoading: boolean
  error?: string
  hasNativeExtension: boolean
  version?: string
}

/**
 * Native extension interface definition
 */
export interface PhantomMLCore {
  getVersion(): string
  initialize(config?: string): boolean
  isInitialized(): boolean
  hello(): string
  plus100(input: number): number

  // New expanded API functions
  getModels(): Model[]
  getDatasets(): Dataset[]
  getPerformanceStats(): PerformanceStats
  trainModel(config: TrainingConfig): TrainingJob
  getPredictions(modelId: string, data: string): PredictionResult
}