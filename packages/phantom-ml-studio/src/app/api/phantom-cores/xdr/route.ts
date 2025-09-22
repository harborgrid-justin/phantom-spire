// Phantom XDR Core API Route - Extended Detection and Response
// Provides REST endpoints for enterprise XDR capabilities

import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, handleError } from './utils';
import {
  handleStatus,
  handleHealth,
  handleEnterpriseStatus,
  handleStatistics,
  handleDetectThreats,
  handleInvestigateIncident,
  handleThreatHunt,
  handleOrchestrateResponse,
  handleAnalyzeBehavior,
  handleComprehensiveAnalysis
} from './handlers';

/**
 * GET /api/phantom-cores/xdr - Get XDR system status and operations
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'status';

    switch (operation) {
      case 'status':
        return NextResponse.json(handleStatus());

      case 'health':
        return NextResponse.json(handleHealth());

      case 'enterprise-status':
        return NextResponse.json(handleEnterpriseStatus());

      case 'statistics':
        return NextResponse.json(handleStatistics());

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown XDR operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

/**
 * POST /api/phantom-cores/xdr - Perform XDR operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    switch (operation) {
      case 'detect-threats':
        return NextResponse.json(handleDetectThreats(params));

      case 'investigate-incident':
        return NextResponse.json(handleInvestigateIncident(params));

      case 'threat-hunt':
        return NextResponse.json(handleThreatHunt(params));

      case 'orchestrate-response':
        return NextResponse.json(handleOrchestrateResponse(params));

      case 'analyze-behavior':
        return NextResponse.json(handleAnalyzeBehavior(params));

      case 'comprehensive-analysis':
        return NextResponse.json(handleComprehensiveAnalysis());

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown XDR operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
