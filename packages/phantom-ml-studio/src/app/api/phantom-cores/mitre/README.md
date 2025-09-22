# MITRE API Documentation

## Overview
This directory contains the refactored MITRE API for the Phantom MITRE Core, broken down into smaller, more manageable modules for better maintainability and code organization. The API provides comprehensive MITRE ATT&CK framework integration including TTP analysis, coverage assessment, technique mapping, and incident correlation.

## File Structure

```
src/app/api/phantom-cores/mitre/
├── route.ts                           # Main API route handler
├── types.ts                           # TypeScript interfaces and types
├── utils.ts                           # Utility functions and helpers
├── handlers/
│   ├── index.ts                      # Handler exports
│   ├── get-handlers.ts               # GET request handlers
│   └── post-handlers.ts              # POST request handlers
└── README.md                         # This file
```

## API Endpoints

### GET Operations

#### GET /api/phantom-cores/mitre?operation=status
Returns comprehensive MITRE system status and framework integration metrics.

**Response:**
- System operational status
- Framework coverage metrics (tactics, techniques, sub-techniques)
- Detection coverage statistics
- Mapping statistics (alerts, incidents, campaigns)
- Intelligence integration metrics

#### GET /api/phantom-cores/mitre?operation=analysis
Returns detailed MITRE technique analysis and threat context.

**Response:**
- Attack pattern analysis with technique details
- Threat context including prevalence and impact
- Related techniques and relationships
- Mitigation strategies and recommendations
- Detection analytics and monitoring guidance

#### GET /api/phantom-cores/mitre?operation=tactics
Returns MITRE ATT&CK tactics overview and coverage data.

**Response:**
- Complete tactics listing with IDs and descriptions
- Technique counts per tactic
- Coverage percentages and recent activity metrics
- Tactical effectiveness measurements

#### GET /api/phantom-cores/mitre?operation=techniques
Returns MITRE techniques catalog with detection coverage.

**Response:**
- Comprehensive technique listings
- Detection coverage status per technique
- Recent detection statistics
- Associated threat groups and prevalence data

#### GET /api/phantom-cores/mitre?operation=groups
Returns threat group profiles and activity intelligence.

**Response:**
- Threat group catalog with aliases and origins
- Sophistication levels and activity status
- Technique usage patterns and attribution data
- Historical activity and first seen dates

#### GET /api/phantom-cores/mitre?operation=coverage
Returns detection coverage analysis and gap assessment.

**Response:**
- Overall framework coverage percentages
- Coverage breakdown by individual tactics
- Priority gaps and recommendations
- Coverage improvement suggestions

### POST Operations

#### POST /api/phantom-cores/mitre
Performs various MITRE analysis operations based on the `operation` parameter.

**Operations:**

##### analyze-ttp
Analyzes specific Tactics, Techniques, and Procedures (TTPs).

**Request Body:**
```json
{
  "operation": "analyze-ttp",
  "ttpData": {
    "technique_id": "T1566.001",
    "tactic": "Initial Access"
  }
}
```

**Response:**
- TTP analysis with technique profile
- Mapping results including threat scores
- Detection coverage assessment
- Security recommendations and controls

##### map-techniques
Maps and analyzes technique coverage across the environment.

**Request Body:**
```json
{
  "operation": "map-techniques",
  "mappingData": {
    "scope": "enterprise_wide",
    "priority": "high"
  }
}
```

**Response:**
- Technique mapping results and statistics
- Coverage analysis with gap identification
- Mapping effectiveness metrics
- Implementation recommendations

##### assess-coverage
Performs comprehensive coverage assessment across MITRE framework.

**Request Body:**
```json
{
  "operation": "assess-coverage",
  "assessmentData": {
    "scope": "full_framework",
    "timeframe": "current"
  }
}
```

**Response:**
- Overall coverage assessment results
- Tactic-by-tactic coverage breakdown
- Critical gaps identification
- Coverage improvement roadmap

##### generate-mitre-report
Generates comprehensive MITRE ATT&CK coverage and analysis reports.

**Request Body:**
```json
{
  "operation": "generate-mitre-report",
  "reportData": {
    "report_type": "MITRE ATT&CK Coverage Report",
    "timeframe": "quarterly"
  }
}
```

**Response:**
- Report generation confirmation with ID
- Executive summary and key statistics
- Report sections and download information
- Strategic recommendations and next steps

##### map_incident (Legacy Support)
Maps security incidents to MITRE ATT&CK techniques and tactics.

**Request Body:**
```json
{
  "operation": "map_incident",
  "incident_id": "inc-2024-001",
  "incident_data": {
    "indicators": ["malicious.exe", "192.168.1.100"],
    "timeline": ["initial_access", "persistence", "command_control"]
  }
}
```

**Response:**
- Incident mapping results with technique correlation
- Attack path reconstruction and analysis
- Threat assessment and attribution
- Campaign correlation and intelligence

## Architecture Components

### Types (`types.ts`)
Defines TypeScript interfaces for:
- `MitreStatus`: System status and framework metrics
- `MitreAnalysis`: Technique analysis and threat context
- `TacticsData`: MITRE tactics information and coverage
- `TechniquesData`: Technique catalog and detection status
- `GroupsData`: Threat group profiles and intelligence
- `CoverageData`: Coverage analysis and gap assessment
- `TtpAnalysis`: TTP analysis results and recommendations
- `TechniqueMapping`: Technique mapping and coverage results
- `CoverageAssessment`: Comprehensive coverage evaluation
- `MitreReport`: Report generation and documentation
- `IncidentMappingResult`: Incident correlation and analysis
- Request interfaces for all operations
- `ApiResponse`: Standardized API response format

### Utilities (`utils.ts`)
Provides helper functions for:
- Standardized API response creation
- ID generation for analysis, mapping, assessment, and reports
- Random data generation for mock responses
- Coverage and threat score calculations
- Error handling and operation logging
- Common constants (tactics, techniques, threat groups, mitigations)
- Data generation helpers for complex structures

### GET Handlers (`handlers/get-handlers.ts`)
Implements handlers for:
- `handleStatus()`: System status and framework metrics
- `handleAnalysis()`: Technique analysis and threat intelligence
- `handleTactics()`: MITRE tactics overview and coverage
- `handleTechniques()`: Technique catalog and detection status
- `handleGroups()`: Threat group intelligence and profiles
- `handleCoverage()`: Coverage analysis and gap assessment

### POST Handlers (`handlers/post-handlers.ts`)
Implements handlers for:
- `handleAnalyzeTtp()`: TTP analysis and evaluation
- `handleMapTechniques()`: Technique mapping and coverage analysis
- `handleAssessCoverage()`: Comprehensive coverage assessment
- `handleGenerateMitreReport()`: Report generation and documentation
- `handleMapIncident()`: Incident correlation and attribution

## Key Features

### MITRE ATT&CK Framework Integration
- Complete tactics, techniques, and procedures mapping
- Sub-technique and procedure correlation
- Mitigation strategy alignment and recommendations
- Detection rule mapping and coverage analysis
- Framework version tracking and updates

### Threat Intelligence Integration
- Threat group profiling and attribution
- Campaign correlation and tracking
- Attack pattern analysis and classification
- Threat actor technique usage patterns
- Geographic and temporal threat analysis

### Coverage Assessment and Analysis
- Detection coverage measurement across framework
- Gap analysis and prioritization
- Coverage improvement recommendations
- Tactical effectiveness evaluation
- Detection rule correlation and mapping

### Incident Response Integration
- Incident to MITRE technique mapping
- Attack path reconstruction and analysis
- Threat attribution and campaign correlation
- Evidence correlation and technique validation
- Response prioritization and recommendations

### Reporting and Analytics
- Executive summary generation and metrics
- Technical analysis reports and documentation
- Coverage assessment reports and trends
- Gap analysis and improvement roadmaps
- Compliance and audit reporting capabilities

## Benefits of Refactoring

1. **Modularity**: Each handler focuses on specific MITRE operations
2. **Maintainability**: Changes to individual operations don't affect others
3. **Type Safety**: Centralized type definitions ensure API consistency
4. **Code Organization**: Related functionality is logically grouped
5. **Testing**: Individual handlers can be unit tested in isolation
6. **Reusability**: Utility functions can be shared across handlers
7. **Error Handling**: Consistent error handling and logging
8. **Scalability**: Easy to add new techniques and extend functionality

## Usage Examples

### Getting System Status
```javascript
const response = await fetch('/api/phantom-cores/mitre?operation=status');
const data = await response.json();
console.log('MITRE system status:', data.data.status);
```

### MITRE Analysis
```javascript
const response = await fetch('/api/phantom-cores/mitre?operation=analysis');
const data = await response.json();
console.log('MITRE analysis:', data.data.attack_pattern);
```

### Tactics Overview
```javascript
const response = await fetch('/api/phantom-cores/mitre?operation=tactics');
const data = await response.json();
console.log('MITRE tactics:', data.data.tactics);
```

### Techniques Catalog
```javascript
const response = await fetch('/api/phantom-cores/mitre?operation=techniques');
const data = await response.json();
console.log('MITRE techniques:', data.data.techniques);
```

### Threat Groups
```javascript
const response = await fetch('/api/phantom-cores/mitre?operation=groups');
const data = await response.json();
console.log('Threat groups:', data.data.groups);
```

### Coverage Analysis
```javascript
const response = await fetch('/api/phantom-cores/mitre?operation=coverage');
const data = await response.json();
console.log('Coverage data:', data.data.overall_coverage);
```

### TTP Analysis
```javascript
const response = await fetch('/api/phantom-cores/mitre', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'analyze-ttp',
    ttpData: {
      technique_id: 'T1566.001',
      tactic: 'Initial Access'
    }
  })
});
const analysis = await response.json();
console.log('TTP analysis:', analysis.data);
```

### Technique Mapping
```javascript
const response = await fetch('/api/phantom-cores/mitre', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'map-techniques',
    mappingData: {
      scope: 'enterprise_wide',
      priority: 'high'
    }
  })
});
const mapping = await response.json();
console.log('Technique mapping:', mapping.data);
```

### Coverage Assessment
```javascript
const response = await fetch('/api/phantom-cores/mitre', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'assess-coverage',
    assessmentData: {
      scope: 'full_framework',
      timeframe: 'current'
    }
  })
});
const assessment = await response.json();
console.log('Coverage assessment:', assessment.data);
```

### Report Generation
```javascript
const response = await fetch('/api/phantom-cores/mitre', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'generate-mitre-report',
    reportData: {
      report_type: 'MITRE ATT&CK Coverage Report',
      timeframe: 'quarterly'
    }
  })
});
const report = await response.json();
console.log('MITRE report:', report.data);
```

### Incident Mapping
```javascript
const response = await fetch('/api/phantom-cores/mitre', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'map_incident',
    incident_id: 'inc-2024-001',
    incident_data: {
      indicators: ['malicious.exe', '192.168.1.100'],
      timeline: ['initial_access', 'persistence', 'command_control']
    }
  })
});
const mapping = await response.json();
console.log('Incident mapping:', mapping.data);
```

## MITRE ATT&CK Framework Structure

### Tactics (14 Total)
- **Initial Access (TA0001)**: Entry point into the network
- **Execution (TA0002)**: Running malicious code
- **Persistence (TA0003)**: Maintaining foothold
- **Privilege Escalation (TA0004)**: Gaining higher permissions
- **Defense Evasion (TA0005)**: Avoiding detection
- **Credential Access (TA0006)**: Stealing credentials
- **Discovery (TA0007)**: Gathering information
- **Lateral Movement (TA0008)**: Moving through the network
- **Collection (TA0009)**: Gathering data
- **Command and Control (TA0010)**: Communicating with systems
- **Exfiltration (TA0011)**: Stealing data
- **Impact (TA0040)**: Manipulating, interrupting, or destroying systems

### Common Techniques
- **T1566.001**: Spearphishing Attachment
- **T1566.002**: Spearphishing Link
- **T1547.001**: Registry Run Keys / Startup Folder
- **T1071.001**: Web Protocols
- **T1055**: Process Injection
- **T1027**: Obfuscated Files or Information
- **T1003**: OS Credential Dumping
- **T1082**: System Information Discovery
- **T1021**: Remote Services
- **T1005**: Data from Local System

### Threat Groups and Attribution
- **APT29 (G0016)**: Cozy Bear, The Dukes (Russian Federation)
- **APT28 (G0007)**: Fancy Bear, Sofacy (Russian Federation)
- **APT1 (G0006)**: Comment Crew (China)
- **Lazarus Group (G0032)**: Hidden Cobra (North Korea)
- **FIN7 (G0046)**: Carbanak Group (Financial)
- **Equation Group (G0020)**: Advanced persistent threat
- **Sandworm Team (G0034)**: Russian military intelligence

### Detection and Mitigation
- **Detection Methods**: Email security, EDR, network monitoring, UBA
- **Mitigation Strategies**: Antivirus, content filtering, user training, network controls
- **Coverage Metrics**: Technique coverage, detection accuracy, gap analysis
- **Analytics**: Behavioral analysis, signature detection, anomaly detection

## Performance Metrics

### Framework Coverage KPIs
- **Overall Coverage**: Percentage of techniques with detection
- **Tactic Coverage**: Coverage distribution across tactics
- **Detection Accuracy**: True positive rate for MITRE mappings
- **Gap Priority**: Criticality assessment of coverage gaps
- **Improvement Tracking**: Coverage enhancement over time

### Threat Intelligence Metrics
- **Attribution Confidence**: Certainty in threat actor identification
- **Campaign Correlation**: Success rate in linking related activities
- **Technique Prevalence**: Usage frequency across threat landscape
- **Detection Timeliness**: Speed of technique identification and mapping
- **Intelligence Integration**: External source correlation effectiveness

## Implementation Guidance

### Coverage Assessment Best Practices
1. **Regular Assessment**: Conduct quarterly coverage evaluations
2. **Gap Prioritization**: Focus on high-impact, frequently used techniques
3. **Detection Validation**: Test and validate detection rules regularly
4. **Threat Landscape Alignment**: Align coverage with current threat trends
5. **Continuous Improvement**: Implement iterative enhancement processes

### Integration Recommendations
1. **SIEM Integration**: Connect MITRE mappings to security event correlation
2. **Threat Intelligence**: Integrate with external threat intelligence feeds
3. **Incident Response**: Incorporate MITRE analysis into IR workflows
4. **Hunt Operations**: Use MITRE framework for threat hunting campaigns
5. **Training Programs**: Educate analysts on MITRE ATT&CK usage

### Reporting and Communication
1. **Executive Reporting**: Focus on coverage percentages and risk metrics
2. **Technical Analysis**: Provide detailed technique analysis and recommendations
3. **Gap Analysis**: Highlight priority areas for security investment
4. **Trend Analysis**: Track coverage improvements and threat evolution
5. **Compliance Mapping**: Align MITRE coverage with regulatory requirements

All operations maintain comprehensive audit trails and provide detailed documentation suitable for threat analysis, security improvement, and regulatory compliance requirements in cybersecurity operations aligned with the MITRE ATT&CK framework.
