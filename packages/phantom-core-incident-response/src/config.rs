//! Configuration Management
//! 
//! Comprehensive configuration system for incident response operations
//! Supporting NIST SP 800-61r2 compliance requirements

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;

/// Main configuration structure for incident response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    /// General system settings
    pub system: SystemConfig,
    /// NIST SP 800-61r2 compliance settings
    pub nist_compliance: NistComplianceConfig,
    /// Notification and communication settings
    pub notifications: NotificationConfig,
    /// SLA and timing configurations
    pub sla: SlaConfig,
    /// Security and access control
    pub security: SecurityConfig,
    /// Integration settings
    pub integrations: IntegrationConfig,
    /// Metrics and reporting
    pub metrics: MetricsConfig,
    /// Playbook execution settings
    pub playbooks: PlaybookConfig,
}

/// System-level configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemConfig {
    /// System name/identifier
    pub name: String,
    /// Organization name
    pub organization: String,
    /// Environment (prod, dev, test)
    pub environment: String,
    /// Log level
    pub log_level: String,
    /// Maximum concurrent incidents
    pub max_concurrent_incidents: u32,
    /// Default timezone
    pub timezone: String,
    /// Data retention period in days
    pub data_retention_days: u32,
}

/// NIST SP 800-61r2 compliance configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NistComplianceConfig {
    /// Enable NIST compliance mode
    pub enabled: bool,
    /// Required incident categories to track
    pub required_categories: Vec<String>,
    /// Mandatory fields for incident records
    pub mandatory_fields: Vec<String>,
    /// Evidence retention requirements
    pub evidence_retention_years: u32,
    /// Reporting requirements
    pub reporting: ReportingConfig,
    /// Compliance validation rules
    pub validation_rules: Vec<ValidationRule>,
}

/// Reporting configuration for NIST compliance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportingConfig {
    /// Enable automated reporting
    pub enabled: bool,
    /// Report frequency (daily, weekly, monthly)
    pub frequency: String,
    /// Report recipients
    pub recipients: Vec<String>,
    /// Report templates
    pub templates: HashMap<String, String>,
    /// External reporting requirements
    pub external_reporting: ExternalReportingConfig,
}

/// External reporting requirements
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExternalReportingConfig {
    /// Government/regulatory reporting
    pub regulatory: Vec<RegulatoryReporting>,
    /// Law enforcement coordination
    pub law_enforcement: Vec<LawEnforcementContact>,
    /// Industry sharing requirements
    pub industry_sharing: Vec<SharingRequirement>,
}

/// Regulatory reporting configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegulatoryReporting {
    pub name: String,
    pub agency: String,
    pub requirement_type: String,
    pub timeframe_hours: u32,
    pub contact_info: String,
    pub required_fields: Vec<String>,
}

/// Law enforcement contact information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LawEnforcementContact {
    pub agency: String,
    pub contact_name: String,
    pub phone: String,
    pub email: String,
    pub jurisdiction: String,
    pub incident_types: Vec<String>,
}

/// Industry sharing requirement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharingRequirement {
    pub organization: String,
    pub sharing_level: String,
    pub incident_types: Vec<String>,
    pub anonymize: bool,
    pub timeframe_hours: u32,
}

/// Validation rule for compliance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationRule {
    pub name: String,
    pub description: String,
    pub field: String,
    pub rule_type: String,
    pub value: String,
    pub severity: String,
}

/// Notification configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationConfig {
    /// Email notification settings
    pub email: EmailConfig,
    /// SMS notification settings
    pub sms: SmsConfig,
    /// Slack integration
    pub slack: SlackConfig,
    /// Teams integration
    pub teams: TeamsConfig,
    /// Webhook notifications
    pub webhooks: Vec<WebhookConfig>,
    /// Escalation rules
    pub escalation: EscalationConfig,
}

/// Email configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailConfig {
    pub enabled: bool,
    pub smtp_host: String,
    pub smtp_port: u16,
    pub username: String,
    pub password: String,
    pub from_address: String,
    pub use_tls: bool,
}

/// SMS configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmsConfig {
    pub enabled: bool,
    pub provider: String,
    pub api_key: String,
    pub from_number: String,
}

/// Slack configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlackConfig {
    pub enabled: bool,
    pub webhook_url: String,
    pub channel: String,
    pub username: String,
}

/// Teams configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamsConfig {
    pub enabled: bool,
    pub webhook_url: String,
    pub channel: String,
}

/// Webhook configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookConfig {
    pub name: String,
    pub url: String,
    pub method: String,
    pub headers: HashMap<String, String>,
    pub events: Vec<String>,
    pub retry_count: u32,
    pub timeout_seconds: u32,
}

/// Escalation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationConfig {
    pub enabled: bool,
    pub levels: Vec<EscalationLevel>,
    pub default_timeouts: HashMap<String, u32>,
}

/// Escalation level
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationLevel {
    pub level: u8,
    pub name: String,
    pub timeout_minutes: u32,
    pub contacts: Vec<String>,
    pub notification_methods: Vec<String>,
}

/// SLA configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlaConfig {
    /// Response time SLAs by severity
    pub response_times: HashMap<String, u32>,
    /// Resolution time SLAs by severity
    pub resolution_times: HashMap<String, u32>,
    /// Containment time SLAs
    pub containment_times: HashMap<String, u32>,
    /// Communication SLAs
    pub communication_slas: CommunicationSlaConfig,
    /// Escalation timeframes
    pub escalation_timeframes: HashMap<String, u32>,
}

/// Communication SLA configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommunicationSlaConfig {
    /// Initial acknowledgment time (minutes)
    pub initial_ack_minutes: u32,
    /// Status update frequency (minutes)
    pub status_update_minutes: u32,
    /// Stakeholder notification timeframes
    pub stakeholder_notification: HashMap<String, u32>,
}

/// Security configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    /// Authentication settings
    pub authentication: AuthConfig,
    /// Authorization settings
    pub authorization: AuthzConfig,
    /// Encryption settings
    pub encryption: EncryptionConfig,
    /// Audit logging
    pub audit: AuditConfig,
}

/// Authentication configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthConfig {
    pub method: String,
    pub ldap: Option<LdapConfig>,
    pub oauth: Option<OAuthConfig>,
    pub multi_factor: bool,
    pub session_timeout_minutes: u32,
}

/// LDAP configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LdapConfig {
    pub url: String,
    pub bind_dn: String,
    pub bind_password: String,
    pub user_base_dn: String,
    pub group_base_dn: String,
}

/// OAuth configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OAuthConfig {
    pub provider: String,
    pub client_id: String,
    pub client_secret: String,
    pub redirect_uri: String,
    pub scopes: Vec<String>,
}

/// Authorization configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthzConfig {
    pub rbac_enabled: bool,
    pub default_role: String,
    pub admin_roles: Vec<String>,
    pub incident_commander_roles: Vec<String>,
    pub analyst_roles: Vec<String>,
}

/// Encryption configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionConfig {
    pub data_at_rest: bool,
    pub data_in_transit: bool,
    pub key_rotation_days: u32,
    pub algorithm: String,
}

/// Audit configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditConfig {
    pub enabled: bool,
    pub log_all_actions: bool,
    pub sensitive_data_access: bool,
    pub retention_days: u32,
}

/// Integration configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrationConfig {
    /// SIEM integrations
    pub siem: Vec<SiemIntegration>,
    /// Ticketing system integrations
    pub ticketing: Vec<TicketingIntegration>,
    /// Threat intelligence feeds
    pub threat_intel: Vec<ThreatIntelIntegration>,
    /// Forensic tools
    pub forensics: Vec<ForensicIntegration>,
}

/// SIEM integration configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SiemIntegration {
    pub name: String,
    pub type_: String,
    pub endpoint: String,
    pub api_key: String,
    pub poll_interval_seconds: u32,
    pub query_templates: HashMap<String, String>,
}

/// Ticketing system integration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TicketingIntegration {
    pub name: String,
    pub type_: String,
    pub endpoint: String,
    pub api_key: String,
    pub project_key: String,
    pub auto_create_tickets: bool,
}

/// Threat intelligence integration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatIntelIntegration {
    pub name: String,
    pub type_: String,
    pub endpoint: String,
    pub api_key: String,
    pub feed_types: Vec<String>,
    pub update_interval_hours: u32,
}

/// Forensic tool integration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForensicIntegration {
    pub name: String,
    pub type_: String,
    pub endpoint: String,
    pub api_key: String,
    pub supported_evidence_types: Vec<String>,
}

/// Metrics configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsConfig {
    /// Enable metrics collection
    pub enabled: bool,
    /// Metrics storage backend
    pub storage_backend: String,
    /// Collection interval
    pub collection_interval_seconds: u32,
    /// Retention period
    pub retention_days: u32,
    /// Key performance indicators
    pub kpis: Vec<KpiConfig>,
}

/// KPI configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KpiConfig {
    pub name: String,
    pub description: String,
    pub calculation_method: String,
    pub target_value: f64,
    pub unit: String,
    pub alert_threshold: f64,
}

/// Playbook configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybookConfig {
    /// Enable automated playbook execution
    pub auto_execution_enabled: bool,
    /// Maximum concurrent playbook executions
    pub max_concurrent_executions: u32,
    /// Default playbook timeout
    pub default_timeout_minutes: u32,
    /// Step execution timeout
    pub step_timeout_minutes: u32,
    /// Approval required for certain actions
    pub approval_required: Vec<String>,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            system: SystemConfig {
                name: "Phantom Incident Response".to_string(),
                organization: "Default Organization".to_string(),
                environment: "production".to_string(),
                log_level: "info".to_string(),
                max_concurrent_incidents: 100,
                timezone: "UTC".to_string(),
                data_retention_days: 365,
            },
            nist_compliance: NistComplianceConfig {
                enabled: true,
                required_categories: vec![
                    "Malware".to_string(),
                    "Phishing".to_string(),
                    "DataBreach".to_string(),
                    "DenialOfService".to_string(),
                    "Unauthorized".to_string(),
                    "SystemCompromise".to_string(),
                ],
                mandatory_fields: vec![
                    "title".to_string(),
                    "description".to_string(),
                    "category".to_string(),
                    "severity".to_string(),
                    "detected_at".to_string(),
                ],
                evidence_retention_years: 7,
                reporting: ReportingConfig {
                    enabled: true,
                    frequency: "weekly".to_string(),
                    recipients: vec![],
                    templates: HashMap::new(),
                    external_reporting: ExternalReportingConfig {
                        regulatory: vec![],
                        law_enforcement: vec![],
                        industry_sharing: vec![],
                    },
                },
                validation_rules: vec![],
            },
            notifications: NotificationConfig {
                email: EmailConfig {
                    enabled: false,
                    smtp_host: "localhost".to_string(),
                    smtp_port: 587,
                    username: String::new(),
                    password: String::new(),
                    from_address: String::new(),
                    use_tls: true,
                },
                sms: SmsConfig {
                    enabled: false,
                    provider: "twilio".to_string(),
                    api_key: String::new(),
                    from_number: String::new(),
                },
                slack: SlackConfig {
                    enabled: false,
                    webhook_url: String::new(),
                    channel: "#incidents".to_string(),
                    username: "Phantom IR".to_string(),
                },
                teams: TeamsConfig {
                    enabled: false,
                    webhook_url: String::new(),
                    channel: "Incidents".to_string(),
                },
                webhooks: vec![],
                escalation: EscalationConfig {
                    enabled: true,
                    levels: vec![],
                    default_timeouts: HashMap::new(),
                },
            },
            sla: SlaConfig {
                response_times: HashMap::from([
                    ("Critical".to_string(), 15),
                    ("High".to_string(), 60),
                    ("Medium".to_string(), 240),
                    ("Low".to_string(), 480),
                ]),
                resolution_times: HashMap::from([
                    ("Critical".to_string(), 240),
                    ("High".to_string(), 480),
                    ("Medium".to_string(), 1440),
                    ("Low".to_string(), 2880),
                ]),
                containment_times: HashMap::from([
                    ("Critical".to_string(), 60),
                    ("High".to_string(), 120),
                    ("Medium".to_string(), 360),
                    ("Low".to_string(), 720),
                ]),
                communication_slas: CommunicationSlaConfig {
                    initial_ack_minutes: 15,
                    status_update_minutes: 60,
                    stakeholder_notification: HashMap::new(),
                },
                escalation_timeframes: HashMap::new(),
            },
            security: SecurityConfig {
                authentication: AuthConfig {
                    method: "local".to_string(),
                    ldap: None,
                    oauth: None,
                    multi_factor: false,
                    session_timeout_minutes: 480,
                },
                authorization: AuthzConfig {
                    rbac_enabled: true,
                    default_role: "analyst".to_string(),
                    admin_roles: vec!["admin".to_string()],
                    incident_commander_roles: vec!["commander".to_string(), "admin".to_string()],
                    analyst_roles: vec!["analyst".to_string(), "senior_analyst".to_string()],
                },
                encryption: EncryptionConfig {
                    data_at_rest: true,
                    data_in_transit: true,
                    key_rotation_days: 90,
                    algorithm: "AES-256".to_string(),
                },
                audit: AuditConfig {
                    enabled: true,
                    log_all_actions: true,
                    sensitive_data_access: true,
                    retention_days: 365,
                },
            },
            integrations: IntegrationConfig {
                siem: vec![],
                ticketing: vec![],
                threat_intel: vec![],
                forensics: vec![],
            },
            metrics: MetricsConfig {
                enabled: true,
                storage_backend: "redis".to_string(),
                collection_interval_seconds: 60,
                retention_days: 90,
                kpis: vec![],
            },
            playbooks: PlaybookConfig {
                auto_execution_enabled: true,
                max_concurrent_executions: 10,
                default_timeout_minutes: 60,
                step_timeout_minutes: 30,
                approval_required: vec!["system_shutdown".to_string(), "network_isolation".to_string()],
            },
        }
    }
}

impl Config {
    /// Load configuration from environment variables
    pub fn from_env() -> Self {
        // Implementation would load from environment variables
        // For now, return the default configuration
        Self::default()
    }

    /// Load configuration from a file
    pub fn from_file(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let contents = std::fs::read_to_string(path)?;
        let config: Config = serde_json::from_str(&contents)?;
        Ok(config)
    }

    /// Save configuration to file
    pub fn save_to_file(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let contents = serde_json::to_string_pretty(self)?;
        std::fs::write(path, contents)?;
        Ok(())
    }

    /// Validate configuration
    pub fn validate(&self) -> Result<(), String> {
        // Validate system configuration
        if self.system.name.is_empty() {
            return Err("System name cannot be empty".to_string());
        }

        if self.system.max_concurrent_incidents == 0 {
            return Err("Maximum concurrent incidents must be greater than 0".to_string());
        }

        // Validate SLA configuration
        if self.sla.response_times.is_empty() {
            return Err("Response time SLAs must be configured".to_string());
        }

        // Additional validation logic...
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config_creation() {
        let config = Config::default();
        assert_eq!(config.system.name, "Phantom Incident Response");
        assert!(config.nist_compliance.enabled);
        assert!(config.metrics.enabled);
    }

    #[test]
    fn test_config_validation() {
        let config = Config::default();
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_invalid_config_validation() {
        let mut config = Config::default();
        config.system.name = String::new();
        assert!(config.validate().is_err());
    }
}