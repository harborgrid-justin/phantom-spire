use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;

/// OCSF Base Event Structure
/// Implements the Open Cybersecurity Schema Framework base event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BaseEvent {
    /// The normalized identifier of the activity that triggered the event
    pub activity_id: ActivityId,
    /// The event activity name, as defined by the activity_id
    #[serde(skip_serializing_if = "Option::is_none")]
    pub activity_name: Option<String>,
    /// The category unique identifier of the event
    pub category_uid: CategoryUid,
    /// The event category name, as defined by category_uid value
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category_name: Option<String>,
    /// The unique identifier of a class
    pub class_uid: ClassUid,
    /// The event class name, as defined by class_uid value
    #[serde(skip_serializing_if = "Option::is_none")]
    pub class_name: Option<String>,
    /// The number of times that events in the same logical group occurred
    #[serde(skip_serializing_if = "Option::is_none")]
    pub count: Option<i32>,
    /// The event duration or aggregate time in milliseconds
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration: Option<i64>,
    /// The end time of a time period
    #[serde(skip_serializing_if = "Option::is_none")]
    pub end_time: Option<DateTime<Utc>>,
    /// Additional information from external data sources
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub enrichments: Vec<Enrichment>,
    /// The description of the event/finding
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    /// The metadata associated with the event
    pub metadata: Metadata,
    /// The observables associated with the event
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub observables: Vec<Observable>,
    /// The raw event/finding data as received from the source
    #[serde(skip_serializing_if = "Option::is_none")]
    pub raw_data: Option<String>,
    /// The hash of the raw data content
    #[serde(skip_serializing_if = "Option::is_none")]
    pub raw_data_hash: Option<Fingerprint>,
    /// The size of the raw data in bytes
    #[serde(skip_serializing_if = "Option::is_none")]
    pub raw_data_size: Option<i64>,
    /// The event/finding severity name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub severity: Option<String>,
    /// The normalized identifier of the event/finding severity
    pub severity_id: SeverityId,
    /// The start time of a time period
    #[serde(skip_serializing_if = "Option::is_none")]
    pub start_time: Option<DateTime<Utc>>,
    /// The event status name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
    /// The event status code
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status_code: Option<String>,
    /// Additional status details
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status_detail: Option<String>,
    /// The normalized identifier of the event status
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status_id: Option<StatusId>,
    /// The normalized event occurrence time
    pub time: DateTime<Utc>,
    /// The timezone offset in minutes
    #[serde(skip_serializing_if = "Option::is_none")]
    pub timezone_offset: Option<i32>,
    /// The event/finding type name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub type_name: Option<String>,
    /// The event/finding type ID
    pub type_uid: i64,
    /// Unmapped data attributes
    #[serde(skip_serializing_if = "Option::is_none")]
    pub unmapped: Option<HashMap<String, serde_json::Value>>,
}

/// Activity ID enumeration for OCSF events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActivityId {
    #[serde(rename = "0")]
    Unknown = 0,
    #[serde(rename = "99")]
    Other = 99,
}

/// Category UID enumeration for OCSF events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CategoryUid {
    #[serde(rename = "0")]
    Uncategorized = 0,
    #[serde(rename = "1")]
    SystemActivity = 1,
    #[serde(rename = "2")]
    Findings = 2,
    #[serde(rename = "3")]
    IdentityAndAccessManagement = 3,
    #[serde(rename = "4")]
    NetworkActivity = 4,
    #[serde(rename = "5")]
    Discovery = 5,
    #[serde(rename = "6")]
    ApplicationActivity = 6,
}

/// Class UID enumeration for OCSF events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ClassUid {
    #[serde(rename = "0")]
    BaseEvent = 0,
    #[serde(rename = "1001")]
    SecurityFinding = 1001,
    #[serde(rename = "2001")]
    NetworkActivity = 2001,
    #[serde(rename = "3001")]
    FileActivity = 3001,
    #[serde(rename = "3002")]
    ProcessActivity = 3002,
    #[serde(rename = "3003")]
    Authentication = 3003,
}

/// Severity ID enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SeverityId {
    #[serde(rename = "0")]
    Unknown = 0,
    #[serde(rename = "1")]
    Informational = 1,
    #[serde(rename = "2")]
    Low = 2,
    #[serde(rename = "3")]
    Medium = 3,
    #[serde(rename = "4")]
    High = 4,
    #[serde(rename = "5")]
    Critical = 5,
    #[serde(rename = "6")]
    Fatal = 6,
    #[serde(rename = "99")]
    Other = 99,
}

/// Status ID enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StatusId {
    #[serde(rename = "0")]
    Unknown = 0,
    #[serde(rename = "1")]
    Success = 1,
    #[serde(rename = "2")]
    Failure = 2,
    #[serde(rename = "99")]
    Other = 99,
}

/// Metadata object for OCSF events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Metadata {
    /// The version of the OCSF schema
    pub version: String,
    /// The product that generated the event
    pub product: Product,
    /// The schema extension used
    #[serde(skip_serializing_if = "Option::is_none")]
    pub extension: Option<Extension>,
    /// The profiles applied to this event
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub profiles: Vec<String>,
}

/// Product information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Product {
    /// The product name
    pub name: String,
    /// The product vendor
    pub vendor_name: String,
    /// The product version
    #[serde(skip_serializing_if = "Option::is_none")]
    pub version: Option<String>,
    /// The product UID
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uid: Option<String>,
}

/// Schema extension information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Extension {
    /// The extension name
    pub name: String,
    /// The extension UID
    pub uid: i32,
    /// The extension version
    #[serde(skip_serializing_if = "Option::is_none")]
    pub version: Option<String>,
}

/// Enrichment object for additional context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Enrichment {
    /// The enrichment name
    pub name: String,
    /// The enrichment value
    pub value: String,
    /// The enrichment type
    pub enrichment_type: String,
    /// Additional enrichment data
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<serde_json::Value>,
}

/// Observable object for threat intelligence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Observable {
    /// The observable name
    pub name: String,
    /// The observable value
    pub value: String,
    /// The observable type
    pub observable_type: String,
    /// The observable type ID
    pub type_id: i32,
    /// Additional observable data
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<serde_json::Value>,
    /// Observable reputation score (0.0 to 1.0)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reputation: Option<f64>,
    /// Additional observable attributes
    #[serde(skip_serializing_if = "Option::is_none")]
    pub attributes: Option<serde_json::Value>,
}

impl Observable {
    pub fn file_hash(p0: String, p1: String) -> Observable {
        todo!()
    }
}

/// Fingerprint object for hashing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fingerprint {
    /// The algorithm used for fingerprinting
    pub algorithm: String,
    /// The fingerprint value
    pub value: String,
}

impl BaseEvent {
    /// Create a new base event with default values
    pub fn new(category_uid: CategoryUid, class_uid: ClassUid, severity_id: SeverityId) -> Self {
        let now = Utc::now();
        let type_uid = (class_uid.clone() as i32 as i64) * 100 + (ActivityId::Unknown as i32 as i64);

        Self {
            activity_id: ActivityId::Unknown,
            activity_name: None,
            category_uid,
            category_name: None,
            class_uid,
            class_name: None,
            count: None,
            duration: None,
            end_time: None,
            enrichments: Vec::new(),
            message: None,
            metadata: Metadata {
                version: "1.6.0".to_string(),
                product: Product {
                    name: "Phantom Threat Actor Core".to_string(),
                    vendor_name: "Phantom Security".to_string(),
                    version: Some(env!("CARGO_PKG_VERSION").to_string()),
                    uid: None,
                },
                extension: None,
                profiles: Vec::new(),
            },
            observables: Vec::new(),
            raw_data: None,
            raw_data_hash: None,
            raw_data_size: None,
            severity: None,
            severity_id,
            start_time: None,
            status: None,
            status_code: None,
            status_detail: None,
            status_id: None,
            time: now,
            timezone_offset: None,
            type_name: None,
            type_uid,
            unmapped: None,
        }
    }

    /// Add an enrichment to the event
    pub fn add_enrichment(&mut self, enrichment: Enrichment) {
        self.enrichments.push(enrichment);
    }

    /// Add an observable to the event
    pub fn add_observable(&mut self, observable: Observable) {
        self.observables.push(observable);
    }

    /// Set the event message
    pub fn with_message(mut self, message: String) -> Self {
        self.message = Some(message);
        self
    }

    /// Set the raw data
    pub fn with_raw_data(mut self, raw_data: String) -> Self {
        self.raw_data = Some(raw_data.clone());
        self.raw_data_size = Some(raw_data.len() as i64);
        self
    }

    /// Set the event status
    pub fn with_status(mut self, status_id: StatusId, status: Option<String>) -> Self {
        self.status_id = Some(status_id);
        self.status = status;
        self
    }

    /// Calculate and set the duration if start and end times are available
    pub fn calculate_duration(&mut self) {
        if let (Some(start), Some(end)) = (self.start_time, self.end_time) {
            self.duration = Some((end - start).num_milliseconds());
        }
    }

    /// Validate the event structure
    pub fn validate(&self) -> Result<(), String> {
        // Validate required fields
        if self.time > Utc::now() {
            return Err("Event time cannot be in the future".to_string());
        }

        if let Some(duration) = self.duration {
            if duration < 0 {
                return Err("Duration cannot be negative".to_string());
            }
        }

        if let Some(raw_data_size) = self.raw_data_size {
            if raw_data_size < 0 {
                return Err("Raw data size cannot be negative".to_string());
            }
        }

        Ok(())
    }

    /// Convert to JSON string
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    /// Create from JSON string
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
}

impl Default for BaseEvent {
    fn default() -> Self {
        Self::new(CategoryUid::Uncategorized, ClassUid::BaseEvent, SeverityId::Unknown)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_base_event_creation() {
        let event = BaseEvent::new(
            CategoryUid::Findings,
            ClassUid::SecurityFinding,
            SeverityId::High,
        );

        assert_eq!(event.category_uid as i32, 2);
        assert_eq!(event.class_uid as i32, 1001);
        assert_eq!(event.severity_id as i32, 4);
        assert!(event.time <= Utc::now());
    }

    #[test]
    fn test_event_validation() {
        let mut event = BaseEvent::default();
        event.start_time = Some(Utc::now());
        event.end_time = Some(Utc::now() - chrono::Duration::seconds(60));
        event.duration = Some(-1000); // Invalid negative duration

        assert!(event.validate().is_err());
    }

    #[test]
    fn test_json_serialization() {
        let event = BaseEvent::new(
            CategoryUid::NetworkActivity,
            ClassUid::NetworkActivity,
            SeverityId::Medium,
        ).with_message("Test network activity".to_string());

        let json = event.to_json().unwrap();
        let deserialized: BaseEvent = BaseEvent::from_json(&json).unwrap();

        assert_eq!(deserialized.category_uid as i32, event.category_uid as i32);
        assert_eq!(deserialized.message, event.message);
    }

    #[test]
    fn test_enrichment_and_observables() {
        let mut event = BaseEvent::default();

        let enrichment = Enrichment {
            name: "location".to_string(),
            value: "192.168.1.1".to_string(),
            enrichment_type: "ip_geolocation".to_string(),
            data: Some(serde_json::json!({"country": "US", "city": "New York"})),
        };

        let observable = Observable {
            name: "suspicious_ip".to_string(),
            value: "192.168.1.1".to_string(),
            observable_type: "ipv4".to_string(),
            type_id: 1,
            data: None,
            reputation: None,
            attributes: None,
        };

        event.add_enrichment(enrichment);
        event.add_observable(observable);

        assert_eq!(event.enrichments.len(), 1);
        assert_eq!(event.observables.len(), 1);
        assert_eq!(event.enrichments[0].name, "location");
        assert_eq!(event.observables[0].name, "suspicious_ip");
    }
}