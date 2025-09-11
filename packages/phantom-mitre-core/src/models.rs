//! Phantom MITRE Core - Data Models and Types
//! 
//! This module contains all the data models and type definitions for MITRE ATT&CK framework integration.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

/// MITRE ATT&CK Tactic categories
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum MitreTactic {
    Reconnaissance,
    ResourceDevelopment,
    InitialAccess,
    Execution,
    Persistence,
    PrivilegeEscalation,
    DefenseEvasion,
    CredentialAccess,
    Discovery,
    LateralMovement,
    Collection,
    CommandAndControl,
    Exfiltration,
    Impact,
}

/// MITRE ATT&CK Platform types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum MitrePlatform {
    Windows,
    MacOS,
    Linux,
    Cloud,
    Network,
    Mobile,
    ICS,
    Office365,
    Azure,
    AWS,
    GCP,
    SaaS,
    PRE,
}

/// Data source types for detection
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DataSource {
    ProcessMonitoring,
    FileMonitoring,
    NetworkTraffic,
    WindowsEventLogs,
    Authentication,
    CommandLineInterface,
    PowerShell,
    Registry,
    Services,
    WMI,
    DNS,
    WebProxy,
    Email,
    CloudLogs,
    API,
}

/// Detection difficulty levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DetectionDifficulty {
    Easy,
    Medium,
    Hard,
    VeryHard,
}

/// Types of detection rules
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DetectionRuleType {
    Sigma,
    Yara,
    Snort,
    Suricata,
    Splunk,
    ElasticSearch,
    KQL,
    Custom,
}

/// Severity levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Severity {
    Low,
    Medium,
    High,
    Critical,
}

/// Software types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum SoftwareType {
    Malware,
    Tool,
}

/// Implementation difficulty levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ImplementationDifficulty {
    Low,
    Medium,
    High,
    VeryHigh,
}

/// Cost estimation categories
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CostEstimate {
    Free,
    Low,
    Medium,
    High,
    VeryHigh,
}

/// Types of detection gaps
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum GapType {
    NoDetection,
    LowCoverage,
    HighFalsePositives,
    DelayedDetection,
    InsufficientContext,
}

/// Activity levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ActivityLevel {
    Low,
    Medium,
    High,
    VeryHigh,
}

/// Detection rule for techniques
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionRule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub rule_type: DetectionRuleType,
    pub severity: Severity,
    pub confidence: f64,
    pub data_source: DataSource,
    pub query: String,
    pub false_positive_rate: f64,
    pub coverage_percentage: f64,
    pub created: DateTime<Utc>,
    pub updated: DateTime<Utc>,
    pub author: String,
    pub references: Vec<String>,
}

/// MITRE ATT&CK Technique representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MitreTechnique {
    pub id: String,
    pub name: String,
    pub description: String,
    pub tactic: MitreTactic,
    pub platforms: Vec<MitrePlatform>,
    pub data_sources: Vec<DataSource>,
    pub detection_difficulty: DetectionDifficulty,
    pub sub_techniques: Vec<String>,
    pub mitigations: Vec<String>,
    pub detection_rules: Vec<DetectionRule>,
    pub kill_chain_phases: Vec<String>,
    pub permissions_required: Vec<String>,
    pub effective_permissions: Vec<String>,
    pub system_requirements: Vec<String>,
    pub network_requirements: Vec<String>,
    pub remote_support: bool,
    pub impact_type: Vec<String>,
    pub created: DateTime<Utc>,
    pub modified: DateTime<Utc>,
    pub version: String,
    pub revoked: bool,
    pub deprecated: bool,
}

/// Sub-technique details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubTechnique {
    pub id: String,
    pub name: String,
    pub description: String,
    pub parent_technique: String,
    pub platforms: Vec<MitrePlatform>,
    pub data_sources: Vec<DataSource>,
    pub detection_difficulty: DetectionDifficulty,
    pub detection_rules: Vec<DetectionRule>,
    pub mitigations: Vec<String>,
}

/// MITRE ATT&CK Group (threat actor group)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MitreGroup {
    pub id: String,
    pub name: String,
    pub aliases: Vec<String>,
    pub description: String,
    pub techniques_used: Vec<String>,
    pub software_used: Vec<String>,
    pub associated_campaigns: Vec<String>,
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
    pub origin_country: Option<String>,
    pub motivation: Vec<String>,
    pub sophistication_level: String,
    pub targets: Vec<String>,
    pub references: Vec<String>,
}

/// MITRE ATT&CK Software (malware/tools)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MitreSoftware {
    pub id: String,
    pub name: String,
    pub aliases: Vec<String>,
    pub description: String,
    pub software_type: SoftwareType,
    pub platforms: Vec<MitrePlatform>,
    pub techniques_used: Vec<String>,
    pub groups_using: Vec<String>,
    pub kill_chain_phases: Vec<String>,
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
    pub references: Vec<String>,
}

/// Mitigation strategy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Mitigation {
    pub id: String,
    pub name: String,
    pub description: String,
    pub techniques_mitigated: Vec<String>,
    pub implementation_difficulty: ImplementationDifficulty,
    pub effectiveness: f64,
    pub cost_estimate: CostEstimate,
    pub deployment_time: String,
    pub prerequisites: Vec<String>,
    pub side_effects: Vec<String>,
    pub references: Vec<String>,
}

/// Threat analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatAnalysis {
    pub analysis_id: String,
    pub timestamp: DateTime<Utc>,
    pub techniques_identified: Vec<TechniqueMatch>,
    pub tactics_coverage: HashMap<MitreTactic, f64>,
    pub attack_path: Vec<AttackPathStep>,
    pub risk_score: f64,
    pub confidence_score: f64,
    pub recommended_mitigations: Vec<String>,
    pub detection_gaps: Vec<DetectionGap>,
    pub threat_landscape: ThreatLandscape,
}

/// Technique match in analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechniqueMatch {
    pub technique_id: String,
    pub technique_name: String,
    pub confidence: f64,
    pub evidence: Vec<String>,
    pub indicators: Vec<String>,
    pub sub_techniques: Vec<String>,
    pub platforms_affected: Vec<MitrePlatform>,
    pub data_sources_triggered: Vec<DataSource>,
}

/// Attack path step
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackPathStep {
    pub step_number: u32,
    pub tactic: MitreTactic,
    pub technique_id: String,
    pub technique_name: String,
    pub description: String,
    pub prerequisites: Vec<String>,
    pub outcomes: Vec<String>,
    pub detection_opportunities: Vec<String>,
    pub mitigation_opportunities: Vec<String>,
}

/// Detection gap analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionGap {
    pub technique_id: String,
    pub technique_name: String,
    pub gap_type: GapType,
    pub severity: Severity,
    pub description: String,
    pub recommended_actions: Vec<String>,
    pub data_sources_needed: Vec<DataSource>,
    pub estimated_coverage_improvement: f64,
}

/// Threat landscape overview
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatLandscape {
    pub most_common_tactics: Vec<(MitreTactic, u32)>,
    pub most_common_techniques: Vec<(String, u32)>,
    pub trending_techniques: Vec<String>,
    pub platform_distribution: HashMap<MitrePlatform, u32>,
    pub group_activity: Vec<GroupActivity>,
    pub emerging_threats: Vec<EmergingThreat>,
}

/// Group activity summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GroupActivity {
    pub group_id: String,
    pub group_name: String,
    pub activity_level: ActivityLevel,
    pub recent_techniques: Vec<String>,
    pub target_sectors: Vec<String>,
    pub geographic_focus: Vec<String>,
}

/// Emerging threat information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmergingThreat {
    pub threat_id: String,
    pub name: String,
    pub description: String,
    pub techniques_involved: Vec<String>,
    pub first_observed: DateTime<Utc>,
    pub confidence: f64,
    pub potential_impact: Severity,
    pub affected_platforms: Vec<MitrePlatform>,
    pub indicators: Vec<String>,
}

/// MITRE ATT&CK Navigator layer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigatorLayer {
    pub name: String,
    pub description: String,
    pub domain: String,
    pub version: String,
    pub techniques: Vec<NavigatorTechnique>,
    pub gradient: NavigatorGradient,
    pub filters: NavigatorFilters,
    pub sorting: u32,
    pub layout: NavigatorLayout,
    pub hide_disabled: bool,
    pub metadata: Vec<NavigatorMetadata>,
}

/// Navigator technique representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigatorTechnique {
    pub technique_id: String,
    pub tactic: String,
    pub color: String,
    pub comment: String,
    pub enabled: bool,
    pub metadata: Vec<NavigatorMetadata>,
    pub links: Vec<NavigatorLink>,
    pub show_subtechniques: bool,
}

/// Navigator gradient configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigatorGradient {
    pub colors: Vec<String>,
    pub min_value: f64,
    pub max_value: f64,
}

/// Navigator filters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigatorFilters {
    pub platforms: Vec<String>,
    pub tactics: Vec<String>,
    pub data_sources: Vec<String>,
    pub stages: Vec<String>,
}

/// Navigator layout configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigatorLayout {
    pub layout: String,
    pub aggregate_function: String,
    pub show_aggregate_scores: bool,
    pub count_unscored: bool,
}

/// Navigator metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigatorMetadata {
    pub name: String,
    pub value: String,
}

/// Navigator link
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigatorLink {
    pub label: String,
    pub url: String,
}

/// Search criteria for MITRE data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MitreSearchCriteria {
    pub query: Option<String>,
    pub tactics: Option<Vec<MitreTactic>>,
    pub platforms: Option<Vec<MitrePlatform>>,
    pub data_sources: Option<Vec<DataSource>>,
    pub groups: Option<Vec<String>>,
    pub software: Option<Vec<String>>,
    pub detection_difficulty: Option<DetectionDifficulty>,
    pub date_range: Option<(DateTime<Utc>, DateTime<Utc>)>,
    pub limit: Option<usize>,
}