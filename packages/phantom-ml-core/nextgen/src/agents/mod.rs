pub mod security_audit;
pub mod registry;

use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct AgentConfig {
    pub name: String,
    pub version: String,
    pub enabled: bool,
    pub priority: i32,
    pub timeout_ms: i32,
    pub max_retries: i32,
    pub config: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct AgentResult {
    pub agent_name: String,
    pub success: bool,
    pub message: String,
    pub data: Option<String>,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
    pub execution_time_ms: i64,
}

pub trait Agent: Send + Sync {
    fn name(&self) -> String;
    fn version(&self) -> String;
    fn description(&self) -> String;
    async fn execute(&self, context: AgentContext) -> Result<AgentResult, AgentError>;
    fn validate_config(&self, config: &HashMap<String, String>) -> Result<(), Vec<String>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct AgentContext {
    pub project_path: String,
    pub target_files: Vec<String>,
    pub config: HashMap<String, String>,
    pub metadata: HashMap<String, String>,
    pub dry_run: bool,
    pub verbose: bool,
}

#[derive(Debug)]
#[napi]
pub struct AgentError {
    pub code: String,
    pub message: String,
    pub details: Option<String>,
}

impl std::fmt::Display for AgentError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "[{}] {}", self.code, self.message)
    }
}

impl std::error::Error for AgentError {}