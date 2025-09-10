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
pub trait EmailSecurityTrait {
    async fn scan_email(&self, email: EmailMessage) -> EmailScanResult;
    async fn analyze_attachment(&self, attachment: EmailAttachment) -> AttachmentAnalysis;
    async fn check_sender_reputation(&self, sender: &str) -> SenderReputation;
    async fn get_status(&self) -> ComponentStatus;
}

#[derive(Clone)]
pub struct EmailSecurityGateway {
    policies: Arc<DashMap<String, EmailSecurityPolicy>>,
    quarantine: Arc<DashMap<String, QuarantinedEmail>>,
    reputation_cache: Arc<DashMap<String, SenderReputation>>,
    processed_emails: Arc<RwLock<u64>>,
    blocked_emails: Arc<RwLock<u32>>,
    last_error: Arc<RwLock<Option<String>>>,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct EmailMessage {
    pub id: String,
    pub sender: String,
    pub recipients: Vec<String>,
    pub subject: String,
    pub body: String,
    pub headers: String, // JSON string of email headers
    pub attachments: Vec<EmailAttachment>,
    pub timestamp: i64,
    pub message_size: i64, // bytes
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct EmailAttachment {
    pub filename: String,
    pub content_type: String,
    pub size: i64, // bytes
    pub hash: String, // SHA256 hash
    pub content: String, // Base64 encoded content or path
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct EmailSecurityPolicy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub enabled: bool,
    pub priority: u32,
    pub conditions: Vec<EmailCondition>,
    pub actions: Vec<String>, // "allow", "quarantine", "block", "strip_attachments"
    pub scope: Vec<String>, // "inbound", "outbound", "internal"
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct EmailCondition {
    pub condition_type: String, // "sender", "subject", "attachment", "content", "size"
    pub operator: String, // "contains", "regex", "equals", "greater_than", "less_than"
    pub value: String,
    pub case_sensitive: bool,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct EmailScanResult {
    pub email_id: String,
    pub overall_risk: String, // "low", "medium", "high", "critical"
    pub action_taken: String, // "delivered", "quarantined", "blocked", "modified"
    pub threat_indicators: Vec<ThreatIndicator>,
    pub policy_violations: Vec<PolicyViolation>,
    pub attachment_analysis: Vec<AttachmentAnalysis>,
    pub sender_reputation: SenderReputation,
    pub scan_duration: i64, // milliseconds
    pub timestamp: i64,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AttachmentAnalysis {
    pub filename: String,
    pub risk_level: String, // "safe", "suspicious", "malicious"
    pub file_type: String,
    pub detected_threats: Vec<String>,
    pub sandbox_results: Option<String>, // JSON string of sandbox analysis
    pub recommendations: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SenderReputation {
    pub sender: String,
    pub reputation_score: f64, // 0.0 to 100.0
    pub category: String, // "trusted", "neutral", "suspicious", "malicious"
    pub threat_types: Vec<String>,
    pub first_seen: i64,
    pub last_seen: i64,
    pub email_count: u32,
    pub sources: Vec<String>, // reputation sources
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PolicyViolation {
    pub policy_id: String,
    pub policy_name: String,
    pub violation_type: String,
    pub description: String,
    pub severity: String,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct QuarantinedEmail {
    pub id: String,
    pub original_email: EmailMessage,
    pub quarantine_reason: String,
    pub quarantine_time: i64,
    pub release_time: Option<i64>,
    pub status: String, // "quarantined", "released", "deleted"
}

impl EmailSecurityGateway {
    pub fn new() -> Self {
        let mut gateway = Self {
            policies: Arc::new(DashMap::new()),
            quarantine: Arc::new(DashMap::new()),
            reputation_cache: Arc::new(DashMap::new()),
            processed_emails: Arc::new(RwLock::new(0)),
            blocked_emails: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        };

        // Initialize with default policies
        gateway.initialize_default_policies();
        gateway
    }

    fn initialize_default_policies(&self) {
        let policies = vec![
            EmailSecurityPolicy {
                id: "malware-protection".to_string(),
                name: "Malware Protection".to_string(),
                description: "Block emails with malicious attachments".to_string(),
                enabled: true,
                priority: 1,
                conditions: vec![
                    EmailCondition {
                        condition_type: "attachment".to_string(),
                        operator: "contains".to_string(),
                        value: ".exe,.scr,.bat,.com,.pif".to_string(),
                        case_sensitive: false,
                    },
                ],
                actions: vec!["quarantine".to_string()],
                scope: vec!["inbound".to_string()],
            },
            EmailSecurityPolicy {
                id: "phishing-protection".to_string(),
                name: "Phishing Protection".to_string(),
                description: "Detect and block phishing attempts".to_string(),
                enabled: true,
                priority: 2,
                conditions: vec![
                    EmailCondition {
                        condition_type: "subject".to_string(),
                        operator: "regex".to_string(),
                        value: r"(?i)(urgent|immediate|verify|suspend|click here|update.*account)".to_string(),
                        case_sensitive: false,
                    },
                ],
                actions: vec!["quarantine".to_string()],
                scope: vec!["inbound".to_string(), "internal".to_string()],
            },
            EmailSecurityPolicy {
                id: "size-limit".to_string(),
                name: "Email Size Limit".to_string(),
                description: "Block emails exceeding size limit".to_string(),
                enabled: true,
                priority: 3,
                conditions: vec![
                    EmailCondition {
                        condition_type: "size".to_string(),
                        operator: "greater_than".to_string(),
                        value: "25000000".to_string(), // 25MB
                        case_sensitive: false,
                    },
                ],
                actions: vec!["block".to_string()],
                scope: vec!["inbound".to_string(), "outbound".to_string()],
            },
        ];

        for policy in policies {
            self.policies.insert(policy.id.clone(), policy);
        }
    }

    pub async fn get_all_policies(&self) -> Vec<EmailSecurityPolicy> {
        self.policies.iter().map(|entry| entry.value().clone()).collect()
    }

    pub async fn update_policy(&self, policy: EmailSecurityPolicy) -> Result<(), String> {
        self.policies.insert(policy.id.clone(), policy);
        Ok(())
    }

    pub async fn get_quarantined_emails(&self) -> Vec<QuarantinedEmail> {
        self.quarantine.iter().map(|entry| entry.value().clone()).collect()
    }

    pub async fn release_quarantined_email(&self, email_id: &str) -> Result<(), String> {
        if let Some(mut email) = self.quarantine.get_mut(email_id) {
            email.status = "released".to_string();
            email.release_time = Some(Utc::now().timestamp());
            Ok(())
        } else {
            Err("Email not found in quarantine".to_string())
        }
    }
}

#[async_trait]
impl EmailSecurityTrait for EmailSecurityGateway {
    async fn scan_email(&self, email: EmailMessage) -> EmailScanResult {
        let mut processed_emails = self.processed_emails.write().await;
        *processed_emails += 1;

        let start_time = Utc::now().timestamp_millis();

        // Check sender reputation
        let sender_reputation = self.check_sender_reputation(&email.sender).await;

        // Analyze attachments
        let mut attachment_analysis = vec![];
        for attachment in &email.attachments {
            let analysis = self.analyze_attachment(attachment.clone()).await;
            attachment_analysis.push(analysis);
        }

        // Check policies
        let mut policy_violations = vec![];
        let mut action_taken = "delivered".to_string();
        let mut overall_risk = "low".to_string();

        for policy_entry in self.policies.iter() {
            let policy = policy_entry.value();
            if !policy.enabled {
                continue;
            }

            let mut policy_triggered = false;

            for condition in &policy.conditions {
                if self.evaluate_email_condition(condition, &email) {
                    policy_triggered = true;
                    break;
                }
            }

            if policy_triggered {
                policy_violations.push(PolicyViolation {
                    policy_id: policy.id.clone(),
                    policy_name: policy.name.clone(),
                    violation_type: policy.conditions[0].condition_type.clone(),
                    description: format!("Email violates policy: {}", policy.name),
                    severity: match policy.priority {
                        1 => "critical".to_string(),
                        2 => "high".to_string(),
                        3 => "medium".to_string(),
                        _ => "low".to_string(),
                    },
                });

                // Determine action based on highest priority violation
                if policy.priority <= 2 && policy.actions.contains(&"quarantine".to_string()) {
                    action_taken = "quarantined".to_string();
                    overall_risk = "high".to_string();
                } else if policy.actions.contains(&"block".to_string()) {
                    action_taken = "blocked".to_string();
                    overall_risk = "medium".to_string();
                }
            }
        }

        // Check for high-risk attachments
        for analysis in &attachment_analysis {
            if analysis.risk_level == "malicious" {
                action_taken = "quarantined".to_string();
                overall_risk = "critical".to_string();
                break;
            } else if analysis.risk_level == "suspicious" && overall_risk == "low" {
                overall_risk = "medium".to_string();
            }
        }

        // Take action if needed
        if action_taken == "quarantined" || action_taken == "blocked" {
            let mut blocked_emails = self.blocked_emails.write().await;
            *blocked_emails += 1;

            if action_taken == "quarantined" {
                let quarantined = QuarantinedEmail {
                    id: email.id.clone(),
                    original_email: email.clone(),
                    quarantine_reason: "Policy violation or suspicious content".to_string(),
                    quarantine_time: Utc::now().timestamp(),
                    release_time: None,
                    status: "quarantined".to_string(),
                };
                self.quarantine.insert(email.id.clone(), quarantined);
            }
        }

        let end_time = Utc::now().timestamp_millis();

        EmailScanResult {
            email_id: email.id,
            overall_risk,
            action_taken,
            threat_indicators: vec![], // Would be populated with detected threats
            policy_violations,
            attachment_analysis,
            sender_reputation,
            scan_duration: end_time - start_time,
            timestamp: Utc::now().timestamp(),
        }
    }

    async fn analyze_attachment(&self, attachment: EmailAttachment) -> AttachmentAnalysis {
        let mut risk_level = "safe".to_string();
        let mut detected_threats = vec![];
        let mut recommendations = vec![];

        // Check file extension
        let file_ext = attachment.filename.split('.').last().unwrap_or("").to_lowercase();
        let dangerous_extensions = vec!["exe", "scr", "bat", "com", "pif", "vbs", "js", "jar"];

        if dangerous_extensions.contains(&file_ext.as_str()) {
            risk_level = "malicious".to_string();
            detected_threats.push("Dangerous file extension".to_string());
            recommendations.push("Block or quarantine this attachment".to_string());
        }

        // Check file size
        if attachment.size > 100 * 1024 * 1024 { // 100MB
            if risk_level == "safe" {
                risk_level = "suspicious".to_string();
            }
            detected_threats.push("Unusually large file size".to_string());
            recommendations.push("Verify file legitimacy".to_string());
        }

        // Check for suspicious content types
        let suspicious_types = vec!["application/x-msdownload", "application/x-executable"];
        if suspicious_types.contains(&attachment.content_type.as_str()) {
            risk_level = "malicious".to_string();
            detected_threats.push("Suspicious MIME type".to_string());
            recommendations.push("Quarantine attachment".to_string());
        }

        // Simulate sandbox analysis for certain file types
        let sandbox_results = if vec!["pdf", "doc", "docx", "xls", "xlsx"].contains(&file_ext.as_str()) {
            Some(r#"{"behavior": "normal", "network_activity": "none", "file_modifications": "none"}"#.to_string())
        } else {
            None
        };

        AttachmentAnalysis {
            filename: attachment.filename,
            risk_level,
            file_type: file_ext,
            detected_threats,
            sandbox_results,
            recommendations,
        }
    }

    async fn check_sender_reputation(&self, sender: &str) -> SenderReputation {
        // Check cache first
        if let Some(cached) = self.reputation_cache.get(sender) {
            return cached.value().clone();
        }

        // Simulate reputation lookup
        let domain = sender.split('@').nth(1).unwrap_or("");
        let (reputation_score, category, threat_types) = match domain {
            d if d.ends_with(".gov") || d.ends_with(".edu") => (95.0, "trusted", vec![]),
            d if d.contains("suspicious-domain.com") => (15.0, "malicious", vec!["phishing".to_string()]),
            d if d.contains("spam") || d.contains("temp") => (35.0, "suspicious", vec!["spam".to_string()]),
            _ => (75.0, "neutral", vec![]),
        };

        let reputation = SenderReputation {
            sender: sender.to_string(),
            reputation_score,
            category: category.to_string(),
            threat_types,
            first_seen: (Utc::now() - chrono::Duration::days(30)).timestamp(),
            last_seen: Utc::now().timestamp(),
            email_count: 1,
            sources: vec!["internal".to_string(), "threat_intelligence".to_string()],
        };

        // Cache the result
        self.reputation_cache.insert(sender.to_string(), reputation.clone());

        reputation
    }

    async fn get_status(&self) -> ComponentStatus {
        let processed_emails = *self.processed_emails.read().await;
        let blocked_emails = *self.blocked_emails.read().await;
        let last_error = self.last_error.read().await.clone();

        ComponentStatus {
            status: "operational".to_string(),
            uptime: 0,
            processed_events: processed_emails as i64,
            active_alerts: blocked_emails,
            last_error,
        }
    }
}

impl EmailSecurityGateway {
    fn evaluate_email_condition(&self, condition: &EmailCondition, email: &EmailMessage) -> bool {
        let target_value = match condition.condition_type.as_str() {
            "sender" => email.sender.clone(),
            "subject" => email.subject.clone(),
            "content" => email.body.clone(),
            "size" => email.message_size.to_string(),
            "attachment" => {
                // Check if any attachment matches
                email.attachments.iter()
                    .map(|a| a.filename.clone())
                    .collect::<Vec<_>>()
                    .join(",")
            },
            _ => String::new(),
        };

        match condition.operator.as_str() {
            "contains" => {
                if condition.case_sensitive {
                    target_value.contains(&condition.value)
                } else {
                    target_value.to_lowercase().contains(&condition.value.to_lowercase())
                }
            },
            "equals" => {
                if condition.case_sensitive {
                    target_value == condition.value
                } else {
                    target_value.to_lowercase() == condition.value.to_lowercase()
                }
            },
            "regex" => {
                if let Ok(regex) = Regex::new(&condition.value) {
                    regex.is_match(&target_value)
                } else {
                    false
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
            _ => false,
        }
    }
}