// Phantom MITRE Core API Route
// Provides REST endpoints for MITRE ATT&CK framework integration and TTP analysis

import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, handleError } from './utils';
import {
  handleStatus,
  handleAnalysis,
  handleTactics,
  handleTechniques,
  handleGroups,
  handleCoverage,
  handleAnalyzeTtp,
  handleMapTechniques,
  handleAssessCoverage,
  handleGenerateMitreReport,
  handleMapIncident
} from './handlers';

/**
 * GET /api/phantom-cores/mitre - Get MITRE system status and ATT&CK data
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

      case 'tactics':
        return NextResponse.json(handleTactics());

      case 'techniques':
        return NextResponse.json(handleTechniques());

      case 'groups':
        return NextResponse.json(handleGroups());

      case 'coverage':
        return NextResponse.json(handleCoverage());

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
 * POST /api/phantom-cores/mitre - Map incidents to MITRE or perform TTP analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    switch (operation) {
      case 'analyze-ttp':
        return NextResponse.json(handleAnalyzeTtp(params));

      case 'map-techniques':
        return NextResponse.json(handleMapTechniques(params));

      case 'assess-coverage':
        return NextResponse.json(handleAssessCoverage(params));

      case 'generate-mitre-report':
        return NextResponse.json(handleGenerateMitreReport(params));

      case 'map_incident':
        return NextResponse.json(handleMapIncident(params));

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
