'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { mlCoreManager, MLConfig, ModelMetadata, TrainingResult, PredictionResult, PerformanceStats, SystemInfo, DatasetMetadata } from '../../lib/ml-core'

interface MLCoreContextType {
  isInitialized: boolean
  isLoading: boolean
  error: string | null

  // Core methods
  trainModel: (config: MLConfig) => Promise<TrainingResult>
  predict: (modelId: string, features: number[]) => Promise<PredictionResult>
  getModels: () => Promise<ModelMetadata[]>
  getDatasets: () => Promise<DatasetMetadata[]>
  getPerformanceStats: () => Promise<PerformanceStats>
  getSystemInfo: () => Promise<SystemInfo>

  // State
  models: ModelMetadata[]
  datasets: DatasetMetadata[]
  performanceStats: PerformanceStats | null
  systemInfo: SystemInfo | null

  // Utility methods
  refreshModels: () => Promise<void>
  refreshDatasets: () => Promise<void>
  refreshStats: () => Promise<void>
}

const MLCoreContext = createContext<MLCoreContextType | undefined>(undefined)

interface MLCoreProviderProps {
  children: ReactNode
}

export function MLCoreProvider({ children }: MLCoreProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [models, setModels] = useState<ModelMetadata[]>([])
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([])
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)

  // Initialize ML Core on mount
  useEffect(() => {
    const initializeMLCore = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log('🔄 Initializing ML Core...')
        await mlCoreManager.initializeMLCore()

        // Load initial data
        await Promise.all([
          refreshModels(),
          refreshDatasets(),
          refreshStats(),
          loadSystemInfo()
        ])

        setIsInitialized(true)
        console.log('✅ ML Core Provider initialized successfully')
      } catch (err) {
        console.error('❌ Failed to initialize ML Core Provider:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize ML Core')
      } finally {
        setIsLoading(false)
      }
    }

    initializeMLCore()
  }, [])

  const refreshModels = async () => {
    try {
      const modelList = await mlCoreManager.getModels()
      setModels(modelList)
    } catch (err) {
      console.error('Failed to refresh models:', err)
    }
  }

  const refreshDatasets = async () => {
    try {
      const datasetList = await mlCoreManager.getDatasets()
      setDatasets(datasetList)
    } catch (err) {
      console.error('Failed to refresh datasets:', err)
    }
  }

  const refreshStats = async () => {
    try {
      const stats = await mlCoreManager.getPerformanceStats()
      setPerformanceStats(stats)
    } catch (err) {
      console.error('Failed to refresh performance stats:', err)
    }
  }

  const loadSystemInfo = async () => {
    try {
      const info = await mlCoreManager.getSystemInfo()
      setSystemInfo(info)
    } catch (err) {
      console.error('Failed to load system info:', err)
    }
  }

  const trainModel = async (config: MLConfig): Promise<TrainingResult> => {
    try {
      const result = await mlCoreManager.trainModel(config)
      // Refresh models list after training
      await refreshModels()
      return result
    } catch (err) {
      console.error('Training failed:', err)
      throw err
    }
  }

  const predict = async (modelId: string, features: number[]): Promise<PredictionResult> => {
    try {
      const result = await mlCoreManager.predict(modelId, features)
      // Refresh stats after prediction
      await refreshStats()
      return result
    } catch (err) {
      console.error('Prediction failed:', err)
      throw err
    }
  }

  const getModels = async (): Promise<ModelMetadata[]> => {
    const modelList = await mlCoreManager.getModels()
    setModels(modelList)
    return modelList
  }

  const getDatasets = async (): Promise<DatasetMetadata[]> => {
    const datasetList = await mlCoreManager.getDatasets()
    setDatasets(datasetList)
    return datasetList
  }

  const getPerformanceStats = async (): Promise<PerformanceStats> => {
    const stats = await mlCoreManager.getPerformanceStats()
    setPerformanceStats(stats)
    return stats
  }

  const getSystemInfo = async (): Promise<SystemInfo> => {
    const info = await mlCoreManager.getSystemInfo()
    setSystemInfo(info)
    return info
  }

  const contextValue: MLCoreContextType = {
    isInitialized,
    isLoading,
    error,
    hasNativeExtension,
    version,

    // Enhanced Core methods
    trainModel,
    getPredictions,
    getModels,
    getDatasets,
    getPerformanceStats,
    getSystemInfo,
    healthCheck,

    // Legacy methods for backward compatibility
    trainModelLegacy,
    predict,
    getModelsLegacy,
    getDatasetsLegacy,

    // Enhanced State
    models,
    datasets,
    performanceStats,
    systemInfo,
    mlCoreStatus,

    // Enhanced Utility methods
    refreshModels,
    refreshDatasets,
    refreshStats,
    refreshSystemInfo,
    refreshAll
  }

  return (
    <MLCoreContext.Provider value={contextValue}>
      {children}
    </MLCoreContext.Provider>
  )
}

export function useMLCore() {
  const context = useContext(MLCoreContext)
  if (context === undefined) {
    throw new Error('useMLCore must be used within a MLCoreProvider')
  }
  return context
}

export function useMLCoreStatus() {
  const { isInitialized, isLoading, error } = useMLCore()
  return { isInitialized, isLoading, error }
}

export function useModels() {
  const { models, refreshModels, getModels } = useMLCore()
  return { models, refreshModels, getModels }
}

export function usePerformanceStats() {
  const { performanceStats, refreshStats, getPerformanceStats } = useMLCore()
  return { performanceStats, refreshStats, getPerformanceStats }
}

export function useSystemInfo() {
  const { systemInfo, getSystemInfo } = useMLCore()
  return { systemInfo, getSystemInfo }
}