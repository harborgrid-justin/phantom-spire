# Phantom Cores Centralized Messages

This directory contains centralized message management for the Phantom Cores API suite. It provides standardized error messages, success messages, validation messages, and utility functions for consistent API responses across all modules.

## Structure

```
messages/
├── index.ts          # Core message definitions and constants
├── utils.ts          # Utility functions for message formatting and response building
└── README.md         # This documentation file
```

## Key Features

### 1. Centralized Message Management
All user-facing messages, error descriptions, and API responses are centrally managed to ensure consistency and maintainability across the entire Phantom Cores API suite.

### 2. Standardized Response Formats
Provides consistent response templates for success, error, validation, and paginated responses.

### 3. Dynamic Message Generation
Functions that generate context-aware messages with dynamic content insertion.

### 4. Type Safety
Full TypeScript support with comprehensive type definitions for all message categories.

## Message Categories

### Error Messages (`ERROR_MESSAGES`)
- **General errors**: Unknown operations, invalid inputs, validation failures
- **Risk-specific errors**: Assessment not found, invalid risk scores, risk tolerance validation
- **CVE-specific errors**: CVE not found, invalid CVE format
- **Service errors**: External service unavailable, database sync errors
- **Configuration errors**: Configuration validation and setup errors

### Success Messages (`SUCCESS_MESSAGES`)
- **Operation completions**: Generic operation success messages
- **Data retrieval**: Successful data fetch confirmations
- **Analysis completions**: Analysis operation success messages
- **Risk operations**: Risk assessment and mitigation plan creation
- **CVE operations**: CVE analysis and database update confirmations

### Validation Messages (`VALIDATION_MESSAGES`)
- **Field validation**: Required fields, type validation, range validation
- **Format validation**: Field format requirements
- **Enum validation**: Valid value lists and constraints
- **Risk-specific validation**: Risk scores, probability ranges, impact levels
- **CVE validation**: CVE ID format validation

### Status Messages (`STATUS_MESSAGES`)
- **System status**: Operational, degraded, down states
- **Component status**: Individual component health
- **Service status**: Service health monitoring
- **Database status**: Connection and availability
- **API status**: Rate limiting and readiness

### Log Messages (`LOG_MESSAGES`)
- **API operations**: Request logging and operation tracking
- **Performance tracking**: Operation duration and metrics
- **Cache operations**: Hit/miss tracking
- **External service errors**: Service-specific error logging

## Utility Functions

### Error Response Builders
- `buildErrorResponse()` - Standardized error response with context
- `buildUnknownOperationResponse()` - Unknown operation handling
- `buildValidationErrorResponse()` - Validation error formatting
- `buildExternalServiceErrorResponse()` - External service error handling
- `buildInsufficientDataErrorResponse()` - Missing data error handling

### Success Response Builders
- `buildSuccessResponse()` - Standard success response
- `buildPaginatedResponse()` - Paginated data responses
- `buildStatusResponse()` - System status responses

### Validation Utilities
- `validateField()` - Generic field validation
- `validateRequired()` - Required field validation
- `validateType()` - Type validation
- `validateRange()` - Numeric range validation
- `validateEnum()` - Enum value validation

### Risk-Specific Utilities
- `validateRiskScore()` - Risk score validation (0-100)
- `validateProbability()` - Probability validation (0-1)
- `validateRiskTolerance()` - Risk tolerance level validation
- `validateImpactLevel()` - Impact level validation
- `validateTimePeriod()` - Time period validation

### CVE-Specific Utilities
- `validateCVEId()` - CVE ID format validation

### Logging Utilities
- `logOperation()` - API operation logging
- `logCacheOperation()` - Cache operation logging
- `createTimer()` - Performance timing utility

### Response Helpers
- `createApiResponse()` - Generic API response creation
- `getSourceIdentifier()` - Module-specific source identification
- `getContextMessage()` - Context message mapping

## Usage Examples

### Basic Error Handling
```typescript
import { buildErrorResponse, CONTEXT_MESSAGES, getSourceIdentifier } from '../messages/utils';

export function handleError(error: unknown, operation: string): NextResponse {
  return buildErrorResponse(
    error,
    operation,
    CONTEXT_MESSAGES.RISK_MANAGEMENT,
    getSourceIdentifier('risk')
  );
}
```

### Unknown Operation Handling
```typescript
import { buildUnknownOperationResponse, CONTEXT_MESSAGES, AVAILABLE_OPERATIONS } from '../messages/utils';

export function handleUnknownOperation(operation: string, context: 'GET' | 'POST'): NextResponse {
  const moduleKey = context === 'GET' ? 'RISK_GET' : 'RISK_POST';
  return buildUnknownOperationResponse(
    operation,
    context,
    moduleKey as keyof typeof AVAILABLE_OPERATIONS,
    CONTEXT_MESSAGES.RISK_MANAGEMENT
  );
}
```

### Validation
```typescript
import { validateRiskScore, buildValidationErrorResponse } from '../messages/utils';

function validateRequest(data: any): NextResponse | null {
  if (data.risk_score !== undefined) {
    const validation = validateRiskScore(data.risk_score);
    if (!validation.isValid) {
      return buildValidationErrorResponse('risk_score', data.risk_score, validation.error);
    }
  }
  return null;
}
```

### Success Response
```typescript
import { buildSuccessResponse, getSourceIdentifier } from '../messages/utils';

export function createSuccessResponse(data: any, operation: string): NextResponse {
  return buildSuccessResponse(
    data,
    operation,
    getSourceIdentifier('risk'),
    'Risk assessment completed successfully'
  );
}
```

### Logging
```typescript
import { logOperation, createTimer } from '../messages/utils';

export function handleOperation(operation: string, body: any) {
  const timer = createTimer(operation);
  logOperation('Risk', operation, body);
  
  // ... operation logic ...
  
  timer.end(); // Logs duration automatically
}
```

## Response Templates

### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "operation": "assess-risks",
  "source": "phantom-risk-core",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": "Validation failed for risk_score: Invalid risk score. Expected a number between 0 and 100, got: 150",
  "error_code": "VALIDATION_ERROR",
  "operation": "assess-risks",
  "context": "risk-management",
  "source": "phantom-risk-core",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "validation_errors": [
    {
      "field": "risk_score",
      "message": "Risk score must be a number between 0 and 100",
      "provided_value": 150
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 150,
    "total_pages": 8,
    "has_next": true,
    "has_previous": false
  },
  "operation": "list-assessments",
  "source": "phantom-risk-core",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Available Operations

### Risk Management
- **GET**: `['status', 'risk-metrics', 'assessments', 'mitigation']`
- **POST**: `['assess-risks', 'analyze-trends', 'generate-mitigation', 'governance-review']`

### Compliance
- **GET**: `['status', 'health']`
- **POST**: `['analyze-framework', 'assess-status', 'conduct-audit', 'generate-report', 'analyze-metrics', 'quick-analysis', 'comprehensive-assessment']`

### CVE Analysis
- **GET**: `['status', 'analysis', 'recent', 'trending', 'assets']`
- **POST**: `['search', 'analyze-cve', 'track-vulnerability', 'update-database', 'generate-report', 'analyze']`

## Source Identifiers

Each module has its own source identifier for tracking and debugging:

- `PHANTOM_RISK_CORE`: Risk management operations
- `PHANTOM_COMPLIANCE`: Compliance operations
- `PHANTOM_CVE`: CVE analysis operations
- `PHANTOM_THREAT_INTEL`: Threat intelligence operations
- `PHANTOM_INCIDENT`: Incident response operations
- `PHANTOM_FORENSICS`: Forensics operations
- `PHANTOM_HUNTING`: Threat hunting operations
- `PHANTOM_IOC`: IOC analysis operations
- `PHANTOM_MITRE`: MITRE mapping operations
- `PHANTOM_ML`: ML analysis operations
- `PHANTOM_REPUTATION`: Reputation check operations
- `PHANTOM_SANDBOX`: Sandbox analysis operations
- `PHANTOM_THREAT_ACTOR`: Threat actor operations
- `PHANTOM_XDR`: XDR integration operations

## Migration Guide

### Updating Error Handlers

**Before:**
```typescript
export function handleError(error: unknown, operation?: string): NextResponse {
  console.error('API error:', error);
  let errorMessage = 'Internal server error';
  // ... custom error handling logic ...
  
  return NextResponse.json({
    success: false,
    error: errorMessage,
    operation: operation || 'unknown',
    timestamp: new Date().toISOString()
  }, { status: 500 });
}
```

**After:**
```typescript
import { buildErrorResponse, CONTEXT_MESSAGES, getSourceIdentifier } from '../messages/utils';

export function handleError(error: unknown, operation?: string): NextResponse {
  return buildErrorResponse(
    error,
    operation || 'unknown',
    CONTEXT_MESSAGES.RISK_MANAGEMENT, // or appropriate context
    getSourceIdentifier('risk') // or appropriate module
  );
}
```

### Updating Logging

**Before:**
```typescript
export function logOperation(operation: string, body?: any): void {
  console.log('API - Received operation:', operation);
  if (body) {
    console.log('API - Request body:', JSON.stringify(body, null, 2));
  }
}
```

**After:**
```typescript
import { logOperation } from '../messages/utils';

export function logApiOperation(operation: string, body?: any): void {
  logOperation('Risk', operation, body); // or appropriate API name
}
```

## Benefits

1. **Consistency**: All API modules use the same message formats and response structures
2. **Maintainability**: Messages are centralized, making updates and changes easier
3. **Internationalization Ready**: Centralized messages can be easily extended for i18n
4. **Type Safety**: Full TypeScript support prevents runtime errors
5. **Debugging**: Standardized logging and source identification
6. **Performance**: Reusable functions reduce code duplication
7. **Testing**: Centralized message validation simplifies testing

## Best Practices

1. **Always use centralized functions** instead of creating custom error responses
2. **Include appropriate context and source identifiers** for all responses
3. **Use validation utilities** for consistent input validation
4. **Log operations** using the centralized logging functions
5. **Follow the response templates** for consistent API behavior
6. **Add new message types** to the centralized system rather than hardcoding them
7. **Use type-safe imports** to prevent runtime errors

## Future Enhancements

- **Internationalization (i18n)**: Support for multiple languages
- **Message Templates**: Dynamic template system for complex messages
- **Metrics Integration**: Built-in metrics collection for message usage
- **Rate Limiting**: Enhanced rate limiting message handling
- **Audit Logging**: Enhanced audit trail for all messages
- **Message Versioning**: Support for API versioning in messages
