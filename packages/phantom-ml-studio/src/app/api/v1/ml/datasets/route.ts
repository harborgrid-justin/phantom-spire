/**
 * API Route: /api/datasets
 * Get datasets from PostgreSQL database
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/database/database';
import { initializeCompleteDatabase } from '../../../../lib/database/database-init';

export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized
    await initializeCompleteDatabase();
    
    // Fetch datasets from database
    const result = await query(`
      SELECT 
        id,
        name,
        rows,
        columns,
        type,
        uploaded,
        created_at,
        updated_at
      FROM datasets 
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });

  } catch (error) {
    console.error('API Error - datasets:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch datasets',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, rows, columns, type, uploaded } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Name and type are required'
        },
        { status: 400 }
      );
    }

    // Insert new dataset
    const result = await query(
      `INSERT INTO datasets (name, rows, columns, type, uploaded) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, rows || 0, columns || 0, type, uploaded || new Date().toISOString()]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Dataset created successfully'
    });

  } catch (error) {
    console.error('API Error - create dataset:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create dataset',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}