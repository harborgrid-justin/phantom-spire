# Configuration Guide

**Complete environment setup and configuration options**

This guide covers all configuration aspects of Phantom ML Studio, from basic setup to advanced enterprise configurations for different deployment scenarios.

## 📋 Configuration Overview

Phantom ML Studio supports multiple configuration methods with a clear precedence order:

1. **Command Line Arguments** (highest precedence)
2. **Environment Variables**
3. **Configuration Files**
4. **Default Values** (lowest precedence)

## 🎯 Quick Configuration

### Basic Setup
```bash
# Initialize configuration with interactive wizard
phantom-ml-studio init

# Set organization details
phantom-ml-studio config set organization-id "acme-corp"
phantom-ml-studio config set organization-name "ACME Corporation"

# Configure environment
phantom-ml-studio config set environment "production"
phantom-ml-studio config set log-level "info"

# View current configuration
phantom-ml-studio config list
phantom-ml-studio config get organization-id
```

### Environment Variables
Create `.env` file in your project root:
```env
# ==================== CORE PLATFORM ====================
NODE_ENV=production
PHANTOM_ML_ENVIRONMENT=production
PHANTOM_ML_LOG_LEVEL=info
PHANTOM_ML_DEBUG_MODE=false

# ==================== SERVER CONFIGURATION ====================
API_PORT=8080
WEB_PORT=3000
HOST=localhost
HTTPS_ENABLED=false
HTTPS_PORT=443

# ==================== DATABASE CONFIGURATION ====================
DATABASE_URL=postgresql://username:password@localhost:5432/phantom_ml
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20
DATABASE_TIMEOUT=30000

# ==================== REDIS CONFIGURATION ====================
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_MAX_CONNECTIONS=10

# ==================== SECURITY ====================
JWT_SECRET=your-secure-jwt-secret-key-here
JWT_EXPIRATION=24h
ENCRYPTION_KEY=your-32-character-encryption-key
CORS_ORIGIN=*
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=900000

# ==================== ML CORE INTEGRATION ====================
PHANTOM_ML_CORE_ENABLED=true
PHANTOM_ML_CORE_PATH=/opt/phantom-ml-core
PHANTOM_ML_NATIVE_OPTIMIZATIONS=true
PHANTOM_ML_GPU_SUPPORT=false
PHANTOM_ML_CUDA_VERSION=11.8

# ==================== PERFORMANCE ====================
PHANTOM_ML_CLUSTERING=true
PHANTOM_ML_CLUSTER_WORKERS=auto
NODE_OPTIONS=--max-old-space-size=8192
PHANTOM_ML_CACHE_ENABLED=true
PHANTOM_ML_CACHE_TTL=3600

# ==================== MONITORING ====================
PHANTOM_ML_MONITORING=true
PHANTOM_ML_METRICS_ENABLED=true
PHANTOM_ML_HEALTH_CHECK_INTERVAL=30000
PHANTOM_ML_PERFORMANCE_PROFILING=false

# ==================== FILE STORAGE ====================
STORAGE_TYPE=local
STORAGE_PATH=./data
FILE_UPLOAD_MAX_SIZE=100mb
TEMP_DIR=/tmp/phantom-ml

# ==================== BUSINESS INTELLIGENCE ====================
PHANTOM_ML_ANALYTICS=true
PHANTOM_ML_REPORTING=true
PHANTOM_ML_DASHBOARD_REFRESH=30000
```

## 🗂️ Configuration Files

### Main Configuration (`config/default.json`)
```json
{
  "platform": {
    "name": "Phantom ML Studio",
    "version": "1.0.0",
    "environment": "development",
    "organizationId": null,
    "organizationName": null
  },
  "server": {
    "api": {
      "port": 8080,
      "host": "localhost",
      "prefix": "/api/v1",
      "cors": {
        "enabled": true,
        "origin": "*",
        "credentials": true
      }
    },
    "web": {
      "port": 3000,
      "host": "localhost",
      "staticFiles": "./dist/web"
    },
    "https": {
      "enabled": false,
      "port": 443,
      "cert": null,
      "key": null,
      "force": false
    }
  },
  "database": {
    "type": "postgresql",
    "url": null,
    "host": "localhost",
    "port": 5432,
    "database": "phantom_ml",
    "username": "phantom_user",
    "password": null,
    "ssl": false,
    "pool": {
      "min": 2,
      "max": 20,
      "acquire": 30000,
      "idle": 10000,
      "evict": 300000
    },
    "logging": false,
    "migrations": {
      "run": true,
      "path": "./migrations"
    }
  },
  "redis": {
    "url": null,
    "host": "localhost",
    "port": 6379,
    "password": null,
    "db": 0,
    "family": 4,
    "maxConnections": 10,
    "retryDelayOnFailover": 100
  },
  "security": {
    "jwt": {
      "secret": null,
      "algorithm": "HS256",
      "expiresIn": "24h",
      "issuer": "phantom-ml-studio",
      "audience": "phantom-ml-users"
    },
    "encryption": {
      "algorithm": "aes-256-gcm",
      "key": null,
      "keyDerivation": "pbkdf2"
    },
    "rateLimit": {
      "enabled": true,
      "windowMs": 900000,
      "max": 1000,
      "skipSuccessfulRequests": false,
      "skipFailedRequests": false
    },
    "helmet": {
      "enabled": true,
      "contentSecurityPolicy": {
        "enabled": true,
        "directives": {
          "defaultSrc": ["'self'"],
          "styleSrc": ["'self'", "'unsafe-inline'"],
          "scriptSrc": ["'self'"],
          "imgSrc": ["'self'", "data:", "https:"]
        }
      }
    }
  },
  "mlCore": {
    "enabled": true,
    "path": "/opt/phantom-ml-core",
    "bindings": {
      "validateModel": true,
      "exportModel": true,
      "importModel": true,
      "cloneModel": true,
      "optimizeModel": true,
      "runInference": true,
      "batchProcess": true
    },
    "nativeOptimizations": true,
    "gpu": {
      "enabled": false,
      "cudaVersion": "11.8",
      "devices": "auto"
    },
    "memory": {
      "heapSize": "4gb",
      "bufferSize": "1gb",
      "cacheSize": "2gb"
    }
  },
  "performance": {
    "clustering": {
      "enabled": false,
      "workers": "auto",
      "strategy": "round-robin"
    },
    "caching": {
      "enabled": true,
      "ttl": 3600,
      "maxKeys": 10000,
      "provider": "redis"
    },
    "compression": {
      "enabled": true,
      "algorithm": "gzip",
      "level": 6
    },
    "optimization": {
      "bundleAnalysis": false,
      "treeshaking": true,
      "minification": true
    }
  },
  "monitoring": {
    "enabled": true,
    "healthCheck": {
      "enabled": true,
      "interval": 30000,
      "timeout": 5000,
      "retries": 3
    },
    "metrics": {
      "enabled": true,
      "provider": "prometheus",
      "endpoint": "/metrics",
      "interval": 15000
    },
    "logging": {
      "level": "info",
      "format": "json",
      "console": true,
      "file": {
        "enabled": false,
        "path": "./logs",
        "maxSize": "100mb",
        "maxFiles": 10
      }
    },
    "profiling": {
      "enabled": false,
      "cpu": false,
      "memory": false,
      "interval": 60000
    }
  },
  "storage": {
    "type": "local",
    "path": "./data",
    "maxFileSize": "100mb",
    "allowedTypes": [
      "csv", "json", "parquet", "xlsx",
      "pkl", "joblib", "h5", "pb",
      "onnx", "pt", "pth"
    ],
    "compression": true,
    "encryption": false
  },
  "businessIntelligence": {
    "enabled": true,
    "dashboard": {
      "refreshInterval": 30000,
      "cacheTimeout": 300000,
      "realTimeUpdates": true
    },
    "analytics": {
      "enabled": true,
      "dataRetention": "90d",
      "aggregationInterval": "1h"
    },
    "reporting": {
      "enabled": true,
      "schedules": {
        "daily": "0 8 * * *",
        "weekly": "0 8 * * 1",
        "monthly": "0 8 1 * *"
      },
      "formats": ["pdf", "excel", "csv"]
    }
  },
  "compliance": {
    "frameworks": ["gdpr", "hipaa", "soc2"],
    "auditTrail": {
      "enabled": true,
      "retention": "7y",
      "encryption": true
    },
    "dataProtection": {
      "anonymization": true,
      "encryption": true,
      "rightToBeForgotten": true
    },
    "access": {
      "rbac": true,
      "mfa": false,
      "sessionTimeout": "8h"
    }
  }
}
```

### Environment-Specific Configurations

#### Development (`config/development.json`)
```json
{
  "platform": {
    "environment": "development"
  },
  "server": {
    "api": {
      "cors": {
        "origin": ["http://localhost:3000", "http://localhost:3001"]
      }
    }
  },
  "database": {
    "logging": true,
    "type": "sqlite",
    "database": "./dev.db"
  },
  "security": {
    "rateLimit": {
      "enabled": false
    },
    "helmet": {
      "contentSecurityPolicy": {
        "enabled": false
      }
    }
  },
  "mlCore": {
    "nativeOptimizations": false
  },
  "monitoring": {
    "logging": {
      "level": "debug",
      "console": true
    },
    "profiling": {
      "enabled": true,
      "cpu": true,
      "memory": true
    }
  },
  "businessIntelligence": {
    "dashboard": {
      "refreshInterval": 5000
    }
  }
}
```

#### Production (`config/production.json`)
```json
{
  "platform": {
    "environment": "production"
  },
  "server": {
    "https": {
      "enabled": true,
      "force": true
    }
  },
  "security": {
    "helmet": {
      "enabled": true,
      "contentSecurityPolicy": {
        "enabled": true
      }
    },
    "rateLimit": {
      "enabled": true,
      "max": 100
    }
  },
  "mlCore": {
    "nativeOptimizations": true,
    "gpu": {
      "enabled": true
    }
  },
  "performance": {
    "clustering": {
      "enabled": true,
      "workers": 4
    },
    "caching": {
      "enabled": true,
      "ttl": 7200
    },
    "compression": {
      "enabled": true,
      "level": 9
    }
  },
  "monitoring": {
    "logging": {
      "level": "warn",
      "console": false,
      "file": {
        "enabled": true,
        "path": "./logs/production"
      }
    },
    "metrics": {
      "enabled": true
    }
  },
  "compliance": {
    "auditTrail": {
      "enabled": true
    },
    "dataProtection": {
      "encryption": true
    }
  }
}
```

## 🔐 Security Configuration

### SSL/TLS Configuration
```json
{
  "server": {
    "https": {
      "enabled": true,
      "port": 443,
      "cert": "/path/to/certificate.pem",
      "key": "/path/to/private-key.pem",
      "force": true,
      "secureProtocol": "TLSv1_2_method",
      "ciphers": [
        "ECDHE-RSA-AES128-GCM-SHA256",
        "ECDHE-RSA-AES256-GCM-SHA384",
        "ECDHE-RSA-AES128-SHA256",
        "ECDHE-RSA-AES256-SHA384"
      ]
    }
  }
}
```

### Authentication Configuration
```json
{
  "security": {
    "authentication": {
      "providers": [
        {
          "name": "local",
          "type": "username-password",
          "enabled": true,
          "config": {
            "bcryptRounds": 12,
            "passwordPolicy": {
              "minLength": 8,
              "requireUppercase": true,
              "requireLowercase": true,
              "requireNumbers": true,
              "requireSpecialChars": true
            }
          }
        },
        {
          "name": "oauth2",
          "type": "oauth2",
          "enabled": true,
          "config": {
            "clientId": "your-oauth-client-id",
            "clientSecret": "your-oauth-client-secret",
            "authorizationURL": "https://provider.com/oauth/authorize",
            "tokenURL": "https://provider.com/oauth/token",
            "userInfoURL": "https://provider.com/oauth/userinfo",
            "scope": ["profile", "email"]
          }
        },
        {
          "name": "saml",
          "type": "saml",
          "enabled": false,
          "config": {
            "entryPoint": "https://idp.company.com/sso",
            "issuer": "phantom-ml-studio",
            "cert": "/path/to/idp-cert.pem"
          }
        }
      ],
      "session": {
        "secret": "your-session-secret",
        "maxAge": 28800000,
        "secure": true,
        "httpOnly": true,
        "sameSite": "strict"
      }
    },
    "authorization": {
      "rbac": {
        "enabled": true,
        "roles": [
          {
            "name": "admin",
            "permissions": ["*"]
          },
          {
            "name": "data_scientist",
            "permissions": [
              "models:read",
              "models:write",
              "data:read",
              "data:write",
              "analytics:read"
            ]
          },
          {
            "name": "ml_engineer",
            "permissions": [
              "models:read",
              "models:deploy",
              "monitoring:read",
              "infrastructure:read"
            ]
          },
          {
            "name": "business_analyst",
            "permissions": [
              "analytics:read",
              "reports:read",
              "dashboards:read"
            ]
          },
          {
            "name": "viewer",
            "permissions": [
              "models:read",
              "analytics:read",
              "reports:read"
            ]
          }
        ]
      }
    }
  }
}
```

## 🎯 ML Core Configuration

### Native Module Configuration
```json
{
  "mlCore": {
    "enabled": true,
    "path": "/opt/phantom-ml-core",
    "initTimeout": 30000,
    "bindings": {
      "validateModel": {
        "enabled": true,
        "timeout": 60000,
        "retries": 3
      },
      "exportModel": {
        "enabled": true,
        "timeout": 120000,
        "formats": ["onnx", "tensorflow", "pytorch"]
      },
      "importModel": {
        "enabled": true,
        "timeout": 300000,
        "maxSize": "1gb"
      },
      "cloneModel": {
        "enabled": true,
        "timeout": 180000
      },
      "optimizeModel": {
        "enabled": true,
        "timeout": 600000,
        "strategies": ["quantization", "pruning", "distillation"]
      },
      "runInference": {
        "enabled": true,
        "timeout": 30000,
        "batchSize": 1000,
        "parallelism": 4
      },
      "batchProcess": {
        "enabled": true,
        "timeout": 3600000,
        "chunkSize": 10000,
        "parallelism": 8
      }
    },
    "fallback": {
      "enabled": true,
      "strategy": "intelligent",
      "cacheResults": true
    },
    "nativeOptimizations": {
      "enabled": true,
      "simd": true,
      "vectorization": true,
      "parallelization": true
    },
    "gpu": {
      "enabled": false,
      "provider": "cuda",
      "cudaVersion": "11.8",
      "devices": ["0"],
      "memoryFraction": 0.8,
      "allowGrowth": true
    },
    "memory": {
      "heapSize": "4gb",
      "stackSize": "8mb",
      "bufferSize": "1gb",
      "cacheSize": "2gb",
      "gc": {
        "strategy": "generational",
        "youngGenSize": "512mb",
        "oldGenThreshold": 0.8
      }
    }
  }
}
```

### Model Configuration
```json
{
  "models": {
    "repository": {
      "type": "filesystem",
      "path": "./models",
      "versioning": true,
      "compression": true,
      "encryption": false
    },
    "deployment": {
      "defaultStrategy": "rolling",
      "healthCheck": {
        "enabled": true,
        "path": "/health",
        "interval": 30000,
        "timeout": 5000,
        "retries": 3
      },
      "scaling": {
        "enabled": true,
        "minInstances": 1,
        "maxInstances": 10,
        "targetCPU": 70,
        "targetMemory": 80,
        "scaleUpCooldown": 300000,
        "scaleDownCooldown": 600000
      },
      "monitoring": {
        "enabled": true,
        "metrics": ["latency", "throughput", "accuracy", "drift"],
        "alerting": {
          "enabled": true,
          "latencyThreshold": 1000,
          "accuracyThreshold": 0.8,
          "driftThreshold": 0.1
        }
      }
    },
    "inference": {
      "timeout": 30000,
      "retries": 3,
      "batchingEnabled": true,
      "batchSize": 100,
      "batchTimeout": 1000,
      "caching": {
        "enabled": true,
        "ttl": 3600,
        "keyStrategy": "hash"
      }
    }
  }
}
```

## 📊 Performance Configuration

### Clustering Configuration
```json
{
  "performance": {
    "clustering": {
      "enabled": true,
      "workers": "auto",
      "strategy": "round-robin",
      "respawn": true,
      "respawnLimit": 5,
      "killTimeout": 30000,
      "ipc": {
        "enabled": true,
        "channel": "cluster"
      },
      "gracefulShutdown": {
        "enabled": true,
        "timeout": 30000
      }
    },
    "loadBalancing": {
      "algorithm": "round-robin",
      "healthCheck": true,
      "stickySession": false,
      "weights": {}
    }
  }
}
```

### Caching Configuration
```json
{
  "performance": {
    "caching": {
      "enabled": true,
      "provider": "redis",
      "ttl": 3600,
      "maxKeys": 10000,
      "keyPrefix": "phantom-ml:",
      "compression": true,
      "serialization": "json",
      "strategies": {
        "models": {
          "ttl": 86400,
          "pattern": "models:*"
        },
        "predictions": {
          "ttl": 3600,
          "pattern": "predictions:*"
        },
        "analytics": {
          "ttl": 1800,
          "pattern": "analytics:*"
        }
      }
    }
  }
}
```

## 📈 Monitoring Configuration

### Metrics and Observability
```json
{
  "monitoring": {
    "metrics": {
      "enabled": true,
      "provider": "prometheus",
      "endpoint": "/metrics",
      "interval": 15000,
      "prefix": "phantom_ml_",
      "labels": {
        "service": "phantom-ml-studio",
        "version": "1.0.0",
        "environment": "production"
      },
      "collectors": [
        "system",
        "nodejs",
        "http",
        "database",
        "ml_models",
        "business"
      ]
    },
    "tracing": {
      "enabled": true,
      "provider": "jaeger",
      "endpoint": "http://jaeger:14268/api/traces",
      "samplingRate": 0.1,
      "serviceName": "phantom-ml-studio",
      "tags": {
        "version": "1.0.0",
        "environment": "production"
      }
    },
    "logging": {
      "level": "info",
      "format": "json",
      "timestamp": true,
      "console": {
        "enabled": true,
        "colors": true
      },
      "file": {
        "enabled": true,
        "path": "./logs",
        "filename": "phantom-ml-%DATE%.log",
        "datePattern": "YYYY-MM-DD",
        "maxSize": "100mb",
        "maxFiles": "30d",
        "compress": true
      },
      "elasticsearch": {
        "enabled": false,
        "host": "elasticsearch:9200",
        "index": "phantom-ml-logs"
      }
    },
    "alerting": {
      "enabled": true,
      "providers": [
        {
          "name": "email",
          "type": "smtp",
          "config": {
            "host": "smtp.company.com",
            "port": 587,
            "secure": true,
            "auth": {
              "user": "alerts@company.com",
              "pass": "smtp-password"
            }
          }
        },
        {
          "name": "slack",
          "type": "webhook",
          "config": {
            "url": "https://hooks.slack.com/services/...",
            "channel": "#ml-alerts"
          }
        }
      ],
      "rules": [
        {
          "name": "high_error_rate",
          "condition": "error_rate > 0.05",
          "severity": "critical",
          "providers": ["email", "slack"]
        },
        {
          "name": "model_accuracy_drop",
          "condition": "model_accuracy < 0.8",
          "severity": "warning",
          "providers": ["slack"]
        }
      ]
    }
  }
}
```

## 🗃️ Data Configuration

### Database Configuration
```json
{
  "database": {
    "type": "postgresql",
    "connection": {
      "host": "localhost",
      "port": 5432,
      "database": "phantom_ml",
      "username": "phantom_user",
      "password": "secure_password",
      "ssl": {
        "enabled": false,
        "ca": "/path/to/ca.pem",
        "cert": "/path/to/client-cert.pem",
        "key": "/path/to/client-key.pem"
      }
    },
    "pool": {
      "min": 2,
      "max": 20,
      "acquire": 30000,
      "idle": 10000,
      "evict": 300000,
      "validate": true
    },
    "options": {
      "timezone": "UTC",
      "charset": "utf8mb4",
      "collate": "utf8mb4_unicode_ci",
      "logging": false,
      "benchmark": false,
      "paranoid": false,
      "timestamps": true
    },
    "migrations": {
      "run": true,
      "path": "./migrations",
      "pattern": "*.js",
      "tableName": "migrations"
    },
    "backup": {
      "enabled": true,
      "schedule": "0 2 * * *",
      "retention": "30d",
      "compression": true,
      "encryption": true,
      "path": "./backups/database"
    }
  }
}
```

### Storage Configuration
```json
{
  "storage": {
    "providers": [
      {
        "name": "local",
        "type": "filesystem",
        "config": {
          "path": "./data",
          "permissions": "0755"
        }
      },
      {
        "name": "s3",
        "type": "aws-s3",
        "config": {
          "bucket": "phantom-ml-data",
          "region": "us-east-1",
          "accessKeyId": "AWS_ACCESS_KEY",
          "secretAccessKey": "AWS_SECRET_KEY",
          "prefix": "studio-data/"
        }
      },
      {
        "name": "azure",
        "type": "azure-blob",
        "config": {
          "accountName": "phantommlstorage",
          "accountKey": "AZURE_STORAGE_KEY",
          "containerName": "ml-data"
        }
      }
    ],
    "default": "local",
    "upload": {
      "maxFileSize": "100mb",
      "allowedTypes": [
        "csv", "json", "parquet", "xlsx", "xls",
        "pkl", "joblib", "h5", "hdf5",
        "pb", "pbtxt", "onnx",
        "pt", "pth", "safetensors"
      ],
      "quarantine": {
        "enabled": true,
        "scanTimeout": 30000,
        "virusScanning": false
      }
    },
    "processing": {
      "compression": {
        "enabled": true,
        "algorithm": "gzip",
        "level": 6
      },
      "encryption": {
        "enabled": false,
        "algorithm": "aes-256-gcm",
        "keyRotation": "30d"
      },
      "cleanup": {
        "enabled": true,
        "tempFileExpiry": "24h",
        "schedule": "0 1 * * *"
      }
    }
  }
}
```

## 🔧 Advanced Configuration

### Custom Enterprise Configuration
```json
{
  "enterprise": {
    "organizationId": "acme-corp-001",
    "organizationName": "ACME Corporation",
    "tier": "enterprise",
    "features": {
      "advancedAnalytics": true,
      "complianceReporting": true,
      "customBranding": true,
      "apiRateLimitBypass": true,
      "prioritySupport": true,
      "dedicatedInfrastructure": true
    },
    "limits": {
      "maxModels": 1000,
      "maxUsers": 500,
      "maxApiCalls": 1000000,
      "maxStorageGB": 10000,
      "maxComputeHours": 100000
    },
    "branding": {
      "logoUrl": "/assets/custom/logo.png",
      "primaryColor": "#1f2937",
      "secondaryColor": "#3b82f6",
      "customCss": "/assets/custom/styles.css"
    },
    "integrations": {
      "sso": {
        "enabled": true,
        "provider": "okta",
        "domain": "acme.okta.com"
      },
      "audit": {
        "enabled": true,
        "provider": "splunk",
        "endpoint": "https://splunk.acme.com:8088"
      },
      "messaging": {
        "enabled": true,
        "provider": "teams",
        "webhook": "https://outlook.office.com/webhook/..."
      }
    }
  }
}
```

### Multi-Tenant Configuration
```json
{
  "multiTenant": {
    "enabled": true,
    "strategy": "database-per-tenant",
    "isolation": "strict",
    "provisioning": {
      "automatic": true,
      "approvalRequired": false,
      "templates": [
        {
          "name": "starter",
          "limits": {
            "maxModels": 10,
            "maxUsers": 5,
            "storageGB": 100
          }
        },
        {
          "name": "professional",
          "limits": {
            "maxModels": 100,
            "maxUsers": 50,
            "storageGB": 1000
          }
        },
        {
          "name": "enterprise",
          "limits": {
            "maxModels": 1000,
            "maxUsers": 500,
            "storageGB": 10000
          }
        }
      ]
    },
    "billing": {
      "enabled": true,
      "provider": "stripe",
      "currency": "USD",
      "metering": {
        "models": 5.0,
        "users": 10.0,
        "storageGB": 0.1,
        "apiCalls": 0.001
      }
    }
  }
}
```

## ✅ Configuration Validation

### Validation Scripts
```bash
# Validate complete configuration
phantom-ml-studio config validate

# Validate specific sections
phantom-ml-studio config validate --section database
phantom-ml-studio config validate --section security
phantom-ml-studio config validate --section mlCore

# Check configuration syntax
phantom-ml-studio config check --file config/production.json

# Test database connection
phantom-ml-studio config test-db

# Test Redis connection
phantom-ml-studio config test-redis

# Validate SSL certificates
phantom-ml-studio config test-ssl
```

### Configuration Health Check
```bash
# Comprehensive health check
phantom-ml-studio doctor

# Expected output:
✅ Node.js version: 18.17.0 (✓ supported)
✅ Memory: 16GB (✓ sufficient)
✅ Disk space: 250GB available (✓ sufficient)
✅ Database connection: PostgreSQL (✓ connected)
✅ Redis connection: (✓ connected)
✅ ML Core: Native module loaded (✓ functional)
✅ SSL certificates: Valid until 2025-01-01 (✓ valid)
✅ Permissions: File system (✓ readable/writable)
✅ Network: Ports 3000, 8080 (✓ available)

🎉 All checks passed! System ready for production.
```

## 📋 Configuration Checklist

### Development Environment
- [ ] ✅ **Basic Config**: Platform initialized with development settings
- [ ] ✅ **Database**: SQLite configured for local development
- [ ] ✅ **Redis**: Local Redis instance connected
- [ ] ✅ **Security**: Relaxed security for development convenience
- [ ] ✅ **Logging**: Debug level logging enabled
- [ ] ✅ **Hot Reload**: Development mode with file watching
- [ ] ✅ **CORS**: Permissive CORS for local testing

### Production Environment
- [ ] ✅ **Security**: SSL/TLS certificates installed and configured
- [ ] ✅ **Database**: Production PostgreSQL with connection pooling
- [ ] ✅ **Redis**: Production Redis with clustering/replication
- [ ] ✅ **Authentication**: Secure JWT configuration
- [ ] ✅ **Rate Limiting**: API rate limiting enabled
- [ ] ✅ **Monitoring**: Comprehensive monitoring and alerting
- [ ] ✅ **Clustering**: Multi-worker clustering enabled
- [ ] ✅ **Caching**: Redis caching for performance
- [ ] ✅ **Backup**: Automated backup strategy configured
- [ ] ✅ **Compliance**: Required compliance frameworks enabled
- [ ] ✅ **Performance**: Production optimizations applied

---

**Next Steps**: Continue with the [Data Scientists Guide](../user-guides/data-scientists.md) to learn how to use the platform for ML development workflows.