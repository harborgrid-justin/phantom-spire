# Hunting API Documentation

## Overview
This directory contains the refactored Hunting API for the Phantom Hunting Core, broken down into smaller, more manageable modules for better maintainability and code organization. The API provides comprehensive threat hunting capabilities including proactive security operations, hypothesis analysis, IOC tracking, and hunt reporting.

## File Structure

```
src/app/api/phantom-cores/hunting/
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

#### GET /api/phantom-cores/hunting?operation=status
Returns comprehensive hunting system status and capabilities.

**Response:**
- System status and component health
- Hunt metrics (uptime, active hunts, success rates)
- System overview (capabilities, accuracy, false positive rates)
- Hunt statistics (total conducted, threats identified, IOCs tracked)
- Current active hunts with progress
- Capability matrix across hunting disciplines

#### GET /api/phantom-cores/hunting?operation=hunts
Returns active threat hunts and hunting campaign data.

**Response:**
- Active hunts with detailed information
- Hunt progress, threat levels, and confidence scores
- Hunt hypotheses and IOC findings
- Completed hunt statistics
- Total threats found across all hunts

#### GET /api/phantom-cores/hunting?operation=analytics
Returns hunt analytics and threat pattern analysis.

**Response:**
- Hunt success trends (7, 30, 90 day periods)
- Threat discovery rates and statistics
- Hunt duration analytics
- Hypothesis validation accuracy
- Detected threat patterns with confidence levels

#### GET /api/phantom-cores/hunting?operation=iocs
Returns IOC tracking data and recent matches.

**Response:**
- Total IOC counts by confidence level
- IOC categorization (file hashes, IPs, domains, etc.)
- Recent IOC matches with hunt context
- Match confidence levels and threat contexts

### POST Operations

#### POST /api/phantom-cores/hunting
Performs various hunting operations based on the `operation` parameter.

**Operations:**

##### conduct-hunt
Executes threat hunting campaigns with specified parameters.

**Request Body:**
```json
{
  "operation": "conduct-hunt",
  "huntData": {
    "hunt_type": "behavioral_anomaly",
    "target_scope": "enterprise_wide",
    "hypothesis": "Advanced persistent threat using living-off-the-land techniques"
  }
}
```

**Response:**
- Analysis ID and hunt profile
- Hunt findings (suspicious activities, IOC matches, anomalies)
- Detailed IOC match information
- Security recommendations based on findings

##### analyze-hypothesis
Performs comprehensive hypothesis analysis and validation.

**Request Body:**
```json
{
  "operation": "analyze-hypothesis",
  "hypothesisData": {
    "hypothesis": "Insider threat using privileged access for data theft"
  }
}
```

**Response:**
- Hypothesis ID and validation results
- Evidence analysis (user behavior, data access, network indicators)
- Risk assessment with threat likelihood
- Recommended security actions

##### track-iocs
Tracks and correlates indicators of compromise across datasets.

**Request Body:**
```json
{
  "operation": "track-iocs",
  "iocData": {
    "ioc_list": ["192.168.1.100", "malicious-domain.com"],
    "tracking_scope": "enterprise_wide"
  }
}
```

**Response:**
- Tracking ID and summary statistics
- IOC analysis by category (file hashes, IPs, domains, registry keys)
- Campaign correlation results
- Threat intelligence enrichment data

##### generate-hunt-report
Generates comprehensive threat hunting campaign reports.

**Request Body:**
```json
{
  "operation": "generate-hunt-report",
  "reportData": {
    "report_type": "Threat Hunting Campaign Report",
    "time_period": "30_days"
  }
}
```

**Response:**
- Report ID and executive summary
- Hunt campaign details and methodologies
- Key findings with severity assessments
- Recommendations and performance metrics

## Architecture Components

### Types (`types.ts`)
Defines TypeScript interfaces for:
- `HuntingStatus`: System status and capability metrics
- `Hunt`: Individual hunt information and progress
- `HuntAnalytics`: Analytics and trend data
- `IOCData`: IOC tracking and match information
- `HuntAnalysis`: Hunt execution results
- `HypothesisAnalysis`: Hypothesis validation results
- `IOCTracking`: IOC correlation and tracking results
- `HuntReport`: Comprehensive hunt reporting data
- Request interfaces for all operations
- `ApiResponse`: Standardized API response format

### Utilities (`utils.ts`)
Provides helper functions for:
- Standardized API response creation
- ID generation (analysis, hypothesis, tracking, report IDs)
- Random data generation for mock responses
- Confidence and threat level calculations
- Error handling and logging
- Common constants (hunt types, threat actors, methodologies)

### GET Handlers (`handlers/get-handlers.ts`)
Implements handlers for:
- `handleStatus()`: System status and health metrics
- `handleHunts()`: Active hunt listings and progress
- `handleAnalytics()`: Hunt performance analytics
- `handleIOCs()`: IOC tracking and match data

### POST Handlers (`handlers/post-handlers.ts`)
Implements handlers for:
- `handleConductHunt()`: Hunt execution operations
- `handleAnalyzeHypothesis()`: Hypothesis analysis and validation
- `handleTrackIOCs()`: IOC tracking and correlation
- `handleGenerateHuntReport()`: Report generation

## Key Features

### Proactive Threat Hunting
- Hypothesis-driven hunting campaigns
- Behavioral anomaly detection
- IOC pattern hunting and correlation
- TTP (Tactics, Techniques, Procedures) tracking
- Timeline reconstruction and analysis

### Hunt Management
- Multi-hunt orchestration and coordination
- Progress tracking and status monitoring
- Hunt success rate measurement
- Threat discovery metrics
- Coverage assessment and optimization

### Evidence Analysis
- User behavior pattern analysis
- Data access anomaly detection
- Network traffic indicator analysis
- System and process behavior evaluation
- Multi-source evidence correlation

### Intelligence Integration
- Threat intelligence feed integration
- IOC enrichment from multiple sources
- Campaign attribution and correlation
- Threat actor profiling and tracking
- Geographic and temporal analysis

### Reporting and Analytics
- Executive summary generation
- Technical hunt reports
- Performance metrics and KPIs
- Trend analysis and forecasting
- Compliance and audit reporting

## Benefits of Refactoring

1. **Modularity**: Each handler focuses on specific hunting operations
2. **Maintainability**: Changes to individual operations don't affect others
3. **Type Safety**: Centralized type definitions ensure API consistency
4. **Code Organization**: Related functionality is logically grouped
5. **Testing**: Individual handlers can be unit tested in isolation
6. **Reusability**: Utility functions can be shared across handlers
7. **Error Handling**: Consistent error handling and logging
8. **Scalability**: Easy to add new hunt types and extend functionality

## Usage Examples

### Getting System Status
```javascript
const response = await fetch('/api/phantom-cores/hunting?operation=status');
const data = await response.json();
console.log('Hunting system status:', data.data.status);
```

### Active Hunts
```javascript
const response = await fetch('/api/phantom-cores/hunting?operation=hunts');
const data = await response.json();
console.log('Active hunts:', data.data.active_hunts);
```

### Hunt Analytics
```javascript
const response = await fetch('/api/phantom-cores/hunting?operation=analytics');
const data = await response.json();
console.log('Hunt analytics:', data.data.hunt_analytics);
```

### IOC Tracking
```javascript
const response = await fetch('/api/phantom-cores/hunting?operation=iocs');
const data = await response.json();
console.log('IOC data:', data.data.tracked_iocs);
```

### Conducting a Hunt
```javascript
const response = await fetch('/api/phantom-cores/hunting', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'conduct-hunt',
    huntData: {
      hunt_type: 'behavioral_anomaly',
      target_scope: 'enterprise_wide',
      hypothesis: 'Advanced persistent threat using living-off-the-land techniques'
    }
  })
});
const huntResults = await response.json();
console.log('Hunt results:', huntResults.data);
```

### Analyzing Hypothesis
```javascript
const response = await fetch('/api/phantom-cores/hunting', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'analyze-hypothesis',
    hypothesisData: {
      hypothesis: 'Insider threat using privileged access for data theft'
    }
  })
});
const analysis = await response.json();
console.log('Hypothesis analysis:', analysis.data);
```

### Tracking IOCs
```javascript
const response = await fetch('/api/phantom-cores/hunting', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'track-iocs',
    iocData: {
      ioc_list: ['192.168.1.100', 'malicious-domain.com'],
      tracking_scope: 'enterprise_wide'
    }
  })
});
const tracking = await response.json();
console.log('IOC tracking:', tracking.data);
```

### Generating Hunt Report
```javascript
const response = await fetch('/api/phantom-cores/hunting', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'generate-hunt-report',
    reportData: {
      report_type: 'Threat Hunting Campaign Report',
      time_period: '30_days'
    }
  })
});
const report = await response.json();
console.log('Hunt report:', report.data);
```

## Hunt Types and Methodologies

### Hunt Types
- **Behavioral Anomaly**: User and system behavior analysis
- **IOC Hunting**: Known indicator pattern matching
- **TTP Tracking**: Tactics, techniques, procedures correlation
- **Insider Threat**: Internal threat detection and analysis
- **Lateral Movement**: Network traversal and privilege escalation
- **Data Exfiltration**: Data theft and unauthorized transfer detection
- **Privilege Escalation**: Rights elevation and abuse detection
- **Persistence Hunting**: Long-term access mechanism detection

### Methodologies
- **Behavioral Analysis**: Statistical and machine learning approaches
- **IOC Correlation**: Cross-reference analysis across datasets
- **TTP Mapping**: MITRE ATT&CK framework alignment
- **Timeline Reconstruction**: Chronological event analysis
- **Statistical Analysis**: Quantitative anomaly detection
- **Machine Learning Detection**: AI-driven pattern recognition
- **Anomaly Detection**: Deviation from baseline behavior
- **Pattern Recognition**: Threat signature identification

### Data Sources
- **Network Traffic Logs**: Communication pattern analysis
- **Endpoint Telemetry**: System and process monitoring
- **User Behavior Analytics**: Access pattern analysis
- **Security Event Logs**: Security tool aggregation
- **DNS Logs**: Domain resolution tracking
- **Proxy Logs**: Web traffic inspection
- **Active Directory Logs**: Authentication and authorization
- **System Process Logs**: Operating system activity

## Threat Levels and Classifications

### Threat Levels
- **CRITICAL**: Immediate threat requiring urgent response
- **HIGH**: Significant threat requiring prompt attention
- **MEDIUM**: Moderate threat with manageable timeline
- **LOW**: Minor threat for routine investigation

### Hunt Statuses
- **ACTIVE**: Currently executing hunt operations
- **COMPLETED**: Successfully finished hunt campaign
- **PAUSED**: Temporarily suspended hunt activities
- **CANCELLED**: Terminated hunt due to various factors

### Evidence Strength
- **CONCLUSIVE**: Definitive evidence of threat activity
- **HIGH**: Strong evidence with high confidence
- **MEDIUM**: Moderate evidence requiring additional validation
- **LOW**: Weak evidence requiring significant confirmation

### Validation Status
- **VALIDATED**: Hypothesis confirmed by evidence
- **REFUTED**: Hypothesis disproven by evidence
- **PENDING**: Analysis ongoing, results inconclusive
- **INSUFFICIENT_DATA**: Not enough evidence for determination

## Performance Metrics

### Hunt Effectiveness KPIs
- **Hunt Success Rate**: Percentage of hunts identifying threats
- **Threat Discovery Rate**: Average threats found per time period
- **Detection Accuracy**: True positive rate for hunt results
- **False Positive Rate**: Incorrect threat identification rate
- **Coverage Percentage**: Scope of environment monitored
- **Mean Time to Detection**: Average time to identify threats

### Quality Metrics
- **Hypothesis Accuracy**: Percentage of validated hypotheses
- **IOC Match Confidence**: Average confidence in IOC correlations
- **Evidence Strength**: Quality assessment of collected evidence
- **Attribution Confidence**: Certainty in threat actor identification
- **Campaign Correlation**: Success rate in linking related activities

## Hunt Campaign Planning

### Campaign Objectives
- **Detect Advanced Persistent Threats**: Long-term, sophisticated attacks
- **Identify Insider Threat Indicators**: Internal threat detection
- **Validate Threat Intelligence Feeds**: Confirm intelligence accuracy
- **Improve Detection Capabilities**: Enhance security monitoring
- **Assess Security Control Effectiveness**: Validate defensive measures
- **Investigate Specific Threat Scenarios**: Targeted hunt activities

### Success Criteria
- **Threat Identification**: Discovery of previously unknown threats
- **False Positive Reduction**: Improved signal-to-noise ratio
- **Detection Time Improvement**: Faster threat identification
- **Coverage Enhancement**: Expanded monitoring scope
- **Intelligence Validation**: Confirmed threat intelligence accuracy
- **Control Gap Identification**: Discovery of security weaknesses

All operations maintain comprehensive audit trails and provide detailed documentation suitable for threat analysis, security improvement, and regulatory compliance requirements in cybersecurity operations.
