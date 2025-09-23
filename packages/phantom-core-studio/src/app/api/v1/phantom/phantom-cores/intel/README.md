# Intel API Documentation

## Overview
This directory contains the refactored Intel API for the Phantom Intel Core, broken down into smaller, more manageable modules for better maintainability and code organization. The API provides comprehensive threat intelligence capabilities including intelligence gathering, analysis, threat actor tracking, campaign monitoring, and indicator enrichment.

## File Structure

```
src/app/api/phantom-cores/intel/
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

#### GET /api/phantom-cores/intel?operation=status
Returns comprehensive intelligence system status and metrics.

**Response:**
- System overview (status, health, uptime, active feeds)
- Intelligence sources status (OSINT, SIGINT, HUMINT, Technical)
- Collection metrics (indicators collected, reports generated, quality scores)
- Threat landscape overview (campaigns, actors, IOCs)

#### GET /api/phantom-cores/intel?operation=analysis
Returns detailed threat analysis example with attribution and TTPs.

**Response:**
- Analysis ID and threat assessment
- Attribution data (threat actor, confidence, motivation)
- MITRE ATT&CK tactics and techniques mapping
- Indicators of compromise (IPs, domains, hashes, emails)
- Security recommendations

#### GET /api/phantom-cores/intel?operation=campaigns
Returns active threat campaigns and campaign tracking data.

**Response:**
- Total and active campaign counts
- Campaign details (name, threat actor, status, targets)
- Severity levels and indicator counts
- First seen timestamps and targeting information

#### GET /api/phantom-cores/intel?operation=actors
Returns tracked threat actors and their profiles.

**Response:**
- Total actor count
- Threat actor profiles (name, aliases, origin, motivation)
- Activity timelines and sophistication levels
- Campaign associations and last activity

#### GET /api/phantom-cores/intel?operation=feeds
Returns intelligence feed status and statistics.

**Response:**
- Total feed count and categorization
- Feed details (name, category, status, reliability)
- Update frequencies and daily indicator counts
- Feed quality and reliability metrics

### POST Operations

#### POST /api/phantom-cores/intel
Performs various intelligence operations based on the `operation` parameter.

**Operations:**

##### enrich
Enriches indicators with threat intelligence data from multiple sources.

**Request Body:**
```json
{
  "operation": "enrich",
  "indicator": "192.168.1.100"
}
```

**Response:**
- Indicator value and enrichment data
- Threat scores and confidence levels
- Associated campaigns and geolocations
- Source attribution and timestamps
- Threat type classifications

##### hunt
Performs threat hunting queries across intelligence databases.

**Request Body:**
```json
{
  "operation": "hunt",
  "query": "APT29"
}
```

**Response:**
- Hunt ID and query parameters
- Search results with matching indicators
- Threat scores and campaign associations
- Total match counts and execution time

## Architecture Components

### Types (`types.ts`)
Defines TypeScript interfaces for:
- `IntelStatus`: System status and intelligence metrics
- `ThreatAnalysis`: Comprehensive threat analysis data
- `Campaign`: Threat campaign information
- `ThreatActor`: Threat actor profiles and tracking
- `IntelFeed`: Intelligence feed metadata
- `IndicatorEnrichment`: Enrichment results and sources
- `ThreatHuntResult`: Threat hunting results
- Request interfaces for all operations
- `ApiResponse`: Standardized API response format

### Utilities (`utils.ts`)
Provides helper functions for:
- Standardized API response creation
- ID generation (status, analysis, hunt IDs)
- Random data generation for mock responses
- Timestamp generation (past and recent)
- Confidence and threat score calculations
- Error handling and logging
- Common constants (threat levels, actors, campaigns, MITRE TTPs)

### GET Handlers (`handlers/get-handlers.ts`)
Implements handlers for:
- `handleStatus()`: Intelligence system status and metrics
- `handleAnalysis()`: Threat analysis examples
- `handleCampaigns()`: Active campaign tracking
- `handleActors()`: Threat actor profiles
- `handleFeeds()`: Intelligence feed status

### POST Handlers (`handlers/post-handlers.ts`)
Implements handlers for:
- `handleEnrich()`: Indicator enrichment operations
- `handleHunt()`: Threat hunting and search functionality

## Key Features

### Intelligence Collection
- Multi-source intelligence aggregation (OSINT, SIGINT, HUMINT, Technical)
- Automated feed processing and normalization
- Quality scoring and reliability assessment
- Real-time collection metrics and monitoring

### Threat Analysis
- Comprehensive threat assessment and profiling
- Attribution analysis with confidence scoring
- MITRE ATT&CK framework mapping
- Indicator correlation and relationship analysis

### Campaign Tracking
- Active campaign monitoring and tracking
- Threat actor attribution and profiling
- Target sector analysis and trending
- Campaign lifecycle management

### Indicator Management
- Multi-source indicator enrichment
- Threat scoring and risk assessment
- Geolocation and infrastructure analysis
- Historical context and frequency analysis

### Threat Hunting
- Advanced search and query capabilities
- Cross-reference analysis across datasets
- Pattern recognition and anomaly detection
- Custom hunt rule development

## Benefits of Refactoring

1. **Modularity**: Each handler focuses on specific intelligence operations
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
const response = await fetch('/api/phantom-cores/intel?operation=status');
const data = await response.json();
console.log('Intel system status:', data.data.system_overview.overall_status);
```

### Threat Analysis
```javascript
const response = await fetch('/api/phantom-cores/intel?operation=analysis');
const data = await response.json();
console.log('Threat analysis:', data.data.threat_assessment);
```

### Campaign Tracking
```javascript
const response = await fetch('/api/phantom-cores/intel?operation=campaigns');
const data = await response.json();
console.log('Active campaigns:', data.data.campaigns);
```

### Threat Actor Profiles
```javascript
const response = await fetch('/api/phantom-cores/intel?operation=actors');
const data = await response.json();
console.log('Tracked actors:', data.data.tracked_actors);
```

### Feed Management
```javascript
const response = await fetch('/api/phantom-cores/intel?operation=feeds');
const data = await response.json();
console.log('Intelligence feeds:', data.data.feeds);
```

### Indicator Enrichment
```javascript
const response = await fetch('/api/phantom-cores/intel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'enrich',
    indicator: '192.168.1.100'
  })
});
const enrichment = await response.json();
console.log('Enrichment results:', enrichment.data);
```

### Threat Hunting
```javascript
const response = await fetch('/api/phantom-cores/intel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'hunt',
    query: 'APT29'
  })
});
const huntResults = await response.json();
console.log('Hunt results:', huntResults.data);
```

## Intelligence Source Types

### OSINT (Open Source Intelligence)
- Public web sources and social media
- News articles and research publications
- Technical blogs and security reports
- Government advisories and bulletins

### SIGINT (Signals Intelligence)
- Network traffic analysis
- Communications intercepts
- Electronic signatures and patterns
- Protocol analysis and metadata

### HUMINT (Human Intelligence)
- Security researcher contributions
- Industry threat sharing
- Law enforcement cooperation
- Insider threat reports

### Technical Intelligence
- Malware analysis and reverse engineering
- Infrastructure analysis and mapping
- Vulnerability research and exploitation
- Digital forensics and artifact analysis

## Threat Actor Classification

### Sophistication Levels
- **Basic**: Script kiddies, opportunistic attackers
- **Intermediate**: Organized cybercriminal groups
- **Advanced**: Nation-state actors, advanced persistent threats
- **Expert**: Elite groups with custom tools and zero-days

### Motivation Categories
- **Espionage**: State-sponsored intelligence gathering
- **Financial**: Monetarily motivated cybercrime
- **Hacktivism**: Ideologically motivated attacks
- **Cyber Warfare**: Military and strategic operations
- **Personal**: Individual grudges or revenge
- **Unknown**: Unclear or mixed motivations

## Campaign Lifecycle

### Status Classifications
- **Active**: Currently conducting operations
- **Monitored**: Under observation but dormant
- **Historical**: Past campaigns for reference
- **Suspected**: Potential campaigns under investigation

### Severity Levels
- **CRITICAL**: Immediate threat to national security or critical infrastructure
- **HIGH**: Significant threat requiring urgent attention
- **MEDIUM**: Moderate threat with manageable impact
- **LOW**: Minor threat with limited scope
- **INFO**: Informational intelligence for awareness

## MITRE ATT&CK Integration

The API includes comprehensive MITRE ATT&CK framework integration:

### Tactics Coverage
- Initial Access, Execution, Persistence
- Defense Evasion, Credential Access, Discovery
- Lateral Movement, Collection, Command and Control
- Exfiltration, Impact

### Technique Mapping
- Detailed technique identification and classification
- Sub-technique granularity for precise attribution
- Procedure examples and real-world implementations
- Mitigation and detection guidance

## Feed Categories and Sources

### OSINT Feeds (23 active)
- MISP communities and sharing platforms
- Public threat intelligence repositories
- Security vendor research and reports
- Academic and research institution publications

### Commercial Feeds (12 active)
- Premium threat intelligence services
- Vendor-specific intelligence feeds
- Subscription-based analysis platforms
- Professional security service providers

### Government Feeds (8 active)
- National CERT and cybersecurity agencies
- Law enforcement threat bulletins
- Intelligence community sharing
- Military and defense advisories

### Community Feeds (4 active)
- Open source security communities
- Researcher collaboration platforms
- Industry-specific sharing groups
- Volunteer contributor networks

## Quality Metrics and Reliability

### Source Reliability Scoring
- **0.90-1.00**: Highly reliable, verified sources
- **0.75-0.89**: Generally reliable with occasional inaccuracies
- **0.60-0.74**: Moderately reliable requiring verification
- **0.40-0.59**: Questionable reliability, use with caution
- **0.00-0.39**: Unreliable, requires significant validation

### Intelligence Confidence Levels
- **High (0.80-1.00)**: Confirmed by multiple independent sources
- **Medium (0.60-0.79)**: Probable based on available evidence
- **Low (0.40-0.59)**: Possible but requires additional confirmation
- **Unknown (0.00-0.39)**: Insufficient evidence for assessment

All operations maintain comprehensive audit trails and provide detailed source attribution suitable for intelligence analysis, threat assessment, and strategic decision-making in cybersecurity operations.
