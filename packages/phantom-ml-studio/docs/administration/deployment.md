# Deployment Guide

**Enterprise production deployment strategies and best practices**

This comprehensive guide covers all aspects of deploying Phantom ML Studio in production environments, from single-node installations to large-scale distributed deployments.

## 🎯 Deployment Overview

### Deployment Architecture Options
| Architecture | Use Case | Complexity | Scalability | Availability |
|-------------|----------|------------|-------------|--------------|
| **Single Node** | Development, POC | Low | Limited | Basic |
| **High Availability** | Small-medium production | Medium | Good | 99.9% |
| **Distributed** | Large-scale production | High | Excellent | 99.99% |
| **Multi-Region** | Global deployment | Very High | Unlimited | 99.999% |

### Infrastructure Requirements
```yaml
# Minimum Production Requirements
compute:
  cpu_cores: 8
  memory_gb: 32
  storage_gb: 500
  network_gbps: 1

# Recommended Production
compute:
  cpu_cores: 16
  memory_gb: 64
  storage_gb: 1000
  network_gbps: 10

# Enterprise Scale
compute:
  cpu_cores: 32+
  memory_gb: 128+
  storage_gb: 5000+
  network_gbps: 25+
```

## 🏗️ Single Node Deployment

### Prerequisites
```bash
# System requirements check
phantom-ml-studio system-check --deployment production

# Install required dependencies
sudo apt update && sudo apt install -y \
  docker.io \
  docker-compose \
  nginx \
  postgresql \
  redis-server \
  certbot

# Configure system limits
echo '* soft nofile 65536' | sudo tee -a /etc/security/limits.conf
echo '* hard nofile 65536' | sudo tee -a /etc/security/limits.conf
```

### Docker Compose Production Setup
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  phantom-ml-studio:
    image: phantomspire/ml-studio:latest
    container_name: phantom-ml-studio
    restart: unless-stopped
    ports:
      - "3000:3000"
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://phantom:${DB_PASSWORD}@postgres:5432/phantom_ml
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - PHANTOM_ML_CLUSTERING=false
      - PHANTOM_ML_MONITORING=true
      - PHANTOM_ML_LOG_LEVEL=info
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./config:/app/config
      - ./ssl:/app/ssl
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 8G
          cpus: '4'
        reservations:
          memory: 4G
          cpus: '2'

  postgres:
    image: postgres:15
    container_name: postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=phantom_ml
      - POSTGRES_USER=phantom
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    command: >
      postgres
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100
      -c random_page_cost=1.1
      -c effective_io_concurrency=200
      -c work_mem=4MB
      -c min_wal_size=1GB
      -c max_wal_size=4GB

  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    command: >
      redis-server
      --appendonly yes
      --maxmemory 2gb
      --maxmemory-policy allkeys-lru
      --save 900 1
      --save 300 10
      --save 60 10000
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/sites:/etc/nginx/sites-available:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - phantom-ml-studio

  # Monitoring stack
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-simple-json-datasource
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  default:
    name: phantom-ml-network
```

### Environment Configuration
```bash
# .env.production
NODE_ENV=production
COMPOSE_PROJECT_NAME=phantom-ml-studio

# Database
DB_PASSWORD=your-secure-db-password

# Security
JWT_SECRET=your-jwt-secret-key-minimum-32-characters
ENCRYPTION_KEY=your-encryption-key-exactly-32-chars

# Monitoring
GRAFANA_PASSWORD=your-grafana-admin-password

# SSL
SSL_ENABLED=true
DOMAIN=ml-studio.yourdomain.com

# Backup
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
```

### NGINX Configuration
```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=web:10m rate=50r/s;

    # Upstream definitions
    upstream phantom_ml_api {
        least_conn;
        server phantom-ml-studio:8080 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream phantom_ml_web {
        least_conn;
        server phantom-ml-studio:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Main server block
    server {
        listen 80;
        server_name ml-studio.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name ml-studio.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # Web interface
        location / {
            limit_req zone=web burst=20 nodelay;
            proxy_pass http://phantom_ml_web;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # API endpoints
        location /api {
            limit_req zone=api burst=50 nodelay;
            proxy_pass http://phantom_ml_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeout settings for ML operations
            proxy_connect_timeout 60s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
        }

        # Health check endpoint
        location /health {
            proxy_pass http://phantom_ml_api;
            access_log off;
        }

        # Static files with caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://phantom_ml_web;
            expires 1M;
            add_header Cache-Control "public, immutable";
        }

        # Security.txt
        location /.well-known/security.txt {
            return 200 "Contact: security@yourdomain.com\nExpires: 2025-01-01T00:00:00.000Z";
            add_header Content-Type text/plain;
        }
    }
}
```

### Deployment Script
```bash
#!/bin/bash
# deploy-single-node.sh

set -e

echo "🚀 Starting Phantom ML Studio single-node deployment..."

# Verify prerequisites
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

# Create directory structure
mkdir -p {data,logs,config,ssl,backups,monitoring}
mkdir -p nginx/sites
mkdir -p monitoring/{prometheus,grafana}

# Generate secure passwords if not provided
if [ ! -f .env.production ]; then
    echo "🔐 Generating secure configuration..."

    DB_PASSWORD=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 48)
    ENCRYPTION_KEY=$(openssl rand -base64 32 | head -c 32)
    GRAFANA_PASSWORD=$(openssl rand -base64 16)

    cat > .env.production << EOF
NODE_ENV=production
COMPOSE_PROJECT_NAME=phantom-ml-studio
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}
SSL_ENABLED=true
DOMAIN=ml-studio.yourdomain.com
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
EOF

    echo "✅ Configuration generated. Update .env.production with your domain."
fi

# SSL certificate setup
if [ ! -f ssl/fullchain.pem ]; then
    echo "🔒 Setting up SSL certificates..."

    read -p "Enter your domain name: " DOMAIN
    read -p "Enter your email for Let's Encrypt: " EMAIL

    # Obtain SSL certificate
    sudo certbot certonly --standalone \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN

    # Copy certificates
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/
    sudo chown $(id -u):$(id -g) ssl/*.pem

    echo "✅ SSL certificates configured"
fi

# Deploy application
echo "📦 Deploying application..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    echo "🌐 Web interface: https://$DOMAIN"
    echo "📊 Monitoring: https://$DOMAIN:3001"
    echo "📈 Metrics: https://$DOMAIN:9090"
else
    echo "❌ Deployment failed - health check failed"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# Setup backup cron job
echo "💾 Setting up automated backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/phantom-ml-studio/backup.sh") | crontab -

echo "🎉 Deployment complete!"
```

## 🔄 High Availability Deployment

### Load Balancer Configuration
```yaml
# haproxy.cfg
global
    daemon
    maxconn 4096
    log stdout local0

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httplog
    option dontlognull
    option redispatch
    retries 3

frontend phantom_ml_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/phantom-ml.pem
    redirect scheme https if !{ ssl_fc }

    # ACLs
    acl is_api path_beg /api
    acl is_websocket hdr(Upgrade) -i websocket

    # Routing
    use_backend phantom_ml_api if is_api
    use_backend phantom_ml_websocket if is_websocket
    default_backend phantom_ml_web

backend phantom_ml_web
    balance roundrobin
    option httpchk GET /health
    server web1 10.0.1.10:3000 check
    server web2 10.0.1.11:3000 check
    server web3 10.0.1.12:3000 check

backend phantom_ml_api
    balance roundrobin
    option httpchk GET /api/health
    timeout server 300s
    server api1 10.0.1.10:8080 check
    server api2 10.0.1.11:8080 check
    server api3 10.0.1.12:8080 check

backend phantom_ml_websocket
    balance source
    option httpchk GET /health
    server ws1 10.0.1.10:3000 check
    server ws2 10.0.1.11:3000 check
    server ws3 10.0.1.12:3000 check

listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 30s
    stats admin if TRUE
```

### Database High Availability
```yaml
# PostgreSQL with streaming replication
# docker-compose.ha.yml

services:
  postgres-primary:
    image: postgres:15
    environment:
      - POSTGRES_DB=phantom_ml
      - POSTGRES_USER=phantom
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_REPLICATION_USER=replica
      - POSTGRES_REPLICATION_PASSWORD=${REPLICA_PASSWORD}
    volumes:
      - postgres_primary_data:/var/lib/postgresql/data
      - ./postgresql/primary.conf:/etc/postgresql/postgresql.conf
      - ./postgresql/pg_hba.conf:/etc/postgresql/pg_hba.conf
    command: >
      postgres
      -c config_file=/etc/postgresql/postgresql.conf
      -c hba_file=/etc/postgresql/pg_hba.conf
    ports:
      - "5432:5432"

  postgres-replica:
    image: postgres:15
    environment:
      - PGUSER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_MASTER_SERVICE=postgres-primary
      - POSTGRES_REPLICATION_USER=replica
      - POSTGRES_REPLICATION_PASSWORD=${REPLICA_PASSWORD}
    volumes:
      - postgres_replica_data:/var/lib/postgresql/data
    depends_on:
      - postgres-primary
    ports:
      - "5433:5432"

  redis-cluster:
    image: redis:7-alpine
    command: >
      redis-server
      --cluster-enabled yes
      --cluster-config-file nodes.conf
      --cluster-node-timeout 5000
      --appendonly yes
      --port 7000
    ports:
      - "7000-7005:7000-7005"
    volumes:
      - redis_cluster_data:/data

volumes:
  postgres_primary_data:
  postgres_replica_data:
  redis_cluster_data:
```

## ☸️ Kubernetes Deployment

### Namespace and RBAC
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: phantom-ml-studio
  labels:
    name: phantom-ml-studio

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: phantom-ml-studio
  namespace: phantom-ml-studio

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: phantom-ml-studio
rules:
- apiGroups: [""]
  resources: ["pods", "services", "endpoints"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: phantom-ml-studio
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: phantom-ml-studio
subjects:
- kind: ServiceAccount
  name: phantom-ml-studio
  namespace: phantom-ml-studio
```

### ConfigMaps and Secrets
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: phantom-ml-config
  namespace: phantom-ml-studio
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  API_PORT: "8080"
  WEB_PORT: "3000"
  PHANTOM_ML_CLUSTERING: "true"
  PHANTOM_ML_MONITORING: "true"

---
apiVersion: v1
kind: Secret
metadata:
  name: phantom-ml-secrets
  namespace: phantom-ml-studio
type: Opaque
data:
  DATABASE_URL: <base64-encoded-database-url>
  REDIS_URL: <base64-encoded-redis-url>
  JWT_SECRET: <base64-encoded-jwt-secret>
  ENCRYPTION_KEY: <base64-encoded-encryption-key>
```

### Application Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: phantom-ml-studio
  namespace: phantom-ml-studio
  labels:
    app: phantom-ml-studio
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 2
  selector:
    matchLabels:
      app: phantom-ml-studio
  template:
    metadata:
      labels:
        app: phantom-ml-studio
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: phantom-ml-studio
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: phantom-ml-studio
        image: phantomspire/ml-studio:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: web
        - containerPort: 8080
          name: api
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: phantom-ml-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: phantom-ml-secrets
              key: DATABASE_URL
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: phantom-ml-secrets
              key: REDIS_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: phantom-ml-secrets
              key: JWT_SECRET
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 2
        volumeMounts:
        - name: data-volume
          mountPath: /app/data
        - name: config-volume
          mountPath: /app/config
        - name: logs-volume
          mountPath: /app/logs
      volumes:
      - name: data-volume
        persistentVolumeClaim:
          claimName: phantom-ml-data
      - name: config-volume
        configMap:
          name: phantom-ml-config
      - name: logs-volume
        emptyDir: {}
      imagePullSecrets:
      - name: registry-secret

---
apiVersion: v1
kind: Service
metadata:
  name: phantom-ml-studio-service
  namespace: phantom-ml-studio
  labels:
    app: phantom-ml-studio
spec:
  selector:
    app: phantom-ml-studio
  ports:
  - name: web
    port: 80
    targetPort: 3000
  - name: api
    port: 8080
    targetPort: 8080
  type: ClusterIP

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: phantom-ml-data
  namespace: phantom-ml-studio
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 1Ti
  storageClassName: fast-ssd
```

### Horizontal Pod Autoscaler
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: phantom-ml-studio-hpa
  namespace: phantom-ml-studio
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: phantom-ml-studio
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
      selectPolicy: Min
```

### Ingress Configuration
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: phantom-ml-studio-ingress
  namespace: phantom-ml-studio
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "1000"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
    nginx.ingress.kubernetes.io/proxy-body-size: "100m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
    nginx.ingress.kubernetes.io/websocket-services: "phantom-ml-studio-service"
    nginx.ingress.kubernetes.io/affinity: "cookie"
    nginx.ingress.kubernetes.io/session-cookie-name: "phantom-ml-session"
    nginx.ingress.kubernetes.io/session-cookie-expires: "86400"
    nginx.ingress.kubernetes.io/session-cookie-max-age: "86400"
spec:
  tls:
  - hosts:
    - ml-studio.yourdomain.com
    secretName: phantom-ml-tls
  rules:
  - host: ml-studio.yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: phantom-ml-studio-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: phantom-ml-studio-service
            port:
              number: 80
```

## 🌍 Multi-Region Deployment

### Global Architecture
```yaml
# Global deployment with region failover
regions:
  - name: us-east-1
    primary: true
    clusters:
      - production
      - staging
  - name: us-west-2
    primary: false
    clusters:
      - production-replica
  - name: eu-west-1
    primary: false
    clusters:
      - production-replica

traffic_routing:
  strategy: geographic
  failover: automatic
  health_check_interval: 30s

data_replication:
  strategy: async
  lag_tolerance: 5s
  conflict_resolution: last_write_wins
```

### ArgoCD GitOps Setup
```yaml
# gitops/application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: phantom-ml-studio-prod
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://git.company.com/ml-platform/phantom-ml-studio
    targetRevision: main
    path: k8s/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: phantom-ml-studio
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: phantomml.azurecr.io
  IMAGE_NAME: phantom-ml-studio

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Run security audit
      run: npm audit --audit-level moderate

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}
    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Log in to registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ secrets.REGISTRY_USERNAME }}
        password: ${{ secrets.REGISTRY_PASSWORD }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha,prefix={{branch}}-

    - name: Build and push
      id: build
      uses: docker/build-push-action@v4
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  security-scan:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ${{ needs.build.outputs.image-tag }}
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: Upload Trivy scan results to GitHub Security tab
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  deploy-staging:
    needs: [build, security-scan]
    runs-on: ubuntu-latest
    environment: staging
    steps:
    - uses: actions/checkout@v3

    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'latest'

    - name: Deploy to staging
      run: |
        kubectl set image deployment/phantom-ml-studio \
          phantom-ml-studio=${{ needs.build.outputs.image-tag }} \
          -n phantom-ml-studio-staging

    - name: Wait for rollout
      run: |
        kubectl rollout status deployment/phantom-ml-studio \
          -n phantom-ml-studio-staging \
          --timeout=600s

    - name: Run smoke tests
      run: |
        ./scripts/smoke-tests.sh staging

  deploy-production:
    needs: [build, security-scan, deploy-staging]
    runs-on: ubuntu-latest
    environment: production
    if: startsWith(github.ref, 'refs/tags/')
    steps:
    - uses: actions/checkout@v3

    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'latest'

    - name: Blue-Green Deployment
      run: |
        ./scripts/blue-green-deploy.sh \
          ${{ needs.build.outputs.image-tag }} \
          production

    - name: Health check
      run: |
        ./scripts/health-check.sh production

    - name: Notify deployment success
      if: success()
      uses: 8398a7/action-slack@v3
      with:
        status: success
        text: 'Production deployment successful! 🎉'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

    - name: Notify deployment failure
      if: failure()
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        text: 'Production deployment failed! 🚨'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## 🔧 Deployment Scripts

### Blue-Green Deployment Script
```bash
#!/bin/bash
# scripts/blue-green-deploy.sh

set -e

IMAGE_TAG=$1
ENVIRONMENT=$2
NAMESPACE="phantom-ml-studio-${ENVIRONMENT}"

echo "🔄 Starting blue-green deployment..."
echo "Image: ${IMAGE_TAG}"
echo "Environment: ${ENVIRONMENT}"

# Get current deployment
CURRENT_DEPLOYMENT=$(kubectl get deployment phantom-ml-studio \
  -n ${NAMESPACE} \
  -o jsonpath='{.metadata.labels.version}' 2>/dev/null || echo "blue")

if [ "$CURRENT_DEPLOYMENT" = "blue" ]; then
    NEW_DEPLOYMENT="green"
else
    NEW_DEPLOYMENT="blue"
fi

echo "Current deployment: ${CURRENT_DEPLOYMENT}"
echo "New deployment: ${NEW_DEPLOYMENT}"

# Create new deployment
envsubst < k8s/deployment-template.yaml | \
  sed "s/{{VERSION}}/${NEW_DEPLOYMENT}/g" | \
  sed "s/{{IMAGE_TAG}}/${IMAGE_TAG}/g" | \
  kubectl apply -f -

# Wait for new deployment to be ready
echo "⏳ Waiting for new deployment to be ready..."
kubectl rollout status deployment/phantom-ml-studio-${NEW_DEPLOYMENT} \
  -n ${NAMESPACE} \
  --timeout=600s

# Run health checks
echo "🏥 Running health checks..."
NEW_POD=$(kubectl get pods -l app=phantom-ml-studio,version=${NEW_DEPLOYMENT} \
  -n ${NAMESPACE} \
  -o jsonpath='{.items[0].metadata.name}')

kubectl exec ${NEW_POD} -n ${NAMESPACE} -- curl -f http://localhost:8080/health

# Update service to point to new deployment
kubectl patch service phantom-ml-studio-service \
  -n ${NAMESPACE} \
  -p '{"spec":{"selector":{"version":"'${NEW_DEPLOYMENT}'"}}}'

echo "✅ Traffic switched to ${NEW_DEPLOYMENT} deployment"

# Wait and verify
sleep 30
echo "🧪 Running final verification..."
kubectl exec ${NEW_POD} -n ${NAMESPACE} -- curl -f http://localhost:8080/health

# Clean up old deployment
if [ "${CURRENT_DEPLOYMENT}" != "blue" ] || [ "${CURRENT_DEPLOYMENT}" != "green" ]; then
    echo "🧹 Cleaning up old deployment: ${CURRENT_DEPLOYMENT}"
    kubectl delete deployment phantom-ml-studio-${CURRENT_DEPLOYMENT} \
      -n ${NAMESPACE} || true
fi

echo "🎉 Blue-green deployment completed successfully!"
```

### Rollback Script
```bash
#!/bin/bash
# scripts/rollback.sh

set -e

ENVIRONMENT=$1
NAMESPACE="phantom-ml-studio-${ENVIRONMENT}"

echo "🔄 Starting rollback process..."

# Get previous deployment
PREVIOUS_DEPLOYMENT=$(kubectl rollout history deployment/phantom-ml-studio \
  -n ${NAMESPACE} \
  --revision=1 | grep -o 'revision [0-9]*' | tail -1 | cut -d' ' -f2)

if [ -z "$PREVIOUS_DEPLOYMENT" ]; then
    echo "❌ No previous deployment found"
    exit 1
fi

echo "Rolling back to revision: ${PREVIOUS_DEPLOYMENT}"

# Perform rollback
kubectl rollout undo deployment/phantom-ml-studio \
  -n ${NAMESPACE} \
  --to-revision=${PREVIOUS_DEPLOYMENT}

# Wait for rollback to complete
kubectl rollout status deployment/phantom-ml-studio \
  -n ${NAMESPACE} \
  --timeout=300s

# Verify health
echo "🏥 Verifying health after rollback..."
kubectl exec deployment/phantom-ml-studio \
  -n ${NAMESPACE} \
  -- curl -f http://localhost:8080/health

echo "✅ Rollback completed successfully!"
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] ✅ **Infrastructure**: Verify compute, storage, and network resources
- [ ] ✅ **Dependencies**: Ensure all external dependencies are available
- [ ] ✅ **Configuration**: Validate all configuration files and secrets
- [ ] ✅ **Security**: Review security settings and certificates
- [ ] ✅ **Backup**: Ensure backup systems are in place
- [ ] ✅ **Monitoring**: Configure monitoring and alerting
- [ ] ✅ **Testing**: Complete all testing phases

### During Deployment
- [ ] ✅ **Health Checks**: Monitor service health during deployment
- [ ] ✅ **Performance**: Verify performance metrics
- [ ] ✅ **Traffic**: Gradually increase traffic to new deployment
- [ ] ✅ **Rollback Plan**: Keep rollback procedure ready
- [ ] ✅ **Communication**: Notify stakeholders of deployment status

### Post-Deployment
- [ ] ✅ **Verification**: Complete end-to-end testing
- [ ] ✅ **Monitoring**: Confirm monitoring systems are active
- [ ] ✅ **Documentation**: Update deployment documentation
- [ ] ✅ **Cleanup**: Remove temporary resources
- [ ] ✅ **Team Notification**: Inform team of successful deployment

---

**Next Steps**: Continue with [Security Configuration](./security.md) for comprehensive security setup and best practices.