use napi::bindgen_prelude::*;
use napi_derive::napi;
use crate::core::CVECore;
use crate::models::{CVE, SearchCriteria};
use crate::config::Config;
use serde::de::DeserializeOwned;
use serde::Serialize;

// N-API bindings for Node.js interop
#[napi]
pub struct CVECoreNapi {
    inner: tokio::sync::Mutex<CVECore>,
    rt: tokio::runtime::Handle,
}

#[napi]
impl CVECoreNapi {
    #[napi(constructor)]
    pub fn new(config_json: String) -> Result<Self> {
        let rt = tokio::runtime::Runtime::new()
            .map_err(|e| napi::Error::from_reason(format!("Failed to create async runtime: {}", e)))?;
        
        let config: Config = Self::parse_json("Config", &config_json)?;
        let core = rt.block_on(async {
            CVECore::new(config)
        }).map_err(|e| Self::napi_err("create CVE Core", e))?;

        Ok(CVECoreNapi { 
            inner: tokio::sync::Mutex::new(core),
            rt: rt.handle().clone(),
        })
    }

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

    #[napi]
    pub fn process_cve(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let rt_handle = self.rt.clone();
        let result = rt_handle.block_on(async {
            let core = self.inner.lock().await;
            core.process_cve(cve).await
        });
        let result = Self::map_core_err("process CVE", result)?;
        Self::to_json("result", &result)
    }

    #[napi]
    pub fn batch_process_cves(&self, cves_json: String) -> Result<String> {
        let cves: Vec<CVE> = Self::parse_json("CVEs", &cves_json)?;
        let rt_handle = self.rt.clone();
        let results = rt_handle.block_on(async {
            let core = self.inner.lock().await;
            core.batch_process_cves(cves).await
        });
        let results = Self::map_core_err("batch process CVEs", results)?;
        Self::to_json("results", &results)
    }

    #[napi]
    pub fn search_vulnerabilities(&self, criteria_json: String) -> Result<String> {
        let criteria: SearchCriteria = Self::parse_json("search criteria", &criteria_json)?;
        let rt_handle = self.rt.clone();
        let results = rt_handle.block_on(async {
            let core = self.inner.lock().await;
            core.search_vulnerabilities(criteria).await
        });
        let results = Self::map_core_err("search vulnerabilities", results)?;
        Self::to_json("search results", &results)
    }

    #[napi]
    pub fn get_exploit_timeline(&self, cve_id: String) -> Result<String> {
        let rt_handle = self.rt.clone();
        let timeline = rt_handle.block_on(async {
            let core = self.inner.lock().await;
            core.get_exploit_timeline(&cve_id).await
        });
        let timeline = Self::map_core_err("get exploit timeline", timeline)?;
        Self::to_json("timeline", &timeline)
    }

    #[napi]
    pub fn get_remediation_strategy(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let rt_handle = self.rt.clone();
        let strategy = rt_handle.block_on(async {
            let core = self.inner.lock().await;
            core.get_remediation_strategy(&cve).await
        });
        let strategy = Self::map_core_err("get remediation strategy", strategy)?;
        Self::to_json("strategy", &strategy)
    }

    #[napi]
    pub fn build_advanced_assessment(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let core = self.rt.block_on(async {
            self.inner.lock().await
        });
        let assessment = Self::map_core_err("build advanced assessment", core.build_advanced_assessment(&cve))?;
        Self::to_json("assessment", &assessment)
    }

    #[napi]
    pub fn discover_related_vulnerabilities(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let core = self.rt.block_on(async {
            self.inner.lock().await
        });
        let related = Self::map_core_err("discover related vulnerabilities", core.discover_related_vulnerabilities(&cve))?;
        Self::to_json("related", &related)
    }

    #[napi]
    pub fn correlate_threat_actors(&self, cve_json: String) -> Result<String> {
        let cve: CVE = Self::parse_json("CVE", &cve_json)?;
        let core = self.rt.block_on(async {
            self.inner.lock().await
        });
        let actors = Self::map_core_err("correlate threat actors", core.correlate_threat_actors(&cve))?;
        Self::to_json("actors", &actors)
    }

    // Version and metadata
    #[napi(getter)]
    pub fn version(&self) -> String {
        env!("CARGO_PKG_VERSION").to_string()
    }

    #[napi(getter)]
    pub fn features(&self) -> Vec<String> {
        vec![
            "threat_intelligence".to_string(),
            "exploit_prediction".to_string(), 
            "remediation_engine".to_string(),
            "vulnerability_scoring".to_string(),
            "business_risk_assessment".to_string(),
            "multi_tenant_data_stores".to_string(),
            "advanced_analytics".to_string(),
            "real_time_processing".to_string(),
        ]
    }
}

// Static utility functions
#[napi]
pub fn validate_cve_format(cve_json: String) -> Result<bool> {
    match serde_json::from_str::<CVE>(&cve_json) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

#[napi] 
pub fn get_supported_cve_formats() -> Vec<String> {
    vec![
        "CVE 5.0".to_string(),
        "NVD Enhanced".to_string(),
        "MITRE CVE".to_string(),
    ]
}