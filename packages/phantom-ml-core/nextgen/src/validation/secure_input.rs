//! Enterprise-grade secure input validation for NAPI-RS ML operations
//! Prevents injection attacks, malformed data, and ensures data integrity
//! Modernized for NAPI-RS v3.x with enhanced security and validation features

use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use regex::Regex;

/// Maximum allowed JSON depth to prevent stack overflow attacks
const MAX_JSON_DEPTH: usize = 32;

/// Maximum allowed string length to prevent DoS attacks (1MB)
const MAX_STRING_LENGTH: usize = 1_000_000;

/// Maximum allowed array/object size to prevent memory exhaustion
const MAX_CONTAINER_SIZE: usize = 10_000;

/// Maximum allowed numeric value to prevent overflow
const MAX_NUMERIC_VALUE: f64 = 1e15;

/// Comprehensive input validation result with detailed feedback
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub errors: Vec<ValidationError>,
    pub warnings: Vec<ValidationWarning>,
    pub sanitized_input: Option<String>,
    pub validation_metadata: ValidationMetadata,
}

/// Validation error with detailed context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationError {
    pub error_type: ValidationErrorType,
    pub message: String,
    pub context: String,
    pub field_path: Option<String>,
    pub severity: ErrorSeverity,
}

/// Validation warning for non-critical issues
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationWarning {
    pub warning_type: ValidationWarningType,
    pub message: String,
    pub context: String,
    pub field_path: Option<String>,
}

/// Types of validation errors
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ValidationErrorType {
    InvalidJson,
    SuspiciousContent,
    SizeLimit,
    TypeMismatch,
    MissingRequired,
    DisallowedKey,
    InvalidFormat,
    SecurityViolation,
    BusinessRuleViolation,
}

/// Types of validation warnings
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ValidationWarningType {
    LargeValue,
    DeprecatedField,
    UnknownField,
    PerformanceImpact,
    DataQuality,
}

/// Error severity levels for enterprise logging
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum ErrorSeverity {
    Low,
    Medium,
    High,
    Critical,
}

/// Validation metadata for audit trails
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationMetadata {
    pub validation_time: std::time::SystemTime,
    pub validator_version: String,
    pub validation_rules_applied: Vec<String>,
    pub processing_time_ms: u64,
    pub data_size_bytes: usize,
}

impl ValidationResult {
    pub fn valid(sanitized: String, metadata: ValidationMetadata) -> Self {
        Self {
            is_valid: true,
            errors: Vec::new(),
            warnings: Vec::new(),
            sanitized_input: Some(sanitized),
            validation_metadata: metadata,
        }
    }

    pub fn invalid(errors: Vec<ValidationError>, metadata: ValidationMetadata) -> Self {
        Self {
            is_valid: false,
            errors,
            warnings: Vec::new(),
            sanitized_input: None,
            validation_metadata: metadata,
        }
    }

    pub fn with_warnings(mut self, warnings: Vec<ValidationWarning>) -> Self {
        self.warnings = warnings;
        self
    }

    /// Check if validation has critical errors that should block processing
    pub fn has_critical_errors(&self) -> bool {
        self.errors.iter().any(|e| e.severity >= ErrorSeverity::Critical)
    }

    /// Get summary of validation issues for logging
    pub fn get_summary(&self) -> String {
        let error_count = self.errors.len();
        let warning_count = self.warnings.len();
        let critical_count = self.errors.iter().filter(|e| e.severity >= ErrorSeverity::Critical).count();
        
        format!(
            "Validation summary: {} errors ({} critical), {} warnings, processing time: {}ms",
            error_count, critical_count, warning_count, self.validation_metadata.processing_time_ms
        )
    }
}

/// Advanced secure JSON validator with enterprise features
pub struct SecureJsonValidator {
    max_depth: usize,
    max_string_length: usize,
    max_container_size: usize,
    max_numeric_value: f64,
    allowed_keys: Option<HashSet<String>>,
    required_keys: Option<HashSet<String>>,
    type_constraints: HashMap<String, JsonType>,
    custom_validators: Vec<Box<dyn CustomValidator>>,
    suspicious_patterns: Vec<Regex>,
    enable_business_rules: bool,
}

/// JSON type constraints for field validation
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum JsonType {
    String,
    Number,
    Boolean,
    Array,
    Object,
    Null,
}

/// Trait for custom validation logic
pub trait CustomValidator: Send + Sync {
    fn validate(&self, value: &Value, context: &str) -> Result<(), Vec<ValidationError>>;
    fn name(&self) -> &str;
}

impl Default for SecureJsonValidator {
    fn default() -> Self {
        Self::new()
    }
}

impl SecureJsonValidator {
    pub fn new() -> Self {
        let suspicious_patterns = vec![
            Regex::new(r"javascript:").unwrap(),
            Regex::new(r"data:").unwrap(),
            Regex::new(r"vbscript:").unwrap(),
            Regex::new(r"<script[^>]*>").unwrap(),
            Regex::new(r"</script>").unwrap(),
            Regex::new(r"eval\s*\(").unwrap(),
            Regex::new(r"Function\s*\(").unwrap(),
            Regex::new(r"setTimeout\s*\(").unwrap(),
            Regex::new(r"setInterval\s*\(").unwrap(),
            Regex::new(r"__proto__").unwrap(),
            Regex::new(r"constructor").unwrap(),
            Regex::new(r"prototype").unwrap(),
            Regex::new(r"\\u0000").unwrap(), // Null byte injection
            Regex::new(r"\\x00").unwrap(),   // Null byte injection
        ];

        Self {
            max_depth: MAX_JSON_DEPTH,
            max_string_length: MAX_STRING_LENGTH,
            max_container_size: MAX_CONTAINER_SIZE,
            max_numeric_value: MAX_NUMERIC_VALUE,
            allowed_keys: None,
            required_keys: None,
            type_constraints: HashMap::new(),
            custom_validators: Vec::new(),
            suspicious_patterns,
            enable_business_rules: true,
        }
    }

    /// Builder pattern methods for configuration
    pub fn with_max_depth(mut self, depth: usize) -> Self {
        self.max_depth = depth;
        self
    }

    pub fn with_max_string_length(mut self, length: usize) -> Self {
        self.max_string_length = length;
        self
    }

    pub fn with_allowed_keys(mut self, keys: HashSet<String>) -> Self {
        self.allowed_keys = Some(keys);
        self
    }

    pub fn with_required_keys(mut self, keys: HashSet<String>) -> Self {
        self.required_keys = Some(keys);
        self
    }

    pub fn with_type_constraints(mut self, constraints: HashMap<String, JsonType>) -> Self {
        self.type_constraints = constraints;
        self
    }

    pub fn with_custom_validator(mut self, validator: Box<dyn CustomValidator>) -> Self {
        self.custom_validators.push(validator);
        self
    }

    pub fn disable_business_rules(mut self) -> Self {
        self.enable_business_rules = false;
        self
    }

    /// Comprehensive validation of JSON input with detailed analysis
    pub fn validate(&self, input: &str, context: &str) -> ValidationResult {
        let start_time = std::time::Instant::now();
        let system_time = std::time::SystemTime::now();
        let mut errors = Vec::new();
        let mut warnings = Vec::new();
        let mut rules_applied = Vec::new();

        // Basic sanity checks
        if input.is_empty() {
            errors.push(ValidationError {
                error_type: ValidationErrorType::InvalidJson,
                message: "Input cannot be empty".to_string(),
                context: context.to_string(),
                field_path: None,
                severity: ErrorSeverity::Critical,
            });

            let metadata = ValidationMetadata {
                validation_time: system_time,
                validator_version: env!("CARGO_PKG_VERSION").to_string(),
                validation_rules_applied: rules_applied,
                processing_time_ms: start_time.elapsed().as_millis() as u64,
                data_size_bytes: input.len(),
            };

            return ValidationResult::invalid(errors, metadata);
        }

        rules_applied.push("empty_check".to_string());

        // Size limit check
        if input.len() > self.max_string_length {
            errors.push(ValidationError {
                error_type: ValidationErrorType::SizeLimit,
                message: format!(
                    "Input exceeds maximum length of {} bytes (got {} bytes)",
                    self.max_string_length,
                    input.len()
                ),
                context: context.to_string(),
                field_path: None,
                severity: ErrorSeverity::Critical,
            });
        }
        rules_applied.push("size_limit_check".to_string());

        // Check for suspicious patterns
        if let Some(pattern_errors) = self.check_suspicious_patterns(input, context) {
            errors.extend(pattern_errors);
        }
        rules_applied.push("suspicious_pattern_check".to_string());

        // Early return if critical errors found
        if errors.iter().any(|e| e.severity >= ErrorSeverity::Critical) {
            let metadata = ValidationMetadata {
                validation_time: system_time,
                validator_version: env!("CARGO_PKG_VERSION").to_string(),
                validation_rules_applied: rules_applied,
                processing_time_ms: start_time.elapsed().as_millis() as u64,
                data_size_bytes: input.len(),
            };
            return ValidationResult::invalid(errors, metadata);
        }

        // Parse JSON with detailed error handling
        let parsed_value = match serde_json::from_str::<Value>(input) {
            Ok(value) => value,
            Err(e) => {
                errors.push(ValidationError {
                    error_type: ValidationErrorType::InvalidJson,
                    message: format!("JSON parsing failed: {}", e),
                    context: context.to_string(),
                    field_path: None,
                    severity: ErrorSeverity::Critical,
                });

                let metadata = ValidationMetadata {
                    validation_time: system_time,
                    validator_version: env!("CARGO_PKG_VERSION").to_string(),
                    validation_rules_applied: rules_applied,
                    processing_time_ms: start_time.elapsed().as_millis() as u64,
                    data_size_bytes: input.len(),
                };

                return ValidationResult::invalid(errors, metadata);
            }
        };

        rules_applied.push("json_parsing".to_string());

        // Validate JSON structure recursively
        match self.validate_json_structure(&parsed_value, 0, context, "") {
            Ok(structure_warnings) => {
                warnings.extend(structure_warnings);
            }
            Err(structure_errors) => {
                errors.extend(structure_errors);
            }
        }
        rules_applied.push("structure_validation".to_string());

        // Validate required and allowed keys for objects
        if let Value::Object(obj) = &parsed_value {
            if let Err(key_errors) = self.validate_object_keys(obj, context, "") {
                errors.extend(key_errors);
            }
        }
        rules_applied.push("key_validation".to_string());

        // Apply type constraints
        if let Err(type_errors) = self.validate_type_constraints(&parsed_value, context, "") {
            errors.extend(type_errors);
        }
        rules_applied.push("type_constraints".to_string());

        // Run custom validators
        for validator in &self.custom_validators {
            if let Err(custom_errors) = validator.validate(&parsed_value, context) {
                errors.extend(custom_errors);
            }
            rules_applied.push(format!("custom_validator_{}", validator.name()));
        }

        // Early return if errors found
        if !errors.is_empty() {
            let metadata = ValidationMetadata {
                validation_time: system_time,
                validator_version: env!("CARGO_PKG_VERSION").to_string(),
                validation_rules_applied: rules_applied,
                processing_time_ms: start_time.elapsed().as_millis() as u64,
                data_size_bytes: input.len(),
            };
            return ValidationResult::invalid(errors, metadata);
        }

        // Sanitize and normalize the JSON
        let sanitized = match self.sanitize_json(&parsed_value) {
            Ok(sanitized_value) => serde_json::to_string(&sanitized_value).unwrap(),
            Err(sanitize_errors) => {
                errors.extend(sanitize_errors);
                let metadata = ValidationMetadata {
                    validation_time: system_time,
                    validator_version: env!("CARGO_PKG_VERSION").to_string(),
                    validation_rules_applied: rules_applied,
                    processing_time_ms: start_time.elapsed().as_millis() as u64,
                    data_size_bytes: input.len(),
                };
                return ValidationResult::invalid(errors, metadata);
            }
        };
        rules_applied.push("sanitization".to_string());

        let metadata = ValidationMetadata {
            validation_time: system_time,
            validator_version: env!("CARGO_PKG_VERSION").to_string(),
            validation_rules_applied: rules_applied,
            processing_time_ms: start_time.elapsed().as_millis() as u64,
            data_size_bytes: input.len(),
        };

        ValidationResult::valid(sanitized, metadata).with_warnings(warnings)
    }

    /// Check for suspicious patterns that might indicate injection attempts
    fn check_suspicious_patterns(&self, input: &str, context: &str) -> Option<Vec<ValidationError>> {
        let mut errors = Vec::new();

        for pattern in &self.suspicious_patterns {
            if pattern.is_match(input) {
                errors.push(ValidationError {
                    error_type: ValidationErrorType::SuspiciousContent,
                    message: format!(
                        "Input contains suspicious pattern matching: {}",
                        pattern.as_str()
                    ),
                    context: context.to_string(),
                    field_path: None,
                    severity: ErrorSeverity::High,
                });
            }
        }

        if errors.is_empty() {
            None
        } else {
            Some(errors)
        }
    }

    /// Validate JSON structure recursively with path tracking
    fn validate_json_structure(
        &self,
        value: &Value,
        depth: usize,
        context: &str,
        path: &str,
    ) -> Result<Vec<ValidationWarning>, Vec<ValidationError>> {
        if depth > self.max_depth {
            return Err(vec![ValidationError {
                error_type: ValidationErrorType::SizeLimit,
                message: format!("JSON exceeds maximum depth of {}", self.max_depth),
                context: context.to_string(),
                field_path: Some(path.to_string()),
                severity: ErrorSeverity::High,
            }]);
        }

        let mut warnings = Vec::new();

        match value {
            Value::Object(obj) => {
                if obj.len() > self.max_container_size {
                    return Err(vec![ValidationError {
                        error_type: ValidationErrorType::SizeLimit,
                        message: format!(
                            "Object exceeds maximum size of {} keys (got {} keys)",
                            self.max_container_size,
                            obj.len()
                        ),
                        context: context.to_string(),
                        field_path: Some(path.to_string()),
                        severity: ErrorSeverity::High,
                    }]);
                }

                for (key, val) in obj {
                    if key.len() > 1000 {
                        return Err(vec![ValidationError {
                            error_type: ValidationErrorType::SizeLimit,
                            message: "Object key exceeds maximum length of 1000 characters".to_string(),
                            context: context.to_string(),
                            field_path: Some(format!("{}.{}", path, key)),
                            severity: ErrorSeverity::Medium,
                        }]);
                    }

                    let child_path = if path.is_empty() {
                        key.clone()
                    } else {
                        format!("{}.{}", path, key)
                    };

                    match self.validate_json_structure(val, depth + 1, context, &child_path) {
                        Ok(mut child_warnings) => warnings.append(&mut child_warnings),
                        Err(errors) => return Err(errors),
                    }
                }
            }
            Value::Array(arr) => {
                if arr.len() > self.max_container_size {
                    return Err(vec![ValidationError {
                        error_type: ValidationErrorType::SizeLimit,
                        message: format!(
                            "Array exceeds maximum size of {} elements (got {} elements)",
                            self.max_container_size,
                            arr.len()
                        ),
                        context: context.to_string(),
                        field_path: Some(path.to_string()),
                        severity: ErrorSeverity::High,
                    }]);
                }

                for (index, val) in arr.iter().enumerate() {
                    let child_path = format!("{}[{}]", path, index);
                    match self.validate_json_structure(val, depth + 1, context, &child_path) {
                        Ok(mut child_warnings) => warnings.append(&mut child_warnings),
                        Err(errors) => return Err(errors),
                    }
                }
            }
            Value::String(s) => {
                if s.len() > self.max_string_length / 10 {
                    warnings.push(ValidationWarning {
                        warning_type: ValidationWarningType::LargeValue,
                        message: format!("Large string value detected ({} characters)", s.len()),
                        context: context.to_string(),
                        field_path: Some(path.to_string()),
                    });
                }

                // Check for control characters
                if s.chars().any(|c| c.is_control() && c != '\n' && c != '\r' && c != '\t') {
                    return Err(vec![ValidationError {
                        error_type: ValidationErrorType::SecurityViolation,
                        message: "String contains control characters".to_string(),
                        context: context.to_string(),
                        field_path: Some(path.to_string()),
                        severity: ErrorSeverity::Medium,
                    }]);
                }
            }
            Value::Number(n) => {
                if !n.is_finite() {
                    return Err(vec![ValidationError {
                        error_type: ValidationErrorType::InvalidFormat,
                        message: "Number is not finite (NaN or infinity)".to_string(),
                        context: context.to_string(),
                        field_path: Some(path.to_string()),
                        severity: ErrorSeverity::High,
                    }]);
                }

                if let Some(value) = n.as_f64() {
                    if value.abs() > self.max_numeric_value {
                        return Err(vec![ValidationError {
                            error_type: ValidationErrorType::SizeLimit,
                            message: format!(
                                "Number exceeds maximum allowed value of {} (got {})",
                                self.max_numeric_value, value
                            ),
                            context: context.to_string(),
                            field_path: Some(path.to_string()),
                            severity: ErrorSeverity::Medium,
                        }]);
                    }
                }
            }
            _ => {} // Bool and Null are always safe
        }

        Ok(warnings)
    }

    /// Validate object keys against allowed/required lists
    fn validate_object_keys(
        &self,
        obj: &serde_json::Map<String, Value>,
        context: &str,
        path: &str,
    ) -> Result<(), Vec<ValidationError>> {
        let mut errors = Vec::new();

        // Check required keys
        if let Some(required) = &self.required_keys {
            for required_key in required {
                if !obj.contains_key(required_key) {
                    errors.push(ValidationError {
                        error_type: ValidationErrorType::MissingRequired,
                        message: format!("Required key '{}' is missing", required_key),
                        context: context.to_string(),
                        field_path: Some(path.to_string()),
                        severity: ErrorSeverity::High,
                    });
                }
            }
        }

        // Check allowed keys
        if let Some(allowed) = &self.allowed_keys {
            for key in obj.keys() {
                if !allowed.contains(key) {
                    errors.push(ValidationError {
                        error_type: ValidationErrorType::DisallowedKey,
                        message: format!("Disallowed key '{}' found", key),
                        context: context.to_string(),
                        field_path: Some(format!("{}.{}", path, key)),
                        severity: ErrorSeverity::Medium,
                    });
                }
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }

    /// Validate type constraints for specific fields
    fn validate_type_constraints(
        &self,
        value: &Value,
        context: &str,
        path: &str,
    ) -> Result<(), Vec<ValidationError>> {
        let mut errors = Vec::new();

        if let Some(expected_type) = self.type_constraints.get(path) {
            let actual_type = match value {
                Value::String(_) => JsonType::String,
                Value::Number(_) => JsonType::Number,
                Value::Bool(_) => JsonType::Boolean,
                Value::Array(_) => JsonType::Array,
                Value::Object(_) => JsonType::Object,
                Value::Null => JsonType::Null,
            };

            if &actual_type != expected_type {
                errors.push(ValidationError {
                    error_type: ValidationErrorType::TypeMismatch,
                    message: format!(
                        "Expected type {:?} but found {:?}",
                        expected_type, actual_type
                    ),
                    context: context.to_string(),
                    field_path: Some(path.to_string()),
                    severity: ErrorSeverity::Medium,
                });
            }
        }

        // Recursively check nested objects
        match value {
            Value::Object(obj) => {
                for (key, val) in obj {
                    let child_path = if path.is_empty() {
                        key.clone()
                    } else {
                        format!("{}.{}", path, key)
                    };
                    
                    if let Err(mut child_errors) = self.validate_type_constraints(val, context, &child_path) {
                        errors.append(&mut child_errors);
                    }
                }
            }
            Value::Array(arr) => {
                for (index, val) in arr.iter().enumerate() {
                    let child_path = format!("{}[{}]", path, index);
                    if let Err(mut child_errors) = self.validate_type_constraints(val, context, &child_path) {
                        errors.append(&mut child_errors);
                    }
                }
            }
            _ => {}
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }

    /// Sanitize JSON by removing dangerous values and normalizing
    fn sanitize_json(&self, value: &Value) -> Result<Value, Vec<ValidationError>> {
        match value {
            Value::Object(obj) => {
                let mut sanitized_obj = serde_json::Map::new();
                for (key, val) in obj {
                    // Sanitize key
                    let sanitized_key = self.sanitize_string(key);
                    let sanitized_val = self.sanitize_json(val)?;
                    sanitized_obj.insert(sanitized_key, sanitized_val);
                }
                Ok(Value::Object(sanitized_obj))
            }
            Value::Array(arr) => {
                let mut sanitized_arr = Vec::new();
                for val in arr {
                    sanitized_arr.push(self.sanitize_json(val)?);
                }
                Ok(Value::Array(sanitized_arr))
            }
            Value::String(s) => Ok(Value::String(self.sanitize_string(s))),
            Value::Number(n) => {
                // Ensure finite numbers
                if let Some(value) = n.as_f64() {
                    if value.is_finite() {
                        Ok(Value::Number(n.clone()))
                    } else {
                        Ok(Value::Number(serde_json::Number::from(0)))
                    }
                } else {
                    Ok(Value::Number(n.clone()))
                }
            }
            _ => Ok(value.clone()),
        }
    }

    /// Sanitize string values with comprehensive cleaning
    fn sanitize_string(&self, s: &str) -> String {
        s.chars()
            .filter(|c| {
                // Allow printable ASCII, common unicode, and safe whitespace
                c.is_ascii_graphic() || 
                c.is_ascii_whitespace() || 
                (*c >= '\u{0080}' && *c <= '\u{FFEF}' && !c.is_control())
            })
            .take(self.max_string_length / 100) // Limit individual string length
            .collect::<String>()
            .trim()
            .to_string()
    }
}

/// Validate ML model configuration with enterprise requirements
pub fn validate_model_config(config_json: &str) -> ValidationResult {
    let mut allowed_keys = HashSet::new();
    allowed_keys.insert("model_type".to_string());
    allowed_keys.insert("algorithm".to_string());
    allowed_keys.insert("feature_config".to_string());
    allowed_keys.insert("training_config".to_string());
    allowed_keys.insert("hyperparameters".to_string());
    allowed_keys.insert("database_config".to_string());
    allowed_keys.insert("security_config".to_string());
    allowed_keys.insert("compliance_config".to_string());
    allowed_keys.insert("performance_config".to_string());

    let mut required_keys = HashSet::new();
    required_keys.insert("model_type".to_string());
    required_keys.insert("algorithm".to_string());

    let mut type_constraints = HashMap::new();
    type_constraints.insert("model_type".to_string(), JsonType::String);
    type_constraints.insert("algorithm".to_string(), JsonType::String);
    type_constraints.insert("hyperparameters".to_string(), JsonType::Object);

    let validator = SecureJsonValidator::new()
        .with_max_depth(8) // Allow reasonable nesting for complex configs
        .with_max_string_length(50_000) // Reasonable limit for config files
        .with_allowed_keys(allowed_keys)
        .with_required_keys(required_keys)
        .with_type_constraints(type_constraints);

    validator.validate(config_json, "model_config")
}

/// Validate ML training data with strict validation
pub fn validate_training_data(data_json: &str) -> ValidationResult {
    let mut allowed_keys = HashSet::new();
    allowed_keys.insert("features".to_string());
    allowed_keys.insert("labels".to_string());
    allowed_keys.insert("samples".to_string());
    allowed_keys.insert("epochs".to_string());
    allowed_keys.insert("batch_size".to_string());
    allowed_keys.insert("validation_split".to_string());
    allowed_keys.insert("test_split".to_string());
    allowed_keys.insert("data_source".to_string());
    allowed_keys.insert("preprocessing".to_string());

    let mut required_keys = HashSet::new();
    required_keys.insert("features".to_string());
    required_keys.insert("labels".to_string());

    let mut type_constraints = HashMap::new();
    type_constraints.insert("features".to_string(), JsonType::Array);
    type_constraints.insert("labels".to_string(), JsonType::Array);
    type_constraints.insert("epochs".to_string(), JsonType::Number);
    type_constraints.insert("batch_size".to_string(), JsonType::Number);

    let validator = SecureJsonValidator::new()
        .with_max_depth(5) // Training data should be relatively flat
        .with_max_string_length(500_000) // Allow larger datasets
        .with_allowed_keys(allowed_keys)
        .with_required_keys(required_keys)
        .with_type_constraints(type_constraints);

    validator.validate(data_json, "training_data")
}

/// Validate HuggingFace integration configuration
pub fn validate_huggingface_config(config_json: &str) -> ValidationResult {
    let mut allowed_keys = HashSet::new();
    allowed_keys.insert("model_name".to_string());
    allowed_keys.insert("task".to_string());
    allowed_keys.insert("tokenizer_config".to_string());
    allowed_keys.insert("inference_config".to_string());
    allowed_keys.insert("batch_size".to_string());
    allowed_keys.insert("max_length".to_string());
    allowed_keys.insert("device".to_string());
    allowed_keys.insert("precision".to_string());

    let mut required_keys = HashSet::new();
    required_keys.insert("model_name".to_string());
    required_keys.insert("task".to_string());

    let mut type_constraints = HashMap::new();
    type_constraints.insert("model_name".to_string(), JsonType::String);
    type_constraints.insert("task".to_string(), JsonType::String);
    type_constraints.insert("batch_size".to_string(), JsonType::Number);
    type_constraints.insert("max_length".to_string(), JsonType::Number);

    let validator = SecureJsonValidator::new()
        .with_max_depth(4)
        .with_allowed_keys(allowed_keys)
        .with_required_keys(required_keys)
        .with_type_constraints(type_constraints);

    validator.validate(config_json, "huggingface_config")
}

/// Enterprise ML validation with business rules
pub struct MLBusinessRulesValidator;

impl CustomValidator for MLBusinessRulesValidator {
    fn validate(&self, value: &Value, context: &str) -> Result<(), Vec<ValidationError>> {
        let mut errors = Vec::new();

        // Example business rules for ML operations
        if let Value::Object(obj) = value {
            // Check for reasonable batch sizes
            if let Some(Value::Number(batch_size)) = obj.get("batch_size") {
                if let Some(size) = batch_size.as_u64() {
                    if size > 10000 {
                        errors.push(ValidationError {
                            error_type: ValidationErrorType::BusinessRuleViolation,
                            message: "Batch size exceeds enterprise limit of 10,000".to_string(),
                            context: context.to_string(),
                            field_path: Some("batch_size".to_string()),
                            severity: ErrorSeverity::Medium,
                        });
                    }
                }
            }

            // Check for valid model types in enterprise context
            if let Some(Value::String(model_type)) = obj.get("model_type") {
                let valid_types = ["classification", "regression", "clustering", "anomaly_detection", "nlp", "computer_vision"];
                if !valid_types.contains(&model_type.as_str()) {
                    errors.push(ValidationError {
                        error_type: ValidationErrorType::BusinessRuleViolation,
                        message: format!("Unsupported model type '{}' for enterprise deployment", model_type),
                        context: context.to_string(),
                        field_path: Some("model_type".to_string()),
                        severity: ErrorSeverity::Medium,
                    });
                }
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }

    fn name(&self) -> &str {
        "ml_business_rules"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_validation() {
        let validator = SecureJsonValidator::new();
        let result = validator.validate(r#"{"key": "value"}"#, "test");
        assert!(result.is_valid);
        assert!(result.errors.is_empty());
    }

    #[test]
    fn test_suspicious_content_detection() {
        let validator = SecureJsonValidator::new();
        let result = validator.validate(r#"{"code": "javascript:alert('xss')"}"#, "test");
        assert!(!result.is_valid);
        assert!(result.errors.iter().any(|e| e.error_type == ValidationErrorType::SuspiciousContent));
    }

    #[test]
    fn test_size_limits() {
        let validator = SecureJsonValidator::new().with_max_string_length(10);
        let long_input = r#"{"data": "this is a very long string that exceeds limits"}"#;
        let result = validator.validate(long_input, "test");
        assert!(!result.is_valid);
    }

    #[test]
    fn test_required_keys() {
        let mut required = HashSet::new();
        required.insert("required_field".to_string());
        
        let validator = SecureJsonValidator::new().with_required_keys(required);
        let result = validator.validate(r#"{"optional_field": "value"}"#, "test");
        assert!(!result.is_valid);
        assert!(result.errors.iter().any(|e| e.error_type == ValidationErrorType::MissingRequired));
    }

    #[test]
    fn test_model_config_validation() {
        let valid_config = r#"{
            "model_type": "classification",
            "algorithm": "random_forest",
            "hyperparameters": {
                "n_estimators": 100,
                "max_depth": 10
            }
        }"#;
        
        let result = validate_model_config(valid_config);
        assert!(result.is_valid);
    }

    #[test]
    fn test_training_data_validation() {
        let valid_data = r#"{
            "features": [[1, 2, 3], [4, 5, 6]],
            "labels": [0, 1],
            "epochs": 10,
            "batch_size": 32
        }"#;
        
        let result = validate_training_data(valid_data);
        assert!(result.is_valid);
    }

    #[test]
    fn test_validation_metadata() {
        let validator = SecureJsonValidator::new();
        let result = validator.validate(r#"{"test": "data"}"#, "test");
        
        assert!(result.validation_metadata.processing_time_ms > 0);
        assert_eq!(result.validation_metadata.data_size_bytes, 16);
        assert!(!result.validation_metadata.validation_rules_applied.is_empty());
    }
}