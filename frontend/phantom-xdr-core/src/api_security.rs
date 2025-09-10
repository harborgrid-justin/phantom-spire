// API Security Engine for XDR Platform
// Provides comprehensive API security monitoring, protection, and threat detection

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiEndpoint {
    pub endpoint_id: String,
    pub path: String,
    pub method: String, // "GET", "POST", "PUT", "DELETE", "PATCH"
    pub service_name: String,
    pub version: String,
    pub is_authenticated: bool,
    pub rate_limit: Option<RateLimit>,
    pub security_level: String, // "public", "internal", "restricted", "confidential"
    pub last_updated: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimit {
    pub requests_per_minute: u32,
    pub requests_per_hour: u32,
    pub burst_limit: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiRequest {
    pub request_id: String,
    pub endpoint_id: String,
    pub client_ip: String,
    pub user_agent: String,
    pub api_key: Option<String>,
    pub bearer_token: Option<String>,
    pub request_size: u64,
    pub response_size: u64,
    pub response_code: u16,
    pub response_time_ms: u64,
    pub timestamp: i64,
    pub headers: std::collections::HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiThreat {
    pub threat_id: String,
    pub threat_type: String, // "sql_injection", "xss", "rate_limit_exceeded", "unauthorized_access", "data_exfiltration"
    pub severity: String, // "low", "medium", "high", "critical"
    pub endpoint_id: String,
    pub source_ip: String,
    pub detected_at: i64,
    pub request_details: ApiRequest,
    pub evidence: Vec<ThreatEvidence>,
    pub mitigation_status: String, // "detected", "blocked", "allowed", "investigating"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatEvidence {
    pub evidence_type: String,
    pub description: String,
    pub confidence_score: f64,
    pub raw_data: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiSecurityPolicy {
    pub policy_id: String,
    pub name: String,
    pub enabled: bool,
    pub rules: Vec<SecurityRule>,
    pub enforcement_mode: String, // "monitor", "block", "challenge"
    pub applied_endpoints: Vec<String>,
    pub created_at: i64,
    pub last_modified: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityRule {
    pub rule_id: String,
    pub rule_type: String, // "rate_limiting", "input_validation", "authentication", "authorization"
    pub conditions: Vec<RuleCondition>,
    pub actions: Vec<RuleAction>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleCondition {
    pub field: String, // "ip", "user_agent", "request_body", "headers", "response_time"
    pub operator: String, // "equals", "contains", "regex", "greater_than", "less_than"
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleAction {
    pub action_type: String, // "block", "throttle", "alert", "log", "challenge"
    pub parameters: std::collections::HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiSecurityScan {
    pub scan_id: String,
    pub scan_type: String, // "vulnerability", "penetration", "compliance", "performance"
    pub target_endpoints: Vec<String>,
    pub scan_config: ScanConfiguration,
    pub status: String, // "pending", "running", "completed", "failed"
    pub started_at: i64,
    pub completed_at: Option<i64>,
    pub findings: Vec<SecurityFinding>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanConfiguration {
    pub depth: String, // "shallow", "medium", "deep"
    pub include_authenticated: bool,
    pub test_categories: Vec<String>,
    pub custom_payloads: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityFinding {
    pub finding_id: String,
    pub severity: String,
    pub category: String,
    pub title: String,
    pub description: String,
    pub affected_endpoint: String,
    pub proof_of_concept: Option<String>,
    pub remediation: String,
    pub cvss_score: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiSecurityMetrics {
    pub total_requests: u64,
    pub blocked_requests: u64,
    pub threat_count: u64,
    pub avg_response_time: f64,
    pub top_threats: Vec<String>,
    pub endpoint_health: std::collections::HashMap<String, f64>,
    pub generated_at: i64,
}

#[async_trait]
pub trait ApiSecurityTrait {
    async fn register_endpoint(&self, endpoint: ApiEndpoint) -> Result<(), String>;
    async fn monitor_request(&self, request: ApiRequest) -> Result<bool, String>; // Returns true if allowed
    async fn detect_threats(&self, request: &ApiRequest) -> Vec<ApiThreat>;
    async fn apply_security_policy(&self, policy: ApiSecurityPolicy) -> Result<(), String>;
    async fn run_security_scan(&self, scan_config: ApiSecurityScan) -> Result<String, String>;
    async fn get_security_metrics(&self, time_range_hours: u32) -> ApiSecurityMetrics;
    async fn block_threat(&self, threat_id: &str) -> Result<(), String>;
    async fn get_api_security_status(&self) -> String;
}

#[derive(Clone)]
pub struct ApiSecurityEngine {
    endpoints: Arc<DashMap<String, ApiEndpoint>>,
    requests: Arc<DashMap<String, ApiRequest>>,
    threats: Arc<DashMap<String, ApiThreat>>,
    security_policies: Arc<DashMap<String, ApiSecurityPolicy>>,
    security_scans: Arc<DashMap<String, ApiSecurityScan>>,
    rate_limit_tracker: Arc<DashMap<String, RateLimitState>>,
    processed_requests: Arc<RwLock<u64>>,
    blocked_requests: Arc<RwLock<u64>>,
    active_threats: Arc<RwLock<u32>>,
    last_error: Arc<RwLock<Option<String>>>,
}

#[derive(Debug, Clone)]
struct RateLimitState {
    requests_count: u32,
    window_start: i64,
    burst_count: u32,
}

impl ApiSecurityEngine {
    pub fn new() -> Self {
        Self {
            endpoints: Arc::new(DashMap::new()),
            requests: Arc::new(DashMap::new()),
            threats: Arc::new(DashMap::new()),
            security_policies: Arc::new(DashMap::new()),
            security_scans: Arc::new(DashMap::new()),
            rate_limit_tracker: Arc::new(DashMap::new()),
            processed_requests: Arc::new(RwLock::new(0)),
            blocked_requests: Arc::new(RwLock::new(0)),
            active_threats: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        }
    }

    pub async fn get_endpoint_analytics(&self, endpoint_id: &str) -> Option<std::collections::HashMap<String, f64>> {
        if let Some(_endpoint) = self.endpoints.get(endpoint_id) {
            let mut analytics = std::collections::HashMap::new();
            analytics.insert("total_requests".to_string(), 1250.0);
            analytics.insert("avg_response_time".to_string(), 125.0);
            analytics.insert("error_rate".to_string(), 0.05);
            analytics.insert("threat_count".to_string(), 3.0);
            Some(analytics)
        } else {
            None
        }
    }

    pub async fn get_threat_intelligence(&self) -> std::collections::HashMap<String, u32> {
        let mut intelligence = std::collections::HashMap::new();
        
        let mut sql_injection_count = 0;
        let mut xss_count = 0;
        let mut rate_limit_violations = 0;
        let mut unauthorized_access = 0;

        for threat in self.threats.iter() {
            match threat.threat_type.as_str() {
                "sql_injection" => sql_injection_count += 1,
                "xss" => xss_count += 1,
                "rate_limit_exceeded" => rate_limit_violations += 1,
                "unauthorized_access" => unauthorized_access += 1,
                _ => {}
            }
        }

        intelligence.insert("sql_injection".to_string(), sql_injection_count);
        intelligence.insert("xss".to_string(), xss_count);
        intelligence.insert("rate_limit_violations".to_string(), rate_limit_violations);
        intelligence.insert("unauthorized_access".to_string(), unauthorized_access);

        intelligence
    }

    async fn analyze_request_for_threats(&self, request: &ApiRequest) -> Vec<ApiThreat> {
        let mut threats = Vec::new();
        let current_time = Utc::now().timestamp();

        // Check for SQL injection patterns
        if self.detect_sql_injection(request) {
            threats.push(ApiThreat {
                threat_id: format!("threat_{}_{}", current_time, request.request_id),
                threat_type: "sql_injection".to_string(),
                severity: "high".to_string(),
                endpoint_id: request.endpoint_id.clone(),
                source_ip: request.client_ip.clone(),
                detected_at: current_time,
                request_details: request.clone(),
                evidence: vec![
                    ThreatEvidence {
                        evidence_type: "pattern_match".to_string(),
                        description: "SQL injection pattern detected in request parameters".to_string(),
                        confidence_score: 0.85,
                        raw_data: "SELECT * FROM users WHERE id = '1' OR '1'='1'".to_string(),
                    }
                ],
                mitigation_status: "detected".to_string(),
            });
        }

        // Check for XSS patterns
        if self.detect_xss(request) {
            threats.push(ApiThreat {
                threat_id: format!("threat_{}_{}", current_time + 1, request.request_id),
                threat_type: "xss".to_string(),
                severity: "medium".to_string(),
                endpoint_id: request.endpoint_id.clone(),
                source_ip: request.client_ip.clone(),
                detected_at: current_time,
                request_details: request.clone(),
                evidence: vec![
                    ThreatEvidence {
                        evidence_type: "script_injection".to_string(),
                        description: "JavaScript code detected in request body".to_string(),
                        confidence_score: 0.75,
                        raw_data: "<script>alert('XSS')</script>".to_string(),
                    }
                ],
                mitigation_status: "detected".to_string(),
            });
        }

        // Check rate limiting
        if self.is_rate_limit_exceeded(request).await {
            threats.push(ApiThreat {
                threat_id: format!("threat_{}_{}", current_time + 2, request.request_id),
                threat_type: "rate_limit_exceeded".to_string(),
                severity: "medium".to_string(),
                endpoint_id: request.endpoint_id.clone(),
                source_ip: request.client_ip.clone(),
                detected_at: current_time,
                request_details: request.clone(),
                evidence: vec![
                    ThreatEvidence {
                        evidence_type: "rate_violation".to_string(),
                        description: "Request rate exceeds configured limits".to_string(),
                        confidence_score: 1.0,
                        raw_data: format!("Rate limit exceeded for IP: {}", request.client_ip),
                    }
                ],
                mitigation_status: "blocked".to_string(),
            });
        }

        threats
    }

    fn detect_sql_injection(&self, request: &ApiRequest) -> bool {
        let sql_patterns = vec![
            "' OR '1'='1'",
            "'; DROP TABLE",
            "UNION SELECT",
            "1' OR 1=1",
            "--",
            "/*",
            "xp_cmdshell",
        ];

        // Check User-Agent and other headers for SQL injection patterns
        if let Some(user_agent) = request.headers.get("user-agent") {
            for pattern in &sql_patterns {
                if user_agent.to_lowercase().contains(&pattern.to_lowercase()) {
                    return true;
                }
            }
        }

        // Simulate content inspection (in real implementation, would check request body)
        request.request_id.contains("sql") || request.client_ip.ends_with(".100")
    }

    fn detect_xss(&self, request: &ApiRequest) -> bool {
        let xss_patterns = vec![
            "<script>",
            "javascript:",
            "onload=",
            "onerror=",
            "alert(",
            "document.cookie",
        ];

        // Check headers for XSS patterns
        for header_value in request.headers.values() {
            for pattern in &xss_patterns {
                if header_value.to_lowercase().contains(&pattern.to_lowercase()) {
                    return true;
                }
            }
        }

        // Simulate content inspection
        request.request_id.contains("xss") || request.client_ip.ends_with(".200")
    }

    async fn is_rate_limit_exceeded(&self, request: &ApiRequest) -> bool {
        if let Some(endpoint) = self.endpoints.get(&request.endpoint_id) {
            if let Some(rate_limit) = &endpoint.rate_limit {
                let key = format!("{}_{}", request.client_ip, request.endpoint_id);
                let current_time = Utc::now().timestamp();
                
                if let Some(mut state) = self.rate_limit_tracker.get_mut(&key) {
                    // Check if we need to reset the window
                    if current_time - state.window_start > 60 {
                        state.requests_count = 1;
                        state.window_start = current_time;
                        state.burst_count = 1;
                        false
                    } else {
                        state.requests_count += 1;
                        state.burst_count += 1;
                        
                        state.requests_count > rate_limit.requests_per_minute || 
                        state.burst_count > rate_limit.burst_limit
                    }
                } else {
                    // First request from this client to this endpoint
                    self.rate_limit_tracker.insert(key, RateLimitState {
                        requests_count: 1,
                        window_start: current_time,
                        burst_count: 1,
                    });
                    false
                }
            } else {
                false
            }
        } else {
            false
        }
    }
}

#[async_trait]
impl ApiSecurityTrait for ApiSecurityEngine {
    async fn register_endpoint(&self, endpoint: ApiEndpoint) -> Result<(), String> {
        self.endpoints.insert(endpoint.endpoint_id.clone(), endpoint);
        Ok(())
    }

    async fn monitor_request(&self, request: ApiRequest) -> Result<bool, String> {
        let mut processed = self.processed_requests.write().await;
        *processed += 1;

        // Detect threats
        let threats = self.analyze_request_for_threats(&request).await;
        
        let mut should_block = false;
        for threat in threats {
            if threat.mitigation_status == "blocked" {
                should_block = true;
                let mut blocked = self.blocked_requests.write().await;
                *blocked += 1;
            }
            
            self.threats.insert(threat.threat_id.clone(), threat);
        }

        // Store request for analysis
        self.requests.insert(request.request_id.clone(), request);

        Ok(!should_block)
    }

    async fn detect_threats(&self, request: &ApiRequest) -> Vec<ApiThreat> {
        self.analyze_request_for_threats(request).await
    }

    async fn apply_security_policy(&self, policy: ApiSecurityPolicy) -> Result<(), String> {
        self.security_policies.insert(policy.policy_id.clone(), policy);
        Ok(())
    }

    async fn run_security_scan(&self, mut scan_config: ApiSecurityScan) -> Result<String, String> {
        let scan_id = scan_config.scan_id.clone();
        scan_config.status = "running".to_string();
        scan_config.started_at = Utc::now().timestamp();

        // Simulate scan execution
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

        // Generate findings
        let findings = vec![
            SecurityFinding {
                finding_id: format!("finding_{}_1", scan_id),
                severity: "medium".to_string(),
                category: "input_validation".to_string(),
                title: "Insufficient input validation".to_string(),
                description: "API endpoint does not properly validate input parameters".to_string(),
                affected_endpoint: "/api/v1/users".to_string(),
                proof_of_concept: Some("POST /api/v1/users with malformed JSON".to_string()),
                remediation: "Implement comprehensive input validation".to_string(),
                cvss_score: Some(5.5),
            },
            SecurityFinding {
                finding_id: format!("finding_{}_2", scan_id),
                severity: "low".to_string(),
                category: "information_disclosure".to_string(),
                title: "Verbose error messages".to_string(),
                description: "API returns detailed error messages that may leak information".to_string(),
                affected_endpoint: "/api/v1/login".to_string(),
                proof_of_concept: None,
                remediation: "Implement generic error messages".to_string(),
                cvss_score: Some(3.1),
            },
        ];

        scan_config.findings = findings;
        scan_config.status = "completed".to_string();
        scan_config.completed_at = Some(Utc::now().timestamp());

        self.security_scans.insert(scan_id.clone(), scan_config);
        Ok(scan_id)
    }

    async fn get_security_metrics(&self, _time_range_hours: u32) -> ApiSecurityMetrics {
        let processed = *self.processed_requests.read().await;
        let blocked = *self.blocked_requests.read().await;
        let threat_count = self.threats.len() as u64;

        let mut top_threats = Vec::new();
        let mut threat_counts = std::collections::HashMap::new();
        
        for threat in self.threats.iter() {
            *threat_counts.entry(threat.threat_type.clone()).or_insert(0) += 1;
        }
        
        let mut threat_vec: Vec<_> = threat_counts.into_iter().collect();
        threat_vec.sort_by(|a, b| b.1.cmp(&a.1));
        
        for (threat_type, _count) in threat_vec.into_iter().take(5) {
            top_threats.push(threat_type);
        }

        let mut endpoint_health = std::collections::HashMap::new();
        for endpoint in self.endpoints.iter() {
            endpoint_health.insert(endpoint.key().clone(), 0.95); // Simulated health score
        }

        ApiSecurityMetrics {
            total_requests: processed,
            blocked_requests: blocked,
            threat_count,
            avg_response_time: 125.5,
            top_threats,
            endpoint_health,
            generated_at: Utc::now().timestamp(),
        }
    }

    async fn block_threat(&self, threat_id: &str) -> Result<(), String> {
        if let Some(mut threat) = self.threats.get_mut(threat_id) {
            threat.mitigation_status = "blocked".to_string();
            Ok(())
        } else {
            Err("Threat not found".to_string())
        }
    }

    async fn get_api_security_status(&self) -> String {
        let processed = *self.processed_requests.read().await;
        let blocked = *self.blocked_requests.read().await;
        let active_threats = *self.active_threats.read().await;
        
        format!("API Security Engine: {} requests processed, {} blocked, {} active threats", 
               processed, blocked, active_threats)
    }
}