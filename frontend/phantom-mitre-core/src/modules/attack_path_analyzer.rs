//! Attack Path Analyzer Module
//! 
//! Advanced attack path visualization and analysis for understanding 
//! potential attack sequences and attack progression through MITRE ATT&CK techniques.

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet, VecDeque};
use chrono::{DateTime, Utc};
use crate::{MitreTechnique, MitreTactic, Severity};

/// Attack path node representing a single step in an attack sequence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackPathNode {
    pub node_id: String,
    pub technique_id: String,
    pub technique_name: String,
    pub tactic: MitreTactic,
    pub execution_probability: f64,
    pub impact_score: f64,
    pub difficulty_score: f64,
    pub prerequisites: Vec<String>,
    pub outcomes: Vec<String>,
    pub detection_difficulty: f64,
    pub mitigation_effectiveness: f64,
    pub estimated_time: u64, // in minutes
    pub required_privileges: Vec<String>,
    pub required_tools: Vec<String>,
    pub platforms: Vec<String>,
    pub data_sources: Vec<String>,
}

/// Attack path edge representing the relationship between two attack steps
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackPathEdge {
    pub edge_id: String,
    pub source_node: String,
    pub target_node: String,
    pub transition_probability: f64,
    pub transition_condition: String,
    pub required_artifacts: Vec<String>,
    pub time_delay: u64, // in minutes
    pub complexity_factor: f64,
}

/// Complete attack path with multiple possible sequences
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackPath {
    pub path_id: String,
    pub name: String,
    pub description: String,
    pub nodes: Vec<AttackPathNode>,
    pub edges: Vec<AttackPathEdge>,
    pub entry_points: Vec<String>,
    pub objectives: Vec<String>,
    pub total_probability: f64,
    pub estimated_duration: u64, // in minutes
    pub risk_score: f64,
    pub complexity_score: f64,
    pub stealth_score: f64,
    pub created_at: DateTime<Utc>,
    pub last_updated: DateTime<Utc>,
}

/// Attack scenario configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackScenario {
    pub scenario_id: String,
    pub name: String,
    pub description: String,
    pub threat_actor_profile: ThreatActorProfile,
    pub target_environment: TargetEnvironment,
    pub attack_objectives: Vec<AttackObjective>,
    pub constraints: AttackConstraints,
    pub timeline: AttackTimeline,
}

/// Threat actor profile for path analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatActorProfile {
    pub actor_type: ActorType,
    pub sophistication_level: SophisticationLevel,
    pub resource_level: ResourceLevel,
    pub motivation: Vec<String>,
    pub preferred_techniques: Vec<String>,
    pub preferred_tools: Vec<String>,
    pub operational_patterns: Vec<String>,
    pub geographic_origin: Option<String>,
}

/// Actor type categories
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ActorType {
    NationState,
    Cybercriminal,
    Hacktivist,
    InsiderThreat,
    ScriptKiddie,
    APT,
    Ransomware,
    Espionage,
}

/// Sophistication levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum SophisticationLevel {
    Novice,
    Intermediate,
    Advanced,
    Expert,
    NationState,
}

/// Resource availability levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum ResourceLevel {
    Limited,
    Moderate,
    Substantial,
    Extensive,
    Unlimited,
}

/// Target environment characteristics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TargetEnvironment {
    pub environment_type: EnvironmentType,
    pub size: OrganizationSize,
    pub industry_sector: String,
    pub security_maturity: SecurityMaturityLevel,
    pub infrastructure: InfrastructureProfile,
    pub user_profile: UserProfile,
    pub geographic_location: String,
    pub compliance_requirements: Vec<String>,
}

/// Environment type categories
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum EnvironmentType {
    Enterprise,
    SMB,
    Government,
    Healthcare,
    Financial,
    Educational,
    Industrial,
    Cloud,
    Hybrid,
}

/// Organization size categories
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum OrganizationSize {
    Small,
    Medium,
    Large,
    Enterprise,
    Government,
}

/// Security maturity levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum SecurityMaturityLevel {
    Initial,
    Developing,
    Defined,
    Managed,
    Optimizing,
}

/// Infrastructure profile
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InfrastructureProfile {
    pub operating_systems: HashMap<String, f64>, // OS -> percentage
    pub network_architecture: NetworkArchitecture,
    pub cloud_adoption: CloudAdoption,
    pub security_controls: Vec<SecurityControl>,
    pub endpoints: u32,
    pub servers: u32,
    pub network_segmentation: SegmentationLevel,
}

/// Network architecture types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum NetworkArchitecture {
    Flat,
    Segmented,
    ZeroTrust,
    Hybrid,
    Legacy,
    Modern,
}

/// Cloud adoption levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CloudAdoption {
    None,
    Minimal,
    Partial,
    Extensive,
    CloudFirst,
    CloudNative,
}

/// Security controls
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityControl {
    pub control_type: String,
    pub effectiveness: f64,
    pub coverage: f64,
    pub implementation_quality: f64,
}

/// Network segmentation levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum SegmentationLevel {
    None,
    Basic,
    Moderate,
    Advanced,
    MicroSegmentation,
}

/// User profile characteristics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserProfile {
    pub total_users: u32,
    pub privileged_users: u32,
    pub security_awareness_level: SecurityAwarenessLevel,
    pub access_patterns: Vec<AccessPattern>,
    pub remote_work_percentage: f64,
    pub byod_adoption: f64,
}

/// Security awareness levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum SecurityAwarenessLevel {
    Low,
    Basic,
    Intermediate,
    Advanced,
    Expert,
}

/// User access patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessPattern {
    pub pattern_type: String,
    pub frequency: f64,
    pub risk_level: f64,
    pub detection_difficulty: f64,
}

/// Attack objectives
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackObjective {
    pub objective_id: String,
    pub name: String,
    pub description: String,
    pub priority: Priority,
    pub tactics_required: Vec<MitreTactic>,
    pub success_criteria: Vec<String>,
    pub value_to_attacker: f64,
    pub difficulty: f64,
}

/// Priority levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
}

/// Attack constraints
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackConstraints {
    pub time_limit: Option<u64>, // in hours
    pub noise_tolerance: NoiseToleranceLevel,
    pub resource_constraints: Vec<String>,
    pub detection_avoidance: bool,
    pub persistence_required: bool,
    pub lateral_movement_scope: LateralMovementScope,
    pub data_exfiltration_volume: Option<u64>, // in MB
}

/// Noise tolerance levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum NoiseToleranceLevel {
    Stealth,
    Low,
    Medium,
    High,
    Unrestricted,
}

/// Lateral movement scope
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum LateralMovementScope {
    SingleHost,
    LocalNetwork,
    NetworkSegment,
    EntireNetwork,
    MultiNetwork,
}

/// Attack timeline
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackTimeline {
    pub phases: Vec<AttackPhase>,
    pub total_duration: u64, // in hours
    pub critical_path: Vec<String>,
    pub parallel_activities: Vec<ParallelActivity>,
}

/// Individual attack phase
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackPhase {
    pub phase_id: String,
    pub name: String,
    pub tactic: MitreTactic,
    pub start_time: u64, // relative to attack start in minutes
    pub duration: u64,   // in minutes
    pub techniques: Vec<String>,
    pub dependencies: Vec<String>,
    pub success_probability: f64,
}

/// Parallel activities during attack
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParallelActivity {
    pub activity_id: String,
    pub name: String,
    pub techniques: Vec<String>,
    pub start_condition: String,
    pub duration: u64,
}

/// Path analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PathAnalysisResult {
    pub analysis_id: String,
    pub scenario: AttackScenario,
    pub discovered_paths: Vec<AttackPath>,
    pub optimal_path: Option<AttackPath>,
    pub alternative_paths: Vec<AttackPath>,
    pub chokepoints: Vec<Chokepoint>,
    pub critical_assets: Vec<CriticalAsset>,
    pub recommendations: Vec<DefenseRecommendation>,
    pub risk_assessment: RiskAssessment,
    pub analysis_metadata: AnalysisMetadata,
}

/// Critical chokepoints in attack paths
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chokepoint {
    pub chokepoint_id: String,
    pub technique_id: String,
    pub technique_name: String,
    pub affected_paths: Vec<String>,
    pub criticality_score: f64,
    pub detection_opportunities: Vec<String>,
    pub mitigation_strategies: Vec<String>,
    pub bypass_difficulty: f64,
}

/// Critical assets in the environment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CriticalAsset {
    pub asset_id: String,
    pub asset_name: String,
    pub asset_type: String,
    pub value_score: f64,
    pub exposure_level: f64,
    pub protection_level: f64,
    pub attack_paths_to_asset: Vec<String>,
    pub recommended_controls: Vec<String>,
}

/// Defense recommendations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DefenseRecommendation {
    pub recommendation_id: String,
    pub title: String,
    pub description: String,
    pub priority: Priority,
    pub implementation_cost: CostEstimate,
    pub effectiveness_score: f64,
    pub affected_techniques: Vec<String>,
    pub implementation_time: String,
    pub prerequisites: Vec<String>,
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

/// Overall risk assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAssessment {
    pub overall_risk_score: f64,
    pub likelihood_score: f64,
    pub impact_score: f64,
    pub risk_factors: Vec<RiskFactor>,
    pub risk_mitigation_priority: Vec<String>,
    pub residual_risk: f64,
}

/// Individual risk factors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFactor {
    pub factor_id: String,
    pub name: String,
    pub description: String,
    pub contribution: f64,
    pub mitigation_options: Vec<String>,
}

/// Analysis metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisMetadata {
    pub analysis_timestamp: DateTime<Utc>,
    pub analysis_duration: u64, // in seconds
    pub paths_analyzed: u32,
    pub techniques_considered: u32,
    pub confidence_level: f64,
    pub analysis_version: String,
    pub analyst: String,
}

/// Main attack path analyzer
pub struct AttackPathAnalyzer {
    technique_database: HashMap<String, MitreTechnique>,
    technique_relationships: HashMap<String, Vec<String>>,
    path_cache: HashMap<String, Vec<AttackPath>>,
    analysis_history: Vec<PathAnalysisResult>,
}

impl AttackPathAnalyzer {
    /// Create a new attack path analyzer
    pub fn new() -> Self {
        Self {
            technique_database: HashMap::new(),
            technique_relationships: HashMap::new(),
            path_cache: HashMap::new(),
            analysis_history: Vec::new(),
        }
    }

    /// Load MITRE ATT&CK techniques for path analysis
    pub fn load_techniques(&mut self, techniques: Vec<MitreTechnique>) {
        for technique in techniques {
            self.technique_database.insert(technique.id.clone(), technique);
        }
        self.build_technique_relationships();
    }

    /// Analyze attack paths for a given scenario
    pub fn analyze_attack_paths(&mut self, scenario: AttackScenario) -> PathAnalysisResult {
        let analysis_start = Utc::now();
        let analysis_id = uuid::Uuid::new_v4().to_string();

        // Check cache first
        let cache_key = self.generate_cache_key(&scenario);
        let mut discovered_paths = if let Some(cached_paths) = self.path_cache.get(&cache_key) {
            cached_paths.clone()
        } else {
            self.discover_attack_paths(&scenario)
        };

        // Sort paths by effectiveness
        discovered_paths.sort_by(|a, b| b.total_probability.partial_cmp(&a.total_probability).unwrap());

        // Find optimal and alternative paths
        let optimal_path = discovered_paths.first().cloned();
        let alternative_paths = discovered_paths.iter().skip(1).take(5).cloned().collect();

        // Identify chokepoints
        let chokepoints = self.identify_chokepoints(&discovered_paths);

        // Identify critical assets
        let critical_assets = self.identify_critical_assets(&scenario, &discovered_paths);

        // Generate recommendations
        let recommendations = self.generate_defense_recommendations(&discovered_paths, &chokepoints);

        // Assess risk
        let risk_assessment = self.assess_risk(&scenario, &discovered_paths);

        // Create analysis metadata
        let analysis_duration = Utc::now().signed_duration_since(analysis_start).num_seconds() as u64;
        let analysis_metadata = AnalysisMetadata {
            analysis_timestamp: analysis_start,
            analysis_duration,
            paths_analyzed: discovered_paths.len() as u32,
            techniques_considered: self.technique_database.len() as u32,
            confidence_level: 0.85,
            analysis_version: "1.0".to_string(),
            analyst: "Phantom Attack Path Analyzer".to_string(),
        };

        let result = PathAnalysisResult {
            analysis_id,
            scenario,
            discovered_paths: discovered_paths.clone(),
            optimal_path,
            alternative_paths,
            chokepoints,
            critical_assets,
            recommendations,
            risk_assessment,
            analysis_metadata,
        };

        // Cache results
        self.path_cache.insert(cache_key, discovered_paths);
        self.analysis_history.push(result.clone());

        result
    }

    /// Discover possible attack paths using graph algorithms
    fn discover_attack_paths(&self, scenario: &AttackScenario) -> Vec<AttackPath> {
        let mut paths = Vec::new();

        // Build attack graph
        let attack_graph = self.build_attack_graph(scenario);

        // Find paths from entry points to objectives
        for entry_point in &scenario.attack_objectives {
            let paths_from_entry = self.find_paths_from_entry_point(&attack_graph, entry_point, scenario);
            paths.extend(paths_from_entry);
        }

        // Validate and score paths
        paths.into_iter()
            .filter(|path| self.validate_path(path, scenario))
            .map(|mut path| {
                self.score_path(&mut path, scenario);
                path
            })
            .collect()
    }

    /// Build attack graph from MITRE techniques
    fn build_attack_graph(&self, scenario: &AttackScenario) -> HashMap<String, Vec<String>> {
        let mut graph = HashMap::new();

        // Build graph based on technique relationships and scenario constraints
        for (technique_id, technique) in &self.technique_database {
            if self.technique_applicable_to_scenario(technique, scenario) {
                let connected_techniques = self.find_connected_techniques(technique_id, scenario);
                graph.insert(technique_id.clone(), connected_techniques);
            }
        }

        graph
    }

    /// Find attack paths from an entry point using BFS
    fn find_paths_from_entry_point(
        &self,
        graph: &HashMap<String, Vec<String>>,
        entry_objective: &AttackObjective,
        scenario: &AttackScenario,
    ) -> Vec<AttackPath> {
        let mut paths = Vec::new();
        let mut queue = VecDeque::new();
        let max_path_length = 10;

        // Initialize with entry point techniques
        for tactic in &entry_objective.tactics_required {
            for (technique_id, technique) in &self.technique_database {
                if technique.tactic == *tactic {
                    queue.push_back(vec![technique_id.clone()]);
                }
            }
        }

        while let Some(current_path) = queue.pop_front() {
            if current_path.len() >= max_path_length {
                continue;
            }

            let last_technique = current_path.last().unwrap();
            
            // Check if this path achieves the objective
            if self.path_achieves_objective(&current_path, entry_objective) {
                paths.push(self.create_attack_path_from_sequence(&current_path, scenario));
                continue;
            }

            // Extend path with connected techniques
            if let Some(connected) = graph.get(last_technique) {
                for next_technique in connected {
                    if !current_path.contains(next_technique) {
                        let mut new_path = current_path.clone();
                        new_path.push(next_technique.clone());
                        queue.push_back(new_path);
                    }
                }
            }
        }

        paths
    }

    /// Check if technique is applicable to scenario
    fn technique_applicable_to_scenario(&self, technique: &MitreTechnique, scenario: &AttackScenario) -> bool {
        // Check if technique platforms match target environment
        let target_platforms: HashSet<String> = scenario.target_environment.infrastructure.operating_systems.keys().cloned().collect();
        let technique_platforms: HashSet<String> = technique.platforms.iter().map(|p| format!("{:?}", p)).collect();
        
        !target_platforms.is_disjoint(&technique_platforms)
    }

    /// Find techniques connected to the given technique
    fn find_connected_techniques(&self, technique_id: &str, _scenario: &AttackScenario) -> Vec<String> {
        self.technique_relationships.get(technique_id).cloned().unwrap_or_default()
    }

    /// Check if path achieves the objective
    fn path_achieves_objective(&self, path: &[String], objective: &AttackObjective) -> bool {
        let path_tactics: HashSet<MitreTactic> = path.iter()
            .filter_map(|tid| self.technique_database.get(tid))
            .map(|t| t.tactic.clone())
            .collect();

        let required_tactics: HashSet<MitreTactic> = objective.tactics_required.iter().cloned().collect();
        required_tactics.is_subset(&path_tactics)
    }

    /// Create attack path from technique sequence
    fn create_attack_path_from_sequence(&self, sequence: &[String], scenario: &AttackScenario) -> AttackPath {
        let path_id = uuid::Uuid::new_v4().to_string();
        let mut nodes = Vec::new();
        let mut edges = Vec::new();

        // Create nodes
        for (i, technique_id) in sequence.iter().enumerate() {
            if let Some(technique) = self.technique_database.get(technique_id) {
                nodes.push(AttackPathNode {
                    node_id: format!("node_{}", i),
                    technique_id: technique.id.clone(),
                    technique_name: technique.name.clone(),
                    tactic: technique.tactic.clone(),
                    execution_probability: 0.7, // Placeholder
                    impact_score: 0.6,
                    difficulty_score: 0.5,
                    prerequisites: technique.permissions_required.clone(),
                    outcomes: vec!["System access".to_string()],
                    detection_difficulty: 0.4,
                    mitigation_effectiveness: 0.6,
                    estimated_time: 30, // 30 minutes placeholder
                    required_privileges: technique.permissions_required.clone(),
                    required_tools: vec![],
                    platforms: technique.platforms.iter().map(|p| format!("{:?}", p)).collect(),
                    data_sources: technique.data_sources.iter().map(|ds| format!("{:?}", ds)).collect(),
                });
            }
        }

        // Create edges
        for i in 0..sequence.len().saturating_sub(1) {
            edges.push(AttackPathEdge {
                edge_id: format!("edge_{}_{}", i, i + 1),
                source_node: format!("node_{}", i),
                target_node: format!("node_{}", i + 1),
                transition_probability: 0.8,
                transition_condition: "Previous technique successful".to_string(),
                required_artifacts: vec![],
                time_delay: 5, // 5 minutes
                complexity_factor: 0.5,
            });
        }

        AttackPath {
            path_id,
            name: format!("Attack Path for {}", scenario.name),
            description: format!("Generated attack path with {} steps", sequence.len()),
            nodes,
            edges,
            entry_points: vec![sequence.first().unwrap_or(&"T1000".to_string()).clone()],
            objectives: scenario.attack_objectives.iter().map(|obj| obj.name.clone()).collect(),
            total_probability: 0.6, // Calculated based on individual step probabilities
            estimated_duration: sequence.len() as u64 * 30, // 30 minutes per step
            risk_score: 0.7,
            complexity_score: 0.5,
            stealth_score: 0.6,
            created_at: Utc::now(),
            last_updated: Utc::now(),
        }
    }

    /// Validate if attack path is feasible
    fn validate_path(&self, _path: &AttackPath, _scenario: &AttackScenario) -> bool {
        // Implement path validation logic
        true
    }

    /// Score attack path based on various factors
    fn score_path(&self, path: &mut AttackPath, _scenario: &AttackScenario) {
        // Calculate total probability
        let node_probabilities: f64 = path.nodes.iter().map(|n| n.execution_probability).product();
        let edge_probabilities: f64 = path.edges.iter().map(|e| e.transition_probability).product();
        path.total_probability = node_probabilities * edge_probabilities;

        // Calculate risk score
        let impact_scores: f64 = path.nodes.iter().map(|n| n.impact_score).sum::<f64>() / path.nodes.len().max(1) as f64;
        path.risk_score = path.total_probability * impact_scores;

        // Calculate complexity score
        path.complexity_score = path.nodes.iter().map(|n| n.difficulty_score).sum::<f64>() / path.nodes.len().max(1) as f64;

        // Calculate stealth score
        path.stealth_score = 1.0 - (path.nodes.iter().map(|n| n.detection_difficulty).sum::<f64>() / path.nodes.len().max(1) as f64);
    }

    /// Build technique relationships based on common patterns
    fn build_technique_relationships(&mut self) {
        // Build relationships based on tactic sequences and common attack patterns
        for (technique_id, technique) in &self.technique_database {
            let mut related_techniques = Vec::new();

            // Find techniques that commonly follow this tactic
            for (other_id, other_technique) in &self.technique_database {
                if technique_id != other_id && self.techniques_related(technique, other_technique) {
                    related_techniques.push(other_id.clone());
                }
            }

            self.technique_relationships.insert(technique_id.clone(), related_techniques);
        }
    }

    /// Check if two techniques are commonly related
    fn techniques_related(&self, tech1: &MitreTechnique, tech2: &MitreTechnique) -> bool {
        // Techniques in sequential tactics are related
        let tactic_sequences = [
            (MitreTactic::InitialAccess, MitreTactic::Execution),
            (MitreTactic::Execution, MitreTactic::Persistence),
            (MitreTactic::Persistence, MitreTactic::PrivilegeEscalation),
            (MitreTactic::PrivilegeEscalation, MitreTactic::DefenseEvasion),
            (MitreTactic::DefenseEvasion, MitreTactic::CredentialAccess),
            (MitreTactic::CredentialAccess, MitreTactic::Discovery),
            (MitreTactic::Discovery, MitreTactic::LateralMovement),
            (MitreTactic::LateralMovement, MitreTactic::Collection),
            (MitreTactic::Collection, MitreTactic::Exfiltration),
        ];

        tactic_sequences.iter().any(|(first, second)| {
            tech1.tactic == *first && tech2.tactic == *second
        })
    }

    /// Identify critical chokepoints in attack paths
    fn identify_chokepoints(&self, paths: &[AttackPath]) -> Vec<Chokepoint> {
        let mut technique_path_count: HashMap<String, Vec<String>> = HashMap::new();

        // Count how many paths use each technique
        for path in paths {
            for node in &path.nodes {
                technique_path_count
                    .entry(node.technique_id.clone())
                    .or_insert_with(Vec::new)
                    .push(path.path_id.clone());
            }
        }

        // Identify techniques used in multiple paths (chokepoints)
        technique_path_count
            .into_iter()
            .filter(|(_, path_ids)| path_ids.len() > 1)
            .map(|(technique_id, path_ids)| {
                let technique = self.technique_database.get(&technique_id);
                Chokepoint {
                    chokepoint_id: uuid::Uuid::new_v4().to_string(),
                    technique_id: technique_id.clone(),
                    technique_name: technique.map(|t| t.name.clone()).unwrap_or_default(),
                    affected_paths: path_ids.clone(),
                    criticality_score: path_ids.len() as f64 / paths.len().max(1) as f64,
                    detection_opportunities: vec!["Monitor technique execution".to_string()],
                    mitigation_strategies: vec!["Implement controls".to_string()],
                    bypass_difficulty: 0.7,
                }
            })
            .collect()
    }

    /// Identify critical assets in the environment
    fn identify_critical_assets(&self, scenario: &AttackScenario, paths: &[AttackPath]) -> Vec<CriticalAsset> {
        // Simulate critical asset identification based on attack objectives
        scenario.attack_objectives.iter().enumerate().map(|(i, objective)| {
            CriticalAsset {
                asset_id: format!("asset_{}", i),
                asset_name: objective.name.clone(),
                asset_type: "Data Repository".to_string(),
                value_score: objective.value_to_attacker,
                exposure_level: 0.6,
                protection_level: 0.4,
                attack_paths_to_asset: paths.iter().map(|p| p.path_id.clone()).collect(),
                recommended_controls: vec!["Access controls".to_string(), "Monitoring".to_string()],
            }
        }).collect()
    }

    /// Generate defense recommendations
    fn generate_defense_recommendations(&self, paths: &[AttackPath], chokepoints: &[Chokepoint]) -> Vec<DefenseRecommendation> {
        let mut recommendations = Vec::new();

        // Recommendations for chokepoints
        for chokepoint in chokepoints {
            recommendations.push(DefenseRecommendation {
                recommendation_id: uuid::Uuid::new_v4().to_string(),
                title: format!("Strengthen defenses for {}", chokepoint.technique_name),
                description: format!("This technique is used in {} attack paths", chokepoint.affected_paths.len()),
                priority: if chokepoint.criticality_score > 0.7 { Priority::High } else { Priority::Medium },
                implementation_cost: CostEstimate::Medium,
                effectiveness_score: 0.8,
                affected_techniques: vec![chokepoint.technique_id.clone()],
                implementation_time: "2-4 weeks".to_string(),
                prerequisites: vec!["Security team availability".to_string()],
            });
        }

        // General recommendations based on common techniques
        let common_tactics: Vec<MitreTactic> = paths.iter()
            .flat_map(|p| p.nodes.iter().map(|n| &n.tactic))
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .cloned()
            .collect();

        for tactic in common_tactics {
            recommendations.push(DefenseRecommendation {
                recommendation_id: uuid::Uuid::new_v4().to_string(),
                title: format!("Enhance {:?} defenses", tactic),
                description: format!("Multiple attack paths utilize {:?} tactic", tactic),
                priority: Priority::Medium,
                implementation_cost: CostEstimate::Medium,
                effectiveness_score: 0.7,
                affected_techniques: vec![],
                implementation_time: "4-8 weeks".to_string(),
                prerequisites: vec!["Budget approval".to_string()],
            });
        }

        recommendations
    }

    /// Assess overall risk
    fn assess_risk(&self, scenario: &AttackScenario, paths: &[AttackPath]) -> RiskAssessment {
        let likelihood_score = paths.iter()
            .map(|p| p.total_probability)
            .fold(0.0f64, |acc, prob| acc.max(prob));

        let impact_score = scenario.attack_objectives.iter()
            .map(|obj| obj.value_to_attacker)
            .fold(0.0f64, |acc, value| acc.max(value));

        let overall_risk_score = likelihood_score * impact_score;

        RiskAssessment {
            overall_risk_score,
            likelihood_score,
            impact_score,
            risk_factors: vec![],
            risk_mitigation_priority: vec![],
            residual_risk: overall_risk_score * 0.7, // Assuming 30% risk reduction with current controls
        }
    }

    /// Generate cache key for scenario
    fn generate_cache_key(&self, scenario: &AttackScenario) -> String {
        format!("{:?}_{:?}_{:?}", 
            scenario.threat_actor_profile.actor_type,
            scenario.target_environment.environment_type,
            scenario.attack_objectives.len()
        )
    }

    /// Get analysis history
    pub fn get_analysis_history(&self) -> &[PathAnalysisResult] {
        &self.analysis_history
    }
}

impl Default for AttackPathAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}

/// NAPI wrapper for JavaScript bindings
#[napi]
pub struct AttackPathAnalyzerNapi {
    inner: AttackPathAnalyzer,
}

#[napi]
impl AttackPathAnalyzerNapi {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            inner: AttackPathAnalyzer::new(),
        }
    }

    #[napi]
    pub fn load_techniques(&mut self, techniques_json: String) -> Result<()> {
        let techniques: Vec<MitreTechnique> = serde_json::from_str(&techniques_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse techniques: {}", e)))?;
        
        self.inner.load_techniques(techniques);
        Ok(())
    }

    #[napi]
    pub fn analyze_attack_paths(&mut self, scenario_json: String) -> Result<String> {
        let scenario: AttackScenario = serde_json::from_str(&scenario_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse scenario: {}", e)))?;
        
        let result = self.inner.analyze_attack_paths(scenario);
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize result: {}", e)))
    }

    #[napi]
    pub fn get_analysis_history(&self) -> Result<String> {
        serde_json::to_string(self.inner.get_analysis_history())
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize history: {}", e)))
    }
}