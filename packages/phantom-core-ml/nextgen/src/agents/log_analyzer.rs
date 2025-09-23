use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use regex::Regex;

#[derive(Debug, Clone)]
#[napi]
pub struct LogAnalyzerAgent {
    name: String,
    version: String,
    patterns: Vec<LogPattern>,
}

#[napi]
impl LogAnalyzerAgent {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            name: "LogAnalyzerAgent".to_string(),
            version: "1.0.0".to_string(),
            patterns: Self::init_patterns(),
        }
    }

    fn init_patterns() -> Vec<LogPattern> {
        vec![
            LogPattern {
                name: "Error".to_string(),
                pattern: r"(?i)(error|exception|fail)".to_string(),
                severity: "ERROR".to_string(),
            },
            LogPattern {
                name: "Warning".to_string(),
                pattern: r"(?i)(warn|warning)".to_string(),
                severity: "WARNING".to_string(),
            },
            LogPattern {
                name: "Info".to_string(),
                pattern: r"(?i)(info|information)".to_string(),
                severity: "INFO".to_string(),
            },
        ]
    }

    #[napi]
    pub async fn analyze_logs(&self, logs: Vec<String>) -> LogAnalysis {
        let mut analysis = LogAnalysis {
            total_lines: logs.len() as i32,
            error_count: 0,
            warning_count: 0,
            info_count: 0,
            patterns_found: HashMap::new(),
            anomalies: Vec::new(),
            time_series: Vec::new(),
        };

        for log in &logs {
            for pattern in &self.patterns {
                let regex = Regex::new(&pattern.pattern).unwrap();
                if regex.is_match(log) {
                    match pattern.severity.as_str() {
                        "ERROR" => analysis.error_count += 1,
                        "WARNING" => analysis.warning_count += 1,
                        "INFO" => analysis.info_count += 1,
                        _ => {}
                    }
                    *analysis.patterns_found.entry(pattern.name.clone()).or_insert(0) += 1;
                }
            }
        }

        analysis
    }

    #[napi]
    pub fn extract_timestamps(&self, logs: Vec<String>) -> Vec<LogEntry> {
        let timestamp_regex = Regex::new(r"(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})").unwrap();
        let mut entries = Vec::new();

        for log in logs {
            let timestamp = if let Some(caps) = timestamp_regex.captures(&log) {
                caps[1].to_string()
            } else {
                String::new()
            };

            entries.push(LogEntry {
                timestamp,
                level: self.detect_level(&log),
                message: log,
                metadata: HashMap::new(),
            });
        }

        entries
    }

    fn detect_level(&self, log: &str) -> String {
        for pattern in &self.patterns {
            let regex = Regex::new(&pattern.pattern).unwrap();
            if regex.is_match(log) {
                return pattern.severity.clone();
            }
        }
        "DEBUG".to_string()
    }

    #[napi]
    pub fn detect_anomalies(&self, logs: Vec<String>) -> Vec<Anomaly> {
        let mut anomalies = Vec::new();

        let rate_spike_threshold = 10;
        let mut error_count = 0;
        let mut last_error_index = 0;

        for (i, log) in logs.iter().enumerate() {
            if log.to_lowercase().contains("error") {
                error_count += 1;
                if i - last_error_index < rate_spike_threshold && error_count > 5 {
                    anomalies.push(Anomaly {
                        anomaly_type: "Error Spike".to_string(),
                        severity: "HIGH".to_string(),
                        description: format!("Rapid error rate detected: {} errors in {} lines", error_count, i - last_error_index),
                        line_numbers: vec![last_error_index as i32, i as i32],
                    });
                }
                last_error_index = i;
            }
        }

        anomalies
    }

    #[napi]
    pub fn generate_report(&self, analysis: &LogAnalysis) -> String {
        let mut report = String::new();

        report.push_str("# Log Analysis Report\n\n");
        report.push_str("## Summary\n");
        report.push_str(&format!("- Total Lines: {}\n", analysis.total_lines));
        report.push_str(&format!("- Errors: {}\n", analysis.error_count));
        report.push_str(&format!("- Warnings: {}\n", analysis.warning_count));
        report.push_str(&format!("- Info: {}\n\n", analysis.info_count));

        if !analysis.patterns_found.is_empty() {
            report.push_str("## Patterns Found\n");
            for (pattern, count) in &analysis.patterns_found {
                report.push_str(&format!("- {}: {}\n", pattern, count));
            }
            report.push_str("\n");
        }

        if !analysis.anomalies.is_empty() {
            report.push_str("## Anomalies Detected\n");
            for anomaly in &analysis.anomalies {
                report.push_str(&format!("- **{}** ({}): {}\n", anomaly.anomaly_type, anomaly.severity, anomaly.description));
            }
        }

        report
    }

    #[napi]
    pub fn create_alert_rule(&self, name: String, condition: String, threshold: i32) -> AlertRule {
        AlertRule {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            condition,
            threshold,
            action: "notify".to_string(),
            enabled: true,
        }
    }
}

#[derive(Debug, Clone)]
struct LogPattern {
    name: String,
    pattern: String,
    severity: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct LogAnalysis {
    pub total_lines: i32,
    pub error_count: i32,
    pub warning_count: i32,
    pub info_count: i32,
    pub patterns_found: HashMap<String, i32>,
    pub anomalies: Vec<Anomaly>,
    pub time_series: Vec<TimeSeriesPoint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct LogEntry {
    pub timestamp: String,
    pub level: String,
    pub message: String,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct Anomaly {
    pub anomaly_type: String,
    pub severity: String,
    pub description: String,
    pub line_numbers: Vec<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct TimeSeriesPoint {
    pub timestamp: String,
    pub value: f32,
    pub label: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct AlertRule {
    pub id: String,
    pub name: String,
    pub condition: String,
    pub threshold: i32,
    pub action: String,
    pub enabled: bool,
}