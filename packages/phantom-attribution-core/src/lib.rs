// phantom-attribution-core/src/lib.rs
// Threat attribution and actor profiling library

#[cfg(feature = "napi")]
use napi::bindgen_prelude::*;
#[cfg(feature = "napi")]
use napi_derive::napi;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::Utc;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[cfg_attr(feature = "napi", napi(object))]
pub struct ThreatActor {
    pub id: String,
    pub name: String,
    pub aliases: Vec<String>,
    pub origin: String,
    pub motivation: Vec<String>,
    pub capabilities: Vec<String>,
    pub ttps: Vec<String>,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[cfg_attr(feature = "napi", napi(object))]
pub struct Attribution {
    pub indicator: String,
    pub actor_matches: Vec<ActorMatch>,
    pub confidence_score: f64,
    pub analysis_date: String, // Use String for NAPI compatibility
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[cfg_attr(feature = "napi", napi(object))]
pub struct ActorMatch {
    pub actor_id: String,
    pub match_score: f64,
    pub matching_indicators: Vec<String>,
}

pub struct AttributionCore {
    actors: HashMap<String, ThreatActor>,
}

impl AttributionCore {
    pub fn new() -> Result<Self, String> {
        let mut actors = HashMap::new();
        
        actors.insert("apt29".to_string(), ThreatActor {
            id: "apt29".to_string(),
            name: "APT29".to_string(),
            aliases: vec!["Cozy Bear".to_string(), "The Dukes".to_string()],
            origin: "Russia".to_string(),
            motivation: vec!["espionage".to_string(), "intelligence".to_string()],
            capabilities: vec!["advanced_malware".to_string(), "social_engineering".to_string()],
            ttps: vec!["spear_phishing".to_string(), "watering_hole".to_string()],
            confidence: 0.9,
        });

        Ok(Self { actors })
    }

    pub fn analyze_attribution(&self, indicators: Vec<String>) -> Result<Attribution, String> {
        let mut actor_matches = Vec::new();
        
        for (actor_id, actor) in &self.actors {
            let mut matching_indicators = Vec::new();
            for indicator in &indicators {
                if actor.ttps.iter().any(|ttp| ttp.contains(indicator)) {
                    matching_indicators.push(indicator.clone());
                }
            }
            
            if !matching_indicators.is_empty() {
                let match_score = matching_indicators.len() as f64 / indicators.len() as f64;
                actor_matches.push(ActorMatch {
                    actor_id: actor_id.clone(),
                    match_score,
                    matching_indicators,
                });
            }
        }

        let confidence_score = if actor_matches.is_empty() { 0.0 } else {
            actor_matches.iter().map(|m| m.match_score).fold(0.0, f64::max)
        };

        Ok(Attribution {
            indicator: indicators.join(","),
            actor_matches,
            confidence_score,
            analysis_date: Utc::now().to_rfc3339(),
        })
    }
}

#[cfg(feature = "napi")]
#[napi]
pub struct AttributionCoreNapi {
    inner: AttributionCore,
}

#[cfg(feature = "napi")]
#[napi]
impl AttributionCoreNapi {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        let core = AttributionCore::new()
            .map_err(|e| napi::Error::from_reason(format!("Failed to create Attribution Core: {}", e)))?;
        Ok(AttributionCoreNapi { inner: core })
    }

    #[napi]
    pub fn analyze_attribution(&self, indicators: Vec<String>) -> Result<Attribution> {
        self.inner.analyze_attribution(indicators)
            .map_err(|e| napi::Error::from_reason(format!("Failed to analyze attribution: {}", e)))
    }

    #[napi]
    pub fn analyze_attribution_json(&self, indicators: Vec<String>) -> Result<String> {
        let attribution = self.inner.analyze_attribution(indicators)
            .map_err(|e| napi::Error::from_reason(format!("Failed to analyze attribution: {}", e)))?;

        serde_json::to_string(&attribution)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize attribution: {}", e)))
    }

    #[napi]
    pub fn get_threat_actors(&self) -> Result<Vec<ThreatActor>> {
        Ok(self.inner.actors.values().cloned().collect())
    }

    #[napi]
    pub fn get_health_status(&self) -> Result<String> {
        let status = serde_json::json!({
            "status": "healthy",
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "version": env!("CARGO_PKG_VERSION"),
            "actor_count": self.inner.actors.len()
        });

        serde_json::to_string(&status)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize health status: {}", e)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_attribution_core_creation() {
        let core = AttributionCore::new();
        assert!(core.is_ok());
    }
}
