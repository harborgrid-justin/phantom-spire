// Phantom ML Core API Route - Machine Learning Security Analytics
// Provides REST endpoints for ML-powered security analytics and threat detection

import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, handleError } from './utils';
import {
  handleStatus,
  handleModels,
  handlePerformance,
  handleRunAnalysis,
  handleTrainModel,
  handleDetectAnomalies,
  handleGenerateMLReport
} from './handlers';

/**
 * GET /api/phantom-cores/ml - Get ML system status and operations
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'status';

    switch (operation) {
      case 'status':
        return NextResponse.json(handleStatus());

      case 'models':
        return NextResponse.json(handleModels());

      case 'performance':
        return NextResponse.json(handlePerformance());

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown ML operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}

/**
 * POST /api/phantom-cores/ml - Perform ML operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    switch (operation) {
      case 'run-analysis':
        return NextResponse.json(handleRunAnalysis(params));

      case 'train-model':
        return NextResponse.json(handleTrainModel(params));

      case 'detect-anomalies':
        return NextResponse.json(handleDetectAnomalies(params));

      case 'generate-ml-report':
        return NextResponse.json(handleGenerateMLReport(params));

      default:
        return NextResponse.json(
          createApiResponse(false, undefined, `Unknown ML operation: ${operation}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(handleError(error), { status: 500 });
  }
}
