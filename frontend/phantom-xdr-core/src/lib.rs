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
        last_updated: chrono::Utc::now().timestamp(),
    };
    Ok(status)
}

// Legacy hello function for testing
#[napi]
pub fn hello(name: String) -> String {
    format!("Phantom XDR Core says hello to {name}")
}
