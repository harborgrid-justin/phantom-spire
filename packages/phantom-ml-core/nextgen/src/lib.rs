#![deny(clippy::all)]

pub mod agents;
pub mod plugins;
pub mod core;
pub mod core_enhanced;
pub mod error;
pub mod types;
pub mod ml;
pub mod enterprise;
pub mod database;

use napi_derive::napi;

#[napi]
pub fn hello() -> &'static str {
    "hello"
}

#[napi]
pub fn plus100(input: u32) -> u32 {
    input + 100
}

pub use agents::registry::{AgentRegistry, AgentInfo, ExecutionRecord, AgentStats};
pub use agents::security_audit::{SecurityAuditAgent, SecurityIssue, ScanReport};

// Core ML functionality exports
pub use core::PhantomMLCore;
pub use core_enhanced::PhantomMLCoreEnhanced;
pub use error::{PhantomMLError, Result};
pub use types::*;
pub use ml::*;

// Plugin system exports
pub use plugins::napi::{
    PluginSystemApi, PluginInfoJs, AgentContextJs, AgentResultJs,
    MarketplaceEntryJs, InstallationResultJs, PluginHealthJs,
    create_plugin_system, get_plugin_system_version,
    create_sample_plugin_config, validate_plugin_manifest, create_sample_data,
};

#[napi]
pub fn create_agent_registry() -> AgentRegistry {
    AgentRegistry::new()
}

#[napi]
pub fn create_security_agent() -> SecurityAuditAgent {
    SecurityAuditAgent::new()
}