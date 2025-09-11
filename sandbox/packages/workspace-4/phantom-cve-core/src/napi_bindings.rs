use napi::bindgen_prelude::*;
use napi_derive::napi;
use crate::core::CVECore;
use crate::models::{CVE, SearchCriteria};
use crate::config::Config;
use chrono::Utc;
use serde::de::DeserializeOwned;
use serde::Serialize;
// N-API bindings for Node.js interop
#[napi]
pub struct CVECoreNapi {
    inner: CVECore,
}
#[napi]
impl CVECoreNapi {
    // Small utility helpers to reduce repetitive error handling/serde noise
    fn napi_err(ctx: &str, e: impl std::fmt::Display) -> napi::Error {
        napi::Error::from_reason(format!("{}: {}", ctx, e))
    }

    fn parse_json<T: DeserializeOwned>(ctx: &str, json: &str) -> Result<T> {
        serde_json::from_str::<T>(json).map_err(|e| Self::napi_err(&format!("Failed to parse {}", ctx), e))
    }

    fn to_json<T: Serialize>(ctx: &str, value: &T) -> Result<String> {
        serde_json::to_string(value).map_err(|e| Self::napi_err(&format!("Failed to serialize {}", ctx), e))
    }

    fn map_core_err<T>(ctx: &str, res: std::result::Result<T, String>) -> Result<T> {
        res.map_err(|e| Self::napi_err(&format!("Failed to {}", ctx), e))
    }

    #[napi(constructor)]
    pub fn new(config_path: Option<String>) -> Result<Self> {
        // Load configuration from specified path or use default
        let config = if let Some(path) = config_path {
            Config::load_with_default(path)
        } else {
            // Try to load from user's config file, fallback to default
            Config::load_with_default("phantom-cve-config.toml")
        };
        let core = Self::map_core_err("create CVE Core", CVECore::new(config))?;
        Ok(CVECoreNapi { inner: core })
    }

    #[napi(factory)]
    pub fn with_config_string(config_toml: String) -> Result<Self> {
        let config = Config::load_from_string(&config_toml)
            .map_err(|e| Self::napi_err("parse config", e))?;
        let core = Self::map_core_err("create CVE Core", CVECore::new(config))?;
        Ok(CVECoreNapi { inner: core })
    }
    #[napi]
    pub fn process_cve(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let result = Self::map_core_err("process CVE", self.inner.process_cve(cve))?;
        Self::to_json("result", &result)
    }
    #[napi]
    pub fn batch_process_cves(&self, cves_json: String) -> Result<String> {
        let cves: Vec<CVE> = Self::parse_json("CVEs", &cves_json)?;
        let results = Self::map_core_err("batch process CVEs", self.inner.batch_process_cves(cves))?;
        Self::to_json("results", &results)
    }
    #[napi]
    pub fn search_vulnerabilities(&self, criteria_json: String) -> Result<String> {
        let criteria: SearchCriteria = Self::parse_json("search criteria", &criteria_json)?;
        let results = Self::map_core_err("search vulnerabilities", self.inner.search_vulnerabilities(criteria))?;
        Self::to_json("search results", &results)
    }
    #[napi]
    pub fn get_exploit_timeline(&self, cve_id: String) -> Result<String> {
        let timeline = Self::map_core_err("get exploit timeline", self.inner.get_exploit_timeline(&cve_id))?;
        Self::to_json("timeline", &timeline)
    }
    #[napi]
    pub fn get_remediation_strategy(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let strategy = Self::map_core_err("get remediation strategy", self.inner.get_remediation_strategy(&cve))?;
        Self::to_json("strategy", &strategy)
    }
    #[napi]
    pub fn get_health_status(&self) -> Result<String> {
        // Simple health check
        let status = serde_json::json!({
            "status": "healthy",
            "timestamp": Utc::now().to_rfc3339(),
            "version": env!("CARGO_PKG_VERSION")
        });
        Self::to_json("health status", &status)
    }

    #[napi]
    pub fn build_advanced_assessment(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let assessment = Self::map_core_err("build advanced assessment", self.inner.build_advanced_assessment(&cve))?;
        Self::to_json("vulnerability assessment", &assessment)
    }

    #[napi]
    pub fn discover_related_vulnerabilities(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let related = Self::map_core_err("discover related vulnerabilities", self.inner.discover_related_vulnerabilities(&cve))?;
        Self::to_json("related vulnerabilities", &related)
    }

    #[napi]
    pub fn correlate_threat_actors(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let actors = Self::map_core_err("correlate threat actors", self.inner.correlate_threat_actors(&cve))?;
        Self::to_json("threat actors", &actors)
    }

    #[napi]
    pub fn map_to_campaigns(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let campaigns = Self::map_core_err("map to campaigns", self.inner.map_to_campaigns(&cve))?;
        Self::to_json("campaigns", &campaigns)
    }

    #[napi]
    pub fn identify_affected_systems(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let systems = Self::map_core_err("identify affected systems", self.inner.identify_affected_systems(&cve))?;
        Self::to_json("affected systems", &systems)
    }

    #[napi]
    pub fn generate_contextual_recommendations(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let recommendations = Self::map_core_err("generate contextual recommendations", self.inner.generate_contextual_recommendations(&cve))?;
        Self::to_json("recommendations", &recommendations)
    }

    #[napi]
    pub fn analyze_target_profile(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let profile = Self::map_core_err("analyze target profile", self.inner.analyze_target_profile(&cve))?;
        Self::to_json("target profile", &profile)
    }

    #[napi]
    pub fn classify_vulnerability_type(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let classification = Self::map_core_err("classify vulnerability type", self.inner.classify_vulnerability_type(&cve))?;
        Self::to_json("vulnerability type", &classification)
    }

    #[napi]
    pub fn is_supply_chain_vulnerability(&self, cve_json: String) -> Result<bool> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        Self::map_core_err("check supply chain vulnerability", self.inner.is_supply_chain_vulnerability(&cve))
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;
    #[test]
    fn test_cve_core_creation() {
        let config = Config::default();
        let core = CVECore::new(config);
        assert!(core.is_ok());
    }
    #[test]
    fn test_cve_processing() {
        let config = Config::default();
        let core = CVECore::new(config).unwrap();
        let test_cve = CVE {
            data_type: "CVE_RECORD".to_string(),
            data_version: "5.0".to_string(),
            cve_metadata: crate::models::CVEMetadata {
                cve_id: "CVE-2024-12345".to_string(),
                assigner_org_id: "test-org".to_string(),
                assigner_short_name: Some("TEST".to_string()),
                date_published: Some(Utc::now()),
                date_reserved: None,
                date_updated: Some(Utc::now()),
                state: crate::models::CVEState::Published,
                requester_user_id: None,
            },
            containers: crate::models::CVEContainers {
                cna: Some(crate::models::CVEContainer {
                    provider_metadata: crate::models::ProviderMetadata {
                        org_id: "test-org".to_string(),
                        short_name: Some("TEST".to_string()),
                        date_updated: Some(Utc::now()),
                    },
                    descriptions: vec![crate::models::CVEDescription {
                        lang: "en".to_string(),
                        value: "Test vulnerability".to_string(),
                        supporting_media: None,
                    }],
                    affected: Some(vec![crate::models::CVEAffected {
                        vendor: "Test Vendor".to_string(),
                        product: "Test Product".to_string(),
                        collection_url: None,
                        package_name: None,
                        cpes: None,
                        modules: None,
                        program_files: None,
                        program_routines: None,
                        platforms: None,
                        repository: None,
                        default_status: Some(crate::models::AffectedStatus::Affected),
                        versions: Some(vec![crate::models::AffectedVersion {
                            version: "1.0.0".to_string(),
                            status: crate::models::AffectedStatus::Affected,
                            version_type: None,
                            less_than: None,
                            less_than_or_equal: None,
                            changes: None,
                        }]),
                    }]),
                    references: None,
                    metrics: None,
                    problem_types: None,
                    credits: None,
                    impacts: None,
                    workarounds: None,
                    solutions: None,
                    exploits: None,
                    timeline: None,
                    date_public: None,
                    source: None,
                    tags: None,
                }),
                adp: None,
            },
        };
        let result = core.process_cve(test_cve);
        assert!(result.is_ok());
    }
}
