# Modular Data Layer - Palantir-Competitive Architecture

## Overview

The Phantom Spire modular data layer provides enterprise-grade capabilities that compete directly with Palantir's Foundry platform. It offers unified data access, advanced analytics, cross-source federation, and real-time intelligence processing for cyber threat intelligence.

## Key Features

### 🔄 Data Federation
- **Cross-Source Queries**: Query across MongoDB, REST APIs, files, and external feeds
- **Result Fusion**: Union, join, and intersection operations across data sources
- **Real-Time Streaming**: Live data feeds from multiple sources simultaneously
- **Schema Mapping**: Automatic data transformation and normalization

### 🧠 Advanced Analytics
- **Pattern Recognition**: APT campaigns, botnet detection, data exfiltration patterns
- **Anomaly Detection**: Statistical, isolation forest, and LSTM-based detection
- **Predictive Analytics**: Threat trend forecasting and risk assessment
- **Machine Learning**: Extensible ML framework for custom models

### 🕸️ Graph Analytics
- **Relationship Discovery**: Automatic entity linking across data sources
- **Graph Traversal**: Multi-hop relationship analysis
- **Centrality Analysis**: Identify key nodes in threat networks
- **Community Detection**: Discover coordinated threat actor groups

### 🔗 Connector Framework
- **Extensible Architecture**: Plugin-based connector system
- **Multiple Protocols**: REST, GraphQL, databases, file systems
- **Authentication**: Bearer tokens, API keys, OAuth2, certificates
- **Rate Limiting**: Intelligent throttling and retry mechanisms

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer Orchestrator                    │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Federation     │  Analytics      │  Connector Framework    │
│  Engine         │  Engine         │                         │
│  ┌───────────┐  │  ┌───────────┐  │  ┌─────────────────┐    │
│  │Multi-src  │  │  │Pattern    │  │  │REST API         │    │
│  │Queries    │  │  │Recognition│  │  │Connector        │    │
│  └───────────┘  │  └───────────┘  │  └─────────────────┘    │
│  ┌───────────┐  │  ┌───────────┐  │  ┌─────────────────┐    │
│  │Streaming  │  │  │Anomaly    │  │  │Database         │    │
│  │Fusion     │  │  │Detection  │  │  │Connector        │    │
│  └───────────┘  │  └───────────┘  │  └─────────────────┘    │
└─────────────────┴─────────────────┴─────────────────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
┌─────────────┐   ┌─────────────┐        ┌─────────────┐
│ MongoDB     │   │ REST APIs   │        │ File        │
│ IOCs        │   │ Threat      │        │ Systems     │
│ Alerts      │   │ Feeds       │        │ STIX/CSV    │
│ MITRE       │   │ Intel       │        │ Logs        │
└─────────────┘   └─────────────┘        └─────────────┘
```

## Quick Start

### 1. Initialize the Data Layer

```typescript
import { DataLayerOrchestrator, IDataLayerConfig } from './data-layer';

const config: IDataLayerConfig = {
  mongodb: {
    uri: 'mongodb://localhost:27017',
    database: 'phantom-spire'
  },
  analytics: {
    enableAdvancedAnalytics: true,
    enableAnomalyDetection: true,
    enablePredictiveAnalytics: true
  },
  connectors: {
    'virustotal': {
      type: 'rest-api',
      connection: {
        baseUrl: 'https://www.virustotal.com/vtapi/v2',
      },
      authentication: {
        type: 'apikey',
        credentials: {
          key: process.env.VIRUSTOTAL_API_KEY,
          param: 'apikey'
        }
      }
    }
  }
};

const dataLayer = new DataLayerOrchestrator(config);
await dataLayer.initialize();
```

### 2. Execute Federated Queries

```typescript
// Query IOCs across all connected sources
const results = await dataLayer.query({
  type: 'select',
  entity: 'iocs',
  filters: {
    severity: 'high',
    timestamp: { $gte: new Date('2024-01-01') }
  },
  fusion: 'union',
  sources: ['mongodb', 'virustotal']
}, context);

console.log(`Found ${results.data.length} IOCs from ${Object.keys(results.sourceBreakdown).length} sources`);
```

### 3. Advanced Threat Analytics

```typescript
// Analyze threats with pattern recognition
const analytics = await dataLayer.analyzeThreats(query, context, {
  patterns: ['apt-campaign', 'botnet-activity'],
  includeAnomalies: true,
  includePredictions: true
});

// Process findings
analytics.findings.forEach(finding => {
  console.log(`Threat Pattern: ${finding.pattern}`);
  console.log(`Risk Level: ${finding.risk}`);
  console.log(`Confidence: ${finding.score}%`);
});
```

### 4. Relationship Discovery

```typescript
// Discover relationships across data sources
const relationships = await dataLayer.discoverRelationships(
  ['ip:192.168.1.1', 'domain:evil.com'], 
  context,
  {
    maxDepth: 3,
    similarityThreshold: 0.8
  }
);

console.log(`Discovered ${relationships.relationships.length} relationships`);
console.log(`Found ${relationships.crossSourceLinks.length} cross-source links`);
```

## Enhanced IOC Service

The Enhanced IOC Service demonstrates the power of the modular data layer:

```typescript
import { EnhancedIOCService } from './services/enhancedIOCService';

const iocService = new EnhancedIOCService(dataLayer);

// Intelligent IOC query across all sources
const results = await iocService.intelligenceQuery({
  filters: { type: 'ip', severity: 'high' },
  includeRelationships: true,
  includeAnalytics: true,
  sources: ['mongodb', 'external-feeds']
}, context);

// Enrich IOC with multi-source data
const enrichment = await iocService.enrichIOC(ioc, context, {
  includeReputation: true,
  includeGeolocation: true,
  includeMalwareAnalysis: true
});

// Discover threat campaigns
const campaigns = await iocService.discoverCampaigns(context, {
  timeRange: { start: lastWeek, end: now },
  minIOCs: 5,
  includeAttribution: true
});
```

## Performance & Scalability

### Query Optimization
- **Parallel Execution**: Queries run across sources simultaneously
- **Result Caching**: Intelligent caching with TTL and invalidation
- **Query Planning**: Automatic optimization based on data source capabilities
- **Pagination**: Efficient large result set handling

### Real-Time Capabilities
- **Streaming Ingestion**: Process data as it arrives
- **Event Correlation**: Real-time relationship detection
- **Alert Generation**: Immediate threat notifications
- **Live Dashboards**: Real-time analytics updates

### Enterprise Features
- **Health Monitoring**: Comprehensive system health checks
- **Metrics Collection**: Performance and usage analytics
- **Audit Logging**: Complete data access and transformation logs
- **Security**: Role-based access control and data lineage

## Data Quality & Governance

### Data Lineage
- **Provenance Tracking**: Complete data source attribution
- **Transformation History**: All data modifications logged
- **Quality Metrics**: Completeness, accuracy, consistency, timeliness
- **Validation Rules**: Automated data quality checks

### Schema Management
- **Dynamic Mapping**: Automatic field mapping between sources
- **Schema Evolution**: Handle changes without breaking queries
- **Data Validation**: Type checking and constraint enforcement
- **Normalization**: Consistent data formats across sources

## Comparison to Palantir Foundry

| Feature | Phantom Spire Data Layer | Palantir Foundry |
|---------|-------------------------|------------------|
| **Data Integration** | Multi-source connectors, real-time | Multi-source, batch processing |
| **Graph Analytics** | Built-in relationship discovery | Advanced graph engine |
| **Machine Learning** | Extensible ML framework | Integrated ML pipelines |
| **Query Federation** | Cross-source queries | Centralized data model |
| **Real-Time** | Native streaming support | Limited real-time |
| **Cost** | Open source, self-hosted | Enterprise licensing |
| **Customization** | Fully extensible | Platform-dependent |
| **Deployment** | On-premises/cloud flexible | Cloud-first |

## Future Enhancements

### Planned Features
- **Graph Database Integration**: Neo4j, Amazon Neptune support
- **Apache Kafka Integration**: Event streaming platform
- **Kubernetes Scaling**: Auto-scaling based on load
- **Advanced ML Models**: Deep learning for threat detection
- **Visualization Engine**: Interactive network and timeline views
- **Collaborative Intelligence**: Multi-tenant analysis workspaces

### Extensibility Points
- **Custom Connectors**: Add support for any data source
- **Analytics Plugins**: Custom pattern recognition algorithms
- **Transformation Rules**: Business-specific data processing
- **Output Adapters**: Push results to external systems

## Getting Started

See the [Integration Example](../examples/dataLayerDemo.ts) for a complete demonstration of capabilities.

Run the demo:
```bash
npm run build
node dist/examples/dataLayerDemo.js
```

This will demonstrate:
- ✅ Federated queries across multiple sources
- 🧠 Advanced threat pattern analytics
- 🔗 Cross-source relationship discovery  
- 🏥 System health monitoring
- 📊 Performance metrics collection

The modular data layer transforms Phantom Spire into an enterprise-grade threat intelligence platform that rivals commercial solutions while maintaining open-source flexibility and cost advantages.