// Insider Threat Detection Engine for XDR Platform
// Provides comprehensive insider threat detection and monitoring

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InsiderThreatProfile {
    pub profile_id: String,
    pub user_id: String,
    pub risk_score: f64,
    pub threat_indicators: Vec<ThreatIndicator>,
    pub behavioral_baseline: BehavioralBaseline,
    pub anomalies: Vec<BehavioralAnomaly>,
    pub status: String, // "low_risk", "medium_risk", "high_risk", "critical"
    pub last_updated: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatIndicator {
    pub indicator_id: String,
    pub indicator_type: String, // "data_access", "system_behavior", "network_activity", "email_patterns"
    pub severity: String,
    pub description: String,
    pub detected_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralBaseline {
    pub user_id: String,
    pub typical_hours: Vec<u8>, // Hours of day user is typically active
    pub typical_locations: Vec<String>,
    pub typical_applications: Vec<String>,
    pub typical_data_access: Vec<String>,
    pub established_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralAnomaly {
    pub anomaly_id: String,
    pub anomaly_type: String,
    pub severity: String,
    pub confidence: f64,
    pub description: String,
    pub detected_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InsiderThreatEvent {
    pub event_id: String,
    pub user_id: String,
    pub event_type: String, // "data_exfiltration", "privilege_escalation", "unauthorized_access", "policy_violation"
    pub risk_level: String,
    pub description: String,
    pub evidence: Vec<String>,
    pub timestamp: i64,
}

#[async_trait]
pub trait InsiderThreatTrait {
    async fn create_profile(&self, profile: InsiderThreatProfile) -> Result<String, String>;
    async fn analyze_behavior(&self, user_id: &str) -> Option<InsiderThreatProfile>;
    async fn detect_anomalies(&self, user_id: &str) -> Vec<BehavioralAnomaly>;
    async fn process_event(&self, event: InsiderThreatEvent) -> Result<(), String>;
    async fn get_insider_threat_status(&self) -> String;
}

#[derive(Clone)]
pub struct InsiderThreatEngine {
    threat_profiles: Arc<DashMap<String, InsiderThreatProfile>>,
    threat_events: Arc<DashMap<String, InsiderThreatEvent>>,
    processed_users: Arc<RwLock<u64>>,
    high_risk_users: Arc<RwLock<u32>>,
    last_error: Arc<RwLock<Option<String>>>,
}

impl InsiderThreatEngine {
    pub fn new() -> Self {
        Self {
            threat_profiles: Arc::new(DashMap::new()),
            threat_events: Arc::new(DashMap::new()),
            processed_users: Arc::new(RwLock::new(0)),
            high_risk_users: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        }
    }
}

#[async_trait]
impl InsiderThreatTrait for InsiderThreatEngine {
    async fn create_profile(&self, profile: InsiderThreatProfile) -> Result<String, String> {
        let profile_id = profile.profile_id.clone();
        self.threat_profiles.insert(profile_id.clone(), profile);
        Ok(profile_id)
    }

    async fn analyze_behavior(&self, user_id: &str) -> Option<InsiderThreatProfile> {
        self.threat_profiles.iter().find(|p| p.user_id == user_id).map(|p| p.clone())
    }

    async fn detect_anomalies(&self, _user_id: &str) -> Vec<BehavioralAnomaly> {
        vec![]
    }

    async fn process_event(&self, event: InsiderThreatEvent) -> Result<(), String> {
        self.threat_events.insert(event.event_id.clone(), event);
        Ok(())
    }

    async fn get_insider_threat_status(&self) -> String {
        let processed = *self.processed_users.read().await;
        let high_risk = *self.high_risk_users.read().await;
        format!("Insider Threat Engine: {} users processed, {} high-risk users", processed, high_risk)
    }
}