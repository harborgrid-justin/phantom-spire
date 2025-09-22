# XDR API Documentation

## Overview
This directory contains the refactored XDR (Extended Detection and Response) API for the Phantom XDR Core, broken down into smaller, more manageable modules for better maintainability and code organization. The API provides comprehensive enterprise XDR capabilities including threat detection, incident investigation, threat hunting, response orchestration, and behavioral analysis.

## File Structure

```
src/app/api/phantom-cores/xdr/
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

#### GET /api/phantom-cores/xdr?operation=status
Returns comprehensive XDR system status and operational metrics.

**Response:**
- System overview (status, health, uptime, load)
- Performance metrics (events per second, detection latency, response time)
- Threat landscape (active threats, blocked threats, investigated incidents)
- Enterprise coverage (monitored endpoints, network sensors, cloud integrations)
- Component status (endpoint detection, network monitoring, threat intelligence, security orchestration)

#### GET /api/phantom-cores/xdr?operation=health
Returns XDR system health and component diagnostics.

**Response:**
- Overall health assessment
- Component health status (endpoint agents, detection engines, response automation, threat intelligence)
- Performance metrics (CPU, memory, disk, network latency)
- Last health check timestamps

#### GET /api/phantom-cores/xdr?operation=enterprise-status
Returns enterprise-wide XDR deployment and security posture.

**Response:**
- Enterprise deployment metrics (organizations, endpoints, users, geographic distribution, compliance frameworks)
- Threat landscape details (active campaigns, threat actor groups, malware families, attack techniques)
- Security posture assessment (risk score, vulnerabilities, alerts, control effectiveness, compliance score)

#### GET /api/phantom-cores/xdr?operation=statistics
Returns comprehensive XDR operational statistics and analytics.

**Response:**
- Detection statistics (threats detected, false/true positives, accuracy, mean time to detection)
- Response statistics (auto-resolved incidents, manual interventions, response time, containment success)
- Threat intelligence statistics (IOCs processed, threat reports, attribution accuracy, hunt campaigns)

### POST Operations

#### POST /api/phantom-cores/xdr
Performs various XDR operations based on the `operation` parameter.

**Operations:**

##### detect-threats
Executes comprehensive threat detection across the enterprise environment.

**Request Body:**
```json
{
  "operation": "detect-threats",
  "analysisData": {
    "scope": "enterprise_wide"
  }
}
```

**Response:**
- Detection results with unique detection ID
- Threat categorization by severity (critical, high, medium, low)
- Detailed threat categories with indicators (malware, lateral movement, data exfiltration, persistence)
- Detection timeline and processing metrics
- Recommended security actions

##### investigate-incident
Initiates comprehensive incident investigation and forensic analysis.

**Request Body:**
```json
{
  "operation": "investigate-incident",
  "incidentData": {
    "incident_type": "security_alert"
  }
}
```

**Response:**
- Investigation job ID and incident profile
- Attack timeline reconstruction (initial compromise to detection)
- Tactics, techniques, and procedures (TTPs) identified
- Indicators of compromise (file hashes, network indicators, registry modifications)
- Investigation summary with evidence and confidence metrics

##### threat-hunt
Performs proactive threat hunting across enterprise data sources.

**Request Body:**
```json
{
  "operation": "threat-hunt",
  "huntParameters": {
    "hunt_name": "Enterprise Threat Hunt",
    "hunt_scope": "enterprise_environment"
  }
}
```

**Response:**
- Hunt job ID and hunt profile configuration
- Hunt results (suspicious activities, potential threats, false positives, validated hypotheses)
- Key discoveries with risk assessment (anomalous network behavior, privilege escalation, data staging)
- Hunt recommendations and follow-up actions

##### orchestrate-response
Orchestrates automated security response and incident management.

**Request Body:**
```json
{
  "operation": "orchestrate-response",
  "responsePlan": {
    "incident_severity": "high"
  }
}
```

**Response:**
- Response job ID and incident details
- Automated actions status (endpoint isolation, account suspension, network segmentation, threat intel enrichment)
- Playbook execution progress and timeline
- Communication status and stakeholder notifications

##### analyze-behavior
Performs behavioral analysis and user entity behavior analytics (UEBA).

**Request Body:**
```json
{
  "operation": "analyze-behavior",
  "userActivity": {
    "analysis_period": "30_days"
  }
}
```

**Response:**
- Behavioral analysis ID and parameters
- Behavioral insights (anomalous users, suspicious activities, baseline deviations)
- User risk profiles with anomaly detection and behavioral changes
- Machine learning insights (model accuracy, false positive rates, behavioral clusters)

##### comprehensive-analysis
Executes enterprise-wide comprehensive security analysis and risk assessment.

**Request Body:**
```json
{
  "operation": "comprehensive-analysis"
}
```

**Response:**
- Comprehensive analysis ID and scope
- Analysis summary (endpoints analyzed, events processed, duration, threat landscape assessment)
- Security findings (posture score, vulnerabilities, threat campaigns, compromise indicators)
- Risk assessment (risk level, factors, mitigation priorities)
- Predictive analytics (threat likelihood, attack vectors, security investments, business impact)

## Architecture Components

### Types (`types.ts`)
Defines comprehensive TypeScript interfaces for:
- `XDRStatus`: System status and operational metrics
- `XDRHealth`: Health monitoring and diagnostics
- `EnterpriseStatus`: Enterprise deployment and security posture
- `XDRStatistics`: Operational statistics and analytics
- `ThreatDetectionResult`: Threat detection results and analysis
- `IncidentInvestigationResult`: Incident investigation findings
- `ThreatHuntResult`: Threat hunting results and discoveries
- `ResponseOrchestrationResult`: Response orchestration status
- `BehaviorAnalysisResult`: Behavioral analysis and UEBA insights
- `ComprehensiveAnalysisResult`: Enterprise-wide security analysis
- Request interfaces for all operations
- `ApiResponse`: Standardized API response format

### Utilities (`utils.ts`)
Provides comprehensive helper functions for:
- Standardized API response creation and error handling
- ID generation for all XDR operations (status, detection, investigation, hunt, response, behavior, comprehensive)
- Random data generation for realistic mock responses
- Common security constants (threat categories, indicators, TTPs, severity levels)
- Data generation helpers for complex XDR structures (threat categories, key discoveries, user risk profiles, automated actions)
- File hash, network indicator, and registry modification generators
- Time-based utility functions for realistic timeline generation

### GET Handlers (`handlers/get-handlers.ts`)
Implements handlers for:
- `handleStatus()`: Comprehensive system status and component health
- `handleHealth()`: Detailed health monitoring and diagnostics
- `handleEnterpriseStatus()`: Enterprise deployment and security posture
- `handleStatistics()`: Operational statistics and performance metrics

### POST Handlers (`handlers/post-handlers.ts`)
Implements handlers for:
- `handleDetectThreats()`: Enterprise threat detection and analysis
- `handleInvestigateIncident()`: Incident investigation and forensics
- `handleThreatHunt()`: Proactive threat hunting operations
- `handleOrchestrateResponse()`: Automated security response orchestration
- `handleAnalyzeBehavior()`: Behavioral analysis and UEBA
- `handleComprehensiveAnalysis()`: Enterprise-wide security analysis

## Key Features

### Extended Detection and Response (XDR)
- Comprehensive threat detection across multiple security data sources
- Real-time security event correlation and analysis
- Advanced behavioral analytics and anomaly detection
- Multi-vector threat hunting and investigation capabilities
- Automated incident response and security orchestration
- Enterprise-wide visibility and security posture assessment

### Threat Detection and Analysis
- Multi-layered threat detection using signatures, behavioral analysis, and machine learning
- Real-time threat categorization and severity assessment
- Comprehensive threat intelligence integration and IOC matching
- Advanced persistent threat (APT) detection and campaign tracking
- Zero-day threat detection using behavioral analysis and anomaly detection

### Incident Investigation and Forensics
- Automated incident response and investigation workflows
- Comprehensive attack timeline reconstruction and root cause analysis
- Digital forensics artifact collection and analysis
- Tactics, techniques, and procedures (TTPs) mapping to MITRE ATT&CK framework
- Evidence correlation and confidence scoring for investigation findings

### Threat Hunting and Proactive Defense
- Hypothesis-driven threat hunting methodologies
- Advanced query capabilities across multiple data sources
- Behavioral baseline establishment and deviation detection
- Threat actor campaign tracking and attribution analysis
- Proactive threat discovery and intelligence development

### Security Orchestration and Automated Response
- Automated incident response playbook execution
- Multi-system security control orchestration and integration
- Real-time threat containment and mitigation actions
- Stakeholder communication and escalation management
- Response effectiveness measurement and optimization

### Behavioral Analytics and UEBA
- User entity behavior analytics (UEBA) for insider threat detection
- Machine learning-based behavioral modeling and anomaly detection
- Risk scoring and user behavior profiling
- Privilege usage analysis and abnormal access pattern detection
- Peer group analysis and behavioral clustering

## Benefits of Refactoring

1. **Modularity**: Each handler focuses on specific XDR capabilities and operations
2. **Maintainability**: Changes to individual operations don't affect other components
3. **Type Safety**: Centralized type definitions ensure API consistency and prevent runtime errors
4. **Code Organization**: Related XDR functionality is logically grouped and organized
5. **Testing**: Individual handlers can be unit tested in isolation for better coverage
6. **Reusability**: Utility functions can be shared across handlers and extended
7. **Error Handling**: Consistent error handling and logging across all operations
8. **Scalability**: Easy to add new XDR capabilities and extend functionality
9. **Documentation**: Clear separation of concerns makes code self-documenting

## Usage Examples

### System Status
```javascript
const response = await fetch('/api/phantom-cores/xdr?operation=status');
const data = await response.json();
console.log('XDR system status:', data.data.system_overview.overall_status);
console.log('Monitored endpoints:', data.data.enterprise_coverage.monitored_endpoints);
```

### Health Monitoring
```javascript
const response = await fetch('/api/phantom-cores/xdr?operation=health');
const data = await response.json();
console.log('Overall health:', data.data.overall_health);
console.log('Component health:', data.data.component_health);
```

### Enterprise Status
```javascript
const response = await fetch('/api/phantom-cores/xdr?operation=enterprise-status');
const data = await response.json();
console.log('Enterprise deployment:', data.data.enterprise_deployment);
console.log('Security posture:', data.data.security_posture);
```

### Threat Detection
```javascript
const response = await fetch('/api/phantom-cores/xdr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'detect-threats',
    analysisData: {
      scope: 'enterprise_wide'
    }
  })
});
const detection = await response.json();
console.log('Threats detected:', detection.data.threats_detected);
console.log('Threat categories:', detection.data.threat_categories);
```

### Incident Investigation
```javascript
const response = await fetch('/api/phantom-cores/xdr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'investigate-incident',
    incidentData: {
      incident_type: 'security_alert'
    }
  })
});
const investigation = await response.json();
console.log('Investigation findings:', investigation.data.investigation_findings);
console.log('Attack timeline:', investigation.data.investigation_findings.attack_timeline);
```

### Threat Hunting
```javascript
const response = await fetch('/api/phantom-cores/xdr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'threat-hunt',
    huntParameters: {
      hunt_name: 'Advanced Persistent Threat Hunt',
      hunt_scope: 'enterprise_environment'
    }
  })
});
const hunt = await response.json();
console.log('Hunt results:', hunt.data.hunt_results);
console.log('Key discoveries:', hunt.data.key_discoveries);
```

### Response Orchestration
```javascript
const response = await fetch('/api/phantom-cores/xdr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'orchestrate-response',
    responsePlan: {
      incident_severity: 'critical'
    }
  })
});
const response_data = await response.json();
console.log('Automated actions:', response_data.data.automated_actions);
console.log('Playbook execution:', response_data.data.playbook_execution);
```

### Behavioral Analysis
```javascript
const response = await fetch('/api/phantom-cores/xdr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'analyze-behavior',
    userActivity: {
      analysis_period: '30_days'
    }
  })
});
const behavior = await response.json();
console.log('Behavioral insights:', behavior.data.behavioral_insights);
console.log('User risk profiles:', behavior.data.user_risk_profiles);
```

### Comprehensive Analysis
```javascript
const response = await fetch('/api/phantom-cores/xdr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'comprehensive-analysis'
  })
});
const analysis = await response.json();
console.log('Security findings:', analysis.data.comprehensive_findings);
console.log('Risk assessment:', analysis.data.risk_assessment);
console.log('Predictive analytics:', analysis.data.predictive_analytics);
```

## XDR Security Use Cases

### Enterprise Threat Detection
- **Advanced Malware Detection**: Multi-stage malware analysis and family classification
- **Lateral Movement Detection**: Credential theft, privilege escalation, and network traversal
- **Data Exfiltration Prevention**: Large data transfers, compression activities, and external communications
- **Persistence Mechanism Detection**: Registry modifications, scheduled tasks, and service installations
- **Command and Control Detection**: Network beaconing, domain generation algorithms, and C2 communication

### Incident Response and Investigation
- **Automated Incident Response**: Real-time threat containment and mitigation
- **Digital Forensics**: Evidence collection, timeline reconstruction, and root cause analysis
- **Attack Attribution**: Threat actor profiling and campaign attribution
- **Impact Assessment**: Business impact analysis and damage assessment
- **Compliance Reporting**: Regulatory compliance and audit trail maintenance

### Threat Hunting and Proactive Defense
- **Hypothesis-Driven Hunting**: Structured threat hunting methodologies and frameworks
- **Behavioral Hunting**: Anomaly detection and baseline deviation analysis
- **Intelligence-Driven Hunting**: Threat intelligence integration and IOC hunting
- **Campaign Tracking**: Long-term threat actor campaign monitoring and tracking
- **Zero-Day Discovery**: Novel attack technique identification and analysis

### Behavioral Analytics and Insider Threats
- **User Behavior Monitoring**: Login patterns, file access, and application usage analysis
- **Privilege Abuse Detection**: Administrative action monitoring and privilege escalation detection
- **Data Access Anomalies**: Unusual data access patterns and unauthorized data usage
- **Insider Threat Detection**: Malicious insider activity and policy violations
- **Third-Party Risk Assessment**: Vendor and contractor activity monitoring

## Performance Metrics and KPIs

### Detection Performance
- **Mean Time to Detection (MTTD)**: Average time from attack initiation to detection
- **Detection Accuracy**: True positive rate and false positive rate optimization
- **Coverage**: Percentage of attack techniques and tactics detected
- **Alert Volume**: Number of security alerts generated and processed
- **Threat Intelligence Integration**: IOC matching and attribution accuracy

### Response Performance
- **Mean Time to Response (MTTR)**: Average time from detection to initial response
- **Containment Time**: Average time to contain and isolate threats
- **Automation Rate**: Percentage of incidents handled through automated response
- **Escalation Rate**: Percentage of incidents requiring manual intervention
- **Recovery Time**: Average time to full system recovery and normal operations

### Investigation Metrics
- **Case Resolution Time**: Average time to complete incident investigations
- **Evidence Collection**: Completeness and quality of forensic evidence gathered
- **Attribution Confidence**: Accuracy of threat actor attribution and campaign tracking
- **Investigation Outcomes**: Percentage of investigations resulting in actionable intelligence
- **Knowledge Base Growth**: Expansion of threat intelligence and hunting hypotheses

## Implementation Best Practices

### XDR Deployment and Configuration
1. **Data Source Integration**: Ensure comprehensive coverage across endpoints, networks, and cloud environments
2. **Detection Rule Tuning**: Optimize detection rules to minimize false positives while maintaining coverage
3. **Baseline Establishment**: Develop accurate behavioral baselines for users, systems, and network traffic
4. **Response Playbooks**: Create and test automated response playbooks for common incident types
5. **Threat Intelligence**: Integrate multiple threat intelligence feeds and maintain IOC freshness

### Threat Detection Optimization
1. **Multi-Layer Detection**: Implement signature-based, behavioral, and machine learning detection methods
2. **Alert Correlation**: Correlate alerts across multiple data sources and time windows
3. **Risk Scoring**: Implement risk-based prioritization for alerts and incidents
4. **Context Enrichment**: Enrich alerts with additional context and threat intelligence
5. **Continuous Tuning**: Regularly review and tune detection rules based on false positive feedback

### Incident Response Integration
1. **Playbook Automation**: Automate common response actions while maintaining human oversight
2. **Communication Workflows**: Establish clear communication channels and escalation procedures
3. **Evidence Preservation**: Ensure proper forensic evidence collection and chain of custody
4. **Legal Considerations**: Maintain compliance with legal and regulatory requirements
5. **Lessons Learned**: Conduct post-incident reviews and incorporate findings into procedures

### Behavioral Analytics Implementation
1. **Baseline Development**: Establish accurate behavioral baselines using historical data
2. **Peer Group Analysis**: Compare user behavior against relevant peer groups
3. **Risk Scoring**: Implement comprehensive risk scoring based on multiple behavioral factors
4. **Feedback Loops**: Incorporate security analyst feedback to improve model accuracy
5. **Privacy Considerations**: Ensure user privacy and comply with data protection regulations

## Deployment and Operations

### Development Environment Setup
1. **XDR Platform**: Install and configure XDR platform components
2. **Data Sources**: Connect and configure security data sources (SIEM, EDR, network monitoring)
3. **Threat Intelligence**: Integrate threat intelligence feeds and IOC sources
4. **Response Systems**: Configure automated response and orchestration capabilities
5. **Monitoring**: Set up XDR performance and health monitoring

### Production Deployment
1. **Scalability**: Design for horizontal scaling and high availability
2. **Performance**: Optimize for low-latency detection and response
3. **Reliability**: Implement redundancy and failover capabilities
4. **Security**: Secure XDR infrastructure and administrative access
5. **Compliance**: Ensure regulatory compliance and audit capabilities

### Monitoring and Maintenance
1. **Performance Monitoring**: Monitor XDR system performance and resource utilization
2. **Detection Effectiveness**: Track detection accuracy and coverage metrics
3. **Response Timing**: Monitor response times and automation effectiveness
4. **Threat Landscape**: Stay current with evolving threat landscape and attack techniques
5. **System Updates**: Maintain current detection rules, threat intelligence, and system updates

All XDR operations maintain comprehensive audit trails and provide detailed documentation suitable for security analysis, threat detection, incident response, and compliance requirements in enterprise cybersecurity operations powered by advanced extended detection and response capabilities.
