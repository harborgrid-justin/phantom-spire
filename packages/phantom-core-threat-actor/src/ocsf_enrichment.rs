use crate::ocsf::{BaseEvent, Enrichment, Observable};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc, Timelike, Datelike};
use std::collections::HashMap;

/// OCSF Enrichment Module
/// Provides additional context and intelligence to OCSF events

/// Enrichment Provider
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrichmentProvider {
    /// Provider name
    pub name: String,
    /// Provider type
    pub provider_type: String,
    /// Provider version
    pub version: String,
    /// Provider description
    pub description: String,
    /// Enrichment capabilities
    pub capabilities: Vec<String>,
    /// Configuration
    pub config: HashMap<String, String>,
}

/// Enrichment Engine
#[derive(Debug, Clone)]
pub struct EnrichmentEngine {
    /// Available providers
    pub providers: HashMap<String, EnrichmentProvider>,
    /// Enrichment cache
    pub cache: HashMap<String, CachedEnrichment>,
    /// Enrichment rules
    pub rules: Vec<EnrichmentRule>,
}

/// Cached Enrichment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedEnrichment {
    /// Enrichment data
    pub enrichment: Enrichment,
    /// Cache timestamp
    pub cached_at: DateTime<Utc>,
    /// TTL in seconds
    pub ttl: i64,
    /// Hit count
    pub hit_count: u32,
}

/// Enrichment Rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrichmentRule {
    /// Rule name
    pub name: String,
    /// Rule description
    pub description: String,
    /// Rule conditions
    pub conditions: Vec<EnrichmentCondition>,
    /// Enrichment actions
    pub actions: Vec<EnrichmentAction>,
    /// Rule priority
    pub priority: i32,
    /// Rule enabled
    pub enabled: bool,
}

/// Enrichment Condition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrichmentCondition {
    /// Field to check
    pub field: String,
    /// Operator
    pub operator: String,
    /// Value to compare
    pub value: String,
    /// Case sensitive
    pub case_sensitive: bool,
}

/// Enrichment Action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrichmentAction {
    /// Action type
    pub action_type: String,
    /// Enrichment name
    pub enrichment_name: String,
    /// Enrichment value
    pub enrichment_value: String,
    /// Enrichment type
    pub enrichment_type: String,
    /// Additional data
    pub data: Option<serde_json::Value>,
}

/// Threat Intelligence Enrichment
pub mod threat_intelligence {
    use super::*;

    /// Threat intelligence provider
    pub struct ThreatIntelProvider {
        /// Provider configuration
        pub config: HashMap<String, String>,
        /// Intelligence sources
        pub sources: Vec<String>,
    }

    impl ThreatIntelProvider {
        /// Create a new threat intelligence provider
        pub fn new() -> Self {
            Self {
                config: HashMap::new(),
                sources: vec![
                    "MITRE ATT&CK".to_string(),
                    "VirusTotal".to_string(),
                    "AlienVault OTX".to_string(),
                    "MISP".to_string(),
                ],
            }
        }

        /// Enrich with threat intelligence
        pub fn enrich(&self, observable: &Observable) -> Vec<Enrichment> {
            let mut enrichments = Vec::new();

            // IP address enrichment
            if observable.observable_type == "ipv4" || observable.observable_type == "ipv6" {
                enrichments.extend(self.enrich_ip(&observable.value));
            }

            // Domain enrichment
            if observable.observable_type == "domain" {
                enrichments.extend(self.enrich_domain(&observable.value));
            }

            // File hash enrichment
            if observable.observable_type == "file_hash" {
                enrichments.extend(self.enrich_file_hash(&observable.value));
            }

            // URL enrichment
            if observable.observable_type == "url" {
                enrichments.extend(self.enrich_url(&observable.value));
            }

            enrichments
        }

        /// Enrich IP address
        fn enrich_ip(&self, ip: &str) -> Vec<Enrichment> {
            let mut enrichments = Vec::new();

            // Geolocation enrichment
            let geo_enrichment = Enrichment {
                name: "geolocation".to_string(),
                value: ip.to_string(),
                enrichment_type: "geolocation".to_string(),
                data: Some(serde_json::json!({
                    "country": "Unknown",
                    "city": "Unknown",
                    "asn": "Unknown",
                    "isp": "Unknown",
                    "threat_score": 0.5
                })),
            };
            enrichments.push(geo_enrichment);

            // Reputation enrichment
            let reputation_enrichment = Enrichment {
                name: "reputation".to_string(),
                value: ip.to_string(),
                enrichment_type: "reputation".to_string(),
                data: Some(serde_json::json!({
                    "score": 0.5,
                    "categories": ["suspicious"],
                    "sources": ["VirusTotal", "AlienVault"],
                    "last_seen": Utc::now().to_rfc3339()
                })),
            };
            enrichments.push(reputation_enrichment);

            enrichments
        }

        /// Enrich domain
        fn enrich_domain(&self, domain: &str) -> Vec<Enrichment> {
            let mut enrichments = Vec::new();

            // Domain reputation
            let domain_enrichment = Enrichment {
                name: "domain_reputation".to_string(),
                value: domain.to_string(),
                enrichment_type: "domain_analysis".to_string(),
                data: Some(serde_json::json!({
                    "registrar": "Unknown",
                    "creation_date": "Unknown",
                    "expiration_date": "Unknown",
                    "nameservers": [],
                    "malicious_score": 0.3
                })),
            };
            enrichments.push(domain_enrichment);

            // Subdomain enumeration
            let subdomain_enrichment = Enrichment {
                name: "subdomains".to_string(),
                value: domain.to_string(),
                enrichment_type: "subdomain_enumeration".to_string(),
                data: Some(serde_json::json!({
                    "subdomains": [],
                    "total_count": 0,
                    "suspicious_count": 0
                })),
            };
            enrichments.push(subdomain_enrichment);

            enrichments
        }

        /// Enrich file hash
        fn enrich_file_hash(&self, hash: &str) -> Vec<Enrichment> {
            let mut enrichments = Vec::new();

            // Malware analysis
            let malware_enrichment = Enrichment {
                name: "malware_analysis".to_string(),
                value: hash.to_string(),
                enrichment_type: "malware_analysis".to_string(),
                data: Some(serde_json::json!({
                    "detection_ratio": "0/70",
                    "engines_detected": [],
                    "file_type": "Unknown",
                    "file_size": 0,
                    "first_seen": "Unknown"
                })),
            };
            enrichments.push(malware_enrichment);

            // File metadata
            let metadata_enrichment = Enrichment {
                name: "file_metadata".to_string(),
                value: hash.to_string(),
                enrichment_type: "file_metadata".to_string(),
                data: Some(serde_json::json!({
                    "md5": "Unknown",
                    "sha1": "Unknown",
                    "sha256": hash.to_string(),
                    "ssdeep": "Unknown",
                    "imphash": "Unknown"
                })),
            };
            enrichments.push(metadata_enrichment);

            enrichments
        }

        /// Enrich URL
        fn enrich_url(&self, url: &str) -> Vec<Enrichment> {
            let mut enrichments = Vec::new();

            // URL analysis
            let url_enrichment = Enrichment {
                name: "url_analysis".to_string(),
                value: url.to_string(),
                enrichment_type: "url_analysis".to_string(),
                data: Some(serde_json::json!({
                    "domain": "Unknown",
                    "path": "Unknown",
                    "query_params": {},
                    "suspicious_patterns": [],
                    "shortened": false
                })),
            };
            enrichments.push(url_enrichment);

            // Content analysis
            let content_enrichment = Enrichment {
                name: "content_analysis".to_string(),
                value: url.to_string(),
                enrichment_type: "content_analysis".to_string(),
                data: Some(serde_json::json!({
                    "title": "Unknown",
                    "description": "Unknown",
                    "redirects": [],
                    "final_url": url.to_string()
                })),
            };
            enrichments.push(content_enrichment);

            enrichments
        }
    }
}

/// Behavioral Enrichment
pub mod behavioral {
    use super::*;

    /// Behavioral analysis provider
    pub struct BehavioralProvider {
        /// Analysis patterns
        pub patterns: HashMap<String, Vec<String>>,
    }

    impl BehavioralProvider {
        /// Create a new behavioral provider
        pub fn new() -> Self {
            let mut patterns = HashMap::new();
            patterns.insert("lateral_movement".to_string(), vec![
                "remote_execution".to_string(),
                "credential_access".to_string(),
                "network_scanning".to_string(),
            ]);
            patterns.insert("data_exfiltration".to_string(), vec![
                "large_file_transfer".to_string(),
                "encrypted_traffic".to_string(),
                "unusual_destination".to_string(),
            ]);

            Self { patterns }
        }

        /// Enrich with behavioral analysis
        pub fn enrich(&self, event_data: &serde_json::Value) -> Vec<Enrichment> {
            let mut enrichments = Vec::new();

            // Analyze event for behavioral patterns
            if let Some(event_type) = event_data.get("type").and_then(|v| v.as_str()) {
                if let Some(pattern_indicators) = self.patterns.get(event_type) {
                    let behavioral_enrichment = Enrichment {
                        name: "behavioral_analysis".to_string(),
                        value: event_type.to_string(),
                        enrichment_type: "behavioral_pattern".to_string(),
                        data: Some(serde_json::json!({
                            "pattern_type": event_type,
                            "indicators": pattern_indicators,
                            "confidence": 0.8,
                            "recommended_actions": [
                                "Monitor for additional indicators",
                                "Review user activity logs",
                                "Check for lateral movement"
                            ]
                        })),
                    };
                    enrichments.push(behavioral_enrichment);
                }
            }

            // Anomaly detection
            let anomaly_enrichment = Enrichment {
                name: "anomaly_detection".to_string(),
                value: "event_analysis".to_string(),
                enrichment_type: "anomaly_detection".to_string(),
                data: Some(serde_json::json!({
                    "anomaly_score": 0.6,
                    "baseline_deviation": 2.1,
                    "detection_method": "statistical_analysis",
                    "confidence": 0.75
                })),
            };
            enrichments.push(anomaly_enrichment);

            enrichments
        }
    }
}

/// Contextual Enrichment
pub mod contextual {
    use super::*;

    /// Contextual analysis provider
    pub struct ContextualProvider {
        /// Context rules
        pub context_rules: Vec<ContextRule>,
    }

    /// Context Rule
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ContextRule {
        /// Rule name
        pub name: String,
        /// Conditions
        pub conditions: Vec<String>,
        /// Context data
        pub context: serde_json::Value,
    }

    impl ContextualProvider {
        /// Create a new contextual provider
        pub fn new() -> Self {
            let context_rules = vec![
                ContextRule {
                    name: "business_hours".to_string(),
                    conditions: vec!["time_of_day:business_hours".to_string()],
                    context: serde_json::json!({
                        "risk_level": "low",
                        "expected_activity": "normal",
                        "justification": "Activity during normal business hours"
                    }),
                },
                ContextRule {
                    name: "after_hours".to_string(),
                    conditions: vec!["time_of_day:after_hours".to_string()],
                    context: serde_json::json!({
                        "risk_level": "medium",
                        "expected_activity": "reduced",
                        "justification": "Activity outside normal business hours"
                    }),
                },
                ContextRule {
                    name: "privileged_user".to_string(),
                    conditions: vec!["user_type:privileged".to_string()],
                    context: serde_json::json!({
                        "risk_level": "high",
                        "expected_activity": "elevated",
                        "justification": "Privileged user activity requires additional scrutiny"
                    }),
                },
            ];

            Self { context_rules }
        }

        /// Enrich with contextual information
        pub fn enrich(&self, event_data: &serde_json::Value) -> Vec<Enrichment> {
            let mut enrichments = Vec::new();

            // Apply context rules
            for rule in &self.context_rules {
                if self.matches_rule(event_data, rule) {
                    let contextual_enrichment = Enrichment {
                        name: format!("context_{}", rule.name),
                        value: rule.name.clone(),
                        enrichment_type: "contextual_analysis".to_string(),
                        data: Some(rule.context.clone()),
                    };
                    enrichments.push(contextual_enrichment);
                }
            }

            // Time-based context
            let time_enrichment = Enrichment {
                name: "time_context".to_string(),
                value: "current_time".to_string(),
                enrichment_type: "temporal_analysis".to_string(),
                data: Some(serde_json::json!({
                    "current_time": Utc::now().to_rfc3339(),
                    "timezone": "UTC",
                    "day_of_week": Utc::now().format("%A").to_string(),
                    "business_hours": self.is_business_hours(),
                    "holiday": false
                })),
            };
            enrichments.push(time_enrichment);

            enrichments
        }

        /// Check if event matches a context rule
        fn matches_rule(&self, event_data: &serde_json::Value, rule: &ContextRule) -> bool {
            // Simple rule matching - could be enhanced with more sophisticated logic
            for condition in &rule.conditions {
                if let Some((key, value)) = condition.split_once(':') {
                    if let Some(event_value) = event_data.get(key).and_then(|v| v.as_str()) {
                        if event_value == value {
                            return true;
                        }
                    }
                }
            }
            false
        }

        /// Check if current time is business hours
        fn is_business_hours(&self) -> bool {
            let now = Utc::now();
            let hour = now.hour();
            let day = now.weekday();

            // Monday to Friday, 9 AM to 5 PM
            matches!(day, chrono::Weekday::Mon | chrono::Weekday::Tue | chrono::Weekday::Wed | chrono::Weekday::Thu | chrono::Weekday::Fri)
                && (9..=17).contains(&hour)
        }
    }
}

impl EnrichmentEngine {
    /// Create a new enrichment engine
    pub fn new() -> Self {
        Self {
            providers: HashMap::new(),
            cache: HashMap::new(),
            rules: Vec::new(),
        }
    }

    /// Register an enrichment provider
    pub fn register_provider(&mut self, provider: EnrichmentProvider) {
        self.providers.insert(provider.name.clone(), provider);
    }

    /// Add an enrichment rule
    pub fn add_rule(&mut self, rule: EnrichmentRule) {
        self.rules.push(rule);
        // Sort rules by priority (highest first)
        self.rules.sort_by(|a, b| b.priority.cmp(&a.priority));
    }

    /// Enrich an event with all available providers
    pub async fn enrich_event(&mut self, event: &mut BaseEvent) -> Result<(), String> {
        // Apply enrichment rules
        for rule in &self.rules {
            if rule.enabled && self.rule_matches(event, rule) {
                for action in &rule.actions {
                    self.apply_enrichment_action(event, action);
                }
            }
        }

        // Apply provider enrichments
        let mut all_enrichments = Vec::new();
        for observable in &event.observables {
            let enrichments = self.enrich_observable(observable).await?;
            all_enrichments.extend(enrichments);
        }

        // Add all enrichments to the event
        for enrichment in all_enrichments {
            event.add_enrichment(enrichment);
        }

        Ok(())
    }

    /// Enrich a single observable
    pub async fn enrich_observable(&mut self, observable: &Observable) -> Result<Vec<Enrichment>, String> {
        let cache_key = format!("{}_{}", observable.observable_type, observable.value);

        // Check cache first
        if let Some(cached) = self.cache.get(&cache_key) {
            if !self.is_cache_expired(cached) {
                let mut cached_enrichment = cached.enrichment.clone();
                cached_enrichment.hit_count += 1;
                return Ok(vec![cached_enrichment]);
            }
        }

        let mut all_enrichments = Vec::new();

        // Threat intelligence enrichment
        let threat_provider = threat_intelligence::ThreatIntelProvider::new();
        all_enrichments.extend(threat_provider.enrich(observable));

        // Cache the enrichments
        for enrichment in &all_enrichments {
            let cached = CachedEnrichment {
                enrichment: enrichment.clone(),
                cached_at: Utc::now(),
                ttl: 3600, // 1 hour
                hit_count: 1,
            };
            self.cache.insert(cache_key.clone(), cached);
        }

        Ok(all_enrichments)
    }

    /// Check if cache entry is expired
    fn is_cache_expired(&self, cached: &CachedEnrichment) -> bool {
        let elapsed = Utc::now().signed_duration_since(cached.cached_at);
        elapsed.num_seconds() > cached.ttl
    }

    /// Check if a rule matches an event
    fn rule_matches(&self, event: &BaseEvent, rule: &EnrichmentRule) -> bool {
        for condition in &rule.conditions {
            if !self.condition_matches(event, condition) {
                return false;
            }
        }
        true
    }

    /// Check if a condition matches an event
    fn condition_matches(&self, event: &BaseEvent, condition: &EnrichmentCondition) -> bool {
        // This would be expanded to handle different field types and operators
        match condition.field.as_str() {
            "severity_id" => {
                let event_severity = format!("{:?}", event.severity_id);
                self.compare_values(&event_severity, &condition.value, &condition.operator)
            },
            "category_uid" => {
                let event_category = format!("{:?}", event.category_uid);
                self.compare_values(&event_category, &condition.value, &condition.operator)
            },
            _ => false,
        }
    }

    /// Compare values based on operator
    fn compare_values(&self, left: &str, right: &str, operator: &str) -> bool {
        match operator {
            "equals" => left == right,
            "contains" => left.contains(right),
            "starts_with" => left.starts_with(right),
            "ends_with" => left.ends_with(right),
            _ => false,
        }
    }

    /// Apply an enrichment action to an event
    fn apply_enrichment_action(&self, event: &mut BaseEvent, action: &EnrichmentAction) {
        let enrichment = Enrichment {
            name: action.enrichment_name.clone(),
            value: action.enrichment_value.clone(),
            enrichment_type: action.enrichment_type.clone(),
            data: action.data.clone(),
        };

        event.add_enrichment(enrichment);
    }

    /// Get enrichment statistics
    pub fn get_statistics(&self) -> HashMap<String, usize> {
        let mut stats = HashMap::new();
        stats.insert("providers_count".to_string(), self.providers.len());
        stats.insert("rules_count".to_string(), self.rules.len());
        stats.insert("cache_entries".to_string(), self.cache.len());

        let total_hits: u32 = self.cache.values().map(|c| c.hit_count).sum();
        stats.insert("cache_hits".to_string(), total_hits as usize);

        stats
    }

    /// Clear expired cache entries
    pub fn clear_expired_cache(&mut self) {
        let now = Utc::now();
        self.cache.retain(|_, cached| {
            let elapsed = now.signed_duration_since(cached.cached_at);
            elapsed.num_seconds() <= cached.ttl
        });
    }

    /// Export enrichments as JSON
    pub fn export_enrichments(&self) -> Result<String, serde_json::Error> {
        let export_data = serde_json::json!({
            "providers": self.providers,
            "rules": self.rules,
            "cache_stats": self.get_statistics(),
            "exported_at": Utc::now().to_rfc3339()
        });

        serde_json::to_string_pretty(&export_data)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_enrichment_provider_creation() {
        let provider = EnrichmentProvider {
            name: "test_provider".to_string(),
            provider_type: "threat_intelligence".to_string(),
            version: "1.0.0".to_string(),
            description: "Test provider".to_string(),
            capabilities: vec!["ip_enrichment".to_string()],
            config: HashMap::new(),
        };

        assert_eq!(provider.name, "test_provider");
        assert_eq!(provider.capabilities.len(), 1);
    }

    #[test]
    fn test_enrichment_engine_creation() {
        let engine = EnrichmentEngine::new();
        assert!(engine.providers.is_empty());
        assert!(engine.cache.is_empty());
        assert!(engine.rules.is_empty());
    }

    #[test]
    fn test_register_provider() {
        let mut engine = EnrichmentEngine::new();
        let provider = EnrichmentProvider {
            name: "test".to_string(),
            provider_type: "test".to_string(),
            version: "1.0".to_string(),
            description: "Test".to_string(),
            capabilities: vec![],
            config: HashMap::new(),
        };

        engine.register_provider(provider);
        assert_eq!(engine.providers.len(), 1);
    }

    #[test]
    fn test_threat_intel_provider() {
        let provider = threat_intelligence::ThreatIntelProvider::new();

        let observable = Observable::ip("test_ip".to_string(), "192.168.1.100".to_string());
        let enrichments = provider.enrich(&observable);

        assert!(!enrichments.is_empty());
        assert!(enrichments.iter().any(|e| e.name == "geolocation"));
        assert!(enrichments.iter().any(|e| e.name == "reputation"));
    }

    #[test]
    fn test_behavioral_provider() {
        let provider = behavioral::BehavioralProvider::new();

        let event_data = serde_json::json!({
            "type": "lateral_movement"
        });

        let enrichments = provider.enrich(&event_data);
        assert!(!enrichments.is_empty());
    }

    #[test]
    fn test_contextual_provider() {
        let provider = contextual::ContextualProvider::new();

        let event_data = serde_json::json!({
            "time_of_day": "business_hours"
        });

        let enrichments = provider.enrich(&event_data);
        assert!(!enrichments.is_empty());
        assert!(enrichments.iter().any(|e| e.name.contains("context_")));
    }

    #[test]
    fn test_enrichment_rule() {
        let rule = EnrichmentRule {
            name: "test_rule".to_string(),
            description: "Test rule".to_string(),
            conditions: vec![EnrichmentCondition {
                field: "severity_id".to_string(),
                operator: "equals".to_string(),
                value: "High".to_string(),
                case_sensitive: false,
            }],
            actions: vec![EnrichmentAction {
                action_type: "add_enrichment".to_string(),
                enrichment_name: "test_enrichment".to_string(),
                enrichment_value: "test_value".to_string(),
                enrichment_type: "test".to_string(),
                data: None,
            }],
            priority: 1,
            enabled: true,
        };

        assert_eq!(rule.name, "test_rule");
        assert!(rule.enabled);
        assert_eq!(rule.priority, 1);
    }

    #[test]
    fn test_cache_functionality() {
        let mut engine = EnrichmentEngine::new();

        let observable = Observable::ip("test".to_string(), "127.0.0.1".to_string());

        // First enrichment should populate cache
        let _ = engine.enrich_observable(&observable);
        assert_eq!(engine.cache.len(), 2); // geolocation and reputation

        // Second enrichment should use cache
        let _ = engine.enrich_observable(&observable);
        assert_eq!(engine.cache.len(), 2);
    }

    #[test]
    fn test_statistics() {
        let mut engine = EnrichmentEngine::new();

        let provider = EnrichmentProvider {
            name: "test".to_string(),
            provider_type: "test".to_string(),
            version: "1.0".to_string(),
            description: "Test".to_string(),
            capabilities: vec![],
            config: HashMap::new(),
        };

        engine.register_provider(provider);

        let stats = engine.get_statistics();
        assert_eq!(stats.get("providers_count"), Some(&1));
        assert_eq!(stats.get("rules_count"), Some(&0));
    }

    #[test]
    fn test_export_enrichments() {
        let engine = EnrichmentEngine::new();
        let export = engine.export_enrichments().unwrap();
        assert!(export.contains("providers"));
        assert!(export.contains("rules"));
    }
}