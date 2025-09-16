import { NextResponse } from 'next/server'
import { apiWrapper } from '@/lib/ml-core'

/**
 * Enhanced Models API Route
 * GET /api/ml-core/models
 *
 * Returns all available ML models with comprehensive metadata including:
 * - Model performance metrics (accuracy, precision, recall, f1_score)
 * - Training information and timestamps
 * - Resource usage (model size, inference time)
 * - Dataset associations and feature counts
 */
export async function GET() {
  try {
    const response = await apiWrapper.getModels()

    if (response.success) {
      return NextResponse.json(response, { status: 200 })
    } else {
      return NextResponse.json(response, { status: 500 })
    }
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch models',
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