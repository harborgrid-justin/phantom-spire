#!/bin/bash

# Phantom ML Enterprise Installation Script
# This script sets up the complete enterprise ML platform with high availability,
# security, compliance, and monitoring features.

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Configuration
PHANTOM_ML_VERSION="1.0.1"
ENTERPRISE_MODE="true"
DEPLOYMENT_TYPE="docker-compose" # or "kubernetes"
COMPLIANCE_FRAMEWORK="SOC2" # SOC2, GDPR, HIPAA, ISO27001

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
    
    # Check required tools
    local required_tools=("docker" "docker-compose" "node" "npm" "git" "openssl")
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error "$tool is required but not installed"
        fi
    done
    
    # Check Docker version
    local docker_version=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    local required_docker="20.10.0"
    
    if ! printf '%s\n%s\n' "$required_docker" "$docker_version" | sort -V -C; then
        error "Docker version $required_docker or higher is required (found $docker_version)"
    fi
    
    # Check available disk space (minimum 50GB)
    local available_space=$(df / | awk 'NR==2 {print $4}')
    local required_space=$((50 * 1024 * 1024)) # 50GB in KB
    
    if [[ $available_space -lt $required_space ]]; then
        error "Insufficient disk space. At least 50GB required"
    fi
    
    # Check available memory (minimum 8GB)
    local available_memory=$(free -k | awk 'NR==2 {print $2}')
    local required_memory=$((8 * 1024 * 1024)) # 8GB in KB
    
    if [[ $available_memory -lt $required_memory ]]; then
        warning "Less than 8GB RAM available. Performance may be impacted"
    fi
    
    success "Prerequisites check completed"
}

# Generate secure secrets
generate_secrets() {
    log "Generating secure secrets..."
    
    local env_file=".env.enterprise"
    
    cat > "$env_file" << EOF
# Phantom ML Enterprise Configuration
ENTERPRISE_MODE=true
DEPLOYMENT_TYPE=$DEPLOYMENT_TYPE
COMPLIANCE_FRAMEWORK=$COMPLIANCE_FRAMEWORK

# Database Configuration
DB_PASSWORD=$(openssl rand -base64 32)
REPLICATION_PASSWORD=$(openssl rand -base64 32)

# Redis Configuration
REDIS_PASSWORD=$(openssl rand -base64 32)

# Elasticsearch Configuration
ELASTIC_PASSWORD=$(openssl rand -base64 32)

# JWT and Encryption
JWT_SECRET=$(openssl rand -base64 64)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Monitoring
GRAFANA_PASSWORD=$(openssl rand -base64 16)

# Vault Configuration
VAULT_TOKEN=$(openssl rand -base64 32)

# MinIO Configuration
MINIO_ROOT_USER=phantom-admin
MINIO_ROOT_PASSWORD=$(openssl rand -base64 24)

# SSL Configuration
SSL_CERT_PATH=./ssl/phantom-ml.crt
SSL_KEY_PATH=./ssl/phantom-ml.key

# High Availability
HA_ENABLED=true
REPLICA_COUNT=3

# Audit Logging
AUDIT_ENABLED=true
AUDIT_RETENTION_DAYS=2555  # 7 years for compliance

# Multi-tenancy
MULTI_TENANT_ENABLED=true
TENANT_ISOLATION_LEVEL=schema

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30

# Monitoring and Alerting
MONITORING_ENABLED=true
ALERTING_ENABLED=true
METRICS_RETENTION_DAYS=365

# Enterprise Features
RBAC_ENABLED=true
DATA_ENCRYPTION_ENABLED=true
COMPLIANCE_REPORTING_ENABLED=true
EOF

    chmod 600 "$env_file"
    success "Secrets generated and saved to $env_file"
}

# Generate SSL certificates
generate_ssl_certificates() {
    log "Generating SSL certificates..."
    
    mkdir -p ssl
    
    # Generate private key
    openssl genrsa -out ssl/phantom-ml.key 4096
    
    # Generate certificate signing request
    cat > ssl/phantom-ml.conf << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = phantom-ml.enterprise.com
C = US
ST = State
L = City
O = Phantom Spire Security
OU = ML Engineering

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = phantom-ml.enterprise.com
DNS.2 = api.phantom-ml.enterprise.com
DNS.3 = localhost
IP.1 = 127.0.0.1
EOF

    # Generate self-signed certificate (for development/testing)
    openssl req -new -x509 -key ssl/phantom-ml.key -out ssl/phantom-ml.crt \
        -days 365 -config ssl/phantom-ml.conf -extensions v3_req
    
    # Set proper permissions
    chmod 600 ssl/phantom-ml.key
    chmod 644 ssl/phantom-ml.crt
    
    success "SSL certificates generated"
}

# Setup enterprise configuration
setup_enterprise_config() {
    log "Setting up enterprise configuration..."
    
    # Create enterprise config directory
    mkdir -p config/enterprise
    
    # Create compliance configuration
    cat > config/enterprise/compliance.json << EOF
{
  "framework": "$COMPLIANCE_FRAMEWORK",
  "features": {
    "audit_logging": true,
    "data_encryption": true,
    "access_control": true,
    "data_residency": true,
    "retention_policies": true
  },
  "audit": {
    "retention_days": 2555,
    "log_level": "comprehensive",
    "destinations": ["database", "elasticsearch", "file"],
    "pii_handling": {
      "redaction": true,
      "encryption": true,
      "anonymization": false
    }
  },
  "encryption": {
    "at_rest": {
      "database": {
        "enabled": true,
        "algorithm": "AES256",
        "key_rotation_days": 90
      },
      "file_storage": {
        "enabled": true,
        "algorithm": "AES256"
      }
    },
    "in_transit": {
      "tls_version": "TLS13",
      "certificate_validation": true,
      "hsts_enabled": true
    }
  },
  "access_control": {
    "rbac": {
      "enabled": true,
      "inheritance": true,
      "dynamic_roles": false
    },
    "mfa": {
      "enabled": true,
      "methods": ["TOTP", "SMS"],
      "grace_period_hours": 24
    }
  }
}
EOF

    # Create multi-tenant configuration
    cat > config/enterprise/multi-tenant.json << EOF
{
  "isolation_level": "schema",
  "tenant_limits": {
    "max_models": 100,
    "max_data_size_gb": 10,
    "max_requests_per_minute": 1000,
    "max_concurrent_training": 5
  },
  "resource_quotas": {
    "cpu_cores": 4.0,
    "memory_gb": 16.0,
    "gpu_hours_per_month": 100.0,
    "storage_gb": 100.0
  },
  "cross_tenant_policies": {
    "allow_data_sharing": false,
    "allow_model_sharing": false,
    "require_encryption": true,
    "audit_cross_tenant_access": true
  }
}
EOF

    # Create monitoring configuration
    cat > config/enterprise/monitoring.json << EOF
{
  "metrics": {
    "enabled": true,
    "retention_days": 365,
    "collection_interval_seconds": 15
  },
  "alerting": {
    "enabled": true,
    "channels": ["email", "slack", "webhook"],
    "rules": [
      {
        "name": "high_cpu_usage",
        "condition": "cpu_usage > 80",
        "duration": "5m",
        "severity": "warning"
      },
      {
        "name": "high_memory_usage",
        "condition": "memory_usage > 85",
        "duration": "5m",
        "severity": "warning"
      },
      {
        "name": "api_high_error_rate",
        "condition": "error_rate > 5",
        "duration": "2m",
        "severity": "critical"
      }
    ]
  },
  "logging": {
    "level": "info",
    "format": "json",
    "outputs": ["stdout", "file", "elasticsearch"]
  }
}
EOF

    success "Enterprise configuration created"
}

# Install and build Phantom ML Core
install_phantom_ml() {
    log "Installing Phantom ML Core..."
    
    # Install Rust if not present
    if ! command -v rustc &> /dev/null; then
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source ~/.cargo/env
    fi
    
    # Navigate to phantom-ml-core directory
    cd packages/phantom-ml-core
    
    # Build with enterprise features
    cargo build --release --features enterprise
    
    # Build NAPI bindings
    npm install
    npm run build:napi
    
    # Run tests
    cargo test --features enterprise
    
    cd ../..
    
    success "Phantom ML Core installed and built"
}

# Setup databases with enterprise configuration
setup_databases() {
    log "Setting up databases with enterprise configuration..."
    
    # Create database initialization scripts
    mkdir -p postgres/
    
    cat > postgres/init-enterprise.sql << EOF
-- Create enterprise database schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create audit schema
CREATE SCHEMA IF NOT EXISTS audit;

-- Create tenant isolation schema
CREATE SCHEMA IF NOT EXISTS tenant_management;

-- Create compliance schema
CREATE SCHEMA IF NOT EXISTS compliance;

-- Enable row level security
ALTER DATABASE phantom_ml SET row_security = on;

-- Create enterprise tables
\i /docker-entrypoint-initdb.d/enterprise-tables.sql
EOF

    cat > postgres/enterprise-tables.sql << EOF
-- Tenant management
CREATE TABLE tenant_management.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    schema_name VARCHAR(63) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    resource_limits JSONB DEFAULT '{}'
);

-- Audit log table
CREATE TABLE audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id UUID REFERENCES tenant_management.tenants(id),
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    result VARCHAR(50) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    risk_score DECIMAL(3,2)
);

-- Compliance data
CREATE TABLE compliance.compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework VARCHAR(50) NOT NULL,
    report_date DATE NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'generated',
    report_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_timestamp ON audit.audit_logs(timestamp);
CREATE INDEX idx_audit_logs_tenant ON audit.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_event_type ON audit.audit_logs(event_type);
CREATE INDEX idx_tenants_status ON tenant_management.tenants(status);
EOF

    # Create PostgreSQL configuration
    cat > postgres/postgresql.conf << EOF
# Enterprise PostgreSQL Configuration for Phantom ML

# Connection Settings
listen_addresses = '*'
port = 5432
max_connections = 200
superuser_reserved_connections = 3

# Memory Settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Write Ahead Logging (WAL) for Replication
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /var/lib/postgresql/archive/%f && cp %p /var/lib/postgresql/archive/%f'
max_wal_senders = 3
wal_keep_segments = 64

# Replication Settings
hot_standby = on
hot_standby_feedback = on

# Security Settings
ssl = on
ssl_cert_file = '/var/lib/postgresql/server.crt'
ssl_key_file = '/var/lib/postgresql/server.key'
password_encryption = scram-sha-256

# Logging for Audit
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'all'
log_connections = on
log_disconnections = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# Row Level Security
row_security = on

# Performance Settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
random_page_cost = 1.1
effective_io_concurrency = 200
EOF

    cat > postgres/pg_hba.conf << EOF
# PostgreSQL Enterprise Access Control
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Local connections
local   all             postgres                                trust
local   all             all                                     md5

# IPv4 connections
host    all             all             127.0.0.1/32            md5
host    all             all             172.20.0.0/16           md5

# Replication connections
host    replication     replicator      172.20.0.0/16           md5
EOF

    success "Database enterprise configuration created"
}

# Setup monitoring and observability
setup_monitoring() {
    log "Setting up monitoring and observability..."
    
    mkdir -p prometheus/ grafana/dashboards grafana/datasources
    
    # Prometheus configuration
    cat > prometheus/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'phantom-ml-api'
    static_configs:
      - targets: ['phantom-ml-api-1:9000', 'phantom-ml-api-2:9000', 'phantom-ml-api-3:9000']
    scrape_interval: 15s
    metrics_path: /metrics

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'elasticsearch'
    static_configs:
      - targets: ['elasticsearch-exporter:9114']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

    # Grafana datasources
    cat > grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

    # Create basic dashboard
    cat > grafana/dashboards/phantom-ml-overview.json << EOF
{
  "dashboard": {
    "id": null,
    "title": "Phantom ML Enterprise Overview",
    "tags": ["phantom-ml", "enterprise"],
    "timezone": "browser",
    "panels": [
      {
        "title": "API Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (service)",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))",
            "legendFormat": "Error Rate"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "10s"
  }
}
EOF

    success "Monitoring configuration created"
}

# Deploy the enterprise stack
deploy_enterprise_stack() {
    log "Deploying Phantom ML Enterprise stack..."
    
    if [[ "$DEPLOYMENT_TYPE" == "kubernetes" ]]; then
        # Kubernetes deployment
        if ! command -v kubectl &> /dev/null; then
            error "kubectl is required for Kubernetes deployment"
        fi
        
        kubectl apply -f deployment/kubernetes/enterprise-deployment.yaml
        
        # Wait for deployment to be ready
        kubectl wait --for=condition=available --timeout=300s deployment/phantom-ml-api -n phantom-ml-enterprise
        
        success "Kubernetes deployment completed"
    else
        # Docker Compose deployment
        source .env.enterprise
        docker-compose -f deployment/docker-compose.enterprise.yml up -d
        
        # Wait for services to be healthy
        local max_attempts=30
        local attempt=0
        
        while [[ $attempt -lt $max_attempts ]]; do
            if docker-compose -f deployment/docker-compose.enterprise.yml ps | grep -q "Up (healthy)"; then
                break
            fi
            
            sleep 10
            ((attempt++))
        done
        
        if [[ $attempt -eq $max_attempts ]]; then
            error "Services failed to start within expected time"
        fi
        
        success "Docker Compose deployment completed"
    fi
}

# Verify installation
verify_installation() {
    log "Verifying enterprise installation..."
    
    local api_url="https://localhost"
    local max_attempts=10
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        if curl -k -f "$api_url/health" &> /dev/null; then
            break
        fi
        
        sleep 5
        ((attempt++))
    done
    
    if [[ $attempt -eq $max_attempts ]]; then
        error "API health check failed"
    fi
    
    # Test enterprise endpoints
    local endpoints=("/health" "/metrics" "/enterprise/status" "/enterprise/compliance")
    
    for endpoint in "${endpoints[@]}"; do
        if curl -k -f "$api_url$endpoint" &> /dev/null; then
            success "Endpoint $endpoint is accessible"
        else
            warning "Endpoint $endpoint is not accessible"
        fi
    done
    
    success "Installation verification completed"
}

# Create backup scripts
create_backup_scripts() {
    log "Creating backup scripts..."
    
    mkdir -p scripts/backup
    
    cat > scripts/backup/backup-enterprise.sh << 'EOF'
#!/bin/bash

# Phantom ML Enterprise Backup Script

set -euo pipefail

BACKUP_DIR="/backups/phantom-ml/$(date +%Y-%m-%d_%H-%M-%S)"
mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL
docker exec postgres-primary pg_dumpall -U phantom | gzip > "$BACKUP_DIR/postgres-backup.sql.gz"

# Backup Redis
docker exec redis-master redis-cli --rdb /tmp/dump.rdb
docker cp redis-master:/tmp/dump.rdb "$BACKUP_DIR/redis-backup.rdb"

# Backup Elasticsearch
curl -X PUT "localhost:9200/_snapshot/backup_repo/$backup_name" -H 'Content-Type: application/json' -d'
{
  "indices": "*",
  "ignore_unavailable": true,
  "include_global_state": false
}'

# Backup models and configurations
docker exec phantom-ml-api-1 tar czf /tmp/models-backup.tar.gz /app/models
docker cp phantom-ml-api-1:/tmp/models-backup.tar.gz "$BACKUP_DIR/"

docker exec phantom-ml-api-1 tar czf /tmp/config-backup.tar.gz /app/config
docker cp phantom-ml-api-1:/tmp/config-backup.tar.gz "$BACKUP_DIR/"

# Create backup manifest
cat > "$BACKUP_DIR/manifest.json" << EOL
{
  "backup_date": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
  "version": "1.0.1",
  "components": [
    "postgresql",
    "redis", 
    "elasticsearch",
    "models",
    "configuration"
  ],
  "size_bytes": $(du -sb "$BACKUP_DIR" | cut -f1)
}
EOL

echo "Backup completed: $BACKUP_DIR"
EOF

    chmod +x scripts/backup/backup-enterprise.sh
    
    success "Backup scripts created"
}

# Display final information
display_final_info() {
    log "Installation completed successfully!"
    echo
    echo "========================================"
    echo "Phantom ML Enterprise Installation Complete"
    echo "========================================"
    echo
    echo "🚀 Services:"
    echo "  • API: https://localhost"
    echo "  • ML Studio: https://localhost:3000"
    echo "  • Grafana: http://localhost:3000"
    echo "  • Kibana: http://localhost:5601"
    echo "  • Prometheus: http://localhost:9090"
    echo
    echo "🔐 Enterprise Features Enabled:"
    echo "  • Multi-tenant isolation"
    echo "  • Comprehensive audit logging"
    echo "  • Role-based access control"
    echo "  • Data encryption at rest and in transit"
    echo "  • Compliance framework: $COMPLIANCE_FRAMEWORK"
    echo "  • High availability deployment"
    echo
    echo "📊 Monitoring:"
    echo "  • Prometheus metrics collection"
    echo "  • Grafana dashboards"
    echo "  • Elasticsearch log aggregation"
    echo "  • Jaeger distributed tracing"
    echo
    echo "🛡️ Security:"
    echo "  • SSL/TLS encryption enabled"
    echo "  • Secrets management with Vault"
    echo "  • Network policies configured"
    echo "  • Security headers enforced"
    echo
    echo "📄 Important Files:"
    echo "  • Environment: .env.enterprise"
    echo "  • SSL Certificates: ssl/"
    echo "  • Configuration: config/enterprise/"
    echo "  • Backup Scripts: scripts/backup/"
    echo
    echo "⚠️  Next Steps:"
    echo "  1. Review and customize enterprise configurations"
    echo "  2. Set up external authentication providers (LDAP/SAML)"
    echo "  3. Configure compliance-specific settings"
    echo "  4. Set up monitoring alerts and notifications"
    echo "  5. Schedule regular backups"
    echo "  6. Review security configurations"
    echo
    echo "📖 Documentation:"
    echo "  • Architecture: docs/ARCHITECTURE.md"
    echo "  • Security: SECURITY.md"
    echo "  • API Reference: docs/NAPI_API_REFERENCE.md"
    echo
    echo "For support, visit: https://github.com/harborgrid-justin/phantom-spire"
}

# Main installation flow
main() {
    log "Starting Phantom ML Enterprise installation..."
    
    check_prerequisites
    generate_secrets
    generate_ssl_certificates
    setup_enterprise_config
    install_phantom_ml
    setup_databases
    setup_monitoring
    create_backup_scripts
    deploy_enterprise_stack
    verify_installation
    display_final_info
}

# Run main function
main "$@"