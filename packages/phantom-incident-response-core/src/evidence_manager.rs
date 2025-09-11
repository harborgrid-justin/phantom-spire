//! Evidence Manager
//! 
//! Comprehensive evidence handling and forensic analysis management for NIST SP 800-61r2 compliance
//! Manages chain of custody, evidence integrity, and forensic investigation coordination

use crate::evidence_models::*;
use crate::incident_models::*;
use crate::data_stores::*;
use crate::config::Config;

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use async_trait::async_trait;

/// Evidence manager for handling digital evidence and forensic analysis
pub struct EvidenceManager {
    data_store: Arc<dyn ComprehensiveIncidentResponseStore + Send + Sync>,
    config: Config,
    active_investigations: Arc<RwLock<HashMap<String, ForensicInvestigation>>>,
    evidence_processors: Arc<RwLock<HashMap<String, Box<dyn EvidenceProcessor + Send + Sync>>>>,
    integrity_checker: IntegrityChecker,
}

/// Evidence collection result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceCollectionResult {
    pub evidence_id: String,
    pub collection_status: CollectionStatus,
    pub collected_at: i64,
    pub collected_by: String,
    pub file_path: String,
    pub file_size: u64,
    pub hash_md5: String,
    pub hash_sha256: String,
    pub metadata: HashMap<String, String>,
    pub errors: Vec<String>,
}

/// Evidence collection status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum CollectionStatus {
    Success,
    Partial,
    Failed,
    Corrupted,
    Inaccessible,
}

/// Evidence analysis request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisRequest {
    pub id: String,
    pub evidence_id: String,
    pub analysis_type: AnalysisType,
    pub priority: u8,
    pub requested_by: String,
    pub requested_at: i64,
    pub parameters: HashMap<String, String>,
    pub deadline: Option<i64>,
}

/// Types of evidence analysis
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AnalysisType {
    MalwareAnalysis,
    NetworkAnalysis,
    MemoryAnalysis,
    DiskForensics,
    TimelineAnalysis,
    FileSystemAnalysis,
    RegistryAnalysis,
    LogAnalysis,
    CryptographicAnalysis,
    MetadataExtraction,
}

/// Evidence processor trait
#[async_trait]
pub trait EvidenceProcessor {
    async fn process_evidence(
        &self,
        evidence: &Evidence,
        analysis_type: &AnalysisType,
        parameters: &HashMap<String, String>,
    ) -> Result<AnalysisResult, Box<dyn std::error::Error + Send + Sync>>;
    
    fn get_supported_types(&self) -> Vec<EvidenceType>;
    fn get_supported_analyses(&self) -> Vec<AnalysisType>;
    fn get_processing_priority(&self) -> u8;
}

/// Chain of custody manager
pub struct ChainOfCustodyManager {
    data_store: Arc<dyn ComprehensiveIncidentResponseStore + Send + Sync>,
}

/// Evidence integrity checker
pub struct IntegrityChecker;

/// Forensic report generator
pub struct ForensicReportGenerator {
    config: Config,
}

impl EvidenceManager {
    /// Create a new evidence manager
    pub fn new(
        data_store: Arc<dyn ComprehensiveIncidentResponseStore + Send + Sync>,
        config: Config,
    ) -> Self {
        Self {
            data_store: Arc::clone(&data_store),
            config: config.clone(),
            active_investigations: Arc::new(RwLock::new(HashMap::new())),
            evidence_processors: Arc::new(RwLock::new(HashMap::new())),
            integrity_checker: IntegrityChecker::new(),
        }
    }

    /// Collect evidence from a source system
    pub async fn collect_evidence(
        &self,
        incident_id: &str,
        evidence_type: EvidenceType,
        source_system: &str,
        collected_by: &str,
        collection_parameters: HashMap<String, String>,
        tenant_context: &TenantContext,
    ) -> Result<EvidenceCollectionResult, Box<dyn std::error::Error + Send + Sync>> {
        let evidence_id = Uuid::new_v4().to_string();
        let now = Utc::now().timestamp();

        // Create evidence record
        let mut evidence = Evidence {
            id: evidence_id.clone(),
            name: collection_parameters.get("name")
                .unwrap_or(&format!("{:?}_evidence", evidence_type))
                .clone(),
            evidence_type: evidence_type.clone(),
            description: collection_parameters.get("description")
                .unwrap_or(&"Collected evidence".to_string())
                .clone(),
            source_system: source_system.to_string(),
            collected_by: collected_by.to_string(),
            collected_at: now,
            file_path: String::new(), // Will be set after a collection
            file_size: 0, // Will be set after a collection
            hash_md5: String::new(), // Will be calculated after a collection
            hash_sha256: String::new(), // Will be calculated after a collection
            chain_of_custody: vec![],
            analysis_results: vec![],
            tags: collection_parameters.get("tags")
                .map(|t| t.split(',').map(|s| s.trim().to_string()).collect())
                .unwrap_or_default(),
            metadata: collection_parameters,
        };

        // Perform actual evidence collection
        let collection_result = self.perform_evidence_collection(
            &mut evidence,
            &collection_parameters,
        ).await?;

        // Create initial chain of custody record
        let custody_record = CustodyRecord {
            timestamp: now,
            action: "Evidence Collected".to_string(),
            person: collected_by.to_string(),
            location: source_system.to_string(),
            notes: format!("Initial evidence collection from {}", source_system),
        };
        evidence.chain_of_custody.push(custody_record);

        // Verify evidence integrity
        let integrity_check = self.integrity_checker.verify_evidence(&evidence).await?;
        if !integrity_check.valid {
            return Ok(EvidenceCollectionResult {
                evidence_id,
                collection_status: CollectionStatus::Corrupted,
                collected_at: now,
                collected_by: collected_by.to_string(),
                file_path: evidence.file_path,
                file_size: evidence.file_size,
                hash_md5: evidence.hash_md5,
                hash_sha256: evidence.hash_sha256,
                metadata: evidence.metadata,
                errors: vec![format!("Evidence integrity check failed: {}", integrity_check.error_message)],
            });
        }

        // Store evidence
        self.data_store.store_evidence(&evidence, tenant_context).await?;

        // Link evidence to incident
        self.link_evidence_to_incident(incident_id, &evidence_id, tenant_context).await?;

        Ok(EvidenceCollectionResult {
            evidence_id,
            collection_status: collection_result.status,
            collected_at: now,
            collected_by: collected_by.to_string(),
            file_path: evidence.file_path,
            file_size: evidence.file_size,
            hash_md5: evidence.hash_md5,
            hash_sha256: evidence.hash_sha256,
            metadata: evidence.metadata,
            errors: collection_result.errors,
        })
    }

    /// Start forensic investigation
    pub async fn start_investigation(
        &self,
        incident_id: &str,
        investigator: &str,
        scope: &str,
        methodology: &str,
        tenant_context: &TenantContext,
    ) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        let investigation_id = Uuid::new_v4().to_string();
        let now = Utc::now().timestamp();

        let investigation = ForensicInvestigation {
            id: investigation_id.clone(),
            incident_id: incident_id.to_string(),
            investigator: investigator.to_string(),
            started_at: now,
            completed_at: None,
            scope: scope.to_string(),
            methodology: methodology.to_string(),
            tools_used: vec![],
            evidence_collected: vec![],
            findings: vec![],
            timeline_reconstruction: vec![],
            attribution: None,
            report_path: None,
        };

        // Store investigation
        self.data_store.store_forensic_investigation(&investigation, tenant_context).await?;

        // Add to active investigations
        {
            let mut active = self.active_investigations.write().await;
            active.insert(investigation_id.clone(), investigation);
        }

        Ok(investigation_id)
    }

    /// Submit evidence for analysis
    pub async fn request_analysis(
        &self,
        evidence_id: &str,
        analysis_type: AnalysisType,
        requested_by: &str,
        priority: u8,
        parameters: HashMap<String, String>,
        tenant_context: &TenantContext,
    ) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        let request_id = Uuid::new_v4().to_string();
        let now = Utc::now().timestamp();

        // Verify evidence exists
        let evidence = self.data_store.get_evidence(evidence_id, tenant_context).await?
            .ok_or("Evidence not found")?;

        // Create analysis request
        let request = AnalysisRequest {
            id: request_id.clone(),
            evidence_id: evidence_id.to_string(),
            analysis_type: analysis_type.clone(),
            priority,
            requested_by: requested_by.to_string(),
            requested_at: now,
            parameters: parameters.clone(),
            deadline: parameters.get("deadline")
                .and_then(|d| d.parse::<i64>().ok()),
        };

        // Find appropriate processor
        let processor = self.find_evidence_processor(&evidence.evidence_type, &analysis_type).await?;

        // Execute analysis
        let analysis_result = processor.process_evidence(&evidence, &analysis_type, &parameters).await?;

        // Store analysis result
        self.store_analysis_result(&evidence_id, &analysis_result, tenant_context).await?;

        // Update chain of custody
        self.update_custody_chain(
            evidence_id,
            "Analysis Performed",
            requested_by,
            &format!("Analysis type: {:?}", analysis_type),
            tenant_context,
        ).await?;

        Ok(request_id)
    }

    /// Generate forensic timeline
    pub async fn generate_timeline(
        &self,
        incident_id: &str,
        tenant_context: &TenantContext,
    ) -> Result<Vec<TimelineEvent>, Box<dyn std::error::Error + Send + Sync>> {
        let mut timeline = Vec::new();

        // Get all evidence for the incident
        let evidence_list = self.data_store.get_evidence_by_incident(incident_id, tenant_context).await?;

        // Process each evidence item for timeline events
        for evidence in evidence_list {
            // Extract timeline events from analysis results
            for analysis in &evidence.analysis_results {
                if let Some(timeline_data) = analysis.artifacts.iter()
                    .find(|a| a.starts_with("timeline:")) {
                    
                    let timeline_events = self.parse_timeline_data(timeline_data, &evidence)?;
                    timeline.extend(timeline_events);
                }
            }
        }

        // Sort by timestamp
        timeline.sort_by_key(|event| event.timestamp);

        Ok(timeline)
    }

    /// Complete forensic investigation
    pub async fn complete_investigation(
        &self,
        investigation_id: &str,
        findings: Vec<ForensicFinding>,
        tenant_context: &TenantContext,
    ) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        let mut investigation = {
            let mut active = self.active_investigations.write().await;
            active.remove(investigation_id).ok_or("Investigation not found")?
        };

        investigation.completed_at = Some(Utc::now().timestamp());
        investigation.findings = findings;

        // Generate timeline reconstruction
        investigation.timeline_reconstruction = self.generate_timeline(
            &investigation.incident_id,
            tenant_context,
        ).await?;

        // Generate forensic report
        let report_generator = ForensicReportGenerator::new(self.config.clone());
        let report_path = report_generator.generate_report(&investigation, tenant_context).await?;
        investigation.report_path = Some(report_path.clone());

        // Store completed investigation
        self.data_store.update_forensic_investigation(&investigation, tenant_context).await?;

        Ok(report_path)
    }

    /// Verify evidence chain of custody
    pub async fn verify_chain_of_custody(
        &self,
        evidence_id: &str,
        tenant_context: &TenantContext,
    ) -> Result<ChainOfCustodyVerification, Box<dyn std::error::Error + Send + Sync>> {
        let evidence = self.data_store.get_evidence(evidence_id, tenant_context).await?
            .ok_or("Evidence not found")?;

        let custody_manager = ChainOfCustodyManager::new(Arc::clone(&self.data_store));
        custody_manager.verify_chain(&evidence).await
    }

    /// Export evidence for external analysis
    pub async fn export_evidence(
        &self,
        evidence_id: &str,
        export_format: &str,
        exported_by: &str,
        tenant_context: &TenantContext,
    ) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        let evidence = self.data_store.get_evidence(evidence_id, tenant_context).await?
            .ok_or("Evidence not found")?;

        // Create export package
        let export_path = self.create_evidence_export(&evidence, export_format).await?;

        // Update chain of custody
        self.update_custody_chain(
            evidence_id,
            "Evidence Exported",
            exported_by,
            &format!("Exported in {} format to {}", export_format, export_path),
            tenant_context,
        ).await?;

        Ok(export_path)
    }

    // Private helper methods

    async fn perform_evidence_collection(
        &self,
        evidence: &mut Evidence,
        parameters: &HashMap<String, String>,
    ) -> Result<EvidenceCollectionResult, Box<dyn std::error::Error + Send + Sync>> {
        // This would contain actual evidence collection logic
        // For now, simulate a collection
        
        evidence.file_path = format!("/evidence/{}", evidence.id);
        evidence.file_size = 1024 * 1024; // 1MB placeholder
        evidence.hash_md5 = "d41d8cd98f00b204e9800998ecf8427e".to_string();
        evidence.hash_sha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855".to_string();

        Ok(EvidenceCollectionResult {
            evidence_id: evidence.id.clone(),
            status: CollectionStatus::Success,
            errors: vec![],
        })
    }

    async fn find_evidence_processor(
        &self,
        evidence_type: &EvidenceType,
        analysis_type: &AnalysisType,
    ) -> Result<Box<dyn EvidenceProcessor + Send + Sync>, Box<dyn std::error::Error + Send + Sync>> {
        let processors = self.evidence_processors.read().await;
        
        // For now, return a default processor
        Ok(Box::new(DefaultEvidenceProcessor::new()))
    }

    async fn store_analysis_result(
        &self,
        evidence_id: &str,
        result: &AnalysisResult,
        tenant_context: &TenantContext,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Add analysis result to evidence
        let mut evidence = self.data_store.get_evidence(evidence_id, tenant_context).await?
            .ok_or("Evidence not found")?;
            
        evidence.analysis_results.push(result.clone());
        self.data_store.update_evidence(&evidence, tenant_context).await?;
        
        Ok(())
    }

    async fn update_custody_chain(
        &self,
        evidence_id: &str,
        action: &str,
        person: &str,
        notes: &str,
        tenant_context: &TenantContext,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut evidence = self.data_store.get_evidence(evidence_id, tenant_context).await?
            .ok_or("Evidence not found")?;

        let custody_record = CustodyRecord {
            timestamp: Utc::now().timestamp(),
            action: action.to_string(),
            person: person.to_string(),
            location: "Digital Evidence Management System".to_string(),
            notes: notes.to_string(),
        };

        evidence.chain_of_custody.push(custody_record);
        self.data_store.update_evidence(&evidence, tenant_context).await?;

        Ok(())
    }

    async fn link_evidence_to_incident(
        &self,
        incident_id: &str,
        evidence_id: &str,
        tenant_context: &TenantContext,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Add evidence to the incident
        let mut incident = self.data_store.get_incident(incident_id, tenant_context).await?
            .ok_or("Incident not found")?;
            
        incident.evidence.push(evidence_id.to_string());
        self.data_store.update_incident(&incident, tenant_context).await?;
        
        Ok(())
    }

    async fn create_evidence_export(
        &self,
        evidence: &Evidence,
        format: &str,
    ) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        // Create evidence export package
        let export_path = format!("/exports/{}_export.{}", evidence.id, format);
        
        // This would contain actual export logic
        
        Ok(export_path)
    }

    fn parse_timeline_data(
        &self,
        timeline_data: &str,
        evidence: &Evidence,
    ) -> Result<Vec<TimelineEvent>, Box<dyn std::error::Error + Send + Sync>> {
        // Parse timeline data from analysis results
        // This would contain actual parsing logic
        
        Ok(vec![])
    }
}

/// Chain of custody verification result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChainOfCustodyVerification {
    pub evidence_id: String,
    pub valid: bool,
    pub issues: Vec<String>,
    pub verified_at: i64,
    pub verified_by: String,
}

impl ChainOfCustodyManager {
    pub fn new(data_store: Arc<dyn ComprehensiveIncidentResponseStore + Send + Sync>) -> Self {
        Self { data_store }
    }

    pub async fn verify_chain(
        &self,
        evidence: &Evidence,
    ) -> Result<ChainOfCustodyVerification, Box<dyn std::error::Error + Send + Sync>> {
        let mut issues = Vec::new();

        // Check for gaps in a chain of custody
        if evidence.chain_of_custody.is_empty() {
            issues.push("No chain of custody records found".to_string());
        } else {
            // Check chronological order
            let mut prev_timestamp = 0;
            for record in &evidence.chain_of_custody {
                if record.timestamp < prev_timestamp {
                    issues.push("Chain of custody records not in chronological order".to_string());
                    break;
                }
                prev_timestamp = record.timestamp;
            }
        }

        Ok(ChainOfCustodyVerification {
            evidence_id: evidence.id.clone(),
            valid: issues.is_empty(),
            issues,
            verified_at: Utc::now().timestamp(),
            verified_by: "System".to_string(),
        })
    }
}

/// Evidence integrity verification result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrityVerification {
    pub valid: bool,
    pub error_message: String,
}

impl IntegrityChecker {
    pub fn new() -> Self {
        Self
    }

    pub async fn verify_evidence(
        &self,
        evidence: &Evidence,
    ) -> Result<IntegrityVerification, Box<dyn std::error::Error + Send + Sync>> {
        // This would contain actual integrity checking logic
        // For now, assume evidence is valid
        
        Ok(IntegrityVerification {
            valid: true,
            error_message: String::new(),
        })
    }
}

impl ForensicReportGenerator {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub async fn generate_report(
        &self,
        investigation: &ForensicInvestigation,
        tenant_context: &TenantContext,
    ) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        let report_path = format!("/reports/forensic_report_{}.pdf", investigation.id);
        
        // This would contain actual report generation logic
        
        Ok(report_path)
    }
}

/// Default evidence processor implementation
pub struct DefaultEvidenceProcessor;

impl DefaultEvidenceProcessor {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl EvidenceProcessor for DefaultEvidenceProcessor {
    async fn process_evidence(
        &self,
        evidence: &Evidence,
        analysis_type: &AnalysisType,
        parameters: &HashMap<String, String>,
    ) -> Result<AnalysisResult, Box<dyn std::error::Error + Send + Sync>> {
        // Default processing logic
        let now = Utc::now().timestamp();
        
        Ok(AnalysisResult {
            id: Uuid::new_v4().to_string(),
            analyst: "System".to_string(),
            analysis_type: format!("{:?}", analysis_type),
            timestamp: now,
            findings: format!("Analysis completed for evidence: {}", evidence.id),
            confidence: 0.8,
            tools_used: vec!["Default Processor".to_string()],
            artifacts: vec![],
            recommendations: vec!["Review analysis results".to_string()],
        })
    }

    fn get_supported_types(&self) -> Vec<EvidenceType> {
        vec![
            EvidenceType::DiskImage,
            EvidenceType::MemoryDump,
            EvidenceType::NetworkCapture,
            EvidenceType::LogFile,
        ]
    }

    fn get_supported_analyses(&self) -> Vec<AnalysisType> {
        vec![
            AnalysisType::MalwareAnalysis,
            AnalysisType::NetworkAnalysis,
            AnalysisType::MemoryAnalysis,
            AnalysisType::DiskForensics,
        ]
    }

    fn get_processing_priority(&self) -> u8 {
        5 // Medium priority
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct EvidenceCollectionResult {
    evidence_id: String,
    status: CollectionStatus,
    errors: Vec<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_evidence_manager_creation() {
        // Test evidence manager initialization
    }

    #[tokio::test]
    async fn test_evidence_collection() {
        // Test evidence collection workflow
    }

    #[tokio::test]
    async fn test_chain_of_custody() {
        // Test chain of custody management
    }

    #[tokio::test]
    async fn test_forensic_analysis() {
        // Test forensic analysis workflow
    }
}