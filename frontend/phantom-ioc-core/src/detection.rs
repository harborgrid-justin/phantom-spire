// phantom-ioc-core/src/detection.rs
// IOC detection engine with pattern matching and anomaly detection

use crate::types::*;
use crate::IOCError;
// use async_trait::async_trait; // Not needed
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};

/// Detection engine for IOC pattern matching
pub struct DetectionEngine {
    rules: Arc<RwLock<Vec<DetectionRule>>>,
    compiled_patterns: Arc<RwLock<HashMap<String, Regex>>>,
    statistics: Arc<RwLock<DetectionStats>>,
}

impl DetectionEngine {
    /// Create a new detection engine
    pub async fn new() -> Result<Self, IOCError> {
        let rules = Arc::new(RwLock::new(Vec::new()));
        let compiled_patterns = Arc::new(RwLock::new(HashMap::new()));
        let statistics = Arc::new(RwLock::new(DetectionStats::default()));

        let engine = Self {
            rules,
            compiled_patterns,
            statistics,
        };

        // Initialize with default rules
        engine.initialize_default_rules().await?;

        Ok(engine)
    }

    /// Initialize default detection rules
    async fn initialize_default_rules(&self) -> Result<(), IOCError> {
        let default_rules = vec![
            DetectionRule {
                id: "ip_malicious_pattern".to_string(),
                name: "Malicious IP Pattern".to_string(),
                description: "Detects suspicious IP address patterns".to_string(),
                ioc_types: vec![IOCType::IPAddress],
                conditions: vec![
                    DetectionCondition {
                        field: "value".to_string(),
                        pattern: r"^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.|0\.)".to_string(),
                        case_sensitive: false,
                        weight: 0.3,
                    },
                ],
                severity: Severity::Medium,
                confidence: 0.7,
                enabled: true,
            },
            DetectionRule {
                id: "domain_suspicious_tld".to_string(),
                name: "Suspicious Domain TLD".to_string(),
                description: "Detects domains with suspicious TLDs".to_string(),
                ioc_types: vec![IOCType::Domain],
                conditions: vec![
                    DetectionCondition {
                        field: "value".to_string(),
                        pattern: r"\.(tk|ml|ga|cf|gq|top|xyz|club|online|site)$".to_string(),
                        case_sensitive: false,
                        weight: 0.8,
                    },
                ],
                severity: Severity::High,
                confidence: 0.8,
                enabled: true,
            },
            DetectionRule {
                id: "hash_known_malware".to_string(),
                name: "Known Malware Hash".to_string(),
                description: "Detects known malware file hashes".to_string(),
                ioc_types: vec![IOCType::Hash],
                conditions: vec![
                    DetectionCondition {
                        field: "value".to_string(),
                        pattern: r"^[a-fA-F0-9]{32,128}$".to_string(),
                        case_sensitive: false,
                        weight: 0.5,
                    },
                ],
                severity: Severity::Critical,
                confidence: 0.9,
                enabled: true,
            },
            DetectionRule {
                id: "url_malicious_pattern".to_string(),
                name: "Malicious URL Pattern".to_string(),
                description: "Detects URLs with malicious patterns".to_string(),
                ioc_types: vec![IOCType::URL],
                conditions: vec![
                    DetectionCondition {
                        field: "value".to_string(),
                        pattern: r"(eval\(|javascript:|data:text|vbscript:)".to_string(),
                        case_sensitive: false,
                        weight: 0.9,
                    },
                ],
                severity: Severity::High,
                confidence: 0.85,
                enabled: true,
            },
        ];

        let mut rules = self.rules.write().await;
        rules.extend(default_rules);

        // Compile regex patterns
        self.compile_patterns().await?;

        Ok(())
    }

    /// Compile regex patterns for all rules
    async fn compile_patterns(&self) -> Result<(), IOCError> {
        let rules = self.rules.read().await;
        let mut compiled = self.compiled_patterns.write().await;

        for rule in rules.iter() {
            for condition in &rule.conditions {
                let pattern_key = format!("{}_{}", rule.id, condition.field);
                if !compiled.contains_key(&pattern_key) {
                    match Regex::new(&condition.pattern) {
                        Ok(regex) => {
                            compiled.insert(pattern_key, regex);
                        }
                        Err(e) => {
                            eprintln!("Failed to compile regex pattern for rule {}: {}", rule.id, e);
                        }
                    }
                }
            }
        }

        Ok(())
    }

    /// Detect patterns in an IOC
    pub async fn detect_patterns(&self, ioc: &IOC) -> Result<DetectionResult, IOCError> {
        let rules = self.rules.read().await;
        let compiled = self.compiled_patterns.read().await;
        let mut matched_rules = Vec::new();
        let mut detection_methods = Vec::new();
        let mut total_confidence = 0.0;
        let mut match_count = 0;

        // Check each rule
        for rule in rules.iter().filter(|r| r.enabled) {
            if !rule.ioc_types.contains(&ioc.indicator_type) {
                continue;
            }

            let mut rule_matches = true;
            let mut rule_confidence = 0.0;

            // Check all conditions for this rule
            for condition in &rule.conditions {
                let pattern_key = format!("{}_{}", rule.id, condition.field);
                if let Some(regex) = compiled.get(&pattern_key) {
                    let field_value = match condition.field.as_str() {
                        "value" => &ioc.value,
                        "source" => &ioc.source,
                        _ => continue,
                    };

                    if regex.is_match(field_value) {
                        rule_confidence += condition.weight;
                        detection_methods.push(format!("regex_match:{}", condition.pattern));
                    } else {
                        rule_matches = false;
                        break;
                    }
                }
            }

            if rule_matches && rule_confidence > 0.0 {
                matched_rules.push(rule.name.clone());
                total_confidence += rule_confidence * rule.confidence;
                match_count += 1;
            }
        }

        // Calculate final detection confidence
        let detection_confidence = if match_count > 0 {
            (total_confidence / match_count as f64).min(1.0)
        } else {
            0.0
        };

        // Estimate false positive probability (simplified)
        let false_positive_probability = if detection_confidence > 0.8 {
            0.1
        } else if detection_confidence > 0.6 {
            0.2
        } else {
            0.3
        };

        // Update statistics
        let mut stats = self.statistics.write().await;
        stats.total_scans += 1;
        if !matched_rules.is_empty() {
            stats.detections += 1;
        }

        Ok(DetectionResult {
            matched_rules,
            detection_methods,
            false_positive_probability,
            detection_confidence,
        })
    }

    /// Get health status
    pub async fn get_health(&self) -> ComponentHealth {
        let stats = self.statistics.read().await;
        let rules = self.rules.read().await;

        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Detection engine operational with {} rules", rules.len()),
            last_check: Utc::now(),
            metrics: HashMap::from([
                ("total_rules".to_string(), rules.len() as f64),
                ("total_scans".to_string(), stats.total_scans as f64),
                ("detections".to_string(), stats.detections as f64),
                ("detection_rate".to_string(), if stats.total_scans > 0 {
                    stats.detections as f64 / stats.total_scans as f64
                } else { 0.0 }),
            ]),
        }
    }
}

/// Detection statistics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct DetectionStats {
    pub total_scans: u64,
    pub detections: u64,
    pub false_positives: u64,
    pub last_updated: Option<DateTime<Utc>>,
}

/// Detection rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionRule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub ioc_types: Vec<IOCType>,
    pub conditions: Vec<DetectionCondition>,
    pub severity: Severity,
    pub confidence: f64,
    pub enabled: bool,
}

/// Detection condition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionCondition {
    pub field: String,
    pub pattern: String,
    pub case_sensitive: bool,
    pub weight: f64,
}
