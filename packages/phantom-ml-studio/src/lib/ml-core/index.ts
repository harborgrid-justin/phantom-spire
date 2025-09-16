/**
 * ML Core Integration Layer
 * Provides a clean interface to the Phantom ML Core native extension
 */

// Import types from the types module
import type {
  PhantomMLCore,
  Model,
  Dataset,
  TrainingConfig,
  TrainingJob,
  PredictionResult,
  PerformanceStats,
  SystemInfo,
  ModelMetadata,
  DatasetMetadata,
  TrainingResult,
  MLCoreConfig,
  ApiResponse,
  ApiError
} from './types'

// Legacy interface for backward compatibility
export interface MLConfig {
  modelType: 'classification' | 'regression' | 'clustering'
  parameters: string // JSON string
  features?: string[]
  target?: string
}

// ===========================
// MOCK DATA GENERATORS
// ===========================

/**
 * Generate comprehensive mock models with realistic data
 */
const generateMockModels = (): Model[] => [
  {
    id: 'model_security_threat_detection',
    name: 'Security Threat Detection',
    model_type: 'classification',
    algorithm: 'random_forest',
    version: '1.2.0',
    status: 'trained',
    accuracy: 0.94,
    precision: 0.92,
    recall: 0.96,
    f1_score: 0.94,
    created_at: new Date().toISOString(),
    last_trained: new Date().toISOString(),
    training_time_ms: 145000,
    dataset_id: 'ds_security_logs',
    feature_count: 15,
    model_size_mb: 12.5,
    inference_time_avg_ms: 2.3,
    tags: ['security', 'production']
  },
  {
    id: 'model_anomaly_detection',
    name: 'Network Anomaly Detection',
    model_type: 'anomaly_detection',
    algorithm: 'isolation_forest',
    version: '1.0.3',
    status: 'trained',
    accuracy: 0.89,
    precision: 0.87,
    recall: 0.91,
    f1_score: 0.89,
    created_at: new Date().toISOString(),
    last_trained: new Date().toISOString(),
    training_time_ms: 98000,
    dataset_id: 'ds_network_traffic',
    feature_count: 20,
    model_size_mb: 8.7,
    inference_time_avg_ms: 1.8,
    tags: ['network', 'anomaly']
  },
  {
    id: 'model_user_behavior',
    name: 'User Behavior Analytics',
    model_type: 'clustering',
    algorithm: 'kmeans',
    version: '2.1.0',
    status: 'training',
    accuracy: 0.82,
    precision: 0.79,
    recall: 0.85,
    f1_score: 0.82,
    created_at: new Date().toISOString(),
    last_trained: undefined,
    training_time_ms: undefined,
    dataset_id: 'ds_user_behavior',
    feature_count: 8,
    model_size_mb: 5.2,
    inference_time_avg_ms: 3.1,
    tags: ['behavior', 'clustering']
  }
]

/**
 * Generate comprehensive mock datasets
 */
const generateMockDatasets = (): Dataset[] => [
  {
    id: 'ds_security_logs',
    name: 'Security Event Logs',
    description: 'Network security event logs for threat detection training',
    dataset_type: 'security',
    format: 'parquet',
    size_bytes: 524288000,
    size_human: '500 MB',
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    status: 'ready',
    feature_count: 15,
    sample_count: 100000,
    target_column: 'is_threat',
    missing_values_percent: 2.1,
    data_quality_score: 92.5,
    tags: ['security', 'logs', 'production'],
    source: 'enterprise_siem'
  },
  {
    id: 'ds_user_behavior',
    name: 'User Behavior Analytics',
    description: 'User behavior patterns for anomaly detection',
    dataset_type: 'behavioral',
    format: 'csv',
    size_bytes: 134217728,
    size_human: '128 MB',
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    status: 'ready',
    feature_count: 8,
    sample_count: 50000,
    target_column: undefined,
    missing_values_percent: 1.3,
    data_quality_score: 96.8,
    tags: ['behavior', 'analytics'],
    source: 'user_activity_monitoring'
  },
  {
    id: 'ds_network_traffic',
    name: 'Network Traffic Analysis',
    description: 'Network traffic patterns for intrusion detection',
    dataset_type: 'network',
    format: 'parquet',
    size_bytes: 1073741824,
    size_human: '1 GB',
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    status: 'ready',
    feature_count: 20,
    sample_count: 250000,
    target_column: 'is_intrusion',
    missing_values_percent: 0.5,
    data_quality_score: 98.2,
    tags: ['network', 'traffic', 'security'],
    source: 'network_monitoring'
  }
]

/**
 * Generate mock performance stats
 */
const generateMockPerformanceStats = (): PerformanceStats => ({
  total_operations: Math.floor(Math.random() * 1000) + 47000,
  average_inference_time_ms: 2.1 + Math.random() * 0.5,
  peak_memory_usage_mb: 1024.5 + Math.random() * 256,
  active_models: 3,
  uptime_seconds: Math.floor(Math.random() * 86400) + 3600
})

// Client-side placeholder for development/testing
const createMockMLCore = (): PhantomMLCore => ({
  getVersion: () => '1.0.1-mock',
  initialize: () => true,
  isInitialized: () => true,
  // Updated training function to return TrainingJob instead of string
  trainModel: (config: TrainingConfig): TrainingJob => {
    const jobId = `job_${Date.now()}`
    const modelId = `model_${Date.now()}_${Math.floor(Math.random() * 1000)}`

    return {
      job_id: jobId,
      model_id: modelId,
      status: 'running',
      progress_percent: Math.random() * 30 + 10, // 10-40% progress
      current_epoch: Math.floor(Math.random() * 20) + 5,
      total_epochs: config.epochs,
      current_loss: 0.3 + Math.random() * 0.2,
      best_accuracy: 0.8 + Math.random() * 0.15,
      started_at: new Date().toISOString(),
      estimated_completion: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      error_message: undefined,
      metrics: {
        train_loss: [0.693, 0.521, 0.432, 0.378, 0.342],
        val_loss: [0.701, 0.534, 0.445, 0.391, 0.356],
        train_accuracy: [0.512, 0.673, 0.751, 0.823, 0.847],
        val_accuracy: [0.498, 0.661, 0.742, 0.814, 0.832],
        learning_rate: 0.001,
        batch_size: config.batch_size,
        total_parameters: 1247832,
        training_samples: 80000,
        validation_samples: 20000
      }
    }
  },
  // Updated prediction function to return PredictionResult directly
  getPredictions: (modelId: string, data: string): PredictionResult => {
    try {
      const features = JSON.parse(data) as number[]
      return {
        prediction: Math.random() * 10,
        confidence: 0.85 + Math.random() * 0.15,
        model_id: modelId,
        features_used: features.map((_, i) => `feature_${i}`)
      }
    } catch {
      return {
        prediction: 0,
        confidence: 0,
        model_id: modelId,
        features_used: []
      }
    }
  },
  // Updated to return Model[] directly
  getModels: (): Model[] => generateMockModels(),
  // Updated to return Dataset[] directly
  getDatasets: (): Dataset[] => generateMockDatasets(),
  // Updated to return PerformanceStats directly
  getPerformanceStats: (): PerformanceStats => generateMockPerformanceStats(),
  hello: () => 'Phantom ML Core v1.0.1 (Mock)',
  plus100: (input: number) => input + 100
})

// ML Core instance management
class MLCoreManager {
  private static instance: MLCoreManager
  private mlCore: PhantomMLCore | null = null
  private isInitialized = false

  private constructor() {}

  static getInstance(): MLCoreManager {
    if (!MLCoreManager.instance) {
      MLCoreManager.instance = new MLCoreManager()
    }
    return MLCoreManager.instance
  }

  async initializeMLCore(): Promise<PhantomMLCore> {
    if (this.mlCore && this.isInitialized) {
      return this.mlCore
    }

    try {
      // Try to load the native extension (server-side only)
      if (typeof window === 'undefined') {
        try {
          // Dynamic import to avoid bundling issues
          const mlCorePath = process.env.ML_CORE_PATH || '../phantom-ml-core/nextgen'
          const { PhantomMLCore: NativeMLCore } = await import(mlCorePath)
          this.mlCore = new NativeMLCore()

          // Initialize with default config
          const initResult = this.mlCore.initialize(JSON.stringify({
            environment: process.env.NODE_ENV || 'development',
            features: ['ml', 'analytics', 'security']
          }))

          if (initResult) {
            this.isInitialized = true
            console.log('✅ Phantom ML Core initialized successfully')
            console.log(`📊 Version: ${this.mlCore.getVersion()}`)
          } else {
            throw new Error('Failed to initialize ML Core')
          }
        } catch (error) {
          console.warn('⚠️  Native ML Core not available, using mock implementation:', error)
          this.mlCore = createMockMLCore()
          this.isInitialized = true
        }
      } else {
        // Client-side: always use mock for now
        console.log('🔧 Client-side: Using mock ML Core implementation')
        this.mlCore = createMockMLCore()
        this.isInitialized = true
      }

      return this.mlCore
    } catch (error) {
      console.error('❌ Failed to initialize ML Core:', error)
      // Fallback to mock implementation
      this.mlCore = createMockMLCore()
      this.isInitialized = true
      return this.mlCore
    }
  }

  getMLCore(): PhantomMLCore | null {
    return this.mlCore
  }

  isMLCoreInitialized(): boolean {
    return this.isInitialized
  }

  // ===========================
  // ENHANCED API METHODS
  // ===========================

  /**
   * Train a model with comprehensive configuration
   */
  async trainModel(config: TrainingConfig): Promise<TrainingJob> {
    const core = await this.initializeMLCore()
    try {
      return core.trainModel(config)
    } catch (error) {
      console.error('Training failed:', error)
      throw new Error(`Model training failed: ${error}`)
    }
  }

  /**
   * Legacy train model method for backward compatibility
   */
  async trainModelLegacy(config: MLConfig): Promise<TrainingResult> {
    const core = await this.initializeMLCore()
    try {
      // Convert legacy config to new format
      const trainingConfig: TrainingConfig = {
        epochs: 100,
        batch_size: 32,
        validation_split: 0.2,
        cross_validation: true,
        cross_validation_folds: 5
      }

      const job = core.trainModel(trainingConfig)

      // Convert TrainingJob to legacy TrainingResult
      return {
        model_id: job.model_id,
        status: job.status,
        accuracy: job.best_accuracy || 0,
        metrics: JSON.stringify(job.metrics),
        training_time_ms: Date.now() - new Date(job.started_at).getTime()
      }
    } catch (error) {
      console.error('Legacy training failed:', error)
      throw new Error(`Model training failed: ${error}`)
    }
  }

  /**
   * Get predictions from a model
   */
  async getPredictions(modelId: string, data: string): Promise<PredictionResult> {
    const core = await this.initializeMLCore()
    try {
      return core.getPredictions(modelId, data)
    } catch (error) {
      console.error('Prediction failed:', error)
      throw new Error(`Prediction failed: ${error}`)
    }
  }

  /**
   * Legacy predict method for backward compatibility
   */
  async predict(modelId: string, features: number[]): Promise<PredictionResult> {
    const core = await this.initializeMLCore()
    try {
      const data = JSON.stringify(features)
      return core.getPredictions(modelId, data)
    } catch (error) {
      console.error('Legacy prediction failed:', error)
      throw new Error(`Prediction failed: ${error}`)
    }
  }

  /**
   * Get all available models with enhanced metadata
   */
  async getModels(): Promise<Model[]> {
    const core = await this.initializeMLCore()
    try {
      return core.getModels()
    } catch (error) {
      console.error('Failed to get models:', error)
      return []
    }
  }

  /**
   * Get models in legacy format for backward compatibility
   */
  async getModelsLegacy(): Promise<ModelMetadata[]> {
    const core = await this.initializeMLCore()
    try {
      const models = core.getModels()
      return models.map(model => ({
        id: model.id,
        name: model.name,
        model_type: model.model_type,
        version: model.version,
        created_at: model.created_at,
        accuracy: model.accuracy,
        status: model.status
      }))
    } catch (error) {
      console.error('Failed to get legacy models:', error)
      return []
    }
  }

  /**
   * Get system performance statistics
   */
  async getPerformanceStats(): Promise<PerformanceStats> {
    const core = await this.initializeMLCore()
    try {
      return core.getPerformanceStats()
    } catch (error) {
      console.error('Failed to get performance stats:', error)
      return {
        total_operations: 0,
        average_inference_time_ms: 0,
        peak_memory_usage_mb: 0,
        active_models: 0,
        uptime_seconds: 0
      }
    }
  }

  /**
   * Get all available datasets with enhanced metadata
   */
  async getDatasets(): Promise<Dataset[]> {
    const core = await this.initializeMLCore()
    try {
      return core.getDatasets()
    } catch (error) {
      console.error('Failed to get datasets:', error)
      return []
    }
  }

  /**
   * Get datasets in legacy format for backward compatibility
   */
  async getDatasetsLegacy(): Promise<DatasetMetadata[]> {
    const core = await this.initializeMLCore()
    try {
      const datasets = core.getDatasets()
      return datasets.map(dataset => ({
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        dataset_type: dataset.dataset_type,
        size: dataset.size_bytes,
        created_at: dataset.created_at,
        last_modified: dataset.last_modified,
        status: dataset.status,
        feature_count: dataset.feature_count,
        sample_count: dataset.sample_count
      }))
    } catch (error) {
      console.error('Failed to get legacy datasets:', error)
      return []
    }
  }

  /**
   * Get system information
   */
  async getSystemInfo(): Promise<SystemInfo> {
    const core = await this.initializeMLCore()
    try {
      // Note: getSystemInfo might be a standalone function, not a method
      if (typeof window === 'undefined') {
        try {
          const mlCorePath = process.env.ML_CORE_PATH || '../phantom-ml-core/nextgen'
          const { getSystemInfo } = await import(mlCorePath)
          const result = getSystemInfo()
          return typeof result === 'string' ? JSON.parse(result) : result
        } catch {
          // Fallback to mock if standalone function not available
          return {
            platform: 'server',
            arch: 'x64',
            version: '1.0.1',
            target: 'server-mock',
            features: ['mock', 'server']
          }
        }
      } else {
        // Mock for client-side
        return {
          platform: 'browser',
          arch: 'x64',
          version: '1.0.1',
          target: 'client-mock',
          features: ['mock', 'browser']
        }
      }
    } catch (error) {
      console.error('Failed to get system info:', error)
      return {
        platform: 'unknown',
        arch: 'unknown',
        version: '1.0.1',
        target: 'fallback',
        features: ['fallback']
      }
    }
  }

  /**
   * Get ML Core status information
   */
  getMLCoreStatus(): { isInitialized: boolean; hasNativeExtension: boolean; version?: string } {
    return {
      isInitialized: this.isInitialized,
      hasNativeExtension: this.mlCore !== null && typeof window === 'undefined',
      version: this.mlCore?.getVersion()
    }
  }

  /**
   * Health check for the ML Core system
   */
  async healthCheck(): Promise<{ status: string; version: string; components: Record<string, boolean> }> {
    try {
      const core = await this.initializeMLCore()
      const version = core.getVersion()
      const systemInfo = await this.getSystemInfo()

      return {
        status: 'healthy',
        version,
        components: {
          native_extension: typeof window === 'undefined',
          core_initialized: this.isInitialized,
          platform_supported: systemInfo.platform !== 'unknown'
        }
      }
    } catch (error) {
      return {
        status: 'degraded',
        version: '1.0.1-fallback',
        components: {
          native_extension: false,
          core_initialized: false,
          platform_supported: false
        }
      }
    }
  }
}

// ===========================
// WRAPPER FUNCTIONS FOR API ROUTES
// ===========================

/**
 * Create wrapper functions that can be used in API routes
 */
export const createApiWrapper = () => {
  const manager = MLCoreManager.getInstance()

  return {
    async getModels(): Promise<ApiResponse<Model[]>> {
      try {
        const data = await manager.getModels()
        return {
          success: true,
          data,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    },

    async getDatasets(): Promise<ApiResponse<Dataset[]>> {
      try {
        const data = await manager.getDatasets()
        return {
          success: true,
          data,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    },

    async getPerformanceStats(): Promise<ApiResponse<PerformanceStats>> {
      try {
        const data = await manager.getPerformanceStats()
        return {
          success: true,
          data,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    },

    async trainModel(config: TrainingConfig): Promise<ApiResponse<TrainingJob>> {
      try {
        const data = await manager.trainModel(config)
        return {
          success: true,
          data,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    },

    async getPredictions(modelId: string, data: string): Promise<ApiResponse<PredictionResult>> {
      try {
        const result = await manager.getPredictions(modelId, data)
        return {
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    },

    async healthCheck(): Promise<ApiResponse<any>> {
      try {
        const data = await manager.healthCheck()
        return {
          success: true,
          data,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    }
  }
}

// Export singleton instance
export const mlCoreManager = MLCoreManager.getInstance()

// Export API wrapper
export const apiWrapper = createApiWrapper()

// Export types and interfaces
export * from './types'