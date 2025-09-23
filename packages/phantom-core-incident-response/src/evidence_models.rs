//! Evidence and Forensic Models
//! 
//! Data structures for digital evidence and forensic investigations

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use napi_derive::napi;
use crate::incident_models::TimelineEvent;

/// Evidence types for forensic analysis
#[napi]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum EvidenceType {
    DiskImage,
    MemoryDump,
    NetworkCapture,
    LogFile,
    Registry,
    FileSystem,
    Database,
    Email,
    Document,
    Screenshot,
    Video,
    Audio,
    Mobile,
    Cloud,
}

/// Digital evidence item
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evidence {
    pub id: String,
    pub name: String,
    pub evidence_type: EvidenceType,
    pub description: String,
    pub source_system: String,
    pub collected_by: String,
    pub collected_at: i64,
    pub file_path: String,
    pub file_size: i64,
    pub hash_md5: String,
    pub hash_sha256: String,
    pub chain_of_custody: Vec<CustodyRecord>,
    pub analysis_results: Vec<AnalysisResult>,
    pub tags: Vec<String>,
    pub metadata: HashMap<String, String>,
}

/// Chain of custody record
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustodyRecord {
    pub timestamp: i64,
    pub action: String,
    pub person: String,
    pub location: String,
    pub notes: String,
}

/// Analysis result for evidence
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub id: String,
    pub analyst: String,
    pub analysis_type: String,
    pub timestamp: i64,
    pub findings: String,
    pub confidence: f64,
    pub tools_used: Vec<String>,
    pub artifacts: Vec<String>,
    pub recommendations: Vec<String>,
}

/// Forensic investigation
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForensicInvestigation {
    pub id: String,
    pub incident_id: String,
    pub investigator: String,
    pub started_at: i64,
    pub completed_at: Option<i64>,
    pub scope: String,
    pub methodology: String,
    pub tools_used: Vec<String>,
    pub evidence_collected: Vec<String>,
    pub findings: Vec<ForensicFinding>,
    pub timeline_reconstruction: Vec<TimelineEvent>,
    pub attribution: Option<Attribution>,
    pub report_path: Option<String>,
}

/// Forensic finding
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForensicFinding {
    pub id: String,
    pub category: String,
    pub description: String,
    pub confidence: f64,
    pub evidence_references: Vec<String>,
    pub impact: String,
    pub recommendations: Vec<String>,
}

/// Attribution analysis
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attribution {
    pub threat_actor: Option<String>,
    pub campaign: Option<String>,
    pub techniques: Vec<String>,
    pub tools: Vec<String>,
    pub infrastructure: Vec<String>,
    pub confidence: f64,
    pub evidence: Vec<String>,
}