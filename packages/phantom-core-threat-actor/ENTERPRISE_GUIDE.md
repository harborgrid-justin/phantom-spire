# Phantom Core Threat Actor - Enterprise Deployment Guide

[![Enterprise Ready](https://img.shields.io/badge/Enterprise-Ready-blue.svg)](https://phantomspire.security/enterprise)
[![SOC 2 Compliant](https://img.shields.io/badge/SOC%202-Compliant-green.svg)](https://phantomspire.security/compliance)
[![24/7 Support](https://img.shields.io/badge/24%2F7-Support-red.svg)](https://support.phantomspire.security)

## Overview

This guide provides comprehensive instructions for deploying the **Phantom Core Threat Actor** platform in enterprise production environments. The platform is designed to support large-scale security operations centers (SOCs) with high-availability, performance, and security requirements.

---

## 🏗️ Architecture Overview

### **System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                 Load Balancer Layer                         │
│            nginx / HAProxy / AWS ALB                        │
└─────────────────────┬──────────────────────┬────────────────┘
                      │                      │
┌─────────────────────▼────────────────────┐ │
│         Application Tier (Node.js)       │ │
│    ┌─────────────────────────────────┐   │ │
│    │ Phantom Core Threat Actor API   │   │ │
│    │     (Native Rust Engine)        │   │ │
│    └─────────────────────────────────┘   │ │
└─────────────────────┬────────────────────┘ │
                      │                      │
┌─────────────────────▼────────────────────┐ │
│              Data Layer                  │ │
│   ┌─────────────┐ ┌─────────────────┐   │ │
│   │ PostgreSQL  │ │ Elasticsearch   │   │ │
│   │ (Metadata)  │ │ (Threat Intel)  │   │ │
│   └─────────────┘ └─────────────────┘   │ │
└──────────────────────────────────────────┘ │
                                             │
┌────────────────────────────────────────────▼─┐
│            Monitoring & Logging               │
│  ┌─────────────┐ ┌─────────────────────────┐ │
│  │ Prometheus  │ │ ELK Stack / Splunk      │ │
│  │ (Metrics)   │ │ (Security Events)       │ │
│  └─────────────┘ └─────────────────────────┘ │
└───────────────────────────────────────────────┘
```

### **Key Components**

- **Threat Intelligence Engine**: Native Rust core for high-performance attribution analysis
- **API Gateway**: RESTful API interface with authentication and rate limiting
- **Data Storage**: Multi-tier storage for threat intelligence and operational metadata
- **Event Processing**: Real-time OCSF-compliant security event generation
- **Monitoring**: Comprehensive health monitoring and performance metrics

---

## 🚀 Production Deployment

### **Prerequisites**

#### **Infrastructure Requirements**

| Component | Minimum | Recommended | Enterprise |
|-----------|---------|-------------|------------|
| **CPU** | 8 cores | 16 cores | 32+ cores |
| **Memory** | 16GB RAM | 32GB RAM | 64GB+ RAM |
| **Storage** | 500GB SSD | 2TB NVMe | 10TB+ NVMe |
| **Network** | 1Gbps | 10Gbps | 25Gbps+ |
| **Availability** | Single AZ | Multi-AZ | Multi-Region |

#### **Software Dependencies**

```bash
# Node.js Runtime
node --version  # >= 16.0.0

# Container Runtime (Recommended)
docker --version  # >= 20.10.0
kubectl version   # >= 1.20.0

# Database Systems
postgresql --version  # >= 13.0
elasticsearch --version  # >= 7.10.0
```

### **Docker Deployment**

#### **Single Node Deployment**

```bash
# Pull the enterprise image
docker pull phantomspire/threat-actor:1.0.3-enterprise

# Run with enterprise configuration
docker run -d \
  --name phantom-threat-actor \
  -p 8080:8080 \
  -p 9090:9090 \
  -e PHANTOM_LICENSE_KEY="your-enterprise-license" \
  -e PHANTOM_LOG_LEVEL="info" \
  -e PHANTOM_METRICS_ENABLED="true" \
  -e PHANTOM_DATABASE_URL="postgresql://user:pass@db:5432/phantom" \
  -v phantom-data:/opt/phantom/data \
  -v phantom-logs:/opt/phantom/logs \
  phantomspire/threat-actor:1.0.3-enterprise
```

#### **Docker Compose Deployment**

```yaml
version: '3.8'

services:
  phantom-threat-actor:
    image: phantomspire/threat-actor:1.0.3-enterprise
    ports:
      - "8080:8080"
      - "9090:9090"
    environment:
      - PHANTOM_LICENSE_KEY=${PHANTOM_LICENSE_KEY}
      - PHANTOM_DATABASE_URL=postgresql://phantom:${DB_PASSWORD}@postgres:5432/phantom
      - PHANTOM_REDIS_URL=redis://redis:6379
      - PHANTOM_LOG_LEVEL=info
      - PHANTOM_METRICS_ENABLED=true
    volumes:
      - phantom-data:/opt/phantom/data
      - phantom-logs:/opt/phantom/logs
    depends_on:
      - postgres
      - redis
      - elasticsearch
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:13-alpine
    environment:
      - POSTGRES_DB=phantom
      - POSTGRES_USER=phantom
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U phantom"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:6-alpine
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  elasticsearch:
    image: elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  phantom-data:
  phantom-logs:
  postgres-data:
  redis-data:
  elasticsearch-data:
```

### **Kubernetes Deployment**

#### **Namespace and Configuration**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: phantom-spire
---
apiVersion: v1
kind: Secret
metadata:
  name: phantom-secrets
  namespace: phantom-spire
type: Opaque
data:
  license-key: <base64-encoded-license-key>
  db-password: <base64-encoded-db-password>
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: phantom-config
  namespace: phantom-spire
data:
  LOG_LEVEL: "info"
  METRICS_ENABLED: "true"
  DATABASE_URL: "postgresql://phantom:$(DB_PASSWORD)@postgres:5432/phantom"
  REDIS_URL: "redis://redis:6379"
```

#### **Application Deployment**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: phantom-threat-actor
  namespace: phantom-spire
  labels:
    app: phantom-threat-actor
    version: v1.0.3
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: phantom-threat-actor
  template:
    metadata:
      labels:
        app: phantom-threat-actor
        version: v1.0.3
    spec:
      containers:
      - name: threat-actor
        image: phantomspire/threat-actor:1.0.3-enterprise
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 9090
          name: metrics
        env:
        - name: PHANTOM_LICENSE_KEY
          valueFrom:
            secretKeyRef:
              name: phantom-secrets
              key: license-key
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: phantom-secrets
              key: db-password
        envFrom:
        - configMapRef:
            name: phantom-config
        resources:
          requests:
            memory: "4Gi"
            cpu: "2000m"
          limits:
            memory: "8Gi"
            cpu: "4000m"
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 15
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        volumeMounts:
        - name: phantom-data
          mountPath: /opt/phantom/data
        - name: phantom-logs
          mountPath: /opt/phantom/logs
      volumes:
      - name: phantom-data
        persistentVolumeClaim:
          claimName: phantom-data-pvc
      - name: phantom-logs
        persistentVolumeClaim:
          claimName: phantom-logs-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: phantom-threat-actor
  namespace: phantom-spire
  labels:
    app: phantom-threat-actor
spec:
  type: ClusterIP
  ports:
  - port: 8080
    targetPort: http
    name: http
  - port: 9090
    targetPort: metrics
    name: metrics
  selector:
    app: phantom-threat-actor
```

---

## 🔒 Security Configuration

### **TLS/SSL Configuration**

```nginx
server {
    listen 443 ssl http2;
    server_name api.phantomspire.security;

    ssl_certificate /etc/ssl/certs/phantomspire.crt;
    ssl_certificate_key /etc/ssl/private/phantomspire.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://phantom-threat-actor:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Authentication & Authorization**

#### **API Key Configuration**

```javascript
// Enterprise authentication
const threatCore = new PhantomThreatActorCore({
  enterprise: true,
  api_key: process.env.PHANTOM_API_KEY,
  organization_id: process.env.PHANTOM_ORG_ID,
  user_id: process.env.PHANTOM_USER_ID,
  auth_endpoint: 'https://auth.phantomspire.security/validate'
});
```

#### **RBAC Configuration**

```yaml
# Role definitions
roles:
  - name: "threat-analyst"
    permissions:
      - "threat-actor:read"
      - "attribution:analyze"
      - "campaigns:track"
  
  - name: "senior-analyst" 
    permissions:
      - "threat-actor:*"
      - "attribution:*"
      - "campaigns:*"
      - "reports:generate"
  
  - name: "administrator"
    permissions:
      - "*:*"
```

---

## 📊 Monitoring & Observability

### **Health Monitoring**

```bash
# Health check endpoint
curl -X GET https://api.phantomspire.security/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2025-09-24T20:00:00.000Z",
  "version": "1.0.3",
  "modules_active": 27,
  "attribution_engines_operational": 5,
  "intelligence_feeds_connected": 5,
  "database_connections": "healthy",
  "api_endpoints": "responsive"
}
```

### **Performance Metrics**

```bash
# Metrics endpoint
curl -X GET https://api.phantomspire.security/metrics

# Key metrics
phantom_attribution_accuracy_percentage{} 94.2
phantom_api_requests_total{endpoint="/analyze"} 15847
phantom_api_request_duration_seconds{endpoint="/analyze",quantile="0.95"} 0.012
phantom_active_sessions{} 247
phantom_memory_usage_bytes{} 2147483648
```

### **Prometheus Configuration**

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'phantom-threat-actor'
    static_configs:
      - targets: ['phantom-threat-actor:9090']
    metrics_path: /metrics
    scrape_interval: 10s
```

### **Grafana Dashboard**

```json
{
  "dashboard": {
    "title": "Phantom Threat Actor - Enterprise Dashboard",
    "panels": [
      {
        "title": "Attribution Accuracy",
        "type": "stat",
        "query": "phantom_attribution_accuracy_percentage"
      },
      {
        "title": "API Response Time",
        "type": "graph",
        "query": "rate(phantom_api_request_duration_seconds_sum[5m]) / rate(phantom_api_request_duration_seconds_count[5m])"
      },
      {
        "title": "Active Sessions",
        "type": "stat",
        "query": "phantom_active_sessions"
      }
    ]
  }
}
```

---

## 🔧 Performance Tuning

### **Resource Optimization**

#### **Memory Configuration**

```bash
# Node.js memory optimization
export NODE_OPTIONS="--max-old-space-size=8192"

# Rust native module configuration
export PHANTOM_WORKER_THREADS=16
export PHANTOM_MEMORY_POOL_SIZE=4096
export PHANTOM_CACHE_SIZE=2048
```

#### **Database Optimization**

```sql
-- PostgreSQL configuration
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET work_mem = '64MB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';
ALTER SYSTEM SET max_connections = 200;

-- Elasticsearch configuration
PUT _cluster/settings
{
  "persistent": {
    "indices.memory.index_buffer_size": "20%",
    "thread_pool.search.queue_size": 10000
  }
}
```

### **Horizontal Scaling**

#### **Load Balancer Configuration**

```nginx
upstream phantom_backend {
    least_conn;
    server phantom-01:8080 max_fails=3 fail_timeout=30s;
    server phantom-02:8080 max_fails=3 fail_timeout=30s;
    server phantom-03:8080 max_fails=3 fail_timeout=30s;
}

server {
    location / {
        proxy_pass http://phantom_backend;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
    }
}
```

---

## 🚨 Troubleshooting

### **Common Issues**

#### **High Memory Usage**

```bash
# Check memory usage
docker stats phantom-threat-actor

# Optimize configuration
export NODE_OPTIONS="--max-old-space-size=4096"
export PHANTOM_CACHE_CLEANUP_INTERVAL=300
```

#### **API Timeout Issues**

```javascript
// Increase timeout configuration
const threatCore = new PhantomThreatActorCore({
  api_timeout: 60000,        // 60 seconds
  request_retry_count: 3,
  connection_pool_size: 50
});
```

#### **Database Connection Issues**

```bash
# Check database connectivity
pg_isready -h postgres -p 5432 -U phantom

# Verify connection pool
SELECT count(*) FROM pg_stat_activity WHERE datname = 'phantom';
```

### **Log Analysis**

```bash
# Application logs
docker logs -f phantom-threat-actor

# System metrics
docker exec phantom-threat-actor curl http://localhost:9090/metrics

# Database logs
docker logs postgres | grep ERROR
```

---

## 📞 Enterprise Support

### **Support Channels**

- **Critical Issues (24/7)**: +1-800-PHANTOM (24/7 phone support)
- **Technical Support**: [support@phantomspire.security](mailto:support@phantomspire.security)
- **Professional Services**: [services@phantomspire.security](mailto:services@phantomspire.security)
- **Documentation**: [https://docs.phantomspire.security](https://docs.phantomspire.security)

### **SLA Commitments**

| Severity | Response Time | Resolution Target |
|----------|---------------|-------------------|
| **Critical** | 1 hour | 4 hours |
| **High** | 4 hours | 24 hours |
| **Medium** | 8 hours | 72 hours |
| **Low** | 24 hours | 5 business days |

---

**© 2025 Phantom Spire Security Technologies**  
*Enterprise Threat Intelligence & Attribution Platform*