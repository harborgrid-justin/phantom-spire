# Phantom Spire - Enterprise Cyber Threat Intelligence Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Build](https://img.shields.io/badge/build-production--ready-brightgreen.svg)

> **Enterprise-grade Cyber Threat Intelligence Platform designed for Fortune 100 organizations and government agencies.**

Phantom Spire is a comprehensive, production-ready platform for enterprise cyber threat intelligence operations, featuring advanced data ingestion, evidence management, workflow orchestration, and real-time threat analysis capabilities.

## 🚀 Quick Start

### One-Click Installation

```bash
# Download and run the installation script
curl -fsSL https://raw.githubusercontent.com/harborgrid-justin/phantom-spire/main/install.sh | bash

# Or with wget
wget -qO- https://raw.githubusercontent.com/harborgrid-justin/phantom-spire/main/install.sh | bash
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/harborgrid-justin/phantom-spire.git
cd phantom-spire

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Build the application
npm run build

# Start the server
npm start
```

## 📋 Production Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **MongoDB**: 5.0 or higher (with authentication enabled)
- **Redis**: 6.2 or higher (for caching and session management)
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