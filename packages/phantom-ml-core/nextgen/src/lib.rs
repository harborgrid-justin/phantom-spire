#![deny(clippy::all)]
#![warn(
    missing_docs,
    clippy::doc_markdown,
    clippy::unwrap_used,
    clippy::expect_used
)]

//! # Phantom ML Core
//!
//! Enterprise machine learning services for threat detection and security analytics.
//! This crate provides high-performance ML operations through NAPI-RS bindings.

// pub mod agents; // Temporarily disabled for minimal build
// pub mod plugins; // Temporarily disabled for minimal build
pub mod core;
// pub mod core_enhanced; // Temporarily disabled for minimal build
pub mod error;
pub mod types;
// pub mod ml; // Temporarily disabled for minimal build
// pub mod enterprise; // Temporarily disabled for minimal build
// pub mod database; // Temporarily disabled for minimal build

use napi_derive::napi;

/// Simple health check function
#[napi]
pub fn hello() -> &'static str {
    "Phantom ML Core v1.0.1"
}

/// Utility function for testing NAPI bindings
#[napi]
pub fn plus100(input: u32) -> u32 {
    input.saturating_add(100) // Use saturating_add to prevent overflow
}

// Temporarily disabled exports for minimal build
// pub use agents::registry::{AgentRegistry, AgentInfo, ExecutionRecord, AgentStats};
// pub use agents::security_audit::{SecurityAuditAgent, SecurityIssue, ScanReport};

// Core ML functionality exports
pub use core::PhantomMLCore;
// pub use core_enhanced::PhantomMLCoreEnhanced;
pub use error::{PhantomMLError, Result};
pub use types::*;
// pub use ml::*;

// Plugin system exports - temporarily disabled
// pub use plugins::napi::{
//     PluginSystemApi, PluginInfoJs, AgentContextJs, AgentResultJs,
//     MarketplaceEntryJs, InstallationResultJs, PluginHealthJs,
//     create_plugin_system, get_plugin_system_version,
//     create_sample_plugin_config, validate_plugin_manifest, create_sample_data,
// };

// Temporarily disabled functions
// #[napi]
// pub fn create_agent_registry() -> AgentRegistry {
//     AgentRegistry::new()
// }

// #[napi]
// pub fn create_security_agent() -> SecurityAuditAgent {
//     SecurityAuditAgent::new()
// }