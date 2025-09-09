use crate::types::*;
use async_trait::async_trait;
use dashmap::DashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};
use napi_derive::napi;

#[async_trait]
pub trait BehavioralAnalyticsTrait {
    async fn analyze_activity(&self, activity: Activity) -> BehavioralAnalysisResult;
    async fn get_profile(&self, entity_id: &str) -> Option<BehavioralProfile>;
    async fn get_status(&self) -> ComponentStatus;
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct BehavioralAnalysisResult {
    pub activity_id: String,
    pub anomalies: Vec<Anomaly>,
    pub risk_score: f64,
    pub confidence: f64,
    pub recommendations: Vec<String>,
}

#[derive(Clone)]
pub struct BehavioralAnalytics {
    profiles: Arc<DashMap<String, BehavioralProfile>>,
    processed_activities: Arc<RwLock<u64>>,
    anomalies_detected: Arc<RwLock<u32>>,
    last_error: Arc<RwLock<Option<String>>>,
}

impl BehavioralAnalytics {
    pub fn new() -> Self {
        Self {
            profiles: Arc::new(DashMap::new()),
            processed_activities: Arc::new(RwLock::new(0)),
            anomalies_detected: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        }
    }
}

#[async_trait]
impl BehavioralAnalyticsTrait for BehavioralAnalytics {
    async fn analyze_activity(&self, activity: Activity) -> BehavioralAnalysisResult {
        let mut processed_activities = self.processed_activities.write().await;
        *processed_activities += 1;

        // Simplified behavioral analysis
        let anomalies = vec![];
        let risk_score = 0.5;
        let confidence = 0.8;
        let recommendations = vec!["Monitor for unusual patterns".to_string()];

        BehavioralAnalysisResult {
            activity_id: activity.id,
            anomalies,
            risk_score,
            confidence,
            recommendations,
        }
    }

    async fn get_profile(&self, entity_id: &str) -> Option<BehavioralProfile> {
        self.profiles.get(entity_id).map(|p| p.clone())
    }

    async fn get_status(&self) -> ComponentStatus {
        let processed_activities = *self.processed_activities.read().await;
        let anomalies_detected = *self.anomalies_detected.read().await;
        let last_error = self.last_error.read().await.clone();

        ComponentStatus {
            status: "operational".to_string(),
            uptime: 0,
            processed_events: processed_activities,
            active_alerts: anomalies_detected,
            last_error,
        }
    }
}
