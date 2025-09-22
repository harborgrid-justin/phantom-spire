# Phantom Cores Compliance API

This directory contains the **refactored and modular** Phantom Cores Compliance API, broken down from a single large `route.ts` file into focused, maintainable modules that leverage our comprehensive constants library.

## File Structure

```
compliance/
├── route.ts                    # Main API route (refactored to use handlers)
├── handlers/                   # Operation handlers
│   ├── status.ts              # Status and health check handlers
│   ├── analysis.ts            # Framework analysis and assessment handlers
│   └── audit.ts               # Audit and reporting handlers
├── utils/                     # Utility functions
│   └── errorHandler.ts        # Centralized error handling
└── README.md                  # This documentation file
```

## Key Improvements

### ✅ Modular Architecture
- **Separated concerns** into focused handler files
- **Centralized error handling** with consistent error codes
- **Leverages constants** from our 500+ constant library
- **Type-safe operations** with proper TypeScript support

### ✅ Constants Integration
The refactored API now uses constants from `../constants/` including:
- `SYSTEM_STATUS` and `HEALTH_STATUS` for consistent status reporting
- `COMPLIANCE_FRAMEWORKS` for framework references
- `INDUSTRY_SECTORS` for industry categorization
- `RISK_LEVELS` and `THREAT_LEVELS` for security assessments
- `ERROR_CODES` and `DEFAULT_ERROR_MESSAGES` for error handling
- Utility functions like `getRandomFloat()`, `getRandomElement()`, etc.

### ✅ Handler Organization

#### Status Handlers (`handlers/status.ts`)
- `handleComplianceStatus()` - System status and metrics
- `handleComplianceHealth()` - Health checks and component status

#### Analysis Handlers (`handlers/analysis.ts`)
- `handleFrameworkAnalysis()` - Framework compliance analysis
- `handleStatusAssessment()` - Status assessments
- `handleMetricsAnalysis()` - Metrics and trend analysis
- `handleQuickAnalysis()` - Quick compliance assessments
- `handleComprehensiveAssessment()` - Detailed assessments

#### Audit Handlers (`handlers/audit.ts`)
- `handleComplianceAudit()` - Compliance audit operations
- `handleReportGeneration()` - Report generation

#### Error Handling (`utils/errorHandler.ts`)
- `handleComplianceError()` - Centralized error handling
- `handleUnknownOperation()` - Unknown operation handling
- `logComplianceOperation()` - Operation logging

## API Endpoints

### GET Operations
- `GET /api/phantom-cores/compliance?operation=status` - Get system status
- `GET /api/phantom-cores/compliance?operation=health` - Get health metrics

### POST Operations
- `POST /api/phantom-cores/compliance` with `operation` in body:
  - `analyze-framework` - Analyze compliance frameworks
  - `assess-status` - Assess compliance status
  - `conduct-audit` - Conduct compliance audits
  - `generate-report` - Generate compliance reports
  - `analyze-metrics` - Analyze compliance metrics
  - `quick-analysis` - Quick compliance analysis
  - `comprehensive-assessment` - Comprehensive assessments

## Usage Examples

### Framework Analysis
```typescript
const response = await fetch('/api/phantom-cores/compliance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'analyze-framework',
    frameworkData: {
      name: 'Custom Framework',
      industry: 'technology',
      standards: ['ISO 27001', 'SOC 2']
    }
  })
});
```

### Quick Health Check
```typescript
const response = await fetch('/api/phantom-cores/compliance?operation=health');
const data = await response.json();
```

## Benefits of Refactoring

### 🔧 Maintainability
- **Smaller, focused files** are easier to understand and modify
- **Single responsibility** principle applied to each handler
- **Reduced cognitive load** when working on specific features

### 🎯 Consistency
- **Standardized error handling** across all operations
- **Consistent use of constants** eliminates magic strings
- **Uniform response formats** for better API predictability

### 🚀 Performance
- **Better tree-shaking** potential for unused code
- **Modular imports** allow for selective loading
- **Reduced bundle size** for specific operations

### 🧪 Testability
- **Individual handlers** can be tested in isolation
- **Mocked constants** for predictable testing
- **Separated error scenarios** for comprehensive coverage

### 📈 Scalability
- **Easy to add new operations** by creating new handlers
- **Constants library** can be extended without touching handlers
- **Clear separation** allows for parallel development

## Migration Notes

### From Original route.ts
The original single-file approach had:
- **~500 lines** of mixed concerns in one file
- **Hard-coded strings** and magic numbers
- **Repeated error handling** patterns
- **Difficult to test** and maintain

### To New Structure
The refactored approach provides:
- **Modular files** with clear responsibilities (~100-200 lines each)
- **Constants integration** for consistency and maintainability
- **Centralized error handling** with proper error codes
- **Easy to test** individual components

## Development Guidelines

### Adding New Operations
1. Determine the appropriate handler file (status, analysis, or audit)
2. Create the handler function using existing patterns
3. Leverage constants from the constants library
4. Add the operation to the main route.ts switch statement
5. Update error handler with available operations list

### Using Constants
Always prefer constants over hard-coded values:
```typescript
// ❌ Avoid
const status = 'operational';
const level = 'high';

// ✅ Prefer
const status = SYSTEM_STATUS.OPERATIONAL;
const level = THREAT_LEVELS.HIGH;
```

### Error Handling
Use the centralized error handler for consistent responses:
```typescript
try {
  // Operation logic
} catch (error) {
  return handleComplianceError(error, 'operation-name');
}
```

## Constants Used

The refactored API leverages these constant categories:
- **System Status**: SYSTEM_STATUS, HEALTH_STATUS, COMPONENT_STATUS
- **Compliance**: COMPLIANCE_FRAMEWORKS, REGULATORY_REGIONS
- **Industry**: INDUSTRY_SECTORS, COUNTRIES, GEOGRAPHIC_REGIONS
- **Security**: RISK_LEVELS, THREAT_LEVELS, VULNERABILITY_TYPES
- **Utility Functions**: getRandomFloat, getRandomElement, etc.
- **Error Handling**: ERROR_CODES, DEFAULT_ERROR_MESSAGES

## File Sizes (Approximate)
- **Original route.ts**: ~500 lines, 25KB
- **New route.ts**: ~70 lines, 3KB
- **status.ts**: ~90 lines, 4KB
- **analysis.ts**: ~200 lines, 8KB
- **audit.ts**: ~150 lines, 6KB
- **errorHandler.ts**: ~80 lines, 3KB

**Total**: ~590 lines across 5 files vs 500 lines in 1 file, with significantly improved maintainability and functionality.
