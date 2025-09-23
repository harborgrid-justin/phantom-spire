# Installation Guide

**Complete installation instructions for all deployment scenarios**

This comprehensive guide covers installation options for development, staging, and production environments across different platforms and infrastructure configurations.

## 📋 System Requirements

### Minimum Requirements
| Component | Specification |
|-----------|---------------|
| **Operating System** | Windows 10+, macOS 10.15+, Ubuntu 18.04+, CentOS 7+, RHEL 8+ |
| **Node.js** | 18.0.0 or higher (LTS recommended) |
| **Memory** | 8GB RAM |
| **Storage** | 20GB available disk space |
| **Network** | Internet connection for downloads |
| **Architecture** | x64 (Intel/AMD), ARM64 (Apple Silicon) |

### Recommended Requirements
| Component | Specification |
|-----------|---------------|
| **Memory** | 16GB+ RAM |
| **Storage** | 100GB+ SSD storage |
| **CPU** | 8+ cores |
| **GPU** | NVIDIA GPU with CUDA support (optional) |
| **Network** | High-speed internet (1Gbps+) |

### Enterprise Requirements
| Component | Specification |
|-----------|---------------|
| **Memory** | 32GB+ RAM |
| **Storage** | 500GB+ NVMe SSD |
| **CPU** | 16+ cores, 3.0GHz+ |
| **GPU** | NVIDIA A100, V100, or RTX series |
| **Network** | Dedicated network infrastructure |
| **Load Balancer** | HAProxy, NGINX, or cloud load balancer |
| **Database** | PostgreSQL 13+, Redis 6+ |

## 🚀 Installation Methods

### Method 1: NPM Package Installation (Recommended)

#### Global Installation
```bash
# Install latest stable version globally
npm install -g @phantom-spire/ml-studio

# Verify installation
phantom-ml-studio --version
phantom-ml-studio --help

# Initialize new project
mkdir my-ml-project
cd my-ml-project
phantom-ml-studio init
```

#### Local Project Installation
```bash
# Create new project directory
mkdir my-ml-project && cd my-ml-project

# Initialize package.json
npm init -y

# Install as dependency
npm install @phantom-spire/ml-studio

# Install development dependencies
npm install --save-dev @types/node typescript ts-node

# Create start script
echo '{"scripts": {"start": "phantom-ml-studio start"}}' > package.json
```

#### Version-Specific Installation
```bash
# Install specific version
npm install -g @phantom-spire/ml-studio@1.0.0

# Install beta/preview versions
npm install -g @phantom-spire/ml-studio@beta
npm install -g @phantom-spire/ml-studio@next

# List available versions
npm view @phantom-spire/ml-studio versions --json
```

### Method 2: Source Code Installation

#### Prerequisites
```bash
# Install build tools
npm install -g typescript node-gyp

# Install Rust (required for native modules)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Verify Rust installation
rustc --version
cargo --version
```

#### Clone and Build
```bash
# Clone repository
git clone https://github.com/phantom-spire/phantom-ml-studio.git
cd phantom-ml-studio

# Install dependencies
npm install

# Build native modules
npm run build:native

# Build TypeScript
npm run build

# Run tests (optional)
npm test

# Start development server
npm run dev

# Build for production
npm run build:prod
```

#### Custom Build Configuration
```bash
# Enable GPU support
export PHANTOM_ML_GPU_SUPPORT=true
npm run build:native

# Enable CUDA acceleration
export PHANTOM_ML_CUDA_VERSION=11.8
npm run build:native

# Build with optimizations
export NODE_ENV=production
export PHANTOM_ML_OPTIMIZE=true
npm run build:prod
```

### Method 3: Docker Installation

#### Quick Start with Docker
```bash
# Pull official image
docker pull phantomspire/ml-studio:latest

# Run with default configuration
docker run -d \
  --name phantom-ml-studio \
  -p 3000:3000 \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  phantomspire/ml-studio:latest

# Check container status
docker ps
docker logs phantom-ml-studio
```

#### Docker Compose Setup
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  phantom-ml-studio:
    image: phantomspire/ml-studio:latest
    ports:
      - "3000:3000"
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/phantom_ml
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./data:/app/data
      - ./config:/app/config
      - ./logs:/app/logs
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=phantom_ml
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - phantom-ml-studio

volumes:
  postgres_data:
  redis_data:
```

Start the stack:
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale the application
docker-compose up -d --scale phantom-ml-studio=3

# Stop all services
docker-compose down
```

#### Custom Docker Build
```dockerfile
# Create custom Dockerfile
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    rust \
    cargo

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S phantom -u 1001

# Change ownership
RUN chown -R phantom:nodejs /app
USER phantom

# Expose ports
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start application
CMD ["npm", "start"]
```

Build and run:
```bash
# Build custom image
docker build -t my-phantom-ml-studio .

# Run custom image
docker run -d \
  --name my-phantom-ml \
  -p 3000:3000 \
  -p 8080:8080 \
  my-phantom-ml-studio
```

### Method 4: Kubernetes Deployment

#### Prerequisites
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify cluster access
kubectl cluster-info
kubectl get nodes
```

#### Helm Chart Installation
```bash
# Add Phantom Spire Helm repository
helm repo add phantom-spire https://charts.phantom-spire.com
helm repo update

# Install with default values
helm install phantom-ml-studio phantom-spire/ml-studio

# Install with custom values
helm install phantom-ml-studio phantom-spire/ml-studio \
  --set image.tag=latest \
  --set replicaCount=3 \
  --set persistence.enabled=true \
  --set persistence.size=100Gi \
  --set postgresql.enabled=true \
  --set redis.enabled=true

# Upgrade existing installation
helm upgrade phantom-ml-studio phantom-spire/ml-studio

# Check installation status
helm status phantom-ml-studio
kubectl get pods -l app=phantom-ml-studio
```

#### Custom Kubernetes Manifests
Create `k8s-manifests.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: phantom-ml-studio
  labels:
    app: phantom-ml-studio
spec:
  replicas: 3
  selector:
    matchLabels:
      app: phantom-ml-studio
  template:
    metadata:
      labels:
        app: phantom-ml-studio
    spec:
      containers:
      - name: phantom-ml-studio
        image: phantomspire/ml-studio:latest
        ports:
        - containerPort: 3000
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: phantom-ml-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: phantom-ml-secrets
              key: redis-url
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
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        volumeMounts:
        - name: data-volume
          mountPath: /app/data
        - name: config-volume
          mountPath: /app/config
      volumes:
      - name: data-volume
        persistentVolumeClaim:
          claimName: phantom-ml-data
      - name: config-volume
        configMap:
          name: phantom-ml-config

---
apiVersion: v1
kind: Service
metadata:
  name: phantom-ml-studio-service
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
  type: LoadBalancer

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: phantom-ml-studio-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - ml-studio.yourdomain.com
    secretName: phantom-ml-tls
  rules:
  - host: ml-studio.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: phantom-ml-studio-service
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: phantom-ml-studio-service
            port:
              number: 8080
```

Apply manifests:
```bash
# Create namespace
kubectl create namespace phantom-ml

# Apply all manifests
kubectl apply -f k8s-manifests.yaml -n phantom-ml

# Check deployment status
kubectl get all -n phantom-ml

# View logs
kubectl logs -f deployment/phantom-ml-studio -n phantom-ml
```

## 🔧 Environment-Specific Configuration

### Development Environment
```bash
# Install development dependencies
npm install --save-dev \
  @types/node \
  @types/jest \
  jest \
  nodemon \
  ts-node \
  typescript

# Create development configuration
cat > .env.development << EOF
NODE_ENV=development
LOG_LEVEL=debug
PHANTOM_ML_HOT_RELOAD=true
PHANTOM_ML_DEBUG_MODE=true
PHANTOM_ML_PROFILING=false
DATABASE_URL=sqlite:./dev.db
REDIS_URL=redis://localhost:6379
API_PORT=8080
WEB_PORT=3000
EOF

# Start in development mode
npm run dev
```

### Staging Environment
```bash
# Create staging configuration
cat > .env.staging << EOF
NODE_ENV=staging
LOG_LEVEL=info
PHANTOM_ML_MONITORING=true
PHANTOM_ML_ANALYTICS=true
DATABASE_URL=postgresql://user:pass@staging-db:5432/phantom_ml
REDIS_URL=redis://staging-redis:6379
API_PORT=8080
WEB_PORT=3000
CORS_ORIGIN=https://staging.yourdomain.com
EOF

# Start staging environment
NODE_ENV=staging npm start
```

### Production Environment
```bash
# Create production configuration
cat > .env.production << EOF
NODE_ENV=production
LOG_LEVEL=warn
PHANTOM_ML_CLUSTERING=true
PHANTOM_ML_MONITORING=true
PHANTOM_ML_SECURITY=strict
PHANTOM_ML_PERFORMANCE_OPTIMIZATIONS=true
DATABASE_URL=postgresql://user:pass@prod-db:5432/phantom_ml
REDIS_URL=redis://prod-redis:6379
API_PORT=8080
WEB_PORT=3000
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=1000
JWT_SECRET=your-production-jwt-secret
ENCRYPTION_KEY=your-production-encryption-key
EOF

# Start production environment
NODE_ENV=production npm start
```

## 🔐 Security Configuration

### SSL/TLS Setup
```bash
# Generate self-signed certificates (development only)
openssl req -x509 -newkey rsa:4096 -keyout private-key.pem -out certificate.pem -days 365 -nodes

# Use Let's Encrypt (production)
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

# Configure SSL in environment
cat >> .env << EOF
SSL_ENABLED=true
SSL_CERT_PATH=/path/to/certificate.pem
SSL_KEY_PATH=/path/to/private-key.pem
HTTPS_PORT=443
FORCE_HTTPS=true
EOF
```

### Firewall Configuration
```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload

# Configure reverse proxy (NGINX)
sudo apt install nginx

cat > /etc/nginx/sites-available/phantom-ml-studio << EOF
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private-key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/phantom-ml-studio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 📊 Database Setup

### PostgreSQL Configuration
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE phantom_ml;
CREATE USER phantom_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE phantom_ml TO phantom_user;
ALTER USER phantom_user CREATEDB;
\q
EOF

# Configure PostgreSQL for performance
sudo nano /etc/postgresql/15/main/postgresql.conf
# Add/modify these settings:
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200

# Restart PostgreSQL
sudo systemctl restart postgresql

# Initialize database schema
phantom-ml-studio db:migrate
phantom-ml-studio db:seed
```

### Redis Configuration
```bash
# Install Redis
sudo apt install redis-server

# Configure Redis for production
sudo nano /etc/redis/redis.conf
# Modify these settings:
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000

# Restart Redis
sudo systemctl restart redis-server

# Test Redis connection
redis-cli ping
```

## 🎛️ Performance Tuning

### Node.js Optimization
```bash
# Increase memory limits
export NODE_OPTIONS="--max-old-space-size=8192"

# Enable clustering
export PHANTOM_ML_CLUSTER_WORKERS=4

# Configure garbage collection
export NODE_OPTIONS="--max-old-space-size=8192 --optimize-for-size"

# Enable native addons
export PHANTOM_ML_NATIVE_OPTIMIZATIONS=true
```

### System-Level Optimization
```bash
# Increase file descriptor limits
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Configure kernel parameters
cat >> /etc/sysctl.conf << EOF
net.core.somaxconn = 65536
net.ipv4.tcp_max_syn_backlog = 65536
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 120
net.ipv4.tcp_tw_reuse = 1
EOF

sudo sysctl -p
```

## ✅ Installation Verification

### Health Check Commands
```bash
# Check platform status
phantom-ml-studio status

# Verify all components
phantom-ml-studio doctor

# Test API endpoints
curl -f http://localhost:8080/health
curl -f http://localhost:8080/api/v1/status

# Run diagnostic tests
phantom-ml-studio test --comprehensive

# Performance benchmark
phantom-ml-studio benchmark --duration 60s
```

### Sample Model Test
```bash
# Deploy test model
phantom-ml-studio deploy-sample --model iris-classifier

# Test prediction
curl -X POST http://localhost:8080/api/v1/models/iris-classifier/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [5.1, 3.5, 1.4, 0.2]}'

# Expected response
{
  "prediction": "setosa",
  "confidence": 0.99,
  "model_version": "1.0.0"
}
```

## 🚨 Troubleshooting

### Common Installation Issues

#### Permission Errors
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use nvm for user-level installation
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Build Failures
```bash
# Clear cache and rebuild
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Install build tools
sudo apt install build-essential python3-dev

# Rebuild native modules
npm rebuild
```

#### Port Conflicts
```bash
# Find processes using ports
sudo lsof -i :3000
sudo lsof -i :8080

# Kill conflicting processes
sudo pkill -f "node.*3000"
sudo pkill -f "node.*8080"

# Use alternative ports
phantom-ml-studio start --web-port 3001 --api-port 8081
```

#### Memory Issues
```bash
# Monitor memory usage
free -h
top -p $(pgrep node)

# Increase swap space
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Platform-Specific Issues

#### Windows Installation
```powershell
# Install Windows Build Tools
npm install -g windows-build-tools

# Install Visual Studio Build Tools
chocolatey install visualstudio2019buildtools

# Configure Python path
npm config set python python3.exe

# Install from PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install -g @phantom-spire/ml-studio
```

#### macOS Installation
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node python@3.9

# Install Phantom ML Studio
npm install -g @phantom-spire/ml-studio
```

#### Linux Distribution Issues
```bash
# Ubuntu/Debian missing dependencies
sudo apt update
sudo apt install curl build-essential python3-dev python3-pip

# CentOS/RHEL missing dependencies
sudo yum groupinstall "Development Tools"
sudo yum install python3-devel

# Alpine Linux dependencies
apk add --no-cache make gcc g++ python3 python3-dev
```

## 📋 Post-Installation Checklist

- [ ] ✅ **Platform Installed**: Successfully installed via preferred method
- [ ] ✅ **Dependencies Verified**: All required dependencies installed
- [ ] ✅ **Configuration Complete**: Environment variables configured
- [ ] ✅ **Database Connected**: Database connection established
- [ ] ✅ **Services Running**: All platform services started
- [ ] ✅ **Health Check Passed**: Platform health check successful
- [ ] ✅ **API Accessible**: API endpoints responding correctly
- [ ] ✅ **Web Interface**: Dashboard accessible via browser
- [ ] ✅ **Sample Model**: Test model deployed and working
- [ ] ✅ **Security Configured**: SSL/TLS and firewall configured
- [ ] ✅ **Performance Tuned**: System optimized for workload
- [ ] ✅ **Monitoring Active**: Health monitoring enabled
- [ ] ✅ **Backup Configured**: Data backup strategy implemented

---

**Next Steps**: Continue with the [Configuration Guide](./configuration.md) to customize your Phantom ML Studio installation for your specific use case.