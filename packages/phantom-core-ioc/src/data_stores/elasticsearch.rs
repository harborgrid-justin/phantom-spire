//! Elasticsearch implementation of IOC data stores
//!
//! This module provides a Redis-based implementation of all IOC data store traits.
//! It uses Elasticsearch as a search engine with JSON indexing for IOC data.

pub mod config;
pub mod connection;
pub mod conversions;
pub mod impl_ioc_data_store;
pub mod impl_ioc_store;
pub mod impl_ioc_result_store;
pub mod impl_enriched_ioc_store;
pub mod impl_correlation_store;
pub mod impl_comprehensive_ioc_store;

// Re-export the main struct and config for easy access
pub use config::ElasticsearchConfig;
pub use connection::ElasticsearchDataStore;
