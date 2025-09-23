//! Redis implementation of IOC data stores
//!
//! This module provides a Redis-based implementation of all IOC data store traits.
//! It uses Redis as a key-value store with JSON serialization for IOC data.

pub mod config;
pub mod keys;
pub mod connection;
pub mod impl_ioc_data_store;
pub mod impl_ioc_store;
pub mod impl_ioc_result_store;
pub mod impl_enriched_ioc_store;
pub mod impl_correlation_store;
pub mod impl_comprehensive_ioc_store;

// Re-export the main struct and config for easy access
pub use config::RedisConfig;
pub use connection::RedisDataStore;