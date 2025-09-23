# Phantom ML Core - Distributed Data Architecture for Microservices

## Service Decomposition and Database Assignment

### 1. **ML Model Service** - PostgreSQL + MinIO
**Primary Database**: PostgreSQL (OLTP)
**Secondary Storage**: MinIO (Model Artifacts)
**Data Types**:
- Model metadata and configurations
- Model versioning and lineage
- Training parameters and hyperparameters
- Model performance metrics

**Schema Design**:
```sql
-- Tenant-partitioned model storage
CREATE TABLE models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    model_type VARCHAR(100) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    artifact_uri TEXT NOT NULL, -- MinIO object path
    accuracy DECIMAL(5,4),
    precision_score DECIMAL(5,4),
    recall_score DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    training_samples BIGINT,
    feature_count INTEGER,
    status model_status_enum NOT NULL DEFAULT 'created',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    tags JSONB,
    metadata JSONB,
    performance_metrics JSONB
) PARTITION BY HASH (tenant_id);

-- Create tenant-specific partitions
CREATE TABLE models_tenant_001 PARTITION OF models
FOR VALUES WITH (MODULUS 64, REMAINDER 0);

-- Model versions for MLOps versioning
CREATE TABLE model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models(id),
    version VARCHAR(50) NOT NULL,
    parent_version VARCHAR(50),
    artifact_uri TEXT NOT NULL,
    changelog TEXT,
    performance_delta JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    UNIQUE(model_id, version)
);

-- Model lineage tracking
CREATE TABLE model_lineage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models(id),
    parent_model_id UUID REFERENCES models(id),
    lineage_type lineage_type_enum NOT NULL, -- 'derived', 'retrained', 'ensemble'
    transformation_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2. **Training Service** - PostgreSQL + ClickHouse
**Primary Database**: PostgreSQL (Training Jobs)
**Analytics Database**: ClickHouse (Training Metrics Time-Series)
**Data Types**:
- Training job configurations and state
- Training progress tracking
- Hyperparameter optimization results
- Training metrics time-series data

**PostgreSQL Schema**:
```sql
CREATE TABLE training_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    model_id UUID NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    status training_status_enum NOT NULL DEFAULT 'pending',
    config JSONB NOT NULL,
    dataset_uri TEXT NOT NULL,
    hyperparameters JSONB,
    resource_requirements JSONB,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    metrics_summary JSONB,
    created_by VARCHAR(255) NOT NULL,
    priority INTEGER DEFAULT 0
) PARTITION BY HASH (tenant_id);

CREATE TABLE training_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_job_id UUID NOT NULL REFERENCES training_jobs(id),
    experiment_name VARCHAR(255) NOT NULL,
    parameters JSONB NOT NULL,
    metrics JSONB,
    artifacts JSONB,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status experiment_status_enum NOT NULL
);
```

**ClickHouse Schema** (Training Metrics):
```sql
CREATE TABLE training_metrics (
    timestamp DateTime64(3),
    tenant_id String,
    training_job_id String,
    epoch UInt32,
    batch UInt32,
    metric_name String,
    metric_value Float64,
    metadata Map(String, String)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (tenant_id, training_job_id, timestamp)
TTL timestamp + INTERVAL 2 YEAR;

-- Materialized view for real-time aggregations
CREATE MATERIALIZED VIEW training_metrics_hourly
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (tenant_id, training_job_id, toStartOfHour(timestamp), metric_name)
AS SELECT
    tenant_id,
    training_job_id,
    toStartOfHour(timestamp) as timestamp,
    metric_name,
    avg(metric_value) as avg_value,
    min(metric_value) as min_value,
    max(metric_value) as max_value,
    count() as sample_count
FROM training_metrics
GROUP BY tenant_id, training_job_id, timestamp, metric_name;
```

### 3. **Inference Service** - PostgreSQL + Redis + ClickHouse
**Primary Database**: PostgreSQL (Inference Jobs)
**Cache Layer**: Redis (Real-time Inference)
**Analytics Database**: ClickHouse (Inference Metrics)

**PostgreSQL Schema**:
```sql
CREATE TABLE inference_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    model_id UUID NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    input_data JSONB NOT NULL,
    prediction JSONB,
    confidence_score DECIMAL(5,4),
    feature_importance JSONB,
    inference_time_ms INTEGER,
    status inference_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_by VARCHAR(255),
    batch_id UUID, -- For batch inference
    metadata JSONB
) PARTITION BY RANGE (created_at);

-- Monthly partitions for inference data
CREATE TABLE inference_jobs_y2024m01 PARTITION OF inference_jobs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

**ClickHouse Schema** (Inference Analytics):
```sql
CREATE TABLE inference_metrics (
    timestamp DateTime64(3),
    tenant_id String,
    model_id String,
    model_version String,
    inference_time_ms UInt32,
    confidence_score Float32,
    input_features_count UInt16,
    prediction_type String,
    user_id String,
    session_id String,
    metadata Map(String, String)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (tenant_id, model_id, timestamp)
TTL timestamp + INTERVAL 1 YEAR;
```

### 4. **Agent Orchestration Service** - PostgreSQL + MongoDB
**Primary Database**: PostgreSQL (Agent Configuration & State)
**Document Store**: MongoDB (Agent Execution Logs & Complex Configs)

**PostgreSQL Schema**:
```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    agent_type VARCHAR(100) NOT NULL,
    description TEXT,
    config JSONB NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    timeout_ms INTEGER DEFAULT 30000,
    max_retries INTEGER DEFAULT 3,
    resource_requirements JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    UNIQUE(tenant_id, name, version)
) PARTITION BY HASH (tenant_id);

CREATE TABLE agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    agent_id UUID NOT NULL REFERENCES agents(id),
    context JSONB NOT NULL,
    status execution_status_enum NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    execution_time_ms INTEGER,
    result_summary JSONB,
    error_details JSONB,
    created_by VARCHAR(255)
) PARTITION BY RANGE (started_at);
```

**MongoDB Collections**:
```javascript
// Agent execution detailed logs
db.agent_execution_logs.createIndex({
    "tenant_id": 1,
    "agent_execution_id": 1,
    "timestamp": 1
})

// Agent configuration templates
db.agent_templates.createIndex({
    "agent_type": 1,
    "version": 1
})

// Complex agent workflows
db.agent_workflows.createIndex({
    "tenant_id": 1,
    "workflow_name": 1,
    "created_at": -1
})
```

### 5. **Audit & Compliance Service** - PostgreSQL + Elasticsearch
**Primary Database**: PostgreSQL (Structured Audit Data)
**Search Engine**: Elasticsearch (Full-text Audit Search)

**PostgreSQL Schema**:
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    event_id VARCHAR(255) NOT NULL UNIQUE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255),
    event_type audit_event_type_enum NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    result audit_result_enum NOT NULL,
    ip_address INET,
    user_agent TEXT,
    risk_score DECIMAL(3,2),
    details JSONB,
    compliance_tags TEXT[],
    retention_until TIMESTAMPTZ
) PARTITION BY RANGE (timestamp);

-- Daily partitions for audit logs
CREATE TABLE audit_logs_y2024m01d01 PARTITION OF audit_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-01-02');

-- Data governance tracking
CREATE TABLE data_lineage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    parent_resource_id VARCHAR(255),
    transformation_type VARCHAR(100),
    transformation_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

CREATE TABLE compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    framework VARCHAR(100) NOT NULL, -- GDPR, HIPAA, SOC2, etc.
    report_type VARCHAR(100) NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'generated',
    findings JSONB,
    remediation_actions JSONB,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by VARCHAR(255) NOT NULL
);
```

### 6. **Performance Analytics Service** - ClickHouse + Redis
**Primary Database**: ClickHouse (Time-series Performance Data)
**Real-time Cache**: Redis (Current Metrics)

**ClickHouse Schema**:
```sql
CREATE TABLE performance_metrics (
    timestamp DateTime64(3),
    tenant_id String,
    service_name String,
    metric_name String,
    metric_value Float64,
    dimensions Map(String, String),
    labels Map(String, String)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (tenant_id, service_name, metric_name, timestamp)
TTL timestamp + INTERVAL 6 MONTH;

-- Resource utilization metrics
CREATE TABLE resource_metrics (
    timestamp DateTime64(3),
    tenant_id String,
    resource_type String,
    resource_id String,
    cpu_percent Float32,
    memory_mb UInt32,
    disk_io_mb Float32,
    network_io_mb Float32,
    gpu_utilization Float32,
    metadata Map(String, String)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (tenant_id, resource_type, resource_id, timestamp)
TTL timestamp + INTERVAL 3 MONTH;
```

### 7. **User & Tenant Management Service** - PostgreSQL
**Primary Database**: PostgreSQL (User/Tenant Data with Strong Consistency)

**Schema Design**:
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_key VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    status tenant_status_enum NOT NULL DEFAULT 'active',
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'basic',
    isolation_level isolation_level_enum NOT NULL DEFAULT 'row_level',
    resource_quotas JSONB NOT NULL,
    compliance_frameworks TEXT[],
    data_residency VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    roles TEXT[] NOT NULL,
    permissions JSONB,
    status user_status_enum NOT NULL DEFAULT 'active',
    last_login_at TIMESTAMPTZ,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

CREATE TABLE tenant_resource_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    resource_type VARCHAR(100) NOT NULL,
    usage_count BIGINT NOT NULL DEFAULT 0,
    usage_amount BIGINT NOT NULL DEFAULT 0, -- in bytes, requests, etc.
    quota_limit BIGINT NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Multi-Tenant Data Isolation Strategy

### Row-Level Security (RLS) Implementation
```sql
-- Enable RLS on all tenant-partitioned tables
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policy
CREATE POLICY tenant_isolation ON models
    FOR ALL
    TO application_role
    USING (tenant_id = current_setting('app.current_tenant_id')::varchar);

-- Tenant context setting function
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id VARCHAR)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', tenant_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Database-per-Tenant for High Isolation
```yaml
# Tenant database provisioning template
tenant_database_template:
  high_security_tenants:
    - dedicated_postgres_instance
    - separate_encryption_keys
    - isolated_backup_schedule
    - dedicated_monitoring

  standard_tenants:
    - schema_per_tenant
    - shared_postgres_instance
    - tenant_specific_rls_policies
    - shared_backup_with_tenant_tags
```

## Data Partitioning Strategy

### Horizontal Partitioning by Tenant + Time
```sql
-- Models partitioned by tenant hash
CREATE TABLE models_tenant_hash_000 PARTITION OF models
FOR VALUES WITH (MODULUS 64, REMAINDER 0);

-- Inference jobs partitioned by time (monthly)
CREATE TABLE inference_jobs_y2024m01 PARTITION OF inference_jobs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Audit logs partitioned by time (daily) for compliance
CREATE TABLE audit_logs_y2024m01d15 PARTITION OF audit_logs
FOR VALUES FROM ('2024-01-15') TO ('2024-01-16');
```

### Vertical Partitioning for Large Objects
```sql
-- Separate large model artifacts metadata
CREATE TABLE model_artifacts (
    model_id UUID PRIMARY KEY REFERENCES models(id),
    artifact_size_bytes BIGINT,
    artifact_checksum VARCHAR(64),
    storage_provider VARCHAR(50),
    storage_path TEXT,
    compression_type VARCHAR(20),
    encryption_key_id VARCHAR(255)
);
```

## Data Consistency Models

### Strong Consistency Requirements
- **Tenant Management**: ACID transactions for user/role changes
- **Model Versioning**: Serializable isolation for version updates
- **Audit Logs**: Write-ahead logging with immediate consistency
- **Billing/Usage**: Strong consistency for quota enforcement

### Eventual Consistency Acceptable
- **Performance Metrics**: Time-series data can tolerate some delay
- **Analytics Aggregations**: Batch processing acceptable
- **Search Indices**: Elasticsearch eventual consistency is acceptable
- **Cache Invalidation**: Redis TTL-based eventual consistency

### Implementation Patterns
```rust
// Strong consistency with distributed locks
pub struct StrongConsistencyManager {
    connection_pool: Arc<PgPool>,
    distributed_lock: Arc<RedisLock>,
}

impl StrongConsistencyManager {
    async fn update_model_with_lock(&self, model_id: &str, update: ModelUpdate) -> Result<()> {
        let lock_key = format!("model_lock:{}", model_id);
        let _lock = self.distributed_lock.acquire(&lock_key, Duration::from_secs(30)).await?;

        // Perform update within distributed lock
        let mut tx = self.connection_pool.begin().await?;

        // Version conflict detection
        let current_version = sqlx::query_scalar!(
            "SELECT version FROM models WHERE id = $1 FOR UPDATE",
            model_id
        ).fetch_one(&mut tx).await?;

        if current_version != update.expected_version {
            return Err(VersionConflictError);
        }

        sqlx::query!(
            "UPDATE models SET version = $1, updated_at = NOW() WHERE id = $2",
            update.new_version,
            model_id
        ).execute(&mut tx).await?;

        tx.commit().await?;
        Ok(())
    }
}
```

## Performance Optimization Strategies

### Indexing Strategy
```sql
-- Multi-tenant aware indexes
CREATE INDEX CONCURRENTLY idx_models_tenant_status
ON models (tenant_id, status) WHERE status IN ('active', 'training');

CREATE INDEX CONCURRENTLY idx_inference_tenant_time
ON inference_jobs (tenant_id, created_at DESC);

-- Partial indexes for hot data
CREATE INDEX CONCURRENTLY idx_active_training_jobs
ON training_jobs (tenant_id, created_at)
WHERE status IN ('running', 'pending');

-- Covering indexes for common queries
CREATE INDEX CONCURRENTLY idx_models_metadata_covering
ON models (tenant_id, model_type)
INCLUDE (name, version, accuracy, created_at);
```

### Connection Pooling and Caching
```rust
pub struct DatabaseManager {
    postgres_pools: HashMap<String, PgPool>, // Service-specific pools
    clickhouse_pool: clickhouse::Pool,
    redis_pool: redis::Pool,
    mongo_client: mongodb::Client,
}

impl DatabaseManager {
    pub async fn get_service_pool(&self, service: &str) -> &PgPool {
        self.postgres_pools.get(service)
            .expect("Service pool not configured")
    }

    // Read replica routing for analytics queries
    pub async fn get_readonly_pool(&self, service: &str) -> &PgPool {
        // Route to read replicas for analytics workloads
        self.postgres_pools.get(&format!("{}_readonly", service))
            .unwrap_or_else(|| self.postgres_pools.get(service).unwrap())
    }
}
```

This completes the first part of the distributed data architecture design, focusing on the database-per-service strategy and data partitioning. Would you like me to continue with the remaining components (distributed transactions, event sourcing, synchronization strategies, and backup/DR)?