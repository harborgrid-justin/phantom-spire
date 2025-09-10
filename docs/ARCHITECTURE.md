# Phantom Spire - Platform Architecture Documentation

## Overview

Phantom Spire is an enterprise-grade Cyber Threat Intelligence Platform designed for Fortune 100 organizations and government agencies. This document outlines the platform's architecture standards, patterns, and design principles.

## Architecture Principles

### 1. Enterprise-Grade Standards
- **Scalability**: Support for 50,000+ concurrent workflows
- **Reliability**: 99.9% uptime with graceful degradation
- **Security**: Defense-in-depth security model
- **Performance**: Sub-200ms response times for critical operations

### 2. Modular Design
- **Separation of Concerns**: Clear boundaries between layers
- **Loose Coupling**: Minimal dependencies between modules
- **High Cohesion**: Related functionality grouped together
- **Interface Segregation**: Specific interfaces for different concerns

### 3. Microservices Architecture
- **Service Mesh**: Comprehensive service-to-service communication
- **API Gateway**: Centralized API management and routing
- **Event-Driven**: Asynchronous communication patterns
- **Circuit Breakers**: Fault tolerance and resilience

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  React Frontend   │  REST APIs   │  WebSocket APIs          │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Controllers      │  Services    │  Business Logic          │
├─────────────────────────────────────────────────────────────┤
│                    Integration Layer                        │
├─────────────────────────────────────────────────────────────┤
│  API Gateway      │  Message Queue │ Service Mesh           │
├─────────────────────────────────────────────────────────────┤
│                    Data Access Layer                        │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL       │  MongoDB     │  MySQL    │  Redis      │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure Standards

### Backend Structure (`/src`)
```
src/
├── controllers/          # Request handling and validation
├── models/              # Data models and schemas
├── routes/              # API route definitions
├── services/            # Business logic and operations
├── middleware/          # Cross-cutting concerns
├── config/              # Configuration management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── data-layer/          # Database abstraction
├── enterprise-integration/ # Service mesh and API gateway
├── centralized-service-center/ # Unified API management
├── workflow-bpm/        # Business process management
└── setup/               # Application setup and initialization
```

### Packages Structure (`/packages`)
```
packages/
├── phantom-attribution-core/    # Threat attribution and actor profiling
├── phantom-compliance-core/     # Compliance and regulatory framework analysis  
├── phantom-crypto-core/         # Cryptographic analysis and security assessment
├── phantom-cve-core/           # CVE processing and vulnerability intelligence
├── phantom-feeds-core/         # Threat intelligence feeds processing and aggregation
├── phantom-forensics-core/     # Digital forensics and incident analysis
├── phantom-hunting-core/       # Threat hunting and proactive defense
├── phantom-incident-response-core/ # Incident response and forensic analysis
├── phantom-intel-core/         # Threat intelligence gathering and correlation
├── phantom-ioc-core/           # IOC processing and indicator analysis
├── phantom-malware-core/       # Malware analysis and classification
├── phantom-mitre-core/         # MITRE ATT&CK framework integration
├── phantom-reputation-core/    # IP and domain reputation analysis
├── phantom-risk-core/          # Risk assessment and vulnerability prioritization
├── phantom-sandbox-core/       # Automated malware sandboxing and behavioral analysis
├── phantom-secop-core/         # Security operations and automation
├── phantom-threat-actor-core/  # Threat actor attribution and analysis
├── phantom-vulnerability-core/ # Vulnerability assessment and management
└── phantom-xdr-core/           # Extended detection and response
```

Each package follows a standardized structure:
```
phantom-{name}-core/
├── src/                 # Rust source code
├── src-ts/              # TypeScript source (if applicable)
├── Cargo.toml           # Rust dependencies and configuration
├── package.json         # NPM package configuration
├── README.md            # Package documentation
├── LICENSE              # MIT license
├── CHANGELOG.md         # Version history
├── build.rs             # Build script
├── tsconfig.json        # TypeScript configuration
└── .gitignore           # Git ignore rules
```

### Frontend Structure (`/frontend/src`)
```
src/
├── app/                 # Application configuration
├── components/          # Reusable UI components
├── lib/                 # Utility libraries
└── types/               # TypeScript type definitions
```

### Shared Frontend Components (`/src/frontend`)
```
src/frontend/
├── views/               # Page-level components
│   ├── advanced-analytics/
│   ├── business-intelligence/
│   ├── compliance-audit/
│   ├── digital-forensics/
│   ├── network-management/
│   ├── operational-efficiency/
│   └── security-intelligence/
└── components/          # Shared UI components
```

## Component Standards

### Backend Components

#### Controllers
- **Purpose**: Handle HTTP requests and responses
- **Responsibilities**: Input validation, authentication, response formatting
- **Pattern**: 
  ```typescript
  export class ThreatIntelController {
    constructor(private threatIntelService: ThreatIntelService) {}
    
    async getThreats(req: Request, res: Response): Promise<void> {
      try {
        const threats = await this.threatIntelService.getThreats(req.query);
        res.json({ success: true, data: threats });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  }
  ```

#### Services
- **Purpose**: Implement business logic
- **Responsibilities**: Data processing, business rules, external integrations
- **Pattern**:
  ```typescript
  export class ThreatIntelService {
    constructor(private dataLayer: DataLayer) {}
    
    async getThreats(filters: ThreatFilters): Promise<Threat[]> {
      return await this.dataLayer.threats.findMany({
        where: this.buildFilters(filters),
        include: { indicators: true }
      });
    }
  }
  ```

#### Models
- **Purpose**: Define data structures and relationships
- **Responsibilities**: Data validation, schema definition
- **Pattern**:
  ```typescript
  export interface Threat {
    id: string;
    name: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    indicators: Indicator[];
    metadata: ThreatMetadata;
    createdAt: Date;
    updatedAt: Date;
  }
  ```

#### Routes
- **Purpose**: Define API endpoints and routing
- **Responsibilities**: Route configuration, middleware attachment
- **Pattern**:
  ```typescript
  const router = express.Router();
  
  router.get('/threats', 
    validateQuery(threatQuerySchema),
    threatController.getThreats
  );
  
  router.post('/threats',
    authenticate,
    authorize('threat:create'),
    validateBody(threatSchema),
    threatController.createThreat
  );
  ```

### Frontend Components

#### Component Structure
- **Purpose**: Reusable UI building blocks
- **Responsibilities**: Presentation logic, user interaction
- **Pattern**:
  ```typescript
  interface ComponentProps {
    data: ComponentData[];
    onEdit?: (item: ComponentData) => void;
    onDelete?: (id: string) => void;
  }
  
  export const Component: React.FC<ComponentProps> = ({ 
    data, 
    onEdit, 
    onDelete 
  }) => {
    return (
      <Card>
        <CardHeader title="Component Title" />
        <CardContent>
          {/* Component content */}
        </CardContent>
      </Card>
    );
  };
  ```

#### State Management
- **Purpose**: Manage component and application state
- **Pattern**:
  ```typescript
  const [data, setData] = useState<ComponentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    status: 'active',
    metadata: {
      category: 'default',
      tags: [],
      priority: 'medium'
    }
  });
  ```

## Integration Patterns

### API Integration
- **REST APIs**: RESTful endpoints for standard operations
- **WebSocket APIs**: Real-time communication for live updates
- **GraphQL APIs**: Flexible data querying for complex requirements

### Data Layer Integration
- **Repository Pattern**: Abstract data access logic
- **Unit of Work**: Coordinate multiple repository operations
- **Connection Pooling**: Efficient database connection management

### Service Communication
- **Service Mesh**: Istio-based service-to-service communication
- **Message Queues**: Redis-based asynchronous messaging
- **Event Sourcing**: Event-driven architecture for auditability

## Security Standards

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Role-Based Access Control (RBAC)**: Granular permissions
- **Multi-Factor Authentication (MFA)**: Enhanced security

### Data Protection
- **Encryption at Rest**: AES-256 encryption for stored data
- **Encryption in Transit**: TLS 1.3 for all communications
- **Data Masking**: Sensitive data protection in logs

### API Security
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **Input Validation**: Comprehensive request validation
- **CORS Policy**: Secure cross-origin resource sharing

## Performance Standards

### Response Times
- **API Endpoints**: < 200ms for 95th percentile
- **Database Queries**: < 100ms for standard operations
- **Real-time Updates**: < 50ms latency

### Scalability
- **Horizontal Scaling**: Auto-scaling based on load
- **Vertical Scaling**: Resource optimization
- **Caching Strategy**: Multi-layer caching (Redis, CDN)

### Monitoring
- **APM**: Application performance monitoring
- **Logging**: Structured logging with Winston
- **Metrics**: Prometheus-based metrics collection

## Package Architecture

### Independent Package Design
Each phantom-*-core package is designed to be completely independent and can be installed and used as a standalone Node.js package. This modular architecture provides:

- **Isolated Dependencies**: Each package manages its own dependencies
- **Independent Versioning**: Packages can be versioned and released independently
- **Standalone Functionality**: Each package provides complete functionality for its domain
- **Cross-Platform Support**: Native Rust implementations with NAPI bindings

### Package Installation
Each package can be installed independently via npm:

```bash
# Install individual packages
npm install phantom-cve-core
npm install phantom-intel-core
npm install phantom-xdr-core
npm install phantom-malware-core
npm install phantom-forensics-core

# Or install multiple packages
npm install phantom-cve-core phantom-intel-core phantom-mitre-core
npm install phantom-attribution-core phantom-hunting-core phantom-sandbox-core
```

### Package Usage
```javascript
// Use packages independently
const cveCore = require('phantom-cve-core');
const intelCore = require('phantom-intel-core');
const xdrCore = require('phantom-xdr-core');
const malwareCore = require('phantom-malware-core');
const forensicsCore = require('phantom-forensics-core');
const sandboxCore = require('phantom-sandbox-core');

// Each package provides its own API
const cveResults = cveCore.searchCVEs({ severity: 'critical' });
const threatIntel = intelCore.correlateIndicators(indicators);
const xdrAnalysis = xdrCore.detectThreats(logs);
const malwareAnalysis = malwareCore.analyzeSample(fileBuffer);
const forensicsReport = forensicsCore.investigateIncident(evidence);
const sandboxResults = sandboxCore.executeSample(malwareFile);
```

### Monorepo Management
The project uses npm workspaces for monorepo management:

```bash
# Install all package dependencies
npm run packages:install

# Build all packages
npm run packages:build

# Test all packages
npm run packages:test

# Lint all packages
npm run packages:lint
```

### Package Standards
All packages follow consistent standards:

- **Naming Convention**: `phantom-{domain}-core`
- **Version Alignment**: Semantic versioning (semver)
- **License**: MIT License
- **Documentation**: Comprehensive README with API docs
- **TypeScript**: Full TypeScript support with type definitions
- **Testing**: Comprehensive test coverage
- **CI/CD**: Automated building and testing

## Development Standards

### Code Quality
- **TypeScript**: Strict typing for all code
- **ESLint**: Consistent code formatting
- **Prettier**: Automated code formatting
- **Jest**: Comprehensive testing coverage

### Documentation
- **API Documentation**: OpenAPI/Swagger specifications
- **Code Documentation**: JSDoc comments
- **Architecture Documentation**: Living architecture documents

### Version Control
- **Git Flow**: Structured branching strategy
- **Conventional Commits**: Standardized commit messages
- **Pull Request Reviews**: Mandatory code reviews

## Deployment Standards

### Containerization
- **Docker**: Containerized applications
- **Docker Compose**: Local development environment
- **Kubernetes**: Production orchestration

### CI/CD Pipeline
- **GitHub Actions**: Automated build and deployment
- **Testing**: Automated testing in pipeline
- **Security Scanning**: Vulnerability assessment

### Infrastructure
- **Infrastructure as Code**: Terraform for infrastructure
- **Monitoring**: Comprehensive system monitoring
- **Backup & Recovery**: Automated backup strategies

## Governance & Compliance

### Architecture Governance
- **Architecture Review Board**: Regular architecture reviews
- **Design Patterns**: Standardized design patterns
- **Best Practices**: Documented best practices

### Compliance
- **GDPR**: Data privacy compliance
- **SOC 2**: Security compliance
- **NIST Framework**: Cybersecurity framework compliance

---

*This document is maintained by the Phantom Spire Architecture Team and is updated regularly to reflect the current state of the platform.*