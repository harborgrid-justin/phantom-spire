# Phantom SecOp Core

Advanced Security Operations (SecOps) engine for comprehensive incident response, automation, and security orchestration.

## 🚀 Enhanced for Business SaaS Readiness

**NEW**: Multi-data store support for enterprise scalability and performance:

- **Redis**: High-performance caching, real-time data, and pub/sub messaging
- **PostgreSQL**: Structured data with ACID properties and complex relationships  
- **MongoDB**: Flexible document storage and horizontal scaling
- **Elasticsearch**: Advanced search, analytics, and full-text indexing

## Features

### Core Capabilities (Enhanced)

- **Multi-Store Architecture**: Choose the right data store for each use case
- **Incident Response**: Full incident lifecycle management with persistent storage
- **Alert Correlation**: Advanced pattern matching with distributed caching
- **Automated Playbooks**: Configurable response automation with workflow persistence
- **Evidence Chain**: Cryptographic evidence integrity with multiple storage backends
- **Security Analytics**: Real-time metrics with Elasticsearch-powered search
- **Compliance Reporting**: Multi-framework compliance with audit trails

### Business SaaS Features

- **High Availability**: Automatic failover between data stores
- **Horizontal Scaling**: MongoDB and Elasticsearch clustering support
- **Performance Optimization**: Redis caching for sub-millisecond response times
- **Data Consistency**: ACID transactions where needed, eventual consistency for search
- **Multi-Tenancy**: Proper data isolation across different storage backends
- **Monitoring**: Comprehensive health checks for all data stores

## Installation

```bash
npm install @phantom-core/secop
```

## Quick Start

### Basic Usage (In-Memory)

```typescript
import SecOpCore from '@phantom-core/secop';

// Default in-memory storage (backward compatible)
const secOp = new SecOpCore();

// Create a security incident
const incidentId = secOp.createIncident(
  'Suspicious Network Activity',
  'Unusual outbound traffic detected',
  'NetworkIntrusion',
  'High'
);
```

### Enhanced Usage (Multi-Store)

```typescript
import SecOpCore from '@phantom-core/secop';

// Configuration for multi-store setup
const config = {
  redis_url: "redis://localhost:6379",
  postgres_url: "postgresql://postgres:password@localhost:5432/phantom_spire",
  mongodb_url: "mongodb://admin:password@localhost:27017/phantom-core",
  elasticsearch_url: "http://localhost:9200",
  default_store: "Hybrid",
  cache_enabled: true,
  connection_pool_size: 10
};

// Create with external data stores
const secOp = SecOpCore.newWithDataStore(JSON.stringify(config));
await secOp.initializeDataStore();

// All methods work the same, but now with persistent storage!
const incidentId = secOp.createIncident(
  'Malware Detection',
  'Suspicious executable found',
  'Malware',
  'High'
);

// Advanced search powered by Elasticsearch
const incidents = secOp.searchIncidents({
  query: "malware AND severity:High",
  sort_by: "created_at",
  sort_order: "Descending",
  limit: 50
});
```

## Data Store Options

### Memory (Default)
- **Use case**: Development, testing, small deployments
- **Benefits**: Zero configuration, fast startup
- **Limitations**: Data lost on restart

### Redis
- **Use case**: High-performance caching, real-time features
- **Benefits**: Sub-millisecond response times, pub/sub messaging
- **Best for**: Session data, frequently accessed alerts

### PostgreSQL  
- **Use case**: Structured data requiring ACID properties
- **Benefits**: Complex queries, transactions, data integrity
- **Best for**: Incident management, audit trails, relationships

### MongoDB
- **Use case**: Flexible document storage, rapid development
- **Benefits**: Schema flexibility, horizontal scaling
- **Best for**: Evidence metadata, workflow definitions

### Elasticsearch
- **Use case**: Advanced search and analytics
- **Benefits**: Full-text search, aggregations, real-time analytics
- **Best for**: Log analysis, threat hunting, reporting

### Hybrid (Recommended)
- **Use case**: Production deployments
- **Benefits**: Optimal data store for each operation
- **Architecture**: 
  - PostgreSQL: Primary structured data
  - Redis: Caching and real-time features  
  - Elasticsearch: Search and analytics
  - MongoDB: Flexible documents

## Configuration

Create a `config.json` file:

```json
{
  "redis_url": "redis://localhost:6379",
  "postgres_url": "postgresql://postgres:password@localhost:5432/phantom_spire",
  "mongodb_url": "mongodb://admin:password@localhost:27017/phantom-core",
  "elasticsearch_url": "http://localhost:9200",
  "default_store": "Hybrid",
  "cache_enabled": true,
  "connection_pool_size": 10
}
```

## API Reference

The plugin provides **22+ comprehensive methods** with enhanced storage capabilities:

### Core Incident Management
- `createIncident(title, description, category, severity)` - Persistent incident creation
- `getIncident(id)` - Fast retrieval with caching
- `updateIncidentStatus(id, status, actor)` - Atomic status updates
- `generateSecurityMetrics(startDate, endDate)` - Analytics with Elasticsearch

### Enhanced Search
- `searchIncidents(criteria)` - Advanced search with Elasticsearch
- `searchAlerts(criteria)` - High-performance alert queries
- `getActiveAlerts()` - Cached active alerts for real-time dashboards

### Data Store Health
- `dataStoreHealth()` - Overall health status
- `getDataStoreInfo()` - Configuration and status information
- `initializeDataStore()` - Setup external connections

## Performance Benefits

### Caching with Redis
- **90%+ faster** repeated data access
- **Real-time** alert updates via pub/sub
- **Session storage** for web applications

### Search with Elasticsearch
- **Sub-second** full-text search across millions of records
- **Advanced analytics** and aggregations
- **Real-time indexing** of new incidents and alerts

### Structured Data with PostgreSQL
- **ACID compliance** for critical security data
- **Complex queries** with joins and relationships
- **Data integrity** with foreign key constraints

### Document Storage with MongoDB
- **Schema flexibility** for evolving security data
- **Horizontal scaling** for large deployments
- **GridFS support** for large evidence files

## Production Deployment

### Docker Compose

```yaml
version: '3.8'
services:
  phantom-core:
    image: phantom-core:latest
    environment:
      - PHANTOM_CONFIG=/app/config.json
    volumes:
      - ./config.json:/app/config.json
    depends_on:
      - redis
      - postgres
      - mongo
      - elasticsearch

  redis:
    image: redis:7-alpine
    
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=phantom_spire
      
  mongo:
    image: mongo:7
    
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
```

### Kubernetes

```bash
kubectl apply -f deployment/k8s/
```

## Migration Guide

### From In-Memory to External Stores

1. **Start with Redis** for immediate performance gains
2. **Add PostgreSQL** for data persistence  
3. **Include Elasticsearch** for advanced search
4. **Use Hybrid mode** for optimal performance

### Zero-Downtime Migration

```typescript
// 1. Configure new data stores
const newConfig = { /* enhanced config */ };
const newSecOp = SecOpCore.newWithDataStore(JSON.stringify(newConfig));

// 2. Migrate existing data
await migrateData(oldSecOp, newSecOp);

// 3. Switch traffic
app.secOp = newSecOp;
```

## Monitoring and Observability

### Health Checks

```typescript
// Monitor all data stores
const health = {
  redis: await secOp.redisHealth(),
  postgres: await secOp.postgresHealth(),
  mongodb: await secOp.mongodbHealth(),
  elasticsearch: await secOp.elasticsearchHealth()
};
```

### Metrics

- **Response times** for each data store
- **Cache hit ratios** for Redis
- **Search performance** for Elasticsearch
- **Transaction throughput** for PostgreSQL

## Backward Compatibility

- ✅ **All existing APIs** work unchanged
- ✅ **Default in-memory** storage preserved  
- ✅ **Zero breaking changes** to current implementations
- ✅ **Gradual migration** path available

## Enterprise Features

- **Multi-tenancy** with data isolation
- **Backup and recovery** strategies
- **Audit logging** across all stores
- **Performance monitoring** and alerting
- **High availability** configurations
- **Security hardening** for production

## Support

For detailed documentation and examples, see:
- [Enhanced Features Guide](./ENHANCED_FEATURES.md)
- [Configuration Examples](./config.example.json)
- [API Documentation](./API.md)

## License

MIT License - see LICENSE file for details.

---

**Built for Enterprise Security Teams** who need reliable, scalable, and high-performance security operations with the flexibility to choose the right data store for each use case.

