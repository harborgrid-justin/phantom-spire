//! Data Store Module for IOC Core
//!
//! Enhanced data store architecture with multi-database support and enterprise features
//! Based on phantom-cve-core architectural patterns

pub mod traits;
pub mod serialization;
pub mod config;
pub mod types;
pub mod core_traits;
pub mod factory_trait;
pub mod config_types;
pub mod configs;
pub mod serialization_types;
pub mod serialization_traits;
pub mod serializers;
pub mod serialization_factory;
pub mod serialization_utils;
pub mod registry;
pub mod manager;

// Data store implementations
pub mod unified;
pub mod redis;
pub mod postgres;
pub mod mongodb;
pub mod elasticsearch;

// Re-export core traits and types for easy access
pub use traits::{
    IOCDataStore,
    IOCStore,
    IOCResultStore,
    EnrichedIOCStore,
    CorrelationStore,
    ComprehensiveIOCStore,
    IOCDataStoreFactory,
    TenantContext,
    DataStoreResult,
    DataStoreError,
    IOCSearchCriteria,
    SearchResults,
    DataStoreMetrics,
    BulkOperationResult,
};
pub use types::*;
pub use core_traits::*;
pub use factory_trait::*;

pub use config::{DataStoreConfig, DataStoreType};
pub use serialization::{IOCSerializer, SerializationFormat};
pub use registry::DataStoreRegistry;
pub use manager::MultiTenantDataStoreManager;

// Re-export data store implementations
pub use unified::IOCUnifiedDataStore;
#[cfg(feature = "redis-store")]
pub use redis::RedisDataStore;
#[cfg(feature = "postgres-store")]
pub use postgres::PostgreSQLDataStore;
#[cfg(feature = "mongodb-store")]
pub use mongodb::MongoDataStore;
#[cfg(feature = "elasticsearch-store")]
pub use elasticsearch::ElasticsearchDataStore;