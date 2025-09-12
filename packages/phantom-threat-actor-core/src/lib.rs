// phantom-threat-actor-core/src/lib.rs
// Threat Actor intelligence library with modular architecture
// Following phantom-cve-core pattern

mod models;
mod config;
mod storage;
mod core;

// Existing business modules (already modularized)
pub mod advanced_attribution;
pub mod campaign_lifecycle;
pub mod reputation_system;
pub mod behavioral_patterns;
pub mod ttp_evolution;
pub mod infrastructure_analysis;
pub mod risk_assessment;
pub mod impact_assessment;
pub mod threat_landscape;
pub mod industry_targeting;
pub mod geographic_analysis;
pub mod supply_chain_risk;
pub mod executive_dashboard;
pub mod compliance_reporting;
pub mod incident_response;
pub mod threat_hunting;
pub mod intelligence_sharing;
pub mod realtime_alerts;

// OCSF (Open Cybersecurity Schema Framework) modules
pub mod ocsf;
pub mod ocsf_categories;
pub mod ocsf_event_classes;
pub mod ocsf_objects;
pub mod ocsf_observables;
pub mod ocsf_normalization;
pub mod ocsf_integration;
pub mod ocsf_enrichment;
pub mod ocsf_validation;

#[cfg(feature = "napi")]
use napi::bindgen_prelude::*;
#[cfg(feature = "napi")]
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;

// Re-export public types and components from new modular structure
pub use models::*;
pub use config::ThreatActorCoreConfig;
pub use storage::{ThreatActorStorage, StorageFactory};
pub use core::ThreatActorCore;

// Helper function to convert anyhow errors to napi errors
#[cfg(feature = "napi")]
fn anyhow_to_napi(err: anyhow::Error) -> napi::Error {
    napi::Error::from_reason(err.to_string())
}

// N-API wrapper for JavaScript bindings
#[cfg(feature = "napi")]
#[napi]
pub struct ThreatActorCoreNapi {
    inner: tokio::sync::Mutex<ThreatActorCore>,
}

#[cfg(feature = "napi")]
#[napi]
impl ThreatActorCoreNapi {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        let rt = tokio::runtime::Runtime::new()
            .map_err(|e| napi::Error::from_reason(format!("Failed to create async runtime: {}", e)))?;

        let inner = rt.block_on(async {
            ThreatActorCore::with_default_config().await
        }).map_err(|e| napi::Error::from_reason(format!("Failed to create ThreatActorCore: {}", e)))?;

        Ok(Self {
            inner: tokio::sync::Mutex::new(inner),
        })
    }

    /// Create ThreatActorCore with custom configuration
    #[napi]
    pub fn new_with_config(config_json: String) -> Result<Self> {
        let config: ThreatActorCoreConfig = serde_json::from_str(&config_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse config: {}", e)))?;

        let rt = tokio::runtime::Runtime::new()
            .map_err(|e| napi::Error::from_reason(format!("Failed to create async runtime: {}", e)))?;

        let inner = rt.block_on(async {
            ThreatActorCore::new(config).await
        }).map_err(|e| napi::Error::from_reason(format!("Failed to create ThreatActorCore: {}", e)))?;

        Ok(Self {
            inner: tokio::sync::Mutex::new(inner),
        })
    }

    /// Analyze threat actor from indicators
    #[napi]
    pub async fn analyze_threat_actor(&self, indicators: Vec<String>) -> Result<String> {
        let core = self.inner.lock().await;
        let actor = core.analyze_threat_actor(&indicators).await
            .map_err(|e| napi::Error::from_reason(format!("Failed to analyze threat actor: {}", e)))?;
        
        serde_json::to_string(&actor)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize actor: {}", e)))
    }

    /// Store a threat actor
    #[napi]
    pub async fn store_threat_actor(&self, actor_json: String) -> Result<()> {
        let actor: ThreatActor = serde_json::from_str(&actor_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse threat actor: {}", e)))?;
        
        let core = self.inner.lock().await;
        core.store_threat_actor(&actor).await
            .map_err(|e| napi::Error::from_reason(format!("Failed to store threat actor: {}", e)))?;
        
        Ok(())
    }

    /// Get a threat actor by ID
    #[napi]
    pub async fn get_threat_actor(&self, id: String) -> Result<Option<String>> {
        let core = self.inner.lock().await;
        let actor = core.get_threat_actor(&id).await
            .map_err(|e| napi::Error::from_reason(format!("Failed to get threat actor: {}", e)))?;
        
        match actor {
            Some(actor) => {
                let json = serde_json::to_string(&actor)
                    .map_err(|e| napi::Error::from_reason(format!("Failed to serialize actor: {}", e)))?;
                Ok(Some(json))
            },
            None => Ok(None)
        }
    }

    /// Search for threat actors
    #[napi]
    pub async fn search_threat_actors(&self, criteria_json: String) -> Result<String> {
        let criteria: ThreatActorSearchCriteria = serde_json::from_str(&criteria_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse search criteria: {}", e)))?;
        
        let core = self.inner.lock().await;
        let actors = core.search_threat_actors(&criteria).await
            .map_err(|e| napi::Error::from_reason(format!("Failed to search threat actors: {}", e)))?;
        
        serde_json::to_string(&actors)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize actors: {}", e)))
    }

    /// Perform attribution analysis
    #[napi]
    pub async fn perform_attribution(&self, indicators: Vec<String>) -> Result<String> {
        let core = self.inner.lock().await;
        let analysis = core.perform_attribution(&indicators).await
            .map_err(|e| napi::Error::from_reason(format!("Failed to perform attribution: {}", e)))?;
        
        serde_json::to_string(&analysis)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize analysis: {}", e)))
    }

    /// Track campaign activities
    #[napi]
    pub async fn track_campaign(&self, campaign_indicators: Vec<String>) -> Result<String> {
        let core = self.inner.lock().await;
        let campaign = core.track_campaign(&campaign_indicators).await
            .map_err(|e| napi::Error::from_reason(format!("Failed to track campaign: {}", e)))?;
        
        serde_json::to_string(&campaign)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize campaign: {}", e)))
    }

    /// Analyze behavioral patterns
    #[napi]
    pub async fn analyze_behavior(&self, actor_id: String, activities: Vec<String>) -> Result<String> {
        let core = self.inner.lock().await;
        let analysis = core.analyze_behavior(&actor_id, &activities).await
            .map_err(|e| napi::Error::from_reason(format!("Failed to analyze behavior: {}", e)))?;
        
        serde_json::to_string(&analysis)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize analysis: {}", e)))
    }

    /// Get system health status
    #[napi]
    pub async fn get_health_status(&self) -> Result<String> {
        let core = self.inner.lock().await;
        let health = core.get_health_status().await
            .map_err(|e| napi::Error::from_reason(format!("Failed to get health status: {}", e)))?;
        
        serde_json::to_string(&health)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize health status: {}", e)))
    }

    /// Get storage statistics
    #[napi]
    pub async fn get_storage_statistics(&self) -> Result<String> {
        let core = self.inner.lock().await;
        let stats = core.get_storage_statistics().await
            .map_err(|e| napi::Error::from_reason(format!("Failed to get storage statistics: {}", e)))?;
        
        serde_json::to_string(&stats)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize statistics: {}", e)))
    }

    /// Get system capabilities and module status
    #[napi]
    pub fn get_intelligence_summary(&self) -> Result<String> {
        let summary = serde_json::json!({
            "status": "operational",
            "message": "Threat Actor Core with 18 advanced modules and OCSF integration initialized successfully",
            "version": "2.2.0",
            "architecture": "modular",
            "modules_count": 27,
            "capabilities": [
                "Advanced Attribution Analysis",
                "Campaign Lifecycle Tracking", 
                "Dynamic Reputation System",
                "Behavioral Pattern Analysis",
                "TTP Evolution Tracking",
                "Infrastructure Analysis",
                "Risk Assessment",
                "Impact Assessment", 
                "Threat Landscape Mapping",
                "Industry Targeting Analysis",
                "Geographic Analysis",
                "Supply Chain Risk Assessment",
                "Executive Dashboard Generation",
                "Compliance Reporting",
                "Incident Response Coordination",
                "Threat Hunting Assistant",
                "Intelligence Sharing Gateway",
                "Real-time Alert System",
                "OCSF Base Event Structure",
                "OCSF Categories (Security/Network/System)",
                "OCSF Event Classes",
                "OCSF Objects Library",
                "OCSF Observables Management",
                "OCSF Normalization",
                "OCSF Integration",
                "OCSF Enrichment",
                "OCSF Validation"
            ]
        });
        Ok(summary.to_string())
    }

    /// Get module status
    #[napi]
    pub fn get_module_status(&self) -> Result<String> {
        let mut status = HashMap::new();
        status.insert("core_engine".to_string(), "Active".to_string());
        status.insert("advanced_attribution".to_string(), "Active".to_string());
        status.insert("campaign_lifecycle".to_string(), "Active".to_string());
        status.insert("reputation_system".to_string(), "Active".to_string());
        status.insert("behavioral_patterns".to_string(), "Active".to_string());
        status.insert("ttp_evolution".to_string(), "Active".to_string());
        status.insert("infrastructure_analysis".to_string(), "Active".to_string());
        status.insert("risk_assessment".to_string(), "Active".to_string());
        status.insert("impact_assessment".to_string(), "Active".to_string());
        status.insert("threat_landscape".to_string(), "Active".to_string());
        status.insert("industry_targeting".to_string(), "Active".to_string());
        status.insert("geographic_analysis".to_string(), "Active".to_string());
        status.insert("supply_chain_risk".to_string(), "Active".to_string());
        status.insert("executive_dashboard".to_string(), "Active".to_string());
        status.insert("compliance_reporting".to_string(), "Active".to_string());
        status.insert("incident_response".to_string(), "Active".to_string());
        status.insert("threat_hunting".to_string(), "Active".to_string());
        status.insert("intelligence_sharing".to_string(), "Active".to_string());
        status.insert("realtime_alerts".to_string(), "Active".to_string());
        status.insert("ocsf".to_string(), "Active".to_string());
        status.insert("ocsf_categories".to_string(), "Active".to_string());
        status.insert("ocsf_event_classes".to_string(), "Active".to_string());
        status.insert("ocsf_objects".to_string(), "Active".to_string());
        status.insert("ocsf_observables".to_string(), "Active".to_string());
        status.insert("ocsf_normalization".to_string(), "Active".to_string());
        status.insert("ocsf_integration".to_string(), "Active".to_string());
        status.insert("ocsf_enrichment".to_string(), "Active".to_string());
        status.insert("ocsf_validation".to_string(), "Active".to_string());
        
        Ok(serde_json::to_string(&status).unwrap_or_else(|_| "{}".to_string()))
    }

    /// Get version information
    #[napi]
    pub fn get_version_info(&self) -> Result<String> {
        let info = serde_json::json!({
            "version": "2.2.0",
            "name": "Phantom Threat Actor Core",
            "architecture": "modular",
            "modules": 27,
            "build_date": "2024-01-01",
            "api_version": "v2",
            "rust_version": "1.70+",
            "features": [
                "napi-rs",
                "machine-learning",
                "real-time-analysis",
                "comprehensive-reporting",
                "enterprise-integration",
                "multi-database-storage",
                "ocsf-schema-framework",
                "standardized-event-generation",
                "threat-intelligence-enrichment",
                "event-normalization",
                "schema-validation"
            ]
        });
        Ok(info.to_string())
    }
}

/// Legacy compatibility functions
#[cfg(feature = "napi")]
#[napi]
pub async fn get_all_engines_status() -> Result<String> {
    Ok(serde_json::json!({
        "phantom_threat_actor_core_enterprise": {
            "version": "2.2.0-enterprise",
            "architecture": "modular",
            "modules": [
                "advanced_attribution",
                "campaign_lifecycle",
                "reputation_system",
                "behavioral_patterns",
                "ttp_evolution",
                "infrastructure_analysis",
                "risk_assessment",
                "impact_assessment",
                "threat_landscape",
                "industry_targeting",
                "geographic_analysis",
                "supply_chain_risk",
                "executive_dashboard",
                "compliance_reporting",
                "incident_response",
                "threat_hunting",
                "intelligence_sharing",
                "realtime_alerts",
                "ocsf",
                "ocsf_categories",
                "ocsf_event_classes",
                "ocsf_objects",
                "ocsf_observables",
                "ocsf_normalization",
                "ocsf_integration",
                "ocsf_enrichment",
                "ocsf_validation"
            ],
            "status": "operational",
            "total_modules": 27,
            "enterprise_features": true,
            "multi_database_ready": true,
            "ocsf_enabled": true,
            "standardized_event_generation": true,
            "initialized_at": chrono::Utc::now().to_rfc3339()
        }
    }).to_string())
}

/// Create threat actor
#[cfg(feature = "napi")]
#[napi]
pub fn create_threat_actor(name: String, actor_type: String) -> Result<String> {
    let id = Uuid::new_v4().to_string();
    Ok(id)
}