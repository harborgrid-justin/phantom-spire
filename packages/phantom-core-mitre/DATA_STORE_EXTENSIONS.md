# Phantom MITRE Core - Data Store Extensions

This document describes the comprehensive data store extensions for the phantom-mitre-core plugin, enabling enterprise SaaS readiness with support for Redis, PostgreSQL, MongoDB, and Elasticsearch.

## Overview

The phantom-mitre-core plugin has been extended with comprehensive data store capabilities to support enterprise-grade deployment with multiple database backends, multi-tenancy, and high-performance data operations.

### Supported Data Stores

1. **Redis** - High-performance caching and session storage
2. **PostgreSQL** - Relational data with ACID compliance
3. **MongoDB** - Flexible document storage
4. **Elasticsearch** - Advanced search and analytics

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Phantom MITRE Core                      │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                      │
│  ├── Threat Analysis Modules                               │
│  ├── Risk Assessment                                       │
│  ├── Mitigation Planning                                   │
│  └── Detection Rule Management                             │
├─────────────────────────────────────────────────────────────┤
│  Data Store Integration Layer                              │
│  ├── Multi-tenant Context Management                       │
│  ├── Data Serialization/Deserialization                   │
│  ├── Search and Indexing                                   │
│  └── Performance Optimization                              │
├─────────────────────────────────────────────────────────────┤
│  Data Store Adapters                                       │
│  ├── Redis Store      ├── PostgreSQL Store                │
│  ├── MongoDB Store    └── Elasticsearch Store             │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                      │
│  ├── Connection Pooling                                    │
│  ├── Health Monitoring                                     │
│  ├── Backup/Recovery                                       │
│  └── Performance Metrics                                   │
└─────────────────────────────────────────────────────────────┘
```

## Installation and Configuration

### Dependencies

Add the following dependencies to your project:

```bash
# Rust dependencies (in Cargo.toml)
redis = { version = "0.23", features = ["tokio-comp", "connection-manager"] }
sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "postgres", "uuid", "chrono", "json"] }
mongodb = { version = "2.8", features = ["tokio-runtime"] }
elasticsearch = { version = "8.5.0-alpha.1", features = ["rustls-tls"] }

# TypeScript dependencies
npm install redis pg mongodb @elastic/elasticsearch
```

### Environment Configuration

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=phantom_mitre:
REDIS_MAX_CONNECTIONS=10

# PostgreSQL Configuration
POSTGRES_URL=postgresql://user:password@localhost:5432/phantom_mitre
POSTGRES_MAX_CONNECTIONS=10
POSTGRES_SCHEMA_NAME=mitre

# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE_NAME=phantom_mitre
MONGODB_COLLECTION_PREFIX=pm_

# Elasticsearch Configuration
ELASTICSEARCH_URLS=http://localhost:9200
ELASTICSEARCH_INDEX_PREFIX=phantom_mitre

# General Settings
DEFAULT_DATA_STORE=mongodb
ENABLE_MULTI_TENANCY=true
CACHE_TTL_SECONDS=3600
```

## Usage Examples

### Basic Initialization

```typescript
import { 
  MitreCoreWithDataStore, 
  DataStoreType, 
  DataStoreConfig 
} from '@phantom-spire/mitre-core/datastore';

// Create configuration
const config: DataStoreConfig = {
  defaultStore: DataStoreType.MongoDB,
  multiTenant: true,
  cacheTtlSeconds: 3600,
  mongodb: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
    databaseName: 'phantom_mitre',
    collectionPrefix: 'pm_',
    maxPoolSize: 10,
    minPoolSize: 2,
    // ... other MongoDB settings
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    keyPrefix: 'phantom_mitre:',
    maxConnections: 10,
    // ... other Redis settings
  }
};

// Initialize MITRE core with data store support
const mitreCore = new MitreCoreWithDataStore(config);
await mitreCore.initializeDataStores();
```

### Multi-Tenant Operations

```typescript
// Set tenant context
const tenantContext = {
  tenantId: 'customer_001',
  userId: 'user_123',
  organizationId: 'org_456',
  permissions: ['read', 'write']
};

mitreCore.setTenantContext(tenantContext);

// Store technique for specific tenant
const technique = {
  id: 'T1566.001',
  name: 'Spearphishing Attachment',
  description: 'Adversaries may send spearphishing emails...',
  tactic: MitreTactic.InitialAccess,
  platforms: [MitrePlatform.Windows, MitrePlatform.Linux],
  // ... other technique properties
};

const techniqueId = await mitreCore.storeTechnique(technique);
console.log(`Stored technique: ${techniqueId}`);
```

### Advanced Search Operations

```typescript
// Search techniques with advanced criteria
const searchCriteria = {
  query: 'spearphishing',
  filters: {
    tactic: 'InitialAccess',
    platform: 'Windows'
  },
  limit: 20,
  offset: 0,
  sortBy: 'name',
  sortOrder: SortOrder.Ascending
};

const results = await mitreCore.searchStoredTechniques(searchCriteria);

console.log(`Found ${results.items.length} techniques`);
console.log(`Total: ${results.pagination.total}`);
console.log(`Search took: ${results.tookMs}ms`);

results.items.forEach(technique => {
  console.log(`- ${technique.id}: ${technique.name}`);
});
```

### Bulk Operations

```typescript
// Bulk store multiple techniques
const techniques = [
  // ... array of technique objects
];

const bulkResult = await mitreCore.bulkStoreTechniques(techniques);

console.log(`Successfully stored: ${bulkResult.successCount}`);
console.log(`Errors: ${bulkResult.errorCount}`);

if (bulkResult.errors.length > 0) {
  bulkResult.errors.forEach(error => {
    console.error(`Bulk error: ${error}`);
  });
}
```

### Threat Analysis with Persistence

```typescript
// Analyze threats and persist results
const indicators = [
  'malicious_process.exe',
  'suspicious_network_activity',
  'registry_modification'
];

const analysis = await mitreCore.analyzeThreat(indicators);
const analysisId = await mitreCore.storeAnalysis(analysis);

console.log(`Analysis ${analysisId} completed with risk score: ${analysis.risk_score}`);

// Retrieve stored analyses
const recentAnalyses = await mitreCore.getStoredAnalyses(10);
console.log(`Retrieved ${recentAnalyses.length} recent analyses`);
```

## Business Logic Integration

### Using with Business Logic Modules

```typescript
import { MitreDataStoreIntegrationBusinessLogic } from './services/business-logic/modules/threat-intelligence/MitreDataStoreIntegrationBusinessLogic';

const businessLogic = new MitreDataStoreIntegrationBusinessLogic(config);
await businessLogic.initialize();

// Process business logic request
const request = {
  operation: 'analyze_threat_with_persistence',
  parameters: {
    indicators: ['malware.exe', 'c2_traffic']
  },
  context: {
    tenantId: 'customer_001',
    permissions: ['read', 'write']
  }
};

const result = await businessLogic.processor(request);

if (result.success) {
  console.log('Threat analysis completed:', result.data);
} else {
  console.error('Analysis failed:', result.errors);
}
```

### Available Operations

The business logic module supports the following operations:

- `store_technique` - Store a MITRE technique
- `get_technique` - Retrieve a technique by ID
- `search_techniques` - Search techniques with criteria
- `bulk_store_techniques` - Store multiple techniques
- `analyze_threat_with_persistence` - Analyze threat and store results
- `get_stored_analyses` - Retrieve stored analyses
- `get_data_store_metrics` - Get storage metrics
- `test_connectivity` - Test data store connections
- `migrate_data` - Migrate data between stores
- `backup_tenant_data` - Backup tenant data
- `restore_tenant_data` - Restore tenant data

## Data Store Specific Features

### Redis Features

- **High-Performance Caching**: Sub-millisecond access times
- **Session Storage**: Multi-tenant session management
- **Real-time Data**: Live threat intelligence feeds
- **Pub/Sub Support**: Event-driven notifications

```typescript
// Redis-specific configuration
const redisConfig = {
  url: 'redis://localhost:6379',
  keyPrefix: 'phantom_mitre:',
  maxConnections: 10,
  connectionTimeoutMs: 5000,
  commandTimeoutMs: 3000,
  enableCompression: true,
  clusterMode: false
};
```

### PostgreSQL Features

- **ACID Compliance**: Full transaction support
- **Relational Integrity**: Foreign key constraints
- **Advanced Queries**: Complex JOIN operations
- **Full-Text Search**: Built-in search capabilities

```sql
-- Example schema for techniques table
CREATE TABLE pm_techniques (
  id VARCHAR(20) PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tactic VARCHAR(50),
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_techniques_tenant_tactic ON pm_techniques(tenant_id, tactic);
CREATE INDEX idx_techniques_search ON pm_techniques USING gin(to_tsvector('english', name || ' ' || description));
```

### MongoDB Features

- **Flexible Schema**: Dynamic document structure
- **Horizontal Scaling**: Sharding support
- **Aggregation Pipeline**: Complex data processing
- **Geospatial Queries**: Location-based analysis

```javascript
// Example MongoDB collection structure
{
  "_id": "T1566.001",
  "tenant_id": "customer_001",
  "name": "Spearphishing Attachment",
  "description": "Adversaries may send spearphishing emails...",
  "tactic": "InitialAccess",
  "platforms": ["Windows", "Linux"],
  "data_sources": ["ProcessMonitoring", "EmailGateway"],
  "metadata": {
    "created_at": ISODate("2024-01-01T00:00:00.000Z"),
    "updated_at": ISODate("2024-01-01T00:00:00.000Z"),
    "version": 1
  }
}
```

### Elasticsearch Features

- **Full-Text Search**: Advanced search capabilities
- **Real-time Indexing**: Near real-time search
- **Analytics**: Aggregations and visualizations
- **Scalability**: Distributed search cluster

```json
// Example Elasticsearch mapping
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "tenant_id": { "type": "keyword" },
      "name": { "type": "text", "analyzer": "standard" },
      "description": { "type": "text", "analyzer": "standard" },
      "tactic": { "type": "keyword" },
      "platforms": { "type": "keyword" },
      "search_content": { "type": "text", "analyzer": "standard" },
      "created_at": { "type": "date" }
    }
  }
}
```

## Performance Optimization

### Caching Strategy

```typescript
// Multi-layer caching
const config = {
  redis: {
    // L1 Cache: Redis for frequently accessed data
    cacheTtlSeconds: 3600, // 1 hour
    enableCompression: true
  },
  mongodb: {
    // L2 Cache: MongoDB with proper indexing
    enableCompression: true,
    readPreference: 'secondaryPreferred'
  }
};
```

### Connection Pooling

```typescript
// Optimized connection management
const poolConfig = {
  postgresql: {
    maxConnections: 20,
    minConnections: 5,
    idleTimeoutMs: 600000, // 10 minutes
    acquireTimeoutMs: 30000
  },
  mongodb: {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMs: 30000
  }
};
```

### Indexing Strategy

```sql
-- PostgreSQL optimized indexes
CREATE INDEX CONCURRENTLY idx_techniques_tenant_tactic ON pm_techniques(tenant_id, tactic);
CREATE INDEX CONCURRENTLY idx_techniques_platforms ON pm_techniques USING gin((data->'platforms'));
CREATE INDEX CONCURRENTLY idx_techniques_fts ON pm_techniques USING gin(to_tsvector('english', name || ' ' || description));
```

```javascript
// MongoDB optimized indexes
db.pm_techniques.createIndex({ "tenant_id": 1, "tactic": 1 })
db.pm_techniques.createIndex({ "tenant_id": 1, "platforms": 1 })
db.pm_techniques.createIndex({ "search_content": "text" })
```

## Multi-Tenancy Implementation

### Tenant Isolation

Data isolation is implemented at multiple levels:

1. **Logical Separation**: Tenant ID in all records
2. **Database Level**: Separate databases per tenant (optional)
3. **Index Level**: Tenant-specific indexes
4. **Connection Level**: Tenant-specific connection pools

### Security Considerations

```typescript
// Tenant context validation
class TenantSecurityManager {
  validateAccess(context: TenantContext, operation: string): boolean {
    // Check permissions
    if (!context.permissions.includes(operation)) {
      throw new Error(`Insufficient permissions for ${operation}`);
    }
    
    // Validate tenant access
    if (!this.isValidTenant(context.tenantId)) {
      throw new Error('Invalid tenant');
    }
    
    return true;
  }
}
```

## Monitoring and Metrics

### Health Monitoring

```typescript
// Comprehensive health checks
const healthStatus = await mitreCore.testDataStoreConnectivity();

console.log('Data Store Health:');
Object.entries(healthStatus).forEach(([store, isHealthy]) => {
  console.log(`${store}: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
});
```

### Performance Metrics

```typescript
// Get detailed metrics
const metrics = await mitreCore.getDataStoreMetrics();

console.log(`Storage Metrics:
- Techniques: ${metrics.totalTechniques}
- Groups: ${metrics.totalGroups}
- Software: ${metrics.totalSoftware}
- Mitigations: ${metrics.totalMitigations}
- Detection Rules: ${metrics.totalDetectionRules}
- Analyses: ${metrics.totalAnalyses}
- Storage Size: ${(metrics.storageSizeBytes / 1024 / 1024).toFixed(2)} MB
- Last Updated: ${metrics.lastUpdated}`);
```

## Backup and Recovery

### Tenant Data Backup

```typescript
// Backup tenant data
const backupRequest = {
  operation: 'backup_tenant_data',
  parameters: {
    backupLocation: '/backups/customer_001',
    includeAnalyses: true
  },
  context: {
    tenantId: 'customer_001',
    permissions: ['admin']
  }
};

const backupResult = await businessLogic.processor(backupRequest);
console.log('Backup completed:', backupResult.data);
```

### Data Migration

```typescript
// Migrate data between stores
const migrationRequest = {
  operation: 'migrate_data',
  parameters: {
    sourceStore: 'mongodb',
    targetStore: 'elasticsearch',
    dataTypes: ['techniques', 'groups']
  },
  context: {
    tenantId: 'customer_001',
    permissions: ['admin']
  }
};

const migrationResult = await businessLogic.processor(migrationRequest);
console.log('Migration completed:', migrationResult.data);
```

## Testing

### Unit Tests

```bash
# Run data store tests
npm test -- --testPathPattern=mitreDataStoreIntegration.test.ts
```

### Integration Tests

```typescript
// Test with actual data stores
describe('Data Store Integration Tests', () => {
  beforeAll(async () => {
    // Setup test databases
    await setupTestDatabases();
  });
  
  it('should handle multi-tenant operations', async () => {
    // Test tenant isolation
    // Test data operations
    // Verify results
  });
});
```

## Best Practices

### Development Guidelines

1. **Always use tenant context** for data operations
2. **Implement proper error handling** for all data store operations
3. **Use connection pooling** for optimal performance
4. **Monitor metrics** regularly for performance optimization
5. **Implement proper indexing** for search operations
6. **Use bulk operations** for large data sets
7. **Implement caching** for frequently accessed data
8. **Regular backups** for data protection

### Production Deployment

1. **Configure monitoring** for all data stores
2. **Set up alerting** for health issues
3. **Implement log aggregation** for troubleshooting
4. **Use SSL/TLS** for all connections
5. **Regular security audits** for access control
6. **Performance testing** under load
7. **Disaster recovery planning** with regular drills

## Troubleshooting

### Common Issues

1. **Connection Timeouts**
   - Increase timeout values
   - Check network connectivity
   - Verify connection pools

2. **Performance Issues**
   - Review indexing strategy
   - Monitor connection usage
   - Optimize query patterns

3. **Multi-tenancy Problems**
   - Verify tenant context
   - Check data isolation
   - Review permission logic

### Debug Mode

```typescript
// Enable debug logging
const config = {
  debug: true,
  logLevel: 'debug'
};

// Use debug utilities
console.log('Current tenant:', mitreCore.getTenantContext());
console.log('Data store config:', mitreCore.getConfig());
```

## Roadmap

### Upcoming Features

1. **Advanced Analytics** - Real-time threat analytics with Elasticsearch
2. **Data Streaming** - Real-time data ingestion pipelines
3. **Machine Learning Integration** - AI-powered threat analysis
4. **Advanced Caching** - Distributed caching with Redis Cluster
5. **Cross-Store Queries** - Federated queries across data stores
6. **Enhanced Security** - Advanced encryption and access control

### Performance Improvements

1. **Query Optimization** - Advanced query planning
2. **Caching Strategies** - Multi-level caching
3. **Connection Management** - Advanced pooling
4. **Index Optimization** - Auto-tuning indexes

This comprehensive data store extension transforms the phantom-mitre-core into a fully enterprise-ready solution capable of handling large-scale, multi-tenant MITRE ATT&CK data operations with high performance and reliability.