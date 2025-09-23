// phantom-ioc-core/src/core.rs
// Core business logic for IOC processing

use std::sync::Arc;
use uuid::Uuid;
use chrono::Utc;

use crate::models::*;
use crate::config::IOCCoreConfig;
use crate::storage::{IOCStorage, StorageFactory, IOCSearchCriteria};
use crate::analytics_engine::AnalyticsEngine;
use crate::threat_intelligence::ThreatIntelligenceEngine;
use crate::correlation_engine::CorrelationEngine;
use crate::enrichment_engine::EnrichmentEngine;

/// Main IOC processing core
pub struct IOCCore {
    config: IOCCoreConfig,
    storage: Arc<dyn IOCStorage>,
    threat_intel: ThreatIntelligenceEngine,
    analytics: AnalyticsEngine,
    correlation: CorrelationEngine,
    enrichment: EnrichmentEngine,
    stats: IOCProcessingStats,
}

impl IOCCore {
    /// Create a new IOC Core instance
    pub async fn new(config: IOCCoreConfig) -> Result<Self, Box<dyn std::error::Error>> {
        config.validate()?;

        let storage = StorageFactory::create_storage(
            config.storage.backend.clone(),
            config.storage.connection_string.clone(),
        ).await?;

        storage.initialize().await?;

        let threat_intel = ThreatIntelligenceEngine::new(&config.enrichment);
        let analytics = AnalyticsEngine::new(&config.processing);
        let correlation = CorrelationEngine::new(&config.correlation);
        let enrichment = EnrichmentEngine::new(&config.enrichment);

        Ok(Self {
            config,
            storage,
            threat_intel,
            analytics,
            correlation,
            enrichment,
            stats: IOCProcessingStats::default(),
        })
    }

    /// Create a new IOC Core instance with default configuration
    pub async fn with_default_config() -> Result<Self, Box<dyn std::error::Error>> {
        Self::new(IOCCoreConfig::default()).await
    }

    /// Process a single IOC
    pub async fn process_ioc(&mut self, ioc: IOC) -> Result<IOCResult, IOCError> {
        let start_time = std::time::Instant::now();

        // Store the original IOC
        self.storage.store_ioc(&ioc).await
            .map_err(|e| IOCError::Database(e.to_string()))?;

        // Enrich the IOC with additional data
        let enriched_ioc = self.enrichment.enrich_ioc(&ioc).await?;
        self.storage.store_enriched_ioc(&enriched_ioc).await
            .map_err(|e| IOCError::Database(e.to_string()))?;

        // Analyze the IOC
        let analysis = self.analytics.analyze_ioc(&enriched_ioc.base_ioc).await?;
        
        // Get threat intelligence
        let intelligence = self.threat_intel.get_intelligence(&enriched_ioc.base_ioc).await?;
        
        // Detect patterns and threats
        let detection_result = self.analytics.detect_threats(&enriched_ioc.base_ioc).await?;
        
        // Find correlations
        let correlations = self.correlation.find_correlations(&enriched_ioc.base_ioc).await?;
        
        // Store correlations
        for correlation in &correlations {
            self.storage.store_correlation(correlation).await
                .map_err(|e| IOCError::Database(e.to_string()))?;
        }

        // Create the result
        let result = IOCResult {
            ioc: enriched_ioc.base_ioc,
            detection_result,
            intelligence,
            correlations,
            analysis,
            processing_timestamp: Utc::now(),
        };

        // Store the result
        self.storage.store_result(&result).await
            .map_err(|e| IOCError::Database(e.to_string()))?;

        // Update statistics
        let processing_time = start_time.elapsed().as_secs_f64();
        self.update_stats(processing_time, true);

        Ok(result)
    }

    /// Process multiple IOCs in batch
    pub async fn process_ioc_batch(&mut self, iocs: Vec<IOC>) -> Result<Vec<IOCResult>, IOCError> {
        let mut results = Vec::new();
        let batch_size = self.config.processing.max_batch_size.min(iocs.len());

        for chunk in iocs.chunks(batch_size) {
            for ioc in chunk {
                match self.process_ioc(ioc.clone()).await {
                    Ok(result) => results.push(result),
                    Err(e) => {
                        // Log error but continue processing
                        eprintln!("Error processing IOC {}: {}", ioc.id, e);
                        self.update_stats(0.0, false);
                    }
                }
            }
        }

        Ok(results)
    }

    /// Search for IOCs
    pub async fn search_iocs(&self, criteria: &IOCSearchCriteria) -> Result<Vec<IOC>, IOCError> {
        self.storage.search_iocs(criteria).await
            .map_err(|e| IOCError::Database(e.to_string()))
    }

    /// Get IOC by ID
    pub async fn get_ioc(&self, id: &Uuid) -> Result<Option<IOC>, IOCError> {
        self.storage.get_ioc(id).await
            .map_err(|e| IOCError::Database(e.to_string()))
    }

    /// Get IOC processing result by ID
    pub async fn get_result(&self, ioc_id: &Uuid) -> Result<Option<IOCResult>, IOCError> {
        self.storage.get_result(ioc_id).await
            .map_err(|e| IOCError::Database(e.to_string()))
    }

    /// Get enriched IOC by ID
    pub async fn get_enriched_ioc(&self, ioc_id: &Uuid) -> Result<Option<EnrichedIOC>, IOCError> {
        self.storage.get_enriched_ioc(ioc_id).await
            .map_err(|e| IOCError::Database(e.to_string()))
    }

    /// Get correlations for an IOC
    pub async fn get_correlations(&self, ioc_id: &Uuid) -> Result<Vec<Correlation>, IOCError> {
        self.storage.get_correlations(ioc_id).await
            .map_err(|e| IOCError::Database(e.to_string()))
    }

    /// Get system health status
    pub async fn get_health_status(&self) -> Result<SystemHealth, IOCError> {
        let storage_health = self.storage.health_check().await
            .map_err(|e| IOCError::Internal(e.to_string()))?;

        let mut components = std::collections::HashMap::new();
        
        components.insert("storage".to_string(), ComponentHealth {
            status: if storage_health.status == "healthy" { HealthStatus::Healthy } else { HealthStatus::Degraded },
            message: storage_health.error_message.unwrap_or_else(|| "OK".to_string()),
            last_check: Utc::now(),
            metrics: {
                let mut metrics = std::collections::HashMap::new();
                metrics.insert("response_time_ms".to_string(), storage_health.response_time_ms as f64);
                metrics
            },
        });

        components.insert("threat_intelligence".to_string(), ComponentHealth {
            status: HealthStatus::Healthy,
            message: "OK".to_string(),
            last_check: Utc::now(),
            metrics: std::collections::HashMap::new(),
        });

        let overall_status = if components.values().all(|c| matches!(c.status, HealthStatus::Healthy)) {
            HealthStatus::Healthy
        } else {
            HealthStatus::Degraded
        };

        Ok(SystemHealth {
            status: overall_status,
            components,
            timestamp: Utc::now(),
            version: "2.0.0-enterprise".to_string(),
        })
    }

    /// Get processing statistics
    pub fn get_statistics(&self) -> &IOCProcessingStats {
        &self.stats
    }

    /// Get storage statistics
    pub async fn get_storage_statistics(&self) -> Result<crate::storage::StorageStatistics, IOCError> {
        self.storage.get_statistics().await
            .map_err(|e| IOCError::Database(e.to_string()))
    }

    /// Update internal processing statistics
    fn update_stats(&mut self, processing_time: f64, success: bool) {
        self.stats.total_processed += 1;
        
        if success {
            self.stats.successful_processes += 1;
        } else {
            self.stats.failed_processes += 1;
        }
        
        // Update average processing time
        let total_successful = self.stats.successful_processes.max(1) as f64;
        self.stats.average_processing_time = 
            (self.stats.average_processing_time * (total_successful - 1.0) + processing_time) / total_successful;
        
        self.stats.last_processed = Some(Utc::now());
    }

    /// Shutdown the core and cleanup resources
    pub async fn shutdown(self) -> Result<(), IOCError> {
        self.storage.close().await
            .map_err(|e| IOCError::Internal(e.to_string()))?;
        
        Ok(())
    }
}