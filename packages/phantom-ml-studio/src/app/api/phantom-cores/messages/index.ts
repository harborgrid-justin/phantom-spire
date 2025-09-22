// Phantom Cores Messages - Centralized Message Management
// All user-facing messages, error descriptions, and API responses

// ================================
// ERROR MESSAGES
// ================================

export const ERROR_MESSAGES = {
  // General errors
  UNKNOWN_OPERATION: (operation: string, context: string) => 
    `Unknown ${context} operation: ${operation}`,
  
  INVALID_INPUT: (field: string, value: any) => 
    `Invalid ${field}: ${value}`,
    
  VALIDATION_FAILED: (field: string, reason: string) => 
    `Validation failed for ${field}: ${reason}`,
    
  // Risk-specific errors
  RISK_ASSESSMENT_NOT_FOUND: (id: string) => 
    `Risk assessment with ID ${id} not found`,
    
  INVALID_RISK_SCORE: (score: number) => 
    `Invalid risk score. Expected a number between 0 and 100, got: ${score}`,
    
  INVALID_RISK_TOLERANCE: (tolerance: string) => 
    `Invalid risk tolerance '${tolerance}'. Must be one of: low, moderate, high, conservative, aggressive`,
    
  // CVE-specific errors
  CVE_NOT_FOUND: (cveId: string) => 
    `CVE ${cveId} not found in database`,
    
  INVALID_CVE_FORMAT: (cveId: string) => 
    `Invalid CVE ID format '${cveId}'. Expected format: CVE-YYYY-NNNN+ (e.g., CVE-2024-1234)`,
    
  // Service errors
  EXTERNAL_SERVICE_UNAVAILABLE: (serviceName: string) => 
    `External service '${serviceName}' is currently unavailable`,
    
  DATABASE_SYNC_ERROR: (operation: string) => 
    `Database synchronization failed for ${operation}`,
    
  // Configuration errors
  CONFIGURATION_ERROR: (configType: string, details: string) => 
    `Configuration error in ${configType}: ${details}`,
    
  INSUFFICIENT_DATA: (dataType: string, required: string[]) => 
    `Insufficient data for ${dataType} analysis. Required fields: ${required.join(', ')}`
} as const;

// ================================
// SUCCESS MESSAGES
// ================================

export const SUCCESS_MESSAGES = {
  // Operation completions
  OPERATION_COMPLETED: (operation: string) => 
    `${operation} operation completed successfully`,
    
  DATA_RETRIEVED: (type: string, count?: number) => 
    count ? `Retrieved ${count} ${type} records` : `${type} data retrieved successfully`,
    
  ANALYSIS_COMPLETED: (analysisType: string) => 
    `${analysisType} analysis completed successfully`,
    
  // Risk operations
  RISK_ASSESSMENT_GENERATED: (id: string) => 
    `Risk assessment ${id} generated successfully`,
    
  MITIGATION_PLAN_CREATED: (id: string) => 
    `Mitigation plan ${id} created successfully`,
    
  // CVE operations
  CVE_ANALYSIS_COMPLETED: (cveId: string) => 
    `Analysis for ${cveId} completed successfully`,
    
  DATABASE_UPDATED: (recordCount: number) => 
    `Database updated with ${recordCount} new records`,
    
  // General confirmations
  STATUS_RETRIEVED: 'System status retrieved successfully',
  HEALTH_CHECK_PASSED: 'All health checks passed',
  METRICS_CALCULATED: 'Metrics calculated successfully'
} as const;

// ================================
// LOG MESSAGES
// ================================

export const LOG_MESSAGES = {
  // API operations
  RECEIVED_OPERATION: (api: string, operation: string) => 
    `${api} API - Received operation: ${operation}`,
    
  REQUEST_BODY: (api: string, body: any) => 
    `${api} API - Request body: ${JSON.stringify(body, null, 2)}`,
    
  OPERATION_ERROR: (api: string, error: unknown) => 
    `${api} API error: ${error}`,
    
  EXTERNAL_SERVICE_ERROR: (serviceName: string, error: unknown) => 
    `External service error for ${serviceName}: ${error}`,
    
  // Performance tracking
  OPERATION_DURATION: (operation: string, duration: number) => 
    `Operation ${operation} completed in ${duration}ms`,
    
  CACHE_HIT: (key: string) => 
    `Cache hit for key: ${key}`,
    
  CACHE_MISS: (key: string) => 
    `Cache miss for key: ${key}`
} as const;

// ================================
// VALIDATION MESSAGES
// ================================

export const VALIDATION_MESSAGES = {
  // Field validation
  FIELD_REQUIRED: (field: string) => 
    `${field} is required`,
    
  FIELD_INVALID_TYPE: (field: string, expectedType: string, actualType: string) => 
    `${field} must be of type ${expectedType}, got ${actualType}`,
    
  FIELD_OUT_OF_RANGE: (field: string, min: number, max: number, value: number) => 
    `${field} must be between ${min} and ${max}, got ${value}`,
    
  FIELD_INVALID_FORMAT: (field: string, format: string) => 
    `${field} must match format: ${format}`,
    
  FIELD_INVALID_ENUM: (field: string, validValues: string[], value: string) => 
    `${field} must be one of [${validValues.join(', ')}], got '${value}'`,
    
  // Risk-specific validation
  RISK_SCORE_RANGE: 'Risk score must be a number between 0 and 100',
  PROBABILITY_RANGE: 'Probability must be a number between 0 and 1',
  IMPACT_LEVELS: 'Impact must be one of: low, medium, high, critical',
  
  // Time validation
  INVALID_TIME_PERIOD: (period: string, validPeriods: string[]) => 
    `Invalid time period '${period}'. Valid periods: ${validPeriods.join(', ')}`,
    
  // CVE validation
  CVE_FORMAT: 'CVE ID must follow format CVE-YYYY-NNNN (e.g., CVE-2024-1234)'
} as const;

// ================================
// STATUS MESSAGES
// ================================

export const STATUS_MESSAGES = {
  // System status
  SYSTEM_OPERATIONAL: 'System is operational',
  SYSTEM_DEGRADED: 'System performance is degraded',
  SYSTEM_DOWN: 'System is currently down',
  
  // Component status
  COMPONENT_ONLINE: (component: string) => 
    `${component} component is online`,
    
  COMPONENT_OFFLINE: (component: string) => 
    `${component} component is offline`,
    
  COMPONENT_DEGRADED: (component: string) => 
    `${component} component performance is degraded`,
    
  // Service status
  SERVICE_HEALTHY: (service: string) => 
    `${service} service is healthy`,
    
  SERVICE_UNHEALTHY: (service: string) => 
    `${service} service is unhealthy`,
    
  DATABASE_CONNECTED: 'Database connection established',
  DATABASE_DISCONNECTED: 'Database connection lost',
  
  // API status
  API_READY: (apiName: string) => 
    `${apiName} API is ready to accept requests`,
    
  RATE_LIMIT_WARNING: (remaining: number, resetTime: string) => 
    `Rate limit approaching. ${remaining} requests remaining. Resets at ${resetTime}`
} as const;

// ================================
// RESPONSE TEMPLATES
// ================================

export const RESPONSE_TEMPLATES = {
  // Standard success response
  SUCCESS: <T>(data: T, operation: string) => ({
    success: true,
    data,
    operation,
    timestamp: new Date().toISOString()
  }),
  
  // Standard error response
  ERROR: (error: string, errorCode: string, operation: string, statusCode = 500) => ({
    success: false,
    error,
    error_code: errorCode,
    operation,
    timestamp: new Date().toISOString(),
    status_code: statusCode
  }),
  
  // Paginated response
  PAGINATED: <T>(data: T[], page: number, pageSize: number, total: number) => ({
    success: true,
    data,
    pagination: {
      page,
      page_size: pageSize,
      total_items: total,
      total_pages: Math.ceil(total / pageSize),
      has_next: page * pageSize < total,
      has_previous: page > 1
    },
    timestamp: new Date().toISOString()
  }),
  
  // Status response
  STATUS: (status: string, details: any) => ({
    success: true,
    status,
    details,
    timestamp: new Date().toISOString()
  }),
  
  // Validation error response
  VALIDATION_ERROR: (field: string, message: string, value?: any) => ({
    success: false,
    error: 'Validation failed',
    error_code: 'VALIDATION_ERROR',
    validation_errors: [{
      field,
      message,
      provided_value: value
    }],
    timestamp: new Date().toISOString()
  })
} as const;

// ================================
// CONTEXT MESSAGES
// ================================

export const CONTEXT_MESSAGES = {
  // API contexts
  RISK_MANAGEMENT: 'risk-management',
  COMPLIANCE: 'compliance',
  CVE_ANALYSIS: 'cve-analysis',
  THREAT_INTELLIGENCE: 'threat-intelligence',
  INCIDENT_RESPONSE: 'incident-response',
  FORENSICS: 'forensics',
  HUNTING: 'hunting',
  IOC_ANALYSIS: 'ioc-analysis',
  MITRE_MAPPING: 'mitre-mapping',
  ML_ANALYSIS: 'ml-analysis',
  REPUTATION_CHECK: 'reputation-check',
  SANDBOX_ANALYSIS: 'sandbox-analysis',
  THREAT_ACTOR: 'threat-actor',
  XDR_INTEGRATION: 'xdr-integration',
  
  // Operation contexts
  ANALYSIS: 'analysis',
  MONITORING: 'monitoring',
  ASSESSMENT: 'assessment',
  MITIGATION: 'mitigation',
  REPORTING: 'reporting'
} as const;

// ================================
// AVAILABLE OPERATIONS
// ================================

export const AVAILABLE_OPERATIONS = {
  // GET operations by module
  RISK_GET: ['status', 'risk-metrics', 'assessments', 'mitigation'],
  COMPLIANCE_GET: ['status', 'health'],
  CVE_GET: ['status', 'analysis', 'recent', 'trending', 'assets'],
  
  // POST operations by module
  RISK_POST: ['assess-risks', 'analyze-trends', 'generate-mitigation', 'governance-review'],
  COMPLIANCE_POST: [
    'analyze-framework', 'assess-status', 'conduct-audit', 
    'generate-report', 'analyze-metrics', 'quick-analysis', 
    'comprehensive-assessment'
  ],
  CVE_POST: ['search', 'analyze-cve', 'track-vulnerability', 'update-database', 'generate-report', 'analyze'],
  
  // Generic operations
  COMMON_GET: ['status', 'health', 'metrics'],
  COMMON_POST: ['analyze', 'search', 'generate-report']
} as const;

// ================================
// SOURCE IDENTIFIERS
// ================================

export const SOURCE_IDENTIFIERS = {
  PHANTOM_RISK_CORE: 'phantom-risk-core',
  PHANTOM_COMPLIANCE: 'phantom-compliance',
  PHANTOM_CVE: 'phantom-cve',
  PHANTOM_THREAT_INTEL: 'phantom-threat-intel',
  PHANTOM_INCIDENT: 'phantom-incident',
  PHANTOM_FORENSICS: 'phantom-forensics',
  PHANTOM_HUNTING: 'phantom-hunting',
  PHANTOM_IOC: 'phantom-ioc',
  PHANTOM_MITRE: 'phantom-mitre',
  PHANTOM_ML: 'phantom-ml',
  PHANTOM_REPUTATION: 'phantom-reputation',
  PHANTOM_SANDBOX: 'phantom-sandbox',
  PHANTOM_THREAT_ACTOR: 'phantom-threat-actor',
  PHANTOM_XDR: 'phantom-xdr'
} as const;

// ================================
// TYPE DEFINITIONS
// ================================

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES;
export type LogMessageKey = keyof typeof LOG_MESSAGES;
export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;
export type StatusMessageKey = keyof typeof STATUS_MESSAGES;
export type ContextMessage = typeof CONTEXT_MESSAGES[keyof typeof CONTEXT_MESSAGES];
export type SourceIdentifier = typeof SOURCE_IDENTIFIERS[keyof typeof SOURCE_IDENTIFIERS];
