// phantom-threat-actor-core/src/models.rs
// Data models and structures for threat actor intelligence

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

/// Threat actor profile with comprehensive intelligence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatActor {
    pub id: String,
    pub name: String,
    pub aliases: Vec<String>,
    pub actor_type: ActorType,
    pub sophistication_level: SophisticationLevel,
    pub motivation: Vec<Motivation>,
    pub origin_country: Option<String>,
    pub first_observed: DateTime<Utc>,
    pub last_activity: DateTime<Utc>,
    pub status: ActorStatus,
    pub confidence_score: f64,
    pub attribution_confidence: f64,
    pub capabilities: Vec<Capability>,
    pub infrastructure: Infrastructure,
    pub tactics: Vec<String>,
    pub techniques: Vec<String>,
    pub procedures: Vec<String>,
    pub targets: Vec<Target>,
    pub campaigns: Vec<String>,
    pub associated_malware: Vec<String>,
    pub iocs: Vec<String>,
    pub relationships: Vec<ActorRelationship>,
    pub metadata: HashMap<String, String>,
}

/// Types of threat actors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActorType {
    NationState,
    CyberCriminal,
    Hacktivist,
    Terrorist,
    InsiderThreat,
    ScriptKiddie,
    APT,
    Ransomware,
    Unknown,
}

/// Sophistication levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SophisticationLevel {
    Novice,
    Intermediate,
    Advanced,
    Expert,
    Elite,
}

/// Actor motivations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Motivation {
    Financial,
    Espionage,
    Sabotage,
    Ideology,
    Revenge,
    Fame,
    Challenge,
    Unknown,
}

/// Actor status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActorStatus {
    Active,
    Dormant,
    Disbanded,
    Merged,
    Unknown,
}

/// Actor capabilities
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Capability {
    pub category: String,
    pub description: String,
    pub proficiency: f64,
    pub evidence: Vec<String>,
}

/// Infrastructure information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Infrastructure {
    pub domains: Vec<String>,
    pub ip_addresses: Vec<String>,
    pub hosting_providers: Vec<String>,
    pub registrars: Vec<String>,
    pub certificates: Vec<String>,
    pub infrastructure_type: InfrastructureType,
}

/// Infrastructure types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InfrastructureType {
    Dedicated,
    Shared,
    Compromised,
    Bulletproof,
    CloudBased,
    Unknown,
}

/// Target information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Target {
    pub sector: String,
    pub geography: Vec<String>,
    pub organization_size: OrganizationSize,
    pub targeting_frequency: f64,
}

/// Organization sizes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OrganizationSize {
    Small,
    Medium,
    Large,
    Enterprise,
    Government,
    Unknown,
}

/// Actor relationships
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActorRelationship {
    pub related_actor_id: String,
    pub relationship_type: RelationshipType,
    pub confidence: f64,
    pub evidence: Vec<String>,
}

/// Relationship types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RelationshipType {
    Alias,
    Subgroup,
    Collaboration,
    Competition,
    Successor,
    Predecessor,
    Unknown,
}

/// Campaign information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Campaign {
    pub id: String,
    pub name: String,
    pub actor_id: String,
    pub start_date: DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,
    pub status: CampaignStatus,
    pub objectives: Vec<String>,
    pub targets: Vec<Target>,
    pub ttps: Vec<String>,
    pub malware_families: Vec<String>,
    pub iocs: Vec<String>,
    pub impact_assessment: ImpactAssessment,
}

/// Campaign status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CampaignStatus {
    Active,
    Completed,
    Suspended,
    Failed,
    Unknown,
}

/// Impact assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactAssessment {
    pub financial_impact: Option<f64>,
    pub data_compromised: Option<u64>,
    pub systems_affected: Option<u32>,
    pub downtime_hours: Option<f64>,
    pub reputation_impact: ReputationImpact,
}

/// Reputation impact levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReputationImpact {
    None,
    Low,
    Medium,
    High,
    Severe,
}

/// Attribution analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttributionAnalysis {
    pub primary_attribution: Option<String>,
    pub alternative_attributions: Vec<AttributionCandidate>,
    pub confidence_score: f64,
    pub evidence_summary: Vec<Evidence>,
    pub analysis_timestamp: DateTime<Utc>,
}

/// Attribution candidate
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttributionCandidate {
    pub actor_id: String,
    pub confidence: f64,
    pub supporting_evidence: Vec<Evidence>,
    pub contradicting_evidence: Vec<Evidence>,
}

/// Evidence types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evidence {
    pub evidence_type: EvidenceType,
    pub description: String,
    pub weight: f64,
    pub source: String,
    pub timestamp: DateTime<Utc>,
}

/// Evidence types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum EvidenceType {
    TechnicalIndicator,
    BehavioralPattern,
    InfrastructureOverlap,
    ToolReuse,
    TimingCorrelation,
    LinguisticAnalysis,
    GeopoliticalContext,
    SourceIntelligence,
}

/// Behavioral analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralAnalysis {
    pub actor_id: String,
    pub behavioral_patterns: Vec<BehavioralPattern>,
    pub operational_patterns: Vec<OperationalPattern>,
    pub evolution_analysis: EvolutionAnalysis,
    pub predictive_indicators: Vec<PredictiveIndicator>,
}

/// Behavioral patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralPattern {
    pub pattern_type: String,
    pub description: String,
    pub frequency: f64,
    pub consistency: f64,
    pub examples: Vec<String>,
}

/// Operational patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OperationalPattern {
    pub phase: String,
    pub typical_duration: Option<u32>,
    pub common_techniques: Vec<String>,
    pub success_rate: f64,
}

/// Evolution analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionAnalysis {
    pub capability_progression: Vec<CapabilityChange>,
    pub tactic_evolution: Vec<TacticChange>,
    pub infrastructure_evolution: Vec<InfrastructureChange>,
    pub target_evolution: Vec<TargetChange>,
}

/// Capability changes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapabilityChange {
    pub capability: String,
    pub change_type: ChangeType,
    pub timestamp: DateTime<Utc>,
    pub impact: f64,
}

/// Change types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChangeType {
    Acquired,
    Improved,
    Abandoned,
    Modified,
}

/// Tactic changes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TacticChange {
    pub tactic: String,
    pub change_description: String,
    pub timestamp: DateTime<Utc>,
}

/// Infrastructure changes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InfrastructureChange {
    pub infrastructure_element: String,
    pub change_type: ChangeType,
    pub timestamp: DateTime<Utc>,
}

/// Target changes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TargetChange {
    pub target_sector: String,
    pub change_type: ChangeType,
    pub timestamp: DateTime<Utc>,
}

/// Predictive indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictiveIndicator {
    pub indicator_type: String,
    pub description: String,
    pub probability: f64,
    pub timeframe: String,
}

/// Threat actor error types
#[derive(Debug, thiserror::Error)]
pub enum ThreatActorError {
    #[error("Analysis error: {0}")]
    Analysis(String),
    #[error("Attribution error: {0}")]
    Attribution(String),
    #[error("Data error: {0}")]
    Data(String),
    #[error("Network error: {0}")]
    Network(String),
    #[error("Storage error: {0}")]
    Storage(String),
    #[error("Configuration error: {0}")]
    Configuration(String),
    #[error("Internal error: {0}")]
    Internal(String),
}

/// Configuration for threat actor analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatActorConfig {
    pub confidence_threshold: f64,
    pub attribution_timeout_seconds: u64,
    pub enable_predictive_analysis: bool,
    pub enable_behavioral_analysis: bool,
    pub max_related_actors: usize,
    pub evidence_weights: HashMap<EvidenceType, f64>,
}

impl Default for ThreatActorConfig {
    fn default() -> Self {
        let mut evidence_weights = HashMap::new();
        evidence_weights.insert(EvidenceType::TechnicalIndicator, 0.8);
        evidence_weights.insert(EvidenceType::BehavioralPattern, 0.9);
        evidence_weights.insert(EvidenceType::InfrastructureOverlap, 0.7);
        evidence_weights.insert(EvidenceType::ToolReuse, 0.6);
        evidence_weights.insert(EvidenceType::TimingCorrelation, 0.5);
        evidence_weights.insert(EvidenceType::LinguisticAnalysis, 0.4);
        evidence_weights.insert(EvidenceType::GeopoliticalContext, 0.3);
        evidence_weights.insert(EvidenceType::SourceIntelligence, 0.9);

        Self {
            confidence_threshold: 0.7,
            attribution_timeout_seconds: 300,
            enable_predictive_analysis: true,
            enable_behavioral_analysis: true,
            max_related_actors: 10,
            evidence_weights,
        }
    }
}

/// Search criteria for threat actors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatActorSearchCriteria {
    pub actor_types: Option<Vec<ActorType>>,
    pub sophistication_levels: Option<Vec<SophisticationLevel>>,
    pub motivations: Option<Vec<Motivation>>,
    pub origin_countries: Option<Vec<String>>,
    pub activity_status: Option<Vec<ActorStatus>>,
    pub confidence_min: Option<f64>,
    pub confidence_max: Option<f64>,
    pub first_observed_after: Option<DateTime<Utc>>,
    pub first_observed_before: Option<DateTime<Utc>>,
    pub last_activity_after: Option<DateTime<Utc>>,
    pub last_activity_before: Option<DateTime<Utc>>,
    pub target_sectors: Option<Vec<String>>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

impl Default for ThreatActorSearchCriteria {
    fn default() -> Self {
        Self {
            actor_types: None,
            sophistication_levels: None,
            motivations: None,
            origin_countries: None,
            activity_status: None,
            confidence_min: None,
            confidence_max: None,
            first_observed_after: None,
            first_observed_before: None,
            last_activity_after: None,
            last_activity_before: None,
            target_sectors: None,
            limit: Some(100),
            offset: None,
        }
    }
}