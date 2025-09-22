/**
 * API Route: /api/ml-core/models
 * Get ML models from PostgreSQL database using Sequelize
 */
import { NextRequest, NextResponse } from 'next/server'
import type { Model as MLCoreModel } from '../../../../lib/ml-core/types';
import { Model } from '../../../../../lib/database/models/Model.model';
import { getSequelize } from '../../../../../lib/database/sequelize';

export async function GET() {
  try {
    // Initialize Sequelize connection
    await getSequelize()
    
    // Fetch models from database using Sequelize
    const models = await Model.findAll({
      order: [['created_at', 'DESC']]
    })

    // Transform Sequelize models to match ML Core Model interface
    const transformedModels: MLCoreModel[] = models.map(model => ({
      id: model.id.toString(),
      name: model.name,
      model_type: model.type.toLowerCase().replace(' ', '_') as any,
      algorithm: model.algorithm.toLowerCase().replace(' ', '_').replace('-', '_') as any,
      status: model.status.toLowerCase() as any,
      version: model.version,
      accuracy: model.accuracy,
      feature_count: model.features ? model.features.length : 0,
      model_size_mb: parseFloat(model.size.replace(' MB', '')) || 0,
      inference_time_avg_ms: 10 + Math.random() * 20, // Simulated inference time
      tags: model.features ? model.features.slice(0, 3) : [], // Use first few features as tags
      created_at: model.created_at.toISOString(),
    }))

    return NextResponse.json({ success: true, data: transformedModels })
  } catch (error) {
    console.error('API Error - ml-core/models:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch models',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Sequelize connection
    await getSequelize()
    
    const body = await request.json()
    
    // Create new model using Sequelize
    const model = await Model.create({
      name: body.name,
      type: body.type || 'Classification',
      algorithm: body.algorithm || 'Random Forest',
      accuracy: body.accuracy || 0,
      f1_score: body.f1_score || 0,
      auc: body.auc || 0,
      status: body.status || 'Development',
      version: body.version || '1.0.0',
      size: body.size || '0 MB',
      framework: body.framework || 'phantom-ml-core',
      features: body.features || [],
      metrics: body.metrics || {},
      security_score: body.security_score || 0,
      performance_score: body.performance_score || 0
    })

    return NextResponse.json({ 
      success: true, 
      data: {
        id: model.id.toString(),
        name: model.name,
        model_type: model.type.toLowerCase().replace(' ', '_') as any,
        algorithm: model.algorithm.toLowerCase().replace(' ', '_').replace('-', '_') as any,
        status: model.status.toLowerCase() as any,
        version: model.version,
        accuracy: model.accuracy,
        feature_count: model.features ? model.features.length : 0,
        model_size_mb: parseFloat(model.size.replace(' MB', '')) || 0,
        inference_time_avg_ms: 10 + Math.random() * 20,
        tags: model.features ? model.features.slice(0, 3) : [],
        created_at: model.created_at.toISOString(),
      }
    })
  } catch (error) {
    console.error('API Error - ml-core/models POST:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create model',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
