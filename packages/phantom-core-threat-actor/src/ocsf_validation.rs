use crate::ocsf::{ActivityId, BaseEvent, CategoryUid, ClassUid, SeverityId};
use crate::ocsf_categories::security_finding::SecurityFindingEvent;
use chrono::Utc;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// OCSF Validation Module
/// Validates OCSF events against schema requirements

/// Validation Result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    /// Whether validation passed
    pub is_valid: bool,
    /// Validation errors
    pub errors: Vec<ValidationError>,
    /// Validation warnings
    pub warnings: Vec<ValidationWarning>,
    /// Validation score (0.0 to 1.0)
    pub score: f64,
}

/// Validation Error
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationError {
    /// Error code
    pub code: String,
    /// Error message
    pub message: String,
    /// Field that caused the error
    pub field: Option<String>,
    /// Expected value
    pub expected: Option<String>,
    /// Actual value
    pub actual: Option<String>,
}

/// Validation Warning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationWarning {
    /// Warning code
    pub code: String,
    /// Warning message
    pub message: String,
    /// Field that caused the warning
    pub field: Option<String>,
    /// Suggested fix
    pub suggestion: Option<String>,
}

/// OCSF Validator
pub struct OcsfValidator {
    /// Validation rules
    pub rules: HashMap<String, ValidationRule>,
    /// Schema definitions
    pub schemas: HashMap<String, SchemaDefinition>,
    /// Custom validators
    pub custom_validators: Vec<Box<dyn CustomValidator>>,
}

/// Validation Rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationRule {
    /// Rule name
    pub name: String,
    /// Rule description
    pub description: String,
    /// Field to validate
    pub field: String,
    /// Validation type
    pub validation_type: ValidationType,
    /// Required
    pub required: bool,
    /// Parameters
    pub parameters: HashMap<String, String>,
}

/// Validation Type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ValidationType {
    /// Required field
    Required,
    /// Type check
    Type(String),
    /// Range check
    Range { min: f64, max: f64 },
    /// Pattern match
    Pattern(String),
    /// Enum check
    Enum(Vec<String>),
    /// Custom validation
    Custom(String),
}

/// Schema Definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchemaDefinition {
    /// Schema version
    pub version: String,
    /// Required fields
    pub required_fields: Vec<String>,
    /// Optional fields
    pub optional_fields: Vec<String>,
    /// Field types
    pub field_types: HashMap<String, String>,
    /// Field constraints
    pub field_constraints: HashMap<String, FieldConstraint>,
}

/// Field Constraint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldConstraint {
    /// Constraint type
    pub constraint_type: String,
    /// Parameters
    pub parameters: HashMap<String, String>,
}

/// Custom Validator Trait
pub trait CustomValidator: Send + Sync {
    /// Validate an event
    fn validate(&self, event: &BaseEvent) -> Vec<ValidationError>;
    /// Get validator name
    fn name(&self) -> &str;
}

/// Base Event Validator
pub struct BaseEventValidator;

impl CustomValidator for BaseEventValidator {
    fn validate(&self, event: &BaseEvent) -> Vec<ValidationError> {
        let mut errors = Vec::new();

        // Validate required fields
        if event.time > Utc::now() {
            errors.push(ValidationError {
                code: "INVALID_TIME".to_string(),
                message: "Event time cannot be in the future".to_string(),
                field: Some("time".to_string()),
                expected: Some("past or present time".to_string()),
                actual: Some(event.time.to_rfc3339()),
            });
        }

        // Validate category
        if matches!(event.category_uid, CategoryUid::Uncategorized) {
            errors.push(ValidationError {
                code: "INVALID_CATEGORY".to_string(),
                message: "Event category must be valid".to_string(),
                field: Some("category_uid".to_string()),
                expected: Some("valid category".to_string()),
                actual: Some(format!("{:?}", event.category_uid)),
            });
        }

        // Validate class
        if matches!(event.class_uid, ClassUid::BaseEvent)
            && matches!(event.category_uid, CategoryUid::Uncategorized)
        {
            errors.push(ValidationError {
                code: "INVALID_CLASS".to_string(),
                message: "Event class must be valid for the category".to_string(),
                field: Some("class_uid".to_string()),
                expected: Some("valid class".to_string()),
                actual: Some(format!("{:?}", event.class_uid)),
            });
        }

        // Validate severity
        if matches!(event.severity_id, SeverityId::Unknown) {
            errors.push(ValidationError {
                code: "INVALID_SEVERITY".to_string(),
                message: "Invalid severity level".to_string(),
                field: Some("severity_id".to_string()),
                expected: Some("valid severity".to_string()),
                actual: Some(format!("{:?}", event.severity_id)),
            });
        }

        // Validate activity ID
        if matches!(event.activity_id, ActivityId::Unknown) {
            errors.push(ValidationError {
                code: "INVALID_ACTIVITY".to_string(),
                message: "Activity ID must be valid".to_string(),
                field: Some("activity_id".to_string()),
                expected: Some("valid activity".to_string()),
                actual: Some(format!("{:?}", event.activity_id)),
            });
        }

        errors
    }

    fn name(&self) -> &str {
        "base_event_validator"
    }
}

/// Observable Validator
pub struct ObservableValidator;

impl CustomValidator for ObservableValidator {
    fn validate(&self, event: &BaseEvent) -> Vec<ValidationError> {
        let mut errors = Vec::new();

        for (i, observable) in event.observables.iter().enumerate() {
            // Validate observable type
            if observable.observable_type.is_empty() {
                errors.push(ValidationError {
                    code: "EMPTY_OBSERVABLE_TYPE".to_string(),
                    message: format!("Observable {} has empty type", i),
                    field: Some(format!("observables[{}].observable_type", i)),
                    expected: Some("non-empty string".to_string()),
                    actual: Some("empty".to_string()),
                });
            }

            // Validate observable value
            if observable.value.is_empty() {
                errors.push(ValidationError {
                    code: "EMPTY_OBSERVABLE_VALUE".to_string(),
                    message: format!("Observable {} has empty value", i),
                    field: Some(format!("observables[{}].value", i)),
                    expected: Some("non-empty string".to_string()),
                    actual: Some("empty".to_string()),
                });
            }

            // Validate type ID
            if observable.type_id == 0 {
                errors.push(ValidationError {
                    code: "INVALID_TYPE_ID".to_string(),
                    message: format!("Observable {} has invalid type ID", i),
                    field: Some(format!("observables[{}].type_id", i)),
                    expected: Some("positive integer".to_string()),
                    actual: Some(observable.type_id.to_string()),
                });
            }

            // Validate reputation score if present in data
            if let Some(data) = &observable.data {
                if let Some(reputation) = data.get("reputation").and_then(|r| r.as_f64()) {
                    if !(0.0..=1.0).contains(&reputation) {
                        errors.push(ValidationError {
                            code: "INVALID_REPUTATION".to_string(),
                            message: format!("Observable {} has invalid reputation score", i),
                            field: Some(format!("observables[{}].data.reputation", i)),
                            expected: Some("0.0 to 1.0".to_string()),
                            actual: Some(reputation.to_string()),
                        });
                    }
                }
            }
        }

        errors
    }

    fn name(&self) -> &str {
        "observable_validator"
    }
}

/// Enrichment Validator
pub struct EnrichmentValidator;

impl CustomValidator for EnrichmentValidator {
    fn validate(&self, event: &BaseEvent) -> Vec<ValidationError> {
        let mut errors = Vec::new();

        for (i, enrichment) in event.enrichments.iter().enumerate() {
            // Validate enrichment name
            if enrichment.name.is_empty() {
                errors.push(ValidationError {
                    code: "EMPTY_ENRICHMENT_NAME".to_string(),
                    message: format!("Enrichment {} has empty name", i),
                    field: Some(format!("enrichments[{}].name", i)),
                    expected: Some("non-empty string".to_string()),
                    actual: Some("empty".to_string()),
                });
            }

            // Validate enrichment type
            if enrichment.enrichment_type.is_empty() {
                errors.push(ValidationError {
                    code: "EMPTY_ENRICHMENT_TYPE".to_string(),
                    message: format!("Enrichment {} has empty type", i),
                    field: Some(format!("enrichments[{}].enrichment_type", i)),
                    expected: Some("non-empty string".to_string()),
                    actual: Some("empty".to_string()),
                });
            }
        }

        errors
    }

    fn name(&self) -> &str {
        "enrichment_validator"
    }
}

/// Schema Validator
pub struct SchemaValidator {
    /// Schema definitions
    pub schemas: HashMap<String, SchemaDefinition>,
}

impl SchemaValidator {
    /// Create a new schema validator
    pub fn new() -> Self {
        let mut schemas = HashMap::new();

        // Base event schema
        let base_schema = SchemaDefinition {
            version: "1.0.0".to_string(),
            required_fields: vec![
                "time".to_string(),
                "category_uid".to_string(),
                "class_uid".to_string(),
            ],
            optional_fields: vec![
                "severity_id".to_string(),
                "activity_id".to_string(),
                "message".to_string(),
                "observables".to_string(),
                "enrichments".to_string(),
            ],
            field_types: HashMap::from([
                ("time".to_string(), "timestamp".to_string()),
                ("category_uid".to_string(), "integer".to_string()),
                ("class_uid".to_string(), "integer".to_string()),
                ("severity_id".to_string(), "integer".to_string()),
                ("activity_id".to_string(), "integer".to_string()),
                ("message".to_string(), "string".to_string()),
            ]),
            field_constraints: HashMap::new(),
        };

        schemas.insert("base_event".to_string(), base_schema);

        Self { schemas }
    }

    /// Validate event against schema
    pub fn validate_schema(&self, event: &BaseEvent, schema_name: &str) -> Vec<ValidationError> {
        let mut errors = Vec::new();

        if let Some(schema) = self.schemas.get(schema_name) {
            // Check required fields
            for field in &schema.required_fields {
                match field.as_str() {
                    "time" => {
                        // time is always present in BaseEvent
                    }
                    "category_uid" => {
                        if matches!(event.category_uid, CategoryUid::Uncategorized) {
                            errors.push(ValidationError {
                                code: "MISSING_REQUIRED_FIELD".to_string(),
                                message: format!("Required field '{}' has invalid value", field),
                                field: Some(field.clone()),
                                expected: Some("valid category".to_string()),
                                actual: Some("uncategorized".to_string()),
                            });
                        }
                    }
                    "class_uid" => {
                        if matches!(event.class_uid, ClassUid::BaseEvent) {
                            errors.push(ValidationError {
                                code: "MISSING_REQUIRED_FIELD".to_string(),
                                message: format!("Required field '{}' has invalid value", field),
                                field: Some(field.clone()),
                                expected: Some("valid class".to_string()),
                                actual: Some("base_event".to_string()),
                            });
                        }
                    }
                    _ => {}
                }
            }
        }

        errors
    }
}

/// Data Type Validator
pub struct DataTypeValidator;

impl DataTypeValidator {
    /// Validate IP address
    pub fn validate_ip(ip: &str) -> bool {
        let ipv4_regex = Regex::new(r"^(\d{1,3}\.){3}\d{1,3}$").unwrap();
        let ipv6_regex = Regex::new(r"^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$").unwrap();

        ipv4_regex.is_match(ip) || ipv6_regex.is_match(ip)
    }

    /// Validate domain name
    pub fn validate_domain(domain: &str) -> bool {
        let domain_regex =
            Regex::new(r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$")
                .unwrap();
        domain_regex.is_match(domain)
    }

    /// Validate URL
    pub fn validate_url(url: &str) -> bool {
        url.starts_with("http://") || url.starts_with("https://")
    }

    /// Validate email
    pub fn validate_email(email: &str) -> bool {
        let email_regex = Regex::new(r"^[^@]+@[^@]+\.[^@]+$").unwrap();
        email_regex.is_match(email)
    }

    /// Validate file hash
    pub fn validate_file_hash(hash: &str) -> bool {
        let md5_regex = Regex::new(r"^[a-fA-F0-9]{32}$").unwrap();
        let sha1_regex = Regex::new(r"^[a-fA-F0-9]{40}$").unwrap();
        let sha256_regex = Regex::new(r"^[a-fA-F0-9]{64}$").unwrap();

        md5_regex.is_match(hash) || sha1_regex.is_match(hash) || sha256_regex.is_match(hash)
    }
}

impl OcsfValidator {
    /// Create a new OCSF validator
    pub fn new() -> Self {
        let mut validator = Self {
            rules: HashMap::new(),
            schemas: HashMap::new(),
            custom_validators: Vec::new(),
        };

        // Add default validators
        validator.add_custom_validator(Box::new(BaseEventValidator));
        validator.add_custom_validator(Box::new(ObservableValidator));
        validator.add_custom_validator(Box::new(EnrichmentValidator));

        validator
    }

    /// Add a custom validator
    pub fn add_custom_validator(&mut self, validator: Box<dyn CustomValidator>) {
        self.custom_validators.push(validator);
    }

    /// Add a validation rule
    pub fn add_rule(&mut self, rule: ValidationRule) {
        self.rules.insert(rule.name.clone(), rule);
    }

    /// Validate an OCSF event
    pub fn validate_event(&self, event: &SecurityFindingEvent) -> ValidationResult {
        let mut errors = Vec::new();
        let mut warnings = Vec::new();

        // Run custom validators
        for validator in &self.custom_validators {
            errors.extend(validator.validate(&event.base));
        }

        // Validate against rules
        for rule in self.rules.values() {
            let result = self.validate_rule(&event.base, rule);
            errors.extend(result.errors);
            warnings.extend(result.warnings);
        }

        // Calculate validation score
        let total_checks = errors.len() + warnings.len() + 1; // +1 for successful validation
        let score = if errors.is_empty() {
            if warnings.is_empty() {
                1.0
            } else {
                0.8
            }
        } else {
            0.5 * (warnings.len() as f64 / total_checks as f64)
        };

        ValidationResult {
            is_valid: errors.is_empty(),
            errors,
            warnings,
            score,
        }
    }

    /// Validate against a specific rule
    fn validate_rule(&self, event: &BaseEvent, rule: &ValidationRule) -> ValidationResult {
        let mut errors = Vec::new();
        let warnings = Vec::new();

        match rule.validation_type {
            ValidationType::Required => {
                if rule.required && !self.field_exists(event, &rule.field) {
                    errors.push(ValidationError {
                        code: "MISSING_REQUIRED_FIELD".to_string(),
                        message: format!("Required field '{}' is missing", rule.field),
                        field: Some(rule.field.clone()),
                        expected: Some("present".to_string()),
                        actual: Some("missing".to_string()),
                    });
                }
            }
            ValidationType::Type(ref expected_type) => {
                if let Some(actual_value) = self.get_field_value(event, &rule.field) {
                    if !self.validate_field_type(&actual_value, expected_type) {
                        errors.push(ValidationError {
                            code: "TYPE_MISMATCH".to_string(),
                            message: format!("Field '{}' has wrong type", rule.field),
                            field: Some(rule.field.clone()),
                            expected: Some(expected_type.clone()),
                            actual: Some(actual_value),
                        });
                    }
                }
            }
            ValidationType::Range { min, max } => {
                if let Some(value_str) = self.get_field_value(event, &rule.field) {
                    if let Ok(value) = value_str.parse::<f64>() {
                        if value < min || value > max {
                            errors.push(ValidationError {
                                code: "VALUE_OUT_OF_RANGE".to_string(),
                                message: format!("Field '{}' value out of range", rule.field),
                                field: Some(rule.field.clone()),
                                expected: Some(format!("[{}, {}]", min, max)),
                                actual: Some(value_str),
                            });
                        }
                    }
                }
            }
            ValidationType::Pattern(ref pattern) => {
                if let Some(value) = self.get_field_value(event, &rule.field) {
                    let regex = Regex::new(pattern).unwrap_or_else(|_| Regex::new("").unwrap());
                    if !regex.is_match(&value) {
                        errors.push(ValidationError {
                            code: "PATTERN_MISMATCH".to_string(),
                            message: format!("Field '{}' does not match pattern", rule.field),
                            field: Some(rule.field.clone()),
                            expected: Some(pattern.clone()),
                            actual: Some(value),
                        });
                    }
                }
            }
            ValidationType::Enum(ref allowed_values) => {
                if let Some(value) = self.get_field_value(event, &rule.field) {
                    if !allowed_values.contains(&value) {
                        errors.push(ValidationError {
                            code: "INVALID_ENUM_VALUE".to_string(),
                            message: format!("Field '{}' has invalid value", rule.field),
                            field: Some(rule.field.clone()),
                            expected: Some(allowed_values.join(", ")),
                            actual: Some(value),
                        });
                    }
                }
            }
            ValidationType::Custom(_) => {
                // Custom validation would be handled by custom validators
            }
        }

        ValidationResult {
            is_valid: errors.is_empty(),
            errors: errors.clone(),
            warnings,
            score: if errors.is_empty() { 1.0 } else { 0.0 },
        }
    }

    /// Check if a field exists in the event
    fn field_exists(&self, event: &BaseEvent, field: &str) -> bool {
        match field {
            "time" => true, // time is always present
            "category_uid" => !matches!(event.category_uid, CategoryUid::Uncategorized),
            "class_uid" => !matches!(event.class_uid, ClassUid::BaseEvent),
            "severity_id" => !matches!(event.severity_id, SeverityId::Unknown),
            "activity_id" => !matches!(event.activity_id, ActivityId::Unknown),
            "message" => event.message.is_some(),
            "observables" => !event.observables.is_empty(),
            "enrichments" => !event.enrichments.is_empty(),
            _ => false,
        }
    }

    /// Get field value as string
    fn get_field_value(&self, event: &BaseEvent, field: &str) -> Option<String> {
        match field {
            "category_uid" => Some(format!("{:?}", event.category_uid)),
            "class_uid" => Some(format!("{:?}", event.class_uid)),
            "severity_id" => Some(format!("{:?}", event.severity_id)),
            "activity_id" => Some(format!("{:?}", event.activity_id)),
            "message" => event.message.clone(),
            _ => None,
        }
    }

    /// Validate field type
    fn validate_field_type(&self, value: &str, expected_type: &str) -> bool {
        match expected_type {
            "integer" => value.parse::<i64>().is_ok(),
            "float" => value.parse::<f64>().is_ok(),
            "boolean" => matches!(value.to_lowercase().as_str(), "true" | "false"),
            "string" => true, // All values are strings at this point
            _ => false,
        }
    }

    /// Get validation statistics
    pub fn get_statistics(&self) -> HashMap<String, usize> {
        let mut stats = HashMap::new();
        stats.insert("rules_count".to_string(), self.rules.len());
        stats.insert("schemas_count".to_string(), self.schemas.len());
        stats.insert(
            "custom_validators_count".to_string(),
            self.custom_validators.len(),
        );

        stats
    }

    /// Export validation configuration
    pub fn export_config(&self) -> Result<String, serde_json::Error> {
        let config = serde_json::json!({
            "rules": self.rules,
            "schemas": self.schemas,
            "custom_validators": self.custom_validators.iter().map(|v| v.name()).collect::<Vec<_>>(),
            "exported_at": chrono::Utc::now().to_rfc3339()
        });

        serde_json::to_string_pretty(&config)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ocsf::BaseEvent;

    #[test]
    fn test_validation_result_creation() {
        let result = ValidationResult {
            is_valid: true,
            errors: vec![],
            warnings: vec![],
            score: 1.0,
        };

        assert!(result.is_valid);
        assert_eq!(result.score, 1.0);
    }

    #[test]
    fn test_ocsf_validator_creation() {
        let validator = OcsfValidator::new();
        assert_eq!(validator.custom_validators.len(), 3); // Base, Observable, Enrichment validators
    }

    #[test]
    fn test_base_event_validator() {
        let validator = BaseEventValidator;
        let event = BaseEvent::new(
            CategoryUid::Findings,
            ClassUid::SecurityFinding,
            SeverityId::Unknown,
        );

        // Valid event
        let errors = validator.validate(&event);
        assert!(errors.is_empty());
    }

    #[test]
    fn test_observable_validator() {
        let validator = ObservableValidator;
        let mut event = BaseEvent::new(
            CategoryUid::Findings,
            ClassUid::SecurityFinding,
            SeverityId::Unknown,
        );

        // Add invalid observable
        let invalid_observable = crate::ocsf::Observable {
            name: "".to_string(),
            value: "".to_string(),
            observable_type: "".to_string(),
            type_id: 0,
            data: Some(serde_json::json!({"reputation": 1.5})), // Invalid reputation
            reputation: None,
            attributes: None,
        };

        event.add_observable(invalid_observable);

        let errors = validator.validate(&event);
        assert!(!errors.is_empty());
        assert!(errors.iter().any(|e| e.code == "EMPTY_OBSERVABLE_TYPE"));
        assert!(errors.iter().any(|e| e.code == "INVALID_REPUTATION"));
    }

    #[test]
    fn test_data_type_validator() {
        assert!(DataTypeValidator::validate_ip("192.168.1.100"));
        assert!(DataTypeValidator::validate_domain("example.com"));
        assert!(DataTypeValidator::validate_url("https://example.com"));
        assert!(DataTypeValidator::validate_email("user@example.com"));
        assert!(DataTypeValidator::validate_file_hash(
            "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
        ));

        assert!(!DataTypeValidator::validate_ip("invalid"));
        assert!(!DataTypeValidator::validate_domain("invalid"));
        assert!(!DataTypeValidator::validate_url("invalid"));
    }

    #[test]
    fn test_schema_validator() {
        let validator = SchemaValidator::new();

        let event = BaseEvent::new(
            CategoryUid::Findings,
            ClassUid::SecurityFinding,
            SeverityId::Unknown,
        );
        let errors = validator.validate_schema(&event, "base_event");

        // Should have no errors for valid event
        assert!(errors.is_empty());
    }

    #[test]
    fn test_validation_rule() {
        let rule = ValidationRule {
            name: "test_rule".to_string(),
            description: "Test rule".to_string(),
            field: "severity_id".to_string(),
            validation_type: ValidationType::Required,
            required: true,
            parameters: HashMap::new(),
        };

        assert_eq!(rule.name, "test_rule");
        assert!(rule.required);
    }

    #[test]
    fn test_validate_event() {
        let validator = OcsfValidator::new();
        let event = BaseEvent::new(
            CategoryUid::Findings,
            ClassUid::SecurityFinding,
            SeverityId::Unknown,
        );

        let result = validator.validate_event(&event);
        assert!(result.is_valid);
        assert!(result.errors.is_empty());
    }

    #[test]
    fn test_statistics() {
        let validator = OcsfValidator::new();
        let stats = validator.get_statistics();

        assert!(stats.contains_key("custom_validators_count"));
        assert_eq!(stats["custom_validators_count"], 3);
    }

    #[test]
    fn test_export_config() {
        let validator = OcsfValidator::new();
        let config = validator.export_config().unwrap();

        assert!(config.contains("rules"));
        assert!(config.contains("schemas"));
    }
}
