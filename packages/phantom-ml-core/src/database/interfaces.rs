//! Database interfaces for phantom-ml-core
//! 
//! Provides trait definitions for database persistence layers supporting
//! PostgreSQL, MongoDB, Redis, and Elasticsearch backends.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use async_trait::async_trait;
use crate::{MLModel, InferenceResult, TrainingResult};

/// Configuration for database connections
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub database_type: DatabaseType,
    pub connection_string: String,
    pub pool_size: Option<u32>,
    pub timeout_seconds: Option<u64>,
    pub retry_attempts: Option<u32>,
    pub ssl_enabled: Option<bool>,
}

/// Supported database types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DatabaseType {
    InMemory,      // Default fallback
    PostgreSQL,    // Structured model metadata and analytics
    MongoDB,       // Document-based ML data and experiments
    Redis,         // Caching and real-time data
    Elasticsearch, // Search, indexing, and analytics
}

/// Result type for database operations
pub type DatabaseResult<T> = Result<T, DatabaseError>;

/// Database operation errors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DatabaseError {
    ConnectionFailed(String),
    QueryFailed(String),
    SerializationError(String),
    NotFound(String),
    DuplicateEntry(String),
    ValidationError(String),
    ConfigurationError(String),
    TimeoutError(String),
}

impl std::fmt::Display for DatabaseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DatabaseError::ConnectionFailed(msg) => write!(f, "Connection failed: {}", msg),
            DatabaseError::QueryFailed(msg) => write!(f, "Query failed: {}", msg),
            DatabaseError::SerializationError(msg) => write!(f, "Serialization error: {}", msg),
            DatabaseError::NotFound(msg) => write!(f, "Not found: {}", msg),
            DatabaseError::DuplicateEntry(msg) => write!(f, "Duplicate entry: {}", msg),
            DatabaseError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
            DatabaseError::ConfigurationError(msg) => write!(f, "Configuration error: {}", msg),
            DatabaseError::TimeoutError(msg) => write!(f, "Timeout error: {}", msg),
        }
    }
}

impl std::error::Error for DatabaseError {}

/// Model storage operations
#[async_trait]
pub trait ModelStorage: Send + Sync {
    /// Save a model to the database
    async fn save_model(&self, model: &MLModel) -> DatabaseResult<String>;
    
    /// Load a model from the database
    async fn load_model(&self, model_id: &str) -> DatabaseResult<MLModel>;
    
    /// Update an existing model
    async fn update_model(&self, model: &MLModel) -> DatabaseResult<()>;
    
    /// Delete a model from the database
    async fn delete_model(&self, model_id: &str) -> DatabaseResult<()>;
    
    /// List all models with optional filters
    async fn list_models(&self, filters: Option<ModelFilters>) -> DatabaseResult<Vec<MLModel>>;
    
    /// Check if a model exists
    async fn model_exists(&self, model_id: &str) -> DatabaseResult<bool>;
    
    /// Save model weights (binary data)
    async fn save_model_weights(&self, model_id: &str, weights: &[f64]) -> DatabaseResult<()>;
    
    /// Load model weights
    async fn load_model_weights(&self, model_id: &str) -> DatabaseResult<Vec<f64>>;
}

/// Inference history and analytics
#[async_trait]
pub trait InferenceStorage: Send + Sync {
    /// Save inference result
    async fn save_inference(&self, result: &InferenceResult) -> DatabaseResult<String>;
    
    /// Get inference history for a model
    async fn get_inference_history(&self, model_id: &str, limit: Option<u32>) -> DatabaseResult<Vec<InferenceResult>>;
    
    /// Get inference analytics
    async fn get_inference_analytics(&self, model_id: &str, filters: Option<AnalyticsFilters>) -> DatabaseResult<InferenceAnalytics>;
    
    /// Search inferences by criteria
    async fn search_inferences(&self, criteria: SearchCriteria) -> DatabaseResult<Vec<InferenceResult>>;
}

/// Training data and experiment tracking
#[async_trait]
pub trait TrainingStorage: Send + Sync {
    /// Save training result
    async fn save_training_result(&self, result: &TrainingResult) -> DatabaseResult<String>;
    
    /// Get training history for a model
    async fn get_training_history(&self, model_id: &str, limit: Option<u32>) -> DatabaseResult<Vec<TrainingResult>>;
    
    /// Save training dataset metadata
    async fn save_training_dataset(&self, dataset: &TrainingDataset) -> DatabaseResult<String>;
    
    /// Load training dataset
    async fn load_training_dataset(&self, dataset_id: &str) -> DatabaseResult<TrainingDataset>;
    
    /// Track experiment metrics
    async fn save_experiment(&self, experiment: &MLExperiment) -> DatabaseResult<String>;
    
    /// Get experiment results
    async fn get_experiments(&self, filters: Option<ExperimentFilters>) -> DatabaseResult<Vec<MLExperiment>>;
}

/// Caching operations for high-performance access
#[async_trait]
pub trait CacheStorage: Send + Sync {
    /// Cache a value with TTL
    async fn set<T: Serialize + Send>(&self, key: &str, value: &T, ttl_seconds: Option<u64>) -> DatabaseResult<()>;
    
    /// Get cached value
    async fn get<T: for<'de> Deserialize<'de>>(&self, key: &str) -> DatabaseResult<Option<T>>;
    
    /// Delete cached value
    async fn delete(&self, key: &str) -> DatabaseResult<()>;
    
    /// Check if key exists
    async fn exists(&self, key: &str) -> DatabaseResult<bool>;
    
    /// Set expiration time
    async fn expire(&self, key: &str, ttl_seconds: u64) -> DatabaseResult<()>;
    
    /// Get multiple keys
    async fn mget(&self, keys: &[String]) -> DatabaseResult<Vec<Option<String>>>;
    
    /// Set multiple key-value pairs
    async fn mset(&self, pairs: &[(String, String)]) -> DatabaseResult<()>;
}

/// Search and analytics operations
#[async_trait]
pub trait SearchStorage: Send + Sync {
    /// Index a document for search
    async fn index_document(&self, index: &str, id: &str, document: &serde_json::Value) -> DatabaseResult<()>;
    
    /// Search documents
    async fn search(&self, query: &SearchQuery) -> DatabaseResult<SearchResults>;
    
    /// Create search index
    async fn create_index(&self, index: &str, mapping: Option<&serde_json::Value>) -> DatabaseResult<()>;
    
    /// Delete index
    async fn delete_index(&self, index: &str) -> DatabaseResult<()>;
    
    /// Aggregate data
    async fn aggregate(&self, aggregation_query: &AggregationQuery) -> DatabaseResult<AggregationResults>;
    
    /// Get document by ID
    async fn get_document(&self, index: &str, id: &str) -> DatabaseResult<Option<serde_json::Value>>;
    
    /// Bulk index documents
    async fn bulk_index(&self, operations: &[BulkOperation]) -> DatabaseResult<BulkResults>;
}

/// Filter options for model queries
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelFilters {
    pub model_type: Option<String>,
    pub algorithm: Option<String>,
    pub status: Option<String>,
    pub min_accuracy: Option<f64>,
    pub created_after: Option<chrono::DateTime<chrono::Utc>>,
    pub created_before: Option<chrono::DateTime<chrono::Utc>>,
    pub tags: Option<Vec<String>>,
}

/// Analytics filter options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyticsFilters {
    pub start_date: Option<chrono::DateTime<chrono::Utc>>,
    pub end_date: Option<chrono::DateTime<chrono::Utc>>,
    pub confidence_threshold: Option<f64>,
    pub group_by: Option<String>,
    pub aggregation_type: Option<AggregationType>,
}

/// Aggregation types for analytics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AggregationType {
    Count,
    Average,
    Sum,
    Min,
    Max,
    Histogram,
    Percentiles,
}

/// Search criteria for inference queries
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchCriteria {
    pub model_id: Option<String>,
    pub prediction_type: Option<String>,
    pub confidence_range: Option<(f64, f64)>,
    pub date_range: Option<(chrono::DateTime<chrono::Utc>, chrono::DateTime<chrono::Utc>)>,
    pub features: Option<HashMap<String, serde_json::Value>>,
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

/// Training dataset metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingDataset {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub features: Vec<String>,
    pub target: String,
    pub size: u64,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub metadata: HashMap<String, serde_json::Value>,
}

/// ML Experiment tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MLExperiment {
    pub id: String,
    pub name: String,
    pub model_id: String,
    pub dataset_id: String,
    pub parameters: HashMap<String, serde_json::Value>,
    pub metrics: HashMap<String, f64>,
    pub status: ExperimentStatus,
    pub start_time: chrono::DateTime<chrono::Utc>,
    pub end_time: Option<chrono::DateTime<chrono::Utc>>,
    pub notes: Option<String>,
    pub tags: Vec<String>,
}

/// Experiment status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExperimentStatus {
    Running,
    Completed,
    Failed,
    Cancelled,
}

/// Experiment filter options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExperimentFilters {
    pub model_id: Option<String>,
    pub status: Option<ExperimentStatus>,
    pub start_date: Option<chrono::DateTime<chrono::Utc>>,
    pub end_date: Option<chrono::DateTime<chrono::Utc>>,
    pub tags: Option<Vec<String>>,
}

/// Inference analytics results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InferenceAnalytics {
    pub total_inferences: u64,
    pub average_confidence: f64,
    pub confidence_distribution: HashMap<String, u64>,
    pub prediction_distribution: HashMap<String, u64>,
    pub accuracy_over_time: Vec<TimeSeriesPoint>,
    pub performance_metrics: HashMap<String, f64>,
}

/// Time series data point
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeSeriesPoint {
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub value: f64,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

/// Search query structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchQuery {
    pub index: String,
    pub query: serde_json::Value,
    pub size: Option<u32>,
    pub from: Option<u32>,
    pub sort: Option<Vec<SortField>>,
    pub highlight: Option<HighlightConfig>,
}

/// Sort field configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SortField {
    pub field: String,
    pub order: SortOrder,
}

/// Sort order
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SortOrder {
    Asc,
    Desc,
}

/// Highlight configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HighlightConfig {
    pub fields: Vec<String>,
    pub fragment_size: Option<u32>,
    pub number_of_fragments: Option<u32>,
}

/// Search results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResults {
    pub total: u64,
    pub hits: Vec<SearchHit>,
    pub took: u64,
    pub timed_out: bool,
}

/// Individual search hit
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchHit {
    pub id: String,
    pub score: f64,
    pub source: serde_json::Value,
    pub highlight: Option<HashMap<String, Vec<String>>>,
}

/// Aggregation query
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AggregationQuery {
    pub index: String,
    pub aggregations: HashMap<String, serde_json::Value>,
    pub query: Option<serde_json::Value>,
}

/// Aggregation results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AggregationResults {
    pub aggregations: HashMap<String, serde_json::Value>,
    pub took: u64,
}

/// Bulk operation for batch processing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BulkOperation {
    Index {
        index: String,
        id: String,
        document: serde_json::Value,
    },
    Update {
        index: String,
        id: String,
        document: serde_json::Value,
    },
    Delete {
        index: String,
        id: String,
    },
}

/// Bulk operation results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BulkResults {
    pub took: u64,
    pub errors: bool,
    pub items: Vec<BulkItemResult>,
}

/// Individual bulk item result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BulkItemResult {
    pub operation: String,
    pub id: String,
    pub status: u16,
    pub error: Option<String>,
}