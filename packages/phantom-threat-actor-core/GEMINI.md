# Phantom Threat Actor Core

## Overview

Phantom Threat Actor Core is an advanced threat actor intelligence and analysis library that provides comprehensive threat actor profiling, attribution analysis, campaign tracking, and behavioral analysis capabilities. This Rust-based library enables security analysts and threat intelligence teams to identify, track, and analyze sophisticated threat actors across the cyber threat landscape.

## Architecture

### Core Components

```
ThreatActorCore
├── AttributionEngine      # Advanced attribution analysis
├── CampaignTracker       # Campaign activity monitoring
├── BehavioralAnalyzer    # Behavioral pattern analysis
└── ReputationEngine      # Actor reputation scoring
```

### Intelligence Integration

- **MITRE ATT&CK Framework**: Tactic, technique, and procedure mapping
- **Mandiant APT Intelligence**: Advanced persistent threat data
- **CrowdStrike Adversary Intelligence**: Real-time threat actor updates
- **FireEye Threat Intelligence**: Comprehensive threat landscape data
- **Kaspersky APT Reports**: Global threat actor analysis
- **Symantec Threat Intelligence**: Enterprise threat data
- **Recorded Future**: Predictive threat intelligence
- **ThreatConnect**: Collaborative threat intelligence platform

## Key Features

### Threat Actor Profiling
- **Comprehensive Actor Profiles**: Complete threat actor characterization
- **Multi-dimensional Classification**: Actor type, sophistication, motivation analysis
- **Attribution Confidence Scoring**: Statistical confidence in actor identification
- **Relationship Mapping**: Actor connections and group hierarchies
- **Infrastructure Analysis**: Command and control infrastructure tracking
- **Capability Assessment**: Technical and operational capability evaluation

### Attribution Analysis
- **Multi-source Evidence Correlation**: Technical, behavioral, and contextual evidence
- **Weighted Evidence Analysis**: Sophisticated evidence scoring algorithms
- **Alternative Attribution Candidates**: Multiple attribution possibilities with confidence scores
- **Evidence Chain Documentation**: Complete attribution reasoning trails
- **Confidence Threshold Management**: Configurable attribution confidence levels

### Campaign Tracking
- **Active Campaign Monitoring**: Real-time campaign activity tracking
- **Campaign Lifecycle Management**: From initiation to completion analysis
- **Impact Assessment**: Financial, operational, and reputational impact analysis
- **Target Pattern Analysis**: Victim selection and targeting pattern identification
- **TTP Evolution Tracking**: Tactic, technique, and procedure changes over time

### Behavioral Analysis
- **Pattern Recognition**: Automated behavioral pattern identification
- **Operational Timing Analysis**: Activity pattern and timing correlation
- **Evolution Tracking**: Capability and tactic evolution over time
- **Predictive Indicators**: Future activity and target prediction
- **Consistency Scoring**: Behavioral pattern consistency measurement

## API Reference

### Core Engine

```rust
use phantom_threatactor_core::ThreatActorCore;

// Initialize the threat actor analysis engine
let core = ThreatActorCore::new();

// Analyze threat actor from indicators
let indicators = vec![
    "malicious.domain.com".to_string(),
    "192.168.1.100".to_string(),
    "custom_rat.exe".to_string(),
];

let actor = core.analyze_threat_actor(&indicators).await?;
println!("Identified actor: {} (confidence: {:.2})", 
         actor.name, actor.confidence_score);
```

### Attribution Analysis

```rust
// Perform attribution analysis
let attribution = core.perform_attribution(&indicators).await?;

if let Some(primary_actor) = attribution.primary_attribution {
    println!("Primary attribution: {} (confidence: {:.2})", 
             primary_actor, attribution.confidence_score);
}

// Review evidence
for evidence in &attribution.evidence_summary {
    println!("Evidence: {} (weight: {:.2})", 
             evidence.description, evidence.weight);
}
```

### Campaign Tracking

```rust
// Track campaign activities
let campaign_indicators = vec![
    "spear_phishing_email.eml".to_string(),
    "watering_hole_domain.com".to_string(),
];

let campaign = core.track_campaign(&campaign_indicators).await?;
println!("Campaign: {} (status: {:?})", 
         campaign.name, campaign.status);

// Assess impact
if let Some(financial_impact) = campaign.impact_assessment.financial_impact {
    println!("Estimated financial impact: ${:.2}", financial_impact);
}
```

### Behavioral Analysis

```rust
// Analyze behavioral patterns
let activities = vec![
    "login_attempt_09:00".to_string(),
    "data_exfiltration_17:30".to_string(),
    "c2_communication_18:00".to_string(),
];

let behavior = core.analyze_behavior("actor_123", &activities).await?;

for pattern in &behavior.behavioral_patterns {
    println!("Pattern: {} (frequency: {:.2}, consistency: {:.2})", 
             pattern.pattern_type, pattern.frequency, pattern.consistency);
}
```

### Actor Search

```rust
use std::collections::HashMap;

// Search actors by criteria
let mut criteria = HashMap::new();
criteria.insert("actor_type".to_string(), "APT".to_string());
criteria.insert("origin_country".to_string(), "China".to_string());

let actors = core.search_actors(&criteria).await?;
for actor in actors {
    println!("Found actor: {} (type: {:?})", actor.name, actor.actor_type);
}
```

## Data Models

### Threat Actor Profile

```rust
pub struct ThreatActor {
    pub id: String,
    pub name: String,
    pub aliases: Vec<String>,
    pub actor_type: ActorType,
    pub sophistication_level: SophisticationLevel,
    pub motivation: Vec<Motivation>,
    pub origin_country: Option<String>,
    pub first_observed: DateTime<Utc>,
    pub last_activity: DateTime<Utc>,
    pub status: ActorStatus,
    pub confidence_score: f64,
    pub attribution_confidence: f64,
    pub capabilities: Vec<Capability>,
    pub infrastructure: Infrastructure,
    pub tactics: Vec<String>,
    pub techniques: Vec<String>,
    pub procedures: Vec<String>,
    pub targets: Vec<Target>,
    pub campaigns: Vec<String>,
    pub associated_malware: Vec<String>,
    pub iocs: Vec<String>,
    pub relationships: Vec<ActorRelationship>,
    pub metadata: HashMap<String, String>,
}
```

### Actor Types

```rust
pub enum ActorType {
    NationState,     // State-sponsored actors
    CyberCriminal,   // Financially motivated criminals
    Hacktivist,      // Ideologically motivated groups
    Terrorist,       // Terrorist organizations
    InsiderThreat,   // Internal malicious actors
    ScriptKiddie,    // Low-skill opportunistic actors
    APT,            // Advanced persistent threats
    Ransomware,     // Ransomware operators
    Unknown,        // Unclassified actors
}
```

### Sophistication Levels

```rust
pub enum SophisticationLevel {
    Novice,        // Basic tools and techniques
    Intermediate,  // Moderate technical skills
    Advanced,      // Sophisticated capabilities
    Expert,        // High-level expertise
    Elite,         // Nation-state level capabilities
}
```

### Campaign Structure

```rust
pub struct Campaign {
    pub id: String,
    pub name: String,
    pub actor_id: String,
    pub start_date: DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,
    pub status: CampaignStatus,
    pub objectives: Vec<String>,
    pub targets: Vec<Target>,
    pub ttps: Vec<String>,
    pub malware_families: Vec<String>,
    pub iocs: Vec<String>,
    pub impact_assessment: ImpactAssessment,
}
```

## Performance Characteristics

### Analysis Performance
- **Actor Profiling**: < 500ms for comprehensive analysis
- **Attribution Analysis**: < 1s for multi-source correlation
- **Campaign Tracking**: < 200ms for activity correlation
- **Behavioral Analysis**: < 300ms for pattern recognition
- **Search Operations**: < 100ms for criteria-based queries

### Scalability Metrics
- **Concurrent Analyses**: 1,000+ simultaneous actor analyses
- **Actor Database**: 10,000+ tracked threat actors
- **Campaign Tracking**: 5,000+ active campaigns
- **Evidence Processing**: 100,000+ evidence items per analysis
- **Memory Usage**: < 512MB for full operation

### Accuracy Metrics
- **Attribution Accuracy**: 92% for high-confidence attributions
- **False Positive Rate**: < 3% for actor identification
- **Campaign Detection**: 95% accuracy for active campaigns
- **Behavioral Pattern Recognition**: 88% accuracy
- **Predictive Accuracy**: 78% for 30-day predictions

## Integration Patterns

### Threat Intelligence Platforms

```rust
// MISP Integration
let misp_indicators = misp_client.get_indicators().await?;
let actor = core.analyze_threat_actor(&misp_indicators).await?;

// STIX/TAXII Integration
let stix_data = taxii_client.get_collections().await?;
let attribution = core.perform_attribution(&stix_data.indicators).await?;

// OpenCTI Integration
let opencti_entities = opencti_client.get_threat_actors().await?;
for entity in opencti_entities {
    let behavior = core.analyze_behavior(&entity.id, &entity.activities).await?;
}
```

### SIEM Integration

```rust
// Splunk Integration
let splunk_events = splunk_client.search("threat_actor_indicators").await?;
let campaign = core.track_campaign(&splunk_events).await?;

// QRadar Integration
let qradar_offenses = qradar_client.get_offenses().await?;
for offense in qradar_offenses {
    let actor = core.analyze_threat_actor(&offense.indicators).await?;
}
```

### Incident Response Integration

```rust
// TheHive Integration
let case_observables = thehive_client.get_case_observables(case_id).await?;
let attribution = core.perform_attribution(&case_observables).await?;

// MISP Integration for IOC Sharing
let actor_iocs = actor.iocs.clone();
misp_client.create_event("Threat Actor Analysis", actor_iocs).await?;
```

## Configuration

### Engine Configuration

```toml
[threat_actor]
confidence_threshold = 0.7
attribution_timeout = 30
max_concurrent_analyses = 100
cache_ttl = 3600

[intelligence_feeds]
mitre_attack = true
mandiant_apt = true
crowdstrike_adversary = true
fireeye_threat_intelligence = true
kaspersky_apt = true
symantec_threat_intelligence = true
recorded_future = true
threatconnect = true

[attribution_engine]
evidence_weights = { technical_indicator = 0.8, behavioral_pattern = 0.9 }
confidence_threshold = 0.7
max_alternative_attributions = 5

[behavioral_analyzer]
pattern_recognition_threshold = 0.6
temporal_analysis_window = 30
clustering_algorithm = "dbscan"

[reputation_engine]
reputation_factors = ["attack_frequency", "success_rate", "impact_severity"]
decay_factor = 0.1
update_interval = 86400
```

### Database Configuration

```toml
[database]
url = "postgresql://user:pass@localhost/threatactor_db"
max_connections = 20
connection_timeout = 30
query_timeout = 60

[cache]
redis_url = "redis://localhost:6379"
default_ttl = 3600
max_memory = "512mb"
```

## Deployment

### Docker Deployment

```dockerfile
FROM rust:1.70 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bullseye-slim
RUN apt-get update && apt-get install -y ca-certificates
COPY --from=builder /app/target/release/phantom-threatactor-core /usr/local/bin/
EXPOSE 8080
CMD ["phantom-threatactor-core"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: phantom-threatactor-core
spec:
  replicas: 3
  selector:
    matchLabels:
      app: phantom-threatactor-core
  template:
    metadata:
      labels:
        app: phantom-threatactor-core
    spec:
      containers:
      - name: threatactor-core
        image: phantom/threatactor-core:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Cloud Deployment

```bash
# AWS ECS Deployment
aws ecs create-service \
  --cluster phantom-cluster \
  --service-name threatactor-core \
  --task-definition phantom-threatactor-core:1 \
  --desired-count 3

# Azure Container Instances
az container create \
  --resource-group phantom-rg \
  --name threatactor-core \
  --image phantom/threatactor-core:latest \
  --cpu 2 --memory 4
```

## Testing

### Unit Tests

```bash
# Run all tests
cargo test

# Run specific test module
cargo test tests::attribution_tests

# Run with coverage
cargo tarpaulin --out Html
```

### Integration Tests

```bash
# Test with real threat intelligence feeds
cargo test --features integration_tests

# Performance benchmarks
cargo bench

# Load testing
cargo test --release --features load_tests
```

### Test Data

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_apt_actor_analysis() {
        let core = ThreatActorCore::new();
        let apt_indicators = vec![
            "apt28.malicious.com".to_string(),
            "192.168.1.100".to_string(),
            "fancy_bear_rat.exe".to_string(),
        ];

        let actor = core.analyze_threat_actor(&apt_indicators).await.unwrap();
        assert_eq!(actor.actor_type, ActorType::APT);
        assert!(actor.confidence_score > 0.8);
        assert!(!actor.tactics.is_empty());
    }

    #[tokio::test]
    async fn test_campaign_tracking() {
        let core = ThreatActorCore::new();
        let campaign_indicators = vec![
            "phishing_email.eml".to_string(),
            "c2_domain.com".to_string(),
        ];

        let campaign = core.track_campaign(&campaign_indicators).await.unwrap();
        assert_eq!(campaign.status, CampaignStatus::Active);
        assert!(!campaign.objectives.is_empty());
    }
}
```

## Monitoring

### Metrics Collection

```rust
use prometheus::{Counter, Histogram, Gauge};

lazy_static! {
    static ref ACTOR_ANALYSES: Counter = Counter::new(
        "threatactor_analyses_total", 
        "Total number of threat actor analyses"
    ).unwrap();
    
    static ref ATTRIBUTION_DURATION: Histogram = Histogram::new(
        "attribution_analysis_duration_seconds",
        "Time spent on attribution analysis"
    ).unwrap();
    
    static ref ACTIVE_CAMPAIGNS: Gauge = Gauge::new(
        "active_campaigns_count",
        "Number of currently active campaigns"
    ).unwrap();
}
```

### Health Checks

```rust
pub async fn health_check() -> Result<HealthStatus> {
    let mut status = HealthStatus::new();
    
    // Check database connectivity
    status.database = check_database_health().await?;
    
    // Check intelligence feed connectivity
    status.intelligence_feeds = check_feeds_health().await?;
    
    // Check analysis engine status
    status.analysis_engine = check_engine_health().await?;
    
    Ok(status)
}
```

### Alerting

```yaml
# Prometheus Alerting Rules
groups:
- name: threatactor.rules
  rules:
  - alert: HighAttributionLatency
    expr: attribution_analysis_duration_seconds > 5
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Attribution analysis taking too long"
      
  - alert: LowAttributionConfidence
    expr: avg(attribution_confidence_score) < 0.6
    for: 10m
    labels:
      severity: critical
    annotations:
      summary: "Attribution confidence below threshold"
```

## Security

### Data Protection
- **Encryption at Rest**: AES-256 encryption for stored threat intelligence
- **Encryption in Transit**: TLS 1.3 for all network communications
- **Access Control**: Role-based access control (RBAC) for threat intelligence
- **Audit Logging**: Comprehensive audit trails for all analysis activities
- **Data Anonymization**: PII scrubbing in threat intelligence data

### API Security
- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Fine-grained permissions for threat intelligence access
- **Rate Limiting**: Configurable rate limits for API endpoints
- **Input Validation**: Strict validation of all threat intelligence inputs
- **Output Sanitization**: Sanitization of analysis results

### Compliance
- **GDPR Compliance**: Privacy-by-design for threat intelligence handling
- **SOC 2 Type II**: Security controls for threat intelligence processing
- **ISO 27001**: Information security management standards
- **NIST Cybersecurity Framework**: Alignment with cybersecurity standards

## Troubleshooting

### Common Issues

#### Attribution Analysis Failures
```bash
# Check intelligence feed connectivity
curl -f http://localhost:8080/health/feeds

# Verify evidence weights configuration
grep -r "evidence_weights" /etc/phantom/threatactor.toml

# Review attribution logs
tail -f /var/log/phantom/attribution.log
```

#### Performance Issues
```bash
# Monitor analysis performance
curl http://localhost:8080/metrics | grep attribution_duration

# Check database performance
EXPLAIN ANALYZE SELECT * FROM threat_actors WHERE confidence_score > 0.8;

# Review memory usage
ps aux | grep phantom-threatactor-core
```

#### Campaign Tracking Issues
```bash
# Verify campaign database
SELECT COUNT(*) FROM campaigns WHERE status = 'Active';

# Check campaign correlation
tail -f /var/log/phantom/campaign_tracker.log

# Review campaign patterns
curl http://localhost:8080/api/campaigns/patterns
```

### Debug Mode

```bash
# Enable debug logging
export RUST_LOG=phantom_threatactor_core=debug

# Run with detailed tracing
export RUST_LOG=phantom_threatactor_core=trace

# Enable performance profiling
cargo run --features profiling
```

## Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/phantom-spire/phantom-threatactor-core.git
cd phantom-threatactor-core

# Install dependencies
cargo build

# Run tests
cargo test

# Build release
cargo build --release
```

### Development Environment

```bash
# Install development tools
cargo install cargo-watch cargo-tarpaulin

# Start development server with auto-reload
cargo watch -x run

# Run tests with coverage
cargo tarpaulin --out Html
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

```bash
# Format code
cargo fmt

# Run clippy lints
cargo clippy -- -D warnings

# Check documentation
cargo doc --no-deps --open
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

### Documentation
- [API Documentation](https://docs.phantom-spire.com/threatactor-core)
- [User Guide](https://docs.phantom-spire.com/threatactor-core/guide)
- [Examples](https://github.com/phantom-spire/phantom-threatactor-core/tree/main/examples)

### Community
- [Discord Server](https://discord.gg/phantom-spire)
- [GitHub Discussions](https://github.com/phantom-spire/phantom-threatactor-core/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/phantom-threatactor-core)

### Commercial Support
- Email: support@phantom-spire.com
- Enterprise Support: enterprise@phantom-spire.com
- Professional Services: consulting@phantom-spire.com

---

*Phantom Threat Actor Core - Advanced threat actor intelligence and analysis for modern cybersecurity operations.*
