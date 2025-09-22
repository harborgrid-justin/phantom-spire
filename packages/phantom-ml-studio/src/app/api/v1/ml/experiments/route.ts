/**
 * API Route: /api/experiments
 * Get experiments from PostgreSQL database
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/database/database';
import { initializeCompleteDatabase } from '../../../../../lib/database/database-init';

export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized
    await initializeCompleteDatabase();
    
    // Fetch experiments from database
    const result = await query(`
      SELECT 
        id,
        name,
        status,
        accuracy,
        f1_score,
        auc,
        algorithm,
        dataset,
        created_at,
        duration,
        hyperparameters,
        updated_at
      FROM experiments 
      ORDER BY created_at DESC
    `);

    // Transform data to match frontend expectations
    const transformedData = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      status: row.status,
      accuracy: row.accuracy,
      f1Score: row.f1_score,
      auc: row.auc,
      algorithm: row.algorithm,
      dataset: row.dataset,
      createdAt: row.created_at,
      duration: row.duration,
      hyperparameters: row.hyperparameters,
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      count: result.rowCount
    });

  } catch (error) {
    console.error('API Error - experiments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch experiments',
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
      name, status = 'scheduled', accuracy = 0, f1Score = 0, auc = 0,
      algorithm, dataset, duration = 'Not started', hyperparameters = {}
    } = body;

    // Validate required fields
    if (!name || !algorithm || !dataset) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Name, algorithm, and dataset are required'
        },
        { status: 400 }
      );
    }

    // Insert new experiment
    const result = await query(
      `INSERT INTO experiments (
        name, status, accuracy, f1_score, auc, algorithm, dataset, duration, hyperparameters, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [
        name, status, accuracy, f1Score, auc, algorithm, dataset, duration, 
        JSON.stringify(hyperparameters), new Date()
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Experiment created successfully'
    });

  } catch (error) {
    console.error('API Error - create experiment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create experiment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
