//! Compliance Mapper Module
//! Advanced compliance mapping capabilities for MITRE ATT&CK framework

use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceResult {
    pub result_id: String,
    pub timestamp: DateTime<Utc>,
    pub framework: String,
    pub controls: Vec<ComplianceControl>,
    pub coverage_score: f64,
    pub gap_analysis: Vec<ComplianceGap>,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceControl {
    pub control_id: String,
    pub control_name: String,
    pub mitre_techniques: Vec<String>,
    pub implementation_status: ImplementationStatus,
    pub maturity_level: u8,
    pub last_assessed: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceGap {
    pub gap_id: String,
    pub mitre_technique: String,
    pub missing_controls: Vec<String>,
    pub risk_level: RiskLevel,
    pub remediation_effort: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ImplementationStatus {
    NotImplemented,
    PartiallyImplemented,
    FullyImplemented,
    UnderReview,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

pub struct ComplianceMapper {
    results: Vec<ComplianceResult>,
    frameworks: HashMap<String, ComplianceFramework>,
    technique_mappings: HashMap<String, Vec<String>>,
    config: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceFramework {
    pub name: String,
    pub version: String,
    pub controls: HashMap<String, FrameworkControl>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FrameworkControl {
    pub id: String,
    pub name: String,
    pub description: String,
    pub requirements: Vec<String>,
    pub implementation_guidance: String,
}

impl ComplianceMapper {
    pub fn new() -> Self {
        let mut mapper = Self {
            results: Vec::new(),
            frameworks: HashMap::new(),
            technique_mappings: HashMap::new(),
            config: HashMap::new(),
        };
        
        mapper.initialize_frameworks();
        mapper
    }

    fn initialize_frameworks(&mut self) {
        // Initialize NIST 800-53 framework
        let nist_controls = HashMap::from([
            ("AC-1".to_string(), FrameworkControl {
                id: "AC-1".to_string(),
                name: "Access Control Policy and Procedures".to_string(),
                description: "Develop, document, and disseminate access control policy and procedures".to_string(),
                requirements: vec![
                    "Establish access control policy".to_string(),
                    "Document procedures".to_string(),
                    "Regular review and updates".to_string(),
                ],
                implementation_guidance: "Implement formal access control policies aligned with business requirements".to_string(),
            }),
            ("SI-4".to_string(), FrameworkControl {
                id: "SI-4".to_string(),
                name: "Information System Monitoring".to_string(),
                description: "Monitor information system events to detect attacks and indicators of potential attacks".to_string(),
                requirements: vec![
                    "Continuous monitoring".to_string(),
                    "Event correlation".to_string(),
                    "Alerting mechanisms".to_string(),
                ],
                implementation_guidance: "Deploy comprehensive monitoring solutions with SIEM integration".to_string(),
            }),
            ("IR-4".to_string(), FrameworkControl {
                id: "IR-4".to_string(),
                name: "Incident Handling".to_string(),
                description: "Implement incident handling capability for security incidents".to_string(),
                requirements: vec![
                    "Incident response plan".to_string(),
                    "Response team".to_string(),
                    "Incident tracking".to_string(),
                ],
                implementation_guidance: "Establish formal incident response procedures with defined roles".to_string(),
            }),
        ]);

        self.frameworks.insert("NIST-800-53".to_string(), ComplianceFramework {
            name: "NIST 800-53".to_string(),
            version: "Rev 5".to_string(),
            controls: nist_controls,
        });

        // Initialize ISO 27001 framework
        let iso_controls = HashMap::from([
            ("A.9.1.1".to_string(), FrameworkControl {
                id: "A.9.1.1".to_string(),
                name: "Access Control Policy".to_string(),
                description: "An access control policy shall be established, documented and reviewed based on business and information security requirements".to_string(),
                requirements: vec![
                    "Document access control policy".to_string(),
                    "Business requirement alignment".to_string(),
                    "Regular policy reviews".to_string(),
                ],
                implementation_guidance: "Establish comprehensive access control policies addressing all system access".to_string(),
            }),
            ("A.12.6.1".to_string(), FrameworkControl {
                id: "A.12.6.1".to_string(),
                name: "Management of Technical Vulnerabilities".to_string(),
                description: "Information about technical vulnerabilities of information systems shall be obtained in a timely fashion".to_string(),
                requirements: vec![
                    "Vulnerability identification".to_string(),
                    "Timely response procedures".to_string(),
                    "Risk assessment process".to_string(),
                ],
                implementation_guidance: "Implement automated vulnerability scanning and management processes".to_string(),
            }),
        ]);

        self.frameworks.insert("ISO-27001".to_string(), ComplianceFramework {
            name: "ISO 27001".to_string(),
            version: "2022".to_string(),
            controls: iso_controls,
        });

        // Initialize MITRE technique to control mappings
        self.technique_mappings.insert("T1078".to_string(), vec!["AC-1".to_string(), "AC-2".to_string(), "A.9.1.1".to_string()]);
        self.technique_mappings.insert("T1055".to_string(), vec!["SI-4".to_string(), "A.12.6.1".to_string()]);
        self.technique_mappings.insert("T1566".to_string(), vec!["IR-4".to_string(), "SI-4".to_string()]);
    }

    pub fn map_compliance(&mut self, framework_name: &str, techniques: Vec<String>) -> ComplianceResult {
        let result_id = uuid::Uuid::new_v4().to_string();
        let timestamp = Utc::now();

        let framework = self.frameworks.get(framework_name)
            .cloned()
            .unwrap_or_else(|| ComplianceFramework {
                name: framework_name.to_string(),
                version: "Unknown".to_string(),
                controls: HashMap::new(),
            });

        let mut controls = Vec::new();
        let mut gaps = Vec::new();
        let mut covered_techniques = 0;

        for technique in &techniques {
            if let Some(mapped_controls) = self.technique_mappings.get(technique) {
                covered_techniques += 1;
                
                for control_id in mapped_controls {
                    if let Some(framework_control) = framework.controls.get(control_id) {
                        controls.push(ComplianceControl {
                            control_id: control_id.clone(),
                            control_name: framework_control.name.clone(),
                            mitre_techniques: vec![technique.clone()],
                            implementation_status: self.assess_implementation_status(control_id),
                            maturity_level: self.calculate_maturity_level(control_id),
                            last_assessed: timestamp,
                        });
                    }
                }
            } else {
                gaps.push(ComplianceGap {
                    gap_id: uuid::Uuid::new_v4().to_string(),
                    mitre_technique: technique.clone(),
                    missing_controls: vec!["No mapped controls found".to_string()],
                    risk_level: RiskLevel::Medium,
                    remediation_effort: "Identify and implement appropriate controls".to_string(),
                });
            }
        }

        let coverage_score = if techniques.is_empty() {
            100.0
        } else {
            (covered_techniques as f64 / techniques.len() as f64) * 100.0
        };

        let recommendations = self.generate_recommendations(&controls, &gaps, coverage_score);

        let result = ComplianceResult {
            result_id: result_id.clone(),
            timestamp,
            framework: framework_name.to_string(),
            controls,
            coverage_score,
            gap_analysis: gaps,
            recommendations,
        };

        self.results.push(result.clone());
        result
    }

    fn assess_implementation_status(&self, control_id: &str) -> ImplementationStatus {
        // Simulate implementation status assessment based on control criticality
        match control_id {
            id if id.starts_with("AC-") || id.starts_with("A.9") => ImplementationStatus::FullyImplemented,
            id if id.starts_with("SI-") => ImplementationStatus::PartiallyImplemented,
            id if id.starts_with("IR-") => ImplementationStatus::UnderReview,
            _ => ImplementationStatus::NotImplemented,
        }
    }

    fn calculate_maturity_level(&self, control_id: &str) -> u8 {
        // Calculate maturity level (1-5) based on control type and criticality
        match control_id {
            id if id.starts_with("AC-") => 4,
            id if id.starts_with("SI-") => 3,
            id if id.starts_with("IR-") => 2,
            id if id.starts_with("A.9") => 4,
            id if id.starts_with("A.12") => 3,
            _ => 1,
        }
    }

    fn generate_recommendations(&self, controls: &[ComplianceControl], gaps: &[ComplianceGap], coverage_score: f64) -> Vec<String> {
        let mut recommendations = Vec::new();

        if coverage_score < 70.0 {
            recommendations.push("Coverage below 70% - conduct comprehensive gap analysis".to_string());
        }

        let not_implemented = controls.iter()
            .filter(|c| matches!(c.implementation_status, ImplementationStatus::NotImplemented))
            .count();

        if not_implemented > 0 {
            recommendations.push(format!("Implement {} missing controls to improve security posture", not_implemented));
        }

        let high_risk_gaps = gaps.iter()
            .filter(|g| matches!(g.risk_level, RiskLevel::High | RiskLevel::Critical))
            .count();

        if high_risk_gaps > 0 {
            recommendations.push(format!("Address {} high-risk compliance gaps immediately", high_risk_gaps));
        }

        if recommendations.is_empty() {
            recommendations.push("Compliance mapping complete - maintain regular assessments".to_string());
        }

        recommendations
    }

    pub fn get_results(&self) -> &[ComplianceResult] {
        &self.results
    }

    pub fn get_framework_coverage(&self, framework_name: &str) -> Option<f64> {
        self.results.iter()
            .filter(|r| r.framework == framework_name)
            .map(|r| r.coverage_score)
            .reduce(|acc, score| (acc + score) / 2.0)
    }
}

#[napi]
pub struct ComplianceMapperNapi {
    inner: ComplianceMapper,
}

#[napi]
impl ComplianceMapperNapi {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            inner: ComplianceMapper::new(),
        }
    }

    #[napi]
    pub fn map_compliance(&mut self, framework_name: String, techniques: Vec<String>) -> napi::Result<String> {
        let result = self.inner.map_compliance(&framework_name, techniques);
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {}", e)))
    }

    #[napi]
    pub fn get_results(&self) -> napi::Result<String> {
        serde_json::to_string(self.inner.get_results())
            .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {}", e)))
    }

    #[napi]
    pub fn get_framework_coverage(&self, framework_name: String) -> napi::Result<f64> {
        Ok(self.inner.get_framework_coverage(&framework_name).unwrap_or(0.0))
    }

    #[napi]
    pub fn get_available_frameworks(&self) -> napi::Result<Vec<String>> {
        Ok(self.inner.frameworks.keys().cloned().collect())
    }
}

impl Default for ComplianceMapper {
    fn default() -> Self {
        Self::new()
    }
}
