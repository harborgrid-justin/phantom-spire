import { NextResponse } from 'next/server'
import { apiWrapper } from '@/lib/ml-core'

/**
 * Enhanced Datasets API Route
 * GET /api/ml-core/datasets
 *
 * Returns all available datasets with comprehensive metadata including:
 * - Dataset quality metrics and statistics
 * - Size information (bytes and human-readable)
 * - Feature and sample counts
 * - Data quality scores and missing value percentages
 * - Source information and tags
 */
export async function GET() {
  try {
    const response = await apiWrapper.getDatasets()

    if (response.success) {
      return NextResponse.json(response, { status: 200 })
    } else {
      return NextResponse.json(response, { status: 500 })
    }
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch datasets',
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