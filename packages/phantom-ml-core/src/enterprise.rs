use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use uuid::Uuid;

/// Enterprise security and compliance features
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnterpriseSecurityConfig {
    pub multi_tenant: MultiTenantConfig,
    pub authentication: AuthenticationConfig,
    pub authorization: AuthorizationConfig,
    pub audit_logging: AuditLoggingConfig,
    pub encryption: EncryptionConfig,
    pub compliance: ComplianceConfig,
    pub data_governance: DataGovernanceConfig,
}

/// Multi-tenant architecture support
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultiTenantConfig {
    pub isolation_level: IsolationLevel,
    pub tenant_limits: TenantLimits,
    pub resource_quotas: ResourceQuotas,
    pub cross_tenant_policies: CrossTenantPolicies,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IsolationLevel {
    /// Complete database separation per tenant
    DatabasePerTenant,
    /// Schema separation within shared database
    SchemaPerTenant,
    /// Row-level security with shared schema
    RowLevelSecurity,
    /// Application-level tenant filtering
    ApplicationLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantLimits {
    pub max_models: u32,
    pub max_data_size_gb: u64,
    pub max_requests_per_minute: u32,
    pub max_concurrent_training: u32,
    pub max_storage_days: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceQuotas {
    pub cpu_cores: f64,
    pub memory_gb: f64,
    pub gpu_hours_per_month: f64,
    pub storage_gb: f64,
    pub network_bandwidth_mbps: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrossTenantPolicies {
    pub allow_data_sharing: bool,
    pub allow_model_sharing: bool,
    pub require_encryption: bool,
    pub audit_cross_tenant_access: bool,
}

/// Authentication configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthenticationConfig {
    pub providers: Vec<AuthProvider>,
    pub session_config: SessionConfig,
    pub mfa_config: MFAConfig,
    pub password_policy: PasswordPolicy,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuthProvider {
    LDAP { server_url: String, base_dn: String },
    ActiveDirectory { domain: String, server: String },
    SAML { idp_url: String, entity_id: String },
    OAuth2 { provider: String, client_id: String },
    OIDC { issuer: String, client_id: String },
    Local,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionConfig {
    pub timeout_minutes: u32,
    pub max_concurrent_sessions: u32,
    pub require_secure_cookies: bool,
    pub session_rotation_minutes: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MFAConfig {
    pub enabled: bool,
    pub methods: Vec<MFAMethod>,
    pub grace_period_hours: u32,
    pub backup_codes: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MFAMethod {
    TOTP,
    SMS,
    Email,
    Hardware,
    Biometric,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasswordPolicy {
    pub min_length: u32,
    pub require_uppercase: bool,
    pub require_lowercase: bool,
    pub require_numbers: bool,
    pub require_symbols: bool,
    pub max_age_days: u32,
    pub history_count: u32,
}

/// Role-based access control
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthorizationConfig {
    pub rbac: RBACConfig,
    pub abac: Option<ABACConfig>,
    pub api_security: APISecurityConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RBACConfig {
    pub roles: Vec<Role>,
    pub permissions: Vec<Permission>,
    pub inheritance_enabled: bool,
    pub dynamic_roles: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Role {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub permissions: Vec<String>,
    pub parent_roles: Vec<String>,
    pub tenant_specific: bool,
    pub created_at: DateTime<Utc>,
    pub created_by: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Permission {
    pub id: String,
    pub resource: String,
    pub action: String,
    pub conditions: Option<HashMap<String, serde_json::Value>>,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ABACConfig {
    pub policy_language: PolicyLanguage,
    pub attribute_sources: Vec<AttributeSource>,
    pub policy_evaluation_mode: PolicyEvaluationMode,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PolicyLanguage {
    XACML,
    JSON,
    Rego,
    Cedar,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AttributeSource {
    User,
    Resource,
    Environment,
    External { source: String, endpoint: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PolicyEvaluationMode {
    DenyByDefault,
    PermitByDefault,
    FirstApplicable,
    DenyOverride,
    PermitOverride,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct APISecurityConfig {
    pub rate_limiting: RateLimitingConfig,
    pub api_keys: APIKeyConfig,
    pub cors: CORSConfig,
    pub request_validation: RequestValidationConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitingConfig {
    pub enabled: bool,
    pub global_limit: u32,
    pub per_user_limit: u32,
    pub per_api_limit: HashMap<String, u32>,
    pub burst_allowance: u32,
    pub window_seconds: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct APIKeyConfig {
    pub enabled: bool,
    pub rotation_days: u32,
    pub scoped_permissions: bool,
    pub rate_limiting: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CORSConfig {
    pub allowed_origins: Vec<String>,
    pub allowed_methods: Vec<String>,
    pub allowed_headers: Vec<String>,
    pub max_age_seconds: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestValidationConfig {
    pub schema_validation: bool,
    pub input_sanitization: bool,
    pub sql_injection_protection: bool,
    pub xss_protection: bool,
}

/// Comprehensive audit logging
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLoggingConfig {
    pub enabled: bool,
    pub log_level: AuditLogLevel,
    pub retention_days: u32,
    pub destinations: Vec<AuditDestination>,
    pub events: Vec<AuditEventType>,
    pub pii_handling: PIIHandlingConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditLogLevel {
    Minimal,
    Standard,
    Detailed,
    Comprehensive,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditDestination {
    Database,
    File { path: String },
    Syslog { server: String, port: u16 },
    ElasticSearch { endpoint: String, index: String },
    SIEM { endpoint: String, format: String },
    S3 { bucket: String, prefix: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditEventType {
    Authentication,
    Authorization,
    DataAccess,
    ModelTraining,
    ModelInference,
    Configuration,
    AdminActions,
    DataModification,
    Security,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PIIHandlingConfig {
    pub redaction: bool,
    pub hashing: bool,
    pub encryption: bool,
    pub anonymization: bool,
}

/// Data encryption configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionConfig {
    pub at_rest: EncryptionAtRest,
    pub in_transit: EncryptionInTransit,
    pub in_memory: EncryptionInMemory,
    pub key_management: KeyManagementConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionAtRest {
    pub database: DatabaseEncryption,
    pub file_storage: FileEncryption,
    pub backup: BackupEncryption,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseEncryption {
    pub enabled: bool,
    pub algorithm: EncryptionAlgorithm,
    pub key_rotation_days: u32,
    pub column_level: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEncryption {
    pub enabled: bool,
    pub algorithm: EncryptionAlgorithm,
    pub key_per_file: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupEncryption {
    pub enabled: bool,
    pub algorithm: EncryptionAlgorithm,
    pub compression: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionInTransit {
    pub tls_version: TLSVersion,
    pub cipher_suites: Vec<String>,
    pub certificate_validation: bool,
    pub hsts_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TLSVersion {
    TLS12,
    TLS13,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionInMemory {
    pub enabled: bool,
    pub sensitive_data_only: bool,
    pub key_derivation: KeyDerivationConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyDerivationConfig {
    pub algorithm: String,
    pub iterations: u32,
    pub salt_length: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EncryptionAlgorithm {
    AES256,
    ChaCha20Poly1305,
    AES128GCM,
    AES256GCM,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyManagementConfig {
    pub provider: KeyManagementProvider,
    pub rotation_schedule: KeyRotationSchedule,
    pub backup_strategy: KeyBackupStrategy,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KeyManagementProvider {
    Internal,
    AWSKms { region: String, key_id: String },
    AzureKeyVault { vault_url: String, key_name: String },
    HashiCorpVault { endpoint: String, path: String },
    GoogleCloudKMS { project: String, key_ring: String, key: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyRotationSchedule {
    pub automatic: bool,
    pub frequency_days: u32,
    pub grace_period_days: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KeyBackupStrategy {
    None,
    Encrypted,
    SecretSharing { threshold: u32, shares: u32 },
    HSM,
}

/// Compliance and regulatory support
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceConfig {
    pub frameworks: Vec<ComplianceFramework>,
    pub data_residency: DataResidencyConfig,
    pub privacy: PrivacyConfig,
    pub reporting: ComplianceReportingConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplianceFramework {
    GDPR,
    HIPAA,
    PCI_DSS,
    SOX,
    SOC2,
    ISO27001,
    NIST,
    FedRAMP,
    FIPS140_2,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataResidencyConfig {
    pub enforce_residency: bool,
    pub allowed_regions: Vec<String>,
    pub data_localization: bool,
    pub cross_border_restrictions: HashMap<String, Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacyConfig {
    pub right_to_be_forgotten: bool,
    pub data_portability: bool,
    pub consent_management: ConsentManagementConfig,
    pub anonymization: AnonymizationConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsentManagementConfig {
    pub explicit_consent: bool,
    pub granular_consent: bool,
    pub consent_withdrawal: bool,
    pub consent_audit_trail: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnonymizationConfig {
    pub methods: Vec<AnonymizationMethod>,
    pub k_anonymity: u32,
    pub l_diversity: u32,
    pub differential_privacy: Option<DifferentialPrivacyConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnonymizationMethod {
    Suppression,
    Generalization,
    Perturbation,
    Swapping,
    Synthetic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DifferentialPrivacyConfig {
    pub epsilon: f64,
    pub delta: f64,
    pub sensitivity: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceReportingConfig {
    pub automated_reports: bool,
    pub report_frequency: ReportFrequency,
    pub report_formats: Vec<ReportFormat>,
    pub recipients: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReportFrequency {
    Daily,
    Weekly,
    Monthly,
    Quarterly,
    Annually,
    OnDemand,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReportFormat {
    PDF,
    Excel,
    CSV,
    JSON,
    XML,
}

/// Data governance and lineage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataGovernanceConfig {
    pub data_classification: DataClassificationConfig,
    pub data_lineage: DataLineageConfig,
    pub data_quality: DataQualityConfig,
    pub retention_policies: RetentionPoliciesConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataClassificationConfig {
    pub enabled: bool,
    pub classification_levels: Vec<DataClassificationLevel>,
    pub auto_classification: bool,
    pub manual_override: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataClassificationLevel {
    pub name: String,
    pub level: u32,
    pub description: String,
    pub handling_requirements: Vec<String>,
    pub access_restrictions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataLineageConfig {
    pub enabled: bool,
    pub track_transformations: bool,
    pub track_model_lineage: bool,
    pub visualization: bool,
    pub impact_analysis: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataQualityConfig {
    pub enabled: bool,
    pub quality_rules: Vec<DataQualityRule>,
    pub monitoring: bool,
    pub alerting: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataQualityRule {
    pub name: String,
    pub description: String,
    pub rule_type: DataQualityRuleType,
    pub threshold: f64,
    pub severity: QualitySeverity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataQualityRuleType {
    Completeness,
    Accuracy,
    Consistency,
    Validity,
    Uniqueness,
    Timeliness,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QualitySeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetentionPoliciesConfig {
    pub enabled: bool,
    pub policies: Vec<RetentionPolicy>,
    pub automated_deletion: bool,
    pub legal_hold: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetentionPolicy {
    pub name: String,
    pub data_types: Vec<String>,
    pub retention_period_days: u32,
    pub archive_before_delete: bool,
    pub legal_basis: String,
}

/// High availability and disaster recovery
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HighAvailabilityConfig {
    pub replication: ReplicationConfig,
    pub load_balancing: LoadBalancingConfig,
    pub failover: FailoverConfig,
    pub monitoring: HAMonitoringConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReplicationConfig {
    pub enabled: bool,
    pub replication_factor: u32,
    pub sync_mode: ReplicationSyncMode,
    pub cross_region: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReplicationSyncMode {
    Synchronous,
    Asynchronous,
    SemiSynchronous,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadBalancingConfig {
    pub algorithm: LoadBalancingAlgorithm,
    pub health_checks: bool,
    pub session_affinity: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LoadBalancingAlgorithm {
    RoundRobin,
    LeastConnections,
    WeightedRoundRobin,
    IPHash,
    LeastResponseTime,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FailoverConfig {
    pub automatic: bool,
    pub failover_timeout_seconds: u32,
    pub failback: bool,
    pub split_brain_protection: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HAMonitoringConfig {
    pub health_check_interval_seconds: u32,
    pub failure_threshold: u32,
    pub recovery_threshold: u32,
    pub alerting: bool,
}

/// Enterprise audit log entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLogEntry {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub tenant_id: Option<String>,
    pub user_id: String,
    pub session_id: Option<String>,
    pub event_type: AuditEventType,
    pub resource: String,
    pub action: String,
    pub result: AuditResult,
    pub details: HashMap<String, serde_json::Value>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub risk_score: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditResult {
    Success,
    Failure,
    Partial,
    Blocked,
}

impl EnterpriseSecurityConfig {
    pub fn new() -> Self {
        Self {
            multi_tenant: MultiTenantConfig::default(),
            authentication: AuthenticationConfig::default(),
            authorization: AuthorizationConfig::default(),
            audit_logging: AuditLoggingConfig::default(),
            encryption: EncryptionConfig::default(),
            compliance: ComplianceConfig::default(),
            data_governance: DataGovernanceConfig::default(),
        }
    }
    
    pub fn for_compliance_framework(framework: ComplianceFramework) -> Self {
        let mut config = Self::new();
        
        match framework {
            ComplianceFramework::GDPR => {
                config.privacy.right_to_be_forgotten = true;
                config.privacy.consent_management.explicit_consent = true;
                config.audit_logging.retention_days = 365 * 6; // 6 years
                config.encryption.at_rest.database.enabled = true;
            },
            ComplianceFramework::HIPAA => {
                config.audit_logging.enabled = true;
                config.encryption.at_rest.database.enabled = true;
                config.encryption.in_transit.tls_version = TLSVersion::TLS13;
                config.authentication.mfa_config.enabled = true;
            },
            ComplianceFramework::SOC2 => {
                config.audit_logging.enabled = true;
                config.multi_tenant.isolation_level = IsolationLevel::SchemaPerTenant;
                config.authorization.rbac.inheritance_enabled = true;
            },
            _ => {}
        }
        
        config
    }
}

impl Default for MultiTenantConfig {
    fn default() -> Self {
        Self {
            isolation_level: IsolationLevel::ApplicationLevel,
            tenant_limits: TenantLimits {
                max_models: 100,
                max_data_size_gb: 10,
                max_requests_per_minute: 1000,
                max_concurrent_training: 5,
                max_storage_days: 365,
            },
            resource_quotas: ResourceQuotas {
                cpu_cores: 4.0,
                memory_gb: 16.0,
                gpu_hours_per_month: 100.0,
                storage_gb: 100.0,
                network_bandwidth_mbps: 100.0,
            },
            cross_tenant_policies: CrossTenantPolicies {
                allow_data_sharing: false,
                allow_model_sharing: false,
                require_encryption: true,
                audit_cross_tenant_access: true,
            },
        }
    }
}

impl Default for AuthenticationConfig {
    fn default() -> Self {
        Self {
            providers: vec![AuthProvider::Local],
            session_config: SessionConfig {
                timeout_minutes: 60,
                max_concurrent_sessions: 5,
                require_secure_cookies: true,
                session_rotation_minutes: 30,
            },
            mfa_config: MFAConfig {
                enabled: false,
                methods: vec![MFAMethod::TOTP],
                grace_period_hours: 24,
                backup_codes: true,
            },
            password_policy: PasswordPolicy {
                min_length: 8,
                require_uppercase: true,
                require_lowercase: true,
                require_numbers: true,
                require_symbols: false,
                max_age_days: 90,
                history_count: 5,
            },
        }
    }
}

impl Default for AuthorizationConfig {
    fn default() -> Self {
        Self {
            rbac: RBACConfig {
                roles: vec![],
                permissions: vec![],
                inheritance_enabled: true,
                dynamic_roles: false,
            },
            abac: None,
            api_security: APISecurityConfig {
                rate_limiting: RateLimitingConfig {
                    enabled: true,
                    global_limit: 10000,
                    per_user_limit: 100,
                    per_api_limit: HashMap::new(),
                    burst_allowance: 10,
                    window_seconds: 60,
                },
                api_keys: APIKeyConfig {
                    enabled: true,
                    rotation_days: 90,
                    scoped_permissions: true,
                    rate_limiting: true,
                },
                cors: CORSConfig {
                    allowed_origins: vec!["*".to_string()],
                    allowed_methods: vec!["GET".to_string(), "POST".to_string()],
                    allowed_headers: vec!["Content-Type".to_string(), "Authorization".to_string()],
                    max_age_seconds: 3600,
                },
                request_validation: RequestValidationConfig {
                    schema_validation: true,
                    input_sanitization: true,
                    sql_injection_protection: true,
                    xss_protection: true,
                },
            },
        }
    }
}

impl Default for AuditLoggingConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            log_level: AuditLogLevel::Standard,
            retention_days: 365,
            destinations: vec![AuditDestination::Database],
            events: vec![
                AuditEventType::Authentication,
                AuditEventType::Authorization,
                AuditEventType::DataAccess,
                AuditEventType::Security,
            ],
            pii_handling: PIIHandlingConfig {
                redaction: true,
                hashing: false,
                encryption: true,
                anonymization: false,
            },
        }
    }
}

impl Default for EncryptionConfig {
    fn default() -> Self {
        Self {
            at_rest: EncryptionAtRest {
                database: DatabaseEncryption {
                    enabled: true,
                    algorithm: EncryptionAlgorithm::AES256,
                    key_rotation_days: 90,
                    column_level: false,
                },
                file_storage: FileEncryption {
                    enabled: true,
                    algorithm: EncryptionAlgorithm::AES256,
                    key_per_file: false,
                },
                backup: BackupEncryption {
                    enabled: true,
                    algorithm: EncryptionAlgorithm::AES256,
                    compression: true,
                },
            },
            in_transit: EncryptionInTransit {
                tls_version: TLSVersion::TLS13,
                cipher_suites: vec![],
                certificate_validation: true,
                hsts_enabled: true,
            },
            in_memory: EncryptionInMemory {
                enabled: false,
                sensitive_data_only: true,
                key_derivation: KeyDerivationConfig {
                    algorithm: "PBKDF2".to_string(),
                    iterations: 100000,
                    salt_length: 32,
                },
            },
            key_management: KeyManagementConfig {
                provider: KeyManagementProvider::Internal,
                rotation_schedule: KeyRotationSchedule {
                    automatic: true,
                    frequency_days: 90,
                    grace_period_days: 30,
                },
                backup_strategy: KeyBackupStrategy::Encrypted,
            },
        }
    }
}

impl Default for ComplianceConfig {
    fn default() -> Self {
        Self {
            frameworks: vec![],
            data_residency: DataResidencyConfig {
                enforce_residency: false,
                allowed_regions: vec!["us-east-1".to_string(), "eu-west-1".to_string()],
                data_localization: false,
                cross_border_restrictions: HashMap::new(),
            },
            privacy: PrivacyConfig {
                right_to_be_forgotten: false,
                data_portability: false,
                consent_management: ConsentManagementConfig {
                    explicit_consent: false,
                    granular_consent: false,
                    consent_withdrawal: false,
                    consent_audit_trail: false,
                },
                anonymization: AnonymizationConfig {
                    methods: vec![],
                    k_anonymity: 2,
                    l_diversity: 2,
                    differential_privacy: None,
                },
            },
            reporting: ComplianceReportingConfig {
                automated_reports: false,
                report_frequency: ReportFrequency::Monthly,
                report_formats: vec![ReportFormat::PDF],
                recipients: vec![],
            },
        }
    }
}

impl Default for DataGovernanceConfig {
    fn default() -> Self {
        Self {
            data_classification: DataClassificationConfig {
                enabled: false,
                classification_levels: vec![],
                auto_classification: false,
                manual_override: true,
            },
            data_lineage: DataLineageConfig {
                enabled: false,
                track_transformations: true,
                track_model_lineage: true,
                visualization: false,
                impact_analysis: false,
            },
            data_quality: DataQualityConfig {
                enabled: false,
                quality_rules: vec![],
                monitoring: false,
                alerting: false,
            },
            retention_policies: RetentionPoliciesConfig {
                enabled: false,
                policies: vec![],
                automated_deletion: false,
                legal_hold: false,
            },
        }
    }
}