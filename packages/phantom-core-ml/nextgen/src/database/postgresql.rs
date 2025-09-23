//! PostgreSQL adapter for phantom-ml-core
//! 
//! Provides PostgreSQL-based persistence for ML models, metadata, and structured analytics.

use async_trait::async_trait;
use serde_json;
use std::sync::Arc;
use tokio_postgres::{Client, NoTls};
use bb8::{Pool, PooledConnection};
use bb8_postgres::PostgresConnectionManager;
use std::collections::HashMap;

use super::interfaces::{
    ModelStorage, InferenceStorage, TrainingStorage,
    DatabaseConfig, DatabaseError, DatabaseResult,
    MLModel, InferenceResult, TrainingResult, TrainingDataset, MLExperiment,
    ModelFilters, AnalyticsFilters, SearchCriteria, ExperimentFilters,
    InferenceAnalytics, TimeSeriesPoint
};

type ConnectionPool = Pool<PostgresConnectionManager<NoTls>>;
type PooledConn = PooledConnection<'static, PostgresConnectionManager<NoTls>>;

/// PostgreSQL adapter for structured ML data storage
#[derive(Clone)]
pub struct PostgreSQLAdapter {
    pool: Arc<ConnectionPool>,
    config: DatabaseConfig,
}

impl PostgreSQLAdapter {
    /// Create a new PostgreSQL adapter
    pub async fn new(config: DatabaseConfig) -> DatabaseResult<Self> {
        let manager = PostgresConnectionManager::new_from_stringlike(
            config.connection_string.clone(),
            NoTls
        ).map_err(|e| DatabaseError::ConnectionFailed(format!("Failed to create connection manager: {}", e)))?;

        let pool = Pool::builder()
            .max_size(config.pool_size.unwrap_or(10))
            .build(manager)
            .await
            .map_err(|e| DatabaseError::ConnectionFailed(format!("Failed to create connection pool: {}", e)))?;

        let adapter = Self {
            pool: Arc::new(pool),
            config,
        };

        // Initialize database schema
        adapter.initialize_schema().await?;
        
        Ok(adapter)
    }

    /// Get a database connection from the pool
    async fn get_connection(&self) -> DatabaseResult<PooledConn> {
        self.pool
            .get()
            .await
            .map_err(|e| DatabaseError::ConnectionFailed(format!("Failed to get connection: {}", e)))
    }

    /// Initialize database schema for ML components
    async fn initialize_schema(&self) -> DatabaseResult<()> {
        let conn = self.get_connection().await?;
        
        // Create schema
        conn.execute("CREATE SCHEMA IF NOT EXISTS ml_core", &[]).await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create schema: {}", e)))?;

        // Models table
        conn.execute(r#"
            CREATE TABLE IF NOT EXISTS ml_core.models (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                model_type VARCHAR(100) NOT NULL,
                algorithm VARCHAR(100) NOT NULL,
                version VARCHAR(50) NOT NULL,
                accuracy DECIMAL(5,4) DEFAULT 0.0,
                precision_score DECIMAL(5,4) DEFAULT 0.0,
                recall_score DECIMAL(5,4) DEFAULT 0.0,
                f1_score DECIMAL(5,4) DEFAULT 0.0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                last_trained TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                training_samples BIGINT DEFAULT 0,
                feature_count INTEGER DEFAULT 0,
                status VARCHAR(50) DEFAULT 'created',
                performance_metrics JSONB,
                tags TEXT[],
                metadata JSONB
            )
        "#, &[]).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to create models table: {}", e)))?;

        // Model weights table (for binary weight storage)
        conn.execute(r#"
            CREATE TABLE IF NOT EXISTS ml_core.model_weights (
                model_id VARCHAR(255) PRIMARY KEY REFERENCES ml_core.models(id) ON DELETE CASCADE,
                weights BYTEA NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        "#, &[]).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to create weights table: {}", e)))?;

        // Inferences table
        conn.execute(r#"
            CREATE TABLE IF NOT EXISTS ml_core.inferences (
                id SERIAL PRIMARY KEY,
                model_id VARCHAR(255) NOT NULL REFERENCES ml_core.models(id) ON DELETE CASCADE,
                prediction JSONB NOT NULL,
                confidence DECIMAL(5,4) NOT NULL,
                probability_distribution DECIMAL(5,4)[],
                feature_importance JSONB,
                inference_time_ms BIGINT NOT NULL,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                input_features JSONB,
                metadata JSONB
            )
        "#, &[]).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to create inferences table: {}", e)))?;

        // Training results table
        conn.execute(r#"
            CREATE TABLE IF NOT EXISTS ml_core.training_results (
                id SERIAL PRIMARY KEY,
                model_id VARCHAR(255) NOT NULL REFERENCES ml_core.models(id) ON DELETE CASCADE,
                training_accuracy DECIMAL(5,4) NOT NULL,
                validation_accuracy DECIMAL(5,4) NOT NULL,
                training_loss DECIMAL(8,6) NOT NULL,
                validation_loss DECIMAL(8,6) NOT NULL,
                epochs_completed INTEGER NOT NULL,
                training_time_ms BIGINT NOT NULL,
                convergence_achieved BOOLEAN DEFAULT FALSE,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                hyperparameters JSONB,
                metrics JSONB
            )
        "#, &[]).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to create training results table: {}", e)))?;

        // Training datasets table
        conn.execute(r#"
            CREATE TABLE IF NOT EXISTS ml_core.training_datasets (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                features TEXT[] NOT NULL,
                target VARCHAR(255) NOT NULL,
                size BIGINT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                metadata JSONB
            )
        "#, &[]).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to create datasets table: {}", e)))?;

        // ML experiments table
        conn.execute(r#"
            CREATE TABLE IF NOT EXISTS ml_core.experiments (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                model_id VARCHAR(255) NOT NULL REFERENCES ml_core.models(id) ON DELETE CASCADE,
                dataset_id VARCHAR(255) NOT NULL REFERENCES ml_core.training_datasets(id) ON DELETE CASCADE,
                parameters JSONB NOT NULL,
                metrics JSONB NOT NULL,
                status VARCHAR(50) NOT NULL,
                start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP WITH TIME ZONE,
                notes TEXT,
                tags TEXT[]
            )
        "#, &[]).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to create experiments table: {}", e)))?;

        // Create indexes for performance
        let indexes = vec![
            "CREATE INDEX IF NOT EXISTS idx_models_type ON ml_core.models(model_type)",
            "CREATE INDEX IF NOT EXISTS idx_models_algorithm ON ml_core.models(algorithm)", 
            "CREATE INDEX IF NOT EXISTS idx_models_status ON ml_core.models(status)",
            "CREATE INDEX IF NOT EXISTS idx_models_accuracy ON ml_core.models(accuracy)",
            "CREATE INDEX IF NOT EXISTS idx_models_created_at ON ml_core.models(created_at)",
            "CREATE INDEX IF NOT EXISTS idx_inferences_model_id ON ml_core.inferences(model_id)",
            "CREATE INDEX IF NOT EXISTS idx_inferences_timestamp ON ml_core.inferences(timestamp)",
            "CREATE INDEX IF NOT EXISTS idx_inferences_confidence ON ml_core.inferences(confidence)",
            "CREATE INDEX IF NOT EXISTS idx_training_model_id ON ml_core.training_results(model_id)",
            "CREATE INDEX IF NOT EXISTS idx_training_timestamp ON ml_core.training_results(timestamp)",
            "CREATE INDEX IF NOT EXISTS idx_experiments_model_id ON ml_core.experiments(model_id)",
            "CREATE INDEX IF NOT EXISTS idx_experiments_status ON ml_core.experiments(status)",
            "CREATE INDEX IF NOT EXISTS idx_experiments_start_time ON ml_core.experiments(start_time)",
        ];

        for index in indexes {
            conn.execute(index, &[]).await
                .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create index: {}", e)))?;
        }

        Ok(())
    }

    /// Convert database row to MLModel
    fn row_to_model(&self, row: &tokio_postgres::Row) -> DatabaseResult<MLModel> {
        let performance_metrics: Option<serde_json::Value> = row.try_get("performance_metrics")
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to get performance_metrics: {}", e)))?;
        
        let performance_metrics_map = performance_metrics
            .and_then(|v| serde_json::from_value(v).ok())
            .unwrap_or_default();

        Ok(MLModel {
            id: row.try_get("id").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
            name: row.try_get("name").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
            model_type: row.try_get("model_type").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
            algorithm: row.try_get("algorithm").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
            version: row.try_get("version").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
            accuracy: row.try_get::<_, Option<rust_decimal::Decimal>>("accuracy")
                .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                .map(|d| d.to_string().parse::<f64>().unwrap_or(0.0))
                .unwrap_or(0.0),
            precision: row.try_get::<_, Option<rust_decimal::Decimal>>("precision_score")
                .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                .map(|d| d.to_string().parse::<f64>().unwrap_or(0.0))
                .unwrap_or(0.0),
            recall: row.try_get::<_, Option<rust_decimal::Decimal>>("recall_score")
                .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                .map(|d| d.to_string().parse::<f64>().unwrap_or(0.0))
                .unwrap_or(0.0),
            f1_score: row.try_get::<_, Option<rust_decimal::Decimal>>("f1_score")
                .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                .map(|d| d.to_string().parse::<f64>().unwrap_or(0.0))
                .unwrap_or(0.0),
            created_at: row.try_get::<_, chrono::DateTime<chrono::Utc>>("created_at")
                .map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
            last_trained: row.try_get::<_, chrono::DateTime<chrono::Utc>>("last_trained")
                .map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
            last_used: row.try_get::<_, chrono::DateTime<chrono::Utc>>("last_used")
                .map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
            training_samples: row.try_get::<_, Option<i64>>("training_samples")
                .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                .unwrap_or(0) as u64,
            feature_count: row.try_get::<_, Option<i32>>("feature_count")
                .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                .unwrap_or(0) as u32,
            status: row.try_get("status").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
            performance_metrics: performance_metrics_map,
        })
    }

    /// Serialize weights to bytes
    fn serialize_weights(&self, weights: &[f64]) -> DatabaseResult<Vec<u8>> {
        bincode::serialize(weights)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize weights: {}", e)))
    }

    /// Deserialize weights from bytes
    fn deserialize_weights(&self, data: &[u8]) -> DatabaseResult<Vec<f64>> {
        bincode::deserialize(data)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to deserialize weights: {}", e)))
    }
}

#[async_trait]
impl ModelStorage for PostgreSQLAdapter {
    async fn save_model(&self, model: &MLModel) -> DatabaseResult<String> {
        let conn = self.get_connection().await?;
        
        let performance_metrics_json = serde_json::to_value(&model.performance_metrics)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize performance metrics: {}", e)))?;

        conn.execute(r#"
            INSERT INTO ml_core.models (
                id, name, model_type, algorithm, version, accuracy, precision_score, 
                recall_score, f1_score, created_at, last_trained, last_used, 
                training_samples, feature_count, status, performance_metrics
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                model_type = EXCLUDED.model_type,
                algorithm = EXCLUDED.algorithm,
                version = EXCLUDED.version,
                accuracy = EXCLUDED.accuracy,
                precision_score = EXCLUDED.precision_score,
                recall_score = EXCLUDED.recall_score,
                f1_score = EXCLUDED.f1_score,
                last_trained = EXCLUDED.last_trained,
                last_used = EXCLUDED.last_used,
                training_samples = EXCLUDED.training_samples,
                feature_count = EXCLUDED.feature_count,
                status = EXCLUDED.status,
                performance_metrics = EXCLUDED.performance_metrics
        "#, &[
            &model.id,
            &model.name,
            &model.model_type,
            &model.algorithm,
            &model.version,
            &rust_decimal::Decimal::from_f64_retain(model.accuracy),
            &rust_decimal::Decimal::from_f64_retain(model.precision),
            &rust_decimal::Decimal::from_f64_retain(model.recall),
            &rust_decimal::Decimal::from_f64_retain(model.f1_score),
            &model.created_at,
            &model.last_trained,
            &model.last_used,
            &(model.training_samples as i64),
            &(model.feature_count as i32),
            &model.status,
            &performance_metrics_json,
        ]).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to save model: {}", e)))?;

        Ok(model.id.clone())
    }

    async fn load_model(&self, model_id: &str) -> DatabaseResult<MLModel> {
        let conn = self.get_connection().await?;
        
        let row = conn.query_opt(
            "SELECT * FROM ml_core.models WHERE id = $1",
            &[&model_id]
        ).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to load model: {}", e)))?;

        match row {
            Some(row) => self.row_to_model(&row),
            None => Err(DatabaseError::NotFound(format!("Model {} not found", model_id))),
        }
    }

    async fn update_model(&self, model: &MLModel) -> DatabaseResult<()> {
        self.save_model(model).await?;
        Ok(())
    }

    async fn delete_model(&self, model_id: &str) -> DatabaseResult<()> {
        let conn = self.get_connection().await?;
        
        let rows_affected = conn.execute(
            "DELETE FROM ml_core.models WHERE id = $1",
            &[&model_id]
        ).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to delete model: {}", e)))?;

        if rows_affected == 0 {
            return Err(DatabaseError::NotFound(format!("Model {} not found", model_id)));
        }

        Ok(())
    }

    async fn list_models(&self, filters: Option<ModelFilters>) -> DatabaseResult<Vec<MLModel>> {
        let conn = self.get_connection().await?;
        
        let mut query = String::from("SELECT * FROM ml_core.models WHERE 1=1");
        let mut params: Vec<Box<dyn tokio_postgres::types::ToSql + Sync + Send>> = Vec::new();
        let mut param_count = 0;

        if let Some(filters) = filters {
            if let Some(model_type) = filters.model_type {
                param_count += 1;
                query.push_str(&format!(" AND model_type = ${}", param_count));
                params.push(Box::new(model_type));
            }

            if let Some(algorithm) = filters.algorithm {
                param_count += 1;
                query.push_str(&format!(" AND algorithm = ${}", param_count));
                params.push(Box::new(algorithm));
            }

            if let Some(status) = filters.status {
                param_count += 1;
                query.push_str(&format!(" AND status = ${}", param_count));
                params.push(Box::new(status));
            }

            if let Some(min_accuracy) = filters.min_accuracy {
                param_count += 1;
                query.push_str(&format!(" AND accuracy >= ${}", param_count));
                params.push(Box::new(rust_decimal::Decimal::from_f64_retain(min_accuracy)));
            }

            if let Some(created_after) = filters.created_after {
                param_count += 1;
                query.push_str(&format!(" AND created_at >= ${}", param_count));
                params.push(Box::new(created_after));
            }

            if let Some(created_before) = filters.created_before {
                param_count += 1;
                query.push_str(&format!(" AND created_at <= ${}", param_count));
                params.push(Box::new(created_before));
            }
        }

        query.push_str(" ORDER BY created_at DESC");

        let param_refs: Vec<&(dyn tokio_postgres::types::ToSql + Sync)> = 
            params.iter().map(|p| p.as_ref()).collect();

        let rows = conn.query(&query, &param_refs).await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to list models: {}", e)))?;

        let mut models = Vec::new();
        for row in rows {
            models.push(self.row_to_model(&row)?);
        }

        Ok(models)
    }

    async fn model_exists(&self, model_id: &str) -> DatabaseResult<bool> {
        let conn = self.get_connection().await?;
        
        let row = conn.query_opt(
            "SELECT 1 FROM ml_core.models WHERE id = $1",
            &[&model_id]
        ).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to check model existence: {}", e)))?;

        Ok(row.is_some())
    }

    async fn save_model_weights(&self, model_id: &str, weights: &[f64]) -> DatabaseResult<()> {
        let conn = self.get_connection().await?;
        let weights_bytes = self.serialize_weights(weights)?;

        conn.execute(r#"
            INSERT INTO ml_core.model_weights (model_id, weights, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (model_id) DO UPDATE SET
                weights = EXCLUDED.weights,
                updated_at = EXCLUDED.updated_at
        "#, &[&model_id, &weights_bytes]).await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to save model weights: {}", e)))?;

        Ok(())
    }

    async fn load_model_weights(&self, model_id: &str) -> DatabaseResult<Vec<f64>> {
        let conn = self.get_connection().await?;
        
        let row = conn.query_opt(
            "SELECT weights FROM ml_core.model_weights WHERE model_id = $1",
            &[&model_id]
        ).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to load model weights: {}", e)))?;

        match row {
            Some(row) => {
                let weights_bytes: Vec<u8> = row.try_get("weights")
                    .map_err(|e| DatabaseError::SerializationError(e.to_string()))?;
                self.deserialize_weights(&weights_bytes)
            },
            None => Err(DatabaseError::NotFound(format!("Model weights for {} not found", model_id))),
        }
    }
}

// Implement other traits with placeholder implementations for now
#[async_trait]
impl InferenceStorage for PostgreSQLAdapter {
    async fn save_inference(&self, result: &InferenceResult) -> DatabaseResult<String> {
        let conn = self.get_connection().await?;
        
        let prediction_json = serde_json::to_value(&result.prediction)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize prediction: {}", e)))?;
        
        let feature_importance_json = serde_json::to_value(&result.feature_importance)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize feature importance: {}", e)))?;

        let probability_distribution: Vec<rust_decimal::Decimal> = result.probability_distribution.iter()
            .map(|&f| rust_decimal::Decimal::from_f64_retain(f).unwrap_or(rust_decimal::Decimal::ZERO))
            .collect();

        let row = conn.query_one(r#"
            INSERT INTO ml_core.inferences (
                model_id, prediction, confidence, probability_distribution, 
                feature_importance, inference_time_ms, timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        "#, &[
            &result.model_id,
            &prediction_json,
            &rust_decimal::Decimal::from_f64_retain(result.confidence),
            &probability_distribution,
            &feature_importance_json,
            &(result.inference_time_ms as i64),
            &result.timestamp,
        ]).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to save inference: {}", e)))?;

        let inference_id: i32 = row.try_get("id")
            .map_err(|e| DatabaseError::SerializationError(e.to_string()))?;

        Ok(inference_id.to_string())
    }

    async fn get_inference_history(&self, model_id: &str, limit: Option<u32>) -> DatabaseResult<Vec<InferenceResult>> {
        let conn = self.get_connection().await?;
        let limit_val = limit.unwrap_or(100) as i64;
        
        let rows = conn.query(r#"
            SELECT model_id, prediction, confidence, probability_distribution, 
                   feature_importance, inference_time_ms, timestamp
            FROM ml_core.inferences
            WHERE model_id = $1
            ORDER BY timestamp DESC
            LIMIT $2
        "#, &[&model_id, &limit_val]).await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to get inference history: {}", e)))?;

        let mut results = Vec::new();
        for row in rows {
            let prediction: serde_json::Value = row.try_get("prediction")
                .map_err(|e| DatabaseError::SerializationError(e.to_string()))?;
            
            let feature_importance: HashMap<String, f64> = row.try_get::<_, serde_json::Value>("feature_importance")
                .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                .as_object()
                .map(|obj| obj.iter().map(|(k, v)| (k.clone(), v.as_f64().unwrap_or(0.0))).collect())
                .unwrap_or_default();

            let prob_dist_decimals: Vec<rust_decimal::Decimal> = row.try_get("probability_distribution")
                .map_err(|e| DatabaseError::SerializationError(e.to_string()))?;
            
            let probability_distribution: Vec<f64> = prob_dist_decimals.iter()
                .map(|d| d.to_string().parse::<f64>().unwrap_or(0.0))
                .collect();

            results.push(InferenceResult {
                model_id: row.try_get("model_id").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
                prediction,
                confidence: row.try_get::<_, rust_decimal::Decimal>("confidence")
                    .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                    .to_string().parse::<f64>().unwrap_or(0.0),
                probability_distribution,
                feature_importance,
                inference_time_ms: row.try_get::<_, i64>("inference_time_ms")
                    .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                    as u64,
                timestamp: row.try_get("timestamp").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
            });
        }

        Ok(results)
    }

    async fn get_inference_analytics(&self, model_id: &str, _filters: Option<AnalyticsFilters>) -> DatabaseResult<InferenceAnalytics> {
        let conn = self.get_connection().await?;
        
        // Get basic analytics
        let row = conn.query_opt(r#"
            SELECT 
                COUNT(*) as total_inferences,
                AVG(confidence) as avg_confidence
            FROM ml_core.inferences
            WHERE model_id = $1
        "#, &[&model_id]).await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to get inference analytics: {}", e)))?;

        let (total_inferences, average_confidence) = if let Some(row) = row {
            let total: i64 = row.try_get("total_inferences").unwrap_or(0);
            let avg: Option<rust_decimal::Decimal> = row.try_get("avg_confidence").ok();
            (total as u64, avg.map(|d| d.to_string().parse::<f64>().unwrap_or(0.0)).unwrap_or(0.0))
        } else {
            (0, 0.0)
        };

        // Simple analytics implementation - in production this would be more comprehensive
        Ok(InferenceAnalytics {
            total_inferences,
            average_confidence,
            confidence_distribution: HashMap::new(), // Placeholder
            prediction_distribution: HashMap::new(), // Placeholder  
            accuracy_over_time: Vec::new(), // Placeholder
            performance_metrics: HashMap::new(), // Placeholder
        })
    }

    async fn search_inferences(&self, _criteria: SearchCriteria) -> DatabaseResult<Vec<InferenceResult>> {
        // Placeholder implementation
        Ok(Vec::new())
    }
}

#[async_trait]
impl TrainingStorage for PostgreSQLAdapter {
    async fn save_training_result(&self, result: &TrainingResult) -> DatabaseResult<String> {
        let conn = self.get_connection().await?;
        
        let row = conn.query_one(r#"
            INSERT INTO ml_core.training_results (
                model_id, training_accuracy, validation_accuracy, training_loss,
                validation_loss, epochs_completed, training_time_ms, convergence_achieved
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        "#, &[
            &result.model_id,
            &rust_decimal::Decimal::from_f64_retain(result.training_accuracy),
            &rust_decimal::Decimal::from_f64_retain(result.validation_accuracy),
            &rust_decimal::Decimal::from_f64_retain(result.training_loss),
            &rust_decimal::Decimal::from_f64_retain(result.validation_loss),
            &(result.epochs_completed as i32),
            &(result.training_time_ms as i64),
            &result.convergence_achieved,
        ]).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to save training result: {}", e)))?;

        let training_id: i32 = row.try_get("id")
            .map_err(|e| DatabaseError::SerializationError(e.to_string()))?;

        Ok(training_id.to_string())
    }

    async fn get_training_history(&self, model_id: &str, limit: Option<u32>) -> DatabaseResult<Vec<TrainingResult>> {
        let conn = self.get_connection().await?;
        let limit_val = limit.unwrap_or(50) as i64;
        
        let rows = conn.query(r#"
            SELECT model_id, training_accuracy, validation_accuracy, training_loss,
                   validation_loss, epochs_completed, training_time_ms, convergence_achieved
            FROM ml_core.training_results
            WHERE model_id = $1
            ORDER BY timestamp DESC
            LIMIT $2
        "#, &[&model_id, &limit_val]).await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to get training history: {}", e)))?;

        let mut results = Vec::new();
        for row in rows {
            results.push(TrainingResult {
                model_id: row.try_get("model_id").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
                training_accuracy: row.try_get::<_, rust_decimal::Decimal>("training_accuracy")
                    .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                    .to_string().parse::<f64>().unwrap_or(0.0),
                validation_accuracy: row.try_get::<_, rust_decimal::Decimal>("validation_accuracy")
                    .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                    .to_string().parse::<f64>().unwrap_or(0.0),
                training_loss: row.try_get::<_, rust_decimal::Decimal>("training_loss")
                    .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                    .to_string().parse::<f64>().unwrap_or(0.0),
                validation_loss: row.try_get::<_, rust_decimal::Decimal>("validation_loss")
                    .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                    .to_string().parse::<f64>().unwrap_or(0.0),
                epochs_completed: row.try_get::<_, i32>("epochs_completed")
                    .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                    as u32,
                training_time_ms: row.try_get::<_, i64>("training_time_ms")
                    .map_err(|e| DatabaseError::SerializationError(e.to_string()))?
                    as u64,
                convergence_achieved: row.try_get("convergence_achieved")
                    .map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
            });
        }

        Ok(results)
    }

    async fn save_training_dataset(&self, dataset: &TrainingDataset) -> DatabaseResult<String> {
        let conn = self.get_connection().await?;
        
        let metadata_json = serde_json::to_value(&dataset.metadata)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize metadata: {}", e)))?;

        conn.execute(r#"
            INSERT INTO ml_core.training_datasets (
                id, name, description, features, target, size, created_at, updated_at, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                features = EXCLUDED.features,
                target = EXCLUDED.target,
                size = EXCLUDED.size,
                updated_at = EXCLUDED.updated_at,
                metadata = EXCLUDED.metadata
        "#, &[
            &dataset.id,
            &dataset.name,
            &dataset.description,
            &dataset.features,
            &dataset.target,
            &(dataset.size as i64),
            &dataset.created_at,
            &dataset.updated_at,
            &metadata_json,
        ]).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to save training dataset: {}", e)))?;

        Ok(dataset.id.clone())
    }

    async fn load_training_dataset(&self, dataset_id: &str) -> DatabaseResult<TrainingDataset> {
        let conn = self.get_connection().await?;
        
        let row = conn.query_opt(
            "SELECT * FROM ml_core.training_datasets WHERE id = $1",
            &[&dataset_id]
        ).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to load training dataset: {}", e)))?;

        match row {
            Some(row) => {
                let metadata: serde_json::Value = row.try_get("metadata")
                    .map_err(|e| DatabaseError::SerializationError(e.to_string()))?;
                let metadata_map: HashMap<String, serde_json::Value> = serde_json::from_value(metadata)
                    .map_err(|e| DatabaseError::SerializationError(format!("Failed to deserialize metadata: {}", e)))?;

                Ok(TrainingDataset {
                    id: row.try_get("id").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
                    name: row.try_get("name").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
                    description: row.try_get("description").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
                    features: row.try_get("features").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
                    target: row.try_get("target").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
                    size: row.try_get::<_, i64>("size").map_err(|e| DatabaseError::SerializationError(e.to_string()))? as u64,
                    created_at: row.try_get("created_at").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
                    updated_at: row.try_get("updated_at").map_err(|e| DatabaseError::SerializationError(e.to_string()))?,
                    metadata: metadata_map,
                })
            },
            None => Err(DatabaseError::NotFound(format!("Training dataset {} not found", dataset_id))),
        }
    }

    async fn save_experiment(&self, experiment: &MLExperiment) -> DatabaseResult<String> {
        let conn = self.get_connection().await?;
        
        let parameters_json = serde_json::to_value(&experiment.parameters)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize parameters: {}", e)))?;
        let metrics_json = serde_json::to_value(&experiment.metrics)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize metrics: {}", e)))?;

        let status_str = match experiment.status {
            super::interfaces::ExperimentStatus::Running => "running",
            super::interfaces::ExperimentStatus::Completed => "completed",
            super::interfaces::ExperimentStatus::Failed => "failed",
            super::interfaces::ExperimentStatus::Cancelled => "cancelled",
        };

        conn.execute(r#"
            INSERT INTO ml_core.experiments (
                id, name, model_id, dataset_id, parameters, metrics, status,
                start_time, end_time, notes, tags
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                parameters = EXCLUDED.parameters,
                metrics = EXCLUDED.metrics,
                status = EXCLUDED.status,
                end_time = EXCLUDED.end_time,
                notes = EXCLUDED.notes,
                tags = EXCLUDED.tags
        "#, &[
            &experiment.id,
            &experiment.name,
            &experiment.model_id,
            &experiment.dataset_id,
            &parameters_json,
            &metrics_json,
            &status_str,
            &experiment.start_time,
            &experiment.end_time,
            &experiment.notes,
            &experiment.tags,
        ]).await.map_err(|e| DatabaseError::QueryFailed(format!("Failed to save experiment: {}", e)))?;

        Ok(experiment.id.clone())
    }

    async fn get_experiments(&self, _filters: Option<ExperimentFilters>) -> DatabaseResult<Vec<MLExperiment>> {
        // Placeholder implementation for brevity - would implement full filtering in production
        Ok(Vec::new())
    }
}