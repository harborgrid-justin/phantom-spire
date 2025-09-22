// Phantom Intel Core API Route - Threat Intelligence Gathering and Analysis
// Provides REST endpoints for threat intelligence gathering and analysis

import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, handleError } from './utils';
import {
  handleStatus,
  handleAnalysis,
  handleCampaigns,
  handleActors,
  handleFeeds,
  handleEnrich,
  handleHunt
} from './handlers';

/**
 * GET /api/phantom-cores/intel - Get intelligence system status and threat data
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'status';

    switch (operation) {
      case 'status':
        return NextResponse.json(handleStatus());

      case 'analysis':
        return NextResponse.json(handleAnalysis());

      case 'campaigns':
        return NextResponse.json(handleCampaigns());

      case 'actors':
        return NextResponse.json(handleActors());

      case 'feeds':
        return NextResponse.json(handleFeeds());

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
 * POST /api/phantom-cores/intel - Query intelligence or manage threat data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    switch (operation) {
      case 'enrich':
        return NextResponse.json(handleEnrich(params));

      case 'hunt':
        return NextResponse.json(handleHunt(params));

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
