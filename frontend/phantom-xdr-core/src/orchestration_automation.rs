// Orchestration Automation Engine for XDR Platform
use async_trait::async_trait;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutomationPlaybook {
    pub playbook_id: String,
    pub name: String,
    pub trigger_conditions: Vec<String>,
    pub actions: Vec<AutomationAction>,
    pub enabled: bool,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutomationAction {
    pub action_id: String,
    pub action_type: String,
    pub parameters: std::collections::HashMap<String, String>,
}

#[async_trait]
pub trait OrchestrationAutomationTrait {
    async fn create_playbook(&self, playbook: AutomationPlaybook) -> Result<String, String>;
    async fn execute_playbook(&self, playbook_id: &str) -> Result<String, String>;
    async fn get_orchestration_status(&self) -> String;
}

#[derive(Clone)]
pub struct OrchestrationAutomationEngine {
    playbooks: Arc<DashMap<String, AutomationPlaybook>>,
    executed_playbooks: Arc<RwLock<u64>>,
    last_error: Arc<RwLock<Option<String>>>,
}

impl OrchestrationAutomationEngine {
    pub fn new() -> Self {
        Self {
            playbooks: Arc::new(DashMap::new()),
            executed_playbooks: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        }
    }
}

#[async_trait]
impl OrchestrationAutomationTrait for OrchestrationAutomationEngine {
    async fn create_playbook(&self, playbook: AutomationPlaybook) -> Result<String, String> {
        let playbook_id = playbook.playbook_id.clone();
        self.playbooks.insert(playbook_id.clone(), playbook);
        Ok(playbook_id)
    }

    async fn execute_playbook(&self, playbook_id: &str) -> Result<String, String> {
        if self.playbooks.contains_key(playbook_id) {
            let mut executed = self.executed_playbooks.write().await;
            *executed += 1;
            Ok("Playbook executed successfully".to_string())
        } else {
            Err("Playbook not found".to_string())
        }
    }

    async fn get_orchestration_status(&self) -> String {
        let executed = *self.executed_playbooks.read().await;
        format!("Orchestration Automation Engine: {} playbooks executed", executed)
    }
}