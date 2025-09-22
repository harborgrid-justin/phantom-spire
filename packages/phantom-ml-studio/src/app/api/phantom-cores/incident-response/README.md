# Incident Response API Documentation

## Overview
This directory contains the refactored Incident Response API for the Phantom Incident Response Core, broken down into smaller, more manageable modules for better maintainability and code organization. The API provides comprehensive incident response capabilities including incident management, team coordination, response analytics, and automated workflow orchestration.

## File Structure

```
src/app/api/phantom-cores/incident-response/
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

#### GET /api/phantom-cores/incident-response?operation=status
Returns comprehensive incident response system status and metrics.

**Response:**
- System status and uptime
- Active incident counts and response performance
- Team status and resource allocation
- SLA compliance and resolution rates

#### GET /api/phantom-cores/incident-response?operation=incidents
Returns list of active and recent incidents.

**Response:**
- Total incident count
- Detailed incident information (ID, title, severity, status)
- Assignment information and affected assets
- Indicator and timeline entry counts

#### GET /api/phantom-cores/incident-response?operation=timeline&incident_id=INC-2024-001
Returns detailed timeline for a specific incident.

**Parameters:**
- `incident_id` (optional): Specific incident ID to retrieve timeline for

**Response:**
- Incident ID and timeline events
- Event timestamps, descriptions, and severity levels
- Analyst assignments and artifact references

#### GET /api/phantom-cores/incident-response?operation=playbooks
Returns available incident response playbooks.

**Response:**
- Total playbook count
- Playbook details (name, description, triggers, automation level)
- Step counts and usage statistics

#### GET /api/phantom-cores/incident-response?operation=metrics
Returns incident response performance metrics and analytics.

**Response:**
- Response time metrics (detection, response, containment)
- Incident trends and statistics
- Team performance indicators
- SLA compliance metrics

### POST Operations

#### POST /api/phantom-cores/incident-response
Performs various incident response operations based on the `operation` parameter.

**Operations:**

##### analyze-incident
Performs comprehensive incident analysis and assessment.

**Request Body:**
```json
{
  "operation": "analyze-incident",
  "incident_type": "security_breach",
  "severity_level": "HIGH"
}
```

**Response:**
- Analysis ID and incident profile
- Response metrics and time estimates
- Containment actions and recommendations
- Confidence scores and status updates

##### initiate-response
Initiates full incident response activation and team assembly.

**Request Body:**
```json
{
  "operation": "initiate-response",
  "response_level": "full_activation"
}
```

**Response:**
- Response ID and activation status
- Team assembly information
- Communication channels and coordination points
- Milestone timelines and next steps

##### coordinate-team
Coordinates multi-team incident response efforts.

**Request Body:**
```json
{
  "operation": "coordinate-team",
  "teams": ["technical_response", "communications", "legal", "management"]
}
```

**Response:**
- Coordination ID and status
- Resource allocation and team assignments
- Communication channels and reporting schedules
- Current priorities and action items

##### generate-incident-report
Generates comprehensive incident analysis and post-mortem reports.

**Request Body:**
```json
{
  "operation": "generate-incident-report",
  "report_type": "Post-Incident Analysis Report",
  "compliance_requirements": ["SOX", "GDPR", "HIPAA"]
}
```

**Response:**
- Report ID and metadata
- Incident summary and timeline analysis
- Key findings and lessons learned
- Compliance notes and recommendations
- Download URL for full report

##### Legacy Operations
The API maintains backward compatibility with legacy operations:

###### create
Creates a new incident record.

**Request Body:**
```json
{
  "operation": "create",
  "title": "New Security Incident",
  "severity": "MEDIUM"
}
```

###### update
Updates an existing incident.

**Request Body:**
```json
{
  "operation": "update",
  "incident_id": "INC-2024-001",
  "status": "investigating",
  "updates": {...}
}
```

###### escalate
Escalates an incident to higher tier support.

**Request Body:**
```json
{
  "operation": "escalate",
  "incident_id": "INC-2024-001",
  "reason": "Complexity requires senior review"
}
```

###### contain
Applies containment actions to an incident.

**Request Body:**
```json
{
  "operation": "contain",
  "incident_id": "INC-2024-001"
}
```

## Architecture Components

### Types (`types.ts`)
Defines TypeScript interfaces for:
- `IncidentResponseStatus`: System status and metrics
- `Incident`: Individual incident information
- `TimelineEvent`: Timeline event details
- `Playbook`: Response playbook definitions
- `ResponseMetrics`: Performance analytics
- Request interfaces for all operations
- `ApiResponse`: Standardized API response format

### Utilities (`utils.ts`)
Provides helper functions for:
- Standardized API response creation
- ID generation (incidents, analyses, responses, reports)
- Random data generation for mock responses
- Time and date utilities
- Error handling and logging
- Common constants (severity levels, statuses, response teams)

### GET Handlers (`handlers/get-handlers.ts`)
Implements handlers for:
- `handleStatus()`: System status and health metrics
- `handleIncidents()`: Active incident listings
- `handleTimeline()`: Incident timeline details
- `handlePlaybooks()`: Available response playbooks
- `handleMetrics()`: Performance analytics

### POST Handlers (`handlers/post-handlers.ts`)
Implements handlers for:
- `handleAnalyzeIncident()`: Incident analysis operations
- `handleInitiateResponse()`: Response activation
- `handleCoordinateTeam()`: Team coordination
- `handleGenerateIncidentReport()`: Report generation
- Legacy handlers for backward compatibility

## Key Features

### Incident Management
- Automated incident creation and classification
- Real-time status tracking and updates
- Multi-tier escalation workflows
- Evidence and artifact management
- Chain of custody maintenance

### Team Coordination
- Multi-team response coordination
- Resource allocation and scheduling
- Communication channel management
- Role-based access and permissions
- Real-time collaboration tools

### Response Analytics
- Performance metrics and KPIs
- Response time analysis
- SLA compliance monitoring
- Trend analysis and forecasting
- Executive dashboards

### Automated Workflows
- Playbook-driven responses
- Automated containment actions
- Integration with security tools
- Notification and alerting systems
- Compliance reporting automation

## Benefits of Refactoring

1. **Modularity**: Each handler focuses on specific incident response operations
2. **Maintainability**: Changes to individual operations don't affect others
3. **Type Safety**: Centralized type definitions ensure API consistency
4. **Code Organization**: Related functionality is logically grouped
5. **Testing**: Individual handlers can be unit tested in isolation
6. **Reusability**: Utility functions can be shared across handlers
7. **Error Handling**: Consistent error handling and logging
8. **Scalability**: Easy to add new operations and extend functionality

## Usage Examples

### Getting System Status
```javascript
const response = await fetch('/api/phantom-cores/incident-response?operation=status');
const data = await response.json();
console.log('IR system status:', data.data.status);
```

### Analyzing an Incident
```javascript
const response = await fetch('/api/phantom-cores/incident-response', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'analyze-incident',
    incident_type: 'security_breach',
    severity_level: 'HIGH'
  })
});
const analysis = await response.json();
console.log('Incident analysis:', analysis.data);
```

### Initiating Response
```javascript
const response = await fetch('/api/phantom-cores/incident-response', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'initiate-response',
    response_level: 'full_activation'
  })
});
const activation = await response.json();
console.log('Response activation:', activation.data);
```

### Coordinating Teams
```javascript
const response = await fetch('/api/phantom-cores/incident-response', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'coordinate-team',
    teams: ['technical_response', 'communications', 'legal']
  })
});
const coordination = await response.json();
console.log('Team coordination:', coordination.data);
```

### Generating Reports
```javascript
const response = await fetch('/api/phantom-cores/incident-response', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'generate-incident-report',
    report_type: 'Post-Incident Analysis Report',
    compliance_requirements: ['SOX', 'GDPR']
  })
});
const report = await response.json();
console.log('Generated report:', report.data);
```

## Incident Severity Levels

- **CRITICAL**: Immediate threat to business operations or data
- **HIGH**: Significant security impact requiring urgent response
- **MEDIUM**: Moderate security concern with manageable impact
- **LOW**: Minor security issue with minimal impact
- **INFORMATIONAL**: Awareness-only security information

## Response Team Types

- **Technical Response**: Core incident analysis and containment
- **Communications**: Internal and external communications
- **Legal**: Legal and compliance coordination
- **Management**: Executive oversight and decision making
- **Forensics**: Digital forensics and evidence collection
- **Compliance**: Regulatory and audit coordination
- **HR**: Human resources and personnel matters
- **Public Relations**: Media and public communication

## Performance Metrics

### Response Time KPIs
- **Mean Time to Detection (MTTD)**: Average time to detect incidents
- **Mean Time to Response (MTTR)**: Average time to begin response
- **Mean Time to Containment (MTTC)**: Average time to contain threats
- **Mean Time to Recovery (MTTR)**: Average time to full recovery

### Quality Metrics
- **SLA Compliance**: Percentage of incidents meeting SLA targets
- **False Positive Rate**: Percentage of incidents classified incorrectly
- **Escalation Rate**: Percentage of incidents requiring escalation
- **Customer Satisfaction**: Post-incident feedback scores

## Compliance and Reporting

The API supports comprehensive compliance reporting for various regulatory frameworks:

- **SOX (Sarbanes-Oxley)**: Financial reporting and controls
- **GDPR (General Data Protection Regulation)**: Data privacy incidents
- **HIPAA (Health Insurance Portability and Accountability Act)**: Healthcare data
- **PCI DSS (Payment Card Industry Data Security Standard)**: Payment data
- **ISO 27001**: Information security management
- **NIST Cybersecurity Framework**: Risk management and response

All operations maintain detailed audit trails and provide legally defensible documentation suitable for regulatory compliance, internal audits, and post-incident analysis.
