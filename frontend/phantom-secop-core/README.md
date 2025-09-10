# Phantom SecOp Core

Advanced Security Operations (SecOps) engine for comprehensive incident response, automation, and security orchestration.

## Overview

Phantom SecOp Core is a comprehensive security operations platform that provides:

- **Incident Management**: Complete incident lifecycle management from detection to resolution
- **Alert Processing**: Advanced alert correlation and management capabilities
- **Playbook Automation**: Automated response playbooks and workflow execution
- **Task Management**: Security task assignment and tracking
- **Evidence Management**: Chain of custody and forensic evidence handling
- **Security Metrics**: Comprehensive analytics and reporting
- **Compliance Monitoring**: Framework compliance tracking and reporting
- **Integration Support**: Extensible integration framework for security tools

## Features

### Core Capabilities

- **Incident Response**: Full incident lifecycle management with timeline tracking
- **Alert Correlation**: Advanced pattern matching and indicator correlation
- **Automated Playbooks**: Configurable response automation and orchestration
- **Evidence Chain**: Cryptographic evidence integrity and chain of custody
- **Security Analytics**: Real-time metrics and performance dashboards
- **Compliance Reporting**: Multi-framework compliance monitoring and reporting

### Key Components

- **SecOpCore**: Main engine class providing all security operations functionality
- **Incident Management**: Create, update, search, and manage security incidents
- **Alert Processing**: Handle security alerts with correlation and enrichment
- **Playbook Execution**: Automated response workflows and task orchestration
- **Evidence Handling**: Secure evidence collection and chain of custody management
- **Metrics Generation**: Comprehensive security metrics and KPI tracking
- **Dashboard Creation**: Real-time security operations dashboards

## Installation

```bash
npm install phantom-secop-core
```

## Usage

### Basic Usage

```typescript
import SecOpCore from 'phantom-secop-core';

// Initialize the SecOp engine
const secOp = new SecOpCore();

// Create a security incident
const incidentId = secOp.createIncident(
  'Suspicious Network Activity',
  'Unusual outbound traffic detected',
  'NetworkIntrusion',
  'High'
);

// Create and manage alerts
const alertId = secOp.createAlert(
  'Malware Detection',
  'Potential malware on endpoint',
  'Critical',
  'Endpoint Detection'
);

// Update alert status
secOp.updateAlertStatus(alertId, 'Acknowledged', 'john.doe');

// Execute automated response playbook
const playbookId = secOp.createPlaybook(
  'Malware Response',
  'Automated malware containment and investigation',
  'Incident Response'
);
const executionId = secOp.executePlaybook(playbookId, 'system', 'malware_detected');

// Create investigation tasks
const taskId = secOp.createTask(
  'Investigate Malware Alert',
  'Analyze the detected malware and determine scope',
  'Investigation',
  'High'
);

// Add evidence to investigation
const evidenceId = secOp.addEvidence(
  'Suspicious File Sample',
  'Quarantined file from infected endpoint',
  'FileSystem',
  'endpoint-001',
  'security.analyst'
);

// Generate comprehensive security metrics
const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const endDate = new Date().toISOString();
const metrics = secOp.generateSecurityMetrics(startDate, endDate);
```

### Advanced Features

```typescript
// Search incidents with advanced filters
const criticalIncidents = secOp.searchIncidents(
  'malware', 
  'InProgress', 
  'Critical'
);

// Search alerts by criteria
const highPriorityAlerts = secOp.searchAlerts(
  'suspicious',
  'High',
  'Open'
);

// Get all active alerts (open, acknowledged, in progress)
const activeAlerts = secOp.getActiveAlerts();

// Create and execute workflows
const workflowId = secOp.createWorkflow(
  'Incident Response Automation',
  'Automated incident response and escalation workflow',
  'incident_created'
);

const workflowContext = JSON.stringify({
  incident_id: incidentId,
  severity: 'High',
  auto_escalate: true
});
const workflowExecutionId = secOp.executeWorkflow(workflowId, workflowContext);

// Monitor playbook execution
const executionStatus = secOp.getPlaybookExecutionStatus(executionId);

// Track evidence chain of custody
const chainOfCustody = secOp.getEvidenceChainOfCustody(evidenceId);

// Update task progress
secOp.updateTaskStatus(taskId, 'InProgress', 'analyst.smith');
```

## API Reference

The Phantom SecOp Core now provides **22 comprehensive NAPI methods** (4 original + 18 new business-ready modules):

### Core Incident Management (4 methods)
- `createIncident(title, description, category, severity)` - Create a new security incident
- `getIncident(id)` - Retrieve incident details by ID  
- `updateIncidentStatus(id, status, actor)` - Update incident status with timeline tracking
- `generateSecurityMetrics(startDate, endDate)` - Generate comprehensive security metrics

### Alert Management (3 methods)
- `createAlert(title, description, priority, source)` - Create a new security alert
- `getAlert(id)` - Retrieve alert details by ID
- `updateAlertStatus(id, status, assignedTo)` - Update alert status and assignment

### Playbook Management (4 methods) 
- `createPlaybook(name, description, category)` - Create a new response playbook
- `getPlaybook(id)` - Retrieve playbook details by ID
- `executePlaybook(playbookId, triggeredBy, triggerEvent)` - Execute a playbook
- `getPlaybookExecutionStatus(executionId)` - Monitor playbook execution progress

### Task Management (3 methods)
- `createTask(title, description, taskType, priority)` - Create security investigation/response tasks
- `getTask(id)` - Retrieve task details by ID
- `updateTaskStatus(id, status, actor)` - Update task status and progress

### Evidence Management (3 methods)
- `addEvidence(name, description, evidenceType, source, collectedBy)` - Add evidence with metadata
- `getEvidence(id)` - Retrieve evidence details by ID
- `getEvidenceChainOfCustody(id)` - Track evidence handling history

### Search & Analytics (3 methods)
- `searchIncidents(query, status?, severity?)` - Advanced incident search with filters
- `searchAlerts(query, priority?, status?)` - Advanced alert search with filters
- `getActiveAlerts()` - Retrieve all open/acknowledged/in-progress alerts

### Workflow Management (2 methods)
- `createWorkflow(name, description, triggerType)` - Create automation workflows
- `executeWorkflow(workflowId, context)` - Execute workflows with context data

## Types and Enums

The package includes comprehensive TypeScript types and enums:

- `IncidentSeverity`: Low, Medium, High, Critical
- `IncidentStatus`: New, Assigned, InProgress, Investigating, Contained, etc.
- `IncidentCategory`: Malware, Phishing, DataBreach, NetworkIntrusion, etc.
- `AlertPriority`: Info, Low, Medium, High, Critical
- `AlertStatus`: Open, Acknowledged, InProgress, Resolved, Closed, FalsePositive
- `PlaybookStatus`: Pending, Running, Paused, Completed, Failed, Cancelled
- `TaskStatus`: Pending, InProgress, Completed, Failed, Skipped, Cancelled

## Architecture

The Phantom SecOp Core is built with a hybrid Rust + TypeScript architecture:

- **Rust Core**: High-performance security operations engine
- **TypeScript Wrapper**: Web-compatible API layer
- **WASM Integration**: Browser-compatible execution
- **Modular Design**: Extensible plugin architecture

## Performance

- **High Throughput**: Handles thousands of incidents and alerts
- **Low Latency**: Sub-millisecond response times for core operations
- **Memory Efficient**: Optimized data structures and algorithms
- **Scalable**: Horizontal scaling support for enterprise deployments

## Security

- **Cryptographic Integrity**: Evidence chain verification
- **Audit Logging**: Complete audit trail for all operations
- **Access Control**: Role-based access control integration
- **Data Protection**: Encryption at rest and in transit

## License

MIT License - see LICENSE file for details.

## Support

