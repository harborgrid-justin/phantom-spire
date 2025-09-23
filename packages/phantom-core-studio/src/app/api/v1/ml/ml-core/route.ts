import { NextResponse } from 'next/server'
import { mlCoreManager } from '@/lib/ml-core'

/**
 * ML Core Overview API Route
 * GET /api/ml-core
 *
 * Provides a comprehensive overview of the ML Core system including:
 * - System status and version information
 * - Available endpoints and capabilities
 * - Configuration and feature flags
 * - Quick health summary
 */
export async function GET() {
  try {
    const status = mlCoreManager.getMLCoreStatus()
    const healthCheck = await mlCoreManager.healthCheck()

    const overview = {
      success: true,
      data: {
        system: {
          name: 'Phantom ML Core',
          version: status.version || '1.0.1',
          status: healthCheck.status,
          initialized: status.isInitialized,
          nativeExtension: status.hasNativeExtension
        },
        endpoints: {
          health: '/api/ml-core/health',
          models: '/api/ml-core/models',
          datasets: '/api/ml-core/datasets',
          performance: '/api/ml-core/performance',
          train: '/api/ml-core/train',
          predictions: '/api/ml-core/predictions'
        },
        capabilities: {
          modelTraining: true,
          realTimePredictions: true,
          performanceMonitoring: true,
          datasetManagement: true,
          healthChecking: true,
          crossValidation: true,
          trainingMetrics: true
        },
        supportedModelTypes: [
          'classification',
          'regression',
          'clustering',
          'anomaly_detection',
          'time_series'
        ],
        supportedAlgorithms: [
          'random_forest',
          'neural_network',
          'svm',
          'kmeans',
          'isolation_forest',
          'lstm',
          'gradient_boosting'
        ]
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(overview, { status: 200 })
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get ML Core overview',
      data: {
        system: {
          name: 'Phantom ML Core',
          version: 'unknown',
          status: 'error',
          initialized: false,
          nativeExtension: false
        }
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

/**
 * CORS Options
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}