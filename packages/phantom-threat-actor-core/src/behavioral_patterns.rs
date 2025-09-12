//! Behavioral Patterns Analysis Module
//!
//! Advanced behavioral pattern recognition and analysis system for threat actors.
//! Identifies patterns in tactics, techniques, procedures, and operational behaviors.

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use chrono::{DateTime, Utc, Duration, Timelike, Datelike};
use uuid::Uuid;
use anyhow::Result;

/// Behavioral patterns analysis engine
#[derive(Debug, Clone)]
pub struct BehavioralPatternsModule {
    pattern_database: HashMap<String, BehavioralPattern>,
    actor_behaviors: HashMap<String, ActorBehavioralProfile>,
    pattern_matching_engine: PatternMatchingEngine,
    anomaly_detector: AnomalyDetector,
    temporal_analyzer: TemporalAnalyzer,
}

impl BehavioralPatternsModule {
    /// Create a new behavioral patterns module
    pub fn new() -> Self {
        Self {
            pattern_database: HashMap::new(),
            actor_behaviors: HashMap::new(),
            pattern_matching_engine: PatternMatchingEngine::new(),
            anomaly_detector: AnomalyDetector::new(),
            temporal_analyzer: TemporalAnalyzer::new(),
        }
    }

    /// Analyze behavioral patterns for a threat actor
    pub async fn analyze_behavioral_patterns(
        &mut self,
        actor_id: &str,
        activities: &[Activity],
        context: &AnalysisContext,
    ) -> Result<BehavioralAnalysisResult> {
        let mut patterns = Vec::new();
        let mut anomalies = Vec::new();
        let mut predictions = Vec::new();

        // Extract behavioral patterns
        for activity in activities {
            let activity_patterns = self.extract_patterns_from_activity(activity)?;
            patterns.extend(activity_patterns);
        }

        // Detect anomalies
        for activity in activities {
            if let Some(anomaly) = self.anomaly_detector.detect_anomaly(activity, context).await? {
                anomalies.push(anomaly);
            }
        }

        // Generate predictions
        if let Some(actor_profile) = self.actor_behaviors.get(actor_id) {
            predictions = self.temporal_analyzer.predict_future_behavior(actor_profile, context).await?;
        }

        // Update actor behavioral profile
        self.update_actor_profile(actor_id, &patterns, &anomalies).await?;

        Ok(BehavioralAnalysisResult {
            actor_id: actor_id.to_string(),
            detected_patterns: patterns,
            anomalies,
            predictions,
            confidence_score: self.calculate_confidence_score(&patterns, &anomalies),
            analysis_timestamp: Utc::now(),
            pattern_clusters: self.cluster_patterns(&patterns),
        })
    }

    /// Extract patterns from a single activity
    fn extract_patterns_from_activity(&self, activity: &Activity) -> Result<Vec<BehavioralPattern>> {
        let mut patterns = Vec::new();

        // Time-based patterns
        if let Some(time_pattern) = self.extract_time_pattern(activity) {
            patterns.push(time_pattern);
        }

        // Technique sequence patterns
        if let Some(sequence_pattern) = self.extract_technique_sequence(activity) {
            patterns.push(sequence_pattern);
        }

        // Target selection patterns
        if let Some(target_pattern) = self.extract_target_pattern(activity) {
            patterns.push(target_pattern);
        }

        // Infrastructure usage patterns
        if let Some(infra_pattern) = self.extract_infrastructure_pattern(activity) {
            patterns.push(infra_pattern);
        }

        Ok(patterns)
    }

    /// Extract time-based behavioral patterns
    fn extract_time_pattern(&self, activity: &Activity) -> Option<BehavioralPattern> {
        let hour = activity.timestamp.hour();
        let day_of_week = activity.timestamp.weekday().num_days_from_monday();

        // Check for unusual timing patterns
        let is_business_hours = hour >= 9 && hour <= 17;
        let is_weekend = day_of_week >= 5;

        if !is_business_hours && activity.activity_type == ActivityType::InitialAccess {
            return Some(BehavioralPattern {
                pattern_id: Uuid::new_v4().to_string(),
                pattern_type: PatternType::Temporal,
                pattern_name: "OffHoursInitialAccess".to_string(),
                description: "Initial access attempts outside business hours".to_string(),
                confidence: 0.8,
                frequency: 1,
                first_observed: activity.timestamp,
                last_observed: activity.timestamp,
                indicators: vec![format!("Access at hour {}", hour)],
                related_activities: vec![activity.activity_id.clone()],
            });
        }

        None
    }

    /// Extract technique sequence patterns
    fn extract_technique_sequence(&self, activity: &Activity) -> Option<BehavioralPattern> {
        // Analyze technique combinations
        let techniques = &activity.techniques_used;

        if techniques.contains(&"T1078".to_string()) && techniques.contains(&"T1059".to_string()) {
            return Some(BehavioralPattern {
                pattern_id: Uuid::new_v4().to_string(),
                pattern_type: PatternType::TechniqueSequence,
                pattern_name: "ValidAccountsPlusCommandExecution".to_string(),
                description: "Use of valid accounts followed by command execution".to_string(),
                confidence: 0.9,
                frequency: 1,
                first_observed: activity.timestamp,
                last_observed: activity.timestamp,
                indicators: techniques.clone(),
                related_activities: vec![activity.activity_id.clone()],
            });
        }

        None
    }

    /// Extract target selection patterns
    fn extract_target_pattern(&self, activity: &Activity) -> Option<BehavioralPattern> {
        let targets = &activity.targets;

        // Check for high-value target patterns
        let high_value_targets = targets.iter()
            .filter(|target| target.value_score > 0.8)
            .count();

        if high_value_targets > targets.len() / 2 {
            return Some(BehavioralPattern {
                pattern_id: Uuid::new_v4().to_string(),
                pattern_type: PatternType::TargetSelection,
                pattern_name: "HighValueTargetFocus".to_string(),
                description: "Focus on high-value targets".to_string(),
                confidence: 0.85,
                frequency: 1,
                first_observed: activity.timestamp,
                last_observed: activity.timestamp,
                indicators: vec![format!("{} high-value targets", high_value_targets)],
                related_activities: vec![activity.activity_id.clone()],
            });
        }

        None
    }

    /// Extract infrastructure usage patterns
    fn extract_infrastructure_pattern(&self, activity: &Activity) -> Option<BehavioralPattern> {
        let infrastructure = &activity.infrastructure_used;

        // Check for C2 server patterns
        let c2_servers = infrastructure.iter()
            .filter(|infra| infra.infrastructure_type == InfrastructureType::CommandAndControl)
            .count();

        if c2_servers > 0 {
            return Some(BehavioralPattern {
                pattern_id: Uuid::new_v4().to_string(),
                pattern_type: PatternType::Infrastructure,
                pattern_name: "C2InfrastructureUsage".to_string(),
                description: "Usage of command and control infrastructure".to_string(),
                confidence: 0.75,
                frequency: 1,
                first_observed: activity.timestamp,
                last_observed: activity.timestamp,
                indicators: vec![format!("{} C2 servers used", c2_servers)],
                related_activities: vec![activity.activity_id.clone()],
            });
        }

        None
    }

    /// Update actor behavioral profile
    async fn update_actor_profile(
        &mut self,
        actor_id: &str,
        patterns: &[BehavioralPattern],
        anomalies: &[Anomaly],
    ) -> Result<()> {
        let profile = self.actor_behaviors
            .entry(actor_id.to_string())
            .or_insert_with(|| ActorBehavioralProfile {
                actor_id: actor_id.to_string(),
                patterns: Vec::new(),
                anomalies: Vec::new(),
                behavioral_evolution: Vec::new(),
                last_updated: Utc::now(),
            });

        // Add new patterns
        for pattern in patterns {
            if !profile.patterns.iter().any(|p| p.pattern_name == pattern.pattern_name) {
                profile.patterns.push(pattern.clone());
            } else {
                // Update existing pattern
                if let Some(existing) = profile.patterns.iter_mut()
                    .find(|p| p.pattern_name == pattern.pattern_name) {
                    existing.frequency += 1;
                    existing.last_observed = pattern.last_observed;
                    existing.confidence = (existing.confidence + pattern.confidence) / 2.0;
                }
            }
        }

        // Add anomalies
        profile.anomalies.extend(anomalies.iter().cloned());

        profile.last_updated = Utc::now();

        Ok(())
    }

    /// Calculate confidence score for analysis
    fn calculate_confidence_score(&self, patterns: &[BehavioralPattern], anomalies: &[Anomaly]) -> f64 {
        let pattern_confidence = if patterns.is_empty() {
            0.0
        } else {
            patterns.iter().map(|p| p.confidence).sum::<f64>() / patterns.len() as f64
        };

        let anomaly_penalty = anomalies.len() as f64 * 0.1;

        (pattern_confidence - anomaly_penalty).max(0.0).min(1.0)
    }

    /// Cluster similar patterns
    fn cluster_patterns(&self, patterns: &[BehavioralPattern]) -> Vec<PatternCluster> {
        let mut clusters = HashMap::new();

        for pattern in patterns {
            let cluster_key = match pattern.pattern_type {
                PatternType::Temporal => "temporal",
                PatternType::TechniqueSequence => "technique",
                PatternType::TargetSelection => "targeting",
                PatternType::Infrastructure => "infrastructure",
            };

            clusters.entry(cluster_key.to_string())
                .or_insert_with(Vec::new)
                .push(pattern.clone());
        }

        clusters.into_iter()
            .map(|(cluster_type, cluster_patterns)| PatternCluster {
                cluster_type,
                patterns: cluster_patterns,
                cluster_size: cluster_patterns.len(),
                average_confidence: cluster_patterns.iter()
                    .map(|p| p.confidence)
                    .sum::<f64>() / cluster_patterns.len() as f64,
            })
            .collect()
    }

    /// Get behavioral profile for an actor
    pub fn get_actor_profile(&self, actor_id: &str) -> Option<&ActorBehavioralProfile> {
        self.actor_behaviors.get(actor_id)
    }

    /// Compare behavioral profiles between actors
    pub fn compare_profiles(&self, actor1_id: &str, actor2_id: &str) -> Option<ProfileComparison> {
        let profile1 = self.actor_behaviors.get(actor1_id)?;
        let profile2 = self.actor_behaviors.get(actor2_id)?;

        let pattern_similarity = self.calculate_pattern_similarity(&profile1.patterns, &profile2.patterns);
        let anomaly_similarity = self.calculate_anomaly_similarity(&profile1.anomalies, &profile2.anomalies);

        Some(ProfileComparison {
            actor1_id: actor1_id.to_string(),
            actor2_id: actor2_id.to_string(),
            pattern_similarity_score: pattern_similarity,
            anomaly_similarity_score: anomaly_similarity,
            overall_similarity: (pattern_similarity + anomaly_similarity) / 2.0,
            shared_patterns: self.find_shared_patterns(&profile1.patterns, &profile2.patterns),
            unique_patterns_actor1: self.find_unique_patterns(&profile1.patterns, &profile2.patterns),
            unique_patterns_actor2: self.find_unique_patterns(&profile2.patterns, &profile1.patterns),
        })
    }

    /// Calculate pattern similarity between two pattern sets
    fn calculate_pattern_similarity(&self, patterns1: &[BehavioralPattern], patterns2: &[BehavioralPattern]) -> f64 {
        if patterns1.is_empty() && patterns2.is_empty() {
            return 1.0;
        }

        let mut similarity_score = 0.0;
        let mut total_comparisons = 0;

        for pattern1 in patterns1 {
            for pattern2 in patterns2 {
                if pattern1.pattern_type == pattern2.pattern_type {
                    total_comparisons += 1;
                    let name_similarity = if pattern1.pattern_name == pattern2.pattern_name { 1.0 } else { 0.0 };
                    let confidence_diff = 1.0 - (pattern1.confidence - pattern2.confidence).abs();
                    similarity_score += (name_similarity + confidence_diff) / 2.0;
                }
            }
        }

        if total_comparisons == 0 {
            0.0
        } else {
            similarity_score / total_comparisons as f64
        }
    }

    /// Calculate anomaly similarity
    fn calculate_anomaly_similarity(&self, anomalies1: &[Anomaly], anomalies2: &[Anomaly]) -> f64 {
        if anomalies1.is_empty() && anomalies2.is_empty() {
            return 1.0;
        }

        let mut similarity_score = 0.0;
        let mut total_comparisons = 0;

        for anomaly1 in anomalies1 {
            for anomaly2 in anomalies2 {
                if anomaly1.anomaly_type == anomaly2.anomaly_type {
                    total_comparisons += 1;
                    let severity_diff = 1.0 - (anomaly1.severity - anomaly2.severity).abs();
                    similarity_score += severity_diff;
                }
            }
        }

        if total_comparisons == 0 {
            0.0
        } else {
            similarity_score / total_comparisons as f64
        }
    }

    /// Find shared patterns between two pattern sets
    fn find_shared_patterns(&self, patterns1: &[BehavioralPattern], patterns2: &[BehavioralPattern]) -> Vec<String> {
        patterns1.iter()
            .filter_map(|p1| {
                patterns2.iter()
                    .find(|p2| p1.pattern_name == p2.pattern_name)
                    .map(|_| p1.pattern_name.clone())
            })
            .collect()
    }

    /// Find unique patterns in first set compared to second
    fn find_unique_patterns(&self, patterns1: &[BehavioralPattern], patterns2: &[BehavioralPattern]) -> Vec<String> {
        patterns1.iter()
            .filter_map(|p1| {
                if patterns2.iter().any(|p2| p1.pattern_name == p2.pattern_name) {
                    None
                } else {
                    Some(p1.pattern_name.clone())
                }
            })
            .collect()
    }
}

/// Pattern matching engine
#[derive(Debug, Clone)]
struct PatternMatchingEngine {
    pattern_templates: HashMap<String, PatternTemplate>,
}

impl PatternMatchingEngine {
    fn new() -> Self {
        Self {
            pattern_templates: HashMap::new(),
        }
    }

    fn match_pattern(&self, activity: &Activity) -> Option<PatternMatch> {
        // Implementation for pattern matching logic
        None
    }
}

/// Anomaly detector
#[derive(Debug, Clone)]
struct AnomalyDetector {
    baseline_behaviors: HashMap<String, BaselineBehavior>,
}

impl AnomalyDetector {
    fn new() -> Self {
        Self {
            baseline_behaviors: HashMap::new(),
        }
    }

    async fn detect_anomaly(&self, activity: &Activity, context: &AnalysisContext) -> Result<Option<Anomaly>> {
        // Check for deviations from baseline
        let baseline = self.baseline_behaviors.get(&activity.actor_id);

        if let Some(baseline) = baseline {
            if activity.timestamp.hour() < 6 || activity.timestamp.hour() > 22 {
                return Ok(Some(Anomaly {
                    anomaly_id: Uuid::new_v4().to_string(),
                    anomaly_type: AnomalyType::TemporalDeviation,
                    description: "Activity outside normal operating hours".to_string(),
                    severity: 0.7,
                    confidence: 0.8,
                    indicators: vec![format!("Activity at hour {}", activity.timestamp.hour())],
                    timestamp: activity.timestamp,
                    related_activity: activity.activity_id.clone(),
                }));
            }
        }

        Ok(None)
    }
}

/// Temporal analyzer for behavior prediction
#[derive(Debug, Clone)]
struct TemporalAnalyzer {
    behavior_history: HashMap<String, VecDeque<Activity>>,
}

impl TemporalAnalyzer {
    fn new() -> Self {
        Self {
            behavior_history: HashMap::new(),
        }
    }

    async fn predict_future_behavior(
        &self,
        profile: &ActorBehavioralProfile,
        context: &AnalysisContext,
    ) -> Result<Vec<BehaviorPrediction>> {
        let mut predictions = Vec::new();

        // Predict based on historical patterns
        if let Some(history) = self.behavior_history.get(&profile.actor_id) {
            if history.len() >= 3 {
                // Simple prediction based on recent activity patterns
                predictions.push(BehaviorPrediction {
                    prediction_id: Uuid::new_v4().to_string(),
                    prediction_type: PredictionType::ActivityPattern,
                    description: "Expected continuation of current activity pattern".to_string(),
                    confidence: 0.6,
                    time_horizon: Duration::hours(24),
                    predicted_activities: vec!["Continued reconnaissance".to_string()],
                    risk_assessment: "Medium".to_string(),
                });
            }
        }

        Ok(predictions)
    }
}

// Data structures

/// Activity data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Activity {
    pub activity_id: String,
    pub actor_id: String,
    pub activity_type: ActivityType,
    pub timestamp: DateTime<Utc>,
    pub techniques_used: Vec<String>,
    pub targets: Vec<Target>,
    pub infrastructure_used: Vec<Infrastructure>,
    pub success_indicators: Vec<String>,
    pub failure_indicators: Vec<String>,
}

/// Activity types
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum ActivityType {
    Reconnaissance,
    InitialAccess,
    Execution,
    Persistence,
    PrivilegeEscalation,
    DefenseEvasion,
    CredentialAccess,
    Discovery,
    LateralMovement,
    Collection,
    CommandAndControl,
    Exfiltration,
    Impact,
}

/// Target information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Target {
    pub target_id: String,
    pub target_type: TargetType,
    pub value_score: f64,
    pub criticality: CriticalityLevel,
}

/// Target types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TargetType {
    Individual,
    Organization,
    Government,
    CriticalInfrastructure,
    Financial,
    Healthcare,
    Technology,
}

/// Criticality levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CriticalityLevel {
    Low,
    Medium,
    High,
    Critical,
}

/// Infrastructure information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Infrastructure {
    pub infrastructure_id: String,
    pub infrastructure_type: InfrastructureType,
    pub location: String,
    pub persistence_score: f64,
}

/// Infrastructure types
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum InfrastructureType {
    CommandAndControl,
    DataStaging,
    Proxy,
    DropPoint,
    ExfiltrationPoint,
}

/// Analysis context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisContext {
    pub time_window: Duration,
    pub geographical_scope: Vec<String>,
    pub industry_focus: Vec<String>,
    pub threat_level: ThreatLevel,
}

/// Threat levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ThreatLevel {
    Low,
    Medium,
    High,
    Critical,
}

/// Behavioral analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralAnalysisResult {
    pub actor_id: String,
    pub detected_patterns: Vec<BehavioralPattern>,
    pub anomalies: Vec<Anomaly>,
    pub predictions: Vec<BehaviorPrediction>,
    pub confidence_score: f64,
    pub analysis_timestamp: DateTime<Utc>,
    pub pattern_clusters: Vec<PatternCluster>,
}

/// Behavioral pattern
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralPattern {
    pub pattern_id: String,
    pub pattern_type: PatternType,
    pub pattern_name: String,
    pub description: String,
    pub confidence: f64,
    pub frequency: u32,
    pub first_observed: DateTime<Utc>,
    pub last_observed: DateTime<Utc>,
    pub indicators: Vec<String>,
    pub related_activities: Vec<String>,
}

/// Pattern types
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum PatternType {
    Temporal,
    TechniqueSequence,
    TargetSelection,
    Infrastructure,
}

impl std::fmt::Display for PatternType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PatternType::Temporal => write!(f, "Temporal"),
            PatternType::TechniqueSequence => write!(f, "TechniqueSequence"),
            PatternType::TargetSelection => write!(f, "TargetSelection"),
            PatternType::Infrastructure => write!(f, "Infrastructure"),
        }
    }
}

/// Anomaly detection result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Anomaly {
    pub anomaly_id: String,
    pub anomaly_type: AnomalyType,
    pub description: String,
    pub severity: f64,
    pub confidence: f64,
    pub indicators: Vec<String>,
    pub timestamp: DateTime<Utc>,
    pub related_activity: String,
}

/// Anomaly types
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum AnomalyType {
    TemporalDeviation,
    TechniqueDeviation,
    TargetDeviation,
    VolumeDeviation,
    InfrastructureDeviation,
}

/// Behavior prediction
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehaviorPrediction {
    pub prediction_id: String,
    pub prediction_type: PredictionType,
    pub description: String,
    pub confidence: f64,
    pub time_horizon: Duration,
    pub predicted_activities: Vec<String>,
    pub risk_assessment: String,
}

/// Prediction types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PredictionType {
    ActivityPattern,
    TargetSelection,
    TechniqueEvolution,
    CampaignExpansion,
}

/// Pattern cluster
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternCluster {
    pub cluster_type: String,
    pub patterns: Vec<BehavioralPattern>,
    pub cluster_size: usize,
    pub average_confidence: f64,
}

/// Actor behavioral profile
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActorBehavioralProfile {
    pub actor_id: String,
    pub patterns: Vec<BehavioralPattern>,
    pub anomalies: Vec<Anomaly>,
    pub behavioral_evolution: Vec<BehavioralEvolution>,
    pub last_updated: DateTime<Utc>,
}

/// Behavioral evolution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralEvolution {
    pub evolution_id: String,
    pub timestamp: DateTime<Utc>,
    pub evolution_type: EvolutionType,
    pub description: String,
    pub confidence: f64,
}

/// Evolution types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EvolutionType {
    PatternEmergence,
    TechniqueAdoption,
    TargetShift,
    InfrastructureChange,
    SophisticationIncrease,
}

/// Profile comparison result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfileComparison {
    pub actor1_id: String,
    pub actor2_id: String,
    pub pattern_similarity_score: f64,
    pub anomaly_similarity_score: f64,
    pub overall_similarity: f64,
    pub shared_patterns: Vec<String>,
    pub unique_patterns_actor1: Vec<String>,
    pub unique_patterns_actor2: Vec<String>,
}

/// Baseline behavior for anomaly detection
#[derive(Debug, Clone, Serialize, Deserialize)]
struct BaselineBehavior {
    pub actor_id: String,
    pub normal_hours: (u32, u32), // start_hour, end_hour
    pub common_techniques: Vec<String>,
    pub typical_targets: Vec<String>,
    pub average_activity_frequency: f64,
}

/// Pattern template for matching
#[derive(Debug, Clone, Serialize, Deserialize)]
struct PatternTemplate {
    pub template_id: String,
    pub template_type: PatternType,
    pub conditions: Vec<PatternCondition>,
    pub confidence_weight: f64,
}

/// Pattern condition
#[derive(Debug, Clone, Serialize, Deserialize)]
struct PatternCondition {
    pub field: String,
    pub operator: String,
    pub value: String,
    pub weight: f64,
}

/// Pattern match result
#[derive(Debug, Clone, Serialize, Deserialize)]
struct PatternMatch {
    pub template_id: String,
    pub match_score: f64,
    pub matched_conditions: Vec<String>,
}
