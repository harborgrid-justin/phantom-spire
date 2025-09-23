use napi_derive::napi;
use serde::{Deserialize, Serialize};
use regex::Regex;

#[derive(Debug, Clone)]
#[napi]
pub struct SecurityAuditAgent {
    name: String,
    version: String,
}

#[napi]
impl SecurityAuditAgent {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            name: "SecurityAuditAgent".to_string(),
            version: "1.0.0".to_string(),
        }
    }

    #[napi]
    pub fn scan_content(&self, content: String) -> Vec<SecurityIssue> {
        let mut issues = Vec::new();

        // Check for hardcoded secrets
        let secret_regex = Regex::new(r#"(api[_-]?key|secret|password|token)\s*=\s*["'][^"']+["']"#).unwrap();
        for (line_num, line) in content.lines().enumerate() {
            if secret_regex.is_match(line) {
                issues.push(SecurityIssue {
                    file: "content".to_string(),
                    line: (line_num + 1) as i32,
                    vulnerability_id: "SECRET-001".to_string(),
                    name: "Hardcoded Secrets".to_string(),
                    severity: "CRITICAL".to_string(),
                    description: "Potential hardcoded secret detected".to_string(),
                    mitigation: "Use environment variables or secret management systems".to_string(),
                    code_snippet: line.to_string(),
                });
            }
        }

        // Check for SQL injection patterns
        let sql_regex = Regex::new(r"(SELECT|INSERT|UPDATE|DELETE).*\+.*(\$|@|:)").unwrap();
        for (line_num, line) in content.lines().enumerate() {
            if sql_regex.is_match(line) {
                issues.push(SecurityIssue {
                    file: "content".to_string(),
                    line: (line_num + 1) as i32,
                    vulnerability_id: "SQL-001".to_string(),
                    name: "SQL Injection".to_string(),
                    severity: "CRITICAL".to_string(),
                    description: "Potential SQL injection vulnerability detected".to_string(),
                    mitigation: "Use parameterized queries or prepared statements".to_string(),
                    code_snippet: line.to_string(),
                });
            }
        }

        issues
    }

    #[napi]
    pub fn generate_report(&self, issues: Vec<SecurityIssue>) -> String {
        let mut report = String::new();
        report.push_str("# Security Audit Report\n\n");
        report.push_str(&format!("**Total Issues:** {}\n\n", issues.len()));

        let critical_count = issues.iter().filter(|i| i.severity == "CRITICAL").count();
        let high_count = issues.iter().filter(|i| i.severity == "HIGH").count();

        report.push_str("## Summary\n");
        report.push_str(&format!("- Critical: {}\n", critical_count));
        report.push_str(&format!("- High: {}\n\n", high_count));

        if !issues.is_empty() {
            report.push_str("## Detailed Findings\n\n");
            for issue in &issues {
                report.push_str(&format!("### {} ({})\n", issue.name, issue.severity));
                report.push_str(&format!("- **File:** {}\n", issue.file));
                report.push_str(&format!("- **Line:** {}\n", issue.line));
                report.push_str(&format!("- **Description:** {}\n", issue.description));
                report.push_str(&format!("- **Mitigation:** {}\n", issue.mitigation));
                report.push_str(&format!("- **Code:** `{}`\n\n", issue.code_snippet));
            }
        }

        report
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct SecurityIssue {
    pub file: String,
    pub line: i32,
    pub vulnerability_id: String,
    pub name: String,
    pub severity: String,
    pub description: String,
    pub mitigation: String,
    pub code_snippet: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct ScanReport {
    pub total_files: i32,
    pub total_issues: i32,
    pub critical_count: i32,
    pub high_count: i32,
    pub medium_count: i32,
    pub low_count: i32,
    pub issues: Vec<SecurityIssue>,
}