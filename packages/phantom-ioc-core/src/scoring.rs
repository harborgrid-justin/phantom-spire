// phantom-ioc-core/src/scoring.rs
// IOC scoring and prioritization engine

use crate::types::*;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::Utc;

pub struct ScoringEngine {
    scoring_rules: Arc<RwLock<Vec<ScoringRule>>>,
    weights: Arc<RwLock<HashMap<String, f64>>>,
}

impl ScoringEngine {
    pub async fn new() -> Result<Self, IOCError> {
        let scoring_rules = Arc::new(RwLock::new(Vec::new()));
        let weights = Arc::new(RwLock::new(HashMap::new()));

        let engine = Self {
            scoring_rules,
            weights,
        };

        engine.initialize_rules().await?;
        Ok(engine)
    }

    async fn initialize_rules(&self) -> Result<(), IOCError> {
        let mut rules = self.scoring_rules.write().await;
        rules.push(ScoringRule {
            id: "malware_hash".to_string(),
            name: "Malware Hash Detection".to_string(),
            condition: "indicator_type == 'hash'".to_string(),
            score: 95.0,
            enabled: true,
        });

        let mut weights = self.weights.write().await;
        weights.insert("confidence".to_string(), 0.4);
        weights.insert("severity".to_string(), 0.3);
        weights.insert("frequency".to_string(), 0.2);
        weights.insert("age".to_string(), 0.1);
        Ok(())
    }

    pub async fn score_ioc(&self, ioc: &IOC) -> Result<IOCScore, IOCError> {
        let mut total_score = 0.0;
        let mut factors = HashMap::new();

        // Base scoring based on indicator type
        let base_score = match ioc.indicator_type {
            IndicatorType::Hash => 80.0,
            IndicatorType::Domain => 60.0,
            IndicatorType::IP => 70.0,
            IndicatorType::URL => 75.0,
            IndicatorType::Email => 50.0,
            IndicatorType::FilePath => 65.0,
        };
        factors.insert("base_type_score".to_string(), base_score);
        total_score += base_score;

        // Confidence factor
        let confidence_score = ioc.confidence * 20.0;
        factors.insert("confidence_score".to_string(), confidence_score);
        total_score += confidence_score;

        // Severity factor
        let severity_score = match ioc.severity {
            Severity::Critical => 30.0,
            Severity::High => 20.0,
            Severity::Medium => 10.0,
            Severity::Low => 5.0,
            Severity::Info => 0.0,
        };
        factors.insert("severity_score".to_string(), severity_score);
        total_score += severity_score;

        // Normalize to 0-100
        total_score = total_score.min(100.0).max(0.0);

        Ok(IOCScore {
            total_score,
            factors,
            priority: self.calculate_priority(total_score),
            timestamp: Utc::now(),
        })
    }

    fn calculate_priority(&self, score: f64) -> Priority {
        match score {
            s if s >= 90.0 => Priority::Critical,
            s if s >= 70.0 => Priority::High,
            s if s >= 50.0 => Priority::Medium,
            s if s >= 30.0 => Priority::Low,
            _ => Priority::Info,
        }
    }

    pub async fn get_health(&self) -> ComponentHealth {
        ComponentHealth {
            status: HealthStatus::Healthy,
            message: "Scoring engine operational".to_string(),
            last_check: Utc::now(),
            metrics: HashMap::new(),
        }
    }
}
