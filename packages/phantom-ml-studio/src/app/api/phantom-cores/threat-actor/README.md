# Threat Actor API Documentation

## Overview
This directory contains the refactored Threat Actor API for the Phantom Threat Actor Core, broken down into smaller, more manageable modules for better maintainability and code organization. The API provides comprehensive threat actor profiling, attribution analysis, campaign tracking, and threat intelligence capabilities.

## File Structure

```
src/app/api/phantom-cores/threat-actor/
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

#### GET /api/phantom-cores/threat-actor?operation=status
Returns comprehensive threat actor system status and operational metrics.

**Response:**
- System status and component health (actor profiler, attribution engine, campaign tracker, intelligence aggregator)
- Operational metrics (uptime, tracked actors, active campaigns, attribution confidence)
- Actor intelligence breakdown (APT groups, cybercriminal groups, insider threats, hacktivist groups, nation state actors)
- Attribution metrics (confidence levels, accuracy, false positive rates)
- Activity tracking (campaigns analyzed, TTPs mapped, indicators attributed, timeline reconstructions)
- Intelligence sources quality assessment (OSINT, commercial, government, community)

#### GET /api/phantom-cores/threat-actor?operation=analysis
Returns detailed threat actor analysis with attribution assessment.

**Response:**
- Comprehensive actor profile (name, aliases, classification, origin, active period, sophistication level)
- Attribution assessment (confidence score, attribution factors, supporting evidence)
- Operational profile (motivations, target sectors, target regions, attack lifecycle)
- Campaign history with IOC counts and status
- Threat assessment (current threat level, attack likelihood, potential impact, recommended defenses)

#### GET /api/phantom-cores/threat-actor?operation=actors
Returns list of tracked threat actors with key metrics.

**Response:**
- Total and active actor counts
- Individual actor details (ID, name, type, origin, sophistication, active campaigns, last activity, threat level)
- Comprehensive actor database with real-time activity tracking

#### GET /api/phantom-cores/threat-actor?operation=campaigns
Returns active and historical threat actor campaigns.

**Response:**
- Total and active campaign counts
- Campaign details (ID, name, associated actor, status, start date, targets, indicators, confidence)
- Campaign tracking across multiple threat actors and timeframes

#### GET /api/phantom-cores/threat-actor?operation=attribution
Returns recent threat actor attribution results.

**Response:**
- Recent attribution analysis results
- Incident-to-actor mappings with confidence scores
- Attribution factors and supporting evidence
- Temporal attribution tracking for trend analysis

### POST Operations

#### POST /api/phantom-cores/threat-actor
Performs various threat actor operations based on the `operation` parameter.

**Operations:**

##### attribute
Performs incident attribution analysis to identify responsible threat actors.

**Request Body:**
```json
{
  "operation": "attribute",
  "incident_id": "inc-12345"
}
```

**Response:**
- Attribution results for multiple candidate actors
- Confidence scores and attribution factors for each candidate
- Recommended primary actor based on analysis
- Analysis completion status and reliability metrics

##### profile
Updates threat actor profiles with new intelligence and TTPs.

**Request Body:**
```json
{
  "operation": "profile",
  "actor_name": "APT29"
}
```

**Response:**
- Profile update confirmation and status
- New intelligence integration metrics (TTPs added, indicators linked, campaigns associated)
- Confidence improvement indicators
- Threat assessment updates

##### profile-actor
Creates comprehensive threat actor profiles based on analysis parameters.

**Request Body:**
```json
{
  "operation": "profile-actor",
  "profileData": {
    "actor_type": "apt_group",
    "target_sector": "healthcare"
  }
}
```

**Response:**
- Detailed actor profile (name, aliases, type, sophistication, motivation, origin)
- Capability assessment (technical skills, resource level, target sectors, attack vectors)
- Historical campaign data and operational patterns
- Attribution indicators and threat level assessment
- Confidence scoring for profile accuracy

##### track-campaign
Initiates comprehensive threat actor campaign tracking and analysis.

**Request Body:**
```json
{
  "operation": "track-campaign",
  "campaignData": {
    "campaign_name": "Operation Shadow Strike",
    "tracking_scope": "global"
  }
}
```

**Response:**
- Campaign tracking job ID and status
- Campaign overview (threat actor, type, timeline, duration, scope)
- Tactical analysis (MITRE ATT&CK framework mapping)
- Indicator tracking metrics (domains, IPs, file hashes, registry keys)
- Targeting analysis (sectors, regions, victim organizations, affected countries)

##### analyze-attribution
Performs comprehensive attribution analysis with technical and behavioral correlation.

**Request Body:**
```json
{
  "operation": "analyze-attribution",
  "attributionData": {
    "incident_data": {
      "attack_patterns": ["T1566", "T1055", "T1547"]
    }
  }
}
```

**Response:**
- Attribution analysis ID and summary
- Candidate actor analysis with confidence scoring and matching factors
- Technical indicators correlation (malware similarity, infrastructure reuse, TTP overlap, code similarity)
- Behavioral pattern analysis (operational timing, target selection, attack methodology, persistence mechanisms)
- Strategic recommendations for response and mitigation

##### generate-intelligence
Generates comprehensive threat intelligence reports on actor landscape and trends.

**Request Body:**
```json
{
  "operation": "generate-intelligence",
  "intelligence_type": "threat_actor_landscape",
  "scope": "enterprise_threats",
  "time_range": "12_months"
}
```

**Response:**
- Intelligence report ID and metadata
- Executive summary (total actors analyzed, active campaigns, emerging threats, attribution accuracy, threat trends)
- Landscape analysis (dominant actor types, geographic distribution, sector targeting trends)
- Emerging threat identification with risk assessment
- Strategic recommendations for security posture improvement

##### hunt
Performs threat actor hunting based on indicators and patterns.

**Request Body:**
```json
{
  "operation": "hunt",
  "query": "registry persistence mechanisms"
}
```

**Response:**
- Hunt job ID and query details
- Actor matches with confidence scoring and evidence correlation
- Match type classification (infrastructure, TTP, malware, campaign)
- Total matches and relevance scoring
- Hunt recommendations for follow-up analysis

## Architecture Components

### Types (`types.ts`)
Defines comprehensive TypeScript interfaces for:
- `ThreatActorStatus`: System status and operational metrics
- `ThreatActorAnalysis`: Comprehensive actor analysis and attribution
- `ActorsData`: Actor database and tracking information
- `CampaignsData`: Campaign tracking and historical data
- `AttributionData`: Attribution analysis results and history
- `AttributeResponse`: Incident attribution analysis results
- `ProfileResponse`: Actor profile updates and intelligence integration
- `ProfileActorResponse`: Comprehensive actor profiling results
- `TrackCampaignResponse`: Campaign tracking and analysis results
- `AnalyzeAttributionResponse`: Advanced attribution analysis with technical correlation
- `GenerateIntelligenceResponse`: Threat intelligence reports and landscape analysis
- `HuntResponse`: Threat actor hunting results and recommendations
- Request interfaces for all operations
- `ApiResponse`: Standardized API response format

### Utilities (`utils.ts`)
Provides comprehensive helper functions for:
- Standardized API response creation and error handling
- ID generation for all threat actor operations (analysis, profile, campaign, attribution, intelligence, hunt)
- Random data generation for realistic mock responses
- Common threat actor constants (APT groups, cybercriminal groups, hacktivist groups, actor types, motivations, target sectors)
- Data generation helpers for complex threat actor structures (actor profiles, campaigns, attributions, technical indicators)
- Attribution factor and matching pattern generators
- Time-based utility functions for realistic activity tracking
- Behavioral pattern analysis and threat assessment utilities

### GET Handlers (`handlers/get-handlers.ts`)
Implements handlers for:
- `handleStatus()`: Comprehensive system status and component health
- `handleAnalysis()`: Detailed threat actor analysis and attribution assessment
- `handleActors()`: Actor database and tracking information
- `handleCampaigns()`: Campaign tracking and historical analysis
- `handleAttribution()`: Recent attribution results and trend analysis

### POST Handlers (`handlers/post-handlers.ts`)
Implements handlers for:
- `handleAttribute()`: Incident attribution analysis and actor identification
- `handleProfile()`: Actor profile updates and intelligence integration
- `handleProfileActor()`: Comprehensive actor profiling and capability assessment
- `handleTrackCampaign()`: Campaign tracking and tactical analysis
- `handleAnalyzeAttribution()`: Advanced attribution analysis with technical correlation
- `handleGenerateIntelligence()`: Threat intelligence report generation and landscape analysis
- `handleHunt()`: Threat actor hunting and pattern matching

## Key Features

### Threat Actor Profiling and Attribution
- Comprehensive actor database with real-time tracking and intelligence updates
- Advanced attribution analysis using technical indicators and behavioral patterns
- Multi-factor attribution scoring with confidence assessment and evidence correlation
- Historical campaign tracking and operational pattern analysis
- Threat actor capability assessment and sophistication level determination

### Campaign Tracking and Analysis
- Real-time campaign monitoring with indicator tracking and correlation
- MITRE ATT&CK framework integration for tactical analysis and TTP mapping
- Geographic and sector-based targeting analysis with victim profiling
- Campaign lifecycle tracking from initial access to objective completion
- Cross-campaign correlation and actor attribution analysis

### Threat Intelligence Generation
- Automated threat landscape analysis with trend identification and risk assessment
- Strategic intelligence reporting with executive summaries and actionable recommendations
- Emerging threat detection and early warning capabilities
- Geographic and sector-based threat intelligence with targeted recommendations
- Predictive analysis for threat actor evolution and campaign forecasting

### Attribution Analysis and Correlation
- Technical indicator correlation (malware similarity, infrastructure reuse, code analysis)
- Behavioral pattern analysis (operational timing, target selection, attack methodology)
- Multi-source intelligence integration with confidence scoring and reliability assessment
- Attribution factor weighting and evidence strength assessment
- Historical attribution validation and accuracy tracking

### Threat Actor Hunting and Discovery
- Pattern-based hunting across multiple data sources and intelligence feeds
- Infrastructure correlation and shared resource identification
- TTP-based hunting with MITRE ATT&CK framework integration
- Campaign correlation and actor group identification
- Proactive threat discovery and intelligence development

## Benefits of Refactoring

1. **Modularity**: Each handler focuses on specific threat actor capabilities and operations
2. **Maintainability**: Changes to individual operations don't affect other components
3. **Type Safety**: Centralized type definitions ensure API consistency and prevent runtime errors
4. **Code Organization**: Related threat actor functionality is logically grouped and organized
5. **Testing**: Individual handlers can be unit tested in isolation for better coverage
6. **Reusability**: Utility functions can be shared across handlers and extended for new capabilities
7. **Error Handling**: Consistent error handling and logging across all operations
8. **Scalability**: Easy to add new threat actor capabilities and extend functionality
9. **Documentation**: Clear separation of concerns makes code self-documenting and maintainable

## Usage Examples

### System Status
```javascript
const response = await fetch('/api/phantom-cores/threat-actor?operation=status');
const data = await response.json();
console.log('System status:', data.data.system_overview.overall_status);
console.log('Tracked actors:', data.data.metrics.tracked_actors);
console.log('Attribution confidence:', data.data.metrics.attribution_confidence);
```

### Threat Actor Analysis
```javascript
const response = await fetch('/api/phantom-cores/threat-actor?operation=analysis');
const data = await response.json();
console.log('Actor profile:', data.data.actor_profile);
console.log('Attribution assessment:', data.data.attribution_assessment);
console.log('Threat level:', data.data.threat_assessment.current_threat_level);
```

### Actor Database
```javascript
const response = await fetch('/api/phantom-cores/threat-actor?operation=actors');
const data = await response.json();
console.log('Total actors:', data.data.total_actors);
console.log('Actor list:', data.data.actors);
```

### Campaign Tracking
```javascript
const response = await fetch('/api/phantom-cores/threat-actor?operation=campaigns');
const data = await response.json();
console.log('Active campaigns:', data.data.active_campaigns);
console.log('Campaign details:', data.data.campaigns);
```

### Attribution Analysis
```javascript
const response = await fetch('/api/phantom-cores/threat-actor?operation=attribution');
const data = await response.json();
console.log('Recent attributions:', data.data.recent_attributions);
```

### Incident Attribution
```javascript
const response = await fetch('/api/phantom-cores/threat-actor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'attribute',
    incident_id: 'inc-12345'
  })
});
const attribution = await response.json();
console.log('Attribution results:', attribution.data.attribution_results);
console.log('Recommended actor:', attribution.data.recommended_actor);
```

### Actor Profiling
```javascript
const response = await fetch('/api/phantom-cores/threat-actor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'profile-actor',
    profileData: {
      actor_type: 'apt_group',
      target_sector: 'healthcare'
    }
  })
});
const profile = await response.json();
console.log('Actor profile:', profile.data.actor_profile);
console.log('Capabilities:', profile.data.capabilities);
console.log('Threat level:', profile.data.threat_level);
```

### Campaign Tracking
```javascript
const response = await fetch('/api/phantom-cores/threat-actor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'track-campaign',
    campaignData: {
      campaign_name: 'Operation Shadow Strike',
      tracking_scope: 'global'
    }
  })
});
const campaign = await response.json();
console.log('Campaign overview:', campaign.data.campaign_overview);
console.log('Tactical analysis:', campaign.data.tactical_analysis);
console.log('Indicators tracked:', campaign.data.indicators_tracked);
```

### Advanced Attribution Analysis
```javascript
const response = await fetch('/api/phantom-cores/threat-actor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'analyze-attribution',
    attributionData: {
      incident_data: {
        attack_patterns: ['T1566', 'T1055', 'T1547']
      }
    }
  })
});
const analysis = await response.json();
console.log('Analysis summary:', analysis.data.analysis_summary);
console.log('Candidate actors:', analysis.data.candidate_actors);
console.log('Technical indicators:', analysis.data.technical_indicators);
console.log('Behavioral patterns:', analysis.data.behavioral_patterns);
```

### Threat Intelligence Generation
```javascript
const response = await fetch('/api/phantom-cores/threat-actor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'generate-intelligence',
    intelligence_type: 'threat_actor_landscape',
    scope: 'enterprise_threats',
    time_range: '12_months'
  })
});
const intelligence = await response.json();
console.log('Executive summary:', intelligence.data.executive_summary);
console.log('Landscape analysis:', intelligence.data.landscape_analysis);
console.log('Emerging threats:', intelligence.data.emerging_threats);
console.log('Strategic recommendations:', intelligence.data.strategic_recommendations);
```

### Threat Actor Hunting
```javascript
const response = await fetch('/api/phantom-cores/threat-actor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'hunt',
    query: 'registry persistence mechanisms'
  })
});
const hunt = await response.json();
console.log('Hunt matches:', hunt.data.matches);
console.log('Total matches:', hunt.data.total_matches);
console.log('Recommendations:', hunt.data.recommendations);
```

## Threat Actor Intelligence Use Cases

### Advanced Persistent Threat (APT) Analysis
- **Nation-State Actor Profiling**: Comprehensive analysis of state-sponsored threat groups and their capabilities
- **Campaign Attribution**: Multi-factor attribution analysis using technical indicators and behavioral patterns
- **Geopolitical Intelligence**: Correlation of threat actor activities with geopolitical events and motivations
- **Long-term Threat Tracking**: Historical analysis of APT group evolution and operational changes
- **Strategic Intelligence**: High-level threat assessment for executive decision-making and resource allocation

### Cybercriminal Group Tracking
- **Financial Crime Analysis**: Tracking of financially motivated threat actors and their monetization strategies
- **Ransomware Group Profiling**: Comprehensive analysis of ransomware-as-a-service operations and affiliates
- **Underground Economy Intelligence**: Analysis of cybercriminal ecosystem relationships and collaboration patterns
- **Payment Infrastructure Tracking**: Financial flow analysis and cryptocurrency transaction correlation
- **Victim Targeting Analysis**: Industry and geographic targeting pattern analysis for predictive intelligence

### Campaign and Operation Analysis
- **Multi-Stage Campaign Tracking**: End-to-end analysis of complex, multi-phase threat actor operations
- **Cross-Campaign Correlation**: Identification of shared infrastructure, tools, and techniques across campaigns
- **Tactical Evolution Analysis**: Tracking of threat actor adaptation and technique refinement over time
- **Supply Chain Attack Analysis**: Specialized analysis of supply chain compromise operations and attribution
- **Zero-Day Campaign Tracking**: Analysis of campaigns leveraging previously unknown vulnerabilities

### Attribution and Forensic Analysis
- **Technical Attribution**: Malware similarity analysis, code reuse detection, and infrastructure correlation
- **Behavioral Attribution**: Operational pattern analysis, timing correlation, and target selection profiling
- **Multi-Source Intelligence Fusion**: Integration of technical, behavioral, and contextual intelligence for attribution
- **Confidence Assessment**: Statistical analysis of attribution factors and evidence strength quantification
- **Attribution Validation**: Historical validation of attribution decisions and accuracy improvement

## Performance Metrics and Analytics

### Attribution Accuracy Metrics
- **Attribution Confidence**: Statistical confidence levels for threat actor attribution decisions
- **False Positive Rate**: Measurement of incorrect attribution decisions and accuracy improvement
- **Evidence Correlation**: Strength of technical and behavioral evidence supporting attribution decisions
- **Multi-Source Validation**: Cross-validation of attribution using independent intelligence sources
- **Historical Accuracy**: Long-term tracking of attribution decision validation and refinement

### Intelligence Quality Assessment
- **Source Reliability**: Assessment of intelligence source quality and consistency over time
- **Information Freshness**: Timeliness metrics for threat intelligence updates and actor profile maintenance
- **Coverage Completeness**: Measurement of threat actor landscape coverage and intelligence gaps
- **Predictive Accuracy**: Validation of threat forecasting and emerging threat identification
- **Actionability Score**: Assessment of intelligence utility for security operations and decision-making

### Operational Effectiveness
- **Detection Improvement**: Measurement of threat detection enhancement through actor intelligence
- **Response Optimization**: Quantification of incident response improvement through attribution intelligence
- **Prevention Success**: Assessment of attack prevention through proactive threat actor intelligence
- **Investigation Efficiency**: Measurement of forensic investigation acceleration through attribution capabilities
- **Strategic Impact**: Assessment of strategic security posture improvement through threat actor intelligence

## Implementation Best Practices

### Threat Actor Intelligence Development
1. **Multi-Source Integration**: Combine technical indicators, behavioral analysis, and contextual intelligence
2. **Confidence Scoring**: Implement statistical confidence assessment for all attribution decisions
3. **Historical Validation**: Maintain long-term validation of attribution decisions for accuracy improvement
4. **Community Collaboration**: Integrate with industry threat intelligence sharing initiatives and frameworks
5. **Continuous Learning**: Implement machine learning and AI capabilities for pattern recognition and analysis automation

### Attribution Analysis Methodology
1. **Technical Correlation**: Systematic analysis of malware, infrastructure, and operational security indicators
2. **Behavioral Pattern Analysis**: Comprehensive analysis of operational timing, target selection, and attack methodology
3. **Contextual Intelligence**: Integration of geopolitical, economic, and social context for attribution assessment
4. **Evidence Documentation**: Comprehensive documentation of attribution factors and evidence chains
5. **Peer Review**: Implementation of collaborative attribution assessment and expert validation processes

### Intelligence Operations Integration
1. **SIEM Integration**: Direct integration with security information and event management platforms
2. **Threat Hunting Enhancement**: Support for proactive threat hunting through actor intelligence and indicators
3. **Incident Response Support**: Real-time attribution support for incident response and forensic investigations
4. **Strategic Planning**: Integration with strategic security planning and risk management processes
5. **Executive Reporting**: Automated generation of executive-level threat intelligence reports and briefings

### Data Management and Privacy
1. **Information Classification**: Proper classification and handling of sensitive threat intelligence information
2. **Source Protection**: Implementation of source and method protection for sensitive intelligence operations
3. **Data Retention**: Comprehensive data retention policies for threat actor intelligence and attribution evidence
4. **Privacy Compliance**: Ensuring compliance with privacy regulations and data protection requirements
5. **Information Sharing**: Structured approach to threat intelligence sharing with trusted partners and communities

## Deployment and Operations

### Development Environment Setup
1. **Threat Intelligence Platform**: Install and configure threat intelligence management platform
2. **Data Sources**: Connect and configure threat actor intelligence feeds and data sources
3. **Analysis Tools**: Install and configure malware analysis, infrastructure correlation, and behavioral analysis tools
4. **Attribution Framework**: Implement structured attribution methodology and confidence assessment framework
5. **Collaboration Tools**: Set up secure collaboration platforms for threat intelligence sharing and analysis

### Production Deployment
1. **Scalability**: Design for horizontal scaling to handle large-scale threat actor intelligence operations
2. **Performance**: Optimize for low-latency attribution analysis and real-time threat actor tracking
3. **Reliability**: Implement redundancy and failover capabilities for critical threat intelligence operations
4. **Security**: Secure threat intelligence infrastructure and implement appropriate access controls
5. **Compliance**: Ensure regulatory compliance and audit capabilities for threat intelligence operations

### Monitoring and Maintenance
1. **Intelligence Quality**: Monitor threat intelligence quality, freshness, and coverage completeness
2. **Attribution Accuracy**: Track attribution decision accuracy and implement continuous improvement processes
3. **Operational Performance**: Monitor system performance and threat actor tracking effectiveness
4. **Threat Landscape**: Stay current with evolving threat actor tactics, techniques, and procedures
5. **Community Engagement**: Maintain active participation in threat intelligence communities and sharing initiatives

All threat actor operations maintain comprehensive audit trails and provide detailed documentation suitable for attribution analysis, threat intelligence, incident response, and compliance requirements in enterprise cybersecurity operations powered by advanced threat actor profiling and attribution capabilities.
