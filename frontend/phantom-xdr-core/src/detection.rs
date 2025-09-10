use crate::types::*;
use async_trait::async_trait;
use dashmap::DashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use regex::Regex;
use chrono::{DateTime, Utc, Duration};
use std::collections::HashMap;
use napi_derive::napi;

#[async_trait]
pub trait DetectionEngineTrait {
    async fn process_indicator(&self, indicator: ThreatIndicator) -> DetectionResult;
    async fn evaluate_rule(&self, rule: &DetectionRule, data: &HashMap<String, serde_json::Value>) -> bool;
    async fn get_status(&self) -> ComponentStatus;
}

#[derive(Clone)]
pub struct DetectionEngine {
    rules: Arc<DashMap<String, DetectionRule>>,
    indicators: Arc<DashMap<String, ThreatIndicator>>,
    processed_events: Arc<RwLock<u64>>,
    active_alerts: Arc<RwLock<u32>>,
    last_error: Arc<RwLock<Option<String>>>,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DetectionResult {
    pub indicator_id: String,
    pub matched_rules: Vec<String>,
    pub risk_score: f64,
    pub recommended_actions: Vec<RuleAction>,
    pub timestamp: i64,
}

impl DetectionEngine {
    pub fn new() -> Self {
        let mut engine = Self {
            rules: Arc::new(DashMap::new()),
            indicators: Arc::new(DashMap::new()),
            processed_events: Arc::new(RwLock::new(0)),
            active_alerts: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        };

        engine.initialize_default_rules();
        engine
    }

    fn initialize_default_rules(&mut self) {
        let rules = vec![
            DetectionRule {
                id: "high_risk_ip".to_string(),
                name: "High Risk IP Detection".to_string(),
                description: "Detect connections from high-risk IP addresses".to_string(),
                enabled: true,
                priority: 8,
                conditions: vec![
                    RuleCondition {
                        field: "source_ip".to_string(),
                        operator: ConditionOperator::In,
                        value: serde_json::Value::Array(vec![]), // Would be populated from threat feeds
                        weight: 5.0,
                    },
                ],
                actions: vec![
                    RuleAction {
                        action_type: ActionType::Alert,
                        parameters: {
                            let mut params = std::collections::HashMap::new();
                            params.insert("severity".to_string(), serde_json::Value::String("high".to_string()));
                            params.insert("message".to_string(), serde_json::Value::String("Connection from high-risk IP detected".to_string()));
                            params
                        },
                        target: "security_team".to_string(),
                    },
                ],
                metadata: RuleMetadata {
                    author: "system".to_string(),
                    created: Utc::now().timestamp(),
                    modified: Utc::now().timestamp(),
                    tags: vec!["network".to_string(), "ip".to_string()],
                    mitre_tactics: vec!["TA0011".to_string()],
                    mitre_techniques: vec!["T1071".to_string()],
                    references: vec![],
                },
            },
            DetectionRule {
                id: "malicious_domain".to_string(),
                name: "Malicious Domain Detection".to_string(),
                description: "Detect access to known malicious domains".to_string(),
                enabled: true,
                priority: 9,
                conditions: vec![
                    RuleCondition {
                        field: "domain".to_string(),
                        operator: ConditionOperator::In,
                        value: serde_json::Value::Array(vec![]), // Would be populated from threat feeds
                        weight: 7.0,
                    },
                ],
                actions: vec![
                    RuleAction {
                        action_type: ActionType::Block,
                        parameters: {
                            let mut params = std::collections::HashMap::new();
                            params.insert("duration".to_string(), serde_json::Value::String("1h".to_string()));
                            params
                        },
                        target: "domain".to_string(),
                    },
                ],
                metadata: RuleMetadata {
                    author: "system".to_string(),
                    created: Utc::now().timestamp(),
                    modified: Utc::now().timestamp(),
                    tags: vec!["network".to_string(), "domain".to_string()],
                    mitre_tactics: vec!["TA0011".to_string()],
                    mitre_techniques: vec!["T1071".to_string()],
                    references: vec![],
                },
            },
            DetectionRule {
                id: "suspicious_file_hash".to_string(),
                name: "Suspicious File Hash Detection".to_string(),
                description: "Detect known malicious file hashes".to_string(),
                enabled: true,
                priority: 10,
                conditions: vec![
                    RuleCondition {
                        field: "file_hash".to_string(),
                        operator: ConditionOperator::In,
                        value: serde_json::Value::Array(vec![]), // Would be populated from threat feeds
                        weight: 10.0,
                    },
                ],
                actions: vec![
                    RuleAction {
                        action_type: ActionType::Quarantine,
                        parameters: {
                            let mut params = std::collections::HashMap::new();
                            params.insert("reason".to_string(), serde_json::Value::String("malicious_file".to_string()));
                            params
                        },
                        target: "file".to_string(),
                    },
                ],
                metadata: RuleMetadata {
                    author: "system".to_string(),
                    created: Utc::now().timestamp(),
                    modified: Utc::now().timestamp(),
                    tags: vec!["file".to_string(), "malware".to_string()],
                    mitre_tactics: vec!["TA0002".to_string()],
                    mitre_techniques: vec!["T1027".to_string()],
                    references: vec![],
                },
            },
        ];

        for rule in rules {
            self.rules.insert(rule.id.clone(), rule);
        }
    }

    pub async fn add_rule(&self, rule: DetectionRule) -> Result<(), String> {
        if self.rules.contains_key(&rule.id) {
            return Err(format!("Rule with ID {} already exists", rule.id));
        }
        let rule_id = rule.id.clone();
        self.rules.insert(rule_id, rule);
        Ok(())
    }

    pub async fn update_rule(&self, rule_id: String, rule: DetectionRule) -> Result<(), String> {
        if !self.rules.contains_key(&rule_id) {
            return Err(format!("Rule with ID {} not found", rule_id));
        }
        self.rules.insert(rule_id, rule);
        Ok(())
    }

    pub async fn remove_rule(&self, rule_id: &str) -> Result<(), String> {
        if self.rules.remove(rule_id).is_none() {
            return Err(format!("Rule with ID {} not found", rule_id));
        }
        Ok(())
    }

    pub async fn get_rule(&self, rule_id: &str) -> Option<DetectionRule> {
        self.rules.get(rule_id).map(|r| r.clone())
    }

    pub async fn list_rules(&self) -> Vec<DetectionRule> {
        self.rules.iter().map(|r| r.clone()).collect()
    }

    pub async fn add_indicator(&self, indicator: ThreatIndicator) -> Result<(), String> {
        self.indicators.insert(indicator.id.clone(), indicator);
        Ok(())
    }

    pub async fn get_indicator(&self, indicator_id: &str) -> Option<ThreatIndicator> {
        self.indicators.get(indicator_id).map(|i| i.clone())
    }

    pub async fn remove_indicator(&self, indicator_id: &str) -> Result<(), String> {
        if self.indicators.remove(indicator_id).is_none() {
            return Err(format!("Indicator with ID {} not found", indicator_id));
        }
        Ok(())
    }
}

#[async_trait]
impl DetectionEngineTrait for DetectionEngine {
    async fn process_indicator(&self, indicator: ThreatIndicator) -> DetectionResult {
        let mut processed_events = self.processed_events.write().await;
        *processed_events += 1;

        // Store the indicator
        self.indicators.insert(indicator.id.clone(), indicator.clone());

        let mut matched_rules = Vec::new();
        let mut risk_score = 0.0;
        let mut recommended_actions = Vec::new();

        // Convert indicator to data map for rule evaluation
        let data = indicator_to_data_map(&indicator);

        // Evaluate all enabled rules
        for rule_ref in self.rules.iter() {
            let rule = rule_ref.value();
            if !rule.enabled {
                continue;
            }

            if self.evaluate_rule(rule, &data).await {
                matched_rules.push(rule.id.clone());
                risk_score += rule.priority as f64 * 0.1;
                recommended_actions.extend(rule.actions.clone());
            }
        }

        // Cap risk score at 10.0
        risk_score = risk_score.min(10.0);

        DetectionResult {
            indicator_id: indicator.id,
            matched_rules,
            risk_score,
            recommended_actions,
            timestamp: Utc::now().timestamp(),
        }
    }

    async fn evaluate_rule(&self, rule: &DetectionRule, data: &HashMap<String, serde_json::Value>) -> bool {
        let mut total_weight = 0.0;
        let mut matched_weight = 0.0;

        for condition in &rule.conditions {
            total_weight += condition.weight;

            if self.evaluate_condition(condition, data) {
                matched_weight += condition.weight;
            }
        }

        if total_weight == 0.0 {
            return false;
        }

        // Rule matches if matched weight exceeds 50% of total weight
        matched_weight / total_weight >= 0.5
    }

    async fn get_status(&self) -> ComponentStatus {
        let processed_events = *self.processed_events.read().await;
        let active_alerts = *self.active_alerts.read().await;
        let last_error = self.last_error.read().await.clone();

        ComponentStatus {
            status: "operational".to_string(),
            uptime: 0, // Would need to track actual uptime
            processed_events: processed_events as i64,
            active_alerts,
            last_error,
        }
    }
}

impl DetectionEngine {
    fn evaluate_condition(&self, condition: &RuleCondition, data: &HashMap<String, serde_json::Value>) -> bool {
        let field_value = match data.get(&condition.field) {
            Some(value) => value,
            None => return matches!(condition.operator, ConditionOperator::NotExists),
        };

        match condition.operator {
            ConditionOperator::Equals => {
                *field_value == condition.value
            }
            ConditionOperator::Contains => {
                if let (serde_json::Value::String(field_str), serde_json::Value::String(cond_str)) = (field_value, &condition.value) {
                    field_str.contains(cond_str)
                } else {
                    false
                }
            }
            ConditionOperator::Regex => {
                if let (serde_json::Value::String(field_str), serde_json::Value::String(pattern)) = (field_value, &condition.value) {
                    if let Ok(regex) = Regex::new(pattern) {
                        regex.is_match(&field_str)
                    } else {
                        false
                    }
                } else {
                    false
                }
            }
            ConditionOperator::Greater => {
                if let (serde_json::Value::Number(field_num), serde_json::Value::Number(cond_num)) = (field_value, &condition.value) {
                    if let (Some(field_f64), Some(cond_f64)) = (field_num.as_f64(), cond_num.as_f64()) {
                        field_f64 > cond_f64
                    } else {
                        false
                    }
                } else {
                    false
                }
            }
            ConditionOperator::Less => {
                if let (serde_json::Value::Number(field_num), serde_json::Value::Number(cond_num)) = (field_value, &condition.value) {
                    if let (Some(field_f64), Some(cond_f64)) = (field_num.as_f64(), cond_num.as_f64()) {
                        field_f64 < cond_f64
                    } else {
                        false
                    }
                } else {
                    false
                }
            }
            ConditionOperator::In => {
                if let serde_json::Value::Array(array) = &condition.value {
                    array.contains(&field_value)
                } else {
                    false
                }
            }
            ConditionOperator::NotIn => {
                if let serde_json::Value::Array(array) = &condition.value {
                    !array.contains(&field_value)
                } else {
                    false
                }
            }
            ConditionOperator::Exists => true,
            ConditionOperator::NotExists => false,
        }
    }
}

fn indicator_to_data_map(indicator: &ThreatIndicator) -> HashMap<String, serde_json::Value> {
    let mut data = HashMap::new();

    data.insert("id".to_string(), serde_json::Value::String(indicator.id.clone()));
    data.insert("indicator_type".to_string(), serde_json::to_value(&indicator.indicator_type).unwrap());
    data.insert("value".to_string(), serde_json::Value::String(indicator.value.clone()));
    data.insert("confidence".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(indicator.confidence).unwrap()));
    data.insert("severity".to_string(), serde_json::to_value(&indicator.severity).unwrap());
    data.insert("source".to_string(), serde_json::Value::String(indicator.source.clone()));
    data.insert("timestamp".to_string(), serde_json::to_value(&indicator.timestamp).unwrap());
    data.insert("tags".to_string(), serde_json::to_value(&indicator.tags).unwrap());

    // Add context fields
    if let Some(geolocation) = &indicator.context.geolocation {
        data.insert("geolocation".to_string(), serde_json::Value::String(geolocation.clone()));
    }
    if let Some(asn) = &indicator.context.asn {
        data.insert("asn".to_string(), serde_json::Value::String(asn.clone()));
    }
    if let Some(category) = &indicator.context.category {
        data.insert("category".to_string(), serde_json::Value::String(category.clone()));
    }

    data
}
