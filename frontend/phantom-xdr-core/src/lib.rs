// Phantom XDR Core - Advanced Detection and Response Engine
// Competing with Anomali's threat intelligence and detection capabilities

mod types;
mod detection;
mod zero_trust;
mod threat_intelligence;
mod behavioral_analytics;
mod correlation;
mod response;
mod risk_assessment;
mod ml_engine;
mod crypto;
mod network_analysis;

// New modules - 12 additional business-ready modules
mod asset_discovery;
mod compliance_audit;
mod data_loss_prevention;
mod email_security;
mod endpoint_protection;
mod forensics_investigation;
mod identity_access_management;

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use once_cell::sync::Lazy;
use crate::types::*;
use crate::detection::{DetectionEngine, DetectionEngineTrait, DetectionResult};
use crate::zero_trust::{ZeroTrustEngine, ZeroTrustEngineTrait};
use crate::threat_intelligence::{ThreatIntelligence, ThreatIntelligenceTrait, FeedUpdateResult};
use crate::behavioral_analytics::{BehavioralAnalytics, BehavioralAnalyticsTrait, BehavioralAnalysisResult};
use crate::correlation::{CorrelationEngine, CorrelationEngineTrait};
use crate::response::{ResponseEngine, ResponseEngineTrait};
use crate::risk_assessment::{RiskAssessmentEngine, RiskAssessmentEngineTrait};
use crate::ml_engine::{MLEngine, MLEngineTrait};
use crate::network_analysis::{NetworkAnalyzer, NetworkAnalyzerTrait};

// New module imports
use crate::asset_discovery::{AssetDiscoveryEngine, AssetDiscoveryTrait};
use crate::compliance_audit::{ComplianceAuditEngine, ComplianceAuditTrait};
use crate::data_loss_prevention::{DataLossPreventionEngine, DataLossPreventionTrait};
use crate::email_security::{EmailSecurityGateway, EmailSecurityTrait};
use crate::endpoint_protection::{EndpointProtectionPlatform, EndpointProtectionTrait};
use crate::forensics_investigation::{ForensicsInvestigationEngine, ForensicsInvestigationTrait};
use crate::identity_access_management::{IdentityAccessManagementEngine, IdentityAccessManagementTrait};

// Global XDR Engine instance
static XDR_ENGINE: Lazy<Arc<RwLock<XdrEngine>>> = Lazy::new(|| {
    Arc::new(RwLock::new(XdrEngine::new()))
});

#[derive(Clone)]
pub struct XdrEngine {
    detection_engine: detection::DetectionEngine,
    zero_trust_engine: zero_trust::ZeroTrustEngine,
    threat_intel: threat_intelligence::ThreatIntelligence,
    behavioral_analytics: behavioral_analytics::BehavioralAnalytics,
    correlation_engine: correlation::CorrelationEngine,
    response_engine: response::ResponseEngine,
    risk_engine: risk_assessment::RiskAssessmentEngine,
    ml_engine: ml_engine::MLEngine,
    network_analyzer: network_analysis::NetworkAnalyzer,
    
    // New engines - 12 additional modules
    asset_discovery_engine: asset_discovery::AssetDiscoveryEngine,
    compliance_audit_engine: compliance_audit::ComplianceAuditEngine,
    data_loss_prevention_engine: data_loss_prevention::DataLossPreventionEngine,
    email_security_gateway: email_security::EmailSecurityGateway,
    endpoint_protection_platform: endpoint_protection::EndpointProtectionPlatform,
    forensics_investigation_engine: forensics_investigation::ForensicsInvestigationEngine,
    identity_access_management_engine: identity_access_management::IdentityAccessManagementEngine,
}

impl XdrEngine {
    pub fn new() -> Self {
        Self {
            detection_engine: detection::DetectionEngine::new(),
            zero_trust_engine: zero_trust::ZeroTrustEngine::new(),
            threat_intel: threat_intelligence::ThreatIntelligence::new(),
            behavioral_analytics: behavioral_analytics::BehavioralAnalytics::new(),
            correlation_engine: correlation::CorrelationEngine::new(),
            response_engine: response::ResponseEngine::new(),
            risk_engine: risk_assessment::RiskAssessmentEngine::new(),
            ml_engine: ml_engine::MLEngine::new(),
            network_analyzer: network_analysis::NetworkAnalyzer::new(),
            
            // Initialize new engines
            asset_discovery_engine: asset_discovery::AssetDiscoveryEngine::new(),
            compliance_audit_engine: compliance_audit::ComplianceAuditEngine::new(),
            data_loss_prevention_engine: data_loss_prevention::DataLossPreventionEngine::new(),
            email_security_gateway: email_security::EmailSecurityGateway::new(),
            endpoint_protection_platform: endpoint_protection::EndpointProtectionPlatform::new(),
            forensics_investigation_engine: forensics_investigation::ForensicsInvestigationEngine::new(),
            identity_access_management_engine: identity_access_management::IdentityAccessManagementEngine::new(),
        }
    }
}

// Export functions to JavaScript

#[napi]
pub fn initialize_engine() -> String {
    "XDR Engine initialized successfully".to_string()
}

#[napi]
pub async fn process_threat_indicator(indicator: ThreatIndicator) -> Result<DetectionResult> {
    let engine = XDR_ENGINE.read().await;
    let result = engine.detection_engine.process_indicator(indicator).await;
    Ok(result)
}

#[napi]
pub async fn evaluate_zero_trust_policy(request: AccessRequest) -> Result<AccessDecision> {
    let engine = XDR_ENGINE.read().await;
    let result = engine.zero_trust_engine.evaluate_access(request).await;
    Ok(result)
}

#[napi]
pub async fn analyze_behavioral_pattern(activity: Activity) -> Result<BehavioralAnalysisResult> {
    let engine = XDR_ENGINE.read().await;
    let result = engine.behavioral_analytics.analyze_activity(activity).await;
    Ok(result)
}

#[napi]
pub async fn correlate_events(events: Vec<SecurityEvent>) -> Result<Vec<Correlation>> {
    let engine = XDR_ENGINE.read().await;
    let correlations = engine.correlation_engine.find_correlations(events).await;
    Ok(correlations)
}

#[napi]
pub async fn assess_risk(entity: Entity) -> Result<RiskAssessment> {
    let engine = XDR_ENGINE.read().await;
    let assessment = engine.risk_engine.assess_entity_risk(entity).await;
    Ok(assessment)
}

#[napi]
pub async fn predict_threats(input: PredictionInput) -> Result<Prediction> {
    let engine = XDR_ENGINE.read().await;
    let prediction = engine.ml_engine.predict_threat(input).await;
    Ok(prediction)
}

#[napi]
pub async fn analyze_network_traffic(traffic: NetworkTraffic) -> Result<TrafficAnalysis> {
    let engine = XDR_ENGINE.read().await;
    let analysis = engine.network_analyzer.analyze_traffic(traffic).await;
    Ok(analysis)
}

#[napi]
pub async fn execute_automated_response(action: ResponseAction) -> Result<ActionResult> {
    let engine = XDR_ENGINE.read().await;
    let result = engine.response_engine.execute_action(action).await;
    Ok(result)
}

#[napi]
pub async fn update_threat_feeds() -> Result<FeedUpdateResult> {
    let mut engine = XDR_ENGINE.write().await;
    let result = engine.threat_intel.update_feeds().await;
    Ok(result)
}

#[napi]
pub async fn get_engine_status() -> Result<EngineStatus> {
    let engine = XDR_ENGINE.read().await;
    let status = EngineStatus {
        detection_engine: engine.detection_engine.get_status().await,
        zero_trust_engine: engine.zero_trust_engine.get_status().await,
        threat_intelligence: engine.threat_intel.get_status().await,
        behavioral_analytics: engine.behavioral_analytics.get_status().await,
        correlation_engine: engine.correlation_engine.get_status().await,
        response_engine: engine.response_engine.get_status().await,
        risk_engine: engine.risk_engine.get_status().await,
        ml_engine: engine.ml_engine.get_status().await,
        network_analyzer: engine.network_analyzer.get_status().await,
        
        // New module statuses
        asset_discovery_engine: engine.asset_discovery_engine.get_status().await,
        compliance_audit_engine: engine.compliance_audit_engine.get_status().await,
        data_loss_prevention_engine: engine.data_loss_prevention_engine.get_status().await,
        email_security_gateway: engine.email_security_gateway.get_status().await,
        endpoint_protection_platform: engine.endpoint_protection_platform.get_status().await,
        forensics_investigation_engine: engine.forensics_investigation_engine.get_status().await,
        identity_access_management_engine: engine.identity_access_management_engine.get_status().await,
        
        last_updated: chrono::Utc::now().timestamp(),
    };
    Ok(status)
}

// Legacy hello function for testing
#[napi]
pub fn hello(name: String) -> String {
    format!("Phantom XDR Core says hello to {name}")
}

// ====================
// Asset Discovery APIs
// ====================

#[napi]
pub async fn discover_assets(scan_config: crate::asset_discovery::AssetScanConfig) -> Result<crate::asset_discovery::AssetDiscoveryResult> {
    let engine = XDR_ENGINE.read().await;
    let result = engine.asset_discovery_engine.discover_assets(scan_config).await;
    Ok(result)
}

#[napi]
pub async fn get_asset_by_id(asset_id: String) -> Result<Option<crate::asset_discovery::Asset>> {
    let engine = XDR_ENGINE.read().await;
    let asset = engine.asset_discovery_engine.get_asset_by_id(&asset_id).await;
    Ok(asset)
}

#[napi]
pub async fn get_all_assets() -> Result<Vec<crate::asset_discovery::Asset>> {
    let engine = XDR_ENGINE.read().await;
    let assets = engine.asset_discovery_engine.get_all_assets().await;
    Ok(assets)
}

#[napi]
pub async fn search_assets(query: String) -> Result<Vec<crate::asset_discovery::Asset>> {
    let engine = XDR_ENGINE.read().await;
    let assets = engine.asset_discovery_engine.search_assets(&query).await;
    Ok(assets)
}

#[napi]
pub async fn get_assets_by_criticality(criticality: String) -> Result<Vec<crate::asset_discovery::Asset>> {
    let engine = XDR_ENGINE.read().await;
    let assets = engine.asset_discovery_engine.get_assets_by_criticality(&criticality).await;
    Ok(assets)
}

#[napi]
pub async fn update_asset_inventory(asset: crate::asset_discovery::Asset) -> Result<String> {
    let engine = XDR_ENGINE.read().await;
    match engine.asset_discovery_engine.update_asset_inventory(asset).await {
        Ok(_) => Ok("Asset inventory updated successfully".to_string()),
        Err(e) => Err(napi::Error::from_reason(e)),
    }
}

// ====================
// Compliance Audit APIs
// ====================

#[napi]
pub async fn run_compliance_scan(config: crate::compliance_audit::ComplianceScanConfig) -> Result<crate::compliance_audit::ComplianceResult> {
    let engine = XDR_ENGINE.read().await;
    let result = engine.compliance_audit_engine.run_compliance_scan(config).await;
    Ok(result)
}

#[napi]
pub async fn evaluate_control(control: crate::compliance_audit::ComplianceControl, evidence: crate::compliance_audit::Evidence) -> Result<crate::compliance_audit::ControlResult> {
    let engine = XDR_ENGINE.read().await;
    let result = engine.compliance_audit_engine.evaluate_control(control, evidence).await;
    Ok(result)
}

#[napi]
pub async fn generate_audit_report(framework: String, scope: String) -> Result<crate::compliance_audit::AuditReport> {
    let engine = XDR_ENGINE.read().await;
    let report = engine.compliance_audit_engine.generate_audit_report(&framework, &scope).await;
    Ok(report)
}

#[napi]
pub async fn get_compliance_framework(framework_id: String) -> Result<Option<crate::compliance_audit::ComplianceFramework>> {
    let engine = XDR_ENGINE.read().await;
    let framework = engine.compliance_audit_engine.get_framework(&framework_id).await;
    Ok(framework)
}

#[napi]
pub async fn list_compliance_frameworks() -> Result<Vec<crate::compliance_audit::ComplianceFramework>> {
    let engine = XDR_ENGINE.read().await;
    let frameworks = engine.compliance_audit_engine.list_frameworks().await;
    Ok(frameworks)
}

#[napi]
pub async fn get_compliance_dashboard() -> Result<String> {
    let engine = XDR_ENGINE.read().await;
    let dashboard = engine.compliance_audit_engine.get_compliance_dashboard().await;
    Ok(serde_json::to_string(&dashboard).unwrap_or_default())
}

// ====================
// Data Loss Prevention APIs
// ====================

#[napi]
pub async fn scan_data(scan_request: crate::data_loss_prevention::DlpScanRequest) -> Result<crate::data_loss_prevention::DlpScanResult> {
    let engine = XDR_ENGINE.read().await;
    let result = engine.data_loss_prevention_engine.scan_data(scan_request).await;
    Ok(result)
}

#[napi]
pub async fn classify_data(data: String) -> Result<crate::data_loss_prevention::DataClassification> {
    let engine = XDR_ENGINE.read().await;
    let classification = engine.data_loss_prevention_engine.classify_data(&data).await;
    Ok(classification)
}

#[napi]
pub async fn apply_dlp_policy(policy: crate::data_loss_prevention::DlpPolicy, data_context: crate::data_loss_prevention::DataContext) -> Result<crate::data_loss_prevention::PolicyDecision> {
    let engine = XDR_ENGINE.read().await;
    let decision = engine.data_loss_prevention_engine.apply_policy(policy, data_context).await;
    Ok(decision)
}

#[napi]
pub async fn get_all_dlp_policies() -> Result<Vec<crate::data_loss_prevention::DlpPolicy>> {
    let engine = XDR_ENGINE.read().await;
    let policies = engine.data_loss_prevention_engine.get_all_policies().await;
    Ok(policies)
}

#[napi]
pub async fn get_dlp_policy(policy_id: String) -> Result<Option<crate::data_loss_prevention::DlpPolicy>> {
    let engine = XDR_ENGINE.read().await;
    let policy = engine.data_loss_prevention_engine.get_policy(&policy_id).await;
    Ok(policy)
}

#[napi]
pub async fn update_dlp_policy(policy: crate::data_loss_prevention::DlpPolicy) -> Result<String> {
    let engine = XDR_ENGINE.read().await;
    match engine.data_loss_prevention_engine.update_policy(policy).await {
        Ok(_) => Ok("DLP policy updated successfully".to_string()),
        Err(e) => Err(napi::Error::from_reason(e)),
    }
}

#[napi]
pub async fn get_dlp_violations_by_policy(policy_id: String) -> Result<Vec<crate::data_loss_prevention::DlpViolation>> {
    let engine = XDR_ENGINE.read().await;
    let violations = engine.data_loss_prevention_engine.get_violations_by_policy(&policy_id).await;
    Ok(violations)
}

#[napi]
pub async fn get_recent_dlp_violations(hours: i64) -> Result<Vec<crate::data_loss_prevention::DlpViolation>> {
    let engine = XDR_ENGINE.read().await;
    let violations = engine.data_loss_prevention_engine.get_recent_violations(hours).await;
    Ok(violations)
}
