//! Risk Assessment Calculator Module
//! 
//! Comprehensive risk scoring and assessment for MITRE ATT&CK techniques
//! and attack scenarios with advanced mathematical models.

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use crate::{MitreTechnique, MitreTactic, Severity};

/// Risk calculation methodologies
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum RiskMethodology {
    CVSS,
    NIST,
    ISO27005,
    FAIR,
    OWASP,
    Custom,
    Hybrid,
}

/// Risk assessment frameworks
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum RiskFramework {
    NIST_CSF,
    ISO_27001,
    COBIT,
    COSO,
    OCTAVE,
    TARA,
    Custom,
}

/// Risk categories for classification
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum RiskCategory {
    Operational,
    Strategic,
    Financial,
    Compliance,
    Reputational,
    Technical,
    Physical,
    Environmental,
}

/// Risk impact areas
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ImpactArea {
    Confidentiality,
    Integrity,
    Availability,
    SafetySecurityHuman,
    Financial,
    Operational,
    Reputation,
    Compliance,
}

/// Risk levels for standardized classification
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum RiskLevel {
    Negligible,
    Low,
    Medium,
    High,
    Critical,
    Catastrophic,
}

/// Comprehensive risk assessment result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAssessment {
    pub assessment_id: String,
    pub assessment_name: String,
    pub timestamp: DateTime<Utc>,
    pub methodology: RiskMethodology,
    pub framework: RiskFramework,
    pub scope: AssessmentScope,
    pub risk_scores: RiskScores,
    pub technique_risks: Vec<TechniqueRisk>,
    pub aggregated_risks: AggregatedRisks,
    pub risk_trends: Vec<RiskTrend>,
    pub recommendations: Vec<RiskRecommendation>,
    pub compliance_mapping: Vec<ComplianceMapping>,
    pub business_impact: BusinessImpactAnalysis,
    pub uncertainty_analysis: UncertaintyAnalysis,
    pub sensitivity_analysis: SensitivityAnalysis,
    pub assessment_metadata: AssessmentMetadata,
}

/// Risk assessment scope
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssessmentScope {
    pub scope_type: ScopeType,
    pub included_tactics: Vec<MitreTactic>,
    pub included_techniques: Vec<String>,
    pub target_assets: Vec<AssetProfile>,
    pub threat_actors: Vec<ThreatActorProfile>,
    pub time_horizon: TimeHorizon,
    pub geographic_scope: Vec<String>,
    pub organizational_units: Vec<String>,
}

/// Assessment scope types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ScopeType {
    Enterprise,
    BusinessUnit,
    System,
    Application,
    Network,
    Process,
    Asset,
    Project,
}

/// Time horizon for risk assessment
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum TimeHorizon {
    Immediate,  // 0-3 months
    Short,      // 3-12 months
    Medium,     // 1-3 years
    Long,       // 3-5 years
    Extended,   // 5+ years
}

/// Asset profile for risk assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetProfile {
    pub asset_id: String,
    pub asset_name: String,
    pub asset_type: AssetType,
    pub criticality: AssetCriticality,
    pub value: AssetValue,
    pub exposure: ExposureProfile,
    pub vulnerabilities: Vec<VulnerabilityProfile>,
    pub controls: Vec<SecurityControl>,
    pub dependencies: Vec<String>,
}

/// Asset types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum AssetType {
    Data,
    Application,
    System,
    Network,
    Device,
    Personnel,
    Facility,
    Service,
    Reputation,
    IntellectualProperty,
}

/// Asset criticality levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum AssetCriticality {
    Low,
    Medium,
    High,
    Critical,
    MissionCritical,
}

/// Asset value assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetValue {
    pub replacement_cost: f64,
    pub operational_value: f64,
    pub strategic_value: f64,
    pub compliance_value: f64,
    pub reputation_value: f64,
    pub total_value: f64,
    pub currency: String,
}

/// Asset exposure profile
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExposureProfile {
    pub internet_facing: bool,
    pub network_exposure: NetworkExposure,
    pub physical_exposure: PhysicalExposure,
    pub social_exposure: SocialExposure,
    pub supply_chain_exposure: SupplyChainExposure,
}

/// Network exposure details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkExposure {
    pub external_connectivity: bool,
    pub remote_access: bool,
    pub cloud_exposure: bool,
    pub partner_connectivity: bool,
    pub mobile_access: bool,
    pub iot_connectivity: bool,
}

/// Physical exposure details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysicalExposure {
    pub physical_access_controls: f64,
    pub geographic_risk: f64,
    pub environmental_risk: f64,
    pub facility_security: f64,
}

/// Social exposure details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SocialExposure {
    pub public_profile: f64,
    pub social_media_presence: f64,
    pub employee_targeting: f64,
    pub brand_recognition: f64,
}

/// Supply chain exposure details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupplyChainExposure {
    pub third_party_dependencies: u32,
    pub vendor_risk_score: f64,
    pub software_supply_chain: f64,
    pub hardware_supply_chain: f64,
}

/// Vulnerability profile
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VulnerabilityProfile {
    pub vulnerability_id: String,
    pub cvss_score: f64,
    pub exploitability: f64,
    pub impact: f64,
    pub patch_availability: bool,
    pub exploitation_likelihood: f64,
    pub related_techniques: Vec<String>,
}

/// Security control profile
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityControl {
    pub control_id: String,
    pub control_type: ControlType,
    pub effectiveness: f64,
    pub coverage: f64,
    pub maturity: ControlMaturity,
    pub cost: f64,
    pub maintenance_effort: f64,
}

/// Security control types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ControlType {
    Preventive,
    Detective,
    Corrective,
    Deterrent,
    Compensating,
    Administrative,
    Technical,
    Physical,
}

/// Control maturity levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum ControlMaturity {
    Initial,
    Developing,
    Defined,
    Managed,
    Optimizing,
}

/// Threat actor profile for risk assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatActorProfile {
    pub actor_id: String,
    pub actor_name: String,
    pub actor_type: ActorType,
    pub sophistication: SophisticationLevel,
    pub resources: ResourceLevel,
    pub motivation: Vec<MotivationType>,
    pub targeting_likelihood: f64,
    pub capability_score: f64,
    pub opportunity_score: f64,
    pub intent_score: f64,
}

/// Actor types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ActorType {
    NationState,
    OrganizedCrime,
    Hacktivist,
    Terrorist,
    InsiderMalicious,
    InsiderNegligent,
    ScriptKiddie,
    CompetitorEspionage,
}

/// Sophistication levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum SophisticationLevel {
    Minimal,
    Limited,
    Intermediate,
    Advanced,
    Expert,
    StateSponsored,
}

/// Resource levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum ResourceLevel {
    Individual,
    Club,
    Contest,
    Team,
    Organization,
    Government,
}

/// Motivation types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum MotivationType {
    Financial,
    Espionage,
    Sabotage,
    Ideology,
    Revenge,
    Curiosity,
    Recognition,
    Dominance,
}

/// Comprehensive risk scores
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskScores {
    pub overall_risk_score: f64,
    pub inherent_risk: f64,
    pub residual_risk: f64,
    pub risk_appetite: f64,
    pub risk_tolerance: f64,
    pub risk_level: RiskLevel,
    pub risk_rating: String,
    pub confidence_interval: (f64, f64),
    pub monte_carlo_results: MonteCarloResults,
}

/// Monte Carlo simulation results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonteCarloResults {
    pub iterations: u32,
    pub mean: f64,
    pub median: f64,
    pub std_deviation: f64,
    pub percentiles: HashMap<u8, f64>, // percentile -> value
    pub value_at_risk_95: f64,
    pub conditional_value_at_risk: f64,
}

/// Individual technique risk assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechniqueRisk {
    pub technique_id: String,
    pub technique_name: String,
    pub tactic: MitreTactic,
    pub likelihood: LikelihoodAssessment,
    pub impact: ImpactAssessment,
    pub risk_score: f64,
    pub risk_level: RiskLevel,
    pub contributing_factors: Vec<RiskFactor>,
    pub mitigating_factors: Vec<MitigatingFactor>,
    pub threat_sources: Vec<String>,
    pub affected_assets: Vec<String>,
    pub attack_vectors: Vec<AttackVector>,
    pub detection_capability: DetectionCapability,
    pub response_capability: ResponseCapability,
}

/// Likelihood assessment details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LikelihoodAssessment {
    pub likelihood_score: f64,
    pub likelihood_level: LikelihoodLevel,
    pub threat_event_frequency: f64,
    pub threat_capability: f64,
    pub vulnerability_exploitability: f64,
    pub environmental_factors: f64,
    pub historical_frequency: Option<f64>,
    pub expert_judgment: Option<f64>,
}

/// Likelihood levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum LikelihoodLevel {
    VeryLow,
    Low,
    Medium,
    High,
    VeryHigh,
    AlmostCertain,
}

/// Impact assessment details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactAssessment {
    pub impact_score: f64,
    pub impact_level: ImpactLevel,
    pub impact_areas: HashMap<ImpactArea, f64>,
    pub financial_impact: FinancialImpact,
    pub operational_impact: OperationalImpact,
    pub strategic_impact: StrategicImpact,
    pub compliance_impact: ComplianceImpact,
    pub reputation_impact: ReputationImpact,
}

/// Impact levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum ImpactLevel {
    Negligible,
    Minor,
    Moderate,
    Major,
    Severe,
    Catastrophic,
}

/// Financial impact details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinancialImpact {
    pub direct_costs: f64,
    pub indirect_costs: f64,
    pub opportunity_costs: f64,
    pub recovery_costs: f64,
    pub legal_costs: f64,
    pub regulatory_fines: f64,
    pub total_financial_impact: f64,
}

/// Operational impact details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OperationalImpact {
    pub service_downtime: f64, // hours
    pub performance_degradation: f64,
    pub process_disruption: f64,
    pub productivity_loss: f64,
    pub customer_impact: f64,
}

/// Strategic impact details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrategicImpact {
    pub competitive_advantage_loss: f64,
    pub market_position_impact: f64,
    pub innovation_capability_impact: f64,
    pub partnership_impact: f64,
    pub growth_opportunity_impact: f64,
}

/// Compliance impact details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceImpact {
    pub regulatory_violations: Vec<String>,
    pub compliance_gaps: Vec<String>,
    pub audit_findings: u32,
    pub certification_risk: f64,
    pub legal_exposure: f64,
}

/// Reputation impact details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReputationImpact {
    pub brand_damage: f64,
    pub customer_trust_impact: f64,
    pub stakeholder_confidence: f64,
    pub media_attention_risk: f64,
    pub social_media_impact: f64,
}

/// Risk contributing factors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFactor {
    pub factor_id: String,
    pub factor_name: String,
    pub factor_type: RiskFactorType,
    pub contribution_weight: f64,
    pub current_state: f64,
    pub trend: TrendDirection,
    pub controllability: f64,
    pub time_sensitivity: f64,
}

/// Risk factor types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum RiskFactorType {
    Environmental,
    Organizational,
    Technical,
    Human,
    Process,
    External,
    Regulatory,
    Economic,
}

/// Trend directions
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum TrendDirection {
    Improving,
    Stable,
    Deteriorating,
    Unknown,
}

/// Mitigating factors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MitigatingFactor {
    pub factor_id: String,
    pub factor_name: String,
    pub mitigation_effectiveness: f64,
    pub implementation_status: ImplementationStatus,
    pub coverage_percentage: f64,
    pub maturity_level: ControlMaturity,
    pub maintenance_quality: f64,
}

/// Implementation status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ImplementationStatus {
    NotImplemented,
    InProgress,
    Implemented,
    Operational,
    Optimized,
    Decommissioned,
}

/// Attack vector details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackVector {
    pub vector_id: String,
    pub vector_name: String,
    pub vector_type: VectorType,
    pub accessibility: f64,
    pub complexity: f64,
    pub privileges_required: f64,
    pub user_interaction: f64,
    pub attack_surface: f64,
}

/// Attack vector types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum VectorType {
    Network,
    AdjacentNetwork,
    Local,
    Physical,
    Social,
    SupplyChain,
    Insider,
}

/// Detection capability assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionCapability {
    pub detection_score: f64,
    pub detection_coverage: f64,
    pub detection_accuracy: f64,
    pub detection_speed: f64,
    pub false_positive_rate: f64,
    pub false_negative_rate: f64,
    pub monitoring_tools: Vec<MonitoringTool>,
}

/// Monitoring tool details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoringTool {
    pub tool_name: String,
    pub tool_type: String,
    pub effectiveness: f64,
    pub coverage: f64,
    pub integration_quality: f64,
}

/// Response capability assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseCapability {
    pub response_score: f64,
    pub response_time: f64, // minutes
    pub containment_capability: f64,
    pub eradication_capability: f64,
    pub recovery_capability: f64,
    pub coordination_effectiveness: f64,
    pub resource_availability: f64,
}

/// Aggregated risk analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AggregatedRisks {
    pub risk_by_tactic: HashMap<MitreTactic, f64>,
    pub risk_by_category: HashMap<RiskCategory, f64>,
    pub risk_by_asset: HashMap<String, f64>,
    pub risk_by_threat_actor: HashMap<String, f64>,
    pub top_risks: Vec<TopRisk>,
    pub risk_correlation_matrix: RiskCorrelationMatrix,
    pub portfolio_risk_metrics: PortfolioRiskMetrics,
}

/// Top risk identification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TopRisk {
    pub rank: u32,
    pub technique_id: String,
    pub technique_name: String,
    pub risk_score: f64,
    pub impact_potential: f64,
    pub likelihood: f64,
    pub key_drivers: Vec<String>,
}

/// Risk correlation analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskCorrelationMatrix {
    pub correlations: HashMap<String, HashMap<String, f64>>,
    pub strong_correlations: Vec<RiskCorrelation>,
    pub risk_clusters: Vec<RiskCluster>,
}

/// Risk correlation details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskCorrelation {
    pub technique1: String,
    pub technique2: String,
    pub correlation_coefficient: f64,
    pub relationship_type: CorrelationType,
    pub shared_factors: Vec<String>,
}

/// Correlation types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CorrelationType {
    Causal,
    Sequential,
    Parallel,
    Competitive,
    Complementary,
}

/// Risk clusters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskCluster {
    pub cluster_id: String,
    pub cluster_name: String,
    pub techniques: Vec<String>,
    pub cluster_risk_score: f64,
    pub cluster_characteristics: Vec<String>,
}

/// Portfolio risk metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortfolioRiskMetrics {
    pub total_risk_exposure: f64,
    pub diversification_ratio: f64,
    pub concentration_risk: f64,
    pub tail_risk: f64,
    pub risk_adjusted_return: f64,
    pub sharpe_ratio: f64,
}

/// Risk trend analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskTrend {
    pub timestamp: DateTime<Utc>,
    pub technique_id: String,
    pub risk_score: f64,
    pub trend_direction: TrendDirection,
    pub velocity: f64,
    pub acceleration: f64,
    pub contributing_events: Vec<String>,
}

/// Risk recommendations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskRecommendation {
    pub recommendation_id: String,
    pub recommendation_type: RecommendationType,
    pub priority: Priority,
    pub title: String,
    pub description: String,
    pub rationale: String,
    pub affected_techniques: Vec<String>,
    pub expected_risk_reduction: f64,
    pub implementation_cost: f64,
    pub implementation_effort: f64,
    pub implementation_timeline: String,
    pub prerequisites: Vec<String>,
    pub success_metrics: Vec<String>,
    pub roi_analysis: ROIAnalysis,
}

/// Recommendation types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum RecommendationType {
    TreatmentPlan,
    ControlImplementation,
    ProcessImprovement,
    TechnologyUpgrade,
    TrainingProgram,
    PolicyUpdate,
    ArchitectureChange,
    VendorSelection,
}

/// Priority levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
    Emergency,
}

/// ROI analysis for recommendations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ROIAnalysis {
    pub investment_cost: f64,
    pub expected_savings: f64,
    pub risk_reduction_value: f64,
    pub payback_period: f64, // months
    pub net_present_value: f64,
    pub internal_rate_of_return: f64,
    pub cost_benefit_ratio: f64,
}

/// Compliance mapping
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceMapping {
    pub framework_name: String,
    pub control_id: String,
    pub control_description: String,
    pub mapped_techniques: Vec<String>,
    pub compliance_gap: f64,
    pub remediation_effort: f64,
}

/// Business impact analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessImpactAnalysis {
    pub business_functions: Vec<BusinessFunction>,
    pub critical_dependencies: Vec<CriticalDependency>,
    pub recovery_objectives: RecoveryObjectives,
    pub impact_scenarios: Vec<ImpactScenario>,
}

/// Business function profile
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessFunction {
    pub function_id: String,
    pub function_name: String,
    pub criticality: FunctionCriticality,
    pub dependencies: Vec<String>,
    pub recovery_time_objective: f64, // hours
    pub recovery_point_objective: f64, // hours
    pub maximum_tolerable_downtime: f64, // hours
}

/// Function criticality levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum FunctionCriticality {
    Support,
    Important,
    Essential,
    Critical,
    Vital,
}

/// Critical dependencies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CriticalDependency {
    pub dependency_id: String,
    pub dependency_name: String,
    pub dependency_type: DependencyType,
    pub criticality: AssetCriticality,
    pub single_point_of_failure: bool,
    pub backup_availability: bool,
}

/// Dependency types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DependencyType {
    Technology,
    Personnel,
    Facility,
    Supplier,
    Process,
    Information,
}

/// Recovery objectives
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryObjectives {
    pub recovery_time_objective: f64, // hours
    pub recovery_point_objective: f64, // hours
    pub maximum_tolerable_downtime: f64, // hours
    pub minimum_business_continuity_objective: f64,
}

/// Impact scenarios
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactScenario {
    pub scenario_id: String,
    pub scenario_name: String,
    pub scenario_description: String,
    pub probability: f64,
    pub impact_magnitude: f64,
    pub affected_functions: Vec<String>,
    pub cascading_effects: Vec<String>,
}

/// Uncertainty analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UncertaintyAnalysis {
    pub uncertainty_sources: Vec<UncertaintySource>,
    pub confidence_levels: HashMap<String, f64>,
    pub uncertainty_propagation: UncertaintyPropagation,
    pub sensitivity_to_assumptions: Vec<AssumptionSensitivity>,
}

/// Sources of uncertainty
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UncertaintySource {
    pub source_id: String,
    pub source_name: String,
    pub uncertainty_type: UncertaintyType,
    pub magnitude: f64,
    pub affected_parameters: Vec<String>,
    pub mitigation_strategies: Vec<String>,
}

/// Uncertainty types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum UncertaintyType {
    Aleatory,    // Natural randomness
    Epistemic,   // Knowledge uncertainty
    Model,       // Model uncertainty
    Parameter,   // Parameter uncertainty
    Data,        // Data uncertainty
}

/// Uncertainty propagation analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UncertaintyPropagation {
    pub input_uncertainties: HashMap<String, f64>,
    pub output_uncertainty: f64,
    pub uncertainty_contributions: HashMap<String, f64>,
    pub dominant_uncertainties: Vec<String>,
}

/// Assumption sensitivity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssumptionSensitivity {
    pub assumption_id: String,
    pub assumption_description: String,
    pub baseline_value: f64,
    pub sensitivity_coefficient: f64,
    pub impact_on_results: f64,
}

/// Sensitivity analysis results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SensitivityAnalysis {
    pub parameter_sensitivities: HashMap<String, f64>,
    pub tornado_chart_data: Vec<TornadoChartEntry>,
    pub elasticity_measures: HashMap<String, f64>,
    pub break_even_analysis: Vec<BreakEvenPoint>,
}

/// Tornado chart entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TornadoChartEntry {
    pub parameter_name: String,
    pub low_impact: f64,
    pub high_impact: f64,
    pub sensitivity_range: f64,
}

/// Break-even analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BreakEvenPoint {
    pub parameter_name: String,
    pub break_even_value: f64,
    pub current_value: f64,
    pub safety_margin: f64,
}

/// Assessment metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssessmentMetadata {
    pub assessor: String,
    pub assessment_version: String,
    pub assessment_duration: u64, // seconds
    pub data_sources: Vec<String>,
    pub assumptions: Vec<String>,
    pub limitations: Vec<String>,
    pub next_review_date: DateTime<Utc>,
    pub approval_status: ApprovalStatus,
}

/// Approval status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ApprovalStatus {
    Draft,
    InReview,
    Approved,
    Published,
    Archived,
}

/// Main risk assessment calculator
pub struct RiskAssessmentCalculator {
    assessment_history: Vec<RiskAssessment>,
    risk_models: HashMap<String, RiskModel>,
    calibration_data: CalibrationData,
}

/// Risk calculation model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskModel {
    pub model_id: String,
    pub model_name: String,
    pub methodology: RiskMethodology,
    pub parameters: HashMap<String, f64>,
    pub weights: HashMap<String, f64>,
    pub formulas: HashMap<String, String>,
    pub validation_metrics: ValidationMetrics,
}

/// Model validation metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationMetrics {
    pub accuracy: f64,
    pub precision: f64,
    pub recall: f64,
    pub f1_score: f64,
    pub auc_roc: f64,
    pub calibration_score: f64,
}

/// Calibration data for model tuning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalibrationData {
    pub historical_incidents: Vec<HistoricalIncident>,
    pub benchmark_data: Vec<BenchmarkData>,
    pub expert_opinions: Vec<ExpertOpinion>,
}

/// Historical incident data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoricalIncident {
    pub incident_id: String,
    pub date: DateTime<Utc>,
    pub techniques_used: Vec<String>,
    pub actual_impact: f64,
    pub estimated_likelihood: f64,
    pub lessons_learned: Vec<String>,
}

/// Benchmark data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkData {
    pub source: String,
    pub industry: String,
    pub organization_size: String,
    pub technique_id: String,
    pub frequency: f64,
    pub impact: f64,
    pub confidence: f64,
}

/// Expert opinion data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpertOpinion {
    pub expert_id: String,
    pub expertise_area: String,
    pub technique_id: String,
    pub likelihood_estimate: f64,
    pub impact_estimate: f64,
    pub confidence: f64,
    pub rationale: String,
}

impl RiskAssessmentCalculator {
    /// Create a new risk assessment calculator
    pub fn new() -> Self {
        Self {
            assessment_history: Vec::new(),
            risk_models: HashMap::new(),
            calibration_data: CalibrationData {
                historical_incidents: Vec::new(),
                benchmark_data: Vec::new(),
                expert_opinions: Vec::new(),
            },
        }
    }

    /// Perform comprehensive risk assessment
    pub fn assess_risk(&mut self, scope: AssessmentScope, methodology: RiskMethodology) -> RiskAssessment {
        let assessment_id = uuid::Uuid::new_v4().to_string();
        let timestamp = Utc::now();

        // Calculate technique risks
        let technique_risks = self.calculate_technique_risks(&scope, &methodology);

        // Aggregate risks
        let aggregated_risks = self.aggregate_risks(&technique_risks);

        // Calculate overall risk scores
        let risk_scores = self.calculate_risk_scores(&technique_risks, &methodology);

        // Analyze trends
        let risk_trends = self.analyze_risk_trends(&technique_risks);

        // Generate recommendations
        let recommendations = self.generate_recommendations(&technique_risks, &aggregated_risks);

        // Map to compliance frameworks
        let compliance_mapping = self.map_compliance_requirements(&technique_risks);

        // Perform business impact analysis
        let business_impact = self.analyze_business_impact(&scope, &technique_risks);

        // Conduct uncertainty analysis
        let uncertainty_analysis = self.analyze_uncertainty(&technique_risks);

        // Perform sensitivity analysis
        let sensitivity_analysis = self.perform_sensitivity_analysis(&technique_risks);

        // Create metadata
        let assessment_metadata = AssessmentMetadata {
            assessor: "Phantom Risk Calculator".to_string(),
            assessment_version: "1.0".to_string(),
            assessment_duration: 0, // Will be updated
            data_sources: vec!["MITRE ATT&CK".to_string(), "Internal Data".to_string()],
            assumptions: vec!["Standard threat landscape".to_string()],
            limitations: vec!["Based on available data".to_string()],
            next_review_date: timestamp + chrono::Duration::days(90),
            approval_status: ApprovalStatus::Draft,
        };

        let assessment = RiskAssessment {
            assessment_id,
            assessment_name: format!("Risk Assessment {}", timestamp.format("%Y-%m-%d")),
            timestamp,
            methodology,
            framework: RiskFramework::NIST_CSF,
            scope,
            risk_scores,
            technique_risks,
            aggregated_risks,
            risk_trends,
            recommendations,
            compliance_mapping,
            business_impact,
            uncertainty_analysis,
            sensitivity_analysis,
            assessment_metadata,
        };

        self.assessment_history.push(assessment.clone());
        assessment
    }

    /// Calculate risk for individual techniques
    fn calculate_technique_risks(&self, scope: &AssessmentScope, methodology: &RiskMethodology) -> Vec<TechniqueRisk> {
        let mut technique_risks = Vec::new();

        for technique_id in &scope.included_techniques {
            let likelihood = self.assess_likelihood(technique_id, scope);
            let impact = self.assess_impact(technique_id, scope);
            let risk_score = self.calculate_risk_score(&likelihood, &impact, methodology);

            let technique_risk = TechniqueRisk {
                technique_id: technique_id.clone(),
                technique_name: format!("Technique {}", technique_id),
                tactic: MitreTactic::Discovery, // Placeholder
                likelihood,
                impact,
                risk_score,
                risk_level: self.determine_risk_level(risk_score),
                contributing_factors: Vec::new(),
                mitigating_factors: Vec::new(),
                threat_sources: Vec::new(),
                affected_assets: scope.target_assets.iter().map(|a| a.asset_id.clone()).collect(),
                attack_vectors: Vec::new(),
                detection_capability: DetectionCapability {
                    detection_score: 0.7,
                    detection_coverage: 0.8,
                    detection_accuracy: 0.75,
                    detection_speed: 0.6,
                    false_positive_rate: 0.1,
                    false_negative_rate: 0.15,
                    monitoring_tools: Vec::new(),
                },
                response_capability: ResponseCapability {
                    response_score: 0.65,
                    response_time: 30.0,
                    containment_capability: 0.7,
                    eradication_capability: 0.6,
                    recovery_capability: 0.8,
                    coordination_effectiveness: 0.75,
                    resource_availability: 0.7,
                },
            };

            technique_risks.push(technique_risk);
        }

        technique_risks
    }

    /// Assess likelihood for a technique
    fn assess_likelihood(&self, _technique_id: &str, _scope: &AssessmentScope) -> LikelihoodAssessment {
        // Placeholder implementation
        LikelihoodAssessment {
            likelihood_score: 0.6,
            likelihood_level: LikelihoodLevel::Medium,
            threat_event_frequency: 0.5,
            threat_capability: 0.7,
            vulnerability_exploitability: 0.8,
            environmental_factors: 0.6,
            historical_frequency: Some(0.4),
            expert_judgment: Some(0.65),
        }
    }

    /// Assess impact for a technique
    fn assess_impact(&self, _technique_id: &str, scope: &AssessmentScope) -> ImpactAssessment {
        // Calculate average asset value for impact estimation
        let avg_asset_value = scope.target_assets.iter()
            .map(|a| a.value.total_value)
            .sum::<f64>() / scope.target_assets.len().max(1) as f64;

        ImpactAssessment {
            impact_score: 0.7,
            impact_level: ImpactLevel::Major,
            impact_areas: HashMap::new(),
            financial_impact: FinancialImpact {
                direct_costs: avg_asset_value * 0.1,
                indirect_costs: avg_asset_value * 0.05,
                opportunity_costs: avg_asset_value * 0.03,
                recovery_costs: avg_asset_value * 0.02,
                legal_costs: avg_asset_value * 0.01,
                regulatory_fines: avg_asset_value * 0.02,
                total_financial_impact: avg_asset_value * 0.23,
            },
            operational_impact: OperationalImpact {
                service_downtime: 4.0,
                performance_degradation: 0.3,
                process_disruption: 0.4,
                productivity_loss: 0.2,
                customer_impact: 0.3,
            },
            strategic_impact: StrategicImpact {
                competitive_advantage_loss: 0.2,
                market_position_impact: 0.15,
                innovation_capability_impact: 0.1,
                partnership_impact: 0.1,
                growth_opportunity_impact: 0.15,
            },
            compliance_impact: ComplianceImpact {
                regulatory_violations: vec!["GDPR".to_string()],
                compliance_gaps: vec!["Data protection".to_string()],
                audit_findings: 3,
                certification_risk: 0.3,
                legal_exposure: 0.4,
            },
            reputation_impact: ReputationImpact {
                brand_damage: 0.4,
                customer_trust_impact: 0.5,
                stakeholder_confidence: 0.3,
                media_attention_risk: 0.6,
                social_media_impact: 0.4,
            },
        }
    }

    /// Calculate risk score using specified methodology
    fn calculate_risk_score(&self, likelihood: &LikelihoodAssessment, impact: &ImpactAssessment, methodology: &RiskMethodology) -> f64 {
        match methodology {
            RiskMethodology::NIST => likelihood.likelihood_score * impact.impact_score,
            RiskMethodology::ISO27005 => (likelihood.likelihood_score + impact.impact_score) / 2.0,
            RiskMethodology::FAIR => self.calculate_fair_risk(likelihood, impact),
            _ => likelihood.likelihood_score * impact.impact_score, // Default
        }
    }

    /// Calculate FAIR-based risk score
    fn calculate_fair_risk(&self, likelihood: &LikelihoodAssessment, impact: &ImpactAssessment) -> f64 {
        let threat_event_frequency = likelihood.threat_event_frequency;
        let vulnerability_percentage = likelihood.vulnerability_exploitability;
        let loss_magnitude = impact.financial_impact.total_financial_impact;
        
        threat_event_frequency * vulnerability_percentage * (loss_magnitude / 1000000.0).min(1.0)
    }

    /// Determine risk level based on score
    fn determine_risk_level(&self, risk_score: f64) -> RiskLevel {
        if risk_score >= 0.9 {
            RiskLevel::Catastrophic
        } else if risk_score >= 0.7 {
            RiskLevel::Critical
        } else if risk_score >= 0.5 {
            RiskLevel::High
        } else if risk_score >= 0.3 {
            RiskLevel::Medium
        } else if risk_score >= 0.1 {
            RiskLevel::Low
        } else {
            RiskLevel::Negligible
        }
    }

    /// Calculate overall risk scores
    fn calculate_risk_scores(&self, technique_risks: &[TechniqueRisk], methodology: &RiskMethodology) -> RiskScores {
        let overall_risk = technique_risks.iter().map(|tr| tr.risk_score).fold(0.0f64, |acc, x| acc.max(x));
        let avg_risk = technique_risks.iter().map(|tr| tr.risk_score).sum::<f64>() / technique_risks.len().max(1) as f64;
        
        // Monte Carlo simulation (simplified)
        let iterations = 10000;
        let mut results = Vec::new();
        for _ in 0..iterations {
            // Simulate risk score with normal distribution
            let simulated_risk = avg_risk + (rand::random::<f64>() - 0.5) * 0.2;
            results.push(simulated_risk.max(0.0).min(1.0));
        }
        
        results.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let median = results[iterations / 2];
        let p95 = results[(iterations as f64 * 0.95) as usize];
        let std_dev = self.calculate_std_deviation(&results, avg_risk);

        let mut percentiles = HashMap::new();
        percentiles.insert(50, median);
        percentiles.insert(90, results[(iterations as f64 * 0.90) as usize]);
        percentiles.insert(95, p95);
        percentiles.insert(99, results[(iterations as f64 * 0.99) as usize]);

        RiskScores {
            overall_risk_score: overall_risk,
            inherent_risk: overall_risk,
            residual_risk: overall_risk * 0.7, // Assuming 30% risk reduction from controls
            risk_appetite: 0.3,
            risk_tolerance: 0.5,
            risk_level: self.determine_risk_level(overall_risk),
            risk_rating: format!("{:?}", self.determine_risk_level(overall_risk)),
            confidence_interval: (avg_risk - 1.96 * std_dev, avg_risk + 1.96 * std_dev),
            monte_carlo_results: MonteCarloResults {
                iterations: iterations as u32,
                mean: avg_risk,
                median,
                std_deviation: std_dev,
                percentiles,
                value_at_risk_95: p95,
                conditional_value_at_risk: results[(iterations as f64 * 0.95) as usize..].iter().sum::<f64>() / (iterations as f64 * 0.05),
            },
        }
    }

    /// Calculate standard deviation
    fn calculate_std_deviation(&self, values: &[f64], mean: f64) -> f64 {
        let variance = values.iter().map(|x| (x - mean).powi(2)).sum::<f64>() / values.len() as f64;
        variance.sqrt()
    }

    /// Aggregate risks by various dimensions
    fn aggregate_risks(&self, technique_risks: &[TechniqueRisk]) -> AggregatedRisks {
        let mut risk_by_tactic = HashMap::new();
        let mut top_risks = Vec::new();

        // Aggregate by tactic
        for risk in technique_risks {
            let current = risk_by_tactic.get(&risk.tactic).unwrap_or(&0.0);
            risk_by_tactic.insert(risk.tactic.clone(), if current > &risk.risk_score { *current } else { risk.risk_score });
        }

        // Identify top risks
        let mut sorted_risks: Vec<_> = technique_risks.iter().collect();
        sorted_risks.sort_by(|a, b| b.risk_score.partial_cmp(&a.risk_score).unwrap());
        
        for (i, risk) in sorted_risks.iter().take(10).enumerate() {
            top_risks.push(TopRisk {
                rank: (i + 1) as u32,
                technique_id: risk.technique_id.clone(),
                technique_name: risk.technique_name.clone(),
                risk_score: risk.risk_score,
                impact_potential: risk.impact.impact_score,
                likelihood: risk.likelihood.likelihood_score,
                key_drivers: vec!["High impact".to_string(), "Medium likelihood".to_string()],
            });
        }

        AggregatedRisks {
            risk_by_tactic,
            risk_by_category: HashMap::new(),
            risk_by_asset: HashMap::new(),
            risk_by_threat_actor: HashMap::new(),
            top_risks,
            risk_correlation_matrix: RiskCorrelationMatrix {
                correlations: HashMap::new(),
                strong_correlations: Vec::new(),
                risk_clusters: Vec::new(),
            },
            portfolio_risk_metrics: PortfolioRiskMetrics {
                total_risk_exposure: technique_risks.iter().map(|r| r.risk_score).sum(),
                diversification_ratio: 0.8,
                concentration_risk: 0.3,
                tail_risk: 0.15,
                risk_adjusted_return: 0.12,
                sharpe_ratio: 1.2,
            },
        }
    }

    /// Analyze risk trends
    fn analyze_risk_trends(&self, technique_risks: &[TechniqueRisk]) -> Vec<RiskTrend> {
        technique_risks.iter().map(|risk| {
            RiskTrend {
                timestamp: Utc::now(),
                technique_id: risk.technique_id.clone(),
                risk_score: risk.risk_score,
                trend_direction: TrendDirection::Stable,
                velocity: 0.0,
                acceleration: 0.0,
                contributing_events: Vec::new(),
            }
        }).collect()
    }

    /// Generate risk recommendations
    fn generate_recommendations(&self, technique_risks: &[TechniqueRisk], _aggregated: &AggregatedRisks) -> Vec<RiskRecommendation> {
        let mut recommendations = Vec::new();

        for risk in technique_risks.iter().filter(|r| r.risk_score > 0.7) {
            recommendations.push(RiskRecommendation {
                recommendation_id: uuid::Uuid::new_v4().to_string(),
                recommendation_type: RecommendationType::ControlImplementation,
                priority: Priority::High,
                title: format!("Mitigate {}", risk.technique_name),
                description: format!("Implement controls to reduce risk from {}", risk.technique_id),
                rationale: "High risk score requires immediate attention".to_string(),
                affected_techniques: vec![risk.technique_id.clone()],
                expected_risk_reduction: 0.4,
                implementation_cost: 50000.0,
                implementation_effort: 160.0, // hours
                implementation_timeline: "3-6 months".to_string(),
                prerequisites: vec!["Budget approval".to_string()],
                success_metrics: vec!["Risk score reduction".to_string()],
                roi_analysis: ROIAnalysis {
                    investment_cost: 50000.0,
                    expected_savings: 200000.0,
                    risk_reduction_value: 150000.0,
                    payback_period: 3.0,
                    net_present_value: 100000.0,
                    internal_rate_of_return: 0.25,
                    cost_benefit_ratio: 3.0,
                },
            });
        }

        recommendations
    }

    /// Map to compliance requirements
    fn map_compliance_requirements(&self, technique_risks: &[TechniqueRisk]) -> Vec<ComplianceMapping> {
        technique_risks.iter().map(|risk| {
            ComplianceMapping {
                framework_name: "NIST CSF".to_string(),
                control_id: "PR.AC-1".to_string(),
                control_description: "Identities and credentials are issued, managed, verified, revoked, and audited".to_string(),
                mapped_techniques: vec![risk.technique_id.clone()],
                compliance_gap: 0.3,
                remediation_effort: 40.0,
            }
        }).collect()
    }

    /// Analyze business impact
    fn analyze_business_impact(&self, scope: &AssessmentScope, _technique_risks: &[TechniqueRisk]) -> BusinessImpactAnalysis {
        let business_functions = vec![
            BusinessFunction {
                function_id: "BF001".to_string(),
                function_name: "Customer Operations".to_string(),
                criticality: FunctionCriticality::Critical,
                dependencies: scope.target_assets.iter().map(|a| a.asset_id.clone()).collect(),
                recovery_time_objective: 4.0,
                recovery_point_objective: 1.0,
                maximum_tolerable_downtime: 8.0,
            },
        ];

        BusinessImpactAnalysis {
            business_functions,
            critical_dependencies: Vec::new(),
            recovery_objectives: RecoveryObjectives {
                recovery_time_objective: 4.0,
                recovery_point_objective: 1.0,
                maximum_tolerable_downtime: 8.0,
                minimum_business_continuity_objective: 0.8,
            },
            impact_scenarios: Vec::new(),
        }
    }

    /// Analyze uncertainty
    fn analyze_uncertainty(&self, _technique_risks: &[TechniqueRisk]) -> UncertaintyAnalysis {
        UncertaintyAnalysis {
            uncertainty_sources: Vec::new(),
            confidence_levels: HashMap::new(),
            uncertainty_propagation: UncertaintyPropagation {
                input_uncertainties: HashMap::new(),
                output_uncertainty: 0.2,
                uncertainty_contributions: HashMap::new(),
                dominant_uncertainties: Vec::new(),
            },
            sensitivity_to_assumptions: Vec::new(),
        }
    }

    /// Perform sensitivity analysis
    fn perform_sensitivity_analysis(&self, _technique_risks: &[TechniqueRisk]) -> SensitivityAnalysis {
        SensitivityAnalysis {
            parameter_sensitivities: HashMap::new(),
            tornado_chart_data: Vec::new(),
            elasticity_measures: HashMap::new(),
            break_even_analysis: Vec::new(),
        }
    }

    /// Get assessment history
    pub fn get_assessment_history(&self) -> &[RiskAssessment] {
        &self.assessment_history
    }
}

impl Default for RiskAssessmentCalculator {
    fn default() -> Self {
        Self::new()
    }
}

/// NAPI wrapper for JavaScript bindings
#[napi]
pub struct RiskAssessmentCalculatorNapi {
    inner: RiskAssessmentCalculator,
}

#[napi]
impl RiskAssessmentCalculatorNapi {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            inner: RiskAssessmentCalculator::new(),
        }
    }

    #[napi]
    pub fn assess_risk(&mut self, scope_json: String, methodology: String) -> Result<String> {
        let scope: AssessmentScope = serde_json::from_str(&scope_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse scope: {}", e)))?;
        
        let methodology: RiskMethodology = serde_json::from_str(&format!("\"{}\"", methodology))
            .map_err(|e| napi::Error::from_reason(format!("Invalid methodology: {}", e)))?;
        
        let assessment = self.inner.assess_risk(scope, methodology);
        serde_json::to_string(&assessment)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize assessment: {}", e)))
    }

    #[napi]
    pub fn get_assessment_history(&self) -> Result<String> {
        serde_json::to_string(self.inner.get_assessment_history())
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize history: {}", e)))
    }
}

// Utility function for random number generation (simplified)
mod rand {
    use std::sync::atomic::{AtomicU64, Ordering};
    
    static SEED: AtomicU64 = AtomicU64::new(1);
    
    pub fn random<T: From<f64>>() -> T {
        let seed = SEED.load(Ordering::Relaxed);
        let next_seed = seed.wrapping_mul(1103515245).wrapping_add(12345);
        SEED.store(next_seed, Ordering::Relaxed);
        T::from((next_seed as f64) / (u64::MAX as f64))
    }
}