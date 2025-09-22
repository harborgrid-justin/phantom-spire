// Phantom IOC Core API Route - Indicators of Compromise Management and Analysis
// Provides REST endpoints for IOC management, enrichment, correlation, and threat intelligence

import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, handleError } from './utils';
import {
  handleStatus,
  handleAnalysis,
  handleRecent,
  handleTrending,
  handleFeeds,
  handleSubmit,
  handleSearch,
  handleAnalyzeIOC,
  handleEnrichIOC,
  handleCorrelateIOCs,
  handleGenerateIOCReport,
  handleEnrich
} from './handlers';

/**
 * GET /api/phantom-cores/ioc - Get IOC system status and indicator data
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

      case 'recent':
        return NextResponse.json(handleRecent());

      case 'trending':
        return NextResponse.json(handleTrending());

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
 * POST /api/phantom-cores/ioc - Submit IOCs or perform analysis operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    switch (operation) {
      case 'submit':
        return NextResponse.json(handleSubmit(params));

      case 'search':
        return NextResponse.json(handleSearch(params));

      case 'analyze-ioc':
        return NextResponse.json(handleAnalyzeIOC(params));

      case 'enrich-ioc':
        return NextResponse.json(handleEnrichIOC(params));

      case 'correlate-iocs':
        return NextResponse.json(handleCorrelateIOCs(params));

      case 'generate-ioc-report':
        return NextResponse.json(handleGenerateIOCReport(params));

      case 'enrich':
        // Legacy endpoint
        return NextResponse.json(handleEnrich(params));

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
