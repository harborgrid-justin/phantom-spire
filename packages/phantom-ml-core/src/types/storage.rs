use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::time::Duration;
use thiserror::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StorageType {
    Memory,
    FileSystem,
    Postgres,
    Redis,
    S3,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageConfig {
    pub storage_type: StorageType,
    pub max_size: usize,
    pub retention_period: Duration,
    pub backup_interval: Duration,
    pub path: Option<PathBuf>,
    pub connection_string: Option<String>,
    pub credentials: Option<StorageCredentials>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageCredentials {
    pub username: Option<String>,
    pub password: Option<String>,
    pub api_key: Option<String>,
    pub access_key: Option<String>,
    pub secret_key: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct StorageStats {
    pub total_size: u64,
    pub used_size: u64,
    pub total_objects: usize,
    pub last_backup: Option<DateTime<Utc>>,
    pub operations_count: u64,
    pub failed_operations: u64,
}

#[derive(Debug, Error)]
pub enum StorageError {
    #[error("Storage initialization failed: {0}")]
    InitError(String),
    #[error("Storage is full")]
    StorageFull,
    #[error("Object not found: {0}")]
    NotFound(String),
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    #[error("Connection error: {0}")]
    ConnectionError(String),
    #[error("Serialization error: {0}")]
    SerializationError(String),
    #[error("Backup failed: {0}")]
    BackupError(String),
}