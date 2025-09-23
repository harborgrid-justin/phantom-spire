# IOC API Documentation

## Overview
This directory contains the refactored IOC (Indicators of Compromise) API for the Phantom IOC Core, broken down into smaller, more manageable modules for better maintainability and code organization. The API provides comprehensive IOC management capabilities including indicator submission, enrichment, correlation, analysis, and threat intelligence reporting.

## File Structure

```
src/app/api/phantom-cores/ioc/
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

#### GET /api/phantom-cores/ioc?operation=status
Returns comprehensive IOC system status and metrics.

**Response:**
- System status and component health
- IOC metrics (total, active, detection rates)
- Indicator distribution by type
- Threat classification statistics
- Processing metrics and data sources

#### GET /api/phantom-cores/ioc?operation=analysis
Returns detailed IOC analysis example with threat context.

**Response:**
- Analysis ID and indicator profile
- Threat context (malware families, campaigns, geolocation)
- Enrichment data (WHOIS, DNS, reputation scores)
- Related indicators and relationships
- Security recommendations

#### GET /api/phantom-cores/ioc?operation=recent
Returns recently discovered IOCs within the last 24 hours.

**Response:**
- Timeframe and total counts
- High-confidence IOC count
- Detailed IOC list with metadata
- Source attribution and campaign associations

#### GET /api/phantom-cores/ioc?operation=trending
Returns trending IOCs based on mention frequency.

**Response:**
- Trending IOCs with mention counts
- Trend indicators (increasing, stable, decreasing)
- Associated campaign information

#### GET /api/phantom-cores/ioc?operation=feeds
Returns IOC feed status and statistics.

**Response:**
- Total and active feed counts
- Feed details (name, type, status, quality score)
- Last update times and daily indicator counts

### POST Operations

#### POST /api/phantom-cores/ioc
Performs various IOC operations based on the `operation` parameter.

**Operations:**

##### submit
Submits IOCs for processing and validation.

**Request Body:**
```json
{
  "operation": "submit",
  "indicators": [
    {
      "value": "192.168.1.100",
      "type": "ip_address"
    },
    {
      "value": "malicious-domain.com",
      "type": "domain"
    }
  ]
}
```

**Response:**
- Submission ID for tracking
- Processing statistics (valid, invalid, duplicates)
- Enrichment queue status

##### search
Searches for IOCs matching specified criteria.

**Request Body:**
```json
{
  "operation": "search",
  "query": "malware"
}
```

**Response:**
- Search query and result count
- Matching IOCs with confidence and threat scores
- First seen timestamps

##### analyze-ioc
Performs comprehensive analysis of a specific IOC.

**Request Body:**
```json
{
  "operation": "analyze-ioc",
  "indicator_value": "a1b2c3d4e5f6...",
  "indicator_type": "hash"
}
```

**Response:**
- Analysis ID and IOC profile
- Threat assessment and attribution data
- Security recommendations

##### enrich-ioc
Enriches an IOC with additional threat intelligence data.

**Request Body:**
```json
{
  "operation": "enrich-ioc",
  "enrichment_sources": ["VirusTotal", "ThreatConnect"]
}
```

**Response:**
- Enrichment ID and source information
- Enriched data (reputation, geolocation, WHOIS)
- Historical context and frequency scores

##### correlate-iocs
Correlates multiple IOCs to identify patterns and campaigns.

**Request Body:**
```json
{
  "operation": "correlate-iocs",
  "correlation_parameters": {
    "time_window": "7d",
    "confidence_threshold": 0.8
  }
}
```

**Response:**
- Correlation ID and results summary
- Pattern analysis (temporal, network, behavioral)
- Campaign analysis and attribution
- Related indicator correlations

##### generate-ioc-report
Generates comprehensive IOC intelligence reports.

**Request Body:**
```json
{
  "operation": "generate-ioc-report",
  "report_type": "IOC Intelligence Report",
  "time_period": "7_days"
}
```

**Response:**
- Report ID and metadata
- Report summary statistics
- Key findings and trending threats
- Mitigation strategies

##### enrich (Legacy)
Legacy IOC enrichment endpoint for backward compatibility.

**Request Body:**
```json
{
  "operation": "enrich",
  "indicator": "example.com"
}
```

**Response:**
- Basic enrichment data
- Threat scores and confidence
- Malware families and campaigns

## Architecture Components

### Types (`types.ts`)
Defines TypeScript interfaces for:
- `IOCStatus`: System status and metrics
- `IOCAnalysis`: Comprehensive IOC analysis data
- `IOCItem`: Individual IOC information
- `TrendingIOC`: Trending indicator data
- `IOCFeed`: Feed status and metadata
- Request interfaces for all operations
- `ApiResponse`: Standardized API response format

### Utilities (`utils.ts`)
Provides helper functions for:
- Standardized API response creation
- ID generation (submissions, analyses, correlations, reports)
- Random data generation for mock responses
- Confidence and threat score calculations
- Date and time utilities
- Error handling and logging
- Common constants (IOC types, malware families, campaigns)

### GET Handlers (`handlers/get-handlers.ts`)
Implements handlers for:
- `handleStatus()`: System status and health metrics
- `handleAnalysis()`: IOC analysis example data
- `handleRecent()`: Recently discovered IOCs
- `handleTrending()`: Trending IOC statistics
- `handleFeeds()`: Feed status and performance

### POST Handlers (`handlers/post-handlers.ts`)
Implements handlers for:
- `handleSubmit()`: IOC submission processing
- `handleSearch()`: IOC search functionality
- `handleAnalyzeIOC()`: IOC analysis operations
- `handleEnrichIOC()`: IOC enrichment with threat intelligence
- `handleCorrelateIOCs()`: IOC correlation and pattern analysis
- `handleGenerateIOCReport()`: Intelligence report generation
- `handleEnrich()`: Legacy enrichment endpoint

## Key Features

### IOC Management
- Bulk IOC submission and validation
- Automated enrichment pipeline
- Quality scoring and confidence assessment
- Duplicate detection and deduplication
- Source attribution and provenance tracking

### Threat Intelligence
- Multi-source enrichment (VirusTotal, MISP, ThreatConnect)
- Reputation scoring and threat assessment
- Geolocation and infrastructure analysis
- WHOIS and DNS record correlation
- Historical context and frequency analysis

### Pattern Analysis
- IOC correlation and clustering
- Campaign attribution and tracking
- Temporal pattern detection
- Network behavior analysis
- Threat actor profiling

### Reporting and Analytics
- Comprehensive intelligence reports
- Trending analysis and statistics
- Custom report generation
- Mitigation strategy recommendations
- Executive summary dashboards

## Benefits of Refactoring

1. **Modularity**: Each handler focuses on specific IOC operations
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
const response = await fetch('/api/phantom-cores/ioc?operation=status');
const data = await response.json();
console.log('IOC system status:', data.data.status);
```

### Submitting IOCs
```javascript
const response = await fetch('/api/phantom-cores/ioc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'submit',
    indicators: [
      { value: '192.168.1.100', type: 'ip_address' },
      { value: 'malicious-domain.com', type: 'domain' }
    ]
  })
});
const submission = await response.json();
console.log('Submission results:', submission.data);
```

### Analyzing an IOC
```javascript
const response = await fetch('/api/phantom-cores/ioc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'analyze-ioc',
    indicator_value: 'a1b2c3d4e5f6...',
    indicator_type: 'hash'
  })
});
const analysis = await response.json();
console.log('IOC analysis:', analysis.data);
```

### Enriching IOCs
```javascript
const response = await fetch('/api/phantom-cores/ioc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'enrich-ioc',
    enrichment_sources: ['VirusTotal', 'ThreatConnect']
  })
});
const enrichment = await response.json();
console.log('Enrichment results:', enrichment.data);
```

### Correlating IOCs
```javascript
const response = await fetch('/api/phantom-cores/ioc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'correlate-iocs',
    correlation_parameters: {
      time_window: '7d',
      confidence_threshold: 0.8
    }
  })
});
const correlation = await response.json();
console.log('Correlation results:', correlation.data);
```

### Generating Reports
```javascript
const response = await fetch('/api/phantom-cores/ioc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'generate-ioc-report',
    report_type: 'IOC Intelligence Report',
    time_period: '7_days'
  })
});
const report = await response.json();
console.log('Generated report:', report.data);
```

## IOC Types Supported

- **IP Addresses**: IPv4 and IPv6 addresses
- **Domains**: Malicious domains and subdomains
- **File Hashes**: MD5, SHA1, SHA256 hashes
- **URLs**: Malicious URLs and landing pages
- **Email Addresses**: Threat actor email addresses

## Threat Intelligence Sources

- **VirusTotal**: Commercial threat intelligence platform
- **MISP**: Open source threat intelligence platform
- **ThreatConnect**: Commercial threat intelligence platform
- **AbuseIPDB**: IP reputation database
- **ThreatMiner**: Threat intelligence search engine
- **Internal Analysis**: Organization-specific threat data

## Security Features

- **Validation Pipeline**: Comprehensive IOC validation and sanitization
- **Quality Scoring**: Automated quality assessment of IOC sources
- **Confidence Assessment**: Statistical confidence calculations
- **Duplicate Detection**: Advanced deduplication algorithms
- **Chain of Custody**: Complete audit trail for IOC provenance
- **Access Control**: Role-based access to sensitive threat data

All operations maintain strict data integrity and provide comprehensive audit trails suitable for threat intelligence sharing, incident response, and security operations center (SOC) workflows.
