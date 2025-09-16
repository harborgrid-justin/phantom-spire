/**
 * Type definitions for ML Core integration
 */

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

export interface TrainingJob {
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

export interface Dataset {
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