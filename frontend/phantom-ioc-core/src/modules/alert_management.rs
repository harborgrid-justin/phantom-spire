// Alert Management Module
// Handles security alerts, notifications, and alert lifecycle management

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AlertSeverity {
    Info,
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AlertStatus {
    Open,
    InProgress,
    Resolved,
    Closed,
    Dismissed,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AlertType {
    SecurityIncident,
    ThreatDetection,
    PolicyViolation,
    SystemAnomaly,
    ComplianceAlert,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Alert {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub alert_type: AlertType,
    pub severity: AlertSeverity,
    pub status: AlertStatus,
    pub source: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub assigned_to: Option<String>,
    pub tags: Vec<String>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertRule {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub conditions: Vec<String>,
    pub severity: AlertSeverity,
    pub enabled: bool,
    pub actions: Vec<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertMetrics {
    pub total_alerts: u32,
    pub open_alerts: u32,
    pub resolved_alerts: u32,
    pub critical_alerts: u32,
    pub high_alerts: u32,
    pub medium_alerts: u32,
    pub low_alerts: u32,
    pub avg_resolution_time_hours: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationPreference {
    pub user_id: String,
    pub email_enabled: bool,
    pub sms_enabled: bool,
    pub webhook_enabled: bool,
    pub severity_threshold: AlertSeverity,
    pub alert_types: Vec<AlertType>,
}

#[napi]
pub struct AlertManager {
    alerts: Vec<Alert>,
    rules: Vec<AlertRule>,
    preferences: Vec<NotificationPreference>,
}

#[napi]
impl AlertManager {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        Ok(Self {
            alerts: Vec::new(),
            rules: Vec::new(),
            preferences: Vec::new(),
        })
    }

    #[napi]
    pub fn create_alert(&mut self, alert_json: String) -> Result<String> {
        let mut alert: Alert = serde_json::from_str(&alert_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse alert: {}", e)))?;
        
        alert.id = Uuid::new_v4();
        alert.created_at = Utc::now();
        alert.updated_at = Utc::now();
        
        let alert_id = alert.id.to_string();
        self.alerts.push(alert);
        
        Ok(alert_id)
    }

    #[napi]
    pub fn get_alert(&self, alert_id: String) -> Result<String> {
        let id = Uuid::parse_str(&alert_id)
            .map_err(|e| napi::Error::from_reason(format!("Invalid alert ID: {}", e)))?;
        
        let alert = self.alerts.iter()
            .find(|a| a.id == id)
            .ok_or_else(|| napi::Error::from_reason("Alert not found"))?;
        
        serde_json::to_string(alert)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize alert: {}", e)))
    }

    #[napi]
    pub fn update_alert_status(&mut self, alert_id: String, status: String) -> Result<()> {
        let id = Uuid::parse_str(&alert_id)
            .map_err(|e| napi::Error::from_reason(format!("Invalid alert ID: {}", e)))?;
        
        let status: AlertStatus = serde_json::from_str(&format!("\"{}\"", status))
            .map_err(|e| napi::Error::from_reason(format!("Invalid status: {}", e)))?;
        
        let alert = self.alerts.iter_mut()
            .find(|a| a.id == id)
            .ok_or_else(|| napi::Error::from_reason("Alert not found"))?;
        
        alert.status = status;
        alert.updated_at = Utc::now();
        
        if matches!(alert.status, AlertStatus::Resolved | AlertStatus::Closed) {
            alert.resolved_at = Some(Utc::now());
        }
        
        Ok(())
    }

    #[napi]
    pub fn list_alerts(&self, status_filter: Option<String>) -> Result<String> {
        let filtered_alerts: Vec<&Alert> = if let Some(status) = status_filter {
            let filter_status: AlertStatus = serde_json::from_str(&format!("\"{}\"", status))
                .map_err(|e| napi::Error::from_reason(format!("Invalid status filter: {}", e)))?;
            
            self.alerts.iter()
                .filter(|a| a.status == filter_status)
                .collect()
        } else {
            self.alerts.iter().collect()
        };
        
        serde_json::to_string(&filtered_alerts)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize alerts: {}", e)))
    }

    #[napi]
    pub fn create_alert_rule(&mut self, rule_json: String) -> Result<String> {
        let mut rule: AlertRule = serde_json::from_str(&rule_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse alert rule: {}", e)))?;
        
        rule.id = Uuid::new_v4();
        rule.created_at = Utc::now();
        
        let rule_id = rule.id.to_string();
        self.rules.push(rule);
        
        Ok(rule_id)
    }

    #[napi]
    pub fn get_alert_metrics(&self) -> Result<String> {
        let total_alerts = self.alerts.len() as u32;
        let open_alerts = self.alerts.iter().filter(|a| matches!(a.status, AlertStatus::Open | AlertStatus::InProgress)).count() as u32;
        let resolved_alerts = self.alerts.iter().filter(|a| matches!(a.status, AlertStatus::Resolved | AlertStatus::Closed)).count() as u32;
        let critical_alerts = self.alerts.iter().filter(|a| matches!(a.severity, AlertSeverity::Critical)).count() as u32;
        let high_alerts = self.alerts.iter().filter(|a| matches!(a.severity, AlertSeverity::High)).count() as u32;
        let medium_alerts = self.alerts.iter().filter(|a| matches!(a.severity, AlertSeverity::Medium)).count() as u32;
        let low_alerts = self.alerts.iter().filter(|a| matches!(a.severity, AlertSeverity::Low)).count() as u32;
        
        // Calculate average resolution time
        let resolved_with_time: Vec<_> = self.alerts.iter()
            .filter(|a| a.resolved_at.is_some())
            .collect();
        
        let avg_resolution_time_hours = if !resolved_with_time.is_empty() {
            let total_resolution_time: i64 = resolved_with_time.iter()
                .map(|a| (a.resolved_at.unwrap() - a.created_at).num_hours())
                .sum();
            total_resolution_time as f64 / resolved_with_time.len() as f64
        } else {
            0.0
        };
        
        let metrics = AlertMetrics {
            total_alerts,
            open_alerts,
            resolved_alerts,
            critical_alerts,
            high_alerts,
            medium_alerts,
            low_alerts,
            avg_resolution_time_hours,
        };
        
        serde_json::to_string(&metrics)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize metrics: {}", e)))
    }

    #[napi]
    pub fn set_notification_preferences(&mut self, preferences_json: String) -> Result<()> {
        let preference: NotificationPreference = serde_json::from_str(&preferences_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse preferences: {}", e)))?;
        
        // Remove existing preference for the user
        self.preferences.retain(|p| p.user_id != preference.user_id);
        
        // Add new preference
        self.preferences.push(preference);
        
        Ok(())
    }

    #[napi]
    pub fn health_check(&self) -> Result<String> {
        let health_info = serde_json::json!({
            "status": "healthy",
            "alerts_count": self.alerts.len(),
            "rules_count": self.rules.len(),
            "preferences_count": self.preferences.len(),
            "timestamp": Utc::now().to_rfc3339()
        });
        
        Ok(health_info.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_alert_manager_creation() {
        let manager = AlertManager::new();
        assert!(manager.is_ok());
    }

    #[test]
    fn test_create_and_get_alert() {
        let mut manager = AlertManager::new().unwrap();
        
        let alert = Alert {
            id: Uuid::new_v4(), // Will be overwritten
            title: "Test Alert".to_string(),
            description: "Test Description".to_string(),
            alert_type: AlertType::SecurityIncident,
            severity: AlertSeverity::High,
            status: AlertStatus::Open,
            source: "test_source".to_string(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            resolved_at: None,
            assigned_to: None,
            tags: vec!["test".to_string()],
            metadata: HashMap::new(),
        };
        
        let alert_json = serde_json::to_string(&alert).unwrap();
        let alert_id = manager.create_alert(alert_json).unwrap();
        
        let retrieved_alert_json = manager.get_alert(alert_id).unwrap();
        let retrieved_alert: Alert = serde_json::from_str(&retrieved_alert_json).unwrap();
        
        assert_eq!(retrieved_alert.title, "Test Alert");
        assert_eq!(retrieved_alert.severity, AlertSeverity::High);
    }
}