//! Data Store Configurations
//!
//! Store-specific configuration modules

pub mod redis;
pub mod postgres;
pub mod mongodb;
pub mod elasticsearch;
pub mod local_file;

// Re-export configurations
pub use redis::RedisConfig;
pub use postgres::PostgreSQLConfig;
pub use mongodb::MongoDBConfig;
pub use elasticsearch::ElasticsearchConfig;
pub use local_file::LocalFileConfig;