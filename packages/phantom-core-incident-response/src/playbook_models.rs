//! Playbook Models
//! 
//! Data structures for response playbooks and automation

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use napi_derive::napi;
use crate::incident_models::{IncidentCategory, ResponderRole};

/// Playbook execution status
#[napi]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PlaybookStatus {
    NotStarted,
    InProgress,
    Completed,
    Failed,
    Skipped,
    Paused,
}

/// Response playbook
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponsePlaybook {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: IncidentCategory,
    pub severity_threshold: String, // Changed from IncidentSeverity to String for NAPI compatibility
    pub steps: Vec<PlaybookStep>,
    pub estimated_duration: u32,
    pub required_roles: Vec<ResponderRole>,
    pub prerequisites: Vec<String>,
    pub success_criteria: Vec<String>,
    pub created_by: String,
    pub created_at: i64,
    pub version: String,
    pub active: bool,
}

/// Playbook step
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybookStep {
    pub id: String,
    pub step_number: u32,
    pub title: String,
    pub description: String,
    pub instructions: String,
    pub estimated_duration: u32,
    pub required_role: ResponderRole,
    pub dependencies: Vec<String>,
    pub automation_script: Option<String>,
    pub verification_criteria: Vec<String>,
    pub status: PlaybookStatus,
}

/// Playbook execution
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybookExecution {
    pub id: String,
    pub incident_id: String,
    pub playbook_id: String,
    pub started_by: String,
    pub started_at: i64,
    pub completed_at: Option<i64>,
    pub status: PlaybookStatus,
    pub step_executions: Vec<StepExecution>,
    pub notes: String,
}

/// Step execution record
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepExecution {
    pub step_id: String,
    pub executed_by: String,
    pub started_at: i64,
    pub completed_at: Option<i64>,
    pub status: PlaybookStatus,
    pub notes: String,
    pub output: HashMap<String, String>,
}