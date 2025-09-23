use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventType {
    PageView,
    Click,
    FormSubmit,
    Error,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventData {
    pub timestamp: DateTime<Utc>,
    pub properties: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventContext {
    pub user_id: Option<String>,
    pub session_id: String,
    pub user_agent: String,
    pub ip_address: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyticsEvent {
    pub event_type: EventType,
    pub data: EventData,
    pub context: EventContext,
}