//! Unified IOC Data Store Implementation
//!
//! A comprehensive data store that combines multiple storage backends
//! with intelligent routing and failover capabilities.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::models::*;
use crate::data_stores::traits::*;
use crate::data_stores::config::DataStoreType;

pub mod config;
pub mod store_manager;
pub mod impl_ioc_data_store;
pub mod impl_ioc_store;
pub mod impl_ioc_result_store;
pub mod impl_enriched_ioc_store;
pub mod impl_correlation_store;
pub mod impl_comprehensive_ioc_store;

// Re-export the main struct and config for easy access
pub use config::UnifiedDataStoreConfig;
pub use store_manager::IOCUnifiedDataStore;