import { NextResponse } from 'next/server'

interface ActivityItem {
  id: string
  type: 'training' | 'prediction' | 'upload' | 'analysis' | 'deployment'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'error' | 'warning' | 'info'
  details?: Record<string, string | number | boolean>
}

// Mock activity data - in real app this would come from a database
const generateMockActivity = (): ActivityItem[] => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'training',
      title: 'Security Classification Model Trained',
      description: 'Random Forest model trained with 95.2% accuracy',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
      status: 'success',
      details: { accuracy: 0.952, duration: '2m 34s' }
    },
    {
      id: '2',
      type: 'prediction',
      title: 'Batch Predictions Completed',
      description: '1,250 threat predictions processed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
      status: 'success',
      details: { count: 1250, avgLatency: '12ms' }
    },
    {
      id: '3',
      type: 'upload',
      title: 'New Dataset Uploaded',
      description: 'Security logs dataset (2.3GB, 450k records)',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 90 min ago
      status: 'info',
      details: { size: '2.3GB', records: 450000 }
    },
    {
      id: '4',
      type: 'analysis',
      title: 'Model Drift Detection',
      description: 'Anomaly detection model showing 5.2% drift',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      status: 'warning',
      details: { drift: 0.052, threshold: 0.1 }
    },
    {
      id: '5',
      type: 'training',
      title: 'Regression Model Training Failed',
      description: 'Insufficient training data for regression model',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
      status: 'error',
      details: { error: 'Insufficient data', samples: 45 }
    },
    {
      id: '6',
      type: 'prediction',
      title: 'Real-time Inference Started',
      description: 'Live threat detection pipeline activated',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
      status: 'success',
      details: { pipeline: 'threat-detection-v2' }
    }
  ]

  return activities
}

export async function GET() {
  try {
    const activities = generateMockActivity()
    return NextResponse.json({ success: true, data: activities })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch activity' }, { status: 500 })
  }
}
