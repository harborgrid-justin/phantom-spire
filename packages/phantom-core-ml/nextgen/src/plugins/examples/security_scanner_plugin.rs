//! Security Scanner Plugin Example
//!
//! Demonstrates a security-focused plugin that scans code for vulnerabilities,
//! integrates with the existing security audit agent, and provides threat detection.

use super::*;
use regex::Regex;
use std::collections::HashMap;
use std::path::Path;
use tokio::fs;

/// Security scanner plugin for vulnerability detection and code analysis
pub struct SecurityScannerPlugin {
    pub base: BasePlugin,
    vulnerability_patterns: Vec<VulnerabilityPattern>,
    security_rules: Vec<SecurityRule>,
}

impl SecurityScannerPlugin {
    pub fn new(metadata: PluginMetadata) -> Self {
        let vulnerability_patterns = vec![
            VulnerabilityPattern {
                id: "SQL_INJECTION".to_string(),
                name: "SQL Injection".to_string(),
                pattern: Regex::new(r#"(?i)(SELECT|INSERT|UPDATE|DELETE).*(\+|\||&).*(\$|\?|:)"#).unwrap(),
                severity: VulnerabilitySeverity::Critical,
                description: "Potential SQL injection vulnerability detected".to_string(),
                cwe_id: Some("CWE-89".to_string()),
            },
            VulnerabilityPattern {
                id: "XSS".to_string(),
                name: "Cross-Site Scripting".to_string(),
                pattern: Regex::new(r"(?i)innerHTML.*\+|document\.write.*\+|eval\(").unwrap(),
                severity: VulnerabilitySeverity::High,
                description: "Potential XSS vulnerability detected".to_string(),
                cwe_id: Some("CWE-79".to_string()),
            },
            VulnerabilityPattern {
                id: "HARDCODED_SECRET".to_string(),
                name: "Hardcoded Secrets".to_string(),
                pattern: Regex::new(r#"(?i)(api[_-]?key|secret|password|token)\s*=\s*["'][^"']+["']"#).unwrap(),
                severity: VulnerabilitySeverity::Critical,
                description: "Hardcoded secret detected".to_string(),
                cwe_id: Some("CWE-798".to_string()),
            },
            VulnerabilityPattern {
                id: "PATH_TRAVERSAL".to_string(),
                name: "Path Traversal".to_string(),
                pattern: Regex::new(r"\.\.[\\/]").unwrap(),
                severity: VulnerabilitySeverity::High,
                description: "Potential path traversal vulnerability detected".to_string(),
                cwe_id: Some("CWE-22".to_string()),
            },
            VulnerabilityPattern {
                id: "COMMAND_INJECTION".to_string(),
                name: "Command Injection".to_string(),
                pattern: Regex::new(r"(?i)(system|exec|shell_exec|passthru)\s*\(.*\$").unwrap(),
                severity: VulnerabilitySeverity::Critical,
                description: "Potential command injection vulnerability detected".to_string(),
                cwe_id: Some("CWE-78".to_string()),
            },
        ];

        let security_rules = vec![
            SecurityRule {
                id: "UNSAFE_FUNCTION".to_string(),
                name: "Unsafe Function Usage".to_string(),
                pattern: Regex::new(r"(?i)\b(gets|strcpy|strcat|sprintf|scanf)\b").unwrap(),
                severity: VulnerabilitySeverity::Medium,
                description: "Usage of potentially unsafe function".to_string(),
                recommendation: "Consider using safer alternatives".to_string(),
            },
            SecurityRule {
                id: "WEAK_CRYPTO".to_string(),
                name: "Weak Cryptographic Algorithm".to_string(),
                pattern: Regex::new(r"(?i)\b(md5|sha1|des|rc4)\b").unwrap(),
                severity: VulnerabilitySeverity::Medium,
                description: "Usage of weak cryptographic algorithm".to_string(),
                recommendation: "Use stronger cryptographic algorithms like SHA-256 or AES".to_string(),
            },
            SecurityRule {
                id: "DEBUG_INFO".to_string(),
                name: "Debug Information Exposure".to_string(),
                pattern: Regex::new(r"(?i)\b(console\.log|print|debug|trace)\b.*\b(password|secret|key|token)\b").unwrap(),
                severity: VulnerabilitySeverity::Low,
                description: "Potential information disclosure through debug output".to_string(),
                recommendation: "Remove debug statements containing sensitive information".to_string(),
            },
        ];

        Self {
            base: BasePlugin::new(metadata),
            vulnerability_patterns,
            security_rules,
        }
    }

    /// Scan a single file for security vulnerabilities
    async fn scan_file(&self, file_path: &Path) -> PluginResult<FileScanResult> {
        let content = fs::read_to_string(file_path).await?;
        let mut findings = Vec::new();

        // Scan for vulnerabilities
        for (line_num, line) in content.lines().enumerate() {
            // Check vulnerability patterns
            for pattern in &self.vulnerability_patterns {
                if pattern.pattern.is_match(line) {
                    findings.push(SecurityFinding {
                        id: format!("{}_{}", pattern.id, line_num + 1),
                        vulnerability_id: pattern.id.clone(),
                        name: pattern.name.clone(),
                        severity: pattern.severity.clone(),
                        description: pattern.description.clone(),
                        file_path: file_path.to_string_lossy().to_string(),
                        line_number: line_num + 1,
                        line_content: line.to_string(),
                        cwe_id: pattern.cwe_id.clone(),
                        remediation: self.get_remediation_advice(&pattern.id),
                        confidence: self.calculate_confidence(line, &pattern.pattern),
                    });
                }
            }

            // Check security rules
            for rule in &self.security_rules {
                if rule.pattern.is_match(line) {
                    findings.push(SecurityFinding {
                        id: format!("{}_{}", rule.id, line_num + 1),
                        vulnerability_id: rule.id.clone(),
                        name: rule.name.clone(),
                        severity: rule.severity.clone(),
                        description: rule.description.clone(),
                        file_path: file_path.to_string_lossy().to_string(),
                        line_number: line_num + 1,
                        line_content: line.to_string(),
                        cwe_id: None,
                        remediation: Some(rule.recommendation.clone()),
                        confidence: self.calculate_confidence(line, &rule.pattern),
                    });
                }
            }
        }

        // Calculate file risk score
        let risk_score = self.calculate_file_risk_score(&findings);

        Ok(FileScanResult {
            file_path: file_path.to_string_lossy().to_string(),
            findings,
            risk_score,
            lines_scanned: content.lines().count() as u64,
            scan_duration_ms: 0, // Will be set by caller
        })
    }

    /// Scan a directory of files
    async fn scan_directory(&self, directory: &Path, recursive: bool) -> PluginResult<SecurityScanReport> {
        let start_time = std::time::Instant::now();
        let mut file_results = Vec::new();
        let mut total_files = 0;

        if recursive {
            self.scan_directory_recursive(directory, &mut file_results, &mut total_files).await?;
        } else {
            let mut entries = fs::read_dir(directory).await?;
            while let Some(entry) = entries.next_entry().await? {
                let path = entry.path();
                if path.is_file() && self.should_scan_file(&path) {
                    total_files += 1;
                    match self.scan_file(&path).await {
                        Ok(mut result) => {
                            result.scan_duration_ms = start_time.elapsed().as_millis() as u64;
                            file_results.push(result);
                        }
                        Err(e) => {
                            tracing::warn!("Failed to scan file {:?}: {}", path, e);
                        }
                    }
                }
            }
        }

        let scan_duration = start_time.elapsed();
        let summary = self.generate_scan_summary(&file_results);

        Ok(SecurityScanReport {
            scan_id: Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            directory_path: directory.to_string_lossy().to_string(),
            total_files: total_files,
            scanned_files: file_results.len() as u64,
            file_results,
            summary,
            scan_duration_ms: scan_duration.as_millis() as u64,
            recommendations: self.generate_recommendations(&summary),
        })
    }

    /// Recursively scan directory
    async fn scan_directory_recursive(
        &self,
        directory: &Path,
        file_results: &mut Vec<FileScanResult>,
        total_files: &mut u64,
    ) -> PluginResult<()> {
        let mut entries = fs::read_dir(directory).await?;
        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            if path.is_file() && self.should_scan_file(&path) {
                *total_files += 1;
                match self.scan_file(&path).await {
                    Ok(result) => file_results.push(result),
                    Err(e) => {
                        tracing::warn!("Failed to scan file {:?}: {}", path, e);
                    }
                }
            } else if path.is_dir() && !self.should_skip_directory(&path) {
                self.scan_directory_recursive(&path, file_results, total_files).await?;
            }
        }
        Ok(())
    }

    /// Determine if file should be scanned
    fn should_scan_file(&self, path: &Path) -> bool {
        if let Some(extension) = path.extension() {
            let ext = extension.to_string_lossy().to_lowercase();
            matches!(ext.as_str(),
                "rs" | "js" | "ts" | "py" | "java" | "cpp" | "c" | "h" |
                "php" | "go" | "rb" | "cs" | "swift" | "kt" | "scala"
            )
        } else {
            false
        }
    }

    /// Determine if directory should be skipped
    fn should_skip_directory(&self, path: &Path) -> bool {
        if let Some(name) = path.file_name() {
            let name_str = name.to_string_lossy().to_lowercase();
            matches!(name_str.as_str(),
                "node_modules" | "target" | ".git" | "build" | "dist" |
                "vendor" | ".vscode" | ".idea" | "bin" | "obj"
            )
        } else {
            false
        }
    }

    /// Calculate confidence score for a match
    fn calculate_confidence(&self, line: &str, pattern: &Regex) -> f64 {
        // Simple heuristic - more specific patterns get higher confidence
        let pattern_specificity = pattern.as_str().len() as f64 / 100.0;
        let context_bonus = if line.contains("//") || line.contains("/*") { -0.2 } else { 0.0 }; // Lower confidence for comments

        (0.5 + pattern_specificity + context_bonus).min(1.0).max(0.1)
    }

    /// Calculate risk score for a file based on its findings
    fn calculate_file_risk_score(&self, findings: &[SecurityFinding]) -> u8 {
        let mut score = 0;

        for finding in findings {
            let points = match finding.severity {
                VulnerabilitySeverity::Critical => 25,
                VulnerabilitySeverity::High => 15,
                VulnerabilitySeverity::Medium => 8,
                VulnerabilitySeverity::Low => 3,
            };
            score += (points as f64 * finding.confidence) as u8;
        }

        score.min(100)
    }

    /// Get remediation advice for a vulnerability type
    fn get_remediation_advice(&self, vulnerability_id: &str) -> Option<String> {
        match vulnerability_id {
            "SQL_INJECTION" => Some("Use parameterized queries or prepared statements instead of string concatenation".to_string()),
            "XSS" => Some("Sanitize and validate all user input before rendering in HTML".to_string()),
            "HARDCODED_SECRET" => Some("Store sensitive information in environment variables or secure configuration".to_string()),
            "PATH_TRAVERSAL" => Some("Validate and sanitize file paths, use absolute paths where possible".to_string()),
            "COMMAND_INJECTION" => Some("Validate and sanitize input, avoid dynamic command execution".to_string()),
            _ => None,
        }
    }

    /// Generate scan summary
    fn generate_scan_summary(&self, file_results: &[FileScanResult]) -> ScanSummary {
        let mut summary = ScanSummary {
            total_findings: 0,
            critical_findings: 0,
            high_findings: 0,
            medium_findings: 0,
            low_findings: 0,
            average_risk_score: 0.0,
            most_common_vulnerabilities: HashMap::new(),
            riskiest_files: Vec::new(),
        };

        let mut total_risk_score = 0;

        for file_result in file_results {
            summary.total_findings += file_result.findings.len() as u64;
            total_risk_score += file_result.risk_score as u64;

            for finding in &file_result.findings {
                match finding.severity {
                    VulnerabilitySeverity::Critical => summary.critical_findings += 1,
                    VulnerabilitySeverity::High => summary.high_findings += 1,
                    VulnerabilitySeverity::Medium => summary.medium_findings += 1,
                    VulnerabilitySeverity::Low => summary.low_findings += 1,
                }

                *summary.most_common_vulnerabilities
                    .entry(finding.vulnerability_id.clone())
                    .or_insert(0) += 1;
            }

            if file_result.risk_score > 50 {
                summary.riskiest_files.push(RiskyFile {
                    path: file_result.file_path.clone(),
                    risk_score: file_result.risk_score,
                    finding_count: file_result.findings.len() as u32,
                });
            }
        }

        if !file_results.is_empty() {
            summary.average_risk_score = total_risk_score as f64 / file_results.len() as f64;
        }

        // Sort riskiest files by score
        summary.riskiest_files.sort_by(|a, b| b.risk_score.cmp(&a.risk_score));
        summary.riskiest_files.truncate(10); // Keep top 10

        summary
    }

    /// Generate recommendations based on scan results
    fn generate_recommendations(&self, summary: &ScanSummary) -> Vec<String> {
        let mut recommendations = Vec::new();

        if summary.critical_findings > 0 {
            recommendations.push(format!(
                "URGENT: Address {} critical security vulnerabilities immediately",
                summary.critical_findings
            ));
        }

        if summary.high_findings > 5 {
            recommendations.push(
                "Consider implementing automated security testing in your CI/CD pipeline".to_string()
            );
        }

        if summary.average_risk_score > 30.0 {
            recommendations.push(
                "Overall code security needs improvement - consider security code review".to_string()
            );
        }

        if let Some((vuln_type, count)) = summary.most_common_vulnerabilities.iter().max_by_key(|(_, &count)| count) {
            if *count > 3 {
                recommendations.push(format!(
                    "Focus on {} vulnerabilities - found {} instances across the codebase",
                    vuln_type, count
                ));
            }
        }

        if recommendations.is_empty() {
            recommendations.push("Code security looks good! Continue following secure coding practices".to_string());
        }

        recommendations
    }
}

impl_plugin_base!(SecurityScannerPlugin);

#[async_trait]
impl Plugin for SecurityScannerPlugin {
    async fn execute(&self, input: PluginExecutionInput) -> PluginResult<PluginExecutionResult> {
        let start_time = std::time::Instant::now();

        let result = match input.operation.as_str() {
            "scan_file" => {
                let file_path = input.data.get("file_path")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| PluginError::ConfigurationInvalid {
                        field: "file_path is required".to_string(),
                    })?;

                let scan_result = self.scan_file(Path::new(file_path)).await?;
                serde_json::to_value(scan_result)?
            }
            "scan_directory" => {
                let directory_path = input.data.get("directory_path")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| PluginError::ConfigurationInvalid {
                        field: "directory_path is required".to_string(),
                    })?;

                let recursive = input.data.get("recursive")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(true);

                let scan_report = self.scan_directory(Path::new(directory_path), recursive).await?;
                serde_json::to_value(scan_report)?
            }
            "get_vulnerability_patterns" => {
                let patterns: Vec<_> = self.vulnerability_patterns
                    .iter()
                    .map(|p| serde_json::json!({
                        "id": p.id,
                        "name": p.name,
                        "severity": p.severity,
                        "description": p.description,
                        "cwe_id": p.cwe_id
                    }))
                    .collect();
                serde_json::json!(patterns)
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
            memory_used_bytes: 8 * 1024 * 1024, // 8MB estimate
            cpu_time_ms: execution_time / 3,
            created_files: Vec::new(),
            network_requests: 0,
            metadata: HashMap::new(),
        })
    }

    fn capabilities(&self) -> Vec<PluginCapability> {
        vec![
            PluginCapability::SecurityAnalysis {
                analysis_types: vec![
                    "static_analysis".to_string(),
                    "vulnerability_scanning".to_string(),
                    "code_review".to_string(),
                ],
                threat_detection: true,
                vulnerability_scanning: true,
            },
            PluginCapability::FileProcessing {
                supported_formats: vec![
                    "rs".to_string(), "js".to_string(), "ts".to_string(), "py".to_string()
                ],
                batch_processing: true,
            },
        ]
    }
}

/// Vulnerability pattern definition
#[derive(Debug, Clone)]
pub struct VulnerabilityPattern {
    pub id: String,
    pub name: String,
    pub pattern: Regex,
    pub severity: VulnerabilitySeverity,
    pub description: String,
    pub cwe_id: Option<String>,
}

/// Security rule definition
#[derive(Debug, Clone)]
pub struct SecurityRule {
    pub id: String,
    pub name: String,
    pub pattern: Regex,
    pub severity: VulnerabilitySeverity,
    pub description: String,
    pub recommendation: String,
}

/// Vulnerability severity levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum VulnerabilitySeverity {
    Critical,
    High,
    Medium,
    Low,
}

/// Individual security finding
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityFinding {
    pub id: String,
    pub vulnerability_id: String,
    pub name: String,
    pub severity: VulnerabilitySeverity,
    pub description: String,
    pub file_path: String,
    pub line_number: usize,
    pub line_content: String,
    pub cwe_id: Option<String>,
    pub remediation: Option<String>,
    pub confidence: f64,
}

/// Result of scanning a single file
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileScanResult {
    pub file_path: String,
    pub findings: Vec<SecurityFinding>,
    pub risk_score: u8,
    pub lines_scanned: u64,
    pub scan_duration_ms: u64,
}

/// Complete security scan report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityScanReport {
    pub scan_id: String,
    pub timestamp: DateTime<Utc>,
    pub directory_path: String,
    pub total_files: u64,
    pub scanned_files: u64,
    pub file_results: Vec<FileScanResult>,
    pub summary: ScanSummary,
    pub scan_duration_ms: u64,
    pub recommendations: Vec<String>,
}

/// Summary of scan results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanSummary {
    pub total_findings: u64,
    pub critical_findings: u64,
    pub high_findings: u64,
    pub medium_findings: u64,
    pub low_findings: u64,
    pub average_risk_score: f64,
    pub most_common_vulnerabilities: HashMap<String, u64>,
    pub riskiest_files: Vec<RiskyFile>,
}

/// Information about risky files
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskyFile {
    pub path: String,
    pub risk_score: u8,
    pub finding_count: u32,
}