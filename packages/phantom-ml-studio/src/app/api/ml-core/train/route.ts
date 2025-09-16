import { NextRequest, NextResponse } from 'next/server'
import { apiWrapper } from '@/lib/ml-core'
import type { TrainingConfig } from '@/lib/ml-core'

/**
 * Model Training API Route
 * POST /api/ml-core/train
 *
 * Initiates model training with comprehensive configuration including:
 * - Training parameters (epochs, batch size, validation split)
 * - Cross-validation settings
 * - Real-time progress tracking
 * - Training metrics and loss curves
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate training configuration
    const config: TrainingConfig = {
      epochs: body.epochs || 100,
      batch_size: body.batch_size || 32,
      validation_split: body.validation_split || 0.2,
      cross_validation: body.cross_validation !== undefined ? body.cross_validation : true,
      cross_validation_folds: body.cross_validation_folds || 5
    }

    // Validate required fields
    if (config.epochs <= 0 || config.batch_size <= 0 || config.validation_split < 0 || config.validation_split >= 1) {
      return NextResponse.json({
        success: false,
        error: 'Invalid training configuration parameters',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const response = await apiWrapper.trainModel(config)

    if (response.success) {
      return NextResponse.json(response, { status: 201 })
    } else {
      return NextResponse.json(response, { status: 500 })
    }
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start training',
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