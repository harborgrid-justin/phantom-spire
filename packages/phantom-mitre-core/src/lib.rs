//! Phantom MITRE Core - Advanced MITRE ATT&CK Framework Integration
//! 
//! This library provides comprehensive MITRE ATT&CK framework integration with advanced
//! threat analysis, technique mapping, and tactical intelligence capabilities.

// Core modules following phantom-cve-core architecture pattern
mod models;
mod config;
mod storage;
mod core;
mod napi_bindings;

// Extended business modules (existing) - temporarily commented out for build compatibility
// pub mod modules;

// Data store modules for enterprise SaaS readiness (existing) - temporarily commented out for build compatibility
// pub mod data_stores;

// Unified data layer interface and implementation (existing for backward compatibility) - temporarily commented out
// pub mod unified;
// pub mod mitre_unified_store;

// Re-export public types and components from modular architecture
pub use models::*;
pub use config::*;
pub use storage::{MitreStorage, LocalStorage, StorageFactory, create_default_storage, create_sample_storage};
pub use core::MitreCore;

// Export NAPI bindings for Node.js integration
#[cfg(feature = "napi")]
pub use napi_bindings::MitreCoreNapi;


// Re-export unified data layer interface for backward compatibility (temporarily commented out)
// pub use unified::*;
// pub use mitre_unified_store::MitreUnifiedDataStore;


