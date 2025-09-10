//! Phantom MITRE Core - Extended Business Modules
//! 
//! This module contains 18 additional business-ready and customer-ready modules
//! that extend the core MITRE ATT&CK functionality.

pub mod threat_detection_engine;
pub mod attack_path_analyzer;
pub mod risk_assessment_calculator;
pub mod mitigation_planner;
pub mod threat_landscape_monitor;
pub mod indicator_enrichment;
pub mod campaign_tracker;
pub mod threat_hunting_assistant;
pub mod compliance_mapper;
pub mod detection_rule_generator;
pub mod threat_actor_profiler;
pub mod vulnerability_correlator;
pub mod incident_response_planner;
pub mod threat_intelligence_aggregator;
pub mod attack_simulator;
pub mod defense_coverage_analyzer;
pub mod threat_metrics_calculator;
pub mod security_posture_assessor;

// Re-export all modules for easy access
pub use threat_detection_engine::*;
pub use attack_path_analyzer::*;
pub use risk_assessment_calculator::*;
pub use mitigation_planner::*;
pub use threat_landscape_monitor::*;
pub use indicator_enrichment::*;
pub use campaign_tracker::*;
pub use threat_hunting_assistant::*;
pub use compliance_mapper::*;
pub use detection_rule_generator::*;
pub use threat_actor_profiler::*;
pub use vulnerability_correlator::*;
pub use incident_response_planner::*;
pub use threat_intelligence_aggregator::*;
pub use attack_simulator::*;
pub use defense_coverage_analyzer::*;
pub use threat_metrics_calculator::*;
pub use security_posture_assessor::*;