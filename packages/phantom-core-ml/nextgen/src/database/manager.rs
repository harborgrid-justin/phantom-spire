//! Database manager for phantom-ml-core
//! 
//! Orchestrates multiple database adapters and provides a unified interface for ML data operations.

use std::collections::HashMap;
use serde_json;

use super::interfaces::{
    DatabaseConfig, DatabaseType, DatabaseError, DatabaseResult,
    ModelStorage, InferenceStorage, TrainingStorage, SearchStorage,
    ModelFilters, AnalyticsFilters, InferenceAnalytics,
};
use crate::{MLModel, InferenceResult, TrainingResult};

#[cfg(feature = "postgres-store")]
use super::postgresql::PostgreSQLAdapter;

#[cfg(feature = "mongodb-store")]
use super::mongodb::MongoDBAdapter;

#[cfg(feature = "redis-store")]
use super::redis::RedisAdapter;

#[cfg(feature = "elasticsearch-store")]
use super::elasticsearch::ElasticsearchAdapter;

/// Multi-database manager for ML data operations
pub struct DatabaseManager {
    configs: HashMap<DatabaseType, DatabaseConfig>,
    
    // Storage adapters
    #[cfg(feature = "postgres-store")]
    postgres_adapter: Option<Arc<PostgreSQLAdapter>>,
    
    #[cfg(feature = "mongodb-store")]
    mongodb_adapter: Option<Arc<MongoDBAdapter>>,
    
    #[cfg(feature = "redis-store")]
    redis_adapter: Option<Arc<RedisAdapter>>,
    
    #[cfg(feature = "elasticsearch-store")]
    elasticsearch_adapter: Option<Arc<ElasticsearchAdapter>>,
    
    // Default storage preferences
    primary_model_storage: DatabaseType,
    primary_inference_storage: DatabaseType,
    primary_training_storage: DatabaseType,
    cache_storage: DatabaseType,
    search_storage: DatabaseType,
}

impl DatabaseManager {
    /// Create a new database manager
    pub fn new() -> Self {
        Self {
            configs: HashMap::new(),
            
            #[cfg(feature = "postgres-store")]
            postgres_adapter: None,
            
            #[cfg(feature = "mongodb-store")]
            mongodb_adapter: None,
            
            #[cfg(feature = "redis-store")]
            redis_adapter: None,
            
            #[cfg(feature = "elasticsearch-store")]
            elasticsearch_adapter: None,
            
            // Default preferences - can be configured
            primary_model_storage: DatabaseType::InMemory,
            primary_inference_storage: DatabaseType::InMemory,
            primary_training_storage: DatabaseType::InMemory,
            cache_storage: DatabaseType::InMemory,
            search_storage: DatabaseType::InMemory,
        }
    }

    /// Add a database configuration
    pub fn add_database_config(&mut self, config: DatabaseConfig) {
        self.configs.insert(config.database_type.clone(), config);
    }

    /// Set storage preferences
    pub fn configure_storage_preferences(
        &mut self,
        model_storage: DatabaseType,
        inference_storage: DatabaseType,
        training_storage: DatabaseType,
        cache_storage: DatabaseType,
        search_storage: DatabaseType,
    ) {
        self.primary_model_storage = model_storage;
        self.primary_inference_storage = inference_storage;
        self.primary_training_storage = training_storage;
        self.cache_storage = cache_storage;
        self.search_storage = search_storage;
    }

    /// Initialize all configured database adapters
    pub async fn initialize(&mut self) -> DatabaseResult<()> {
        // Initialize PostgreSQL if configured
        #[cfg(feature = "postgres-store")]
        if let Some(config) = self.configs.get(&DatabaseType::PostgreSQL) {
            match PostgreSQLAdapter::new(config.clone()).await {
                Ok(adapter) => {
                    self.postgres_adapter = Some(Arc::new(adapter));
                    println!("✅ PostgreSQL adapter initialized successfully");
                },
                Err(e) => {
                    println!("⚠️ Failed to initialize PostgreSQL adapter: {}", e);
                    return Err(e);
                }
            }
        }

        // Initialize MongoDB if configured
        #[cfg(feature = "mongodb-store")]
        if let Some(config) = self.configs.get(&DatabaseType::MongoDB) {
            match MongoDBAdapter::new(config.clone()).await {
                Ok(adapter) => {
                    self.mongodb_adapter = Some(Arc::new(adapter));
                    println!("✅ MongoDB adapter initialized successfully");
                },
                Err(e) => {
                    println!("⚠️ Failed to initialize MongoDB adapter: {}", e);
                    return Err(e);
                }
            }
        }

        // Initialize Redis if configured
        #[cfg(feature = "redis-store")]
        if let Some(config) = self.configs.get(&DatabaseType::Redis) {
            match RedisAdapter::new(config.clone()).await {
                Ok(adapter) => {
                    self.redis_adapter = Some(Arc::new(adapter));
                    println!("✅ Redis adapter initialized successfully");
                },
                Err(e) => {
                    println!("⚠️ Failed to initialize Redis adapter: {}", e);
                    return Err(e);
                }
            }
        }

        // Initialize Elasticsearch if configured
        #[cfg(feature = "elasticsearch-store")]
        if let Some(config) = self.configs.get(&DatabaseType::Elasticsearch) {
            match ElasticsearchAdapter::new(config.clone()).await {
                Ok(adapter) => {
                    self.elasticsearch_adapter = Some(Arc::new(adapter));
                    println!("✅ Elasticsearch adapter initialized successfully");
                },
                Err(e) => {
                    println!("⚠️ Failed to initialize Elasticsearch adapter: {}", e);
                    return Err(e);
                }
            }
        }

        Ok(())
    }

    /// Get the appropriate model storage adapter
    fn get_model_storage(&self) -> DatabaseResult<&dyn ModelStorage> {
        match self.primary_model_storage {
            #[cfg(feature = "postgres-store")]
            DatabaseType::PostgreSQL => {
                self.postgres_adapter.as_ref()
                    .map(|a| a.as_ref() as &dyn ModelStorage)
                    .ok_or_else(|| DatabaseError::ConfigurationError("PostgreSQL adapter not initialized".to_string()))
            },
            _ => Err(DatabaseError::ConfigurationError(
                format!("Model storage adapter for {:?} not available", self.primary_model_storage)
            ))
        }
    }

    /// Get the appropriate inference storage adapter
    fn get_inference_storage(&self) -> DatabaseResult<&dyn InferenceStorage> {
        match self.primary_inference_storage {
            #[cfg(feature = "postgres-store")]
            DatabaseType::PostgreSQL => {
                self.postgres_adapter.as_ref()
                    .map(|a| a.as_ref() as &dyn InferenceStorage)
                    .ok_or_else(|| DatabaseError::ConfigurationError("PostgreSQL adapter not initialized".to_string()))
            },
            #[cfg(feature = "mongodb-store")]
            DatabaseType::MongoDB => {
                self.mongodb_adapter.as_ref()
                    .map(|a| a.as_ref() as &dyn InferenceStorage)
                    .ok_or_else(|| DatabaseError::ConfigurationError("MongoDB adapter not initialized".to_string()))
            },
            _ => Err(DatabaseError::ConfigurationError(
                format!("Inference storage adapter for {:?} not available", self.primary_inference_storage)
            ))
        }
    }

    /// Get the appropriate training storage adapter
    fn get_training_storage(&self) -> DatabaseResult<&dyn TrainingStorage> {
        match self.primary_training_storage {
            #[cfg(feature = "postgres-store")]
            DatabaseType::PostgreSQL => {
                self.postgres_adapter.as_ref()
                    .map(|a| a.as_ref() as &dyn TrainingStorage)
                    .ok_or_else(|| DatabaseError::ConfigurationError("PostgreSQL adapter not initialized".to_string()))
            },
            #[cfg(feature = "mongodb-store")]
            DatabaseType::MongoDB => {
                self.mongodb_adapter.as_ref()
                    .map(|a| a.as_ref() as &dyn TrainingStorage)
                    .ok_or_else(|| DatabaseError::ConfigurationError("MongoDB adapter not initialized".to_string()))
            },
            _ => Err(DatabaseError::ConfigurationError(
                format!("Training storage adapter for {:?} not available", self.primary_training_storage)
            ))
        }
    }

    /// Get the search storage adapter
    fn get_search_storage(&self) -> DatabaseResult<&dyn SearchStorage> {
        match self.search_storage {
            #[cfg(feature = "elasticsearch-store")]
            DatabaseType::Elasticsearch => {
                self.elasticsearch_adapter.as_ref()
                    .map(|a| a.as_ref() as &dyn SearchStorage)
                    .ok_or_else(|| DatabaseError::ConfigurationError("Elasticsearch adapter not initialized".to_string()))
            },
            _ => Err(DatabaseError::ConfigurationError(
                format!("Search storage adapter for {:?} not available", self.search_storage)
            ))
        }
    }

    /// Save model with fallback to multiple storage backends
    pub async fn save_model(&self, model: &MLModel) -> DatabaseResult<String> {
        // Try primary storage
        let model_result = self.get_model_storage()?.save_model(model).await;
        
        // If successful, also cache the model if Redis is available
        if model_result.is_ok() {
            #[cfg(feature = "redis-store")]
            if let Some(redis_adapter) = &self.redis_adapter {
                let model_json = serde_json::to_value(model)
                    .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize model for cache: {}", e)))?;
                
                let _ = redis_adapter.cache_model(&model.id, &model_json, Some(3600)).await; // Cache for 1 hour
            }

            // Also index for search if Elasticsearch is available
            #[cfg(feature = "elasticsearch-store")]
            if let Some(es_adapter) = &self.elasticsearch_adapter {
                let model_json = serde_json::to_value(model)
                    .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize model for search: {}", e)))?;
                
                let _ = es_adapter.index_model(&model.id, &model_json).await;
            }
        }

        model_result
    }

    /// Load model with caching
    pub async fn load_model(&self, model_id: &str) -> DatabaseResult<MLModel> {
        // Try cache first if Redis is available
        #[cfg(feature = "redis-store")]
        if let Some(redis_adapter) = &self.redis_adapter {
            if let Ok(Some(cached_model)) = redis_adapter.get_cached_model(model_id).await {
                if let Ok(model) = serde_json::from_value(cached_model) {
                    return Ok(model);
                }
            }
        }

        // Fallback to primary storage
        let model = self.get_model_storage()?.load_model(model_id).await?;

        // Cache the loaded model if Redis is available
        #[cfg(feature = "redis-store")]
        if let Some(redis_adapter) = &self.redis_adapter {
            let model_json = serde_json::to_value(&model)
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize model for cache: {}", e)))?;
            
            let _ = redis_adapter.cache_model(model_id, &model_json, Some(3600)).await;
        }

        Ok(model)
    }

    /// Save inference result to appropriate storage and cache
    pub async fn save_inference(&self, result: &InferenceResult) -> DatabaseResult<String> {
        let inference_id = self.get_inference_storage()?.save_inference(result).await?;

        // Cache recent inference for quick retrieval if Redis is available
        #[cfg(feature = "redis-store")]
        if let Some(redis_adapter) = &self.redis_adapter {
            let _ = redis_adapter.increment_inference_count(&result.model_id).await;
            
            // Add to prediction stream
            let prediction_json = serde_json::to_value(result)
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize inference: {}", e)))?;
            let _ = redis_adapter.stream_prediction(&result.model_id, &prediction_json).await;
        }

        // Index for search and analytics if Elasticsearch is available
        #[cfg(feature = "elasticsearch-store")]
        if let Some(es_adapter) = &self.elasticsearch_adapter {
            let inference_json = serde_json::to_value(result)
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize inference for search: {}", e)))?;
            
            let _ = es_adapter.index_inference(&result.model_id, &inference_json).await;
        }

        Ok(inference_id)
    }

    /// Get inference analytics from multiple sources
    pub async fn get_inference_analytics(&self, model_id: &str, filters: Option<AnalyticsFilters>) -> DatabaseResult<InferenceAnalytics> {
        // Try to get analytics from primary storage
        let analytics = self.get_inference_storage()?.get_inference_analytics(model_id, filters).await?;

        // Enhance with real-time data from Redis if available
        #[cfg(feature = "redis-store")]
        if let Some(redis_adapter) = &self.redis_adapter {
            if let Ok(inference_count) = redis_adapter.get_inference_count(model_id).await {
                // Update total with recent count (this is a simplified approach)
                analytics.total_inferences += inference_count;
            }
        }

        // Add search-based analytics if Elasticsearch is available
        #[cfg(feature = "elasticsearch-store")]
        if let Some(es_adapter) = &self.elasticsearch_adapter {
            if let Ok(es_analytics) = es_adapter.get_inference_analytics(Some(model_id), Some("24h")).await {
                // Could merge additional analytics from Elasticsearch here
            }
        }

        Ok(analytics)
    }

    /// Save training result to appropriate storage
    pub async fn save_training_result(&self, result: &TrainingResult) -> DatabaseResult<String> {
        let training_id = self.get_training_storage()?.save_training_result(result).await?;

        // Index for search if Elasticsearch is available
        #[cfg(feature = "elasticsearch-store")]
        if let Some(es_adapter) = &self.elasticsearch_adapter {
            let training_json = serde_json::to_value(result)
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize training result: {}", e)))?;
            
            let _ = es_adapter.index_training_result(&result.model_id, &training_json).await;
        }

        Ok(training_id)
    }

    /// Search models using Elasticsearch with fallback
    pub async fn search_models(&self, _search_text: Option<&str>, filters: Option<ModelFilters>) -> DatabaseResult<Vec<MLModel>> {
        // Try Elasticsearch first if available
        #[cfg(feature = "elasticsearch-store")]
        if let Some(es_adapter) = &self.elasticsearch_adapter {
            let mut es_filters = HashMap::new();
            
            if let Some(filters) = filters {
                if let Some(model_type) = filters.model_type {
                    es_filters.insert("model_type".to_string(), serde_json::Value::String(model_type));
                }
                if let Some(algorithm) = filters.algorithm {
                    es_filters.insert("algorithm".to_string(), serde_json::Value::String(algorithm));
                }
                if let Some(status) = filters.status {
                    es_filters.insert("status".to_string(), serde_json::Value::String(status));
                }
                if let Some(min_accuracy) = filters.min_accuracy {
                    es_filters.insert("accuracy_min".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(min_accuracy).unwrap()));
                }
                if let Some(created_after) = filters.created_after {
                    es_filters.insert("created_after".to_string(), serde_json::Value::String(created_after.to_rfc3339()));
                }
            }

            if let Ok(search_results) = es_adapter.search_models(search_text, es_filters).await {
                let mut models = Vec::new();
                for hit in search_results.hits {
                    if let Ok(model) = serde_json::from_value::<MLModel>(hit.source) {
                        models.push(model);
                    }
                }
                return Ok(models);
            }
        }

        // Fallback to primary model storage with filters
        self.get_model_storage()?.list_models(filters).await
    }

    /// Get comprehensive system health from all databases
    pub async fn get_system_health(&self) -> DatabaseResult<serde_json::Value> {
        let health_status = serde_json::Map::new();
        let overall_healthy = true;

        // Check PostgreSQL health
        #[cfg(feature = "postgres-store")]
        if let Some(postgres_adapter) = &self.postgres_adapter {
            // PostgreSQL doesn't have a built-in health check method in our current implementation
            // In a production environment, you'd add one
            health_status.insert("postgresql".to_string(), serde_json::json!({
                "status": "available",
                "adapter": "initialized"
            }));
        }

        // Check MongoDB health
        #[cfg(feature = "mongodb-store")]
        if let Some(mongodb_adapter) = &self.mongodb_adapter {
            match mongodb_adapter.health_check().await {
                Ok(health) => {
                    health_status.insert("mongodb".to_string(), health);
                },
                Err(_) => {
                    overall_healthy = false;
                    health_status.insert("mongodb".to_string(), serde_json::json!({
                        "status": "unhealthy"
                    }));
                }
            }
        }

        // Check Redis health
        #[cfg(feature = "redis-store")]
        if let Some(redis_adapter) = &self.redis_adapter {
            match redis_adapter.health_check().await {
                Ok(health) => {
                    health_status.insert("redis".to_string(), health);
                },
                Err(_) => {
                    overall_healthy = false;
                    health_status.insert("redis".to_string(), serde_json::json!({
                        "status": "unhealthy"
                    }));
                }
            }
        }

        // Check Elasticsearch health
        #[cfg(feature = "elasticsearch-store")]
        if let Some(elasticsearch_adapter) = &self.elasticsearch_adapter {
            match elasticsearch_adapter.health_check().await {
                Ok(health) => {
                    health_status.insert("elasticsearch".to_string(), health);
                },
                Err(_) => {
                    overall_healthy = false;
                    health_status.insert("elasticsearch".to_string(), serde_json::json!({
                        "status": "unhealthy"
                    }));
                }
            }
        }

        Ok(serde_json::json!({
            "overall_status": if overall_healthy { "healthy" } else { "degraded" },
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "databases": health_status,
            "storage_configuration": {
                "primary_model_storage": format!("{:?}", self.primary_model_storage),
                "primary_inference_storage": format!("{:?}", self.primary_inference_storage),
                "primary_training_storage": format!("{:?}", self.primary_training_storage),
                "cache_storage": format!("{:?}", self.cache_storage),
                "search_storage": format!("{:?}", self.search_storage)
            }
        }))
    }

    /// Get storage statistics from all databases
    pub async fn get_storage_statistics(&self) -> DatabaseResult<serde_json::Value> {
        let stats = serde_json::Map::new();

        // Get MongoDB collection stats
        #[cfg(feature = "mongodb-store")]
        if let Some(mongodb_adapter) = &self.mongodb_adapter {
            if let Ok(mongodb_stats) = mongodb_adapter.get_collection_stats().await {
                stats.insert("mongodb".to_string(), mongodb_stats);
            }
        }

        // Get Redis cache stats
        #[cfg(feature = "redis-store")]
        if let Some(redis_adapter) = &self.redis_adapter {
            if let Ok(redis_stats) = redis_adapter.get_cache_stats().await {
                stats.insert("redis".to_string(), redis_stats);
            }
        }

        Ok(serde_json::Value::Object(stats))
    }

    /// Cache model weights with TTL
    pub async fn cache_model_weights(&self, _model_id: &str, _weights: &[f64], _ttl_seconds: Option<u64>) -> DatabaseResult<()> {
        #[cfg(feature = "redis-store")]
        if let Some(redis_adapter) = &self.redis_adapter {
            return redis_adapter.cache_model_weights(model_id, weights, ttl_seconds).await;
        }

        Err(DatabaseError::ConfigurationError("No cache storage available".to_string()))
    }

    /// Get cached model weights
    pub async fn get_cached_model_weights(&self, _model_id: &str) -> DatabaseResult<Option<Vec<f64>>> {
        #[cfg(feature = "redis-store")]
        if let Some(redis_adapter) = &self.redis_adapter {
            return redis_adapter.get_cached_model_weights(model_id).await;
        }

        Ok(None) // No cache available
    }

    /// Set model training status
    pub async fn set_training_status(&self, _model_id: &str, _status: &str, _progress: Option<f64>) -> DatabaseResult<()> {
        #[cfg(feature = "redis-store")]
        if let Some(redis_adapter) = &self.redis_adapter {
            return redis_adapter.set_training_status(model_id, status, progress).await;
        }

        Ok(()) // Silently succeed if no cache available
    }

    /// Get model training status
    pub async fn get_training_status(&self, _model_id: &str) -> DatabaseResult<Option<serde_json::Value>> {
        #[cfg(feature = "redis-store")]
        if let Some(redis_adapter) = &self.redis_adapter {
            return redis_adapter.get_training_status(model_id).await;
        }

        Ok(None)
    }
}

impl Default for DatabaseManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Builder for database manager configuration
pub struct DatabaseManagerBuilder {
    manager: DatabaseManager,
}

impl DatabaseManagerBuilder {
    /// Create a new builder
    pub fn new() -> Self {
        Self {
            manager: DatabaseManager::new(),
        }
    }

    /// Add PostgreSQL configuration
    pub fn with_postgresql(mut self, connection_string: String) -> Self {
        self.manager.add_database_config(DatabaseConfig {
            database_type: DatabaseType::PostgreSQL,
            connection_string,
            pool_size: Some(10),
            timeout_seconds: Some(30),
            retry_attempts: Some(3),
            ssl_enabled: Some(false),
        });
        self
    }

    /// Add MongoDB configuration
    pub fn with_mongodb(mut self, connection_string: String) -> Self {
        self.manager.add_database_config(DatabaseConfig {
            database_type: DatabaseType::MongoDB,
            connection_string,
            pool_size: Some(10),
            timeout_seconds: Some(30),
            retry_attempts: Some(3),
            ssl_enabled: Some(false),
        });
        self
    }

    /// Add Redis configuration
    pub fn with_redis(mut self, connection_string: String) -> Self {
        self.manager.add_database_config(DatabaseConfig {
            database_type: DatabaseType::Redis,
            connection_string,
            pool_size: Some(10),
            timeout_seconds: Some(10),
            retry_attempts: Some(3),
            ssl_enabled: Some(false),
        });
        self
    }

    /// Add Elasticsearch configuration
    pub fn with_elasticsearch(mut self, connection_string: String) -> Self {
        self.manager.add_database_config(DatabaseConfig {
            database_type: DatabaseType::Elasticsearch,
            connection_string,
            pool_size: None,
            timeout_seconds: Some(30),
            retry_attempts: Some(3),
            ssl_enabled: Some(false),
        });
        self
    }

    /// Configure storage preferences
    pub fn with_storage_preferences(
        mut self,
        model_storage: DatabaseType,
        inference_storage: DatabaseType,
        training_storage: DatabaseType,
        cache_storage: DatabaseType,
        search_storage: DatabaseType,
    ) -> Self {
        self.manager.configure_storage_preferences(
            model_storage,
            inference_storage,
            training_storage,
            cache_storage,
            search_storage,
        );
        self
    }

    /// Build and initialize the database manager
    pub async fn build(mut self) -> DatabaseResult<DatabaseManager> {
        self.manager.initialize().await?;
        Ok(self.manager)
    }
}