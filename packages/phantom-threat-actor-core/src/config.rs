// phantom-threat-actor-core/src/config.rs
// Configuration management for threat actor intelligence

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::{EvidenceType, ThreatActorConfig};

/// Main configuration for Threat Actor Core
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatActorCoreConfig {
    pub analysis: AnalysisConfig,
    pub attribution: AttributionConfig,
    pub behavioral: BehavioralConfig,
    pub campaign: CampaignConfig,
    pub storage: StorageConfig,
    pub intelligence: IntelligenceConfig,
    pub reporting: ReportingConfig,
}

/// Analysis configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisConfig {
    pub confidence_threshold: f64,
    pub max_analysis_time_seconds: u64,
    pub enable_predictive_analysis: bool,
    pub enable_correlation_analysis: bool,
    pub max_correlations: usize,
}

/// Attribution configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttributionConfig {
    pub evidence_weights: HashMap<EvidenceType, f64>,
    pub minimum_evidence_count: usize,
    pub attribution_timeout_seconds: u64,
    pub enable_probabilistic_attribution: bool,
    pub confidence_threshold: f64,
}

/// Behavioral analysis configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralConfig {
    pub enable_behavioral_analysis: bool,
    pub pattern_detection_threshold: f64,
    pub evolution_tracking_enabled: bool,
    pub prediction_horizon_days: u32,
    pub behavioral_confidence_threshold: f64,
}

/// Campaign tracking configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CampaignConfig {
    pub enable_campaign_tracking: bool,
    pub max_campaign_duration_days: u32,
    pub correlation_time_window_hours: u64,
    pub campaign_confidence_threshold: f64,
    pub auto_link_campaigns: bool,
}

/// Storage configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageConfig {
    pub backend: StorageBackend,
    pub connection_string: Option<String>,
    pub pool_size: u32,
    pub timeout_seconds: u64,
    pub enable_caching: bool,
    pub cache_ttl_seconds: u64,
    pub retention_days: u32,
}

/// Storage backend options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StorageBackend {
    Local,
    PostgreSQL,
    MongoDB,
    Elasticsearch,
    Redis,
}

/// Intelligence gathering configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntelligenceConfig {
    pub enabled_sources: Vec<String>,
    pub collection_interval_hours: u64,
    pub source_timeout_seconds: u64,
    pub max_concurrent_collections: usize,
    pub intelligence_confidence_threshold: f64,
}

/// Reporting configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportingConfig {
    pub enable_automated_reporting: bool,
    pub report_formats: Vec<ReportFormat>,
    pub executive_summary_enabled: bool,
    pub technical_details_enabled: bool,
    pub include_predictions: bool,
    pub report_retention_days: u32,
}

/// Report format options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReportFormat {
    Json,
    Pdf,
    Html,
    Markdown,
    Stix,
}

impl Default for ThreatActorCoreConfig {
    fn default() -> Self {
        Self {
            analysis: AnalysisConfig::default(),
            attribution: AttributionConfig::default(),
            behavioral: BehavioralConfig::default(),
            campaign: CampaignConfig::default(),
            storage: StorageConfig::default(),
            intelligence: IntelligenceConfig::default(),
            reporting: ReportingConfig::default(),
        }
    }
}

impl Default for AnalysisConfig {
    fn default() -> Self {
        Self {
            confidence_threshold: 0.7,
            max_analysis_time_seconds: 300,
            enable_predictive_analysis: true,
            enable_correlation_analysis: true,
            max_correlations: 50,
        }
    }
}

impl Default for AttributionConfig {
    fn default() -> Self {
        let mut evidence_weights = HashMap::new();
        evidence_weights.insert(EvidenceType::TechnicalIndicator, 0.8);
        evidence_weights.insert(EvidenceType::BehavioralPattern, 0.9);
        evidence_weights.insert(EvidenceType::InfrastructureOverlap, 0.7);
        evidence_weights.insert(EvidenceType::ToolReuse, 0.6);
        evidence_weights.insert(EvidenceType::TimingCorrelation, 0.5);
        evidence_weights.insert(EvidenceType::LinguisticAnalysis, 0.4);
        evidence_weights.insert(EvidenceType::GeopoliticalContext, 0.3);
        evidence_weights.insert(EvidenceType::SourceIntelligence, 0.9);

        Self {
            evidence_weights,
            minimum_evidence_count: 3,
            attribution_timeout_seconds: 300,
            enable_probabilistic_attribution: true,
            confidence_threshold: 0.7,
        }
    }
}

impl Default for BehavioralConfig {
    fn default() -> Self {
        Self {
            enable_behavioral_analysis: true,
            pattern_detection_threshold: 0.6,
            evolution_tracking_enabled: true,
            prediction_horizon_days: 90,
            behavioral_confidence_threshold: 0.75,
        }
    }
}

impl Default for CampaignConfig {
    fn default() -> Self {
        Self {
            enable_campaign_tracking: true,
            max_campaign_duration_days: 365,
            correlation_time_window_hours: 168, // 1 week
            campaign_confidence_threshold: 0.7,
            auto_link_campaigns: true,
        }
    }
}

impl Default for StorageConfig {
    fn default() -> Self {
        Self {
            backend: StorageBackend::Local,
            connection_string: None,
            pool_size: 10,
            timeout_seconds: 30,
            enable_caching: true,
            cache_ttl_seconds: 3600,
            retention_days: 365,
        }
    }
}

impl Default for IntelligenceConfig {
    fn default() -> Self {
        Self {
            enabled_sources: vec![
                "mitre_attack".to_string(),
                "mandiant_apt".to_string(),
                "crowdstrike_adversary".to_string(),
                "fireeye_threat_intelligence".to_string(),
            ],
            collection_interval_hours: 24,
            source_timeout_seconds: 300,
            max_concurrent_collections: 5,
            intelligence_confidence_threshold: 0.6,
        }
    }
}

impl Default for ReportingConfig {
    fn default() -> Self {
        Self {
            enable_automated_reporting: true,
            report_formats: vec![ReportFormat::Json, ReportFormat::Html],
            executive_summary_enabled: true,
            technical_details_enabled: true,
            include_predictions: true,
            report_retention_days: 90,
        }
    }
}

impl ThreatActorCoreConfig {
    /// Load configuration from file
    pub fn from_file(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let content = std::fs::read_to_string(path)?;
        let config: Self = serde_json::from_str(&content)?;
        Ok(config)
    }

    /// Save configuration to file
    pub fn save_to_file(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let content = serde_json::to_string_pretty(self)?;
        std::fs::write(path, content)?;
        Ok(())
    }

    /// Load configuration from environment variables
    pub fn from_env() -> Self {
        let mut config = Self::default();
        
        if let Ok(backend) = std::env::var("THREAT_ACTOR_STORAGE_BACKEND") {
            config.storage.backend = match backend.as_str() {
                "postgresql" => StorageBackend::PostgreSQL,
                "mongodb" => StorageBackend::MongoDB,
                "elasticsearch" => StorageBackend::Elasticsearch,
                "redis" => StorageBackend::Redis,
                _ => StorageBackend::Local,
            };
        }

        if let Ok(connection_string) = std::env::var("THREAT_ACTOR_DATABASE_URL") {
            config.storage.connection_string = Some(connection_string);
        }

        if let Ok(confidence) = std::env::var("THREAT_ACTOR_CONFIDENCE_THRESHOLD") {
            if let Ok(threshold) = confidence.parse::<f64>() {
                config.analysis.confidence_threshold = threshold;
                config.attribution.confidence_threshold = threshold;
            }
        }

        config
    }

    /// Validate configuration
    pub fn validate(&self) -> Result<(), String> {
        if self.analysis.confidence_threshold < 0.0 || self.analysis.confidence_threshold > 1.0 {
            return Err("Analysis confidence threshold must be between 0.0 and 1.0".to_string());
        }

        if self.attribution.confidence_threshold < 0.0 || self.attribution.confidence_threshold > 1.0 {
            return Err("Attribution confidence threshold must be between 0.0 and 1.0".to_string());
        }

        if self.behavioral.pattern_detection_threshold < 0.0 || self.behavioral.pattern_detection_threshold > 1.0 {
            return Err("Behavioral pattern detection threshold must be between 0.0 and 1.0".to_string());
        }

        if self.storage.pool_size == 0 {
            return Err("Storage pool size must be greater than 0".to_string());
        }

        if matches!(self.storage.backend, StorageBackend::PostgreSQL | StorageBackend::MongoDB | StorageBackend::Elasticsearch) 
            && self.storage.connection_string.is_none() {
            return Err("Connection string required for selected storage backend".to_string());
        }

        Ok(())
    }
}