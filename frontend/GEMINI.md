# Phantom Spire - Enterprise Cybersecurity Intelligence Platform (v1.0.0)

## Overview

Phantom Spire is a production-ready, enterprise-grade cybersecurity intelligence platform designed for Fortune 100 organizations and government agencies. Built with a comprehensive multi-database architecture and 8 specialized Rust-based core modules, the platform provides advanced threat detection, vulnerability management, incident response, and security operations capabilities with complete data layer infrastructure.

## Production Status

🚀 **Production Ready** - Version 1.0.0 with enterprise deployment capabilities
✅ **Multi-Database Architecture** - PostgreSQL, MySQL, MongoDB, Redis
✅ **One-Click Installation** - Automated deployment with setup wizard
✅ **Enterprise Security** - RBAC, audit logging, encryption, compliance ready
✅ **Scalable Deployment** - Docker, Kubernetes, systemd services

## Architecture

### Multi-Database Data Layer
- **MongoDB**: Flexible document storage for threat intelligence data
- **PostgreSQL**: Structured data, relationships, and complex queries  
- **MySQL**: Analytics, reporting, and performance metrics
- **Redis**: High-performance caching, sessions, and real-time data

### Core Modules (Rust + Node.js Bindings)

The platform consists of 8 specialized core modules in the `packages/` workspace:

1. **phantom-xdr-core** - Extended Detection and Response Engine
2. **phantom-ioc-core** - Indicators of Compromise Processing
3. **phantom-cve-core** - Vulnerability Management and Analysis
4. **phantom-intel-core** - Threat Intelligence Platform
5. **phantom-mitre-core** - MITRE ATT&CK Framework Integration
6. **phantom-secop-core** - Security Operations Center
7. **phantom-threat-actor-core** - Threat Actor Profiling and Attribution
8. **phantom-incident-response-core** - Incident Response Management

### Enterprise Features
- **Interactive Setup Wizard**: Complete guided configuration experience
- **Real-time Health Monitoring**: Comprehensive system and database monitoring
- **Integrated Admin Tools**: Built-in database administration interfaces
- **Production-Ready Deployment**: Systemd services, Docker containers, Kubernetes support

## Key Features

### 🛡️ Extended Detection and Response (XDR)
- Advanced threat detection across multiple vectors
- Zero Trust security model implementation
- Behavioral analytics and anomaly detection
- Machine learning-powered threat prediction
- Automated response orchestration
- Network traffic analysis and correlation

### 🔍 Threat Intelligence
- Multi-source intelligence feed aggregation
- Indicator enrichment and correlation
- Threat actor profiling and attribution
- Campaign tracking and analysis
- STIX/TAXII integration
- Real-time threat landscape analysis

### 🚨 Vulnerability Management
- CVE processing with advanced threat intelligence
- Exploit timeline prediction and analysis
- Automated remediation strategy generation
- Risk assessment and prioritization
- Patch management recommendations
- Supply chain vulnerability tracking

### 📊 Security Operations
- Centralized security event management
- Incident response workflow automation
- Compliance monitoring and reporting
- Asset inventory and risk assessment
- Security metrics and KPI tracking
- Integration with existing security tools

### 🎯 Indicators of Compromise (IOC)
- Multi-format IOC processing (IP, Domain, Hash, etc.)
- Threat correlation and analysis
- Impact assessment and risk scoring
- Automated threat hunting capabilities
- False positive reduction algorithms
- WASM-compatible processing engine

## Technology Stack

### Frontend Technologies
- **Next.js 15.5.2** - React framework with App Router
- **TypeScript 5** - Type-safe JavaScript development
- **Tailwind CSS 4** - Utility-first CSS framework
- **React 19.1.0** - Latest React with concurrent features
- **Lucide React** - Modern icon library
- **PostgreSQL** - Primary database with Sequelize ORM

### Backend Technologies
- **Rust** - High-performance core modules
- **Neon** - Node.js native addon framework
- **WASM** - WebAssembly for browser compatibility
- **Tokio** - Async runtime for Rust
- **Serde** - Serialization/deserialization
- **Chrono** - Date and time handling

### Development Tools
- **ESLint 9** - Code linting and quality
- **Turbopack** - Fast bundler and dev server
- **Cargo** - Rust package manager
- **npm/Node.js** - JavaScript package management

## Project Structure

```
phantom-spire/frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── cve/               # CVE management pages
│   │   ├── intelligence/      # Threat intelligence pages
│   │   ├── incident-response/ # Incident response pages
│   │   ├── ioc/               # IOC management pages
│   │   ├── xdr/               # XDR dashboard pages
│   │   └── ...                # Other feature pages
│   ├── components/            # Reusable React components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries and services
│   └── types/                 # TypeScript type definitions
├── phantom-*-core/            # Rust core modules (8 modules)
│   ├── src/                   # Rust source code
│   ├── src-ts/                # TypeScript bindings
│   ├── Cargo.toml             # Rust dependencies
│   └── package.json           # Node.js package config
└── Configuration files
```

## Core Module Capabilities

### XDR Engine
- **Detection**: Multi-vector threat detection with ML
- **Zero Trust**: Policy evaluation and access control
- **Analytics**: Behavioral pattern analysis
- **Correlation**: Event correlation across data sources
- **Response**: Automated threat response actions
- **ML Engine**: Predictive threat modeling
- **Network Analysis**: Deep packet inspection and analysis

### CVE Management
- **Intelligence Integration**: Multi-source threat intelligence
- **Exploit Prediction**: Timeline and likelihood analysis
- **Risk Scoring**: Advanced vulnerability scoring models
- **Remediation**: Automated strategy generation
- **Search**: Advanced vulnerability search capabilities
- **Timeline**: Exploit development tracking

### IOC Processing
- **Multi-Type Support**: IP, Domain, Hash, Email, File paths
- **Analysis**: Threat actor and campaign correlation
- **Impact Assessment**: Business and technical impact scoring
- **Recommendations**: Automated mitigation suggestions
- **WASM Compatibility**: Browser-based processing
- **Real-time Processing**: High-performance indicator analysis

## Getting Started

### One-Click Enterprise Installation

```bash
# Download and run the enhanced installation script with complete data layer setup
curl -fsSL https://raw.githubusercontent.com/harborgrid-justin/phantom-spire/main/scripts/enhanced-install.sh | sudo bash

# Or with wget
wget -qO- https://raw.githubusercontent.com/harborgrid-justin/phantom-spire/main/scripts/enhanced-install.sh | sudo bash
```

**What the enhanced installer provides:**

- ✅ **Complete multi-database data layer** (PostgreSQL, MySQL, MongoDB, Redis)
- ✅ **Interactive setup wizard** with guided configuration
- ✅ **Database administration tools** (Adminer, Mongo Express, Redis Commander)
- ✅ **Automatic service configuration** and health monitoring
- ✅ **Security-hardened deployment** with proper user management
- ✅ **Production-ready systemd services**

### Manual Installation with Full Data Layer

```bash
# Clone the repository
git clone https://github.com/harborgrid-justin/phantom-spire.git
cd phantom-spire

# Copy environment configuration
cp .env.example .env
# Edit .env with your configuration (optional - setup wizard will handle this)

# Start complete data layer with Docker Compose
docker-compose up -d

# Install dependencies (includes all workspace packages)
npm install

# Build all core modules and application
npm run build

# Start the application
npm start
```

After installation, visit **http://localhost:3000/setup** for the guided setup wizard.

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **Memory**: 4GB RAM minimum (8GB+ recommended for production)
- **Storage**: 20GB free disk space minimum
- **Operating System**: Ubuntu 20.04+, CentOS 8+, or Debian 11+
- **Docker**: For database containers (automatic installation available)

### Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Test core modules
npm run test:cores

# Database operations
node test-db-connection.js
node test-api.js
```

## API Integration

### Core Module APIs

Each core module exposes JavaScript APIs through Neon/WASM bindings:

```javascript
// XDR Engine
import { XdrEngine } from 'phantom-xdr-core';
const engine = new XdrEngine();
const result = engine.processThreatIndicator(indicatorData);

// CVE Core
import { CVECore } from 'phantom-cve-core';
const cveCore = new CVECore();
const analysis = cveCore.processCve(cveData);

// IOC Core
import { IOCCore } from 'phantom-ioc-core';
const iocCore = new IOCCore();
const iocResult = iocCore.processIoc(iocData);
```

### REST API Endpoints

- `/api/xdr/*` - XDR engine operations
- `/api/cve/*` - CVE management
- `/api/ioc/*` - IOC processing
- `/api/intelligence/*` - Threat intelligence
- `/api/incidents/*` - Incident management
- `/api/mitre/*` - MITRE ATT&CK data

## Security Features

### Zero Trust Architecture
- Identity verification for all access requests
- Least privilege access controls
- Continuous security monitoring
- Risk-based authentication

### Threat Detection
- Signature-based detection
- Behavioral anomaly detection
- Machine learning threat models
- Real-time correlation engines

### Data Protection
- Encryption at rest and in transit
- Secure API authentication
- Audit logging and compliance
- Data privacy controls

## Performance Characteristics

### Rust Core Modules
- **High Performance**: Native Rust performance
- **Memory Safety**: Zero-cost abstractions
- **Concurrency**: Tokio async runtime
- **Scalability**: Horizontal scaling support

### Frontend Performance
- **Turbopack**: Fast development builds
- **Code Splitting**: Optimized bundle sizes
- **SSR/SSG**: Server-side rendering support
- **Caching**: Intelligent caching strategies

## Deployment

### One-Click Production Deployment

```bash
# Enhanced production deployment with complete infrastructure
curl -fsSL https://raw.githubusercontent.com/harborgrid-justin/phantom-spire/main/scripts/enhanced-install.sh | sudo bash
```

### Docker Compose Production

```bash
# Start complete production stack with all databases
docker-compose -f docker-compose.yml up -d

# View service status
docker-compose ps

# Scale application instances
docker-compose up -d --scale phantom-spire=3
```

### Kubernetes Deployment

```bash
# Deploy to Kubernetes with complete stack
kubectl apply -f deployment/k8s/

# Check deployment status
kubectl get deployments
kubectl get services
kubectl get pods
```

### Systemd Service Management

```bash
# Manage production service
sudo systemctl start phantom-spire
sudo systemctl stop phantom-spire  
sudo systemctl restart phantom-spire

# View service logs
sudo journalctl -u phantom-spire -f

# Check service status
sudo systemctl status phantom-spire
```

### Database Administration

**Built-in Database Admin Tools (included in deployment):**

| Database | Admin Tool | URL | Purpose |
|----------|------------|-----|---------|
| All Databases | **Adminer** | http://localhost:8080 | Universal database administration |
| MongoDB | **Mongo Express** | http://localhost:8081 | MongoDB-specific admin interface |
| Redis | **Redis Commander** | http://localhost:8082 | Redis data browser and management |

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests for new functionality
5. Update documentation
6. Submit pull request

### Code Standards
- **Rust**: Follow Rust API guidelines
- **TypeScript**: Strict type checking
- **Testing**: Unit and integration tests
- **Documentation**: Comprehensive inline docs

## License

This project is proprietary software. All rights reserved.

## Support

For technical support and questions:
- GitHub Issues: [Repository Issues](https://github.com/harborgrid-justin/phantom-spire/issues)
- Documentation: See individual module GEMINI.md files
- API Reference: `/docs` endpoint when running

## Production Status & Roadmap

### ✅ Production Ready (v1.0.0)
- ✅ **Complete core module development** with 8 specialized Rust engines
- ✅ **Multi-database architecture** (MongoDB, PostgreSQL, MySQL, Redis)
- ✅ **Enterprise deployment capabilities** with one-click installation
- ✅ **Production security features** with RBAC, audit logging, encryption
- ✅ **Comprehensive testing and validation** across all modules
- ✅ **Documentation and setup wizard** for enterprise deployments

### 🚀 Current Capabilities (In Production)
- ✅ **Advanced threat detection** with XDR engine
- ✅ **Real-time threat intelligence** processing and correlation
- ✅ **Vulnerability management** with CVE analysis and remediation
- ✅ **Incident response** with automated playbook execution
- ✅ **IOC processing** with multi-format indicator analysis
- ✅ **MITRE ATT&CK integration** for threat mapping
- ✅ **Security operations** center with monitoring and alerting
- ✅ **Threat actor profiling** with attribution analysis

### 🔄 Enhancement Pipeline (v1.1.0+)
- 🔄 **Advanced ML models** for predictive threat analysis
- 🔄 **Real-time streaming** for high-volume data processing
- 🔄 **Mobile applications** for field operations
- 🔄 **Cloud-native deployment** options (AWS, Azure, GCP)

### 📋 Future Enhancements (v2.0+)
- 📋 **Enterprise integrations** with major security platforms
- 📋 **Advanced analytics** with AI-powered insights
- 📋 **Compliance frameworks** (NIST, ISO 27001, SOC 2)
- 📋 **Multi-tenant architecture** for MSP deployments

---

*Phantom Spire - Enterprise Cybersecurity Intelligence Platform v1.0.0*
*Production-ready with Rust performance and comprehensive data layer architecture*
*Built for Fortune 100 organizations and government agencies*
