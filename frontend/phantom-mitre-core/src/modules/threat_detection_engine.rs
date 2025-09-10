//! Threat Detection Engine Module
//! 
//! Advanced threat detection algorithms for identifying MITRE ATT&CK techniques
//! in real-time data streams and security events.

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use crate::{MitreTechnique, MitreTactic, DetectionRule, Severity};

/// Detection algorithm types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DetectionAlgorithm {
    PatternMatching,
    MachineLearning,
    StatisticalAnalysis,
    BehavioralAnalysis,
    AnomalyDetection,
    RuleBasedDetection,
    HeuristicAnalysis,
    TimeSeriesAnalysis,
}

/// Detection confidence levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum DetectionConfidence {
    VeryLow,
    Low,
    Medium,
    High,
    VeryHigh,
}

/// Real-time threat detection result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatDetection {
    pub detection_id: String,
    pub timestamp: DateTime<Utc>,
    pub technique_id: String,
    pub technique_name: String,
    pub tactic: MitreTactic,
    pub confidence: DetectionConfidence,
    pub confidence_score: f64,
    pub severity: Severity,
    pub algorithm_used: DetectionAlgorithm,
    pub raw_data: Vec<String>,
    pub indicators: Vec<String>,
    pub affected_systems: Vec<String>,
    pub network_indicators: Vec<NetworkIndicator>,
    pub file_indicators: Vec<FileIndicator>,
    pub process_indicators: Vec<ProcessIndicator>,
    pub registry_indicators: Vec<RegistryIndicator>,
    pub false_positive_probability: f64,
    pub remediation_suggestions: Vec<String>,
    pub escalation_required: bool,
}

/// Network-based indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkIndicator {
    pub source_ip: String,
    pub destination_ip: String,
    pub port: u16,
    pub protocol: String,
    pub data_size: u64,
    pub connection_duration: u64,
    pub suspicious_patterns: Vec<String>,
    pub geolocation: Option<GeoLocation>,
}

/// File-based indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileIndicator {
    pub file_path: String,
    pub file_name: String,
    pub file_hash: String,
    pub file_size: u64,
    pub creation_time: DateTime<Utc>,
    pub modification_time: DateTime<Utc>,
    pub file_type: String,
    pub signatures: Vec<String>,
    pub entropy: f64,
    pub pe_characteristics: Option<PECharacteristics>,
}

/// Process-based indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessIndicator {
    pub process_id: u32,
    pub process_name: String,
    pub parent_process_id: u32,
    pub command_line: String,
    pub user_account: String,
    pub start_time: DateTime<Utc>,
    pub memory_usage: u64,
    pub cpu_usage: f64,
    pub network_connections: Vec<String>,
    pub file_operations: Vec<String>,
    pub registry_operations: Vec<String>,
    pub dll_loaded: Vec<String>,
}

/// Registry-based indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegistryIndicator {
    pub registry_key: String,
    pub value_name: String,
    pub value_data: String,
    pub operation_type: RegistryOperation,
    pub timestamp: DateTime<Utc>,
    pub process_responsible: String,
    pub suspicious_patterns: Vec<String>,
}

/// Registry operation types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum RegistryOperation {
    Create,
    Modify,
    Delete,
    Query,
    Enumerate,
}

/// Geolocation information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeoLocation {
    pub country: String,
    pub region: String,
    pub city: String,
    pub latitude: f64,
    pub longitude: f64,
    pub is_tor: bool,
    pub is_vpn: bool,
    pub is_malicious: bool,
}

/// PE file characteristics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PECharacteristics {
    pub imports: Vec<String>,
    pub exports: Vec<String>,
    pub sections: Vec<String>,
    pub compile_time: DateTime<Utc>,
    pub is_packed: bool,
    pub packer_type: Option<String>,
    pub digital_signature: Option<String>,
    pub version_info: HashMap<String, String>,
}

/// Detection engine configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionEngineConfig {
    pub enabled_algorithms: Vec<DetectionAlgorithm>,
    pub confidence_threshold: f64,
    pub false_positive_threshold: f64,
    pub real_time_processing: bool,
    pub batch_size: usize,
    pub retention_days: u32,
    pub alert_escalation_threshold: f64,
    pub custom_rules: Vec<CustomDetectionRule>,
}

/// Custom detection rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomDetectionRule {
    pub rule_id: String,
    pub name: String,
    pub description: String,
    pub technique_ids: Vec<String>,
    pub logic: String,
    pub enabled: bool,
    pub severity: Severity,
    pub created_by: String,
    pub created_at: DateTime<Utc>,
    pub last_modified: DateTime<Utc>,
}

/// Detection analytics and metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionAnalytics {
    pub total_detections: u64,
    pub detections_by_technique: HashMap<String, u64>,
    pub detections_by_tactic: HashMap<MitreTactic, u64>,
    pub detections_by_severity: HashMap<Severity, u64>,
    pub false_positive_rate: f64,
    pub average_detection_time: f64,
    pub top_techniques: Vec<(String, u64)>,
    pub detection_trends: Vec<DetectionTrend>,
    pub accuracy_metrics: AccuracyMetrics,
}

/// Detection trend data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionTrend {
    pub timestamp: DateTime<Utc>,
    pub technique_id: String,
    pub count: u64,
    pub severity_distribution: HashMap<Severity, u64>,
}

/// Accuracy metrics for the detection engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccuracyMetrics {
    pub true_positives: u64,
    pub false_positives: u64,
    pub true_negatives: u64,
    pub false_negatives: u64,
    pub precision: f64,
    pub recall: f64,
    pub f1_score: f64,
    pub accuracy: f64,
}

/// ML Model for threat detection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MLDetectionModel {
    pub model_id: String,
    pub weights: Vec<f64>,
    pub bias: f64,
    pub learning_rate: f64,
    pub feature_importance: HashMap<String, f64>,
    pub accuracy_history: Vec<f64>,
    pub last_trained: DateTime<Utc>,
    pub training_samples: u64,
    pub mutation_rate: f64,
}

impl MLDetectionModel {
    /// Create a new ML model with initial parameters
    pub fn new(model_id: String) -> Self {
        Self {
            model_id,
            weights: vec![0.1, 0.2, 0.15, 0.25, 0.3], // Initial weights for different features
            bias: 0.0,
            learning_rate: 0.01,
            feature_importance: HashMap::new(),
            accuracy_history: vec![0.5], // Start with 50% accuracy
            last_trained: Utc::now(),
            training_samples: 0,
            mutation_rate: 0.05,
        }
    }

    /// Extract features from event data
    fn extract_features(&self, event_data: &str) -> Vec<f64> {
        let mut features = Vec::new();
        
        // Feature 1: Presence of suspicious keywords
        let suspicious_keywords = ["malware", "attack", "suspicious", "exploit", "breach", "intrusion"];
        let suspicious_score = suspicious_keywords.iter()
            .map(|&keyword| if event_data.to_lowercase().contains(keyword) { 1.0 } else { 0.0 })
            .sum::<f64>() / suspicious_keywords.len() as f64;
        features.push(suspicious_score);
        
        // Feature 2: Event data length (normalized)
        let length_score = (event_data.len() as f64 / 1000.0).min(1.0);
        features.push(length_score);
        
        // Feature 3: Special character density
        let special_chars = event_data.chars().filter(|c| !c.is_alphanumeric() && !c.is_whitespace()).count();
        let special_score = (special_chars as f64 / event_data.len() as f64).min(1.0);
        features.push(special_score);
        
        // Feature 4: Uppercase ratio
        let uppercase_count = event_data.chars().filter(|c| c.is_uppercase()).count();
        let uppercase_score = (uppercase_count as f64 / event_data.len() as f64).min(1.0);
        features.push(uppercase_score);
        
        // Feature 5: Numeric density
        let numeric_count = event_data.chars().filter(|c| c.is_numeric()).count();
        let numeric_score = (numeric_count as f64 / event_data.len() as f64).min(1.0);
        features.push(numeric_score);
        
        features
    }

    /// Predict threat probability using current model
    fn predict(&self, features: &[f64]) -> f64 {
        let weighted_sum: f64 = features.iter()
            .zip(self.weights.iter())
            .map(|(feature, weight)| feature * weight)
            .sum::<f64>() + self.bias;
        
        // Apply sigmoid activation function
        1.0 / (1.0 + (-weighted_sum).exp())
    }

    /// Update model weights based on feedback (gradient descent)
    fn update_weights(&mut self, features: &[f64], actual: f64, predicted: f64) {
        let error = actual - predicted;
        
        // Update weights using gradient descent
        for (i, feature) in features.iter().enumerate() {
            if i < self.weights.len() {
                self.weights[i] += self.learning_rate * error * feature;
            }
        }
        
        // Update bias
        self.bias += self.learning_rate * error;
        
        // Update feature importance based on weight magnitudes
        for (i, &weight) in self.weights.iter().enumerate() {
            let feature_name = match i {
                0 => "suspicious_keywords",
                1 => "event_length",
                2 => "special_chars",
                3 => "uppercase_ratio",
                4 => "numeric_density",
                _ => "unknown",
            };
            self.feature_importance.insert(feature_name.to_string(), weight.abs());
        }
        
        self.training_samples += 1;
        self.last_trained = Utc::now();
    }

    /// Self-mutate model parameters to explore better solutions
    fn mutate(&mut self) {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        
        // Create a simple pseudo-random number generator based on current time
        let mut hasher = DefaultHasher::new();
        Utc::now().timestamp_millis().hash(&mut hasher);
        let seed = hasher.finish();
        
        // Simple linear congruential generator for mutation
        let mut rng_state = seed;
        
        for weight in &mut self.weights {
            rng_state = rng_state.wrapping_mul(1103515245).wrapping_add(12345);
            let random_val = (rng_state as f64 / u64::MAX as f64 - 0.5) * 2.0; // Range [-1, 1]
            
            if random_val.abs() < self.mutation_rate {
                *weight += random_val * 0.1; // Small mutation
                *weight = weight.max(-1.0).min(1.0); // Clamp weights
            }
        }
        
        // Mutate bias occasionally
        rng_state = rng_state.wrapping_mul(1103515245).wrapping_add(12345);
        let bias_random = (rng_state as f64 / u64::MAX as f64 - 0.5) * 2.0;
        if bias_random.abs() < self.mutation_rate {
            self.bias += bias_random * 0.05;
            self.bias = self.bias.max(-0.5).min(0.5); // Clamp bias
        }
    }

    /// Calculate current accuracy based on recent performance
    fn calculate_accuracy(&self) -> f64 {
        if self.accuracy_history.is_empty() {
            return 0.5; // Default 50%
        }
        
        // Use recent accuracy with some smoothing
        let recent_samples = self.accuracy_history.len().min(10);
        let recent_accuracy: f64 = self.accuracy_history
            .iter()
            .rev()
            .take(recent_samples)
            .sum::<f64>() / recent_samples as f64;
        
        recent_accuracy
    }
}

/// Main threat detection engine
pub struct ThreatDetectionEngine {
    config: DetectionEngineConfig,
    detection_rules: HashMap<String, DetectionRule>,
    custom_rules: HashMap<String, CustomDetectionRule>,
    detection_history: Vec<ThreatDetection>,
    analytics: DetectionAnalytics,
    ml_model: MLDetectionModel,
}

impl ThreatDetectionEngine {
    /// Create a new threat detection engine
    pub fn new(config: DetectionEngineConfig) -> Self {
        Self {
            config,
            detection_rules: HashMap::new(),
            custom_rules: HashMap::new(),
            detection_history: Vec::new(),
            analytics: DetectionAnalytics {
                total_detections: 0,
                detections_by_technique: HashMap::new(),
                detections_by_tactic: HashMap::new(),
                detections_by_severity: HashMap::new(),
                false_positive_rate: 0.0,
                average_detection_time: 0.0,
                top_techniques: Vec::new(),
                detection_trends: Vec::new(),
                accuracy_metrics: AccuracyMetrics {
                    true_positives: 0,
                    false_positives: 0,
                    true_negatives: 0,
                    false_negatives: 0,
                    precision: 0.0,
                    recall: 0.0,
                    f1_score: 0.0,
                    accuracy: 0.0,
                },
            },
            ml_model: MLDetectionModel::new("threat_detection_ml".to_string()),
        }
    }

    /// Process real-time security events for threat detection
    pub fn process_security_event(&mut self, event_data: &str) -> Vec<ThreatDetection> {
        let mut detections = Vec::new();
        
        // Clone the enabled algorithms to avoid borrowing conflicts
        let enabled_algorithms = self.config.enabled_algorithms.clone();

        // Process with different algorithms
        for algorithm in &enabled_algorithms {
            if let Some(detection) = self.apply_detection_algorithm(algorithm, event_data) {
                if detection.confidence_score >= self.config.confidence_threshold {
                    detections.push(detection);
                }
            }
        }

        // Update analytics
        self.update_analytics(&detections);

        // Store detections
        self.detection_history.extend(detections.clone());

        detections
    }

    /// Apply specific detection algorithm to event data
    fn apply_detection_algorithm(&mut self, algorithm: &DetectionAlgorithm, event_data: &str) -> Option<ThreatDetection> {
        match algorithm {
            DetectionAlgorithm::PatternMatching => self.pattern_matching_detection(event_data),
            DetectionAlgorithm::MachineLearning => self.ml_based_detection(event_data),
            DetectionAlgorithm::StatisticalAnalysis => self.statistical_analysis_detection(event_data),
            DetectionAlgorithm::BehavioralAnalysis => self.behavioral_analysis_detection(event_data),
            DetectionAlgorithm::AnomalyDetection => self.anomaly_detection(event_data),
            DetectionAlgorithm::RuleBasedDetection => self.rule_based_detection(event_data),
            DetectionAlgorithm::HeuristicAnalysis => self.heuristic_analysis_detection(event_data),
            DetectionAlgorithm::TimeSeriesAnalysis => self.time_series_analysis_detection(event_data),
        }
    }

    /// Pattern matching based detection
    fn pattern_matching_detection(&self, event_data: &str) -> Option<ThreatDetection> {
        // Simulate pattern matching detection
        if event_data.contains("suspicious_pattern") || event_data.contains("malware_signature") {
            Some(ThreatDetection {
                detection_id: uuid::Uuid::new_v4().to_string(),
                timestamp: Utc::now(),
                technique_id: "T1055".to_string(),
                technique_name: "Process Injection".to_string(),
                tactic: MitreTactic::DefenseEvasion,
                confidence: DetectionConfidence::High,
                confidence_score: 0.85,
                severity: Severity::High,
                algorithm_used: DetectionAlgorithm::PatternMatching,
                raw_data: vec![event_data.to_string()],
                indicators: vec!["suspicious_pattern".to_string()],
                affected_systems: vec!["workstation-001".to_string()],
                network_indicators: vec![],
                file_indicators: vec![],
                process_indicators: vec![],
                registry_indicators: vec![],
                false_positive_probability: 0.15,
                remediation_suggestions: vec!["Isolate affected system".to_string()],
                escalation_required: true,
            })
        } else {
            None
        }
    }

    /// Machine learning based detection with self-learning capabilities
    fn ml_based_detection(&mut self, event_data: &str) -> Option<ThreatDetection> {
        // Extract features from event data
        let features = self.ml_model.extract_features(event_data);
        
        // Get threat probability prediction
        let threat_probability = self.ml_model.predict(&features);
        
        // Dynamic threshold based on model confidence and historical accuracy
        let base_threshold = 0.6;
        let accuracy_factor = self.ml_model.calculate_accuracy();
        let adjusted_threshold = base_threshold * (0.5 + accuracy_factor * 0.5);
        
        // Only create detection if probability exceeds adjusted threshold
        if threat_probability > adjusted_threshold {
            // Determine confidence level based on probability
            let (confidence, confidence_score) = if threat_probability > 0.9 {
                (DetectionConfidence::VeryHigh, threat_probability)
            } else if threat_probability > 0.8 {
                (DetectionConfidence::High, threat_probability)
            } else if threat_probability > 0.7 {
                (DetectionConfidence::Medium, threat_probability)
            } else {
                (DetectionConfidence::Low, threat_probability)
            };
            
            // Determine likely MITRE technique based on feature analysis
            let (technique_id, technique_name, tactic) = self.classify_threat_technique(&features, threat_probability);
            
            // Calculate severity based on threat probability and feature analysis
            let severity = if threat_probability > 0.85 {
                Severity::High
            } else if threat_probability > 0.75 {
                Severity::Medium
            } else {
                Severity::Low
            };
            
            // Generate indicators based on feature analysis
            let indicators = self.generate_ml_indicators(&features, event_data);
            
            Some(ThreatDetection {
                detection_id: uuid::Uuid::new_v4().to_string(),
                timestamp: Utc::now(),
                technique_id,
                technique_name,
                tactic,
                confidence,
                confidence_score,
                severity,
                algorithm_used: DetectionAlgorithm::MachineLearning,
                raw_data: vec![event_data.to_string()],
                indicators,
                affected_systems: vec!["ml-detected-system".to_string()],
                network_indicators: vec![],
                file_indicators: vec![],
                process_indicators: vec![],
                registry_indicators: vec![],
                false_positive_probability: 1.0 - accuracy_factor,
                remediation_suggestions: vec![
                    "ML-based threat detected - investigate indicators".to_string(),
                    format!("Model confidence: {:.2}%", threat_probability * 100.0),
                    "Review event data for suspicious patterns".to_string(),
                ],
                escalation_required: threat_probability > 0.8,
            })
        } else {
            None
        }
    }
    
    /// Classify threat technique based on ML features
    fn classify_threat_technique(&self, features: &[f64], probability: f64) -> (String, String, MitreTactic) {
        // Simple heuristic classification based on feature patterns
        if features.len() >= 5 {
            if features[0] > 0.7 && features[2] > 0.5 {
                // High suspicious keywords + special chars = likely malicious script/code
                ("T1059".to_string(), "Command and Scripting Interpreter".to_string(), MitreTactic::Execution)
            } else if features[1] > 0.8 && features[4] > 0.6 {
                // Long event with high numeric content = potential data exfiltration
                ("T1041".to_string(), "Exfiltration Over C2 Channel".to_string(), MitreTactic::Exfiltration)
            } else if features[0] > 0.5 && features[3] > 0.7 {
                // Suspicious keywords + high uppercase = potential system discovery
                ("T1083".to_string(), "File and Directory Discovery".to_string(), MitreTactic::Discovery)
            } else if probability > 0.8 {
                // High confidence but unclear pattern = potential privilege escalation
                ("T1068".to_string(), "Exploitation for Privilege Escalation".to_string(), MitreTactic::PrivilegeEscalation)
            } else {
                // Default to defense evasion for other patterns
                ("T1027".to_string(), "Obfuscated Files or Information".to_string(), MitreTactic::DefenseEvasion)
            }
        } else {
            ("T1055".to_string(), "Process Injection".to_string(), MitreTactic::DefenseEvasion)
        }
    }
    
    /// Generate ML-based indicators
    fn generate_ml_indicators(&self, features: &[f64], event_data: &str) -> Vec<String> {
        let mut indicators = Vec::new();
        
        if features.len() >= 5 {
            if features[0] > 0.5 {
                indicators.push("suspicious_keywords_detected".to_string());
            }
            if features[1] > 0.7 {
                indicators.push("abnormal_event_length".to_string());
            }
            if features[2] > 0.6 {
                indicators.push("high_special_character_density".to_string());
            }
            if features[3] > 0.8 {
                indicators.push("excessive_uppercase_content".to_string());
            }
            if features[4] > 0.7 {
                indicators.push("high_numeric_density".to_string());
            }
        }
        
        // Add specific patterns found in the data
        if event_data.len() > 500 {
            indicators.push("large_payload_detected".to_string());
        }
        
        indicators.push(format!("ml_threat_probability_{:.0}%", self.ml_model.predict(features) * 100.0));
        
        indicators
    }

    /// Statistical analysis based detection
    fn statistical_analysis_detection(&self, _event_data: &str) -> Option<ThreatDetection> {
        // Simulate statistical analysis detection
        None
    }

    /// Behavioral analysis based detection
    fn behavioral_analysis_detection(&self, _event_data: &str) -> Option<ThreatDetection> {
        // Simulate behavioral analysis detection
        None
    }

    /// Anomaly detection
    fn anomaly_detection(&self, _event_data: &str) -> Option<ThreatDetection> {
        // Simulate anomaly detection
        None
    }

    /// Rule-based detection
    fn rule_based_detection(&self, event_data: &str) -> Option<ThreatDetection> {
        // Apply custom rules
        for rule in self.custom_rules.values() {
            if rule.enabled && self.evaluate_rule_logic(&rule.logic, event_data) {
                return Some(ThreatDetection {
                    detection_id: uuid::Uuid::new_v4().to_string(),
                    timestamp: Utc::now(),
                    technique_id: rule.technique_ids.first().unwrap_or(&"T1000".to_string()).clone(),
                    technique_name: rule.name.clone(),
                    tactic: MitreTactic::Discovery,
                    confidence: DetectionConfidence::Medium,
                    confidence_score: 0.70,
                    severity: rule.severity.clone(),
                    algorithm_used: DetectionAlgorithm::RuleBasedDetection,
                    raw_data: vec![event_data.to_string()],
                    indicators: vec!["custom_rule_match".to_string()],
                    affected_systems: vec!["system-001".to_string()],
                    network_indicators: vec![],
                    file_indicators: vec![],
                    process_indicators: vec![],
                    registry_indicators: vec![],
                    false_positive_probability: 0.20,
                    remediation_suggestions: vec!["Review custom rule match".to_string()],
                    escalation_required: false,
                });
            }
        }
        None
    }

    /// Heuristic analysis based detection
    fn heuristic_analysis_detection(&self, _event_data: &str) -> Option<ThreatDetection> {
        // Simulate heuristic analysis detection
        None
    }

    /// Time series analysis based detection
    fn time_series_analysis_detection(&self, _event_data: &str) -> Option<ThreatDetection> {
        // Simulate time series analysis detection
        None
    }

    /// Evaluate custom rule logic
    fn evaluate_rule_logic(&self, _logic: &str, _event_data: &str) -> bool {
        // Simulate rule logic evaluation
        // In a real implementation, this would parse and evaluate the rule logic
        true
    }

    /// Update analytics based on new detections
    fn update_analytics(&mut self, detections: &[ThreatDetection]) {
        self.analytics.total_detections += detections.len() as u64;

        for detection in detections {
            // Update technique counts
            *self.analytics.detections_by_technique
                .entry(detection.technique_id.clone())
                .or_insert(0) += 1;

            // Update tactic counts
            *self.analytics.detections_by_tactic
                .entry(detection.tactic.clone())
                .or_insert(0) += 1;

            // Update severity counts
            *self.analytics.detections_by_severity
                .entry(detection.severity.clone())
                .or_insert(0) += 1;
        }

        // Update top techniques
        let mut technique_counts: Vec<_> = self.analytics.detections_by_technique.iter().collect();
        technique_counts.sort_by(|a, b| b.1.cmp(a.1));
        self.analytics.top_techniques = technique_counts
            .into_iter()
            .take(10)
            .map(|(k, v)| (k.clone(), *v))
            .collect();
    }

    /// Add custom detection rule
    pub fn add_custom_rule(&mut self, rule: CustomDetectionRule) {
        self.custom_rules.insert(rule.rule_id.clone(), rule);
    }

    /// Get detection analytics
    pub fn get_analytics(&self) -> &DetectionAnalytics {
        &self.analytics
    }

    /// Get recent detections
    pub fn get_recent_detections(&self, limit: usize) -> Vec<&ThreatDetection> {
        self.detection_history
            .iter()
            .rev()
            .take(limit)
            .collect()
    }

    /// Tune detection thresholds based on feedback and self-mutate the ML model
    pub fn tune_thresholds(&mut self, feedback: Vec<DetectionFeedback>) {
        let mut total_feedback = 0;
        let mut correct_predictions = 0;
        let mut ml_feedback_count = 0;
        
        for fb in feedback {
            total_feedback += 1;
            
            // Find the corresponding detection in history
            if let Some(detection) = self.detection_history.iter()
                .find(|d| d.detection_id == fb.detection_id) {
                
                // Process feedback for ML-based detections specifically
                if detection.algorithm_used == DetectionAlgorithm::MachineLearning {
                    ml_feedback_count += 1;
                    
                    // Extract features from the original event data
                    if let Some(event_data) = detection.raw_data.first() {
                        let features = self.ml_model.extract_features(event_data);
                        
                        // Determine the actual label (1.0 for threat, 0.0 for benign)
                        let actual_label = if fb.is_true_positive || (!fb.is_false_positive && !fb.is_true_positive) {
                            1.0 // True positive or uncertain -> treat as threat
                        } else {
                            0.0 // False positive -> treat as benign
                        };
                        
                        // Get the model's prediction for comparison
                        let predicted = self.ml_model.predict(&features);
                        
                        // Update model weights based on feedback
                        self.ml_model.update_weights(&features, actual_label, predicted);
                        
                        // Track if prediction was correct
                        let was_correct = if actual_label > 0.5 && predicted > 0.6 {
                            true // Correctly identified threat
                        } else if actual_label <= 0.5 && predicted <= 0.6 {
                            true // Correctly identified benign
                        } else {
                            false // Incorrect prediction
                        };
                        
                        if was_correct {
                            correct_predictions += 1;
                        }
                        
                        // Update analytics based on feedback
                        if fb.is_true_positive {
                            self.analytics.accuracy_metrics.true_positives += 1;
                        } else if fb.is_false_positive {
                            self.analytics.accuracy_metrics.false_positives += 1;
                        }
                    }
                }
                
                // Apply confidence adjustment if provided
                if fb.confidence_adjustment != 0.0 {
                    // This could be used to adjust the learning rate dynamically
                    let adjustment_factor = (fb.confidence_adjustment.abs() / 100.0).min(1.0);
                    self.ml_model.learning_rate = (self.ml_model.learning_rate * (1.0 + adjustment_factor)).min(0.1);
                }
            }
        }
        
        // Calculate current accuracy and update model performance tracking
        if ml_feedback_count > 0 {
            let current_accuracy = correct_predictions as f64 / ml_feedback_count as f64;
            self.ml_model.accuracy_history.push(current_accuracy);
            
            // Keep only recent accuracy history (last 50 entries)
            if self.ml_model.accuracy_history.len() > 50 {
                self.ml_model.accuracy_history.remove(0);
            }
            
            // Self-mutate if performance is declining
            let recent_performance = self.ml_model.calculate_accuracy();
            if recent_performance < 0.6 && self.ml_model.training_samples > 10 {
                // Trigger mutation to explore better parameter space
                self.ml_model.mutate();
                
                // Reset some tracking to give the mutated model a chance
                if self.ml_model.accuracy_history.len() > 10 {
                    // Keep only the last few entries to allow for new learning
                    let keep_count = 5;
                    let keep_start = self.ml_model.accuracy_history.len() - keep_count;
                    self.ml_model.accuracy_history = self.ml_model.accuracy_history[keep_start..].to_vec();
                }
            }
            
            // Adaptive learning rate based on performance
            if recent_performance > 0.8 {
                // Good performance, reduce learning rate for stability
                self.ml_model.learning_rate *= 0.95;
            } else if recent_performance < 0.5 {
                // Poor performance, increase learning rate for faster adaptation
                self.ml_model.learning_rate *= 1.05;
            }
            
            // Clamp learning rate to reasonable bounds
            self.ml_model.learning_rate = self.ml_model.learning_rate.max(0.001).min(0.1);
            
            // Update overall analytics
            let total_tp = self.analytics.accuracy_metrics.true_positives;
            let total_fp = self.analytics.accuracy_metrics.false_positives;
            if total_tp + total_fp > 0 {
                self.analytics.accuracy_metrics.precision = total_tp as f64 / (total_tp + total_fp) as f64;
                self.analytics.false_positive_rate = total_fp as f64 / (total_tp + total_fp) as f64;
            }
        }
        
        // Periodic self-improvement trigger
        if self.ml_model.training_samples % 20 == 0 && self.ml_model.training_samples > 0 {
            // Every 20 feedback samples, evaluate if mutation might help
            let avg_accuracy = self.ml_model.calculate_accuracy();
            if avg_accuracy < 0.7 {
                // Consider more aggressive mutation
                let old_mutation_rate = self.ml_model.mutation_rate;
                self.ml_model.mutation_rate = (old_mutation_rate * 1.2).min(0.15);
                self.ml_model.mutate();
                self.ml_model.mutation_rate = old_mutation_rate; // Restore original rate
            }
        }
    }
    
    /// Get ML model status and performance metrics
    pub fn get_ml_model_status(&self) -> HashMap<String, serde_json::Value> {
        let mut status = HashMap::new();
        
        status.insert("model_id".to_string(), serde_json::Value::String(self.ml_model.model_id.clone()));
        status.insert("training_samples".to_string(), serde_json::Value::Number(serde_json::Number::from(self.ml_model.training_samples)));
        status.insert("learning_rate".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(self.ml_model.learning_rate).unwrap_or(serde_json::Number::from(0))));
        status.insert("current_accuracy".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(self.ml_model.calculate_accuracy()).unwrap_or(serde_json::Number::from(0))));
        status.insert("mutation_rate".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(self.ml_model.mutation_rate).unwrap_or(serde_json::Number::from(0))));
        status.insert("last_trained".to_string(), serde_json::Value::String(self.ml_model.last_trained.to_rfc3339()));
        
        // Convert weights to JSON array
        let weights_json: Vec<serde_json::Value> = self.ml_model.weights.iter()
            .map(|&w| serde_json::Value::Number(serde_json::Number::from_f64(w).unwrap_or(serde_json::Number::from(0))))
            .collect();
        status.insert("weights".to_string(), serde_json::Value::Array(weights_json));
        
        // Convert feature importance to JSON object
        let mut importance_json = serde_json::Map::new();
        for (feature, importance) in &self.ml_model.feature_importance {
            importance_json.insert(feature.clone(), serde_json::Value::Number(serde_json::Number::from_f64(*importance).unwrap_or(serde_json::Number::from(0))));
        }
        status.insert("feature_importance".to_string(), serde_json::Value::Object(importance_json));
        
        // Recent accuracy trend
        let recent_accuracy: Vec<serde_json::Value> = self.ml_model.accuracy_history.iter()
            .map(|&acc| serde_json::Value::Number(serde_json::Number::from_f64(acc).unwrap_or(serde_json::Number::from(0))))
            .collect();
        status.insert("accuracy_history".to_string(), serde_json::Value::Array(recent_accuracy));
        
        status
    }
    
    /// Force model evolution/mutation for experimentation
    pub fn evolve_model(&mut self) -> bool {
        let old_accuracy = self.ml_model.calculate_accuracy();
        
        // Create a backup of current weights
        let backup_weights = self.ml_model.weights.clone();
        let backup_bias = self.ml_model.bias;
        
        // Apply mutation
        self.ml_model.mutate();
        
        // Simulate a quick performance check (in real implementation, this would use validation data)
        let new_accuracy = self.ml_model.calculate_accuracy();
        
        // If the new model seems potentially worse, there's a chance to revert
        // But we allow some exploration even if accuracy seems to decrease initially
        if old_accuracy > 0.7 && new_accuracy < old_accuracy * 0.8 {
            // 20% chance to revert if accuracy drops significantly
            use std::collections::hash_map::DefaultHasher;
            use std::hash::{Hash, Hasher};
            
            let mut hasher = DefaultHasher::new();
            Utc::now().timestamp_millis().hash(&mut hasher);
            let random_val = (hasher.finish() % 5) as f64 / 5.0; // 0-1 range
            
            if random_val < 0.2 {
                // Revert mutation
                self.ml_model.weights = backup_weights;
                self.ml_model.bias = backup_bias;
                return false;
            }
        }
        
        true
    }
}

/// Detection feedback for tuning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionFeedback {
    pub detection_id: String,
    pub is_true_positive: bool,
    pub is_false_positive: bool,
    pub analyst_notes: String,
    pub confidence_adjustment: f64,
}

/// NAPI wrapper for JavaScript bindings
#[napi]
pub struct ThreatDetectionEngineNapi {
    inner: ThreatDetectionEngine,
}

#[napi]
impl ThreatDetectionEngineNapi {
    #[napi(constructor)]
    pub fn new(config_json: String) -> Result<Self> {
        let config: DetectionEngineConfig = serde_json::from_str(&config_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse config: {}", e)))?;
        
        Ok(Self {
            inner: ThreatDetectionEngine::new(config),
        })
    }

    #[napi]
    pub fn process_security_event(&mut self, event_data: String) -> Result<String> {
        let detections = self.inner.process_security_event(&event_data);
        serde_json::to_string(&detections)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize detections: {}", e)))
    }

    #[napi]
    pub fn add_custom_rule(&mut self, rule_json: String) -> Result<()> {
        let rule: CustomDetectionRule = serde_json::from_str(&rule_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse rule: {}", e)))?;
        
        self.inner.add_custom_rule(rule);
        Ok(())
    }

    #[napi]
    pub fn get_analytics(&self) -> Result<String> {
        serde_json::to_string(self.inner.get_analytics())
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize analytics: {}", e)))
    }

    #[napi]
    pub fn get_recent_detections(&self, limit: u32) -> Result<String> {
        let detections = self.inner.get_recent_detections(limit as usize);
        serde_json::to_string(&detections)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize detections: {}", e)))
    }

    #[napi]
    pub fn tune_thresholds(&mut self, feedback_json: String) -> Result<()> {
        let feedback: Vec<DetectionFeedback> = serde_json::from_str(&feedback_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse feedback: {}", e)))?;
        
        self.inner.tune_thresholds(feedback);
        Ok(())
    }
    
    #[napi]
    pub fn get_ml_model_status(&self) -> Result<String> {
        let status = self.inner.get_ml_model_status();
        serde_json::to_string(&status)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize ML status: {}", e)))
    }
    
    #[napi]
    pub fn evolve_model(&mut self) -> Result<bool> {
        Ok(self.inner.evolve_model())
    }
}

impl Default for DetectionEngineConfig {
    fn default() -> Self {
        Self {
            enabled_algorithms: vec![
                DetectionAlgorithm::PatternMatching,
                DetectionAlgorithm::RuleBasedDetection,
                DetectionAlgorithm::BehavioralAnalysis,
            ],
            confidence_threshold: 0.6,
            false_positive_threshold: 0.3,
            real_time_processing: true,
            batch_size: 1000,
            retention_days: 90,
            alert_escalation_threshold: 0.8,
            custom_rules: Vec::new(),
        }
    }
}