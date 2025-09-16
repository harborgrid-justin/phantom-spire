use super::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone)]
#[napi]
pub struct AgentRegistry {
    agents: HashMap<String, AgentInfo>,
    execution_history: Vec<ExecutionRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct AgentInfo {
    pub name: String,
    pub version: String,
    pub enabled: bool,
    pub priority: i32,
    pub last_executed: Option<String>,
    pub execution_count: i32,
}

#[napi]
impl AgentRegistry {
    #[napi(constructor)]
    pub fn new() -> Self {
        let mut registry = Self {
            agents: HashMap::new(),
            execution_history: Vec::new(),
        };
        registry.init_default_agents();
        registry
    }

    fn init_default_agents(&mut self) {
        let agents = vec![
            ("SecurityAuditAgent", "1.0.0", 100),
            ("CodeReviewAgent", "1.0.0", 90),
            ("PerformanceAnalyzerAgent", "1.0.0", 80),
            ("DatabaseMigrationAgent", "1.0.0", 70),
            ("APITestingAgent", "1.0.0", 85),
            ("DocumentationGeneratorAgent", "1.0.0", 60),
            ("DependencyAnalyzerAgent", "1.0.0", 75),
            ("DeploymentOrchestrationAgent", "1.0.0", 95),
            ("LogAnalyzerAgent", "1.0.0", 65),
            ("RefactoringAssistantAgent", "1.0.0", 55),
        ];

        for (name, version, priority) in agents {
            self.agents.insert(name.to_string(), AgentInfo {
                name: name.to_string(),
                version: version.to_string(),
                enabled: true,
                priority,
                last_executed: None,
                execution_count: 0,
            });
        }
    }

    #[napi]
    pub fn list_agents(&self) -> Vec<AgentInfo> {
        self.agents.values().cloned().collect()
    }

    #[napi]
    pub fn get_agent(&self, name: String) -> Option<AgentInfo> {
        self.agents.get(&name).cloned()
    }

    #[napi]
    pub fn enable_agent(&mut self, name: String) -> bool {
        if let Some(agent) = self.agents.get_mut(&name) {
            agent.enabled = true;
            true
        } else {
            false
        }
    }

    #[napi]
    pub fn disable_agent(&mut self, name: String) -> bool {
        if let Some(agent) = self.agents.get_mut(&name) {
            agent.enabled = false;
            true
        } else {
            false
        }
    }

    #[napi]
    pub fn execute_agent_simple(&mut self, agent_name: String) -> AgentResult {
        if let Some(agent_info) = self.agents.get_mut(&agent_name) {
            if !agent_info.enabled {
                return AgentResult {
                    agent_name: agent_name.clone(),
                    success: false,
                    message: format!("Agent {} is disabled", agent_name),
                    data: None,
                    errors: vec![format!("Agent {} is disabled", agent_name)],
                    warnings: Vec::new(),
                    execution_time_ms: 0,
                };
            }

            agent_info.execution_count += 1;
            agent_info.last_executed = Some(chrono::Utc::now().to_rfc3339());

            let record = ExecutionRecord {
                agent_name: agent_name.clone(),
                started_at: chrono::Utc::now().to_rfc3339(),
                duration_ms: 100,
                success: true,
                context_summary: "Simple execution".to_string(),
            };
            self.execution_history.push(record);

            AgentResult {
                agent_name: agent_name.clone(),
                success: true,
                message: "Agent executed successfully".to_string(),
                data: None,
                errors: Vec::new(),
                warnings: Vec::new(),
                execution_time_ms: 100,
            }
        } else {
            AgentResult {
                agent_name: agent_name.clone(),
                success: false,
                message: format!("Agent {} not found", agent_name),
                data: None,
                errors: vec![format!("Agent {} not found", agent_name)],
                warnings: Vec::new(),
                execution_time_ms: 0,
            }
        }
    }

    #[napi]
    pub fn get_execution_history(&self) -> Vec<ExecutionRecord> {
        self.execution_history.clone()
    }

    #[napi]
    pub fn get_agent_stats(&self) -> Vec<AgentStats> {
        self.agents.values().map(|info| {
            let executions = self.execution_history.iter()
                .filter(|record| record.agent_name == info.name)
                .collect::<Vec<_>>();

            let success_rate = if executions.is_empty() {
                0.0
            } else {
                executions.iter().filter(|r| r.success).count() as f64 / executions.len() as f64 * 100.0
            };

            let avg_duration = if executions.is_empty() {
                0
            } else {
                executions.iter().map(|r| r.duration_ms).sum::<i64>() / executions.len() as i64
            };

            AgentStats {
                agent_name: info.name.clone(),
                execution_count: info.execution_count,
                success_rate,
                average_duration_ms: avg_duration,
                last_executed: info.last_executed.clone(),
                enabled: info.enabled,
            }
        }).collect()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct ExecutionRecord {
    pub agent_name: String,
    pub started_at: String,
    pub duration_ms: i64,
    pub success: bool,
    pub context_summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct AgentStats {
    pub agent_name: String,
    pub execution_count: i32,
    pub success_rate: f64,
    pub average_duration_ms: i64,
    pub last_executed: Option<String>,
    pub enabled: bool,
}