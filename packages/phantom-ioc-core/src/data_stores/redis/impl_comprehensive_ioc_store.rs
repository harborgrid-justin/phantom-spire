//! ComprehensiveIOCStore Trait Implementation
//!
//! Implementation of the ComprehensiveIOCStore trait for Redis.

use async_trait::async_trait;

use crate::data_stores::core_traits::ComprehensiveIOCStore;
use super::config::RedisConfig;
use super::connection::RedisConnectionManager;

pub struct RedisDataStore {
    pub config: RedisConfig,
    pub connection_manager: RedisConnectionManager,
}

#[async_trait]
impl ComprehensiveIOCStore for RedisDataStore {
    fn store_type(&self) -> &'static str {
        "redis"
    }

    fn supports_multi_tenancy(&self) -> bool {
        true
    }

    fn supports_full_text_search(&self) -> bool {
        false // Redis doesn't support full-text search like MongoDB
    }

    fn supports_transactions(&self) -> bool {
        false // Redis doesn't support multi-key transactions in the same way
    }

    fn supports_bulk_operations(&self) -> bool {
        true
    }

    fn max_batch_size(&self) -> usize {
        100 // Redis performs better with smaller batches
    }
}