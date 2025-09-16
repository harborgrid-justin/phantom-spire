use super::{AgentContext, AgentError, AgentResult};
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::fs;
use regex::Regex;

#[derive(Debug, Clone)]
#[napi]
pub struct CodeReviewAgent {
    name: String,
    version: String,
    rules: Vec<CodeRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct CodeRule {
    id: String,
    name: String,
    category: String,
    severity: String,
    pattern: String,
    message: String,
    suggestion: String,
}

#[napi]
impl CodeReviewAgent {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            name: "CodeReviewAgent".to_string(),
            version: "1.0.0".to_string(),
            rules: Self::init_rules(),
        }
    }

    fn init_rules() -> Vec<CodeRule> {
        vec![
            CodeRule {
                id: "NAMING-001".to_string(),
                name: "Snake case in JavaScript".to_string(),
                category: "Naming Convention".to_string(),
                severity: "WARNING".to_string(),
                pattern: r"(let|const|var)\s+[a-z]+_[a-z]".to_string(),
                message: "Use camelCase for JavaScript variables".to_string(),
                suggestion: "Convert snake_case to camelCase".to_string(),
            },
            CodeRule {
                id: "COMPLEXITY-001".to_string(),
                name: "Deep nesting".to_string(),
                category: "Complexity".to_string(),
                severity: "WARNING".to_string(),
                pattern: r"(\{[^}]*){5,}".to_string(),
                message: "Code has deep nesting (5+ levels)".to_string(),
                suggestion: "Refactor to reduce nesting depth".to_string(),
            },
            CodeRule {
                id: "ERROR-001".to_string(),
                name: "Empty catch block".to_string(),
                category: "Error Handling".to_string(),
                severity: "ERROR".to_string(),
                pattern: r"catch\s*\([^)]*\)\s*\{\s*\}".to_string(),
                message: "Empty catch block silently swallows errors".to_string(),
                suggestion: "Add error handling or logging".to_string(),
            },
            CodeRule {
                id: "PERF-001".to_string(),
                name: "Array operations in loop".to_string(),
                category: "Performance".to_string(),
                severity: "WARNING".to_string(),
                pattern: r"for\s*\([^)]*\).*\.push\(|\.unshift\(".to_string(),
                message: "Array mutation in loop can be inefficient".to_string(),
                suggestion: "Consider using map, filter, or pre-allocated arrays".to_string(),
            },
            CodeRule {
                id: "ASYNC-001".to_string(),
                name: "Missing await".to_string(),
                category: "Async".to_string(),
                severity: "ERROR".to_string(),
                pattern: r"async\s+.*\{[^}]*(?<!await\s)[a-zA-Z]+\.(then|catch)\(".to_string(),
                message: "Mixing async/await with Promise chains".to_string(),
                suggestion: "Use consistent async/await pattern".to_string(),
            },
            CodeRule {
                id: "COMMENT-001".to_string(),
                name: "TODO comments".to_string(),
                category: "Documentation".to_string(),
                severity: "INFO".to_string(),
                pattern: r"//\s*(TODO|FIXME|HACK|XXX)".to_string(),
                message: "TODO comment found".to_string(),
                suggestion: "Track in issue system and resolve".to_string(),
            },
            CodeRule {
                id: "MAGIC-001".to_string(),
                name: "Magic numbers".to_string(),
                category: "Code Quality".to_string(),
                severity: "WARNING".to_string(),
                pattern: r"(?<![\d.])[2-9]\d{2,}(?![\d.])".to_string(),
                message: "Magic number detected".to_string(),
                suggestion: "Extract to named constant".to_string(),
            },
        ]
    }

    #[napi]
    pub async fn review_file(&self, file_path: String) -> napi::Result<FileReview> {
        let content = fs::read_to_string(&file_path).await
            .map_err(|e| napi::Error::from_reason(format!("Failed to read file: {}", e)))?;

        let mut issues = Vec::new();
        let mut metrics = CodeMetrics::default();

        let lines: Vec<&str> = content.lines().collect();
        metrics.total_lines = lines.len() as i32;
        metrics.code_lines = lines.iter().filter(|l| !l.trim().is_empty() && !l.trim().starts_with("//")).count() as i32;
        metrics.comment_lines = lines.iter().filter(|l| l.trim().starts_with("//") || l.trim().starts_with("/*")).count() as i32;

        for rule in &self.rules {
            let regex = Regex::new(&rule.pattern).unwrap();
            for (line_num, line) in lines.iter().enumerate() {
                if regex.is_match(line) {
                    issues.push(ReviewIssue {
                        file: file_path.clone(),
                        line: (line_num + 1) as i32,
                        column: 0,
                        rule_id: rule.id.clone(),
                        category: rule.category.clone(),
                        severity: rule.severity.clone(),
                        message: rule.message.clone(),
                        suggestion: rule.suggestion.clone(),
                        code_snippet: line.to_string(),
                    });
                }
            }
        }

        metrics.cyclomatic_complexity = self.calculate_complexity(&content);
        metrics.maintainability_index = self.calculate_maintainability(&metrics);

        Ok(FileReview {
            file_path,
            issues,
            metrics,
            score: self.calculate_score(&issues),
        })
    }

    fn calculate_complexity(&self, content: &str) -> i32 {
        let mut complexity = 1;
        let patterns = vec![
            r"\bif\b", r"\belse\b", r"\bfor\b", r"\bwhile\b",
            r"\bcase\b", r"\bcatch\b", r"\b\?\s*:", r"&&", r"\|\|"
        ];

        for pattern in patterns {
            let regex = Regex::new(pattern).unwrap();
            complexity += regex.find_iter(content).count() as i32;
        }

        complexity
    }

    fn calculate_maintainability(&self, metrics: &CodeMetrics) -> f32 {
        let volume = (metrics.code_lines as f32).ln();
        let complexity_factor = 1.0 / (1.0 + metrics.cyclomatic_complexity as f32 * 0.1);
        let comment_ratio = metrics.comment_lines as f32 / (metrics.total_lines as f32 + 1.0);

        171.0 - 5.2 * volume.ln() - 0.23 * metrics.cyclomatic_complexity as f32 + 16.2 * comment_ratio
    }

    fn calculate_score(&self, issues: &[ReviewIssue]) -> f32 {
        let mut score = 100.0;

        for issue in issues {
            match issue.severity.as_str() {
                "ERROR" => score -= 10.0,
                "WARNING" => score -= 5.0,
                "INFO" => score -= 1.0,
                _ => {}
            }
        }

        score.max(0.0)
    }

    #[napi]
    pub fn generate_report(&self, reviews: Vec<FileReview>) -> ReviewReport {
        let total_issues = reviews.iter().map(|r| r.issues.len() as i32).sum();
        let average_score = reviews.iter().map(|r| r.score).sum::<f32>() / reviews.len() as f32;
        let total_lines = reviews.iter().map(|r| r.metrics.total_lines).sum();

        let mut issues_by_category: HashMap<String, i32> = HashMap::new();
        for review in &reviews {
            for issue in &review.issues {
                *issues_by_category.entry(issue.category.clone()).or_insert(0) += 1;
            }
        }

        ReviewReport {
            total_files: reviews.len() as i32,
            total_issues,
            average_score,
            total_lines,
            issues_by_category,
            file_reviews: reviews,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct ReviewIssue {
    pub file: String,
    pub line: i32,
    pub column: i32,
    pub rule_id: String,
    pub category: String,
    pub severity: String,
    pub message: String,
    pub suggestion: String,
    pub code_snippet: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[napi(object)]
pub struct CodeMetrics {
    pub total_lines: i32,
    pub code_lines: i32,
    pub comment_lines: i32,
    pub cyclomatic_complexity: i32,
    pub maintainability_index: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct FileReview {
    pub file_path: String,
    pub issues: Vec<ReviewIssue>,
    pub metrics: CodeMetrics,
    pub score: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct ReviewReport {
    pub total_files: i32,
    pub total_issues: i32,
    pub average_score: f32,
    pub total_lines: i32,
    pub issues_by_category: HashMap<String, i32>,
    pub file_reviews: Vec<FileReview>,
}