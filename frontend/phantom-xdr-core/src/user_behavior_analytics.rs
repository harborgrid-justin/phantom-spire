// User Behavior Analytics Engine
use async_trait::async_trait;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserBehaviorProfile {
    pub user_id: String,
    pub baseline_established: bool,
    pub typical_login_times: Vec<u8>,
    pub typical_applications: Vec<String>,
    pub risk_score: f64,
    pub anomaly_count: u32,
    pub last_updated: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehaviorAnomaly {
    pub anomaly_id: String,
    pub user_id: String,
    pub anomaly_type: String,
    pub severity: String,
    pub confidence: f64,
    pub description: String,
    pub detected_at: i64,
}

#[async_trait]
pub trait UserBehaviorAnalyticsTrait {
    async fn create_profile(&self, profile: UserBehaviorProfile) -> Result<String, String>;
    async fn analyze_behavior(&self, user_id: &str) -> Vec<BehaviorAnomaly>;
    async fn update_baseline(&self, user_id: &str) -> Result<(), String>;
    async fn get_uba_status(&self) -> String;
}

#[derive(Clone)]
pub struct UserBehaviorAnalyticsEngine {
    user_profiles: Arc<DashMap<String, UserBehaviorProfile>>,
    anomalies: Arc<DashMap<String, BehaviorAnomaly>>,
    analyzed_users: Arc<RwLock<u64>>,
    detected_anomalies: Arc<RwLock<u64>>,
    last_error: Arc<RwLock<Option<String>>>,
}

impl UserBehaviorAnalyticsEngine {
    pub fn new() -> Self {
        Self {
            user_profiles: Arc::new(DashMap::new()),
            anomalies: Arc::new(DashMap::new()),
            analyzed_users: Arc::new(RwLock::new(0)),
            detected_anomalies: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        }
    }
}

#[async_trait]
impl UserBehaviorAnalyticsTrait for UserBehaviorAnalyticsEngine {
    async fn create_profile(&self, profile: UserBehaviorProfile) -> Result<String, String> {
        let user_id = profile.user_id.clone();
        self.user_profiles.insert(user_id.clone(), profile);
        Ok(user_id)
    }

    async fn analyze_behavior(&self, user_id: &str) -> Vec<BehaviorAnomaly> {
        let mut analyzed = self.analyzed_users.write().await;
        *analyzed += 1;
        
        // Simulate anomaly detection
        let anomaly = BehaviorAnomaly {
            anomaly_id: format!("anomaly_{}_{}", user_id, chrono::Utc::now().timestamp()),
            user_id: user_id.to_string(),
            anomaly_type: "unusual_login_time".to_string(),
            severity: "medium".to_string(),
            confidence: 0.75,
            description: "User logged in outside typical hours".to_string(),
            detected_at: chrono::Utc::now().timestamp(),
        };
        
        self.anomalies.insert(anomaly.anomaly_id.clone(), anomaly.clone());
        
        let mut detected = self.detected_anomalies.write().await;
        *detected += 1;
        
        vec![anomaly]
    }

    async fn update_baseline(&self, user_id: &str) -> Result<(), String> {
        if let Some(mut profile) = self.user_profiles.get_mut(user_id) {
            profile.baseline_established = true;
            profile.last_updated = chrono::Utc::now().timestamp();
            Ok(())
        } else {
            Err("User profile not found".to_string())
        }
    }

    async fn get_uba_status(&self) -> String {
        let analyzed = *self.analyzed_users.read().await;
        let anomalies = *self.detected_anomalies.read().await;
        format!("User Behavior Analytics Engine: {} users analyzed, {} anomalies detected", analyzed, anomalies)
    }
}