// phantom-ioc-core/src/validation.rs
// IOC validation and sanitization engine

use crate::types::*;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::Utc;
use regex::Regex;

pub struct ValidationEngine {
    validation_rules: Arc<RwLock<Vec<ValidationRule>>>,
    compiled_regexes: Arc<RwLock<HashMap<String, Regex>>>,
}

impl ValidationEngine {
    pub async fn new() -> Result<Self, IOCError> {
        let validation_rules = Arc::new(RwLock::new(Vec::new()));
        let compiled_regexes = Arc::new(RwLock::new(HashMap::new()));

        let engine = Self {
            validation_rules,
            compiled_regexes,
        };

        engine.initialize_rules().await?;
        Ok(engine)
    }

    async fn initialize_rules(&self) -> Result<(), IOCError> {
        let mut rules = self.validation_rules.write().await;

        // IP Address validation
        rules.push(ValidationRule {
            id: "ipv4_format".to_string(),
            name: "IPv4 Address Format".to_string(),
            indicator_type: IndicatorType::IP,
            pattern: r"^(\d{1,3}\.){3}\d{1,3}$".to_string(),
            required: true,
            error_message: "Invalid IPv4 address format".to_string(),
        });

        // Domain validation
        rules.push(ValidationRule {
            id: "domain_format".to_string(),
            name: "Domain Name Format".to_string(),
            indicator_type: IndicatorType::Domain,
            pattern: r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$".to_string(),
            required: true,
            error_message: "Invalid domain name format".to_string(),
        });

        // URL validation
        rules.push(ValidationRule {
            id: "url_format".to_string(),
            name: "URL Format".to_string(),
            indicator_type: IndicatorType::URL,
            pattern: r"^https?://[^\s/$.?#].[^\s]*$".to_string(),
            required: true,
            error_message: "Invalid URL format".to_string(),
        });

        // Hash validation (MD5, SHA1, SHA256)
        rules.push(ValidationRule {
            id: "hash_format".to_string(),
            name: "Hash Format".to_string(),
            indicator_type: IndicatorType::Hash,
            pattern: r"^[a-fA-F0-9]{32}|[a-fA-F0-9]{40}|[a-fA-F0-9]{64}$".to_string(),
            required: true,
            error_message: "Invalid hash format (must be MD5, SHA1, or SHA256)".to_string(),
        });

        // Email validation
        rules.push(ValidationRule {
            id: "email_format".to_string(),
            name: "Email Format".to_string(),
            indicator_type: IndicatorType::Email,
            pattern: r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$".to_string(),
            required: true,
            error_message: "Invalid email address format".to_string(),
        });

        // Compile regexes
        let mut regexes = self.compiled_regexes.write().await;
        for rule in rules.iter() {
            let regex = Regex::new(&rule.pattern)?;
            regexes.insert(rule.id.clone(), regex);
        }

        Ok(())
    }

    pub async fn validate_ioc(&self, ioc: &IOC) -> Result<ValidationResult, IOCError> {
        let mut errors = Vec::new();
        let mut warnings = Vec::new();

        // Basic validation
        if ioc.value.trim().is_empty() {
            errors.push("IOC value cannot be empty".to_string());
        }

        if ioc.confidence < 0.0 || ioc.confidence > 1.0 {
            errors.push("Confidence must be between 0.0 and 1.0".to_string());
        }

        // Type-specific validation
        let type_validation = self.validate_indicator_type(&ioc.value, &ioc.indicator_type).await?;
        errors.extend(type_validation.errors);
        warnings.extend(type_validation.warnings);

        // Sanitization check
        let sanitized = self.sanitize_ioc_value(&ioc.value);
        if sanitized != ioc.value {
            warnings.push("IOC value was sanitized for security".to_string());
        }

        // Metadata validation
        if let Some(metadata_errors) = self.validate_metadata(&ioc.metadata) {
            errors.extend(metadata_errors);
        }

        Ok(ValidationResult {
            is_valid: errors.is_empty(),
            errors,
            warnings,
            sanitized_value: if sanitized != ioc.value { Some(sanitized) } else { None },
            validation_timestamp: Utc::now(),
        })
    }

    async fn validate_indicator_type(&self, value: &str, indicator_type: &IndicatorType) -> Result<ValidationResult, IOCError> {
        let rules = self.validation_rules.read().await;
        let regexes = self.compiled_regexes.read().await;

        let mut errors = Vec::new();
        let mut warnings = Vec::new();

        // Find applicable rules
        let applicable_rules: Vec<_> = rules.iter()
            .filter(|r| r.indicator_type == *indicator_type)
            .collect();

        if applicable_rules.is_empty() {
            warnings.push(format!("No validation rules defined for indicator type {:?}", indicator_type));
            return Ok(ValidationResult {
                is_valid: true,
                errors,
                warnings,
                sanitized_value: None,
                validation_timestamp: Utc::now(),
            });
        }

        // Apply validation rules
        for rule in applicable_rules {
            if let Some(regex) = regexes.get(&rule.id) {
                if !regex.is_match(value) {
                    if rule.required {
                        errors.push(rule.error_message.clone());
                    } else {
                        warnings.push(format!("Optional validation failed: {}", rule.error_message));
                    }
                }
            }
        }

        // Additional type-specific validations
        match indicator_type {
            IndicatorType::IP => {
                if let Ok(parts) = value.split('.').map(|s| s.parse::<u8>()).collect::<Result<Vec<_>, _>>() {
                    if parts.len() != 4 {
                        errors.push("IPv4 address must have exactly 4 octets".to_string());
                    }
                    for &part in &parts {
                        if part > 255 {
                            errors.push("IPv4 octet values must be between 0 and 255".to_string());
                            break;
                        }
                    }
                }
            }
            IndicatorType::Hash => {
                let len = value.len();
                if ![32, 40, 64].contains(&len) {
                    errors.push("Hash length must be 32 (MD5), 40 (SHA1), or 64 (SHA256) characters".to_string());
                }
            }
            _ => {}
        }

        Ok(ValidationResult {
            is_valid: errors.is_empty(),
            errors,
            warnings,
            sanitized_value: None,
            validation_timestamp: Utc::now(),
        })
    }

    fn sanitize_ioc_value(&self, value: &str) -> String {
        // Basic sanitization to prevent injection attacks
        value
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;")
            .replace("&", "&amp;")
            .trim()
            .to_string()
    }

    fn validate_metadata(&self, metadata: &HashMap<String, serde_json::Value>) -> Option<Vec<String>> {
        let mut errors = Vec::new();

        for (key, value) in metadata {
            if key.is_empty() {
                errors.push("Metadata keys cannot be empty".to_string());
            }

            if key.len() > 100 {
                errors.push(format!("Metadata key '{}' is too long (max 100 characters)", key));
            }

            // Check for potentially dangerous values
            if let Some(str_value) = value.as_str() {
                if str_value.contains("script") || str_value.contains("javascript") {
                    errors.push(format!("Potentially dangerous content in metadata key '{}'", key));
                }
            }
        }

        if errors.is_empty() { None } else { Some(errors) }
    }

    pub async fn batch_validate(&self, iocs: &[IOC]) -> Result<BatchValidationResult, IOCError> {
        let mut results = Vec::new();
        let mut total_valid = 0;
        let mut total_errors = 0;
        let mut total_warnings = 0;

        for ioc in iocs {
            let validation = self.validate_ioc(ioc).await?;
            if validation.is_valid {
                total_valid += 1;
            }
            total_errors += validation.errors.len();
            total_warnings += validation.warnings.len();
            results.push(validation);
        }

        Ok(BatchValidationResult {
            results,
            summary: ValidationSummary {
                total_iocs: iocs.len(),
                valid_iocs: total_valid,
                invalid_iocs: iocs.len() - total_valid,
                total_errors,
                total_warnings,
            },
            batch_timestamp: Utc::now(),
        })
    }

    pub async fn get_health(&self) -> ComponentHealth {
        let rules = self.validation_rules.read().await;
        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Validation engine operational - {} rules loaded", rules.len()),
            last_check: Utc::now(),
            metrics: {
                let mut metrics = HashMap::new();
                metrics.insert("validation_rules".to_string(), rules.len() as f64);
                metrics
            },
        }
    }
}
