use crate::ocsf::{ClassUid, SeverityId, Observable, Enrichment};
use crate::ocsf_categories::*;
use crate::ocsf_event_classes::*;
use crate::ocsf_observables::*;
use crate::ocsf_normalization::*;
use serde::{Deserialize, Serialize};
use chrono::{Utc};
use std::collections::HashMap;

/// OCSF Integration with Threat Actor Analysis Modules
/// Provides standardized event generation from threat actor analysis

/// Threat Actor OCSF Integration
#[derive(Debug, Clone)]
pub struct ThreatActorOcsfIntegration {
    /// The observable manager
    pub observable_manager: ObservableManager,
    /// The event normalizer
    pub event_normalizer: EventNormalizer,
    /// The event serializer
    pub event_serializer: EventSerializer,
    /// Integration mappings
    pub integration_mappings: HashMap<String, IntegrationMapping>,
}

/// Integration Mapping
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrationMapping {
    /// The module name
    pub module_name: String,
    /// The event type
    pub event_type: String,
    /// The OCSF class
    pub ocsf_class: ClassUid,
    /// The field mappings
    pub field_mappings: HashMap<String, String>,
    /// The severity mapping
    pub severity_mapping: HashMap<String, SeverityId>,
}

/// Threat Intelligence Event Generator
#[derive(Debug, Clone)]
pub struct ThreatIntelEventGenerator {
    /// The integration
    pub integration: ThreatActorOcsfIntegration,
    /// Generated events
    pub generated_events: Vec<security_finding::SecurityFindingEvent>,
}

/// Behavioral Pattern OCSF Events
pub mod behavioral_ocsf {
    use super::*;

    /// Generate OCSF events from behavioral pattern analysis
    pub fn generate_behavioral_events(
        patterns: &[crate::behavioral_patterns::BehavioralPattern],
        integration: &mut ThreatActorOcsfIntegration,
    ) -> Vec<security_finding::SecurityFindingEvent> {
        let mut events = Vec::new();

        for pattern in patterns {
            let severity = match pattern.confidence {
                c if c >= 0.9 => SeverityId::Critical,
                c if c >= 0.7 => SeverityId::High,
                c if c >= 0.5 => SeverityId::Medium,
                _ => SeverityId::Low,
            };

            let mut event = security_finding_class::create_malware_finding(
                format!("Suspicious behavioral pattern detected: {}", pattern.pattern_type),
                pattern.pattern_type.clone().to_string(),
                "unknown".to_string(),
                pattern.confidence,
                severity,
            );

            // Add observables for behavioral indicators
            let behavior_observable = Observable {
                name: format!("behavioral_pattern_{}", pattern.pattern_id),
                value: pattern.pattern_type.to_string(),
                observable_type: "behavior".to_string(),
                type_id: 99, // Custom type for behavioral patterns
                reputation: Some(pattern.confidence),
                data: Some(serde_json::json!({
                    "pattern_id": pattern.pattern_id,
                    "description": pattern.description,
                    "indicators": pattern.indicators,
                    "confidence": pattern.confidence,
                    "first_observed": pattern.first_observed,
                    "last_observed": pattern.last_observed
                })),
                attributes: None,
            };

            event.base.add_observable(behavior_observable);

            // Add enrichment with threat intelligence
            let enrichment = Enrichment {
                name: "threat_intelligence".to_string(),
                value: pattern.pattern_type.clone().to_string(),
                enrichment_type: "behavioral_analysis".to_string(),
                data: Some(serde_json::json!({
                    "analysis_type": "behavioral_pattern",
                    "threat_level": if pattern.confidence > 0.8 { "high" } else { "medium" },
                    "recommended_action": "Investigate user activity and system logs"
                })),
            };

            event.base.add_enrichment(enrichment);

            events.push(event);
        }

        events
    }
}

/// Geographic Analysis OCSF Events
pub mod geographic_ocsf {
    use super::*;

    /// Generate OCSF events from geographic analysis
    pub fn generate_geographic_events(
        locations: &[crate::infrastructure_analysis::GeographicLocation],
        integration: &mut ThreatActorOcsfIntegration,
    ) -> Vec<network_activity::NetworkActivityEvent> {
        let mut events = Vec::new();

        for location in locations {
            if location.risk_score > 0.7 { // Only generate events for high-risk locations
                let severity = match location.risk_score {
                    r if r >= 0.9 => SeverityId::Critical,
                    r if r >= 0.8 => SeverityId::High,
                    _ => SeverityId::Medium,
                };

                let mut event = network_activity_class::create_suspicious_http_traffic(
                    "suspicious_ip".to_string(),
                    location.ip_address.clone().unwrap_or_else(|| "unknown".to_string()),
                    80,
                    format!("http://{}", location.ip_address.clone().unwrap_or_else(|| "unknown".to_string())),
                    "Suspicious User Agent".to_string(),
                    severity,
                );

                // Add geographic observables
                let geo_observable = Observable {
                    name: format!("geographic_location_{}", location.location_id),
                    value: location.ip_address.clone().unwrap_or_else(|| "unknown".to_string()),
                    observable_type: "ipv4".to_string(),
                    type_id: 2,
                    reputation: Some(location.risk_score),
                    data: Some(serde_json::json!({
                        "country": location.country,
                        "city": location.city,
                        "coordinates": location.coordinates,
                        "risk_score": location.risk_score,
                        "threat_actors": location.threat_actors_present
                    })),
                    attributes: None,
                };

                event.base.add_observable(geo_observable);

                events.push(event);
            }
        }

        events
    }
}

/// Incident Response OCSF Events
pub mod incident_response_ocsf {
    use super::*;

    /// Generate OCSF events from incident response activities
    pub fn generate_incident_events(
        incidents: &[crate::incident_response::Incident],
        integration: &mut ThreatActorOcsfIntegration,
    ) -> Vec<security_finding::SecurityFindingEvent> {
        let mut events = Vec::new();

        for incident in incidents {
            let severity = match incident.severity.to_string().as_str() {
                "critical" => SeverityId::Critical,
                "high" => SeverityId::High,
                "medium" => SeverityId::Medium,
                "low" => SeverityId::Low,
                _ => SeverityId::Informational,
            };

            let mut event = security_finding_class::create_unauthorized_access_finding(
                format!("Security incident: {}", incident.title),
                incident.assigned_to.clone().unwrap_or_else(|| "unassigned".to_string()),
                incident.description.clone(),
                "unauthorized_access".to_string(),
                severity,
            );

            // Add incident observables
            let incident_observable = Observable {
                name: format!("incident_{}", incident.incident_id),
                value: incident.title.clone(),
                observable_type: "incident".to_string(),
                type_id: 100, // Custom type for incidents
                reputation: Some(0.9),
                data: Some(serde_json::json!({
                    "incident_id": incident.incident_id,
                    "status": incident.status,
                    "priority": incident.priority,
                    "created_at": incident.created_at,
                    "updated_at": incident.created_at,
                    "affected_assets": incident.affected_assets
                })),
                attributes: None,
            };

            event.base.add_observable(incident_observable);

            events.push(event);
        }

        events
    }
}

/// Intelligence Sharing OCSF Events
pub mod intelligence_sharing_ocsf {
    use super::*;

    /// Generate OCSF events from intelligence sharing
    pub fn generate_intelligence_events(
        intelligence: &[crate::reputation_system::UpdateEventType],
        integration: &mut ThreatActorOcsfIntegration,
    ) -> Vec<security_finding::SecurityFindingEvent> {
        let mut events = Vec::new();

        for report in intelligence {
            let severity = match report.confidence {
                c if c >= 0.9 => SeverityId::Critical,
                c if c >= 0.7 => SeverityId::High,
                c if c >= 0.5 => SeverityId::Medium,
                _ => SeverityId::Low,
            };

            let mut event = security_finding_class::create_malware_finding(
                format!("Intelligence report: {}", report.title),
                "Unknown Threat Actor".to_string(),
                "intelligence_feed".to_string(),
                report.confidence,
                severity,
            );

            // Add intelligence observables
            let intel_observable = Observable {
                name: format!("intelligence_{}", report.report_id),
                value: report.title.clone(),
                observable_type: "intelligence".to_string(),
                type_id: 101, // Custom type for intelligence
                reputation: Some(report.confidence),
                data: Some(serde_json::json!({
                    "report_id": report.report_id,
                    "indicators": report.indicators,
                    "recommendations": report.recommendations,
                    "published_at": report.published_at
                })),
                attributes: None,
            };

            event.base.add_observable(intel_observable);

            events.push(event);
        }

        events
    }
}

/// Real-time Alerts OCSF Events
pub mod realtime_alerts_ocsf {
    use std::error::Error;
    use super::*;

    /// Generate OCSF events from real-time alerts
    pub fn generate_alert_events(
        alerts: &[crate::realtime_alerts::Alert],
        integration: &mut ThreatActorOcsfIntegration,
    ) -> Vec<security_finding::SecurityFindingEvent> {
        let mut events = Vec::new();

        for alert in alerts {
            let severity = match alert.severity.to_string().as_str() {
                "critical" => SeverityId::Critical,
                "high" => SeverityId::High,
                "medium" => SeverityId::Medium,
                "low" => SeverityId::Low,
                _ => SeverityId::Informational,
            };

            let mut event = security_finding_class::create_malware_finding(
                format!("Real-time alert: {}", alert.title),
                alert.alert_type.clone(),
                alert.source().clone(),
                alert.confidence,
                severity,
            );

            // Add alert observables
            let alert_observable = Observable {
                name: format!("alert_{}", alert.alert_id),
                value: alert.title.clone(),
                observable_type: "alert".to_string(),
                type_id: 102, // Custom type for alerts
                reputation: Some(alert.confidence),
                data: Some(serde_json::json!({
                    "alert_id": alert.alert_id,
                    "alert_type": alert.alert_type,
                    "source": alert.source,
                    "description": alert.description,
                    "triggered_at": alert.triggered_at,
                    "acknowledged": alert.acknowledged
                })),
                attributes: None,
            };

            event.base.add_observable(alert_observable);

            events.push(event);
        }

        events
    }
}

/// Risk Assessment OCSF Events
pub mod risk_assessment_ocsf {
    use super::*;

    /// Generate OCSF events from risk assessments
    pub fn generate_risk_events(
        assessments: &[crate::risk_assessment::RiskAssessment],
        integration: &mut ThreatActorOcsfIntegration,
    ) -> Vec<security_finding::SecurityFindingEvent> {
        let mut events = Vec::new();

        for assessment in assessments {
            let severity = match assessment.risk_scores.overall_score {
                s if s >= 9.0 => SeverityId::Critical,
                s if s >= 7.0 => SeverityId::High,
                s if s >= 5.0 => SeverityId::Medium,
                _ => SeverityId::Low,
            };

            let mut event = security_finding_class::create_unauthorized_access_finding(
                format!("Risk assessment: {:?}", assessment.target_entity),
                "system".to_string(),
                format!("Risk assessment completed with score {:.1} and level {:?}", assessment.risk_scores.overall_score, assessment.overall_risk_level),
                "risk_assessment".to_string(),
                severity,
            );

            // Add risk observables
            let risk_observable = Observable {
                name: format!("risk_assessment_{}", assessment.assessment_id),
                value: assessment.target_entity.clone(),
                observable_type: "risk".to_string(),
                type_id: 103, // Custom type for risk assessments
                reputation: Some(assessment.risk_scores.overall_score),
                data: Some(serde_json::json!({
                    "assessment_id": assessment.assessment_id,
                    "asset_name": assessment.target_entity,
                    "asset_type": format!("{:?}", assessment.assessment_type),
                    "overall_risk_level": format!("{:?}", assessment.overall_risk_level),
                    "risk_scores": assessment.risk_scores,
                    "mitigation_plan": assessment.mitigation_plan,
                    "assessed_by": assessment.assessed_by
                })),
                attributes: None,
            };

            event.base.add_observable(risk_observable);

            events.push(event);
        }

        events
    }
}

impl ThreatActorOcsfIntegration {
    /// Create a new OCSF integration
    pub fn new() -> Self {
        Self {
            observable_manager: ObservableManager::new(),
            event_normalizer: EventNormalizer::new(),
            event_serializer: EventSerializer::new(),
            integration_mappings: HashMap::new(),
        }
    }

    /// Add an integration mapping
    pub fn add_mapping(&mut self, mapping: IntegrationMapping) {
        self.integration_mappings.insert(mapping.module_name.clone(), mapping);
    }

    /// Generate OCSF events from threat actor analysis data
    pub fn generate_events_from_analysis(&mut self, analysis_data: serde_json::Value) -> Vec<security_finding::SecurityFindingEvent> {
        let mut events = Vec::new();

        // This would be expanded to handle different types of analysis data
        // For now, we'll create a generic security finding event

        if let Some(analysis_type) = analysis_data.get("type").and_then(|v| v.as_str()) {
            match analysis_type {
                "behavioral_pattern" => {
                    // Generate behavioral pattern events
                    if let Some(patterns) = analysis_data.get("patterns").and_then(|v| v.as_array()) {
                        for pattern in patterns {
                            if let Some(pattern_obj) = pattern.as_object() {
                                let severity = pattern_obj.get("confidence")
                                    .and_then(|v| v.as_f64())
                                    .map(|c| match c {
                                        c if c >= 0.9 => SeverityId::Critical,
                                        c if c >= 0.7 => SeverityId::High,
                                        c if c >= 0.5 => SeverityId::Medium,
                                        _ => SeverityId::Low,
                                    })
                                    .unwrap_or(SeverityId::Medium);

                                let title = pattern_obj.get("pattern_type")
                                    .and_then(|v| v.as_str())
                                    .unwrap_or("Unknown Pattern")
                                    .to_string();

                                let event = security_finding_class::create_malware_finding(
                                    format!("Analysis detected: {}", title),
                                    title.clone(),
                                    "analysis_result".to_string(),
                                    pattern_obj.get("confidence").and_then(|v| v.as_f64()).unwrap_or(0.5),
                                    severity,
                                );

                                events.push(event);
                            }
                        }
                    }
                },
                "network_anomaly" => {
                    // Generate network anomaly events
                    if let Some(anomalies) = analysis_data.get("anomalies").and_then(|v| v.as_array()) {
                        for anomaly in anomalies {
                            if let Some(anomaly_obj) = anomaly.as_object() {
                                let severity = anomaly_obj.get("severity")
                                    .and_then(|v| v.as_str())
                                    .map(|s| match s {
                                        "critical" => SeverityId::Critical,
                                        "high" => SeverityId::High,
                                        "medium" => SeverityId::Medium,
                                        _ => SeverityId::Low,
                                    })
                                    .unwrap_or(SeverityId::Medium);

                                let title = anomaly_obj.get("description")
                                    .and_then(|v| v.as_str())
                                    .unwrap_or("Network Anomaly")
                                    .to_string();

                                let event = security_finding_class::create_network_anomaly_finding(
                                    title,
                                    anomaly_obj.get("src_ip").and_then(|v| v.as_str()).unwrap_or("unknown").to_string(),
                                    anomaly_obj.get("dst_ip").and_then(|v| v.as_str()).unwrap_or("unknown").to_string(),
                                    anomaly_obj.get("dst_port").and_then(|v| v.as_i64()).unwrap_or(80) as i32,
                                    anomaly_obj.get("anomaly_type").and_then(|v| v.as_str()).unwrap_or("unknown").to_string(),
                                    severity,
                                );

                                events.push(event);
                            }
                        }
                    }
                },
                _ => {
                    // Generic security finding for unknown analysis types
                    let event = security_finding_class::create_malware_finding(
                        "Analysis result".to_string(),
                        analysis_type.to_string(),
                        "unknown".to_string(),
                        0.5,
                        SeverityId::Medium,
                    );
                    events.push(event);
                }
            }
        }

        events
    }

    /// Process and correlate observables from analysis results
    pub fn process_observables(&mut self, observables: Vec<Observable>) {
        for observable in observables {
            self.observable_manager.add_observable(observable);
        }

        // Create correlation rules for threat actor analysis
        let correlation_rule = CorrelationRule::exact_match(
            "threat_actor_correlation".to_string(),
            "Correlate threat actor indicators".to_string(),
            vec![2, 4, 5], // IP, Domain, URL
            vec![2, 4, 5], // IP, Domain, URL
            0.8,
        );

        self.observable_manager.add_correlation_rule(correlation_rule);
    }

    /// Generate threat intelligence report in OCSF format
    pub fn generate_threat_intel_report(&self, threat_data: serde_json::Value) -> Result<String, String> {
        let normalized_event = NormalizedEvent {
            event: threat_data,
            metadata: NormalizationMetadata {
                normalizer_version: "1.0.0".to_string(),
                timestamp: Utc::now(),
                source_type: "threat_intelligence".to_string(),
                applied_rules: vec!["threat_intel_normalization".to_string()],
                confidence: 0.9,
            },
            warnings: vec![],
            errors: vec![],
        };

        self.event_serializer.serialize(&normalized_event)
    }

    /// Export all observables as OCSF events
    pub fn export_observables_as_events(&self) -> Vec<security_finding::SecurityFindingEvent> {
        let mut events = Vec::new();

        for observable in &self.observable_manager.observables {
            let severity = match observable.data.as_ref()
                .and_then(|d| d.get("reputation"))
                .and_then(|r| r.as_f64())
                .unwrap_or(0.5) {
                r if r >= 0.9 => SeverityId::Critical,
                r if r >= 0.7 => SeverityId::High,
                r if r >= 0.5 => SeverityId::Medium,
                _ => SeverityId::Low,
            };

            let mut event = security_finding_class::create_malware_finding(
                format!("Observable: {}", observable.name),
                observable.observable_type.clone(),
                observable.value.clone(),
                observable.data.as_ref()
                    .and_then(|d| d.get("reputation"))
                    .and_then(|r| r.as_f64())
                    .unwrap_or(0.5),
                severity,
            );

            // Add the observable to the event
            event.base.add_observable(observable.clone());

            events.push(event);
        }

        events
    }
}

impl ThreatIntelEventGenerator {
    /// Create a new threat intelligence event generator
    pub fn new() -> Self {
        Self {
            integration: ThreatActorOcsfIntegration::new(),
            generated_events: Vec::new(),
        }
    }

    /// Generate events from behavioral patterns
    pub fn generate_from_behavioral_patterns(&mut self, patterns: &[crate::behavioral_patterns::BehavioralPattern]) {
        let events = behavioral_ocsf::generate_behavioral_events(patterns, &mut self.integration);
        self.generated_events.extend(events);
    }

    /// Generate events from geographic analysis
    pub fn generate_from_geographic_analysis(&mut self, locations: &[crate::infrastructure_analysis::GeographicLocation]) {
        // Note: This would create network activity events, but we're collecting them as security findings for consistency
        let network_events = geographic_ocsf::generate_geographic_events(locations, &mut self.integration);
        // Convert network events to security findings for unified collection
        for network_event in network_events {
            let finding_event = security_finding_class::create_network_anomaly_finding(
                network_event.base.message.unwrap_or_else(|| "Geographic threat detected".to_string()),
                "unknown".to_string(),
                "unknown".to_string(),
                80,
                "geographic_anomaly".to_string(),
                network_event.base.severity_id,
            );
            self.generated_events.push(finding_event);
        }
    }

    /// Generate events from incident response
    pub fn generate_from_incidents(&mut self, incidents: &[crate::incident_response::Incident]) {
        let events = incident_response_ocsf::generate_incident_events(incidents, &mut self.integration);
        self.generated_events.extend(events);
    }

    /// Generate events from intelligence reports
    pub fn generate_from_intelligence(&mut self, reports: &[crate::reputation_system::UpdateEventType]) {
        let events = intelligence_sharing_ocsf::generate_intelligence_events(reports, &mut self.integration);
        self.generated_events.extend(events);
    }

    /// Generate events from alerts
    pub fn generate_from_alerts(&mut self, alerts: &[crate::realtime_alerts::Alert]) {
        let events = realtime_alerts_ocsf::generate_alert_events(alerts, &mut self.integration);
        self.generated_events.extend(events);
    }

    /// Generate events from risk assessments
    pub fn generate_from_risk_assessments(&mut self, assessments: &[crate::risk_assessment::RiskAssessment]) {
        let events = risk_assessment_ocsf::generate_risk_events(assessments, &mut self.integration);
        self.generated_events.extend(events);
    }

    /// Get all generated events
    pub fn get_events(&self) -> &[security_finding::SecurityFindingEvent] {
        &self.generated_events
    }

    /// Export events as JSON
    pub fn export_as_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(&self.generated_events)
    }

    /// Get event statistics
    pub fn get_statistics(&self) -> HashMap<String, usize> {
        let mut stats = HashMap::new();
        stats.insert("total_events".to_string(), self.generated_events.len());

        let mut severity_counts = HashMap::new();
        for event in &self.generated_events {
            let severity_str = match event.base.severity_id {
                SeverityId::Critical => "critical",
                SeverityId::High => "high",
                SeverityId::Medium => "medium",
                SeverityId::Low => "low",
                SeverityId::Informational => "informational",
                _ => "unknown",
            };

            *severity_counts.entry(severity_str.to_string()).or_insert(0) += 1;
        }

        for (severity, count) in severity_counts {
            stats.insert(format!("severity_{}", severity), count);
        }

        stats
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_threat_actor_integration_creation() {
        let integration = ThreatActorOcsfIntegration::new();
        assert!(integration.integration_mappings.is_empty());
        assert!(integration.observable_manager.observables.is_empty());
    }

    #[test]
    fn test_integration_mapping() {
        let mapping = IntegrationMapping {
            module_name: "behavioral_patterns".to_string(),
            event_type: "pattern_detected".to_string(),
            ocsf_class: ClassUid::SecurityFinding,
            field_mappings: HashMap::from([
                ("pattern_type".to_string(), "finding.title".to_string()),
                ("confidence".to_string(), "finding.confidence".to_string()),
            ]),
            severity_mapping: HashMap::from([
                ("high".to_string(), SeverityId::High),
                ("medium".to_string(), SeverityId::Medium),
                ("low".to_string(), SeverityId::Low),
            ]),
        };

        assert_eq!(mapping.module_name, "behavioral_patterns");
        assert_eq!(mapping.event_type, "pattern_detected");
        assert_eq!(mapping.field_mappings.len(), 2);
    }

    #[test]
    fn test_threat_intel_event_generator() {
        let generator = ThreatIntelEventGenerator::new();

        // Test empty generator
        assert_eq!(generator.get_events().len(), 0);

        // Test statistics
        let stats = generator.get_statistics();
        assert_eq!(stats.get("total_events"), Some(&0));
    }

    #[test]
    fn test_generate_events_from_analysis() {
        let mut integration = ThreatActorOcsfIntegration::new();

        let analysis_data = serde_json::json!({
            "type": "behavioral_pattern",
            "patterns": [
                {
                    "pattern_type": "suspicious_login",
                    "confidence": 0.85
                }
            ]
        });

        let events = integration.generate_events_from_analysis(analysis_data);
        assert_eq!(events.len(), 1);
        assert!(events[0].finding.title.contains("suspicious_login"));
    }

    #[test]
    fn test_process_observables() {
        let mut integration = ThreatActorOcsfIntegration::new();

        let observables = vec![
            Observable::ip("test_ip".to_string(), "192.168.1.100".to_string()),
            Observable::domain("test_domain".to_string(), "malicious.com".to_string()),
        ];

        integration.process_observables(observables);
        assert_eq!(integration.observable_manager.observables.len(), 2);
        assert_eq!(integration.observable_manager.correlation_rules.len(), 1);
    }

    #[test]
    fn test_export_observables_as_events() {
        let mut integration = ThreatActorOcsfIntegration::new();

        let observable = Observable::file("test_file".to_string(), "/malware.exe".to_string());
        integration.observable_manager.add_observable(observable);

        let events = integration.export_observables_as_events();
        assert_eq!(events.len(), 1);
        assert!(events[0].finding.title.contains("test_file"));
    }

    #[test]
    fn test_generate_threat_intel_report() {
        let integration = ThreatActorOcsfIntegration::new();

        let threat_data = serde_json::json!({
            "threat_actor": "APT-123",
            "indicators": ["192.168.1.100", "malicious.com"],
            "confidence": 0.9
        });

        let report = integration.generate_threat_intel_report(threat_data).unwrap();
        assert!(report.contains("APT-123"));
        assert!(report.contains("threat_intelligence"));
    }
}