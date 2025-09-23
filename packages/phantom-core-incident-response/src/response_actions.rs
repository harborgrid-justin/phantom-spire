//! Response Actions Models
//! 
//! Data structures for incident response actions and lessons learned

use serde::{Deserialize, Serialize};
use napi_derive::napi;

/// Containment action
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainmentAction {
    pub id: String,
    pub action: String,
    pub description: String,
    pub implemented_by: String,
    pub implemented_at: i64,
    pub effectiveness: String,
    pub side_effects: Vec<String>,
    pub rollback_plan: String,
}

/// Eradication action
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EradicationAction {
    pub id: String,
    pub action: String,
    pub description: String,
    pub target_systems: Vec<String>,
    pub implemented_by: String,
    pub implemented_at: i64,
    pub verification_method: String,
    pub success: bool,
}

/// Recovery action
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryAction {
    pub id: String,
    pub action: String,
    pub description: String,
    pub systems_restored: Vec<String>,
    pub implemented_by: String,
    pub implemented_at: i64,
    pub validation_tests: Vec<String>,
    pub success: bool,
}

/// Lesson learned
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LessonLearned {
    pub id: String,
    pub category: String,
    pub description: String,
    pub root_cause: String,
    pub recommendations: Vec<String>,
    pub action_items: Vec<ActionItem>,
    pub priority: u8,
}

/// Action item from lessons learned
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionItem {
    pub id: String,
    pub description: String,
    pub assigned_to: String,
    pub due_date: i64,
    pub status: String,
    pub priority: u8,
}