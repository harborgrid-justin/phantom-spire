/**
 * ML Core Integration Layer
 * Provides a clean interface to the Phantom ML Core native extension
 */

// Type definitions for the native extension
export interface PhantomMLCore {
  getVersion(): string
  initialize(config?: string): boolean
  isInitialized(): boolean
  trainModel(config: MLConfig): string
  predict(modelId: string, features: number[]): string
  getModels(): string
  getPerformanceStats(): string
  hello(): string
  plus100(input: number): number
}

export interface MLConfig {
  modelType: 'classification' | 'regression' | 'clustering'
  parameters: string // JSON string
  features?: string[]
  target?: string
}

export interface ModelMetadata {
  id: string
  name: string
  model_type: string
  version: string
  created_at: string
  accuracy?: number
  status: string
}

export interface TrainingResult {
  model_id: string
  status: string
  accuracy: number
  metrics: string
  training_time_ms: number
}

export interface PredictionResult {
  prediction: number
  confidence: number
  model_id: string
  features_used: string[]
}

export interface PerformanceStats {
  total_operations: number
  average_inference_time_ms: number
  peak_memory_usage_mb: number
  active_models: number
  uptime_seconds: number
}

export interface SystemInfo {
  platform: string
  arch: string
  version: string
  target: string
  features: string[]
}

// Client-side placeholder for development/testing
const createMockMLCore = (): PhantomMLCore => ({
  getVersion: () => '1.0.1-mock',
  initialize: () => true,
  isInitialized: () => true,
  trainModel: (config: MLConfig) => {
    const mockResult: TrainingResult = {
      model_id: `mock_model_${Date.now()}`,
      status: 'success',
      accuracy: 0.95,
      metrics: JSON.stringify({
        f1_score: 0.95,
        precision: 0.94,
        recall: 0.96
      }),
      training_time_ms: Math.floor(Math.random() * 1000)
    }
    return JSON.stringify(mockResult)
  },
  predict: (modelId: string, features: number[]) => {
    const mockResult: PredictionResult = {
      prediction: Math.random() * 10,
      confidence: 0.85 + Math.random() * 0.15,
      model_id: modelId,
      features_used: features.map((_, i) => `feature_${i}`)
    }
    return JSON.stringify(mockResult)
  },
  getModels: () => {
    const mockModels: ModelMetadata[] = [
      {
        id: 'mock_model_1',
        name: 'Security Classification Model',
        model_type: 'classification',
        version: '1.0.0',
        created_at: new Date().toISOString(),
        accuracy: 0.95,
        status: 'trained'
      }
    ]
    return JSON.stringify(mockModels)
  },
  getPerformanceStats: () => {
    const mockStats: PerformanceStats = {
      total_operations: Math.floor(Math.random() * 1000),
      average_inference_time_ms: Math.random() * 10,
      peak_memory_usage_mb: Math.random() * 100,
      active_models: Math.floor(Math.random() * 5) + 1,
      uptime_seconds: Math.floor(Math.random() * 3600)
    }
    return JSON.stringify(mockStats)
  },
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

  // Convenience methods with error handling
  async trainModel(config: MLConfig): Promise<TrainingResult> {
    const core = await this.initializeMLCore()
    try {
      const result = core.trainModel(config)
      return JSON.parse(result)
    } catch (error) {
      console.error('Training failed:', error)
      throw new Error(`Model training failed: ${error}`)
    }
  }

  async predict(modelId: string, features: number[]): Promise<PredictionResult> {
    const core = await this.initializeMLCore()
    try {
      const result = core.predict(modelId, features)
      return JSON.parse(result)
    } catch (error) {
      console.error('Prediction failed:', error)
      throw new Error(`Prediction failed: ${error}`)
    }
  }

  async getModels(): Promise<ModelMetadata[]> {
    const core = await this.initializeMLCore()
    try {
      const result = core.getModels()
      return JSON.parse(result)
    } catch (error) {
      console.error('Failed to get models:', error)
      return []
    }
  }

  async getPerformanceStats(): Promise<PerformanceStats> {
    const core = await this.initializeMLCore()
    try {
      const result = core.getPerformanceStats()
      return JSON.parse(result)
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

  async getSystemInfo(): Promise<SystemInfo> {
    const core = await this.initializeMLCore()
    try {
      // Note: getSystemInfo is a standalone function, not a method
      if (typeof window === 'undefined') {
        const mlCorePath = process.env.ML_CORE_PATH || '../phantom-ml-core/nextgen'
        const { getSystemInfo } = await import(mlCorePath)
        const result = getSystemInfo()
        return JSON.parse(result)
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
}

// Export singleton instance
export const mlCoreManager = MLCoreManager.getInstance()

// Export types and interfaces
export * from './types'