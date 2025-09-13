use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeRange {
    pub start: DateTime<Utc>,
    pub end: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PropertyFilter {
    Equals(String, String),
    Contains(String, String),
    Greater(String, String),
    Less(String, String),
    Between(String, String, String),
    Exists(String),
    NotExists(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FilterCondition {
    And(Vec<FilterCondition>),
    Or(Vec<FilterCondition>),
    Not(Box<FilterCondition>),
    Property(PropertyFilter),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventFilter {
    pub time_range: Option<TimeRange>,
    pub event_types: Option<Vec<String>>,
    pub user_ids: Option<Vec<String>>,
    pub session_ids: Option<Vec<String>>,
    pub conditions: Option<FilterCondition>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}