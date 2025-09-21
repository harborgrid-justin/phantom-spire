// Phantom XDR Core API Route - Extended Detection and Response
// Provides REST endpoints for enterprise XDR capabilities

import { NextRequest, NextResponse } from 'next/server';
import { getPhantomCoreIntegrator } from '@/services/phantom-core-integrator';

/**
 * GET /api/phantom-cores/xdr - Get XDR system status and operations
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'status';

    const integrator = getPhantomCoreIntegrator();
    if (!integrator.isInitialized()) {
      return NextResponse.json({
        success: false,
        error: 'Phantom cores not initialized',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    const xdrCore = integrator.getCore('xdr');

    switch (operation) {
      case 'status':
        const status = await xdrCore.getXdrSystemStatus();
        return NextResponse.json({
          success: true,
          data: status,
          source: 'phantom-xdr-api',
          timestamp: new Date().toISOString()
        });

      case 'health':
        const health = await xdrCore.healthCheck();
        return NextResponse.json({
          success: true,
          data: health,
          source: 'phantom-xdr-api',
          timestamp: new Date().toISOString()
        });

      case 'enterprise-status':
        const enterpriseStatus = await xdrCore.getEnterpriseStatus();
        return NextResponse.json({
          success: true,
          data: enterpriseStatus,
          source: 'phantom-xdr-api',
          timestamp: new Date().toISOString()
        });

      case 'statistics':
        const stats = await xdrCore.getStatistics();
        return NextResponse.json({
          success: true,
          data: stats,
          source: 'phantom-xdr-api',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown XDR operation: ${operation}`,
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Phantom XDR API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/phantom-cores/xdr - Perform XDR operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    const integrator = getPhantomCoreIntegrator();
    if (!integrator.isInitialized()) {
      return NextResponse.json({
        success: false,
        error: 'Phantom cores not initialized',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    const xdrCore = integrator.getCore('xdr');

    switch (operation) {
      case 'detect-threats':
        const threatAnalysis = await xdrCore.detectAndAnalyzeThreats(params.analysisData || {
          scope: 'enterprise_wide',
          analysis_depth: 'comprehensive'
        });
        return NextResponse.json({
          success: true,
          data: threatAnalysis,
          source: 'phantom-xdr-api',
          timestamp: new Date().toISOString()
        });

      case 'investigate-incident':
        const investigation = await xdrCore.investigateSecurityIncident(params.incidentData || {
          incident_type: 'security_alert'
        });
        return NextResponse.json({
          success: true,
          data: investigation,
          source: 'phantom-xdr-api',
          timestamp: new Date().toISOString()
        });

      case 'threat-hunt':
        const huntResults = await xdrCore.conductThreatHunt(params.huntParameters || {
          hunt_name: 'Enterprise Threat Hunt',
          hunt_scope: 'enterprise_environment'
        });
        return NextResponse.json({
          success: true,
          data: huntResults,
          source: 'phantom-xdr-api',
          timestamp: new Date().toISOString()
        });

      case 'orchestrate-response':
        const responseResults = await xdrCore.orchestrateSecurityResponse(params.responsePlan || {
          incident_severity: 'high'
        });
        return NextResponse.json({
          success: true,
          data: responseResults,
          source: 'phantom-xdr-api',
          timestamp: new Date().toISOString()
        });

      case 'analyze-behavior':
        const behaviorAnalysis = await xdrCore.analyzeBehavioralPatterns(params.userActivity || {
          analysis_period: '30_days'
        });
        return NextResponse.json({
          success: true,
          data: behaviorAnalysis,
          source: 'phantom-xdr-api',
          timestamp: new Date().toISOString()
        });

      case 'comprehensive-analysis':
        const comprehensiveAnalysis = await xdrCore.comprehensiveXdrAnalysis(params.analysisConfig || {});
        return NextResponse.json({
          success: true,
          data: comprehensiveAnalysis,
          source: 'phantom-xdr-api',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown XDR operation: ${operation}`,
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Phantom XDR API POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}