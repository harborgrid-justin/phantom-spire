// Phantom Threat Actor Core API Route
// Provides REST endpoints for threat actor profiling and attribution analysis

import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, handleError } from './utils';
import {
  handleStatus,
  handleAnalysis,
  handleActors,
  handleCampaigns,
  handleAttribution,
  handleAttribute,
  handleProfile,
  handleProfileActor,
  handleTrackCampaign,
  handleAnalyzeAttribution,
  handleGenerateIntelligence,
  handleHunt
} from './handlers';

/**
 * GET /api/phantom-cores/threat-actor - Get threat actor system status and analysis data
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

      case 'actors':
        return NextResponse.json(handleActors());

      case 'campaigns':
        return NextResponse.json(handleCampaigns());

      case 'attribution':
        return NextResponse.json(handleAttribution());

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
 * POST /api/phantom-cores/threat-actor - Perform attribution analysis or manage actor profiles
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    switch (operation) {
      case 'attribute':
        return NextResponse.json(handleAttribute(params));

      case 'profile':
        return NextResponse.json(handleProfile(params));

      case 'profile-actor':
        return NextResponse.json(handleProfileActor(params));

      case 'track-campaign':
        return NextResponse.json(handleTrackCampaign(params));

      case 'analyze-attribution':
        return NextResponse.json(handleAnalyzeAttribution(params));

      case 'generate-intelligence':
        return NextResponse.json(handleGenerateIntelligence(params));

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
