// phantom-ioc-core/src/threat_hunting.rs
// Advanced threat hunting capabilities and query engine

use crate::types::*;
use async_trait::async_trait;
use chrono::{DateTime, Utc, Duration};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Threat hunting engine for advanced hunting operations
pub struct ThreatHuntingEngine {
    hunt_queries: Arc<RwLock<HashMap<String, HuntQuery>>>,
    hunt_results: Arc<RwLock<HashMap<String, HuntResult>>>,
    statistics: Arc<RwLock<HuntingStats>>,
}

impl ThreatHuntingEngine {
    /// Create a new threat hunting engine
    pub async fn new() -> Result<Self, IOCError> {
        let engine = Self {
            hunt_queries: Arc::new(RwLock::new(HashMap::new())),
            hunt_results: Arc::new(RwLock::new(HashMap::new())),
            statistics: Arc::new(RwLock::new(HuntingStats::default())),
        };

        // Initialize with default hunting queries
        engine.initialize_default_queries().await?;

        Ok(engine)
    }

    /// Initialize default hunting queries
    async fn initialize_default_queries(&self) -> Result<(), IOCError> {
        let default_queries = vec![
            HuntQuery {
                id: "lateral_movement_hunt".to_string(),
                name: "Lateral Movement Detection".to_string(),
                description: "Hunt for indicators of lateral movement".to_string(),
                query_logic: HuntQueryLogic {
                    conditions: vec![
                        HuntCondition {
                            field: "indicator_type".to_string(),
                            operator: "equals".to_string(),
                            value: "ip".to_string(),
                        },
                        HuntCondition {
                            field: "tags".to_string(),
                            operator: "contains".to_string(),
                            value: "lateral_movement".to_string(),
                        },
                    ],
                    time_window: Some(Duration::hours(24)),
                    correlation_rules: vec![
                        "multiple_internal_ips".to_string(),
                        "privilege_escalation_indicators".to_string(),
                    ],
                },
                severity: Severity::High,
                created_at: Utc::now(),
                updated_at: Utc::now(),
                enabled: true,
            },
            HuntQuery {
                id: "apt_behavior_hunt".to_string(),
                name: "APT Behavior Hunt".to_string(),
                description: "Hunt for Advanced Persistent Threat behaviors".to_string(),
                query_logic: HuntQueryLogic {
                    conditions: vec![
                        HuntCondition {
                            field: "confidence".to_string(),
                            operator: "greater_than".to_string(),
                            value: "0.8".to_string(),
                        },
                        HuntCondition {
                            field: "tags".to_string(),
                            operator: "contains_any".to_string(),
                            value: "apt,persistence,c2".to_string(),
                        },
                    ],
                    time_window: Some(Duration::days(7)),
                    correlation_rules: vec![
                        "long_term_persistence".to_string(),
                        "data_exfiltration_patterns".to_string(),
                    ],
                },
                severity: Severity::Critical,
                created_at: Utc::now(),
                updated_at: Utc::now(),
                enabled: true,
            },
            HuntQuery {
                id: "ransomware_indicators_hunt".to_string(),
                name: "Ransomware Indicators Hunt".to_string(),
                description: "Hunt for ransomware activity indicators".to_string(),
                query_logic: HuntQueryLogic {
                    conditions: vec![
                        HuntCondition {
                            field: "tags".to_string(),
                            operator: "contains".to_string(),
                            value: "ransomware".to_string(),
                        },
                        HuntCondition {
                            field: "severity".to_string(),
                            operator: "greater_than_or_equal".to_string(),
                            value: "high".to_string(),
                        },
                    ],
                    time_window: Some(Duration::hours(6)),
                    correlation_rules: vec![
                        "file_encryption_patterns".to_string(),
                        "ransom_note_indicators".to_string(),
                    ],
                },
                severity: Severity::Critical,
                created_at: Utc::now(),
                updated_at: Utc::now(),
                enabled: true,
            },
        ];

        let mut queries = self.hunt_queries.write().await;
        for query in default_queries {
            queries.insert(query.id.clone(), query);
        }

        Ok(())
    }

    /// Execute a threat hunt with given parameters
    pub async fn execute_hunt(&self, hunt_params: &HuntParameters) -> Result<HuntResult, IOCError> {
        let query = {
            let queries = self.hunt_queries.read().await;
            queries.get(&hunt_params.query_id)
                .ok_or_else(|| IOCError::Validation(format!("Hunt query not found: {}", hunt_params.query_id)))?
                .clone()
        };

        if !query.enabled {
            return Err(IOCError::Validation("Hunt query is disabled".to_string()));
        }

        let hunt_id = Uuid::new_v4().to_string();
        let start_time = Utc::now();

        // Simulate hunt execution
        let findings = self.execute_hunt_logic(&query, hunt_params).await?;
        
        let end_time = Utc::now();
        let duration = end_time - start_time;

        let result = HuntResult {
            hunt_id: hunt_id.clone(),
            query_id: query.id.clone(),
            execution_time: start_time,
            duration: duration.num_milliseconds(),
            status: HuntStatus::Completed,
            findings: findings.clone(),
            statistics: HuntExecutionStats {
                total_indicators_searched: hunt_params.target_indicators.len() as u64,
                matches_found: findings.len() as u64,
                false_positives_estimated: (findings.len() as f64 * 0.1) as u64,
                confidence_score: self.calculate_hunt_confidence(&findings).await,
            },
            metadata: HashMap::from([
                ("hunt_type".to_string(), serde_json::Value::String("automated".to_string())),
                ("analyst".to_string(), serde_json::Value::String(hunt_params.analyst.clone())),
            ]),
        };

        // Store the result
        {
            let mut results = self.hunt_results.write().await;
            results.insert(hunt_id, result.clone());
        }

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.total_hunts += 1;
            stats.total_findings += findings.len() as u64;
            stats.successful_hunts += if !findings.is_empty() { 1 } else { 0 };
            stats.last_hunt_time = Some(Utc::now());
        }

        Ok(result)
    }

    /// Execute hunt logic against indicators
    async fn execute_hunt_logic(&self, query: &HuntQuery, params: &HuntParameters) -> Result<Vec<HuntFinding>, IOCError> {
        let mut findings = Vec::new();

        for indicator in &params.target_indicators {
            if self.evaluate_hunt_conditions(&query.query_logic, indicator).await? {
                let finding = HuntFinding {
                    id: Uuid::new_v4().to_string(),
                    indicator_id: indicator.id.to_string(),
                    rule_id: query.id.clone(),
                    confidence: indicator.confidence,
                    severity: query.severity.clone(),
                    description: format!("Hunt match for query: {}", query.name),
                    evidence: vec![
                        format!("Indicator value: {}", indicator.value),
                        format!("Indicator type: {:?}", indicator.indicator_type),
                        format!("Tags: {:?}", indicator.tags),
                    ],
                    timestamp: Utc::now(),
                    context: HashMap::from([
                        ("query_name".to_string(), serde_json::Value::String(query.name.clone())),
                        ("indicator_source".to_string(), serde_json::Value::String(indicator.source.clone())),
                    ]),
                };
                findings.push(finding);
            }
        }

        Ok(findings)
    }

    /// Evaluate hunt conditions against an IOC
    async fn evaluate_hunt_conditions(&self, logic: &HuntQueryLogic, ioc: &IOC) -> Result<bool, IOCError> {
        for condition in &logic.conditions {
            let field_value = match condition.field.as_str() {
                "indicator_type" => format!("{:?}", ioc.indicator_type).to_lowercase(),
                "confidence" => ioc.confidence.to_string(),
                "severity" => format!("{:?}", ioc.severity).to_lowercase(),
                "tags" => ioc.tags.join(","),
                "value" => ioc.value.clone(),
                "source" => ioc.source.clone(),
                _ => continue,
            };

            let matches = match condition.operator.as_str() {
                "equals" => field_value == condition.value,
                "contains" => field_value.contains(&condition.value),
                "contains_any" => {
                    let values: Vec<&str> = condition.value.split(',').collect();
                    values.iter().any(|v| field_value.contains(v.trim()))
                }
                "greater_than" => {
                    if let (Ok(field_num), Ok(condition_num)) = (field_value.parse::<f64>(), condition.value.parse::<f64>()) {
                        field_num > condition_num
                    } else {
                        false
                    }
                }
                "greater_than_or_equal" => {
                    if condition.field == "severity" {
                        self.severity_matches_or_exceeds(&ioc.severity, &condition.value)
                    } else if let (Ok(field_num), Ok(condition_num)) = (field_value.parse::<f64>(), condition.value.parse::<f64>()) {
                        field_num >= condition_num
                    } else {
                        false
                    }
                }
                _ => false,
            };

            if !matches {
                return Ok(false);
            }
        }

        Ok(true)
    }

    /// Check if severity matches or exceeds threshold
    fn severity_matches_or_exceeds(&self, ioc_severity: &Severity, threshold: &str) -> bool {
        let threshold_level = match threshold.to_lowercase().as_str() {
            "low" => 0,
            "medium" => 1,
            "high" => 2,
            "critical" => 3,
            _ => return false,
        };

        let ioc_level = match ioc_severity {
            Severity::Low => 0,
            Severity::Medium => 1,
            Severity::High => 2,
            Severity::Critical => 3,
        };

        ioc_level >= threshold_level
    }

    /// Calculate confidence score for hunt results
    async fn calculate_hunt_confidence(&self, findings: &[HuntFinding]) -> f64 {
        if findings.is_empty() {
            return 0.0;
        }

        let avg_confidence = findings.iter()
            .map(|f| f.confidence)
            .sum::<f64>() / findings.len() as f64;

        // Adjust confidence based on number of findings
        let finding_boost = (findings.len() as f64).ln() * 0.1;
        
        (avg_confidence + finding_boost).min(1.0)
    }

    /// Create a new hunt query
    pub async fn create_hunt_query(&self, query: HuntQuery) -> Result<String, IOCError> {
        let mut queries = self.hunt_queries.write().await;
        let query_id = query.id.clone();
        queries.insert(query_id.clone(), query);
        Ok(query_id)
    }

    /// Get hunt results by ID
    pub async fn get_hunt_result(&self, hunt_id: &str) -> Result<Option<HuntResult>, IOCError> {
        let results = self.hunt_results.read().await;
        Ok(results.get(hunt_id).cloned())
    }

    /// List recent hunt results
    pub async fn list_recent_hunts(&self, limit: usize) -> Result<Vec<HuntResult>, IOCError> {
        let results = self.hunt_results.read().await;
        let mut sorted_results: Vec<_> = results.values().cloned().collect();
        sorted_results.sort_by(|a, b| b.execution_time.cmp(&a.execution_time));
        Ok(sorted_results.into_iter().take(limit).collect())
    }

    /// Get hunting statistics
    pub async fn get_statistics(&self) -> HuntingStats {
        self.statistics.read().await.clone()
    }

    /// Get health status
    pub async fn get_health(&self) -> ComponentHealth {
        let stats = self.statistics.read().await;
        let queries = self.hunt_queries.read().await;

        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Threat hunting engine operational with {} queries", queries.len()),
            last_check: Utc::now(),
            metrics: HashMap::from([
                ("total_queries".to_string(), queries.len() as f64),
                ("total_hunts".to_string(), stats.total_hunts as f64),
                ("success_rate".to_string(), if stats.total_hunts > 0 {
                    stats.successful_hunts as f64 / stats.total_hunts as f64
                } else { 0.0 }),
                ("total_findings".to_string(), stats.total_findings as f64),
            ]),
        }
    }
}

/// Hunt query definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HuntQuery {
    pub id: String,
    pub name: String,
    pub description: String,
    pub query_logic: HuntQueryLogic,
    pub severity: Severity,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub enabled: bool,
}

/// Hunt query logic
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HuntQueryLogic {
    pub conditions: Vec<HuntCondition>,
    pub time_window: Option<Duration>,
    pub correlation_rules: Vec<String>,
}

/// Hunt condition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HuntCondition {
    pub field: String,
    pub operator: String,
    pub value: String,
}

/// Hunt parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HuntParameters {
    pub query_id: String,
    pub target_indicators: Vec<IOC>,
    pub time_range: Option<(DateTime<Utc>, DateTime<Utc>)>,
    pub analyst: String,
    pub priority: Severity,
}

/// Hunt result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HuntResult {
    pub hunt_id: String,
    pub query_id: String,
    pub execution_time: DateTime<Utc>,
    pub duration: i64, // milliseconds
    pub status: HuntStatus,
    pub findings: Vec<HuntFinding>,
    pub statistics: HuntExecutionStats,
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Hunt status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HuntStatus {
    Running,
    Completed,
    Failed,
    Cancelled,
}

/// Hunt finding
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HuntFinding {
    pub id: String,
    pub indicator_id: String,
    pub rule_id: String,
    pub confidence: f64,
    pub severity: Severity,
    pub description: String,
    pub evidence: Vec<String>,
    pub timestamp: DateTime<Utc>,
    pub context: HashMap<String, serde_json::Value>,
}

/// Hunt execution statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HuntExecutionStats {
    pub total_indicators_searched: u64,
    pub matches_found: u64,
    pub false_positives_estimated: u64,
    pub confidence_score: f64,
}

/// Hunting statistics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct HuntingStats {
    pub total_hunts: u64,
    pub successful_hunts: u64,
    pub total_findings: u64,
    pub average_hunt_duration: f64,
    pub last_hunt_time: Option<DateTime<Utc>>,
}