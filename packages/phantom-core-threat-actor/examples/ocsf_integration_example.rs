//! # OCSF Integration Example
//!
//! This example demonstrates how to use the OCSF (Open Cybersecurity Schema Framework)
//! integration with the phantom-threat-actor-core package to generate standardized
//! cybersecurity events from threat actor analysis.
//!
//! The example shows:
//! 1. Setting up OCSF integration
//! 2. Generating events from behavioral patterns
//! 3. Generating events from geographic analysis
//! 4. Generating events from incident response
//! 5. Enriching events with threat intelligence
//! 6. Validating and normalizing events
//! 7. Exporting events in standardized format

use phantom_threat_actor_core::*;
use std::collections::HashMap;
use chrono::{Utc};
use phantom_threatactor_core::{behavioral_patterns, geographic_analysis, incident_response, intelligence_sharing, ocsf, ocsf_enrichment, ocsf_integration, ocsf_validation, realtime_alerts, risk_assessment, ThreatActorCore};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 Phantom Threat Actor Core - OCSF Integration Example");
    println!("====================================================");

    // Initialize the threat actor core
    let core = ThreatActorCore::with_default_config().await?;
    println!("✅ Threat Actor Core initialized");

    // Create OCSF integration
    let mut integration = ocsf_integration::ThreatActorOcsfIntegration::new();
    println!("✅ OCSF Integration initialized");

    // Create event generator
    let mut event_generator = ocsf_integration::ThreatIntelEventGenerator::new();
    println!("✅ Threat Intelligence Event Generator created");

    // Example 1: Generate events from behavioral patterns
    println!("\n📊 Example 1: Behavioral Pattern Analysis");
    println!("----------------------------------------");

    // Create sample behavioral patterns
    let behavioral_patterns = vec![
        behavioral_patterns::BehavioralPattern {
            pattern_id: "".to_string(),
            id: "pattern_001".to_string(),
            pattern_type: "suspicious_login".to_string(),
            pattern_name: "".to_string(),
            description: "Multiple failed login attempts followed by successful login".to_string(),
            indicators: vec![
                "5 failed logins".to_string(),
                "Unusual time pattern".to_string(),
                "Geographic anomaly".to_string(),
            ],
            confidence: 0.85,
            first_seen: Utc::now() - chrono::Duration::days(7),
            last_seen: Utc::now(),
            frequency: 12,
            first_observed: Default::default(),
            affected_users: vec!["user123".to_string(), "admin".to_string()],
            source_ips: vec!["192.168.1.100".to_string()],
            user_agents: vec!["Suspicious Browser/1.0".to_string()],
            metadata: HashMap::new(),
            last_observed: Default::default(),
            related_activities: vec![],
        },
        behavioral_patterns::BehavioralPattern {
            pattern_id: "".to_string(),
            id: "pattern_002".to_string(),
            pattern_type: "data_exfiltration".to_string(),
            pattern_name: "".to_string(),
            description: "Large data transfer to external IP".to_string(),
            indicators: vec![
                "10GB data transfer".to_string(),
                "External destination".to_string(),
                "Encrypted traffic".to_string(),
            ],
            confidence: 0.92,
            first_seen: Utc::now() - chrono::Duration::hours(2),
            last_seen: Utc::now(),
            frequency: 1,
            first_observed: Default::default(),
            affected_users: vec!["user456".to_string()],
            source_ips: vec!["10.0.0.50".to_string()],
            user_agents: vec![],
            metadata: HashMap::new(),
            last_observed: Default::default(),
            related_activities: vec![],
        },
    ];

    // Generate OCSF events from behavioral patterns
    event_generator.generate_from_behavioral_patterns(&behavioral_patterns);
    println!("✅ Generated {} events from behavioral patterns", behavioral_patterns.len());

    // Example 2: Generate events from geographic analysis
    println!("\n🌍 Example 2: Geographic Analysis");
    println!("-------------------------------");

    // Create sample geographic locations
    let geographic_locations = vec![
        geographic_analysis::GeographicLocation {
            id: "location_001".to_string(),
            ip_address: Some("185.220.101.1".to_string()),
            country: "Russia".to_string(),
            city: "Moscow".to_string(),
            coordinates: Some((55.7558, 37.6173)),
            risk_score: 0.95,
            threat_actors_present: vec!["APT-28".to_string(), "Fancy Bear".to_string()],
            known_attacks: vec!["SolarWinds".to_string(), "Colonial Pipeline".to_string()],
            last_activity: Utc::now() - chrono::Duration::hours(1),
            metadata: HashMap::new(),
        },
        geographic_analysis::GeographicLocation {
            id: "location_002".to_string(),
            ip_address: Some("104.236.0.1".to_string()),
            country: "United States".to_string(),
            city: "New York".to_string(),
            coordinates: Some((40.7128, -74.0060)),
            risk_score: 0.45,
            threat_actors_present: vec![],
            known_attacks: vec![],
            last_activity: Utc::now() - chrono::Duration::days(30),
            metadata: HashMap::new(),
        },
    ];

    // Generate OCSF events from geographic analysis
    event_generator.generate_from_geographic_analysis(&geographic_locations);
    println!("✅ Generated events from geographic analysis");

    // Example 3: Generate events from incident response
    println!("\n🚨 Example 3: Incident Response");
    println!("----------------------------");

    // Create sample incidents
    let incidents = vec![
        incident_response::Incident {
            incident_id: "".to_string(),
            id: "incident_001".to_string(),
            title: "Ransomware Attack Detected".to_string(),
            description: "Ransomware encryption detected on file server".to_string(),
            severity: "critical".to_string(),
            status: "active".to_string(),
            priority: "high".to_string(),
            timeline: vec![],
            evidence: vec![],
            remediation_actions: vec![],
            communication_log: vec![],
            tags: vec![],
            assigned_to: Some("security_team".to_string()),
            created_at: Utc::now() - chrono::Duration::hours(4),
            updated_at: Utc::now(),
            affected_assets: vec![
                "fileserver-01".to_string(),
                "database-01".to_string(),
            ],
            indicators: vec![
                "ransomware_signature".to_string(),
                "file_encryption".to_string(),
            ],
            mitigation_steps: vec![
                "Isolate affected systems".to_string(),
                "Backup verification".to_string(),
            ],
            metadata: HashMap::new(),
            incident_type: "".to_string(),
            threat_actors: vec![],
            last_updated: Default::default(),
            sla_breach_time: None,
        },
    ];

    // Generate OCSF events from incidents
    event_generator.generate_from_incidents(&incidents);
    println!("✅ Generated events from incident response");

    // Example 4: Generate events from intelligence reports
    println!("\n🕵️ Example 4: Intelligence Sharing");
    println!("--------------------------------");

    // Create sample intelligence reports
    let intelligence_reports = vec![
        intelligence_sharing::IntelligenceReport {
            id: "intel_001".to_string(),
            title: "New APT Campaign Targeting Financial Sector".to_string(),
            content: "Advanced persistent threat group targeting financial institutions...".to_string(),
            threat_actor: Some("APT-123".to_string()),
            confidence: 0.88,
            source: "trusted_partner".to_string(),
            published_at: Utc::now() - chrono::Duration::days(1),
            indicators: vec![
                "malware_hash_abc123".to_string(),
                "c2_domain_evil.com".to_string(),
            ],
            recommendations: vec![
                "Monitor for indicators".to_string(),
                "Update signatures".to_string(),
            ],
            tags: vec!["apt".to_string(), "financial".to_string()],
            metadata: HashMap::new(),
        },
    ];

    // Generate OCSF events from intelligence
    event_generator.generate_from_intelligence(&intelligence_reports);
    println!("✅ Generated events from intelligence reports");

    // Example 5: Generate events from alerts
    println!("\n⚠️ Example 5: Real-time Alerts");
    println!("---------------------------");

    // Create sample alerts
    let alerts = vec![
        realtime_alerts::Alert {
            alert_id: "".to_string(),
            id: "alert_001".to_string(),
            title: "Suspicious Network Traffic Detected".to_string(),
            description: "High volume of outbound traffic to known malicious IP".to_string(),
            alert_type: "network_anomaly".to_string(),
            severity: "high".to_string(),
            source: "network_monitor".to_string(),
            confidence: 0.91,
            triggered_at: Utc::now() - chrono::Duration::minutes(30),
            last_updated: Default::default(),
            event_details: SecurityEvent {
                event_id: "".to_string(),
                event_type: "".to_string(),
                timestamp: Default::default(),
                source_ip: None,
                user_agent: None,
                severity: AlertSeverity::Low,
                indicators: vec![],
                raw_data: Default::default(),
                business_impact: BusinessImpact::Low,
            },
            assigned_to: None,
            tags: vec![],
            escalation_level: 0,
            acknowledged: false,
            acknowledged_by: None,
            acknowledged_at: None,
            metadata: HashMap::new(),
            rule_id: "".to_string(),
            status: AlertStatus::New,
            response_actions: vec![],
        },
    ];

    // Generate OCSF events from alerts
    event_generator.generate_from_alerts(&alerts);
    println!("✅ Generated events from real-time alerts");

    // Example 6: Generate events from risk assessments
    println!("\n📈 Example 6: Risk Assessment");
    println!("---------------------------");

    // Create sample risk assessments
    let risk_assessments = vec![
        risk_assessment::RiskAssessment {
            assessment_id: "".to_string(),
            model_id: "".to_string(),
            target_entity: TargetEntity {
                entity_id: "".to_string(),
                entity_type: "".to_string(),
                name: "".to_string(),
                attributes: Default::default(),
            },
            assessment_type: AssessmentType::Initial,
            risk_scores: RiskScores {
                overall_score: 0.0,
                category_scores: Default::default(),
                factor_scores: Default::default(),
                confidence_level: 0.0,
            },
            impact_analysis: ImpactAnalysis {
                potential_impacts: vec![],
                business_impact_score: 0.0,
                operational_impact_score: 0.0,
                financial_impact_estimate: 0.0,
                recovery_time_estimate: Default::default(),
            },
            mitigation_plan: MitigationPlan {
                recommendations: vec![],
                priority_actions: vec![],
                timeline: vec![],
                resource_requirements: vec![],
                expected_risk_reduction: 0.0,
            },
            overall_risk_level: RiskLevel::Minimal,
            status: AssessmentStatus::Pending,
            created_at: Default::default(),
            id: "risk_001".to_string(),
            asset_name: "customer_database".to_string(),
            asset_type: "database".to_string(),
            asset_value: 1000000.0,
            threats: vec![
                risk_assessment::Threat {
                    threat_type: "data_breach".to_string(),
                    likelihood: 0.7,
                    impact: 0.9,
                    risk_score: 0.63,
                },
            ],
            vulnerabilities: vec![
                risk_assessment::Vulnerability {
                    vulnerability_id: "CVE-2023-12345".to_string(),
                    severity: "high".to_string(),
                    cvss_score: 8.5,
                    exploitability: 0.8,
                },
            ],
            overall_risk_score: 7.5,
            risk_level: "high".to_string(),
            risk_description: "High risk due to valuable asset and exploitable vulnerabilities".to_string(),
            mitigation_steps: vec![
                "Apply security patches".to_string(),
                "Implement access controls".to_string(),
                "Regular security audits".to_string(),
            ],
            assessed_at: Utc::now(),
            assessed_by: "security_team".to_string(),
            review_required: false,
            metadata: HashMap::new(),
            completed_at: None,
            context_data: Default::default(),
        },
    ];

    // Generate OCSF events from risk assessments
    event_generator.generate_from_risk_assessments(&risk_assessments);
    println!("✅ Generated events from risk assessments");

    // Get all generated events
    let events = event_generator.get_events();
    println!("\n📋 Generated Events Summary");
    println!("==========================");
    println!("Total events generated: {}", events.len());

    // Get statistics
    let stats = event_generator.get_statistics();
    println!("Event Statistics:");
    for (key, value) in stats {
        println!("  {}: {}", key, value);
    }

    // Example 7: Enrich events with threat intelligence
    println!("\n🔍 Example 7: Event Enrichment");
    println!("----------------------------");

    // Create enrichment engine
    let mut enrichment_engine = ocsf_enrichment::EnrichmentEngine::new();

    // Register threat intelligence provider
    let threat_provider = ocsf_enrichment::threat_intelligence::ThreatIntelProvider::new();
    enrichment_engine.register_provider(ocsf_enrichment::EnrichmentProvider {
        name: "threat_intel".to_string(),
        provider_type: "threat_intelligence".to_string(),
        version: "1.0.0".to_string(),
        description: "Threat intelligence enrichment provider".to_string(),
        capabilities: vec!["ip_enrichment".to_string(), "domain_enrichment".to_string()],
        config: HashMap::new(),
    });

    // Enrich the first event
    if let Some(event) = events.first() {
        let mut enriched_event = event.clone();
        enrichment_engine.enrich_event(&mut enriched_event.base).await?;
        println!("✅ Enriched event with threat intelligence");
        println!("  Original observables: {}", event.base.observables.len());
        println!("  Enriched observables: {}", enriched_event.base.observables.len());
        println!("  Enrichments added: {}", enriched_event.base.enrichments.len());
    }

    // Example 8: Validate events
    println!("\n✅ Example 8: Event Validation");
    println!("----------------------------");

    // Create validator
    let validator = ocsf_validation::OcsfValidator::new();

    // Validate all events
    let mut valid_events = 0;
    let mut total_errors = 0;

    for event in events {
        let result = validator.validate_event(event);
        if result.is_valid {
            valid_events += 1;
        }
        total_errors += result.errors.len();

        if !result.errors.is_empty() {
            println!("❌ Validation errors for event:");
            for error in &result.errors {
                println!("  - {}: {}", error.code, error.message);
            }
        }
    }

    println!("✅ Validation complete:");
    println!("  Valid events: {}/{}", valid_events, events.len());
    println!("  Total validation errors: {}", total_errors);

    // Example 9: Export events
    println!("\n📤 Example 9: Event Export");
    println!("------------------------");

    // Export as JSON
    let json_export = event_generator.export_as_json()?;
    println!("✅ Exported {} events as JSON ({} bytes)", events.len(), json_export.len());

    // Example 10: Generate threat intelligence report
    println!("\n📄 Example 10: Threat Intelligence Report");
    println!("---------------------------------------");

    let threat_data = serde_json::json!({
        "threat_actor": "APT-123",
        "campaign": "Financial Sector Targeting",
        "indicators": [
            "192.168.1.100",
            "malicious.com",
            "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
        ],
        "confidence": 0.9,
        "impact": "high",
        "recommendations": [
            "Monitor for indicators",
            "Update security controls",
            "Conduct user training"
        ]
    });

    let report = integration.generate_threat_intel_report(threat_data)?;
    println!("✅ Generated threat intelligence report");
    println!("  Report length: {} characters", report.len());

    // Example 11: Process observables
    println!("\n🔗 Example 11: Observable Processing");
    println!("----------------------------------");

    // Create sample observables
    let observables = vec![
        ocsf::Observable::ip("sample_ip".to_string(), "192.168.1.100".to_string()),
        ocsf::Observable::domain("sample_domain".to_string(), "malicious.com".to_string()),
        ocsf::Observable::file_hash("sample_hash".to_string(), "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3".to_string()),
    ];

    integration.process_observables(observables);
    println!("✅ Processed {} observables", 3);
    println!("  Correlation rules: {}", integration.observable_manager.correlation_rules.len());

    // Example 12: Export observables as events
    println!("\n🔄 Example 12: Observable to Event Conversion");
    println!("-------------------------------------------");

    let observable_events = integration.export_observables_as_events();
    println!("✅ Converted {} observables to events", observable_events.len());

    // Final summary
    println!("\n🎉 OCSF Integration Example Complete!");
    println!("===================================");
    println!("✅ Generated {} OCSF events from threat actor analysis", events.len());
    println!("✅ Enriched events with threat intelligence");
    println!("✅ Validated events against OCSF schema");
    println!("✅ Exported events in standardized format");
    println!("✅ Processed observables and correlation rules");
    println!("✅ Generated threat intelligence reports");
    println!();
    println!("The phantom-threat-actor-core package now supports:");
    println!("• Standardized OCSF event generation");
    println!("• Threat intelligence enrichment");
    println!("• Event validation and normalization");
    println!("• Observable correlation and pivoting");
    println!("• Integration with existing analysis modules");
    println!("• Export capabilities for SIEM/SOAR systems");

    Ok(())
}