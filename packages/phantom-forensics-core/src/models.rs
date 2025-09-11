//! Forensics Models
//! 
//! Enterprise-grade data structures for digital forensics and incident investigation

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;

/// Enhanced forensic evidence with enterprise features
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForensicEvidence {
    pub id: String,
    pub case_id: String,
    pub evidence_type: EvidenceType,
    pub source: String,
    pub timestamp: DateTime<Utc>,
    pub hash: String,
    pub hash_algorithm: HashAlgorithm,
    pub file_size: Option<u64>,
    pub mime_type: Option<String>,
    pub metadata: HashMap<String, String>,
    pub chain_of_custody: Vec<CustodyEntry>,
    pub classification: ClassificationLevel,
    pub tags: Vec<String>,
    pub relationships: Vec<EvidenceRelationship>,
    pub integrity_verified: bool,
    pub extracted_artifacts: Vec<ExtractedArtifact>,
    pub analysis_results: Vec<AnalysisResult>,
    pub preservation_details: PreservationDetails,
}

impl ForensicEvidence {
    pub fn new(
        case_id: String,
        evidence_type: EvidenceType,
        source: String,
        data: Vec<u8>,
    ) -> Self {
        let id = Uuid::new_v4().to_string();
        let timestamp = Utc::now();
        let hash = Self::calculate_hash(&data, &HashAlgorithm::SHA256);
        
        Self {
            id,
            case_id,
            evidence_type,
            source,
            timestamp,
            hash,
            hash_algorithm: HashAlgorithm::SHA256,
            file_size: Some(data.len() as u64),
            mime_type: None,
            metadata: HashMap::new(),
            chain_of_custody: vec![],
            classification: ClassificationLevel::Unclassified,
            tags: vec![],
            relationships: vec![],
            integrity_verified: false,
            extracted_artifacts: vec![],
            analysis_results: vec![],
            preservation_details: PreservationDetails::default(),
        }
    }
    
    fn calculate_hash(data: &[u8], algorithm: &HashAlgorithm) -> String {
        match algorithm {
            HashAlgorithm::MD5 => {
                let digest = md5::compute(data);
                hex::encode(digest.0)
            }
            HashAlgorithm::SHA256 => {
                use sha2::{Sha256, Digest};
                let mut hasher = Sha256::new();
                hasher.update(data);
                hex::encode(hasher.finalize())
            }
            HashAlgorithm::SHA512 => {
                use sha2::{Sha512, Digest};
                let mut hasher = Sha512::new();
                hasher.update(data);
                hex::encode(hasher.finalize())
            }
        }
    }
    
    pub fn verify_integrity(&mut self, data: &[u8]) -> bool {
        let calculated_hash = Self::calculate_hash(data, &self.hash_algorithm);
        self.integrity_verified = calculated_hash == self.hash;
        self.integrity_verified
    }
    
    pub fn add_custody_entry(&mut self, entry: CustodyEntry) {
        self.chain_of_custody.push(entry);
    }
    
    pub fn add_relationship(&mut self, relationship: EvidenceRelationship) {
        self.relationships.push(relationship);
    }
    
    pub fn add_extracted_artifact(&mut self, artifact: ExtractedArtifact) {
        self.extracted_artifacts.push(artifact);
    }
}

/// Types of evidence in digital forensics
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum EvidenceType {
    FileSystem,
    Network,
    Memory,
    Registry,
    EventLog,
    Database,
    Mobile,
    Cloud,
    Email,
    Browser,
    Application,
    Metadata,
    Volatile,
    Image,
    Video,
    Audio,
    Document,
    Executable,
    Archive,
    Custom(String),
}

/// Hash algorithms for evidence integrity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HashAlgorithm {
    MD5,
    SHA256,
    SHA512,
}

/// Classification levels for evidence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ClassificationLevel {
    Unclassified,
    Internal,
    Confidential,
    Secret,
    TopSecret,
    Custom(String),
}

/// Chain of custody entry with digital signature support
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustodyEntry {
    pub id: String,
    pub handler: String,
    pub handler_role: String,
    pub action: CustodyAction,
    pub timestamp: DateTime<Utc>,
    pub notes: String,
    pub digital_signature: Option<String>,
    pub witness: Option<String>,
    pub location: Option<String>,
    pub system_info: Option<SystemInfo>,
}

/// Actions that can be performed in chain of custody
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CustodyAction {
    Collected,
    Received,
    Analyzed,
    Transferred,
    Stored,
    Retrieved,
    Copied,
    Modified,
    Deleted,
    Archived,
    Destroyed,
    Custom(String),
}

/// System information for custody entries
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub hostname: String,
    pub ip_address: String,
    pub operating_system: String,
    pub user_account: String,
    pub tool_name: String,
    pub tool_version: String,
}

/// Evidence relationships for correlation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceRelationship {
    pub related_evidence_id: String,
    pub relationship_type: RelationshipType,
    pub description: String,
    pub confidence_score: f64,
    pub created_at: DateTime<Utc>,
}

/// Types of evidence relationships
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RelationshipType {
    Parent,
    Child,
    Sibling,
    Duplicate,
    Similar,
    Timeline,
    Source,
    Derived,
    Associated,
    Custom(String),
}

/// Extracted artifacts from evidence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtractedArtifact {
    pub id: String,
    pub artifact_type: ArtifactType,
    pub name: String,
    pub value: String,
    pub location: String,
    pub timestamp: Option<DateTime<Utc>>,
    pub confidence: f64,
    pub metadata: HashMap<String, String>,
}

/// Types of forensic artifacts
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ArtifactType {
    File,
    RegistryKey,
    NetworkConnection,
    Process,
    Service,
    UserAccount,
    EmailAddress,
    URL,
    IPAddress,
    Domain,
    Hash,
    Timestamp,
    Geolocation,
    Custom(String),
}

/// Analysis results from forensic tools
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub id: String,
    pub analyzer_name: String,
    pub analyzer_version: String,
    pub analysis_type: AnalysisType,
    pub timestamp: DateTime<Utc>,
    pub results: serde_json::Value,
    pub confidence: f64,
    pub status: AnalysisStatus,
    pub error_message: Option<String>,
}

/// Types of forensic analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnalysisType {
    HashAnalysis,
    MetadataExtraction,
    StringExtraction,
    MalwareAnalysis,
    NetworkAnalysis,
    TimelineAnalysis,
    KeywordSearch,
    PatternMatching,
    Steganography,
    Cryptanalysis,
    Custom(String),
}

/// Status of analysis operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnalysisStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
    Cancelled,
}

/// Evidence preservation details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PreservationDetails {
    pub preservation_method: PreservationMethod,
    pub acquisition_tool: String,
    pub acquisition_date: DateTime<Utc>,
    pub acquisition_hash: String,
    pub write_protection: bool,
    pub compression: Option<String>,
    pub encryption: Option<EncryptionDetails>,
    pub storage_location: String,
    pub backup_locations: Vec<String>,
}

impl Default for PreservationDetails {
    fn default() -> Self {
        Self {
            preservation_method: PreservationMethod::BitByBit,
            acquisition_tool: "phantom-forensics-core".to_string(),
            acquisition_date: Utc::now(),
            acquisition_hash: String::new(),
            write_protection: true,
            compression: None,
            encryption: None,
            storage_location: String::new(),
            backup_locations: vec![],
        }
    }
}

/// Methods of evidence preservation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PreservationMethod {
    BitByBit,
    Logical,
    Selective,
    Live,
    Custom(String),
}

/// Encryption details for evidence protection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionDetails {
    pub algorithm: String,
    pub key_derivation: String,
    pub initialization_vector: Option<String>,
    pub encrypted_at: DateTime<Utc>,
}

/// Enhanced forensic timeline with correlation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForensicTimeline {
    pub id: String,
    pub case_id: String,
    pub name: String,
    pub description: String,
    pub events: Vec<TimelineEvent>,
    pub analysis_notes: String,
    pub created_by: String,
    pub created_at: DateTime<Utc>,
    pub last_modified: DateTime<Utc>,
    pub tags: Vec<String>,
    pub confidence_threshold: f64,
    pub correlation_rules: Vec<CorrelationRule>,
}

impl ForensicTimeline {
    pub fn new(case_id: String, name: String, created_by: String) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            case_id,
            name,
            description: String::new(),
            events: vec![],
            analysis_notes: String::new(),
            created_by,
            created_at: Utc::now(),
            last_modified: Utc::now(),
            tags: vec![],
            confidence_threshold: 0.7,
            correlation_rules: vec![],
        }
    }
    
    pub fn add_event(&mut self, event: TimelineEvent) {
        self.events.push(event);
        self.events.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));
        self.last_modified = Utc::now();
    }
    
    pub fn correlate_events(&mut self) {
        // Implementation for event correlation based on rules
        for rule in &self.correlation_rules {
            // Apply correlation logic
            self.apply_correlation_rule(rule);
        }
    }
    
    fn apply_correlation_rule(&mut self, _rule: &CorrelationRule) {
        // Placeholder for correlation rule application
    }
}

/// Enhanced timeline event with enrichment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub event_type: String,
    pub source: String,
    pub description: String,
    pub artifacts: Vec<String>,
    pub confidence: f64,
    pub evidence_id: Option<String>,
    pub enrichment_data: HashMap<String, serde_json::Value>,
    pub tags: Vec<String>,
    pub category: EventCategory,
    pub severity: EventSeverity,
    pub correlation_id: Option<String>,
}

/// Categories of timeline events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventCategory {
    System,
    Network,
    Application,
    Security,
    User,
    File,
    Process,
    Registry,
    Custom(String),
}

/// Severity levels for events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventSeverity {
    Low,
    Medium,
    High,
    Critical,
}

/// Correlation rules for timeline analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CorrelationRule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub pattern: String,
    pub time_window_seconds: u64,
    pub threshold: u32,
    pub enabled: bool,
}

/// Case investigation with comprehensive tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaseInvestigation {
    pub id: String,
    pub case_number: String,
    pub title: String,
    pub description: String,
    pub status: CaseStatus,
    pub priority: CasePriority,
    pub classification: ClassificationLevel,
    pub investigators: Vec<Investigator>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub closed_at: Option<DateTime<Utc>>,
    pub tags: Vec<String>,
    pub evidence_count: usize,
    pub timeline_count: usize,
    pub related_cases: Vec<String>,
    pub external_references: Vec<ExternalReference>,
    pub compliance_requirements: Vec<String>,
    pub retention_policy: RetentionPolicy,
}

impl CaseInvestigation {
    pub fn new(case_number: String, title: String, primary_investigator: Investigator) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            case_number,
            title,
            description: String::new(),
            status: CaseStatus::Open,
            priority: CasePriority::Medium,
            classification: ClassificationLevel::Internal,
            investigators: vec![primary_investigator],
            created_at: Utc::now(),
            updated_at: Utc::now(),
            closed_at: None,
            tags: vec![],
            evidence_count: 0,
            timeline_count: 0,
            related_cases: vec![],
            external_references: vec![],
            compliance_requirements: vec![],
            retention_policy: RetentionPolicy::default(),
        }
    }
}

/// Case investigation status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CaseStatus {
    Open,
    InProgress,
    OnHold,
    Closed,
    Archived,
}

/// Case priority levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CasePriority {
    Low,
    Medium,
    High,
    Critical,
    Emergency,
}

/// Investigator information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Investigator {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub organization: String,
    pub certifications: Vec<String>,
    pub clearance_level: Option<String>,
    pub contact_info: ContactInfo,
}

/// Contact information for investigators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContactInfo {
    pub phone: Option<String>,
    pub address: Option<String>,
    pub emergency_contact: Option<String>,
}

/// External references for cases
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExternalReference {
    pub reference_type: ReferenceType,
    pub identifier: String,
    pub description: String,
    pub url: Option<String>,
}

/// Types of external references
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReferenceType {
    TicketNumber,
    IncidentId,
    CourtCase,
    Regulation,
    Standard,
    Report,
    Custom(String),
}

/// Retention policy for evidence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetentionPolicy {
    pub retention_period_years: u32,
    pub auto_delete: bool,
    pub legal_hold: bool,
    pub disposal_method: DisposalMethod,
}

impl Default for RetentionPolicy {
    fn default() -> Self {
        Self {
            retention_period_years: 7,
            auto_delete: false,
            legal_hold: false,
            disposal_method: DisposalMethod::SecureWipe,
        }
    }
}

/// Methods for evidence disposal
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DisposalMethod {
    SecureWipe,
    PhysicalDestruction,
    Degaussing,
    Cryptographic,
    Custom(String),
}

/// Search criteria for forensic evidence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForensicSearchCriteria {
    pub case_id: Option<String>,
    pub evidence_types: Vec<EvidenceType>,
    pub date_from: Option<DateTime<Utc>>,
    pub date_to: Option<DateTime<Utc>>,
    pub keywords: Vec<String>,
    pub tags: Vec<String>,
    pub hash: Option<String>,
    pub source_contains: Option<String>,
    pub classification_level: Option<ClassificationLevel>,
    pub integrity_verified: Option<bool>,
    pub has_analysis_results: Option<bool>,
    pub investigator_id: Option<String>,
    pub artifact_types: Vec<ArtifactType>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
    pub sort_field: Option<String>,
    pub sort_order: Option<crate::data_stores::SortOrder>,
}

impl Default for ForensicSearchCriteria {
    fn default() -> Self {
        Self {
            case_id: None,
            evidence_types: vec![],
            date_from: None,
            date_to: None,
            keywords: vec![],
            tags: vec![],
            hash: None,
            source_contains: None,
            classification_level: None,
            integrity_verified: None,
            has_analysis_results: None,
            investigator_id: None,
            artifact_types: vec![],
            limit: Some(100),
            offset: Some(0),
            sort_field: Some("timestamp".to_string()),
            sort_order: Some(crate::data_stores::SortOrder::Desc),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_forensic_evidence_creation() {
        let case_id = "CASE-001".to_string();
        let data = b"test evidence data";
        let evidence = ForensicEvidence::new(
            case_id.clone(),
            EvidenceType::FileSystem,
            "test_file.txt".to_string(),
            data.to_vec(),
        );
        
        assert_eq!(evidence.case_id, case_id);
        assert_eq!(evidence.evidence_type, EvidenceType::FileSystem);
        assert_eq!(evidence.file_size, Some(18));
        assert!(!evidence.hash.is_empty());
    }
    
    #[test]
    fn test_case_investigation_creation() {
        let investigator = Investigator {
            id: "INV-001".to_string(),
            name: "John Doe".to_string(),
            email: "john.doe@example.com".to_string(),
            role: "Senior Investigator".to_string(),
            organization: "Forensics Unit".to_string(),
            certifications: vec!["GCFE".to_string(), "GCFA".to_string()],
            clearance_level: Some("Secret".to_string()),
            contact_info: ContactInfo {
                phone: Some("+1-555-0123".to_string()),
                address: None,
                emergency_contact: None,
            },
        };
        
        let case = CaseInvestigation::new(
            "CASE-2024-001".to_string(),
            "Data Breach Investigation".to_string(),
            investigator,
        );
        
        assert_eq!(case.case_number, "CASE-2024-001");
        assert_eq!(case.investigators.len(), 1);
        assert!(matches!(case.status, CaseStatus::Open));
    }
    
    #[test]
    fn test_forensic_timeline_events() {
        let mut timeline = ForensicTimeline::new(
            "CASE-001".to_string(),
            "Attack Timeline".to_string(),
            "investigator1".to_string(),
        );
        
        let event = TimelineEvent {
            id: Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            event_type: "file_creation".to_string(),
            source: "file_system".to_string(),
            description: "Malicious file created".to_string(),
            artifacts: vec!["malware.exe".to_string()],
            confidence: 0.9,
            evidence_id: Some("evidence-001".to_string()),
            enrichment_data: HashMap::new(),
            tags: vec!["malware".to_string()],
            category: EventCategory::File,
            severity: EventSeverity::High,
            correlation_id: None,
        };
        
        timeline.add_event(event);
        
        assert_eq!(timeline.events.len(), 1);
        assert_eq!(timeline.events[0].severity, EventSeverity::High);
    }
}