//! PostgreSQL schema management module
//!
//! This module handles database schema initialization and tenant management.

use crate::data_stores::traits::DataStoreResult;
use crate::data_stores::postgres::connection::PostgreSQLDataStore;

impl PostgreSQLDataStore {
    /// Initialize database schema with tenant support
    pub async fn initialize_schema(&self) -> DataStoreResult<()> {
        let conn = self.get_connection().await?;

        let schema = format!(r#"
            CREATE SCHEMA IF NOT EXISTS {};

            CREATE TABLE IF NOT EXISTS {}.tenants (
                tenant_id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS {}.ioc (
                tenant_id VARCHAR(255) NOT NULL REFERENCES {}.tenants(tenant_id) ON DELETE CASCADE,
                id UUID NOT NULL,
                indicator_type VARCHAR(50) NOT NULL,
                value TEXT NOT NULL,
                confidence REAL NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
                source VARCHAR(255),
                tags TEXT[],
                metadata JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                PRIMARY KEY (tenant_id, id)
            );

            CREATE TABLE IF NOT EXISTS {}.ioc_result (
                tenant_id VARCHAR(255) NOT NULL,
                ioc_id UUID NOT NULL,
                threat_level VARCHAR(20) NOT NULL,
                confidence REAL NOT NULL,
                indicators JSONB,
                recommendations TEXT[],
                processing_time_ms INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                PRIMARY KEY (tenant_id, ioc_id),
                FOREIGN KEY (tenant_id, ioc_id) REFERENCES {}.ioc(tenant_id, id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS {}.enriched_ioc (
                tenant_id VARCHAR(255) NOT NULL,
                base_ioc UUID NOT NULL,
                enrichment_data JSONB,
                source VARCHAR(255) NOT NULL,
                enrichment_type VARCHAR(50) NOT NULL,
                confidence REAL NOT NULL,
                confidence_boost REAL DEFAULT 0.0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                PRIMARY KEY (tenant_id, base_ioc),
                FOREIGN KEY (tenant_id, base_ioc) REFERENCES {}.ioc(tenant_id, id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS {}.correlation (
                tenant_id VARCHAR(255) NOT NULL,
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                ioc_id UUID NOT NULL,
                correlation_type VARCHAR(50) NOT NULL,
                related_iocs UUID[],
                correlation_strength REAL NOT NULL,
                confidence REAL NOT NULL,
                metadata JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                FOREIGN KEY (tenant_id, ioc_id) REFERENCES {}.ioc(tenant_id, id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_ioc_tenant_indicator_type ON {}.ioc(tenant_id, indicator_type);
            CREATE INDEX IF NOT EXISTS idx_ioc_tenant_confidence ON {}.ioc(tenant_id, confidence);
            CREATE INDEX IF NOT EXISTS idx_ioc_tenant_source ON {}.ioc(tenant_id, source);
            CREATE INDEX IF NOT EXISTS idx_ioc_tenant_created_at ON {}.ioc(tenant_id, created_at);
            CREATE INDEX IF NOT EXISTS idx_enriched_tenant_source ON {}.enriched_ioc(tenant_id, source);
            CREATE INDEX IF NOT EXISTS idx_correlation_tenant_type ON {}.correlation(tenant_id, correlation_type);
            CREATE INDEX IF NOT EXISTS idx_correlation_tenant_ioc ON {}.correlation(tenant_id, ioc_id);
        "#,
        self.config.schema,
        self.config.schema, self.config.schema, self.config.schema,
        self.config.schema, self.config.schema,
        self.config.schema, self.config.schema,
        self.config.schema, self.config.schema,
        self.config.schema, self.config.schema, self.config.schema, self.config.schema,
        self.config.schema, self.config.schema, self.config.schema, self.config.schema
        );

        conn.batch_execute(&schema).await
            .map_err(|e| crate::data_stores::traits::DataStoreError::Internal(format!("Failed to initialize schema: {}", e)))?;

        Ok(())
    }

    /// Ensure tenant exists
    pub async fn ensure_tenant(&self, tenant_id: &str) -> DataStoreResult<()> {
        let conn = self.get_connection().await?;

        conn.execute(
            &format!("INSERT INTO {}.tenants (tenant_id, name) VALUES ($1, $1) ON CONFLICT (tenant_id) DO NOTHING", self.config.schema),
            &[&tenant_id],
        ).await
        .map_err(|e| crate::data_stores::traits::DataStoreError::Internal(format!("Failed to ensure tenant: {}", e)))?;

        Ok(())
    }
}