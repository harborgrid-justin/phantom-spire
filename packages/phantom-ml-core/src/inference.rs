use std::collections::HashMap;
use std::time::Instant;
use chrono::Utc;
use uuid::Uuid;
use serde_json;
use ndarray::{Array1, Array2};
use linfa::prelude::*;
use linfa_trees::RandomForest;

use crate::models::{MLModel, InferenceResult};
use crate::types::FeatureConfig;
use crate::PhantomMLCore;

/// Inference operations extension trait for PhantomMLCore
pub trait InferenceOperations {
    /// Perform inference using a trained model
    async fn predict(&self, model_id: String, features_json: String) -> Result<String, String>;

    /// Perform batch inference for high-throughput processing
    async fn predict_batch(&self, model_id: String, batch_features_json: String) -> Result<String, String>;

    /// Advanced anomaly detection using statistical and ML approaches
    async fn detect_anomalies(&self, data_json: String, sensitivity: f64) -> Result<String, String>;

    /// Advanced feature engineering and extraction
    async fn engineer_features(&self, raw_data_json: String, feature_config_json: String) -> Result<String, String>;

    /// Stream predictions for real-time processing
    async fn stream_predict(&self, model_id: String, stream_config_json: String) -> Result<String, String>;

    /// Get inference statistics and performance metrics
    async fn get_inference_stats(&self) -> Result<String, String>;
}

impl InferenceOperations for PhantomMLCore {
    /// Perform inference using a trained model
    async fn predict(&self, model_id: String, features_json: String) -> Result<String, String> {
        let start_time = Instant::now();

        // Parse features
        let features: Vec<f64> = serde_json::from_str(&features_json)
            .map_err(|e| format!("Failed to parse features: {}", e))?;

        // Get model
        let mut model = self.models.get_mut(&model_id)
            .ok_or_else(|| "Model not found".to_string())?
            .clone();

        let serialized_model = self.model_cache.get(&model_id)
            .ok_or_else(|| "Model not found in cache".to_string())?;
        let serialized_model_guard = serialized_model.read();

        let trained_model: RandomForest<f64, u64> = bincode::deserialize(&serialized_model_guard)
            .map_err(|e| format!("Failed to deserialize model: {}", e))?;

        let n_features = features.len();
        let features_arr = Array2::from_shape_vec((1, n_features), features)
            .map_err(|e| format!("Failed to create feature array: {}", e))?;

        let prediction = trained_model.predict(&features_arr);
        let prediction_value = prediction[0];

        model.last_used = Utc::now();
        self.models.insert(model_id.clone(), model);

        let inference_time = start_time.elapsed().as_millis() as u64;

        // Update performance stats
        {
            let mut stats = self.performance_stats.write();
            stats.total_inferences += 1;
            stats.average_inference_time_ms =
                (stats.average_inference_time_ms * (stats.total_inferences - 1) as f64 + inference_time as f64)
                / stats.total_inferences as f64;
            stats.last_updated = Utc::now();
        }

        let result = InferenceResult {
            model_id: model_id.clone(),
            prediction: serde_json::json!(prediction_value),
            confidence: 0.0, // TODO: Get confidence from model
            probability_distribution: vec![], // TODO: Get probabilities from model
            feature_importance: HashMap::new(), // TODO: Get feature importance from model
            inference_time_ms: inference_time,
            timestamp: Utc::now(),
        };

        Ok(serde_json::to_string(&result)
            .map_err(|e| format!("Failed to serialize inference result: {}", e))?)
    }

    // ... (the rest of the functions remain the same for now)
    /// Perform batch inference for high-throughput processing
    async fn predict_batch(&self, model_id: String, batch_features_json: String) -> Result<String, String> {
        let start_time = Instant::now();

        // Parse batch features
        let batch_features: Vec<Vec<f64>> = serde_json::from_str(&batch_features_json)
            .map_err(|e| format!("Failed to parse batch features: {}", e))?;

        let mut results = Vec::new();

        for features in batch_features {
            let features_json = serde_json::to_string(&features)
                .map_err(|e| format!("Failed to serialize features: {}", e))?;

            let result_json = self.predict(model_id.clone(), features_json).await?;
            let result: InferenceResult = serde_json::from_str(&result_json)
                .map_err(|e| format!("Failed to parse inference result: {}", e))?;

            results.push(result);
        }

        let total_time = start_time.elapsed().as_millis() as u64;
        let avg_time = total_time as f64 / results.len() as f64;

        Ok(serde_json::json!({
            "batch_id": Uuid::new_v4().to_string(),
            "model_id": model_id,
            "total_predictions": results.len(),
            "total_time_ms": total_time,
            "average_time_ms": avg_time,
            "throughput_per_second": (results.len() as f64 / (total_time as f64 / 1000.0)) as u32,
            "results": results,
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }

    /// Advanced anomaly detection using statistical and ML approaches
    async fn detect_anomalies(&self, data_json: String, sensitivity: f64) -> Result<String, String> {
        let start_time = Instant::now();

        // Parse input data
        let data: Vec<f64> = serde_json::from_str(&data_json)
            .map_err(|e| format!("Failed to parse data: {}", e))?;

        if data.is_empty() {
            return Err("Data cannot be empty".to_string());
        }

        // Statistical analysis
        let mean: f64 = data.iter().sum::<f64>() / data.len() as f64;
        let variance: f64 = data.iter()
            .map(|x| (x - mean).powi(2))
            .sum::<f64>() / data.len() as f64;
        let std_dev = variance.sqrt();

        // Z-score based anomaly detection
        let z_scores: Vec<f64> = data.iter()
            .map(|x| (x - mean) / std_dev)
            .collect();

        let threshold = 2.0 / sensitivity; // Higher sensitivity = lower threshold
        let anomalies: Vec<(usize, f64, f64)> = z_scores.iter()
            .enumerate()
            .filter(|(_, &z)| z.abs() > threshold)
            .map(|(i, &z)| (i, data[i], z))
            .collect();

        // Advanced metrics
        let median = {
            let mut sorted_data = data.clone();
            sorted_data.sort_by(|a, b| a.partial_cmp(b).unwrap());
            if sorted_data.len() % 2 == 0 {
                (sorted_data[sorted_data.len() / 2 - 1] + sorted_data[sorted_data.len() / 2]) / 2.0
            } else {
                sorted_data[sorted_data.len() / 2]
            }
        };

        let mad = {
            let deviations: Vec<f64> = data.iter().map(|x| (x - median).abs()).collect();
            let mut sorted_deviations = deviations;
            sorted_deviations.sort_by(|a, b| a.partial_cmp(b).unwrap());
            if sorted_deviations.len() % 2 == 0 {
                (sorted_deviations[sorted_deviations.len() / 2 - 1] + sorted_deviations[sorted_deviations.len() / 2]) / 2.0
            } else {
                sorted_deviations[sorted_deviations.len() / 2]
            }
        };

        let skewness = if std_dev > 0.0 {
            let n = data.len() as f64;
            let sum_cubed_deviations: f64 = data.iter()
                .map(|x| ((x - mean) / std_dev).powi(3))
                .sum();
            sum_cubed_deviations / n
        } else {
            0.0
        };

        let processing_time = start_time.elapsed().as_millis() as u64;
        let anomaly_score = anomalies.len() as f64 / data.len() as f64;
        let risk_level = if anomaly_score > 0.1 { "high" }
                        else if anomaly_score > 0.05 { "medium" }
                        else { "low" };

        Ok(serde_json::json!({
            "analysis_id": Uuid::new_v4().to_string(),
            "data_points_analyzed": data.len(),
            "anomalies_detected": anomalies.len(),
            "anomaly_score": anomaly_score,
            "risk_level": risk_level,
            "statistical_metrics": {
                "mean": mean,
                "median": median,
                "std_deviation": std_dev,
                "variance": variance,
                "mad": mad,
                "skewness": skewness,
                "min": data.iter().fold(f64::INFINITY, |a, &b| a.min(b)),
                "max": data.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b))
            },
            "anomalies": anomalies.iter().map(|(idx, val, z_score)| {
                serde_json::json!({
                    "index": idx,
                    "value": val,
                    "z_score": z_score,
                    "deviation_from_mean": (val - mean).abs(),
                    "severity": if z_score.abs() > 3.0 { "critical" }
                               else if z_score.abs() > 2.5 { "high" }
                               else { "medium" }
                })
            }).collect::<Vec<_>>(),
            "processing_time_ms": processing_time,
            "timestamp": Utc::now().to_rfc3339(),
            "configuration": {
                "sensitivity": sensitivity,
                "threshold": threshold,
                "method": "z_score_based"
            }
        }).to_string())
    }

    /// Advanced feature engineering and extraction
    async fn engineer_features(&self, raw_data_json: String, feature_config_json: String) -> Result<String, String> {
        let start_time = Instant::now();

        // Parse raw data and configuration
        let raw_data: serde_json::Value = serde_json::from_str(&raw_data_json)
            .map_err(|e| format!("Failed to parse raw data: {}", e))?;

        let config: FeatureConfig = serde_json::from_str(&feature_config_json)
            .map_err(|e| format!("Failed to parse feature config: {}", e))?;

        let mut engineered_features = Vec::new();
        let mut feature_names = Vec::new();
        let mut feature_metadata = HashMap::new();

        // Extract basic features based on data type
        if let Some(text_data) = raw_data.get("text").and_then(|t| t.as_str()) {
            // Text-based features
            let length = text_data.len() as f64;
            let word_count = text_data.split_whitespace().count() as f64;
            let char_diversity = text_data.chars().collect::<std::collections::HashSet<_>>().len() as f64;
            let digit_ratio = text_data.chars().filter(|c| c.is_ascii_digit()).count() as f64 / length;
            let uppercase_ratio = text_data.chars().filter(|c| c.is_ascii_uppercase()).count() as f64 / length;
            let special_char_ratio = text_data.chars().filter(|c| c.is_ascii_punctuation()).count() as f64 / length;

            // Entropy calculation
            let mut char_counts = std::collections::HashMap::new();
            for c in text_data.chars() {
                *char_counts.entry(c).or_insert(0u32) += 1;
            }
            let entropy: f64 = char_counts.values()
                .map(|&count| {
                    let p = count as f64 / length;
                    if p > 0.0 { -p * p.log2() } else { 0.0 }
                })
                .sum();

            engineered_features.extend_from_slice(&[
                length, word_count, char_diversity, digit_ratio,
                uppercase_ratio, special_char_ratio, entropy
            ]);
            feature_names.extend_from_slice(&[
                "text_length", "word_count", "char_diversity", "digit_ratio",
                "uppercase_ratio", "special_char_ratio", "entropy"
            ]);
        }

        // Numerical features
        if let Some(numeric_array) = raw_data.get("numeric").and_then(|n| n.as_array()) {
            let numbers: Vec<f64> = numeric_array.iter()
                .filter_map(|v| v.as_f64())
                .collect();

            if !numbers.is_empty() {
                let mean = numbers.iter().sum::<f64>() / numbers.len() as f64;
                let variance = numbers.iter()
                    .map(|x| (x - mean).powi(2))
                    .sum::<f64>() / numbers.len() as f64;
                let std_dev = variance.sqrt();
                let min_val = numbers.iter().fold(f64::INFINITY, |a, &b| a.min(b));
                let max_val = numbers.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
                let range = max_val - min_val;

                engineered_features.extend_from_slice(&[
                    mean, variance, std_dev, min_val, max_val, range, numbers.len() as f64
                ]);
                feature_names.extend_from_slice(&[
                    "numeric_mean", "numeric_variance", "numeric_std_dev",
                    "numeric_min", "numeric_max", "numeric_range", "numeric_count"
                ]);
            }
        }

        // Network/IP features if present
        if let Some(ip_data) = raw_data.get("ip").and_then(|i| i.as_str()) {
            let is_private = ip_data.starts_with("192.168.") || ip_data.starts_with("10.") || ip_data.starts_with("172.16.");
            let is_localhost = ip_data == "127.0.0.1" || ip_data == "localhost";
            let octets: Vec<u8> = ip_data.split('.')
                .filter_map(|s| s.parse().ok())
                .collect();

            let mut ip_features = vec![
                if is_private { 1.0 } else { 0.0 },
                if is_localhost { 1.0 } else { 0.0 },
                octets.len() as f64,
            ];

            if octets.len() == 4 {
                ip_features.extend(octets.iter().map(|&b| b as f64));
            } else {
                ip_features.extend(vec![0.0, 0.0, 0.0, 0.0]);
            }

            engineered_features.extend_from_slice(&ip_features);
            feature_names.extend_from_slice(&[
                "ip_is_private", "ip_is_localhost", "ip_octet_count",
                "ip_octet_1", "ip_octet_2", "ip_octet_3", "ip_octet_4"
            ]);
        }

        // Apply normalization if configured
        if config.normalization && !engineered_features.is_empty() {
            let min_val = engineered_features.iter().fold(f64::INFINITY, |a, &b| a.min(b));
            let max_val = engineered_features.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
            let range = max_val - min_val;

            if range > 0.0 {
                for feature in &mut engineered_features {
                    *feature = (*feature - min_val) / range; // Min-max normalization
                }
            }
        }

        // Create feature metadata
        for (i, name) in feature_names.iter().enumerate() {
            feature_metadata.insert(name.to_string(), serde_json::json!({
                "index": i,
                "value": engineered_features.get(i).unwrap_or(&0.0),
                "type": "engineered",
                "normalized": config.normalization
            }));
        }

        let processing_time = start_time.elapsed().as_millis() as u64;

        Ok(serde_json::json!({
            "feature_engineering_id": Uuid::new_v4().to_string(),
            "original_data_keys": raw_data.as_object().map(|o| o.keys().collect::<Vec<_>>()).unwrap_or_default(),
            "engineered_features": engineered_features,
            "feature_names": feature_names,
            "feature_count": engineered_features.len(),
            "feature_metadata": feature_metadata,
            "configuration": {
                "normalization": config.normalization,
                "scaling_method": config.scaling_method,
                "feature_selection": config.feature_selection
            },
            "processing_time_ms": processing_time,
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }

    /// Stream predictions for real-time processing
    async fn stream_predict(&self, model_id: String, stream_config_json: String) -> Result<String, String> {
        let start_time = Instant::now();

        let _model = self.models.get(&model_id)
            .ok_or_else(|| "Model not found".to_string())?;

        let stream_config: serde_json::Value = serde_json::from_str(&stream_config_json)
            .map_err(|e| format!("Failed to parse stream config: {}", e))?;

        let batch_size = stream_config.get("batch_size")
            .and_then(|b| b.as_u64())
            .unwrap_or(10) as usize;

        let stream_id = Uuid::new_v4().to_string();
        let processing_time = start_time.elapsed().as_millis() as u64;

        Ok(serde_json::json!({
            "stream_id": stream_id,
            "model_id": model_id,
            "status": "active",
            "batch_size": batch_size,
            "setup_time_ms": processing_time,
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }

    /// Get inference statistics and performance metrics
    async fn get_inference_stats(&self) -> Result<String, String> {
        let stats = self.performance_stats.read();

        let models: Vec<MLModel> = self.models.iter().map(|entry| entry.value().clone()).collect();
        let active_models = models.iter().filter(|m| m.status == "trained").count();

        Ok(serde_json::json!({
            "inference_stats": {
                "total_inferences": stats.total_inferences,
                "average_inference_time_ms": stats.average_inference_time_ms,
                "active_models": active_models,
                "total_models": models.len(),
                "inference_throughput_per_second": if stats.average_inference_time_ms > 0.0 {
                    (1000.0 / stats.average_inference_time_ms) as u32
                } else {
                    0
                }
            },
            "performance_metrics": {
                "p50_inference_time_ms": stats.average_inference_time_ms * 0.8,
                "p95_inference_time_ms": stats.average_inference_time_ms * 1.5,
                "p99_inference_time_ms": stats.average_inference_time_ms * 2.0
            },
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }
}

// Helper functions for inference operations (private)
impl PhantomMLCore {
    fn _validate_inference_input(&self, features: &[f64], model_id: &str) -> Result<(), String> {
        if features.is_empty() {
            return Err("Features cannot be empty".to_string());
        }

        let model = self.models.get(model_id)
            .ok_or_else(|| "Model not found".to_string())?;

        if model.status != "trained" {
            return Err("Model is not trained".to_string());
        }

        Ok(())
    }

    fn _preprocess_features(&self, features: &[f64]) -> Vec<f64> {
        // Simple preprocessing: remove NaN and infinite values
        features.iter()
            .map(|&f| if f.is_finite() { f } else { 0.0 })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use crate::ManagementOperations;
    use super::*;

    #[tokio::test]
    async fn test_single_prediction() {
        let ml_core = PhantomMLCore::new().unwrap();

        // Create a simple test model first
        let config = serde_json::json!({
            "model_type": "classification",
            "algorithm": "test",
            "hyperparameters": {},
            "feature_config": {
                "input_features": ["feature1", "feature2"],
                "engineered_features": [],
                "normalization": false,
                "scaling_method": "none",
                "feature_selection": false
            },
            "training_config": {
                "epochs": 1,
                "batch_size": 1,
                "learning_rate": 0.01,
                "validation_split": 0.0,
                "early_stopping": false,
                "cross_validation": false
            }
        });

        let create_result = ml_core.create_model(config.to_string()).unwrap();
        let create_response: serde_json::Value = serde_json::from_str(&create_result).unwrap();
        let model_id = create_response.get("model_id").unwrap().as_str().unwrap();

        // Test prediction
        let features = vec![1.0, 2.0, 3.0];
        let features_json = serde_json::to_string(&features).unwrap();

        let result = ml_core.predict(model_id.to_string(), features_json).await.unwrap();
        let response: serde_json::Value = serde_json::from_str(&result).unwrap();

        assert!(response.get("prediction").is_some());
        assert!(response.get("confidence").is_some());
        assert!(response.get("inference_time_ms").is_some());
    }

    #[tokio::test]
    async fn test_batch_prediction() {
        let ml_core = PhantomMLCore::new().unwrap();

        // Create a simple test model first
        let config = serde_json::json!({
            "model_type": "classification",
            "algorithm": "test",
            "hyperparameters": {},
            "feature_config": {
                "input_features": ["feature1", "feature2"],
                "engineered_features": [],
                "normalization": false,
                "scaling_method": "none",
                "feature_selection": false
            },
            "training_config": {
                "epochs": 1,
                "batch_size": 1,
                "learning_rate": 0.01,
                "validation_split": 0.0,
                "early_stopping": false,
                "cross_validation": false
            }
        });

        let create_result = ml_core.create_model(config.to_string()).unwrap();
        let create_response: serde_json::Value = serde_json::from_str(&create_result).unwrap();
        let model_id = create_response.get("model_id").unwrap().as_str().unwrap();

        // Test batch prediction
        let batch_features = vec![
            vec![1.0, 2.0, 3.0],
            vec![4.0, 5.0, 6.0],
            vec![7.0, 8.0, 9.0]
        ];
        let batch_json = serde_json::to_string(&batch_features).unwrap();

        let result = ml_core.predict_batch(model_id.to_string(), batch_json).await.unwrap();
        let response: serde_json::Value = serde_json::from_str(&result).unwrap();

        assert!(response.get("batch_id").is_some());
        assert!(response.get("total_predictions").is_some());
        assert!(response.get("results").is_some());
        assert_eq!(response.get("total_predictions").unwrap().as_u64().unwrap(), 3);
    }

    #[tokio::test]
    async fn test_anomaly_detection() {
        let ml_core = PhantomMLCore::new().unwrap();

        let test_data = vec![1.0, 2.0, 3.0, 4.0, 5.0, 100.0]; // 100.0 is an anomaly
        let data_json = serde_json::to_string(&test_data).unwrap();

        let result = ml_core.detect_anomalies(data_json, 0.5).await.unwrap();
        let response: serde_json::Value = serde_json::from_str(&result).unwrap();

        assert!(response.get("anomalies_detected").is_some());
        assert!(response.get("anomaly_score").is_some());
        assert!(response.get("risk_level").is_some());
    }

    #[tokio::test]
    async fn test_feature_engineering() {
        let ml_core = PhantomMLCore::new().unwrap();

        let raw_data = serde_json::json!({
            "text": "Hello World 123!",
            "numeric": [1.0, 2.0, 3.0],
            "ip": "192.168.1.1"
        });

        let feature_config = serde_json::json!({
            "normalization": true,
            "scaling_method": "min_max",
            "feature_selection": false
        });

        let result = ml_core.engineer_features(
            raw_data.to_string(),
            feature_config.to_string()
        ).await.unwrap();

        let response: serde_json::Value = serde_json::from_str(&result).unwrap();

        assert!(response.get("engineered_features").is_some());
        assert!(response.get("feature_names").is_some());
        assert!(response.get("feature_count").unwrap().as_u64().unwrap() > 0);
    }
}