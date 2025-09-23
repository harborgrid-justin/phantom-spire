// Phantom Attribution Core API Route - Threat Actor Attribution and Tracking
// Provides REST endpoints for advanced threat actor attribution, confidence scoring, and behavioral analysis

import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, handleError } from '../utils';
import {
  handleStatus,
  handleHealth,
  handleEnterpriseStatus,
  handleStatistics,
  handleAttributionAnalysis,
  handleActorProfiling,
  handleBehavioralAnalysis,
  handleCampaignTracking,
  handleRelationshipMapping,
  handleConfidenceScoring,
  handleHistoricalAnalysis,
  handlePredictiveAnalysis,
  handleTTPs,
  handleMotivation,
  handleGeolocation,
  handleInfrastructure,
  handleAttackTimeline,
  handleVictimology,
  handleCapabilities,
  handleResources,
  handleCounterIntelligence,
  handleDeceptionAnalysis,
  handleAttributionFusion,
  handleThreatLandscape
} from './handlers';

/**
 * GET /api/phantom-cores/attribution - Get attribution system status and actor data
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

      case 'attribution-analysis':
        return NextResponse.json(handleAttributionAnalysis());

      case 'actor-profiling':
        return NextResponse.json(handleActorProfiling());

      case 'behavioral-analysis':
        return NextResponse.json(handleBehavioralAnalysis());

      case 'campaign-tracking':
        return NextResponse.json(handleCampaignTracking());

      case 'relationship-mapping':
        return NextResponse.json(handleRelationshipMapping());

      case 'confidence-scoring':
        return NextResponse.json(handleConfidenceScoring());

      case 'historical-analysis':
        return NextResponse.json(handleHistoricalAnalysis());

      case 'predictive-analysis':
        return NextResponse.json(handlePredictiveAnalysis());

      case 'ttps':
        return NextResponse.json(handleTTPs());

      case 'motivation':
        return NextResponse.json(handleMotivation());

      case 'geolocation':
        return NextResponse.json(handleGeolocation());

      case 'threat-landscape':
        return NextResponse.json(handleThreatLandscape());

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown attribution operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

/**
 * POST /api/phantom-cores/attribution - Perform attribution operations and analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    switch (operation) {
      case 'analyze-attribution':
        return NextResponse.json(handleAttributionAnalysis(params));

      case 'profile-actor':
        return NextResponse.json(handleActorProfiling(params));

      case 'analyze-behavior':
        return NextResponse.json(handleBehavioralAnalysis(params));

      case 'track-campaign':
        return NextResponse.json(handleCampaignTracking(params));

      case 'map-relationships':
        return NextResponse.json(handleRelationshipMapping(params));

      case 'score-confidence':
        return NextResponse.json(handleConfidenceScoring(params));

      case 'analyze-historical':
        return NextResponse.json(handleHistoricalAnalysis(params));

      case 'predictive-analysis':
        return NextResponse.json(handlePredictiveAnalysis(params));

      case 'analyze-ttps':
        return NextResponse.json(handleTTPs(params));

      case 'analyze-motivation':
        return NextResponse.json(handleMotivation(params));

      case 'analyze-geolocation':
        return NextResponse.json(handleGeolocation(params));

      case 'analyze-infrastructure':
        return NextResponse.json(handleInfrastructure(params));

      case 'create-timeline':
        return NextResponse.json(handleAttackTimeline(params));

      case 'analyze-victimology':
        return NextResponse.json(handleVictimology(params));

      case 'assess-capabilities':
        return NextResponse.json(handleCapabilities(params));

      case 'analyze-resources':
        return NextResponse.json(handleResources(params));

      case 'counter-intelligence':
        return NextResponse.json(handleCounterIntelligence(params));

      case 'deception-analysis':
        return NextResponse.json(handleDeceptionAnalysis(params));

      case 'attribution-fusion':
        return NextResponse.json(handleAttributionFusion(params));

      case 'threat-landscape':
        return NextResponse.json(handleThreatLandscape(params));

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown attribution operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

/**
 * PUT /api/phantom-cores/attribution - Update attribution data and models
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    switch (operation) {
      case 'update-actor-profile':
        return NextResponse.json(handleActorProfiling(params));

      case 'update-confidence-score':
        return NextResponse.json(handleConfidenceScoring(params));

      case 'update-campaign-data':
        return NextResponse.json(handleCampaignTracking(params));

      case 'update-relationships':
        return NextResponse.json(handleRelationshipMapping(params));

      case 'update-behavioral-model':
        return NextResponse.json(handleBehavioralAnalysis(params));

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown attribution update operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

/**
 * DELETE /api/phantom-cores/attribution - Remove attribution data
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'remove-attribution';

    switch (operation) {
      case 'remove-attribution':
        return NextResponse.json(
          createApiResponse(true, { message: 'Attribution data removed successfully' })
        );

      case 'remove-actor':
        return NextResponse.json(
          createApiResponse(true, { message: 'Threat actor profile removed successfully' })
        );

      case 'remove-campaign':
        return NextResponse.json(
          createApiResponse(true, { message: 'Campaign data removed successfully' })
        );

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown attribution delete operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}