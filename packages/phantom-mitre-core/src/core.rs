//! Phantom MITRE Core - Core Business Logic
//! 
//! This module contains the main business logic for MITRE ATT&CK framework integration,
//! including threat analysis, technique mapping, and tactical intelligence.

use crate::models::*;
use crate::config::MitreConfig;
use crate::storage::{MitreStorage, StorageResult};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use chrono::Utc;

/// Main MITRE Core implementation with storage backend
pub struct MitreCore {
    storage: Arc<RwLock<Box<dyn MitreStorage>>>,
    config: MitreConfig,
}

impl MitreCore {
    /// Create a new MITRE Core instance with the given storage backend and configuration
    pub fn new(storage: Box<dyn MitreStorage>, config: Option<MitreConfig>) -> Self {
        Self {
            storage: Arc::new(RwLock::new(storage)),
            config: config.unwrap_or_default(),
        }
    }

    /// Create a new MITRE Core instance with default local storage
    pub async fn new_with_local_storage(config: Option<MitreConfig>) -> StorageResult<Self> {
        let storage = crate::storage::create_default_storage().await?;
        Ok(Self::new(storage, config))
    }

    /// Initialize the core with sample data
    pub async fn initialize(&self) -> StorageResult<()> {
        let mut storage = self.storage.write().await;
        storage.initialize().await
    }

    /// Get the current configuration
    pub fn get_config(&self) -> &MitreConfig {
        &self.config
    }

    /// Update the configuration
    pub fn update_config(&mut self, config: MitreConfig) {
        self.config = config;
    }

    /// Analyze threat indicators against MITRE ATT&CK framework
    pub async fn analyze_threat(&self, indicators: &[String]) -> StorageResult<ThreatAnalysis> {
        let analysis_id = Uuid::new_v4().to_string();
        let timestamp = Utc::now();

        let techniques_identified = self.identify_techniques(indicators).await?;
        let tactics_coverage = self.calculate_tactics_coverage(&techniques_identified).await?;
        let attack_path = self.generate_attack_path(&techniques_identified).await?;
        let risk_score = self.calculate_risk_score(&techniques_identified, &tactics_coverage);
        let confidence_score = self.calculate_confidence_score(&techniques_identified);
        let recommended_mitigations = self.recommend_mitigations(&techniques_identified).await?;
        let detection_gaps = self.identify_detection_gaps(&techniques_identified).await?;
        let threat_landscape = self.analyze_threat_landscape().await?;

        let analysis = ThreatAnalysis {
            analysis_id: analysis_id.clone(),
            timestamp,
            techniques_identified,
            tactics_coverage,
            attack_path,
            risk_score,
            confidence_score,
            recommended_mitigations,
            detection_gaps,
            threat_landscape,
        };

        // Store the analysis
        let mut storage = self.storage.write().await;
        storage.store_analysis(analysis.clone()).await?;

        Ok(analysis)
    }

    /// Map techniques to MITRE ATT&CK framework
    pub async fn map_techniques(&self, technique_ids: &[String]) -> StorageResult<Vec<MitreTechnique>> {
        let storage = self.storage.read().await;
        let mut techniques = Vec::new();

        for id in technique_ids {
            if let Some(technique) = storage.get_technique(id).await? {
                techniques.push(technique);
            }
        }

        Ok(techniques)
    }

    /// Get technique details by ID
    pub async fn get_technique(&self, technique_id: &str) -> StorageResult<Option<MitreTechnique>> {
        let storage = self.storage.read().await;
        storage.get_technique(technique_id).await
    }

    /// Add a new technique
    pub async fn add_technique(&self, technique: MitreTechnique) -> StorageResult<String> {
        let mut storage = self.storage.write().await;
        storage.store_technique(technique).await
    }

    /// Update an existing technique
    pub async fn update_technique(&self, technique: MitreTechnique) -> StorageResult<()> {
        let mut storage = self.storage.write().await;
        storage.update_technique(technique).await
    }

    /// Delete a technique
    pub async fn delete_technique(&self, technique_id: &str) -> StorageResult<bool> {
        let mut storage = self.storage.write().await;
        storage.delete_technique(technique_id).await
    }

    /// Search techniques by criteria
    pub async fn search_techniques(&self, criteria: &MitreSearchCriteria) -> StorageResult<Vec<MitreTechnique>> {
        let storage = self.storage.read().await;
        
        // Convert search criteria to storage filter
        let filter = crate::storage::TechniqueFilter {
            tactics: criteria.tactics.clone(),
            platforms: criteria.platforms.clone(),
            data_sources: criteria.data_sources.clone(),
            detection_difficulty: criteria.detection_difficulty.clone(),
            revoked: Some(false),
            deprecated: Some(false),
            text_search: criteria.query.clone(),
        };

        let pagination = criteria.limit.map(|limit| crate::storage::Pagination {
            offset: 0,
            limit,
        });

        storage.list_techniques(Some(filter), None, None, pagination).await
    }

    /// Get group information
    pub async fn get_group(&self, group_id: &str) -> StorageResult<Option<MitreGroup>> {
        let storage = self.storage.read().await;
        storage.get_group(group_id).await
    }

    /// Add a new group
    pub async fn add_group(&self, group: MitreGroup) -> StorageResult<String> {
        let mut storage = self.storage.write().await;
        storage.store_group(group).await
    }

    /// Get software information
    pub async fn get_software(&self, software_id: &str) -> StorageResult<Option<MitreSoftware>> {
        let storage = self.storage.read().await;
        storage.get_software(software_id).await
    }

    /// Add new software
    pub async fn add_software(&self, software: MitreSoftware) -> StorageResult<String> {
        let mut storage = self.storage.write().await;
        storage.store_software(software).await
    }

    /// Generate ATT&CK Navigator layer
    pub async fn generate_navigator_layer(&self, analysis: &ThreatAnalysis) -> StorageResult<NavigatorLayer> {
        let techniques: Vec<NavigatorTechnique> = analysis
            .techniques_identified
            .iter()
            .map(|tm| NavigatorTechnique {
                technique_id: tm.technique_id.clone(),
                tactic: format!("{:?}", self.get_technique_tactic_from_match(tm)),
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

        Ok(NavigatorLayer {
            name: "Threat Analysis Results".to_string(),
            description: format!("Analysis from {}", analysis.timestamp),
            domain: self.config.navigator.default_domain.clone(),
            version: "4.0".to_string(),
            techniques,
            gradient: NavigatorGradient {
                colors: self.config.navigator.default_gradient.clone(),
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
                layout: self.config.navigator.default_layout.clone(),
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
        })
    }

    /// Get detection coverage for techniques
    pub async fn get_detection_coverage(&self, technique_ids: &[String]) -> StorageResult<HashMap<String, f64>> {
        let storage = self.storage.read().await;
        let mut coverage_map = HashMap::new();

        for technique_id in technique_ids {
            let rules = storage.get_detection_rules_for_technique(technique_id).await?;
            let max_coverage = rules
                .iter()
                .map(|rule| rule.coverage_percentage)
                .fold(0.0f64, |acc, coverage| acc.max(coverage));
            coverage_map.insert(technique_id.clone(), max_coverage);
        }

        Ok(coverage_map)
    }

    /// Get techniques used by a specific group
    pub async fn get_techniques_by_group(&self, group_id: &str) -> StorageResult<Vec<MitreTechnique>> {
        let storage = self.storage.read().await;
        storage.get_techniques_by_group(group_id).await
    }

    /// Get groups using a specific technique
    pub async fn get_groups_using_technique(&self, technique_id: &str) -> StorageResult<Vec<MitreGroup>> {
        let storage = self.storage.read().await;
        storage.get_groups_using_technique(technique_id).await
    }

    /// Get software used by a specific group
    pub async fn get_software_by_group(&self, group_id: &str) -> StorageResult<Vec<MitreSoftware>> {
        let storage = self.storage.read().await;
        storage.get_software_by_group(group_id).await
    }

    /// Get software using a specific technique
    pub async fn get_software_using_technique(&self, technique_id: &str) -> StorageResult<Vec<MitreSoftware>> {
        let storage = self.storage.read().await;
        storage.get_software_using_technique(technique_id).await
    }

    /// List all mitigations for a technique
    pub async fn get_mitigations_for_technique(&self, technique_id: &str) -> StorageResult<Vec<Mitigation>> {
        let storage = self.storage.read().await;
        storage.get_mitigations_for_technique(technique_id).await
    }

    /// Get storage health status
    pub async fn get_health_status(&self) -> StorageResult<crate::storage::HealthStatus> {
        let storage = self.storage.read().await;
        storage.health_check().await
    }

    /// Get storage statistics
    pub async fn get_statistics(&self) -> StorageResult<crate::storage::StorageStatistics> {
        let storage = self.storage.read().await;
        storage.get_statistics().await
    }

    // Private helper methods

    async fn identify_techniques(&self, indicators: &[String]) -> StorageResult<Vec<TechniqueMatch>> {
        let storage = self.storage.read().await;
        let mut matches = Vec::new();
        
        // Get all techniques to analyze
        let all_techniques = storage.list_techniques(None, None, None, None).await?;
        
        for technique in &all_techniques {
            let confidence = self.calculate_technique_confidence(technique, indicators);
            if confidence > self.config.analysis.confidence_threshold {
                matches.push(TechniqueMatch {
                    technique_id: technique.id.clone(),
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
        matches.truncate(self.config.analysis.max_techniques);
        Ok(matches)
    }

    async fn calculate_tactics_coverage(&self, techniques: &[TechniqueMatch]) -> StorageResult<HashMap<MitreTactic, f64>> {
        let mut coverage = HashMap::new();
        let storage = self.storage.read().await;
        
        for technique_match in techniques {
            if let Some(technique) = storage.get_technique(&technique_match.technique_id).await? {
                let current = coverage.get(&technique.tactic).unwrap_or(&0.0);
                let weight = self.config.analysis.risk_weights.technique_confidence;
                coverage.insert(technique.tactic.clone(), (current + technique_match.confidence * weight).min(1.0));
            }
        }
        
        Ok(coverage)
    }

    async fn generate_attack_path(&self, techniques: &[TechniqueMatch]) -> StorageResult<Vec<AttackPathStep>> {
        let mut path = Vec::new();
        let storage = self.storage.read().await;

        for (step_number, technique_match) in techniques
            .iter()
            .take(self.config.analysis.max_attack_path_steps)
            .enumerate() 
        {
            if let Some(technique) = storage.get_technique(&technique_match.technique_id).await? {
                path.push(AttackPathStep {
                    step_number: (step_number + 1) as u32,
                    tactic: technique.tactic.clone(),
                    technique_id: technique.id.clone(),
                    technique_name: technique.name.clone(),
                    description: technique.description.clone(),
                    prerequisites: technique.permissions_required.clone(),
                    outcomes: vec!["System compromise".to_string()],
                    detection_opportunities: vec!["Monitor process creation".to_string()],
                    mitigation_opportunities: technique.mitigations.clone(),
                });
            }
        }

        Ok(path)
    }

    fn calculate_risk_score(&self, techniques: &[TechniqueMatch], tactics_coverage: &HashMap<MitreTactic, f64>) -> f64 {
        let weights = &self.config.analysis.risk_weights;
        
        let technique_score: f64 = techniques.iter().map(|t| t.confidence).sum::<f64>() / techniques.len().max(1) as f64;
        let tactic_score: f64 = tactics_coverage.values().sum::<f64>() / tactics_coverage.len().max(1) as f64;
        
        (technique_score * weights.technique_confidence + tactic_score * weights.tactic_coverage).min(1.0)
    }

    fn calculate_confidence_score(&self, techniques: &[TechniqueMatch]) -> f64 {
        if techniques.is_empty() {
            return 0.0;
        }
        techniques.iter().map(|t| t.confidence).sum::<f64>() / techniques.len() as f64
    }

    async fn recommend_mitigations(&self, techniques: &[TechniqueMatch]) -> StorageResult<Vec<String>> {
        let mut mitigations = Vec::new();
        let storage = self.storage.read().await;
        
        for technique_match in techniques {
            let technique_mitigations = storage.get_mitigations_for_technique(&technique_match.technique_id).await?;
            for mitigation in technique_mitigations {
                if !mitigations.contains(&mitigation.id) {
                    mitigations.push(mitigation.id);
                }
            }
        }
        
        mitigations.truncate(10);
        Ok(mitigations)
    }

    async fn identify_detection_gaps(&self, techniques: &[TechniqueMatch]) -> StorageResult<Vec<DetectionGap>> {
        let storage = self.storage.read().await;
        let mut gaps = Vec::new();

        for technique_match in techniques {
            if technique_match.confidence > 0.5 {
                let rules = storage.get_detection_rules_for_technique(&technique_match.technique_id).await?;
                let coverage = rules.iter().map(|r| r.coverage_percentage).fold(0.0, f64::max);
                
                if coverage < 0.7 {
                    gaps.push(DetectionGap {
                        technique_id: technique_match.technique_id.clone(),
                        technique_name: technique_match.technique_name.clone(),
                        gap_type: if coverage < 0.3 { GapType::NoDetection } else { GapType::LowCoverage },
                        severity: if coverage < 0.3 { Severity::High } else { Severity::Medium },
                        description: "Limited detection coverage for this technique".to_string(),
                        recommended_actions: vec!["Implement additional monitoring".to_string()],
                        data_sources_needed: technique_match.data_sources_triggered.clone(),
                        estimated_coverage_improvement: 1.0 - coverage,
                    });
                }
            }
        }

        Ok(gaps)
    }

    async fn analyze_threat_landscape(&self) -> StorageResult<ThreatLandscape> {
        let storage = self.storage.read().await;
        
        // This is a simplified implementation. In practice, you'd analyze historical data
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

        // Get active groups from storage
        let groups = storage.list_groups(None, None, None, Some(crate::storage::Pagination { offset: 0, limit: 5 })).await?;
        let group_activity: Vec<GroupActivity> = groups.into_iter().map(|group| {
            GroupActivity {
                group_id: group.id.clone(),
                group_name: group.name.clone(),
                activity_level: ActivityLevel::Medium,
                recent_techniques: group.techniques_used.clone(),
                target_sectors: group.targets.clone(),
                geographic_focus: vec!["Global".to_string()],
            }
        }).collect();

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

        Ok(ThreatLandscape {
            most_common_tactics,
            most_common_techniques,
            trending_techniques,
            platform_distribution,
            group_activity,
            emerging_threats,
        })
    }

    fn calculate_technique_confidence(&self, _technique: &MitreTechnique, indicators: &[String]) -> f64 {
        // Simulate confidence calculation based on indicators
        let base_confidence = 0.4;
        let indicator_boost = indicators.len() as f64 * 0.1;
        (base_confidence + indicator_boost).min(1.0)
    }

    fn get_technique_tactic_from_match(&self, technique_match: &TechniqueMatch) -> MitreTactic {
        // In a real implementation, you'd look up the technique in storage
        // For now, just return a default
        MitreTactic::Discovery
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
        // This is a blocking call in an async context, but it's only for Default trait
        // In practice, users should use new_with_local_storage() for async initialization
        let storage = Box::new(crate::storage::LocalStorage::new());
        Self::new(storage, None)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::storage::LocalStorage;

    #[tokio::test]
    async fn test_mitre_core_creation() {
        let storage = Box::new(LocalStorage::new());
        let core = MitreCore::new(storage, None);
        assert!(core.initialize().await.is_ok());
    }

    #[tokio::test]
    async fn test_threat_analysis() {
        let mut storage = LocalStorage::new();
        storage.initialize().await.unwrap();
        let core = MitreCore::new(Box::new(storage), None);
        
        let indicators = vec![
            "malicious.exe".to_string(),
            "suspicious_network_traffic".to_string(),
            "registry_modification".to_string(),
        ];
        
        let analysis = core.analyze_threat(&indicators).await.unwrap();
        assert!(!analysis.analysis_id.is_empty());
        assert!(analysis.risk_score >= 0.0 && analysis.risk_score <= 1.0);
    }

    #[tokio::test]
    async fn test_technique_mapping() {
        let mut storage = LocalStorage::new();
        storage.initialize().await.unwrap();
        let core = MitreCore::new(Box::new(storage), None);
        
        let technique_ids = vec!["T1566.001".to_string(), "T1055".to_string()];
        let techniques = core.map_techniques(&technique_ids).await.unwrap();
        assert_eq!(techniques.len(), 2);
    }

    #[tokio::test]
    async fn test_navigator_layer_generation() {
        let mut storage = LocalStorage::new();
        storage.initialize().await.unwrap();
        let core = MitreCore::new(Box::new(storage), None);
        
        let indicators = vec!["test_indicator".to_string()];
        let analysis = core.analyze_threat(&indicators).await.unwrap();
        let layer = core.generate_navigator_layer(&analysis).await.unwrap();
        assert_eq!(layer.domain, "enterprise-attack");
    }

    #[tokio::test]
    async fn test_technique_operations() {
        let mut storage = LocalStorage::new();
        storage.initialize().await.unwrap();
        let core = MitreCore::new(Box::new(storage), None);
        
        // Test getting an existing technique
        let technique = core.get_technique("T1566.001").await.unwrap();
        assert!(technique.is_some());
        assert_eq!(technique.unwrap().id, "T1566.001");
        
        // Test getting a non-existent technique
        let non_existent = core.get_technique("T9999").await.unwrap();
        assert!(non_existent.is_none());
    }
}