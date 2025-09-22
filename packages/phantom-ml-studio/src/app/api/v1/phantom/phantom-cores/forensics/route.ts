// Phantom Forensics Core API Route - Digital Forensics & Evidence Analysis
// Provides REST endpoints for digital forensics, evidence collection, and analysis

import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, handleError } from './utils';
import {
  handleStatus,
  handleInvestigations,
  handleEvidence,
  handleArtifacts,
  handleAnalyzeEvidence,
  handleReconstructTimeline,
  handleExtractArtifacts,
  handleGenerateForensicsReport
} from './handlers';

/**
 * GET /api/phantom-cores/forensics - Get forensics system status and operations
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'status';

    switch (operation) {
      case 'status':
        return NextResponse.json(handleStatus());

      case 'investigations':
        return NextResponse.json(handleInvestigations());

      case 'evidence':
        return NextResponse.json(handleEvidence());

      case 'artifacts':
        return NextResponse.json(handleArtifacts());

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown forensics operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

/**
 * POST /api/phantom-cores/forensics - Perform forensics operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    switch (operation) {
      case 'analyze-evidence':
        return NextResponse.json(handleAnalyzeEvidence(params));

      case 'reconstruct-timeline':
        return NextResponse.json(handleReconstructTimeline(params));

      case 'extract-artifacts':
        return NextResponse.json(handleExtractArtifacts(params));

      case 'generate-forensics-report':
        return NextResponse.json(handleGenerateForensicsReport(params));

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown forensics operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
