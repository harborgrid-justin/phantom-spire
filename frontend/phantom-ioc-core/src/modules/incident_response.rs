// Incident Response Module
// Manages security incident workflows, response procedures, and coordination

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IncidentSeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IncidentStatus {
    New,
    Acknowledged,
    InProgress,
    Contained,
    Eradicated,
    Recovery,
    Closed,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IncidentType {
    DataBreach,
    Malware,
    PhishingAttack,
    DenialOfService,
    UnauthorizedAccess,
    InsiderThreat,
    SystemCompromise,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Incident {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub incident_type: IncidentType,
    pub severity: IncidentSeverity,
    pub status: IncidentStatus,
    pub reporter: String,
    pub assigned_team: Option<String>,
    pub lead_investigator: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub detected_at: DateTime<Utc>,
    pub contained_at: Option<DateTime<Utc>>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub affected_systems: Vec<String>,
    pub evidence: Vec<Evidence>,
    pub timeline: Vec<TimelineEntry>,
    pub response_actions: Vec<ResponseAction>,
    pub lessons_learned: Vec<String>,
    pub total_cost: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evidence {
    pub id: Uuid,
    pub evidence_type: String,
    pub description: String,
    pub file_path: Option<String>,
    pub hash: Option<String>,
    pub collected_by: String,
    pub collected_at: DateTime<Utc>,
    pub chain_of_custody: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEntry {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub event_type: String,
    pub description: String,
    pub source: String,
    pub actor: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseAction {
    pub id: Uuid,
    pub action_type: String,
    pub description: String,
    pub assigned_to: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub due_date: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub outcome: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybookTemplate {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub incident_types: Vec<IncidentType>,
    pub severity_levels: Vec<IncidentSeverity>,
    pub steps: Vec<PlaybookStep>,
    pub estimated_duration_hours: f64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybookStep {
    pub id: Uuid,
    pub step_number: u32,
    pub title: String,
    pub description: String,
    pub required: bool,
    pub estimated_minutes: u32,
    pub responsible_role: String,
    pub automation_available: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncidentMetrics {
    pub total_incidents: u32,
    pub open_incidents: u32,
    pub critical_incidents: u32,
    pub avg_detection_time_hours: f64,
    pub avg_containment_time_hours: f64,
    pub avg_resolution_time_hours: f64,
    pub incidents_by_type: HashMap<String, u32>,
    pub incidents_by_severity: HashMap<String, u32>,
    pub mttr_hours: f64, // Mean Time To Resolution
    pub mttd_hours: f64, // Mean Time To Detection
    pub mttc_hours: f64, // Mean Time To Containment
}

#[napi]
pub struct IncidentResponseManager {
    incidents: Vec<Incident>,
    playbooks: Vec<PlaybookTemplate>,
}

#[napi]
impl IncidentResponseManager {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        Ok(Self {
            incidents: Vec::new(),
            playbooks: Vec::new(),
        })
    }

    #[napi]
    pub fn create_incident(&mut self, incident_json: String) -> Result<String> {
        let mut incident: Incident = serde_json::from_str(&incident_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse incident: {}", e)))?;
        
        incident.id = Uuid::new_v4();
        incident.created_at = Utc::now();
        incident.updated_at = Utc::now();
        
        let incident_id = incident.id.to_string();
        self.incidents.push(incident);
        
        Ok(incident_id)
    }

    #[napi]
    pub fn get_incident(&self, incident_id: String) -> Result<String> {
        let id = Uuid::parse_str(&incident_id)
            .map_err(|e| napi::Error::from_reason(format!("Invalid incident ID: {}", e)))?;
        
        let incident = self.incidents.iter()
            .find(|i| i.id == id)
            .ok_or_else(|| napi::Error::from_reason("Incident not found"))?;
        
        serde_json::to_string(incident)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize incident: {}", e)))
    }

    #[napi]
    pub fn update_incident_status(&mut self, incident_id: String, status: String) -> Result<()> {
        let id = Uuid::parse_str(&incident_id)
            .map_err(|e| napi::Error::from_reason(format!("Invalid incident ID: {}", e)))?;
        
        let status: IncidentStatus = serde_json::from_str(&format!("\"{}\"", status))
            .map_err(|e| napi::Error::from_reason(format!("Invalid status: {}", e)))?;
        
        let incident = self.incidents.iter_mut()
            .find(|i| i.id == id)
            .ok_or_else(|| napi::Error::from_reason("Incident not found"))?;
        
        incident.status = status.clone();
        incident.updated_at = Utc::now();
        
        match status {
            IncidentStatus::Contained => {
                incident.contained_at = Some(Utc::now());
            }
            IncidentStatus::Closed => {
                incident.resolved_at = Some(Utc::now());
            }
            _ => {}
        }
        
        Ok(())
    }

    #[napi]
    pub fn add_evidence(&mut self, incident_id: String, evidence_json: String) -> Result<String> {
        let id = Uuid::parse_str(&incident_id)
            .map_err(|e| napi::Error::from_reason(format!("Invalid incident ID: {}", e)))?;
        
        let mut evidence: Evidence = serde_json::from_str(&evidence_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse evidence: {}", e)))?;
        
        evidence.id = Uuid::new_v4();
        evidence.collected_at = Utc::now();
        
        let incident = self.incidents.iter_mut()
            .find(|i| i.id == id)
            .ok_or_else(|| napi::Error::from_reason("Incident not found"))?;
        
        let evidence_id = evidence.id.to_string();
        incident.evidence.push(evidence);
        incident.updated_at = Utc::now();
        
        Ok(evidence_id)
    }

    #[napi]
    pub fn add_timeline_entry(&mut self, incident_id: String, entry_json: String) -> Result<String> {
        let id = Uuid::parse_str(&incident_id)
            .map_err(|e| napi::Error::from_reason(format!("Invalid incident ID: {}", e)))?;
        
        let mut entry: TimelineEntry = serde_json::from_str(&entry_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse timeline entry: {}", e)))?;
        
        entry.id = Uuid::new_v4();
        
        let incident = self.incidents.iter_mut()
            .find(|i| i.id == id)
            .ok_or_else(|| napi::Error::from_reason("Incident not found"))?;
        
        let entry_id = entry.id.to_string();
        incident.timeline.push(entry);
        incident.updated_at = Utc::now();
        
        // Sort timeline by timestamp
        incident.timeline.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));
        
        Ok(entry_id)
    }

    #[napi]
    pub fn create_response_action(&mut self, incident_id: String, action_json: String) -> Result<String> {
        let id = Uuid::parse_str(&incident_id)
            .map_err(|e| napi::Error::from_reason(format!("Invalid incident ID: {}", e)))?;
        
        let mut action: ResponseAction = serde_json::from_str(&action_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse response action: {}", e)))?;
        
        action.id = Uuid::new_v4();
        action.created_at = Utc::now();
        
        let incident = self.incidents.iter_mut()
            .find(|i| i.id == id)
            .ok_or_else(|| napi::Error::from_reason("Incident not found"))?;
        
        let action_id = action.id.to_string();
        incident.response_actions.push(action);
        incident.updated_at = Utc::now();
        
        Ok(action_id)
    }

    #[napi]
    pub fn create_playbook(&mut self, playbook_json: String) -> Result<String> {
        let mut playbook: PlaybookTemplate = serde_json::from_str(&playbook_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse playbook: {}", e)))?;
        
        playbook.id = Uuid::new_v4();
        playbook.created_at = Utc::now();
        playbook.updated_at = Utc::now();
        
        let playbook_id = playbook.id.to_string();
        self.playbooks.push(playbook);
        
        Ok(playbook_id)
    }

    #[napi]
    pub fn get_recommended_playbooks(&self, incident_type: String, severity: String) -> Result<String> {
        let incident_type: IncidentType = serde_json::from_str(&format!("\"{}\"", incident_type))
            .map_err(|e| napi::Error::from_reason(format!("Invalid incident type: {}", e)))?;
        
        let severity: IncidentSeverity = serde_json::from_str(&format!("\"{}\"", severity))
            .map_err(|e| napi::Error::from_reason(format!("Invalid severity: {}", e)))?;
        
        let recommended_playbooks: Vec<&PlaybookTemplate> = self.playbooks.iter()
            .filter(|p| p.incident_types.contains(&incident_type) && p.severity_levels.contains(&severity))
            .collect();
        
        serde_json::to_string(&recommended_playbooks)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize playbooks: {}", e)))
    }

    #[napi]
    pub fn get_incident_metrics(&self) -> Result<String> {
        let total_incidents = self.incidents.len() as u32;
        let open_incidents = self.incidents.iter()
            .filter(|i| !matches!(i.status, IncidentStatus::Closed))
            .count() as u32;
        let critical_incidents = self.incidents.iter()
            .filter(|i| matches!(i.severity, IncidentSeverity::Critical))
            .count() as u32;
        
        // Calculate average times
        let resolved_incidents: Vec<_> = self.incidents.iter()
            .filter(|i| i.resolved_at.is_some())
            .collect();
        
        let avg_resolution_time_hours = if !resolved_incidents.is_empty() {
            let total_resolution_time: i64 = resolved_incidents.iter()
                .map(|i| (i.resolved_at.unwrap() - i.detected_at).num_hours())
                .sum();
            total_resolution_time as f64 / resolved_incidents.len() as f64
        } else {
            0.0
        };
        
        let contained_incidents: Vec<_> = self.incidents.iter()
            .filter(|i| i.contained_at.is_some())
            .collect();
        
        let avg_containment_time_hours = if !contained_incidents.is_empty() {
            let total_containment_time: i64 = contained_incidents.iter()
                .map(|i| (i.contained_at.unwrap() - i.detected_at).num_hours())
                .sum();
            total_containment_time as f64 / contained_incidents.len() as f64
        } else {
            0.0
        };
        
        // Group incidents by type and severity
        let mut incidents_by_type = HashMap::new();
        let mut incidents_by_severity = HashMap::new();
        
        for incident in &self.incidents {
            let type_key = format!("{:?}", incident.incident_type);
            *incidents_by_type.entry(type_key).or_insert(0) += 1;
            
            let severity_key = format!("{:?}", incident.severity);
            *incidents_by_severity.entry(severity_key).or_insert(0) += 1;
        }
        
        let metrics = IncidentMetrics {
            total_incidents,
            open_incidents,
            critical_incidents,
            avg_detection_time_hours: 2.0, // Mock value - would calculate from real detection data
            avg_containment_time_hours,
            avg_resolution_time_hours,
            incidents_by_type,
            incidents_by_severity,
            mttr_hours: avg_resolution_time_hours,
            mttd_hours: 2.0, // Mock value
            mttc_hours: avg_containment_time_hours,
        };
        
        serde_json::to_string(&metrics)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize metrics: {}", e)))
    }

    #[napi]
    pub fn health_check(&self) -> Result<String> {
        let health_info = serde_json::json!({
            "status": "healthy",
            "incidents_count": self.incidents.len(),
            "playbooks_count": self.playbooks.len(),
            "timestamp": Utc::now().to_rfc3339()
        });
        
        Ok(health_info.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_incident_response_manager_creation() {
        let manager = IncidentResponseManager::new();
        assert!(manager.is_ok());
    }

    #[test]
    fn test_create_and_get_incident() {
        let mut manager = IncidentResponseManager::new().unwrap();
        
        let incident = Incident {
            id: Uuid::new_v4(), // Will be overwritten
            title: "Data Breach Incident".to_string(),
            description: "Unauthorized access to customer database".to_string(),
            incident_type: IncidentType::DataBreach,
            severity: IncidentSeverity::Critical,
            status: IncidentStatus::New,
            reporter: "Security Team".to_string(),
            assigned_team: Some("Incident Response Team".to_string()),
            lead_investigator: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            detected_at: Utc::now(),
            contained_at: None,
            resolved_at: None,
            affected_systems: vec!["Database Server".to_string()],
            evidence: Vec::new(),
            timeline: Vec::new(),
            response_actions: Vec::new(),
            lessons_learned: Vec::new(),
            total_cost: None,
        };
        
        let incident_json = serde_json::to_string(&incident).unwrap();
        let incident_id = manager.create_incident(incident_json).unwrap();
        
        let retrieved_incident_json = manager.get_incident(incident_id).unwrap();
        let retrieved_incident: Incident = serde_json::from_str(&retrieved_incident_json).unwrap();
        
        assert_eq!(retrieved_incident.title, "Data Breach Incident");
        assert_eq!(retrieved_incident.severity, IncidentSeverity::Critical);
    }
}