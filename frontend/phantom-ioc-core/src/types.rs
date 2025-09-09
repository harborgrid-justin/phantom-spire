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

/// IOC context information
#[derive(Debug, Clone, Serialize, Deserialize)]
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
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionResult {
    pub matched_rules: Vec<String>,
    pub detection_methods: Vec<String>,
    pub false_positive_probability: f64,
    pub detection_confidence: f64,
}

/// Intelligence data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Intelligence {
    pub sources: Vec<String>,
    pub confidence: f64,
    pub last_updated: DateTime<Utc>,
    pub related_threats: Vec<String>,
}

/// Correlation between IOCs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Correlation {
    pub id: Uuid,
    pub correlated_iocs: Vec<Uuid>,
    pub correlation_type: String,
    pub strength: f64,
    pub evidence: Vec<String>,
    pub timestamp: DateTime<Utc>,
}

/// Analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub threat_actors: Vec<String>,
    pub campaigns: Vec<String>,
    pub malware_families: Vec<String>,
    pub attack_vectors: Vec<String>,
    pub impact_assessment: ImpactAssessment,
    pub recommendations: Vec<String>,
}

/// Impact assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactAssessment {
    pub business_impact: f64,
    pub technical_impact: f64,
    pub operational_impact: f64,
    pub overall_risk: f64,
}

/// IOC processing result
#[derive(Debug, Clone, Serialize, Deserialize)]
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
