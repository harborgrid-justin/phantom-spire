# Business SaaS Extension for phantom-intel-core

## Overview

The Business SaaS Extension transforms the phantom-intel-core plugin into an enterprise-grade, multi-tenant threat intelligence platform with comprehensive data store support for Redis, PostgreSQL, MongoDB, and Elasticsearch.

## Quick Start

### Installation

```bash
npm install phantom-spire
```

### Basic Usage

```typescript
import { createBusinessSaaSIntelCore } from 'phantom-spire';

// Configure your Business SaaS instance
const config = {
  tenantId: 'your-company-001',
  dataStore: {
    mongodb: {
      uri: 'mongodb://localhost:27017',
      database: 'threat_intelligence'
    },
    postgresql: {
      connectionString: 'postgresql://user:pass@localhost:5432/analytics'
    },
    redis: {
      url: 'redis://localhost:6379'
    },
    elasticsearch: {
      node: 'http://localhost:9200'
    }
  },
  features: {
    realTimeUpdates: true,
    advancedAnalytics: true,
    customReports: true,
    apiAccess: true
  },
  quotas: {
    maxIndicators: 50000,
    maxThreatActors: 5000,
    maxApiRequestsPerHour: 2000
  }
};

// Initialize the Business SaaS Intel Core
const intel = createBusinessSaaSIntelCore(config);
await intel.initialize();
```

## Core Features

### 1. Multi-Database Architecture

The extension integrates four specialized data stores:

- **MongoDB**: Primary document storage for flexible threat intelligence data
- **PostgreSQL**: Structured analytics and reporting
- **Redis**: Real-time caching and pub/sub messaging
- **Elasticsearch**: Advanced full-text search and analysis

```typescript
// Data is automatically distributed across stores
const indicatorId = await intel.createIndicatorPersistent({
  indicator_type: 'ip_address',
  value: '192.168.1.100',
  confidence: 0.95,
  severity: 'critical',
  context: {
    malware_families: ['APT29'],
    threat_actors: ['Cozy Bear'],
    description: 'C2 server for advanced persistent threat'
  }
});
// ✅ Stored in MongoDB, cached in Redis, indexed in Elasticsearch
```

### 2. Multi-Tenancy Support

Complete tenant isolation with configurable quotas and features:

```typescript
// Get tenant information
const tenantInfo = intel.getTenantInfo();
console.log(`Tenant: ${tenantInfo.name} (${tenantInfo.plan})`);

// Check quotas
const metrics = intel.getTenantMetrics();
console.log(`Indicators: ${metrics.data_metrics.total_indicators}/${tenantInfo.quotas.maxIndicators}`);
```

### 3. Real-Time Capabilities

Subscribe to live updates using Redis pub/sub:

```typescript
// Subscribe to threat updates
const subscriptionId = await intel.subscribeToUpdates(
  ['threat-updates', 'indicators'],
  (update) => {
    console.log('Real-time update:', update.type, update.action);
  },
  { entityTypes: ['indicator'], severity: ['high', 'critical'] }
);

// Publish custom updates
await intel.publishUpdate({
  type: 'system',
  action: 'status_changed',
  entityId: 'threat-level',
  data: { level: 'elevated', reason: 'Increased APT activity' }
});
```

### 4. Advanced Analytics

Leverage machine learning for threat analysis:

```typescript
// Threat landscape analysis
const analysis = await intel.generateAdvancedAnalytics({
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31'),
  analysisTypes: ['threat_landscape', 'correlation']
});

// Correlation analysis
const correlations = await intel.analyzeCorrelations(
  ['indicator-1', 'indicator-2', 'indicator-3'],
  { start: lastWeek, end: today }
);

// Anomaly detection
const anomalies = await intel.detectAnomalies(
  ['campaign-1', 'actor-2'],
  { start: lastMonth, end: today }
);
```

### 5. Advanced Search

Use Elasticsearch for powerful full-text search:

```typescript
// Full-text search
const searchResults = await intel.searchIndicatorsPersistent(
  'APT29 malware command control',
  { 
    severity: ['high', 'critical'],
    confidence_min: 0.8,
    date_range: { start: lastWeek, end: today }
  }
);

// Paginated listing
const indicators = await intel.listIndicatorsPersistent(
  { malware_families: ['TrickBot', 'Emotet'] },
  { page: 1, limit: 50 }
);
```

## API Reference

### Core Operations

#### Persistent Indicators

```typescript
// Create
const id = await intel.createIndicatorPersistent(indicatorData);

// Read
const indicator = await intel.getIndicatorPersistent(id);

// Update
await intel.updateIndicatorPersistent(id, updateData);

// Delete
await intel.deleteIndicatorPersistent(id);

// Search
const results = await intel.searchIndicatorsPersistent(query, filters);
```

#### Threat Actors

```typescript
const actorId = await intel.createThreatActorPersistent({
  name: 'APT29',
  aliases: ['Cozy Bear', 'The Dukes'],
  actor_type: 'nation_state',
  sophistication: 'expert',
  target_sectors: ['Government', 'Financial']
});
```

#### Campaigns

```typescript
const campaignId = await intel.createCampaignPersistent({
  name: 'Operation SolarWinds',
  threat_actors: [actorId],
  start_date: new Date('2020-03-01'),
  target_sectors: ['Technology', 'Government']
});
```

### System Management

#### Health Monitoring

```typescript
const health = await intel.getSystemHealth();
console.log(`Overall: ${health.overall_status}`);
console.log(`MongoDB: ${health.data_stores.mongodb.status}`);
console.log(`Redis: ${health.data_stores.redis.status}`);
```

#### Data Export

```typescript
const exportJob = await intel.exportData(
  ['indicators', 'threat_actors'],
  'json',
  { severity: 'high' }
);
```

## Configuration Options

### Data Store Configuration

```typescript
const config = {
  dataStore: {
    mongodb: {
      uri: 'mongodb://localhost:27017',
      database: 'threat_intel',
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000
      }
    },
    postgresql: {
      connectionString: 'postgresql://user:pass@localhost:5432/analytics',
      pool: { max: 20, min: 5 }
    },
    redis: {
      url: 'redis://localhost:6379',
      keyPrefix: 'intel',
      options: { maxRetriesPerRequest: 3 }
    },
    elasticsearch: {
      node: ['http://localhost:9200', 'http://localhost:9201'],
      auth: { username: 'elastic', password: 'password' },
      requestTimeout: 30000
    }
  }
};
```

### Feature Configuration

```typescript
const config = {
  features: {
    realTimeUpdates: true,      // Enable Redis pub/sub
    advancedAnalytics: true,    // Enable ML analytics
    customReports: true,        // Enable reporting
    apiAccess: true,           // Enable API endpoints
    ssoIntegration: false,     // SSO integration
    auditLogging: true,        // Comprehensive logging
    dataExport: true,          // Export capabilities
    multiTenancy: true,        // Multi-tenant support
    workflowAutomation: true,  // Workflow engine
    threatIntelligenceFeeds: true // Feed processing
  }
};
```

### Quota Configuration

```typescript
const config = {
  quotas: {
    maxIndicators: 100000,        // Max indicators per tenant
    maxThreatActors: 10000,       // Max threat actors
    maxCampaigns: 1000,           // Max campaigns
    maxReports: 500,              // Max reports
    maxDataSize: 21474836480,     // Max storage (20GB)
    maxApiRequestsPerHour: 10000, // API rate limit
    maxConcurrentUsers: 500,      // Concurrent users
    maxRetentionDays: 1095,       // Data retention (3 years)
    maxExportSize: 5368709120     // Max export size (5GB)
  }
};
```

### Security Configuration

```typescript
const config = {
  security: {
    encryptionEnabled: true,
    accessControl: {
      enabled: true,
      defaultRole: 'analyst',
      roles: {
        admin: ['read', 'write', 'delete', 'manage'],
        senior_analyst: ['read', 'write', 'export'],
        analyst: ['read', 'write'],
        viewer: ['read']
      }
    },
    auditLogging: {
      enabled: true,
      retentionDays: 180,
      sensitiveDataMasking: true
    },
    compliance: {
      gdprEnabled: true,
      hipaaEnabled: false,
      socEnabled: true
    }
  }
};
```

## Backward Compatibility

The Business SaaS extension maintains full compatibility with the original phantom-intel-core:

```typescript
// Original methods still work
const id = intel.addIndicator({ /* original format */ });
const indicator = intel.getIndicator(id);
const summary = intel.generateIntelligenceSummary();
```

## Error Handling

```typescript
try {
  const indicator = await intel.createIndicatorPersistent(data);
} catch (error) {
  if (error.message.includes('quota exceeded')) {
    // Handle quota limit
  } else if (error.message.includes('tenant not active')) {
    // Handle inactive tenant
  } else {
    // Handle other errors
  }
}
```

## Performance Optimization

### Caching Strategy

The system implements a three-tier caching strategy:

1. **L1 Cache**: In-memory application cache (5-minute TTL)
2. **L2 Cache**: Redis cache (30-minute TTL)
3. **L3 Storage**: Persistent database storage

### Query Optimization

```typescript
// Use projection to limit returned fields
const results = await intel.listIndicatorsPersistent(
  { severity: 'high' },
  { page: 1, limit: 100 },
  { projection: ['id', 'value', 'confidence'] }
);

// Use date ranges to limit search scope
const recent = await intel.searchIndicatorsPersistent(
  'malware',
  { 
    date_range: { 
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  }
);
```

## Monitoring and Alerting

```typescript
// Monitor system health
const health = await intel.getSystemHealth();
if (health.overall_status === 'degraded') {
  // Send alert
}

// Monitor quotas
const metrics = intel.getTenantMetrics();
if (metrics.quota_metrics.indicators_quota_usage > 90) {
  // Warn about approaching limit
}
```

## Best Practices

1. **Data Modeling**: Use consistent data models across all entities
2. **Error Handling**: Implement comprehensive error handling and retries
3. **Monitoring**: Set up health checks and performance monitoring
4. **Security**: Enable encryption and audit logging for production
5. **Scaling**: Use read replicas and clustering for high-availability
6. **Backup**: Implement regular backups across all data stores

## Troubleshooting

### Common Issues

1. **Connection Errors**: Check data store connectivity and credentials
2. **Quota Exceeded**: Monitor usage and adjust quotas as needed
3. **Performance Issues**: Use caching and optimize queries
4. **Real-time Delays**: Check Redis pub/sub configuration

### Debug Mode

```typescript
// Enable debug logging
process.env.LOG_LEVEL = 'debug';

// Monitor real-time metrics
const realTimeHealth = await intel.getRealTimeHealth();
console.log('Active subscriptions:', realTimeHealth.metrics.activeSubscriptions);
```

## Migration from Original Core

```typescript
// 1. Install the Business SaaS extension
npm install phantom-spire

// 2. Update imports
import { createBusinessSaaSIntelCore } from 'phantom-spire';

// 3. Initialize with configuration
const intel = createBusinessSaaSIntelCore(config);
await intel.initialize();

// 4. Migrate existing data (optional)
const existingData = originalCore.exportData('json');
await intel.importData(existingData, 'json');
```

This Business SaaS extension provides enterprise-grade capabilities while maintaining the simplicity and power of the original phantom-intel-core plugin.