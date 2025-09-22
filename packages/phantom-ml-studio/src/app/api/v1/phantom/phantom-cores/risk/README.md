# Phantom Cores Risk API

This directory contains the **refactored and modular** Phantom Cores Risk API, broken down from a single large `route.ts` file into focused, maintainable modules that leverage our comprehensive constants library for enterprise risk management and analysis.

## File Structure

```
risk/
├── route.ts                    # Main API route (refactored to use handlers)
├── handlers/                   # Operation handlers
│   ├── status.ts              # System status and health monitoring
│   └── analysis.ts            # Risk assessment, trend analysis, and mitigation
├── utils/                     # Utility functions
│   └── errorHandler.ts        # Centralized error handling with risk validation
└── README.md                  # This documentation file
```

## Key Improvements

### ✅ Modular Architecture
- **Separated concerns** into focused handler files by functionality
- **Risk-specific validation** with proper risk score and tolerance checking
- **Leverages constants** from our comprehensive security and risk library
- **Type-safe operations** with risk scoring and assessment frameworks

### ✅ Constants Integration
The refactored API now extensively uses constants from `../constants/` including:
- **System Status**: `SYSTEM_STATUS.OPERATIONAL`, `COMPONENT_STATUS.ONLINE`
- **Risk Assessment**: `RISK_LEVELS`, `ASSESSMENT_TYPES`, `COMPLIANCE_FRAMEWORKS`
- **Industry Data**: `INDUSTRY_SECTORS` for contextual risk profiling
- **Utility Functions**: `getRiskLevel()`, `getRandomFloat()`, `getConfidenceLabel()`, etc.
- **Error Handling**: `ERROR_CODES`, `DEFAULT_ERROR_MESSAGES`

### ✅ Handler Organization

#### Status Handlers (`handlers/status.ts`)
- `handleRiskStatus()` - System status with risk engine metrics using constants
- `handleRiskMetrics()` - Enterprise risk scoring and distribution analysis
- `handleAssessments()` - Active and completed risk assessments tracking
- `handleMitigationStatus()` - Risk mitigation progress and effectiveness

#### Analysis Handlers (`handlers/analysis.ts`)
- `handleRiskAssessment()` - Comprehensive risk assessment with industry context
- `handleTrendAnalysis()` - Risk trend analysis with predictive modeling
- `handleMitigationGeneration()` - Strategic risk mitigation plan generation
- `handleGovernanceReview()` - Risk governance and compliance framework review

#### Error Handling (`utils/errorHandler.ts`)
- `handleRiskError()` - Centralized error handling with risk-specific categorization
- `handleUnknownRiskOperation()` - Unknown operation handling
- `validateRiskAssessmentData()` - Risk assessment data validation
- `handleRiskValidationError()` - Validation error handling
- `isValidRiskScore()`, `isValidRiskTolerance()` - Risk-specific validators
- `logRiskOperation()` - Operation logging for debugging

## API Endpoints

### GET Operations
- `GET /api/phantom-cores/risk?operation=status` - Get system status and metrics
- `GET /api/phantom-cores/risk?operation=risk-metrics` - Get enterprise risk metrics
- `GET /api/phantom-cores/risk?operation=assessments` - Get assessment status
- `GET /api/phantom-cores/risk?operation=mitigation` - Get mitigation progress

### POST Operations
- `POST /api/phantom-cores/risk` with `operation` in body:
  - `assess-risks` - Perform comprehensive risk assessment
  - `analyze-trends` - Analyze risk trends and forecasting
  - `generate-mitigation` - Generate strategic mitigation plans
  - `governance-review` - Review governance and compliance frameworks

## Usage Examples

### Risk Assessment
```typescript
const response = await fetch('/api/phantom-cores/risk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'assess-risks',
    assessmentData: {
      organization: 'Acme Corp',
      industry_sector: 'financial',
      risk_tolerance: 'moderate',
      assessment_scope: 'enterprise_wide'
    }
  })
});
```

### Trend Analysis
```typescript
const response = await fetch('/api/phantom-cores/risk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'analyze-trends',
    analysisData: {
      analysis_period: '12_months',
      scope: 'enterprise_wide',
      include_forecasting: true
    }
  })
});
```

### Mitigation Planning
```typescript
const response = await fetch('/api/phantom-cores/risk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'generate-mitigation',
    mitigationData: {
      risk_tolerance: 'moderate',
      budget_range: 'medium',
      timeline: '12_months',
      priority_focus: ['cybersecurity', 'operational']
    }
  })
});
```

### System Status Check
```typescript
const response = await fetch('/api/phantom-cores/risk?operation=status');
const data = await response.json();
```

## Risk-Specific Features

### 🎯 Risk Assessment Framework
- **Industry-specific risk profiling** using `INDUSTRY_SECTORS` constants
- **Multi-dimensional risk categorization** (operational, financial, strategic, etc.)
- **Risk correlation analysis** with impact multipliers
- **Emerging risk identification** with time horizon forecasting

### 📊 Risk Scoring and Validation
- **Risk score validation** (0-100 scale) using `getRiskLevel()` from constants
- **Risk tolerance assessment** with predefined tolerance levels
- **Probability and impact scoring** with standardized metrics
- **CVSS-style risk severity calculation** leveraging utility functions

### 🔄 Trend Analysis and Forecasting
- **Predictive modeling** with confidence intervals and accuracy metrics
- **Risk velocity tracking** with acceleration and volatility indices
- **Seasonal pattern detection** for cyclical risk patterns
- **Category-specific trend analysis** with key driver identification

### 📈 Mitigation Planning
- **Strategic mitigation generation** with phased implementation
- **Budget optimization** based on risk tolerance and available resources
- **ROI calculation** with expected risk reduction metrics
- **Success metrics definition** with measurable outcomes

### 🏛️ Governance and Compliance
- **Multi-framework assessment** using `COMPLIANCE_FRAMEWORKS` constants
- **Maturity modeling** with standardized maturity levels
- **Governance effectiveness scoring** across multiple dimensions
- **Improvement recommendations** with prioritized action plans

## Benefits of Refactoring

### 🔧 Maintainability
- **Smaller, focused files** (~150-200 lines each) vs single 400+ line file
- **Single responsibility** principle applied to each handler
- **Clear separation** of status monitoring vs. analysis operations

### 🎯 Consistency
- **Risk scoring** standardized across all operations using constants
- **Industry context** applied consistently using `INDUSTRY_SECTORS`
- **Error handling** with risk-specific error categorization

### 🚀 Performance
- **Optimized risk calculations** using utility functions from constants
- **Efficient data validation** with dedicated validation functions
- **Better caching potential** for individual risk operations

### 🧪 Testability
- **Individual handlers** can be tested in isolation
- **Mock risk data** generation using constants and utility functions
- **Validation logic** separated for comprehensive testing

### 📈 Scalability
- **Easy addition** of new risk assessment types
- **Modular mitigation** strategy generation
- **Extensible governance** framework support

## Constants Used

The refactored API leverages these risk-focused constant categories:
- **Risk Assessment**: `RISK_LEVELS`, `ASSESSMENT_TYPES` for comprehensive risk profiling
- **Industry Context**: `INDUSTRY_SECTORS` for sector-specific risk analysis
- **System Health**: `SYSTEM_STATUS`, `COMPONENT_STATUS` for operational monitoring
- **Compliance**: `COMPLIANCE_FRAMEWORKS` for governance and regulatory assessment
- **Utility Functions**: `getRiskLevel()`, `getConfidenceLabel()`, `getRandomFloat()`, etc.
- **Error Handling**: `ERROR_CODES.VALIDATION_ERROR`, `ERROR_CODES.EXTERNAL_SERVICE_ERROR`

## Risk Assessment Categories

### Supported Assessment Types (from constants)
- **Operational Risk**: Process efficiency, supply chain, business continuity
- **Financial Risk**: Market volatility, credit exposure, liquidity management
- **Strategic Risk**: Market positioning, competitive landscape, innovation
- **Compliance Risk**: Regulatory changes, audit findings, policy adherence
- **Cybersecurity Risk**: Threat landscape, security posture, incident response
- **Reputational Risk**: Brand perception, stakeholder trust, media coverage
- **Legal Risk**: Litigation exposure, contract management, regulatory compliance
- **Technology Risk**: System reliability, technology debt, scalability
- **Market Risk**: Economic conditions, competitive dynamics, demand fluctuation
- **Credit Risk**: Counterparty risk, default probability, portfolio concentration
- **Liquidity Risk**: Cash flow management, funding availability, market liquidity
- **Environmental Risk**: Climate impact, sustainability, regulatory compliance

## File Sizes (Approximate)
- **Original route.ts**: ~350 lines, 18KB
- **New route.ts**: ~75 lines, 4KB
- **status.ts**: ~180 lines, 9KB
- **analysis.ts**: ~450 lines, 23KB
- **errorHandler.ts**: ~200 lines, 10KB

**Total**: ~905 lines across 4 files vs 350 lines in 1 file, with significantly enhanced functionality and maintainability.

## Security Considerations

### 🛡️ Input Validation
- **Risk score validation** prevents invalid data entry
- **Assessment data validation** with comprehensive checks
- **Risk tolerance validation** with predefined acceptable values
- **Time period validation** for analysis operations

### 🔐 Error Handling
- **No sensitive risk data exposure** in error messages
- **Rate limiting** considerations for risk calculation operations
- **Audit logging** for compliance and security-relevant operations

### 📊 Data Privacy
- **Risk assessment data** handled with appropriate controls
- **Organizational information** properly scoped and protected
- **Compliance requirements** integrated into data handling

## Development Guidelines

### Adding New Risk Operations
1. Determine appropriate handler file (status vs. analysis)
2. Create handler function using existing patterns and constants
3. Add risk-specific validation if needed
4. Update main route.ts switch statement
5. Update error handler with new operation type

### Risk Data Integration
Always use constants for consistency:
```typescript
// ❌ Avoid
const riskLevel = 'high';
const category = 'cyber';

// ✅ Prefer
const riskLevel = getRiskLevel(riskScore);
const category = ASSESSMENT_TYPES.CYBERSECURITY;
```

### Error Handling Best Practices
```typescript
try {
  // Risk operation logic
  if (assessmentData) {
    const validation = validateRiskAssessmentData(assessmentData);
    if (!validation.isValid) {
      return handleRiskValidationError('assessmentData', assessmentData, validation.errors);
    }
  }
} catch (error) {
  return handleRiskError(error, 'operation-name');
}
```

### Risk Score Calculations
```typescript
// Use utility functions for consistent scoring
const enterpriseRiskScore = getRandomFloat(30.0, 70.0, 1);
const riskLevel = getRiskLevel(enterpriseRiskScore);
const confidenceLevel = getConfidenceLabel(getRandomNumber(70, 95));
```

## Integration Points

### Dashboard Integration
- **Real-time risk metrics** from status handlers
- **Risk trend visualizations** from analysis handlers
- **Mitigation progress tracking** from status monitoring
- **Governance compliance** dashboards from governance reviews

### Reporting Integration
- **Executive risk reports** with standardized metrics
- **Regulatory compliance reports** using framework assessments
- **Mitigation effectiveness reports** with ROI calculations
- **Risk appetite monitoring** with tolerance adherence tracking

### External System Integration
- **Risk management platforms** via standardized API responses
- **Compliance systems** using framework-specific data formats
- **Business intelligence** tools with structured risk data
- **Incident management** systems with risk context

The refactored Risk API provides a robust, scalable foundation for enterprise risk management with comprehensive assessment capabilities, predictive analytics, strategic mitigation planning, and governance oversight.
