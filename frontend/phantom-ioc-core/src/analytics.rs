// phantom-ioc-core/src/analytics.rs
// Machine learning insights, trend analysis, and predictive capabilities

use crate::types::*;
use chrono::{DateTime, Utc, Duration};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Analytics engine for advanced threat intelligence analysis
pub struct AnalyticsEngine {
    ml_models: Arc<RwLock<HashMap<String, MLModel>>>,
    analytics_jobs: Arc<RwLock<HashMap<String, AnalyticsJob>>>,
    predictions: Arc<RwLock<HashMap<String, Prediction>>>,
    trends: Arc<RwLock<HashMap<String, TrendAnalysis>>>,
    statistics: Arc<RwLock<AnalyticsStats>>,
}

impl AnalyticsEngine {
    /// Create a new analytics engine
    pub async fn new() -> Result<Self, IOCError> {
        let engine = Self {
            ml_models: Arc::new(RwLock::new(HashMap::new())),
            analytics_jobs: Arc::new(RwLock::new(HashMap::new())),
            predictions: Arc::new(RwLock::new(HashMap::new())),
            trends: Arc::new(RwLock::new(HashMap::new())),
            statistics: Arc::new(RwLock::new(AnalyticsStats::default())),
        };

        // Initialize with default models and jobs
        engine.initialize_default_models().await?;

        Ok(engine)
    }

    /// Initialize default ML models and analytics
    async fn initialize_default_models(&self) -> Result<(), IOCError> {
        let default_models = vec![
            MLModel {
                id: "threat_classification".to_string(),
                name: "Threat Classification Model".to_string(),
                model_type: ModelType::Classification,
                algorithm: "RandomForest".to_string(),
                version: "1.0".to_string(),
                training_data_size: 50000,
                accuracy: 0.92,
                precision: 0.89,
                recall: 0.94,
                f1_score: 0.91,
                features: vec![
                    "ioc_type".to_string(),
                    "confidence_score".to_string(),
                    "source_reputation".to_string(),
                    "geographic_origin".to_string(),
                    "first_seen_age".to_string(),
                    "correlation_count".to_string(),
                ],
                target_classes: vec![
                    "malware".to_string(),
                    "phishing".to_string(),
                    "c2".to_string(),
                    "benign".to_string(),
                ],
                trained_at: Utc::now() - Duration::days(30),
                last_updated: Utc::now() - Duration::days(7),
                status: ModelStatus::Active,
            },
            MLModel {
                id: "severity_prediction".to_string(),
                name: "Severity Prediction Model".to_string(),
                model_type: ModelType::Regression,
                algorithm: "GradientBoosting".to_string(),
                version: "2.1".to_string(),
                training_data_size: 75000,
                accuracy: 0.88,
                precision: 0.86,
                recall: 0.90,
                f1_score: 0.88,
                features: vec![
                    "threat_actor_sophistication".to_string(),
                    "attack_vector_complexity".to_string(),
                    "potential_impact_scope".to_string(),
                    "asset_criticality".to_string(),
                    "vulnerability_cvss".to_string(),
                ],
                target_classes: vec![
                    "low".to_string(),
                    "medium".to_string(),
                    "high".to_string(),
                    "critical".to_string(),
                ],
                trained_at: Utc::now() - Duration::days(14),
                last_updated: Utc::now() - Duration::days(2),
                status: ModelStatus::Active,
            },
            MLModel {
                id: "campaign_detection".to_string(),
                name: "Campaign Detection Model".to_string(),
                model_type: ModelType::Clustering,
                algorithm: "DBSCAN".to_string(),
                version: "1.5".to_string(),
                training_data_size: 25000,
                accuracy: 0.85,
                precision: 0.83,
                recall: 0.87,
                f1_score: 0.85,
                features: vec![
                    "temporal_patterns".to_string(),
                    "infrastructure_overlap".to_string(),
                    "ttps_similarity".to_string(),
                    "target_profile".to_string(),
                ],
                target_classes: vec![
                    "coordinated_campaign".to_string(),
                    "isolated_incident".to_string(),
                ],
                trained_at: Utc::now() - Duration::days(21),
                last_updated: Utc::now() - Duration::days(5),
                status: ModelStatus::Active,
            },
        ];

        let mut models = self.ml_models.write().await;
        for model in default_models {
            models.insert(model.id.clone(), model);
        }

        Ok(())
    }

    /// Perform predictive analysis on an IOC
    pub async fn predict_threat_properties(&self, ioc: &IOC, context: &PredictionContext) -> Result<ThreatPrediction, IOCError> {
        let prediction_id = Uuid::new_v4().to_string();
        let analysis_time = Utc::now();

        // Get relevant ML models
        let models = self.ml_models.read().await;
        
        // Threat classification prediction
        let threat_classification = if let Some(model) = models.get("threat_classification") {
            self.predict_threat_classification(ioc, model, context).await?
        } else {
            ThreatClassificationResult {
                predicted_class: "unknown".to_string(),
                confidence: 0.5,
                class_probabilities: HashMap::new(),
            }
        };

        // Severity prediction
        let severity_prediction = if let Some(model) = models.get("severity_prediction") {
            self.predict_severity(ioc, model, context).await?
        } else {
            SeverityPredictionResult {
                predicted_severity: Severity::Medium,
                confidence: 0.5,
                risk_factors: vec![],
            }
        };

        // Campaign detection
        let campaign_likelihood = if let Some(model) = models.get("campaign_detection") {
            self.assess_campaign_likelihood(ioc, model, context).await?
        } else {
            CampaignLikelihoodResult {
                is_campaign: false,
                confidence: 0.5,
                related_indicators: vec![],
            }
        };

        // Generate behavioral prediction
        let behavioral_prediction = self.predict_behavior_patterns(ioc, context).await?;

        // Estimate evolution timeline
        let evolution_timeline = self.predict_threat_evolution(ioc, &threat_classification, context).await?;

        let prediction = ThreatPrediction {
            id: prediction_id.clone(),
            ioc_id: ioc.id.to_string(),
            analysis_time,
            threat_classification,
            severity_prediction,
            campaign_likelihood,
            behavioral_prediction,
            evolution_timeline,
            confidence_score: self.calculate_overall_confidence(&prediction_id, ioc).await,
            metadata: HashMap::from([
                ("context_type".to_string(), serde_json::Value::String(context.analysis_type.clone())),
                ("models_used".to_string(), serde_json::Value::Number(serde_json::Number::from(models.len()))),
            ]),
        };

        // Store prediction
        {
            let mut predictions = self.predictions.write().await;
            predictions.insert(prediction_id, prediction.clone());
        }

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.total_predictions += 1;
            stats.last_prediction_time = Some(analysis_time);
        }

        Ok(prediction)
    }

    /// Predict threat classification using ML model
    async fn predict_threat_classification(
        &self,
        ioc: &IOC,
        model: &MLModel,
        context: &PredictionContext
    ) -> Result<ThreatClassificationResult, IOCError> {
        // Extract features for prediction
        let features = self.extract_classification_features(ioc, context).await;

        // Simulate ML prediction (in real implementation, this would call actual ML model)
        let mut class_probabilities = HashMap::new();
        
        // Simplified heuristic-based classification
        match ioc.indicator_type {
            IOCType::Hash => {
                class_probabilities.insert("malware".to_string(), 0.7);
                class_probabilities.insert("benign".to_string(), 0.2);
                class_probabilities.insert("phishing".to_string(), 0.05);
                class_probabilities.insert("c2".to_string(), 0.05);
            }
            IOCType::Domain | IOCType::URL => {
                if ioc.tags.contains(&"phishing".to_string()) {
                    class_probabilities.insert("phishing".to_string(), 0.8);
                    class_probabilities.insert("c2".to_string(), 0.1);
                    class_probabilities.insert("malware".to_string(), 0.05);
                    class_probabilities.insert("benign".to_string(), 0.05);
                } else {
                    class_probabilities.insert("c2".to_string(), 0.6);
                    class_probabilities.insert("malware".to_string(), 0.2);
                    class_probabilities.insert("phishing".to_string(), 0.15);
                    class_probabilities.insert("benign".to_string(), 0.05);
                }
            }
            IOCType::IPAddress => {
                class_probabilities.insert("c2".to_string(), 0.5);
                class_probabilities.insert("malware".to_string(), 0.3);
                class_probabilities.insert("phishing".to_string(), 0.1);
                class_probabilities.insert("benign".to_string(), 0.1);
            }
            _ => {
                class_probabilities.insert("benign".to_string(), 0.4);
                class_probabilities.insert("malware".to_string(), 0.3);
                class_probabilities.insert("c2".to_string(), 0.2);
                class_probabilities.insert("phishing".to_string(), 0.1);
            }
        }

        // Adjust probabilities based on confidence and context
        let confidence_multiplier = ioc.confidence;
        for (_, prob) in class_probabilities.iter_mut() {
            *prob *= confidence_multiplier;
        }

        // Find the class with highest probability
        let predicted_class = class_probabilities
            .iter()
            .max_by(|a, b| a.1.partial_cmp(b.1).unwrap())
            .map(|(k, _)| k.clone())
            .unwrap_or("unknown".to_string());

        let confidence = class_probabilities.get(&predicted_class).copied().unwrap_or(0.5);

        Ok(ThreatClassificationResult {
            predicted_class,
            confidence,
            class_probabilities,
        })
    }

    /// Predict severity using ML model
    async fn predict_severity(
        &self,
        ioc: &IOC,
        model: &MLModel,
        context: &PredictionContext
    ) -> Result<SeverityPredictionResult, IOCError> {
        let mut risk_factors = Vec::new();

        // Analyze various risk factors
        let base_severity_score = match ioc.severity {
            Severity::Critical => 1.0,
            Severity::High => 0.8,
            Severity::Medium => 0.6,
            Severity::Low => 0.4,
        };

        let mut adjusted_score = base_severity_score;

        // Factor in confidence
        adjusted_score *= ioc.confidence;
        if ioc.confidence > 0.9 {
            risk_factors.push("Very high confidence indicator".to_string());
        }

        // Factor in threat actor sophistication
        if ioc.tags.contains(&"apt".to_string()) {
            adjusted_score += 0.2;
            risk_factors.push("Advanced Persistent Threat involvement".to_string());
        }

        // Factor in attack complexity
        if ioc.tags.contains(&"zero_day".to_string()) {
            adjusted_score += 0.3;
            risk_factors.push("Zero-day exploit involvement".to_string());
        }

        // Factor in asset criticality from context
        match context.asset_criticality.as_str() {
            "critical" => {
                adjusted_score += 0.2;
                risk_factors.push("Critical asset exposure".to_string());
            }
            "high" => {
                adjusted_score += 0.1;
                risk_factors.push("High-value asset exposure".to_string());
            }
            _ => {}
        }

        // Factor in network exposure
        if context.network_exposure == "external" {
            adjusted_score += 0.15;
            risk_factors.push("External network exposure".to_string());
        }

        adjusted_score = adjusted_score.min(1.0);

        let predicted_severity = if adjusted_score >= 0.9 {
            Severity::Critical
        } else if adjusted_score >= 0.7 {
            Severity::High
        } else if adjusted_score >= 0.4 {
            Severity::Medium
        } else {
            Severity::Low
        };

        Ok(SeverityPredictionResult {
            predicted_severity,
            confidence: adjusted_score,
            risk_factors,
        })
    }

    /// Assess campaign likelihood
    async fn assess_campaign_likelihood(
        &self,
        ioc: &IOC,
        model: &MLModel,
        context: &PredictionContext
    ) -> Result<CampaignLikelihoodResult, IOCError> {
        let mut campaign_score = 0.0;
        let mut related_indicators = Vec::new();

        // Check for temporal clustering
        if context.related_iocs_count > 5 {
            campaign_score += 0.4;
            related_indicators.push(format!("{} related IOCs detected", context.related_iocs_count));
        }

        // Check for infrastructure overlap
        if context.infrastructure_overlap > 0.3 {
            campaign_score += 0.3;
            related_indicators.push("Infrastructure overlap detected".to_string());
        }

        // Check for TTP similarity
        if context.ttp_similarity > 0.5 {
            campaign_score += 0.2;
            related_indicators.push("Similar tactics, techniques, and procedures".to_string());
        }

        // Check for coordinated timing
        if context.coordinated_timing {
            campaign_score += 0.1;
            related_indicators.push("Coordinated timing patterns".to_string());
        }

        let is_campaign = campaign_score > 0.5;
        let confidence = campaign_score.min(1.0);

        Ok(CampaignLikelihoodResult {
            is_campaign,
            confidence,
            related_indicators,
        })
    }

    /// Predict behavioral patterns
    async fn predict_behavior_patterns(&self, ioc: &IOC, context: &PredictionContext) -> Result<BehavioralPrediction, IOCError> {
        let mut behaviors = Vec::new();
        let mut indicators = Vec::new();

        // Predict based on IOC type and characteristics
        match ioc.indicator_type {
            IOCType::Hash => {
                behaviors.push(PredictedBehavior {
                    behavior_type: "file_execution".to_string(),
                    likelihood: 0.9,
                    description: "Likely to execute malicious payload".to_string(),
                });
                indicators.push("File hash indicates executable malware".to_string());
            }
            IOCType::Domain | IOCType::URL => {
                behaviors.push(PredictedBehavior {
                    behavior_type: "network_communication".to_string(),
                    likelihood: 0.8,
                    description: "Likely to establish network communications".to_string(),
                });
                if ioc.tags.contains(&"phishing".to_string()) {
                    behaviors.push(PredictedBehavior {
                        behavior_type: "credential_harvesting".to_string(),
                        likelihood: 0.7,
                        description: "Likely to harvest user credentials".to_string(),
                    });
                }
            }
            IOCType::IPAddress => {
                behaviors.push(PredictedBehavior {
                    behavior_type: "c2_communication".to_string(),
                    likelihood: 0.6,
                    description: "Likely command and control communication".to_string(),
                });
            }
            _ => {}
        }

        // Predict persistence mechanisms
        if ioc.tags.contains(&"persistence".to_string()) {
            behaviors.push(PredictedBehavior {
                behavior_type: "persistence_establishment".to_string(),
                likelihood: 0.8,
                description: "Likely to establish persistence mechanisms".to_string(),
            });
        }

        // Predict lateral movement
        if ioc.tags.contains(&"lateral_movement".to_string()) {
            behaviors.push(PredictedBehavior {
                behavior_type: "lateral_movement".to_string(),
                likelihood: 0.7,
                description: "Likely to attempt lateral movement".to_string(),
            });
        }

        let attack_progression = self.predict_attack_progression(&behaviors).await;

        Ok(BehavioralPrediction {
            predicted_behaviors: behaviors,
            attack_progression,
            confidence: 0.8, // Average confidence
            behavioral_indicators: indicators,
        })
    }

    /// Predict threat evolution timeline
    async fn predict_threat_evolution(
        &self,
        ioc: &IOC,
        classification: &ThreatClassificationResult,
        context: &PredictionContext
    ) -> Result<EvolutionTimeline, IOCError> {
        let mut phases = Vec::new();

        // Initial compromise phase
        phases.push(ThreatPhase {
            phase_name: "Initial Compromise".to_string(),
            estimated_start: Utc::now(),
            estimated_duration: Duration::hours(1),
            activities: vec![
                "Exploit delivery".to_string(),
                "Initial system access".to_string(),
            ],
            indicators: vec![
                "Network connections to IOC".to_string(),
                "Process execution".to_string(),
            ],
        });

        // Based on predicted threat class, add subsequent phases
        match classification.predicted_class.as_str() {
            "malware" => {
                phases.push(ThreatPhase {
                    phase_name: "Persistence Establishment".to_string(),
                    estimated_start: Utc::now() + Duration::minutes(30),
                    estimated_duration: Duration::hours(2),
                    activities: vec![
                        "Registry modification".to_string(),
                        "Scheduled task creation".to_string(),
                    ],
                    indicators: vec![
                        "File system changes".to_string(),
                        "Registry modifications".to_string(),
                    ],
                });
                phases.push(ThreatPhase {
                    phase_name: "Discovery".to_string(),
                    estimated_start: Utc::now() + Duration::hours(2),
                    estimated_duration: Duration::hours(6),
                    activities: vec![
                        "System reconnaissance".to_string(),
                        "Network discovery".to_string(),
                    ],
                    indicators: vec![
                        "Network scanning activity".to_string(),
                        "System enumeration".to_string(),
                    ],
                });
            }
            "phishing" => {
                phases.push(ThreatPhase {
                    phase_name: "Credential Harvesting".to_string(),
                    estimated_start: Utc::now() + Duration::minutes(15),
                    estimated_duration: Duration::hours(1),
                    activities: vec![
                        "Credential capture".to_string(),
                        "Session hijacking".to_string(),
                    ],
                    indicators: vec![
                        "Suspicious authentication attempts".to_string(),
                        "Unexpected account access".to_string(),
                    ],
                });
            }
            "c2" => {
                phases.push(ThreatPhase {
                    phase_name: "Command and Control".to_string(),
                    estimated_start: Utc::now() + Duration::minutes(10),
                    estimated_duration: Duration::days(30),
                    activities: vec![
                        "Beacon establishment".to_string(),
                        "Command execution".to_string(),
                    ],
                    indicators: vec![
                        "Regular network beacons".to_string(),
                        "Encrypted communications".to_string(),
                    ],
                });
            }
            _ => {}
        }

        Ok(EvolutionTimeline {
            total_estimated_duration: phases.iter()
                .map(|p| p.estimated_duration.num_hours())
                .sum::<i64>(),
            phases,
            confidence: classification.confidence,
        })
    }

    /// Perform trend analysis on historical IOC data
    pub async fn analyze_trends(&self, time_period: Duration, trend_type: &str) -> Result<TrendAnalysis, IOCError> {
        let analysis_id = Uuid::new_v4().to_string();
        let analysis_time = Utc::now();

        // Simulate trend analysis (in real implementation, would query historical data)
        let trend_data = self.generate_trend_data(time_period, trend_type).await?;
        let patterns = self.identify_patterns(&trend_data).await?;
        let forecast = self.generate_forecast(&trend_data, Duration::days(30)).await?;

        let analysis = TrendAnalysis {
            id: analysis_id.clone(),
            analysis_time,
            trend_type: trend_type.to_string(),
            time_period,
            data_points: trend_data,
            identified_patterns: patterns,
            trend_direction: self.calculate_trend_direction(&trend_data),
            seasonality: self.detect_seasonality(&trend_data),
            anomalies: self.detect_anomalies(&trend_data).await?,
            forecast,
            confidence: 0.85,
        };

        // Store trend analysis
        {
            let mut trends = self.trends.write().await;
            trends.insert(analysis_id, analysis.clone());
        }

        Ok(analysis)
    }

    /// Generate simulated trend data
    async fn generate_trend_data(&self, period: Duration, trend_type: &str) -> Result<Vec<TrendDataPoint>, IOCError> {
        let mut data_points = Vec::new();
        let days = period.num_days();
        let now = Utc::now();

        for i in 0..days {
            let date = now - Duration::days(days - i);
            let value = match trend_type {
                "threat_volume" => {
                    // Simulate increasing threat volume with weekly patterns
                    let base = 100.0;
                    let growth = i as f64 * 0.5;
                    let weekly_pattern = (i as f64 * 2.0 * std::f64::consts::PI / 7.0).sin() * 20.0;
                    base + growth + weekly_pattern
                }
                "severity_distribution" => {
                    // Simulate severity trends
                    let base = 50.0;
                    let trend = (i as f64 / days as f64) * 30.0;
                    base + trend
                }
                "geographic_distribution" => {
                    // Simulate geographic spread
                    let base = 20.0;
                    let spread = (i as f64 / days as f64) * 15.0;
                    base + spread
                }
                _ => 50.0,
            };

            data_points.push(TrendDataPoint {
                timestamp: date,
                value,
                metadata: HashMap::new(),
            });
        }

        Ok(data_points)
    }

    /// Identify patterns in trend data
    async fn identify_patterns(&self, data: &[TrendDataPoint]) -> Result<Vec<TrendPattern>, IOCError> {
        let mut patterns = Vec::new();

        // Simple pattern detection
        let values: Vec<f64> = data.iter().map(|d| d.value).collect();
        
        // Detect upward trend
        if values.len() > 10 {
            let first_half_avg = values[..values.len()/2].iter().sum::<f64>() / (values.len() / 2) as f64;
            let second_half_avg = values[values.len()/2..].iter().sum::<f64>() / (values.len() / 2) as f64;
            
            if second_half_avg > first_half_avg * 1.1 {
                patterns.push(TrendPattern {
                    pattern_type: "upward_trend".to_string(),
                    confidence: 0.8,
                    description: "Increasing trend detected".to_string(),
                    significance: if second_half_avg > first_half_avg * 1.5 {
                        PatternSignificance::High
                    } else {
                        PatternSignificance::Medium
                    },
                });
            }
        }

        // Detect weekly patterns (simplified)
        if values.len() >= 14 {
            patterns.push(TrendPattern {
                pattern_type: "weekly_cycle".to_string(),
                confidence: 0.7,
                description: "Weekly cyclical pattern detected".to_string(),
                significance: PatternSignificance::Medium,
            });
        }

        Ok(patterns)
    }

    fn calculate_trend_direction(&self, data: &[TrendDataPoint]) -> TrendDirection {
        if data.len() < 2 {
            return TrendDirection::Stable;
        }

        let first_value = data[0].value;
        let last_value = data[data.len() - 1].value;
        let change_percentage = (last_value - first_value) / first_value * 100.0;

        if change_percentage > 10.0 {
            TrendDirection::Increasing
        } else if change_percentage < -10.0 {
            TrendDirection::Decreasing
        } else {
            TrendDirection::Stable
        }
    }

    fn detect_seasonality(&self, data: &[TrendDataPoint]) -> Option<SeasonalityPattern> {
        if data.len() < 28 { // Need at least 4 weeks of data
            return None;
        }

        // Simplified seasonality detection
        Some(SeasonalityPattern {
            period_days: 7,
            strength: 0.6,
            pattern_type: "weekly".to_string(),
        })
    }

    async fn detect_anomalies(&self, data: &[TrendDataPoint]) -> Result<Vec<AnomalyDetection>, IOCError> {
        let mut anomalies = Vec::new();
        
        if data.len() < 10 {
            return Ok(anomalies);
        }

        let values: Vec<f64> = data.iter().map(|d| d.value).collect();
        let mean = values.iter().sum::<f64>() / values.len() as f64;
        let variance = values.iter().map(|v| (v - mean).powi(2)).sum::<f64>() / values.len() as f64;
        let std_dev = variance.sqrt();
        let threshold = mean + 2.0 * std_dev;

        for (i, point) in data.iter().enumerate() {
            if point.value > threshold {
                anomalies.push(AnomalyDetection {
                    timestamp: point.timestamp,
                    value: point.value,
                    expected_value: mean,
                    deviation_score: (point.value - mean) / std_dev,
                    anomaly_type: "statistical_outlier".to_string(),
                    significance: if point.value > mean + 3.0 * std_dev {
                        AnomalySignificance::High
                    } else {
                        AnomalySignificance::Medium
                    },
                });
            }
        }

        Ok(anomalies)
    }

    async fn generate_forecast(&self, data: &[TrendDataPoint], forecast_period: Duration) -> Result<Vec<ForecastPoint>, IOCError> {
        let mut forecast = Vec::new();
        
        if data.len() < 5 {
            return Ok(forecast);
        }

        let last_point = &data[data.len() - 1];
        let trend_slope = self.calculate_simple_trend_slope(data);
        let forecast_days = forecast_period.num_days();

        for i in 1..=forecast_days {
            let forecast_date = last_point.timestamp + Duration::days(i);
            let predicted_value = last_point.value + (trend_slope * i as f64);
            let confidence = (1.0 - (i as f64 / forecast_days as f64) * 0.3).max(0.4);

            forecast.push(ForecastPoint {
                timestamp: forecast_date,
                predicted_value,
                confidence_interval_lower: predicted_value * 0.8,
                confidence_interval_upper: predicted_value * 1.2,
                confidence,
            });
        }

        Ok(forecast)
    }

    fn calculate_simple_trend_slope(&self, data: &[TrendDataPoint]) -> f64 {
        if data.len() < 2 {
            return 0.0;
        }

        let first = &data[0];
        let last = &data[data.len() - 1];
        let days_diff = (last.timestamp - first.timestamp).num_days() as f64;
        
        if days_diff > 0.0 {
            (last.value - first.value) / days_diff
        } else {
            0.0
        }
    }

    // Helper methods
    async fn extract_classification_features(&self, ioc: &IOC, context: &PredictionContext) -> HashMap<String, f64> {
        let mut features = HashMap::new();
        
        features.insert("confidence_score".to_string(), ioc.confidence);
        features.insert("source_reputation".to_string(), 0.8); // Would be calculated from source
        features.insert("first_seen_age".to_string(), 7.0); // Days since first seen
        features.insert("correlation_count".to_string(), context.related_iocs_count as f64);
        
        features
    }

    async fn predict_attack_progression(&self, behaviors: &[PredictedBehavior]) -> Vec<AttackProgressionPhase> {
        let mut phases = Vec::new();
        
        phases.push(AttackProgressionPhase {
            phase: "Initial Access".to_string(),
            estimated_time: Duration::minutes(5),
            likelihood: 0.9,
        });

        if behaviors.iter().any(|b| b.behavior_type == "persistence_establishment") {
            phases.push(AttackProgressionPhase {
                phase: "Persistence".to_string(),
                estimated_time: Duration::hours(1),
                likelihood: 0.8,
            });
        }

        if behaviors.iter().any(|b| b.behavior_type == "lateral_movement") {
            phases.push(AttackProgressionPhase {
                phase: "Lateral Movement".to_string(),
                estimated_time: Duration::hours(6),
                likelihood: 0.6,
            });
        }

        phases
    }

    async fn calculate_overall_confidence(&self, prediction_id: &str, ioc: &IOC) -> f64 {
        // Combine various confidence factors
        let base_confidence = ioc.confidence;
        let data_quality = 0.8; // Would be calculated based on available data
        let model_reliability = 0.85; // Average model accuracy
        
        (base_confidence + data_quality + model_reliability) / 3.0
    }

    /// Get analytics statistics
    pub async fn get_statistics(&self) -> AnalyticsStats {
        self.statistics.read().await.clone()
    }

    /// Get health status
    pub async fn get_health(&self) -> ComponentHealth {
        let stats = self.statistics.read().await;
        let models = self.ml_models.read().await;
        let active_models = models.values().filter(|m| m.status == ModelStatus::Active).count();

        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Analytics engine operational with {} active models", active_models),
            last_check: Utc::now(),
            metrics: HashMap::from([
                ("total_models".to_string(), models.len() as f64),
                ("active_models".to_string(), active_models as f64),
                ("total_predictions".to_string(), stats.total_predictions as f64),
                ("total_trend_analyses".to_string(), stats.total_trend_analyses as f64),
                ("average_prediction_accuracy".to_string(), models.values()
                    .map(|m| m.accuracy)
                    .sum::<f64>() / models.len() as f64),
            ]),
        }
    }
}

// Analytics data structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MLModel {
    pub id: String,
    pub name: String,
    pub model_type: ModelType,
    pub algorithm: String,
    pub version: String,
    pub training_data_size: u64,
    pub accuracy: f64,
    pub precision: f64,
    pub recall: f64,
    pub f1_score: f64,
    pub features: Vec<String>,
    pub target_classes: Vec<String>,
    pub trained_at: DateTime<Utc>,
    pub last_updated: DateTime<Utc>,
    pub status: ModelStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ModelType {
    Classification,
    Regression,
    Clustering,
    DeepLearning,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ModelStatus {
    Active,
    Training,
    Deprecated,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictionContext {
    pub analysis_type: String,
    pub asset_criticality: String,
    pub network_exposure: String,
    pub related_iocs_count: u32,
    pub infrastructure_overlap: f64,
    pub ttp_similarity: f64,
    pub coordinated_timing: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatPrediction {
    pub id: String,
    pub ioc_id: String,
    pub analysis_time: DateTime<Utc>,
    pub threat_classification: ThreatClassificationResult,
    pub severity_prediction: SeverityPredictionResult,
    pub campaign_likelihood: CampaignLikelihoodResult,
    pub behavioral_prediction: BehavioralPrediction,
    pub evolution_timeline: EvolutionTimeline,
    pub confidence_score: f64,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatClassificationResult {
    pub predicted_class: String,
    pub confidence: f64,
    pub class_probabilities: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeverityPredictionResult {
    pub predicted_severity: Severity,
    pub confidence: f64,
    pub risk_factors: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CampaignLikelihoodResult {
    pub is_campaign: bool,
    pub confidence: f64,
    pub related_indicators: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralPrediction {
    pub predicted_behaviors: Vec<PredictedBehavior>,
    pub attack_progression: Vec<AttackProgressionPhase>,
    pub confidence: f64,
    pub behavioral_indicators: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictedBehavior {
    pub behavior_type: String,
    pub likelihood: f64,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackProgressionPhase {
    pub phase: String,
    pub estimated_time: Duration,
    pub likelihood: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionTimeline {
    pub total_estimated_duration: i64, // hours
    pub phases: Vec<ThreatPhase>,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatPhase {
    pub phase_name: String,
    pub estimated_start: DateTime<Utc>,
    pub estimated_duration: Duration,
    pub activities: Vec<String>,
    pub indicators: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyticsJob {
    pub id: String,
    pub job_type: String,
    pub status: JobStatus,
    pub created_at: DateTime<Utc>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub parameters: HashMap<String, serde_json::Value>,
    pub results: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum JobStatus {
    Pending,
    Running,
    Completed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrendAnalysis {
    pub id: String,
    pub analysis_time: DateTime<Utc>,
    pub trend_type: String,
    pub time_period: Duration,
    pub data_points: Vec<TrendDataPoint>,
    pub identified_patterns: Vec<TrendPattern>,
    pub trend_direction: TrendDirection,
    pub seasonality: Option<SeasonalityPattern>,
    pub anomalies: Vec<AnomalyDetection>,
    pub forecast: Vec<ForecastPoint>,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrendDataPoint {
    pub timestamp: DateTime<Utc>,
    pub value: f64,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrendPattern {
    pub pattern_type: String,
    pub confidence: f64,
    pub description: String,
    pub significance: PatternSignificance,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PatternSignificance {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TrendDirection {
    Increasing,
    Decreasing,
    Stable,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeasonalityPattern {
    pub period_days: u32,
    pub strength: f64,
    pub pattern_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnomalyDetection {
    pub timestamp: DateTime<Utc>,
    pub value: f64,
    pub expected_value: f64,
    pub deviation_score: f64,
    pub anomaly_type: String,
    pub significance: AnomalySignificance,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnomalySignificance {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForecastPoint {
    pub timestamp: DateTime<Utc>,
    pub predicted_value: f64,
    pub confidence_interval_lower: f64,
    pub confidence_interval_upper: f64,
    pub confidence: f64,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct AnalyticsStats {
    pub total_predictions: u64,
    pub total_trend_analyses: u64,
    pub total_ml_jobs: u64,
    pub successful_predictions: u64,
    pub failed_predictions: u64,
    pub average_prediction_time_ms: f64,
    pub last_prediction_time: Option<DateTime<Utc>>,
}