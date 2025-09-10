//! Threat Actor Reputation System
//! 
//! Advanced reputation scoring and tracking system for threat actors
//! with dynamic scoring, historical analysis, and peer comparison.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc, Duration};
use uuid::Uuid;
use anyhow::Result;

/// Comprehensive threat actor reputation system
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatActorReputationSystem {
    pub reputation_scores: HashMap<String, ActorReputation>,
    pub scoring_algorithms: Vec<ScoringAlgorithm>,
    pub reputation_history: HashMap<String, Vec<ReputationSnapshot>>,
    pub peer_comparison_data: PeerComparisonData,
    pub reputation_factors: ReputationFactors,
}

/// Actor reputation profile
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActorReputation {
    pub actor_id: String,
    pub actor_name: String,
    pub overall_reputation_score: f64,
    pub reputation_trend: ReputationTrend,
    pub reputation_category: ReputationCategory,
    pub component_scores: ComponentScores,
    pub reputation_factors: HashMap<String, f64>,
    pub historical_peak_score: f64,
    pub historical_low_score: f64,
    pub volatility_index: f64,
    pub consistency_score: f64,
    pub last_updated: DateTime<Utc>,
    pub calculation_metadata: CalculationMetadata,
}

/// Reputation trend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReputationTrend {
    Increasing,
    Decreasing,
    Stable,
    Volatile,
    Emerging,
    Declining,
}

/// Reputation categories
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReputationCategory {
    Elite,
    Advanced,
    Intermediate,
    Novice,
    Inactive,
    Unknown,
}

/// Component scores breakdown
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentScores {
    pub sophistication_score: f64,
    pub activity_score: f64,
    pub success_rate_score: f64,
    pub impact_score: f64,
    pub stealth_score: f64,
    pub innovation_score: f64,
    pub persistence_score: f64,
    pub attribution_confidence_score: f64,
    pub threat_level_score: f64,
    pub operational_scope_score: f64,
}

/// Calculation metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculationMetadata {
    pub calculation_version: String,
    pub data_sources_used: Vec<String>,
    pub confidence_level: f64,
    pub last_calculation_duration_ms: u64,
    pub factors_considered: u32,
    pub data_quality_score: f64,
}

/// Scoring algorithm
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoringAlgorithm {
    pub algorithm_id: String,
    pub algorithm_name: String,
    pub version: String,
    pub weight: f64,
    pub input_factors: Vec<String>,
    pub calculation_method: String,
    pub accuracy_score: f64,
    pub update_frequency: String,
}

/// Reputation snapshot for historical tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReputationSnapshot {
    pub timestamp: DateTime<Utc>,
    pub reputation_score: f64,
    pub reputation_category: ReputationCategory,
    pub trigger_event: Option<String>,
    pub score_change: f64,
    pub factors_changed: Vec<String>,
    pub data_sources: Vec<String>,
}

/// Peer comparison data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PeerComparisonData {
    pub actor_rankings: Vec<ActorRanking>,
    pub category_statistics: HashMap<String, CategoryStats>,
    pub peer_groups: Vec<PeerGroup>,
    pub comparative_analysis: ComparativeAnalysis,
}

/// Actor ranking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActorRanking {
    pub rank: u32,
    pub actor_id: String,
    pub actor_name: String,
    pub reputation_score: f64,
    pub reputation_category: ReputationCategory,
    pub score_change_7d: f64,
    pub score_change_30d: f64,
    pub percentile: f64,
}

/// Category statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryStats {
    pub category: ReputationCategory,
    pub actor_count: u32,
    pub average_score: f64,
    pub median_score: f64,
    pub standard_deviation: f64,
    pub score_range: (f64, f64),
    pub trend: ReputationTrend,
}

/// Peer group
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PeerGroup {
    pub group_id: String,
    pub group_name: String,
    pub group_criteria: Vec<String>,
    pub member_actors: Vec<String>,
    pub average_reputation: f64,
    pub group_characteristics: Vec<String>,
    pub common_ttps: Vec<String>,
    pub typical_targets: Vec<String>,
}

/// Comparative analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComparativeAnalysis {
    pub top_performers: Vec<String>,
    pub rising_threats: Vec<String>,
    pub declining_actors: Vec<String>,
    pub emerging_patterns: Vec<String>,
    pub threat_landscape_shifts: Vec<ThreatShift>,
    pub anomaly_detections: Vec<ReputationAnomaly>,
}

/// Threat landscape shift
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatShift {
    pub shift_type: String,
    pub description: String,
    pub affected_actors: Vec<String>,
    pub impact_level: f64,
    pub timeframe: String,
    pub indicators: Vec<String>,
}

/// Reputation anomaly
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReputationAnomaly {
    pub anomaly_id: String,
    pub actor_id: String,
    pub anomaly_type: AnomalyType,
    pub severity: AnomalySeverity,
    pub description: String,
    pub detected_at: DateTime<Utc>,
    pub expected_score: f64,
    pub actual_score: f64,
    pub deviation: f64,
    pub potential_causes: Vec<String>,
}

/// Anomaly types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnomalyType {
    SuddenIncrease,
    SuddenDecrease,
    UnexpectedVolatility,
    CategoryMismatch,
    HistoricalDeviation,
    PeerGroupOutlier,
}

/// Anomaly severity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnomalySeverity {
    Low,
    Medium,
    High,
    Critical,
}

/// Reputation factors configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReputationFactors {
    pub sophistication_weight: f64,
    pub activity_frequency_weight: f64,
    pub success_rate_weight: f64,
    pub impact_magnitude_weight: f64,
    pub stealth_capability_weight: f64,
    pub innovation_weight: f64,
    pub persistence_weight: f64,
    pub attribution_confidence_weight: f64,
    pub threat_level_weight: f64,
    pub operational_scope_weight: f64,
    pub temporal_decay_factor: f64,
    pub confidence_threshold: f64,
}

/// Reputation update event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReputationUpdateEvent {
    pub event_id: String,
    pub actor_id: String,
    pub event_type: UpdateEventType,
    pub event_description: String,
    pub impact_score: f64,
    pub confidence: f64,
    pub data_source: String,
    pub timestamp: DateTime<Utc>,
    pub affected_factors: Vec<String>,
}

/// Update event types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UpdateEventType {
    NewCampaign,
    SuccessfulAttack,
    FailedAttack,
    AttributionUpdate,
    TTPEvolution,
    InfrastructureChange,
    IntelligenceReport,
    CountermeasureDeployment,
    ActivityIncrease,
    ActivityDecrease,
}

impl ThreatActorReputationSystem {
    /// Create new reputation system
    pub fn new() -> Self {
        let reputation_factors = ReputationFactors {
            sophistication_weight: 0.15,
            activity_frequency_weight: 0.12,
            success_rate_weight: 0.18,
            impact_magnitude_weight: 0.15,
            stealth_capability_weight: 0.10,
            innovation_weight: 0.08,
            persistence_weight: 0.07,
            attribution_confidence_weight: 0.05,
            threat_level_weight: 0.05,
            operational_scope_weight: 0.05,
            temporal_decay_factor: 0.95,
            confidence_threshold: 0.7,
        };

        let scoring_algorithms = vec![
            ScoringAlgorithm {
                algorithm_id: Uuid::new_v4().to_string(),
                algorithm_name: "Weighted Multi-Factor Scoring".to_string(),
                version: "2.1.0".to_string(),
                weight: 0.4,
                input_factors: vec![
                    "sophistication".to_string(),
                    "success_rate".to_string(),
                    "impact".to_string(),
                ],
                calculation_method: "Weighted average with temporal decay".to_string(),
                accuracy_score: 0.87,
                update_frequency: "Real-time".to_string(),
            },
            ScoringAlgorithm {
                algorithm_id: Uuid::new_v4().to_string(),
                algorithm_name: "Behavioral Pattern Analysis".to_string(),
                version: "1.8.3".to_string(),
                weight: 0.3,
                input_factors: vec![
                    "activity_patterns".to_string(),
                    "ttp_evolution".to_string(),
                    "stealth_capability".to_string(),
                ],
                calculation_method: "Machine learning ensemble".to_string(),
                accuracy_score: 0.82,
                update_frequency: "Daily".to_string(),
            },
            ScoringAlgorithm {
                algorithm_id: Uuid::new_v4().to_string(),
                algorithm_name: "Peer Comparative Scoring".to_string(),
                version: "1.5.2".to_string(),
                weight: 0.3,
                input_factors: vec![
                    "peer_comparison".to_string(),
                    "relative_performance".to_string(),
                    "industry_context".to_string(),
                ],
                calculation_method: "Relative ranking with normalization".to_string(),
                accuracy_score: 0.79,
                update_frequency: "Weekly".to_string(),
            },
        ];

        Self {
            reputation_scores: HashMap::new(),
            scoring_algorithms,
            reputation_history: HashMap::new(),
            peer_comparison_data: PeerComparisonData {
                actor_rankings: vec![],
                category_statistics: HashMap::new(),
                peer_groups: vec![],
                comparative_analysis: ComparativeAnalysis {
                    top_performers: vec![],
                    rising_threats: vec![],
                    declining_actors: vec![],
                    emerging_patterns: vec![],
                    threat_landscape_shifts: vec![],
                    anomaly_detections: vec![],
                },
            },
            reputation_factors,
        }
    }

    /// Calculate reputation for an actor
    pub async fn calculate_actor_reputation(&mut self, actor_id: &str, actor_data: &HashMap<String, f64>) -> Result<ActorReputation> {
        let now = Utc::now();
        
        // Calculate component scores
        let component_scores = self.calculate_component_scores(actor_data)?;
        
        // Calculate overall reputation score
        let overall_score = self.calculate_overall_score(&component_scores)?;
        
        // Determine reputation category
        let reputation_category = self.determine_reputation_category(overall_score);
        
        // Calculate trend
        let reputation_trend = self.calculate_reputation_trend(actor_id, overall_score)?;
        
        // Get historical data
        let (historical_peak, historical_low, volatility, consistency) = 
            self.calculate_historical_metrics(actor_id, overall_score)?;
        
        let reputation = ActorReputation {
            actor_id: actor_id.to_string(),
            actor_name: actor_data.get("name").map(|_| format!("Actor-{}", actor_id)).unwrap_or_else(|| "Unknown".to_string()),
            overall_reputation_score: overall_score,
            reputation_trend,
            reputation_category,
            component_scores,
            reputation_factors: actor_data.clone(),
            historical_peak_score: historical_peak,
            historical_low_score: historical_low,
            volatility_index: volatility,
            consistency_score: consistency,
            last_updated: now,
            calculation_metadata: CalculationMetadata {
                calculation_version: "2.1.0".to_string(),
                data_sources_used: vec!["internal_intelligence".to_string(), "external_feeds".to_string()],
                confidence_level: 0.85,
                last_calculation_duration_ms: 125,
                factors_considered: actor_data.len() as u32,
                data_quality_score: 0.78,
            },
        };

        // Store reputation and create snapshot
        self.reputation_scores.insert(actor_id.to_string(), reputation.clone());
        self.add_reputation_snapshot(actor_id, &reputation)?;

        Ok(reputation)
    }

    /// Calculate component scores
    fn calculate_component_scores(&self, actor_data: &HashMap<String, f64>) -> Result<ComponentScores> {
        Ok(ComponentScores {
            sophistication_score: actor_data.get("sophistication").cloned().unwrap_or(0.5) * 100.0,
            activity_score: actor_data.get("activity_frequency").cloned().unwrap_or(0.5) * 100.0,
            success_rate_score: actor_data.get("success_rate").cloned().unwrap_or(0.5) * 100.0,
            impact_score: actor_data.get("impact_magnitude").cloned().unwrap_or(0.5) * 100.0,
            stealth_score: actor_data.get("stealth_capability").cloned().unwrap_or(0.5) * 100.0,
            innovation_score: actor_data.get("innovation").cloned().unwrap_or(0.5) * 100.0,
            persistence_score: actor_data.get("persistence").cloned().unwrap_or(0.5) * 100.0,
            attribution_confidence_score: actor_data.get("attribution_confidence").cloned().unwrap_or(0.5) * 100.0,
            threat_level_score: actor_data.get("threat_level").cloned().unwrap_or(0.5) * 100.0,
            operational_scope_score: actor_data.get("operational_scope").cloned().unwrap_or(0.5) * 100.0,
        })
    }

    /// Calculate overall reputation score
    fn calculate_overall_score(&self, component_scores: &ComponentScores) -> Result<f64> {
        let factors = &self.reputation_factors;
        
        let weighted_score = 
            (component_scores.sophistication_score / 100.0) * factors.sophistication_weight +
            (component_scores.activity_score / 100.0) * factors.activity_frequency_weight +
            (component_scores.success_rate_score / 100.0) * factors.success_rate_weight +
            (component_scores.impact_score / 100.0) * factors.impact_magnitude_weight +
            (component_scores.stealth_score / 100.0) * factors.stealth_capability_weight +
            (component_scores.innovation_score / 100.0) * factors.innovation_weight +
            (component_scores.persistence_score / 100.0) * factors.persistence_weight +
            (component_scores.attribution_confidence_score / 100.0) * factors.attribution_confidence_weight +
            (component_scores.threat_level_score / 100.0) * factors.threat_level_weight +
            (component_scores.operational_scope_score / 100.0) * factors.operational_scope_weight;

        // Scale to 0-100 range
        Ok((weighted_score * 100.0).min(100.0).max(0.0))
    }

    /// Determine reputation category based on score
    fn determine_reputation_category(&self, score: f64) -> ReputationCategory {
        match score {
            s if s >= 90.0 => ReputationCategory::Elite,
            s if s >= 75.0 => ReputationCategory::Advanced,
            s if s >= 50.0 => ReputationCategory::Intermediate,
            s if s >= 25.0 => ReputationCategory::Novice,
            s if s < 25.0 => ReputationCategory::Inactive,
            _ => ReputationCategory::Unknown,
        }
    }

    /// Calculate reputation trend
    fn calculate_reputation_trend(&self, actor_id: &str, current_score: f64) -> Result<ReputationTrend> {
        if let Some(history) = self.reputation_history.get(actor_id) {
            if history.len() >= 2 {
                let recent_scores: Vec<f64> = history.iter()
                    .rev()
                    .take(5)
                    .map(|snapshot| snapshot.reputation_score)
                    .collect();
                
                if recent_scores.len() >= 2 {
                    let trend_slope = self.calculate_trend_slope(&recent_scores);
                    let volatility = self.calculate_volatility(&recent_scores);
                    
                    return Ok(match (trend_slope, volatility) {
                        (slope, vol) if vol > 0.15 => ReputationTrend::Volatile,
                        (slope, _) if slope > 0.05 => ReputationTrend::Increasing,
                        (slope, _) if slope < -0.05 => ReputationTrend::Decreasing,
                        _ => ReputationTrend::Stable,
                    });
                }
            }
        }
        
        Ok(ReputationTrend::Stable)
    }

    /// Calculate trend slope
    fn calculate_trend_slope(&self, scores: &[f64]) -> f64 {
        if scores.len() < 2 {
            return 0.0;
        }
        
        let n = scores.len() as f64;
        let sum_x: f64 = (0..scores.len()).map(|i| i as f64).sum();
        let sum_y: f64 = scores.iter().sum();
        let sum_xy: f64 = scores.iter().enumerate().map(|(i, &y)| i as f64 * y).sum();
        let sum_x2: f64 = (0..scores.len()).map(|i| (i as f64).powi(2)).sum();
        
        (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x.powi(2))
    }

    /// Calculate volatility
    fn calculate_volatility(&self, scores: &[f64]) -> f64 {
        if scores.len() < 2 {
            return 0.0;
        }
        
        let mean = scores.iter().sum::<f64>() / scores.len() as f64;
        let variance = scores.iter()
            .map(|score| (score - mean).powi(2))
            .sum::<f64>() / scores.len() as f64;
        
        variance.sqrt() / mean
    }

    /// Calculate historical metrics
    fn calculate_historical_metrics(&self, actor_id: &str, current_score: f64) -> Result<(f64, f64, f64, f64)> {
        if let Some(history) = self.reputation_history.get(actor_id) {
            if !history.is_empty() {
                let scores: Vec<f64> = history.iter().map(|s| s.reputation_score).collect();
                let peak = scores.iter().fold(current_score, |a, &b| a.max(b));
                let low = scores.iter().fold(current_score, |a, &b| a.min(b));
                let volatility = self.calculate_volatility(&scores);
                let consistency = 1.0 - volatility;
                
                return Ok((peak, low, volatility, consistency));
            }
        }
        
        Ok((current_score, current_score, 0.0, 1.0))
    }

    /// Add reputation snapshot to history
    fn add_reputation_snapshot(&mut self, actor_id: &str, reputation: &ActorReputation) -> Result<()> {
        let snapshot = ReputationSnapshot {
            timestamp: Utc::now(),
            reputation_score: reputation.overall_reputation_score,
            reputation_category: reputation.reputation_category.clone(),
            trigger_event: None,
            score_change: 0.0, // Calculate based on previous snapshot
            factors_changed: vec![],
            data_sources: reputation.calculation_metadata.data_sources_used.clone(),
        };

        self.reputation_history
            .entry(actor_id.to_string())
            .or_insert_with(Vec::new)
            .push(snapshot);

        // Keep only last 100 snapshots per actor
        if let Some(history) = self.reputation_history.get_mut(actor_id) {
            if history.len() > 100 {
                history.remove(0);
            }
        }

        Ok(())
    }

    /// Update reputation based on new event
    pub async fn update_reputation_from_event(&mut self, event: &ReputationUpdateEvent) -> Result<()> {
        let new_reputation_score;
        let score_adjustment;
        
        // First, check if actor exists and calculate the new score
        if let Some(reputation) = self.reputation_scores.get(&event.actor_id) {
            let impact_multiplier = match event.event_type {
                UpdateEventType::SuccessfulAttack => 1.2,
                UpdateEventType::FailedAttack => 0.9,
                UpdateEventType::NewCampaign => 1.1,
                UpdateEventType::AttributionUpdate => 1.0,
                UpdateEventType::TTPEvolution => 1.15,
                UpdateEventType::CountermeasureDeployment => 0.95,
                _ => 1.0,
            };

            score_adjustment = event.impact_score * impact_multiplier * event.confidence;
            new_reputation_score = (reputation.overall_reputation_score + score_adjustment).min(100.0).max(0.0);
        } else {
            return Ok(()); // Actor not found
        }

        // Now update the reputation with the calculated values
        if let Some(reputation) = self.reputation_scores.get_mut(&event.actor_id) {
            reputation.overall_reputation_score = new_reputation_score;
            reputation.last_updated = Utc::now();
        }
        
        // Calculate the new reputation category after mutation
        let new_reputation_category = self.determine_reputation_category(new_reputation_score);

        // Add snapshot for this event
        let snapshot = ReputationSnapshot {
            timestamp: event.timestamp,
            reputation_score: new_reputation_score,
            reputation_category: new_reputation_category,
            trigger_event: Some(event.event_description.clone()),
            score_change: score_adjustment,
            factors_changed: event.affected_factors.clone(),
            data_sources: vec![event.data_source.clone()],
        };

        self.reputation_history
            .entry(event.actor_id.clone())
            .or_insert_with(Vec::new)
            .push(snapshot);

        Ok(())
    }

    /// Generate actor rankings
    pub async fn generate_actor_rankings(&mut self) -> Result<Vec<ActorRanking>> {
        let mut rankings: Vec<_> = self.reputation_scores.iter()
            .map(|(actor_id, reputation)| {
                let score_change_7d = self.calculate_score_change(actor_id, Duration::days(7));
                let score_change_30d = self.calculate_score_change(actor_id, Duration::days(30));
                let percentile = self.calculate_percentile(reputation.overall_reputation_score);

                ActorRanking {
                    rank: 0, // Will be set after sorting
                    actor_id: actor_id.clone(),
                    actor_name: reputation.actor_name.clone(),
                    reputation_score: reputation.overall_reputation_score,
                    reputation_category: reputation.reputation_category.clone(),
                    score_change_7d,
                    score_change_30d,
                    percentile,
                }
            })
            .collect();

        // Sort by reputation score (descending)
        rankings.sort_by(|a, b| b.reputation_score.partial_cmp(&a.reputation_score).unwrap());

        // Assign ranks
        for (index, ranking) in rankings.iter_mut().enumerate() {
            ranking.rank = (index + 1) as u32;
        }

        self.peer_comparison_data.actor_rankings = rankings.clone();
        Ok(rankings)
    }

    /// Calculate score change over period
    fn calculate_score_change(&self, actor_id: &str, period: Duration) -> f64 {
        if let Some(history) = self.reputation_history.get(actor_id) {
            let cutoff_time = Utc::now() - period;
            let historical_score = history.iter()
                .filter(|snapshot| snapshot.timestamp >= cutoff_time)
                .next()
                .map(|snapshot| snapshot.reputation_score);

            if let (Some(current), Some(historical)) = (
                self.reputation_scores.get(actor_id).map(|r| r.overall_reputation_score),
                historical_score
            ) {
                return current - historical;
            }
        }
        0.0
    }

    /// Calculate percentile position
    fn calculate_percentile(&self, score: f64) -> f64 {
        let scores: Vec<f64> = self.reputation_scores.values()
            .map(|r| r.overall_reputation_score)
            .collect();

        if scores.is_empty() {
            return 50.0;
        }

        let lower_count = scores.iter().filter(|&&s| s < score).count();
        (lower_count as f64 / scores.len() as f64) * 100.0
    }

    /// Get reputation analysis for actor
    pub async fn get_reputation_analysis(&self, actor_id: &str) -> Result<Option<ActorReputation>> {
        Ok(self.reputation_scores.get(actor_id).cloned())
    }

    /// Detect reputation anomalies
    pub async fn detect_reputation_anomalies(&mut self) -> Result<Vec<ReputationAnomaly>> {
        let mut anomalies = Vec::new();

        for (actor_id, reputation) in &self.reputation_scores {
            // Check for sudden score changes
            if let Some(history) = self.reputation_history.get(actor_id) {
                if history.len() >= 2 {
                    let recent_change = history.last().unwrap().score_change;
                    if recent_change.abs() > 20.0 {
                        let anomaly_type = if recent_change > 0.0 {
                            AnomalyType::SuddenIncrease
                        } else {
                            AnomalyType::SuddenDecrease
                        };

                        anomalies.push(ReputationAnomaly {
                            anomaly_id: Uuid::new_v4().to_string(),
                            actor_id: actor_id.clone(),
                            anomaly_type,
                            severity: if recent_change.abs() > 30.0 {
                                AnomalySeverity::High
                            } else {
                                AnomalySeverity::Medium
                            },
                            description: format!("Reputation score changed by {:.1} points", recent_change),
                            detected_at: Utc::now(),
                            expected_score: reputation.overall_reputation_score - recent_change,
                            actual_score: reputation.overall_reputation_score,
                            deviation: recent_change.abs(),
                            potential_causes: vec![
                                "New intelligence data".to_string(),
                                "Significant campaign activity".to_string(),
                                "Attribution update".to_string(),
                            ],
                        });
                    }
                }
            }
        }

        self.peer_comparison_data.comparative_analysis.anomaly_detections = anomalies.clone();
        Ok(anomalies)
    }
}

impl Default for ThreatActorReputationSystem {
    fn default() -> Self {
        Self::new()
    }
}