// Compliance Error Handler Utilities
// Centralized error handling for compliance operations

import { NextResponse } from 'next/server';
import { ERROR_CODES, DEFAULT_ERROR_MESSAGES } from '..\..\..\..\..\..\..\constants';
import { 
  buildErrorResponse,
  buildUnknownOperationResponse,
  logOperation,
  getContextMessage,
  getSourceIdentifier
} from '../../messages/utils';
import { 
  AVAILABLE_OPERATIONS,
  CONTEXT_MESSAGES
} from '../../messages';

/**
 * Handle and format compliance API errors
 */
export function handleComplianceError(error: unknown, operation?: string): NextResponse {
  return buildErrorResponse(
    error,
    operation || 'unknown',
    CONTEXT_MESSAGES.COMPLIANCE,
    getSourceIdentifier('compliance')
  );
}

/**
 * Handle unknown operation errors
 */
export function handleUnknownOperation(operation: string, context: 'GET' | 'POST'): NextResponse {
  const moduleKey = context === 'GET' ? 'COMPLIANCE_GET' : 'COMPLIANCE_POST';
  return buildUnknownOperationResponse(
    operation,
    context,
    moduleKey as keyof typeof AVAILABLE_OPERATIONS,
    CONTEXT_MESSAGES.COMPLIANCE
  );
}

/**
 * Log compliance operation for debugging
 */
export function logComplianceOperation(operation: string, body?: any): void {
  logOperation('Compliance', operation, body);
}
