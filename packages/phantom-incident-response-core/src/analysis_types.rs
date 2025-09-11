// Analysis Supporting Types
// 
// Supporting data structures for the analysis module
// These types support comprehensive incident analysis and threat assessment


/// Identified threat actor in analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentifiedThreatActor {
    pub name: String,
    pub confidence: f64,
    pub motivation: String,
    pub sophistication: String,
    pub typical_targets: Vec<String>,
    pub known_techniques: Vec<String>,
    pub geographic_origin: Option<String>,
}

/// Identified attack vector
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentifiedAttackVector {
    pub vector_type: String,
    pub confidence: f64,
    pub description: String,
    pub mitigation_strategies: Vec<String>,
    pub detection_methods: Vec<String>,
}

/// Attack technique used
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackTechnique {
    pub technique_id: String,
    pub technique_name: String,
    pub tactic: String,
    pub confidence: f64,
    pub evidence: Vec<String>,
    pub mitigations: Vec<String>,
}

/// Indicator of compromise
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndicatorOfCompromise {
    pub indicator_type: String,
    pub value: String,
    pub confidence: f64,
    pub first_seen: i64,
    pub last_seen: i64,
    pub context: String,
}

/// Lateral movement indicator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LateralMovementIndicator {
    pub source_system: String,
    pub target_system: String,
    pub method: String,
    pub timestamp: i64,
    pub confidence: f64,
    pub evidence: Vec<String>,
}

/// Business impact assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessImpactAssessment {
    pub processes_affected: Vec<String>,
    pub revenue_impact: f64,
    pub customer_impact: f64,
    pub supplier_impact: f64,
    pub impact_score: f64,
}

/// Technical impact assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechnicalImpactAssessment {
    pub systems_compromised: Vec<String>,
    pub data_integrity_impact: f64,
    pub availability_impact: f64,
    pub confidentiality_impact: f64,
    pub impact_score: f64,
}

/// Financial impact assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinancialImpactAssessment {
    pub direct_costs: f64,
    pub indirect_costs: f64,
    pub opportunity_costs: f64,
    pub recovery_costs: f64,
    pub impact_score: f64,
}

/// Compliance impact assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceImpactAssessment {
    pub regulations_affected: Vec<String>,
    pub compliance_risk: f64,
    pub notification_required: bool,
    pub potential_penalties: f64,
}

/// Reputation impact assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReputationImpactAssessment {
    pub severity: String,
    pub stakeholder_groups: Vec<String>,
    pub media_attention_risk: f64,
    pub recovery_timeframe: String,
}

/// Operational impact assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OperationalImpactAssessment {
    pub services_affected: Vec<String>,
    pub availability_impact: f64,
    pub performance_impact: f64,
    pub capacity_impact: f64,
}

/// Similar incident found in pattern analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimilarIncident {
    pub incident_id: String,
    pub similarity_score: f64,
    pub common_attributes: Vec<String>,
    pub outcome: String,
    pub lessons_learned: Vec<String>,
}

/// Attack pattern identified
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackPattern {
    pub pattern_name: String,
    pub confidence: f64,
    pub description: String,
    pub stages: Vec<String>,
    pub indicators: Vec<String>,
}

/// Temporal pattern in incidents
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemporalPattern {
    pub pattern_type: String,
    pub frequency: String,
    pub time_windows: Vec<String>,
    pub confidence: f64,
    pub implications: Vec<String>,
}

/// Behavioral pattern observed
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralPattern {
    pub behavior_type: String,
    pub description: String,
    pub confidence: f64,
    pub indicators: Vec<String>,
    pub risk_level: String,
}

/// Anomaly detected in analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Anomaly {
    pub anomaly_type: String,
    pub description: String,
    pub severity: String,
    pub confidence: f64,
    pub context: HashMap<String, String>,
}

/// Risk factor contributing to overall risk
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFactor {
    pub factor_name: String,
    pub factor_type: String,
    pub weight: f64,
    pub value: f64,
    pub description: String,
    pub mitigation_strategies: Vec<String>,
}

/// Risk timeline event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskTimelineEvent {
    pub timestamp: i64,
    pub event_type: String,
    pub risk_change: f64,
    pub description: String,
    pub factors: Vec<String>,
}

/// Severity factor contributing to severity assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeverityFactor {
    pub factor_name: String,
    pub weight: f64,
    pub value: f64,
    pub justification: String,
}

/// Attributed threat actor
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttributedActor {
    pub actor_name: String,
    pub confidence: f64,
    pub attribution_methods: Vec<String>,
    pub supporting_evidence: Vec<String>,
    pub geographic_indicators: Vec<String>,
    pub capability_assessment: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_threat_actor_creation() {
        let actor = IdentifiedThreatActor {
            name: "APT28".to_string(),
            confidence: 0.85,
            motivation: "State-sponsored espionage".to_string(),
            sophistication: "High".to_string(),
            typical_targets: vec!["Government".to_string(), "Military".to_string()],
            known_techniques: vec!["Spear phishing".to_string(), "Zero-day exploits".to_string()],
            geographic_origin: Some("Russia".to_string()),
        };

        assert_eq!(actor.name, "APT28");
        assert!(actor.confidence > 0.8);
    }

    #[test]
    fn test_impact_assessment_calculation() {
        let business_impact = BusinessImpactAssessment {
            processes_affected: vec!["Email".to_string(), "File sharing".to_string()],
            revenue_impact: 50000.0,
            customer_impact: 0.6,
            supplier_impact: 0.2,
            impact_score: 0.7,
        };

        assert_eq!(business_impact.processes_affected.len(), 2);
        assert!(business_impact.impact_score > 0.5);
    }
}