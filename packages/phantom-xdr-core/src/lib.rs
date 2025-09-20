// Phantom XDR Core - Advanced Detection and Response Engine
// Competing with Anomali's threat intelligence and detection capabilities

// Core engine modules (conditionally compiled for full builds)
#[cfg(not(feature = "napi"))]
mod types;
#[cfg(not(feature = "napi"))]
mod detection;
#[cfg(not(feature = "napi"))]
mod zero_trust;
#[cfg(not(feature = "napi"))]
mod threat_intelligence;
#[cfg(not(feature = "napi"))]
mod behavioral_analytics;
#[cfg(not(feature = "napi"))]
mod correlation;
#[cfg(not(feature = "napi"))]
mod response;
#[cfg(not(feature = "napi"))]
mod risk_assessment;
#[cfg(not(feature = "napi"))]
mod ml_engine;
#[cfg(not(feature = "napi"))]
mod crypto;
#[cfg(not(feature = "napi"))]
mod network_analysis;

// New modules - 12 additional business-ready modules
#[cfg(not(feature = "napi"))]
mod asset_discovery;
#[cfg(not(feature = "napi"))]
mod compliance_audit;
#[cfg(not(feature = "napi"))]
mod data_loss_prevention;
#[cfg(not(feature = "napi"))]
mod email_security;
#[cfg(not(feature = "napi"))]
mod endpoint_protection;
#[cfg(not(feature = "napi"))]
mod forensics_investigation;
#[cfg(not(feature = "napi"))]
mod identity_access_management;
#[cfg(not(feature = "napi"))]
mod incident_response;
#[cfg(not(feature = "napi"))]
mod malware_analysis;
#[cfg(not(feature = "napi"))]
mod network_segmentation;
#[cfg(not(feature = "napi"))]
mod security_orchestration;
#[cfg(not(feature = "napi"))]
mod vulnerability_scanning;

// 18 additional enterprise-ready modules
#[cfg(not(feature = "napi"))]
mod advanced_analytics;
#[cfg(not(feature = "napi"))]
mod api_security;
#[cfg(not(feature = "napi"))]
mod cloud_security;
#[cfg(not(feature = "napi"))]
mod container_security;
#[cfg(not(feature = "napi"))]
mod deception_technology;
#[cfg(not(feature = "napi"))]
mod digital_forensics;
#[cfg(not(feature = "napi"))]
mod insider_threat;
#[cfg(not(feature = "napi"))]
mod iot_security;
#[cfg(not(feature = "napi"))]
mod mobile_security;
#[cfg(not(feature = "napi"))]
mod orchestration_automation;
#[cfg(not(feature = "napi"))]
mod privacy_protection;
#[cfg(not(feature = "napi"))]
mod regulatory_compliance;
#[cfg(not(feature = "napi"))]
mod security_awareness;
#[cfg(not(feature = "napi"))]
mod supply_chain_security;
#[cfg(not(feature = "napi"))]
mod threat_simulation;
#[cfg(not(feature = "napi"))]
mod user_behavior_analytics;
#[cfg(not(feature = "napi"))]
mod vulnerability_management;
#[cfg(not(feature = "napi"))]
mod zero_day_protection;

// NAPI wrapper for Node.js integration
mod napi_wrapper;

// Re-export NAPI wrapper for Node.js integration
#[cfg(feature = "napi")]
pub use napi_wrapper::PhantomXdrCore;

// For non-NAPI builds, provide a placeholder
#[cfg(not(feature = "napi"))]
pub struct PhantomXdrCore;

#[cfg(not(feature = "napi"))]
impl PhantomXdrCore {
    pub fn new() -> Self {
        Self
    }

    pub fn hello(&self, name: String) -> String {
        format!("Phantom XDR Core says hello to {name}")
    }
}