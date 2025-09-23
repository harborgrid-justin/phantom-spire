//! Integration Module
//!
//! Enterprise integrations for CVE processing system including monitoring,
//! messaging, caching, security, and external service integrations

#[cfg(feature = "monitoring")]
pub mod monitoring;

#[cfg(feature = "messaging")]
pub mod messaging;

#[cfg(feature = "caching")]
pub mod caching;

#[cfg(feature = "crypto")]
pub mod security;

#[cfg(feature = "notifications")]
pub mod notifications;

#[cfg(feature = "rate-limiting")]
pub mod rate_limiting;

#[cfg(feature = "job-queues")]
pub mod job_queues;

pub mod vulnerability_feeds;
pub mod asset_management;
pub mod threat_intelligence_feeds;

// Re-export commonly used integration types
#[cfg(feature = "monitoring")]
pub use monitoring::*;

#[cfg(feature = "messaging")]
pub use messaging::*;

#[cfg(feature = "caching")]
pub use caching::*;

#[cfg(feature = "crypto")]
pub use security::*;

#[cfg(feature = "notifications")]
pub use notifications::*;

pub use vulnerability_feeds::*;
pub use asset_management::*;
pub use threat_intelligence_feeds::*;

/// Integration health status
#[derive(Debug, Clone)]
pub enum IntegrationStatus {
    Healthy,
    Degraded,
    Unhealthy,
    Unknown,
}

/// Integration health check result
#[derive(Debug, Clone)]
pub struct HealthCheck {
    pub service_name: String,
    pub status: IntegrationStatus,
    pub response_time_ms: u64,
    pub last_check: chrono::DateTime<chrono::Utc>,
    pub error_message: Option<String>,
}

/// Integration manager for coordinating all external integrations
pub struct IntegrationManager {
    health_checks: std::collections::HashMap<String, HealthCheck>,
}

impl IntegrationManager {
    pub fn new() -> Self {
        Self {
            health_checks: std::collections::HashMap::new(),
        }
    }
    
    pub async fn perform_health_checks(&mut self) -> Result<Vec<HealthCheck>, String> {
        let mut results = Vec::new();
        
        // Perform health checks for all configured integrations
        #[cfg(feature = "monitoring")]
        {
            if let Ok(check) = monitoring::health_check().await {
                self.health_checks.insert("monitoring".to_string(), check.clone());
                results.push(check);
            }
        }
        
        #[cfg(feature = "messaging")]
        {
            if let Ok(check) = messaging::health_check().await {
                self.health_checks.insert("messaging".to_string(), check.clone());
                results.push(check);
            }
        }
        
        #[cfg(feature = "caching")]
        {
            if let Ok(check) = caching::health_check().await {
                self.health_checks.insert("caching".to_string(), check.clone());
                results.push(check);
            }
        }
        
        Ok(results)
    }
    
    pub fn get_integration_status(&self, service: &str) -> Option<&HealthCheck> {
        self.health_checks.get(service)
    }
    
    pub fn get_overall_health(&self) -> IntegrationStatus {
        if self.health_checks.is_empty() {
            return IntegrationStatus::Unknown;
        }
        
        let unhealthy_count = self.health_checks.values()
            .filter(|check| matches!(check.status, IntegrationStatus::Unhealthy))
            .count();
            
        let degraded_count = self.health_checks.values()
            .filter(|check| matches!(check.status, IntegrationStatus::Degraded))
            .count();
        
        if unhealthy_count > 0 {
            IntegrationStatus::Unhealthy
        } else if degraded_count > 0 {
            IntegrationStatus::Degraded
        } else {
            IntegrationStatus::Healthy
        }
    }
}

impl Default for IntegrationManager {
    fn default() -> Self {
        Self::new()
    }
}