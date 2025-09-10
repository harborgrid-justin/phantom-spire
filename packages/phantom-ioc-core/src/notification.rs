// phantom-ioc-core/src/notification.rs
// Real-time alerts, notifications, and escalation workflows

use crate::types::*;
use chrono::{DateTime, Utc, Duration};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Notification engine for real-time alerts and escalation
pub struct NotificationEngine {
    notification_channels: Arc<RwLock<HashMap<String, NotificationChannel>>>,
    notification_templates: Arc<RwLock<HashMap<String, NotificationTemplate>>>,
    escalation_policies: Arc<RwLock<HashMap<String, EscalationPolicy>>>,
    sent_notifications: Arc<RwLock<HashMap<String, SentNotification>>>,
    alert_suppressions: Arc<RwLock<HashMap<String, AlertSuppression>>>,
    statistics: Arc<RwLock<NotificationStats>>,
}

impl NotificationEngine {
    /// Create a new notification engine
    pub async fn new() -> Result<Self, IOCError> {
        let engine = Self {
            notification_channels: Arc::new(RwLock::new(HashMap::new())),
            notification_templates: Arc::new(RwLock::new(HashMap::new())),
            escalation_policies: Arc::new(RwLock::new(HashMap::new())),
            sent_notifications: Arc::new(RwLock::new(HashMap::new())),
            alert_suppressions: Arc::new(RwLock::new(HashMap::new())),
            statistics: Arc::new(RwLock::new(NotificationStats::default())),
        };

        // Initialize with default configuration
        engine.initialize_default_configuration().await?;

        Ok(engine)
    }

    /// Initialize default notification channels, templates, and policies
    async fn initialize_default_configuration(&self) -> Result<(), IOCError> {
        // Define default notification channels
        let default_channels = vec![
            NotificationChannel {
                id: "email_primary".to_string(),
                name: "Primary Email".to_string(),
                channel_type: ChannelType::Email,
                configuration: ChannelConfiguration {
                    settings: HashMap::from([
                        ("smtp_server".to_string(), serde_json::Value::String("smtp.company.com".to_string())),
                        ("smtp_port".to_string(), serde_json::Value::Number(serde_json::Number::from(587))),
                        ("use_tls".to_string(), serde_json::Value::Bool(true)),
                        ("from_address".to_string(), serde_json::Value::String("security-alerts@company.com".to_string())),
                    ]),
                    rate_limits: RateLimits {
                        max_per_minute: 60,
                        max_per_hour: 1000,
                        burst_limit: 10,
                    },
                    retry_policy: NotificationRetryPolicy {
                        max_retries: 3,
                        retry_delay: Duration::minutes(1),
                        exponential_backoff: true,
                        retry_conditions: vec!["network_error".to_string(), "temporary_failure".to_string()],
                    },
                },
                enabled: true,
                health_status: ChannelHealth {
                    status: HealthStatus::Healthy,
                    last_check: Utc::now(),
                    error_rate: 0.02,
                    average_delivery_time_ms: 2500,
                },
                created_at: Utc::now(),
            },
            NotificationChannel {
                id: "slack_security".to_string(),
                name: "Security Team Slack".to_string(),
                channel_type: ChannelType::Slack,
                configuration: ChannelConfiguration {
                    settings: HashMap::from([
                        ("webhook_url".to_string(), serde_json::Value::String("https://hooks.slack.com/services/...".to_string())),
                        ("channel".to_string(), serde_json::Value::String("#security-alerts".to_string())),
                        ("username".to_string(), serde_json::Value::String("SecurityBot".to_string())),
                    ]),
                    rate_limits: RateLimits {
                        max_per_minute: 1,
                        max_per_hour: 50,
                        burst_limit: 5,
                    },
                    retry_policy: NotificationRetryPolicy {
                        max_retries: 2,
                        retry_delay: Duration::seconds(30),
                        exponential_backoff: false,
                        retry_conditions: vec!["rate_limited".to_string(), "server_error".to_string()],
                    },
                },
                enabled: true,
                health_status: ChannelHealth {
                    status: HealthStatus::Healthy,
                    last_check: Utc::now(),
                    error_rate: 0.01,
                    average_delivery_time_ms: 800,
                },
                created_at: Utc::now(),
            },
            NotificationChannel {
                id: "sms_emergency".to_string(),
                name: "Emergency SMS".to_string(),
                channel_type: ChannelType::SMS,
                configuration: ChannelConfiguration {
                    settings: HashMap::from([
                        ("provider".to_string(), serde_json::Value::String("twilio".to_string())),
                        ("account_sid".to_string(), serde_json::Value::String("AC...".to_string())),
                        ("from_number".to_string(), serde_json::Value::String("+1234567890".to_string())),
                    ]),
                    rate_limits: RateLimits {
                        max_per_minute: 10,
                        max_per_hour: 100,
                        burst_limit: 3,
                    },
                    retry_policy: NotificationRetryPolicy {
                        max_retries: 2,
                        retry_delay: Duration::minutes(2),
                        exponential_backoff: true,
                        retry_conditions: vec!["delivery_failed".to_string()],
                    },
                },
                enabled: true,
                health_status: ChannelHealth {
                    status: HealthStatus::Healthy,
                    last_check: Utc::now(),
                    error_rate: 0.05,
                    average_delivery_time_ms: 3000,
                },
                created_at: Utc::now(),
            },
            NotificationChannel {
                id: "webhook_siem".to_string(),
                name: "SIEM Integration".to_string(),
                channel_type: ChannelType::Webhook,
                configuration: ChannelConfiguration {
                    settings: HashMap::from([
                        ("url".to_string(), serde_json::Value::String("https://siem.company.com/api/alerts".to_string())),
                        ("method".to_string(), serde_json::Value::String("POST".to_string())),
                        ("content_type".to_string(), serde_json::Value::String("application/json".to_string())),
                        ("auth_header".to_string(), serde_json::Value::String("Bearer ...".to_string())),
                    ]),
                    rate_limits: RateLimits {
                        max_per_minute: 100,
                        max_per_hour: 5000,
                        burst_limit: 20,
                    },
                    retry_policy: NotificationRetryPolicy {
                        max_retries: 3,
                        retry_delay: Duration::seconds(15),
                        exponential_backoff: true,
                        retry_conditions: vec!["http_5xx".to_string(), "timeout".to_string()],
                    },
                },
                enabled: true,
                health_status: ChannelHealth {
                    status: HealthStatus::Healthy,
                    last_check: Utc::now(),
                    error_rate: 0.01,
                    average_delivery_time_ms: 500,
                },
                created_at: Utc::now(),
            },
        ];

        let mut channels = self.notification_channels.write().await;
        for channel in default_channels {
            channels.insert(channel.id.clone(), channel);
        }
        drop(channels);

        // Define default notification templates
        let default_templates = vec![
            NotificationTemplate {
                id: "critical_threat_alert".to_string(),
                name: "Critical Threat Alert".to_string(),
                description: "Template for critical threat notifications".to_string(),
                severity: Severity::Critical,
                templates_by_channel: HashMap::from([
                    (ChannelType::Email, MessageTemplate {
                        subject: "🚨 CRITICAL THREAT DETECTED: {{ioc.type}} {{ioc.value}}".to_string(),
                        body: r#"
CRITICAL SECURITY ALERT

A critical threat has been detected and requires immediate attention.

Threat Details:
- Indicator: {{ioc.value}}
- Type: {{ioc.type}}
- Confidence: {{ioc.confidence}}%
- Source: {{ioc.source}}
- Detection Time: {{detection_time}}

Risk Assessment:
- Severity: {{severity}}
- Business Impact: {{business_impact}}
- Affected Assets: {{affected_assets}}

Recommended Actions:
{{#each recommendations}}
- {{this}}
{{/each}}

Incident Response:
- Incident ID: {{incident_id}}
- Assigned Analyst: {{assigned_analyst}}
- Response Status: {{response_status}}

This is an automated alert from the Threat Intelligence Platform.
For immediate assistance, contact the Security Operations Center.
                        "#.to_string(),
                        format: MessageFormat::HTML,
                        attachments: vec![],
                    }),
                    (ChannelType::Slack, MessageTemplate {
                        subject: "".to_string(),
                        body: r#"{
    "text": ":rotating_light: *CRITICAL THREAT DETECTED*",
    "attachments": [
        {
            "color": "danger",
            "fields": [
                {
                    "title": "Indicator",
                    "value": "{{ioc.type}}: `{{ioc.value}}`",
                    "short": true
                },
                {
                    "title": "Confidence",
                    "value": "{{ioc.confidence}}%",
                    "short": true
                },
                {
                    "title": "Severity",
                    "value": "{{severity}}",
                    "short": true
                },
                {
                    "title": "Incident ID",
                    "value": "{{incident_id}}",
                    "short": true
                }
            ],
            "actions": [
                {
                    "type": "button",
                    "text": "View Incident",
                    "url": "{{incident_url}}"
                },
                {
                    "type": "button",
                    "text": "Acknowledge",
                    "url": "{{acknowledge_url}}"
                }
            ]
        }
    ]
}"#.to_string(),
                        format: MessageFormat::JSON,
                        attachments: vec![],
                    }),
                    (ChannelType::SMS, MessageTemplate {
                        subject: "".to_string(),
                        body: "CRITICAL THREAT: {{ioc.type}} {{ioc.value}} detected. Confidence: {{ioc.confidence}}%. Incident: {{incident_id}}. Respond immediately.".to_string(),
                        format: MessageFormat::PlainText,
                        attachments: vec![],
                    }),
                ]),
                variables: vec![
                    TemplateVariable {
                        name: "ioc".to_string(),
                        description: "IOC object with type, value, confidence, etc.".to_string(),
                        required: true,
                    },
                    TemplateVariable {
                        name: "severity".to_string(),
                        description: "Threat severity level".to_string(),
                        required: true,
                    },
                    TemplateVariable {
                        name: "incident_id".to_string(),
                        description: "Generated incident identifier".to_string(),
                        required: false,
                    },
                ],
                created_at: Utc::now(),
                updated_at: Utc::now(),
                enabled: true,
            },
            NotificationTemplate {
                id: "threat_intelligence_update".to_string(),
                name: "Threat Intelligence Update".to_string(),
                description: "Template for regular threat intelligence updates".to_string(),
                severity: Severity::Medium,
                templates_by_channel: HashMap::from([
                    (ChannelType::Email, MessageTemplate {
                        subject: "Threat Intelligence Update - {{date}}".to_string(),
                        body: r#"
Threat Intelligence Summary - {{date}}

New Threats Detected: {{new_threats_count}}
{{#each new_threats}}
- {{type}}: {{value}} (Confidence: {{confidence}}%)
{{/each}}

Threat Feed Status:
{{#each feed_status}}
- {{feed_name}}: {{status}} (Last Updated: {{last_update}})
{{/each}}

Risk Summary:
- Critical: {{risk_summary.critical}}
- High: {{risk_summary.high}}
- Medium: {{risk_summary.medium}}
- Low: {{risk_summary.low}}

For detailed analysis, visit the Threat Intelligence Dashboard.
                        "#.to_string(),
                        format: MessageFormat::HTML,
                        attachments: vec![],
                    }),
                ]),
                variables: vec![
                    TemplateVariable {
                        name: "date".to_string(),
                        description: "Report date".to_string(),
                        required: true,
                    },
                    TemplateVariable {
                        name: "new_threats_count".to_string(),
                        description: "Number of new threats".to_string(),
                        required: true,
                    },
                ],
                created_at: Utc::now(),
                updated_at: Utc::now(),
                enabled: true,
            },
        ];

        let mut templates = self.notification_templates.write().await;
        for template in default_templates {
            templates.insert(template.id.clone(), template);
        }
        drop(templates);

        // Define default escalation policies
        let default_policies = vec![
            EscalationPolicy {
                id: "critical_threat_escalation".to_string(),
                name: "Critical Threat Escalation".to_string(),
                description: "Escalation policy for critical security threats".to_string(),
                trigger_conditions: vec![
                    EscalationTrigger {
                        condition_type: "severity".to_string(),
                        operator: "equals".to_string(),
                        value: "critical".to_string(),
                    },
                    EscalationTrigger {
                        condition_type: "confidence".to_string(),
                        operator: "greater_than".to_string(),
                        value: "0.8".to_string(),
                    },
                ],
                escalation_levels: vec![
                    EscalationLevel {
                        level: 1,
                        name: "Level 1 - SOC Team".to_string(),
                        delay: Duration::minutes(0),
                        recipients: vec![
                            NotificationRecipient {
                                recipient_type: RecipientType::Group,
                                identifier: "soc_team".to_string(),
                                channels: vec!["email_primary".to_string(), "slack_security".to_string()],
                            },
                        ],
                        acknowledgment_required: true,
                        acknowledgment_timeout: Duration::minutes(15),
                    },
                    EscalationLevel {
                        level: 2,
                        name: "Level 2 - Security Manager".to_string(),
                        delay: Duration::minutes(15),
                        recipients: vec![
                            NotificationRecipient {
                                recipient_type: RecipientType::Individual,
                                identifier: "security_manager@company.com".to_string(),
                                channels: vec!["email_primary".to_string(), "sms_emergency".to_string()],
                            },
                        ],
                        acknowledgment_required: true,
                        acknowledgment_timeout: Duration::minutes(30),
                    },
                    EscalationLevel {
                        level: 3,
                        name: "Level 3 - CISO".to_string(),
                        delay: Duration::minutes(45),
                        recipients: vec![
                            NotificationRecipient {
                                recipient_type: RecipientType::Individual,
                                identifier: "ciso@company.com".to_string(),
                                channels: vec!["email_primary".to_string(), "sms_emergency".to_string()],
                            },
                        ],
                        acknowledgment_required: false,
                        acknowledgment_timeout: Duration::hours(1),
                    },
                ],
                max_escalation_level: 3,
                auto_resolve_conditions: vec![
                    AutoResolveCondition {
                        condition_type: "incident_status".to_string(),
                        value: "resolved".to_string(),
                    },
                    AutoResolveCondition {
                        condition_type: "time_elapsed".to_string(),
                        value: "24h".to_string(),
                    },
                ],
                enabled: true,
                created_at: Utc::now(),
            },
            EscalationPolicy {
                id: "high_threat_escalation".to_string(),
                name: "High Threat Escalation".to_string(),
                description: "Escalation policy for high severity threats".to_string(),
                trigger_conditions: vec![
                    EscalationTrigger {
                        condition_type: "severity".to_string(),
                        operator: "equals".to_string(),
                        value: "high".to_string(),
                    },
                ],
                escalation_levels: vec![
                    EscalationLevel {
                        level: 1,
                        name: "Level 1 - SOC Team".to_string(),
                        delay: Duration::minutes(0),
                        recipients: vec![
                            NotificationRecipient {
                                recipient_type: RecipientType::Group,
                                identifier: "soc_team".to_string(),
                                channels: vec!["email_primary".to_string(), "slack_security".to_string()],
                            },
                        ],
                        acknowledgment_required: true,
                        acknowledgment_timeout: Duration::minutes(30),
                    },
                    EscalationLevel {
                        level: 2,
                        name: "Level 2 - Security Manager".to_string(),
                        delay: Duration::minutes(30),
                        recipients: vec![
                            NotificationRecipient {
                                recipient_type: RecipientType::Individual,
                                identifier: "security_manager@company.com".to_string(),
                                channels: vec!["email_primary".to_string()],
                            },
                        ],
                        acknowledgment_required: false,
                        acknowledgment_timeout: Duration::hours(2),
                    },
                ],
                max_escalation_level: 2,
                auto_resolve_conditions: vec![
                    AutoResolveCondition {
                        condition_type: "incident_status".to_string(),
                        value: "resolved".to_string(),
                    },
                ],
                enabled: true,
                created_at: Utc::now(),
            },
        ];

        let mut policies = self.escalation_policies.write().await;
        for policy in default_policies {
            policies.insert(policy.id.clone(), policy);
        }

        Ok(())
    }

    /// Send a notification based on threat data
    pub async fn send_threat_notification(&self, threat_data: &ThreatNotificationData) -> Result<NotificationResult, IOCError> {
        let notification_id = Uuid::new_v4().to_string();
        let send_time = Utc::now();

        // Check for alert suppression
        if self.is_alert_suppressed(&threat_data.ioc, &threat_data.alert_type).await {
            return Ok(NotificationResult {
                notification_id,
                status: NotificationStatus::Suppressed,
                channels_sent: vec![],
                total_recipients: 0,
                send_time,
                delivery_attempts: vec![],
                escalation_triggered: false,
                suppression_reason: Some("Alert suppression rule active".to_string()),
            });
        }

        // Find appropriate template
        let template_id = self.select_notification_template(&threat_data.severity, &threat_data.alert_type).await;
        let template = {
            let templates = self.notification_templates.read().await;
            templates.get(&template_id)
                .ok_or_else(|| IOCError::Configuration(format!("Notification template not found: {}", template_id)))?
                .clone()
        };

        // Prepare notification context
        let context = self.prepare_notification_context(threat_data).await;

        // Send notifications through all configured channels
        let mut delivery_attempts = Vec::new();
        let mut channels_sent = Vec::new();
        let mut total_recipients = 0;

        // Send to primary recipients
        for recipient in &threat_data.recipients {
            for channel_id in &recipient.channels {
                let channel = {
                    let channels = self.notification_channels.read().await;
                    channels.get(channel_id).cloned()
                };

                if let Some(channel) = channel {
                    if channel.enabled {
                        let attempt = self.send_to_channel(&channel, &template, &context, &recipient.identifier).await;
                        
                        if attempt.status == DeliveryStatus::Delivered {
                            channels_sent.push(channel_id.clone());
                            total_recipients += 1;
                        }
                        
                        delivery_attempts.push(attempt);
                    }
                }
            }
        }

        // Check if escalation should be triggered
        let escalation_triggered = self.should_trigger_escalation(threat_data).await;
        if escalation_triggered {
            self.trigger_escalation(threat_data, &notification_id).await?;
        }

        // Store sent notification
        let sent_notification = SentNotification {
            id: notification_id.clone(),
            template_id: template.id.clone(),
            ioc_id: threat_data.ioc.id.to_string(),
            severity: threat_data.severity.clone(),
            recipients: threat_data.recipients.clone(),
            channels_used: channels_sent.clone(),
            sent_at: send_time,
            context: context.clone(),
            delivery_attempts: delivery_attempts.clone(),
            escalation_level: if escalation_triggered { Some(1) } else { None },
            acknowledged: false,
            acknowledged_at: None,
            acknowledged_by: None,
        };

        {
            let mut notifications = self.sent_notifications.write().await;
            notifications.insert(notification_id.clone(), sent_notification);
        }

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.total_notifications_sent += 1;
            stats.total_recipients += total_recipients as u64;
            if escalation_triggered {
                stats.escalations_triggered += 1;
            }
            stats.last_notification_sent = Some(send_time);
        }

        let overall_status = if channels_sent.is_empty() {
            NotificationStatus::Failed
        } else if channels_sent.len() == threat_data.recipients.iter().map(|r| r.channels.len()).sum() {
            NotificationStatus::Delivered
        } else {
            NotificationStatus::PartiallyDelivered
        };

        Ok(NotificationResult {
            notification_id,
            status: overall_status,
            channels_sent,
            total_recipients: total_recipients as u32,
            send_time,
            delivery_attempts,
            escalation_triggered,
            suppression_reason: None,
        })
    }

    /// Check if an alert should be suppressed
    async fn is_alert_suppressed(&self, ioc: &IOC, alert_type: &str) -> bool {
        let suppressions = self.alert_suppressions.read().await;
        
        for suppression in suppressions.values() {
            if !suppression.enabled || suppression.expires_at <= Utc::now() {
                continue;
            }

            // Check suppression conditions
            let mut conditions_met = true;
            
            for condition in &suppression.conditions {
                match condition.field.as_str() {
                    "ioc_value" => {
                        if !self.evaluate_suppression_condition(&ioc.value, &condition.operator, &condition.value) {
                            conditions_met = false;
                            break;
                        }
                    }
                    "ioc_type" => {
                        let ioc_type_str = format!("{:?}", ioc.indicator_type).to_lowercase();
                        if !self.evaluate_suppression_condition(&ioc_type_str, &condition.operator, &condition.value) {
                            conditions_met = false;
                            break;
                        }
                    }
                    "severity" => {
                        let severity_str = format!("{:?}", ioc.severity).to_lowercase();
                        if !self.evaluate_suppression_condition(&severity_str, &condition.operator, &condition.value) {
                            conditions_met = false;
                            break;
                        }
                    }
                    "alert_type" => {
                        if !self.evaluate_suppression_condition(alert_type, &condition.operator, &condition.value) {
                            conditions_met = false;
                            break;
                        }
                    }
                    _ => {}
                }
            }

            if conditions_met {
                return true;
            }
        }

        false
    }

    /// Evaluate a suppression condition
    fn evaluate_suppression_condition(&self, field_value: &str, operator: &str, condition_value: &str) -> bool {
        match operator {
            "equals" => field_value == condition_value,
            "contains" => field_value.contains(condition_value),
            "starts_with" => field_value.starts_with(condition_value),
            "ends_with" => field_value.ends_with(condition_value),
            "regex" => {
                // Simplified regex matching
                field_value.contains(condition_value)
            }
            _ => false,
        }
    }

    /// Select appropriate notification template
    async fn select_notification_template(&self, severity: &Severity, alert_type: &str) -> String {
        match severity {
            Severity::Critical => "critical_threat_alert".to_string(),
            Severity::High => "critical_threat_alert".to_string(), // Use same template for high severity
            _ => "threat_intelligence_update".to_string(),
        }
    }

    /// Prepare notification context with template variables
    async fn prepare_notification_context(&self, threat_data: &ThreatNotificationData) -> HashMap<String, serde_json::Value> {
        let mut context = HashMap::new();
        
        // IOC data
        context.insert("ioc".to_string(), serde_json::json!({
            "type": format!("{:?}", threat_data.ioc.indicator_type).to_lowercase(),
            "value": threat_data.ioc.value,
            "confidence": (threat_data.ioc.confidence * 100.0) as u32,
            "severity": format!("{:?}", threat_data.ioc.severity).to_lowercase(),
            "source": threat_data.ioc.source,
        }));

        // Threat data
        context.insert("severity".to_string(), serde_json::Value::String(format!("{:?}", threat_data.severity)));
        context.insert("detection_time".to_string(), serde_json::Value::String(threat_data.detection_time.to_rfc3339()));
        context.insert("alert_type".to_string(), serde_json::Value::String(threat_data.alert_type.clone()));

        // Additional context
        if let Some(incident_id) = &threat_data.incident_id {
            context.insert("incident_id".to_string(), serde_json::Value::String(incident_id.clone()));
            context.insert("incident_url".to_string(), serde_json::Value::String(format!("https://security.company.com/incidents/{}", incident_id)));
        }

        if let Some(business_impact) = &threat_data.business_impact {
            context.insert("business_impact".to_string(), serde_json::Value::String(business_impact.clone()));
        }

        context.insert("recommendations".to_string(), serde_json::Value::Array(
            threat_data.recommendations.iter()
                .map(|r| serde_json::Value::String(r.clone()))
                .collect()
        ));

        context
    }

    /// Send notification to a specific channel
    async fn send_to_channel(
        &self,
        channel: &NotificationChannel,
        template: &NotificationTemplate,
        context: &HashMap<String, serde_json::Value>,
        recipient: &str
    ) -> DeliveryAttempt {
        let attempt_id = Uuid::new_v4().to_string();
        let start_time = Utc::now();

        // Get template for this channel type
        let message_template = template.templates_by_channel.get(&channel.channel_type);
        if message_template.is_none() {
            return DeliveryAttempt {
                id: attempt_id,
                channel_id: channel.id.clone(),
                recipient: recipient.to_string(),
                status: DeliveryStatus::Failed,
                attempt_time: start_time,
                delivery_time: None,
                error_message: Some("No template found for channel type".to_string()),
                retry_count: 0,
            };
        }

        let message_template = message_template.unwrap();

        // Render message content
        let rendered_content = match self.render_message_template(message_template, context) {
            Ok(content) => content,
            Err(e) => {
                return DeliveryAttempt {
                    id: attempt_id,
                    channel_id: channel.id.clone(),
                    recipient: recipient.to_string(),
                    status: DeliveryStatus::Failed,
                    attempt_time: start_time,
                    delivery_time: None,
                    error_message: Some(format!("Template rendering failed: {}", e)),
                    retry_count: 0,
                };
            }
        };

        // Simulate sending based on channel type
        let delivery_result = match channel.channel_type {
            ChannelType::Email => self.send_email(channel, &rendered_content, recipient).await,
            ChannelType::Slack => self.send_slack_message(channel, &rendered_content).await,
            ChannelType::SMS => self.send_sms(channel, &rendered_content, recipient).await,
            ChannelType::Webhook => self.send_webhook(channel, &rendered_content).await,
            ChannelType::PagerDuty => self.send_pagerduty(channel, &rendered_content).await,
        };

        let end_time = Utc::now();

        match delivery_result {
            Ok(_) => DeliveryAttempt {
                id: attempt_id,
                channel_id: channel.id.clone(),
                recipient: recipient.to_string(),
                status: DeliveryStatus::Delivered,
                attempt_time: start_time,
                delivery_time: Some(end_time),
                error_message: None,
                retry_count: 0,
            },
            Err(e) => DeliveryAttempt {
                id: attempt_id,
                channel_id: channel.id.clone(),
                recipient: recipient.to_string(),
                status: DeliveryStatus::Failed,
                attempt_time: start_time,
                delivery_time: None,
                error_message: Some(e.to_string()),
                retry_count: 0,
            },
        }
    }

    /// Render message template with context variables
    fn render_message_template(&self, template: &MessageTemplate, context: &HashMap<String, serde_json::Value>) -> Result<RenderedMessage, IOCError> {
        // Simplified template rendering - would use a proper template engine like Handlebars
        let mut rendered_subject = template.subject.clone();
        let mut rendered_body = template.body.clone();

        // Replace simple template variables
        for (key, value) in context {
            let placeholder = format!("{{{{{}}}}}", key);
            let value_str = match value {
                serde_json::Value::String(s) => s.clone(),
                serde_json::Value::Number(n) => n.to_string(),
                serde_json::Value::Bool(b) => b.to_string(),
                serde_json::Value::Object(obj) => {
                    // Handle nested object properties
                    if key == "ioc" {
                        for (prop, prop_val) in obj {
                            let nested_placeholder = format!("{{{{ioc.{}}}}}", prop);
                            let prop_str = match prop_val {
                                serde_json::Value::String(s) => s.clone(),
                                serde_json::Value::Number(n) => n.to_string(),
                                _ => format!("{:?}", prop_val),
                            };
                            rendered_subject = rendered_subject.replace(&nested_placeholder, &prop_str);
                            rendered_body = rendered_body.replace(&nested_placeholder, &prop_str);
                        }
                    }
                    serde_json::to_string(obj).unwrap_or_default()
                }
                _ => format!("{:?}", value),
            };

            rendered_subject = rendered_subject.replace(&placeholder, &value_str);
            rendered_body = rendered_body.replace(&placeholder, &value_str);
        }

        Ok(RenderedMessage {
            subject: rendered_subject,
            body: rendered_body,
            format: template.format.clone(),
            attachments: template.attachments.clone(),
        })
    }

    // Channel-specific sending methods (simplified implementations)
    async fn send_email(&self, channel: &NotificationChannel, message: &RenderedMessage, recipient: &str) -> Result<(), IOCError> {
        // Simulate email sending
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        Ok(())
    }

    async fn send_slack_message(&self, channel: &NotificationChannel, message: &RenderedMessage) -> Result<(), IOCError> {
        // Simulate Slack webhook
        tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
        Ok(())
    }

    async fn send_sms(&self, channel: &NotificationChannel, message: &RenderedMessage, recipient: &str) -> Result<(), IOCError> {
        // Simulate SMS sending
        tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
        Ok(())
    }

    async fn send_webhook(&self, channel: &NotificationChannel, message: &RenderedMessage) -> Result<(), IOCError> {
        // Simulate webhook call
        tokio::time::sleep(tokio::time::Duration::from_millis(25)).await;
        Ok(())
    }

    async fn send_pagerduty(&self, channel: &NotificationChannel, message: &RenderedMessage) -> Result<(), IOCError> {
        // Simulate PagerDuty integration
        tokio::time::sleep(tokio::time::Duration::from_millis(75)).await;
        Ok(())
    }

    /// Check if escalation should be triggered
    async fn should_trigger_escalation(&self, threat_data: &ThreatNotificationData) -> bool {
        let policies = self.escalation_policies.read().await;
        
        for policy in policies.values() {
            if !policy.enabled {
                continue;
            }

            let mut conditions_met = true;
            for trigger in &policy.trigger_conditions {
                match trigger.condition_type.as_str() {
                    "severity" => {
                        let severity_str = format!("{:?}", threat_data.severity).to_lowercase();
                        if !self.evaluate_escalation_condition(&severity_str, &trigger.operator, &trigger.value) {
                            conditions_met = false;
                            break;
                        }
                    }
                    "confidence" => {
                        let confidence_str = threat_data.ioc.confidence.to_string();
                        if !self.evaluate_escalation_condition(&confidence_str, &trigger.operator, &trigger.value) {
                            conditions_met = false;
                            break;
                        }
                    }
                    _ => {}
                }
            }

            if conditions_met {
                return true;
            }
        }

        false
    }

    /// Evaluate escalation condition
    fn evaluate_escalation_condition(&self, field_value: &str, operator: &str, condition_value: &str) -> bool {
        match operator {
            "equals" => field_value == condition_value,
            "greater_than" => {
                if let (Ok(field_num), Ok(condition_num)) = (field_value.parse::<f64>(), condition_value.parse::<f64>()) {
                    field_num > condition_num
                } else {
                    false
                }
            }
            "less_than" => {
                if let (Ok(field_num), Ok(condition_num)) = (field_value.parse::<f64>(), condition_value.parse::<f64>()) {
                    field_num < condition_num
                } else {
                    false
                }
            }
            _ => false,
        }
    }

    /// Trigger escalation workflow
    async fn trigger_escalation(&self, threat_data: &ThreatNotificationData, notification_id: &str) -> Result<(), IOCError> {
        // Find applicable escalation policy
        let policies = self.escalation_policies.read().await;
        let applicable_policy = policies.values()
            .find(|policy| {
                policy.enabled && policy.trigger_conditions.iter().all(|trigger| {
                    match trigger.condition_type.as_str() {
                        "severity" => {
                            let severity_str = format!("{:?}", threat_data.severity).to_lowercase();
                            self.evaluate_escalation_condition(&severity_str, &trigger.operator, &trigger.value)
                        }
                        _ => true,
                    }
                })
            });

        if let Some(policy) = applicable_policy {
            // Start escalation at level 1
            for level in &policy.escalation_levels {
                if level.level == 1 {
                    // Schedule immediate escalation
                    self.schedule_escalation_level(policy, level, threat_data, notification_id).await?;
                    break;
                }
            }
        }

        Ok(())
    }

    /// Schedule an escalation level
    async fn schedule_escalation_level(
        &self,
        policy: &EscalationPolicy,
        level: &EscalationLevel,
        threat_data: &ThreatNotificationData,
        notification_id: &str
    ) -> Result<(), IOCError> {
        // In a real implementation, this would schedule the escalation
        // For now, we'll simulate immediate execution
        
        for recipient in &level.recipients {
            let escalation_data = ThreatNotificationData {
                ioc: threat_data.ioc.clone(),
                severity: threat_data.severity.clone(),
                detection_time: threat_data.detection_time,
                alert_type: format!("ESCALATION L{}: {}", level.level, threat_data.alert_type),
                recipients: vec![recipient.clone()],
                incident_id: threat_data.incident_id.clone(),
                business_impact: threat_data.business_impact.clone(),
                recommendations: threat_data.recommendations.clone(),
            };

            // Send escalation notification
            self.send_threat_notification(&escalation_data).await?;
        }

        Ok(())
    }

    /// Acknowledge a notification
    pub async fn acknowledge_notification(&self, notification_id: &str, acknowledged_by: &str) -> Result<(), IOCError> {
        let mut notifications = self.sent_notifications.write().await;
        if let Some(notification) = notifications.get_mut(notification_id) {
            notification.acknowledged = true;
            notification.acknowledged_at = Some(Utc::now());
            notification.acknowledged_by = Some(acknowledged_by.to_string());
        }
        Ok(())
    }

    /// Create alert suppression rule
    pub async fn create_alert_suppression(&self, suppression: AlertSuppression) -> Result<String, IOCError> {
        let suppression_id = suppression.id.clone();
        let mut suppressions = self.alert_suppressions.write().await;
        suppressions.insert(suppression_id.clone(), suppression);
        Ok(suppression_id)
    }

    /// Get notification statistics
    pub async fn get_statistics(&self) -> NotificationStats {
        self.statistics.read().await.clone()
    }

    /// Get health status
    pub async fn get_health(&self) -> ComponentHealth {
        let stats = self.statistics.read().await;
        let channels = self.notification_channels.read().await;
        let healthy_channels = channels.values()
            .filter(|c| c.health_status.status == HealthStatus::Healthy)
            .count();

        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Notification engine operational with {}/{} healthy channels", healthy_channels, channels.len()),
            last_check: Utc::now(),
            metrics: HashMap::from([
                ("total_channels".to_string(), channels.len() as f64),
                ("healthy_channels".to_string(), healthy_channels as f64),
                ("total_notifications_sent".to_string(), stats.total_notifications_sent as f64),
                ("escalations_triggered".to_string(), stats.escalations_triggered as f64),
                ("delivery_success_rate".to_string(), if stats.total_delivery_attempts > 0 {
                    stats.successful_deliveries as f64 / stats.total_delivery_attempts as f64 * 100.0
                } else { 100.0 }),
            ]),
        }
    }
}

// Notification data structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationChannel {
    pub id: String,
    pub name: String,
    pub channel_type: ChannelType,
    pub configuration: ChannelConfiguration,
    pub enabled: bool,
    pub health_status: ChannelHealth,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ChannelType {
    Email,
    Slack,
    SMS,
    Webhook,
    PagerDuty,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChannelConfiguration {
    pub settings: HashMap<String, serde_json::Value>,
    pub rate_limits: RateLimits,
    pub retry_policy: NotificationRetryPolicy,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimits {
    pub max_per_minute: u32,
    pub max_per_hour: u32,
    pub burst_limit: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationRetryPolicy {
    pub max_retries: u32,
    pub retry_delay: Duration,
    pub exponential_backoff: bool,
    pub retry_conditions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChannelHealth {
    pub status: HealthStatus,
    pub last_check: DateTime<Utc>,
    pub error_rate: f64,
    pub average_delivery_time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub severity: Severity,
    pub templates_by_channel: HashMap<ChannelType, MessageTemplate>,
    pub variables: Vec<TemplateVariable>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageTemplate {
    pub subject: String,
    pub body: String,
    pub format: MessageFormat,
    pub attachments: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageFormat {
    PlainText,
    HTML,
    Markdown,
    JSON,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateVariable {
    pub name: String,
    pub description: String,
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationPolicy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub trigger_conditions: Vec<EscalationTrigger>,
    pub escalation_levels: Vec<EscalationLevel>,
    pub max_escalation_level: u32,
    pub auto_resolve_conditions: Vec<AutoResolveCondition>,
    pub enabled: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationTrigger {
    pub condition_type: String,
    pub operator: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationLevel {
    pub level: u32,
    pub name: String,
    pub delay: Duration,
    pub recipients: Vec<NotificationRecipient>,
    pub acknowledgment_required: bool,
    pub acknowledgment_timeout: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoResolveCondition {
    pub condition_type: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationRecipient {
    pub recipient_type: RecipientType,
    pub identifier: String,
    pub channels: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RecipientType {
    Individual,
    Group,
    Role,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatNotificationData {
    pub ioc: IOC,
    pub severity: Severity,
    pub detection_time: DateTime<Utc>,
    pub alert_type: String,
    pub recipients: Vec<NotificationRecipient>,
    pub incident_id: Option<String>,
    pub business_impact: Option<String>,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenderedMessage {
    pub subject: String,
    pub body: String,
    pub format: MessageFormat,
    pub attachments: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationResult {
    pub notification_id: String,
    pub status: NotificationStatus,
    pub channels_sent: Vec<String>,
    pub total_recipients: u32,
    pub send_time: DateTime<Utc>,
    pub delivery_attempts: Vec<DeliveryAttempt>,
    pub escalation_triggered: bool,
    pub suppression_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationStatus {
    Delivered,
    PartiallyDelivered,
    Failed,
    Suppressed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryAttempt {
    pub id: String,
    pub channel_id: String,
    pub recipient: String,
    pub status: DeliveryStatus,
    pub attempt_time: DateTime<Utc>,
    pub delivery_time: Option<DateTime<Utc>>,
    pub error_message: Option<String>,
    pub retry_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DeliveryStatus {
    Delivered,
    Failed,
    Retrying,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SentNotification {
    pub id: String,
    pub template_id: String,
    pub ioc_id: String,
    pub severity: Severity,
    pub recipients: Vec<NotificationRecipient>,
    pub channels_used: Vec<String>,
    pub sent_at: DateTime<Utc>,
    pub context: HashMap<String, serde_json::Value>,
    pub delivery_attempts: Vec<DeliveryAttempt>,
    pub escalation_level: Option<u32>,
    pub acknowledged: bool,
    pub acknowledged_at: Option<DateTime<Utc>>,
    pub acknowledged_by: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertSuppression {
    pub id: String,
    pub name: String,
    pub description: String,
    pub conditions: Vec<SuppressionCondition>,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub created_by: String,
    pub reason: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SuppressionCondition {
    pub field: String,
    pub operator: String,
    pub value: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct NotificationStats {
    pub total_notifications_sent: u64,
    pub total_recipients: u64,
    pub total_delivery_attempts: u64,
    pub successful_deliveries: u64,
    pub failed_deliveries: u64,
    pub escalations_triggered: u64,
    pub suppressions_active: u64,
    pub average_delivery_time_ms: f64,
    pub last_notification_sent: Option<DateTime<Utc>>,
}