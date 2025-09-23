// Phantom Risk Core API Route - Enterprise Risk Management
// Provides REST endpoints for risk assessment and management
// Refactored to use modular handlers and leverage constants

import { NextRequest, NextResponse } from 'next/server';

// Import handlers
import { 
  handleRiskStatus, 
  handleRiskMetrics, 
  handleAssessments, 
  handleMitigationStatus 
} from './handlers/status';
import { 
  handleRiskAssessment,
  handleTrendAnalysis,
  handleMitigationGeneration,
  handleGovernanceReview
} from './handlers/analysis';

// Import utilities
import { 
  handleRiskError, 
  handleUnknownRiskOperation, 
  logRiskOperation,
  validateRiskAssessmentData,
  handleRiskValidationError,
  isValidRiskTolerance,
  isValidTimePeriod
} from './utils/errorHandler';

/**
 * GET /api/phantom-cores/risk - Get risk system status and operations
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'status';

    logRiskOperation(operation);

    switch (operation) {
      case 'status':
        return await handleRiskStatus(request);

      case 'risk-metrics':
        return await handleRiskMetrics(request);

      case 'assessments':
        return await handleAssessments(request);

      case 'mitigation':
        return await handleMitigationStatus(request);

      default:
        return handleUnknownRiskOperation(operation, 'GET');
    }
  } catch (error) {
    return handleRiskError(error, 'GET');
  }
}

/**
 * POST /api/phantom-cores/risk - Perform risk operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    logRiskOperation(operation, body);

    switch (operation) {
      case 'assess-risks':
        // Validate assessment data if provided
        if (body.assessmentData) {
          const validation = validateRiskAssessmentData(body.assessmentData);
          if (!validation.isValid) {
            return handleRiskValidationError('assessmentData', body.assessmentData, validation.errors);
          }
        }
        return await handleRiskAssessment(body);

      case 'analyze-trends':
        // Validate time period if provided
        if (body.analysisData?.analysis_period && !isValidTimePeriod(body.analysisData.analysis_period)) {
          return handleRiskValidationError('analysis_period', body.analysisData.analysis_period);
        }
        return await handleTrendAnalysis(body);

      case 'generate-mitigation':
        // Validate risk tolerance if provided
        if (body.mitigationData?.risk_tolerance && !isValidRiskTolerance(body.mitigationData.risk_tolerance)) {
          return handleRiskValidationError('risk_tolerance', body.mitigationData.risk_tolerance);
        }
        return await handleMitigationGeneration(body);

      case 'governance-review':
        return await handleGovernanceReview(body);

      default:
        return handleUnknownRiskOperation(operation, 'POST');
    }
  } catch (error) {
    return handleRiskError(error, 'POST');
  }
}
