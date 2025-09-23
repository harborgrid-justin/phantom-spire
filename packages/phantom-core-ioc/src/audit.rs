// phantom-ioc-core/src/audit.rs
// Comprehensive audit logging, compliance tracking, and forensics

use crate::types::*;
use chrono::{DateTime, Utc, Duration};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Audit engine for comprehensive logging and compliance tracking
pub struct AuditEngine {
    audit_logs: Arc<RwLock<Vec<AuditRecord>>>,
    audit_configurations: Arc<RwLock<HashMap<String, AuditConfiguration>>>,
    retention_policies: Arc<RwLock<HashMap<String, RetentionPolicy>>>,
    compliance_mappings: Arc<RwLock<HashMap<String, ComplianceMapping>>>,
    statistics: Arc<RwLock<AuditStats>>,
}

impl AuditEngine {
    /// Create a new audit engine
    pub async fn new() -> Result<Self, IOCError> {
        let engine = Self {
            audit_logs: Arc::new(RwLock::new(Vec::new())),
            audit_configurations: Arc::new(RwLock::new(HashMap::new())),
            retention_policies: Arc::new(RwLock::new(HashMap::new())),
            compliance_mappings: Arc::new(RwLock::new(HashMap::new())),
            statistics: Arc::new(RwLock::new(AuditStats::default())),
        };

        // Initialize with default configurations
        engine.initialize_default_configurations().await?;

        Ok(engine)
    }

    /// Initialize default audit configurations
    async fn initialize_default_configurations(&self) -> Result<(), IOCError> {
        // Define default audit configurations
        let default_configs = vec![
            AuditConfiguration {
                id: "ioc_operations".to_string(),
                name: "IOC Operations Audit".to_string(),
                description: "Audit all IOC-related operations".to_string(),
                event_types: vec![
                    "ioc_created".to_string(),
                    "ioc_updated".to_string(),
                    "ioc_deleted".to_string(),
                    "ioc_validated".to_string(),
                    "ioc_enriched".to_string(),
                ],
                log_level: AuditLogLevel::Info,
                include_data: true,
                include_sensitive_data: false,
                filters: AuditFilters {
                    severity_threshold: Some(Severity::Low),
                    user_filters: vec![],
                    resource_filters: vec![],
                    action_filters: vec![],
                },
                retention_policy_id: "standard_retention".to_string(),
                compliance_requirements: vec!["SOX".to_string(), "PCI-DSS".to_string()],
                enabled: true,
                created_at: Utc::now(),
            },
            AuditConfiguration {
                id: "user_authentication".to_string(),
                name: "User Authentication Audit".to_string(),
                description: "Audit all user authentication events".to_string(),
                event_types: vec![
                    "user_login".to_string(),
                    "user_logout".to_string(),
                    "login_failed".to_string(),
                    "password_changed".to_string(),
                    "account_locked".to_string(),
                ],
                log_level: AuditLogLevel::Info,
                include_data: true,
                include_sensitive_data: false,
                filters: AuditFilters {
                    severity_threshold: None,
                    user_filters: vec![],
                    resource_filters: vec![],
                    action_filters: vec![],
                },
                retention_policy_id: "long_retention".to_string(),
                compliance_requirements: vec!["SOX".to_string(), "GDPR".to_string()],
                enabled: true,
                created_at: Utc::now(),
            },
            AuditConfiguration {
                id: "compliance_events".to_string(),
                name: "Compliance Events Audit".to_string(),
                description: "Audit events related to compliance requirements".to_string(),
                event_types: vec![
                    "compliance_assessment".to_string(),
                    "violation_detected".to_string(),
                    "remediation_action".to_string(),
                    "report_generated".to_string(),
                ],
                log_level: AuditLogLevel::Warning,
                include_data: true,
                include_sensitive_data: true,
                filters: AuditFilters {
                    severity_threshold: Some(Severity::Medium),
                    user_filters: vec![],
                    resource_filters: vec!["compliance".to_string()],
                    action_filters: vec![],
                },
                retention_policy_id: "compliance_retention".to_string(),
                compliance_requirements: vec!["GDPR".to_string(), "HIPAA".to_string(), "SOX".to_string()],
                enabled: true,
                created_at: Utc::now(),
            },
            AuditConfiguration {
                id: "system_administration".to_string(),
                name: "System Administration Audit".to_string(),
                description: "Audit administrative actions and system changes".to_string(),
                event_types: vec![
                    "config_changed".to_string(),
                    "user_created".to_string(),
                    "user_deleted".to_string(),
                    "permission_changed".to_string(),
                    "system_backup".to_string(),
                    "system_restore".to_string(),
                ],
                log_level: AuditLogLevel::Warning,
                include_data: true,
                include_sensitive_data: false,
                filters: AuditFilters {
                    severity_threshold: Some(Severity::Medium),
                    user_filters: vec!["admin".to_string(), "system".to_string()],
                    resource_filters: vec![],
                    action_filters: vec![],
                },
                retention_policy_id: "long_retention".to_string(),
                compliance_requirements: vec!["SOX".to_string()],
                enabled: true,
                created_at: Utc::now(),
            },
        ];

        let mut configs = self.audit_configurations.write().await;
        for config in default_configs {
            configs.insert(config.id.clone(), config);
        }
        drop(configs);

        // Define default retention policies
        let default_policies = vec![
            RetentionPolicy {
                id: "standard_retention".to_string(),
                name: "Standard Retention Policy".to_string(),
                description: "Standard 7-year retention for most audit logs".to_string(),
                retention_period: Duration::days(365 * 7), // 7 years
                archive_after: Duration::days(365 * 2), // Archive after 2 years
                encryption_required: true,
                compression_enabled: true,
                backup_frequency: BackupFrequency::Daily,
                geographical_restrictions: vec!["US".to_string(), "EU".to_string()],
                created_at: Utc::now(),
            },
            RetentionPolicy {
                id: "long_retention".to_string(),
                name: "Long Term Retention Policy".to_string(),
                description: "Extended retention for security-critical events".to_string(),
                retention_period: Duration::days(365 * 10), // 10 years
                archive_after: Duration::days(365 * 3), // Archive after 3 years
                encryption_required: true,
                compression_enabled: true,
                backup_frequency: BackupFrequency::Daily,
                geographical_restrictions: vec!["US".to_string()],
                created_at: Utc::now(),
            },
            RetentionPolicy {
                id: "compliance_retention".to_string(),
                name: "Compliance Retention Policy".to_string(),
                description: "Retention policy for compliance-related events".to_string(),
                retention_period: Duration::days(365 * 7), // 7 years (typical compliance requirement)
                archive_after: Duration::days(365 * 1), // Archive after 1 year
                encryption_required: true,
                compression_enabled: false, // No compression for compliance data
                backup_frequency: BackupFrequency::Hourly,
                geographical_restrictions: vec!["US".to_string(), "EU".to_string()],
                created_at: Utc::now(),
            },
        ];

        let mut policies = self.retention_policies.write().await;
        for policy in default_policies {
            policies.insert(policy.id.clone(), policy);
        }
        drop(policies);

        // Define compliance mappings
        let default_mappings = vec![
            ComplianceMapping {
                id: "sox_mapping".to_string(),
                framework: "SOX".to_string(),
                requirements: vec![
                    ComplianceRequirementMapping {
                        requirement_id: "sox_404".to_string(),
                        title: "Internal Control Over Financial Reporting".to_string(),
                        audit_events: vec![
                            "user_authentication".to_string(),
                            "system_administration".to_string(),
                            "ioc_operations".to_string(),
                        ],
                        retention_requirements: "7 years".to_string(),
                    },
                ],
                created_at: Utc::now(),
            },
            ComplianceMapping {
                id: "gdpr_mapping".to_string(),
                framework: "GDPR".to_string(),
                requirements: vec![
                    ComplianceRequirementMapping {
                        requirement_id: "gdpr_art_5".to_string(),
                        title: "Principles relating to processing of personal data".to_string(),
                        audit_events: vec![
                            "user_authentication".to_string(),
                            "compliance_events".to_string(),
                        ],
                        retention_requirements: "As long as processing is necessary".to_string(),
                    },
                    ComplianceRequirementMapping {
                        requirement_id: "gdpr_art_32".to_string(),
                        title: "Security of processing".to_string(),
                        audit_events: vec![
                            "system_administration".to_string(),
                            "ioc_operations".to_string(),
                        ],
                        retention_requirements: "Until risks are mitigated".to_string(),
                    },
                ],
                created_at: Utc::now(),
            },
        ];

        let mut mappings = self.compliance_mappings.write().await;
        for mapping in default_mappings {
            mappings.insert(mapping.id.clone(), mapping);
        }

        Ok(())
    }

    /// Log an audit event
    pub async fn log_event(&self, event: AuditEvent) -> Result<String, IOCError> {
        let record_id = Uuid::new_v4().to_string();
        let log_time = Utc::now();

        // Check if this event type should be audited
        let configs = self.audit_configurations.read().await;
        let applicable_configs: Vec<_> = configs.values()
            .filter(|config| config.enabled && config.event_types.contains(&event.event_type))
            .cloned()
            .collect();
        drop(configs);

        if applicable_configs.is_empty() {
            return Err(IOCError::Configuration(format!("No audit configuration found for event type: {}", event.event_type)));
        }

        // Apply filters and determine log level
        let should_log = applicable_configs.iter().any(|config| {
            self.should_log_event(&event, config)
        });

        if !should_log {
            return Ok(record_id); // Event was filtered out
        }

        // Create audit record
        let audit_record = AuditRecord {
            id: record_id.clone(),
            event_type: event.event_type.clone(),
            timestamp: log_time,
            actor: Actor {
                actor_type: event.actor.actor_type.clone(),
                identifier: event.actor.identifier.clone(),
                session_id: event.actor.session_id.clone(),
                ip_address: event.actor.ip_address.clone(),
                user_agent: event.actor.user_agent.clone(),
            },
            resource: Resource {
                resource_type: event.resource.resource_type.clone(),
                resource_id: event.resource.resource_id.clone(),
                resource_name: event.resource.resource_name.clone(),
                parent_resource: event.resource.parent_resource.clone(),
            },
            action: Action {
                action_type: event.action.action_type.clone(),
                description: event.action.description.clone(),
                outcome: event.action.outcome.clone(),
                error_details: event.action.error_details.clone(),
            },
            context: AuditContext {
                request_id: event.context.request_id.clone(),
                correlation_id: event.context.correlation_id.clone(),
                source_system: event.context.source_system.clone(),
                additional_data: if applicable_configs.iter().any(|c| c.include_data) {
                    event.context.additional_data.clone()
                } else {
                    HashMap::new()
                },
                sensitive_data: if applicable_configs.iter().any(|c| c.include_sensitive_data) {
                    event.context.sensitive_data.clone()
                } else {
                    HashMap::new()
                },
            },
            compliance_tags: self.determine_compliance_tags(&event.event_type).await,
            severity: self.determine_event_severity(&event).await,
            retention_policy_id: applicable_configs.first()
                .map(|c| c.retention_policy_id.clone())
                .unwrap_or_else(|| "standard_retention".to_string()),
            integrity_hash: self.calculate_integrity_hash(&event).await,
        };

        // Store audit record
        {
            let mut logs = self.audit_logs.write().await;
            logs.push(audit_record);
            
            // Keep only last 100,000 records in memory (would use persistent storage in production)
            if logs.len() > 100_000 {
                logs.drain(0..50_000);
            }
        }

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.total_events_logged += 1;
            stats.events_by_type.entry(event.event_type.clone())
                .and_modify(|count| *count += 1)
                .or_insert(1);
            stats.last_event_logged = Some(log_time);
        }

        Ok(record_id)
    }

    /// Check if an event should be logged based on configuration
    fn should_log_event(&self, event: &AuditEvent, config: &AuditConfiguration) -> bool {
        // Check severity threshold
        if let Some(threshold) = &config.filters.severity_threshold {
            let event_severity = self.determine_event_severity_sync(event);
            if event_severity < *threshold {
                return false;
            }
        }

        // Check user filters
        if !config.filters.user_filters.is_empty() {
            let actor_matches = config.filters.user_filters.iter()
                .any(|filter| event.actor.identifier.contains(filter));
            if !actor_matches {
                return false;
            }
        }

        // Check resource filters
        if !config.filters.resource_filters.is_empty() {
            let resource_matches = config.filters.resource_filters.iter()
                .any(|filter| event.resource.resource_type.contains(filter));
            if !resource_matches {
                return false;
            }
        }

        // Check action filters
        if !config.filters.action_filters.is_empty() {
            let action_matches = config.filters.action_filters.iter()
                .any(|filter| event.action.action_type.contains(filter));
            if !action_matches {
                return false;
            }
        }

        true
    }

    /// Determine compliance tags for an event type
    async fn determine_compliance_tags(&self, event_type: &str) -> Vec<String> {
        let mappings = self.compliance_mappings.read().await;
        let mut tags = Vec::new();

        for mapping in mappings.values() {
            for requirement in &mapping.requirements {
                if requirement.audit_events.contains(&event_type.to_string()) {
                    tags.push(format!("{}:{}", mapping.framework, requirement.requirement_id));
                }
            }
        }

        tags
    }

    /// Determine event severity
    async fn determine_event_severity(&self, event: &AuditEvent) -> Severity {
        self.determine_event_severity_sync(event)
    }

    /// Determine event severity (synchronous version)
    fn determine_event_severity_sync(&self, event: &AuditEvent) -> Severity {
        match event.event_type.as_str() {
            "user_login" | "user_logout" => Severity::Low,
            "login_failed" | "ioc_created" | "ioc_updated" => Severity::Medium,
            "account_locked" | "user_deleted" | "config_changed" => Severity::High,
            "violation_detected" | "security_breach" => Severity::Critical,
            _ => Severity::Medium,
        }
    }

    /// Calculate integrity hash for audit record
    async fn calculate_integrity_hash(&self, event: &AuditEvent) -> String {
        // Simplified hash calculation - would use proper cryptographic hash in production
        let data = format!("{}:{}:{}:{}:{}",
            event.event_type,
            event.actor.identifier,
            event.resource.resource_type,
            event.action.action_type,
            Utc::now().timestamp()
        );
        
        // Simulate SHA-256 hash
        format!("sha256:{:x}", data.len() * 12345)
    }

    /// Search audit logs
    pub async fn search_logs(&self, criteria: &AuditSearchCriteria) -> Result<AuditSearchResult, IOCError> {
        let logs = self.audit_logs.read().await;
        let mut matching_records = Vec::new();

        for record in logs.iter() {
            if self.record_matches_criteria(record, criteria) {
                matching_records.push(record.clone());
            }
        }

        // Apply sorting
        matching_records.sort_by(|a, b| match criteria.sort_order {
            SortOrder::Ascending => a.timestamp.cmp(&b.timestamp),
            SortOrder::Descending => b.timestamp.cmp(&a.timestamp),
        });

        // Apply pagination
        let total_count = matching_records.len();
        let start_index = (criteria.page - 1) * criteria.page_size;
        let end_index = (start_index + criteria.page_size).min(total_count);
        
        let page_records = if start_index < total_count {
            matching_records[start_index..end_index].to_vec()
        } else {
            Vec::new()
        };

        Ok(AuditSearchResult {
            records: page_records,
            total_count: total_count as u64,
            page: criteria.page,
            page_size: criteria.page_size,
            total_pages: ((total_count as f64) / (criteria.page_size as f64)).ceil() as u32,
        })
    }

    /// Check if a record matches search criteria
    fn record_matches_criteria(&self, record: &AuditRecord, criteria: &AuditSearchCriteria) -> bool {
        // Check time range
        if let Some((start, end)) = criteria.time_range {
            if record.timestamp < start || record.timestamp > end {
                return false;
            }
        }

        // Check event types
        if !criteria.event_types.is_empty() && !criteria.event_types.contains(&record.event_type) {
            return false;
        }

        // Check actors
        if !criteria.actors.is_empty() && !criteria.actors.contains(&record.actor.identifier) {
            return false;
        }

        // Check resources
        if !criteria.resources.is_empty() {
            let resource_match = criteria.resources.iter()
                .any(|r| record.resource.resource_type.contains(r) || record.resource.resource_id.contains(r));
            if !resource_match {
                return false;
            }
        }

        // Check actions
        if !criteria.actions.is_empty() && !criteria.actions.contains(&record.action.action_type) {
            return false;
        }

        // Check severity
        if !criteria.severities.is_empty() && !criteria.severities.contains(&record.severity) {
            return false;
        }

        // Check compliance tags
        if !criteria.compliance_tags.is_empty() {
            let compliance_match = criteria.compliance_tags.iter()
                .any(|tag| record.compliance_tags.contains(tag));
            if !compliance_match {
                return false;
            }
        }

        // Check text search
        if let Some(text) = &criteria.text_search {
            let searchable_text = format!("{} {} {} {} {}",
                record.event_type,
                record.actor.identifier,
                record.resource.resource_type,
                record.action.description,
                serde_json::to_string(&record.context.additional_data).unwrap_or_default()
            ).to_lowercase();
            
            if !searchable_text.contains(&text.to_lowercase()) {
                return false;
            }
        }

        true
    }

    /// Generate compliance report
    pub async fn generate_compliance_report(&self, framework: &str, period: (DateTime<Utc>, DateTime<Utc>)) -> Result<ComplianceAuditReport, IOCError> {
        let report_id = Uuid::new_v4().to_string();
        let generation_time = Utc::now();

        // Get compliance mapping
        let mappings = self.compliance_mappings.read().await;
        let mapping = mappings.values()
            .find(|m| m.framework == framework)
            .ok_or_else(|| IOCError::Configuration(format!("No compliance mapping found for framework: {}", framework)))?;

        // Search for relevant audit records
        let mut requirement_reports = Vec::new();
        
        for requirement in &mapping.requirements {
            let criteria = AuditSearchCriteria {
                time_range: Some(period),
                event_types: requirement.audit_events.clone(),
                actors: vec![],
                resources: vec![],
                actions: vec![],
                severities: vec![],
                compliance_tags: vec![format!("{}:{}", framework, requirement.requirement_id)],
                text_search: None,
                page: 1,
                page_size: 10000, // Get all records for the report
                sort_order: SortOrder::Descending,
            };

            let search_result = self.search_logs(&criteria).await?;
            
            let requirement_report = RequirementAuditReport {
                requirement_id: requirement.requirement_id.clone(),
                title: requirement.title.clone(),
                total_events: search_result.total_count,
                events_by_type: self.group_events_by_type(&search_result.records),
                severity_distribution: self.analyze_severity_distribution(&search_result.records),
                compliance_status: self.assess_requirement_compliance(&search_result.records, requirement),
                violations: self.identify_violations(&search_result.records),
                recommendations: self.generate_compliance_recommendations(&search_result.records, requirement),
            };

            requirement_reports.push(requirement_report);
        }

        let overall_status = if requirement_reports.iter().all(|r| r.compliance_status == RequirementComplianceStatus::Compliant) {
            OverallComplianceStatus::Compliant
        } else if requirement_reports.iter().any(|r| r.compliance_status == RequirementComplianceStatus::NonCompliant) {
            OverallComplianceStatus::NonCompliant
        } else {
            OverallComplianceStatus::PartiallyCompliant
        };

        Ok(ComplianceAuditReport {
            id: report_id,
            framework: framework.to_string(),
            period,
            generated_at: generation_time,
            overall_status,
            requirement_reports,
            summary: ComplianceReportSummary {
                total_events: requirement_reports.iter().map(|r| r.total_events).sum(),
                compliant_requirements: requirement_reports.iter()
                    .filter(|r| r.compliance_status == RequirementComplianceStatus::Compliant)
                    .count() as u32,
                non_compliant_requirements: requirement_reports.iter()
                    .filter(|r| r.compliance_status == RequirementComplianceStatus::NonCompliant)
                    .count() as u32,
                total_violations: requirement_reports.iter()
                    .map(|r| r.violations.len() as u32)
                    .sum(),
            },
        })
    }

    /// Group events by type
    fn group_events_by_type(&self, records: &[AuditRecord]) -> HashMap<String, u64> {
        let mut groups = HashMap::new();
        for record in records {
            *groups.entry(record.event_type.clone()).or_insert(0) += 1;
        }
        groups
    }

    /// Analyze severity distribution
    fn analyze_severity_distribution(&self, records: &[AuditRecord]) -> HashMap<Severity, u64> {
        let mut distribution = HashMap::new();
        for record in records {
            *distribution.entry(record.severity.clone()).or_insert(0) += 1;
        }
        distribution
    }

    /// Assess requirement compliance
    fn assess_requirement_compliance(&self, records: &[AuditRecord], requirement: &ComplianceRequirementMapping) -> RequirementComplianceStatus {
        // Simplified compliance assessment
        let violation_count = records.iter()
            .filter(|r| r.action.outcome == ActionOutcome::Failed)
            .count();

        let total_count = records.len();
        
        if total_count == 0 {
            RequirementComplianceStatus::Unknown
        } else if violation_count == 0 {
            RequirementComplianceStatus::Compliant
        } else if (violation_count as f64 / total_count as f64) > 0.1 {
            RequirementComplianceStatus::NonCompliant
        } else {
            RequirementComplianceStatus::PartiallyCompliant
        }
    }

    /// Identify violations
    fn identify_violations(&self, records: &[AuditRecord]) -> Vec<ComplianceViolation> {
        records.iter()
            .filter(|r| r.action.outcome == ActionOutcome::Failed || r.severity == Severity::Critical)
            .map(|record| ComplianceViolation {
                id: Uuid::new_v4().to_string(),
                audit_record_id: record.id.clone(),
                violation_type: "audit_failure".to_string(),
                description: format!("Failed audit event: {}", record.event_type),
                severity: record.severity.clone(),
                detected_at: record.timestamp,
            })
            .collect()
    }

    /// Generate compliance recommendations
    fn generate_compliance_recommendations(&self, records: &[AuditRecord], requirement: &ComplianceRequirementMapping) -> Vec<String> {
        let mut recommendations = Vec::new();

        let failed_count = records.iter()
            .filter(|r| r.action.outcome == ActionOutcome::Failed)
            .count();

        if failed_count > 0 {
            recommendations.push(format!("Review and address {} failed audit events", failed_count));
        }

        let critical_count = records.iter()
            .filter(|r| r.severity == Severity::Critical)
            .count();

        if critical_count > 0 {
            recommendations.push(format!("Investigate {} critical security events", critical_count));
        }

        if records.len() < 10 {
            recommendations.push("Consider increasing audit coverage for this requirement".to_string());
        }

        recommendations
    }

    /// Export audit logs
    pub async fn export_logs(&self, criteria: &AuditSearchCriteria, format: &AuditExportFormat) -> Result<String, IOCError> {
        let search_result = self.search_logs(criteria).await?;

        match format {
            AuditExportFormat::JSON => {
                serde_json::to_string_pretty(&search_result.records)
                    .map_err(|e| IOCError::Processing(format!("JSON export error: {}", e)))
            }
            AuditExportFormat::CSV => {
                let mut csv = String::from("timestamp,event_type,actor,resource_type,resource_id,action_type,outcome,severity\n");
                for record in &search_result.records {
                    csv.push_str(&format!(
                        "{},{},{},{},{},{},{:?},{:?}\n",
                        record.timestamp.format("%Y-%m-%d %H:%M:%S UTC"),
                        record.event_type,
                        record.actor.identifier,
                        record.resource.resource_type,
                        record.resource.resource_id,
                        record.action.action_type,
                        record.action.outcome,
                        record.severity
                    ));
                }
                Ok(csv)
            }
            AuditExportFormat::SIEM => {
                // Export in SIEM-compatible format (simplified)
                let mut siem_logs = String::new();
                for record in &search_result.records {
                    siem_logs.push_str(&format!(
                        "CEF:0|PhantomSpire|AuditEngine|1.0|{}|{}|{}|src={} suser={} cs1={} cs2={}\n",
                        record.event_type,
                        record.action.description,
                        match record.severity {
                            Severity::Low => 3,
                            Severity::Medium => 5,
                            Severity::High => 7,
                            Severity::Critical => 10,
                        },
                        record.actor.ip_address.as_deref().unwrap_or("unknown"),
                        record.actor.identifier,
                        record.resource.resource_type,
                        record.resource.resource_id
                    ));
                }
                Ok(siem_logs)
            }
        }
    }

    /// Get audit statistics
    pub async fn get_statistics(&self) -> AuditStats {
        self.statistics.read().await.clone()
    }

    /// Get health status
    pub async fn get_health(&self) -> ComponentHealth {
        let stats = self.statistics.read().await;
        let logs = self.audit_logs.read().await;
        let configs = self.audit_configurations.read().await;

        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Audit engine operational with {} configurations and {} log records", configs.len(), logs.len()),
            last_check: Utc::now(),
            metrics: HashMap::from([
                ("total_configurations".to_string(), configs.len() as f64),
                ("total_events_logged".to_string(), stats.total_events_logged as f64),
                ("log_records_in_memory".to_string(), logs.len() as f64),
                ("unique_event_types".to_string(), stats.events_by_type.len() as f64),
            ]),
        }
    }
}

// Audit data structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditConfiguration {
    pub id: String,
    pub name: String,
    pub description: String,
    pub event_types: Vec<String>,
    pub log_level: AuditLogLevel,
    pub include_data: bool,
    pub include_sensitive_data: bool,
    pub filters: AuditFilters,
    pub retention_policy_id: String,
    pub compliance_requirements: Vec<String>,
    pub enabled: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditLogLevel {
    Debug,
    Info,
    Warning,
    Error,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditFilters {
    pub severity_threshold: Option<Severity>,
    pub user_filters: Vec<String>,
    pub resource_filters: Vec<String>,
    pub action_filters: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetentionPolicy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub retention_period: Duration,
    pub archive_after: Duration,
    pub encryption_required: bool,
    pub compression_enabled: bool,
    pub backup_frequency: BackupFrequency,
    pub geographical_restrictions: Vec<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BackupFrequency {
    Hourly,
    Daily,
    Weekly,
    Monthly,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceMapping {
    pub id: String,
    pub framework: String,
    pub requirements: Vec<ComplianceRequirementMapping>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceRequirementMapping {
    pub requirement_id: String,
    pub title: String,
    pub audit_events: Vec<String>,
    pub retention_requirements: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub event_type: String,
    pub actor: Actor,
    pub resource: Resource,
    pub action: Action,
    pub context: AuditContext,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Actor {
    pub actor_type: ActorType,
    pub identifier: String,
    pub session_id: Option<String>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActorType {
    User,
    System,
    Service,
    API,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Resource {
    pub resource_type: String,
    pub resource_id: String,
    pub resource_name: Option<String>,
    pub parent_resource: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Action {
    pub action_type: String,
    pub description: String,
    pub outcome: ActionOutcome,
    pub error_details: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ActionOutcome {
    Success,
    Failed,
    Partial,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditContext {
    pub request_id: Option<String>,
    pub correlation_id: Option<String>,
    pub source_system: Option<String>,
    pub additional_data: HashMap<String, serde_json::Value>,
    pub sensitive_data: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditRecord {
    pub id: String,
    pub event_type: String,
    pub timestamp: DateTime<Utc>,
    pub actor: Actor,
    pub resource: Resource,
    pub action: Action,
    pub context: AuditContext,
    pub compliance_tags: Vec<String>,
    pub severity: Severity,
    pub retention_policy_id: String,
    pub integrity_hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditSearchCriteria {
    pub time_range: Option<(DateTime<Utc>, DateTime<Utc>)>,
    pub event_types: Vec<String>,
    pub actors: Vec<String>,
    pub resources: Vec<String>,
    pub actions: Vec<String>,
    pub severities: Vec<Severity>,
    pub compliance_tags: Vec<String>,
    pub text_search: Option<String>,
    pub page: usize,
    pub page_size: usize,
    pub sort_order: SortOrder,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SortOrder {
    Ascending,
    Descending,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditSearchResult {
    pub records: Vec<AuditRecord>,
    pub total_count: u64,
    pub page: usize,
    pub page_size: usize,
    pub total_pages: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditExportFormat {
    JSON,
    CSV,
    SIEM,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceAuditReport {
    pub id: String,
    pub framework: String,
    pub period: (DateTime<Utc>, DateTime<Utc>),
    pub generated_at: DateTime<Utc>,
    pub overall_status: OverallComplianceStatus,
    pub requirement_reports: Vec<RequirementAuditReport>,
    pub summary: ComplianceReportSummary,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum OverallComplianceStatus {
    Compliant,
    PartiallyCompliant,
    NonCompliant,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequirementAuditReport {
    pub requirement_id: String,
    pub title: String,
    pub total_events: u64,
    pub events_by_type: HashMap<String, u64>,
    pub severity_distribution: HashMap<Severity, u64>,
    pub compliance_status: RequirementComplianceStatus,
    pub violations: Vec<ComplianceViolation>,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RequirementComplianceStatus {
    Compliant,
    PartiallyCompliant,
    NonCompliant,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceViolation {
    pub id: String,
    pub audit_record_id: String,
    pub violation_type: String,
    pub description: String,
    pub severity: Severity,
    pub detected_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceReportSummary {
    pub total_events: u64,
    pub compliant_requirements: u32,
    pub non_compliant_requirements: u32,
    pub total_violations: u32,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct AuditStats {
    pub total_events_logged: u64,
    pub events_by_type: HashMap<String, u64>,
    pub events_by_severity: HashMap<String, u64>,
    pub average_events_per_day: f64,
    pub last_event_logged: Option<DateTime<Utc>>,
}