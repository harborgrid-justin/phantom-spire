# OCSF Integration for Phantom Threat Actor Core

This document describes the Open Cybersecurity Schema Framework (OCSF) integration features added to the phantom-threat-actor-core package.

## Overview

The OCSF integration provides standardized cybersecurity event representation, enabling seamless integration with SIEM systems, SOAR platforms, and other security tools that support the OCSF schema.

## Features

### 🔧 Core OCSF Modules

- **`ocsf.rs`** - Base event structure and core attributes
- **`ocsf_categories.rs`** - Security finding, network activity, and system activity categories
- **`ocsf_event_classes.rs`** - Specific event class implementations
- **`ocsf_objects.rs`** - Reusable objects library for threat actors, malware, vulnerabilities
- **`ocsf_observables.rs`** - Observables management with correlation and pivoting
- **`ocsf_normalization.rs`** - Event normalization, validation, and serialization

### 🔗 Integration Modules

- **`ocsf_integration.rs`** - Integration with existing threat actor analysis modules
- **`ocsf_enrichment.rs`** - Threat intelligence enrichment and contextual analysis
- **`ocsf_validation.rs`** - Schema validation and compliance checking

## Quick Start

```rust
use phantom_threat_actor_core::ocsf_integration::ThreatIntelEventGenerator;

// Create event generator
let mut generator = ThreatIntelEventGenerator::new();

// Generate events from behavioral patterns
generator.generate_from_behavioral_patterns(&behavioral_patterns);

// Generate events from geographic analysis
generator.generate_from_geographic_analysis(&locations);

// Get standardized OCSF events
let events = generator.get_events();

// Export as JSON for SIEM integration
let json_export = generator.export_as_json()?;
```

## Event Generation

### From Behavioral Patterns

```rust
use phantom_threat_actor_core::behavioral_patterns::BehavioralPattern;

let patterns = vec![/* your behavioral patterns */];
let mut generator = ThreatIntelEventGenerator::new();
generator.generate_from_behavioral_patterns(&patterns);
```

### From Geographic Analysis

```rust
use phantom_threat_actor_core::geographic_analysis::GeographicLocation;

let locations = vec![/* your geographic locations */];
generator.generate_from_geographic_analysis(&locations);
```

### From Incident Response

```rust
use phantom_threat_actor_core::incident_response::Incident;

let incidents = vec![/* your incidents */];
generator.generate_from_incidents(&incidents);
```

### From Intelligence Reports

```rust
use phantom_threat_actor_core::intelligence_sharing::IntelligenceReport;

let reports = vec![/* your intelligence reports */];
generator.generate_from_intelligence(&reports);
```

## Event Enrichment

```rust
use phantom_threat_actor_core::ocsf_enrichment::EnrichmentEngine;

// Create enrichment engine
let mut engine = EnrichmentEngine::new();

// Register providers
engine.register_provider(/* threat intelligence provider */);

// Enrich events
for event in &mut events {
    engine.enrich_event(&mut event.base).await?;
}
```

## Event Validation

```rust
use phantom_threat_actor_core::ocsf_validation::OcsfValidator;

// Create validator
let validator = OcsfValidator::new();

// Validate events
for event in &events {
    let result = validator.validate_event(event);
    if !result.is_valid {
        println!("Validation errors: {:?}", result.errors);
    }
}
```

## Observable Management

```rust
use phantom_threat_actor_core::ocsf::Observable;

// Create observables
let ip_observable = Observable::ip("suspicious_ip".to_string(), "192.168.1.100".to_string());
let domain_observable = Observable::domain("malicious_domain".to_string(), "evil.com".to_string());

// Process observables
integration.process_observables(vec![ip_observable, domain_observable]);
```

## OCSF Categories

### Security Finding (Category 2)
- Malware detection
- Unauthorized access
- Suspicious activity
- Policy violations

### Network Activity (Category 4)
- Suspicious HTTP traffic
- Network anomalies
- Connection attempts
- Data exfiltration

### System Activity (Category 6)
- File system changes
- Process execution
- System configuration changes
- Authentication events

## Event Classes

### Security Finding Events
- `security_finding::SecurityFindingEvent`
- `security_finding::MalwareFinding`
- `security_finding::UnauthorizedAccessFinding`

### Network Activity Events
- `network_activity::NetworkActivityEvent`
- `network_activity::HTTPTrafficEvent`
- `network_activity::ConnectionEvent`

### System Activity Events
- `system_activity::FileActivityEvent`
- `system_activity::ProcessActivityEvent`
- `system_activity::AuthenticationEvent`

## Objects Library

### Threat Actor Objects
```rust
use phantom_threat_actor_core::ocsf_objects::threat_actor::*;

let actor = ThreatActorObject {
    name: "APT-123".to_string(),
    aliases: vec!["Fancy Bear".to_string()],
    sophistication_level: "advanced".to_string(),
    motivations: vec!["espionage".to_string()],
    // ... other fields
};
```

### Malware Objects
```rust
use phantom_threat_actor_core::ocsf_objects::malware::*;

let malware = MalwareObject {
    name: "RansomwareX".to_string(),
    malware_type: "ransomware".to_string(),
    file_hashes: vec![/* SHA256 hashes */],
    capabilities: vec!["encryption".to_string()],
    // ... other fields
};
```

## Normalization and Serialization

```rust
use phantom_threat_actor_core::ocsf_normalization::{EventNormalizer, EventSerializer};

// Create normalizer and serializer
let normalizer = EventNormalizer::new();
let serializer = EventSerializer::new();

// Normalize event data
let normalized = normalizer.normalize(event_data)?;

// Serialize to JSON
let json = serializer.serialize(&normalized)?;
```

## Integration Examples

### SIEM Integration
```rust
// Generate OCSF events
let events = generator.get_events();

// Export for Splunk, ELK, etc.
let json_export = generator.export_as_json()?;

// Send to SIEM endpoint
send_to_siem(json_export).await?;
```

### SOAR Integration
```rust
// Create enriched events
let enriched_events = enrich_events(events).await?;

// Generate playbooks
let playbooks = generate_playbooks(&enriched_events);

// Execute automated responses
execute_responses(playbooks).await?;
```

### Threat Intelligence Platform Integration
```rust
// Generate threat intelligence report
let report = integration.generate_threat_intel_report(threat_data)?;

// Share with TIP
share_with_tip(report).await?;
```

## Configuration

### Enrichment Providers
```rust
// Configure threat intelligence providers
let threat_provider = EnrichmentProvider {
    name: "virus_total".to_string(),
    provider_type: "threat_intelligence".to_string(),
    config: HashMap::from([
        ("api_key".to_string(), "your_api_key".to_string()),
        ("rate_limit".to_string(), "1000".to_string()),
    ]),
    // ... other fields
};
```

### Validation Rules
```rust
// Add custom validation rules
let rule = ValidationRule {
    name: "custom_ip_validation".to_string(),
    field: "source_ip".to_string(),
    validation_type: ValidationType::Pattern(r"^(\d{1,3}\.){3}\d{1,3}$".to_string()),
    required: true,
    // ... other fields
};

validator.add_rule(rule);
```

## Performance Considerations

- **Event Batching**: Process events in batches for better performance
- **Caching**: Use enrichment caching to reduce API calls
- **Async Processing**: Leverage async/await for concurrent processing
- **Memory Management**: Stream large event sets instead of loading all into memory

## Best Practices

1. **Validate Early**: Validate events as they're generated
2. **Enrich Incrementally**: Add enrichment data as it becomes available
3. **Normalize Consistently**: Use consistent normalization rules across all events
4. **Monitor Performance**: Track processing times and resource usage
5. **Handle Errors Gracefully**: Implement proper error handling and logging

## API Reference

### ThreatIntelEventGenerator
- `new()` - Create new event generator
- `generate_from_*()` - Generate events from various analysis types
- `get_events()` - Get all generated events
- `export_as_json()` - Export events as JSON
- `get_statistics()` - Get generation statistics

### EnrichmentEngine
- `new()` - Create new enrichment engine
- `register_provider()` - Register enrichment provider
- `enrich_event()` - Enrich single event
- `get_statistics()` - Get enrichment statistics

### OcsfValidator
- `new()` - Create new validator
- `validate_event()` - Validate single event
- `add_rule()` - Add validation rule
- `get_statistics()` - Get validation statistics

## Troubleshooting

### Common Issues

1. **Validation Errors**
   - Check required fields are present
   - Verify data types match schema
   - Ensure enum values are valid

2. **Enrichment Failures**
   - Verify provider configuration
   - Check API keys and connectivity
   - Review rate limits

3. **Serialization Errors**
   - Ensure all required fields are populated
   - Check for invalid characters
   - Verify JSON structure

### Debug Mode
```rust
// Enable debug logging
std::env::set_var("RUST_LOG", "debug");
env_logger::init();

// Validate with detailed output
let result = validator.validate_event(event);
println!("Validation result: {:?}", result);
```

## Contributing

When adding new OCSF features:

1. Follow the existing module structure
2. Add comprehensive tests
3. Update documentation
4. Ensure backward compatibility
5. Validate against OCSF schema specification

## License

This OCSF integration is part of the phantom-threat-actor-core package and follows the same license terms.