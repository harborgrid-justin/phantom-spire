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
const incident = secOp.createIncident({
  title: 'Suspicious Network Activity',
  description: 'Unusual outbound traffic detected',
  category: IncidentCategory.NetworkIntrusion,
  severity: IncidentSeverity.High,
  status: IncidentStatus.New,
  // ... other incident properties
});

// Create and correlate alerts
const alert = secOp.createAlert({
  title: 'Malware Detection',
  description: 'Potential malware on endpoint',
  priority: AlertPriority.Critical,
  status: AlertStatus.Open,
  // ... other alert properties
});

// Execute automated response playbook
const execution = secOp.executePlaybook('malware-response-pb', incident.id);

// Generate security metrics
const metrics = secOp.generateSecurityMetrics();

// Create security dashboard
const dashboard = secOp.generateSecurityDashboard();
```

### Advanced Features

```typescript
// Search incidents with filters
const incidents = secOp.searchIncidents({
  severity: IncidentSeverity.Critical,
  status: IncidentStatus.Open,
  category: IncidentCategory.DataBreach,
  date_range: {
    start: '2024-01-01',
    end: '2024-12-31'
  }
});

// Correlate multiple alerts
const correlation = secOp.correlateAlerts(['alert-1', 'alert-2', 'alert-3']);

// Create evidence chain
const evidenceChain = secOp.createEvidenceChain(['evidence-1', 'evidence-2']);

// Generate incident report
const report = secOp.generateIncidentReport(incident.id);

// Create automation rules
const rule = secOp.createAutomationRule({
  name: 'Auto-Escalate Critical Incidents',
  description: 'Automatically escalate critical incidents',
  enabled: true,
  trigger_conditions: [
    {
      condition_type: 'severity',
      field: 'severity',
      operator: 'equals',
      value: 'Critical',
      case_sensitive: false
    }
  ],
  actions: [
    {
      id: 'escalate-action',
      name: 'Escalate Incident',
      action_type: ActionType.Escalation,
      description: 'Escalate to senior analyst',
      order: 1,
      required: true,
      timeout_seconds: 300,
      retry_count: 3,
      parameters: {
        escalation_level: '2',
        notify_manager: 'true'
      },
      conditions: [],
      on_success: [],
      on_failure: []
    }
  ]
});
```

## API Reference

### Core Methods

#### Incident Management
- `createIncident(incident)` - Create a new security incident
- `updateIncident(id, updates)` - Update an existing incident
- `getIncident(id)` - Retrieve incident by ID
- `getAllIncidents()` - Get all incidents
- `searchIncidents(filters)` - Search incidents with filters

#### Alert Management
- `createAlert(alert)` - Create a new security alert
- `updateAlert(id, updates)` - Update an existing alert
- `getAlert(id)` - Retrieve alert by ID
- `getAllAlerts()` - Get all alerts
- `correlateAlerts(alertIds)` - Correlate multiple alerts

#### Playbook Management
- `createPlaybook(playbook)` - Create a new response playbook
- `executePlaybook(playbookId, incidentId)` - Execute a playbook
- `getPlaybook(id)` - Retrieve playbook by ID
- `getAllPlaybooks()` - Get all playbooks

#### Task Management
- `createTask(task)` - Create a new security task
- `assignTask(taskId, assigneeId)` - Assign task to analyst
- `updateTask(id, updates)` - Update task status
- `getTask(id)` - Retrieve task by ID
- `getAllTasks()` - Get all tasks

#### Evidence Management
- `addEvidence(evidence)` - Add new evidence
- `createEvidenceChain(evidenceIds)` - Create evidence chain
- `getEvidence(id)` - Retrieve evidence by ID
- `getAllEvidence()` - Get all evidence

#### Analytics & Reporting
- `generateSecurityMetrics()` - Generate comprehensive security metrics
- `generateIncidentReport(incidentId)` - Create detailed incident report
- `generateSecurityDashboard()` - Create real-time security dashboard

#### Automation & Integration
- `createAutomationRule(rule)` - Create automation rule
- `executeAutomationRule(ruleId, context)` - Execute automation rule
- `createIntegration(integration)` - Create system integration

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

