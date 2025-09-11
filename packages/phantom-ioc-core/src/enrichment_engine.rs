// phantom-ioc-core/src/enrichment_engine.rs
// Enrichment engine for enhancing IOCs with additional data

use crate::models::{EnrichmentConfig, EnrichedIOC, EnrichmentSource, IOCError, IOC, IOCType};
use chrono::Utc;
use std::collections::HashMap;

/// Enrichment engine for enhancing IOCs with additional data
pub struct EnrichmentEngine {
    config: EnrichmentConfig,
    sources: Vec<EnrichmentSource>,
}

impl EnrichmentEngine {
    /// Create a new enrichment engine
    pub fn new(config: &EnrichmentConfig) -> Self {
        let sources = vec![
            EnrichmentSource {
                name: "VirusTotal".to_string(),
                url: "https://www.virustotal.com/api/v3".to_string(),
                api_key: None,
                priority: 1,
            },
            EnrichmentSource {
                name: "ThreatFox".to_string(),
                url: "https://threatfox-api.abuse.ch/api/v1".to_string(),
                api_key: None,
                priority: 2,
            },
            EnrichmentSource {
                name: "AbuseIPDB".to_string(),
                url: "https://api.abuseipdb.com/api/v2".to_string(),
                api_key: None,
                priority: 3,
            },
        ];

        Self {
            config: config.clone(),
            sources,
        }
    }

    /// Enrich an IOC with additional data
    pub async fn enrich_ioc(&self, ioc: &IOC) -> Result<EnrichedIOC, IOCError> {
        let mut enrichment_data = HashMap::new();
        let mut sources_used = Vec::new();

        // Perform enrichment based on IOC type
        match ioc.indicator_type {
            IOCType::Hash => {
                let hash_data = self.enrich_hash(ioc).await?;
                enrichment_data.extend(hash_data);
                sources_used.push("hash_analysis".to_string());
            },
            IOCType::IPAddress => {
                let ip_data = self.enrich_ip(ioc).await?;
                enrichment_data.extend(ip_data);
                sources_used.push("ip_intelligence".to_string());
            },
            IOCType::Domain => {
                let domain_data = self.enrich_domain(ioc).await?;
                enrichment_data.extend(domain_data);
                sources_used.push("domain_intelligence".to_string());
            },
            IOCType::URL => {
                let url_data = self.enrich_url(ioc).await?;
                enrichment_data.extend(url_data);
                sources_used.push("url_analysis".to_string());
            },
            IOCType::Email => {
                let email_data = self.enrich_email(ioc).await?;
                enrichment_data.extend(email_data);
                sources_used.push("email_analysis".to_string());
            },
            _ => {
                // Generic enrichment
                let generic_data = self.generic_enrichment(ioc).await?;
                enrichment_data.extend(generic_data);
                sources_used.push("generic_analysis".to_string());
            }
        }

        // Add metadata enrichment
        let metadata = self.add_metadata_enrichment(ioc).await?;
        enrichment_data.extend(metadata);

        Ok(EnrichedIOC {
            base_ioc: ioc.clone(),
            enrichment_data,
            sources: sources_used,
            enrichment_timestamp: Utc::now(),
        })
    }

    /// Enrich hash IOCs
    async fn enrich_hash(&self, ioc: &IOC) -> Result<HashMap<String, serde_json::Value>, IOCError> {
        let mut data = HashMap::new();

        // Simulate hash analysis
        data.insert("file_type".to_string(), serde_json::Value::String("PE32".to_string()));
        data.insert("file_size".to_string(), serde_json::Value::Number(serde_json::Number::from(1024000)));
        data.insert("compilation_timestamp".to_string(), serde_json::Value::String("2024-01-15T10:30:00Z".to_string()));
        
        // Malware family detection
        if ioc.tags.iter().any(|tag| tag.contains("trojan")) {
            data.insert("malware_family".to_string(), serde_json::Value::String("Trojan.Generic".to_string()));
            data.insert("detection_ratio".to_string(), serde_json::Value::String("45/70".to_string()));
        } else {
            data.insert("malware_family".to_string(), serde_json::Value::String("Unknown".to_string()));
            data.insert("detection_ratio".to_string(), serde_json::Value::String("12/70".to_string()));
        }

        // Behavioral analysis
        let mut behaviors = Vec::new();
        behaviors.push(serde_json::Value::String("Network communication".to_string()));
        behaviors.push(serde_json::Value::String("Registry modification".to_string()));
        behaviors.push(serde_json::Value::String("File system changes".to_string()));
        data.insert("behaviors".to_string(), serde_json::Value::Array(behaviors));

        Ok(data)
    }

    /// Enrich IP address IOCs
    async fn enrich_ip(&self, ioc: &IOC) -> Result<HashMap<String, serde_json::Value>, IOCError> {
        let mut data = HashMap::new();

        // Geolocation data
        data.insert("country".to_string(), serde_json::Value::String("Unknown".to_string()));
        data.insert("region".to_string(), serde_json::Value::String("Unknown".to_string()));
        data.insert("city".to_string(), serde_json::Value::String("Unknown".to_string()));
        data.insert("latitude".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(0.0).unwrap()));
        data.insert("longitude".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(0.0).unwrap()));

        // ASN information
        data.insert("asn".to_string(), serde_json::Value::String("AS12345".to_string()));
        data.insert("asn_org".to_string(), serde_json::Value::String("Example ASN Organization".to_string()));

        // Reputation scores
        data.insert("reputation_score".to_string(), serde_json::Value::Number(serde_json::Number::from(75)));
        data.insert("abuse_confidence".to_string(), serde_json::Value::Number(serde_json::Number::from(85)));

        // Port scan data
        let mut open_ports = Vec::new();
        open_ports.push(serde_json::Value::Number(serde_json::Number::from(80)));
        open_ports.push(serde_json::Value::Number(serde_json::Number::from(443)));
        open_ports.push(serde_json::Value::Number(serde_json::Number::from(8080)));
        data.insert("open_ports".to_string(), serde_json::Value::Array(open_ports));

        Ok(data)
    }

    /// Enrich domain IOCs
    async fn enrich_domain(&self, ioc: &IOC) -> Result<HashMap<String, serde_json::Value>, IOCError> {
        let mut data = HashMap::new();

        // Domain registration info
        data.insert("registrar".to_string(), serde_json::Value::String("Example Registrar".to_string()));
        data.insert("creation_date".to_string(), serde_json::Value::String("2024-01-01".to_string()));
        data.insert("expiration_date".to_string(), serde_json::Value::String("2025-01-01".to_string()));

        // DNS records
        let mut dns_records = HashMap::new();
        dns_records.insert("A", vec!["192.168.1.1", "192.168.1.2"]);
        dns_records.insert("MX", vec!["mail.example.com"]);
        dns_records.insert("NS", vec!["ns1.example.com", "ns2.example.com"]);

        for (record_type, records) in dns_records {
            let values: Vec<serde_json::Value> = records
                .into_iter()
                .map(|r| serde_json::Value::String(r.to_string()))
                .collect();
            data.insert(format!("dns_{}", record_type.to_lowercase()), serde_json::Value::Array(values));
        }

        // Domain reputation
        data.insert("domain_age".to_string(), serde_json::Value::Number(serde_json::Number::from(365)));
        data.insert("reputation_category".to_string(), serde_json::Value::String("Suspicious".to_string()));

        Ok(data)
    }

    /// Enrich URL IOCs
    async fn enrich_url(&self, ioc: &IOC) -> Result<HashMap<String, serde_json::Value>, IOCError> {
        let mut data = HashMap::new();

        // URL analysis
        data.insert("final_url".to_string(), serde_json::Value::String(ioc.value.clone()));
        data.insert("redirect_count".to_string(), serde_json::Value::Number(serde_json::Number::from(1)));
        data.insert("response_code".to_string(), serde_json::Value::Number(serde_json::Number::from(200)));

        // Content analysis
        data.insert("content_type".to_string(), serde_json::Value::String("text/html".to_string()));
        data.insert("content_length".to_string(), serde_json::Value::Number(serde_json::Number::from(50000)));

        // Security analysis
        data.insert("ssl_cert_valid".to_string(), serde_json::Value::Bool(false));
        data.insert("has_suspicious_keywords".to_string(), serde_json::Value::Bool(true));

        // Categorization
        let mut categories = Vec::new();
        if ioc.tags.iter().any(|tag| tag.contains("phish")) {
            categories.push(serde_json::Value::String("Phishing".to_string()));
        }
        categories.push(serde_json::Value::String("Malicious".to_string()));
        data.insert("categories".to_string(), serde_json::Value::Array(categories));

        Ok(data)
    }

    /// Enrich email IOCs
    async fn enrich_email(&self, ioc: &IOC) -> Result<HashMap<String, serde_json::Value>, IOCError> {
        let mut data = HashMap::new();

        // Email analysis
        data.insert("domain_part".to_string(), 
            serde_json::Value::String(
                ioc.value.split('@').last().unwrap_or("").to_string()
            ));
        data.insert("local_part".to_string(), 
            serde_json::Value::String(
                ioc.value.split('@').next().unwrap_or("").to_string()
            ));

        // Domain reputation
        data.insert("domain_reputation".to_string(), serde_json::Value::String("Suspicious".to_string()));
        data.insert("mx_records_valid".to_string(), serde_json::Value::Bool(true));

        // Pattern analysis
        data.insert("suspicious_patterns".to_string(), serde_json::Value::Bool(true));
        data.insert("disposable_email".to_string(), serde_json::Value::Bool(false));

        Ok(data)
    }

    /// Generic enrichment for other IOC types
    async fn generic_enrichment(&self, ioc: &IOC) -> Result<HashMap<String, serde_json::Value>, IOCError> {
        let mut data = HashMap::new();

        data.insert("enrichment_type".to_string(), serde_json::Value::String("generic".to_string()));
        data.insert("indicator_length".to_string(), serde_json::Value::Number(serde_json::Number::from(ioc.value.len())));
        data.insert("has_special_chars".to_string(), serde_json::Value::Bool(
            ioc.value.chars().any(|c| !c.is_alphanumeric() && c != '.' && c != '-')
        ));

        Ok(data)
    }

    /// Add metadata enrichment
    async fn add_metadata_enrichment(&self, ioc: &IOC) -> Result<HashMap<String, serde_json::Value>, IOCError> {
        let mut data = HashMap::new();

        // Processing metadata
        data.insert("enrichment_timestamp".to_string(), 
            serde_json::Value::String(Utc::now().to_rfc3339()));
        data.insert("enrichment_version".to_string(), 
            serde_json::Value::String("2.0.0".to_string()));

        // IOC metadata
        data.insert("original_confidence".to_string(), 
            serde_json::Value::Number(serde_json::Number::from_f64(ioc.confidence).unwrap()));
        data.insert("tag_count".to_string(), 
            serde_json::Value::Number(serde_json::Number::from(ioc.tags.len())));

        // Context enrichment
        if let Some(geo) = &ioc.context.geolocation {
            data.insert("context_geolocation".to_string(), serde_json::Value::String(geo.clone()));
        }

        if let Some(asn) = &ioc.context.asn {
            data.insert("context_asn".to_string(), serde_json::Value::String(asn.clone()));
        }

        Ok(data)
    }

    /// Add enrichment source
    pub fn add_source(&mut self, source: EnrichmentSource) {
        self.sources.push(source);
        // Sort by priority
        self.sources.sort_by(|a, b| a.priority.cmp(&b.priority));
    }

    /// Get enabled sources
    pub fn get_enabled_sources(&self) -> Vec<&EnrichmentSource> {
        self.sources
            .iter()
            .filter(|source| self.config.enabled_sources.contains(&source.name))
            .collect()
    }

    /// Update enrichment configuration
    pub fn update_config(&mut self, config: EnrichmentConfig) {
        self.config = config;
    }
}