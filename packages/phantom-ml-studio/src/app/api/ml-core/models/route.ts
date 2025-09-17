import { NextResponse } from 'next/server'
import type { Model } from '../../../../lib/ml-core/types'

// Mock models data
const generateMockModels = (): Model[] => {
  return [
    {
      id: '1',
      name: 'Threat Detection v1',
      model_type: 'classification',
      algorithm: 'random_forest',
      status: 'deployed',
      version: '1.0.0',
      accuracy: 0.95,
      feature_count: 42,
      model_size_mb: 15.8,
      inference_time_avg_ms: 12.5,
      tags: ['cybersecurity', 'threat-detection'],
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Fraud Detection',
      model_type: 'classification',
      algorithm: 'xgboost',
      status: 'trained',
      version: '1.2.0',
      accuracy: 0.98,
      feature_count: 65,
      model_size_mb: 28.3,
      inference_time_avg_ms: 8.2,
      tags: ['finance', 'fraud-detection'],
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Spam Filter',
      model_type: 'classification',
      algorithm: 'neural_network',
      status: 'deployed',
      version: '2.0.0',
      accuracy: 0.99,
      feature_count: 128,
      model_size_mb: 45.6,
      inference_time_avg_ms: 18.9,
      tags: ['email', 'nlp', 'spam-detection'],
      created_at: new Date().toISOString(),
    },
  ]
}

export async function GET() {
  try {
    const models = generateMockModels()
    return NextResponse.json({ success: true, data: models })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch models' }, { status: 500 })
  }
}
