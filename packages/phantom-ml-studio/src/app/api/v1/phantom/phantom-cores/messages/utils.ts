// Message Utilities - Helper functions for message formatting and generation
// Dynamic message generation, response builders, and logging utilities

import { NextResponse } from 'next/server';
import { 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES, 
  LOG_MESSAGES, 
  VALIDATION_MESSAGES,
  STATUS_MESSAGES,
  RESPONSE_TEMPLATES,
  CONTEXT_MESSAGES,
  AVAILABLE_OPERATIONS,
  SOURCE_IDENTIFIERS,
  type ContextMessage,
  type SourceIdentifier
} from './index';
import { ERROR_CODES, DEFAULT_ERROR_MESSAGES } from '..\..\..\..\..\..\lib\constants';

// ================================
// ERROR RESPONSE BUILDERS
// ================================

/**
 * Build standardized error response
 */
export function buildErrorResponse(
  error: unknown,
  operation: string,
  context: ContextMessage,
  source?: SourceIdentifier
): NextResponse {
  console.error(LOG_MESSAGES.OPERATION_ERROR(context, error));
  
  let errorCode: keyof typeof ERROR_CODES = 'INTERNAL_ERROR';
  let errorMessage: string = DEFAULT_ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR];
  let statusCode = 500;
  
  if (error instanceof Error) {
    errorMessage = error.message;
    
    // Categorize error types based on message content
    if (error.message.includes('not found')) {
      errorCode = 'RESOURCE_NOT_FOUND';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.RESOURCE_NOT_FOUND];
      statusCode = 404;
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      errorCode = 'VALIDATION_ERROR';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR];
      statusCode = 400;
    } else if (error.message.includes('timeout')) {
      errorCode = 'TIMEOUT_ERROR';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR];
      statusCode = 408;
    } else if (error.message.includes('rate limit')) {
      errorCode = 'RATE_LIMIT_EXCEEDED';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED];
      statusCode = 429;
    } else if (error.message.includes('permission') || error.message.includes('access denied')) {
      errorCode = 'AUTHORIZATION_ERROR';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.AUTHORIZATION_ERROR];
      statusCode = 403;
    } else if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
      errorCode = 'AUTHENTICATION_ERROR';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.AUTHENTICATION_ERROR];
      statusCode = 401;
    } else if (error.message.includes('database') || error.message.includes('sync')) {
      errorCode = 'DATABASE_ERROR';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.DATABASE_ERROR];
      statusCode = 503;
    } else if (error.message.includes('external service') || error.message.includes('service unavailable')) {
      errorCode = 'EXTERNAL_SERVICE_ERROR';
      errorMessage = DEFAULT_ERROR_MESSAGES[ERROR_CODES.EXTERNAL_SERVICE_ERROR];
      statusCode = 503;
    }
  }
  
  const responseBody = {
    success: false,
    error: errorMessage,
    error_code: ERROR_CODES[errorCode],
    operation,
    context,
    source,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(responseBody, { status: statusCode });
}

/**
 * Build unknown operation error response
 */
export function buildUnknownOperationResponse(
  operation: string,
  context: 'GET' | 'POST',
  module: keyof typeof AVAILABLE_OPERATIONS,
  apiContext: ContextMessage
): NextResponse {
  const availableOps = context === 'GET' 
    ? AVAILABLE_OPERATIONS[`${module}_GET` as keyof typeof AVAILABLE_OPERATIONS] || AVAILABLE_OPERATIONS.COMMON_GET
    : AVAILABLE_OPERATIONS[`${module}_POST` as keyof typeof AVAILABLE_OPERATIONS] || AVAILABLE_OPERATIONS.COMMON_POST;
  
  const errorMessage = ERROR_MESSAGES.UNKNOWN_OPERATION(operation, apiContext);
  
  return NextResponse.json({
    success: false,
    error: errorMessage,
    error_code: ERROR_CODES.INVALID_INPUT,
    context: context.toLowerCase(),
    available_operations: availableOps,
    timestamp: new Date().toISOString()
  }, { status: 400 });
}

/**
 * Build validation error response
 */
export function buildValidationErrorResponse(
  field: string,
  value: any,
  validationMessage?: string,
  errors?: string[]
): NextResponse {
  let errorMessage = validationMessage || ERROR_MESSAGES.INVALID_INPUT(field, value);
  
  if (errors && errors.length > 0) {
    errorMessage = errors.join('; ');
  }
  
  return NextResponse.json({
    success: false,
    error: errorMessage,
    error_code: ERROR_CODES.VALIDATION_ERROR,
    field,
    provided_value: value,
    validation_errors: errors || [errorMessage],
    timestamp: new Date().toISOString()
  }, { status: 400 });
}

/**
 * Build external service error response
 */
export function buildExternalServiceErrorResponse(
  serviceName: string,
  error: unknown,
  retryAfter: number = 300
): NextResponse {
  console.error(LOG_MESSAGES.EXTERNAL_SERVICE_ERROR(serviceName, error));
  
  const errorMessage = ERROR_MESSAGES.EXTERNAL_SERVICE_UNAVAILABLE(serviceName);
  
  return NextResponse.json({
    success: false,
    error: errorMessage,
    error_code: ERROR_CODES.EXTERNAL_SERVICE_ERROR,
    service: serviceName,
    timestamp: new Date().toISOString(),
    retry_after: retryAfter.toString()
  }, { 
    status: 503,
    headers: {
      'Retry-After': retryAfter.toString()
    }
  });
}

/**
 * Build insufficient data error response
 */
export function buildInsufficientDataErrorResponse(
  dataType: string,
  required: string[]
): NextResponse {
  const errorMessage = ERROR_MESSAGES.INSUFFICIENT_DATA(dataType, required);
  
  return NextResponse.json({
    success: false,
    error: errorMessage,
    error_code: ERROR_CODES.VALIDATION_ERROR,
    data_type: dataType,
    required_fields: required,
    timestamp: new Date().toISOString()
  }, { status: 400 });
}

// ================================
// SUCCESS RESPONSE BUILDERS
// ================================

/**
 * Build standardized success response
 */
export function buildSuccessResponse<T>(
  data: T,
  operation: string,
  source?: SourceIdentifier,
  successMessage?: string
): NextResponse {
  const responseBody = {
    success: true,
    data,
    message: successMessage,
    operation,
    source,
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(responseBody);
}

/**
 * Build paginated response
 */
export function buildPaginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  operation: string,
  source?: SourceIdentifier
): NextResponse {
  const responseBody = RESPONSE_TEMPLATES.PAGINATED(data, page, pageSize, total);
  
  return NextResponse.json({
    ...responseBody,
    operation,
    source
  });
}

/**
 * Build status response
 */
export function buildStatusResponse(
  status: string,
  details: any,
  source?: SourceIdentifier
): NextResponse {
  const responseBody = RESPONSE_TEMPLATES.STATUS(status, details);
  
  return NextResponse.json({
    ...responseBody,
    source
  });
}

// ================================
// LOGGING UTILITIES
// ================================

/**
 * Log API operation
 */
export function logOperation(
  apiName: string,
  operation: string,
  body?: any,
  duration?: number
): void {
  console.log(LOG_MESSAGES.RECEIVED_OPERATION(apiName, operation));
  
  if (body) {
    console.log(LOG_MESSAGES.REQUEST_BODY(apiName, body));
  }
  
  if (duration !== undefined) {
    console.log(LOG_MESSAGES.OPERATION_DURATION(operation, duration));
  }
}

/**
 * Log cache operations
 */
export function logCacheOperation(key: string, hit: boolean): void {
  if (hit) {
    console.log(LOG_MESSAGES.CACHE_HIT(key));
  } else {
    console.log(LOG_MESSAGES.CACHE_MISS(key));
  }
}

// ================================
// VALIDATION UTILITIES
// ================================

/**
 * Validate field with custom message
 */
export function validateField(
  field: string,
  value: any,
  validator: (val: any) => boolean,
  customMessage?: string
): { isValid: boolean; error?: string } {
  if (!validator(value)) {
    return {
      isValid: false,
      error: customMessage || ERROR_MESSAGES.INVALID_INPUT(field, value)
    };
  }
  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(field: string, value: any): { isValid: boolean; error?: string } {
  if (value === undefined || value === null || value === '') {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.FIELD_REQUIRED(field)
    };
  }
  return { isValid: true };
}

/**
 * Validate field type
 */
export function validateType(
  field: string,
  value: any,
  expectedType: string
): { isValid: boolean; error?: string } {
  const actualType = typeof value;
  if (actualType !== expectedType) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.FIELD_INVALID_TYPE(field, expectedType, actualType)
    };
  }
  return { isValid: true };
}

/**
 * Validate numeric range
 */
export function validateRange(
  field: string,
  value: number,
  min: number,
  max: number
): { isValid: boolean; error?: string } {
  if (value < min || value > max) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.FIELD_OUT_OF_RANGE(field, min, max, value)
    };
  }
  return { isValid: true };
}

/**
 * Validate enum value
 */
export function validateEnum(
  field: string,
  value: string,
  validValues: string[]
): { isValid: boolean; error?: string } {
  if (!validValues.includes(value)) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.FIELD_INVALID_ENUM(field, validValues, value)
    };
  }
  return { isValid: true };
}

// ================================
// RISK-SPECIFIC UTILITIES
// ================================

/**
 * Validate risk score
 */
export function validateRiskScore(score: number): { isValid: boolean; error?: string } {
  return validateRange('risk_score', score, 0, 100);
}

/**
 * Validate probability
 */
export function validateProbability(probability: number): { isValid: boolean; error?: string } {
  return validateRange('probability', probability, 0, 1);
}

/**
 * Validate risk tolerance
 */
export function validateRiskTolerance(tolerance: string): { isValid: boolean; error?: string } {
  const validTolerances = ['low', 'moderate', 'high', 'conservative', 'aggressive'];
  return validateEnum('risk_tolerance', tolerance.toLowerCase(), validTolerances);
}

/**
 * Validate impact level
 */
export function validateImpactLevel(impact: string): { isValid: boolean; error?: string } {
  const validImpacts = ['low', 'medium', 'high', 'critical'];
  return validateEnum('impact', impact.toLowerCase(), validImpacts);
}

/**
 * Validate time period
 */
export function validateTimePeriod(period: string): { isValid: boolean; error?: string } {
  const validPeriods = [
    '1_month', '3_months', '6_months', '12_months', 
    '24_months', 'ytd', 'quarterly', 'annual'
  ];
  return validateEnum('time_period', period.toLowerCase(), validPeriods);
}

// ================================
// CVE-SPECIFIC UTILITIES
// ================================

/**
 * Validate CVE ID format
 */
export function validateCVEId(cveId: string): { isValid: boolean; error?: string } {
  const cvePattern = /^CVE-\d{4}-\d{4,}$/;
  if (!cvePattern.test(cveId)) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.CVE_FORMAT
    };
  }
  return { isValid: true };
}

// ================================
// MESSAGE FORMATTERS
// ================================

/**
 * Format success message with context
 */
export function formatSuccessMessage(operation: string, context?: string): string {
  return context 
    ? SUCCESS_MESSAGES.OPERATION_COMPLETED(`${context} ${operation}`)
    : SUCCESS_MESSAGES.OPERATION_COMPLETED(operation);
}

/**
 * Format data retrieval message
 */
export function formatDataRetrievalMessage(type: string, count?: number): string {
  return SUCCESS_MESSAGES.DATA_RETRIEVED(type, count);
}

/**
 * Format analysis completion message
 */
export function formatAnalysisMessage(analysisType: string): string {
  return SUCCESS_MESSAGES.ANALYSIS_COMPLETED(analysisType);
}

// ================================
// PERFORMANCE UTILITIES
// ================================

/**
 * Create operation timer
 */
export function createTimer(operation: string) {
  const startTime = Date.now();
  
  return {
    end: () => {
      const duration = Date.now() - startTime;
      console.log(LOG_MESSAGES.OPERATION_DURATION(operation, duration));
      return duration;
    }
  };
}

// ================================
// RESPONSE HELPERS
// ================================

/**
 * Create standardized API response
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  operation?: string,
  source?: SourceIdentifier,
  statusCode: number = success ? 200 : 500
): NextResponse {
  const responseBody = {
    success,
    ...(success ? { data } : { error }),
    operation,
    source,
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(responseBody, { status: statusCode });
}

/**
 * Get module-specific source identifier
 */
export function getSourceIdentifier(module: string): SourceIdentifier {
  const moduleMap: Record<string, SourceIdentifier> = {
    'risk': SOURCE_IDENTIFIERS.PHANTOM_RISK_CORE,
    'compliance': SOURCE_IDENTIFIERS.PHANTOM_COMPLIANCE,
    'cve': SOURCE_IDENTIFIERS.PHANTOM_CVE,
    'intel': SOURCE_IDENTIFIERS.PHANTOM_THREAT_INTEL,
    'incident-response': SOURCE_IDENTIFIERS.PHANTOM_INCIDENT,
    'forensics': SOURCE_IDENTIFIERS.PHANTOM_FORENSICS,
    'hunting': SOURCE_IDENTIFIERS.PHANTOM_HUNTING,
    'ioc': SOURCE_IDENTIFIERS.PHANTOM_IOC,
    'mitre': SOURCE_IDENTIFIERS.PHANTOM_MITRE,
    'ml': SOURCE_IDENTIFIERS.PHANTOM_ML,
    'reputation': SOURCE_IDENTIFIERS.PHANTOM_REPUTATION,
    'sandbox': SOURCE_IDENTIFIERS.PHANTOM_SANDBOX,
    'threat-actor': SOURCE_IDENTIFIERS.PHANTOM_THREAT_ACTOR,
    'xdr': SOURCE_IDENTIFIERS.PHANTOM_XDR
  };
  
  return moduleMap[module] || SOURCE_IDENTIFIERS.PHANTOM_RISK_CORE;
}

/**
 * Get context message for module
 */
export function getContextMessage(module: string): ContextMessage {
  const contextMap: Record<string, ContextMessage> = {
    'risk': CONTEXT_MESSAGES.RISK_MANAGEMENT,
    'compliance': CONTEXT_MESSAGES.COMPLIANCE,
    'cve': CONTEXT_MESSAGES.CVE_ANALYSIS,
    'intel': CONTEXT_MESSAGES.THREAT_INTELLIGENCE,
    'incident-response': CONTEXT_MESSAGES.INCIDENT_RESPONSE,
    'forensics': CONTEXT_MESSAGES.FORENSICS,
    'hunting': CONTEXT_MESSAGES.HUNTING,
    'ioc': CONTEXT_MESSAGES.IOC_ANALYSIS,
    'mitre': CONTEXT_MESSAGES.MITRE_MAPPING,
    'ml': CONTEXT_MESSAGES.ML_ANALYSIS,
    'reputation': CONTEXT_MESSAGES.REPUTATION_CHECK,
    'sandbox': CONTEXT_MESSAGES.SANDBOX_ANALYSIS,
    'threat-actor': CONTEXT_MESSAGES.THREAT_ACTOR,
    'xdr': CONTEXT_MESSAGES.XDR_INTEGRATION
  };
  
  return contextMap[module] || CONTEXT_MESSAGES.ANALYSIS;
}
