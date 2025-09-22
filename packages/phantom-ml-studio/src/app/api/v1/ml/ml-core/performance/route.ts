import { NextResponse } from 'next/server'
import type { PerformanceStats } from '../../../../lib/ml-core/types';

// Mock performance data
const generateMockPerformanceStats = (): PerformanceStats => {
  return {
    uptime_seconds: Math.floor(Math.random() * 1000000),
    total_operations: Math.floor(Math.random() * 100000),
    active_models: Math.floor(Math.random() * 50),
    average_inference_time_ms: Math.random() * 100,
    peak_memory_usage_mb: Math.random() * 1024,
  }
}

export async function GET() {
  try {
    const stats = generateMockPerformanceStats()
    return NextResponse.json({ success: true, data: stats })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch performance stats' }, { status: 500 })
  }
}
