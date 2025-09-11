// Shared data models and types
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

// Enhanced types for threat intelligence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchCriteria {
    pub cve_id: Option<String>,
    pub vendor: Option<String>,
    pub product: Option<String>,
    pub severity_min: Option<f64>,
    pub severity_max: Option<f64>,
    pub exploit_available: Option<bool>,
    pub in_the_wild: Option<bool>,
    pub date_range: Option<(DateTime<Utc>, DateTime<Utc>)>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExploitTimeline {
    pub cve_id: String,
    pub disclosure_date: DateTime<Utc>,
    pub first_exploit_date: Option<DateTime<Utc>>,
    pub weaponization_date: Option<DateTime<Utc>>,
    pub mass_exploitation_date: Option<DateTime<Utc>>,
    pub patch_available_date: Option<DateTime<Utc>>,
    pub exploitation_stages: Vec<ExploitationStage>,
    pub risk_progression: Vec<RiskTimepoint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExploitationStage {
    pub stage: String,
    pub date: DateTime<Utc>,
    pub description: String,
    pub threat_actors: Vec<String>,
    pub tools_used: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskTimepoint {
    pub date: DateTime<Utc>,
    pub risk_score: f64,
    pub exploitation_likelihood: f64,
    pub impact_magnitude: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemediationStrategy {
    pub cve_id: String,
    pub priority: RemediationPriority,
    pub immediate_actions: Vec<RemediationAction>,
    pub short_term_actions: Vec<RemediationAction>,
    pub long_term_actions: Vec<RemediationAction>,
    pub compensating_controls: Vec<CompensatingControl>,
    pub estimated_effort: EstimatedEffort,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RemediationPriority {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemediationAction {
    pub action_type: String,
    pub description: String,
    pub estimated_time: String,
    pub resources_required: Vec<String>,
    pub dependencies: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompensatingControl {
    pub control_type: String,
    pub description: String,
    pub effectiveness: f64,
    pub implementation_cost: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EstimatedEffort {
    pub hours: u32,
    pub cost: Option<f64>,
    pub complexity: String,
    pub skills_required: Vec<String>,
}

// Threat Intelligence auxiliary types
#[derive(Debug, Clone)]
pub struct ThreatFeed {
    pub id: String,
    pub name: String,
    pub reliability: f64,
    pub last_updated: DateTime<Utc>,
    pub feed_type: String,
}

#[derive(Debug, Clone)]
pub struct CorrelationRule {
    pub id: String,
    pub name: String,
    pub conditions: Vec<String>,
    pub confidence_boost: f64,
}

#[derive(Debug, Clone)]
pub struct ScoringModel {
    pub name: String,
    pub weight: f64,
    pub factors: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct PredictionModel {
    pub model_type: String,
    pub accuracy: f64,
    pub last_trained: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct RemediationTemplate {
    pub vulnerability_pattern: String,
    pub actions: Vec<RemediationAction>,
    pub success_rate: f64,
}

// Core CVE types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum CVSSVersion {
    #[serde(rename = "2.0")]
    V2,
    #[serde(rename = "3.0")]
    V3,
    #[serde(rename = "3.1")]
    V31,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum CVSSSeverity {
    None,
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum CVSSAttackVector {
    Network,
    Adjacent,
    Local,
    Physical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVSSMetrics {
    pub version: CVSSVersion,
    pub base_score: f64,
    pub severity: CVSSSeverity,
    pub attack_vector: CVSSAttackVector,
    pub attack_complexity: String,
    pub privileges_required: String,
    pub user_interaction: String,
    pub scope: String,
    pub confidentiality_impact: String,
    pub integrity_impact: String,
    pub availability_impact: String,
    pub exploitability_score: Option<f64>,
    pub impact_score: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CWE {
    pub id: String,
    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AffectedProduct {
    pub vendor: String,
    pub product: String,
    pub version: String,
    pub version_start_including: Option<String>,
    pub version_end_including: Option<String>,
    pub version_start_excluding: Option<String>,
    pub version_end_excluding: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Reference {
    pub url: String,
    pub source: String,
    pub tags: Vec<String>,
}

// CVE 5.0 Schema Implementation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVE {
    #[serde(rename = "dataType")]
    pub data_type: String, // Should be "CVE_RECORD"
    #[serde(rename = "dataVersion")]
    pub data_version: String, // Should be "5.0"
    #[serde(rename = "cveMetadata")]
    pub cve_metadata: CVEMetadata,
    pub containers: CVEContainers,
}

impl CVE {
    /// Get the CVE ID for backward compatibility
    pub fn id(&self) -> &str {
        &self.cve_metadata.cve_id
    }

    /// Get the description for backward compatibility
    pub fn description(&self) -> String {
        if let Some(cna) = &self.containers.cna {
            if let Some(desc) = cna.descriptions.first() {
                return desc.value.clone();
            }
        }
        if let Some(adp) = &self.containers.adp {
            if let Some(first_adp) = adp.first() {
                if let Some(desc) = first_adp.descriptions.first() {
                    return desc.value.clone();
                }
            }
        }
        String::new()
    }

    /// Get the published date for backward compatibility
    pub fn published_date(&self) -> Option<DateTime<Utc>> {
        self.cve_metadata.date_published
    }

    /// Get the last modified date for backward compatibility
    pub fn last_modified_date(&self) -> Option<DateTime<Utc>> {
        self.cve_metadata.date_updated
    }

    /// Get CVSS metrics for backward compatibility
    pub fn cvss_metrics(&self) -> Option<CVSSMetrics> {
        if let Some(cna) = &self.containers.cna {
            if let Some(metrics) = &cna.metrics {
                if let Some(metric) = metrics.first() {
                    if let Some(cvss_v3_1) = &metric.cvss_v3_1 {
                        return Some(CVSSMetrics {
                            version: CVSSVersion::V31,
                            base_score: cvss_v3_1.base_score,
                            severity: cvss_v3_1.base_severity.clone(),
                            attack_vector: cvss_v3_1.attack_vector.clone().unwrap_or(CVSSAttackVector::Network),
                            attack_complexity: cvss_v3_1.attack_complexity.clone().unwrap_or("LOW".to_string()),
                            privileges_required: cvss_v3_1.privileges_required.clone().unwrap_or("NONE".to_string()),
                            user_interaction: cvss_v3_1.user_interaction.clone().unwrap_or("NONE".to_string()),
                            scope: cvss_v3_1.scope.clone().unwrap_or("UNCHANGED".to_string()),
                            confidentiality_impact: cvss_v3_1.confidentiality_impact.clone().unwrap_or("NONE".to_string()),
                            integrity_impact: cvss_v3_1.integrity_impact.clone().unwrap_or("NONE".to_string()),
                            availability_impact: cvss_v3_1.availability_impact.clone().unwrap_or("NONE".to_string()),
                            exploitability_score: None,
                            impact_score: None,
                        });
                    }
                    if let Some(cvss_v3_0) = &metric.cvss_v3_0 {
                        return Some(CVSSMetrics {
                            version: CVSSVersion::V3,
                            base_score: cvss_v3_0.base_score,
                            severity: cvss_v3_0.base_severity.clone(),
                            attack_vector: CVSSAttackVector::Network,
                            attack_complexity: "LOW".to_string(),
                            privileges_required: "NONE".to_string(),
                            user_interaction: "NONE".to_string(),
                            scope: "UNCHANGED".to_string(),
                            confidentiality_impact: "NONE".to_string(),
                            integrity_impact: "NONE".to_string(),
                            availability_impact: "NONE".to_string(),
                            exploitability_score: None,
                            impact_score: None,
                        });
                    }
                }
            }
        }
        None
    }

    /// Get affected products for backward compatibility
    pub fn affected_products(&self) -> Vec<AffectedProduct> {
        let mut products = Vec::new();
        
        if let Some(cna) = &self.containers.cna {
            if let Some(affected) = &cna.affected {
                for item in affected {
                    let version = if let Some(versions) = &item.versions {
                        versions.first().map(|v| v.version.clone()).unwrap_or_default()
                    } else {
                        String::new()
                    };
                    
                    products.push(AffectedProduct {
                        vendor: item.vendor.clone(),
                        product: item.product.clone(),
                        version,
                        version_start_including: None,
                        version_end_including: None,
                        version_start_excluding: None,
                        version_end_excluding: None,
                    });
                }
            }
        }
        
        products
    }

    /// Get references for backward compatibility
    pub fn references(&self) -> Vec<Reference> {
        let mut refs = Vec::new();
        
        if let Some(cna) = &self.containers.cna {
            if let Some(references) = &cna.references {
                for reference in references {
                    refs.push(Reference {
                        url: reference.url.clone(),
                        source: reference.name.clone().unwrap_or_default(),
                        tags: reference.tags.clone().unwrap_or_default(),
                    });
                }
            }
        }
        
        refs
    }

    /// Get status for backward compatibility
    pub fn status(&self) -> String {
        match self.cve_metadata.state {
            CVEState::Published => "published".to_string(),
            CVEState::Reserved => "reserved".to_string(),
            CVEState::Rejected => "rejected".to_string(),
        }
    }

    /// Get assigner for backward compatibility
    pub fn assigner(&self) -> &str {
        &self.cve_metadata.assigner_org_id
    }

    /// Get tags for backward compatibility
    pub fn tags(&self) -> Vec<String> {
        if let Some(cna) = &self.containers.cna {
            return cna.tags.clone().unwrap_or_default();
        }
        Vec::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVEMetadata {
    #[serde(rename = "cveId")]
    pub cve_id: String,
    #[serde(rename = "assignerOrgId")]
    pub assigner_org_id: String,
    #[serde(rename = "assignerShortName", skip_serializing_if = "Option::is_none")]
    pub assigner_short_name: Option<String>,
    #[serde(rename = "datePublished", skip_serializing_if = "Option::is_none")]
    pub date_published: Option<DateTime<Utc>>,
    #[serde(rename = "dateReserved", skip_serializing_if = "Option::is_none")]
    pub date_reserved: Option<DateTime<Utc>>,
    #[serde(rename = "dateUpdated", skip_serializing_if = "Option::is_none")]
    pub date_updated: Option<DateTime<Utc>>,
    pub state: CVEState,
    #[serde(rename = "requesterUserId", skip_serializing_if = "Option::is_none")]
    pub requester_user_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CVEState {
    #[serde(rename = "PUBLISHED")]
    Published,
    #[serde(rename = "RESERVED")]
    Reserved,
    #[serde(rename = "REJECTED")]
    Rejected,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVEContainers {
    pub cna: Option<CVEContainer>,
    pub adp: Option<Vec<CVEContainer>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVEContainer {
    #[serde(rename = "providerMetadata")]
    pub provider_metadata: ProviderMetadata,
    pub descriptions: Vec<CVEDescription>,
    pub affected: Option<Vec<CVEAffected>>,
    pub references: Option<Vec<CVEReference>>,
    pub metrics: Option<Vec<CVEMetric>>,
    #[serde(rename = "problemTypes", skip_serializing_if = "Option::is_none")]
    pub problem_types: Option<Vec<ProblemType>>,
    pub credits: Option<Vec<Credit>>,
    pub impacts: Option<Vec<Impact>>,
    #[serde(rename = "workarounds", skip_serializing_if = "Option::is_none")]
    pub workarounds: Option<Vec<Workaround>>,
    pub solutions: Option<Vec<Solution>>,
    pub exploits: Option<Vec<Exploit>>,
    pub timeline: Option<Vec<TimelineEntry>>,
    #[serde(rename = "datePublic", skip_serializing_if = "Option::is_none")]
    pub date_public: Option<DateTime<Utc>>,
    pub source: Option<Source>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderMetadata {
    #[serde(rename = "orgId")]
    pub org_id: String,
    #[serde(rename = "shortName", skip_serializing_if = "Option::is_none")]
    pub short_name: Option<String>,
    #[serde(rename = "dateUpdated", skip_serializing_if = "Option::is_none")]
    pub date_updated: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVEDescription {
    pub lang: String,
    pub value: String,
    #[serde(rename = "supportingMedia", skip_serializing_if = "Option::is_none")]
    pub supporting_media: Option<Vec<SupportingMedia>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupportingMedia {
    #[serde(rename = "type")]
    pub media_type: String,
    pub base64: Option<bool>,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVEAffected {
    pub vendor: String,
    pub product: String,
    #[serde(rename = "collectionURL", skip_serializing_if = "Option::is_none")]
    pub collection_url: Option<String>,
    #[serde(rename = "packageName", skip_serializing_if = "Option::is_none")]
    pub package_name: Option<String>,
    #[serde(rename = "cpes", skip_serializing_if = "Option::is_none")]
    pub cpes: Option<Vec<String>>,
    pub modules: Option<Vec<String>>,
    #[serde(rename = "programFiles", skip_serializing_if = "Option::is_none")]
    pub program_files: Option<Vec<String>>,
    #[serde(rename = "programRoutines", skip_serializing_if = "Option::is_none")]
    pub program_routines: Option<Vec<ProgramRoutine>>,
    pub platforms: Option<Vec<String>>,
    #[serde(rename = "repo", skip_serializing_if = "Option::is_none")]
    pub repository: Option<String>,
    #[serde(rename = "defaultStatus", skip_serializing_if = "Option::is_none")]
    pub default_status: Option<AffectedStatus>,
    pub versions: Option<Vec<AffectedVersion>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgramRoutine {
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AffectedStatus {
    #[serde(rename = "affected")]
    Affected,
    #[serde(rename = "unaffected")]
    Unaffected,
    #[serde(rename = "unknown")]
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AffectedVersion {
    pub version: String,
    pub status: AffectedStatus,
    #[serde(rename = "versionType", skip_serializing_if = "Option::is_none")]
    pub version_type: Option<String>,
    #[serde(rename = "lessThan", skip_serializing_if = "Option::is_none")]
    pub less_than: Option<String>,
    #[serde(rename = "lessThanOrEqual", skip_serializing_if = "Option::is_none")]
    pub less_than_or_equal: Option<String>,
    pub changes: Option<Vec<VersionChange>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionChange {
    pub at: String,
    pub status: AffectedStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVEReference {
    pub url: String,
    pub name: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVEMetric {
    #[serde(rename = "format")]
    pub format: String,
    pub scenarios: Option<Vec<MetricScenario>>,
    #[serde(rename = "cvssV3_1", skip_serializing_if = "Option::is_none")]
    pub cvss_v3_1: Option<CVSSV31>,
    #[serde(rename = "cvssV3_0", skip_serializing_if = "Option::is_none")]
    pub cvss_v3_0: Option<CVSSV30>,
    #[serde(rename = "cvssV2_0", skip_serializing_if = "Option::is_none")]
    pub cvss_v2_0: Option<CVSSV20>,
    pub other: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricScenario {
    pub lang: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVSSV31 {
    pub version: String, // "3.1"
    #[serde(rename = "vectorString")]
    pub vector_string: String,
    #[serde(rename = "baseScore")]
    pub base_score: f64,
    #[serde(rename = "baseSeverity")]
    pub base_severity: CVSSSeverity,
    #[serde(rename = "attackVector", skip_serializing_if = "Option::is_none")]
    pub attack_vector: Option<CVSSAttackVector>,
    #[serde(rename = "attackComplexity", skip_serializing_if = "Option::is_none")]
    pub attack_complexity: Option<String>,
    #[serde(rename = "privilegesRequired", skip_serializing_if = "Option::is_none")]
    pub privileges_required: Option<String>,
    #[serde(rename = "userInteraction", skip_serializing_if = "Option::is_none")]
    pub user_interaction: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scope: Option<String>,
    #[serde(rename = "confidentialityImpact", skip_serializing_if = "Option::is_none")]
    pub confidentiality_impact: Option<String>,
    #[serde(rename = "integrityImpact", skip_serializing_if = "Option::is_none")]
    pub integrity_impact: Option<String>,
    #[serde(rename = "availabilityImpact", skip_serializing_if = "Option::is_none")]
    pub availability_impact: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVSSV30 {
    pub version: String, // "3.0"
    #[serde(rename = "vectorString")]
    pub vector_string: String,
    #[serde(rename = "baseScore")]
    pub base_score: f64,
    #[serde(rename = "baseSeverity")]
    pub base_severity: CVSSSeverity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVSSV20 {
    pub version: String, // "2.0"
    #[serde(rename = "vectorString")]
    pub vector_string: String,
    #[serde(rename = "baseScore")]
    pub base_score: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProblemType {
    pub descriptions: Vec<ProblemTypeDescription>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProblemTypeDescription {
    pub lang: String,
    pub description: String,
    #[serde(rename = "cweId", skip_serializing_if = "Option::is_none")]
    pub cwe_id: Option<String>,
    #[serde(rename = "type", skip_serializing_if = "Option::is_none")]
    pub problem_type: Option<String>,
    pub references: Option<Vec<CVEReference>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Credit {
    pub lang: String,
    pub value: String,
    #[serde(rename = "type", skip_serializing_if = "Option::is_none")]
    pub credit_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Impact {
    #[serde(rename = "capecId", skip_serializing_if = "Option::is_none")]
    pub capec_id: Option<String>,
    pub descriptions: Vec<CVEDescription>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workaround {
    pub lang: String,
    pub value: String,
    #[serde(rename = "supportingMedia", skip_serializing_if = "Option::is_none")]
    pub supporting_media: Option<Vec<SupportingMedia>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Solution {
    pub lang: String,
    pub value: String,
    #[serde(rename = "supportingMedia", skip_serializing_if = "Option::is_none")]
    pub supporting_media: Option<Vec<SupportingMedia>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Exploit {
    pub lang: String,
    pub value: String,
    #[serde(rename = "supportingMedia", skip_serializing_if = "Option::is_none")]
    pub supporting_media: Option<Vec<SupportingMedia>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEntry {
    pub time: DateTime<Utc>,
    pub lang: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Source {
    pub lang: String,
    pub value: String,
    #[serde(rename = "supportingMedia", skip_serializing_if = "Option::is_none")]
    pub supporting_media: Option<Vec<SupportingMedia>>,
}

// Legacy compatibility structures (deprecated, keep for backward compatibility)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LegacyCVE {
    pub id: String,
    pub description: String,
    pub published_date: DateTime<Utc>,
    pub last_modified_date: DateTime<Utc>,
    pub cvss_metrics: Option<CVSSMetrics>,
    pub cwe: Option<CWE>,
    pub affected_products: Vec<AffectedProduct>,
    pub references: Vec<Reference>,
    pub status: String,
    pub assigner: String,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VulnerabilityAssessment {
    pub exploitability: f64,
    pub impact_score: f64,
    pub risk_level: String,
    pub affected_systems: Vec<String>,
    pub remediation_priority: u32,
    pub exploit_available: bool,
    pub public_exploits: bool,
    pub in_the_wild: bool,
    pub recommendations: Vec<String>,
    pub mitigation_steps: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVEAnalysisResult {
    pub cve: CVE,
    pub assessment: VulnerabilityAssessment,
    pub processing_timestamp: DateTime<Utc>,
    pub related_cves: Vec<String>,
    pub threat_actors: Vec<String>,
    pub campaigns: Vec<String>,
}

// Internal helper types for analysis flow (crate-visible)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct TargetProfile {
    pub(crate) high_value_targets: bool,
    pub(crate) widespread_deployment: bool,
}

#[derive(Debug, Clone)]
pub(crate) struct ExploitStatus {
    pub(crate) exploit_available: bool,
    pub(crate) public_exploits: bool,
    pub(crate) in_the_wild: bool,
}

#[derive(Debug, Clone)]
pub(crate) struct BasicTimeline {
    pub(crate) has_public_exploits: bool,
}
