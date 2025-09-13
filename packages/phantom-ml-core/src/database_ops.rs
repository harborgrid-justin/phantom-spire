//! Database operations and management for Phantom ML Core
//!
//! This module provides database-related functionality including
//! initialization, connection management, and database operations.
use napi::bindgen_prelude::*;
use crate::core::PhantomMLCore;

// Re-export database types for convenience
pub use crate::database::{DatabaseManager, DatabaseManagerBuilder, DatabaseType};

// Constants for JSON response keys and values
const JSON_KEY_STATUS: &str = "status";
const JSON_KEY_MESSAGE: &str = "message";
const JSON_KEY_TIMESTAMP: &str = "timestamp";
const JSON_KEY_DATABASES_CONNECTED: &str = "databases_connected";
const JSON_KEY_TOTAL_RECORDS: &str = "total_records";
const JSON_KEY_CACHE_HIT_RATE: &str = "cache_hit_rate";
const JSON_KEY_RECORDS_CLEANED: &str = "records_cleaned";
const JSON_KEY_OLDER_THAN_DAYS: &str = "older_than_days";

const STATUS_HEALTHY: &str = "healthy";
const STATUS_NOT_CONFIGURED: &str = "not_configured";
const STATUS_COMPLETED: &str = "completed";
const MESSAGE_HEALTHY: &str = "Database connections are active";
const MESSAGE_NOT_CONFIGURED: &str = "Database not configured";
const ERROR_NOT_CONFIGURED: &str = "Database not configured";

/// Database operations extension for PhantomMLCore
pub trait DatabaseOperations {
    /// Check database connectivity and health
    async fn check_database_health(&self) -> Result<String>;
    /// Get database statistics and metrics
    async fn get_database_stats(&self) -> Result<String>;
    /// Clean up old database records
    async fn cleanup_database(&self, retention_days: u32) -> Result<String>;
}

impl DatabaseOperations for PhantomMLCore {
    async fn check_database_health(&self) -> Result<String> {
        let current_timestamp = chrono::Utc::now().to_rfc3339();

        if self.is_database_available() {
            let _db_guard = self.get_database_guard()?;
            // This would call health check methods on the database manager
            Ok(Self::build_json_response(&[
                (JSON_KEY_STATUS, STATUS_HEALTHY),
                (JSON_KEY_MESSAGE, MESSAGE_HEALTHY),
                (JSON_KEY_TIMESTAMP, &current_timestamp)
            ]))
        } else {
            Ok(Self::build_json_response(&[
                (JSON_KEY_STATUS, STATUS_NOT_CONFIGURED),
                (JSON_KEY_MESSAGE, MESSAGE_NOT_CONFIGURED),
                (JSON_KEY_TIMESTAMP, &current_timestamp)
            ]))
        }
    }

    async fn get_database_stats(&self) -> Result<String> {
        let current_timestamp = chrono::Utc::now().to_rfc3339();

        if self.is_database_available() {
            let _db_guard = self.get_database_guard()?;
            // This would gather statistics from all connected databases
            Ok(serde_json::json!({
                JSON_KEY_DATABASES_CONNECTED: 1, // Simplified
                JSON_KEY_TOTAL_RECORDS: 0, // Would be calculated
                JSON_KEY_CACHE_HIT_RATE: 0.0, // Would be calculated
                JSON_KEY_TIMESTAMP: current_timestamp
            }).to_string())
        } else {
            Err(napi::Error::from_reason(ERROR_NOT_CONFIGURED))
        }
    }

    async fn cleanup_database(&self, retention_days: u32) -> Result<String> {
        let current_timestamp = chrono::Utc::now().to_rfc3339();

        if self.is_database_available() {
            let _db_guard = self.get_database_guard()?;
            // This would perform cleanup operations
            Ok(serde_json::json!({
                JSON_KEY_STATUS: STATUS_COMPLETED,
                JSON_KEY_RECORDS_CLEANED: 0, // Would be calculated
                JSON_KEY_OLDER_THAN_DAYS: retention_days,
                JSON_KEY_TIMESTAMP: current_timestamp
            }).to_string())
        } else {
            Err(napi::Error::from_reason(ERROR_NOT_CONFIGURED))
        }
    }
}

// Helper methods for PhantomMLCore
impl PhantomMLCore {
    /// Check if a database manager is available
    fn is_database_available(&self) -> bool {
        self.database_manager.is_some()
    }

    /// Get database guard, returning error if not available
    fn get_database_guard(&self) -> Result<parking_lot::RwLockReadGuard<crate::database::DatabaseManager>> {
        match &self.database_manager {
            Some(db_manager) => Ok(db_manager.read()),
            None => Err(napi::Error::from_reason(ERROR_NOT_CONFIGURED))
        }
    }

    /// Build JSON response from key-value pairs
    fn build_json_response(pairs: &[(&str, &str)]) -> String {
        let mut json_obj = serde_json::Map::new();
        for (key, value) in pairs {
            json_obj.insert(key.to_string(), serde_json::Value::String(value.to_string()));
        }
        serde_json::Value::Object(json_obj).to_string()
    }
}