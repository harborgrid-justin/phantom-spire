// phantom-cve-core/src/lib.rs
// CVE processing library with N-API bindings
// Enhanced with enterprise standardization for Fortune 100 deployment readiness

mod models;
mod config;
mod threat_intelligence;
mod vulnerability_scorer;
mod exploit_predictor;
mod remediation_engine;
mod core;
mod data_stores;
mod integrations;
#[cfg(feature = "napi")]
mod napi_bindings;
mod storage;
#[cfg(any(feature = "actix-web", feature = "rocket"))]
pub mod web;
#[cfg(feature = "diesel")]
pub mod database;
#[cfg(feature = "reqwest")]
pub mod http;

// Enterprise standardization modules
mod enterprise;
mod unified_data_adapter;
mod business_readiness;

// Re-export public types and components from modules
pub use models::*;
pub use config::Config;
pub use threat_intelligence::ThreatIntelligenceEngine;
pub use vulnerability_scorer::VulnerabilityScorer;
pub use exploit_predictor::ExploitPredictor;
pub use remediation_engine::RemediationEngine;
pub use core::CVECore;
pub use data_stores::*;
#[cfg(feature = "napi")]
pub use napi_bindings::CVECoreNapi;

// Export NAPI bindings for Node.js integration
#[cfg(feature = "napi")]
use napi_derive::napi;

// Enterprise standardization exports
pub use enterprise::*;
pub use unified_data_adapter::*;
pub use business_readiness::*;

// External dependencies for enterprise features
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

// Enterprise traits from phantom-enterprise-standards (would be external dependency)
// For now, we'll define basic versions here and later import from phantom-enterprise-standards

/// Business readiness assessment for CVE Core
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVEBusinessReadinessAssessment {
    pub module_name: String,
    pub assessment_id: String,
    pub timestamp: DateTime<Utc>,
    pub overall_score: u32,
    pub readiness_level: CVEReadinessLevel,
    pub category_scores: HashMap<String, u32>,
    pub capabilities: HashMap<String, bool>,
    pub recommendations: Vec<String>,
    pub enterprise_blockers: Vec<String>,
    pub competitive_advantages: Vec<String>,
}

/// CVE-specific readiness levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CVEReadinessLevel {
    Starter,      // Basic CVE processing (0-40)
    Professional, // Business CVE intelligence (41-70)
    Enterprise,   // Fortune 100 CVE platform (71-100)
}

impl CVEReadinessLevel {
    pub fn from_score(score: u32) -> Self {
        match score {
            0..=40 => CVEReadinessLevel::Starter,
            41..=70 => CVEReadinessLevel::Professional,
            71..=100 => CVEReadinessLevel::Enterprise,
            _ => CVEReadinessLevel::Starter,
        }
    }
}