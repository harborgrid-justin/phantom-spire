// phantom-ioc-core/src/reputation.rs
// IOC reputation scoring and management

use crate::types::*;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::Utc;

pub struct ReputationEngine {
    reputation_db: Arc<RwLock<HashMap<String, ReputationScore>>>,
    reputation_sources: Arc<RwLock<Vec<ReputationSource>>>,
}

impl ReputationEngine {
    pub async fn new() -> Result<Self, IOCError> {
        let reputation_db = Arc::new(RwLock::new(HashMap::new()));
        let reputation_sources = Arc::new(RwLock::new(Vec::new()));

        let engine = Self {
            reputation_db,
            reputation_sources,
        };

        engine.initialize_sources().await?;
        Ok(engine)
    }

    async fn initialize_sources(&self) -> Result<(), IOCError> {
        let mut sources = self.reputation_sources.write().await;
        sources.push(ReputationSource {
            id: "virustotal".to_string(),
            name: "VirusTotal".to_string(),
            url: "https://www.virustotal.com/api/v3".to_string(),
            api_key: None,
            enabled: true,
            weight: 0.4,
        });

        sources.push(ReputationSource {
            id: "abuseipdb".to_string(),
            name: "AbuseIPDB".to_string(),
            url: "https://api.abuseipdb.com/api/v2".to_string(),
            api_key: None,
            enabled: true,
            weight: 0.3,
        });
        Ok(())
    }

    pub async fn get_reputation(&self, indicator: &str, indicator_type: &IndicatorType) -> Result<ReputationScore, IOCError> {
        let db = self.reputation_db.read().await;
        if let Some(score) = db.get(indicator) {
            return Ok(score.clone());
        }

        // Calculate reputation for new indicator
        let score = self.calculate_reputation(indicator, indicator_type).await?;
        drop(db);

        let mut db = self.reputation_db.write().await;
        db.insert(indicator.to_string(), score.clone());
        Ok(score)
    }

    async fn calculate_reputation(&self, indicator: &str, indicator_type: &IndicatorType) -> Result<ReputationScore, IOCError> {
        let sources = self.reputation_sources.read().await;
        let mut total_score = 0.0;
        let mut total_weight = 0.0;
        let mut source_scores = HashMap::new();

        for source in sources.iter().filter(|s| s.enabled) {
            let source_score = self.query_source_reputation(source, indicator, indicator_type).await?;
            source_scores.insert(source.name.clone(), source_score);
            total_score += source_score * source.weight;
            total_weight += source.weight;
        }

        let final_score = if total_weight > 0.0 {
            total_score / total_weight
        } else {
            0.5 // Neutral score if no sources
        };

        Ok(ReputationScore {
            indicator: indicator.to_string(),
            score: final_score,
            confidence: 0.8,
            sources: source_scores,
            last_updated: Utc::now(),
            category: self.categorize_reputation(final_score),
        })
    }

    async fn query_source_reputation(&self, source: &ReputationSource, indicator: &str, indicator_type: &IndicatorType) -> Result<f64, IOCError> {
        // Mock reputation scoring based on indicator characteristics
        match source.id.as_str() {
            "virustotal" => {
                // Simulate VT scoring
                if indicator.contains("malicious") || indicator.contains("evil") {
                    Ok(0.9)
                } else if indicator.contains("suspicious") {
                    Ok(0.7)
                } else {
                    Ok(0.1)
                }
            }
            "abuseipdb" => {
                // Simulate AbuseIPDB scoring
                if matches!(indicator_type, IndicatorType::IP) {
                    if indicator.starts_with("192.168.") || indicator.starts_with("10.") {
                        Ok(0.2)
                    } else {
                        Ok(0.8)
                    }
                } else {
                    Ok(0.3)
                }
            }
            _ => Ok(0.5),
        }
    }

    fn categorize_reputation(&self, score: f64) -> ReputationCategory {
        match score {
            s if s >= 0.8 => ReputationCategory::Malicious,
            s if s >= 0.6 => ReputationCategory::Suspicious,
            s if s >= 0.4 => ReputationCategory::Neutral,
            s if s >= 0.2 => ReputationCategory::Good,
            _ => ReputationCategory::Trusted,
        }
    }

    pub async fn update_reputation(&self, indicator: &str, new_score: f64) -> Result<(), IOCError> {
        let mut db = self.reputation_db.write().await;
        if let Some(existing) = db.get_mut(indicator) {
            existing.score = new_score;
            existing.last_updated = Utc::now();
            existing.category = self.categorize_reputation(new_score);
        } else {
            let score = ReputationScore {
                indicator: indicator.to_string(),
                score: new_score,
                confidence: 0.8,
                sources: HashMap::new(),
                last_updated: Utc::now(),
                category: self.categorize_reputation(new_score),
            };
            db.insert(indicator.to_string(), score);
        }
        Ok(())
    }

    pub async fn get_reputation_stats(&self) -> ReputationStats {
        let db = self.reputation_db.read().await;
        let mut malicious = 0;
        let mut suspicious = 0;
        let mut neutral = 0;
        let mut good = 0;
        let mut trusted = 0;

        for score in db.values() {
            match score.category {
                ReputationCategory::Malicious => malicious += 1,
                ReputationCategory::Suspicious => suspicious += 1,
                ReputationCategory::Neutral => neutral += 1,
                ReputationCategory::Good => good += 1,
                ReputationCategory::Trusted => trusted += 1,
            }
        }

        ReputationStats {
            total_indicators: db.len(),
            malicious_count: malicious,
            suspicious_count: suspicious,
            neutral_count: neutral,
            good_count: good,
            trusted_count: trusted,
            last_updated: Utc::now(),
        }
    }

    pub async fn get_health(&self) -> ComponentHealth {
        let stats = self.get_reputation_stats().await;
        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Reputation engine operational - {} indicators tracked", stats.total_indicators),
            last_check: Utc::now(),
            metrics: {
                let mut metrics = HashMap::new();
                metrics.insert("total_indicators".to_string(), stats.total_indicators as f64);
                metrics.insert("malicious_ratio".to_string(), stats.malicious_count as f64 / stats.total_indicators as f64);
                metrics
            },
        }
    }
}
