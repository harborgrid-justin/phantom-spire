/**
 * API Route: /api/deployments
 * Get deployments from PostgreSQL database
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/database';
import { initializeCompleteDatabase } from '../../../lib/database-init';

export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized
    await initializeCompleteDatabase();
    
    // Fetch deployments from database
    const result = await query(`
      SELECT 
        id,
        name,
        model_name,
        model_version,
        status,
        environment,
        endpoint,
        instances,
        cpu,
        memory,
        requests_per_minute,
        total_requests,
        uptime,
        avg_response_time,
        error_rate,
        deployed_at,
        last_updated,
        health,
        auto_scaling,
        min_instances,
        max_instances,
        created_at,
        updated_at
      FROM deployments 
      ORDER BY last_updated DESC
    `);

    // Transform data to match frontend expectations
    const transformedData = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      modelName: row.model_name,
      modelVersion: row.model_version,
      status: row.status,
      environment: row.environment,
      endpoint: row.endpoint,
      instances: row.instances,
      cpu: row.cpu,
      memory: row.memory,
      requestsPerMinute: row.requests_per_minute,
      totalRequests: row.total_requests,
      uptime: row.uptime,
      avgResponseTime: row.avg_response_time,
      errorRate: row.error_rate,
      deployedAt: row.deployed_at,
      lastUpdated: row.last_updated,
      health: row.health,
      autoScaling: row.auto_scaling,
      minInstances: row.min_instances,
      maxInstances: row.max_instances,
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      count: result.rowCount
    });

  } catch (error) {
    console.error('API Error - deployments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch deployments',
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
      name, modelName, modelVersion, status = 'stopped', environment = 'development',
      endpoint, instances = 0, cpu = 0, memory = 0 
    } = body;

    // Validate required fields
    if (!name || !modelName || !modelVersion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Name, modelName, and modelVersion are required'
        },
        { status: 400 }
      );
    }

    // Insert new deployment
    const result = await query(
      `INSERT INTO deployments (
        name, model_name, model_version, status, environment, endpoint,
        instances, cpu, memory, deployed_at, last_updated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [
        name, modelName, modelVersion, status, environment, endpoint,
        instances, cpu, memory, new Date(), new Date()
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Deployment created successfully'
    });

  } catch (error) {
    console.error('API Error - create deployment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create deployment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
