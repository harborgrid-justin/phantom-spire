/**
 * API Route: /api/ml-core/models
 * Get ML models from PostgreSQL database (updated to use database)
 */
import { NextRequest, NextResponse } from 'next/server'
import type { Model } from '../../../../lib/ml-core/types'
import { query } from '../../../../lib/database'
import { initializeCompleteDatabase } from '../../../../lib/database-init'

export async function GET() {
  try {
    // Ensure database is initialized
    await initializeCompleteDatabase()
    
    // Fetch models from database
    const result = await query(`
      SELECT 
        id,
        name,
        type,
        algorithm,
        accuracy,
        f1_score,
        auc,
        status,
        version,
        size,
        created_at,
        last_trained,
        deployments,
        predictions,
        starred,
        framework,
        features,
        metrics,
        security_score,
        performance_score,
        updated_at
      FROM models 
      ORDER BY created_at DESC
    `)

    // Transform database data to match ML Core Model interface
    const models: Model[] = result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      model_type: row.type.toLowerCase().replace(' ', '_') as any,
      algorithm: row.algorithm.toLowerCase().replace(' ', '_').replace('-', '_') as any,
      status: row.status.toLowerCase() as any,
      version: row.version,
      accuracy: row.accuracy,
      feature_count: row.features ? row.features.length : 0,
      model_size_mb: parseFloat(row.size.replace(' MB', '')) || 0,
      inference_time_avg_ms: 10 + Math.random() * 20, // Simulated inference time
      tags: row.features ? row.features.slice(0, 3) : [], // Use first few features as tags
      created_at: row.created_at,
    }))

    return NextResponse.json({ success: true, data: models })
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
