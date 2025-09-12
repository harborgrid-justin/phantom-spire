//! Redis Key Generation
//!
//! Utilities for generating Redis keys with proper namespacing.

use uuid::Uuid;

/// Generate Redis key for IOC with tenant context
pub fn ioc_key(key_prefix: &str, tenant_id: &str, id: &Uuid) -> String {
    format!("{}{}:ioc:{}:{}", key_prefix, tenant_id, id, id)
}

/// Generate Redis key for IOC result with tenant context
pub fn result_key(key_prefix: &str, tenant_id: &str, ioc_id: &Uuid) -> String {
    format!("{}{}:result:{}:{}", key_prefix, tenant_id, ioc_id, ioc_id)
}

/// Generate Redis key for enriched IOC with tenant context
pub fn enriched_key(key_prefix: &str, tenant_id: &str, ioc_id: &Uuid) -> String {
    format!("{}{}:enriched:{}:{}", key_prefix, tenant_id, ioc_id, ioc_id)
}

/// Generate Redis key for correlations with tenant context
pub fn correlations_key(key_prefix: &str, tenant_id: &str, ioc_id: &Uuid) -> String {
    format!("{}{}:correlations:{}:{}", key_prefix, tenant_id, ioc_id, ioc_id)
}

/// Generate Redis key for IOC count with tenant context
pub fn ioc_count_key(key_prefix: &str, tenant_id: &str) -> String {
    format!("{}{}:ioc:count", key_prefix, tenant_id)
}

/// Generate Redis key for IOC search index with tenant context
pub fn ioc_search_key(key_prefix: &str, tenant_id: &str) -> String {
    format!("{}{}:ioc:search", key_prefix, tenant_id)
}