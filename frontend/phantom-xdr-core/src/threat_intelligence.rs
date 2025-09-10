use crate::types::*;
use async_trait::async_trait;
use dashmap::DashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc, Duration};
use reqwest::Client;
use napi_derive::napi;

#[async_trait]
pub trait ThreatIntelligenceTrait {
    async fn update_feeds(&self) -> FeedUpdateResult;
    async fn enrich_indicator(&self, indicator: &mut ThreatIndicator) -> Result<(), String>;
    async fn get_status(&self) -> ComponentStatus;
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct FeedUpdateResult {
    pub feeds_updated: u32,
    pub indicators_added: u32,
    pub errors: Vec<String>,
    pub timestamp: i64,
}

#[derive(Clone)]
pub struct ThreatIntelligence {
    feeds: Arc<DashMap<String, ThreatFeed>>,
    indicators: Arc<DashMap<String, ThreatIndicator>>,
    http_client: Client,
    processed_indicators: Arc<RwLock<u64>>,
    feed_update_errors: Arc<RwLock<u32>>,
    last_error: Arc<RwLock<Option<String>>>,
}

impl ThreatIntelligence {
    pub fn new() -> Self {
        let mut ti = Self {
            feeds: Arc::new(DashMap::new()),
            indicators: Arc::new(DashMap::new()),
            http_client: Client::new(),
            processed_indicators: Arc::new(RwLock::new(0)),
            feed_update_errors: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        };

        ti.initialize_default_feeds();
        ti
    }

    fn initialize_default_feeds(&mut self) {
        let feeds = vec![
            ThreatFeed {
                id: "abuseipdb".to_string(),
                name: "AbuseIPDB".to_string(),
                source: "https://api.abuseipdb.com/api/v2/blacklist".to_string(),
                feed_type: FeedType::Open,
                format: FeedFormat::JSON,
                update_frequency: 60, // minutes
                last_update: (Utc::now() - Duration::hours(2)).timestamp(),
                reliability: 0.8,
                indicators: vec![],
            },
            ThreatFeed {
                id: "alienvault_otx".to_string(),
                name: "AlienVault OTX".to_string(),
                source: "https://otx.alienvault.com/api/v1/indicators/export".to_string(),
                feed_type: FeedType::Open,
                format: FeedFormat::STIX,
                update_frequency: 30,
                last_update: (Utc::now() - Duration::hours(1)).timestamp(),
                reliability: 0.9,
                indicators: vec![],
            },
            ThreatFeed {
                id: "malware_domains".to_string(),
                name: "Malware Domains".to_string(),
                source: "https://malware-domains.com/files/domains.txt".to_string(),
                feed_type: FeedType::Open,
                format: FeedFormat::CSV,
                update_frequency: 120,
                last_update: (Utc::now() - Duration::hours(3)).timestamp(),
                reliability: 0.7,
                indicators: vec![],
            },
            ThreatFeed {
                id: "phishtank".to_string(),
                name: "PhishTank".to_string(),
                source: "https://data.phishtank.com/data/online-valid.csv".to_string(),
                feed_type: FeedType::Open,
                format: FeedFormat::CSV,
                update_frequency: 15,
                last_update: (Utc::now() - Duration::minutes(30)).timestamp(),
                reliability: 0.85,
                indicators: vec![],
            },
        ];

        for feed in feeds {
            self.feeds.insert(feed.id.clone(), feed);
        }
    }

    pub async fn add_feed(&self, feed: ThreatFeed) -> Result<(), String> {
        let feed_id = feed.id.clone();
        if self.feeds.contains_key(&feed_id) {
            return Err(format!("Feed with ID {} already exists", feed_id));
        }
        self.feeds.insert(feed_id, feed);
        Ok(())
    }

    pub async fn update_feed(&self, feed_id: String, feed: ThreatFeed) -> Result<(), String> {
        if !self.feeds.contains_key(&feed_id) {
            return Err(format!("Feed with ID {} not found", feed_id));
        }
        self.feeds.insert(feed_id, feed);
        Ok(())
    }

    pub async fn remove_feed(&self, feed_id: &str) -> Result<(), String> {
        if self.feeds.remove(feed_id).is_none() {
            return Err(format!("Feed with ID {} not found", feed_id));
        }
        Ok(())
    }

    pub async fn get_feed(&self, feed_id: &str) -> Option<ThreatFeed> {
        self.feeds.get(feed_id).map(|f| f.clone())
    }

    pub async fn list_feeds(&self) -> Vec<ThreatFeed> {
        self.feeds.iter().map(|f| f.clone()).collect()
    }

    pub async fn add_indicator(&self, indicator: ThreatIndicator) -> Result<(), String> {
        self.indicators.insert(indicator.id.clone(), indicator);
        Ok(())
    }

    pub async fn get_indicator(&self, indicator_id: &str) -> Option<ThreatIndicator> {
        self.indicators.get(indicator_id).map(|i| i.clone())
    }

    pub async fn search_indicators(&self, query: &str, indicator_type: Option<IndicatorType>) -> Vec<ThreatIndicator> {
        self.indicators
            .iter()
            .filter(|indicator| {
                let matches_query = indicator.value.contains(query) ||
                                  indicator.tags.iter().any(|tag| tag.contains(query));
                let matches_type = indicator_type.as_ref().map_or(true, |t| matches!(&indicator.indicator_type, t));
                matches_query && matches_type
            })
            .map(|i| i.clone())
            .collect()
    }

    async fn fetch_feed_data(&self, feed: &ThreatFeed) -> Result<Vec<ThreatIndicator>, String> {
        match feed.format {
            FeedFormat::JSON => self.fetch_json_feed(feed).await,
            FeedFormat::STIX => self.fetch_stix_feed(feed).await,
            FeedFormat::CSV => self.fetch_csv_feed(feed).await,
            FeedFormat::XML => self.fetch_xml_feed(feed).await,
            FeedFormat::Custom => self.fetch_custom_feed(feed).await,
        }
    }

    async fn fetch_json_feed(&self, feed: &ThreatFeed) -> Result<Vec<ThreatIndicator>, String> {
        let response = self.http_client
            .get(&feed.source)
            .send()
            .await
            .map_err(|e| format!("HTTP request failed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("HTTP {}: {}", response.status(), feed.source));
        }

        let json_data: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("JSON parsing failed: {}", e))?;

        // Parse JSON feed (simplified implementation)
        self.parse_json_indicators(&json_data, feed)
    }

    async fn fetch_stix_feed(&self, feed: &ThreatFeed) -> Result<Vec<ThreatIndicator>, String> {
        let response = self.http_client
            .get(&feed.source)
            .send()
            .await
            .map_err(|e| format!("HTTP request failed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("HTTP {}: {}", response.status(), feed.source));
        }

        let stix_data: String = response
            .text()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))?;

        // Parse STIX feed (simplified implementation)
        self.parse_stix_indicators(&stix_data, feed)
    }

    async fn fetch_csv_feed(&self, feed: &ThreatFeed) -> Result<Vec<ThreatIndicator>, String> {
        let response = self.http_client
            .get(&feed.source)
            .send()
            .await
            .map_err(|e| format!("HTTP request failed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("HTTP {}: {}", response.status(), feed.source));
        }

        let csv_data: String = response
            .text()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))?;

        // Parse CSV feed (simplified implementation)
        self.parse_csv_indicators(&csv_data, feed)
    }

    async fn fetch_xml_feed(&self, feed: &ThreatFeed) -> Result<Vec<ThreatIndicator>, String> {
        let response = self.http_client
            .get(&feed.source)
            .send()
            .await
            .map_err(|e| format!("HTTP request failed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("HTTP {}: {}", response.status(), feed.source));
        }

        let xml_data: String = response
            .text()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))?;

        // Parse XML feed (simplified implementation)
        self.parse_xml_indicators(&xml_data, feed)
    }

    async fn fetch_custom_feed(&self, feed: &ThreatFeed) -> Result<Vec<ThreatIndicator>, String> {
        // Custom feed parsing logic would go here
        // For now, return empty vector
        Ok(vec![])
    }

    fn parse_json_indicators(&self, json_data: &serde_json::Value, feed: &ThreatFeed) -> Result<Vec<ThreatIndicator>, String> {
        let mut indicators = Vec::new();

        // Simplified JSON parsing - in reality this would be more complex
        if let Some(array) = json_data.as_array() {
            for item in array {
                if let Some(indicator) = self.parse_json_indicator(item, feed) {
                    indicators.push(indicator);
                }
            }
        }

        Ok(indicators)
    }

    fn parse_json_indicator(&self, item: &serde_json::Value, feed: &ThreatFeed) -> Option<ThreatIndicator> {
        let id = format!("{}_{}", feed.id, uuid::Uuid::new_v4());
        let value = item.get("value")?.as_str()?.to_string();
        let indicator_type = self.infer_indicator_type(&value);

        Some(ThreatIndicator {
            id,
            indicator_type,
            value,
            confidence: feed.reliability,
            severity: Severity::Medium,
            source: feed.name.clone(),
            timestamp: Utc::now().timestamp(),
            tags: vec!["threat_intel".to_string()],
            context: IndicatorContext {
                geolocation: None,
                asn: None,
                category: Some("threat_feed".to_string()),
                first_seen: Some(Utc::now().timestamp()),
                last_seen: Some(Utc::now().timestamp()),
                related_indicators: vec![],
            },
            enrichment_data: None,
        })
    }

    fn parse_stix_indicators(&self, stix_data: &str, feed: &ThreatFeed) -> Result<Vec<ThreatIndicator>, String> {
        // Simplified STIX parsing
        let mut indicators = Vec::new();

        // In a real implementation, this would parse STIX JSON format
        // For now, return empty vector
        Ok(indicators)
    }

    fn parse_csv_indicators(&self, csv_data: &str, feed: &ThreatFeed) -> Result<Vec<ThreatIndicator>, String> {
        let mut indicators = Vec::new();

        for line in csv_data.lines().skip(1) { // Skip header
            let parts: Vec<&str> = line.split(',').collect();
            if parts.len() > 0 {
                let value = parts[0].trim().to_string();
                if !value.is_empty() {
                    let indicator_type = self.infer_indicator_type(&value);
                    let id = format!("{}_{}", feed.id, uuid::Uuid::new_v4());

                    indicators.push(ThreatIndicator {
                        id,
                        indicator_type,
                        value,
                        confidence: feed.reliability,
                        severity: Severity::Medium,
                        source: feed.name.clone(),
                        timestamp: Utc::now().timestamp(),
                        tags: vec!["threat_intel".to_string()],
                        context: IndicatorContext {
                            geolocation: None,
                            asn: None,
                            category: Some("threat_feed".to_string()),
                            first_seen: Some(Utc::now().timestamp()),
                            last_seen: Some(Utc::now().timestamp()),
                            related_indicators: vec![],
                        },
                        enrichment_data: None,
                    });
                }
            }
        }

        Ok(indicators)
    }

    fn parse_xml_indicators(&self, xml_data: &str, feed: &ThreatFeed) -> Result<Vec<ThreatIndicator>, String> {
        // Simplified XML parsing
        let mut indicators = Vec::new();

        // In a real implementation, this would parse XML format
        // For now, return empty vector
        Ok(indicators)
    }

    fn infer_indicator_type(&self, value: &str) -> IndicatorType {
        if value.contains('.') && value.split('.').count() == 4 {
            // Simple IP detection
            IndicatorType::IP
        } else if value.contains('.') && value.split('.').count() > 1 {
            // Simple domain detection
            IndicatorType::Domain
        } else if value.starts_with("http") {
            IndicatorType::URL
        } else if value.len() == 64 && value.chars().all(|c| c.is_ascii_hexdigit()) {
            // SHA256 hash
            IndicatorType::Hash
        } else {
            IndicatorType::Domain // Default fallback
        }
    }

    async fn enrich_with_geolocation(&self, indicator: &mut ThreatIndicator) {
        if let IndicatorType::IP = indicator.indicator_type {
            // In a real implementation, this would call a geolocation service
            indicator.context.geolocation = Some("Unknown".to_string());
        }
    }

    async fn enrich_with_whois(&self, indicator: &mut ThreatIndicator) {
        if let IndicatorType::Domain = indicator.indicator_type {
            // In a real implementation, this would perform WHOIS lookup
            indicator.enrichment_data = Some(EnrichmentData {
                whois: Some(WhoisData {
                    registrar: Some("Unknown".to_string()),
                    creation_date: Some((Utc::now() - Duration::days(365)).timestamp()),
                    expiration_date: Some((Utc::now() + Duration::days(365)).timestamp()),
                    registrant: Some("Unknown".to_string()),
                }),
                reputation: None,
                malware_analysis: None,
                threat_intel: None,
            });
        }
    }

    async fn enrich_with_reputation(&self, indicator: &mut ThreatIndicator) {
        // In a real implementation, this would query reputation services
        if indicator.enrichment_data.is_none() {
            indicator.enrichment_data = Some(EnrichmentData {
                whois: None,
                reputation: Some(ReputationData {
                    score: 0.5,
                    sources: vec!["threat_intel".to_string()],
                    categories: vec!["unknown".to_string()],
                }),
                malware_analysis: None,
                threat_intel: None,
            });
        } else if let Some(ref mut enrichment) = indicator.enrichment_data {
            enrichment.reputation = Some(ReputationData {
                score: 0.5,
                sources: vec!["threat_intel".to_string()],
                categories: vec!["unknown".to_string()],
            });
        }
    }
}

#[async_trait]
impl ThreatIntelligenceTrait for ThreatIntelligence {
    async fn update_feeds(&self) -> FeedUpdateResult {
        let mut feeds_updated = 0;
        let mut indicators_added = 0;
        let mut errors = Vec::new();

        for feed_ref in self.feeds.iter() {
            let feed_id = feed_ref.key().clone();
            let feed = feed_ref.value().clone();

            // Check if feed needs updating
            let time_since_update = Utc::now().signed_duration_since(DateTime::from_timestamp(feed.last_update, 0).unwrap());
            if time_since_update.num_minutes() < feed.update_frequency as i64 {
                continue;
            }

            match self.fetch_feed_data(&feed).await {
                Ok(new_indicators) => {
                    for indicator in new_indicators {
                        if !self.indicators.contains_key(&indicator.id) {
                            self.indicators.insert(indicator.id.clone(), indicator);
                            indicators_added += 1;
                        }
                    }

                    // Update feed's last_update timestamp
                    if let Some(mut feed_mut) = self.feeds.get_mut(&feed_id) {
                        feed_mut.last_update = Utc::now().timestamp();
                    }

                    feeds_updated += 1;
                }
                Err(e) => {
                    errors.push(format!("Failed to update feed {}: {}", feed.name, e));
                    let mut feed_errors = self.feed_update_errors.write().await;
                    *feed_errors += 1;
                }
            }
        }

        FeedUpdateResult {
            feeds_updated,
            indicators_added,
            errors,
            timestamp: Utc::now().timestamp(),
        }
    }

    async fn enrich_indicator(&self, indicator: &mut ThreatIndicator) -> Result<(), String> {
        let mut processed_indicators = self.processed_indicators.write().await;
        *processed_indicators += 1;

        // Perform enrichment based on indicator type
        match indicator.indicator_type {
            IndicatorType::IP => {
                self.enrich_with_geolocation(indicator).await;
            }
            IndicatorType::Domain => {
                self.enrich_with_whois(indicator).await;
                self.enrich_with_reputation(indicator).await;
            }
            IndicatorType::URL => {
                self.enrich_with_reputation(indicator).await;
            }
            _ => {
                self.enrich_with_reputation(indicator).await;
            }
        }

        Ok(())
    }

    async fn get_status(&self) -> ComponentStatus {
        let processed_indicators = *self.processed_indicators.read().await;
        let feed_update_errors = *self.feed_update_errors.read().await;
        let last_error = self.last_error.read().await.clone();

        ComponentStatus {
            status: "operational".to_string(),
            uptime: 0, // Would need to track actual uptime
            processed_events: processed_indicators as i64,
            active_alerts: feed_update_errors,
            last_error,
        }
    }
}
