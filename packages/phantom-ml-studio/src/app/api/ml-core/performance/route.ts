import { NextResponse } from 'next/server'
import { apiWrapper } from '@/lib/ml-core'

/**
 * Performance Statistics API Route
 * GET /api/ml-core/performance
 *
 * Returns real-time system performance statistics including:
 * - Total operations count
 * - Average inference time
 * - Memory usage metrics
 * - Active models count
 * - System uptime
 */
export async function GET() {
  try {
    const response = await apiWrapper.getPerformanceStats()

    if (response.success) {
      return NextResponse.json(response, { status: 200 })
    } else {
      return NextResponse.json(response, { status: 500 })
    }
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch performance stats',
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