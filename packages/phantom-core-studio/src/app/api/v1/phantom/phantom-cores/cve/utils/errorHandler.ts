// CVE Error Handler Utilities
// Centralized error handling for CVE operations

import { NextResponse } from 'next/server';
import { ERROR_CODES, DEFAULT_ERROR_MESSAGES } from '../../constants/utils';
import { 
  buildErrorResponse,
  buildUnknownOperationResponse,
  buildValidationErrorResponse,
  logOperation,
  validateCVEId,
  getContextMessage,
  getSourceIdentifier
} from '../../messages/utils';
import { 
  AVAILABLE_OPERATIONS,
  CONTEXT_MESSAGES
} from '../../messages';

/**
 * Handle and format CVE API errors
 */
export function handleCVEError(error: unknown, operation?: string): NextResponse {
  return buildErrorResponse(
    error,
    operation || 'unknown',
    CONTEXT_MESSAGES.CVE_ANALYSIS,
    getSourceIdentifier('cve')
  );
}

/**
 * Handle unknown operation errors
 */
export function handleUnknownCVEOperation(operation: string, context: 'GET' | 'POST'): NextResponse {
  const moduleKey = context === 'GET' ? 'CVE_GET' : 'CVE_POST';
  return buildUnknownOperationResponse(
    operation,
    context,
    moduleKey as keyof typeof AVAILABLE_OPERATIONS,
    CONTEXT_MESSAGES.CVE_ANALYSIS
  );
}

/**
 * Log CVE operation for debugging
 */
export function logCVEOperation(operation: string, body?: any): void {
  logOperation('CVE', operation, body);
}

/**
 * Handle CVE validation errors
 */
export function handleCVEValidationError(field: string, value: any): NextResponse {
  const validation = validateCVEId(value);
  return buildValidationErrorResponse(
    field,
    value,
    validation.error,
    validation.error ? [validation.error] : undefined
  );
}
