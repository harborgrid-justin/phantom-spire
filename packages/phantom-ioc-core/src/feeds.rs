// phantom-ioc-core/src/feeds.rs
// Threat intelligence feed management and processing

use crate::types::*;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::Utc;
use reqwest::Client;

pub struct FeedManager {
    feeds: Arc<RwLock<Vec<ThreatFeed>>>,
    client: Client,
    update_interval: std::time::Duration,
}

impl FeedManager {
    pub async fn new(update_interval_secs: u64) -> Result<Self, IOCError> {
        let feeds = Arc::new(RwLock::new(Vec::new()));
        let client = Client::new();

        let manager = Self {
            feeds,
            client,
            update_interval: std::time::Duration::from_secs(update_interval_secs),
        };

        manager.initialize_feeds().await?;
        Ok(manager)
    }

    async fn initialize_feeds(&self) -> Result<(), IOCError> {
        let mut feeds = self.feeds.write().await;
        feeds.push(ThreatFeed {
            id: "alienvault_otx".to_string(),
            name: "AlienVault OTX".to_string(),
            url: "https://otx.alienvault.com/api/v1/indicators/export".to_string(),
            format: FeedFormat::JSON,
            api_key: None,
            enabled: true,
            last_update: None,
            update_interval: 3600, // 1 hour
            reliability_score: 0.85,
        });

        feeds.push(ThreatFeed {
            id: "misp".to_string(),
            name: "MISP Threat Sharing".to_string(),
            url: "https://misp.example.com/feeds/export".to_string(),
            format: FeedFormat::JSON,
            api_key: Some("mock_api_key".to_string()),
            enabled: true,
            last_update: None,
            update_interval: 1800, // 30 minutes
            reliability_score: 0.9,
        });
        Ok(())
    }

    pub async fn fetch_feed_data(&self, feed_id: &str) -> Result<Vec<IOC>, IOCError> {
        let feeds = self.feeds.read().await;
        let feed = feeds.iter().find(|f| f.id == feed_id)
            .ok_or(IOCError::FeedNotFound)?;

        if !feed.enabled {
            return Err(IOCError::FeedDisabled);
        }

        // Mock feed data for demonstration
        let mock_iocs = vec![
            IOC {
                id: Uuid::new_v4().to_string(),
                indicator_type: IndicatorType::IP,
                value: "192.168.1.100".to_string(),
                confidence: 0.8,
                severity: Severity::High,
                source: feed.name.clone(),
                timestamp: Utc::now(),
                tags: vec!["malware".to_string(), "c2".to_string()],
                metadata: HashMap::new(),
            },
            IOC {
                id: Uuid::new_v4().to_string(),
                indicator_type: IndicatorType::Domain,
                value: "malicious.example.com".to_string(),
                confidence: 0.9,
                severity: Severity::Critical,
                source: feed.name.clone(),
                timestamp: Utc::now(),
                tags: vec!["phishing".to_string()],
                metadata: HashMap::new(),
            },
        ];

        Ok(mock_iocs)
    }

    pub async fn update_all_feeds(&self) -> Result<FeedUpdateResult, IOCError> {
        let feeds = self.feeds.read().await;
        let mut total_new_iocs = 0;
        let mut updated_feeds = 0;
        let mut errors = Vec::new();

        for feed in feeds.iter() {
            if !feed.enabled {
                continue;
            }

            match self.fetch_feed_data(&feed.id).await {
                Ok(iocs) => {
                    total_new_iocs += iocs.len();
                    updated_feeds += 1;
                }
                Err(e) => {
                    errors.push(format!("Feed {}: {:?}", feed.name, e));
                }
            }
        }

        Ok(FeedUpdateResult {
            total_feeds_updated: updated_feeds,
            total_new_iocs,
            errors,
            timestamp: Utc::now(),
        })
    }

    pub async fn get_feed_status(&self) -> Vec<FeedStatus> {
        let feeds = self.feeds.read().await;
        feeds.iter().map(|feed| FeedStatus {
            feed_id: feed.id.clone(),
            name: feed.name.clone(),
            enabled: feed.enabled,
            last_update: feed.last_update,
            status: if feed.enabled { "Active".to_string() } else { "Disabled".to_string() },
            reliability_score: feed.reliability_score,
        }).collect()
    }

    pub async fn enable_feed(&self, feed_id: &str) -> Result<(), IOCError> {
        let mut feeds = self.feeds.write().await;
        if let Some(feed) = feeds.iter_mut().find(|f| f.id == feed_id) {
            feed.enabled = true;
            Ok(())
        } else {
            Err(IOCError::FeedNotFound)
        }
    }

    pub async fn disable_feed(&self, feed_id: &str) -> Result<(), IOCError> {
        let mut feeds = self.feeds.write().await;
        if let Some(feed) = feeds.iter_mut().find(|f| f.id == feed_id) {
            feed.enabled = false;
            Ok(())
        } else {
            Err(IOCError::FeedNotFound)
        }
    }

    pub async fn get_health(&self) -> ComponentHealth {
        let status = self.get_feed_status().await;
        let active_feeds = status.iter().filter(|s| s.enabled).count();

        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Feed manager operational - {} active feeds", active_feeds),
            last_check: Utc::now(),
            metrics: {
                let mut metrics = HashMap::new();
                metrics.insert("active_feeds".to_string(), active_feeds as f64);
                metrics.insert("total_feeds".to_string(), status.len() as f64);
                metrics
            },
        }
    }
}
