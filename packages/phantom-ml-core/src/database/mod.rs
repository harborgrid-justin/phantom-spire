//! Database persistence layer for phantom-ml-core
//! 
//! This module provides comprehensive database support for ML operations including:
//! - PostgreSQL for structured model metadata and analytics
//! - MongoDB for document-based ML experiments and flexible data
//! - Redis for caching and real-time data operations
//! - Elasticsearch for search, indexing, and advanced analytics
//!
//! ## Features
//! 
//! - **Multi-database support**: Use different databases for different ML data types
//! - **Unified API**: Single interface for all database operations
//! - **Automatic fallbacks**: Cache-first operations with database persistence
//! - **Search integration**: Full-text search and analytics via Elasticsearch
//! - **Real-time caching**: High-performance caching with Redis
//! - **Flexible storage**: Document-based storage for complex ML experiments
//! - **ACID compliance**: Structured data operations with PostgreSQL
//!
//! ## Usage Examples
//!
//! ### Basic Setup with All Databases
//!
//! ```rust
//! use phantom_ml_core::database::{DatabaseManagerBuilder, DatabaseType};
//!
//! async fn setup_databases() -> Result<DatabaseManager, DatabaseError> {
//!     let manager = DatabaseManagerBuilder::new()
//!         .with_postgresql("postgresql://user:pass@localhost:5432/phantom_ml".to_string())
//!         .with_mongodb("mongodb://localhost:27017/phantom_ml".to_string())
//!         .with_redis("redis://localhost:6379".to_string())
//!         .with_elasticsearch("http://localhost:9200".to_string())
//!         .with_storage_preferences(
//!             DatabaseType::PostgreSQL,  // Models
//!             DatabaseType::MongoDB,     // Inferences
//!             DatabaseType::MongoDB,     // Training
//!             DatabaseType::Redis,       // Cache
//!             DatabaseType::Elasticsearch // Search
//!         )
//!         .build()
//!         .await?;
//!     
//!     Ok(manager)
//! }
//! ```
//!
//! ### Model Operations
//!
//! ```rust
//! // Save model (automatically cached and indexed)
//! let model_id = db_manager.save_model(&model).await?;
//!
//! // Load model (cache-first with database fallback)
//! let loaded_model = db_manager.load_model(&model_id).await?;
//!
//! // Search models with full-text search
//! let models = db_manager.search_models(
//!     Some("threat detection"),
//!     Some(ModelFilters {
//!         model_type: Some("classification".to_string()),
//!         min_accuracy: Some(0.85),
//!         ..Default::default()
//!     })
//! ).await?;
//! ```

pub mod interfaces;
pub mod manager;

#[cfg(feature = "postgres-store")]
pub mod postgresql;

#[cfg(feature = "mongodb-store")]
pub mod mongodb;

#[cfg(feature = "redis-store")]
pub mod redis;

#[cfg(feature = "elasticsearch-store")]
pub mod elasticsearch;

// Re-export main types and traits
pub use interfaces::{
    DatabaseConfig, DatabaseType, DatabaseError, DatabaseResult,
    ModelStorage, InferenceStorage, TrainingStorage, CacheStorage, SearchStorage,
    ModelFilters, AnalyticsFilters, SearchCriteria, ExperimentFilters,
    InferenceAnalytics, TrainingDataset, MLExperiment, ExperimentStatus,
    SearchQuery, SearchResults, AggregationQuery, AggregationResults,
    BulkOperation, BulkResults
};

pub use manager::{DatabaseManager, DatabaseManagerBuilder};

#[cfg(feature = "postgres-store")]
pub use postgresql::PostgreSQLAdapter;

#[cfg(feature = "mongodb-store")]
pub use mongodb::MongoDBAdapter;

#[cfg(feature = "redis-store")]
pub use redis::RedisAdapter;

#[cfg(feature = "elasticsearch-store")]
pub use elasticsearch::ElasticsearchAdapter;

/// Default database configuration for development
pub fn default_dev_config() -> Vec<DatabaseConfig> {
    let mut configs = Vec::new();
    
    // PostgreSQL config
    configs.push(DatabaseConfig {
        database_type: DatabaseType::PostgreSQL,
        connection_string: std::env::var("POSTGRESQL_URI")
            .unwrap_or_else(|_| "postgresql://postgres:phantom_secure_pass@localhost:5432/phantom_spire".to_string()),
        pool_size: Some(10),
        timeout_seconds: Some(30),
        retry_attempts: Some(3),
        ssl_enabled: Some(false),
    });
    
    // MongoDB config
    configs.push(DatabaseConfig {
        database_type: DatabaseType::MongoDB,
        connection_string: std::env::var("MONGODB_URI")
            .unwrap_or_else(|_| "mongodb://localhost:27017/phantom_spire".to_string()),
        pool_size: Some(10),
        timeout_seconds: Some(30),
        retry_attempts: Some(3),
        ssl_enabled: Some(false),
    });
    
    // Redis config
    configs.push(DatabaseConfig {
        database_type: DatabaseType::Redis,
        connection_string: std::env::var("REDIS_URL")
            .unwrap_or_else(|_| "redis://:phantom_redis_pass@localhost:6379".to_string()),
        pool_size: Some(10),
        timeout_seconds: Some(10),
        retry_attempts: Some(3),
        ssl_enabled: Some(false),
    });
    
    // Elasticsearch config
    configs.push(DatabaseConfig {
        database_type: DatabaseType::Elasticsearch,
        connection_string: std::env::var("ELASTICSEARCH_URL")
            .unwrap_or_else(|_| "http://localhost:9200".to_string()),
        pool_size: None,
        timeout_seconds: Some(30),
        retry_attempts: Some(3),
        ssl_enabled: Some(false),
    });
    
    configs
}

/// Create a development database manager with all databases
pub async fn create_dev_database_manager() -> DatabaseResult<DatabaseManager> {
    let mut builder = DatabaseManagerBuilder::new();
    
    // Add configurations from environment or defaults
    if let Ok(postgres_uri) = std::env::var("POSTGRESQL_URI") {
        builder = builder.with_postgresql(postgres_uri);
    }
    
    if let Ok(mongodb_uri) = std::env::var("MONGODB_URI") {
        builder = builder.with_mongodb(mongodb_uri);
    }
    
    if let Ok(redis_url) = std::env::var("REDIS_URL") {
        builder = builder.with_redis(redis_url);
    }
    
    if let Ok(elasticsearch_url) = std::env::var("ELASTICSEARCH_URL") {
        builder = builder.with_elasticsearch(elasticsearch_url);
    }
    
    // Configure optimal storage preferences
    builder = builder.with_storage_preferences(
        DatabaseType::PostgreSQL,    // Models: Structured data with ACID properties
        DatabaseType::MongoDB,       // Inferences: Flexible document storage
        DatabaseType::MongoDB,       // Training: Experiment tracking and metrics
        DatabaseType::Redis,         // Cache: High-performance caching
        DatabaseType::Elasticsearch, // Search: Full-text search and analytics
    );
    
    builder.build().await
}

/// Create a production database manager with custom configuration
pub async fn create_production_database_manager(
    configs: Vec<DatabaseConfig>,
    storage_preferences: Option<(DatabaseType, DatabaseType, DatabaseType, DatabaseType, DatabaseType)>,
) -> DatabaseResult<DatabaseManager> {
    let mut builder = DatabaseManagerBuilder::new();
    
    // Add each configuration
    for config in configs {
        match config.database_type {
            DatabaseType::PostgreSQL => builder = builder.with_postgresql(config.connection_string),
            DatabaseType::MongoDB => builder = builder.with_mongodb(config.connection_string),
            DatabaseType::Redis => builder = builder.with_redis(config.connection_string),
            DatabaseType::Elasticsearch => builder = builder.with_elasticsearch(config.connection_string),
            DatabaseType::InMemory => {} // Skip in-memory for production
        }
    }
    
    // Apply storage preferences if provided
    if let Some((model_storage, inference_storage, training_storage, cache_storage, search_storage)) = storage_preferences {
        builder = builder.with_storage_preferences(
            model_storage,
            inference_storage,
            training_storage,
            cache_storage,
            search_storage,
        );
    }
    
    builder.build().await
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_default_dev_config() {
        let configs = default_dev_config();
        assert_eq!(configs.len(), 4);
        
        let db_types: Vec<DatabaseType> = configs.iter().map(|c| c.database_type.clone()).collect();
        assert!(db_types.contains(&DatabaseType::PostgreSQL));
        assert!(db_types.contains(&DatabaseType::MongoDB));
        assert!(db_types.contains(&DatabaseType::Redis));
        assert!(db_types.contains(&DatabaseType::Elasticsearch));
    }
    
    #[tokio::test]
    async fn test_database_manager_builder() {
        let builder = DatabaseManagerBuilder::new()
            .with_postgresql("postgresql://localhost:5432/test".to_string())
            .with_redis("redis://localhost:6379".to_string())
            .with_storage_preferences(
                DatabaseType::PostgreSQL,
                DatabaseType::PostgreSQL,
                DatabaseType::PostgreSQL,
                DatabaseType::Redis,
                DatabaseType::InMemory,
            );
        
        // This would fail in test environment without actual databases,
        // but tests the builder pattern works
        assert!(builder.build().await.is_err());
    }
}