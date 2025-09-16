//! Log Analyzer Plugin Example
//!
//! Demonstrates a practical plugin that analyzes log files for patterns,
//! errors, and performance metrics.

use super::*;
use regex::Regex;
use std::collections::HashMap;
use std::path::Path;
use tokio::fs;
use tokio::io::{AsyncBufReadExt, BufReader};

/// Log analyzer plugin for processing and analyzing log files
pub struct LogAnalyzerPlugin {
    pub base: BasePlugin,
    error_patterns: Vec<Regex>,
    warning_patterns: Vec<Regex>,
    performance_patterns: Vec<Regex>,
}

impl LogAnalyzerPlugin {
    pub fn new(metadata: PluginMetadata) -> Self {
        let error_patterns = vec![
            Regex::new(r"(?i)\b(error|fatal|exception|panic|crash)\b").unwrap(),
            Regex::new(r"(?i)\b(failed|failure|abort|timeout)\b").unwrap(),
            Regex::new(r"\b5\d{2}\b").unwrap(), // HTTP 5xx errors
        ];

        let warning_patterns = vec![
            Regex::new(r"(?i)\b(warn|warning|deprecated)\b").unwrap(),
            Regex::new(r"\b4\d{2}\b").unwrap(), // HTTP 4xx errors
            Regex::new(r"(?i)\b(retry|retrying)\b").unwrap(),
        ];

        let performance_patterns = vec![
            Regex::new(r"(?i)(?:took|duration|elapsed):\s*(\d+(?:\.\d+)?)\s*(ms|sec|s)").unwrap(),
            Regex::new(r"(?i)response\s+time:\s*(\d+(?:\.\d+)?)\s*(ms|sec|s)").unwrap(),
            Regex::new(r"(?i)memory\s+usage:\s*(\d+(?:\.\d+)?)\s*(mb|gb|bytes?)").unwrap(),
        ];

        Self {
            base: BasePlugin::new(metadata),
            error_patterns,
            warning_patterns,
            performance_patterns,
        }
    }

    /// Analyze a log file and extract insights
    async fn analyze_log_file(&self, file_path: &Path) -> PluginResult<LogAnalysisResult> {
        let file = fs::File::open(file_path).await?;
        let reader = BufReader::new(file);
        let mut lines = reader.lines();

        let mut analysis = LogAnalysisResult {
            file_path: file_path.to_string_lossy().to_string(),
            total_lines: 0,
            error_count: 0,
            warning_count: 0,
            errors: Vec::new(),
            warnings: Vec::new(),
            performance_metrics: Vec::new(),
            patterns_found: HashMap::new(),
            summary: String::new(),
        };

        let mut line_number = 0;

        while let Some(line) = lines.next_line().await? {
            line_number += 1;
            analysis.total_lines += 1;

            // Check for errors
            for pattern in &self.error_patterns {
                if pattern.is_match(&line) {
                    analysis.error_count += 1;
                    analysis.errors.push(LogEntry {
                        line_number,
                        content: line.clone(),
                        timestamp: self.extract_timestamp(&line),
                        level: "ERROR".to_string(),
                        category: self.categorize_error(&line),
                    });
                    break;
                }
            }

            // Check for warnings
            for pattern in &self.warning_patterns {
                if pattern.is_match(&line) {
                    analysis.warning_count += 1;
                    analysis.warnings.push(LogEntry {
                        line_number,
                        content: line.clone(),
                        timestamp: self.extract_timestamp(&line),
                        level: "WARN".to_string(),
                        category: self.categorize_warning(&line),
                    });
                    break;
                }
            }

            // Extract performance metrics
            for pattern in &self.performance_patterns {
                if let Some(captures) = pattern.captures(&line) {
                    if let (Some(value), Some(unit)) = (captures.get(1), captures.get(2)) {
                        if let Ok(parsed_value) = value.as_str().parse::<f64>() {
                            analysis.performance_metrics.push(PerformanceMetric {
                                line_number,
                                metric_type: "duration".to_string(),
                                value: parsed_value,
                                unit: unit.as_str().to_string(),
                                context: line.clone(),
                            });
                        }
                    }
                }
            }

            // Track pattern frequencies
            for pattern in &self.error_patterns {
                if pattern.is_match(&line) {
                    let key = format!("error_pattern_{}", pattern.as_str());
                    *analysis.patterns_found.entry(key).or_insert(0) += 1;
                }
            }
        }

        // Generate summary
        analysis.summary = self.generate_summary(&analysis);

        Ok(analysis)
    }

    /// Extract timestamp from log line (simplified)
    fn extract_timestamp(&self, line: &str) -> Option<String> {
        // Common timestamp patterns
        let timestamp_patterns = [
            Regex::new(r"\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}").unwrap(),
            Regex::new(r"\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}").unwrap(),
            Regex::new(r"\w{3} \d{1,2} \d{2}:\d{2}:\d{2}").unwrap(),
        ];

        for pattern in &timestamp_patterns {
            if let Some(captures) = pattern.find(line) {
                return Some(captures.as_str().to_string());
            }
        }

        None
    }

    /// Categorize error types
    fn categorize_error(&self, line: &str) -> String {
        if line.to_lowercase().contains("database") || line.to_lowercase().contains("sql") {
            "Database".to_string()
        } else if line.to_lowercase().contains("network") || line.to_lowercase().contains("connection") {
            "Network".to_string()
        } else if line.to_lowercase().contains("authentication") || line.to_lowercase().contains("auth") {
            "Authentication".to_string()
        } else if line.to_lowercase().contains("permission") || line.to_lowercase().contains("access") {
            "Permission".to_string()
        } else if line.contains("5") && (line.contains("00") || line.contains("01") || line.contains("02")) {
            "HTTP Server Error".to_string()
        } else {
            "General".to_string()
        }
    }

    /// Categorize warning types
    fn categorize_warning(&self, line: &str) -> String {
        if line.to_lowercase().contains("deprecated") {
            "Deprecation".to_string()
        } else if line.to_lowercase().contains("retry") {
            "Retry".to_string()
        } else if line.contains("4") && (line.contains("00") || line.contains("01") || line.contains("04")) {
            "HTTP Client Error".to_string()
        } else {
            "General".to_string()
        }
    }

    /// Generate analysis summary
    fn generate_summary(&self, analysis: &LogAnalysisResult) -> String {
        let error_rate = (analysis.error_count as f64 / analysis.total_lines as f64) * 100.0;
        let warning_rate = (analysis.warning_count as f64 / analysis.total_lines as f64) * 100.0;

        let avg_response_time = analysis.performance_metrics
            .iter()
            .filter(|m| m.metric_type == "duration")
            .map(|m| m.value)
            .fold(0.0, |acc, val| acc + val) / analysis.performance_metrics.len().max(1) as f64;

        format!(
            "Log Analysis Summary:\n\
            - Total lines processed: {}\n\
            - Errors found: {} ({:.2}% of total)\n\
            - Warnings found: {} ({:.2}% of total)\n\
            - Performance metrics captured: {}\n\
            - Average response time: {:.2}ms\n\
            - Health status: {}",
            analysis.total_lines,
            analysis.error_count,
            error_rate,
            analysis.warning_count,
            warning_rate,
            analysis.performance_metrics.len(),
            avg_response_time,
            if error_rate > 5.0 { "Poor" } else if error_rate > 1.0 { "Fair" } else { "Good" }
        )
    }

    /// Process multiple log files in a directory
    async fn analyze_log_directory(&self, directory: &Path) -> PluginResult<Vec<LogAnalysisResult>> {
        let mut results = Vec::new();
        let mut entries = fs::read_dir(directory).await?;

        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            if path.is_file() {
                if let Some(extension) = path.extension() {
                    if extension == "log" || extension == "txt" {
                        match self.analyze_log_file(&path).await {
                            Ok(analysis) => results.push(analysis),
                            Err(e) => {
                                tracing::warn!("Failed to analyze log file {:?}: {}", path, e);
                            }
                        }
                    }
                }
            }
        }

        Ok(results)
    }
}

impl_plugin_base!(LogAnalyzerPlugin);

#[async_trait]
impl Plugin for LogAnalyzerPlugin {
    async fn execute(&self, input: PluginExecutionInput) -> PluginResult<PluginExecutionResult> {
        let start_time = std::time::Instant::now();

        let result = match input.operation.as_str() {
            "analyze_file" => {
                let file_path = input.data.get("file_path")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| PluginError::ConfigurationInvalid {
                        field: "file_path is required".to_string(),
                    })?;

                let analysis = self.analyze_log_file(Path::new(file_path)).await?;
                serde_json::to_value(analysis)?
            }
            "analyze_directory" => {
                let directory_path = input.data.get("directory_path")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| PluginError::ConfigurationInvalid {
                        field: "directory_path is required".to_string(),
                    })?;

                let analyses = self.analyze_log_directory(Path::new(directory_path)).await?;
                serde_json::to_value(analyses)?
            }
            "get_patterns" => {
                let patterns = LogPatterns {
                    error_patterns: self.error_patterns.iter().map(|r| r.as_str().to_string()).collect(),
                    warning_patterns: self.warning_patterns.iter().map(|r| r.as_str().to_string()).collect(),
                    performance_patterns: self.performance_patterns.iter().map(|r| r.as_str().to_string()).collect(),
                };
                serde_json::to_value(patterns)?
            }
            _ => {
                return Err(PluginError::ExecutionFailed {
                    error: format!("Unknown operation: {}", input.operation),
                });
            }
        };

        let execution_time = start_time.elapsed().as_millis() as u64;

        Ok(PluginExecutionResult {
            plugin_id: self.base.metadata.id.clone(),
            execution_id: input.context.execution_id,
            success: true,
            result: Some(result),
            error: None,
            warnings: Vec::new(),
            logs: Vec::new(),
            execution_time_ms: execution_time,
            memory_used_bytes: 5 * 1024 * 1024, // 5MB estimate
            cpu_time_ms: execution_time / 5,
            created_files: Vec::new(),
            network_requests: 0,
            metadata: HashMap::new(),
        })
    }

    fn capabilities(&self) -> Vec<PluginCapability> {
        vec![
            PluginCapability::FileProcessing {
                supported_formats: vec!["log".to_string(), "txt".to_string()],
                batch_processing: true,
            },
            PluginCapability::DataProcessing {
                input_formats: vec!["text".to_string()],
                output_formats: vec!["json".to_string()],
            },
            PluginCapability::Custom {
                name: "log_analysis".to_string(),
                description: "Advanced log file analysis and pattern matching".to_string(),
                properties: {
                    let mut props = HashMap::new();
                    props.insert("supports_real_time".to_string(), serde_json::json!(false));
                    props.insert("supports_streaming".to_string(), serde_json::json!(false));
                    props.insert("max_file_size".to_string(), serde_json::json!("100MB"));
                    props
                },
            },
        ]
    }

    fn validate_config(&self, config: &HashMap<String, serde_json::Value>) -> PluginResult<()> {
        if let Some(enabled) = config.get("enabled") {
            if !enabled.is_boolean() {
                return Err(PluginError::ConfigurationInvalid {
                    field: "enabled must be a boolean".to_string(),
                });
            }
        }

        if let Some(log_level) = config.get("log_level") {
            if let Some(level_str) = log_level.as_str() {
                if !matches!(level_str, "debug" | "info" | "warn" | "error") {
                    return Err(PluginError::ConfigurationInvalid {
                        field: "log_level must be one of: debug, info, warn, error".to_string(),
                    });
                }
            } else {
                return Err(PluginError::ConfigurationInvalid {
                    field: "log_level must be a string".to_string(),
                });
            }
        }

        Ok(())
    }
}

/// Result of log file analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogAnalysisResult {
    pub file_path: String,
    pub total_lines: u64,
    pub error_count: u64,
    pub warning_count: u64,
    pub errors: Vec<LogEntry>,
    pub warnings: Vec<LogEntry>,
    pub performance_metrics: Vec<PerformanceMetric>,
    pub patterns_found: HashMap<String, u64>,
    pub summary: String,
}

/// Individual log entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub line_number: u64,
    pub content: String,
    pub timestamp: Option<String>,
    pub level: String,
    pub category: String,
}

/// Performance metric extracted from logs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetric {
    pub line_number: u64,
    pub metric_type: String,
    pub value: f64,
    pub unit: String,
    pub context: String,
}

/// Available log analysis patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogPatterns {
    pub error_patterns: Vec<String>,
    pub warning_patterns: Vec<String>,
    pub performance_patterns: Vec<String>,
}