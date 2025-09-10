// phantom-ioc-core/src/enrichment.rs
// IOC enrichment engine for adding contextual information

use crate::types::*;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::Utc;

pub struct EnrichmentEngine {
    enrichment_sources: Arc<RwLock<Vec<EnrichmentSource>>>,
    cache: Arc<RwLock<HashMap<String, EnrichedIOC>>>,
}

impl EnrichmentEngine {
    pub async fn new() -> Result<Self, IOCError> {
        let enrichment_sources = Arc::new(RwLock::new(Vec::new()));
        let cache = Arc::new(RwLock::new(HashMap::new()));

        let engine = Self {
            enrichment_sources,
            cache,
        };

        engine.initialize_sources().await?;
        Ok(engine)
    }

    async fn initialize_sources(&self) -> Result<(), IOCError> {
        let mut sources = self.enrichment_sources.write().await;
        sources.push(EnrichmentSource {
            id: "whois".to_string(),
            name: "WHOIS Lookup".to_string(),
            url: "https://whois.example.com".to_string(),
            api_key: None,
            enabled: true,
            priority: 1,
        });
        Ok(())
    }

    pub async fn enrich_ioc(&self, ioc: IOC) -> Result<EnrichedIOC, IOCError> {
        let cache_key = format!("{}_{}", ioc.indicator_type.clone() as u8, ioc.value);
        if let Some(cached) = self.cache.read().await.get(&cache_key) {
            return Ok(cached.clone());
        }

        let mut enriched_data = HashMap::new();
        enriched_data.insert("enrichment_timestamp".to_string(), serde_json::json!(Utc::now()));

        let enriched_ioc = EnrichedIOC {
            original_ioc: ioc,
            enriched_data,
            intelligence_sources: vec!["Mock Enrichment".to_string()],
            enrichment_confidence: 0.8,
            enrichment_timestamp: Utc::now(),
        };

        self.cache.write().await.insert(cache_key, enriched_ioc.clone());
        Ok(enriched_ioc)
    }

    pub async fn get_health(&self) -> ComponentHealth {
        ComponentHealth {
            status: HealthStatus::Healthy,
            message: "Enrichment engine operational".to_string(),
            last_check: Utc::now(),
            metrics: HashMap::new(),
        }
    }
}
