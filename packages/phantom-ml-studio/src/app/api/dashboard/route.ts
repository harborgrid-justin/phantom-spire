/**
 * API Route: /api/dashboard
 * Get dashboard data (performance metrics, threat types, recent activities)
 */
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/database';
import { initializeCompleteDatabase } from '../../../lib/database-init';

export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized
    await initializeCompleteDatabase();
    
    // Fetch performance data
    const performanceResult = await query(`
      SELECT name, value 
      FROM performance_data 
      ORDER BY id
    `);

    // Fetch threat types
    const threatTypesResult = await query(`
      SELECT name, count 
      FROM threat_types 
      ORDER BY count DESC
    `);

    // Fetch recent activities
    const activitiesResult = await query(`
      SELECT id, user_name as user, action, timestamp, details 
      FROM recent_activities 
      ORDER BY timestamp DESC
      LIMIT 10
    `);

    // Fetch deployment metrics for the first deployment
    const metricsResult = await query(`
      SELECT time, requests, response_time, errors 
      FROM metrics_data md 
      JOIN deployments d ON md.deployment_id = d.id 
      ORDER BY md.id 
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      data: {
        performanceData: performanceResult.rows,
        threatTypes: threatTypesResult.rows,
        recentActivities: activitiesResult.rows,
        metricsData: metricsResult.rows
      }
    });

  } catch (error) {
    console.error('API Error - dashboard:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
