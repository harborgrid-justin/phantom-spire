// phantom-ioc-core/src/threat_intelligence.rs
// Threat intelligence engine for IOC processing

use crate::models::*;
use crate::models::{EnrichmentConfig, Intelligence, EnrichedIOC, IOCError, IOC};
use chrono::Utc;
use uuid::Uuid;

/// Threat intelligence engine
pub struct ThreatIntelligenceEngine {
    config: EnrichmentConfig,
    intel_sources: Vec<String>,
}

impl ThreatIntelligenceEngine {
    /// Create a new threat intelligence engine
    pub fn new(config: &EnrichmentConfig) -> Self {
        Self {
            config: config.clone(),
            intel_sources: vec![
                "virustotal".to_string(),
                "threatfox".to_string(),
                "alienvault".to_string(),
                "mandiant".to_string(),
                "crowdstrike".to_string(),
                "recorded_future".to_string(),
            ],
        }
    }

    /// Get threat intelligence for an IOC
    pub async fn get_intelligence(&self, ioc: &IOC) -> Result<Intelligence, IOCError> {
        // Simulate threat intelligence gathering
        let confidence = self.calculate_confidence(ioc);
        let sources = self.get_applicable_sources(&ioc.indicator_type);
        let related_threats = self.find_related_threats(ioc).await;

        Ok(Intelligence {
            sources,
            confidence,
            last_updated: Utc::now(),
            related_threats,
        })
    }

    /// Calculate confidence based on IOC characteristics
    fn calculate_confidence(&self, ioc: &IOC) -> f64 {
        let mut confidence: f64 = 0.5; // Base confidence

        // Adjust based on IOC type
        match ioc.indicator_type {
            IOCType::Hash => confidence += 0.3,
            IOCType::IPAddress => confidence += 0.2,
            IOCType::Domain => confidence += 0.15,
            IOCType::URL => confidence += 0.1,
            _ => confidence += 0.05,
        }

        // Adjust based on source reputation
        if ioc.source.contains("premium") || ioc.source.contains("commercial") {
            confidence += 0.2;
        }

        // Adjust based on severity
        match ioc.severity {
            Severity::Critical => confidence += 0.15,
            Severity::High => confidence += 0.1,
            Severity::Medium => confidence += 0.05,
            Severity::Low => {},
        }

        confidence.min(1.0)
    }

    /// Get applicable intelligence sources for an IOC type
    fn get_applicable_sources(&self, ioc_type: &IOCType) -> Vec<String> {
        match ioc_type {
            IOCType::Hash => vec![
                "virustotal".to_string(),
                "hybrid_analysis".to_string(),
                "malware_bazaar".to_string(),
            ],
            IOCType::IPAddress => vec![
                "virustotal".to_string(),
                "abuseipdb".to_string(),
                "threatfox".to_string(),
            ],
            IOCType::Domain => vec![
                "virustotal".to_string(),
                "urlvoid".to_string(),
                "threatfox".to_string(),
            ],
            IOCType::URL => vec![
                "virustotal".to_string(),
                "urlvoid".to_string(),
                "phishtank".to_string(),
            ],
            _ => vec!["generic_intel".to_string()],
        }
    }

    /// Find related threats for an IOC
    async fn find_related_threats(&self, ioc: &IOC) -> Vec<String> {
        // Simulate finding related threats
        let mut threats = Vec::new();

        // Common threat patterns based on IOC characteristics
        if ioc.value.contains("malware") || ioc.tags.iter().any(|tag| tag.contains("malware")) {
            threats.push("Malware Campaign XYZ".to_string());
            threats.push("Banking Trojan".to_string());
        }

        if ioc.value.contains("phish") || ioc.tags.iter().any(|tag| tag.contains("phish")) {
            threats.push("Phishing Campaign ABC".to_string());
            threats.push("Credential Harvesting".to_string());
        }

        if matches!(ioc.severity, Severity::Critical | Severity::High) {
            threats.push("APT Campaign".to_string());
            threats.push("Advanced Persistent Threat".to_string());
        }

        threats
    }

    /// Enrich IOC with additional intelligence data
    pub async fn enrich_ioc(&self, ioc: &IOC) -> Result<EnrichedIOC, IOCError> {
        let mut enrichment_data = std::collections::HashMap::new();

        // Add intelligence metadata
        enrichment_data.insert("intel_confidence".to_string(), 
            serde_json::Value::Number(serde_json::Number::from_f64(self.calculate_confidence(ioc)).unwrap()));
        
        enrichment_data.insert("intel_sources".to_string(), 
            serde_json::Value::Array(
                self.get_applicable_sources(&ioc.indicator_type)
                    .into_iter()
                    .map(|s| serde_json::Value::String(s))
                    .collect()
            ));

        // Add threat actor information
        let threat_actors = self.get_associated_threat_actors(ioc).await;
        enrichment_data.insert("threat_actors".to_string(),
            serde_json::Value::Array(
                threat_actors.into_iter()
                    .map(|ta| serde_json::Value::String(ta))
                    .collect()
            ));

        // Add campaign information
        let campaigns = self.get_associated_campaigns(ioc).await;
        enrichment_data.insert("campaigns".to_string(),
            serde_json::Value::Array(
                campaigns.into_iter()
                    .map(|c| serde_json::Value::String(c))
                    .collect()
            ));

        Ok(EnrichedIOC {
            base_ioc: ioc.clone(),
            enrichment_data,
            sources: self.get_applicable_sources(&ioc.indicator_type),
            enrichment_timestamp: Utc::now(),
        })
    }

    /// Get associated threat actors
    async fn get_associated_threat_actors(&self, ioc: &IOC) -> Vec<String> {
        // Simulate threat actor attribution
        match ioc.severity {
            Severity::Critical => vec!["APT29".to_string(), "Lazarus Group".to_string()],
            Severity::High => vec!["FIN7".to_string(), "Carbanak".to_string()],
            Severity::Medium => vec!["TA505".to_string()],
            Severity::Low => vec![],
        }
    }

    /// Get associated campaigns
    async fn get_associated_campaigns(&self, ioc: &IOC) -> Vec<String> {
        // Simulate campaign association
        if ioc.tags.iter().any(|tag| tag.contains("banking")) {
            vec!["Banking Malware Campaign 2024".to_string()]
        } else if ioc.tags.iter().any(|tag| tag.contains("ransomware")) {
            vec!["Ransomware Campaign Q1 2024".to_string()]
        } else {
            vec!["Generic Threat Campaign".to_string()]
        }
    }

    /// Update intelligence sources
    pub fn update_sources(&mut self, sources: Vec<String>) {
        self.intel_sources = sources;
    }

    /// Get current intelligence sources
    pub fn get_sources(&self) -> &Vec<String> {
        &self.intel_sources
    }

    /// Check if a source is enabled
    pub fn is_source_enabled(&self, source: &str) -> bool {
        self.config.enabled_sources.contains(&source.to_string())
    }
}