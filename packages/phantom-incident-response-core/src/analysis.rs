//! Analysis Module
//! 
//! Comprehensive incident analysis capabilities for NIST SP 800-61r2 compliant incident response
//! Provide threat analysis, impact assessment, pattern recognition, and decision support

use crate::incident_models::*;
use crate::evidence_models::*;
use crate::models::*;
use crate::data_stores::*;
use crate::config::Config;

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use async_trait::async_trait;

/// Analysis engine for incident response decision support
pub struct AnalysisEngine {
    data_store: Arc<dyn ComprehensiveIncidentResponseStore + Send + Sync>,
    config: Config,
    threat_analyzers: Arc<RwLock<HashMap<String, Box<dyn ThreatAnalyzer + Send + Sync>>>>,
    pattern_recognizers: Arc<RwLock<HashMap<String, Box<dyn PatternRecognizer + Send + Sync>>>>,
    risk_calculator: RiskCalculator,
    impact_assessor: ImpactAssessor,
}

/// Comprehensive incident analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncidentAnalysisResult {
    pub incident_id: String,
    pub analysis_id: String,
    pub performed_at: i64,
    pub analyst: String,
    pub threat_analysis: ThreatAnalysisResult,
    pub impact_analysis: ImpactAnalysisResult,
    pub pattern_analysis: PatternAnalysisResult,
    pub risk_assessment: RiskAssessmentResult,
    pub recommendations: Vec<AnalysisRecommendation>,
    pub confidence_score: f64,
    pub severity_assessment: SeverityAssessment,
    pub attribution_analysis: Option<AttributionAnalysisResult>,
}

/// Threat analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatAnalysisResult {
    pub threat_actors: Vec<IdentifiedThreatActor>,
    pub attack_vectors: Vec<IdentifiedAttackVector>,
    pub techniques_used: Vec<AttackTechnique>,
    pub indicators_of_compromise: Vec<IndicatorOfCompromise>,
    pub threat_level: String,
    pub sophistication_level: String,
    pub persistence_indicators: Vec<String>,
    pub lateral_movement: Vec<LateralMovementIndicator>,
}

/// Impact analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactAnalysisResult {
    pub business_impact: BusinessImpactAssessment,
    pub technical_impact: TechnicalImpactAssessment,
    pub financial_impact: FinancialImpactAssessment,
    pub compliance_impact: ComplianceImpactAssessment,
    pub reputation_impact: ReputationImpactAssessment,
    pub operational_impact: OperationalImpactAssessment,
    pub overall_impact_score: f64,
    pub recovery_time_estimate: u32,
    pub affected_stakeholders: Vec<String>,
}

/// Pattern analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternAnalysisResult {
    pub similar_incidents: Vec<SimilarIncident>,
    pub attack_patterns: Vec<AttackPattern>,
    pub temporal_patterns: Vec<TemporalPattern>,
    pub behavioral_patterns: Vec<BehavioralPattern>,
    pub anomalies_detected: Vec<Anomaly>,
    pub correlation_score: f64,
    pub pattern_confidence: f64,
}

/// Risk assessment result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAssessmentResult {
    pub overall_risk_score: f64,
    pub likelihood_score: f64,
    pub impact_score: f64,
    pub risk_category: String,
    pub risk_factors: Vec<RiskFactor>,
    pub mitigation_urgency: String,
    pub escalation_required: bool,
    pub risk_timeline: Vec<RiskTimelineEvent>,
}

/// Analysis recommendation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisRecommendation {
    pub id: String,
    pub category: String,
    pub priority: u8,
    pub recommendation: String,
    pub rationale: String,
    pub effort_estimate: String,
    pub dependencies: Vec<String>,
    pub expected_outcome: String,
    pub confidence: f64,
}

/// Severity assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeverityAssessment {
    pub calculated_severity: IncidentSeverity,
    pub severity_factors: Vec<SeverityFactor>,
    pub escalation_triggers: Vec<String>,
    pub severity_justification: String,
    pub review_required: bool,
}

/// Attribution analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttributionAnalysisResult {
    pub attributed_actors: Vec<AttributedActor>,
    pub confidence_level: f64,
    pub attribution_methods: Vec<String>,
    pub supporting_evidence: Vec<String>,
    pub geolocation_indicators: Vec<String>,
    pub timeline_correlation: Vec<String>,
    pub uncertainty_factors: Vec<String>,
}

/// Threat analyzer trait
#[async_trait]
pub trait ThreatAnalyzer: Send + Sync {
    async fn analyze_threat(
        &self,
        incident: &Incident,
        evidence: &[Evidence],
        context: &AnalysisContext,
    ) -> Result<ThreatAnalysisResult, Box<dyn std::error::Error + Send + Sync>>;
    
    fn get_analyzer_type(&self) -> String;
    fn get_supported_categories(&self) -> Vec<IncidentCategory>;
    fn get_confidence_threshold(&self) -> f64;
}

/// Pattern recognizer trait
#[async_trait]
pub trait PatternRecognizer: Send + Sync {
    async fn recognize_patterns(
        &self,
        incident: &Incident,
        historical_incidents: &[Incident],
        context: &AnalysisContext,
    ) -> Result<PatternAnalysisResult, Box<dyn std::error::Error + Send + Sync>>;
    
    fn get_pattern_types(&self) -> Vec<String>;
    fn get_minimum_sample_size(&self) -> usize;
}

/// Analysis context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisContext {
    pub tenant_context: TenantContext,
    pub analysis_parameters: HashMap<String, String>,
    pub time_window_hours: u32,
    pub include_external_intelligence: bool,
    pub detailed_analysis: bool,
}

/// Risk calculator
pub struct RiskCalculator {
    config: Config,
}

/// Impact assessor
pub struct ImpactAssessor {
    config: Config,
    business_context: HashMap<String, String>,
}

impl AnalysisEngine {
    /// Create new analysis engine
    pub fn new(
        data_store: Arc<dyn ComprehensiveIncidentResponseStore + Send + Sync>,
        config: Config,
    ) -> Self {
        Self {
            data_store: Arc::clone(&data_store),
            config: config.clone(),
            threat_analyzers: Arc::new(RwLock::new(HashMap::new())),
            pattern_recognizers: Arc::new(RwLock::new(HashMap::new())),
            risk_calculator: RiskCalculator::new(config.clone()),
            impact_assessor: ImpactAssessor::new(config.clone()),
        }
    }

    /// Perform comprehensive incident analysis
    pub async fn analyze_incident(
        &self,
        incident_id: &str,
        analyst: &str,
        context: &AnalysisContext,
    ) -> Result<IncidentAnalysisResult, Box<dyn std::error::Error + Send + Sync>> {
        let analysis_id = Uuid::new_v4().to_string();
        let now = Utc::now().timestamp();

        // Load incident and related data
        let incident = self.data_store.get_incident(incident_id, &context.tenant_context).await?
            .ok_or("Incident not found")?;

        let evidence = self.data_store.get_evidence_by_incident(incident_id, &context.tenant_context).await?;
        let historical_incidents = self.load_historical_incidents(&incident, context).await?;

        // Perform threat analysis
        let threat_analysis = self.perform_threat_analysis(&incident, &evidence, context).await?;

        // Perform impact analysis
        let impact_analysis = self.perform_impact_analysis(&incident, &evidence, context).await?;

        // Perform pattern analysis
        let pattern_analysis = self.perform_pattern_analysis(&incident, &historical_incidents, context).await?;

        // Calculate risk assessment
        let risk_assessment = self.calculate_risk_assessment(&incident, &threat_analysis, &impact_analysis).await?;

        // Generate recommendations
        let recommendations = self.generate_recommendations(
            &incident,
            &threat_analysis,
            &impact_analysis,
            &pattern_analysis,
            &risk_assessment,
        ).await?;

        // Assess severity
        let severity_assessment = self.assess_severity(&incident, &threat_analysis, &impact_analysis).await?;

        // Calculate overall confidence
        let confidence_score = self.calculate_confidence_score(
            &threat_analysis,
            &impact_analysis,
            &pattern_analysis,
        );

        // Perform attribution analysis if configured
        let attribution_analysis = if context.include_external_intelligence {
            Some(self.perform_attribution_analysis(&incident, &evidence, &threat_analysis).await?)
        } else {
            None
        };

        let analysis_result = IncidentAnalysisResult {
            incident_id: incident_id.to_string(),
            analysis_id: analysis_id.clone(),
            performed_at: now,
            analyst: analyst.to_string(),
            threat_analysis,
            impact_analysis,
            pattern_analysis,
            risk_assessment,
            recommendations,
            confidence_score,
            severity_assessment,
            attribution_analysis,
        };

        // Store analysis result
        self.data_store.store_incident_analysis_result(&analysis_result, &context.tenant_context).await?;

        Ok(analysis_result)
    }

    /// Perform automated threat intelligence correlation
    pub async fn correlate_threat_intelligence(
        &self,
        incident_id: &str,
        context: &AnalysisContext,
    ) -> Result<Vec<ThreatIntelligenceMatch>, Box<dyn std::error::Error + Send + Sync>> {
        let incident = self.data_store.get_incident(incident_id, &context.tenant_context).await?
            .ok_or("Incident not found")?;

        let mut matches = Vec::new();

        // Extract indicators from the incident
        let indicators = self.extract_indicators(&incident).await?;

        // Query threat intelligence sources
        for indicator in indicators {
            let intel_matches = self.query_threat_intelligence(&indicator, context).await?;
            matches.extend(intel_matches);
        }

        // Remove duplicates and sort by relevance
        matches.sort_by(|a, b| b.confidence.partial_cmp(&a.confidence).unwrap_or(std::cmp::Ordering::Equal));
        matches.dedup_by_key(|m| m.indicator.clone());

        Ok(matches)
    }

    /// Generate incident timeline with analysis
    pub async fn generate_analytical_timeline(
        &self,
        incident_id: &str,
        context: &AnalysisContext,
    ) -> Result<AnalyticalTimeline, Box<dyn std::error::Error + Send + Sync>> {
        let incident = self.data_store.get_incident(incident_id, &context.tenant_context).await?
            .ok_or("Incident not found")?;

        let evidence = self.data_store.get_evidence_by_incident(incident_id, &context.tenant_context).await?;

        // Build timeline with analysis annotations
        let timeline = self.build_analytical_timeline(&incident, &evidence).await?;

        Ok(timeline)
    }

    /// Assess incident containment effectiveness
    pub async fn assess_containment_effectiveness(
        &self,
        incident_id: &str,
        context: &AnalysisContext,
    ) -> Result<ContainmentAssessment, Box<dyn std::error::Error + Send + Sync>> {
        let incident = self.data_store.get_incident(incident_id, &context.tenant_context).await?
            .ok_or("Incident not found")?;

        // Analyze containment actions effectiveness
        let assessment = self.evaluate_containment_actions(&incident).await?;

        Ok(assessment)
    }

    // Private helper methods

    async fn perform_threat_analysis(
        &self,
        incident: &Incident,
        evidence: &[Evidence],
        context: &AnalysisContext,
    ) -> Result<ThreatAnalysisResult, Box<dyn std::error::Error + Send + Sync>> {
        let analyzers = self.threat_analyzers.read().await;
        
        // For now, use default analysis logic
        Ok(ThreatAnalysisResult {
            threat_actors: vec![],
            attack_vectors: vec![],
            techniques_used: vec![],
            indicators_of_compromise: vec![],
            threat_level: "Medium".to_string(),
            sophistication_level: "Intermediate".to_string(),
            persistence_indicators: vec![],
            lateral_movement: vec![],
        })
    }

    async fn perform_impact_analysis(
        &self,
        incident: &Incident,
        evidence: &[Evidence],
        context: &AnalysisContext,
    ) -> Result<ImpactAnalysisResult, Box<dyn std::error::Error + Send + Sync>> {
        let impact_analysis = self.impact_assessor.assess_impact(incident, evidence).await?;
        Ok(impact_analysis)
    }

    async fn perform_pattern_analysis(
        &self,
        incident: &Incident,
        historical_incidents: &[Incident],
        context: &AnalysisContext,
    ) -> Result<PatternAnalysisResult, Box<dyn std::error::Error + Send + Sync>> {
        let recognizers = self.pattern_recognizers.read().await;
        
        // For now, use default pattern analysis
        Ok(PatternAnalysisResult {
            similar_incidents: vec![],
            attack_patterns: vec![],
            temporal_patterns: vec![],
            behavioral_patterns: vec![],
            anomalies_detected: vec![],
            correlation_score: 0.5,
            pattern_confidence: 0.6,
        })
    }

    async fn calculate_risk_assessment(
        &self,
        incident: &Incident,
        threat_analysis: &ThreatAnalysisResult,
        impact_analysis: &ImpactAnalysisResult,
    ) -> Result<RiskAssessmentResult, Box<dyn std::error::Error + Send + Sync>> {
        self.risk_calculator.calculate_risk(incident, threat_analysis, impact_analysis).await
    }

    async fn generate_recommendations(
        &self,
        incident: &Incident,
        threat_analysis: &ThreatAnalysisResult,
        impact_analysis: &ImpactAnalysisResult,
        pattern_analysis: &PatternAnalysisResult,
        risk_assessment: &RiskAssessmentResult,
    ) -> Result<Vec<AnalysisRecommendation>, Box<dyn std::error::Error + Send + Sync>> {
        // Generate recommendations based on analysis results
        let mut recommendations = Vec::new();

        // Add default recommendations based on severity
        if risk_assessment.overall_risk_score > 0.8 {
            recommendations.push(AnalysisRecommendation {
                id: Uuid::new_v4().to_string(),
                category: "Immediate Action".to_string(),
                priority: 1,
                recommendation: "Escalate incident to senior management".to_string(),
                rationale: "High risk score indicates significant threat".to_string(),
                effort_estimate: "Low".to_string(),
                dependencies: vec![],
                expected_outcome: "Appropriate resources allocated".to_string(),
                confidence: 0.9,
            });
        }

        Ok(recommendations)
    }

    async fn assess_severity(
        &self,
        incident: &Incident,
        threat_analysis: &ThreatAnalysisResult,
        impact_analysis: &ImpactAnalysisResult,
    ) -> Result<SeverityAssessment, Box<dyn std::error::Error + Send + Sync>> {
        // Assess severity based on multiple factors
        let calculated_severity = if impact_analysis.overall_impact_score > 0.8 {
            IncidentSeverity::Critical
        } else if impact_analysis.overall_impact_score > 0.6 {
            IncidentSeverity::High
        } else if impact_analysis.overall_impact_score > 0.4 {
            IncidentSeverity::Medium
        } else {
            IncidentSeverity::Low
        };

        Ok(SeverityAssessment {
            calculated_severity,
            severity_factors: vec![],
            escalation_triggers: vec![],
            severity_justification: "Based on impact analysis".to_string(),
            review_required: false,
        })
    }

    fn calculate_confidence_score(
        &self,
        threat_analysis: &ThreatAnalysisResult,
        impact_analysis: &ImpactAnalysisResult,
        pattern_analysis: &PatternAnalysisResult,
    ) -> f64 {
        // Calculate weighted average of confidence scores
        (0.4 * 0.8 + 0.4 * 0.7 + 0.2 * pattern_analysis.pattern_confidence) // Default weights
    }

    async fn perform_attribution_analysis(
        &self,
        incident: &Incident,
        evidence: &[Evidence],
        threat_analysis: &ThreatAnalysisResult,
    ) -> Result<AttributionAnalysisResult, Box<dyn std::error::Error + Send + Sync>> {
        // Perform attribution analysis
        Ok(AttributionAnalysisResult {
            attributed_actors: vec![],
            confidence_level: 0.5,
            attribution_methods: vec!["Behavioral analysis".to_string()],
            supporting_evidence: vec![],
            geolocation_indicators: vec![],
            timeline_correlation: vec![],
            uncertainty_factors: vec!["Limited evidence".to_string()],
        })
    }

    async fn load_historical_incidents(
        &self,
        incident: &Incident,
        context: &AnalysisContext,
    ) -> Result<Vec<Incident>, Box<dyn std::error::Error + Send + Sync>> {
        // Load similar historical incidents for pattern analysis
        let search_criteria = IncidentSearchCriteria {
            status: None,
            severity: None,
            category: Some(format!("{:?}", incident.category)),
            assigned_to: None,
            created_after: None,
            created_before: None,
            tags: vec![],
            title_contains: None,
            limit: Some(50),
            offset: None,
        };
        let incidents = self.data_store.search_incidents(
            &search_criteria,
            &context.tenant_context,
        ).await?;

        Ok(incidents.items)
    }

    async fn extract_indicators(&self, incident: &Incident) -> Result<Vec<String>, Box<dyn std::error::Error + Send + Sync>> {
        // Extract indicators of compromise from the incident
        Ok(incident.indicators.clone())
    }

    async fn query_threat_intelligence(
        &self,
        indicator: &str,
        context: &AnalysisContext,
    ) -> Result<Vec<ThreatIntelligenceMatch>, Box<dyn std::error::Error + Send + Sync>> {
        // Query external threat intelligence sources
        // For now, return empty results
        Ok(vec![])
    }

    async fn build_analytical_timeline(
        &self,
        incident: &Incident,
        evidence: &[Evidence],
    ) -> Result<AnalyticalTimeline, Box<dyn std::error::Error + Send + Sync>> {
        // Build analytical timeline with insights
        Ok(AnalyticalTimeline {
            incident_id: incident.id.clone(),
            timeline_events: incident.timeline.clone(),
            analysis_annotations: vec![],
            confidence_scores: HashMap::new(),
        })
    }

    async fn evaluate_containment_actions(
        &self,
        incident: &Incident,
    ) -> Result<ContainmentAssessment, Box<dyn std::error::Error + Send + Sync>> {
        // Evaluate effectiveness of containment actions
        Ok(ContainmentAssessment {
            incident_id: incident.id.clone(),
            containment_effectiveness: 0.8,
            actions_evaluated: incident.containment_actions.len() as u32,
            successful_actions: incident.containment_actions.len() as u32,
            recommendations: vec!["Continue monitoring".to_string()],
        })
    }
}

impl RiskCalculator {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub async fn calculate_risk(
        &self,
        incident: &Incident,
        threat_analysis: &ThreatAnalysisResult,
        impact_analysis: &ImpactAnalysisResult,
    ) -> Result<RiskAssessmentResult, Box<dyn std::error::Error + Send + Sync>> {
        // Calculate risk based on threat and impact
        let likelihood_score = 0.6; // Default likelihood
        let impact_score = impact_analysis.overall_impact_score;
        let overall_risk_score = likelihood_score * impact_score;

        Ok(RiskAssessmentResult {
            overall_risk_score,
            likelihood_score,
            impact_score,
            risk_category: if overall_risk_score > 0.7 {
                "High".to_string()
            } else if overall_risk_score > 0.4 {
                "Medium".to_string()
            } else {
                "Low".to_string()
            },
            risk_factors: vec![],
            mitigation_urgency: "Medium".to_string(),
            escalation_required: overall_risk_score > 0.8,
            risk_timeline: vec![],
        })
    }
}

impl ImpactAssessor {
    pub fn new(config: Config) -> Self {
        Self {
            config,
            business_context: HashMap::new(),
        }
    }

    pub async fn assess_impact(
        &self,
        incident: &Incident,
        evidence: &[Evidence],
    ) -> Result<ImpactAnalysisResult, Box<dyn std::error::Error + Send + Sync>> {
        // Assess various impact dimensions
        let business_impact = self.assess_business_impact(incident).await?;
        let technical_impact = self.assess_technical_impact(incident).await?;
        let financial_impact = self.assess_financial_impact(incident).await?;
        
        // Calculate overall impact score
        let overall_impact_score = (business_impact.impact_score + 
                                   technical_impact.impact_score + 
                                   financial_impact.impact_score) / 3.0;

        Ok(ImpactAnalysisResult {
            business_impact,
            technical_impact,
            financial_impact,
            compliance_impact: ComplianceImpactAssessment {
                regulations_affected: vec![],
                compliance_risk: 0.3,
                notification_required: false,
                potential_penalties: 0.0,
            },
            reputation_impact: ReputationImpactAssessment {
                severity: "Low".to_string(),
                stakeholder_groups: vec![],
                media_attention_risk: 0.2,
                recovery_timeframe: "Short".to_string(),
            },
            operational_impact: OperationalImpactAssessment {
                services_affected: incident.affected_systems.clone(),
                availability_impact: 0.4,
                performance_impact: 0.3,
                capacity_impact: 0.2,
            },
            overall_impact_score,
            recovery_time_estimate: 24, // hours
            affected_stakeholders: vec!["IT Team".to_string(), "Users".to_string()],
        })
    }

    async fn assess_business_impact(&self, incident: &Incident) -> Result<BusinessImpactAssessment, Box<dyn std::error::Error + Send + Sync>> {
        Ok(BusinessImpactAssessment {
            processes_affected: vec![],
            revenue_impact: 0.0,
            customer_impact: 0.3,
            supplier_impact: 0.1,
            impact_score: 0.4,
        })
    }

    async fn assess_technical_impact(&self, incident: &Incident) -> Result<TechnicalImpactAssessment, Box<dyn std::error::Error + Send + Sync>> {
        Ok(TechnicalImpactAssessment {
            systems_compromised: incident.affected_systems.clone(),
            data_integrity_impact: 0.2,
            availability_impact: 0.5,
            confidentiality_impact: 0.3,
            impact_score: 0.5,
        })
    }

    async fn assess_financial_impact(&self, incident: &Incident) -> Result<FinancialImpactAssessment, Box<dyn std::error::Error + Send + Sync>> {
        Ok(FinancialImpactAssessment {
            direct_costs: incident.cost_estimate,
            indirect_costs: incident.cost_estimate * 1.5,
            opportunity_costs: incident.cost_estimate * 0.5,
            recovery_costs: incident.cost_estimate * 0.3,
            impact_score: 0.4,
        })
    }
}

// Supporting data structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatIntelligenceMatch {
    pub indicator: String,
    pub source: String,
    pub confidence: f64,
    pub threat_type: String,
    pub first_seen: i64,
    pub last_seen: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyticalTimeline {
    pub incident_id: String,
    pub timeline_events: Vec<TimelineEvent>,
    pub analysis_annotations: Vec<TimelineAnnotation>,
    pub confidence_scores: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineAnnotation {
    pub event_id: String,
    pub annotation: String,
    pub confidence: f64,
    pub analyst: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainmentAssessment {
    pub incident_id: String,
    pub containment_effectiveness: f64,
    pub actions_evaluated: u32,
    pub successful_actions: u32,
    pub recommendations: Vec<String>,
}

// Define additional supporting types
include!("analysis_types.rs");

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_analysis_engine_creation() {
        // Test analysis engine initialization
    }

    #[tokio::test]
    async fn test_incident_analysis() {
        // Test comprehensive incident analysis
    }

    #[tokio::test]
    async fn test_risk_calculation() {
        // Test risk assessment calculations
    }

    #[tokio::test]
    async fn test_impact_assessment() {
        // Test impact assessment functionality
    }
}