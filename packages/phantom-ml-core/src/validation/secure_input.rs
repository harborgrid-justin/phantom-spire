//! Secure input validation for NAPI-RS
//! Prevents injection attacks and malformed data

use serde_json::Value;
use std::collections::HashSet;

/// Maximum allowed JSON depth to prevent stack overflow
const MAX_JSON_DEPTH: usize = 32;

/// Maximum allowed string length to prevent DoS
const MAX_STRING_LENGTH: usize = 1_000_000; // 1MB

/// Maximum allowed array/object size
const MAX_CONTAINER_SIZE: usize = 10_000;

/// Comprehensive input validation result
#[derive(Debug)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
    pub sanitized_input: Option<String>,
}

impl ValidationResult {
    pub fn valid(sanitized: String) -> Self {
        Self {
            is_valid: true,
            errors: Vec::new(),
            warnings: Vec::new(),
            sanitized_input: Some(sanitized),
        }
    }

    pub fn invalid(errors: Vec<String>) -> Self {
        Self {
            is_valid: false,
            errors,
            warnings: Vec::new(),
            sanitized_input: None,
        }
    }

    pub fn with_warnings(mut self, warnings: Vec<String>) -> Self {
        self.warnings = warnings;
        self
    }
}

/// Secure JSON validator with comprehensive checks
pub struct SecureJsonValidator {
    max_depth: usize,
    max_string_length: usize,
    max_container_size: usize,
    allowed_keys: Option<HashSet<String>>,
    required_keys: Option<HashSet<String>>,
}

impl Default for SecureJsonValidator {
    fn default() -> Self {
        Self::new()
    }
}

impl SecureJsonValidator {
    pub fn new() -> Self {
        Self {
            max_depth: MAX_JSON_DEPTH,
            max_string_length: MAX_STRING_LENGTH,
            max_container_size: MAX_CONTAINER_SIZE,
            allowed_keys: None,
            required_keys: None,
        }
    }

    pub fn with_max_depth(mut self, depth: usize) -> Self {
        self.max_depth = depth;
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

    /// Comprehensive validation of JSON input
    pub fn validate(&self, input: &str, context: &str) -> ValidationResult {
        let mut errors = Vec::new();
        let mut warnings = Vec::new();

        // Basic sanity checks
        if input.is_empty() {
            errors.push(format!("Input for {} cannot be empty", context));
            return ValidationResult::invalid(errors);
        }

        if input.len() > self.max_string_length {
            errors.push(format!(
                "Input for {} exceeds maximum length of {} bytes",
                context, self.max_string_length
            ));
            return ValidationResult::invalid(errors);
        }

        // Check for suspicious patterns
        if self.contains_suspicious_patterns(input) {
            errors.push(format!("Input for {} contains suspicious patterns", context));
            return ValidationResult::invalid(errors);
        }

        // Parse JSON with detailed error handling
        let parsed_value = match serde_json::from_str::<Value>(input) {
            Ok(value) => value,
            Err(e) => {
                errors.push(format!("Invalid JSON for {}: {}", context, e));
                return ValidationResult::invalid(errors);
            }
        };

        // Validate JSON structure
        match self.validate_json_structure(&parsed_value, 0, context) {
            Ok(validation_warnings) => {
                warnings.extend(validation_warnings);
            }
            Err(validation_errors) => {
                errors.extend(validation_errors);
                return ValidationResult::invalid(errors);
            }
        }

        // Validate required and allowed keys for objects
        if let Value::Object(obj) = &parsed_value {
            if let Err(key_errors) = self.validate_object_keys(obj, context) {
                errors.extend(key_errors);
                return ValidationResult::invalid(errors);
            }
        }

        // Sanitize and normalize the JSON
        let sanitized = match self.sanitize_json(&parsed_value) {
            Ok(sanitized_value) => serde_json::to_string(&sanitized_value).unwrap(),
            Err(sanitize_errors) => {
                errors.extend(sanitize_errors);
                return ValidationResult::invalid(errors);
            }
        };

        ValidationResult::valid(sanitized).with_warnings(warnings)
    }

    /// Check for suspicious patterns that might indicate injection attempts
    fn contains_suspicious_patterns(&self, input: &str) -> bool {
        let suspicious_patterns = [
            "javascript:",
            "data:",
            "vbscript:",
            "<script",
            "</script>",
            "eval(",
            "Function(",
            "setTimeout(",
            "setInterval(",
            "__proto__",
            "constructor",
            "prototype",
        ];

        let input_lower = input.to_lowercase();
        suspicious_patterns.iter().any(|pattern| input_lower.contains(pattern))
    }

    /// Validate JSON structure recursively
    fn validate_json_structure(
        &self,
        value: &Value,
        depth: usize,
        context: &str,
    ) -> Result<Vec<String>, Vec<String>> {
        if depth > self.max_depth {
            return Err(vec![format!(
                "JSON for {} exceeds maximum depth of {}",
                context, self.max_depth
            )]);
        }

        let mut warnings = Vec::new();

        match value {
            Value::Object(obj) => {
                if obj.len() > self.max_container_size {
                    return Err(vec![format!(
                        "Object in {} exceeds maximum size of {} keys",
                        context, self.max_container_size
                    )]);
                }

                for (key, val) in obj {
                    if key.len() > 1000 {
                        return Err(vec![format!(
                            "Object key in {} exceeds maximum length",
                            context
                        )]);
                    }

                    match self.validate_json_structure(val, depth + 1, context) {
                        Ok(mut child_warnings) => warnings.append(&mut child_warnings),
                        Err(errors) => return Err(errors),
                    }
                }
            }
            Value::Array(arr) => {
                if arr.len() > self.max_container_size {
                    return Err(vec![format!(
                        "Array in {} exceeds maximum size of {} elements",
                        context, self.max_container_size
                    )]);
                }

                for val in arr {
                    match self.validate_json_structure(val, depth + 1, context) {
                        Ok(mut child_warnings) => warnings.append(&mut child_warnings),
                        Err(errors) => return Err(errors),
                    }
                }
            }
            Value::String(s) => {
                if s.len() > self.max_string_length / 10 {
                    // String values should be much smaller than total input
                    warnings.push(format!(
                        "Large string value detected in {} ({} chars)",
                        context,
                        s.len()
                    ));
                }

                if self.contains_suspicious_patterns(s) {
                    return Err(vec![format!(
                        "String value in {} contains suspicious content",
                        context
                    )]);
                }
            }
            Value::Number(n) => {
                if !n.is_finite() {
                    return Err(vec![format!(
                        "Invalid number in {}: not finite",
                        context
                    )]);
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
    ) -> Result<(), Vec<String>> {
        let mut errors = Vec::new();

        // Check required keys
        if let Some(required) = &self.required_keys {
            for required_key in required {
                if !obj.contains_key(required_key) {
                    errors.push(format!(
                        "Required key '{}' missing in {}",
                        required_key, context
                    ));
                }
            }
        }

        // Check allowed keys
        if let Some(allowed) = &self.allowed_keys {
            for key in obj.keys() {
                if !allowed.contains(key) {
                    errors.push(format!(
                        "Disallowed key '{}' found in {}",
                        key, context
                    ));
                }
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }

    /// Sanitize JSON by removing dangerous values and normalizing
    fn sanitize_json(&self, value: &Value) -> Result<Value, Vec<String>> {
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
                if n.is_finite() {
                    Ok(value.clone())
                } else {
                    Ok(Value::Number(serde_json::Number::from(0)))
                }
            }
            _ => Ok(value.clone()),
        }
    }

    /// Sanitize string values
    fn sanitize_string(&self, s: &str) -> String {
        s.chars()
            .filter(|c| c.is_ascii_graphic() || c.is_whitespace())
            .take(self.max_string_length / 100) // Limit individual string length
            .collect()
    }
}

/// Validate model configuration specifically
pub fn validate_model_config(config_json: &str) -> ValidationResult {
    let mut allowed_keys = HashSet::new();
    allowed_keys.insert("model_type".to_string());
    allowed_keys.insert("algorithm".to_string());
    allowed_keys.insert("feature_config".to_string());
    allowed_keys.insert("training_config".to_string());
    allowed_keys.insert("hyperparameters".to_string());
    allowed_keys.insert("database_config".to_string());

    let mut required_keys = HashSet::new();
    required_keys.insert("model_type".to_string());
    required_keys.insert("algorithm".to_string());

    let validator = SecureJsonValidator::new()
        .with_max_depth(5) // Model configs shouldn't be deeply nested
        .with_allowed_keys(allowed_keys)
        .with_required_keys(required_keys);

    validator.validate(config_json, "model_config")
}

/// Validate training data specifically
pub fn validate_training_data(data_json: &str) -> ValidationResult {
    let mut allowed_keys = HashSet::new();
    allowed_keys.insert("features".to_string());
    allowed_keys.insert("labels".to_string());
    allowed_keys.insert("samples".to_string());
    allowed_keys.insert("epochs".to_string());
    allowed_keys.insert("batch_size".to_string());
    allowed_keys.insert("validation_split".to_string());

    let mut required_keys = HashSet::new();
    required_keys.insert("features".to_string());
    required_keys.insert("labels".to_string());

    let validator = SecureJsonValidator::new()
        .with_max_depth(3) // Training data should be relatively flat
        .with_allowed_keys(allowed_keys)
        .with_required_keys(required_keys);

    validator.validate(data_json, "training_data")
}