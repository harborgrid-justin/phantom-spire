use crate::types::*;
use async_trait::async_trait;
use dashmap::DashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::Utc;
use std::collections::HashMap;
use napi_derive::napi;
use regex::Regex;

#[async_trait]
pub trait DataLossPreventionTrait {
    async fn scan_data(&self, scan_request: DlpScanRequest) -> DlpScanResult;
    async fn classify_data(&self, data: &str) -> DataClassification;
    async fn apply_policy(&self, policy: DlpPolicy, data_context: DataContext) -> PolicyDecision;
    async fn get_status(&self) -> ComponentStatus;
}

#[derive(Clone)]
pub struct DataLossPreventionEngine {
    policies: Arc<DashMap<String, DlpPolicy>>,
    data_patterns: Arc<DashMap<String, DataPattern>>,
    scan_results: Arc<DashMap<String, DlpScanResult>>,
    violations: Arc<DashMap<String, DlpViolation>>,
    processed_scans: Arc<RwLock<u64>>,
    violations_detected: Arc<RwLock<u32>>,
    last_error: Arc<RwLock<Option<String>>>,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DlpScanRequest {
    pub scan_id: String,
    pub data_source: String, // "email", "file_system", "database", "network", "endpoint"
    pub scan_type: String, // "full", "incremental", "targeted"
    pub target_path: String,
    pub include_archives: bool,
    pub max_file_size: i64, // bytes
    pub file_types: Vec<String>,
    pub exclusions: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DlpPolicy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub severity: String, // "low", "medium", "high", "critical"
    pub action: String, // "allow", "warn", "block", "quarantine", "encrypt"
    pub data_types: Vec<String>, // "pii", "phi", "pci", "financial", "confidential"
    pub patterns: Vec<String>, // Pattern IDs
    pub conditions: Vec<PolicyCondition>,
    pub scope: Vec<String>, // "email", "files", "database", "network"
    pub exceptions: Vec<String>,
    pub enabled: bool,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PolicyCondition {
    pub field: String, // "file_size", "sender", "recipient", "location", "time"
    pub operator: String, // "equals", "contains", "greater_than", "less_than", "regex"
    pub value: String,
    pub case_sensitive: bool,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DataPattern {
    pub id: String,
    pub name: String,
    pub data_type: String, // "ssn", "credit_card", "email", "phone", "passport", "custom"
    pub regex_pattern: String,
    pub confidence_threshold: f64,
    pub context_keywords: Vec<String>,
    pub validation_rules: Vec<String>,
    pub false_positive_patterns: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DataContext {
    pub source: String,
    pub location: String,
    pub file_name: Option<String>,
    pub file_type: Option<String>,
    pub sender: Option<String>,
    pub recipient: Option<String>,
    pub timestamp: i64,
    pub metadata: String, // JSON string of additional context
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DataClassification {
    pub data_type: String,
    pub confidence: f64,
    pub sensitive_elements: Vec<SensitiveElement>,
    pub risk_level: String, // "low", "medium", "high", "critical"
    pub recommended_handling: String,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SensitiveElement {
    pub element_type: String,
    pub value: String, // masked or hashed
    pub position: i32,
    pub length: i32,
    pub confidence: f64,
    pub context: String,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PolicyDecision {
    pub policy_id: String,
    pub action: String, // "allow", "warn", "block", "quarantine", "encrypt"
    pub confidence: f64,
    pub reason: String,
    pub triggered_rules: Vec<String>,
    pub recommendations: Vec<String>,
    pub metadata: String,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DlpScanResult {
    pub scan_id: String,
    pub status: String, // "completed", "running", "failed", "cancelled"
    pub total_files_scanned: u32,
    pub files_with_violations: u32,
    pub total_violations: u32,
    pub violations_by_type: String, // JSON map of type -> count
    pub high_risk_violations: u32,
    pub scan_duration: i64, // milliseconds
    pub data_volume_scanned: i64, // bytes
    pub violations: Vec<DlpViolation>,
    pub timestamp: i64,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DlpViolation {
    pub id: String,
    pub scan_id: String,
    pub policy_id: String,
    pub policy_name: String,
    pub severity: String,
    pub action_taken: String,
    pub data_type: String,
    pub source_location: String,
    pub file_name: Option<String>,
    pub violation_details: String,
    pub sensitive_data_count: u32,
    pub context: DataContext,
    pub remediation_status: String, // "pending", "in_progress", "resolved", "accepted_risk"
    pub assigned_to: Option<String>,
    pub timestamp: i64,
}

impl DataLossPreventionEngine {
    pub fn new() -> Self {
        let mut engine = Self {
            policies: Arc::new(DashMap::new()),
            data_patterns: Arc::new(DashMap::new()),
            scan_results: Arc::new(DashMap::new()),
            violations: Arc::new(DashMap::new()),
            processed_scans: Arc::new(RwLock::new(0)),
            violations_detected: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        };

        // Initialize with sample policies and patterns
        engine.initialize_default_policies();
        engine.initialize_data_patterns();
        engine
    }

    fn initialize_default_policies(&self) {
        let policies = vec![
            DlpPolicy {
                id: "pii-protection".to_string(),
                name: "PII Protection Policy".to_string(),
                description: "Protect personally identifiable information from unauthorized disclosure".to_string(),
                severity: "high".to_string(),
                action: "block".to_string(),
                data_types: vec!["pii".to_string(), "ssn".to_string(), "email".to_string()],
                patterns: vec!["ssn-pattern".to_string(), "email-pattern".to_string()],
                conditions: vec![
                    PolicyCondition {
                        field: "file_size".to_string(),
                        operator: "greater_than".to_string(),
                        value: "1024".to_string(),
                        case_sensitive: false,
                    },
                ],
                scope: vec!["email".to_string(), "files".to_string()],
                exceptions: vec!["hr-department".to_string()],
                enabled: true,
            },
            DlpPolicy {
                id: "financial-data".to_string(),
                name: "Financial Data Protection".to_string(),
                description: "Protect credit card and financial information".to_string(),
                severity: "critical".to_string(),
                action: "quarantine".to_string(),
                data_types: vec!["pci".to_string(), "financial".to_string()],
                patterns: vec!["credit-card-pattern".to_string()],
                conditions: vec![],
                scope: vec!["email".to_string(), "files".to_string(), "database".to_string()],
                exceptions: vec![],
                enabled: true,
            },
            DlpPolicy {
                id: "confidential-documents".to_string(),
                name: "Confidential Document Protection".to_string(),
                description: "Protect documents marked as confidential or proprietary".to_string(),
                severity: "medium".to_string(),
                action: "warn".to_string(),
                data_types: vec!["confidential".to_string()],
                patterns: vec!["confidential-pattern".to_string()],
                conditions: vec![
                    PolicyCondition {
                        field: "location".to_string(),
                        operator: "contains".to_string(),
                        value: "external".to_string(),
                        case_sensitive: false,
                    },
                ],
                scope: vec!["email".to_string(), "files".to_string()],
                exceptions: vec!["approved-partners".to_string()],
                enabled: true,
            },
        ];

        for policy in policies {
            self.policies.insert(policy.id.clone(), policy);
        }
    }

    fn initialize_data_patterns(&self) {
        let patterns = vec![
            DataPattern {
                id: "ssn-pattern".to_string(),
                name: "Social Security Number".to_string(),
                data_type: "ssn".to_string(),
                regex_pattern: r"\b\d{3}-?\d{2}-?\d{4}\b".to_string(),
                confidence_threshold: 0.8,
                context_keywords: vec!["ssn".to_string(), "social".to_string(), "security".to_string()],
                validation_rules: vec!["luhn-check".to_string()],
                false_positive_patterns: vec![r"\d{3}-?\d{2}-?0000".to_string()],
            },
            DataPattern {
                id: "credit-card-pattern".to_string(),
                name: "Credit Card Number".to_string(),
                data_type: "credit_card".to_string(),
                regex_pattern: r"\b(?:\d{4}[-\s]?){3}\d{4}\b".to_string(),
                confidence_threshold: 0.9,
                context_keywords: vec!["card".to_string(), "visa".to_string(), "mastercard".to_string(), "amex".to_string()],
                validation_rules: vec!["luhn-algorithm".to_string()],
                false_positive_patterns: vec![r"0000[-\s]?0000[-\s]?0000[-\s]?0000".to_string()],
            },
            DataPattern {
                id: "email-pattern".to_string(),
                name: "Email Address".to_string(),
                data_type: "email".to_string(),
                regex_pattern: r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b".to_string(),
                confidence_threshold: 0.95,
                context_keywords: vec!["email".to_string(), "contact".to_string(), "address".to_string()],
                validation_rules: vec!["domain-validation".to_string()],
                false_positive_patterns: vec![r"test@example\.com".to_string()],
            },
            DataPattern {
                id: "confidential-pattern".to_string(),
                name: "Confidential Content".to_string(),
                data_type: "confidential".to_string(),
                regex_pattern: r"(?i)\b(confidential|proprietary|internal\s+use|restricted)\b".to_string(),
                confidence_threshold: 0.7,
                context_keywords: vec!["confidential".to_string(), "proprietary".to_string(), "restricted".to_string()],
                validation_rules: vec![],
                false_positive_patterns: vec![],
            },
        ];

        for pattern in patterns {
            self.data_patterns.insert(pattern.id.clone(), pattern);
        }
    }

    pub async fn get_all_policies(&self) -> Vec<DlpPolicy> {
        self.policies.iter().map(|entry| entry.value().clone()).collect()
    }

    pub async fn get_policy(&self, policy_id: &str) -> Option<DlpPolicy> {
        self.policies.get(policy_id).map(|entry| entry.value().clone())
    }

    pub async fn update_policy(&self, policy: DlpPolicy) -> Result<(), String> {
        self.policies.insert(policy.id.clone(), policy);
        Ok(())
    }

    pub async fn get_violations_by_policy(&self, policy_id: &str) -> Vec<DlpViolation> {
        self.violations
            .iter()
            .filter(|entry| entry.value().policy_id == policy_id)
            .map(|entry| entry.value().clone())
            .collect()
    }

    pub async fn get_recent_violations(&self, hours: i64) -> Vec<DlpViolation> {
        let threshold = (Utc::now() - chrono::Duration::hours(hours)).timestamp();
        self.violations
            .iter()
            .filter(|entry| entry.value().timestamp > threshold)
            .map(|entry| entry.value().clone())
            .collect()
    }
}

#[async_trait]
impl DataLossPreventionTrait for DataLossPreventionEngine {
    async fn scan_data(&self, scan_request: DlpScanRequest) -> DlpScanResult {
        let mut processed_scans = self.processed_scans.write().await;
        *processed_scans += 1;

        let start_time = Utc::now().timestamp_millis();

        // Simulate data scanning
        let mut violations = vec![];
        let mut total_files = 0;
        let mut files_with_violations = 0;
        let mut violations_by_type = HashMap::new();

        // Simulate different scan scenarios based on data source
        match scan_request.data_source.as_str() {
            "email" => {
                total_files = 50;
                violations.extend(self.simulate_email_scan(&scan_request).await);
            },
            "file_system" => {
                total_files = 1000;
                violations.extend(self.simulate_file_scan(&scan_request).await);
            },
            "database" => {
                total_files = 10;
                violations.extend(self.simulate_database_scan(&scan_request).await);
            },
            _ => {
                total_files = 100;
                violations.extend(self.simulate_generic_scan(&scan_request).await);
            }
        }

        // Count violations by type
        for violation in &violations {
            let count = violations_by_type.entry(violation.data_type.clone()).or_insert(0);
            *count += 1;
        }

        files_with_violations = violations.len().min(total_files as usize) as u32;
        let high_risk_violations = violations
            .iter()
            .filter(|v| v.severity == "high" || v.severity == "critical")
            .count() as u32;

        // Store violations
        for violation in &violations {
            self.violations.insert(violation.id.clone(), violation.clone());
        }

        let end_time = Utc::now().timestamp_millis();

        let result = DlpScanResult {
            scan_id: scan_request.scan_id.clone(),
            status: "completed".to_string(),
            total_files_scanned: total_files,
            files_with_violations,
            total_violations: violations.len() as u32,
            violations_by_type: serde_json::to_string(&violations_by_type).unwrap_or_default(),
            high_risk_violations,
            scan_duration: end_time - start_time,
            data_volume_scanned: total_files as i64 * 1024 * 1024, // Simulate 1MB per file
            violations: violations.clone(),
            timestamp: Utc::now().timestamp(),
        };

        self.scan_results.insert(scan_request.scan_id, result.clone());

        // Update violations counter
        let mut violations_detected = self.violations_detected.write().await;
        *violations_detected = high_risk_violations;

        result
    }

    async fn classify_data(&self, data: &str) -> DataClassification {
        let mut sensitive_elements = vec![];
        let mut max_confidence = 0.0;
        let mut data_type = "unknown".to_string();

        // Check against all patterns
        for pattern_entry in self.data_patterns.iter() {
            let pattern = pattern_entry.value();
            
            if let Ok(regex) = Regex::new(&pattern.regex_pattern) {
                for mat in regex.find_iter(data) {
                    let confidence = self.calculate_pattern_confidence(pattern, data, mat.start(), mat.end());
                    
                    if confidence > pattern.confidence_threshold {
                        sensitive_elements.push(SensitiveElement {
                            element_type: pattern.data_type.clone(),
                            value: self.mask_sensitive_data(mat.as_str()),
                            position: mat.start() as i32,
                            length: mat.len() as i32,
                            confidence,
                            context: self.extract_context(data, mat.start(), mat.end()),
                        });

                        if confidence > max_confidence {
                            max_confidence = confidence;
                            data_type = pattern.data_type.clone();
                        }
                    }
                }
            }
        }

        let risk_level = match (data_type.as_str(), max_confidence) {
            ("ssn" | "credit_card", _) => "critical",
            ("email" | "phone", c) if c > 0.8 => "high",
            ("confidential", c) if c > 0.7 => "medium",
            _ if !sensitive_elements.is_empty() => "low",
            _ => "none",
        };

        let recommended_handling = match risk_level {
            "critical" => "encrypt_and_restrict_access",
            "high" => "restrict_access",
            "medium" => "monitor_access",
            "low" => "standard_handling",
            _ => "no_special_handling",
        };

        DataClassification {
            data_type,
            confidence: max_confidence,
            sensitive_elements,
            risk_level: risk_level.to_string(),
            recommended_handling: recommended_handling.to_string(),
        }
    }

    async fn apply_policy(&self, policy: DlpPolicy, data_context: DataContext) -> PolicyDecision {
        let mut triggered_rules = vec![];
        let mut confidence: f64 = 0.0;
        let mut should_trigger = false;

        // Check if policy applies to this data source
        if !policy.scope.contains(&data_context.source) {
            return PolicyDecision {
                policy_id: policy.id,
                action: "allow".to_string(),
                confidence: 1.0,
                reason: "Policy scope does not apply to this data source".to_string(),
                triggered_rules: vec![],
                recommendations: vec![],
                metadata: "{}".to_string(),
            };
        }

        // Evaluate conditions
        for condition in &policy.conditions {
            if self.evaluate_condition(condition, &data_context) {
                triggered_rules.push(format!("Condition: {} {} {}", condition.field, condition.operator, condition.value));
                should_trigger = true;
                confidence += 0.3;
            }
        }

        // Check if any data patterns match
        for pattern_id in &policy.patterns {
            if let Some(pattern) = self.data_patterns.get(pattern_id) {
                triggered_rules.push(format!("Pattern: {}", pattern.name));
                should_trigger = true;
                confidence += 0.4;
            }
        }

        confidence = confidence.min(1.0);

        let action = if should_trigger && policy.enabled {
            policy.action.clone()
        } else {
            "allow".to_string()
        };

        let reason = if should_trigger {
            format!("Policy '{}' triggered due to {} rule(s)", policy.name, triggered_rules.len())
        } else {
            "No policy violations detected".to_string()
        };

        let recommendations = match action.as_str() {
            "block" => vec!["Data transmission blocked".to_string(), "Review data handling procedures".to_string()],
            "quarantine" => vec!["Data quarantined for review".to_string(), "Contact security team".to_string()],
            "warn" => vec!["User warned about sensitive data".to_string(), "Monitor future activities".to_string()],
            _ => vec![],
        };

        PolicyDecision {
            policy_id: policy.id,
            action,
            confidence,
            reason,
            triggered_rules,
            recommendations,
            metadata: serde_json::to_string(&data_context).unwrap_or_default(),
        }
    }

    async fn get_status(&self) -> ComponentStatus {
        let processed_scans = *self.processed_scans.read().await;
        let violations_detected = *self.violations_detected.read().await;
        let last_error = self.last_error.read().await.clone();

        ComponentStatus {
            status: "operational".to_string(),
            uptime: 0,
            processed_events: processed_scans as i64,
            active_alerts: violations_detected,
            last_error,
        }
    }
}

impl DataLossPreventionEngine {
    async fn simulate_email_scan(&self, _scan_request: &DlpScanRequest) -> Vec<DlpViolation> {
        vec![
            DlpViolation {
                id: format!("violation-email-{}", Utc::now().timestamp()),
                scan_id: _scan_request.scan_id.clone(),
                policy_id: "pii-protection".to_string(),
                policy_name: "PII Protection Policy".to_string(),
                severity: "high".to_string(),
                action_taken: "blocked".to_string(),
                data_type: "ssn".to_string(),
                source_location: "john.doe@company.com -> external@client.com".to_string(),
                file_name: None,
                violation_details: "Email contains 2 SSN numbers in message body".to_string(),
                sensitive_data_count: 2,
                context: DataContext {
                    source: "email".to_string(),
                    location: "outbound".to_string(),
                    file_name: None,
                    file_type: None,
                    sender: Some("john.doe@company.com".to_string()),
                    recipient: Some("external@client.com".to_string()),
                    timestamp: Utc::now().timestamp(),
                    metadata: r#"{"message_id": "msg123", "subject": "Customer Information"}"#.to_string(),
                },
                remediation_status: "pending".to_string(),
                assigned_to: Some("security-team".to_string()),
                timestamp: Utc::now().timestamp(),
            },
        ]
    }

    async fn simulate_file_scan(&self, _scan_request: &DlpScanRequest) -> Vec<DlpViolation> {
        vec![
            DlpViolation {
                id: format!("violation-file-{}", Utc::now().timestamp()),
                scan_id: _scan_request.scan_id.clone(),
                policy_id: "financial-data".to_string(),
                policy_name: "Financial Data Protection".to_string(),
                severity: "critical".to_string(),
                action_taken: "quarantined".to_string(),
                data_type: "credit_card".to_string(),
                source_location: "/shared/finance/customer_payments.xlsx".to_string(),
                file_name: Some("customer_payments.xlsx".to_string()),
                violation_details: "Spreadsheet contains 150 credit card numbers".to_string(),
                sensitive_data_count: 150,
                context: DataContext {
                    source: "file_system".to_string(),
                    location: "/shared/finance/".to_string(),
                    file_name: Some("customer_payments.xlsx".to_string()),
                    file_type: Some("xlsx".to_string()),
                    sender: None,
                    recipient: None,
                    timestamp: Utc::now().timestamp(),
                    metadata: r#"{"file_size": 2048576, "last_modified": "2024-01-15T10:30:00Z"}"#.to_string(),
                },
                remediation_status: "pending".to_string(),
                assigned_to: Some("finance-team".to_string()),
                timestamp: Utc::now().timestamp(),
            },
        ]
    }

    async fn simulate_database_scan(&self, _scan_request: &DlpScanRequest) -> Vec<DlpViolation> {
        vec![
            DlpViolation {
                id: format!("violation-db-{}", Utc::now().timestamp()),
                scan_id: _scan_request.scan_id.clone(),
                policy_id: "pii-protection".to_string(),
                policy_name: "PII Protection Policy".to_string(),
                severity: "medium".to_string(),
                action_taken: "logged".to_string(),
                data_type: "email".to_string(),
                source_location: "database.customers.email".to_string(),
                file_name: None,
                violation_details: "Database table contains unencrypted email addresses".to_string(),
                sensitive_data_count: 5000,
                context: DataContext {
                    source: "database".to_string(),
                    location: "prod-db-01".to_string(),
                    file_name: None,
                    file_type: None,
                    sender: None,
                    recipient: None,
                    timestamp: Utc::now().timestamp(),
                    metadata: r#"{"table": "customers", "column": "email", "row_count": 5000}"#.to_string(),
                },
                remediation_status: "accepted_risk".to_string(),
                assigned_to: Some("dba-team".to_string()),
                timestamp: Utc::now().timestamp(),
            },
        ]
    }

    async fn simulate_generic_scan(&self, _scan_request: &DlpScanRequest) -> Vec<DlpViolation> {
        vec![]
    }

    fn calculate_pattern_confidence(&self, pattern: &DataPattern, data: &str, start: usize, end: usize) -> f64 {
        let mut confidence: f64 = 0.7; // Base confidence

        // Check for context keywords
        let context = self.extract_context(data, start, end);
        for keyword in &pattern.context_keywords {
            if context.to_lowercase().contains(&keyword.to_lowercase()) {
                confidence += 0.1;
            }
        }

        // Check for false positive patterns
        let matched_text = &data[start..end];
        for fp_pattern in &pattern.false_positive_patterns {
            if let Ok(regex) = Regex::new(fp_pattern) {
                if regex.is_match(matched_text) {
                    confidence -= 0.3;
                }
            }
        }

        confidence.max(0.0).min(1.0)
    }

    fn mask_sensitive_data(&self, data: &str) -> String {
        if data.len() <= 4 {
            "*".repeat(data.len())
        } else {
            format!("{}****{}", &data[..2], &data[data.len()-2..])
        }
    }

    fn extract_context(&self, data: &str, start: usize, end: usize) -> String {
        let context_size = 50;
        let context_start = start.saturating_sub(context_size);
        let context_end = (end + context_size).min(data.len());
        data[context_start..context_end].to_string()
    }

    fn evaluate_condition(&self, condition: &PolicyCondition, context: &DataContext) -> bool {
        let target_value = match condition.field.as_str() {
            "file_size" => context.metadata.clone(),
            "sender" => context.sender.clone().unwrap_or_default(),
            "recipient" => context.recipient.clone().unwrap_or_default(),
            "location" => context.location.clone(),
            _ => String::new(),
        };

        match condition.operator.as_str() {
            "equals" => target_value == condition.value,
            "contains" => {
                if condition.case_sensitive {
                    target_value.contains(&condition.value)
                } else {
                    target_value.to_lowercase().contains(&condition.value.to_lowercase())
                }
            },
            "greater_than" => {
                if let (Ok(target), Ok(threshold)) = (target_value.parse::<i64>(), condition.value.parse::<i64>()) {
                    target > threshold
                } else {
                    false
                }
            },
            "less_than" => {
                if let (Ok(target), Ok(threshold)) = (target_value.parse::<i64>(), condition.value.parse::<i64>()) {
                    target < threshold
                } else {
                    false
                }
            },
            "regex" => {
                if let Ok(regex) = Regex::new(&condition.value) {
                    regex.is_match(&target_value)
                } else {
                    false
                }
            },
            _ => false,
        }
    }
}