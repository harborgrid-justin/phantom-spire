use chrono::Utc;
use crate::exploit_predictor::ExploitPredictor;
use crate::models::{
    CVE, CVEAnalysisResult, CVSSAttackVector, ExploitTimeline, RemediationStrategy, SearchCriteria,
    TargetProfile, VulnerabilityAssessment,
};
use crate::remediation_engine::RemediationEngine;
use crate::threat_intelligence::ThreatIntelligenceEngine;
use crate::vulnerability_scorer::VulnerabilityScorer;
use crate::config::Config;
use crate::data_stores::{DataStoreFactory, ComprehensiveCVEStore, TenantContext, DataStoreConfig};
use std::sync::Arc;

// Core processing logic with advanced threat intelligence
pub struct CVECore {
    pub(crate) threat_intel_engine: ThreatIntelligenceEngine,
    pub(crate) vulnerability_scorer: VulnerabilityScorer,
    pub(crate) exploit_predictor: ExploitPredictor,
    pub(crate) remediation_engine: RemediationEngine,
    pub(crate) data_store: Arc<dyn ComprehensiveCVEStore + Send + Sync>,
    pub(crate) tenant_context: TenantContext,
    pub(crate) config: Config,
}
impl CVECore {
    pub fn new(config: Config) -> Result<Self, String> {
        // Initialize data store from configuration or environment
        let data_store_config = config.data_store.clone().unwrap_or_else(|| DataStoreConfig::from_env());
        data_store_config.validate().map_err(|e| format!("Data store configuration error: {}", e))?;
        let data_store = Arc::new(DataStoreFactory::create_store(&data_store_config)
            .map_err(|e| format!("Failed to create data store: {}", e))?);
        
        // Create default tenant context - can be overridden per operation
        let tenant_context = TenantContext::new("default".to_string())
            .with_permissions(vec!["read".to_string(), "write".to_string()]);

        Ok(Self {
            threat_intel_engine: ThreatIntelligenceEngine::new(
                config.threat_intelligence.clone(), 
                config.actors.clone(), 
                config.threat_feeds.clone()
            ),
            vulnerability_scorer: VulnerabilityScorer::new(config.scoring.clone()),
            exploit_predictor: ExploitPredictor::new(config.exploit_prediction.clone()),
            remediation_engine: RemediationEngine::new(config.remediation.clone()),
            data_store,
            tenant_context,
            config,
        })
    }
    // Extract function: compute risk level from adjusted score
    fn compute_risk_level(&self, adjusted_score: f64) -> &'static str {
        if adjusted_score >= self.config.scoring.critical_threshold {
            "critical"
        } else if adjusted_score >= self.config.scoring.high_threshold {
            "high"
        } else if adjusted_score >= self.config.scoring.medium_threshold {
            "medium"
        } else {
            "low"
        }
    }

    // Extract function: isolate score adjustment logic
    fn adjust_score(base_score: f64, intel_boost: f64) -> f64 {
        base_score * (1.0 + intel_boost)
    }

    // Extract function: centralize CVSS attack vector mapping
    fn attack_vector_to_str(vector: CVSSAttackVector) -> &'static str {
        match vector {
            CVSSAttackVector::Network => "network",
            CVSSAttackVector::Adjacent => "adjacent",
            CVSSAttackVector::Local => "local",
            CVSSAttackVector::Physical => "physical",
        }
    }

    pub async fn process_cve(&self, cve: CVE) -> Result<CVEAnalysisResult, String> {
        // Advanced CVE processing with threat intelligence correlation
        let assessment = self.build_advanced_assessment(&cve)?;
        let related_cves = self.discover_related_vulnerabilities(&cve)?;
        let threat_actors = self.correlate_threat_actors(&cve)?;
        let campaigns = self.map_to_campaigns(&cve)?;
        
        // Store CVE in data store
        self.data_store.store_cve(&cve, &self.tenant_context)
            .await
            .map_err(|e| format!("Failed to store CVE: {}", e))?;
        
        let result = CVEAnalysisResult {
            cve,
            assessment,
            processing_timestamp: Utc::now(),
            related_cves,
            threat_actors,
            campaigns,
        };
        
        Ok(result)
    }
    pub async fn batch_process_cves(&self, cves: Vec<CVE>) -> Result<Vec<CVEAnalysisResult>, String> {
        // Process CVEs concurrently with async/await
        let mut results = Vec::new();
        
        for cve in cves {
            match self.process_cve(cve).await {
                Ok(result) => results.push(result),
                Err(e) => {
                    eprintln!("Failed to process CVE: {}", e);
                    // Continue processing other CVEs even if one fails
                }
            }
        }
        
        Ok(results)
    }
    pub async fn search_vulnerabilities(&self, criteria: SearchCriteria) -> Result<Vec<CVE>, String> {
        // Use data store for CVE search first, fallback to threat intel engine
        match self.data_store.search_cves(&criteria, &self.tenant_context).await {
            Ok(search_results) => Ok(search_results.items),
            Err(e) => {
                // Fallback to threat intelligence engine if data store search fails
                eprintln!("Data store search error: {}, falling back to threat intel engine", e);
                self.threat_intel_engine.search_with_criteria(criteria)
            }
        }
    }
    pub async fn get_exploit_timeline(&self, cve_id: &str) -> Result<ExploitTimeline, String> {
        // Try to retrieve from data store first
        match self.data_store.get_exploit(cve_id, &self.tenant_context).await {
            Ok(Some(timeline)) => Ok(timeline),
            Ok(None) => {
                // Generate new timeline if not found
                let timeline = self.exploit_predictor.generate_timeline(cve_id)?;
                
                // Store the generated timeline
                self.data_store.store_exploit(&timeline, &self.tenant_context)
                    .await
                    .map_err(|e| format!("Failed to store exploit timeline: {}", e))?;
                
                Ok(timeline)
            }
            Err(e) => {
                // Fallback to generating timeline if data store error
                eprintln!("Data store error retrieving exploit timeline: {}", e);
                self.exploit_predictor.generate_timeline(cve_id)
            }
        }
    }
    pub async fn get_remediation_strategy(&self, cve: &CVE) -> Result<RemediationStrategy, String> {
        // Try to retrieve from data store first
        match self.data_store.get_remediation(cve.id(), &self.tenant_context).await {
            Ok(Some(strategy)) => Ok(strategy),
            Ok(None) => {
                // Generate new strategy if not found
                let strategy = self.remediation_engine.generate_strategy(cve)?;
                
                // Store the generated strategy
                self.data_store.store_remediation(&strategy, &self.tenant_context)
                    .await
                    .map_err(|e| format!("Failed to store remediation strategy: {}", e))?;
                
                Ok(strategy)
            }
            Err(e) => {
                // Fallback to generating strategy if data store error
                eprintln!("Data store error retrieving remediation strategy: {}", e);
                self.remediation_engine.generate_strategy(cve)
            }
        }
    }
    // Renamed for clarity: generate_advanced_assessment -> build_advanced_assessment
    pub fn build_advanced_assessment(&self, cve: &CVE) -> Result<VulnerabilityAssessment, String> {
        let base_score = cve.cvss_metrics().as_ref().map(|m| m.base_score).unwrap_or(5.0);
        // Advanced scoring with multiple factors
        let exploitability = self.vulnerability_scorer.calculate_exploitability(cve)?;
        let impact_score = self.vulnerability_scorer.calculate_impact(cve)?;
        let threat_intel_boost = self.threat_intel_engine.get_intelligence_boost(cve)?;
        let adjusted_score = Self::adjust_score(base_score, threat_intel_boost);
        let risk_level = self.compute_risk_level(adjusted_score);
        let affected_systems = self.identify_affected_systems(cve)?;
        let exploit_status = self.exploit_predictor.assess_exploit_status(cve)?;
        let recommendations = self.generate_contextual_recommendations(cve)?;
        let mitigation_steps = self.remediation_engine.get_immediate_mitigations(cve)?;
        Ok(VulnerabilityAssessment {
            exploitability,
            impact_score,
            risk_level: risk_level.to_string(),
            affected_systems,
            remediation_priority: self.calculate_remediation_priority(adjusted_score, exploitability),
            exploit_available: exploit_status.exploit_available,
            public_exploits: exploit_status.public_exploits,
            in_the_wild: exploit_status.in_the_wild,
            recommendations,
            mitigation_steps,
        })
    }
    pub fn discover_related_vulnerabilities(&self, cve: &CVE) -> Result<Vec<String>, String> {
        let mut related = Vec::new();
        // Find vulnerabilities in same product family
        for product in &cve.affected_products() {
            let product_vulns = self
                .threat_intel_engine
                .find_product_vulnerabilities(&product.vendor, &product.product)?;
            related.extend(product_vulns);
        }
        // Find vulnerabilities with similar attack vectors
        if let Some(cvss) = &cve.cvss_metrics() {
            let attack_vector_str = Self::attack_vector_to_str(cvss.attack_vector.clone());
            let similar_vulns = self
                .threat_intel_engine
                .find_similar_attack_patterns(attack_vector_str)?;
            related.extend(similar_vulns);
        }
        // Find vulnerabilities exploited by same threat actors
        let actor_vulns = self
            .threat_intel_engine
            .find_actor_preferred_vulnerabilities(cve.id())?;
        related.extend(actor_vulns);
        Ok(related.into_iter().take(10).collect())
    }
    pub fn correlate_threat_actors(&self, cve: &CVE) -> Result<Vec<String>, String> {
        let mut actors = Vec::new();
        // Advanced threat actor correlation based on:
        // 1. Exploit availability and timeline
        // 2. Target profile matching
        // 3. Attack technique similarity
        // 4. Historical exploitation patterns
        let exploit_timeline = self.exploit_predictor.get_basic_timeline(cve.id())?;
        let target_profile = self.analyze_target_profile(cve)?;
        if exploit_timeline.has_public_exploits {
            actors.extend(self.threat_intel_engine.get_opportunistic_actors()?);
        }
        if target_profile.high_value_targets {
            actors.extend(self.threat_intel_engine.get_apt_actors()?);
        }
        if let Some(cvss) = &cve.cvss_metrics() {
            if cvss.base_score >= 7.0 {
                actors.extend(self.threat_intel_engine.get_sophisticated_actors()?);
            }
        }
        Ok(actors.into_iter().take(5).collect())
    }
    pub fn map_to_campaigns(&self, cve: &CVE) -> Result<Vec<String>, String> {
        let mut campaigns = Vec::new();
        // Map vulnerabilities to known threat campaigns
        let vulnerability_type = self.classify_vulnerability_type(cve)?;
        campaigns.extend(
            self.threat_intel_engine
                .get_campaigns_by_vuln_type(&vulnerability_type)?,
        );
        // Check for zero-day usage in campaigns
        if self.exploit_predictor.is_likely_zero_day(cve.id())? {
            campaigns.extend(self.threat_intel_engine.get_zero_day_campaigns()?);
        }
        // Check for supply chain implications
        if self.is_supply_chain_vulnerability(cve)? {
            campaigns.extend(self.threat_intel_engine.get_supply_chain_campaigns()?);
        }
        Ok(campaigns.into_iter().take(3).collect())
    }
    fn calculate_remediation_priority(&self, score: f64, exploitability: f64) -> u32 {
        let base_priority = (score * 10.0) as u32;
        let exploit_factor = (exploitability * 50.0) as u32;
        // Safer arithmetic with clamping
        base_priority
            .saturating_add(exploit_factor)
            .min(100)
    }


    pub fn identify_affected_systems(&self, cve: &CVE) -> Result<Vec<String>, String> {
        let mut systems = Vec::new();

        for product in &cve.affected_products() {
            match product.product.to_lowercase().as_str() {
                s if s.contains("windows") => systems.push("Windows Servers".to_string()),
                s if s.contains("linux") => systems.push("Linux Servers".to_string()),
                s if s.contains("apache") => systems.push("Web Servers".to_string()),
                s if s.contains("mysql") || s.contains("postgresql") => systems.push("Database Servers".to_string()),
                s if s.contains("exchange") => systems.push("Email Servers".to_string()),
                s if s.contains("cisco") => systems.push("Network Infrastructure".to_string()),
                _ => systems.push("Application Servers".to_string()),
            }
        }

        if systems.is_empty() {
            systems.push("General Systems".to_string());
        }

        Ok(systems)
    }

    pub fn generate_contextual_recommendations(&self, cve: &CVE) -> Result<Vec<String>, String> {
        let mut recommendations = Vec::new();

        let base_score = cve.cvss_metrics().as_ref().map(|m| m.base_score).unwrap_or(5.0);

        if base_score >= 9.0 {
            recommendations.push("CRITICAL: Apply emergency patches immediately".to_string());
            recommendations.push("Implement temporary workarounds if patches unavailable".to_string());
            recommendations.push("Consider system isolation until patched".to_string());
        } else if base_score >= 7.0 {
            recommendations.push("Apply vendor patches within 24-48 hours".to_string());
            recommendations.push("Increase monitoring for exploitation attempts".to_string());
        } else {
            recommendations.push("Apply patches during next maintenance window".to_string());
            recommendations.push("Review and update security configurations".to_string());
        }

        recommendations.push("Implement defense-in-depth measures".to_string());
        recommendations.push("Update threat hunting signatures".to_string());
        recommendations.push("Brief security team on new threat vectors".to_string());

        Ok(recommendations)
    }

    pub fn analyze_target_profile(&self, cve: &CVE) -> Result<TargetProfile, String> {
        let mut high_value = false;
        let mut widespread = false;

        for product in &cve.affected_products() {
            match product.product.to_lowercase().as_str() {
                s if s.contains("windows") || s.contains("office") => {
                    widespread = true;
                    high_value = true;
                }
                s if s.contains("exchange") || s.contains("sharepoint") => {
                    high_value = true;
                }
                s if s.contains("apache") || s.contains("nginx") => {
                    widespread = true;
                }
                _ => {}
            }
        }

        Ok(TargetProfile { high_value_targets: high_value, widespread_deployment: widespread })
    }

    pub fn classify_vulnerability_type(&self, cve: &CVE) -> Result<String, String> {
        let desc = cve.description().to_lowercase();

        if desc.contains("remote code execution") || desc.contains("rce") {
            Ok("remote_code_execution".to_string())
        } else if desc.contains("privilege escalation") {
            Ok("privilege_escalation".to_string())
        } else if desc.contains("denial of service") || desc.contains("dos") {
            Ok("denial_of_service".to_string())
        } else if desc.contains("information disclosure") {
            Ok("information_disclosure".to_string())
        } else if desc.contains("sql injection") {
            Ok("injection".to_string())
        } else if desc.contains("cross-site scripting") || desc.contains("xss") {
            Ok("xss".to_string())
        } else {
            Ok("other".to_string())
        }
    }

    pub fn is_supply_chain_vulnerability(&self, cve: &CVE) -> Result<bool, String> {
        for product in &cve.affected_products() {
            let product_lower = product.product.to_lowercase();
            if product_lower.contains("library")
                || product_lower.contains("framework")
                || product_lower.contains("sdk")
                || product_lower.contains("component")
            {
                return Ok(true);
            }
        }
        Ok(false)
    }

    #[allow(dead_code)]
    fn random(&self) -> u32 {
        // Simple random number generator
        static mut SEED: u64 = 12345;
        unsafe {
            SEED = SEED.wrapping_mul(1103515245).wrapping_add(12345);
            (SEED % u32::MAX as u64) as u32
        }
    }
}
