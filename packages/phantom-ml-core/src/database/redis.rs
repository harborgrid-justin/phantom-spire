//! Redis adapter for phantom-ml-core
//! 
//! Provides Redis-based caching and real-time data storage for ML operations.

use async_trait::async_trait;
use redis::{AsyncCommands, Client, Connection};
use std::sync::Arc;
use tokio::sync::Mutex;
use serde::{Serialize, Deserialize};

use super::interfaces::{
    CacheStorage, DatabaseConfig, DatabaseError, DatabaseResult
};

/// Redis adapter for caching and real-time data
#[derive(Clone)]
pub struct RedisAdapter {
    client: Arc<Client>,
    connection: Arc<Mutex<Option<Connection>>>,
    config: DatabaseConfig,
}

impl RedisAdapter {
    /// Create a new Redis adapter
    pub async fn new(config: DatabaseConfig) -> DatabaseResult<Self> {
        let client = Client::open(config.connection_string.as_str())
            .map_err(|e| DatabaseError::ConnectionFailed(format!("Failed to create Redis client: {}", e)))?;

        let adapter = Self {
            client: Arc::new(client),
            connection: Arc::new(Mutex::new(None)),
            config,
        };

        // Test connection
        adapter.ping().await?;
        
        Ok(adapter)
    }

    /// Get or create a Redis connection
    async fn get_connection(&self) -> DatabaseResult<Connection> {
        let mut conn_guard = self.connection.lock().await;
        
        if conn_guard.is_none() {
            let conn = self.client
                .get_async_connection()
                .await
                .map_err(|e| DatabaseError::ConnectionFailed(format!("Failed to connect to Redis: {}", e)))?;
            
            *conn_guard = Some(conn);
        }
        
        // Return a new connection for each operation to avoid borrow issues
        self.client
            .get_async_connection()
            .await
            .map_err(|e| DatabaseError::ConnectionFailed(format!("Failed to get Redis connection: {}", e)))
    }

    /// Test Redis connection
    async fn ping(&self) -> DatabaseResult<()> {
        let mut conn = self.get_connection().await?;
        let _: String = conn
            .ping()
            .await
            .map_err(|e| DatabaseError::ConnectionFailed(format!("Redis ping failed: {}", e)))?;
        Ok(())
    }

    /// Generate cache key with namespace
    fn cache_key(&self, key: &str) -> String {
        format!("phantom-ml-core:{}", key)
    }

    /// Generate model-specific cache key
    fn model_key(&self, model_id: &str, suffix: &str) -> String {
        self.cache_key(&format!("model:{}:{}", model_id, suffix))
    }

    /// Generate inference cache key
    fn inference_key(&self, model_id: &str, features_hash: &str) -> String {
        self.cache_key(&format!("inference:{}:{}", model_id, features_hash))
    }

    /// Generate analytics cache key
    fn analytics_key(&self, model_id: &str, time_window: &str) -> String {
        self.cache_key(&format!("analytics:{}:{}", model_id, time_window))
    }

    /// Hash features for cache key generation
    fn hash_features(&self, features: &[f64]) -> String {
        use sha2::{Digest, Sha256};
        let mut hasher = Sha256::new();
        for &feature in features {
            hasher.update(feature.to_be_bytes());
        }
        format!("{:x}", hasher.finalize())
    }
}

#[async_trait]
impl CacheStorage for RedisAdapter {
    async fn set<T: Serialize + Send>(&self, key: &str, value: &T, ttl_seconds: Option<u64>) -> DatabaseResult<()> {
        let mut conn = self.get_connection().await?;
        let cache_key = self.cache_key(key);
        
        let serialized = serde_json::to_string(value)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize value: {}", e)))?;

        if let Some(ttl) = ttl_seconds {
            let _: () = conn
                .setex(&cache_key, ttl as i64, &serialized)
                .await
                .map_err(|e| DatabaseError::QueryFailed(format!("Failed to set value with TTL: {}", e)))?;
        } else {
            let _: () = conn
                .set(&cache_key, &serialized)
                .await
                .map_err(|e| DatabaseError::QueryFailed(format!("Failed to set value: {}", e)))?;
        }

        Ok(())
    }

    async fn get<T: for<'de> Deserialize<'de>>(&self, key: &str) -> DatabaseResult<Option<T>> {
        let mut conn = self.get_connection().await?;
        let cache_key = self.cache_key(key);

        let result: Option<String> = conn
            .get(&cache_key)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to get value: {}", e)))?;

        match result {
            Some(data) => {
                let value = serde_json::from_str(&data)
                    .map_err(|e| DatabaseError::SerializationError(format!("Failed to deserialize value: {}", e)))?;
                Ok(Some(value))
            },
            None => Ok(None),
        }
    }

    async fn delete(&self, key: &str) -> DatabaseResult<()> {
        let mut conn = self.get_connection().await?;
        let cache_key = self.cache_key(key);

        let _: u32 = conn
            .del(&cache_key)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to delete key: {}", e)))?;

        Ok(())
    }

    async fn exists(&self, key: &str) -> DatabaseResult<bool> {
        let mut conn = self.get_connection().await?;
        let cache_key = self.cache_key(key);

        let result: bool = conn
            .exists(&cache_key)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to check key existence: {}", e)))?;

        Ok(result)
    }

    async fn expire(&self, key: &str, ttl_seconds: u64) -> DatabaseResult<()> {
        let mut conn = self.get_connection().await?;
        let cache_key = self.cache_key(key);

        let _: bool = conn
            .expire(&cache_key, ttl_seconds as i64)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to set expiration: {}", e)))?;

        Ok(())
    }

    async fn mget(&self, keys: &[String]) -> DatabaseResult<Vec<Option<String>>> {
        let mut conn = self.get_connection().await?;
        let cache_keys: Vec<String> = keys.iter().map(|k| self.cache_key(k)).collect();

        let result: Vec<Option<String>> = conn
            .mget(&cache_keys)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to get multiple keys: {}", e)))?;

        Ok(result)
    }

    async fn mset(&self, pairs: &[(String, String)]) -> DatabaseResult<()> {
        let mut conn = self.get_connection().await?;
        let cache_pairs: Vec<(String, String)> = pairs
            .iter()
            .map(|(k, v)| (self.cache_key(k), v.clone()))
            .collect();

        let flattened: Vec<String> = cache_pairs
            .into_iter()
            .flat_map(|(k, v)| vec![k, v])
            .collect();

        let _: () = conn
            .mset(&flattened)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to set multiple keys: {}", e)))?;

        Ok(())
    }
}

/// Extended Redis operations for ML-specific use cases
impl RedisAdapter {
    /// Cache model metadata
    pub async fn cache_model(&self, model_id: &str, model_data: &serde_json::Value, ttl_seconds: Option<u64>) -> DatabaseResult<()> {
        let key = self.model_key(model_id, "metadata");
        self.set(&key, model_data, ttl_seconds).await
    }

    /// Get cached model metadata
    pub async fn get_cached_model(&self, model_id: &str) -> DatabaseResult<Option<serde_json::Value>> {
        let key = self.model_key(model_id, "metadata");
        self.get(&key).await
    }

    /// Cache model weights
    pub async fn cache_model_weights(&self, model_id: &str, weights: &[f64], ttl_seconds: Option<u64>) -> DatabaseResult<()> {
        let key = self.model_key(model_id, "weights");
        self.set(&key, weights, ttl_seconds).await
    }

    /// Get cached model weights
    pub async fn get_cached_model_weights(&self, model_id: &str) -> DatabaseResult<Option<Vec<f64>>> {
        let key = self.model_key(model_id, "weights");
        self.get(&key).await
    }

    /// Cache inference result
    pub async fn cache_inference(&self, model_id: &str, features: &[f64], result: &serde_json::Value, ttl_seconds: Option<u64>) -> DatabaseResult<()> {
        let features_hash = self.hash_features(features);
        let key = self.inference_key(model_id, &features_hash);
        self.set(&key, result, ttl_seconds).await
    }

    /// Get cached inference result
    pub async fn get_cached_inference(&self, model_id: &str, features: &[f64]) -> DatabaseResult<Option<serde_json::Value>> {
        let features_hash = self.hash_features(features);
        let key = self.inference_key(model_id, &features_hash);
        self.get(&key).await
    }

    /// Increment inference counter
    pub async fn increment_inference_count(&self, model_id: &str) -> DatabaseResult<u64> {
        let mut conn = self.get_connection().await?;
        let key = self.cache_key(&format!("stats:{}:inference_count", model_id));

        let count: u64 = conn
            .incr(&key, 1)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to increment inference count: {}", e)))?;

        // Set expiration to 24 hours if this is a new key
        if count == 1 {
            let _: bool = conn
                .expire(&key, 24 * 3600)
                .await
                .map_err(|e| DatabaseError::QueryFailed(format!("Failed to set expiration on counter: {}", e)))?;
        }

        Ok(count)
    }

    /// Get inference count for model
    pub async fn get_inference_count(&self, model_id: &str) -> DatabaseResult<u64> {
        let mut conn = self.get_connection().await?;
        let key = self.cache_key(&format!("stats:{}:inference_count", model_id));

        let count: Option<u64> = conn
            .get(&key)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to get inference count: {}", e)))?;

        Ok(count.unwrap_or(0))
    }

    /// Cache performance metrics
    pub async fn cache_performance_metrics(&self, model_id: &str, metrics: &serde_json::Value, ttl_seconds: Option<u64>) -> DatabaseResult<()> {
        let key = self.cache_key(&format!("metrics:{}:performance", model_id));
        self.set(&key, metrics, ttl_seconds).await
    }

    /// Get cached performance metrics
    pub async fn get_cached_performance_metrics(&self, model_id: &str) -> DatabaseResult<Option<serde_json::Value>> {
        let key = self.cache_key(&format!("metrics:{}:performance", model_id));
        self.get(&key).await
    }

    /// Add to real-time prediction stream
    pub async fn stream_prediction(&self, model_id: &str, prediction: &serde_json::Value) -> DatabaseResult<()> {
        let mut conn = self.get_connection().await?;
        let stream_key = self.cache_key(&format!("stream:{}:predictions", model_id));

        let prediction_str = serde_json::to_string(prediction)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize prediction: {}", e)))?;

        let _: () = conn
            .lpush(&stream_key, &prediction_str)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to add to prediction stream: {}", e)))?;

        // Keep only last 1000 predictions
        let _: () = conn
            .ltrim(&stream_key, 0, 999)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to trim prediction stream: {}", e)))?;

        // Set expiration
        let _: bool = conn
            .expire(&stream_key, 24 * 3600)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to set expiration on stream: {}", e)))?;

        Ok(())
    }

    /// Get recent predictions from stream
    pub async fn get_recent_predictions(&self, model_id: &str, limit: Option<u32>) -> DatabaseResult<Vec<serde_json::Value>> {
        let mut conn = self.get_connection().await?;
        let stream_key = self.cache_key(&format!("stream:{}:predictions", model_id));
        let limit = limit.unwrap_or(100) as isize;

        let predictions: Vec<String> = conn
            .lrange(&stream_key, 0, limit - 1)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to get predictions from stream: {}", e)))?;

        let mut results = Vec::new();
        for prediction_str in predictions {
            let prediction: serde_json::Value = serde_json::from_str(&prediction_str)
                .map_err(|e| DatabaseError::SerializationError(format!("Failed to deserialize prediction: {}", e)))?;
            results.push(prediction);
        }

        Ok(results)
    }

    /// Set model training status
    pub async fn set_training_status(&self, model_id: &str, status: &str, progress: Option<f64>) -> DatabaseResult<()> {
        let mut conn = self.get_connection().await?;
        let key = self.cache_key(&format!("training:{}:status", model_id));

        let status_data = serde_json::json!({
            "status": status,
            "progress": progress,
            "timestamp": chrono::Utc::now().to_rfc3339()
        });

        let status_str = serde_json::to_string(&status_data)
            .map_err(|e| DatabaseError::SerializationError(format!("Failed to serialize training status: {}", e)))?;

        let _: () = conn
            .setex(&key, 3600, &status_str) // Expire in 1 hour
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to set training status: {}", e)))?;

        Ok(())
    }

    /// Get model training status
    pub async fn get_training_status(&self, model_id: &str) -> DatabaseResult<Option<serde_json::Value>> {
        let key = self.cache_key(&format!("training:{}:status", model_id));
        self.get(&key).await
    }

    /// Clear model cache
    pub async fn clear_model_cache(&self, model_id: &str) -> DatabaseResult<()> {
        let mut conn = self.get_connection().await?;
        let pattern = self.cache_key(&format!("*:{}:*", model_id));

        // Note: In production, you'd want to use SCAN instead of KEYS for better performance
        let keys: Vec<String> = conn
            .keys(&pattern)
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to get keys for deletion: {}", e)))?;

        if !keys.is_empty() {
            let _: u32 = conn
                .del(&keys)
                .await
                .map_err(|e| DatabaseError::QueryFailed(format!("Failed to delete model cache: {}", e)))?;
        }

        Ok(())
    }

    /// Get cache statistics
    pub async fn get_cache_stats(&self) -> DatabaseResult<serde_json::Value> {
        let mut conn = self.get_connection().await?;

        // Get Redis info
        let info: String = conn
            .info("memory")
            .await
            .map_err(|e| DatabaseError::QueryFailed(format!("Failed to get Redis info: {}", e)))?;

        // Parse key Redis metrics
        let mut stats = serde_json::Map::new();
        
        for line in info.lines() {
            if line.contains(':') {
                let parts: Vec<&str> = line.splitn(2, ':').collect();
                if parts.len() == 2 {
                    let key = parts[0].trim();
                    let value = parts[1].trim();
                    
                    match key {
                        "used_memory" | "used_memory_human" | "used_memory_peak" | "used_memory_peak_human" => {
                            stats.insert(key.to_string(), serde_json::Value::String(value.to_string()));
                        },
                        _ => {}
                    }
                }
            }
        }

        Ok(serde_json::Value::Object(stats))
    }

    /// Health check
    pub async fn health_check(&self) -> DatabaseResult<serde_json::Value> {
        let start_time = std::time::Instant::now();
        
        // Test basic operations
        let test_key = self.cache_key("health_check");
        let test_value = "OK";
        
        self.set(&test_key, &test_value, Some(60)).await?;
        let retrieved: Option<String> = self.get(&test_key).await?;
        self.delete(&test_key).await?;
        
        let response_time = start_time.elapsed().as_millis();
        
        let is_healthy = retrieved.as_deref() == Some(test_value);
        
        Ok(serde_json::json!({
            "status": if is_healthy { "healthy" } else { "unhealthy" },
            "response_time_ms": response_time,
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "operations_tested": ["set", "get", "delete"]
        }))
    }
}