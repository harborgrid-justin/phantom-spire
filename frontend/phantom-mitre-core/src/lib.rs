//! Phantom MITRE Core - Advanced MITRE ATT&CK Framework Integration
//! 
//! This library provides comprehensive MITRE ATT&CK framework integration with advanced
//! threat analysis, technique mapping, and tactical intelligence capabilities.

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use indexmap::IndexMap;

// Extended business modules
pub mod modules;

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

/// Software types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum SoftwareType {
    Malware,
    Tool,
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

/// Types of detection gaps
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum GapType {
    NoDetection,
    LowCoverage,
    HighFalsePositives,
    DelayedDetection,
    InsufficientContext,
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

/// Activity levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ActivityLevel {
    Low,
    Medium,
    High,
    VeryHigh,
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

/// Main MITRE Core implementation
pub struct MitreCore {
    techniques: IndexMap<String, MitreTechnique>,
    sub_techniques: IndexMap<String, SubTechnique>,
    groups: IndexMap<String, MitreGroup>,
    software: IndexMap<String, MitreSoftware>,
    mitigations: IndexMap<String, Mitigation>,
    detection_rules: IndexMap<String, DetectionRule>,
}

impl MitreCore {
    /// Create a new MITRE Core instance
    pub fn new() -> Self {
        Self {
            techniques: IndexMap::new(),
            sub_techniques: IndexMap::new(),
            groups: IndexMap::new(),
            software: IndexMap::new(),
            mitigations: IndexMap::new(),
            detection_rules: IndexMap::new(),
        }
    }

    /// Initialize with sample MITRE ATT&CK data
    pub fn initialize_with_sample_data(&mut self) {
        self.load_sample_techniques();
        self.load_sample_groups();
        self.load_sample_software();
        self.load_sample_mitigations();
        self.load_sample_detection_rules();
    }

    /// Analyze threat indicators against MITRE ATT&CK framework
    pub fn analyze_threat(&self, indicators: &[String]) -> ThreatAnalysis {
        let analysis_id = Uuid::new_v4().to_string();
        let timestamp = Utc::now();

        let techniques_identified = self.identify_techniques(indicators);
        let tactics_coverage = self.calculate_tactics_coverage(&techniques_identified);
        let attack_path = self.generate_attack_path(&techniques_identified);
        let risk_score = self.calculate_risk_score(&techniques_identified, &tactics_coverage);
        let confidence_score = self.calculate_confidence_score(&techniques_identified);
        let recommended_mitigations = self.recommend_mitigations(&techniques_identified);
        let detection_gaps = self.identify_detection_gaps(&techniques_identified);
        let threat_landscape = self.analyze_threat_landscape();

        ThreatAnalysis {
            analysis_id,
            timestamp,
            techniques_identified,
            tactics_coverage,
            attack_path,
            risk_score,
            confidence_score,
            recommended_mitigations,
            detection_gaps,
            threat_landscape,
        }
    }

    /// Map techniques to MITRE ATT&CK framework
    pub fn map_techniques(&self, technique_ids: &[String]) -> Vec<MitreTechnique> {
        technique_ids
            .iter()
            .filter_map(|id| self.techniques.get(id).cloned())
            .collect()
    }

    /// Get technique details by ID
    pub fn get_technique(&self, technique_id: &str) -> Option<&MitreTechnique> {
        self.techniques.get(technique_id)
    }

    /// Add a new technique
    pub fn add_technique(&mut self, technique: MitreTechnique) -> String {
        let id = technique.id.clone();
        self.techniques.insert(id.clone(), technique);
        id
    }

    /// Search techniques by criteria
    pub fn search_techniques(&self, criteria: &MitreSearchCriteria) -> Vec<MitreTechnique> {
        self.techniques
            .values()
            .filter(|technique| self.matches_criteria(technique, criteria))
            .cloned()
            .collect()
    }

    /// Get group information
    pub fn get_group(&self, group_id: &str) -> Option<&MitreGroup> {
        self.groups.get(group_id)
    }

    /// Get software information
    pub fn get_software(&self, software_id: &str) -> Option<&MitreSoftware> {
        self.software.get(software_id)
    }

    /// Generate ATT&CK Navigator layer
    pub fn generate_navigator_layer(&self, analysis: &ThreatAnalysis) -> NavigatorLayer {
        let techniques: Vec<NavigatorTechnique> = analysis
            .techniques_identified
            .iter()
            .map(|tm| NavigatorTechnique {
                technique_id: tm.technique_id.clone(),
                tactic: format!("{:?}", self.get_technique_tactic(&tm.technique_id)),
                color: self.get_confidence_color(tm.confidence),
                comment: format!("Confidence: {:.2}", tm.confidence),
                enabled: true,
                metadata: vec![
                    NavigatorMetadata {
                        name: "confidence".to_string(),
                        value: tm.confidence.to_string(),
                    },
                    NavigatorMetadata {
                        name: "evidence_count".to_string(),
                        value: tm.evidence.len().to_string(),
                    },
                ],
                links: vec![],
                show_subtechniques: true,
            })
            .collect();

        NavigatorLayer {
            name: "Threat Analysis Results".to_string(),
            description: format!("Analysis from {}", analysis.timestamp),
            domain: "enterprise-attack".to_string(),
            version: "4.0".to_string(),
            techniques,
            gradient: NavigatorGradient {
                colors: vec!["#ff6666".to_string(), "#ffe766".to_string(), "#8ec843".to_string()],
                min_value: 0.0,
                max_value: 1.0,
            },
            filters: NavigatorFilters {
                platforms: vec!["Windows".to_string(), "Linux".to_string(), "macOS".to_string()],
                tactics: vec![],
                data_sources: vec![],
                stages: vec!["act".to_string()],
            },
            sorting: 0,
            layout: NavigatorLayout {
                layout: "side".to_string(),
                aggregate_function: "average".to_string(),
                show_aggregate_scores: false,
                count_unscored: false,
            },
            hide_disabled: false,
            metadata: vec![
                NavigatorMetadata {
                    name: "analysis_id".to_string(),
                    value: analysis.analysis_id.clone(),
                },
                NavigatorMetadata {
                    name: "risk_score".to_string(),
                    value: analysis.risk_score.to_string(),
                },
            ],
        }
    }

    /// Get detection coverage for techniques
    pub fn get_detection_coverage(&self, technique_ids: &[String]) -> HashMap<String, f64> {
        technique_ids
            .iter()
            .map(|id| {
                let coverage = self
                    .detection_rules
                    .values()
                    .filter(|rule| {
                        self.techniques
                            .get(id)
                            .map_or(false, |tech| tech.detection_rules.iter().any(|dr| dr.id == rule.id))
                    })
                    .map(|rule| rule.coverage_percentage)
                    .fold(0.0f64, |acc, coverage| acc.max(coverage));
                (id.clone(), coverage)
            })
            .collect()
    }

    // Private helper methods

    fn load_sample_techniques(&mut self) {
        let sample_techniques = vec![
            ("T1566.001", "Spearphishing Attachment", MitreTactic::InitialAccess),
            ("T1055", "Process Injection", MitreTactic::DefenseEvasion),
            ("T1071.001", "Application Layer Protocol: Web Protocols", MitreTactic::CommandAndControl),
            ("T1083", "File and Directory Discovery", MitreTactic::Discovery),
            ("T1005", "Data from Local System", MitreTactic::Collection),
            ("T1041", "Exfiltration Over C2 Channel", MitreTactic::Exfiltration),
        ];

        for (id, name, tactic) in sample_techniques {
            let technique = MitreTechnique {
                id: id.to_string(),
                name: name.to_string(),
                description: format!("Sample description for {}", name),
                tactic,
                platforms: vec![MitrePlatform::Windows, MitrePlatform::Linux],
                data_sources: vec![DataSource::ProcessMonitoring, DataSource::NetworkTraffic],
                detection_difficulty: DetectionDifficulty::Medium,
                sub_techniques: vec![],
                mitigations: vec![],
                detection_rules: vec![],
                kill_chain_phases: vec!["act".to_string()],
                permissions_required: vec!["User".to_string()],
                effective_permissions: vec!["User".to_string()],
                system_requirements: vec![],
                network_requirements: vec![],
                remote_support: true,
                impact_type: vec![],
                created: Utc::now(),
                modified: Utc::now(),
                version: "1.0".to_string(),
                revoked: false,
                deprecated: false,
            };
            self.techniques.insert(id.to_string(), technique);
        }
    }

    fn load_sample_groups(&mut self) {
        let sample_groups = vec![
            ("G0016", "APT29", "Cozy Bear"),
            ("G0028", "Lazarus Group", "Hidden Cobra"),
            ("G0007", "APT28", "Fancy Bear"),
        ];

        for (id, name, alias) in sample_groups {
            let group = MitreGroup {
                id: id.to_string(),
                name: name.to_string(),
                aliases: vec![alias.to_string()],
                description: format!("Sample threat group: {}", name),
                techniques_used: vec!["T1566.001".to_string(), "T1055".to_string()],
                software_used: vec![],
                associated_campaigns: vec![],
                first_seen: Utc::now(),
                last_seen: Utc::now(),
                origin_country: Some("Unknown".to_string()),
                motivation: vec!["Espionage".to_string()],
                sophistication_level: "Advanced".to_string(),
                targets: vec!["Government".to_string(), "Technology".to_string()],
                references: vec![],
            };
            self.groups.insert(id.to_string(), group);
        }
    }

    fn load_sample_software(&mut self) {
        let sample_software = vec![
            ("S0154", "Cobalt Strike", SoftwareType::Tool),
            ("S0363", "Empire", SoftwareType::Tool),
            ("S0002", "Mimikatz", SoftwareType::Tool),
        ];

        for (id, name, software_type) in sample_software {
            let software = MitreSoftware {
                id: id.to_string(),
                name: name.to_string(),
                aliases: vec![],
                description: format!("Sample software: {}", name),
                software_type,
                platforms: vec![MitrePlatform::Windows],
                techniques_used: vec!["T1055".to_string()],
                groups_using: vec!["G0016".to_string()],
                kill_chain_phases: vec!["act".to_string()],
                first_seen: Utc::now(),
                last_seen: Utc::now(),
                references: vec![],
            };
            self.software.insert(id.to_string(), software);
        }
    }

    fn load_sample_mitigations(&mut self) {
        let mitigation = Mitigation {
            id: "M1049".to_string(),
            name: "Antivirus/Antimalware".to_string(),
            description: "Use signatures or heuristics to detect malicious software.".to_string(),
            techniques_mitigated: vec!["T1055".to_string()],
            implementation_difficulty: ImplementationDifficulty::Low,
            effectiveness: 0.7,
            cost_estimate: CostEstimate::Medium,
            deployment_time: "1-2 weeks".to_string(),
            prerequisites: vec!["Endpoint management system".to_string()],
            side_effects: vec!["Potential performance impact".to_string()],
            references: vec![],
        };
        self.mitigations.insert("M1049".to_string(), mitigation);
    }

    fn load_sample_detection_rules(&mut self) {
        let rule = DetectionRule {
            id: "DR001".to_string(),
            name: "Process Injection Detection".to_string(),
            description: "Detects process injection techniques".to_string(),
            rule_type: DetectionRuleType::Sigma,
            severity: Severity::High,
            confidence: 0.85,
            data_source: DataSource::ProcessMonitoring,
            query: "process_name:*.exe AND (CreateRemoteThread OR SetWindowsHookEx)".to_string(),
            false_positive_rate: 0.05,
            coverage_percentage: 0.8,
            created: Utc::now(),
            updated: Utc::now(),
            author: "Phantom Security".to_string(),
            references: vec![],
        };
        self.detection_rules.insert("DR001".to_string(), rule);
    }

    fn identify_techniques(&self, indicators: &[String]) -> Vec<TechniqueMatch> {
        // Simulate technique identification based on indicators
        let mut matches = Vec::new();
        
        for (technique_id, technique) in &self.techniques {
            let confidence = self.calculate_technique_confidence(technique, indicators);
            if confidence > 0.3 {
                matches.push(TechniqueMatch {
                    technique_id: technique_id.clone(),
                    technique_name: technique.name.clone(),
                    confidence,
                    evidence: indicators.iter().take(2).cloned().collect(),
                    indicators: indicators.iter().take(3).cloned().collect(),
                    sub_techniques: technique.sub_techniques.clone(),
                    platforms_affected: technique.platforms.clone(),
                    data_sources_triggered: technique.data_sources.clone(),
                });
            }
        }
        
        matches.sort_by(|a, b| b.confidence.partial_cmp(&a.confidence).unwrap());
        matches.truncate(10);
        matches
    }

    fn calculate_technique_confidence(&self, _technique: &MitreTechnique, indicators: &[String]) -> f64 {
        // Simulate confidence calculation based on indicators
        let base_confidence = 0.4;
        let indicator_boost = indicators.len() as f64 * 0.1;
        (base_confidence + indicator_boost).min(1.0)
    }

    fn calculate_tactics_coverage(&self, techniques: &[TechniqueMatch]) -> HashMap<MitreTactic, f64> {
        let mut coverage = HashMap::new();
        
        for technique_match in techniques {
            if let Some(technique) = self.techniques.get(&technique_match.technique_id) {
                let current = coverage.get(&technique.tactic).unwrap_or(&0.0);
                coverage.insert(technique.tactic.clone(), (current + technique_match.confidence).min(1.0));
            }
        }
        
        coverage
    }

    fn generate_attack_path(&self, techniques: &[TechniqueMatch]) -> Vec<AttackPathStep> {
        let mut path = Vec::new();
        let mut step_number = 1;

        for technique_match in techniques.iter().take(5) {
            if let Some(technique) = self.techniques.get(&technique_match.technique_id) {
                path.push(AttackPathStep {
                    step_number,
                    tactic: technique.tactic.clone(),
                    technique_id: technique.id.clone(),
                    technique_name: technique.name.clone(),
                    description: technique.description.clone(),
                    prerequisites: technique.permissions_required.clone(),
                    outcomes: vec!["System compromise".to_string()],
                    detection_opportunities: vec!["Monitor process creation".to_string()],
                    mitigation_opportunities: technique.mitigations.clone(),
                });
                step_number += 1;
            }
        }

        path
    }

    fn calculate_risk_score(&self, techniques: &[TechniqueMatch], tactics_coverage: &HashMap<MitreTactic, f64>) -> f64 {
        let technique_score: f64 = techniques.iter().map(|t| t.confidence).sum::<f64>() / techniques.len().max(1) as f64;
        let tactic_score: f64 = tactics_coverage.values().sum::<f64>() / tactics_coverage.len().max(1) as f64;
        (technique_score * 0.6 + tactic_score * 0.4).min(1.0)
    }

    fn calculate_confidence_score(&self, techniques: &[TechniqueMatch]) -> f64 {
        if techniques.is_empty() {
            return 0.0;
        }
        techniques.iter().map(|t| t.confidence).sum::<f64>() / techniques.len() as f64
    }

    fn recommend_mitigations(&self, techniques: &[TechniqueMatch]) -> Vec<String> {
        let mut mitigations = Vec::new();
        
        for technique_match in techniques {
            if let Some(technique) = self.techniques.get(&technique_match.technique_id) {
                mitigations.extend(technique.mitigations.clone());
            }
        }
        
        mitigations.sort();
        mitigations.dedup();
        mitigations.truncate(10);
        mitigations
    }

    fn identify_detection_gaps(&self, techniques: &[TechniqueMatch]) -> Vec<DetectionGap> {
        techniques
            .iter()
            .filter(|tm| tm.confidence > 0.5)
            .map(|tm| DetectionGap {
                technique_id: tm.technique_id.clone(),
                technique_name: tm.technique_name.clone(),
                gap_type: GapType::LowCoverage,
                severity: Severity::Medium,
                description: "Limited detection coverage for this technique".to_string(),
                recommended_actions: vec!["Implement additional monitoring".to_string()],
                data_sources_needed: tm.data_sources_triggered.clone(),
                estimated_coverage_improvement: 0.3,
            })
            .collect()
    }

    fn analyze_threat_landscape(&self) -> ThreatLandscape {
        let most_common_tactics = vec![
            (MitreTactic::InitialAccess, 45),
            (MitreTactic::DefenseEvasion, 38),
            (MitreTactic::Discovery, 32),
        ];

        let most_common_techniques = vec![
            ("T1566.001".to_string(), 28),
            ("T1055".to_string(), 24),
            ("T1083".to_string(), 19),
        ];

        let trending_techniques = vec![
            "T1071.001".to_string(),
            "T1005".to_string(),
            "T1041".to_string(),
        ];

        let mut platform_distribution = HashMap::new();
        platform_distribution.insert(MitrePlatform::Windows, 65);
        platform_distribution.insert(MitrePlatform::Linux, 25);
        platform_distribution.insert(MitrePlatform::MacOS, 10);

        let group_activity = vec![
            GroupActivity {
                group_id: "G0016".to_string(),
                group_name: "APT29".to_string(),
                activity_level: ActivityLevel::High,
                recent_techniques: vec!["T1566.001".to_string(), "T1055".to_string()],
                target_sectors: vec!["Government".to_string(), "Healthcare".to_string()],
                geographic_focus: vec!["North America".to_string(), "Europe".to_string()],
            },
        ];

        let emerging_threats = vec![
            EmergingThreat {
                threat_id: "ET001".to_string(),
                name: "Cloud Infrastructure Targeting".to_string(),
                description: "Increased targeting of cloud infrastructure".to_string(),
                techniques_involved: vec!["T1078".to_string(), "T1530".to_string()],
                first_observed: Utc::now(),
                confidence: 0.8,
                potential_impact: Severity::High,
                affected_platforms: vec![MitrePlatform::Cloud, MitrePlatform::AWS],
                indicators: vec!["Unusual API calls".to_string()],
            },
        ];

        ThreatLandscape {
            most_common_tactics,
            most_common_techniques,
            trending_techniques,
            platform_distribution,
            group_activity,
            emerging_threats,
        }
    }

    fn matches_criteria(&self, technique: &MitreTechnique, criteria: &MitreSearchCriteria) -> bool {
        if let Some(ref query) = criteria.query {
            if !technique.name.to_lowercase().contains(&query.to_lowercase()) &&
               !technique.description.to_lowercase().contains(&query.to_lowercase()) {
                return false;
            }
        }

        if let Some(ref tactics) = criteria.tactics {
            if !tactics.contains(&technique.tactic) {
                return false;
            }
        }

        if let Some(ref platforms) = criteria.platforms {
            if !technique.platforms.iter().any(|p| platforms.contains(p)) {
                return false;
            }
        }

        if let Some(ref data_sources) = criteria.data_sources {
            if !technique.data_sources.iter().any(|ds| data_sources.contains(ds)) {
                return false;
            }
        }

        if let Some(ref detection_difficulty) = criteria.detection_difficulty {
            if technique.detection_difficulty != *detection_difficulty {
                return false;
            }
        }

        true
    }

    fn get_technique_tactic(&self, technique_id: &str) -> MitreTactic {
        self.techniques
            .get(technique_id)
            .map(|t| t.tactic.clone())
            .unwrap_or(MitreTactic::Discovery)
    }

    fn get_confidence_color(&self, confidence: f64) -> String {
        if confidence >= 0.8 {
            "#ff4444".to_string() // High confidence - red
        } else if confidence >= 0.6 {
            "#ff8844".to_string() // Medium confidence - orange
        } else if confidence >= 0.4 {
            "#ffcc44".to_string() // Low confidence - yellow
        } else {
            "#cccccc".to_string() // Very low confidence - gray
        }
    }
}

impl Default for MitreCore {
    fn default() -> Self {
        let mut core = Self::new();
        core.initialize_with_sample_data();
        core
    }
}

// NAPI wrapper for JavaScript bindings
#[napi]
pub struct MitreCoreNapi {
    inner: MitreCore,
}

#[napi]
impl MitreCoreNapi {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            inner: MitreCore::default(),
        }
    }

    #[napi]
    pub fn add_technique(&mut self, technique_json: String) -> Result<String> {
        let technique: MitreTechnique = serde_json::from_str(&technique_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse technique: {}", e)))?;
        
        Ok(self.inner.add_technique(technique))
    }

    #[napi]
    pub fn get_technique(&self, id: String) -> Result<Option<String>> {
        match self.inner.get_technique(&id) {
            Some(technique) => {
                let json = serde_json::to_string(technique)
                    .map_err(|e| napi::Error::from_reason(format!("Failed to serialize technique: {}", e)))?;
                Ok(Some(json))
            }
            None => Ok(None)
        }
    }

    #[napi]
    pub fn analyze_threat(&self, indicators: Vec<String>) -> Result<String> {
        let analysis = self.inner.analyze_threat(&indicators);
        serde_json::to_string(&analysis)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize analysis: {}", e)))
    }

    #[napi]
    pub fn map_techniques(&self, technique_ids: Vec<String>) -> Result<String> {
        let techniques = self.inner.map_techniques(&technique_ids);
        serde_json::to_string(&techniques)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize techniques: {}", e)))
    }

    #[napi]
    pub fn generate_navigator_layer(&self, analysis_json: String) -> Result<String> {
        let analysis: ThreatAnalysis = serde_json::from_str(&analysis_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse analysis: {}", e)))?;
        
        let layer = self.inner.generate_navigator_layer(&analysis);
        serde_json::to_string(&layer)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize layer: {}", e)))
    }

    #[napi]
    pub fn search_techniques(&self, query_json: String) -> Result<String> {
        let query: MitreSearchCriteria = serde_json::from_str(&query_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse query: {}", e)))?;
        
        let results = self.inner.search_techniques(&query);
        serde_json::to_string(&results)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize results: {}", e)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mitre_core_creation() {
        let core = MitreCore::new();
        assert!(core.techniques.is_empty());
    }

    #[test]
    fn test_threat_analysis() {
        let core = MitreCore::default();
        let indicators = vec![
            "malicious.exe".to_string(),
            "suspicious_network_traffic".to_string(),
            "registry_modification".to_string(),
        ];
        
        let analysis = core.analyze_threat(&indicators);
        assert!(!analysis.analysis_id.is_empty());
        assert!(analysis.risk_score >= 0.0 && analysis.risk_score <= 1.0);
    }

    #[test]
    fn test_technique_mapping() {
        let core = MitreCore::default();
        let technique_ids = vec!["T1566.001".to_string(), "T1055".to_string()];
        let techniques = core.map_techniques(&technique_ids);
        assert_eq!(techniques.len(), 2);
    }

    #[test]
    fn test_navigator_layer_generation() {
        let core = MitreCore::default();
        let indicators = vec!["test_indicator".to_string()];
        let analysis = core.analyze_threat(&indicators);
        let layer = core.generate_navigator_layer(&analysis);
        assert_eq!(layer.domain, "enterprise-attack");
    }
}
