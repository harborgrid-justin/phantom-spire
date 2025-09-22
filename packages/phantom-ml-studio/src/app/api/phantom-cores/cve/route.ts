// Phantom CVE Core API Route - Enterprise Vulnerability Management
// Provides REST endpoints for CVE vulnerability management and analysis
// Refactored to use modular handlers and leverage constants

import { NextRequest, NextResponse } from 'next/server';

// Import handlers
import { handleCVEStatus, handleCVETrending, handleCVEAssets } from './handlers/status';
import { 
  handleCVEAnalysis,
  handleRecentCVEs,
  handleCVESearch,
  handleDetailedCVEAnalysis,
  handleLegacyCVEAnalysis
} from './handlers/analysis';
import { 
  handleVulnerabilityTracking,
  handleDatabaseUpdate,
  handleReportGeneration
} from './handlers/management';

// Import utilities
import { 
  handleCVEError, 
  handleUnknownCVEOperation, 
  logCVEOperation,
  validateCVEId,
  handleCVEValidationError
} from './utils/errorHandler';

/**
 * GET /api/phantom-cores/cve - Get CVE system status and vulnerability data
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'status';

    logCVEOperation(operation);

    switch (operation) {
      case 'status':
        return await handleCVEStatus(request);

      case 'analysis':
        return await handleCVEAnalysis(request);

      case 'recent':
        return await handleRecentCVEs(request);

      case 'trending':
        return await handleCVETrending(request);

      case 'assets':
        return await handleCVEAssets(request);

      default:
        return handleUnknownCVEOperation(operation, 'GET');
    }
  } catch (error) {
    return handleCVEError(error, 'GET');
  }
}

/**
 * POST /api/phantom-cores/cve - Search CVEs or manage vulnerability data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    logCVEOperation(operation, body);

    switch (operation) {
      case 'search':
        return await handleCVESearch(body);

      case 'analyze-cve':
        // Validate CVE ID if provided
        if (body.analysisData?.cve_id && !validateCVEId(body.analysisData.cve_id)) {
          return handleCVEValidationError('cve_id', body.analysisData.cve_id);
        }
        return await handleDetailedCVEAnalysis(body);

      case 'track-vulnerability':
        return await handleVulnerabilityTracking(body);

      case 'update-database':
        return await handleDatabaseUpdate(body);

      case 'generate-report':
        return await handleReportGeneration(body);

      case 'analyze':
        // Legacy endpoint - validate CVE ID if provided
        if (body.cve_id && !validateCVEId(body.cve_id)) {
          return handleCVEValidationError('cve_id', body.cve_id);
        }
        return await handleLegacyCVEAnalysis(body);

      default:
        return handleUnknownCVEOperation(operation, 'POST');
    }
  } catch (error) {
    return handleCVEError(error, 'POST');
  }
}
