# Phantom Spire AI Coding Agent Instructions

## 🎯 Project Overview

**Phantom Spire** is an enterprise-grade Cyber Threat Intelligence Platform featuring 19 high-performance NAPI-RS modules, multi-database architecture, and modular data layer that competes with Palantir Foundry.

### Key Architecture Components
- **Multi-Database Stack**: MongoDB, PostgreSQL, MySQL, Redis, Elasticsearch
- **NAPI-RS Modules**: 19 Rust-based security modules (phantom-cve-core, phantom-intel-core, etc.)
- **Modular Data Layer**: Palantir-competitive federated data access and analytics
- **Workflow BPM**: Fortune 100-grade orchestration engine
- **Enterprise Integration**: Service mesh, message queues, caching layers

## 🏆 Enterprise Competitive Architecture

### Independent Yet Unified Design Philosophy
All 19 packages in `packages/` are architected to **run independently** while **working together** as a cohesive enterprise platform that can **compete with and beat** leading CTI platforms like Palantir Foundry, Recorded Future, and ThreatConnect.

#### **Independent Operation**
Each `phantom-*-core` module is:
- **Self-contained**: Complete functionality without dependencies on other modules
- **Installable separately**: `npm install phantom-cve-core` works standalone
- **API-complete**: Full REST/GraphQL endpoints for independent operation
- **Database-agnostic**: Works with any supported database configuration
- **Feature-flagged**: Granular capability control via Cargo features
- **Unified data layer**: Each package includes its own data layer for independent operation

#### **Enterprise Unity**
When combined, the modules create a platform that:
- **Exceeds Palantir capabilities**: Federated queries across 19 specialized modules
- **Outperforms Recorded Future**: Real-time analytics with sub-100ms cross-plugin queries
- **Surpasses ThreatConnect**: Advanced ML-driven pattern recognition and prediction
- **Beats CrowdStrike Falcon**: Comprehensive MITRE ATT&CK integration with attribution
- **Dominates IBM QRadar**: Multi-database architecture with enterprise-grade caching

#### **Enterprise ML Platform**
- **phantom-ml-core**: Centralized ML engine that all packages use for enterprise-grade machine learning
- **phantom-ml-studio**: Web UI that exceeds H2O.ai as a competitor in ML model development and deployment

#### **Competitive Advantages**
- **Cost**: Open-source vs. $100K+ annual licensing
- **Performance**: NAPI-RS Rust modules vs. interpreted Python/Java
- **Flexibility**: Self-hosted deployment vs. cloud-only restrictions
- **Integration**: Universal data layer vs. proprietary silos
- **Scalability**: Designed for Fortune 100 workloads from day one
- **ML Platform**: phantom-ml-core + phantom-ml-studio outperforms H2O.ai with superior UI/UX

## 🏗️ Critical Build & Development Patterns

### Native Module Development
All `phantom-*-core` packages use **NAPI-RS** (Rust → Node.js bindings):
```bash
# Build native modules first, then TypeScript
npm run build:native && tsc
npm run build:native:debug  # For development

# Test native modules
npm run test:native
```

### Multi-Database Startup Sequence
Always start databases before the application:
```bash
npm run setup:databases    # Start only DBs
npm run setup:full        # Complete stack
npm run setup:reset       # Reset all data
```

### Workspace Management
This is a monorepo with 19+ packages:
```bash
npm run packages:install  # Install all workspace deps
npm run packages:build    # Build all packages
```

## 🔧 19 High-Performance Security Modules

### Core Security Intelligence
- **phantom-cve-core** - CVE vulnerability processing and threat analysis (1,100+ CVEs/sec)
- **phantom-intel-core** - Threat intelligence aggregation and analysis (50,000+ indicators/sec)
- **phantom-ioc-core** - Indicators of Compromise processing with ML correlation
- **phantom-attribution-core** - Threat actor attribution and tracking with confidence scoring
- **phantom-threat-actor-core** - Advanced threat actor profiling and behavioral analysis

### Advanced Analysis & Response
- **phantom-mitre-core** - MITRE ATT&CK framework integration (1,100+ technique lookups/sec)
- **phantom-xdr-core** - Extended Detection and Response (100,000+ events/sec)
- **phantom-incident-response-core** - Incident response orchestration with SOAR integration
- **phantom-forensics-core** - Digital forensics analysis with chain of custody
- **phantom-malware-core** - Malware analysis and detection with sandboxing

### Infrastructure & Operations  
- **phantom-crypto-core** - Cryptographic analysis and validation with certificate management
- **phantom-secop-core** - Security operations center tools with SIEM integration
- **phantom-feeds-core** - Threat feed aggregation and processing (multi-source)
- **phantom-reputation-core** - Reputation scoring and tracking with vendor correlation

### Vulnerability & Risk Management
- **phantom-vulnerability-core** - Vulnerability assessment and scoring with CVSS support
- **phantom-risk-core** - Risk assessment and prioritization with business impact analysis
- **phantom-compliance-core** - Compliance monitoring and reporting (SOX, GDPR, NIST)
- **phantom-hunting-core** - Threat hunting algorithms with behavioral analytics
- **phantom-sandbox-core** - Sandbox analysis integration with multiple engines

### Production Characteristics
Each module provides:
- **Sub-second processing** for real-time threat response
- **Enterprise-grade reliability** with 99.9% uptime
- **Multi-database support** with intelligent data routing
- **Feature flags** for granular capability control via Cargo features
- **Zero-dependency operation** while supporting unified platform integration

## 📂 Essential File Structure

### Core Service Boundaries
- **`src/`**: Main application with enterprise services
  - **`data-layer/`**: Federated query engine & analytics
  - **`workflow-bpm/`**: Fortune 100 orchestration
  - **`enterprise-service-bus/`**: Message routing
  - **`centralized-service-center/`**: Unified API management
- **`packages/`**: 19 NAPI-RS security modules
- **`src/setup/`**: Interactive setup wizard with React UI

### Database-Specific Patterns
- **MongoDB**: Threat intelligence, flexible documents (`src/models/`)
- **PostgreSQL**: Structured data, relationships (`docker/postgresql/`)
- **MySQL**: Analytics, reporting (`docker/mysql/`)
- **Redis**: Caching, sessions, pub/sub
- **Elasticsearch**: Search, log analysis

## ⚡ Development Workflows

### Essential Commands
```bash
# Complete development startup
npm run setup:full && npm run build && npm run dev

# Health monitoring
npm run health:check
npm run logs:app
npm run logs:databases

# Production build
npm run build  # Includes native modules
```

### Database Admin Tools (Always Available)
- **Adminer**: `http://localhost:8080` (all databases)
- **Mongo Express**: `http://localhost:8081` 
- **Redis Commander**: `http://localhost:8082`

## 🔧 Configuration Patterns

### Environment Priority
1. `.env` file (never committed)
2. `src/config/config.ts` (defaults)
3. Docker Compose environment variables

### Critical Config Sections
- **Multi-DB URIs**: All 5 database connections required
- **Enterprise Cache**: Memory + Redis layers with monitoring
- **State Management**: Versioning, persistence, sync intervals
- **Security**: JWT secrets, CORS origins, rate limits

## 📦 Package Development Conventions

### NAPI-RS Module Structure
Each `phantom-*-core` package follows this exact pattern:
```
├── Cargo.toml         # Rust dependencies + feature flags
├── package.json       # NPM + NAPI config with triples
├── src/lib.rs         # Rust implementation with modules
├── index.js           # Generated NAPI bindings
└── index.d.ts         # TypeScript definitions
```

### Feature Flag Architecture
All modules use extensive Cargo features for flexibility:
```toml
[features]
default = ["local"]
enterprise = ["all-databases", "messaging", "caching", "monitoring", "crypto"]
full = ["enterprise", "web-full", "diesel-orm", "advanced-config"]
postgres = ["tokio-postgres", "deadpool-postgres", "diesel"]
mongodb = ["dep:mongodb"]
```

### NAPI-RS Build Commands
```bash
# Standard build (for each module)
cd packages/phantom-cve-core
napi build --platform --release

# Debug build with features
napi build --platform --features napi

# Universal binaries
napi universal

# Clean artifacts
napi artifacts
```

### Adding New Security Modules
1. Copy `packages/package-template.json`
2. Update `napi.name` and `triples` configuration:
   ```json
   "napi": {
     "name": "phantom-new-core",
     "triples": {
       "additional": [
         "aarch64-apple-darwin",
         "aarch64-unknown-linux-gnu",
         "aarch64-pc-windows-msvc",
         "x86_64-unknown-linux-musl"
       ]
     }
   }
   ```
3. Add Cargo workspace entry to root `Cargo.toml`
4. Follow feature flag patterns from existing modules
5. Export main struct from `src/lib.rs`:
   ```rust
   #[cfg(feature = "napi")]
   pub use napi_bindings::YourCoreNapi;
   ```

### Independent Module Development
Each phantom-*-core module must maintain:
- **Standalone functionality**: Complete CTI capabilities without requiring other modules
- **Enterprise integration**: Unified data layer compatibility for cross-module queries
- **Competitive performance**: Sub-millisecond processing to outperform commercial platforms
- **Business readiness**: Professional/Enterprise tier features via configuration assessment

## 🔍 Data Layer Integration

### Federated Query Pattern
The modular data layer enables cross-source queries:
```typescript
// Multi-source IOC query across databases
const results = await dataLayer.query({
  type: 'select',
  entity: 'iocs', 
  filters: {
    severity: 'high',
    timestamp: { $gte: new Date('2024-01-01') }
  },
  fusion: 'union',
  sources: ['mongodb', 'virustotal', 'elasticsearch']
}, context);

// Cross-plugin threat intelligence correlation
const crossPluginQuery: UnifiedQuery = {
  recordTypes: ['ioc', 'mitre_technique', 'security_incident'],
  textQuery: 'command control',
  filters: { severity: 'High', status: 'Open' },
  limit: 10,
  sortBy: 'created_at',
  timeRange: {
    start: new Date('2024-01-01T00:00:00Z'),
    end: new Date('2024-12-31T23:59:59Z'),
  },
};
```

### Universal Data Record Pattern
All plugins use the unified data structure:
```typescript
const maliciousIP: UniversalDataRecord = {
  id: 'ioc-192.168.1.100',
  recordType: 'ioc',
  sourcePlugin: 'phantom-ioc-core',
  data: {
    ioc_type: 'ip',
    value: '192.168.1.100',
    confidence: 0.85,
    threat_score: 7.5,
  },
  metadata: {
    first_seen: new Date('2024-01-15T10:00:00Z'),
    source: 'threat_feed_alpha',
  },
  relationships: [], // Cross-plugin relationships
  tenantId: 'demo-tenant',
};
```

### Plugin Interoperability
```typescript
// Create relationships between plugins
const relationships: DataRelationship[] = [{
  id: `${iocId}-implements-${mitreId}`,
  relationshipType: 'implements',
  sourceId: iocId,
  targetId: mitreId,
  confidence: 0.7,
  metadata: {
    reasoning: 'IOC associated with C2 activities',
    analyst: 'analyst-1',
  },
}];

// Register unified data store adapters
const registry = new UnifiedDataStoreRegistry();
// Adapters auto-created for each phantom-*-core module
```

### Analytics Integration
Built-in threat intelligence analytics:
- **Pattern recognition**: APT campaigns, botnets via `AdvancedAnalyticsEngine`
- **Anomaly detection**: Statistical, isolation forest, LSTM-based
- **Relationship discovery**: Cross-source entity linking with confidence scoring
- **Predictive analytics**: Threat trend forecasting using ML models
- **Enterprise ML**: All packages leverage `phantom-ml-core` for unified machine learning capabilities
- **ML Studio**: `phantom-ml-studio` provides superior web-based model development vs. H2O.ai

## 🚀 Enterprise Features

### Workflow BPM Integration
```typescript
// Workflow orchestrator available on app.locals
const workflow = app.locals.workflowOrchestrator;
await workflow.startWorkflow(definition, context);
```

### Service Mesh Communications
- **Enterprise Service Bus**: Message routing between services
- **Centralized Service Center**: Unified API management
- **Health Monitoring**: Real-time system status

## 🔒 Security & Compliance

### Authentication Patterns
- JWT-based with refresh tokens
- RBAC (Role-Based Access Control)
- Multi-factor authentication support
- Audit logging across all operations

### Data Protection
- AES-256 encryption for sensitive data
- TLS/SSL for all database connections
- Chain of custody for evidence management
- GDPR/SOX compliance features

## ⚙️ Troubleshooting Quick Reference

### Common Issues
- **Native build fails**: Ensure Rust toolchain installed (`rustup default stable`)
- **Database connections**: Check Docker containers are running (`docker ps`)
- **Memory issues**: Node.js may need `--max-old-space-size=8192`
- **Port conflicts**: Default ports: 3000 (app), 27017 (mongo), 5432 (postgres)
- **NAPI module errors**: Run `npm run build:native` before TypeScript compilation

### Debug Commands
```bash
# Check service health
curl http://localhost:3000/health

# Verify database connectivity  
npm run health:check

# View detailed logs
docker-compose logs -f app

# Test NAPI module specifically
cd packages/phantom-cve-core && cargo test
node -e "const { CveCoreNapi } = require('./'); console.log('✅ Module loaded');"

# Debug federated queries
npm run build && node -e "
const demo = require('./dist/examples/cross-plugin-integration-demo.js');
new demo.CrossPluginIntegrationDemo().run();
"
```

### Testing Patterns
```bash
# Test native modules individually
cd packages/phantom-intel-core
cargo test --features enterprise  # Test with all features
npm run test  # Run Node.js integration tests

# Test multi-database functionality
npm run setup:databases  # Start all DBs first
npm run test:integration  # Run integration tests
npm run test:coverage     # Get coverage report

# Demo specific modules
node scripts/demo-cve-core.mjs      # CVE core demo
node scripts/run-enterprise-demo.js # Full enterprise demo
```

## 🎯 AI Agent Best Practices

1. **Always build native modules first** before TypeScript compilation
2. **Start databases** before application when developing
3. **Use workspace commands** for multi-package operations
4. **Follow NAPI-RS patterns** for security module development
5. **Leverage data layer** for cross-source intelligence queries
6. **Consider enterprise features** like workflow orchestration and service mesh
7. **Test with all databases** - the platform requires multi-database functionality

## 🧪 Advanced Development Workflows

### NAPI-RS Development Cycle
```bash
# Complete NAPI module development workflow
cd packages/phantom-new-core

# 1. Write Rust code with proper feature flags
cargo check --all-features  # Check all feature combinations

# 2. Test Rust implementation
cargo test --features "enterprise,napi"  # Test with production features

# 3. Build NAPI bindings
napi build --platform --release --features napi

# 4. Test Node.js integration
npm test  # Runs integration tests

# 5. Generate TypeScript definitions
napi universal  # Creates universal binaries

# 6. Validate in main application
cd ../../ && npm run build && npm run test:native
```

### Cross-Plugin Integration Testing
```typescript
// Example: Testing plugin interoperability
import { CrossPluginIntegrationDemo } from '../examples/cross-plugin-integration-demo.js';

// Test IOC enrichment with MITRE techniques
const demo = new CrossPluginIntegrationDemo();
await demo.demonstrateIOCEnrichment();  // Shows cross-plugin relationships

// Test federated queries across all plugins
await demo.demonstrateThreatHuntingWorkflow();  // Multi-source hunting

// Validate analytics across data sources
await demo.demonstrateAnalyticsAndReporting();  // Unified metrics
```

### Enterprise Configuration Validation
```bash
# Validate business SaaS readiness
node scripts/demo-cve-core.mjs  # Shows configuration assessment

# Expected output patterns:
# - Readiness Level: ENTERPRISE (score: 85/100)
# - Multi-Database Support: Enabled
# - Advanced Analytics: Enabled
# - Cross-Plugin Relationships: Enabled
```

The platform's enterprise architecture and multi-database design make it powerful but complex. Understanding the data flow between databases, NAPI modules, and enterprise services is crucial for effective development.

## 🛡️ Error Handling & Validation Patterns

### Standardized Error Responses
All API endpoints follow consistent error handling:
```typescript
// Standard error response structure
interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}

// Route-level error handling
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await businessLogic.getById(req.params.id);
    if (!item) {
      return res.status(404).json({
        error: 'Not found',
        message: `Item with ID ${req.params.id} not found`
      });
    }
    res.json(item);
  } catch (error) {
    logger.error('Failed to get item', { error: error.message, id: req.params.id });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve item'
    });
  }
});
```

### Validation Middleware
Use express-validator consistently across all routes:
```typescript
import { body, validationResult } from 'express-validator';
import { validateRequest } from '../middleware/validation.js';

const createItemValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'pending', 'completed', 'failed']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
];

router.post('/', createItemValidation, validateRequest, controller.create);
```

### NAPI-RS Error Handling
Native modules use structured error responses:
```rust
// Standard error handling in Rust modules
impl ErrorHandlers {
    pub fn handle_validation_error(error: &str) -> ApiResponse<()> {
        ApiResponse::error(ErrorResponse::validation_error(error))
    }
    
    pub fn handle_not_found(resource: &str, id: &str) -> ApiResponse<()> {
        ApiResponse::error(ErrorResponse::not_found(
            &format!("{} with ID '{}' not found", resource, id)
        ))
    }
}
```

## 🧪 Testing & Quality Assurance Patterns

### Testing Architecture
The project uses comprehensive testing at multiple levels:
```bash
# Native module testing (Rust)
cd packages/phantom-cve-core
cargo test --features enterprise  # Test with all features
cargo bench                       # Performance benchmarks

# Integration testing (Node.js)
npm run test:integration         # Multi-database tests
npm run test:coverage           # Coverage reports
npm run test:native             # NAPI binding tests

# End-to-end testing
npm run test:e2e               # Full stack tests
```

### Test Data Patterns
Use consistent test data structures:
```typescript
// Test data factories
const createTestCVE = () => ({
  cveId: 'CVE-2024-TEST',
  description: 'Test vulnerability description',
  cvssScore: 7.5,
  severity: 'HIGH',
  publishedDate: new Date().toISOString(),
});

const createTestIOC = () => ({
  type: 'ip',
  value: '192.168.1.100',
  confidence: 0.85,
  threat_score: 7.5,
  first_seen: new Date().toISOString(),
});
```

### Performance Testing
Critical for enterprise deployment:
```javascript
// Performance benchmarks for NAPI modules
const measurePerformance = async (moduleName, method, iterations = 1000) => {
  const startTime = process.hrtime.bigint();
  
  for (let i = 0; i < iterations; i++) {
    await method();
  }
  
  const endTime = process.hrtime.bigint();
  const duration = Number(endTime - startTime) / 1000000; // ms
  const opsPerSec = (iterations / duration) * 1000;
  
  console.log(`${moduleName}: ${opsPerSec.toFixed(0)} ops/sec`);
};
```

## 📊 Performance Monitoring & Metrics

### Built-in Performance Monitoring
All modules include comprehensive metrics collection:
```typescript
// Performance monitoring integration
const performanceMonitor = app.locals.performanceMonitor;

// Collect metrics from all phantom-*-core modules
const metrics = await performanceMonitor.collectMetrics({
  collectors: ['system', 'application', 'business', 'network'],
  interval: '1m',
  targets: ['phantom-cve-core', 'phantom-intel-core', 'phantom-xdr-core']
});
```

### Prometheus Integration
Standard metrics export for enterprise monitoring:
```javascript
const prometheus = require('prom-client');

const processingCounter = new prometheus.Counter({
  name: 'phantom_processing_total',
  help: 'Total number of items processed',
  labelNames: ['module', 'type', 'status']
});

const processingDuration = new prometheus.Histogram({
  name: 'phantom_processing_duration_seconds',
  help: 'Processing duration',
  buckets: [0.01, 0.05, 0.1, 0.5, 1.0, 5.0]
});
```

### Health Check Endpoints
Every module exposes standardized health endpoints:
```bash
# Application health
curl http://localhost:3000/health

# Database connectivity
curl http://localhost:3000/health/databases

# Module-specific health
curl http://localhost:3000/health/phantom-cve-core
```

## 🌍 Environment & Deployment Patterns

### Environment Configuration
Multi-tier configuration management:
```bash
# Environment hierarchy
.env                    # Local development (never committed)
.env.example           # Template file
src/config/config.ts   # Default configuration
docker-compose.yml     # Development stack
deployment/            # Production configurations
```

### Docker Deployment
Comprehensive containerization:
```bash
# Development stack
docker-compose up -d                  # Full development environment
docker-compose up -d postgres mysql  # Databases only

# Production deployment
docker-compose -f deployment/docker-compose.enterprise.yml up -d

# Kubernetes deployment
kubectl apply -f deployment/kubernetes/
```

### Database Migration Patterns
Always use proper migrations:
```bash
# Run migrations before deployment
npm run db:migrate

# Seed initial data
npm run db:seed

# Reset for development (never in production!)
npm run setup:reset
```

## 📚 API Documentation Standards

### Swagger/OpenAPI Integration
All routes must include comprehensive documentation:
```typescript
/**
 * @swagger
 * /api/module/{id}:
 *   get:
 *     summary: Get item by ID
 *     tags: [Module Name]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemResponse'
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
```

### API Response Schemas
Consistent response structures:
```typescript
// Standard success response
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

// Standard error response
interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}
```

## 🏢 Business Logic Integration Patterns

### Business Logic Layer Architecture
All modules use standardized business logic:
```typescript
// Business logic base pattern
export class ModuleBusinessLogic extends EventEmitter {
  // Standard CRUD operations
  async getAll(filters?: any): Promise<T[]> { }
  async getById(id: string): Promise<T | null> { }
  async create(data: CreateT, userId: string): Promise<T> { }
  async update(id: string, data: UpdateT, userId: string): Promise<T | null> { }
  async delete(id: string, userId: string): Promise<boolean> { }
  
  // Analytics and reporting
  async getAnalytics(): Promise<AnalyticsT> { }
  
  // Business rule processing
  async processBusinessRules(data: any): Promise<any> { }
}
```

### Event-Driven Architecture
Use EventEmitter for cross-module communication:
```typescript
// Business logic events
businessLogic.on('item:created', (item) => {
  // Trigger workflows, notifications, etc.
  workflowOrchestrator.startWorkflow('item-created', { item });
});

businessLogic.on('item:updated', (item, changes) => {
  // Audit logging, cache invalidation
  auditLogger.log('item-updated', { item, changes });
});
```

### Cross-Module Integration
Leverage the unified data layer for cross-module queries:
```typescript
// Cross-plugin threat intelligence correlation
const crossModuleQuery: UnifiedQuery = {
  recordTypes: ['ioc', 'mitre_technique', 'cve', 'threat_actor'],
  textQuery: 'APT29 lateral movement',
  filters: { 
    severity: 'High', 
    dateRange: { start: '2024-01-01', end: '2024-12-31' }
  },
  sources: ['phantom-ioc-core', 'phantom-mitre-core', 'phantom-cve-core'],
  limit: 50
};

const correlatedResults = await dataLayer.query(crossModuleQuery, context);
```

## 🔧 Advanced Development Guidelines

### Code Generation Patterns
The project includes automated code generation:
```bash
# Generate new modules with consistent structure
node .development/scripts/generate-error-boundary-pages.mjs
node .development/scripts/generate-user-management-pages.mjs

# Generated files follow strict patterns:
# - Routes with complete Swagger documentation
# - Controllers with error handling
# - Business logic with event emission
# - Validation middleware
# - TypeScript interfaces
```

### Workspace Development
Use workspace commands for coordinated development:
```bash
# Build all packages in dependency order
npm run packages:build

# Test all packages with coverage
npm run packages:test

# Lint all packages consistently
npm run packages:lint

# Clean all build artifacts
npm run packages:clean
```

### Feature Flag Integration
All modules support Cargo feature flags for flexibility:
```toml
# Cargo.toml feature patterns
[features]
default = ["local"]
enterprise = ["all-databases", "messaging", "caching", "monitoring"]
full = ["enterprise", "web-full", "diesel-orm", "advanced-config"]
postgres = ["tokio-postgres", "deadpool-postgres", "diesel"]
mongodb = ["dep:mongodb"]
redis = ["dep:redis"]
```