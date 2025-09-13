//! # Phantom ML Core
//!
//! Enterprise machine learning services for threat detection and security analytics.
//!
//! This package provides a comprehensive set of ML capabilities including:
//! - Model training and management
//! - Real-time inference and batch processing
//! - Feature engineering and data preprocessing
//! - Anomaly detection and behavioral analysis
//! - Performance monitoring and model versioning
//!
//! ## Features
//! - High-performance ML inference using NAPI-rs bindings
//! - Enterprise-grade model management
//! - Real-time threat classcarification
//! - Advanced anomaly detection algorithms
//! - Comprehensive performance monitoring

// Temporarily remove NAPI imports to avoid macro conflicts
use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use dashmap::DashMap;
use parking_lot::RwLock;
use std::sync::Arc;

#[cfg(feature = "actix-web-server")]
pub mod actix_server;

#[cfg(feature = "rocket-server")]
pub mod rocket_server;



// Import all modules
pub mod config;
pub mod models;
pub mod types;
pub mod core;
pub mod database;
pub mod database_ops;
pub mod training;
pub mod inference;
pub mod management;
pub mod analytics;
pub mod utils;
pub mod napi_bindings;

// Re-export main types and structs
pub use config::*;
pub use models::*;
pub use types::*;

// Re-export extension traits
pub use database_ops::DatabaseOperations;
pub use training::TrainingOperations;
pub use inference::InferenceOperations;
pub use management::ManagementOperations;
pub use analytics::AnalyticsOperations;
pub use utils::UtilityOperations;

// Re-export PhantomMLCore with all its methods
pub use core::PhantomMLCore;

// Re-export NAPI bindings
pub use napi_bindings::*;