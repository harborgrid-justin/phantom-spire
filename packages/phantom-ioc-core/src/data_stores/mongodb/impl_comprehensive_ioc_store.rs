//! ComprehensiveIOCStore Trait Implementation
//!
//! Implementation of the ComprehensiveIOCStore trait for MongoDB.

use async_trait::async_trait;

use crate::data_stores::core_traits::ComprehensiveIOCStore;
use super::config::MongoDBConfig;

pub struct MongoDataStore {
    pub config: MongoDBConfig,
    pub client: mongodb::Client,
    pub database: mongodb::Database,
}

#[async_trait]
impl ComprehensiveIOCStore for MongoDataStore {
    fn store_type(&self) -> &'static str {
        "mongodb"
    }

    fn supports_multi_tenancy(&self) -> bool {
        true
    }

    fn supports_full_text_search(&self) -> bool {
        true
    }

    fn supports_transactions(&self) -> bool {
        false // MongoDB doesn't support multi-document transactions in the same way
    }

    fn supports_bulk_operations(&self) -> bool {
        true
    }

    fn max_batch_size(&self) -> usize {
        1000
    }
}