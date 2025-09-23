//! ComprehensiveIOCStore Implementation for Unified Store
//!
//! Implementation of the ComprehensiveIOCStore trait for the unified data store,
//! providing store capabilities and metadata.

use async_trait::async_trait;

use crate::data_stores::traits::*;

use super::store_manager::IOCUnifiedDataStore;

#[async_trait]
impl ComprehensiveIOCStore for IOCUnifiedDataStore {
    fn store_type(&self) -> &'static str {
        "unified"
    }

    fn supports_multi_tenancy(&self) -> bool {
        true
    }

    fn supports_full_text_search(&self) -> bool {
        true
    }

    fn supports_transactions(&self) -> bool {
        false // Depends on underlying stores
    }

    fn supports_bulk_operations(&self) -> bool {
        true
    }

    fn max_batch_size(&self) -> usize {
        1000
    }
}