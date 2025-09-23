//! Security Posture Assessor Module
//! Advanced security posture assessment capabilities

use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityAssessmentResult {
    pub assessment_id: String,
    pub timestamp: DateTime<Utc>,
    pub overall_score: f64,
    pub security_domains: Vec<SecurityDomain>,
    pub vulnerabilities: Vec<SecurityVulnerability>,
    pub recommendations: Vec<SecurityRecommendation>,
    pub trend_analysis: TrendAnalysis,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityDomain {
    pub domain_name: String,
    pub domain_score: f64,
    pub maturity_level: MaturityLevel,
    pub controls_assessed: u32,
    pub controls_effective: u32,
    pub critical_gaps: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityVulnerability {
    pub vulnerability_id: String,
    pub title: String,
    pub description: String,
    pub severity: VulnerabilitySeverity,
    pub affected_assets: Vec<String>,
    pub mitre_techniques: Vec<String>,
    pub remediation_priority: Priority,
    pub estimated_risk_reduction: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityRecommendation {
    pub recommendation_id: String,
    pub title: String,
    pub description: String,
    pub priority: Priority,
    pub implementation_effort: ImplementationEffort,
    pub expected_impact: f64,
    pub associated_domains: Vec<String>,
    pub timeline: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrendAnalysis {
    pub score_trend: Vec<ScoreDataPoint>,
    pub improvement_rate: f64,
    pub declining_domains: Vec<String>,
    pub emerging_threats: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoreDataPoint {
    pub date: DateTime<Utc>,
    pub score: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MaturityLevel {
    Initial,
    Developing,
    Defined,
    Managed,
    Optimizing,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VulnerabilitySeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ImplementationEffort {
    Low,
    Medium,
    High,
    VeryHigh,
}

pub struct SecurityPostureAssessor {
    assessments: Vec<SecurityAssessmentResult>,
    baseline_metrics: HashMap<String, f64>,
    domain_weights: HashMap<String, f64>,
    config: HashMap<String, String>,
}

impl SecurityPostureAssessor {
    pub fn new() -> Self {
        let mut assessor = Self {
            assessments: Vec::new(),
            baseline_metrics: HashMap::new(),
            domain_weights: HashMap::new(),
            config: HashMap::new(),
        };
        
        assessor.initialize_domain_weights();
        assessor
    }

    fn initialize_domain_weights(&mut self) {
        self.domain_weights.insert("Identity_Management".to_string(), 0.2);
        self.domain_weights.insert("Network_Security".to_string(), 0.15);
        self.domain_weights.insert("Endpoint_Protection".to_string(), 0.15);
        self.domain_weights.insert("Data_Protection".to_string(), 0.15);
        self.domain_weights.insert("Incident_Response".to_string(), 0.1);
        self.domain_weights.insert("Monitoring_Detection".to_string(), 0.15);
        self.domain_weights.insert("Governance_Compliance".to_string(), 0.1);
    }

    pub fn conduct_assessment(&mut self, assessment_input: SecurityAssessmentInput) -> SecurityAssessmentResult {
        let assessment_id = uuid::Uuid::new_v4().to_string();
        let timestamp = Utc::now();

        let domains = self.assess_security_domains(&assessment_input);
        let vulnerabilities = self.identify_vulnerabilities(&domains);
        let recommendations = self.generate_recommendations(&domains, &vulnerabilities);
        let trend_analysis = self.analyze_trends();
        
        let overall_score = self.calculate_overall_score(&domains);

        let result = SecurityAssessmentResult {
            assessment_id: assessment_id.clone(),
            timestamp,
            overall_score,
            security_domains: domains,
            vulnerabilities,
            recommendations,
            trend_analysis,
        };

        self.assessments.push(result.clone());
        result
    }

    fn assess_security_domains(&self, input: &SecurityAssessmentInput) -> Vec<SecurityDomain> {
        vec![
            SecurityDomain {
                domain_name: "Identity_Management".to_string(),
                domain_score: self.assess_identity_management(input),
                maturity_level: MaturityLevel::Defined,
                controls_assessed: 25,
                controls_effective: 20,
                critical_gaps: vec!["Multi-factor authentication coverage".to_string()],
            },
            SecurityDomain {
                domain_name: "Network_Security".to_string(),
                domain_score: self.assess_network_security(input),
                maturity_level: MaturityLevel::Managed,
                controls_assessed: 30,
                controls_effective: 26,
                critical_gaps: vec!["Network segmentation".to_string()],
            },
            SecurityDomain {
                domain_name: "Endpoint_Protection".to_string(),
                domain_score: self.assess_endpoint_protection(input),
                maturity_level: MaturityLevel::Developing,
                controls_assessed: 20,
                controls_effective: 15,
                critical_gaps: vec!["EDR deployment", "Patch management"].into_iter().map(|s| s.to_string()).collect(),
            },
            SecurityDomain {
                domain_name: "Data_Protection".to_string(),
                domain_score: self.assess_data_protection(input),
                maturity_level: MaturityLevel::Defined,
                controls_assessed: 22,
                controls_effective: 18,
                critical_gaps: vec!["Data classification", "Encryption at rest"].into_iter().map(|s| s.to_string()).collect(),
            },
            SecurityDomain {
                domain_name: "Incident_Response".to_string(),
                domain_score: self.assess_incident_response(input),
                maturity_level: MaturityLevel::Developing,
                controls_assessed: 15,
                controls_effective: 10,
                critical_gaps: vec!["Automated response capabilities"].into_iter().map(|s| s.to_string()).collect(),
            },
            SecurityDomain {
                domain_name: "Monitoring_Detection".to_string(),
                domain_score: self.assess_monitoring_detection(input),
                maturity_level: MaturityLevel::Managed,
                controls_assessed: 28,
                controls_effective: 24,
                critical_gaps: vec!["Behavioral analytics"].into_iter().map(|s| s.to_string()).collect(),
            },
        ]
    }

    fn assess_identity_management(&self, _input: &SecurityAssessmentInput) -> f64 {
        // Simulate comprehensive identity management assessment
        let mfa_coverage = 0.75;
        let privileged_access = 0.85;
        let account_lifecycle = 0.80;
        let password_policies = 0.90;
        
        (mfa_coverage + privileged_access + account_lifecycle + password_policies) / 4.0 * 100.0
    }

    fn assess_network_security(&self, _input: &SecurityAssessmentInput) -> f64 {
        let firewall_effectiveness = 0.90;
        let network_segmentation = 0.65;
        let intrusion_prevention = 0.80;
        let network_monitoring = 0.85;
        
        (firewall_effectiveness + network_segmentation + intrusion_prevention + network_monitoring) / 4.0 * 100.0
    }

    fn assess_endpoint_protection(&self, _input: &SecurityAssessmentInput) -> f64 {
        let antivirus_coverage = 0.95;
        let edr_deployment = 0.60;
        let patch_management = 0.70;
        let device_compliance = 0.75;
        
        (antivirus_coverage + edr_deployment + patch_management + device_compliance) / 4.0 * 100.0
    }

    fn assess_data_protection(&self, _input: &SecurityAssessmentInput) -> f64 {
        let data_classification = 0.70;
        let encryption_transit = 0.90;
        let encryption_rest = 0.75;
        let dlp_coverage = 0.65;
        
        (data_classification + encryption_transit + encryption_rest + dlp_coverage) / 4.0 * 100.0
    }

    fn assess_incident_response(&self, _input: &SecurityAssessmentInput) -> f64 {
        let response_plan = 0.80;
        let team_readiness = 0.70;
        let communication_procedures = 0.75;
        let automation_level = 0.50;
        
        (response_plan + team_readiness + communication_procedures + automation_level) / 4.0 * 100.0
    }

    fn assess_monitoring_detection(&self, _input: &SecurityAssessmentInput) -> f64 {
        let siem_coverage = 0.85;
        let log_collection = 0.90;
        let threat_hunting = 0.75;
        let behavioral_analytics = 0.60;
        
        (siem_coverage + log_collection + threat_hunting + behavioral_analytics) / 4.0 * 100.0
    }

    fn identify_vulnerabilities(&self, domains: &[SecurityDomain]) -> Vec<SecurityVulnerability> {
        let mut vulnerabilities = Vec::new();

        for domain in domains {
            if domain.domain_score < 70.0 {
                vulnerabilities.push(SecurityVulnerability {
                    vulnerability_id: uuid::Uuid::new_v4().to_string(),
                    title: format!("Insufficient {} Controls", domain.domain_name.replace('_', " ")),
                    description: format!("Security controls in {} domain are below acceptable threshold", domain.domain_name),
                    severity: if domain.domain_score < 50.0 { VulnerabilitySeverity::High } else { VulnerabilitySeverity::Medium },
                    affected_assets: vec!["Enterprise Infrastructure".to_string()],
                    mitre_techniques: self.get_relevant_mitre_techniques(&domain.domain_name),
                    remediation_priority: if domain.domain_score < 50.0 { Priority::High } else { Priority::Medium },
                    estimated_risk_reduction: (70.0 - domain.domain_score) / 10.0,
                });
            }

            for gap in &domain.critical_gaps {
                vulnerabilities.push(SecurityVulnerability {
                    vulnerability_id: uuid::Uuid::new_v4().to_string(),
                    title: format!("Critical Gap: {}", gap),
                    description: format!("Missing or inadequate implementation of {}", gap),
                    severity: VulnerabilitySeverity::High,
                    affected_assets: vec![domain.domain_name.clone()],
                    mitre_techniques: self.get_relevant_mitre_techniques(&domain.domain_name),
                    remediation_priority: Priority::High,
                    estimated_risk_reduction: 15.0,
                });
            }
        }

        vulnerabilities
    }

    fn get_relevant_mitre_techniques(&self, domain: &str) -> Vec<String> {
        match domain {
            "Identity_Management" => vec!["T1078".to_string(), "T1110".to_string(), "T1134".to_string()],
            "Network_Security" => vec!["T1021".to_string(), "T1090".to_string(), "T1095".to_string()],
            "Endpoint_Protection" => vec!["T1055".to_string(), "T1059".to_string(), "T1547".to_string()],
            "Data_Protection" => vec!["T1005".to_string(), "T1041".to_string(), "T1560".to_string()],
            "Incident_Response" => vec!["T1070".to_string(), "T1562".to_string()],
            "Monitoring_Detection" => vec!["T1562".to_string(), "T1070".to_string(), "T1564".to_string()],
            _ => vec!["T1199".to_string()],
        }
    }

    fn generate_recommendations(&self, domains: &[SecurityDomain], vulnerabilities: &[SecurityVulnerability]) -> Vec<SecurityRecommendation> {
        let mut recommendations = Vec::new();

        // Domain-specific recommendations
        for domain in domains {
            if domain.domain_score < 80.0 {
                recommendations.push(SecurityRecommendation {
                    recommendation_id: uuid::Uuid::new_v4().to_string(),
                    title: format!("Improve {} Security Controls", domain.domain_name.replace('_', " ")),
                    description: format!("Enhance security controls in {} domain to achieve target maturity level", domain.domain_name),
                    priority: if domain.domain_score < 60.0 { Priority::High } else { Priority::Medium },
                    implementation_effort: ImplementationEffort::Medium,
                    expected_impact: (80.0 - domain.domain_score) / 10.0,
                    associated_domains: vec![domain.domain_name.clone()],
                    timeline: "3-6 months".to_string(),
                });
            }
        }

        // Vulnerability-specific recommendations
        let critical_vulns = vulnerabilities.iter()
            .filter(|v| matches!(v.severity, VulnerabilitySeverity::Critical | VulnerabilitySeverity::High))
            .count();

        if critical_vulns > 0 {
            recommendations.push(SecurityRecommendation {
                recommendation_id: uuid::Uuid::new_v4().to_string(),
                title: "Address Critical Security Vulnerabilities".to_string(),
                description: format!("Remediate {} critical/high severity vulnerabilities immediately", critical_vulns),
                priority: Priority::Critical,
                implementation_effort: ImplementationEffort::High,
                expected_impact: 25.0,
                associated_domains: vec!["All".to_string()],
                timeline: "Immediate - 30 days".to_string(),
            });
        }

        recommendations
    }

    fn analyze_trends(&self) -> TrendAnalysis {
        let score_trend = if self.assessments.len() >= 2 {
            self.assessments.iter()
                .map(|a| ScoreDataPoint {
                    date: a.timestamp,
                    score: a.overall_score,
                })
                .collect()
        } else {
            vec![]
        };

        let improvement_rate = if score_trend.len() >= 2 {
            let first_score = score_trend.first().unwrap().score;
            let last_score = score_trend.last().unwrap().score;
            (last_score - first_score) / first_score * 100.0
        } else {
            0.0
        };

        TrendAnalysis {
            score_trend,
            improvement_rate,
            declining_domains: vec!["Endpoint_Protection".to_string()],
            emerging_threats: vec!["Ransomware", "Supply Chain Attacks"].into_iter().map(|s| s.to_string()).collect(),
        }
    }

    fn calculate_overall_score(&self, domains: &[SecurityDomain]) -> f64 {
        let mut weighted_score = 0.0;
        let mut total_weight = 0.0;

        for domain in domains {
            let weight = self.domain_weights.get(&domain.domain_name).unwrap_or(&0.1);
            weighted_score += domain.domain_score * weight;
            total_weight += weight;
        }

        if total_weight > 0.0 {
            weighted_score / total_weight
        } else {
            0.0
        }
    }

    pub fn get_assessments(&self) -> &[SecurityAssessmentResult] {
        &self.assessments
    }

    pub fn get_latest_score(&self) -> Option<f64> {
        self.assessments.last().map(|a| a.overall_score)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityAssessmentInput {
    pub organization_size: String,
    pub industry_sector: String,
    pub regulatory_requirements: Vec<String>,
    pub threat_landscape: Vec<String>,
    pub existing_controls: HashMap<String, String>,
}

#[napi]
pub struct SecurityPostureAssessorNapi {
    inner: SecurityPostureAssessor,
}

#[napi]
impl SecurityPostureAssessorNapi {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            inner: SecurityPostureAssessor::new(),
        }
    }

    #[napi]
    pub fn conduct_assessment(&mut self, input_json: String) -> napi::Result<String> {
        let input: SecurityAssessmentInput = serde_json::from_str(&input_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse input: {}", e)))?;
        
        let result = self.inner.conduct_assessment(input);
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {}", e)))
    }

    #[napi]
    pub fn get_assessments(&self) -> napi::Result<String> {
        serde_json::to_string(self.inner.get_assessments())
            .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {}", e)))
    }

    #[napi]
    pub fn get_latest_score(&self) -> napi::Result<f64> {
        Ok(self.inner.get_latest_score().unwrap_or(0.0))
    }

    #[napi]
    pub fn get_domain_trend(&self, domain_name: String) -> napi::Result<String> {
        let trend_data: Vec<f64> = self.inner.assessments.iter()
            .map(|a| a.security_domains.iter()
                .find(|d| d.domain_name == domain_name)
                .map(|d| d.domain_score)
                .unwrap_or(0.0))
            .collect();

        serde_json::to_string(&trend_data)
            .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {}", e)))
    }
}

impl Default for SecurityPostureAssessor {
    fn default() -> Self {
        Self::new()
    }
}
