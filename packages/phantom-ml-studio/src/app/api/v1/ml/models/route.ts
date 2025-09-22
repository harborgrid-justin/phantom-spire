/**
 * API Route: /api/models
 * Get models from PostgreSQL database
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/database/database';
import { initializeCompleteDatabase } from '../../../../../lib/database/database-init';

export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized
    await initializeCompleteDatabase();
    
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
    `);

    // Transform data to match frontend expectations
    const transformedData = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      algorithm: row.algorithm,
      accuracy: row.accuracy,
      f1Score: row.f1_score,
      auc: row.auc,
      status: row.status,
      version: row.version,
      size: row.size,
      createdAt: row.created_at,
      lastTrained: row.last_trained,
      deployments: row.deployments,
      predictions: row.predictions,
      starred: row.starred,
      framework: row.framework,
      features: row.features,
      metrics: row.metrics,
      securityScore: row.security_score,
      performanceScore: row.performance_score,
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      count: result.rowCount
    });

  } catch (error) {
    console.error('API Error - models:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch models',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, type, algorithm, accuracy = 0, f1Score = 0, auc = 0,
      status = 'Development', version = '1.0.0', size = '0 MB',
      framework = 'phantom-ml-core', features = [], metrics = {},
      securityScore = 0, performanceScore = 0
    } = body;

    // Validate required fields
    if (!name || !type || !algorithm) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Name, type, and algorithm are required'
        },
        { status: 400 }
      );
    }

    // Insert new model
    const result = await query(
      `INSERT INTO models (
        name, type, algorithm, accuracy, f1_score, auc, status, version, size,
        framework, features, metrics, security_score, performance_score,
        created_at, last_trained
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
      RETURNING *`,
      [
        name, type, algorithm, accuracy, f1Score, auc, status, version, size,
        framework, features, JSON.stringify(metrics), securityScore, performanceScore,
        new Date(), new Date()
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Model created successfully'
    });

  } catch (error) {
    console.error('API Error - create model:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create model',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
