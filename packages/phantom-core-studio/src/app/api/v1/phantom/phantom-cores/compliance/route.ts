// Phantom Compliance Core API Route - Enterprise Compliance Management
// Provides REST endpoints for comprehensive compliance and regulatory capabilities
// Refactored to use modular handlers and leverage constants

import { NextRequest, NextResponse } from 'next/server';

// Import handlers
import { handleComplianceStatus, handleComplianceHealth } from './handlers/status';
import { 
  handleFrameworkAnalysis,
  handleStatusAssessment,
  handleMetricsAnalysis,
  handleQuickAnalysis,
  handleComprehensiveAssessment
} from './handlers/analysis';
import { handleComplianceAudit, handleReportGeneration } from './handlers/audit';

// Import utilities
import { 
  handleComplianceError, 
  handleUnknownOperation, 
  logComplianceOperation 
} from './utils/errorHandler';

/**
 * GET /api/phantom-cores/compliance - Get compliance system status and operations
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'status';
    
    logComplianceOperation(operation);

    switch (operation) {
      case 'status':
        return await handleComplianceStatus(request);
        
      case 'health':
        return await handleComplianceHealth(request);

      default:
        return handleUnknownOperation(operation, 'GET');
    }
  } catch (error) {
    return handleComplianceError(error, 'GET');
  }
}

/**
 * POST /api/phantom-cores/compliance - Perform compliance operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    logComplianceOperation(operation, body);

    switch (operation) {
      case 'analyze-framework':
        return await handleFrameworkAnalysis(body);

      case 'assess-status':
        return await handleStatusAssessment(body);

      case 'conduct-audit':
        return await handleComplianceAudit(body);

      case 'generate-report':
        return await handleReportGeneration(body);

      case 'analyze-metrics':
        return await handleMetricsAnalysis(body);

      case 'quick-analysis':
        return await handleQuickAnalysis(body);

      case 'comprehensive-assessment':
        return await handleComprehensiveAssessment(body);

      default:
        return handleUnknownOperation(operation, 'POST');
    }
  } catch (error) {
    return handleComplianceError(error, 'POST');
  }
}
