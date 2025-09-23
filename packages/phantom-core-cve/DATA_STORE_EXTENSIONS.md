# Phantom CVE Core - Data Store Extensions

This document describes the comprehensive data store extensions for the phantom-cve-core plugin, enabling enterprise SaaS readiness with support for Redis, PostgreSQL, MongoDB, and Elasticsearch.

## Overview

The phantom-cve-core plugin has been extended with comprehensive data store capabilities to support enterprise-grade deployment with multiple database backends, multi-tenancy, and high-performance data operations.

### Supported Data Stores

1. **Redis** - High-performance caching and session storage
2. **PostgreSQL** - Relational data with ACID compliance
3. **MongoDB** - Flexible document storage
4. **Elasticsearch** - Advanced search and analytics

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Phantom CVE Core                        │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                      │
│  ├── CVE Analysis Modules                                  │
│  ├── Exploit Prediction                                    │
│  ├── Remediation Planning                                  │
│  └── Vulnerability Scoring                                 │
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
REDIS_KEY_PREFIX=phantom_cve:
REDIS_MAX_CONNECTIONS=10

# PostgreSQL Configuration
POSTGRES_URL=postgresql://user:password@localhost:5432/phantom_cve
POSTGRES_MAX_CONNECTIONS=10
POSTGRES_SCHEMA_NAME=cve

# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE_NAME=phantom_cve
MONGODB_COLLECTION_PREFIX=pc_

# Elasticsearch Configuration
ELASTICSEARCH_URLS=http://localhost:9200
ELASTICSEARCH_INDEX_PREFIX=phantom_cve

# General Settings
DEFAULT_DATA_STORE=mongodb
ENABLE_MULTI_TENANCY=true
CACHE_TTL_SECONDS=3600
```

## Usage Examples

### Basic Initialization

```typescript
import { 
  CVECoreWithDataStore, 
  DataStoreType, 
  DataStoreConfig 
} from '@phantom-spire/cve-core/datastore';

// Create configuration
const config: DataStoreConfig = {
  defaultStore: DataStoreType.MongoDB,
  multiTenant: true,
  cacheTtlSeconds: 3600,
  mongodb: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
    databaseName: 'phantom_cve',
    collectionPrefix: 'pc_'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    keyPrefix: 'phantom_cve:',
    maxConnections: 10
  }
};

// Initialize CVE core with data store
const cveCore = new CVECoreWithDataStore(config);
await cveCore.initialize();
```

### Storing and Retrieving CVE Data

```typescript
import { TenantContext } from '@phantom-spire/cve-core/datastore';

// Create tenant context
const tenantContext = new TenantContext('tenant-123');

// Store a CVE
const cve = {
  dataType: "CVE_RECORD",
  dataVersion: "5.0",
  cveMetadata: {
    cveId: "CVE-2023-1234",
    state: "PUBLISHED"
  },
  containers: {
    // CVE data structure
  }
};

const cveId = await cveCore.storeCVE(cve, tenantContext);
console.log('Stored CVE:', cveId);

// Retrieve a CVE
const retrievedCVE = await cveCore.getCVE('CVE-2023-1234', tenantContext);
if (retrievedCVE) {
  console.log('Retrieved CVE:', retrievedCVE.cveMetadata.cveId);
}

// Search CVEs
const searchResults = await cveCore.searchCVEs({
  vendor: 'Microsoft',
  severityMin: 7.0,
  tags: ['windows', 'rce']
}, tenantContext);

console.log(`Found ${searchResults.items.length} CVEs`);
```

### Working with Exploit Timelines

```typescript
// Store exploit timeline
const exploitTimeline = {
  cveId: 'CVE-2023-1234',
  disclosureDate: new Date('2023-01-15'),
  firstExploitDate: new Date('2023-01-20'),
  weaponizationDate: new Date('2023-01-25'),
  exploitationStages: [
    {
      stage: 'proof-of-concept',
      date: new Date('2023-01-20'),
      description: 'Initial PoC published',
      threatActors: [],
      toolsUsed: []
    }
  ],
  riskProgression: []
};

await cveCore.storeExploit(exploitTimeline, tenantContext);

// Retrieve exploit timeline
const timeline = await cveCore.getExploit('CVE-2023-1234', tenantContext);
```

### Remediation Strategies

```typescript
// Store remediation strategy
const remediationStrategy = {
  cveId: 'CVE-2023-1234',
  priority: 'Critical',
  immediateActions: [
    {
      actionType: 'patch',
      description: 'Apply security patch KB5012345',
      estimatedTime: '30 minutes',
      resourcesRequired: ['system-admin'],
      dependencies: []
    }
  ],
  shortTermActions: [],
  longTermActions: [],
  compensatingControls: [],
  estimatedEffort: {
    hours: 2,
    complexity: 'Low',
    skillsRequired: ['windows-admin']
  }
};

await cveCore.storeRemediation(remediationStrategy, tenantContext);
```

## Data Store Specific Features

### Redis Features

- **High-Performance Caching**: Sub-millisecond data retrieval
- **Multi-tenant Key Isolation**: Automatic tenant-specific key prefixing
- **TTL Support**: Configurable data expiration
- **Connection Pooling**: Efficient connection management

### PostgreSQL Features

- **ACID Transactions**: Guaranteed data consistency
- **Advanced Querying**: Complex SQL queries and joins
- **Schema Migrations**: Automated database schema updates
- **Multi-tenant Tables**: Tenant-specific table isolation

### MongoDB Features

- **Flexible Schema**: Dynamic document structure
- **Aggregation Pipeline**: Complex data analysis
- **Horizontal Scaling**: Sharding and replica sets
- **GridFS Support**: Large file storage

### Elasticsearch Features

- **Full-Text Search**: Advanced search capabilities
- **Aggregations**: Real-time analytics
- **Fuzzy Matching**: Approximate string matching
- **Geo-spatial Queries**: Location-based searches

## Performance Optimization

### Caching Strategy

1. **L1 Cache (Redis)**: Frequently accessed CVE data
2. **L2 Cache (Application)**: Query result caching
3. **L3 Cache (CDN)**: Static content delivery

### Index Optimization

- **Primary Indexes**: CVE ID, vendor, product
- **Composite Indexes**: Multi-field search optimization
- **Text Indexes**: Full-text search performance
- **Geospatial Indexes**: Location-based queries

### Connection Pooling

```typescript
// Configure connection pooling
const poolConfig = {
  min: 2,
  max: 10,
  acquireTimeoutMillis: 30000,
  idleTimeoutMillis: 600000,
  reapIntervalMillis: 1000
};
```

## Multi-Tenancy

### Tenant Isolation

- **Data Isolation**: Complete separation of tenant data
- **Schema Isolation**: Tenant-specific database schemas
- **Connection Isolation**: Separate connection pools per tenant
- **Security Isolation**: Role-based access control

### Tenant Management

```typescript
// Create tenant context
const tenant = new TenantContext('org-456')
  .withUser('user-789')
  .withPermissions(['read', 'write', 'admin']);

// Tenant-specific operations
await cveCore.initializeTenant(tenant);
await cveCore.migrateTenantData(tenant, '2.0');
```

## Monitoring and Observability

### Health Checks

```typescript
// Check data store health
const health = await cveCore.healthCheck();
console.log('Redis:', health.redis ? '✓' : '✗');
console.log('MongoDB:', health.mongodb ? '✓' : '✗');
```

### Metrics Collection

```typescript
// Get performance metrics
const metrics = await cveCore.getMetrics(tenantContext);
console.log(`CVEs stored: ${metrics.totalCves}`);
console.log(`Storage size: ${metrics.storageSizeBytes / 1024 / 1024} MB`);
```

### Logging

```typescript
// Configure structured logging
const logger = cveCore.getLogger();
logger.info('CVE stored successfully', {
  cveId: 'CVE-2023-1234',
  tenantId: 'tenant-123',
  duration: 45
});
```

## Security

### Encryption

- **Data at Rest**: AES-256 encryption
- **Data in Transit**: TLS 1.3 encryption
- **Key Management**: HSM or cloud KMS integration

### Access Control

```typescript
// Role-based access control
const permissions = [
  'cve:read',
  'cve:write', 
  'exploit:read',
  'remediation:write'
];

const context = new TenantContext('tenant-123')
  .withPermissions(permissions);
```

## Backup and Recovery

### Automated Backups

```typescript
// Configure automated backups
const backupConfig = {
  schedule: '0 2 * * *', // Daily at 2 AM
  retention: '30d',
  compression: true,
  encryption: true
};

await cveCore.configureBackups(backupConfig);
```

### Point-in-Time Recovery

```typescript
// Restore from backup
await cveCore.restoreFromBackup({
  timestamp: new Date('2023-01-15T10:00:00Z'),
  tenantId: 'tenant-123'
});
```

## Migration and Upgrades

### Schema Migration

```typescript
// Run database migrations
await cveCore.runMigrations({
  fromVersion: '1.0',
  toVersion: '2.0',
  dryRun: false
});
```

### Data Migration

```typescript
// Migrate between stores
await cveCore.migrateData({
  from: DataStoreType.PostgreSQL,
  to: DataStoreType.MongoDB,
  tenantId: 'tenant-123'
});
```

## Best Practices

### Performance

1. **Use appropriate indexes** for your query patterns
2. **Implement caching layers** for frequently accessed data
3. **Batch operations** for bulk data operations
4. **Monitor query performance** and optimize slow queries

### Security

1. **Enable encryption** for sensitive data
2. **Use strong authentication** mechanisms
3. **Implement audit logging** for compliance
4. **Regular security updates** for dependencies

### Operations

1. **Monitor system health** continuously
2. **Set up alerting** for critical issues
3. **Regular backups** and recovery testing
4. **Capacity planning** for growth

## Troubleshooting

### Common Issues

#### Connection Errors
```bash
# Check Redis connectivity
redis-cli ping

# Check MongoDB connectivity
mongosh --eval "db.runCommand('ping')"

# Check PostgreSQL connectivity
pg_isready -h localhost -p 5432
```

#### Performance Issues
```typescript
// Enable query profiling
await cveCore.enableProfiling({
  slowQueryThreshold: 1000, // ms
  logQueries: true
});
```

#### Memory Issues
```typescript
// Monitor memory usage
const memoryStats = await cveCore.getMemoryStats();
console.log('Heap used:', memoryStats.heapUsed);
console.log('Cache size:', memoryStats.cacheSize);
```

## API Reference

### Core Methods

- `initialize()` - Initialize data store connections
- `storeCVE(cve, context)` - Store CVE data
- `getCVE(id, context)` - Retrieve CVE by ID
- `searchCVEs(criteria, context)` - Search CVEs
- `storeExploit(exploit, context)` - Store exploit timeline
- `getExploit(id, context)` - Get exploit timeline
- `storeRemediation(strategy, context)` - Store remediation strategy
- `getRemediation(id, context)` - Get remediation strategy

### Configuration Methods

- `configure(config)` - Update configuration
- `getConfig()` - Get current configuration
- `validateConfig(config)` - Validate configuration

### Monitoring Methods

- `healthCheck()` - Check system health
- `getMetrics(context)` - Get performance metrics
- `getSystemInfo()` - Get system information

## Support

For technical support and questions:

- GitHub Issues: https://github.com/phantom-spire/phantom-cve-core/issues
- Documentation: https://docs.phantom-spire.com/cve-core
- Community: https://community.phantom-spire.com