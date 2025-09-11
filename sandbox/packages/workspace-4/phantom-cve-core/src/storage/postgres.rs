// PostgreSQL storage implementation
#[cfg(feature = "postgres")]
use deadpool_postgres::{Config, Pool, Runtime};
#[cfg(feature = "postgres")]
use tokio_postgres::NoTls;
use crate::config::PostgresConfig;
use crate::models::{CVE, CVEAnalysisResult, SearchCriteria};
use super::traits::{Storage, StorageStatistics, HealthStatus};
use super::StorageError;
use chrono::Utc;

/// PostgreSQL storage implementation
pub struct PostgresStorage {
    #[cfg(feature = "postgres")]
    pool: Pool,
    #[cfg(not(feature = "postgres"))]
    _config: PostgresConfig,
}

impl PostgresStorage {
    pub async fn new(config: &PostgresConfig) -> Result<Self, StorageError> {
        #[cfg(feature = "postgres")]
        {
            let mut pg_config = Config::new();
            pg_config.host = Some(config.host.clone());
            pg_config.port = Some(config.port);
            pg_config.dbname = Some(config.database.clone());
            pg_config.user = Some(config.username.clone());
            pg_config.password = Some(config.password.clone());
            pg_config.pool = Some(deadpool_postgres::PoolConfig::new(config.connection_pool_size as usize));
            
            let pool = pg_config.create_pool(Some(Runtime::Tokio1), NoTls)
                .map_err(|e| StorageError::ConnectionError(format!("Failed to create PostgreSQL pool: {}", e)))?;
            
            Ok(PostgresStorage { pool })
        }
        
        #[cfg(not(feature = "postgres"))]
        {
            Ok(PostgresStorage {
                _config: config.clone(),
            })
        }
    }
    
    #[cfg(feature = "postgres")]
    async fn ensure_tables(&self) -> Result<(), StorageError> {
        let client = self.pool.get().await
            .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
        
        // Create CVE table
        client.execute(
            "CREATE TABLE IF NOT EXISTS cves (
                id VARCHAR(20) PRIMARY KEY,
                data JSONB NOT NULL,
                published_date TIMESTAMP WITH TIME ZONE NOT NULL,
                last_modified_date TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )",
            &[],
        ).await.map_err(|e| StorageError::DatabaseError(format!("Failed to create CVE table: {}", e)))?;
        
        // Create analysis table
        client.execute(
            "CREATE TABLE IF NOT EXISTS cve_analyses (
                cve_id VARCHAR(20) PRIMARY KEY,
                data JSONB NOT NULL,
                processing_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )",
            &[],
        ).await.map_err(|e| StorageError::DatabaseError(format!("Failed to create analysis table: {}", e)))?;
        
        // Create indexes
        client.execute("CREATE INDEX IF NOT EXISTS idx_cves_published_date ON cves(published_date)", &[]).await
            .map_err(|e| StorageError::DatabaseError(format!("Failed to create index: {}", e)))?;
        client.execute("CREATE INDEX IF NOT EXISTS idx_cve_analyses_timestamp ON cve_analyses(processing_timestamp)", &[]).await
            .map_err(|e| StorageError::DatabaseError(format!("Failed to create index: {}", e)))?;
        
        Ok(())
    }
}

#[async_trait::async_trait]
impl Storage for PostgresStorage {
    async fn store_analysis(&self, result: &CVEAnalysisResult) -> Result<(), StorageError> {
        #[cfg(feature = "postgres")]
        {
            let client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let json_data = serde_json::to_value(result)
                .map_err(|e| StorageError::SerializationError(format!("Failed to serialize analysis: {}", e)))?;
            
            client.execute(
                "INSERT INTO cve_analyses (cve_id, data, processing_timestamp) VALUES ($1, $2, $3)
                 ON CONFLICT (cve_id) DO UPDATE SET data = $2, processing_timestamp = $3",
                &[&result.cve.id, &json_data, &result.processing_timestamp],
            ).await.map_err(|e| StorageError::DatabaseError(format!("Failed to store analysis: {}", e)))?;
            
            Ok(())
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn store_analysis_batch(&self, results: &[CVEAnalysisResult]) -> Result<(), StorageError> {
        #[cfg(feature = "postgres")]
        {
            let mut client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let transaction = client.transaction().await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to start transaction: {}", e)))?;
            
            for result in results {
                let json_data = serde_json::to_value(result)
                    .map_err(|e| StorageError::SerializationError(format!("Failed to serialize analysis: {}", e)))?;
                
                transaction.execute(
                    "INSERT INTO cve_analyses (cve_id, data, processing_timestamp) VALUES ($1, $2, $3)
                     ON CONFLICT (cve_id) DO UPDATE SET data = $2, processing_timestamp = $3",
                    &[&result.cve.id, &json_data, &result.processing_timestamp],
                ).await.map_err(|e| StorageError::DatabaseError(format!("Failed to store analysis: {}", e)))?;
            }
            
            transaction.commit().await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to commit transaction: {}", e)))?;
            
            Ok(())
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn get_analysis(&self, cve_id: &str) -> Result<Option<CVEAnalysisResult>, StorageError> {
        #[cfg(feature = "postgres")]
        {
            let client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let row = client.query_opt(
                "SELECT data FROM cve_analyses WHERE cve_id = $1",
                &[&cve_id],
            ).await.map_err(|e| StorageError::DatabaseError(format!("Failed to query analysis: {}", e)))?;
            
            match row {
                Some(row) => {
                    let json_data: serde_json::Value = row.get(0);
                    let result: CVEAnalysisResult = serde_json::from_value(json_data)
                        .map_err(|e| StorageError::SerializationError(format!("Failed to deserialize analysis: {}", e)))?;
                    Ok(Some(result))
                },
                None => Ok(None),
            }
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn get_analysis_batch(&self, cve_ids: &[String]) -> Result<Vec<CVEAnalysisResult>, StorageError> {
        #[cfg(feature = "postgres")]
        {
            let client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let rows = client.query(
                "SELECT data FROM cve_analyses WHERE cve_id = ANY($1)",
                &[&cve_ids],
            ).await.map_err(|e| StorageError::DatabaseError(format!("Failed to query analyses: {}", e)))?;
            
            let mut results = Vec::new();
            for row in rows {
                let json_data: serde_json::Value = row.get(0);
                let result: CVEAnalysisResult = serde_json::from_value(json_data)
                    .map_err(|e| StorageError::SerializationError(format!("Failed to deserialize analysis: {}", e)))?;
                results.push(result);
            }
            Ok(results)
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn search_analyses(&self, criteria: &SearchCriteria) -> Result<Vec<CVEAnalysisResult>, StorageError> {
        #[cfg(feature = "postgres")]
        {
            let client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let mut query = "SELECT data FROM cve_analyses WHERE 1=1".to_string();
            let mut params: Vec<&(dyn tokio_postgres::types::ToSql + Sync)> = Vec::new();
            let mut param_count = 0;
            
            if let Some(ref cve_id) = criteria.cve_id {
                param_count += 1;
                query.push_str(&format!(" AND data->>'cve'->>'id' ILIKE ${}", param_count));
                params.push(cve_id);
            }
            
            let rows = client.query(&query, &params).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to search analyses: {}", e)))?;
            
            let mut results = Vec::new();
            for row in rows {
                let json_data: serde_json::Value = row.get(0);
                let result: CVEAnalysisResult = serde_json::from_value(json_data)
                    .map_err(|e| StorageError::SerializationError(format!("Failed to deserialize analysis: {}", e)))?;
                results.push(result);
            }
            Ok(results)
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn store_cve(&self, cve: &CVE) -> Result<(), StorageError> {
        #[cfg(feature = "postgres")]
        {
            let client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let json_data = serde_json::to_value(cve)
                .map_err(|e| StorageError::SerializationError(format!("Failed to serialize CVE: {}", e)))?;
            
            client.execute(
                "INSERT INTO cves (id, data, published_date, last_modified_date) VALUES ($1, $2, $3, $4)
                 ON CONFLICT (id) DO UPDATE SET data = $2, last_modified_date = $4",
                &[&cve.id, &json_data, &cve.published_date, &cve.last_modified_date],
            ).await.map_err(|e| StorageError::DatabaseError(format!("Failed to store CVE: {}", e)))?;
            
            Ok(())
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn store_cve_batch(&self, cves: &[CVE]) -> Result<(), StorageError> {
        #[cfg(feature = "postgres")]
        {
            let mut client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let transaction = client.transaction().await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to start transaction: {}", e)))?;
            
            for cve in cves {
                let json_data = serde_json::to_value(cve)
                    .map_err(|e| StorageError::SerializationError(format!("Failed to serialize CVE: {}", e)))?;
                
                transaction.execute(
                    "INSERT INTO cves (id, data, published_date, last_modified_date) VALUES ($1, $2, $3, $4)
                     ON CONFLICT (id) DO UPDATE SET data = $2, last_modified_date = $4",
                    &[&cve.id, &json_data, &cve.published_date, &cve.last_modified_date],
                ).await.map_err(|e| StorageError::DatabaseError(format!("Failed to store CVE: {}", e)))?;
            }
            
            transaction.commit().await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to commit transaction: {}", e)))?;
            
            Ok(())
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn get_cve(&self, cve_id: &str) -> Result<Option<CVE>, StorageError> {
        #[cfg(feature = "postgres")]
        {
            let client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let row = client.query_opt(
                "SELECT data FROM cves WHERE id = $1",
                &[&cve_id],
            ).await.map_err(|e| StorageError::DatabaseError(format!("Failed to query CVE: {}", e)))?;
            
            match row {
                Some(row) => {
                    let json_data: serde_json::Value = row.get(0);
                    let cve: CVE = serde_json::from_value(json_data)
                        .map_err(|e| StorageError::SerializationError(format!("Failed to deserialize CVE: {}", e)))?;
                    Ok(Some(cve))
                },
                None => Ok(None),
            }
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn get_cve_batch(&self, cve_ids: &[String]) -> Result<Vec<CVE>, StorageError> {
        #[cfg(feature = "postgres")]
        {
            let client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let rows = client.query(
                "SELECT data FROM cves WHERE id = ANY($1)",
                &[&cve_ids],
            ).await.map_err(|e| StorageError::DatabaseError(format!("Failed to query CVEs: {}", e)))?;
            
            let mut results = Vec::new();
            for row in rows {
                let json_data: serde_json::Value = row.get(0);
                let cve: CVE = serde_json::from_value(json_data)
                    .map_err(|e| StorageError::SerializationError(format!("Failed to deserialize CVE: {}", e)))?;
                results.push(cve);
            }
            Ok(results)
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn search_cves(&self, criteria: &SearchCriteria) -> Result<Vec<CVE>, StorageError> {
        #[cfg(feature = "postgres")]
        {
            let client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let mut query = "SELECT data FROM cves WHERE 1=1".to_string();
            let mut params: Vec<&(dyn tokio_postgres::types::ToSql + Sync)> = Vec::new();
            let mut param_count = 0;
            
            if let Some(ref cve_id) = criteria.cve_id {
                param_count += 1;
                query.push_str(&format!(" AND id ILIKE ${}", param_count));
                params.push(cve_id);
            }
            
            let rows = client.query(&query, &params).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to search CVEs: {}", e)))?;
            
            let mut results = Vec::new();
            for row in rows {
                let json_data: serde_json::Value = row.get(0);
                let cve: CVE = serde_json::from_value(json_data)
                    .map_err(|e| StorageError::SerializationError(format!("Failed to deserialize CVE: {}", e)))?;
                results.push(cve);
            }
            Ok(results)
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn list_cve_ids(&self) -> Result<Vec<String>, StorageError> {
        #[cfg(feature = "postgres")]
        {
            let client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let rows = client.query("SELECT id FROM cves ORDER BY id", &[]).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to list CVE IDs: {}", e)))?;
            
            Ok(rows.into_iter().map(|row| row.get::<_, String>(0)).collect())
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn list_analysis_ids(&self) -> Result<Vec<String>, StorageError> {
        #[cfg(feature = "postgres")]
        {
            let client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let rows = client.query("SELECT cve_id FROM cve_analyses ORDER BY cve_id", &[]).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to list analysis IDs: {}", e)))?;
            
            Ok(rows.into_iter().map(|row| row.get::<_, String>(0)).collect())
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn delete_analysis(&self, cve_id: &str) -> Result<bool, StorageError> {
        #[cfg(feature = "postgres")]
        {
            let client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let rows_affected = client.execute("DELETE FROM cve_analyses WHERE cve_id = $1", &[&cve_id]).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to delete analysis: {}", e)))?;
            
            Ok(rows_affected > 0)
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn delete_cve(&self, cve_id: &str) -> Result<bool, StorageError> {
        #[cfg(feature = "postgres")]
        {
            let client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let rows_affected = client.execute("DELETE FROM cves WHERE id = $1", &[&cve_id]).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to delete CVE: {}", e)))?;
            
            Ok(rows_affected > 0)
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn get_statistics(&self) -> Result<StorageStatistics, StorageError> {
        #[cfg(feature = "postgres")]
        {
            let client = self.pool.get().await
                .map_err(|e| StorageError::ConnectionError(format!("Failed to get connection: {}", e)))?;
            
            let cve_count_row = client.query_one("SELECT COUNT(*) FROM cves", &[]).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to count CVEs: {}", e)))?;
            let cve_count: i64 = cve_count_row.get(0);
            
            let analysis_count_row = client.query_one("SELECT COUNT(*) FROM cve_analyses", &[]).await
                .map_err(|e| StorageError::DatabaseError(format!("Failed to count analyses: {}", e)))?;
            let analysis_count: i64 = analysis_count_row.get(0);
            
            Ok(StorageStatistics {
                total_cves: cve_count as u64,
                total_analyses: analysis_count as u64,
                storage_size_bytes: 0, // Would need pg_database_size() for actual size
                last_updated: Utc::now(),
            })
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn health_check(&self) -> Result<HealthStatus, StorageError> {
        #[cfg(feature = "postgres")]
        {
            match self.pool.get().await {
                Ok(client) => {
                    match client.query_one("SELECT 1", &[]).await {
                        Ok(_) => Ok(HealthStatus::Healthy),
                        Err(e) => Ok(HealthStatus::Unhealthy { 
                            reason: format!("Database query failed: {}", e) 
                        }),
                    }
                },
                Err(e) => Ok(HealthStatus::Unhealthy { 
                    reason: format!("Connection failed: {}", e) 
                }),
            }
        }
        #[cfg(not(feature = "postgres"))]
        Ok(HealthStatus::Unhealthy { reason: "PostgreSQL support not compiled".to_string() })
    }
    
    async fn initialize(&self) -> Result<(), StorageError> {
        #[cfg(feature = "postgres")]
        {
            self.ensure_tables().await
        }
        #[cfg(not(feature = "postgres"))]
        Err(StorageError::DatabaseError("PostgreSQL support not compiled".to_string()))
    }
    
    async fn close(&self) -> Result<(), StorageError> {
        // Connection pool will be dropped automatically
        Ok(())
    }
}