import { NextResponse } from 'next/server'
import { apiWrapper } from '@/lib/ml-core'

/**
 * ML Core Health Check API Route
 * GET /api/ml-core/health
 *
 * Returns the health status of the ML Core system including:
 * - Native extension availability
 * - System components status
 * - Version information
 */
export async function GET() {
  try {
    const response = await apiWrapper.healthCheck()

    if (response.success) {
      return NextResponse.json(response, { status: 200 })
    } else {
      return NextResponse.json(response, { status: 503 })
    }
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString(),
      data: {
        status: 'unhealthy',
        version: 'unknown',
        components: {
          native_extension: false,
          core_initialized: false,
          platform_supported: false
        }
      }
    }

    return NextResponse.json(errorResponse, { status: 503 })
  }
}

/**
 * ML Core Health Check Options
 * OPTIONS /api/ml-core/health
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