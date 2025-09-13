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
//! - Real-time threat classification
//! - Advanced anomaly detection algorithms
//! - Comprehensive performance monitoring

// ============================================================================
// External Dependencies
// ============================================================================


// ============================================================================
// Conditional Server Features
// ============================================================================

#[cfg(feature = "actix-web-server")]
pub mod actix_server;

#[cfg(feature = "rocket-server")]
pub mod rocket_server;

// ============================================================================
// Internal Modules
// ============================================================================

// Core modules
pub mod config;
pub mod core;
pub mod types;
pub mod models;
pub mod enhanced_models;
pub mod enterprise;
pub mod dataframe;

// Database modules
pub mod database;
pub mod database_ops;

// ML operation modules
pub mod training;
pub mod inference;
pub mod management;
pub mod analytics;
pub mod automl;
pub mod automl_operations;
pub mod enterprise_operations;

// Utility modules
pub mod utils;
pub mod napi_bindings;

// ============================================================================
// Core Type Re-exports
// ============================================================================

// Configuration and core types
pub use config::*;
pub use models::*;
pub use enhanced_models::*;
pub use enterprise::*;
pub use types::*;

// Main ML Core
pub use core::PhantomMLCore;

// ============================================================================
// Operation Trait Re-exports
// ============================================================================

// Extension traits for ML operations
pub use analytics::AnalyticsOperations;
pub use database_ops::DatabaseOperations;
pub use inference::InferenceOperations;
pub use management::ManagementOperations;
pub use training::TrainingOperations;
pub use utils::UtilityOperations;
pub use automl::*;
pub use automl_operations::AutoMLOperations;
pub use enterprise_operations::EnterpriseOperations;

// ============================================================================
// NAPI Bindings
// ============================================================================

// JavaScript/TypeScript bindings
pub use napi_bindings::*;
pub use dataframe::*;