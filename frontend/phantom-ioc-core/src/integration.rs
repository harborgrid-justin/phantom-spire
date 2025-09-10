// phantom-ioc-core/src/integration.rs
// Third-party integrations (MISP, STIX/TAXII, threat feeds)

use crate::types::*;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Integration engine for third-party threat intelligence sources
pub struct IntegrationEngine {
    connectors: Arc<RwLock<HashMap<String, ThreatFeedConnector>>>,
    feed_configs: Arc<RwLock<HashMap<String, FeedConfiguration>>>,
    sync_jobs: Arc<RwLock<HashMap<String, SyncJob>>>,
    imported_data: Arc<RwLock<HashMap<String, ImportedThreatData>>>,
    statistics: Arc<RwLock<IntegrationStats>>,
}

impl IntegrationEngine {
    /// Create a new integration engine
    pub async fn new() -> Result<Self, IOCError> {
        let engine = Self {
            connectors: Arc::new(RwLock::new(HashMap::new())),
            feed_configs: Arc::new(RwLock::new(HashMap::new())),
            sync_jobs: Arc::new(RwLock::new(HashMap::new())),
            imported_data: Arc::new(RwLock::new(HashMap::new())),
            statistics: Arc::new(RwLock::new(IntegrationStats::default())),
        };

        // Initialize default integrations
        engine.initialize_default_integrations().await?;

        Ok(engine)
    }

    /// Initialize default integration configurations
    async fn initialize_default_integrations(&self) -> Result<(), IOCError> {
        let default_configs = vec![
            FeedConfiguration {
                id: "misp_primary".to_string(),
                name: "Primary MISP Instance".to_string(),
                feed_type: FeedType::MISP,
                endpoint_url: "https://misp.example.com".to_string(),
                authentication: AuthenticationConfig {
                    auth_type: AuthType::APIKey,
                    credentials: HashMap::from([
                        ("api_key".to_string(), "your-misp-api-key".to_string()),
                    ]),
                },
                sync_interval_minutes: 60,
                data_types: vec![
                    "indicators".to_string(),
                    "events".to_string(),
                    "attributes".to_string(),
                ],
                filters: FeedFilters {
                    minimum_confidence: Some(0.5),
                    threat_levels: vec!["high".to_string(), "critical".to_string()],
                    organizations: vec![], // All organizations
                    tags: vec!["apt".to_string(), "malware".to_string()],
                    date_range: None,
                },
                enabled: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            FeedConfiguration {
                id: "taxii_feed".to_string(),
                name: "STIX/TAXII Threat Feed".to_string(),
                feed_type: FeedType::TAXII,
                endpoint_url: "https://taxii.example.com/api".to_string(),
                authentication: AuthenticationConfig {
                    auth_type: AuthType::BasicAuth,
                    credentials: HashMap::from([
                        ("username".to_string(), "taxii_user".to_string()),
                        ("password".to_string(), "taxii_password".to_string()),
                    ]),
                },
                sync_interval_minutes: 120,
                data_types: vec![
                    "stix_objects".to_string(),
                    "indicators".to_string(),
                ],
                filters: FeedFilters {
                    minimum_confidence: Some(0.7),
                    threat_levels: vec!["medium".to_string(), "high".to_string(), "critical".to_string()],
                    organizations: vec!["cert".to_string(), "government".to_string()],
                    tags: vec![],
                    date_range: Some((Utc::now() - chrono::Duration::days(30), Utc::now())),
                },
                enabled: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            FeedConfiguration {
                id: "commercial_feed".to_string(),
                name: "Commercial Threat Intelligence".to_string(),
                feed_type: FeedType::Commercial,
                endpoint_url: "https://api.threatintel.com/v1".to_string(),
                authentication: AuthenticationConfig {
                    auth_type: AuthType::Bearer,
                    credentials: HashMap::from([
                        ("token".to_string(), "bearer-token-here".to_string()),
                    ]),
                },
                sync_interval_minutes: 30,
                data_types: vec![
                    "indicators".to_string(),
                    "reports".to_string(),
                    "attribution".to_string(),
                ],
                filters: FeedFilters {
                    minimum_confidence: Some(0.8),
                    threat_levels: vec!["high".to_string(), "critical".to_string()],
                    organizations: vec![],
                    tags: vec!["apt".to_string(), "targeted".to_string()],
                    date_range: Some((Utc::now() - chrono::Duration::days(7), Utc::now())),
                },
                enabled: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            FeedConfiguration {
                id: "open_source_feed".to_string(),
                name: "Open Source Intelligence".to_string(),
                feed_type: FeedType::OpenSource,
                endpoint_url: "https://osint.example.com/api".to_string(),
                authentication: AuthenticationConfig {
                    auth_type: AuthType::None,
                    credentials: HashMap::new(),
                },
                sync_interval_minutes: 180,
                data_types: vec![
                    "indicators".to_string(),
                    "urls".to_string(),
                ],
                filters: FeedFilters {
                    minimum_confidence: Some(0.4),
                    threat_levels: vec!["medium".to_string(), "high".to_string()],
                    organizations: vec![],
                    tags: vec!["osint".to_string()],
                    date_range: Some((Utc::now() - chrono::Duration::days(14), Utc::now())),
                },
                enabled: false, // Disabled by default
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
        ];

        let mut configs = self.feed_configs.write().await;
        for config in default_configs {
            configs.insert(config.id.clone(), config);
        }

        Ok(())
    }

    /// Synchronize threat intelligence from all enabled feeds
    pub async fn sync_all_feeds(&self) -> Result<SyncSummary, IOCError> {
        let configs = self.feed_configs.read().await;
        let enabled_feeds: Vec<_> = configs.values()
            .filter(|config| config.enabled)
            .cloned()
            .collect();

        drop(configs); // Release the lock

        let mut sync_results = Vec::new();
        let mut total_imported = 0;
        let mut total_errors = 0;

        for config in enabled_feeds {
            match self.sync_single_feed(&config).await {
                Ok(result) => {
                    total_imported += result.items_imported;
                    sync_results.push(result);
                }
                Err(e) => {
                    total_errors += 1;
                    sync_results.push(FeedSyncResult {
                        feed_id: config.id.clone(),
                        feed_name: config.name.clone(),
                        status: SyncStatus::Failed,
                        items_imported: 0,
                        items_updated: 0,
                        items_skipped: 0,
                        errors: vec![e.to_string()],
                        sync_duration_ms: 0,
                        last_sync_time: Utc::now(),
                    });
                }
            }
        }

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.total_syncs += 1;
            stats.total_items_imported += total_imported;
            stats.total_sync_errors += total_errors;
            stats.last_sync_time = Some(Utc::now());
        }

        Ok(SyncSummary {
            total_feeds: sync_results.len() as u32,
            successful_feeds: sync_results.iter().filter(|r| r.status == SyncStatus::Success).count() as u32,
            failed_feeds: total_errors as u32,
            total_items_imported: total_imported,
            sync_results,
            sync_time: Utc::now(),
        })
    }

    /// Synchronize a single threat intelligence feed
    async fn sync_single_feed(&self, config: &FeedConfiguration) -> Result<FeedSyncResult, IOCError> {
        let sync_start = Utc::now();
        let job_id = Uuid::new_v4().to_string();

        // Create sync job
        let sync_job = SyncJob {
            id: job_id.clone(),
            feed_id: config.id.clone(),
            status: SyncStatus::Running,
            started_at: sync_start,
            completed_at: None,
            items_processed: 0,
            errors: vec![],
            metadata: HashMap::new(),
        };

        {
            let mut jobs = self.sync_jobs.write().await;
            jobs.insert(job_id.clone(), sync_job);
        }

        // Get connector for this feed type
        let connector = self.get_or_create_connector(&config.feed_type).await?;

        // Perform the actual synchronization
        let sync_result = match config.feed_type {
            FeedType::MISP => self.sync_misp_feed(config, &connector).await,
            FeedType::TAXII => self.sync_taxii_feed(config, &connector).await,
            FeedType::Commercial => self.sync_commercial_feed(config, &connector).await,
            FeedType::OpenSource => self.sync_open_source_feed(config, &connector).await,
            FeedType::Custom => self.sync_custom_feed(config, &connector).await,
        };

        let sync_end = Utc::now();
        let duration_ms = (sync_end - sync_start).num_milliseconds();

        // Update sync job
        {
            let mut jobs = self.sync_jobs.write().await;
            if let Some(job) = jobs.get_mut(&job_id) {
                job.completed_at = Some(sync_end);
                job.status = if sync_result.is_ok() { SyncStatus::Success } else { SyncStatus::Failed };
            }
        }

        match sync_result {
            Ok((imported, updated, skipped)) => {
                Ok(FeedSyncResult {
                    feed_id: config.id.clone(),
                    feed_name: config.name.clone(),
                    status: SyncStatus::Success,
                    items_imported: imported,
                    items_updated: updated,
                    items_skipped: skipped,
                    errors: vec![],
                    sync_duration_ms: duration_ms,
                    last_sync_time: sync_end,
                })
            }
            Err(e) => {
                Ok(FeedSyncResult {
                    feed_id: config.id.clone(),
                    feed_name: config.name.clone(),
                    status: SyncStatus::Failed,
                    items_imported: 0,
                    items_updated: 0,
                    items_skipped: 0,
                    errors: vec![e.to_string()],
                    sync_duration_ms: duration_ms,
                    last_sync_time: sync_end,
                })
            }
        }
    }

    /// Sync MISP threat intelligence feed
    async fn sync_misp_feed(&self, config: &FeedConfiguration, connector: &ThreatFeedConnector) -> Result<(u32, u32, u32), IOCError> {
        // Simulate MISP API calls
        let simulated_events = vec![
            MISPEvent {
                id: "1234".to_string(),
                uuid: Uuid::new_v4().to_string(),
                info: "APT Campaign - Financial Sector".to_string(),
                threat_level_id: "2".to_string(),
                analysis: "2".to_string(),
                timestamp: Utc::now(),
                attributes: vec![
                    MISPAttribute {
                        id: "5678".to_string(),
                        event_id: "1234".to_string(),
                        category: "Network activity".to_string(),
                        attribute_type: "ip-dst".to_string(),
                        value: "192.168.1.100".to_string(),
                        to_ids: true,
                        uuid: Uuid::new_v4().to_string(),
                        timestamp: Utc::now(),
                        comment: "C2 Server".to_string(),
                    },
                    MISPAttribute {
                        id: "5679".to_string(),
                        event_id: "1234".to_string(),
                        category: "Payload delivery".to_string(),
                        attribute_type: "md5".to_string(),
                        value: "d41d8cd98f00b204e9800998ecf8427e".to_string(),
                        to_ids: true,
                        uuid: Uuid::new_v4().to_string(),
                        timestamp: Utc::now(),
                        comment: "Malware sample".to_string(),
                    },
                ],
                tags: vec!["apt".to_string(), "financial".to_string()],
            },
        ];

        let mut imported = 0;
        let mut updated = 0;
        let mut skipped = 0;

        for event in simulated_events {
            // Check if event meets filter criteria
            if self.event_meets_filters(&event, &config.filters).await {
                for attribute in &event.attributes {
                    // Convert MISP attribute to IOC
                    let ioc = self.convert_misp_attribute_to_ioc(attribute, &event).await?;
                    
                    // Check if IOC already exists
                    let existing_data = self.imported_data.read().await;
                    if existing_data.contains_key(&ioc.id.to_string()) {
                        updated += 1;
                    } else {
                        imported += 1;
                    }
                    drop(existing_data);

                    // Store imported threat data
                    let threat_data = ImportedThreatData {
                        id: Uuid::new_v4().to_string(),
                        source_feed_id: config.id.clone(),
                        original_id: attribute.id.clone(),
                        data_type: ThreatDataType::IOC,
                        ioc: Some(ioc),
                        raw_data: serde_json::to_value(&attribute).unwrap_or(serde_json::Value::Null),
                        imported_at: Utc::now(),
                        last_updated: Utc::now(),
                        metadata: HashMap::from([
                            ("event_id".to_string(), serde_json::Value::String(event.id.clone())),
                            ("event_info".to_string(), serde_json::Value::String(event.info.clone())),
                        ]),
                    };

                    let mut imported_data = self.imported_data.write().await;
                    imported_data.insert(threat_data.id.clone(), threat_data);
                }
            } else {
                skipped += 1;
            }
        }

        Ok((imported, updated, skipped))
    }

    /// Sync STIX/TAXII threat intelligence feed
    async fn sync_taxii_feed(&self, config: &FeedConfiguration, connector: &ThreatFeedConnector) -> Result<(u32, u32, u32), IOCError> {
        // Simulate TAXII/STIX data retrieval
        let simulated_stix_objects = vec![
            STIXObject {
                id: "indicator--01234567-89ab-cdef-0123-456789abcdef".to_string(),
                object_type: "indicator".to_string(),
                created: Utc::now(),
                modified: Utc::now(),
                pattern: "[file:hashes.MD5 = 'd41d8cd98f00b204e9800998ecf8427e']".to_string(),
                labels: vec!["malicious-activity".to_string()],
                confidence: 85,
                valid_from: Utc::now(),
                valid_until: Some(Utc::now() + chrono::Duration::days(365)),
                kill_chain_phases: vec![
                    KillChainPhase {
                        kill_chain_name: "mitre-attack".to_string(),
                        phase_name: "command-and-control".to_string(),
                    },
                ],
            },
        ];

        let mut imported = 0;
        let mut updated = 0;
        let mut skipped = 0;

        for stix_obj in simulated_stix_objects {
            // Check if object meets filter criteria
            if self.stix_object_meets_filters(&stix_obj, &config.filters).await {
                // Convert STIX object to IOC
                let ioc = self.convert_stix_object_to_ioc(&stix_obj).await?;
                
                // Store imported threat data
                let threat_data = ImportedThreatData {
                    id: Uuid::new_v4().to_string(),
                    source_feed_id: config.id.clone(),
                    original_id: stix_obj.id.clone(),
                    data_type: ThreatDataType::STIX,
                    ioc: Some(ioc),
                    raw_data: serde_json::to_value(&stix_obj).unwrap_or(serde_json::Value::Null),
                    imported_at: Utc::now(),
                    last_updated: Utc::now(),
                    metadata: HashMap::from([
                        ("object_type".to_string(), serde_json::Value::String(stix_obj.object_type.clone())),
                        ("confidence".to_string(), serde_json::Value::Number(serde_json::Number::from(stix_obj.confidence))),
                    ]),
                };

                let mut imported_data = self.imported_data.write().await;
                imported_data.insert(threat_data.id.clone(), threat_data);
                imported += 1;
            } else {
                skipped += 1;
            }
        }

        Ok((imported, updated, skipped))
    }

    /// Sync commercial threat intelligence feed
    async fn sync_commercial_feed(&self, config: &FeedConfiguration, connector: &ThreatFeedConnector) -> Result<(u32, u32, u32), IOCError> {
        // Simulate commercial API response
        let simulated_indicators = vec![
            CommercialIndicator {
                id: "comm-123456".to_string(),
                indicator_type: "domain".to_string(),
                value: "malicious.example.com".to_string(),
                confidence: 0.95,
                threat_types: vec!["malware".to_string(), "c2".to_string()],
                first_seen: Utc::now() - chrono::Duration::days(5),
                last_seen: Utc::now(),
                attribution: Some(Attribution {
                    threat_actor: "APT29".to_string(),
                    campaign: "CozyBear Campaign 2024".to_string(),
                    confidence: 0.8,
                }),
                context: CommercialContext {
                    malware_families: vec!["Cobalt Strike".to_string()],
                    attack_vectors: vec!["spear-phishing".to_string()],
                    target_industries: vec!["finance".to_string(), "healthcare".to_string()],
                },
            },
        ];

        let mut imported = 0;

        for indicator in simulated_indicators {
            // Convert commercial indicator to IOC
            let ioc = self.convert_commercial_indicator_to_ioc(&indicator).await?;
            
            // Store imported threat data
            let threat_data = ImportedThreatData {
                id: Uuid::new_v4().to_string(),
                source_feed_id: config.id.clone(),
                original_id: indicator.id.clone(),
                data_type: ThreatDataType::Commercial,
                ioc: Some(ioc),
                raw_data: serde_json::to_value(&indicator).unwrap_or(serde_json::Value::Null),
                imported_at: Utc::now(),
                last_updated: Utc::now(),
                metadata: HashMap::from([
                    ("threat_actor".to_string(), serde_json::Value::String(
                        indicator.attribution.as_ref().map(|a| a.threat_actor.clone()).unwrap_or_default()
                    )),
                ]),
            };

            let mut imported_data = self.imported_data.write().await;
            imported_data.insert(threat_data.id.clone(), threat_data);
            imported += 1;
        }

        Ok((imported, 0, 0))
    }

    /// Sync open source threat intelligence feed
    async fn sync_open_source_feed(&self, config: &FeedConfiguration, connector: &ThreatFeedConnector) -> Result<(u32, u32, u32), IOCError> {
        // Simulate open source data (simplified)
        let imported = 10; // Simulated count
        Ok((imported, 0, 0))
    }

    /// Sync custom threat intelligence feed
    async fn sync_custom_feed(&self, config: &FeedConfiguration, connector: &ThreatFeedConnector) -> Result<(u32, u32, u32), IOCError> {
        // Placeholder for custom feed implementation
        Ok((0, 0, 0))
    }

    /// Get or create a connector for a feed type
    async fn get_or_create_connector(&self, feed_type: &FeedType) -> Result<ThreatFeedConnector, IOCError> {
        let connector_id = format!("{:?}", feed_type);
        
        let connectors = self.connectors.read().await;
        if let Some(connector) = connectors.get(&connector_id) {
            return Ok(connector.clone());
        }
        drop(connectors);

        // Create new connector
        let connector = ThreatFeedConnector {
            id: connector_id.clone(),
            feed_type: feed_type.clone(),
            status: ConnectorStatus::Active,
            created_at: Utc::now(),
            last_used: Utc::now(),
            statistics: ConnectorStatistics {
                total_requests: 0,
                successful_requests: 0,
                failed_requests: 0,
                average_response_time_ms: 0.0,
            },
        };

        let mut connectors = self.connectors.write().await;
        connectors.insert(connector_id, connector.clone());

        Ok(connector)
    }

    /// Check if MISP event meets filter criteria
    async fn event_meets_filters(&self, event: &MISPEvent, filters: &FeedFilters) -> bool {
        // Check threat level
        if !filters.threat_levels.is_empty() {
            let threat_level = match event.threat_level_id.as_str() {
                "1" => "high",
                "2" => "medium", 
                "3" => "low",
                "4" => "undefined",
                _ => "unknown",
            };
            if !filters.threat_levels.contains(&threat_level.to_string()) {
                return false;
            }
        }

        // Check tags
        if !filters.tags.is_empty() {
            if !filters.tags.iter().any(|tag| event.tags.contains(tag)) {
                return false;
            }
        }

        // Check date range
        if let Some((start, end)) = filters.date_range {
            if event.timestamp < start || event.timestamp > end {
                return false;
            }
        }

        true
    }

    /// Check if STIX object meets filter criteria
    async fn stix_object_meets_filters(&self, obj: &STIXObject, filters: &FeedFilters) -> bool {
        // Check confidence
        if let Some(min_confidence) = filters.minimum_confidence {
            if (obj.confidence as f64 / 100.0) < min_confidence {
                return false;
            }
        }

        // Check date range
        if let Some((start, end)) = filters.date_range {
            if obj.created < start || obj.created > end {
                return false;
            }
        }

        true
    }

    /// Convert MISP attribute to IOC
    async fn convert_misp_attribute_to_ioc(&self, attribute: &MISPAttribute, event: &MISPEvent) -> Result<IOC, IOCError> {
        let ioc_type = match attribute.attribute_type.as_str() {
            "ip-dst" | "ip-src" => IOCType::IPAddress,
            "domain" => IOCType::Domain,
            "url" => IOCType::URL,
            "md5" | "sha1" | "sha256" => IOCType::Hash,
            "email" => IOCType::Email,
            _ => IOCType::Custom(attribute.attribute_type.clone()),
        };

        let severity = match event.threat_level_id.as_str() {
            "1" => Severity::High,
            "2" => Severity::Medium,
            "3" => Severity::Low,
            _ => Severity::Medium,
        };

        Ok(IOC {
            id: Uuid::parse_str(&attribute.uuid).unwrap_or_else(|_| Uuid::new_v4()),
            indicator_type: ioc_type,
            value: attribute.value.clone(),
            confidence: if attribute.to_ids { 0.8 } else { 0.5 },
            severity,
            source: "MISP".to_string(),
            timestamp: attribute.timestamp,
            tags: event.tags.clone(),
            context: IOCContext {
                geolocation: None,
                asn: None,
                category: Some(attribute.category.clone()),
                first_seen: Some(attribute.timestamp),
                last_seen: Some(attribute.timestamp),
                related_indicators: vec![],
                metadata: HashMap::from([
                    ("event_id".to_string(), serde_json::Value::String(event.id.clone())),
                    ("event_info".to_string(), serde_json::Value::String(event.info.clone())),
                    ("comment".to_string(), serde_json::Value::String(attribute.comment.clone())),
                ]),
            },
            raw_data: Some(serde_json::to_string(attribute).unwrap_or_default()),
        })
    }

    /// Convert STIX object to IOC
    async fn convert_stix_object_to_ioc(&self, stix_obj: &STIXObject) -> Result<IOC, IOCError> {
        // Parse STIX pattern to extract IOC details
        let (ioc_type, value) = self.parse_stix_pattern(&stix_obj.pattern)?;

        let severity = if stix_obj.confidence >= 80 {
            Severity::High
        } else if stix_obj.confidence >= 60 {
            Severity::Medium
        } else {
            Severity::Low
        };

        Ok(IOC {
            id: Uuid::new_v4(),
            indicator_type: ioc_type,
            value,
            confidence: stix_obj.confidence as f64 / 100.0,
            severity,
            source: "STIX/TAXII".to_string(),
            timestamp: stix_obj.created,
            tags: stix_obj.labels.clone(),
            context: IOCContext {
                geolocation: None,
                asn: None,
                category: Some("STIX Indicator".to_string()),
                first_seen: Some(stix_obj.valid_from),
                last_seen: stix_obj.valid_until,
                related_indicators: vec![],
                metadata: HashMap::from([
                    ("stix_id".to_string(), serde_json::Value::String(stix_obj.id.clone())),
                    ("kill_chain_phases".to_string(), serde_json::to_value(&stix_obj.kill_chain_phases).unwrap_or(serde_json::Value::Null)),
                ]),
            },
            raw_data: Some(serde_json::to_string(stix_obj).unwrap_or_default()),
        })
    }

    /// Convert commercial indicator to IOC
    async fn convert_commercial_indicator_to_ioc(&self, indicator: &CommercialIndicator) -> Result<IOC, IOCError> {
        let ioc_type = match indicator.indicator_type.as_str() {
            "ip" => IOCType::IPAddress,
            "domain" => IOCType::Domain,
            "url" => IOCType::URL,
            "hash" => IOCType::Hash,
            "email" => IOCType::Email,
            _ => IOCType::Custom(indicator.indicator_type.clone()),
        };

        let severity = if indicator.confidence >= 0.9 {
            Severity::Critical
        } else if indicator.confidence >= 0.7 {
            Severity::High
        } else if indicator.confidence >= 0.5 {
            Severity::Medium
        } else {
            Severity::Low
        };

        let mut tags = indicator.threat_types.clone();
        if let Some(attribution) = &indicator.attribution {
            tags.push(attribution.threat_actor.clone());
        }

        Ok(IOC {
            id: Uuid::new_v4(),
            indicator_type: ioc_type,
            value: indicator.value.clone(),
            confidence: indicator.confidence,
            severity,
            source: "Commercial Feed".to_string(),
            timestamp: indicator.last_seen,
            tags,
            context: IOCContext {
                geolocation: None,
                asn: None,
                category: Some("Commercial Intelligence".to_string()),
                first_seen: Some(indicator.first_seen),
                last_seen: Some(indicator.last_seen),
                related_indicators: vec![],
                metadata: HashMap::from([
                    ("commercial_id".to_string(), serde_json::Value::String(indicator.id.clone())),
                    ("attribution".to_string(), serde_json::to_value(&indicator.attribution).unwrap_or(serde_json::Value::Null)),
                    ("context".to_string(), serde_json::to_value(&indicator.context).unwrap_or(serde_json::Value::Null)),
                ]),
            },
            raw_data: Some(serde_json::to_string(indicator).unwrap_or_default()),
        })
    }

    /// Parse STIX pattern to extract IOC type and value
    fn parse_stix_pattern(&self, pattern: &str) -> Result<(IOCType, String), IOCError> {
        // Simplified STIX pattern parsing
        if pattern.contains("file:hashes.MD5") {
            let value = pattern.split('\'').nth(1).unwrap_or("").to_string();
            Ok((IOCType::Hash, value))
        } else if pattern.contains("network-traffic:dst_ref.value") {
            let value = pattern.split('\'').nth(1).unwrap_or("").to_string();
            Ok((IOCType::IPAddress, value))
        } else if pattern.contains("domain-name:value") {
            let value = pattern.split('\'').nth(1).unwrap_or("").to_string();
            Ok((IOCType::Domain, value))
        } else if pattern.contains("url:value") {
            let value = pattern.split('\'').nth(1).unwrap_or("").to_string();
            Ok((IOCType::URL, value))
        } else {
            Ok((IOCType::Custom("unknown".to_string()), pattern.to_string()))
        }
    }

    /// Export IOCs to external format
    pub async fn export_iocs(&self, format: &ExportFormat, filter: &ExportFilter) -> Result<ExportResult, IOCError> {
        let imported_data = self.imported_data.read().await;
        let filtered_iocs: Vec<_> = imported_data.values()
            .filter_map(|data| data.ioc.as_ref())
            .filter(|ioc| self.ioc_matches_export_filter(ioc, filter))
            .cloned()
            .collect();

        let exported_data = match format {
            ExportFormat::STIX => self.export_to_stix(&filtered_iocs).await?,
            ExportFormat::MISP => self.export_to_misp(&filtered_iocs).await?,
            ExportFormat::JSON => self.export_to_json(&filtered_iocs).await?,
            ExportFormat::CSV => self.export_to_csv(&filtered_iocs).await?,
            ExportFormat::YARA => self.export_to_yara(&filtered_iocs).await?,
        };

        Ok(ExportResult {
            format: format.clone(),
            item_count: filtered_iocs.len() as u32,
            exported_data,
            export_time: Utc::now(),
        })
    }

    fn ioc_matches_export_filter(&self, ioc: &IOC, filter: &ExportFilter) -> bool {
        // Check date range
        if let Some((start, end)) = filter.date_range {
            if ioc.timestamp < start || ioc.timestamp > end {
                return false;
            }
        }

        // Check confidence threshold
        if let Some(min_confidence) = filter.minimum_confidence {
            if ioc.confidence < min_confidence {
                return false;
            }
        }

        // Check IOC types
        if !filter.ioc_types.is_empty() && !filter.ioc_types.contains(&ioc.indicator_type) {
            return false;
        }

        // Check tags
        if !filter.tags.is_empty() && !filter.tags.iter().any(|tag| ioc.tags.contains(tag)) {
            return false;
        }

        true
    }

    async fn export_to_stix(&self, iocs: &[IOC]) -> Result<String, IOCError> {
        // Convert IOCs to STIX format
        let stix_bundle = STIXBundle {
            bundle_type: "bundle".to_string(),
            id: format!("bundle--{}", Uuid::new_v4()),
            objects: iocs.iter().map(|ioc| self.ioc_to_stix_object(ioc)).collect(),
        };

        serde_json::to_string_pretty(&stix_bundle)
            .map_err(|e| IOCError::Processing(format!("STIX serialization error: {}", e)))
    }

    async fn export_to_misp(&self, iocs: &[IOC]) -> Result<String, IOCError> {
        // Convert IOCs to MISP format (simplified)
        let misp_event = MISPEvent {
            id: Uuid::new_v4().to_string(),
            uuid: Uuid::new_v4().to_string(),
            info: "Exported IOCs".to_string(),
            threat_level_id: "2".to_string(),
            analysis: "2".to_string(),
            timestamp: Utc::now(),
            attributes: iocs.iter().enumerate().map(|(i, ioc)| {
                MISPAttribute {
                    id: i.to_string(),
                    event_id: "export".to_string(),
                    category: "Network activity".to_string(),
                    attribute_type: match ioc.indicator_type {
                        IOCType::IPAddress => "ip-dst".to_string(),
                        IOCType::Domain => "domain".to_string(),
                        IOCType::URL => "url".to_string(),
                        IOCType::Hash => "md5".to_string(),
                        IOCType::Email => "email".to_string(),
                        _ => "other".to_string(),
                    },
                    value: ioc.value.clone(),
                    to_ids: true,
                    uuid: ioc.id,
                    timestamp: ioc.timestamp,
                    comment: "Exported IOC".to_string(),
                }
            }).collect(),
            tags: vec!["export".to_string()],
        };

        serde_json::to_string_pretty(&misp_event)
            .map_err(|e| IOCError::Processing(format!("MISP serialization error: {}", e)))
    }

    async fn export_to_json(&self, iocs: &[IOC]) -> Result<String, IOCError> {
        serde_json::to_string_pretty(iocs)
            .map_err(|e| IOCError::Processing(format!("JSON serialization error: {}", e)))
    }

    async fn export_to_csv(&self, iocs: &[IOC]) -> Result<String, IOCError> {
        let mut csv = String::from("type,value,confidence,severity,source,timestamp,tags\n");
        for ioc in iocs {
            csv.push_str(&format!(
                "{:?},{},{},{:?},{},{},{}\n",
                ioc.indicator_type,
                ioc.value,
                ioc.confidence,
                ioc.severity,
                ioc.source,
                ioc.timestamp.format("%Y-%m-%d %H:%M:%S"),
                ioc.tags.join(";")
            ));
        }
        Ok(csv)
    }

    async fn export_to_yara(&self, iocs: &[IOC]) -> Result<String, IOCError> {
        // Generate YARA rules from IOCs (simplified)
        let mut yara_rules = String::new();
        
        for (i, ioc) in iocs.iter().enumerate() {
            if matches!(ioc.indicator_type, IOCType::Hash) {
                yara_rules.push_str(&format!(
                    "rule IOC_Hash_{} {{\n    meta:\n        description = \"IOC from threat intelligence\"\n        confidence = {}\n    strings:\n        $hash = \"{}\"\n    condition:\n        $hash\n}}\n\n",
                    i, ioc.confidence, ioc.value
                ));
            }
        }

        Ok(yara_rules)
    }

    fn ioc_to_stix_object(&self, ioc: &IOC) -> STIXObject {
        let pattern = match ioc.indicator_type {
            IOCType::IPAddress => format!("[network-traffic:dst_ref.value = '{}']", ioc.value),
            IOCType::Domain => format!("[domain-name:value = '{}']", ioc.value),
            IOCType::URL => format!("[url:value = '{}']", ioc.value),
            IOCType::Hash => format!("[file:hashes.MD5 = '{}']", ioc.value),
            IOCType::Email => format!("[email-message:sender_ref.value = '{}']", ioc.value),
            _ => format!("[{}]", ioc.value),
        };

        STIXObject {
            id: format!("indicator--{}", ioc.id),
            object_type: "indicator".to_string(),
            created: ioc.timestamp,
            modified: ioc.timestamp,
            pattern,
            labels: ioc.tags.clone(),
            confidence: (ioc.confidence * 100.0) as u32,
            valid_from: ioc.timestamp,
            valid_until: Some(ioc.timestamp + chrono::Duration::days(365)),
            kill_chain_phases: vec![],
        }
    }

    /// Get integration statistics
    pub async fn get_statistics(&self) -> IntegrationStats {
        self.statistics.read().await.clone()
    }

    /// Get health status
    pub async fn get_health(&self) -> ComponentHealth {
        let stats = self.statistics.read().await;
        let configs = self.feed_configs.read().await;
        let enabled_feeds = configs.values().filter(|c| c.enabled).count();

        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Integration engine operational with {} enabled feeds", enabled_feeds),
            last_check: Utc::now(),
            metrics: HashMap::from([
                ("total_feeds".to_string(), configs.len() as f64),
                ("enabled_feeds".to_string(), enabled_feeds as f64),
                ("total_syncs".to_string(), stats.total_syncs as f64),
                ("total_items_imported".to_string(), stats.total_items_imported as f64),
                ("sync_success_rate".to_string(), if stats.total_syncs > 0 {
                    (stats.total_syncs - stats.total_sync_errors) as f64 / stats.total_syncs as f64 * 100.0
                } else { 100.0 }),
            ]),
        }
    }
}

// Integration data structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedConfiguration {
    pub id: String,
    pub name: String,
    pub feed_type: FeedType,
    pub endpoint_url: String,
    pub authentication: AuthenticationConfig,
    pub sync_interval_minutes: u32,
    pub data_types: Vec<String>,
    pub filters: FeedFilters,
    pub enabled: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FeedType {
    MISP,
    TAXII,
    Commercial,
    OpenSource,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthenticationConfig {
    pub auth_type: AuthType,
    pub credentials: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuthType {
    None,
    APIKey,
    BasicAuth,
    Bearer,
    OAuth2,
    Certificate,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedFilters {
    pub minimum_confidence: Option<f64>,
    pub threat_levels: Vec<String>,
    pub organizations: Vec<String>,
    pub tags: Vec<String>,
    pub date_range: Option<(DateTime<Utc>, DateTime<Utc>)>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatFeedConnector {
    pub id: String,
    pub feed_type: FeedType,
    pub status: ConnectorStatus,
    pub created_at: DateTime<Utc>,
    pub last_used: DateTime<Utc>,
    pub statistics: ConnectorStatistics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConnectorStatus {
    Active,
    Inactive,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectorStatistics {
    pub total_requests: u64,
    pub successful_requests: u64,
    pub failed_requests: u64,
    pub average_response_time_ms: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncJob {
    pub id: String,
    pub feed_id: String,
    pub status: SyncStatus,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub items_processed: u32,
    pub errors: Vec<String>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SyncStatus {
    Pending,
    Running,
    Success,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportedThreatData {
    pub id: String,
    pub source_feed_id: String,
    pub original_id: String,
    pub data_type: ThreatDataType,
    pub ioc: Option<IOC>,
    pub raw_data: serde_json::Value,
    pub imported_at: DateTime<Utc>,
    pub last_updated: DateTime<Utc>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ThreatDataType {
    IOC,
    STIX,
    MISP,
    Commercial,
    OpenSource,
}

// MISP data structures
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MISPEvent {
    pub id: String,
    pub uuid: String,
    pub info: String,
    pub threat_level_id: String,
    pub analysis: String,
    pub timestamp: DateTime<Utc>,
    pub attributes: Vec<MISPAttribute>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MISPAttribute {
    pub id: String,
    pub event_id: String,
    pub category: String,
    pub attribute_type: String,
    pub value: String,
    pub to_ids: bool,
    pub uuid: Uuid,
    pub timestamp: DateTime<Utc>,
    pub comment: String,
}

// STIX data structures
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct STIXObject {
    pub id: String,
    #[serde(rename = "type")]
    pub object_type: String,
    pub created: DateTime<Utc>,
    pub modified: DateTime<Utc>,
    pub pattern: String,
    pub labels: Vec<String>,
    pub confidence: u32,
    pub valid_from: DateTime<Utc>,
    pub valid_until: Option<DateTime<Utc>>,
    pub kill_chain_phases: Vec<KillChainPhase>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KillChainPhase {
    pub kill_chain_name: String,
    pub phase_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct STIXBundle {
    #[serde(rename = "type")]
    pub bundle_type: String,
    pub id: String,
    pub objects: Vec<STIXObject>,
}

// Commercial feed structures
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommercialIndicator {
    pub id: String,
    pub indicator_type: String,
    pub value: String,
    pub confidence: f64,
    pub threat_types: Vec<String>,
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
    pub attribution: Option<Attribution>,
    pub context: CommercialContext,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attribution {
    pub threat_actor: String,
    pub campaign: String,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommercialContext {
    pub malware_families: Vec<String>,
    pub attack_vectors: Vec<String>,
    pub target_industries: Vec<String>,
}

// Export structures
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExportFormat {
    STIX,
    MISP,
    JSON,
    CSV,
    YARA,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportFilter {
    pub date_range: Option<(DateTime<Utc>, DateTime<Utc>)>,
    pub minimum_confidence: Option<f64>,
    pub ioc_types: Vec<IOCType>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportResult {
    pub format: ExportFormat,
    pub item_count: u32,
    pub exported_data: String,
    pub export_time: DateTime<Utc>,
}

// Sync results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncSummary {
    pub total_feeds: u32,
    pub successful_feeds: u32,
    pub failed_feeds: u32,
    pub total_items_imported: u32,
    pub sync_results: Vec<FeedSyncResult>,
    pub sync_time: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedSyncResult {
    pub feed_id: String,
    pub feed_name: String,
    pub status: SyncStatus,
    pub items_imported: u32,
    pub items_updated: u32,
    pub items_skipped: u32,
    pub errors: Vec<String>,
    pub sync_duration_ms: i64,
    pub last_sync_time: DateTime<Utc>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct IntegrationStats {
    pub total_syncs: u64,
    pub successful_syncs: u64,
    pub failed_syncs: u64,
    pub total_items_imported: u32,
    pub total_items_exported: u32,
    pub total_sync_errors: u32,
    pub average_sync_duration_ms: f64,
    pub last_sync_time: Option<DateTime<Utc>>,
}