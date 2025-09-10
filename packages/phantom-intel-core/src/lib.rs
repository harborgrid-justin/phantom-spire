//! Phantom Intel Core - Advanced Threat Intelligence Engine
//! 
//! This crate provides comprehensive threat intelligence capabilities including:
//! - Intelligence feed management and processing
//! - Indicator enrichment and correlation
//! - Threat actor profiling and attribution
//! - Campaign tracking and analysis
//! - Intelligence scoring and confidence assessment
//! - STIX/TAXII integration
//! - Automated intelligence collection
//! - Threat landscape analysis
//! - HIGH-PERFORMANCE PROCESSING with SIMD JSON, HNSW similarity search, and xxHash

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use indexmap::IndexMap;

// High-performance processing module 
pub mod high_performance;

/// Threat Intelligence Platform Core
#[derive(Debug, Clone)]
pub struct IntelCore {
    pub indicators: IndexMap<String, ThreatIndicator>,
    pub threat_actors: IndexMap<String, ThreatActor>,
    pub campaigns: IndexMap<String, ThreatCampaign>,
    pub intelligence_feeds: IndexMap<String, IntelligenceFeed>,
    pub reports: IndexMap<String, ThreatReport>,
    pub attributions: IndexMap<String, Attribution>,
    pub tactics: IndexMap<String, TacticTechnique>,
    pub vulnerabilities: IndexMap<String, ThreatVulnerability>,
}

/// Types of threat indicators
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IndicatorType {
    IpAddress,
    Domain,
    Url,
    FileHash,
    Email,
    Registry,
    Mutex,
    Certificate,
    UserAgent,
    JA3,
    YARA,
    Sigma,
    Custom(String),
}

/// Threat indicator with enrichment data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatIndicator {
    pub id: String,
    pub indicator_type: IndicatorType,
    pub value: String,
    pub confidence: f32,
    pub severity: ThreatSeverity,
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
    pub sources: Vec<String>,
    pub tags: Vec<String>,
    pub context: IndicatorContext,
    pub relationships: Vec<IndicatorRelationship>,
    pub enrichment: IndicatorEnrichment,
    pub kill_chain_phases: Vec<String>,
    pub false_positive_score: f32,
    pub expiration_date: Option<DateTime<Utc>>,
    pub metadata: HashMap<String, String>,
}

/// Context information for indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndicatorContext {
    pub malware_families: Vec<String>,
    pub threat_actors: Vec<String>,
    pub campaigns: Vec<String>,
    pub attack_patterns: Vec<String>,
    pub targeted_sectors: Vec<String>,
    pub geographic_regions: Vec<String>,
    pub description: String,
}

/// Relationships between indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndicatorRelationship {
    pub relationship_type: RelationshipType,
    pub target_indicator: String,
    pub confidence: f32,
    pub description: String,
    pub first_observed: DateTime<Utc>,
}

/// Types of relationships between indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RelationshipType {
    Communicates,
    Downloads,
    Drops,
    Uses,
    Indicates,
    Attributed,
    Variant,
    Derived,
    Related,
}

/// Enrichment data for indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndicatorEnrichment {
    pub geolocation: Option<GeolocationData>,
    pub whois: Option<WhoisData>,
    pub dns: Option<DnsData>,
    pub reputation: Option<ReputationData>,
    pub malware_analysis: Option<MalwareAnalysis>,
    pub network_analysis: Option<NetworkAnalysis>,
    pub passive_dns: Vec<PassiveDnsRecord>,
    pub certificates: Vec<CertificateData>,
}

/// Geolocation information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeolocationData {
    pub country: String,
    pub country_code: String,
    pub region: String,
    pub city: String,
    pub latitude: f64,
    pub longitude: f64,
    pub asn: u32,
    pub organization: String,
    pub isp: String,
}

/// WHOIS information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhoisData {
    pub registrar: String,
    pub creation_date: Option<DateTime<Utc>>,
    pub expiration_date: Option<DateTime<Utc>>,
    pub registrant: String,
    pub admin_contact: String,
    pub tech_contact: String,
    pub name_servers: Vec<String>,
}

/// DNS resolution data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DnsData {
    pub a_records: Vec<String>,
    pub aaaa_records: Vec<String>,
    pub mx_records: Vec<String>,
    pub ns_records: Vec<String>,
    pub txt_records: Vec<String>,
    pub cname_records: Vec<String>,
}

/// Reputation scoring data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReputationData {
    pub overall_score: f32,
    pub vendor_scores: HashMap<String, f32>,
    pub categories: Vec<String>,
    pub last_updated: DateTime<Utc>,
}

/// Malware analysis results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MalwareAnalysis {
    pub family: String,
    pub variant: String,
    pub capabilities: Vec<String>,
    pub yara_rules: Vec<String>,
    pub behavioral_indicators: Vec<String>,
    pub static_analysis: StaticAnalysis,
    pub dynamic_analysis: DynamicAnalysis,
}

/// Static analysis results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StaticAnalysis {
    pub file_type: String,
    pub size: u64,
    pub entropy: f32,
    pub imports: Vec<String>,
    pub exports: Vec<String>,
    pub sections: Vec<String>,
    pub strings: Vec<String>,
    pub packer: Option<String>,
}

/// Dynamic analysis results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DynamicAnalysis {
    pub network_connections: Vec<NetworkConnection>,
    pub file_operations: Vec<FileOperation>,
    pub registry_operations: Vec<RegistryOperation>,
    pub process_operations: Vec<ProcessOperation>,
    pub api_calls: Vec<ApiCall>,
}

/// Network connection information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConnection {
    pub protocol: String,
    pub source_ip: String,
    pub source_port: u16,
    pub destination_ip: String,
    pub destination_port: u16,
    pub direction: String,
    pub bytes_sent: u64,
    pub bytes_received: u64,
}

/// File operation information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileOperation {
    pub operation: String,
    pub file_path: String,
    pub file_hash: String,
    pub timestamp: DateTime<Utc>,
}

/// Registry operation information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegistryOperation {
    pub operation: String,
    pub key_path: String,
    pub value_name: String,
    pub value_data: String,
    pub timestamp: DateTime<Utc>,
}

/// Process operation information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessOperation {
    pub operation: String,
    pub process_name: String,
    pub process_id: u32,
    pub command_line: String,
    pub timestamp: DateTime<Utc>,
}

/// API call information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiCall {
    pub api_name: String,
    pub parameters: Vec<String>,
    pub return_value: String,
    pub timestamp: DateTime<Utc>,
}

/// Network analysis data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkAnalysis {
    pub traffic_patterns: Vec<TrafficPattern>,
    pub communication_protocols: Vec<String>,
    pub encryption_methods: Vec<String>,
    pub c2_indicators: Vec<C2Indicator>,
    pub beaconing_analysis: BeaconingAnalysis,
}

/// Traffic pattern analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrafficPattern {
    pub pattern_type: String,
    pub frequency: f32,
    pub volume: u64,
    pub timing: Vec<DateTime<Utc>>,
    pub confidence: f32,
}

/// Command and control indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct C2Indicator {
    pub indicator_type: String,
    pub value: String,
    pub protocol: String,
    pub port: u16,
    pub confidence: f32,
}

/// Beaconing analysis results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BeaconingAnalysis {
    pub is_beaconing: bool,
    pub interval: Option<u64>,
    pub jitter: Option<f32>,
    pub confidence: f32,
    pub patterns: Vec<String>,
}

/// Passive DNS record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PassiveDnsRecord {
    pub query: String,
    pub answer: String,
    pub record_type: String,
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
    pub count: u32,
}

/// Certificate data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CertificateData {
    pub serial_number: String,
    pub issuer: String,
    pub subject: String,
    pub not_before: DateTime<Utc>,
    pub not_after: DateTime<Utc>,
    pub fingerprint: String,
    pub algorithm: String,
}

/// Threat severity levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ThreatSeverity {
    Info,
    Low,
    Medium,
    High,
    Critical,
}

/// Threat actor information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatActor {
    pub id: String,
    pub name: String,
    pub aliases: Vec<String>,
    pub description: String,
    pub actor_type: ActorType,
    pub sophistication: SophisticationLevel,
    pub motivation: Vec<Motivation>,
    pub origin_country: Option<String>,
    pub target_sectors: Vec<String>,
    pub target_regions: Vec<String>,
    pub first_observed: DateTime<Utc>,
    pub last_activity: DateTime<Utc>,
    pub capabilities: Vec<String>,
    pub tools: Vec<String>,
    pub techniques: Vec<String>,
    pub infrastructure: Vec<String>,
    pub campaigns: Vec<String>,
    pub confidence: f32,
    pub metadata: HashMap<String, String>,
}

/// Types of threat actors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActorType {
    NationState,
    Cybercriminal,
    Hacktivist,
    Terrorist,
    Insider,
    Unknown,
}

/// Sophistication levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SophisticationLevel {
    Minimal,
    Intermediate,
    Advanced,
    Expert,
    Strategic,
}

/// Threat actor motivations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Motivation {
    Financial,
    Political,
    Espionage,
    Sabotage,
    Ideology,
    Revenge,
    Notoriety,
    Unknown,
}

/// Threat campaign information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatCampaign {
    pub id: String,
    pub name: String,
    pub aliases: Vec<String>,
    pub description: String,
    pub threat_actors: Vec<String>,
    pub start_date: DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,
    pub target_sectors: Vec<String>,
    pub target_regions: Vec<String>,
    pub objectives: Vec<String>,
    pub techniques: Vec<String>,
    pub tools: Vec<String>,
    pub indicators: Vec<String>,
    pub timeline: Vec<CampaignEvent>,
    pub confidence: f32,
    pub metadata: HashMap<String, String>,
}

/// Campaign timeline events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CampaignEvent {
    pub timestamp: DateTime<Utc>,
    pub event_type: String,
    pub description: String,
    pub indicators: Vec<String>,
    pub confidence: f32,
}

/// Intelligence feed configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntelligenceFeed {
    pub id: String,
    pub name: String,
    pub description: String,
    pub feed_type: FeedType,
    pub source_url: String,
    pub format: FeedFormat,
    pub update_frequency: u64,
    pub last_updated: DateTime<Utc>,
    pub enabled: bool,
    pub confidence_adjustment: f32,
    pub tags: Vec<String>,
    pub authentication: Option<FeedAuthentication>,
    pub processing_rules: Vec<ProcessingRule>,
    pub metadata: HashMap<String, String>,
}

/// Types of intelligence feeds
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FeedType {
    Commercial,
    OpenSource,
    Government,
    Community,
    Internal,
    STIX,
    TAXII,
}

/// Feed data formats
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FeedFormat {
    JSON,
    XML,
    CSV,
    STIX,
    MISP,
    IOC,
    YARA,
    Custom(String),
}

/// Feed authentication methods
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedAuthentication {
    pub auth_type: AuthenticationType,
    pub credentials: HashMap<String, String>,
}

/// Authentication types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuthenticationType {
    None,
    ApiKey,
    BasicAuth,
    OAuth,
    Certificate,
}

/// Processing rules for feeds
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessingRule {
    pub rule_type: String,
    pub condition: String,
    pub action: String,
    pub parameters: HashMap<String, String>,
}

/// Threat intelligence report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatReport {
    pub id: String,
    pub title: String,
    pub description: String,
    pub report_type: ReportType,
    pub threat_actors: Vec<String>,
    pub campaigns: Vec<String>,
    pub indicators: Vec<String>,
    pub techniques: Vec<String>,
    pub vulnerabilities: Vec<String>,
    pub published_date: DateTime<Utc>,
    pub author: String,
    pub source: String,
    pub confidence: f32,
    pub executive_summary: String,
    pub technical_details: String,
    pub recommendations: Vec<String>,
    pub references: Vec<String>,
    pub metadata: HashMap<String, String>,
}

/// Types of threat reports
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReportType {
    ThreatActor,
    Campaign,
    Malware,
    Vulnerability,
    Technique,
    Sector,
    Geographic,
    Strategic,
    Tactical,
}

/// Attribution analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attribution {
    pub id: String,
    pub threat_actor: String,
    pub campaign: Option<String>,
    pub indicators: Vec<String>,
    pub techniques: Vec<String>,
    pub confidence: f32,
    pub evidence: Vec<AttributionEvidence>,
    pub analysis_date: DateTime<Utc>,
    pub analyst: String,
    pub methodology: String,
    pub metadata: HashMap<String, String>,
}

/// Attribution evidence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttributionEvidence {
    pub evidence_type: EvidenceType,
    pub description: String,
    pub weight: f32,
    pub confidence: f32,
    pub sources: Vec<String>,
}

/// Types of attribution evidence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EvidenceType {
    Technical,
    Behavioral,
    Linguistic,
    Temporal,
    Infrastructure,
    Operational,
    Strategic,
}

/// Tactic and technique information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TacticTechnique {
    pub id: String,
    pub tactic: String,
    pub technique: String,
    pub sub_technique: Option<String>,
    pub description: String,
    pub platforms: Vec<String>,
    pub data_sources: Vec<String>,
    pub detection_methods: Vec<String>,
    pub mitigation_strategies: Vec<String>,
    pub threat_actors: Vec<String>,
    pub campaigns: Vec<String>,
    pub examples: Vec<String>,
    pub references: Vec<String>,
    pub metadata: HashMap<String, String>,
}

/// Threat vulnerability information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatVulnerability {
    pub id: String,
    pub cve_id: Option<String>,
    pub title: String,
    pub description: String,
    pub severity: ThreatSeverity,
    pub cvss_score: Option<f32>,
    pub affected_products: Vec<String>,
    pub exploit_available: bool,
    pub exploited_in_wild: bool,
    pub threat_actors: Vec<String>,
    pub campaigns: Vec<String>,
    pub published_date: DateTime<Utc>,
    pub discovery_date: Option<DateTime<Utc>>,
    pub patch_available: bool,
    pub patch_date: Option<DateTime<Utc>>,
    pub references: Vec<String>,
    pub metadata: HashMap<String, String>,
}

impl IntelCore {
    /// Create a new IntelCore instance
    pub fn new() -> Self {
        let mut core = IntelCore {
            indicators: IndexMap::new(),
            threat_actors: IndexMap::new(),
            campaigns: IndexMap::new(),
            intelligence_feeds: IndexMap::new(),
            reports: IndexMap::new(),
            attributions: IndexMap::new(),
            tactics: IndexMap::new(),
            vulnerabilities: IndexMap::new(),
        };
        
        core.load_sample_data();
        core
    }

    /// Add a threat indicator
    pub fn add_indicator(&mut self, indicator: ThreatIndicator) -> String {
        let id = indicator.id.clone();
        self.indicators.insert(id.clone(), indicator);
        id
    }

    /// Get indicator by ID
    pub fn get_indicator(&self, id: &str) -> Option<&ThreatIndicator> {
        self.indicators.get(id)
    }

    /// Search indicators by type and value
    pub fn search_indicators(&self, indicator_type: &IndicatorType, value: &str) -> Vec<&ThreatIndicator> {
        self.indicators
            .values()
            .filter(|indicator| &indicator.indicator_type == indicator_type && indicator.value.contains(value))
            .collect()
    }

    /// Enrich an indicator with additional data
    pub fn enrich_indicator(&mut self, id: &str, enrichment: IndicatorEnrichment) -> bool {
        if let Some(indicator) = self.indicators.get_mut(id) {
            indicator.enrichment = enrichment;
            indicator.last_seen = Utc::now();
            true
        } else {
            false
        }
    }

    /// Add a threat actor
    pub fn add_threat_actor(&mut self, actor: ThreatActor) -> String {
        let id = actor.id.clone();
        self.threat_actors.insert(id.clone(), actor);
        id
    }

    /// Get threat actor by ID
    pub fn get_threat_actor(&self, id: &str) -> Option<&ThreatActor> {
        self.threat_actors.get(id)
    }

    /// Add a threat campaign
    pub fn add_campaign(&mut self, campaign: ThreatCampaign) -> String {
        let id = campaign.id.clone();
        self.campaigns.insert(id.clone(), campaign);
        id
    }

    /// Get campaign by ID
    pub fn get_campaign(&self, id: &str) -> Option<&ThreatCampaign> {
        self.campaigns.get(id)
    }

    /// Add an intelligence feed
    pub fn add_feed(&mut self, feed: IntelligenceFeed) -> String {
        let id = feed.id.clone();
        self.intelligence_feeds.insert(id.clone(), feed);
        id
    }

    /// Process intelligence feed data
    pub fn process_feed(&mut self, feed_id: &str, data: &str) -> std::result::Result<usize, String> {
        let feed = self.intelligence_feeds.get(feed_id)
            .ok_or_else(|| format!("Feed {} not found", feed_id))?;

        if !feed.enabled {
            return std::result::Result::Err("Feed is disabled".to_string());
        }

        // Simulate processing feed data
        let processed_count = data.lines().count();
        
        // Update feed last_updated timestamp
        if let Some(feed) = self.intelligence_feeds.get_mut(feed_id) {
            feed.last_updated = Utc::now();
        }

        std::result::Result::Ok(processed_count)
    }

    /// Correlate indicators across campaigns and actors
    pub fn correlate_indicators(&self, indicator_id: &str) -> Vec<String> {
        let mut correlations = Vec::new();

        if let Some(indicator) = self.get_indicator(indicator_id) {
            // Find related campaigns
            for campaign in self.campaigns.values() {
                if campaign.indicators.contains(&indicator_id.to_string()) {
                    correlations.push(format!("Campaign: {}", campaign.name));
                }
            }

            // Find related threat actors
            for actor in self.threat_actors.values() {
                if indicator.context.threat_actors.contains(&actor.name) {
                    correlations.push(format!("Threat Actor: {}", actor.name));
                }
            }

            // Find related indicators through relationships
            for relationship in &indicator.relationships {
                correlations.push(format!("Related Indicator: {} ({})", 
                    relationship.target_indicator, 
                    format!("{:?}", relationship.relationship_type)));
            }
        }

        correlations
    }

    /// Generate threat intelligence summary
    pub fn generate_intelligence_summary(&self) -> IntelligenceSummary {
        IntelligenceSummary {
            total_indicators: self.indicators.len(),
            total_threat_actors: self.threat_actors.len(),
            total_campaigns: self.campaigns.len(),
            total_feeds: self.intelligence_feeds.len(),
            active_feeds: self.intelligence_feeds.values().filter(|f| f.enabled).count(),
            high_confidence_indicators: self.indicators.values()
                .filter(|i| i.confidence > 0.8).count(),
            critical_indicators: self.indicators.values()
                .filter(|i| i.severity == ThreatSeverity::Critical).count(),
            recent_indicators: self.indicators.values()
                .filter(|i| {
                    let days_ago = Utc::now() - chrono::Duration::days(7);
                    i.first_seen > days_ago
                }).count(),
            top_threat_actors: self.get_top_threat_actors(5),
            active_campaigns: self.get_active_campaigns(),
            indicator_types: self.get_indicator_type_distribution(),
        }
    }

    /// Get top threat actors by activity
    fn get_top_threat_actors(&self, limit: usize) -> Vec<String> {
        let mut actors: Vec<_> = self.threat_actors.values().collect();
        actors.sort_by(|a, b| b.last_activity.cmp(&a.last_activity));
        actors.into_iter().take(limit).map(|a| a.name.clone()).collect()
    }

    /// Get active campaigns
    fn get_active_campaigns(&self) -> Vec<String> {
        self.campaigns.values()
            .filter(|c| c.end_date.is_none())
            .map(|c| c.name.clone())
            .collect()
    }

    /// Get indicator type distribution
    fn get_indicator_type_distribution(&self) -> HashMap<String, usize> {
        let mut distribution = HashMap::new();
        for indicator in self.indicators.values() {
            let type_name = format!("{:?}", indicator.indicator_type);
            *distribution.entry(type_name).or_insert(0) += 1;
        }
        distribution
    }

    /// Load sample threat intelligence data
    fn load_sample_data(&mut self) {
        // Sample threat indicator
        let sample_indicator = ThreatIndicator {
            id: "indicator-001".to_string(),
            indicator_type: IndicatorType::IpAddress,
            value: "192.168.1.100".to_string(),
            confidence: 0.85,
            severity: ThreatSeverity::High,
            first_seen: Utc::now() - chrono::Duration::days(30),
            last_seen: Utc::now() - chrono::Duration::days(1),
            sources: vec!["ThreatFeed1".to_string(), "Internal".to_string()],
            tags: vec!["malware".to_string(), "c2".to_string()],
            context: IndicatorContext {
                malware_families: vec!["TrickBot".to_string()],
                threat_actors: vec!["TA505".to_string()],
                campaigns: vec!["Operation Stealth".to_string()],
                attack_patterns: vec!["T1071".to_string()],
                targeted_sectors: vec!["Financial".to_string()],
                geographic_regions: vec!["North America".to_string()],
                description: "Command and control server for TrickBot malware".to_string(),
            },
            relationships: vec![],
            enrichment: IndicatorEnrichment {
                geolocation: Some(GeolocationData {
                    country: "United States".to_string(),
                    country_code: "US".to_string(),
                    region: "California".to_string(),
                    city: "San Francisco".to_string(),
                    latitude: 37.7749,
                    longitude: -122.4194,
                    asn: 15169,
                    organization: "Google LLC".to_string(),
                    isp: "Google".to_string(),
                }),
                whois: None,
                dns: None,
                reputation: Some(ReputationData {
                    overall_score: 0.2,
                    vendor_scores: HashMap::new(),
                    categories: vec!["malware".to_string()],
                    last_updated: Utc::now(),
                }),
                malware_analysis: None,
                network_analysis: None,
                passive_dns: vec![],
                certificates: vec![],
            },
            kill_chain_phases: vec!["command-and-control".to_string()],
            false_positive_score: 0.1,
            expiration_date: Some(Utc::now() + chrono::Duration::days(90)),
            metadata: HashMap::new(),
        };
        self.add_indicator(sample_indicator);

        // Sample threat actor
        let sample_actor = ThreatActor {
            id: "actor-001".to_string(),
            name: "TA505".to_string(),
            aliases: vec!["Hive0065".to_string(), "SectorJ04".to_string()],
            description: "Financially motivated threat group".to_string(),
            actor_type: ActorType::Cybercriminal,
            sophistication: SophisticationLevel::Advanced,
            motivation: vec![Motivation::Financial],
            origin_country: Some("Unknown".to_string()),
            target_sectors: vec!["Financial".to_string(), "Retail".to_string()],
            target_regions: vec!["Global".to_string()],
            first_observed: Utc::now() - chrono::Duration::days(365),
            last_activity: Utc::now() - chrono::Duration::days(7),
            capabilities: vec!["Malware Development".to_string(), "Social Engineering".to_string()],
            tools: vec!["TrickBot".to_string(), "Emotet".to_string()],
            techniques: vec!["T1566.001".to_string(), "T1071.001".to_string()],
            infrastructure: vec!["Bulletproof Hosting".to_string()],
            campaigns: vec!["Operation Stealth".to_string()],
            confidence: 0.9,
            metadata: HashMap::new(),
        };
        self.add_threat_actor(sample_actor);

        // Sample campaign
        let sample_campaign = ThreatCampaign {
            id: "campaign-001".to_string(),
            name: "Operation Stealth".to_string(),
            aliases: vec!["SilentStrike".to_string()],
            description: "Large-scale banking trojan campaign".to_string(),
            threat_actors: vec!["TA505".to_string()],
            start_date: Utc::now() - chrono::Duration::days(90),
            end_date: None,
            target_sectors: vec!["Financial".to_string()],
            target_regions: vec!["North America".to_string(), "Europe".to_string()],
            objectives: vec!["Financial Theft".to_string(), "Credential Harvesting".to_string()],
            techniques: vec!["T1566.001".to_string(), "T1071.001".to_string()],
            tools: vec!["TrickBot".to_string()],
            indicators: vec!["indicator-001".to_string()],
            timeline: vec![],
            confidence: 0.85,
            metadata: HashMap::new(),
        };
        self.add_campaign(sample_campaign);

        // Sample intelligence feed
        let sample_feed = IntelligenceFeed {
            id: "feed-001".to_string(),
            name: "Commercial Threat Feed".to_string(),
            description: "High-quality commercial threat intelligence feed".to_string(),
            feed_type: FeedType::Commercial,
            source_url: "https://api.threatprovider.com/feed".to_string(),
            format: FeedFormat::JSON,
            update_frequency: 3600, // 1 hour
            last_updated: Utc::now() - chrono::Duration::hours(2),
            enabled: true,
            confidence_adjustment: 0.1,
            tags: vec!["commercial".to_string(), "high-quality".to_string()],
            authentication: Some(FeedAuthentication {
                auth_type: AuthenticationType::ApiKey,
                credentials: HashMap::new(),
            }),
            processing_rules: vec![],
            metadata: HashMap::new(),
        };
        self.add_feed(sample_feed);
    }
}

/// Intelligence summary statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntelligenceSummary {
    pub total_indicators: usize,
    pub total_threat_actors: usize,
    pub total_campaigns: usize,
    pub total_feeds: usize,
    pub active_feeds: usize,
    pub high_confidence_indicators: usize,
    pub critical_indicators: usize,
    pub recent_indicators: usize,
    pub top_threat_actors: Vec<String>,
    pub active_campaigns: Vec<String>,
    pub indicator_types: HashMap<String, usize>,
}

impl Default for IntelCore {
    fn default() -> Self {
        Self::new()
    }
}

// NAPI wrapper for JavaScript bindings
#[napi]
pub struct IntelCoreNapi {
    inner: IntelCore,
}

#[napi]
impl IntelCoreNapi {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            inner: IntelCore::new(),
        }
    }

    #[napi]
    pub fn add_indicator(&mut self, indicator_json: String) -> Result<String> {
        let indicator: ThreatIndicator = serde_json::from_str(&indicator_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse indicator: {}", e)))?;
        
        Ok(self.inner.add_indicator(indicator))
    }

    #[napi]
    pub fn get_indicator(&self, id: String) -> Result<Option<String>> {
        match self.inner.get_indicator(&id) {
            Some(indicator) => {
                let json = serde_json::to_string(indicator)
                    .map_err(|e| napi::Error::from_reason(format!("Failed to serialize indicator: {}", e)))?;
                Ok(Some(json))
            }
            None => Ok(None)
        }
    }

    #[napi]
    pub fn search_indicators(&self, indicator_type: String, value: String) -> Result<String> {
        let itype = match indicator_type.as_str() {
            "IpAddress" => IndicatorType::IpAddress,
            "Domain" => IndicatorType::Domain,
            "Url" => IndicatorType::Url,
            "FileHash" => IndicatorType::FileHash,
            "Email" => IndicatorType::Email,
            "Registry" => IndicatorType::Registry,
            "Mutex" => IndicatorType::Mutex,
            "Certificate" => IndicatorType::Certificate,
            "UserAgent" => IndicatorType::UserAgent,
            "JA3" => IndicatorType::JA3,
            "YARA" => IndicatorType::YARA,
            "Sigma" => IndicatorType::Sigma,
            _ => IndicatorType::Custom(indicator_type),
        };

        let results = self.inner.search_indicators(&itype, &value);
        serde_json::to_string(&results)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize results: {}", e)))
    }

    #[napi]
    pub fn enrich_indicator(&mut self, id: String, enrichment_json: String) -> Result<bool> {
        let enrichment: IndicatorEnrichment = serde_json::from_str(&enrichment_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse enrichment: {}", e)))?;
        
        Ok(self.inner.enrich_indicator(&id, enrichment))
    }

    #[napi]
    pub fn add_threat_actor(&mut self, actor_json: String) -> Result<String> {
        let actor: ThreatActor = serde_json::from_str(&actor_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse threat actor: {}", e)))?;
        
        Ok(self.inner.add_threat_actor(actor))
    }

    #[napi]
    pub fn correlate_indicators(&self, indicator_id: String) -> Result<String> {
        let correlations = self.inner.correlate_indicators(&indicator_id);
        serde_json::to_string(&correlations)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize correlations: {}", e)))
    }

    #[napi]
    pub fn generate_intelligence_summary(&self) -> Result<String> {
        let summary = self.inner.generate_intelligence_summary();
        serde_json::to_string(&summary)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize summary: {}", e)))
    }
}
