//! Plugin Security and Sandboxing
//!
//! Provides comprehensive security features including permission management,
//! resource isolation, signature verification, and security policy enforcement.

use super::*;
use sha2::{Digest, Sha256};
use std::collections::{HashMap, HashSet};
use std::path::Path;
use std::sync::Arc;
use tokio::fs;
use tracing::{debug, error, info, instrument, warn};

/// Security configuration for the plugin system
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    /// Enable strict security mode
    pub strict_mode: bool,
    /// Require plugin signatures
    pub require_signatures: bool,
    /// Trusted certificate authorities
    pub trusted_cas: Vec<String>,
    /// Allowed plugin sources
    pub allowed_sources: Vec<String>,
    /// Blocked plugin IDs
    pub blocked_plugins: HashSet<String>,
    /// Default permission policy
    pub default_permissions: Vec<Permission>,
    /// Enable resource quotas
    pub enable_resource_quotas: bool,
    /// Security audit logging
    pub audit_logging: bool,
    /// Maximum plugin file size in bytes
    pub max_plugin_size_bytes: u64,
    /// Enable content scanning
    pub content_scanning: bool,
    /// Security policy file path
    pub security_policy_path: Option<String>,
}

impl Default for SecurityConfig {
    fn default() -> Self {
        Self {
            strict_mode: true,
            require_signatures: false, // Disabled by default for development
            trusted_cas: Vec::new(),
            allowed_sources: vec!["filesystem".to_string(), "marketplace".to_string()],
            blocked_plugins: HashSet::new(),
            default_permissions: vec![
                Permission::FileSystemRead { paths: vec!["./data".to_string()] },
                Permission::Environment { variables: vec!["PATH".to_string()] },
            ],
            enable_resource_quotas: true,
            audit_logging: true,
            max_plugin_size_bytes: 100 * 1024 * 1024, // 100MB
            content_scanning: true,
            security_policy_path: None,
        }
    }
}

/// Security policy for plugin execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityPolicy {
    /// Policy version
    pub version: String,
    /// Policy name
    pub name: String,
    /// Default action for unknown operations
    pub default_action: SecurityAction,
    /// Plugin-specific rules
    pub plugin_rules: HashMap<String, PluginSecurityRule>,
    /// Global permission rules
    pub permission_rules: Vec<PermissionRule>,
    /// Resource limit rules
    pub resource_limit_rules: Vec<ResourceLimitRule>,
    /// Content filtering rules
    pub content_filter_rules: Vec<ContentFilterRule>,
    /// Network access rules
    pub network_rules: Vec<NetworkRule>,
}

/// Security actions that can be taken
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum SecurityAction {
    /// Allow the operation
    Allow,
    /// Deny the operation
    Deny,
    /// Allow with audit logging
    AuditAllow,
    /// Allow with additional restrictions
    RestrictedAllow,
    /// Prompt user for decision
    Prompt,
}

/// Plugin-specific security rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginSecurityRule {
    /// Plugin ID or pattern
    pub plugin_id: String,
    /// Allowed permissions
    pub allowed_permissions: Vec<Permission>,
    /// Denied permissions
    pub denied_permissions: Vec<Permission>,
    /// Resource limits
    pub resource_limits: ResourceLimits,
    /// Custom security settings
    pub custom_settings: HashMap<String, serde_json::Value>,
}

/// Permission rule for access control
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionRule {
    /// Rule name
    pub name: String,
    /// Permission type to match
    pub permission_type: String,
    /// Matching patterns
    pub patterns: Vec<String>,
    /// Action to take
    pub action: SecurityAction,
    /// Additional conditions
    pub conditions: HashMap<String, serde_json::Value>,
}

/// Resource limit rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceLimitRule {
    /// Rule name
    pub name: String,
    /// Resource type (memory, cpu, network, etc.)
    pub resource_type: String,
    /// Plugin patterns this rule applies to
    pub plugin_patterns: Vec<String>,
    /// Limit value
    pub limit: u64,
    /// Action when limit is exceeded
    pub action: SecurityAction,
}

/// Content filtering rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContentFilterRule {
    /// Rule name
    pub name: String,
    /// Content patterns to match (regex)
    pub patterns: Vec<String>,
    /// File types to scan
    pub file_types: Vec<String>,
    /// Action to take on match
    pub action: SecurityAction,
    /// Severity level
    pub severity: String,
}

/// Network access rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkRule {
    /// Rule name
    pub name: String,
    /// Allowed/denied hosts
    pub hosts: Vec<String>,
    /// Allowed/denied ports
    pub ports: Vec<u16>,
    /// Allowed/denied protocols
    pub protocols: Vec<String>,
    /// Action to take
    pub action: SecurityAction,
}

/// Security audit event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityAuditEvent {
    /// Event ID
    pub id: String,
    /// Timestamp
    pub timestamp: DateTime<Utc>,
    /// Plugin ID
    pub plugin_id: String,
    /// Event type
    pub event_type: SecurityEventType,
    /// Event details
    pub details: String,
    /// Security action taken
    pub action: SecurityAction,
    /// Additional metadata
    pub metadata: HashMap<String, serde_json::Value>,
    /// Severity level
    pub severity: SecuritySeverity,
}

/// Security event types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SecurityEventType {
    /// Permission violation
    PermissionViolation,
    /// Resource limit exceeded
    ResourceLimitExceeded,
    /// Signature verification failed
    SignatureVerificationFailed,
    /// Malicious content detected
    MaliciousContentDetected,
    /// Unauthorized network access
    UnauthorizedNetworkAccess,
    /// Policy violation
    PolicyViolation,
    /// Security scan completed
    SecurityScanCompleted,
    /// Custom security event
    Custom(String),
}

/// Security severity levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum SecuritySeverity {
    /// Low severity
    Low,
    /// Medium severity
    Medium,
    /// High severity
    High,
    /// Critical severity
    Critical,
}

/// Plugin security scanner result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityScanResult {
    /// Plugin ID
    pub plugin_id: String,
    /// Scan timestamp
    pub timestamp: DateTime<Utc>,
    /// Overall security score (0-100)
    pub security_score: u8,
    /// Whether plugin passed security scan
    pub passed: bool,
    /// List of security issues found
    pub issues: Vec<SecurityIssue>,
    /// Recommendations
    pub recommendations: Vec<String>,
    /// Scan metadata
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Security issue found during scanning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityIssue {
    /// Issue ID
    pub id: String,
    /// Issue type
    pub issue_type: String,
    /// Severity level
    pub severity: SecuritySeverity,
    /// Issue description
    pub description: String,
    /// Location where issue was found
    pub location: String,
    /// Recommended fix
    pub fix_recommendation: Option<String>,
    /// Additional details
    pub details: HashMap<String, serde_json::Value>,
}

/// Plugin security manager
pub struct SecurityManager {
    config: SecurityConfig,
    policy: Option<SecurityPolicy>,
    audit_events: Arc<parking_lot::RwLock<Vec<SecurityAuditEvent>>>,
    blocked_plugins: Arc<parking_lot::RwLock<HashSet<String>>>,
    trusted_signatures: Arc<parking_lot::RwLock<HashSet<String>>>,
    content_scanner: Option<Arc<dyn ContentScanner>>,
}

/// Content scanner trait for detecting malicious content
#[async_trait]
pub trait ContentScanner: Send + Sync {
    /// Scan plugin content for security issues
    async fn scan_plugin(&self, plugin_path: &Path) -> PluginResult<Vec<SecurityIssue>>;

    /// Scan individual file
    async fn scan_file(&self, file_path: &Path) -> PluginResult<Vec<SecurityIssue>>;

    /// Get scanner name
    fn name(&self) -> &str;
}

impl SecurityManager {
    /// Create a new security manager
    pub fn new(config: SecurityConfig) -> Self {
        Self {
            config,
            policy: None,
            audit_events: Arc::new(parking_lot::RwLock::new(Vec::new())),
            blocked_plugins: Arc::new(parking_lot::RwLock::new(HashSet::new())),
            trusted_signatures: Arc::new(parking_lot::RwLock::new(HashSet::new())),
            content_scanner: None,
        }
    }

    /// Initialize security manager
    #[instrument(skip(self))]
    pub async fn initialize(&mut self) -> PluginResult<()> {
        info!("Initializing security manager");

        // Load security policy if configured
        if let Some(policy_path) = &self.config.security_policy_path {
            self.load_security_policy(policy_path).await?;
        }

        // Initialize blocked plugins
        *self.blocked_plugins.write() = self.config.blocked_plugins.clone();

        // Set up default content scanner
        if self.config.content_scanning {
            self.content_scanner = Some(Arc::new(DefaultContentScanner::new()));
        }

        info!("Security manager initialized");
        Ok(())
    }

    /// Load security policy from file
    async fn load_security_policy(&mut self, policy_path: &str) -> PluginResult<()> {
        info!("Loading security policy from: {}", policy_path);

        let content = fs::read_to_string(policy_path).await?;
        let policy: SecurityPolicy = if policy_path.ends_with(".json") {
            serde_json::from_str(&content)?
        } else {
            // Assume TOML format
            let toml_value: toml::Value = toml::from_str(&content)
                .map_err(|e| PluginError::ConfigurationInvalid {
                    field: format!("Security policy parse error: {}", e),
                })?;
            serde_json::from_value(serde_json::to_value(toml_value)?)?
        };

        self.policy = Some(policy);
        info!("Security policy loaded successfully");
        Ok(())
    }

    /// Validate plugin security before loading
    #[instrument(skip(self, metadata))]
    pub async fn validate_plugin_security(
        &self,
        plugin_path: &Path,
        metadata: &PluginMetadata,
    ) -> PluginResult<SecurityScanResult> {
        info!("Validating plugin security: {}", metadata.id);

        // Check if plugin is blocked
        if self.blocked_plugins.read().contains(&metadata.id) {
            return Err(PluginError::SecurityViolation {
                violation: format!("Plugin {} is blocked by security policy", metadata.id),
            });
        }

        // Check plugin size
        let plugin_size = self.calculate_plugin_size(plugin_path).await?;
        if plugin_size > self.config.max_plugin_size_bytes {
            return Err(PluginError::SecurityViolation {
                violation: format!(
                    "Plugin size {} exceeds maximum allowed size {}",
                    plugin_size, self.config.max_plugin_size_bytes
                ),
            });
        }

        let mut issues = Vec::new();
        let mut security_score = 100u8;

        // Verify plugin signature if required
        if self.config.require_signatures {
            match self.verify_plugin_signature(plugin_path, metadata).await {
                Ok(_) => {
                    debug!("Plugin signature verified successfully");
                }
                Err(e) => {
                    issues.push(SecurityIssue {
                        id: "SIG001".to_string(),
                        issue_type: "SignatureVerification".to_string(),
                        severity: SecuritySeverity::Critical,
                        description: format!("Plugin signature verification failed: {}", e),
                        location: plugin_path.to_string_lossy().to_string(),
                        fix_recommendation: Some("Ensure plugin is properly signed".to_string()),
                        details: HashMap::new(),
                    });
                    security_score -= 30;
                }
            }
        }

        // Validate permissions
        let permission_issues = self.validate_permissions(&metadata.permissions).await?;
        for issue in permission_issues {
            security_score -= 10;
            issues.push(issue);
        }

        // Scan content if enabled
        if self.config.content_scanning {
            if let Some(scanner) = &self.content_scanner {
                let scan_issues = scanner.scan_plugin(plugin_path).await?;
                for issue in scan_issues {
                    match issue.severity {
                        SecuritySeverity::Critical => security_score -= 25,
                        SecuritySeverity::High => security_score -= 15,
                        SecuritySeverity::Medium => security_score -= 5,
                        SecuritySeverity::Low => security_score -= 1,
                    }
                    issues.push(issue);
                }
            }
        }

        // Check policy compliance
        if let Some(policy) = &self.policy {
            let policy_issues = self.check_policy_compliance(metadata, policy).await?;
            for issue in policy_issues {
                security_score -= 10;
                issues.push(issue);
            }
        }

        let passed = issues.iter().all(|issue| issue.severity < SecuritySeverity::Critical);

        let scan_result = SecurityScanResult {
            plugin_id: metadata.id.clone(),
            timestamp: Utc::now(),
            security_score,
            passed,
            issues: issues.clone(),
            recommendations: self.generate_security_recommendations(&issues),
            metadata: HashMap::new(),
        };

        // Log security audit event
        self.log_audit_event(
            &metadata.id,
            SecurityEventType::SecurityScanCompleted,
            format!("Security scan completed with score: {}", security_score),
            if passed { SecurityAction::Allow } else { SecurityAction::Deny },
            SecuritySeverity::Low,
        ).await;

        info!(
            "Plugin security validation completed: {} (score: {}, passed: {})",
            metadata.id, security_score, passed
        );

        Ok(scan_result)
    }

    /// Calculate total size of plugin files
    async fn calculate_plugin_size(&self, plugin_path: &Path) -> PluginResult<u64> {
        let mut total_size = 0u64;

        if plugin_path.is_file() {
            let metadata = fs::metadata(plugin_path).await?;
            total_size += metadata.len();
        } else if plugin_path.is_dir() {
            let mut entries = fs::read_dir(plugin_path).await?;
            while let Some(entry) = entries.next_entry().await? {
                let path = entry.path();
                if path.is_file() {
                    let metadata = fs::metadata(&path).await?;
                    total_size += metadata.len();
                } else if path.is_dir() {
                    // Recursive calculation for subdirectories
                    total_size += self.calculate_plugin_size(&path).await?;
                }
            }
        }

        Ok(total_size)
    }

    /// Verify plugin signature
    async fn verify_plugin_signature(
        &self,
        plugin_path: &Path,
        metadata: &PluginMetadata,
    ) -> PluginResult<()> {
        // TODO: Implement proper digital signature verification
        // For now, just verify checksum if available
        if !metadata.checksum.is_empty() {
            let calculated_checksum = self.calculate_plugin_checksum(plugin_path).await?;
            if calculated_checksum != metadata.checksum {
                return Err(PluginError::SecurityViolation {
                    violation: "Plugin checksum verification failed".to_string(),
                });
            }
        }

        // Check if signature is in trusted list
        if let Some(signature) = &metadata.signature {
            if !self.trusted_signatures.read().contains(signature) {
                return Err(PluginError::SecurityViolation {
                    violation: "Plugin signature not in trusted list".to_string(),
                });
            }
        }

        Ok(())
    }

    /// Calculate plugin checksum
    async fn calculate_plugin_checksum(&self, plugin_path: &Path) -> PluginResult<String> {
        let mut hasher = Sha256::new();

        if plugin_path.is_file() {
            let content = fs::read(plugin_path).await?;
            hasher.update(&content);
        } else if plugin_path.is_dir() {
            // Hash all files in directory
            let mut entries = fs::read_dir(plugin_path).await?;
            let mut file_paths = Vec::new();

            while let Some(entry) = entries.next_entry().await? {
                let path = entry.path();
                if path.is_file() {
                    file_paths.push(path);
                }
            }

            // Sort paths for deterministic hash
            file_paths.sort();

            for path in file_paths {
                let content = fs::read(&path).await?;
                hasher.update(&content);
                hasher.update(path.to_string_lossy().as_bytes());
            }
        }

        Ok(format!("{:x}", hasher.finalize()))
    }

    /// Validate plugin permissions
    async fn validate_permissions(
        &self,
        permissions: &[Permission],
    ) -> PluginResult<Vec<SecurityIssue>> {
        let mut issues = Vec::new();

        for permission in permissions {
            match permission {
                Permission::FileSystemWrite { paths } => {
                    for path in paths {
                        if path.contains("..") || path.starts_with("/etc") || path.starts_with("/sys") {
                            issues.push(SecurityIssue {
                                id: "PERM001".to_string(),
                                issue_type: "DangerousFileAccess".to_string(),
                                severity: SecuritySeverity::High,
                                description: format!("Dangerous file system write access requested: {}", path),
                                location: "permissions".to_string(),
                                fix_recommendation: Some("Restrict file system access to safe directories".to_string()),
                                details: HashMap::new(),
                            });
                        }
                    }
                }
                Permission::ProcessExecution => {
                    if self.config.strict_mode {
                        issues.push(SecurityIssue {
                            id: "PERM002".to_string(),
                            issue_type: "ProcessExecution".to_string(),
                            severity: SecuritySeverity::High,
                            description: "Plugin requests process execution permission".to_string(),
                            location: "permissions".to_string(),
                            fix_recommendation: Some("Consider removing process execution if not required".to_string()),
                            details: HashMap::new(),
                        });
                    }
                }
                Permission::Network { hosts } => {
                    for host in hosts {
                        if host == "*" || host.starts_with("localhost") {
                            issues.push(SecurityIssue {
                                id: "PERM003".to_string(),
                                issue_type: "BroadNetworkAccess".to_string(),
                                severity: SecuritySeverity::Medium,
                                description: format!("Broad network access requested: {}", host),
                                location: "permissions".to_string(),
                                fix_recommendation: Some("Restrict network access to specific required hosts".to_string()),
                                details: HashMap::new(),
                            });
                        }
                    }
                }
                _ => {}
            }
        }

        Ok(issues)
    }

    /// Check policy compliance
    async fn check_policy_compliance(
        &self,
        metadata: &PluginMetadata,
        policy: &SecurityPolicy,
    ) -> PluginResult<Vec<SecurityIssue>> {
        let mut issues = Vec::new();

        // Check plugin-specific rules
        if let Some(plugin_rule) = policy.plugin_rules.get(&metadata.id) {
            // Check if plugin has permissions that are explicitly denied
            for denied_permission in &plugin_rule.denied_permissions {
                if metadata.permissions.iter().any(|p| std::mem::discriminant(p) == std::mem::discriminant(denied_permission)) {
                    issues.push(SecurityIssue {
                        id: "POL001".to_string(),
                        issue_type: "DeniedPermission".to_string(),
                        severity: SecuritySeverity::High,
                        description: "Plugin requests permission that is denied by policy".to_string(),
                        location: "permissions".to_string(),
                        fix_recommendation: Some("Remove or modify the denied permission".to_string()),
                        details: HashMap::new(),
                    });
                }
            }
        }

        // Check content filter rules
        for content_rule in &policy.content_filter_rules {
            // TODO: Apply content filtering rules
            debug!("Checking content filter rule: {}", content_rule.name);
        }

        Ok(issues)
    }

    /// Generate security recommendations
    fn generate_security_recommendations(&self, issues: &[SecurityIssue]) -> Vec<String> {
        let mut recommendations = Vec::new();

        let critical_issues = issues.iter().filter(|i| i.severity == SecuritySeverity::Critical).count();
        let high_issues = issues.iter().filter(|i| i.severity == SecuritySeverity::High).count();

        if critical_issues > 0 {
            recommendations.push(format!("Address {} critical security issues before loading plugin", critical_issues));
        }

        if high_issues > 0 {
            recommendations.push(format!("Review and address {} high-severity security issues", high_issues));
        }

        if issues.iter().any(|i| i.issue_type == "SignatureVerification") {
            recommendations.push("Ensure plugin is properly signed by a trusted authority".to_string());
        }

        if issues.iter().any(|i| i.issue_type == "DangerousFileAccess") {
            recommendations.push("Restrict file system access to safe directories only".to_string());
        }

        if issues.iter().any(|i| i.issue_type == "ProcessExecution") {
            recommendations.push("Consider sandboxing or removing process execution permissions".to_string());
        }

        if recommendations.is_empty() {
            recommendations.push("Plugin passed security validation - no issues found".to_string());
        }

        recommendations
    }

    /// Check if plugin execution is authorized
    pub async fn authorize_plugin_execution(
        &self,
        plugin_id: &str,
        operation: &str,
        context: &PluginContext,
    ) -> PluginResult<bool> {
        // Check if plugin is blocked
        if self.blocked_plugins.read().contains(plugin_id) {
            self.log_audit_event(
                plugin_id,
                SecurityEventType::PolicyViolation,
                format!("Attempted execution of blocked plugin: {}", plugin_id),
                SecurityAction::Deny,
                SecuritySeverity::High,
            ).await;
            return Ok(false);
        }

        // Validate permissions for the operation
        if !self.validate_operation_permissions(plugin_id, operation, context).await? {
            self.log_audit_event(
                plugin_id,
                SecurityEventType::PermissionViolation,
                format!("Permission denied for operation: {}", operation),
                SecurityAction::Deny,
                SecuritySeverity::Medium,
            ).await;
            return Ok(false);
        }

        // Check resource limits
        if !self.check_resource_limits(plugin_id, context).await? {
            self.log_audit_event(
                plugin_id,
                SecurityEventType::ResourceLimitExceeded,
                "Resource limit exceeded during authorization check".to_string(),
                SecurityAction::Deny,
                SecuritySeverity::Medium,
            ).await;
            return Ok(false);
        }

        Ok(true)
    }

    /// Validate operation permissions
    async fn validate_operation_permissions(
        &self,
        plugin_id: &str,
        operation: &str,
        context: &PluginContext,
    ) -> PluginResult<bool> {
        // Basic permission validation - in practice, this would be more sophisticated
        for permission in &context.permissions {
            match permission {
                Permission::FileSystemRead { paths } => {
                    if operation.contains("read_file") {
                        // Check if requested path is allowed
                        // TODO: Implement path validation
                        return Ok(true);
                    }
                }
                Permission::FileSystemWrite { paths } => {
                    if operation.contains("write_file") {
                        // Check if requested path is allowed
                        // TODO: Implement path validation
                        return Ok(true);
                    }
                }
                Permission::Network { hosts } => {
                    if operation.contains("network") {
                        // Check if requested host is allowed
                        // TODO: Implement host validation
                        return Ok(true);
                    }
                }
                _ => {}
            }
        }

        // Default to allow if no specific restrictions
        Ok(true)
    }

    /// Check resource limits
    async fn check_resource_limits(
        &self,
        plugin_id: &str,
        context: &PluginContext,
    ) -> PluginResult<bool> {
        let limits = &context.resource_limits;

        // Check memory limit (simplified check)
        if limits.max_memory_bytes > 0 && limits.max_memory_bytes > 1024 * 1024 * 1024 {
            warn!("Plugin {} requests high memory limit: {} bytes", plugin_id, limits.max_memory_bytes);
        }

        // Check CPU time limit
        if limits.max_cpu_time_ms > 0 && limits.max_cpu_time_ms > 60_000 {
            warn!("Plugin {} requests high CPU time limit: {} ms", plugin_id, limits.max_cpu_time_ms);
        }

        // In practice, you'd check against current resource usage
        Ok(true)
    }

    /// Log security audit event
    async fn log_audit_event(
        &self,
        plugin_id: &str,
        event_type: SecurityEventType,
        details: String,
        action: SecurityAction,
        severity: SecuritySeverity,
    ) {
        if !self.config.audit_logging {
            return;
        }

        let event = SecurityAuditEvent {
            id: Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            plugin_id: plugin_id.to_string(),
            event_type,
            details,
            action,
            metadata: HashMap::new(),
            severity,
        };

        self.audit_events.write().push(event);

        // Maintain audit log size (keep last 10000 events)
        let mut events = self.audit_events.write();
        while events.len() > 10000 {
            events.remove(0);
        }
    }

    /// Get recent audit events
    pub fn get_audit_events(&self, limit: Option<usize>) -> Vec<SecurityAuditEvent> {
        let events = self.audit_events.read();
        let limit = limit.unwrap_or(100);
        events.iter().rev().take(limit).cloned().collect()
    }

    /// Add trusted signature
    pub fn add_trusted_signature(&self, signature: String) {
        self.trusted_signatures.write().insert(signature);
    }

    /// Block plugin
    pub fn block_plugin(&self, plugin_id: String) {
        self.blocked_plugins.write().insert(plugin_id);
    }

    /// Unblock plugin
    pub fn unblock_plugin(&self, plugin_id: &str) {
        self.blocked_plugins.write().remove(plugin_id);
    }

    /// Get security statistics
    pub fn get_security_stats(&self) -> HashMap<String, serde_json::Value> {
        let mut stats = HashMap::new();

        let events = self.audit_events.read();
        let total_events = events.len();
        let critical_events = events.iter().filter(|e| e.severity == SecuritySeverity::Critical).count();
        let high_events = events.iter().filter(|e| e.severity == SecuritySeverity::High).count();

        stats.insert("total_audit_events".to_string(), serde_json::json!(total_events));
        stats.insert("critical_events".to_string(), serde_json::json!(critical_events));
        stats.insert("high_severity_events".to_string(), serde_json::json!(high_events));
        stats.insert("blocked_plugins_count".to_string(), serde_json::json!(self.blocked_plugins.read().len()));
        stats.insert("trusted_signatures_count".to_string(), serde_json::json!(self.trusted_signatures.read().len()));
        stats.insert("strict_mode_enabled".to_string(), serde_json::json!(self.config.strict_mode));
        stats.insert("signature_verification_required".to_string(), serde_json::json!(self.config.require_signatures));

        stats
    }
}

/// Default content scanner implementation
pub struct DefaultContentScanner {
    name: String,
    dangerous_patterns: Vec<regex::Regex>,
}

impl DefaultContentScanner {
    pub fn new() -> Self {
        let dangerous_patterns = vec![
            // System calls that might be dangerous
            regex::Regex::new(r"(?i)(system|exec|eval|shell_exec|popen)").unwrap(),
            // File operations that might be dangerous
            regex::Regex::new(r"(?i)(unlink|rmdir|remove|delete)").unwrap(),
            // Network operations
            regex::Regex::new(r"(?i)(curl|wget|http_get|urllib|requests)").unwrap(),
            // Potential malicious URLs or IPs
            regex::Regex::new(r"(?i)(malware|virus|trojan|backdoor)").unwrap(),
        ];

        Self {
            name: "DefaultContentScanner".to_string(),
            dangerous_patterns,
        }
    }
}

#[async_trait]
impl ContentScanner for DefaultContentScanner {
    async fn scan_plugin(&self, plugin_path: &Path) -> PluginResult<Vec<SecurityIssue>> {
        let mut issues = Vec::new();

        if plugin_path.is_file() {
            let file_issues = self.scan_file(plugin_path).await?;
            issues.extend(file_issues);
        } else if plugin_path.is_dir() {
            let mut entries = fs::read_dir(plugin_path).await?;
            while let Some(entry) = entries.next_entry().await? {
                let path = entry.path();
                if path.is_file() {
                    let file_issues = self.scan_file(&path).await?;
                    issues.extend(file_issues);
                }
            }
        }

        Ok(issues)
    }

    async fn scan_file(&self, file_path: &Path) -> PluginResult<Vec<SecurityIssue>> {
        let mut issues = Vec::new();

        // Only scan text files
        if let Some(extension) = file_path.extension() {
            let ext = extension.to_string_lossy().to_lowercase();
            if !matches!(ext.as_str(), "rs" | "js" | "ts" | "py" | "go" | "java" | "cpp" | "c" | "h") {
                return Ok(issues);
            }
        }

        let content = match fs::read_to_string(file_path).await {
            Ok(content) => content,
            Err(_) => return Ok(issues), // Skip binary files
        };

        for (line_num, line) in content.lines().enumerate() {
            for pattern in &self.dangerous_patterns {
                if pattern.is_match(line) {
                    issues.push(SecurityIssue {
                        id: format!("SCAN{:03}", line_num + 1),
                        issue_type: "SuspiciousContent".to_string(),
                        severity: SecuritySeverity::Medium,
                        description: format!("Potentially dangerous pattern found: {}", pattern.as_str()),
                        location: format!("{}:{}", file_path.display(), line_num + 1),
                        fix_recommendation: Some("Review the flagged code for security implications".to_string()),
                        details: {
                            let mut details = HashMap::new();
                            details.insert("line".to_string(), serde_json::json!(line));
                            details
                        },
                    });
                }
            }
        }

        Ok(issues)
    }

    fn name(&self) -> &str {
        &self.name
    }
}