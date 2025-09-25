//! Simple OCSF Integration Example
//!
//! This is a basic example demonstrating the phantom-threat-actor-core package
//! with OCSF objects to show the core functionality.

use phantom_threat_actor_core::ocsf_objects::ThreatActor;
use chrono::Utc;

fn main() {
    println!("🚀 Phantom Threat Actor Core - Simple OCSF Example");

    // Create a basic OCSF threat actor
    let threat_actor = ThreatActor {
        name: Some("Example APT".to_string()),
        uid: Some("actor_001".to_string()),
        aliases: vec!["APT-Example".to_string()],
        description: Some("Example APT group for testing".to_string()),
        first_seen: Some(Utc::now()),
        last_seen: Some(Utc::now()),
        actor_type: Some("APT".to_string()),
        campaigns: vec!["Campaign1".to_string()],
        malware: vec!["Trojan".to_string()],
        techniques: vec!["T1566.001".to_string()],
        confidence: Some(0.85),
        attribution_source: Some("Analysis".to_string()),
        attributes: None,
    };

    println!("✅ Created OCSF threat actor: {:?}", threat_actor.name);
    println!("✅ Actor UID: {:?}", threat_actor.uid);
    println!("✅ Confidence: {:?}", threat_actor.confidence);
    println!("✅ Simple OCSF integration example completed!");
}
