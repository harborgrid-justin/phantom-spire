# Phantom IOC Core - Business Ready Edition

A comprehensive IOC (Indicator of Compromise) processing library with advanced threat intelligence capabilities and 12 business-ready modules.

## Overview

Phantom IOC Core is a high-performance, production-ready security library built in Rust with Node.js bindings through napi-rs. This enhanced version provides 12 additional business modules designed for enterprise security operations.

## Core Features

- **IOC Processing**: Advanced indicator analysis and threat intelligence
- **12 Business Modules**: Comprehensive security operations capabilities
- **High Performance**: Built in Rust for maximum speed and reliability
- **Node.js Integration**: Seamless integration with JavaScript/TypeScript applications
- **Production Ready**: Enterprise-grade security and reliability

## Business Modules

### 1. Alert Management
- **Purpose**: Security alert lifecycle management and notifications
- **Key Features**:
  - Create, update, and manage security alerts
  - Alert severity classification (Info, Low, Medium, High, Critical)
  - Notification preferences and routing
  - Alert metrics and analytics
  - Evidence attachment and tracking

### 2. Compliance Management
- **Purpose**: Regulatory compliance tracking and reporting
- **Key Features**:
  - Support for major frameworks (SOX, GDPR, HIPAA, PCI-DSS, SOC2, ISO27001, NIST, CIS)
  - Compliance control management
  - Audit tracking and findings management
  - Compliance reporting and metrics
  - Remediation planning and tracking

### 3. Dashboard Analytics
- **Purpose**: Business intelligence and security metrics
- **Key Features**:
  - Real-time security metrics tracking
  - Performance monitoring and analytics
  - Threat trend analysis
  - Custom dashboard creation
  - Widget-based analytics display
  - Comprehensive reporting capabilities

### 4. Incident Response
- **Purpose**: Security incident management and coordination
- **Key Features**:
  - Incident lifecycle management
  - Evidence collection and chain of custody
  - Timeline tracking and documentation
  - Response action management
  - Playbook templates and automation
  - Incident metrics and reporting

### 5. Threat Hunting
- **Purpose**: Proactive threat detection and investigation
- **Key Features**:
  - Hypothesis-driven threat hunting
  - Multi-source data correlation
  - Finding documentation and tracking
  - Threat hunting techniques library
  - Hunt campaign management

### 6. Asset Management
- **Purpose**: Security asset inventory and vulnerability tracking
- **Key Features**:
  - Comprehensive asset inventory
  - Vulnerability assessment integration
  - Asset criticality classification
  - Security coverage monitoring
  - Asset discovery and tracking

### 7. User Activity Monitoring
- **Purpose**: User behavior analysis and anomaly detection
- **Key Features**:
  - User activity logging and analysis
  - Risk scoring for user behaviors
  - Anomaly detection and alerting
  - Activity timeline reconstruction
  - Behavioral pattern analysis

### 8. Network Security
- **Purpose**: Network-based threat detection and monitoring
- **Key Features**:
  - Network threat detection
  - Traffic analysis and monitoring
  - Threat blocking and mitigation
  - Network security metrics
  - Real-time threat intelligence

### 9. Digital Forensics
- **Purpose**: Digital investigation and evidence management
- **Key Features**:
  - Forensic case management
  - Evidence collection and preservation
  - Chain of custody tracking
  - Investigation timeline management
  - Digital artifact analysis

### 10. Risk Assessment
- **Purpose**: Security risk evaluation and scoring
- **Key Features**:
  - Risk assessment framework
  - Likelihood and impact analysis
  - Risk scoring algorithms
  - Mitigation planning
  - Risk metrics and reporting

### 11. Security Reporting
- **Purpose**: Comprehensive security report generation
- **Key Features**:
  - Executive summary generation
  - Detailed findings documentation
  - Recommendation tracking
  - Custom report templates
  - Scheduled reporting capabilities

### 12. Integration Management
- **Purpose**: Third-party security tool integration
- **Key Features**:
  - API connector management
  - Data synchronization
  - Integration health monitoring
  - Configuration management
  - Error handling and retry logic

## Installation

```bash
npm install phantom-ioc-core
```

## Usage

### Basic IOC Processing

```javascript
const { IOCCore } = require('phantom-ioc-core');

const core = new IOCCore();

const ioc = {
  indicator_type: "IPAddress",
  value: "192.168.1.100",
  confidence: 0.85,
  severity: "High",
  source: "threat_feed",
  tags: ["malware", "c2"]
};

const result = core.process_ioc(JSON.stringify(ioc));
console.log(JSON.parse(result));
```

### Business Module Usage

```javascript
const { 
  AlertManager, 
  ComplianceManager, 
  DashboardAnalytics,
  IncidentResponseManager 
} = require('phantom-ioc-core');

// Alert Management
const alertManager = new AlertManager();
const alertId = alertManager.create_alert(JSON.stringify({
  title: "Suspicious Network Activity",
  description: "Unusual outbound connections detected",
  alert_type: "SecurityIncident",
  severity: "High",
  source: "network_monitor"
}));

// Compliance Management
const complianceManager = new ComplianceManager();
const controlId = complianceManager.create_control(JSON.stringify({
  control_id: "SOC2-CC1.1",
  name: "Access Management",
  framework: "SOC2",
  status: "Compliant"
}));

// Dashboard Analytics
const analytics = new DashboardAnalytics();
analytics.record_security_metrics(JSON.stringify({
  threats_detected: 25,
  threats_blocked: 23,
  incidents_resolved: 5,
  compliance_score: 0.92
}));
```

## Performance

- **High Throughput**: Process thousands of IOCs per second
- **Low Latency**: Sub-millisecond response times for most operations
- **Memory Efficient**: Optimized memory usage for large-scale deployments
- **Concurrent Processing**: Thread-safe operations for parallel processing

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Testing

```bash
# Run Rust tests
cargo test

# Build and test Node.js module
npm run build:debug
npm test
```

## License

MIT License