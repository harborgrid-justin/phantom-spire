# Phantom Spire - Advanced Cybersecurity Intelligence Platform

## Overview

Phantom Spire is a comprehensive cybersecurity intelligence platform built with Next.js frontend and multiple Rust-based core modules. The platform provides advanced threat detection, vulnerability management, incident response, and security operations capabilities designed to compete with enterprise-grade security solutions.

## Architecture

### Frontend (Next.js)
- **Framework**: Next.js 15.5.2 with TypeScript
- **Styling**: Tailwind CSS 4.0
- **Port**: 4000 (development)
- **Features**: Turbopack for fast builds and hot reloading

### Core Modules (Rust + Node.js Bindings)

The platform consists of 8 specialized core modules, each providing specific cybersecurity capabilities:

1. **phantom-xdr-core** - Extended Detection and Response Engine
2. **phantom-ioc-core** - Indicators of Compromise Processing
3. **phantom-cve-core** - Vulnerability Management and Analysis
4. **phantom-intel-core** - Threat Intelligence Platform
5. **phantom-mitre-core** - MITRE ATT&CK Framework Integration
6. **phantom-secop-core** - Security Operations Center
7. **phantom-threatActor-core** - Threat Actor Profiling and Attribution
8. **phantom-incidentResponse-core** - Incident Response Management

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

### Prerequisites
- Node.js 18+ with npm
- Rust 1.70+ with Cargo
- PostgreSQL 12+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harborgrid-justin/phantom-spire.git
   cd phantom-spire/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build core modules**
   ```bash
   # Build all Rust modules
   npm run build:cores
   ```

4. **Initialize database**
   ```bash
   node init-db.js
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:4000
   - API: http://localhost:4000/api

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

### Production Deployment
1. Build all modules: `npm run build`
2. Configure environment variables
3. Set up PostgreSQL database
4. Deploy to production server
5. Configure reverse proxy (nginx/Apache)
6. Set up SSL certificates
7. Configure monitoring and logging

### Docker Deployment
```dockerfile
# Multi-stage build for Rust modules
FROM rust:1.70 as rust-builder
# ... Rust build steps

FROM node:18 as node-builder
# ... Node.js build steps

FROM node:18-alpine as runtime
# ... Runtime configuration
```

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

## Roadmap

### Phase 1 (Current)
- ✅ Core module development
- ✅ Basic frontend implementation
- ✅ API integration
- 🔄 Testing and validation

### Phase 2 (Next)
- 🔄 Advanced ML models
- 🔄 Real-time streaming
- 🔄 Mobile applications
- 🔄 Cloud deployment

### Phase 3 (Future)
- 📋 Enterprise integrations
- 📋 Advanced analytics
- 📋 Compliance frameworks
- 📋 Multi-tenant architecture

---

*Phantom Spire - Advanced Cybersecurity Intelligence Platform*
*Built with Rust performance and JavaScript flexibility*
