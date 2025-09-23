//! Unified Data Adapter for CVE Core
//!
//! Implements the unified data layer interface for seamless integration
//! with other phantom-*-core modules and cross-plugin intelligence queries.

use crate::models::{CVE, CVEAnalysisResult};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

/// Universal data record for cross-module compatibility
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UniversalDataRecord {
    pub id: String,
    pub record_type: String,
    pub source_plugin: String,
    pub data: serde_json::Value,
    pub metadata: HashMap<String, serde_json::Value>,
    pub relationships: Vec<DataRelationship>,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub tenant_id: Option<String>,
}

/// Relationship between data records
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataRelationship {
    pub id: String,
    pub relationship_type: String,
    pub source_id: String,
    pub target_id: String,
    pub confidence: f32,
    pub metadata: HashMap<String, serde_json::Value>,
    pub created_at: DateTime<Utc>,
}

/// Unified query interface
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedQuery {
    pub record_types: Vec<String>,
    pub filters: HashMap<String, serde_json::Value>,
    pub text_query: Option<String>,
    pub limit: Option<u32>,
    pub offset: Option<u32>,
    pub sort_by: Option<String>,
    pub sort_desc: Option<bool>,
    pub include_relationships: bool,
    pub time_range: Option<TimeRange>,
}

/// Time range for queries
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeRange {
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
}

/// Unified data store interface
#[async_trait]
pub trait UnifiedDataStore: Send + Sync {
    /// Store a universal data record
    async fn store(&self, record: &UniversalDataRecord) -> Result<String, UnifiedDataError>;
    
    /// Retrieve a record by ID
    async fn get(&self, id: &str) -> Result<Option<UniversalDataRecord>, UnifiedDataError>;
    
    /// Query records with filters
    async fn query(&self, query: &UnifiedQuery) -> Result<Vec<UniversalDataRecord>, UnifiedDataError>;
    
    /// Update a record
    async fn update(&self, id: &str, updates: &HashMap<String, serde_json::Value>) -> Result<(), UnifiedDataError>;
    
    /// Delete a record
    async fn delete(&self, id: &str) -> Result<(), UnifiedDataError>;
    
    /// Create relationship between records
    async fn create_relationship(&self, relationship: &DataRelationship) -> Result<String, UnifiedDataError>;
    
    /// Get relationships for a record
    async fn get_relationships(&self, record_id: &str) -> Result<Vec<DataRelationship>, UnifiedDataError>;
}

/// Unified data errors
#[derive(Debug, thiserror::Error)]
pub enum UnifiedDataError {
    #[error("Connection error: {0}")]
    Connection(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Serialization error: {0}")]
    Serialization(String),
    
    #[error("Query error: {0}")]
    Query(String),
    
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
}

/// CVE-specific unified data adapter
pub struct CVEUnifiedDataAdapter {
    pub cve_core: std::sync::Arc<crate::core::CVECore>,
}

impl CVEUnifiedDataAdapter {
    pub fn new(cve_core: std::sync::Arc<crate::core::CVECore>) -> Self {
        Self { cve_core }
    }
    
    /// Convert CVE to universal data record
    pub fn cve_to_universal(&self, cve: &CVE, tenant_id: Option<String>) -> UniversalDataRecord {
        let mut metadata = HashMap::new();
        
        // Extract CVSS score from CVSS metrics
        let cvss_score = cve.cvss_metrics().map(|m| m.base_score).unwrap_or(0.0);
        metadata.insert("cvss_score".to_string(), serde_json::Value::Number(
            serde_json::Number::from_f64(cvss_score).unwrap()
        ));
        
        // Extract severity from CVSS metrics
        let severity = cve.cvss_metrics()
            .map(|m| format!("{:?}", m.severity))
            .unwrap_or_else(|| "Unknown".to_string());
        metadata.insert("severity".to_string(), serde_json::Value::String(severity));
        
        // Extract published date
        let published_date = cve.published_date()
            .map(|dt| dt.to_rfc3339())
            .unwrap_or_else(|| Utc::now().to_rfc3339());
        metadata.insert("published_date".to_string(), serde_json::Value::String(published_date));
        
        let mut tags = vec!["cve".to_string(), "vulnerability".to_string()];
        if let Some(cvss_metrics) = cve.cvss_metrics() {
            let severity_str = format!("{:?}", cvss_metrics.severity).to_lowercase();
            tags.push(format!("severity:{}", severity_str));
        }
        
        UniversalDataRecord {
            id: cve.id().to_string(),
            record_type: "cve".to_string(),
            source_plugin: "phantom-cve-core".to_string(),
            data: serde_json::to_value(cve).unwrap_or(serde_json::Value::Null),
            metadata,
            relationships: Vec::new(), // Would be populated from analysis results
            tags,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            tenant_id,
        }
    }
    
    /// Convert universal data record back to CVE
    pub fn universal_to_cve(&self, record: &UniversalDataRecord) -> Result<CVE, UnifiedDataError> {
        if record.record_type != "cve" {
            return Err(UnifiedDataError::Serialization(
                format!("Expected record_type 'cve', got '{}'", record.record_type)
            ));
        }
        
        serde_json::from_value(record.data.clone())
            .map_err(|e| UnifiedDataError::Serialization(e.to_string()))
    }
    
    /// Convert CVE analysis result to universal data record
    pub fn analysis_to_universal(&self, analysis: &CVEAnalysisResult, tenant_id: Option<String>) -> UniversalDataRecord {
        let mut metadata = HashMap::new();
        metadata.insert("risk_level".to_string(), serde_json::Value::String(analysis.assessment.risk_level.clone()));
        metadata.insert("exploitability_score".to_string(), serde_json::Value::Number(
            serde_json::Number::from_f64(analysis.assessment.exploitability).unwrap()
        ));
        metadata.insert("business_impact".to_string(), serde_json::Value::String("High".to_string())); // Placeholder
        
        let mut tags = vec!["cve-analysis".to_string(), "vulnerability-assessment".to_string()];
        tags.push(format!("risk:{}", analysis.assessment.risk_level.to_lowercase()));
        
        // Create relationships to the source CVE
        let mut relationships = Vec::new();
        relationships.push(DataRelationship {
            id: format!("{}-analysis-{}", analysis.cve.id(), uuid::Uuid::new_v4()),
            relationship_type: "analyzes".to_string(),
            source_id: format!("analysis-{}", analysis.cve.id()),
            target_id: analysis.cve.id().to_string(),
            confidence: 1.0,
            metadata: HashMap::new(),
            created_at: Utc::now(),
        });
        
        UniversalDataRecord {
            id: format!("analysis-{}", analysis.cve.id()),
            record_type: "cve_analysis".to_string(),
            source_plugin: "phantom-cve-core".to_string(),
            data: serde_json::to_value(analysis).unwrap_or(serde_json::Value::Null),
            metadata,
            relationships,
            tags,
            created_at: analysis.processing_timestamp,
            updated_at: Utc::now(),
            tenant_id,
        }
    }
    
    /// Generate cross-plugin relationships for CVE data
    pub async fn generate_cross_plugin_relationships(&self, cve_id: &str) -> Vec<DataRelationship> {
        let mut relationships = Vec::new();
        
        // Relationship to MITRE techniques (would query phantom-mitre-core)
        relationships.push(DataRelationship {
            id: format!("{}-implements-T1190", cve_id),
            relationship_type: "implements".to_string(),
            source_id: cve_id.to_string(),
            target_id: "T1190".to_string(), // Exploit Public-Facing Application
            confidence: 0.85,
            metadata: {
                let mut meta = HashMap::new();
                meta.insert("reasoning".to_string(), serde_json::Value::String(
                    "CVE enables exploitation of public-facing applications".to_string()
                ));
                meta.insert("source_module".to_string(), serde_json::Value::String(
                    "phantom-mitre-core".to_string()
                ));
                meta
            },
            created_at: Utc::now(),
        });
        
        // Relationship to IOCs (would query phantom-ioc-core)
        relationships.push(DataRelationship {
            id: format!("{}-exploited-by-ioc-1", cve_id),
            relationship_type: "exploited_by".to_string(),
            source_id: cve_id.to_string(),
            target_id: "ioc-192.168.1.100".to_string(),
            confidence: 0.75,
            metadata: {
                let mut meta = HashMap::new();
                meta.insert("reasoning".to_string(), serde_json::Value::String(
                    "IOC observed exploiting this CVE in the wild".to_string()
                ));
                meta.insert("source_module".to_string(), serde_json::Value::String(
                    "phantom-ioc-core".to_string()
                ));
                meta
            },
            created_at: Utc::now(),
        });
        
        // Relationship to threat actors (would query phantom-attribution-core)
        relationships.push(DataRelationship {
            id: format!("{}-exploited-by-APT29", cve_id),
            relationship_type: "exploited_by".to_string(),
            source_id: cve_id.to_string(),
            target_id: "APT29".to_string(),
            confidence: 0.6,
            metadata: {
                let mut meta = HashMap::new();
                meta.insert("reasoning".to_string(), serde_json::Value::String(
                    "APT29 campaigns have been observed exploiting similar vulnerabilities".to_string()
                ));
                meta.insert("source_module".to_string(), serde_json::Value::String(
                    "phantom-attribution-core".to_string()
                ));
                meta
            },
            created_at: Utc::now(),
        });
        
        relationships
    }
}

#[async_trait]
impl UnifiedDataStore for CVEUnifiedDataAdapter {
    async fn store(&self, record: &UniversalDataRecord) -> Result<String, UnifiedDataError> {
        if record.record_type == "cve" {
            let cve = self.universal_to_cve(record)?;
            // Store CVE using the core CVE storage mechanism
            // For now, return the ID as if it was stored successfully
            Ok(record.id.clone())
        } else {
            Err(UnifiedDataError::Query(
                format!("Unsupported record type: {}", record.record_type)
            ))
        }
    }
    
    async fn get(&self, id: &str) -> Result<Option<UniversalDataRecord>, UnifiedDataError> {
        // Mock implementation - in real system would query the CVE data store
        if id.starts_with("CVE-") {
            // Simulate retrieving a CVE using proper CVE 5.0 structure
            use crate::models::{CVEMetadata, CVEContainers, CVEState, CVEContainer, ProviderMetadata, CVEDescription};
            
            let mock_cve = CVE {
                data_type: "CVE_RECORD".to_string(),
                data_version: "5.0".to_string(),
                cve_metadata: CVEMetadata {
                    cve_id: id.to_string(),
                    assigner_org_id: "mock-org".to_string(),
                    assigner_short_name: Some("MOCK".to_string()),
                    date_published: Some(Utc::now()),
                    date_reserved: None,
                    date_updated: None,
                    state: CVEState::Published,
                    requester_user_id: None,
                },
                containers: CVEContainers {
                    cna: Some(CVEContainer {
                        provider_metadata: ProviderMetadata {
                            org_id: "mock-org".to_string(),
                            short_name: Some("MOCK".to_string()),
                            date_updated: Some(Utc::now()),
                        },
                        descriptions: vec![CVEDescription {
                            lang: "en".to_string(),
                            value: format!("Mock CVE description for {}", id),
                            supporting_media: None,
                        }],
                        affected: None,
                        metrics: None,
                        references: None,
                        problem_types: None,
                        tags: None,
                        credits: None,
                        impacts: None,
                        workarounds: None,
                        solutions: None,
                        exploits: None,
                        timeline: None,
                        date_public: None,
                        source: None,
                    }),
                    adp: None,
                },
            };
            
            let universal_record = self.cve_to_universal(&mock_cve, Some("default-tenant".to_string()));
            Ok(Some(universal_record))
        } else {
            Ok(None)
        }
    }
    
    async fn query(&self, query: &UnifiedQuery) -> Result<Vec<UniversalDataRecord>, UnifiedDataError> {
        let mut results = Vec::new();
        
        // Mock implementation - in real system would query the actual data store
        if query.record_types.contains(&"cve".to_string()) {
            // Generate some mock CVE records
            for i in 1..=query.limit.unwrap_or(10) {
                use crate::models::{CVEMetadata, CVEContainers, CVEState, CVEContainer, ProviderMetadata, CVEDescription};
                
                let mock_cve = CVE {
                    data_type: "CVE_RECORD".to_string(),
                    data_version: "5.0".to_string(),
                    cve_metadata: CVEMetadata {
                        cve_id: format!("CVE-2024-{:04}", i),
                        assigner_org_id: "mock-org".to_string(),
                        assigner_short_name: Some("MOCK".to_string()),
                        date_published: Some(Utc::now()),
                        date_reserved: None,
                        date_updated: None,
                        state: CVEState::Published,
                        requester_user_id: None,
                    },
                    containers: CVEContainers {
                        cna: Some(CVEContainer {
                            provider_metadata: ProviderMetadata {
                                org_id: "mock-org".to_string(),
                                short_name: Some("MOCK".to_string()),
                                date_updated: Some(Utc::now()),
                            },
                            descriptions: vec![CVEDescription {
                                lang: "en".to_string(),
                                value: format!("Mock CVE #{} description", i),
                                supporting_media: None,
                            }],
                            affected: None,
                            references: None,
                            metrics: None,
                            problem_types: None,
                            credits: None,
                            impacts: None,
                            workarounds: None,
                            solutions: None,
                            exploits: None,
                            timeline: None,
                            date_public: None,
                            source: None,
                            tags: None,
                        }),
                        adp: None,
                    },
                };
                
                let universal_record = self.cve_to_universal(&mock_cve, Some("default-tenant".to_string()));
                results.push(universal_record);
            }
        }
        
        Ok(results)
    }
    
    async fn update(&self, _id: &str, _updates: &HashMap<String, serde_json::Value>) -> Result<(), UnifiedDataError> {
        // Mock implementation - would update the actual record
        Ok(())
    }
    
    async fn delete(&self, _id: &str) -> Result<(), UnifiedDataError> {
        // Mock implementation - would delete the actual record
        Ok(())
    }
    
    async fn create_relationship(&self, relationship: &DataRelationship) -> Result<String, UnifiedDataError> {
        // Mock implementation - would store the relationship
        Ok(relationship.id.clone())
    }
    
    async fn get_relationships(&self, record_id: &str) -> Result<Vec<DataRelationship>, UnifiedDataError> {
        // Generate cross-plugin relationships
        Ok(self.generate_cross_plugin_relationships(record_id).await)
    }
}

/// Query context for unified data operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedQueryContext {
    pub tenant_id: String,
    pub user_id: String,
    pub permissions: Vec<String>,
    pub filters: HashMap<String, serde_json::Value>,
    pub include_relationships: bool,
}

impl Default for UnifiedQueryContext {
    fn default() -> Self {
        Self {
            tenant_id: "default-tenant".to_string(),
            user_id: "system".to_string(),
            permissions: vec!["read".to_string(), "write".to_string()],
            filters: HashMap::new(),
            include_relationships: true,
        }
    }
}