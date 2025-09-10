use crate::types::*;
use async_trait::async_trait;
use dashmap::DashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc, Duration, Timelike, Datelike};
use regex::Regex;

#[async_trait]
pub trait ZeroTrustEngineTrait {
    async fn evaluate_access(&self, request: AccessRequest) -> AccessDecision;
    async fn update_policy(&self, policy: ZeroTrustPolicy) -> Result<(), String>;
    async fn get_status(&self) -> ComponentStatus;
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ZeroTrustPolicy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub enabled: bool,
    pub conditions: Vec<PolicyCondition>,
    pub actions: Vec<PolicyAction>,
    pub priority: u32,
    pub metadata: PolicyMetadata,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PolicyCondition {
    pub condition_type: ConditionType,
    pub field: String,
    pub operator: ConditionOperator,
    pub value: serde_json::Value,
    pub weight: f64,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum ConditionType {
    User,
    Device,
    Location,
    Time,
    Behavior,
    Risk,
    Custom,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PolicyAction {
    pub action_type: PolicyActionType,
    pub parameters: std::collections::HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum PolicyActionType {
    Allow,
    Deny,
    Challenge,
    RequireMFA,
    RequireApproval,
    Log,
    Alert,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PolicyMetadata {
    pub author: String,
    pub created: DateTime<Utc>,
    pub modified: DateTime<Utc>,
    pub tags: Vec<String>,
    pub compliance_frameworks: Vec<String>,
}

#[derive(Clone)]
pub struct ZeroTrustEngine {
    policies: Arc<DashMap<String, ZeroTrustPolicy>>,
    access_history: Arc<DashMap<String, Vec<AccessRecord>>>,
    risk_thresholds: Arc<RwLock<RiskThresholds>>,
    processed_requests: Arc<RwLock<u64>>,
    active_challenges: Arc<RwLock<u32>>,
    last_error: Arc<RwLock<Option<String>>>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AccessRecord {
    pub request_id: String,
    pub decision: Decision,
    pub timestamp: DateTime<Utc>,
    pub risk_score: f64,
    pub factors: Vec<String>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RiskThresholds {
    pub low_risk: f64,
    pub medium_risk: f64,
    pub high_risk: f64,
    pub critical_risk: f64,
}

impl ZeroTrustEngine {
    pub fn new() -> Self {
        let mut engine = Self {
            policies: Arc::new(DashMap::new()),
            access_history: Arc::new(DashMap::new()),
            risk_thresholds: Arc::new(RwLock::new(RiskThresholds {
                low_risk: 2.0,
                medium_risk: 5.0,
                high_risk: 7.0,
                critical_risk: 9.0,
            })),
            processed_requests: Arc::new(RwLock::new(0)),
            active_challenges: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        };

        engine.initialize_default_policies();
        engine
    }

    fn initialize_default_policies(&mut self) {
        let policies = vec![
            ZeroTrustPolicy {
                id: "default_deny".to_string(),
                name: "Default Deny".to_string(),
                description: "Default deny policy for all access requests".to_string(),
                enabled: true,
                conditions: vec![],
                actions: vec![PolicyAction {
                    action_type: PolicyActionType::Deny,
                    parameters: {
                        let mut params = std::collections::HashMap::new();
                        params.insert("reason".to_string(), serde_json::Value::String("No matching policy".to_string()));
                        params
                    },
                }],
                priority: 0,
                metadata: PolicyMetadata {
                    author: "system".to_string(),
                    created: Utc::now(),
                    modified: Utc::now(),
                    tags: vec!["default".to_string(), "security".to_string()],
                    compliance_frameworks: vec!["NIST".to_string(), "Zero Trust".to_string()],
                },
            },
            ZeroTrustPolicy {
                id: "trusted_user_allow".to_string(),
                name: "Trusted User Allow".to_string(),
                description: "Allow access for trusted users from known locations".to_string(),
                enabled: true,
                conditions: vec![
                    PolicyCondition {
                        condition_type: ConditionType::User,
                        field: "user_trust_score".to_string(),
                        operator: ConditionOperator::Greater,
                        value: serde_json::Value::Number(serde_json::Number::from_f64(7.0).unwrap()),
                        weight: 3.0,
                    },
                    PolicyCondition {
                        condition_type: ConditionType::Location,
                        field: "location_trusted".to_string(),
                        operator: ConditionOperator::Equals,
                        value: serde_json::Value::Bool(true),
                        weight: 2.0,
                    },
                ],
                actions: vec![PolicyAction {
                    action_type: PolicyActionType::Allow,
                    parameters: std::collections::HashMap::new(),
                }],
                priority: 5,
                metadata: PolicyMetadata {
                    author: "system".to_string(),
                    created: Utc::now(),
                    modified: Utc::now(),
                    tags: vec!["user".to_string(), "location".to_string()],
                    compliance_frameworks: vec!["Zero Trust".to_string()],
                },
            },
            ZeroTrustPolicy {
                id: "high_risk_challenge".to_string(),
                name: "High Risk Challenge".to_string(),
                description: "Challenge high-risk access requests".to_string(),
                enabled: true,
                conditions: vec![
                    PolicyCondition {
                        condition_type: ConditionType::Risk,
                        field: "risk_score".to_string(),
                        operator: ConditionOperator::Greater,
                        value: serde_json::Value::Number(serde_json::Number::from_f64(6.0).unwrap()),
                        weight: 5.0,
                    },
                ],
                actions: vec![PolicyAction {
                    action_type: PolicyActionType::Challenge,
                    parameters: {
                        let mut params = std::collections::HashMap::new();
                        params.insert("challenge_type".to_string(), serde_json::Value::String("mfa".to_string()));
                        params
                    },
                }],
                priority: 8,
                metadata: PolicyMetadata {
                    author: "system".to_string(),
                    created: Utc::now(),
                    modified: Utc::now(),
                    tags: vec!["risk".to_string(), "challenge".to_string()],
                    compliance_frameworks: vec!["Zero Trust".to_string()],
                },
            },
            ZeroTrustPolicy {
                id: "untrusted_location_deny".to_string(),
                name: "Untrusted Location Deny".to_string(),
                description: "Deny access from untrusted locations".to_string(),
                enabled: true,
                conditions: vec![
                    PolicyCondition {
                        condition_type: ConditionType::Location,
                        field: "location_trusted".to_string(),
                        operator: ConditionOperator::Equals,
                        value: serde_json::Value::Bool(false),
                        weight: 4.0,
                    },
                    PolicyCondition {
                        condition_type: ConditionType::Risk,
                        field: "risk_score".to_string(),
                        operator: ConditionOperator::Greater,
                        value: serde_json::Value::Number(serde_json::Number::from_f64(3.0).unwrap()),
                        weight: 3.0,
                    },
                ],
                actions: vec![PolicyAction {
                    action_type: PolicyActionType::Deny,
                    parameters: {
                        let mut params = std::collections::HashMap::new();
                        params.insert("reason".to_string(), serde_json::Value::String("Untrusted location".to_string()));
                        params
                    },
                }],
                priority: 7,
                metadata: PolicyMetadata {
                    author: "system".to_string(),
                    created: Utc::now(),
                    modified: Utc::now(),
                    tags: vec!["location".to_string(), "deny".to_string()],
                    compliance_frameworks: vec!["Zero Trust".to_string()],
                },
            },
        ];

        for policy in policies {
            self.policies.insert(policy.id.clone(), policy);
        }
    }

    pub async fn add_policy(&self, policy: ZeroTrustPolicy) -> Result<(), String> {
        if self.policies.contains_key(&policy.id) {
            return Err(format!("Policy with ID {} already exists", policy.id));
        }
        let policy_id = policy.id.clone();
        self.policies.insert(policy_id, policy);
        Ok(())
    }

    pub async fn update_policy(&self, policy_id: String, policy: ZeroTrustPolicy) -> Result<(), String> {
        if !self.policies.contains_key(&policy_id) {
            return Err(format!("Policy with ID {} not found", policy_id));
        }
        self.policies.insert(policy_id, policy);
        Ok(())
    }

    pub async fn remove_policy(&self, policy_id: &str) -> Result<(), String> {
        if self.policies.remove(policy_id).is_none() {
            return Err(format!("Policy with ID {} not found", policy_id));
        }
        Ok(())
    }

    pub async fn get_policy(&self, policy_id: &str) -> Option<ZeroTrustPolicy> {
        self.policies.get(policy_id).map(|p| p.clone())
    }

    pub async fn list_policies(&self) -> Vec<ZeroTrustPolicy> {
        self.policies.iter().map(|p| p.clone()).collect()
    }

    pub async fn calculate_risk_score(&self, request: &AccessRequest) -> f64 {
        let mut risk_score = 0.0;

        // Location-based risk
        if let Some(location) = &request.context.location {
            if location.country.as_deref() != Some("US") {
                risk_score += 2.0;
            }
            if location.city.as_deref() == Some("Unknown") {
                risk_score += 1.5;
            }
        }

        // Time-based risk (unusual hours)
        let datetime = DateTime::from_timestamp(request.timestamp, 0).unwrap_or_else(|| Utc::now());
        let hour = datetime.hour();
        if hour < 6 || hour > 22 {
            risk_score += 1.0;
        }

        // Device fingerprint risk
        if request.context.device_fingerprint.is_none() {
            risk_score += 1.5;
        }

        // User agent risk
        if let Some(ua) = &request.context.user_agent {
            if ua.contains("bot") || ua.contains("crawler") {
                risk_score += 3.0;
            }
        }

        // IP reputation (simplified)
        if let Some(ip) = &request.context.ip_address {
            if self.is_suspicious_ip(ip).await {
                risk_score += 2.5;
            }
        }

        // Behavioral risk factors
        risk_score += request.context.risk_factors.len() as f64 * 0.5;

        risk_score
    }

    async fn is_suspicious_ip(&self, ip: &str) -> bool {
        // Simplified IP reputation check
        // In a real implementation, this would query threat intelligence feeds
        let suspicious_ranges = vec![
            "10.0.0.0/8",
            "172.16.0.0/12",
            "192.168.0.0/16",
        ];

        for range in suspicious_ranges {
            if let Ok(network) = range.parse::<cidr::IpCidr>() {
                if let Ok(ip_addr) = ip.parse::<std::net::IpAddr>() {
                    if network.contains(&ip_addr) {
                        return true;
                    }
                }
            }
        }

        false
    }

    pub async fn evaluate_policies(&self, request: &AccessRequest, risk_score: f64) -> (Decision, String, Vec<String>) {
        let mut best_decision = Decision::Deny;
        let mut best_reason = "No matching policy".to_string();
        let mut matched_policies = Vec::new();
        let mut highest_priority = 0u32;

        // Convert request to data map for condition evaluation
        let data = self.request_to_data_map(request, risk_score);

        // Evaluate policies in priority order (higher priority first)
        let mut sorted_policies: Vec<_> = self.policies.iter().collect();
        sorted_policies.sort_by(|a, b| b.value().priority.cmp(&a.value().priority));

        for policy_ref in sorted_policies {
            let policy = policy_ref.value();
            if !policy.enabled {
                continue;
            }

            if self.evaluate_policy_conditions(policy, &data).await {
                matched_policies.push(policy.id.clone());

                if policy.priority > highest_priority {
                    highest_priority = policy.priority;
                    best_decision = self.policy_actions_to_decision(&policy.actions);
                    best_reason = format!("Matched policy: {}", policy.name);
                }
            }
        }

        (best_decision, best_reason, matched_policies)
    }

    async fn evaluate_policy_conditions(&self, policy: &ZeroTrustPolicy, data: &std::collections::HashMap<String, serde_json::Value>) -> bool {
        let mut total_weight = 0.0;
        let mut matched_weight = 0.0;

        for condition in &policy.conditions {
            total_weight += condition.weight;

            if self.evaluate_policy_condition(condition, data) {
                matched_weight += condition.weight;
            }
        }

        if total_weight == 0.0 {
            // Policy with no conditions matches everything
            return true;
        }

        // Policy matches if matched weight exceeds 60% of total weight
        matched_weight / total_weight >= 0.6
    }

    fn evaluate_policy_condition(&self, condition: &PolicyCondition, data: &std::collections::HashMap<String, serde_json::Value>) -> bool {
        let field_value = match data.get(&condition.field) {
            Some(value) => value,
            None => return false,
        };

        match condition.operator {
            ConditionOperator::Equals => field_value == &condition.value,
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
                        regex.is_match(field_str)
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
                    array.contains(field_value)
                } else {
                    false
                }
            }
            ConditionOperator::NotIn => {
                if let serde_json::Value::Array(array) = &condition.value {
                    !array.contains(field_value)
                } else {
                    false
                }
            }
            ConditionOperator::Exists => true,
            ConditionOperator::NotExists => false,
        }
    }

    fn policy_actions_to_decision(&self, actions: &[PolicyAction]) -> Decision {
        // Return the most restrictive decision from the actions
        for action in actions {
            match action.action_type {
                PolicyActionType::Deny => return Decision::Deny,
                PolicyActionType::RequireApproval => return Decision::RequireApproval,
                PolicyActionType::RequireMFA => return Decision::RequireMFA,
                PolicyActionType::Challenge => return Decision::Challenge,
                PolicyActionType::Allow => return Decision::Allow,
                _ => continue,
            }
        }
        Decision::Deny
    }

    fn request_to_data_map(&self, request: &AccessRequest, risk_score: f64) -> std::collections::HashMap<String, serde_json::Value> {
        let mut data = std::collections::HashMap::new();

        data.insert("user_id".to_string(), serde_json::Value::String(request.user_id.clone()));
        data.insert("resource".to_string(), serde_json::Value::String(request.resource.clone()));
        data.insert("action".to_string(), serde_json::Value::String(request.action.clone()));
        data.insert("timestamp".to_string(), serde_json::to_value(&request.timestamp).unwrap());
        data.insert("risk_score".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(risk_score).unwrap()));

        // Context fields
        if let Some(ip) = &request.context.ip_address {
            data.insert("ip_address".to_string(), serde_json::Value::String(ip.clone()));
        }
        if let Some(ua) = &request.context.user_agent {
            data.insert("user_agent".to_string(), serde_json::Value::String(ua.clone()));
        }
        if let Some(location) = &request.context.location {
            data.insert("location_country".to_string(), serde_json::Value::String(location.country.clone().unwrap_or_default()));
            data.insert("location_city".to_string(), serde_json::Value::String(location.city.clone().unwrap_or_default()));
            data.insert("location_trusted".to_string(), serde_json::Value::Bool(location.country.as_deref() == Some("US")));
        }
        if let Some(device_fp) = &request.context.device_fingerprint {
            data.insert("device_fingerprint".to_string(), serde_json::Value::String(device_fp.clone()));
        }
        if let Some(session_id) = &request.context.session_id {
            data.insert("session_id".to_string(), serde_json::Value::String(session_id.clone()));
        }

        // Risk factors
        data.insert("risk_factors".to_string(), serde_json::to_value(&request.context.risk_factors).unwrap());

        // Derived fields - convert timestamp to DateTime for analysis
        let datetime = DateTime::from_timestamp(request.timestamp, 0).unwrap_or_else(|| Utc::now());
        data.insert("is_business_hours".to_string(), serde_json::Value::Bool((9..=17).contains(&datetime.hour())));
        data.insert("is_weekend".to_string(), serde_json::Value::Bool(datetime.weekday().number_from_monday() >= 6));

        data
    }

    pub async fn record_access_decision(&self, request: &AccessRequest, decision: &Decision, risk_score: f64, factors: Vec<String>) {
        let record = AccessRecord {
            request_id: request.id.clone(),
            decision: decision.clone(),
            timestamp: Utc::now(),
            risk_score,
            factors,
        };

        self.access_history.entry(request.user_id.clone()).or_insert_with(Vec::new).push(record);

        // Keep only last 1000 records per user
        if let Some(mut history) = self.access_history.get_mut(&request.user_id) {
            let current_len = history.len();
            if current_len > 1000 {
                history.drain(0..(current_len - 1000));
            }
        }
    }

    pub async fn get_user_access_history(&self, user_id: &str) -> Vec<AccessRecord> {
        self.access_history.get(user_id).map(|h| h.clone()).unwrap_or_default()
    }
}

#[async_trait]
impl ZeroTrustEngineTrait for ZeroTrustEngine {
    async fn evaluate_access(&self, request: AccessRequest) -> AccessDecision {
        let mut processed_requests = self.processed_requests.write().await;
        *processed_requests += 1;

        // Calculate risk score
        let risk_score = self.calculate_risk_score(&request).await;

        // Evaluate policies
        let (decision, reason, matched_policies) = self.evaluate_policies(&request, risk_score).await;

        // Record the decision
        let risk_factors = request.context.risk_factors.clone();
        self.record_access_decision(&request, &decision, risk_score, risk_factors).await;

        // Update active challenges count
        if matches!(decision, Decision::Challenge | Decision::RequireMFA | Decision::RequireApproval) {
            let mut active_challenges = self.active_challenges.write().await;
            *active_challenges += 1;
        }

        AccessDecision {
            request_id: request.id,
            decision,
            confidence: (10.0 - risk_score) / 10.0, // Higher confidence for lower risk
            reason,
            additional_checks: matched_policies,
            timestamp: Utc::now().timestamp(),
        }
    }

    async fn update_policy(&self, policy: ZeroTrustPolicy) -> Result<(), String> {
        let policy_id = policy.id.clone();
        self.policies.insert(policy_id, policy);
        Ok(())
    }

    async fn get_status(&self) -> ComponentStatus {
        let processed_requests = *self.processed_requests.read().await;
        let active_challenges = *self.active_challenges.read().await;
        let last_error = self.last_error.read().await.clone();

        ComponentStatus {
            status: "operational".to_string(),
            uptime: 0, // Would need to track actual uptime
            processed_events: processed_requests as i64,
            active_alerts: active_challenges,
            last_error,
        }
    }
}
