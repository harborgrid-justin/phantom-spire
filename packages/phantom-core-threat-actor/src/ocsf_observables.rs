use crate::ocsf::{Observable};
use crate::ocsf_objects::{Ioc};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;

/// OCSF Observables Implementation
/// Provides functionality for threat intelligence observables and correlation

/// Observable Manager for handling collections of observables
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObservableManager {
    /// The observables collection
    pub observables: Vec<Observable>,
    /// The IOCs collection
    pub iocs: Vec<Ioc>,
    /// The correlation rules
    pub correlation_rules: Vec<CorrelationRule>,
    /// The observable relationships
    pub relationships: Vec<ObservableRelationship>,
}

/// Observable Type IDs (following OCSF standard)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ObservableTypeId {
    Unknown = 0,
    File = 1,
    IPv4 = 2,
    IPv6 = 3,
    Domain = 4,
    URL = 5,
    Email = 6,
    User = 7,
    Process = 8,
    NetworkConnection = 9,
    RegistryKey = 10,
    RegistryValue = 11,
    Certificate = 12,
    Hash = 13,
    MACAddress = 14,
    Port = 15,
    AutonomousSystem = 16,
    Mutex = 17,
    NamedPipe = 18,
    HTTPHeader = 19,
    HTTPRequest = 20,
    HTTPResponse = 21,
    DNSQuery = 22,
    DNSAnswer = 23,
    JA4Fingerprint = 24,
    HASSHFingerprint = 25,
}

/// Correlation Rule for linking observables
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CorrelationRule {
    /// The rule name
    pub name: String,
    /// The rule description
    pub description: String,
    /// The source observable types
    pub source_types: Vec<i32>,
    /// The target observable types
    pub target_types: Vec<i32>,
    /// The correlation logic
    pub logic: CorrelationLogic,
    /// The confidence score
    pub confidence: f64,
    /// The rule metadata
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

/// Correlation Logic types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CorrelationLogic {
    /// Exact match correlation
    ExactMatch,
    /// Fuzzy match correlation
    FuzzyMatch { threshold: f64 },
    /// Pattern-based correlation
    PatternMatch { pattern: String },
    /// Time-based correlation
    TimeBased { window_seconds: i64 },
    /// Graph-based correlation
    GraphBased { max_hops: i32 },
}

/// Observable Relationship
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObservableRelationship {
    /// The source observable ID
    pub source_id: String,
    /// The target observable ID
    pub target_id: String,
    /// The relationship type
    pub relationship_type: RelationshipType,
    /// The confidence score
    pub confidence: f64,
    /// The relationship metadata
    pub metadata: Option<HashMap<String, serde_json::Value>>,
    /// The timestamp
    pub timestamp: DateTime<Utc>,
}

/// Relationship Types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RelationshipType {
    /// Connected to relationship
    ConnectedTo,
    /// Communicates with relationship
    CommunicatesWith,
    /// Contains relationship
    Contains,
    /// Downloads relationship
    Downloads,
    /// Executes relationship
    Executes,
    /// Creates relationship
    Creates,
    /// Modifies relationship
    Modifies,
    /// Deletes relationship
    Deletes,
    /// Resolves to relationship
    ResolvesTo,
    /// Belongs to relationship
    BelongsTo,
    /// Similar to relationship
    SimilarTo,
    /// Related to relationship
    RelatedTo,
}

/// Observable Enrichment Provider
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrichmentProvider {
    /// The provider name
    pub name: String,
    /// The provider type
    pub provider_type: String,
    /// The provider URL
    pub url: Option<String>,
    /// The provider API key
    pub api_key: Option<String>,
    /// The provider rate limits
    pub rate_limits: Option<RateLimits>,
}

/// Rate Limits for enrichment providers
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimits {
    /// Requests per minute
    pub requests_per_minute: i32,
    /// Requests per hour
    pub requests_per_hour: i32,
    /// Requests per day
    pub requests_per_day: i32,
}

/// Threat Intelligence Feed
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatFeed {
    /// The feed name
    pub name: String,
    /// The feed URL
    pub url: String,
    /// The feed type
    pub feed_type: String,
    /// The feed format
    pub format: String,
    /// The last update time
    pub last_update: Option<DateTime<Utc>>,
    /// The feed confidence
    pub confidence: f64,
    /// The feed observables
    pub observables: Vec<Observable>,
}

/// Observable Pivot - Represents a pivot point for threat hunting
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObservablePivot {
    /// The pivot name
    pub name: String,
    /// The source observable
    pub source_observable: Observable,
    /// The pivot type
    pub pivot_type: PivotType,
    /// The related observables
    pub related_observables: Vec<Observable>,
    /// The pivot confidence
    pub confidence: f64,
    /// The pivot metadata
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

/// Pivot Types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PivotType {
    /// Domain to IP pivot
    DomainToIP,
    /// IP to domain pivot
    IPToDomain,
    /// File hash to malware pivot
    HashToMalware,
    /// User to activity pivot
    UserToActivity,
    /// Process to file pivot
    ProcessToFile,
    /// Network to host pivot
    NetworkToHost,
    /// Time-based pivot
    TimeBased,
    /// Behavioral pivot
    Behavioral,
}

impl ObservableManager {
    /// Create a new observable manager
    pub fn new() -> Self {
        Self {
            observables: Vec::new(),
            iocs: Vec::new(),
            correlation_rules: Vec::new(),
            relationships: Vec::new(),
        }
    }

    /// Add an observable
    pub fn add_observable(&mut self, observable: Observable) {
        self.observables.push(observable);
    }

    /// Add an IOC
    pub fn add_ioc(&mut self, ioc: Ioc) {
        self.iocs.push(ioc);
    }

    /// Add a correlation rule
    pub fn add_correlation_rule(&mut self, rule: CorrelationRule) {
        self.correlation_rules.push(rule);
    }

    /// Find observables by type
    pub fn find_by_type(&self, type_id: i32) -> Vec<&Observable> {
        self.observables.iter()
            .filter(|obs| obs.type_id == type_id)
            .collect()
    }

    /// Find observables by value
    pub fn find_by_value(&self, value: &str) -> Vec<&Observable> {
        self.observables.iter()
            .filter(|obs| obs.value == value)
            .collect()
    }

    /// Find IOCs by type
    pub fn find_iocs_by_type(&self, ioc_type: &str) -> Vec<&Ioc> {
        self.iocs.iter()
            .filter(|ioc| ioc.ioc_type == ioc_type)
            .collect()
    }

    /// Correlate observables based on rules
    pub fn correlate_observables(&self) -> Vec<ObservableRelationship> {
        let mut relationships = Vec::new();

        for rule in &self.correlation_rules {
            for source_obs in &self.observables {
                if rule.source_types.contains(&source_obs.type_id) {
                    for target_obs in &self.observables {
                        if rule.target_types.contains(&target_obs.type_id) && source_obs.name != target_obs.name {
                            if self.check_correlation(&rule.logic, source_obs, target_obs) {
                                relationships.push(ObservableRelationship {
                                    source_id: source_obs.name.clone(),
                                    target_id: target_obs.name.clone(),
                                    relationship_type: RelationshipType::RelatedTo,
                                    confidence: rule.confidence,
                                    metadata: Some(HashMap::from([
                                        ("rule".to_string(), serde_json::json!(rule.name)),
                                        ("correlation_type".to_string(), serde_json::json!("rule_based")),
                                    ])),
                                    timestamp: Utc::now(),
                                });
                            }
                        }
                    }
                }
            }
        }

        relationships
    }

    /// Check correlation logic between two observables
    fn check_correlation(&self, logic: &CorrelationLogic, source: &Observable, target: &Observable) -> bool {
        match logic {
            CorrelationLogic::ExactMatch => {
                // Simple exact match for demonstration
                source.value == target.value
            },
            CorrelationLogic::FuzzyMatch { threshold: _ } => {
                // Fuzzy matching logic would go here
                // For now, just check if values contain similar substrings
                source.value.contains(&target.value) || target.value.contains(&source.value)
            },
            CorrelationLogic::PatternMatch { pattern } => {
                // Pattern matching logic
                regex::Regex::new(pattern).unwrap().is_match(&source.value) ||
                regex::Regex::new(pattern).unwrap().is_match(&target.value)
            },
            CorrelationLogic::TimeBased { window_seconds: _ } => {
                // Time-based correlation would require timestamp data
                // For now, return false
                false
            },
            CorrelationLogic::GraphBased { max_hops: _ } => {
                // Graph-based correlation would require graph traversal
                // For now, return false
                false
            },
        }
    }

    /// Create pivots from observables
    pub fn create_pivots(&self) -> Vec<ObservablePivot> {
        let mut pivots = Vec::new();

        // Domain to IP pivot
        let domains = self.find_by_type(ObservableTypeId::Domain as i32);
        let ips = self.find_by_type(ObservableTypeId::IPv4 as i32);

        for domain in &domains {
            for ip in &ips {
                if self.check_domain_ip_correlation(domain, ip) {
                    pivots.push(ObservablePivot {
                        name: format!("{}_to_{}", domain.name, ip.name),
                        source_observable: (*domain).clone(),
                        pivot_type: PivotType::DomainToIP,
                        related_observables: vec![(*ip).clone()],
                        confidence: 0.8,
                        metadata: Some(HashMap::from([
                            ("pivot_reason".to_string(), serde_json::json!("DNS_resolution")),
                        ])),
                    });
                }
            }
        }

        // File hash to malware pivot
        let hashes = self.find_by_type(ObservableTypeId::Hash as i32);
        for hash in &hashes {
            if let Some(malware_info) = self.check_hash_malware_correlation(hash) {
                pivots.push(ObservablePivot {
                    name: format!("{}_malware_pivot", hash.name),
                    source_observable: (*hash).clone(),
                    pivot_type: PivotType::HashToMalware,
                    related_observables: vec![],
                    confidence: 0.9,
                    metadata: Some(HashMap::from([
                        ("malware_family".to_string(), serde_json::json!(malware_info)),
                    ])),
                });
            }
        }

        pivots
    }

    /// Check domain to IP correlation (simplified)
    fn check_domain_ip_correlation(&self, domain: &Observable, ip: &Observable) -> bool {
        // In a real implementation, this would check DNS records
        // For demonstration, we'll use a simple heuristic
        let domain_parts: Vec<&str> = domain.value.split('.').collect();
        let ip_parts: Vec<&str> = ip.value.split('.').collect();

        if domain_parts.len() >= 2 && ip_parts.len() == 4 {
            // Check if domain and IP might be related
            // This is a very simplified check
            true
        } else {
            false
        }
    }

    /// Check hash to malware correlation (simplified)
    fn check_hash_malware_correlation(&self, hash: &Observable) -> Option<String> {
        // In a real implementation, this would check threat intelligence feeds
        // For demonstration, we'll use known malicious hashes
        let known_malicious_hashes = [
            "44d88612fea8a8f36de82e1278abb02f",
            "9de5069c5afe602b2ea0a04b66beb2c0",
        ];

        if known_malicious_hashes.contains(&hash.value.as_str()) {
            Some("Generic.Malware".to_string())
        } else {
            None
        }
    }

    /// Export observables to JSON
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    /// Import observables from JSON
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
}

impl Observable {
    /// Create a file observable
    pub fn file(name: String, path: String) -> Self {
        Self {
            name,
            value: path,
            observable_type: "file".to_string(),
            type_id: ObservableTypeId::File as i32,
            reputation: None,
            data: None,
            attributes: None,
        }
    }

    /// Create an IP observable
    pub fn ip(name: String, ip: String) -> Self {
        Self {
            name,
            value: ip,
            observable_type: "ipv4".to_string(),
            type_id: ObservableTypeId::IPv4 as i32,
            reputation: None,
            data: None,
            attributes: None,
        }
    }

    /// Create a domain observable
    pub fn domain(name: String, domain: String) -> Self {
        Self {
            name,
            value: domain,
            observable_type: "domain".to_string(),
            type_id: ObservableTypeId::Domain as i32,
            reputation: None,
            data: None,
            attributes: None,
        }
    }

    /// Create a URL observable
    pub fn url(name: String, url: String) -> Self {
        Self {
            name,
            value: url,
            observable_type: "url".to_string(),
            type_id: ObservableTypeId::URL as i32,
            reputation: None,
            data: None,
            attributes: None,
        }
    }

    /// Create a hash observable
    pub fn hash(name: String, hash: String, algorithm: String) -> Self {
        Self {
            name,
            value: hash,
            observable_type: "hash".to_string(),
            type_id: ObservableTypeId::Hash as i32,
            reputation: None,
            data: Some(serde_json::json!({ "algorithm": algorithm })),
            attributes: None,
        }
    }

    /// Create a user observable
    pub fn user(name: String, username: String) -> Self {
        Self {
            name,
            value: username,
            observable_type: "user".to_string(),
            type_id: ObservableTypeId::User as i32,
            reputation: None,
            data: None,
            attributes: None,
        }
    }

    /// Create an email observable
    pub fn email(name: String, email: String) -> Self {
        Self {
            name,
            value: email,
            observable_type: "email".to_string(),
            type_id: ObservableTypeId::Email as i32,
            reputation: None,
            data: None,
            attributes: None,
        }
    }
}

impl CorrelationRule {
    /// Create an exact match correlation rule
    pub fn exact_match(name: String, description: String, source_types: Vec<i32>, target_types: Vec<i32>, confidence: f64) -> Self {
        Self {
            name,
            description,
            source_types,
            target_types,
            logic: CorrelationLogic::ExactMatch,
            confidence,
            metadata: None,
        }
    }

    /// Create a fuzzy match correlation rule
    pub fn fuzzy_match(name: String, description: String, source_types: Vec<i32>, target_types: Vec<i32>, threshold: f64, confidence: f64) -> Self {
        Self {
            name,
            description,
            source_types,
            target_types,
            logic: CorrelationLogic::FuzzyMatch { threshold },
            confidence,
            metadata: None,
        }
    }

    /// Create a pattern match correlation rule
    pub fn pattern_match(name: String, description: String, source_types: Vec<i32>, target_types: Vec<i32>, pattern: String, confidence: f64) -> Self {
        Self {
            name,
            description,
            source_types,
            target_types,
            logic: CorrelationLogic::PatternMatch { pattern },
            confidence,
            metadata: None,
        }
    }
}

impl EnrichmentProvider {
    /// Create a VirusTotal enrichment provider
    pub fn virustotal(api_key: String) -> Self {
        Self {
            name: "VirusTotal".to_string(),
            provider_type: "threat_intelligence".to_string(),
            url: Some("https://www.virustotal.com/api/v3".to_string()),
            api_key: Some(api_key),
            rate_limits: Some(RateLimits {
                requests_per_minute: 4,
                requests_per_hour: 500,
                requests_per_day: 10000,
            }),
        }
    }

    /// Create an AbuseIPDB enrichment provider
    pub fn abuseipdb(api_key: String) -> Self {
        Self {
            name: "AbuseIPDB".to_string(),
            provider_type: "ip_reputation".to_string(),
            url: Some("https://api.abuseipdb.com/api/v2".to_string()),
            api_key: Some(api_key),
            rate_limits: Some(RateLimits {
                requests_per_minute: 60,
                requests_per_hour: 1000,
                requests_per_day: 10000,
            }),
        }
    }

    /// Create a WHOIS enrichment provider
    pub fn whois() -> Self {
        Self {
            name: "WHOIS".to_string(),
            provider_type: "domain_info".to_string(),
            url: Some("https://whois.arin.net".to_string()),
            api_key: None,
            rate_limits: Some(RateLimits {
                requests_per_minute: 60,
                requests_per_hour: 1000,
                requests_per_day: 10000,
            }),
        }
    }
}

impl ThreatFeed {
    /// Create a new threat feed
    pub fn new(name: String, url: String, feed_type: String, format: String) -> Self {
        Self {
            name,
            url,
            feed_type,
            format,
            last_update: None,
            confidence: 0.8,
            observables: Vec::new(),
        }
    }

    /// Update the feed
    pub fn update(&mut self, observables: Vec<Observable>) {
        self.observables = observables;
        self.last_update = Some(Utc::now());
    }

    /// Add an observable to the feed
    pub fn add_observable(&mut self, observable: Observable) {
        self.observables.push(observable);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_observable_creation() {
        let file_obs = Observable::file("suspicious_file".to_string(), "/tmp/malware.exe".to_string());
        assert_eq!(file_obs.observable_type, "file");
        assert_eq!(file_obs.type_id, ObservableTypeId::File as i32);

        let ip_obs = Observable::ip("malicious_ip".to_string(), "192.168.1.100".to_string());
        assert_eq!(ip_obs.observable_type, "ipv4");
        assert_eq!(ip_obs.type_id, ObservableTypeId::IPv4 as i32);

        let domain_obs = Observable::domain("suspicious_domain".to_string(), "malicious-site.com".to_string());
        assert_eq!(domain_obs.observable_type, "domain");
        assert_eq!(domain_obs.type_id, ObservableTypeId::Domain as i32);
    }

    #[test]
    fn test_observable_manager() {
        let mut manager = ObservableManager::new();

        let file_obs = Observable::file("test_file".to_string(), "/test/file.txt".to_string());
        let ip_obs = Observable::ip("test_ip".to_string(), "10.0.0.1".to_string());

        manager.add_observable(file_obs);
        manager.add_observable(ip_obs);

        assert_eq!(manager.observables.len(), 2);

        let files = manager.find_by_type(ObservableTypeId::File as i32);
        assert_eq!(files.len(), 1);

        let ips = manager.find_by_type(ObservableTypeId::IPv4 as i32);
        assert_eq!(ips.len(), 1);
    }

    #[test]
    fn test_correlation_rules() {
        let rule = CorrelationRule::exact_match(
            "file_to_ip".to_string(),
            "Correlate files with IPs".to_string(),
            vec![ObservableTypeId::File as i32],
            vec![ObservableTypeId::IPv4 as i32],
            0.8,
        );

        assert_eq!(rule.name, "file_to_ip");
        assert_eq!(rule.source_types, vec![ObservableTypeId::File as i32]);
        assert_eq!(rule.target_types, vec![ObservableTypeId::IPv4 as i32]);
    }

    #[test]
    fn test_enrichment_providers() {
        let vt_provider = EnrichmentProvider::virustotal("test_key".to_string());
        assert_eq!(vt_provider.name, "VirusTotal");
        assert_eq!(vt_provider.provider_type, "threat_intelligence");

        let whois_provider = EnrichmentProvider::whois();
        assert_eq!(whois_provider.name, "WHOIS");
        assert_eq!(whois_provider.api_key, None);
    }

    #[test]
    fn test_threat_feed() {
        let mut feed = ThreatFeed::new(
            "Test Feed".to_string(),
            "https://example.com/feed".to_string(),
            "malware".to_string(),
            "json".to_string(),
        );

        let observable = Observable::hash("test_hash".to_string(), "abc123".to_string(), "SHA256".to_string());
        feed.add_observable(observable);

        assert_eq!(feed.observables.len(), 1);
        assert_eq!(feed.name, "Test Feed");
    }

    #[test]
    fn test_pivot_creation() {
        let mut manager = ObservableManager::new();

        let domain_obs = Observable::domain("test_domain".to_string(), "example.com".to_string());
        let ip_obs = Observable::ip("test_ip".to_string(), "93.184.216.34".to_string());
        let hash_obs = Observable::hash("test_hash".to_string(), "44d88612fea8a8f36de82e1278abb02f".to_string(), "MD5".to_string());

        manager.add_observable(domain_obs);
        manager.add_observable(ip_obs);
        manager.add_observable(hash_obs);

        let pivots = manager.create_pivots();
        assert!(!pivots.is_empty());

        // Should find at least one pivot (domain to IP)
        let domain_ip_pivots: Vec<_> = pivots.iter().filter(|p| matches!(p.pivot_type, PivotType::DomainToIP)).collect();
        assert!(!domain_ip_pivots.is_empty());
    }

    #[test]
    fn test_json_serialization() {
        let mut manager = ObservableManager::new();
        let observable = Observable::file("test".to_string(), "/test".to_string());
        manager.add_observable(observable);

        let json = manager.to_json().unwrap();
        let deserialized: ObservableManager = ObservableManager::from_json(&json).unwrap();

        assert_eq!(deserialized.observables.len(), 1);
        assert_eq!(deserialized.observables[0].name, "test");
    }
}