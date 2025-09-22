// Phantom Hunting Core API Route
// Provides REST endpoints for threat hunting and proactive security operations

import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, handleError } from './utils';
import {
  handleStatus,
  handleHunts,
  handleAnalytics,
  handleIOCs,
  handleConductHunt,
  handleAnalyzeHypothesis,
  handleTrackIOCs,
  handleGenerateHuntReport
} from './handlers';

/**
 * GET /api/phantom-cores/hunting - Get hunting system status and analysis data
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'status';

    switch (operation) {
      case 'status':
        return NextResponse.json(handleStatus());

      case 'hunts':
        return NextResponse.json(handleHunts());

      case 'analytics':
        return NextResponse.json(handleAnalytics());

      case 'iocs':
        return NextResponse.json(handleIOCs());

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

/**
 * POST /api/phantom-cores/hunting - Perform hunting operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    switch (operation) {
      case 'conduct-hunt':
        return NextResponse.json(handleConductHunt(params));

      case 'analyze-hypothesis':
        return NextResponse.json(handleAnalyzeHypothesis(params));

      case 'track-iocs':
        return NextResponse.json(handleTrackIOCs(params));

      case 'generate-hunt-report':
        return NextResponse.json(handleGenerateHuntReport(params));

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
