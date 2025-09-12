//! Database models for Diesel ORM

#[cfg(feature = "diesel-orm")]
use super::schema::*;
#[cfg(feature = "diesel-orm")]
use diesel::prelude::*;
#[cfg(feature = "diesel-orm")]
use serde::{Deserialize, Serialize};
#[cfg(feature = "diesel-orm")]
use chrono::{DateTime, Utc};
#[cfg(feature = "diesel-orm")]
use std::collections::HashMap;

/// Threat Actor model
#[cfg(feature = "diesel-orm")]
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable, Insertable, AsChangeset)]
#[diesel(table_name = threat_actors)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct ThreatActor {
    pub id: String,
    pub name: Option<String>,
    pub aliases: Vec<String>,
    pub description: Option<String>,
    pub first_seen: Option<DateTime<Utc>>,
    pub last_seen: Option<DateTime<Utc>>,
    pub actor_type: Option<String>,
    pub campaigns: Vec<String>,
    pub malware: Vec<String>,
    pub techniques: Vec<String>,
    pub confidence: Option<f64>,
    pub attribution_source: Option<String>,
    pub attributes: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[cfg(feature = "diesel-orm")]
impl ThreatActor {
    /// Create a new threat actor
    pub fn new(name: Option<String>, actor_type: Option<String>) -> Self {
        let now = Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            aliases: vec![],
            description: None,
            first_seen: Some(now),
            last_seen: Some(now),
            actor_type,
            campaigns: vec![],
            malware: vec![],
            techniques: vec![],
            confidence: Some(0.8),
            attribution_source: None,
            attributes: None,
            created_at: now,
            updated_at: now,
        }
    }
}

/// New threat actor for insertion
#[cfg(feature = "diesel-orm")]
#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = threat_actors)]
pub struct NewThreatActor<'a> {
    pub id: &'a str,
    pub name: Option<&'a str>,
    pub aliases: &'a [String],
    pub description: Option<&'a str>,
    pub first_seen: Option<DateTime<Utc>>,
    pub last_seen: Option<DateTime<Utc>>,
    pub actor_type: Option<&'a str>,
    pub campaigns: &'a [String],
    pub malware: &'a [String],
    pub techniques: &'a [String],
    pub confidence: Option<f64>,
    pub attribution_source: Option<&'a str>,
    pub attributes: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Incident model
#[cfg(feature = "diesel-orm")]
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable, Insertable, AsChangeset)]
#[diesel(table_name = incidents)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Incident {
    pub id: String,
    pub title: String,
    pub description: String,
    pub severity: String,
    pub status: String,
    pub priority: String,
    pub assigned_to: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub affected_assets: Vec<String>,
    pub threat_actors: Vec<String>,
    pub tags: Vec<String>,
    pub metadata: Option<serde_json::Value>,
}

#[cfg(feature = "diesel-orm")]
impl Incident {
    /// Create a new incident
    pub fn new(title: String, description: String, severity: String) -> Self {
        let now = Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            title,
            description,
            severity,
            status: "open".to_string(),
            priority: "medium".to_string(),
            assigned_to: None,
            created_at: now,
            updated_at: now,
            resolved_at: None,
            affected_assets: vec![],
            threat_actors: vec![],
            tags: vec![],
            metadata: None,
        }
    }
}

/// New incident for insertion
#[cfg(feature = "diesel-orm")]
#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = incidents)]
pub struct NewIncident<'a> {
    pub id: &'a str,
    pub title: &'a str,
    pub description: &'a str,
    pub severity: &'a str,
    pub status: &'a str,
    pub priority: &'a str,
    pub assigned_to: Option<&'a str>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub affected_assets: &'a [String],
    pub threat_actors: &'a [String],
    pub tags: &'a [String],
    pub metadata: Option<serde_json::Value>,
}

/// Alert model
#[cfg(feature = "diesel-orm")]
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable, Insertable, AsChangeset)]
#[diesel(table_name = alerts)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Alert {
    pub id: String,
    pub rule_id: String,
    pub title: String,
    pub description: String,
    pub severity: String,
    pub status: String,
    pub triggered_at: DateTime<Utc>,
    pub last_updated: DateTime<Utc>,
    pub acknowledged: bool,
    pub event_details: serde_json::Value,
    pub assigned_to: Option<String>,
    pub tags: Vec<String>,
    pub escalation_level: i32,
    pub response_actions: Vec<serde_json::Value>,
    pub metadata: Option<serde_json::Value>,
}

#[cfg(feature = "diesel-orm")]
impl Alert {
    /// Create a new alert
    pub fn new(rule_id: String, title: String, description: String, severity: String) -> Self {
        let now = Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            rule_id,
            title,
            description,
            severity,
            status: "new".to_string(),
            triggered_at: now,
            last_updated: now,
            acknowledged: false,
            event_details: serde_json::json!({}),
            assigned_to: None,
            tags: vec![],
            escalation_level: 0,
            response_actions: vec![],
            metadata: None,
        }
    }
}

/// New alert for insertion
#[cfg(feature = "diesel-orm")]
#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = alerts)]
pub struct NewAlert<'a> {
    pub id: &'a str,
    pub rule_id: &'a str,
    pub title: &'a str,
    pub description: &'a str,
    pub severity: &'a str,
    pub status: &'a str,
    pub triggered_at: DateTime<Utc>,
    pub last_updated: DateTime<Utc>,
    pub acknowledged: bool,
    pub event_details: serde_json::Value,
    pub assigned_to: Option<&'a str>,
    pub tags: &'a [String],
    pub escalation_level: i32,
    pub response_actions: &'a [serde_json::Value],
    pub metadata: Option<serde_json::Value>,
}
