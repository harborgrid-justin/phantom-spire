# XDR Management Dashboard

## Overview
This directory contains the refactored XDR (Extended Detection and Response) Management Dashboard, broken down into smaller, more manageable files for better maintainability and code organization. The dashboard provides comprehensive enterprise XDR capabilities for threat detection, incident investigation, and threat hunting.

## File Structure

```
src/app/phantom-cores/xdr/
├── page.tsx                        # Main dashboard component
├── types.ts                        # TypeScript interfaces and types
├── api.ts                          # API functions for XDR operations
├── components/
│   ├── index.ts                   # Component exports
│   ├── XDRSystemOverview.tsx      # System status and metrics overview
│   ├── ThreatDetectionPanel.tsx   # Advanced threat detection interface
│   └── XDROperationsPanel.tsx     # XDR operations execution panel
└── README.md                      # This file
```

## Components

### Main Dashboard (`page.tsx`)
- Contains the main layout and header
- Manages XDR system status loading and error states
- Imports and orchestrates the three main components

### Types (`types.ts`)
- `XDRSystemStatus`: Interface for system status and comprehensive metrics
- `ThreatAnalysis`: Interface for threat detection analysis results
- `ThreatDetectionRequest`: Request parameters for threat detection
- `IncidentInvestigationRequest`: Request parameters for incident investigation
- `ThreatHuntRequest`: Request parameters for threat hunting operations
- `XDROperation`: Interface for operation definitions

### API Functions (`api.ts`)
- `fetchXDRStatus()`: Retrieves comprehensive XDR system status and metrics
- `performThreatDetection()`: Executes advanced threat detection analysis
- `investigateIncident()`: Conducts forensic incident investigation
- `conductThreatHunt()`: Performs proactive threat hunting operations

### Components

#### XDRSystemOverview (`components/XDRSystemOverview.tsx`)
- Displays comprehensive system health and operational status
- Shows performance metrics (events/sec, detection latency, response time)
- Provides threat landscape overview (active, blocked, investigated threats)
- Displays enterprise coverage metrics (endpoints, sensors, cloud integrations)

#### ThreatDetectionPanel (`components/ThreatDetectionPanel.tsx`)
- Advanced threat detection interface with configurable analysis scope
- Support for multiple detection engines:
  - Behavioral analysis
  - ML-based anomaly detection
  - Signature-based detection
  - Threat intelligence correlation
- Displays comprehensive threat analysis results with priority categorization
- Provides actionable security recommendations

#### XDROperationsPanel (`components/XDROperationsPanel.tsx`)
- Executes core XDR operations:
  - **Incident Investigation**: Comprehensive forensic analysis with 72-hour timeline
  - **Threat Hunting**: Proactive hunting with APT-focused hypotheses and MITRE ATT&CK techniques
- Displays operation results in expandable format
- Real-time operation status and progress tracking

## Key Features

### System Monitoring
- Real-time system health and operational status
- Performance metrics tracking and visualization
- Enterprise-wide coverage monitoring
- Threat landscape overview and analytics

### Advanced Threat Detection
- Multi-engine detection capabilities
- Configurable analysis scope (Enterprise, Network Perimeter, Endpoint, Cloud)
- Comprehensive threat categorization (Critical, High, Medium priority)
- ML-enhanced anomaly detection
- Threat intelligence integration

### Incident Investigation
- Forensic analysis with configurable depth
- 72-hour timeline analysis by default
- Comprehensive security alert investigation
- Evidence collection and correlation

### Threat Hunting
- Proactive threat hunting capabilities
- APT-focused hunting hypotheses
- MITRE ATT&CK technique correlation
- Enterprise environment scope
- Living-off-the-land technique detection

## Benefits of Refactoring

1. **Modularity**: Each component handles a specific aspect of XDR operations
2. **Reusability**: Components can be independently reused across different contexts
3. **Maintainability**: Changes to individual XDR features don't affect others
4. **Type Safety**: Centralized type definitions ensure API consistency
5. **Code Organization**: Related XDR functionality is logically grouped
6. **Performance**: Smaller components improve loading and rendering efficiency
7. **Testing**: Individual components can be unit tested in isolation

## Usage

The dashboard provides enterprise-level XDR capabilities:

1. **Monitor XDR Health**: View real-time system status, performance metrics, and coverage
2. **Detect Threats**: Execute comprehensive threat detection with multiple engines
3. **Investigate Incidents**: Conduct forensic analysis of security alerts and incidents
4. **Hunt Threats**: Proactively search for advanced threats using hypothesis-driven hunting
5. **View Analytics**: Access threat landscape analytics and security recommendations

## XDR Capabilities

### Detection Engines
- **Behavioral Analysis**: User and entity behavior analytics (UEBA)
- **ML Anomaly Detection**: Machine learning-based anomaly identification
- **Signature Detection**: Traditional signature-based threat detection
- **Threat Intelligence**: Integration with threat intelligence feeds

### Investigation Features
- **Forensic Analysis**: Deep dive incident investigation capabilities
- **Timeline Reconstruction**: 72-hour incident timeline analysis
- **Evidence Correlation**: Multi-source evidence gathering and correlation
- **Alert Triage**: Priority-based alert classification and handling

### Threat Hunting
- **Hypothesis-Driven**: Structured hunting based on threat hypotheses
- **MITRE ATT&CK**: Integration with MITRE ATT&CK framework techniques
- **Living-off-the-Land**: Detection of legitimate tool abuse
- **APT Focus**: Advanced persistent threat hunting capabilities

All operations integrate with the phantom-xdr-core backend system for enterprise-grade extended detection and response capabilities.
