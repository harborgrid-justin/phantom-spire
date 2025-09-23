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

      case 'threat-landscape':
        return NextResponse.json(handleThreatLandscape());

      case 'attribution-intelligence':
        return NextResponse.json(handleAttributionIntelligence());

      case 'emerging-threats':
        return NextResponse.json(handleEmergingThreats());

      case 'geopolitical-intelligence':
        return NextResponse.json(handleGeopoliticalIntelligence());

      case 'sector-intelligence':
        return NextResponse.json(handleSectorIntelligence());

      case 'tactical-intelligence':
        return NextResponse.json(handleTacticalIntelligence());

      case 'strategic-intelligence':
        return NextResponse.json(handleStrategicIntelligence());

      case 'operational-intelligence':
        return NextResponse.json(handleOperationalIntelligence());

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

      case 'correlate-intelligence':
        return NextResponse.json(handleCorrelateIntelligence(params));

      case 'threat-assessment':
        return NextResponse.json(handleThreatAssessment(params));

      case 'intelligence-fusion':
        return NextResponse.json(handleIntelligenceFusion(params));

      case 'predictive-analysis':
        return NextResponse.json(handlePredictiveAnalysis(params));

      case 'campaign-analysis':
        return NextResponse.json(handleCampaignAnalysis(params));

      case 'actor-profiling':
        return NextResponse.json(handleActorProfiling(params));

      case 'infrastructure-analysis':
        return NextResponse.json(handleInfrastructureAnalysis(params));

      case 'malware-intelligence':
        return NextResponse.json(handleMalwareIntelligence(params));

      case 'vulnerability-intelligence':
        return NextResponse.json(handleVulnerabilityIntelligence(params));

      case 'behavioral-analysis':
        return NextResponse.json(handleBehavioralAnalysis(params));

      case 'timeline-analysis':
        return NextResponse.json(handleTimelineAnalysis(params));

      case 'pattern-recognition':
        return NextResponse.json(handlePatternRecognition(params));

      case 'anomaly-detection':
        return NextResponse.json(handleAnomalyDetection(params));

      case 'risk-scoring':
        return NextResponse.json(handleRiskScoring(params));

      case 'threat-modeling':
        return NextResponse.json(handleThreatModeling(params));

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
