// Compliance Error Handler Utilities
// Centralized error handling for compliance operations

import { NextResponse } from 'next/server';
import { ERROR_CODES, DEFAULT_ERROR_MESSAGES } from '../../constants';

/**
 * Handle and format compliance API errors
 */
export function handleComplianceError(error: unknown, operation?: string): NextResponse {
  console.error('Phantom Compliance API error:', error);
  
  let errorCode: keyof typeof ERROR_CODES = 'INTERNAL_ERROR';
  let errorMessage: string = DEFAULT_ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR];
  let statusCode = 500;
  
  if (error instanceof Error) {
    errorMessage = error.message;
    
    // Categorize specific error types
    if (error.message.includes('validation')) {
      errorCode = 'VALIDATION_ERROR';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR];
      statusCode = 400;
    } else if (error.message.includes('not found')) {
      errorCode = 'RESOURCE_NOT_FOUND';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.RESOURCE_NOT_FOUND];
      statusCode = 404;
    } else if (error.message.includes('timeout')) {
      errorCode = 'TIMEOUT_ERROR';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR];
      statusCode = 408;
    } else if (error.message.includes('permission')) {
      errorCode = 'PERMISSION_DENIED';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.PERMISSION_DENIED];
      statusCode = 403;
    }
  }
  
  return NextResponse.json({
    success: false,
    error: errorMessage,
    error_code: ERROR_CODES[errorCode],
    operation: operation || 'unknown',
    timestamp: new Date().toISOString()
  }, { status: statusCode });
}

/**
 * Handle unknown operation errors
 */
export function handleUnknownOperation(operation: string, context: 'GET' | 'POST'): NextResponse {
  const errorMessage = `Unknown compliance operation: ${operation}`;
  
  return NextResponse.json({
    success: false,
    error: errorMessage,
    error_code: ERROR_CODES.INVALID_INPUT,
    context,
    available_operations: context === 'GET' 
      ? ['status', 'health']
      : [
          'analyze-framework',
          'assess-status', 
          'conduct-audit',
          'generate-report',
          'analyze-metrics',
          'quick-analysis',
          'comprehensive-assessment'
        ],
    timestamp: new Date().toISOString()
  }, { status: 400 });
}

/**
 * Log compliance operation for debugging
 */
export function logComplianceOperation(operation: string, body?: any): void {
  console.log('Compliance API - Received operation:', operation);
  if (body) {
    console.log('Compliance API - Request body:', JSON.stringify(body, null, 2));
  }
}
