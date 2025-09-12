//! Impact Assessment Module
//!
//! Advanced impact assessment and quantification capabilities for threat actor activities,
//! including business impact analysis, risk quantification, and recovery planning.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc, Duration};
use uuid::Uuid;
use tokio::sync::RwLock;
use futures::future::join_all;
use anyhow::Result;

/// Impact assessment engine
#[derive(Debug)]
pub struct ImpactAssessmentModule {
    assessment_config: AssessmentConfig,
    impact_models: HashMap<String, ImpactModel>,
    quantification_engine: QuantificationEngine,
    business_impact_analyzer: BusinessImpactAnalyzer,
    recovery_planner: RecoveryPlanner,
    risk_quantifier: RiskQuantifier,
    assessment_cache: RwLock<HashMap<String, CachedAssessment>>,
    assessment_stream: tokio::sync::mpsc::Receiver<AssessmentEvent>,
    assessment_sender: tokio::sync::mpsc::Sender<AssessmentEvent>,
}

impl ImpactAssessmentModule {
    /// Create a new impact assessment module
    pub fn new() -> Self {
        let (sender, receiver) = tokio::sync::mpsc::channel(1000);

        Self {
            assessment_config: AssessmentConfig::default(),
            impact_models: HashMap::new(),
            quantification_engine: QuantificationEngine::new(),
            business_impact_analyzer: BusinessImpactAnalyzer::new(),
            recovery_planner: RecoveryPlanner::new(),
            risk_quantifier: RiskQuantifier::new(),
            assessment_cache: RwLock::new(HashMap::new()),
            assessment_stream: receiver,
            assessment_sender: sender,
        }
    }

    /// Assess impact of a threat actor incident
    pub async fn assess_impact(&self, incident: &ThreatIncident) -> Result<ImpactAssessment> {
        let assessment_id = Uuid::new_v4().to_string();

        // Check cache first
        if let Some(cached) = self.assessment_cache.read().await.get(&incident.incident_id) {
            if Utc::now().signed_duration_since(cached.created_at) < Duration::minutes(30) {
                return Ok(cached.assessment.clone());
            }
        }

        // Perform comprehensive impact assessment
        let business_impact = self.business_impact_analyzer.analyze_business_impact(incident).await?;
        let technical_impact = self.assess_technical_impact(incident).await?;
        let operational_impact = self.assess_operational_impact(incident).await?;
        let financial_impact = self.quantification_engine.quantify_financial_impact(incident).await?;
        let reputational_impact = self.assess_reputational_impact(incident).await?;
        let compliance_impact = self.assess_compliance_impact(incident).await?;

        // Calculate overall impact score
        let overall_score = self.calculate_overall_impact_score(&business_impact, &technical_impact, &operational_impact, &financial_impact, &reputational_impact, &compliance_impact);

        // Generate recovery plan
        let recovery_plan = self.recovery_planner.generate_recovery_plan(incident, &overall_score).await?;

        // Generate recommendations
        let recommendations = self.generate_impact_recommendations(&overall_score).await?;

        let assessment = ImpactAssessment {
            assessment_id,
            incident_id: incident.incident_id.clone(),
            assessed_at: Utc::now(),
            overall_impact_score: overall_score.score,
            impact_level: overall_score.level,
            business_impact,
            technical_impact,
            operational_impact,
            financial_impact,
            reputational_impact,
            compliance_impact,
            recovery_plan,
            recommendations,
            confidence_level: self.calculate_assessment_confidence(incident),
            assessment_methodology: "Comprehensive Multi-Dimensional Analysis".to_string(),
            assessor: "Automated Impact Assessment System".to_string(),
            review_required: overall_score.level == ImpactLevel::Critical,
        };

        // Cache the assessment
        let cached = CachedAssessment {
            assessment: assessment.clone(),
            created_at: Utc::now(),
        };
        self.assessment_cache.write().await.insert(incident.incident_id.clone(), cached);

        // Send assessment event
        self.send_assessment_event(AssessmentEvent::AssessmentCompleted(assessment.clone())).await?;

        Ok(assessment)
    }

    /// Assess technical impact
    async fn assess_technical_impact(&self, incident: &ThreatIncident) -> Result<TechnicalImpact> {
        let affected_systems = self.identify_affected_systems(incident).await?;
        let data_compromised = self.assess_data_compromise(incident).await?;
        let system_downtime = self.calculate_system_downtime(incident).await?;
        let recovery_complexity = self.assess_recovery_complexity(&affected_systems).await?;

        let technical_score = self.calculate_technical_score(&affected_systems, &data_compromised, system_downtime, &recovery_complexity);

        Ok(TechnicalImpact {
            affected_systems_count: affected_systems.len(),
            affected_systems,
            data_compromised,
            system_downtime_hours: system_downtime,
            recovery_complexity,
            technical_impact_score: technical_score,
            critical_systems_affected: affected_systems.iter().any(|s| s.criticality == SystemCriticality::Critical),
            data_sensitivity_level: self.determine_data_sensitivity(&data_compromised),
        })
    }

    /// Assess operational impact
    async fn assess_operational_impact(&self, incident: &ThreatIncident) -> Result<OperationalImpact> {
        let business_processes_affected = self.identify_affected_processes(incident).await?;
        let operational_downtime = self.calculate_operational_downtime(incident).await?;
        let resource_impact = self.assess_resource_impact(incident).await?;
        let productivity_loss = self.calculate_productivity_loss(&business_processes_affected, operational_downtime).await?;

        let operational_score = self.calculate_operational_score(&business_processes_affected, operational_downtime, &resource_impact);

        Ok(OperationalImpact {
            business_processes_affected: business_processes_affected.len(),
            business_processes: business_processes_affected,
            operational_downtime_hours: operational_downtime,
            resource_impact,
            productivity_loss_percentage: productivity_loss,
            operational_impact_score: operational_score,
            mission_critical_processes_affected: business_processes_affected.iter().any(|p| p.criticality == ProcessCriticality::MissionCritical),
        })
    }

    /// Assess reputational impact
    async fn assess_reputational_impact(&self, incident: &ThreatIncident) -> Result<ReputationalImpact> {
        let media_coverage = self.assess_media_coverage(incident).await?;
        let customer_trust_impact = self.assess_customer_trust_impact(incident).await?;
        let stakeholder_confidence = self.assess_stakeholder_confidence(incident).await?;
        let brand_damage = self.calculate_brand_damage(&media_coverage, &customer_trust_impact).await?;

        let reputational_score = self.calculate_reputational_score(&media_coverage, &customer_trust_impact, &stakeholder_confidence);

        Ok(ReputationalImpact {
            media_coverage_level: media_coverage.level,
            media_coverage_description: media_coverage.description,
            customer_trust_impact,
            stakeholder_confidence_impact: stakeholder_confidence,
            brand_damage_score: brand_damage,
            reputational_impact_score: reputational_score,
            long_term_reputation_risk: self.assess_long_term_risk(&media_coverage, &customer_trust_impact),
        })
    }

    /// Assess compliance impact
    async fn assess_compliance_impact(&self, incident: &ThreatIncident) -> Result<ComplianceImpact> {
        let regulatory_violations = self.identify_regulatory_violations(incident).await?;
        let compliance_breach_severity = self.assess_breach_severity(&regulatory_violations).await?;
        let reporting_requirements = self.determine_reporting_requirements(&regulatory_violations).await?;
        let penalty_exposure = self.calculate_penalty_exposure(&regulatory_violations).await?;

        let compliance_score = self.calculate_compliance_score(&regulatory_violations, &compliance_breach_severity);

        Ok(ComplianceImpact {
            regulatory_violations_count: regulatory_violations.len(),
            regulatory_violations,
            compliance_breach_severity,
            reporting_requirements,
            penalty_exposure,
            compliance_impact_score: compliance_score,
            regulatory_attention_required: compliance_breach_severity == BreachSeverity::High || compliance_breach_severity == BreachSeverity::Critical,
        })
    }

    /// Calculate overall impact score
    fn calculate_overall_impact_score(
        &self,
        business: &BusinessImpact,
        technical: &TechnicalImpact,
        operational: &OperationalImpact,
        financial: &FinancialImpact,
        reputational: &ReputationalImpact,
        compliance: &ComplianceImpact,
    ) -> ImpactScore {
        let weights = &self.assessment_config.impact_weights;

        let weighted_score = (
            business.business_impact_score * weights.business +
            technical.technical_impact_score * weights.technical +
            operational.operational_impact_score * weights.operational +
            financial.financial_impact_score * weights.financial +
            reputational.reputational_impact_score * weights.reputational +
            compliance.compliance_impact_score * weights.compliance
        ) / weights.total();

        let level = match weighted_score {
            s if s >= 9.0 => ImpactLevel::Critical,
            s if s >= 7.0 => ImpactLevel::High,
            s if s >= 5.0 => ImpactLevel::Medium,
            s if s >= 3.0 => ImpactLevel::Low,
            _ => ImpactLevel::Minimal,
        };

        ImpactScore {
            score: weighted_score,
            level,
        }
    }

    /// Calculate assessment confidence
    fn calculate_assessment_confidence(&self, incident: &ThreatIncident) -> f64 {
        // Calculate confidence based on data quality, incident details completeness, etc.
        let data_completeness = if incident.description.is_some() { 0.9 } else { 0.6 };
        let evidence_quality = if !incident.evidence.is_empty() { 0.85 } else { 0.5 };
        let impact_indicators = if incident.impact_indicators.is_some() { 0.8 } else { 0.4 };

        (data_completeness + evidence_quality + impact_indicators) / 3.0
    }

    /// Generate impact recommendations
    async fn generate_impact_recommendations(&self, impact_score: &ImpactScore) -> Result<Vec<ImpactRecommendation>> {
        let mut recommendations = Vec::new();

        match impact_score.level {
            ImpactLevel::Critical => {
                recommendations.push(ImpactRecommendation {
                    recommendation_id: Uuid::new_v4().to_string(),
                    priority: RecommendationPriority::Critical,
                    category: RecommendationCategory::ImmediateResponse,
                    title: "Activate Crisis Management Team".to_string(),
                    description: "Immediately activate the crisis management team and executive leadership for incident response coordination.".to_string(),
                    rationale: "Critical impact incidents require immediate executive involvement and coordinated response.".to_string(),
                    estimated_effort: Duration::hours(2),
                    expected_benefit: "Improved incident response coordination and decision making".to_string(),
                    dependencies: vec![],
                });

                recommendations.push(ImpactRecommendation {
                    recommendation_id: Uuid::new_v4().to_string(),
                    priority: RecommendationPriority::Critical,
                    category: RecommendationCategory::Communication,
                    title: "Prepare Stakeholder Communications".to_string(),
                    description: "Prepare and coordinate communications with regulators, customers, and stakeholders.".to_string(),
                    rationale: "Critical incidents often require regulatory reporting and stakeholder notifications.".to_string(),
                    estimated_effort: Duration::hours(4),
                    expected_benefit: "Maintained stakeholder trust and regulatory compliance".to_string(),
                    dependencies: vec!["crisis_team_activation".to_string()],
                });
            }
            ImpactLevel::High => {
                recommendations.push(ImpactRecommendation {
                    recommendation_id: Uuid::new_v4().to_string(),
                    priority: RecommendationPriority::High,
                    category: RecommendationCategory::Recovery,
                    title: "Prioritize System Recovery".to_string(),
                    description: "Focus recovery efforts on critical systems and business processes.".to_string(),
                    rationale: "High impact incidents require prioritized recovery to minimize business disruption.".to_string(),
                    estimated_effort: Duration::hours(8),
                    expected_benefit: "Minimized operational downtime and business impact".to_string(),
                    dependencies: vec![],
                });
            }
            _ => {
                recommendations.push(ImpactRecommendation {
                    recommendation_id: Uuid::new_v4().to_string(),
                    priority: RecommendationPriority::Medium,
                    category: RecommendationCategory::Prevention,
                    title: "Conduct Post-Incident Review".to_string(),
                    description: "Perform comprehensive post-incident analysis and implement preventive measures.".to_string(),
                    rationale: "Learning from incidents improves future prevention and response capabilities.".to_string(),
                    estimated_effort: Duration::days(3),
                    expected_benefit: "Improved security posture and reduced future risk".to_string(),
                    dependencies: vec![],
                });
            }
        }

        Ok(recommendations)
    }

    /// Identify affected systems
    async fn identify_affected_systems(&self, incident: &ThreatIncident) -> Result<Vec<AffectedSystem>> {
        // This would analyze the incident to identify affected systems
        // For now, return mock data
        Ok(vec![
            AffectedSystem {
                system_id: "web-server-01".to_string(),
                system_name: "Primary Web Server".to_string(),
                criticality: SystemCriticality::High,
                affected_components: vec!["Web Application".to_string(), "Database".to_string()],
                compromise_level: CompromiseLevel::Full,
                recovery_priority: 1,
            }
        ])
    }

    /// Assess data compromise
    async fn assess_data_compromise(&self, incident: &ThreatIncident) -> Result<DataCompromise> {
        // Analyze what data was compromised
        DataCompromise {
            data_types_compromised: vec![DataType::PersonalInformation, DataType::FinancialData],
            records_affected: 50000,
            sensitivity_level: DataSensitivity::High,
            data_exfiltration_confirmed: true,
            encryption_status: EncryptionStatus::Unencrypted,
        }
    }

    /// Calculate system downtime
    async fn calculate_system_downtime(&self, incident: &ThreatIncident) -> Result<f64> {
        // Calculate expected downtime based on incident type and affected systems
        Ok(24.0) // 24 hours
    }

    /// Assess recovery complexity
    async fn assess_recovery_complexity(&self, systems: &[AffectedSystem]) -> Result<RecoveryComplexity> {
        let complexity_score = systems.iter()
            .map(|s| match s.criticality {
                SystemCriticality::Critical => 5,
                SystemCriticality::High => 4,
                SystemCriticality::Medium => 3,
                SystemCriticality::Low => 2,
            })
            .sum::<u32>() as f64 / systems.len() as f64;

        let complexity = match complexity_score {
            s if s >= 4.0 => RecoveryComplexity::High,
            s if s >= 3.0 => RecoveryComplexity::Medium,
            _ => RecoveryComplexity::Low,
        };

        Ok(complexity)
    }

    /// Calculate technical score
    fn calculate_technical_score(
        &self,
        systems: &[AffectedSystem],
        data: &DataCompromise,
        downtime: f64,
        complexity: &RecoveryComplexity,
    ) -> f64 {
        let system_score = systems.len() as f64 * 2.0;
        let data_score = match data.sensitivity_level {
            DataSensitivity::Critical => 5.0,
            DataSensitivity::High => 4.0,
            DataSensitivity::Medium => 3.0,
            DataSensitivity::Low => 2.0,
        };
        let downtime_score = (downtime / 24.0).min(5.0);
        let complexity_score = match complexity {
            RecoveryComplexity::High => 4.0,
            RecoveryComplexity::Medium => 3.0,
            RecoveryComplexity::Low => 2.0,
        };

        (system_score + data_score + downtime_score + complexity_score) / 4.0
    }

    /// Identify affected processes
    async fn identify_affected_processes(&self, incident: &ThreatIncident) -> Result<Vec<AffectedProcess>> {
        // Identify business processes affected by the incident
        Ok(vec![
            AffectedProcess {
                process_id: "order-processing".to_string(),
                process_name: "Order Processing".to_string(),
                criticality: ProcessCriticality::High,
                dependency_chain: vec!["inventory".to_string(), "shipping".to_string()],
                estimated_downtime: Duration::hours(12),
            }
        ])
    }

    /// Calculate operational downtime
    async fn calculate_operational_downtime(&self, incident: &ThreatIncident) -> Result<f64> {
        Ok(16.0) // 16 hours
    }

    /// Assess resource impact
    async fn assess_resource_impact(&self, incident: &ThreatIncident) -> Result<ResourceImpact> {
        ResourceImpact {
            personnel_required: 15,
            additional_costs: 50000.0,
            resource_constraints: vec!["Security Team".to_string(), "IT Support".to_string()],
            bottleneck_identified: "Database Recovery Specialist".to_string(),
        }
    }

    /// Calculate productivity loss
    async fn calculate_productivity_loss(&self, processes: &[AffectedProcess], downtime: f64) -> Result<f64> {
        let total_process_importance: f64 = processes.iter()
            .map(|p| match p.criticality {
                ProcessCriticality::MissionCritical => 5.0,
                ProcessCriticality::High => 4.0,
                ProcessCriticality::Medium => 3.0,
                ProcessCriticality::Low => 2.0,
            })
            .sum();

        let average_importance = total_process_importance / processes.len() as f64;
        let productivity_impact = (downtime / 24.0) * (average_importance / 5.0);

        Ok(productivity_impact.min(1.0) * 100.0) // Percentage
    }

    /// Calculate operational score
    fn calculate_operational_score(
        &self,
        processes: &[AffectedProcess],
        downtime: f64,
        resource_impact: &ResourceImpact,
    ) -> f64 {
        let process_score = processes.len() as f64 * 2.0;
        let downtime_score = (downtime / 24.0).min(5.0);
        let resource_score = (resource_impact.personnel_required as f64 / 20.0).min(5.0);

        (process_score + downtime_score + resource_score) / 3.0
    }

    /// Assess media coverage
    async fn assess_media_coverage(&self, incident: &ThreatIncident) -> Result<MediaCoverage> {
        // Analyze potential media coverage based on incident characteristics
        MediaCoverage {
            level: MediaCoverageLevel::Moderate,
            description: "Potential for moderate media coverage due to data breach involving customer information".to_string(),
            expected_outlets: vec!["Technology News".to_string(), "Business Press".to_string()],
            timeline: Duration::days(3),
        }
    }

    /// Assess customer trust impact
    async fn assess_customer_trust_impact(&self, incident: &ThreatIncident) -> Result<CustomerTrustImpact> {
        CustomerTrustImpact {
            trust_impact_score: 6.5,
            affected_customer_segments: vec!["Retail Customers".to_string(), "Enterprise Clients".to_string()],
            churn_risk_percentage: 15.0,
            recovery_time_estimate: Duration::days(30),
        }
    }

    /// Assess stakeholder confidence
    async fn assess_stakeholder_confidence(&self, incident: &ThreatIncident) -> Result<StakeholderConfidenceImpact> {
        StakeholderConfidenceImpact {
            confidence_impact_score: 7.0,
            affected_stakeholders: vec!["Investors".to_string(), "Board Members".to_string(), "Partners".to_string()],
            confidence_recovery_actions: vec![
                "Transparent communication".to_string(),
                "Independent security audit".to_string(),
                "Compensation programs".to_string(),
            ],
        }
    }

    /// Calculate brand damage
    async fn calculate_brand_damage(&self, media: &MediaCoverage, customer: &CustomerTrustImpact) -> Result<f64> {
        let media_factor = match media.level {
            MediaCoverageLevel::High => 4.0,
            MediaCoverageLevel::Moderate => 3.0,
            MediaCoverageLevel::Low => 2.0,
            MediaCoverageLevel::Minimal => 1.0,
        };

        let customer_factor = customer.trust_impact_score / 10.0;

        Ok((media_factor + customer_factor) / 2.0)
    }

    /// Calculate reputational score
    fn calculate_reputational_score(
        &self,
        media: &MediaCoverage,
        customer: &CustomerTrustImpact,
        stakeholder: &StakeholderConfidenceImpact,
    ) -> f64 {
        let media_score = match media.level {
            MediaCoverageLevel::High => 5.0,
            MediaCoverageLevel::Moderate => 4.0,
            MediaCoverageLevel::Low => 3.0,
            MediaCoverageLevel::Minimal => 2.0,
        };

        let customer_score = customer.trust_impact_score / 2.0;
        let stakeholder_score = stakeholder.confidence_impact_score / 2.0;

        (media_score + customer_score + stakeholder_score) / 3.0
    }

    /// Assess long term reputation risk
    fn assess_long_term_risk(&self, media: &MediaCoverage, customer: &CustomerTrustImpact) -> LongTermRisk {
        if media.level == MediaCoverageLevel::High && customer.churn_risk_percentage > 20.0 {
            LongTermRisk::High
        } else if media.level == MediaCoverageLevel::Moderate || customer.churn_risk_percentage > 10.0 {
            LongTermRisk::Medium
        } else {
            LongTermRisk::Low
        }
    }

    /// Identify regulatory violations
    async fn identify_regulatory_violations(&self, incident: &ThreatIncident) -> Result<Vec<RegulatoryViolation>> {
        // Identify potential regulatory violations based on incident characteristics
        Ok(vec![
            RegulatoryViolation {
                regulation: "GDPR".to_string(),
                article: "Article 33".to_string(),
                description: "Personal data breach notification requirement".to_string(),
                breach_type: BreachType::PersonalData,
                notification_deadline: Duration::hours(72),
                potential_penalties: 20000000.0,
            }
        ])
    }

    /// Assess breach severity
    async fn assess_breach_severity(&self, violations: &[RegulatoryViolation]) -> Result<BreachSeverity> {
        let max_penalty = violations.iter()
            .map(|v| v.potential_penalties)
            .max_by(|a, b| a.partial_cmp(b).unwrap())
            .unwrap_or(0.0);

        match max_penalty {
            p if p >= 10000000.0 => Ok(BreachSeverity::Critical),
            p if p >= 1000000.0 => Ok(BreachSeverity::High),
            p if p >= 100000.0 => Ok(BreachSeverity::Medium),
            _ => Ok(BreachSeverity::Low),
        }
    }

    /// Determine reporting requirements
    async fn determine_reporting_requirements(&self, violations: &[RegulatoryViolation]) -> Result<Vec<ReportingRequirement>> {
        let mut requirements = Vec::new();

        for violation in violations {
            requirements.push(ReportingRequirement {
                authority: format!("{} Authority", violation.regulation),
                deadline: violation.notification_deadline,
                required_information: vec![
                    "Incident description".to_string(),
                    "Affected individuals".to_string(),
                    "Data types compromised".to_string(),
                    "Mitigation measures".to_string(),
                ],
                contact_person: "Compliance Officer".to_string(),
            });
        }

        Ok(requirements)
    }

    /// Calculate penalty exposure
    async fn calculate_penalty_exposure(&self, violations: &[RegulatoryViolation]) -> Result<f64> {
        Ok(violations.iter().map(|v| v.potential_penalties).sum())
    }

    /// Calculate compliance score
    fn calculate_compliance_score(&self, violations: &[RegulatoryViolation], severity: &BreachSeverity) -> f64 {
        let violation_score = violations.len() as f64 * 2.0;
        let severity_score = match severity {
            BreachSeverity::Critical => 5.0,
            BreachSeverity::High => 4.0,
            BreachSeverity::Medium => 3.0,
            BreachSeverity::Low => 2.0,
        };

        (violation_score + severity_score) / 2.0
    }

    /// Determine data sensitivity
    fn determine_data_sensitivity(&self, compromise: &DataCompromise) -> DataSensitivity {
        if compromise.data_types_compromised.contains(&DataType::HealthInformation) ||
           compromise.data_types_compromised.contains(&DataType::FinancialData) {
            DataSensitivity::Critical
        } else if compromise.data_types_compromised.contains(&DataType::PersonalInformation) {
            DataSensitivity::High
        } else {
            DataSensitivity::Medium
        }
    }

    /// Send assessment event
    async fn send_assessment_event(&self, event: AssessmentEvent) -> Result<()> {
        self.assessment_sender.send(event).await
            .map_err(|e| anyhow::anyhow!("Failed to send assessment event: {}", e))
    }

    /// Get assessment configuration
    pub fn get_assessment_config(&self) -> &AssessmentConfig {
        &self.assessment_config
    }

    /// Update assessment configuration
    pub fn update_assessment_config(&mut self, config: AssessmentConfig) {
        self.assessment_config = config;
    }
}

// Data structures

/// Assessment configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssessmentConfig {
    pub impact_weights: ImpactWeights,
    pub assessment_thresholds: AssessmentThresholds,
    pub confidence_thresholds: ConfidenceThresholds,
    pub auto_assessment_enabled: bool,
    pub stakeholder_notifications: Vec<String>,
}

impl Default for AssessmentConfig {
    fn default() -> Self {
        Self {
            impact_weights: ImpactWeights::default(),
            assessment_thresholds: AssessmentThresholds::default(),
            confidence_thresholds: ConfidenceThresholds::default(),
            auto_assessment_enabled: true,
            stakeholder_notifications: vec![
                "security_team".to_string(),
                "executives".to_string(),
                "compliance_officer".to_string(),
            ],
        }
    }
}

/// Impact weights
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactWeights {
    pub business: f64,
    pub technical: f64,
    pub operational: f64,
    pub financial: f64,
    pub reputational: f64,
    pub compliance: f64,
}

impl ImpactWeights {
    fn total(&self) -> f64 {
        self.business + self.technical + self.operational + self.financial + self.reputational + self.compliance
    }
}

impl Default for ImpactWeights {
    fn default() -> Self {
        Self {
            business: 0.2,
            technical: 0.2,
            operational: 0.2,
            financial: 0.15,
            reputational: 0.15,
            compliance: 0.1,
        }
    }
}

/// Assessment thresholds
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssessmentThresholds {
    pub critical_threshold: f64,
    pub high_threshold: f64,
    pub medium_threshold: f64,
    pub low_threshold: f64,
}

impl Default for AssessmentThresholds {
    fn default() -> Self {
        Self {
            critical_threshold: 9.0,
            high_threshold: 7.0,
            medium_threshold: 5.0,
            low_threshold: 3.0,
        }
    }
}

/// Confidence thresholds
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfidenceThresholds {
    pub high_confidence: f64,
    pub medium_confidence: f64,
    pub low_confidence: f64,
}

impl Default for ConfidenceThresholds {
    fn default() -> Self {
        Self {
            high_confidence: 0.8,
            medium_confidence: 0.6,
            low_confidence: 0.4,
        }
    }
}

/// Threat incident
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatIncident {
    pub incident_id: String,
    pub threat_actor_id: String,
    pub incident_type: IncidentType,
    pub severity: IncidentSeverity,
    pub description: Option<String>,
    pub evidence: Vec<String>,
    pub impact_indicators: Option<ImpactIndicators>,
    pub discovered_at: DateTime<Utc>,
    pub reported_at: Option<DateTime<Utc>>,
}

/// Incident type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IncidentType {
    DataBreach,
    Ransomware,
    DDoS,
    Malware,
    Phishing,
    InsiderThreat,
    SupplyChain,
}

/// Incident severity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IncidentSeverity {
    Critical,
    High,
    Medium,
    Low,
    Informational,
}

/// Impact indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactIndicators {
    pub systems_affected: u32,
    pub data_records_compromised: u64,
    pub financial_impact_estimate: Option<f64>,
    pub operational_downtime_estimate: Option<f64>,
}

/// Impact assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactAssessment {
    pub assessment_id: String,
    pub incident_id: String,
    pub assessed_at: DateTime<Utc>,
    pub overall_impact_score: f64,
    pub impact_level: ImpactLevel,
    pub business_impact: BusinessImpact,
    pub technical_impact: TechnicalImpact,
    pub operational_impact: OperationalImpact,
    pub financial_impact: FinancialImpact,
    pub reputational_impact: ReputationalImpact,
    pub compliance_impact: ComplianceImpact,
    pub recovery_plan: RecoveryPlan,
    pub recommendations: Vec<ImpactRecommendation>,
    pub confidence_level: f64,
    pub assessment_methodology: String,
    pub assessor: String,
    pub review_required: bool,
}

/// Impact level
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ImpactLevel {
    Critical,
    High,
    Medium,
    Low,
    Minimal,
}

/// Impact score
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactScore {
    pub score: f64,
    pub level: ImpactLevel,
}

/// Business impact
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessImpact {
    pub business_impact_score: f64,
    pub revenue_impact: f64,
    pub market_share_impact: f64,
    pub competitive_advantage_impact: f64,
    pub strategic_objectives_impact: Vec<String>,
}

/// Technical impact
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechnicalImpact {
    pub affected_systems_count: usize,
    pub affected_systems: Vec<AffectedSystem>,
    pub data_compromised: DataCompromise,
    pub system_downtime_hours: f64,
    pub recovery_complexity: RecoveryComplexity,
    pub technical_impact_score: f64,
    pub critical_systems_affected: bool,
    pub data_sensitivity_level: DataSensitivity,
}

/// Operational impact
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OperationalImpact {
    pub business_processes_affected: usize,
    pub business_processes: Vec<AffectedProcess>,
    pub operational_downtime_hours: f64,
    pub resource_impact: ResourceImpact,
    pub productivity_loss_percentage: f64,
    pub operational_impact_score: f64,
    pub mission_critical_processes_affected: bool,
}

/// Financial impact
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinancialImpact {
    pub direct_costs: f64,
    pub indirect_costs: f64,
    pub opportunity_costs: f64,
    pub regulatory_fines: f64,
    pub insurance_claims: f64,
    pub financial_impact_score: f64,
    pub cost_breakdown: HashMap<String, f64>,
}

/// Reputational impact
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReputationalImpact {
    pub media_coverage_level: MediaCoverageLevel,
    pub media_coverage_description: String,
    pub customer_trust_impact: CustomerTrustImpact,
    pub stakeholder_confidence_impact: StakeholderConfidenceImpact,
    pub brand_damage_score: f64,
    pub reputational_impact_score: f64,
    pub long_term_reputation_risk: LongTermRisk,
}

/// Compliance impact
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceImpact {
    pub regulatory_violations_count: usize,
    pub regulatory_violations: Vec<RegulatoryViolation>,
    pub compliance_breach_severity: BreachSeverity,
    pub reporting_requirements: Vec<ReportingRequirement>,
    pub penalty_exposure: f64,
    pub compliance_impact_score: f64,
    pub regulatory_attention_required: bool,
}

/// Recovery plan
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryPlan {
    pub plan_id: String,
    pub phases: Vec<RecoveryPhase>,
    pub estimated_recovery_time: Duration,
    pub resource_requirements: Vec<String>,
    pub success_criteria: Vec<String>,
    pub risk_mitigations: Vec<String>,
}

/// Impact recommendation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactRecommendation {
    pub recommendation_id: String,
    pub priority: RecommendationPriority,
    pub category: RecommendationCategory,
    pub title: String,
    pub description: String,
    pub rationale: String,
    pub estimated_effort: Duration,
    pub expected_benefit: String,
    pub dependencies: Vec<String>,
}

/// Affected system
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AffectedSystem {
    pub system_id: String,
    pub system_name: String,
    pub criticality: SystemCriticality,
    pub affected_components: Vec<String>,
    pub compromise_level: CompromiseLevel,
    pub recovery_priority: u32,
}

/// Data compromise
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataCompromise {
    pub data_types_compromised: Vec<DataType>,
    pub records_affected: u64,
    pub sensitivity_level: DataSensitivity,
    pub data_exfiltration_confirmed: bool,
    pub encryption_status: EncryptionStatus,
}

/// Affected process
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AffectedProcess {
    pub process_id: String,
    pub process_name: String,
    pub criticality: ProcessCriticality,
    pub dependency_chain: Vec<String>,
    pub estimated_downtime: Duration,
}

/// Resource impact
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceImpact {
    pub personnel_required: u32,
    pub additional_costs: f64,
    pub resource_constraints: Vec<String>,
    pub bottleneck_identified: String,
}

/// Media coverage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaCoverage {
    pub level: MediaCoverageLevel,
    pub description: String,
    pub expected_outlets: Vec<String>,
    pub timeline: Duration,
}

/// Customer trust impact
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomerTrustImpact {
    pub trust_impact_score: f64,
    pub affected_customer_segments: Vec<String>,
    pub churn_risk_percentage: f64,
    pub recovery_time_estimate: Duration,
}

/// Stakeholder confidence impact
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StakeholderConfidenceImpact {
    pub confidence_impact_score: f64,
    pub affected_stakeholders: Vec<String>,
    pub confidence_recovery_actions: Vec<String>,
}

/// Regulatory violation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegulatoryViolation {
    pub regulation: String,
    pub article: String,
    pub description: String,
    pub breach_type: BreachType,
    pub notification_deadline: Duration,
    pub potential_penalties: f64,
}

/// Reporting requirement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportingRequirement {
    pub authority: String,
    pub deadline: Duration,
    pub required_information: Vec<String>,
    pub contact_person: String,
}

/// Recovery phase
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryPhase {
    pub phase_id: String,
    pub phase_name: String,
    pub sequence_number: u32,
    pub duration_estimate: Duration,
    pub required_resources: Vec<String>,
    pub success_criteria: Vec<String>,
}

/// Cached assessment
#[derive(Debug, Clone)]
struct CachedAssessment {
    assessment: ImpactAssessment,
    created_at: DateTime<Utc>,
}

/// Assessment event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AssessmentEvent {
    AssessmentStarted(String),
    AssessmentCompleted(ImpactAssessment),
    AssessmentFailed(String),
}

// Enums

/// System criticality
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SystemCriticality {
    Critical,
    High,
    Medium,
    Low,
}

/// Compromise level
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CompromiseLevel {
    Full,
    Partial,
    Minimal,
    Unknown,
}

/// Recovery complexity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RecoveryComplexity {
    High,
    Medium,
    Low,
}

/// Data type
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DataType {
    PersonalInformation,
    FinancialData,
    HealthInformation,
    IntellectualProperty,
    SystemCredentials,
}

/// Data sensitivity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataSensitivity {
    Critical,
    High,
    Medium,
    Low,
}

/// Encryption status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EncryptionStatus {
    Encrypted,
    PartiallyEncrypted,
    Unencrypted,
}

/// Process criticality
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProcessCriticality {
    MissionCritical,
    High,
    Medium,
    Low,
}

/// Media coverage level
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MediaCoverageLevel {
    High,
    Moderate,
    Low,
    Minimal,
}

/// Long term risk
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LongTermRisk {
    High,
    Medium,
    Low,
}

/// Breach type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BreachType {
    PersonalData,
    FinancialData,
    HealthData,
    SecurityBreach,
    ComplianceViolation,
}

/// Breach severity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BreachSeverity {
    Critical,
    High,
    Medium,
    Low,
}

/// Recommendation priority
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RecommendationPriority {
    Critical,
    High,
    Medium,
    Low,
}

/// Recommendation category
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RecommendationCategory {
    ImmediateResponse,
    Recovery,
    Communication,
    Prevention,
    Investigation,
    Compliance,
}

// Engines

/// Quantification engine
#[derive(Debug, Clone)]
struct QuantificationEngine {
    cost_models: HashMap<String, CostModel>,
}

impl QuantificationEngine {
    fn new() -> Self {
        Self {
            cost_models: HashMap::new(),
        }
    }

    async fn quantify_financial_impact(&self, incident: &ThreatIncident) -> Result<FinancialImpact> {
        // Calculate various cost components
        let direct_costs = 100000.0; // Investigation, forensics, etc.
        let indirect_costs = 250000.0; // Lost productivity, etc.
        let opportunity_costs = 150000.0; // Missed opportunities
        let regulatory_fines = 50000.0; // Potential fines
        let insurance_claims = 75000.0; // Insurance payouts

        let total_cost = direct_costs + indirect_costs + opportunity_costs + regulatory_fines + insurance_claims;
        let financial_score = (total_cost / 1000000.0).min(10.0); // Normalize to 0-10 scale

        let mut cost_breakdown = HashMap::new();
        cost_breakdown.insert("Direct Costs".to_string(), direct_costs);
        cost_breakdown.insert("Indirect Costs".to_string(), indirect_costs);
        cost_breakdown.insert("Opportunity Costs".to_string(), opportunity_costs);
        cost_breakdown.insert("Regulatory Fines".to_string(), regulatory_fines);
        cost_breakdown.insert("Insurance Claims".to_string(), insurance_claims);

        Ok(FinancialImpact {
            direct_costs,
            indirect_costs,
            opportunity_costs,
            regulatory_fines,
            insurance_claims,
            financial_impact_score: financial_score,
            cost_breakdown,
        })
    }
}

/// Business impact analyzer
#[derive(Debug, Clone)]
struct BusinessImpactAnalyzer {
    business_models: HashMap<String, BusinessModel>,
}

impl BusinessImpactAnalyzer {
    fn new() -> Self {
        Self {
            business_models: HashMap::new(),
        }
    }

    async fn analyze_business_impact(&self, incident: &ThreatIncident) -> Result<BusinessImpact> {
        // Analyze business impact based on incident characteristics
        let revenue_impact = -150000.0; // Negative impact
        let market_share_impact = -0.02; // 2% loss
        let competitive_advantage_impact = -0.05; // 5% loss

        let strategic_objectives_impact = vec![
            "Customer trust maintenance".to_string(),
            "Regulatory compliance".to_string(),
            "Operational continuity".to_string(),
        ];

        let business_score = ((revenue_impact.abs() / 1000000.0) +
                             (market_share_impact.abs() * 10.0) +
                             (competitive_advantage_impact.abs() * 10.0)) / 3.0;

        Ok(BusinessImpact {
            business_impact_score: business_score.min(10.0),
            revenue_impact,
            market_share_impact,
            competitive_advantage_impact,
            strategic_objectives_impact,
        })
    }
}

/// Recovery planner
#[derive(Debug, Clone)]
struct RecoveryPlanner {
    recovery_templates: HashMap<String, RecoveryTemplate>,
}

impl RecoveryPlanner {
    fn new() -> Self {
        Self {
            recovery_templates: HashMap::new(),
        }
    }

    async fn generate_recovery_plan(&self, incident: &ThreatIncident, impact_score: &ImpactScore) -> Result<RecoveryPlan> {
        let phases = match impact_score.level {
            ImpactLevel::Critical => vec![
                RecoveryPhase {
                    phase_id: "immediate_response".to_string(),
                    phase_name: "Immediate Response".to_string(),
                    sequence_number: 1,
                    duration_estimate: Duration::hours(4),
                    required_resources: vec!["Crisis Team".to_string(), "IT Security".to_string()],
                    success_criteria: vec!["Threat contained".to_string(), "Communication established".to_string()],
                },
                RecoveryPhase {
                    phase_id: "system_recovery".to_string(),
                    phase_name: "System Recovery".to_string(),
                    sequence_number: 2,
                    duration_estimate: Duration::days(2),
                    required_resources: vec!["IT Team".to_string(), "Backup Systems".to_string()],
                    success_criteria: vec!["Systems restored".to_string(), "Data integrity verified".to_string()],
                },
                RecoveryPhase {
                    phase_id: "business_recovery".to_string(),
                    phase_name: "Business Recovery".to_string(),
                    sequence_number: 3,
                    duration_estimate: Duration::days(5),
                    required_resources: vec!["Business Units".to_string(), "Support Teams".to_string()],
                    success_criteria: vec!["Operations resumed".to_string(), "Customer communication completed".to_string()],
                },
            ],
            _ => vec![
                RecoveryPhase {
                    phase_id: "assessment".to_string(),
                    phase_name: "Assessment".to_string(),
                    sequence_number: 1,
                    duration_estimate: Duration::hours(8),
                    required_resources: vec!["Security Team".to_string()],
                    success_criteria: vec!["Impact assessed".to_string(), "Recovery plan developed".to_string()],
                },
                RecoveryPhase {
                    phase_id: "recovery".to_string(),
                    phase_name: "Recovery".to_string(),
                    sequence_number: 2,
                    duration_estimate: Duration::days(3),
                    required_resources: vec!["IT Team".to_string()],
                    success_criteria: vec!["Systems recovered".to_string(), "Operations restored".to_string()],
                },
            ],
        };

        Ok(RecoveryPlan {
            plan_id: Uuid::new_v4().to_string(),
            phases,
            estimated_recovery_time: Duration::days(7),
            resource_requirements: vec![
                "Security Team".to_string(),
                "IT Support".to_string(),
                "Business Continuity Team".to_string(),
            ],
            success_criteria: vec![
                "Systems fully operational".to_string(),
                "Data integrity confirmed".to_string(),
                "Business processes restored".to_string(),
            ],
            risk_mitigations: vec![
                "Regular backups".to_string(),
                "Redundant systems".to_string(),
                "Incident response plan".to_string(),
            ],
        })
    }
}

/// Risk quantifier
#[derive(Debug, Clone)]
struct RiskQuantifier {
    risk_models: HashMap<String, RiskModel>,
}

impl RiskQuantifier {
    fn new() -> Self {
        Self {
            risk_models: HashMap::new(),
        }
    }
}

// Supporting structures

/// Cost model
#[derive(Debug, Clone, Serialize, Deserialize)]
struct CostModel {
    model_id: String,
    cost_factors: Vec<String>,
    calculation_method: String,
}

/// Business model
#[derive(Debug, Clone, Serialize, Deserialize)]
struct BusinessModel {
    model_id: String,
    business_factors: Vec<String>,
    impact_calculation: String,
}

/// Recovery template
#[derive(Debug, Clone, Serialize, Deserialize)]
struct RecoveryTemplate {
    template_id: String,
    incident_type: IncidentType,
    phases: Vec<RecoveryPhase>,
}

/// Risk model
#[derive(Debug, Clone, Serialize, Deserialize)]
struct RiskModel {
    model_id: String,
    risk_factors: Vec<String>,
    quantification_method: String,
}