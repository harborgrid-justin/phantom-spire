# Phantom Spire - Enterprise Cyber Threat Intelligence Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Build](https://img.shields.io/badge/build-production--ready-brightgreen.svg)
![Databases](https://img.shields.io/badge/databases-PostgreSQL%20%7C%20MySQL%20%7C%20MongoDB%20%7C%20Redis-orange.svg)

> **Enterprise-grade Cyber Threat Intelligence Platform designed for Fortune 100 organizations and government agencies.**

Phantom Spire is a comprehensive, production-ready platform for enterprise cyber threat intelligence operations, featuring advanced data ingestion, evidence management, workflow orchestration, and real-time threat analysis capabilities with a **complete multi-database data layer**.

## 🚀 Quick Start

### One-Click Enhanced Installation

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

# Install dependencies
npm install

# Build the application
npm run build

# Start the application
npm start
```

After installation, visit **http://localhost:3000/setup** for the guided setup wizard.

## 🎯 Key Features

### 🗄️ Multi-Database Architecture
- **MongoDB**: Flexible document storage for threat intelligence data
- **PostgreSQL**: Structured data, relationships, and complex queries
- **MySQL**: Analytics, reporting, and performance metrics
- **Redis**: High-performance caching, sessions, and real-time data

### 🔧 Complete Setup Experience
- **Interactive Setup Wizard**: Step-by-step configuration with real-time validation
- **Database Health Monitoring**: Automatic connection testing and status reporting
- **Administrator Account Creation**: Secure initial user setup
- **External Integration Testing**: Validate MISP, OTX, VirusTotal connections
- **System Requirements Verification**: Comprehensive pre-installation checks

### 🛡️ Enterprise Security
- **Role-Based Access Control (RBAC)**: Granular permission management
- **Multi-Factor Authentication**: Enhanced security for sensitive operations
- **Audit Logging**: Complete activity tracking across all databases
- **Data Encryption**: At-rest and in-transit encryption
- **Secure API Access**: JWT-based authentication with refresh tokens

### 📋 Advanced Case Management (40 Modules)
- **Lifecycle Management**: Complete case lifecycle from creation to closure
- **Evidence Management**: Chain of custody, digital analysis, and secure storage
- **Investigation Workflows**: Planning, collaboration, and quality assurance
- **Reporting & Analytics**: Performance metrics, trend analysis, and executive reporting
- **Compliance & Audit**: Regulatory compliance, audit trails, and legal holds

## 📋 Production Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **Memory**: 4GB RAM minimum (8GB+ recommended for production)
- **Storage**: 20GB free disk space minimum
- **Operating System**: Ubuntu 20.04+, CentOS 8+, or Debian 11+
- **Docker**: For database containers (automatic installation available)

### Database Requirements (Automatically Provisioned)
- **MongoDB**: 5.0+ (Document storage)
- **PostgreSQL**: 14+ (Relational data)
- **MySQL**: 8.0+ (Analytics)  
- **Redis**: 6.2+ (Caching)

## 🔧 Configuration

### Environment Variables

```bash
# Application Configuration
NODE_ENV=production
PORT=3000
SETUP_MODE=true
FIRST_RUN=true

# Multi-Database Configuration
MONGODB_URI=mongodb://admin:phantom_secure_pass@localhost:27017/phantom-spire?authSource=admin
POSTGRESQL_URI=postgresql://postgres:phantom_secure_pass@localhost:5432/phantom_spire
MYSQL_URI=mysql://phantom_user:phantom_secure_pass@localhost:3306/phantom_spire
REDIS_URL=redis://:phantom_redis_pass@localhost:6379/0

# Security Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here-256-bit-minimum
SESSION_SECRET=your-session-secret
BCRYPT_ROUNDS=12

# External Integrations
MISP_URL=https://your-misp-instance.com
MISP_AUTH_KEY=your-misp-auth-key
OTX_API_KEY=your-otx-api-key
VIRUSTOTAL_API_KEY=your-virustotal-api-key

# Performance & Monitoring
DATA_RETENTION_DAYS=365
EVIDENCE_RETENTION_DAYS=2555
MAX_CONCURRENT_WORKFLOWS=10
METRICS_ENABLED=true
```

### Database Administration

**Built-in Database Admin Tools (included in setup):**

| Database | Admin Tool | URL | Purpose |
|----------|------------|-----|---------|
| All Databases | **Adminer** | http://localhost:8080 | Universal database administration |
| MongoDB | **Mongo Express** | http://localhost:8081 | MongoDB-specific admin interface |
| Redis | **Redis Commander** | http://localhost:8082 | Redis data browser and management |

## 🚀 Setup Wizard

The enhanced setup wizard provides a comprehensive guided experience:

### Step 1: System Verification
- ✅ System requirements check
- ✅ Available resources validation  
- ✅ Port availability verification
- ✅ Directory permissions check

### Step 2: Database Configuration
- ✅ Real-time connection testing for all 4 databases
- ✅ Automatic schema initialization
- ✅ Performance optimization setup
- ✅ Health monitoring configuration

### Step 3: Administrator Setup
- ✅ Secure password policy enforcement
- ✅ Organization configuration
- ✅ Initial user role assignment
- ✅ Multi-factor authentication setup

### Step 4: System Configuration  
- ✅ Data retention policies
- ✅ Performance tuning parameters
- ✅ Feature enablement selection
- ✅ Workflow concurrency limits

### Step 5: External Integrations
- ✅ MISP integration testing
- ✅ AlienVault OTX configuration
- ✅ VirusTotal API validation
- ✅ Custom feed sources

### Step 6: Launch & Verification
- ✅ Complete system health check
- ✅ Database connectivity verification  
- ✅ Service startup validation
- ✅ Ready-to-use dashboard access

## 🛠️ Management Commands

### Docker Compose Operations
```bash
# Start all databases
npm run setup:databases

# Start complete stack  
npm run setup:full

# Reset all data and restart
npm run setup:reset

# View application logs
npm run logs:app

# View database logs  
npm run logs:databases
```

### System Management
```bash
# Check application health
npm run health:check

# Database migration (if needed)
npm run db:migrate

# Seed initial data
npm run db:seed

# Production build
npm run build

# Start production server
npm start
```

### Service Management (Linux)
```bash
# Start/stop/restart service
sudo systemctl start phantom-spire
sudo systemctl stop phantom-spire  
sudo systemctl restart phantom-spire

# View service logs
sudo journalctl -u phantom-spire -f

# Check service status
sudo systemctl status phantom-spire
```

## 📊 Database Schema Overview

### MongoDB Collections
- `threats` - Threat intelligence indicators
- `evidence` - Digital evidence metadata
- `workflows` - Workflow definitions and instances
- `users` - User accounts and profiles
- `organizations` - Multi-tenant organization data
- `audit_logs` - Complete activity audit trail

### PostgreSQL Tables
- `threat_intelligence.indicators` - Structured threat data
- `threat_intelligence.relationships` - Entity relationships
- `evidence_management.evidence_items` - Evidence catalog
- `workflow_engine.workflows` - Process definitions
- `system_monitoring.health_checks` - System status

### MySQL Tables  
- `threat_feeds` - External data source configurations
- `analytics_reports` - Generated reports and metrics
- `data_quality_metrics` - Data integrity measurements
- `system_performance` - Performance monitoring data

## 🔍 Health Monitoring & Diagnostics

### Health Check Endpoints
- `/health` - Overall system health
- `/health/detailed` - Comprehensive health report
- `/api/setup/database-health` - Database-specific health
- `/api/setup/system-check` - System requirements status

### Monitoring URLs
- **Application**: http://localhost:3000
- **Setup Wizard**: http://localhost:3000/setup  
- **API Documentation**: http://localhost:3000/api/docs
- **Database Admin**: http://localhost:8080
- **Health Dashboard**: http://localhost:3000/health

## 🚀 Deployment

### Docker Production Deployment

```bash
# Build the production image
docker build -t phantom-spire:latest .

# Run with complete data layer
docker-compose -f docker-compose.yml up -d
```

### Kubernetes Deployment

```bash
# Apply the Kubernetes manifests (includes all databases)
kubectl apply -f deployment/k8s/

# Check deployment status
kubectl get deployments
kubectl get services  
kubectl get pods
```

## 🔧 Maintenance

### Backup Procedures
```bash
# Complete backup (all databases)
./scripts/backup.sh --all

# Individual database backups
./scripts/backup.sh --mongodb
./scripts/backup.sh --postgresql  
./scripts/backup.sh --mysql
./scripts/backup.sh --redis

# Configuration backup
tar -czf config-backup-$(date +%Y%m%d).tar.gz .env docker-compose.yml
```

### Database Maintenance
```bash
# PostgreSQL maintenance
docker-compose exec postgres psql -U postgres -c "VACUUM ANALYZE;"

# MySQL maintenance  
docker-compose exec mysql mysql -u root -p -e "OPTIMIZE TABLE threat_indicators;"

# MongoDB maintenance
docker-compose exec mongo mongosh --eval "db.runCommand({compact: 'threats'})"

# Redis maintenance
docker-compose exec redis redis-cli FLUSHDB
```

## 📈 Performance Optimization

### Database-Specific Optimizations
- **MongoDB**: Compound indexes on frequently queried fields
- **PostgreSQL**: Materialized views for complex analytics  
- **MySQL**: Partitioning for large time-series data
- **Redis**: Memory optimization with appropriate eviction policies

### Application Performance
- Response compression and caching
- Connection pooling for all databases
- Efficient pagination with database-specific strategies
- Background job processing with Redis queues

## 🔒 Security Features

### Data Protection
- Environment-based secrets management
- Database connection encryption (TLS/SSL)
- Input sanitization across all database layers
- SQL injection prevention with parameterized queries

### Access Control
- JWT-based authentication with secure refresh
- Role-based permissions with database-level enforcement  
- API rate limiting per user/IP
- Comprehensive audit logging

### Network Security
- CORS configuration for cross-origin requests
- Security headers (Helmet.js)
- Network isolation with Docker containers
- Firewall configuration in installation script

## 📚 Documentation

### Setup Documentation
- **Quick Start Guide**: [QUICKSTART.md](QUICKSTART.md)
- **Development Guide**: [.development/docs/DEVELOPMENT.md](.development/docs/DEVELOPMENT.md)
- **Production Setup**: [.development/docs/PRODUCTION.md](.development/docs/PRODUCTION.md)
- **Security Guide**: [SECURITY.md](SECURITY.md)

### API Documentation
- **Interactive API Docs**: http://localhost:3000/api/docs
- **Database Schema**: [src/data-layer/README.md](src/data-layer/README.md)  
- **Integration Guide**: [docs/integrations.md](docs/integrations.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/harborgrid-justin/phantom-spire.git
cd phantom-spire

# Start development databases
docker-compose up -d

# Install dependencies  
npm install

# Start development server
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Enterprise Features

- **Multi-Database Architecture**: Optimized data storage across 4 database types
- **Interactive Setup Wizard**: Complete guided configuration experience
- **Real-time Health Monitoring**: Comprehensive system and database monitoring
- **Integrated Admin Tools**: Built-in database administration interfaces  
- **Production-Ready Deployment**: Systemd services, Docker containers, Kubernetes support
- **Comprehensive Security**: RBAC, audit logging, encryption, secure defaults
- **External Integration Testing**: Validate MISP, OTX, VirusTotal connections during setup
- **Automated Installation**: One-command deployment with all dependencies

## 📞 Support

- **Documentation**: [/docs](/docs)
- **Issues**: [GitHub Issues](https://github.com/harborgrid-justin/phantom-spire/issues)
- **Discussions**: [GitHub Discussions](https://github.com/harborgrid-justin/phantom-spire/discussions)
- **Security**: [SECURITY.md](SECURITY.md)

---

**Phantom Spire CTI Platform** - Comprehensive threat intelligence with complete data layer infrastructure.

*Built for enterprise security teams who need reliable, scalable, and secure threat intelligence operations.*
- **Memory**: Minimum 8GB RAM for production workloads
- **Storage**: SSD recommended for database performance

### Security Requirements
- SSL/TLS certificates for HTTPS
- Valid JWT signing keys
- MongoDB with authentication configured
- Firewall configured for required ports only
- Log aggregation system configured

## 🏗️ Architecture Overview

Phantom Spire follows a microservices-oriented architecture with the following core components:

### Core Services
- **API Gateway**: Express.js-based REST API with Swagger documentation
- **Authentication & Authorization**: JWT-based with role-based access control (RBAC)
- **Data Layer**: MongoDB with optimized schemas for threat intelligence
- **Message Queue**: Redis-based pub/sub for real-time communication
- **Workflow Engine**: BPMN 2.0 compatible workflow orchestration
- **Evidence Management**: Cryptographically-secured chain of custody
- **Threat Intelligence Ingestion**: STIX 2.0/2.1 and MISP connectors

### Key Features
- **Fortune 100 Scale**: Handles 100,000+ concurrent users
- **Real-time Processing**: Sub-second threat indicator processing
- **Compliance Ready**: SOX, GDPR, NIST framework support
- **High Availability**: Clustered deployment with automatic failover
- **Enterprise Security**: AES-256 encryption, secure audit trails

## 🔧 Configuration

### Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret-key-here
API_VERSION=v1

# Database
MONGODB_URI=mongodb://username:password@localhost:27017/phantom-spire
REDIS_URL=redis://localhost:6379

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Features
ENABLE_SWAGGER_DOCS=false
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
LOG_LEVEL=info
METRICS_ENABLED=true
HEALTH_CHECK_ENABLED=true
```

### Production Configuration Checklist

- [ ] Strong JWT secret (256-bit minimum)
- [ ] MongoDB authentication enabled
- [ ] Redis password configured
- [ ] SSL/TLS certificates installed
- [ ] CORS origins restricted to your domains
- [ ] Rate limiting enabled
- [ ] Log level set to 'info' or 'warn'
- [ ] Health check monitoring configured
- [ ] Backup strategies implemented

## 🚀 Deployment

### Docker Production Deployment

```bash
# Build the production image
docker build -t phantom-spire:latest .

# Run with production settings
docker run -d \
  --name phantom-spire \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://your-mongo-host:27017/phantom-spire \
  -e JWT_SECRET=your-super-secure-secret \
  phantom-spire:latest
```

### Docker Compose (Recommended)

```bash
# Start the complete stack
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f phantom-spire

# Scale the application
docker-compose up -d --scale phantom-spire=3
```

### Kubernetes Deployment

```bash
# Apply the Kubernetes manifests
kubectl apply -f deployment/k8s/

# Check deployment status
kubectl get deployments
kubectl get services
kubectl get pods
```

## 📚 API Documentation

### Swagger/OpenAPI
When running in development mode, API documentation is available at:
- **Local**: http://localhost:3000/api-docs
- **Production**: Disabled by default for security

### Core API Endpoints

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/v1/auth/login` | POST | User authentication | No |
| `/api/v1/auth/refresh` | POST | Token refresh | Yes |
| `/api/v1/iocs` | GET/POST | IOC management | Yes |
| `/api/v1/threats` | GET/POST | Threat intelligence | Yes |
| `/api/v1/evidence` | GET/POST | Evidence management | Yes |
| `/api/v1/workflows` | GET/POST | Workflow operations | Yes |
| `/health` | GET | Health check | No |

### Authentication

```bash
# Login to get JWT token
curl -X POST https://api.yourhost.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@company.com", "password": "password"}'

# Use token in requests
curl -X GET https://api.yourhost.com/api/v1/iocs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔐 Security Features

### Built-in Security
- **Authentication**: JWT-based with configurable expiration
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Configurable per-IP rate limits
- **CORS**: Strict cross-origin resource sharing
- **Headers**: Security headers via Helmet.js
- **Encryption**: AES-256 for sensitive data
- **Audit Logging**: Comprehensive security event logging

### Compliance Features
- **Data Retention**: Configurable retention policies
- **Audit Trails**: Immutable activity logs
- **Access Controls**: Multi-level permission system
- **Data Classification**: TLP (Traffic Light Protocol) support
- **Chain of Custody**: Cryptographic integrity verification

## 📊 Monitoring and Observability

### Health Checks
```bash
# Basic health check
curl https://api.yourhost.com/health

# Detailed health with database status
curl https://api.yourhost.com/health/detailed
```

### Metrics and Logging
- **Application Metrics**: Performance and usage statistics
- **Security Metrics**: Authentication and authorization events
- **Business Metrics**: Threat intelligence processing stats
- **Infrastructure Metrics**: Resource utilization and availability

### Recommended Monitoring Stack
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Metrics**: Prometheus + Grafana
- **APM**: New Relic, DataDog, or Dynatrace
- **Uptime**: Pingdom, StatusCake, or UptimeRobot

## 🔧 Maintenance

### Backup Procedures
```bash
# MongoDB backup
mongodump --uri="mongodb://username:password@host:port/phantom-spire" --out=/backups/

# Redis backup
redis-cli --rdb /backups/redis-backup.rdb

# Application configuration backup
tar -czf /backups/config-$(date +%Y%m%d).tar.gz .env docker-compose.yml
```

### Database Maintenance
```bash
# MongoDB index optimization
mongo phantom-spire --eval "db.runCommand({compact: 'collection_name'})"

# Clear old logs (adjust date as needed)
mongo phantom-spire --eval "db.audit_logs.deleteMany({timestamp: {$lt: new Date('2024-01-01')}})"
```

### Log Rotation
Configure logrotate for application logs:
```bash
# Add to /etc/logrotate.d/phantom-spire
/var/log/phantom-spire/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 phantom-spire phantom-spire
    postrotate
        systemctl reload phantom-spire
    endscript
}
```

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check MongoDB status
sudo systemctl status mongod
# Check connectivity
mongo --host your-mongo-host --port 27017 --eval "db.adminCommand('ismaster')"
```

**High Memory Usage**
```bash
# Monitor memory usage
docker stats phantom-spire
# Increase Node.js memory limit
node --max-old-space-size=8192 dist/index.js
```

**Rate Limiting Issues**
```bash
# Check rate limit status
curl -I https://api.yourhost.com/api/v1/health
# Look for X-RateLimit-* headers
```

### Performance Optimization

**Database Optimization**
- Ensure proper indexing on frequently queried fields
- Use compound indexes for complex queries
- Monitor slow queries and optimize them
- Configure appropriate connection pooling

**Application Optimization**
- Enable response compression
- Configure appropriate cache headers
- Use Redis for session storage
- Implement query result caching

## 📞 Support and Documentation

### Documentation
- **Development Guide**: `.development/docs/DEVELOPMENT.md`
- **API Reference**: Available at `/api-docs` endpoint
- **Architecture Documentation**: `.development/docs/`
- **Deployment Guides**: `deployment/` directory

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/harborgrid-justin/phantom-spire/issues)
- **Discussions**: [GitHub Discussions](https://github.com/harborgrid-justin/phantom-spire/discussions)
- **Security**: See SECURITY.md for security issue reporting

### Professional Support
For enterprise support, professional services, or custom implementations, contact our team.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](.development/docs/CONTRIBUTING.md) for details.

---

**Built with ❤️ by the Phantom Spire Team**

*Securing the digital frontier, one threat at a time.*