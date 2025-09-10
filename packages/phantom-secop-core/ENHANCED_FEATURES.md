# Phantom SecOp Core - Enhanced with Multi-Data Store Support

This document describes the enhanced phantom-secop-core plugin with business SaaS readiness featuring multi-data store support for Redis, PostgreSQL, MongoDB, and Elasticsearch.

## Overview

The phantom-secop-core plugin has been extended to support multiple data stores for different purposes:

- **Redis**: High-performance caching, real-time data, and pub/sub messaging
- **PostgreSQL**: Structured data with ACID properties and complex relationships  
- **MongoDB**: Flexible document storage and horizontal scaling
- **Elasticsearch**: Advanced search, analytics, and full-text indexing

## Architecture

The plugin now includes:

1. **Data Store Abstractions** (`datastore.rs`)
   - Common traits for all data operations
   - Configuration management
   - Factory pattern for store creation

2. **Multiple Store Implementations** (`stores/`)
   - Memory store (default, for development)
   - Redis store (caching and real-time)
   - PostgreSQL store (structured data)
   - MongoDB store (document storage)
   - Elasticsearch store (search and analytics)
   - Hybrid store (optimal multi-store usage)

3. **Enhanced SecOpCore**
   - Configurable data store selection
   - Async operations for external stores
   - Graceful fallback to in-memory storage

## Configuration

```typescript
// Example configuration
const config = {
  redis_url: "redis://localhost:6379",
  postgres_url: "postgresql://postgres:password@localhost:5432/phantom_spire",
  mongodb_url: "mongodb://admin:password@localhost:27017/phantom-spire",
  elasticsearch_url: "http://localhost:9200",
  default_store: "Hybrid", // or "Memory", "Redis", "PostgreSQL", "MongoDB", "Elasticsearch"
  cache_enabled: true,
  connection_pool_size: 10
};
```

## Usage Examples

### JavaScript/Node.js

```javascript
import SecOpCore from 'phantom-secop-core';

// Create with default in-memory storage
const secOpMemory = new SecOpCore();

// Create with external data stores
const secOpConfig = SecOpCore.newWithDataStore(JSON.stringify(config));
await secOpConfig.initializeDataStore();

// Check data store health
const isHealthy = secOpConfig.dataStoreHealth();
console.log('Data store healthy:', isHealthy);

// Get configuration info
const storeInfo = secOpConfig.getDataStoreInfo();
console.log('Store info:', JSON.parse(storeInfo));

// Create incidents (automatically uses appropriate data store)
const incidentId = secOpConfig.createIncident(
  'Malware Detection',
  'Suspicious executable found',
  'Malware',
  'High'
);

// All existing methods work the same way
const incident = secOpConfig.getIncident(incidentId);
const metrics = secOpConfig.generateSecurityMetrics(
  '2024-01-01T00:00:00Z',
  '2024-01-31T23:59:59Z'
);
```

### Benefits of Multi-Store Architecture

#### Performance Optimization
- **Redis**: Sub-millisecond caching for frequently accessed data
- **PostgreSQL**: Complex queries with joins and transactions
- **MongoDB**: Fast document retrieval and flexible schema
- **Elasticsearch**: Lightning-fast full-text search and analytics

#### Scalability
- **Horizontal scaling** with MongoDB and Elasticsearch
- **Connection pooling** for all external stores
- **Automatic failover** to in-memory storage if external stores fail

#### Data Consistency
- **ACID transactions** for critical data in PostgreSQL
- **Eventual consistency** for search indexes in Elasticsearch
- **Cache invalidation** strategies across Redis and primary stores

#### Business SaaS Readiness
- **Multi-tenancy** support with proper data isolation
- **Backup and recovery** strategies for each store type
- **Monitoring and alerting** for data store health
- **Configuration management** for different environments

## Data Flow Examples

### Incident Creation
1. **Create** in primary store (PostgreSQL/MongoDB)
2. **Cache** in Redis for fast access
3. **Index** in Elasticsearch for search
4. **Publish** real-time updates via Redis pub/sub

### Alert Processing
1. **Store** alert data in primary store
2. **Cache** active alerts in Redis
3. **Update** search indexes in Elasticsearch
4. **Trigger** automated workflows

### Evidence Management
1. **Store** evidence metadata in PostgreSQL
2. **Store** evidence documents in MongoDB
3. **Index** content in Elasticsearch for search
4. **Cache** frequently accessed evidence in Redis

## Advanced Features

### Search and Analytics
```javascript
// Advanced search using Elasticsearch
const searchResults = await secOp.searchIncidents({
  query: "malware AND (severity:High OR severity:Critical)",
  filters: { status: "InProgress" },
  sort_by: "created_at",
  sort_order: "Descending",
  limit: 50
});

// Analytics and aggregations
const analytics = await secOp.aggregate("incidents", JSON.stringify({
  aggs: {
    by_severity: { terms: { field: "severity" } },
    by_month: { date_histogram: { field: "created_at", interval: "month" } }
  }
}));
```

### Real-time Updates
```javascript
// Subscribe to real-time updates via Redis
await secOp.subscribe("incident_updates", (message) => {
  const update = JSON.parse(message);
  console.log('Real-time update:', update);
});

// Publish updates
await secOp.publish("incident_updates", JSON.stringify({
  type: "incident_created",
  incident_id: incidentId,
  severity: "High"
}));
```

### Caching Strategies
```javascript
// Set custom cache TTL for different data types
await secOp.cacheSet("incident_metrics", metricsData, 300); // 5 minutes
await secOp.cacheSet("active_alerts", alertsData, 60);     // 1 minute
await secOp.cacheSet("playbook_configs", configData, 3600); // 1 hour

// Cache with hash fields for structured data
await secOp.cacheSetHash("user_sessions", userId, sessionData);
const userSession = await secOp.cacheGetHash("user_sessions", userId);
```

## Production Deployment

### Docker Compose Setup
```yaml
version: '3.8'
services:
  phantom-spire:
    image: phantom-spire:latest
    environment:
      - REDIS_URL=redis://redis:6379
      - POSTGRES_URL=postgresql://postgres:password@postgres:5432/phantom_spire
      - MONGODB_URL=mongodb://mongo:27017/phantom-spire
      - ELASTICSEARCH_URL=http://elasticsearch:9200
    depends_on:
      - redis
      - postgres
      - mongo
      - elasticsearch

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass phantom_redis_pass

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=phantom_spire
      - POSTGRES_PASSWORD=phantom_secure_pass

  mongo:
    image: mongo:7
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=phantom_secure_pass

  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
```

### Health Monitoring
```javascript
// Continuous health monitoring
setInterval(async () => {
  const health = {
    redis: await secOp.redisHealth(),
    postgres: await secOp.postgresHealth(),
    mongodb: await secOp.mongodbHealth(),
    elasticsearch: await secOp.elasticsearchHealth()
  };
  
  console.log('Data store health:', health);
  
  // Alert if any store is unhealthy
  Object.entries(health).forEach(([store, isHealthy]) => {
    if (!isHealthy) {
      console.error(`${store} is unhealthy!`);
      // Send alert to monitoring system
    }
  });
}, 30000); // Check every 30 seconds
```

## Migration and Compatibility

### Backward Compatibility
- All existing APIs remain unchanged
- In-memory storage is still the default
- No breaking changes to existing functionality

### Migration Path
1. **Development**: Start with in-memory storage
2. **Testing**: Add Redis for caching
3. **Staging**: Add PostgreSQL for structured data
4. **Production**: Full multi-store deployment

### Data Migration Tools
```javascript
// Migrate existing in-memory data to external stores
const migrationResult = await secOp.migrateToExternalStores({
  source: "memory",
  targets: ["postgresql", "elasticsearch"],
  batch_size: 1000,
  verify_integrity: true
});

console.log('Migration completed:', migrationResult);
```

This enhanced phantom-secop-core plugin provides a robust, scalable foundation for enterprise security operations with the flexibility to choose the right data store for each use case while maintaining backward compatibility with existing implementations.