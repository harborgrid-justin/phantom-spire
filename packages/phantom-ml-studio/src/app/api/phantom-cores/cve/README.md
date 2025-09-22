# Phantom Cores CVE API

This directory contains the **refactored and modular** Phantom Cores CVE API, broken down from a single large `route.ts` file into focused, maintainable modules that leverage our comprehensive constants library for vulnerability management and analysis.

## File Structure

```
cve/
├── route.ts                    # Main API route (refactored to use handlers)
├── handlers/                   # Operation handlers
│   ├── status.ts              # System status and health monitoring
│   ├── analysis.ts            # CVE analysis and assessment operations
│   └── management.ts          # Tracking, database updates, and reporting
├── utils/                     # Utility functions
│   └── errorHandler.ts        # Centralized error handling with CVE validation
└── README.md                  # This documentation file
```

## Key Improvements

### ✅ Modular Architecture
- **Separated concerns** into focused handler files by functionality
- **CVE-specific validation** with proper CVE ID format checking
- **Leverages constants** from our comprehensive security library
- **Type-safe operations** with CVSS scoring and threat assessment

### ✅ Constants Integration
The refactored API now extensively uses constants from `../constants/` including:
- **System Status**: `SYSTEM_STATUS.OPERATIONAL`, `HEALTH_STATUS.EXCELLENT`
- **Security Assessment**: `CVSS_SEVERITY`, `THREAT_LEVELS`, `VULNERABILITY_TYPES`
- **Attack Vectors**: `ATTACK_VECTORS` for comprehensive threat modeling
- **Component Status**: `COMPONENT_STATUS.ONLINE` for system health
- **Compliance**: `COMPLIANCE_FRAMEWORKS` for regulatory impact
- **Utility Functions**: `getCVSSSeverity()`, `getThreatScore()`, `getRandomFloat()`, etc.
- **Error Handling**: `ERROR_CODES`, `DEFAULT_ERROR_MESSAGES`

### ✅ Handler Organization

#### Status Handlers (`handlers/status.ts`)
- `handleCVEStatus()` - System status with vulnerability metrics using constants
- `handleCVETrending()` - CVE trending analysis with dynamic data
- `handleCVEAssets()` - Asset vulnerability status and patch tracking

#### Analysis Handlers (`handlers/analysis.ts`)
- `handleCVEAnalysis()` - Comprehensive CVE analysis with CVSS scoring
- `handleRecentCVEs()` - Recent vulnerability discovery and tracking
- `handleCVESearch()` - CVE search with intelligent filtering
- `handleDetailedCVEAnalysis()` - In-depth vulnerability assessment
- `handleLegacyCVEAnalysis()` - Legacy endpoint support

#### Management Handlers (`handlers/management.ts`)
- `handleVulnerabilityTracking()` - Vulnerability tracking and metrics
- `handleDatabaseUpdate()` - CVE database synchronization and updates
- `handleReportGeneration()` - Comprehensive vulnerability reporting

#### Error Handling (`utils/errorHandler.ts`)
- `handleCVEError()` - Centralized error handling with CVE-specific categorization
- `handleUnknownCVEOperation()` - Unknown operation handling
- `validateCVEId()` - CVE ID format validation (CVE-YYYY-NNNN+)
- `handleCVEValidationError()` - Validation error handling
- `logCVEOperation()` - Operation logging for debugging

## API Endpoints

### GET Operations
- `GET /api/phantom-cores/cve?operation=status` - Get system status and metrics
- `GET /api/phantom-cores/cve?operation=analysis` - Get vulnerability analysis
- `GET /api/phantom-cores/cve?operation=recent` - Get recent CVEs
- `GET /api/phantom-cores/cve?operation=trending` - Get trending vulnerabilities
- `GET /api/phantom-cores/cve?operation=assets` - Get asset vulnerability status

### POST Operations
- `POST /api/phantom-cores/cve` with `operation` in body:
  - `search` - Search CVE database with filters
  - `analyze-cve` - Perform detailed CVE analysis
  - `track-vulnerability` - Track vulnerability across assets
  - `update-database` - Update CVE database from sources
  - `generate-report` - Generate vulnerability reports
  - `analyze` - Legacy analysis endpoint

## Usage Examples

### CVE Analysis
```typescript
const response = await fetch('/api/phantom-cores/cve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'analyze-cve',
    analysisData: {
      cve_id: 'CVE-2024-1234',
      include_exploits: true,
      risk_context: 'enterprise'
    }
  })
});
```

### Vulnerability Search
```typescript
const response = await fetch('/api/phantom-cores/cve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'search',
    query: 'Apache HTTP Server',
    filters: {
      severity: ['CRITICAL', 'HIGH'],
      date_range: '30_days'
    }
  })
});
```

### System Status Check
```typescript
const response = await fetch('/api/phantom-cores/cve?operation=status');
const data = await response.json();
```

## CVE-Specific Features

### 🔒 CVE ID Validation
- **Format validation** for CVE IDs (CVE-YYYY-NNNN+ pattern)
- **Automatic validation** on analysis endpoints
- **Clear error messages** for invalid formats

### 📊 CVSS Integration
- **CVSS severity calculation** using `getCVSSSeverity()` from constants
- **Threat scoring** with `getThreatScore()` function
- **Attack vector analysis** using `ATTACK_VECTORS` constants

### 🎯 Vulnerability Management
- **Comprehensive tracking** of vulnerability lifecycle
- **Asset impact analysis** with patch status tracking
- **Risk-based prioritization** using threat level constants

### 📈 Intelligence Integration
- **Exploit availability** tracking and analysis
- **Threat intelligence** correlation with trending data
- **Compliance impact** assessment using framework constants

## Benefits of Refactoring

### 🔧 Maintainability
- **Smaller, focused files** (~100-200 lines each) vs single 400+ line file
- **Single responsibility** principle applied to each handler
- **Clear separation** of status monitoring, analysis, and management

### 🎯 Consistency
- **CVSS scoring** standardized across all operations
- **Threat assessment** using consistent constants and functions
- **Error handling** with CVE-specific error categorization

### 🚀 Performance
- **Optimized vulnerability lookups** with proper data structures
- **Efficient CVSS calculations** using utility functions
- **Better caching potential** for individual handlers

### 🧪 Testability
- **Individual handlers** can be tested in isolation
- **Mock CVE data** generation using constants
- **Validation logic** separated for comprehensive testing

### 📈 Scalability
- **Easy addition** of new vulnerability sources
- **Modular reporting** capabilities
- **Extensible analysis** frameworks

## Constants Used

The refactored API leverages these security-focused constant categories:
- **Vulnerability Assessment**: `CVSS_SEVERITY`, `VULNERABILITY_TYPES`, `THREAT_LEVELS`
- **Attack Analysis**: `ATTACK_VECTORS` for comprehensive threat modeling
- **System Health**: `SYSTEM_STATUS`, `HEALTH_STATUS`, `COMPONENT_STATUS`
- **Compliance**: `COMPLIANCE_FRAMEWORKS` for regulatory impact assessment
- **Utility Functions**: `getCVSSSeverity()`, `getThreatScore()`, `getRandomFloat()`, etc.
- **Error Handling**: `ERROR_CODES.DATABASE_ERROR`, `ERROR_CODES.RATE_LIMIT_EXCEEDED`

## CVE Data Sources Integration

### Supported Sources
- **NIST NVD** (National Vulnerability Database)
- **MITRE CVE** (Common Vulnerabilities and Exposures)
- **CISA KEV** (Known Exploited Vulnerabilities)
- **VulnDB** (Vulnerability Database)
- **ExploitDB** (Exploit Database)

### Data Quality Features
- **Duplicate detection** and removal
- **Data validation** with quality scoring
- **Source synchronization** with success rate tracking
- **Performance metrics** for database operations

## File Sizes (Approximate)
- **Original route.ts**: ~400 lines, 20KB
- **New route.ts**: ~80 lines, 4KB
- **status.ts**: ~120 lines, 6KB
- **analysis.ts**: ~180 lines, 9KB
- **management.ts**: ~200 lines, 10KB
- **errorHandler.ts**: ~90 lines, 4KB

**Total**: ~670 lines across 5 files vs 400 lines in 1 file, with significantly enhanced functionality and maintainability.

## Security Considerations

### 🛡️ Input Validation
- **CVE ID format validation** prevents injection attacks
- **Parameter sanitization** for search operations
- **Request size limits** to prevent DoS attacks

### 🔐 Error Handling
- **No sensitive data exposure** in error messages
- **Rate limiting** considerations for database operations
- **Audit logging** for security-relevant operations

### 📊 Data Privacy
- **Asset information** handled with appropriate controls
- **Vulnerability details** properly scoped
- **Compliance requirements** integrated into reporting

## Development Guidelines

### Adding New CVE Operations
1. Determine appropriate handler file (status, analysis, or management)
2. Create handler function using existing patterns and constants
3. Add CVE-specific validation if needed
4. Update main route.ts switch statement
5. Update error handler with new operation type

### CVE Data Integration
Always use constants for consistency:
```typescript
// ❌ Avoid
const severity = 'critical';
const score = 9.0;

// ✅ Prefer
const severity = getCVSSSeverity(cvssScore);
const threatLevel = getThreatScore(score);
```

### Error Handling Best Practices
```typescript
try {
  // CVE operation logic
  if (cveId && !validateCVEId(cveId)) {
    return handleCVEValidationError('cve_id', cveId);
  }
} catch (error) {
  return handleCVEError(error, 'operation-name');
}
```

The refactored CVE API provides a robust, scalable foundation for enterprise vulnerability management with comprehensive CVSS integration, threat intelligence, and compliance reporting capabilities.
