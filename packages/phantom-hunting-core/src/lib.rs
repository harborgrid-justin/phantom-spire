// phantom-hunting-core/src/lib.rs
// Threat hunting and proactive detection library

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HuntingRule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub query: String,
    pub severity: HuntingSeverity,
    pub data_sources: Vec<String>,
    pub mitre_techniques: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HuntingSeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HuntingResult {
    pub rule_id: String,
    pub matches: Vec<HuntingMatch>,
    pub execution_time: DateTime<Utc>,
    pub data_sources_queried: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HuntingMatch {
    pub timestamp: DateTime<Utc>,
    pub source: String,
    pub event_data: HashMap<String, String>,
    pub confidence: f64,
}

pub struct HuntingCore {
    rules: HashMap<String, HuntingRule>,
}

impl HuntingCore {
    pub fn new() -> Result<Self, String> {
        let mut rules = HashMap::new();
        
        rules.insert("hunt_001".to_string(), HuntingRule {
            id: "hunt_001".to_string(),
            name: "Suspicious Process Execution".to_string(),
            description: "Detects suspicious process execution patterns".to_string(),
            query: "process_name contains powershell AND command_line contains encoded".to_string(),
            severity: HuntingSeverity::High,
            data_sources: vec!["windows_events".to_string(), "sysmon".to_string()],
            mitre_techniques: vec!["T1059.001".to_string()],
        });

        Ok(Self { rules })
    }

    pub fn execute_hunt(&self, rule_id: &str, data: Vec<HashMap<String, String>>) -> Result<HuntingResult, String> {
        let rule = self.rules.get(rule_id)
            .ok_or_else(|| format!("Rule {} not found", rule_id))?;

        let mut matches = Vec::new();
        
        for event in data {
            if self.evaluate_rule_against_event(rule, &event) {
                matches.push(HuntingMatch {
                    timestamp: Utc::now(),
                    source: event.get("source").unwrap_or(&"unknown".to_string()).clone(),
                    event_data: event,
                    confidence: 0.8,
                });
            }
        }

        Ok(HuntingResult {
            rule_id: rule_id.to_string(),
            matches,
            execution_time: Utc::now(),
            data_sources_queried: rule.data_sources.clone(),
        })
    }

    fn evaluate_rule_against_event(&self, _rule: &HuntingRule, event: &HashMap<String, String>) -> bool {
        // Simplified rule evaluation
        event.values().any(|v| v.contains("suspicious") || v.contains("powershell"))
    }
}

#[napi]
pub struct HuntingCoreNapi {
    inner: HuntingCore,
}

#[napi]
impl HuntingCoreNapi {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        let core = HuntingCore::new()
            .map_err(|e| napi::Error::from_reason(format!("Failed to create Hunting Core: {}", e)))?;
        Ok(HuntingCoreNapi { inner: core })
    }

    #[napi]
    pub fn execute_hunt(&self, rule_id: String, data_json: String) -> Result<String> {
        let data: Vec<HashMap<String, String>> = serde_json::from_str(&data_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse data: {}", e)))?;

        let result = self.inner.execute_hunt(&rule_id, data)
            .map_err(|e| napi::Error::from_reason(format!("Failed to execute hunt: {}", e)))?;

        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize result: {}", e)))
    }

    #[napi]
    pub fn get_health_status(&self) -> Result<String> {
        let status = serde_json::json!({
            "status": "healthy",
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "version": env!("CARGO_PKG_VERSION")
        });

        serde_json::to_string(&status)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize health status: {}", e)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hunting_core_creation() {
        let core = HuntingCore::new();
        assert!(core.is_ok());
    }
}
