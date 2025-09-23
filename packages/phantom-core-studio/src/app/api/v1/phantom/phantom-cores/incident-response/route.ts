// Phantom Incident Response Core API Route - Incident Response Management and Coordination
// Provides REST endpoints for incident response management, team coordination, and response analytics

import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, handleError } from './utils';
import {
  handleStatus,
  handleIncidents,
  handleTimeline,
  handlePlaybooks,
  handleMetrics,
  handleAnalyzeIncident,
  handleInitiateResponse,
  handleCoordinateTeam,
  handleGenerateIncidentReport,
  handleCreate,
  handleUpdate,
  handleEscalate,
  handleContain
} from './handlers';

/**
 * GET /api/phantom-cores/incident-response - Get incident response system status and data
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'status';

    switch (operation) {
      case 'status':
        return NextResponse.json(handleStatus());

      case 'incidents':
        return NextResponse.json(handleIncidents());

      case 'timeline':
        const incidentId = url.searchParams.get('incident_id');
        return NextResponse.json(handleTimeline(incidentId || undefined));

      case 'playbooks':
        return NextResponse.json(handlePlaybooks());

      case 'metrics':
        return NextResponse.json(handleMetrics());

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
 * POST /api/phantom-cores/incident-response - Create incidents or perform response actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    switch (operation) {
      case 'analyze-incident':
        return NextResponse.json(handleAnalyzeIncident(params));

      case 'initiate-response':
        return NextResponse.json(handleInitiateResponse(params));

      case 'coordinate-team':
        return NextResponse.json(handleCoordinateTeam(params));

      case 'generate-incident-report':
        return NextResponse.json(handleGenerateIncidentReport(params));

      case 'create':
        // Legacy support
        return NextResponse.json(handleCreate(params));

      case 'update':
        // Legacy support
        return NextResponse.json(handleUpdate(params));

      case 'escalate':
        // Legacy support
        return NextResponse.json(handleEscalate(params));

      case 'contain':
        // Legacy support
        return NextResponse.json(handleContain(params));

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
