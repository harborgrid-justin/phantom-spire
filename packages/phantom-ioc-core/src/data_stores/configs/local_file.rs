//! Local File Data Store Configuration
//!
//! Configuration for local file system-based IOC data stores

use serde::{Serialize, Deserialize};

/// Local file storage configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalFileConfig {
    /// Base directory for storage
    pub base_path: String,
    /// Enable compression for stored files
    pub compression: bool,
    /// File format (json, bincode, msgpack)
    pub format: String,
    /// Create directories if they don't exist
    pub create_dirs: bool,
    /// File permissions (Unix-style octal)
    pub permissions: Option<u32>,
}

impl Default for LocalFileConfig {
    fn default() -> Self {
        Self {
            base_path: "./data/ioc_store".to_string(),
            compression: true,
            format: "json".to_string(),
            create_dirs: true,
            permissions: Some(0o644),
        }
    }
}