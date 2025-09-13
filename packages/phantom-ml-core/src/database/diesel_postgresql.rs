//! Diesel-based PostgreSQL adapter for phantom-ml-core
//!
//! Provides Diesel ORM-based persistence for ML models, metadata, and structured analytics.
//! Alternative to the tokio-postgres implementation with compile-time query safety.

use async_trait::async_trait;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde_json;
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;

use super::interfaces::{
    ModelStorage, InferenceStorage, TrainingStorage,
    DatabaseConfig, DatabaseError, DatabaseResult,
    MLModel, InferenceResult, TrainingResult, TrainingDataset, MLExperiment,
    ModelFilters, AnalyticsFilters, SearchCriteria, ExperimentFilters,
    InferenceAnalytics, TimeSeriesPoint
};

// Diesel schema definitions
table! {
    ml_core.models (id) {
        id -> VarChar,
        name -> VarChar,
        model_type -> VarChar,
        algorithm -> VarChar,
        version -> VarChar,
        accuracy -> Nullable<Double>,
        precision_score -> Nullable<Double>,
        recall_score -> Nullable<Double>,
        f1_score -> Nullable<Double>,
        created_at -> Timestamp,
        last_trained -> Timestamp,
        last_used -> Timestamp,
        training_samples -> Nullable<BigInt>,
        feature_count -> Nullable<Integer>,
        status -> VarChar,
        performance_metrics -> Nullable<Jsonb>,
        tags -> Nullable<Array<Text>>,
        metadata -> Nullable<Jsonb>,
    }
}

table! {
    ml_core.model_weights (model_id) {
        model_id -> VarChar,
        weights -> Bytea,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    ml_core.inferences (id) {
        id -> Serial,
        model_id -> VarChar,
        prediction -> Jsonb,
        confidence -> Double,
        probability_distribution -> Array<Double>,
        feature_importance -> Nullable<Jsonb>,
        inference_time_ms -> BigInt,
        timestamp -> Timestamp,
        input_features -> Nullable<Jsonb>,
        metadata -> Nullable<Jsonb>,
    }
}

table! {
    ml_core.training_results (id) {
        id -> Serial,
        model_id -> VarChar,
        training_accuracy -> Double,
        validation_accuracy -> Double,
        training_loss -> Double,
        validation_loss -> Double,
        epochs_completed -> Integer,
        training_time_ms -> BigInt,
        convergence_achieved -> Bool,
        timestamp -> Timestamp,
        hyperparameters -> Nullable<Jsonb>,
        metrics -> Nullable<Jsonb>,
    }
}

table! {
    ml_core.training_datasets (id) {
        id -> VarChar,
        name -> VarChar,
        description -> Nullable<Text>,
        features -> Array<Text>,
        target -> VarChar,
        size -> BigInt,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        metadata -> Nullable<Jsonb>,
    }
}

table! {
    ml_core.experiments (id) {
        id -> VarChar,
        name -> VarChar,
        model_id -> VarChar,
        dataset_id -> VarChar,
        parameters -> Jsonb,
        metrics -> Jsonb,
        status -> VarChar,
        start_time -> Timestamp,
        end_time -> Nullable<Timestamp>,
        notes -> Nullable<Text>,
        tags -> Array<Text>,
    }
}

// Insertable structs for Diesel
#[derive(Insertable)]
#[diesel(table_name = ml_core::models)]
struct NewModel<'a> {
    pub id: &'a str,
    pub name: &'a str,
    pub model_type: &'a str,
    pub algorithm: &'a str,
    pub version: &'a str,
    pub accuracy: Option<f64>,
    pub precision_score: Option<f64>,
    pub recall_score: Option<f64>,
    pub f1_score: Option<f64>,
    pub created_at: DateTime<Utc>,
    pub last_trained: DateTime<Utc>,
    pub last_used: DateTime<Utc>,
    pub training_samples: Option<i64>,
    pub feature_count: Option<i32>,
    pub status: &'a str,
    pub performance_metrics: Option<serde_json::Value>,
    pub tags: Option<Vec<String>>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Queryable, Identifiable)]
#[diesel(table_name = ml_core::models)]
struct ModelRow {
    pub id: String,
    pub name: String,
    pub model_type: String,
    pub algorithm: String,
    pub version: String,
    pub accuracy: Option<f64>,
    pub precision_score: Option<f64>,
    pub recall_score: Option<f64>,
    pub f1_score: Option<f64>,
    pub created_at: DateTime<Utc>,
    pub last_trained: DateTime<Utc>,
    pub last_used: DateTime<Utc>,
    pub training_samples: Option<i64>,
    pub feature_count: Option<i32>,
    pub status: String,
    pub performance_metrics: Option<serde_json::Value>,
    pub tags: Option<Vec<String>>,
    pub metadata: Option<serde_json::Value>,
}

/// Diesel-based PostgreSQL adapter for structured ML data storage
#[derive(Clone)]
pub struct DieselPostgreSQLAdapter {
    database_url: String,
}

impl DieselPostgreSQLAdapter {
    /// Create a new Diesel PostgreSQL adapter
    pub fn new(config: DatabaseConfig) -> DatabaseResult<Self> {
        Ok(Self {
            database_url: config.connection_string,
        })
    }

    /// Get a database connection
    async fn get_connection(&self) -> DatabaseResult<diesel_async::AsyncPgConnection> {
        diesel_async::AsyncPgConnection::establish(&self.database_url)
            .await
            .map_err(|e| DatabaseError::ConnectionFailed(format!("Failed to connect to database: {}", e)))
    }

    /// Initialize database schema for ML components
    pub async fn initialize_schema(&self) -> DatabaseResult<()> {
        let mut conn = self.get_connection().await?;

        // Create schema
        diesel::sql_query("CREATE SCHEMA IF NOT EXISTS ml_core")
            .execute(&mut conn)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create schema: {}", e)))?;

        // Models table
        diesel::sql_query(r#"
            CREATE TABLE IF NOT EXISTS ml_core.models (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                model_type VARCHAR(100) NOT NULL,
                algorithm VARCHAR(100) NOT NULL,
                version VARCHAR(50) NOT NULL,
                accuracy DECIMAL(5,4),
                precision_score DECIMAL(5,4),
                recall_score DECIMAL(5,4),
                f1_score DECIMAL(5,4),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                last_trained TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                training_samples BIGINT,
                feature_count INTEGER,
                status VARCHAR(50) DEFAULT 'created',
                performance_metrics JSONB,
                tags TEXT[],
                metadata JSONB
            )
        "#).execute(&mut conn).await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create models table: {}", e)))?;

        // Model weights table
        diesel::sql_query(r#"
            CREATE TABLE IF NOT EXISTS ml_core.model_weights (
                model_id VARCHAR(255) PRIMARY KEY REFERENCES ml_core.models(id) ON DELETE CASCADE,
                weights BYTEA NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        "#).execute(&mut conn).await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create weights table: {}", e)))?;

        // Inferences table
        diesel::sql_query(r#"
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
        "#).execute(&mut conn).await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create inferences table: {}", e)))?;

        // Training results table
        diesel::sql_query(r#"
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
        "#).execute(&mut conn).await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create training results table: {}", e)))?;

        // Training datasets table
        diesel::sql_query(r#"
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
        "#).execute(&mut conn).await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create datasets table: {}", e)))?;

        // ML experiments table
        diesel::sql_query(r#"
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
        "#).execute(&mut conn).await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create experiments table: {}", e)))?;

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
            diesel::sql_query(index).execute(&mut conn).await
                .map_err(|e| DatabaseError::QueryFailed(format!("Failed to create index: {}", e)))?;
        }

        Ok(())
    }

    /// Convert database row to MLModel
    fn row_to_model(&self, row: &ModelRow) -> DatabaseResult<MLModel> {
        let performance_metrics = row.performance_metrics.clone()
            .and_then(|v| serde_json::from_value(v).ok())
            .unwrap_or_default();

        Ok(MLModel {
            id: row.id.clone(),
            name: row.name.clone(),
            model_type: row.model_type.clone(),
            algorithm: row.algorithm.clone(),
            version: row.version.clone(),
            accuracy: row.accuracy.unwrap_or(0.0),
            precision: row.precision_score.unwrap_or(0.0),
            recall: row.recall_score.unwrap_or(0.0),
            f1_score: row.f1_score.unwrap_or(0.0),
            created_at: row.created_at,
            last_trained: row.last_trained,
            last_used: row.last_used,
            training_samples: row.training_samples.unwrap_or(0) as u64,
            feature_count: row.feature_count.unwrap_or(0) as u32,
            status: row.status.clone(),
            performance_metrics,
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
impl ModelStorage for DieselPostgreSQLAdapter {
    async fn save_model(&self, model: &MLModel) -> DatabaseResult<String> {
        let mut conn = self.get_connection().await?;

        let performance_metrics_json = serde_json::to_value(&model.performance_metrics)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize performance metrics: {}", e)))?;

        let new_model = NewModel {
            id: &model.id,
            name: &model.name,
            model_type: &model.model_type,
            algorithm: &model.algorithm,
            version: &model.version,
            accuracy: Some(model.accuracy),
            precision_score: Some(model.precision),
            recall_score: Some(model.recall),
            f1_score: Some(model.f1_score),
            created_at: model.created_at,
            last_trained: model.last_trained,
            last_used: model.last_used,
            training_samples: Some(model.training_samples as i64),
            feature_count: Some(model.feature_count as i32),
            status: &model.status,
            performance_metrics: Some(performance_metrics_json),
            tags: None,
            metadata: None,
        };

        diesel::insert_into(ml_core::models::table)
            .values(&new_model)
            .on_conflict(ml_core::models::id)
            .do_update()
            .set((
                ml_core::models::name.eq(&new_model.name),
                ml_core::models::model_type.eq(&new_model.model_type),
                ml_core::models::algorithm.eq(&new_model.algorithm),
                ml_core::models::version.eq(&new_model.version),
                ml_core::models::accuracy.eq(&new_model.accuracy),
                ml_core::models::precision_score.eq(&new_model.precision_score),
                ml_core::models::recall_score.eq(&new_model.recall_score),
                ml_core::models::f1_score.eq(&new_model.f1_score),
                ml_core::models::last_trained.eq(&new_model.last_trained),
                ml_core::models::last_used.eq(&new_model.last_used),
                ml_core::models::training_samples.eq(&new_model.training_samples),
                ml_core::models::feature_count.eq(&new_model.feature_count),
                ml_core::models::status.eq(&new_model.status),
                ml_core::models::performance_metrics.eq(&new_model.performance_metrics),
            ))
            .execute(&mut conn)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to save model: {}", e)))?;

        Ok(model.id.clone())
    }

    async fn load_model(&self, model_id: &str) -> DatabaseResult<MLModel> {
        let mut conn = self.get_connection().await?;

        let row = ml_core::models::table
            .find(model_id)
            .first::<ModelRow>(&mut conn)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to load model: {}", e)))?;

        self.row_to_model(&row)
    }

    async fn update_model(&self, model: &MLModel) -> DatabaseResult<()> {
        self.save_model(model).await?;
        Ok(())
    }

    async fn delete_model(&self, model_id: &str) -> DatabaseResult<()> {
        let mut conn = self.get_connection().await?;

        let rows_affected = diesel::delete(ml_core::models::table.find(model_id))
            .execute(&mut conn)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to delete model: {}", e)))?;

        if rows_affected == 0 {
            return Err(DatabaseError::NotFound(format!("Model {} not found", model_id)));
        }

        Ok(())
    }

    async fn list_models(&self, filters: Option<ModelFilters>) -> DatabaseResult<Vec<MLModel>> {
        let mut conn = self.get_connection().await?;

        let mut query = ml_core::models::table.into_boxed();

        if let Some(filters) = filters {
            if let Some(model_type) = filters.model_type {
                query = query.filter(ml_core::models::model_type.eq(model_type));
            }

            if let Some(algorithm) = filters.algorithm {
                query = query.filter(ml_core::models::algorithm.eq(algorithm));
            }

            if let Some(status) = filters.status {
                query = query.filter(ml_core::models::status.eq(status));
            }

            if let Some(min_accuracy) = filters.min_accuracy {
                query = query.filter(ml_core::models::accuracy.ge(min_accuracy));
            }

            if let Some(created_after) = filters.created_after {
                query = query.filter(ml_core::models::created_at.ge(created_after));
            }

            if let Some(created_before) = filters.created_before {
                query = query.filter(ml_core::models::created_at.le(created_before));
            }
        }

        let rows = query
            .order(ml_core::models::created_at.desc())
            .load::<ModelRow>(&mut conn)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to list models: {}", e)))?;

        let mut models = Vec::new();
        for row in rows {
            models.push(self.row_to_model(&row)?);
        }

        Ok(models)
    }

    async fn model_exists(&self, model_id: &str) -> DatabaseResult<bool> {
        let mut conn = self.get_connection().await?;

        let count = ml_core::models::table
            .find(model_id)
            .count()
            .get_result::<i64>(&mut conn)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to check model existence: {}", e)))?;

        Ok(count > 0)
    }

    async fn save_model_weights(&self, model_id: &str, weights: &[f64]) -> DatabaseResult<()> {
        let mut conn = self.get_connection().await?;
        let weights_bytes = self.serialize_weights(weights)?;

        diesel::insert_into(ml_core::model_weights::table)
            .values((
                ml_core::model_weights::model_id.eq(model_id),
                ml_core::model_weights::weights.eq(weights_bytes),
                ml_core::model_weights::updated_at.eq(Utc::now()),
            ))
            .on_conflict(ml_core::model_weights::model_id)
            .do_update()
            .set((
                ml_core::model_weights::weights.eq(weights_bytes),
                ml_core::model_weights::updated_at.eq(Utc::now()),
            ))
            .execute(&mut conn)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to save model weights: {}", e)))?;

        Ok(())
    }

    async fn load_model_weights(&self, model_id: &str) -> DatabaseResult<Vec<f64>> {
        let mut conn = self.get_connection().await?;

        let row: (String, Vec<u8>, DateTime<Utc>, DateTime<Utc>) = ml_core::model_weights::table
            .find(model_id)
            .select((ml_core::model_weights::model_id, ml_core::model_weights::weights, ml_core::model_weights::created_at, ml_core::model_weights::updated_at))
            .first(&mut conn)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to load model weights: {}", e)))?;

        self.deserialize_weights(&row.1)
    }
}

// Placeholder implementations for other traits - would be fully implemented in production
#[async_trait]
impl InferenceStorage for DieselPostgreSQLAdapter {
    async fn save_inference(&self, _result: &InferenceResult) -> DatabaseResult<String> {
        // Implementation would mirror the tokio-postgres version but using Diesel
        Ok(Uuid::new_v4().to_string())
    }

    async fn get_inference_history(&self, _model_id: &str, _limit: Option<u32>) -> DatabaseResult<Vec<InferenceResult>> {
        Ok(Vec::new())
    }

    async fn get_inference_analytics(&self, _model_id: &str, _filters: Option<AnalyticsFilters>) -> DatabaseResult<InferenceAnalytics> {
        Ok(InferenceAnalytics {
            total_inferences: 0,
            average_confidence: 0.0,
            confidence_distribution: HashMap::new(),
            prediction_distribution: HashMap::new(),
            accuracy_over_time: Vec::new(),
            performance_metrics: HashMap::new(),
        })
    }

    async fn search_inferences(&self, _criteria: SearchCriteria) -> DatabaseResult<Vec<InferenceResult>> {
        Ok(Vec::new())
    }
}

#[async_trait]
impl TrainingStorage for DieselPostgreSQLAdapter {
    async fn save_training_result(&self, _result: &TrainingResult) -> DatabaseResult<String> {
        Ok(Uuid::new_v4().to_string())
    }

    async fn get_training_history(&self, _model_id: &str, _limit: Option<u32>) -> DatabaseResult<Vec<TrainingResult>> {
        Ok(Vec::new())
    }

    async fn save_training_dataset(&self, _dataset: &TrainingDataset) -> DatabaseResult<String> {
        Ok(Uuid::new_v4().to_string())
    }

    async fn load_training_dataset(&self, _dataset_id: &str) -> DatabaseResult<TrainingDataset> {
        Err(DatabaseError::NotFound("Not implemented".to_string()))
    }

    async fn save_experiment(&self, _experiment: &MLExperiment) -> DatabaseResult<String> {
        Ok(Uuid::new_v4().to_string())
    }

    async fn get_experiments(&self, _filters: Option<ExperimentFilters>) -> DatabaseResult<Vec<MLExperiment>> {
        Ok(Vec::new())
    }
}</content>
<parameter name="filePath">c:\phantom-spire\packages\phantom-ml-core\src\database\diesel_postgresql.rs