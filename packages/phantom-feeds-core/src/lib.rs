// phantom-feeds-core/src/lib.rs
// Threat intelligence feed aggregation and processing library

use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatFeed {
    pub feed_id: String,
    pub name: String,
    pub description: String,
    pub feed_type: FeedType,
    pub format: FeedFormat,
    pub url: String,
    pub update_frequency: String,
    pub reliability_score: f64,
    pub last_updated: DateTime<Utc>,
    pub status: FeedStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FeedType {
    IOC,
    STIX,
    MISP,
    YARA,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FeedFormat {
    JSON,
    XML,
    CSV,
    TXT,
    STIX2,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FeedStatus {
    Active,
    Inactive,
    Error,
    Updating,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedIndicator {
    pub indicator: String,
    pub indicator_type: String,
    pub malware_family: Option<String>,
    pub threat_actor: Option<String>,
    pub confidence: f64,
    pub tags: Vec<String>,
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
    pub source_feed: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedAggregationResult {
    pub total_indicators: u32,
    pub unique_indicators: u32,
    pub feeds_processed: u32,
    pub processing_time: u64,
    pub indicators_by_type: HashMap<String, u32>,
    pub top_malware_families: Vec<String>,
    pub processing_errors: Vec<String>,
}

pub struct FeedsCore {
    feeds: HashMap<String, ThreatFeed>,
    indicators: HashMap<String, FeedIndicator>,
}

impl FeedsCore {
    pub fn new() -> Result<Self, String> {
        let mut feeds = HashMap::new();
        
        feeds.insert("alienvault_otx".to_string(), ThreatFeed {
            feed_id: "alienvault_otx".to_string(),
            name: "AlienVault OTX".to_string(),
            description: "Open Threat Exchange feed".to_string(),
            feed_type: FeedType::IOC,
            format: FeedFormat::JSON,
            url: "https://otx.alienvault.com/api/v1/indicators".to_string(),
            update_frequency: "hourly".to_string(),
            reliability_score: 0.8,
            last_updated: Utc::now(),
            status: FeedStatus::Active,
        });

        feeds.insert("misp_feed".to_string(), ThreatFeed {
            feed_id: "misp_feed".to_string(),
            name: "MISP Feed".to_string(),
            description: "Malware Information Sharing Platform feed".to_string(),
            feed_type: FeedType::MISP,
            format: FeedFormat::JSON,
            url: "https://misp.example.com/feed".to_string(),
            update_frequency: "daily".to_string(),
            reliability_score: 0.9,
            last_updated: Utc::now(),
            status: FeedStatus::Active,
        });

        Ok(Self {
            feeds,
            indicators: HashMap::new(),
        })
    }

    pub fn add_feed(&mut self, feed: ThreatFeed) -> Result<(), String> {
        self.feeds.insert(feed.feed_id.clone(), feed);
        Ok(())
    }

    pub fn update_feed(&mut self, feed_id: &str) -> Result<FeedAggregationResult, String> {
        let feed = match self.feeds.get_mut(feed_id) {
            Some(feed) => feed,
            None => return Err(format!("Feed {} not found", feed_id)),
        };

        feed.status = FeedStatus::Updating;
        feed.last_updated = Utc::now();

        // Simulate feed processing
        let start_time = std::time::Instant::now();
        
        // Generate sample indicators
        for i in 0..100 {
            let indicator_id = format!("{}_{}", feed_id, i);
            let indicator = FeedIndicator {
                indicator: format!("192.168.1.{}", i + 1),
                indicator_type: "ip".to_string(),
                malware_family: Some("TestMalware".to_string()),
                threat_actor: Some("TestActor".to_string()),
                confidence: 0.7,
                tags: vec!["malicious".to_string(), "c2".to_string()],
                first_seen: Utc::now(),
                last_seen: Utc::now(),
                source_feed: feed_id.to_string(),
            };
            
            self.indicators.insert(indicator_id, indicator);
        }

        feed.status = FeedStatus::Active;

        let processing_time = start_time.elapsed().as_millis() as u64;
        
        let mut indicators_by_type = HashMap::new();
        indicators_by_type.insert("ip".to_string(), 100);

        Ok(FeedAggregationResult {
            total_indicators: 100,
            unique_indicators: 100,
            feeds_processed: 1,
            processing_time,
            indicators_by_type,
            top_malware_families: vec!["TestMalware".to_string()],
            processing_errors: vec![],
        })
    }

    pub fn search_indicators(&self, query: &str) -> Result<Vec<FeedIndicator>, String> {
        let results: Vec<FeedIndicator> = self.indicators
            .values()
            .filter(|indicator| {
                indicator.indicator.contains(query) ||
                indicator.malware_family.as_ref().map_or(false, |f| f.contains(query)) ||
                indicator.threat_actor.as_ref().map_or(false, |a| a.contains(query))
            })
            .cloned()
            .collect();

        Ok(results)
    }

    pub fn get_feed_status(&self) -> Result<Vec<ThreatFeed>, String> {
        Ok(self.feeds.values().cloned().collect())
    }
}

#[napi]
pub struct FeedsCoreNapi {
    inner: FeedsCore,
}

#[napi]
impl FeedsCoreNapi {
    #[napi(constructor)]
    pub fn new() -> napi::Result<Self> {
        let core = FeedsCore::new()
            .map_err(|e| napi::Error::from_reason(format!("Failed to create Feeds Core: {}", e)))?;
        Ok(FeedsCoreNapi { inner: core })
    }

    #[napi]
    pub fn add_feed(&mut self, feed_json: String) -> napi::Result<()> {
        let feed: ThreatFeed = serde_json::from_str(&feed_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse feed: {}", e)))?;

        self.inner.add_feed(feed)
            .map_err(|e| napi::Error::from_reason(format!("Failed to add feed: {}", e)))
    }

    #[napi]
    pub fn update_feed(&mut self, feed_id: String) -> napi::Result<String> {
        let result = self.inner.update_feed(&feed_id)
            .map_err(|e| napi::Error::from_reason(format!("Failed to update feed: {}", e)))?;

        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize result: {}", e)))
    }

    #[napi]
    pub fn search_indicators(&self, query: String) -> napi::Result<String> {
        let results = self.inner.search_indicators(&query)
            .map_err(|e| napi::Error::from_reason(format!("Failed to search indicators: {}", e)))?;

        serde_json::to_string(&results)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize results: {}", e)))
    }

    #[napi]
    pub fn get_feed_status(&self) -> napi::Result<String> {
        let status = self.inner.get_feed_status()
            .map_err(|e| napi::Error::from_reason(format!("Failed to get feed status: {}", e)))?;

        serde_json::to_string(&status)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize status: {}", e)))
    }

    #[napi]
    pub fn get_health_status(&self) -> napi::Result<String> {
        let status = serde_json::json!({
            "status": "healthy",
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "version": env!("CARGO_PKG_VERSION")
        });

        serde_json::to_string(&status)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize health status: {}", e)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_feeds_core_creation() {
        let core = FeedsCore::new();
        assert!(core.is_ok());
    }
}
