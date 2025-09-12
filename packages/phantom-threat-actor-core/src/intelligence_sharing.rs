//! Intelligence Sharing Module
//!
//! Secure intelligence sharing platform for threat actor information
//! with privacy protection, trust scoring, and automated dissemination.

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet, VecDeque};
use chrono::{DateTime, Utc, Duration};
use uuid::Uuid;
use anyhow::Result;

/// Intelligence sharing platform
#[derive(Debug, Clone)]
pub struct IntelligenceSharingModule {
    sharing_partners: HashMap<String, SharingPartner>,
    intelligence_feeds: HashMap<String, IntelligenceFeed>,
    sharing_policies: Vec<SharingPolicy>,
    trust_scores: HashMap<String, TrustScore>,
    shared_intelligence: Vec<SharedIntelligence>,
    privacy_engine: PrivacyEngine,
    dissemination_engine: DisseminationEngine,
}

impl IntelligenceSharingModule {
    /// Create a new intelligence sharing module
    pub fn new() -> Self {
        Self {
            sharing_partners: HashMap::new(),
            intelligence_feeds: HashMap::new(),
            sharing_policies: Vec::new(),
            trust_scores: HashMap::new(),
            shared_intelligence: Vec::new(),
            privacy_engine: PrivacyEngine::new(),
            dissemination_engine: DisseminationEngine::new(),
        }
    }

    /// Register a new sharing partner
    pub async fn register_sharing_partner(&mut self, partner_config: SharingPartnerConfig) -> Result<String> {
        let partner_id = Uuid::new_v4().to_string();

        let partner = SharingPartner {
            partner_id: partner_id.clone(),
            name: partner_config.name,
            organization: partner_config.organization,
            contact_info: partner_config.contact_info,
            sharing_level: partner_config.sharing_level,
            trust_score: 0.5, // Initial trust score
            partnership_status: PartnershipStatus::Pending,
            shared_intelligence_count: 0,
            last_sharing_activity: None,
            capabilities: partner_config.capabilities,
            restrictions: partner_config.restrictions,
            registered_at: Utc::now(),
        };

        self.sharing_partners.insert(partner_id.clone(), partner);

        // Initialize trust score
        self.trust_scores.insert(partner_id.clone(), TrustScore {
            partner_id: partner_id.clone(),
            overall_score: 0.5,
            reliability_score: 0.5,
            timeliness_score: 0.5,
            quality_score: 0.5,
            collaboration_score: 0.5,
            last_updated: Utc::now(),
            score_history: Vec::new(),
        });

        Ok(partner_id)
    }

    /// Share intelligence with partners
    pub async fn share_intelligence(
        &mut self,
        intelligence: &ThreatIntelligence,
        sharing_criteria: &SharingCriteria,
    ) -> Result<SharingResult> {
        let mut shared_with = Vec::new();
        let mut failed_shares = Vec::new();

        // Find eligible partners
        let eligible_partners = self.find_eligible_partners(sharing_criteria)?;

        for partner in eligible_partners {
            match self.share_with_partner(intelligence, &partner, sharing_criteria).await {
                Ok(_) => {
                    shared_with.push(partner.partner_id.clone());
                    self.update_partner_activity(&partner.partner_id);
                }
                Err(e) => {
                    failed_shares.push(SharingFailure {
                        partner_id: partner.partner_id.clone(),
                        reason: e.to_string(),
                    });
                }
            }
        }

        // Record the sharing activity
        let sharing_record = SharedIntelligence {
            intelligence_id: intelligence.intelligence_id.clone(),
            shared_by: "local_organization".to_string(),
            shared_with: shared_with.clone(),
            sharing_timestamp: Utc::now(),
            sharing_criteria: sharing_criteria.clone(),
            privacy_measures: self.privacy_engine.get_applied_measures(intelligence),
            dissemination_channels: vec!["secure_api".to_string()],
        };

        self.shared_intelligence.push(sharing_record);

        Ok(SharingResult {
            intelligence_id: intelligence.intelligence_id.clone(),
            total_partners: self.sharing_partners.len(),
            shared_with_count: shared_with.len(),
            failed_shares,
            sharing_timestamp: Utc::now(),
        })
    }

    /// Find eligible partners for sharing
    fn find_eligible_partners(&self, criteria: &SharingCriteria) -> Result<Vec<&SharingPartner>> {
        let mut eligible = Vec::new();

        for partner in self.sharing_partners.values() {
            if self.is_partner_eligible(partner, criteria) {
                eligible.push(partner);
            }
        }

        Ok(eligible)
    }

    /// Check if a partner is eligible for sharing
    fn is_partner_eligible(&self, partner: &SharingPartner, criteria: &SharingCriteria) -> bool {
        // Check partnership status
        if partner.partnership_status != PartnershipStatus::Active {
            return false;
        }

        // Check trust score threshold
        if let Some(min_trust) = criteria.min_trust_score {
            if partner.trust_score < min_trust {
                return false;
            }
        }

        // Check sharing level compatibility
        if !self.is_sharing_level_compatible(&partner.sharing_level, &criteria.sharing_level) {
            return false;
        }

        // Check capability requirements
        for required_capability in &criteria.required_capabilities {
            if !partner.capabilities.contains(required_capability) {
                return false;
            }
        }

        // Check restrictions
        for restriction in &partner.restrictions {
            if criteria.intelligence_type == restriction.restricted_type {
                return false;
            }
        }

        true
    }

    /// Check sharing level compatibility
    fn is_sharing_level_compatible(&self, partner_level: &SharingLevel, required_level: &SharingLevel) -> bool {
        match (partner_level, required_level) {
            (SharingLevel::Full, _) => true,
            (SharingLevel::High, SharingLevel::High | SharingLevel::Medium | SharingLevel::Low) => true,
            (SharingLevel::Medium, SharingLevel::Medium | SharingLevel::Low) => true,
            (SharingLevel::Low, SharingLevel::Low) => true,
            _ => false,
        }
    }

    /// Share intelligence with a specific partner
    async fn share_with_partner(
        &self,
        intelligence: &ThreatIntelligence,
        partner: &SharingPartner,
        criteria: &SharingCriteria,
    ) -> Result<()> {
        // Apply privacy measures
        let sanitized_intelligence = self.privacy_engine.sanitize_intelligence(intelligence, &partner.capabilities)?;

        // Determine dissemination channel
        let channel = self.dissemination_engine.select_channel(&partner.capabilities)?;

        // Simulate sharing (in real implementation, this would send to partner's endpoint)
        println!("Sharing intelligence {} with partner {} via {}", 
                intelligence.intelligence_id, partner.name, channel);

        Ok(())
    }

    /// Update partner activity tracking
    fn update_partner_activity(&mut self, partner_id: &str) {
        if let Some(partner) = self.sharing_partners.get_mut(partner_id) {
            partner.shared_intelligence_count += 1;
            partner.last_sharing_activity = Some(Utc::now());
        }
    }

    /// Receive intelligence from a partner
    pub async fn receive_intelligence(
        &mut self,
        intelligence: ThreatIntelligence,
        source_partner_id: &str,
    ) -> Result<ReceiveResult> {
        // Validate the intelligence
        self.validate_received_intelligence(&intelligence)?;

        // Update trust score for the source partner
        self.update_trust_score(source_partner_id, &intelligence)?;

        // Store the intelligence (in real implementation, this would integrate with storage)
        let receive_record = ReceivedIntelligence {
            intelligence_id: intelligence.intelligence_id.clone(),
            received_from: source_partner_id.to_string(),
            received_at: Utc::now(),
            validation_status: ValidationStatus::Validated,
            integration_status: IntegrationStatus::Pending,
        };

        Ok(ReceiveResult {
            intelligence_id: intelligence.intelligence_id,
            received_from: source_partner_id.to_string(),
            validation_status: ValidationStatus::Validated,
            processing_status: ProcessingStatus::Queued,
            received_at: Utc::now(),
        })
    }

    /// Validate received intelligence
    fn validate_received_intelligence(&self, intelligence: &ThreatIntelligence) -> Result<()> {
        // Check for required fields
        if intelligence.intelligence_id.is_empty() {
            return Err(anyhow::anyhow!("Missing intelligence ID"));
        }

        if intelligence.title.is_empty() {
            return Err(anyhow::anyhow!("Missing intelligence title"));
        }

        // Check confidence score
        if intelligence.confidence_score < 0.0 || intelligence.confidence_score > 1.0 {
            return Err(anyhow::anyhow!("Invalid confidence score"));
        }

        // Check timestamp
        if intelligence.created_at > Utc::now() {
            return Err(anyhow::anyhow!("Future timestamp detected"));
        }

        Ok(())
    }

    /// Update trust score for a partner
    fn update_trust_score(&mut self, partner_id: &str, intelligence: &ThreatIntelligence) -> Result<()> {
        if let Some(trust_score) = self.trust_scores.get_mut(partner_id) {
            // Update quality score based on intelligence quality
            let quality_boost = intelligence.confidence_score * 0.1;
            trust_score.quality_score = (trust_score.quality_score + quality_boost).min(1.0);

            // Update timeliness score based on how recent the intelligence is
            let age_hours = Utc::now().signed_duration_since(intelligence.created_at).num_hours() as f64;
            let timeliness_score = if age_hours < 24.0 { 1.0 } else { (1.0 / age_hours).max(0.1) };
            trust_score.timeliness_score = (trust_score.timeliness_score + timeliness_score * 0.1).min(1.0);

            // Recalculate overall score
            trust_score.overall_score = (trust_score.reliability_score +
                                        trust_score.timeliness_score +
                                        trust_score.quality_score +
                                        trust_score.collaboration_score) / 4.0;

            trust_score.last_updated = Utc::now();

            // Update partner's trust score
            if let Some(partner) = self.sharing_partners.get_mut(partner_id) {
                partner.trust_score = trust_score.overall_score;
            }
        }

        Ok(())
    }

    /// Create a sharing policy
    pub async fn create_sharing_policy(&mut self, policy_config: SharingPolicyConfig) -> Result<String> {
        let policy_id = Uuid::new_v4().to_string();

        let policy = SharingPolicy {
            policy_id: policy_id.clone(),
            name: policy_config.name,
            description: policy_config.description,
            intelligence_types: policy_config.intelligence_types,
            sharing_criteria: policy_config.sharing_criteria,
            privacy_requirements: policy_config.privacy_requirements,
            compliance_requirements: policy_config.compliance_requirements,
            created_at: Utc::now(),
            last_modified: Utc::now(),
            is_active: true,
        };

        self.sharing_policies.push(policy);

        Ok(policy_id)
    }

    /// Get sharing statistics
    pub fn get_sharing_statistics(&self) -> SharingStatistics {
        let total_partners = self.sharing_partners.len();
        let active_partners = self.sharing_partners.values()
            .filter(|p| p.partnership_status == PartnershipStatus::Active)
            .count();
        let total_shared = self.shared_intelligence.len();
        let average_trust_score = if !self.trust_scores.is_empty() {
            self.trust_scores.values().map(|t| t.overall_score).sum::<f64>() / self.trust_scores.len() as f64
        } else {
            0.0
        };

        SharingStatistics {
            total_partners,
            active_partners,
            pending_partners: total_partners - active_partners,
            total_intelligence_shared: total_shared,
            average_trust_score,
            sharing_by_type: self.calculate_sharing_by_type(),
            partner_activity: self.calculate_partner_activity(),
        }
    }

    /// Calculate sharing statistics by intelligence type
    fn calculate_sharing_by_type(&self) -> HashMap<String, usize> {
        let mut type_counts = HashMap::new();

        for shared in &self.shared_intelligence {
            // In a real implementation, we'd track the intelligence type
            *type_counts.entry("threat_actor".to_string()).or_insert(0) += 1;
        }

        type_counts
    }

    /// Calculate partner activity statistics
    fn calculate_partner_activity(&self) -> HashMap<String, PartnerActivity> {
        let mut activity_stats = HashMap::new();

        for partner in self.sharing_partners.values() {
            let activity = PartnerActivity {
                partner_id: partner.partner_id.clone(),
                last_activity: partner.last_sharing_activity,
                intelligence_shared: partner.shared_intelligence_count,
                trust_score: partner.trust_score,
                status: partner.partnership_status.clone(),
            };

            activity_stats.insert(partner.partner_id.clone(), activity);
        }

        activity_stats
    }

    /// Get intelligence feeds
    pub fn get_intelligence_feeds(&self) -> Vec<&IntelligenceFeed> {
        self.intelligence_feeds.values().collect()
    }

    /// Subscribe to an intelligence feed
    pub async fn subscribe_to_feed(&mut self, feed_config: FeedSubscriptionConfig) -> Result<String> {
        let feed_id = Uuid::new_v4().to_string();

        let feed = IntelligenceFeed {
            feed_id: feed_id.clone(),
            name: feed_config.name,
            description: feed_config.description,
            feed_type: feed_config.feed_type,
            source_url: feed_config.source_url,
            authentication_required: feed_config.authentication_required,
            update_frequency: feed_config.update_frequency,
            last_updated: None,
            record_count: 0,
            quality_score: 0.5,
            is_active: true,
            subscribed_at: Utc::now(),
        };

        self.intelligence_feeds.insert(feed_id.clone(), feed);

        Ok(feed_id)
    }

    /// Process intelligence from feeds
    pub async fn process_feed_intelligence(&mut self, feed_id: &str, intelligence_items: Vec<ThreatIntelligence>) -> Result<FeedProcessingResult> {
        let mut processed = 0;
        let mut duplicates = 0;
        let mut errors = 0;

        for item in intelligence_items {
            match self.receive_intelligence(item, feed_id).await {
                Ok(_) => processed += 1,
                Err(e) => {
                    if e.to_string().contains("duplicate") {
                        duplicates += 1;
                    } else {
                        errors += 1;
                    }
                }
            }
        }

        // Update feed statistics
        if let Some(feed) = self.intelligence_feeds.get_mut(feed_id) {
            feed.last_updated = Some(Utc::now());
            feed.record_count += processed;
        }

        Ok(FeedProcessingResult {
            feed_id: feed_id.to_string(),
            items_processed: processed,
            duplicates_found: duplicates,
            errors_encountered: errors,
            processing_timestamp: Utc::now(),
        })
    }
}

// Data structures

/// Sharing partner configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharingPartnerConfig {
    pub name: String,
    pub organization: String,
    pub contact_info: ContactInfo,
    pub sharing_level: SharingLevel,
    pub capabilities: Vec<String>,
    pub restrictions: Vec<SharingRestriction>,
}

/// Contact information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContactInfo {
    pub email: String,
    pub phone: Option<String>,
    pub security_contact: Option<String>,
}

/// Sharing level
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum SharingLevel {
    Full,
    High,
    Medium,
    Low,
}

/// Sharing restriction
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharingRestriction {
    pub restricted_type: String,
    pub reason: String,
    pub expiry_date: Option<DateTime<Utc>>,
}

/// Sharing partner
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharingPartner {
    pub partner_id: String,
    pub name: String,
    pub organization: String,
    pub contact_info: ContactInfo,
    pub sharing_level: SharingLevel,
    pub trust_score: f64,
    pub partnership_status: PartnershipStatus,
    pub shared_intelligence_count: usize,
    pub last_sharing_activity: Option<DateTime<Utc>>,
    pub capabilities: Vec<String>,
    pub restrictions: Vec<SharingRestriction>,
    pub registered_at: DateTime<Utc>,
}

/// Partnership status
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum PartnershipStatus {
    Pending,
    Active,
    Suspended,
    Terminated,
}

/// Trust score
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrustScore {
    pub partner_id: String,
    pub overall_score: f64,
    pub reliability_score: f64,
    pub timeliness_score: f64,
    pub quality_score: f64,
    pub collaboration_score: f64,
    pub last_updated: DateTime<Utc>,
    pub score_history: Vec<TrustScoreSnapshot>,
}

/// Trust score snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrustScoreSnapshot {
    pub timestamp: DateTime<Utc>,
    pub score: f64,
    pub reason: String,
}

/// Threat intelligence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatIntelligence {
    pub intelligence_id: String,
    pub title: String,
    pub description: String,
    pub intelligence_type: String,
    pub confidence_score: f64,
    pub severity: Severity,
    pub indicators: Vec<String>,
    pub tactics: Vec<String>,
    pub techniques: Vec<String>,
    pub affected_sectors: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
    pub source: String,
    pub tags: Vec<String>,
}

/// Severity levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Severity {
    Low,
    Medium,
    High,
    Critical,
}

/// Sharing criteria
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharingCriteria {
    pub intelligence_type: String,
    pub min_confidence_score: Option<f64>,
    pub min_trust_score: Option<f64>,
    pub sharing_level: SharingLevel,
    pub required_capabilities: Vec<String>,
    pub excluded_partners: Vec<String>,
    pub time_sensitivity: TimeSensitivity,
}

/// Time sensitivity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TimeSensitivity {
    Immediate,
    High,
    Medium,
    Low,
}

/// Sharing result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharingResult {
    pub intelligence_id: String,
    pub total_partners: usize,
    pub shared_with_count: usize,
    pub failed_shares: Vec<SharingFailure>,
    pub sharing_timestamp: DateTime<Utc>,
}

/// Sharing failure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharingFailure {
    pub partner_id: String,
    pub reason: String,
}

/// Shared intelligence record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharedIntelligence {
    pub intelligence_id: String,
    pub shared_by: String,
    pub shared_with: Vec<String>,
    pub sharing_timestamp: DateTime<Utc>,
    pub sharing_criteria: SharingCriteria,
    pub privacy_measures: Vec<String>,
    pub dissemination_channels: Vec<String>,
}

/// Receive result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReceiveResult {
    pub intelligence_id: String,
    pub received_from: String,
    pub validation_status: ValidationStatus,
    pub processing_status: ProcessingStatus,
    pub received_at: DateTime<Utc>,
}

/// Validation status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ValidationStatus {
    Validated,
    Suspect,
    Invalid,
}

/// Processing status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProcessingStatus {
    Queued,
    Processing,
    Completed,
    Failed,
}

/// Received intelligence record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReceivedIntelligence {
    pub intelligence_id: String,
    pub received_from: String,
    pub received_at: DateTime<Utc>,
    pub validation_status: ValidationStatus,
    pub integration_status: IntegrationStatus,
}

/// Integration status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IntegrationStatus {
    Pending,
    Integrated,
    Rejected,
    Duplicate,
}

/// Sharing policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharingPolicy {
    pub policy_id: String,
    pub name: String,
    pub description: String,
    pub intelligence_types: Vec<String>,
    pub sharing_criteria: SharingCriteria,
    pub privacy_requirements: Vec<String>,
    pub compliance_requirements: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub last_modified: DateTime<Utc>,
    pub is_active: bool,
}

/// Sharing policy configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharingPolicyConfig {
    pub name: String,
    pub description: String,
    pub intelligence_types: Vec<String>,
    pub sharing_criteria: SharingCriteria,
    pub privacy_requirements: Vec<String>,
    pub compliance_requirements: Vec<String>,
}

/// Sharing statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharingStatistics {
    pub total_partners: usize,
    pub active_partners: usize,
    pub pending_partners: usize,
    pub total_intelligence_shared: usize,
    pub average_trust_score: f64,
    pub sharing_by_type: HashMap<String, usize>,
    pub partner_activity: HashMap<String, PartnerActivity>,
}

/// Partner activity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartnerActivity {
    pub partner_id: String,
    pub last_activity: Option<DateTime<Utc>>,
    pub intelligence_shared: usize,
    pub trust_score: f64,
    pub status: PartnershipStatus,
}

/// Intelligence feed
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntelligenceFeed {
    pub feed_id: String,
    pub name: String,
    pub description: String,
    pub feed_type: String,
    pub source_url: String,
    pub authentication_required: bool,
    pub update_frequency: Duration,
    pub last_updated: Option<DateTime<Utc>>,
    pub record_count: usize,
    pub quality_score: f64,
    pub is_active: bool,
    pub subscribed_at: DateTime<Utc>,
}

/// Feed subscription configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedSubscriptionConfig {
    pub name: String,
    pub description: String,
    pub feed_type: String,
    pub source_url: String,
    pub authentication_required: bool,
    pub update_frequency: Duration,
}

/// Feed processing result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedProcessingResult {
    pub feed_id: String,
    pub items_processed: usize,
    pub duplicates_found: usize,
    pub errors_encountered: usize,
    pub processing_timestamp: DateTime<Utc>,
}

/// Privacy engine for data sanitization
#[derive(Debug, Clone)]
struct PrivacyEngine {
    privacy_rules: Vec<PrivacyRule>,
}

impl PrivacyEngine {
    fn new() -> Self {
        Self {
            privacy_rules: vec![
                PrivacyRule {
                    rule_id: "PR001".to_string(),
                    name: "IP Address Masking".to_string(),
                    applies_to: vec!["ip_address".to_string()],
                    masking_strategy: MaskingStrategy::PartialMask,
                },
                PrivacyRule {
                    rule_id: "PR002".to_string(),
                    name: "Domain Name Generalization".to_string(),
                    applies_to: vec!["domain".to_string()],
                    masking_strategy: MaskingStrategy::Generalization,
                },
            ],
        }
    }

    fn sanitize_intelligence(&self, intelligence: &ThreatIntelligence, capabilities: &[String]) -> Result<ThreatIntelligence> {
        let mut sanitized = intelligence.clone();

        // Apply privacy rules based on partner capabilities
        for rule in &self.privacy_rules {
            if capabilities.contains(&"privacy_compliant".to_string()) {
                // Apply minimal masking for trusted partners
                continue;
            }

            // Apply masking for regular partners
            sanitized = self.apply_privacy_rule(sanitized, rule);
        }

        Ok(sanitized)
    }

    fn apply_privacy_rule(&self, mut intelligence: ThreatIntelligence, rule: &PrivacyRule) -> ThreatIntelligence {
        // Apply masking to indicators
        for indicator in &mut intelligence.indicators {
            if rule.applies_to.iter().any(|t| indicator.contains(t)) {
                *indicator = self.mask_value(indicator, &rule.masking_strategy);
            }
        }

        intelligence
    }

    fn mask_value(&self, value: &str, strategy: &MaskingStrategy) -> String {
        match strategy {
            MaskingStrategy::PartialMask => {
                if value.contains('.') {
                    // Mask IP-like values
                    let parts: Vec<&str> = value.split('.').collect();
                    if parts.len() == 4 {
                        format!("{}.***.***.{}", parts[0], parts[3])
                    } else {
                        "***".to_string()
                    }
                } else {
                    "***".to_string()
                }
            }
            MaskingStrategy::Generalization => {
                if value.contains('.') {
                    let domain_parts: Vec<&str> = value.split('.').collect();
                    if domain_parts.len() >= 2 {
                        format!("*.{}", domain_parts[1])
                    } else {
                        "*".to_string()
                    }
                } else {
                    "*".to_string()
                }
            }
            MaskingStrategy::FullMask => "***".to_string(),
        }
    }

    fn get_applied_measures(&self, intelligence: &ThreatIntelligence) -> Vec<String> {
        vec![
            "IP address masking".to_string(),
            "Domain generalization".to_string(),
            "PII removal".to_string(),
        ]
    }
}

/// Privacy rule
#[derive(Debug, Clone, Serialize, Deserialize)]
struct PrivacyRule {
    rule_id: String,
    name: String,
    applies_to: Vec<String>,
    masking_strategy: MaskingStrategy,
}

/// Masking strategy
#[derive(Debug, Clone, Serialize, Deserialize)]
enum MaskingStrategy {
    FullMask,
    PartialMask,
    Generalization,
}

/// Dissemination engine for channel selection
#[derive(Debug, Clone)]
struct DisseminationEngine {
    available_channels: Vec<DisseminationChannel>,
}

impl DisseminationEngine {
    fn new() -> Self {
        Self {
            available_channels: vec![
                DisseminationChannel {
                    channel_id: "secure_api".to_string(),
                    name: "Secure API".to_string(),
                    capabilities_required: vec!["api_access".to_string()],
                    security_level: SecurityLevel::High,
                    latency: Duration::seconds(30),
                },
                DisseminationChannel {
                    channel_id: "encrypted_email".to_string(),
                    name: "Encrypted Email".to_string(),
                    capabilities_required: vec!["email_access".to_string()],
                    security_level: SecurityLevel::High,
                    latency: Duration::minutes(5),
                },
                DisseminationChannel {
                    channel_id: "stix_taxii".to_string(),
                    name: "STIX/TAXII Feed".to_string(),
                    capabilities_required: vec!["stix_taxii".to_string()],
                    security_level: SecurityLevel::High,
                    latency: Duration::minutes(1),
                },
            ],
        }
    }

    fn select_channel(&self, partner_capabilities: &[String]) -> Result<String> {
        // Find the best channel based on partner capabilities and our preferences
        for channel in &self.available_channels {
            if channel.capabilities_required.iter().all(|cap| partner_capabilities.contains(cap)) {
                return Ok(channel.channel_id.clone());
            }
        }

        // Fallback to first available channel
        if let Some(channel) = self.available_channels.first() {
            Ok(channel.channel_id.clone())
        } else {
            Err(anyhow::anyhow!("No suitable dissemination channel available"))
        }
    }
}

/// Dissemination channel
#[derive(Debug, Clone, Serialize, Deserialize)]
struct DisseminationChannel {
    channel_id: String,
    name: String,
    capabilities_required: Vec<String>,
    security_level: SecurityLevel,
    latency: Duration,
}

/// Security level
#[derive(Debug, Clone, Serialize, Deserialize)]
enum SecurityLevel {
    Low,
    Medium,
    High,
    Critical,
}
