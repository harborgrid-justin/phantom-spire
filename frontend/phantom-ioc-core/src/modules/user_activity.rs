// User Activity Module - Monitor and analyze user behaviors
use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserActivity {
    pub id: Uuid,
    pub user_id: String,
    pub activity_type: String,
    pub description: String,
    pub risk_score: f64,
    pub timestamp: DateTime<Utc>,
}

#[napi]
pub struct UserActivityMonitor {
    activities: Vec<UserActivity>,
}

#[napi]
impl UserActivityMonitor {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        Ok(Self { activities: Vec::new() })
    }

    #[napi]
    pub fn record_activity(&mut self, activity_json: String) -> Result<String> {
        let mut activity: UserActivity = serde_json::from_str(&activity_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse activity: {}", e)))?;
        
        activity.id = Uuid::new_v4();
        activity.timestamp = Utc::now();
        
        let activity_id = activity.id.to_string();
        self.activities.push(activity);
        
        Ok(activity_id)
    }

    #[napi]
    pub fn get_user_activities(&self, user_id: String) -> Result<String> {
        let user_activities: Vec<&UserActivity> = self.activities.iter()
            .filter(|a| a.user_id == user_id)
            .collect();
        
        serde_json::to_string(&user_activities)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize activities: {}", e)))
    }

    #[napi]
    pub fn health_check(&self) -> Result<String> {
        Ok(serde_json::json!({
            "status": "healthy",
            "activities_count": self.activities.len(),
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }
}