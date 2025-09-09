// phantom-ioc-core/examples/basic_usage.rs
// Basic usage example for the IOC core

use phantom_ioc_core::*;
use chrono::Utc;
use uuid::Uuid;

#[tokio::main]
async fn main() -> Result<(), IOCError> {
    println!("🚀 Phantom IOC Core - Basic Usage Example");
    println!("==========================================");

    // Create IOC Core instance
    println!("📦 Initializing IOC Core...");
    let ioc_core = IOCCore::new().await?;
    println!("✅ IOC Core initialized successfully");

    // Create a sample IOC
    let test_ioc = IOC {
        id: Uuid::new_v4(),
        indicator_type: IOCType::IPAddress,
        value: "192.168.1.100".to_string(),
        confidence: 0.85,
        severity: Severity::High,
        source: "test_source".to_string(),
        timestamp: Utc::now(),
        tags: vec!["malware".to_string(), "c2".to_string()],
        context: IOCContext {
            geolocation: Some("Unknown".to_string()),
            asn: Some("AS12345".to_string()),
            category: Some("Malicious".to_string()),
            first_seen: Some(Utc::now()),
            last_seen: Some(Utc::now()),
            related_indicators: vec![],
            metadata: std::collections::HashMap::new(),
        },
        raw_data: None,
    };

    println!("🔍 Processing IOC: {} ({})", test_ioc.value, test_ioc.indicator_type.as_str());

    // Process the IOC
    let result = ioc_core.process_ioc(test_ioc).await?;
    println!("✅ IOC processed successfully");

    // Display results
    println!("\n📊 Analysis Results:");
    println!("==================");
    println!("Threat Actors Identified: {}", result.analysis.threat_actors.len());
    println!("Campaigns Identified: {}", result.analysis.campaigns.len());
    println!("Malware Families Identified: {}", result.analysis.malware_families.len());
    println!("Attack Vectors Identified: {}", result.analysis.attack_vectors.len());
    println!("Overall Risk Score: {:.2}", result.analysis.impact_assessment.overall_risk);

    // Display recommendations
    println!("\n💡 Recommendations:");
    println!("==================");
    for (i, recommendation) in result.analysis.recommendations.iter().enumerate() {
        println!("{}. {}", i + 1, recommendation);
    }

    // Get system health
    println!("\n🏥 System Health:");
    println!("================");
    let health = ioc_core.get_health_status().await?;
    println!("Overall Status: {:?}", health.status);
    println!("Components: {}", health.components.len());

    println!("\n🎉 IOC Core demonstration completed successfully!");
    Ok(())
}
