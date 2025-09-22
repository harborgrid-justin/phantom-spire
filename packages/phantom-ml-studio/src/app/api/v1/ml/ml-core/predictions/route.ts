import { NextRequest, NextResponse } from 'next/server'
import { apiWrapper } from '@/lib/ml-core'

/**
 * Model Predictions API Route
 * POST /api/ml-core/predictions
 *
 * Generates predictions using a trained model with:
 * - Model ID and input data validation
 * - Confidence scores and feature attribution
 * - Real-time inference with performance tracking
 * - Error handling for invalid inputs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    if (!body.modelId || !body.data) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: modelId and data',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const { modelId, data } = body

    // Validate modelId
    if (typeof modelId !== 'string' || modelId.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid modelId: must be a non-empty string',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Validate and serialize data
    let serializedData: string
    try {
      if (typeof data === 'string') {
        // If already a string, validate it's valid JSON
        JSON.parse(data)
        serializedData = data
      } else {
        // Serialize to JSON string
        serializedData = JSON.stringify(data)
      }
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid data format: must be valid JSON',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const response = await apiWrapper.getPredictions(modelId, serializedData)

    if (response.success) {
      return NextResponse.json(response, { status: 200 })
    } else {
      return NextResponse.json(response, { status: 500 })
    }
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate predictions',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}