#![deny(clippy::all)]

pub mod agents;

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

#[napi]
pub fn create_agent_registry() -> AgentRegistry {
    AgentRegistry::new()
}

#[napi]
pub fn create_security_agent() -> SecurityAuditAgent {
    SecurityAuditAgent::new()
}