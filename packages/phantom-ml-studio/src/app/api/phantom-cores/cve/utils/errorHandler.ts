// CVE Error Handler Utilities
// Centralized error handling for CVE operations

import { NextResponse } from 'next/server';
import { ERROR_CODES, DEFAULT_ERROR_MESSAGES } from '../../constants';

/**
 * Handle and format CVE API errors
 */
export function handleCVEError(error: unknown, operation?: string): NextResponse {
  console.error('CVE API error:', error);
  
  let errorCode: keyof typeof ERROR_CODES = 'INTERNAL_ERROR';
  let errorMessage: string = DEFAULT_ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR];
  let statusCode = 500;
  
  if (error instanceof Error) {
    errorMessage = error.message;
    
    // Categorize specific error types for CVE operations
    if (error.message.includes('CVE') && error.message.includes('not found')) {
      errorCode = 'RESOURCE_NOT_FOUND';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.RESOURCE_NOT_FOUND];
      statusCode = 404;
    } else if (error.message.includes('validation') || error.message.includes('invalid CVE')) {
      errorCode = 'VALIDATION_ERROR';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR];
      statusCode = 400;
    } else if (error.message.includes('database') || error.message.includes('sync')) {
      errorCode = 'DATABASE_ERROR';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.DATABASE_ERROR];
      statusCode = 503;
    } else if (error.message.includes('timeout')) {
      errorCode = 'TIMEOUT_ERROR';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR];
      statusCode = 408;
    } else if (error.message.includes('rate limit')) {
      errorCode = 'RATE_LIMIT_EXCEEDED';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED];
      statusCode = 429;
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
export function handleUnknownCVEOperation(operation: string, context: 'GET' | 'POST'): NextResponse {
  const errorMessage = `Unknown CVE operation: ${operation}`;
  
  return NextResponse.json({
    success: false,
    error: errorMessage,
    error_code: ERROR_CODES.INVALID_INPUT,
    context,
    available_operations: context === 'GET' 
      ? ['status', 'analysis', 'recent', 'trending', 'assets']
      : [
          'search',
          'analyze-cve', 
          'track-vulnerability',
          'update-database',
          'generate-report',
          'analyze'
        ],
    timestamp: new Date().toISOString()
  }, { status: 400 });
}

/**
 * Log CVE operation for debugging
 */
export function logCVEOperation(operation: string, body?: any): void {
  console.log('CVE API - Received operation:', operation);
  if (body) {
    console.log('CVE API - Request body:', JSON.stringify(body, null, 2));
  }
}

/**
 * Validate CVE ID format
 */
export function validateCVEId(cveId: string): boolean {
  const cvePattern = /^CVE-\d{4}-\d{4,}$/;
  return cvePattern.test(cveId);
}

/**
 * Handle CVE validation errors
 */
export function handleCVEValidationError(field: string, value: any): NextResponse {
  let errorMessage = `Invalid ${field}: ${value}`;
  
  if (field === 'cve_id' && !validateCVEId(value)) {
    errorMessage = `Invalid CVE ID format. Expected format: CVE-YYYY-NNNN+ (e.g., CVE-2024-1234)`;
  }
  
  return NextResponse.json({
    success: false,
    error: errorMessage,
    error_code: ERROR_CODES.VALIDATION_ERROR,
    field,
    provided_value: value,
    timestamp: new Date().toISOString()
  }, { status: 400 });
}
