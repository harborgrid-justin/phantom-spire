use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use napi_derive::napi;

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatIndicator {
    pub id: String,
    pub indicator_type: IndicatorType,
    pub value: String,
    pub confidence: f64,
    pub severity: Severity,
    pub source: String,
    pub timestamp: i64,
    pub tags: Vec<String>,
    pub context: IndicatorContext,
    pub enrichment_data: Option<EnrichmentData>,
}

#[napi]
#[derive(Debug, Serialize, Deserialize)]
pub enum IndicatorType {
    IP,
    Domain,
    Hash,
    URL,
    Email,
    File,
    User,
    Process,
    Registry,
    Network,
}

#[napi]
#[derive(Debug, Serialize, Deserialize)]
pub enum Severity {
    Low,
    Medium,
    High,
    Critical,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndicatorContext {
    pub geolocation: Option<String>,
    pub asn: Option<String>,
    pub category: Option<String>,
    pub first_seen: Option<i64>,
    pub last_seen: Option<i64>,
    pub related_indicators: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrichmentData {
    pub whois: Option<WhoisData>,
    pub reputation: Option<ReputationData>,
    pub malware_analysis: Option<MalwareAnalysis>,
    pub threat_intel: Option<ThreatIntelData>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhoisData {
    pub registrar: Option<String>,
    pub creation_date: Option<i64>,
    pub expiration_date: Option<i64>,
    pub registrant: Option<String>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReputationData {
    pub score: f64,
    pub sources: Vec<String>,
    pub categories: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MalwareAnalysis {
    pub signatures: Vec<String>,
    pub behaviors: Vec<String>,
    pub c2_servers: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatIntelData {
    pub campaigns: Vec<String>,
    pub actors: Vec<String>,
    pub mitre_tactics: Vec<String>,
    pub mitre_techniques: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionRule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub enabled: bool,
    pub priority: u32,
    pub conditions: Vec<RuleCondition>,
    pub actions: Vec<RuleAction>,
    pub metadata: RuleMetadata,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleCondition {
    pub field: String,
    pub operator: ConditionOperator,
    pub value: serde_json::Value,
    pub weight: f64,
}

#[napi]
#[derive(Debug, Serialize, Deserialize)]
pub enum ConditionOperator {
    Equals,
    Contains,
    Regex,
    Greater,
    Less,
    In,
    NotIn,
    Exists,
    NotExists,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleAction {
    pub action_type: ActionType,
    pub parameters: HashMap<String, serde_json::Value>,
    pub target: String,
}

#[napi]
#[derive(Debug, Serialize, Deserialize)]
pub enum ActionType {
    Alert,
    Block,
    Quarantine,
    Notify,
    Escalate,
    Enrich,
    Isolate,
    Remediate,
    Log,
    Custom,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleMetadata {
    pub author: String,
    pub created: i64,
    pub modified: i64,
    pub tags: Vec<String>,
    pub mitre_tactics: Vec<String>,
    pub mitre_techniques: Vec<String>,
    pub references: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityEvent {
    pub id: String,
    pub event_type: String,
    pub timestamp: i64,
    pub source: String,
    pub severity: Severity,
    pub data: HashMap<String, serde_json::Value>,
    pub raw_data: Option<String>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Activity {
    pub id: String,
    pub entity_id: String,
    pub entity_type: EntityType,
    pub activity_type: String,
    pub timestamp: i64,
    pub details: HashMap<String, serde_json::Value>,
    pub risk_score: f64,
    pub location: Option<Location>,
    pub device_info: Option<DeviceInfo>,
}

#[napi]
#[derive(Debug, Serialize, Deserialize)]
pub enum EntityType {
    User,
    Device,
    Process,
    Network,
    Application,
    File,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub ip: Option<String>,
    pub country: Option<String>,
    pub city: Option<String>,
    pub coordinates: Option<String>, // Serialized as "lat,lng" for NAPI compatibility
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub hostname: Option<String>,
    pub os: Option<String>,
    pub os_version: Option<String>,
    pub user_agent: Option<String>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralProfile {
    pub entity_id: String,
    pub entity_type: EntityType,
    pub baseline_patterns: Vec<Pattern>,
    pub anomalies: Vec<Anomaly>,
    pub risk_score: f64,
    pub last_updated: i64,
    pub confidence: f64,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pattern {
    pub id: String,
    pub pattern_type: PatternType,
    pub description: String,
    pub confidence: f64,
    pub data: serde_json::Value,
    pub frequency: u32,
    pub last_observed: i64,
}

#[napi]
#[derive(Debug, Serialize, Deserialize)]
pub enum PatternType {
    Temporal,
    Frequency,
    Sequence,
    Correlation,
    Statistical,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Anomaly {
    pub id: String,
    pub anomaly_type: String,
    pub severity: Severity,
    pub description: String,
    pub timestamp: i64,
    pub indicators: Vec<String>,
    pub confidence: f64,
    pub impact_score: f64,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Correlation {
    pub id: String,
    pub rule_id: String,
    pub events: Vec<String>,
    pub indicators: Vec<String>,
    pub confidence: f64,
    pub severity: Severity,
    pub timestamp: i64,
    pub status: CorrelationStatus,
    pub description: String,
}

#[napi]
#[derive(Debug, Serialize, Deserialize)]
pub enum CorrelationStatus {
    Active,
    Resolved,
    FalsePositive,
    Investigating,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessRequest {
    pub id: String,
    pub user_id: String,
    pub resource: String,
    pub action: String,
    pub context: AccessContext,
    pub timestamp: i64,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessContext {
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub location: Option<Location>,
    pub device_fingerprint: Option<String>,
    pub session_id: Option<String>,
    pub risk_factors: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessDecision {
    pub request_id: String,
    pub decision: Decision,
    pub confidence: f64,
    pub reason: String,
    pub additional_checks: Vec<String>,
    pub timestamp: i64,
}

#[napi]
#[derive(Debug, Serialize, Deserialize)]
pub enum Decision {
    Allow,
    Deny,
    Challenge,
    RequireMFA,
    RequireApproval,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity {
    pub id: String,
    pub entity_type: EntityType,
    pub attributes: HashMap<String, serde_json::Value>,
    pub relationships: Vec<EntityRelationship>,
    pub risk_score: f64,
    pub last_seen: i64,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntityRelationship {
    pub target_id: String,
    pub relationship_type: String,
    pub confidence: f64,
    pub first_seen: i64,
    pub last_seen: i64,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAssessment {
    pub entity_id: String,
    pub overall_risk: f64,
    pub risk_factors: Vec<RiskFactor>,
    pub recommendations: Vec<String>,
    pub confidence: f64,
    pub timestamp: i64,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFactor {
    pub category: String,
    pub score: f64,
    pub description: String,
    pub evidence: Vec<String>,
    pub mitigation_steps: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictionInput {
    pub features: Vec<f64>,
    pub context: HashMap<String, serde_json::Value>,
    pub timestamp: i64,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Prediction {
    pub threat_probability: f64,
    pub confidence: f64,
    pub predicted_category: String,
    pub explanation: String,
    pub recommended_actions: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkTraffic {
    pub id: String,
    pub source_ip: String,
    pub destination_ip: String,
    pub source_port: u16,
    pub destination_port: u16,
    pub protocol: String,
    pub timestamp: i64,
    pub bytes_sent: i64,
    pub bytes_received: i64,
    pub packets_sent: u32,
    pub packets_received: u32,
    pub flags: Vec<String>,
    pub payload: Option<Vec<u8>>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrafficAnalysis {
    pub traffic_id: String,
    pub anomalies: Vec<NetworkAnomaly>,
    pub classification: TrafficClassification,
    pub risk_score: f64,
    pub signatures: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkAnomaly {
    pub anomaly_type: String,
    pub severity: Severity,
    pub description: String,
    pub confidence: f64,
}

#[napi]
#[derive(Debug, Serialize, Deserialize)]
pub enum TrafficClassification {
    Normal,
    Suspicious,
    Malicious,
    Unknown,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseAction {
    pub id: String,
    pub action_type: ActionType,
    pub target: String,
    pub parameters: HashMap<String, serde_json::Value>,
    pub priority: u32,
    pub timeout: Option<i64>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionResult {
    pub action_id: String,
    pub success: bool,
    pub message: String,
    pub details: HashMap<String, serde_json::Value>,
    pub timestamp: i64,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatFeed {
    pub id: String,
    pub name: String,
    pub source: String,
    pub feed_type: FeedType,
    pub format: FeedFormat,
    pub update_frequency: i32, // minutes - changed from u64 to i32 for NAPI compatibility
    pub last_update: i64,
    pub reliability: f64,
    pub indicators: Vec<ThreatIndicator>,
}

#[napi]
#[derive(Debug, Serialize, Deserialize)]
pub enum FeedType {
    Open,
    Commercial,
    Internal,
    Community,
}

#[napi]
#[derive(Debug, Serialize, Deserialize)]
pub enum FeedFormat {
    STIX,
    JSON,
    CSV,
    XML,
    Custom,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineStatus {
    pub detection_engine: ComponentStatus,
    pub zero_trust_engine: ComponentStatus,
    pub threat_intelligence: ComponentStatus,
    pub behavioral_analytics: ComponentStatus,
    pub correlation_engine: ComponentStatus,
    pub response_engine: ComponentStatus,
    pub risk_engine: ComponentStatus,
    pub ml_engine: ComponentStatus,
    pub network_analyzer: ComponentStatus,
    pub last_updated: i64,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentStatus {
    pub status: String,
    pub uptime: i64,
    pub processed_events: i64,
    pub active_alerts: u32,
    pub last_error: Option<String>,
}

#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MLModel {
    pub id: String,
    pub name: String,
    pub model_type: String,
    pub version: String,
    pub accuracy: f64,
    pub features: Vec<String>,
    pub last_trained: i64,
    pub status: String,
}
