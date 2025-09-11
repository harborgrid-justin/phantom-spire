use chrono::Utc;
use std::collections::HashMap;
use crate::models::{
    CorrelationRule, SearchCriteria, ThreatFeed, CVE,
};
use crate::config::{ThreatIntelligenceConfig, ThreatFeedConfig, ActorsConfig};

#[allow(dead_code)]
pub struct ThreatIntelligenceEngine {
    pub(crate) feeds: HashMap<String, ThreatFeed>,
    pub(crate) correlation_rules: Vec<CorrelationRule>,
    pub(crate) config: ThreatIntelligenceConfig,
    pub(crate) actors: ActorsConfig,
}
impl ThreatIntelligenceEngine {
    pub fn new(config: ThreatIntelligenceConfig, actors: ActorsConfig, threat_feeds: HashMap<String, ThreatFeedConfig>) -> Self {
        // Extracted: centralized, deduplicated feed initialization
        let feeds = Self::init_default_feeds(&threat_feeds);
        Self { feeds, correlation_rules: Vec::new(), config, actors }
    }

    // Helper to initialize default feeds with a single timestamp and compact mapping
    fn init_default_feeds(threat_feeds: &HashMap<String, ThreatFeedConfig>) -> HashMap<String, ThreatFeed> {
        let now = Utc::now();
        let mut feeds = HashMap::new();
        for (id, feed_config) in threat_feeds {
            feeds.insert(
                id.clone(),
                ThreatFeed {
                    id: id.clone(),
                    name: feed_config.name.clone(),
                    reliability: feed_config.reliability,
                    last_updated: now,
                    feed_type: feed_config.feed_type.clone(),
                },
            );
        }
        feeds
    }

    pub fn get_intelligence_boost(&self, cve: &CVE) -> Result<f64, String> {
        // Replaced loop + mutation with iterator sum and named weights for clarity
        let feed_boost: f64 = self.feeds.values()
            .map(|feed| -> Result<f64, String> {
                Ok(if self.is_cve_in_feed(cve, feed)? { feed.reliability * self.config.feed_hit_weight } else { 0.0 })
            })
            .try_fold(0.0, |acc, v| v.map(|b| acc + b))?;

        let active_exploit_boost = if self.is_cve_being_exploited(cve)? { self.config.active_exploit_weight } else { 0.0 };
        let actor_interest_boost = if self.is_cve_targeted_by_actors(cve)? { self.config.actor_interest_weight } else { 0.0 };

        Ok((feed_boost + active_exploit_boost + actor_interest_boost).min(1.0))
    }

    pub fn find_product_vulnerabilities(&self, _vendor: &str, _product: &str) -> Result<Vec<String>, String> {
        // DRY: use helper to generate mock CVE ids
        let max_count = self.config.max_mock_cve_counts.get(0).copied().unwrap_or(5);
        let base_number = self.config.mock_cve_base_numbers.get(0).copied().unwrap_or(10_000);
        Ok(self.generate_mock_cve_ids(max_count, base_number, self.config.mock_cve_year))
    }

    pub fn find_similar_attack_patterns(&self, _attack_vector: &str) -> Result<Vec<String>, String> {
        // DRY: use helper to generate mock CVE ids
        let max_count = self.config.max_mock_cve_counts.get(1).copied().unwrap_or(3);
        let base_number = self.config.mock_cve_base_numbers.get(1).copied().unwrap_or(20_000);
        Ok(self.generate_mock_cve_ids(max_count, base_number, self.config.mock_cve_year))
    }

    pub fn find_actor_preferred_vulnerabilities(&self, _cve_id: &str) -> Result<Vec<String>, String> {
        // DRY: use helper to generate mock CVE ids
        let max_count = self.config.max_mock_cve_counts.get(2).copied().unwrap_or(4);
        let base_number = self.config.mock_cve_base_numbers.get(2).copied().unwrap_or(30_000);
        Ok(self.generate_mock_cve_ids(max_count, base_number, self.config.mock_cve_year))
    }

    // Helper: centralizes mock CVE ID generation logic used by multiple methods
    fn generate_mock_cve_ids(&self, max_count: u32, base_number: u32, year: i32) -> Vec<String> {
        let count = (self.random() % max_count) as usize;
        (0..count)
            .map(|i| format!("CVE-{}-{:04}", year, base_number + i as u32))
            .collect()
    }

    pub fn get_opportunistic_actors(&self) -> Result<Vec<String>, String> {
        Ok(self.actors.opportunistic.clone())
    }

    pub fn get_apt_actors(&self) -> Result<Vec<String>, String> {
        Ok(self.actors.apt.clone())
    }

    pub fn get_sophisticated_actors(&self) -> Result<Vec<String>, String> {
        Ok(self.actors.sophisticated.clone())
    }

    pub fn get_campaigns_by_vuln_type(&self, vuln_type: &str) -> Result<Vec<String>, String> {
        let campaigns = match vuln_type {
            "remote_code_execution" => vec![
                "Operation Aurora".to_string(),
                "WannaCry Campaign".to_string(),
                "NotPetya Attack".to_string(),
            ],
            "privilege_escalation" => vec![
                "Dirty COW Exploitation".to_string(),
                "Local Privilege Escalation Campaigns".to_string(),
            ],
            "injection" => vec![
                "SQL Injection Campaigns".to_string(),
                "Web Application Attacks".to_string(),
            ],
            _ => vec!["Generic Exploitation".to_string()],
        };
        Ok(campaigns)
    }

    pub fn get_zero_day_campaigns(&self) -> Result<Vec<String>, String> {
        Ok(vec![
            "Zero-Day Exploitation Campaign".to_string(),
            "Advanced Persistent Threats".to_string(),
        ])
    }

    pub fn get_supply_chain_campaigns(&self) -> Result<Vec<String>, String> {
        Ok(vec![
            "SolarWinds Supply Chain Attack".to_string(),
            "Log4Shell Exploitation".to_string(),
            "Kaseya VSA Attack".to_string(),
        ])
    }

    pub fn search_with_criteria(&self, criteria: SearchCriteria) -> Result<Vec<CVE>, String> {
        // Mock implementation for advanced search
        let mut results = Vec::new();
        let count = 10 + (self.random() % 20) as usize;
        for i in 0..count {
            let year = 2024;
            let number = 40000 + i as u32;
            let cve_id = format!("CVE-{}-{:04}", year, number);
            let cve = CVE {
                data_type: "CVE_RECORD".to_string(),
                data_version: "5.0".to_string(),
                cve_metadata: crate::models::CVEMetadata {
                    cve_id: cve_id.clone(),
                    assigner_org_id: "cve@mitre.org".to_string(),
                    assigner_short_name: Some("MITRE".to_string()),
                    date_published: Some(Utc::now()),
                    date_reserved: None,
                    date_updated: Some(Utc::now()),
                    state: crate::models::CVEState::Published,
                    requester_user_id: None,
                },
                containers: crate::models::CVEContainers {
                    cna: Some(crate::models::CVEContainer {
                        provider_metadata: crate::models::ProviderMetadata {
                            org_id: "cve@mitre.org".to_string(),
                            short_name: Some("MITRE".to_string()),
                            date_updated: Some(Utc::now()),
                        },
                        descriptions: vec![crate::models::CVEDescription {
                            lang: "en".to_string(),
                            value: format!("Mock vulnerability {} for testing", i),
                            supporting_media: None,
                        }],
                        affected: Some(vec![crate::models::CVEAffected {
                            vendor: criteria.vendor.clone().unwrap_or("Mock Vendor".to_string()),
                            product: criteria.product.clone().unwrap_or("Mock Product".to_string()),
                            collection_url: None,
                            package_name: None,
                            cpes: None,
                            modules: None,
                            program_files: None,
                            program_routines: None,
                            platforms: None,
                            repository: None,
                            default_status: Some(crate::models::AffectedStatus::Affected),
                            versions: Some(vec![crate::models::AffectedVersion {
                                version: "1.0.0".to_string(),
                                status: crate::models::AffectedStatus::Affected,
                                version_type: None,
                                less_than: None,
                                less_than_or_equal: None,
                                changes: None,
                            }]),
                        }]),
                        references: Some(vec![crate::models::CVEReference {
                            url: format!("https://cve.mitre.org/cgi-bin/cvename.cgi?name={}", cve_id),
                            name: Some("MITRE".to_string()),
                            tags: Some(vec!["vendor-advisory".to_string()]),
                        }]),
                        metrics: None,
                        problem_types: None,
                        credits: None,
                        impacts: None,
                        workarounds: None,
                        solutions: None,
                        exploits: None,
                        timeline: None,
                        date_public: None,
                        source: None,
                        tags: Some(vec!["web-application".to_string(), "xss".to_string()]),
                    }),
                    adp: None,
                },
            };

            // Apply search criteria
            if let Some(min_score) = criteria.severity_min {
                if let Some(metrics) = &cve.cvss_metrics() {
                    if metrics.base_score < min_score {
                        continue;
                    }
                }
            }

            if let Some(max_score) = criteria.severity_max {
                if let Some(metrics) = &cve.cvss_metrics() {
                    if metrics.base_score > max_score {
                        continue;
                    }
                }
            }

            results.push(cve);
        }

        Ok(results)
    }

    fn is_cve_in_feed(&self, _cve: &CVE, _feed: &ThreatFeed) -> Result<bool, String> {
        // Mock implementation
        Ok(self.random() % 10 < 3) // 30% chance
    }

    fn is_cve_being_exploited(&self, _cve: &CVE) -> Result<bool, String> {
        // Mock implementation
        Ok(self.random() % 10 < 2) // 20% chance
    }

    fn is_cve_targeted_by_actors(&self, _cve: &CVE) -> Result<bool, String> {
        // Mock implementation
        Ok(self.random() % 10 < 4) // 40% chance
    }

    fn random(&self) -> u32 {
        static mut SEED: u64 = 98765;
        unsafe {
            SEED = SEED.wrapping_mul(1103515245).wrapping_add(12345);
            (SEED % u32::MAX as u64) as u32
        }
    }
}

