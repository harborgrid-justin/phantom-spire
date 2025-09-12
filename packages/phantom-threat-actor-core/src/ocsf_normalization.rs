use crate::ocsf::{BaseEvent, CategoryUid, ClassUid, SeverityId, StatusId, Observable, Enrichment, Metadata, Product, Extension};
use crate::ocsf_categories::*;
use crate::ocsf_event_classes::*;
use crate::ocsf_objects::*;
use crate::ocsf_observables::*;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use regex::Regex;

/// OCSF Event Normalization
/// Provides functionality for normalizing events to OCSF format and validation

/// Event Normalizer for converting various event formats to OCSF
#[derive(Debug, Clone)]
pub struct EventNormalizer {
    /// The normalization rules
    pub rules: Vec<NormalizationRule>,
    /// The schema validator
    pub validator: SchemaValidator,
    /// The field mappings
    pub field_mappings: HashMap<String, FieldMapping>,
}

/// Normalization Rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NormalizationRule {
    /// The rule name
    pub name: String,
    /// The source event type
    pub source_type: String,
    /// The target OCSF class
    pub target_class: ClassUid,
    /// The field transformations
    pub transformations: Vec<FieldTransformation>,
    /// The rule conditions
    pub conditions: Vec<NormalizationCondition>,
}

/// Field Transformation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldTransformation {
    /// The source field path
    pub source_path: String,
    /// The target field path
    pub target_path: String,
    /// The transformation type
    pub transformation_type: TransformationType,
    /// The transformation parameters
    pub parameters: Option<HashMap<String, Value>>,
}

/// Transformation Types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransformationType {
    /// Direct copy
    Copy,
    /// Map value using lookup table
    Map,
    /// Extract using regex
    RegexExtract,
    /// Convert data type
    TypeConvert,
    /// Concatenate multiple fields
    Concatenate,
    /// Apply custom function
    Custom,
}

/// Normalization Condition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NormalizationCondition {
    /// The field path to check
    pub field_path: String,
    /// The condition operator
    pub operator: ConditionOperator,
    /// The expected value
    pub value: Value,
}

/// Condition Operators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConditionOperator {
    /// Equal to
    Equals,
    /// Not equal to
    NotEquals,
    /// Contains
    Contains,
    /// Does not contain
    NotContains,
    /// Matches regex
    RegexMatch,
    /// Greater than
    GreaterThan,
    /// Less than
    LessThan,
}

/// Field Mapping
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldMapping {
    /// The source field
    pub source: String,
    /// The target field
    pub target: String,
    /// The data type
    pub data_type: String,
    /// Whether the field is required
    pub required: bool,
    /// Default value
    pub default_value: Option<Value>,
}

/// Schema Validator
#[derive(Debug, Clone)]
pub struct SchemaValidator {
    /// The OCSF schema version
    pub schema_version: String,
    /// The schema definitions
    pub schema_definitions: HashMap<String, Value>,
    /// Validation rules
    pub validation_rules: Vec<ValidationRule>,
}

/// Validation Rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationRule {
    /// The rule name
    pub name: String,
    /// The field path
    pub field_path: String,
    /// The validation type
    pub validation_type: ValidationType,
    /// The validation parameters
    pub parameters: Option<HashMap<String, Value>>,
}

/// Validation Types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ValidationType {
    /// Required field
    Required,
    /// Data type validation
    DataType,
    /// Value range validation
    ValueRange,
    /// Regex pattern validation
    RegexPattern,
    /// Custom validation
    Custom,
}

/// Normalized Event Result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NormalizedEvent {
    /// The normalized OCSF event
    pub event: Value,
    /// The normalization metadata
    pub metadata: NormalizationMetadata,
    /// Any normalization warnings
    pub warnings: Vec<String>,
    /// Any normalization errors
    pub errors: Vec<String>,
}

/// Normalization Metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NormalizationMetadata {
    /// The normalizer version
    pub normalizer_version: String,
    /// The normalization timestamp
    pub timestamp: DateTime<Utc>,
    /// The source event type
    pub source_type: String,
    /// The applied rules
    pub applied_rules: Vec<String>,
    /// The confidence score
    pub confidence: f64,
}

/// Event Serializer
#[derive(Debug, Clone)]
pub struct EventSerializer {
    /// Pretty print JSON
    pub pretty_print: bool,
    /// Include metadata
    pub include_metadata: bool,
    /// Compression enabled
    pub compression: bool,
}

/// Batch Normalizer for processing multiple events
#[derive(Debug, Clone)]
pub struct BatchNormalizer {
    /// The event normalizer
    pub normalizer: EventNormalizer,
    /// Batch size
    pub batch_size: usize,
    /// Processing statistics
    pub stats: ProcessingStats,
}

/// Processing Statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessingStats {
    /// Total events processed
    pub total_processed: u64,
    /// Successfully normalized events
    pub successful: u64,
    /// Failed normalizations
    pub failed: u64,
    /// Warnings generated
    pub warnings: u64,
    /// Processing start time
    pub start_time: DateTime<Utc>,
    /// Processing end time
    pub end_time: Option<DateTime<Utc>>,
}

impl EventNormalizer {
    /// Create a new event normalizer
    pub fn new() -> Self {
        Self {
            rules: Vec::new(),
            validator: SchemaValidator::new(),
            field_mappings: HashMap::new(),
        }
    }

    /// Add a normalization rule
    pub fn add_rule(&mut self, rule: NormalizationRule) {
        self.rules.push(rule);
    }

    /// Add a field mapping
    pub fn add_field_mapping(&mut self, mapping: FieldMapping) {
        self.field_mappings.insert(mapping.source.clone(), mapping);
    }

    /// Normalize an event
    pub fn normalize_event(&self, source_event: &Value) -> Result<NormalizedEvent, String> {
        let mut warnings = Vec::new();
        let mut errors = Vec::new();
        let mut applied_rules = Vec::new();

        // Determine the source event type
        let source_type = self.determine_source_type(source_event)?;

        // Find applicable rules
        let applicable_rules: Vec<&NormalizationRule> = self.rules.iter()
            .filter(|rule| rule.source_type == source_type)
            .collect();

        if applicable_rules.is_empty() {
            return Err(format!("No normalization rules found for source type: {}", source_type));
        }

        // Apply the first matching rule
        let rule = applicable_rules[0];
        applied_rules.push(rule.name.clone());

        // Check conditions
        if !self.check_conditions(rule, source_event)? {
            return Err("Event does not meet normalization conditions".to_string());
        }

        // Create base OCSF event
        let mut ocsf_event = self.create_base_event(rule.target_class.clone());

        // Apply transformations
        for transformation in &rule.transformations {
            match self.apply_transformation(&transformation, source_event, &mut ocsf_event) {
                Ok(_) => {},
                Err(e) => warnings.push(format!("Transformation failed: {}", e)),
            }
        }

        // Validate the normalized event
        match self.validator.validate_event(&ocsf_event) {
            Ok(_) => {},
            Err(validation_errors) => {
                errors.extend(validation_errors);
            }
        }

        let metadata = NormalizationMetadata {
            normalizer_version: "1.0.0".to_string(),
            timestamp: Utc::now(),
            source_type,
            applied_rules,
            confidence: 0.8,
        };

        Ok(NormalizedEvent {
            event: ocsf_event,
            metadata,
            warnings,
            errors,
        })
    }

    /// Determine the source event type
    fn determine_source_type(&self, event: &Value) -> Result<String, String> {
        // Try to determine event type based on common fields
        if let Some(obj) = event.as_object() {
            if obj.contains_key("event_type") {
                if let Some(event_type) = obj.get("event_type").and_then(|v| v.as_str()) {
                    return Ok(event_type.to_string());
                }
            }

            if obj.contains_key("EventID") {
                return Ok("windows_event".to_string());
            }

            if obj.contains_key("cefVersion") {
                return Ok("cef_event".to_string());
            }

            if obj.contains_key("timestamp") && obj.contains_key("message") {
                return Ok("syslog_event".to_string());
            }
        }

        Ok("generic".to_string())
    }

    /// Check normalization conditions
    fn check_conditions(&self, rule: &NormalizationRule, event: &Value) -> Result<bool, String> {
        for condition in &rule.conditions {
            let field_value = self.get_field_value(event, &condition.field_path)?;

            let matches = match condition.operator {
                ConditionOperator::Equals => field_value == condition.value,
                ConditionOperator::NotEquals => field_value != condition.value,
                ConditionOperator::Contains => {
                    if let (Some(str_val), Some(condition_str)) = (field_value.as_str(), condition.value.as_str()) {
                        str_val.contains(condition_str)
                    } else {
                        false
                    }
                },
                ConditionOperator::NotContains => {
                    if let (Some(str_val), Some(condition_str)) = (field_value.as_str(), condition.value.as_str()) {
                        !str_val.contains(condition_str)
                    } else {
                        false
                    }
                },
                ConditionOperator::RegexMatch => {
                    if let (Some(str_val), Some(pattern)) = (field_value.as_str(), condition.value.as_str()) {
                        Regex::new(pattern).unwrap().is_match(str_val)
                    } else {
                        false
                    }
                },
                ConditionOperator::GreaterThan => {
                    if let (Some(num_val), Some(condition_num)) = (field_value.as_f64(), condition.value.as_f64()) {
                        num_val > condition_num
                    } else {
                        false
                    }
                },
                ConditionOperator::LessThan => {
                    if let (Some(num_val), Some(condition_num)) = (field_value.as_f64(), condition.value.as_f64()) {
                        num_val < condition_num
                    } else {
                        false
                    }
                },
            };

            if !matches {
                return Ok(false);
            }
        }

        Ok(true)
    }

    /// Create base OCSF event
    fn create_base_event(&self, class_uid: ClassUid) -> Value {
        let base_event = BaseEvent::new(CategoryUid::Uncategorized, class_uid.clone(), SeverityId::Unknown);

        // Convert to JSON value
        match serde_json::to_value(base_event) {
            Ok(value) => value,
            Err(_) => json!({
                "class_uid": class_uid as i32,
                "category_uid": CategoryUid::Uncategorized as i32,
                "severity_id": SeverityId::Unknown as i32,
                "time": Utc::now().to_rfc3339()
            }),
        }
    }

    /// Apply field transformation
    fn apply_transformation(&self, transformation: &FieldTransformation, source_event: &Value, target_event: &mut Value) -> Result<(), String> {
        let source_value = self.get_field_value(source_event, &transformation.source_path)?;

        let transformed_value = match transformation.transformation_type {
            TransformationType::Copy => source_value.clone(),
            TransformationType::Map => {
                if let Some(params) = &transformation.parameters {
                    if let Some(mapping) = params.get("mapping").and_then(|v| v.as_object()) {
                        if let Some(key) = source_value.as_str() {
                            mapping.get(key).cloned().unwrap_or(source_value)
                        } else {
                            source_value
                        }
                    } else {
                        source_value
                    }
                } else {
                    source_value
                }
            },
            TransformationType::RegexExtract => {
                if let Some(params) = &transformation.parameters {
                    if let Some(pattern) = params.get("pattern").and_then(|v| v.as_str()) {
                        if let Some(text) = source_value.as_str() {
                            let regex = Regex::new(pattern).map_err(|e| e.to_string())?;
                            if let Some(captures) = regex.captures(text) {
                                if let Some(capture) = captures.get(1) {
                                    json!(capture.as_str())
                                } else {
                                    source_value
                                }
                            } else {
                                source_value
                            }
                        } else {
                            source_value
                        }
                    } else {
                        source_value
                    }
                } else {
                    source_value
                }
            },
            TransformationType::TypeConvert => {
                // Simple type conversion (string to number, etc.)
                if let Some(target_type) = transformation.parameters.as_ref().and_then(|p| p.get("target_type").and_then(|v| v.as_str())) {
                    match target_type {
                        "integer" => {
                            if let Some(str_val) = source_value.as_str() {
                                if let Ok(int_val) = str_val.parse::<i64>() {
                                    json!(int_val)
                                } else {
                                    source_value
                                }
                            } else {
                                source_value
                            }
                        },
                        "float" => {
                            if let Some(str_val) = source_value.as_str() {
                                if let Ok(float_val) = str_val.parse::<f64>() {
                                    json!(float_val)
                                } else {
                                    source_value
                                }
                            } else {
                                source_value
                            }
                        },
                        _ => source_value,
                    }
                } else {
                    source_value
                }
            },
            TransformationType::Concatenate => {
                if let Some(params) = &transformation.parameters {
                    if let Some(fields) = params.get("fields").and_then(|v| v.as_array()) {
                        let mut concatenated = String::new();
                        for field_path in fields {
                            if let Some(field_str) = field_path.as_str() {
                                if let Ok(field_value) = self.get_field_value(source_event, field_str) {
                                    if let Some(str_val) = field_value.as_str() {
                                        concatenated.push_str(str_val);
                                        concatenated.push(' ');
                                    }
                                }
                            }
                        }
                        json!(concatenated.trim())
                    } else {
                        source_value
                    }
                } else {
                    source_value
                }
            },
            TransformationType::Custom => {
                // Custom transformation would require a function registry
                source_value
            },
        };

        self.set_field_value(target_event, &transformation.target_path, transformed_value);
        Ok(())
    }

    /// Get field value from JSON using dot notation
    fn get_field_value(&self, event: &Value, path: &str) -> Result<Value, String> {
        let parts: Vec<&str> = path.split('.').collect();
        let mut current = event;

        for part in parts {
            match current {
                Value::Object(obj) => {
                    if let Some(value) = obj.get(part) {
                        current = value;
                    } else {
                        return Err(format!("Field '{}' not found", part));
                    }
                },
                _ => return Err(format!("Cannot access field '{}' on non-object", part)),
            }
        }

        Ok(current.clone())
    }

    /// Set field value in JSON using dot notation
    fn set_field_value(&self, event: &mut Value, path: &str, value: Value) {
        let parts: Vec<&str> = path.split('.').collect();

        if parts.is_empty() {
            return;
        }

        // Navigate to the parent object where we need to set the value
        let mut current_obj = match event {
            Value::Object(ref mut obj) => obj,
            _ => return, // Cannot set field on non-object
        };

        for (i, part) in parts.iter().enumerate() {
            if i == parts.len() - 1 {
                // Last part - set the value
                current_obj.insert(part.to_string(), value);
            } else {
                // Intermediate part - ensure object exists and navigate deeper
                if !current_obj.contains_key(*part) {
                    current_obj.insert(part.to_string(), json!({}));
                }

                // Get the next object to navigate to
                match current_obj.get_mut(*part) {
                    Some(Value::Object(ref mut next_obj)) => {
                        current_obj = next_obj;
                    },
                    _ => {
                        // If we can't navigate further, create a new object
                        current_obj.insert(part.to_string(), json!({}));
                        if let Some(Value::Object(ref mut next_obj)) = current_obj.get_mut(*part) {
                            current_obj = next_obj;
                        } else {
                            return; // Should not happen
                        }
                    }
                }
            }
        }
    }
}

impl SchemaValidator {
    /// Create a new schema validator
    pub fn new() -> Self {
        Self {
            schema_version: "1.6.0".to_string(),
            schema_definitions: HashMap::new(),
            validation_rules: Vec::new(),
        }
    }

    /// Add a validation rule
    pub fn add_rule(&mut self, rule: ValidationRule) {
        self.validation_rules.push(rule);
    }

    /// Validate an OCSF event
    pub fn validate_event(&self, event: &Value) -> Result<(), Vec<String>> {
        let mut errors = Vec::new();

        for rule in &self.validation_rules {
            match self.check_validation_rule(rule, event) {
                Ok(_) => {},
                Err(error) => errors.push(error),
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }

    /// Check a single validation rule
    fn check_validation_rule(&self, rule: &ValidationRule, event: &Value) -> Result<(), String> {
        let field_value = self.get_field_value(event, &rule.field_path)?;

        match rule.validation_type {
            ValidationType::Required => {
                if field_value.is_null() {
                    return Err(format!("Required field '{}' is missing", rule.field_path));
                }
            },
            ValidationType::DataType => {
                if let Some(expected_type) = rule.parameters.as_ref().and_then(|p| p.get("type").and_then(|v| v.as_str())) {
                    let actual_type_matches = match expected_type {
                        "string" => field_value.is_string(),
                        "number" => field_value.is_number(),
                        "boolean" => field_value.is_boolean(),
                        "object" => field_value.is_object(),
                        "array" => field_value.is_array(),
                        _ => false,
                    };

                    if !actual_type_matches {
                        return Err(format!("Field '{}' has wrong type, expected {}", rule.field_path, expected_type));
                    }
                }
            },
            ValidationType::ValueRange => {
                if let (Some(min), Some(max)) = (
                    rule.parameters.as_ref().and_then(|p| p.get("min").and_then(|v| v.as_f64())),
                    rule.parameters.as_ref().and_then(|p| p.get("max").and_then(|v| v.as_f64())),
                ) {
                    if let Some(num_val) = field_value.as_f64() {
                        if num_val < min || num_val > max {
                            return Err(format!("Field '{}' value {} is out of range [{}, {}]", rule.field_path, num_val, min, max));
                        }
                    }
                }
            },
            ValidationType::RegexPattern => {
                if let Some(pattern) = rule.parameters.as_ref().and_then(|p| p.get("pattern").and_then(|v| v.as_str())) {
                    if let Some(str_val) = field_value.as_str() {
                        let regex = Regex::new(pattern).map_err(|e| e.to_string())?;
                        if !regex.is_match(str_val) {
                            return Err(format!("Field '{}' value '{}' does not match pattern '{}'", rule.field_path, str_val, pattern));
                        }
                    }
                }
            },
            ValidationType::Custom => {
                // Custom validation would require a function registry
            },
        }

        Ok(())
    }

    /// Get field value from JSON using dot notation
    fn get_field_value(&self, event: &Value, path: &str) -> Result<Value, String> {
        let parts: Vec<&str> = path.split('.').collect();
        let mut current = event;

        for part in parts {
            match current {
                Value::Object(obj) => {
                    if let Some(value) = obj.get(part) {
                        current = value;
                    } else {
                        return Ok(Value::Null); // Return null for missing fields
                    }
                },
                _ => return Err(format!("Cannot access field '{}' on non-object", part)),
            }
        }

        Ok(current.clone())
    }
}

impl EventSerializer {
    /// Create a new event serializer
    pub fn new() -> Self {
        Self {
            pretty_print: true,
            include_metadata: true,
            compression: false,
        }
    }

    /// Serialize a normalized event
    pub fn serialize(&self, normalized_event: &NormalizedEvent) -> Result<String, String> {
        let mut output = json!({
            "event": normalized_event.event
        });

        if self.include_metadata {
            if let Value::Object(ref mut obj) = output {
                obj.insert("metadata".to_string(), serde_json::to_value(&normalized_event.metadata).unwrap());
                obj.insert("warnings".to_string(), json!(normalized_event.warnings));
                obj.insert("errors".to_string(), json!(normalized_event.errors));
            }
        }

        if self.pretty_print {
            serde_json::to_string_pretty(&output).map_err(|e| e.to_string())
        } else {
            serde_json::to_string(&output).map_err(|e| e.to_string())
        }
    }

    /// Deserialize a normalized event
    pub fn deserialize(&self, json_str: &str) -> Result<NormalizedEvent, String> {
        let value: Value = serde_json::from_str(json_str).map_err(|e| e.to_string())?;

        let event = value.get("event").ok_or("Missing 'event' field")?.clone();
        let metadata = if let Some(meta) = value.get("metadata") {
            serde_json::from_value(meta.clone()).map_err(|e| e.to_string())?
        } else {
            NormalizationMetadata {
                normalizer_version: "unknown".to_string(),
                timestamp: Utc::now(),
                source_type: "unknown".to_string(),
                applied_rules: vec![],
                confidence: 0.0,
            }
        };

        let warnings = value.get("warnings")
            .and_then(|v| v.as_array())
            .unwrap_or(&vec![])
            .iter()
            .filter_map(|v| v.as_str().map(|s| s.to_string()))
            .collect();

        let errors = value.get("errors")
            .and_then(|v| v.as_array())
            .unwrap_or(&vec![])
            .iter()
            .filter_map(|v| v.as_str().map(|s| s.to_string()))
            .collect();

        Ok(NormalizedEvent {
            event,
            metadata,
            warnings,
            errors,
        })
    }
}

impl BatchNormalizer {
    /// Create a new batch normalizer
    pub fn new(normalizer: EventNormalizer, batch_size: usize) -> Self {
        Self {
            normalizer,
            batch_size,
            stats: ProcessingStats {
                total_processed: 0,
                successful: 0,
                failed: 0,
                warnings: 0,
                start_time: Utc::now(),
                end_time: None,
            },
        }
    }

    /// Process a batch of events
    pub fn process_batch(&mut self, events: &[Value]) -> Vec<NormalizedEvent> {
        let mut results = Vec::new();

        for event in events {
            self.stats.total_processed += 1;

            match self.normalizer.normalize_event(event) {
                Ok(normalized) => {
                    self.stats.successful += 1;
                    if !normalized.warnings.is_empty() {
                        self.stats.warnings += normalized.warnings.len() as u64;
                    }
                    results.push(normalized);
                },
                Err(_) => {
                    self.stats.failed += 1;
                },
            }
        }

        results
    }

    /// Get processing statistics
    pub fn get_stats(&self) -> &ProcessingStats {
        &self.stats
    }

    /// Finish processing
    pub fn finish(&mut self) {
        self.stats.end_time = Some(Utc::now());
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_event_normalizer_creation() {
        let normalizer = EventNormalizer::new();
        assert!(normalizer.rules.is_empty());
        assert_eq!(normalizer.validator.schema_version, "1.6.0");
    }

    #[test]
    fn test_source_type_detection() {
        let normalizer = EventNormalizer::new();

        let windows_event = json!({
            "EventID": 4625,
            "TimeCreated": "2023-01-01T00:00:00Z"
        });

        let source_type = normalizer.determine_source_type(&windows_event).unwrap();
        assert_eq!(source_type, "windows_event");

        let cef_event = json!({
            "cefVersion": "0.1",
            "deviceVendor": "Test"
        });

        let source_type = normalizer.determine_source_type(&cef_event).unwrap();
        assert_eq!(source_type, "cef_event");
    }

    #[test]
    fn test_field_value_extraction() {
        let normalizer = EventNormalizer::new();

        let event = json!({
            "user": {
                "name": "alice",
                "id": 123
            },
            "action": "login"
        });

        let user_name = normalizer.get_field_value(&event, "user.name").unwrap();
        assert_eq!(user_name, json!("alice"));

        let action = normalizer.get_field_value(&event, "action").unwrap();
        assert_eq!(action, json!("login"));
    }

    #[test]
    fn test_schema_validator() {
        let mut validator = SchemaValidator::new();

        let rule = ValidationRule {
            name: "required_class_uid".to_string(),
            field_path: "class_uid".to_string(),
            validation_type: ValidationType::Required,
            parameters: None,
        };

        validator.add_rule(rule);

        let valid_event = json!({
            "class_uid": 1001,
            "category_uid": 2,
            "time": "2023-01-01T00:00:00Z"
        });

        assert!(validator.validate_event(&valid_event).is_ok());

        let invalid_event = json!({
            "category_uid": 2,
            "time": "2023-01-01T00:00:00Z"
        });

        assert!(validator.validate_event(&invalid_event).is_err());
    }

    #[test]
    fn test_event_serializer() {
        let serializer = EventSerializer::new();

        let normalized_event = NormalizedEvent {
            event: json!({
                "class_uid": 1001,
                "message": "Test event"
            }),
            metadata: NormalizationMetadata {
                normalizer_version: "1.0.0".to_string(),
                timestamp: Utc::now(),
                source_type: "test".to_string(),
                applied_rules: vec!["test_rule".to_string()],
                confidence: 0.9,
            },
            warnings: vec!["Test warning".to_string()],
            errors: vec![],
        };

        let serialized = serializer.serialize(&normalized_event).unwrap();
        let deserialized = serializer.deserialize(&serialized).unwrap();

        assert_eq!(deserialized.event["class_uid"], json!(1001));
        assert_eq!(deserialized.metadata.source_type, "test");
        assert_eq!(deserialized.warnings.len(), 1);
    }

    #[test]
    fn test_batch_normalizer() {
        let normalizer = EventNormalizer::new();
        let mut batch_normalizer = BatchNormalizer::new(normalizer, 10);

        let events = vec![
            json!({"event_type": "test1", "message": "Event 1"}),
            json!({"event_type": "test2", "message": "Event 2"}),
        ];

        let results = batch_normalizer.process_batch(&events);
        let stats = batch_normalizer.get_stats();

        assert_eq!(stats.total_processed, 2);
        // Note: Results will be empty because no rules are defined
        assert_eq!(results.len(), 0);
    }

    #[test]
    fn test_normalization_rule() {
        let rule = NormalizationRule {
            name: "test_rule".to_string(),
            source_type: "test_event".to_string(),
            target_class: ClassUid::SecurityFinding,
            transformations: vec![
                FieldTransformation {
                    source_path: "message".to_string(),
                    target_path: "message".to_string(),
                    transformation_type: TransformationType::Copy,
                    parameters: None,
                },
            ],
            conditions: vec![
                NormalizationCondition {
                    field_path: "event_type".to_string(),
                    operator: ConditionOperator::Equals,
                    value: json!("test_event"),
                },
            ],
        };

        assert_eq!(rule.name, "test_rule");
        assert_eq!(rule.source_type, "test_event");
        assert_eq!(rule.transformations.len(), 1);
        assert_eq!(rule.conditions.len(), 1);
    }
}