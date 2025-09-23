//! Data Processor Plugin Example
//!
//! Demonstrates a data processing plugin that can transform, filter,
//! and analyze structured data with machine learning capabilities.

use super::*;
use serde_json::Value as JsonValue;
use std::collections::HashMap;

/// Data processor plugin for structured data transformation and analysis
pub struct DataProcessorPlugin {
    pub base: BasePlugin,
    transformations: HashMap<String, Box<dyn DataTransformation>>,
    filters: HashMap<String, Box<dyn DataFilter>>,
    analyzers: HashMap<String, Box<dyn DataAnalyzer>>,
}

impl DataProcessorPlugin {
    pub fn new(metadata: PluginMetadata) -> Self {
        let mut plugin = Self {
            base: BasePlugin::new(metadata),
            transformations: HashMap::new(),
            filters: HashMap::new(),
            analyzers: HashMap::new(),
        };

        // Register built-in transformations
        plugin.register_transformation("normalize", Box::new(NormalizeTransformation));
        plugin.register_transformation("aggregate", Box::new(AggregateTransformation));
        plugin.register_transformation("pivot", Box::new(PivotTransformation));

        // Register built-in filters
        plugin.register_filter("range", Box::new(RangeFilter));
        plugin.register_filter("regex", Box::new(RegexFilter));
        plugin.register_filter("null_filter", Box::new(NullFilter));

        // Register built-in analyzers
        plugin.register_analyzer("statistics", Box::new(StatisticsAnalyzer));
        plugin.register_analyzer("correlation", Box::new(CorrelationAnalyzer));
        plugin.register_analyzer("outlier_detection", Box::new(OutlierAnalyzer));

        plugin
    }

    pub fn register_transformation(&mut self, name: &str, transformation: Box<dyn DataTransformation>) {
        self.transformations.insert(name.to_string(), transformation);
    }

    pub fn register_filter(&mut self, name: &str, filter: Box<dyn DataFilter>) {
        self.filters.insert(name.to_string(), filter);
    }

    pub fn register_analyzer(&mut self, name: &str, analyzer: Box<dyn DataAnalyzer>) {
        self.analyzers.insert(name.to_string(), analyzer);
    }

    /// Process data through a pipeline of operations
    async fn process_pipeline(&self, data: JsonValue, pipeline: Vec<PipelineStep>) -> PluginResult<ProcessingResult> {
        let start_time = std::time::Instant::now();
        let mut current_data = data;
        let mut step_results = Vec::new();

        for (step_index, step) in pipeline.iter().enumerate() {
            let step_start = std::time::Instant::now();

            let step_result = match &step.operation_type {
                OperationType::Transform => {
                    if let Some(transformation) = self.transformations.get(&step.operation_name) {
                        transformation.transform(current_data, &step.parameters).await?
                    } else {
                        return Err(PluginError::ExecutionFailed {
                            error: format!("Unknown transformation: {}", step.operation_name),
                        });
                    }
                }
                OperationType::Filter => {
                    if let Some(filter) = self.filters.get(&step.operation_name) {
                        filter.filter(current_data, &step.parameters).await?
                    } else {
                        return Err(PluginError::ExecutionFailed {
                            error: format!("Unknown filter: {}", step.operation_name),
                        });
                    }
                }
                OperationType::Analyze => {
                    if let Some(analyzer) = self.analyzers.get(&step.operation_name) {
                        let analysis = analyzer.analyze(&current_data, &step.parameters).await?;
                        // For analysis, we return both the original data and the analysis results
                        serde_json::json!({
                            "data": current_data,
                            "analysis": analysis
                        })
                    } else {
                        return Err(PluginError::ExecutionFailed {
                            error: format!("Unknown analyzer: {}", step.operation_name),
                        });
                    }
                }
            };

            let step_duration = step_start.elapsed();
            current_data = step_result;

            step_results.push(StepResult {
                step_index,
                operation_type: step.operation_type.clone(),
                operation_name: step.operation_name.clone(),
                duration_ms: step_duration.as_millis() as u64,
                success: true,
                error: None,
            });
        }

        let total_duration = start_time.elapsed();

        Ok(ProcessingResult {
            processed_data: current_data,
            step_results,
            total_duration_ms: total_duration.as_millis() as u64,
            metadata: HashMap::new(),
        })
    }

    /// Validate data against a schema
    async fn validate_data(&self, data: &JsonValue, schema: &JsonValue) -> PluginResult<ValidationResult> {
        // Simple schema validation - in practice, you'd use a proper JSON schema validator
        let mut errors = Vec::new();
        let mut warnings = Vec::new();

        if let Some(required_fields) = schema.get("required") {
            if let Some(required_array) = required_fields.as_array() {
                for field in required_array {
                    if let Some(field_name) = field.as_str() {
                        if !data.get(field_name).is_some() {
                            errors.push(format!("Required field '{}' is missing", field_name));
                        }
                    }
                }
            }
        }

        if let Some(properties) = schema.get("properties") {
            if let Some(properties_obj) = properties.as_object() {
                if let Some(data_obj) = data.as_object() {
                    for (field_name, field_schema) in properties_obj {
                        if let Some(field_value) = data_obj.get(field_name) {
                            if let Some(expected_type) = field_schema.get("type") {
                                if let Some(type_str) = expected_type.as_str() {
                                    let actual_type = match field_value {
                                        JsonValue::String(_) => "string",
                                        JsonValue::Number(_) => "number",
                                        JsonValue::Bool(_) => "boolean",
                                        JsonValue::Array(_) => "array",
                                        JsonValue::Object(_) => "object",
                                        JsonValue::Null => "null",
                                    };

                                    if actual_type != type_str {
                                        errors.push(format!(
                                            "Field '{}' expected type '{}', got '{}'",
                                            field_name, type_str, actual_type
                                        ));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        Ok(ValidationResult {
            valid: errors.is_empty(),
            errors,
            warnings,
        })
    }

    /// Get data statistics
    async fn get_data_statistics(&self, data: &JsonValue) -> PluginResult<DataStatistics> {
        let mut stats = DataStatistics {
            total_records: 0,
            field_statistics: HashMap::new(),
            data_types: HashMap::new(),
            null_counts: HashMap::new(),
            unique_counts: HashMap::new(),
        };

        match data {
            JsonValue::Array(array) => {
                stats.total_records = array.len() as u64;

                // Analyze each record
                for record in array {
                    if let JsonValue::Object(obj) = record {
                        for (field_name, field_value) in obj {
                            // Track data types
                            let data_type = match field_value {
                                JsonValue::String(_) => "string",
                                JsonValue::Number(_) => "number",
                                JsonValue::Bool(_) => "boolean",
                                JsonValue::Array(_) => "array",
                                JsonValue::Object(_) => "object",
                                JsonValue::Null => "null",
                            };
                            *stats.data_types.entry(field_name.clone()).or_insert_with(HashMap::new)
                                .entry(data_type.to_string()).or_insert(0) += 1;

                            // Track null counts
                            if field_value.is_null() {
                                *stats.null_counts.entry(field_name.clone()).or_insert(0) += 1;
                            }

                            // Calculate field statistics for numeric fields
                            if let JsonValue::Number(num) = field_value {
                                if let Some(value) = num.as_f64() {
                                    let field_stats = stats.field_statistics
                                        .entry(field_name.clone())
                                        .or_insert(FieldStatistics {
                                            min: value,
                                            max: value,
                                            sum: 0.0,
                                            count: 0,
                                            mean: 0.0,
                                            variance: 0.0,
                                            std_dev: 0.0,
                                        });

                                    field_stats.min = field_stats.min.min(value);
                                    field_stats.max = field_stats.max.max(value);
                                    field_stats.sum += value;
                                    field_stats.count += 1;
                                }
                            }
                        }
                    }
                }

                // Calculate means and standard deviations
                for field_stats in stats.field_statistics.values_mut() {
                    if field_stats.count > 0 {
                        field_stats.mean = field_stats.sum / field_stats.count as f64;
                    }

                    // Second pass for variance (simplified)
                    // In practice, you'd do this more efficiently
                    field_stats.variance = 0.0; // Placeholder
                    field_stats.std_dev = field_stats.variance.sqrt();
                }
            }
            JsonValue::Object(_) => {
                stats.total_records = 1;
                // Analyze single object
            }
            _ => {
                return Err(PluginError::ExecutionFailed {
                    error: "Data must be an array or object for statistics calculation".to_string(),
                });
            }
        }

        Ok(stats)
    }
}

impl_plugin_base!(DataProcessorPlugin);

#[async_trait]
impl Plugin for DataProcessorPlugin {
    async fn execute(&self, input: PluginExecutionInput) -> PluginResult<PluginExecutionResult> {
        let start_time = std::time::Instant::now();

        let result = match input.operation.as_str() {
            "process_pipeline" => {
                let data = input.data.get("data")
                    .ok_or_else(|| PluginError::ConfigurationInvalid {
                        field: "data is required".to_string(),
                    })?
                    .clone();

                let pipeline_data = input.data.get("pipeline")
                    .ok_or_else(|| PluginError::ConfigurationInvalid {
                        field: "pipeline is required".to_string(),
                    })?;

                let pipeline: Vec<PipelineStep> = serde_json::from_value(pipeline_data.clone())?;
                let processing_result = self.process_pipeline(data, pipeline).await?;
                serde_json::to_value(processing_result)?
            }
            "validate_data" => {
                let data = input.data.get("data")
                    .ok_or_else(|| PluginError::ConfigurationInvalid {
                        field: "data is required".to_string(),
                    })?;

                let schema = input.data.get("schema")
                    .ok_or_else(|| PluginError::ConfigurationInvalid {
                        field: "schema is required".to_string(),
                    })?;

                let validation_result = self.validate_data(data, schema).await?;
                serde_json::to_value(validation_result)?
            }
            "get_statistics" => {
                let data = input.data.get("data")
                    .ok_or_else(|| PluginError::ConfigurationInvalid {
                        field: "data is required".to_string(),
                    })?;

                let statistics = self.get_data_statistics(data).await?;
                serde_json::to_value(statistics)?
            }
            "list_operations" => {
                serde_json::json!({
                    "transformations": self.transformations.keys().collect::<Vec<_>>(),
                    "filters": self.filters.keys().collect::<Vec<_>>(),
                    "analyzers": self.analyzers.keys().collect::<Vec<_>>()
                })
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
            memory_used_bytes: 10 * 1024 * 1024, // 10MB estimate
            cpu_time_ms: execution_time / 2,
            created_files: Vec::new(),
            network_requests: 0,
            metadata: HashMap::new(),
        })
    }

    fn capabilities(&self) -> Vec<PluginCapability> {
        vec![
            PluginCapability::DataProcessing {
                input_formats: vec!["json".to_string(), "csv".to_string()],
                output_formats: vec!["json".to_string(), "csv".to_string()],
            },
            PluginCapability::MachineLearning {
                model_types: vec!["statistical".to_string(), "clustering".to_string()],
                training_supported: false,
                inference_supported: true,
            },
            PluginCapability::Custom {
                name: "data_pipeline".to_string(),
                description: "Advanced data processing pipeline with transformations and analytics".to_string(),
                properties: {
                    let mut props = HashMap::new();
                    props.insert("supports_streaming".to_string(), serde_json::json!(false));
                    props.insert("supports_batch".to_string(), serde_json::json!(true));
                    props.insert("max_records".to_string(), serde_json::json!(1000000));
                    props
                },
            },
        ]
    }
}

// Data processing traits and implementations

#[async_trait]
pub trait DataTransformation: Send + Sync {
    async fn transform(&self, data: JsonValue, parameters: &HashMap<String, JsonValue>) -> PluginResult<JsonValue>;
    fn name(&self) -> &str;
    fn description(&self) -> &str;
}

#[async_trait]
pub trait DataFilter: Send + Sync {
    async fn filter(&self, data: JsonValue, parameters: &HashMap<String, JsonValue>) -> PluginResult<JsonValue>;
    fn name(&self) -> &str;
    fn description(&self) -> &str;
}

#[async_trait]
pub trait DataAnalyzer: Send + Sync {
    async fn analyze(&self, data: &JsonValue, parameters: &HashMap<String, JsonValue>) -> PluginResult<JsonValue>;
    fn name(&self) -> &str;
    fn description(&self) -> &str;
}

// Built-in transformations

pub struct NormalizeTransformation;

#[async_trait]
impl DataTransformation for NormalizeTransformation {
    async fn transform(&self, data: JsonValue, parameters: &HashMap<String, JsonValue>) -> PluginResult<JsonValue> {
        let field = parameters.get("field")
            .and_then(|v| v.as_str())
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "field parameter is required".to_string(),
            })?;

        // Simple normalization - in practice, you'd implement proper statistical normalization
        if let JsonValue::Array(ref array) = data {
            let mut normalized = array.clone();

            // Find min and max values
            let mut min_val = f64::INFINITY;
            let mut max_val = f64::NEG_INFINITY;

            for item in array {
                if let Some(obj) = item.as_object() {
                    if let Some(value) = obj.get(field).and_then(|v| v.as_f64()) {
                        min_val = min_val.min(value);
                        max_val = max_val.max(value);
                    }
                }
            }

            // Normalize values
            let range = max_val - min_val;
            if range > 0.0 {
                for item in normalized.iter_mut() {
                    if let Some(obj) = item.as_object_mut() {
                        if let Some(value) = obj.get(field).and_then(|v| v.as_f64()) {
                            let normalized_value = (value - min_val) / range;
                            obj.insert(field.to_string(), JsonValue::Number(
                                serde_json::Number::from_f64(normalized_value).unwrap()
                            ));
                        }
                    }
                }
            }

            Ok(JsonValue::Array(normalized))
        } else {
            Err(PluginError::ExecutionFailed {
                error: "Data must be an array for normalization".to_string(),
            })
        }
    }

    fn name(&self) -> &str { "normalize" }
    fn description(&self) -> &str { "Normalize numeric field values to 0-1 range" }
}

pub struct AggregateTransformation;

#[async_trait]
impl DataTransformation for AggregateTransformation {
    async fn transform(&self, data: JsonValue, parameters: &HashMap<String, JsonValue>) -> PluginResult<JsonValue> {
        let group_by = parameters.get("group_by")
            .and_then(|v| v.as_str())
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "group_by parameter is required".to_string(),
            })?;

        let agg_field = parameters.get("aggregate_field")
            .and_then(|v| v.as_str())
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "aggregate_field parameter is required".to_string(),
            })?;

        let agg_func = parameters.get("function")
            .and_then(|v| v.as_str())
            .unwrap_or("sum");

        if let JsonValue::Array(ref array) = data {
            let mut groups: HashMap<String, Vec<f64>> = HashMap::new();

            for item in array {
                if let Some(obj) = item.as_object() {
                    if let (Some(group_val), Some(agg_val)) = (
                        obj.get(group_by).and_then(|v| v.as_str()),
                        obj.get(agg_field).and_then(|v| v.as_f64()),
                    ) {
                        groups.entry(group_val.to_string()).or_insert_with(Vec::new).push(agg_val);
                    }
                }
            }

            let mut result = Vec::new();
            for (group_val, values) in groups {
                let aggregated = match agg_func {
                    "sum" => values.iter().sum(),
                    "mean" | "avg" => values.iter().sum::<f64>() / values.len() as f64,
                    "min" => values.iter().fold(f64::INFINITY, |a, &b| a.min(b)),
                    "max" => values.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b)),
                    "count" => values.len() as f64,
                    _ => values.iter().sum(), // Default to sum
                };

                result.push(serde_json::json!({
                    group_by: group_val,
                    agg_field: aggregated,
                    "count": values.len()
                }));
            }

            Ok(JsonValue::Array(result))
        } else {
            Err(PluginError::ExecutionFailed {
                error: "Data must be an array for aggregation".to_string(),
            })
        }
    }

    fn name(&self) -> &str { "aggregate" }
    fn description(&self) -> &str { "Aggregate data by grouping and applying functions" }
}

pub struct PivotTransformation;

#[async_trait]
impl DataTransformation for PivotTransformation {
    async fn transform(&self, data: JsonValue, _parameters: &HashMap<String, JsonValue>) -> PluginResult<JsonValue> {
        // Simplified pivot implementation
        // In practice, this would be more sophisticated
        Ok(data)
    }

    fn name(&self) -> &str { "pivot" }
    fn description(&self) -> &str { "Pivot data from rows to columns" }
}

// Built-in filters

pub struct RangeFilter;

#[async_trait]
impl DataFilter for RangeFilter {
    async fn filter(&self, data: JsonValue, parameters: &HashMap<String, JsonValue>) -> PluginResult<JsonValue> {
        let field = parameters.get("field")
            .and_then(|v| v.as_str())
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "field parameter is required".to_string(),
            })?;

        let min_val = parameters.get("min").and_then(|v| v.as_f64());
        let max_val = parameters.get("max").and_then(|v| v.as_f64());

        if let JsonValue::Array(ref array) = data {
            let filtered: Vec<JsonValue> = array
                .iter()
                .filter(|item| {
                    if let Some(obj) = item.as_object() {
                        if let Some(value) = obj.get(field).and_then(|v| v.as_f64()) {
                            let min_ok = min_val.map_or(true, |min| value >= min);
                            let max_ok = max_val.map_or(true, |max| value <= max);
                            return min_ok && max_ok;
                        }
                    }
                    false
                })
                .cloned()
                .collect();

            Ok(JsonValue::Array(filtered))
        } else {
            Err(PluginError::ExecutionFailed {
                error: "Data must be an array for range filtering".to_string(),
            })
        }
    }

    fn name(&self) -> &str { "range" }
    fn description(&self) -> &str { "Filter data by numeric range" }
}

pub struct RegexFilter;

#[async_trait]
impl DataFilter for RegexFilter {
    async fn filter(&self, data: JsonValue, parameters: &HashMap<String, JsonValue>) -> PluginResult<JsonValue> {
        let field = parameters.get("field")
            .and_then(|v| v.as_str())
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "field parameter is required".to_string(),
            })?;

        let pattern = parameters.get("pattern")
            .and_then(|v| v.as_str())
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "pattern parameter is required".to_string(),
            })?;

        let regex = regex::Regex::new(pattern)
            .map_err(|e| PluginError::ConfigurationInvalid {
                field: format!("Invalid regex pattern: {}", e),
            })?;

        if let JsonValue::Array(ref array) = data {
            let filtered: Vec<JsonValue> = array
                .iter()
                .filter(|item| {
                    if let Some(obj) = item.as_object() {
                        if let Some(value) = obj.get(field).and_then(|v| v.as_str()) {
                            return regex.is_match(value);
                        }
                    }
                    false
                })
                .cloned()
                .collect();

            Ok(JsonValue::Array(filtered))
        } else {
            Err(PluginError::ExecutionFailed {
                error: "Data must be an array for regex filtering".to_string(),
            })
        }
    }

    fn name(&self) -> &str { "regex" }
    fn description(&self) -> &str { "Filter data using regular expressions" }
}

pub struct NullFilter;

#[async_trait]
impl DataFilter for NullFilter {
    async fn filter(&self, data: JsonValue, parameters: &HashMap<String, JsonValue>) -> PluginResult<JsonValue> {
        let field = parameters.get("field").and_then(|v| v.as_str());
        let remove_nulls = parameters.get("remove_nulls")
            .and_then(|v| v.as_bool())
            .unwrap_or(true);

        if let JsonValue::Array(ref array) = data {
            let filtered: Vec<JsonValue> = array
                .iter()
                .filter(|item| {
                    if let Some(field_name) = field {
                        if let Some(obj) = item.as_object() {
                            let has_null = obj.get(field_name).map_or(true, |v| v.is_null());
                            return remove_nulls != has_null; // XOR logic
                        }
                    } else {
                        // Filter items that are null themselves
                        return remove_nulls != item.is_null();
                    }
                    true
                })
                .cloned()
                .collect();

            Ok(JsonValue::Array(filtered))
        } else {
            Err(PluginError::ExecutionFailed {
                error: "Data must be an array for null filtering".to_string(),
            })
        }
    }

    fn name(&self) -> &str { "null_filter" }
    fn description(&self) -> &str { "Filter out null values" }
}

// Built-in analyzers

pub struct StatisticsAnalyzer;

#[async_trait]
impl DataAnalyzer for StatisticsAnalyzer {
    async fn analyze(&self, data: &JsonValue, parameters: &HashMap<String, JsonValue>) -> PluginResult<JsonValue> {
        let field = parameters.get("field").and_then(|v| v.as_str());

        if let JsonValue::Array(ref array) = data {
            if let Some(field_name) = field {
                // Analyze specific field
                let values: Vec<f64> = array
                    .iter()
                    .filter_map(|item| {
                        item.as_object()
                            .and_then(|obj| obj.get(field_name))
                            .and_then(|v| v.as_f64())
                    })
                    .collect();

                if values.is_empty() {
                    return Ok(serde_json::json!({
                        "error": "No numeric values found for field"
                    }));
                }

                let count = values.len();
                let sum = values.iter().sum::<f64>();
                let mean = sum / count as f64;
                let min = values.iter().fold(f64::INFINITY, |a, &b| a.min(b));
                let max = values.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));

                let variance = values.iter()
                    .map(|&x| (x - mean).powi(2))
                    .sum::<f64>() / count as f64;
                let std_dev = variance.sqrt();

                Ok(serde_json::json!({
                    "field": field_name,
                    "count": count,
                    "sum": sum,
                    "mean": mean,
                    "min": min,
                    "max": max,
                    "variance": variance,
                    "std_dev": std_dev
                }))
            } else {
                // General statistics
                Ok(serde_json::json!({
                    "total_records": array.len(),
                    "record_types": "array"
                }))
            }
        } else {
            Ok(serde_json::json!({
                "error": "Data must be an array for statistics analysis"
            }))
        }
    }

    fn name(&self) -> &str { "statistics" }
    fn description(&self) -> &str { "Calculate statistical measures for numeric data" }
}

pub struct CorrelationAnalyzer;

#[async_trait]
impl DataAnalyzer for CorrelationAnalyzer {
    async fn analyze(&self, data: &JsonValue, parameters: &HashMap<String, JsonValue>) -> PluginResult<JsonValue> {
        let field1 = parameters.get("field1")
            .and_then(|v| v.as_str())
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "field1 parameter is required".to_string(),
            })?;

        let field2 = parameters.get("field2")
            .and_then(|v| v.as_str())
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "field2 parameter is required".to_string(),
            })?;

        if let JsonValue::Array(ref array) = data {
            let pairs: Vec<(f64, f64)> = array
                .iter()
                .filter_map(|item| {
                    if let Some(obj) = item.as_object() {
                        let val1 = obj.get(field1).and_then(|v| v.as_f64());
                        let val2 = obj.get(field2).and_then(|v| v.as_f64());
                        if let (Some(v1), Some(v2)) = (val1, val2) {
                            return Some((v1, v2));
                        }
                    }
                    None
                })
                .collect();

            if pairs.len() < 2 {
                return Ok(serde_json::json!({
                    "error": "Need at least 2 data points for correlation"
                }));
            }

            let n = pairs.len() as f64;
            let sum_x = pairs.iter().map(|(x, _)| x).sum::<f64>();
            let sum_y = pairs.iter().map(|(_, y)| y).sum::<f64>();
            let sum_xy = pairs.iter().map(|(x, y)| x * y).sum::<f64>();
            let sum_x2 = pairs.iter().map(|(x, _)| x * x).sum::<f64>();
            let sum_y2 = pairs.iter().map(|(_, y)| y * y).sum::<f64>();

            let correlation = (n * sum_xy - sum_x * sum_y) /
                ((n * sum_x2 - sum_x * sum_x).sqrt() * (n * sum_y2 - sum_y * sum_y).sqrt());

            Ok(serde_json::json!({
                "field1": field1,
                "field2": field2,
                "correlation": correlation,
                "data_points": n,
                "strength": if correlation.abs() > 0.7 { "strong" } else if correlation.abs() > 0.3 { "moderate" } else { "weak" }
            }))
        } else {
            Ok(serde_json::json!({
                "error": "Data must be an array for correlation analysis"
            }))
        }
    }

    fn name(&self) -> &str { "correlation" }
    fn description(&self) -> &str { "Calculate correlation between two numeric fields" }
}

pub struct OutlierAnalyzer;

#[async_trait]
impl DataAnalyzer for OutlierAnalyzer {
    async fn analyze(&self, data: &JsonValue, parameters: &HashMap<String, JsonValue>) -> PluginResult<JsonValue> {
        let field = parameters.get("field")
            .and_then(|v| v.as_str())
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "field parameter is required".to_string(),
            })?;

        let threshold = parameters.get("threshold")
            .and_then(|v| v.as_f64())
            .unwrap_or(2.0); // Default to 2 standard deviations

        if let JsonValue::Array(ref array) = data {
            let values: Vec<(usize, f64)> = array
                .iter()
                .enumerate()
                .filter_map(|(i, item)| {
                    item.as_object()
                        .and_then(|obj| obj.get(field))
                        .and_then(|v| v.as_f64())
                        .map(|val| (i, val))
                })
                .collect();

            if values.len() < 3 {
                return Ok(serde_json::json!({
                    "error": "Need at least 3 data points for outlier detection"
                }));
            }

            let count = values.len() as f64;
            let mean = values.iter().map(|(_, v)| v).sum::<f64>() / count;
            let variance = values.iter()
                .map(|(_, v)| (v - mean).powi(2))
                .sum::<f64>() / count;
            let std_dev = variance.sqrt();

            let outliers: Vec<serde_json::Value> = values
                .iter()
                .filter_map(|(index, value)| {
                    let z_score = (value - mean) / std_dev;
                    if z_score.abs() > threshold {
                        Some(serde_json::json!({
                            "index": index,
                            "value": value,
                            "z_score": z_score,
                            "deviation": z_score.abs()
                        }))
                    } else {
                        None
                    }
                })
                .collect();

            Ok(serde_json::json!({
                "field": field,
                "threshold": threshold,
                "mean": mean,
                "std_dev": std_dev,
                "total_values": count,
                "outlier_count": outliers.len(),
                "outliers": outliers
            }))
        } else {
            Ok(serde_json::json!({
                "error": "Data must be an array for outlier analysis"
            }))
        }
    }

    fn name(&self) -> &str { "outlier_detection" }
    fn description(&self) -> &str { "Detect outliers using statistical methods" }
}

// Data structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PipelineStep {
    pub operation_type: OperationType,
    pub operation_name: String,
    pub parameters: HashMap<String, JsonValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OperationType {
    Transform,
    Filter,
    Analyze,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessingResult {
    pub processed_data: JsonValue,
    pub step_results: Vec<StepResult>,
    pub total_duration_ms: u64,
    pub metadata: HashMap<String, JsonValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepResult {
    pub step_index: usize,
    pub operation_type: OperationType,
    pub operation_name: String,
    pub duration_ms: u64,
    pub success: bool,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataStatistics {
    pub total_records: u64,
    pub field_statistics: HashMap<String, FieldStatistics>,
    pub data_types: HashMap<String, HashMap<String, u64>>,
    pub null_counts: HashMap<String, u64>,
    pub unique_counts: HashMap<String, u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldStatistics {
    pub min: f64,
    pub max: f64,
    pub sum: f64,
    pub count: u64,
    pub mean: f64,
    pub variance: f64,
    pub std_dev: f64,
}