// Risk Error Handler Utilities
// Centralized error handling for risk management operations

import { NextResponse } from 'next/server';
import { ERROR_CODES, DEFAULT_ERROR_MESSAGES } from '../../../../../../../constants';
import { DEFAULT_CONFIG, HTTP_STATUS_CODES } from '../../../../../../../configs';
import { 
  buildErrorResponse,
  buildUnknownOperationResponse,
  buildValidationErrorResponse,
  buildExternalServiceErrorResponse,
  buildInsufficientDataErrorResponse,
  logOperation,
  validateRiskScore,
  validateRiskTolerance,
  validateTimePeriod,
  validateProbability,
  validateImpactLevel,
  getContextMessage,
  getSourceIdentifier
} from '../../messages/utils';
import { 
  ERROR_MESSAGES,
  VALIDATION_MESSAGES,
  AVAILABLE_OPERATIONS,
  CONTEXT_MESSAGES
} from '../../messages';

/**
 * Handle and format Risk API errors
 */
export function handleRiskError(error: unknown, operation?: string): NextResponse {
  return buildErrorResponse(
    error,
    operation || 'unknown',
    CONTEXT_MESSAGES.RISK_MANAGEMENT,
    getSourceIdentifier('risk')
  );
}

/**
 * Handle unknown risk operation errors
 */
export function handleUnknownRiskOperation(operation: string, context: 'GET' | 'POST'): NextResponse {
  const moduleKey = context === 'GET' ? 'RISK_GET' : 'RISK_POST';
  return buildUnknownOperationResponse(
    operation,
    context,
    moduleKey as keyof typeof AVAILABLE_OPERATIONS,
    CONTEXT_MESSAGES.RISK_MANAGEMENT
  );
}

/**
 * Log risk operation for debugging
 */
export function logRiskOperation(operation: string, body?: any): void {
  logOperation('Risk', operation, body);
}

/**
 * Validate risk score range
 */
export function isValidRiskScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 100;
}

/**
 * Validate risk assessment data
 */
export function validateRiskAssessmentData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (data.risk_score && !isValidRiskScore(data.risk_score)) {
    errors.push('Risk score must be a number between 0 and 100');
  }
  
  if (data.probability && (typeof data.probability !== 'number' || data.probability < 0 || data.probability > 1)) {
    errors.push('Probability must be a number between 0 and 1');
  }
  
  if (data.impact && !['low', 'medium', 'high', 'critical'].includes(data.impact.toLowerCase())) {
    errors.push('Impact must be one of: low, medium, high, critical');
  }
  
  if (data.category && typeof data.category !== 'string') {
    errors.push('Category must be a valid string');
  }
  
  if (data.timeline && typeof data.timeline !== 'string') {
    errors.push('Timeline must be a valid string');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Handle risk assessment validation errors
 */
export function handleRiskValidationError(field: string, value: any, errors?: string[]): NextResponse {
  let errorMessage = `Invalid ${field}: ${value}`;
  
  if (errors && errors.length > 0) {
    errorMessage = errors.join('; ');
  } else if (field === 'risk_score' && !isValidRiskScore(value)) {
    errorMessage = `Invalid risk score. Expected a number between 0 and 100, got: ${value}`;
  }
  
  return NextResponse.json({
    success: false,
    error: errorMessage,
    error_code: ERROR_CODES.VALIDATION_ERROR,
    field,
    provided_value: value,
    validation_errors: errors || [],
    timestamp: new Date().toISOString()
  }, { status: HTTP_STATUS_CODES.BAD_REQUEST });
}

/**
 * Validate risk tolerance level
 */
export function isValidRiskTolerance(tolerance: string): boolean {
  const validTolerances = ['low', 'moderate', 'high', 'conservative', 'aggressive'];
  return validTolerances.includes(tolerance.toLowerCase());
}

/**
 * Validate assessment type
 */
export function isValidAssessmentType(type: string): boolean {
  const validTypes = [
    'operational', 'financial', 'strategic', 'compliance', 
    'cybersecurity', 'reputational', 'legal', 'technology',
    'market', 'credit', 'liquidity', 'environmental'
  ];
  return validTypes.includes(type.toLowerCase());
}

/**
 * Validate time period for analysis
 */
export function isValidTimePeriod(period: string): boolean {
  const validPeriods = [
    '1_month', '3_months', '6_months', '12_months', 
    '24_months', 'ytd', 'quarterly', 'annual'
  ];
  return validPeriods.includes(period.toLowerCase());
}

/**
 * Handle configuration errors
 */
export function handleRiskConfigurationError(configType: string, details: string): NextResponse {
  const errorMessage = `Risk management configuration error in ${configType}: ${details}`;
  
  return NextResponse.json({
    success: false,
    error: errorMessage,
    error_code: ERROR_CODES.CONFIGURATION_ERROR,
    configuration_type: configType,
    details,
    timestamp: new Date().toISOString()
  }, { status: 500 });
}

/**
 * Handle external service errors (e.g., risk calculation services)
 */
export function handleExternalServiceError(serviceName: string, error: unknown): NextResponse {
  const errorMessage = `External risk service '${serviceName}' is currently unavailable`;
  
  console.error(`External service error for ${serviceName}:`, error);
  
  return NextResponse.json({
    success: false,
    error: errorMessage,
    error_code: ERROR_CODES.EXTERNAL_SERVICE_ERROR,
    service: serviceName,
    timestamp: new Date().toISOString(),
    retry_after: '300' // Suggest retry after 5 minutes
  }, { 
    status: 503,
    headers: {
      'Retry-After': '300'
    }
  });
}

/**
 * Handle insufficient data errors for risk analysis
 */
export function handleInsufficientDataError(dataType: string, required: string[]): NextResponse {
  const errorMessage = `Insufficient data for ${dataType} analysis. Required fields: ${required.join(', ')}`;
  
  return NextResponse.json({
    success: false,
    error: errorMessage,
    error_code: ERROR_CODES.VALIDATION_ERROR,
    data_type: dataType,
    required_fields: required,
    timestamp: new Date().toISOString()
  }, { status: 400 });
}

/**
 * Create standardized risk operation response
 */
export function createRiskResponse(data: any, operation: string, success: boolean = true): NextResponse {
  const response = {
    success,
    data: success ? data : undefined,
    error: success ? undefined : data,
    operation,
    source: 'phantom-risk-core',
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(response, { status: success ? 200 : 400 });
}
