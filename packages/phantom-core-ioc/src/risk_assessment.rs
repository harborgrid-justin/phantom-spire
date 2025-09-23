// phantom-ioc-core/src/risk_assessment.rs
// Advanced risk scoring, impact analysis, and business risk calculations

use crate::types::*;
use async_trait::async_trait;
use chrono::{DateTime, Utc, Duration};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Risk assessment engine for comprehensive risk analysis
pub struct RiskAssessmentEngine {
    risk_models: Arc<RwLock<HashMap<String, RiskModel>>>,
    asset_inventory: Arc<RwLock<HashMap<String, BusinessAsset>>>,
    threat_landscape: Arc<RwLock<HashMap<String, ThreatProfile>>>,
    risk_assessments: Arc<RwLock<HashMap<String, RiskAssessment>>>,
    statistics: Arc<RwLock<RiskAssessmentStats>>,
}

impl RiskAssessmentEngine {
    /// Create a new risk assessment engine
    pub async fn new() -> Result<Self, IOCError> {
        let engine = Self {
            risk_models: Arc::new(RwLock::new(HashMap::new())),
            asset_inventory: Arc::new(RwLock::new(HashMap::new())),
            threat_landscape: Arc::new(RwLock::new(HashMap::new())),
            risk_assessments: Arc::new(RwLock::new(HashMap::new())),
            statistics: Arc::new(RwLock::new(RiskAssessmentStats::default())),
        };

        // Initialize with default data
        engine.initialize_defaults().await?;

        Ok(engine)
    }

    /// Initialize default risk models and data
    async fn initialize_defaults(&self) -> Result<(), IOCError> {
        // Initialize risk models
        let default_models = vec![
            RiskModel {
                id: "cvss_based".to_string(),
                name: "CVSS-Based Risk Model".to_string(),
                description: "Risk assessment based on CVSS scoring methodology".to_string(),
                factors: vec![
                    RiskFactor {
                        name: "exploit_complexity".to_string(),
                        weight: 0.2,
                        scale: RiskScale::Low,
                        description: "Complexity of exploiting the vulnerability".to_string(),
                    },
                    RiskFactor {
                        name: "attack_vector".to_string(),
                        weight: 0.25,
                        scale: RiskScale::High,
                        description: "Network accessibility of the attack".to_string(),
                    },
                    RiskFactor {
                        name: "privileges_required".to_string(),
                        weight: 0.15,
                        scale: RiskScale::Medium,
                        description: "Level of privileges required".to_string(),
                    },
                    RiskFactor {
                        name: "user_interaction".to_string(),
                        weight: 0.1,
                        scale: RiskScale::Low,
                        description: "User interaction requirements".to_string(),
                    },
                    RiskFactor {
                        name: "impact_confidentiality".to_string(),
                        weight: 0.1,
                        scale: RiskScale::High,
                        description: "Impact on confidentiality".to_string(),
                    },
                    RiskFactor {
                        name: "impact_integrity".to_string(),
                        weight: 0.1,
                        scale: RiskScale::High,
                        description: "Impact on integrity".to_string(),
                    },
                    RiskFactor {
                        name: "impact_availability".to_string(),
                        weight: 0.1,
                        scale: RiskScale::Medium,
                        description: "Impact on availability".to_string(),
                    },
                ],
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            RiskModel {
                id: "business_impact".to_string(),
                name: "Business Impact Risk Model".to_string(),
                description: "Risk assessment focused on business impact".to_string(),
                factors: vec![
                    RiskFactor {
                        name: "revenue_impact".to_string(),
                        weight: 0.3,
                        scale: RiskScale::High,
                        description: "Direct impact on revenue".to_string(),
                    },
                    RiskFactor {
                        name: "operational_disruption".to_string(),
                        weight: 0.25,
                        scale: RiskScale::High,
                        description: "Disruption to business operations".to_string(),
                    },
                    RiskFactor {
                        name: "reputation_damage".to_string(),
                        weight: 0.2,
                        scale: RiskScale::Medium,
                        description: "Potential reputation damage".to_string(),
                    },
                    RiskFactor {
                        name: "compliance_impact".to_string(),
                        weight: 0.15,
                        scale: RiskScale::Medium,
                        description: "Impact on regulatory compliance".to_string(),
                    },
                    RiskFactor {
                        name: "recovery_time".to_string(),
                        weight: 0.1,
                        scale: RiskScale::Low,
                        description: "Time required for recovery".to_string(),
                    },
                ],
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
        ];

        let mut models = self.risk_models.write().await;
        for model in default_models {
            models.insert(model.id.clone(), model);
        }

        // Initialize sample assets
        let default_assets = vec![
            BusinessAsset {
                id: "web_server_cluster".to_string(),
                name: "Production Web Servers".to_string(),
                asset_type: AssetType::Infrastructure,
                business_value: AssetValue::High,
                criticality: AssetCriticality::Critical,
                exposure_level: ExposureLevel::External,
                dependencies: vec!["database_cluster".to_string(), "load_balancer".to_string()],
                metadata: HashMap::from([
                    ("location".to_string(), serde_json::Value::String("primary_datacenter".to_string())),
                    ("team".to_string(), serde_json::Value::String("platform_engineering".to_string())),
                ]),
            },
            BusinessAsset {
                id: "customer_database".to_string(),
                name: "Customer Data Database".to_string(),
                asset_type: AssetType::Data,
                business_value: AssetValue::Critical,
                criticality: AssetCriticality::Critical,
                exposure_level: ExposureLevel::Internal,
                dependencies: vec!["database_cluster".to_string()],
                metadata: HashMap::from([
                    ("data_classification".to_string(), serde_json::Value::String("sensitive".to_string())),
                    ("compliance_requirements".to_string(), serde_json::Value::Array(vec![
                        serde_json::Value::String("GDPR".to_string()),
                        serde_json::Value::String("PCI-DSS".to_string()),
                    ])),
                ]),
            },
            BusinessAsset {
                id: "employee_workstations".to_string(),
                name: "Employee Workstation Fleet".to_string(),
                asset_type: AssetType::Endpoint,
                business_value: AssetValue::Medium,
                criticality: AssetCriticality::Medium,
                exposure_level: ExposureLevel::Internal,
                dependencies: vec!["active_directory".to_string()],
                metadata: HashMap::from([
                    ("count".to_string(), serde_json::Value::Number(serde_json::Number::from(500))),
                ]),
            },
        ];

        let mut assets = self.asset_inventory.write().await;
        for asset in default_assets {
            assets.insert(asset.id.clone(), asset);
        }

        // Initialize threat profiles
        let default_threats = vec![
            ThreatProfile {
                id: "apt_groups".to_string(),
                name: "Advanced Persistent Threat Groups".to_string(),
                sophistication: ThreatSophistication::High,
                motivation: vec!["espionage".to_string(), "financial".to_string()],
                capabilities: vec![
                    "zero_day_exploits".to_string(),
                    "social_engineering".to_string(),
                    "supply_chain_attacks".to_string(),
                ],
                targeting_likelihood: 0.3,
                success_probability: 0.4,
                typical_impact: ImpactLevel::High,
            },
            ThreatProfile {
                id: "cybercriminals".to_string(),
                name: "Financially Motivated Cybercriminals".to_string(),
                sophistication: ThreatSophistication::Medium,
                motivation: vec!["financial".to_string()],
                capabilities: vec![
                    "ransomware".to_string(),
                    "credential_theft".to_string(),
                    "payment_fraud".to_string(),
                ],
                targeting_likelihood: 0.6,
                success_probability: 0.3,
                typical_impact: ImpactLevel::Medium,
            },
            ThreatProfile {
                id: "insider_threats".to_string(),
                name: "Malicious Insiders".to_string(),
                sophistication: ThreatSophistication::Low,
                motivation: vec!["revenge".to_string(), "financial".to_string()],
                capabilities: vec![
                    "privileged_access_abuse".to_string(),
                    "data_exfiltration".to_string(),
                ],
                targeting_likelihood: 0.1,
                success_probability: 0.7,
                typical_impact: ImpactLevel::High,
            },
        ];

        let mut threats = self.threat_landscape.write().await;
        for threat in default_threats {
            threats.insert(threat.id.clone(), threat);
        }

        Ok(())
    }

    /// Perform comprehensive risk assessment for an IOC
    pub async fn assess_risk(&self, ioc: &IOC, context: &RiskContext) -> Result<RiskAssessment, IOCError> {
        let assessment_id = Uuid::new_v4().to_string();
        let start_time = Utc::now();

        // Get applicable risk model
        let model = {
            let models = self.risk_models.read().await;
            models.get(&context.risk_model_id)
                .ok_or_else(|| IOCError::Validation(format!("Risk model not found: {}", context.risk_model_id)))?
                .clone()
        };

        // Calculate base risk score
        let base_risk = self.calculate_base_risk_score(ioc, &model).await?;
        
        // Calculate environmental factors
        let environmental_score = self.calculate_environmental_score(ioc, context).await?;
        
        // Calculate threat landscape factors
        let threat_score = self.calculate_threat_landscape_score(ioc).await?;
        
        // Calculate business impact
        let business_impact = self.calculate_business_impact(ioc, context).await?;
        
        // Calculate overall risk score
        let overall_risk = self.calculate_overall_risk(base_risk, environmental_score, threat_score, business_impact).await?;
        
        // Generate risk matrix
        let risk_matrix = self.generate_risk_matrix(overall_risk, business_impact).await;
        
        // Generate mitigation recommendations
        let mitigations = self.generate_mitigations(ioc, overall_risk, &risk_matrix).await?;
        
        let assessment = RiskAssessment {
            id: assessment_id.clone(),
            ioc_id: ioc.id.to_string(),
            risk_model_id: model.id.clone(),
            assessment_time: start_time,
            base_risk_score: base_risk,
            environmental_score,
            threat_landscape_score: threat_score,
            business_impact_score: business_impact,
            overall_risk_score: overall_risk,
            risk_level: self.determine_risk_level(overall_risk),
            risk_matrix,
            affected_assets: context.affected_assets.clone(),
            potential_impact: self.assess_potential_impact(ioc, &context.affected_assets).await?,
            mitigation_recommendations: mitigations,
            confidence_level: self.calculate_confidence_level(ioc, context).await,
            validity_period: Duration::days(30),
            metadata: HashMap::from([
                ("assessment_version".to_string(), serde_json::Value::String("1.0".to_string())),
                ("analyst".to_string(), serde_json::Value::String(context.analyst.clone())),
            ]),
        };

        // Store assessment
        {
            let mut assessments = self.risk_assessments.write().await;
            assessments.insert(assessment_id, assessment.clone());
        }

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.total_assessments += 1;
            match assessment.risk_level {
                RiskLevel::Critical => stats.critical_risks += 1,
                RiskLevel::High => stats.high_risks += 1,
                RiskLevel::Medium => stats.medium_risks += 1,
                RiskLevel::Low => stats.low_risks += 1,
            }
            stats.last_assessment_time = Some(Utc::now());
        }

        Ok(assessment)
    }

    /// Calculate base risk score using the risk model
    async fn calculate_base_risk_score(&self, ioc: &IOC, model: &RiskModel) -> Result<f64, IOCError> {
        let mut weighted_score = 0.0;
        let mut total_weight = 0.0;

        for factor in &model.factors {
            let factor_score = match factor.name.as_str() {
                "exploit_complexity" => self.assess_exploit_complexity(ioc).await,
                "attack_vector" => self.assess_attack_vector(ioc).await,
                "privileges_required" => self.assess_privileges_required(ioc).await,
                "user_interaction" => self.assess_user_interaction(ioc).await,
                "impact_confidentiality" => self.assess_confidentiality_impact(ioc).await,
                "impact_integrity" => self.assess_integrity_impact(ioc).await,
                "impact_availability" => self.assess_availability_impact(ioc).await,
                "revenue_impact" => self.assess_revenue_impact(ioc).await,
                "operational_disruption" => self.assess_operational_disruption(ioc).await,
                "reputation_damage" => self.assess_reputation_damage(ioc).await,
                "compliance_impact" => self.assess_compliance_impact(ioc).await,
                "recovery_time" => self.assess_recovery_time(ioc).await,
                _ => 0.5, // Default moderate score
            };

            weighted_score += factor_score * factor.weight;
            total_weight += factor.weight;
        }

        Ok(if total_weight > 0.0 { weighted_score / total_weight } else { 0.0 })
    }

    /// Calculate environmental score factors
    async fn calculate_environmental_score(&self, ioc: &IOC, context: &RiskContext) -> Result<f64, IOCError> {
        let mut env_score = 0.5; // Start with neutral

        // Network exposure
        if context.network_exposure == "external" {
            env_score += 0.3;
        } else if context.network_exposure == "dmz" {
            env_score += 0.2;
        }

        // Asset criticality
        let assets = self.asset_inventory.read().await;
        for asset_id in &context.affected_assets {
            if let Some(asset) = assets.get(asset_id) {
                match asset.criticality {
                    AssetCriticality::Critical => env_score += 0.2,
                    AssetCriticality::High => env_score += 0.15,
                    AssetCriticality::Medium => env_score += 0.1,
                    AssetCriticality::Low => env_score += 0.05,
                }
                break; // Use highest criticality
            }
        }

        // Time sensitivity
        if context.time_sensitivity == "immediate" {
            env_score += 0.2;
        } else if context.time_sensitivity == "urgent" {
            env_score += 0.1;
        }

        Ok(env_score.min(1.0))
    }

    /// Calculate threat landscape score
    async fn calculate_threat_landscape_score(&self, ioc: &IOC) -> Result<f64, IOCError> {
        let threats = self.threat_landscape.read().await;
        let mut max_threat_score = 0.0;

        for threat in threats.values() {
            // Check if this threat type is relevant to the IOC
            let relevance = self.assess_threat_relevance(ioc, threat).await;
            if relevance > 0.0 {
                let threat_score = threat.targeting_likelihood * threat.success_probability * relevance;
                max_threat_score = max_threat_score.max(threat_score);
            }
        }

        Ok(max_threat_score)
    }

    /// Calculate business impact score
    async fn calculate_business_impact(&self, ioc: &IOC, context: &RiskContext) -> Result<f64, IOCError> {
        let assets = self.asset_inventory.read().await;
        let mut max_impact = 0.0;

        for asset_id in &context.affected_assets {
            if let Some(asset) = assets.get(asset_id) {
                let asset_impact = match asset.business_value {
                    AssetValue::Critical => 1.0,
                    AssetValue::High => 0.8,
                    AssetValue::Medium => 0.6,
                    AssetValue::Low => 0.3,
                };

                // Adjust for asset type sensitivity
                let type_multiplier = match asset.asset_type {
                    AssetType::Data => 1.2,
                    AssetType::Infrastructure => 1.0,
                    AssetType::Application => 0.9,
                    AssetType::Endpoint => 0.7,
                };

                max_impact = max_impact.max(asset_impact * type_multiplier);
            }
        }

        Ok(max_impact.min(1.0))
    }

    /// Calculate overall risk score
    async fn calculate_overall_risk(&self, base: f64, env: f64, threat: f64, business: f64) -> Result<f64, IOCError> {
        // Weighted combination of factors
        let overall = (base * 0.4) + (env * 0.2) + (threat * 0.2) + (business * 0.2);
        Ok(overall.min(1.0))
    }

    /// Determine risk level from score
    fn determine_risk_level(&self, score: f64) -> RiskLevel {
        if score >= 0.9 {
            RiskLevel::Critical
        } else if score >= 0.7 {
            RiskLevel::High
        } else if score >= 0.4 {
            RiskLevel::Medium
        } else {
            RiskLevel::Low
        }
    }

    /// Assessment helper methods
    async fn assess_exploit_complexity(&self, ioc: &IOC) -> f64 {
        match ioc.indicator_type {
            IOCType::Hash => 0.3, // Requires execution
            IOCType::URL => 0.6, // Requires user interaction
            IOCType::IPAddress => 0.7, // Network accessible
            IOCType::Domain => 0.7,
            _ => 0.5,
        }
    }

    async fn assess_attack_vector(&self, ioc: &IOC) -> f64 {
        match ioc.indicator_type {
            IOCType::IPAddress | IOCType::Domain | IOCType::URL => 0.8,
            IOCType::Email => 0.6,
            IOCType::Hash => 0.4,
            _ => 0.5,
        }
    }

    async fn assess_privileges_required(&self, ioc: &IOC) -> f64 {
        if ioc.tags.contains(&"privilege_escalation".to_string()) {
            0.3
        } else if ioc.tags.contains(&"user_level".to_string()) {
            0.6
        } else {
            0.8
        }
    }

    async fn assess_user_interaction(&self, ioc: &IOC) -> f64 {
        match ioc.indicator_type {
            IOCType::URL | IOCType::Email => 0.4, // Requires user action
            IOCType::Hash => 0.3, // File execution required
            _ => 0.8, // Minimal interaction
        }
    }

    async fn assess_confidentiality_impact(&self, ioc: &IOC) -> f64 {
        if ioc.tags.contains(&"data_exfiltration".to_string()) {
            0.9
        } else if ioc.tags.contains(&"information_disclosure".to_string()) {
            0.7
        } else {
            0.4
        }
    }

    async fn assess_integrity_impact(&self, ioc: &IOC) -> f64 {
        if ioc.tags.contains(&"data_corruption".to_string()) {
            0.9
        } else if ioc.tags.contains(&"file_modification".to_string()) {
            0.7
        } else {
            0.3
        }
    }

    async fn assess_availability_impact(&self, ioc: &IOC) -> f64 {
        if ioc.tags.contains(&"ransomware".to_string()) || ioc.tags.contains(&"ddos".to_string()) {
            0.9
        } else if ioc.tags.contains(&"service_disruption".to_string()) {
            0.6
        } else {
            0.2
        }
    }

    async fn assess_revenue_impact(&self, ioc: &IOC) -> f64 {
        if ioc.tags.contains(&"payment_system".to_string()) || ioc.tags.contains(&"ecommerce".to_string()) {
            0.9
        } else if ioc.tags.contains(&"customer_facing".to_string()) {
            0.6
        } else {
            0.3
        }
    }

    async fn assess_operational_disruption(&self, ioc: &IOC) -> f64 {
        match ioc.severity {
            Severity::Critical => 0.9,
            Severity::High => 0.7,
            Severity::Medium => 0.5,
            Severity::Low => 0.2,
        }
    }

    async fn assess_reputation_damage(&self, ioc: &IOC) -> f64 {
        if ioc.tags.contains(&"data_breach".to_string()) || ioc.tags.contains(&"customer_data".to_string()) {
            0.8
        } else if ioc.tags.contains(&"public_facing".to_string()) {
            0.6
        } else {
            0.3
        }
    }

    async fn assess_compliance_impact(&self, ioc: &IOC) -> f64 {
        if ioc.tags.contains(&"pci".to_string()) || ioc.tags.contains(&"gdpr".to_string()) {
            0.8
        } else if ioc.tags.contains(&"regulated".to_string()) {
            0.6
        } else {
            0.2
        }
    }

    async fn assess_recovery_time(&self, ioc: &IOC) -> f64 {
        match ioc.indicator_type {
            IOCType::Hash => 0.8, // May require reimaging
            IOCType::IPAddress | IOCType::Domain => 0.4, // Quick blocking
            _ => 0.5,
        }
    }

    async fn assess_threat_relevance(&self, ioc: &IOC, threat: &ThreatProfile) -> f64 {
        let mut relevance = 0.0;

        // Check if IOC characteristics match threat capabilities
        for capability in &threat.capabilities {
            if ioc.tags.iter().any(|tag| tag.contains(capability)) {
                relevance += 0.3;
            }
        }

        // Adjust for threat sophistication vs IOC complexity
        match threat.sophistication {
            ThreatSophistication::High => {
                if ioc.confidence > 0.8 { relevance += 0.4; }
            }
            ThreatSophistication::Medium => {
                if ioc.confidence > 0.5 { relevance += 0.3; }
            }
            ThreatSophistication::Low => {
                relevance += 0.2;
            }
        }

        relevance.min(1.0)
    }

    async fn generate_risk_matrix(&self, overall_risk: f64, business_impact: f64) -> RiskMatrix {
        let likelihood = if overall_risk > 0.8 {
            "Very High".to_string()
        } else if overall_risk > 0.6 {
            "High".to_string()
        } else if overall_risk > 0.4 {
            "Medium".to_string()
        } else if overall_risk > 0.2 {
            "Low".to_string()
        } else {
            "Very Low".to_string()
        };

        let impact = if business_impact > 0.8 {
            "Critical".to_string()
        } else if business_impact > 0.6 {
            "High".to_string()
        } else if business_impact > 0.4 {
            "Medium".to_string()
        } else {
            "Low".to_string()
        };

        RiskMatrix {
            likelihood,
            impact,
            risk_level: self.determine_risk_level(overall_risk),
            justification: format!(
                "Risk assessment based on {}% likelihood and {} impact level",
                (overall_risk * 100.0) as u32,
                impact.to_lowercase()
            ),
        }
    }

    async fn assess_potential_impact(&self, ioc: &IOC, asset_ids: &[String]) -> Result<PotentialImpact, IOCError> {
        let assets = self.asset_inventory.read().await;
        let mut financial_impact = 0.0;
        let mut operational_impact = 0.0;
        let mut reputation_impact = 0.0;
        let mut compliance_impact = 0.0;

        for asset_id in asset_ids {
            if let Some(asset) = assets.get(asset_id) {
                match asset.business_value {
                    AssetValue::Critical => {
                        financial_impact += 1000000.0; // $1M
                        operational_impact += 24.0; // 24 hours
                    }
                    AssetValue::High => {
                        financial_impact += 500000.0; // $500K
                        operational_impact += 12.0; // 12 hours
                    }
                    AssetValue::Medium => {
                        financial_impact += 100000.0; // $100K
                        operational_impact += 4.0; // 4 hours
                    }
                    AssetValue::Low => {
                        financial_impact += 10000.0; // $10K
                        operational_impact += 1.0; // 1 hour
                    }
                }

                if asset.asset_type == AssetType::Data {
                    reputation_impact += 0.3;
                    compliance_impact += 0.4;
                }
            }
        }

        Ok(PotentialImpact {
            financial_impact_usd: financial_impact,
            operational_downtime_hours: operational_impact,
            reputation_score_impact: reputation_impact.min(1.0),
            compliance_violations: if compliance_impact > 0.5 {
                vec!["GDPR".to_string(), "PCI-DSS".to_string()]
            } else {
                vec![]
            },
            recovery_time_estimate_hours: operational_impact * 2.0,
        })
    }

    async fn generate_mitigations(&self, ioc: &IOC, risk_score: f64, risk_matrix: &RiskMatrix) -> Result<Vec<MitigationRecommendation>, IOCError> {
        let mut recommendations = Vec::new();

        // High-level mitigations based on risk score
        if risk_score > 0.8 {
            recommendations.push(MitigationRecommendation {
                id: Uuid::new_v4().to_string(),
                priority: MitigationPriority::Critical,
                category: "immediate_response".to_string(),
                description: "Activate incident response team immediately".to_string(),
                implementation_effort: ImplementationEffort::Low,
                effectiveness: 0.9,
                cost_estimate: 50000.0,
                timeline_days: 1,
            });
        }

        // IOC-specific mitigations
        match ioc.indicator_type {
            IOCType::IPAddress => {
                recommendations.push(MitigationRecommendation {
                    id: Uuid::new_v4().to_string(),
                    priority: MitigationPriority::High,
                    category: "network_security".to_string(),
                    description: "Block IP address in firewall and IPS".to_string(),
                    implementation_effort: ImplementationEffort::Low,
                    effectiveness: 0.8,
                    cost_estimate: 1000.0,
                    timeline_days: 1,
                });
            }
            IOCType::Domain => {
                recommendations.push(MitigationRecommendation {
                    id: Uuid::new_v4().to_string(),
                    priority: MitigationPriority::High,
                    category: "dns_security".to_string(),
                    description: "Block domain in DNS security filters".to_string(),
                    implementation_effort: ImplementationEffort::Low,
                    effectiveness: 0.8,
                    cost_estimate: 1000.0,
                    timeline_days: 1,
                });
            }
            IOCType::Hash => {
                recommendations.push(MitigationRecommendation {
                    id: Uuid::new_v4().to_string(),
                    priority: MitigationPriority::High,
                    category: "endpoint_security".to_string(),
                    description: "Update antivirus signatures and scan endpoints".to_string(),
                    implementation_effort: ImplementationEffort::Medium,
                    effectiveness: 0.7,
                    cost_estimate: 5000.0,
                    timeline_days: 2,
                });
            }
            IOCType::URL => {
                recommendations.push(MitigationRecommendation {
                    id: Uuid::new_v4().to_string(),
                    priority: MitigationPriority::Medium,
                    category: "web_security".to_string(),
                    description: "Block URL in web proxy and email filters".to_string(),
                    implementation_effort: ImplementationEffort::Low,
                    effectiveness: 0.7,
                    cost_estimate: 2000.0,
                    timeline_days: 1,
                });
            }
            _ => {}
        }

        // Generic security improvements
        if risk_score > 0.6 {
            recommendations.push(MitigationRecommendation {
                id: Uuid::new_v4().to_string(),
                priority: MitigationPriority::Medium,
                category: "monitoring".to_string(),
                description: "Enhance monitoring for related indicators".to_string(),
                implementation_effort: ImplementationEffort::Medium,
                effectiveness: 0.6,
                cost_estimate: 10000.0,
                timeline_days: 7,
            });
        }

        Ok(recommendations)
    }

    async fn calculate_confidence_level(&self, ioc: &IOC, context: &RiskContext) -> f64 {
        let mut confidence = ioc.confidence;

        // Adjust for data quality
        if !context.affected_assets.is_empty() {
            confidence += 0.1;
        }

        // Adjust for source reliability
        if ioc.source.contains("trusted") {
            confidence += 0.1;
        }

        // Adjust for correlation
        if ioc.context.related_indicators.len() > 2 {
            confidence += 0.1;
        }

        confidence.min(1.0)
    }

    /// Get risk assessment by ID
    pub async fn get_assessment(&self, assessment_id: &str) -> Result<Option<RiskAssessment>, IOCError> {
        let assessments = self.risk_assessments.read().await;
        Ok(assessments.get(assessment_id).cloned())
    }

    /// List recent risk assessments
    pub async fn list_assessments(&self, limit: usize) -> Result<Vec<RiskAssessment>, IOCError> {
        let assessments = self.risk_assessments.read().await;
        let mut sorted_assessments: Vec<_> = assessments.values().cloned().collect();
        sorted_assessments.sort_by(|a, b| b.assessment_time.cmp(&a.assessment_time));
        Ok(sorted_assessments.into_iter().take(limit).collect())
    }

    /// Get risk statistics
    pub async fn get_statistics(&self) -> RiskAssessmentStats {
        self.statistics.read().await.clone()
    }

    /// Get health status
    pub async fn get_health(&self) -> ComponentHealth {
        let stats = self.statistics.read().await;
        let models = self.risk_models.read().await;
        let assets = self.asset_inventory.read().await;

        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Risk assessment engine operational with {} models and {} assets", models.len(), assets.len()),
            last_check: Utc::now(),
            metrics: HashMap::from([
                ("total_assessments".to_string(), stats.total_assessments as f64),
                ("critical_risks".to_string(), stats.critical_risks as f64),
                ("high_risks".to_string(), stats.high_risks as f64),
                ("risk_models".to_string(), models.len() as f64),
                ("tracked_assets".to_string(), assets.len() as f64),
            ]),
        }
    }
}

// Risk assessment data structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskModel {
    pub id: String,
    pub name: String,
    pub description: String,
    pub factors: Vec<RiskFactor>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFactor {
    pub name: String,
    pub weight: f64,
    pub scale: RiskScale,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RiskScale {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessAsset {
    pub id: String,
    pub name: String,
    pub asset_type: AssetType,
    pub business_value: AssetValue,
    pub criticality: AssetCriticality,
    pub exposure_level: ExposureLevel,
    pub dependencies: Vec<String>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AssetType {
    Infrastructure,
    Application,
    Data,
    Endpoint,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AssetValue {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AssetCriticality {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExposureLevel {
    External,
    Internal,
    Restricted,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatProfile {
    pub id: String,
    pub name: String,
    pub sophistication: ThreatSophistication,
    pub motivation: Vec<String>,
    pub capabilities: Vec<String>,
    pub targeting_likelihood: f64,
    pub success_probability: f64,
    pub typical_impact: ImpactLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ThreatSophistication {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ImpactLevel {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskContext {
    pub risk_model_id: String,
    pub affected_assets: Vec<String>,
    pub network_exposure: String,
    pub time_sensitivity: String,
    pub analyst: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAssessment {
    pub id: String,
    pub ioc_id: String,
    pub risk_model_id: String,
    pub assessment_time: DateTime<Utc>,
    pub base_risk_score: f64,
    pub environmental_score: f64,
    pub threat_landscape_score: f64,
    pub business_impact_score: f64,
    pub overall_risk_score: f64,
    pub risk_level: RiskLevel,
    pub risk_matrix: RiskMatrix,
    pub affected_assets: Vec<String>,
    pub potential_impact: PotentialImpact,
    pub mitigation_recommendations: Vec<MitigationRecommendation>,
    pub confidence_level: f64,
    pub validity_period: Duration,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskMatrix {
    pub likelihood: String,
    pub impact: String,
    pub risk_level: RiskLevel,
    pub justification: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PotentialImpact {
    pub financial_impact_usd: f64,
    pub operational_downtime_hours: f64,
    pub reputation_score_impact: f64,
    pub compliance_violations: Vec<String>,
    pub recovery_time_estimate_hours: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MitigationRecommendation {
    pub id: String,
    pub priority: MitigationPriority,
    pub category: String,
    pub description: String,
    pub implementation_effort: ImplementationEffort,
    pub effectiveness: f64,
    pub cost_estimate: f64,
    pub timeline_days: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MitigationPriority {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ImplementationEffort {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct RiskAssessmentStats {
    pub total_assessments: u64,
    pub critical_risks: u64,
    pub high_risks: u64,
    pub medium_risks: u64,
    pub low_risks: u64,
    pub average_assessment_time: f64,
    pub last_assessment_time: Option<DateTime<Utc>>,
}