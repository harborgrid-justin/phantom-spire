# Business SaaS Data Store Extension for phantom-incidentResponse-core

## Overview

This extension enhances the phantom-incidentResponse-core plugin with enterprise-grade Business SaaS capabilities, providing multi-tenant data persistence across Redis, PostgreSQL, MongoDB, and Elasticsearch data stores.

## Features

### 🏢 Multi-Tenancy Support
- **Tenant Isolation**: Complete data isolation between tenants
- **Configurable Quotas**: Incident limits, storage quotas, API rate limits
- **Feature Toggles**: Enable/disable features per tenant
- **Data Retention Policies**: Configurable retention periods for different data types

### 💾 Multi-Database Support
- **MongoDB**: Primary document store for incident data
- **PostgreSQL**: Relational database for structured analytics
- **Redis**: In-memory caching and real-time session management
- **Elasticsearch**: Full-text search and advanced analytics

### 🚀 Real-Time Capabilities
- **Live Updates**: Real-time incident status updates via Redis pub/sub
- **WebSocket Support**: Real-time notifications to connected clients
- **Event Streaming**: Stream incident events for external integrations

### 📊 Advanced Analytics
- **Multi-Source Analytics**: Federated queries across all data stores
- **Custom Reports**: Configurable reporting with various grouping options
- **Trend Analysis**: Historical trend analysis and pattern detection
- **Export/Import**: Data export in JSON/CSV formats

### 🔒 Enterprise Security
- **Data Encryption**: Encryption at rest and in transit
- **Access Controls**: Role-based access control (RBAC)
- **Audit Logging**: Comprehensive audit trail
- **Compliance**: GDPR, SOX, HIPAA compliance features

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Business SaaS Layer                     │
├─────────────────────────────────────────────────────────┤
│  phantom-incidentResponse-core Enhanced API            │
├─────────────────────────────────────────────────────────┤
│              Data Federation Engine                    │
├─────────────────────────────────────────────────────────┤
│  MongoDB    │ PostgreSQL │   Redis    │ Elasticsearch  │
│ (Primary)   │(Analytics) │ (Cache)    │   (Search)     │
└─────────────────────────────────────────────────────────┘
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- PostgreSQL 13+
- Redis 6.0+
- Elasticsearch 8.0+

### Installation

```bash
npm install phantom-spire
```

### Configuration

```typescript
import { createBusinessSaaSIncidentResponse } from 'phantom-spire';

const config = {
  tenantId: 'your-tenant-id',
  dataStore: {
    mongodb: {
      uri: 'mongodb://localhost:27017',
      database: 'phantom_spire'
    },
    postgresql: {
      connectionString: 'postgresql://user:pass@localhost:5432/phantom_spire'
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
    apiAccess: true,
    ssoIntegration: false
  },
  quotas: {
    maxIncidents: 10000,
    maxEvidenceSize: 10737418240, // 10GB
    maxApiRequestsPerHour: 1000,
    maxConcurrentUsers: 100
  }
};

const incidentResponse = createBusinessSaaSIncidentResponse(config);
```

## API Reference

### Core Incident Operations

#### Create Incident (Persistent)
```typescript
const incidentId = await incidentResponse.createIncidentPersistent({
  title: 'Security Breach Detected',
  description: 'Unauthorized access detected in production system',
  severity: IncidentSeverity.Critical,
  category: IncidentCategory.SecurityBreach,
  reportedBy: 'security-team@company.com'
});
```

#### Get Incident (Persistent)
```typescript
const incident = await incidentResponse.getIncidentPersistent(incidentId);
```

#### Update Incident (Persistent)
```typescript
const success = await incidentResponse.updateIncidentPersistent(incidentId, {
  status: IncidentStatus.InProgress,
  assignedTo: 'incident-commander-001'
});
```

#### List Incidents with Filtering
```typescript
const { incidents, total } = await incidentResponse.listIncidentsPersistent(
  { severity: IncidentSeverity.High },
  { offset: 0, limit: 50 }
);
```

### Evidence Management

#### Add Evidence
```typescript
const evidenceId = await incidentResponse.addEvidencePersistent(incidentId, {
  name: 'Network Logs',
  type: 'log_file',
  filePath: '/evidence/network.log',
  hash: 'sha256:abc123...',
  collectedBy: 'forensics-team'
});
```

#### Get Evidence
```typescript
const evidence = await incidentResponse.getEvidencePersistent(incidentId, evidenceId);
```

### Search & Analytics

#### Full-Text Search
```typescript
const results = await incidentResponse.searchIncidentsPersistent(
  'malware attack',
  { severity: IncidentSeverity.High }
);
```

#### Generate Analytics
```typescript
const analytics = await incidentResponse.generateAdvancedAnalytics({
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
});
```

#### Custom Reports
```typescript
const report = await incidentResponse.generateCustomReport({
  type: 'incidents',
  dateRange: { start: lastWeek, end: today },
  groupBy: ['severity', 'category'],
  aggregations: ['count', 'avg_resolution_time']
});
```

### Real-Time Updates

#### Subscribe to Incident Updates
```typescript
await incidentResponse.subscribeToIncidentUpdates(incidentId, (update) => {
  console.log('Real-time update:', update);
});
```

#### Publish Update
```typescript
await incidentResponse.publishIncidentUpdate(incidentId, {
  type: 'status_change',
  message: 'Incident escalated to critical',
  actor: 'incident-commander'
});
```

### Data Export/Import

#### Export Data
```typescript
const exportData = await incidentResponse.exportIncidentData(
  [incidentId1, incidentId2],
  'json'
);
```

#### Import Data
```typescript
const result = await incidentResponse.importIncidentData(
  incidentDataArray,
  true // validate schema
);
```

### Tenant Management

#### Get Tenant Information
```typescript
const tenantInfo = await incidentResponse.getTenantInfo();
```

#### Get Tenant Metrics
```typescript
const metrics = await incidentResponse.getTenantMetrics();
```

#### System Health
```typescript
const health = await incidentResponse.getSystemHealth();
```

## Data Store Specific Features

### MongoDB Features
- Document-based incident storage
- Flexible schema for incident metadata
- GridFS for large evidence files
- Aggregation pipeline for analytics

### PostgreSQL Features
- ACID transactions for critical operations
- Full-text search with ranking
- Materialized views for fast analytics
- Partitioning for large datasets

### Redis Features
- Sub-second caching for frequently accessed data
- Real-time pub/sub for live updates
- Session management
- Rate limiting counters

### Elasticsearch Features
- Advanced full-text search with scoring
- Real-time indexing
- Faceted search and aggregations
- Similar incident detection
- Log analysis and pattern detection

## Performance Considerations

### Caching Strategy
- **L1 Cache**: In-memory application cache (5 minutes TTL)
- **L2 Cache**: Redis cache (30 minutes TTL)  
- **L3 Storage**: Primary database (persistent)

### Scaling Guidelines
- **Read Replicas**: Use PostgreSQL/MongoDB read replicas for read-heavy workloads
- **Sharding**: Implement tenant-based sharding for large deployments
- **Elasticsearch Clusters**: Use multi-node ES clusters for search scalability
- **Redis Clustering**: Implement Redis clustering for high availability

### Monitoring
- Built-in health checks for all data stores
- Performance metrics collection
- Automated alerting for system issues
- Capacity planning dashboards

## Security Best Practices

### Data Protection
- Encrypt sensitive data at rest using AES-256
- Use TLS 1.3 for all network communications
- Implement field-level encryption for PII
- Regular security audits and penetration testing

### Access Control
- Implement principle of least privilege
- Multi-factor authentication for admin access
- Regular access reviews and rotation
- API key management and rotation

### Compliance
- GDPR: Right to erasure, data portability
- SOX: Audit trails, data integrity
- HIPAA: PHI protection, access logging
- PCI DSS: Secure data transmission

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
npm run health:check

# View database logs
npm run logs:databases
```

#### Performance Issues
```bash
# Monitor system performance
npm run analyze:system

# Generate performance report
npm run analyze:system:report
```

#### Cache Issues
```bash
# Clear Redis cache
redis-cli FLUSHDB

# Restart Redis service
systemctl restart redis
```

### Debugging

Enable debug logging:
```typescript
process.env.LOG_LEVEL = 'debug';
```

Monitor real-time metrics:
```bash
npm run metrics:dashboard
```

## Migration Guide

### From Legacy System
1. **Data Assessment**: Analyze existing incident data structure
2. **Schema Mapping**: Map legacy fields to new schema
3. **Migration Scripts**: Use provided migration utilities
4. **Validation**: Verify data integrity post-migration
5. **Cutover**: Switch to new system with minimal downtime

### Version Upgrades
- **Backward Compatibility**: Maintained for 2 major versions
- **Migration Scripts**: Automated schema upgrades
- **Rollback Support**: Full rollback capability
- **Testing**: Comprehensive upgrade testing procedures

## Support

### Documentation
- [API Reference](./api-reference.md)
- [Configuration Guide](./configuration.md)
- [Deployment Guide](./deployment.md)
- [Security Guide](./security.md)

### Community
- GitHub Issues: Report bugs and request features
- Discussion Forum: Community support and best practices
- Documentation Wiki: Community-contributed guides

### Enterprise Support
- 24/7 Technical Support
- Professional Services
- Custom Development
- Training and Certification

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

*This extension transforms the phantom-incidentResponse-core plugin into an enterprise-ready, multi-tenant Business SaaS platform with comprehensive data persistence and real-time capabilities.*