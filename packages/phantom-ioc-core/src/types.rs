// phantom-ioc-core/src/types.rs
// Core data types and structures for IOC processing

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;

/// IOC (Indicator of Compromise) types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IOCType {
    IPAddress,
    Domain,
    URL,
    Hash,
    Email,
    FilePath,
    RegistryKey,
    Mutex,
    UserAgent,
    Certificate,
    ASN,
    CVE,
    Custom(String),
}

impl std::fmt::Display for IOCType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            IOCType::IPAddress => write!(f, "ip"),
            IOCType::Domain => write!(f, "domain"),
            IOCType::URL => write!(f, "url"),
            IOCType::Hash => write!(f, "hash"),
            IOCType::Email => write!(f, "email"),
            IOCType::FilePath => write!(f, "file"),
            IOCType::RegistryKey => write!(f, "registry"),
            IOCType::Mutex => write!(f, "mutex"),
            IOCType::UserAgent => write!(f, "user_agent"),
            IOCType::Certificate => write!(f, "certificate"),
            IOCType::ASN => write!(f, "asn"),
            IOCType::CVE => write!(f, "cve"),
            IOCType::Custom(s) => write!(f, "custom:{}", s),
        }
    }
}

/// Severity levels for IOCs
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum Severity {
    Low,
    Medium,
    High,
    Critical,
}

/// Health status for system components
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum HealthStatus {
    Healthy,
    Degraded,
    Critical,
    Unknown,
}

/// Main IOC structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IOC {
    pub id: Uuid,
    pub indicator_type: IOCType,
    pub value: String,
    pub confidence: f64,
    pub severity: Severity,
    pub source: String,
    pub timestamp: DateTime<Utc>,
    pub tags: Vec<String>,
    pub context: IOCContext,
    pub raw_data: Option<String>,
}

impl std::fmt::Display for IOC {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}:{}", self.indicator_type, self.value)
    }
}

impl Default for IOC {
    fn default() -> Self {
        Self {
            id: Uuid::new_v4(),
            indicator_type: IOCType::Domain,
            value: String::new(),
            confidence: 0.0,
            severity: Severity::Low,
            source: String::new(),
            timestamp: Utc::now(),
            tags: Vec::new(),
            context: IOCContext::default(),
            raw_data: None,
        }
    }
}

/// IOC context information
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct IOCContext {
    pub geolocation: Option<String>,
    pub asn: Option<String>,
    pub category: Option<String>,
    pub first_seen: Option<DateTime<Utc>>,
    pub last_seen: Option<DateTime<Utc>>,
    pub related_indicators: Vec<String>,
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Detection result
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DetectionResult {
    pub matched_rules: Vec<String>,
    pub detection_methods: Vec<String>,
    pub false_positive_probability: f64,
    pub detection_confidence: f64,
}

/// Intelligence data
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Intelligence {
    pub sources: Vec<String>,
    pub confidence: f64,
    pub last_updated: DateTime<Utc>,
    pub related_threats: Vec<String>,
}

/// Correlation between IOCs
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Correlation {
    pub id: Uuid,
    pub correlated_iocs: Vec<Uuid>,
    pub correlation_type: String,
    pub strength: f64,
    pub evidence: Vec<String>,
    pub timestamp: DateTime<Utc>,
}

/// Analysis result
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AnalysisResult {
    pub threat_actors: Vec<String>,
    pub campaigns: Vec<String>,
    pub malware_families: Vec<String>,
    pub attack_vectors: Vec<String>,
    pub impact_assessment: ImpactAssessment,
    pub recommendations: Vec<String>,
}

/// Impact assessment
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ImpactAssessment {
    pub business_impact: f64,
    pub technical_impact: f64,
    pub operational_impact: f64,
    pub overall_risk: f64,
}

/// IOC processing result
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct IOCResult {
    pub ioc: IOC,
    pub detection_result: DetectionResult,
    pub intelligence: Intelligence,
    pub correlations: Vec<Correlation>,
    pub analysis: AnalysisResult,
    pub processing_timestamp: DateTime<Utc>,
}

/// System health status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemHealth {
    pub status: HealthStatus,
    pub components: HashMap<String, ComponentHealth>,
    pub timestamp: DateTime<Utc>,
    pub version: String,
}

/// Component health status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentHealth {
    pub status: HealthStatus,
    pub message: String,
    pub last_check: DateTime<Utc>,
    pub metrics: HashMap<String, f64>,
}

/// IOC Processor for analysis and processing
#[derive(Debug, Clone)]
pub struct IOCProcessor {
    pub id: String,
    pub name: String,
    pub version: String,
}

impl IOCProcessor {
    pub fn new(name: String) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            name,
            version: "1.0.0".to_string(),
        }
    }
}

/// IOC Context Relationship for linking related indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IOCContextRelationship {
    pub source_ioc: String,
    pub target_ioc: String,
    pub relationship_type: String,
    pub strength: f64,
    pub timestamp: DateTime<Utc>,
}

/// Temporal Context for time-based analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemporalContext {
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
    pub frequency: u32,
    pub time_patterns: Vec<String>,
}

/// Behavioral Context for behavior analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralContext {
    pub behaviors: Vec<String>,
    pub anomaly_score: f64,
    pub baseline_deviation: f64,
    pub patterns: Vec<String>,
}

/// Network Context for network-related indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkContext {
    pub connections: Vec<NetworkConnection>,
    pub protocols: Vec<String>,
    pub geolocation: Option<String>,
    pub asn_info: Option<String>,
}

/// Network Connection details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConnection {
    pub source_ip: String,
    pub dest_ip: String,
    pub port: u16,
    pub protocol: String,
    pub timestamp: DateTime<Utc>,
}

/// Threat Actor Context for attribution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatActorContext {
    pub actors: Vec<String>,
    pub campaigns: Vec<String>,
    pub techniques: Vec<String>,
    pub confidence: f64,
}

/// Enrichment Source for data enrichment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrichmentSource {
    pub name: String,
    pub url: String,
    pub api_key: Option<String>,
    pub priority: u8,
}

/// Enriched IOC with additional data
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EnrichedIOC {
    pub base_ioc: IOC,
    pub enrichment_data: HashMap<String, serde_json::Value>,
    pub sources: Vec<String>,
    pub enrichment_timestamp: DateTime<Utc>,
}

/// Export formats for data export
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ExportFormat {
    Json,
    Csv,
    Xml,
    Stix,
    Misp,
    Yara,
    Sigma,
}

/// Export Template for customizing exports
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportTemplate {
    pub name: String,
    pub format: ExportFormat,
    pub fields: Vec<String>,
    pub filters: HashMap<String, String>,
}

/// Export Record for individual export items
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportRecord {
    pub id: String,
    pub data: HashMap<String, serde_json::Value>,
    pub timestamp: DateTime<Utc>,
}

/// Export Result containing export information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportResult {
    pub export_id: String,
    pub format: ExportFormat,
    pub record_count: usize,
    pub file_path: Option<String>,
    pub timestamp: DateTime<Utc>,
}

/// Priority levels for operations
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum Priority {
    Info,
    Low,
    Medium,
    High,
    Critical,
}

/// Reputation categories for indicators
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ReputationCategory {
    Trusted,
    Good,
    Neutral,
    Suspicious,
    Malicious,
}

/// Alias for IOCType to maintain compatibility
pub type IndicatorType = IOCType;

/// Processing status for operations
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ProcessingStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
    Cancelled,
}

/// Alert status for incidents
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AlertStatus {
    New,
    InProgress,
    Resolved,
    Closed,
    Suppressed,
}

/// Incident status tracking
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IncidentStatus {
    Open,
    InProgress,
    Resolved,
    Closed,
    Escalated,
}

/// Task status for workflow management
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TaskStatus {
    Created,
    Assigned,
    InProgress,
    Completed,
    Cancelled,
}

/// Custom error type for IOC operations
#[derive(Debug, thiserror::Error)]
pub enum IOCError {
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("Processing error: {0}")]
    Processing(String),
    #[error("Network error: {0}")]
    Network(String),
    #[error("Database error: {0}")]
    Database(String),
    #[error("Authentication error: {0}")]
    Authentication(String),
    #[error("Authorization error: {0}")]
    Authorization(String),
    #[error("Configuration error: {0}")]
    Configuration(String),
    #[error("Internal error: {0}")]
    Internal(String),
}
